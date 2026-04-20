"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import {
  ArrowRight,
  Check,
  X,
  Sparkles,
  BarChart3,
  Zap,
  BookOpen,
  Fingerprint,
  ShieldCheck,
  Target,
  CircleDot,
} from "lucide-react";
import toast from "react-hot-toast";
import UserDropdown from "@/components/UserDropdown";

const CHECKOUT_URL_MONTHLY = "https://wrytt.lemonsqueezy.com/checkout/buy/76ea9484-fa92-43c9-ac90-ef9c22e2beab?enabled=1304553";
const CHECKOUT_URL_YEARLY = "https://wrytt.lemonsqueezy.com/checkout/buy/2b2a245a-5675-47b4-bd64-ccd3aedd8e01?enabled=1304546";
//const CHECKOUT_URL_MONTHLY = "https://wrytt.lemonsqueezy.com/checkout/buy/e94485d4-5dd0-489d-aeb6-8182ccea5311?enabled=1304684";
//const CHECKOUT_URL_YEARLY = "https://wrytt.lemonsqueezy.com/checkout/buy/7cae4736-2ee6-4ce6-854a-e89b299f3c1e?enabled=1304691";
const SectionTag = ({ children }: { children: React.ReactNode }) => (
  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 border border-teal-100 text-teal-700 text-[11px] font-bold tracking-[0.14em] uppercase backdrop-blur-sm">
    <CircleDot size={11} className="text-teal-500" />
    {children}
  </div>
);

const FeatureTile = ({ icon: Icon, title, desc, className = "" }: any) => (
  <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_30px_-28px_rgba(15,23,42,0.8)] hover:border-teal-200 hover:-translate-y-0.5 transition-all duration-300 ${className}`}>
    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-50 to-teal-50 border border-slate-200 flex items-center justify-center mb-4">
      <Icon size={20} className="text-teal-700" />
    </div>
    <h3 className="text-lg font-black text-slate-900 leading-tight mb-2">{title}</h3>
    <p className="text-sm leading-relaxed text-slate-600">{desc}</p>
  </div>
);

export default function LandingPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user);
        const { data } = await supabase.from("user_usage").select("is_pro").eq("user_id", user.id).single();
        if (data) setIsPro(data.is_pro);
      }

      setLoading(false);
    };

    checkUser();

    const handleScroll = () => setIsScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [supabase]);

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

    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      toast.error("Please login to upgrade.");
      router.push("/login");
      return;
    }

    const baseUrl = billingCycle === "monthly" ? CHECKOUT_URL_MONTHLY : CHECKOUT_URL_YEARLY;
    const separator = baseUrl.includes("?") ? "&" : "?";
    const checkoutUrl = `${baseUrl}${separator}checkout[custom][user_id]=${currentUser.id}&embed=1`;

    const lemon = window as unknown as {
      createLemonSqueezy?: () => void;
      LemonSqueezy?: { Url: { Open: (url: string) => void } };
    };

    if (!lemon.LemonSqueezy && lemon.createLemonSqueezy) lemon.createLemonSqueezy();

    setTimeout(() => {
      if (lemon.LemonSqueezy) {
        lemon.LemonSqueezy.Url.Open(checkoutUrl);
      } else {
        window.location.href = checkoutUrl;
      }
    }, 250);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-[#f3fbfa] via-[#f8fafc] to-white text-slate-900 selection:bg-teal-100" style={{ fontFamily: '"Space Grotesk", "Manrope", sans-serif' }}>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-30" style={{ backgroundImage: "radial-gradient(#a8b7ca 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      <div className="fixed top-[-240px] left-[-200px] w-[520px] h-[520px] rounded-full bg-teal-300/20 blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-260px] right-[-180px] w-[560px] h-[560px] rounded-full bg-cyan-200/20 blur-3xl pointer-events-none" />

      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${isScrolled ? "py-3" : "py-5"}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className={`rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-xl px-4 sm:px-6 py-3 flex items-center justify-between transition-all ${isScrolled ? "shadow-[0_12px_28px_-20px_rgba(15,23,42,0.45)]" : "shadow-none"}`}>
            <button className="flex items-center gap-2.5" onClick={() => router.push("/")}>
              <div className="relative w-9 h-9">
                <Image src="/logo.svg" alt="Wrytt Logo" fill className="object-contain" priority />
              </div>
              <span className="text-xl font-black tracking-tight">Wrytt</span>
            </button>

            <div className="flex items-center gap-3 sm:gap-4">
              {!loading &&
                (user ? (
                  <div className="flex items-center gap-4 sm:gap-6">
                    <Link href="/dashboard" className="hidden sm:block text-sm font-bold text-slate-600 hover:text-teal-700 transition-colors">
                      Dashboard
                    </Link>
                    <div className="pl-3 border-l border-slate-200">
                      <UserDropdown user={user} isPro={isPro} />
                    </div>
                  </div>
                ) : (
                  <>
                    <Link href="/login" className="hidden sm:block text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
                      Log in
                    </Link>
                    <Link href="/analyze" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-teal-700 transition-all shadow-lg shadow-slate-900/20">
                      Get Started
                      <ArrowRight size={14} />
                    </Link>
                  </>
                ))}
            </div>
          </div>
        </div>
      </nav>

      <section className="relative z-10 pt-32 sm:pt-36 lg:pt-44 pb-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-7">
            <SectionTag>{user ? `Welcome back, ${user.email.split("@")[0]}` : "Deliberate English Practice"}</SectionTag>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-[1.05] tracking-[-0.03em]">
              Train on your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-700 via-cyan-700 to-teal-500">real writing mistakes</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Wrytt turns every grammar mistake in your essay into targeted practice. Write, get feedback, then drill the exact weak points until they become strengths.
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
              <Link href="/analyze" className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-gradient-to-r from-teal-700 to-cyan-700 text-white font-bold hover:from-teal-800 hover:to-cyan-800 transition-all shadow-[0_18px_30px_-20px_rgba(13,148,136,0.9)]">
                {user ? "Continue Writing" : "Analyze My Essay"}
                <ArrowRight size={18} />
              </Link>
              {user ? (
                <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold hover:border-teal-300 hover:text-teal-700 transition-all">
                  Open Dashboard
                </Link>
              ) : (
                <div className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 font-bold text-sm">
                  <Check size={16} />
                  No login required for first analysis
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
              <div className="rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm p-4">
                <p className="text-xs uppercase tracking-widest font-bold text-slate-500">Accuracy Loop</p>
                <p className="text-lg font-black text-slate-900 mt-1">Write to Quiz to Master</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm p-4">
                <p className="text-xs uppercase tracking-widest font-bold text-slate-500">Quiz Engine</p>
                <p className="text-lg font-black text-slate-900 mt-1">From your own errors</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm p-4">
                <p className="text-xs uppercase tracking-widest font-bold text-slate-500">Tracking</p>
                <p className="text-lg font-black text-slate-900 mt-1">Learning to Mastered</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-teal-300/20 via-cyan-200/20 to-transparent blur-2xl" />
            <div className="relative rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-xl p-5 sm:p-6 shadow-[0_30px_60px_-35px_rgba(15,23,42,0.8)]">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-black uppercase tracking-widest text-teal-700">Live Practice Studio</p>
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-rose-600 mb-1">Detected Mistake</p>
                  <p className="text-sm text-slate-700 leading-relaxed">The graph shows <span className="bg-rose-100 text-rose-700 px-1 rounded font-semibold">the amount of people</span> using the internet.</p>
                </div>

                <div className="rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-teal-700 mb-2">Generated Question</p>
                  <p className="text-sm font-bold text-slate-900 mb-3">Choose the most accurate correction:</p>
                  <div className="space-y-2">
                    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm">A. the amount of people</div>
                    <div className="rounded-lg border border-emerald-400 bg-emerald-50 px-3 py-2.5 text-sm font-bold text-emerald-800">B. the number of people</div>
                    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm">C. the total of people</div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                    <span>Mastery Progress</span>
                    <span>Practicing</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full w-2/3 bg-gradient-to-r from-teal-500 to-cyan-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-20 border-y border-slate-200 bg-white/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="mb-10">
            <SectionTag>What Makes Wrytt Different</SectionTag>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-4">Not generic grammar drills</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <FeatureTile icon={Zap} title="Instant Diagnostic" desc="Get a quality score and high-signal feedback seconds after you submit." className="md:col-span-2" />
            <FeatureTile icon={BookOpen} title="Error-to-Quiz Engine" desc="Each quiz is generated from your exact error quote, so practice maps to your writing." className="md:col-span-4 bg-gradient-to-br from-white to-teal-50/70" />
            <FeatureTile icon={Target} title="Focus Lock System" desc="Wrytt keeps one priority error in focus until performance proves mastery." className="md:col-span-3" />
            <FeatureTile icon={BarChart3} title="Mastery States" desc="Clear progression from Learning to Practicing to Mastered with historical attempts." className="md:col-span-3" />
            <FeatureTile icon={Fingerprint} title="Contextual Lessons" desc="Each correction includes a rule explanation tied to your sentence context." className="md:col-span-4" />
            <FeatureTile icon={ShieldCheck} title="Stable Learning Routine" desc="Consistent UI flow helps students build daily writing habits with less friction." className="md:col-span-2" />
          </div>
        </div>
      </section>

      <section className="relative z-10 py-24">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <SectionTag>Learning Flow</SectionTag>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-4">A tight loop that compounds weekly</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: "01", title: "Submit Writing", desc: "Paste an essay and let Wrytt extract core issues." },
              { step: "02", title: "Generate Practice", desc: "System creates targeted quiz questions from those issues." },
              { step: "03", title: "Fix in Context", desc: "Review explanations and internalize the grammar rule." },
              { step: "04", title: "Track Mastery", desc: "Watch weak areas move toward stable performance." },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_24px_-24px_rgba(15,23,42,0.75)]">
                <p className="text-xs font-black tracking-widest text-teal-700 mb-3">STEP {item.step}</p>
                <h3 className="font-black text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="relative z-10 py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <SectionTag>Pricing</SectionTag>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-4">Start free, upgrade when serious</h2>
            <p className="text-slate-600 mt-3">No complex tiers. One free plan and one powerful Pro plan.</p>

            <div className="inline-flex mt-7 p-1.5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${billingCycle === "monthly" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-800"}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${billingCycle === "yearly" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-800"}`}
              >
                Yearly
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-7 flex flex-col">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Free</p>
              <h3 className="text-4xl font-black text-slate-900">$0</h3>
              <p className="text-sm text-slate-500 mt-2">Best for trying the workflow.</p>

              <ul className="space-y-3 mt-8 mb-8">
                {[
                  { text: "2 essays per day", ok: true },
                  { text: "6 practice quizzes per day", ok: true },
                  { text: "Core feedback + rule lessons", ok: true },
                  { text: "Mastery tracking", ok: true },
                  { text: "Elite rewrites", ok: false },
                  { text: "PDF reports", ok: false },
                ].map((feature) => (
                  <li key={feature.text} className={`flex items-center gap-2 text-sm ${feature.ok ? "text-slate-700" : "text-slate-400"}`}>
                    {feature.ok ? <Check size={15} className="text-teal-600" /> : <X size={15} className="text-slate-300" />}
                    {feature.text}
                  </li>
                ))}
              </ul>

              <Link href="/analyze" className="mt-auto inline-flex items-center justify-center rounded-xl bg-slate-100 text-slate-900 font-bold py-3 hover:bg-slate-200 transition-colors">
                Get Started
              </Link>
            </div>

            <div className="rounded-2xl border border-teal-300 bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-700 p-7 text-white relative overflow-hidden flex flex-col">
              <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-white/10 blur-2xl" />
              <p className="text-xs font-black uppercase tracking-widest text-teal-100 mb-2">Pro</p>
              <h3 className="text-4xl font-black">{billingCycle === "monthly" ? "$9" : "$59"}</h3>
              <p className="text-sm text-teal-100 mt-2">{billingCycle === "monthly" ? "Per month" : "Per year (about $5/mo)"}</p>

              <ul className="space-y-3 mt-8 mb-8">
                {[
                  "50 essays per day",
                  "Unlimited quizzes",
                  "Elite rewrites",
                  "Priority feedback quality",
                  "PDF progress reports",
                  "Everything in Free",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-white/95">
                    <Check size={15} className="text-teal-100" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={handleProCheckout}
                className="mt-auto inline-flex items-center justify-center rounded-xl bg-white text-teal-700 font-black py-3 hover:bg-slate-50 transition-colors shadow-lg"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-24">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">Build precision, not guesswork</h2>
          <p className="text-slate-600 text-lg mt-4 max-w-2xl mx-auto">Wrytt gives you the shortest path from weak writing patterns to confident control.</p>
          <div className="mt-8">
            <Link href="/analyze" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-teal-700 transition-all shadow-lg shadow-slate-900/20">
              Start Learning Now
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-12">
          <div className="grid lg:grid-cols-3 gap-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="relative w-9 h-9">
                  <Image src="/logo.svg" alt="Wrytt" fill className="object-contain" />
                </div>
                <span className="text-xl font-black">Wrytt</span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed max-w-sm">Learn English from your own mistakes through focused analysis, quizzes, and mastery tracking.</p>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Product</p>
                <div className="space-y-2.5 text-sm">
                  <Link href="/rules" className="block text-slate-600 hover:text-teal-700">Grammar Rules</Link>
                  <Link href="/blog" className="block text-slate-600 hover:text-teal-700">Learning Blog</Link>
                  <Link href="/#pricing" className="block text-slate-600 hover:text-teal-700">Pricing</Link>
                </div>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Legal</p>
                <div className="space-y-2.5 text-sm">
                  <Link href="/privacy" className="block text-slate-600 hover:text-teal-700">Privacy Policy</Link>
                  <Link href="/terms" className="block text-slate-600 hover:text-teal-700">Terms of Service</Link>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Contact</p>
              <p className="text-sm text-slate-600">Ninh Kieu Dist, Can Tho City, VN</p>
              <a href="mailto:contact@wrytt.me" className="block mt-2 text-sm text-slate-600 hover:text-teal-700">contact@wrytt.me</a>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-200 text-xs text-slate-500 text-center">
            Copyright 2026 Wrytt. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
