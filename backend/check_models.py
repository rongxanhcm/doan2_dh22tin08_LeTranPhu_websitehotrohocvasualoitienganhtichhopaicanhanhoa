from google import genai
import os

# 1. Cấu hình Client
# Thay API Key mới của bạn vào đây
API_KEY = "AIzaSyC_boBfvS6il6SY409znkbZJ6inHsTyOk4" 
client = genai.Client(api_key=API_KEY)

print("--- DANH SÁCH MODEL KHẢ DỤNG (SDK MỚI) ---")

try:
    # 2. Lấy danh sách model qua client.models.list()
    for m in client.models.list():
        
        # Lọc chỉ lấy các model dòng "Gemini" để in cho gọn
        if "gemini" in m.name:
            print(f"Tên đầy đủ: {m.name}")
            
            # Cắt chuỗi để lấy tên ngắn gọn dùng trong code
            # Ví dụ: 'models/gemini-1.5-flash' -> 'gemini-1.5-flash'
            short_name = m.name.replace("models/", "")
            print(f"-> Tên dùng trong code: {short_name}")
            print("-" * 30)

except Exception as e:
    print(f"Có lỗi xảy ra: {e}")