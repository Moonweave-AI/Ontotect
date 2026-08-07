---
type: verification
status: conditional-go
owner: Moonweave-AI
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 30
summary: Pre-publication release-quality report, rollout plan, rollback path, and post-release gates for the Ontotect 0.1.1 patch candidate.
canonical: docs/en/release-readiness-0.1.1.md
related:
  - docs/en/release-readiness-0.1.0.md
  - docs/en/verification-record.md
  - docs/en/npm-installer-security-review.md
  - docs/decisions/0002-explicit-npm-installer.md
  - docs/decisions/0003-organization-scoped-npm-package.md
  - package.json
supersedes: null
superseded_by: null
---

# Release readiness — 0.1.1

[简体中文](../zh-CN/release-readiness-0.1.1.md) · [Documentation home](index.md)

## Decision

**Conditional Go — pre-publication.** Ontotect 0.1.1 is a patch candidate for
synchronizing the redesigned README, brand assets, and related documentation
into the npm distribution. Publication is permitted only after the candidate
tests, package inspection, organization authority, and Git synchronization
gates below are executed and recorded as passing. Every candidate-specific
result not yet executed by the release DRI is explicitly `unverified`.

Work object: public release operation. Risk: **S4**. Required quality:
**QA-L4**. Maturity: **M6 public-preview patch candidate**. Owner and release authority:
Moonweave-AI. Execution DRI: the publishing maintainer. A release gate and
post-publication verification are required; the presentation-only patch does
not require a new RFC or ADR unless its scope changes.

## Release scope

- GitHub repository: `Moonweave-AI/Ontotect`, branch `main`.
- npm candidate: `@moonweave-ai/ontotect@0.1.1`, public access; executable
  `ontotect`.
- Change scope: synchronize the revised English and Chinese README experience,
  brand assets, and supporting documentation in the npm package.
- Expected package shape: 55 intended entries, zero runtime dependencies, and
  no install, prepare, preinstall, or postinstall lifecycle scripts.
- License and identity: MIT; the durable package identity remains under the
  `@moonweave-ai` organization scope.
- Compatibility target: Cursor, Codex, Kilo, OpenCode, and Claude Code layouts.
- Non-goals: changing Ontotect command behavior, expanding ontology-engineering
  semantics, creating a new package scope, replacing the 0.1.0 historical
  record, or certifying every live host environment.

The published `0.1.0` evidence remains historical and immutable. This report
does not rewrite or supersede the 0.1.0 release-readiness record.

## Candidate evidence

| Gate | Pre-publication result |
|---|---|
| Candidate commit and clean worktree identified | `unverified`; completed only after the reviewed candidate is committed and merged |
| Python repository regression | Pass: 29 tests |
| Node/npm installer regression, including local tarball npx execution | Pass: 8 tests |
| Skill Creator and generated-skill validation | Pass: Skill Creator valid; advisory scan passed; Claude, Amp, and Copilot lenses reported zero warnings |
| Package allowlist | Pass: 55 intended entries and zero excluded corpus, cache, test, temporary, source-document, lockfile, or tarball offenders |
| Dependency and lifecycle boundary | Pass: zero dependencies and zero lifecycle scripts |
| Candidate secret, local-path, and distributable-asset review | Pass: 106 public candidate files scanned; zero secret-pattern or local-absolute-path files |
| MIT license and `@moonweave-ai` organization scope in packed metadata | Pass |
| npm authentication and organization write authority | Pass: authenticated publisher is a Moonweave-AI organization owner with package read-write access |
| Registry check confirming `0.1.1` is not already published | Pass: exact-version lookup returned `E404` before publication |
| GitHub `main` synchronization before publication | `unverified` |

Checks may use direct file and byte comparison where needed. This patch does
not introduce cryptographic hash validation, dependency pinning, host-version
locking, or a package lock.

## Staged rollout

1. **Complete:** freeze the 0.1.1 candidate scope and review the exact Git diff
   and ignored-file boundary. Commit and clean-worktree checks remain a later gate.
2. **Complete:** execute the complete Python, Node/npm, Skill Creator, package
   allowlist, secret/path, and installer validation suite.
3. **Complete:** inspect the exact npm dry-run package and confirm 55 intended
   entries, MIT, organization scope, zero dependencies, and no lifecycle
   scripts.
4. **Pending:** commit and push the candidate to `main`; confirm that local and
   remote heads match and that the public README and brand assets render.
5. **Pending:** recheck npm identity, Moonweave-AI organization authority, and
   registry availability; publish `@moonweave-ai/ontotect@0.1.1` with public
   access.
6. **Pending:** verify public registry metadata and `latest`, then acquire and
   execute the package anonymously through npx in an isolated environment.
7. **Pending:** run isolated project-scoped installation for all five supported
   host layouts and record the observed file counts and help output.
8. **Pending:** update the canonical verification and security records, commit
   the post-release evidence, push it, and confirm remote `main` synchronization.

Any failed candidate gate changes the decision to **No-Go** until corrected and
re-executed. No unverified result may be represented as a pass.

## Rollback and incident response

- Before publication, stop the rollout and correct or revert only the candidate
  changes; keep `@moonweave-ai/ontotect@0.1.0` as the known public version.
- If the GitHub presentation is defective, revert the specific reviewed commit
  and push the revert.
- If 0.1.1 is published with a package defect, deprecate that version when
  appropriate, restore `latest` to a verified version if registry policy permits,
  and publish a corrected patch. Do not assume npm unpublish is available or
  appropriate.
- A secret, private corpus file, unprovenanced distributable asset, lifecycle
  auto-execution, undeclared network behavior, wrong package scope, or loss of
  organization authority is Stop-Ship.

## Post-release gates

The release is not complete until the DRI records all of the following:

- Registry metadata reports `@moonweave-ai/ontotect@0.1.1`, MIT, the `ontotect`
  executable, and `latest` pointing to 0.1.1.
- Anonymous public metadata access and isolated public npx help both pass.
- Project-scoped installation passes for Cursor, Codex, Kilo, OpenCode, and
  Claude Code layouts, with expected skill files present.
- GitHub and npm render the intended English README, brand assets, organization
  identity, links, and installation commands.
- The verification record, npm installer security review, and this readiness
  report are updated with observed evidence; local and remote `main` match.
- Any regression triggers the rollback path and a documented follow-up action.

Until these observations are recorded, all post-release gates are `unverified`.
