"use client";

import { Users, FileText, CheckCircle } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl"><Users size={24}/></div>
          <div>
            <p className="text-slate-500 text-sm font-bold">Total Users</p>
            <h3 className="text-2xl font-black">1,240</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl"><FileText size={24}/></div>
          <div>
            <p className="text-slate-500 text-sm font-bold">Essays Analyzed</p>
            <h3 className="text-2xl font-black">8,532</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle size={24}/></div>
          <div>
            <p className="text-slate-500 text-sm font-bold">System Status</p>
            <h3 className="text-lg font-black text-emerald-600">Operational</h3>
          </div>
        </div>
      </div>

      <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 py-20">
        Chart placeholder...
      </div>
    </div>
  );
}