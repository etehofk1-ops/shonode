const { spawnSync } = require("node:child_process");
const path = require("node:path");

const ROOT_DIR = path.resolve(__dirname, "..");

const files = [
  "script.js",
  "shotboard-ai.js",
  "ai-client.js",
  "guided-template-engine.js",
  "octo-workbench-state.js",
  "octo-workbench.js",
  "server.js",
  "storyboard-proxy.js",
  "security-scan-proxy.js",
  path.join("api", "storyboard.js"),
  path.join("api", "security-scan.js")
];

let failed = false;

for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], {
    cwd: ROOT_DIR,
    stdio: "inherit"
  });

  if (result.status !== 0) {
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log(`[check] ${files.length} JavaScript files passed node --check.`);
