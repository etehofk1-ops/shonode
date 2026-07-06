# Security Policy

Shonode is an early prototype. Please treat it as self-hosted experimental software, not as a hardened production SaaS.

## Supported versions

Security fixes are currently handled on the `main` branch only.

## Reporting a vulnerability

Please do not publish secrets, private prompts, exported `.shonode` files, or exploit details in a public issue.

If you find a vulnerability, open a minimal issue that describes the affected area without sensitive data, or contact the maintainer privately if you already have a trusted channel.

## API key safety

- Never commit `.env` files.
- Never put `GEMINI_API_KEY` in browser/client code.
- Configure AI provider keys only as server-side environment variables.
- Rotate any key that was accidentally committed or pasted into public logs.

## Server-side routes are opt-in on hosted deployments

Both server-side routes that reach the network are **disabled by default** so that a
plain `git clone` + deploy does not expose them:

- `POST /api/storyboard` (Gemini proxy) requires `SHONODE_ENABLE_HOSTED_AI_PROXY=true`.
  It also enforces a per-IP rate limit (`SHONODE_RATE_LIMIT_PER_MINUTE`), a Gemini model
  allowlist (`SHONODE_ALLOWED_GEMINI_MODELS`), request size caps, and an origin allowlist.
- `POST /api/security-scan` (passive scanner) requires `SHONODE_ENABLE_HOSTED_SECURITY_SCAN=true`
  **and** a `SHONODE_SECURITY_SCAN_TOKEN` for any non-local request.

Run either route locally without these flags; they only gate hosted/serverless exposure.

## Security scanner (SSRF) notes

The passive scanner fetches a remote URL, so it is an SSRF-sensitive surface:

- Private / loopback / link-local targets are blocked for non-local requesters unless
  `SHONODE_ALLOW_PRIVATE_SECURITY_SCAN=1` is set intentionally.
- Redirects are followed manually (max 5 hops) and **every hop is re-validated**, so a
  public URL cannot bounce to `169.254.169.254` or a private IP after the initial check.
- Non-`http(s)` redirect targets are rejected.

Known residual: there is a small time-of-check/time-of-use window between the DNS safety
check and the actual fetch (DNS rebinding). Closing it fully requires connect-time IP
pinning. Keep the scanner disabled on untrusted public deployments.

## Client-side hardening

- The local server and the Vercel config send a strict Content-Security-Policy
  (`script-src 'self'`, no `unsafe-inline`), plus `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, and `Permissions-Policy`.
- The static file server rejects path traversal, null bytes, backslashes, dotfiles, and
  any extension outside a small allowlist, and binds to loopback unless `SHONODE_HOST` is set.
- Imported `.shonode` / `.json` workspaces are validated and sanitized (size caps, panel
  caps, string caps, data-URL MIME allowlist, local/same-origin media URLs), and untrusted
  text is HTML-escaped at render time to prevent DOM XSS. Still, only import project files
  you trust — importing runs no scripts but a malicious file can carry crafted content.

## Public deployment checklist

Before exposing a hosted Shonode instance publicly, add or verify:

- keep `SHONODE_ENABLE_HOSTED_AI_PROXY` and `SHONODE_ENABLE_HOSTED_SECURITY_SCAN` unset
  unless you truly need them
- strict `SHONODE_ALLOWED_ORIGINS`
- rate limiting for `/api/storyboard`
- request body size limits appropriate for your host
- usage alerts for your AI provider account
- secret redaction in logs
- optional authentication or invite gating

The repository includes prototype validation in `storyboard-proxy.js` and
`security-scan-proxy.js`, but this should not be treated as complete abuse protection for a
public service.
