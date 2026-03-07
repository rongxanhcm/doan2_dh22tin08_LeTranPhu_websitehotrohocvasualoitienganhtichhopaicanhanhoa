import os
import traceback
import json
from datetime import datetime
from typing import List, Optional, Union
import hmac
import hashlib
from functools import lru_cache # [NEW] Để cache prompt
import requests
from fastapi import Request, Header
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from supabase import create_client, Client
from google import genai
from google.genai import types
from pydantic import BaseModel, Field  # <--- Thêm Field vào đây
import redis
# Load biến môi trường
load_dotenv()
r = redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"), decode_responses=True)
# --- CẤU HÌNH ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") 
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
# Secret Webhook (Thay bằng mã thực tế của bạn)
LEMONSQUEEZY_WEBHOOK_SECRET = os.getenv("LEMONSQUEEZY_WEBHOOK_SECRET")
# Khởi tạo Clients
genai_client = genai.Client(api_key=GEMINI_API_KEY)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

# Danh sách các domain được phép gọi API của bạn
# Hãy thay bằng domain thật của bạn khi launch
origins = [
    "http://localhost:3000",          # Cho phép lúc bạn test ở máy tính
    "https://www.wrytt.me", # Tên miền thật của frontend
    "https://wrytt.com"    # Tên miền không có www
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Thay ["*"] bằng biến origins ở trên
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CONSTANTS ---
FREE_DAILY_LIMIT = 2   
PRO_DAILY_LIMIT = 50   
FREE_DAILY_QUIZ_LIMIT = 6
MIN_WORD_COUNT = 15

# --- [NEW] HELPER FUNCTION WITH CACHE ---
# Dùng cache để không tốn thời gian gọi DB mỗi lần request
@lru_cache(maxsize=5) 
def get_system_prompt_cached(key: str):
    try:
        response = supabase.table("system_prompts").select("content").eq("key", key).single().execute()
        if response.data:
            return response.data['content']
        return None
    except Exception as e:
        print(f"⚠️ Lỗi lấy prompt từ DB: {str(e)}")
        return None

class ErrorDetail(BaseModel):
    error_type: str
    quote: str
    severity: str
    explanation: str
    # 👇 SỬA DÒNG NÀY: Thêm mô tả để AI không bị "ngu"
    suggestion: str = Field(description="The replacement text ONLY. No explanation. Example: 'likes'")

# [FIX] Tách schema để tiết kiệm token
class BaseEssayAssessment(BaseModel):
    score: float
    general_feedback: str
    core_errors: List[ErrorDetail]
    corrected_text: str
    # KHÔNG CÓ polished_text ở đây để tránh AI tự bịa ra cho user Free

# [FIX] Schema riêng cho Pro
class ProEssayAssessment(BaseEssayAssessment):
    polished_text: str 

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

class SingleErrorQuizRequest(BaseModel):
    error_type: str
    quote: str
    language: str = "vi"
    native_language: str = "English"  # AI feedback language

class QuizQuestion(BaseModel):
    id: int
    question: str
    options: List[str]
    correct_answer_index: int
    explanation: str

class BatchQuizResponse(BaseModel):
    questions: List[QuizQuestion]

# Model Debug & Upgrade
class UpgradeRequest(BaseModel):
    user_id: str

class UpgradeSubmissionRequest(BaseModel):
    submission_id: Union[int, str]
    user_id: str

class PortalRequest(BaseModel):
    user_email: str

class ForgotPasswordRequest(BaseModel):
    email: str
    # URL trang frontend để user nhập pass mới (phải khớp với Redirect URLs ở Bước 1)
    redirect_url: str = "http://localhost:3000/update-password" 

class UpdatePasswordRequest(BaseModel):
    new_password: str


def rebuild_corrected_text_from_errors(original_text: str, errors: List[ErrorDetail]) -> str:
    """Best-effort fallback to reconstruct corrected text from quote->suggestion pairs."""
    if not original_text or not errors:
        return original_text

    indexed_errors = []
    for err in errors:
        quote = (err.quote or "").strip()
        suggestion = (err.suggestion or "").strip()
        if not quote or not suggestion:
            continue

        idx = original_text.find(quote)
        if idx == -1:
            continue

        indexed_errors.append((idx, quote, suggestion))

    if not indexed_errors:
        return original_text

    indexed_errors.sort(key=lambda item: item[0])
    rebuilt_parts = []
    cursor = 0

    for idx, quote, suggestion in indexed_errors:
        if idx < cursor:
            continue
        rebuilt_parts.append(original_text[cursor:idx])
        rebuilt_parts.append(suggestion)
        cursor = idx + len(quote)

    rebuilt_parts.append(original_text[cursor:])
    rebuilt = "".join(rebuilt_parts)
    return rebuilt if rebuilt else original_text
# ==========================================
# ENDPOINT 1: ANALYZE ESSAY (ĐÃ TỐI ƯU)
# ==========================================
@app.post("/analyze")
def analyze_essay(input: EssayInput, request: Request):
    try:
        # 1. VALIDATION
        word_count = len(input.text.strip().split())
        if word_count < MIN_WORD_COUNT:
            raise HTTPException(status_code=400, detail=f"Bài viết quá ngắn ({word_count} từ).")

        # 2. CHECK QUOTA & QUYỀN
        is_pro = False
        usage_count = 0
        visitor_id = request.headers.get("X-Visitor-Id")
        
        # --- LUỒNG 1: USER ĐÃ LOGIN (Giữ nguyên gốc của ông) ---
        if input.user_id:
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
                raise HTTPException(status_code=403, detail=f"Daily limit reached. Upgrade to Pro for more!")

        # --- LUỒNG 2: GUEST (Dùng bảng riêng guest_usage) ---
        else:
            if not visitor_id:
                raise HTTPException(status_code=400, detail="Missing device identifier.")
            
            guest_res = supabase.table("guest_usage").select("*").eq("visitor_id", visitor_id).execute()
            
            if guest_res.data:
                # Nếu tìm thấy visitor_id trong bảng guest -> Chặn luôn (1 bài vĩnh viễn)
                raise HTTPException(status_code=403, detail="Guest limit reached. Please login to continue!")
            
            is_pro = False # Guest mặc định không bao giờ có Pro

        # 3. CHUẨN BỊ PROMPT & SCHEMA (Phần này chung)
        target_lang = input.native_language.strip()
        lang_instruction = "Output JSON in English." if target_lang.lower() in ["english", "en", "us", "uk"] else \
            f"CRITICAL RULE: Write 'general_feedback' AND 'explanation' COMPLETELY in {target_lang}. Keep 'error_type' in English."
        
        # Vì Guest không bao giờ là Pro nên polish_instruction sẽ luôn trống cho Guest
        polish_instruction = (
            ', "polished_text": "<Rewrite to advanced/professional level with refined vocabulary. '
            'CRITICAL: Keep word count similar to original (max +10%). '
            'Focus on upgrading vocabulary and grammar structures ONLY. '
            'Do NOT expand ideas or add new sentences.>"'
        ) if is_pro else ""
        
        target_schema = ProEssayAssessment if is_pro else BaseEssayAssessment

        raw_prompt = get_system_prompt_cached("analyze_essay")
        prompt_text = raw_prompt.replace("{{lang_instruction}}", lang_instruction)\
                                .replace("{{polish_instruction}}", polish_instruction)\
                                .replace("{{input_text}}", input.text)

        # 4. GỌI GEMINI
        response = genai_client.models.generate_content(
            model='gemini-2.5-flash-lite', # Dùng model nhẹ hơn cho task này để tiết kiệm token và tăng tốc độ
            contents=prompt_text,
            config=types.GenerateContentConfig(response_mime_type='application/json', response_schema=target_schema)
        )
        result = response.parsed

        if result.corrected_text.strip() == input.text.strip() and result.core_errors:
            rebuilt_corrected = rebuild_corrected_text_from_errors(input.text, result.core_errors)
            if rebuilt_corrected.strip() != input.text.strip():
                result.corrected_text = rebuilt_corrected

        response_data = result.model_dump()

        # 5. LƯU QUOTA (Tách biệt)
        if input.user_id:
            supabase.table("user_usage").update({"usage_count": usage_count + 1}).eq("user_id", input.user_id).execute()
        else:
            # Lưu vào bảng guest_usage
            supabase.table("guest_usage").insert({"visitor_id": visitor_id, "usage_count": 1}).execute()

        # 6. LƯU SUBMISSION
       # 6. LƯU SUBMISSION VÀ KẾT QUẢ PHÂN TÍCH
        # Khởi tạo biến trước để tránh lỗi "UnboundLocalError"
        sub_res = None 
        
        try:
            # Clean data: Đảm bảo user_id là None nếu rỗng
            final_user_id = input.user_id if input.user_id else None
            
            # Nếu là Guest (user_id=None) thì lấy visitor_id, ngược lại là None
            final_visitor_id = visitor_id if not final_user_id else None
            
            polished_content = getattr(result, 'polished_text', None)
            
            sub_data = {
                "user_id": final_user_id,         # UUID hoặc None
                "visitor_id": final_visitor_id,   # Fingerprint hoặc None
                "original_text": input.text,
                "corrected_text": result.corrected_text,
                "score": result.score,
                "general_feedback": result.general_feedback,
                "target_language": input.native_language,
                "polished_text": polished_content
            }
            
            # --- QUAN TRỌNG: GỌI INSERT ---
            # Lưu ý: Nếu vẫn không lưu được, 99% là do Key Supabase bị RLS chặn
            sub_res = supabase.table("submissions").insert(sub_data).execute()
            
            if sub_res and sub_res.data:
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
            else:
                print(f"⚠️ Cảnh báo: Insert thành công nhưng không trả về data (Có thể do RLS). Data: {sub_res.data}")
                        
        except Exception as db_err:
            print(f"⚠️ Lỗi lưu Database: {db_err}")
            # Không raise lỗi ở đây để user vẫn nhận được kết quả chấm bài JSON

        return response_data

    except HTTPException as he: raise he
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# ENDPOINT 2: BATCH QUIZ(REMOVED)
# ==========================================

# ==========================================
# ENDPOINT 2B: GENERATE SINGLE ERROR QUIZ (10 Questions)
# ==========================================
@app.post("/generate-quiz-single")
def generate_quiz_single(input: SingleErrorQuizRequest, request: Request):
    try:
        # Get user_id from request headers (if available)
        user_id = request.headers.get("X-User-Id")
        is_pro = False
        
        # Check quiz limit for free users
        if user_id:
            usage_res = supabase.table("user_usage").select("*").eq("user_id", user_id).execute()
            if usage_res.data:
                usage_data = usage_res.data[0]
                is_pro = usage_data.get('is_pro', False)
                
                # Only enforce limit for free users
                if not is_pro:
                    # Check if it's a new day
                    last_reset = usage_data.get('last_quiz_reset_date')
                    today_str = datetime.now().strftime('%Y-%m-%d')
                    
                    if last_reset != today_str:
                        # Reset quiz count for new day
                        supabase.table("user_usage").update({
                            "quiz_count": 0,
                            "last_quiz_reset_date": today_str
                        }).eq("user_id", user_id).execute()
                        quiz_count = 0
                    else:
                        quiz_count = usage_data.get('quiz_count', 0)
                    
                    # Check if user has exceeded daily quiz limit
                    if quiz_count >= FREE_DAILY_QUIZ_LIMIT:
                        raise HTTPException(status_code=429, detail=f"Daily quiz limit reached ({FREE_DAILY_QUIZ_LIMIT}/day). Upgrade to Pro for unlimited quizzes!")
        
        # Question language (from settings/user preference)
        question_lang = input.language.strip()
        # AI feedback language (explanation)
        feedback_lang = input.native_language.strip()
        
        # Determine language instruction
        if feedback_lang.lower() in ["english", "en", "us", "uk"]:
            lang_instruction = f"All output (question instruction, options, explanation) in English."
        else:
            lang_instruction = f"Question instruction in {feedback_lang}. Options in ENGLISH. Explanation in {feedback_lang}."

        # Get system prompt for single error quiz (or fallback)
        raw_prompt = get_system_prompt_cached("generate_quiz")
        if not raw_prompt:
            raw_prompt = """You are an expert Writing Tutor creating focused practice drills for grammar and spelling errors.

TARGET ERROR CONTEXT:
- Error Type: {{error_type}}
- Student's Mistake: \"{{quote}}\"

LANGUAGE INSTRUCTIONS (CRITICAL):
{{lang_instruction}}

TASK:
Generate exactly 10 multiple-choice questions (Cloze Test style) to master the **underlying rule** of this error.

CRITICAL DIVERSITY RULE (MUST FOLLOW):
1. **Analyze the Pattern**: Do NOT just test the exact word the student missed repeatedly. Identify the *category* of the error.
   - If error is **Spelling**: Identify the rule (e.g., \"ie vs ei\", \"double consonants\", \"suffix -ous\"). Test 10 DIFFERENT words following that rule.
   - If error is **Grammar** (e.g., Past Tense): Test 10 DIFFERENT verbs/scenarios, not just the one in the quote.
2. **Progression**:
   - Q1-3: Test the specific word/case the student got wrong (Direct fix).
   - Q4-7: Test **similar words/cases** aiming at the same rule (Expansion).
   - Q8-10: Test **complex/exception cases** of that rule (Mastery).

STRICT FORMATTING RULES:
1. **The Question**:
   - It MUST be a \"Cloze Test\" style (Fill-in-the-blank).
   - The *instruction* part must follow the LANGUAGE INSTRUCTIONS.
   - The *target sentence* containing the blank `_______` must remain in **ENGLISH**.
   - Create NEW sentences relevant to academic/professional writing contexts.
2. **The Options**:
   - Must be in **ENGLISH**.
   - Provide 4 options: 1 correct, 3 plausible distractors.
3. **The Explanation**:
   - Must follow the LANGUAGE INSTRUCTIONS (Native Language).
   - Explain the *rule*, not just the word.

OUTPUT FORMAT (Strict JSON):
{
  \"questions\": [
    {
      \"id\": 1,
      \"question\": \"Choose the correct spelling: 'The environmental damage is _______.'\" ,
      \"options\": [\"serious\", \"serius\", \"sereous\", \"cerious\"],
      \"correct_answer_index\": 0,
      \"explanation\": \"Explanation in Native Language...\"
    }
  ]
}"""

        prompt_text = raw_prompt.replace("{{error_type}}", input.error_type)\
                                .replace("{{quote}}", input.quote)\
                                .replace("{{lang_instruction}}", lang_instruction)

        response = genai_client.models.generate_content(
            model='gemini-2.5-flash-lite',
            contents=prompt_text,
            config=types.GenerateContentConfig(
                response_mime_type='application/json',
                response_schema=BatchQuizResponse
            )
        )
        
        result = response.parsed
        # Ensure we have exactly 10 questions (cap if more, or add if less - though shouldn't happen)
        if len(result.questions) > 10:
            result.questions = result.questions[:10]
        
        # Increment quiz count after successful generation (only for logged-in free users)
        if user_id and not is_pro:
            supabase.table("user_usage").update({
                "quiz_count": usage_data.get('quiz_count', 0) + 1
            }).eq("user_id", user_id).execute()
        
        return result

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# ENDPOINT 3: RETROACTIVE UPGRADE (Fix bài cũ)
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
        
        if submission.get('polished_text'):
            return {"polished_text": submission['polished_text']}

        # 3. Gọi AI Rewrite (Dùng model mạnh hơn cho task này nếu cần, hoặc flash cho rẻ)
        prompt = f"""
        Rewrite to advanced/professional level with refined vocabulary. Keep meaning and intent. Output ONLY the rewritten text.
        Original: "{submission['original_text']}"
        """
        
        response = genai_client.models.generate_content(
            model='gemini-2.5-flash-lite', # Dùng 1.5 Flash vẫn tốt, hoặc đổi sang 2.0-flash
            contents=prompt
        )
        polished_text = response.text.strip()

        # 4. Update DB
        supabase.table("submissions").update({"polished_text": polished_text}).eq("id", req.submission_id).execute()

        return {"polished_text": polished_text}

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# ENDPOINT 5: WEBHOOK
# ==========================================
@app.post("/webhook")
async def lemon_squeezy_webhook(request: Request, x_signature: str = Header(None)):
    if not LEMONSQUEEZY_WEBHOOK_SECRET:
        raise HTTPException(status_code=500, detail="Server chưa cấu hình Webhook Secret")

    # 1. Verify Signature (Giữ nguyên)
    raw_body = await request.body()
    digest = hmac.new(
        LEMONSQUEEZY_WEBHOOK_SECRET.encode("utf-8"),
        raw_body,
        digestmod=hashlib.sha256
    ).hexdigest()

    if not x_signature or not hmac.compare_digest(digest, x_signature):
        raise HTTPException(status_code=401, detail="Invalid signature")

    # 2. Parse Data
    data = await request.json()
    event_name = data.get("meta", {}).get("event_name")
    
    # Lấy User ID từ custom_data (Lemon Squeezy luôn gửi kèm cái này nếu lúc mua bạn đã gắn)
    meta_data = data.get("meta", {}).get("custom_data", {})
    user_id = meta_data.get("user_id")

    print(f"🔔 Webhook Event: {event_name} | User: {user_id}")

    # ---------------------------------------------------------
    # CASE 1: MUA MỚI HOẶC GIA HẠN THÀNH CÔNG -> UP PRO
    # ---------------------------------------------------------
    # order_created: Mua lần đầu
    # subscription_created: Đăng ký mới
    # subscription_payment_success: Gia hạn thành công tháng sau
    if event_name in ["order_created", "subscription_created", "subscription_payment_success"]:
        if user_id:
            try:
                # Upsert: Nếu chưa có thì tạo, có rồi thì update
                # Lưu ý: Cần check xem record đã tồn tại chưa để quyết định insert hay update
                existing = supabase.table("user_usage").select("*").eq("user_id", user_id).execute()
                
                if not existing.data:
                    supabase.table("user_usage").insert({
                        "user_id": user_id, "is_pro": True, "usage_count": 0
                    }).execute()
                else:
                    supabase.table("user_usage").update({"is_pro": True}).eq("user_id", user_id).execute()
                
                print(f"✅ UPGRADE SUCCESS: {user_id}")
                return {"status": "upgraded"}
            except Exception as e:
                print(f"❌ Error upgrading: {str(e)}")

    # ---------------------------------------------------------
    # CASE 2: HẾT HẠN / HỦY NGANG -> VỀ FREE (CÁI BẠN ĐANG THIẾU)
    # ---------------------------------------------------------
    # subscription_expired: Hết hạn (đã hết grace period)
    # subscription_payment_failed: Gia hạn thất bại (thẻ hết tiền...)
    elif event_name in ["subscription_expired", "subscription_payment_failed"]:
        if user_id:
            try:
                supabase.table("user_usage").update({"is_pro": False}).eq("user_id", user_id).execute()
                print(f"🔻 DOWNGRADE SUCCESS: {user_id}")
                return {"status": "downgraded"}
            except Exception as e:
                print(f"❌ Error downgrading: {str(e)}")

    # ---------------------------------------------------------
    # CASE 3: KHÁCH BẤM HỦY (VẪN GIỮ PRO ĐẾN HẾT THÁNG)
    # ---------------------------------------------------------
    elif event_name == "subscription_cancelled":
        # Ở đây chúng ta KHÔNG set is_pro = False ngay.
        # Vì khách đã trả tiền cho cả tháng rồi.
        # Chỉ cần log ra thôi, đợi khi nào event "subscription_expired" bắn sang thì mới cắt.
        print(f"⚠️ User {user_id} has cancelled renewal. Access remains until expiry.")
        return {"status": "cancelled_renewal"}

    return {"status": "ignored"}

@app.get("/webhook")
def check_webhook_get():
    print("⚠️ CẢNH BÁO: Đang nhận được request GET (lẽ ra phải là POST)!")
    return {
        "status": "error", 
        "message": "Bạn đang gửi GET request. Hãy kiểm tra lại URL trong Lemon Squeezy, xóa dấu / ở cuối đi."
    }

@app.post("/generate-portal-link")
def generate_portal_link(req: PortalRequest):
    try:
        # 1. Cấu hình Header gọi Lemon Squeezy API
        # API Key lấy từ Dashboard -> Settings -> API Keys
        LS_API_KEY = os.getenv("LEMONSQUEEZY_API_KEY") 
        headers = {
            "Accept": "application/vnd.api+json",
            "Content-Type": "application/vnd.api+json",
            "Authorization": f"Bearer {LS_API_KEY}"
        }

        # 2. Tìm Customer ID dựa trên Email
        # (Cách chuẩn là lưu customer_id vào DB lúc mua, nhưng tìm theo email là cách chữa cháy nhanh nhất)
        search_url = f"https://api.lemonsqueezy.com/v1/customers?filter[email]={req.user_email}"
        response = requests.get(search_url, headers=headers)
        data = response.json()
        print(f"DEBUG LEMON: Email={req.user_email}")
        print(f"DEBUG LEMON: Response={data}")
        if not data.get("data"):
            raise HTTPException(status_code=404, detail="No subscription found for this email")

        # Lấy khách hàng đầu tiên tìm thấy
        customer = data["data"][0]
        # Link portal nằm sẵn trong thuộc tính của customer
        portal_url = customer["attributes"]["urls"]["customer_portal"]

        return {"url": portal_url}

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Could not generate portal link")
        
@app.post("/auth/forgot-password")
def forgot_password(req: ForgotPasswordRequest):
    try:
        # Supabase sẽ gửi email chứa link reset password cho user
        # Khi bấm link, user sẽ được redirect về req.redirect_url kèm theo access_token
        res = supabase.auth.reset_password_email(
            req.email, 
            options={"redirect_to": req.redirect_url}
        )
        return {"message": "Password reset email sent. Please check your inbox."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Cần thêm Header để lấy Token xác thực user
@app.post("/auth/update-password")
def update_password(req: UpdatePasswordRequest, authorization: str = Header(None)):
    try:
        if not authorization:
            raise HTTPException(status_code=401, detail="Missing Access Token")

        # Token thường có dạng "Bearer <token>", ta cần lấy phần <token>
        token = authorization.split(" ")[1] if " " in authorization else authorization

        auth_url = f"{SUPABASE_URL}/auth/v1/user"
        headers = {
            "Authorization": f"Bearer {token}",
            "apikey": SUPABASE_KEY,
            "Content-Type": "application/json",
        }

        response = requests.put(auth_url, headers=headers, json={"password": req.new_password})
        if response.status_code >= 400:
            detail = response.json().get("msg") if response.headers.get("content-type", "").startswith("application/json") else None
            raise HTTPException(status_code=400, detail=detail or "Could not update password. Token might be expired.")

        return {"message": "Password updated successfully"}

    except Exception as e:
        print(f"Error updating password: {e}")
        raise HTTPException(status_code=400, detail="Could not update password. Token might be expired.")

# ==========================================
# DELETE GRAMMAR RULE (ADMIN ONLY)
# ==========================================
class DeleteRuleRequest(BaseModel):
    rule_id: int

@app.post("/delete-grammar-rule")
def delete_grammar_rule(req: DeleteRuleRequest, authorization: str = Header(None)):
    """
    Delete a grammar rule. Only admins can do this.
    Uses backend service key to bypass RLS policies.
    """
    try:
        if not authorization:
            raise HTTPException(status_code=401, detail="Missing Access Token")

        # Extract token
        token = authorization.split(" ")[1] if " " in authorization else authorization

        # Verify user
        auth_url = f"{SUPABASE_URL}/auth/v1/user"
        auth_headers = {
            "Authorization": f"Bearer {token}",
            "apikey": SUPABASE_KEY,
        }
        
        user_response = requests.get(auth_url, headers=auth_headers)
        if user_response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user_data = user_response.json()
        user_id = user_data.get("id")
        
        # Check if user is admin - try to get role from profiles table
        try:
            user_profile = supabase.table("profiles").select("role").eq("id", user_id).single().execute()
            if user_profile.data:
                user_role = user_profile.data.get("role")
                if user_role != "admin":
                    raise HTTPException(status_code=403, detail="Only admins can delete grammar rules")
            else:
                raise HTTPException(status_code=403, detail="User profile not found")
        except Exception as profile_error:
            print(f"Warning: Could not verify admin role: {profile_error}")
            # If we can't check role, deny access for safety
            raise HTTPException(status_code=403, detail="Could not verify admin credentials")
        
        # Delete the rule (backend service key bypasses RLS)
        delete_result = supabase.table("grammar_rules").delete().eq("id", req.rule_id).execute()
        
        print(f"✅ Rule {req.rule_id} deleted by admin {user_id}")
        return {"message": f"Rule {req.rule_id} deleted successfully"}

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error deleting rule: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)