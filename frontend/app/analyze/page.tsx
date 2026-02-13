"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { translateError } from "@/lib/errorMapping";
import { 
  Zap, Shuffle, Lightbulb, Globe, ChevronDown, 
  Sparkles, X, Check, Wand2, ArrowLeft, 
  History, PencilLine, BookOpen, Quote, Lock, 
  LayoutDashboard, FileText, BarChart3, RotateCcw
} from "lucide-react";
import toast from "react-hot-toast";
import PricingModal from "@/components/PricingModal";
import UserDropdown from "@/components/UserDropdown";
import GrammarLessonModal from "@/components/GrammarLessonModal"; // Nhớ import cái này
import { fetchRuleByKey, GrammarRule } from "@/lib/grammarRules";

// --- REFINED ANIMATIONS (CYAN THEME) ---
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
  .animate-reveal-text {
    background-color: transparent; 
    will-change: clip-path;
    animation: clip-reveal 1.2s cubic-bezier(0.19, 1, 0.22, 1) forwards;
  }
  .animate-scan-line {
    position: absolute;
    top: 0; bottom: 0; width: 2px;
    background: linear-gradient(to bottom, transparent, #06b6d4, transparent);
    box-shadow: 0 0 15px 2px rgba(6, 182, 212, 0.5);
    z-index: 30;
    animation: scan-line 1.2s cubic-bezier(0.19, 1, 0.22, 1) forwards;
  }
  .animate-fade-in-up {
    animation: fade-in-up 0.4s ease-out forwards;
  }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

const SHORT_TOPICS = [
  "Should students be required to wear uniforms?",
  "Is technology making us lazy?",
  "Money cannot buy happiness. Do you agree?",
  "City life vs Countryside life: Which is better?",
  "The importance of learning a second language."
];

const SUPPORTED_LANGUAGES = [
    { code: "English", label: "English", flag: "🇺🇸" },
    { code: "Vietnamese", label: "Tiếng Việt", flag: "🇻🇳" },
    { code: "Spanish", label: "Español", flag: "🇪🇸" },
    { code: "French", label: "Français", flag: "🇫🇷" },
    { code: "Japanese", label: "日本語", flag: "🇯🇵" },
    { code: "Korean", label: "한국어", flag: "🇰🇷" },
];

export default function AnalyzePage() {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [currentTopic, setCurrentTopic] = useState("");
  const [nativeLang, setNativeLang] = useState("English");
  
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

  const router = useRouter();
  const supabase = createClient();
  const resultRef = useRef<HTMLDivElement>(null); // Để scroll tự động

  const MIN_WORDS = 20;
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

  useEffect(() => {
    const checkUser = async () => { 
        const { data: { user } } = await supabase.auth.getUser(); 
        if(user) {
            setUser(user);
            const { data } = await supabase.from('user_usage').select('is_pro').eq('user_id', user.id).single();
            if(data) setIsPro(data.is_pro);
        }
    };
    checkUser();
    randomizeTopic();
  }, []);

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

  const handleUpgradeSuccess = async () => {
    if (!result?.submission_id) {
        toast.error("No submission found.");
        return;
    }    
    
    if (result && !result.polished_text) {
        const toastId = toast.loading("Unlocking Band 9.0 Version...");
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${API_URL}/upgrade-submission`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    submission_id: result.submission_id,
                    user_id: user?.id 
                })
            });

            if (!res.ok) throw new Error("Unlock failed");
            const data = await res.json();

            setResult((prev: any) => ({
                ...prev,
                polished_text: data.polished_text
            }));

            setIsPro(true); // Update UI instantly
            toast.success("Unlocked!", { id: toastId });
            setMode("vocab");
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 1200);

        } catch (error) {
            toast.error("Unlock failed.", { id: toastId });
        }
    } else {
         setIsPro(true);
         toast.success("You are now Pro!");
    }
  };
  
  const handleAnalyze = async () => {
    if (wordCount < MIN_WORDS) return;
    setLoading(true);
    setResult(null);
    setActiveError(null);
    setMode("grammar");

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            text: inputText, 
            user_id: user?.id || null, 
            language: "en", // Hardcode English target
            native_language: nativeLang 
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        if (response.status === 403 || (errData.detail && errData.detail.includes("limit"))) {
            setShowPricingModal(true);
            toast.error("Daily limit reached! Upgrade to continue.");
            return;
        }
        throw new Error(errData.detail || "Analysis failed");
      }

      const data = await response.json();
      setResult(data);
      toast.success("Analysis complete!");
      
      // Auto scroll to results on mobile/tablet
      setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);

    } catch (error: any) {
         toast.error(error.message || "Could not analyze essay.");
    } finally {
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
      if (newMode === "vocab" && result?.polished_text && isPro) {
          setMode("vocab");
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 1200);
      } else if (newMode === "vocab" && !isPro) {
          setShowPricingModal(true);
          toast.error("Upgrade to Pro to access Band 9.0 Rewrite!");
      } else {
          setMode(newMode);
      }
      setActiveError(null);
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-cyan-100 selection:text-cyan-900 relative">
      <style>{enhancedStyles}</style>
      
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.4]" 
           style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
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
<nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
  <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
    <div className="flex items-center gap-6">
      <div 
        onClick={() => router.push("/")} // Logo về Home
        className="flex items-center gap-2 cursor-pointer group"
      >
          <div className="relative w-8 h-8">
              <Image src="/logo.svg" alt="Eloqua Logo" width={32} height={32} className="object-contain" priority />
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight group-hover:text-cyan-600 transition-colors">Eloqua</span>
      </div>
      
      {/* Vạch ngăn cách dọc */}
      <div className="hidden md:flex h-5 w-[1px] bg-slate-200" />
      
      {/* Cụm link điều hướng mới */}
      <div className="hidden md:flex items-center gap-4">
          <button 
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-cyan-600 transition-all"
          >
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
          </button>
          
          <div className="h-3 w-[1px] bg-slate-200" />
          
          <div className="flex items-center gap-1.5 text-sm font-black text-cyan-600">
              <FileText size={16} />
              <span>Analyzer</span>
          </div>
      </div>
    </div>

          <div className="flex items-center gap-4">
            {/* Nếu đã có kết quả, hiện nút Reset ở Navbar để tiện thao tác */}
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
      <div className="max-w-7xl mx-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* --- LEFT COLUMN: EDITOR (8 Cols) --- */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Prompt Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-cyan-300 transition-colors">
            <div className="flex items-start gap-4">
                <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-lg shrink-0">
                    <Lightbulb size={20} />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Writing Prompt</h2>
                    <p className="text-lg font-serif font-medium text-slate-800 leading-snug italic">"{currentTopic}"</p>
                </div>
            </div>
            <button onClick={randomizeTopic} className="self-end md:self-center p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-full transition-all active:rotate-180">
                <Shuffle size={20} />
            </button>
          </div>

          {/* Main Editor Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 flex flex-col min-h-[680px] overflow-hidden relative">
            
            {/* Toolbar */}
            <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                 <div className="relative group">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200">
                        <Globe size={14} className="text-slate-400" />
                        <select 
                            value={nativeLang} 
                            onChange={(e) => setNativeLang(e.target.value)}
                            className="bg-transparent text-xs font-bold text-slate-600 focus:outline-none cursor-pointer appearance-none pr-4"
                        >
                            {SUPPORTED_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                        </select>
                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                    </div>
                 </div>
                 
                 <div className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border uppercase tracking-wider transition-colors ${wordCount >= MIN_WORDS ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                    {wordCount} Words
                 </div>
              </div>

              {/* Mode Switcher */}
              {result && (
                <div className="flex p-1 bg-slate-100 rounded-lg">
                    <button 
                        onClick={() => switchMode("grammar")}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${mode === 'grammar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Grammar
                    </button>
                    <button 
                        onClick={() => switchMode("vocab")}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${mode === 'vocab' ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Sparkles size={12} className={mode === 'vocab' ? 'text-cyan-100' : ''}/>
                        Band 9.0
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
                  className="w-full h-full min-h-[400px] bg-transparent border-0 focus:ring-0 resize-none text-lg md:text-xl text-slate-800 placeholder:text-slate-300 font-serif leading-loose"
                  spellCheck={false}
                />
              ) : (
                <div className="relative min-h-[400px]">
                  {mode === 'grammar' ? (
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
                    <div className="relative h-full bg-white">
                      {result.polished_text && isPro ? (
                        <div className="relative w-full min-h-[300px]">
                          {isAnimating && (
                            <div className="absolute inset-0 text-lg md:text-xl text-slate-200 font-serif whitespace-pre-wrap leading-loose select-none z-0">
                              {inputText}
                            </div>
                          )}
                          <div 
                            className={`text-lg md:text-xl text-slate-900 font-serif whitespace-pre-wrap leading-loose relative z-10 bg-white ${isAnimating ? 'animate-reveal-text' : ''}`}
                          >
                            {result.polished_text}
                          </div>
                          {isAnimating && <div className="animate-scan-line pointer-events-none" />}
                        </div>
                      ) : (
                        <div className="relative w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-slate-300 p-8 text-center overflow-hidden">
                             <div className="absolute inset-0 opacity-10 blur-[2px] pointer-events-none select-none p-12 text-left font-serif text-xl leading-relaxed text-slate-900">
                                {inputText}
                            </div>
                            
                            <div className="z-10 bg-white p-8 rounded-2xl shadow-xl shadow-cyan-900/10 border border-slate-100 max-w-sm">
                                <div className="mx-auto w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center mb-4 text-cyan-600">
                                    <Lock size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Unlock Band 9.0 Rewrite</h3>
                                <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                                    See how AI transforms your essay with <b>C2 Vocabulary</b> & <b>Native Phrasing</b>.
                                </p>
                                <button 
                                    onClick={() => setShowPricingModal(true)}
                                    className="w-full py-3 bg-slate-900 hover:bg-cyan-600 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
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
            <div className="p-5 border-t border-slate-100 bg-white">
               {!result ? (
                    <button 
                        onClick={handleAnalyze}
                        disabled={loading || wordCount < MIN_WORDS}
                        className={`w-full py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 active:scale-[0.99] ${loading || wordCount < MIN_WORDS ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-600/20'}`}
                    >
                        {loading ? (
                            <>Processing...</>
                        ) : (
                            <>
                                <Zap size={18} fill="currentColor" className="text-cyan-200"/>
                                Analyze Essay
                            </>
                        )}
                    </button>
               ) : (
                     <div className="flex gap-3">
                        <button 
                            onClick={handleReset}
                            className="flex-1 py-4 rounded-xl font-bold text-slate-500 border border-slate-200 hover:border-cyan-500 hover:text-cyan-600 hover:bg-cyan-50 transition-all flex items-center justify-center gap-2"
                        >
                            <PencilLine size={18} /> Write New Essay
                        </button>
                        <button 
                            onClick={() => router.push("/dashboard")}
                            className="flex-1 py-4 rounded-xl font-bold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                        >
                            <LayoutDashboard size={18} /> Back to Dashboard
                        </button>
                    </div>
               )}
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: SIDEBAR (4 Cols) --- */}
        <div className="lg:col-span-4 space-y-6" ref={resultRef}>
            {!result ? (
                // Empty State
                <div className="h-full min-h-[400px] bg-white p-8 rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
                        <BarChart3 size={32} />
                    </div>
                    <h3 className="font-bold text-slate-700 mb-2">Metrics awaiting...</h3>
                    <p className="text-sm text-slate-400">Submit your writing to get comprehensive AI grading and feedback.</p>
                </div>
            ) : (
                <div className="space-y-5 animate-fade-in-up">
                    
                    {/* Score Card */}
                    <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-800 relative overflow-hidden">
                         <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-1">Overall Band</p>
                                <div className="text-5xl font-black tracking-tighter">{result.score}</div>
                            </div>
                            <div className="p-2 bg-white/10 rounded-lg">
                                <BarChart3 size={20} className="text-cyan-400"/>
                            </div>
                         </div>
                         <div className="mt-6 pt-4 border-t border-slate-800">
                             <p className="text-sm text-slate-300 italic leading-relaxed">"{result.general_feedback}"</p>
                         </div>
                    </div>

                    {/* Context Action */}
                    <div className="min-h-[200px]">
                        {mode === 'vocab' ? (
                            <div className="bg-gradient-to-br from-cyan-500 to-teal-600 text-white p-6 rounded-2xl shadow-lg">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles size={16} className="text-yellow-300"/>
                                    <span className="text-xs font-bold uppercase tracking-wide">Elite Phrasing</span>
                                </div>
                                <h3 className="text-lg font-bold mb-2">Refined by Eloqua AI</h3>
                                <p className="text-sm text-cyan-50 leading-relaxed opacity-90">
                                    Your essay has been rewritten to meet strict <b>academic standards</b>. Compare the changes to learn.
                                </p>
                            </div>
                        ) : activeError ? (
                            <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-xl shadow-red-500/5">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wider rounded">
                                        {translateError(activeError.error_type, 'en')}
                                    </span>
                                    <button onClick={() => setActiveError(null)} className="text-slate-300 hover:text-slate-500"><X size={16}/></button>
                                </div>
                                <p className="text-sm text-slate-600 mb-6 font-medium leading-relaxed">
                                    <span className="text-slate-400">AI Suggestion:</span><br/>
                                    "{activeError.explanation}"
                                </p>
                                <div className="flex flex-col gap-2">
                                    <button 
                                        onClick={() => handleOpenLesson(activeError.error_type)}
                                        className="w-full py-2 bg-slate-50 text-slate-500 hover:text-cyan-600 font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-all uppercase tracking-wide"
                                    >
                                        <BookOpen size={14} /> Review Lesson
                                    </button>
                                    <button 
                                        onClick={() => applyFix(activeError)}
                                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                                    >
                                        <Check size={16} /> Apply Fix
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
                                <p className="text-sm text-slate-500">Select any highlighted text to view details.</p>
                            </div>
                        )}
                    </div>

                    {/* Error List */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[350px]">
                        <div className="p-4 bg-slate-50 border-b border-slate-100">
                             <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                <History size={14} /> Detected Issues ({result.core_errors.length})
                            </h4>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 hide-scrollbar">
                             {result.core_errors.length > 0 ? (
                                result.core_errors.map((e: any, i: number) => (
                                    <button 
                                        key={i} 
                                        onClick={() => setActiveError(e)}
                                        className={`w-full text-left p-3 rounded-lg text-xs transition-all border ${activeError === e ? 'bg-cyan-50 border-cyan-200 text-cyan-900' : 'bg-white border-transparent hover:bg-slate-50 text-slate-600'}`}
                                    >
                                        <div className="font-bold truncate mb-0.5">"{e.quote}"</div>
                                        <div className="text-slate-400 text-[10px] uppercase">{translateError(e.error_type, 'en')}</div>
                                    </button>
                                ))
                             ) : (
                                <div className="py-8 text-center text-slate-400 text-xs">No errors found.</div>
                             )}
                        </div>
                    </div>

                </div>
            )}
        </div>
      </div>
    </main>
  );
}