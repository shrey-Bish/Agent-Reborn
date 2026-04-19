import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

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

const lessonSteps = [
  {
    target: "updates",
    label: "New Updates",
    cursorLabel: "Release notes",
    narration: "This card is where Lofty introduces new product capabilities. Lofty Academy can turn each release note into a guided in-product lesson.",
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
  const [activeTarget, setActiveTarget] = useState("updates");
  const [lessonIndex, setLessonIndex] = useState(0);
  const [question, setQuestion] = useState("");
  const [tutorOpen, setTutorOpen] = useState(false);
  const [leadInsightOpen, setLeadInsightOpen] = useState(false);
  const [cursorPulse, setCursorPulse] = useState(0);
  const [messages, setMessages] = useState([
    {
      speaker: "Academy",
      text: "Welcome, Baylee. I will walk you through the AI signals on your dashboard and explain new Lofty updates as they ship.",
    },
  ]);
  const [releaseMode, setReleaseMode] = useState(false);

  const activeStep = lessonSteps[lessonIndex];
  const activeCursorLabel =
    lessonSteps.find((step) => step.target === activeTarget)?.cursorLabel ||
    activeStep.cursorLabel;
  const currentUpdate = useMemo(() => releaseUpdates[2], []);

  function guideTo(target, options = {}) {
    setTutorOpen(true);
    setActiveTarget(target);
    setLeadInsightOpen(target === "score-chip" || options.showLeadInsight === true);
    setCursorPulse((value) => value + 1);
  }

  function openAcademy() {
    guideTo(activeTarget || activeStep.target);
  }

  function nextStep() {
    const nextIndex = Math.min(lessonIndex + 1, lessonSteps.length - 1);
    const nextStepData = lessonSteps[nextIndex];
    setLessonIndex(nextIndex);
    guideTo(nextStepData.target);
    setMessages((items) => [
      ...items,
      { speaker: "Academy", text: nextStepData.narration },
    ]);
  }

  function explainRelease() {
    guideTo("updates");
    setReleaseMode(true);
    setMessages((items) => [
      ...items,
      {
        speaker: "Academy",
        text: `I found Lofty 4.40. A high-impact update is ${currentUpdate.title}. ${currentUpdate.lesson}`,
      },
    ]);
  }

  function askQuestion(event) {
    event.preventDefault();
    const cleanQuestion = question.trim();
    if (!cleanQuestion) return;
    setQuestion("");
    setLessonIndex(lessonSteps.findIndex((step) => step.target === "score-chip"));
    guideTo("score-chip", { showLeadInsight: true });
    setMessages((items) => [
      ...items,
      { speaker: "You", text: cleanQuestion },
      {
        speaker: "Academy",
        text: "Great question. I paused the dashboard tour and moved to Emily's score. Her 59 reflects a new Facebook lead with a valid contact path, renter intent, and no outreach yet. The important trust point is that Lofty shows the evidence before asking the agent to act.",
      },
    ]);
  }

  return (
    <main className="lofty-shell">
      <TopNav onOpenAcademy={openAcademy} />
      <div className="workspace">
        <Dashboard
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
          currentUpdate={currentUpdate}
          setQuestion={setQuestion}
          onAskQuestion={askQuestion}
          onNextStep={nextStep}
          onExplainRelease={explainRelease}
          onClose={() => setTutorOpen(false)}
        />
      ) : null}
    </main>
  );
}

function TopNav({ onOpenAcademy }) {
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
      <div className="avatar" aria-label="Baylee profile" />
    </header>
  );
}

function Dashboard({
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
          <h1>Good Evening, Baylee!</h1>
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
  currentUpdate,
  setQuestion,
  onAskQuestion,
  onNextStep,
  onExplainRelease,
  onClose,
}) {
  return (
    <aside className="academy-panel" aria-label="Lofty Academy onboarding layer">
      <div className="academy-header">
        <div>
          <span className="eyebrow">Lofty Academy</span>
          <h2>AI onboarding layer</h2>
        </div>
        <div className="academy-header-actions">
          <span className="live-pill">Live lesson</span>
          <button className="close-academy" onClick={onClose} aria-label="Close Academy">×</button>
        </div>
      </div>

      <div className="lesson-card">
        <p className="lesson-kicker">Explaining now</p>
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
        <span>Release-aware update layer</span>
        <strong>{releaseMode ? currentUpdate.title : "Lofty 4.40 ready to explain"}</strong>
        <p>{releaseMode ? currentUpdate.value : "Use the latest help article as source material for guided lessons."}</p>
      </div>

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
        <button onClick={onNextStep}>Next step</button>
        <button onClick={onExplainRelease}>Explain update</button>
      </div>
    </aside>
  );
}

createRoot(document.getElementById("root")).render(<App />);
