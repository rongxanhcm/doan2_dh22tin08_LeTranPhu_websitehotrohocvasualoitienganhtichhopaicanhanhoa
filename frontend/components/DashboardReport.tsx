import React, { forwardRef } from "react";
// Lưu ý: Không cần import icon nếu không dùng
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
  language?: string; // [MỚI] Nhận ngôn ngữ từ trang cha (mặc định 'en' hoặc 'vi')
}

// [MỚI] TỪ ĐIỂN DỊCH THUẬT CHO BÁO CÁO
const TRANSLATIONS: any = {
  en: {
    title: "Progress Report",
    subtitle: "CoreFix AI Learning System",
    generated_on: "Generated on",
    overview_title: "Performance Overview",
    total_essays: "TOTAL ESSAYS",
    avg_score: "AVERAGE SCORE",
    highest_score: "HIGHEST SCORE",
    chart_title: "Growth Chart (Recent)",
    chart_note: "Chart shows scores of recent submissions (Band 0-9.0)",
    table_title: "Submission Details",
    col_date: "Date",
    col_score: "Score",
    col_feedback: "General Feedback",
    no_feedback: "No feedback recorded",
    no_data_chart: "Not enough data to display chart",
    footer_left: "CoreFix AI - Automated Education System",
    footer_right: "Generated via CoreFix Dashboard"
  },
  vi: {
    title: "Báo Cáo Tiến Độ",
    subtitle: "Hệ thống Học tập CoreFix AI",
    generated_on: "Ngày xuất",
    overview_title: "Tổng Quan Hiệu Suất",
    total_essays: "TỔNG SỐ BÀI",
    avg_score: "ĐIỂM TRUNG BÌNH",
    highest_score: "ĐIỂM CAO NHẤT",
    chart_title: "Biểu Đồ Tăng Trưởng (Gần đây)",
    chart_note: "Biểu đồ thể hiện điểm số của các bài nộp gần đây (Thang điểm 9.0)",
    table_title: "Chi Tiết Các Bài Nộp",
    col_date: "Ngày nộp",
    col_score: "Điểm số",
    col_feedback: "Đánh giá chung",
    no_feedback: "Chưa có nhận xét",
    no_data_chart: "Chưa có đủ dữ liệu để vẽ biểu đồ",
    footer_left: "CoreFix AI - Hệ thống Giáo dục Tự động",
    footer_right: "Xuất từ CoreFix Dashboard"
  }
};

const DashboardReport = forwardRef<HTMLDivElement, ReportProps>(
  ({ userEmail, stats, recentSubs, chartData, language = "en" }, ref) => {
    
    // 1. Chọn từ điển dựa trên ngôn ngữ (fallback về 'en' nếu không tìm thấy)
    const t = TRANSLATIONS[language] || TRANSLATIONS["en"];
    
    // 2. Format ngày tháng theo ngôn ngữ
    // Nếu là 'vi' thì dùng 'vi-VN', ngược lại dùng 'en-US'
    const dateLocale = language === "vi" ? "vi-VN" : "en-US";
    const currentDate = new Date().toLocaleDateString(dateLocale, {
      day: "numeric", 
      month: "long", 
      year: "numeric"
    });

    return (
      <div 
        ref={ref} 
        // Ép nền trắng và chữ đen bằng mã HEX cứng
        className="w-[210mm] min-h-[297mm] bg-[#ffffff] p-12 text-[#0f172a] font-sans relative"
        style={{ backgroundColor: "#ffffff", color: "#0f172a" }}
      >
        
        {/* HEADER */}
        <div className="flex justify-between items-start border-b-2 border-[#0f172a] pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-black text-[#4338ca] tracking-tight uppercase">{t.title}</h1>
            <p className="text-[#64748b] font-medium mt-1">{t.subtitle}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-[#0f172a]">{userEmail}</p>
            <p className="text-sm text-[#64748b]">{t.generated_on}: {currentDate}</p>
          </div>
        </div>

        {/* 1. OVERVIEW CARDS */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-[#334155] mb-4 flex items-center gap-2">
            <TrendingUp size={20} color="#334155"/> {t.overview_title}
          </h2>
          <div className="grid grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0]">
                <span className="text-xs text-[#64748b] uppercase font-bold">{t.total_essays}</span>
                <p className="text-3xl font-black text-[#1e293b] mt-1">{stats.totalEssays}</p>
            </div>
            {/* Card 2 */}
            <div className="bg-[#eef2ff] p-4 rounded-xl border border-[#e0e7ff]">
                <span className="text-xs text-[#6366f1] uppercase font-bold">{t.avg_score}</span>
                <p className="text-3xl font-black text-[#4338ca] mt-1">{stats.avgScore}</p>
            </div>
            {/* Card 3 */}
            <div className="bg-[#ecfdf5] p-4 rounded-xl border border-[#d1fae5]">
                <span className="text-xs text-[#10b981] uppercase font-bold">{t.highest_score}</span>
                <p className="text-3xl font-black text-[#047857] mt-1">{stats.highestScore}</p>
            </div>
          </div>
        </div>

        {/* 2. GROWTH CHART */}
        <div className="mb-10">
           <h2 className="text-lg font-bold text-[#334155] mb-6 flex items-center gap-2">
            <ActivityIcon /> {t.chart_title}
          </h2>
          <div className="h-64 flex items-end justify-between gap-4 border-b border-[#cbd5e1] pb-2 px-4">
             {chartData.length === 0 ? (
                <div className="w-full text-center text-[#94a3b8] italic">{t.no_data_chart}</div>
             ) : (
                 chartData.map((d, idx) => (
                    <div key={idx} className="flex flex-col items-center flex-1 group">
                        <div className="relative w-full flex justify-center items-end h-48">
                             {/* Cột điểm */}
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
          <p className="text-xs text-center text-[#94a3b8] mt-2 italic">{t.chart_note}</p>
        </div>

        {/* 3. RECENT ACTIVITY TABLE (Đã fix layout) */}
        <div>
           <h2 className="text-lg font-bold text-[#334155] mb-4 flex items-center gap-2">
            <Calendar size={20} color="#334155"/> {t.table_title}
          </h2>
          <table className="w-full text-left text-sm border-collapse table-fixed">
            <thead>
                <tr className="bg-[#f1f5f9] text-[#475569]">
                    <th className="p-3 font-bold border-b border-[#e2e8f0] w-[15%]">{t.col_date}</th>
                    <th className="p-3 font-bold border-b border-[#e2e8f0] w-[15%]">{t.col_score}</th>
                    <th className="p-3 font-bold border-b border-[#e2e8f0] w-[70%]">{t.col_feedback}</th>
                </tr>
            </thead>
            <tbody>
                {recentSubs.slice(0, 8).map((sub, i) => (
                    <tr key={i} className="border-b border-[#f1f5f9]">
                        <td className="p-3 text-[#475569] align-top">
                            {new Date(sub.created_at).toLocaleDateString(dateLocale)}
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
                        <td className="p-3 text-[#64748b] italic whitespace-normal leading-relaxed">
                            {sub.general_feedback || t.no_feedback}
                        </td>
                    </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="absolute bottom-12 left-12 right-12 border-t border-[#e2e8f0] pt-4 flex justify-between text-xs text-[#94a3b8]">
            <span>{t.footer_left}</span>
            <span>{t.footer_right}</span>
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