"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Zap, Shuffle, Lightbulb, Globe, ChevronDown, 
  Sparkles, X, Check, Wand2, ArrowLeft, 
  History, PencilLine, BookOpen, Quote, Lock, 
  LayoutDashboard, FileText, BarChart3, RotateCcw, Loader, Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import PricingModal from "@/components/PricingModal";
import UserDropdown from "@/components/UserDropdown";
import GrammarLessonModal from "@/components/GrammarLessonModal";
import { fetchRuleByKey, GrammarRule } from "@/lib/grammarRules";
import FingerprintJS from '@fingerprintjs/fingerprintjs';// --- REFINED ANIMATIONS (CYAN THEME) ---
const enhancedStyles = `
  @keyframes clip-reveal {
    0% { clip-path: inset(0 100% 0 0); }
    100% { clip-path: inset(0 0 0 0); }
  }
  @keyframes scan-line {
    0% { left: 0%; opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { left: 100%; opacity: 0; }
  }
  @keyframes fade-in-up {
    0% { transform: translateY(10px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  @keyframes slide-in {
    0% { transform: translateX(-10px); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
  }
  @keyframes glow-pulse {
    0%, 100% { opacity: 0.2; }
    50% { opacity: 0.4; }
  }
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes float-up {
    0% { transform: translateY(0px); opacity: 1; }
    100% { transform: translateY(-100px); opacity: 0; }
  }
  @keyframes skeleton-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  @keyframes progress-bar {
    0% { width: 0%; }
    100% { width: 100%; }
  }
  @keyframes bounce-slow {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
  @keyframes rotate-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .animate-reveal-text {
    background-color: transparent; 
    will-change: clip-path;
    animation: clip-reveal 1.2s cubic-bezier(0.19, 1, 0.22, 1) forwards;
  }
  .animate-scan-line {
    position: absolute;
    top: 0; bottom: 0; width: 2px;
    background: linear-gradient(to bottom, transparent, #14b8a6, transparent);
    box-shadow: 0 0 15px 2px rgba(20, 184, 166, 0.5);
    z-index: 30;
    animation: scan-line 1.2s cubic-bezier(0.19, 1, 0.22, 1) forwards;
  }
  .animate-fade-in-up {
    animation: fade-in-up 0.4s ease-out forwards;
  }
  .animate-slide-in {
    animation: slide-in 0.5s ease-out forwards;
  }
  .glow-effect {
    animation: glow-pulse 3s ease-in-out infinite;
  }
  .shimmer-effect {
    background: linear-gradient(90deg, transparent, rgba(20, 184, 166, 0.1), transparent);
    background-size: 200% 100%;
    animation: shimmer 2s ease-in-out infinite;
  }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  .card-hover-lift {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .card-hover-lift:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  }
  @media (prefers-reduced-motion: reduce) {
    .animate-reveal-text,
    .animate-scan-line,
    .animate-fade-in-up,
    .animate-slide-in,
    .glow-effect,
    .shimmer-effect {
      animation: none !important;
    }
    .card-hover-lift,
    .card-hover-lift:hover {
      transition: none !important;
      transform: none !important;
      box-shadow: none !important;
    }
  }
`;

const SHORT_TOPICS = [
  "Should students be required to wear uniforms?",
  "Is technology making us lazy?",
  "Money cannot buy happiness. Do you agree?",
  "City life vs Countryside life: Which is better?",
  "The importance of learning a second language.",
  "Should social media be banned for children under 13?",
  "Is homework beneficial or harmful to students?",
  "Should animals be kept in zoos?",
  "The role of artificial intelligence in modern society.",
  "Climate change: Who should be responsible?",
  "Online education vs Traditional classroom learning.",
  "Should celebrities be role models?",
  "The impact of video games on youth behavior.",
  "Is it better to travel alone or with companions?",
  "Should governments invest more in space exploration?",
  "The advantages and disadvantages of remote work.",
  "Is fast food culture harming our health?",
  "Should voting be made mandatory?",
  "The influence of advertising on consumer behavior.",
  "Are exams the best way to assess student ability?",
  "Should public transportation be free?",
  "The benefits of reading books in the digital age.",
  "Is globalization beneficial for all countries?",
  "Should schools teach financial literacy?",
  "The importance of work-life balance."
];

const SUPPORTED_LANGUAGES = [
  { code: "English", label: "English", flag: "US" },
  { code: "Vietnamese", label: "Vietnamese", flag: "VN" },
  { code: "Spanish", label: "Spanish", flag: "ES" },
  { code: "French", label: "French", flag: "FR" },
  { code: "Japanese", label: "Japanese", flag: "JP" },
  { code: "Korean", label: "Korean", flag: "KR" },
  { code: "German", label: "German", flag: "DE" },
  { code: "Italian", label: "Italian", flag: "IT" },
  { code: "Portuguese", label: "Portuguese", flag: "PT" },
  { code: "Russian", label: "Russian", flag: "RU" },
  { code: "Chinese", label: "Chinese", flag: "CN" },
  { code: "Arabic", label: "Arabic", flag: "SA" },
  { code: "Hindi", label: "Hindi", flag: "IN" },
  { code: "Thai", label: "Thai", flag: "TH" },
  { code: "Turkish", label: "Turkish", flag: "TR" },
  { code: "Dutch", label: "Dutch", flag: "NL" },
  { code: "Polish", label: "Polish", flag: "PL" },
  { code: "Swedish", label: "Swedish", flag: "SE" },
];

export default function AnalyzePage() {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [currentTopic, setCurrentTopic] = useState("");
  const [nativeLang, setNativeLang] = useState("English");
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [mode, setMode] = useState<"grammar" | "vocab">("grammar"); 
  const [activeError, setActiveError] = useState<any | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // User & Pro State
  const [user, setUser] = useState<any>(null);
  const [isPro, setIsPro] = useState(false);
  
  // Modals
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState<GrammarRule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Navbar scroll state
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const router = useRouter();
  const supabase = createClient();
  const resultRef = useRef<HTMLDivElement>(null);

  const MIN_WORDS = 20;
  const MIN_LOADING_MS = 850;
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

  useEffect(() => {
    const storedLanguage = typeof window !== "undefined" ? localStorage.getItem("default_language") : null;
    if (storedLanguage) {
        setNativeLang(storedLanguage);
    }

    const checkUser = async () => { 
        const { data: { user } } = await supabase.auth.getUser(); 
        if(user) {
            setUser(user);
            const { data } = await supabase.from('user_usage').select('is_pro, default_language').eq('user_id', user.id).single();
            if(data) {
                setIsPro(data.is_pro);
                // Load default language preference
                if(data.default_language) {
                    setNativeLang(data.default_language);
                    try {
                        localStorage.setItem("default_language", data.default_language);
                    } catch (error) {
                        // Ignore localStorage failures (private mode, blocked storage, etc.)
                    }
                }
            }
        }
    };
    checkUser();
    randomizeTopic();
  }, []);

  // Navbar scroll handler
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        setShowNavbar(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // Scrolling down & past threshold - hide quickly
        setShowNavbar(false);
      } else if (currentScrollY < lastScrollY - 50) {
        // Scrolling up significantly (at least 50px) - show navbar
        setShowNavbar(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const randomizeTopic = () => setCurrentTopic(SHORT_TOPICS[Math.floor(Math.random() * SHORT_TOPICS.length)]);

  const handleOpenLesson = async (errorType: string) => {
    const rule = await fetchRuleByKey(errorType);
    setSelectedRule(rule);
    setIsModalOpen(true);
  };

  const handleReset = () => {
      setResult(null);
      setInputText("");
      setActiveError(null);
      setMode("grammar");
      randomizeTopic();
      toast.success("Ready for a new essay!");
  };

  // Upgrade flow after successful payment

  const handleUpgradeSuccess = async () => {
    if (!result?.submission_id) {
        toast.error("Submission ID missing.");
        return;
    }    
    
    // Turn on unlocking UI state immediately
    setIsUnlocking(true);
    setIsPro(true);
    setShowPricingModal(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    
    let attempts = 0;
    const maxAttempts = 10;
    // Retry loop for eventual consistency after webhook updates
    while (attempts < maxAttempts) {
        try {
            const res = await fetch(`${API_URL}/upgrade-submission`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    submission_id: result.submission_id,
                    user_id: user?.id 
                })
            });

            if (res.ok) {
                const data = await res.json();
                
                setResult((prev: any) => ({
                    ...prev,
                    polished_text: data.polished_text
                }));

                // Turn off unlocking UI and show final result
                setIsUnlocking(false); 
                
                toast.success("Elite Version Unlocked!");
                setMode("vocab");
                setIsAnimating(true);
                setTimeout(() => setIsAnimating(false), 1200);
                return;
            }

            if (res.status === 403) {
                await delay(1000);
                attempts++;
            } else {
                throw new Error("API Error");
            }

        } catch (error) {
            await delay(1000);
            attempts++;
        }
    }

    // All retries failed
    setIsUnlocking(false);
    toast.error("Activation delayed. Please refresh page.");
  };
  
  const handleAnalyze = async () => {
    if (wordCount < MIN_WORDS) return;
    const requestStartTime = performance.now();
    setLoading(true);
    setResult(null);
    setActiveError(null);
    setMode("grammar");

    let analysisResult: any | null = null;

    try {
      // Get a stable device fingerprint for guest quota
      const fp = await FingerprintJS.load();
      const fpResult = await fp.get();
      const visitorId = fpResult.visitorId;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Visitor-ID": visitorId },
        body: JSON.stringify({ 
            text: inputText, 
            user_id: user?.id || null, 
            language: "en",
            native_language: nativeLang 
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        if (response.status === 403) {            
            if (!user) {
                toast.error("Trial limit reached. Sign in to continue.");
            } else {
                toast.error("Daily free limit reached. Upgrade to Pro for unlimited access.");
                setShowPricingModal(true);

            }
            return;
        }
        throw new Error(errData.detail || "Analysis failed");
      }

      analysisResult = await response.json();

    } catch (error: any) {
      toast.error(error.message || "Could not analyze essay.");
    } finally {
      const elapsed = performance.now() - requestStartTime;
      const remainingTime = Math.max(0, MIN_LOADING_MS - elapsed);

      if (remainingTime > 0) {
        await delay(remainingTime);
      }

      if (analysisResult) {
        setResult(analysisResult);
        toast.success("Analysis complete!");

        // Auto scroll to results on mobile/tablet after content is rendered
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
      }

      setLoading(false);
    }
  };

  const applyFix = (error: any) => {
    const newText = inputText.replace(error.quote, error.suggestion);
    setInputText(newText);
    setResult({
        ...result,
        core_errors: result.core_errors.filter((e: any) => e.quote !== error.quote)
    });
    setActiveError(null);
    toast.success("Fixed!");
  };

  const switchMode = (newMode: "grammar" | "vocab") => {
      if (newMode === "vocab" && result?.polished_text) {
          setMode("vocab");
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 1200);
      } else {
          setMode(newMode);
      }
      setActiveError(null);
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-teal-100 selection:text-teal-900 relative">
      <style>{enhancedStyles}</style>
      
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 opacity-[0.4]" 
             style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
        </div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 glow-effect" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 glow-effect" style={{animationDelay: '1s'}} />
      </div>

      <PricingModal 
        isOpen={showPricingModal} 
        onClose={() => setShowPricingModal(false)}
        onSuccess={handleUpgradeSuccess}
      />

      <GrammarLessonModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        rule={selectedRule}
      />

      {/* --- NAVBAR --- */}
<nav className={`sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 transition-transform duration-200 ${showNavbar ? 'translate-y-0' : '-translate-y-full'}`}>
  <div className="max-w-[1800px] mx-auto px-8 py-3 flex justify-between items-center">
    <div className="flex items-center gap-6">
      <div 
        onClick={() => router.push("/")}
        className="flex items-center gap-2 cursor-pointer group"
      >
          <div className="relative w-10 h-10">
              <Image src="/logo.svg" alt="Wrytt Logo" width={40} height={40} className="object-contain" priority />
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight group-hover:text-teal-600 transition-colors">Wrytt</span>
      </div>
      
      {/* Vertical divider */}
      <div className="hidden md:flex h-5 w-[1px] bg-slate-200" />
      
      {/* Nav links */}
      <div className="hidden md:flex items-center gap-4">
          <button 
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-teal-600 transition-all"
          >
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
          </button>
          
          <div className="h-3 w-[1px] bg-slate-200" />
          
          <div className="flex items-center gap-1.5 text-sm font-black text-teal-600">
              <FileText size={16} />
              <span>Analyzer</span>
          </div>
      </div>
    </div>

          <div className="flex items-center gap-4">
            {/* Show reset button in navbar when result exists */}
            {result && (
                <button 
                    onClick={handleReset}
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
                >
                    <RotateCcw size={12}/> Reset
                </button>
            )}

            {user ? (
                <div className="pl-4 border-l border-slate-200">
                    <UserDropdown user={user} isPro={isPro} />
                </div>
            ) : (
                <button onClick={() => router.push('/login')} className="text-sm font-bold text-slate-600 hover:text-slate-900">Login</button>
            )}
          </div>
        </div>
      </nav>

      {/* --- MAIN LAYOUT --- */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 relative z-10">
        {/* Floating Error Panel - Always accessible */}
        {result && activeError && mode === 'grammar' && (
          <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-48px)] animate-in slide-in-from-bottom-5 lg:slide-in-from-right-5 duration-300">
            <div className="bg-gradient-to-br from-white to-red-50/30 p-5 rounded-2xl border-2 border-red-100 shadow-2xl shadow-red-500/20 backdrop-blur-sm relative overflow-hidden group hover:shadow-2xl hover:shadow-red-500/25 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-full blur-3xl opacity-30 group-hover:opacity-40 transition-opacity" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2.5 py-1 bg-gradient-to-r from-red-50 to-red-100 text-red-700 text-xs font-black uppercase tracking-wider rounded-lg shadow-sm">
                    {activeError.error_type}
                  </span>
                  <button 
                    onClick={() => setActiveError(null)} 
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all active:scale-95"
                  >
                    <X size={16}/>
                  </button>
                </div>
                
                <p className="text-xs text-slate-700 mb-4 font-medium leading-relaxed bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                  <span className="text-xs text-slate-500 uppercase font-bold block mb-1.5">AI Suggestion:</span>
                  <span className="text-sm italic">"{activeError.explanation}"</span>
                </p>
                
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => handleOpenLesson(activeError.error_type)}
                    className="w-full py-2 bg-white border-2 border-slate-200 text-slate-600 hover:text-teal-600 hover:border-teal-300 hover:bg-teal-50 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all uppercase tracking-wide shadow-sm hover:shadow-md active:scale-[0.98]"
                  >
                    <BookOpen size={14} /> Review Lesson
                  </button>
                  <button 
                    onClick={() => applyFix(activeError)}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all active:scale-[0.98]"
                  >
                    <Check size={16} /> Apply Fix
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        
        {/* --- LEFT COLUMN: EDITOR (8 Cols) --- */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* 1. Prompt Card */}
          <div className="bg-gradient-to-br from-white to-teal-50/30 p-6 rounded-2xl border border-teal-100 shadow-lg shadow-teal-500/5 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-teal-300 hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300 card-hover-lift relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-100 to-transparent rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="flex items-start gap-4 relative z-10">
                <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-xl shrink-0 shadow-lg shadow-teal-500/20 group-hover:scale-110 transition-transform">
                    <Lightbulb size={22} />
                </div>
                <div>
                    <h2 className="text-xs font-black text-teal-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <span>Writing Prompt</span>
                      <span className="w-1 h-1 bg-teal-400 rounded-full animate-pulse" />
                    </h2>
                    <p className="text-xl font-serif font-semibold text-slate-800 leading-snug italic">"{currentTopic}"</p>
                </div>
            </div>
            <button onClick={randomizeTopic} className="self-end md:self-center p-2.5 text-slate-400 hover:text-teal-600 hover:bg-white hover:shadow-md rounded-xl transition-all active:rotate-180 duration-300 relative z-10">
                <Shuffle size={22} className="drop-shadow-sm" />
            </button>
          </div>

          {/* 2. Main Editor Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-200/60 flex flex-col min-h-[800px] overflow-hidden relative hover:shadow-slate-200/80 transition-shadow duration-300">
            
            {/* Toolbar */}
            <div className="px-4 md:px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-b from-slate-50/50 to-white backdrop-blur-sm">
              <div className="flex flex-wrap items-end gap-2 md:gap-3">
                 <div className="relative group">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-black uppercase text-slate-600 tracking-wide flex items-center gap-2">
                            <Globe size={14} className="text-teal-500" />
                            <span className="hidden sm:inline">AI Feedback Language</span>
                            <span className="sm:hidden">Language</span>
                            <span className="text-teal-600 font-bold" title="This language is used for AI feedback, not for the app interface"></span>
                        </label>
                        <p className="text-xs text-slate-500 font-medium -mt-1 hidden md:block">Choose the language for AI analysis feedback</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white hover:bg-teal-50 rounded-xl cursor-pointer transition-all duration-200 border border-slate-200 hover:border-teal-300 shadow-sm hover:shadow-md mt-2">
                        <select 
                            value={nativeLang} 
                            onChange={(e) => setNativeLang(e.target.value)}
                            className="bg-transparent text-sm font-bold text-slate-700 focus:outline-none cursor-pointer appearance-none pr-4 flex-1"
                        >
                            {SUPPORTED_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                        </select>
                        <ChevronDown size={14} className="text-slate-400 pointer-events-none group-hover:text-teal-500 transition-colors"/>
                    </div>
                 </div>
                 
                 <div className={`text-xs font-black px-3 md:px-4 py-2 rounded-xl border-2 uppercase tracking-wider transition-all duration-300 shadow-sm ${wordCount >= MIN_WORDS ? 'bg-gradient-to-r from-emerald-50 to-emerald-100/50 text-emerald-700 border-emerald-200 shadow-emerald-100' : 'bg-white text-slate-500 border-slate-200'}`}>
                    <span className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${wordCount >= MIN_WORDS ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                      {wordCount}/20 Words
                    </span>
                 </div>
              </div>

              {/* Mode Switcher */}
              {result && (
                <div className="flex p-1.5 bg-gradient-to-r from-slate-100 to-slate-50 rounded-xl border border-slate-200 shadow-inner w-full sm:w-auto">
                    <button 
                        onClick={() => switchMode("grammar")}
                        className={`flex-1 sm:flex-none px-4 md:px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${mode === 'grammar' ? 'bg-white text-slate-900 shadow-md border border-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
                    >
                        Grammar
                    </button>
                    <button 
                        onClick={() => switchMode("vocab")}
                        className={`flex-1 sm:flex-none px-4 md:px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${mode === 'vocab' ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/30' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
                    >
                        <Sparkles size={14} className={mode === 'vocab' ? 'text-yellow-300 animate-pulse' : ''}/>
                        Elite
                    </button>
                </div>
              )}
            </div>

            {/* Writing Area */}
            <div className="flex-1 p-8 md:p-10 overflow-y-auto hide-scrollbar relative bg-white">
              {!result ? (
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Start writing your essay here..."
                  className="w-full h-full min-h-[550px] bg-transparent border-0 focus:ring-0 focus:outline-none outline-none resize-none text-lg md:text-xl text-slate-800 placeholder:text-slate-300 font-serif leading-loose"
                  spellCheck={false}
                />
              ) : (
                <div className="relative min-h-[550px]">
                  {mode === 'grammar' ? (
                    /* --- GRAMMAR MODE --- */
                    <div className="text-lg md:text-xl text-slate-800 font-serif whitespace-pre-wrap leading-loose animate-fade-in-up">
                        {(() => {
                            let lastIndex = 0;
                            const elements = [];
                            const sortedErrors = [...result.core_errors].sort((a:any,b:any) => inputText.indexOf(a.quote) - inputText.indexOf(b.quote));
                            
                            sortedErrors.forEach((err, idx) => {
                                const startPos = inputText.indexOf(err.quote, lastIndex);
                                if (startPos === -1) return;
                                elements.push(inputText.substring(lastIndex, startPos));
                                elements.push(
                                    <span 
                                        key={idx}
                                        onClick={() => setActiveError(err)}
                                        className={`cursor-pointer border-b-2 transition-all duration-200 ${activeError === err ? 'bg-red-50 border-red-500 text-red-700 rounded-sm px-0.5' : 'border-red-300 hover:bg-red-50 text-slate-900'}`}
                                    >
                                        {err.quote}
                                    </span>
                                );
                                lastIndex = startPos + err.quote.length;
                            });
                            elements.push(inputText.substring(lastIndex));
                            return elements;
                        })()}
                    </div>
                  ) : (
                    /* --- VOCAB MODE (BAND 9.0) --- */
                    <div className="relative h-full bg-white min-h-[550px]">
                        
                        {/* CASE 1: Unlocking state with scanning effect */}
                        {isUnlocking ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-slate-50 rounded-xl border border-teal-100">
                                
                                {/* Blurred background text */}
                                <div className="absolute inset-0 p-8 text-lg font-serif text-slate-300 opacity-50 blur-[1px] select-none overflow-hidden">
                                    {inputText}
                                </div>

                                {/* Scan Line Animation */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-teal-400 shadow-[0_0_20px_5px_rgba(20,184,166,0.55)] animate-[scan-line-vertical_2s_infinite_linear] z-10" />
                                <style jsx>{`
                                    @keyframes scan-line-vertical {
                                        0% { top: 0%; opacity: 0; }
                                        10% { opacity: 1; }
                                        90% { opacity: 1; }
                                        100% { top: 100%; opacity: 0; }
                                    }
                                `}</style>

                                {/* Loading Card */}
                                <div className="relative z-20 bg-white p-8 rounded-2xl shadow-2xl shadow-teal-900/10 border border-white flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-teal-100 rounded-full animate-ping opacity-75" />
                                        <div className="relative bg-teal-50 p-4 rounded-full text-teal-600">
                                            <Wand2 size={32} className="animate-pulse" />
                                        </div>
                                    </div>
                                    
                                    <div className="text-center space-y-1">
                                        <h3 className="text-xl font-bold text-slate-800">Unlocking Elite Version...</h3>
                                        <div className="flex flex-col gap-1 text-xs font-medium text-slate-400 uppercase tracking-wider">
                                            <span className="flex items-center gap-2 text-emerald-500 justify-center">
                                                <Check size={12}/> Payment Verified
                                            </span>
                                            <span className="flex items-center gap-2 text-teal-600 animate-pulse justify-center">
                                                <Loader2 size={12} className="animate-spin"/> Rewriting Essay
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        /* CASE 2: Polished text is ready */
                        ) : isPro && result.polished_text ? (
                            <div className="relative w-full min-h-[300px]">
                                <div 
                                    className={`text-lg md:text-xl text-slate-900 font-serif whitespace-pre-wrap leading-loose relative z-10 bg-white ${isAnimating ? 'animate-reveal-text' : ''}`}
                                >
                                    {result.polished_text}
                                </div>
                                {isAnimating && <div className="animate-scan-line pointer-events-none" />}
                            </div>

                        /* CASE 3: Locked state */
                        ) : (
                            <div className="relative w-full h-full min-h-[550px] flex flex-col items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-slate-300 p-8 text-center overflow-hidden group">
                                <div className="absolute inset-0 opacity-10 blur-[2px] pointer-events-none select-none p-12 text-left font-serif text-xl leading-relaxed text-slate-900 group-hover:blur-[1px] transition-all duration-500">
                                    {inputText}
                                </div>
                                
                                <div className="z-10 bg-white p-8 rounded-2xl shadow-xl shadow-teal-900/5 border border-slate-100 max-w-sm hover:shadow-teal-900/10 transition-all hover:-translate-y-1">
                                    <div className="mx-auto w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-4 text-teal-600">
                                        <Lock size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">Unlock Elite Rewrite</h3>
                                    <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                                        See how AI transforms your writing with <b>Advanced Vocabulary</b> & <b>Professional Phrasing</b>.
                                    </p>
                                    <button 
                                        onClick={() => setShowPricingModal(true)}
                                        className="w-full py-3 bg-slate-900 hover:bg-teal-600 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        <Sparkles size={16} /> Upgrade to Pro
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="p-6 border-t border-slate-200 bg-gradient-to-b from-white to-slate-50/50">
               {!result ? (
                    <button 
                        onClick={handleAnalyze}
                        disabled={loading || wordCount < MIN_WORDS}
                        className={`w-full py-4 rounded-xl font-black text-base transition-all flex items-center justify-center gap-2.5 active:scale-[0.97] relative overflow-hidden ${loading || wordCount < MIN_WORDS ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-xl shadow-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/40'}`}
                    >
                        {!loading && wordCount >= MIN_WORDS && (
                          <div className="absolute inset-0 shimmer-effect" />
                        )}
                        {loading ? (
                            <>
                              <Loader2 size={20} className="animate-spin" />
                              <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <Zap size={20} fill="currentColor" className="text-teal-200 drop-shadow-sm"/>
                                <span className="relative z-10">Analyze Essay</span>
                            </>
                        )}
                    </button>
               ) : (
                     <div className="flex gap-3">
                        <button 
                            onClick={handleReset}
                            className="flex-1 py-4 rounded-xl font-bold text-slate-600 bg-white border-2 border-slate-200 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 hover:shadow-lg hover:shadow-teal-100 transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            <PencilLine size={18} /> Write New Essay
                        </button>
                        <button 
                            onClick={() => router.push("/dashboard")}
                            className="flex-1 py-4 rounded-xl font-bold text-slate-700 bg-gradient-to-b from-slate-100 to-slate-50 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-100 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            <LayoutDashboard size={18} /> Back to Dashboard
                        </button>
                    </div>
               )}
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: SIDEBAR (4 Cols) --- */}
        <div className="lg:col-span-4 space-y-5" ref={resultRef}>
            {loading ? (
                // Premium loading state
                <div className="space-y-5 animate-fade-in-up">
                    
                    {/* Score card skeleton */}
                    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-7 rounded-2xl shadow-2xl shadow-slate-900/20 border-2 border-slate-700 relative overflow-hidden flex flex-col items-center justify-center min-h-[180px]">
                         {/* Animated background blobs */}
                         <div className="absolute top-0 right-0 w-40 h-40 bg-teal-500 rounded-full blur-[80px] opacity-30 animate-pulse"></div>
                         <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500 rounded-full blur-[60px] opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
                         
                         {/* Floating particles */}
                         <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-teal-400 rounded-full opacity-60" style={{animation: 'float-up 3s infinite', animationDelay: '0s'}} />
                            <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-40" style={{animation: 'float-up 4s infinite', animationDelay: '0.5s'}} />
                            <div className="absolute bottom-1/3 left-1/3 w-2.5 h-2.5 bg-teal-300 rounded-full opacity-50" style={{animation: 'float-up 3.5s infinite', animationDelay: '1s'}} />
                         </div>
                         
                         <div className="relative z-10 text-center">
                            <div className="flex items-center justify-center gap-2 mb-3">
                              <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
                              <p className="text-xs font-black text-teal-400 uppercase tracking-widest">Calculating Score</p>
                              <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
                            </div>
                            
                            {/* Animated score placeholder */}
                            <div className="flex items-center justify-center gap-3 mb-3">
                                <div className="w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 shimmer-effect"></div>
                                    <Loader2 size={32} className="text-teal-400 animate-spin relative z-10" />
                                </div>
                            </div>
                            
                            <p className="text-teal-300 text-xs font-semibold opacity-70 animate-pulse">AI is evaluating your writing...</p>
                         </div>
                    </div>

                    {/* AI analysis progress card */}
                    <div className="bg-gradient-to-br from-teal-500 via-teal-600 to-blue-600 text-white p-6 rounded-2xl shadow-xl shadow-teal-500/30 relative overflow-hidden">
                        {/* Animated scan line */}
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-white/50 shadow-[0_0_10px_2px_rgba(255,255,255,0.5)]" style={{animation: 'progress-bar 2s ease-in-out infinite'}}></div>
                        
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl opacity-10 animate-pulse" />
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-2.5 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <Sparkles size={20} className="text-yellow-300 animate-pulse"/>
                                </div>
                                <div>
                                    <h3 className="text-base font-black uppercase tracking-wide drop-shadow-lg">AI Analysis</h3>
                                    <p className="text-xs text-teal-100 font-semibold">Processing your essay...</p>
                                </div>
                            </div>
                            
                            {/* Analysis Steps */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 animate-fade-in-up">
                                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                        <Check size={14} className="text-emerald-300" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold">Reading content</p>
                                        <div className="h-1 bg-white/20 rounded-full mt-1.5 overflow-hidden">
                                            <div className="h-full bg-white rounded-full w-full"></div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                        <Loader2 size={14} className="text-white animate-spin" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold">Analyzing grammar & structure</p>
                                        <div className="h-1 bg-white/20 rounded-full mt-1.5 overflow-hidden">
                                            <div className="h-full bg-white rounded-full" style={{width: '75%', animation: 'progress-bar 2s ease-in-out infinite'}}></div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 animate-fade-in-up opacity-50" style={{animationDelay: '0.6s'}}>
                                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                                        <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold">Generating feedback</p>
                                        <div className="h-1 bg-white/20 rounded-full mt-1.5 overflow-hidden">
                                            <div className="h-full bg-white/50 rounded-full w-1/4"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feedback skeleton with shimmer */}
                    <div className="bg-gradient-to-br from-white via-white to-teal-50/30 rounded-2xl border border-teal-200 shadow-lg shadow-teal-500/10 p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-100 to-transparent rounded-full blur-3xl opacity-40 animate-pulse" />
                        
                        <div className="flex items-center gap-3 mb-5 relative z-10">
                            <div className="p-2.5 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg animate-pulse">
                                <div className="w-5 h-5 bg-slate-300 rounded"></div>
                            </div>
                            <div className="flex-1">
                                <div className="h-5 bg-slate-200 rounded-lg w-32 mb-2 animate-pulse"></div>
                                <div className="h-3 bg-slate-100 rounded w-24 animate-pulse"></div>
                            </div>
                        </div>
                        
                        <div className="space-y-3 bg-white/50 p-5 rounded-xl border border-slate-200/50 relative z-10">
                            {/* Shimmer skeleton lines */}
                            {[1,2,3,4,5,6].map((_, i) => (
                                <div key={i} className="relative h-4 bg-slate-100 rounded-lg overflow-hidden" style={{width: i % 3 === 0 ? '95%' : i % 2 === 0 ? '85%' : '100%', animationDelay: `${i * 0.1}s`}}>
                                    <div className="absolute inset-0 shimmer-effect"></div>
                                </div>
                            ))}
                            
                            <div className="h-3"></div>
                            
                            {[1,2,3,4].map((_, i) => (
                                <div key={`b-${i}`} className="relative h-4 bg-slate-100 rounded-lg overflow-hidden" style={{width: i % 2 === 0 ? '90%' : '80%', animationDelay: `${(i + 6) * 0.1}s`}}>
                                    <div className="absolute inset-0 shimmer-effect"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Waiting message */}
                    <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border-2 border-teal-100 rounded-xl p-4 relative overflow-hidden group">
                        <div className="absolute -right-8 -top-8 w-24 h-24 bg-teal-200 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" style={{animation: 'rotate-slow 10s linear infinite'}}></div>
                        
                        <div className="relative z-10 flex items-center gap-3">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-teal-400 rounded-full" style={{animation: 'bounce-slow 1s ease-in-out infinite'}}></div>
                                <div className="w-2 h-2 bg-teal-500 rounded-full" style={{animation: 'bounce-slow 1s ease-in-out infinite', animationDelay: '0.2s'}}></div>
                                <div className="w-2 h-2 bg-emerald-500 rounded-full" style={{animation: 'bounce-slow 1s ease-in-out infinite', animationDelay: '0.4s'}}></div>
                            </div>
                            <p className="text-sm font-bold text-teal-700">
                                AI is carefully reviewing every detail...
                            </p>
                        </div>
                    </div>

                </div>
            ) : !result ? (
                // Empty State
                <div className="h-full min-h-[400px] bg-gradient-to-br from-white via-slate-50/30 to-teal-50/20 p-10 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-teal-300 transition-all duration-300">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-teal-100 to-blue-100 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" />
                    <div className="relative z-10 space-y-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-teal-50 to-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-2 mx-auto shadow-lg shadow-slate-200/50 group-hover:scale-110 transition-transform">
                          <BarChart3 size={36} />
                      </div>
                      <h3 className="font-black text-xl text-slate-700 mb-2">Metrics Awaiting...</h3>
                      <p className="text-sm text-slate-500 max-w-xs leading-relaxed">Submit your writing to get comprehensive AI grading and feedback with detailed metrics.</p>
                      <div className="flex gap-2 justify-center pt-2">
                        <div className="w-2 h-2 bg-teal-300 rounded-full animate-pulse" />
                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}} />
                        <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}} />
                      </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-5 animate-fade-in-up">
                    
                    {/* Score Card - Optimized */}
                    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-7 rounded-2xl shadow-2xl shadow-slate-900/20 border-2 border-slate-700 relative overflow-hidden flex flex-col items-center justify-center min-h-[180px] group hover:shadow-slate-900/30 transition-all duration-300">
                         {/* Decorative background */}
                         <div className="absolute top-0 right-0 w-40 h-40 bg-teal-500 rounded-full blur-[80px] opacity-30 pointer-events-none glow-effect"></div>
                         <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500 rounded-full blur-[60px] opacity-20 pointer-events-none glow-effect" style={{animationDelay: '1.5s'}}></div>
                         
                         <div className="relative z-10 text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
                              <p className="text-xs font-black text-teal-400 uppercase tracking-widest">Writing Score</p>
                              <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
                            </div>
                            <div className="flex items-center justify-center gap-3">
                                <span className="text-7xl font-black tracking-tighter text-white drop-shadow-2xl">{result.score}</span>
                                {parseFloat(result.score) >= 7.0 && (
                                    <Sparkles className="text-yellow-400 animate-pulse drop-shadow-glow" size={24} />
                                )}
                            </div>
                            <p className="text-teal-300 text-xs font-semibold mt-2 opacity-90">AI Assessment Complete</p>
                         </div>
                    </div>

                    {/* Info Hint Card - Only in Grammar Mode */}
                    {mode === 'grammar' && (
                      <div className="bg-gradient-to-br from-teal-500 via-teal-600 to-teal-600 text-white p-4.5 rounded-xl shadow-lg shadow-teal-500/20 relative overflow-hidden group hover:shadow-teal-500/30 transition-all">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full blur-2xl opacity-10 group-hover:opacity-15 transition-opacity" />
                        <div className="relative z-10 flex items-start gap-3">
                          <div className="p-2 bg-white/20 rounded-lg shrink-0 mt-0.5">
                            <PencilLine size={15} className="text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-bold leading-snug drop-shadow-sm">
                              Click highlighted text to view suggestions in the floating panel
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Elite Phrasing Card - Only in Vocab Mode */}
                    {mode === 'vocab' && (
                        <div className="bg-gradient-to-br from-teal-500 via-teal-600 to-teal-600 text-white p-4.5 rounded-xl shadow-lg shadow-teal-500/20 relative overflow-hidden group hover:shadow-teal-500/30 transition-all">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full blur-2xl opacity-10 group-hover:opacity-15 transition-opacity" />
                            <div className="relative z-10 flex items-start gap-3">
                              <div className="p-2 bg-white/20 rounded-lg shrink-0 mt-0.5">
                                <Sparkles size={15} className="text-yellow-300 animate-pulse"/>
                              </div>
                              <div>
                                <h3 className="text-sm font-bold uppercase tracking-wide drop-shadow-sm mb-1">Elite Rewrite</h3>
                                <p className="text-sm leading-snug drop-shadow-sm">
                                  AI has enhanced vocabulary & phrasing to meet academic standards
                                </p>
                              </div>
                            </div>
                        </div>
                    )}
                    
                    
                    {/* AI Feedback Card - Enhanced readability */}
                    <div className="bg-gradient-to-br from-white via-white to-teal-50/20 rounded-2xl border border-teal-200 shadow-lg shadow-teal-500/10 p-6 relative overflow-hidden group hover:shadow-xl hover:shadow-teal-500/15 transition-all duration-300">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-100 to-transparent rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity" />
                        
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                            <div className="p-2.5 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-lg shadow-md shadow-teal-500/20">
                                <Quote size={20} />
                            </div>
                            <div>
                              <h3 className="font-black text-lg text-slate-800">AI Feedback</h3>
                              <p className="text-xs text-teal-600 font-bold">Examiner Insights</p>
                            </div>
                        </div>
                        
                        <div className="text-slate-700 leading-relaxed text-base bg-white/50 p-5 rounded-xl border border-slate-200/50 relative z-10 max-h-[900px] overflow-y-auto hide-scrollbar">
                            {result.general_feedback.split('\n').map((line: string, i: number) => {
                                // Check if line is a section header (starts with **)
                                const isHeader = line.startsWith('**') && line.endsWith('**');
                                
                                // Parse inline markdown: **bold text** -> proper JSX
                                const renderMarkdown = (text: string) => {
                                    const parts = text.split(/(\*\*[^*]+\*\*)/);
                                    return parts.map((part, idx) => {
                                        if (part.startsWith('**') && part.endsWith('**')) {
                                            return <strong key={idx} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
                                        }
                                        return part;
                                    });
                                };
                                
                                return (
                                    <p key={i} className={`mb-2.5 last:mb-0 text-base ${isHeader ? 'font-bold text-slate-900 mt-3 mb-1' : ''}`}>
                                        {renderMarkdown(line)}
                                    </p>
                                );
                            })}
                        </div>
                    </div>


                </div>
            )}
        </div>
      </div>
    </main>
  );
}
