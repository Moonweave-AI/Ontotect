---
type: explanation
status: draft
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 180
summary: How Ontotect routes ontology-engineering requests into modes, lifecycle stages, evidence gates, and ordered follow-on work.
canonical: docs/en/routing-and-workflow.md
related:
  - ontotect/references/workflow.md
  - ontotect/references/command-router.md
  - ontotect/assets/route-card.md
supersedes: null
superseded_by: null
---

# Routing and workflow

[简体中文](../zh-CN/routing-and-workflow.md) · [Documentation home](index.md)

Ontology work rarely arrives as a clean lifecycle step. A request such as “fix the ontology” may conceal a wrong requirement, category error, overly strong OWL axiom, incorrect SHACL target, import change, or release-policy failure. Ontotect routes by intended outcome and evidence, not by keywords alone.

## Router decision model

The canonical command is `router`; `route` is an alias. The router inspects the goal, current artifacts, known failure, desired outcome, permission boundary, and lifecycle state, then selects one primary mode and an entry stage.

Coordination commands are the exception: `help` has no lifecycle stage, and
`status` reports the stage reconstructed from evidence or `unverified`.

| Request evidence | Primary mode | Typical entry |
|---|---|---|
| New ontology or authorized extension | `build` | `charter`, or the earliest incomplete stage |
| “Assess”, “audit”, “find defects”, no edits | `review` | Freeze target, then `verify` and trace backward |
| Reproducible wrong inference, query, shape, or build | `repair` | Failure reproduction, then earliest causal stage |
| Measured latency, memory, scale, or review burden | `optimize` | Baseline and protected invariants |
| Structural improvement with intended meaning preserved | `refactor` | Preservation contract before transformation |
| Run specified checks or determine conformance | `validate` | Applicable verification layers |
| Ownership, identifiers, change control, deprecation, maintenance | `govern` | Authority and policy |
| Release readiness, migration, approval, publication set | `release` | Integrated verification and release gate |

If the request lacks enough information, route with explicit assumptions and ask only questions that materially change the path. Do not turn routing uncertainty into permission to edit.

## Lifecycle stages

Ontotect uses an evidence-producing loop:

1. **Charter** — purpose, stakeholders, scope, competency questions, roles, constraints, and acceptance methods.
2. **Reuse** — acquire evidence and decide direct reuse, import, module, specialization, mapping, or new terms.
3. **Conceptualize** — analyze categories, identity, taxonomy, relations, time, dependence, examples, and counterexamples.
4. **Formalize** — choose SKOS/RDFS/OWL/SHACL/SPARQL roles, profiles, IRIs, imports, modules, axioms, and operational assumptions.
5. **Implement** — build small vertical slices with terms, annotations, axioms, shapes, queries, and positive/negative fixtures.
6. **Verify** — execute independent syntax, logic, CQ, SHACL, review, domain, documentation, and operational evidence.
7. **Release** — classify semantic change, prepare migrations, approve the release set, publish, and assign maintenance.

Evidence may send work backward. A failed reasoner check may expose a formalization defect; inconsistent domain classification may expose a conceptual or requirement defect. Returning to an earlier stage is controlled iteration, not failure of the process.

## Gates and dispositions

Each stage ends with one disposition:

- `pass`: required evidence succeeded;
- `pass-with-actions`: no blocking defect, with owned follow-up;
- `revise`: evidence shows the contract is unmet;
- `blocked`: required authority, source, license, dependency, or safety condition is absent;
- `unverified`: a required check was not executed or cannot be trusted.

Never convert `unverified` to `pass` because the result seems plausible. A tool failure is not automatically an ontology failure; interpret environment, input, import closure, profile, and entailment regime first.

These are lifecycle-gate dispositions. Individual checks instead use `pass`,
`fail`, `error`, `unverified`, or justified `not-applicable`.
`accepted-exception` is recorded as a separate overlay. Gate precedence is:
unexcepted required failure -> `revise`; otherwise a known missing prerequisite
-> `blocked`; otherwise missing or uninterpretable required evidence ->
`unverified`; otherwise valid exceptions or owned non-blocking work ->
`pass-with-actions`; otherwise `pass`.

## Multi-mode requests

Choose one primary mode at a time and publish the chain:

```text
review -> repair/refactor/optimize -> validate -> govern/release
```

For example, “review and fix” starts with a read-only baseline and findings. Only after the defect, intended meaning, and authorization are clear does it enter repair. Validation then reruns the affected regression set, and release assesses compatibility and approvals.

## Visible work state

At every material gate, report:

- command, primary mode, and current stage;
- established facts, assumptions, and decisions;
- inspected or changed artifacts;
- checks actually run and evidence status;
- authorization and protected invariants;
- blockers, unresolved domain questions, and next gate.

Use `status` to render this compactly. The work state exposes decisions and evidence, not private chain-of-thought.

The detailed stage outputs and stop rules remain canonical in [workflow.md](../../ontotect/references/workflow.md).
