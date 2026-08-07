---
type: verification
status: pass-with-actions
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

**Pass with follow-up actions.** The ontology-engineering implementation,
focused-suite compiler, cross-host installation controls, documentation, clean
release candidate, authorized npm publication, and exact public-package checks
completed the available QA-L4 gates. `@moonweave-ai/ontotect@0.1.2` is public,
and `latest` resolves to `0.1.2`. The remaining controls are stated explicitly
below and do not invalidate the observed release result.

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
| Package allowlist | Pass on clean `main`: 57 intended entries and zero forbidden corpus, cache, test, temporary, PDF, dependency, or lifecycle-script entries |
| Package identity | Pass: `@moonweave-ai/ontotect`, `author: Moonweave AI`, MIT, public access, Moonweave-AI repository |
| Registry version availability | Pass: exact `0.1.2` lookup returned `E404` before publication |
| npm organization write authority | Pass: authenticated account has read-write access to `@moonweave-ai/ontotect` |
| GitHub `main` synchronization | Pass before publication: local `main` and `origin/main` both pointed to release commit `5e1bc27`; this evidence commit completes the post-release write-back |
| Public npm/npx behavior | Pass: exact and `latest` report `0.1.2`; anonymous Help/List succeeded; isolated public-package installation produced all 20 skills for each of five hosts and all 20 Kilo/OpenCode adapters |

The current Codex runtime enumerated all 20 installed `ontotect*` entries after
refresh. Filesystem installation for all five hosts is proven; live slash-menu
observation in Cursor, Kilo, OpenCode, and Claude Code remains `unverified` and
is not a release blocker for this preview package.

## Staged rollout

1. **Complete:** implement and document the discovery repair; preserve the
   canonical source and compile focused entries through the registry.
2. **Complete:** run local QA-L4 tests, validators, package inspection, security
   boundary checks, five-host installation, and independent review.
3. **Complete:** committed the `0.1.2` candidate in three logical stages,
   pushed the feature branch, fast-forwarded `main`, and verified local/remote
   synchronization at `5e1bc27`.
4. **Complete:** reran 41 Python and 14 Node tests and inspected the exact
   57-file archive from clean `main`.
5. **Complete:** rechecked npm organization write authority and version
   availability, then published `@moonweave-ai/ontotect@0.1.2` with public
   access under the Moonweave AI package identity.
6. **Complete:** verified exact-version metadata, `latest`, anonymous Help/List,
   and isolated five-host installation from the public package.
7. **Complete with this record:** wrote observed public evidence back to this
   report, the verification record, security review, organization-package ADR,
   security status, and source evidence register for commit and push.

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

- **Pass:** exact registry metadata reports `0.1.2`, MIT, author `Moonweave AI`,
  the `ontotect` executable, and the Moonweave-AI repository; `latest` points
  to `0.1.2`.
- **Pass:** anonymous exact-version Help and List execution completed
  successfully; List reported 20 entries and root dispatch `conditional`.
- **Pass:** an isolated public-package install created 20 exact skill entries
  for each of all five hosts and 20 adapters for each of Kilo and OpenCode.
- **Pass:** the published archive and GitHub `main` contain the `0.1.2`
  installation flow rather than the historical source-only workaround. The
  npm page's visual rendering was not re-inspected for this release.
- **Pass with this record:** the post-release evidence is committed and pushed
  to synchronized `main`.
