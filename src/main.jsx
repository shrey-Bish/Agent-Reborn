import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

/* ─────────────────────────────────────────
   STATIC DATA
───────────────────────────────────────── */
const COURSES = [
  {
    name: "CRM Dashboard Fundamentals",
    meta: "3 of 3 lessons",
    status: "done",
    lessons: [
      { name: "Navigating the Dashboard", status: "done" },
      { name: "Understanding Lead Cards", status: "done" },
      { name: "Daily Priorities Workflow", status: "done" },
    ],
  },
  {
    name: "Lead Management Mastery",
    meta: "1 of 3 lessons",
    status: "active",
    lessons: [
      { name: "Importing & Tagging Leads", status: "done" },
      { name: "Lead Scoring Explained", status: "active" },
      { name: "Follow-Up Strategies", status: "todo" },
    ],
  },
  {
    name: "Sales Pipeline & Transactions",
    meta: "0 of 3 lessons",
    status: "todo",
    lessons: [
      { name: "Creating a Pipeline Stage", status: "todo" },
      { name: "Managing Deadlines", status: "todo" },
      { name: "Closing & Archiving Deals", status: "todo" },
    ],
  },
  {
    name: "Marketing & Automation Tools",
    meta: "0 of 3 lessons",
    status: "todo",
    lessons: [
      { name: "Email Campaign Basics", status: "todo" },
      { name: "Setting Up Automations", status: "todo" },
      { name: "Drip Sequences & Triggers", status: "todo" },
    ],
  },
  {
    name: "AI Copilots & Smart Features",
    meta: "0 of 3 lessons",
    status: "todo",
    lessons: [
      { name: "Intro to AI Copilots", status: "todo" },
      { name: "Smart Lead Predictions", status: "todo" },
      { name: "AI-Powered Responses", status: "todo" },
    ],
  },
];

const RELEASES = [
  {
    version: "v3.2",
    name: "Spring 2025 Update",
    date: "April 2025 · 3 lessons",
    badgeColor: null,
    lessons: [
      { name: "New AI Dashboard Widgets", status: "todo" },
      { name: "Bulk Lead Actions", status: "todo" },
      { name: "Updated Reporting Views", status: "todo" },
    ],
  },
  {
    version: "v3.0",
    name: "AI Copilots Launch",
    date: "February 2025 · 3 lessons",
    badgeColor: null,
    lessons: [
      { name: "Intro to AI Copilots", status: "done" },
      { name: "Copilot Lead Suggestions", status: "done" },
      { name: "Smart Reply Drafts", status: "done" },
    ],
  },
  {
    version: "v2.5",
    name: "Automation Overhaul",
    date: "October 2024 · 3 lessons",
    badgeColor: "var(--blue)",
    lessons: [
      { name: "Trigger-Based Workflows", status: "done" },
      { name: "Drip Campaign Builder", status: "done" },
      { name: "Automation Analytics", status: "done" },
    ],
  },
  {
    version: "v2.0",
    name: "Pipeline Redesign",
    date: "June 2024 · 3 lessons",
    badgeColor: "var(--blue)",
    lessons: [
      { name: "New Pipeline Stages UI", status: "done" },
      { name: "Drag-and-Drop Deals", status: "done" },
      { name: "Transaction Milestones", status: "done" },
    ],
  },
  {
    version: "v1.5",
    name: "Lead Scoring Engine",
    date: "January 2024 · 3 lessons",
    badgeColor: "var(--gray-500)",
    lessons: [
      { name: "How Scores Are Calculated", status: "done" },
      { name: "Score Thresholds & Alerts", status: "done" },
      { name: "Reviewing Score History", status: "done" },
    ],
  },
];

const NAV_ITEMS = [
  { icon: "📚", label: "Courses",       badge: "5",  badgeColor: null,            view: "courses"  },
  { icon: "🚀", label: "Releases",      badge: "5",  badgeColor: "var(--green)",  view: "releases" },
  { icon: "🏆", label: "Achievements",  badge: null, badgeColor: null,            view: null       },
  { icon: "📢", label: "Announcements", badge: "2",  badgeColor: "var(--amber)",  view: null       },
];

const INITIAL_CHAT = [
  {
    type: "ai",
    text: "Welcome to the Dashboard lesson! I'll walk you through each card. Watch for my highlights — they show exactly what to click.",
  },
  {
    type: "user",
    text: 'What does the "Today\'s New Leads" card show?',
  },
  {
    type: "ai",
    text: "Great question! It shows leads registered today who haven't been contacted yet. The score bubble (like 59) is their lead score — higher means more engaged.",
  },
  {
    type: "ai",
    text: "Next, look at the <strong>Opportunities card</strong> in the top-right. It tracks high-interest buyers and likely sellers. Ready to move on?",
    html: true,
  },
];

/* ─────────────────────────────────────────
   APP
───────────────────────────────────────── */
function App() {
  const [academyOn,       setAcademyOn]       = useState(false);
  const [voiceOn,         setVoiceOn]         = useState(false);
  const [isListening,     setIsListening]     = useState(false);
  const [lpView,          setLpView]          = useState("main");   // 'main' | 'courses' | 'releases'
  const [lpActiveNav,     setLpActiveNav]     = useState(0);
  const [expandedCourse,  setExpandedCourse]  = useState(null);
  const [expandedRelease, setExpandedRelease] = useState(null);
  const [chatMessages,    setChatMessages]    = useState(INITIAL_CHAT);
  const [chatInput,       setChatInput]       = useState("");

  const chatAreaRef      = useRef(null);
  const listeningTimer   = useRef(null);
  const chatTextareaRef  = useRef(null);

  /* keep body class in sync */
  useEffect(() => {
    document.body.classList.toggle("academy-active", academyOn);
    return () => document.body.classList.remove("academy-active");
  }, [academyOn]);

  /* auto-scroll chat */
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [chatMessages]);

  function toggleAcademy() {
    setAcademyOn(v => !v);
  }

  function handleBack() {
    if (lpView !== "main") {
      setLpView("main");
    } else if (academyOn) {
      setAcademyOn(false);
    }
  }

  function toggleCourse(idx) {
    setExpandedCourse(prev => (prev === idx ? null : idx));
  }

  function toggleRelease(idx) {
    setExpandedRelease(prev => (prev === idx ? null : idx));
  }

  function toggleVoiceMode() {
    setVoiceOn(v => {
      if (v && isListening) stopListening();
      return !v;
    });
  }

  function toggleListening() {
    if (isListening) {
      stopListening();
    } else {
      setIsListening(true);
      listeningTimer.current = setTimeout(stopListening, 4000);
    }
  }

  function stopListening() {
    setIsListening(false);
    if (listeningTimer.current) {
      clearTimeout(listeningTimer.current);
      listeningTimer.current = null;
    }
  }

  function sendChat() {
    const text = chatInput.trim();
    if (!text) return;
    setChatMessages(prev => [...prev, { type: "user", text }]);
    setChatInput("");
    if (chatTextareaRef.current) {
      chatTextareaRef.current.style.height = "auto";
    }
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          type: "ai",
          text: "Great question! Let me explain that for you in the context of this dashboard.",
        },
      ]);
    }, 800);
  }

  function handleChatKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChat();
    }
    setTimeout(() => {
      if (chatTextareaRef.current) {
        chatTextareaRef.current.style.height = "auto";
        chatTextareaRef.current.style.height =
          Math.min(chatTextareaRef.current.scrollHeight, 80) + "px";
      }
    }, 0);
  }

  return (
    <div id="app">

      {/* ══ ACADEMY TOP BAR ══ */}
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

            {/* VIEW 1: MAIN NAV */}
            <div className={`lp-view${lpView === "main" ? " active" : ""}`} id="lp-main-view">
              <div className="lp-header">
                <div className="lp-title">Lofty Academy</div>
                <div className="lp-subtitle">AI-Guided Mastery</div>
              </div>

              <div className="lp-scroll">
                <div className="lp-section-label">
                  <span>Navigation</span>
                  <span className="lp-pct">75% Complete</span>
                </div>

                {NAV_ITEMS.map((item, i) => (
                  <div
                    key={item.label}
                    className={`lp-nav-item${lpActiveNav === i ? " active" : ""}`}
                    onClick={() => {
                      setLpActiveNav(i);
                      if (item.view) setLpView(item.view);
                    }}
                  >
                    <div className="lp-nav-icon">{item.icon}</div>
                    {item.label}
                    {item.badge && (
                      <span
                        className="lp-nav-badge"
                        style={item.badgeColor ? { background: item.badgeColor } : {}}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                ))}

                {/* Progress ring */}
                <div className="lp-ring-section">
                  <div className="ring-wrap">
                    <svg width="88" height="88" viewBox="0 0 88 88">
                      <circle className="ring-bg"   cx="44" cy="44" r="35" />
                      <circle className="ring-fill" cx="44" cy="44" r="35" />
                    </svg>
                    <div className="ring-center">
                      <div className="ring-pct">75%</div>
                      <div className="ring-word">Overall</div>
                    </div>
                  </div>
                  <div className="ring-caption">
                    <strong>75% complete</strong><br />
                    <span style={{ fontSize: "10px", color: "var(--gray-400)" }}>
                      2 lessons left to master!
                    </span>
                  </div>
                </div>

                {/* Feature card */}
                <div className="lp-feature-card">
                  <div className="lp-feature-title">New Features</div>
                  <div className="lp-feature-desc">
                    Discover the latest AI Lead Prediction tools released today.
                  </div>
                  <button className="lp-feature-btn">Explore Now</button>
                </div>

                <div className="lp-spacer" />
              </div>

              <div className="lp-cert-btn-wrap">
                <button className="lp-cert-btn">🏅 View Certificate</button>
              </div>
            </div>

            {/* VIEW 2: COURSES */}
            <div className={`lp-view${lpView === "courses" ? " active" : ""}`} id="lp-courses-view">
              <div className="lp-header">
                <div className="lp-title">Lofty Academy</div>
                <div className="lp-subtitle">AI-Guided Mastery</div>
              </div>

              <div className="lp-view-header">
                <div className="lp-view-back" onClick={() => setLpView("main")}>←</div>
                <div className="lp-view-title">Courses</div>
                <div className="lp-view-subtitle">5 courses · 15 lessons</div>
              </div>

              <div className="lp-scroll">
                {COURSES.map((course, idx) => (
                  <div className="course-item" key={course.name}>
                    <div
                      className={`course-row${expandedCourse === idx ? " expanded" : ""}`}
                      onClick={() => toggleCourse(idx)}
                    >
                      <div className={`course-status-icon ${course.status}`}>
                        {course.status === "done" ? "✓" : course.status === "active" ? "●" : "○"}
                      </div>
                      <div className="course-info">
                        <div className="course-name">{course.name}</div>
                        <div className="course-meta">{course.meta}</div>
                      </div>
                      {course.status === "done"   && <span className="course-done-badge">Done</span>}
                      {course.status === "active" && <span className="course-inprog-badge">Active</span>}
                      <span className="course-chevron">›</span>
                    </div>
                    <div className={`lessons-list${expandedCourse === idx ? " open" : ""}`}>
                      {course.lessons.map(lesson => (
                        <div className="lesson-row" key={lesson.name}>
                          <div className={`lesson-dot ${lesson.status}`}>
                            {lesson.status === "done" ? "✓" : lesson.status === "active" ? "▶" : ""}
                          </div>
                          <span className="lesson-name">{lesson.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* VIEW 3: RELEASES */}
            <div className={`lp-view${lpView === "releases" ? " active" : ""}`} id="lp-releases-view">
              <div className="lp-header">
                <div className="lp-title">Lofty Academy</div>
                <div className="lp-subtitle">AI-Guided Mastery</div>
              </div>

              <div className="lp-view-header">
                <div className="lp-view-back" onClick={() => setLpView("main")}>←</div>
                <div className="lp-view-title">Releases</div>
                <div className="lp-view-subtitle">5 versions</div>
              </div>

              <div className="lp-scroll">
                {RELEASES.map((release, idx) => (
                  <div className="release-item" key={release.version}>
                    <div
                      className={`release-row${expandedRelease === idx ? " expanded" : ""}`}
                      onClick={() => toggleRelease(idx)}
                    >
                      <span
                        className="release-badge"
                        style={release.badgeColor ? { background: release.badgeColor } : {}}
                      >
                        {release.version}
                      </span>
                      <div className="release-info">
                        <div className="release-name">{release.name}</div>
                        <div className="release-date">{release.date}</div>
                      </div>
                      <span className="release-chevron">›</span>
                    </div>
                    <div className={`lessons-list${expandedRelease === idx ? " open" : ""}`}>
                      {release.lessons.map(lesson => (
                        <div className="lesson-row" key={lesson.name}>
                          <div className={`lesson-dot ${lesson.status}`}>
                            {lesson.status === "done" ? "✓" : ""}
                          </div>
                          <span className="lesson-name">{lesson.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ══ CRM VIEWPORT ══ */}
        <div id="crm-viewport">

          {/* CRM NAVBAR */}
          <nav id="crm-nav">
            <a className="nav-logo" href="#">
              <div className="nav-logo-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" fill="#fff" />
                  <polyline points="9 22 9 12 15 12 15 22" fill="none" stroke="#3b5cde" strokeWidth="2" />
                </svg>
              </div>
              <span className="nav-logo-text">Lofty</span>
            </a>

            <div className="nav-links" id="nav-links">
              {["CRM","Sales","Marketing","Content","Automation","Reporting","Marketplace"].map(l => (
                <a className="nav-link" href="#" key={l}>{l}</a>
              ))}
              <a className="nav-link ai-link" href="#">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                </svg>
                AI Copilots
              </a>
            </div>

            <div className="nav-right">
              <div className="nav-search" id="nav-search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span className="search-txt" style={{ color: "var(--gray-400)" }}>Search...</span>
              </div>

              <button
                id="academy-toggle"
                className={academyOn ? "active" : ""}
                onClick={toggleAcademy}
              >
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

            {/* Dashboard content */}
            <div id="crm-content">
              <div className="dash-header">
                <div className="dash-greeting">
                  👋 Good Afternoon, Baylee!
                  <div className="dash-dropdown">
                    My Dashboard
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
                <div className="dash-meta">
                  <div className="dash-priority-select">
                    Today&apos;s Priorities
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  <div className="grid-toggle">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="dash-grid">

                {/* New Updates */}
                <div className="dash-card">
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
                  <div className="update-item">
                    <div className="update-img">
                      <div style={{ background: "linear-gradient(135deg,#ede9fe,#ddd6fe)", width: "100%", height: "100%" }} />
                    </div>
                    <div>
                      <div className="update-text-title">Check Lofty&apos;s latest feature updates!</div>
                    </div>
                  </div>
                </div>

                {/* Today's New Leads */}
                <div className="dash-card">
                  <div className="card-header">
                    <div className="card-title">Today&apos;s New Leads</div>
                    <div className="card-actions">
                      <span className="card-icon">?</span>
                      <span className="card-icon">⚙</span>
                    </div>
                  </div>
                  <div className="progress-bar-crm">
                    <div className="progress-bar-fill" style={{ width: "65%" }} />
                  </div>
                  <div className="leads-count">Total: 7 (7 untouched)</div>
                  <div className="leads-section-title">Leads Waiting To Be Contacted</div>
                  <div className="lead-row">
                    <div>
                      <div className="lead-name">Emily Wilson</div>
                      <div className="lead-meta">Renter · Facebook</div>
                    </div>
                    <div className="lead-score">59</div>
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
                <div className="dash-card">
                  <div className="card-header">
                    <div className="card-title">Today&apos;s Opportunities</div>
                    <div className="card-actions"><span className="card-icon">?</span></div>
                  </div>
                  <div className="stat-row">
                    <div className="stat-col">
                      <div className="stat-label">High Interest</div>
                      <div className="stat-value">0</div>
                    </div>
                    <div className="stat-col">
                      <div className="stat-label">Likely Sellers</div>
                      <div className="stat-value">0</div>
                    </div>
                    <div className="stat-col">
                      <div className="stat-label">Back to Site</div>
                      <div className="stat-value">0</div>
                    </div>
                  </div>
                  <div className="no-data">Nothing on your to-do list yet — Enjoy your day!</div>
                </div>

                {/* Need Keep In Touch */}
                <div className="dash-card">
                  <div className="card-header">
                    <div className="card-title">Need Keep In Touch</div>
                    <div className="card-actions"><span className="card-icon">?</span></div>
                  </div>
                  <div className="stat-pair">
                    <div className="sp">
                      <div className="sp-label">Birthday</div>
                      <div className="sp-val">0</div>
                    </div>
                    <div className="sp">
                      <div className="sp-label">Follow-Up</div>
                      <div className="sp-val">0</div>
                    </div>
                  </div>
                  <div className="no-data">Nothing on your to-do list yet — Enjoy your day!</div>
                </div>

                {/* Transactions */}
                <div className="dash-card">
                  <div className="card-header">
                    <div className="card-title">Transactions</div>
                    <div className="card-actions">
                      <span className="card-icon">?</span>
                      <span className="card-icon">⚙</span>
                    </div>
                  </div>
                  <div className="stat-pair">
                    <div className="sp">
                      <div className="sp-label">Near Deadline</div>
                      <div className="sp-val">0</div>
                    </div>
                    <div className="sp">
                      <div className="sp-label">Expired</div>
                      <div className="sp-val">0</div>
                    </div>
                  </div>
                  <div className="no-data">Nothing on your to-do list yet — Enjoy your day!</div>
                </div>

                {/* Today's Tasks */}
                <div className="dash-card">
                  <div className="card-header">
                    <div className="card-title">Today&apos;s Tasks</div>
                    <div className="card-actions"><span className="card-icon">?</span></div>
                  </div>
                  <div className="tasks-grid">
                    <div className="task-chip">
                      <div className="task-chip-label">Call</div>
                      <div className="task-chip-val call">0</div>
                    </div>
                    <div className="task-chip">
                      <div className="task-chip-label">Text</div>
                      <div className="task-chip-val text">0</div>
                    </div>
                    <div className="task-chip">
                      <div className="task-chip-label">Email</div>
                      <div className="task-chip-val email">0</div>
                    </div>
                    <div className="task-chip">
                      <div className="task-chip-label">Other</div>
                      <div className="task-chip-val other">0</div>
                    </div>
                  </div>
                  <div className="no-data">Nothing on your to-do list yet — Enjoy your day!</div>
                </div>

              </div>
            </div>

            {/* CRM ICON STRIP */}
            <div id="crm-icon-strip">
              <div className="crm-strip-btn" title="AI Features">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74z" />
                </svg>
              </div>
              <div className="crm-strip-btn" title="Calls">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.82a2 2 0 012-2.18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L9.91 14.91a16 16 0 006.29 6.29l1.42-1.42a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
              </div>
              <div className="crm-strip-btn" title="Inbox">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                  <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
                </svg>
              </div>
              <div className="crm-strip-divider" />
              <div className="crm-strip-btn" title="Notifications">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
              </div>
              <div className="crm-strip-btn" title="Help">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div className="crm-strip-btn" title="Settings">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
              </div>
            </div>

          </div>
        </div>

        {/* ══ RIGHT PANEL — CHAT + VOICE ══ */}
        <div className={`side-panel${academyOn ? " open" : ""}`} id="right-panel">
          <div className="panel-inner" style={{ padding: 0 }}>
            <div className="rp-inner">

              {/* Chat messages */}
              <div className="rp-chat-area" id="chat-messages" ref={chatAreaRef}>
                <div className="rp-heading">
                  AI Tutor Chat
                  <span
                    id="voice-toggle-btn"
                    onClick={toggleVoiceMode}
                    title="Toggle voice mode"
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "10px",
                      fontWeight: 600,
                      color: voiceOn ? "#fff" : "var(--gray-500)",
                      letterSpacing: 0,
                      textTransform: "none",
                      padding: "2px 7px",
                      background: voiceOn ? "var(--blue)" : "var(--gray-100)",
                      borderRadius: "10px",
                      border: `1px solid ${voiceOn ? "var(--blue)" : "var(--border)"}`,
                      transition: "all 0.18s",
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                      <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
                    </svg>
                    Voice
                  </span>
                </div>

                {chatMessages.map((msg, i) => (
                  <div key={i} className={`chat-bubble${msg.type === "ai" ? " ai" : ""}`}>
                    {msg.type === "ai" && <div className="ai-tag">🤖 AI Tutor</div>}
                    {msg.html
                      ? <span dangerouslySetInnerHTML={{ __html: msg.text }} />
                      : msg.text}
                  </div>
                ))}
              </div>

              {/* Voice mode panel */}
              <div className={`voice-mode-panel${voiceOn ? " open" : ""}`} id="voice-mode-panel">
                <div
                  className={`voice-orb${isListening ? " listening" : ""}`}
                  id="voice-orb"
                  onClick={toggleListening}
                  title="Tap to speak"
                  style={{
                    background: isListening ? "var(--blue)" : "var(--white)",
                    borderColor: isListening ? "var(--indigo-dark)" : "var(--blue)",
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={isListening ? "#fff" : "var(--blue)"}
                    strokeWidth="2"
                    style={{ width: 20, height: 20 }}
                  >
                    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                    <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
                  </svg>
                </div>
                <div className="voice-mode-label" style={{ color: "var(--blue)" }}>
                  {isListening ? "Listening…" : "Tap to speak"}
                </div>
                <div className="voice-mode-tip">Your voice will be transcribed into the chat</div>
              </div>

              {/* Chat input */}
              <div className="rp-chat-input-area">
                <div className="voice-row">
                  <span className="voice-row-label">Ask your AI Tutor anything</span>
                </div>
                <div className="chat-input-row">
                  <textarea
                    ref={chatTextareaRef}
                    className="chat-input"
                    id="chat-input-box"
                    placeholder="Type your question..."
                    rows={1}
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={handleChatKey}
                  />
                  <button className="chat-send" onClick={sendChat}>↑</button>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
