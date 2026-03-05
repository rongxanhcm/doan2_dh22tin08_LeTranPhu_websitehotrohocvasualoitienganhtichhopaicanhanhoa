"use client";

import { useState, useEffect } from "react";
import { X, BookOpen, Lightbulb, Check, X as XIcon, Sparkles, Zap, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabaseClient";
import { GrammarRule } from "@/lib/grammarRules";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  rule: GrammarRule | null;
  errorId?: number;
  errorType?: string;
  quote?: string;
  language?: string;
  onMarkedResolved?: () => void;
}

export default function GrammarLessonModal({ 
  isOpen, 
  onClose, 
  rule, 
  errorId,
  errorType,
  quote,
  language = "vi",
  onMarkedResolved
}: Props) {
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [results, setResults] = useState<Record<number, boolean>>({});
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const supabase = createClient();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  if (!isOpen || !rule) return null;

  const handleStartQuiz = async () => {
    if (!errorType || !quote) return;
    
    setQuizLoading(true);
    setQuizError(false);
    setIsQuizMode(true);
    
    try {
      const res = await fetch(`${API_URL}/generate-quiz-single`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error_type: errorType,
          quote: quote,
          native_language: language
        })
      });

      if (!res.ok) throw new Error("Failed to generate quiz");

      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuizQuestions(data.questions);
        setCurrentIndex(0);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setResults({});
        setShowQuizResult(false);
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
    
    const isCorrect = optionIndex === quizQuestions[currentIndex].correct_answer_index;
    setResults(prev => ({ ...prev, [currentIndex]: isCorrect }));
  };

  const handleNextQuestion = () => {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setShowQuizResult(true);
    }
  };

  const handleCompleteQuiz = async () => {
    if (!errorType || !userId) return;
    
    const correctCount = Object.values(results).filter(v => v === true).length;
    const passedQuiz = correctCount >= 6; // 60% passing score (6 out of 10)
    const score = correctCount; // 0-10 score

    setSaving(true);
    try {
      // Save quiz attempt to new table
      await supabase
        .from("quiz_attempts")
        .insert({
          user_id: userId,
          error_type: errorType,
          quiz_date: new Date().toISOString(),
          score: score,
          passed: passedQuiz
        });

      if (passedQuiz) {
        // Also mark as resolved in old table for backward compatibility
        if (errorId) {
          await supabase
            .from("analysis_results")
            .update({ is_resolved: true })
            .eq("id", errorId);
        }
        
        if (onMarkedResolved) onMarkedResolved();
        
        // Close after short delay to show success
        setTimeout(() => {
          setIsQuizMode(false);
          onClose();
        }, 500);
      } else {
        // Restart quiz
        setCurrentIndex(0);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setResults({});
        setShowQuizResult(false);
        setSaving(false);
      }
    } catch (err) {
      console.error("Error saving quiz attempt:", err);
      setSaving(false);
    }
  };

  const correctCount = Object.values(results).filter(v => v === true).length;
  const passScore = 6; // 6 out of 10 to pass

  // MainLesson View
  if (!isQuizMode) {
    return (
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in">
        <div className="absolute inset-0" onClick={onClose} />

        <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden border border-white/20 relative z-10 animate-bounce-in flex flex-col max-h-[90vh]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

          {/* --- HEADER --- */}
          <div className="relative p-6 sm:p-8 pb-4 flex justify-between items-start shrink-0">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner border border-teal-100/50">
                <BookOpen size={24} />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-teal-600 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5">
                  <Sparkles size={12} /> Master Rule
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  {rule.title}
                </h2>
              </div>
            </div>
            
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-slate-800 hover:bg-slate-100 p-2 rounded-full transition-colors bg-white/50 backdrop-blur-sm"
            >
              <X size={20} />
            </button>
          </div>

          {/* --- CONTENT (SCROLLABLE) --- */}
          <div className="p-6 sm:p-8 pt-2 overflow-y-auto custom-scrollbar flex-1 space-y-8">
            {/* Definition & Core Rule */}
            <div className="space-y-4">
              <p className="text-slate-600 font-medium leading-relaxed text-[15px]">
                {rule.definition}
              </p>
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-5 rounded-2xl border border-teal-100/50 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-l-2xl" />
                <p className="text-teal-900 font-bold leading-relaxed pl-2">
                  {rule.rule}
                </p>
              </div>
            </div>

            {/* Examples Comparison */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1 mb-3">Compare</h3>
              
              {/* Bad Example */}
              <div className="flex items-start gap-4 bg-rose-50/50 p-4 rounded-[20px] border border-rose-100 group transition-colors hover:bg-rose-50">
                <div className="bg-rose-100 text-rose-600 p-1.5 rounded-full shrink-0 mt-0.5">
                  <XIcon size={16} strokeWidth={3} />
                </div>
                <div>
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block mb-1">Incorrect</span>
                  <span className="text-slate-600 font-medium line-through decoration-rose-400/40 decoration-2 text-[15px]">
                    {rule.bad_example}
                  </span>
                </div>
              </div>

              {/* Good Example */}
              <div className="flex items-start gap-4 bg-emerald-50/50 p-4 rounded-[20px] border border-emerald-100 group transition-colors hover:bg-emerald-50">
                <div className="bg-emerald-500 text-white p-1.5 rounded-full shadow-md shadow-emerald-200 shrink-0 mt-0.5">
                  <Check size={16} strokeWidth={3} />
                </div>
                <div>
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-1">Correct</span>
                  <span className="text-slate-900 font-bold text-[15px]">
                    {rule.good_example}
                  </span>
                </div>
              </div>
            </div>

            {/* Pro Tip */}
            {rule.tip && (
              <div className="flex gap-4 items-start bg-amber-50/50 border border-amber-100/60 p-5 rounded-2xl">
                <div className="bg-amber-100 text-amber-600 p-2 rounded-xl shrink-0">
                  <Lightbulb size={20} />
                </div>
                <p className="text-slate-700 text-sm leading-relaxed pt-0.5">
                  <span className="font-black text-amber-700 uppercase tracking-wide text-xs block mb-1">Pro Tip</span>
                  {rule.tip}
                </p>
              </div>
            )}
          </div>

          {/* --- FOOTER ACTION --- */}
          <div className="p-6 sm:p-8 pt-4 bg-white border-t border-slate-50 shrink-0 space-y-3">
            {errorType && quote && (
              <button 
                onClick={handleStartQuiz}
                className="w-full py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-black rounded-2xl hover:from-teal-600 hover:to-teal-700 transition-all shadow-xl shadow-teal-500/20 hover:shadow-teal-500/30 hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <Zap size={20} fill="currentColor" className="text-teal-200" />
                Practice Now (10 Questions)
              </button>
            )}
            <button 
              onClick={onClose} 
              className="w-full py-4 bg-slate-100 text-slate-900 font-black rounded-2xl hover:bg-slate-200 transition-all"
            >
              {errorType && quote ? "Close" : "Got it, I'll remember this!"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // === QUIZ MODE ===
  if (quizLoading) {
    return (
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <div className="bg-white rounded-[32px] p-8 shadow-2xl w-full max-w-md text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="w-16 h-16 border-4 border-slate-100 border-t-teal-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap size={20} className="text-teal-500 fill-teal-500" />
            </div>
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Generating Practice Questions...</p>
        </div>
      </div>
    );
  }

  if (quizError) {
    return (
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <div className="absolute inset-0" onClick={onClose} />
        <div className="bg-white rounded-[32px] p-8 shadow-2xl w-full max-w-md relative z-10 space-y-4 text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto" />
          <h3 className="text-slate-900 font-bold">Quiz Generation Failed</h3>
          <button 
            onClick={() => setIsQuizMode(false)}
            className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all"
          >
            Back to Lesson
          </button>
        </div>
      </div>
    );
  }

  if (showQuizResult) {
    const passed = correctCount >= passScore;
    const percentage = Math.round((correctCount / quizQuestions.length) * 100);

    return (
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <div className="absolute inset-0" onClick={() => !saving && setIsQuizMode(false)} />
        <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md relative z-10 overflow-hidden">
          <div className={`p-8 text-center space-y-6 ${passed ? "bg-gradient-to-br from-emerald-50 to-green-50" : "bg-gradient-to-br from-blue-50 to-cyan-50"}`}>
            <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center font-black text-4xl ${passed ? "bg-emerald-200 text-emerald-700" : "bg-blue-200 text-blue-700"}`}>
              {percentage}%
            </div>
            
            <div>
              <h3 className={`text-2xl font-black ${passed ? "text-emerald-700" : "text-blue-700"}`}>
                {passed ? "Perfect! Ready to master this!" : "Keep practicing!"}
              </h3>
              <p className={`text-sm font-medium mt-2 ${passed ? "text-emerald-600" : "text-blue-600"}`}>
                You got {correctCount} out of {quizQuestions.length} correct
              </p>
            </div>

            {!passed && (
              <div className="bg-teal-100/60 border border-teal-200 p-4 rounded-xl">
                <p className="text-sm text-teal-900">
                  <span className="font-bold">Need {passScore - correctCount} more correct</span> to pass (60% = 6/10)
                </p>
              </div>
            )}

            <div className="space-y-3 pt-4">
              <button
                onClick={handleCompleteQuiz}
                disabled={saving}
                className={`w-full py-4 font-black rounded-2xl transition-all text-white ${
                  passed
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-xl shadow-emerald-500/20"
                    : "bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-xl shadow-teal-500/20"
                } disabled:opacity-50`}
              >
                {saving ? "Saving..." : passed ? "Mark as Resolved ✓" : "Try Again"}
              </button>
              <button
                onClick={() => setIsQuizMode(false)}
                disabled={saving}
                className="w-full py-3 bg-slate-100 text-slate-900 font-bold rounded-2xl hover:bg-slate-200 transition-all disabled:opacity-50"
              >
                Back to Lesson
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Question Display
  if (quizQuestions.length === 0) return null;

  const currentQuestion = quizQuestions[currentIndex];
  const isCorrect = selectedAnswer === currentQuestion.correct_answer_index;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Progress Bar */}
        <div className="h-2 bg-slate-100">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / quizQuestions.length) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="p-6 flex justify-between items-center border-b border-slate-100">
          <div className="text-sm font-bold text-slate-500">
            Question {currentIndex + 1} of {quizQuestions.length}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 p-2 rounded-full hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-6">{currentQuestion.question}</h3>
            
            <div className="space-y-3">
              {currentQuestion.options.map((option: string, idx: number) => {
                const isSelected = selectedAnswer === idx;
                const isCorrectAnswer = idx === currentQuestion.correct_answer_index;
                let bgColor = "bg-slate-50 border-slate-200 hover:border-slate-300";
                
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
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all font-medium text-slate-900 ${bgColor} ${
                      isAnswered ? "cursor-default" : "cursor-pointer hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? (isCorrect ? "border-emerald-500 bg-emerald-500" : "border-red-500 bg-red-500") : "border-slate-300"
                      }`}>
                        {isSelected && <Check size={14} className="text-white" />}
                      </div>
                      {option}
                    </div>
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div className={`mt-6 p-4 rounded-xl ${isCorrect ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"}`}>
                <p className={`text-sm font-medium ${isCorrect ? "text-emerald-900" : "text-red-900"}`}>
                  <span className="font-bold">{isCorrect ? "Correct! " : "Explanation: "}</span>
                  {currentQuestion.explanation}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {isAnswered && (
          <div className="p-6 border-t border-slate-100 bg-slate-50">
            <button
              onClick={handleNextQuestion}
              className="w-full py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-black rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg shadow-teal-500/20"
            >
              {currentIndex < quizQuestions.length - 1 ? "Next Question" : "See Results"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}