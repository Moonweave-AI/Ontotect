---
type: verification
status: draft
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 180
summary: Local QA-L4 evidence and explicit verification limits for the current Ontotect source package and public documentation.
canonical: docs/en/verification-record.md
related:
  - docs/en/quality-and-validation.md
  - docs/en/compatibility.md
  - docs/decisions/0001-portable-command-router.md
  - docs/decisions/0002-explicit-npm-installer.md
  - docs/decisions/0003-organization-scoped-npm-package.md
  - docs/en/npm-installer-security-review.md
supersedes: null
superseded_by: null
---

# Local verification record — 2026-08-07

[简体中文](../zh-CN/verification-record.md) · [Documentation home](index.md)

This record describes checks actually executed against the current local source
package after the command, router, documentation, compatibility, and npm/npx distribution work. It is
not a stable-release declaration, external-host certification, or domain
ontology validation report.

## Executed evidence

| Area | Executed check | Observed result |
|---|---|---|
| Research synthesis | Confirmed the evidence register for the completely processed local set | 29 PDFs: 5 books, 17 papers, 7 tool documents; 2,045 pages and 791,157 extracted words |
| Repository regression | Standard-library Python unit-test discovery | 29 tests passed, including bilingual docs, npm metadata, accessible SVG, citation wording, command contracts, and the Python installer |
| npm installer regression | `npm test` / Node's built-in test runner | 8 tests passed: arguments, dry-run, five project paths, five user paths, complete copying, conflict preflight, explicit force, metadata, and packed-tarball npx execution |
| Agent Skill structure | Skill Creator `quick_validate.py` | `Skill is valid!` |
| Generated-skill safety | book-to-skill advisory generated-skill scan | Passed; no known injection or unsafe-authority pattern reported |
| Static host lenses | book-to-skill Claude, Amp, and GitHub Copilot CLI lenses | All three passed with zero warnings; these are static lenses, not live-host runs |
| Documentation | Mirrored filenames, governance frontmatter, relative links, command vocabulary, encoding, and corpus exclusion | Passed through repository regression checks |
| README visuals and references | Parsed the local SVG and checked accessibility metadata, two Mermaid diagrams per language, bilingual structure, internal links, standard-form references, and removed wording | Passed; SVG has no script, external font, or imported resource; stale `.mjs` and the rejected acknowledgment wording had zero public matches |
| Source assets | Parsed 4 Turtle files, 1 SPARQL query, 1 JSON file, 1 TSV file; parsed 4 Python scripts with `ast` | All parsed; the TSV contained data rows |
| Functional fixtures | Ran the advisory audit with the valid and invalid fixtures and starter shapes | Valid fixture: exit 0, SHACL conforms, zero advisory findings. Invalid fixture: exit 1, SHACL non-conformant, one violation |
| Asserted graph diff | Compared the valid fixture with itself and with the invalid fixture | Same graph: 0 added/0 removed. Changed graph: 1 added/4 removed |
| Command process matrix | Invoked every scenario-card command, all seven `stage` commands, and all six unambiguous direct stage aliases | 9 scenario commands, 7 stages, and 6 aliases exited 0; router/help behavior is also covered by tests |
| Router regression | Tested English and Chinese multi-intent routing, explicit command precedence, plan-only, ambiguous targets, every scenario, and coordination stages | Passed; `help` now uses `n/a`, while unknown `status` stage is `unverified` |
| Five-host packaging | Dry-run and applied the installer into isolated Cursor, Codex, Kilo, OpenCode, and Claude layouts | 5 plans and 5 installs; 48 files per source set compared byte-for-byte with zero mismatch; 5 repeat installs correctly refused without `--force` |
| npm package metadata | Inspected `package.json` and executable behavior | Package name is `@moonweave-ai/ontotect`, binary is `ontotect`; MIT license, Moonweave-AI repository metadata, public publish configuration, ESM, zero dependencies, no engine constraint, no install/prepare lifecycle scripts, and a public-file allowlist |
| npm pack allowlist | Ran `npm pack --dry-run --json --ignore-scripts` after Python tests had generated local caches | The first inspection exposed two `.pyc` cache files and blocked acceptance; the scripts allowlist was narrowed. The MIT release candidate contains 54 intended entries including `LICENSE`, all required public files, and zero corpus, cache, test, temporary, document-source, or tarball offenders |
| Packed npx installation | Created a real local tarball in an isolated temporary directory, invoked it through npx in offline/ignore-scripts mode, and removed it after the test | All 5 project destinations installed; 48 relative files per destination matched the canonical skill byte-for-byte with zero mismatch; no registry publication occurred |
| npm installer security | Applied the S4 / QA-L4 threat model and checked explicit mutation, fixed destinations, overwrite, network, dependency, corpus, lifecycle, and organization-scope boundaries | Local controls passed; the Owner accepted ADR 0002 and ADR 0003, selected MIT, and authorized `0.1.0`. Registry authentication and npm organization ownership are verified; publication evidence, account recovery, provenance, and a permanent private reporting path remain separately tracked |
| Ignore behavior | Evaluated `.gitignore` with isolated temporary Git metadata | 10 private/generated cases ignored; 7 public Markdown/Turtle/SPARQL/JSON or `.env.example` cases remained visible |
| First-contact behavior | A context-isolated Agent loaded the skill progressively and answered a Chinese first-use request | Correctly chose read-only `help`, recommended a separate read-only `review`, and preserved `unverified`; it exposed a help-stage ambiguity that was corrected and regression-tested |
| Mixed-intent behavior | An independent follow-up evaluator routed a Chinese review, repair, OWL/SHACL validation, and release-evidence request | Selected `review -> repair -> validate -> release` preflight; limited writes to the named ontology and confirmed tests; prohibited remote publication; identified missing CQ, import, tool, and authority inputs; found no material defect after the correction |
| Status and release-gate behavior | A follow-up evaluator assessed a reported parser pass, unavailable reasoner, and temporarily accepted SHACL failure, then rechecked the corrected contract | Parser and reasoning remained `unverified`; SHACL retained underlying `fail`; the incomplete exception overlay did not apply; Stage F and release were `revise`. The recheck confirmed deterministic gate precedence and exception preservation with no remaining material ambiguity |

Direct byte comparison was used for both installation matrices. No cryptographic
hash validation, dependency pin, repeated host-version check, or version lock was added.

## Representative commands

```text
python -m unittest discover -s tests -v
npm test
npm pack --dry-run --json --ignore-scripts
node bin/ontotect.js plan --agents all --scope project --project-root .
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

- Cursor, Codex, Kilo, OpenCode, and Claude Code were not each launched as
  external products against this checkout. Discovery and behavioral
  compatibility in those live hosts remain `unverified`.
- The public npm package was not yet published at this record point. The
  authenticated operator and `moonweave-ai` organization ownership were
  verified; package provenance, account recovery, and public
  `npx @moonweave-ai/ontotect` acquisition remain `unverified`. Only a locally
  packed tarball was executed.
- The repository root is not currently a Git worktree. Ignore-rule semantics
  were executed using temporary Git metadata, but the set of tracked files and
  remote publication state remain `unverified`.
- No target domain ontology or complete OWL reasoner contract was supplied.
  Starter-fixture results are not proof that another ontology is consistent,
  satisfiable, correct, or release-ready.
- ADR 0001, ADR 0002, and ADR 0003 are accepted, the project uses MIT, and the Owner authorized
  the initial release. Permanent security contact, npm account recovery, public
  repository settings, and CI remain follow-up decisions.
- This record is `draft` until the project Owner reviews it. Later behavior or
  documentation changes require a new or updated record; prior results must
  not be silently carried forward.
