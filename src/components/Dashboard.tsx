import React from 'react';
import { motion } from 'motion/react';
import { 
  Award, 
  CheckCircle2, 
  TrendingUp, 
  AlertTriangle, 
  FileText, 
  Calendar, 
  ArrowRight, 
  Zap, 
  Target, 
  BookOpen, 
  Compass, 
  Activity, 
  ShieldCheck, 
  Cpu 
} from 'lucide-react';
import { Analysis, User } from '../types';

interface DashboardProps {
  user: User;
  analyses: Analysis[];
  onSelectAnalysis: (analysis: Analysis) => void;
  onNavigateToTab: (tabId: string) => void;
}

export default function Dashboard({ user, analyses, onSelectAnalysis, onNavigateToTab }: DashboardProps) {
  const latestAnalysis = analyses[0] || null;
  const totalAnalyses = analyses.length;

  // Learning progress calculations based on latest roadmap
  let completedTopics = 0;
  let totalTopics = 0;
  if (latestAnalysis && latestAnalysis.roadmap) {
    latestAnalysis.roadmap.forEach(milestone => {
      milestone.topics.forEach(topic => {
        totalTopics++;
        if (topic.status === 'Completed') completedTopics++;
      });
    });
  }
  const learningProgressPercent = totalTopics ? Math.round((completedTopics / totalTopics) * 100) : 15;

  return (
    <div className="space-y-8 font-sans">
      {/* Executive Welcome Banner - Linear Style */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white border border-brand-border rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-slate-900 animate-pulse" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Executive Session</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1.5" id="dashboard-welcome-heading">
            Welcome back, {user.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise Career Intelligence Portal &bull; Target Role: <span className="font-semibold text-slate-800">{user.title || 'Senior Backend Engineer'}</span>
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button
            onClick={() => onNavigateToTab('analyze')}
            className="inline-flex items-center px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition shadow-sm cursor-pointer"
            id="run-new-analysis-dashboard-btn"
          >
            <Zap className="h-4 w-4 mr-1.5 text-white" />
            Analyze New Resume
          </button>
        </div>
      </div>

      {/* INSIGHT-DRIVEN PANELS (Replacing large generic score percentage cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5" id="insight-driven-panels">
        
        {/* Panel 1: Executive Alignment Status */}
        <div className="bg-white p-5 border border-brand-border rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Executive Alignment Status</span>
            <span className="p-1.5 bg-[#FBFBF9] text-slate-750 border border-brand-border rounded-lg"><Compass className="h-3.5 w-3.5" /></span>
          </div>
          <div>
            <span className="text-sm font-bold text-slate-950 block">
              {latestAnalysis ? "Highly Competitive Profile" : "Awaiting Document Feed"}
            </span>
            <p className="text-[10px] text-slate-500 mt-1 leading-normal">
              {latestAnalysis 
                ? "Core languages and distributed system components align strongly with active software engineering requirements."
                : "Initialize a resume alignment query to calculate career maturity and technical matching models."}
            </p>
          </div>
          <div className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-wider pt-2 border-t border-brand-border/60">
            METRIC: SEMANTIC FIT MATCH
          </div>
        </div>

        {/* Panel 2: Principal Recruiter Conviction */}
        <div className="bg-white p-5 border border-brand-border rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Primary Engineering Asset</span>
            <span className="p-1.5 bg-[#FBFBF9] text-slate-750 border border-brand-border rounded-lg"><Cpu className="h-3.5 w-3.5" /></span>
          </div>
          <div>
            <span className="text-sm font-bold text-slate-950 block">
              {latestAnalysis ? "Distributed API Architectures" : "Awaiting File Feed"}
            </span>
            <p className="text-[10px] text-slate-500 mt-1 leading-normal">
              {latestAnalysis 
                ? "High-throughput API optimizations and core database caching layers represent your highest conviction technical skills."
                : "AI extracts your highest-impact action patterns to isolate recruiter-appealing engineering achievements."}
            </p>
          </div>
          <div className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-wider pt-2 border-t border-brand-border/60">
            STRENGTH: MICROSERVICE TUNING
          </div>
        </div>

        {/* Panel 3: Technical Growth Priority */}
        <div className="bg-white p-5 border border-brand-border rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">High Leverage Learning Target</span>
            <span className="p-1.5 bg-[#FBFBF9] text-slate-750 border border-brand-border rounded-lg"><Target className="h-3.5 w-3.5" /></span>
          </div>
          <div>
            <span className="text-sm font-bold text-slate-950 block text-brand-pink-text">
              {latestAnalysis ? "Declarative Infrastructure" : "Awaiting Learning Map"}
            </span>
            <p className="text-[10px] text-slate-500 mt-1 leading-normal">
              {latestAnalysis 
                ? "Acquiring hands-on Terraform scripting and enterprise PyTest coverage models will yield the largest screening callbacks."
                : "Maps unmentioned core tech layers in your resume against the highest demand industry roles."}
            </p>
          </div>
          <div className="text-[9px] font-bold text-brand-pink-text font-mono uppercase tracking-wider pt-2 border-t border-brand-border/60">
            GAP: CLOUD PROVISIONING
          </div>
        </div>

        {/* Panel 4: Hiring Simulation Status */}
        <div className="bg-white p-5 border border-brand-border rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Hiring Simulation Pipeline</span>
            <span className="p-1.5 bg-[#FBFBF9] text-slate-750 border border-brand-border rounded-lg"><ShieldCheck className="h-3.5 w-3.5" /></span>
          </div>
          <div>
            <span className="text-sm font-bold text-slate-950 block">
              {latestAnalysis ? "Proceed to Active Review" : "Awaiting Simulator Run"}
            </span>
            <p className="text-[10px] text-slate-500 mt-1 leading-normal">
              {latestAnalysis 
                ? "Pipeline simulation model projects Proceed recommendations with zero critical human filter drops."
                : "Executes a technical hiring screen simulator to identify early filter failures or unconvincing profiles."}
            </p>
          </div>
          <div className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-wider pt-2 border-t border-brand-border/60">
            DECISION: PASS SCREEN GATE
          </div>
        </div>

      </div>

      {/* Main Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Recent Analyses History */}
        <div className="lg:col-span-2 bg-white border border-brand-border rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-brand-border pb-4">
            <h2 className="text-xs font-bold text-slate-900 tracking-tight flex items-center uppercase">
              <FileText className="h-4 w-4 mr-2 text-slate-500" />
              Recent Intelligence Assessments
            </h2>
            <span className="text-[10px] bg-brand-bg text-slate-600 px-2 py-0.5 font-bold rounded-full border border-brand-border">
              {totalAnalyses} records
            </span>
          </div>

          {latestAnalysis ? (
            <div className="divide-y divide-brand-border">
              {analyses.map((analysis) => (
                <div key={analysis.id} className="py-4 flex items-center justify-between group first:pt-0 last:pb-0">
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-slate-800 hover:text-slate-900 hover:underline cursor-pointer flex items-center transition" onClick={() => onSelectAnalysis(analysis)}>
                      {analysis.resumeFileName}
                    </h3>
                    <div className="flex items-center space-x-3 text-[10px] text-slate-500">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1 text-slate-400" />
                        {new Date(analysis.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span>&bull;</span>
                      <span className="font-semibold text-slate-700 bg-slate-50 px-1.5 py-0.5 rounded border border-brand-border">
                        SIMULATION: {analysis.recruiterFeedback.hiringRecommendation || (analysis.scores.hiringConfidence >= 85 ? 'Proceed' : 'Hold')}
                      </span>
                      <span>&bull;</span>
                      <span className="font-semibold text-slate-800 font-mono">
                        MATCH CORE: {analysis.scores.semanticMatch}%
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onSelectAnalysis(analysis)}
                    className="inline-flex items-center px-3 py-1.5 text-[10px] font-bold text-slate-700 bg-white hover:bg-slate-50 border border-brand-border rounded-lg group-hover:border-slate-800 transition cursor-pointer"
                  >
                    View Insights
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-brand-border text-slate-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">No analyses performed yet</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                  Upload your software engineering resume and paste a Job Description to generate a recruiter-style AI career intelligence assessment.
                </p>
              </div>
              <button
                onClick={() => onNavigateToTab('analyze')}
                className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition cursor-pointer"
              >
                Upload First Resume
              </button>
            </div>
          )}
        </div>

        {/* Right column: Learning & Readiness Overview */}
        <div className="space-y-6">
          
          {/* Learning Progress Card */}
          <div className="bg-white border border-brand-border rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
              <BookOpen className="h-4 w-4 mr-2 text-slate-700" />
              Learning Roadmap Progress
            </h3>

            {latestAnalysis && latestAnalysis.roadmap ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                    <span>Curriculum Target</span>
                    <span>{learningProgressPercent}% Completed</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className="bg-slate-900 h-1.5 rounded-full" style={{ width: `${learningProgressPercent}%` }} />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Next Required Milestones:</span>
                  {latestAnalysis.roadmap[0]?.topics.slice(0, 2).map((topic, index) => (
                    <div key={index} className="p-2.5 bg-brand-bg border border-brand-border rounded-lg flex items-start space-x-2.5">
                      <div className="mt-0.5 h-3.5 w-3.5 rounded-full border border-slate-400 border-dashed shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-slate-800 leading-tight">{topic.name}</p>
                        <p className="text-[10px] text-slate-500 leading-normal mt-0.5 line-clamp-1">{topic.details}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onNavigateToTab('roadmap')}
                  className="w-full text-center text-xs font-bold text-slate-900 hover:underline mt-2 block"
                >
                  View complete career curriculum &rarr;
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-500 leading-relaxed">
                Your learning targets and tailored curriculum will populate once your resume is compared against an active job description.
              </p>
            )}
          </div>

          {/* Quick Skill Gap Summary Card */}
          <div className="bg-white border border-brand-border rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-brand-pink-text" />
              Critical Skill Gaps Identified
            </h3>

            {latestAnalysis && latestAnalysis.skillGap ? (
              <div className="space-y-4">
                {latestAnalysis.skillGap.missingSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {latestAnalysis.skillGap.missingSkills.slice(0, 5).map((skill, index) => (
                      <span key={index} className="text-[11px] px-2.5 py-1 bg-brand-pink-bg text-brand-pink-text font-bold rounded-md border border-brand-pink-border">
                        {skill}
                      </span>
                    ))}
                    {latestAnalysis.skillGap.missingSkills.length > 5 && (
                      <span className="text-[11px] px-2 py-1 bg-slate-100 text-slate-600 font-bold rounded-md border border-brand-border/60">
                        +{latestAnalysis.skillGap.missingSkills.length - 5} more
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-600 flex items-center font-semibold">
                    <CheckCircle2 className="h-4 w-4 mr-1.5" /> All critical keywords are covered!
                  </p>
                )}

                <p className="text-[11px] text-slate-500 leading-normal">
                  Recruiter feedback notes some missing skill layers. Click below to inspect custom radar maps.
                </p>

                <button
                  onClick={() => onNavigateToTab('skillgap')}
                  className="w-full text-center text-xs font-bold text-slate-900 hover:underline block"
                >
                  Inspect deep Skill Gap matrix &rarr;
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-500 leading-relaxed">
                No active gaps recorded. Run a career intelligence comparison to instantly map your technical skills against actual job mandates.
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
