// test/integration.mjs — boots the real stdio server and lists its tools.
// Run: node test/integration.mjs
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const entry = join(here, "..", "index.js");

const child = spawn(process.execPath, [entry], { stdio: ["pipe", "pipe", "pipe"] });
const send = (msg) => child.stdin.write(JSON.stringify(msg) + "\n");

let buf = "";
const pending = new Map();
child.stdout.on("data", (chunk) => {
  buf += chunk.toString();
  let nl;
  while ((nl = buf.indexOf("\n")) >= 0) {
    const line = buf.slice(0, nl).trim();
    buf = buf.slice(nl + 1);
    if (!line) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.id != null && pending.has(msg.id)) pending.get(msg.id)(msg);
  }
});

const rpc = (id, method, params) =>
  new Promise((res, rej) => {
    const timer = setTimeout(() => rej(new Error(`timeout waiting for ${method}`)), 8000);
    pending.set(id, (m) => { clearTimeout(timer); res(m); });
    send({ jsonrpc: "2.0", id, method, params });
  });

const fail = (e) => { console.error("FAIL:", e.message); child.kill(); process.exit(1); };

try {
  const init = await rpc(1, "initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "integration", version: "0" },
  });
  assert.ok(init.result, "initialize returned a result");

  send({ jsonrpc: "2.0", method: "notifications/initialized" });

  const list = await rpc(2, "tools/list", {});
  const names = (list.result?.tools ?? []).map((t) => t.name).sort();
  const expected = [
    "shonode_create_project",
    "shonode_export_prompt_batch",
    "shonode_merge_results",
    "shonode_read_project",
  ];
  assert.deepEqual(names, expected, `tools/list should expose exactly the 4 tools, got: ${names.join(", ")}`);

  // round-trip one real tool call (zod input schema + handler + structuredContent)
  const call = await rpc(3, "tools/call", {
    name: "shonode_create_project",
    arguments: { title: "T", aspect_ratio: "9:16", cuts: [{ scene_title: "a", t2i_prompt: "x" }] },
  });
  assert.ok(!call.result?.isError, `create_project call errored: ${JSON.stringify(call.result?.content)}`);
  assert.equal(call.result?.structuredContent?.panelCount, 1, "structuredContent.panelCount === 1");
  assert.equal(call.result?.structuredContent?.version, "shonode-workspace-v1");

  console.log("OK: server booted; tools/list ->", names.join(", "));
  console.log("OK: tools/call shonode_create_project -> panelCount=1");
  child.kill();
  process.exit(0);
} catch (e) {
  fail(e);
}
