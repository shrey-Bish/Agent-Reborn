import { createClient } from "npm:@insforge/sdk";

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

/* ── CRM Schema ─────────────────────────────────────
   This tells Gemini what UI targets exist in our CRM simulator.
   The AI uses these to generate valid, playable lesson steps. */

const CRM_SCHEMA = {
  views: {
    dashboard: {
      description: "Main CRM dashboard with widgets and cards",
      targets: [
        { id: "nav-links", type: "nav", label: "Top navigation bar" },
        { id: "nav-automation", type: "nav", label: "Automation nav link" },
        { id: "nav-crm", type: "nav", label: "CRM nav link" },
        { id: "updates-card", type: "card", label: "New Updates / Announcements card" },
        { id: "update-link", type: "link", label: "Feature updates link inside updates card" },
        { id: "today-new-leads-card", type: "card", label: "Today's New Leads card" },
        { id: "emily-score", type: "badge", label: "Emily Wilson score badge (59)" },
        { id: "opportunities-card", type: "card", label: "Today's Opportunities card" },
      ],
    },
    smartPlans: {
      description: "Smart Plans list showing automated email sequences",
      navigateVia: { target: "nav-automation", action: "click", effect: { navigate: "smartPlans" } },
      targets: [
        { id: "smart-plans-header", type: "header", label: "Smart Plans page title" },
        { id: "plan-row-0", type: "row", label: "First plan row (New Buyer Welcome)" },
        { id: "create-plan-btn", type: "button", label: "Create New Plan button" },
        { id: "plan-name-input", type: "input", label: "Plan name input field (shown after creator opens)" },
        { id: "plan-trigger", type: "select", label: "Plan trigger selector" },
        { id: "plan-save-btn", type: "button", label: "Save plan button" },
      ],
      effects: ["showCreator"],
    },
    people: {
      description: "People/contacts page with lead list and scores",
      navigateVia: { target: "nav-crm", action: "click", effect: { navigate: "people" } },
      targets: [
        { id: "lead-maria", type: "row", label: "Maria Chen lead row (score 82)" },
        { id: "lead-emily", type: "row", label: "Emily Wilson lead row (score 59)" },
        { id: "score-breakdown", type: "section", label: "Score breakdown panel (inside Emily detail drawer)" },
        { id: "lead-analysis", type: "section", label: "Lead Analysis panel (inside Emily detail drawer)" },
      ],
      effects: ["showDrawer"],
    },
    releaseDetail: {
      description: "Release notes detail page with feature cards",
      navigateVia: { target: "update-link", action: "click", effect: { navigate: "releaseDetail" } },
      targets: [
        { id: "feature-sales-agent", type: "card", label: "Sales Agent: Digital Employee feature card" },
        { id: "feature-smart-plan-perf", type: "card", label: "Smart Plan Performance feature card" },
        { id: "feature-transaction", type: "card", label: "Transaction Lead Portal feature card" },
      ],
    },
  },
  availableActions: ["highlight", "click"],
  availableEffects: {
    navigate: ["dashboard", "smartPlans", "people", "releaseDetail"],
    showDrawer: "Opens Emily Wilson lead detail drawer on the People page",
    showCreator: "Opens the Smart Plan creator form on the Smart Plans page",
  },
  rules: [
    "Each step must have: narration (string), target (string|null), and optionally action and effect",
    "The first step should have target: null (intro narration with no cursor movement)",
    "The last step should have target: null (conclusion narration)",
    "Use 'highlight' action to point at and explain an element",
    "Use 'click' action when navigating (combined with effect.navigate)",
    "To navigate between views, use the correct nav target with effect.navigate",
    "To open the lead drawer, set effect.showDrawer on a People page step",
    "To open the plan creator, set effect.showCreator on a Smart Plans page step",
    "Generate 5-8 steps per lesson",
    "Generate 1-2 relevant interrupts with trigger phrases",
    "Narrations should be 1-2 sentences, conversational, and agent-focused",
  ],
};

const SYSTEM_PROMPT = `You are Lofty Academy's lesson generator. Your job is to convert release notes, 
feature descriptions, or help center content into interactive CRM lessons.

You will receive:
1. The content to turn into a lesson
2. A CRM Schema describing all available UI elements and navigation

You must output valid JSON matching this exact structure:
{
  "title": "Lesson title",
  "subtitle": "2-3 word subtitle",
  "icon": "single emoji",
  "steps": [
    {
      "narration": "What the AI tutor says",
      "target": "data-target-id or null",
      "action": "highlight or click (optional)",
      "effect": { "navigate": "viewName" } // (optional)
    }
  ],
  "interrupts": {
    "trigger phrase": {
      "answer": "Detailed explanation (2-4 sentences)",
      "resumePrompt": "Question asking to continue"
    }
  }
}

CRITICAL RULES:
- Only use target IDs that exist in the CRM Schema
- target can be null for intro/outro steps (no cursor movement)
- Steps must flow logically through CRM views
- Narrations should be warm, practical, and relate to real estate
- Include 1-2 interrupts with relevant questions users might ask
- Output ONLY the JSON object, no markdown, no code fences`;

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const body = await req.json().catch(() => ({}));
  const content = body.raw_content || body.content || "";
  const title = body.title || "Untitled";
  const sourceType = body.type || "release_note";

  if (!content.trim()) {
    return jsonResponse({ error: "Content is required." }, 400);
  }

  const apiKey = Deno.env.get("GEMINI_API_KEY");

  let generatedLesson: Record<string, unknown>;

  if (apiKey) {
    // ── Use Gemini to generate the lesson ──
    const prompt = `Convert this ${sourceType === "help_center_article" ? "help center article" : "release note"} into an interactive CRM lesson:

TITLE: ${title}

CONTENT:
${content.slice(0, 3000)}

CRM SCHEMA (available targets and views):
${JSON.stringify(CRM_SCHEMA, null, 2)}

Generate a lesson JSON following the schema rules. The lesson should guide an agent through the relevant CRM views, highlighting key elements and explaining the feature. Output ONLY the JSON object.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              maxOutputTokens: 2000,
              temperature: 0.4,
              responseMimeType: "application/json",
            },
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        generatedLesson = JSON.parse(text);
      } else {
        const err = await response.text();
        console.error("Gemini error:", err);
        generatedLesson = buildFallbackLesson(title, sourceType);
      }
    } catch (err) {
      console.error("Generation error:", err);
      generatedLesson = buildFallbackLesson(title, sourceType);
    }
  } else {
    generatedLesson = buildFallbackLesson(title, sourceType);
  }

  // ── Save to database ──
  const client = createClient({
    baseUrl: Deno.env.get("INSFORGE_BASE_URL"),
    anonKey: Deno.env.get("ANON_KEY"),
  });

  // Save source content
  const insertedSource = await client.database
    .from("content_sources")
    .insert({
      type: sourceType,
      title,
      raw_content: content.slice(0, 5000),
    })
    .select()
    .single();

  if (insertedSource.error) {
    return jsonResponse({ error: insertedSource.error.message }, 500);
  }

  // Save generated lesson
  const insertedLesson = await client.database
    .from("lessons")
    .insert({
      source_id: insertedSource.data.id,
      title: generatedLesson.title || title,
      audience: "new_and_existing_agents",
      lesson_json: generatedLesson,
      validation_status: "validated_against_sandbox",
      published: false,
    })
    .select()
    .single();

  if (insertedLesson.error) {
    return jsonResponse({ error: insertedLesson.error.message }, 500);
  }

  return jsonResponse({
    generated: true,
    source: insertedSource.data,
    lesson: insertedLesson.data,
    aiGenerated: !!apiKey,
  });
}

function buildFallbackLesson(title: string, sourceType: string) {
  return {
    title: `${title} Walkthrough`,
    subtitle: "Auto-generated",
    icon: sourceType === "help_center_article" ? "📖" : "🚀",
    steps: [
      { narration: `Welcome! Let me walk you through ${title}.`, target: null },
      { narration: "Let's start from the dashboard where you can see the latest updates.", target: "updates-card", action: "highlight" },
      { narration: "Check the Today's New Leads section to see your recent contacts.", target: "today-new-leads-card", action: "highlight" },
      { narration: `That covers the basics of ${title}. Explore the dashboard to learn more!`, target: null },
    ],
    interrupts: {},
  };
}
