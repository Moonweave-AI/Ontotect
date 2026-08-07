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
  - ontotect/assets/project-brief.md
supersedes: null
superseded_by: null
---

# Getting started

[简体中文](../zh-CN/getting-started.md) · [Documentation home](index.md)

This tutorial installs Ontotect in one project, discovers the command surface, routes an ontology request, and starts a read-only review. It does not require the private research corpus.

## 1. Install into a project

From the repository root, preview the destinations:

```powershell
python ontotect/scripts/install_skill.py --agents all --scope project --project-root .
```

The installer is dry-run by default. Inspect the plan, then copy the complete skill directory:

```powershell
python ontotect/scripts/install_skill.py --agents all --scope project --project-root . --apply
```

Existing destinations are not overwritten unless you explicitly add `--force`. Reload or start a new Agent session if the host does not refresh its skill list.

## 2. Ask Ontotect what it can do

The most portable Agent request is:

```text
Use Ontotect. Command: help. Target: first-time user.
```

Where supported, `$ontotect help` or `/ontotect help` is a convenience spelling. The response should explain the skill, list modes and stages, show examples, and state that the bundled audit and diff scripts are not complete OWL semantic verification.

## 3. Route an actual goal

Use the canonical `router` command when the correct mode or entry stage is unclear:

```text
Use Ontotect. Command: router. Target: review our shipping ontology, repair defects, and prepare release evidence.
```

`route` is an alias for `router`. The route card should identify:

- primary mode and entry lifecycle stage;
- facts, assumptions, missing inputs, and permission boundary;
- artifacts and references to inspect;
- evidence to run and the exit criterion;
- the ordered follow-on route, normally `review -> repair -> validate -> release` for this example.

Routing is not proof and does not authorize edits. It makes the next decision explicit.

## 4. Start with a read-only review

Put the ontology, imports or catalog, shapes, representative data, competency questions, and build configuration in the project where the Agent can read them. Then request:

```text
Use Ontotect. Command: review. Target: ontology/source.ttl and its shapes, tests, imports, and intended contract. Do not modify files.
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

- Known defect with authorized edits: use `repair`.
- Structural change with a preservation contract: use `refactor`.
- Targeted checks only: use `validate`.
- New ontology or extension: use `build`.
- Ownership, deprecation, or release work: use `govern` or `release`.
- One lifecycle step only: use `stage <stage>`, for example `stage conceptualize`.

Read [Command reference](command-reference.md) before relying on host-specific shorthand, and [Scenario playbooks](scenario-playbooks.md) for full examples.
