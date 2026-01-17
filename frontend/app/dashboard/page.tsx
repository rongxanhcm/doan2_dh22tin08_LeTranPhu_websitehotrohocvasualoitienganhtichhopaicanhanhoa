"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, FileText, Activity } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext"; // <--- IMPORT MỚI
import { translateError } from "@/lib/errorMapping";
export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEssays: 0,
    avgScore: 0,
    topErrors: [] as { name: string; count: number }[],
    recentActivity: [] as any[]
  });
  
  const router = useRouter();
  const supabase = createClient();
  const { t, lang, setLang } = useLanguage(); // <--- SỬ DỤNG CONTEXT

  useEffect(() => {     
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: submissions } = await supabase
        .from("submissions")
        .select("id, score, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!submissions || submissions.length === 0) {
        setLoading(false);
        return;
      }

      const submissionIds = submissions.map(s => s.id);
      const { data: errors } = await supabase
        .from("analysis_results")
        .select("error_type")
        .in("submission_id", submissionIds);

      const totalScore = submissions.reduce((acc, curr) => acc + (curr.score || 0), 0);
      const avgScore = (totalScore / submissions.length).toFixed(1);

        const errorCounts: Record<string, number> = {};
        errors?.forEach((err) => {
        const type = err.error_type.trim(); 
        errorCounts[type] = (errorCounts[type] || 0) + 1;
      });

        const topErrors = Object.entries(errorCounts)
        .map(([name, count]) => ({ 
            name: translateError(name, lang), // <--- DỊCH TẠI ĐÂY
            originalName: name, // Giữ lại tên gốc nếu cần logic sau này
            count 
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        totalEssays: submissions.length,
        avgScore: Number(avgScore),
        topErrors,
        recentActivity: submissions.slice(0, 3) 
      });
      
      setLoading(false);
    };

    fetchData();
  }, [lang]);

  // Hàm toggle ngôn ngữ
  const toggleLanguage = () => {
    setLang(lang === "en" ? "vi" : "en");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading analytics...</div>;

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Dashboard */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">{t.dash_title}</h1>
            <p className="text-slate-500 mt-1">{t.dash_subtitle}</p>
          </div>
          
          <div className="flex gap-3">
             {/* Nút Đổi Ngôn Ngữ */}
             <button 
               onClick={toggleLanguage}
               className="px-3 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-sm font-bold transition-colors"
             >
               {lang === "en" ? "🇻🇳 VN" : "🇺🇸 EN"}
             </button>

             <button 
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors"
            >
              ← {t.back_home}
            </button>
          </div>
        </div>

        {/* 1. Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl"><FileText size={24} /></div>
            <div>
              <p className="text-slate-500 text-sm font-medium">{t.total_essays}</p>
              <h3 className="text-3xl font-bold text-slate-900">{stats.totalEssays}</h3>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl"><TrendingUp size={24} /></div>
            <div>
              <p className="text-slate-500 text-sm font-medium">{t.avg_score}</p>
              <h3 className="text-3xl font-bold text-slate-900">{stats.avgScore}</h3>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-xl"><AlertTriangle size={24} /></div>
            <div>
              <p className="text-slate-500 text-sm font-medium">{t.critical_issues}</p>
              <h3 className="text-3xl font-bold text-slate-900">
                {stats.topErrors.length > 0 ? stats.topErrors[0].name : t.none}
              </h3>
            </div>
          </div>
        </div>

        {/* 4. RECENT HISTORY LIST */}
        <div className="col-span-1 md:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mt-6">
          <h3 className="font-bold text-lg text-slate-800 mb-4">{t.recent_subs}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-sm">
                  <th className="pb-3 font-medium">{t.table_date}</th>
                  <th className="pb-3 font-medium">{t.table_score}</th>
                  <th className="pb-3 font-medium">{t.table_feedback}</th>
                  <th className="pb-3 font-medium text-right">{t.table_action}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.recentActivity.map((item: any) => (
                  <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="py-4 text-slate-600">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold 
                        ${item.score >= 6.0 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {item.score}
                      </span>
                    </td>
                    <td className="py-4 text-slate-500 text-sm max-w-md truncate">
                      {t.review_hint}
                    </td>
                    <td className="py-4 text-right">
                      <button 
                        onClick={() => router.push(`/history/${item.id}`)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {t.view_details} →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {stats.recentActivity.length === 0 && (
              <p className="text-center text-slate-400 py-8">{t.no_data}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 2. MAIN CHART */}
          <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
              <Activity size={20} className="text-indigo-500"/> 
              {t.top_errors}
            </h3>
            
            {stats.topErrors.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.topErrors} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 12}} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={20}>
                      {stats.topErrors.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : '#6366f1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">
                {t.no_data}
              </div>
            )}
            <p className="text-xs text-slate-400 mt-4 text-center">
              {t.chart_note}
            </p>
          </div>

          {/* 3. Personalized Learning Plan */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg text-white mb-4">🎯 {t.ai_path}</h3>
              {stats.topErrors.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-slate-300 text-sm">{t.path_desc}</p>
                  <div className="p-3 bg-white/10 rounded-lg border border-white/10">
                    <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider">{t.priority}</span>
                    <p className="font-bold text-lg mt-1">{stats.topErrors[0].name}</p>
                    <button className="mt-3 w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-sm font-bold transition-colors">
                      {t.start_lesson}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 text-sm">{t.more_data_needed}</p>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/10">
               <p className="text-xs text-slate-500">{t.next_milestone}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}