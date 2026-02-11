"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image"; 
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { 
  ArrowRight, Zap, Globe, Shield, User, LogOut, 
  LayoutDashboard, TrendingUp, CheckCircle, FileText,
  Sparkles, MousePointer2, BrainCircuit, BarChart3
} from "lucide-react";

export default function LandingPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();
  const router = useRouter();

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
    <div className="min-h-screen bg-[#fafafa] font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* --- CẤU TRÚC DECOR NỀN --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-50/50 blur-[120px]" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-emerald-50/40 blur-[100px]" />
      </div>

      {/* --- NAVBAR --- */}
      <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div 
            className="flex items-center gap-2 font-black text-2xl text-slate-900 tracking-tighter cursor-pointer group" 
            onClick={() => router.push("/")}
          >
            <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
                <Zap size={20} fill="white" className="text-white" />
            </div>
            <span>CoreFix<span className="text-indigo-600">.</span></span>
          </div>

          {!loading && (
            <div className="flex items-center gap-3">
              {user ? (
                <>
                <div className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">

                   <User size={16} className="text-indigo-500"/>

                   <span className="truncate max-w-[150px]">{user.email}</span>

                </div>                  <Link 
                    href="/dashboard" 
                    className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                  >
                    <LayoutDashboard size={18}/> Dashboard
                  </Link>
                  <Link 
                    href="/analyze" 
                    className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition-all shadow-sm flex items-center gap-2"
                  >
                    <Sparkles size={18}/> Analyze
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="p-2.5 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <LogOut size={20}/>
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="px-5 py-2.5 font-bold text-slate-600 hover:text-slate-900 transition-colors">
                    Log in
                  </Link>
                  <Link href="/analyze" className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95">
                    Start for Free
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 text-xs font-bold uppercase tracking-widest mb-8 animate-fade-in">
          <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
          The Future of IELTS Writing
        </div>
        
        <h1 className="text-6xl md:text-[84px] font-black text-slate-900 mb-8 leading-[0.9] tracking-tight">
          Write like a <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-emerald-500">
            Native Speaker.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
          The first AI assistant that doesn't just fix your grammar, but transforms your thinking with <span className="text-slate-900 font-bold underline decoration-indigo-300">personalized practice</span>.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
            <Link href="/analyze" className="group px-10 py-5 bg-slate-900 text-white text-lg font-bold rounded-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 shadow-2xl shadow-indigo-200 active:scale-95">
                Start Writing Now <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
            </Link>
            <Link href="#how-it-works" className="px-10 py-5 bg-white text-slate-700 text-lg font-bold rounded-2xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-2">
                Watch Demo <MousePointer2 size={20}/>
            </Link>
        </div>

        {/* --- DYNAMIC MOCKUP (Đồng bộ với Essay Page) --- */}
        <div className="relative max-w-5xl mx-auto group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-[32px] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
            <div className="relative bg-white border border-slate-200 p-2 rounded-[30px] shadow-2xl overflow-hidden">
                <div className="bg-slate-50 rounded-[22px] overflow-hidden border border-slate-100">
                   {/* Giả lập giao diện Analyze với text Serif */}
                   <div className="grid md:grid-cols-3 h-[400px] text-left">
                      <div className="md:col-span-2 bg-white p-8 border-r border-slate-100">
                          <div className="flex gap-2 mb-6">
                              <div className="w-3 h-3 rounded-full bg-red-400" />
                              <div className="w-3 h-3 rounded-full bg-yellow-400" />
                              <div className="w-3 h-3 rounded-full bg-green-400" />
                          </div>
                          <div className="font-serif text-xl text-slate-400 leading-relaxed">
                              I think technology <span className="bg-red-100 border-b-2 border-red-500 text-slate-800">is make</span> people lazy. In the past, people...
                          </div>
                          {/* Phác họa hiệu ứng "Wipe" */}
                          <div className="mt-8 pt-8 border-t border-dashed border-slate-100">
                             <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm mb-2">
                                <Sparkles size={16}/> BAND 9.0 REWRITE
                             </div>
                             <div className="font-serif text-xl text-indigo-900/40">
                                It is often argued that technological advancements...
                             </div>
                          </div>
                      </div>
                      <div className="bg-slate-50/50 p-6 space-y-4">
                          <div className="h-20 bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                              <div className="text-[10px] font-bold text-slate-400 uppercase">Score</div>
                              <div className="text-3xl font-black text-indigo-600">6.5</div>
                          </div>
                          <div className="h-32 bg-indigo-600 rounded-2xl shadow-lg p-4 text-white">
                              <div className="text-[10px] font-bold opacity-80 uppercase mb-2">AI Explanation</div>
                              <div className="text-xs leading-relaxed">Lỗi "is make" là do nhầm lẫn giữa Present Continuous và Present Simple...</div>
                          </div>
                      </div>
                   </div>
                </div>
            </div>
        </div>
      </header>

      {/* --- BENTO FEATURES GRID --- */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Everything you need for a 8.0+</h2>
          <p className="text-slate-500 font-medium">Powering thousands of successful IELTS candidates.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Card 1: Main Feature */}
          <div className="md:col-span-8 bg-white border border-slate-200 rounded-[32px] p-10 hover:shadow-xl transition-all group overflow-hidden relative">
            <div className="relative z-10">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200">
                <BrainCircuit className="text-white" size={28}/>
              </div>
              <h3 className="text-2xl font-bold mb-4">Deep Error Diagnostics</h3>
              <p className="text-slate-500 leading-relaxed max-w-sm">
                We don't just fix errors; we identify the <strong>Root Cause</strong> of why you make them, with detailed bilingual explanations.
              </p>
            </div>
            <div className="absolute top-10 -right-10 w-64 h-64 bg-indigo-50 rounded-full blur-3xl group-hover:bg-indigo-100 transition-colors" />
          </div>

          {/* Card 2: Score */}
          <div className="md:col-span-4 bg-indigo-600 rounded-[32px] p-10 text-white hover:shadow-2xl hover:shadow-indigo-200 transition-all">
             <BarChart3 size={40} className="mb-6 opacity-80"/>
             <h3 className="text-2xl font-bold mb-4">Instant Scoring</h3>
             <p className="opacity-80 leading-relaxed font-medium">
                Accurate estimated band scores for Grammar, Vocabulary, and Task Response.
             </p>
          </div>

          {/* Card 3: Quiz */}
          <div className="md:col-span-5 bg-white border border-slate-200 rounded-[32px] p-10 hover:shadow-xl transition-all">
             <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-200">
                <Shield className="text-white" size={28}/>
             </div>
             <h3 className="text-2xl font-bold mb-4">Smart Practice</h3>
             <p className="text-slate-500 leading-relaxed">
                Personalized quizzes generated instantly from your essay's specific mistakes.
             </p>
          </div>

          {/* Card 4: Rewrite */}
          <div className="md:col-span-7 bg-slate-900 rounded-[32px] p-10 text-white relative overflow-hidden group">
             <div className="relative z-10">
               <Sparkles className="text-yellow-400 mb-6" size={40}/>
               <h3 className="text-2xl font-bold mb-4">Band 9.0 Vocabulary Rewrite</h3>
               <p className="opacity-70 leading-relaxed max-w-md">
                  Transform your basic ideas into academic excellence with our C1-C2 level vocabulary polisher.
               </p>
             </div>
             <div className="absolute bottom-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform">
                <Zap size={160} fill="white"/>
             </div>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS (WIPE THEME) --- */}
      <section id="how-it-works" className="py-24 bg-slate-900 text-white relative overflow-hidden">
         <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid md:grid-cols-2 gap-20 items-center">
               <div>
                  <h2 className="text-4xl md:text-5xl font-black mb-12 tracking-tight">The 3-Step <br/> Mastery Loop</h2>
                  <div className="space-y-12">
                     <div className="flex gap-6">
                        <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center font-black text-xl border border-white/20">1</div>
                        <div>
                           <h4 className="text-xl font-bold mb-2">Analyze</h4>
                           <p className="text-slate-400">Upload your essay and get a full breakdown of every single mistake in seconds.</p>
                        </div>
                     </div>
                     <div className="flex gap-6">
                        <div className="flex-shrink-0 w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/50">2</div>
                        <div>
                           <h4 className="text-xl font-bold mb-2 text-indigo-400">Review & Learn</h4>
                           <p className="text-slate-400">Click on errors to see why they happened and how a Band 9.0 speaker would write it.</p>
                        </div>
                     </div>
                     <div className="flex gap-6">
                        <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center font-black text-xl border border-white/20">3</div>
                        <div>
                           <h4 className="text-xl font-bold mb-2">Eliminate Errors</h4>
                           <p className="text-slate-400">Complete AI-powered quizzes to ensure you never make that mistake again.</p>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="relative">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[40px] p-1 shadow-2xl">
                    <div className="bg-slate-900 rounded-[38px] p-8 aspect-square flex flex-col justify-center">
                        <div className="space-y-4 animate-pulse">
                            <div className="h-4 w-3/4 bg-white/10 rounded-full" />
                            <div className="h-4 w-1/2 bg-white/10 rounded-full" />
                            <div className="h-4 w-2/3 bg-indigo-500/20 rounded-full" />
                        </div>
                        <div className="mt-12 text-center">
                             <div className="inline-block p-4 rounded-3xl bg-white text-slate-900 font-bold shadow-xl">
                                Error Fixed! +10 XP
                             </div>
                        </div>
                    </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="py-32 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-5xl font-black text-slate-900 mb-8 tracking-tight">Ready to break the <br/> 6.5 plateau?</h2>
          <Link href="/analyze" className="inline-flex items-center gap-2 px-10 py-5 bg-indigo-600 text-white text-xl font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 active:scale-95">
             Get Started Now - It's Free <Zap size={20} fill="white"/>
          </Link>
          <p className="mt-6 text-slate-400 font-medium">No credit card required. Cancel anytime.</p>
        </div>
      </section>
      {/* --- FOOTER --- */}
      <footer className="bg-white py-20 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
            <div className="col-span-2">
                <div className="flex items-center gap-2 font-black text-2xl text-slate-900 tracking-tighter mb-6">
                    <div className="bg-indigo-600 p-1 rounded-lg">
                        <Zap size={16} fill="white" className="text-white" />
                    </div>
                    <span>CoreFix<span className="text-indigo-600">.</span></span>
                </div>
                <p className="text-slate-500 max-w-xs leading-relaxed">
                    Building the world's most intelligent writing coach for English learners.
                </p>
            </div>
            <div>
                <h4 className="font-bold text-slate-900 mb-6">Product</h4>
                <ul className="space-y-4 text-slate-500 font-medium">
                    <li><Link href="/analyze" className="hover:text-indigo-600 transition-colors">Analyzer</Link></li>
                    <li><Link href="/dashboard" className="hover:text-indigo-600 transition-colors">Dashboard</Link></li>
                    <li><Link href="#" className="hover:text-indigo-600 transition-colors">Quizzes</Link></li>
                </ul>
            </div>
            <div>
                <h4 className="font-bold text-slate-900 mb-6">Legal</h4>
                <ul className="space-y-4 text-slate-500 font-medium">
                    <li><Link href="#" className="hover:text-indigo-600 transition-colors">Privacy</Link></li>
                    <li><Link href="#" className="hover:text-indigo-600 transition-colors">Terms</Link></li>
                </ul>
            </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-slate-50 text-center text-slate-400 font-medium text-sm">
            © 2024 CoreFix AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}