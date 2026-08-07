---
type: reference
status: draft
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 180
summary: Documentation hub for installing, routing, operating, validating, and governing Ontotect.
canonical: docs/en/index.md
related:
  - README.md
  - ontotect/SKILL.md
supersedes: null
superseded_by: null
---

# Ontotect documentation

[简体中文](../zh-CN/index.md) · [Project README](../../README.md)

Ontotect is an ontology engineering skill for systematic ontology design, construction, review, repair, optimization, refactoring, validation, and governance. It turns an Agent Skills host into an evidence-led ontology-engineering collaborator while keeping conceptual commitments, formal semantics, graph constraints, implementation syntax, and governance distinct.

## Choose your path

- New to Ontotect: follow [Getting started](getting-started.md).
- Installing in Cursor, Codex, Kilo, OpenCode, or Claude Code: use [Installation](installation.md); npm and npx users can go directly to [npm and npx installation](npm-and-npx-installation.md).
- Know the task but not the command: start with `help`, then `router`; see [Command reference](command-reference.md).
- Need a mode-specific example: use [Scenario playbooks](scenario-playbooks.md).
- Need lifecycle gates and routing rules: read [Routing and workflow](routing-and-workflow.md).
- Evaluating claims or release evidence: read [Quality and validation](quality-and-validation.md).

## Documentation map

| Document | Purpose |
|---|---|
| [Getting started](getting-started.md) | A first installation, route, and review walkthrough |
| [Installation](installation.md) | Project and user installation across supported Agent Skills hosts |
| [npm and npx installation](npm-and-npx-installation.md) | Public registry, source, local-package, destination, and overwrite paths |
| [Command reference](command-reference.md) | Portable Agent commands and the separate Python navigator CLI |
| [Routing and workflow](routing-and-workflow.md) | Mode selection, lifecycle stages, gates, and iteration |
| [Scenario playbooks](scenario-playbooks.md) | Build, review, repair, optimize, refactor, validate, govern, and release recipes |
| [Methodology and evidence](methodology-and-evidence.md) | Research foundation, source discipline, and engineering synthesis |
| [References and source attribution](references-and-acknowledgments.md) | Standard-form citations for books, papers, standards, tools, and projects |
| [Architecture](architecture.md) | Skill package, progressive disclosure, command layer, assets, and scripts |
| [Quality and validation](quality-and-validation.md) | Ten evidence layers, QA expectations, and honest result interpretation |
| [Local verification record](verification-record.md) | Checks actually executed for this source package and their explicit limits |
| [Release readiness 0.1.1](release-readiness-0.1.1.md) | Published patch evidence, rollout, rollback, and follow-up controls |
| [Release readiness 0.1.0](release-readiness-0.1.0.md) | Go/No-Go evidence, rollout, rollback, and post-publication checks |
| [Compatibility](compatibility.md) | Host discovery, portability contract, and verification status |
| [npm installer security review](npm-installer-security-review.md) | S4 threat model, controls, residual risk, and release blockers |
| [Governance and release](governance-and-release.md) | Ownership, change classes, identifiers, migrations, and release gates |
| [FAQ](faq.md) | Common modeling, tooling, copyright, and operation questions |

## Sources of truth

Public documentation explains how to use the project. Executable behavior remains canonical in [SKILL.md](../../ontotect/SKILL.md) and the command specifications under `ontotect/references/`. Detailed ontology-engineering guidance remains canonical in those runtime references, especially:

- [workflow.md](../../ontotect/references/workflow.md) for lifecycle and mode gates;
- [validation-and-testing.md](../../ontotect/references/validation-and-testing.md) for evidence layers;
- [sources.md](../../ontotect/references/sources.md) for research coverage and authority boundaries;
- [agent-compatibility.md](../../ontotect/references/agent-compatibility.md) for current host paths.

English pages are canonical. Files under `docs/zh-CN/` are same-name translations and must not define independent behavior.

## Project status

GitHub `main` identifies Ontotect 0.1.1, and `@moonweave-ai/ontotect@0.1.1` is published on npm with `latest` pointing to 0.1.1. Structural installation and local fixtures have been tested, but a successful directory copy is not evidence that every external host has loaded and executed the skill. Each compatibility claim must identify what was actually checked and mark unavailable behavior `unverified`.

Ontotect's original repository content is released under the [MIT License](../../LICENSE). Third-party references retain their own terms, and the private construction corpus is not distributed.
