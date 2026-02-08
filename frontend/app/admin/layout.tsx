"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter, usePathname } from "next/navigation";
import { 
  LayoutDashboard, Terminal, Book, Users, 
  LogOut, ShieldAlert, ChevronLeft 
} from "lucide-react";
import toast from "react-hot-toast";
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const checkAdmin = async () => {
      // 1. Lấy User hiện tại
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        toast.success("Đăng nhập thành công!"); 
        return;
      }

      // 2. Check quyền trong bảng profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        toast.error("Bạn không có quyền truy cập trang này");
        router.push("/dashboard"); // Đá về trang thường
        return;
      }

      setIsAdmin(true);
      setLoading(false);
    };

    checkAdmin();
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-bold gap-2">
       <ShieldAlert className="animate-pulse"/> Verifying Admin Privileges...
    </div>
  );

  if (!isAdmin) return null;

  // Menu bên trái
  const menuItems = [
    { name: "Overview", icon: <LayoutDashboard size={20}/>, path: "/admin" },
    { name: "System Prompts", icon: <Terminal size={20}/>, path: "/admin/prompts" },
    { name: "Grammar Rules", icon: <Book size={20}/>, path: "/admin/rules" },
    { name: "Users Management", icon: <Users size={20}/>, path: "/admin/users" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-900">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="text-indigo-500"/> COREFIX <span className="text-indigo-500">ADMIN</span>
          </h2>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50" 
                  : "hover:bg-slate-800 hover:text-white"
                }`}
              >
                {item.icon} {item.name}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => router.push("/dashboard")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors text-sm font-bold"
          >
            <ChevronLeft size={18}/> Back to App
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}