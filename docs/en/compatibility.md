---
type: reference
status: draft
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 90
summary: Host discovery roots, focused skill invocations, command adapters, refresh behavior, and verification boundaries for the Ontotect skill suite.
canonical: docs/en/compatibility.md
related:
  - ontotect/references/agent-compatibility.md
  - docs/en/installation.md
  - docs/en/npm-and-npx-installation.md
  - docs/en/troubleshooting-discovery.md
  - docs/decisions/0004-host-discovery-and-command-adapters.md
supersedes: null
superseded_by: null
---

# Compatibility

[简体中文](../zh-CN/compatibility.md) · [Documentation home](index.md)

Ontotect ships one canonical ontology-engineering source and compiles it into a
20-entry focused skill suite during explicit installation. Every generated
entry is a complete Agent Skill with matching directory/frontmatter names,
fixed command semantics, local references, assets, scripts, and optional OpenAI
UI metadata.

> [!IMPORTANT]
> This matrix describes the focused-suite compiler in the current source tree
> and in locally packed archives. Public `@moonweave-ai/ontotect@0.1.1`
> predates it and installs only the earlier `ontotect` root skill. It does not
> provide `list`, suite selection, focused entries, or command adapters.

This follows the useful separation in Moonweave Governance Skills: focused
skills create the discoverable system; thin host commands provide compatibility;
the installer owns placement; and a registry prevents mapping drift.

## Host matrix

| Host | Project skill root | User skill root | Focused entry | Command adapters | Refresh |
|---|---|---|---|---|---|
| Cursor | `.cursor/skills/` | `~/.cursor/skills/` | `/ontotect-review` | None; native Skills are preferred | Reopen the session/project |
| Codex | `.agents/skills/` | `~/.agents/skills/` | `$ontotect-review` or `/skills` | None; no supported project command root | Usually automatic; restart if stale |
| Kilo | `.kilo/skills/` | `~/.kilo/skills/` | Native skill/tool loading; `/ontotect-review` is supplied only by the generated command adapter | `.kilo/commands/`; user `~/.config/kilo/commands/` | `/reload` or new session |
| OpenCode | `.opencode/skills/` | `~/.config/opencode/skills/` | Native skill tool; newer builds may expose slash | `.opencode/commands/`; user `~/.config/opencode/commands/` | Restart |
| Claude Code | `.claude/skills/` | `~/.claude/skills/` | `/ontotect-review` | None; legacy commands are unnecessary | Live detection for an existing skills directory; restart only after creating the top-level directory during a session |

Codex Desktop may enumerate enabled focused skills inside its slash selector,
but Codex CLI/IDE's documented explicit syntax remains `$skill-name`. Do not
advertise `/ontotect-review` as a universal Codex custom command.

## Installed suite

`--suite full` installs:

- root, Help, Router, and Status;
- Build, Review, Repair, Optimize, Refactor, Validate, Govern, and Release;
- generic Stage plus Charter, Reuse, Conceptualize, Formalize, Implement,
  Verify, and Stage Release.

`--suite core` installs only `ontotect`. `ontotect list` is the authoritative
projection of focused names to canonical commands.

Kilo/OpenCode `--commands auto` output uses the same names and maps each command
to the identically named focused skill. Cursor and Claude receive no redundant
legacy command files. Codex receives no unsupported command files.

## Portability requirements

- Keep directory name and frontmatter `name` identical.
- Keep each generated directory complete; do not copy only `SKILL.md`.
- Treat generated installation directories as output. Change the canonical
  source or suite registry, then reinstall.
- Let the host enforce file, command, network, package, and remote-resource
  permissions.
- Use the host's actual invocation syntax and refresh mechanism.
- Run optional Python/RDF tools only when the user request and permissions allow
  it; report unavailable checks `unverified`.
- Do not introduce checksums, dependency pins, or host locks merely to solve
  discovery.

## Compatibility evidence levels

1. **Distribution** — the npm archive exposes the installer, source, registry,
   and intended public files.
2. **Structural installation** — all planned core, focused, and command targets
   exist with consistent names and resources.
3. **Live discovery** — the actual refreshed host lists or invokes a focused
   entry.
4. **Behavioral compatibility** — the focused entry follows its fixed command,
   resolves references, respects permissions, and produces Ontotect evidence.

Do not collapse these levels. Isolated filesystem installation proves level 2,
not levels 3 or 4.

## Smoke test

1. From the current checkout, run `node bin/ontotect.js list`, then a dry-run
   plan. A locally installed current package may use `ontotect list` instead.
2. Install through the source Node/Python installer or a local suite archive;
   do not use public `0.1.1` for this matrix and do not manually scatter wrapper
   files.
3. Refresh the host.
4. Confirm Help, Router, Review, Validate, and one lifecycle-stage entry appear
   or can be explicitly invoked.
5. Run Help, route a harmless request, and perform a read-only fixture review.
6. Confirm no script runs merely because a skill was loaded.
7. Record structural, discovery, and behavioral results separately.

For exact official links and product-specific diagnosis, use
[agent-compatibility.md](../../ontotect/references/agent-compatibility.md) and
[Troubleshoot discovery](troubleshooting-discovery.md).
