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
print("CWD =", os.getcwd())
print("GOOGLE_API_KEY =", os.getenv("GOOGLE_API_KEY"))

# --- CẤU HÌNH ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") # Lưu ý: check tên biến môi trường của bạn (GOOGLE_API_KEY hoặc GEMINI_API_KEY)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# --- ĐOẠN CODE KIỂM TRA LỖI MỚI (Chi tiết hơn) ---
missing_vars = []
if not GEMINI_API_KEY:
    missing_vars.append("GOOGLE_API_KEY") # Hoặc GEMINI_API_KEY tùy bạn đặt
if not SUPABASE_URL:
    missing_vars.append("SUPABASE_URL")
if not SUPABASE_KEY:
    missing_vars.append("SUPABASE_KEY")

if missing_vars:
    # In ra log để xem trên Render
    print(f"❌ CÁC BIẾN MÔI TRƯỜNG ĐANG THIẾU: {', '.join(missing_vars)}")
    print(f"👉 Hãy vào Render > Environment > Add các biến trên vào.")
    raise ValueError(f"Thiếu các biến môi trường: {', '.join(missing_vars)}")

# Khởi tạo Clients
genai_client = genai.Client(api_key=GEMINI_API_KEY)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Trong production nên để domain cụ thể
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CONSTANTS ---
DAILY_LIMIT = 3        # Số bài tối đa mỗi ngày
MIN_WORD_COUNT = 15    # Số từ tối thiểu

# --- MODELS CHO ANALYZE ---
class EssayInput(BaseModel):
    text: str
    user_id: Optional[str] = None
    language: str = "vi"

class ErrorDetail(BaseModel):
    error_type: str = Field(description="Name of the error (e.g., Spelling, Grammar)")
    quote: str = Field(description="The EXACT substring from the original text that contains the error.") 
    severity: str = Field(description="High or Medium")
    explanation: str = Field(description="Why it is wrong (in Vietnamese)")
    suggestion: str = Field(description="How to fix it")

class EssayAssessment(BaseModel):
    score: float = Field(description="Estimated IELTS score")
    general_feedback: str = Field(description="Short summary")
    core_errors: List[ErrorDetail]
    corrected_text: str = Field(description="Rewritten text")

# --- MODELS CHO QUIZ ---
class ErrorItem(BaseModel):
    id: int
    error_type: str
    quote: str          # <--- [THÊM DÒNG NÀY] Sửa tên thành 'quote' cho khớp DB
class BatchQuizRequest(BaseModel):
    errors: List[ErrorItem]
    language: str = "vi"
    

class QuizQuestion(BaseModel):
    id: int # ID của lỗi tương ứng
    question: str = Field(description="The question text asking user to fix the error")
    options: List[str] = Field(description="List of 4 options")
    correct_answer_index: int = Field(description="Index of the correct option (0-3)")
    explanation: str = Field(description="Explanation why the answer is correct")

class BatchQuizResponse(BaseModel):
    questions: List[QuizQuestion]

# ==========================================
# ENDPOINT 1: ANALYZE ESSAY
# ==========================================
@app.post("/analyze")
def analyze_essay(input: EssayInput):
    try:
        # 1. CHECK ĐỘ DÀI VĂN BẢN
        word_count = len(input.text.strip().split())
        if word_count < MIN_WORD_COUNT:
            raise HTTPException(
                status_code=400, 
                detail=f"Bài viết quá ngắn ({word_count} từ). Vui lòng viết tối thiểu {MIN_WORD_COUNT} từ."
            )

        # 2. CHECK QUOTA (Giới hạn số bài/ngày)
        if input.user_id:
            today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
            
            quota_response = supabase.table("submissions")\
                .select("id", count="exact")\
                .eq("user_id", input.user_id)\
                .gte("created_at", today_start)\
                .execute()
            
            usage_today = quota_response.count
            
            if usage_today >= DAILY_LIMIT:
                raise HTTPException(
                    status_code=429, 
                    detail=f"Bạn đã hết lượt dùng hôm nay ({usage_today}/{DAILY_LIMIT}). Hãy quay lại vào ngày mai!"
                )
            
            print(f"User {input.user_id} - Usage today: {usage_today}/{DAILY_LIMIT}")

        # 3. CẤU HÌNH NGÔN NGỮ & PROMPT
        lang_instruction = ""
        if input.language == "vi":
            lang_instruction = "IMPORTANT: The 'text' input is English, but you must write 'explanation', 'suggestion', and 'general_feedback' in VIETNAMESE. Keep 'error_type' in English terminology."
        else:
            lang_instruction = "Write explanation and suggestion in English."

        prompt_text = f"""
        Act as an IELTS Writing Examiner. Analyze the following text and identify root grammatical errors.
        
        {lang_instruction}

        CRITICAL RULES FOR 'quote':
        1. The 'quote' field MUST be the EXACT substring copied from the student's text that contains the error.
        2. Do NOT change capitalization or punctuation in the 'quote'.
        3. If the error is a missing word, quote the word before OR after the missing spot (context).

        STRICT REQUIREMENT for 'error_type': 
        You must map all errors to one of these standard categories ONLY: 
        ["Past Tense", "Present Tense", "Future Tense", "Subject-Verb Agreement", "Pluralization", "Article Usage", "Word Choice", "Run-on Sentence", "Comma Splice", "Spelling", "Word Form", "Sentence Fragment", "Preposition", "Punctuation", "Passive Voice", "Capitalization"]. 
        If an error doesn't fit perfectly, choose the closest one or use "Other".

        Input text: "{input.text}"
        """

        # 4. GỌI GEMINI
        # Dùng gemini-1.5-flash cho ổn định và nhanh
        response = genai_client.models.generate_content(
            model='gemini-2.5-flash-lite', 
            contents=prompt_text,
            config=types.GenerateContentConfig(
                response_mime_type='application/json',
                response_schema=EssayAssessment
            )
        )
        
        result = response.parsed

        # 5. LƯU VÀO DATABASE
        if input.user_id:
            try:
                # A. Lưu submission
                submission_data = {
                    "user_id": input.user_id,
                    "original_text": input.text,
                    "corrected_text": result.corrected_text,
                    "score": result.score,
                    "general_feedback": result.general_feedback
                }
                
                sub_response = supabase.table("submissions").insert(submission_data).execute()
                
                if sub_response.data:
                    submission_id = sub_response.data[0]['id']

                    # B. Lưu errors (kèm quote)
                    errors_data = []
                    for err in result.core_errors:
                        errors_data.append({
                            "submission_id": submission_id,
                            "error_type": err.error_type,
                            "severity": err.severity,
                            "explanation": err.explanation,
                            "suggestion": err.suggestion,
                            "quote": err.quote 
                        })
                    
                    if errors_data:
                        supabase.table("analysis_results").insert(errors_data).execute()
                        print(f"✅ Đã lưu thành công Submission ID: {submission_id}")

            except Exception as db_error:
                print(f"⚠️ Lỗi lưu Database: {db_error}")
                traceback.print_exc()

        return result

    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        print(f"========== LỖI SERVER: {str(e)} ==========") 
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# ENDPOINT 2: GENERATE BATCH QUIZ
# ==========================================
@app.post("/generate-batch-quiz")
def generate_batch_quiz(input: BatchQuizRequest):
    try:
        lang_instruction = "IMPORTANT: Write question, options, explanation in VIETNAMESE." if input.language == "vi" else "Write in English."
        
        # Chuẩn bị context
        error_list_text = ""
        for err in input.errors:
            error_list_text += f"- ID {err.id}: Error '{err.error_type}' in phrase: '{err.quote}'\n"

        prompt_text = f"""
        Act as an strict English Tutor for a Vietnamese student.
        
        Input Errors (Context):
        {error_list_text}
        
        Task: Generate a multiple-choice quiz (Cloze Test style) to fix these errors.
        
        STRICT LANGUAGE RULES (CRITICAL):
        1. **The Question Content**: The target English sentence MUST remain in **ENGLISH**. Do NOT translate the English sentence.
        2. **The Question Instruction**: The question itself (e.g., "Chọn từ còn thiếu...") MUST be in **VIETNAMESE**.
        3. **The Options**: MUST be in **ENGLISH** (the words to fill in).
        4. **The Explanation**: MUST be in **VIETNAMESE**.

        FORMATTING RULES:
        1. Quote the specific phrase containing the error from the input sentence.
        2. Replace the error part with `_______`.
        3. Example Output Format:
           - Question: "Trong câu 'She _______ to school yesterday', từ nào còn thiếu?" (Mix VI/EN)
           - Options: ["go", "went", "gone", "going"] (EN)
           - Explanation: "Vì có 'yesterday' nên ta dùng thì quá khứ 'went'." (VI)
        
        Generate the JSON response now.
        """

        response = genai_client.models.generate_content(
            model='gemini-2.5-flash-lite',
            contents=prompt_text,
            config=types.GenerateContentConfig(
                response_mime_type='application/json',
                response_schema=BatchQuizResponse
            )
        )
        
        return response.parsed

    except Exception as e:
        print(f"========== LỖI BATCH QUIZ: {str(e)} ==========") 
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))