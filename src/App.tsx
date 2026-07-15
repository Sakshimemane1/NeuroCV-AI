import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  LayoutDashboard, 
  Sparkles, 
  ShieldAlert, 
  GraduationCap, 
  HelpCircle, 
  LogOut, 
  User as UserIcon, 
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
  ChevronRight,
  UserCheck,
  FileText,
  GitCompare
} from 'lucide-react';

import AuthView from './components/AuthView';
import Dashboard from './components/Dashboard';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import RecruiterSimulation from './components/RecruiterSimulation';
import SkillGapView from './components/SkillGapView';
import InterviewPrep from './components/InterviewPrep';
import RoadmapView from './components/RoadmapView';
import ResumeImprovementView from './components/ResumeImprovementView';
import ResumeDocPreview from './components/ResumeDocPreview';
import ResumeEvolution from './components/ResumeEvolution';

import { User, Analysis, ResumeVersion } from './types';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('neurocv_token'));
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Analyses state
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);
  const [resumes, setResumes] = useState<ResumeVersion[]>([]);
  const [showResumePreview, setShowResumePreview] = useState<boolean>(true);
  
  // App initialization state
  const [initializing, setInitializing] = useState(true);

  // Load user from localStorage and fetch history on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('neurocv_user');
    const storedToken = localStorage.getItem('neurocv_token');
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (e) {
        console.error("Error loading user from localStorage");
        handleLogOut();
      }
    }
    setInitializing(false);
  }, []);

  // Fetch analysis history when token changes
  useEffect(() => {
    if (token) {
      fetchHistory();
    } else {
      setAnalyses([]);
      setSelectedAnalysis(null);
      setResumes([]);
    }
  }, [token]);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/analysis-history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json() as Analysis[];
        setAnalyses(data);
        
        // Default to the most recent analysis for detailed tabs
        if (data.length > 0) {
          setSelectedAnalysis(data[0]);
          
          // Populate resumes versions list based on analyses
          const uniqueResumes: ResumeVersion[] = [];
          const seenIds = new Set<string>();
          data.forEach(analysis => {
            if (analysis.resumeId && !seenIds.has(analysis.resumeId)) {
              seenIds.add(analysis.resumeId);
              uniqueResumes.push({
                id: analysis.resumeId,
                userId: analysis.userId,
                fileName: analysis.resumeFileName,
                fileType: 'application/pdf',
                uploadedAt: analysis.createdAt
              });
            }
          });
          setResumes(uniqueResumes);
        }
      }
    } catch (err) {
      console.error("Error fetching analysis history: ", err);
    }
  };

  const handleAuthSuccess = (data: { token: string; user: User }) => {
    localStorage.setItem('neurocv_token', data.token);
    localStorage.setItem('neurocv_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    setActiveTab('dashboard');
  };

  const handleLogOut = () => {
    localStorage.removeItem('neurocv_token');
    localStorage.removeItem('neurocv_user');
    setToken(null);
    setUser(null);
    setAnalyses([]);
    setSelectedAnalysis(null);
    setResumes([]);
    setActiveTab('dashboard');
  };

  const handleSelectAnalysis = (analysis: Analysis) => {
    setSelectedAnalysis(analysis);
    setActiveTab('recruiter'); // Switch to details automatically
  };

  const handleNewResumeUploaded = (newResume: ResumeVersion) => {
    setResumes(prev => [newResume, ...prev]);
  };

  const handleAnalysisSuccess = (newAnalysis: Analysis) => {
    setAnalyses(prev => [newAnalysis, ...prev]);
    setSelectedAnalysis(newAnalysis);
    setActiveTab('recruiter'); // Switch tab immediately to show results
  };

  const handleUpdateRoadmap = (updatedRoadmap: any[]) => {
    if (selectedAnalysis) {
      const updatedAnalysis = {
        ...selectedAnalysis,
        roadmap: updatedRoadmap
      };
      setSelectedAnalysis(updatedAnalysis);
      setAnalyses(prev => prev.map(a => a.id === updatedAnalysis.id ? updatedAnalysis : a));
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600 mx-auto" />
          <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase">Loading NeuroCV AI Engine...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show modern Vercel-style Auth page
  if (!token || !user) {
    return <AuthView onAuthSuccess={handleAuthSuccess} />;
  }

  const analysisTabs = [
    { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'analyze', label: 'Analysis Workspace', icon: <Zap className="h-4 w-4" /> },
    { id: 'recruiter', label: 'Recruiter Simulation', icon: <UserCheck className="h-4 w-4" />, disabled: !selectedAnalysis },
    { id: 'skillgap', label: 'Skill Intelligence', icon: <SlidersHorizontal className="h-4 w-4" />, disabled: !selectedAnalysis },
  ];

  const preparationTabs = [
    { id: 'improvements', label: 'Resume Optimizer', icon: <Sparkles className="h-4 w-4" />, disabled: !selectedAnalysis },
    { id: 'evolution', label: 'Resume Evolution', icon: <GitCompare className="h-4 w-4" />, disabled: !selectedAnalysis },
    { id: 'interview', label: 'Interview Preparation', icon: <HelpCircle className="h-4 w-4" />, disabled: !selectedAnalysis },
    { id: 'roadmap', label: 'Career Roadmap', icon: <GraduationCap className="h-4 w-4" />, disabled: !selectedAnalysis },
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans flex flex-col antialiased">
      {/* Premium Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo and Branding */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-900 rounded-md flex items-center justify-center shadow-sm shrink-0">
                <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="font-semibold tracking-tight text-lg text-slate-900">NeuroCV AI</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 border border-brand-border px-1.5 py-0.5 rounded">
                  Enterprise
                </span>
              </div>
            </div>

            {/* Right side user menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2.5 border-r border-brand-border pr-4">
                <div className="h-8 w-8 rounded-full bg-slate-100 border border-brand-border flex items-center justify-center text-slate-800 font-bold text-xs">
                  {user.name.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-slate-800 leading-none">{user.name}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{user.title || 'Backend Engineer'}</p>
                </div>
              </div>

              <button
                onClick={handleLogOut}
                className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                id="header-logout-btn"
              >
                <LogOut className="h-4 w-4 mr-1.5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        {/* Left Side Sidebar: Vertical Tab Navigation */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-24 bg-white border border-brand-border rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] p-4 space-y-4">
            
            {/* ANALYSIS SEGMENT */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-3 pb-1 border-b border-brand-border/40 font-mono">
                Analysis
              </span>
              <nav className="space-y-0.5 pt-1" id="vertical-navigation-tabs-analysis">
                {analysisTabs.map((tab) => (
                  <button
                    key={tab.id}
                    disabled={tab.disabled}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-slate-150 text-slate-900 font-bold border border-brand-border/40 shadow-3xs'
                        : tab.disabled
                        ? 'text-slate-300 cursor-not-allowed opacity-50'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/70'
                    }`}
                    id={`nav-tab-${tab.id}`}
                  >
                    <div className="flex items-center space-x-2.5">
                      {tab.icon}
                      <span>{tab.label}</span>
                    </div>
                    {!tab.disabled && activeTab !== tab.id && (
                      <ChevronRight className="h-3 w-3 text-slate-300 opacity-0 group-hover:opacity-100 transition" />
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* PREPARATION SEGMENT */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-3 pb-1 border-b border-brand-border/40 font-mono">
                Preparation
              </span>
              <nav className="space-y-0.5 pt-1" id="vertical-navigation-tabs-preparation">
                {preparationTabs.map((tab) => (
                  <button
                    key={tab.id}
                    disabled={tab.disabled}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-slate-150 text-slate-900 font-bold border border-brand-border/40 shadow-3xs'
                        : tab.disabled
                        ? 'text-slate-300 cursor-not-allowed opacity-50'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/70'
                    }`}
                    id={`nav-tab-${tab.id}`}
                  >
                    <div className="flex items-center space-x-2.5">
                      {tab.icon}
                      <span>{tab.label}</span>
                    </div>
                    {!tab.disabled && activeTab !== tab.id && (
                      <ChevronRight className="h-3 w-3 text-slate-300 opacity-0 group-hover:opacity-100 transition" />
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Displaying active resume context inside sidebar if selected */}
            {selectedAnalysis && (
              <div className="mt-4 pt-4 border-t border-brand-border/60 space-y-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block px-3 font-mono">
                  Current Analysis
                </span>
                <div className="px-3 py-2 bg-slate-50 border border-brand-border rounded-lg">
                  <p className="text-[10px] font-bold text-slate-700 truncate">
                    {selectedAnalysis.resumeFileName}
                  </p>
                  <div className="flex items-center justify-between mt-1.5 font-mono text-[9px]">
                    <span className="text-slate-400">
                      Readiness: <span className="font-bold text-slate-900">{selectedAnalysis.scores.atsScore}%</span>
                    </span>
                    <span className="text-slate-400">
                      Semantic: <span className="font-bold text-slate-800">{selectedAnalysis.scores.semanticMatch}%</span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Right Side Frame: Interactive Tab Body */}
        <section className="flex-1 min-w-0" id="workbench-body-container">
          {activeTab !== 'dashboard' && activeTab !== 'analyze' && selectedAnalysis && (
            <div className="flex items-center justify-between mb-4 bg-white border border-brand-border px-4 py-2.5 rounded-lg text-xs">
              <span className="text-slate-500 font-medium">
                Compare original resume draft with AI recommendations side-by-side:
              </span>
              <button
                onClick={() => setShowResumePreview(!showResumePreview)}
                className="font-bold text-slate-800 hover:text-slate-950 flex items-center bg-[#FBFBF9] border border-brand-border hover:bg-slate-50 px-2.5 py-1.5 rounded transition cursor-pointer"
                id="toggle-resume-preview-btn"
              >
                <FileText className="h-3.5 w-3.5 mr-1.5 text-slate-700" />
                {showResumePreview ? "Hide Resume Preview" : "Show Resume Preview"}
              </button>
            </div>
          )}

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === 'dashboard' && (
              <Dashboard 
                user={user} 
                analyses={analyses} 
                onSelectAnalysis={handleSelectAnalysis}
                onNavigateToTab={setActiveTab}
              />
            )}
            
            {activeTab === 'analyze' && (
              <ResumeAnalyzer 
                resumes={resumes}
                onUploadSuccess={handleNewResumeUploaded}
                onAnalysisSuccess={handleAnalysisSuccess}
              />
            )}

            {/* Split layout wrapper for detailed intelligence sub-views */}
            {activeTab !== 'dashboard' && activeTab !== 'analyze' && (
              <div className="flex flex-col lg:flex-row gap-6 items-stretch">
                <div className="flex-1 min-w-0">
                  {activeTab === 'recruiter' && (
                    <RecruiterSimulation analysis={selectedAnalysis} />
                  )}
                  
                  {activeTab === 'skillgap' && (
                    <SkillGapView analysis={selectedAnalysis} />
                  )}
                  
                  {activeTab === 'improvements' && (
                    <ResumeImprovementView analysis={selectedAnalysis} />
                  )}
                  
                  {activeTab === 'evolution' && (
                    <ResumeEvolution 
                      analysis={selectedAnalysis} 
                      allAnalyses={analyses}
                    />
                  )}
                  
                  {activeTab === 'interview' && (
                    <InterviewPrep analysis={selectedAnalysis} />
                  )}
                  
                  {activeTab === 'roadmap' && (
                    <RoadmapView 
                      analysis={selectedAnalysis} 
                      onUpdateRoadmap={handleUpdateRoadmap}
                    />
                  )}
                </div>
                {showResumePreview && selectedAnalysis && (
                  <div className="w-full lg:w-[420px] xl:w-[480px] shrink-0 self-start sticky top-24">
                    <ResumeDocPreview analysis={selectedAnalysis} />
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="bg-white border-t border-brand-border py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} NeuroCV AI Inc. Enterprise Career Intelligence Systems. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
