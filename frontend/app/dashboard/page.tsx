"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { 
  TrendingUp, AlertTriangle, FileText, 
  ArrowRight, CheckCircle, Target, BookOpen, Download,
  Sparkles, Zap, Award, History, LayoutGrid, Calendar, Lock
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { translateError } from "@/lib/errorMapping";
import { DashboardSkeleton } from "@/components/Skeleton";
import GrammarLessonModal from "@/components/GrammarLessonModal";
import { fetchRuleByKey, GrammarRule } from "@/lib/grammarRules";
import PricingModal from "@/components/PricingModal"; // [MỚI] Tích hợp Modal bảng giá

// PDF Exports
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import toast from "react-hot-toast";
import DashboardReport from "@/components/DashboardReport";

const FREE_DAILY_LIMIT = 2; // Số lượt free mỗi ngày

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("User");
  // Hàm này sẽ tự động chạy khi PricingModal báo thanh toán thành công
  const handleUpgradeSuccess = () => {
      // Reload lại trang để update giao diện sang Pro
      window.location.reload(); 
  };
  // [MỚI] State lưu thông tin gói cước và số lượt dùng
  const [isPro, setIsPro] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [showPricingModal, setShowPricingModal] = useState(false);

  const [stats, setStats] = useState({
    totalEssays: 0,
    avgScore: 0,
    highestScore: 0,
    topErrors: [] as { name: string; originalName: string; count: number }[],
    recentActivity: [] as any[],
    priorityError: null as any, 
    resolutionRate: 0,
    unresolvedCount: 0,
    chartData: [] as { date: string; score: number }[]
  });
  
  const [selectedRule, setSelectedRule] = useState<GrammarRule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const router = useRouter();
  const supabase = createClient();
  const { t, lang, setLang } = useLanguage();

  const handleOpenLesson = async (errorType: string) => {
    const rule = await fetchRuleByKey(errorType);
    setSelectedRule(rule);
    setIsModalOpen(true);
  };

    const handleExportPDF = async () => {
        // [MỚI] CHẶN NGƯỜI DÙNG FREE TẠI ĐÂY
        if (!isPro) {
            toast.error(lang === 'vi' ? "Tính năng Xuất PDF chỉ dành cho tài khoản Pro!" : "PDF Export is only available for Pro users!", { icon: "🔒" });
            setShowPricingModal(true); // Bật bảng giá lên để upsell
            return;
        }

        if (!reportRef.current) return;
        setIsExporting(true);
        const toastId = toast.loading(lang === 'vi' ? "Đang tạo báo cáo..." : "Generating report...");

        try {
        const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdf.internal.pageSize.getHeight());
        pdf.save(`CoreFix_Report_${new Date().toISOString().slice(0,10)}.pdf`);
        toast.success(lang === 'vi' ? "Thành công!" : "Success!", { id: toastId });
        } catch (error) {
        toast.error("Error: " + error, { id: toastId });
        } finally {
        setIsExporting(false);
        }
    };

  useEffect(() => {     
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserEmail(user.email || "User");

      // [MỚI] Lấy thông tin gói cước từ user_usage
      const { data: usageData } = await supabase
        .from("user_usage")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (usageData) {
          setIsPro(usageData.is_pro);
          // Check ngày để hiển thị số lượt dùng chính xác
          const today = new Date();
          const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
          
          if (String(usageData.last_reset_date) === todayStr) {
              setUsageCount(usageData.usage_count);
          } else {
              setUsageCount(0); // Nếu sang ngày mới mà chưa có API trigger thì FE tự hiện là 0
          }
      }

      // [SỬA] Thêm select 'polished_text' để biết bài nào đã được nâng cấp
      const { data: submissions } = await supabase
          .from("submissions")
          .select("id, score, created_at, general_feedback, polished_text")
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
      const highestScore = Math.max(...submissions.map(s => s.score || 0));

      const chartData = submissions.slice(0, 7).reverse().map(s => ({
         date: new Date(s.created_at).toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'}),
         score: s.score || 0
      }));

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
      let priorityErrObj: any = null;
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
        highestScore: highestScore,
        topErrors,
        recentActivity: submissions.slice(0, 5),
        priorityError: priorityErrObj,
        resolutionRate: priorityErrObj ? Math.round((priorityErrObj.resolved / priorityErrObj.total) * 100) : 0,
        unresolvedCount: maxUnresolved,
        chartData: chartData
      });
      setLoading(false);
    };
    fetchData();
  }, [lang]);

  if (loading) return <DashboardSkeleton />;

  return (
    <main className="min-h-screen bg-[#fafafa] p-4 md:p-10 font-sans text-slate-900 selection:bg-indigo-100">
      
      {/* Hidden Report for PDF */}
      <div className="fixed top-0 left-0 -z-50 opacity-0 pointer-events-none overflow-hidden h-0 w-0">
         <DashboardReport 
            ref={reportRef}
            userEmail={userEmail}
            stats={{ totalEssays: stats.totalEssays, avgScore: stats.avgScore, highestScore: stats.highestScore }}
            recentSubs={stats.recentActivity}
            chartData={stats.chartData}
            language={lang}
         />
      </div>

      <GrammarLessonModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} rule={selectedRule} />
      
      {/* [MỚI] Pricing Modal */}
      <PricingModal isOpen={showPricingModal} onClose={() => setShowPricingModal(false) } onSuccess={handleUpgradeSuccess}/>

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-[32px] border border-slate-200/60 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm tracking-widest uppercase">
                <LayoutGrid size={16} /> 
                {userEmail}'s Dashboard
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                {lang === 'vi' ? 'Tổng quan tiến độ' : 'Your Progress'}
            </h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
             <button 
                onClick={() => setLang(lang === 'en' ? 'vi' : 'en')}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold hover:bg-slate-100 transition-all"
             >
                <span className="text-lg">{lang === 'en' ? '🇺🇸' : '🇻🇳'}</span>
                <span className="text-slate-600 uppercase tracking-widest">{lang}</span>
             </button>

             {/* [MỚI] Hiển thị Badge PRO hoặc nút UPGRADE */}
             {isPro ? (
                 <div className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-indigo-200">
                     <Zap size={18} fill="currentColor" className="text-yellow-300" />
                     Pro Active
                 </div>
             ) : (
                 <button 
                    onClick={() => setShowPricingModal(true)}
                    className="group flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors shadow-lg shadow-slate-200"
                 >
                     <Sparkles size={16} className="text-yellow-400 group-hover:animate-pulse" />
                     Upgrade Pro
                 </button>
             )}

             <button 
                onClick={() => router.push("/analyze")}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
             >
                <FileText size={18} />
                {lang === 'vi' ? 'Viết bài mới' : 'Write New'}
             </button>
          </div>
        </header>

        {/* [MỚI] QUOTA BANNER CHO FREE USER */}
        {!isPro && (
            <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 p-5 rounded-[24px] flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-indigo-600">
                        <Lock size={20} />
                    </div>
                    <div>
                        <p className="font-black text-slate-800 text-lg">
                            {lang === 'vi' ? `Lượt dùng hôm nay: ${usageCount} / ${FREE_DAILY_LIMIT}` : `Daily Quota: ${usageCount} / ${FREE_DAILY_LIMIT} used`}
                        </p>
                        <p className="text-sm text-slate-500 font-medium">
                            {lang === 'vi' ? 'Nâng cấp Pro để mở khóa 50 bài/ngày & tính năng Band 9.0 Rewrite.' : 'Upgrade to Pro for 50 essays/day and Band 9.0 Rewrites.'}
                        </p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowPricingModal(true)} 
                    className="px-6 py-3 bg-white text-indigo-600 font-black rounded-xl shadow-sm border border-indigo-100 hover:bg-indigo-50 hover:shadow-md transition-all text-sm whitespace-nowrap"
                >
                    Unlock Limits 💎
                </button>
            </div>
        )}

        {/* --- STATS OVERVIEW --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<FileText className="text-blue-600" />} label={t.total_essays} value={stats.totalEssays} subValue={lang === 'vi' ? 'Bài đã nộp' : 'Essays submitted'} color="blue" />
          <StatCard icon={<Award className="text-emerald-600" />} label={t.avg_score} value={stats.avgScore} subValue={lang === 'vi' ? 'Điểm trung bình' : 'Average band'} color="emerald" isScore />
          <StatCard icon={<Target className="text-indigo-600" />} label={lang === 'vi' ? 'Điểm cao nhất' : 'Highest Score'} value={stats.highestScore} subValue={lang === 'vi' ? 'Kỷ lục cá nhân' : 'Personal record'} color="indigo" isScore />
          <StatCard icon={<AlertTriangle className="text-rose-600" />} label={t.critical_issues} value={stats.topErrors.length > 0 ? stats.topErrors[0].count : 0} subValue={stats.topErrors.length > 0 ? stats.topErrors[0].name : 'Clean!'} color="rose" />
        </div>

        {/* --- MAIN DASHBOARD BODY --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Areas of Improvement (8 Columns) */}
          <div className="lg:col-span-8 bg-white p-8 rounded-[32px] border border-slate-200/60 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-center mb-8">
                <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                <TrendingUp className="text-indigo-500" size={22}/> 
                {t.areas_improvement}
                </h3>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">
                    Life-time Analysis
                </div>
            </div>
            
            <div className="grid gap-8">
            {stats.topErrors.length > 0 ? (
                stats.topErrors.map((item, idx) => (
                    <div key={idx} className="group/row">
                        <div className="flex justify-between items-end mb-3">
                            <div className="space-y-1">
                                <span className="font-bold text-slate-800 text-lg group-hover/row:text-indigo-600 transition-colors">{item.name}</span>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => handleOpenLesson(item.originalName)}
                                        className="text-[10px] font-black uppercase tracking-tighter text-slate-400 hover:text-indigo-500 flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded transition-all"
                                    >
                                        <BookOpen size={10}/> {t.review_lesson_btn}
                                    </button>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black text-slate-900 leading-none">{item.count}</div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase">{t.mistakes_count}</div>
                            </div>
                        </div>
                        
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-1000 ease-out ${idx === 0 ? 'bg-indigo-600' : 'bg-slate-400'}`} 
                                style={{ width: `${Math.min((item.count / (stats.totalEssays * 3)) * 100, 100)}%` }} 
                            />
                        </div>
                    </div>
                ))
            ) : (
                <div className="h-40 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl">
                    <CheckCircle size={32} className="mb-2 opacity-20 text-indigo-500"/>
                    <p className="font-medium">{t.no_data}</p>
                </div>
            )}
            </div>
          </div>

          {/* AI PATH (4 Columns) */}
          <div className="lg:col-span-4 bg-slate-900 text-white p-8 rounded-[32px] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                      <Target className="text-indigo-400" size={20}/> 
                  </div>
                  <div>
                      <h3 className="font-black text-lg leading-tight uppercase tracking-tight">{t.ai_path}</h3>
                      <p className="text-[10px] text-indigo-300 font-bold tracking-widest">{t.focus_week}</p>
                  </div>
              </div>

              {stats.priorityError ? (
                <div className="flex-1 flex flex-col">
                  <div className="mb-auto">
                    <div className="inline-block text-[10px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-md mb-4 animate-pulse uppercase">
                      {t.high_priority}
                    </div>
                    <h4 className="font-black text-2xl mb-2 tracking-tight leading-tight">{stats.priorityError.displayType}</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Mastering this will significantly improve your consistency and score.
                    </p>
                  </div>

                  <div className="mt-10 space-y-6">
                      <div>
                          <div className="flex justify-between text-[10px] font-black mb-2 uppercase tracking-widest">
                              <span className="text-indigo-300">Resolved Rate</span>
                              <span className="text-white">{stats.resolutionRate}%</span>
                          </div>
                          <div className="w-full bg-white/10 h-3 rounded-full">
                              <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-1000" style={{ width: `${stats.resolutionRate}%` }} />
                          </div>
                      </div>
                      
                      <button 
                          onClick={() => handleOpenLesson(stats.priorityError.type)}
                          className="w-full py-4 bg-white hover:bg-indigo-50 text-slate-900 rounded-2xl text-sm font-black transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                      >
                          <Sparkles size={18} className="text-indigo-600"/> 
                          {t.master_rule_btn}
                      </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <CheckCircle size={48} className="text-emerald-400 mb-4 opacity-50"/>
                    <p className="font-black text-xl mb-2">{t.all_caught_up}</p>
                    <p className="text-slate-400 text-sm">{t.no_critical_msg}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- RECENT SUBMISSIONS (FULL WIDTH) --- */}
        <section className="bg-white p-8 rounded-[32px] border border-slate-200/60 shadow-sm">
            <div className="flex justify-between items-center mb-8">
                <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                    <History className="text-slate-400" size={22}/>
                    {t.recent_subs}
                </h3>
                <div className="flex items-center gap-4">
            <button 
                onClick={handleExportPDF}
                disabled={isExporting}
                className="group flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm disabled:opacity-50"
             >
                {isExporting ? (
                    <div className="animate-spin w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full"/> 
                ) : (
                    // Hiện icon Download nếu là Pro, hiện Ổ khóa màu cam nếu là Free
                    isPro ? <Download size={18} className="group-hover:-translate-y-0.5 transition-transform" /> : <Lock size={16} className="text-amber-500" />
                )}
                <span className="hidden sm:inline">{lang === 'vi' ? 'Tải báo cáo' : 'Download Report'}</span>
             </button>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-3">
                    <thead>
                        <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            <th className="px-6 pb-2">Date & Plan</th>
                            <th className="px-6 pb-2 text-center">Band Score</th>
                            <th className="px-6 pb-2">Feedback Preview</th>
                            <th className="px-6 pb-2 text-right pr-10">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.recentActivity.map((item: any) => (
                        <tr key={item.id} className="group hover:bg-slate-50 transition-all cursor-pointer" onClick={() => router.push(`/history/${item.id}`)}>
                            <td className="px-6 py-5 rounded-l-[24px] bg-white border-y border-l border-slate-100 group-hover:border-indigo-100 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shadow-sm">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <span className="block font-bold text-slate-700">{new Date(item.created_at).toLocaleDateString('vi-VN')}</span>
                                        {/* [MỚI] Hiện huy hiệu nếu bài đã được Unlock Band 9.0 */}
                                        {item.polished_text ? (
                                            <span className="text-[10px] font-black text-indigo-500 flex items-center gap-1 uppercase"><Sparkles size={10}/> Ultimate</span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Standard</span>
                                        )}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-5 bg-white border-y border-slate-100 group-hover:border-indigo-100 transition-colors">
                                <div className="flex justify-center">
                                    <div className={`px-4 py-1.5 rounded-full font-black text-sm ring-4 ring-white shadow-sm ${item.score >= 7.0 ? 'bg-emerald-500 text-white' : item.score >= 6.0 ? 'bg-indigo-600 text-white' : 'bg-amber-500 text-white'}`}>
                                        {item.score.toFixed(1)}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-5 bg-white border-y border-slate-100 group-hover:border-indigo-100 transition-colors text-slate-500 text-sm max-w-[400px] truncate italic font-medium">
                                "{item.general_feedback?.substring(0, 80)}..."
                            </td>
                            <td className="px-6 py-5 rounded-r-[24px] bg-white border-y border-r border-slate-100 group-hover:border-indigo-100 transition-colors text-right pr-10">
                                <span className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all">
                                    View Details <ArrowRight size={16} />
                                </span>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>

      </div>
    </main>
  );
}

// --- SUB-COMPONENT ---
function StatCard({ icon, label, value, subValue, color, isScore }: any) {
    const colorMap: any = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
        rose: "bg-rose-50 text-rose-600 border-rose-100"
    };

    return (
        <div className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group flex flex-col justify-between h-full">
            <div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border ${colorMap[color]}`}>
                    {icon}
                </div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
                <div className="flex items-baseline gap-1">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
                    {isScore && <span className="text-xs font-bold text-slate-400">/ 9.0</span>}
                </div>
            </div>
            <p className="text-slate-500 text-xs font-medium mt-3 truncate border-t border-slate-100 pt-3">{subValue}</p>
        </div>
    );
}