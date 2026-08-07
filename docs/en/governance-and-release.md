---
type: how-to
status: draft
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 180
summary: Apply ownership, semantic change control, identifier policy, deprecation, migration, provenance, and release gates to ontology work.
canonical: docs/en/governance-and-release.md
related:
  - ontotect/references/governance-and-release.md
  - ontotect/assets/change-proposal.md
  - ontotect/assets/release-checklist.md
supersedes: null
superseded_by: null
---

# Governance and release

[简体中文](../zh-CN/governance-and-release.md) · [Documentation home](index.md)

Ontology governance controls meaning over time. It assigns authority, protects identifiers and consumers, records evidence, and keeps a published vocabulary maintainable.

## Assign decision rights

Record an accountable Owner, working DRI/maintainer, domain reviewer, ontology engineer, consumer representative, release authority, and infrastructure steward as applicable. One person may hold several roles, but the responsibility must remain visible in issues, decision records, release records, or ontology annotations—not only chat.

## Classify semantic change

Classify from consumer impact, not text diff:

- **patch-compatible**: documentation, metadata, serialization, or implementation correction without changing the protected contract;
- **additive**: new terms or axioms that preserve intended results but may add entailments or validation outcomes;
- **deprecating**: old identifiers remain while consumers move to governed replacements;
- **breaking**: meaning, entailment, constraint, identifier, mapping, profile, or query behavior requires consumer action.

An added domain, range, disjointness, equivalence, cardinality, or property characteristic can be breaking even if no term is removed.

## Protect identifiers

Never reuse a public IRI for a different referent. Separate stable ontology identity from versioned documents. Define how current, versioned, deprecated, and retired resources resolve. An IRI rename is a migration; a label correction is not automatically one.

For deprecation, retain the IRI, preserve its last stable meaning, state reason and effective release, provide a valid replacement only when justified, document data/query migration, and monitor adoption.

## Prepare the release set

Use `release` to assess and prepare:

- canonical ontology source and supported distributions/modules;
- import/catalog policy and dependency behavior;
- shapes, CQs, positive/negative fixtures, entailment and query tests;
- mappings with scope, provenance, confidence, and review state;
- human and machine-readable metadata and documentation;
- semantic diff, change class, deprecations, and migrations;
- actual evidence results, accepted exceptions, residual risk, and approvals;
- maintenance, rollback, withdrawal, and succession paths.

Publication to a remote registry, repository, PURL service, or endpoint requires explicit authority beyond preparing the artifacts.

## Provenance and licensing

Record provenance for requirements, reused terms, modules, mappings, generated artifacts, reviews, and releases. Validate redistribution permission separately from semantic fit. Linking to an IRI does not automatically permit copying its source; citation does not relicense it.

Ontotect's original repository content is released under the [MIT License](../../LICENSE). Private construction books, papers, vendor documents, extracted text, and third-party works outside that grant are excluded from the public release.

## Release disposition

Use `pass`, `pass-with-actions`, `revise`, `blocked`, or `unverified`. Release authority approves actual evidence, not the Agent's confidence. A complete release lets consumers identify what changed, understand semantic impact, obtain the intended artifacts, validate them, migrate when necessary, and find the accountable maintainer.

Keep the underlying check result separate from an `accepted-exception`. An
exception can support `pass-with-actions` only when its authority, rationale,
scope, durable record, review condition, and release-policy permission are
complete; otherwise apply the command contract's `revise`, `blocked`, then
`unverified` precedence.

The full policy remains canonical in [governance-and-release.md](../../ontotect/references/governance-and-release.md).
