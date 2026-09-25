# SkillPilot AI

SkillPilot AI is a career intelligence platform for students and early-career developers. It helps users turn their current skills into a measurable path for a target role by combining resume analysis, skill-gap tracking, roadmap generation, project recommendations, GitHub evidence, and AI mentoring.

## Overview

The product follows a full lifecycle:

Current Skills → Career Goal → Skill Gap → Personalized Roadmap → Projects → Learning → GitHub Progress → Interview Preparation → Career Readiness

## Architecture

- Frontend: React + Vite + Tailwind CSS + React Router
- Backend: Node.js + Express.js
- Data and authentication: Supabase Auth + Postgres with row-level security
- AI layer: OpenAI requests are proxied through the Express backend
- Demo mode: mock data and demo endpoints are included so the app works without external APIs

## Features

- Authentication and onboarding flow
- Resume intelligence and AI feedback
- Skill graph and skill-gap analysis
- Adaptive roadmap generation
- Project recommendation engine
- GitHub evidence analysis
- Progress tracking dashboard
- AI mentor and interview guidance
- Responsive SaaS-style customer experience

## Tech Stack

- React
- Vite
- Tailwind CSS
- React Router
- Recharts
- Lucide React
- Express.js
- Supabase Auth + Postgres
- OpenAI API
- Axios

## Environment Variables

Copy the example files and fill in your Supabase project settings. The OpenAI key belongs only in the backend env file; never add it to a `VITE_` variable.

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in `backend/.env`, the matching `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in `frontend/.env`, and `OPENAI_API_KEY` in `backend/.env`.

## Database Setup

1. Create a Supabase project and copy its project URL and publishable key into the env files.
2. Run `backend/supabase/schema.sql` in the Supabase SQL Editor to create the profiles table and its row-level security policies.
3. Enable email/password sign-in in Supabase Auth. If email confirmation is enabled, users must confirm their address before signing in.
4. Set `GEMINI_API_KEY` in `backend/.env` for AI mentor replies. Keep this key server-side; do not use a `VITE_` variable for it.

## API Documentation

### Auth
- POST /api/auth/register
- POST /api/auth/login

### Core routes
- GET /api/health
- POST /api/resume/extract (authenticated; optional PDF/DOCX resume parsing)
- POST /api/mentor/chat (requires a Supabase access token)
- GET /api/dashboard
- GET /api/resume
- GET /api/skills
- GET /api/careers
- GET /api/skill-gap
- GET /api/roadmap
- GET /api/projects
- GET /api/github
- GET /api/progress
- GET /api/mentor
- GET /api/recommendations
- GET /api/interview

## Local Setup

### 1. Install dependencies

```bash
npm install
npm install --prefix frontend
npm install --prefix backend
```

### 2. Start backend

```bash
npm run dev --prefix backend
```

### 3. Start frontend

```bash
npm run dev --prefix frontend
```

### 4. Open app

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Future Improvements

- Real GitHub OAuth flow
- PDF/DOC resume parsing with extraction service
- Persist roadmap progress and mentor conversations in Supabase
- Expanded interview and recommendation engine
- Job-market data integrations

## Notes

This repository includes a demo-first implementation so the project is immediately usable without external APIs. The AI and GitHub integrations are separated into modular layers so they can later be swapped for real providers.
