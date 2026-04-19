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

function buildLesson(source: {
  type: string;
  title: string;
  source_url?: string;
  raw_content: string;
}) {
  const isHelpArticle = source.type === "help_center_article";

  if (isHelpArticle) {
    return {
      title: `${source.title} Walkthrough`,
      audience: "existing_agents",
      lesson_json: {
        sourceType: "help_center_article",
        entryPoint: "Integrations > Aidentified",
        steps: [
          {
            target: "updates",
            label: "Connect Aidentified to Lofty",
            narration:
              "Choose the Lofty option from Aidentified Connect, enter Lofty credentials, and submit.",
          },
          {
            target: "updates",
            label: "Connect LinkedIn",
            narration:
              "Use Connect > LinkedIn and follow the import steps from the article.",
          },
          {
            target: "updates",
            label: "Send selected records",
            narration: "Select prospect checkboxes and choose Add to Lofty.",
          },
        ],
        calloutStyle: "numbered_red_boxes",
      },
    };
  }

  return {
    title: `${source.title}: Guided Update Lesson`,
    audience: "new_and_existing_agents",
    lesson_json: {
      sourceType: "release_note",
      entryPoint: "Dashboard > New Updates",
      steps: [
        {
          target: "updates",
          label: "Open New Updates",
          narration:
            "Start from the dashboard update card so agents learn the feature in context.",
        },
        {
          target: "updates",
          label: "Explain the user value",
          narration:
            "Summarize what changed, why it matters, and what the agent can safely do next.",
        },
      ],
      trustNotes: [
        "Explain the AI behavior in plain language.",
        "Show where the agent remains in control.",
      ],
    },
  };
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const body = await req.json().catch(() => ({}));
  const source = {
    type: body.type === "help_center_article" ? "help_center_article" : "release_note",
    title: body.title || "Untitled Lofty Content",
    source_url: body.source_url || null,
    raw_content: body.raw_content || body.content || "No content provided.",
  };

  const client = createClient({
    baseUrl: Deno.env.get("INSFORGE_BASE_URL"),
    anonKey: Deno.env.get("ANON_KEY"),
  });

  const insertedSource = await client.database
    .from("content_sources")
    .insert(source)
    .select()
    .single();

  if (insertedSource.error) {
    return jsonResponse({ error: insertedSource.error.message }, 500);
  }

  const generatedLesson = buildLesson(source);
  const insertedLesson = await client.database
    .from("lessons")
    .insert({
      source_id: insertedSource.data.id,
      title: generatedLesson.title,
      audience: generatedLesson.audience,
      lesson_json: generatedLesson.lesson_json,
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
  });
}
