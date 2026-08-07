---
type: decision
status: accepted
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 180
summary: Adopt one host-neutral Ontotect command protocol, an automatic router, and a separate read-only Python navigator instead of host-specific behavior forks.
canonical: docs/decisions/0001-portable-command-router.md
related:
  - ontotect/SKILL.md
  - ontotect/references/command-contract.md
  - ontotect/scripts/ontotect.py
  - docs/en/command-reference.md
supersedes: null
superseded_by: null
---

# ADR 0001: Portable command protocol and router

[简体中文](0001-portable-command-router.zh-CN.md)

## Status

Accepted by the Owner on 2026-08-07 for the initial public repository and npm release.

## Context

Ontotect must operate in Cursor, Codex, Kilo, OpenCode, Claude Code, and other Agent Skills hosts. Those products discover skill directories and expose invocations differently. A slash command registered in one host is not a portable API in another.

Ontology requests also mix outcomes and lifecycle stages. “Fix and release this ontology” requires review, authorized repair, validation, governance, and a release gate; choosing one verb from a flat command list is insufficient. Users need a first-contact help path, automatic routing, visible state, and stage-specific control.

A terminal-friendly interface is useful, but a local Python program cannot substitute for the host Agent, permission system, ontology toolchain, reasoner, domain review, or release authority.

## Decision

1. Define the host-neutral protocol:

   ```text
   Use Ontotect. Command: <command>. Target: <target or goal>.
   ```

2. Treat `$ontotect ...` and `/ontotect ...` as optional host conveniences, not canonical behavior.
3. Provide coordination commands `help`, `router`, `status`; `route` is an alias normalized to `router`.
4. Provide mode commands `build`, `review`, `repair`, `optimize`, `refactor`, `validate`, `govern`, and `release`.
5. Provide lifecycle stages `charter`, `reuse`, `conceptualize`, `formalize`, `implement`, `verify`, and `release`, addressable as `stage <stage>` and, where unambiguous, direct aliases.
6. Interpret bare `release` as the release mode and `stage release` as lifecycle Stage G.
7. Invoke the router automatically when an Ontotect request has no clear mode or stage. Router output selects a primary mode, entry stage, evidence path, authorization boundary, and next command; it is not proof or permission.
   `help` uses `n/a` rather than a fabricated lifecycle stage; `status` reports
   a stage reconstructed from evidence or `unverified`.
8. Compose multi-mode work as `review -> repair/refactor/optimize -> validate -> govern/release` unless evidence justifies another explicit route.
9. Keep `review`, `validate`, `help`, `router`, and `status` read-only by default. Other commands write only within explicit user authorization; remote publication always needs explicit authority.
10. Provide `ontotect/scripts/ontotect.py` as a deterministic, read-only navigator that prints command and route cards. It does not call an Agent, read or edit the ontology, run validators/reasoners, or publish.

Runtime command specifications under `ontotect/references/command-*.md` are the behavioral source of truth. Public docs mirror them.

## Consequences

### Positive

- One command vocabulary works in natural-language Agent interfaces across hosts.
- Users can start with `help` or a goal rather than knowing the lifecycle.
- Mode and stage remain distinct, supporting both outcome-driven and stage-scoped work.
- Read/write and evidence boundaries are explicit.
- The navigator supports deterministic terminal discovery without pretending to execute engineering.
- Progressive command references keep `SKILL.md` focused.

### Costs and limitations

- Host-native autocomplete and visual slash-command behavior may differ.
- Documentation and runtime command references must remain synchronized.
- A route still requires Agent judgment and may need domain clarification.
- Navigator output is not validation evidence and must not be presented as one.

## Alternatives considered

### Separate host-specific command implementations

Rejected as the canonical design because behavior would drift and require five interfaces to remain semantically equivalent. Thin host adapters may be added later if they preserve this contract.

### One monolithic `ontotect` command without verbs

Rejected because users cannot request a read-only review, constrained stage, or release gate precisely, and Agents would reconstruct routing inconsistently.

### Python CLI executes the ontology workflow

Rejected because it would duplicate Agent behavior, require a fixed toolchain, blur permissions, and falsely imply that deterministic command parsing supplies domain judgment or OWL evidence.

### Independent skill package for every mode

Rejected for now because it duplicates shared operating rules, assets, and references. It can be revisited if host discovery or context measurements show a concrete need.

## Acceptance evidence

- Every documented command resolves to one runtime command specification.
- English and Chinese command references expose the same command and stage sets.
- `route` normalizes to `router`.
- Navigator `--help` and representative commands return guidance without editing fixtures.
- Blind scenarios route new work, review, repair, validation, and release to the expected stages.
- Unsupported or unexecuted evidence remains `unverified`.

No hash, dependency pin, or host-version lock is required to accept this interface decision.
