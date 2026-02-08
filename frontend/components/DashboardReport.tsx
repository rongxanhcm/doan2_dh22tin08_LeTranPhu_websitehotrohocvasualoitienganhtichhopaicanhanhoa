import React, { forwardRef } from "react";
// Lưu ý: Không cần import icon nếu không dùng, hoặc giữ nguyên nếu muốn
import { TrendingUp, Calendar } from "lucide-react";

interface ReportProps {
  userEmail: string;
  stats: {
    totalEssays: number;
    avgScore: number;
    highestScore: number;
  };
  recentSubs: any[];
  chartData: { date: string; score: number }[];
}

const DashboardReport = forwardRef<HTMLDivElement, ReportProps>(
  ({ userEmail, stats, recentSubs, chartData }, ref) => {
    
    const currentDate = new Date().toLocaleDateString("vi-VN", {
      day: "numeric", 
      month: "long", 
      year: "numeric"
    });

    // MÃ MÀU HEX AN TOÀN (Safe Colors)
    // Indigo-700 -> #4338ca
    // Slate-900 -> #0f172a
    // Slate-500 -> #64748b
    // ...

    return (
      <div 
        ref={ref} 
        // [QUAN TRỌNG] Ép nền trắng và chữ đen bằng mã HEX cứng
        className="w-[210mm] min-h-[297mm] bg-[#ffffff] p-12 text-[#0f172a] font-sans relative"
        style={{ backgroundColor: "#ffffff", color: "#0f172a" }}
      >
        
        {/* HEADER */}
        <div className="flex justify-between items-start border-b-2 border-[#0f172a] pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-black text-[#4338ca] tracking-tight uppercase">Báo Cáo Tiến Độ</h1>
            <p className="text-[#64748b] font-medium mt-1">CoreFix AI Learning System</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-[#0f172a]">{userEmail}</p>
            <p className="text-sm text-[#64748b]">Ngày xuất: {currentDate}</p>
          </div>
        </div>

        {/* 1. OVERVIEW CARDS */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-[#334155] mb-4 flex items-center gap-2">
            <TrendingUp size={20} color="#334155"/> Tổng Quan Hiệu Suất
          </h2>
          <div className="grid grid-cols-3 gap-6">
            {/* Card 1: Slate */}
            <div className="bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0]">
                <span className="text-xs text-[#64748b] uppercase font-bold">Tổng số bài</span>
                <p className="text-3xl font-black text-[#1e293b] mt-1">{stats.totalEssays}</p>
            </div>
            {/* Card 2: Indigo */}
            <div className="bg-[#eef2ff] p-4 rounded-xl border border-[#e0e7ff]">
                <span className="text-xs text-[#6366f1] uppercase font-bold">Điểm Trung Bình</span>
                <p className="text-3xl font-black text-[#4338ca] mt-1">{stats.avgScore}</p>
            </div>
            {/* Card 3: Emerald */}
            <div className="bg-[#ecfdf5] p-4 rounded-xl border border-[#d1fae5]">
                <span className="text-xs text-[#10b981] uppercase font-bold">Điểm Cao Nhất</span>
                <p className="text-3xl font-black text-[#047857] mt-1">{stats.highestScore}</p>
            </div>
          </div>
        </div>

        {/* 2. GROWTH CHART */}
        <div className="mb-10">
           <h2 className="text-lg font-bold text-[#334155] mb-6 flex items-center gap-2">
            <ActivityIcon /> Biểu Đồ Tăng Trưởng (Gần đây)
          </h2>
          <div className="h-64 flex items-end justify-between gap-4 border-b border-[#cbd5e1] pb-2 px-4">
             {chartData.length === 0 ? (
                <div className="w-full text-center text-[#94a3b8] italic">Chưa có đủ dữ liệu để vẽ biểu đồ</div>
             ) : (
                 chartData.map((d, idx) => (
                    <div key={idx} className="flex flex-col items-center flex-1 group">
                        <div className="relative w-full flex justify-center items-end h-48">
                             {/* Cột điểm: Dùng HEX cứng cho bg */}
                             <div 
                                style={{ height: `${(d.score / 9) * 100}%` }} 
                                className={`w-8 rounded-t-md transition-all ${d.score >= 6.0 ? 'bg-[#4f46e5]' : 'bg-[#94a3b8]'}`}
                             >
                             </div>
                             <span className="absolute -top-6 text-xs font-bold text-[#475569]">{d.score}</span>
                        </div>
                        <span className="text-[10px] text-[#64748b] mt-2 font-medium truncate w-full text-center">
                            {d.date}
                        </span>
                    </div>
                 ))
             )}
          </div>
          <p className="text-xs text-center text-[#94a3b8] mt-2 italic">Biểu đồ thể hiện điểm số của các bài nộp gần đây (Thang điểm 9.0)</p>
        </div>
        {/* 3. RECENT ACTIVITY TABLE */}
        <div>
        <h2 className="text-lg font-bold text-[#334155] mb-4 flex items-center gap-2">
            <Calendar size={20} color="#334155"/> Chi Tiết Các Bài Nộp
        </h2>
        <table className="w-full text-left text-sm border-collapse table-fixed">
            <thead>
                <tr className="bg-[#f1f5f9] text-[#475569]">
                    <th className="p-3 font-bold border-b border-[#e2e8f0] w-[15%]">Ngày nộp</th>
                    <th className="p-3 font-bold border-b border-[#e2e8f0] w-[15%]">Điểm số</th>
                    <th className="p-3 font-bold border-b border-[#e2e8f0] w-[70%]">Đánh giá chung</th>
                </tr>
            </thead>
            <tbody>
                {recentSubs.slice(0, 8).map((sub, i) => (
                    <tr key={i} className="border-b border-[#f1f5f9]">
                        <td className="p-3 text-[#475569] align-top">
                            {new Date(sub.created_at).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="p-3 font-bold align-top">
                            <span className={`px-2 py-1 rounded ${
                                sub.score >= 6 
                                ? 'bg-[#d1fae5] text-[#047857]' 
                                : 'bg-[#f1f5f9] text-[#334155]'
                            }`}>
                                {sub.score}
                            </span>
                        </td>
                        {/* BỎ 'truncate' và 'max-w-xs'. 
                        THÊM 'whitespace-normal' và 'leading-relaxed' để chữ tự xuống dòng đẹp hơn.
                        */}
                        <td className="p-3 text-[#64748b] italic whitespace-normal leading-relaxed">
                            {sub.general_feedback || "No feedback recorded"}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        </div>
        {/* FOOTER */}
        <div className="absolute bottom-12 left-12 right-12 border-t border-[#e2e8f0] pt-4 flex justify-between text-xs text-[#94a3b8]">
            <span>CoreFix AI - Automated Education System</span>
            <span>Generated via CoreFix Dashboard</span>
        </div>
      </div>
    );
  }
);

DashboardReport.displayName = "DashboardReport";

const ActivityIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
)

export default DashboardReport;