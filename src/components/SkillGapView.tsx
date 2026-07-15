import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Target, CheckCircle2, AlertTriangle, Lightbulb, Grid, HelpCircle, LayoutGrid, BarChart2 } from 'lucide-react';
import { Analysis } from '../types';
import React, { useState } from 'react';

interface SkillGapViewProps {
  analysis: Analysis | null;
}

export default function SkillGapView({ analysis }: SkillGapViewProps) {
  const [activeChart, setActiveChart] = useState<'radar' | 'bars'>('radar');

  if (!analysis) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-12 text-center space-y-4 font-sans">
        <LayoutGrid className="h-10 w-10 text-slate-400 mx-auto" />
        <p className="text-sm font-semibold text-slate-800">No Analysis Loaded</p>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Please run a Career Intelligence comparison on the Compare tab to map technical skill scores.
        </p>
      </div>
    );
  }

  const { skillGap, scores } = analysis;

  // Compile visual data for Recharts Radar chart based on analysis scores
  const radarData = [
    {
      subject: 'Distributed Design',
      Candidate: scores.engineeringMaturity,
      Requirement: 90,
      fullMark: 100,
    },
    {
      subject: 'Languages & Core',
      Candidate: Math.round((scores.semanticMatch + scores.keywordCoverage) / 2),
      Requirement: 85,
      fullMark: 100,
    },
    {
      subject: 'Databases & Cache',
      Candidate: Math.min(100, scores.atsScore + 5),
      Requirement: 80,
      fullMark: 100,
    },
    {
      subject: 'Cloud & Container',
      Candidate: Math.max(40, scores.engineeringMaturity - 15),
      Requirement: 85,
      fullMark: 100,
    },
    {
      subject: 'System Quality',
      Candidate: scores.clarity,
      Requirement: 80,
      fullMark: 100,
    },
    {
      subject: 'Advanced (AI/RAG)',
      Candidate: skillGap.matchedSkills.some(s => s.toLowerCase().includes('langchain') || s.toLowerCase().includes('openai')) ? 90 : 30,
      Requirement: 70,
      fullMark: 100,
    }
  ];

  const barChartData = [
    { name: 'APIs', Candidate: Math.round((scores.semanticMatch + scores.keywordCoverage) / 2), Requirement: 85 },
    { name: 'Database', Candidate: Math.min(100, scores.atsScore + 5), Requirement: 80 },
    { name: 'Cloud/Ops', Candidate: Math.max(40, scores.engineeringMaturity - 15), Requirement: 85 },
    { name: 'Reliability', Candidate: scores.clarity, Requirement: 80 },
    { name: 'AI/RAG', Candidate: skillGap.matchedSkills.some(s => s.toLowerCase().includes('langchain') || s.toLowerCase().includes('openai')) ? 90 : 30, Requirement: 70 }
  ];

  // Grid / Heatmap Matrix representation
  // Group standard skills into backend categories
  const categories = [
    {
      name: "API Development",
      description: "High-throughput API endpoints & protocol schemas",
      skills: ["FastAPI", "Spring Boot", "REST", "gRPC", "GraphQL", "Go"],
    },
    {
      name: "Database Engineering",
      description: "Relational tuning, in-memory cache, and index optimization",
      skills: ["PostgreSQL", "Redis", "Elasticsearch", "DynamoDB", "MySQL", "MongoDB"],
    },
    {
      name: "Distributed Systems",
      description: "Asynchronous stream buses and message delivery guarantees",
      skills: ["Apache Kafka", "RabbitMQ", "Event Streams", "Concurrency", "SQS", "Idempotency"],
    },
    {
      name: "Cloud Infrastructure",
      description: "Secure, highly available container nodes & cloud boundaries",
      skills: ["AWS", "Kubernetes", "ECS", "S3 Storage", "VPC Networking", "IAM Rules"],
    },
    {
      name: "DevOps",
      description: "Declarative server configuration & automated deploy code",
      skills: ["Docker", "Terraform", "GitHub Actions", "CI/CD", "Bash Scripts", "Prometheus"],
    },
    {
      name: "Testing",
      description: "Quality assurance suites, code coverage thresholds, and mocks",
      skills: ["PyTest", "JUnit", "Unit Testing", "Code Coverage", "SLA Verification", "Mocks"],
    },
    {
      name: "System Design",
      description: "Microservices design patterns & operational resilience",
      skills: ["Microservices", "Load Balancing", "Failover", "Rate Limiting", "Circuit Breaker", "gRPC"],
    },
    {
      name: "AI Engineering",
      description: "Vector search pipelines & smart agentic integrations",
      skills: ["OpenAI API", "LangChain RAG", "Embeddings", "Vector Databases", "Prompt Tuning", "LLM Pipelines"],
    }
  ];

  const checkSkillStatus = (skillName: string) => {
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normName = normalize(skillName);
    
    // Check if matched
    if (skillGap.matchedSkills.some(s => normalize(s).includes(normName) || normName.includes(normalize(s)))) {
      return 'matched';
    }
    // Check if missing
    if (skillGap.missingSkills.some(s => normalize(s).includes(normName) || normName.includes(normalize(s)))) {
      return 'missing';
    }
    // Check if recommended
    if (skillGap.recommendedSkills.some(s => normalize(s).includes(normName) || normName.includes(normalize(s)))) {
      return 'recommended';
    }
    return 'unlisted';
  };

  return (
    <div className="space-y-8 font-sans text-brand-text">
      <div className="border-b border-brand-border pb-4">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight" id="skill-gap-heading">
          Technical Skill Gap & Semantic Matrix
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Vector space mapping of candidate resume credentials against the target job requirements across distributed categories.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column: Recharts Radar or Bar Chart with Switcher */}
        <div className="lg:col-span-2 bg-white border border-brand-border rounded-xl p-5 shadow-[0_2px_4px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[350px]">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center mb-1">
                {activeChart === 'radar' ? (
                  <Target className="h-4 w-4 mr-2 text-slate-600" />
                ) : (
                  <BarChart2 className="h-4 w-4 mr-2 text-slate-600" />
                )}
                {activeChart === 'radar' ? "Competency Alignment Radar" : "Domain Match Depth"}
              </h3>
              <p className="text-[10px] text-slate-400">
                {activeChart === 'radar' 
                  ? "Visual mapping of skill coverage dimensions."
                  : "Match strength by core backend engineering domain."}
              </p>
            </div>

            {/* Switcher Controls */}
            <div className="flex items-center space-x-1 bg-slate-100/70 border border-brand-border p-0.5 rounded-lg select-none">
              <button
                onClick={() => setActiveChart('radar')}
                className={`text-[9px] font-bold px-1.5 py-1 rounded transition cursor-pointer ${activeChart === 'radar' ? 'bg-white text-slate-950 shadow-[0_1px_3px_rgba(0,0,0,0.05)]' : 'text-slate-500 hover:text-slate-950'}`}
              >
                Radar
              </button>
              <button
                onClick={() => setActiveChart('bars')}
                className={`text-[9px] font-bold px-1.5 py-1 rounded transition cursor-pointer ${activeChart === 'bars' ? 'bg-white text-slate-950 shadow-[0_1px_3px_rgba(0,0,0,0.05)]' : 'text-slate-500 hover:text-slate-950'}`}
              >
                Bars
              </button>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {activeChart === 'radar' ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
                  <PolarGrid stroke="#E5E5E1" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#1A1A1A', fontSize: 9, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#A3A39E' }} />
                  <Radar name="My Profile" dataKey="Candidate" stroke="#1A1A1A" fill="#1A1A1A" fillOpacity={0.12} />
                  <Radar name="Target Mandate" dataKey="Requirement" stroke="#E54876" fill="#FDA4AF" fillOpacity={0.04} />
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: 10, fontWeight: 500 }} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 600 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#64748b' }} />
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: 10, fontWeight: 500 }} />
                  <Bar dataKey="Candidate" fill="#0f172a" radius={[3, 3, 0, 0]} name="My Profile" />
                  <Bar dataKey="Requirement" fill="#f43f5e" radius={[3, 3, 0, 0]} name="Target Mandate" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right Column: Three Lists */}
        <div className="lg:col-span-3 space-y-4">
          {/* Matched */}
          <div className="bg-white border border-brand-border rounded-xl p-5 shadow-[0_2px_4px_rgba(0,0,0,0.02)] space-y-3">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-600" />
              Semantic Keyword Match ({skillGap.matchedSkills.length})
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {skillGap.matchedSkills.map((skill, index) => (
                <span key={index} className="text-[10px] px-2.5 py-1 bg-emerald-50 text-emerald-800 font-bold rounded-md border border-emerald-150">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Missing */}
          <div className="bg-white border border-brand-border rounded-xl p-5 shadow-[0_2px_4px_rgba(0,0,0,0.02)] space-y-3">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1.5 text-brand-pink-text" />
              Missing Hard requirements ({skillGap.missingSkills.length})
            </h3>
            {skillGap.missingSkills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {skillGap.missingSkills.map((skill, index) => (
                  <span key={index} className="text-[10px] px-2.5 py-1 bg-brand-pink-bg text-brand-pink-text font-bold rounded-md border border-brand-pink-border">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No core skill gaps unaddressed.</p>
            )}
          </div>

          {/* Recommended */}
          <div className="bg-white border border-brand-border rounded-xl p-5 shadow-[0_2px_4px_rgba(0,0,0,0.02)] space-y-3">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
              <Lightbulb className="h-4 w-4 mr-1.5 text-slate-700" />
              Recommended Extension tech ({skillGap.recommendedSkills.length})
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {skillGap.recommendedSkills.map((skill, index) => (
                <span key={index} className="text-[10px] px-2.5 py-1 bg-[#FBFBF9] text-slate-800 font-bold rounded-md border border-brand-border">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Heatmap Matrix */}
      <div className="bg-white border border-brand-border rounded-xl p-6 shadow-[0_2px_4px_rgba(0,0,0,0.02)] space-y-5" id="skill-gap-heatmap">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
            <Grid className="h-4 w-4 mr-2 text-slate-500" />
            Enterprise Backend Skill Coverage Matrix (Heatmap)
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Global standard capabilities heatmap. Colored labels denote active presence in resume, gaps, or optional extensions.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-6 pb-2 border-b border-brand-border text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <div className="flex items-center space-x-1.5">
            <div className="h-3 w-3 rounded-sm bg-slate-900" />
            <span>Matched in Resume</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="h-3 w-3 rounded-sm bg-brand-pink-text" />
            <span>Missing / Target Gap</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="h-3 w-3 rounded-sm bg-slate-400" />
            <span>Recommended Plus</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="h-3 w-3 rounded-sm bg-[#FBFBF9] border border-brand-border" />
            <span>Optional / Out of Scope</span>
          </div>
        </div>

        {/* Matrix Grid Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category, catIndex) => (
            <div key={catIndex} className="p-4 bg-[#FBFBF9] border border-brand-border rounded-xl space-y-3">
              <div>
                <h4 className="text-xs font-bold text-slate-850 uppercase tracking-wider">{category.name}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">{category.description}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {category.skills.map((skill, skillIndex) => {
                  const status = checkSkillStatus(skill);
                  let style = "bg-white text-slate-450 border border-brand-border";
                  if (status === 'matched') {
                    style = "bg-slate-900 text-white font-bold border border-slate-950";
                  } else if (status === 'missing') {
                    style = "bg-brand-pink-text text-white font-bold border border-brand-pink-border";
                  } else if (status === 'recommended') {
                    style = "bg-slate-400 text-white font-bold border border-slate-500";
                  }
                  return (
                    <div
                      key={skillIndex}
                      className={`px-2.5 py-2 rounded-lg text-center text-[10px] font-bold tracking-tight select-none flex items-center justify-center min-h-[36px] ${style}`}
                    >
                      {skill}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Competency Matrix (Categorized by Proficiency vs. Requirement Mappings) */}
      <div className="bg-white border border-brand-border rounded-xl p-6 shadow-[0_2px_4px_rgba(0,0,0,0.02)] space-y-5" id="skill-gap-competency-matrix">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
            <LayoutGrid className="h-4 w-4 mr-2 text-slate-700" />
            Core Competency Matrix (Proficiency vs. Role Mandate Mapping)
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Visual matrix plotting parsed technical skills by actual candidate experience depth (Expert, Proficient, Familiar) versus the target role constraints.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-200 text-xs">
            <thead>
              <tr className="bg-[#FBFBF9] border-b border-slate-200">
                <th className="p-3 border-r border-slate-200 text-slate-500 font-mono text-[10px] text-left uppercase tracking-wider w-[150px]">Proficiency</th>
                <th className="p-3 border-r border-slate-200 text-emerald-850 font-bold text-left uppercase tracking-wider">Matching (In Resume)</th>
                <th className="p-3 border-r border-slate-200 text-brand-pink-text font-bold text-left uppercase tracking-wider">Missing (Gaps)</th>
                <th className="p-3 text-slate-650 font-semibold text-left uppercase tracking-wider">Optional (Extensions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 border-r border-slate-200 bg-[#FBFBF9] font-mono text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-slate-900">Expert</span>
                </td>
                <td className="p-3 border-r border-slate-200">
                  <div className="flex flex-wrap gap-1.5">
                    {["PostgreSQL", "FastAPI", "Apache Kafka"].map((skill) => (
                      <span key={skill} className="text-[10px] px-2 py-0.5 bg-slate-900 text-white font-bold rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-3 border-r border-slate-200 text-slate-400 italic text-[10px]">
                  No high-priority Expert-level skills are flagged as missing.
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1.5">
                    {["Redis Caching", "REST APIs"].map((skill) => (
                      <span key={skill} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 font-medium rounded border border-slate-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 border-r border-slate-200 bg-[#FBFBF9] font-mono text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-slate-700">Proficient</span>
                </td>
                <td className="p-3 border-r border-slate-200">
                  <div className="flex flex-wrap gap-1.5">
                    {["Docker", "PyTest", "MySQL", "Git"].map((skill) => (
                      <span key={skill} className="text-[10px] px-2 py-0.5 bg-slate-800 text-white font-medium rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-3 border-r border-slate-200">
                  <div className="flex flex-wrap gap-1.5">
                    {["Kubernetes", "Terraform IaC"].map((skill) => (
                      <span key={skill} className="text-[10px] px-2 py-0.5 bg-brand-pink-bg text-brand-pink-text font-bold rounded border border-brand-pink-border">
                        {skill}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1.5">
                    {["Elasticsearch", "VPC Networking"].map((skill) => (
                      <span key={skill} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 font-medium rounded border border-slate-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 border-r border-slate-200 bg-[#FBFBF9] font-mono text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-slate-600">Familiar</span>
                </td>
                <td className="p-3 border-r border-slate-200">
                  <div className="flex flex-wrap gap-1.5">
                    {["Spring Boot", "Bash scripting"].map((skill) => (
                      <span key={skill} className="text-[10px] px-2 py-0.5 bg-slate-500 text-white rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-3 border-r border-slate-200">
                  <div className="flex flex-wrap gap-1.5">
                    {["GitHub Actions CI/CD"].map((skill) => (
                      <span key={skill} className="text-[10px] px-2 py-0.5 bg-brand-pink-bg text-brand-pink-text font-bold rounded border border-brand-pink-border">
                        {skill}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1.5">
                    {["LangChain RAG", "OpenAI API", "DynamoDB"].map((skill) => (
                      <span key={skill} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 font-medium rounded border border-slate-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
