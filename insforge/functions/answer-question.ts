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

const SYSTEM_PROMPT = `You are Lofty Academy's AI Tutor — an expert on Lofty CRM for real estate agents.
You are currently guiding an agent through an interactive product lesson inside the Lofty CRM.

Your personality:
- Warm, knowledgeable, and practical
- You explain AI features in terms agents understand
- You use real estate examples (leads, listings, follow-ups, closings)
- You build trust by being transparent about what AI does vs what the agent controls

Key Lofty features you know about:
- Smart Plans: Automated email drip campaigns triggered by lead actions
- Lead Score: AI-calculated 0-100 engagement score based on website visits, email opens, listing views, response time
- AI Copilots: AI-powered writing and scheduling assistants
- People Page: Contact database with filters, tags, and scores
- Today's Opportunities: AI-prioritized leads showing high-interest, likely sellers, and back-to-site signals
- Release 4.40: Sales Agent as Digital Employee, Smart Plan Performance reporting, Transaction Lead Portal

Rules:
- Keep answers concise: 2-4 sentences max
- Always relate your answer back to how it helps the agent close deals
- If you don't know something specific about Lofty, give a helpful general answer
- Never mention that you are an AI language model or that you lack access`;

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    return jsonResponse({
      answer: "That's a great question! I'd love to explain more, but my AI service is currently being configured. Try asking about 'smart plans' or 'lead score' — I have detailed walkthroughs ready for those topics.",
      source: "fallback",
    });
  }

  const body = await req.json().catch(() => ({}));
  const question = String(body.question || "").trim();
  const lessonContext = String(body.lessonContext || "general");
  const currentStep = Number(body.currentStep || 0);

  if (!question) {
    return jsonResponse({ error: "Question is required." }, 400);
  }

  const contextNote = lessonContext !== "general"
    ? `\nThe user is currently in a lesson about: ${lessonContext} (step ${currentStep}).`
    : "";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT + contextNote }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: question }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 250,
            temperature: 0.7,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini error:", errorText);
      return jsonResponse({
        answer: "That's a great question! Let me help you with that. Could you try rephrasing, or ask about a specific Lofty feature like Smart Plans or Lead Scoring?",
        source: "error-fallback",
      });
    }

    const data = await response.json();
    const answer =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "Great question! I'd recommend exploring that feature in your Lofty dashboard. Want me to continue with the lesson?";

    return jsonResponse({
      answer,
      source: "ai",
      model: "gemini-2.0-flash",
    });
  } catch (err) {
    console.error("answer-question error:", err);
    return jsonResponse({
      answer: "Interesting question! While I process that, feel free to ask about Smart Plans, Lead Scoring, or any feature you see on screen.",
      source: "error-fallback",
    });
  }
}
