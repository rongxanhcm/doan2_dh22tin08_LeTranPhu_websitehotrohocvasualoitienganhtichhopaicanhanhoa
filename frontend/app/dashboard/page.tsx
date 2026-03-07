"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  TrendingUp, AlertTriangle, FileText, 
  ArrowRight, CheckCircle, Target, BookOpen, Download,
  Sparkles, Zap, Award, History, Lock, Check,
} from "lucide-react";
import { DashboardSkeleton } from "@/components/Skeleton";
import GrammarLessonModal from "@/components/GrammarLessonModal";
import { fetchRuleByKey, GrammarRule } from "@/lib/grammarRules";
import PricingModal from "@/components/PricingModal";
import UserDropdown from "@/components/UserDropdown";
// PDF Exports
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import toast from "react-hot-toast";
import DashboardReport from "@/components/DashboardReport";

const FREE_DAILY_LIMIT = 2;
const FREE_DAILY_QUIZ_LIMIT = 6;
const FOCUS_LOCK_ESSAYS = 4;

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("User");
  const [userId, setUserId] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [quizCount, setQuizCount] = useState(0);
  const [showPricingModal, setShowPricingModal] = useState(false);

  const [stats, setStats] = useState({
    totalEssays: 0,
    avgScore: 0,
    highestScore: 0,
    topErrors: [] as { name: string; originalName: string; count: number }[],
    recentActivity: [] as any[],
    priorityError: null as any, 
    masteryCounts: {} as Record<string, { total: number, passed: number, recentAttempts: any[], masteryLevel: string }>,
    chartData: [] as { date: string; score: number }[]
  });
  
  const [selectedRule, setSelectedRule] = useState<GrammarRule | null>(null);
  const [selectedError, setSelectedError] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userLanguage, setUserLanguage] = useState("English");
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  // Quiz states for Mastery Goal box
  const [quizActive, setQuizActive] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizResults, setQuizResults] = useState<Record<number, boolean>>({});
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [quizSaving, setQuizSaving] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleUpgradeSuccess = () => {
      window.location.reload(); 
  };

  const handleOpenLesson = async (errorType: string, error?: any) => {
    const rule = await fetchRuleByKey(errorType);
    setSelectedRule(rule);
    setSelectedError(error || null);
    setIsModalOpen(true);
  };

  const handleStartQuiz = async (errorType: string, quote: string, errorId?: number) => {
    if (!errorType || !quote) return;
    
    // Check quiz limit for free users
    if (!isPro && quizCount >= FREE_DAILY_QUIZ_LIMIT) {
      toast.error(`Daily quiz limit reached (${FREE_DAILY_QUIZ_LIMIT}/day). Upgrade to Pro for unlimited!`, { icon: "🔒" });
      setShowPricingModal(true);
      return;
    }
    
    setQuizLoading(true);
    setQuizError(false);
    setQuizActive(true);
    // Set selectedError so handleCompleteQuiz can access it
    setSelectedError({ id: errorId, type: errorType, quote: quote });
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/generate-quiz-single`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-User-Id": userId || ""
        },
        body: JSON.stringify({
          error_type: errorType,
          quote: quote,
          native_language: userLanguage
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        if (res.status === 429) {
          toast.error("Daily quiz limit reached. Upgrade to Pro!", { icon: "🔒" });
          setShowPricingModal(true);
        } else {
          throw new Error(errData.detail || "Failed to generate quiz");
        }
        return;
      }

      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuizQuestions(data.questions);
        setCurrentQuizIndex(0);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setQuizResults({});
        setShowQuizResult(false);
        // Increment quiz count after successful generation
        setQuizCount(quizCount + 1);
      } else {
        throw new Error("No questions generated");
      }
    } catch (err) {
      console.error(err);
      setQuizError(true);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleAnswerSelect = (optionIndex: number) => {
    if (isAnswered) return;
    setSelectedAnswer(optionIndex);
    setIsAnswered(true);
    
    const isCorrect = optionIndex === quizQuestions[currentQuizIndex].correct_answer_index;
    setQuizResults(prev => ({ ...prev, [currentQuizIndex]: isCorrect }));
  };

  const handleNextQuizQuestion = () => {
    if (currentQuizIndex < quizQuestions.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setShowQuizResult(true);
    }
  };

  const handleCompleteQuiz = async () => {
    if (!selectedError || !userId) {
      toast.error("Please sign in to save progress.");
      return;
    }
    
    const correctCount = Object.values(quizResults).filter(v => v === true).length;
    const passedQuiz = correctCount >= 6; // 60% passing score (6 out of 10)
    const score = correctCount; // 0-10 score

    setQuizSaving(true);
    try {
      // Save quiz attempt to new table
      const { error } = await supabase
        .from("quiz_attempts")
        .insert({
          user_id: userId,
          error_type: selectedError.type,
          quiz_date: new Date().toISOString(),
          score: score,
          passed: passedQuiz
        });

      if (error) throw error;
      
      if (passedQuiz) {
        toast.success("Excellent! Quiz passed. Keep practicing!", { icon: "✓" });
      } else {
        toast.success("Progress saved! Keep practicing.", { icon: "📚" });
      }
      
      // Close quiz and refresh dashboard data
      setQuizActive(false);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      console.error("Error saving quiz attempt:", err);
      toast.error("Error saving progress");
      setQuizSaving(false);
    }
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
        pdf.save(`Wrytt_Report_${new Date().toISOString().slice(0,10)}.pdf`);
        toast.success("Report downloaded!", { id: toastId });
      } catch (error) {
        toast.error("Export failed", { id: toastId });
      } finally {
        setIsExporting(false);
      }
  };

  // Helper function to calculate mastery level
  const getMasteryLevel = (attempts: any[]): string => {
    if (attempts.length === 0) return "Learning";
    
    const recentAttempts = attempts.slice(0, 3); // Last 3 attempts
    const recentPassed = recentAttempts.filter(a => a.passed).length;
    const avgScore = recentAttempts.reduce((sum, a) => sum + a.score, 0) / recentAttempts.length;
    
    if (avgScore >= 8 && recentPassed >= 2) return "Mastered";
    if (avgScore >= 6 && recentPassed >= 1) return "Practicing";
    return "Learning";
  };

  useEffect(() => {     
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserEmail(user.email || "User");
      setUserId(user.id);

      const { data: usageData } = await supabase
        .from("user_usage")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (usageData) {
          setIsPro(usageData.is_pro);
          setUserLanguage(usageData.default_language || "English");
          const today = new Date();
          const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
          setUsageCount(String(usageData.last_reset_date) === todayStr ? usageData.usage_count : 0);
          setQuizCount(String(usageData.last_quiz_reset_date) === todayStr ? usageData.quiz_count : 0);
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
        .select("id, error_type, submission_id, quote")
        .in("submission_id", submissionIds);

      // Fetch quiz attempts for this user
      const { data: quizAttempts } = await supabase
        .from("quiz_attempts")
        .select("error_type, score, passed, quiz_date")
        .eq("user_id", user.id)
        .order("quiz_date", { ascending: false });

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
            name: name,
            originalName: name,
            count 
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate mastery for each error type based on quiz attempts
      const masteryCounts: Record<string, { total: number, passed: number, recentAttempts: any[], masteryLevel: string }> = {};
      errors?.forEach((err) => {
        const type = err.error_type.trim();
        if (!masteryCounts[type]) masteryCounts[type] = { total: 0, passed: 0, recentAttempts: [], masteryLevel: "Learning" };
        masteryCounts[type].total += 1;
      });

      // Populate quiz attempt data
      quizAttempts?.forEach((attempt) => {
        const type = attempt.error_type.trim();
        if (masteryCounts[type]) {
          masteryCounts[type].recentAttempts.push(attempt);
        }
      });

      // Calculate mastery level for each error
      Object.entries(masteryCounts).forEach(([type, stat]) => {
        stat.passed = stat.recentAttempts.filter(a => a.passed).length;
        stat.masteryLevel = getMasteryLevel(stat.recentAttempts);
      });

      // Choose priority error: unmastered error with most occurrences
      let priorityErrObj: any = null;
      let maxCount = 0;
      
      Object.entries(errorCounts).forEach(([errorType, count]) => {
        const masteryData = masteryCounts[errorType];
        if (masteryData && masteryData.masteryLevel !== "Mastered" && count > maxCount) {
          maxCount = count;
          const errorDetail = errors?.find(e => e.error_type.trim() === errorType);
          priorityErrObj = {
            id: errorDetail?.id,
            type: errorType,
            displayType: errorType,
            total: masteryData.total,
            quote: errorDetail?.quote || "",
            masteryLevel: masteryData.masteryLevel,
            recentAttempts: masteryData.recentAttempts.slice(0, 3)
          };
        }
      });

      const buildPriorityFromType = (errorType: string) => {
        const masteryData = masteryCounts[errorType];
        if (!masteryData) return null;
        const errorDetail = errors?.find(e => e.error_type.trim() === errorType);
        return {
          id: errorDetail?.id,
          type: errorType,
          displayType: errorType,
          total: masteryData.total,
          quote: errorDetail?.quote || "",
          masteryLevel: masteryData.masteryLevel,
          recentAttempts: masteryData.recentAttempts.slice(0, 3)
        };
      };

      // Hybrid focus: lock target for a fixed essay window
      if (typeof window !== "undefined") {
        const lockKey = `mastery_focus_lock_${user.id}`;
        const currentEssayCount = submissions.length;
        let lockedType: string | null = null;
        let lockValid = false;

        try {
          const raw = localStorage.getItem(lockKey);
          if (raw) {
            const parsed = JSON.parse(raw);
            lockedType = parsed?.errorType || null;
            lockValid = Number.isFinite(parsed?.lockUntilCount)
              && currentEssayCount < parsed.lockUntilCount;
          }
        } catch {
          localStorage.removeItem(lockKey);
        }

        let lockedPriority = null;
        if (lockValid && lockedType) {
          const fromLock = buildPriorityFromType(lockedType);
          if (fromLock && fromLock.masteryLevel !== "Mastered") {
            lockedPriority = fromLock;
          } else {
            localStorage.removeItem(lockKey);
          }
        }

        if (lockedPriority) {
          priorityErrObj = lockedPriority;
        } else if (priorityErrObj) {
          localStorage.setItem(
            lockKey,
            JSON.stringify({
              errorType: priorityErrObj.type,
              lockedAtCount: currentEssayCount,
              lockUntilCount: currentEssayCount + FOCUS_LOCK_ESSAYS
            })
          );
        }
      }

      setStats({
        totalEssays: submissions.length,
        avgScore: Number(avgScore),
        highestScore: highestScore,
        topErrors,
        recentActivity: submissions.slice(0, 5),
        priorityError: priorityErrObj,
        masteryCounts,
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
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/70 font-sans text-slate-900 selection:bg-teal-100">
      
       {/* Background Dot Grid Pattern */}
       <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.3]"
         style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
      </div>

      <PricingModal isOpen={showPricingModal} onClose={() => setShowPricingModal(false) } onSuccess={handleUpgradeSuccess}/>
      <GrammarLessonModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        rule={selectedRule}
        errorId={selectedError?.id}
        errorType={selectedError?.type}
        quote={selectedError?.quote}
        language={userLanguage}
        onMarkedResolved={() => {
          setIsModalOpen(false);
          // Refresh dashboard data
          window.location.reload();
        }}
      />

      <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8 relative z-10">
        
 {/* --- HEADER (Updated with Smart UserDropdown) --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/90 backdrop-blur-xl p-6 rounded-2xl border border-slate-200 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.35)] relative z-20 overflow-visible">
          <div className="absolute -top-16 right-0 w-56 h-56 rounded-full bg-teal-200/20 blur-3xl pointer-events-none" />
          
          {/* LEFT: Branding & Welcome */}
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => router.push("/")}> 
               <Image src="/logo.svg" alt="Logo" fill className="w-auto h-12" />
               
            </div>
            <div>
              <p className="text-[10px] font-bold text-teal-700 uppercase tracking-[0.22em]">Student Portal</p>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Welcome back, {userEmail.split('@')[0]}
              </h1>
            </div>
          </div>
          
          {/* RIGHT: Actions */}
          <div className="flex items-center gap-3">
             
             {/* Nút Viết bài mới (Luôn hiện) */}
             <button 
                onClick={() => router.push("/analyze")}
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:border-teal-500 hover:text-teal-600 transition-all shadow-sm active:scale-95 text-sm"
             >
                <FileText size={18} />
                New Essay
             </button>

             {/* Nút Upgrade (CHỈ HIỆN KHI LÀ FREE USER - Để kích thích mua hàng) */}
             {!isPro && (
                 <button 
                    onClick={() => setShowPricingModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-teal-600 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
                >
                     <Sparkles size={14} className="text-teal-400" />
                     <span className="hidden sm:inline">Upgrade Pro</span>
                     <span className="sm:hidden">Pro</span>
                 </button>
             )}

             {/* User Dropdown (Thay thế cho nút Logout cũ & Badge Pro tĩnh) */}
             <div className="pl-3 border-l border-slate-200">
                <UserDropdown user={{ email: userEmail }} isPro={isPro} />
             </div>

          </div>
        </header>

        {/* --- QUOTA BANNER --- */}
        {!isPro && (
            <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-slate-800 shadow-[0_20px_40px_-24px_rgba(15,23,42,0.8)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl"></div>
                <div className="flex items-center gap-5 relative z-10">
                    <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700 text-teal-400">
                        <Lock size={20} />
                    </div>
                    <div>
                        <p className="font-bold text-lg">Daily Limit: {usageCount} / {FREE_DAILY_LIMIT}</p>
                        <p className="text-sm text-slate-400">Get unlimited analysis and Elite rewrites with Pro.</p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowPricingModal(true)} 
                    className="px-6 py-2.5 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-500 transition-all text-sm whitespace-nowrap shadow-lg shadow-teal-600/20"
                >
                  Unlock Pro Features
                </button>
            </div>
        )}
        
        {/* --- STATS OVERVIEW --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<FileText size={20} />} label="Total Essays" value={stats.totalEssays} subValue="Submissions" color="slate" />
          <StatCard icon={<Award size={20} />} label="Avg. Score" value={stats.avgScore} subValue="Score Accuracy" color="teal" isScore />
          <StatCard icon={<Target size={20} />} label="Highest" value={stats.highestScore} subValue="Personal Record" color="slate" isScore />
          <StatCard icon={<AlertTriangle size={20} />} label="Top Issue" value={stats.topErrors.length > 0 ? stats.topErrors[0].count : 0} subValue={stats.topErrors.length > 0 ? stats.topErrors[0].name : 'No issues'} color="rose" />
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Areas of Improvement */}
          <div className="lg:col-span-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.5)]">
            <div className="flex justify-between items-center mb-10">
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                  <TrendingUp className="text-teal-600" size={20}/> 
                  Skill Diagnostics
                </h3>
            </div>
            
            <div className="space-y-8">
            {stats.topErrors.length > 0 ? (
                stats.topErrors.map((item, idx) => (
                    <div key={idx} className="group">
                        <div className="flex justify-between items-end mb-3">
                            <div className="space-y-1">
                                <span className="font-bold text-slate-800 group-hover:text-teal-600 transition-colors">{item.name}</span>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => handleOpenLesson(item.originalName)}
                                        className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-teal-600 flex items-center gap-1 transition-all"
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
                                className={`h-full rounded-full transition-all duration-1000 ${idx === 0 ? 'bg-teal-600' : 'bg-slate-300'}`} 
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

          {/* AI PATH FOCUS - MASTERY GOAL */}
          <div className="lg:col-span-4 bg-gradient-to-b from-slate-50 to-white p-8 rounded-2xl border border-slate-200 relative overflow-hidden shadow-[0_12px_28px_-24px_rgba(15,23,42,0.5)]">
            <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-teal-300/15 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-12 w-40 h-40 rounded-full bg-sky-200/20 blur-2xl pointer-events-none" />

            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="p-2 bg-white rounded-lg border border-slate-200 text-teal-600 shadow-sm">
                <Target size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 uppercase text-sm tracking-widest">Mastery Goal</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">One focus rule. Better results each week.</p>
              </div>
            </div>

            {stats.priorityError ? (
              <div className="space-y-5 relative z-10">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.45)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-1">Current Focus</p>
                      <h4 className="text-lg font-black text-slate-900 leading-tight">{stats.priorityError.displayType}</h4>
                      <p className="text-xs text-slate-500 mt-2">Appears in {stats.priorityError.total} essays.</p>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      Lock {FOCUS_LOCK_ESSAYS} essays
                    </span>
                  </div>

                  <div className="mt-4 p-3 rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-sky-50">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-indigo-700">Mastery Stage</p>
                      <p className="text-xs font-bold text-indigo-900">{stats.priorityError.masteryLevel}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <div className={`flex-1 h-1.5 rounded-full ${stats.priorityError.masteryLevel === "Learning" ? "bg-indigo-600" : "bg-indigo-200"}`} />
                      <div className={`flex-1 h-1.5 rounded-full ${["Practicing", "Mastered"].includes(stats.priorityError.masteryLevel) ? "bg-indigo-600" : "bg-indigo-200"}`} />
                      <div className={`flex-1 h-1.5 rounded-full ${stats.priorityError.masteryLevel === "Mastered" ? "bg-indigo-600" : "bg-indigo-200"}`} />
                    </div>
                    <p className="text-[11px] text-indigo-800/80 mt-2">Mastered requires an 80%+ average and at least 2 passes in the last 3 quizzes.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleStartQuiz(stats.priorityError.type, stats.priorityError.quote, stats.priorityError.id)}
                    disabled={quizLoading || (!isPro && quizCount >= FREE_DAILY_QUIZ_LIMIT)}
                    className="col-span-2 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-teal-600 transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {quizLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Generating Quiz...
                      </>
                    ) : !isPro && quizCount >= FREE_DAILY_QUIZ_LIMIT ? (
                      <>
                        <Lock size={16} /> Quiz Limit Reached
                      </>
                    ) : (
                      <>
                        <Zap size={16} /> Start Practice Quiz
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleOpenLesson(stats.priorityError.type, stats.priorityError)}
                    className="py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:border-teal-300 hover:text-teal-700 transition-all flex items-center justify-center gap-2"
                  >
                    <BookOpen size={14} /> Rule
                  </button>

                  <div className="py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-100 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Daily Quiz</p>
                    <p className={`text-sm font-black ${!isPro && quizCount >= FREE_DAILY_QUIZ_LIMIT ? "text-red-600" : "text-slate-800"}`}>
                      {isPro ? "Unlimited" : `${quizCount}/${FREE_DAILY_QUIZ_LIMIT}`}
                    </p>
                  </div>
                </div>

                {stats.priorityError.recentAttempts && stats.priorityError.recentAttempts.length > 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Latest Attempts</p>
                    <div className="space-y-2">
                      {stats.priorityError.recentAttempts.slice(0, 3).map((attempt: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm ${attempt.passed ? "text-emerald-600" : "text-rose-500"}`}>{attempt.passed ? "Passed" : "Retry"}</span>
                            <span className="text-xs text-slate-500">{Math.round((attempt.score / 10) * 100)}%</span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(attempt.quiz_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border border-dashed border-slate-300 rounded-xl bg-white/70">
                    <p className="text-xs text-slate-600">No quiz history yet. Start one short quiz to activate your mastery tracking.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 relative z-10">
                <CheckCircle size={40} className="text-teal-500 mx-auto mb-4 opacity-50" />
                <p className="font-bold text-slate-900">All clear!</p>
              </div>
            )}
          </div>
        </div>

        {/* Quiz Modal */}
        {quizActive && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <button
              aria-label="Close quiz"
              onClick={() => setQuizActive(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <div className="relative w-full sm:max-w-3xl max-h-[94vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl border border-slate-200 shadow-[0_24px_50px_-25px_rgba(15,23,42,0.7)] p-6 sm:p-8 mx-0 sm:mx-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-teal-600">Practice Quiz</p>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">Master Your Focus Rule</h3>
                </div>
                <button
                  onClick={() => setQuizActive(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>

              {quizLoading ? (
                <div className="flex flex-col items-center justify-center py-14 space-y-4">
                  <div className="w-12 h-12 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin" />
                  <p className="text-base font-bold text-slate-600 text-center">Generating your personalized questions...</p>
                </div>
              ) : quizError ? (
                <div className="space-y-4 text-center py-8">
                  <AlertTriangle size={40} className="text-red-500 mx-auto" />
                  <p className="text-base font-bold text-slate-900">Quiz generation failed</p>
                  <button
                    onClick={() => setQuizActive(false)}
                    className="w-full py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-all text-base"
                  >
                    Back to Dashboard
                  </button>
                </div>
              ) : showQuizResult ? (
                (() => {
                  const correctCount = Object.values(quizResults).filter(v => v === true).length;
                  const passed = correctCount >= 6;
                  const percentage = Math.round((correctCount / quizQuestions.length) * 100);
                  return (
                    <div className={`p-7 rounded-2xl text-center space-y-4 ${passed ? "bg-emerald-50 border border-emerald-200" : "bg-blue-50 border border-blue-200"}`}>
                      <div className={`text-4xl font-black ${passed ? "text-emerald-700" : "text-blue-700"}`}>{percentage}%</div>
                      <h3 className={`text-xl font-black ${passed ? "text-emerald-700" : "text-blue-700"}`}>
                        {passed ? "Excellent work" : "Solid attempt"}
                      </h3>
                      <p className="text-base text-slate-600">{correctCount} out of {quizQuestions.length} correct</p>
                      {!passed && <p className="text-sm text-slate-500">Need {6 - correctCount} more to pass (60% = 6/10)</p>}
                      <div className="pt-3">
                        <button
                          onClick={handleCompleteQuiz}
                          disabled={quizSaving}
                          className={`w-full py-3 font-black rounded-lg text-white transition-all ${
                            passed ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-900 hover:bg-slate-800"
                          } disabled:opacity-50 text-base`}
                        >
                          {quizSaving ? "Saving..." : "Save & Close"}
                        </button>
                      </div>
                    </div>
                  );
                })()
              ) : quizQuestions.length > 0 ? (
                (() => {
                  const currentQuestion = quizQuestions[currentQuizIndex];
                  const isCorrect = selectedAnswer === currentQuestion.correct_answer_index;
                  const progressPercent = ((currentQuizIndex + 1) / quizQuestions.length) * 100;
                  return (
                    <div className="space-y-7">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-500">
                          <span>Question {currentQuizIndex + 1} of {quizQuestions.length}</span>
                          <span>{Math.round(progressPercent)}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-teal-500 to-sky-500 h-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-bold text-slate-900 text-lg sm:text-xl leading-snug">{currentQuestion.question}</h4>
                        <div className="space-y-3">
                          {currentQuestion.options.map((option: string, idx: number) => {
                            const isSelected = selectedAnswer === idx;
                            const isCorrectAnswer = idx === currentQuestion.correct_answer_index;
                            let bgColor = "bg-white border-slate-200 hover:border-slate-300";

                            if (isAnswered) {
                              if (isCorrectAnswer) {
                                bgColor = "bg-emerald-50 border-emerald-500 border-2";
                              } else if (isSelected && !isCorrect) {
                                bgColor = "bg-red-50 border-red-500 border-2";
                              }
                            }

                            return (
                              <button
                                key={idx}
                                onClick={() => handleAnswerSelect(idx)}
                                disabled={isAnswered}
                                className={`w-full p-4 text-left rounded-xl border text-base transition-all font-medium text-slate-900 ${bgColor} ${
                                  isAnswered ? "cursor-default" : "cursor-pointer hover:bg-slate-50"
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                      isSelected
                                        ? isCorrect
                                          ? "border-emerald-500 bg-emerald-500"
                                          : "border-red-500 bg-red-500"
                                        : "border-slate-300"
                                    }`}
                                  >
                                    {isSelected && <Check size={10} className="text-white" />}
                                  </div>
                                  <span className="leading-relaxed">{option}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {isAnswered && (
                          <div className={`p-4 rounded-xl text-base ${isCorrect ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"}`}>
                            <p className={`font-medium ${isCorrect ? "text-emerald-900" : "text-red-900"}`}>
                              <span className="font-bold">{isCorrect ? "Correct: " : "Hint: "}</span>
                              {currentQuestion.explanation}
                            </p>
                          </div>
                        )}
                      </div>

                      {isAnswered && (
                        <button
                          onClick={handleNextQuizQuestion}
                          className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all text-base"
                        >
                          {currentQuizIndex < quizQuestions.length - 1 ? "Next Question" : "View Results"}
                        </button>
                      )}
                    </div>
                  );
                })()
              ) : null}
            </div>
          </div>
        )}

        {/* Hidden Report for PDF Export */}
        <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
          <DashboardReport 
            ref={reportRef}
            userEmail={userEmail}
            stats={{
              totalEssays: stats.totalEssays,
              avgScore: stats.avgScore,
              highestScore: stats.highestScore
            }}
            recentSubs={stats.recentActivity}
            chartData={stats.chartData}
          />
        </div>

        {/* --- RECENT ACTIVITY --- */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.5)] overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-white to-slate-50">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                    <History className="text-slate-400" size={20}/>
                    Recent Submissions
                </h3>
                <button 
                  onClick={handleExportPDF}
                  disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-900 hover:text-white transition-all"
                >
                  {isExporting ? <div className="animate-spin w-3 h-3 border-2 border-teal-500 border-t-transparent rounded-full"/> : isPro ? <Download size={14} /> : <Lock size={14} className="text-amber-500" />}
                  Download PDF Report
                </button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Score</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {stats.recentActivity.map((item: any) => (
                        <tr key={item.id} className="group hover:bg-slate-50/80 transition-colors cursor-pointer" onClick={() => router.push(`/history/${item.id}`)}>
                            <td className="px-6 py-5 text-sm font-medium text-slate-600">
                                {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td className="px-6 py-5">
                                <span className={`px-3 py-1 rounded text-xs font-bold border ${item.score >= 7.0 ? 'bg-teal-50 border-teal-100 text-teal-700' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                                    Score {item.score.toFixed(1)}
                                </span>
                            </td>
                            <td className="px-6 py-5">
                                {item.polished_text ? (
                                    <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded flex items-center gap-1 w-fit"><Sparkles size={10}/> Ultimate</span>
                                ) : (
                                    <span className="text-[10px] font-bold text-slate-400 border border-slate-200 px-2 py-0.5 rounded w-fit">Standard</span>
                                )}
                            </td>
                            <td className="px-6 py-5 text-right">
                                <ArrowRight size={16} className="ml-auto text-slate-300 group-hover:text-teal-600 translate-x-0 group-hover:translate-x-1 transition-all" />
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
    teal: "text-teal-700 bg-teal-50 border-teal-100",
    rose: "text-rose-600 bg-rose-50 border-red-100"
    };

    return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_12px_24px_-24px_rgba(15,23,42,0.8)] hover:border-teal-200 hover:-translate-y-0.5 transition-all duration-300">
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