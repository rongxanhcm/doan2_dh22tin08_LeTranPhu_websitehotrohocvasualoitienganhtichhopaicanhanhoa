"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { translateError } from "@/lib/errorMapping";
import { 
  Zap, Shuffle, Lightbulb, Globe, ChevronDown, 
  Sparkles, X, Check, Wand2, ArrowLeft, 
  History, PencilLine, BookOpen, Quote, Lock 
} from "lucide-react";
import toast from "react-hot-toast";
import PricingModal from "@/components/PricingModal"; // [MỚI]
// --- REFINED ANIMATIONS ---
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
  @keyframes bounce-in {
    0% { transform: scale(0.9); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
  .animate-reveal-text {
    background-color: transparent; 
    will-change: clip-path;
    animation: clip-reveal 1.2s cubic-bezier(0.19, 1, 0.22, 1) forwards;
  }
  .animate-scan-line {
    position: absolute;
    top: 0; bottom: 0; width: 3px;
    background: linear-gradient(to bottom, transparent, #6366f1, transparent);
    box-shadow: 0 0 20px 2px rgba(99, 102, 241, 0.6);
    z-index: 30;
    animation: scan-line 1.2s cubic-bezier(0.19, 1, 0.22, 1) forwards;
  }
  .animate-bounce-in {
    animation: bounce-in 0.3s cubic-bezier(0.19, 1, 0.22, 1) forwards;
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
  const [user, setUser] = useState<any>(null);
  const [hasPolishedOnce, setHasPolishedOnce] = useState(false);

  const [showPricingModal, setShowPricingModal] = useState(false); // [MỚI]
// (Bỏ cái state showLimitModal cũ đi hoặc tái sử dụng logic này cho gọn)
  const router = useRouter();
  const supabase = createClient();
  const { t, lang, setLang } = useLanguage();

  const MIN_WORDS = 20;
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

  useEffect(() => {
    const checkUser = async () => { 
        const { data: { user } } = await supabase.auth.getUser(); 
        setUser(user); 
    };
    checkUser();
    randomizeTopic();
  }, []);

  const randomizeTopic = () => setCurrentTopic(SHORT_TOPICS[Math.floor(Math.random() * SHORT_TOPICS.length)]);

const handleUpgradeSuccess = async () => {
    // [DEBUG] In ra xem có ID không?
    console.log("DEBUG UPGRADE:", {
        sub_id: result?.submission_id,
        user_id: user?.id
    });

    // Nếu không có ID thì chặn luôn, đỡ gọi API tốn công
    if (!result?.submission_id) {
        toast.error("Không tìm thấy ID bài viết. Hãy thử viết một bài mới!");
        return;
    }    
      // Nếu đang có kết quả phân tích mà chưa có bản Band 9.0
      if (result && !result.polished_text && result.submission_id) {
          const toastId = toast.loading("Unlocking Band 9.0 Version...");
          try {
              const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
              
              // Gọi API nâng cấp bài cũ
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

              // Cập nhật State ngay lập tức (Real-time update)
              setResult((prev: any) => ({
                  ...prev,
                  polished_text: data.polished_text
              }));

              toast.success("Unlocked!", { id: toastId });
              
              // Tự động chuyển sang tab Vocab để user thấy hàng nóng
              setMode("vocab");
              setIsAnimating(true);
              setTimeout(() => setIsAnimating(false), 1200);

          } catch (error) {
              toast.error("Could not unlock essay automatically.", { id: toastId });
          }
      } else {
          // Trường hợp user mua khi chưa phân tích bài nào -> Chỉ cần reload nhẹ để cập nhật quyền
           toast.success("You are now Pro! Start writing.");
      }
  };
  
  const handleAnalyze = async () => {
    if (wordCount < MIN_WORDS) return;
    setLoading(true);
    setResult(null);
    setActiveError(null);
    setMode("grammar");
    setHasPolishedOnce(false); 

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            text: inputText, 
            user_id: user?.id || null, 
            language: lang, 
            native_language: nativeLang 
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        
        // [QUAN TRỌNG] Bắt lỗi 403 từ backend để hiện Modal nạp tiền
        if (response.status === 403 || (errData.detail && errData.detail.includes("limit"))) {
            setShowPricingModal(true); // Bật luôn bảng giá lên thay vì modal báo lỗi riêng lẻ
                toast.error("Daily limit reached! Upgrade to continue.");
                return;
        }
        throw new Error(errData.detail || "Analysis failed");
      }

      const data = await response.json();
      setResult(data);
      toast.success("Analysis complete!", { icon: '🚀' });
    } catch (error: any) {
      if (!setShowPricingModal) {
         toast.error(error.message || "Could not analyze essay.");
      }
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
    toast.success("Corrected!");
  };

  const switchMode = (newMode: "grammar" | "vocab") => {
      // Logic: Luôn chạy animation mỗi khi bấm vào vocab (nếu là Pro User - có text)
      if (newMode === "vocab" && result?.polished_text) {
          setMode("vocab");
          setIsAnimating(true);
          setHasPolishedOnce(true);
          setTimeout(() => setIsAnimating(false), 1200);
      } else {
          setMode(newMode); // Nếu Free User thì chuyển mode bình thường (để hiện khóa)
      }
      setActiveError(null);
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-indigo-100 relative">
      <style>{enhancedStyles}</style>
      
      {/* --- TOP NAVIGATION --- */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <button onClick={() => router.push("/dashboard")} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                    <Zap size={18} fill="currentColor" />
                </div>
                <span className="font-black text-xl tracking-tight">CoreFix <span className="text-indigo-600">AI</span></span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
                onClick={() => setLang(lang === 'en' ? 'vi' : 'en')}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
            >
                {lang === 'en' ? '🇺🇸 EN' : '🇻🇳 VN'}
            </button>
            <div className="h-6 w-[1px] bg-slate-200 mx-2 hidden md:block" />
            <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Account</p>
                    <p className="text-sm font-bold text-slate-700">{user?.email?.split('@')[0] || "Guest"}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-full border-2 border-white shadow-md" />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT COLUMN: INPUT & EDITOR (8 Cols) --- */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Topic Card */}
          <div className="bg-white p-6 rounded-[32px] border border-slate-200/60 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote size={80} />
            </div>
            <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                        <Lightbulb size={12} /> Writing Prompt
                    </div>
                    <button onClick={randomizeTopic} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-all active:rotate-180 duration-500">
                        <Shuffle size={18} />
                    </button>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 leading-snug font-serif">"{currentTopic}"</h2>
            </div>
          </div>

          {/* Main Editor Card */}
          <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-xl shadow-slate-200/50 flex flex-col min-h-[650px] overflow-hidden">
            
            {/* Editor Toolbar */}
            <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-white/50">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl">
                    <Globe size={14} className="text-slate-500" />
                    <select 
                        value={nativeLang} 
                        onChange={(e) => setNativeLang(e.target.value)}
                        className="bg-transparent text-xs font-bold text-slate-600 focus:outline-none cursor-pointer"
                    >
                        {SUPPORTED_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                    </select>
                </div>
                <div className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest ${wordCount < MIN_WORDS ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {wordCount} Words
                </div>
              </div>

              {result && (
                <div className="flex bg-slate-100 p-1 rounded-2xl">
                    <button 
                        onClick={() => switchMode("grammar")}
                        className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${mode === 'grammar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        GRAMMAR
                    </button>
                    <button 
                        onClick={() => switchMode("vocab")}
                        className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${mode === 'vocab' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Sparkles size={12}/> VOCAB ULTIMATE
                    </button>
                </div>
              )}
            </div>

            {/* Writing Area */}
            <div className="flex-1 p-8 md:p-12 overflow-y-auto hide-scrollbar">
              {!result ? (
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={t.placeholder}
                  className="w-full h-full min-h-[400px] bg-transparent border-0 focus:ring-0 resize-none text-xl text-slate-700 placeholder:text-slate-200 font-serif leading-relaxed"
                  spellCheck={false}
                />
              ) : (
                <div className="relative min-h-[400px]">
                  {mode === 'grammar' ? (
                    // --- GRAMMAR MODE ---
                    <div className="text-xl text-slate-700 font-serif whitespace-pre-wrap leading-relaxed animate-fade-in">
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
                                        className={`cursor-pointer border-b-3 transition-all duration-300 ${activeError === err ? 'bg-rose-100 border-rose-500 text-rose-700 shadow-[0_4px_12px_rgba(244,63,94,0.2)]' : 'border-rose-300 hover:bg-rose-50'}`}
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
 // --- VOCAB MODE ---
<div className="relative h-full bg-white"> {/* Thêm bg-white ở đây để đảm bảo nền sạch */}
  {result.polished_text ? (
    <div className="relative w-full min-h-[300px] bg-white">
      
      {/* LỚP 1: TEXT CŨ (Nằm dưới) */}
      {isAnimating && (
        <div className="absolute inset-0 top-0 left-0 w-full h-full text-xl text-slate-300 font-serif whitespace-pre-wrap leading-relaxed select-none z-0">
          {inputText}
        </div>
      )}

      {/* LỚP 2: TEXT MỚI (Nằm trên) */}
      <div 
        className={`text-xl text-indigo-900 font-serif whitespace-pre-wrap leading-relaxed relative z-10 bg-white ${isAnimating ? 'animate-reveal-text' : ''}`}
        style={{ backgroundColor: 'white' }} // Đảm bảo lớp này đặc, che hoàn toàn lớp dưới
      >
        {result.polished_text}
      </div>
      
      {/* LỚP 3: THANH SÁNG */}
      {isAnimating && (
        <div className="animate-scan-line pointer-events-none" />
      )}
    </div>
  ) : (
                            // [FREE USER] Không có bài văn -> Hiển thị Ổ KHÓA
                            <div className="relative w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-indigo-200 p-8 text-center overflow-hidden">
                                
                                {/* Background mờ ảo chữ để kích thích */}
                                <div className="absolute inset-0 opacity-20 blur-[3px] pointer-events-none select-none p-12 text-left font-serif text-xl leading-relaxed text-indigo-900">
                                    In contemporary discourse, the omnipresence of digital technology has catalyzed a paradigm shift in educational methodologies. Proponents argue that...
                                    (Content Hidden)
                                </div>

                                {/* Thẻ khóa */}
                                <div className="z-10 bg-white p-8 rounded-[32px] shadow-2xl shadow-indigo-200/50 border border-white ring-4 ring-indigo-50 max-w-sm animate-bounce-in">
                                    <div className="mx-auto w-14 h-14 bg-gradient-to-tr from-indigo-500 to-violet-500 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                                        <Lock size={24} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 mb-2">Unlock Band 9.0 Rewrite</h3>
                                    <p className="text-slate-500 mb-6 text-sm font-medium leading-relaxed">
                                        See how AI transforms your essay with <b>C2 Vocabulary</b> & <b>Advanced Structures</b>.
                                    </p>
                                    <button 
                                        onClick={() => setShowPricingModal(true)}
                                        className="w-full py-3.5 bg-slate-900 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-xl transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
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
            <div className="p-6 bg-slate-50/50 border-t border-slate-100">
               {!result ? (
                    <button 
                        onClick={handleAnalyze}
                        disabled={loading || wordCount < MIN_WORDS}
                        className={`w-full py-4 rounded-[20px] font-black text-white shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${loading || wordCount < MIN_WORDS ? 'bg-slate-300' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                {t.button_analyzing}
                            </div>
                        ) : (
                            <>
                                <Zap size={20} fill="currentColor" className="text-yellow-300"/>
                                {t.button_analyze}
                            </>
                        )}
                    </button>
               ) : (
                    <div className="flex gap-4">
                         <button 
                            onClick={() => {setResult(null); setActiveError(null);}}
                            className="flex-1 py-4 rounded-[20px] font-black text-slate-500 border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                        >
                            <PencilLine size={20} /> New Essay
                        </button>
                    </div>
               )}
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: INTELLIGENCE SIDEBAR (4 Cols) --- */}
        <div className="lg:col-span-4 space-y-6">
            {!result ? (
                <div className="bg-white p-8 rounded-[32px] border border-slate-200 border-dashed flex flex-col items-center justify-center text-center space-y-4 h-full min-h-[400px]">
                    <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300">
                        <BookOpen size={32} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">Ready to Upgrade?</h3>
                        <p className="text-sm text-slate-400 max-w-[200px] mx-auto">Submit your text to see AI feedback and Band scores.</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 animate-fade-in-right">
                    {/* Score Card */}
                    <div className="bg-slate-900 text-white p-8 rounded-[32px] shadow-2xl relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/40 transition-all duration-700" />
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Estimated Band</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-6xl font-black tracking-tighter">{result.score}</span>
                            <span className="text-xl font-bold text-slate-500">/ 9.0</span>
                        </div>
                        <div className="mt-4 p-3 bg-white/5 rounded-2xl border border-white/10 text-xs text-indigo-100 italic leading-relaxed">
                           "{result.general_feedback}"
                        </div>
                    </div>

                    {/* Contextual Action Box */}
                    <div className="min-h-[220px]">
                        {mode === 'vocab' ? (
                            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-6 rounded-[32px] shadow-lg border border-indigo-400/30">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="p-2 bg-white/10 rounded-lg"><Wand2 size={16} className="text-yellow-300"/></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Vocabulary Upgrade</span>
                                </div>
                                <h3 className="text-xl font-black mb-2">Smart Rewrite</h3>
                                <p className="text-sm text-indigo-100 leading-relaxed opacity-90">
                                    We've enhanced your essay with <b>academic collocations</b> and <b>C1/C2 vocabulary</b> while maintaining your original meaning.
                                </p>
                            </div>
                        ) : activeError ? (
                            <div className="bg-white p-6 rounded-[32px] border-2 border-rose-100 shadow-xl shadow-rose-100/20 animate-bounce-in">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                                        {translateError(activeError.error_type, lang)}
                                    </span>
                                    <button onClick={() => setActiveError(null)} className="text-slate-300 hover:text-slate-500"><X size={18}/></button>
                                </div>
                                <p className="text-sm text-slate-600 mb-6 font-medium leading-relaxed italic">
                                    "{activeError.explanation}"
                                </p>
                                <button 
                                    onClick={() => applyFix(activeError)}
                                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 transition-all active:scale-95"
                                >
                                    <Check size={18} /> Apply Fix: "{activeError.suggestion}"
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white p-8 rounded-[32px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center h-full">
                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                    <PencilLine size={20} className="text-slate-300" />
                                </div>
                                <p className="text-xs font-bold text-slate-400 leading-relaxed px-4">
                                    Click on <span className="text-rose-400 underline decoration-2">highlighted errors</span> to see AI suggestions.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Issues List Card */}
                    <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-sm flex flex-col overflow-hidden max-h-[400px]">
                        <div className="p-5 border-b border-slate-50 flex justify-between items-center">
                            <h4 className="font-black text-xs text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <History size={14} /> Critical Issues ({result.core_errors.length})
                            </h4>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 hide-scrollbar">
                            {result.core_errors.length > 0 ? (
                                result.core_errors.map((e: any, i: number) => (
                                    <div 
                                        key={i} 
                                        onClick={() => setActiveError(e)}
                                        className={`p-4 rounded-[20px] cursor-pointer transition-all border-l-4 ${activeError === e ? 'bg-rose-50 border-rose-500 shadow-sm' : 'hover:bg-slate-50 border-transparent'}`}
                                    >
                                        <p className="text-xs font-black text-slate-700 mb-1 truncate">"{e.quote}"</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{translateError(e.error_type, lang)}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center">
                                    <Check size={32} className="mx-auto text-emerald-400 mb-2 opacity-30" />
                                    <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No errors found!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* --- DAILY LIMIT MODAL --- */}
{/* --- DAILY LIMIT MODAL --- */}
      </div>
    <PricingModal 
        isOpen={showPricingModal} 
        onClose={() => setShowPricingModal(false)}
        onSuccess={handleUpgradeSuccess} // [QUAN TRỌNG] Truyền hàm callback vào
      />
    </main>
  );
}