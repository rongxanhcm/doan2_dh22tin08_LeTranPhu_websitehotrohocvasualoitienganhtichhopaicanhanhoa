"use client";

import { useState } from "react";
import { Check, Zap, X, Shield, Star, Loader2, Crown, Sparkles, ArrowRight, FileText } from "lucide-react";
import { createClient } from "@/lib/supabaseClient";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // [MỚI] Callback khi mua thành công
}

export default function PricingModal({ isOpen, onClose, onSuccess }: PricingModalProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  if (!isOpen) return null;

  const handleMockUpgrade = async () => {
      setIsLoading(true);
      try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
              toast.error("Please login first!");
              return;
          }

          const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
          const res = await fetch(`${API_URL}/debug/upgrade-pro`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ user_id: user.id })
          });

          if (!res.ok) throw new Error("Upgrade failed");

          onClose(); 
          
          // Pháo hoa ăn mừng
          const duration = 3 * 1000;
          const animationEnd = Date.now() + duration;
          const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
          const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

          const interval: any = setInterval(function() {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
          }, 250);

          toast.success("Upgrade Successful! Welcome to Pro 💎", { duration: 5000 });
          // [QUAN TRỌNG] Thay đổi logic ở đây:
          // KHÔNG reload trang nữa.
          // Gọi callback onSuccess để trang cha tự xử lý data
          if (onSuccess) {
              await onSuccess(); 
          }
          
          onClose(); // Đóng modal
      } catch (error) {
          toast.error("Payment simulation failed.");
      } finally {
          setIsLoading(false);
      }
  };

  const comparisonFeatures = [
    { name: "Daily Essay Limits", free: "2 essays", pro: "50 essays", icon: <Zap size={16}/> },
    { name: "Band 9.0 Rewrite", free: false, pro: true, icon: <Sparkles size={16}/> },
    { name: "Export PDF Progress Report", free: false, icon: <FileText size={16}/> },    
    { name: "Ad-free Experience", free: true, pro: true, icon: <Shield size={16}/> },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      <div className="bg-white rounded-[40px] w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] relative animate-in fade-in zoom-in duration-300 flex flex-col md:flex-row">
        
        {/* Nút đóng */}
        <button onClick={onClose} className="absolute top-6 right-6 z-50 p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-900">
            <X size={24} />
        </button>

        {/* --- CỘT TRÁI: COMPARISON & VALUE --- */}
        <div className="flex-[1.2] p-8 md:p-14 bg-white">
            <div className="mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                    <Sparkles size={12} fill="currentColor"/> Pro Benefits
                </div>
                <h2 className="text-4xl font-black text-slate-900 leading-tight">
                    Go from <span className="text-slate-400 italic font-serif">"Okay"</span> <br/>
                    to <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-4">Band 8.5+</span>
                </h2>
            </div>

            {/* Bảng so sánh được thiết kế lại */}
            <div className="space-y-1 mb-10">
                <div className="grid grid-cols-12 px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <div className="col-span-6">Features</div>
                    <div className="col-span-3 text-center">Free</div>
                    <div className="col-span-3 text-center text-indigo-600">Pro</div>
                </div>
                {comparisonFeatures.map((f, i) => (
                    <div key={i} className="grid grid-cols-12 items-center px-4 py-4 rounded-2xl hover:bg-slate-50 transition-colors group">
                        <div className="col-span-6 flex items-center gap-3">
                            <div className="text-slate-400 group-hover:text-indigo-500 transition-colors">{f.icon}</div>
                            <span className="text-sm font-bold text-slate-700">{f.name}</span>
                        </div>
                        <div className="col-span-3 text-center text-xs font-medium text-slate-400">
                            {typeof f.free === 'boolean' ? (f.free ? <Check size={16} className="mx-auto text-slate-300"/> : <X size={16} className="mx-auto"/>) : f.free}
                        </div>
                        <div className="col-span-3 text-center text-sm font-black text-indigo-600">
                            {typeof f.pro === 'boolean' ? (f.pro ? <Check size={18} className="mx-auto" strokeWidth={3}/> : <X size={18} className="mx-auto"/>) : f.pro}
                        </div>
                    </div>
                ))}
            </div>

            <p className="text-slate-400 text-xs flex items-center gap-2">
                <Shield size={14} /> 7-day money back guarantee. No questions asked.
            </p>
        </div>

        {/* --- CỘT PHẢI: CONVERSION & PRICING --- */}
        <div className="flex-1 bg-slate-900 p-8 md:p-14 relative flex flex-col justify-center border-l border-white/5">
            {/* Background Glow */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/30 rounded-full blur-[80px]" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-violet-500/20 rounded-full blur-[80px]" />
            </div>

            <div className="relative z-10">
                {/* Billing Toggle (Dark Version) */}
                <div className="flex bg-white/5 p-1 rounded-2xl w-full mb-10 border border-white/10">
                    <button 
                        onClick={() => setBillingCycle('monthly')}
                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white'}`}
                    >
                        Monthly
                    </button>
                    <button 
                        onClick={() => setBillingCycle('yearly')}
                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative ${billingCycle === 'yearly' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}
                    >
                        Yearly
                        <span className="absolute -top-2 -right-2 bg-emerald-500 text-[8px] px-2 py-1 rounded-full text-white ring-4 ring-slate-900">SAVE 20%</span>
                    </button>
                </div>

                <div className="mb-10 text-center md:text-left">
                    <p className="text-indigo-400 text-xs font-black uppercase tracking-[0.3em] mb-4">Ultimate Access</p>
                    <div className="flex items-baseline justify-center md:justify-start gap-2">
                        <span className="text-7xl font-black text-white tracking-tighter">
                            {billingCycle === 'monthly' ? '$5' : '$48'}
                        </span>
                        <div className="text-left">
                            <p className="text-indigo-300 text-lg font-bold leading-none">USD</p>
                            <p className="text-slate-500 text-xs font-medium">/ {billingCycle === 'monthly' ? 'month' : 'year'}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 mb-10">
                    <button 
                        onClick={handleMockUpgrade}
                        disabled={isLoading}
                        className="group w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-[24px] text-lg shadow-[0_20px_40px_-12px_rgba(79,70,229,0.4)] transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 overflow-hidden relative"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <>
                                Get Pro Access Now <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                            </>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    </button>
                    <p className="text-center text-slate-500 text-[10px] font-medium uppercase tracking-widest">
                        Recurring billing. Cancel anytime in 1-click.
                    </p>
                </div>

                {/* Social Proof / Trust */}
                <div className="pt-8 border-t border-white/10 flex flex-wrap justify-center gap-6">
                    <div className="flex flex-col items-center">
                        <p className="text-white font-black text-lg leading-none">4.9/5</p>
                        <p className="text-slate-500 text-[8px] uppercase font-bold mt-1">User Rating</p>
                    </div>
                    <div className="w-[1px] h-8 bg-white/10" />
                    <div className="flex flex-col items-center">
                        <p className="text-white font-black text-lg leading-none">12K+</p>
                        <p className="text-slate-500 text-[8px] uppercase font-bold mt-1">Essays Fixed</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}