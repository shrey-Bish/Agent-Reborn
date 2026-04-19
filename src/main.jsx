import React, { useEffect, useRef, useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import {
  synthesizeLessonSpeech,
  recordQuestionEvent,
  recordLessonProgress,
  isInsforgeConfigured,
  fetchBackendSnapshot,
} from "./insforgeBackend";
import { askGeminiTutor, isGeminiConfigured } from "./geminiClient";

/* ═══════════════════════════════════════
   LESSON DATA
   ═══════════════════════════════════════ */

const SMART_PLAN_LESSON = {
  id: "smart-plan",
  title: "Smart Plans Walkthrough",
  subtitle: "Automated lead nurturing",
  icon: "🎯",
  steps: [
    {
      narration:
        "Welcome! I'll show you how Smart Plans work in Lofty. Smart Plans are powerful automated sequences that combine emails, texts, and tasks to nurture leads continuously — no manual follow-up needed.",
      target: null,
    },
    {
      narration:
        "First, let's head over to the Automation section.",
      target: "nav-automation",
      action: "click",
    },
    {
      narration:
        "This is the Smart Plans dashboard. The header shows two key tabs: Plans — your active plans — and Library, a collection of pre-built templates you can import.",
      target: "smart-plans-header",
      action: "highlight",
      effect: { navigate: "smartPlans" },
    },
    {
      narration:
        "In the Plans tab you can see all your plans at a glance — Plan Name, Scope, Lead Type, Duration, Application trigger, Auto Apply, and Actions.",
      target: "sp-toolbar",
      action: "highlight",
    },
    {
      narration:
        "Now let's look at a specific plan. The 'New Buyer Welcome Sequence' runs for 14 days — sending scheduled emails and creating follow-up tasks during that window.",
      target: "plan-duration-1",
      action: "highlight",
    },
    {
      narration:
        "The Auto Apply toggle lets a plan automatically enroll leads when they match the configured trigger — like when a new lead registers or a tag is added. No manual assignment needed.",
      target: "sp-col-auto-apply",
      action: "highlight",
    },
    {
      narration:
        "You can also filter plans by Auto Apply status or by Scope — for example, showing only your personal plans versus company-wide plans shared across the team.",
      target: "sp-auto-apply-filter",
      action: "highlight",
    },
    {
      narration:
        "Now let me show you the Library tab — it has pre-built templates you can import instantly.",
      target: "sp-tab-library",
      action: "click",
    },
    {
      narration:
        "Here in the Library you can find professional templates like 'Buyer-No Response AI', 'Realty.com Seller Engagement', and 'Buyer Lead Cold Workflow'. Each card shows the communication channels used — phone, email, SMS — and the total plan duration.",
      target: null,
      effect: { setSpTab: "Library" },
    },
    {
      narration:
        "Now let's go back to Plans and create a new one.",
      target: "sp-tab-plans",
      action: "click",
    },
    {
      narration:
        "Click the Create Smart Plan button to start building your own automated sequence.",
      target: "create-plan-btn",
      action: "click",
      effect: { setSpTab: "Plans" },
    },
    {
      narration:
        "Here's the plan creation form. Let's walk through it step by step.",
      target: "plan-name-input",
      action: "highlight",
      effect: { showCreator: true },
    },
    {
      narration:
        "Start by giving your plan a descriptive name. A clear name like 'New Buyer Welcome Sequence' helps you identify it quickly across all your plans.",
      target: "plan-name-input",
      action: "highlight",
    },
    {
      narration:
        "Next, choose a trigger. This determines exactly when a lead enters the plan automatically — you can trigger on new lead registration, a tag being added, or even a manual assignment.",
      target: "plan-trigger",
      action: "highlight",
    },
    {
      narration:
        "Once you're happy with the setup, click Save Plan. Lofty will immediately start enrolling matching leads and executing the sequence. That's the full power of Smart Plans — set it up once and let it run!",
      target: "plan-save-btn",
      action: "highlight",
    },
  ],
  interrupts: {
    "what is smart plan": {
      answer:
        "A Lofty Smart Plan is an automated lead-nurturing sequence that combines email drip campaigns, texts, and tasks. Once set up, it runs automatically based on a trigger — like a new lead registering or a tag being added. Plans have a defined duration and can be set to Auto Apply so leads are enrolled without any manual work. You can also use the Library to import professionally designed templates.",
      resumePrompt:
        "Now that you understand Smart Plans, shall I continue the walkthrough?",
    },
    "auto apply": {
      answer:
        "Auto Apply means Lofty will automatically enroll leads into the Smart Plan whenever they match the trigger you set — for example, when a new lead registers or when a specific tag is added to their profile. You don't need to manually assign the plan to each lead.",
      resumePrompt: "Want me to continue from where we left off?",
    },
    "library": {
      answer:
        "The Smart Plan Library is a collection of pre-built, professionally designed plan templates. You can filter by Plan Type, Lead Type, and Scenario. Each template card shows which communication channels it uses (email, text, call, AI) and the plan duration. Click 'Use Template' to import any template directly into your account.",
      resumePrompt: "Shall I continue the lesson?",
    },
  },
};

const DASHBOARD_LESSON = {
  id: "dashboard-overview",
  title: "Dashboard Quick Tour",
  subtitle: "Your CRM home base",
  icon: "🏠",
  steps: [
    {
      narration:
        "Welcome! Let me give you a quick tour of your Lofty CRM dashboard — this is your command center. Everything you need is just a click away.",
      target: null,
    },
    {
      narration:
        "The top navigation bar gives you instant access to all major sections: CRM, Sales, Marketing, Content, Automation, Reporting, Marketplace, and AI Copilots.",
      target: "nav-links",
      action: "highlight",
    },
    {
      narration:
        "The New Updates card shows the latest announcements and feature releases from Lofty. This is how you stay current with new tools as they roll out.",
      target: "updates-card",
      action: "highlight",
    },
    {
      narration:
        "Today's New Leads shows every lead that registered today but hasn't been contacted yet. The colored score badge is their AI-calculated lead score — higher means hotter. These are your highest-priority calls for the day.",
      target: "today-new-leads-card",
      action: "highlight",
    },
    {
      narration:
        "The Today's Opportunities card surfaces high-intent signals — buyers actively searching, likely sellers, and leads returning to your site. Think of this as your AI-curated shortlist of the most promising actions right now.",
      target: "opportunities-card",
      action: "highlight",
    },
    {
      narration:
        "And that's the dashboard! In just a few seconds you can see who needs attention, what's new, and where your biggest opportunities are. Start here every morning to prioritize your day.",
      target: null,
    },
  ],
  interrupts: {
    "lead score": {
      answer:
        "The Lead Score is an AI-powered rating from 0 to 100 based on how engaged a lead is — website visits, listing views, email opens, and more. A score of 80+ means this lead is very active and likely close to making a decision. Prioritize high-score leads for immediate outreach.",
      resumePrompt: "Want me to continue the dashboard tour?",
    },
    "opportunities": {
      answer:
        "The Today's Opportunities card uses AI to surface leads showing high-intent signals right now — things like returning to your website, saving multiple listings, or showing patterns similar to past buyers. It's your AI assistant telling you 'these leads are worth a call today'.",
      resumePrompt: "Shall I continue?",
    },
  },
};

const LEAD_SCORE_LESSON = {
  id: "lead-score",
  title: "Understanding Lead Scores",
  subtitle: "AI-powered lead prioritization",
  icon: "📊",
  steps: [
    {
      narration:
        "Let me explain how Lofty's AI-powered Lead Scoring system works. It helps you focus on the most promising leads.",
      target: null,
    },
    {
      narration:
        "Look at the Today's New Leads card on your dashboard. Each lead has a colored score badge — their AI-calculated lead score.",
      target: "today-new-leads-card",
      action: "highlight",
    },
    {
      narration:
        "Emily Wilson has a lead score of 59, shown in this blue badge. Scores range from 0 to 100 — higher means more engaged and likely to convert.",
      target: "emily-score",
      action: "highlight",
    },
    {
      narration:
        "Let's navigate to the People page to see all your leads and their scores in one view.",
      target: "nav-crm",
      action: "click",
      effect: { navigate: "people" },
    },
    {
      narration:
        "Here's your People page with all leads listed. Notice Maria Chen has the highest score at 82 — she's your hottest lead right now.",
      target: "lead-maria",
      action: "highlight",
    },
    {
      narration:
        "Let's click on Emily Wilson to see her full profile and understand what drives her lead score.",
      target: "lead-emily",
      action: "click",
      effect: { showDrawer: true },
    },
    {
      narration:
        "Here's Emily's score breakdown. Her score of 59 is based on 12 website visits this week, 5 saved listings, 3 opened emails, and fast response times.",
      target: "score-breakdown",
      action: "highlight",
    },
    {
      narration:
        "The Lead Analysis shows Emily has high engagement with 3-bedroom properties downtown, with a rising trend. Use this to personalize your outreach!",
      target: "lead-analysis",
      action: "highlight",
    },
  ],
  interrupts: {
    "what is lead score": {
      answer:
        "A Lofty Lead Score is an AI-based scoring system that helps you determine lead priority. It analyzes behavioral signals like website visits, listing views, email engagement, and communication patterns to assign a score from 0 to 100. Higher scores indicate leads who are more engaged and ready to convert. The Lead Analysis feature complements this with strong facts and insights into how hot the lead really is.",
      resumePrompt:
        "Now you understand lead scoring! Would you like me to continue the walkthrough?",
    },
    "lead score": {
      answer:
        "Lead Score is Lofty's AI-powered system that rates your leads from 0 to 100 based on their engagement — website visits, email opens, listing views, and more. Higher score means a hotter lead!",
      resumePrompt: "Ready to continue?",
    },
  },
};

const RELEASE_440_LESSON = {
  id: "release-4-40",
  title: "Lofty 4.40 Feature Updates",
  subtitle: "April 2025 release highlights",
  icon: "🚀",
  version: "v4.40",
  steps: [
    {
      narration:
        "Let me walk you through the latest Lofty 4.40 release. There are exciting new features to boost your workflow.",
      target: null,
    },
    {
      narration:
        "Notice the New Updates card on your dashboard. This is where Lofty announces the latest capabilities.",
      target: "updates-card",
      action: "highlight",
    },
    {
      narration:
        "Let's explore the details. I'll open the feature updates for you.",
      target: "update-link",
      action: "click",
      effect: { navigate: "releaseDetail" },
    },
    {
      narration:
        "The biggest update: Sales Agent as a Digital Employee. Lofty's AI Sales Agent is now positioned as a virtual team member — handling initial conversations, qualifying prospects, and following up 24/7.",
      target: "feature-sales-agent",
      action: "highlight",
    },
    {
      narration:
        "Smart Plan Performance reporting has been enhanced with detailed conversion metrics, engagement rates, and ROI data for each of your automated sequences.",
      target: "feature-smart-plan-perf",
      action: "highlight",
    },
    {
      narration:
        "The Transaction Lead Portal gives your transaction leads a dedicated space to track deal progress, upload documents, and stay updated on milestones.",
      target: "feature-transaction",
      action: "highlight",
    },
    {
      narration:
        "That covers the highlights of Lofty 4.40! These features are designed to help you work more efficiently and close more deals.",
      target: null,
    },
  ],
  interrupts: {
    "what is sales agent": {
      answer:
        "The Sales Agent in Lofty 4.40 is presented as a Digital Employee — an AI-powered assistant that handles initial lead conversations, qualifies prospects, and follows up automatically. Think of it as a virtual team member who works around the clock with smarter, more natural conversations.",
      resumePrompt:
        "Want me to continue showing you the other 4.40 features?",
    },
    "what is digital employee": {
      answer:
        "Digital Employee is Lofty's new way of positioning the AI Sales Agent. Instead of being just a chatbot, it's framed as a team member you can hire, evaluate, and manage — making it easier to trust and understand what the AI is doing on your behalf.",
      resumePrompt: "Shall I continue with the release notes?",
    },
  },
};

const HELP_CENTER_LESSON = {
  id: "help-dashboard",
  title: "Dashboard Overview",
  subtitle: "Getting Started guide",
  icon: "📖",
  steps: [
    {
      narration:
        "Welcome to the Dashboard Overview from the Lofty Help Center. Let me walk you through every section of your CRM dashboard.",
      target: null,
    },
    {
      narration:
        "The top navigation bar gives you quick access to CRM, Sales, Marketing, Content, Automation, Reporting, Marketplace, and AI Copilots.",
      target: "nav-links",
      action: "highlight",
    },
    {
      narration:
        "The New Updates card shows the latest Lofty announcements and feature releases. Check here regularly to stay current.",
      target: "updates-card",
      action: "highlight",
    },
    {
      narration:
        "Today's New Leads shows contacts who registered today but haven't been contacted yet. The score badge indicates engagement level.",
      target: "today-new-leads-card",
      action: "highlight",
    },
    {
      narration:
        "Today's Opportunities tracks high-interest buyers, likely sellers, and leads returning to your site. These are your priority actions for the day.",
      target: "opportunities-card",
      action: "highlight",
    },
    {
      narration:
        "That covers the dashboard basics! Explore each section to become familiar with your CRM workspace.",
      target: null,
    },
  ],
  interrupts: {},
};

const DUMMY_LESSONS = [
  { id: "dashboard-overview", title: "Dashboard Quick Tour", subtitle: "Your CRM home base", icon: "🏠" },
  { id: "followup", title: "Follow-Up Strategies", subtitle: "Best practices", icon: "📬", dummy: true },
  { id: "copilots", title: "AI Copilots Overview", subtitle: "Getting started with AI", icon: "🤖", dummy: true },
];

const DUMMY_RELEASES = [
  { version: "v4.39.5", title: "Lofty 4.39.5 Patch", subtitle: "Bug fixes & improvements", dummy: true },
  { version: "v4.39", title: "Lofty 4.39 Update", subtitle: "March 2025 features", dummy: true },
  { version: "v4.38", title: "Lofty 4.38 Update", subtitle: "February 2025 features", dummy: true },
];

const HELP_CENTER_MODULES = [
  { icon: "🚀", title: "Getting Started", desc: "Step-by-step guides and training", articles: ["Account Setup", "Dashboard Overview", "First Lead Import"] },
  { icon: "💼", title: "CRM", desc: "Dashboard, Listing Alerts, Reports", articles: ["Open House Forms", "Dashboard Widgets", "Listing Alerts Setup"] },
  { icon: "👥", title: "Lead Management", desc: "Lead Profile, People Page, Lead Score", articles: ["Lead Profile Page", "People Page Filters", "Lead Score & Analysis"] },
  { icon: "📧", title: "Communication & Automation", desc: "Smart Plans, Email Marketing, Calling", articles: ["Smart Plan Builder", "Email Campaign Setup", "Call & Text Packages"] },
  { icon: "🌐", title: "IDX Website", desc: "Website setup and management", articles: ["Website Builder", "SEO Settings", "Lead Capture Forms"] },
  { icon: "🔗", title: "Integrations", desc: "CRM and Website integrations", articles: ["Google Analytics", "Facebook Pixel", "Aidentified Integration"] },
];

const ALL_LESSONS_MAP = {
  "smart-plan": SMART_PLAN_LESSON,
  "lead-score": LEAD_SCORE_LESSON,
  "release-4-40": RELEASE_440_LESSON,
  "help-dashboard": HELP_CENTER_LESSON,
  "dashboard-overview": DASHBOARD_LESSON,
};

/* ═══════════════════════════════════════
   MOCK CRM DATA
   ═══════════════════════════════════════ */

const SMART_PLANS_DATA = [
  { name: "Lofty Bloom Companion Smart Plan", scope: "My Plan", leadType: "Buyer, Seller", duration: "28 days", application: "When: Le… Lofty Blo…", autoApply: false },
  { name: "New Buyer Welcome Sequence", scope: "My Plan", leadType: "Buyer", duration: "14 days", application: "When: New lead registers", autoApply: true },
  { name: "Seller Listing Nurture", scope: "Company", leadType: "Seller", duration: "30 days", application: "When: Tag added", autoApply: true },
  { name: "Open House Follow-Up", scope: "My Plan", leadType: "Buyer", duration: "7 days", application: "When: Manual assignment", autoApply: false },
  { name: "Expired Listing Outreach", scope: "Company", leadType: "Seller", duration: "21 days", application: "When: Le… Expired L…", autoApply: false },
];

const PEOPLE_DATA = [
  { name: "Maria Chen", type: "Buyer", source: "Direct", score: 82, scoreColor: "#dcfce7", scoreText: "#16a34a" },
  { name: "James Park", type: "Seller", source: "Google", score: 71, scoreColor: "#dbeafe", scoreText: "#1d4ed8" },
  { name: "Emily Wilson", type: "Renter", source: "Facebook", score: 59, scoreColor: "#eef1fd", scoreText: "#3b5cde" },
  { name: "Carlos Garcia", type: "Other", source: "Zillow", score: 44, scoreColor: "#fce7f3", scoreText: "#be185d" },
  { name: "Samuel Scott", type: "Buyer", source: "YouTube", score: 43, scoreColor: "#dcfce7", scoreText: "#16a34a" },
];

/* ═══════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════ */

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const SpeechRecognition =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

/* ═══════════════════════════════════════
   APP
   ═══════════════════════════════════════ */

function App() {
  /* ── state ────────────────────── */
  const [academyOn, setAcademyOn] = useState(false);
  const [lpView, setLpView] = useState("main"); // main | lessons | releases | helpCenter | helpArticles | lessonActive
  const [expandedHC, setExpandedHC] = useState(null);

  // CRM
  const [crmView, setCrmView] = useState("dashboard"); // dashboard | smartPlans | people | releaseDetail
  const [showLeadDrawer, setShowLeadDrawer] = useState(false);
  const [showPlanCreator, setShowPlanCreator] = useState(false);
  const [spTab, setSpTab] = useState("Plans");

  // Lesson engine
  const [activeLesson, setActiveLesson] = useState(null);
  const [lessonState, setLessonState] = useState("IDLE"); // IDLE | PLAYING | INTERRUPTED | COMPLETE
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [waitingForResume, setWaitingForResume] = useState(false);

  // Cursor
  const [cursorTarget, setCursorTarget] = useState(null);
  const [cursorPos, setCursorPos] = useState(null);
  const [highlightRect, setHighlightRect] = useState(null);
  const [showClickPulse, setShowClickPulse] = useState(false);

  // Chat / transcript
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  // Voice
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micActive, setMicActive] = useState(false);

  // Backend status
  const [backendCounts, setBackendCounts] = useState(null);

  // AI answering state (Gemini Q&A in progress)
  const [isAiAnswering, setIsAiAnswering] = useState(false);

  /* ── refs ────────────────────── */
  const lessonStateRef = useRef("IDLE");
  const lessonRunId = useRef(0);
  const currentAudioRef = useRef(null);
  const chatAreaRef = useRef(null);
  const chatInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const isAiAnsweringRef = useRef(false);
  const preQACrmStateRef = useRef(null);

  /* ── sync refs ──────────────── */
  useEffect(() => {
    lessonStateRef.current = lessonState;
  }, [lessonState]);

  /* ── body class ─────────────── */
  useEffect(() => {
    document.body.classList.toggle("academy-active", academyOn);
    return () => document.body.classList.remove("academy-active");
  }, [academyOn]);

  /* ── auto-scroll chat ────────── */
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  /* ── cursor positioning ──────── */
  useEffect(() => {
    if (!cursorTarget) {
      setCursorPos(null);
      setHighlightRect(null);
      return;
    }
    const update = () => {
      const el = document.querySelector(`[data-target="${cursorTarget}"]`);
      const vp = document.getElementById("crm-viewport");
      if (!el || !vp) return;
      const er = el.getBoundingClientRect();
      const vr = vp.getBoundingClientRect();
      setCursorPos({
        x: er.left - vr.left + er.width / 2,
        y: er.top - vr.top + er.height / 2,
      });
      setHighlightRect({
        left: er.left - vr.left - 6,
        top: er.top - vr.top - 6,
        width: er.width + 12,
        height: er.height + 12,
      });
    };
    const t = setTimeout(update, 80);
    window.addEventListener("resize", update);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", update);
    };
  }, [cursorTarget, crmView, showPlanCreator, showLeadDrawer, spTab]);

  /* ── fetch backend counts ───── */
  useEffect(() => {
    if (isInsforgeConfigured) {
      fetchBackendSnapshot()
        .then((snap) =>
          setBackendCounts({
            lessons: snap.lessonCount,
            questions: snap.questionCount,
            progress: snap.progressCount,
          })
        )
        .catch(() => { });
    }
  }, []);

  /* ══════════════════════════════
     MESSAGE HELPERS
  ══════════════════════════════ */

  const addMessage = useCallback((type, text) => {
    setMessages((prev) => [...prev, { type, text, ts: Date.now() }]);
  }, []);

  /* ══════════════════════════════
     VOICE / TTS
  ══════════════════════════════ */

  function stopCurrentAudio() {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    setIsSpeaking(false);
  }

  async function speakNarration(text) {
    // Always stop any currently playing audio first — prevents overlapping voices
    stopCurrentAudio();

    addMessage("ai", text);

    if (!isInsforgeConfigured) {
      await wait(Math.max(2000, text.length * 35));
      return;
    }

    // Check if we should still be speaking (lesson may have been stopped)
    if (lessonStateRef.current === "INTERRUPTED" && !isAiAnsweringRef.current) {
      return;
    }

    try {
      const result = await synthesizeLessonSpeech(text);

      // Re-check state after async TTS call — user may have stopped during fetch
      if (lessonStateRef.current === "INTERRUPTED" && !isAiAnsweringRef.current) {
        return;
      }

      if (result?.audioBase64) {
        const audio = new Audio(
          `data:${result.mimeType || "audio/mpeg"};base64,${result.audioBase64}`
        );
        currentAudioRef.current = audio;
        setIsSpeaking(true);

        return new Promise((resolve) => {
          audio.onended = () => {
            setIsSpeaking(false);
            if (currentAudioRef.current === audio) {
              currentAudioRef.current = null;
            }
            resolve();
          };
          audio.onerror = () => {
            setIsSpeaking(false);
            if (currentAudioRef.current === audio) {
              currentAudioRef.current = null;
            }
            resolve();
          };
          audio.play().catch(() => {
            setIsSpeaking(false);
            if (currentAudioRef.current === audio) {
              currentAudioRef.current = null;
            }
            resolve();
          });
        });
      }
    } catch (err) {
      console.warn("TTS fallback:", err);
    }

    setIsSpeaking(false);
    await wait(Math.max(1500, text.length * 30));
  }

  /* ══════════════════════════════
     LESSON ENGINE
  ══════════════════════════════ */

  async function executeStep(step) {
    // Apply effects
    if (step.effect?.navigate) {
      setCrmView(step.effect.navigate);
      await wait(400);
    }
    if (step.effect?.showCreator) {
      setShowPlanCreator(true);
      await wait(350);
    }
    if (step.effect?.showDrawer) {
      setShowLeadDrawer(true);
      await wait(350);
    }
    if (step.effect?.setSpTab) {
      setSpTab(step.effect.setSpTab);
      await wait(350);
    }

    // Move cursor
    if (step.target) {
      setCursorTarget(step.target);
      await wait(900);

      if (step.action === "click") {
        setShowClickPulse(true);
        await wait(400);
        setShowClickPulse(false);
      }
    } else {
      setCursorTarget(null);
    }

    // Narrate
    await speakNarration(step.narration);
    await wait(800);
  }

  async function startLesson(lesson) {
    const runId = ++lessonRunId.current;

    // Reset CRM state
    setCrmView("dashboard");
    setShowLeadDrawer(false);
    setShowPlanCreator(false);
    setSpTab("Plans");
    setCursorTarget(null);

    setActiveLesson(lesson);
    lessonStateRef.current = "PLAYING";
    setLessonState("PLAYING");
    setCurrentStepIndex(0);
    setLpView("lessonActive");
    setMessages([]);

    addMessage("ai", `🎓 Starting lesson: ${lesson.title}`);

    for (let i = 0; i < lesson.steps.length; i++) {
      // Wait while interrupted
      while (lessonStateRef.current === "INTERRUPTED") {
        await wait(250);
        if (lessonRunId.current !== runId) return;
      }
      if (lessonRunId.current !== runId) return;

      setCurrentStepIndex(i);
      await executeStep(lesson.steps[i]);
    }

    if (lessonRunId.current === runId) {
      setCursorTarget(null);
      lessonStateRef.current = "COMPLETE";
      setLessonState("COMPLETE");
      addMessage("ai", "✅ Lesson complete! Great job learning this feature.");

      try {
        await recordLessonProgress({
          lessonId: lesson.id,
          currentStep: lesson.steps.length,
          completed: true,
        });
      } catch (e) {
        /* ignore */
      }
    }
  }

  function stopLesson() {
    lessonRunId.current++;
    stopCurrentAudio();
    setCursorTarget(null);
    lessonStateRef.current = "IDLE";
    setLessonState("IDLE");
    setActiveLesson(null);
    setWaitingForResume(false);
    setCrmView("dashboard");
    setShowLeadDrawer(false);
    setShowPlanCreator(false);
    setSpTab("Plans");
  }

  async function handleInterrupt(interruptData) {
    lessonStateRef.current = "INTERRUPTED";
    setLessonState("INTERRUPTED");
    stopCurrentAudio();
    setCursorTarget(null);

    try {
      await recordQuestionEvent({
        lessonId: activeLesson?.id || null,
        question: "User interrupt during lesson",
        answerSummary: interruptData.answer.substring(0, 200),
        sourceScreen: crmView,
      });
    } catch (e) {
      /* ignore */
    }

    await speakNarration(interruptData.answer);
    await wait(600);
    await speakNarration(interruptData.resumePrompt);
    setWaitingForResume(true);
  }

  function resumeLesson() {
    // Restore CRM state from before Q&A interruption
    if (preQACrmStateRef.current) {
      setCrmView(preQACrmStateRef.current.view);
      setShowLeadDrawer(preQACrmStateRef.current.drawer);
      setShowPlanCreator(preQACrmStateRef.current.creator);
      preQACrmStateRef.current = null;
    }
    setWaitingForResume(false);
    lessonStateRef.current = "PLAYING";
    setLessonState("PLAYING");
    addMessage("ai", "▶️ Resuming lesson...");
  }

  /* ══════════════════════════════
     GEMINI Q&A ACTION EXECUTOR
  ══════════════════════════════ */

  async function executeGeminiActions(result) {
    const runId = lessonRunId.current;
    setIsAiAnswering(true);
    isAiAnsweringRef.current = true;

    // Pause active lesson if running
    const wasPlaying = lessonStateRef.current === "PLAYING";
    if (wasPlaying) {
      // Save CRM state so we can restore it when the lesson resumes
      preQACrmStateRef.current = {
        view: crmView,
        drawer: showLeadDrawer,
        creator: showPlanCreator,
      };
      lessonStateRef.current = "INTERRUPTED";
      setLessonState("INTERRUPTED");
      stopCurrentAudio();
    }

    const actions = result.actions || [];

    for (const action of actions) {
      if (lessonRunId.current !== runId) break;

      switch (action.type) {
        case "navigate":
          setCursorTarget(null); // Clear cursor when switching views
          setCrmView(action.view);
          setShowLeadDrawer(false);
          setShowPlanCreator(false);
          await wait(500);
          break;

        case "highlight":
          setCursorTarget(action.target);
          await wait(900);
          if (action.narration) {
            // Cursor stays on the element while narration plays = perfect sync
            await speakNarration(action.narration);
            await wait(400);
          }
          break;

        case "click":
          setCursorTarget(action.target);
          await wait(700);
          setShowClickPulse(true);
          await wait(400);
          setShowClickPulse(false);
          // Apply effects
          if (action.effect?.navigate) {
            setCrmView(action.effect.navigate);
            await wait(400);
          }
          if (action.effect?.showDrawer) {
            setShowLeadDrawer(true);
            await wait(400);
          }
          if (action.effect?.showCreator) {
            setShowPlanCreator(true);
            await wait(400);
          }
          break;

        case "narrate":
          // DO NOT clear cursor here — keep pointing at the last element
          // while the AI explains. This creates the sync the user expects.
          await speakNarration(action.text);
          await wait(400);
          break;
      }
    }

    // Clean up
    setCursorTarget(null);
    setIsAiAnswering(false);
    isAiAnsweringRef.current = false;

    // Offer to resume lesson if one was paused
    if (wasPlaying && activeLesson) {
      await speakNarration("Would you like me to continue the lesson?");
      setWaitingForResume(true);
    }
  }

  /* ══════════════════════════════
     CHAT / MESSAGE PROCESSING
  ══════════════════════════════ */

  async function processUserMessage(text) {
    addMessage("user", text);
    const lower = text.toLowerCase().trim();

    // Resume check
    if (waitingForResume) {
      if (/\b(yes|yeah|yep|sure|continue|proceed|go ahead|ok|okay)\b/.test(lower)) {
        resumeLesson();
        return;
      }
    }

    // If Gemini is configured, use it for ALL questions
    if (isGeminiConfigured) {
      addMessage("ai", "🔍 Let me find that for you...");
      try {
        const result = await askGeminiTutor({
          question: text,
          currentView: crmView,
          lessonContext: activeLesson ? activeLesson.title : null,
        });
        await executeGeminiActions(result);
      } catch (err) {
        console.error("Gemini Q&A error:", err);
        addMessage(
          "ai",
          "Sorry, I had trouble processing that. Try asking about lead scores, Smart Plans, or any feature you see on the dashboard!"
        );
      }
      return;
    }

    // Fallback: keyword-based interrupts if Insforge/Gemini not available
    if (lessonStateRef.current === "PLAYING" && activeLesson) {
      for (const [trigger, data] of Object.entries(activeLesson.interrupts || {})) {
        if (lower.includes(trigger)) {
          stopCurrentAudio();
          handleInterrupt(data);
          return;
        }
      }
    }

    addMessage(
      "ai",
      "Select a lesson from the left panel to get started, or configure the Gemini backend for freeform Q&A!"
    );
  }

  function sendChat() {
    const text = chatInput.trim();
    if (!text) return;
    setChatInput("");
    // Stop any playing audio when user sends a new message
    stopCurrentAudio();
    processUserMessage(text);
  }

  function handleChatKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChat();
    }
  }

  /* ══════════════════════════════
     MIC
  ══════════════════════════════ */

  function toggleMic() {
    // If AI is speaking, stop it immediately when mic is pressed
    if (isSpeaking) {
      stopCurrentAudio();
    }

    if (!SpeechRecognition) {
      addMessage("ai", "⚠️ Speech recognition is not supported in this browser. Please type your question instead.");
      return;
    }

    if (micActive) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setMicActive(false);
      return;
    }

    const recog = new SpeechRecognition();
    recog.continuous = false;
    recog.interimResults = false;
    recog.lang = "en-US";

    recog.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      stopCurrentAudio(); // Stop audio before processing user's voice input
      processUserMessage(transcript);
    };
    recog.onend = () => setMicActive(false);
    recog.onerror = () => setMicActive(false);

    recognitionRef.current = recog;
    recog.start();
    setMicActive(true);
  }

  /* ══════════════════════════════
     NAVIGATION
  ══════════════════════════════ */

  function toggleAcademy() {
    setAcademyOn((v) => !v);
    if (academyOn) {
      stopLesson();
      setLpView("main");
    }
  }

  function handleBack() {
    if (lpView === "lessonActive") {
      stopLesson();
      if (activeLesson?.id?.startsWith("release")) {
        setLpView("releases");
      } else if (activeLesson?.id?.startsWith("help")) {
        setLpView("helpCenter");
      } else {
        setLpView("lessons");
      }
      return;
    }
    if (lpView === "helpArticles") {
      setLpView("helpCenter");
      return;
    }
    if (lpView !== "main") {
      setLpView("main");
      return;
    }
    setAcademyOn(false);
  }

  function selectLesson(lesson) {
    if (lesson.dummy) {
      addMessage("ai", `📋 "${lesson.title}" lesson is coming soon! Stay tuned.`);
      setMessages((prev) => [...prev, { type: "ai", text: `📋 "${lesson.title}" lesson is coming soon!`, ts: Date.now() }]);
      return;
    }
    startLesson(lesson);
  }

  /* ══════════════════════════════
     CRM VIEWS
  ══════════════════════════════ */

  function renderDashboard() {
    return (
      <div id="crm-content">
        <div className="dash-header">
          <div className="dash-greeting">
            👋 Good Afternoon, Shrey B!
            <div className="dash-dropdown">
              My Dashboard
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
          </div>
          <div className="dash-meta">
            <div className="dash-priority-select">
              Today&apos;s Priorities
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
            <div className="grid-toggle">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
            </div>
          </div>
        </div>

        <div className="dash-grid">
          {/* New Updates */}
          <div className="dash-card" data-target="updates-card">
            <div className="card-header">
              <div className="card-tabs">
                <div className="card-tab">New Updates</div>
                <div className="card-tab inactive">Announcements</div>
              </div>
            </div>
            <div className="update-item">
              <div className="update-img">
                <div style={{ background: "linear-gradient(135deg,#dbeafe,#bfdbfe)", width: "100%", height: "100%" }} />
              </div>
              <div>
                <div className="update-text-title">✨ New Service: Done-for-you Website</div>
                <div className="update-text-sub">We build website, you close deals!</div>
              </div>
            </div>
            <div className="update-item" data-target="update-link" style={{ cursor: "pointer" }}>
              <div className="update-img">
                <div style={{ background: "linear-gradient(135deg,#ede9fe,#ddd6fe)", width: "100%", height: "100%" }} />
              </div>
              <div>
                <div className="update-text-title">Check Lofty&apos;s latest feature updates!</div>
                <div className="update-text-sub">Lofty 4.40 now available</div>
              </div>
            </div>
          </div>

          {/* Today's New Leads */}
          <div className="dash-card" data-target="today-new-leads-card">
            <div className="card-header">
              <div className="card-title">Today&apos;s New Leads</div>
              <div className="card-actions"><span className="card-icon">?</span><span className="card-icon">⚙</span></div>
            </div>
            <div className="progress-bar-crm"><div className="progress-bar-fill" style={{ width: "65%" }} /></div>
            <div className="leads-count">Total: 7 (7 untouched)</div>
            <div className="leads-section-title">Leads Waiting To Be Contacted</div>
            <div className="lead-row" data-target="emily-row">
              <div>
                <div className="lead-name">Emily Wilson</div>
                <div className="lead-meta">Renter · Facebook</div>
              </div>
              <div className="lead-score" data-target="emily-score">59</div>
            </div>
            <div className="lead-row">
              <div>
                <div className="lead-name">Carlos Garcia</div>
                <div className="lead-meta">Other · Zillow</div>
              </div>
              <div className="lead-score" style={{ background: "#fce7f3", color: "#be185d" }}>44</div>
            </div>
            <div className="lead-row">
              <div>
                <div className="lead-name">Samuel Scott</div>
                <div className="lead-meta">Buyer · YouTube</div>
              </div>
              <div className="lead-score" style={{ background: "var(--green-light)", color: "var(--green)" }}>43</div>
            </div>
            <div className="view-all">View All <span>›</span></div>
          </div>

          {/* Today's Opportunities */}
          <div className="dash-card" data-target="opportunities-card">
            <div className="card-header">
              <div className="card-title">Today&apos;s Opportunities</div>
              <div className="card-actions"><span className="card-icon">?</span></div>
            </div>
            <div className="stat-row">
              <div className="stat-col"><div className="stat-label">High Interest</div><div className="stat-value">0</div></div>
              <div className="stat-col"><div className="stat-label">Likely Sellers</div><div className="stat-value">0</div></div>
              <div className="stat-col"><div className="stat-label">Back to Site</div><div className="stat-value">0</div></div>
            </div>
            <div className="no-data">Nothing on your to-do list yet — Enjoy your day!</div>
          </div>

          {/* Need Keep In Touch */}
          <div className="dash-card">
            <div className="card-header"><div className="card-title">Need Keep In Touch</div><div className="card-actions"><span className="card-icon">?</span></div></div>
            <div className="stat-pair">
              <div className="sp"><div className="sp-label">Birthday</div><div className="sp-val">0</div></div>
              <div className="sp"><div className="sp-label">Follow-Up</div><div className="sp-val">0</div></div>
            </div>
            <div className="no-data">Nothing on your to-do list yet — Enjoy your day!</div>
          </div>

          {/* Transactions */}
          <div className="dash-card">
            <div className="card-header"><div className="card-title">Transactions</div><div className="card-actions"><span className="card-icon">?</span><span className="card-icon">⚙</span></div></div>
            <div className="stat-pair">
              <div className="sp"><div className="sp-label">Near Deadline</div><div className="sp-val">0</div></div>
              <div className="sp"><div className="sp-label">Expired</div><div className="sp-val">0</div></div>
            </div>
            <div className="no-data">Nothing on your to-do list yet — Enjoy your day!</div>
          </div>

          {/* Today's Tasks */}
          <div className="dash-card">
            <div className="card-header"><div className="card-title">Today&apos;s Tasks</div><div className="card-actions"><span className="card-icon">?</span></div></div>
            <div className="tasks-grid">
              <div className="task-chip"><div className="task-chip-label">Call</div><div className="task-chip-val call">0</div></div>
              <div className="task-chip"><div className="task-chip-label">Text</div><div className="task-chip-val text">0</div></div>
              <div className="task-chip"><div className="task-chip-label">Email</div><div className="task-chip-val email">0</div></div>
              <div className="task-chip"><div className="task-chip-label">Other</div><div className="task-chip-val other">0</div></div>
            </div>
            <div className="no-data">Nothing on your to-do list yet — Enjoy your day!</div>
          </div>
        </div>
      </div>
    );
  }

  function renderSmartPlans() {
    return (
      <div id="crm-content" className="crm-view-smart-plans-v2">
        {/* ── SUB NAV ── */}
        <div className="subnav" data-target="smart-plans-header">
          <span className="subnav-title">Smart Plans</span>
          <button className="subnav-btn" data-target="sp-get-training">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
            Get Training
          </button>
          <button className="subnav-btn" data-target="sp-whats-new">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>
            What&apos;s New?
          </button>

          <div className="tab-group">
            <div className={`tab ${spTab === "Plans" ? "active" : ""}`} data-target="sp-tab-plans" onClick={() => setSpTab("Plans")}>Plans</div>
            <div className={`tab ${spTab === "Library" ? "active" : ""}`} data-target="sp-tab-library" onClick={() => setSpTab("Library")}>Library</div>
          </div>

          {spTab === "Plans" ? (
            <button className="create-btn" data-target="create-plan-btn" onClick={() => setShowPlanCreator(!showPlanCreator)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Create Smart Plan
              <div className="chevron"></div>
              <span className="arrow">▾</span>
            </button>
          ) : (
            <button className="create-btn" onClick={() => setShowPlanCreator(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Create From Scratch
            </button>
          )}
        </div>

        {/* Plan creator overlay */}
        {showPlanCreator && (
          <div className="plan-creator-card" data-target="plan-creator">
            <div className="plan-creator-title">Create New Smart Plan</div>
            <div className="plan-creator-field">
              <label>Plan Name</label>
              <input type="text" data-target="plan-name-input" placeholder="e.g. New Buyer Welcome Sequence" defaultValue="New Buyer Welcome Sequence" readOnly />
            </div>
            <div className="plan-creator-field">
              <label>Trigger</label>
              <select data-target="plan-trigger" defaultValue="new_lead">
                <option value="new_lead">New lead registers</option>
                <option value="tag_added">Tag added</option>
                <option value="manual">Manual assignment</option>
              </select>
            </div>
            <div className="plan-creator-field">
              <label>Email Sequence</label>
              <div className="plan-email-preview">
                <div className="plan-email-step">📧 Day 1 — Welcome email</div>
                <div className="plan-email-step">📧 Day 3 — Property recommendations</div>
                <div className="plan-email-step">📋 Day 5 — Follow-up call task</div>
              </div>
            </div>
            <div className="plan-creator-actions">
              <button className="plan-save-btn" data-target="plan-save-btn">Save Plan</button>
              <button className="plan-cancel-btn" onClick={() => setShowPlanCreator(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* ── PLANS VIEW ── */}
        {spTab === "Plans" && (
          <div className="layout">
            {/* ── LEFT SIDEBAR ── */}
            <aside className="sidebar" data-target="sp-sidebar">
              <div className="sidebar-search">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                <input type="text" placeholder="Search by name" />
              </div>

              <div className="sidebar-item active" data-target="sp-all-plans">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
                All Smart Plans
              </div>

              <div className="sidebar-section">
                My Folder
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15" /></svg>
              </div>
              <div className="sidebar-empty">No folders</div>

              <div className="sidebar-section">
                Company Folder
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15" /></svg>
              </div>
              <div className="sidebar-empty">No folders</div>

              <div className="sidebar-footer">
                <button className="add-folder-btn">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  Add Folder
                </button>
              </div>
            </aside>

            {/* Sidebar collapse handle */}
            <div className="collapse-handle" onClick={(e) => {
              const handle = e.currentTarget;
              const sidebar = handle.previousSibling;
              if (sidebar.style.transform === 'translateX(-100%)') {
                sidebar.style.transform = '';
                sidebar.style.width = 'var(--sidebar-w)';
                sidebar.style.padding = '12px 10px';
                handle.style.left = 'calc(var(--sidebar-w) - 12px)';
                handle.textContent = '‹';
              } else {
                sidebar.style.transform = 'translateX(-100%)';
                sidebar.style.width = '0';
                sidebar.style.padding = '0';
                handle.style.left = '-4px';
                handle.textContent = '›';
              }
            }}>‹</div>

            {/* ── MAIN CONTENT ── */}
            <main className="main">
              {/* ── TOOLBAR ── */}
              <div className="toolbar" data-target="sp-toolbar">
                <div className="toolbar-search">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                  <input type="text" placeholder="Search by plan name" />
                </div>
                <div className="filter-btn" data-target="sp-auto-apply-filter">
                  Auto Apply: All <span className="caret">▾</span>
                </div>
                <div className="filter-btn" data-target="sp-scope-filter">
                  Scope: My Plans <span className="caret">▾</span>
                </div>
                <div className="toolbar-right">
                  <div className="view-btn active" title="Grid view">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
                  </div>
                  <div className="view-btn" title="List view">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="18" /></svg>
                  </div>
                </div>
              </div>

              {/* ── TABLE ── */}
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th><div className="cb"></div></th>
                      <th data-target="sp-col-name">Plan Name <span className="sort-icon">⇅</span></th>
                      <th data-target="sp-col-scope">Scope</th>
                      <th data-target="sp-col-lead-type">Lead Type</th>
                      <th data-target="sp-col-duration">Duration</th>
                      <th data-target="sp-col-application">Application</th>
                      <th data-target="sp-col-auto-apply">Auto Apply</th>
                      <th data-target="sp-col-action">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SMART_PLANS_DATA.map((plan, i) => (
                      <tr key={plan.name} data-target={`plan-row-${i}`}>
                        <td><div className="cb"></div></td>
                        <td><span className="plan-name">{plan.name}</span></td>
                        <td>{plan.scope}</td>
                        <td style={{ fontSize: 12 }}>Include one of: {plan.leadType}</td>
                        <td data-target={`plan-duration-${i}`}>{plan.duration}</td>
                        <td style={{ color: "var(--gray-500)", fontSize: 12 }}>{plan.application}</td>
                        <td><div className={`toggle${plan.autoApply ? " on" : ""}`} onClick={(e) => e.currentTarget.classList.toggle('on')}></div></td>
                        <td>
                          <div className="action-icons">
                            <div className="action-icon" title="Preview">
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                            </div>
                            <div className="action-icon" title="Settings">
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── PAGINATION ── */}
              <div className="pagination" data-target="sp-pagination">
                <input className="page-input" type="text" defaultValue="1" readOnly />
                <div className="page-count">1</div>
                <div className="page-size">50 <span className="caret">▾</span></div>
              </div>
            </main>

            {/* ── RIGHT RAIL ── */}
            <div className="right-rail">
              <div className="rail-icon" title="Expand">✛</div>
              <div className="rail-icon" title="Call">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6.09 6.09l.98-.98a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
              </div>
              <div className="rail-icon" title="Inbox">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 9 12 15 21 9" /><path d="M3 9h18v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9z" /></svg>
              </div>
              <div className="rail-icon" title="Notifications">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
              </div>
              <div className="rail-icon" title="Help">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
              </div>
              <div className="rail-icon" title="Settings">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
              </div>
            </div>
          </div>
        )}

        {/* ── LIBRARY VIEW ── */}
        {spTab === "Library" && (
          <div className="page-body">
            {/* TOOLBAR */}
            <div className="toolbar">
              <div className="toolbar-search">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                <input type="text" placeholder="Search by plan name" />
              </div>
              <div className="filter-btn">Plan Type: All <span className="caret">▾</span></div>
              <div className="filter-btn">Lead Type: All <span className="caret">▾</span></div>
              <div className="filter-btn">Scenario: All <span className="caret">▾</span></div>
              <div className="toolbar-right">
                <div className="view-btn" title="List view">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
                </div>
                <div className="view-btn active" title="Grid view">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                </div>
              </div>
            </div>

            {/* CARDS GRID */}
            <div className="cards-grid">
              {/* Card 1 */}
              <div className="card">
                <div className="card-title">Buyer-No Response (AI)</div>
                <div className="card-lead">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  Include one of: Buyer
                </div>
                <div className="card-icons">
                  <div className="icon-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="2,4 12,13 22,4" /></svg></div>
                  <div className="icon-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" /><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></svg></div>
                </div>
                <div className="card-duration">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  75 days duration
                </div>
                <div className="card-footer">
                  <button className="use-btn">Use Template</button>
                  <div className="eye-btn"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="card">
                <div className="card-title">Realty.com Seller Engagement Campaign (...</div>
                <div className="card-lead">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  Equals To: Seller
                </div>
                <div className="card-icons">
                  <div className="icon-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6.09 6.09l.98-.98a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg></div>
                  <div className="icon-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="2,4 12,13 22,4" /></svg></div>
                  <div className="icon-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg></div>
                  <div className="icon-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" /><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></svg></div>
                </div>
                <div className="card-duration">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  379 days duration
                </div>
                <div className="card-footer">
                  <button className="use-btn">Use Template</button>
                  <div className="eye-btn"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="card">
                <div className="card-title">Realty.com Seller Engagement Campaign (...</div>
                <div className="card-lead">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  Equals To: Seller
                </div>
                <div className="card-icons">
                  <div className="icon-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6.09 6.09l.98-.98a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg></div>
                  <div className="icon-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="2,4 12,13 22,4" /></svg></div>
                  <div className="icon-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg></div>
                  <div className="icon-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg></div>
                </div>
                <div className="card-duration">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  379 days duration
                </div>
                <div className="card-footer">
                  <button className="use-btn">Use Template</button>
                  <div className="eye-btn"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></div>
                </div>
              </div>

              {/* Card 4 */}
              <div className="card">
                <div className="card-title">Realty.com Buyer Engagement Campaign (...</div>
                <div className="card-lead">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  Equals To: Buyer
                </div>
                <div className="card-icons">
                  <div className="icon-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6.09 6.09l.98-.98a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg></div>
                  <div className="icon-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg></div>
                  <div className="icon-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" /><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></svg></div>
                </div>
                <div className="card-duration">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  379 days duration
                </div>
                <div className="card-footer">
                  <button className="use-btn">Use Template</button>
                  <div className="eye-btn"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></div>
                </div>
              </div>

              {/* Card 5 */}
              <div className="card">
                <div className="card-title">Realty.com Buyer Engagement Campaign (...</div>
                <div className="card-lead">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  Equals To: Buyer
                </div>
                <div className="card-icons">
                  <div className="icon-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6.09 6.09l.98-.98a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg></div>
                  <div className="icon-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg></div>
                  <div className="icon-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg></div>
                </div>
                <div className="card-duration">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  379 days duration
                </div>
                <div className="card-footer">
                  <button className="use-btn">Use Template</button>
                  <div className="eye-btn"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></div>
                </div>
              </div>

              {/* Card 6 */}
              <div className="card">
                <div className="card-title">Buyer-Just Looking (AI)</div>
                <div className="card-lead">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  Include one of: Buyer
                </div>
                <div className="card-icons">
                  <div className="icon-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6.09 6.09l.98-.98a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg></div>
                  <div className="icon-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="2,4 12,13 22,4" /></svg></div>
                </div>
                <div className="card-duration">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  238 days duration
                </div>
                <div className="card-footer">
                  <button className="use-btn">Use Template</button>
                  <div className="eye-btn"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></div>
                </div>
              </div>

              {/* Card 7 */}
              <div className="card">
                <div className="card-title">Buyer Lead – Cold Workflow</div>
                <div className="card-lead">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  Include one of: Buyer, Renter, Other; Include all:…
                </div>
                <div className="card-icons">
                  <div className="icon-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6.09 6.09l.98-.98a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg></div>
                  <div className="icon-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg></div>
                  <div className="icon-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" /><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></svg></div>
                  <div className="icon-badge task"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg></div>
                </div>
                <div className="card-duration">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  361 days duration
                </div>
                <div className="card-footer">
                  <button className="use-btn">Use Template</button>
                  <div className="eye-btn"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></div>
                </div>
              </div>

              {/* Card 8 */}
              <div className="card">
                <div className="card-title">Lofty AI – Buyer Requested Showing</div>
                <div className="card-lead">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  Include one of: Buyer, Seller, Renter, Other; Incl…
                </div>
                <div className="card-icons">
                  <div className="icon-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6.09 6.09l.98-.98a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg></div>
                  <div className="icon-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg></div>
                  <div className="icon-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" /><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></svg></div>
                  <div className="icon-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2" /><path d="M12 11V7" /><circle cx="12" cy="5" r="2" /><path d="M8 15h.01M16 15h.01" /></svg></div>
                </div>
                <div className="card-duration">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  0 day duration
                </div>
                <div className="card-footer">
                  <button className="use-btn">Use Template</button>
                  <div className="eye-btn"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  function renderPeople() {
    return (
      <div id="crm-content" className="crm-view-people">
        <div className="view-page-header">
          <div>
            <div className="view-page-title">People</div>
            <div className="view-page-subtitle">All contacts and leads</div>
          </div>
          <div className="people-search-bar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            Search contacts...
          </div>
        </div>

        <div className="people-tabs">
          <div className="people-tab active">All</div>
          <div className="people-tab">New</div>
          <div className="people-tab">Active</div>
          <div className="people-tab">Hot</div>
        </div>

        <div className="people-list">
          {PEOPLE_DATA.map((lead) => (
            <div
              className="people-row"
              key={lead.name}
              data-target={`lead-${lead.name.split(" ")[0].toLowerCase()}`}
            >
              <div className="people-avatar">{lead.name[0]}</div>
              <div className="people-info">
                <div className="people-name">{lead.name}</div>
                <div className="people-meta">{lead.type} · {lead.source}</div>
              </div>
              <div
                className="lead-score"
                style={{ background: lead.scoreColor, color: lead.scoreText }}
              >
                {lead.score}
              </div>
            </div>
          ))}
        </div>

        {/* Lead detail drawer */}
        {showLeadDrawer && (
          <div className="lead-drawer open">
            <div className="lead-drawer-header">
              <div className="lead-drawer-close" onClick={() => setShowLeadDrawer(false)}>✕</div>
              <div className="lead-drawer-avatar">E</div>
              <div className="lead-drawer-name">Emily Wilson</div>
              <div className="lead-drawer-meta">emily.wilson@email.com · (555) 234-5678</div>
              <div className="lead-drawer-tags">
                <span className="ldt">Renter</span>
                <span className="ldt">Facebook</span>
              </div>
            </div>

            <div className="lead-drawer-score" data-target="score-breakdown">
              <div className="lds-header">
                <span>Lead Score</span>
                <span className="lds-value">59</span>
              </div>
              <div className="lds-bar"><div className="lds-bar-fill" style={{ width: "59%" }} /></div>
              <div className="lds-factors">
                <div className="lds-factor"><span>📊</span><span>Website Activity</span><span className="lds-f-val">12 visits this week</span></div>
                <div className="lds-factor"><span>🏠</span><span>Listing Views</span><span className="lds-f-val">5 properties saved</span></div>
                <div className="lds-factor"><span>📧</span><span>Email Engagement</span><span className="lds-f-val">3 emails opened</span></div>
                <div className="lds-factor"><span>⏱</span><span>Response Time</span><span className="lds-f-val">&lt; 2 hours avg</span></div>
              </div>
            </div>

            <div className="lead-drawer-analysis" data-target="lead-analysis">
              <div className="lda-title">Lead Analysis</div>
              <div className="lda-text">
                High engagement with <strong>3-bedroom properties</strong> in the downtown area.
                Viewed 5 listings in the past week with an average time of 4 min per listing.
              </div>
              <div className="lda-trend">
                <span className="lda-trend-up">↑</span> Trend: <strong>Rising</strong> — engagement increased 35% this week
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderReleaseDetail() {
    return (
      <div id="crm-content" className="crm-view-release">
        <div className="view-page-header">
          <div>
            <div className="view-page-title">Lofty 4.40 — Feature Updates</div>
            <div className="view-page-subtitle">Released April 2025</div>
          </div>
          <button className="view-page-action-btn outline" onClick={() => setCrmView("dashboard")}>← Back to Dashboard</button>
        </div>

        <div className="release-features-grid">
          <div className="release-feature-card" data-target="feature-sales-agent">
            <div className="rf-icon">🤖</div>
            <div className="rf-title">Sales Agent: Digital Employee</div>
            <div className="rf-desc">AI Sales Agent is now positioned as a virtual team member — handling initial conversations, qualifying prospects, and following up automatically 24/7.</div>
            <div className="rf-tag new">NEW</div>
          </div>

          <div className="release-feature-card" data-target="feature-smart-plan-perf">
            <div className="rf-icon">📊</div>
            <div className="rf-title">Smart Plan Performance</div>
            <div className="rf-desc">Enhanced reporting with detailed conversion metrics, engagement rates, and ROI data for each automated nurture sequence.</div>
            <div className="rf-tag updated">UPDATED</div>
          </div>

          <div className="release-feature-card" data-target="feature-transaction">
            <div className="rf-icon">🏠</div>
            <div className="rf-title">Transaction Lead Portal</div>
            <div className="rf-desc">Dedicated portal for transaction leads to track deal progress, upload documents, and stay updated on milestones.</div>
            <div className="rf-tag new">NEW</div>
          </div>

          <div className="release-feature-card">
            <div className="rf-icon">💬</div>
            <div className="rf-title">Smarter AI Conversations</div>
            <div className="rf-desc">Improved natural language understanding for more effective and human-like lead engagement conversations.</div>
            <div className="rf-tag updated">UPDATED</div>
          </div>

          <div className="release-feature-card">
            <div className="rf-icon">👤</div>
            <div className="rf-title">Transaction Role Defaults</div>
            <div className="rf-desc">Pre-configure default contacts for specific roles in transactions, reducing manual setup time.</div>
            <div className="rf-tag new">NEW</div>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════
     RENDER
  ══════════════════════════════ */

  return (
    <div id="app">

      {/* ── ACADEMY TOP BAR ── */}
      <div id="academy-bar" className={academyOn ? "open" : ""}>
        <button id="back-btn" onClick={handleBack}>← Back</button>
        <div className="ab-brand-center">
          <div className="ab-cap">🎓</div>
          <span className="ab-brand-name">Lofty Academy</span>
          <span className="ab-brand-sub">AI-Guided Mastery</span>
        </div>
        <button id="exit-btn" onClick={toggleAcademy}>✕ Exit Academy</button>
      </div>

      <div id="body-row">

        {/* ══ LEFT PANEL ══ */}
        <div className={`side-panel${academyOn ? " open" : ""}`} id="left-panel">
          <div className="panel-inner">

            {/* ── MAIN NAV ── */}
            <div className={`lp-view${lpView === "main" ? " active" : ""}`}>
              <div className="lp-header">
                <div className="lp-title">Lofty Academy</div>
                <div className="lp-subtitle">AI-Guided Mastery</div>
              </div>

              <div className="lp-scroll">
                <div className="lp-section-label">
                  <span>Navigation</span>
                </div>

                <div className={`lp-nav-item${lpView === "main" ? " active" : ""}`} onClick={() => setLpView("lessons")}>
                  <div className="lp-nav-icon">📚</div>
                  Lessons
                  <span className="lp-nav-badge">2</span>
                </div>

                <div className="lp-nav-item" onClick={() => setLpView("releases")}>
                  <div className="lp-nav-icon">🚀</div>
                  Release Notes
                  <span className="lp-nav-badge" style={{ background: "var(--green)" }}>1</span>
                </div>

                <div className="lp-nav-item" onClick={() => setLpView("helpCenter")}>
                  <div className="lp-nav-icon">📖</div>
                  Help Center
                  <span className="lp-nav-badge" style={{ background: "var(--amber)" }}>6</span>
                </div>

                <div className="lp-nav-item">
                  <div className="lp-nav-icon">🏆</div>
                  Achievements
                </div>

                {/* Progress ring */}
                <div className="lp-ring-section">
                  <div className="ring-wrap">
                    <svg width="88" height="88" viewBox="0 0 88 88">
                      <circle className="ring-bg" cx="44" cy="44" r="35" />
                      <circle className="ring-fill" cx="44" cy="44" r="35" />
                    </svg>
                    <div className="ring-center">
                      <div className="ring-pct">75%</div>
                      <div className="ring-word">Overall</div>
                    </div>
                  </div>
                  <div className="ring-caption">
                    <strong>75% complete</strong><br />
                    <span style={{ fontSize: "10px", color: "var(--gray-400)" }}>2 lessons left to master!</span>
                  </div>
                </div>

                {/* Help Center Tutorial card (replaces New Features) */}
                <div className="lp-feature-card">
                  <div className="lp-feature-title">Help Center Tutorials</div>
                  <div className="lp-feature-desc">Browse Lofty's knowledge base and learn any feature with AI-guided walkthroughs.</div>
                  <button className="lp-feature-btn" onClick={() => setLpView("helpCenter")}>Browse Tutorials</button>
                </div>

                <div className="lp-spacer" />
              </div>

              <div className="lp-cert-btn-wrap">
                <button className="lp-cert-btn">🏅 View Certificate</button>
              </div>
            </div>

            {/* ── LESSONS VIEW ── */}
            <div className={`lp-view${lpView === "lessons" ? " active" : ""}`}>
              <div className="lp-header">
                <div className="lp-title">Lofty Academy</div>
                <div className="lp-subtitle">AI-Guided Mastery</div>
              </div>
              <div className="lp-view-header">
                <div className="lp-view-back" onClick={() => setLpView("main")}>←</div>
                <div className="lp-view-title">Lessons</div>
                <div className="lp-view-subtitle">4 lessons</div>
              </div>
              <div className="lp-scroll">
                {/* Functional lessons */}
                <div className="lesson-card-item" onClick={() => selectLesson(SMART_PLAN_LESSON)}>
                  <div className="lci-icon">{SMART_PLAN_LESSON.icon}</div>
                  <div className="lci-info">
                    <div className="lci-title">{SMART_PLAN_LESSON.title}</div>
                    <div className="lci-sub">{SMART_PLAN_LESSON.subtitle}</div>
                  </div>
                  <div className="lci-badge live">LIVE</div>
                  <span className="lci-chevron">›</span>
                </div>

                <div className="lesson-card-item" onClick={() => selectLesson(LEAD_SCORE_LESSON)}>
                  <div className="lci-icon">{LEAD_SCORE_LESSON.icon}</div>
                  <div className="lci-info">
                    <div className="lci-title">{LEAD_SCORE_LESSON.title}</div>
                    <div className="lci-sub">{LEAD_SCORE_LESSON.subtitle}</div>
                  </div>
                  <div className="lci-badge live">LIVE</div>
                  <span className="lci-chevron">›</span>
                </div>

                {DUMMY_LESSONS.map((d) => (
                  <div className="lesson-card-item dummy" key={d.id} onClick={() => selectLesson(d)}>
                    <div className="lci-icon">{d.icon}</div>
                    <div className="lci-info">
                      <div className="lci-title">{d.title}</div>
                      <div className="lci-sub">{d.subtitle}</div>
                    </div>
                    <div className="lci-badge soon">SOON</div>
                    <span className="lci-chevron">›</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RELEASES VIEW ── */}
            <div className={`lp-view${lpView === "releases" ? " active" : ""}`}>
              <div className="lp-header">
                <div className="lp-title">Lofty Academy</div>
                <div className="lp-subtitle">AI-Guided Mastery</div>
              </div>
              <div className="lp-view-header">
                <div className="lp-view-back" onClick={() => setLpView("main")}>←</div>
                <div className="lp-view-title">Release Notes</div>
                <div className="lp-view-subtitle">Latest updates</div>
              </div>
              <div className="lp-scroll">
                <div className="lesson-card-item" onClick={() => selectLesson(RELEASE_440_LESSON)}>
                  <div className="lci-version-badge">v4.40</div>
                  <div className="lci-info">
                    <div className="lci-title">{RELEASE_440_LESSON.title}</div>
                    <div className="lci-sub">{RELEASE_440_LESSON.subtitle}</div>
                  </div>
                  <div className="lci-badge live">LIVE</div>
                  <span className="lci-chevron">›</span>
                </div>

                {DUMMY_RELEASES.map((d) => (
                  <div className="lesson-card-item dummy" key={d.version}>
                    <div className="lci-version-badge dim">{d.version}</div>
                    <div className="lci-info">
                      <div className="lci-title">{d.title}</div>
                      <div className="lci-sub">{d.subtitle}</div>
                    </div>
                    <div className="lci-badge soon">SOON</div>
                    <span className="lci-chevron">›</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── HELP CENTER VIEW ── */}
            <div className={`lp-view${lpView === "helpCenter" ? " active" : ""}`}>
              <div className="lp-header">
                <div className="lp-title">Lofty Academy</div>
                <div className="lp-subtitle">AI-Guided Mastery</div>
              </div>
              <div className="lp-view-header">
                <div className="lp-view-back" onClick={() => setLpView("main")}>←</div>
                <div className="lp-view-title">Help Center</div>
                <div className="lp-view-subtitle">Browse tutorials</div>
              </div>
              <div className="lp-scroll">
                {HELP_CENTER_MODULES.map((mod, idx) => (
                  <div className="hc-module" key={mod.title}>
                    <div
                      className={`hc-module-row${expandedHC === idx ? " expanded" : ""}`}
                      onClick={() => setExpandedHC(expandedHC === idx ? null : idx)}
                    >
                      <div className="hc-module-icon">{mod.icon}</div>
                      <div className="hc-module-info">
                        <div className="hc-module-title">{mod.title}</div>
                        <div className="hc-module-desc">{mod.desc}</div>
                      </div>
                      <span className="hc-chevron">›</span>
                    </div>
                    <div className={`hc-articles${expandedHC === idx ? " open" : ""}`}>
                      {mod.articles.map((article) => (
                        <div
                          className="hc-article-row"
                          key={article}
                          onClick={() => {
                            if (article === "Dashboard Overview") {
                              selectLesson(HELP_CENTER_LESSON);
                            } else {
                              addMessage("ai", `📋 "${article}" tutorial simulation coming soon!`);
                            }
                          }}
                        >
                          <div className="hc-article-dot">
                            {article === "Dashboard Overview" ? "▶" : "○"}
                          </div>
                          <span>{article}</span>
                          {article === "Dashboard Overview" && <span className="lci-badge live" style={{ marginLeft: "auto", fontSize: "8px" }}>LIVE</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── ACTIVE LESSON VIEW ── */}
            <div className={`lp-view${lpView === "lessonActive" ? " active" : ""}`}>
              <div className="lp-header">
                <div className="lp-title">Lofty Academy</div>
                <div className="lp-subtitle">AI-Guided Mastery</div>
              </div>
              {activeLesson && (
                <>
                  <div className="lp-view-header">
                    <div className="lp-view-back" onClick={handleBack}>←</div>
                    <div className="lp-view-title">{activeLesson.icon} {activeLesson.title}</div>
                  </div>

                  <div className="lesson-status-bar">
                    <div className={`lsb-state ${lessonState.toLowerCase()}`}>
                      {lessonState === "PLAYING" && "▶ Playing"}
                      {lessonState === "INTERRUPTED" && "⏸ Paused — Answering"}
                      {lessonState === "COMPLETE" && "✅ Complete"}
                      {lessonState === "IDLE" && "⏹ Stopped"}
                    </div>
                    <div className="lsb-step">
                      Step {currentStepIndex + 1} of {activeLesson.steps.length}
                    </div>
                  </div>

                  <div className="lp-scroll">
                    <div className="lesson-steps-list">
                      {activeLesson.steps.map((step, i) => (
                        <div
                          className={`lesson-step-item${i < currentStepIndex ? " done" : ""}${i === currentStepIndex ? " current" : ""}`}
                          key={i}
                        >
                          <div className="lsi-num">
                            {i < currentStepIndex ? "✓" : i === currentStepIndex ? "●" : (i + 1)}
                          </div>
                          <div className="lsi-text">
                            {step.narration.length > 70 ? step.narration.substring(0, 70) + "..." : step.narration}
                          </div>
                        </div>
                      ))}
                    </div>

                    {isSpeaking && (
                      <div className="speaking-indicator">
                        <div className="speaking-bars">
                          <div className="sbar" /><div className="sbar" /><div className="sbar" /><div className="sbar" /><div className="sbar" />
                        </div>
                        <span>AI is speaking...</span>
                      </div>
                    )}
                  </div>

                  <div className="lp-cert-btn-wrap">
                    <button className="lp-cert-btn stop" onClick={() => { stopLesson(); setLpView("main"); }}>
                      ⏹ Stop Lesson
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>

        {/* ══ CRM VIEWPORT ══ */}
        <div id="crm-viewport">

          {/* CRM NAVBAR */}
          <nav id="crm-nav">
            <a className="nav-logo" href="#">
              <div className="nav-logo-icon">
                <svg viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" fill="#fff" /><polyline points="9 22 9 12 15 12 15 22" fill="none" stroke="#3b5cde" strokeWidth="2" /></svg>
              </div>
              <span className="nav-logo-text">Lofty</span>
            </a>

            <div className="nav-links" id="nav-links" data-target="nav-links">
              <a className="nav-link" href="#" data-target="nav-crm" onClick={(e) => { e.preventDefault(); setCrmView("dashboard"); }}>CRM</a>
              <a className="nav-link" href="#" data-target="nav-sales">Sales</a>
              <a className="nav-link" href="#" data-target="nav-marketing">Marketing</a>
              <a className="nav-link" href="#" data-target="nav-content">Content</a>
              <a className="nav-link" href="#" data-target="nav-automation" onClick={(e) => { e.preventDefault(); setCrmView("smartPlans"); }}>Automation</a>
              <a className="nav-link" href="#" data-target="nav-reporting">Reporting</a>
              <a className="nav-link" href="#" data-target="nav-marketplace">Marketplace</a>
              <a className="nav-link ai-link" href="#" data-target="nav-ai-copilots">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" /></svg>
                AI Copilots
              </a>
            </div>

            <div className="nav-right">
              <div className="nav-search" id="nav-search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <span className="search-txt" style={{ color: "var(--gray-400)" }}>Search...</span>
              </div>
              <button id="academy-toggle" className={academyOn ? "active" : ""} onClick={toggleAcademy}>
                <div className={`toggle-track${academyOn ? " on" : ""}`} id="toggle-track">
                  <div className="toggle-thumb" />
                </div>
                <span id="toggle-label">{academyOn ? "Academy On" : "Academy"}</span>
              </button>
              <div className="nav-avatar">BR</div>
            </div>
          </nav>

          {/* CRM BODY */}
          <div id="crm-body">
            {crmView === "dashboard" && renderDashboard()}
            {crmView === "smartPlans" && renderSmartPlans()}
            {crmView === "people" && renderPeople()}
            {crmView === "releaseDetail" && renderReleaseDetail()}

            {/* CRM ICON STRIP */}
            <div id="crm-icon-strip">
              <div className="crm-strip-btn" title="AI Features"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74z" /></svg></div>
              <div className="crm-strip-btn" title="Calls"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.82a2 2 0 012-2.18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L9.91 14.91a16 16 0 006.29 6.29l1.42-1.42a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg></div>
              <div className="crm-strip-btn" title="Inbox"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" /></svg></div>
              <div className="crm-strip-divider" />
              <div className="crm-strip-btn" title="Notifications"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg></div>
              <div className="crm-strip-btn" title="Help"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg></div>
              <div className="crm-strip-btn" title="Settings"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg></div>
            </div>
          </div>

          {/* ── AI CURSOR OVERLAY ── */}
          {cursorPos && (
            <>
              <div
                className="ai-cursor"
                style={{
                  left: cursorPos.x - 3,
                  top: cursorPos.y - 1,
                }}
              >
                <svg viewBox="0 0 28 36" fill="none" width="22" height="28">
                  <path
                    d="M4 1L22 15.5H13.5L17.5 28L13.5 30L9.5 17.5L4 22.5V1Z"
                    fill="#3b5cde"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="ai-cursor-badge">AI</div>
              </div>

              {showClickPulse && (
                <div
                  className="click-pulse"
                  style={{ left: cursorPos.x, top: cursorPos.y }}
                />
              )}
            </>
          )}

          {highlightRect && (
            <div
              className="highlight-ring"
              style={{
                left: highlightRect.left,
                top: highlightRect.top,
                width: highlightRect.width,
                height: highlightRect.height,
              }}
            />
          )}
        </div>

        {/* ══ RIGHT PANEL — AI TUTOR CHAT ══ */}
        <div className={`side-panel${academyOn ? " open" : ""}`} id="right-panel">
          <div className="panel-inner" style={{ padding: 0 }}>
            <div className="rp-inner">

              {/* Transcript */}
              <div className="rp-chat-area" ref={chatAreaRef}>
                <div className="rp-heading">
                  AI Tutor Chat
                  {isSpeaking && (
                    <span className="rp-speaking-pill" onClick={stopCurrentAudio} style={{ cursor: "pointer" }} title="Click to stop">
                      <span className="sp-dot" /><span className="sp-dot" /><span className="sp-dot" />
                      Speaking
                      <span style={{ marginLeft: 4, fontSize: 8, opacity: 0.8 }}>■</span>
                    </span>
                  )}
                </div>

                {messages.length === 0 && (
                  <div className="rp-empty-state">
                    <div className="rp-empty-icon">🎓</div>
                    <div className="rp-empty-title">Welcome to AI Tutor</div>
                    <div className="rp-empty-text">
                      Select a lesson from the left panel to start an interactive walkthrough. You can interrupt anytime to ask questions!
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div key={i} className={`chat-bubble${msg.type === "ai" ? " ai" : ""}`}>
                    {msg.type === "ai" && <div className="ai-tag">🤖 AI Tutor</div>}
                    {msg.type === "user" && <div className="user-tag">🗣 You</div>}
                    {msg.text}
                  </div>
                ))}
              </div>

              {/* Chat input */}
              <div className="rp-chat-input-area">
                <div className="chat-input-row">
                  <textarea
                    ref={chatInputRef}
                    className="chat-input"
                    placeholder="Ask anything..."
                    rows={1}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={handleChatKey}
                  />
                  <button className="chat-send" onClick={sendChat}>↑</button>
                </div>
              </div>

              {/* Mic button */}
              <div className="rp-mic-area">
                <button
                  className={`mic-btn${micActive ? " active" : ""}`}
                  onClick={toggleMic}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                    <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
                  </svg>
                  {micActive ? "Listening..." : "Start Mic"}
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
