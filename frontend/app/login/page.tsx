"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabaseClient"; // Import file vừa tạo ở Bước 2
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // Chế độ Đăng ký hay Đăng nhập
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async () => {
    setLoading(true);
    try {
      if (isSignUp) {
        // Xử lý Đăng ký
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        router.push("/login"); // Đăng nhập xong đẩy về trang chủ
        toast.success("Đăng ký thành công!");      } else {
        // Xử lý Đăng nhập
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/"); // Đăng nhập xong đẩy về trang chủ
        toast.success("Đăng nhập thành công!");      
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">
            CoreFix <span className="text-indigo-600">ID</span>
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            {isSignUp ? "Create your learning profile" : "Welcome back, Learner!"}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            onClick={handleAuth}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-indigo-200"
          >
            {loading ? "Processing..." : isSignUp ? "Sign Up Free" : "Sign In"}
          </button>

          <div className="text-center mt-4">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-slate-500 hover:text-indigo-600 underline underline-offset-4"
            >
              {isSignUp ? "Already have an account? Sign In" : "New here? Create Account"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}