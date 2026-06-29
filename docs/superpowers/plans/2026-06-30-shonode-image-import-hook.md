# 외부 생성 이미지 회수 import 훅 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Codex(codex-imagegen)가 만든 스틸 PNG를 `cut_id` 매핑으로 Shonode 캔버스에 회수하는, dataUrl 사이드카 매니페스트 기반의 앱측 import 훅과 MCP측 사이드카 writer를 추가한다.

**Architecture:** 브라우저는 임의 디스크 경로를 못 읽으므로, 디스크를 읽을 수 있는 MCP(Node)가 PNG를 base64 dataUrl로 인코딩해 `*.images.json` 사이드카(`shonode-image-manifest-v1`)로 출력한다. 앱은 그 매니페스트를 import해 `cut_id→panel.id`로 매칭, `panel.image`/`fileName`/`viewMode:"image"`를 세팅하고 `persistPanels()`로 localStorage + IndexedDB에 영속화한다. 비파괴 머지(전체 워크스페이스 교체와 별개).

**Tech Stack:** 바닐라 JS 브라우저 앱(`script.js`/`shotboard-ai.js`, 클래식 스크립트 공유 스코프), Node ≥20 stdio MCP(`@modelcontextprotocol/sdk`, zod), 의존성 없는 node assert 스모크 테스트.

---

## File Structure

- `mcp/lib/shonode.js` — `IMAGE_MANIFEST_VERSION` 상수 + `buildImageManifest()` 추가(순수/파일읽기, 단위 테스트 대상).
- `mcp/test/smoke.mjs` — `buildImageManifest` 라운드트립 검증 추가.
- `mcp/index.js` — `shonode_merge_results`에 이미지 분기(사이드카 작성) 추가.
- `mcp/README.md` — "Known limitation" 갱신.
- `shotboard-ai.js` — `importPanelImageManifest()` + `isPanelImageManifest()` 신설, `handleImportWorkspaceInputChange` 형태 감지 분기, `importWorkspaceSnapshot` 동봉 `panelImages` 적용.

> 앱은 단위 테스트 러너가 없다(현행 `npm run check`=node --check, `npm run smoke`=서버 부팅). 따라서 MCP측은 정식 TDD(smoke 어서션), 앱측은 `node --check` + 브라우저 preview 검증을 정본 검증으로 사용한다.

---

## Task 1: MCP — `buildImageManifest` + 상수 (TDD)

**Files:**
- Modify: `mcp/lib/shonode.js` (imports 상단, 파일 끝에 함수 추가)
- Test: `mcp/test/smoke.mjs`

- [ ] **Step 1: 실패하는 테스트 작성** — `mcp/test/smoke.mjs`의 import 블록(11~16행)에 `buildImageManifest, IMAGE_MANIFEST_VERSION`을 추가하고, `console.log(\`\nOK...\`)` 직전(현재 112행 앞)에 아래 블록을 삽입한다.

```js
// 8. image manifest: dataUrl passthrough + file read + miss reporting
const tinyPngBase64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
const pngPath = join(dir, "cut2.png");
await writeFile(pngPath, Buffer.from(tinyPngBase64, "base64"));
const manifest = await buildImageManifest(
  [
    { cut_id: data.panels[0].id, dataUrl: "data:image/png;base64,AAAA" },
    { cut_id: data.panels[1].id, path: "cut2.png" },
    { cut_id: "nope" },
  ],
  { baseDir: dir }
);
check("image manifest: version + dataUrl passthrough + file read + miss", () => {
  assert.equal(manifest.version, IMAGE_MANIFEST_VERSION);
  assert.equal(manifest.images.length, 2);
  assert.equal(manifest.images[0].cut_id, data.panels[0].id);
  assert.equal(manifest.images[0].dataUrl, "data:image/png;base64,AAAA");
  assert.ok(manifest.images[1].dataUrl.startsWith("data:image/png;base64,"));
  assert.equal(manifest.images[1].fileName, "cut2.png");
  assert.deepEqual(manifest.missing, ["nope"]);
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm run smoke --prefix mcp`
Expected: FAIL — `buildImageManifest is not exported` / `SyntaxError: ... does not provide an export named 'buildImageManifest'`.

- [ ] **Step 3: 최소 구현** — `mcp/lib/shonode.js` 9행 `import { readFile } from "node:fs/promises";` 아래에 path import를 추가:

```js
import { readFile } from "node:fs/promises";
import { extname, basename, resolve as resolvePath } from "node:path";
```

그리고 파일 끝(`mergeVideoResults` 다음)에 추가:

```js
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
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm run smoke --prefix mcp`
Expected: PASS — 기존 체크 + `ok  image manifest: version + dataUrl passthrough + file read + miss`, `OK: 8 smoke checks passed`.

- [ ] **Step 5: 커밋**

```bash
git add mcp/lib/shonode.js mcp/test/smoke.mjs
git commit -m "feat(mcp): add buildImageManifest for still-image sidecar"
```

---

## Task 2: MCP — `shonode_merge_results` 이미지 분기

**Files:**
- Modify: `mcp/index.js` (imports 22~30행, merge 도구 189~225행)

- [ ] **Step 1: import 확장** — `mcp/index.js`의 lib import 블록(22~30행)에 `buildImageManifest`를 추가하고, 21행 `import { resolve } from "node:path";`를 `import { resolve, dirname } from "node:path";`로 바꾼다.

```js
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
```

- [ ] **Step 2: 도구 재정의** — `shonode_merge_results` 블록(189~225행) 전체를 아래로 교체한다. `results`(영상)를 optional로 풀고 `images`(스틸)를 추가, "최소 하나" 검증.

```js
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
```

- [ ] **Step 3: 구문 점검**

Run: `npm run check --prefix mcp`
Expected: PASS — `node --check index.js && node --check lib/shonode.js` 무에러(정상 종료).

- [ ] **Step 4: 스모크 회귀 확인**

Run: `npm run smoke --prefix mcp`
Expected: PASS — Task 1의 8 checks 유지(merge_results 도구 변경은 lib `mergeVideoResults`/`buildImageManifest`를 건드리지 않으므로 회귀 없음).

- [ ] **Step 5: 커밋**

```bash
git add mcp/index.js
git commit -m "feat(mcp): merge_results emits still-image sidecar manifest"
```

---

## Task 3: 앱 — `importPanelImageManifest` + `isPanelImageManifest`

**Files:**
- Modify: `shotboard-ai.js` (`importWorkspaceSnapshot` 함수 다음, 5201행 뒤에 신규 함수 추가)

- [ ] **Step 1: 함수 추가** — `shotboard-ai.js`에서 `importWorkspaceSnapshot`이 끝나는 `}`(5201행) 바로 다음에 아래 두 함수를 삽입한다. 공유 스코프의 `panels`, `pushHistoryState`, `persistPanels`, `renderPanels`, `updateHistoryUI`, `setStatus`를 그대로 사용한다(기존 `importWorkspaceSnapshot`/`attachImageToPanel`과 동일 패턴).

```js
  function isPanelImageManifest(value) {
    if (!value || typeof value !== "object") {
      return false;
    }
    if (value.version === "shonode-image-manifest-v1") {
      return true;
    }
    return Array.isArray(value.images) && !Array.isArray(value.panels);
  }

  // Merge externally generated stills (Codex codex-imagegen) onto existing
  // panels by cut_id (= panel.id). Non-destructive: only image/fileName/viewMode
  // are touched. persistPanels() writes localStorage + IndexedDB image storage.
  function importPanelImageManifest(manifest, options = {}) {
    const announce = options.announce ?? true;
    const images = Array.isArray(manifest?.images) ? manifest.images : [];
    if (images.length === 0) {
      if (announce) {
        setStatus("회수할 이미지가 없습니다.", "warning");
      }
      return { applied: [], missed: [], skipped: [] };
    }

    const byId = new Map(panels.map((panel) => [panel.id, panel]));
    const updates = new Map(); // panelId -> { image, fileName }
    const missed = [];
    const skipped = [];

    images.forEach((entry) => {
      const cutId = typeof entry?.cut_id === "string" ? entry.cut_id : "";
      const dataUrl = typeof entry?.dataUrl === "string" ? entry.dataUrl : "";
      if (!cutId || !byId.has(cutId)) {
        missed.push(cutId || null);
        return;
      }
      if (!/^data:image\//i.test(dataUrl)) {
        skipped.push(cutId);
        return;
      }
      updates.set(cutId, {
        image: dataUrl,
        fileName: typeof entry.fileName === "string" ? entry.fileName : ""
      });
    });

    if (updates.size === 0) {
      if (announce) {
        setStatus(`스틸을 회수하지 못했습니다. (매칭 안 됨 ${missed.length}건)`, "warning");
      }
      return { applied: [], missed, skipped };
    }

    pushHistoryState();
    panels = panels.map((panel) => {
      const update = updates.get(panel.id);
      if (!update) {
        return panel;
      }
      return {
        ...panel,
        image: update.image,
        fileName: update.fileName || panel.fileName,
        viewMode: "image"
      };
    });
    persistPanels();
    renderPanels();
    updateHistoryUI();

    const applied = Array.from(updates.keys());
    if (announce) {
      const suffix = missed.length ? ` (매칭 안 됨 ${missed.length}건)` : "";
      setStatus(`스틸 ${applied.length}장을 회수했습니다.${suffix}`);
    }
    return { applied, missed, skipped };
  }
```

- [ ] **Step 2: 구문 점검**

Run: `npm run check`
Expected: PASS — `[check] 11 JavaScript files passed node --check.`

- [ ] **Step 3: 브라우저 preview 검증** — 앱을 띄우고 함수를 직접 호출해 회수가 캔버스에 반영+영속되는지 확인.

1. preview_start (Shonode 디렉터리, `node server.js`) 후 페이지 로드.
2. preview_eval로 첫 패널 id를 얻고 1px dataUrl을 주입:
```js
const id = panels[0].id;
importPanelImageManifest({ version: "shonode-image-manifest-v1", images: [
  { cut_id: id, dataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", fileName: "t.png" }
]});
```
3. preview_snapshot/screenshot로 첫 카드에 스틸(`.preview-image`)이 보이는지 확인. 상태바 "스틸 1장을 회수했습니다." 확인.
4. 새로고침(preview_eval `location.reload()`) 후 다시 스냅샷 — IndexedDB hydrate로 스틸이 유지되는지 확인.
5. 미매칭 케이스: `importPanelImageManifest({ images:[{cut_id:"nope", dataUrl:"data:image/png;base64,AAAA"}] })` → 콘솔 반환값 `{applied:[],missed:["nope"]...}` + 상태바 경고 확인.

Expected: 스틸이 즉시 렌더되고 새로고침 후에도 유지, 미매칭은 경고로 보고.

- [ ] **Step 4: 커밋**

```bash
git add shotboard-ai.js
git commit -m "feat: recover external stills onto panels via image manifest"
```

---

## Task 4: 앱 — import UI 배선(형태 감지 + 동봉 panelImages)

**Files:**
- Modify: `shotboard-ai.js` (`handleImportWorkspaceInputChange` 5102~5132행, `importWorkspaceSnapshot` 끝부분 5196~5200행)

- [ ] **Step 1: 형태 감지 분기** — `handleImportWorkspaceInputChange`(5102~5132행) 전체를 아래로 교체한다. JSON 파싱을 확인창 앞으로 옮기고, 매니페스트면 파괴적 확인 없이 머지한다.

```js
  async function handleImportWorkspaceInputChange(event) {
    const file = event.target?.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (isPanelImageManifest(parsed)) {
        importPanelImageManifest(parsed);
        return;
      }

      const shouldImport = await openConfirmDialog({
        tone: "danger",
        eyebrow: "프로젝트 가져오기",
        title: "현재 작업 위에 불러올까요?",
        description: "현재 워크스페이스를 새 프로젝트 내용으로 덮어씁니다. 불러오기 전에 내보내기로 백업할 수 있습니다.",
        confirmLabel: "불러오기"
      });

      if (!shouldImport) {
        return;
      }

      await importWorkspaceSnapshot(parsed);
    } catch (error) {
      console.warn("Failed to import workspace snapshot.", error);
      setStatus("프로젝트 파일을 불러오지 못했습니다.", "warning");
    } finally {
      if (event.target) {
        event.target.value = "";
      }
    }
  }
```

- [ ] **Step 2: 동봉 panelImages 적용** — `importWorkspaceSnapshot` 끝의 `renderPanels({ restoreView: true });`(5196행)와 이어지는 `window.setTimeout(...)` 사이에 아래를 삽입한다. 풀 `.shonode`가 `panelImages`를 동봉했을 때 함께 회수한다.

```js
    renderPanels({ restoreView: true });
    if (Array.isArray(snapshot?.panelImages) && snapshot.panelImages.length > 0) {
      importPanelImageManifest({ images: snapshot.panelImages }, { announce: false });
    }
    window.setTimeout(() => {
      persistViewState();
    }, 120);
```

- [ ] **Step 3: 구문 점검**

Run: `npm run check`
Expected: PASS — `[check] 11 JavaScript files passed node --check.`

- [ ] **Step 4: 브라우저 preview 검증(파일 입력 경로)**

1. 매니페스트 파일을 임시 작성: `{ "version":"shonode-image-manifest-v1", "images":[{ "cut_id":"<첫 패널 id>", "dataUrl":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "fileName":"t.png" }] }` (첫 패널 id는 preview_eval `panels[0].id`로 확인).
2. "가져오기" 입력에 이 파일을 넣어(preview_eval로 `importWorkspaceInputEl`에 File 주입 후 change 디스패치, 또는 직접 `handleImportWorkspaceInputChange` 호출) **파괴적 확인창이 뜨지 않고** 첫 카드에 스틸이 머지되는지 확인.
3. 일반 `.shonode` import는 기존대로 확인창이 뜨는지 1회 확인(회귀 점검).

Expected: 매니페스트는 확인창 없이 머지, 일반 프로젝트 import는 확인창 유지.

- [ ] **Step 5: 서버 스모크 회귀**

Run: `npm run smoke`
Expected: PASS — `[smoke] http://127.0.0.1:<port> passed. ...` (정적 서빙/보안 헤더 무변경).

- [ ] **Step 6: 커밋**

```bash
git add shotboard-ai.js
git commit -m "feat: route image manifest through import + embedded panelImages"
```

---

## Task 5: 문서 — README "Known limitation" 갱신

**Files:**
- Modify: `mcp/README.md` (33행 표, 43~46행 Known limitation)

- [ ] **Step 1: 표 갱신** — 33행을 교체:

```md
| `shonode_merge_results` | Write generated **video** filenames into a `.shonode` **and/or** emit a still-image sidecar manifest | yes |
```

- [ ] **Step 2: Known limitation 교체** — 43~46행을 교체:

```md
### Stills round-trip (image sidecar)
Generated stills live in the app's IndexedDB (`ShonodePanelImageStorage`), not in
the `.shonode` JSON. `shonode_merge_results` now base64-encodes still files into a
sidecar manifest (`<path>.images.json`, `shonode-image-manifest-v1`); the app's
import hook (`importPanelImageManifest`) recovers them onto panels by `cut_id`.
The `.shonode` itself stays base64-free.
```

- [ ] **Step 3: 커밋**

```bash
git add mcp/README.md
git commit -m "docs(mcp): document still-image sidecar round-trip"
```

---

## Self-Review

- **Spec coverage:** 매니페스트 포맷=Task1; 앱 훅(매칭/viewMode/영속/리포트)=Task3; UI 형태감지+동봉 panelImages=Task4; MCP buildImageManifest=Task1, merge 분기/사이드카=Task2; README=Task5; 검증(앱 preview, MCP smoke)=각 Task의 검증 스텝. 누락 없음.
- **Placeholder scan:** "TBD/적절히 처리" 없음. 모든 코드 스텝에 실제 코드/명령/기대출력 포함.
- **Type consistency:** lib `buildImageManifest`는 `{cut_id,dataUrl,path,fileName}` 입력·`{version,images,missing}` 반환. index.js가 `{data_url→dataUrl, path, file_name→fileName}`로 매핑해 호출. 앱 `importPanelImageManifest`는 매니페스트 `images[].{cut_id,dataUrl,fileName}` 소비(MCP 출력과 동일 키). `isPanelImageManifest`는 Task3 정의→Task4 사용. `panels` 재할당·`persistPanels`/`renderPanels`/`pushHistoryState`/`updateHistoryUI`/`setStatus`는 기존 `importWorkspaceSnapshot`/`attachImageToPanel`에서 동일 스코프로 검증됨.
