---
type: policy
status: draft
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 180
summary: Contribution rules for Ontotect code, skill behavior, documentation, evidence, and translations.
canonical: CONTRIBUTING.md
related:
  - README.md
  - SECURITY.md
  - ontotect/SKILL.md
supersedes: null
superseded_by: null
---

# Contributing to Ontotect

[简体中文](CONTRIBUTING.zh-CN.md)

Contributions to Ontotect may change executable agent behavior, ontology-engineering guidance, templates, scripts, tests, or public documentation. Keep every change reviewable, attributable, and proportional to its semantic impact.

## Before opening a change

1. Search existing issues and explain the user or ontology-engineering problem.
2. State the affected mode, lifecycle stage, command, reference, asset, or script.
3. Separate observed evidence from assumptions and proposed design decisions.
4. For behavior changes, describe expected outputs, permission boundaries, and regression evidence.
5. For public-term or workflow changes, describe compatibility and migration consequences.

Small documentation corrections may go directly to a pull request. Changes to the portable command protocol, routing precedence, evidence model, or host support should first record the decision and alternatives in an issue or ADR.

## Source and copyright policy

Do not submit books, papers, vendor manuals, extracted full text, screenshots of copyrighted pages, or local research folders. In particular, the repository must not contain `book/`, `paper/`, `tools/`, `tmp/`, `.runtime/`, or the local `book-to-skill/` working copy.

Use standards, original papers, institutional repositories, and official project documentation as evidence. Cite the public source and summarize it in your own words. Confirm that any copied code, ontology module, vocabulary, image, or dataset can be redistributed and preserve required notices.

Ontotect is released under the [MIT License](LICENSE). By contributing, you confirm that you have the right to submit the work under that license. Third-party material retains its own terms and must not be added unless redistribution is compatible and properly attributed.

## Documentation and translation

English documents are canonical. Files in `docs/zh-CN/` mirror the same filename under `docs/en/`; Chinese policy files point to their English canonical document. Update both languages in the same change. If a translation cannot be updated immediately, mark it visibly as stale and open an owned follow-up issue.

Keep each document to one purpose: tutorial, how-to, reference, explanation, policy, or decision record. Preserve governance frontmatter and update `updated` and `last_reviewed` only when their meanings apply. Internal links should be relative and work in a fork.

## Command and skill changes

The portable Agent command protocol is not the Python navigator CLI. When changing either interface:

- update its canonical implementation or command specification;
- update `ontotect/SKILL.md` when routing or behavior changes;
- update both command-reference translations;
- add or update a realistic scenario or test;
- state whether the operation is read-only or may mutate project artifacts;
- never turn a parser, RDF graph audit, or SHACL run into an unsupported OWL-consistency claim.

Do not add hashes, dependency pins, repeated version probes, or integrity ceremonies by default. Add them only when a concrete acceptance contract or risk requires them and document the reason.

## Verification

Run checks appropriate to the change and report only results actually obtained. Typical checks include:

```text
python ontotect/scripts/ontology_audit.py --help
python ontotect/scripts/ontology_diff.py --help
python ontotect/scripts/install_skill.py --help
```

For documentation, verify Markdown structure, relative links, English/Chinese filename parity, command-name consistency, and that ignored research material is not tracked. For ontology examples, parse all RDF, run the stated SPARQL and SHACL checks, and label unavailable reasoning as `unverified`.

## Pull-request checklist

- The problem, scope, and non-goals are clear.
- Changed behavior and semantic impact are explained.
- Evidence is reproducible without private corpus files.
- Public source attribution and redistribution rights are clear.
- English and Chinese public documents remain aligned.
- No secrets, sensitive graphs, raw research documents, or extraction output are included.
- Tests and reviews are reported truthfully; missing checks are `unverified`.
- An Owner or designated reviewer can make the required domain or release decision.

Security defects follow [SECURITY.md](SECURITY.md), not the public issue workflow.
