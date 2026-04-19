const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/* ═══════════════════════════════════════
   CRM SCHEMA — tells Gemini what it can see and do
   ═══════════════════════════════════════ */

const CRM_SCHEMA = {
  views: {
    dashboard: {
      description:
        "Main CRM dashboard — greeting, cards, and widgets for daily agent workflow",
      elements: {
        "updates-card":
          "New Updates / Announcements card showing latest Lofty features and service offers",
        "update-link":
          "Clickable item linking to Lofty 4.40 feature updates",
        "today-new-leads-card":
          "Card listing today's new leads with names, types, sources, and score badges. Contains Emily Wilson (59), Carlos Garcia (44), Samuel Scott (43)",
        "emily-row":
          "Emily Wilson's row inside Today's New Leads — Renter from Facebook",
        "emily-score":
          "Emily Wilson's lead score badge showing 59 (blue badge)",
        "opportunities-card":
          "Today's Opportunities card with three AI signals: High Interest (0), Likely Sellers (0), Back to Site (0)",
        "nav-links":
          "Top navigation bar: CRM, Sales, Marketing, Content, Automation, Reporting, Marketplace, AI Copilots",
        "nav-crm":
          "CRM link in the top navigation — clicking it returns to the dashboard",
        "nav-automation":
          "Automation link in the top navigation — clicking it goes to Smart Plans page",
      },
    },
    smartPlans: {
      description:
        "Smart Plans page — automated lead-nurturing sequences with email drips and tasks",
      elements: {
        "smart-plans-header":
          "Page title: Smart Plans — Automated lead nurturing sequences",
        "plan-row-0":
          "First plan row: New Buyer Welcome — Active, 45 enrolled, 8 emails, 3 tasks",
        "plan-row-1":
          "Second plan row: Buyer Follow-Up — Active, 28 enrolled, 5 emails, 2 tasks",
        "plan-row-2":
          "Third plan row: Listing Alert Nurture — Paused, 12 enrolled",
        "plan-row-3":
          "Fourth plan row: Open House Follow-Up — Draft, 0 enrolled",
        "create-plan-btn":
          "Button: + Create New Plan — opens the plan creation form",
        "plan-name-input":
          "Input for plan name (visible only when plan creator is open)",
        "plan-trigger":
          "Trigger dropdown: New lead registers / Tag added / Manual assignment (visible when creator is open)",
        "plan-save-btn":
          "Save Plan button (visible when creator is open)",
      },
    },
    people: {
      description:
        "People / Contacts page listing all leads with name, type, source, and AI lead score",
      elements: {
        "lead-maria":
          "Maria Chen — Buyer, Direct source, Score 82 (highest — hot lead)",
        "lead-james":
          "James Park — Seller, Google source, Score 71",
        "lead-emily":
          "Emily Wilson — Renter, Facebook source, Score 59. Clicking her opens the lead detail drawer.",
        "lead-carlos":
          "Carlos Garcia — Other, Zillow source, Score 44",
        "lead-samuel":
          "Samuel Scott — Buyer, YouTube source, Score 43",
        "score-breakdown":
          "Emily's lead score breakdown panel (visible only in the lead drawer): bar chart, Website Activity (12 visits), Listing Views (5 saved), Email Engagement (3 opened), Response Time (< 2hr)",
        "lead-analysis":
          "Emily's Lead Analysis (visible only in the lead drawer): high engagement with 3-bedroom downtown properties, trend rising 35% this week",
      },
    },
    releaseDetail: {
      description:
        "Lofty 4.40 release notes detail page showing feature update cards",
      elements: {
        "feature-sales-agent":
          "Sales Agent: Digital Employee — AI that handles initial conversations, qualifies prospects, follows up 24/7. Tag: NEW",
        "feature-smart-plan-perf":
          "Smart Plan Performance — enhanced reporting with conversion metrics, engagement rates, ROI. Tag: UPDATED",
        "feature-transaction":
          "Transaction Lead Portal — dedicated portal for transaction leads to track deals. Tag: NEW",
      },
    },
  },
  navigationActions: {
    dashboard: "Main dashboard with widgets and today's activity",
    smartPlans: "Smart Plans / Automation page",
    people: "People / Contacts page with all leads",
    releaseDetail: "Lofty 4.40 release notes detail page",
  },
  clickEffects: {
    navigate:
      "Pass a view name (dashboard, smartPlans, people, releaseDetail) to navigate",
    showDrawer:
      "Set to true to open Emily Wilson's lead profile drawer (use after navigating to people and targeting lead-emily)",
    showCreator:
      "Set to true to open the Smart Plan creator form (use on smartPlans view)",
  },
};

const SYSTEM_PROMPT = `You are the AI Tutor for Lofty Academy — an interactive product education layer for the Lofty real estate CRM platform.

You are controlling a LIVE CRM interface. When the user asks a question, you respond with a sequence of visual actions that guide the user through the CRM — moving an AI cursor, highlighting elements, clicking things, and narrating.

## Available Action Types

1. **"navigate"** — Switch the CRM to a different view.
   Format: { "type": "navigate", "view": "dashboard" }

2. **"highlight"** — Move the AI cursor to an element and surround it with a glowing highlight ring. Include a narration to explain.
   Format: { "type": "highlight", "target": "element-id", "narration": "Explanation..." }

3. **"click"** — Click an element (shows a click pulse animation). Can include an effect object.
   Format: { "type": "click", "target": "element-id", "effect": { "navigate": "people" } }
   Possible effects: { "navigate": "viewName" }, { "showDrawer": true }, { "showCreator": true }

4. **"narrate"** — Display/speak a message without pointing at anything.
   Format: { "type": "narrate", "text": "Let me explain..." }

## CRM Schema — What Elements Exist

${JSON.stringify(CRM_SCHEMA, null, 2)}

## Important Rules

- ALWAYS respond with valid JSON matching this format: { "actions": [...] }
- Navigate to the correct view FIRST if the element you want is in a different view
- Use "narrate" to introduce what you're about to show, then "highlight" or "click" to show it
- Keep narrations conversational, friendly, and educational (you are an onboarding tutor)
- If the user asks about a concept (like "lead score"), navigate to where it's visible and point at it
- If the user asks about a feature (like "Smart Plans"), navigate there and walk through key elements
- To show Emily's full profile: navigate to people → click lead-emily with { "showDrawer": true } → highlight score-breakdown
- To show the plan creator: navigate to smartPlans → click create-plan-btn with { "showCreator": true }
- Maximum 6 actions per response to keep it focused
- If the question is completely unrelated to Lofty CRM, respond with a single narrate action
- Do NOT include markdown code fences or any text outside the JSON

## Lofty Knowledge

- Lead Scores range from 0-100, calculated by AI from website visits, listing views, email opens, response times
- Smart Plans automate lead nurturing with email drip sequences and tasks
- Today's Opportunities tracks three AI signals: High Interest buyers, Likely Sellers, and leads returning to the site
- The Sales Agent (Digital Employee) in 4.40 handles initial conversations and follow-ups 24/7
- The CRM dashboard is the agent's home base for daily workflow`;

/* ═══════════════════════════════════════
   HANDLER
   ═══════════════════════════════════════ */

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    return jsonResponse(
      { error: "Missing GEMINI_API_KEY secret." },
      500,
    );
  }

  const body = await req.json().catch(() => ({}));
  const question = String(body.question || "").trim();
  const currentView = String(body.currentView || "dashboard");
  const lessonContext = body.lessonContext || null;

  if (!question) {
    return jsonResponse({ error: "Question is required." }, 400);
  }

  const model = "gemini-2.5-flash";
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const userMessage = `Current CRM view: ${currentView}
${lessonContext ? `Currently running lesson: "${lessonContext}"` : "No lesson is active."}

User's question: "${question}"

Respond with the JSON action sequence to visually answer this question in the CRM.`;

  const geminiResponse = await fetch(geminiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: "model",
          parts: [
            {
              text: JSON.stringify({
                actions: [
                  {
                    type: "narrate",
                    text: "I'm your Lofty Academy AI Tutor. I can navigate the CRM, click things, and highlight features to answer your questions visually. Ask me anything about Lofty!",
                  },
                ],
              }),
            },
          ],
        },
        {
          role: "user",
          parts: [{ text: userMessage }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!geminiResponse.ok) {
    const errText = await geminiResponse.text();
    return jsonResponse(
      {
        error: `Gemini API error (${geminiResponse.status}): ${errText.slice(0, 300)}`,
      },
      502,
    );
  }

  const geminiData = await geminiResponse.json();
  const rawText =
    geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  if (!rawText) {
    return jsonResponse(
      { error: "Empty response from Gemini." },
      502,
    );
  }

  try {
    const parsed = JSON.parse(rawText);
    return jsonResponse(parsed);
  } catch {
    return jsonResponse(
      { error: "Gemini returned invalid JSON.", raw: rawText.slice(0, 500) },
      502,
    );
  }
}
