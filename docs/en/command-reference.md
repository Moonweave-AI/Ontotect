---
type: reference
status: draft
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 180
summary: Canonical public reference for Ontotect Agent commands, lifecycle-stage commands, routing aliases, and the separate navigator CLI.
canonical: docs/en/command-reference.md
related:
  - ontotect/references/command-contract.md
  - ontotect/references/command-router.md
  - ontotect/scripts/ontotect.py
  - docs/decisions/0001-portable-command-router.md
supersedes: null
superseded_by: null
---

# Command reference

[简体中文](../zh-CN/command-reference.md) · [Documentation home](index.md)

Ontotect defines a host-neutral Agent command protocol. It is a prompt contract, not a shell command and not a claim that every host registers the same slash-command UI.

## Portable Agent protocol

Use this form on every host:

```text
Use Ontotect. Command: <command>. Target: <target or goal>.
```

Hosts that expose skills through shortcuts may also accept `$ontotect <command> ...` or `/ontotect <command> ...`. Treat those as conveniences; the explicit protocol is canonical.

## Coordination commands

| Command | Purpose | Default mutation |
|---|---|---|
| `help` | Explain Ontotect, commands, examples, limits, and next choices | Read-only |
| `router` | Select the primary mode, entry stage, evidence path, and next command | Read-only |
| `route` | Alias of `router`; output must identify canonical command as `router` | Read-only |
| `status` | Summarize current mode, stage, decisions, artifacts, checks, blockers, and next gate | Read-only |

`router` should be invoked automatically when a request matches Ontotect but lacks a clear mode or stage. Routing does not authorize file changes.

## Mode commands

| Command | Use when | Normal route | Mutation rule |
|---|---|---|---|
| `build` | Create or extend an ontology | Charter through release as requested | Writes only when requested |
| `review` | Inspect and report defects | Freeze target, verify, trace causes | Read-only |
| `repair` | Correct a reproduced defect | Baseline, reproduce, minimal repair, regress | Requires edit authorization |
| `optimize` | Improve a measured cost or complexity | Baseline, profile, change, compare | Requires edit authorization |
| `refactor` | Improve structure under a preservation contract | Freeze invariants, transform, semantic diff | Requires edit authorization |
| `validate` | Execute specified evidence without redesign | Requested checks plus interpretive prerequisites | Read-only by default |
| `govern` | Define ownership, change, identifiers, deprecation, or maintenance | Authority and policy before controls | Writes only when requested |
| `release` | Evaluate and prepare a release disposition | Integrated evidence, semantic impact, approval | No publication without explicit authority |

For combined work, use `review -> repair/refactor/optimize -> validate -> govern/release`. Do not silently repair during `review` or redesign during `validate`.

## Lifecycle-stage commands

Use `stage <stage>` to perform or plan one lifecycle stage:

| Stage | Outcome |
|---|---|
| `charter` | Purpose, users, scope, CQs, roles, constraints, acceptance evidence |
| `reuse` | Attributable candidate assessment and reuse/import/module/mapping decision |
| `conceptualize` | Terms, categories, definitions, taxonomy, relations, examples, unresolved questions |
| `formalize` | Semantic stack, profile, IRIs, modules, axioms, constraints, assumptions |
| `implement` | A tested vertical slice answering one or more CQs |
| `verify` | Integrated syntax, logic, CQ, SHACL, review, domain, and operational evidence |
| `release` | Change class, migration, release set, approvals, publication readiness |

Examples:

```text
Use Ontotect. Command: stage conceptualize. Target: the proposed maintenance-event domain.
Use Ontotect. Command: stage verify. Target: ontology/source.ttl and the approved acceptance matrix.
```

Direct stage names may be accepted as aliases. `stage release` always means lifecycle Stage G; bare `release` means the release mode command.

## Python navigator CLI

`ontotect/scripts/ontotect.py` is a deterministic navigator for terminals and automation. It parses command names and prints the corresponding guidance or route card. It does **not** read the ontology, invoke an Agent, run a reasoner, execute SHACL, edit files, or publish a release.

```powershell
python ontotect/scripts/ontotect.py help
python ontotect/scripts/ontotect.py router "Review and fix ontology.ttl"
python ontotect/scripts/ontotect.py build ontology.ttl --from-stage charter --to-stage verify
python ontotect/scripts/ontotect.py stage conceptualize
```

Its output is an input to an Agent session or a planning aid, not engineering evidence. Use `ontology_audit.py`, `ontology_diff.py`, project toolchains, and qualified reasoners for the checks they actually support.

## Output contract

Every command should make visible: command and stage, facts and assumptions, authorization, artifacts, evidence status, decisions, semantic impact, blockers, and next gate. Never expose hidden chain-of-thought; expose decision-relevant evidence and uncertainty. Mark an unavailable or unexecuted check `unverified`.

The runtime command specifications under `ontotect/references/command-*.md` are the behavioral source of truth. This page is their public reference projection.
