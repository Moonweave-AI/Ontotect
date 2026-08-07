---
type: how-to
status: draft
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 180
summary: Practical command routes and completion criteria for common ontology build, review, repair, optimization, refactoring, validation, governance, and release scenarios.
canonical: docs/en/scenario-playbooks.md
related:
  - docs/en/command-reference.md
  - ontotect/references/workflow.md
  - ontotect/references/review-repair-refactor.md
supersedes: null
superseded_by: null
---

# Scenario playbooks

[简体中文](../zh-CN/scenario-playbooks.md) · [Documentation home](index.md)

These playbooks show starting routes, not one-size-fits-all scripts. Replace targets and acceptance evidence with the actual project contract.

## Build a new ontology

```text
Use Ontotect. Command: build. Target: create a calibration-evidence ontology from the approved brief and competency questions, through integrated verification.
```

Start at `charter`. Reuse before minting terms, conceptualize independently of syntax, choose the weakest sufficient semantic stack, and implement vertical slices. Complete only when requested CQs have observable evidence, affected logic and SHACL tests pass, domain review is recorded, and unavailable checks are explicit.

## Review an existing ontology

```text
Use Ontotect. Command: review. Target: inspect ontology.ttl, imports, shapes, data, queries, and release policy without changing files.
```

Freeze the review target and reconstruct missing requirements as assumptions. Inspect conceptual commitments, high-impact axioms, profile/global restrictions, expected entailments and non-entailments, SHACL targets, CQ result sets, identifiers, mappings, documentation, and governance. Findings need evidence, impact, confidence, root cause, remediation, verification path, and Owner.

## Repair a known defect

```text
Use Ontotect. Command: repair. Target: reproduce and minimally correct the unexpected type inference while preserving public IRIs and approved CQ answers.
```

Preserve a baseline, reproduce the failure, identify the smallest causal axiom or process gap, and confirm whether the expectation or ontology is wrong. Apply the smallest authorized correction. Rerun the failing test and interacting logic, SHACL, CQ, mapping, build, and documentation checks. Do not delete a strong axiom merely to make a tool green.

## Optimize measurable performance

```text
Use Ontotect. Command: optimize. Target: reduce classification time under the approved dataset while preserving listed entailments and query answers.
```

Define metric, representative workload, environment, budget, and protected semantic results. Profile first, change one factor at a time, compare before and after, and rerun semantic regressions. Smaller files or fewer axioms alone are not evidence of optimization.

## Refactor without changing meaning

```text
Use Ontotect. Command: refactor. Target: split modules and normalize qualified relations while preserving the public vocabulary and entailment contract.
```

Freeze public IRIs, imports, protected axioms, inferred hierarchy, CQ answers, mappings, and supported materializations. Compare asserted and inferred results after the change. An IRI rename or referent change is a migration, not a refactor.

## Validate a candidate

```text
Use Ontotect. Command: validate. Target: run the release acceptance matrix against source.ttl, shapes.ttl, valid and invalid fixtures, and competency queries.
```

State the graph, import closure, profile, entailment regime, validator configuration, and expected results. Report parse, OWL, CQ, SHACL, metadata, documentation, domain, and operational outcomes separately. Do not redesign by default.

## Establish governance

```text
Use Ontotect. Command: govern. Target: define Owner, DRI, domain review, identifier policy, change classes, deprecation, maintenance, and release authority.
```

Record decisions in repository artifacts rather than chat. Never recycle an IRI. Couple policy to checks where practical while retaining human semantic review. Unknown or incompatible redistribution rights block bundling an asset.

## Prepare a release

```text
Use Ontotect. Command: release. Target: assess release readiness, semantic change, migration obligations, distribution set, approvals, and residual risks.
```

Require source ontology, supported distributions, import policy, shapes, CQs/tests, mappings, documentation, metadata, semantic impact, migration material, actual evidence, and release approval. The command may prepare artifacts when authorized but must not publish remotely without explicit authority.

## Work one stage only

```text
Use Ontotect. Command: stage reuse. Target: compare three candidate vocabularies against CQs, commitments, maintenance, dependency cost, and license.
```

`stage <stage>` narrows scope; it does not waive earlier prerequisites. Report missing inputs and the next gate rather than fabricating upstream decisions.
