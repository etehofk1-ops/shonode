# Layer 2 AI 디렉터 (`shonode_generate_storyboard`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** shonode MCP에 `shonode_generate_storyboard` 툴을 추가 — 텍스트 브리프(+프로젝트 컨텍스트)를 Gemini로 보내 스토리보드 플랜을 생성하고, cuts를 `.shonode` 패널로 매핑해 파일로 쓴다.

**Architecture:** `ai-client.js`의 지능(프롬프트·응답스키마·파서)을 순수 모듈 `lib/director.js`로 이식(텍스트 전용), Gemini fetch는 `lib/gemini.js`로 격리, `index.js`가 둘을 엮어 기존 `lib/shonode.js`의 `buildProject/buildPanel/buildSnapshot`로 `.shonode`를 조립한다. 이미지 모델 호출은 여전히 Codex에 위임(Layer 2는 Gemini 텍스트만).

**Tech Stack:** Node ≥20 ESM, `@modelcontextprotocol/sdk`, zod, 의존성 없는 node assert 스모크. Gemini `v1beta generateContent` (fetch).

---

## File Structure

- `mcp/lib/director.js` (신규, 순수): `buildReferenceCatalog`, `normalizeReferenceImageIndexes`, `inferImagePromptMode`, `buildDirectorPrompt`, `DIRECTOR_RESPONSE_SCHEMA`, `buildDirectorRequest`, `mapDirectorResponse`, `directorResultToSnapshot`. fetch 없음 → smoke로 단위 검증.
- `mcp/lib/gemini.js` (신규, impure): `resolveGeminiKey`, `callGemini`.
- `mcp/index.js` (수정): `shonode_generate_storyboard` 등록 + 상단 주석/경계 갱신.
- `mcp/test/smoke.mjs` (수정): director 순수부 검증 추가.
- `mcp/README.md` (수정): 툴 표 + Layer 1/2 경계 + `GEMINI_API_KEY` 요건.

> Gemini 호출(`callGemini`)은 네트워크+키가 필요해 단위 테스트 대상이 아니다. 순수부(`lib/director.js`)는 smoke로 TDD, 라이브 호출은 키가 있을 때만 도는 stdio e2e(Task 6)로 검증한다.

---

## Task 1: `lib/director.js` — 헬퍼 + 프롬프트 + 스키마

**Files:**
- Create: `mcp/lib/director.js`

- [ ] **Step 1: 파일 생성(헬퍼 + 프롬프트 + 스키마)** — 아래 내용으로 `mcp/lib/director.js`를 만든다. `ai-client.js`의 풀 생성 분기를 텍스트 전용으로 이식한 것(`this` 제거, selected 분기·이미지 인라인 제외).

```js
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
```

- [ ] **Step 2: 구문 점검**

Run: `node --check mcp/lib/director.js`
Expected: 무에러(정상 종료, exit 0).

(테스트는 Task 3에서 parser/snapshot까지 추가한 뒤 한 번에 smoke로 검증한다.)

---

## Task 2: `lib/director.js` — 파서 + 스냅샷 변환

**Files:**
- Modify: `mcp/lib/director.js` (파일 끝에 추가)

- [ ] **Step 1: 파서/변환 추가** — `mcp/lib/director.js` 끝에 추가한다. Gemini 응답 → `{summary, projectDraft, cuts}`(cuts는 buildPanel이 읽는 모양: 활성 이미지 프롬프트를 `t2iPrompt`에 정규화), 그리고 결과 → `.shonode` 스냅샷.

```js
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
```

- [ ] **Step 2: 구문 점검**

Run: `node --check mcp/lib/director.js`
Expected: exit 0.

---

## Task 3: smoke 테스트 (director 순수부) — TDD 검증

**Files:**
- Modify: `mcp/test/smoke.mjs`

- [ ] **Step 1: 실패하는 테스트 추가** — import 블록에 director 함수를 추가하고, `console.log(\`\nOK...\`)` 직전에 아래 블록을 삽입한다.

import 추가(11~16행 블록의 `} from "../lib/shonode.js";` 다음 줄에):
```js
import {
  buildDirectorRequest,
  mapDirectorResponse,
  directorResultToSnapshot,
} from "../lib/director.js";
```

`console.log(\`\nOK: ...\`)` 직전 삽입:
```js
// 9. director: request shape
check("director: request schema + prompt carries brief/context", () => {
  const req = buildDirectorRequest("커피 광고", { title: "모닝브루", aspectRatio: "9:16", tone: "따뜻한" });
  assert.equal(req.generationConfig.responseMimeType, "application/json");
  assert.ok(req.generationConfig.responseJsonSchema.properties.cuts, "schema has cuts");
  assert.ok(req.generationConfig.responseJsonSchema.properties.projectDraft, "schema has projectDraft");
  const text = req.contents[0].parts[0].text;
  assert.ok(text.includes("커피 광고"), "prompt includes brief");
  assert.ok(text.includes("모닝브루"), "prompt includes project title");
  assert.ok(text.includes("9:16"), "prompt includes aspectRatio");
});

// 10. director: parse Gemini fixture -> cuts (i2i prompt normalized into t2iPrompt)
const directorFixture = {
  candidates: [{ content: { parts: [{ text: JSON.stringify({
    summary: "3컷 커피 광고",
    projectDraft: { title: "모닝브루", sequence: "Scene 01", runtime: "20s", tone: "따뜻한", logline: "아침 한 잔", notes: "느린 줌인" },
    cuts: [
      { sceneTitle: "원두", durationLabel: "약 3초", caption: "원두 클로즈업 3초", imagePromptMode: "t2i", i2iPrompt: "", t2iPrompt: "macro coffee beans, warm light", i2vStartPrompt: "still beans", i2vMotionPrompt: "slow push in", i2vEndPrompt: "beans fill frame" },
      { sceneTitle: "추출", durationLabel: "약 4초", caption: "에스프레소 추출 4초", imagePromptMode: "i2i", i2iPrompt: "espresso extraction, crema", t2iPrompt: "", i2vStartPrompt: "drip start", i2vMotionPrompt: "stream falls", i2vEndPrompt: "cup fills" },
    ],
  }) }] } }],
};
const mapped = mapDirectorResponse(directorFixture);
check("director: maps summary/projectDraft/cuts + i2i->t2iPrompt", () => {
  assert.equal(mapped.summary, "3컷 커피 광고");
  assert.equal(mapped.projectDraft.title, "모닝브루");
  assert.equal(mapped.cuts.length, 2);
  assert.equal(mapped.cuts[0].imagePromptMode, "t2i");
  assert.ok(mapped.cuts[0].t2iPrompt.includes("macro coffee"));
  assert.equal(mapped.cuts[1].imagePromptMode, "i2i");
  assert.equal(mapped.cuts[1].t2iPrompt, "espresso extraction, crema"); // active i2i prompt lands in t2iPrompt
  assert.equal(mapped.cuts[1].i2vMotionPrompt, "stream falls");
});

// 11. director: result -> importable .shonode snapshot
const directorSnap = directorResultToSnapshot(mapped, { title: "모닝브루", aspectRatio: "9:16" });
check("director: snapshot is importable (.shonode shape)", () => {
  assert.equal(directorSnap.version, SHONODE_VERSION);
  assert.equal(directorSnap.panels.length, 2);
  assert.equal(directorSnap.project.aspectRatio, "9:16");
  assert.equal(directorSnap.project.title, "모닝브루");
  assert.equal(directorSnap.panels[0].sceneTitle, "원두");
  assert.equal(directorSnap.panels[1].t2iPrompt, "espresso extraction, crema");
  assert.equal(directorSnap.panels[0].imagePromptMode, "t2i");
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm run smoke --prefix mcp`
Expected: FAIL — `does not provide an export named 'buildDirectorRequest'` (Task 1·2 미적용 시) 또는 어서션 실패. (Task 1·2를 이미 적용했다면 이 단계에서 바로 PASS로 넘어간다.)

- [ ] **Step 3: 통과 확인**

Run: `npm run smoke --prefix mcp`
Expected: PASS — 기존 체크 + `ok director: ...` 3건. `OK: 13 smoke checks passed`.

- [ ] **Step 4: 커밋**

```bash
git add mcp/lib/director.js mcp/test/smoke.mjs
git commit -m "feat(mcp): pure AI-director port (prompt/schema/parser) + smoke"
```

---

## Task 4: `lib/gemini.js` — 키 해석 + 호출

**Files:**
- Create: `mcp/lib/gemini.js`

- [ ] **Step 1: 파일 생성** — `mcp/lib/gemini.js`. 키는 env 우선, 없으면 프로젝트 루트 `.env`(mcp의 부모) 폴백. `callGemini`는 generateContent 직접 POST.

```js
// lib/gemini.js — the only impure (network) part of Layer 2.
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url)); // mcp/lib
const PROJECT_ENV = join(HERE, "..", "..", ".env"); // Shonode/.env

// env GEMINI_API_KEY first, else parse the project .env (same key the app/server use).
export async function resolveGeminiKey() {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) {
    return process.env.GEMINI_API_KEY.trim();
  }
  try {
    const raw = await readFile(PROJECT_ENV, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq === -1) continue;
      if (t.slice(0, eq).trim() === "GEMINI_API_KEY") {
        return t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    /* no .env */
  }
  return "";
}

export async function callGemini(model, request, apiKey) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  let res;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify(request),
    });
  } catch (e) {
    throw new Error(`Failed to reach Gemini: ${e.message}`);
  }
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Gemini ${res.status}: ${text.slice(0, 400)}`);
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`Gemini returned non-JSON: ${e.message}`);
  }
}
```

- [ ] **Step 2: 구문 점검 + 키 해석 동작 확인**

Run: `node --check mcp/lib/gemini.js`
Expected: exit 0.

Run: `GEMINI_API_KEY=test-xyz node --input-type=module -e "import('./mcp/lib/gemini.js').then(async m => console.log('key:', await m.resolveGeminiKey()))"`
Expected: `key: test-xyz` (env 우선 동작 확인).

- [ ] **Step 3: 커밋**

```bash
git add mcp/lib/gemini.js
git commit -m "feat(mcp): gemini key resolver + generateContent call"
```

---

## Task 5: `index.js` — `shonode_generate_storyboard` 등록

**Files:**
- Modify: `mcp/index.js` (import 블록 + 새 도구 등록 + 상단 주석/경계)

- [ ] **Step 1: import 추가** — `mcp/index.js`의 `from "./lib/shonode.js";` 블록 다음에 추가한다.

```js
import { buildDirectorRequest, mapDirectorResponse, directorResultToSnapshot } from "./lib/director.js";
import { resolveGeminiKey, callGemini } from "./lib/gemini.js";
```

- [ ] **Step 2: 도구 등록** — `shonode_merge_results` 등록 블록 다음(즉 `// ---- boot ----` 주석 직전)에 아래를 삽입한다.

```js
// ---- shonode_generate_storyboard (Layer 2: AI director) ------------------
server.registerTool(
  "shonode_generate_storyboard",
  {
    title: "Generate Shonode storyboard (AI director)",
    description: `Turn a short Korean brief into a storyboard plan via Gemini and write an importable .shonode. This is the only tool that calls a model (Gemini TEXT generateContent); image generation is still delegated to Codex. Text brief only (no inline reference images in this version).

Requires a Gemini key: env GEMINI_API_KEY, else the project root .env (same key the app/server use).

Args:
  - brief (string): the rough Korean concept/brief
  - title (string, optional): project title (defaults to the model's projectDraft.title)
  - aspect_ratio (string, optional): project aspect ratio (default "16:9")
  - tone/runtime/logline/notes/sequence (string, optional): project context fed to the model
  - model (string, optional): Gemini model (default "gemini-2.5-flash")
  - out_path (string, optional): if set, writes the .shonode and returns its path

Returns: structured { summary, panelCount, out_path? }. Without out_path the full snapshot JSON is returned as text. Then: export_prompt_batch -> Codex -> merge_results.`,
    inputSchema: {
      brief: z.string().min(1).describe("Rough Korean brief / concept"),
      title: z.string().optional().describe("Project title (default: model's projectDraft.title)"),
      aspect_ratio: z.string().default("16:9").describe("Project aspect ratio, e.g. '16:9' or '9:16'"),
      tone: z.string().optional(),
      runtime: z.string().optional(),
      logline: z.string().optional(),
      notes: z.string().optional(),
      sequence: z.string().optional(),
      model: z.string().default("gemini-2.5-flash").describe("Gemini model id"),
      out_path: z.string().optional().describe("Optional path to write the .shonode file"),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  },
  async ({ brief, title, aspect_ratio, tone, runtime, logline, notes, sequence, model, out_path }) => {
    try {
      const apiKey = await resolveGeminiKey();
      if (!apiKey) {
        return fail("GEMINI_API_KEY not found. Set it in the MCP server env or the project root .env.");
      }
      const ctx = { title, aspectRatio: aspect_ratio, tone, runtime, logline, notes, sequence };
      const request = buildDirectorRequest(brief, ctx);
      const geminiJson = await callGemini(model, request, apiKey);
      const result = mapDirectorResponse(geminiJson);
      const snapshot = directorResultToSnapshot(result, { title, aspectRatio: aspect_ratio });
      const structured = { summary: result.summary, panelCount: snapshot.panels.length };
      if (out_path) {
        const dest = resolve(out_path);
        await writeFile(dest, JSON.stringify(snapshot, null, 2), "utf8");
        structured.out_path = dest;
        return ok(structured, `Generated ${snapshot.panels.length} cut(s) at ${dest}\n${result.summary}`);
      }
      return ok(structured, JSON.stringify(snapshot, null, 2));
    } catch (e) {
      return fail(e.message);
    }
  }
);
```

- [ ] **Step 3: 상단 주석/경계 갱신** — `index.js` 상단 헤더 주석의 Tools 목록(`*   - shonode_merge_results …` 줄 다음)에 추가하고, Boundary 문구를 갱신한다.

기존:
```js
 *   - shonode_merge_results       : write generated VIDEO filenames back into a .shonode
 */
```
교체:
```js
 *   - shonode_merge_results       : write generated VIDEO filenames / still-image sidecar
 *   - shonode_generate_storyboard : brief -> Gemini -> importable .shonode (Layer 2)
 *
 * Layer 1 tools never call a model. Layer 2 (generate_storyboard) calls Gemini
 * TEXT generation only; image/video models stay delegated to Codex.
 */
```

- [ ] **Step 4: 구문 점검**

Run: `npm run check --prefix mcp`
Expected: PASS — `node --check index.js && node --check lib/shonode.js` 무에러.

- [ ] **Step 5: smoke 회귀**

Run: `npm run smoke --prefix mcp`
Expected: PASS — Task 3의 13 checks 유지(index.js 변경은 lib 순수부 무영향).

- [ ] **Step 6: 커밋**

```bash
git add mcp/index.js
git commit -m "feat(mcp): shonode_generate_storyboard tool (Layer 2 AI director)"
```

---

## Task 6: 라이브 통합 검증 (키 있을 때만) + 정리

**Files:** 없음(임시 스크립트는 실행 후 삭제)

- [ ] **Step 1: 키 존재 확인**

Run: `node --input-type=module -e "import('./mcp/lib/gemini.js').then(async m => console.log('hasKey:', Boolean(await m.resolveGeminiKey())))"`
Expected: `hasKey: true` (프로젝트 `.env`에 GEMINI_API_KEY 존재). `false`면 라이브 검증은 skip하고 그 사실을 사용자에게 보고한다.

- [ ] **Step 2: 실제 생성 1회(키 있을 때만)** — 스크래치패드에 임시 mjs를 만들어 실제 brief로 stdio MCP 호출:
  1. `StdioClientTransport({command: node, args:["index.js"], cwd: mcp})`로 서버 기동
  2. `callTool("shonode_generate_storyboard", { brief: "도심 새벽 러닝하는 사람, 에너지드링크 광고 15초", aspect_ratio: "9:16", out_path: "<scratch>/director.shonode" })`
  3. 검증: `structuredContent.panelCount >= 1`, `summary` 비어있지 않음
  4. 생성된 `director.shonode`를 `shonode_read_project`로 읽어 `panelCount >= 1` + 각 패널 `hasT2I` 확인

Expected: 컷 ≥1, 한국어 summary, 유효 `.shonode`. 끝나면 임시 스크립트·생성 파일 삭제.

- [ ] **Step 3: 보고** — 라이브 검증 결과(또는 키 없어서 skip)를 사용자에게 보고. 별도 커밋 없음.

---

## Task 7: README 갱신

**Files:**
- Modify: `mcp/README.md`

- [ ] **Step 1: Tools 표에 행 추가** — 표의 `shonode_merge_results` 행 다음에 추가:

```md
| `shonode_generate_storyboard` | Brief → Gemini → importable `.shonode` (the only model-calling tool; Gemini text only) | optional `out_path` |
```

- [ ] **Step 2: Boundary 섹션 갱신** — "Boundary (important)" 섹션 끝에 추가:

```md
**Layer 2 (`shonode_generate_storyboard`)** intentionally opens the boundary for
the *plan* step only: it calls Gemini **text** generateContent to turn a brief
into a `.shonode`. Image/video generation stays delegated to Codex. Requires a
Gemini key (env `GEMINI_API_KEY`, else the project root `.env`).
```

- [ ] **Step 3: 커밋**

```bash
git add mcp/README.md
git commit -m "docs(mcp): document Layer 2 generate_storyboard tool"
```

---

## Self-Review

- **Spec coverage:** director.js 순수부(prompt/schema/parser/snapshot)=Task1·2, smoke=Task3, gemini.js(key/call)=Task4, 툴 등록=Task5, 라이브 검증=Task6, README/경계=Task5·7. 분기점 기본값(직접호출=Task4, 텍스트전용=Task1 프롬프트가 "NO attached reference images" 명시·이미지 인라인 미구현, 새 .shonode=Task5 out_path) 모두 반영. 누락 없음.
- **Placeholder scan:** "TBD/적절히" 없음. 각 코드 스텝에 전체 코드. Task6는 임시 스크립트라 코드 대신 단계 명시(실행 후 삭제) — 산출 코드가 영구 파일이 아니므로 허용.
- **Type consistency:** director.js exports(`buildDirectorRequest`, `mapDirectorResponse`, `directorResultToSnapshot`, `buildDirectorPrompt`, `DIRECTOR_RESPONSE_SCHEMA`, helpers)와 index.js·smoke import 일치. gemini.js(`resolveGeminiKey`, `callGemini`) 일치. mapDirectorResponse가 내는 cut 필드(sceneTitle/durationLabel/caption/imagePromptMode/t2iPrompt/i2vStart·Motion·End)는 `buildPanel`이 읽는 키와 일치. `directorResultToSnapshot`는 `buildProject/buildPanel/buildSnapshot`(lib/shonode.js 기존)만 사용.
