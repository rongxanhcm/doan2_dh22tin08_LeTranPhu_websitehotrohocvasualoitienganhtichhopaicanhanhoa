import { createClient } from "@/lib/supabaseClient";

export interface GrammarRule {
  id?: number;
  error_key: string;
  title: string;
  definition: string;
  rule: string;
  bad_example: string;
  good_example: string;
  tip: string;
}

// 1. Hàm lấy toàn bộ Rules từ DB (Dùng cho Admin hoặc cache)
export const fetchAllRules = async (): Promise<GrammarRule[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("grammar_rules")
    .select("*");
  
  if (error) {
    console.error("Error fetching rules:", error);
    return [];
  }
  return data || [];
};

// 2. Hàm lấy 1 Rule theo error_type (Dùng cho Modal)
export const fetchRuleByKey = async (errorKey: string): Promise<GrammarRule | null> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("grammar_rules")
    .select("*")
    .eq("error_key", errorKey) // Tìm chính xác theo key (VD: "Past Tense")
    .single();

  if (error || !data) {
    // Nếu không tìm thấy, trả về fallback mặc định
    return {
      error_key: errorKey,
      title: errorKey,
      definition: "Chưa có dữ liệu bài học cho lỗi này.",
      rule: "Đang cập nhật...",
      bad_example: "...",
      good_example: "...",
      tip: "Hãy liên hệ Admin để bổ sung bài học này."
    };
  }
  return data;
};