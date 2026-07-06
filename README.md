# Shonode

Shonode is a lightweight, open-source storyboard node canvas for planning AI-assisted commercial videos.

It lets you arrange shots on a freeform canvas, connect them like nodes, attach reference images, generate `I2I / T2I / I2V` planning prompts, and save the whole workspace as a single `.shonode` project file.

> Status: early prototype / community experiment. Shonode is not a finished commercial product. Expect rough edges, missing tests, and fast-moving UI ideas.

## Features

- Freeform storyboard canvas with pan / zoom
- Shot cards connected as visual nodes
- AI Director brief input for shot planning
- Reference image board with drag reordering
- Selected-shot regeneration flow
- Project export / import with `.shonode`
- Local static server plus optional Gemini proxy
- Vercel-compatible serverless API route

## What this repo does not include

- No hosted API key
- No bundled `.env`
- No private project files
- No hosted AI proxy unless you explicitly opt in

If you deploy Shonode publicly, you are responsible for protecting your own AI API key and usage quota.

## Quick start

### 1. Install prerequisites

- Node.js `>=20`

This prototype currently uses only Node built-ins and browser APIs, so there is no dependency install step.

### 2. Configure environment

Copy `.env.example` to `.env` and set your own Gemini key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
PORT=4173
# Optional: bind only to loopback by default. Use 0.0.0.0 only on trusted networks.
# SHONODE_HOST=127.0.0.1
# Optional: comma-separated web origins allowed to call /api/storyboard
# SHONODE_ALLOWED_ORIGINS=https://your-domain.example
# Optional: tighter or looser per-IP proxy limit for self-hosting
# SHONODE_RATE_LIMIT_PER_MINUTE=20
# Optional: comma-separated Gemini model allowlist
# SHONODE_ALLOWED_GEMINI_MODELS=gemini-2.5-flash,gemini-2.5-flash-lite
```

Do not commit `.env` or real API keys.

### 3. Start locally

Use npm:

```bash
npm start
```

Or run Node directly:

```bash
node server.js
```

Then open:

```text
http://127.0.0.1:4173
```

You can also open `index.html` directly for UI-only work, but AI generation is intended to run through the local proxy server.
The security quick scan runs as a server-backed passive audit and is intended for local/dev workflows by default.

## Local quality checks

```bash
npm run check
npm run smoke
```

- `npm run check` validates the JavaScript entry points with `node --check`.
- `npm run smoke` starts the local server on a temporary port, checks the main UI, confirms security headers, verifies Story Workbench assets, and runs the passive security scan.

## Security quick scan

Open `http://127.0.0.1:4173/security-scan.html` to paste a URL and run a lightweight passive security audit.

- Checks HTTPS, HSTS, CSP, clickjacking headers, cookie flags, CORS, mixed content, and simple CSRF hints
- Allows localhost scans by default for local development
- Requires `SHONODE_SECURITY_SCAN_TOKEN` on deployed environments before scans are allowed
- Blocks private-network targets on deployed environments unless `SHONODE_ALLOW_PRIVATE_SECURITY_SCAN=1` is set intentionally

## AI proxy behavior

Shonode uses a small server-side proxy for Gemini requests:

- Local server: `server.js` exposes `POST /api/storyboard`
- Vercel route: `api/storyboard.js` delegates to the same proxy handler
- Shared validation / upstream call: `storyboard-proxy.js`

The browser client should never contain your Gemini API key. Set `GEMINI_API_KEY` only in a local `.env` file or server-side deployment environment variables.

The hosted Vercel API route is disabled by default. To enable it for your own deployment, set `SHONODE_ENABLE_HOSTED_AI_PROXY=true` server-side and keep the other protections in place:

- built-in per-IP rate limiting via `SHONODE_RATE_LIMIT_PER_MINUTE`
- default Gemini model allowlist via `SHONODE_ALLOWED_GEMINI_MODELS`
- stricter origin allowlist via `SHONODE_ALLOWED_ORIGINS`
- usage monitoring
- request logging with secret redaction
- optional authentication or invite gating

## Project file format

Shonode exports projects as `.shonode` files.

The file is a JSON-based workspace snapshot containing:

- project metadata
- card content and positions
- prompts
- reference images
- selection state
- zoom / scroll state
- sidebar state

Import supports both:

- `.shonode`
- legacy `.json` workspace backups

## Main files

- `index.html` — app structure
- `style.css` — UI styling
- `script.js` — canvas / card interactions
- `shotboard-ai.js` — AI workflow, sidebars, attached images, import/export
- `guided-template-engine.js` — guided storyboard template generation
- `octo-workbench-state.js` — Story Workbench local state and board handoff helpers
- `octo-workbench.js` — Story Workbench UI integration
- `ai-client.js` — AI request builder / response mapping
- `server.js` — local static server and API proxy route
- `storyboard-proxy.js` — shared Gemini proxy handler
- `security-scan-proxy.js` — passive security scan handler
- `api/storyboard.js` — Vercel serverless entry point
- `mcp/` — Model Context Protocol bridge (prompt export + AI director)
- `brand/` — Shonode logo and mark assets

## Deployment notes

Shonode can be deployed as a static frontend with a server-side `/api/storyboard` route.
Keep the Gemini key only in server-side environment variables and never place it back into client files.
The local server sets baseline CSP, frame, referrer, permissions, and content-type security headers, and binds to loopback unless `SHONODE_HOST` is set.

For Vercel:

1. Configure `GEMINI_API_KEY` in Vercel environment variables.
2. Configure `GEMINI_MODEL` if you want a model other than the default.
3. Set `SHONODE_ALLOWED_ORIGINS` to your production origin if needed.
4. Do not expose real keys in client-side files.

## Contributing

Pull requests, issues, experiments, and small collaboration ideas are welcome. See `CONTRIBUTING.md`.

## Security

Please do not open public issues containing API keys, prompts with private data, or exported project files that include sensitive references. See `SECURITY.md`.

## License

Code is released under the MIT License. See `LICENSE`.

Brand assets in `brand/` are included for repository presentation and Shonode-related use. If you want to use the Shonode name or logo for a separate product, please ask first.
