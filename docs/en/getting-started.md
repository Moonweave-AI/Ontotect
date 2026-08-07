---
type: tutorial
status: draft
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 180
summary: A first-use tutorial that installs Ontotect, asks for help, routes a request, and performs an evidence-led review.
canonical: docs/en/getting-started.md
related:
  - docs/en/installation.md
  - docs/en/command-reference.md
  - docs/en/troubleshooting-discovery.md
  - ontotect/assets/project-brief.md
supersedes: null
superseded_by: null
---

# Getting started

[简体中文](../zh-CN/getting-started.md) · [Documentation home](index.md)

This tutorial installs the full Ontotect skill suite in one project, discovers
its focused entries, routes an ontology request, and starts a read-only review.
It does not require the private research corpus.

## 1. Install into a project

From the repository root, list the suite and preview the destinations:

```powershell
node bin/ontotect.js list
python ontotect/scripts/install_skill.py --agents all --scope project --project-root .
```

The Python installer is dry-run by default. Inspect the five core targets, five
groups of 19 generated entries, and Kilo/OpenCode command targets, then apply:

```powershell
python ontotect/scripts/install_skill.py --agents all --scope project --project-root . --apply
```

Existing Ontotect targets are not overwritten unless you explicitly add
`--force`. Reload or start a new Agent session after installation.

## 2. Ask Ontotect what it can do

Use the focused Help entry when the host exposes installed skills:

```text
Codex: $ontotect-help
Cursor / Claude / Kilo / OpenCode: /ontotect-help
```

The host-neutral fallback is `Use Ontotect. Command: help. Target: first-time
user.` The response should explain the suite, list modes and stages, show
examples, and state that the bundled audit and diff scripts are not complete OWL
semantic verification.

## 3. Route an actual goal

Use the focused Router skill when the correct mode or entry stage is unclear:

```text
Codex: $ontotect-router review our shipping ontology, repair defects, and prepare release evidence.
Slash hosts: /ontotect-router review our shipping ontology, repair defects, and prepare release evidence.
```

`route` is an alias for `router`. The route card should identify:

- primary mode and entry lifecycle stage;
- facts, assumptions, missing inputs, and permission boundary;
- artifacts and references to inspect;
- evidence to run and the exit criterion;
- the ordered follow-on route, normally `review -> repair -> validate -> release` for this example.

Routing is not proof and does not authorize edits. It makes the next decision explicit.

## 4. Start with a read-only review

Put the ontology, imports or catalog, shapes, representative data, competency
questions, and build configuration in the project where the Agent can read
them. Then invoke `ontotect-review`:

```text
Codex: $ontotect-review ontology/source.ttl and its shapes, tests, imports, and intended contract. Do not modify files.
Slash hosts: /ontotect-review ontology/source.ttl and its shapes, tests, imports, and intended contract. Do not modify files.
```

A good review freezes the target, reconstructs missing intent as assumptions, runs only available checks, and produces evidence-linked findings. It should not silently repair the ontology.

## 5. Inspect the result

Expect a decision-ready result with:

1. outcome and current mode/stage;
2. ontology contract and protected assumptions;
3. exact artifacts inspected;
4. checks actually executed and their configuration;
5. prioritized findings with affected terms or axioms;
6. semantic and downstream impact;
7. `unverified` items and residual risk;
8. next gate, Owner, reviewer, and completion criterion.

Parser success alone is not semantic success. SHACL conformance does not prove OWL consistency, and an asserted RDF diff does not prove preservation of inferred entailments.

## 6. Continue deliberately

- Known defect with authorized edits: use `ontotect-repair`.
- Structural change with a preservation contract: use `ontotect-refactor`.
- Targeted checks only: use `ontotect-validate`.
- New ontology or extension: use `ontotect-build`.
- Ownership, deprecation, or release work: use `ontotect-govern` or
  `ontotect-release`.
- One lifecycle step only: use its focused entry, such as
  `ontotect-conceptualize`, or use `ontotect-stage conceptualize`.

Read [Command reference](command-reference.md) for the complete mapping and
[Troubleshoot discovery](troubleshooting-discovery.md) if the entries do not
appear after refresh.
