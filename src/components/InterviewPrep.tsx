import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  MessageSquare, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  Filter, 
  Eye, 
  EyeOff, 
  LayoutList,
  CheckCircle2,
  Award,
  AlertTriangle
} from 'lucide-react';
import { Analysis, InterviewQuestion } from '../types';

interface InterviewPrepProps {
  analysis: Analysis | null;
}

export default function InterviewPrep({ analysis }: InterviewPrepProps) {
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});

  if (!analysis) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-12 text-center space-y-4 font-sans">
        <LayoutList className="h-10 w-10 text-slate-400 mx-auto animate-pulse" />
        <p className="text-sm font-semibold text-slate-800">No Analysis Loaded</p>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Please run a Career Intelligence comparison on the Compare tab to synthesize technical interview preparation vectors.
        </p>
      </div>
    );
  }

  const rawQuestions = analysis.interviewQuestions || [];

  // Map arbitrary prompt categories into the exact 5 enterprise domains requested
  const mapCategoryToDomain = (category: string): 'Backend' | 'Databases' | 'Distributed Systems' | 'Cloud/Ops' | 'Testing' => {
    const cat = category.toLowerCase();
    if (cat.includes('backend') || cat.includes('api') || cat.includes('language') || cat.includes('python') || cat.includes('core') || cat.includes('rest')) {
      return 'Backend';
    }
    if (cat.includes('database') || cat.includes('db') || cat.includes('caching') || cat.includes('redis') || cat.includes('postgres') || cat.includes('sql')) {
      return 'Databases';
    }
    if (cat.includes('distributed') || cat.includes('concurrency') || cat.includes('kafka') || cat.includes('stream') || cat.includes('system design') || cat.includes('messaging')) {
      return 'Distributed Systems';
    }
    if (cat.includes('cloud') || cat.includes('ops') || cat.includes('docker') || cat.includes('kubernetes') || cat.includes('infra') || cat.includes('aws') || cat.includes('terraform')) {
      return 'Cloud/Ops';
    }
    if (cat.includes('testing') || cat.includes('devops') || cat.includes('ci') || cat.includes('cd') || cat.includes('quality') || cat.includes('pytest')) {
      return 'Testing';
    }
    return 'Backend'; // fallback
  };

  // Compile grouped questions with mapped domain
  const mappedQuestions = rawQuestions.map(q => ({
    ...q,
    mappedDomain: mapCategoryToDomain(q.category)
  }));

  const domains = ['All', 'Backend', 'Databases', 'Distributed Systems', 'Cloud/Ops', 'Testing'];

  const filteredQuestions = selectedDomain === 'All'
    ? mappedQuestions
    : mappedQuestions.filter(q => q.mappedDomain === selectedDomain);

  const toggleQuestion = (id: string) => {
    setExpandedQuestionId(expandedQuestionId === id ? null : id);
  };

  const toggleRevealAnswer = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setRevealedAnswers(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Expert':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Advanced':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Intermediate':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Generate unique evaluation rubric for each question dynamically
  const getEvaluationRubric = (question: string) => {
    const qLower = question.toLowerCase();
    
    if (qLower.includes('kafka') || qLower.includes('stream') || qLower.includes('concurrency')) {
      return {
        needsImprovement: "Vaguely describes streams as 'fast files'. Fails to mention partitions, consumer offsets, or backpressure mechanics. Offers no strategies to ensure message order.",
        meetsExpectations: "Explains how consumer groups scale out. Correctly describes partitioning. Understands basic read/write commit offsets.",
        exceedsExpectations: "Explains partitioning keys, partition-to-consumer pinning, idempotence keys, transactional writes, and dead-letter queue architectures for failovers."
      };
    }
    
    if (qLower.includes('postgres') || qLower.includes('database') || qLower.includes('query') || qLower.includes('index')) {
      return {
        needsImprovement: "Suggests 'making queries shorter' without naming index algorithms. Confuses clustered vs. non-clustered indexes. No concept of connection pooling.",
        meetsExpectations: "Explains index scans, EXPLAIN ANALYZE commands, composite indexes, and basic Redis write-through caching configurations.",
        exceedsExpectations: "Discusses composite index left-to-right rule, B-Tree lookups, vacuum operations, query analyzer limits, transaction isolation levels, and hot standbys."
      };
    }

    if (qLower.includes('docker') || qLower.includes('kubernetes') || qLower.includes('terraform') || qLower.includes('cloud')) {
      return {
        needsImprovement: "Lists standard console click paths. Does not write declarative files. Confuses pods with bare metal nodes. No multi-region awareness.",
        meetsExpectations: "Outlines multi-stage Dockerfiles. Explains deployment configs, state management in Terraform, and Kubernetes service routing.",
        exceedsExpectations: "Designs state locking with S3/DynamoDB, Helm chart orchestration, pod autoscaling (HPA), sidecar proxies, and rolling zero-downtime deployments."
      };
    }

    return {
      needsImprovement: "Lists superficial definitions without system context. Fails to discuss scale constraints, trade-offs, or actual performance metrics.",
      meetsExpectations: "Identifies standard libraries, defines primary operational paths, and relates the concept to typical server-side patterns.",
      exceedsExpectations: "Justifies architectural choices with clear quantitative parameters (TPS, latency SLAs). Addresses race conditions, edge-case failure loops, and mitigation plans."
    };
  };

  return (
    <div className="space-y-8 font-sans text-brand-text">
      <div className="border-b border-brand-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight" id="interview-prep-heading">
            AI Interview Intelligence & Readiness
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Domain-grouped technical questions and structured evaluation rubrics synthesized directly from your resume against role constraints.
          </p>
        </div>

        <span className="text-[10px] font-bold bg-[#FBFBF9] text-slate-800 px-3 py-1.5 rounded-full border border-brand-border self-start shrink-0 font-mono">
          {mappedQuestions.length} Personalized Questions
        </span>
      </div>

      {/* Domain filters */}
      <div className="flex items-center space-x-2 pb-2 overflow-x-auto scrollbar-none" id="interview-filters">
        <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0 mr-1" />
        {domains.map((dom, index) => (
          <button
            key={index}
            onClick={() => setSelectedDomain(dom)}
            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition whitespace-nowrap cursor-pointer ${selectedDomain === dom ? 'bg-slate-900 text-white border-slate-900 shadow-xs' : 'bg-white text-slate-600 border-brand-border hover:bg-slate-50'}`}
          >
            {dom}
          </button>
        ))}
      </div>

      {/* Question list */}
      <div className="space-y-4" id="interview-questions-list">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((q) => {
            const isExpanded = expandedQuestionId === q.id;
            const isAnswerRevealed = revealedAnswers[q.id] || false;
            const rubric = getEvaluationRubric(q.question);

            return (
              <div
                key={q.id}
                className={`bg-white border rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden transition ${isExpanded ? 'border-slate-900' : 'border-brand-border hover:border-slate-350'}`}
              >
                {/* Header section (Clickable) */}
                <div
                  onClick={() => toggleQuestion(q.id)}
                  className="p-5 flex items-start justify-between cursor-pointer select-none space-x-4"
                >
                  <div className="space-y-2">
                    {/* Tags line */}
                    <div className="flex items-center space-x-2.5">
                      <span className="text-[9px] font-bold text-slate-800 bg-[#FBFBF9] px-2 py-0.5 rounded border border-brand-border uppercase tracking-wider font-mono">
                        {q.mappedDomain}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider font-mono ${getDifficultyColor(q.difficulty)}`}>
                        {q.difficulty}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-850 leading-relaxed">
                      {q.question}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0 mt-1">
                    <button
                      onClick={(e) => toggleRevealAnswer(e, q.id)}
                      className="text-[10px] font-bold text-slate-750 hover:text-slate-900 flex items-center bg-white hover:bg-slate-50 border border-brand-border rounded-lg px-2.5 py-1.5 transition cursor-pointer font-sans"
                    >
                      {isAnswerRevealed ? (
                        <>
                          <EyeOff className="h-3.5 w-3.5 mr-1 text-slate-600" />
                          Hide Rubric
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5 mr-1 text-slate-600" />
                          Reveal Rubric
                        </>
                      )}
                    </button>
                    {isExpanded ? <ChevronUp className="h-4.5 w-4.5 text-slate-400" /> : <ChevronDown className="h-4.5 w-4.5 text-slate-400" />}
                  </div>
                </div>

                {/* Expanded Answer Outlines & Guidelines */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-3 border-t border-brand-border bg-[#FBFBF9]/30 space-y-5">
                    
                    {/* Selection Reasoning */}
                    {q.whySelected && (
                      <div className="p-3 bg-slate-55 border border-brand-border rounded-xl space-y-1">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                          // AI Recruiter Selection Reasoning
                        </span>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {q.whySelected}
                        </p>
                      </div>
                    )}

                    {/* Key Discussion Points checklist */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-1.5">
                        <Star className="h-4 w-4 text-slate-800" />
                        <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider font-mono">
                          Expected Discussion Milestones
                        </h4>
                      </div>
                      
                      <div className={`p-4 bg-white border border-brand-border rounded-xl space-y-3 transition ${isAnswerRevealed ? 'opacity-100' : 'opacity-40 select-none blur-3xs'}`}>
                        {q.expectedAnswer.map((answerBullet, idx) => (
                          <div key={idx} className="flex items-start space-x-2.5 text-xs text-slate-600 leading-relaxed">
                            <div className="h-4.5 w-4.5 rounded-full bg-slate-100 border border-brand-border text-slate-800 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-mono">
                              {idx + 1}
                            </div>
                            <span>{answerBullet}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recruiter Evaluation Rubric */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-1.5">
                        <Award className="h-4 w-4 text-slate-800" />
                        <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider font-mono">
                          Candidate Evaluation Rubric (Recruiter Guide)
                        </h4>
                      </div>

                      <div className={`grid grid-cols-1 md:grid-cols-3 gap-3.5 transition ${isAnswerRevealed ? 'opacity-100' : 'opacity-40 select-none blur-3xs'}`}>
                        {/* Needs Improvement */}
                        <div className="bg-white border border-rose-150 p-3.5 rounded-xl space-y-2">
                          <span className="text-[9px] font-bold text-rose-600 uppercase tracking-wider block font-mono flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-1 text-rose-500" /> Score 1-2 (Gaps)
                          </span>
                          <p className="text-[11px] text-slate-500 leading-relaxed text-justify">
                            {rubric.needsImprovement}
                          </p>
                        </div>

                        {/* Meets Expectations */}
                        <div className="bg-white border border-slate-200 p-3.5 rounded-xl space-y-2">
                          <span className="text-[9px] font-bold text-slate-700 uppercase tracking-wider block font-mono flex items-center">
                            <CheckCircle2 className="h-3 w-3 mr-1 text-slate-500" /> Score 3-4 (Meets)
                          </span>
                          <p className="text-[11px] text-slate-500 leading-relaxed text-justify">
                            {rubric.meetsExpectations}
                          </p>
                        </div>

                        {/* Exceeds Expectations */}
                        <div className="bg-white border border-slate-900 p-3.5 rounded-xl space-y-2 ring-1 ring-slate-950/5">
                          <span className="text-[9px] font-bold text-slate-900 uppercase tracking-wider block font-mono flex items-center">
                            <Star className="h-3.5 w-3.5 mr-1 text-slate-800 fill-slate-900" /> Score 5 (Exceeds)
                          </span>
                          <p className="text-[11px] text-slate-800 leading-relaxed text-justify font-medium">
                            {rubric.exceedsExpectations}
                          </p>
                        </div>
                      </div>
                    </div>

                    {!isAnswerRevealed && (
                      <div className="text-center py-2">
                        <button
                          onClick={(e) => toggleRevealAnswer(e, q.id)}
                          className="inline-flex items-center px-4 py-2 text-[10px] font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition cursor-pointer"
                        >
                          <Eye className="h-4 w-4 mr-1.5 text-white" />
                          Reveal Rubric & Discussion Outlines
                        </button>
                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-center py-12 text-xs text-slate-400 font-semibold bg-white border border-brand-border rounded-xl">
            No interview questions match your current domain filter selection.
          </p>
        )}
      </div>
    </div>
  );
}
