---
type: explanation
status: draft
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 180
summary: Answers to common questions about Ontotect scope, commands, semantics, validation, sources, installation, and licensing.
canonical: docs/en/faq.md
related:
  - docs/en/getting-started.md
  - docs/en/command-reference.md
  - ontotect/references/decision-guide.md
supersedes: null
superseded_by: null
---

# Frequently asked questions

[简体中文](../zh-CN/faq.md) · [Documentation home](index.md)

## What is Ontotect?

An Agent Skill that supplies a systematic ontology-engineering workflow for design, construction, review, repair, optimization, refactoring, validation, governance, and release. It is not an ontology editor, triple store, or complete reasoner.

## Where should a first-time user start?

Run `help`, then describe the goal to `router`. Follow [Getting started](getting-started.md) for a complete first route.

## Is `route` different from `router`?

No. `router` is canonical and `route` is an alias. Output should normalize to `router`.

## Are the commands shell commands?

The portable commands are Agent prompt contracts. Use `Use Ontotect. Command: review. Target: ...`. The Python `ontotect.py` navigator only prints command guidance; it does not perform the ontology work.

## Does `npx ontotect install` perform ontology engineering?

No. The npm executable only plans or copies the complete skill into fixed host discovery roots. It does not run the Agent workflow, validators, reasoners, repairs, or publication. Public `npx ontotect` also requires a future authorized npm release; use `node bin/ontotect.js` in the current source Preview.

## Why separate `validate` from `verify`?

`validate` is a mode for requested checks. `verify` is the integrated lifecycle stage that assembles all applicable evidence before a gate. Similarly, `build` spans a lifecycle while `implement` creates one vertical slice.

## Does SHACL conformance prove the ontology is correct?

No. SHACL evaluates a data graph against shapes under a configuration. It does not by itself prove OWL consistency, satisfiability, intended entailments, domain correctness, or user acceptance.

## Can Ontotect prove OWL consistency?

Only when an appropriate reasoner is actually run against the intended import closure and configuration. The bundled audit script cannot make that claim and must mark it `unverified` when no reasoner evidence exists.

## Does `ontology_diff.py` prove a refactor preserved semantics?

No. It compares asserted RDF graphs. A preservation claim also needs inferred hierarchy and entailments, CQs, SHACL, mappings, materialization contracts, and relevant operational results.

## Must every project use OWL?

No. Use the weakest stack that meets the contract: SKOS for concept schemes, RDF/RDFS for lightweight exchange and inference, OWL for logical entailment, SHACL for graph constraints, and SPARQL for executable information needs. A project may combine them with explicit responsibilities.

## Does Ontotect include the source books and papers?

No. It distributes original synthesis and public citations, not private PDFs or extracted full text. The evidence register documents coverage and limitations.

## Where are the books, papers, projects, and tools credited?

Read [References and acknowledgments](references-and-acknowledgments.md) for standard-form citations and [sources.md](../../ontotect/references/sources.md) for the complete evidence map, coverage notes, and authority boundaries.

## Is Ontotect licensed as open source?

Yes. Ontotect's original repository content is released under the [MIT License](../../LICENSE). Third-party references and linked works retain their own licenses, and the private research corpus is not distributed under Ontotect's license.

## Why are hashes and dependency pins not required?

Ordinary ontology work needs preserved inputs, VCS history, graph-aware diffs, recorded tool configuration, and proportional evidence. Stronger integrity controls are appropriate only when a concrete regulated, supply-chain, forensic, or acceptance requirement calls for them.

## Where do I report a security issue?

Follow [SECURITY.md](../../SECURITY.md). Do not disclose secrets, private ontology data, raw corpus material, or usable exploit details in public issues.
