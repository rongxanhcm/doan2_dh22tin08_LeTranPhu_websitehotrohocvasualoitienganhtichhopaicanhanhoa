import os
import traceback
import json
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
DAILY_LIMIT = 5 # Có thể tăng thêm nếu cần
MIN_WORD_COUNT = 15

# --- HELPER FUNCTION ---
def get_system_prompt(key: str):
    try:
        response = supabase.table("system_prompts").select("content").eq("key", key).single().execute()
        if response.data:
            return response.data['content']
        return None
    except Exception as e:
        print(f"⚠️ Lỗi lấy prompt từ DB: {str(e)}")
        return None

# --- MODELS ---
class ErrorDetail(BaseModel):
    error_type: str
    quote: str
    severity: str
    explanation: str
    suggestion: str

class EssayAssessment(BaseModel):
    score: float
    general_feedback: str # Trường này sẽ lấp đầy cột "Đánh giá chung"
    core_errors: List[ErrorDetail]
    corrected_text: str

class EssayInput(BaseModel):
    text: str
    user_id: Optional[str] = None
    language: str = "vi"
    native_language: str = "English" # <--- [MỚI] Mặc định là English

# Models cho Quiz
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
        # 1. VALIDATION
        word_count = len(input.text.strip().split())
        if word_count < MIN_WORD_COUNT:
            raise HTTPException(status_code=400, detail=f"Bài viết quá ngắn ({word_count} từ).")

        # Nếu là tiếng Anh thì giữ nguyên, nếu ngôn ngữ khác thì ép AI trả lời bằng tiếng đó
        target_lang = input.native_language.strip()
        
        if target_lang.lower() in ["english", "en", "us", "uk"]:
            lang_instruction = "Write explanation, suggestion, and general_feedback in English."
        else:
            # Prompt quyền lực: Ép AI dịch output sang ngôn ngữ user muốn
            lang_instruction = f"""
            IMPORTANT: You are analyzing an essay for a student whose native language is '{target_lang}'.
            Rules:
            1. 'error_type' MUST remain in English (standard terminology).
            2. 'explanation', 'suggestion', and 'general_feedback' MUST be written in {target_lang} (translated professionally).
            3. The 'quote' must be the exact original substring.
            """

        # 3. LẤY PROMPT TỪ DB
        raw_prompt = get_system_prompt("analyze_essay")
        if not raw_prompt:
            raise HTTPException(status_code=500, detail="System prompt not found in database.")

        prompt_text = raw_prompt.replace("{{lang_instruction}}", lang_instruction)\
                                .replace("{{input_text}}", input.text)

        # 4. GỌI GEMINI (Dùng 1.5 Flash cho tốc độ và ổn định JSON)
        response = genai_client.models.generate_content(
            model='gemini-3-pro-preview', 
            contents=prompt_text,
            config=types.GenerateContentConfig(
                response_mime_type='application/json',
                response_schema=EssayAssessment
            )
        )
        result = response.parsed

        # 5. LƯU DATABASE
        if input.user_id:
            try:
                # Lưu bài viết chính kèm nhận xét chung
                sub_data = {
                    "user_id": input.user_id,
                    "original_text": input.text,
                    "corrected_text": result.corrected_text,
                    "score": result.score,
                    "general_feedback": result.general_feedback, # [CỐT LÕI] Lưu vào đây
                    "target_language": input.native_language  # <--- [MỚI] Lưu ngôn ngữ (Chinese/Vietnamese...) vào đây
                }
                sub_res = supabase.table("submissions").insert(sub_data).execute()
                
                if sub_res.data:
                    sub_id = sub_res.data[0]['id']
                    # Lưu chi tiết các lỗi
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

        return result

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ENDPOINT 2: BATCH QUIZ (GLOBAL NATIVE VERSION)
# ==========================================
@app.post("/generate-batch-quiz")
def generate_batch_quiz(input: BatchQuizRequest):
    try:
        # 1. Tạo danh sách lỗi
        error_list_text = ""
        for err in input.errors:
            error_list_text += f"- Error '{err.error_type}' in phrase: '{err.quote}'\n"

        # 2. XỬ LÝ NGÔN NGỮ ĐỘNG (HYBRID LOGIC)
        target_lang = input.language.strip()
        
        if target_lang.lower() in ["english", "en", "us", "uk"]:
            lang_instruction = "Write everything (question, options, explanation) in English."
        else:
            # Prompt này cực quan trọng:
            # - question: Dùng tiếng bản địa để hỏi, nhưng ví dụ tiếng Anh giữ nguyên.
            # - options: Tiếng Anh (để chọn).
            # - explanation: Tiếng bản địa (để hiểu).
            lang_instruction = f"""
            IMPORTANT: You are creating a quiz for a student whose native language is '{target_lang}'.
            
            RULES FOR LANGUAGE:
            1. 'question': The instruction must be in {target_lang}, but the sentence being tested must remain in English.
               (Example for Vietnamese: "Chọn từ đúng để điền vào câu: 'She ___ to school'.")
            2. 'options': MUST be in English.
            3. 'explanation': MUST be in {target_lang} so the student understands the grammar rule.
            """

        # 3. LẤY PROMPT TỪ DB
        raw_prompt = get_system_prompt("generate_quiz")
        if not raw_prompt:
            raise HTTPException(status_code=500, detail="Quiz prompt not found.")
            
        # 4. THAY THẾ
        prompt_text = raw_prompt.replace("{{error_list_text}}", error_list_text)\
                                .replace("{{lang_instruction}}", lang_instruction)

        # 5. GỌI GEMINI
        response = genai_client.models.generate_content(
            model='gemini-3-pro-preview', # Dùng model xịn nhất để xử lý logic lai ngôn ngữ
            contents=prompt_text,
            config=types.GenerateContentConfig(
                response_mime_type='application/json',
                response_schema=BatchQuizResponse
            )
        )
        return response.parsed

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))