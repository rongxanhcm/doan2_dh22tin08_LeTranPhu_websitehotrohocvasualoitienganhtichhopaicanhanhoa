# Copilot / AI Agent Instructions for CoreFix

Purpose: quick, actionable guidance so coding agents are productive in this repo.

- **Big picture**: Frontend is a Next.js (App Router) TypeScript app under `frontend/`. Backend is a Python FastAPI service under `backend/` that calls Google Gemini via the `google-genai` SDK. Data and auth use Supabase (Postgres). AI prompts are stored in the DB and filled at runtime.

- **Key dev commands**:
  - Frontend: `npm run dev` (runs Next.js on port 3000). See [frontend/package.json](frontend/package.json).
  - Backend: run the FastAPI app (port 8000) with uvicorn, e.g. `uvicorn backend.main:app --reload --port 8000`.

- **Important environment variables**:
  - Backend: `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_KEY` (required). See [backend/main.py](backend/main.py).
  - Frontend: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, optionally `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000`). See [frontend/lib/supabaseClient.ts](frontend/lib/supabaseClient.ts) and [frontend/components/QuizView.tsx](frontend/components/QuizView.tsx).

- **Data & DB patterns**:
  - Prompts are stored in a `system_prompts` table and fetched by key via `get_system_prompt(key)` in [backend/main.py](backend/main.py). Agents should update prompts in DB rather than hardcoding when possible.
  - Key tables referenced in code: `system_prompts`, `submissions`, `analysis_results`, `grammar_rules` (see [backend/main.py](backend/main.py) and [frontend/lib/grammarRules.ts](frontend/lib/grammarRules.ts)).

- **API surface and schemas (must preserve contract)**:
  - POST `/analyze` accepts JSON { text, user_id?, language } and returns a structured JSON matching the `EssayAssessment` Pydantic model in [backend/main.py](backend/main.py). The backend expects the AI to return exact fields (score, general_feedback, core_errors, corrected_text).
  - POST `/generate-batch-quiz` accepts { errors: [{ id, error_type, quote }], language } and returns `BatchQuizResponse` (questions array). See [backend/main.py](backend/main.py).

- **Strict conventions agents must follow**:
  - The backend expects the AI response as structured JSON (prompting uses response_schema). Do not change the JSON field names or nesting when editing prompts — tests and DB code rely on exact keys.
  - `quote` values must be the exact substring from the original text. The frontend uses that to highlight and to find DB rows.
  - When generating quizzes: maintain the input order of `errors` when returning questions. The frontend (`frontend/components/QuizView.tsx`) assumes 1:1 ordering between `errors` supplied and `questions` returned — it uses the original errors' DB `id` to update resolved rows.
  - Frontend uses React client components (`"use client"`) in many UI widgets (e.g., `QuizView.tsx`). When refactoring, preserve client/server component boundaries.

- **Frontend patterns**:
  - Uses Next.js App Router and wraps app with `LanguageProvider` in [frontend/app/layout.tsx](frontend/app/layout.tsx).
  - Supabase client must be created via `createBrowserClient` in [frontend/lib/supabaseClient.ts](frontend/lib/supabaseClient.ts); do not instantiate other Supabase clients directly in client components.
  - Visual UX code frequently relies on exact properties returned by backend (e.g., `questions[].correct_answer_index`, `questions[].explanation`). Keep these stable.

- **Backend patterns**:
  - Uses Pydantic models to define expected AI output schemas — preferred approach: update or add Pydantic models instead of ad-hoc parsing. See models in [backend/main.py](backend/main.py).
  - Fetch prompts from DB with `get_system_prompt`; placeholders like `{{input_text}}` and `{{lang_instruction}}` are used — maintain those placeholders or update prompt-filling code together.
  - Rate/validation constants live in [backend/main.py](backend/main.py): `DAILY_LIMIT = 3` and `MIN_WORD_COUNT = 15`. Be careful when changing quota logic; update frontend messaging accordingly.

- **Testing / sanity checks for agents making changes**:
  - After backend changes: run the backend locally and call `/analyze` and `/generate-batch-quiz` with representative payloads to verify Pydantic parsing.
  - After frontend changes: run `npm run dev` and exercise pages that call API (e.g., analyze flow and Quiz modal) to verify the end-to-end mapping between `errors` and quiz `questions`.

- **Search tips & important files to review**:
  - App entry and layout: [frontend/app/layout.tsx](frontend/app/layout.tsx)
  - Quiz UI & API mapping: [frontend/components/QuizView.tsx](frontend/components/QuizView.tsx)
  - Prompt & API logic: [backend/main.py](backend/main.py)
  - Prompt examples / model helper: [backend/check_models.py](backend/check_models.py)
  - Grammar rules access: [frontend/lib/grammarRules.ts](frontend/lib/grammarRules.ts)

If anything is unclear or you'd like a different level of detail (examples of payloads, or a short test script to validate endpoints), tell me which sections to expand. 
