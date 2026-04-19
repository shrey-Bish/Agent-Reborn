import { insforge, isInsforgeConfigured } from "./insforgeClient";

export { isInsforgeConfigured };

export const DEMO_USER_EMAIL = "shrey@lofty.demo";

export const FALLBACK_DEMO_PROFILES = [
  {
    email: "shrey@lofty.demo",
    name: "Shrey Demo",
    role: "agent",
  },
  {
    email: "pm@agentreborn.demo",
    name: "Agent Reborn PM",
    role: "admin",
  },
];

function requireInsforge() {
  if (!insforge) {
    throw new Error("Missing VITE_INSFORGE_BASE_URL or VITE_INSFORGE_ANON_KEY.");
  }

  return insforge;
}

function assertOk(result, fallbackMessage) {
  if (result.error) {
    throw new Error(result.error.message || fallbackMessage);
  }

  return result.data || [];
}

export function findLessonBySourceType(lessons, sourceType) {
  return (
    lessons.find((lesson) => lesson.lesson_json?.sourceType === sourceType) ||
    lessons.find((lesson) => lesson.lesson_json?.source_type === sourceType) ||
    null
  );
}

export async function fetchBackendSnapshot() {
  const client = requireInsforge();

  const [lessonsResult, sourcesResult, questionsResult, progressResult] =
    await Promise.all([
      client.database
        .from("lessons")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false }),
      client.database
        .from("content_sources")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false }),
      client.database
        .from("qa_events")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .limit(5),
      client.database
        .from("lesson_progress")
        .select("*", { count: "exact" })
        .order("updated_at", { ascending: false })
        .limit(5),
    ]);

  const lessons = assertOk(lessonsResult, "Unable to load lessons.");
  const sources = assertOk(sourcesResult, "Unable to load content sources.");
  const recentQuestions = assertOk(questionsResult, "Unable to load Q&A events.");
  const recentProgress = assertOk(progressResult, "Unable to load lesson progress.");

  return {
    lessons,
    sources,
    recentQuestions,
    recentProgress,
    lessonCount: lessonsResult.count ?? lessons.length,
    sourceCount: sourcesResult.count ?? sources.length,
    questionCount: questionsResult.count ?? recentQuestions.length,
    progressCount: progressResult.count ?? recentProgress.length,
    storageArtifactCount: sources.filter((source) => source.storage_path).length,
  };
}

export async function fetchDemoProfiles() {
  if (!isInsforgeConfigured) return FALLBACK_DEMO_PROFILES;

  const client = requireInsforge();
  const result = await client.database
    .from("profiles")
    .select("email, name, role")
    .order("role", { ascending: true });

  const profiles = assertOk(result, "Unable to load demo profiles.");
  return profiles.length ? profiles : FALLBACK_DEMO_PROFILES;
}

export async function recordLessonProgress({
  lessonId,
  currentStep,
  userEmail = DEMO_USER_EMAIL,
  completed = false,
}) {
  if (!lessonId || !isInsforgeConfigured) return null;

  const client = requireInsforge();
  const result = await client.database
    .from("lesson_progress")
    .insert({
      user_email: userEmail,
      lesson_id: lessonId,
      current_step: currentStep,
      completed,
    })
    .select()
    .single();

  return assertOk(result, "Unable to record lesson progress.");
}

export async function recordQuestionEvent({
  lessonId,
  question,
  answerSummary,
  sourceScreen,
  userEmail = DEMO_USER_EMAIL,
}) {
  if (!isInsforgeConfigured) return null;

  const client = requireInsforge();
  const result = await client.database
    .from("qa_events")
    .insert({
      user_email: userEmail,
      lesson_id: lessonId || null,
      question,
      answer_summary: answerSummary,
      source_screen: sourceScreen,
    })
    .select()
    .single();

  return assertOk(result, "Unable to record Q&A event.");
}

export async function generateLessonFromContent(source) {
  const client = requireInsforge();
  const result = await client.functions.invoke("generate-lesson", {
    body: source,
  });

  if (result.error) {
    throw new Error(result.error.message || "Unable to generate lesson.");
  }

  return result.data;
}

export async function publishLesson(lessonId) {
  if (!lessonId || !isInsforgeConfigured) return null;

  const client = requireInsforge();
  const result = await client.database
    .from("lessons")
    .update({ published: true })
    .eq("id", lessonId)
    .select()
    .single();

  return assertOk(result, "Unable to publish lesson.");
}

export async function synthesizeLessonSpeech(text) {
  const client = requireInsforge();
  const result = await client.functions.invoke("speak-lesson", {
    body: { text },
  });

  if (result.error) {
    throw new Error(result.error.message || "Unable to synthesize lesson voice.");
  }

  return result.data;
}
