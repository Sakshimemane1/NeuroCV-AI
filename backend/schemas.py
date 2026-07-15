from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime

# Auth Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    title: Optional[str] = "Senior Backend Engineer"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    name: str
    title: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Resume Schemas
class ResumeUploadRequest(BaseModel):
    file_name: str
    file_type: str
    parsed_text: Optional[str] = ""

class ResumeResponse(BaseModel):
    id: str
    user_id: str
    file_name: str
    file_type: str
    uploaded_at: datetime

    class Config:
        from_attributes = True

# Analysis Schemas
class AnalyzeRequest(BaseModel):
    resume_id: str
    job_description: str
    pdf_base64: Optional[str] = None
    manual_text: Optional[str] = None

class ScoreData(BaseModel):
    atsScore: int
    semanticMatch: int
    keywordCoverage: int
    engineeringMaturity: int
    clarity: int
    hiringConfidence: int

class RecruiterFeedback(BaseModel):
    strengths: List[str]
    weaknesses: List[str]
    rejectionReasons: List[str]
    missingBackendSkills: List[str]
    missingCloudSkills: List[str]
    impactSuggestions: List[str]

class SkillGap(BaseModel):
    matchedSkills: List[str]
    missingSkills: List[str]
    recommendedSkills: List[str]

class InterviewQuestion(BaseModel):
    category: str
    question: str
    difficulty: str
    expectedAnswer: List[str]

class RoadmapMilestone(BaseModel):
    month: str
    topics: List[Dict[str, str]]

class BulletImprovement(BaseModel):
    original: str
    improved: str
    impactScoreIncrease: int
    reason: str

class AnalysisResponse(BaseModel):
    id: str
    user_id: str
    resume_id: str
    resume_file_name: str
    job_description: str
    scores: ScoreData
    recruiter_feedback: RecruiterFeedback;
    skill_gap: SkillGap
    interview_questions: Optional[List[InterviewQuestion]] = []
    roadmap: Optional[List[RoadmapMilestone]] = []
    bullet_improvements: Optional[List[BulletImprovement]] = []
    created_at: datetime

    class Config:
        from_attributes = True
