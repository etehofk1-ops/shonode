# shonode-mcp-server

Local **stdio MCP bridge** for the Shonode `.shonode` storyboard format.

It is the second client of your own data model: Shonode is the human canvas,
this MCP lets Claude / Codex read and author the same projects.

## Boundary (important)

This server stops at **prompt generation + handoff**. It never calls an image
or video model itself. Actual generation is delegated to **Codex**:

```
Shonode (콘티·연출)  →  .shonode  →  [MCP] export_prompt_batch  →  handoff jsonl
                                                                        │
                                            Codex: image-prompt(공냥) → codex-imagegen   (stills)
                                            Codex: seedance pipeline                      (video)
                                                                        │
                          결과 영상 파일명  →  [MCP] merge_results  →  .shonode (videoFileName)
```

The MCP does **not** apply 공냥 철칙 (no negatives / 끝 AR / HEX / 6 sections) —
each cut's raw prompt is the *rough input* to Codex's `image-prompt` skill,
which compiles and validates it (`check_prompt.mjs`).

**Layer 2 (`shonode_generate_storyboard`)** intentionally opens this boundary for
the *plan* step only: it calls Gemini **text** `generateContent` to turn a brief
into an importable `.shonode` (projectDraft + cuts). Image/video generation stays
delegated to Codex. Requires a Gemini key — env `GEMINI_API_KEY`, else the project
root `.env` (same key the app/server use).

## Tools

| Tool | What it does | Writes? |
|------|--------------|---------|
| `shonode_read_project` | Parse a `.shonode` → concise summary (no base64 dump) | no |
| `shonode_export_prompt_batch` | `.shonode` → Codex handoff jsonl (`gpt-image-2` \| `seedance`) | optional `out_path` |
| `shonode_create_project` | Build a fresh, import-ready `.shonode` from a cut list | optional `out_path` |
| `shonode_merge_results` | Write generated **video** filenames into a `.shonode` **and/or** emit a still-image sidecar manifest | yes |
| `shonode_generate_storyboard` | Brief → Gemini → import-ready `.shonode` (the only model-calling tool; Gemini **text** only) | optional `out_path` |

### Handoff jsonl (gpt-image-2)
One line per cut that has a `t2iPrompt`:
```json
{"cut_id":"panel-…","seq":1,"title":"야근 시작","intent":"사무실 늦은 밤","mode":"t2i","t2i_raw":"…","refs":[{"id","name","hasData"}],"identity_pack_ids":[],"ar":"9:16","size":"1024x1792","duration":"3s","next":["panel-…"],"target":"gpt-image-2"}
```
- `ar` is read from `project.aspectRatio` (override with the `ar` arg) and mapped to one of the 6 codex size locks.
- `seedance` target emits `{ …, i2v:{start,motion,end,omni} }` instead of `t2i_raw`.

### Stills round-trip (image sidecar)
Generated stills live in the app's IndexedDB (`ShonodePanelImageStorage`), not in
the `.shonode` JSON. `shonode_merge_results` now base64-encodes still files into a
sidecar manifest (`<path>.images.json`, `shonode-image-manifest-v1`); the app's
import hook (`importPanelImageManifest`) recovers them onto panels by `cut_id`.
The `.shonode` itself stays base64-free.

## Install & test

```bash
npm install --prefix mcp
npm run check --prefix mcp   # node --check on entry points
npm run smoke --prefix mcp   # exercises create → read → export → merge
```

## Wire into an MCP client

stdio server — point your client at `node <abs>/mcp/index.js`.

```jsonc
{
  "mcpServers": {
    "shonode": {
      "command": "node",
      "args": ["D:/Projects/에테호랩스/projects/Shonode/mcp/index.js"]
    }
  }
}
```

No environment variables or network access required.
