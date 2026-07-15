export interface User {
  id: string;
  email: string;
  name: string;
  title?: string;
  createdAt: string;
}

export interface ScoreData {
  atsScore: number;
  semanticMatch: number;
  keywordCoverage: number;
  engineeringMaturity: number;
  clarity: number;
  hiringConfidence: number;
}

export interface SectorReadiness {
  title: string;
  extracted: string;
  reasoning: string;
  confidence: number;
  recommendation: string;
  impact: string;
}

export interface EngineeringReadiness {
  backend: SectorReadiness;
  db: SectorReadiness;
  distributed: SectorReadiness;
  cloud: SectorReadiness;
  testing: SectorReadiness;
}

export interface RecruiterFeedback {
  strengths: string[];
  weaknesses: string[];
  rejectionReasons: string[];
  missingBackendSkills: string[];
  missingCloudSkills: string[];
  impactSuggestions: string[];
  hiringRecommendation?: string; // e.g. "Proceed" | "Hold" | "Reject"
  confidenceLevel?: number;       // e.g. 91
  engineeringConcerns?: string[]; // Specific engineering risks
  missingProductionExperience?: string[]; // Gaps in scale, concurrency, IaC
  suggestedInterviewFocus?: string[]; // Suggested question domains
  decisionReasoning?: string; // Explain Why reasoning panel
  engineeringReadiness?: EngineeringReadiness; // Dynamic sectors data
}

export interface SkillGap {
  matchedSkills: string[];
  missingSkills: string[];
  recommendedSkills: string[];
}

export interface InterviewQuestion {
  id: string;
  category: string;
  question: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  expectedAnswer: string[];
  whySelected?: string;
}

export interface RoadmapMilestone {
  month: string;
  topics: {
    name: string;
    details: string;
    status: 'Not Started' | 'In Progress' | 'Completed';
  }[];
}

export interface ResumeBulletImprovement {
  original: string;
  improved: string;
  impactScoreIncrease: number;
  reason: string;
}

export interface Analysis {
  id: string;
  userId: string;
  resumeId: string;
  resumeFileName: string;
  jobDescription: string;
  scores: ScoreData;
  recruiterFeedback: RecruiterFeedback;
  skillGap: SkillGap;
  interviewQuestions?: InterviewQuestion[];
  roadmap?: RoadmapMilestone[];
  bulletImprovements?: ResumeBulletImprovement[];
  createdAt: string;
}

export interface ResumeVersion {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  parsedText?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
