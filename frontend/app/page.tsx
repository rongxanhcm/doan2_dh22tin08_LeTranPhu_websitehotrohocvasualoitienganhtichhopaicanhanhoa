  "use client";

  import { useState, useEffect } from "react";
  import Link from "next/link";
  import Image from "next/image"; 
  import { useRouter } from "next/navigation";
  import { createClient } from "@/lib/supabaseClient";
  import { 
    ArrowRight, Check, X, Sparkles, LayoutDashboard, 
    LogOut, Menu, ChevronRight, BarChart3, Zap, 
    BookOpen, Fingerprint,Mail, MapPin, FileText, Cloud, ShieldCheck, Github, Twitter, Linkedin
  } from "lucide-react";
import toast from "react-hot-toast";
import UserDropdown from "@/components/UserDropdown";
  // --- SUB-COMPONENTS (Tách nhỏ để code gọn gàng hơn) ---

  const Badge = ({ children }: { children: React.ReactNode }) => (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-semibold tracking-wide uppercase">
      {children}
    </div>
  );

  const FeatureCard = ({ icon: Icon, title, desc, className = "" }: any) => (
    <div className={`p-8 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 hover:shadow-lg hover:shadow-teal-900/5 transition-all duration-300 group ${className}`}>
      <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-teal-50 transition-colors">
        <Icon className="text-slate-600 group-hover:text-teal-600 transition-colors" size={24} />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
    </div>
  );

  const CHECKOUT_URL_MONTHLY = "https://wrytt.lemonsqueezy.com/checkout/buy/76ea9484-fa92-43c9-ac90-ef9c22e2beab?enabled=1304553";
  const CHECKOUT_URL_YEARLY = "https://wrytt.lemonsqueezy.com/checkout/buy/2b2a245a-5675-47b4-bd64-ccd3aedd8e01?enabled=1304546";

  // --- MAIN COMPONENT ---

  export default function LandingPage() {
    const [user, setUser] = useState<any>(null); // Nên define interface User chuẩn từ Supabase
    const [loading, setLoading] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isPro, setIsPro] = useState(false);
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
    const supabase = createClient();
    const router = useRouter();

   useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Lấy trạng thái Pro
        const { data } = await supabase.from('user_usage').select('is_pro').eq('user_id', user.id).single();
        if (data) setIsPro(data.is_pro);
      }
      setLoading(false);
    };
    checkUser();

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!document.getElementById("lemon-js")) {
      const script = document.createElement("script");
      script.id = "lemon-js";
      script.src = "https://assets.lemonsqueezy.com/lemon.js";
      script.defer = true;
      script.onload = () => {
        const lemon = window as unknown as { createLemonSqueezy?: () => void };
        if (lemon.createLemonSqueezy) lemon.createLemonSqueezy();
      };
      document.body.appendChild(script);
    }
  }, []);

  const handleProCheckout = async () => {
    if (isPro) {
      toast.success("You already have Pro.");
      return;
    }

    if (loading) return;

    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      toast.error("Please login to upgrade.");
      router.push("/login");
      return;
    }

    const baseUrl = billingCycle === "monthly" ? CHECKOUT_URL_MONTHLY : CHECKOUT_URL_YEARLY;
    const separator = baseUrl.includes("?") ? "&" : "?";
    const checkoutUrl = `${baseUrl}${separator}checkout[custom][user_id]=${currentUser.id}&embed=1`;

    const lemon = window as unknown as { createLemonSqueezy?: () => void; LemonSqueezy?: { Url: { Open: (url: string) => void } } };
    if (!lemon.LemonSqueezy && lemon.createLemonSqueezy) lemon.createLemonSqueezy();

    setTimeout(() => {
      if (lemon.LemonSqueezy) {
        lemon.LemonSqueezy.Url.Open(checkoutUrl);
      } else {
        window.location.href = checkoutUrl;
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-cyan-100 selection:text-cyan-900 overflow-x-hidden">
      
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.4]" 
           style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      {/* --- NAVBAR (Updated) --- */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-200 py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
            <div className="relative w-10 h-10">
              <Image src="/logo.svg" alt="Wrytt Logo" fill className="object-contain" priority />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">Wrytt</span>
          </div>

          <div className="flex items-center gap-4">
            {!loading && (
              user ? (
                <div className="flex items-center gap-6">
                  <Link href="/dashboard" className="hidden sm:block text-sm font-bold text-slate-600 hover:text-teal-600 transition-colors">
                      Dashboard
                  </Link>
                  <div className="pl-4 border-l border-slate-200">
                    <UserDropdown user={user} isPro={isPro} />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/login" className="hidden sm:block text-sm font-semibold text-slate-600 hover:text-slate-900">
                    Log in
                  </Link>
                  <Link href="/analyze" className="px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition-colors shadow-lg shadow-slate-900/20 hover:shadow-teal-600/20">
                    Get Started
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION (Updated) --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 max-w-7xl mx-auto px-6 z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          <div className="lg:w-1/2 text-center lg:text-left space-y-8">
            {/* Chào mừng người dùng nếu đã log in */}
            {user ? (
              <Badge>
                <Zap size={12} className="text-teal-600 fill-teal-600"/> 
                Welcome back, {user.email.split('@')[0]}
              </Badge>
            ) : (
              <Badge>
                <Sparkles size={12} className="text-teal-600"/> 
                Learn From Your Mistakes
              </Badge>
            )}
            
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              Learn English<br/>
              <span className="text-teal-600 relative inline-block">
                from Your Mistakes
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-teal-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span>
            </h1>
            
            <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Write your essay → AI finds your errors → Get <span className="font-semibold text-slate-900">personalized practice quizzes</span> generated from YOUR actual mistakes. Not generic exercises—learn what <span className="font-semibold text-slate-900">YOU</span> need to improve.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/analyze" className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-all hover:scale-[1.02] shadow-xl shadow-teal-600/20">
                {user ? "Continue Writing" : "Start Analyzing"} <ArrowRight size={18} />
              </Link>
              {user && (
                <Link href="/dashboard" className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all">
                  View Progress
                </Link>
              )}
            </div>
            
            {/* No Login Required Badge */}
            {!user && (
              <div className="flex items-center justify-center lg:justify-start gap-2 text-sm text-slate-500">
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full">
                  <Check size={14} className="text-emerald-600" />
                  <span className="font-semibold text-emerald-700">No login required to analyze</span>
                </div>
                <span className="text-slate-400">•</span>
                <span className="font-medium">Start instantly</span>
              </div>
            )}
          </div>

          {/* Right Visual: AI Quiz Mockup */}
          <div className="lg:w-1/2 w-full relative">
            <div className="absolute -inset-1 bg-gradient-to-tr from-teal-400 to-teal-600 rounded-2xl blur opacity-20 animate-pulse"></div>
            <div className="relative bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="h-10 border-b border-slate-100 bg-slate-50 flex items-center px-4 gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                      <div className="w-3 h-3 rounded-full bg-green-400/80" />
                    </div>
                    <span className="ml-2 text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                      <Sparkles size={12} className="text-teal-600"/> AI Quiz Generator
                    </span>
                </div>
                
                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Your Error Section */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-red-500 flex items-center gap-2">
                      ❌ Your Error
                    </p>
                    <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                      <p className="font-serif text-sm text-slate-700 leading-relaxed">
                        The graph <span className="bg-red-100 text-red-700 font-semibold px-1 rounded">shows the amount of people</span> who use the internet...
                      </p>
                    </div>
                  </div>

                  {/* AI Generated Quiz */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-teal-600 flex items-center gap-2">
                      <Sparkles size={12}/> Generated Quiz Question
                    </p>
                    <div className="p-4 bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200 rounded-lg space-y-4">
                      <p className="text-sm font-semibold text-slate-900">
                        Which is the correct form?
                      </p>
                      <div className="space-y-2">
                        {[
                          { letter: 'A', text: 'the amount of people', correct: false },
                          { letter: 'B', text: 'the number of people', correct: true },
                          { letter: 'C', text: 'the quantity of people', correct: false },
                          { letter: 'D', text: 'the total of people', correct: false },
                        ].map((option) => (
                          <div 
                            key={option.letter} 
                            className={`p-3 rounded-lg border-2 transition-all text-sm ${
                              option.correct 
                                ? 'bg-green-50 border-green-400' 
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <span className="font-bold text-slate-700">{option.letter}.</span> {option.text}
                            {option.correct && (
                              <span className="ml-2 text-green-600 font-bold">✓</span>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="pt-3 border-t border-teal-200">
                        <p className="text-xs text-slate-600 leading-relaxed">
                          💡 <span className="font-semibold">Tip:</span> Use "number" for countable nouns (people, cars), "amount" for uncountable (water, money).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </section>

        {/* --- FEATURES GRID (Bento Style nhưng Clean hơn) --- */}
        <section className="py-24 bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">AI Quizzes Built From YOUR Writing</h2>
              <p className="text-slate-500">
                Every error you make becomes a personalized quiz question. Practice what YOU struggle with—not random grammar exercises.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard 
                  icon={Zap}
                  title="Instant Writing Score"
                  desc="Get accurate writing quality assessment with detailed breakdown of grammar, vocabulary, and coherence."
              />
              <FeatureCard 
                  icon={BookOpen}
                  title="AI Quizzes From YOUR Mistakes"
                  desc="Submit an essay, AI generates 10-question quizzes targeting YOUR specific errors. Every question is personalized to what YOU wrote wrong. Free: 6 quizzes/day. Pro: unlimited."
                  className="md:col-span-2 bg-gradient-to-br from-white to-teal-50/50 border-teal-100"
              />
              <FeatureCard 
                  icon={BarChart3}
                  title="Mastery Tracking"
                  desc="Track progress through Learning → Practicing → Mastered. Smart focus system locks priority errors."
                  className="md:col-span-2"
              />
              <FeatureCard 
                  icon={Sparkles}
                  title="Elite Rewrites"
                  desc="See how AI transforms your writing with advanced vocabulary and professional phrasing. Pro-only feature."
              />
              <FeatureCard 
                  icon={BarChart3}
                  title="Progress Reports"
                  desc="Download PDF reports tracking your improvement, error patterns, and mastery journey."
              />
              <FeatureCard 
                  icon={Fingerprint}
                  title="Contextual Feedback"
                  desc="Every correction comes with explanation & lesson links so you actually learn, not just fix."
              />
            </div>
          </div>
        </section>

        {/* --- HOW IT WORKS SECTION --- */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">How AI Learning Works</h2>
              <p className="text-slate-500">
                Submit writing → AI analyzes errors → Get personalized quizzes → Track mastery. Your mistakes become your curriculum.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Submit Essay", desc: "Paste your writing—AI finds all grammar errors" },
                { step: "2", title: "AI Generates Quiz", desc: "Get 10-question quiz built from YOUR exact mistakes" },
                { step: "3", title: "Practice & Learn", desc: "Answer questions with instant explanations" },
                { step: "4", title: "Track Mastery", desc: "Watch errors move Learning → Practicing → Mastered" }
              ].map((item, i) => (
                <div key={i} className="relative">
                  <div className="p-6 rounded-2xl bg-white border-2 border-teal-100 hover:border-teal-400 transition-all">
                    <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold mb-4">
                      {item.step}
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </div>
                  {i < 3 && (
                    <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                      <ChevronRight size={24} className="text-teal-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- PRICING COMPARISON PREVIEW --- */}
        <section id="pricing" className="py-24 bg-slate-50 border-t border-slate-200 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Simple, transparent pricing</h2>
              <p className="text-slate-500 mb-8">
                Free plan gets you started. Pro unlocks unlimited practice & elite features.
              </p>
              
              {/* Billing Toggle */}
              <div className="flex bg-white p-1.5 rounded-xl w-fit mx-auto border border-slate-200 shadow-sm">
                <button 
                  onClick={() => setBillingCycle('monthly')}
                  className={`flex-1 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${billingCycle === 'monthly' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Monthly
                </button>
                <button 
                  onClick={() => setBillingCycle('yearly')}
                  className={`flex-1 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all relative ${billingCycle === 'yearly' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Yearly
                  {billingCycle === 'yearly' && (
                    <span className="absolute -top-3 -right-1 bg-emerald-500 text-white text-[8px] px-2 py-0.5 rounded-full font-black">SAVE 45%</span>
                  )}
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                { 
                  name: "Free", 
                  price: "$0", 
                  subtext: "Perfect for beginners",
                  badge: "ALWAYS FREE",
                  badgeColor: "bg-blue-500",
                  features: [
                    { text: "2 essays per day", icon: true },
                    { text: "6 practice quizzes per day", icon: true },
                    { text: "Complete error analysis", icon: true },
                    { text: "Lesson access", icon: true },
                    { text: "Mastery tracking", icon: true },
                    { text: "Elite rewrites", icon: false },
                    { text: "PDF reports", icon: false },
                  ],
                  cta: "Get Started",
                  highlight: false
                },
                { 
                  name: "Pro", 
                  monthlyPrice: "$9",
                  yearlyPrice: "$59",
                  monthlyTotal: "$9/mo",
                  yearlyTotal: "$5/mo (billed yearly)",
                  subtext: "For serious learners",
                  features: [
                    { text: "50 essays per day", icon: true },
                    { text: "Unlimited quizzes", icon: true },
                    { text: "Complete error analysis", icon: true },
                    { text: "Lesson access", icon: true },
                    { text: "Mastery tracking", icon: true },
                    { text: "Elite rewrites", icon: true },
                    { text: "PDF progress reports", icon: true },
                    
                  ],
                  badge: "MOST POPULAR",
                  badgeColor: "bg-emerald-500",
                  cta: "Upgrade to Pro",
                  highlight: true
                }
              ].map((plan, i) => (
                <div key={i} className={`rounded-2xl p-8 border-2 transition-all h-full flex flex-col relative ${plan.highlight ? 'bg-gradient-to-br from-teal-600 to-teal-500 text-white border-teal-500 shadow-lg shadow-teal-600/20' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                  {plan.badge && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className={`px-4 py-1 ${plan.badgeColor} text-white text-xs font-black rounded-full shadow-lg`}>
                        {plan.badge}
                      </div>
                    </div>
                  )}
                  <h3 className={`text-2xl font-bold mb-2 ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                  {plan.subtext && (
                    <p className={`text-xs font-semibold mb-5 ${plan.highlight ? 'text-teal-100' : 'text-slate-500'}`}>{plan.subtext}</p>
                  )}
                  <div className="mb-8">
                    {plan.price !== undefined ? (
                      <div>
                        <span className={`text-4xl font-bold ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{plan.price}</span>
                      </div>
                    ) : (
                      <div>
                        <span className={`text-4xl font-bold ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>
                          ${billingCycle === 'monthly' ? plan.monthlyPrice?.replace('$', '') : plan.yearlyPrice?.replace('$', '')}
                        </span>
                        <p className={`text-sm mt-2 font-semibold ${plan.highlight ? 'text-teal-100' : 'text-slate-600'}`}>
                          {billingCycle === 'monthly' ? plan.monthlyTotal : plan.yearlyTotal}
                        </p>
                      </div>
                    )}
                  </div>
                  <ul className={`space-y-3 mb-8 pb-8 border-b ${plan.highlight ? 'border-teal-400' : 'border-slate-100'}`}>
                    {plan.features.map((feature: any, j: number) => (
                      <li key={j} className={`flex items-center gap-2 text-sm ${feature.icon ? (plan.highlight ? 'text-white' : 'text-slate-700') : (plan.highlight ? 'text-teal-200' : 'text-slate-400')}`}>
                        {feature.icon ? (
                          <Check size={16} className={plan.highlight ? 'text-teal-100 flex-shrink-0' : 'text-teal-600 flex-shrink-0'} />
                        ) : (
                          <X size={16} className={plan.highlight ? 'text-teal-300/50 flex-shrink-0' : 'text-slate-300 flex-shrink-0'} />
                        )}
                        <span>{typeof feature === 'string' ? feature : feature.text}</span>
                      </li>
                    ))}
                  </ul>
                  {plan.highlight ? (
                    <button
                      type="button"
                      onClick={handleProCheckout}
                      className="w-full py-3 rounded-lg font-bold transition-all mt-auto block text-center bg-white text-teal-600 hover:bg-gray-50 shadow-lg"
                    >
                      {plan.cta}
                    </button>
                  ) : (
                    <Link href="/analyze" className="w-full py-3 rounded-lg font-bold transition-all mt-auto block text-center bg-slate-100 text-slate-900 hover:bg-slate-200">
                      {plan.cta}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="py-32 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              Turn your mistakes into mastery.
            </h2>
            <p className="text-xl text-slate-500">
              Every error becomes a personalized quiz question. Practice what YOU need, track YOUR progress, master YOUR weaknesses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/analyze" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all hover:scale-[1.02] shadow-lg shadow-teal-600/30">
                Start Learning Now <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        <footer className="bg-white border-t">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="xl:grid xl:grid-cols-3 xl:gap-8">
              <div className="space-y-8 xl:col-span-1">
                <img className="h-10" src="/logo.svg" alt="Wrytt AI" />
                <p className="text-gray-500 text-base">
                  Learn English from your mistakes. <br/>
                  AI-powered quiz generator from YOUR writing errors.
                </p>
                <div className="flex space-x-6">
                  {/* Social icons nếu có (Github, Twitter/X) */}
                </div>
              </div>

              <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
                <div className="md:grid md:grid-cols-2 md:gap-8">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Product</h3>
                    <ul role="list" className="mt-4 space-y-4">
                      <li><a href="/rules" className="text-base text-gray-500 hover:text-gray-900">Grammar Rules</a></li>
                      <li><a href="/blog" className="text-base text-gray-500 hover:text-gray-900">Learning Blog</a></li>
                      <li><a href="/#pricing" className="text-base text-gray-500 hover:text-gray-900">Pricing</a></li>
                    </ul>
                  </div>
                  <div className="mt-12 md:mt-0">
                    <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
                    <ul role="list" className="mt-4 space-y-4">
                      <li><a href="/privacy" className="text-base text-gray-500 hover:text-gray-900">Privacy Policy</a></li>
                      <li><a href="/terms" className="text-base text-gray-500 hover:text-gray-900">Terms of Service</a></li>
                    </ul>
                  </div>
                </div>
                
                <div className="md:grid md:grid-cols-1 md:gap-8">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Contact</h3>
                    <ul role="list" className="mt-4 space-y-4">
                      <li className="text-base text-gray-500">
                        <span className="block">Ninh Kieu Dist, Can Tho City, VN</span>
                      </li>
                      <li>
                        <a href="mailto:contact@wrytt.me" className="text-base text-gray-500 hover:text-indigo-600">
                          contact@wrytt.me
                        </a>
                      </li>
                      <li className="text-xs text-gray-400 mt-4">
                        Designed by Phu Le 
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-12 border-t border-gray-200 pt-8">
              <p className="text-base text-gray-400 xl:text-center">
                &copy; 2026 Wrytt. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    );
  }