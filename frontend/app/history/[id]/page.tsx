"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Clock, Zap, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { translateError } from "@/lib/errorMapping";
import QuizView from "@/components/QuizView"; // [IMPORT MỚI]

export default function HistoryDetail() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  
  // [STATE MỚI] Thay vì Modal, ta dùng viewMode để switch giao diện
  const [isReviewing, setIsReviewing] = useState(false); 

  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const { lang } = useLanguage();

  const fetchDetail = async () => {
    // Query giữ nguyên
    const { data: submission, error } = await supabase
      .from("submissions")
      .select(`
        *,
        analysis_results (id, error_type, explanation, suggestion, severity, is_resolved)
      `)
      .eq("id", params.id)
      .single();

    if (error || !submission) { router.push("/dashboard"); return; }
    setData(submission);
    setLoading(false);
  };

  useEffect(() => { fetchDetail(); }, [params.id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const unresolvedErrors = data?.analysis_results.filter((e: any) => !e.is_resolved) || [];

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header & Comparison Area (GIỮ NGUYÊN) */}
        <button onClick={() => router.back()} className="flex items-center text-slate-500 hover:text-indigo-600 mb-4">
          <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
        </button>
        {/* ... (Phần Title và So sánh bài viết giữ nguyên, không đổi gì) ... */}
        
        {/* --- KHU VỰC THÔNG MINH (Smart Area) --- */}
        {/* Ở đây ta dùng điều kiện: Nếu đang Review thì hiện QuizView, không thì hiện List */}
        
        {isReviewing ? (
            // === MODE 1: QUIZ VIEW (Inline Replacement) ===
            <div className="animate-fade-in">
                <QuizView 
                    errors={unresolvedErrors}
                    language={lang}
                    onSuccess={() => {
                        setIsReviewing(false); // Quay lại list
                        fetchDetail(); // Load lại để thấy tích xanh
                    }}
                    onCancel={() => setIsReviewing(false)}
                />
            </div>
        ) : (
            // === MODE 2: ERROR LIST VIEW ===
            <div className="animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h3 className="text-2xl font-bold text-slate-900">Detailed Analysis</h3>
                    
                    {unresolvedErrors.length > 0 ? (
                        <button 
                            onClick={() => setIsReviewing(true)} // Bấm nút này -> List biến mất -> Quiz hiện ra
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold shadow-xl shadow-indigo-200 flex items-center gap-3 transform hover:-translate-y-1 transition-all"
                        >
                            <Zap size={24} fill="currentColor" className="animate-pulse"/>
                            <div>
                                <span className="block text-sm opacity-90 font-normal">Ready to improve?</span>
                                <span className="block">Start Review Quiz ({unresolvedErrors.length} issues)</span>
                            </div>
                        </button>
                    ) : (
                        <div className="bg-green-100 text-green-700 px-6 py-3 rounded-xl font-bold flex items-center gap-2 border border-green-200">
                            <Check size={24} /> All errors resolved! You are amazing.
                        </div>
                    )}
                </div>

                {/* Grid danh sách lỗi */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.analysis_results.map((err: any) => (
                        <div key={err.id} className={`p-6 rounded-2xl border shadow-sm transition-all ${err.is_resolved ? "bg-green-50 border-green-200 opacity-70" : "bg-white border-slate-200 hover:shadow-lg hover:border-indigo-200"}`}>
                            <div className="flex justify-between items-start mb-3">
                                <span className={`font-bold ${err.is_resolved ? "text-green-700" : "text-red-600"}`}>
                                    {translateError(err.error_type, lang)}
                                </span>
                                {err.is_resolved && <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full font-bold">Resolved</span>}
                            </div>
                            <p className="text-slate-600 mb-4 leading-relaxed">{err.explanation}</p>
                            <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-700 font-medium border border-slate-100">
                                Tip: {err.suggestion}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </main>
  );
}