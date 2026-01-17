import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import traceback

# --- THƯ VIỆN MỚI ---
from google import genai
from google.genai import types
from supabase import create_client, Client 
from dotenv import load_dotenv # Import cái này
load_dotenv()

# --- CẤU HÌNH ---
# Lấy key từ biến môi trường (An toàn tuyệt đối)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
if not GEMINI_API_KEY or not SUPABASE_KEY:
    raise ValueError("❌ CHƯA CẤU HÌNH API KEY TRONG FILE .env!")
genai_client = genai.Client(api_key=GEMINI_API_KEY)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELS ---
class EssayInput(BaseModel):
    text: str
    user_id: Optional[str] = None 
    language: str = "vi" # [SỬA 1]: Đổi "vn" thành "vi" cho khớp với logic bên dưới

class ErrorDetail(BaseModel):
    error_type: str = Field(description="Name of the grammar error (Must be in English Standard Terminology)")
    severity: str = Field(description="High or Medium")
    explanation: str = Field(description="Why is it wrong?")
    suggestion: str = Field(description="How to fix it?")

class EssayAssessment(BaseModel):
    score: float = Field(description="Estimated IELTS score")
    general_feedback: str = Field(description="Short summary")
    core_errors: List[ErrorDetail]
    corrected_text: str = Field(description="Rewritten text")

@app.post("/analyze")
def analyze_essay(input: EssayInput):
    try:
        # Cấu hình chỉ thị ngôn ngữ
        lang_instruction = ""
        # [LOGIC]: Nếu frontend gửi 'vi' hoặc mặc định là 'vi' thì sẽ vào đây
        if input.language == "vi":
            lang_instruction = "IMPORTANT: The 'text' input is English, but you must write 'explanation', 'suggestion', and 'general_feedback' in VIETNAMESE. Keep 'error_type' in English terminology."
        else:
            lang_instruction = "Write explanation and suggestion in English."

        # [SỬA 2]: Thêm đoạn STRICT REQUIREMENT để ép tên lỗi chuẩn
        prompt_text = f"""
        Act as an IELTS Writing Examiner. Analyze the following text and identify root grammatical errors.
        
        {lang_instruction}

        STRICT REQUIREMENT for 'error_type': 
        You must map all errors to one of these standard categories ONLY: 
        ["Past Tense", "Present Tense", "Future Tense", "Subject-Verb Agreement", "Pluralization", "Article Usage", "Word Choice", "Run-on Sentence", "Comma Splice", "Spelling", "Word Form", "Sentence Fragment", "Preposition", "Punctuation", "Passive Voice", "Capitalization"]. 
        If an error doesn't fit perfectly, choose the closest one or use "Other".

        Input text: "{input.text}"
        """

        response = genai_client.models.generate_content(
            model='gemini-2.5-flash', # [SỬA 3]: Dùng bản 1.5 cho ổn định (trừ khi bạn chắc chắn 2.5 chạy được)
            contents=prompt_text,
            config=types.GenerateContentConfig(
                response_mime_type='application/json',
                response_schema=EssayAssessment
            )
        )
        
        result = response.parsed

        # 2. LƯU VÀO DATABASE
        if input.user_id:
            try:
                # A. Lưu vào bảng submissions
                submission_data = {
                    "user_id": input.user_id,
                    "original_text": input.text,
                    "corrected_text": result.corrected_text,
                    "score": result.score,
                    "general_feedback": result.general_feedback
                }
                
                sub_response = supabase.table("submissions").insert(submission_data).execute()
                submission_id = sub_response.data[0]['id']

                # B. Lưu danh sách lỗi vào bảng analysis_results
                errors_data = []
                for err in result.core_errors:
                    errors_data.append({
                        "submission_id": submission_id,
                        "error_type": err.error_type, # Giờ đây cái này luôn là chuẩn tiếng Anh
                        "severity": err.severity,
                        "explanation": err.explanation, # Cái này sẽ là Tiếng Việt
                        "suggestion": err.suggestion   # Cái này sẽ là Tiếng Việt
                    })
                
                if errors_data:
                    supabase.table("analysis_results").insert(errors_data).execute()
                    print(f"✅ Đã lưu thành công cho User {input.user_id}")

            except Exception as db_error:
                print(f"⚠️ Lỗi lưu Database: {db_error}")

        return result

    except Exception as e:
        print(f"========== LỖI SERVER: {str(e)} ==========") 
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))