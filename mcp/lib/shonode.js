// lib/shonode.js
// Pure, dependency-free helpers for the Shonode `.shonode` workspace format.
// Mirrors the shapes produced by the app:
//   - base panel/project: script.js (createEmptyPanel / getDefaultProject / normalizePanel)
//   - prompt-pipeline overrides: shotboard-ai.js (normalizePanel override)
//   - workspace snapshot: shotboard-ai.js (createWorkspaceExportSnapshot)
// Kept free of MCP/SDK imports so it stays unit-testable on its own.

import { readFile } from "node:fs/promises";
import { extname, basename, resolve as resolvePath } from "node:path";

export const SHONODE_VERSION = "shonode-workspace-v1";

// Canvas placement constants (values only affect initial card layout).
const PANEL_MARGIN = 48;
const PANEL_SAFE_TOP = 140;
const PANEL_GAP_X = 360;
const PANEL_GAP_Y = 320;
const DEFAULT_COLUMNS = 4;

// ---- small helpers -------------------------------------------------------
const str = (v) => (typeof v === "string" ? v : "");
const arr = (v) => (Array.isArray(v) ? v.filter((x) => x != null) : []);

export function createId(prefix = "id") {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${t}-${r}`;
}

function defaultPosition(index) {
  const row = Math.floor(index / DEFAULT_COLUMNS);
  const col = index % DEFAULT_COLUMNS;
  return {
    x: PANEL_MARGIN + col * PANEL_GAP_X,
    y: PANEL_SAFE_TOP + row * PANEL_GAP_Y,
  };
}

function indexRefs(referenceImages) {
  const m = new Map();
  for (const r of referenceImages ?? []) {
    if (r && typeof r.id === "string") m.set(r.id, r);
  }
  return m;
}

// ---- builders (for create) ----------------------------------------------
// A full panel = base fields (script.js) + prompt-pipeline fields (shotboard-ai.js).
export function buildPanel(cut = {}, index = 0) {
  const pos = defaultPosition(index);
  return {
    // base (script.js createEmptyPanel)
    id: str(cut.id) || createId("panel"),
    caption: str(cut.caption),
    image: "",
    fileName: "",
    x: Number.isFinite(cut.x) ? cut.x : pos.x,
    y: Number.isFinite(cut.y) ? cut.y : pos.y,
    z: Number.isFinite(cut.z) ? cut.z : index + 1,
    // prompt-pipeline (shotboard-ai.js normalizePanel override)
    sceneTitle: str(cut.scene_title ?? cut.sceneTitle),
    durationLabel: str(cut.duration ?? cut.durationLabel),
    viewMode: ["image", "t2i", "i2v", "vid"].includes(cut.viewMode) ? cut.viewMode : "image",
    imagePromptMode: cut.mode === "t2i" || cut.imagePromptMode === "t2i" ? "t2i" : "i2i",
    t2iCollapsed: false,
    i2vCollapsed: false,
    referenceImageIds: arr(cut.referenceImageIds),
    referenceImageNames: arr(cut.referenceImageNames),
    referenceImageId: "",
    referenceImageName: "",
    t2iPrompt: str(cut.t2i_prompt ?? cut.t2iPrompt),
    i2vStartPrompt: str(cut.i2v?.start ?? cut.i2vStartPrompt),
    i2vMotionPrompt: str(cut.i2v?.motion ?? cut.i2vMotionPrompt),
    i2vEndPrompt: str(cut.i2v?.end ?? cut.i2vEndPrompt),
    i2vOmniPrompt: str(cut.i2v?.omni ?? cut.i2vOmniPrompt),
    identityPackIds: arr(cut.identity_pack_ids ?? cut.identityPackIds),
    nextPanelIds: arr(cut.nextPanelIds),
    videoFileName: "",
  };
}

export function buildProject(opts = {}) {
  return {
    title: str(opts.title) || "새 프로젝트",
    sequence: str(opts.sequence) || "Scene 01",
    runtime: str(opts.runtime),
    tone: str(opts.tone),
    aspectRatio: str(opts.aspectRatio) || "16:9",
    logline: str(opts.logline),
    notes: str(opts.notes),
    checklist: {
      references: false,
      shotFlow: false,
      characterArc: false,
      artDirection: false,
      soundCue: false,
    },
    identityPacks: [],
  };
}

export function buildSnapshot({ project, panels }) {
  return {
    version: SHONODE_VERSION,
    exportedAt: new Date().toISOString(),
    project,
    panels,
    referenceImages: [],
    selection: { panelIds: [] },
    view: { zoom: 1, scrollLeft: 0, scrollTop: 0 },
    sidebar: {
      leftSections: [],
      rightSections: [],
      leftRailCollapsed: false,
      rightRailCollapsed: false,
    },
  };
}

// Build a complete, importable `.shonode` snapshot from a high-level cut list.
// `next` entries may be 0-based cut indices or explicit panel ids.
export function createProject({ title, aspectRatio, cuts = [] } = {}) {
  const panels = cuts.map((c, i) => buildPanel({ ...c, nextPanelIds: [] }, i));
  cuts.forEach((c, i) => {
    panels[i].nextPanelIds = arr(c.next)
      .map((n) => {
        if (typeof n === "number" && panels[n]) return panels[n].id;
        if (typeof n === "string") return n;
        return null;
      })
      .filter(Boolean);
  });
  return buildSnapshot({ project: buildProject({ title, aspectRatio }), panels });
}

// ---- read / summarize ----------------------------------------------------
export async function readShonode(path) {
  let raw;
  try {
    raw = await readFile(path, "utf8");
  } catch (e) {
    throw new Error(`Cannot read file at "${path}": ${e.code === "ENOENT" ? "file not found" : e.message}`);
  }
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    throw new Error(`File at "${path}" is not valid JSON: ${e.message}`);
  }
  if (!data || typeof data !== "object" || !Array.isArray(data.panels)) {
    throw new Error(`File at "${path}" is not a Shonode workspace (missing a "panels" array).`);
  }
  return data;
}

const hasText = (v) => typeof v === "string" && v.trim().length > 0;

export function summarizeShonode(data) {
  return {
    version: data.version ?? null,
    project: {
      title: data.project?.title ?? "",
      aspectRatio: data.project?.aspectRatio ?? "",
    },
    identityPacks: arr(data.project?.identityPacks).map((p) => ({
      id: p.id ?? "",
      name: p.name ?? p.label ?? "",
    })),
    referenceImageCount: arr(data.referenceImages).length,
    panelCount: data.panels.length,
    panels: data.panels.map((p, i) => ({
      seq: i + 1,
      id: p.id ?? "",
      sceneTitle: p.sceneTitle ?? "",
      caption: p.caption ?? "",
      mode: p.imagePromptMode ?? "",
      hasT2I: hasText(p.t2iPrompt),
      hasI2V: [p.i2vStartPrompt, p.i2vMotionPrompt, p.i2vEndPrompt, p.i2vOmniPrompt].some(hasText),
      refs: arr(p.referenceImageIds).length,
      identityPackIds: arr(p.identityPackIds),
      videoFileName: p.videoFileName ?? "",
      next: arr(p.nextPanelIds),
    })),
  };
}

// ---- aspect ratio -> gpt-image-2 size lock (codex runner whitelist) ------
function parseRatio(ar) {
  if (typeof ar !== "string") return null;
  const m = ar.match(/^\s*([\d.]+)\s*[:x/]\s*([\d.]+)\s*$/i);
  if (!m) return null;
  const w = parseFloat(m[1]);
  const h = parseFloat(m[2]);
  if (!(w > 0 && h > 0)) return null;
  return w / h;
}

// Maps any AR string to one of the 6 safe codex sizes (auto/custom forbidden).
export function sizeForAR(ar) {
  const ratio = parseRatio(ar);
  if (ratio == null) return { size: "1792x1024", lock: "16:9" };
  if (ratio >= 1.7) return { size: "1792x1024", lock: "16:9" }; // incl. 2.39:1, 2:1
  if (ratio >= 1.2) return { size: "1536x1024", lock: "3:2" };
  if (ratio > 0.9) return { size: "1024x1024", lock: "1:1" };
  if (ratio >= 0.62) return { size: "1024x1536", lock: "2:3" };
  return { size: "1024x1792", lock: "9:16" };
}

// ---- export prompt batch (handoff to Codex) ------------------------------
// AR lives at project level in .shonode, so every cut inherits it (or the override).
export function exportPromptBatch(data, { target = "gpt-image-2", ar } = {}) {
  const projectAr = ar || data.project?.aspectRatio || "16:9";
  const { size } = sizeForAR(projectAr);
  const refById = indexRefs(data.referenceImages);

  const resolveRefs = (panel) =>
    arr(panel.referenceImageIds).map((id) => {
      const r = refById.get(id);
      return { id, name: r?.name ?? "", hasData: typeof r?.dataUrl === "string" };
    });

  const lines = [];
  data.panels.forEach((p, i) => {
    const common = {
      cut_id: p.id ?? "",
      seq: i + 1,
      title: p.sceneTitle ?? "",
      intent: p.caption ?? "",
      refs: resolveRefs(p),
      identity_pack_ids: arr(p.identityPackIds),
      ar: projectAr,
      duration: p.durationLabel ?? "",
      next: arr(p.nextPanelIds),
    };

    if (target === "gpt-image-2") {
      const t2i = str(p.t2iPrompt).trim();
      if (!t2i) return;
      lines.push({
        ...common,
        mode: p.imagePromptMode ?? "i2i",
        t2i_raw: t2i,
        size,
        target: "gpt-image-2",
      });
    } else if (target === "seedance") {
      const i2v = {
        start: str(p.i2vStartPrompt).trim(),
        motion: str(p.i2vMotionPrompt).trim(),
        end: str(p.i2vEndPrompt).trim(),
        omni: str(p.i2vOmniPrompt).trim(),
      };
      if (!i2v.start && !i2v.motion && !i2v.end && !i2v.omni) return;
      lines.push({ ...common, i2v, target: "seedance" });
    }
  });

  return { target, ar: projectAr, size, count: lines.length, lines };
}

export function toJsonl(lines) {
  if (!lines.length) return "";
  return lines.map((l) => JSON.stringify(l)).join("\n") + "\n";
}

// ---- merge generated video results back into a snapshot ------------------
// Image stills live in the app's IndexedDB (not the .shonode JSON), so only
// video write-back is supported here. Mutates `data` in place and returns a report.
export function mergeVideoResults(data, results = []) {
  const byId = new Map(data.panels.map((p) => [p.id, p]));
  const applied = [];
  const missed = [];
  for (const r of results) {
    const panel = byId.get(r?.cut_id);
    if (!panel) {
      missed.push(r?.cut_id ?? null);
      continue;
    }
    if (hasText(r.video_file_name)) {
      panel.videoFileName = r.video_file_name;
      if (panel.viewMode !== "vid") panel.viewMode = "vid";
      applied.push(panel.id);
    }
  }
  return { applied, missed };
}

// ---- external still-image manifest (Codex codex-imagegen write-back) -----
// Browser cannot read disk paths and the .shonode JSON stays base64-free, so
// generated stills are recovered via a sidecar manifest the app imports.
export const IMAGE_MANIFEST_VERSION = "shonode-image-manifest-v1";

const IMAGE_MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

// results: [{ cut_id, dataUrl?, path?, fileName? }]
// `path` (relative to baseDir, or absolute) is read and base64-encoded.
// Returns { version, images:[{cut_id,dataUrl,fileName}], missing:[cut_id] }.
export async function buildImageManifest(results = [], { baseDir = "" } = {}) {
  const images = [];
  const missing = [];
  for (const r of arr(results)) {
    const cutId = str(r?.cut_id);
    if (!cutId) continue;
    let dataUrl = str(r?.dataUrl);
    let fileName = str(r?.fileName);
    const srcPath = str(r?.path);
    if (!dataUrl && srcPath) {
      const abs = baseDir ? resolvePath(baseDir, srcPath) : srcPath;
      try {
        const buf = await readFile(abs);
        const mime = IMAGE_MIME[extname(abs).toLowerCase()] || "image/png";
        dataUrl = `data:${mime};base64,${buf.toString("base64")}`;
        if (!fileName) fileName = basename(abs);
      } catch {
        missing.push(cutId);
        continue;
      }
    }
    if (!/^data:image\//i.test(dataUrl)) {
      missing.push(cutId);
      continue;
    }
    images.push({ cut_id: cutId, dataUrl, fileName });
  }
  return { version: IMAGE_MANIFEST_VERSION, images, missing };
}
