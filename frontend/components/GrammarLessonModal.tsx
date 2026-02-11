"use client";

import { X, BookOpen, Lightbulb, Check, X as XIcon, Sparkles } from "lucide-react";
import { GrammarRule } from "@/lib/grammarRules";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  rule: GrammarRule | null;
}

export default function GrammarLessonModal({ isOpen, onClose, rule }: Props) {
  if (!isOpen || !rule) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden border border-white/20 relative z-10 animate-bounce-in flex flex-col max-h-[90vh]">
        
        {/* --- DECORATIVE BACKGROUND --- */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-rose-500/10 rounded-full blur-[60px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

        {/* --- HEADER --- */}
        <div className="relative p-6 sm:p-8 pb-4 flex justify-between items-start shrink-0">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner border border-indigo-100/50">
                    <BookOpen size={24} />
                </div>
                <div>
                    <div className="flex items-center gap-1.5 text-indigo-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5">
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
                <div className="bg-gradient-to-br from-indigo-50 to-violet-50 p-5 rounded-2xl border border-indigo-100/50 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500 rounded-l-2xl" />
                    <p className="text-indigo-900 font-bold leading-relaxed pl-2">
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
        <div className="p-6 sm:p-8 pt-4 bg-white border-t border-slate-50 shrink-0">
            <button 
                onClick={onClose} 
                className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-indigo-600 transition-all shadow-xl hover:shadow-indigo-200 hover:-translate-y-1"
            >
                Got it, I'll remember this!
            </button>
        </div>

      </div>
    </div>
  );
}