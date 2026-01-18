"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle, Zap, Globe, Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2 font-black text-2xl text-indigo-600 tracking-tighter">
          <Zap fill="currentColor" /> CoreFix
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="hidden md:block px-5 py-2.5 font-bold text-slate-600 hover:text-indigo-600 transition-colors">
            Log in
          </Link>
          {/* Nút này dẫn vào trang Essay cũ của bạn */}
          <Link href="/analyze" className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
            Start Writing
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-5xl mx-auto px-6 py-20 md:py-32 text-center animate-fade-in-up">
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

        <div className="flex flex-col md:flex-row justify-center gap-4">
           {/* Dẫn vào trang Analyze */}
           <Link href="/analyze" className="px-8 py-4 bg-slate-900 text-white text-lg font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl hover:-translate-y-1">
             Try it Free <ArrowRight size={20}/>
           </Link>
           {/* Dẫn vào Dashboard demo (nếu chưa login thì sẽ bị đẩy về login - đúng quy trình) */}
           <Link href="/dashboard" className="px-8 py-4 bg-white text-slate-700 text-lg font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all">
             View Dashboard
           </Link>
        </div>

        {/* Demo Image Mockup - Bạn có thể thay bằng ảnh chụp màn hình thật sau này */}
        <div className="mt-16 p-2 bg-slate-200 rounded-3xl shadow-2xl overflow-hidden max-w-4xl mx-auto transform hover:scale-[1.01] transition-transform duration-500">
           <div className="bg-white rounded-2xl overflow-hidden border border-slate-300 h-64 md:h-[400px] flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
             <div className="text-center">
                <p className="text-slate-400 font-bold tracking-widest text-sm mb-2">PREVIEW</p>
                <h3 className="text-slate-900 font-extrabold text-2xl">Your Analytics Dashboard</h3>
             </div>
           </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="bg-white py-20 border-t border-slate-100">
         <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-12">
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

      {/* Footer */}
      <footer className="bg-slate-50 py-12 text-center text-slate-400 text-sm border-t border-slate-200">
        <p>© 2024 CoreFix. Built for IELTS Learners.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="text-left space-y-4 p-6 rounded-2xl hover:bg-slate-50 transition-colors">
      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm">
        {icon}
      </div>
      <h3 className="font-bold text-xl text-slate-900">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{desc}</p>
    </div>
  )
}