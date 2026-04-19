import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import {
  fetchBackendSnapshot,
  fetchDemoProfiles,
  findLessonBySourceType,
  generateLessonFromContent,
  isInsforgeConfigured,
  recordLessonProgress,
  recordQuestionEvent,
} from "./insforgeBackend";

const releaseUpdates = [
  {
    title: "Transaction Role Default Person Setting",
    lesson: "Admins and agents can set default people for transaction roles so new transactions automatically assign the right vendor, agent, or lender.",
    value: "Removes repetitive setup and reduces unassigned transaction tasks.",
  },
  {
    title: "Transaction Lead Portal",
    lesson: "Agents can share selected transaction stages and documents with leads through the Closely app.",
    value: "Builds transparency while keeping the agent in control of what clients can see.",
  },
  {
    title: "Sales Agent: Digital Employee",
    lesson: "Sales Agent is now presented as a Digital Employee that agents can hire from a marketplace.",
    value: "Makes AI feel like a concrete teammate with role, skills, and performance stats.",
  },
  {
    title: "Sales Agent: Smarter AI Conversations",
    lesson: "Sales Agent now considers more lead context, waits when needed, avoids overlapping with agent outreach, and changes strategy when a lead stops responding.",
    value: "This is a trust feature: the AI explains when it chooses not to message.",
  },
  {
    title: "Smart Plan Performance",
    lesson: "Smart Plans now include a Performance tab with email and text analytics inside the edit workflow.",
    value: "Agents can understand which automated follow-ups are working without leaving the plan builder.",
  },
];

const helpCenterTutorial = {
  title: "Aidentified Integration",
  source: "Lofty Help Center",
  url: "https://help.lofty.com/hc/en-us/articles/40537616665627-Aidentified-Integration",
  extractedSteps: [
    "Connect Aidentified to Lofty from the Connect menu, choose the Lofty logo, enter Lofty credentials, and submit.",
    "Connect Aidentified to LinkedIn by selecting Connect > LinkedIn and following the page steps.",
    "Send records to Lofty by selecting prospect checkboxes and choosing Add to Lofty.",
  ],
  liveSummary:
    "I extracted this from the written Help Center tutorial. In the live product, I would convert each written instruction into a red box, an arrow, and a spoken step on the current screen.",
};

const lessonSteps = [
  {
    target: "touch",
    label: "Need Keep In Touch",
    cursorLabel: "Follow-up basics",
    narration: "This widget is the low-friction starting point. Agent Reborn explains the daily follow-up habits a new agent needs before moving into AI signals.",
  },
  {
    target: "opportunities",
    label: "Today's Opportunities",
    cursorLabel: "AI signals",
    narration: "These are AI-prioritized signals. During onboarding, we explain what High Interest, Likely Sellers, and Back to Site mean before asking the agent to act.",
  },
  {
    target: "opportunity-stats",
    label: "Opportunity Signal Types",
    cursorLabel: "Signal types",
    narration: "High Interest, Likely Sellers, and Back to Site are not random dashboard numbers. They are the first AI concepts a new agent needs to understand and trust.",
  },
  {
    target: "score-chip",
    label: "Lead Score",
    cursorLabel: "Lead score 59",
    narration: "Lead score is Lofty's quick read on how ready a lead may be. The tutor can pause the lesson and show the evidence behind the number.",
  },
];

function App() {
  const demoMode =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("demo")
      : "";
  const startWithHelpExtraction = demoMode === "help";
  const startWithReleaseExplanation = demoMode === "release";
  const storedDemoUserEmail =
    typeof window !== "undefined"
      ? window.localStorage.getItem("agent-reborn-demo-user")
      : "";

  const [activeTarget, setActiveTarget] = useState(
    startWithHelpExtraction || startWithReleaseExplanation ? "updates" : null,
  );
  const [lessonIndex, setLessonIndex] = useState(0);
  const [question, setQuestion] = useState("");
  const [tutorOpen, setTutorOpen] = useState(
    startWithHelpExtraction || startWithReleaseExplanation,
  );
  const [leadInsightOpen, setLeadInsightOpen] = useState(false);
  const [cursorPulse, setCursorPulse] = useState(0);
  const [knowledgeMode, setKnowledgeMode] = useState(startWithHelpExtraction);
  const [backendLessons, setBackendLessons] = useState([]);
  const [activeBackendLesson, setActiveBackendLesson] = useState(null);
  const [demoProfiles, setDemoProfiles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [backendStatus, setBackendStatus] = useState({
    configured: isInsforgeConfigured,
    connected: false,
    loading: isInsforgeConfigured,
    generating: false,
    error: isInsforgeConfigured ? "" : "Add Insforge env vars to enable live backend proof.",
    lessonCount: 0,
    sourceCount: 0,
    questionCount: 0,
    progressCount: 0,
    storageArtifactCount: 0,
    lastAction: "",
  });
  const [messages, setMessages] = useState(() => {
    const startingMessages = [
      {
        speaker: "Academy",
        text: "Welcome, Shrey. I can teach core AI workflows during onboarding and explain new Lofty updates as they ship.",
      },
    ];

    if (startWithHelpExtraction) {
      return [
        ...startingMessages,
        {
          speaker: "Academy",
          text: `${helpCenterTutorial.liveSummary} For example: ${helpCenterTutorial.extractedSteps[2]}`,
        },
      ];
    }

    if (startWithReleaseExplanation) {
      return [
        ...startingMessages,
        {
          speaker: "Academy",
          text: "I found Lofty 4.40 and can turn the release details into a guided in-product lesson.",
        },
      ];
    }

    return startingMessages;
  });
  const [releaseMode, setReleaseMode] = useState(startWithReleaseExplanation);

  const activeStep = lessonSteps[lessonIndex];
  const activeCursorLabel =
    lessonSteps.find((step) => step.target === activeTarget)?.cursorLabel ||
    activeStep.cursorLabel;
  const currentUpdate = useMemo(() => releaseUpdates[2], []);

  useEffect(() => {
    refreshBackendStatus();
    loadDemoProfiles();
  }, []);

  async function loadDemoProfiles() {
    try {
      const profiles = await fetchDemoProfiles();
      setDemoProfiles(profiles);
      const storedProfile = profiles.find(
        (profile) => profile.email === storedDemoUserEmail,
      );
      if (storedProfile) {
        setCurrentUser(storedProfile);
      }
    } catch (error) {
      setBackendStatus((state) => ({ ...state, error: error.message }));
    }
  }

  function demoLogin(profile) {
    setCurrentUser(profile);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("agent-reborn-demo-user", profile.email);
    }
    setMessages((items) => [
      ...items,
      {
        speaker: "Academy",
        text: `Demo login active for ${profile.name}. Insforge profile role: ${profile.role}.`,
      },
    ]);
  }

  function demoLogout() {
    setCurrentUser(null);
    setTutorOpen(false);
    setActiveTarget(null);
    setLeadInsightOpen(false);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("agent-reborn-demo-user");
    }
  }

  async function refreshBackendStatus(lastAction = "") {
    if (!isInsforgeConfigured) return;

    try {
      const snapshot = await fetchBackendSnapshot();
      setBackendLessons(snapshot.lessons);
      setBackendStatus((state) => ({
        ...state,
        ...snapshot,
        configured: true,
        connected: true,
        loading: false,
        generating: false,
        error: "",
        lastAction: lastAction || state.lastAction,
      }));
    } catch (error) {
      setBackendStatus((state) => ({
        ...state,
        connected: false,
        loading: false,
        generating: false,
        error: error.message,
      }));
    }
  }

  function recordProgressFor(lesson, currentStep, completed = false) {
    if (!lesson?.id || !isInsforgeConfigured) return;

    recordLessonProgress({
      lessonId: lesson.id,
      currentStep,
      userEmail: currentUser?.email,
      completed,
    })
      .then(() => refreshBackendStatus("Progress saved to Insforge."))
      .catch((error) => {
        setBackendStatus((state) => ({ ...state, error: error.message }));
      });
  }

  function guideTo(target, options = {}) {
    setTutorOpen(true);
    setActiveTarget(target);
    setLeadInsightOpen(target === "score-chip" || options.showLeadInsight === true);
    setCursorPulse((value) => value + 1);
  }

  function openAcademy() {
    setTutorOpen(true);
    setActiveTarget(null);
    setLessonIndex(0);
    setLeadInsightOpen(false);
    setKnowledgeMode(false);
    setReleaseMode(false);
    setActiveBackendLesson(null);
  }

  function nextStep() {
    if (!activeTarget) {
      const firstLesson =
        activeBackendLesson ||
        findLessonBySourceType(backendLessons, "release_note") ||
        backendLessons[0] ||
        null;
      setActiveBackendLesson(firstLesson);
      guideTo(activeStep.target);
      recordProgressFor(firstLesson, lessonIndex);
      setMessages((items) => [
        ...items,
        { speaker: "Academy", text: activeStep.narration },
      ]);
      return;
    }

    const nextIndex = Math.min(lessonIndex + 1, lessonSteps.length - 1);
    const nextStepData = lessonSteps[nextIndex];
    setLessonIndex(nextIndex);
    guideTo(nextStepData.target);
    recordProgressFor(activeBackendLesson, nextIndex);
    setMessages((items) => [
      ...items,
      { speaker: "Academy", text: nextStepData.narration },
    ]);
  }

  function explainRelease() {
    const releaseLesson = findLessonBySourceType(backendLessons, "release_note");
    setActiveBackendLesson(releaseLesson);
    setKnowledgeMode(false);
    guideTo("updates");
    setReleaseMode(true);
    setMessages((items) => [
      ...items,
      {
        speaker: "Academy",
        text: releaseLesson
          ? `Loaded "${releaseLesson.title}" from Insforge. ${currentUpdate.lesson}`
          : `I found Lofty 4.40. A high-impact update is ${currentUpdate.title}. ${currentUpdate.lesson}`,
      },
    ]);
    recordProgressFor(releaseLesson, 0);
  }

  function explainHelpTutorial() {
    const helpLesson = findLessonBySourceType(backendLessons, "help_center_article");
    setActiveBackendLesson(helpLesson);
    setKnowledgeMode(true);
    setReleaseMode(false);
    guideTo("updates");
    setMessages((items) => [
      ...items,
      {
        speaker: "Academy",
        text: `${helpCenterTutorial.liveSummary} For example: ${helpCenterTutorial.extractedSteps[2]}`,
      },
    ]);
    recordProgressFor(helpLesson, 0);
  }

  function askQuestion(event) {
    event.preventDefault();
    const cleanQuestion = question.trim();
    if (!cleanQuestion) return;
    const answerSummary =
      "Her 59 reflects a new Facebook lead with a valid contact path, renter intent, and no outreach yet. Lofty shows the evidence before asking the agent to act.";
    setQuestion("");
    setLessonIndex(lessonSteps.findIndex((step) => step.target === "score-chip"));
    guideTo("score-chip", { showLeadInsight: true });
    setMessages((items) => [
      ...items,
      { speaker: "You", text: cleanQuestion },
      {
        speaker: "Academy",
        text: `Great question. I paused the dashboard tour and moved to Emily's score. ${answerSummary}`,
      },
    ]);
    recordQuestionEvent({
      lessonId: activeBackendLesson?.id || backendLessons[0]?.id,
      question: cleanQuestion,
      answerSummary,
      sourceScreen: "dashboard_lead_score",
      userEmail: currentUser?.email,
    })
      .then(() => refreshBackendStatus("Q&A event logged to Insforge."))
      .catch((error) => {
        setBackendStatus((state) => ({ ...state, error: error.message }));
      });
  }

  async function generateBackendLesson() {
    if (!isInsforgeConfigured) return;

    setBackendStatus((state) => ({
      ...state,
      generating: true,
      error: "",
      lastAction: "Calling generate-lesson Edge Function...",
    }));

    try {
      const result = await generateLessonFromContent({
        type: "help_center_article",
        title: helpCenterTutorial.title,
        source_url: helpCenterTutorial.url,
        raw_content: helpCenterTutorial.extractedSteps.join("\n"),
      });
      setActiveBackendLesson(result.lesson);
      setMessages((items) => [
        ...items,
        {
          speaker: "Academy",
          text: `Insforge generated and saved "${result.lesson.title}" from Help Center content.`,
        },
      ]);
      await refreshBackendStatus("Edge Function generated and saved a lesson.");
    } catch (error) {
      setBackendStatus((state) => ({
        ...state,
        generating: false,
        error: error.message,
      }));
    }
  }

  return (
    <main className="lofty-shell">
      <TopNav currentUser={currentUser} onOpenAcademy={openAcademy} onLogout={demoLogout} />
      {!currentUser ? (
        <DemoLogin
          profiles={demoProfiles}
          backendConnected={backendStatus.connected}
          onLogin={demoLogin}
        />
      ) : null}
      <div className="workspace">
        <Dashboard
          userName={currentUser?.name || "Shrey Demo"}
          activeTarget={tutorOpen ? activeTarget : null}
          cursorLabel={activeCursorLabel}
          cursorPulse={cursorPulse}
          leadInsightOpen={leadInsightOpen}
          onExplainRelease={explainRelease}
        />
        <RightRail />
      </div>
      {tutorOpen ? (
        <AcademyTutor
          activeStep={activeStep}
          lessonIndex={lessonIndex}
          messages={messages}
          question={question}
          releaseMode={releaseMode}
          knowledgeMode={knowledgeMode}
          currentUpdate={currentUpdate}
          helpCenterTutorial={helpCenterTutorial}
          activeBackendLesson={activeBackendLesson}
          backendStatus={backendStatus}
          currentUser={currentUser}
          hasActiveTarget={Boolean(activeTarget)}
          setQuestion={setQuestion}
          onAskQuestion={askQuestion}
          onNextStep={nextStep}
          onExplainRelease={explainRelease}
          onExplainHelpTutorial={explainHelpTutorial}
          onGenerateBackendLesson={generateBackendLesson}
          onClose={() => setTutorOpen(false)}
        />
      ) : null}
    </main>
  );
}

function TopNav({ currentUser, onOpenAcademy, onLogout }) {
  return (
    <header className="top-nav">
      <div className="brand">
        <span className="lofty-mark" aria-hidden="true">
          <span />
        </span>
        <span className="brand-word">Lofty</span>
      </div>
      <nav className="main-tabs" aria-label="Primary navigation">
        <a href="/">CRM</a>
        <a href="/">Sales</a>
        <a href="/">Marketing</a>
        <a href="/">Content</a>
        <a href="/">Automation</a>
        <a href="/">Reporting</a>
        <a href="/">Marketplace</a>
        <button className="ai-tab" onClick={onOpenAcademy}>✦ AI Copilots</button>
      </nav>
      <div className="nav-search" aria-label="Search">
        <span className="search-icon" />
      </div>
      <button className="profile-button" onClick={onLogout} aria-label="Shrey profile">
        <span className="avatar" />
        {currentUser ? <span>{currentUser.role}</span> : null}
      </button>
    </header>
  );
}

function DemoLogin({ profiles, backendConnected, onLogin }) {
  const fallbackProfiles = profiles.length
    ? profiles
    : [
        { email: "shrey@lofty.demo", name: "Shrey Demo", role: "agent" },
        { email: "pm@agentreborn.demo", name: "Agent Reborn PM", role: "admin" },
      ];

  return (
    <section className="demo-login" aria-label="Agent Reborn demo login">
      <div>
        <span>Agent Reborn</span>
        <h2>Choose a demo login</h2>
        <p>
          This lightweight demo session uses Insforge profiles so judges can see
          agent/admin roles without Google OAuth.
        </p>
      </div>
      <div className="demo-login-actions">
        {fallbackProfiles.map((profile) => (
          <button key={profile.email} onClick={() => onLogin(profile)}>
            <strong>{profile.role === "admin" ? "Admin" : "Agent"}</strong>
            <span>{profile.name}</span>
          </button>
        ))}
      </div>
      <p className="demo-login-status">
        Insforge profiles: {backendConnected ? "connected" : "local fallback"}
      </p>
    </section>
  );
}

function Dashboard({
  userName,
  activeTarget,
  cursorLabel,
  cursorPulse,
  leadInsightOpen,
  onExplainRelease,
}) {
  return (
    <section className="dashboard" aria-label="Lofty dashboard mock">
      <GuidanceLayer
        activeTarget={activeTarget}
        cursorLabel={cursorLabel}
        cursorPulse={cursorPulse}
      />
      <div className="dashboard-head">
        <div className="greeting">
          <span className="wave" aria-hidden="true">👋</span>
          <h1>Good Evening, {userName.replace(" Demo", "")}!</h1>
          <span className="separator" />
          <button className="dashboard-select">My Dashboard</button>
        </div>
        <div className="dashboard-actions">
          <button className="priority-select">Today's Priorities</button>
          <button className="grid-button" aria-label="Dashboard grid">
            <span />
          </button>
        </div>
      </div>

      <div className="card-grid">
        <Card className="updates-card" id="updates" activeTarget={activeTarget}>
          <div className="tabs">
            <button className="active">New Updates</button>
            <button>Announcements</button>
          </div>
          <div className="tab-rule" />
          <article className="update-row">
            <div className="update-thumb photo-thumb" />
            <div>
              <h3>✨ New Service: done-for-you Website</h3>
              <p>We build website, you close deals!</p>
            </div>
          </article>
          <button className="update-row release-update" onClick={onExplainRelease}>
            <div className="update-thumb rocket-thumb" />
            <div>
              <h3>Check Lofty's latest feature updates!</h3>
              <p>Lofty 4.40 release guide</p>
            </div>
          </button>
        </Card>

        <Card className="leads-card" id="new-leads" activeTarget={activeTarget}>
          <CardTitle title="Today's New Leads" showGear />
          <div className="thin-progress" />
          <h3 className="metric-title">Total: 8 (8 untouched)</h3>
          <p className="section-label">Leads Waiting To Be Contacted</p>
          <LeadRow
            name="Emily Wilson"
            type="Renter"
            source="Facebook"
            score="59"
            active={activeTarget === "score-chip"}
          />
          {leadInsightOpen ? <LeadScoreInsight /> : null}
          <LeadRow name="Carlos Garcia" type="Other" source="Zillow" score="44" />
          <LeadRow name="Samuel Scott" type="Buyer" source="YouTube" score="43" />
          <button className="view-all">View All <span>›</span></button>
        </Card>

        <Card className="opportunity-card" id="opportunities" activeTarget={activeTarget}>
          <CardTitle title="Today's Opportunities" />
          <div className={`opportunity-stats ${activeTarget === "opportunity-stats" ? "targeted-section" : ""}`}>
            <Stat label="High Interest" value="0" />
            <Stat label="Likely Sellers" value="0" />
            <Stat label="Back to Site" value="0" />
          </div>
          <div className="empty-state">
            <div className="box-illustration">
              <span className="cloud one" />
              <span className="cloud two" />
              <span className="person" />
              <span className="box" />
            </div>
            <p>Nothing on your to-do list yet — Enjoy your day!</p>
          </div>
        </Card>

        <Card className="compact-card" id="touch" activeTarget={activeTarget}>
          <CardTitle title="Need Keep In Touch" />
          <div className="split-stats">
            <Stat label="Birthday" value="0" />
            <Stat label="Follow-Up" value="0" />
          </div>
        </Card>

        <Card className="compact-card" id="transactions" activeTarget={activeTarget}>
          <CardTitle title="Transactions" showGear />
          <div className="split-stats">
            <Stat label="Near Deadline" value="0" />
            <Stat label="Expired" value="0" />
          </div>
        </Card>

        <Card className="compact-card tasks-card" id="tasks" activeTarget={activeTarget}>
          <CardTitle title="Today's Tasks" />
          <div className="task-stats">
            <TaskStat label="Call" color="blue" />
            <TaskStat label="Text" color="sky" />
            <TaskStat label="Email" color="green" />
            <TaskStat label="Other" color="orange" />
          </div>
        </Card>
      </div>
    </section>
  );
}

function GuidanceLayer({ activeTarget, cursorLabel, cursorPulse }) {
  if (!activeTarget) return null;

  return (
    <div
      key={`${activeTarget}-${cursorPulse}`}
      className={`ai-cursor cursor-${activeTarget}`}
      aria-hidden="true"
    >
      <span className="ai-cursor-pulse" />
      <span className="ai-cursor-pointer" />
      <span className="ai-cursor-label">{cursorLabel || "Lofty Academy"}</span>
      <span className={`tutorial-red-box red-box-${activeTarget}`} />
      <span className={`tutorial-arrow arrow-${activeTarget}`}>
        <span>{activeTarget === "score-chip" ? "2" : "1"}</span>
      </span>
    </div>
  );
}

function Card({ children, className = "", id, activeTarget }) {
  const isActive =
    activeTarget === id ||
    (id === "new-leads" && activeTarget === "score-chip") ||
    (id === "opportunities" && activeTarget === "opportunity-stats");

  return (
    <section className={`card ${className} ${isActive ? "active-explain" : ""}`}>
      {children}
    </section>
  );
}

function CardTitle({ title, showGear = false }) {
  return (
    <div className="card-title">
      <h2>{title}</h2>
      <div className="card-icons">
        <span className="help-dot">?</span>
        {showGear ? <span className="gear">⚙</span> : null}
      </div>
    </div>
  );
}

function LeadRow({ name, type, source, score, active = false }) {
  return (
    <article className={`lead-row ${active ? "score-active" : ""}`}>
      <div>
        <h4>{name}</h4>
        <p>{type}</p>
        <p>{source}</p>
      </div>
      <span className="score">{score}</span>
    </article>
  );
}

function LeadScoreInsight() {
  return (
    <aside className="lead-insight-panel" aria-label="Lead score explanation">
      <div>
        <span>Why 59?</span>
        <strong>Lead score evidence</strong>
      </div>
      <ul>
        <li>New Facebook lead with valid contact details</li>
        <li>Renter intent, not yet a high purchase signal</li>
        <li>No agent outreach yet, so Lofty recommends first contact</li>
      </ul>
    </aside>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TaskStat({ label, color }) {
  return (
    <div className={`task-stat ${color}`}>
      <span>{label}</span>
      <strong>0</strong>
    </div>
  );
}

function RightRail() {
  return (
    <aside className="right-rail" aria-label="Lofty quick tools">
      <button>✦</button>
      <button>☏</button>
      <button>▤</button>
      <button>♧</button>
      <button>?</button>
      <button>⚙</button>
    </aside>
  );
}

function AcademyTutor({
  activeStep,
  lessonIndex,
  messages,
  question,
  releaseMode,
  knowledgeMode,
  currentUpdate,
  helpCenterTutorial,
  activeBackendLesson,
  backendStatus,
  currentUser,
  hasActiveTarget,
  setQuestion,
  onAskQuestion,
  onNextStep,
  onExplainRelease,
  onExplainHelpTutorial,
  onGenerateBackendLesson,
  onClose,
}) {
  const backendLessonTitle = activeBackendLesson?.title;

  return (
    <aside className="academy-panel" aria-label="Lofty Academy education layer">
      <div className="academy-header">
        <div>
          <span className="eyebrow">Lofty Academy</span>
          <h2>AI education layer</h2>
        </div>
        <div className="academy-header-actions">
          <span className="live-pill">Live lesson</span>
          <button className="close-academy" onClick={onClose} aria-label="Close Academy">×</button>
        </div>
      </div>

      <div className="lesson-card">
        <p className="lesson-kicker">{hasActiveTarget ? "Explaining now" : "Ready to explain"}</p>
        <h3>{activeStep.label}</h3>
        <p>{activeStep.narration}</p>
        <div className="lesson-progress" aria-label="Lesson progress">
          {lessonSteps.map((step, index) => (
            <span
              key={step.target}
              className={index <= lessonIndex ? "complete" : ""}
            />
          ))}
        </div>
      </div>

      <div className="release-card">
        <span>{knowledgeMode ? "Help Center extraction" : "Content-to-lesson engine"}</span>
        <strong>
          {knowledgeMode
            ? backendLessonTitle || helpCenterTutorial.title
            : releaseMode
              ? backendLessonTitle || currentUpdate.title
              : "Lofty 4.40 ready to teach"}
        </strong>
        <p>
          {knowledgeMode
            ? backendLessonTitle
              ? `Loaded from Insforge. Validation: ${activeBackendLesson.validation_status}.`
              : `Source: ${helpCenterTutorial.source}. Extracted ${helpCenterTutorial.extractedSteps.length} written steps into a live walkthrough.`
            : releaseMode
              ? backendLessonTitle
                ? `Loaded from Insforge. Validation: ${activeBackendLesson.validation_status}.`
                : currentUpdate.value
              : "Use the latest help article as source material for guided lessons."}
        </p>
      </div>

      <BackendStatusCard
        status={backendStatus}
        currentUser={currentUser}
        onGenerateBackendLesson={onGenerateBackendLesson}
      />

      {knowledgeMode ? (
        <div className="extracted-steps">
          {helpCenterTutorial.extractedSteps.map((step, index) => (
            <article key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </article>
          ))}
        </div>
      ) : null}

      <div className="transcript">
        {messages.map((message, index) => (
          <article key={`${message.speaker}-${index}`} className={message.speaker === "You" ? "user-message" : ""}>
            <span>{message.speaker}</span>
            <p>{message.text}</p>
          </article>
        ))}
      </div>

      <form className="question-form" onSubmit={onAskQuestion}>
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask: What is a lead score?"
        />
        <button type="submit">Ask</button>
      </form>

      <div className="academy-actions">
        <button onClick={onNextStep}>{hasActiveTarget ? "Next step" : "Start lesson"}</button>
        <button onClick={onExplainRelease}>Explain update</button>
        <button onClick={onExplainHelpTutorial}>Extract tutorial</button>
      </div>
    </aside>
  );
}

function BackendStatusCard({ status, currentUser, onGenerateBackendLesson }) {
  const statusLabel = status.loading
    ? "Checking..."
    : status.connected
      ? "Connected"
      : status.configured
        ? "Needs attention"
        : "Not configured";

  return (
    <div className="backend-card">
      <div className="backend-card-head">
        <span>Insforge backend</span>
        <strong>{statusLabel}</strong>
      </div>
      <div className="backend-metrics">
        <span>Lessons <strong>{status.lessonCount}</strong></span>
        <span>Sources <strong>{status.sourceCount}</strong></span>
        <span>Q&A <strong>{status.questionCount}</strong></span>
        <span>Progress <strong>{status.progressCount}</strong></span>
      </div>
      <p>
        Demo login: <strong>{currentUser?.email || "not selected"}</strong>
      </p>
      <p>
        Storage artifacts: <strong>{status.storageArtifactCount}</strong>
        {status.lastAction ? ` · ${status.lastAction}` : ""}
      </p>
      {status.error ? <p className="backend-error">{status.error}</p> : null}
      <button
        type="button"
        onClick={onGenerateBackendLesson}
        disabled={!status.configured || status.generating}
      >
        {status.generating ? "Generating..." : "Generate saved lesson"}
      </button>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
