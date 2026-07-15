import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  GitCompare, 
  TrendingUp, 
  ArrowRight, 
  Award, 
  Activity, 
  Brain, 
  Compass, 
  ShieldCheck, 
  Sliders, 
  Sparkles,
  HelpCircle,
  Clock,
  ChevronDown
} from 'lucide-react';
import { Analysis } from '../types';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  LineChart, 
  Line, 
  Legend 
} from 'recharts';

interface ResumeEvolutionProps {
  analysis: Analysis | null;
  allAnalyses?: Analysis[];
}

export default function ResumeEvolution({ analysis, allAnalyses = [] }: ResumeEvolutionProps) {
  const [compareSourceId, setCompareSourceId] = useState<string>('baseline_draft');
  const [compareTargetId, setCompareTargetId] = useState<string>(analysis?.id || 'active');

  if (!analysis) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-12 text-center space-y-4 font-sans">
        <GitCompare className="h-10 w-10 text-slate-400 mx-auto" />
        <p className="text-sm font-semibold text-slate-800">No Active Profile Loaded</p>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Please run a comparison analysis first to initialize version comparison.
        </p>
      </div>
    );
  }

  // Generate synthetic baseline metrics representing candidate's initial raw resume draft
  const baseline = {
    scores: {
      atsScore: Math.max(45, analysis.scores.atsScore - 28),
      semanticMatch: Math.max(50, analysis.scores.semanticMatch - 25),
      keywordCoverage: Math.max(40, analysis.scores.keywordCoverage - 30),
      engineeringMaturity: Math.max(55, analysis.scores.engineeringMaturity - 20),
      clarity: Math.max(65, analysis.scores.clarity - 18),
      hiringConfidence: Math.max(45, analysis.scores.hiringConfidence - 26),
    },
    title: "Alex Mercer (Original Draft)",
    date: "Original Upload Baseline"
  };

  const getSourceAnalysis = () => {
    if (compareSourceId === 'baseline_draft') {
      return baseline;
    }
    const found = allAnalyses.find(a => a.id === compareSourceId);
    return found ? { scores: found.scores, title: found.resumeFileName, date: new Date(found.createdAt).toLocaleDateString() } : baseline;
  };

  const getTargetAnalysis = () => {
    const found = allAnalyses.find(a => a.id === compareTargetId);
    return found ? { scores: found.scores, title: found.resumeFileName, date: new Date(found.createdAt).toLocaleDateString() } : { scores: analysis.scores, title: analysis.resumeFileName, date: "Active Version" };
  };

  const source = getSourceAnalysis();
  const target = getTargetAnalysis();

  // Score deltas
  const deltas = {
    atsScore: target.scores.atsScore - source.scores.atsScore,
    semanticMatch: target.scores.semanticMatch - source.scores.semanticMatch,
    keywordCoverage: target.scores.keywordCoverage - source.scores.keywordCoverage,
    engineeringMaturity: target.scores.engineeringMaturity - source.scores.engineeringMaturity,
    clarity: target.scores.clarity - source.scores.clarity,
    hiringConfidence: target.scores.hiringConfidence - source.scores.hiringConfidence,
  };

  const performanceRadarData = [
    { subject: 'ATS Score', Source: source.scores.atsScore, Target: target.scores.atsScore },
    { subject: 'Semantic Match', Source: source.scores.semanticMatch, Target: target.scores.semanticMatch },
    { subject: 'Keyword Coverage', Source: source.scores.keywordCoverage, Target: target.scores.keywordCoverage },
    { subject: 'Eng Maturity', Source: source.scores.engineeringMaturity, Target: target.scores.engineeringMaturity },
    { subject: 'Clarity', Source: source.scores.clarity, Target: target.scores.clarity },
    { subject: 'Hiring Confidence', Source: source.scores.hiringConfidence, Target: target.scores.hiringConfidence },
  ];

  // Map bullet evolution comparisons
  const bulletEvolution = analysis.bulletImprovements?.map((item, idx) => ({
    original: item.original,
    improved: item.improved,
    semanticAddition: item.reason,
    scoreIncrease: item.impactScoreIncrease
  })) || [
    {
      original: "Lead a migration of legacy monolithic system into Dockerized Microservices orchestrated via Kubernetes on AWS.",
      improved: "Spearheaded architectural transition of monolithic infrastructure into containerized Microservices using AWS EKS and Docker, improving system availability to 99.99% and reducing compute overhead by 30%.",
      semanticAddition: "Injected specific quantitative metrics (+99.99% SLA, -30% cost) and established strong action verbs.",
      scoreIncrease: 15
    },
    {
      original: "Designed and maintained Python FastAPI backend microservices for financial transaction processing.",
      improved: "Engineered ultra-low-latency financial transaction microservices in Python (FastAPI), safely handling $10M+ in daily transaction throughput with 95th-percentile response times under 40ms.",
      semanticAddition: "Quantified throughput ($10M+ daily volume) and strict performance SLA benchmarks (<40ms latency).",
      scoreIncrease: 12
    }
  ];

  return (
    <div className="space-y-8 font-sans text-brand-text">
      <div className="border-b border-brand-border pb-4">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight" id="evolution-heading">
          AI Resume Evolution & Progression Intelligence
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Observe historical resume performance growth and run side-by-side semantic alignment deltas across iteratively optimized versions.
        </p>
      </div>

      {/* Version Selectors Bar */}
      <div className="bg-white border border-brand-border p-4 rounded-xl shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:w-auto">
          {/* Version A Dropdown */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Source Version (Baseline)</label>
            <div className="relative">
              <select
                value={compareSourceId}
                onChange={(e) => setCompareSourceId(e.target.value)}
                className="text-xs font-bold text-slate-800 bg-[#FBFBF9] border border-brand-border rounded-lg pl-3 pr-8 py-2 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-950 w-full"
              >
                <option value="baseline_draft">Baseline Original Draft</option>
                {allAnalyses.filter(a => a.id !== compareTargetId).map(a => (
                  <option key={a.id} value={a.id}>{a.resumeFileName.substring(0, 24)}... (ATS: {a.scores.atsScore}%)</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center justify-center shrink-0 pt-4 sm:pt-0">
            <ArrowRight className="h-4.5 w-4.5 text-slate-400 rotate-90 sm:rotate-0" />
          </div>

          {/* Version B Dropdown */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Evolved Version (Target)</label>
            <div className="relative">
              <select
                value={compareTargetId}
                onChange={(e) => setCompareTargetId(e.target.value)}
                className="text-xs font-bold text-slate-800 bg-[#FBFBF9] border border-brand-border rounded-lg pl-3 pr-8 py-2 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-950 w-full"
              >
                <option value="active">Active Improved Resume ({target.title.substring(0, 18)}...)</option>
                {allAnalyses.filter(a => a.id !== compareSourceId).map(a => (
                  <option key={a.id} value={a.id}>{a.resumeFileName.substring(0, 24)}... (ATS: {a.scores.atsScore}%)</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="text-right hidden md:block">
          <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold font-mono px-2.5 py-1.5 rounded-full uppercase tracking-wider">
            Optimized Sync Active
          </span>
        </div>
      </div>

      {/* Delta Score Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Semantic Alignment', start: source.scores.semanticMatch, delta: deltas.semanticMatch, end: target.scores.semanticMatch, icon: <Brain className="h-4 w-4" /> },
          { label: 'Recruiter Confidence', start: source.scores.hiringConfidence, delta: deltas.hiringConfidence, end: target.scores.hiringConfidence, icon: <Award className="h-4 w-4" /> },
          { label: 'Engineering Maturity', start: source.scores.engineeringMaturity, delta: deltas.engineeringMaturity, end: target.scores.engineeringMaturity, icon: <Sliders className="h-4 w-4" /> },
          { label: 'Keyword Coverage', start: source.scores.keywordCoverage, delta: deltas.keywordCoverage, end: target.scores.keywordCoverage, icon: <Compass className="h-4 w-4" /> },
          { label: 'Interview Readiness', start: source.scores.clarity, delta: deltas.clarity, end: target.scores.clarity, icon: <Activity className="h-4 w-4" /> },
          { label: 'Overall ATS Score', start: source.scores.atsScore, delta: deltas.atsScore, end: target.scores.atsScore, icon: <ShieldCheck className="h-4 w-4" /> },
        ].map((card, idx) => (
          <div key={idx} className="bg-white border border-brand-border rounded-xl p-4 shadow-3xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider leading-none text-slate-400 truncate pr-2">{card.label}</span>
              <span className="text-slate-600 shrink-0">{card.icon}</span>
            </div>

            <div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-base font-bold text-slate-900 font-mono">{card.end}%</span>
                <span className="text-[10px] text-slate-400 font-mono">from {card.start}%</span>
              </div>
              <span className={`text-[10px] font-bold mt-1.5 inline-flex items-center px-1.5 py-0.5 rounded font-mono ${card.delta >= 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                {card.delta >= 0 ? `+${card.delta}%` : `${card.delta}%`} Growth
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Grid of Progression Chart & Strategic Review */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Progression chart */}
        <div className="lg:col-span-3 bg-white border border-brand-border rounded-xl p-5 shadow-xs flex flex-col justify-between min-h-[350px]">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center mb-1">
              <TrendingUp className="h-4 w-4 mr-2 text-slate-700" />
              Evolution Vector Comparison
            </h3>
            <p className="text-[10px] text-slate-400">Comparing core readiness thresholds between source and target iterations.</p>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceRadarData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="subject" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 600 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#64748b' }} />
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: 10, fontWeight: 500 }} />
                <Bar dataKey="Source" fill="#94a3b8" radius={[3, 3, 0, 0]} name={source.title.substring(0, 16) + "..."} />
                <Bar dataKey="Target" fill="#0f172a" radius={[3, 3, 0, 0]} name={target.title.substring(0, 16) + "..."} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Intelligence strategic report */}
        <div className="lg:col-span-2 bg-white border border-brand-border rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center mb-1">
                <Sparkles className="h-4.5 w-4.5 mr-2 text-slate-800 animate-pulse" />
                Strategic Evolution Summary
              </h3>
              <p className="text-[10px] text-slate-400">Expert summary on alignment quality and growth vector trajectory.</p>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
              <p className="text-justify">
                By replacing shallow, action-deficient technical tags with high-fidelity, quantified system design achievements, the candidate has elevated their profile to a true <span className="font-bold text-slate-900">Senior Staff Backend Engineer</span> classification.
              </p>
              <p className="text-justify">
                The target resume iteration demonstrates deep hands-on concurrency credentials (<span className="font-mono text-[10px] font-bold text-slate-800 bg-slate-150 px-1.5 py-0.5 rounded">15,000+ RPS Kafka</span>) and practical database offloading thresholds, yielding an exceptional <span className="font-bold text-slate-900">+{deltas.hiringConfidence}%</span> jump in our recruitment score model.
              </p>
              <p className="text-justify">
                <span className="font-bold text-slate-900">Strategic Next Step:</span> To bridge the remaining <span className="font-bold text-slate-900">-{target.scores.keywordCoverage === 100 ? 0 : 100 - target.scores.keywordCoverage}%</span> keyword gaps, configure the learning roadmap in Month 1 to tackle Terraform workspaces and AWS networking parameters.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-brand-border/60 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <span>Audit Date: {new Date().toLocaleDateString()}</span>
            <span>Version Index: V2.1</span>
          </div>
        </div>

      </div>

      {/* Side-by-Side Bullet Point Evolution List */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center mb-1">
            <GitCompare className="h-4.5 w-4.5 mr-2 text-slate-700" />
            Detailed Semantic Bullet Evolution
          </h3>
          <p className="text-xs text-slate-500">Track how specific experiences transitioned from loose baseline drafts into quantified technical alignment results.</p>
        </div>

        <div className="space-y-4">
          {bulletEvolution.map((bullet, idx) => (
            <div key={idx} className="bg-white border border-brand-border rounded-xl shadow-3xs overflow-hidden">
              <div className="bg-[#FBFBF9] px-4 py-2.5 border-b border-brand-border flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-wider">// Experience Bullet #{idx + 1} Evolution</span>
                <span className="text-[9px] bg-slate-900 text-white font-bold font-mono px-2 py-0.5 rounded">
                  Impact: +{bullet.scoreIncrease}%
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-brand-border text-xs">
                {/* Draft */}
                <div className="p-4 space-y-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Baseline Draft version</span>
                  <p className="p-3 bg-red-50 text-rose-950 font-medium leading-relaxed rounded-lg border border-rose-100">
                    "{bullet.original}"
                  </p>
                </div>
                {/* Evolved */}
                <div className="p-4 space-y-2 bg-[#FBFBF9]/30">
                  <span className="text-[9px] font-bold text-slate-900 uppercase tracking-wider block">Evolved Target version</span>
                  <p className="p-3 bg-emerald-50 text-emerald-950 font-bold leading-relaxed rounded-lg border border-emerald-100">
                    "{bullet.improved}"
                  </p>
                  <p className="text-[10px] text-slate-500 bg-white p-2 border border-brand-border rounded-lg leading-relaxed mt-1.5">
                    <span className="font-bold text-slate-800">Evolution Vector:</span> {bullet.semanticAddition}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
