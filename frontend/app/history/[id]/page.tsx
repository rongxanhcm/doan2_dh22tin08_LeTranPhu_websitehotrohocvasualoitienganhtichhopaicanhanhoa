"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, Clock, Zap, Check, FileText, 
  Sparkles, AlertTriangle, BookOpen, ChevronRight,
  Wand2, Lock, Lightbulb, Shield
} from "lucide-react"; 
import { useLanguage } from "@/context/LanguageContext";
import { translateError } from "@/lib/errorMapping";
import QuizView from "@/components/QuizView";
import { HistorySkeleton } from "@/components/Skeleton";
import HighlightText from "@/components/HighlightText";
import toast from "react-hot-toast";
import PricingModal from "@/components/PricingModal";
import GrammarLessonModal from "@/components/GrammarLessonModal";
import { fetchRuleByKey, GrammarRule } from "@/lib/grammarRules";

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
`;

export default function HistoryDetail() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [isReviewing, setIsReviewing] = useState(false); 
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [viewMode, setViewMode] = useState<"corrected" | "polished">("corrected");
  
  // States cho User và Hiệu ứng
  const [user, setUser] = useState<any>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const [selectedRule, setSelectedRule] = useState<GrammarRule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const { lang, t } = useLanguage();

  const handleOpenLesson = async (errorType: string) => {
    const rule = await fetchRuleByKey(errorType);
    setSelectedRule(rule);
    setIsModalOpen(true);
  };

  const fetchDetail = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    const { data: submission, error } = await supabase
      .from("submissions")
      .select(`
        *,
        analysis_results:analysis_results!fk_analysis_submissions (
            id, error_type, explanation, suggestion, severity, is_resolved, quote
        )
      `)
      .eq("id", params.id)
      .single();

    if (error || !submission) { 
        console.error("❌ Lỗi lấy bài viết:", error);
        return; 
    }
    setData(submission);
    setLoading(false);
  };

  useEffect(() => { fetchDetail(); }, [params.id]);

  // Hàm chuyển đổi tab có kèm hiệu ứng
  const handleSwitchMode = (mode: "corrected" | "polished") => {
      if (mode === "polished" && data?.polished_text) {
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 1200);
      }
      setViewMode(mode);
  };

  // Hàm xử lý "Hồi tố" - Nâng cấp bài cũ ngay lập tức
  const handleUpgradeSuccess = async () => {
    if (!data?.id || !user?.id) return;

    const toastId = toast.loading("Unlocking Band 9.0 Version for this essay...");
    try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        
        const res = await fetch(`${API_URL}/upgrade-submission`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                submission_id: data.id,
                user_id: user.id 
            })
        });

        if (!res.ok) throw new Error("Upgrade failed");
        const resData = await res.json();

        setData((prev: any) => ({
            ...prev,
            polished_text: resData.polished_text
        }));

        toast.success("Unlocked successfully!", { id: toastId });
        
        // Tự động chuyển tab và bật hiệu ứng lau kính
        handleSwitchMode("polished");

    } catch (error) {
        console.error(error);
        toast.error("Could not unlock essay automatically.", { id: toastId });
    }
  };

  if (loading) return <HistorySkeleton />;

  const unresolvedErrors = data?.analysis_results.filter((e: any) => !e.is_resolved) || [];
  const scoreColor = data.score >= 7.0 ? "text-emerald-600" : data.score >= 5.0 ? "text-indigo-600" : "text-amber-600";

  const formattedDate = new Date(data.created_at).toLocaleDateString(
    lang === 'vi' ? 'vi-VN' : 'en-US', 
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  );

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans text-slate-900 selection:bg-indigo-100">
      <style>{enhancedStyles}</style>
      
      <GrammarLessonModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          rule={selectedRule} 
      />

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- HEADER --- */}
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-200/60 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in-up">
            <div>
                <button onClick={() => router.back()} className="group flex items-center text-slate-400 hover:text-indigo-600 transition-colors mb-3 font-bold text-sm uppercase tracking-widest">
                    <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
                    {t.back_dashboard}
                </button>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{t.history_title}</h1>
                <div className="flex items-center text-slate-500 text-sm mt-2 font-medium bg-slate-50 px-3 py-1.5 rounded-lg w-fit">
                    <Clock size={16} className="mr-2 text-slate-400" />
                    {t.submitted_on} {formattedDate}
                </div>
            </div>

            <div className="bg-slate-900 px-8 py-5 rounded-[24px] shadow-xl shadow-slate-900/20 flex flex-col items-center min-w-[160px] relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                 <span className={`text-6xl font-black ${scoreColor} drop-shadow-md tracking-tighter relative z-10`}>{data.score}</span>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 relative z-10">{t.score_label}</span>
            </div>
        </div>

        {/* --- ESSAY COMPARISON (SIDE-BY-SIDE) --- */}
        <div className="grid lg:grid-cols-2 gap-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            
            {/* Cột Trái: Original */}
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4 px-2">
                    <div className="p-1.5 bg-rose-100 text-rose-600 rounded-lg"><FileText size={18}/></div>
                    <h3 className="font-bold text-slate-700">{t.orig_draft}</h3>
                </div>
                
                <div className="bg-white p-8 rounded-[32px] border border-slate-200/60 shadow-sm flex-1 relative min-h-[500px] overflow-hidden"> 
                    {/* Thẻ line accent */}
                    <div className="absolute top-8 left-0 w-1.5 h-12 bg-rose-400 rounded-r-full" />
                    
                    <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
                        <HighlightText text={data.original_text} errors={data.analysis_results} />
                    </div>
                </div>
            </div>

            {/* Cột Phải: Switcher */}
            <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex items-center gap-2">
                        {viewMode === 'corrected' ? (
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg"><Check size={18}/></div>
                                <h3 className="font-bold text-slate-700">{t.ai_version}</h3>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg"><Wand2 size={18}/></div>
                                <h3 className="font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Band 9.0 Ultimate</h3>
                            </div>
                        )}
                    </div>

                    {/* Switcher Toggle */}
                    <div className="flex bg-slate-200/70 p-1.5 rounded-xl shadow-inner">
                        <button 
                            onClick={() => handleSwitchMode('corrected')}
                            className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${viewMode === 'corrected' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            STANDARD
                        </button>
                        <button 
                            onClick={() => handleSwitchMode('polished')}
                            className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all flex items-center gap-1.5 ${viewMode === 'polished' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Sparkles size={12}/> BAND 9.0
                        </button>
                    </div>
                </div>

                {/* Right Content Box */}
                <div className={`relative p-8 rounded-[32px] shadow-xl flex-1 min-h-[500px] overflow-hidden border transition-all duration-500 ${viewMode === 'corrected' ? 'bg-slate-900 border-slate-800' : 'bg-gradient-to-br from-slate-50 to-indigo-50/30 border-indigo-200'}`}>
                    
                    {/* Line accent */}
                    <div className={`absolute top-8 left-0 w-1.5 h-12 rounded-r-full transition-colors ${viewMode === 'corrected' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />

                    {viewMode === 'corrected' ? (
                        // 1. STANDARD FIX
                        <div className="animate-fade-in h-full overflow-y-auto pr-2 custom-scrollbar">
                            <p className="whitespace-pre-wrap text-slate-200 leading-loose font-sans text-lg tracking-wide">
                                {data.corrected_text}
                            </p>
                            <div className="absolute -bottom-10 -right-10 text-emerald-900 opacity-20 transform -rotate-12 pointer-events-none">
                                <Sparkles size={160} />
                            </div>
                        </div>
                    ) : (
                        // 2. BAND 9.0 MODE
                        <div className="h-full relative overflow-y-auto pr-2 custom-scrollbar">
                            {data.polished_text ? (
                                // [PRO USER] Đã có dữ liệu
                                <div className="relative">
                                    {isAnimating && (
                                        <div className="absolute inset-0 text-lg text-slate-300 font-serif whitespace-pre-wrap leading-loose select-none z-0">
                                            {data.corrected_text}
                                        </div>
                                    )}
                                    <div className={`text-lg text-indigo-950 font-serif whitespace-pre-wrap leading-loose relative z-10 ${isAnimating ? 'animate-reveal-text' : ''}`}>
                                        {data.polished_text}
                                    </div>
                                    {isAnimating && <div className="animate-scan-line pointer-events-none" />}
                                    
                                    <div className="mt-8 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 text-sm text-indigo-800 flex items-start gap-3">
                                        <div className="bg-white p-2 rounded-xl shadow-sm"><Lightbulb size={18} className="text-yellow-500"/></div>
                                        <p className="font-medium leading-relaxed">This version utilizes C2 level vocabulary and complex grammatical structures to maximize Lexical Resource and Grammatical Range scores.</p>
                                    </div>
                                </div>
                            ) : (
                                // [FREE USER] Khóa UI
                                <div className="h-full flex flex-col items-center justify-center text-center relative z-10">
                                    {/* Text mờ làm nền */}
                                    <div className="absolute inset-0 text-left opacity-30 select-none blur-[4px] font-serif text-lg text-slate-400 overflow-hidden pointer-events-none">
                                        In contemporary discourse, the omnipresence of digital technology has catalyzed a paradigm shift in educational methodologies. Proponents argue that...
                                        (Content Hidden)
                                    </div>

                                    {/* Box Lock */}
                                    <div className="bg-white p-8 rounded-[32px] border border-white ring-4 ring-indigo-50 shadow-2xl shadow-indigo-200/50 max-w-sm animate-bounce-in relative z-20">
                                        <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-indigo-500 to-violet-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
                                            <Lock size={28} />
                                        </div>
                                        <h4 className="text-2xl font-black text-slate-900 mb-2">Band 9.0 Locked</h4>
                                        <p className="text-slate-500 text-sm mb-8 font-medium leading-relaxed">
                                            Upgrade to Pro to instantly rewrite this essay with native-level vocabulary and advanced structures.
                                        </p>
                                        
                                        <button 
                                            onClick={() => setShowPricingModal(true)}
                                            className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-indigo-600 transition-all shadow-xl hover:-translate-y-1 flex justify-center items-center gap-2"
                                        >
                                            <Sparkles size={18} className="text-yellow-400" /> Upgrade & Unlock
                                        </button>
                                        <div className="mt-4 flex items-center justify-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                            <Shield size={12}/> Secure 1-Click Upgrade
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>

        <hr className="border-slate-200 my-8" />

        {/* --- QUIZ & ERROR AREA --- */}
        <section className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {isReviewing ? (
                <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm animate-fade-in">
                    <div className="flex items-center gap-2 mb-8 text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl w-fit">
                        <BookOpen size={20} />
                        <span className="font-black uppercase tracking-widest text-sm">{t.practice_mode}</span>
                        <span className="text-indigo-400 text-sm font-medium">| {unresolvedErrors.length} {t.issues} remaining</span>
                    </div>
                    <QuizView 
                        errors={unresolvedErrors}
                        language={data.target_language || "English"}
                        onSuccess={() => { setIsReviewing(false); fetchDetail(); }}
                        onCancel={() => setIsReviewing(false)}
                    />
                </div>
            ) : (
                <div className="bg-white p-8 rounded-[32px] border border-slate-200/60 shadow-sm">
                     <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                <div className="p-2 bg-amber-100 text-amber-600 rounded-xl"><AlertTriangle size={24}/></div>
                                {t.analysis_title}
                            </h3>
                            <p className="text-slate-500 mt-2 font-medium">
                                {t.found_points} <b className="text-slate-800">{data.analysis_results.length}</b> {t.points_improve}. 
                                {unresolvedErrors.length > 0 && <span className="text-rose-500 font-bold ml-1">{unresolvedErrors.length} {t.fixes_learn}</span>}
                            </p>
                        </div>
                        
                        {unresolvedErrors.length > 0 ? (
                            <button 
                                onClick={() => setIsReviewing(true)}
                                className="group bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-indigo-200 flex items-center gap-4 transition-all hover:-translate-y-1"
                            >
                                <div className="bg-white/20 p-2.5 rounded-xl group-hover:bg-white/30 transition-colors">
                                    <Zap size={24} fill="currentColor" className="text-yellow-300"/>
                                </div>
                                <div className="text-left">
                                    <span className="block text-[10px] uppercase opacity-80 tracking-widest mb-0.5">{t.rec_label}</span>
                                    <span className="block text-lg leading-none">{t.start_quiz}</span>
                                </div>
                                <ChevronRight className="opacity-0 group-hover:opacity-100 transition-all -ml-4 group-hover:ml-0 text-indigo-200" />
                            </button>
                        ) : (
                            <div className="bg-emerald-50 text-emerald-800 px-8 py-4 rounded-2xl font-bold flex items-center gap-4 border border-emerald-100 shadow-sm">
                                <div className="bg-emerald-500 p-2 rounded-full text-white shadow-md shadow-emerald-200">
                                    <Check size={20} strokeWidth={3}/>
                                </div>
                                <div>
                                    <span className="block text-[10px] uppercase opacity-70 tracking-widest mb-0.5">{t.mission_complete}</span>
                                    <span className="block text-lg leading-none">{t.all_resolved}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.analysis_results.map((err: any) => (
                            <div 
                                key={err.id} 
                                className={`flex flex-col p-6 rounded-[24px] border transition-all duration-300 group
                                ${err.is_resolved 
                                    ? "bg-emerald-50/30 border-emerald-100 opacity-70 grayscale-[0.2] hover:grayscale-0" 
                                    : "bg-white border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-indigo-300 hover:-translate-y-1" 
                                }`}
                            >
                                <div className="flex justify-between items-start mb-5">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-1.5 h-10 rounded-full mt-1 ${err.is_resolved ? 'bg-emerald-400' : 'bg-rose-500'}`}></div>
                                        <div>
                                            <span className={`block font-black text-sm mb-0.5 ${err.is_resolved ? "text-emerald-700" : "text-rose-600"}`}>
                                                {translateError(err.error_type, lang)}
                                            </span>
                                            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                                                {err.error_type}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {err.is_resolved ? (
                                        <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2.5 py-1 rounded-md font-black uppercase tracking-widest border border-emerald-200">{t.resolved_label}</span>
                                    ) : (
                                        <span className="bg-slate-100 text-slate-500 text-[10px] px-2.5 py-1 rounded-md font-black uppercase tracking-widest">
                                            {err.severity}
                                        </span>
                                    )}
                                </div>

                                <p className="text-slate-600 text-sm mb-5 leading-relaxed font-medium flex-grow">
                                    "{err.explanation}"
                                </p>
                                
                                {!err.is_resolved && (
                                    <button 
                                        onClick={() => handleOpenLesson(err.error_type)}
                                        className="text-xs font-bold text-indigo-500 hover:text-indigo-700 flex items-center gap-1.5 transition-colors mb-4 w-fit bg-indigo-50 px-3 py-1.5 rounded-lg"
                                    >
                                        <BookOpen size={14}/> {t.review_lesson_btn}
                                    </button>
                                )}

                                <div className={`mt-auto p-4 rounded-xl text-sm font-medium border ${err.is_resolved ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-slate-50 text-slate-800 border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 group-hover:text-indigo-900 transition-colors'}`}>
                                    <span className="flex items-center gap-2 mb-1.5 text-[10px] uppercase opacity-60 font-black tracking-widest">
                                        <Sparkles size={12} /> {t.suggestion_label}
                                    </span>
                                    {err.suggestion}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>

      </div>
      
      <PricingModal 
          isOpen={showPricingModal} 
          onClose={() => setShowPricingModal(false)} 
          onSuccess={handleUpgradeSuccess}
      />
    </main>
  );
}