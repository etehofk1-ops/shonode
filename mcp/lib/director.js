// lib/director.js
// Pure (fetch-free) port of ai-client.js's AI-director intelligence:
// prompt + response schema + Gemini-JSON parser. Text-brief only (no inline
// reference images). Kept unit-testable; the Gemini call lives in lib/gemini.js.
import { buildProject, buildPanel, buildSnapshot } from "./shonode.js";

const str = (v) => (typeof v === "string" ? v : "");

export function buildReferenceCatalog(referenceImages) {
  if (!Array.isArray(referenceImages) || referenceImages.length === 0) {
    return "- none";
  }
  return referenceImages
    .map((image, index) => {
      const width = Number(image?.width) || "?";
      const height = Number(image?.height) || "?";
      return `- [${index}] ${image?.name || `reference-${index + 1}.jpg`} (${width}x${height})`;
    })
    .join("\n");
}

export function normalizeReferenceImageIndexes(referenceImageIndexes, referenceImageIndex) {
  const values = Array.isArray(referenceImageIndexes)
    ? referenceImageIndexes
    : Number.isInteger(referenceImageIndex)
      ? [referenceImageIndex]
      : [];
  return values.filter(
    (value, index, items) => Number.isInteger(value) && value >= 0 && items.indexOf(value) === index
  );
}

export function inferImagePromptMode(cut, referenceImageIndexes) {
  const idx = referenceImageIndexes ?? normalizeReferenceImageIndexes(cut?.referenceImageIndexes, cut?.referenceImageIndex);
  const explicit = typeof cut?.imagePromptMode === "string" ? cut.imagePromptMode.trim().toLowerCase() : "";
  if (explicit === "i2i" || explicit === "t2i") return explicit;
  return idx.length > 0 || (typeof cut?.i2iPrompt === "string" && cut.i2iPrompt.trim()) ? "i2i" : "t2i";
}

// ctx: { title, sequence, runtime, tone, aspectRatio, logline, notes, currentPanelCount }
export function buildDirectorPrompt(brief, ctx = {}) {
  const project = ctx || {};
  const existingCount = Number(ctx?.currentPanelCount) || 0;
  return [
    "You are an AI storyboard planner for short commercial videos.",
    "Read the user's vague Korean brief and convert it into a practical storyboard plan.",
    "Return only valid JSON matching the provided schema.",
    "",
    "Requirements:",
    "- Infer an appropriate number of cuts for a 15-30 second commercial unless the brief explicitly requests something else.",
    "- Write concise but production-usable shot descriptions.",
    "- summary, sceneTitle, durationLabel, and caption must be written in natural Korean.",
    "- durationLabel should be written naturally in Korean and indicate the rough shot length.",
    "- caption should naturally mention how many seconds this shot roughly takes.",
    "- This request has NO attached reference images. Use imagePromptMode 't2i' for every cut and write a t2iPrompt; leave i2iPrompt as an empty string.",
    "- Return referenceImageIndexes as an empty array and referenceImageIndex as -1.",
    "- imagePromptMode, t2iPrompt, i2vStartPrompt, i2vMotionPrompt, and i2vEndPrompt must be written in strong production-friendly English for image and video generation.",
    "- projectDraft.title, sequence, runtime, tone, logline, and notes must be filled in Korean for the left sidebar.",
    "- projectDraft.notes should include camera movement, emotional flow, visual tone, or edit direction.",
    "- Write I2V prompts for Kling or Higgsfield using start frame, motion, and end frame fields.",
    "- Keep prompts visually specific, ad-ready, and sequenced so each shot can flow smoothly into the next one.",
    "- For I2V, make the start, motion, and end prompts continue naturally into the next cut.",
    "- If preview video or poster URLs do not exist, return empty strings.",
    "",
    "Project context:",
    `- title: ${project.title || ""}`,
    `- sequence: ${project.sequence || ""}`,
    `- runtime: ${project.runtime || ""}`,
    `- tone: ${project.tone || ""}`,
    `- aspectRatio: ${project.aspectRatio || ""}`,
    `- logline: ${project.logline || ""}`,
    `- notes: ${project.notes || ""}`,
    `- currentPanelCount: ${existingCount}`,
    "",
    "User brief:",
    str(brief),
  ].join("\n");
}

export const DIRECTOR_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    projectDraft: {
      type: "object",
      properties: {
        title: { type: "string" },
        sequence: { type: "string" },
        runtime: { type: "string" },
        tone: { type: "string" },
        logline: { type: "string" },
        notes: { type: "string" },
      },
      required: ["title", "sequence", "runtime", "tone", "logline", "notes"],
    },
    cuts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          sceneTitle: { type: "string" },
          durationLabel: { type: "string" },
          caption: { type: "string" },
          imagePromptMode: { type: "string" },
          i2iPrompt: { type: "string" },
          t2iPrompt: { type: "string" },
          i2vStartPrompt: { type: "string" },
          i2vMotionPrompt: { type: "string" },
          i2vEndPrompt: { type: "string" },
        },
        required: [
          "sceneTitle",
          "durationLabel",
          "caption",
          "imagePromptMode",
          "t2iPrompt",
          "i2vStartPrompt",
          "i2vMotionPrompt",
          "i2vEndPrompt",
        ],
      },
    },
  },
  required: ["summary", "projectDraft", "cuts"],
};

export function buildDirectorRequest(brief, ctx = {}) {
  return {
    contents: [{ role: "user", parts: [{ text: buildDirectorPrompt(brief, ctx) }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseJsonSchema: DIRECTOR_RESPONSE_SCHEMA,
    },
  };
}

// Parse Gemini generateContent JSON -> { summary, projectDraft, cuts }.
// Each cut is shaped for lib/shonode.js buildPanel (active image prompt in t2iPrompt).
export function mapDirectorResponse(geminiJson) {
  const candidateText = geminiJson?.candidates?.[0]?.content?.parts
    ?.map((part) => part?.text || "")
    .join("")
    .trim();
  if (!candidateText) {
    throw new Error("Gemini returned no text content.");
  }
  let parsed;
  try {
    parsed = JSON.parse(candidateText);
  } catch (e) {
    throw new Error(`Gemini JSON parse failed: ${e.message}`);
  }

  const cuts = Array.isArray(parsed?.cuts)
    ? parsed.cuts.map((cut) => {
        const refIdx = normalizeReferenceImageIndexes(cut?.referenceImageIndexes, cut?.referenceImageIndex);
        const mode = inferImagePromptMode(cut, refIdx);
        const i2i = str(cut?.i2iPrompt);
        const t2i = str(cut?.t2iPrompt);
        // panel stores one image prompt (t2iPrompt). Use the active one.
        const imagePrompt = mode === "i2i" ? i2i || t2i : t2i || i2i;
        return {
          sceneTitle: str(cut?.sceneTitle),
          durationLabel: str(cut?.durationLabel),
          caption: str(cut?.caption),
          imagePromptMode: mode,
          t2iPrompt: imagePrompt,
          i2vStartPrompt: str(cut?.i2vStartPrompt),
          i2vMotionPrompt: str(cut?.i2vMotionPrompt),
          i2vEndPrompt: str(cut?.i2vEndPrompt),
        };
      })
    : [];

  return {
    summary: str(parsed?.summary),
    projectDraft: parsed?.projectDraft && typeof parsed.projectDraft === "object" ? parsed.projectDraft : {},
    cuts,
  };
}

// Compose a full importable .shonode snapshot from a director result.
// aspectRatio comes from the explicit arg (projectDraft has no aspectRatio).
export function directorResultToSnapshot(result, { title, aspectRatio } = {}) {
  const draft = result?.projectDraft || {};
  const project = buildProject({
    title: title || draft.title,
    sequence: draft.sequence,
    runtime: draft.runtime,
    tone: draft.tone,
    aspectRatio,
    logline: draft.logline,
    notes: draft.notes,
  });
  const panels = (Array.isArray(result?.cuts) ? result.cuts : []).map((cut, i) => buildPanel(cut, i));
  return buildSnapshot({ project, panels });
}
