from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    title = Column(String, default="Software Engineer")
    created_at = Column(DateTime, default=datetime.utcnow)

    resumes = relationship("Resume", back_populates="owner", cascade="all, delete-orphan")
    analyses = relationship("Analysis", back_populates="user", cascade="all, delete-orphan")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    parsed_text = Column(Text, nullable=True)

    owner = relationship("User", back_populates="resumes")
    analyses = relationship("Analysis", back_populates="resume", cascade="all, delete-orphan")

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    resume_id = Column(String, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    resume_file_name = Column(String, nullable=False)
    job_description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Store rich semantic analyses, scores, feedback, interview prep, and roadmaps as robust PostgreSQL JSON types
    scores = Column(JSON, nullable=False)
    recruiter_feedback = Column(JSON, nullable=False)
    skill_gap = Column(JSON, nullable=False)
    interview_questions = Column(JSON, nullable=True)
    roadmap = Column(JSON, nullable=True)
    bullet_improvements = Column(JSON, nullable=True)

    user = relationship("User", back_populates="analyses")
    resume = relationship("Resume", back_populates="analyses")
