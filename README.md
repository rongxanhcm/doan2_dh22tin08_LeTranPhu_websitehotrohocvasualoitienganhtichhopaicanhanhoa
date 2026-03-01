<div align="center">
  <img src="frontend/public/logo.svg" alt="Wrytt Logo" width="120" />
  
  # Wrytt
  
  ### AI-Powered Writing Assistant
  
  *Refine your writing, word by word*

  Last updated: 2026-02-21
  
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

**Wrytt** is a modern EdTech platform that helps IELTS Writing learners and English writers improve their skills through AI-powered essay analysis, real-time error detection, personalized grammar lessons, and progress tracking.

**Key Differentiators:**
- ✅ **No login required** to analyze essays — start instantly (guest mode)
- ✅ Not just finding errors, but **explaining why** they're wrong
- ✅ Generating **personalized quizzes** based on your actual mistakes
- ✅ Tracking progress with **visual analytics**
- ✅ **Multilingual feedback** in 18+ languages (English, Vietnamese, Spanish, French, Japanese, Korean, etc.)
- ✅ Providing **actionable learning paths**

**Target Audience:** IELTS test takers, English learners, students preparing for academic writing exams, anyone looking to improve their writing

---

## ✨ Features

### 🔍 **Deep Essay Analysis**
- **No Login Required**: Start analyzing immediately without creating an account
- **AI-Powered Scoring**: Estimate IELTS band scores (1.0 - 9.0)
- **Visual Error Highlighting**: Errors highlighted directly in your text with tooltips
- **Multilingual Feedback**: Choose from 18+ languages for AI explanations (English, Vietnamese, Spanish, French, Japanese, Korean, German, Italian, Portuguese, Russian, Chinese, Arabic, Hindi, Thai, Turkish, Dutch, Polish, Swedish)
- **Corrected Output**: See your essay with all errors fixed
- **Examiner's Feedback**: AI-generated comprehensive feedback on your writing
- **Band 9.0 Rewrite** (Pro): Get a polished, examiner-level version with C2 vocabulary

### 📚 **Personalized Learning System**
- **Grammar Knowledge Base**: Comprehensive grammar rules with examples
- **Interactive Lessons**: Click any error type to learn the underlying rule
- **AI-Generated Quizzes**: Practice exercises created from your actual mistakes (single-error focus)
- **Real-time Practice**: Multiple-choice quizzes to reinforce learning
- **Mastery Goal**: Automatic focus area selection with progress tracking

### 📊 **Progress Analytics Dashboard**
- **Performance Overview**: Total essays, average score, highest score
- **Error Frequency Analysis**: Bar charts showing your most common mistakes
- **Priority Error Tracking**: Automatic detection of critical weaknesses
- **Submission History**: Review all past essays and track improvement
- **Score Trajectory Chart**: Visualize your progress over time
- **PDF Report Export** (Pro): Download a professional progress report

### 🎨 **Premium Features (Pro)**
- **Higher Daily Limit** (Pro: 50/day, Free: 2/day, Guest: 1 total per device)
- **Band 9.0 Polished Rewrites** with C2 vocabulary and native phrasing
- **Advanced Analytics**
- **Full Submission History**
- **PDF Report Export**

### 🔒 **Security & System Safety**
- **Daily Quota Limits**: Prevent spam and protect API resources (Guest: 1 total per device, Free users: 2/day, Pro: 50/day)
- **Input Validation**: Minimum 15 word count enforcement
- **Supabase Authentication**: Secure login with OAuth
- **Rate Limiting**: Database-level quota management
- **Anonymous Usage**: Analyze without account, upgrade later to save history

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
| **FastAPI 0.128.0** | High-performance Python API framework |
| **Pydantic 2.x** | Data validation and settings management |
| **Google Gemini 2.5 Flash** | Essay analysis and feedback |
| **Google Gemini 2.5 Flash Lite** | Quiz generation |
| **google-genai 1.59** | Google AI SDK integration |
| **Redis** | Caching prompts & performance optimization |
|-----------|---------|
| **Supabase (PostgreSQL)** | User data, submissions, errors, grammar rules |
| **Supabase Auth** | Authentication & user management |
| **Row Level Security (RLS)** | Data access control |

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
  "polished_text": "Band 9.0 version (Pro only)"
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
Upgrade a submission with Band 9.0 polished text (Pro feature).

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
- **IELTS Learners** for inspiring this project
- **Academic Project** by Phu Le

---

<div align="center">
  
  **Built with ❤️ for writers worldwide**
  
  **Academic Project • Designed by Phu Le**
  
</div>
