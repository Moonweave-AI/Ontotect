---
type: decision
status: accepted
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 90
summary: Compile one canonical Ontotect workflow into a suite of focused, independently discoverable skills, then add thin command adapters only where host slash discovery requires them.
canonical: docs/decisions/0004-host-discovery-and-command-adapters.md
related:
  - docs/decisions/0001-portable-command-router.md
  - bin/ontotect.js
  - ontotect/scripts/install_skill.py
  - ontotect/assets/skill-suite.json
  - ontotect/references/agent-compatibility.md
  - docs/en/troubleshooting-discovery.md
supersedes: null
superseded_by: null
---

# ADR 0004: Discoverable skill suite and command adapters

[简体中文](0004-host-discovery-and-command-adapters.zh-CN.md)

## Status

Accepted for the cross-host discovery repair on 2026-08-07.

## Context

Publishing `@moonweave-ai/ontotect` to npm makes an archive available; it does
not register a skill in a local Agent. On the affected machine no `ontotect`
directory was present in any selected project or user skill root. The package
had been published but never installed there.

The original package installed one super-skill whose modes and lifecycle stages
were internal commands. That is adequate for natural-language routing, but it
produces only one discoverable skill entry. It cannot create the systematic
slash-selector experience shown by Moonweave Governance Skills, whose menu is
formed from multiple independent Agent Skills plus thin host command adapters.

Host invocation also differs:

- Codex uses `$<skill-name>` or `/skills`; it has no supported project command
  directory that can create a portable `/ontotect-review` command.
- Cursor and Claude Code expose each installed skill natively as
  `/<skill-name>`.
- Current Kilo builds can expose skills as slash commands, while its documented
  workflow interface also supports `.kilo/commands/`.
- Stable OpenCode documentation separates skills from slash commands and uses
  `.opencode/commands/` for the latter.

Therefore package acquisition, local installation, focused skill discovery,
slash-command discovery, and host refresh are separate facts.

## Decision

1. Keep `ontotect/SKILL.md` and its references as the canonical ontology-
   engineering behavior. ADR 0001's command, lifecycle, evidence, and authority
   contracts remain in force.
2. Define the public suite once in `ontotect/assets/skill-suite.json`. It maps
   every discoverable skill name to a display name, trigger description, fixed
   canonical command, and short UI description.
3. Install twenty focused entries by default:
   - `ontotect`;
   - `ontotect-help`, `ontotect-router`, and `ontotect-status`;
   - `ontotect-build`, `ontotect-review`, `ontotect-repair`,
     `ontotect-optimize`, `ontotect-refactor`, `ontotect-validate`,
     `ontotect-govern`, and `ontotect-release`;
   - `ontotect-stage` plus `ontotect-charter`, `ontotect-reuse`,
     `ontotect-conceptualize`, `ontotect-formalize`, `ontotect-implement`,
     `ontotect-verify`, and `ontotect-stage-release`.
4. Generate each focused entry during installation by copying the complete
   canonical skill directory, replacing `SKILL.md` with matching frontmatter and
   a fixed-command preamble, and generating matching `agents/openai.yaml` UI
   metadata. Every installed entry is self-contained and retains all local
   references, assets, and scripts.
5. Use `--suite full` by default. `--suite core` preserves the former one-skill
   installation for users who prefer minimal discovery.
6. Generate Kilo and OpenCode Markdown command adapters from the same suite
   registry when `--commands auto` is selected. Each adapter loads the matching
   focused skill and forwards `$ARGUMENTS`; it does not duplicate ontology
   engineering semantics. `--commands none` suppresses these adapters.
7. Do not create deprecated Codex custom prompts. In Codex, document
   `$ontotect-review`, `$ontotect-router`, and `/skills`; in Codex Desktop the
   installed focused skills may also appear in the slash selector.
8. Let Cursor and Claude use their native skill slash entries. Do not add a
   second legacy command tree that would create duplicate or conflicting names.
9. Preflight the core skill, every generated skill, every command file, and any
   stale target recorded by a prior managed install. Reject symlink/junction
   escape and wrong target kinds. If any active target exists, refuse the entire
   install unless `--force` is explicit. Stage all outputs before a rename
   transaction; use rollback backups during commit. A forced refresh cleanly
   replaces managed targets and removes only stale names from path-only install
   state. Unrelated command files and unknown sibling skills are preserved.
10. Keep `plan` read-only, make `list` expose the complete registry, and require
    explicit `install` for mutations. npm acquisition and lifecycle hooks never
    install files implicitly.
11. Document per-host refresh and diagnostics. Structural installation, UI
    discovery, and behavioral execution remain separate evidence levels.

## Why this follows the Governance Skills pattern

Moonweave Governance Skills uses focused skill directories, a command map, thin
host adapters, a platform target map, and an installer. Ontotect adopts the same
separation of concerns with a smaller compilation model:

- `skill-suite.json` combines the focused-skill registry and command mapping;
- the installer compiles focused entries from one canonical Ontotect source;
- generated skills supply the menu/discovery system;
- Kilo/OpenCode Markdown files supply compatibility commands;
- `list`, `plan`, and tests expose the generated contract before mutation.

Ontotect intentionally does not copy Governance Skills' always-on governance
rules, GitHub templates, hashes, version locks, or multilingual duplicate menu
entries because those do not solve ontology skill discovery.

## Consequences

### Positive

- Codex, Cursor, and Claude can enumerate a real Ontotect skill system rather
  than one entry with hidden internal verbs.
- Kilo and OpenCode receive the same command vocabulary even when a release does
  not automatically map skills to slash commands.
- Every focused entry is self-contained, so selecting `ontotect-review` does not
  depend on a second skill being loaded implicitly.
- One registry and one canonical workflow limit semantic drift despite multiple
  installed entries.
- The root router remains available for users who do not know which focused
  entry to choose.

### Costs and limitations

- A full installation creates twenty skill directories per selected host and
  twenty additional command files for Kilo/OpenCode.
- The generated copies use more local disk than a single skill, although the npm
  archive still ships one canonical source.
- Codex's explicit typed syntax remains `$name`, not a universally guaranteed
  `/name` command.
- Filesystem tests prove structural installation only. Live-host discovery and
  execution require a refreshed host session and separate observation.

## Alternatives considered

### Keep only one super-skill

Rejected as the default because it cannot provide the requested systematic
skill-selector surface. It remains available through `--suite core`.

### Hand-maintain twenty complete source copies

Rejected because operating rules, references, and fixes would drift. The
installer instead compiles self-contained copies from one canonical source and
one registry.

### Install command files without focused skills

Rejected because Codex does not support a portable project command directory,
and commands alone do not create the Agent Skills menu shown in the reference
design.

### Add a postinstall hook

Rejected because package acquisition must not silently mutate projects or user
configuration. Installation remains an explicit command.

## Acceptance evidence

- `ontotect list --json` exposes twenty unique skill-to-command mappings.
- A full all-host plan shows five core targets, five groups of nineteen
  generated focused skills, and two groups of twenty Kilo/OpenCode adapters.
- Generated directory names, `SKILL.md` names, fixed commands, and OpenAI display
  metadata agree with the registry.
- Every generated skill contains the canonical references, assets, and ontology
  engineering scripts; the nested distribution installer is intentionally
  omitted from focused copies.
- `--suite core` and `--commands none` preserve an explicit minimal path.
- Any existing core skill, focused skill, or command file blocks all writes
  without `--force`.
- Symlink/junction escape and wrong target kinds fail before staging; clean
  force refresh removes state-recorded stale entries and preserves unknown
  siblings.
- A packed local npm archive installs the full matrix in an isolated project.
- Skill Creator validation passes for the canonical skill and representative or
  complete generated entries.
- Live-host UI discovery is reported only after the relevant host is refreshed
  and observed.

No checksum, dependency pin, host-version lock, or cryptographic manifest is
part of this decision.
