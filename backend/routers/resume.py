import uuid
import logging
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
import jwt

from database import get_db
from config import settings
from services.ai import ai_service
import models
import schemas

logger = logging.getLogger("neurocv.resume")
router = APIRouter()

# Helper dependency to authenticate JWT token on endpoint handlers
def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)) -> models.User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Valid authorization token required."
        )
    
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload.")
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token is expired or corrupted.")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authenticated user no longer exists.")
    
    return user


@router.post("/upload", response_model=schemas.ResumeResponse, status_code=status.HTTP_201_CREATED)
def upload_resume(
    resume_in: schemas.ResumeUploadRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Saves a resume's metadata and parsed text inside the PostgreSQL database.
    """
    new_resume = models.Resume(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        file_name=resume_in.file_name,
        file_type=resume_in.file_type,
        uploaded_at=datetime.utcnow(),
        parsed_text=resume_in.parsed_text
    )
    
    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)
    return new_resume


@router.post("/analyze", response_model=schemas.AnalysisResponse)
def analyze_resume(
    analysis_in: schemas.AnalyzeRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Executes a RAG-based career intelligence comparison on the candidate resume against a Job Description.
    Saves results inside the SQL Database for historical dashboard reporting.
    """
    resume_text = analysis_in.manual_text or ""
    resume_file_name = "Manual_Pasted_Resume.txt"

    if analysis_in.resume_id:
        resume_record = db.query(models.Resume).filter(
            models.Resume.id == analysis_in.resume_id,
            models.Resume.user_id == current_user.id
        ).first()
        
        if not resume_record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Specified resume could not be retrieved.")
        
        resume_text = resume_record.parsed_text or ""
        resume_file_name = resume_record.file_name

    if not resume_text and not analysis_in.pdf_base64:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Please provide a valid resume source (file upload or direct pasted text)."
        )

    # If pdf_base64 is provided (e.g., from frontend file uploads), we would typically use an OCR or PDF parser, 
    # or rely on AIService to extract values.
    # To represent realistic RAG, we will leverage the AIService RAG pipeline to query OpenAI.
    try:
        logger.info(f"Triggering semantic comparison for User {current_user.id} against job posting...")
        
        # Call LangChain and OpenAI service for complete semantic scoring and feedback
        ai_result = ai_service.query_rag_resume_alignment(
            resume_text=resume_text or f"Base64 PDF Stream: {resume_file_name}",
            job_description=analysis_in.job_description
        )

        # Save analysis report in database
        analysis_id = str(uuid.uuid4())
        new_analysis = models.Analysis(
            id=analysis_id,
            user_id=current_user.id,
            resume_id=analysis_in.resume_id or "uploaded",
            resume_file_name=resume_file_name,
            job_description=analysis_in.job_description,
            scores=ai_result.get("scores"),
            recruiter_feedback=ai_result.get("recruiterFeedback"),
            skill_gap=ai_result.get("skillGap"),
            interview_questions=ai_result.get("interviewQuestions"),
            roadmap=ai_result.get("roadmap"),
            bullet_improvements=ai_result.get("bulletImprovements"),
            created_at=datetime.utcnow()
        )

        db.add(new_analysis)
        db.commit()
        db.refresh(new_analysis)
        
        return new_analysis

    except Exception as e:
        logger.error(f"RAG comparison process failure: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Semantic AI processing encountered an exception: {str(e)}"
        )


@router.get("/history", response_model=List[schemas.AnalysisResponse])
def get_analysis_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns the historical resume analyses for the logged-in user in chronological order.
    """
    history = db.query(models.Analysis).filter(
        models.Analysis.user_id == current_user.id
    ).order_by(models.Analysis.created_at.desc()).all()
    
    return history
