"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext"; 
import { translateError } from "@/lib/errorMapping";
import { Zap, Shuffle, Lightbulb } from "lucide-react"; 

// --- 1. SHORT TOPIC POOL (KHO ĐỀ NGẮN GỌN - DỄ VIẾT) ---
const SHORT_TOPICS = [
  "Should students be required to wear uniforms?",
  "Is technology making us lazy?",
  "Money cannot buy happiness. Do you agree?",
  "City life vs Countryside life: Which is better?",
  "Should public transport be free for everyone?",
  "Is online learning better than traditional classrooms?",
  "Should children be allowed to own smartphones?",
  "Working from home vs Working at the office.",
  "Should the government ban junk food?",
  "Is tourism good or bad for a country?",
  "Should zoos be banned?",
  "Health is more important than wealth.",
  "Do we rely too much on the internet?",
  "Should university education be free?",
  "Is it better to travel alone or with friends?",
  "Should celebrities be role models for young people?",
  "The benefits of reading books daily.",
  "Should video games be considered a sport?",
  "Environmental protection is everyone's responsibility.",
  "Is social media bringing us closer or driving us apart?",
  "Should homework be reduced for students?",
  "Is fast food harmful to our health?",
  "Should students have part-time jobs?",
  "Is success defined by money?",
  "Should exams be replaced by projects?",
  "Is living abroad better than living in your home country?",
  "Should plastic bags be banned?",
  "Is watching TV a waste of time?",
  "Should animals be used for scientific research?",
  "Is failure necessary for success?",
  "Should school start later in the morning?",
  "Is online shopping better than shopping in stores?",
  "Should smoking be banned in public places?",
  "Is physical exercise essential for everyone?",
  "Should students learn financial management at school?",
  "Is technology replacing human interaction?",
  "Should parents control children's screen time?",
  "Is studying alone more effective than studying in groups?",
  "Should public exams be made easier?",
  "Is competition good or bad for students?",
  "Should people care more about mental health?",
  "Is it better to save money or spend money?",
  "Should students wear casual clothes at school?",
  "Is climate change the biggest threat to humanity?",
  "Should art and music be compulsory subjects in school?",
  "Is learning English necessary for everyone?",
  "Should people limit their use of social media?",
  "Is living in a big family better than living alone?",
  "Should people work for passion or salary?",
  "Is technology improving education?"

];

// --- Types ---
interface ErrorDetail {
  error_type: string;
  severity: "High" | "Medium";
  explanation: string;
  suggestion: string;
  quote: string;
}

interface EssayAssessment {
  score: number;
  general_feedback: string;
  core_errors: ErrorDetail[];
  corrected_text: string;
}

export default function AnalyzePage() {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EssayAssessment | null>(null);
  const [currentTopic, setCurrentTopic] = useState(""); 
  
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();
  
  const { t, lang, setLang } = useLanguage(); 

  const MIN_WORDS = 20;
  const wordCount = inputText.trim().split(/\s+/).filter(w => w.length > 0).length;

  // --- 2. EFFECT: LOAD USER & RANDOM TOPIC ---
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
    randomizeTopic(); 
  }, []);

  // --- 3. HÀM RANDOM TOPIC ---
  const randomizeTopic = () => {
    const randomIndex = Math.floor(Math.random() * SHORT_TOPICS.length);
    setCurrentTopic(SHORT_TOPICS[randomIndex]);
  };

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

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
            alert(`⚠️ ${errorData.detail}`); 
            setLoading(false);
            return;
        }
        if (response.status === 400) {
            alert(`⚠️ ${errorData.detail}`);
            setLoading(false);
            return;
        }
        throw new Error("Server connection error");
      }

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

        {/* --- TOPIC SUGGESTION CARD (Gọn gàng hơn) --- */}
        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl relative group hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2 text-indigo-700 font-bold uppercase tracking-wider text-xs">
                    <Lightbulb size={16} /> Idea for you
                </div>
                <button 
                    onClick={randomizeTopic}
                    className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 text-xs font-bold bg-white px-3 py-1.5 rounded-full shadow-sm hover:shadow transition-all"
                    title="Get another topic"
                >
                    <Shuffle size={14} /> Change Topic
                </button>
            </div>
            <p className="text-xl font-bold text-slate-800 leading-snug font-serif">
                "{currentTopic}"
            </p>
        </div>

        {/* --- INPUT AREA --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full h-64 p-4 bg-slate-50 rounded-xl border-0 focus:ring-2 focus:ring-indigo-500 resize-none text-lg text-slate-700 placeholder:text-slate-400 font-serif leading-relaxed"
                placeholder={t.placeholder}
              />
              
              <div className={`absolute bottom-4 right-4 text-xs font-bold px-2 py-1 rounded transition-colors ${
                  wordCount < MIN_WORDS ? "bg-red-100 text-red-500" : "bg-green-100 text-green-600"
              }`}>
                  {wordCount} / {MIN_WORDS} words
              </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || wordCount < MIN_WORDS}
            className={`mt-4 w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2
              ${(loading || wordCount < MIN_WORDS)
                ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:-translate-y-1"
              }`}
          >
            {loading ? (
                t.button_analyzing
            ) : wordCount < MIN_WORDS ? (
                <span>Write {MIN_WORDS - wordCount} more words...</span>
            ) : (
                <>{t.button_analyze} <Zap size={20} fill="currentColor" className="text-yellow-400"/></>
            )}
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
                <p className="text-slate-600 leading-relaxed">{result.general_feedback}</p>
              </div>
            </div>

            {/* CORE ERRORS */}
            <div className="space-y-4">
              <h3 className="font-bold text-xl text-slate-900">{t.errors_label}</h3>
              {result.core_errors.map((err, index) => (
                <div key={index} className="bg-white p-5 rounded-xl border-l-4 border-l-red-500 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-red-600 text-lg">
                        {translateError(err.error_type, lang)}
                    </h4>
                    
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase 
                      ${err.severity === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {t.priority}: {err.severity === 'High' ? t.high : t.medium}
                    </span>
                  </div>
                  
                  <p className="text-slate-600 mb-2">
                    <span className="font-semibold text-slate-900">{t.why}:</span> {err.explanation}
                  </p>
                  
                  <div className="bg-green-50 p-3 rounded-lg text-sm text-green-800">
                    <span className="font-bold">{t.fix}: </span> {err.suggestion}
                  </div>
                </div>
              ))}
            </div>

            {/* CORRECTED VERSION */}
            <div className="bg-slate-900 text-slate-200 p-8 rounded-2xl shadow-xl">
              <h3 className="text-emerald-400 font-bold text-lg mb-4 flex items-center gap-2">
                <Zap size={20} fill="currentColor"/>
                {t.fix_label}
              </h3>
              <p className="leading-loose text-lg font-light opacity-90 whitespace-pre-wrap font-serif">
                {result.corrected_text}
              </p>
            </div>

            <div className="text-center pt-4">
                <button 
                    onClick={() => router.push("/dashboard")}
                    className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                    View Detailed Analysis in Dashboard →
                </button>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}