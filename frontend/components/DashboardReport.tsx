"use client";

import React, { forwardRef } from "react";
import { TrendingUp, Calendar, Award, Target, Zap, FileText } from "lucide-react";

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
    title: "Progress Report",
    subtitle: "Writing Analysis",
    tagline: "Professional Performance Review",
    total_essays: "Total Essays",
    avg_score: "Average Score",
    highest_score: "Highest Score",
    chart_title: "Score Trajectory",
    table_title: "Recent Submissions",
    no_feedback: "No feedback available",
    footer: "AI-Powered Writing Analysis • Wrytt Pro",
    date_label: "Date",
    score_label: "Writing Score",
    feedback_label: "Feedback"
  },
  vi: {
    title: "Báo Cáo Tiến Độ",
    subtitle: "Phân Tích Writing",
    tagline: "Đánh Giá Hiệu Suất Chuyên Nghiệp",
    total_essays: "Tổng Số Bài",
    avg_score: "Điểm Trung Bình",
    highest_score: "Điểm Cao Nhất",
    chart_title: "Quỹ Đạo Điểm Số",
    table_title: "Bài Nộp Gần Đây",
    no_feedback: "Chưa có nhận xét",
    footer: "Phân Tích Bài Viết AI • Wrytt Pro",
    date_label: "Ngày",
    score_label: "Writing Score",
    feedback_label: "Nhận xét"
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

    const getScoreColor = (score: number) => {
      if (score >= 7.5) return "#1F7883"; // brand dark
      if (score >= 6.5) return "#378F96"; // brand primary
      return "#64748b"; // slate-500
    };

    const getScoreBg = (score: number) => {
      if (score >= 7.5) return "#e6f3f4"; // brand light
      if (score >= 6.5) return "#f0f8f9"; // brand lighter
      return "#f8fafc"; // slate-50
    };

    return (
      <div 
        ref={ref} 
        style={{ 
            backgroundColor: "#ffffff", 
            color: "#0f172a",
            width: "210mm",
            minHeight: "297mm",
            padding: "48px",
            fontFamily: "Segoe UI, Arial, sans-serif",
            fontSize: "12px",
            lineHeight: 1.35,
            position: "relative",
            boxSizing: "border-box"
        }}
      >
        {/* Decorative Background Pattern */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          opacity: 0.3,
          pointerEvents: "none"
        }} />

        {/* HEADER */}
        <div style={{ 
          position: "relative", 
          zIndex: 1,
          marginBottom: "48px",
          paddingBottom: "32px",
          borderBottom: "2px solid #e2e8f0"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div style={{ 
                  width: "48px", 
                  height: "48px", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center"
                }}>
                  <img
                    src="/logo.svg"
                    alt="Wrytt Logo"
                    width={48}
                    height={48}
                    style={{ display: "block" }}
                  />
                </div>
                <div>
                  <div style={{ 
                    fontSize: "10px", 
                    fontWeight: 900, 
                    letterSpacing: "0.15em", 
                    color: "#378F96",
                    marginBottom: "4px"
                  }}>
                    WRYTT PRO
                  </div>
                  <div style={{ 
                    fontSize: "12px", 
                    fontWeight: 700, 
                    letterSpacing: "0.05em", 
                    color: "#64748b"
                  }}>
                    {t.tagline}
                  </div>
                </div>
              </div>
              <h1 style={{ 
                fontSize: "36px", 
                fontWeight: 900, 
                color: "#0f172a", 
                margin: "0 0 8px 0",
                letterSpacing: "-0.02em"
              }}>
                {t.title}
              </h1>
              <p style={{ 
                color: "#64748b", 
                fontWeight: 600, 
                fontSize: "17px", 
                margin: 0 
              }}>
                {t.subtitle}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ 
                fontSize: "16px", 
                fontWeight: 700, 
                color: "#0f172a", 
                margin: "0 0 6px 0" 
              }}>
                {userEmail.split('@')[0]}
              </p>
              <p style={{ 
                fontSize: "12px", 
                color: "#94a3b8", 
                fontWeight: 600,
                letterSpacing: "0.02em"
              }}>
                {currentDate}
              </p>
            </div>
          </div>
        </div>

        {/* OVERVIEW CARDS */}
        <div style={{ 
          position: "relative",
          zIndex: 1,
          display: "grid", 
          gridTemplateColumns: "repeat(3, 1fr)", 
          gap: "20px", 
          marginBottom: "48px" 
        }}>
          {[
            { label: t.total_essays, value: stats.totalEssays, icon: <FileText size={18}/>, color: "#64748b" },
            { label: t.avg_score, value: stats.avgScore, icon: <TrendingUp size={18}/>, color: "#378F96", isScore: true },
            { label: t.highest_score, value: stats.highestScore, icon: <Award size={18}/>, color: "#378F96", isScore: true }
          ].map((card, idx) => (
            <div key={idx} style={{ 
              backgroundColor: "#ffffff", 
              padding: "24px", 
              borderRadius: "16px", 
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
            }}>
              <div style={{ 
                width: "40px",
                height: "40px",
                backgroundColor: idx === 0 ? "#f8fafc" : "#f0f8f9",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
                border: `1px solid ${idx === 0 ? "#e2e8f0" : "#d6eaec"}`,
                color: card.color
              }}>
                {card.icon}
              </div>
              <p style={{ 
                fontSize: "10px", 
                fontWeight: 900, 
                letterSpacing: "0.1em", 
                color: "#94a3b8",
                textTransform: "uppercase",
                marginBottom: "8px"
              }}>
                {card.label}
              </p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                <p style={{ 
                  fontSize: "32px", 
                  fontWeight: 900, 
                  color: "#0f172a", 
                  margin: 0,
                  letterSpacing: "-0.02em"
                }}>
                  {card.value}
                </p>
                {card.isScore && (
                  <span style={{ 
                    color: "#94a3b8", 
                    fontWeight: 700, 
                    fontSize: "13px" 
                  }}>
                    / 9.0
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* SCORE CHART */}
        <div style={{ 
          position: "relative",
          zIndex: 1,
          backgroundColor: "#0f172a", 
          borderRadius: "20px", 
          padding: "36px", 
          marginBottom: "48px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "32px"
          }}>
            <Zap size={16} color="#378F96" />
            <h2 style={{ 
              color: "#ffffff", 
              fontSize: "12px", 
              fontWeight: 900, 
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              margin: 0
            }}>
              {t.chart_title}
            </h2>
          </div>
          
          <div style={{ 
            height: "200px", 
            display: "flex", 
            alignItems: "flex-end", 
            justifyContent: "space-between", 
            gap: "16px",
            padding: "0 8px"
          }}>
            {chartData.map((d, idx) => (
              <div key={idx} style={{ 
                flex: 1, 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                height: "100%" 
              }}>
                <div style={{ 
                  flex: 1, 
                  width: "100%", 
                  display: "flex", 
                  alignItems: "flex-end", 
                  justifyContent: "center", 
                  marginBottom: "12px" 
                }}>
                  <div style={{ 
                    height: `${Math.max((d.score / 9) * 100, 8)}%`, 
                    width: "100%",
                    maxWidth: "36px",
                    background: d.score >= 7 
                      ? "linear-gradient(to top, #1F7883, #378F96)" 
                      : "linear-gradient(to top, #475569, #64748b)",
                    borderRadius: "8px 8px 4px 4px",
                    position: "relative",
                    boxShadow: d.score >= 7 
                      ? "0 4px 12px rgba(55, 143, 150, 0.3)"
                      : "0 2px 6px rgba(71, 85, 105, 0.2)"
                  }}>
                    <div style={{ 
                      position: "absolute", 
                      top: "-28px", 
                      left: "50%", 
                      transform: "translateX(-50%)", 
                      fontSize: "13px", 
                      fontWeight: 900, 
                      color: "#ffffff",
                      whiteSpace: "nowrap"
                    }}>
                      {d.score.toFixed(1)}
                    </div>
                  </div>
                </div>
                <span style={{ 
                  fontSize: "10px", 
                  fontWeight: 700, 
                  color: "#64748b",
                  letterSpacing: "0.03em"
                }}>
                  {d.date}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT SUBMISSIONS */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ 
            fontSize: "12px", 
            fontWeight: 900, 
            color: "#94a3b8", 
            letterSpacing: "0.1em", 
            textTransform: "uppercase", 
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <FileText size={14} />
            {t.table_title}
          </h2>
          
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: "16px" 
          }}>
            {recentSubs.slice(0, 4).map((sub, i) => {
              const scoreColor = getScoreColor(sub.score);
              const scoreBg = getScoreBg(sub.score);
              
              return (
                <div key={i} style={{ 
                  display: "flex", 
                  flexDirection: "column",
                  gap: "8px", 
                  padding: "16px 20px", 
                  borderRadius: "12px", 
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}>
                    <div style={{ 
                      fontSize: "9px", 
                      fontWeight: 800, 
                      color: "#64748b", 
                      letterSpacing: "0.06em",
                      textTransform: "uppercase"
                    }}>
                      {new Date(sub.created_at).toLocaleDateString(dateLocale, { 
                        day: '2-digit', 
                        month: 'short',
                        year: '2-digit'
                      })}
                    </div>
                    
                    <div style={{
                      backgroundColor: scoreBg,
                      color: scoreColor,
                      fontSize: "11px",
                      fontWeight: 900,
                      padding: "4px 10px",
                      borderRadius: "8px",
                      border: `1px solid ${scoreColor}20`,
                      minWidth: "52px",
                      textAlign: "center"
                    }}>
                      {sub.score.toFixed(1)}
                    </div>
                  </div>
                  
                  <div>
                    <p style={{ 
                      fontSize: "13px", 
                      color: "#475569", 
                      margin: 0,
                      lineHeight: "1.75"
                    }}>
                      {sub.general_feedback || t.no_feedback}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ 
          position: "absolute", 
          bottom: "32px", 
          left: "48px", 
          right: "48px", 
          paddingTop: "24px", 
          borderTop: "1px solid #e2e8f0", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          fontSize: "10px", 
          fontWeight: 700, 
          color: "#94a3b8",
          letterSpacing: "0.05em"
        }}>
          <span>{t.footer}</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span>POWERED BY</span>
            <span style={{ 
              color: "#378F96", 
              fontWeight: 900,
              letterSpacing: "0.08em"
            }}>
              WRYTT
            </span>
          </div>
        </div>
      </div>
    );
  }
);

DashboardReport.displayName = "DashboardReport";
export default DashboardReport;