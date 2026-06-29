#!/usr/bin/env node
/**
 * shonode-mcp-server
 *
 * Local stdio MCP bridge for the Shonode `.shonode` storyboard format.
 * Boundary: this server stops at PROMPT generation + handoff. It never calls
 * an image/video model itself — actual generation is delegated to Codex
 * (image-prompt / codex-imagegen for stills, seedance for video).
 *
 * Tools:
 *   - shonode_read_project        : parse a .shonode and return a concise summary
 *   - shonode_export_prompt_batch : .shonode -> Codex handoff jsonl (gpt-image-2 | seedance)
 *   - shonode_create_project      : build a fresh, importable .shonode from a cut list
 *   - shonode_merge_results       : write generated VIDEO filenames back into a .shonode
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import {
  readShonode,
  summarizeShonode,
  exportPromptBatch,
  toJsonl,
  createProject,
  mergeVideoResults,
  buildImageManifest,
  SHONODE_VERSION,
} from "./lib/shonode.js";

const CHARACTER_LIMIT = 25000;

const server = new McpServer({ name: "shonode-mcp-server", version: "0.1.0" });

// ---- response helpers ----------------------------------------------------
function ok(structured, text) {
  const body = text ?? JSON.stringify(structured, null, 2);
  const clipped =
    body.length > CHARACTER_LIMIT
      ? `${body.slice(0, CHARACTER_LIMIT)}\n…(truncated ${body.length - CHARACTER_LIMIT} chars — use out_path to get the full output)`
      : body;
  return { content: [{ type: "text", text: clipped }], structuredContent: structured };
}

function fail(message) {
  return { isError: true, content: [{ type: "text", text: `Error: ${message}` }] };
}

// ---- shonode_read_project ------------------------------------------------
server.registerTool(
  "shonode_read_project",
  {
    title: "Read Shonode project",
    description: `Parse a Shonode workspace file (.shonode, or a legacy .json backup) and return a concise structured summary — without dumping base64 reference images.

Args:
  - path (string): absolute path to the .shonode / .json file

Returns (JSON):
  { version, project:{title,aspectRatio}, identityPacks:[{id,name}],
    referenceImageCount, panelCount,
    panels:[ { seq,id,sceneTitle,caption,mode,hasT2I,hasI2V,refs,identityPackIds,videoFileName,next } ] }

Use when: inspecting a storyboard before exporting prompts or merging results.`,
    inputSchema: {
      path: z.string().min(1).describe("Absolute path to a .shonode or legacy .json workspace file"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  async ({ path }) => {
    try {
      const data = await readShonode(resolve(path));
      return ok(summarizeShonode(data));
    } catch (e) {
      return fail(e.message);
    }
  }
);

// ---- shonode_export_prompt_batch -----------------------------------------
server.registerTool(
  "shonode_export_prompt_batch",
  {
    title: "Export Shonode prompt batch",
    description: `Convert a .shonode into a Codex-ready handoff jsonl (one line per cut). This does NOT compile gongnyang prompts or generate images — it packages each cut's RAW prompt + metadata for Codex's image-prompt / codex-imagegen pipeline.

Targets:
  - "gpt-image-2" (default): cuts with a non-empty t2iPrompt -> { cut_id, seq, title, intent, mode, t2i_raw, refs, identity_pack_ids, ar, size, duration, next, target }. AR comes from project.aspectRatio (or the ar override) and is mapped to one of the 6 codex size locks.
  - "seedance": cuts with any i2v* prompt -> { ..., i2v:{start,motion,end,omni}, target }.

Args:
  - path (string): absolute path to the .shonode file
  - target ("gpt-image-2" | "seedance"): which prompt track to export (default "gpt-image-2")
  - ar (string, optional): override aspect ratio, e.g. "9:16" (default: project.aspectRatio)
  - out_path (string, optional): if set, the full jsonl is written here and the path is returned

Returns: the jsonl text (clipped if large) plus structured { target, ar, size, count, out_path? }.`,
    inputSchema: {
      path: z.string().min(1).describe("Absolute path to the source .shonode file"),
      target: z.enum(["gpt-image-2", "seedance"]).default("gpt-image-2").describe("Prompt track to export"),
      ar: z.string().optional().describe("Override aspect ratio (e.g. '9:16'); defaults to the project's aspectRatio"),
      out_path: z.string().optional().describe("Optional path to write the full handoff jsonl"),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  async ({ path, target, ar, out_path }) => {
    try {
      const data = await readShonode(resolve(path));
      const result = exportPromptBatch(data, { target, ar });
      const jsonl = toJsonl(result.lines);
      const structured = { target: result.target, ar: result.ar, size: result.size, count: result.count };
      if (out_path) {
        const dest = resolve(out_path);
        await writeFile(dest, jsonl, "utf8");
        structured.out_path = dest;
        return ok(structured, `Wrote ${result.count} ${target} prompt line(s) to ${dest}\nar=${result.ar} size=${result.size}`);
      }
      if (result.count === 0) {
        return ok(structured, `No cuts matched target "${target}" (no ${target === "seedance" ? "i2v" : "t2i"} prompts present).`);
      }
      return ok(structured, jsonl);
    } catch (e) {
      return fail(e.message);
    }
  }
);

// ---- shonode_create_project ----------------------------------------------
const CutSchema = z.object({
  scene_title: z.string().optional().describe("Cut title (sceneTitle)"),
  caption: z.string().optional().describe("Shot intent / caption"),
  t2i_prompt: z.string().optional().describe("Raw still-image prompt (T2I)"),
  i2v: z
    .object({
      start: z.string().optional(),
      motion: z.string().optional(),
      end: z.string().optional(),
      omni: z.string().optional(),
    })
    .optional()
    .describe("Raw video prompts (I2V)"),
  mode: z.enum(["i2i", "t2i"]).optional().describe("Image prompt mode (default i2i)"),
  duration: z.string().optional().describe("Duration label, e.g. '3s'"),
  next: z.array(z.union([z.number().int(), z.string()])).optional().describe("Connected cuts as 0-based indices or panel ids"),
  identity_pack_ids: z.array(z.string()).optional().describe("Identity (character-consistency) pack ids this cut uses"),
});

server.registerTool(
  "shonode_create_project",
  {
    title: "Create Shonode project",
    description: `Build a fresh, import-ready .shonode workspace from a high-level cut list. Generates panel ids and grid positions, resolves "next" cut connections, and stamps the workspace snapshot shape the app expects.

Args:
  - title (string): project title
  - aspect_ratio (string): project aspect ratio (default "16:9")
  - cuts (array): ordered cuts, each { scene_title?, caption?, t2i_prompt?, i2v?{start,motion,end,omni}, mode?, duration?, next?[], identity_pack_ids?[] }
  - out_path (string, optional): if set, writes the .shonode file and returns its path

Returns: structured { version, panelCount, out_path? }. Without out_path, the full snapshot JSON is returned as text.`,
    inputSchema: {
      title: z.string().min(1).describe("Project title"),
      aspect_ratio: z.string().default("16:9").describe("Project aspect ratio, e.g. '16:9' or '9:16'"),
      cuts: z.array(CutSchema).min(1).describe("Ordered list of cuts/panels"),
      out_path: z.string().optional().describe("Optional path to write the .shonode file"),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  },
  async ({ title, aspect_ratio, cuts, out_path }) => {
    try {
      const snapshot = createProject({ title, aspectRatio: aspect_ratio, cuts });
      const json = JSON.stringify(snapshot, null, 2);
      const structured = { version: snapshot.version, panelCount: snapshot.panels.length };
      if (out_path) {
        const dest = resolve(out_path);
        await writeFile(dest, json, "utf8");
        structured.out_path = dest;
        return ok(structured, `Created .shonode with ${snapshot.panels.length} cut(s) at ${dest}`);
      }
      return ok(structured, json);
    } catch (e) {
      return fail(e.message);
    }
  }
);

// ---- shonode_merge_results -----------------------------------------------
server.registerTool(
  "shonode_merge_results",
  {
    title: "Merge generated results into Shonode",
    description: `Write generated results back into a Shonode project.

VIDEO (results): sets each matched cut's videoFileName + viewMode="vid" inside the .shonode (writes <path>.merged.shonode by default).
STILLS (images): the app stores stills in browser IndexedDB, not the .shonode JSON, so still write-back is emitted as a sidecar manifest ("<path>.images.json", shonode-image-manifest-v1) that the app's import hook recovers by cut_id. Each image entry is { cut_id, path? (read+base64-encoded, relative to the .shonode dir), data_url?, file_name? }.

Args:
  - path (string): absolute path to the source .shonode
  - results (array, optional): [{ cut_id, video_file_name }]
  - images (array, optional): [{ cut_id, path?, data_url?, file_name? }]
  - out_path (string, optional): merged .shonode path (default "<path>.merged.shonode")
  - manifest_out_path (string, optional): image manifest path (default "<path>.images.json")

At least one of results/images is required. Returns structured { video:{applied,missed,out_path}?, images:{count,missing,manifest_path}? }.`,
    inputSchema: {
      path: z.string().min(1).describe("Absolute path to the source .shonode file"),
      results: z
        .array(z.object({ cut_id: z.string().min(1), video_file_name: z.string().min(1) }))
        .optional()
        .describe("Video results to write back into the .shonode"),
      images: z
        .array(
          z.object({
            cut_id: z.string().min(1),
            path: z.string().optional(),
            data_url: z.string().optional(),
            file_name: z.string().optional(),
          })
        )
        .optional()
        .describe("Still-image results emitted as a sidecar manifest"),
      out_path: z.string().optional().describe("Where to write the merged .shonode (default: <path>.merged.shonode)"),
      manifest_out_path: z.string().optional().describe("Where to write the image manifest (default: <path>.images.json)"),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  async ({ path, results, images, out_path, manifest_out_path }) => {
    try {
      const hasVideo = Array.isArray(results) && results.length > 0;
      const hasImages = Array.isArray(images) && images.length > 0;
      if (!hasVideo && !hasImages) {
        return fail("Provide at least one of results (video) or images (stills).");
      }
      const src = resolve(path);
      const data = await readShonode(src);
      const structured = {};

      if (hasVideo) {
        const report = mergeVideoResults(data, results);
        const dest = resolve(out_path ?? `${src}.merged.shonode`);
        await writeFile(dest, JSON.stringify(data, null, 2), "utf8");
        structured.video = { ...report, out_path: dest };
      }

      if (hasImages) {
        const manifest = await buildImageManifest(
          images.map((i) => ({ cut_id: i.cut_id, dataUrl: i.data_url, path: i.path, fileName: i.file_name })),
          { baseDir: dirname(src) }
        );
        const manifestDest = resolve(manifest_out_path ?? `${src}.images.json`);
        await writeFile(
          manifestDest,
          JSON.stringify({ version: manifest.version, images: manifest.images }, null, 2),
          "utf8"
        );
        structured.images = { count: manifest.images.length, missing: manifest.missing, manifest_path: manifestDest };
      }

      return ok(structured);
    } catch (e) {
      return fail(e.message);
    }
  }
);

// ---- boot ----------------------------------------------------------------
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // stdio servers must log to stderr only.
  console.error(`shonode-mcp-server ${SHONODE_VERSION} running on stdio`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
