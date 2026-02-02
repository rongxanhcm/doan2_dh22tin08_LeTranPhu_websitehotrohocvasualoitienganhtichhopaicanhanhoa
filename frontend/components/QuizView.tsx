"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, ArrowRight, BookOpen, RotateCcw } from "lucide-react";
import { createClient } from "@/lib/supabaseClient"; // [MỚI] Thêm import này để update DB

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
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [updating, setUpdating] = useState(false); // [MỚI] State loading khi update DB

  const supabase = createClient(); // [MỚI] Init supabase

  // [QUAN TRỌNG] Lấy URL từ biến môi trường (Fix lỗi Vercel)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        // [QUAN TRỌNG] Chuẩn bị payload đúng chuẩn Backend yêu cầu
        const payload = {
            language: language,
            errors: errors.map(e => ({
                id: e.id,
                error_type: e.error_type,
                quote: e.quote // [FIX] Phải gửi 'quote' mới đúng, ko gửi original_text hay explanation
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

  const handleAnswer = (optionIndex: number) => {
    if (isAnswered) return;
    setSelectedAnswer(optionIndex);
    setIsAnswered(true);

    if (optionIndex === questions[currentIndex].correct_answer_index) {
      setScore(score + 1);
    }
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

  // [MỚI] Hàm cập nhật trạng thái "Đã sửa" vào Database khi làm xong
  const finishQuiz = async () => {
      setUpdating(true);
      try {
          // Lấy danh sách ID các lỗi đã có trong bài Quiz này
          const resolvedIds = errors.map(e => e.id);
          
          if (resolvedIds.length > 0) {
              await supabase
                  .from("analysis_results")
                  .update({ is_resolved: true })
                  .in("id", resolvedIds);
          }
          // Đợi xíu cho user thấy hiệu ứng rồi mới báo thành công
          setTimeout(() => onSuccess(), 1500);
      } catch (err) {
          console.error("Lỗi update DB:", err);
          setUpdating(false);
          onSuccess(); // Vẫn cho qua dù lỗi DB
      }
  };

  // --- UI RENDERING ---

  if (loading) return (
    <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm animate-pulse">
        <div className="w-16 h-16 bg-indigo-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <RotateCcw className="animate-spin text-indigo-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-700">Generating personalized quiz...</h3>
        <p className="text-slate-400 text-sm">AI is reviewing your specific errors.</p>
    </div>
  );

  if (fetchError) return (
    <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-100">
        <h3 className="text-red-600 font-bold mb-2">Error loading questions</h3>
        <p className="text-sm text-red-500 mb-4">Could not connect to AI server.</p>
        <button onClick={onCancel} className="text-sm font-bold underline text-red-700">Go Back</button>
    </div>
  );

  if (showResult) return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center animate-fade-in">
        <div className="mb-6">
            <span className="text-6xl font-black text-indigo-600">{score}</span>
            <span className="text-slate-400 text-xl font-medium">/{questions.length}</span>
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">
            {score === questions.length ? "Perfect Score! 🎉" : "Good Practice!"}
        </h3>
        <p className="text-slate-500 mb-8">You have reviewed your mistakes.</p>
        
        <button 
            onClick={finishQuiz}
            disabled={updating}
            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-70 flex items-center justify-center gap-2"
        >
            {updating ? (
                <>Saving Progress <RotateCcw className="animate-spin" size={18}/></>
            ) : (
                "Finish & Mark Resolved"
            )}
        </button>
    </div>
  );

  const currentQ = questions[currentIndex];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        {/* Header */}
        <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Question {currentIndex + 1} / {questions.length}
            </span>
            <button onClick={onCancel} className="text-xs font-bold text-slate-400 hover:text-red-500">Exit</button>
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
                {currentIndex === questions.length - 1 ? "View Result" : "Next Question"} <ArrowRight size={18}/>
            </button>
        </div>
    </div>
  );
}