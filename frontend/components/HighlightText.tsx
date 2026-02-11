"use client";

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

    // Thêm phần text còn lại ở cuối
    if (lastIndex < text.length) {
      segments.push({
        text: text.slice(lastIndex),
        isError: false,
      });
    }

    return segments.map((seg, idx) => {
      // 1. Text thường
      if (!seg.isError) return <span key={idx}>{seg.text}</span>;

      // 2. Text lỗi (Chỉ giữ phần Highlight, gỡ bỏ hoàn toàn thẻ Tooltip gây lỗi visual)
      return (
        <span 
          key={idx} 
          // Dùng tooltip mặc định của trình duyệt, không bao giờ bị cắt xén
          title={seg.data.error_type} 
          className="box-decoration-clone bg-rose-100 text-rose-900 border-b-2 border-rose-400 font-medium px-1 rounded-sm pb-0.5 transition-colors duration-200 hover:bg-rose-200 hover:border-rose-600 cursor-pointer"
        >
          {seg.text}
        </span>
      );
    });
  };

  return (
    <div className="whitespace-pre-wrap font-sans text-lg leading-loose text-slate-700 tracking-wide">
      {renderHighlightedText()}
    </div>
  );
}