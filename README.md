# 🎓 Lofty Academy — AI-Guided Product Education

**Team:** Agent Reborn | **Track:** Lofty AI-Native PM (Onboarding Flow) + Insforge + ElevenLabs

Lofty Academy is a continuous AI product education layer for [Lofty CRM](https://lofty.com). It transforms passive onboarding into interactive, voice-guided lessons that teach agents by operating the CRM in real-time.

## ✨ The "Aha" Moment

> The AI is walking Shrey through Smart Plans. Shrey interrupts: *"What is a smart plan?"*  
> The AI pauses. It explains Smart Plans with ElevenLabs voice. Then asks: *"Shall I continue?"*  
> Shrey says yes. The lesson picks up from the exact step.

This proves the product is not a tutorial video or chatbot — it's contextual, interactive education.

## 🎯 What It Does

| Feature | Description |
|---------|-------------|
| 🎯 **4 Interactive Lessons** | Smart Plans, Lead Scoring, Release Notes (4.40), Help Center tutorials |
| 🗣️ **Voice Narration** | ElevenLabs text-to-speech with tuned voice settings |
| ❓ **Interrupt Q&A** | Ask any question mid-lesson — AI pauses, answers, resumes |
| 🤖 **Real AI Answers** | Gemini 2.0 Flash via Insforge Edge Function for free-form questions |
| 🎙️ **Voice Input** | Continuous mic stays on until you stop it |
| 🖱️ **AI Cursor** | Animated cursor navigates CRM views, highlights elements, clicks buttons |
| 🔐 **Demo Login** | Insforge-backed profile authentication |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                 Frontend (React + Vite)              │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Left     │  │ CRM          │  │ Right         │  │
│  │ Panel    │  │ Simulator    │  │ AI Tutor Chat │  │
│  │ Lessons  │  │ + AI Cursor  │  │ + Voice + Mic │  │
│  └──────────┘  └──────────────┘  └───────────────┘  │
└───────────────────────┬─────────────────────────────┘
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
     ┌──────────────┐    ┌──────────────┐
     │  Insforge    │    │  External    │
     │  Backend     │    │  APIs        │
     │              │    │              │
     │  • Postgres  │    │  • Gemini    │
     │  • Auth      │    │  • ElevenLabs│
     │  • Edge Fns  │    │              │
     └──────────────┘    └──────────────┘
```

## 🚀 Quick Start

```bash
npm install
cp .env.example .env.local   # Add Insforge credentials
npm run dev                   # http://localhost:5173
```

## 📁 Project Structure

```
src/
  main.jsx              # UI: CRM views, Academy Mode, Lesson Engine, Voice, Cursor
  styles.css             # Styling for all views and overlays
  insforgeClient.js      # Insforge SDK initialization
  insforgeBackend.js     # Backend helpers: lessons, progress, Q&A, TTS, AI Q&A

insforge/
  schema.sql             # Database: profiles, lessons, progress, qa_events
  functions/
    speak-lesson.ts      # Edge Function: text → ElevenLabs MP3
    answer-question.ts   # Edge Function: question → Gemini 2.0 Flash answer
    generate-lesson.ts   # Edge Function: content → lesson JSON
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 7 |
| Backend | Insforge (Postgres + Edge Functions + Auth) |
| Voice Output | ElevenLabs Multilingual v2 |
| AI Q&A | Google Gemini 2.0 Flash |
| Voice Input | Web Speech API |

## 📋 Insforge Features Used

1. **Auth / Profiles** — Demo login queries `profiles` table
2. **Database (Postgres)** — Lessons, lesson progress, Q&A events, content sources
3. **Edge Functions** — `speak-lesson`, `answer-question`, `generate-lesson`

## 🤖 AI Tools Used

| Tool | Usage |
|------|-------|
| Antigravity (Gemini) | Architecture, code generation, debugging, automated testing |
| Gemini 2.0 Flash | Runtime AI Q&A for contextual answers during lessons |
| ElevenLabs | Voice synthesis for lesson narration and interrupt answers |
| Web Speech API | Continuous voice input recognition |

## 📜 License

Built for GlobeHacks 2026.
