# 🎓 Lofty Academy — AI-Guided Product Education

**Team:** Agent Reborn

Lofty Academy is a continuous AI product education layer for [Lofty CRM](https://lofty.com). It transforms passive onboarding and static help articles into interactive, voice-guided lessons that teach agents by operating the CRM in real-time.

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🎯 **Interactive Lessons** | AI cursor navigates the CRM, clicking and highlighting elements while narrating each step |
| 🗣️ **Voice Narration** | ElevenLabs text-to-speech for natural AI tutor voice |
| ❓ **Interrupt Q&A** | Ask any question mid-lesson — AI pauses, answers with context, then resumes |
| 🎙️ **Voice Input** | Continuous microphone via Web Speech API |
| 📊 **4 Lesson Categories** | Smart Plans, Lead Scoring, Release Notes (4.40), Help Center tutorials |
| 🤖 **AI-Powered Answers** | GPT-4o-mini via Edge Function for free-form questions |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)           │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Left     │  │ CRM          │  │ Right         │  │
│  │ Panel    │  │ Simulator    │  │ AI Tutor Chat │  │
│  │ Lessons  │  │ + AI Cursor  │  │ + Voice + Mic │  │
│  └──────────┘  └──────────────┘  └───────────────┘  │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│               Insforge Backend                       │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Postgres │  │ Edge         │  │ Auth /        │  │
│  │ Database │  │ Functions    │  │ Profiles      │  │
│  │          │  │              │  │               │  │
│  │ lessons  │  │ speak-lesson │  │ Demo login    │  │
│  │ progress │  │ answer-q     │  │ Agent/Admin   │  │
│  │ qa_events│  │ gen-lesson   │  │               │  │
│  └──────────┘  └──────────────┘  └───────────────┘  │
└───────────────────────┬─────────────────────────────┘
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
     ┌──────────────┐    ┌──────────────┐
     │  ElevenLabs  │    │   OpenAI     │
     │  TTS API     │    │  GPT-4o-mini │
     └──────────────┘    └──────────────┘
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local with your Insforge credentials

# Start dev server
npm run dev
```

## 📁 Project Structure

```
src/
  main.jsx              # All UI: CRM views, Academy Mode, Lesson Engine, Voice, Cursor
  styles.css             # Full styling for all views and overlays
  insforgeClient.js      # Insforge SDK initialization
  insforgeBackend.js     # Backend helpers: lessons, progress, Q&A, TTS, AI Q&A

insforge/
  schema.sql             # Database schema: profiles, lessons, progress, qa_events
  functions/
    speak-lesson.ts      # Edge Function: text → ElevenLabs MP3
    generate-lesson.ts   # Edge Function: content → lesson JSON
    answer-question.ts   # Edge Function: question → GPT-4o-mini answer
```

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite 7
- **Backend:** Insforge (Postgres, Edge Functions, Auth)
- **Voice:** ElevenLabs multilingual v2
- **AI Q&A:** OpenAI GPT-4o-mini
- **Voice Input:** Web Speech API (continuous)

## 🎯 Sponsor Tracks

- **Lofty AI-Native PM** — Onboarding Flow entry point
- **Insforge** — Primary backend (Database + Edge Functions + Auth)
- **ElevenLabs** — Voice narration

## 🤖 AI Tools Used

- **Antigravity (Gemini)** — Architecture, code generation, debugging, and testing
- **GPT-4o-mini** — Runtime AI Q&A for contextual answers during lessons
- **ElevenLabs** — Voice synthesis for lesson narration
- **Web Speech API** — Voice input recognition

## 📜 License

Built for GlobeHacks 2026.
