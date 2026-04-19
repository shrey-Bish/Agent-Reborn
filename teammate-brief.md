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

## What We Are Building

We are building a demo web app, not automating the real Lofty production account.

The demo has four product pillars:

1. **Lofty-style CRM sandbox**
   A controlled, realistic CRM environment with dashboard, Today's Opportunities, lead
   scores, and supporting CRM details.

2. **Live AI guidance layer**
   The user-facing magic now lives inside **Academy Mode**: a top-right navbar toggle,
   animated top bar, left course/progress panel, zoomed full-dashboard CRM simulator,
   right AI chat history, tutor actions, Q&A interrupt, and voice output.

3. **Content-to-lesson engine**
   Release notes and Help Center tutorials are both source content. The system extracts
   key steps and turns them into guided in-product lessons.

4. **Insforge backend**
   The real backend for auth, persistence, release/tutorial storage, lesson state, Q&A
   logging, and publish flow.

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

### Dashboard

Needs:

- Top navigation matching the screenshot: Lofty logo, CRM, Sales, Marketing, Content,
  Automation, Reporting, Marketplace, AI Copilots, search, avatar
- Right utility rail
- "Good Evening, Shrey!" greeting and Today's Priorities control
- Top-right navbar toggle: **Academy mode**
- Need Keep In Touch widget
- Today's Opportunities widget
- Today's New Leads with Emily Wilson, score 59
- Active Transactions or Upcoming Showings as supporting CRM realism

### Academy Mode

Needs:

- Left panel with course lessons and completion state
- Middle panel with the zoomed full-dashboard Lofty CRM simulator and red-box/cursor guidance
- Right panel with AI chat history, Q&A input, Voice button, lesson actions, and backend proof
- Release lesson included in the course list, not treated as a separate product
- Help Center extraction available as supporting proof, but not the main story

Current implementation note:

- The panel UI is intentionally replaceable for redesign, but the behavior is already wired.
- Left panel lesson clicks move the live cursor and record progress through Insforge.
- Right panel uses the live tutor: transcript, Ask flow, Resume lesson, Voice, release/help actions,
  and backend proof counts.
- The center CRM is a fixed full-dashboard stage that zooms down to fit the middle viewport,
  so the dashboard does not reflow into a narrow layout.

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

1. Make the Lofty-style CRM sandbox look credible.
2. Build the live AI guidance layer: tutor, cursor, highlights, red boxes/arrows, and Q&A interrupt.
3. Wire Insforge demo profiles/Postgres persistence and log lesson/Q&A state.
4. Make Academy Mode the main judged flow: animated overlay, course list, zoomed simulator, AI chat, voice, and Q&A.
5. Keep release-note and Help Center lessons inside Academy Mode.
6. Deploy the live app.
7. Polish and record the demo.

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
