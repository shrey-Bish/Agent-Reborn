# Lofty Academy - Teammate Brief

## One-Sentence Idea

Lofty Academy is an AI onboarding tutor that teaches new real estate agents by operating
a Lofty-style CRM in front of them, explaining AI features, answering questions mid-flow,
and generating new lessons from future product release notes.

## What We Are Building

We are building a demo web app, not automating the real Lofty production account.

The demo has four main pieces:

1. **Mock Lofty CRM**
   A realistic CRM interface with dashboard, Today's Opportunities, People, lead score,
   and lead profile details.

2. **Lofty Academy Tutor**
   A right-side onboarding assistant that narrates a lesson, tracks progress, and lets
   the user ask a question while the lesson is running.

3. **Release Lesson Generator**
   An internal admin screen where a PM pastes a structured release note and the system
   generates a new guided onboarding lesson.

4. **Insforge Backend**
   The real backend for auth, database persistence, release-note storage, lesson
   generation, progress tracking, and Q&A logging.

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

- **Auth:** agent/admin login
- **Postgres:** release notes, lessons, lesson progress, Q&A events
- **Storage:** uploaded release notes or generated lesson artifacts
- **Backend logic:** generate lesson, validate lesson, record question, publish lesson

In the demo, we should visibly prove backend usage by saving a generated lesson,
refreshing, and showing it persists. Also show a backend status/admin panel with counts
like lessons generated, users onboarded, and questions answered.

## The Aha Moment

This is the moment the demo must nail:

1. New user starts the dashboard onboarding lesson.
2. AI explains Today's Opportunities.
3. User asks: "Wait, what is a lead score?"
4. AI pauses the lesson.
5. AI opens the People page and selects Marcus Webb.
6. AI explains why Marcus has a score of 87.
7. AI says, "Back to where we were," and returns to the dashboard lesson.

This proves the product is not a static tutorial, chatbot, or video. It is contextual,
interactive onboarding.

## Demo Pages

### Dashboard

Needs:

- Onboarding mode banner
- Need Keep In Touch widget
- Today's Opportunities widget
- Top Lead Today: Marcus Webb, score 87
- Active Transactions or Upcoming Showings as supporting CRM realism

### People / Lead Profile

Needs:

- Lead list with scores
- Marcus Webb row
- Lead profile drawer
- Score 87 explanation
- Recent activity: viewed listings, returned to site, saved search
- Current Smart Plan

### Release Lesson Generator

Needs:

- Text area with structured release note JSON
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

**Problem:** New agents do not activate because onboarding is passive and AI features
are hard to understand or trust.

**Solution:** AI tutor operates the CRM, explains AI decisions, answers questions in
context, and auto-generates lessons from release notes. Insforge powers auth, lesson
storage, release persistence, progress tracking, and Q&A logging.

**Business case:** Faster activation, fewer support tickets, higher AI feature adoption,
better retention, premium brokerage onboarding.

**GTM:** Default first-login onboarding for new users, brokerage pilot, customer success
rollout, triggered lessons for users who have not adopted AI features.

**Demo video:** Show the Q&A interrupt. Do not show code.

**Track match:** Lofty AI-Native PM, Onboarding Flow.

## Build Priorities

1. Make the mock CRM look credible.
2. Wire Insforge Auth and Postgres persistence.
3. Make the tutor flow smooth.
4. Make the interrupt question work and log it.
5. Add release generator for scalability.
6. Deploy the live app.
7. Add ElevenLabs voice output if time allows.
8. Polish and record the demo.

## Things To Avoid

- Do not build five full lessons.
- Do not depend on live Lofty in the final demo.
- Do not use coordinate-clicking tools as the core architecture.
- Do not over-focus on the tech stack in the pitch.
- Do not split the Lofty pitch across multiple entry points.

## The Pitch Line

Use this line often:

> Lofty Academy is not a hardcoded tutorial library. It is a release-aware onboarding
> system: every new Lofty feature can become an interactive, validated, in-product lesson.
