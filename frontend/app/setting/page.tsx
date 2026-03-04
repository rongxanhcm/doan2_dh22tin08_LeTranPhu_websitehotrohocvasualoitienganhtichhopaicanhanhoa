"use client";

import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { User, CreditCard, Shield, Mail, Zap, Check, ArrowLeft, Loader2, ExternalLink, AlertTriangle, Settings, Globe } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import PricingModal from "@/components/PricingModal";

const SUPPORTED_LANGUAGES = [
    { code: "English", label: "English", flag: "🇺🇸" },
    { code: "Vietnamese", label: "Tiếng Việt", flag: "🇻🇳" },
    { code: "Spanish", label: "Español", flag: "🇪🇸" },
    { code: "French", label: "Français", flag: "🇫🇷" },
    { code: "Japanese", label: "日本語", flag: "🇯🇵" },
    { code: "Korean", label: "한국어", flag: "🇰🇷" },
    { code: "German", label: "Deutsch", flag: "🇩🇪" },
    { code: "Italian", label: "Italiano", flag: "🇮🇹" },
    { code: "Portuguese", label: "Português", flag: "🇵🇹" },
    { code: "Russian", label: "Русский", flag: "🇷🇺" },
    { code: "Chinese", label: "中文", flag: "🇨🇳" },
    { code: "Arabic", label: "العربية", flag: "🇸🇦" },
    { code: "Hindi", label: "हिन्दी", flag: "🇮🇳" },
    { code: "Thai", label: "ไทย", flag: "🇹🇭" },
    { code: "Turkish", label: "Türkçe", flag: "🇹🇷" },
    { code: "Dutch", label: "Nederlands", flag: "🇳🇱" },
    { code: "Polish", label: "Polski", flag: "🇵🇱" },
    { code: "Swedish", label: "Svenska", flag: "🇸🇪" },
];

function SettingsContent() {
  const [activeTab, setActiveTab] = useState("general");
  const [user, setUser] = useState<any>(null);
  const [isPro, setIsPro] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [defaultLanguage, setDefaultLanguage] = useState("English");
  const [savingLanguage, setSavingLanguage] = useState(false);
    const [isPricingOpen, setIsPricingOpen] = useState(false);
  
  const supabase = createClient();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);

        const storedLanguage = typeof window !== "undefined" ? localStorage.getItem("default_language") : null;
        if (storedLanguage) setDefaultLanguage(storedLanguage);

    const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if(user) {
            setUser(user);
            const { data } = await supabase.from('user_usage').select('is_pro, default_language').eq('user_id', user.id).single();
            if(data) {
                setIsPro(data.is_pro);
                setDefaultLanguage(data.default_language || "English");
            }
        }
    };
    getUser();
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
      setActiveTab(tab);
      router.push(`/setting?tab=${tab}`, { scroll: false });
  };

    const persistLanguagePreference = (value: string) => {
        if (typeof window === "undefined") return;
        try {
                localStorage.setItem("default_language", value);
        } catch (error) {
                // Ignore localStorage failures (private mode, blocked storage, etc.)
        }
    };

  // --- SAVE LANGUAGE PREFERENCE ---
  const handleSaveLanguage = async () => {
    if (!user) return;
        persistLanguagePreference(defaultLanguage);
    setSavingLanguage(true);
    const toastId = toast.loading("Saving preference...");

    try {
        const { error } = await supabase
            .from('user_usage')
            .update({ default_language: defaultLanguage })
            .eq('user_id', user.id);

        if (error) throw error;
        toast.success("Language preference saved!", { id: toastId });
    } catch (error) {
        toast.error("Failed to save preference", { id: toastId });
    } finally {
        setSavingLanguage(false);
    }
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
                onClick={() => handleTabChange("preferences")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "preferences" ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"}`}
            >
                <Settings size={18}/> Preferences
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

            {/* --- TAB: PREFERENCES --- */}
            {activeTab === "preferences" && (
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-1">
                            <Globe className="text-cyan-600" size={20} />
                            <h2 className="text-lg font-bold">Language Preferences</h2>
                        </div>
                        <p className="text-sm text-slate-500 mb-8">Customize your AI feedback language.</p>

                        <div className="space-y-6">
                            {/* Default AI Feedback Language */}
                            <div className="border-b border-slate-100 pb-6">
                                <label className="block text-sm font-bold text-slate-900 mb-2">
                                    Default AI Feedback Language
                                </label>
                                <p className="text-xs text-slate-500 mb-4">
                                    Choose the language for AI analysis feedback. This will be your default selection on the Analyze page.
                                </p>
                                <div className="flex items-center gap-4">
                                    <select 
                                        value={defaultLanguage}
                                        onChange={(e) => setDefaultLanguage(e.target.value)}
                                        className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                    >
                                        {SUPPORTED_LANGUAGES.map(lang => (
                                            <option key={lang.code} value={lang.code}>
                                                {lang.flag} {lang.label}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleSaveLanguage}
                                        disabled={savingLanguage}
                                        className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 hover:-translate-y-0.5 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {savingLanguage ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Check size={16} />
                                                Save
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="mt-4 p-4 bg-cyan-50 border border-cyan-100 rounded-xl">
                                    <p className="text-xs text-cyan-800 font-medium flex items-start gap-2">
                                        <Zap size={14} className="mt-0.5 flex-shrink-0" />
                                        <span>This setting will automatically pre-select your preferred language when you visit the Analyze page, saving you time on every analysis.</span>
                                    </p>
                                </div>
                            </div>

                            {/* Future: Interface Language (placeholder) */}
                            <div className="opacity-50">
                                <label className="block text-sm font-bold text-slate-900 mb-2">
                                    Interface Language
                                    <span className="ml-2 px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] rounded-full uppercase tracking-wider">Coming Soon</span>
                                </label>
                                <p className="text-xs text-slate-500 mb-4">
                                    Change the language of the entire application interface.
                                </p>
                                <select disabled className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium bg-slate-50 cursor-not-allowed">
                                    <option>English (US)</option>
                                </select>
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
                                        {isPro ? "Wrytt Pro" : "Free Starter"}
                                        {isPro && <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 text-[10px] rounded-full uppercase tracking-wider">Active</span>}
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-2 font-medium">
                                        {isPro 
                                            ? "Access to all Pro features." 
                                            : "Upgrade to unlock Elite rewrites."}
                                    </p>
                                </div>
                                {!isPro ? (
                                    <button
                                        onClick={() => setIsPricingOpen(true)}
                                        className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg shadow-lg shadow-cyan-500/30 text-sm hover:-translate-y-0.5 transition-transform"
                                    >
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
                                    <div className="flex items-center gap-2"><Check size={16} className="text-emerald-500"/> Daily Essay Analysis (50 essays)</div>
                                    <div className="flex items-center gap-2"><Check size={16} className="text-emerald-500"/> Daily Practice Quizzes (Unlimited)</div>
                                    <div className="flex items-center gap-2"><Check size={16} className="text-emerald-500"/> Elite Rewrite</div>
                                    <div className="flex items-center gap-2"><Check size={16} className="text-emerald-500"/> PDF Progress Reports</div>
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

        <PricingModal
            isOpen={isPricingOpen}
            onClose={() => setIsPricingOpen(false)}
            onSuccess={() => setIsPro(true)}
        />
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