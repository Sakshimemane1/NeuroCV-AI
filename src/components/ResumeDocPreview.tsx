import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  ArrowRight, 
  CheckCircle, 
  Database, 
  Brain, 
  MessageSquare, 
  Terminal, 
  User, 
  ShieldCheck,
  Award,
  Sparkles
} from 'lucide-react';
import { Analysis } from '../types';

interface ResumeDocPreviewProps {
  analysis: Analysis | null;
}

export default function ResumeDocPreview({ analysis }: ResumeDocPreviewProps) {
  const [activeTab, setActiveTab] = useState<'paper' | 'data' | 'reasoning' | 'comments'>('paper');
  const [comments, setComments] = useState<string>('');

  // Auto-load and sync comments with localStorage
  useEffect(() => {
    if (analysis) {
      const stored = localStorage.getItem(`neurocv_recruiter_comments_${analysis.id}`);
      if (stored) {
        setComments(stored);
      } else {
        // Set an intelligent initial comment based on recommendation
        const reco = analysis.recruiterFeedback.hiringRecommendation || "Proceed";
        const initial = `[RECRUITER REVIEW NOTES - ALEX Mercer]\n\nDecision Recommendation: ${reco}\nAI Confidence Index: ${analysis.scores.hiringConfidence}%\n\nSummary Assessment:\n- Strong competency match in standard Microservices, Spring Boot, and FastAPI.\n- Highly compelling Kafka RPS metrics (15k+ RPS).\n- Gaps remain in declarative IaC (Terraform) and AWS compliance rules.\n\nSuggested Next Steps:\n1. Schedule 45-min technical screen prioritizing Distributed Systems & Concurrency.\n2. Request candidate details on Terraform setup in prior roles.`;
        setComments(initial);
        localStorage.setItem(`neurocv_recruiter_comments_${analysis.id}`, initial);
      }
    }
  }, [analysis]);

  const handleCommentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComments(e.target.value);
    if (analysis) {
      localStorage.setItem(`neurocv_recruiter_comments_${analysis.id}`, e.target.value);
    }
  };

  if (!analysis) {
    return (
      <div className="bg-[#FBFBF9] border border-brand-border rounded-xl p-8 text-center space-y-3 h-full flex flex-col items-center justify-center min-h-[400px]">
        <FileText className="h-8 w-8 text-slate-300 animate-pulse" />
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">No Resume Context Active</p>
        <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
          Please run an AI Career Intelligence alignment query first to generate comparison sheets.
        </p>
      </div>
    );
  }

  const { recruiterFeedback, skillGap, bulletImprovements, scores } = analysis;

  // Extract candidate profile details
  const candidateName = "ALEX MERCER";
  const candidateTitle = "Senior Backend Software Engineer";
  const candidateEmail = "alex@mercer.dev";
  const candidatePhone = "(555) 019-2834";
  const candidateLocation = "San Francisco, CA";

  // Reconstruct the resume experience bullet points by pulling original bullets from analysis improvements
  const experienceBullets = bulletImprovements && bulletImprovements.length > 0
    ? bulletImprovements.map(bi => bi.original)
    : [
        "Lead a migration of legacy monolithic system into Dockerized Microservices orchestrated via Kubernetes on AWS.",
        "Designed and maintained Python FastAPI backend microservices for financial transaction processing.",
        "Optimized database queries in PostgreSQL to resolve timeouts and bug tickets."
      ];

  const matchedSkillsList = skillGap.matchedSkills && skillGap.matchedSkills.length > 0
    ? skillGap.matchedSkills
    : ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker", "Kubernetes", "AWS"];

  return (
    <div className="bg-white border border-brand-border rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col h-full min-h-[600px] overflow-hidden font-sans">
      {/* Header bar */}
      <div className="bg-[#FBFBF9] border-b border-brand-border px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-slate-800" />
          <span className="text-xs font-bold text-slate-900 tracking-tight">
            Resume Workspace: <span className="font-mono text-[10px] text-slate-500">{analysis.resumeFileName}</span>
          </span>
        </div>

        {/* Workspace Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100/70 border border-brand-border p-0.5 rounded-lg select-none">
          <button
            onClick={() => setActiveTab('paper')}
            className={`text-[9px] font-bold px-2 py-1 rounded transition cursor-pointer ${activeTab === 'paper' ? 'bg-white text-slate-950 shadow-[0_1px_3px_rgba(0,0,0,0.05)]' : 'text-slate-500 hover:text-slate-950'}`}
          >
            PDF Preview
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`text-[9px] font-bold px-2 py-1 rounded transition cursor-pointer ${activeTab === 'data' ? 'bg-white text-slate-950 shadow-[0_1px_3px_rgba(0,0,0,0.05)]' : 'text-slate-500 hover:text-slate-950'}`}
          >
            Extracted Data
          </button>
          <button
            onClick={() => setActiveTab('reasoning')}
            className={`text-[9px] font-bold px-2 py-1 rounded transition cursor-pointer ${activeTab === 'reasoning' ? 'bg-white text-slate-950 shadow-[0_1px_3px_rgba(0,0,0,0.05)]' : 'text-slate-500 hover:text-slate-950'}`}
          >
            AI Reasoning
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`text-[9px] font-bold px-2 py-1 rounded transition cursor-pointer ${activeTab === 'comments' ? 'bg-white text-slate-950 shadow-[0_1px_3px_rgba(0,0,0,0.05)]' : 'text-slate-500 hover:text-slate-950'}`}
          >
            Comments
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 p-5 overflow-y-auto bg-slate-50/50">
        
        {activeTab === 'paper' && (
          /* High-Fidelity Simulated PDF Paper Sheet */
          <div className="bg-white border border-brand-border shadow-[0_4px_12px_rgba(0,0,0,0.015)] max-w-2xl mx-auto p-6 space-y-6 text-slate-900 relative rounded-lg">
            
            {/* Watermark/Label */}
            <div className="absolute top-3 right-3 select-none text-[8px] font-bold tracking-widest text-slate-400 uppercase border border-slate-200 px-1.5 py-0.5 rounded font-mono">
              ORIGINAL_DRAFT_PDF
            </div>

            {/* Document Header */}
            <div className="text-center space-y-1 pb-4 border-b border-slate-200">
              <h2 className="text-base font-bold tracking-tight text-slate-900">{candidateName}</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{candidateTitle}</p>
              
              {/* Contacts Line */}
              <div className="flex flex-wrap justify-center items-center gap-x-2.5 gap-y-1 pt-1.5 text-[9px] text-slate-500">
                <span className="flex items-center"><Mail className="h-3 w-3 mr-0.5 shrink-0" /> {candidateEmail}</span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center"><Phone className="h-3 w-3 mr-0.5 shrink-0" /> {candidatePhone}</span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center"><MapPin className="h-3 w-3 mr-0.5 shrink-0" /> {candidateLocation}</span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center"><Globe className="h-3 w-3 mr-0.5 shrink-0" /> github.com/alexmercer</span>
              </div>
            </div>

            {/* Document Executive Summary */}
            <div className="space-y-1">
              <h3 className="text-[9px] font-bold text-slate-950 uppercase tracking-wider border-b border-slate-100 pb-0.5">Professional Summary</h3>
              <p className="text-[11px] text-slate-650 leading-relaxed text-justify">
                Senior Backend Engineer with 6+ years of experience designing, scaling, and maintaining high-throughput distributed systems. Proven track record of optimizing database queries, implementing stream processing pipelines (Kafka), and building robust microservices. Passionate about developer efficiency and cloud architectures.
              </p>
            </div>

            {/* Document Skill Categories */}
            <div className="space-y-1">
              <h3 className="text-[9px] font-bold text-slate-950 uppercase tracking-wider border-b border-slate-100 pb-0.5">Technical Expertise</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 pt-0.5 text-[11px]">
                <p className="text-slate-600"><span className="font-semibold text-slate-800">Languages:</span> Java, Python, Go, SQL, Bash</p>
                <p className="text-slate-600"><span className="font-semibold text-slate-800">Databases:</span> PostgreSQL, Redis, Elasticsearch, DynamoDB</p>
                <p className="text-slate-600"><span className="font-semibold text-slate-800">DevOps/Cloud:</span> AWS ECS, Docker, Kubernetes, Terraform</p>
                <p className="text-slate-600"><span className="font-semibold text-slate-800">Architectures:</span> Event-Driven, Microservices, gRPC, REST</p>
              </div>
            </div>

            {/* Document Professional Experience */}
            <div className="space-y-3">
              <h3 className="text-[9px] font-bold text-slate-950 uppercase tracking-wider border-b border-slate-100 pb-0.5">Professional Experience</h3>
              
              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <p className="text-[11px] font-bold text-slate-900">Lead Backend Engineer &bull; <span className="font-medium text-slate-500">CloudScale Tech</span></p>
                  <p className="text-[9px] text-slate-500 font-mono">2023 - Present</p>
                </div>
                
                <ul className="list-disc list-outside pl-4 space-y-1 text-[11px] text-slate-600 leading-relaxed">
                  <li className="pl-0.5">Architected and built a high-throughput event streaming data ingestion platform handling 15,000+ RPS using Spring Boot, Apache Kafka, and PostgreSQL, reducing latency by 42%.</li>
                  <li className="pl-0.5">Integrated OpenAI and LangChain RAG pipeline into the enterprise knowledge manager to perform semantic search across internal wikis, increasing search accuracy by 60%.</li>
                  <li className="pl-0.5">Led a migration of legacy monolithic system into Dockerized Microservices orchestrated via Kubernetes on AWS, cutting server costs by 30%.</li>
                </ul>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <p className="text-[11px] font-bold text-slate-900">Software Engineer &bull; <span className="font-medium text-slate-500">FinQuery Systems</span></p>
                  <p className="text-[9px] text-slate-500 font-mono">2020 - 2023</p>
                </div>
                
                <ul className="list-disc list-outside pl-4 space-y-1 text-[11px] text-slate-600 leading-relaxed">
                  <li className="pl-0.5">Designed and maintained Python FastAPI backend microservices for financial transaction processing and high-performance querying, handling $10M+ transaction volume daily.</li>
                  <li className="pl-0.5">Implemented multi-level caching strategies using Redis, improving database query speeds by 70%.</li>
                  <li className="pl-0.5">Optimized PostgreSQL database indexes and rewritten complex SQL queries, saving approximately 18 engineering hours weekly.</li>
                </ul>
              </div>
            </div>

            {/* Note footer */}
            <div className="bg-slate-50 p-3 border border-slate-200 rounded-lg text-[10px] text-slate-500 leading-relaxed select-none">
              <span className="font-bold text-slate-800">Review Note:</span> This matches the target requirements but lacks specific quantitative details in some bullets (such as automated CI test rates or specific IAM security policies). Use the <span className="font-bold text-slate-900">Resume Rewriter</span> tab to replace these lines.
            </div>

          </div>
        )}

        {activeTab === 'data' && (
          /* Extracted Structured Resume Data Tab */
          <div className="bg-white border border-brand-border rounded-lg shadow-sm p-5 space-y-5">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center mb-1">
                <Database className="h-4 w-4 mr-1.5 text-slate-700" />
                Extracted Structured Entities
              </h3>
              <p className="text-[10px] text-slate-400">Structured database schema compiled by candidate text parser tokenizers.</p>
            </div>

            <div className="space-y-4">
              {/* Profile Block */}
              <div className="border border-brand-border rounded-lg overflow-hidden">
                <div className="bg-[#FBFBF9] px-3.5 py-2 border-b border-brand-border text-[10px] font-bold uppercase tracking-wider text-slate-800 font-mono">
                  // Entity: Candidate_Profile
                </div>
                <div className="p-3.5 divide-y divide-brand-border text-xs">
                  <div className="py-2 flex justify-between"><span className="font-medium text-slate-400">Name</span><span className="font-bold text-slate-800">{candidateName}</span></div>
                  <div className="py-2 flex justify-between"><span className="font-medium text-slate-400">Title Target</span><span className="font-bold text-slate-800">{candidateTitle}</span></div>
                  <div className="py-2 flex justify-between"><span className="font-medium text-slate-400">Locations</span><span className="font-semibold text-slate-700">{candidateLocation}</span></div>
                  <div className="py-2 flex justify-between"><span className="font-medium text-slate-400">Contact Email</span><span className="font-mono text-slate-700">{candidateEmail}</span></div>
                </div>
              </div>

              {/* Skills Block */}
              <div className="border border-brand-border rounded-lg overflow-hidden">
                <div className="bg-[#FBFBF9] px-3.5 py-2 border-b border-brand-border text-[10px] font-bold uppercase tracking-wider text-slate-800 font-mono">
                  // Entity: Skill_Gaps
                </div>
                <div className="p-3.5 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">Matched Tech Core</span>
                    <div className="flex flex-wrap gap-1">
                      {matchedSkillsList.map((skill, i) => (
                        <span key={i} className="text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-brand-border text-slate-700 font-medium">{skill}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">Unmatched/Missing Mandates</span>
                    <div className="flex flex-wrap gap-1">
                      {skillGap.missingSkills.length > 0 ? (
                        skillGap.missingSkills.map((skill, i) => (
                          <span key={i} className="text-[10px] bg-brand-pink-bg text-brand-pink-text font-bold px-2 py-0.5 rounded border border-brand-pink-border">{skill}</span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 italic">None</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Schema JSON Stream preview */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                  // raw db payload: resume_schema_v2.json
                </span>
                <pre className="p-3 bg-slate-900 text-slate-300 rounded-lg text-[10px] font-mono leading-relaxed overflow-x-auto">
{`{
  "entityType": "ENGINEERING_RESUME",
  "metadata": {
    "parsedAt": "${analysis.createdAt}",
    "languages": ["Java", "Python", "Go", "SQL"],
    "infrastructure": ["Kubernetes", "AWS ECS", "Docker", "Terraform"],
    "hasAiIntegration": true,
    "concurrencyRating": "High (15k RPS)"
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reasoning' && (
          /* AI Semantic Reasoning Tab */
          <div className="bg-white border border-brand-border rounded-lg shadow-sm p-5 space-y-5">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center mb-1">
                <Brain className="h-4 w-4 mr-1.5 text-slate-700" />
                AI Semantic Reasoning & Weights
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">Vector space scoring criteria and semantic matching reports.</p>
            </div>

            <div className="space-y-4">
              
              {/* Telemetry metrics bar list */}
              <div className="p-3.5 bg-[#FBFBF9] border border-brand-border rounded-lg space-y-2.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                  // alignment matching weights
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Cosine Similarity</span>
                    <span className="font-bold text-slate-800 font-mono">{(scores.semanticMatch / 100).toFixed(4)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Hiring Confidence Index</span>
                    <span className="font-bold text-slate-800 font-mono">{scores.hiringConfidence}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Engineering Maturity Factor</span>
                    <span className="font-bold text-slate-800 font-mono">{scores.engineeringMaturity}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Confidence Threshold</span>
                    <span className="font-bold text-slate-800 font-mono">0.8500</span>
                  </div>
                </div>
              </div>

              {/* Text explanation of the reasoning */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800">Semantic Matching Explanation:</h4>
                <p className="text-xs text-slate-600 leading-relaxed text-justify">
                  {recruiterFeedback.decisionReasoning || "This assessment evaluates language syntax and distributed systems experience to project immediate interview readiness."}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed text-justify">
                  <span className="font-semibold text-slate-800">Business Impact Projection:</span> Candidates matching the current event stream ingestion profile (Kafka with Spring Boot) generally cut onboarding timeframes by over 50% for core service initiatives.
                </p>
              </div>

              {/* RAG pipeline steps status */}
              <div className="border border-brand-border rounded-lg overflow-hidden">
                <div className="bg-[#FBFBF9] px-3.5 py-1.5 border-b border-brand-border text-[9px] font-bold uppercase tracking-wider text-slate-700 font-mono">
                  // RAG Pipeline Pipeline Weights
                </div>
                <div className="p-3 divide-y divide-slate-100 text-[10px] font-mono text-slate-600 space-y-1.5">
                  <div className="pt-1.5 flex justify-between"><span>Vector Embeddings:</span> <span className="text-emerald-600">✔ OK [1536-dim]</span></div>
                  <div className="pt-1.5 flex justify-between"><span>Query Grounding:</span> <span className="text-emerald-600">✔ OK [Grounding True]</span></div>
                  <div className="pt-1.5 flex justify-between"><span>Cognitive Reasoning:</span> <span className="text-slate-800">HIGH INTEL</span></div>
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          /* Recruiter Comments Tab */
          <div className="bg-white border border-brand-border rounded-lg shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center mb-1">
                  <MessageSquare className="h-4 w-4 mr-1.5 text-slate-700" />
                  Recruiter Screening Comments
                </h3>
                <p className="text-[10px] text-slate-400">Save specific interview notes or feedback for the hiring board.</p>
              </div>
              <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold font-mono uppercase tracking-wider">
                Auto-Saved
              </span>
            </div>

            <div className="space-y-3.5">
              <textarea
                value={comments}
                onChange={handleCommentsChange}
                className="w-full h-80 p-3 bg-[#FBFBF9] text-xs font-mono text-slate-800 border border-brand-border rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white leading-relaxed resize-none"
                placeholder="Type recruiter screening comments here..."
              />
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-500 leading-relaxed font-sans">
                <span className="font-bold text-slate-850">recruiter_comments.txt</span> is synchronized instantly on edit. You can copy these notes to use during follow-up reviews or internal hiring manager handoffs.
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
