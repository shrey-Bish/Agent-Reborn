/* ═══════════════════════════════════════
   GEMINI CLIENT — Live DOM + Search Grounding
   ═══════════════════════════════════════ */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

export const isGeminiConfigured = Boolean(GEMINI_API_KEY);

/* ══════════════════════════════
   LIVE DOM SCHEMA BUILDER
   Scans the actual DOM for all data-target elements
   so the schema always reflects current UI state.
   ══════════════════════════════ */

function buildLiveDomSchema() {
  const elements = document.querySelectorAll("[data-target]");
  const liveElements = {};

  elements.forEach((el) => {
    const target = el.getAttribute("data-target");
    const rect = el.getBoundingClientRect();
    const isVisible = rect.width > 0 && rect.height > 0;

    // Get clean text content (collapse whitespace, limit length)
    const rawText = el.textContent || "";
    const cleanText = rawText.replace(/\s+/g, " ").trim().substring(0, 150);

    liveElements[target] = {
      text: cleanText,
      visible: isVisible,
      tag: el.tagName.toLowerCase(),
    };
  });

  return liveElements;
}

/* ══════════════════════════════
   STATIC CONTEXT
   Structural info that doesn't change per render
   ══════════════════════════════ */

const VIEW_DESCRIPTIONS = {
  dashboard:
    "Main CRM dashboard — agent greeting, New Updates/Announcements card, Today's New Leads card with lead scores, Today's Opportunities (High Interest / Likely Sellers / Back to Site), Need Keep In Touch, Transactions, Today's Tasks",
  smartPlans:
    "Smart Plans page — automated lead-nurturing sequences table with plan names, status, enrolled counts, email/task counts, and a Create New Plan button",
  people:
    "People / Contacts page — searchable lead list with name, type, source, and AI lead score. Clicking Emily Wilson opens her detail drawer with score breakdown and lead analysis",
  releaseDetail:
    "Lofty 4.40 release notes page — feature cards for Sales Agent Digital Employee, Smart Plan Performance, Transaction Lead Portal, Smarter AI Conversations, Transaction Role Defaults",
};

const NAVIGATION_ACTIONS = {
  dashboard: "Navigate to the main dashboard",
  smartPlans: "Navigate to Smart Plans / Automation page",
  people: "Navigate to People / Contacts page",
  releaseDetail: "Navigate to Lofty 4.40 release detail page",
};

const CLICK_EFFECTS = {
  navigate: "Pass a view name (dashboard, smartPlans, people, releaseDetail)",
  showDrawer:
    "Set to true to open Emily Wilson's lead profile drawer (use on people view after targeting lead-emily)",
  showCreator:
    "Set to true to open the Smart Plan creator form (use on smartPlans view)",
};

/* ══════════════════════════════
   SYSTEM PROMPT BUILDER
   ══════════════════════════════ */

function buildSystemPrompt(liveSchema, currentView) {
  return `You are the AI Tutor for Lofty Academy — an interactive product education layer for the Lofty real estate CRM platform (help.lofty.com).

You are controlling a LIVE CRM interface. When the user asks a question, you respond with a sequence of visual actions that guide the user through the CRM — moving an AI cursor, highlighting elements, clicking things, and narrating.

You have access to Google Search. When the user asks about Lofty features or concepts you want more detail on, search help.lofty.com for accurate, up-to-date information. Use those search results to provide specific, knowledgeable answers — not generic ones.

## Available Action Types

1. **"navigate"** — Switch the CRM to a different view.
   Format: { "type": "navigate", "view": "dashboard" }
   Available views: ${JSON.stringify(NAVIGATION_ACTIONS)}

2. **"highlight"** — Move the AI cursor to an element and surround it with a glowing highlight ring. MUST include a narration.
   Format: { "type": "highlight", "target": "element-id", "narration": "Explanation..." }

3. **"click"** — Click an element (shows a click pulse animation). Can include an effect.
   Format: { "type": "click", "target": "element-id", "effect": { "navigate": "people" } }
   Possible effects: ${JSON.stringify(CLICK_EFFECTS)}

4. **"narrate"** — Display/speak a message without pointing at anything.
   Format: { "type": "narrate", "text": "Let me explain..." }

## Current CRM View: "${currentView}"
${VIEW_DESCRIPTIONS[currentView] || ""}

## Live DOM Elements (scanned in real-time from the actual UI)
The following elements exist RIGHT NOW in the interface. Only target elements that are marked visible: true.

${JSON.stringify(liveSchema, null, 2)}

## Important Rules

- ALWAYS respond with valid JSON: { "actions": [...] }
- ONLY target elements listed in the Live DOM Elements above
- ONLY target elements with visible: true — do NOT target hidden elements
- Navigate to the correct view FIRST if you need elements from a different view
- Every "highlight" action MUST include a "narration" field
- Keep narrations conversational, friendly, and specific — use real Lofty Help Center knowledge when available
- If you searched help.lofty.com, incorporate those details into your narrations
- To show Emily's profile: navigate to people → click lead-emily with { "showDrawer": true } → highlight score-breakdown
- To show the plan creator: navigate to smartPlans → click create-plan-btn with { "showCreator": true }
- Maximum 6 actions per response
- If the question is unrelated to Lofty CRM, respond with a single narrate action
- Do NOT include markdown code fences or any text outside the JSON`;
}

/* ══════════════════════════════
   PARSE GEMINI RESPONSE
   Handles JSON extraction robustly
   ══════════════════════════════ */

function parseGeminiJson(rawText) {
  // Try direct parse first
  try {
    return JSON.parse(rawText);
  } catch {
    // Strip markdown code fences if present
    const cleaned = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    return JSON.parse(cleaned);
  }
}

/* ══════════════════════════════
   API CALL
   ══════════════════════════════ */

export async function askGeminiTutor({ question, currentView, lessonContext }) {
  if (!GEMINI_API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY is not set.");
  }

  // Build live DOM schema by scanning actual elements on screen
  const liveSchema = buildLiveDomSchema();
  const systemPrompt = buildSystemPrompt(liveSchema, currentView);

  const userMessage = `Current CRM view: ${currentView}
${lessonContext ? `Currently running lesson: "${lessonContext}"` : "No lesson is active."}

User's question: "${question}"

Respond with the JSON action sequence to visually answer this question in the CRM. If you need more information about Lofty features, search help.lofty.com first.`;

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [
            {
              text: JSON.stringify({
                actions: [
                  {
                    type: "narrate",
                    text: "I'm your Lofty Academy AI Tutor. I can navigate the CRM, highlight features, and explain everything visually. I also have access to the Lofty Help Center for detailed, accurate information. Ask me anything!",
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
      tools: [{ googleSearch: {} }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(
      `Gemini API error (${response.status}): ${errText.slice(0, 300)}`
    );
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error("Empty response from Gemini.");
  }

  const parsed = parseGeminiJson(rawText);

  // Log grounding metadata if available (useful for debugging)
  const grounding =
    data?.candidates?.[0]?.groundingMetadata;
  if (grounding?.searchEntryPoint || grounding?.groundingChunks?.length) {
    console.log(
      "🔍 Gemini used Google Search grounding:",
      grounding.groundingChunks?.map((c) => c.web?.title).filter(Boolean)
    );
  }

  return parsed;
}
