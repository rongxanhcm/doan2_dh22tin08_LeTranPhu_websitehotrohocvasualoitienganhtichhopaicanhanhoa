import os
import traceback
import json
from datetime import datetime
from typing import List, Optional, Union # [FIX] Đã thêm Union

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
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
FREE_DAILY_LIMIT = 2   
PRO_DAILY_LIMIT = 50   
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
    general_feedback: str
    core_errors: List[ErrorDetail]
    corrected_text: str
    polished_text: Optional[str] = None 

class EssayInput(BaseModel):
    text: str
    user_id: Optional[str] = None
    language: str = "vi"
    native_language: str = "English"

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

# Model cho Debug Upgrade
class UpgradeRequest(BaseModel):
    user_id: str

# Model cho Upgrade Submission (Fix lỗi 422/500)
class UpgradeSubmissionRequest(BaseModel):
    submission_id: Union[int, str] # [FIX] Chấp nhận cả số và chuỗi
    user_id: str

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

        # 2. CHECK QUOTA & QUYỀN
        is_pro = False
        usage_count = 0
        
        if input.user_id:
            # Dùng .execute() trả về list để an toàn
            usage_res = supabase.table("user_usage").select("*").eq("user_id", input.user_id).execute()
            usage_data = None

            if not usage_res.data:
                try:
                    new_user = {"user_id": input.user_id, "usage_count": 0, "is_pro": False}
                    supabase.table("user_usage").insert(new_user).execute()
                    usage_data = new_user
                    usage_data['last_reset_date'] = datetime.now().strftime('%Y-%m-%d')
                except Exception:
                    usage_data = {"usage_count": 0, "is_pro": False, "last_reset_date": datetime.now().strftime('%Y-%m-%d')}
            else:
                usage_data = usage_res.data[0]

            # Logic Reset ngày mới
            last_date_str = str(usage_data.get('last_reset_date'))
            today_str = datetime.now().strftime('%Y-%m-%d')
            
            if last_date_str != today_str and last_date_str != "None":
                supabase.table("user_usage").update({"usage_count": 0, "last_reset_date": today_str}).eq("user_id", input.user_id).execute()
                usage_count = 0
            else:
                usage_count = usage_data.get('usage_count', 0)

            is_pro = usage_data.get('is_pro', False)

            limit = PRO_DAILY_LIMIT if is_pro else FREE_DAILY_LIMIT
            if usage_count >= limit:
                 raise HTTPException(status_code=403, detail=f"Bạn đã hết lượt dùng miễn phí hôm nay ({limit}/{limit}). Hãy nâng cấp Pro để tiếp tục!")

        # 3. CHUẨN BỊ PROMPT
        target_lang = input.native_language.strip()
        if target_lang.lower() in ["english", "en", "us", "uk"]:
            lang_instruction = "Write explanation, suggestion, and general_feedback in English."
        else:
            lang_instruction = f"""
            IMPORTANT: You are analyzing an essay for a student whose native language is '{target_lang}'.
            Rules:
            1. 'error_type' MUST remain in English.
            2. 'explanation', 'suggestion', and 'general_feedback' MUST be written in {target_lang}.
            3. The 'quote' must be the exact original substring.
            """

        if is_pro:
            polish_instruction = ', "polished_text": "<string: The ULTIMATE IELTS BAND 9.0 version. Rewrite the entire essay using C2 vocabulary.>"'
        else:
            polish_instruction = ""

        raw_prompt = get_system_prompt("analyze_essay")
        if not raw_prompt:
            raise HTTPException(status_code=500, detail="System prompt not found.")

        prompt_text = raw_prompt.replace("{{lang_instruction}}", lang_instruction)\
                                .replace("{{polish_instruction}}", polish_instruction)\
                                .replace("{{input_text}}", input.text)

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

        # 5. CHUẨN BỊ KẾT QUẢ TRẢ VỀ (Convert sang Dict)
        response_data = result.model_dump()

        # 6. LƯU DATABASE & GẮN ID
        if input.user_id:
            supabase.table("user_usage").update({"usage_count": usage_count + 1}).eq("user_id", input.user_id).execute()

            try:
                sub_data = {
                    "user_id": input.user_id,
                    "original_text": input.text,
                    "corrected_text": result.corrected_text,
                    "score": result.score,
                    "general_feedback": result.general_feedback,
                    "target_language": input.native_language,
                    "polished_text": getattr(result, 'polished_text', None) 
                }
                
                sub_res = supabase.table("submissions").insert(sub_data).execute()
                
                if sub_res.data:
                    # [QUAN TRỌNG] Gắn ID vào response để Frontend nhận được
                    submission_id = sub_res.data[0]['id']
                    response_data['submission_id'] = submission_id
                    
                    err_data = [{
                        "submission_id": submission_id,
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

        return response_data

    except HTTPException as he:
        raise he
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# ENDPOINT 2: BATCH QUIZ
# ==========================================
@app.post("/generate-batch-quiz")
def generate_batch_quiz(input: BatchQuizRequest):
    try:
        error_list_text = ""
        for err in input.errors:
            error_list_text += f"- Error '{err.error_type}' in phrase: '{err.quote}'\n"

        target_lang = input.language.strip()
        
        if target_lang.lower() in ["english", "en", "us", "uk"]:
            lang_instruction = "Write everything in English."
        else:
            lang_instruction = f"""
            IMPORTANT: Create quiz for '{target_lang}' speaker.
            1. 'question': Instruction in {target_lang}.
            2. 'options': English.
            3. 'explanation': {target_lang}.
            """

        raw_prompt = get_system_prompt("generate_quiz")
        if not raw_prompt:
            raise HTTPException(status_code=500, detail="Quiz prompt not found.")
            
        prompt_text = raw_prompt.replace("{{error_list_text}}", error_list_text)\
                                .replace("{{lang_instruction}}", lang_instruction)

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
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# ENDPOINT 3: DEBUG UPGRADE
# ==========================================
@app.post("/debug/upgrade-pro")
def debug_upgrade_pro(req: UpgradeRequest):
    try:
        user_res = supabase.table("user_usage").select("*").eq("user_id", req.user_id).execute()
        
        if not user_res.data:
            supabase.table("user_usage").insert({
                "user_id": req.user_id, "is_pro": True, "usage_count": 0
            }).execute()
        else:
            supabase.table("user_usage").update({"is_pro": True}).eq("user_id", req.user_id).execute()
            
        return {"message": "Upgrade successful!", "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# ENDPOINT 4: RETROACTIVE UPGRADE (Fix bài cũ)
# ==========================================
@app.post("/upgrade-submission")
def upgrade_submission(req: UpgradeSubmissionRequest):
    try:
        # 1. Check quyền Pro
        usage_res = supabase.table("user_usage").select("is_pro").eq("user_id", req.user_id).execute()
        if not usage_res.data or not usage_res.data[0].get('is_pro'):
             raise HTTPException(status_code=403, detail="User is not Pro")

        # 2. Lấy bài viết cũ
        sub_res = supabase.table("submissions").select("*").eq("id", req.submission_id).execute()
        if not sub_res.data:
            raise HTTPException(status_code=404, detail="Submission not found")
        
        submission = sub_res.data[0]
        
        # Nếu đã có rồi thì trả về luôn
        if submission.get('polished_text'):
            return {"polished_text": submission['polished_text']}

        # 3. Gọi AI Rewrite
        prompt = f"""
        Act as an IELTS Expert. Rewrite the following essay to achieve Band 9.0 Score.
        Use C2 Vocabulary, advanced grammar structures, and academic tone.
        Keep the original meaning.
        Original Text:
        "{submission['original_text']}"
        
        Output ONLY the rewritten text. No introduction or explanations.
        """
        
        response = genai_client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt
        )
        polished_text = response.text.strip()

        # 4. Update DB
        supabase.table("submissions").update({"polished_text": polished_text}).eq("id", req.submission_id).execute()

        return {"polished_text": polished_text}

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))