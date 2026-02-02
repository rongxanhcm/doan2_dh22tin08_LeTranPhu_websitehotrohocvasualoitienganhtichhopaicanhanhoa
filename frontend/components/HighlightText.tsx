"use client";

import { useState } from "react";

interface HighlightTextProps {
  text: string;
  errors: any[];
}

export default function HighlightText({ text, errors }: HighlightTextProps) {
  const renderHighlightedText = () => {
    if (!text || !errors || errors.length === 0) return text;

    const segments: any[] = [];
    let lastIndex = 0;

    // Sắp xếp lỗi và lọc lỗi không tìm thấy
    const sortedErrors = errors
      .map(err => {
        // [Safety Check] Đảm bảo quote tồn tại và là chuỗi
        if (!err.quote || typeof err.quote !== 'string') return { ...err, index: -1 };
        const index = text.indexOf(err.quote);
        return { ...err, index };
      })
      .filter(err => err.index !== -1)
      .sort((a, b) => a.index - b.index);

    sortedErrors.forEach((err) => {
      const startIndex = err.index;
      const endIndex = startIndex + err.quote.length;

      // Bỏ qua nếu lỗi chồng chéo (Overlap)
      if (startIndex < lastIndex) return;

      // Thêm text thường
      if (startIndex > lastIndex) {
        segments.push({
          text: text.slice(lastIndex, startIndex),
          isError: false,
        });
      }

      // Thêm text lỗi
      segments.push({
        text: text.slice(startIndex, endIndex),
        isError: true,
        data: err,
      });

      lastIndex = endIndex;
    });

    // Thêm phần còn lại
    if (lastIndex < text.length) {
      segments.push({
        text: text.slice(lastIndex),
        isError: false,
      });
    }

    return segments.map((seg, idx) => {
      // 1. Text thường
      if (!seg.isError) return <span key={idx}>{seg.text}</span>;

      // 2. Text lỗi (Đã tối ưu giao diện)
      return (
        <span key={idx} className="relative group/error cursor-pointer inline"> 
          
          {/* [STYLE HIGHLIGHT] 
             - box-decoration-clone: Giúp highlight đẹp khi xuống dòng
             - px-1: Thêm chút đệm ngang cho thoáng
          */}
          <span className="box-decoration-clone bg-red-100 text-red-800 border-b-2 border-red-400 font-medium px-1 rounded-sm transition-colors group-hover/error:bg-red-200 group-hover/error:border-red-600 pb-0.5">
            {seg.text}
          </span>

          {/* [STYLE TOOLTIP]
             - min-w-[250px]: Làm hộp thoại rộng hơn
             - text-sm: Chữ to hơn bản cũ (text-xs)
          */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 
            w-max max-w-[280px] min-w-[200px]
            bg-slate-800 text-white text-sm p-4 rounded-xl shadow-2xl border border-slate-700
            opacity-0 invisible group-hover/error:opacity-100 group-hover/error:visible 
            transition-all duration-200 z-[9999] pointer-events-none transform translate-y-2 group-hover/error:translate-y-0 text-left leading-snug">
            
            {/* Mũi tên */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800"></div>
            
            {/* Header: Tên lỗi */}
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-600/50">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                <span className="font-bold text-red-200 uppercase text-xs tracking-wider">
                    {seg.data.error_type}
                </span>
            </div>
            
            {/* Gợi ý sửa: To và rõ ràng */}
            <div className="text-emerald-300 font-medium">
               <span className="text-slate-400 mr-1 text-xs uppercase font-bold">Fix:</span>
               <span className="bg-emerald-500/10 px-1 py-0.5 rounded text-emerald-200">
                  {seg.data.suggestion}
               </span>
            </div>
          </div>
        </span>
      );
    });
  };

  return (
    // [FONT & SIZE]: Chuyển sang font-sans, text-xl, leading-loose
    <div className="whitespace-pre-wrap font-sans text-xl leading-loose text-slate-700 tracking-wide">
      {renderHighlightedText()}
    </div>
  );
}