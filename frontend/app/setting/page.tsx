"use client";

import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { User, CreditCard, Shield, Mail, Zap, Check, ArrowLeft, Loader2, ExternalLink, AlertTriangle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast"; // Nhớ cài: npm i react-hot-toast

function SettingsContent() {
  const [activeTab, setActiveTab] = useState("general");
  const [user, setUser] = useState<any>(null);
  const [isPro, setIsPro] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false); // State loading cho nút Cancel
  
  const supabase = createClient();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);

    const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if(user) {
            setUser(user);
            const { data } = await supabase.from('user_usage').select('is_pro').eq('user_id', user.id).single();
            if(data) setIsPro(data.is_pro);
        }
    };
    getUser();
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
      setActiveTab(tab);
      router.push(`/setting?tab=${tab}`, { scroll: false });
  };

  // --- HÀM XỬ LÝ CHUYỂN HƯỚNG SANG PORTAL ---
  const handleManageSubscription = async () => {
    if (!user?.email) return;
    setLoadingPortal(true);
    const toastId = toast.loading("Accessing billing portal...");

    try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${API_URL}/generate-portal-link`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_email: user.email })
        });

        if (!res.ok) throw new Error("Could not find subscription");

        const data = await res.json();
        
        toast.success("Redirecting...", { id: toastId });
        // Chuyển hướng sang trang của Lemon Squeezy
        window.location.href = data.url; 

    } catch (error) {
        toast.error("No active subscription found.", { id: toastId });
        setLoadingPortal(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* SIDEBAR TABS */}
        <div className="md:col-span-3 space-y-1">
            <button 
                onClick={() => handleTabChange("general")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "general" ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"}`}
            >
                <User size={18}/> General
            </button>
            <button 
                onClick={() => handleTabChange("billing")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "billing" ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"}`}
            >
                <CreditCard size={18}/> Billing & Plans
            </button>
        </div>

        {/* CONTENT AREA */}
        <div className="md:col-span-9 space-y-8">
            
            {/* --- TAB: GENERAL (Giữ nguyên code cũ) --- */}
            {activeTab === "general" && (
                <div className="space-y-6">
                    {/* ... (Code General giữ nguyên như cũ) ... */}
                     <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold mb-1">Profile Information</h2>
                        <div className="flex items-center gap-6 pb-8 border-b border-slate-100 mt-4">
                            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                                {user?.email?.charAt(0).toUpperCase()}
                            </div>
                             <div>
                                <p className="font-bold text-slate-900">{user?.email}</p>
                                <p className="text-xs text-slate-500">ID: {user?.id?.slice(0, 8)}...</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TAB: BILLING (Code Mới) --- */}
            {activeTab === "billing" && (
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5">
                            <Zap size={120} />
                        </div>

                        <div className="relative z-10">
                            <h2 className="text-lg font-bold mb-1">Current Plan</h2>
                            <p className="text-sm text-slate-500 mb-8">Manage your subscription and limits.</p>

                            <div className="flex items-start justify-between bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Your Plan</p>
                                    <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                                        {isPro ? "Eloqua Pro" : "Free Starter"}
                                        {isPro && <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 text-[10px] rounded-full uppercase tracking-wider">Active</span>}
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-2 font-medium">
                                        {isPro 
                                            ? "Access to all Pro features." 
                                            : "Upgrade to unlock Band 9.0 rewrites."}
                                    </p>
                                </div>
                                {!isPro ? (
                                    <button className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg shadow-lg shadow-cyan-500/30 text-sm hover:-translate-y-0.5 transition-transform">
                                        Upgrade Now
                                    </button>
                                ) : (
                                    // --- NÚT MANAGE SUBSCRIPTION (MỚI) ---
                                    <button 
                                        onClick={handleManageSubscription}
                                        disabled={loadingPortal}
                                        className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg text-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
                                    >
                                        {loadingPortal ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <CreditCard size={16} />
                                        )}
                                        Manage Billing
                                    </button>
                                )}
                            </div>

                            {/* Feature list giữ nguyên */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-slate-900">Features included:</h4>
                                <div className="grid sm:grid-cols-2 gap-3 text-sm text-slate-600 font-medium">
                                    <div className="flex items-center gap-2"><Check size={16} className="text-emerald-500"/> Unlimited Analysis</div>
                                    <div className="flex items-center gap-2"><Check size={16} className="text-emerald-500"/> Band 9.0 Rewrite</div>
                                    <div className="flex items-center gap-2"><Check size={16} className="text-emerald-500"/> Advanced Vocabulary</div>
                                    <div className="flex items-center gap-2"><Check size={16} className="text-emerald-500"/> Priority Support</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- DANGER ZONE (CHỈ HIỆN KHI LÀ PRO) --- */}
                    {isPro && (
                        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 shadow-sm flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-red-900 text-sm flex items-center gap-2">
                                    <AlertTriangle size={16}/> Cancel Subscription
                                </h3>
                                <p className="text-xs text-red-600/80 mt-1">
                                    You can cancel your subscription anytime. Your access will remain until the end of the billing period.
                                </p>
                            </div>
                            <button 
                                onClick={handleManageSubscription}
                                className="text-sm font-bold text-red-600 hover:text-red-800 underline decoration-red-300 underline-offset-4 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
                            >
                                Cancel Plan
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                <ArrowLeft size={20}/>
            </Link>
            <h1 className="font-bold text-lg">Account Settings</h1>
        </div>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      }>
        <SettingsContent />
      </Suspense>
    </div>
  );
}