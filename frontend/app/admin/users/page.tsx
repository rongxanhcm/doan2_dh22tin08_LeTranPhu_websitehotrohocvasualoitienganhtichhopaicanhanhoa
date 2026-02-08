"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { 
  Search, Shield, User, MoreHorizontal, 
  CheckCircle, XCircle, Mail 
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  role: "user" | "admin";
  created_at: string;
}

export default function UsersManager() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "user">("all");
  
  const supabase = createClient();

  // 1. FETCH DATA
  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) alert("Error fetching users: " + error.message);
    else setUsers(data || []);
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
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
           <p className="text-slate-500">Manage access and roles.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 shadow-sm">
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
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
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
                        ? "bg-slate-900 text-white shadow" 
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                >
                    {role}
                </button>
            ))}
         </div>
      </div>

      {/* USERS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
         <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                    <th className="p-4 font-bold text-slate-500 text-sm">User Info</th>
                    <th className="p-4 font-bold text-slate-500 text-sm">Role</th>
                    <th className="p-4 font-bold text-slate-500 text-sm">Joined Date</th>
                    <th className="p-4 font-bold text-slate-500 text-sm text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {loading ? (
                    <tr><td colSpan={4} className="p-8 text-center text-slate-400">Loading users...</td></tr>
                ) : filteredUsers.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-slate-400">No users found matching filters.</td></tr>
                ) : (
                    filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
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
                                    <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-indigo-200">
                                        <Shield size={12} fill="currentColor"/> Admin
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-slate-200">
                                        <User size={12} /> User
                                    </span>
                                )}
                            </td>
                            <td className="p-4 text-sm text-slate-500">
                                {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-right">
                                <button 
                                    onClick={() => toggleRole(user)}
                                    className={`text-xs font-bold px-3 py-2 rounded-lg transition-colors border ${
                                        user.role === 'admin' 
                                        ? "border-red-200 text-red-600 hover:bg-red-50" 
                                        : "border-indigo-200 text-indigo-600 hover:bg-indigo-50"
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
    </div>
  );
}   