# correctover-audit-mcp

Free self-service **MCP session-security audit** as an MCP server. Ask your agent to audit an MCP endpoint and get a **re-verifiable verdict** (e.g. `unauthenticated-surface`) from 3 read-only probes — no handshake forgery, no exploit payloads.

Part of the Session-as-Identity research line: [DSHCorrectover/mcp-session-audit](https://github.com/DSHCorrectover/mcp-session-audit) (protocol + CI action + evidence).

## Install (one line)

```bash
claude mcp add correctover-audit -- npx -y github:DSHCorrectover/correctover-audit-mcp
```

Then ask your agent: *"audit https://your-server.example/mcp for session-security issues"*.

## What it checks

| probe | meaning |
|---|---|
| `initialize` (anonymous) | does the server issue a session at all? |
| `tools/list` (zero handshake) | can an anonymous client enumerate the full tool inventory? |

Verdict classes: `unauthenticated-surface` (exposed) / `authenticated-ok` / `error-*`.

## Honest scope

- Read-only probes only; audit endpoints you own or are authorized to test.
- The verdict is evidence-grade (timestamps + reproduction command), not a certification.
- Deeper fail-closed review with signed evidence dossiers: wangguigui@correctover.com

MIT © 2026 Guigui Wang (Correctover) — "We sell the verdict, and you can re-verify it yourself."
