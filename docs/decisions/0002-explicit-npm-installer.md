---
type: decision
status: accepted
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 180
summary: Package Ontotect as a dependency-free npm executable whose explicit installer copies the portable skill into reviewed host roots without lifecycle scripts.
canonical: docs/decisions/0002-explicit-npm-installer.md
related:
  - package.json
  - bin/ontotect.js
  - docs/decisions/0003-organization-scoped-npm-package.md
  - docs/en/npm-and-npx-installation.md
  - docs/en/npm-installer-security-review.md
supersedes: null
superseded_by: null
---

# ADR 0002: Explicit npm and npx skill installer

[简体中文](0002-explicit-npm-installer.zh-CN.md)

## Status

Accepted on 2026-08-07. The project uses the MIT License, and the initial public release was authorized. ADR 0003 amends only the package identity from the originally proposed unscoped name to `@moonweave-ai/ontotect`; the executable and all safety controls in this ADR remain unchanged.

## Context

Ontotect already has a portable Agent Skills directory and a Python installer. Users of Cursor, Codex, Kilo, OpenCode, and Claude Code also expect a familiar npm or npx entry point. npm distribution introduces a supply-chain boundary: retrieving a package must not silently execute an installer, choose a host, overwrite a skill, contact another service, or include the private research corpus.

The project is released under the MIT License. npm package identity metadata must agree with the authoritative `LICENSE` and must not claim completed publication until registry verification succeeds.

## Decision

1. Add one npm package with one executable named `ontotect`. The current package identity is `@moonweave-ai/ontotect` under ADR 0003.
2. Use only Node.js standard-library APIs. Declare no runtime, development, optional, peer, or bundled dependencies.
3. Provide no `preinstall`, `install`, `postinstall`, `prepare`, or other package lifecycle script. Merely downloading or globally installing the package does not copy a skill.
4. Require an explicit command:

   ```text
   ontotect install --agents <hosts> --scope <project|user>
   ```

5. Default to project scope. Accept only the fixed host identifiers `cursor`, `codex`, `kilo`, `opencode`, and `claude`; `all` expands to those five.
6. Resolve destinations from a reviewed project root or the operating system's user home. Do not accept an arbitrary destination flag.
7. Make `plan` and `--dry-run` non-mutating. Refuse an existing destination unless `--force` is explicit. `--json` changes reporting, not authority.
8. Copy the complete `ontotect/` skill package while excluding transient cache files. The source directory and destination are reported to the user.
9. Use the `package.json` `files` allowlist to include only the executable, the distributable skill, public READMEs, and the local banner required by those READMEs. Do not package `book/`, `paper/`, `tools/`, `book-to-skill/`, `tmp/`, tests, local runtime state, or extracted text.
10. Set npm metadata to `MIT` and include the authoritative project `LICENSE`. The required semantic package version is distribution metadata, not dependency pinning or a claim of release stability.
11. Do not publish to npm, create a release, or claim public registry availability without explicit release authorization and a successful registry check. The 2026-08-07 release record supplies that authorization for version `0.1.0`; execution evidence belongs in the verification record.

## Host destinations

| Host | Project scope | User scope |
|---|---|---|
| Cursor | `.cursor/skills/ontotect/` | `~/.cursor/skills/ontotect/` |
| Codex | `.agents/skills/ontotect/` | `~/.agents/skills/ontotect/` |
| Kilo | `.kilo/skills/ontotect/` | `~/.kilo/skills/ontotect/` |
| OpenCode | `.opencode/skills/ontotect/` | `~/.config/opencode/skills/ontotect/` |
| Claude Code | `.claude/skills/ontotect/` | `~/.claude/skills/ontotect/` |

These are installer targets, not a guarantee that a live product has discovered or behaviorally validated the skill.

## Consequences

### Positive

- A single command works from source, a local tarball, a future npm package, or a global installation.
- No dependency tree, lifecycle execution, or hidden network behavior is added.
- The same portable directory remains canonical across all five hosts.
- Dry-run, fixed destinations, explicit overwrite, and a package allowlist make installation inspectable.

### Costs and limitations

- npm requires a package version even though the project does not pin dependencies.
- Users must run a second, explicit command after acquiring the package.
- Public scoped npx installation cannot work until the authorized package publication succeeds in the registry.
- External-host discovery and behavior still require separate live-host tests.
- Package metadata, repository documentation, and the authoritative MIT license must remain synchronized.

## Alternatives considered

### Automatic `postinstall`

Rejected because package acquisition would unexpectedly mutate user or project skill directories and would obscure host and overwrite choices.

### One npm package per host

Rejected because it would duplicate the same skill and create semantic drift across five distributions.

### Add a CLI framework or copy library

Rejected because the required argument parsing and file operations are small, and a dependency tree would add avoidable supply-chain surface.

### Accept arbitrary destination paths

Rejected because the installer is a host adapter, not a general-purpose recursive copy command. Manual copying remains available for nonstandard locations.

## Acceptance evidence

- Node unit tests cover parsing, dry-run, fixed project and user mappings, all-host installation, byte-for-byte copying, overwrite refusal, and error paths.
- `npm pack --dry-run --json` shows only the intended allowlisted package contents.
- A locally packed tarball executes the CLI and installs all five layouts in an isolated directory.
- Python installer and npm installer map the five host identifiers consistently.
- The package has no dependencies or lifecycle scripts.
- Bilingual installation, architecture, security, and verification documentation remain synchronized.

Local evidence was executed and is recorded in [verification-record.md](../en/verification-record.md): 8 Node tests passed; the MIT release-candidate pack contained 54 intended entries, including `LICENSE`, and zero forbidden corpus/cache/test artifacts; a real local tarball installed all five project layouts through npx, with 48 files per destination matching the source directly byte-for-byte. Public registry publication, anonymous metadata access, public npx help, and project-scoped installation into all five isolated host layouts were subsequently executed successfully. Live-host discovery and behavior remain `unverified`.
