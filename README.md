# Shonode

Shonode is a lightweight storyboard workspace for planning AI-assisted commercial videos.
It lets you arrange cuts on a free canvas, connect them like nodes, attach images, generate `I2I / T2I / I2V` prompts, and save the whole workspace as a single project file.

## Features

- Freeform storyboard canvas with pan / zoom
- AI Director brief input and attached-image based cut planning
- Cut-to-cut node connections
- Attached image board with drag reordering
- Selected-cut regeneration
- Project export / import with `.shonode`

## Run Locally

### 1. Create an env file

Copy [.env.example](.env.example) to `.env` and set your Gemini key.

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
PORT=4173
# Optional: comma-separated custom web origins for the AI proxy
# SHONODE_ALLOWED_ORIGINS=https://shonode.vercel.app,https://your-domain.com
```

### 2. Start the local server

```bash
cd path/to/Shonode
npm start
```

For a direct Node run:

```bash
node server.js
```

### 3. Open the app

```text
http://127.0.0.1:4173
```

### 4. Open the security quick scan

```text
http://127.0.0.1:4173/security-scan.html
```

### Note

You can still open [index.html](index.html) directly for UI-only work, but AI generation is now intended to run through the local proxy server.
The security quick scan runs as a server-backed passive audit and is intended for local/dev workflows by default.

## Local Quality Checks

```bash
npm run check
npm run smoke
```

- `npm run check` validates the JavaScript entry points with `node --check`.
- `npm run smoke` starts the local server on a temporary port, checks the main UI, confirms security headers, verifies Story Workbench assets, and runs the passive security scan.

## Security Quick Scan

The `security-scan.html` page lets you paste a URL and run a lightweight passive security audit.

- Checks HTTPS, HSTS, CSP, clickjacking headers, cookie flags, CORS, mixed content, and simple CSRF hints
- Allows localhost scans by default for local development
- Requires `SHONODE_SECURITY_SCAN_TOKEN` on deployed environments before scans are allowed
- Blocks private-network targets on deployed environments unless `SHONODE_ALLOW_PRIVATE_SECURITY_SCAN=1` is set intentionally

For deeper exploit validation, use the Shannon command shown in the report once Docker and Shannon-compatible credentials are available.

## Project File Format

Shonode exports projects as `.shonode` files.

- Example: `My Project-2026-03-24.shonode`
- The file is a JSON-based workspace snapshot
- It contains:
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

## Main Files

- [index.html](index.html): app structure
- [style.css](style.css): UI styling
- [script.js](script.js): canvas / card interactions
- [shotboard-ai.js](shotboard-ai.js): AI workflow, sidebars, attached images, import/export
- [guided-template-engine.js](guided-template-engine.js): guided storyboard template generation
- [octo-workbench-state.js](octo-workbench-state.js): Story Workbench local state and board handoff helpers
- [octo-workbench.js](octo-workbench.js): Story Workbench UI integration
- [ai-client.js](ai-client.js): AI request builder / response mapping
- [brand](brand): Shonode brand assets

## Deployment Note

The prototype now includes a local proxy server in [server.js](server.js).
For public deployment, keep the Gemini key only in server-side environment variables and do not place it back into client files.
The local server also sets baseline CSP, frame, referrer, permissions, and content-type security headers.

## Deployment Workflow

Shonode is now connected to both GitHub and Vercel.

- `main`: production branch
- `preview`: staging / preview branch for Vercel preview deployments

Recommended flow:

1. work locally
2. push to `preview` to check the hosted preview build
3. merge or push to `main` when ready for production

Current setup notes:

- Production environment variables are configured in Vercel
- Preview environment variables are configured for the `preview` branch
- Repository: `https://github.com/etehofk1-ops/shonode`
