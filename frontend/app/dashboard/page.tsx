"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { 
  TrendingUp, AlertTriangle, FileText, 
  ArrowRight, CheckCircle, Target, BookOpen 
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { translateError } from "@/lib/errorMapping";
import { DashboardSkeleton } from "@/components/Skeleton";
import GrammarLessonModal from "@/components/GrammarLessonModal";
import { getRule, GrammarRule } from "@/lib/grammarRules";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEssays: 0,
    avgScore: 0,
    topErrors: [] as { name: string; originalName: string; count: number }[],
    recentActivity: [] as any[],
    priorityError: null as any, 
    resolutionRate: 0,
    unresolvedCount: 0
  });
  
  const [selectedRule, setSelectedRule] = useState<GrammarRule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const router = useRouter();
  const supabase = createClient();
  const { t, lang, setLang } = useLanguage();

  const handleOpenLesson = (errorType: string) => {
    const rule = getRule(errorType);
    setSelectedRule(rule);
    setIsModalOpen(true);
  };

  useEffect(() => {     
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

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
        .select("error_type, is_resolved, submission_id")
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
            name: translateError(name, lang),
            originalName: name,
            count 
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const errorStats: Record<string, { total: number, resolved: number, latestUnresolvedId: string | null }> = {};
      errors?.forEach((err) => {
        const type = err.error_type.trim();
        if (!errorStats[type]) errorStats[type] = { total: 0, resolved: 0, latestUnresolvedId: null };
        errorStats[type].total += 1;
        if (err.is_resolved) {
            errorStats[type].resolved += 1;
        } else {
            if (!errorStats[type].latestUnresolvedId) errorStats[type].latestUnresolvedId = err.submission_id;
        }
      });

      let maxUnresolved = -1;
      let priorityErrObj = null;

      Object.entries(errorStats).forEach(([type, stat]) => {
          const unresolvedCount = stat.total - stat.resolved;
          if (unresolvedCount > maxUnresolved && unresolvedCount > 0) {
              maxUnresolved = unresolvedCount;
              priorityErrObj = {
                  type: type, 
                  displayType: translateError(type, lang),
                  total: stat.total,
                  resolved: stat.resolved,
                  unresolved: unresolvedCount,
                  targetId: stat.latestUnresolvedId
              };
          }
      });

      setStats({
        totalEssays: submissions.length,
        avgScore: Number(avgScore),
        topErrors,
        recentActivity: submissions.slice(0, 3),
        priorityError: priorityErrObj,
        resolutionRate: priorityErrObj ? Math.round((priorityErrObj.resolved / priorityErrObj.total) * 100) : 0,
        unresolvedCount: maxUnresolved
      });
      
      setLoading(false);
    };

    fetchData();
  }, [lang]);

  const toggleLanguage = () => setLang(lang === "en" ? "vi" : "en");

  if (loading) return <DashboardSkeleton />;

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-900">
      
      <GrammarLessonModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          rule={selectedRule} 
      />

      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">{t.dash_title}</h1>
            <p className="text-slate-500 mt-1">{t.dash_subtitle}</p>
          </div>
          <div className="flex gap-3">
             <button onClick={toggleLanguage} className="px-3 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-sm font-bold transition-colors">
               {lang === "en" ? "🇻🇳 VN" : "🇺🇸 EN"}
             </button>
             <button onClick={() => router.push("/")} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors">
              ← {t.back_home}
            </button>
          </div>
        </div>

        {/* 1. Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl flex-shrink-0"><FileText size={24} /></div>
            <div>
              <p className="text-slate-500 text-sm font-medium">{t.total_essays}</p>
              <h3 className="text-3xl font-bold text-slate-900">{stats.totalEssays}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl flex-shrink-0"><TrendingUp size={24} /></div>
            <div>
              <p className="text-slate-500 text-sm font-medium">{t.avg_score}</p>
              <h3 className="text-3xl font-bold text-slate-900">{stats.avgScore}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <div className="p-3 bg-red-100 text-red-600 rounded-xl flex-shrink-0"><AlertTriangle size={24} /></div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-500 text-sm font-medium">{t.critical_issues}</p>
              <h3 className="text-2xl font-bold text-slate-900 break-words leading-tight"> 
                {stats.topErrors.length > 0 ? stats.topErrors[0].name : t.none}
              </h3>
            </div>
          </div>
        </div>

        {/* 2. Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Cột Trái: Danh sách lỗi & Bài học */}
          <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
              <TrendingUp className="text-indigo-500"/> 
              {t.areas_improvement} {/* [FIXED] */}
            </h3>
            
            <div className="space-y-6">
              {stats.topErrors.length > 0 ? (
                stats.topErrors.map((item, idx) => {
                  // Logic màu sắc: Top 1 là Đỏ, còn lại Xanh Indigo
                  const isTopOne = idx === 0;
                  const barColor = isTopOne ? "bg-red-500" : "bg-indigo-500";
                  const textColor = isTopOne ? "text-red-500 bg-red-50" : "text-indigo-600 bg-indigo-50";

                  return (
                    <div key={idx} className="group">
                        <div className="flex justify-between items-end mb-2">
                            <span className="font-bold text-slate-700 text-sm">{item.name}</span>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${textColor}`}>
                                {item.count} {t.mistakes_count} {/* [FIXED] */}
                            </span>
                        </div>
                        
                        <div className="w-full bg-slate-100 rounded-full h-2 mb-3 overflow-hidden">
                             <div 
                                className={`h-2 rounded-full transition-all duration-500 ${barColor} group-hover:opacity-80`} 
                                style={{ width: `${Math.min((item.count / stats.totalEssays) * 100, 100)}%` }} 
                             ></div>
                        </div>
                        
                        <button 
                            onClick={() => handleOpenLesson(item.originalName)}
                            className="text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors hover:translate-x-1"
                        >
                            <BookOpen size={12}/> {t.review_lesson_btn} <ArrowRight size={12}/> {/* [FIXED] */}
                        </button>
                    </div>
                  );
                })
              ) : (
                <div className="h-40 flex items-center justify-center text-slate-400 flex-col gap-2">
                   <CheckCircle size={32} className="text-slate-300"/>
                   <p>{t.no_data}</p>
                </div>
              )}
            </div>
          </div>

          {/* Cột Phải: AI Path */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[60px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div>
              <h3 className="font-bold text-lg text-white mb-1 flex items-center gap-2">
                <Target className="text-indigo-400"/> {t.ai_path}
              </h3>
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-6">{t.focus_week}</p> {/* [FIXED] */}

              {stats.priorityError ? (
                <div className="space-y-5 relative z-10">
                  <div>
                    <span className="text-xs font-bold bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">{t.high_priority}</span> {/* [FIXED] */}
                    <p className="font-black text-2xl mt-2 leading-tight">{stats.priorityError.displayType}</p>
                    <p className="text-slate-400 text-sm mt-1">
                        {t.total_occurrences} <span className="text-white font-bold">{stats.priorityError.total}</span> {/* [FIXED] */}
                    </p>
                  </div>
                  <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-emerald-400">{t.fixed_stat} {stats.priorityError.resolved}</span> {/* [FIXED] */}
                          <span className="text-red-400">{t.remaining_stat} {stats.priorityError.unresolved}</span> {/* [FIXED] */}
                      </div>
                      <div className="w-full bg-slate-700 h-3 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-1000" style={{ width: `${stats.resolutionRate}%` }} />
                      </div>
                      <p className="text-right text-xs text-slate-400 mt-1">{stats.resolutionRate}% {t.resolved_stat}</p> {/* [FIXED] */}
                  </div>
                  
                  <button 
                    onClick={() => handleOpenLesson(stats.priorityError.type)}
                    className="w-full py-3 bg-white hover:bg-indigo-50 text-slate-900 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-indigo-500/20 flex items-center justify-center gap-2"
                  >
                    <BookOpen size={16}/> {t.master_rule_btn} <ArrowRight size={16}/> {/* [FIXED] */}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center relative z-10">
                    <CheckCircle size={48} className="text-emerald-400 mb-3"/>
                    <p className="font-bold text-lg">{t.all_caught_up}</p> {/* [FIXED] */}
                    <p className="text-slate-400 text-sm">{t.no_critical_msg}</p> {/* [FIXED] */}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Recent Activity */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-lg text-slate-800 mb-4">{t.recent_subs}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-sm">
                  <th className="pb-3 font-medium pl-2">{t.table_date}</th>
                  <th className="pb-3 font-medium">{t.table_score}</th>
                  <th className="pb-3 font-medium">{t.table_feedback}</th>
                  <th className="pb-3 font-medium text-right pr-2">{t.table_action}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.recentActivity.map((item: any) => (
                  <tr key={item.id} className="group hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => router.push(`/history/${item.id}`)}>
                    <td className="py-4 text-slate-600 pl-2 font-medium">{new Date(item.created_at).toLocaleDateString()}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${item.score >= 6.0 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {item.score}
                      </span>
                    </td>
                    <td className="py-4 text-slate-500 text-sm max-w-md truncate">{t.review_hint}</td>
                    <td className="py-4 text-right pr-2">
                      <ArrowRight size={18} className="ml-auto text-slate-300 group-hover:text-indigo-600 transition-colors"/>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}