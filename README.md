📂 PROJECT REPORT: COREFIX
AI-Powered IELTS Writing Assistant (Trợ lý Luyện viết IELTS thông minh sử dụng AI)
TỔNG QUAN (OVERVIEW)
CoreFix là một ứng dụng web giáo dục (EdTech) giúp người học IELTS Writing cải thiện kỹ năng viết thông qua việc chấm điểm, sửa lỗi ngữ pháp và giải thích chi tiết bằng công nghệ AI.

Khác với các công cụ kiểm tra ngữ pháp thông thường, CoreFix tập trung vào trải nghiệm học tập (Learning Experience): không chỉ chỉ ra lỗi sai, hệ thống còn cung cấp bài học ngữ pháp (Grammar Rules), bài tập trắc nghiệm (Quiz) được cá nhân hóa dựa trên chính lỗi sai của người dùng, và theo dõi tiến độ qua Dashboard trực quan.

Mục tiêu: Giúp người dùng hiểu tại sao sai và sửa triệt để lỗi đó.
CÔNG NGHỆ SỬ DỤNG (TECH STACK)

Dự án được xây dựng theo mô hình Modern Full-stack, tách biệt Frontend và Backend để tối ưu hiệu năng và khả năng mở rộng.Đối tượng: Người học tiếng Anh, đặc biệt là luyện thi IELTS.
Thành phần,Công nghệ,Vai trò
Frontend,Next.js 14 (App Router),"Framework React hiện đại, tối ưu SEO và UX."
,Tailwind CSS,"Styling giao diện nhanh, đẹp, Responsive."
,Lucide React,Bộ icon nhẹ và thống nhất.
,Recharts,Vẽ biểu đồ thống kê trực quan.
Backend,Python (FastAPI),"Xử lý API tốc độ cao, dễ dàng tích hợp AI."
,Pydantic,Validate dữ liệu đầu vào/đầu ra nghiêm ngặt.
Database,Supabase (PostgreSQL),"Lưu trữ User, Bài viết (Submissions), và Lỗi (Errors)."
AI Core,Google Gemini 1.5 Flash,"Mô hình ngôn ngữ xử lý sửa lỗi, giải thích và tạo Quiz."
Auth,Supabase Auth,Quản lý đăng nhập/đăng ký bảo mật.

TÍNH NĂNG CHI TIẾT (KEY FEATURES)
Hệ thống được chia làm 4 phân hệ chính:

A. Phân tích & Sửa bài (Core Feature)
Deep Analysis: AI phân tích bài viết, chấm điểm IELTS (ước lượng) và đưa ra nhận xét tổng quan.

Visual Highlighting (Nổi bật):

Các lỗi sai trong bài gốc được tô đỏ/gạch chân trực tiếp tại vị trí chính xác.

Tooltip thông minh: Rê chuột vào lỗi sẽ hiện ra tên lỗi và cách sửa ngắn gọn.

Bilingual Feedback: Hỗ trợ song ngữ Anh - Việt. Người dùng có thể chuyển đổi ngôn ngữ để đọc giải thích dễ hiểu hơn.

Topic Generator: Hệ thống tự động gợi ý các chủ đề viết ngắn gọn, kích thích tư duy (Random Topic Pool), kèm nút "Change Topic".

B. Học tập & Ôn luyện (Learning System)
Grammar Knowledge Base (Hard-coded):

Tích hợp sẵn kho kiến thức ngữ pháp chuẩn chỉnh (Sổ tay ngữ pháp).

Khi người dùng gặp lỗi (ví dụ: Subject-Verb Agreement), hệ thống cung cấp bài học lý thuyết, công thức, và ví dụ Sai/Đúng cụ thể ngay trên Dashboard.

Personalized Quiz:

Dựa trên các lỗi người dùng vừa mắc phải, AI tự động tạo ra bộ câu hỏi trắc nghiệm (Fill-in-the-blank).

Giúp người dùng thực hành sửa lỗi ngay lập tức (Learn by fixing).

C. Theo dõi Tiến độ (Analytics Dashboard)
Overview Stats: Thống kê tổng số bài viết, điểm trung bình.

Critical Issues Tracker: Tự động phát hiện "Lỗi nghiêm trọng nhất" (Top Priority) mà người dùng hay mắc phải trong tuần.

Progress Visualization: Biểu đồ thanh (Bar chart) thể hiện tần suất các loại lỗi, giúp người dùng biết mình yếu ở mảng nào (Thì, Mạo từ, hay Từ vựng...).

History Log: Lưu lại toàn bộ lịch sử bài viết để xem lại bất cứ lúc nào.

D. Bảo mật & An toàn hệ thống (System Safety)
Daily Quota: Giới hạn mỗi người dùng chỉ được chấm 3 bài/ngày để ngăn chặn spam và bảo vệ tài nguyên API.

Input Validation:

Chặn các bài viết quá ngắn (< 20 từ).

Hiển thị bộ đếm từ (Word Counter) realtime.

Error Handling: Hệ thống thông báo rõ ràng khi Server quá tải, hết lượt dùng hoặc mất kết nối.

ĐIỂM NHẤN KỸ THUẬT (TECHNICAL HIGHLIGHTS)
Đây là những phần "ăn điểm" về mặt kỹ thuật lập trình:

String Manipulation: Thuật toán cắt chuỗi và chèn thẻ HTML (Span) để highlight chính xác từng từ bị lỗi dựa trên dữ liệu quote từ Backend.

Prompt Engineering: Kỹ thuật viết Prompt ép AI trả về dữ liệu chuẩn JSON (Structured Output) và xử lý đa ngôn ngữ (Việt/Anh) linh hoạt.

System Design: Thiết kế cơ chế Quota (Rate Limiting) đơn giản nhưng hiệu quả bằng cách query đếm record trong Database theo mốc thời gian.
KẾT LUẬN
CoreFix đã hoàn thiện ở mức độ MVP (Minimum Viable Product) chất lượng cao, sẵn sàng để triển khai thực tế. Sản phẩm giải quyết tốt nỗi đau của người học Writing là "Viết xong không biết sai ở đâu và tại sao sai", đồng thời cung cấp lộ trình cải thiện rõ ràng.
