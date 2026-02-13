"use client";

import { useState, useEffect, Suspense } from "react"; // 1. Import Suspense
import { createClient } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { User, CreditCard, Shield, Mail, Zap, Check, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

// 2. Tách logic chính ra một Component con
function SettingsContent() {
  const [activeTab, setActiveTab] = useState("general");
  const [user, setUser] = useState<any>(null);
  const [isPro, setIsPro] = useState(false);
  const supabase = createClient();
  const searchParams = useSearchParams(); // Hook này gây lỗi nếu ko có Suspense
  const router = useRouter();

  useEffect(() => {
    // Check tab từ URL (ví dụ: /settings?tab=billing)
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);

    const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if(user) {
            setUser(user);
            // Mock check pro (hoặc fetch từ bảng user_usage thật của bạn)
            const { data } = await supabase.from('user_usage').select('is_pro').eq('user_id', user.id).single();
            if(data) setIsPro(data.is_pro);
        }
    };
    getUser();
  }, [searchParams]);

  // Hàm update URL khi click tab
  const handleTabChange = (tab: string) => {
      setActiveTab(tab);
      router.push(`/setting?tab=${tab}`, { scroll: false });
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
            
            {/* --- TAB: GENERAL --- */}
            {activeTab === "general" && (
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold mb-1">Profile Information</h2>
                        <p className="text-sm text-slate-500 mb-6">Manage your account details.</p>
                        
                        <div className="flex items-center gap-6 pb-8 border-b border-slate-100">
                            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                                {user?.email?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <button className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                                    Change Avatar
                                </button>
                                <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-wider">JPG, PNG max 2MB</p>
                            </div>
                        </div>

                        <div className="grid gap-6 mt-6 max-w-md">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address</label>
                                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700">
                                    <Mail size={16} className="text-slate-400"/>
                                    {user?.email}
                                    <span className="ml-auto text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold uppercase">Verified</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label>
                                <input type="text" placeholder="Your Name" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none" />
                            </div>
                        </div>
                        
                        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                            <button className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-cyan-600 transition-colors">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TAB: BILLING --- */}
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
                                            ? "Next billing date: March 15, 2026" 
                                            : "Upgrade to unlock Band 9.0 rewrites."}
                                    </p>
                                </div>
                                {!isPro && (
                                    <button className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg shadow-lg shadow-cyan-500/30 text-sm hover:-translate-y-0.5 transition-transform">
                                        Upgrade Now
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-slate-900">Features included:</h4>
                                <div className="grid sm:grid-cols-2 gap-3 text-sm text-slate-600 font-medium">
                                    <div className="flex items-center gap-2"><Check size={16} className="text-emerald-500"/> Vertex AI Analysis Engine</div>
                                    <div className="flex items-center gap-2"><Check size={16} className="text-emerald-500"/> Google Cloud Secure Storage</div>
                                    <div className="flex items-center gap-2"><Check size={16} className="text-emerald-500"/> Band 9.0 Vocabulary Rewrite</div>
                                    <div className="flex items-center gap-2"><Check size={16} className="text-emerald-500"/> 24/7 Priority Support</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-slate-900 text-sm">Payment Method</h3>
                            <p className="text-xs text-slate-500 mt-1">Visa ending in 4242</p>
                        </div>
                        <button className="text-sm font-bold text-slate-600 hover:text-cyan-600 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                            Update
                        </button>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}

// 3. Component chính chỉ đóng vai trò Layout và bọc Suspense
export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header để ở ngoài Suspense để nó hiển thị ngay lập tức */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                <ArrowLeft size={20}/>
            </Link>
            <h1 className="font-bold text-lg">Account Settings</h1>
        </div>
      </div>

      {/* Bọc phần logic dùng searchParams bằng Suspense */}
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