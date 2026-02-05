"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, ArrowRight, BookOpen, RotateCcw, Save, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabaseClient";

interface QuizViewProps {
  errors: any[];
  language: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function QuizView({ errors, language, onSuccess, onCancel }: QuizViewProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // [LOGIC MỚI] Thay vì đếm score chung, ta lưu kết quả từng câu theo ID lỗi
  // Map: { error_id: true/false } (Đúng/Sai)
  const [results, setResults] = useState<Record<number, boolean>>({});
  
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [saving, setSaving] = useState(false);

  const supabase = createClient();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // 1. Fetch Quiz (Giữ nguyên)
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const payload = {
            language: language,
            errors: errors.map(e => ({
                id: e.id,
                error_type: e.error_type,
                quote: e.quote
            }))
        };

        const res = await fetch(`${API_URL}/generate-batch-quiz`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Failed to fetch questions");

        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
            setQuestions(data.questions);
        } else {
            throw new Error("No questions generated");
        }
      } catch (err) {
        console.error(err);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [errors, language]);

  // 2. Xử lý trả lời (Cập nhật logic lưu kết quả từng câu)
  const currentQ = questions[currentIndex];

  const handleAnswer = (optionIndex: number) => {
    if (isAnswered) return;
    setSelectedAnswer(optionIndex);
    setIsAnswered(true);

    const isCorrect = optionIndex === currentQ.correct_answer_index;
    
    // Lưu kết quả cho câu hỏi này (Key là error ID)
    setResults(prev => ({
        ...prev,
        [currentQ.id]: isCorrect
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  // 3. Xử lý hoàn thành (Chỉ lưu những câu ĐÚNG)
  const handleComplete = async () => {
    // Lọc ra danh sách ID của những câu trả lời ĐÚNG
    const resolvedIds = Object.keys(results)
        .map(Number)
        .filter(id => results[id] === true);

    if (resolvedIds.length === 0) {
        // Nếu không đúng câu nào thì reload lại quiz chứ không gọi DB
        setCurrentIndex(0);
        setResults({});
        setShowResult(false);
        setSelectedAnswer(null);
        setIsAnswered(false);
        return;
    }

    setSaving(true);
    
    // Chỉ update những lỗi đã làm đúng thành is_resolved = true
    const { error } = await supabase
        .from("analysis_results")
        .update({ is_resolved: true })
        .in("id", resolvedIds);

    if (error) {
        alert("Lỗi lưu kết quả: " + error.message);
        setSaving(false);
    } else {
        // Reload lại trang cha -> Những lỗi vừa fix sẽ biến mất khỏi list
        onSuccess(); 
    }
  };

  // --- RENDER UI ---

  if (loading) return (
    <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm animate-pulse">
        <div className="w-16 h-16 bg-indigo-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <RotateCcw className="animate-spin text-indigo-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-700">Generating personalized quiz...</h3>
    </div>
  );

  if (fetchError) return (
    <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-100">
        <h3 className="text-red-600 font-bold mb-2">Error loading questions</h3>
        <button onClick={onCancel} className="text-sm font-bold underline">Back</button>
    </div>
  );

  // MÀN HÌNH KẾT QUẢ "THÔNG MINH"
  if (showResult) {
    const correctCount = Object.values(results).filter(Boolean).length;
    const totalCount = questions.length;
    
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center animate-fade-in">
          <div className="mb-6 relative inline-block">
             <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="60" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                <circle cx="64" cy="64" r="60" stroke={correctCount > 0 ? "#10b981" : "#ef4444"} strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={377} 
                    strokeDashoffset={377 - (377 * correctCount) / totalCount} 
                    className="transition-all duration-1000 ease-out"
                />
             </svg>
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                 <span className={`text-4xl font-black ${correctCount > 0 ? 'text-emerald-500' : 'text-slate-300'}`}>
                    {correctCount}
                 </span>
                 <span className="text-slate-400 text-sm font-bold block">/{totalCount}</span>
             </div>
          </div>
          
          <h3 className="text-2xl font-bold text-slate-800 mb-2">
              {correctCount === totalCount ? "All Fixed! Perfect! 🎉" : 
               correctCount > 0 ? "Progress Made! 🚀" : "Keep Trying! 💪"}
          </h3>
          
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            {correctCount === totalCount 
                ? "You have successfully corrected all identified errors." 
                : correctCount > 0 
                ? `You fixed ${correctCount} errors. These will be marked as resolved. The remaining ${totalCount - correctCount} errors will stay for next time.`
                : "You haven't fixed any errors yet. Review the explanations and try again."}
          </p>

          <div className="flex flex-col gap-3">
             {correctCount > 0 && (
                 <button 
                    onClick={handleComplete}
                    disabled={saving}
                    className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                >
                    {saving ? "Saving..." : <><ShieldCheck size={20}/> Save Progress & Continue</>}
                </button>
             )}

             {correctCount < totalCount && (
                 <button 
                    onClick={() => {
                        // Reset để làm lại (Nếu chưa đúng hết)
                        setCurrentIndex(0);
                        setResults({});
                        setShowResult(false);
                        setSelectedAnswer(null);
                        setIsAnswered(false);
                    }}
                    className={`w-full py-4 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 ${
                        correctCount === 0 
                        ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200" 
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                >
                    <RotateCcw size={20}/> {correctCount === 0 ? "Retry Quiz" : "Retry Failed Questions Later"}
                </button>
             )}
             
             {/* Nút hủy nếu không muốn lưu gì cả */}
             <button onClick={onCancel} className="text-slate-400 text-sm font-bold hover:text-slate-600 underline">
                Cancel & Back
             </button>
          </div>
      </div>
    );
  }

  // --- QUESTION RENDER (GIỮ NGUYÊN PHẦN HIỂN THỊ CÂU HỎI) ---
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        {/* Header */}
        <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
                 <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Question {currentIndex + 1} / {questions.length}
                </span>
                {/* Thanh tiến độ nhỏ */}
                <div className="flex gap-1">
                    {questions.map((q, idx) => {
                        // Logic hiển thị chấm xanh/đỏ trên header
                        let color = "bg-slate-200";
                        if (results[q.id] === true) color = "bg-emerald-400";
                        if (results[q.id] === false) color = "bg-red-400";
                        if (idx === currentIndex) color = "bg-indigo-500 scale-125";
                        
                        return <div key={idx} className={`w-2 h-2 rounded-full transition-all ${color}`}></div>
                    })}
                </div>
            </div>
        </div>

        {/* Question Body */}
        <div className="p-8 flex-1">
            <h3 className="text-xl font-bold text-slate-800 mb-6 leading-relaxed">
                {currentQ.question}
            </h3>

            <div className="space-y-3">
                {currentQ.options.map((opt: string, idx: number) => {
                    let btnClass = "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50";
                    
                    if (isAnswered) {
                        if (idx === currentQ.correct_answer_index) {
                            btnClass = "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500";
                        } else if (idx === selectedAnswer) {
                            btnClass = "border-red-500 bg-red-50 text-red-700";
                        } else {
                            btnClass = "border-slate-100 opacity-50";
                        }
                    } else if (idx === selectedAnswer) {
                         btnClass = "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500";
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => handleAnswer(idx)}
                            disabled={isAnswered}
                            className={`w-full p-4 text-left rounded-xl border-2 font-medium transition-all duration-200 flex justify-between items-center ${btnClass}`}
                        >
                            <span>{opt}</span>
                            {isAnswered && idx === currentQ.correct_answer_index && <CheckCircle size={20} className="text-emerald-500"/>}
                            {isAnswered && idx === selectedAnswer && idx !== currentQ.correct_answer_index && <XCircle size={20} className="text-red-500"/>}
                        </button>
                    )
                })}
            </div>

            {/* Explanation */}
            {isAnswered && (
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 text-blue-800 text-sm animate-fade-in-up">
                    <span className="font-bold block mb-1 flex items-center gap-2"><BookOpen size={16}/> Explanation:</span>
                    {currentQ.explanation}
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
            <button
                onClick={handleNext}
                disabled={!isAnswered}
                className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                    isAnswered 
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg" 
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
            >
                {currentIndex === questions.length - 1 ? "Finish & Review" : "Next Question"} <ArrowRight size={18}/>
            </button>
        </div>
    </div>
  );
}