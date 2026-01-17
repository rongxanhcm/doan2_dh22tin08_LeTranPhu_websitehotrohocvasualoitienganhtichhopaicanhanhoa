// lib/errorMapping.ts

export const errorMap: Record<string, string> = {
  // Grammar - Tenses
  "Past Tense": "Lỗi thì quá khứ",
  "Present Tense": "Lỗi thì hiện tại",
  "Future Tense": "Lỗi thì tương lai",
  "Subject-Verb Agreement": "Hòa hợp chủ ngữ - vị ngữ",
  "Verb Tense": "Sai thì động từ",
  
  // Grammar - Structure
  "Run-on Sentence": "Câu chạy (Run-on)",
  "Comma Splice": "Lỗi nối câu bằng dấu phẩy",
  "Sentence Fragment": "Câu không hoàn chỉnh",
  "Article Usage": "Lỗi mạo từ (a/an/the)",
  "Preposition": "Lỗi giới từ",
  "Pluralization": "Lỗi số ít / số nhiều",
  "Word Order": "Trật tự từ",
  "Passive Voice": "Câu bị động",
  
  // Vocabulary & Style
  "Word Choice": "Dùng từ chưa chuẩn",
  "Spelling": "Lỗi chính tả",
  "Punctuation": "Lỗi dấu câu",
  "Capitalization": "Lỗi viết hoa",
  "Informal Language": "Văn phong không trang trọng",
  "Repetition": "Lặp từ",
  "Word Form": "Dạng từ (Danh/Động/Tính)",
  "Collocation": "Kết hợp từ (Collocation)",
  
  // Mặc định
  "Other": "Lỗi khác"
};

// Hàm helper để dịch
export const translateError = (errorKey: string, lang: "en" | "vi") => {
  if (lang === "en") return errorKey;
  // Nếu tìm thấy trong từ điển thì trả về tiếng Việt, không thì giữ nguyên tiếng Anh
  return errorMap[errorKey] || errorKey; 
};