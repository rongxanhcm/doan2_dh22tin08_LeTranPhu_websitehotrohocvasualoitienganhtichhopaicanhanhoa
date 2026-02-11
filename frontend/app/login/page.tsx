"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Sparkles, CheckCircle2, ShieldCheck, ArrowRight, Github } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async () => {
    if (!email || !password) {
        toast.error("Please fill in all fields");
        return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("Registration successful! Check your email.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        router.push("/");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex bg-white font-sans overflow-hidden">
      {/* --- CỘT TRÁI: VISUAL & BRANDING (Ẩn trên mobile) --- */}
      <div className="hidden lg:flex flex-1 bg-slate-900 relative items-center justify-center p-12 overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#4f46e5_0%,transparent_50%)] opacity-20" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        
        <div className="relative z-10 max-w-lg">
          <div className="mb-8 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest">
            <Sparkles size={14} /> Intelligence for Education
          </div>
          
          <h2 className="text-5xl font-black text-white leading-tight mb-6 italic">
            Master your <span className="text-indigo-500">IELTS</span> <br/> 
            journey with AI.
          </h2>
          
          <div className="space-y-6">
            {[
              "Real-time Band 9.0 Essay Analysis",
              "Advanced Grammar & Vocab Expansion",
              "Progress Tracking & Smart Reports"
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-400 font-medium">
                <CheckCircle2 size={20} className="text-emerald-500" />
                {text}
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
             <p className="text-slate-400 italic text-sm">
               "CoreFix changed the way I practice Writing. I went from 6.0 to 7.5 in just 3 weeks!"
             </p>
             <div className="mt-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white">JD</div>
                <div>
                  <p className="text-white text-sm font-bold">John Doe</p>
                  <p className="text-slate-500 text-xs">IELTS Candidate 2025</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* --- CỘT PHẢI: LOGIN FORM --- */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 lg:p-24 relative bg-slate-50/50">
        <div className="w-full max-w-md">
          {/* Logo Mobile */}
          <div className="flex items-center gap-2 mb-12 lg:mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
               <ShieldCheck size={24} color="white" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">
              CoreFix <span className="text-indigo-600 italic">ID</span>
            </h1>
          </div>

          <div className="mb-10">
            <h3 className="text-3xl font-black text-slate-900 mb-2">
              {isSignUp ? "Create Account" : "Sign In"}
            </h3>
            <p className="text-slate-500 font-medium text-sm">
              {isSignUp ? "Start your 7-day free pro trial today." : "Glad to see you again! Enter your details."}
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm font-medium"
                placeholder="name@company.com"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Password</label>
                {!isSignUp && (
                  <button className="text-[10px] font-bold text-indigo-600 hover:underline">Forgot Password?</button>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm font-medium"
                placeholder="••••••••"
              />
            </div>

            <button
              onClick={handleAuth}
              disabled={loading}
              className="group w-full bg-slate-900 hover:bg-indigo-600 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={20} /> : (isSignUp ? "Create Profile" : "Sign In")}
                {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
              </span>
            </button>

            <div className="relative py-4 flex items-center">
               <div className="flex-grow border-t border-slate-200"></div>
               <span className="flex-shrink mx-4 text-xs font-black text-slate-400 uppercase tracking-widest">Or Continue With</span>
               <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <button className="w-full py-4 border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
                <Github size={20} /> Github Account
            </button>
          </div>

          <p className="text-center mt-10 text-sm text-slate-500 font-medium">
            {isSignUp ? "Already have an account?" : "Don't have an account yet?"}{" "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-indigo-600 font-black hover:underline underline-offset-4 transition-all"
            >
              {isSignUp ? "Log In" : "Register Now"}
            </button>
          </p>
        </div>

        {/* Footer info */}
        <div className="mt-auto pt-10 flex gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span className="hover:text-slate-900 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-900 cursor-pointer">Terms of Service</span>
        </div>
      </div>
    </main>
  );
}