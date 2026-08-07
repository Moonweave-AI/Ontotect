---
type: how-to
status: draft
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 90
summary: Install the complete Ontotect skill suite and host command adapters through the explicit Node/npx or Python installer.
canonical: docs/en/installation.md
related:
  - ontotect/references/agent-compatibility.md
  - ontotect/scripts/install_skill.py
  - docs/en/npm-and-npx-installation.md
  - docs/en/compatibility.md
  - docs/en/troubleshooting-discovery.md
supersedes: null
superseded_by: null
---

# Installation

[简体中文](../zh-CN/installation.md) · [Documentation home](index.md)

Use the installer for the Ontotect suite. Do not manually scatter wrapper files
among host directories: the installer compiles all focused skills from one
canonical source, generates presentation metadata, adds compatibility commands
where required, and preflights the whole transaction before writing.

> [!IMPORTANT]
> Public `@moonweave-ai/ontotect@0.1.1` predates the focused-suite compiler. It
> installs the earlier single `ontotect` skill and does not provide `list`,
> `--suite`, `--commands`, focused entries, or command adapters. Until a later
> suite version is published, use the current source checkout or a locally
> packed archive for the workflow on this page.

## Install with npx after the suite release

List the 20 discoverable entries:

```powershell
npx @moonweave-ai/ontotect list
```

Preview a full project-scoped installation:

```powershell
npx @moonweave-ai/ontotect plan --agents all --scope project --project-root .
```

Apply the reviewed plan:

```powershell
npx @moonweave-ai/ontotect install --agents all --scope project --project-root .
```

The default is `--suite full --commands auto`. The plan contains:

- one canonical `ontotect` target for each selected host;
- 19 generated focused skill targets for each selected host;
- 20 explicit command adapters for Kilo and OpenCode.

Package acquisition alone does not install skills. There is no install or
postinstall lifecycle hook.

## Install from a source checkout

Run these commands from the Ontotect checkout and replace the example target
path. The Node entry is the current canonical behavior that the next suite npm
binary will expose:

```powershell
node bin/ontotect.js list
node bin/ontotect.js plan --agents all --scope project --project-root C:\path\to\target-project
node bin/ontotect.js install --agents all --scope project --project-root C:\path\to\target-project
```

The Python installer is dry-run by default:

```powershell
python ontotect/scripts/install_skill.py --agents all --scope project --project-root C:\path\to\target-project
python ontotect/scripts/install_skill.py --agents all --scope project --project-root C:\path\to\target-project --apply
```

Both installers read `ontotect/assets/skill-suite.json`, generate matching
focused `SKILL.md` and `agents/openai.yaml` files, and use the same target
matrix.

## Choose hosts and scope

Select a subset with `--agents cursor,codex` in Node/npx or
`--agents cursor codex` in Python. `--agents all` targets all five.

| Host key | Project skill root | User skill root |
|---|---|---|
| `cursor` | `.cursor/skills/` | `~/.cursor/skills/` |
| `codex` | `.agents/skills/` | `~/.agents/skills/` |
| `kilo` | `.kilo/skills/` | `~/.kilo/skills/` |
| `opencode` | `.opencode/skills/` | `~/.config/opencode/skills/` |
| `claude` | `.claude/skills/` | `~/.claude/skills/` |

Kilo commands use project `.kilo/commands/` or user
`~/.config/kilo/commands/`. OpenCode commands use project
`.opencode/commands/` or user `~/.config/opencode/commands/`.

`--scope user` uses the operating-system home directory. `--project-root` only
selects project-scoped output.

## Choose the discovery surface

The bare `ontotect` examples below assume that the current checkout was installed
with `npm install --global .`, or that a later focused-suite release is in use.
They do not describe public `0.1.1`.

Use the full suite unless a minimal installation is intentional:

```powershell
ontotect install --agents codex --scope user --suite full
ontotect install --agents codex --scope user --suite core --commands none
```

`full` creates Help, Router, Status, all eight engineering modes, generic Stage,
and seven stage-specific entries. `core` creates only `ontotect`.

`--commands auto` generates Kilo/OpenCode adapters from the same registry.
`--commands none` suppresses them. Cursor, Codex, and Claude never receive
redundant command files.

## Conflict and update behavior

The installer checks every core skill, focused skill, and command file before
copying anything. One existing Ontotect-owned target blocks the entire request:

```powershell
ontotect plan --agents all --scope user --json
ontotect install --agents all --scope user --force
```

Use `--force` only after reviewing the paths and deciding to cleanly replace
the generated installation. The installer stages every output before commit,
uses rollback backups during the commit, and records only managed entry names
in `.ontotect-suite.json`. A later forced refresh removes stale entries from
that state but preserves unknown sibling skills and unrelated files in shared
`commands/` directories. Symlink/junction escapes and wrong target types are
rejected before staging. No checksum or version lock is used.

## Refresh and invoke

After installation, reload the host or start a new session:

| Host | First discovery check |
|---|---|
| Codex | `/skills`, then `$ontotect-help` and `$ontotect-review` |
| Cursor | `/ontotect-help` and `/ontotect-review` |
| Kilo | `/reload`, then `/ontotect-help` through the generated command adapter |
| OpenCode | Restart, then `/ontotect-help` through the installed adapter |
| Claude Code | Existing skill directories update live; use `/ontotect-help`. Restart only if the top-level `.claude/skills/` directory was created after the session started |

A valid directory proves structural installation only. Record live discovery
and behavior separately. See [Troubleshoot discovery](troubleshooting-discovery.md)
when an entry is missing.

## Optional ontology tools

The installer needs only Node or Python's standard library. Ontotect's advisory
ontology audit can optionally use RDFLib and pySHACL, but these are not installed
merely to load the skill. If a requested validator or reasoner is unavailable,
report the check `unverified` or obtain authorization before changing the
environment.
