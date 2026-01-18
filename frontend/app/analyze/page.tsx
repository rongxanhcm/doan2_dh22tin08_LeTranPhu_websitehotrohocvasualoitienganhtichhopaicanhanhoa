"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext"; 
import { translateError } from "@/lib/errorMapping"; // <--- [MỚI] IMPORT HÀM DỊCH LỖI

// --- Types ---
interface ErrorDetail {
  error_type: string;
  severity: "High" | "Medium";
  explanation: string;
  suggestion: string;
}

interface EssayAssessment {
  score: number;
  general_feedback: string;
  core_errors: ErrorDetail[];
  corrected_text: string;
}

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EssayAssessment | null>(null);
  
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();
  
  const { t, lang, setLang } = useLanguage(); 

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  const toggleLanguage = () => {
    setLang(lang === "en" ? "vi" : "en");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const currentUserId = user?.id || null; 

      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
            text: inputText, 
            user_id: currentUserId,
            language: lang 
        }),
      });

      if (!response.ok) throw new Error("Server connection error");

      const data = await response.json();
      setResult(data);
    } catch (error) {
      alert("Error occurred. Please try again!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* --- HEADER --- */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6">
          <div className="flex items-center gap-4">
             <button 
               onClick={toggleLanguage}
               className="flex items-center gap-2 px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-bold transition-colors border border-slate-200"
             >
               {lang === "en" ? "🇺🇸 EN" : "🇻🇳 VN"}
             </button>
             
             <div className="font-bold text-slate-700 hidden sm:block">
               {user ? `👋 ${user.email}` : t.guest_msg} 
             </div>
          </div>

          <div className="flex gap-2">
            {user ? (
              <>
                <button 
                  onClick={() => router.push("/dashboard")}
                  className="text-sm px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 font-bold transition-colors"
                >
                  {t.dashboard_btn}
                </button>
                <button 
                  onClick={handleLogout}
                  className="text-sm text-red-500 hover:text-red-700 font-medium px-2"
                >
                  {t.logout}
                </button>
              </>
            ) : (
              <button 
                onClick={() => router.push("/login")}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                {t.login_msg}
              </button>
            )}
          </div>
        </div>

        {/* --- TITLE --- */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            {t.title}
          </h1>
          <p className="text-slate-500">{t.subtitle}</p>
        </div>

        {/* --- INPUT --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full h-48 p-4 bg-slate-50 rounded-xl border-0 focus:ring-2 focus:ring-indigo-500 resize-none text-lg text-slate-700 placeholder:text-slate-400"
            placeholder={t.placeholder}
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !inputText}
            className={`mt-4 w-full py-4 rounded-xl font-bold text-lg transition-all 
              ${loading 
                ? "bg-slate-300 text-slate-500 cursor-not-allowed" 
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200"
              }`}
          >
            {loading ? t.button_analyzing : t.button_analyze}
          </button>
        </div>

        {/* --- RESULT SECTION --- */}
        {result && (
          <div className="space-y-6 animate-fade-in-up">
            
            {/* SCORE & FEEDBACK */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
                <span className="text-slate-400 text-sm font-semibold uppercase">{t.score_label}</span>
                <div className="text-6xl font-black text-indigo-600 my-2">{result.score}</div>
                <div className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                  Estimated
                </div>
              </div>
              <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg mb-2 text-slate-800">{t.feedback_label}</h3>
                {/* general_feedback đã được Backend trả về đúng ngôn ngữ */}
                <p className="text-slate-600 leading-relaxed">{result.general_feedback}</p>
              </div>
            </div>

            {/* CORE ERRORS - ĐÃ SỬA PHẦN DỊCH */}
            <div className="space-y-4">
              <h3 className="font-bold text-xl text-slate-900">{t.errors_label}</h3>
              {result.core_errors.map((err, index) => (
                <div key={index} className="bg-white p-5 rounded-xl border-l-4 border-l-red-500 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    {/* [MỚI] Dùng hàm translateError */}
                    <h4 className="font-bold text-red-600 text-lg">
                        {translateError(err.error_type, lang)}
                    </h4>
                    
                    {/* [MỚI] Dịch badge mức độ */}
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase 
                      ${err.severity === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {t.priority}: {err.severity === 'High' ? t.high : t.medium}
                    </span>
                  </div>
                  
                  {/* explanation đã được Backend trả về đúng ngôn ngữ */}
                  <p className="text-slate-600 mb-2">
                    <span className="font-semibold text-slate-900">{t.why}:</span> {err.explanation}
                  </p>
                  
                  {/* suggestion đã được Backend trả về đúng ngôn ngữ */}
                  <div className="bg-green-50 p-3 rounded-lg text-sm text-green-800">
                    <span className="font-bold">{t.fix}: </span> {err.suggestion}
                  </div>
                </div>
              ))}
            </div>

            {/* CORRECTED VERSION */}
            <div className="bg-slate-900 text-slate-200 p-8 rounded-2xl shadow-xl">
              <h3 className="text-emerald-400 font-bold text-lg mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {t.fix_label}
              </h3>
              <p className="leading-loose text-lg font-light opacity-90 whitespace-pre-wrap">
                {result.corrected_text}
              </p>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}