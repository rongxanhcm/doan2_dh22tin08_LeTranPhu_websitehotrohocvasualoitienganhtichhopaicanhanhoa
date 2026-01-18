"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabaseClient";
import { CheckCircle, XCircle, Loader2, ArrowRight, Flag, RefreshCw } from "lucide-react";

interface QuizViewProps {
  errors: any[];
  language: string;
  onSuccess: () => void;
  onCancel: () => void; // Nút để quay lại danh sách lỗi nếu không muốn làm nữa
}

export default function QuizView({ errors, language, onSuccess, onCancel }: QuizViewProps) {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [updating, setUpdating] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Logic gọi API y hệt cũ, chỉ khác là UI
    setLoading(true);
    fetch("http://localhost:8000/generate-batch-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        errors: errors.map(e => ({ 
            id: e.id, 
            error_type: e.error_type, 
            original_text: e.explanation // Nhớ: Tốt nhất là truyền câu gốc từ trang cha vào đây
         })),
        language: language
      })
    })
    .then(res => res.json())
    .then(data => {
      setQuestions(data.questions || []);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleSelect = (idx: number) => {
    if (showResult) return;
    setAnswers(prev => ({ ...prev, [currentIndex]: idx }));
  };

  const finishQuiz = async () => {
    setShowResult(true);
    setUpdating(true);
    const correctIds: number[] = [];
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correct_answer_index) correctIds.push(q.id);
    });

    if (correctIds.length > 0) {
      await supabase.from("analysis_results").update({ is_resolved: true }).in("id", correctIds);
      setTimeout(() => onSuccess(), 2500); // Đợi xíu cho user sướng rồi mới reload
    } else {
        setUpdating(false);
    }
  };

  // --- UI LOADING (Thay thế danh sách lỗi) ---
  if (loading) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center min-h-[400px] animate-fade-in">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
        <h3 className="text-xl font-bold text-slate-800">AI is crafting your personal quiz...</h3>
        <p className="text-slate-500 mt-2">Analyzing your specific mistakes to generate targeted questions.</p>
      </div>
    );
  }

  // --- UI KẾT QUẢ ---
  if (showResult) {
    const score = questions.filter((q, i) => answers[i] === q.correct_answer_index).length;
    return (
      <div className="bg-indigo-900 text-white p-12 rounded-2xl shadow-lg text-center min-h-[400px] flex flex-col items-center justify-center animate-fade-in-up">
        <h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
        <div className="text-8xl font-black text-emerald-400 my-6">{score}/{questions.length}</div>
        
        {updating ? (
           <div className="flex items-center gap-2 text-indigo-200 animate-pulse">
             <RefreshCw className="animate-spin" size={20}/> Saving your progress...
           </div>
        ) : (
           <button onClick={onSuccess} className="bg-white text-indigo-900 px-8 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors">
             Finish & Review Dashboard
           </button>
        )}
      </div>
    );
  }

  // --- UI LÀM BÀI (Quiz Interface) ---
  const currentQ = questions[currentIndex];
  if (!currentQ) return <div className="text-red-500">Error loading questions. <button onClick={onCancel}>Back</button></div>;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden animate-fade-in-up min-h-[500px] flex flex-col">
      {/* Header & Progress */}
      <div className="bg-slate-50 p-4 border-b flex justify-between items-center">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Question {currentIndex + 1} / {questions.length}</span>
        <button onClick={onCancel} className="text-slate-400 hover:text-red-500 text-sm font-bold">Exit Quiz</button>
      </div>
      <div className="w-full bg-slate-100 h-1">
        <div className="bg-indigo-600 h-1 transition-all duration-500" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
      </div>

      <div className="p-8 flex-1 flex flex-col">
        {/* Câu hỏi */}
        <h3 className="text-2xl font-bold text-slate-800 mb-8 leading-snug">
          {currentQ.question}
        </h3>

        {/* Đáp án */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 content-start">
          {currentQ.options.map((opt: string, idx: number) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`p-6 rounded-xl border-2 text-lg font-medium text-left transition-all
                ${answers[currentIndex] === idx 
                  ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md transform scale-[1.02]" 
                  : "border-slate-100 hover:border-indigo-200 hover:bg-slate-50 text-slate-600"
                }`}
            >
              <span className="inline-block w-8 h-8 rounded-full bg-white border border-slate-200 text-center leading-7 text-sm font-bold text-slate-400 mr-3 shadow-sm">
                {String.fromCharCode(65 + idx)}
              </span>
              {opt}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-end">
          {currentIndex < questions.length - 1 ? (
             <button 
               onClick={() => setCurrentIndex(p => p + 1)}
               disabled={answers[currentIndex] === undefined}
               className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
             >
               Next Question <ArrowRight size={20}/>
             </button>
          ) : (
             <button 
               onClick={finishQuiz}
               disabled={answers[currentIndex] === undefined}
               className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-emerald-200 shadow-lg"
             >
               Submit & See Score <Flag size={20}/>
             </button>
          )}
        </div>
      </div>
    </div>
  );
}