<div align="center">
  <img src="frontend/icon.svg" alt="Eloqua Logo" width="120" />
  
  # Eloqua
  
  ### AI-Powered IELTS Writing Assistant
  
  *Intelligent feedback, personalized learning, measurable progress*
  
  [![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
  [![Python](https://img.shields.io/badge/Python-3.11-blue?style=flat&logo=python)](https://www.python.org/)
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

**Eloqua** is a modern EdTech platform that helps IELTS Writing learners improve their skills through AI-powered essay analysis, real-time error detection, personalized grammar lessons, and progress tracking.

Unlike traditional grammar checkers, Eloqua focuses on **learning outcomes**:
- ✅ Not just finding errors, but **explaining why** they're wrong
- ✅ Generating **personalized quizzes** based on your actual mistakes
- ✅ Tracking progress with **visual analytics**
- ✅ Providing **actionable learning paths**

**Target Audience:** IELTS test takers, English learners, students preparing for academic writing exams

---

## ✨ Features

### 🔍 **Deep Essay Analysis**
- **AI-Powered Scoring**: Estimate IELTS band scores (1.0 - 9.0)
- **Visual Error Highlighting**: Errors highlighted directly in your text with tooltips
- **Bilingual Feedback**: Switch between English and Vietnamese explanations
- **Corrected Output**: See your essay with all errors fixed
- **Band 9.0 Rewrite** (Pro): Get a polished, examiner-level version

### 📚 **Personalized Learning System**
- **Grammar Knowledge Base**: Comprehensive grammar rules with examples
- **Interactive Lessons**: Click any error type to learn the underlying rule
- **AI-Generated Quizzes**: Practice exercises created from your actual mistakes
- **Real-time Practice**: Fill-in-the-blank questions to reinforce learning

### 📊 **Progress Analytics Dashboard**
- **Performance Overview**: Total essays, average score, highest score
- **Error Frequency Analysis**: Bar charts showing your most common mistakes
- **Priority Error Tracking**: Automatic detection of critical weaknesses
- **Submission History**: Review all past essays and track improvement
- **Score Trajectory Chart**: Visualize your progress over time

### 🎨 **Premium Features (Pro)**
- **Unlimited Daily Analysis** (Free: 2/day)
- **Band 9.0 Polished Rewrites**
- **Professional PDF Reports** with branding
- **Priority AI Processing**
- **Advanced Analytics**

### 🔒 **Security & System Safety**
- **Daily Quota Limits**: Prevent spam and protect API resources
- **Input Validation**: Minimum word count enforcement
- **Supabase Authentication**: Secure login with Google OAuth
- **Rate Limiting**: Database-level quota management

---

## 🛠️ Tech Stack

### **Frontend**
| Technology | Purpose |
|-----------|---------|
| **Next.js 14** (App Router) | React framework with server components & optimized routing |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling with custom cyan theme |
| **Lucide React** | Consistent icon library |
| **html2canvas + jsPDF** | PDF report generation |
| **React Hot Toast** | Elegant notifications |

### **Backend**
| Technology | Purpose |
|-----------|---------|
| **FastAPI** | High-performance Python API framework |
| **Pydantic** | Data validation and settings management |
| **Google Gemini 1.5 Flash** | AI model for essay analysis & quiz generation |
| **Python 3.11+** | Modern async/await support |
| **Uvicorn** | ASGI server |

### **Database & Auth**
| Technology | Purpose |
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
git clone https://github.com/yourusername/eloqua.git
cd eloqua
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

# Edit .env with your API keys
# Then start server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will run on `http://localhost:8000`

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

# Payment (Optional for development)
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret
```

### **Getting API Keys**

1. **Supabase**: 
   - Create project at [supabase.com](https://supabase.com)
   - Find keys in Project Settings → API

2. **Google Gemini**: 
   - Get API key at [ai.google.dev](https://ai.google.dev)

3. **LemonSqueezy** (for payments):
   - Sign up at [lemonsqueezy.com](https://lemonsqueezy.com)
   - Configure webhook in store settings

---

## 📁 Project Structure

```
eloqua/
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
│   ├── requirements.txt # Python dependencies
│   └── .env             # Environment variables
│
└── README.md            # This file
```

---

## 🌐 API Documentation

### **Base URL**: `http://localhost:8000`

### **Endpoints**

#### **POST** `/analyze`
Analyze an essay and return detailed feedback.

**Request Body:**
```json
{
  "text": "Your essay text here...",
  "user_id": "uuid-string",
  "language": "vi",
  "native_language": "English"
}
```

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

#### **POST** `/generate-quiz`
Generate personalized quiz from errors.

**Request Body:**
```json
{
  "errors": [
    {
      "id": 1,
      "error_type": "Past Tense",
      "quote": "he go yesterday"
    }
  ],
  "language": "vi"
}
```

#### **GET** `/check-quota/{user_id}`
Check remaining daily analysis quota.

#### **POST** `/webhook/lemonsqueezy`
Handle payment webhooks (Pro subscriptions).

---

## 🗄️ Database Schema

### **Tables**

#### **`submissions`**
```sql
id          UUID PRIMARY KEY
user_id     UUID REFERENCES auth.users
text        TEXT
score       DECIMAL
created_at  TIMESTAMP
general_feedback TEXT
corrected_text   TEXT
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

---

## 🚀 Deployment

### **Frontend (Vercel)**

```bash
cd frontend
vercel --prod
```

### **Backend (Railway/Render)**

1. Create new project
2. Connect GitHub repository
3. Set environment variables
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

- **Documentation**: [docs.eloqua.com](https://docs.eloqua.com) (coming soon)
- **Issues**: [GitHub Issues](https://github.com/yourusername/eloqua/issues)
- **Email**: support@eloqua.com

---

## 🙏 Acknowledgments

- **Google Gemini** for powerful AI capabilities
- **Supabase** for excellent backend infrastructure
- **Next.js Team** for the amazing framework
- **IELTS Learners** for inspiring this project

---

<div align="center">
  
  **Built with ❤️ for IELTS learners worldwide**
  
  [Website](https://eloqua.com) • [Documentation](https://docs.eloqua.com) • [Twitter](https://twitter.com/eloqua)
  
</div>
