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
import GrammarLessonModal from "@/components/GrammarLessonModal"; // Nhớ import cái này
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
  .animate-slide-in {
    animation: slide-in 0.5s ease-out forwards;
  }
  .glow-effect {
    animation: glow-pulse 3s ease-in-out infinite;
  }
  .shimmer-effect {
    background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.1), transparent);
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
    { code: "English", label: "English", flag: "🇺🇸" },
    { code: "Vietnamese", label: "Tiếng Việt", flag: "🇻🇳" },
    { code: "Spanish", label: "Español", flag: "🇪🇸" },
    { code: "French", label: "Français", flag: "🇫🇷" },
    { code: "Japanese", label: "日本語", flag: "🇯🇵" },
    { code: "Korean", label: "한국어", flag: "🇰🇷" },
    { code: "German", label: "Deutsch", flag: "🇩🇪" },
    { code: "Italian", label: "Italiano", flag: "🇮🇹" },
    { code: "Portuguese", label: "Português", flag: "🇵🇹" },
    { code: "Russian", label: "Русский", flag: "🇷🇺" },
    { code: "Chinese", label: "中文", flag: "🇨🇳" },
    { code: "Arabic", label: "العربية", flag: "🇸🇦" },
    { code: "Hindi", label: "हिन्दी", flag: "🇮🇳" },
    { code: "Thai", label: "ไทย", flag: "🇹🇭" },
    { code: "Turkish", label: "Türkçe", flag: "🇹🇷" },
    { code: "Dutch", label: "Nederlands", flag: "🇳🇱" },
    { code: "Polish", label: "Polski", flag: "🇵🇱" },
    { code: "Swedish", label: "Svenska", flag: "🇸🇪" },
];

export default function AnalyzePage() {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [currentTopic, setCurrentTopic] = useState("");
  const [nativeLang, setNativeLang] = useState("English");
  // Thêm vào đầu component AnalyzePage
const [isUnlocking, setIsUnlocking] = useState(false); // <--- State mới này
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
  const resultRef = useRef<HTMLDivElement>(null); // Để scroll tự động

  const MIN_WORDS = 20;
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

  // ... trong page.tsx

 // ... trong page.tsx

  const handleUpgradeSuccess = async () => {
    if (!result?.submission_id) {
        toast.error("Submission ID missing.");
        return;
    }    
    
    // 1. BẬT CHẾ ĐỘ "ĐANG XỬ LÝ" NGAY LẬP TỨC
    setIsUnlocking(true); // Giao diện sẽ đổi ngay sang màn hình scan
    setIsPro(true);       // Giả lập Pro luôn
    setShowPricingModal(false); // Tắt modal tính tiền

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    
    let attempts = 0;
    const maxAttempts = 10;
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    // Vòng lặp Retry (như cũ)
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

                // 2. TẮT CHẾ ĐỘ XỬ LÝ -> HIỆN KẾT QUẢ
                setIsUnlocking(false); 
                
                toast.success("Band 9.0 Unlocked!");
                setMode("vocab");
                setIsAnimating(true);
                setTimeout(() => setIsAnimating(false), 1200);
                return;
            }

            if (res.status === 403) {
                await delay(1000); // Chờ 1s rồi thử lại
                attempts++;
            } else {
                throw new Error("API Error");
            }

        } catch (error) {
            await delay(1000);
            attempts++;
        }
    }

    // Nếu thất bại
    setIsUnlocking(false); // Trả về trạng thái cũ
    toast.error("Activation delayed. Please refresh page.");
  };
  
  const handleAnalyze = async () => {
    if (wordCount < MIN_WORDS) return;
    setLoading(true);
    setResult(null);
    setActiveError(null);
    setMode("grammar");

    try {
        // --- 2. LẤY FINGERPRINT (ID DUY NHẤT CỦA MÁY) ---
      const fp = await FingerprintJS.load();
      const fpResult = await fp.get();
      const visitorId = fpResult.visitorId
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Visitor-ID": visitorId }, // Gửi Visitor ID lên server
        body: JSON.stringify({ 
            text: inputText, 
            user_id: user?.id || null, 
            language: "en", // Hardcode English target
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
                setShowPricingModal(true); // Tự động bật Modal bắt Login/Mua Pro

            }
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
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-cyan-100 selection:text-cyan-900 relative">
      <style>{enhancedStyles}</style>
      
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 opacity-[0.4]" 
             style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
        </div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 glow-effect" />
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
        onClick={() => router.push("/")} // Logo về Home
        className="flex items-center gap-2 cursor-pointer group"
      >
          <div className="relative w-10 h-10">
              <Image src="/logo.svg" alt="Wrytt Logo" width={40} height={40} className="object-contain" priority />
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight group-hover:text-cyan-600 transition-colors">Wrytt</span>
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
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 relative z-10">
        
        {/* --- LEFT COLUMN: EDITOR (8 Cols) --- */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* 1. Prompt Card */}
          <div className="bg-gradient-to-br from-white to-cyan-50/30 p-6 rounded-2xl border border-cyan-100 shadow-lg shadow-cyan-500/5 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-cyan-300 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 card-hover-lift relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-100 to-transparent rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="flex items-start gap-4 relative z-10">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-xl shrink-0 shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                    <Lightbulb size={22} />
                </div>
                <div>
                    <h2 className="text-xs font-black text-cyan-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <span>Writing Prompt</span>
                      <span className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" />
                    </h2>
                    <p className="text-xl font-serif font-semibold text-slate-800 leading-snug italic">"{currentTopic}"</p>
                </div>
            </div>
            <button onClick={randomizeTopic} className="self-end md:self-center p-2.5 text-slate-400 hover:text-cyan-600 hover:bg-white hover:shadow-md rounded-xl transition-all active:rotate-180 duration-300 relative z-10">
                <Shuffle size={22} className="drop-shadow-sm" />
            </button>
          </div>

          {/* 2. Main Editor Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-200/60 flex flex-col min-h-[680px] overflow-hidden relative hover:shadow-slate-200/80 transition-shadow duration-300">
            
            {/* Toolbar */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-b from-slate-50/50 to-white backdrop-blur-sm">
              <div className="flex items-end gap-3">
                 <div className="relative group">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-black uppercase text-slate-600 tracking-wide flex items-center gap-2">
                            <Globe size={14} className="text-cyan-500" />
                            AI Feedback Language
                            <span className="text-cyan-600 font-bold" title="This language is used for AI feedback, not for the app interface"></span>
                        </label>
                        <p className="text-xs text-slate-500 font-medium -mt-1">Choose the language for AI analysis feedback</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-cyan-50 rounded-xl cursor-pointer transition-all duration-200 border border-slate-200 hover:border-cyan-300 shadow-sm hover:shadow-md mt-2">
                        <select 
                            value={nativeLang} 
                            onChange={(e) => setNativeLang(e.target.value)}
                            className="bg-transparent text-sm font-bold text-slate-700 focus:outline-none cursor-pointer appearance-none pr-4 flex-1"
                        >
                            {SUPPORTED_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                        </select>
                        <ChevronDown size={14} className="text-slate-400 pointer-events-none group-hover:text-cyan-500 transition-colors"/>
                    </div>
                 </div>
                 
                 <div className={`text-xs font-black px-4 py-2 rounded-xl border-2 uppercase tracking-wider transition-all duration-300 shadow-sm ${wordCount >= MIN_WORDS ? 'bg-gradient-to-r from-emerald-50 to-emerald-100/50 text-emerald-700 border-emerald-200 shadow-emerald-100' : 'bg-white text-slate-500 border-slate-200'}`}>
                    <span className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${wordCount >= MIN_WORDS ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                      {wordCount}/20 Words
                    </span>
                 </div>
              </div>

              {/* Mode Switcher */}
              {result && (
                <div className="flex p-1.5 bg-gradient-to-r from-slate-100 to-slate-50 rounded-xl border border-slate-200 shadow-inner">
                    <button 
                        onClick={() => switchMode("grammar")}
                        className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${mode === 'grammar' ? 'bg-white text-slate-900 shadow-md border border-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
                    >
                        Grammar
                    </button>
                    <button 
                        onClick={() => switchMode("vocab")}
                        className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-2 ${mode === 'vocab' ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/30' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
                    >
                        <Sparkles size={14} className={mode === 'vocab' ? 'text-yellow-300 animate-pulse' : ''}/>
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
                  className="w-full h-full min-h-[400px] bg-transparent border-0 focus:ring-0 focus:outline-none outline-none resize-none text-lg md:text-xl text-slate-800 placeholder:text-slate-300 font-serif leading-loose"
                  spellCheck={false}
                />
              ) : (
                <div className="relative min-h-[400px]">
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
                    <div className="relative h-full bg-white min-h-[400px]">
                        
                        {/* CASE 1: ĐANG MỞ KHÓA (SCANNING EFFECT) */}
                        {isUnlocking ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-slate-50 rounded-xl border border-cyan-100">
                                
                                {/* Background Text mờ */}
                                <div className="absolute inset-0 p-8 text-lg font-serif text-slate-300 opacity-50 blur-[1px] select-none overflow-hidden">
                                    {inputText}
                                </div>

                                {/* Scan Line Animation */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400 shadow-[0_0_20px_5px_rgba(34,211,238,0.6)] animate-[scan-line-vertical_2s_infinite_linear] z-10" />
                                <style jsx>{`
                                    @keyframes scan-line-vertical {
                                        0% { top: 0%; opacity: 0; }
                                        10% { opacity: 1; }
                                        90% { opacity: 1; }
                                        100% { top: 100%; opacity: 0; }
                                    }
                                `}</style>

                                {/* Loading Card */}
                                <div className="relative z-20 bg-white p-8 rounded-2xl shadow-2xl shadow-cyan-900/10 border border-white flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-cyan-100 rounded-full animate-ping opacity-75" />
                                        <div className="relative bg-cyan-50 p-4 rounded-full text-cyan-600">
                                            <Wand2 size={32} className="animate-pulse" />
                                        </div>
                                    </div>
                                    
                                    <div className="text-center space-y-1">
                                        <h3 className="text-xl font-bold text-slate-800">Unlocking Band 9.0...</h3>
                                        <div className="flex flex-col gap-1 text-xs font-medium text-slate-400 uppercase tracking-wider">
                                            <span className="flex items-center gap-2 text-emerald-500 justify-center">
                                                <Check size={12}/> Payment Verified
                                            </span>
                                            <span className="flex items-center gap-2 text-cyan-600 animate-pulse justify-center">
                                                <Loader2 size={12} className="animate-spin"/> Rewriting Essay
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        /* CASE 2: ĐÃ CÓ KẾT QUẢ (HIỆN TEXT XỊN) */
                        ) : isPro && result.polished_text ? (
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

                        /* CASE 3: BỊ KHÓA (LOCK SCREEN) */
                        ) : (
                            <div className="relative w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-slate-300 p-8 text-center overflow-hidden group">
                                <div className="absolute inset-0 opacity-10 blur-[2px] pointer-events-none select-none p-12 text-left font-serif text-xl leading-relaxed text-slate-900 group-hover:blur-[1px] transition-all duration-500">
                                    {inputText}
                                </div>
                                
                                <div className="z-10 bg-white p-8 rounded-2xl shadow-xl shadow-cyan-900/5 border border-slate-100 max-w-sm hover:shadow-cyan-900/10 transition-all hover:-translate-y-1">
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
            <div className="p-6 border-t border-slate-200 bg-gradient-to-b from-white to-slate-50/50">
               {!result ? (
                    <button 
                        onClick={handleAnalyze}
                        disabled={loading || wordCount < MIN_WORDS}
                        className={`w-full py-4 rounded-xl font-black text-base transition-all flex items-center justify-center gap-2.5 active:scale-[0.97] relative overflow-hidden ${loading || wordCount < MIN_WORDS ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white shadow-xl shadow-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-500/40'}`}
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
                                <Zap size={20} fill="currentColor" className="text-cyan-200 drop-shadow-sm"/>
                                <span className="relative z-10">Analyze Essay</span>
                            </>
                        )}
                    </button>
               ) : (
                     <div className="flex gap-3">
                        <button 
                            onClick={handleReset}
                            className="flex-1 py-4 rounded-xl font-bold text-slate-600 bg-white border-2 border-slate-200 hover:border-cyan-400 hover:text-cyan-600 hover:bg-cyan-50 hover:shadow-lg hover:shadow-cyan-100 transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
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
            {!result ? (
                // Empty State
                <div className="h-full min-h-[400px] bg-gradient-to-br from-white via-slate-50/30 to-cyan-50/20 p-10 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-cyan-300 transition-all duration-300">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" />
                    <div className="relative z-10 space-y-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-cyan-50 to-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-2 shadow-lg shadow-slate-200/50 group-hover:scale-110 transition-transform">
                          <BarChart3 size={36} />
                      </div>
                      <h3 className="font-black text-xl text-slate-700 mb-2">Metrics Awaiting...</h3>
                      <p className="text-sm text-slate-500 max-w-xs leading-relaxed">Submit your writing to get comprehensive AI grading and feedback with detailed metrics.</p>
                      <div className="flex gap-2 justify-center pt-2">
                        <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse" />
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}} />
                        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}} />
                      </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-5 animate-fade-in-up">
                    
                    {/* AI Feedback Card - Moved to top of sidebar */}
                    <div className="bg-gradient-to-br from-white via-white to-cyan-50/20 rounded-2xl border border-cyan-200 shadow-lg shadow-cyan-500/10 p-6 relative overflow-hidden group hover:shadow-xl hover:shadow-cyan-500/15 transition-all duration-300">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-100 to-transparent rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity" />
                        
                        <div className="flex items-center gap-2.5 mb-4 relative z-10">
                            <div className="p-2 bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-lg shadow-md shadow-cyan-500/20">
                                <Quote size={18} />
                            </div>
                            <div>
                              <h3 className="font-black text-base text-slate-800">AI Feedback</h3>
                              <p className="text-xs text-cyan-600 font-bold">Examiner Insights</p>
                            </div>
                        </div>
                        
                        <div className="text-slate-700 leading-relaxed text-sm bg-white/50 p-4 rounded-xl border border-slate-200/50 relative z-10 max-h-[300px] overflow-y-auto hide-scrollbar">
                            {result.general_feedback.split('\n').map((line: string, i: number) => (
                                <p key={i} className={`mb-2 last:mb-0 ${line.startsWith('**') ? 'font-bold text-slate-900 mt-2' : ''}`}>
                                    {line.replace(/\*\*/g, '')}
                                </p>
                            ))}
                        </div>
                    </div>
                    
                    {/* Score Card */}
                    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 rounded-2xl shadow-2xl shadow-slate-900/20 border-2 border-slate-700 relative overflow-hidden flex flex-col items-center justify-center min-h-[180px] group hover:shadow-slate-900/30 transition-all duration-300">
                         {/* Background trang trí */}
                         <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500 rounded-full blur-[80px] opacity-30 pointer-events-none glow-effect"></div>
                         <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500 rounded-full blur-[60px] opacity-20 pointer-events-none glow-effect" style={{animationDelay: '1.5s'}}></div>
                         
                         <div className="relative z-10 text-center">
                            <div className="flex items-center justify-center gap-2 mb-3">
                              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                              <p className="text-xs font-black text-cyan-400 uppercase tracking-widest">Overall Band Score</p>
                              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                            </div>
                            <div className="flex items-center justify-center gap-4">
                                <span className="text-8xl font-black tracking-tighter text-white drop-shadow-2xl">{result.score}</span>
                                {parseFloat(result.score) >= 7.0 && (
                                    <Sparkles className="text-yellow-400 animate-pulse drop-shadow-glow" size={28} />
                                )}
                            </div>
                            <p className="text-cyan-300 text-sm font-semibold mt-3 opacity-90">AI Assessment Complete</p>
                         </div>
                    </div>

                    {/* Error Interaction Area */}
                    <div>
                        {mode === 'vocab' ? (
                            <div className="bg-gradient-to-br from-cyan-500 via-cyan-600 to-teal-600 text-white p-7 rounded-2xl shadow-2xl shadow-cyan-500/20 relative overflow-hidden group hover:shadow-cyan-500/30 transition-all duration-300">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Sparkles size={18} className="text-yellow-300 animate-pulse"/>
                                        <span className="text-xs font-black uppercase tracking-widest">Elite Phrasing</span>
                                    </div>
                                    <h3 className="text-xl font-black mb-3 drop-shadow-sm">Refined by Wrytt AI</h3>
                                    <p className="text-sm text-cyan-50 leading-relaxed font-medium">
                                        Your essay has been rewritten to meet strict <b className="text-white">academic standards</b>. Compare the changes to learn.
                                    </p>
                                </div>
                            </div>
                        ) : activeError ? (
                            <div className="bg-gradient-to-br from-white to-red-50/30 p-7 rounded-2xl border-2 border-red-100 shadow-xl shadow-red-500/10 relative overflow-hidden group hover:shadow-2xl hover:shadow-red-500/15 transition-all duration-300">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity" />
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-5">
                                        <span className="px-3 py-1.5 bg-gradient-to-r from-red-50 to-red-100 text-red-700 text-xs font-black uppercase tracking-wider rounded-lg shadow-sm">
                                            {activeError.error_type}
                                        </span>
                                        <button onClick={() => setActiveError(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"><X size={18}/></button>
                                    </div>
                                    <p className="text-sm text-slate-700 mb-6 font-medium leading-relaxed bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                        <span className="text-xs text-slate-500 uppercase font-bold block mb-2">AI Suggestion:</span>
                                        <span className="text-base italic">"{activeError.explanation}"</span>
                                    </p>
                                    <div className="flex flex-col gap-2.5">
                                        <button 
                                            onClick={() => handleOpenLesson(activeError.error_type)}
                                            className="w-full py-2.5 bg-white border-2 border-slate-200 text-slate-600 hover:text-cyan-600 hover:border-cyan-300 hover:bg-cyan-50 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all uppercase tracking-wide shadow-sm hover:shadow-md active:scale-[0.98]"
                                        >
                                            <BookOpen size={16} /> Review Lesson
                                        </button>
                                        <button 
                                            onClick={() => applyFix(activeError)}
                                            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all active:scale-[0.98]"
                                        >
                                            <Check size={18} /> Apply Fix
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gradient-to-br from-white to-slate-50/50 p-8 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center h-full min-h-[200px] relative overflow-hidden group hover:border-cyan-200 transition-all">
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/0 via-cyan-50/30 to-blue-50/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 mb-3 group-hover:scale-110 transition-transform">
                                        <PencilLine size={24} />
                                    </div>
                                    <p className="text-sm text-slate-600 font-medium">Select any highlighted text to view details.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Error List */}
                    <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden flex flex-col max-h-[350px] hover:shadow-xl transition-shadow">
                        <div className="p-5 bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200">
                             <h4 className="font-black text-xs text-slate-600 uppercase tracking-widest flex items-center gap-2.5">
                                <div className="p-1.5 bg-white rounded-lg shadow-sm">
                                    <History size={14} className="text-slate-500" />
                                </div>
                                <span>Detected Issues ({result.core_errors.length})</span>
                            </h4>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-2 hide-scrollbar">
                             {result.core_errors.length > 0 ? (
                                result.core_errors.map((e: any, i: number) => (
                                    <button 
                                        key={i} 
                                        onClick={() => setActiveError(e)}
                                        className={`w-full text-left p-4 rounded-xl text-xs transition-all duration-200 border-2 shadow-sm hover:shadow-md ${activeError === e ? 'bg-gradient-to-r from-cyan-50 to-cyan-100/50 border-cyan-300 text-cyan-900 shadow-cyan-100' : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200 text-slate-600'}`}
                                    >
                                        <div className="font-bold truncate mb-1.5 text-sm">"{e.quote}"</div>
                                        <div className={`text-[10px] uppercase tracking-wider font-black ${activeError === e ? 'text-cyan-600' : 'text-slate-400'}`}>{e.error_type}</div>
                                    </button>
                                ))
                             ) : (
                                <div className="py-10 text-center space-y-2">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mx-auto mb-2">
                                        <Check size={20} />
                                    </div>
                                    <p className="text-slate-500 text-sm font-semibold">No errors found.</p>
                                    <p className="text-slate-400 text-xs">Great job!</p>
                                </div>
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