---
type: how-to
status: draft
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 90
summary: Install the Ontotect focused skill suite from npm, npx, source, or a local package into five common Agent hosts.
canonical: docs/en/npm-and-npx-installation.md
related:
  - docs/en/installation.md
  - docs/decisions/0002-explicit-npm-installer.md
  - docs/decisions/0003-organization-scoped-npm-package.md
  - docs/decisions/0004-host-discovery-and-command-adapters.md
  - docs/en/npm-installer-security-review.md
  - docs/en/troubleshooting-discovery.md
  - package.json
supersedes: null
superseded_by: null
---

# npm and npx installation

[简体中文](../zh-CN/npm-and-npx-installation.md) · [Documentation home](index.md)

The npm package is a dependency-free installer around one canonical `ontotect/`
source. It compiles the focused skill suite only when `install` is explicitly
run. Acquiring the package does not install anything into an Agent host: there
are no npm lifecycle scripts.

## Run from this source tree

List the registry and inspect all project destinations without writing:

```powershell
node bin/ontotect.js list
node bin/ontotect.js plan --agents all --scope project --project-root .
```

Apply the reviewed plan:

```powershell
node bin/ontotect.js install --agents all --scope project --project-root .
```

Install only selected hosts:

```powershell
node bin/ontotect.js install --agents cursor,codex --project-root .
```

The defaults are `--agents all --scope project --suite full --commands auto`.
A full plan contains 20 skill entries per host and matching Kilo/OpenCode
commands. Use `--json` for structured output and `--dry-run` to make `install`
plan-only.

## Test a local npm package

Install the current source package globally on the local machine:

```powershell
npm install --global .
ontotect list
ontotect plan --agents all --project-root .
ontotect install --agents all --project-root .
```

This uses the current checkout. It is not a public registry release. Uninstall the global package with `npm uninstall --global @moonweave-ai/ontotect` when it is no longer needed.

Maintainers can inspect a local package without publishing it:

```powershell
npm pack --dry-run --json
```

Create any real test tarball only under the ignored `tmp/` directory, inspect its contents, and remove it after the test.

## Public npm and npx commands

Version `0.1.1` is the current public `latest` release, but it predates the
focused skill-suite discovery repair documented on this source branch. Until a
new release is published, use the source checkout or a locally packed archive
to test the 20-entry suite; do not report public `0.1.1` as containing it.

After the suite release is published, the public workflow is:

```powershell
npx @moonweave-ai/ontotect list
npx @moonweave-ai/ontotect plan --agents all --scope project --project-root .
npx @moonweave-ai/ontotect install --agents all --scope project --project-root .
```

Or install the executable globally first:

```powershell
npm install --global @moonweave-ai/ontotect
ontotect install --agents all --scope project --project-root .
```

The public package identity is `@moonweave-ai/ontotect`; the executable remains
`ontotect`. Registry acquisition, suite installation, and live-host discovery
are separate checks.

## Destination map

| Host key | Project skill root | User skill root |
|---|---|---|
| `cursor` | `.cursor/skills/` | `~/.cursor/skills/` |
| `codex` | `.agents/skills/` | `~/.agents/skills/` |
| `kilo` | `.kilo/skills/` | `~/.kilo/skills/` |
| `opencode` | `.opencode/skills/` | `~/.config/opencode/skills/` |
| `claude` | `.claude/skills/` | `~/.claude/skills/` |

Each root receives `ontotect/` plus 19 generated sibling directories in full
mode. Kilo/OpenCode command roots are documented in [Installation](installation.md).
`--scope user` uses the operating-system home; `--project-root` does not redirect
user-scope installs. Prefer the installer over manual wrapper placement.

## Overwrite and update behavior

An existing core skill, focused skill, or Ontotect command file blocks the
entire requested install. Review the plan, preserve local work, then use
`--force` only when a clean managed replacement is intended:

```powershell
ontotect install --agents cursor --project-root . --force
```

`--force` replaces each managed skill directory from a staged copy, overwrites
managed command files, and removes stale entries recorded by the previous
install state. Unknown sibling skills and unrelated shared-command files are
preserved. Installed copies are generated output; make canonical changes in the
source package or suite registry, then reinstall.

## What the installer does not do

- It does not contact the network, collect telemetry, run ontology tools, or start an Agent host.
- It does not edit host settings, shell profiles, package manifests, or ontology files.
- It does not prove host discovery or behavioral compatibility.
- It does not install optional Python/RDF dependencies.
- It does not publish the npm package or any ontology artifact.

After installation, reload the host and follow the smoke test in
[Installation](installation.md). If an entry is missing, use
[Troubleshoot discovery](troubleshooting-discovery.md). Security design and
residual risks are recorded in the
[npm installer security review](npm-installer-security-review.md).
