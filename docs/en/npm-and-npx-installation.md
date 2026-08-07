---
type: how-to
status: draft
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 180
summary: Install Ontotect from source, a local npm package, npx, or a future public npm release into five common Agent Skills hosts.
canonical: docs/en/npm-and-npx-installation.md
related:
  - docs/en/installation.md
  - docs/decisions/0002-explicit-npm-installer.md
  - docs/en/npm-installer-security-review.md
  - package.json
supersedes: null
superseded_by: null
---

# npm and npx installation

[简体中文](../zh-CN/npm-and-npx-installation.md) · [Documentation home](index.md)

The npm package is a small, dependency-free adapter around the same portable `ontotect/` directory used by the Python and manual installation paths. Acquiring the package does not install the skill into any Agent host: there are no npm lifecycle scripts. You must explicitly run `plan` or `install`.

## Current Preview: run from this source tree

Inspect the five project destinations without writing:

```powershell
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

The default agent set is `all`; the default scope is `project`; the default project root is the current working directory. Use `--json` for structured output and `--dry-run` to make `install` plan-only.

## Test a local npm package

Install the current source package globally on the local machine:

```powershell
npm install --global .
ontotect plan --agents all --project-root .
ontotect install --agents all --project-root .
```

This uses the current checkout. It is not a public registry release. Uninstall the global command with `npm uninstall --global ontotect` when it is no longer needed.

Maintainers can inspect a local package without publishing it:

```powershell
npm pack --dry-run --json
```

Create any real test tarball only under the ignored `tmp/` directory, inspect its contents, and remove it after the test.

## Public npm and npx commands

The following commands become available only after an authorized maintainer publishes `ontotect` to the public npm registry:

```powershell
npx ontotect plan --agents all --scope project --project-root .
npx ontotect install --agents all --scope project --project-root .
```

Or install the executable globally first:

```powershell
npm install --global ontotect
ontotect install --agents all --scope project --project-root .
```

Public publication has not been performed for the current Preview. Until it occurs, use the source-tree or local-package commands above.

## Destination map

| Host key | Project scope | User scope |
|---|---|---|
| `cursor` | `.cursor/skills/ontotect/` | `~/.cursor/skills/ontotect/` |
| `codex` | `.agents/skills/ontotect/` | `~/.agents/skills/ontotect/` |
| `kilo` | `.kilo/skills/ontotect/` | `~/.kilo/skills/ontotect/` |
| `opencode` | `.opencode/skills/ontotect/` | `~/.config/opencode/skills/ontotect/` |
| `claude` | `.claude/skills/ontotect/` | `~/.claude/skills/ontotect/` |

`--scope user` uses the operating system's user home. `--project-root` does not redirect user-scope installs. Nonstandard destinations should use a reviewed manual copy of the complete directory.

## Overwrite and update behavior

An existing destination blocks the entire requested multi-host install. Review the path, preserve any local work, then use `--force` only when replacing or merging that exact generated installation is intended:

```powershell
ontotect install --agents cursor --project-root . --force
```

`--force` overwrites matching files and preserves unrelated extra files already inside the destination. Installed copies should be treated as generated mirrors; make canonical changes in the source package, not inside those mirrors.

## What the installer does not do

- It does not contact the network, collect telemetry, run ontology tools, or start an Agent host.
- It does not edit host settings, shell profiles, package manifests, or ontology files.
- It does not prove host discovery or behavioral compatibility.
- It does not install optional Python/RDF dependencies.
- It does not publish the npm package or any ontology artifact.

After copying, reload the host and follow the discovery smoke test in [Installation](installation.md). Security design and residual risks are recorded in the [npm installer security review](npm-installer-security-review.md).
