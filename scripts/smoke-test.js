const http = require("node:http");
const { spawn } = require("node:child_process");
const path = require("node:path");

const ROOT_DIR = path.resolve(__dirname, "..");
const START_PORT = Number(process.env.SMOKE_PORT || 4290 + Math.floor(Math.random() * 400));
const MAX_PORT_ATTEMPTS = 8;
const REQUIRED_HEADERS = [
  "content-security-policy",
  "x-frame-options",
  "x-content-type-options",
  "referrer-policy",
  "permissions-policy"
];

const server = spawn(process.execPath, ["server.js"], {
  cwd: ROOT_DIR,
  env: { ...process.env, PORT: String(START_PORT) },
  stdio: ["ignore", "pipe", "pipe"]
});

let serverOutput = "";
server.stdout.on("data", (chunk) => {
  serverOutput += chunk;
  process.stdout.write(chunk);
});
server.stderr.on("data", (chunk) => {
  serverOutput += chunk;
  process.stderr.write(chunk);
});

process.on("exit", stopServer);
process.on("SIGINT", () => {
  stopServer();
  process.exit(130);
});

function stopServer() {
  if (!server.killed) {
    server.kill();
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function request(port, method, route, body, headers = {}) {
  const payload = body ? Buffer.from(body) : null;

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: "127.0.0.1",
        port,
        path: route,
        method,
        headers: {
          ...(payload ? { "Content-Length": payload.length } : {}),
          ...headers
        },
        timeout: 5000
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: Buffer.concat(chunks).toString("utf8")
          });
        });
      }
    );

    req.on("timeout", () => {
      req.destroy(new Error(`${method} ${route} timed out`));
    });
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function waitForServer() {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    for (let offset = 0; offset <= MAX_PORT_ATTEMPTS; offset += 1) {
      const port = START_PORT + offset;
      try {
        const response = await request(port, "GET", "/");
        if (response.statusCode === 200 && response.body.includes("Shonode")) {
          return port;
        }
      } catch {}
    }
    await wait(150);
  }

  throw new Error(`Server did not become ready. Output:\n${serverOutput}`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertHeader(response, headerName) {
  assert(response.headers[headerName], `Missing response header: ${headerName}`);
}

async function main() {
  const port = await waitForServer();
  const baseUrl = `http://127.0.0.1:${port}`;

  const home = await request(port, "GET", "/");
  assert(home.statusCode === 200, `Expected GET / to return 200, got ${home.statusCode}`);
  assert(home.body.includes("Shonode"), "Home page does not include Shonode branding.");
  assert(home.body.includes("octo-workbench-state.js"), "Home page does not load Story Workbench state.");
  assert(home.body.includes("data-start-workflow"), "Home page does not include the guided workflow launcher.");
  REQUIRED_HEADERS.forEach((header) => assertHeader(home, header));

  const head = await request(port, "HEAD", "/");
  assert(head.statusCode === 200, `Expected HEAD / to return 200, got ${head.statusCode}`);
  REQUIRED_HEADERS.forEach((header) => assertHeader(head, header));

  const stateScript = await request(port, "GET", "/octo-workbench-state.js");
  assert(stateScript.statusCode === 200, `Expected octo state script 200, got ${stateScript.statusCode}`);
  assert(stateScript.body.includes("ShonodeOctoState"), "Story Workbench state API was not served.");

  const workbenchScript = await request(port, "GET", "/octo-workbench.js");
  assert(workbenchScript.statusCode === 200, `Expected octo workbench script 200, got ${workbenchScript.statusCode}`);
  assert(workbenchScript.body.includes("initShonodeOctoWorkbench"), "Story Workbench script was not served.");

  const scan = await request(
    port,
    "POST",
    "/api/security-scan",
    JSON.stringify({ url: `${baseUrl}/` }),
    { "Content-Type": "application/json" }
  );
  assert(scan.statusCode === 200, `Expected security scan 200, got ${scan.statusCode}`);
  const parsedScan = JSON.parse(scan.body);
  assert(parsedScan.summary, "Security scan response did not include a summary.");

  console.log(
    `[smoke] ${baseUrl} passed. Security score ${parsedScan.summary.score}, findings ${parsedScan.summary.totalFindings}.`
  );
}

main()
  .catch((error) => {
    console.error(`[smoke] ${error.message}`);
    process.exitCode = 1;
  })
  .finally(stopServer);
