"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, User, CreditCard, Settings, ChevronDown, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function UserDropdown({ user, isPro }: { user: any, isPro: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // Lấy chữ cái đầu của email làm avatar giả
  const initial = user?.email?.charAt(0).toUpperCase() || "U";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* --- TRIGGER BUTTON --- */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
      >
        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-white">
            {initial}
        </div>
        <div className="hidden md:flex flex-col items-start text-xs">
            <span className="font-bold text-slate-700 max-w-[100px] truncate">{user?.email?.split('@')[0]}</span>
            {isPro && <span className="text-[10px] text-cyan-600 font-bold uppercase tracking-wider flex items-center gap-1"><Sparkles size={8}/> PRO</span>}
        </div>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* --- DROPDOWN MENU --- */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          
          <div className="px-4 py-3 border-b border-slate-100 mb-1">
            <p className="text-sm font-bold text-slate-900 truncate">{user?.email}</p>
            <p className="text-xs text-slate-500 mt-0.5">{isPro ? "Professional Plan" : "Free Plan"}</p>
          </div>

          <div className="space-y-1 px-1">
            <button 
                onClick={() => router.push("/settings")} 
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors text-left font-medium"
            >
                <Settings size={16} className="text-slate-400"/> Settings
            </button>
            <button 
                onClick={() => router.push("/settings?tab=billing")} 
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors text-left font-medium"
            >
                <CreditCard size={16} className="text-slate-400"/> Billing
            </button>
          </div>

          <div className="border-t border-slate-100 mt-2 pt-2 px-1">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-left font-medium"
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}