export interface GrammarRule {
  title: string;
  definition: string;
  rule: string;
  bad_example: string;
  good_example: string;
  tip: string;
}

// Map tên lỗi (từ Backend/errorMapping) sang Bài học chi tiết
export const GRAMMAR_RULES: Record<string, GrammarRule> = {
  // --- 1. GRAMMAR - TENSES (CÁC THÌ) ---
  "Past Tense": {
    title: "Thì Quá khứ đơn",
    definition: "Dùng để diễn tả hành động đã chấm dứt hoàn toàn trong quá khứ.",
    rule: "Động từ thường: V-ed. Động từ bất quy tắc: Cột 2 (V2).",
    bad_example: "Yesterday I go to school.",
    good_example: "Yesterday I WENT to school.",
    tip: "Thấy 'Yesterday', 'Last year', 'Ago', 'In 1999' -> Chắc chắn là Quá khứ đơn."
  },
  "Present Tense": {
    title: "Thì Hiện tại đơn",
    definition: "Diễn tả một sự thật hiển nhiên, một thói quen hoặc hành động lặp đi lặp lại.",
    rule: "S (số ít) + V(s/es). S (số nhiều) + V (nguyên mẫu).",
    bad_example: "He go to work by bus every day.",
    good_example: "He GOES to work by bus every day.",
    tip: "Dùng cho các sự thật khoa học hoặc tần suất (always, usually, often)."
  },
  "Future Tense": {
    title: "Thì Tương lai",
    definition: "Diễn tả hành động sẽ xảy ra. Trong IELTS, thường dùng để dự đoán hoặc nói về kế hoạch.",
    rule: "Will + V (dự đoán không căn cứ/quyết định ngay lúc nói). Be going to + V (kế hoạch có sẵn).",
    bad_example: "I think it rains tomorrow.",
    good_example: "I think it WILL RAIN tomorrow.",
    tip: "Trong Writing Task 1 (Map/Process), cẩn thận dùng thì tương lai nếu năm trong đề bài là năm tương lai (ví dụ 2050)."
  },
  "Verb Tense": {
    title: "Sai thì động từ (Chung)",
    definition: "Sử dụng thì không phù hợp với ngữ cảnh thời gian của câu.",
    rule: "Xác định rõ mốc thời gian của câu chuyện: Quá khứ, Hiện tại hay Tương lai để chia động từ đồng nhất.",
    bad_example: "While I was sleeping, the phone rings.",
    good_example: "While I was sleeping, the phone RANG.",
    tip: "Tránh 'nhảy thì' (Shift tense) lung tung trong một đoạn văn nếu không có lý do cụ thể."
  },
  "Subject-Verb Agreement": {
    title: "Hòa hợp Chủ ngữ - Vị ngữ",
    definition: "Động từ phải chia tương ứng với số lượng (số ít/số nhiều) của chủ ngữ.",
    rule: "Chủ ngữ số ít (He, She, It, The list) -> V thêm s/es. Chủ ngữ số nhiều (They, We) -> V giữ nguyên.",
    bad_example: "The list of items are on the desk.",
    good_example: "The list of items IS on the desk.",
    tip: "Đừng bị lừa bởi cụm từ ở giữa (of items). Hãy tìm danh từ chính đứng đầu câu (The list)."
  },

  // --- 2. GRAMMAR - STRUCTURE (CẤU TRÚC CÂU) ---
  "Run-on Sentence": {
    title: "Câu chạy (Run-on)",
    definition: "Hai mệnh đề độc lập nối với nhau mà không có từ nối hoặc dấu câu hợp lý.",
    rule: "Tách thành 2 câu bằng dấu chấm, hoặc dùng dấu chấm phẩy (;), hoặc dùng từ nối (FANBOYS: for, and, nor, but...)",
    bad_example: "I love cats they are cute.",
    good_example: "I love cats BECAUSE they are cute. / I love cats; they are cute.",
    tip: "Kiểm tra xem câu có quá dài và chứa nhiều ý độc lập không."
  },
  "Comma Splice": {
    title: "Lỗi nối bằng dấu phẩy",
    definition: "Nối hai câu hoàn chỉnh chỉ bằng một dấu phẩy (Dấu phẩy không đủ sức làm việc này).",
    rule: "Thay dấu phẩy bằng dấu chấm (.) hoặc chấm phẩy (;), hoặc thêm liên từ (and, but, so).",
    bad_example: "He was late, he missed the bus.",
    good_example: "He was late, SO he missed the bus.",
    tip: "Dấu phẩy chỉ dùng để liệt kê hoặc tách mệnh đề phụ, không nối 2 câu chính."
  },
  "Sentence Fragment": {
    title: "Câu không hoàn chỉnh",
    definition: "Câu thiếu chủ ngữ, động từ, hoặc là một mệnh đề phụ đứng một mình.",
    rule: "Một câu hoàn chỉnh bắt buộc phải có ít nhất một Chủ ngữ và một Động từ chính.",
    bad_example: "Because I was tired.",
    good_example: "I went to bed early BECAUSE I was tired.",
    tip: "Đừng bao giờ bắt đầu một câu bằng 'Because' mà không có mệnh đề chính đi kèm."
  },
  "Article Usage": {
    title: "Mạo từ (A/An/The)",
    definition: "Dùng sai hoặc thiếu mạo từ trước danh từ.",
    rule: "'A/An' cho danh từ đếm được số ít chưa xác định. 'The' cho danh từ đã xác định. Không dùng mạo từ cho danh từ số nhiều nói chung.",
    bad_example: "I saw dog in park.",
    good_example: "I saw A dog in THE park.",
    tip: "Danh từ đếm được số ít (student, car, apple) KHÔNG BAO GIỜ đứng trơ trọi. Phải có a/an/the/my/this..."
  },
  "Preposition": {
    title: "Giới từ (In/On/At...)",
    definition: "Dùng sai từ chỉ địa điểm, thời gian hoặc giới từ đi kèm động từ.",
    rule: "At + giờ/địa điểm nhỏ. On + ngày/bề mặt. In + tháng/năm/khu vực lớn.",
    bad_example: "I was born on May 1999.",
    good_example: "I was born IN May 1999.",
    tip: "Học thuộc các cụm cố định: interested IN, good AT, depend ON..."
  },
  "Pluralization": {
    title: "Số ít / Số nhiều",
    definition: "Quên thêm 's' cho danh từ số nhiều hoặc thêm 's' cho danh từ không đếm được.",
    rule: "Danh từ đếm được > 1 phải thêm 's/es'. Danh từ không đếm được (Information, Advice, Knowledge) KHÔNG thêm 's'.",
    bad_example: "I need some informations.",
    good_example: "I need some INFORMATION.",
    tip: "Các từ không đếm được hay gặp trong IELTS: Research, Equipment, Furniture, Traffic."
  },
  "Word Order": {
    title: "Trật tự từ",
    definition: "Sắp xếp từ trong câu sai vị trí (thường là trạng từ hoặc tính từ).",
    rule: "Tính từ đứng trước Danh từ. Trạng từ tần suất (always, often) đứng trước động từ thường, sau tobe.",
    bad_example: "I play often football.",
    good_example: "I OFTEN play football.",
    tip: "Tiếng Anh theo cấu trúc S-V-O (Chủ - Động - Tân). Đừng dịch word-by-word từ tiếng Việt."
  },
  "Passive Voice": {
    title: "Câu bị động",
    definition: "Dùng câu chủ động khi cần bị động (hoặc ngược lại). Cấu trúc sai.",
    rule: "Be + V3 (Past Participle). Dùng khi muốn nhấn mạnh vào đối tượng bị tác động.",
    bad_example: "The house built in 1990.",
    good_example: "The house WAS BUILT in 1990.",
    tip: "Trong Academic Writing, câu bị động giúp văn phong khách quan hơn (ví dụ: 'It is believed that...' thay vì 'People believe...')."
  },

  // --- 3. VOCABULARY & STYLE (TỪ VỰNG & VĂN PHONG) ---
  "Word Choice": {
    title: "Dùng từ chưa chuẩn",
    definition: "Từ vựng không sai ngữ pháp nhưng không hợp ngữ cảnh hoặc không tự nhiên.",
    rule: "Tra cứu Collocation hoặc ngữ cảnh sử dụng. Tránh dùng từ quá 'kêu' nếu không hiểu rõ nghĩa.",
    bad_example: "I did a mistake.",
    good_example: "I MADE a mistake.",
    tip: "Đừng cố dùng từ 'đao to búa lớn' (Big words). Sự chính xác (Precision) quan trọng hơn."
  },
  "Spelling": {
    title: "Lỗi Chính tả",
    definition: "Viết sai ký tự của từ.",
    rule: "Ghi nhớ quy tắc phonic hoặc tra từ điển.",
    bad_example: "Goverment, Enviroment, Recieve.",
    good_example: "Government, Environment, Receive.",
    tip: "Cẩn thận với các từ có chữ cái kép (Success, Accommodation, Tomorrow)."
  },
  "Punctuation": {
    title: "Dấu câu",
    definition: "Dùng sai dấu chấm, phẩy, chấm phẩy hoặc thiếu dấu câu.",
    rule: "Dấu phẩy sau từ nối đầu câu (However, Moreover). Không dùng dấu phẩy tùy tiện giữa chủ ngữ và động từ.",
    bad_example: "However I disagree.",
    good_example: "However, I disagree.",
    tip: "Dấu câu giúp người đọc ngắt nghỉ đúng chỗ. Đọc thầm câu văn để xem nên ngắt ở đâu."
  },
  "Capitalization": {
    title: "Viết hoa",
    definition: "Không viết hoa đầu câu, tên riêng hoặc viết hoa tùy tiện giữa câu.",
    rule: "Luôn viết hoa chữ cái đầu câu, tên người, địa danh, ngày tháng, ngôn ngữ (English, Vietnamese).",
    bad_example: "i want to learn english.",
    good_example: "I want to learn English.",
    tip: "Đừng viết hoa danh từ chung (School, University) trừ khi nó là tên riêng (Harvard University)."
  },
  "Informal Language": {
    title: "Văn phong không trang trọng",
    definition: "Dùng từ lóng, viết tắt hoặc ngôn ngữ nói trong bài viết học thuật (IELTS Writing).",
    rule: "Không dùng: kids, gonna, wanna, a lot of, don't, can't. Dùng: children, going to, want to, many/much, do not, cannot.",
    bad_example: "Kids shouldn't eat junk food.",
    good_example: "Children SHOULD NOT consume unhealthy food.",
    tip: "Viết tắt (can't, isn't) là cấm kỵ trong IELTS Task 2."
  },
  "Repetition": {
    title: "Lặp từ",
    definition: "Sử dụng một từ quá nhiều lần trong câu hoặc đoạn văn.",
    rule: "Sử dụng từ đồng nghĩa (Synonyms) hoặc đại từ (Pronouns) để thay thế.",
    bad_example: "Pollution is bad. Pollution causes diseases. We must stop pollution.",
    good_example: "Pollution is detrimental. IT causes diseases. We must stop THIS PROBLEM.",
    tip: "Học từ đồng nghĩa theo chủ đề (Paraphrasing) là chìa khóa điểm cao."
  },
  "Word Form": {
    title: "Dạng từ (Word Form)",
    definition: "Nhầm lẫn giữa Danh từ, Động từ, Tính từ, Trạng từ.",
    rule: "Tính từ bổ nghĩa cho Danh từ. Trạng từ bổ nghĩa cho Động từ. Sau giới từ thường là V-ing hoặc Danh từ.",
    bad_example: "She sings beautiful.",
    good_example: "She sings BEAUTIFULLY.",
    tip: "Chú ý hậu tố: -tion (Danh), -ly (Trạng), -ful/ive (Tính)."
  },
  "Collocation": {
    title: "Kết hợp từ (Collocation)",
    definition: "Các từ thường đi chung với nhau một cách tự nhiên.",
    rule: "Không dịch word-by-word từ tiếng Việt. Hãy học cả cụm từ.",
    bad_example: "Commit a crime -> Do a crime (Sai).",
    good_example: "Commit a crime / Pay attention / Make an effort.",
    tip: "Khi học từ mới, hãy học xem nó đi với động từ/tính từ nào."
  },
  "Other": {
    title: "Lỗi khác",
    definition: "Lỗi này chưa được phân loại cụ thể hoặc là lỗi logic.",
    rule: "Hãy xem kỹ phần gợi ý sửa lỗi (Suggestion) để hiểu cách khắc phục.",
    bad_example: "...",
    good_example: "...",
    tip: "Đôi khi AI đánh dấu 'Other' cho những lỗi diễn đạt lủng củng."
  }
};

// Hàm fallback an toàn
export const getRule = (errorType: string): GrammarRule => {
  return GRAMMAR_RULES[errorType] || {
    title: errorType,
    definition: "Lỗi ngữ pháp cần lưu ý.",
    rule: "Hãy kiểm tra kỹ ngữ pháp tiếng Anh chuẩn và xem gợi ý sửa lỗi.",
    bad_example: "...",
    good_example: "...",
    tip: "Hãy sử dụng từ điển hoặc công cụ kiểm tra ngữ pháp."
  };
};