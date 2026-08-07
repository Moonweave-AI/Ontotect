---
type: security-review
status: active
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 90
summary: S4 and QA-L4 security review of Ontotect's explicit, dependency-free npm and npx installer.
canonical: docs/en/npm-installer-security-review.md
related:
  - docs/decisions/0002-explicit-npm-installer.md
  - docs/decisions/0003-organization-scoped-npm-package.md
  - package.json
  - bin/ontotect.js
  - SECURITY.md
supersedes: null
superseded_by: null
---

# npm installer security review

[简体中文](../zh-CN/npm-installer-security-review.md) · [Documentation home](index.md)

## Review decision

Work object: public Agent-skill distribution feature. Risk: **S4**, because a package-manager executable can write into project or user Agent configuration. Required quality: **QA-L4**. Owner: project maintainers. DRI for this review: implementation maintainer.

The design remains acceptable for the published package provided the controls below remain true and release authority, registry authentication, package inspection, and post-publication verification are recorded. The review becomes `revise` if package inspection, installer tests, or path controls fail; it becomes Stop-Ship if private corpus material, secrets, unprovenanced assets, lifecycle auto-execution, or an undeclared network operation enters the package.

## Assets and security objectives

| Asset | Objective |
|---|---|
| Canonical `ontotect/` skill | Copy the intended public skill without corruption, omission, or hidden executable additions |
| Project and user skill roots | Write only to the selected fixed host destinations and only after an explicit command |
| Existing host configuration | Never overwrite an existing `ontotect` directory without `--force` |
| Private research corpus | Keep books, papers, tool PDFs, extracted text, and temporary analysis outside the npm tarball |
| User projects and credentials | Do not scan unrelated content, execute repository instructions, contact remote services, or collect telemetry |

## Trust boundaries

```text
npm registry / local tarball
          |
          v
  package files allowlist
          |
          v
explicit Node CLI invocation ---- user-selected flags
          |
          v
fixed host-root resolver ---- filesystem boundary
          |
          v
project or user skills/ontotect directory
```

Package acquisition is not installation into an Agent host. The security-relevant transition happens only when the user explicitly invokes `ontotect install`.

## Threats, abuse paths, and controls

| Threat or misuse | Control | Verification expectation |
|---|---|---|
| Package install silently mutates host state | No npm lifecycle scripts; explicit `install` command only | Inspect `package.json`; acquire a local package without invoking the CLI |
| Dependency or transitive package compromise | No declared dependencies; Node standard library only | Inspect all dependency fields and package tree |
| Accidental corpus or secret publication | `files` allowlist plus tarball content inspection | `npm pack --dry-run --json`; reject private roots, temporary output, environment files, credentials, tests, and PDFs |
| Arbitrary path write | Fixed host map; project root or OS home is the only base; skill name is constant | Unit-test all project and user destinations and malformed arguments |
| Unexpected overwrite | Existing destination fails unless `--force`; plan reports every target | Test first install, repeat refusal, dry-run, and explicit force |
| Dry-run performs a mutation | Planning and application paths are separated | Snapshot an isolated root before and after dry-run |
| Source-directory escape or recursive copy of junk | Source resolves from the package location; transient cache names are excluded | Compare copied relative file sets and bytes with the source skill |
| Hidden network or telemetry | CLI uses no network APIs and has no analytics | Static review of imports and an isolated local-tarball execution |
| User confuses structural copy with host certification | CLI and docs report installation only; discovery and behavior stay `unverified` | Documentation and output review |
| Malicious instructions inside a copied reference | Copying does not execute content; Agent host retains permission boundaries | Confirm no script runs during load or package acquisition |

## Permission and mutation model

- Default scope is `project`; user-scope writes require `--scope user`.
- `plan` and `--dry-run` are read-only.
- `install` creates only `ontotect` under one or more fixed skill roots.
- `--force` authorizes replacement of those exact destinations, not arbitrary filesystem writes.
- The installer does not edit host settings, shell profiles, repository manifests, or ontology files.
- Remote publication, authentication, registry ownership, and npm provenance are outside the CLI and require a separately authorized release operation.

## Residual risks

- npm package names can be confused with typosquatted names; users must verify the intended package and publisher when a public release exists.
- Any package distribution can be replaced by a compromised publisher account or registry. This project has not yet defined an npm ownership and recovery runbook.
- A user can deliberately pass `--force` and replace local modifications in an installed copy. Canonical work should remain in source control outside generated installation mirrors.
- Filesystem behavior involving symlinks, ACLs, concurrent processes, full disks, or hostile local administrators cannot be eliminated by this small installer.
- The MIT License applies to Ontotect's original repository content; it does not relicense third-party references or excluded private research material.

## Required evidence

Before a local acceptance claim:

1. run the Node unit tests;
2. inspect `npm pack --dry-run --json` output;
3. create a tarball in an ignored temporary directory and execute its binary against an isolated project root;
4. compare all copied files directly with the canonical skill;
5. run the repository documentation, Skill Creator, and existing Python regression checks;
6. record results and limits in [verification-record.md](verification-record.md).

For a public release, additionally verify npm authentication and package ownership, record release authority and the MIT license, inspect the exact public package, and document account recovery, package provenance, and a private vulnerability-reporting path. Publication of `@moonweave-ai/ontotect@0.1.0` is recorded; anonymous registry access, public npx help, and isolated project-scoped installation for all five host layouts passed. Any unavailable control must remain explicit rather than being inferred from a successful command.

## Local verification result — 2026-08-07

All six local evidence steps were executed. The first pack inspection correctly blocked acceptance when two generated `.pyc` files appeared; the scripts allowlist was narrowed to public Python sources. The MIT release-candidate inspection reported 54 intended entries, including `LICENSE`, and no forbidden corpus, cache, test, temporary, document-source, or tarball file. Eight Node tests passed, including a real local tarball executed through npx in offline and ignore-scripts mode against all five project roots. Each of the five installed skills contained 48 files that matched the canonical source directly byte-for-byte.

Result: the release distribution control set is **pass with follow-up actions**. ADR 0002 and ADR 0003 are accepted, the project uses MIT, and `@moonweave-ai/ontotect@0.1.0` has been published. Registry metadata reported `0.1.0`, `latest`, and MIT; organization access was read-write; anonymous access, public npx help, and isolated project-scoped installation into all five host layouts passed with 48 files per destination. User/global-scope installation, live-host discovery and behavior, account recovery, package provenance, and the permanent private reporting path remain `unverified` follow-up controls.
