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
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-700 text-xs font-semibold tracking-wide uppercase">
      {children}
    </div>
  );

  const FeatureCard = ({ icon: Icon, title, desc, className = "" }: any) => (
    <div className={`p-8 rounded-2xl bg-white border border-slate-200 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-900/5 transition-all duration-300 group ${className}`}>
      <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-cyan-50 transition-colors">
        <Icon className="text-slate-600 group-hover:text-cyan-600 transition-colors" size={24} />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
    </div>
  );

  // --- MAIN COMPONENT ---

  export default function LandingPage() {
    const [user, setUser] = useState<any>(null); // Nên define interface User chuẩn từ Supabase
    const [loading, setLoading] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isPro, setIsPro] = useState(false);
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

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-cyan-100 selection:text-cyan-900 overflow-x-hidden">
      
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.4]" 
           style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      {/* --- NAVBAR (Updated) --- */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-200 py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
            <div className="relative w-8 h-8">
              <Image src="/logo.svg" alt="Eloqua Logo" fill className="object-contain" priority />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">Eloqua</span>
          </div>

          <div className="flex items-center gap-4">
            {!loading && (
              user ? (
                <div className="flex items-center gap-6">
                  <Link href="/dashboard" className="hidden sm:block text-sm font-bold text-slate-600 hover:text-cyan-600 transition-colors">
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
                  <Link href="/analyze" className="px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-cyan-600 transition-colors shadow-lg shadow-slate-900/20 hover:shadow-cyan-600/20">
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
                <Zap size={12} className="text-cyan-600 fill-cyan-600"/> 
                Welcome back, {user.email.split('@')[0]}
              </Badge>
            ) : (
              <Badge>
                <Sparkles size={12} className="text-cyan-600"/> 
                AI Writing Assistant v2.0
              </Badge>
            )}
            
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              Refine your writing, <br/>
              <span className="text-cyan-600 relative inline-block">
                word by word.
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-cyan-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span>
            </h1>
            
            <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Eloqua isn't just a spellchecker. It's an AI-powered writing coach that helps you reach <span className="font-semibold text-slate-900">IELTS Band 8.0+</span> standards using Vertex AI technology.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/analyze" className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-cyan-600 text-white font-semibold rounded-xl hover:bg-cyan-700 transition-all hover:scale-[1.02] shadow-xl shadow-cyan-600/20">
                {user ? "Continue Writing" : "Analyze My Writing"} <ArrowRight size={18} />
              </Link>
              {/* Nếu đã log in, nút thứ 2 trỏ về Dashboard */}
              <Link href={user ? "/dashboard" : "#demo"} className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all">
                {user ? "View Progress" : "View Demo"}
              </Link>
            </div>
            
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-4 text-sm text-slate-500">
                <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold">
                        {String.fromCharCode(64 + i)}
                      </div> 
                    ))}
                </div>
                <p>Join 2,000+ students already improving</p>
            </div>
          </div>

          {/* Right Visual: Mockup (Giữ nguyên) */}
          <div className="lg:w-1/2 w-full relative">
            <div className="absolute -inset-1 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-2xl blur opacity-20 animate-pulse"></div>
            <div className="relative bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden">
                <div className="h-10 border-b border-slate-100 bg-slate-50 flex items-center px-4 gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                      <div className="w-3 h-3 rounded-full bg-green-400/80" />
                    </div>
                </div>
                <div className="grid grid-cols-2 min-h-[360px] divide-x divide-slate-100">
                    <div className="p-6 font-serif text-slate-500 leading-loose text-sm">
                      <p className="mb-4 text-xs font-sans font-bold uppercase tracking-wider text-red-400">Original</p>
                      The graph <span className="bg-red-50 text-red-600 border-b border-red-200 decoration-red-400 px-0.5">shows the amount of people</span> who use the internet...
                    </div>
                    <div className="p-6 bg-cyan-50/30 font-serif text-slate-800 leading-loose text-sm">
                      <p className="mb-4 text-xs font-sans font-bold uppercase tracking-wider text-cyan-600 flex items-center gap-2">
                        <Sparkles size={12}/> Eloqua Rewrite
                      </p>
                      The graph <span className="bg-green-100 text-green-800 border-b border-green-300 px-0.5">illustrates the number of individuals</span> accessing the internet...
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
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Science-backed grading</h2>
              <p className="text-slate-500">
                We reverse-engineered the official band descriptors to give you feedback that actually moves the needle.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard 
                  icon={Zap}
                  title="Instant Feedback"
                  desc="Get a detailed breakdown of your grammar and vocabulary mistakes in less than 5 seconds."
              />
              <FeatureCard 
                  icon={Fingerprint}
                  title="Personalized Style"
                  desc="The AI learns your writing voice and suggests improvements that sound like you, but smarter."
                  className="md:col-span-2 bg-gradient-to-br from-white to-cyan-50/50 border-cyan-100"
              />
              <FeatureCard 
                  icon={BookOpen}
                  title="Academic Vocab"
                  desc="Replace weak verbs with C1/C2 alternatives instantly."
                  className="md:col-span-2"
              />
              <FeatureCard 
                  icon={BarChart3}
                  title="Score Prediction"
                  desc="Accurate band score estimation for Task 1 & Task 2."
              />
            </div>
          </div>
        </section>

        {/* --- CTA SECTION (Minimalist) --- */}
        <section className="py-32 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              Ready to write your best essay?
            </h2>
            <p className="text-xl text-slate-500">
              Join thousands of students aiming for Band 7.0+. No credit card required.
            </p>
            <div className="flex justify-center pt-4">
              <Link href="/analyze" className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-slate-900 font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:bg-cyan-600">
                  Start Analyzing Free
                  <div className="absolute -inset-3 rounded-xl bg-cyan-100 opacity-0 group-hover:opacity-100 transition duration-200 -z-10 blur-lg"></div>
              </Link>
            </div>
          </div>
        </section>

        {/* --- FOOTER (Clean) --- */}
      {/* --- PROFESSIONAL FAT FOOTER --- */}
        <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8 text-sm">
          <div className="max-w-7xl mx-auto px-6">
            
            {/* Top Section: Grid 4 Cột */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-16">
              
              {/* Cột 1: Brand & Tech Stack (Chiếm 2 cột trên màn hình lớn) */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8">
                      <Image src="/logo.svg" alt="Eloqua Logo" fill className="object-contain" />
                    </div>
                    <span className="font-bold text-xl text-slate-900 tracking-tight">Eloqua</span>
                </div>
                <p className="text-slate-500 leading-relaxed max-w-xs">
                    The AI-powered writing coach that helps students and professionals achieve native-level fluency.
                </p>
                
                {/* --- PHẦN NỊNH GOOGLE CLOUD (Badge) --- */}
                <div className="inline-flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                    <div className="p-1.5 bg-cyan-50 rounded-md">
                      <Cloud size={16} className="text-cyan-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Infrastructure</span>
                      <span className="text-xs font-semibold text-slate-700">Powered by Google Vertex AI & Gemini Flash</span>
                    </div>
                </div>
              </div>

              {/* Cột 2: Product */}
              <div>
                <h4 className="font-bold text-slate-900 mb-6">Product</h4>
                <ul className="space-y-4 text-slate-500 font-medium">
                  <li><Link href="/analyze" className="hover:text-cyan-600 transition-colors">Analyzer</Link></li>
                  <li><Link href="/dashboard" className="hover:text-cyan-600 transition-colors">Dashboard</Link></li>
                  <li><Link href="#" className="hover:text-cyan-600 transition-colors">Pricing</Link></li>
                  <li><Link href="#" className="hover:text-cyan-600 transition-colors">Enterprise</Link></li>
                </ul>
              </div>

              {/* Cột 3: Company (Quan trọng cho Trust) */}
              <div>
                <h4 className="font-bold text-slate-900 mb-6">Company</h4>
                <ul className="space-y-4 text-slate-500 font-medium">
                  <li><Link href="#" className="hover:text-cyan-600 transition-colors">About Us</Link></li>
                  <li><Link href="#" className="hover:text-cyan-600 transition-colors">Careers</Link></li>
                  <li><Link href="#" className="hover:text-cyan-600 transition-colors">Blog</Link></li>
                  <li><Link href="#" className="hover:text-cyan-600 transition-colors">Contact</Link></li>
                </ul>
              </div>

              {/* Cột 4: Legal & Contact (Bắt buộc để xin Credit) */}
              <div className="lg:col-span-2">
                <h4 className="font-bold text-slate-900 mb-6">Contact & Legal</h4>
                <ul className="space-y-4 text-slate-500">
                  <li className="flex items-start gap-3">
                    <MapPin size={16} className="text-slate-400 mt-1 flex-shrink-0" />
                    <span>
                      123 Innovation Drive, Tech Park<br/>
                      Can Tho City, Vietnam 900000
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Mail size={16} className="text-slate-400 flex-shrink-0" />
                    <a href="mailto:contact@eloqua.ai" className="hover:text-cyan-600 transition-colors">contact@eloqua.ai</a>
                  </li>
                  <li className="flex items-center gap-3">
                    <FileText size={16} className="text-slate-400 flex-shrink-0" />
                    <span className="text-slate-400">Business Reg: 0102xxxxxx</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Section: Copyright & Socials */}
           <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-xs text-slate-400 font-medium flex flex-wrap justify-center gap-x-2">
                <span>© 2026 Eloqua Inc. All rights reserved.</span>
                
                <span className="hidden md:inline text-slate-300">|</span>
                
                {/* --- SỬA Ở ĐÂY --- */}
                <Link href="/privacy" className="hover:text-cyan-600 transition-colors cursor-pointer">
                  Privacy Policy
                </Link>
                
                <span className="text-slate-300">|</span>
                
                {/* --- SỬA Ở ĐÂY --- */}
                <Link href="/terms" className="hover:text-cyan-600 transition-colors cursor-pointer">
                  Terms of Service
                </Link>
              </div>

              <div className="flex gap-4">
                <Link href="#" className="p-2 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-cyan-600 hover:border-cyan-200 transition-all">
                    <Github size={16} />
                </Link>
                <Link href="#" className="p-2 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-cyan-600 hover:border-cyan-200 transition-all">
                    <Twitter size={16} />
                </Link>
                <Link href="https://www.linkedin.com/in/ph%C3%BA-l%C3%AA-905a473b0/edit/intro/" className="p-2 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-cyan-600 hover:border-cyan-200 transition-all">
                    <Linkedin size={16} />
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }