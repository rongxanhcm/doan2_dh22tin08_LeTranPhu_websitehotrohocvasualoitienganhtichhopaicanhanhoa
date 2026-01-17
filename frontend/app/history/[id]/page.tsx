"use client";
import { translateError } from "@/lib/errorMapping";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter, useParams } from "next/navigation"; // useParams để lấy ID từ URL
import { ArrowLeft, Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext"; // Import Context lấy lang
export default function HistoryDetail() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const { lang } = useLanguage();
  const params = useParams(); // Lấy ID bài viết
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchDetail = async () => {
      // Lấy thông tin bài viết + danh sách lỗi (Join bảng)
      // Lưu ý: Supabase JS có thể query lồng nhau
      const { data: submission, error } = await supabase
        .from("submissions")
        .select(`
          *,
          analysis_results (
            error_type,
            explanation,
            suggestion,
            severity
          )
        `)
        .eq("id", params.id)
        .single(); // Chỉ lấy 1 bài

      if (error || !submission) {
        alert("Cannot find this essay!");
        router.push("/dashboard");
        return;
      }

      setData(submission);
      setLoading(false);
    };

    fetchDetail();
  }, [params.id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Navigation */}
        <button 
          onClick={() => router.back()}
          className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors mb-4"
        >
          <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
        </button>

        {/* Title & Score */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Essay Review</h1>
            <div className="flex items-center text-slate-400 text-sm mt-2">
              <Clock size={16} className="mr-1" />
              {new Date(data.created_at).toLocaleString()}
            </div>
          </div>
          <div className="text-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
             <div className="text-4xl font-black text-indigo-600">{data.score}</div>
             <div className="text-xs font-bold text-slate-400 uppercase">Score</div>
          </div>
        </div>

        {/* --- SO SÁNH: ORIGINAL vs CORRECTED --- */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Cột Trái: Bài gốc của User */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100">
            <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Your Original Text</h3>
            <p className="whitespace-pre-wrap text-slate-600 leading-relaxed font-serif text-lg">
              {data.original_text}
            </p>
          </div>

          {/* Cột Phải: Bài sửa của AI */}
          <div className="bg-slate-900 p-6 rounded-2xl shadow-lg text-slate-300">
            <h3 className="font-bold text-emerald-400 mb-4 border-b border-slate-700 pb-2">AI Corrected Version</h3>
            <p className="whitespace-pre-wrap leading-relaxed font-serif text-lg text-slate-100">
              {data.corrected_text}
            </p>
          </div>
        </div>

        {/* --- DANH SÁCH LỖI CHI TIẾT --- */}
        <div className="mt-8">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Detailed Analysis</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.analysis_results.map((err: any, idx: number) => (
                    <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                            {/* DỊCH TÊN LỖI Ở ĐÂY */}
                            <span className="font-bold text-red-600 text-sm">
                                {translateError(err.error_type, lang)}
                            </span>
                            <span className="font-bold text-red-600 text-sm">{err.error_type}</span>
                            <span className="text-[10px] uppercase font-bold bg-slate-100 px-2 py-1 rounded text-slate-500">{err.severity}</span>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{err.explanation}</p>
                        <div className="bg-green-50 p-2 rounded text-sm text-green-800 font-medium">
                            Tip: {err.suggestion}
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </main>
  );
}   