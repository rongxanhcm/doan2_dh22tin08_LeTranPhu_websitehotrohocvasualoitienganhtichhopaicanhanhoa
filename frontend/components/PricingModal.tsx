"use client";

import { useState } from "react";
import { Check, Zap, X, Shield, Loader2, Sparkles, ArrowRight, FileText, Globe } from "lucide-react";
import { createClient } from "@/lib/supabaseClient";
import Image from "next/image";
import toast from "react-hot-toast";

// --- CẤU HÌNH LINK THANH TOÁN ---
// 1. Link Monthly (Đã lọc từ text bạn gửi)
const CHECKOUT_URL_MONTHLY = "https://eloqua.lemonsqueezy.com/checkout/buy/76ea9484-fa92-43c9-ac90-ef9c22e2beab?enabled=1304553";

// 2. Link Yearly (⚠️ BẠN CẦN THAY MÃ THẬT VÀO ĐÂY NẾU ĐÃ CÓ)
// Hiện tại mình để tạm placeholder, nếu khách chọn Yearly sẽ lỗi 404
const CHECKOUT_URL_YEARLY = "https://eloqua.lemonsqueezy.com/checkout/buy/2b2a245a-5675-47b4-bd64-ccd3aedd8e01?enabled=1304546";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  if (!isOpen) return null;

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      // 1. Lấy thông tin User hiện tại
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please login to upgrade.");
        setIsLoading(false);
        return;
      }

      // 2. Chọn link dựa trên gói khách chọn (Tháng hoặc Năm)
      const baseUrl = billingCycle === 'monthly' ? CHECKOUT_URL_MONTHLY : CHECKOUT_URL_YEARLY;

      // 3. Kiểm tra nếu chưa thay link Yearly
      if (baseUrl.includes("xxxxxxxx")) {
        toast.error("Yearly plan is coming soon. Please choose Monthly.");
        setIsLoading(false);
        return;
      }

      // 4. Tạo URL thanh toán có gắn User ID (Quan trọng để Webhook nhận diện)
      // Cấu trúc: ?checkout[custom][user_id]=USER_ID
      const checkoutUrl = `${baseUrl}?checkout[custom][user_id]=${user.id}`;

      // 5. Chuyển hướng sang Lemon Squeezy
      window.location.href = checkoutUrl;

    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  const comparisonFeatures = [
    { name: "Daily Analysis Limit", free: "2 essays", pro: "50 essays", icon: <Zap size={16}/> },
    { name: "Band 9.0 Elite Rewrite", free: false, pro: true, icon: <Sparkles size={16}/> },
    { name: "Full PDF Progress Reports", free: false, pro: true, icon: <FileText size={16}/> },    
    { name: "Advanced Vocabulary Insights", free: false, pro: true, icon: <Globe size={16}/> },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="bg-white rounded-[32px] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] relative animate-in zoom-in-95 duration-300 flex flex-col md:flex-row border border-slate-200">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-6 right-6 z-50 p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400">
            <X size={20} />
        </button>

        {/* --- LEFT SIDE: THE VALUE (White Panel) --- */}
        <div className="flex-[1.2] p-10 md:p-14 bg-white overflow-y-auto custom-scrollbar">
            <div className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                    <Image src="/logo.svg" alt="Eloqua" width={28} height={28} />
                    <span className="font-bold text-lg tracking-tight">Eloqua <span className="text-cyan-600">Pro</span></span>
                </div>
                
                <h2 className="text-4xl font-bold text-slate-900 leading-tight tracking-tight">
                    From <span className="text-slate-300 italic font-serif pr-1">"Okay"</span> <br/>
                    to <span className="relative">
                      Elite.
                      <span className="absolute bottom-1 left-0 w-full h-3 bg-cyan-100 -z-10 rounded-full" />
                    </span>
                </h2>
                <p className="mt-4 text-slate-500 font-medium">Unlock the full potential of your academic writing.</p>
            </div>

            {/* Comparison Table */}
            <div className="space-y-1 mb-10">
                <div className="grid grid-cols-12 px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                    <div className="col-span-7">Features</div>
                    <div className="col-span-2 text-center">Free</div>
                    <div className="col-span-3 text-center text-cyan-600">Pro</div>
                </div>
                {comparisonFeatures.map((f, i) => (
                    <div key={i} className="grid grid-cols-12 items-center px-4 py-4 rounded-xl hover:bg-slate-50 transition-colors group">
                        <div className="col-span-7 flex items-center gap-3">
                            <div className="text-slate-300 group-hover:text-cyan-500 transition-colors">{f.icon}</div>
                            <span className="text-sm font-semibold text-slate-700">{f.name}</span>
                        </div>
                        <div className="col-span-2 text-center text-xs font-medium text-slate-400">
                            {typeof f.free === 'boolean' ? (f.free ? <Check size={16} className="mx-auto text-emerald-500"/> : <X size={14} className="mx-auto text-slate-200"/>) : f.free}
                        </div>
                        <div className="col-span-3 text-center text-sm font-bold text-cyan-600">
                            {typeof f.pro === 'boolean' ? (f.pro ? <Check size={18} className="mx-auto" strokeWidth={3}/> : <X size={18} className="mx-auto"/>) : f.pro}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <Shield size={20} className="text-slate-400 shrink-0" />
                <p className="text-slate-500 text-[11px] leading-relaxed font-medium uppercase tracking-tight">
                    Secure checkout powered by Stripe. 7-day money-back guarantee if you're not reaching your goals.
                </p>
            </div>
        </div>

        {/* --- RIGHT SIDE: THE ACTION (Dark Panel) --- */}
        <div className="flex-1 bg-slate-900 p-10 md:p-14 relative flex flex-col justify-center border-l border-white/5">
            {/* Abstract Background Decor */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />
            </div>

            <div className="relative z-10">
                {/* Billing Toggle */}
                <div className="flex bg-white/5 p-1 rounded-xl w-full mb-12 border border-white/10">
                    <button 
                        onClick={() => setBillingCycle('monthly')}
                        className={`flex-1 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:text-white'}`}
                    >
                        Monthly
                    </button>
                    <button 
                        onClick={() => setBillingCycle('yearly')}
                        className={`flex-1 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all relative ${billingCycle === 'yearly' ? 'bg-cyan-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}
                    >
                        Yearly
                        <span className="absolute -top-2 -right-1 bg-emerald-500 text-[8px] px-2 py-0.5 rounded-full text-white font-black tracking-normal ring-4 ring-slate-900">SAVE 20%</span>
                    </button>
                </div>

                <div className="mb-12 text-center md:text-left">
                    <p className="text-cyan-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">The Pro Plan</p>
                    <div className="flex items-baseline justify-center md:justify-start gap-2">
                        <span className="text-7xl font-bold text-white tracking-tighter">
                            {billingCycle === 'monthly' ? '$5' : '$48'}
                        </span>
                        <div className="text-left">
                            <p className="text-cyan-100 text-lg font-bold leading-none">USD</p>
                            <p className="text-slate-500 text-xs font-medium italic">per {billingCycle === 'monthly' ? 'month' : 'year'}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <button 
                        onClick={handleCheckout} // <--- Đã đổi thành hàm mới
                        disabled={isLoading}
                        className="group w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-lg shadow-lg shadow-cyan-900/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 overflow-hidden relative"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <>
                                Unlock Full Access <ArrowRight size={18} />
                            </>
                        )}
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                        <style jsx>{`
                          @keyframes shimmer {
                            100% { transform: translateX(100%); }
                          }
                        `}</style>
                    </button>
                    
                    <div className="flex items-center justify-center gap-8 py-6 border-t border-white/5">
                        <div className="text-center">
                            <p className="text-white font-bold text-xl">4.9/5</p>
                            <p className="text-slate-500 text-[8px] uppercase font-bold tracking-widest mt-1">User Rating</p>
                        </div>
                        <div className="w-[1px] h-8 bg-white/10" />
                        <div className="text-center">
                            <p className="text-white font-bold text-xl">25k+</p>
                            <p className="text-slate-500 text-[8px] uppercase font-bold tracking-widest mt-1">Essays Fixed</p>
                        </div>
                    </div>
                    
                    <p className="text-center text-slate-500 text-[10px] font-medium uppercase tracking-widest">
                        Secure transaction • Cancel Anytime
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}