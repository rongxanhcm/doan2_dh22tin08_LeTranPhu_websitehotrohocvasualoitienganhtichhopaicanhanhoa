"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Zap, Star, Shield, ArrowLeft } from "lucide-react";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const router = useRouter();

  const features = [
    { name: "Daily Essay Analysis", free: "2 essays/day", pro: "50 essays/day" },
    { name: "Grammar & Spelling Check", free: true, pro: true },
    { name: "Band Score Prediction", free: true, pro: true },
    { name: "AI Feedback & Suggestions", free: "Basic", pro: "Advanced" },
    { name: "Band 9.0 Rewrite (C2 Vocab)", free: false, pro: true },
    { name: "Detailed Grammar Lessons", free: false, pro: true },
    { name: "Priority Processing Speed", free: false, pro: true },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
             <button onClick={() => router.push("/")} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors">
                 <ArrowLeft size={20}/> Back to App
             </button>
             <span className="font-black text-xl tracking-tight">CoreFix <span className="text-indigo-600">Pro</span></span>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                Achieve Band 9.0 <span className="text-indigo-600">Faster</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium">
                Unlock the full potential of CoreFix AI. Get advanced vocabulary upgrades, unlimited checks, and native-level rewrites.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center mt-8 gap-4">
                <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-400'}`}>Monthly</span>
                <button 
                    onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                    className="w-14 h-8 bg-indigo-600 rounded-full p-1 relative transition-colors shadow-inner"
                >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${billingCycle === 'yearly' ? 'translate-x-6' : ''}`} />
                </button>
                <span className={`text-sm font-bold ${billingCycle === 'yearly' ? 'text-slate-900' : 'text-slate-400'}`}>
                    Yearly <span className="text-emerald-500 text-xs ml-1">(Save 20%)</span>
                </span>
            </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* FREE PLAN */}
            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex flex-col relative overflow-hidden">
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-slate-500 uppercase tracking-widest mb-2">Starter</h3>
                    <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-black text-slate-900">$0</span>
                        <span className="text-slate-400 font-medium">/ forever</span>
                    </div>
                    <p className="text-slate-500 mt-4 text-sm font-medium">Perfect for trying out the platform and checking basic grammar.</p>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1">
                    {features.map((f, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                            {f.free ? (
                                <Check size={18} className="text-emerald-500 shrink-0" />
                            ) : (
                                <div className="w-[18px] flex justify-center"><div className="w-1.5 h-1.5 bg-slate-300 rounded-full" /></div>
                            )}
                            <span className={!f.free ? "text-slate-400 line-through decoration-slate-300" : ""}>
                                {typeof f.free === 'string' ? f.free : f.name}
                            </span>
                        </li>
                    ))}
                </ul>

                <button onClick={() => router.push("/")} className="w-full py-4 rounded-2xl font-bold border-2 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all">
                    Continue with Free
                </button>
            </div>

            {/* PRO PLAN */}
            <div className="bg-slate-900 p-8 rounded-[32px] border border-indigo-500 shadow-2xl shadow-indigo-200 flex flex-col relative overflow-hidden transform md:-translate-y-4">
                <div className="absolute top-0 right-0 bg-gradient-to-l from-indigo-500 to-violet-500 text-white text-[10px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-widest">
                    Most Popular
                </div>
                
                <div className="mb-8 relative z-10">
                    <h3 className="text-xl font-bold text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Zap size={20} fill="currentColor" /> Pro Ultimate
                    </h3>
                    <div className="flex items-baseline gap-1 text-white">
                        <span className="text-6xl font-black tracking-tight">
                            {billingCycle === 'monthly' ? '$5' : '$48'}
                        </span>
                        <span className="text-indigo-200 font-medium">
                            / {billingCycle === 'monthly' ? 'month' : 'year'}
                        </span>
                    </div>
                    <p className="text-indigo-200 mt-4 text-sm font-medium">For serious learners who want to achieve Band 7.5+ rapidly.</p>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1 relative z-10">
                    {features.map((f, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm font-medium text-indigo-50">
                            <div className="bg-indigo-500/20 p-1 rounded-full">
                                <Check size={14} className="text-indigo-300 shrink-0" />
                            </div>
                            <span>
                                {typeof f.pro === 'string' ? f.pro : f.name}
                            </span>
                        </li>
                    ))}
                </ul>

                <button 
                    onClick={() => alert("Redirecting to Stripe Checkout...")}
                    className="w-full py-4 rounded-2xl font-black bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:-translate-y-1 relative z-10"
                >
                    Upgrade Now
                </button>

                {/* Decorative Elements */}
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-20 -left-20 w-40 h-40 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
            </div>

        </div>

        {/* Trust Badges */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center gap-3">
                <div className="bg-emerald-100 p-4 rounded-2xl text-emerald-600 mb-2"><Shield size={24}/></div>
                <h4 className="font-bold text-slate-800">Secure Payment</h4>
                <p className="text-sm text-slate-500">Encrypted via Stripe SSL.</p>
            </div>
            <div className="flex flex-col items-center gap-3">
                <div className="bg-amber-100 p-4 rounded-2xl text-amber-600 mb-2"><Zap size={24}/></div>
                <h4 className="font-bold text-slate-800">Instant Access</h4>
                <p className="text-sm text-slate-500">Features unlock immediately.</p>
            </div>
            <div className="flex flex-col items-center gap-3">
                <div className="bg-blue-100 p-4 rounded-2xl text-blue-600 mb-2"><Star size={24}/></div>
                <h4 className="font-bold text-slate-800">Satisfaction Guarantee</h4>
                <p className="text-sm text-slate-500">Cancel anytime, no questions asked.</p>
            </div>
        </div>

      </div>
    </div>
  );
}