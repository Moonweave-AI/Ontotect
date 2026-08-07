---
type: verification
status: active
owner: Moonweave-AI
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 30
summary: Release-quality report, staged rollout, rollback path, release notes, and public verification plan for Ontotect 0.1.2.
canonical: docs/en/release-readiness-0.1.2.md
related:
  - docs/en/release-readiness-0.1.1.md
  - docs/en/verification-record.md
  - docs/en/npm-installer-security-review.md
  - docs/decisions/0002-explicit-npm-installer.md
  - docs/decisions/0003-organization-scoped-npm-package.md
  - docs/decisions/0004-host-discovery-and-command-adapters.md
  - package.json
supersedes: null
superseded_by: null
---

# Release readiness — 0.1.2

[简体中文](../zh-CN/release-readiness-0.1.2.md) · [Documentation home](index.md)

## Decision

**Conditional Go.** The ontology-engineering implementation, focused-suite
compiler, cross-host installation controls, documentation, and local release
candidate have passed the available QA-L4 gates. Publication may proceed only
after the final `0.1.2` candidate is committed, synchronized to GitHub `main`,
retested from a clean worktree, and confirmed absent from the npm registry.
Registry publication and public-package checks remain pending until those gates
complete; they must not be recorded as passed in advance.

Work object: public release operation. Risk: **S4**. Required quality:
**QA-L4**. Maturity: **M7 public-preview focused-suite release**. Owner and
release authority: Moonweave AI. Execution DRI: the publishing maintainer.
ADR 0002 defines explicit installation, ADR 0003 defines the organization
package identity, and ADR 0004 defines host discovery and command adapters; no
additional RFC or ADR is required for this bounded release.

## Release notes

Version `0.1.2` is the first public Ontotect release with the complete
discoverable skill suite:

- 20 independently discoverable `ontotect*` entries generated from one
  canonical ontology-engineering workflow;
- dedicated Help, Router, Status, engineering-mode, and lifecycle-stage skills;
- a conditional root entry: empty request → Help, explicit command → preserve,
  otherwise → Router;
- native skill installation for Cursor, Codex, Kilo, OpenCode, and Claude Code;
- 20 matching slash-command adapters for Kilo and OpenCode;
- full/core suite selection, project/user scope, list/plan/install commands,
  JSON output, dry-run, and explicit managed refresh;
- global preflight, resolved-path containment, clean managed replacement,
  transaction rollback, and bounded Windows contention retry;
- bilingual installation, compatibility, command, architecture, security, and
  discovery-troubleshooting documentation.

Version `0.1.1` remains the historical single-skill installer. Existing users
must upgrade, rerun installation with `--force`, and refresh the host. This
readiness report serves as the canonical `0.1.2` release note; the repository
does not maintain a separate changelog.

## Release scope

- GitHub repository: `Moonweave-AI/Ontotect`, authoritative branch `main`.
- npm package: `@moonweave-ai/ontotect@0.1.2`, public access; executable
  `ontotect`.
- Expected archive: 57 allowlisted files, MIT, zero runtime dependencies, and
  no install, preinstall, prepare, or postinstall lifecycle scripts.
- Supported layouts: Cursor, Codex, Kilo, OpenCode, and Claude Code.
- Excluded content: private books, papers, tool-document corpora, extracted
  text, caches, tests, temporary files, PDFs, and local runtime state.
- Non-goals: bundling a reasoner, executing ontology work during installation,
  silently modifying Agent roots during package acquisition, certifying every
  host UI, or renaming the suite to `ontology`.

## Release-quality report

| Gate | Candidate result |
|---|---|
| Python repository regression | Pass: 41 tests |
| Node/npm installer regression | Pass: 14 tests, including a real locally packed npx installation |
| Syntax and diff checks | Pass: Node syntax, Python byte compilation, and Git whitespace check |
| Skill structure | Pass: source plus 20 installed Codex entries, 21/21 |
| Generated-skill advisory scan | Pass: source plus installed entries, 21/21 |
| Static host lenses | Pass: Claude, Amp, and Copilot lenses, 60/60 |
| Five-host user installation | Pass: 20 exact skills per host; Kilo/OpenCode each have 20 adapters; no transaction work files remained |
| Transaction and path controls | Pass: conflict/type/symlink preflight, managed refresh, unknown-sibling preservation, rollback injection, and bounded transient retry |
| Package allowlist | Pass before final commit: 57 intended entries and zero forbidden corpus, cache, test, temporary, PDF, or dependency entries; repeat on clean `main` |
| Package identity | Pass: `@moonweave-ai/ontotect`, `author: Moonweave AI`, MIT, public access, Moonweave-AI repository |
| Registry version availability | Pass: exact `0.1.2` lookup returned `E404` before publication |
| npm organization write authority | Pass: authenticated account has read-write access to `@moonweave-ai/ontotect` |
| GitHub `main` synchronization | Pending final release commits and push |
| Public npm/npx behavior | Pending publication; do not infer from the local archive |

The current Codex runtime enumerated all 20 installed `ontotect*` entries after
refresh. Filesystem installation for all five hosts is proven; live slash-menu
observation in Cursor, Kilo, OpenCode, and Claude Code remains `unverified` and
is not a release blocker for this preview package.

## Staged rollout

1. **Complete:** implement and document the discovery repair; preserve the
   canonical source and compile focused entries through the registry.
2. **Complete:** run local QA-L4 tests, validators, package inspection, security
   boundary checks, five-host installation, and independent review.
3. **In progress:** commit the `0.1.2` candidate in logical stages, push the
   feature branch, fast-forward `main`, and verify local/remote synchronization.
4. **Pending:** rerun tests and inspect the exact archive from clean `main`.
5. **Pending:** recheck npm organization authority and version availability,
   then publish `@moonweave-ai/ontotect@0.1.2` with public access.
6. **Pending:** verify exact-version metadata, `latest`, anonymous help/list,
   and isolated five-host installation from the public package.
7. **Pending:** write observed public evidence back to this report, the
   verification record, security review, organization-package ADR, security
   status, and source evidence register; commit and push that record.

## Rollback and incident response

- Before publication, stop and correct the candidate if any QA-L4 gate fails.
- After publication, do not assume npm unpublish is available or appropriate.
  Deprecate the defective version when needed, restore `latest` to a verified
  release if registry policy permits, and publish a corrected patch.
- Revert a defective repository change with a reviewed forward commit.
- A secret, private corpus file, unprovenanced asset, lifecycle auto-execution,
  undeclared network behavior, wrong package scope, or loss of organization
  authority is Stop-Ship.

## Post-release verification checklist

- Exact registry metadata reports `0.1.2`, MIT, the `ontotect` executable, and
  the Moonweave-AI repository; `latest` points to `0.1.2`.
- Anonymous `npx @moonweave-ai/ontotect@0.1.2 help` and `list` exit successfully.
- An isolated public-package install creates 20 exact skill entries for all five
  hosts and 20 adapters for each of Kilo and OpenCode.
- The public npm and GitHub README present the `0.1.2` installation flow rather
  than the historical source-only workaround.
- The post-release evidence commit is present on and synchronized with `main`.
