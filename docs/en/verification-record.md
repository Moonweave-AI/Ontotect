---
type: verification
status: active
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 180
summary: QA-L4 source, release, and public-package evidence with explicit verification limits for Ontotect 0.1.2.
canonical: docs/en/verification-record.md
related:
  - docs/en/quality-and-validation.md
  - docs/en/compatibility.md
  - docs/decisions/0001-portable-command-router.md
  - docs/decisions/0002-explicit-npm-installer.md
  - docs/decisions/0003-organization-scoped-npm-package.md
  - docs/en/npm-installer-security-review.md
  - docs/en/release-readiness-0.1.2.md
  - docs/en/release-readiness-0.1.1.md
supersedes: null
superseded_by: null
---

# Verification record — 2026-08-07

[简体中文](../zh-CN/verification-record.md) · [Documentation home](index.md)

This record describes checks actually executed against the current source,
release candidate, public package, commands, router, documentation, and host
layouts. It is not an external-host certification or domain ontology validation
report.

## Executed evidence

| Area | Executed check | Observed result |
|---|---|---|
| Research synthesis | Confirmed the evidence register for the completely processed local set | 29 PDFs: 5 books, 17 papers, 7 tool documents; 2,045 pages and 791,157 extracted words |
| Repository regression | Standard-library Python unit-test discovery | 41 tests passed, including bilingual docs, suite registry, conditional root and fixed focused-entry semantics, both installers, clean managed refresh, commit-time rollback fault injection, bounded transient retry, target-type preflight, and existing ontology workflow regression |
| npm installer regression | `npm test` / Node's built-in test runner | 14 tests passed: 20-entry discovery, full/core plans, all host roots, Kilo/OpenCode adapters, whole-plan conflicts, clean state-driven refresh, unknown-sibling preservation, symlink/junction rejection, wrong target types, zero-dependency metadata, and packed-tarball npx execution |
| Agent Skill structure | Skill Creator `quick_validate.py` against the source and final installed Codex suite | Canonical source passed; all 20 final installed `ontotect*` entries passed |
| Generated-skill safety | book-to-skill advisory scan against the final installed Codex suite | 20 of 20 entries passed; no known injection or unsafe-authority pattern reported |
| Static host lenses | book-to-skill Claude, Amp, and GitHub Copilot CLI lenses against all final installed entries | 60 validations passed with zero warnings; these are static lenses, not live-host runs |
| Documentation | Mirrored filenames, governance frontmatter, relative links, command vocabulary, encoding, and corpus exclusion | Passed through repository regression checks |
| README visuals and references | Parsed the local SVG and checked accessibility metadata, two Mermaid diagrams per language, bilingual structure, internal links, standard-form references, and removed wording | Passed; SVG has no script, external font, or imported resource; stale `.mjs` and the rejected disclaimer wording had zero public matches |
| Source assets | Parsed 4 Turtle files, 1 SPARQL query, 1 JSON file, 1 TSV file; parsed 4 Python scripts with `ast` | All parsed; the TSV contained data rows |
| Functional fixtures | Ran the advisory audit with the valid and invalid fixtures and starter shapes | Valid fixture: exit 0, SHACL conforms, zero advisory findings. Invalid fixture: exit 1, SHACL non-conformant, one violation |
| Asserted graph diff | Compared the valid fixture with itself and with the invalid fixture | Same graph: 0 added/0 removed. Changed graph: 1 added/4 removed |
| Command process matrix | Invoked every scenario-card command, all seven `stage` commands, and all six unambiguous direct stage aliases | 9 scenario commands, 7 stages, and 6 aliases exited 0; router/help behavior is also covered by tests |
| Router regression | Tested English and Chinese multi-intent routing, explicit command precedence, plan-only, ambiguous targets, every scenario, and coordination stages | Passed; `help` now uses `n/a`, while unknown `status` stage is `unverified` |
| Five-host focused-suite installation | Planned and installed user-scope Cursor, Codex, Kilo, OpenCode, and Claude layouts with the source installer | Installed 5 canonical roots, 95 focused entries, and 40 Kilo/OpenCode adapters; all five roots contain 20 exact registry names and managed state; no transaction work artifact remained |
| npm package metadata | Inspected `package.json` and executable behavior | Package name is `@moonweave-ai/ontotect`, binary is `ontotect`; MIT license, Moonweave-AI repository metadata, public publish configuration, ESM, zero dependencies, no engine constraint, no install/prepare lifecycle scripts, and a public-file allowlist |
| npm pack allowlist | Ran `npm pack --dry-run --json --ignore-scripts` after Python tests had generated local caches | The first inspection exposed two `.pyc` cache files and blocked acceptance; the scripts allowlist was narrowed. The MIT release candidate contains 54 intended entries including `LICENSE`, all required public files, and zero corpus, cache, test, temporary, document-source, or tarball offenders |
| 0.1.1 patch package allowlist | Repeated the dry-run allowlist inspection after adding the centered README hero and both local brand assets | The published 0.1.1 source commit contains 55 intended entries, includes both accessible SVG brand assets, has every required file, and contains zero forbidden corpus, cache, test, temporary, lockfile, or tarball entries |
| Current source package allowlist | Ran `npm pack --dry-run --json --ignore-scripts` after adding the suite compiler assets | 57 allowlisted entries; the suite registry and adapter template are present; private corpus, cache, tests, temporary content, PDFs, and dependencies are absent |
| Packed npx installation | Created a real local tarball and invoked it through npx in offline/ignore-scripts mode against an isolated project | All five host roots received all 20 skills; Kilo/OpenCode received all 20 adapters; generated metadata and fixed-command files were present; no registry publication occurred |
| Installer transaction and path controls | Exercised late conflict, wrong target type, junction/symlink escape, clean force refresh, stale managed entry removal, unknown-sibling preservation, commit-time injected failure, bounded transient retry, and Windows watcher contention | Preflight produced zero external/earlier writes on rejected plans; forced refresh removed only state-recorded targets; injected mid-commit failure restored replaced and deleted targets and removed newly created targets; retry occurred only for `EACCES`, `EBUSY`, and `EPERM`; the first live Windows commit hit `EPERM` and rolled back completely with zero work artifacts, then the watcher-aware retry/out-of-root staging refresh completed |
| npm installer security | Applied the S4 / QA-L4 threat model and checked explicit mutation, resolved destinations, transactional overwrite, network, dependency, corpus, lifecycle, and organization-scope boundaries | Local controls passed; ADR 0002, ADR 0003, and ADR 0004 are accepted, and the project uses MIT. Registry authentication and npm organization ownership were verified for the historical public release; account recovery, provenance, and a permanent private reporting path remain separately tracked |
| Historical public npm registry (0.1.0–0.1.1) | Queried exact package metadata with authenticated organization context and with a nonexistent user config after publication | `@moonweave-ai/ontotect@0.1.0` remains the historical initial release. Version `0.1.1` is public; at its release, `latest` resolved to `0.1.1`, exact metadata reported MIT, the `ontotect` binary, and the Moonweave-AI repository, and anonymous metadata access succeeded |
| Historical public npx distribution (0.1.1) | Invoked exact public version `0.1.1` help and installed it from the registry into isolated project-scoped roots for Cursor, Codex, Kilo, OpenCode, and Claude Code | Help exited 0; all five project destinations installed with 48 skill files and `SKILL.md` present; relative file sets and direct byte content matched across all destinations |
| Historical public package presentation (0.1.1) | Inspected the npm package page and public GitHub repository after publication | npm displayed 0.1.1, public access, zero dependencies, the centered Ontotect mark, banner, badges, redesigned README headings, and Moonweave-AI repository link; GitHub displayed public `main` at release merge `2351760` |
| Public npm registry (0.1.2) | Queried exact and `latest` metadata with a nonexistent user npm configuration after publication | Exact version and `latest` both reported `0.1.2`; metadata reported MIT, author `Moonweave AI`, the `ontotect` executable, and the Moonweave-AI repository; anonymous access succeeded |
| Public npx distribution (0.1.2) | Ran exact-version Help/List and installed the registry package into a fresh isolated project root for every supported host | Help/List exited successfully; `list` reported 20 entries and root dispatch `conditional`; Cursor, Codex, Kilo, OpenCode, and Claude Code each received all 20 exact skills, while Kilo and OpenCode each received all 20 command adapters |
| GitHub release synchronization | Pushed three logical release commits, fast-forwarded `main`, and checked local/remote refs before publication | Local `main` and `origin/main` both pointed to release commit `5e1bc27`; this post-release evidence record is the final synchronized documentation step |
| Ignore behavior | Evaluated `.gitignore` with isolated temporary Git metadata | 10 private/generated cases ignored; 7 public Markdown/Turtle/SPARQL/JSON or `.env.example` cases remained visible |
| First-contact behavior | A context-isolated Agent loaded the skill progressively and answered a Chinese first-use request | Correctly chose read-only `help`, recommended a separate read-only `review`, and preserved `unverified`; it exposed a help-stage ambiguity that was corrected and regression-tested |
| Mixed-intent behavior | An independent follow-up evaluator routed a Chinese review, repair, OWL/SHACL validation, and release-evidence request | Selected `review -> repair -> validate -> release` preflight; limited writes to the named ontology and confirmed tests; prohibited remote publication; identified missing CQ, import, tool, and authority inputs; found no material defect after the correction |
| Status and release-gate behavior | A follow-up evaluator assessed a reported parser pass, unavailable reasoner, and temporarily accepted SHACL failure, then rechecked the corrected contract | Parser and reasoning remained `unverified`; SHACL retained underlying `fail`; the incomplete exception overlay did not apply; Stage F and release were `revise`. The recheck confirmed deterministic gate precedence and exception preservation with no remaining material ambiguity |

Canonical payload files were compared directly where they are intended to stay
identical. Generated `SKILL.md`, OpenAI metadata, state, and command adapters
were instead checked against the suite registry and template. No cryptographic
hash validation, dependency pin, repeated host-version check, or version lock
was added.

## Representative commands

```text
python -m unittest discover -s tests -v
npm test
npm pack --dry-run --json --ignore-scripts
node bin/ontotect.js plan --agents all --scope project --project-root .
node bin/ontotect.js install --agents all --scope user --suite full --commands auto --force
python <skill-creator>/scripts/quick_validate.py ontotect
python book-to-skill/tools/scan_generated_skill.py ontotect
python book-to-skill/tools/validate_skill.py ontotect/SKILL.md --lens claude
python ontotect/scripts/ontotect.py router "审核并修复这个本体，然后验证 SHACL"
python ontotect/scripts/ontology_audit.py ontotect/assets/ontology-starter.ttl --data <fixture> --shapes ontotect/assets/shapes-starter.ttl --json
python ontotect/scripts/ontology_diff.py <before.ttl> <after.ttl> --json
python ontotect/scripts/install_skill.py --agents all --scope project --project-root <isolated-root> --apply --json
```

The installer and Git-ignore checks used validated, isolated temporary
directories and removed them after execution.

## Explicit limits

- The refreshed Codex runtime enumerated all 20 installed `ontotect*` entries.
  Cursor, Kilo, OpenCode, and Claude Code were not each launched as external
  products against this checkout, so their live discovery and behavioral
  compatibility remain `unverified`.
- User-scope structural installation was executed from the current source for
  all five hosts, and project-scoped installation from the public 0.1.2 package
  passed for all five. Public-package user/global-scope installation remains
  `unverified`. Public 0.1.1 is the historical package that does not contain
  this suite repair.
- The redesigned README and both brand assets entered the npm distribution with
  0.1.1. npm 0.1.0 remains immutable, and its 54-entry release evidence remains
  historical.
- `@moonweave-ai/ontotect@0.1.0` and `0.1.1` remain historical releases. For
  the 0.1.2 release observation, exact and `latest` both resolved to 0.1.2;
  anonymous registry access, exact-version public Help/List, and project-scoped
  full-suite installation into all five isolated host layouts passed. Package
  provenance and npm account recovery remain separately tracked.
- Ignore-rule semantics were executed using isolated temporary Git metadata.
  The repository has since been published; that release event does not alter
  the scope of the original ignore-rule check.
- No target domain ontology or complete OWL reasoner contract was supplied.
  Starter-fixture results are not proof that another ontology is consistent,
  satisfiable, correct, or release-ready.
- ADR 0001, ADR 0002, ADR 0003, and ADR 0004 are accepted, and the project uses MIT.
  Permanent security contact, npm account recovery, public repository settings,
  and CI remain follow-up decisions.
- This record is active for the evidence captured on 2026-08-07. Later behavior
  or documentation changes require a new or updated record; prior results must
  not be silently carried forward.
