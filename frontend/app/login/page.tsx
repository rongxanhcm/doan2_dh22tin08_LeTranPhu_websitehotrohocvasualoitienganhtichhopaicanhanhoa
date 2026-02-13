"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
// Thay Github bằng Mail hoặc Chrome cho trực quan
import { Loader2, Check, ArrowRight, Cloud, Mail } from "lucide-react"; 

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Logic đăng nhập bằng Google/Email Provider
  const handleThirdPartyLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google', // Hoặc 'azure', 'keycloak' tùy email provider bạn dùng
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message);
    }
  };

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
        toast.success("Check your email for confirmation!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back to Eloqua");
        router.push("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex bg-white font-sans overflow-hidden">
      
      {/* --- CỘT TRÁI: BRANDING --- */}
      <div className="hidden lg:flex flex-1 bg-slate-900 relative items-center justify-center p-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#0891b2_0%,transparent_40%)] opacity-20" />
        <div className="absolute inset-0 pointer-events-none opacity-[0.05]" 
             style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
        </div>
        
        <div className="relative z-10 max-w-md">
          <div className="mb-10 flex items-center gap-3">
            <Image src="/logo.svg" alt="Eloqua" width={40} height={40} className="object-contain" />
            <span className="text-2xl font-bold text-white tracking-tight">Eloqua</span>
          </div>
          
          <h2 className="text-5xl font-bold text-white leading-tight mb-8 tracking-tight">
            Write with <br/>
            <span className="text-cyan-400">precision.</span>
          </h2>
          
          <div className="space-y-5 mb-12">
            {[
              "Proprietary Band 9.0 Analysis",
              "Advanced Contextual Diagnostics",
              "Vertex AI Powered Engine"
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                <div className="p-1 bg-cyan-500/10 rounded-full">
                    <Check size={14} className="text-cyan-400" />
                </div>
                {text}
              </div>
            ))}
          </div>

          <div className="inline-flex items-center gap-3 px-5 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
             <Cloud className="text-cyan-400" size={20} />
             <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Infrastructure</p>
                <p className="text-xs font-semibold text-slate-200">Powered by Google Vertex AI</p>
             </div>
          </div>
        </div>
      </div>

      {/* --- CỘT PHẢI: LOGIN FORM --- */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-24 bg-white relative">
        <div className="w-full max-w-sm">
          
          <div className="lg:hidden flex items-center gap-2 mb-12">
            <Image src="/logo.svg" alt="Eloqua" width={32} height={32} className="object-contain" />
            <span className="font-bold text-xl tracking-tight text-slate-900">Eloqua</span>
          </div>

          <div className="mb-10">
            <h3 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
              {isSignUp ? "Get Started" : "Welcome Back"}
            </h3>
            <p className="text-slate-500 text-sm">
              {isSignUp ? "Create your account to start writing." : "Sign in to access your dashboard."}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Work Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all text-sm font-medium"
                placeholder="you@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Password</label>
                {!isSignUp && (
                  <button className="text-[10px] font-bold text-cyan-600 hover:text-cyan-700">Forgot?</button>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all text-sm font-medium"
                placeholder="••••••••"
              />
            </div>

            <button
              onClick={handleAuth}
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-cyan-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (isSignUp ? "Create Account" : "Sign In")}
              {!loading && <ArrowRight size={16} />}
            </button>

            <div className="relative py-2 flex items-center">
               <div className="flex-grow border-t border-slate-100"></div>
               <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">Quick Access</span>
               <div className="flex-grow border-t border-slate-100"></div>
            </div>

            {/* Nút đăng nhập Google / Third Party Email */}
            <button 
              onClick={handleThirdPartyLogin}
              className="w-full py-3.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-3 text-sm"
            >
                <Mail size={18} className="text-red-500" /> Continue with Google
            </button>
          </div>

          <p className="text-center mt-10 text-sm text-slate-500">
            {isSignUp ? "Have an account?" : "New to Eloqua?"}{" "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-cyan-600 font-bold hover:underline underline-offset-4"
            >
              {isSignUp ? "Sign In" : "Register Now"}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}