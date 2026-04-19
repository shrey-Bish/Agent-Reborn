# Agent Reborn - Lofty Academy Teammate Brief

## One-Sentence Idea

Lofty Academy is a continuous AI product education layer for Lofty: it helps new agents
learn core AI workflows during onboarding, then keeps experienced agents current by
turning release notes and Help Center tutorials into live in-product lessons.

Team/project name: **Agent Reborn**.

For the first demo, the dashboard should visually match the attached Lofty screenshot,
and the release-update source should start with Lofty 4.40:

`https://help.lofty.com/hc/en-us/articles/48927271391259-Feature-Updates-for-Lofty-4-40`

We should also use Lofty's existing Help Center as base knowledge:

`https://help.lofty.com/hc/en-us`

First tutorial extraction example:

`https://help.lofty.com/hc/en-us/articles/40537616665627-Aidentified-Integration`

Core pitch:

> Lofty Academy starts as onboarding, but becomes a continuous update layer. Every
> release note or Help Center tutorial can become an interactive in-product lesson, so
> both new and experienced agents understand Lofty features at the moment they need them.

## What We Have Built

The demo is a fully functional web app (React + Vite), not automating the real Lofty account.

The demo has four product pillars, all implemented:

1. **Lofty-style CRM sandbox** ✅
   Four CRM views: Dashboard, Smart Plans (table + create form), People (lead list +
   Emily Wilson detail drawer with score breakdown), and Release Detail (Lofty 4.40
   feature cards).

2. **Live AI guidance layer** ✅
   Academy Mode with animated overlay: left panel (4 sections: Lessons, Release Notes,
   Help Center, Achievements), center CRM simulator with AI cursor + highlight ring,
   right AI Tutor Chat with full transcript, ask anything input, and continuous mic.

3. **Content-to-lesson engine**
   Release notes and Help Center tutorials are both source content. The system extracts
   key steps and turns them into guided in-product lessons.

4. **Insforge backend** ✅
   Backend for persistence: lesson storage, progress tracking, Q&A event logging,
   and ElevenLabs voice synthesis via Edge Functions.

## Why We Are Not Using Real Lofty For The Demo

We have Lofty credentials for research, but the judged demo should run on our mock CRM.

Reasons:

- Live login can expire.
- Automation can break on production timing.
- We might expose private account data.
- We need the 2-minute video to be reliable.
- A controlled sandbox lets us show the exact winning moment cleanly.

Production story:

> In real Lofty, this would run against Lofty's staging environment first. Generated
> lessons would be validated there before being published inside the live product.

## Sponsor Track

Main track:

**Lofty AI-Native PM**

Chosen entry point:

**Onboarding Flow - How new users are introduced to AI capabilities and build trust**

Side tracks:

- ElevenLabs for voice output
- Insforge as the primary backend

Do not spend time on Tamagrow unless everything else is finished.

## Insforge Requirements

The Insforge track has strict requirements:

- Must use Insforge as the primary backend
- Must deploy a live, working application
- Must demonstrate real backend usage, not just simple API calls
- Must use at least 2-3 of these features:
  - Auth
  - Database / Postgres
  - Storage
  - Edge Functions / backend logic
  - MCP / agent interaction layer as a bonus

Our plan uses:

- **Demo auth / profiles:** agent/admin login backed by Insforge profiles
- **Postgres:** release notes, lessons, lesson progress, Q&A events
- **Storage:** uploaded release notes or generated lesson artifacts
- **Backend logic:** generate lesson, validate lesson, record question, publish lesson

In the demo, we should visibly prove backend usage by saving a generated lesson,
refreshing, and showing it persists. Also show a backend status/admin panel with counts
like lessons generated, users onboarded, and questions answered.

## The Aha Moment

This is the moment the demo must nail:

1. New user starts the dashboard onboarding lesson.
2. User toggles **Academy mode** in the top-right navbar.
3. The Academy overlay animates in: top bar first, left/right panels second, content fade third.
4. The dashboard stays visible in the middle as a zoomed simulator, while lessons/completion
   live on the left and AI chat/voice lives on the right.
5. AI explains Today's Opportunities.
6. User asks: "Wait, what is a lead score?"
7. AI pauses the lesson and highlights Emily Wilson's score chip.
8. AI explains why the lead has that score, then resumes the dashboard lesson.

This proves the product is not a static tutorial, chatbot, or video. It is contextual,
interactive onboarding.

## Demo Pages

### Dashboard ✅

Implemented:

- Top navigation: Lofty logo, CRM, Sales, Marketing, Content, Automation, Reporting,
  Marketplace, AI Copilots, search, avatar
- Right utility rail with icon strip
- "Good Afternoon, Shrey!" greeting and Today's Priorities control
- Top-right navbar toggle: **Academy mode** (toggles on/off with animation)
- New Updates / Announcements card
- Today's New Leads with Emily Wilson (score 59), Carlos Garcia (44), Samuel Scott (43)
- Today's Opportunities with High Interest / Likely Sellers / Back to Site
- Need Keep In Touch, Transactions, and Today's Tasks cards

### Academy Mode ✅ — Fully Functional

Left panel (4 sections):
- **Lessons** — 2 LIVE (Smart Plan, Lead Score) + 2 COMING SOON (Follow-Up, AI Copilots)
- **Release Notes** — 1 LIVE (Lofty 4.40) + 3 COMING SOON (4.39.5, 4.39, 4.38)
- **Help Center** — 6 modules with expandable articles, 1 LIVE (Dashboard Overview)
- **Achievements** — placeholder
- Progress ring showing 75% completion
- Help Center Tutorials feature card

Center CRM simulator:
- AI cursor with smooth transition animation and blue pointer SVG
- Highlight ring with pulsing glow around target elements
- Click pulse animation when cursor "clicks"
- CRM navigates between Dashboard, Smart Plans, People, and Release Detail views
- Lead detail drawer slides in for Emily Wilson with score breakdown
- Smart Plan creator form appears during lesson

Right panel (AI Tutor Chat):
- Full scrolling transcript of all AI narrations and user messages
- Chat bubbles with AI Tutor / You labels
- "Ask anything..." textarea input with send button
- Single mic button at bottom (continuous — stays on until explicitly stopped)
- Speaking indicator pill when ElevenLabs audio is playing
- Empty state with welcome message

Interrupt system:
- User types or speaks a trigger phrase (e.g. "what is smart plan")
- Lesson pauses immediately, audio stops, cursor clears
- AI dictates (voice + text) a detailed explanation of the concept
- AI asks "shall I continue?" with voice dictation
- User says "yes" / "continue" → lesson resumes from next step
- Q&A event logged to Insforge backend

### Content-to-Lesson Generator

Needs:

- Text area with structured release note JSON or Help Center article content
- Button: Generate Lesson
- Generated lesson preview
- Save generated lesson to Insforge Postgres
- Status: Validated against sandbox
- Button: Publish to new agents
- Backend status/counts panel

## Release Note Example

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
  ]
}
```

## Judging Criteria Cheat Sheet

**Problem:** Lofty has a mixed education bottleneck: first-time onboarding must build
trust, while experienced agents also need ongoing value after product updates.

**Solution:** A continuous AI product education layer operates the CRM, explains AI
decisions, answers questions in context, and turns release notes or Help Center tutorials
into guided lessons. Insforge powers demo profiles, lesson storage, release/tutorial
persistence, progress tracking, Q&A logging, and ElevenLabs narration through Edge
Functions.

**Clicky comparison:** We borrow the interaction model of talking, pointing, and guiding,
but we do not build a general desktop screen buddy. Our cursor/highlight layer is scoped
inside Lofty and connected to onboarding state, CRM concepts, release notes, and lesson
progress.

**Help Center extraction:** Supporting proof inside the content-to-lesson engine. Existing
Lofty tutorials become live numbered red boxes, arrows, cursor movement, and narration.

**Business case:** Faster activation, fewer support tickets, higher AI feature adoption,
better retention, premium brokerage onboarding.

**GTM:** Default first-login onboarding for new users, brokerage pilot, customer success
rollout, triggered lessons for users who have not adopted AI features.

**Demo video:** Show the Q&A interrupt. Do not show code.

**Track match:** Lofty AI-Native PM, Onboarding Flow.

## Build Priorities

1. ✅ Make the Lofty-style CRM sandbox look credible.
2. ✅ Build the live AI guidance layer: cursor, highlights, and Q&A interrupt.
3. ✅ Wire Insforge persistence and log lesson/Q&A state.
4. ✅ Build Academy Mode: animated overlay, 4 lesson categories, CRM views, AI chat, voice.
5. ✅ Add release-note and Help Center lessons inside Academy Mode.
6. **Deploy the live app.** ← NEXT
7. **Polish and record the demo.** ← NEXT

## Things To Avoid

- Do not build five full lessons.
- Do not depend on live Lofty in the final demo.
- Do not use OS-level coordinate-clicking tools as the core architecture.
- Do not pitch this as a generic Clicky clone.
- Do not over-focus on the tech stack in the pitch.
- Do not split the Lofty pitch across multiple entry points.

## The Pitch Line

Use this line often:

> Lofty Academy is not a hardcoded tutorial library. It is a continuous product
> education layer: every new Lofty feature or tutorial can become an interactive,
> validated, in-product lesson.

For Clicky comparisons:

> Clicky is a general screen companion. Lofty Academy is a product-native education
> layer that uses a similar talk-and-guide interaction, but only to help agents
> understand and trust Lofty's AI workflows.
