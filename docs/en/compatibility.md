---
type: reference
status: draft
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 180
summary: Portability contract, installation roots, and honest verification boundaries for Ontotect across common Agent Skills hosts.
canonical: docs/en/compatibility.md
related:
  - ontotect/references/agent-compatibility.md
  - docs/en/installation.md
  - docs/en/npm-and-npx-installation.md
  - ontotect/scripts/install_skill.py
supersedes: null
superseded_by: null
---

# Compatibility

[简体中文](../zh-CN/compatibility.md) · [Documentation home](index.md)

Ontotect uses one portable skill package: lowercase `ontotect/`, a `SKILL.md` with minimal frontmatter, and relative `references/`, `assets/`, and `scripts/`. Optional `agents/openai.yaml` metadata can be ignored by other hosts.

Manual copy, the Python installer, and the npm/npx installer are three delivery paths for that same directory. They do not create host-specific skill forks.

## Host matrix

| Host | Project discovery root | Portable invocation |
|---|---|---|
| Cursor | `.cursor/skills/ontotect/` | Explicit Agent protocol; host shortcut when available |
| Codex | `.agents/skills/ontotect/` | `Use Ontotect...` or `$ontotect ...` when supported |
| Kilo | `.kilo/skills/ontotect/` or `.agents/skills/ontotect/` | Explicit Agent protocol; host shortcut when available |
| OpenCode | `.opencode/skills/ontotect/` or `.agents/skills/ontotect/` | Explicit Agent protocol; host shortcut when available |
| Claude Code | `.claude/skills/ontotect/` | Explicit Agent protocol or `/ontotect ...` when exposed |

Host discovery and global paths can change. Use [agent-compatibility.md](../../ontotect/references/agent-compatibility.md) for the maintained details and official documentation links.

## Portability requirements

- Keep the complete directory intact and resolve bundled resources relative to `SKILL.md`.
- Do not require a Claude-only interpolation feature, Codex-only metadata, or one shell syntax.
- Let the host enforce file, command, network, package, and remote-resource permissions.
- Treat `$ontotect` and `/ontotect` as optional shorthand; the explicit Agent protocol is universal documentation.
- Run Python scripts only when the user request and host permissions allow it.
- Treat the Node CLI as an explicit copy adapter: no lifecycle scripts, no network behavior, fixed roots, and no overwrite without `--force`.
- Fail with an actionable message when optional RDF tooling is absent.

## What compatibility claims mean

There are three distinct levels:

1. **Structural** — directory copied, frontmatter parsed, and relative files exist.
2. **Discovery** — the actual host lists or activates Ontotect in a live session.
3. **Behavioral** — the host follows routing, reads progressive references, respects permissions, and produces the required evidence contract.

Do not collapse them. Local copying into five expected directory layouts demonstrates only structural packaging until each external product is launched and observed. Record per-host tests and mark unexecuted discovery or behavior `unverified`.

The npm package adds a fourth, distribution-level question: whether the tarball contains only intended public files and exposes the expected binary. Passing package inspection still proves neither live-host discovery nor ontology-engineering behavior.

## Behavioral smoke test

1. Confirm Ontotect appears in the host, if it has a skill list.
2. Request `Use Ontotect. Command: help. Target: first-time user.`
3. Request `router` for a harmless ontology scenario.
4. Confirm it loads `references/workflow.md` only when needed.
5. Confirm loading does not execute scripts or ask for unrelated permission.
6. Run a read-only review against a synthetic fixture and inspect evidence labels.

Compatibility is maintained through the open format and behavioral contract, not dependency or host-version pinning.
