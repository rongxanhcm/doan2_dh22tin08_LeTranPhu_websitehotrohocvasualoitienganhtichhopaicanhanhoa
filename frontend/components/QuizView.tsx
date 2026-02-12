"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Check, X, ArrowRight, BookOpen, RotateCcw, 
  ShieldCheck, Zap, Loader2, Award, AlertCircle 
} from "lucide-react";
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
  
  // Lưu kết quả: Key = Real_DB_ID, Value = true/false
  const [results, setResults] = useState<Record<number, boolean>>({});
  
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [saving, setSaving] = useState(false);

  const supabase = createClient();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Prevent re-fetch loop
  const errorIdsKey = useMemo(() => errors.map(e => e.id).join(','), [errors]);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (errors.length === 0) return;
      setLoading(true);
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

        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
            setQuestions(data.questions);
        } else {
            throw new Error("Empty questions");
        }
      } catch (err) {
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [errorIdsKey, language]);

  const handleAnswer = (optionIndex: number) => {
    if (isAnswered) return;
    setSelectedAnswer(optionIndex);
    setIsAnswered(true);

    const isCorrect = optionIndex === questions[currentIndex].correct_answer_index;
    const realDbId = errors[currentIndex].id; // Map với ID lỗi gốc
    
    setResults(prev => ({ ...prev, [realDbId]: isCorrect }));
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

  const handleComplete = async () => {
    const resolvedIds = Object.keys(results).map(Number).filter(id => results[id] === true);
    
    if (resolvedIds.length === 0) {
        resetQuiz();
        return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("analysis_results")
      .update({ is_resolved: true })
      .in("id", resolvedIds);

    if (error) {
        alert("Sync error");
        setSaving(false);
    } else {
        onSuccess(); // Refresh parent data
    }
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setResults({});
    setShowResult(false);
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  // --- RENDER STATES ---

  // 1. Loading State (Minimalist)
  if (loading) return (
    <div className="py-24 text-center flex flex-col items-center justify-center space-y-4 animate-in fade-in">
        <div className="relative">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-cyan-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <Zap size={16} className="text-cyan-500 fill-cyan-500"/>
            </div>
        </div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Generating Challenges...</p>
    </div>
  );

  // 2. Error State
  if (fetchError) return (
    <div className="py-16 text-center space-y-4">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
            <AlertCircle size={24}/>
        </div>
        <h3 className="text-slate-900 font-bold">Quiz Generation Failed</h3>
        <button onClick={onCancel} className="text-sm font-bold text-slate-500 hover:text-slate-900 underline">Close</button>
    </div>
  );

  // 3. Result State (Celebration)
  if (showResult) {
    const correctCount = Object.values(results).filter(Boolean).length;
    const totalCount = questions.length;
    const isPerfect = correctCount === totalCount;

    return (
      <div className="py-10 px-4 text-center animate-in zoom-in-95 duration-300">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl ${isPerfect ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white' : 'bg-white border-2 border-slate-100 text-slate-700'}`}>
             {isPerfect ? <Award size={40}/> : <span className="text-3xl font-black">{correctCount}/{totalCount}</span>}
          </div>
          
          <h3 className="text-2xl font-black text-slate-900 mb-2">
              {isPerfect ? "Mastery Achieved!" : "Session Complete"}
          </h3>
          <p className="text-slate-500 text-sm mb-8 max-w-xs mx-auto font-medium">
            {isPerfect 
                ? "You've successfully fixed all identified errors." 
                : `You fixed ${correctCount} errors. ${totalCount - correctCount} issues remain for review.`}
          </p>

          <div className="flex flex-col gap-3 max-w-xs mx-auto">
             {correctCount > 0 && (
                 <button 
                    onClick={handleComplete}
                    disabled={saving}
                    className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-cyan-600 transition-all shadow-lg flex items-center justify-center gap-2"
                 >
                    {saving ? <Loader2 className="animate-spin" size={18}/> : <ShieldCheck size={18}/>}
                    Save Progress
                 </button>
             )}
             
             {!isPerfect && (
                 <button 
                    onClick={resetQuiz}
                    className="w-full py-3.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:border-slate-300 transition-all flex items-center justify-center gap-2"
                 >
                    <RotateCcw size={18}/> Try Again
                 </button>
             )}
             
             {correctCount === 0 && (
                 <button onClick={onCancel} className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-4 hover:text-slate-600">Close without saving</button>
             )}
          </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  // 4. Question State (The Core Interface)
  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-500">
        {/* Header Progress */}
        <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Question {currentIndex + 1} <span className="text-slate-300">/ {questions.length}</span>
            </span>
            <div className="flex gap-1">
                {questions.map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-1.5 w-4 rounded-full transition-all duration-300 ${
                            i < currentIndex ? 'bg-cyan-200' : i === currentIndex ? 'bg-cyan-500 w-8' : 'bg-slate-100'
                        }`} 
                    />
                ))}
            </div>
        </div>

        {/* Question */}
        <h3 className="text-xl font-bold text-slate-900 leading-snug mb-8">
            {currentQ.question}
        </h3>

        {/* Options */}
        <div className="space-y-3 mb-8">
            {currentQ.options.map((opt: string, idx: number) => {
                const isCorrect = idx === currentQ.correct_answer_index;
                const isSelected = idx === selectedAnswer;
                
                let containerClass = "border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/50";
                let textClass = "text-slate-700";
                let icon = null;

                if (isAnswered) {
                    if (isCorrect) {
                        containerClass = "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500";
                        textClass = "text-emerald-900 font-bold";
                        icon = <Check size={18} className="text-emerald-600"/>;
                    } else if (isSelected) {
                        containerClass = "border-red-400 bg-red-50";
                        textClass = "text-red-900 font-bold";
                        icon = <X size={18} className="text-red-500"/>;
                    } else {
                        containerClass = "border-slate-100 opacity-50 grayscale";
                    }
                } else if (isSelected) {
                    containerClass = "border-cyan-500 bg-cyan-50 ring-1 ring-cyan-500";
                }

                return (
                    <button
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        disabled={isAnswered}
                        className={`w-full p-4 md:p-5 text-left rounded-xl border-2 transition-all duration-200 flex justify-between items-center group ${containerClass}`}
                    >
                        <span className={`text-sm font-medium ${textClass}`}>{opt}</span>
                        {icon}
                    </button>
                );
            })}
        </div>

        {/* Footer: Explanation & Next */}
        <div className="mt-auto">
            {isAnswered ? (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                    <div className="mb-4 p-4 bg-slate-50 rounded-xl border-l-4 border-slate-300 text-sm text-slate-600 italic">
                        <span className="font-bold text-slate-900 not-italic block mb-1 flex items-center gap-2">
                            <BookOpen size={14}/> Explanation
                        </span>
                        {currentQ.explanation}
                    </div>
                    <button
                        onClick={handleNext}
                        className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-cyan-600 transition-all shadow-lg"
                    >
                        {currentIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"} <ArrowRight size={18}/>
                    </button>
                </div>
            ) : (
                <div className="text-center">
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Select an answer to continue</p>
                </div>
            )}
        </div>
    </div>
  );
}