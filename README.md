<div align="center">
  <img src="frontend/public/logo.svg" alt="Wrytt Logo" width="120" />
  
  # Wrytt
  
  ### AI-Powered Writing Assistant
  
  *Catch mistakes, master writing*

  Last updated: 2026-03-04
  
  [![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react)](https://react.dev/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.128-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
  [![Python](https://img.shields.io/badge/Python-3.11-blue?style=flat&logo=python)](https://www.python.org/)  
  [![Redis](https://img.shields.io/badge/Redis-Caching-DC382D?style=flat&logo=redis)](https://redis.io/)
  [![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
  
</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**Wrytt** is an AI-powered writing improvement platform that helps you catch errors and master grammar through targeted practice. Unlike traditional grammar checkers that only highlight mistakes, Wrytt **teaches you why errors happen** and creates personalized quizzes from YOUR actual mistakes.

**How It Works:**
1. **Paste** your essay or writing sample
2. **Analysis** - Get instant error detection with detailed explanations
3. **Practice** - Take AI-generated quizzes built from your specific errors
4. **Master** - Track progress as you move from "Learning" to "Mastered"

**Key Differentiators:**
- ✅ **No login required** to start analyzing — instant guest mode
- ✅ Not just finding errors, but **explaining the underlying rules**
- ✅ **Personalized quizzes** generated from YOUR actual mistakes
- ✅ **Progress tracking** with visual mastery analytics
- ✅ **Multilingual feedback** in 18+ languages (English, Vietnamese, Spanish, French, Japanese, Korean, etc.)
- ✅ **Adaptive learning** — focus on your weakest areas automatically

**Target Audience:** Students, professionals, content creators, ESL learners — anyone looking to improve their English writing skills

### **Quick Demo** 
Try it now without registration: [wrytt.me/analyze](https://wrytt.me/analyze)

### **What Makes Wrytt Different?**

| Traditional Grammar Checkers | Wrytt |
|------------------------------|-------|
| ❌ Only highlight errors | ✅ Explains WHY errors happen |
| ❌ Generic corrections | ✅ Personalized learning path |
| ❌ No follow-up practice | ✅ AI quizzes from YOUR mistakes |
| ❌ Static feedback | ✅ Progress tracking & mastery system |
| ❌ English-only explanations | ✅ 18+ languages for feedback |

---

## ✨ Features

### 🔍 **Instant Error Detection**
- **No Login Required**: Start analyzing immediately — paste and analyze in seconds
- **AI-Powered Scoring**: Get a 0-10 writing quality score based on grammar, vocabulary, and clarity
- **Visual Error Highlighting**: Errors highlighted directly in your text with hover tooltips
- **Detailed Explanations**: Each error comes with why it's wrong and the underlying rule
- **Corrected Output**: See your text with all errors fixed side-by-side
- **Multilingual Feedback**: AI explanations in 18+ languages (English, Vietnamese, Spanish, French, Japanese, Korean, German, Italian, Portuguese, Russian, Chinese, Arabic, Hindi, Thai, Turkish, Dutch, Polish, Swedish)
- **Elite Rewrite** (Pro): Get a professionally polished version with advanced vocabulary

### 📚 **Learn from YOUR Mistakes**
- **Grammar Knowledge Base**: 50+ grammar rules with clear explanations and examples
- **Interactive Lessons**: Click any error type to open an in-depth lesson modal
- **AI-Generated Quizzes**: 10 targeted questions created from each of your specific errors
- **Progressive Difficulty**: Questions range from basic recall to complex application
- **Real-time Feedback**: Instant explanations for right and wrong answers
- **Mastery Tracking**: Errors move through Learning → Practicing → Mastered states

### 📊 **Track Your Progress**
- **Performance Dashboard**: Total essays analyzed, average score, highest score
- **Error Frequency Charts**: Bar graphs showing your most common mistake types
- **Priority Focus System**: Automatically identifies which errors to tackle first
- **Submission History**: Review all past essays with scores and feedback
- **Score Trajectory**: Line chart visualizing improvement over time
- **PDF Report Export** (Pro): Download a professional progress report

### 🎨 **Premium Features (Pro)**
- **Higher Daily Limits**: 50 essays/day (vs 2/day for Free, 1 lifetime for Guest)
- **Unlimited Quizzes**: Practice as much as you want (Free: 6/day)
- **Elite Polished Rewrites**: AI rewrites with professional-level vocabulary and phrasing
- **Advanced Analytics**: Detailed breakdowns and insights
- **Full History Access**: Never lose your past submissions
- **PDF Export**: Download beautifully formatted progress reports

### 🔒 **Privacy & Security**
- **Anonymous Guest Mode**: Analyze without creating an account (1 free essay)
- **Device-Based Quotas**: Fair usage without requiring login
- **Secure Authentication**: Supabase OAuth (Google, GitHub, Email)
- **Row-Level Security**: Your data is protected with database-level access control
- **No Data Selling**: We never sell or share your writing samples

---

## 🛠️ Tech Stack

### **Frontend**
| Technology | Purpose |
|-----------|---------|
| **Next.js 16.1.6** (App Router) | React 19 framework with server components & optimized routing |
| **React 19.2.3** | Latest React with improved performance |
| **TypeScript 5.x** | Type-safe development |
| **Tailwind CSS 4** | Utility-first styling with custom **teal theme** (#378F96) |
| **Recharts 3.6** | Interactive data visualization for analytics dashboard |
| **html2canvas & jsPDF** | Export dashboard report as PDF |
| **Lucide React** | Consistent icon library |
| **React Hot Toast** | Elegant notifications |
| **Supabase Client** | Authentication & database queries |

### **Backend**
| Technology | Purpose |
|-----------|---------|
| **FastAPI 0.128.0** | High-performance Python API framework with async support |
| **Pydantic 2.x** | Data validation and OpenAI-compatible schemas |
| **Google Gemini 2.5 Flash Lite** | Fast, cost-effective AI for essay analysis & quiz generation |
| **google-genai 1.59** | Official Google AI SDK with structured output support |
| **Redis** | Prompt caching & performance optimization |
| **Supabase (PostgreSQL)** | User data, submissions, error tracking, grammar rules |
| **Supabase Auth** | OAuth authentication (Google, GitHub, Email) |
| **Row Level Security (RLS)** | Database-level access control |

### **Payment & Deployment**
| Technology | Purpose |
|-----------|---------|
| **LemonSqueezy** | Payment processing & subscriptions |
| **Vercel** (Frontend) | Edge network deployment |
| **Railway/Render** (Backend) | Python API hosting |

---

## 📦 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.x or higher
- **Python** 3.11 or higher
- **npm** or **yarn** package manager
- **pip** for Python packages
- **Git** for version control
- **Supabase Account** (free tier available)
- **Google Gemini API Key** (free tier available)

---

## 🚀 Installation

### **1. Clone the Repository**

```bash
git clone https://github.com/yourusername/wrytt.git
cd wrytt
```

### **2. Frontend Setup**

```bash
cd frontend
npm install
# or
yarn install

# Copy environment file
cp .env.example .env.local

# Edit .env.local with your credentials
# Then start development server
npm run dev
```

Frontend will run on `http://localhost:3000`

### **3. Backend Setup**

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env with your API keys and Redis URL
# Then start server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will run on `http://localhost:8000`

**Note:** Redis is required for prompt caching. Set `REDIS_URL` in `.env` (default: `redis://localhost:6379`)

---

## 🔐 Environment Variables

### **Frontend (`frontend/.env.local`)**

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### **Backend (`backend/.env`)**

```env
# Google AI
GEMINI_API_KEY=your_gemini_api_key

# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key

# Redis (for prompt caching)
REDIS_URL=redis://localhost:6379

# Payment
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret
LEMONSQUEEZY_API_KEY=your_lemonsqueezy_api_key
```

### **Getting API Keys**

1. **Supabase**: 
   - Create project at [supabase.com](https://supabase.com)
   - Find keys in Project Settings → API

2. **Google Gemini**: 
   - Get API key at [ai.google.dev](https://ai.google.dev)
   - Project now uses **Gemini 2.5 Flash** model

3. **Redis** (for caching):
   - Install locally: [redis.io/download](https://redis.io/download)
   - Or use cloud service: [Redis Cloud](https://redis.com/try-free/)

4. **LemonSqueezy** (for payments):
   - Sign up at [lemonsqueezy.com](https://lemonsqueezy.com)
   - Configure webhook in store settings

---

## 📁 Project Structure

```
wrytt/
├── frontend/                # Next.js application
│   ├── app/                # App Router pages
│   │   ├── analyze/       # Essay submission page
│   │   ├── dashboard/     # User analytics
│   │   ├── history/       # Submission history
│   │   ├── admin/         # Admin panel
│   │   └── ...
│   ├── components/        # Reusable React components
│   │   ├── DashboardReport.tsx
│   │   ├── GrammarLessonModal.tsx
│   │   ├── PricingModal.tsx
│   │   └── ...
│   ├── lib/              # Utilities & helpers
│   │   ├── supabaseClient.ts
│   │   ├── grammarRules.ts
│   │   └── errorMapping.ts
│   └── public/           # Static assets
│
├── backend/              # FastAPI application
│   ├── main.py          # API routes & endpoints
│   ├── check_models.py  # Model checks / diagnostics
│   ├── requirements.txt # Python dependencies
│   ├── Procfile         # Deployment process file
│   ├── package.json     # Supabase JS deps for tooling
│   └── .env             # Environment variables
│
├── migrations/          # Supabase SQL migrations
│   ├── add_default_language.sql
│   ├── add_quiz_attempts_table.sql
│   └── add_quiz_limit_tracking.sql
│
└── README.md            # This file
```

---

## 🌐 API Documentation

### **Base URL**: `http://localhost:8000`

### **Endpoints**

#### **POST** `/analyze`
Analyze an essay and return detailed feedback.

**Headers:**
- `X-Visitor-Id`: required for guest usage (anonymous quota tracking)

**Request Body:**
```json
{
  "text": "Your essay text here...",
  "user_id": "uuid-string-or-null",
  "language": "en",
  "native_language": "Vietnamese"
}
```

**Note**: `user_id` can be `null` for guest users (with `X-Visitor-Id`). `native_language` controls the feedback language.

**Response:**
```json
{
  "score": 7.5,
  "general_feedback": "Overall strong essay with minor grammatical issues...",
  "core_errors": [
    {
      "error_type": "Subject-Verb Agreement",
      "quote": "he go",
      "severity": "high",
      "explanation": "Subject 'he' requires verb 'goes'",
      "suggestion": "he goes"
    }
  ],
  "corrected_text": "Fully corrected version...",
  "polished_text": "Elite version (Pro only)"
}
```

#### **POST** `/generate-quiz-single`
Generate a 10-question quiz for a single error type.

**Request Body:**
```json
{
  "error_type": "Past Tense",
  "quote": "he go yesterday",
  "language": "vi",
  "native_language": "Vietnamese"
}
```

**Response:**
```json
{
  "questions": [
    {
      "id": 1,
      "question": "Fill in the blank...",
      "options": ["option1", "option2", "option3", "option4"],
      "correct_answer_index": 0,
      "explanation": "..."
    }
  ]
}
```

#### **POST** `/upgrade-submission`
Upgrade a submission with Elite polished text (Pro feature).

**Request Body:**
```json
{
  "submission_id": "uuid-string",
  "user_id": "uuid-string"
}
```

#### **POST** `/generate-portal-link`
Generate LemonSqueezy customer portal link for subscription management.

**Request Body:**
```json
{
  "user_email": "user@example.com"
}
```

#### **POST** `/auth/forgot-password`
Initiate password reset process.

**Request Body:**
```json
{
  "email": "user@example.com",
  "redirect_url": "http://localhost:3000/update-password"
}
```

#### **POST** `/auth/update-password`
Update user password. Requires `Authorization: Bearer <access_token>` header.

**Request Body:**
```json
{
  "new_password": "new_secure_password"
}
```

#### **POST** `/webhook`
Handle payment webhooks (LemonSqueezy subscriptions).

---

## 🗄️ Database Schema
<img width="996" height="683" alt="image" src="https://github.com/user-attachments/assets/60c19a26-8ba4-4b9b-b6c7-64534ef04645" />

### **Tables**

#### **`submissions`**
```sql
id             UUID PRIMARY KEY
user_id        UUID REFERENCES auth.users
visitor_id     TEXT
original_text  TEXT
corrected_text TEXT
score          DECIMAL
created_at     TIMESTAMP
general_feedback TEXT
target_language  TEXT
polished_text    TEXT (nullable)
```

#### **`analysis_results`**
```sql
id             UUID PRIMARY KEY
submission_id  UUID REFERENCES submissions
error_type     VARCHAR
quote          TEXT
severity       VARCHAR
explanation    TEXT
suggestion     TEXT
is_resolved    BOOLEAN DEFAULT false
```

#### **`user_usage`**
```sql
user_id         UUID PRIMARY KEY
is_pro          BOOLEAN DEFAULT false
usage_count     INTEGER DEFAULT 0
last_reset_date DATE
default_language VARCHAR(50) DEFAULT 'English'
```

#### **`grammar_rules`**
```sql
id           SERIAL PRIMARY KEY
error_key    VARCHAR UNIQUE
title        VARCHAR
definition   TEXT
rule         TEXT
bad_example  TEXT
good_example TEXT
tip          TEXT
```

#### **`quiz_attempts`**
```sql
id         BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY
user_id    UUID REFERENCES auth.users
error_type TEXT
quiz_date  TIMESTAMP
score      INT
passed     BOOLEAN
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### **Other tables used by backend**
- `guest_usage` for anonymous quota tracking
- `system_prompts` for server-managed AI prompt content

---

## 🚀 Deployment

### **Frontend (Vercel)**

```bash
cd frontend
npm run build
vercel --prod
```

**Environment Variables to Set:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL` (your backend URL)

### **Backend (Railway/Render)**

1. Create new project
2. Connect GitHub repository
3. Set environment variables:
   - `GEMINI_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `LEMONSQUEEZY_WEBHOOK_SECRET` (optional)
4. Deploy from `backend/` directory
5. Use start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### **Database (Supabase)**

- Already hosted on Supabase cloud
- Run migrations via Supabase dashboard SQL editor
- Enable Row Level Security (RLS) policies

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### **Code Style**
- Frontend: ESLint + Prettier
- Backend: Black + isort
- Commit messages: Conventional Commits

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 💬 Support

- **Email**: contact@wrytt.me
- **Issues**: [GitHub Issues](https://github.com/yourusername/wrytt/issues)
- **Location**: Ninh Kieu District, Can Tho City, Vietnam

---

## 🙏 Acknowledgments

- **Google Gemini** for powerful AI capabilities
- **Supabase** for excellent backend infrastructure
- **Next.js Team** for the amazing framework
- **All writers and learners** for inspiring this project
- **Academic Project** by Phu Le

---

<div align="center">
  
  **Built with ❤️ for writers worldwide**
  
  **Academic Project • Designed by Phu Le**
  
</div>
