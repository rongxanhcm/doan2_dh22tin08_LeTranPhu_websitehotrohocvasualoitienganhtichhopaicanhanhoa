import os
import traceback
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from supabase import create_client, Client
from google import genai
from google.genai import types

# Load biến môi trường
load_dotenv()

# --- CẤU HÌNH ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") 
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Kiểm tra biến môi trường
missing_vars = []
if not GEMINI_API_KEY: missing_vars.append("GEMINI_API_KEY") # Sửa lại tên biến cho khớp .env của bạn
if not SUPABASE_URL: missing_vars.append("SUPABASE_URL")
if not SUPABASE_KEY: missing_vars.append("SUPABASE_KEY")

if missing_vars:
    print(f"❌ THIẾU BIẾN MÔI TRƯỜNG: {', '.join(missing_vars)}")
    raise ValueError(f"Thiếu các biến môi trường: {', '.join(missing_vars)}")

# Khởi tạo Clients
genai_client = genai.Client(api_key=GEMINI_API_KEY)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CONSTANTS ---
DAILY_LIMIT = 3
MIN_WORD_COUNT = 15

# --- HELPER FUNCTION: LẤY PROMPT TỪ DB ---
def get_system_prompt(key: str):
    """Lấy nội dung prompt từ bảng system_prompts"""
    try:
        response = supabase.table("system_prompts").select("content").eq("key", key).single().execute()
        if response.data:
            return response.data['content']
        else:
            # Fallback nếu DB chưa có (An toàn)
            print(f"⚠️ Không tìm thấy prompt key '{key}' trong DB. Dùng default.")
            return None
    except Exception as e:
        print(f"⚠️ Lỗi lấy prompt từ DB: {str(e)}")
        return None

# --- MODELS ---
class EssayInput(BaseModel):
    text: str
    user_id: Optional[str] = None
    language: str = "vi"

class ErrorDetail(BaseModel):
    error_type: str = Field(description="Name of the error")
    quote: str = Field(description="The EXACT substring from text")
    severity: str = Field(description="High or Medium")
    explanation: str = Field(description="Why it is wrong")
    suggestion: str = Field(description="How to fix it")

class EssayAssessment(BaseModel):
    score: float
    general_feedback: str
    core_errors: List[ErrorDetail]
    corrected_text: str

class ErrorItem(BaseModel):
    id: int
    error_type: str
    quote: str

class BatchQuizRequest(BaseModel):
    errors: List[ErrorItem]
    language: str = "vi"

class QuizQuestion(BaseModel):
    id: int
    question: str
    options: List[str]
    correct_answer_index: int
    explanation: str

class BatchQuizResponse(BaseModel):
    questions: List[QuizQuestion]

# ==========================================
# ENDPOINT 1: ANALYZE ESSAY
# ==========================================
@app.post("/analyze")
def analyze_essay(input: EssayInput):
    try:
        # 1. CHECK VALIDATION & QUOTA
        word_count = len(input.text.strip().split())
        if word_count < MIN_WORD_COUNT:
            raise HTTPException(status_code=400, detail=f"Bài viết quá ngắn ({word_count} từ). Tối thiểu {MIN_WORD_COUNT} từ.")

        if input.user_id:
            today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
            quota_res = supabase.table("submissions").select("id", count="exact").eq("user_id", input.user_id).gte("created_at", today_start).execute()
            if quota_res.count >= DAILY_LIMIT:
                raise HTTPException(status_code=429, detail=f"Hết lượt dùng hôm nay ({quota_res.count}/{DAILY_LIMIT}).")

        # 2. CHUẨN BỊ DỮ LIỆU
        lang_instruction = ""
        if input.language == "vi":
            lang_instruction = "IMPORTANT: Write 'explanation', 'suggestion', 'general_feedback' in VIETNAMESE. Keep 'error_type' in English."
        else:
            lang_instruction = "Write explanation and suggestion in English."

        # 3. LẤY PROMPT TỪ DB VÀ FILL DỮ LIỆU
        raw_prompt = get_system_prompt("analyze_essay")
        
        if raw_prompt:
            # Thay thế placeholder {{...}} bằng dữ liệu thật
            prompt_text = raw_prompt.replace("{{lang_instruction}}", lang_instruction)\
                                    .replace("{{input_text}}", input.text)
        else:
            # Fallback nếu DB lỗi (Prompt cứng cũ)
            prompt_text = f"""
            Act as an IELTS Writing Examiner. Analyze: "{input.text}".
            {lang_instruction}
            Return JSON matching schema.
            """

        # 4. GỌI GEMINI
        response = genai_client.models.generate_content(
            model='gemini-3-pro-preview', 
            contents=prompt_text,
            config=types.GenerateContentConfig(
                response_mime_type='application/json',
                response_schema=EssayAssessment
            )
        )
        result = response.parsed

        # 5. LƯU DATABASE (Giữ nguyên logic cũ)
        if input.user_id:
            try:
                sub_data = {
                    "user_id": input.user_id,
                    "original_text": input.text,
                    "corrected_text": result.corrected_text,
                    "score": result.score,
                    "general_feedback": result.general_feedback
                }
                sub_res = supabase.table("submissions").insert(sub_data).execute()
                if sub_res.data:
                    sub_id = sub_res.data[0]['id']
                    err_data = [{
                        "submission_id": sub_id,
                        "error_type": e.error_type,
                        "severity": e.severity,
                        "explanation": e.explanation,
                        "suggestion": e.suggestion,
                        "quote": e.quote
                    } for e in result.core_errors]
                    
                    if err_data:
                        supabase.table("analysis_results").insert(err_data).execute()
            except Exception as db_err:
                print(f"⚠️ DB Error: {db_err}")
                traceback.print_exc()

        return result

    except HTTPException as he: raise he
    except Exception as e:
        print(f"SERVER ERROR: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# ENDPOINT 2: BATCH QUIZ
# ==========================================
@app.post("/generate-batch-quiz")
def generate_batch_quiz(input: BatchQuizRequest):
    try:
        # Chuẩn bị context danh sách lỗi
        error_list_text = ""
        for err in input.errors:
            error_list_text += f"- Error '{err.error_type}' in phrase: '{err.quote}'\n"

        # LẤY PROMPT TỪ DB
        raw_prompt = get_system_prompt("generate_quiz")
        
        if raw_prompt:
            prompt_text = raw_prompt.replace("{{error_list_text}}", error_list_text)
        else:
            prompt_text = f"Generate quiz for: {error_list_text}"

        response = genai_client.models.generate_content(
            model='gemini-3-pro-preview',
            contents=prompt_text,
            config=types.GenerateContentConfig(
                response_mime_type='application/json',
                response_schema=BatchQuizResponse
            )
        )
        return response.parsed

    except Exception as e:
        print(f"QUIZ ERROR: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e)) 