"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, Clock, Zap, Check, FileText, 
  Sparkles, AlertTriangle, BookOpen, ChevronRight,
  Wand2, Lock, Lightbulb, Shield, BarChart3, CheckCircle
} from "lucide-react"; 
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
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
`;

export default function HistoryDetail() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [isReviewing, setIsReviewing] = useState(false); 
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [viewMode, setViewMode] = useState<"corrected" | "polished">("corrected");
  
  const [user, setUser] = useState<any>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedRule, setSelectedRule] = useState<GrammarRule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  // --- FIX LOGIC: Dùng useMemo để tránh QuizView bị re-render liên tục ---
  const unresolvedErrors = useMemo(() => {
    return data?.analysis_results.filter((e: any) => !e.is_resolved) || [];
  }, [data?.analysis_results]);

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
        router.push("/dashboard");
        return; 
    }
    setData(submission);
    setLoading(false);
  };

  useEffect(() => { fetchDetail(); }, [params.id]);

  const handleSwitchMode = (mode: "corrected" | "polished") => {
      if (mode === "polished" && data?.polished_text) {
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 1200);
      }
      setViewMode(mode);
  };

  const handleUpgradeSuccess = async () => {
    if (!data?.id || !user?.id) return;
    const toastId = toast.loading("Unlocking Band 9.0 version...");
    try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${API_URL}/upgrade-submission`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ submission_id: data.id, user_id: user.id })
        });

        if (!res.ok) throw new Error("Upgrade failed");
        const resData = await res.json();

        setData((prev: any) => ({ ...prev, polished_text: resData.polished_text }));
        toast.success("Unlocked!", { id: toastId });
        handleSwitchMode("polished");
    } catch (error) {
        toast.error("Unlock failed.", { id: toastId });
    }
  };

  if (loading) return <HistorySkeleton />;

  const formattedDate = new Date(data.created_at).toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  });

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-cyan-100">
      <style>{enhancedStyles}</style>
      
      {/* Background Dot Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.4]" 
           style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      <GrammarLessonModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} rule={selectedRule} />

      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8 relative z-10">
        
        {/* --- HEADER --- */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in-up">
            <div className="space-y-4">
                <button onClick={() => router.push("/dashboard")} className="group flex items-center text-slate-400 hover:text-cyan-600 transition-colors font-bold text-xs uppercase tracking-widest">
                    <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
                    Back to Dashboard
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Essay Analysis</h1>
                    <div className="flex items-center text-slate-500 text-xs font-medium bg-slate-50 px-3 py-1.5 rounded-lg w-fit border border-slate-100">
                        <Clock size={14} className="mr-2 text-slate-400" />
                        Submitted on {formattedDate}
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 px-8 py-6 rounded-xl shadow-xl shadow-slate-900/10 flex flex-col items-center min-w-[180px] border border-slate-800">
                 <span className="text-5xl font-black text-cyan-400 tracking-tighter">{data.score.toFixed(1)}</span>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Overall Band Score</span>
            </div>
        </div>
        
        {/* --- COMPARISON AREA (Side-by-side) --- */}
        <div className="grid lg:grid-cols-2 gap-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            
            {/* Left: Original Draft */}
            <div className="flex flex-col h-full space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <div className="p-1.5 bg-red-50 text-red-600 rounded-md border border-red-100"><FileText size={16}/></div>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide italic">Marked Draft</h3>
                </div>
                
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex-1 min-h-[500px] overflow-hidden relative"> 
                    {/* Thanh accent đỏ cho cột trái */}
                    <div className="absolute top-8 left-0 w-1 h-12 bg-red-500 rounded-r-full shadow-[0_0_10px_rgba(239,68,68,0.4)]" />
                    
                    <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
                        <HighlightText text={data.original_text} errors={data.analysis_results} />
                    </div>
                </div>
            </div>

            {/* Right: AI Version Switcher */}
            <div className="flex flex-col h-full space-y-4">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        {viewMode === 'corrected' ? (
                             <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100"><Check size={16}/></div>
                        ) : (
                             <div className="p-1.5 bg-cyan-50 text-cyan-600 rounded-md border border-cyan-100"><Sparkles size={16}/></div>
                        )}
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                            {viewMode === 'corrected' ? "Grammar Fix" : "Band 9.0 Ultimate"}
                        </h3>
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                        <button 
                            onClick={() => handleSwitchMode('corrected')}
                            className={`px-4 py-1.5 text-[10px] font-bold rounded-md transition-all ${viewMode === 'corrected' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            STANDARD
                        </button>
                        <button 
                            onClick={() => handleSwitchMode('polished')}
                            className={`px-4 py-1.5 text-[10px] font-bold rounded-md transition-all flex items-center gap-1.5 ${viewMode === 'polished' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Sparkles size={12}/> ELITE
                        </button>
                    </div>
                </div>

                <div className={`relative p-8 rounded-2xl shadow-xl flex-1 min-h-[500px] overflow-hidden border transition-all duration-500 ${viewMode === 'corrected' ? 'bg-slate-900 border-slate-800' : 'bg-white border-cyan-100'}`}>
                    {viewMode === 'corrected' ? (
                        <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
                            <p className="whitespace-pre-wrap text-slate-300 leading-loose font-serif text-lg">
                                {data.corrected_text}
                            </p>
                        </div>
                    ) : (
                        <div className="h-full relative overflow-y-auto pr-2 custom-scrollbar">
                            {data.polished_text ? (
                                <div className="relative">
                                    {isAnimating && (
                                        <div className="absolute inset-0 text-lg text-slate-200 font-serif whitespace-pre-wrap leading-loose select-none z-0">
                                            {data.corrected_text}
                                        </div>
                                    )}
                                    <div className={`text-lg text-slate-900 font-serif whitespace-pre-wrap leading-loose relative z-10 bg-white ${isAnimating ? 'animate-reveal-text' : ''}`}>
                                        {data.polished_text}
                                    </div>
                                    {isAnimating && <div className="animate-scan-line pointer-events-none" />}
                                    
                                    <div className="mt-8 p-4 bg-cyan-50 rounded-xl border border-cyan-100 text-xs text-cyan-800 flex items-start gap-3">
                                        <Lightbulb size={18} className="text-cyan-600 shrink-0"/>
                                        <p className="font-medium leading-relaxed">This elite version employs complex rhetorical devices and academic collocations.</p>
                                    </div>
                                </div>
                            ) : (
                                // LOCKED STATE
                                <div className="h-full flex flex-col items-center justify-center text-center relative">
                                    <div className="absolute inset-0 text-left opacity-10 select-none blur-[2px] font-serif text-lg text-slate-900 overflow-hidden pointer-events-none">
                                        {data.original_text}
                                    </div>
                                    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-2xl max-w-sm relative z-10">
                                        <div className="mx-auto w-12 h-12 bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center mb-6 border border-cyan-100">
                                            <Lock size={24} />
                                        </div>
                                        <h4 className="text-xl font-bold text-slate-900 mb-2">Elite Version Locked</h4>
                                        <p className="text-slate-500 text-sm mb-8 leading-relaxed">Upgrade to Pro to access Band 9.0 rewrites.</p>
                                        <button 
                                            onClick={() => setShowPricingModal(true)}
                                            className="w-full py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-cyan-600 transition-all flex justify-center items-center gap-2 shadow-lg shadow-slate-900/20"
                                        >
                                            <Sparkles size={16} /> Upgrade & Unlock
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>

        <hr className="border-slate-200 my-8" />

        {/* --- DIAGNOSTICS AREA --- */}
        <section className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {isReviewing ? (
                // QUIZ VIEW CONTAINER (Updated Colors)
                <div className="bg-white p-8 rounded-2xl border border-cyan-100 shadow-xl shadow-cyan-900/5">
                    <div className="flex items-center gap-2 mb-8 text-cyan-700 bg-cyan-50 px-4 py-2 rounded-xl w-fit border border-cyan-100">
                        <BookOpen size={20} />
                        <span className="font-bold uppercase tracking-widest text-xs">Practice Mode</span>
                        <span className="text-cyan-400 text-xs font-medium">| {unresolvedErrors.length} issues remaining</span>
                    </div>
                    {/* TRUYỀN unresolvedErrors VÀO ĐÂY */}
                    <QuizView 
                        errors={unresolvedErrors}
                        language={data.target_language || "English"}
                        onSuccess={() => { setIsReviewing(false); fetchDetail(); }}
                        onCancel={() => setIsReviewing(false)}
                    />
                </div>
            ) : (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                <div className="p-2 bg-slate-900 text-white rounded-lg shadow-lg"><BarChart3 size={20}/></div>
                                Diagnostic Report
                            </h3>
                            <p className="text-sm text-slate-500 mt-2">
                                {unresolvedErrors.length > 0 ? (
                                    <span>
                                        You have <b className="text-red-600 font-black px-1.5 py-0.5 bg-red-50 rounded mx-1">{unresolvedErrors.length} issues</b> that need immediate attention.
                                    </span>
                                ) : (
                                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                                        <CheckCircle size={14}/> Perfect! All identified issues have been mastered.
                                    </span>
                                )}
                            </p>
                        </div>
                        
                        {unresolvedErrors.length > 0 && (
                            <button 
                                onClick={() => setIsReviewing(true)}
                                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold shadow-xl shadow-red-600/20 transition-all flex items-center gap-3 active:scale-95 animate-pulse hover:animate-none"
                            >
                                <Zap size={20} fill="currentColor" className="text-yellow-300"/>
                                Fix Remaining Issues
                            </button>
                        )}
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.analysis_results.map((err: any) => (
                            <div 
                                key={err.id} 
                                className={`flex flex-col p-6 rounded-2xl border transition-all duration-300 group relative overflow-hidden
                                ${err.is_resolved 
                                    ? "bg-slate-50 border-slate-100 opacity-60 grayscale" 
                                    : "bg-white border-slate-200 shadow-md hover:shadow-xl hover:border-red-300" 
                                }`}
                            >
                                <div className={`absolute -right-4 -top-2 text-4xl font-black opacity-[0.03] select-none uppercase transition-all group-hover:opacity-[0.07] ${err.is_resolved ? 'text-emerald-900' : 'text-red-900'}`}>
                                    {err.is_resolved ? 'Solved' : err.severity}
                                </div>

                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="space-y-1">
                                        <span className={`block font-black text-xs uppercase tracking-tighter ${err.is_resolved ? "text-emerald-600" : "text-red-600"}`}>
                                            {translateError(err.error_type, 'en')}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{err.error_type}</span>
                                    </div>
                                    {err.is_resolved ? (
                                        <div className="p-1 bg-emerald-100 text-emerald-600 rounded-full shadow-inner"><Check size={14} strokeWidth={4}/></div>
                                    ) : (
                                        <div className="p-1 bg-red-100 text-red-600 rounded-full animate-bounce shadow-sm"><AlertTriangle size={14}/></div>
                                    )}
                                </div>

                                <p className={`text-sm mb-6 leading-relaxed font-medium grow ${err.is_resolved ? 'text-slate-400' : 'text-slate-700'}`}>
                                    "{err.explanation}"
                                </p>
                                
                                <div className="space-y-4 mt-auto relative z-10">
                                    {!err.is_resolved && (
                                        <button 
                                            onClick={() => handleOpenLesson(err.error_type)}
                                            className="text-[10px] font-black text-slate-400 hover:text-cyan-600 flex items-center gap-1.5 transition-colors uppercase tracking-widest"
                                        >
                                            <BookOpen size={12}/> Study this rule
                                        </button>
                                    )}
                                    
                                    <div className={`p-4 rounded-xl text-xs font-bold border transition-all ${
                                        err.is_resolved 
                                        ? 'bg-slate-100 border-slate-200 text-slate-500' 
                                        : 'bg-emerald-50 text-emerald-700 border-emerald-100 group-hover:bg-emerald-100 group-hover:scale-[1.02]'
                                    }`}>
                                        <div className="text-[10px] uppercase opacity-50 mb-1 flex justify-between">
                                            <span>Correct Version</span>
                                            {!err.is_resolved && <Sparkles size={10} className="text-emerald-500 animate-pulse"/>}
                                        </div>
                                        <span className="text-sm font-serif">"{err.suggestion}"</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
      </div>
      
      <PricingModal isOpen={showPricingModal} onClose={() => setShowPricingModal(false)} onSuccess={handleUpgradeSuccess} />
    </main>
  );
}