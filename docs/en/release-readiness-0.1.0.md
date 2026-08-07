---
type: verification
status: conditional-go
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
  - package.json
supersedes: null
superseded_by: null
---

# Release readiness — 0.1.0

[简体中文](../zh-CN/release-readiness-0.1.0.md) · [Documentation home](index.md)

## Decision

**Conditional Go.** The Owner has selected the MIT License, accepted ADR 0001
and ADR 0002, and authorized the initial public GitHub and npm release. The
repository may be pushed after the clean staging review. npm publication must
wait for an authenticated registry identity and must be followed by registry
and public npx verification.

Work object: public release operation. Risk: **S4**. Required quality:
**QA-L4**. Owner and release authority: Moonweave-AI. Execution DRI: the
publishing maintainer.

## Release scope

- GitHub repository: `Moonweave-AI/Ontotect`, branch `main`.
- npm package: `ontotect@0.1.0`, public access.
- License: MIT for original repository content; third-party references and the
  excluded private research corpus retain separate terms.
- Distribution: one dependency-free executable and one portable skill for
  Cursor, Codex, Kilo, OpenCode, and Claude Code layouts.
- Non-goals: GitHub Release creation, live certification of every host,
  ontology-domain certification, and automatic host mutation during package
  acquisition.

## Pre-release evidence

| Gate | Result |
|---|---|
| Python repository regression | Pass: 29 tests |
| Node/npm installer regression | Pass: 8 tests, including a locally packed tarball executed through npx |
| Skill Creator validation | Pass |
| Package allowlist | Pass: 54 intended entries including `LICENSE`; zero corpus, cache, test, temporary, source-document, or tarball offenders |
| Dependency and lifecycle boundary | Pass: zero dependencies and no install/prepare lifecycle scripts |
| Candidate secret and local-path scan | Pass: zero matching public files |
| GitHub repository access | Pass: authenticated account, public empty target repository, SSH remote reachable |
| npm package-name check | Pass: no published `ontotect` package observed before release |
| npm authentication | Blocked at preflight: registry returned `E401 Unauthorized`; recheck required before publication |

Checks use direct file and byte comparison where needed. This release does not
add cryptographic hash validation, dependency pinning, host-version locking, or
a package lock.

## Staged rollout

1. Initialize `main`, review ignored and staged files, and create logical local
   commits.
2. Push `main` to the empty public GitHub repository and verify the remote head
   and public README.
3. Recheck npm authentication, package-name state, tests, and the exact dry-run
   package list.
4. Publish `ontotect@0.1.0` with public access.
5. Verify registry metadata, public package contents, and a clean `npx`
   installation into isolated five-host project roots.
6. Update the verification and security records with observed publication
   evidence, commit the record, and push `main` again.

## Rollback and incident response

- Before npm publication, stop without changing the registry if any gate fails.
- For a GitHub defect, revert the specific commit and push the reviewed revert.
- For a published package defect, prefer deprecating the affected version and
  publishing a corrected patch. Do not assume registry unpublish is available
  or appropriate.
- A secret, private corpus file, unprovenanced distributable asset, lifecycle
  auto-execution, or undeclared network behavior is Stop-Ship.

## Post-release checks and follow-up

Post-release results remain `unverified` until the rollout reaches Step 5.
Follow-up controls are a permanent private security-reporting path, npm account
recovery documentation, CI, and live discovery/behavior smoke tests in the five
named hosts.
