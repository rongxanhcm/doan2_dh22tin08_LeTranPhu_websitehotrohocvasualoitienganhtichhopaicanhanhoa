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
    error_type: str = Field(description="Name of the error (e.g., Spelling, Grammar)")
    quote: str = Field(description="The EXACT substring from the original text that contains the error.") # <--- [MỚI]
    severity: str = Field(description="High or Medium")
    explanation: str = Field(description="Why it is wrong (in Vietnamese)")
    suggestion: str = Field(description="How to fix it")

class EssayAssessment(BaseModel):
    score: float = Field(description="Estimated IELTS score")
    general_feedback: str = Field(description="Short summary")
    core_errors: List[ErrorDetail]
    corrected_text: str = Field(description="Rewritten text")
# --- MODELS CHO QUIZ ---
class QuizRequest(BaseModel):
    error_type: str
    original_sentence: str # Câu văn chứa lỗi của user (Contextual Level 2)
    language: str = "vi"

class QuizQuestion(BaseModel):
    question: str = Field(description="The question text asking user to fix the error")
    options: List[str] = Field(description="List of 4 options (A, B, C, D)")
    correct_answer_index: int = Field(description="Index of the correct option (0-3)")
    explanation: str = Field(description="Explanation why the answer is correct")
@app.post("/analyze")
@app.post("/analyze")
def analyze_essay(input: EssayInput):
    try:
        # 1. Cấu hình chỉ thị ngôn ngữ
        lang_instruction = ""
        if input.language == "vi":
            lang_instruction = "IMPORTANT: The 'text' input is English, but you must write 'explanation', 'suggestion', and 'general_feedback' in VIETNAMESE. Keep 'error_type' in English terminology."
        else:
            lang_instruction = "Write explanation and suggestion in English."

        # 2. Prompt "Thần thánh" (Đã thêm yêu cầu về QUOTE)
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

        # 3. Gọi AI (Dùng 1.5 Flash cho ổn định JSON)
        response = genai_client.models.generate_content(
            model='gemini-2.5-flash-lite', 
            contents=prompt_text,
            config=types.GenerateContentConfig(
                response_mime_type='application/json',
                response_schema=EssayAssessment
            )
        )
        
        result = response.parsed

        # 4. LƯU VÀO DATABASE
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
                
                # Lấy ID vừa tạo (Check kỹ cấu trúc trả về của Supabase python)
                if sub_response.data:
                    submission_id = sub_response.data[0]['id']

                    # B. Lưu danh sách lỗi vào bảng analysis_results
                    errors_data = []
                    for err in result.core_errors:
                        errors_data.append({
                            "submission_id": submission_id,
                            "error_type": err.error_type,
                            "severity": err.severity,
                            "explanation": err.explanation,
                            "suggestion": err.suggestion,
                            "quote": err.quote  # <--- [QUAN TRỌNG]: Lưu quote vào DB
                        })
                    
                    if errors_data:
                        supabase.table("analysis_results").insert(errors_data).execute()
                        print(f"✅ Đã lưu thành công Submission ID: {submission_id}")
                else:
                    print("⚠️ Không lấy được Submission ID từ Supabase")

            except Exception as db_error:
                print(f"⚠️ Lỗi lưu Database: {db_error}")
                traceback.print_exc() # In chi tiết lỗi để debug

        return result

    except Exception as e:
        print(f"========== LỖI SERVER: {str(e)} ==========") 
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
@app.post("/generate-quiz")
def generate_quiz(input: QuizRequest):
    try:
        # Chỉ thị ngôn ngữ
        lang_instruction = ""
        if input.language == "vi":
            lang_instruction = "IMPORTANT: The 'question', 'options', and 'explanation' must be in VIETNAMESE."
        else:
            lang_instruction = "Write everything in English."

# [SỬA LẠI PROMPT]: Ép AI tập trung vào tiểu tiết (Micro-skills)
        prompt_text = f"""
        Act as an strict English Grammar Tutor. 
        
        Student's Sentence: "{input.original_sentence}"
        Target Error to fix: "{input.error_type}" 
        (IMPORTANT: The sentence may have multiple errors, but ONLY focus on the target error).
        
        Task: Create a "Fill-in-the-blank" or "Spot the error" multiple-choice question.
        
        STRICT RULES FOR GENERATION:
        1. **Scope**: Do NOT use the full sentence as options. Isolate the specific phrase containing the error.
        2. **Question Style**: Quote a small segment of the sentence, replace the error part with `_______`, and ask the student to choose the best fit.
        3. **Options**: Must be short (words or short phrases). 
           - 1 Correct option (Fixes the target error).
           - 3 Distractor options (Common mistakes, or the original wrong word).
        4. **Context**: If the error is about Capitalization or Punctuation, ask specifically about that rule (e.g., "Which punctuation is missing here?").
        
        {lang_instruction}

        Example logic:
        - If error is "Missing verb" in "she would mad", the question should focus on "would _______ mad". Options: ["be", "being", "is", "been"].
        - If error is "Capitalization" in "i want", the question should focus on "How to write the subject?". Options: ["I", "i", "me", "my"].
        """

        response = genai_client.models.generate_content(
            model='gemini-2.5-flash-lite',
            contents=prompt_text,
            config=types.GenerateContentConfig(
                response_mime_type='application/json',
                response_schema=QuizQuestion
            )
        )
        
        return response.parsed

    except Exception as e:
        print(f"========== LỖI QUIZ: {str(e)} ==========") 
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
# 1. Thêm Model mới nhận danh sách
class ErrorItem(BaseModel):
    id: int # ID của lỗi trong DB (để sau này map lại)
    error_type: str
    original_text: str # Câu văn chứa lỗi

class BatchQuizRequest(BaseModel):
    errors: List[ErrorItem]
    language: str = "vi"

# Model trả về là danh sách câu hỏi
class QuizQuestion(BaseModel):
    id: int # ID của lỗi tương ứng
    question: str
    options: List[str]
    correct_answer_index: int
    explanation: str

class BatchQuizResponse(BaseModel):
    questions: List[QuizQuestion]

# 2. Endpoint mới: Gen 1 lần nhiều câu
@app.post("/generate-batch-quiz")
def generate_batch_quiz(input: BatchQuizRequest):
    try:
        lang_instruction = "IMPORTANT: Write question, options, explanation in VIETNAMESE." if input.language == "vi" else "Write in English."
        
        # Chuẩn bị context cho AI (gửi danh sách lỗi lên)
        error_list_text = ""
        for err in input.errors:
            error_list_text += f"- ID {err.id}: Error '{err.error_type}' in sentence: '{err.original_text}'\n"

        # ... (Đoạn trên giữ nguyên)

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
        
        Generte the JSON response now.
        """
        
        # ... (Đoạn dưới giữ nguyên)

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