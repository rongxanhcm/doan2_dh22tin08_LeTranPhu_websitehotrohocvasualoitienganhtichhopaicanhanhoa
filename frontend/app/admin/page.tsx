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
        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[1,2,3].map(i => <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>)}
        </div>
        <div className="h-64 bg-slate-200 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-slate-500 font-medium">Welcome back, Admin.</p>
        </div>
        <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
            <ShieldCheck size={14}/> System Operational
        </div>
      </div>
      
      {/* 1. STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Users */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:-translate-y-1 transition-transform group">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Users size={24}/>
             </div>
             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
          </div>
          <h3 className="text-4xl font-black text-slate-800">{stats.totalUsers}</h3>
          <p className="text-sm text-slate-400 mt-1 flex items-center gap-1">
             Active accounts <ArrowUpRight size={14} className="text-emerald-500"/>
          </p>
        </div>

        {/* Total Essays */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:-translate-y-1 transition-transform group">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <FileText size={24}/>
             </div>
             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Essays Analyzed</span>
          </div>
          <h3 className="text-4xl font-black text-slate-800">{stats.totalEssays}</h3>
          <p className="text-sm text-slate-400 mt-1 flex items-center gap-1">
             Processing requests <Activity size={14} className="text-indigo-500"/>
          </p>
        </div>

        {/* Avg Score */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:-translate-y-1 transition-transform group">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <TrendingUp size={24}/>
             </div>
             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg. Score</span>
          </div>
          <h3 className="text-4xl font-black text-slate-800">{stats.avgScore}</h3>
          <p className="text-sm text-slate-400 mt-1 flex items-center gap-1">
             Overall performance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 2. MAIN CHART */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Calendar className="text-slate-400" size={20}/> Submissions (Last 7 Days)
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
                        fill="#4f46e5" 
                        radius={[6, 6, 0, 0]} 
                        barSize={40} 
                        activeBar={{ fill: '#4338ca' }}
                    />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* 3. RECENT ACTIVITY LIST */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
             <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Activity</h3>
             <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {stats.recentSubmissions.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-10">No recent submissions.</p>
                ) : (
                    stats.recentSubmissions.map((sub) => (
                        <div key={sub.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                                    sub.score >= 6.0 ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100 text-indigo-700"
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