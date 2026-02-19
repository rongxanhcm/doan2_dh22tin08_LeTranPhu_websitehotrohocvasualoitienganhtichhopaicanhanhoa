"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { 
  Users, FileText, TrendingUp, Activity, 
  Calendar, ArrowUpRight, ShieldCheck 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, CartesianGrid 
} from 'recharts';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEssays: 0,
    avgScore: 0,
    chartData: [] as any[],
    recentSubmissions: [] as any[]
  });

  const supabase = createClient();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // 1. Tổng User (đếm bảng profiles)
        const { count: userCount, error: userErr } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        // 2. Tổng Essay & Lấy dữ liệu tính điểm TB
        const { data: essayData, error: essayErr } = await supabase
          .from("submissions")
          .select("score, created_at");

        if (userErr || essayErr) throw new Error("Error fetching stats");

        const totalEssays = essayData?.length || 0;
        
        // Tính điểm trung bình
        const totalScore = essayData?.reduce((acc, curr) => acc + (curr.score || 0), 0) || 0;
        const avgScore = totalEssays > 0 ? (totalScore / totalEssays).toFixed(1) : "0.0";

        // 3. Xử lý dữ liệu biểu đồ (7 ngày gần nhất)
        // Tạo map 7 ngày qua với giá trị 0
        const last7Days = [...Array(7)].map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().split('T')[0]; // YYYY-MM-DD
        }).reverse();

        const chartMap: Record<string, number> = {};
        last7Days.forEach(day => chartMap[day] = 0);

        // Đổ dữ liệu thật vào
        essayData?.forEach(item => {
          const date = item.created_at.split('T')[0];
          if (chartMap[date] !== undefined) {
            chartMap[date] += 1;
          }
        });

        const chartData = Object.entries(chartMap).map(([date, count]) => ({
          date: date.slice(5), // Lấy MM-DD cho gọn
          count: count
        }));

        // 4. Lấy 5 bài nộp mới nhất (Kèm email user)
        const { data: recentSubs } = await supabase
          .from("submissions")
          .select(`
            id, score, created_at,
            profiles (email)
          `)
          .order("created_at", { ascending: false })
          .limit(5);

        setStats({
          totalUsers: userCount || 0,
          totalEssays: totalEssays,
          avgScore: Number(avgScore),
          chartData: chartData,
          recentSubmissions: recentSubs || []
        });

      } catch (error) {
        console.error("Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-xl w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[1,2,3].map(i => <div key={i} className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl"></div>)}
        </div>
        <div className="h-64 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-slate-500 font-medium">Welcome back, Admin.</p>
        </div>
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-emerald-200 shadow-sm">
            <ShieldCheck size={14}/> System Operational
        </div>
      </div>
      
      {/* 1. STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Users */}
        <div className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/20 transition-all group">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-gradient-to-br from-cyan-50 to-cyan-100 text-cyan-600 rounded-xl group-hover:from-cyan-500 group-hover:to-cyan-600 group-hover:text-white transition-all shadow-sm group-hover:shadow-lg group-hover:shadow-cyan-500/30">
                <Users size={24}/>
             </div>
             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
          </div>
          <h3 className="text-4xl font-black text-slate-800">{stats.totalUsers}</h3>
          <p className="text-sm text-slate-500 mt-2 flex items-center gap-1">
             Active accounts <ArrowUpRight size={14} className="text-emerald-500"/>
          </p>
        </div>

        {/* Total Essays */}
        <div className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/20 transition-all group">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 rounded-xl group-hover:from-blue-500 group-hover:to-blue-600 group-hover:text-white transition-all shadow-sm group-hover:shadow-lg group-hover:shadow-blue-500/30">
                <FileText size={24}/>
             </div>
             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Essays Analyzed</span>
          </div>
          <h3 className="text-4xl font-black text-slate-800">{stats.totalEssays}</h3>
          <p className="text-sm text-slate-500 mt-2 flex items-center gap-1">
             Processing requests <Activity size={14} className="text-blue-500"/>
          </p>
        </div>

        {/* Avg Score */}
        <div className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/20 transition-all group">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 rounded-xl group-hover:from-emerald-500 group-hover:to-emerald-600 group-hover:text-white transition-all shadow-sm group-hover:shadow-lg group-hover:shadow-emerald-500/30">
                <TrendingUp size={24}/>
             </div>
             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg. Score</span>
          </div>
          <h3 className="text-4xl font-black text-slate-800">{stats.avgScore}</h3>
          <p className="text-sm text-slate-500 mt-2 flex items-center gap-1">
             Overall performance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 2. MAIN CHART */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Calendar className="text-cyan-500" size={20}/> Submissions (Last 7 Days)
                </h3>
             </div>
             <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 12}} 
                        dy={10}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 12}} 
                    />
                    <Tooltip 
                        cursor={{fill: '#f8fafc'}}
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    />
                    <Bar 
                        dataKey="count" 
                        fill="#06b6d4" 
                        radius={[8, 8, 0, 0]} 
                        barSize={40} 
                        activeBar={{ fill: '#0891b2' }}
                    />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* 3. RECENT ACTIVITY LIST */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 flex flex-col">
             <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Activity className="text-cyan-500" size={20}/> Recent Activity
             </h3>
             <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {stats.recentSubmissions.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-10">No recent submissions.</p>
                ) : (
                    stats.recentSubmissions.map((sub) => (
                        <div key={sub.id} className="flex items-center justify-between p-3 hover:bg-gradient-to-r hover:from-slate-50 hover:to-cyan-50/30 rounded-xl transition-all border border-transparent hover:border-cyan-100">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${
                                    sub.score >= 6.0 ? "bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700" : "bg-gradient-to-br from-cyan-100 to-cyan-200 text-cyan-700"
                                }`}>
                                    {sub.score}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700 truncate w-32">
                                        {/* @ts-ignore - Supabase join returns array or object depending on relation */}
                                        {sub.profiles?.email || "Unknown User"}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {new Date(sub.created_at).toLocaleDateString()} • {new Date(sub.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
             </div>
          </div>
      </div>
    </div>
  );
}