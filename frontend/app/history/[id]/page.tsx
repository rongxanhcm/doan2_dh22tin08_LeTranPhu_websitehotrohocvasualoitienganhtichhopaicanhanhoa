"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, Clock, Zap, Check, FileText, 
  Sparkles, AlertTriangle, BookOpen, ChevronRight 
} from "lucide-react"; 
import { useLanguage } from "@/context/LanguageContext";
import { translateError } from "@/lib/errorMapping";
import QuizView from "@/components/QuizView";
import { HistorySkeleton } from "@/components/Skeleton";
import HighlightText from "@/components/HighlightText";

// [MỚI 1] Import Modal và hàm lấy luật
import GrammarLessonModal from "@/components/GrammarLessonModal";
import { fetchRuleByKey, GrammarRule } from "@/lib/grammarRules";

export default function HistoryDetail() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [isReviewing, setIsReviewing] = useState(false); 

  // [MỚI 2] State cho Modal
  const [selectedRule, setSelectedRule] = useState<GrammarRule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const { lang, t } = useLanguage();

  // [MỚI 3] Hàm mở Modal (gọi dữ liệu động từ DB/File)
  const handleOpenLesson = async (errorType: string) => {
    const rule = await fetchRuleByKey(errorType);
    setSelectedRule(rule);
    setIsModalOpen(true);
  };

  const fetchDetail = async () => {
    const { data: submission, error } = await supabase
      .from("submissions")
      .select(`
        *,
        analysis_results (id, error_type, explanation, suggestion, severity, is_resolved, quote)
      `)
      .eq("id", params.id)
      .single();

    if (error || !submission) { router.push("/dashboard"); return; }
    setData(submission);
    setLoading(false);
  };

  useEffect(() => { fetchDetail(); }, [params.id]);

  if (loading) return <HistorySkeleton />;

  const unresolvedErrors = data?.analysis_results.filter((e: any) => !e.is_resolved) || [];
  const scoreColor = data.score >= 7.0 ? "text-emerald-600" : data.score >= 5.0 ? "text-indigo-600" : "text-amber-600";

  const formattedDate = new Date(data.created_at).toLocaleDateString(
    lang === 'vi' ? 'vi-VN' : 'en-US', 
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  );

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-900">
      
      {/* [MỚI 4] Chèn Modal vào đây */}
      <GrammarLessonModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          rule={selectedRule} 
      />

      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* --- 1. HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <button onClick={() => router.back()} className="group flex items-center text-slate-500 hover:text-indigo-600 transition-colors mb-2 font-medium">
                    <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
                    {t.back_dashboard}
                </button>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t.history_title}</h1>
                <div className="flex items-center text-slate-500 text-sm mt-2 font-medium">
                    <Clock size={16} className="mr-1.5" />
                    {t.submitted_on} {formattedDate}
                </div>
            </div>

            {/* Score Card */}
            <div className="bg-white px-8 py-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center min-w-[140px]">
                 <span className={`text-5xl font-black ${scoreColor} drop-shadow-sm`}>{data.score}</span>
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{t.score_label}</span>
            </div>
        </div>

        {/* --- 2. ESSAY COMPARISON --- */}
        <div className="grid md:grid-cols-2 gap-8 animate-fade-in-up">
            {/* Cột Trái: Original */}
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-3 text-slate-700 font-bold">
                    <FileText size={20} className="text-red-500"/>
                    <h3>{t.orig_draft}</h3>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 h-full relative"> 
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-400 rounded-l-2xl"></div>
                    <HighlightText 
                        text={data.original_text} 
                        errors={data.analysis_results} 
                    />
                    <div className="absolute -bottom-4 -right-4 text-red-50 opacity-10 transform -rotate-12 pointer-events-none z-0">
                        <FileText size={120} />
                    </div>
                </div>
            </div>

            {/* Cột Phải: Corrected */}
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-3 text-slate-700 font-bold">
                    <Sparkles size={20} className="text-emerald-500"/>
                    <h3>{t.ai_version}</h3>
                </div>
                <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800 h-full relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                    <p className="whitespace-pre-wrap text-slate-200 leading-loose font-sans text-xl tracking-wide">
                        {data.corrected_text}
                    </p>
                    <div className="absolute -bottom-4 -right-4 text-emerald-900 opacity-20 transform -rotate-12 pointer-events-none">
                        <Sparkles size={120} />
                    </div>
                </div>
            </div>
        </div>

        <hr className="border-slate-200" />

        {/* --- 3. SMART ANALYSIS & QUIZ AREA --- */}
        <section className="space-y-6">
            
            {isReviewing ? (
                // === MODE: QUIZ VIEW ===
                <div className="animate-fade-in">
                    <div className="flex items-center gap-2 mb-6 text-indigo-700 bg-indigo-50 p-3 rounded-lg w-fit pr-6">
                        <BookOpen size={20} />
                        <span className="font-bold">{t.practice_mode}</span>
                        <span className="text-slate-400 text-sm">| {t.focusing_on} {unresolvedErrors.length} {t.issues}</span>
                    </div>
                    <QuizView 
                        errors={unresolvedErrors}
                        language={lang}
                        onSuccess={() => { setIsReviewing(false); fetchDetail(); }}
                        onCancel={() => setIsReviewing(false)}
                    />
                </div>
            ) : (
                // === MODE: ERROR LIST VIEW ===
                <div className="animate-fade-in">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                <AlertTriangle className="text-amber-500" size={24}/>
                                {t.analysis_title}
                            </h3>
                            <p className="text-slate-500 mt-1">
                                {t.found_points} <b>{data.analysis_results.length}</b> {t.points_improve} 
                                {unresolvedErrors.length > 0 && <span className="text-indigo-600 font-medium ml-1">{t.still_have} {unresolvedErrors.length} {t.fixes_learn}</span>}
                            </p>
                        </div>
                        
                        {/* Nút Action */}
                        {unresolvedErrors.length > 0 ? (
                            <button 
                                onClick={() => setIsReviewing(true)}
                                className="group bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-xl font-bold shadow-xl shadow-indigo-200 flex items-center gap-3 transition-all hover:-translate-y-1"
                            >
                                <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors">
                                    <Zap size={24} fill="currentColor" className="text-yellow-300"/>
                                </div>
                                <div className="text-left">
                                    <span className="block text-xs uppercase opacity-80 font-bold tracking-wider">{t.rec_label}</span>
                                    <span className="block text-lg">{t.start_quiz}</span>
                                </div>
                                <ChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity -ml-2 group-hover:ml-0" />
                            </button>
                        ) : (
                            <div className="bg-emerald-100 text-emerald-800 px-6 py-3 rounded-xl font-bold flex items-center gap-3 border border-emerald-200 shadow-sm">
                                <div className="bg-emerald-200 p-2 rounded-full">
                                    <Check size={20} className="text-emerald-700"/>
                                </div>
                                <div>
                                    <span className="block text-sm opacity-80">{t.mission_complete}</span>
                                    <span className="block">{t.all_resolved}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Grid danh sách lỗi */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.analysis_results.map((err: any) => (
                            <div 
                                key={err.id} 
                                className={`flex flex-col p-6 rounded-2xl border transition-all duration-300 group
                                ${err.is_resolved 
                                    ? "bg-emerald-50/50 border-emerald-100 opacity-80 grayscale-[0.3] hover:grayscale-0" 
                                    : "bg-white border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1" 
                                }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-8 rounded-full ${err.is_resolved ? 'bg-emerald-400' : 'bg-red-500'}`}></div>
                                        <div>
                                            <span className={`block font-bold text-sm ${err.is_resolved ? "text-emerald-700" : "text-red-600"}`}>
                                                {translateError(err.error_type, lang)}
                                            </span>
                                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                                                {err.error_type}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {err.is_resolved ? (
                                        <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wide border border-emerald-200">{t.resolved_label}</span>
                                    ) : (
                                        <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wide">
                                            {err.severity}
                                        </span>
                                    )}
                                </div>

                                <p className="text-slate-600 text-sm mb-4 leading-relaxed flex-grow">
                                    {err.explanation}
                                </p>
                                
                                {/* [MỚI 5] Nút Xem bài học (Chỉ hiện nếu chưa resolved) */}
                                {!err.is_resolved && (
                                    <button 
                                        onClick={() => handleOpenLesson(err.error_type)}
                                        className="text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors mb-3 w-fit"
                                    >
                                        <BookOpen size={14}/> {t.review_lesson_btn}
                                    </button>
                                )}

                                <div className={`mt-auto p-3 rounded-lg text-sm font-medium border ${err.is_resolved ? 'bg-emerald-100/50 text-emerald-800 border-emerald-100' : 'bg-indigo-50 text-indigo-800 border-indigo-100'}`}>
                                    <span className="flex items-center gap-2 mb-1 text-xs uppercase opacity-70 font-bold">
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
    </main>
  );
}