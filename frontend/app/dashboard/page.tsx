"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  TrendingUp, AlertTriangle, FileText, 
  ArrowRight, CheckCircle, Target, BookOpen, Download,
  Sparkles, Zap, Award, History, LayoutGrid, Calendar, Lock
} from "lucide-react";
import { translateError } from "@/lib/errorMapping";
import { DashboardSkeleton } from "@/components/Skeleton";
import GrammarLessonModal from "@/components/GrammarLessonModal";
import { fetchRuleByKey, GrammarRule } from "@/lib/grammarRules";
import PricingModal from "@/components/PricingModal";

// PDF Exports
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import toast from "react-hot-toast";
import DashboardReport from "@/components/DashboardReport";

const FREE_DAILY_LIMIT = 2;

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("User");
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

  const handleUpgradeSuccess = () => {
      window.location.reload(); 
  };

  const handleOpenLesson = async (errorType: string) => {
    const rule = await fetchRuleByKey(errorType);
    setSelectedRule(rule);
    setIsModalOpen(true);
  };

  const handleExportPDF = async () => {
      if (!isPro) {
          toast.error("PDF Export is only available for Pro users!", { icon: "🔒" });
          setShowPricingModal(true);
          return;
      }

      if (!reportRef.current) return;
      setIsExporting(true);
      const toastId = toast.loading("Generating professional report...");

      try {
        const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdf.internal.pageSize.getHeight());
        pdf.save(`Eloqua_Report_${new Date().toISOString().slice(0,10)}.pdf`);
        toast.success("Report downloaded!", { id: toastId });
      } catch (error) {
        toast.error("Export failed", { id: toastId });
      } finally {
        setIsExporting(false);
      }
  };

  useEffect(() => {     
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserEmail(user.email || "User");

      const { data: usageData } = await supabase
        .from("user_usage")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (usageData) {
          setIsPro(usageData.is_pro);
          const today = new Date();
          const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
          setUsageCount(String(usageData.last_reset_date) === todayStr ? usageData.usage_count : 0);
      }

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

      const errorCounts: Record<string, number> = {};
      errors?.forEach((err) => {
        const type = err.error_type.trim(); 
        errorCounts[type] = (errorCounts[type] || 0) + 1;
      });

      const topErrors = Object.entries(errorCounts)
        .map(([name, count]) => ({ 
            name: translateError(name, 'en'),
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
        if (err.is_resolved) errorStats[type].resolved += 1;
        else if (!errorStats[type].latestUnresolvedId) errorStats[type].latestUnresolvedId = err.submission_id;
      });

      let maxUnresolved = -1;
      let priorityErrObj: any = null;
      Object.entries(errorStats).forEach(([type, stat]) => {
          const unresolvedCount = stat.total - stat.resolved;
          if (unresolvedCount > maxUnresolved && unresolvedCount > 0) {
              maxUnresolved = unresolvedCount;
              priorityErrObj = {
                  type: type, 
                  displayType: translateError(type, 'en'),
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
        chartData: submissions.slice(0, 7).reverse().map(s => ({
          date: new Date(s.created_at).toLocaleDateString('en-US', {day: '2-digit', month: '2-digit'}),
          score: s.score || 0
       }))
      });
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 selection:bg-cyan-100">
      
      {/* Background Dot Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.4]" 
           style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      <PricingModal isOpen={showPricingModal} onClose={() => setShowPricingModal(false) } onSuccess={handleUpgradeSuccess}/>
      <GrammarLessonModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} rule={selectedRule} />

      <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8 relative z-10">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12">
               <Image src="/logo.svg" alt="Logo" fill className="object-contain" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-[0.2em]">Student Portal</p>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back, {userEmail.split('@')[0]}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             {isPro ? (
                 <div className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest shadow-lg shadow-cyan-600/20">
                     <Zap size={14} fill="currentColor" className="text-yellow-300" />
                     Pro Member
                 </div>
             ) : (
                 <button 
                    onClick={() => setShowPricingModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-cyan-600 transition-colors shadow-lg shadow-slate-900/10"
                 >
                     <Sparkles size={14} className="text-cyan-400" />
                     Upgrade to Pro
                 </button>
             )}

             <button 
                onClick={() => router.push("/analyze")}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-900 font-bold rounded-lg hover:border-cyan-500 hover:text-cyan-600 transition-all shadow-sm active:scale-95"
             >
                <FileText size={18} />
                New Essay
             </button>
          </div>
        </header>

        {/* --- QUOTA BANNER --- */}
        {!isPro && (
            <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>
                <div className="flex items-center gap-5 relative z-10">
                    <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700 text-cyan-400">
                        <Lock size={20} />
                    </div>
                    <div>
                        <p className="font-bold text-lg">Daily Limit: {usageCount} / {FREE_DAILY_LIMIT}</p>
                        <p className="text-sm text-slate-400">Get unlimited analysis and Band 9.0 rewrites with Pro.</p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowPricingModal(true)} 
                    className="px-6 py-2.5 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-500 transition-all text-sm whitespace-nowrap shadow-lg shadow-cyan-600/20"
                >
                    Unlock Pro Features 💎
                </button>
            </div>
        )}

        {/* --- STATS OVERVIEW --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<FileText size={20} />} label="Total Essays" value={stats.totalEssays} subValue="Submissions" color="slate" />
          <StatCard icon={<Award size={20} />} label="Avg. Score" value={stats.avgScore} subValue="Band Accuracy" color="cyan" isScore />
          <StatCard icon={<Target size={20} />} label="Highest" value={stats.highestScore} subValue="Personal Record" color="slate" isScore />
          <StatCard icon={<AlertTriangle size={20} />} label="Top Issue" value={stats.topErrors.length > 0 ? stats.topErrors[0].count : 0} subValue={stats.topErrors.length > 0 ? stats.topErrors[0].name : 'No issues'} color="rose" />
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Areas of Improvement */}
          <div className="lg:col-span-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-10">
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                  <TrendingUp className="text-cyan-600" size={20}/> 
                  Skill Diagnostics
                </h3>
            </div>
            
            <div className="space-y-8">
            {stats.topErrors.length > 0 ? (
                stats.topErrors.map((item, idx) => (
                    <div key={idx} className="group">
                        <div className="flex justify-between items-end mb-3">
                            <div className="space-y-1">
                                <span className="font-bold text-slate-800 group-hover:text-cyan-600 transition-colors">{item.name}</span>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => handleOpenLesson(item.originalName)}
                                        className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-cyan-600 flex items-center gap-1 transition-all"
                                    >
                                        <BookOpen size={12}/> Review Rule
                                    </button>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-bold text-slate-900">{item.count}</div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase">Occurrences</div>
                            </div>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                            <div 
                                className={`h-full rounded-full transition-all duration-1000 ${idx === 0 ? 'bg-cyan-600' : 'bg-slate-300'}`} 
                                style={{ width: `${Math.min((item.count / (stats.totalEssays * 3)) * 100, 100)}%` }} 
                            />
                        </div>
                    </div>
                ))
            ) : (
                <div className="py-20 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                    <p>Start writing to see your analytics.</p>
                </div>
            )}
            </div>
          </div>

          {/* AI PATH FOCUS */}
          <div className="lg:col-span-4 bg-slate-50 p-8 rounded-2xl border border-slate-200 relative overflow-hidden">
             <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-cyan-600 shadow-sm">
                      <Target size={20}/> 
                  </div>
                  <h3 className="font-bold text-slate-900 uppercase text-sm tracking-widest">Mastery Goal</h3>
             </div>

              {stats.priorityError ? (
                <div className="space-y-6">
                    <div className="p-4 bg-white rounded-xl border border-slate-200">
                        <div className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-1">Focus Area</div>
                        <h4 className="font-bold text-lg text-slate-900">{stats.priorityError.displayType}</h4>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                            <span>Resolution Progress</span>
                            <span>{stats.resolutionRate}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-cyan-600 h-full transition-all duration-1000" style={{ width: `${stats.resolutionRate}%` }} />
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => handleOpenLesson(stats.priorityError.type)}
                        className="w-full py-3 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-cyan-600 transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2"
                    >
                        <Sparkles size={16} /> Learn this Rule
                    </button>
                </div>
              ) : (
                <div className="text-center py-10">
                    <CheckCircle size={40} className="text-cyan-500 mx-auto mb-4 opacity-50"/>
                    <p className="font-bold text-slate-900">All clear!</p>
                </div>
              )}
          </div>
        </div>

        {/* --- RECENT ACTIVITY --- */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                    <History className="text-slate-400" size={20}/>
                    Recent Submissions
                </h3>
                <button 
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-900 hover:text-white transition-all"
                >
                  {isExporting ? <div className="animate-spin w-3 h-3 border-2 border-cyan-500 border-t-transparent rounded-full"/> : isPro ? <Download size={14} /> : <Lock size={14} className="text-amber-500" />}
                  Download PDF Report
                </button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Score</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {stats.recentActivity.map((item: any) => (
                        <tr key={item.id} className="group hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => router.push(`/history/${item.id}`)}>
                            <td className="px-6 py-5 text-sm font-medium text-slate-600">
                                {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td className="px-6 py-5">
                                <span className={`px-3 py-1 rounded text-xs font-bold ${item.score >= 7.0 ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-100 text-slate-700'}`}>
                                    Band {item.score.toFixed(1)}
                                </span>
                            </td>
                            <td className="px-6 py-5">
                                {item.polished_text ? (
                                    <span className="text-[10px] font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded flex items-center gap-1 w-fit"><Sparkles size={10}/> Ultimate</span>
                                ) : (
                                    <span className="text-[10px] font-bold text-slate-400 border border-slate-200 px-2 py-0.5 rounded w-fit">Standard</span>
                                )}
                            </td>
                            <td className="px-6 py-5 text-right">
                                <ArrowRight size={16} className="ml-auto text-slate-300 group-hover:text-cyan-600 transition-colors translate-x-0 group-hover:translate-x-1 transition-transform" />
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

function StatCard({ icon, label, value, subValue, color, isScore }: any) {
    const colors: any = {
        slate: "text-slate-600 bg-slate-50 border-slate-100",
        cyan: "text-cyan-600 bg-cyan-50 border-cyan-100",
        rose: "text-rose-600 bg-rose-50 border-red-100"
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-cyan-200 transition-all">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 border ${colors[color]}`}>
                {icon}
            </div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
            <div className="flex items-baseline gap-1 mb-2">
                <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
                {isScore && <span className="text-xs font-bold text-slate-400">/ 9.0</span>}
            </div>
            <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wide border-t border-slate-50 pt-2">{subValue}</p>
        </div>
    );
}