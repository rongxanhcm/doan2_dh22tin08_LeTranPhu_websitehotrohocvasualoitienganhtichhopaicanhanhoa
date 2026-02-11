"use client";

import React, { forwardRef } from "react";
import { TrendingUp, Calendar, Crown, Award, Target, Zap } from "lucide-react";

interface ReportProps {
  userEmail: string;
  stats: {
    totalEssays: number;
    avgScore: number;
    highestScore: number;
  };
  recentSubs: any[];
  chartData: { date: string; score: number }[];
  language?: string;
}

const TRANSLATIONS: any = {
  en: {
    title: "Intelligence Report",
    subtitle: "IELTS Progress Analysis",
    total_essays: "Essays Analyzed",
    avg_score: "Mean Band Score",
    highest_score: "Peak Performance",
    chart_title: "Growth Trajectory",
    table_title: "Recent Evaluations",
    no_feedback: "No feedback recorded",
    footer: "Confidential AI-Generated Progress Report • CoreFix Ultimate"
  },
  vi: {
    title: "Báo Cáo Trí Tuệ",
    subtitle: "Phân Tích Tiến Độ IELTS",
    total_essays: "Bài Đã Phân Tích",
    avg_score: "Điểm Số Trung Bình",
    highest_score: "Thành Tích Cao Nhất",
    chart_title: "Quỹ Đạo Tăng Trưởng",
    table_title: "Lịch Sử Đánh Giá",
    no_feedback: "Chưa có nhận xét",
    footer: "Báo Cáo Tiến Độ Tự Động • Hệ Thống CoreFix Ultimate"
  }
};

const DashboardReport = forwardRef<HTMLDivElement, ReportProps>(
  ({ userEmail, stats, recentSubs, chartData, language = "en" }, ref) => {
    const t = TRANSLATIONS[language] || TRANSLATIONS["en"];
    const dateLocale = language === "vi" ? "vi-VN" : "en-US";
    const currentDate = new Date().toLocaleDateString(dateLocale, {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    const getStatus = (score: number) => {
      if (score >= 7.5) return { label: "EXCELLENT", color: "#059669", bg: "#ecfdf5" };
      if (score >= 6.5) return { label: "GOOD", color: "#2563eb", bg: "#eff6ff" };
      return { label: "IMPROVING", color: "#4b5563", bg: "#f3f4f6" };
    };

    return (
      <div 
        ref={ref} 
        // Dùng inline style để đè hoàn toàn các hàm màu lạ
        style={{ 
            backgroundColor: "#ffffff", 
            color: "#0f172a",
            width: "210mm",
            minHeight: "297mm",
            padding: "60px",
            fontFamily: "sans-serif",
            position: "relative"
        }}
      >
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <div style={{ width: "32px", height: "32px", backgroundColor: "#4f46e5", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Crown size={18} color="#ffffff" />
              </div>
              <span style={{ fontSize: "10px", fontWeight: 900, letterSpacing: "2px", color: "#4f46e5" }}>ULTIMATE ANALYTICS</span>
            </div>
            <h1 style={{ fontSize: "32px", fontWeight: 900, color: "#0f172a", margin: 0 }}>{t.title}</h1>
            <p style={{ color: "#64748b", fontWeight: 500, fontSize: "18px", margin: "4px 0 0 0" }}>{t.subtitle}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "14px", fontWeight: 900, color: "#0f172a", margin: 0 }}>{userEmail}</p>
            <p style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 700, marginTop: "4px" }}>{currentDate}</p>
          </div>
        </div>

        {/* 1. OVERVIEW CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginBottom: "40px" }}>
          {[
            { label: t.total_essays, value: stats.totalEssays, icon: <Target size={16}/>, color: "#4f46e5", bg: "#f8fafc" },
            { label: t.avg_score, value: stats.avgScore, icon: <TrendingUp size={16}/>, color: "#4f46e5", bg: "#eff6ff" },
            { label: t.highest_score, value: stats.highestScore, icon: <Award size={16}/>, color: "#059669", bg: "#ecfdf5" }
          ].map((card, idx) => (
            <div key={idx} style={{ backgroundColor: card.bg, padding: "24px", borderRadius: "24px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: card.color }}>
                    {card.icon}
                    <span style={{ fontSize: "10px", fontWeight: 900, letterSpacing: "1px" }}>{card.label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                    <p style={{ fontSize: "40px", fontWeight: 900, color: "#0f172a", margin: 0 }}>{card.value}</p>
                    {card.label === t.avg_score && <span style={{ color: "#94a3b8", fontWeight: 700, fontSize: "14px" }}>/ 9.0</span>}
                </div>
            </div>
          ))}
        </div>

        {/* 2. GROWTH CHART (Sử dụng HEX màu tối thay cho lab/oklch) */}
        <div style={{ backgroundColor: "#0f172a", borderRadius: "32px", padding: "40px", marginBottom: "40px" }}>
          <h2 style={{ color: "#ffffff", fontSize: "12px", fontWeight: 900, letterSpacing: "2px", margin: "0 0 32px 0", display: "flex", alignItems: "center", gap: "8px" }}>
             <Zap size={14} color="#eab308" /> {t.chart_title}
          </h2>
          <div style={{ height: "180px", display: "flex", alignItems: "end", justifyContent: "space-between", gap: "20px" }}>
             {chartData.map((d, idx) => (
                <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
                    <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "end", justifyContent: "center", marginBottom: "12px" }}>
                        <div style={{ 
                            height: `${(d.score / 9) * 100}%`, 
                            width: "30px", 
                            backgroundColor: d.score >= 7 ? "#6366f1" : "#334155",
                            borderRadius: "8px 8px 2px 2px",
                            position: "relative"
                        }}>
                            <div style={{ position: "absolute", top: "-24px", left: "50%", transform: "translateX(-50%)", fontSize: "11px", fontWeight: 900, color: "#ffffff" }}>
                                {d.score}
                            </div>
                        </div>
                    </div>
                    <span style={{ fontSize: "9px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>{d.date}</span>
                </div>
             ))}
          </div>
        </div>

        {/* 3. RECENT ACTIVITY */}
        <div>
          <h2 style={{ fontSize: "12px", fontWeight: 900, color: "#94a3b8", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "20px" }}>{t.table_title}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {recentSubs.slice(0, 5).map((sub, i) => {
              const status = getStatus(sub.score);
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "20px", padding: "20px", borderRadius: "20px", border: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: "10px", fontWeight: 900, color: "#0f172a", minWidth: "50px" }}>
                    {new Date(sub.created_at).toLocaleDateString(dateLocale, { day: '2-digit', month: 'short' })}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "18px", fontWeight: 900, color: "#0f172a" }}>{sub.score}</span>
                      <span style={{ backgroundColor: status.bg, color: status.color, fontSize: "8px", fontWeight: 900, padding: "2px 8px", borderRadius: "10px" }}>
                        {status.label}
                      </span>
                    </div>
                    <p style={{ fontSize: "12px", color: "#64748b", fontStyle: "italic", margin: 0 }}>
                        "{sub.general_feedback || t.no_feedback}"
                    </p>
                  </div>
                  <div style={{ fontSize: "10px", fontWeight: 800, color: "#4f46e5" }}>ANALYSIS →</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ position: "absolute", bottom: "40px", left: "60px", right: "60px", paddingTop: "20px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", fontSize: "10px", fontWeight: 700, color: "#94a3b8" }}>
          <span>{t.footer}</span>
          <span>POWERED BY <strong style={{ color: "#4f46e5" }}>COREFIX AI</strong></span>
        </div>
      </div>
    );
  }
);

DashboardReport.displayName = "DashboardReport";
export default DashboardReport;