"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { 
  Search, Shield, User, MoreHorizontal, 
  CheckCircle, XCircle, Mail, FileText, TrendingUp, Clock
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  role: "user" | "admin";
  created_at: string;
  essay_count?: number;
  avg_score?: number;
  last_submission?: string;
}

export default function UsersManager() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "user">("all");
  
  const supabase = createClient();

  // 1. FETCH DATA WITH STATISTICS
  const fetchUsers = async () => {
    setLoading(true);
    
    // Fetch profiles
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profileError) {
      alert("Error fetching users: " + profileError.message);
      setLoading(false);
      return;
    }

    // Fetch submission statistics for each user
    const { data: submissions, error: submissionError } = await supabase
      .from("submissions")
      .select("user_id, score, created_at");

    if (submissionError) {
      console.error("Error fetching submissions:", submissionError);
    }

    // Calculate statistics per user
    const userStats = new Map();
    if (submissions) {
      submissions.forEach((sub: any) => {
        if (!userStats.has(sub.user_id)) {
          userStats.set(sub.user_id, {
            count: 0,
            totalScore: 0,
            lastSubmission: sub.created_at
          });
        }
        const stats = userStats.get(sub.user_id);
        stats.count++;
        stats.totalScore += sub.score || 0;
        if (new Date(sub.created_at) > new Date(stats.lastSubmission)) {
          stats.lastSubmission = sub.created_at;
        }
      });
    }

    // Merge statistics with profiles
    const usersWithStats = profiles?.map((profile: any) => {
      const stats = userStats.get(profile.id);
      return {
        ...profile,
        essay_count: stats?.count || 0,
        avg_score: stats ? (stats.totalScore / stats.count).toFixed(1) : "0.0",
        last_submission: stats?.lastSubmission || null
      };
    }) || [];

    setUsers(usersWithStats);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  // 2. TOGGLE ROLE (Thăng chức/Giáng chức)
  const toggleRole = async (user: UserProfile) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    
    // Confirm cho chắc
    const action = newRole === "admin" ? "Promote this user to ADMIN?" : "Demote this user to USER?";
    if (!confirm(`Are you sure you want to ${action}`)) return;

    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", user.id);

    if (error) {
      alert("Failed to update role: " + error.message);
    } else {
      // Cập nhật state local ngay lập tức
      setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
    }
  };

  // Filter Logic
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Management</h1>
           <p className="text-slate-500 font-medium">Manage access and roles.</p>
        </div>
        <div className="bg-gradient-to-r from-cyan-50 to-cyan-100 px-4 py-2 rounded-xl border border-cyan-200 text-sm font-bold text-cyan-700 shadow-sm">
           Total Users: {users.length}
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row gap-4">
         {/* Search */}
         <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
            <input 
                type="text" 
                placeholder="Search by email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none shadow-sm transition-shadow"
            />
         </div>
         
         {/* Filter Buttons */}
         <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            {(["all", "admin", "user"] as const).map((role) => (
                <button
                    key={role}
                    onClick={() => setFilterRole(role)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                        filterRole === role 
                        ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/30" 
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                >
                    {role}
                </button>
            ))}
         </div>
      </div>

      {/* USERS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 overflow-hidden">
         {/* Desktop view */}
         <div className="hidden md:block overflow-x-auto">
           <table className="w-full text-left">
            <thead className="bg-gradient-to-r from-slate-50 to-cyan-50/30 border-b border-slate-200">
                <tr>
                    <th className="p-4 font-bold text-slate-600 text-sm uppercase tracking-wide">User Info</th>
                    <th className="p-4 font-bold text-slate-600 text-sm uppercase tracking-wide">Role</th>
                    <th className="p-4 font-bold text-slate-600 text-sm uppercase tracking-wide text-center">Statistics</th>
                    <th className="p-4 font-bold text-slate-600 text-sm uppercase tracking-wide">Last Active</th>
                    <th className="p-4 font-bold text-slate-600 text-sm text-right uppercase tracking-wide">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {loading ? (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-500 font-medium">Loading users...</td></tr>
                ) : filteredUsers.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-500 font-medium">No users found matching filters.</td></tr>
                ) : (
                    filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-cyan-50/20 transition-all">
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-100 to-cyan-200 flex items-center justify-center text-cyan-700 font-bold shadow-sm">
                                        {user.email?.[0]?.toUpperCase() || "U"}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800 flex items-center gap-2">
                                            {user.email}
                                        </div>
                                        <div className="text-xs text-slate-400 font-mono">ID: {user.id.slice(0, 8)}...</div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4">
                                {user.role === 'admin' ? (
                                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-cyan-100 to-cyan-200 text-cyan-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-cyan-300 shadow-sm">
                                        <Shield size={12} fill="currentColor"/> Admin
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-slate-200">
                                        <User size={12} /> User
                                    </span>
                                )}
                            </td>
                            <td className="p-4">
                                <div className="flex items-center justify-center gap-4">
                                    <div className="flex items-center gap-1.5 text-slate-600" title="Essays Submitted">
                                        <FileText size={16} className="text-blue-500"/>
                                        <span className="text-sm font-bold">{user.essay_count || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-600" title="Average Score">
                                        <TrendingUp size={16} className="text-emerald-500"/>
                                        <span className="text-sm font-bold">{user.avg_score || "0.0"}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4 text-sm text-slate-500">
                                {user.last_submission ? (
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={14} className="text-slate-400"/>
                                        {new Date(user.last_submission).toLocaleDateString()}
                                    </div>
                                ) : (
                                    <span className="text-slate-400 italic">No activity</span>
                                )}
                            </td>
                            <td className="p-4 text-right">
                                <button 
                                    onClick={() => toggleRole(user)}
                                    className={`text-xs font-bold px-4 py-2 rounded-lg transition-all border shadow-sm hover:shadow-md ${
                                        user.role === 'admin' 
                                        ? "border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300" 
                                        : "border-cyan-200 text-cyan-600 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-cyan-100 hover:border-cyan-300"
                                    }`}
                                >
                                    {user.role === 'admin' ? "Revoke Admin" : "Make Admin"}
                                </button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
         </table>
         </div>

         {/* Mobile view - Card based */}
         <div className="md:hidden divide-y divide-slate-100">
            {loading ? (
                <div className="p-8 text-center text-slate-500 font-medium">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-slate-500 font-medium">No users found matching filters.</div>
            ) : (
                filteredUsers.map((user) => (
                    <div key={user.id} className="p-4 hover:bg-gradient-to-r hover:from-slate-50 hover:to-cyan-50/20 transition-all">
                        <div className="flex items-start gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-100 to-cyan-200 flex items-center justify-center text-cyan-700 font-bold shadow-sm flex-shrink-0">
                                {user.email?.[0]?.toUpperCase() || "U"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-slate-800 truncate">{user.email}</div>
                                <div className="text-xs text-slate-400 font-mono">ID: {user.id.slice(0, 8)}...</div>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    {user.role === 'admin' ? (
                                        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-cyan-100 to-cyan-200 text-cyan-700 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-cyan-300 shadow-sm">
                                            <Shield size={10} fill="currentColor"/> Admin
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-slate-200">
                                            <User size={10} /> User
                                        </span>
                                    )}
                                </div>
                                {/* Statistics */}
                                <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 flex items-center gap-1.5">
                                            <FileText size={14} className="text-blue-500"/> Essays
                                        </span>
                                        <span className="font-bold text-slate-700">{user.essay_count || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 flex items-center gap-1.5">
                                            <TrendingUp size={14} className="text-emerald-500"/> Avg Score
                                        </span>
                                        <span className="font-bold text-slate-700">{user.avg_score || "0.0"}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 flex items-center gap-1.5">
                                            <Clock size={14} className="text-slate-400"/> Last Active
                                        </span>
                                        <span className="font-semibold text-slate-600 text-xs">
                                            {user.last_submission 
                                                ? new Date(user.last_submission).toLocaleDateString()
                                                : "Never"
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => toggleRole(user)}
                            className={`w-full text-sm font-bold px-4 py-2.5 rounded-lg transition-all border shadow-sm hover:shadow-md ${
                                user.role === 'admin' 
                                ? "border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300" 
                                : "border-cyan-200 text-cyan-600 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-cyan-100 hover:border-cyan-300"
                            }`}
                        >
                            {user.role === 'admin' ? "Revoke Admin" : "Make Admin"}
                        </button>
                    </div>
                ))
            )}
         </div>
      </div>
    </div>
  );
}   