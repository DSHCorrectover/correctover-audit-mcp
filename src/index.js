#!/usr/bin/env node
/**
 * correctover-audit-mcp — MCP server exposing the free self-service
 * MCP session-security audit API (Correctover).
 *
 * Tools:
 *   audit_mcp_server  — run 3 read-only probes against an MCP endpoint and
 *                       return a re-verifiable verdict (JSON).
 *
 * Audit API: https://correctover-api.pages.dev/v1/audit (public, no key)
 * Methodology & evidence: https://github.com/DSHCorrectover/mcp-session-audit
 * Read-only probes only; audit YOUR OWN endpoint or endpoints you are
 * authorized to test.
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const API = process.env.CORRECTOVER_AUDIT_API || 'https://correctover-api.pages.dev/v1/audit';
const pkg = JSON.parse(readFileSync(fileURLToPath(new URL('../package.json', import.meta.url)), 'utf8'));

async function runAudit(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 90000);
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (!res.ok) return { error: `audit API HTTP ${res.status}`, target: url };
    const j = await res.json();
    return {
      target: j.target,
      verdict: j.verdict,
      tests: j.tests,
      audited_at: j.audited_at,
      methodology: 'https://github.com/DSHCorrectover/mcp-session-audit',
      reproduce: `curl -s -X POST ${API} -H "Content-Type: application/json" -d '{"url":"${url}"}'`,
      disclaimer: j.disclaimer,
    };
  } catch (e) {
    clearTimeout(t);
    return { error: String(e && e.message || e), target: url };
  }
}

const server = new McpServer({ name: 'correctover-audit-mcp', version: pkg.version });

server.tool(
  'audit_mcp_server',
  'Run a free, read-only session-security audit against an MCP server endpoint (3 probes, no handshake forgery). Returns a re-verifiable verdict such as "unauthenticated-surface". Use on endpoints you own or are authorized to test.',
  { url: z.string().url().describe('MCP endpoint URL, e.g. https://your-server.example/mcp') },
  async ({ url }) => ({
    content: [{ type: 'text', text: JSON.stringify(await runAudit(url), null, 2) }],
  }),
);

const transport = new StdioServerTransport();
await server.connect(transport);
