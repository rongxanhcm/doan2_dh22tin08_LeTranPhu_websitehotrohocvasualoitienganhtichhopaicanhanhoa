"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image"; // [QUAN TRỌNG] Import Image của Next.js
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { 
  ArrowRight, Zap, Globe, Shield, User, LogOut, 
  LayoutDashboard, TrendingUp, CheckCircle, FileText 
} from "lucide-react";

export default function LandingPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();
  const router = useRouter();

  // Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* --- NAVBAR --- */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-50">
        <div className="flex items-center gap-2 font-black text-2xl text-indigo-600 tracking-tighter cursor-pointer" onClick={() => router.push("/")}>
          <Zap fill="currentColor" /> CoreFix
        </div>

        {!loading && (
          <div className="flex items-center gap-4">
            {user ? (
              // ĐÃ ĐĂNG NHẬP
              <>
                <div className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                   <User size={16} className="text-indigo-500"/>
                   <span className="truncate max-w-[150px]">{user.email}</span>
                </div>

                <Link 
                  href="/dashboard" 
                  className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
                >
                  <LayoutDashboard size={18}/> <span className="hidden sm:inline">Dashboard</span>
                </Link>

                <button 
                  onClick={handleLogout}
                  className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                  title="Logout"
                >
                  <LogOut size={20}/>
                </button>
              </>
            ) : (
              // CHƯA ĐĂNG NHẬP
              <>
                <Link href="/login" className="hidden md:block px-5 py-2.5 font-bold text-slate-600 hover:text-indigo-600 transition-colors">
                  Log in
                </Link>
                <Link href="/analyze" className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                  Try it Free
                </Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="max-w-5xl mx-auto px-6 py-20 md:py-28 text-center animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6 border border-indigo-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          AI-Powered IELTS Writing Assistant
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-8 leading-tight tracking-tight">
          Master Writing with <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-500">
            Instant AI Feedback
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Stop making the same grammatical mistakes. CoreFix analyzes your essays, detects root causes, and generates personalized quizzes to help you improve instantly.
        </p>

        {/* NÚT BẤM DYNAMIC */}
        <div className="flex flex-col md:flex-row justify-center gap-4">
           {user ? (
             <>
                <Link href="/analyze" className="px-8 py-4 bg-slate-900 text-white text-lg font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl hover:-translate-y-1">
                    Write New Essay <Zap size={20} fill="currentColor" className="text-yellow-400"/>
                </Link>
                <Link href="/dashboard" className="px-8 py-4 bg-white text-slate-700 text-lg font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                    Track Progress <TrendingUp size={20}/>
                </Link>
             </>
           ) : (
             <>
                <Link href="/analyze" className="px-8 py-4 bg-slate-900 text-white text-lg font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl hover:-translate-y-1">
                    Start Analyzing Free <ArrowRight size={20}/>
                </Link>
                <Link href="/login" className="px-8 py-4 bg-white text-slate-700 text-lg font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all">
                    See How It Works
                </Link>
             </>
           )}
        </div>

        {/* --- DEMO IMAGE (THAY THẾ PLACEHOLDER) --- */}
        <div className="mt-16 p-2 bg-slate-200 rounded-3xl shadow-2xl overflow-hidden max-w-5xl mx-auto transform hover:scale-[1.01] transition-transform duration-500">
           <div className="bg-white rounded-2xl overflow-hidden border border-slate-300 relative aspect-video">
             {/* [BẠN CẦN CÓ FILE dashboard-demo.png TRONG FOLDER PUBLIC] */}
             <Image 
                src="/dashboard-demo.png" 
                alt="CoreFix Dashboard Preview"
                fill
                className="object-cover object-top"
                priority
             />
             {/* Fallback nếu chưa có ảnh (Xóa đoạn này khi đã có ảnh) */}
             {/* <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-bold bg-slate-50">
                [ Please add dashboard-demo.png to public folder ]
             </div> */}
           </div>
        </div>
      </header>

      {/* --- HOW IT WORKS (NEW SECTION) --- */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-12">How to master IELTS Writing?</h2>
            
            <div className="grid md:grid-cols-3 gap-8 relative">
                {/* Đường nối */}
                <div className="hidden md:block absolute top-8 left-[20%] right-[20%] h-0.5 bg-slate-100 -z-10"></div>

                {/* Step 1 */}
                <div className="bg-white p-6 relative group">
                    <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg shadow-indigo-200 group-hover:-translate-y-2 transition-transform">
                        <FileText />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">1. Write & Submit</h3>
                    <p className="text-slate-500 leading-relaxed">Paste your essay. Our AI analyzes grammar, vocabulary, and coherence instantly.</p>
                </div>

                {/* Step 2 */}
                <div className="bg-white p-6 relative group">
                    <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg shadow-indigo-200 group-hover:-translate-y-2 transition-transform">
                        <Zap fill="currentColor" className="text-yellow-400"/>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">2. Understand Mistakes</h3>
                    <p className="text-slate-500 leading-relaxed">Don't just see the errors. Understand the "Why" with detailed Vietnamese explanations.</p>
                </div>

                {/* Step 3 */}
                <div className="bg-white p-6 relative group">
                    <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg shadow-emerald-200 group-hover:-translate-y-2 transition-transform">
                        <CheckCircle />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">3. Practice to Fix</h3>
                    <p className="text-slate-500 leading-relaxed">Take personalized quizzes generated from your own mistakes to prevent them forever.</p>
                </div>
            </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="bg-slate-50 py-20 border-t border-slate-200">
         <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="text-yellow-500"/>}
              title="Instant Analysis"
              desc="Get detailed feedback on Grammar, Vocabulary, and Coherence in seconds."
            />
            <FeatureCard 
              icon={<Shield className="text-indigo-500"/>}
              title="Personalized Quizzes"
              desc="AI generates quizzes based on YOUR specific mistakes. Fix it to learn it."
            />
            <FeatureCard 
              icon={<Globe className="text-emerald-500"/>}
              title="Bilingual Support"
              desc="Understand complex grammatical concepts with explanations in Vietnamese."
            />
         </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white py-12 text-center text-slate-400 text-sm border-t border-slate-200">
        <div className="flex items-center justify-center gap-2 mb-4 font-bold text-slate-300">
             <Zap size={16} fill="currentColor"/> CoreFix
        </div>
        <p>© 2024 CoreFix. Built for IELTS Learners.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="text-left space-y-4 p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
        {icon}
      </div>
      <h3 className="font-bold text-xl text-slate-900">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{desc}</p>
    </div>
  )
}