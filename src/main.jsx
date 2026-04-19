import React, { useEffect, useRef, useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import {
  synthesizeLessonSpeech,
  recordQuestionEvent,
  recordLessonProgress,
  askTutorQuestion,
  fetchDemoProfiles,
  isInsforgeConfigured,
  fetchBackendSnapshot,
} from "./insforgeBackend";

/* ═══════════════════════════════════════
   LESSON DATA
   ═══════════════════════════════════════ */

const SMART_PLAN_LESSON = {
  id: "smart-plan",
  title: "Creating a Smart Plan",
  subtitle: "Automated lead nurturing",
  icon: "🎯",
  steps: [
    {
      narration:
        "Welcome! I'll show you how to create a Smart Plan in Lofty. Smart Plans are one of the most powerful features for automating your lead follow-up.",
      target: null,
    },
    {
      narration:
        "First, let's navigate to the Automation section where Smart Plans live.",
      target: "nav-automation",
      action: "click",
      effect: { navigate: "smartPlans" },
    },
    {
      narration:
        "Here's the Smart Plans dashboard. You can see existing plans and their performance metrics. Each plan automates a sequence of emails and tasks for continuous lead nurturing.",
      target: "smart-plans-header",
      action: "highlight",
    },
    {
      narration:
        "The New Buyer Welcome plan has enrolled 45 leads and is automatically sending follow-up sequences. You can monitor performance from here.",
      target: "plan-row-0",
      action: "highlight",
    },
    {
      narration: "Now let's create a new plan. Click the Create New Plan button.",
      target: "create-plan-btn",
      action: "click",
      effect: { showCreator: true },
    },
    {
      narration:
        "Start by naming your plan. A descriptive name helps you identify it later — for example, 'New Buyer Welcome Sequence'.",
      target: "plan-name-input",
      action: "highlight",
    },
    {
      narration:
        "Next, select your trigger. This determines when leads automatically enter the plan — like when a new lead registers or gets a specific tag.",
      target: "plan-trigger",
      action: "highlight",
    },
    {
      narration:
        "Finally, save your plan. Once activated, it will automatically nurture every lead matching your trigger. That's the power of Smart Plans!",
      target: "plan-save-btn",
      action: "highlight",
    },
  ],
  interrupts: {
    "what is smart plan": {
      answer:
        "Great question! A Lofty Smart Plan is a robust lead-nurturing feature that combines email drip campaigns with tasks to help you communicate with your leads continuously. Think of it as your automated follow-up assistant — it sends scheduled emails and creates tasks for you, so no lead falls through the cracks. You can customize the timing, content, and triggers to match your specific business workflow.",
      resumePrompt:
        "Now that you understand what Smart Plans are, would you like me to continue showing you how to create one?",
    },
    "smart plan": {
      answer:
        "A Smart Plan is Lofty's automated lead nurturing system. It combines email drip campaigns with scheduled tasks to keep you in touch with leads automatically. You set the trigger conditions and the plan handles the rest!",
      resumePrompt: "Shall I continue with the tutorial?",
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
};

/* ═══════════════════════════════════════
   MOCK CRM DATA
   ═══════════════════════════════════════ */

const SMART_PLANS_DATA = [
  { name: "New Buyer Welcome", status: "Active", enrolled: 45, emails: 8, tasks: 3, color: "var(--green)" },
  { name: "Buyer Follow-Up", status: "Active", enrolled: 28, emails: 5, tasks: 2, color: "var(--green)" },
  { name: "Listing Alert Nurture", status: "Paused", enrolled: 12, emails: 4, tasks: 1, color: "var(--amber)" },
  { name: "Open House Follow-Up", status: "Draft", enrolled: 0, emails: 3, tasks: 2, color: "var(--gray-400)" },
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
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState("shrey@lofty.demo");
  const [loginLoading, setLoginLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const [academyOn, setAcademyOn] = useState(false);
  const [lpView, setLpView] = useState("main"); // main | lessons | releases | helpCenter | helpArticles | lessonActive
  const [expandedHC, setExpandedHC] = useState(null);

  // CRM
  const [crmView, setCrmView] = useState("dashboard"); // dashboard | smartPlans | people | releaseDetail
  const [showLeadDrawer, setShowLeadDrawer] = useState(false);
  const [showPlanCreator, setShowPlanCreator] = useState(false);

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


  /* ── refs ────────────────────── */
  const lessonStateRef = useRef("IDLE");
  const activeLessonRef = useRef(null);
  const waitingForResumeRef = useRef(false);
  const micActiveRef = useRef(false);
  const lessonRunId = useRef(0);
  const currentAudioRef = useRef(null);
  const chatAreaRef = useRef(null);
  const chatInputRef = useRef(null);
  const recognitionRef = useRef(null);

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
  }, [cursorTarget, crmView, showPlanCreator, showLeadDrawer]);

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
        .catch(() => {});
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

  async function speakNarration(text) {
    addMessage("ai", text);

    if (!isInsforgeConfigured) {
      await wait(Math.max(2000, text.length * 35));
      return;
    }

    try {
      const result = await synthesizeLessonSpeech(text);
      if (
        result?.audioBase64 &&
        lessonStateRef.current !== "IDLE"
      ) {
        const audio = new Audio(
          `data:${result.mimeType || "audio/mpeg"};base64,${result.audioBase64}`
        );
        currentAudioRef.current = audio;
        setIsSpeaking(true);

        return new Promise((resolve) => {
          audio.onended = () => {
            setIsSpeaking(false);
            currentAudioRef.current = null;
            resolve();
          };
          audio.onerror = () => {
            setIsSpeaking(false);
            currentAudioRef.current = null;
            resolve();
          };
          audio.play().catch(() => {
            setIsSpeaking(false);
            currentAudioRef.current = null;
            resolve();
          });
        });
      }
    } catch (err) {
      console.warn("TTS fallback:", err);
    }

    setIsSpeaking(false);
    await wait(Math.max(2000, text.length * 35));
  }

  function stopCurrentAudio() {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setIsSpeaking(false);
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
    setCursorTarget(null);

    activeLessonRef.current = lesson;
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
    activeLessonRef.current = null;
    setActiveLesson(null);
    waitingForResumeRef.current = false;
    setWaitingForResume(false);
    setCrmView("dashboard");
    setShowLeadDrawer(false);
    setShowPlanCreator(false);
  }

  async function handleInterrupt(interruptData) {
    lessonStateRef.current = "INTERRUPTED";
    setLessonState("INTERRUPTED");
    stopCurrentAudio();
    setCursorTarget(null);

    try {
      await recordQuestionEvent({
        lessonId: activeLessonRef.current?.id || null,
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
    waitingForResumeRef.current = true;
    setWaitingForResume(true);
  }

  function resumeLesson() {
    waitingForResumeRef.current = false;
    setWaitingForResume(false);
    lessonStateRef.current = "PLAYING";
    setLessonState("PLAYING");
    addMessage("ai", "▶️ Resuming lesson...");
  }

  /* ══════════════════════════════
     CHAT / MESSAGE PROCESSING
  ══════════════════════════════ */

  function processUserMessage(text) {
    addMessage("user", text);
    const lower = text.toLowerCase().trim();

    // Resume check — use ref to avoid stale closure
    if (waitingForResumeRef.current) {
      if (/\b(yes|yeah|yep|sure|continue|proceed|go ahead|ok|okay)\b/.test(lower)) {
        resumeLesson();
        return;
      }
    }

    // Interrupt check — use ref to avoid stale closure
    const lesson = activeLessonRef.current;
    if (lessonStateRef.current === "PLAYING" && lesson) {
      for (const [trigger, data] of Object.entries(lesson.interrupts || {})) {
        if (lower.includes(trigger)) {
          stopCurrentAudio();
          handleInterrupt(data);
          return;
        }
      }
    }

    // AI-powered response for any question (no keyword match)
    handleAIQuestion(text, lower);
  }

  async function handleAIQuestion(originalText, lower) {
    const lesson = activeLessonRef.current;
    const isInLesson = lessonStateRef.current === "PLAYING" || lessonStateRef.current === "INTERRUPTED";

    // Pause lesson if playing so AI can answer
    if (lessonStateRef.current === "PLAYING" && lesson) {
      stopCurrentAudio();
      lessonStateRef.current = "INTERRUPTED";
      setLessonState("INTERRUPTED");
      setCursorTarget(null);
    }

    addMessage("ai", "🤔 Thinking...");

    try {
      const result = await askTutorQuestion({
        question: originalText,
        lessonContext: lesson?.id || "general",
        currentStep: currentStepIndex,
      });

      // Remove "Thinking..." and add actual answer
      setMessages(prev => {
        const filtered = prev.filter(m => m.text !== "🤔 Thinking...");
        return [...filtered, { type: "ai", text: result.answer, ts: Date.now() }];
      });

      // Speak the answer via ElevenLabs
      if (isInsforgeConfigured) {
        try {
          const voiceResult = await synthesizeLessonSpeech(result.answer);
          if (voiceResult?.audioBase64 && lessonStateRef.current !== "IDLE") {
            const audio = new Audio(
              `data:${voiceResult.mimeType || "audio/mpeg"};base64,${voiceResult.audioBase64}`
            );
            currentAudioRef.current = audio;
            setIsSpeaking(true);
            await new Promise(resolve => {
              audio.onended = () => { setIsSpeaking(false); currentAudioRef.current = null; resolve(); };
              audio.onerror = () => { setIsSpeaking(false); currentAudioRef.current = null; resolve(); };
              audio.play().catch(() => { setIsSpeaking(false); currentAudioRef.current = null; resolve(); });
            });
          }
        } catch(e) { /* voice fallback — answer already shown as text */ }
      }

      // Log Q&A event
      try {
        await recordQuestionEvent({
          lessonId: lesson?.id || null,
          question: originalText,
          answerSummary: result.answer.substring(0, 200),
          sourceScreen: crmView,
        });
      } catch(e) { /* ignore */ }

      // If we were in a lesson, ask to resume
      if (isInLesson && lesson) {
        const resumeMsg = "Would you like me to continue with the lesson?";
        await speakNarration(resumeMsg);
        waitingForResumeRef.current = true;
        setWaitingForResume(true);
      }
    } catch(err) {
      // Remove thinking message and show fallback
      setMessages(prev => {
        const filtered = prev.filter(m => m.text !== "🤔 Thinking...");
        return [...filtered, {
          type: "ai",
          text: "Great question! Select a lesson from the left panel to get started with an interactive walkthrough.",
          ts: Date.now()
        }];
      });
    }
  }

  function sendChat() {
    const text = chatInput.trim();
    if (!text) return;
    setChatInput("");
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
    if (!SpeechRecognition) {
      addMessage("ai", "⚠️ Speech recognition is not supported in this browser. Please type your question instead.");
      return;
    }

    if (micActive) {
      micActiveRef.current = false;
      setMicActive(false);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) { /* ignore */ }
        recognitionRef.current = null;
      }
      return;
    }

    const recog = new SpeechRecognition();
    recog.continuous = true;
    recog.interimResults = false;
    recog.lang = "en-US";

    recog.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      if (last.isFinal) {
        const transcript = last[0].transcript;
        processUserMessage(transcript);
      }
    };
    recog.onend = () => {
      // Auto-restart if still active (browser may stop on silence)
      if (micActiveRef.current) {
        try { recog.start(); } catch(e) { micActiveRef.current = false; setMicActive(false); }
      } else {
        setMicActive(false);
      }
    };
    recog.onerror = (e) => {
      if (e.error === 'no-speech' || e.error === 'aborted') return;
      micActiveRef.current = false;
      setMicActive(false);
    };

    recognitionRef.current = recog;
    recog.start();
    micActiveRef.current = true;
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
            👋 Good Afternoon, Shrey!
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
      <div id="crm-content" className="crm-view-smart-plans">
        <div className="view-page-header">
          <div>
            <div className="view-page-title" data-target="smart-plans-header">Smart Plans</div>
            <div className="view-page-subtitle">Automated lead nurturing sequences</div>
          </div>
          <button className="view-page-action-btn" data-target="create-plan-btn">+ Create New Plan</button>
        </div>

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

        <div className="smart-plans-table">
          <div className="spt-header-row">
            <div className="spt-col name">Plan Name</div>
            <div className="spt-col status">Status</div>
            <div className="spt-col num">Enrolled</div>
            <div className="spt-col num">Emails</div>
            <div className="spt-col num">Tasks</div>
          </div>
          {SMART_PLANS_DATA.map((plan, i) => (
            <div className="spt-row" key={plan.name} data-target={`plan-row-${i}`}>
              <div className="spt-col name">
                <div className="spt-plan-icon">📋</div>
                {plan.name}
              </div>
              <div className="spt-col status">
                <span className="spt-status-badge" style={{ color: plan.color, background: plan.color + "18" }}>{plan.status}</span>
              </div>
              <div className="spt-col num">{plan.enrolled}</div>
              <div className="spt-col num">{plan.emails}</div>
              <div className="spt-col num">{plan.tasks}</div>
            </div>
          ))}
        </div>
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
     LOGIN HANDLER
  ══════════════════════════════ */

  async function handleLogin(e) {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const profiles = await fetchDemoProfiles();
      const match = profiles.find(p => p.email === loginEmail) || profiles[0];
      setUserProfile(match);
      setLoggedIn(true);
    } catch(err) {
      setUserProfile({ email: loginEmail, name: loginEmail.split("@")[0], role: "agent" });
      setLoggedIn(true);
    }
    setLoginLoading(false);
  }

  /* ══════════════════════════════
     RENDER
  ══════════════════════════════ */

  if (!loggedIn) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <div className="login-logo">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3b5cde" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Lofty</span>
          </div>
          <h1 className="login-title">Welcome to Lofty</h1>
          <p className="login-subtitle">Sign in to access your AI-powered CRM</p>

          <form onSubmit={handleLogin}>
            <div className="login-field">
              <label>Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="login-field">
              <label>Password</label>
              <input type="password" defaultValue="••••••••" placeholder="Password" />
            </div>
            <button type="submit" className="login-btn" disabled={loginLoading}>
              {loginLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="login-demo-accounts">
            <p>Demo account:</p>
            <button className="login-demo-pick" onClick={() => setLoginEmail("shrey@lofty.demo")}>
              🏠 shrey@lofty.demo <span>Agent</span>
            </button>
          </div>

          <div className="login-footer">
            Powered by <strong>Insforge</strong> • Auth + Database + Edge Functions
          </div>
        </div>
      </div>
    );
  }

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
              <a className="nav-link" href="#">Sales</a>
              <a className="nav-link" href="#">Marketing</a>
              <a className="nav-link" href="#">Content</a>
              <a className="nav-link" href="#" data-target="nav-automation" onClick={(e) => { e.preventDefault(); setCrmView("smartPlans"); }}>Automation</a>
              <a className="nav-link" href="#">Reporting</a>
              <a className="nav-link" href="#">Marketplace</a>
              <a className="nav-link ai-link" href="#">
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
                  left: cursorPos.x - 4,
                  top: cursorPos.y - 2,
                }}
              >
                <svg viewBox="0 0 24 32" fill="none" width="24" height="32">
                  <path
                    d="M5 2L21 16H13L17 28L13 30L9 18L5 22V2Z"
                    fill="#3b5cde"
                    stroke="#fff"
                    strokeWidth="1.5"
                  />
                </svg>
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
                    <span className="rp-speaking-pill">
                      <span className="sp-dot" /><span className="sp-dot" /><span className="sp-dot" />
                      Speaking
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
