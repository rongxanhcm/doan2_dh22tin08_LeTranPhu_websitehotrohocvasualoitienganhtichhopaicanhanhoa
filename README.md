<div align="center">
  <img src="frontend/public/logo.svg" alt="Wrytt Logo" width="120" />
  
  # Wrytt
  
  ### Learn English from Your Mistakes
  
  *AI-generated quizzes from YOUR writing errors*

  Last updated: 2026-03-09
  
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

**Wrytt** is an AI-powered English learning platform that turns YOUR writing mistakes into personalized practice quizzes. Submit your essay → AI finds your errors → Get 10-question quizzes generated from YOUR exact mistakes. Not generic grammar exercises—learn what YOU need to improve.

**How It Works:**
1. **Submit** your essay or writing sample
2. **AI Analyzes** - Detects all grammar errors with explanations
3. **Quiz Generated** - Get 10 personalized questions built from YOUR mistakes
4. **Practice & Master** - Track progress as errors move "Learning" → "Practicing" → "Mastered"

**Core Value:** Writing is the INPUT. Personalized AI quizzes are the OUTPUT. You don't just fix errors—you LEARN through targeted practice.

**Key Differentiators:**
- ✅ **AI Quiz Generation** - Every error becomes a personalized quiz question
- ✅ **No generic exercises** - Practice exactly what YOU wrote wrong
- ✅ **No login required** to start analyzing — instant guest mode
- ✅ **Progress tracking** with visual mastery analytics (Learning → Practicing → Mastered)
- ✅ **Multilingual feedback** in 18+ languages (English, Vietnamese, Spanish, French, Japanese, Korean, etc.)
- ✅ **Adaptive learning** — AI focuses on your weakest areas automatically

**Target Audience:** ESL learners, students, professionals — anyone who wants to LEARN English grammar through their own writing mistakes, not just get corrections

### **🚀 Quick Demo** 
1. Visit [wrytt.me/analyze](https://wrytt.me/analyze) (no login required)
2. Paste your essay
3. Get error analysis + **click "Generate Quiz" button**
4. Practice 10 personalized questions from YOUR mistakes

### **What Makes Wrytt Different?**

| Traditional Grammar Checkers | Wrytt |
|------------------------------|-------|
| ❌ Only highlight errors | ✅ Generates personalized quizzes from YOUR errors |
| ❌ Generic corrections | ✅ Every mistake becomes a practice question |
| ❌ No follow-up practice | ✅ 10-question AI quiz per essay submission |
| ❌ Static feedback | ✅ Progress tracking: Learning → Mastered |
| ❌ English-only explanations | ✅ 18+ languages for feedback |
| ❌ You read corrections | ✅ You PRACTICE through quizzes |

---

## ✨ Features

### 🎯 **AI Quiz Generation (Core Feature)**
- **Personalized Questions**: Submit essay → AI generates 10-question quiz from YOUR exact mistakes
- **Not Generic Exercises**: Every quiz is unique to what YOU wrote wrong
- **Multiple Choice Format**: 4 options per question with instant explanations
- **Progressive Difficulty**: Questions test understanding, not just recall
- **Real-time Feedback**: Know immediately why each answer is right/wrong
- **Unlimited Practice** (Pro): Free users get 6 quizzes/day, Pro unlimited

### 📝 **Error Analysis (The Input)**
- **No Login Required**: Start analyzing immediately — paste and analyze in seconds
- **AI-Powered Detection**: Identifies grammar, vocabulary, and clarity issues
- **Visual Error Highlighting**: Errors highlighted directly in your text
- **Detailed Explanations**: Each error comes with the underlying rule
- **Writing Score**: 0-10 quality assessment
- **Multilingual Feedback**: AI explanations in 18+ languages

### � **Grammar Learning System**
- **50+ Grammar Rules**: Comprehensive knowledge base with explanations
- **Interactive Lessons**: Click any error to see in-depth lesson modal
- **Real Examples**: See correct vs incorrect usage for each rule
- **Linked Learning**: Every quiz question links back to the relevant lesson

### 📊 **Track Your Progress**
- **Mastery Tracking**: Errors move through Learning → Practicing → Mastered
- **Performance Dashboard**: Total essays, quiz completion rate, mastery progress
- **Error Frequency Charts**: Bar graphs showing your most common mistake types
- **Priority Focus System**: AI identifies which errors to practice first
- **Submission History**: Review all past essays with scores and quizzes taken
- **PDF Report Export** (Pro): Download professional progress report

### 🎨 **Premium Features (Pro)**
- **Unlimited Quizzes**: Practice without daily limits (Free: 6 quizzes/day)
- **Higher Essay Limits**: 50 essays/day (vs 2/day for Free, 1 lifetime for Guest)
- **Elite Rewrites**: AI rewrites with professional vocabulary (learning reference)
- **Full History Access**: Never lose past submissions and quiz results
- **PDF Export**: Download beautifully formatted progress reports
- **Advanced Analytics**: Detailed mastery insights and learning patterns

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
│   ├── add_quiz_limit_tracking.sql
│   ├── create_blog_posts.sql
│   └── BLOG_MIGRATION_README.md
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

The project uses **Supabase (PostgreSQL)** for data persistence. All tables have **Row Level Security (RLS)** enabled to protect user data.

### **Core Tables**

#### **`auth.users`** (Managed by Supabase Auth)
```sql
id              UUID PRIMARY KEY
email           TEXT UNIQUE NOT NULL
created_at      TIMESTAMP
last_sign_in_at TIMESTAMP
```

#### **`profiles`** (User Profile & Roles)
```sql
id                UUID PRIMARY KEY
email             TEXT
role              TEXT DEFAULT 'user'  -- 'user' or 'admin'
created_at        TIMESTAMP NOT NULL DEFAULT now()
native_language   TEXT DEFAULT 'English'
FOREIGN KEY (id) REFERENCES auth.users(id)
```
**Purpose**: Store user profiles and roles for admin/user differentiation.

#### **`submissions`** (Essay Analysis Records)
```sql
id                BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY
user_id           UUID (nullable) REFERENCES auth.users
visitor_id        TEXT (nullable) -- For guest/anonymous users
original_text     TEXT NOT NULL
corrected_text    TEXT
score             DOUBLE PRECISION
general_feedback  TEXT
target_language   TEXT DEFAULT 'English'
polished_text     TEXT (nullable) -- Pro users only
created_at        TIMESTAMP NOT NULL DEFAULT now()
```
**Purpose**: Store all essay submissions and analysis results from users.

#### **`analysis_results`** (Detailed Error Analysis)
```sql
id                BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY
submission_id     BIGINT NOT NULL REFERENCES submissions(id)
error_type        TEXT
quote             TEXT -- Exact error text from original
severity          TEXT
explanation       TEXT
suggestion        TEXT -- Correction suggestion
is_resolved       BOOLEAN DEFAULT false
FOREIGN KEY (submission_id) REFERENCES submissions(id)
```
**Purpose**: Store detailed error information for each submission.

#### **`grammar_rules`** (Grammar Knowledge Base - No RLS)
```sql
id                BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY
error_key         TEXT NOT NULL UNIQUE
title             TEXT NOT NULL
definition        TEXT
rule              TEXT
bad_example       TEXT
good_example      TEXT
tip               TEXT
created_at        TIMESTAMP NOT NULL DEFAULT now()
```
**Purpose**: Centralized grammar rule definitions accessible to all users. **No RLS** - publicly readable.

#### **`quiz_attempts`** (Learning Progress Tracking)
```sql
id                BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY
user_id           UUID NOT NULL REFERENCES auth.users
error_type        TEXT NOT NULL
quiz_date         TIMESTAMP DEFAULT now()
score             INTEGER NOT NULL CHECK (score >= 0 AND score <= 10)
passed            BOOLEAN NOT NULL DEFAULT false  -- TRUE if score >= 6 (60%)
created_at        TIMESTAMP DEFAULT now()
updated_at        TIMESTAMP DEFAULT now()
```
**RLS Policies**: Users can only read/write their own quiz attempts.

#### **`user_usage`** (Quota & Plan Tracking)
```sql
user_id           UUID PRIMARY KEY REFERENCES auth.users
usage_count       INTEGER DEFAULT 0
last_reset_date   DATE DEFAULT CURRENT_DATE
is_pro            BOOLEAN DEFAULT false
default_language  VARCHAR DEFAULT 'English'
quiz_count        INTEGER DEFAULT 0
last_quiz_reset_date DATE
FOREIGN KEY (user_id) REFERENCES auth.users(id)
```
**Purpose**: Track daily quota for free users and Pro status.

#### **`guest_usage`** (Anonymous User Quota)
```sql
visitor_id        TEXT PRIMARY KEY
usage_count       INTEGER DEFAULT 0
created_at        TIMESTAMP DEFAULT now()
```
**Purpose**: Track quota for guests using device fingerprinting (no login).

#### **`system_prompts`** (AI Prompt Management)
```sql
key               TEXT PRIMARY KEY
content           TEXT NOT NULL
description       TEXT
updated_at        TIMESTAMP DEFAULT now()
```
**Purpose**: Store and manage prompts for Gemini AI (analyze essay, generate quiz, etc.).

#### **`blog_posts`** (Content Marketing / SEO)
```sql
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
slug              TEXT UNIQUE NOT NULL
title             TEXT NOT NULL
excerpt           TEXT NOT NULL
content           TEXT NOT NULL
category          TEXT NOT NULL CHECK (category IN ('grammar', 'writing', 'mistakes', 'vocabulary', 'guides'))
author            TEXT DEFAULT 'Wrytt Team'
reading_time      INT DEFAULT 5
is_published      BOOLEAN DEFAULT false
created_at        TIMESTAMPTZ DEFAULT NOW()
updated_at        TIMESTAMPTZ DEFAULT NOW()
```
**Purpose**: Store blog posts for `/blog`, category pages, and individual SEO article pages.

**Migration**: Use `migrations/create_blog_posts.sql` (details in `migrations/BLOG_MIGRATION_README.md`).

### **Key Design Patterns**

| Pattern | Usage |
|---------|-------|
| **RLS Enabled** | `submissions`, `analysis_results`, `quiz_attempts` - protect user data |
| **RLS Disabled** | `grammar_rules`, `system_prompts` - admin/backend managed |
| **No Auth FK** | `guest_usage` - for anonymous users |
| **Soft Delete Ready** | `analysis_results.is_resolved` tracks resolution state |
| **Quota Tracking** | `user_usage` + `guest_usage` for daily limits enforcement |

### **Database Indexes**

```sql
-- For fast user lookups
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_analysis_results_submission_id ON analysis_results(submission_id);

-- For quiz progress tracking
CREATE INDEX idx_quiz_attempts_user_error ON quiz_attempts(user_id, error_type, quiz_date DESC);
CREATE INDEX idx_quiz_attempts_recent ON quiz_attempts(user_id, quiz_date DESC);

-- For blog content queries
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON blog_posts(is_published);
```

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
