"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter, usePathname } from "next/navigation";
import { 
  LayoutDashboard, Terminal, Book, Users, 
  LogOut, ShieldAlert, ChevronLeft, Menu, X, FileText 
} from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const checkAdmin = async () => {
      // 1. Lấy User hiện tại
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // 2. Check quyền trong bảng profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        toast.error("You do not have permission to access this page.");
        router.push("/dashboard"); // Đá về trang thường
        return;
      }

      setIsAdmin(true);
      setLoading(false);
    };

    checkAdmin();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-cyan-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-cyan-500 rounded-full animate-ping opacity-20" />
          <div className="relative bg-white p-4 rounded-full shadow-xl">
            <ShieldAlert className="animate-pulse text-cyan-600" size={32}/>
          </div>
        </div>
        <p className="text-slate-600 font-bold">Verifying Admin Privileges...</p>
      </div>
    </div>
  );

  if (!isAdmin) return null;

  // Menu bên trái
  const menuItems = [
    { name: "Overview", icon: <LayoutDashboard size={20}/>, path: "/admin" },
    { name: "System Prompts", icon: <Terminal size={20}/>, path: "/admin/prompts" },
    { name: "Grammar Rules", icon: <Book size={20}/>, path: "/admin/rules" },
    { name: "Blog Posts", icon: <FileText size={20}/>, path: "/admin/blog" },
    { name: "Users Management", icon: <Users size={20}/>, path: "/admin/users" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50/30 flex font-sans text-slate-900 relative">
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen
        w-72 bg-white border-r border-slate-200 flex flex-col z-50
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        shadow-2xl lg:shadow-none
      `}>
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div 
            onClick={() => router.push("/")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldAlert className="text-white" size={20}/>
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight group-hover:text-cyan-600 transition-colors">
                Admin Panel
              </h2>
              <p className="text-xs text-cyan-600 font-bold">Wrytt Control</p>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-500"/>
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  router.push(item.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                  isActive 
                  ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/30" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-cyan-600"
                }`}
              >
                {item.icon} {item.name}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
          <button 
            onClick={() => router.push("/dashboard")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all text-sm font-bold"
          >
            <ChevronLeft size={18}/> Back to App
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 w-full lg:pl-0">
        {/* Mobile Header */}
        <div className="sticky top-0 z-30 lg:hidden bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu size={24} className="text-slate-600"/>
          </button>
          <div className="flex items-center gap-2">
            <ShieldAlert className="text-cyan-600" size={20}/>
            <span className="font-black text-slate-900">Admin</span>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}