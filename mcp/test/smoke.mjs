// test/smoke.mjs — dependency-free smoke test for the .shonode bridge logic.
// Run: npm run smoke   (or: node test/smoke.mjs)
import assert from "node:assert/strict";
import { writeFile, rm, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createProject,
  readShonode,
  summarizeShonode,
  exportPromptBatch,
  toJsonl,
  mergeVideoResults,
  buildImageManifest,
  sizeForAR,
  SHONODE_VERSION,
  IMAGE_MANIFEST_VERSION,
} from "../lib/shonode.js";
import {
  buildDirectorRequest,
  mapDirectorResponse,
  directorResultToSnapshot,
} from "../lib/director.js";

const dir = await mkdtemp(join(tmpdir(), "shonode-mcp-"));
const file = join(dir, "demo.shonode");
let passed = 0;
const check = (label, fn) => {
  fn();
  passed += 1;
  console.log(`  ok  ${label}`);
};

try {
  // 1. create_project
  const snap = createProject({
    title: "에르메스 EP01",
    aspectRatio: "9:16",
    cuts: [
      { scene_title: "야근 시작", caption: "사무실 늦은 밤", t2i_prompt: "한 사람이 책상에 앉아 모니터를 본다", mode: "t2i", duration: "3s", next: [1] },
      { scene_title: "속마음 폭발", caption: "키보드 두드리기", i2v: { motion: "빠르게 타이핑하는 손" }, mode: "i2i" },
    ],
  });
  check("create: version + panel count", () => {
    assert.equal(snap.version, SHONODE_VERSION);
    assert.equal(snap.panels.length, 2);
    assert.ok(snap.panels[0].id && snap.panels[1].id);
  });
  check("create: next index resolves to panel id", () => {
    assert.deepEqual(snap.panels[0].nextPanelIds, [snap.panels[1].id]);
  });
  check("create: base + override fields present", () => {
    const p = snap.panels[0];
    for (const k of ["id", "caption", "image", "fileName", "x", "y", "z", "sceneTitle", "t2iPrompt", "i2vMotionPrompt", "identityPackIds", "videoFileName"]) {
      assert.ok(k in p, `panel missing field: ${k}`);
    }
    assert.equal(snap.project.aspectRatio, "9:16");
    assert.ok(Array.isArray(snap.project.identityPacks));
  });

  await writeFile(file, JSON.stringify(snap, null, 2), "utf8");

  // 2. read_project
  const data = await readShonode(file);
  const sum = summarizeShonode(data);
  check("read: summary counts + flags", () => {
    assert.equal(sum.panelCount, 2);
    assert.equal(sum.project.aspectRatio, "9:16");
    assert.equal(sum.panels[0].hasT2I, true);
    assert.equal(sum.panels[0].hasI2V, false);
    assert.equal(sum.panels[1].hasI2V, true);
  });

  // 3. export gpt-image-2
  const img = exportPromptBatch(data, { target: "gpt-image-2" });
  check("export gpt-image-2: only t2i cuts, AR->size lock", () => {
    assert.equal(img.count, 1);
    assert.equal(img.lines[0].ar, "9:16");
    assert.equal(img.lines[0].size, "1024x1792");
    assert.equal(img.lines[0].cut_id, data.panels[0].id);
    assert.ok(img.lines[0].t2i_raw.includes("모니터"));
    assert.ok(toJsonl(img.lines).endsWith("\n"));
  });

  // 4. export seedance
  const vid = exportPromptBatch(data, { target: "seedance" });
  check("export seedance: only i2v cuts", () => {
    assert.equal(vid.count, 1);
    assert.equal(vid.lines[0].cut_id, data.panels[1].id);
    assert.equal(vid.lines[0].i2v.motion, "빠르게 타이핑하는 손");
  });

  // 5. ar override
  check("export: ar override maps to landscape lock", () => {
    const wide = exportPromptBatch(data, { target: "gpt-image-2", ar: "16:9" });
    assert.equal(wide.lines[0].size, "1792x1024");
  });

  // 6. size lock edge cases
  check("sizeForAR: cinemascope + square + portrait", () => {
    assert.equal(sizeForAR("2.39:1").size, "1792x1024");
    assert.equal(sizeForAR("1:1").size, "1024x1024");
    assert.equal(sizeForAR("4:5").size, "1024x1536");
    assert.equal(sizeForAR("garbage").size, "1792x1024");
  });

  // 7. merge video results
  const merged = mergeVideoResults(data, [
    { cut_id: data.panels[1].id, video_file_name: "cut2.mp4" },
    { cut_id: "does-not-exist", video_file_name: "x.mp4" },
  ]);
  check("merge: video write-back + miss reporting", () => {
    assert.deepEqual(merged.applied, [data.panels[1].id]);
    assert.deepEqual(merged.missed, ["does-not-exist"]);
    assert.equal(data.panels[1].videoFileName, "cut2.mp4");
    assert.equal(data.panels[1].viewMode, "vid");
  });

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
    assert.equal(mapped.cuts[1].t2iPrompt, "espresso extraction, crema");
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

  console.log(`\nOK: ${passed} smoke checks passed`);
} finally {
  await rm(dir, { recursive: true, force: true });
}
