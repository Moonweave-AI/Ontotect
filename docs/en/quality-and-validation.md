---
type: reference
status: draft
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 180
summary: Evidence layers, result semantics, quality levels, and tool boundaries for validating ontology-engineering work with Ontotect.
canonical: docs/en/quality-and-validation.md
related:
  - ontotect/references/validation-and-testing.md
  - ontotect/assets/evidence-manifest.json
  - ontotect/assets/release-checklist.md
supersedes: null
superseded_by: null
---

# Quality and validation

[简体中文](../zh-CN/quality-and-validation.md) · [Documentation home](index.md)

Ontology quality is multidimensional. A file may parse while its classes are unsatisfiable; a logically consistent ontology may fail its competency questions; a conforming data graph may still embody the wrong domain meaning. Ontotect therefore reports independent evidence rather than one “valid” flag.

## Ten evidence layers

1. Parse and serialization.
2. Metadata, identifiers, annotations, and dependency hygiene.
3. OWL profile and global restrictions.
4. Consistency, satisfiability, classification, and expected entailments.
5. Expected non-entailments and incoherence traps.
6. Competency-question SPARQL results.
7. SHACL under an explicit data graph, shapes graph, and entailment regime.
8. Pitfall, taxonomy, module, mapping, and documentation review.
9. Domain-expert validation and user acceptance.
10. Performance and scale when operational limits are contractual.

Run applicable layers separately and preserve their inputs, configuration, output, exit status, and limitations. A check may be not applicable, but the reason must be stated.

## Check results and gate dispositions

Individual evidence checks use:

| Check result | Meaning |
|---|---|
| `pass` | The check executed and met its criterion |
| `fail` | The check executed and did not meet its criterion |
| `error` | The check did not complete because of tool, input, or environment failure |
| `accepted-exception` | Authority accepted a known failure with rationale, scope, and a review condition |
| `unverified` | The check was not executed or cannot support the claim |
| `not-applicable` | The approved contract excludes this evidence layer, with rationale |

`accepted-exception` is a separate overlay, not a replacement result. Record
its authority, rationale, scope, durable decision artifact, and review/expiry
condition. A release exception must also be permitted by release policy and
release authority. Lifecycle and release gates use `pass`,
`pass-with-actions`, `revise`, `blocked`, or `unverified`, following the
precedence defined in the runtime command contract. Tool errors require
diagnosis. They do not automatically mean the ontology failed, and an exception
never erases the underlying result or justifies a fabricated pass.

## Evidence design

For every must-have competency question, define an observable oracle: exact query answers, an expected entailment, an expected non-entailment, a SHACL result, expert judgment, or policy approval. Critical constraints need conforming and deliberately violating fixtures. Tests should fail when essential semantics regress, not merely parse the same syntax.

For repair, refactor, and optimization, compare baseline and candidate across public IRIs, asserted axioms, inferred consequences, CQs, SHACL, mappings, documentation, and relevant performance. An asserted graph diff is only one layer.

## Bundled scripts

```powershell
python ontotect/scripts/ontology_audit.py ontology.ttl --data data.ttl --shapes shapes.ttl --json
python ontotect/scripts/ontology_diff.py before.ttl after.ttl --json
```

The audit requires RDFLib and optionally pySHACL. It reports structural findings and SHACL results but not complete OWL consistency, class satisfiability, profile conformance, or entailment. The diff compares asserted RDF graphs, not inferred semantic closure.

Use an appropriate reasoner and project toolchain for logical claims. Record import closure, profile, entailment regime, catalogs, and relevant options so reviewers can interpret the result.

## Quality level

Scale evidence to user impact, integration reach, reversibility, scientific or regulatory consequence, and automation permissions. Public reusable skill behavior should receive documentation, security, compatibility, representative scenario, and regression review. A high quality label is not earned by adding more ceremony; it is earned by producing the evidence required by the actual risk.

The detailed quality model remains canonical in [validation-and-testing.md](../../ontotect/references/validation-and-testing.md).
Checks actually executed for this source package are recorded separately in
the [local verification record](verification-record.md).
