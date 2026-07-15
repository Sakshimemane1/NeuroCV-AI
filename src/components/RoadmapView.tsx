import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, 
  CheckCircle2, 
  ChevronRight, 
  GraduationCap, 
  PlayCircle, 
  Sparkles, 
  CheckSquare,
  Square,
  Clock,
  BookOpen
} from 'lucide-react';
import { Analysis, RoadmapMilestone } from '../types';

interface RoadmapViewProps {
  analysis: Analysis | null;
  onUpdateRoadmap: (updatedRoadmap: RoadmapMilestone[]) => void;
}

export default function RoadmapView({ analysis, onUpdateRoadmap }: RoadmapViewProps) {
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  
  // Local subtask check states stored in localStorage by analysis ID to allow true interactive capability
  const [checkedSubtasks, setCheckedSubtasks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (analysis) {
      const stored = localStorage.getItem(`neurocv_roadmap_tasks_${analysis.id}`);
      if (stored) {
        try {
          setCheckedSubtasks(JSON.parse(stored));
        } catch (e) {
          setCheckedSubtasks({});
        }
      } else {
        setCheckedSubtasks({});
      }
    }
  }, [analysis]);

  if (!analysis) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-12 text-center space-y-4 font-sans">
        <GraduationCap className="h-10 w-10 text-slate-400 mx-auto animate-pulse" />
        <p className="text-sm font-semibold text-slate-800">No Analysis Loaded</p>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Please run a Career Intelligence comparison on the Compare tab to synthesize your personal 3-month career curriculum.
        </p>
      </div>
    );
  }

  const roadmap = analysis.roadmap || [];

  const handleStatusChange = (milestoneIdx: number, topicIdx: number, currentStatus: string) => {
    const nextStatusMap: Record<string, 'Not Started' | 'In Progress' | 'Completed'> = {
      'Not Started': 'In Progress',
      'In Progress': 'Completed',
      'Completed': 'Not Started'
    };

    const updatedRoadmap = JSON.parse(JSON.stringify(roadmap));
    updatedRoadmap[milestoneIdx].topics[topicIdx].status = nextStatusMap[currentStatus];
    
    onUpdateRoadmap(updatedRoadmap);
  };

  const toggleSubtask = (key: string) => {
    const updated = { ...checkedSubtasks, [key]: !checkedSubtasks[key] };
    setCheckedSubtasks(updated);
    localStorage.setItem(`neurocv_roadmap_tasks_${analysis.id}`, JSON.stringify(updated));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-150';
      case 'In Progress':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />;
      case 'In Progress':
        return <PlayCircle className="h-4.5 w-4.5 text-amber-500 shrink-0 animate-pulse" />;
      default:
        return <div className="h-4.5 w-4.5 rounded-full border border-slate-350 shrink-0" />;
    }
  };

  // Static high-impact checklist steps generated dynamically based on topic categories
  const getSubtasksForTopic = (topicName: string) => {
    const name = topicName.toLowerCase();
    if (name.includes('api') || name.includes('backend') || name.includes('fastapi')) {
      return [
        "Implement secure JWT-based OAuth2 authentication middleware",
        "Structure clean controller endpoints adhering to RESTful standards",
        "Introduce token-bucket API rate limiting to safeguard routing boundaries",
        "Execute automated load tests with locust verifying sub-second latency targets"
      ];
    }
    if (name.includes('database') || name.includes('cache') || name.includes('redis') || name.includes('postgres')) {
      return [
        "Audit slow SQL query bottlenecks using postgres EXPLAIN ANALYZE commands",
        "Formulate multi-column composite B-Tree indexes for critical filter keys",
        "Deploy a Redis-based cache-aside caching pattern on heavy query loads",
        "Establish alembic database migration scripts for declarative schema versioning"
      ];
    }
    if (name.includes('kafka') || name.includes('distributed') || name.includes('stream')) {
      return [
        "Configure an Apache Kafka message producer utilizing custom partitioning keys",
        "Formulate redundant consumer groups to ensure high throughput load distribution",
        "Deploy dead-letter queues (DLQ) covering message deserialization exception loops",
        "Introduce client-side backpressure thresholds avoiding stream consumer starvation"
      ];
    }
    if (name.includes('cloud') || name.includes('ops') || name.includes('infrastructure') || name.includes('terraform')) {
      return [
        "Draft declarative Terraform scripts provisioning security groups and VPC subnets",
        "Dockerize the main backend code with secure, multi-stage alpine images",
        "Configure Kubernetes pods containing strict resource limits (CPU/Memory)",
        "Introduce Prometheus scrape hooks monitoring container performance parameters"
      ];
    }
    return [
      "Review official documentation and core design standards",
      "Draft local test mock specs verifying system boundary handling",
      "Deploy a proof-of-concept module and execute profiling exercises",
      "Quantify performance improvements (QPS, memory, throughput) inside developer logs"
    ];
  };

  return (
    <div className="space-y-8 font-sans text-brand-text">
      <div className="border-b border-brand-border pb-4">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center" id="roadmap-heading">
          <BookOpen className="h-5 w-5 mr-2 text-slate-800" />
          Enterprise Engineering Career Learning Roadmap
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          A granular 3-month action syllabus designed specifically to close critical skill gaps and align your credentials with standard enterprise expectations.
        </p>
      </div>

      {/* Progress summary banner */}
      <div className="bg-[#FBFBF9] p-6 border border-brand-border rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-[8px] bg-slate-900 text-white font-bold font-mono px-1.5 py-0.5 rounded uppercase tracking-wider">
            Curriculum Tracker
          </span>
          <h2 className="text-sm font-bold text-slate-950 uppercase tracking-tight mt-1.5">Accelerate role-readiness metrics</h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
            Advance categories dynamically by clicking on status buttons. Expand cards below to trace specific, actionable checklists and check off individual milestones.
          </p>
        </div>

        {/* Dynamic progress bar */}
        <div className="w-full md:w-64 shrink-0 bg-white p-4 border border-brand-border rounded-xl shadow-xs space-y-1.5">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-650">
            <span>Syllabus Progress</span>
            <span className="text-slate-950 font-bold font-mono">
              {Math.round((roadmap.reduce((acc, cur) => acc + cur.topics.filter(t => t.status === 'Completed').length, 0) / 
                          Math.max(1, roadmap.reduce((acc, cur) => acc + cur.topics.length, 0))) * 100)}% Done
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-slate-900 h-1.5 rounded-full transition-all duration-300"
              style={{
                width: `${(roadmap.reduce((acc, cur) => acc + cur.topics.filter(t => t.status === 'Completed').length, 0) / 
                          Math.max(1, roadmap.reduce((acc, cur) => acc + cur.topics.length, 0))) * 100}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Roadmap Timeline */}
      <div className="relative border-l-2 border-brand-border ml-4 pl-6 md:pl-8 py-2 space-y-10" id="roadmap-timeline">
        {roadmap.map((milestone, mIdx) => (
          <div key={mIdx} className="relative">
            {/* Circle Node Icon */}
            <span className="absolute -left-[45px] md:-left-[49px] top-1 bg-white border-2 border-slate-900 h-8 w-8 rounded-full shadow-xs flex items-center justify-center text-slate-900 font-bold text-xs font-mono">
              M{mIdx + 1}
            </span>

            {/* Content box */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider" id={`milestone-month-header-${mIdx}`}>
                  {milestone.month}
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">
                  DURATION: 30 DAYS &bull; DEDICATED WORK: 4-6 HOURS WEEKLY
                </p>
              </div>

              {/* Grid of topic cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {milestone.topics.map((topic, tIdx) => {
                  const uniqueKey = `${mIdx}-${tIdx}`;
                  const isExpanded = expandedTopic === uniqueKey;
                  const topicSubtasks = getSubtasksForTopic(topic.name);
                  
                  return (
                    <div
                      key={tIdx}
                      className={`bg-white border rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] p-5 flex flex-col justify-between cursor-pointer hover:border-slate-350 transition duration-150 ${isExpanded ? 'border-slate-900 ring-1 ring-slate-900/5' : 'border-brand-border'}`}
                      onClick={() => setExpandedTopic(isExpanded ? null : uniqueKey)}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(mIdx, tIdx, topic.status);
                            }}
                            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 text-[9px] font-bold border rounded-lg transition-all cursor-pointer font-sans`}
                          >
                            {getStatusIcon(topic.status)}
                            <span className="uppercase tracking-wider font-mono">{topic.status}</span>
                          </button>
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-slate-900">
                            {topic.name}
                          </h4>
                          <p className={`text-xs text-slate-500 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                            {topic.details}
                          </p>
                        </div>

                        {/* Expandable checklists block */}
                        {isExpanded && (
                          <div className="pt-3.5 border-t border-brand-border/60 space-y-3">
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block font-mono flex items-center">
                              <CheckSquare className="h-3 w-3 mr-1 text-slate-500" /> Specific, Actionable Roadmap Steps
                            </span>
                            
                            <div className="space-y-2">
                              {topicSubtasks.map((step, sIdx) => {
                                const subtaskKey = `${analysis.id}-${mIdx}-${tIdx}-${sIdx}`;
                                const isChecked = checkedSubtasks[subtaskKey] || false;
                                return (
                                  <div 
                                    key={sIdx}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSubtask(subtaskKey);
                                    }}
                                    className="flex items-start space-x-2.5 p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                                  >
                                    <div className="shrink-0 mt-0.5">
                                      {isChecked ? (
                                        <CheckSquare className="h-4 w-4 text-slate-900 fill-slate-950/5" />
                                      ) : (
                                        <Square className="h-4 w-4 text-slate-300" />
                                      )}
                                    </div>
                                    <span className={`text-[11px] leading-relaxed ${isChecked ? 'text-slate-400 line-through' : 'text-slate-600 font-medium'}`}>
                                      {step}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center text-[9px] font-bold text-slate-900 uppercase tracking-widest mt-4 pt-3 border-t border-slate-50/80 select-none font-mono">
                        {isExpanded ? 'Collapse Block' : 'Show Syllabus Tasks'}
                        <ChevronRight className={`h-3.5 w-3.5 ml-1 transition duration-150 ${isExpanded ? 'rotate-90' : ''}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
