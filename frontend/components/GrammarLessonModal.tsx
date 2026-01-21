"use client";

import { X, BookOpen, Lightbulb, CheckCircle, XCircle } from "lucide-react";
import { GrammarRule } from "@/lib/grammarRules";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  rule: GrammarRule | null;
}

export default function GrammarLessonModal({ isOpen, onClose, rule }: Props) {
  if (!isOpen || !rule) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-indigo-600 p-6 flex justify-between items-start">
            <div className="text-white">
                <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">
                    <BookOpen size={14}/> Grammar Card
                </div>
                <h2 className="text-2xl font-bold">{rule.title}</h2>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white hover:bg-white/20 p-1 rounded-lg transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
            
            {/* Definition & Rule */}
            <div className="space-y-3">
                <p className="text-slate-600">{rule.definition}</p>
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-indigo-900 font-medium">
                    🎯 <span className="font-bold">Quy tắc:</span> {rule.rule}
                </div>
            </div>

            {/* Examples Grid */}
            <div className="grid grid-cols-1 gap-3">
                <div className="flex items-start gap-3 bg-red-50 p-3 rounded-lg border border-red-100">
                    <XCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                    <div>
                        <span className="text-xs font-bold text-red-400 uppercase block mb-1">Sai</span>
                        <span className="text-slate-700 line-through decoration-red-400/50">{rule.bad_example}</span>
                    </div>
                </div>

                <div className="flex items-start gap-3 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                    <CheckCircle className="text-emerald-600 shrink-0 mt-0.5" size={20} />
                    <div>
                        <span className="text-xs font-bold text-emerald-500 uppercase block mb-1">Đúng</span>
                        <span className="text-slate-900 font-bold">{rule.good_example}</span>
                    </div>
                </div>
            </div>

            {/* Pro Tip */}
            <div className="flex gap-3 items-start text-sm text-slate-500 border-t border-slate-100 pt-4">
                <Lightbulb className="text-yellow-500 shrink-0" size={18} />
                <p><span className="font-bold text-slate-700">Mẹo nhớ:</span> {rule.tip}</p>
            </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
            <button onClick={onClose} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
                Đã hiểu, tôi sẽ chú ý!
            </button>
        </div>

      </div>
    </div>
  );
}