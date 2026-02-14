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
# Load biến môi trường
load_dotenv()

# --- CẤU HÌNH ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") 
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
# Secret Webhook (Thay bằng mã thực tế của bạn)
LEMONSQUEEZY_WEBHOOK_SECRET = "861218" 

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
# ==========================================
# ENDPOINT 1: ANALYZE ESSAY (ĐÃ TỐI ƯU)
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
                 raise HTTPException(status_code=403, detail=f"Daily limit reached ({limit}/{limit}). Upgrade to Pro for more!")

        # 3. CHUẨN BỊ PROMPT & SCHEMA (TỐI ƯU HÓA)
        target_lang = input.native_language.strip()
        
        # [NEW] Instruction ngắn gọn hơn để tiết kiệm Input Token
        if target_lang.lower() in ["english", "en", "us", "uk"]:
            lang_instruction = "Output JSON in English."
        else:
            lang_instruction = (
                f"CRITICAL RULE: Write 'general_feedback' AND 'explanation' COMPLETELY in {target_lang}. "
                f"Keep 'error_type' in English."
        )   
        # [FIX] Dynamic Schema Check
    # [FIX] Dynamic Schema Check & Length Constraint
        if is_pro:
            # Code CŨ (Gây dài dòng):
            # polish_instruction = ', "polished_text": "<Rewrite the essay to Band 9.0 Level (C2 Vocab)>"'
            
            # Code MỚI (Ép độ dài):
            polish_instruction = (
                ', "polished_text": "<Rewrite to Band 9.0 (C2 Vocab). '
                'CRITICAL: Keep word count similar to original (max +10%). '
                'Focus on upgrading vocabulary and grammar structures ONLY. '
                'Do NOT expand ideas or add new sentences.>"'
            )
            target_schema = ProEssayAssessment
        else:
            # Free: Không có instruction
            polish_instruction = ""
            target_schema = BaseEssayAssessment

        # [NEW] Dùng Cached Prompt
        raw_prompt = get_system_prompt_cached("analyze_essay")
        if not raw_prompt:
            # Fallback nếu DB lỗi (Optional)
            raw_prompt = "Analyze this essay: {{input_text}}. {{lang_instruction}}. {{polish_instruction}}"
            # raise HTTPException(status_code=500, detail="System prompt not found.")

        prompt_text = raw_prompt.replace("{{lang_instruction}}", lang_instruction)\
                                .replace("{{polish_instruction}}", polish_instruction)\
                                .replace("{{input_text}}", input.text)

        # 4. GỌI GEMINI (Dùng model Flash 1.5 cho rẻ)
        response = genai_client.models.generate_content(
            model='gemini-2.5-flash', # [TIẾT KIỆM] Dùng 1.5 thay vì 2.5
            contents=prompt_text,
            config=types.GenerateContentConfig(
                response_mime_type='application/json',
                response_schema=target_schema # [FIX] Schema động
            )
        )
        result = response.parsed

        # 5. CHUẨN BỊ KẾT QUẢ
        response_data = result.model_dump()

        # 6. LƯU DATABASE
        if input.user_id:
            supabase.table("user_usage").update({"usage_count": usage_count + 1}).eq("user_id", input.user_id).execute()

            try:
                # [FIX] Dùng getattr để lấy polished_text an toàn (vì Free ko có trường này)
                polished_content = getattr(result, 'polished_text', None)

                sub_data = {
                    "user_id": input.user_id,
                    "original_text": input.text,
                    "corrected_text": result.corrected_text,
                    "score": result.score,
                    "general_feedback": result.general_feedback,
                    "target_language": input.native_language,
                    "polished_text": polished_content
                }
                
                sub_res = supabase.table("submissions").insert(sub_data).execute()
                
                if sub_res.data:
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
            error_list_text += f"- {err.error_type}: '{err.quote}'\n"

        target_lang = input.language.strip()
        
        # Tối ưu prompt ngắn gọn
        if target_lang.lower() in ["english", "en", "us", "uk"]:
            lang_instruction = "English only."
        else:
            lang_instruction = f"Questions in {target_lang}. Options in English."

        raw_prompt = get_system_prompt_cached("generate_quiz")
        if not raw_prompt:
             raw_prompt = "Generate quiz for errors: {{error_list_text}}. {{lang_instruction}}"

        prompt_text = raw_prompt.replace("{{error_list_text}}", error_list_text)\
                                .replace("{{lang_instruction}}", lang_instruction)

        response = genai_client.models.generate_content(
            model='gemini-2.5-flash',
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
        
        if submission.get('polished_text'):
            return {"polished_text": submission['polished_text']}

        # 3. Gọi AI Rewrite (Dùng model mạnh hơn cho task này nếu cần, hoặc flash cho rẻ)
        prompt = f"""
        Rewrite to IELTS Band 9.0 (C2 Vocab). Keep meaning. Output ONLY text.
        Original: "{submission['original_text']}"
        """
        
        response = genai_client.models.generate_content(
            model='gemini-2.5-flash', # Dùng 1.5 Flash vẫn tốt, hoặc đổi sang 2.0-flash
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
        
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)