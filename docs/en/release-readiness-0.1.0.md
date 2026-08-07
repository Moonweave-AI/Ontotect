---
type: verification
status: pass-with-actions
owner: Moonweave-AI
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 30
summary: Release-quality report, staged rollout, rollback path, and post-publication checks for Ontotect 0.1.0.
canonical: docs/en/release-readiness-0.1.0.md
related:
  - docs/en/verification-record.md
  - docs/en/npm-installer-security-review.md
  - docs/decisions/0002-explicit-npm-installer.md
  - docs/decisions/0003-organization-scoped-npm-package.md
  - package.json
supersedes: null
superseded_by: null
---

# Release readiness — 0.1.0

[简体中文](../zh-CN/release-readiness-0.1.0.md) · [Documentation home](index.md)

## Decision

**Pass with follow-up actions.** Ontotect uses the MIT License, ADR 0001,
ADR 0002, and ADR 0003 are accepted, GitHub `main` is synchronized, and
`@moonweave-ai/ontotect@0.1.0` is published on npm. Public registry metadata,
anonymous acquisition, npx help, and isolated project-scoped installation for
all five host layouts passed.

Work object: public release operation. Risk: **S4**. Required quality:
**QA-L4**. Owner and release authority: Moonweave-AI. Execution DRI: the
publishing maintainer.

## Release scope

- GitHub repository: `Moonweave-AI/Ontotect`, branch `main`.
- npm package: `@moonweave-ai/ontotect@0.1.0`, public access; executable `ontotect`.
- License: MIT for original repository content; third-party references and the
  excluded private research corpus retain separate terms.
- Distribution: one dependency-free executable and one portable skill for
  Cursor, Codex, Kilo, OpenCode, and Claude Code layouts.
- Non-goals: GitHub Release creation, live certification of every host,
  ontology-domain certification, and automatic host mutation during package
  acquisition.

## Pre-release evidence (historical)

| Gate | Result |
|---|---|
| Python repository regression | Pass: 29 tests |
| Node/npm installer regression | Pass: 8 tests, including a locally packed tarball executed through npx |
| Skill Creator validation | Pass |
| Package allowlist | Pass: 54 intended entries including `LICENSE`; zero corpus, cache, test, temporary, source-document, or tarball offenders |
| Dependency and lifecycle boundary | Pass: zero dependencies and no install/prepare lifecycle scripts |
| Candidate secret and local-path scan | Pass: zero matching public files |
| GitHub repository access | Pass: authenticated account, public empty target repository, SSH remote reachable |
| npm package-name check | Pass: no published `@moonweave-ai/ontotect` package observed before release |
| npm authentication and organization authority | Pass: authenticated operator is an owner of the `moonweave-ai` npm organization and has read-write access to its existing package |

Checks use direct file and byte comparison where needed. This release does not
add cryptographic hash validation, dependency pinning, host-version locking, or
a package lock.

## Staged rollout status

1. **Complete:** initialize `main`, review ignored and staged files, and create
   logical local commits.
2. **Complete:** push `main` to the public GitHub repository and verify the
   remote head and public README.
3. **Complete:** recheck npm authentication, package-name state, tests, and the
   exact dry-run package list.
4. **Complete:** publish `@moonweave-ai/ontotect@0.1.0` with public access.
5. **Complete:** registry metadata reported `0.1.0`, `latest`, and MIT; anonymous
   registry access and public npx help passed; all five isolated project-scoped
   host roots installed with 48 skill files per destination.
6. **Complete:** observed post-publication evidence is recorded in the
   verification, security, and decision records. Remote `main` synchronization
   is checked through Git after the documentation commit.

## Rollback and incident response

- For future npm releases, stop before publication if any gate fails.
- For a GitHub defect, revert the specific commit and push the reviewed revert.
- For a published package defect, prefer deprecating the affected version and
  publishing a corrected patch. Do not assume registry unpublish is available
  or appropriate.
- A secret, private corpus file, unprovenanced distributable asset, lifecycle
  auto-execution, or undeclared network behavior is Stop-Ship.

## Post-release checks and follow-up

Public-registry metadata and project-scoped npx acquisition passed. Follow-up
controls are a permanent private security-reporting path, npm account recovery
documentation, package provenance, CI, user/global-scope installation, and live
discovery/behavior smoke tests in the five named hosts; these remain
`unverified` where no execution evidence has been recorded.
