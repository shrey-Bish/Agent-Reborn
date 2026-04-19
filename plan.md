# Agent Reborn - Lofty Academy Hackathon Build Plan

## Winning Positioning

**Lofty Academy** is a continuous AI product education layer for Lofty.

**Team/project name:** Agent Reborn.

Lofty confirmed the pain is mixed: onboarding must be strong, but experienced agents
also need ongoing value after product updates.

New agents need the first product experience to build trust. Experienced agents need to
notice, understand, and adopt new capabilities after Lofty ships them. Lofty Academy
uses the same live guidance layer for both jobs: it operates a Lofty-style CRM, explains
why each AI signal matters, answers questions mid-lesson, and resumes the flow.

The scalable product story:

> Lofty Academy starts as onboarding, but becomes a continuous update layer. Every
> release note or Help Center tutorial can become an interactive in-product lesson, so
> both new and experienced agents understand Lofty features at the moment they need them.

Content sources for the demo:

- Lofty Help Center release notes, starting with Lofty 4.40:
  `https://help.lofty.com/hc/en-us/articles/48927271391259-Feature-Updates-for-Lofty-4-40`
- Lofty Help Center documentation:
  `https://help.lofty.com/hc/en-us`
- First written tutorial extraction example:
  `https://help.lofty.com/hc/en-us/articles/40537616665627-Aidentified-Integration`

Release notes and Help Center articles are both source content for the same
lesson-generation pipeline.

This directly targets the sponsor prompt:

- **Main sponsor track:** Lofty AI-Native PM
- **Chosen entry point:** Onboarding Flow
- **Prompt match:** How new users are introduced to AI capabilities and build trust
- **Side tracks to pursue:** Insforge + ElevenLabs
- **Do not pursue:** Tamagrow, unless there is spare time after the main demo works

## Why This Can Win

The strongest product insight is continuous trust. Lofty already has AI capabilities,
but agents may not understand what the AI is doing, where to find it, or why a new
release matters. Lofty Academy turns product education into an active demonstration:

1. The AI shows the dashboard.
2. It explains "Today's Opportunities" and lead scores.
3. The user interrupts: "Wait, what is a lead score?"
4. The AI pauses, navigates to a lead profile, explains the score, and returns.
5. Later, a release note or Help Center article becomes another guided lesson.

That Q&A interrupt is the "aha" moment. It proves this is not just a video, chatbot,
or static checklist. It is contextual product education that teaches inside the product.

## Product Scope

### Must Ship

- A high-fidelity Lofty-style mock CRM
- An embedded Lofty Academy tutor panel
- One polished onboarding lesson
- One interruptible Q&A moment
- One Help Center article converted into a numbered red-box / arrow walkthrough
- Text transcript plus ElevenLabs voice output
- A content-to-lesson generator screen
- Insforge as the primary deployed backend
- A live deployed app, not only localhost
- A 2-minute demo video focused on the aha moment

### Nice To Have

- A second lesson for People / lead score
- Smart Plans or Today's Opportunities as a preview card
- Voice input via browser speech recognition
- Always-on assistant button as a future-state teaser

### Cut If Time Gets Tight

1. Voice input
2. Lessons beyond the first polished flow
3. Screenshot streaming, if direct embedded mock UI is more reliable
4. Always-on assistant mode
5. Full Stagehand automation, if a deterministic scripted demo is needed

The non-negotiable is the user-facing story: AI teaches by operating the CRM, handles
an interruption, then returns to the lesson.

## Demo Strategy

Use the real Lofty login only for research. Do not make the judged demo depend on the
live Lofty site.

Build and demo against a controlled Lofty-style sandbox because it is safer and more
reliable:

- No session expiry
- No bot detection
- No accidental changes to real data
- No private account data in the recording
- Full control over timing and demo polish

Pitch production like this:

> This demo runs in a controlled Lofty-style sandbox for reliability. In production,
> Lofty Academy would validate generated lessons against Lofty's internal staging
> environment before publishing them inside the live product.

Avoid claiming it already works identically on the real Lofty site unless we actually
prove that.

## Architecture

```txt
Lofty release note / Help Center article / PM brief
        |
        v
Content-to-Lesson Engine
        |
        v
Generated lesson JSON
        |
        v
Lesson Validator against CRM sandbox / staging
        |
        v
Lofty Academy Tutor
        |
        v
New or experienced user watches AI operate CRM + asks questions
```

### User-Facing Runtime

- **Frontend:** React + Vite
- **CRM demo:** Lofty-style mock CRM pages/components
- **Tutor UI:** transcript, lesson progress, question input, voice playback
- **Voice output:** ElevenLabs
- **Voice input:** optional Web Speech API fallback; typed question is safer
- **Guidance layer:** product-scoped AI cursor, highlight ring, and click animation
- **Browser/action layer:** Stagehand or deterministic scripted UI actions
- **Primary backend:** Insforge
- **Backend logic:** lesson generation, Q&A, lesson validation, progress tracking, and publishing

### Internal Lofty Layer

This is the scalability layer the judges care about.

1. Product team uploads a release note, Help Center article, or PM brief.
2. AI converts the content into a guided in-product lesson.
3. The lesson is validated against a sandbox/staging CRM.
4. The system reports pass/fail and missing UI anchors.
5. Validated lessons are published to relevant users.

This same pipeline handles both release notes and existing Lofty Help Center tutorials:
ingest source content, extract task steps and UI labels, map each step to a product
anchor, render numbered red boxes/arrows with cursor movement and narration, and let the
user ask questions while the lesson is running.

## Insforge Backend Plan

The Insforge side track has hard requirements, so treat Insforge as the real backend,
not a decorative API call.

Requirements from the sponsor image:

- Must use Insforge as the primary backend
- Must deploy a live, working application
- Must demonstrate real backend usage
- Must use at least 2-3 Insforge features from Auth, Postgres database, Storage,
  Edge Functions / backend logic, and MCP / agent interaction layer

### Insforge Features To Use

Use these four so the side-track story is clear:

1. **Demo auth / profiles**
   - Demo login as `shrey@lofty.demo`, backed by Insforge `profiles`
   - Role options: `agent` and `admin`
   - Agent sees the guided lesson
   - Admin sees the Content-to-Lesson Engine

2. **Postgres Database**
   - Store generated lessons
   - Store release notes
   - Store user lesson progress
   - Store Q&A events from onboarding sessions

3. **Storage**
   - Store uploaded release note files, screenshots, or generated lesson artifacts
   - If time is tight, store only release-note uploads and generated lesson JSON

4. **Edge Functions / Backend Logic**
   - `generateLessonFromReleaseNote`
   - `validateLessonAgainstSandbox`
   - `startLessonSession`
   - `recordQuestionEvent`
   - `publishLessonToAudience`

Bonus if time allows:

- **MCP / agent interaction layer**
  - Expose a simple agent endpoint that retrieves lesson context and returns the next
    action/narration pair.

### Minimum Insforge Demo Proof

In the live app, show:

1. Demo login loads agent/admin profiles from Insforge.
2. Release note is saved to the database.
3. Generated lesson is saved to the database.
4. The lesson appears in the agent onboarding flow.
5. Asking "What is a lead score?" records a Q&A event.
6. Admin dashboard shows stored lesson/progress/event rows or counts.

This proves real backend usage and avoids the "simple API call" problem.

### Suggested Tables

```sql
users
- id
- email
- role
- created_at

release_notes
- id
- title
- raw_json
- uploaded_by
- storage_path
- created_at

lessons
- id
- title
- audience
- source_release_note_id
- lesson_json
- validation_status
- published
- created_at

lesson_progress
- id
- user_id
- lesson_id
- current_step
- completed
- updated_at

qa_events
- id
- user_id
- lesson_id
- question
- answer_summary
- source_screen
- created_at
```

### Deployment Requirement

Deploy the app before recording the final video. The video should briefly show the live
URL and at least one backend-backed action:

- Generate lesson
- Save/publish lesson
- Refresh and show it persists
- Start agent lesson from saved lesson

Localhost can be used for development, but the judged submission needs the live working
application.

## Release Note Format

Use this format in the demo generator:

```json
{
  "feature_name": "AI Follow-Up Suggestions",
  "target_users": ["new agents", "team admins"],
  "goal": "Teach agents how to review and send AI-suggested follow-ups.",
  "entry_point": "People > Lead Profile > Follow-Up Suggestions",
  "user_value": "Helps agents respond faster to warm leads.",
  "key_actions": [
    "open a high-score lead",
    "review the AI follow-up suggestion",
    "edit the message",
    "send or schedule the follow-up"
  ],
  "trust_notes": [
    "explain why the AI suggested this lead",
    "show that the agent can edit before sending",
    "make clear that AI does not send without approval"
  ],
  "success_metric": "First AI follow-up reviewed or sent"
}
```

Generated lesson output:

```json
{
  "title": "Using AI Follow-Up Suggestions",
  "audience": "New agents",
  "steps": [
    {
      "goal": "Find a warm lead with an AI follow-up suggestion",
      "action": "Open People and select a high-score lead",
      "narration": "Lofty highlights leads who are showing intent so you know where to focus first."
    },
    {
      "goal": "Explain why Lofty suggested the follow-up",
      "action": "Open the AI Follow-Up Suggestions panel",
      "narration": "This suggestion is based on recent activity, lead score, and listing views. You stay in control because you can edit before anything is sent."
    }
  ],
  "validation_status": "validated_against_sandbox"
}
```

## Repository Structure

```txt
lofty-academy/
  README.md
  plan.md
  teammate-brief.md
  insforge/
    schema.sql
    functions/
      generateLessonFromReleaseNote.js
      validateLessonAgainstSandbox.js
      recordQuestionEvent.js
  backend/
    optional-local-dev-server.js
    ai/
      qa-handler.js
      tts-client.js
  frontend/
    src/
      App.jsx
      components/
        CRMFrame.jsx
        TutorPanel.jsx
        LessonProgress.jsx
        TranscriptFeed.jsx
        ReleaseLessonGenerator.jsx
        AdminBackendStatus.jsx
        VoiceControls.jsx
      data/
        mockCrmData.js
  mock-crm/
    optional-static-pages/
```

## Build Plan

### Phase 0 - Research Real Lofty

Use the provided Lofty account to learn:

- Real dashboard layout
- Navigation labels
- Lead score language
- Today's Opportunities types
- Smart Plans wording
- What a new agent would find confusing

Also use the Lofty 4.40 release note as the first release-update source. The key
updates to support in the explanation layer are:

- Transaction Role Default Person Setting
- Vendor/Partner Optimization
- Transaction Lead Portal
- Sales Agent: Digital Employee
- Sales Agent: Smarter AI Conversations
- Smart Plan Performance

Do not store credentials in code, logs, screenshots, or the repo.

### Phase 1 - High-Fidelity Mock CRM

Build the first dashboard to match the attached Lofty screenshot as closely as possible:

- Top Lofty navigation with CRM, Sales, Marketing, Content, Automation, Reporting,
  Marketplace, and AI Copilots
- Search bar and user avatar
- Right utility rail
- "Good Evening, Shrey!" dashboard greeting
- New Updates / Announcements card
- Today's New Leads card
- Today's Opportunities card
- Need Keep In Touch, Transactions, and Today's Tasks lower cards

Then add only what the demo needs:

- Dashboard
- Today's Opportunities widget
- People / Leads page
- Lead profile drawer with lead score explanation
- Smart Plans preview card if time allows

Mock data should be realistic:

- Shrey as the demo agent
- Emily Wilson as the first lead-score explanation example
- Maria Chen as a high-interest lead
- James Park as a back-to-site lead
- 1420 Oak St as a listing trigger

Design requirements:

- Lofty-like blue, white, and neutral CRM styling
- Clear navigation
- Onboarding mode banner
- Disabled action buttons during onboarding
- Semantic `data-label` attributes for important elements

### Phase 2 - Tutor Experience

Build the right-side tutor panel:

- Lesson title
- Progress steps
- Transcript
- Question input
- Ask button
- Pause / resume controls if quick
- Voice playback state

The interface should feel like a product feature, not a chatbot bolted onto the side.

Also build the Clicky-like interaction pattern, but scoped to Lofty:

- A blue AI cursor overlay that lives inside the CRM dashboard, not the OS desktop
- Smooth movement to the card or field being explained
- Highlight ring around the target element
- Numbered red boxes and arrows for article-style tutorials, matching how users already
  see support documentation screenshots
- Small click pulse when the tutor "opens" or selects something
- Voice narration synchronized with cursor movement
- Typed Q&A first, optional microphone input later

Add a content-to-lesson demo:

- Use the Aidentified Integration article as the first example.
- Show the model extracting written steps such as connecting Lofty, connecting LinkedIn,
  and sending selected records to Lofty.
- Convert those extracted steps into live dashboard callouts with a red box, arrow,
  AI cursor, and spoken/text explanation.
- Position this as proof that Lofty Academy can reuse existing Lofty documentation,
  not only new release notes.

Important positioning:

> We are not building a general screen buddy. We are using that interaction model to
> solve Lofty's onboarding and release-adoption problem.

Avoid OS-level cursor control in the demo. Keep the cursor/highlight layer inside the
web app so the experience is reliable, safe, and clearly product-native.

### Phase 3 - Insforge Backend

Implement the real backend path before polishing extras:

1. Demo profile login for agent/admin users.
2. Postgres tables for release notes, lessons, progress, and Q&A events.
3. Release note save/load.
4. Generated lesson save/load through an Insforge Edge Function.
5. Q&A event logging.
6. Backend status panel showing persisted counts.

Current status:

- Done locally: demo login, Postgres schema, seeded release/tutorial lessons, progress
  logging, Q&A logging, storage artifact count, and `generate-lesson` Edge Function.
- Still needed before final submission: deploy the live app and polish the admin-facing
  generated lesson/publish story.

This is required for the Insforge track and makes the demo feel like a real SaaS feature.

### Phase 4 - Golden Path Lesson

Lesson 1: "Your AI-Powered Dashboard"

Steps:

1. Open dashboard.
2. Explain "Need Keep In Touch."
3. Highlight "Today's Opportunities."
4. Move the AI cursor to High Interest / Likely Sellers / Back to Site.
5. Explain why these are AI-prioritized signals.
6. Move toward lead score.

Interrupt:

- User asks: "Wait, what is a lead score?"
- AI pauses lesson.
- AI cursor moves to Today's New Leads.
- It highlights Emily Wilson's score chip.
- It opens or reveals a lead-score explanation panel.
- It explains the score and the activity behind it.
- Returns to the dashboard lesson.

This is the demo's core proof.

Current status:

- Started in the prototype: the lesson now begins on "Need Keep In Touch," moves through
  AI opportunity signals, supports the lead-score Q&A interruption, and returns with a
  "Resume lesson" action.
- Next polish: make the golden path feel more cinematic with tighter narration, optional
  ElevenLabs voice output, and a final persisted-event proof in the backend card.

### Phase 5 - Content-to-Lesson Generator

Add an internal admin page:

1. Text area prefilled with the AI Follow-Up Suggestions release note JSON.
2. Button: "Generate Lesson"
3. Generated lesson preview.
4. Save generated lesson to Insforge Postgres.
5. Status pill: "Validated against sandbox"
6. Button: "Publish to new agents"
7. Refresh/reopen page and show the generated lesson persists.

This does not need to be fully autonomous behind the scenes. It needs to demonstrate
the product direction clearly.

### Phase 6 - Voice

Use ElevenLabs for voice output if implementation time allows.

Rules:

- Typed question must work even if voice input fails.
- TTS failure should fall back to text transcript.
- Do not let voice integration block the main demo.

### Phase 7 - Live Deploy, Video, And Pitch

Record a polished 2-minute screen share.

Suggested timing:

- **0:00-0:15:** Problem: new agents face passive onboarding and do not trust AI features yet.
- **0:15-0:35:** Log in to the live app and start a saved dashboard lesson.
- **0:35-1:10:** User asks "What is lead score?" AI pauses, navigates, explains, returns.
- **1:10-1:30:** Show lesson summary and trust-building explanation.
- **1:30-1:55:** Show content-to-lesson generator creating and saving a new lesson.
- **1:55-2:00:** Show backend status or persisted lesson count to prove Insforge usage.

## Judging Criteria Mapping

### The Problem

New real estate agents struggle to activate because onboarding is passive, generic, and
separate from the product. At the same time, Lofty ships AI features that users may not
notice, understand, or trust.

The bottleneck is not only training. It is AI adoption.

### The Solution

Lofty Academy is a continuous AI product education layer. It operates the CRM, narrates
what it is doing, handles user questions in context, and generates new lessons from
release notes and existing Help Center tutorials so learning stays current as Lofty
evolves. It can turn written documentation into live red-box / arrow callouts with
cursor movement and narration. Insforge powers auth, lesson storage, release/tutorial
persistence, progress tracking, Q&A logging, and backend lesson generation.

### The Business Case

Lofty benefits through:

- Faster activation for new agents
- Higher first-30-day feature adoption
- Reduced onboarding and support load
- Higher retention for agents and brokerage teams
- Premium onboarding/custom training for Teams and enterprise brokerages

Possible packaging:

- Included for all new users as core onboarding
- Advanced brokerage-custom lesson builder for Teams / Enterprise
- Admin analytics for customer success teams

Metrics:

- Onboarding completion rate
- Time to first AI-prioritized lead action
- Time to first Smart Plan activation
- Support tickets per new user
- 30/60/90-day retention

### Go-To-Market

Target users:

- New Lofty agents in their first 30 days
- Brokerage admins onboarding teams
- Customer success teams helping new accounts activate

First 1,000 users:

- Roll out as the default first-login experience for new accounts
- Pilot with a small set of brokerages
- Let customer success send Lofty Academy lessons after support tickets
- Use product analytics to identify users who have not used AI features and trigger lessons

### 2-Minute Demo Video

Focus on the aha moment:

> The user asks a question mid-onboarding. The AI stops, shows the answer inside the
> CRM, explains why Lofty's AI made the recommendation, and then resumes the lesson.

Do not spend the demo showing code.

### Problem Statement Match

Competing for:

**Lofty AI-Native PM Track - Onboarding Flow**

Specific match:

> How new users are introduced to AI capabilities and build trust.

Lofty Academy builds trust by making AI behavior visible, explainable, and reversible
during the user's first product experience.

## Side Track Decision

### Keep: ElevenLabs

Why:

- Voice makes the tutor feel present and guided.
- Strongly supports onboarding and trust.
- Easy to explain in demo.

Risk control:

- Use TTS only.
- Keep typed questions as the primary reliable input.

### Keep: Insforge

Why:

- The side track explicitly requires Insforge as the primary backend.
- The backend is naturally agentic: auth, lesson state, user interruption, release
  generation, validation, storage, and publishing.
- This supports the scalability story.

Build requirement:

- Use demo profile login + Postgres + Storage + Edge Functions/backend logic.
- Deploy a live working app.
- Show persisted backend state in the demo.

### Drop: Tamagrow

Why:

- Build-in-public / traction work is less aligned with the Lofty sponsor prompt.
- It could distract from product polish.
- Revisit only after the main demo and video are complete.

## Clicky Proxy Decision

Do not use `clicky-proxy` as the project foundation.

Why:

- It is a local proxy for a separate desktop app.
- It uses coordinate-based clicking through macOS automation.
- It does not provide the Lofty mock CRM, lesson engine, release generator, or DOM-based
  product onboarding flow.
- Coordinate clicking weakens the scalability argument.

What we can borrow:

- Simple `/health` endpoint idea
- Backend logging style
- TTS fallback idea

Build our own controlled web app instead.

## Final Build Priority

1. Lofty-style CRM sandbox
2. Live AI guidance layer: tutor, cursor, highlights, red boxes/arrows, and Q&A interrupt
3. Insforge demo profiles + Postgres persistence
4. Content-to-lesson demo saved through Insforge
5. Golden path lesson
6. Live deployment
7. ElevenLabs voice output
8. Demo polish and recording
9. Slides / written rationale

If only one thing is perfect, make the interrupt demo perfect.
