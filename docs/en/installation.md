---
type: how-to
status: draft
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 180
summary: Install the complete Ontotect skill directory in common Agent Skills hosts without changing its portable structure.
canonical: docs/en/installation.md
related:
  - ontotect/references/agent-compatibility.md
  - ontotect/scripts/install_skill.py
  - docs/en/npm-and-npx-installation.md
  - docs/en/compatibility.md
supersedes: null
superseded_by: null
---

# Installation

[简体中文](../zh-CN/installation.md) · [Documentation home](index.md)

Ontotect follows the open Agent Skills directory convention. Install the entire `ontotect/` directory; copying only `SKILL.md` breaks its relative references, assets, command specifications, and scripts.

## Use the npm installer

From this source tree, preview all five project destinations:

```powershell
node bin/ontotect.js plan --agents all --scope project --project-root .
```

Apply the reviewed plan:

```powershell
node bin/ontotect.js install --agents all --scope project --project-root .
```

The package has no dependencies or lifecycle scripts; acquisition alone does not copy the skill. Public `npx @moonweave-ai/ontotect` commands become available only after the authorized organization-scoped npm publication succeeds. See [npm and npx installation](npm-and-npx-installation.md) for source, local package, registry, user-scope, overwrite, and security details.

## Use the Python installer

Preview a project-scoped installation from the repository root:

```powershell
python ontotect/scripts/install_skill.py --agents all --scope project --project-root .
```

Apply the reviewed plan:

```powershell
python ontotect/scripts/install_skill.py --agents all --scope project --project-root . --apply
```

Select hosts with `--agents cursor codex kilo opencode claude`. Select user scope with `--scope user`. The installer does not overwrite an existing skill unless `--force` is also supplied. Run `--help` for the current interface. The Node and Python installers use the same five canonical project and user destinations.

## Manual project installation

Copy `ontotect/` intact to a root discovered by the host:

| Host | Typical project destination |
|---|---|
| Cursor | `.cursor/skills/ontotect/` |
| Codex | `.agents/skills/ontotect/` |
| Kilo | `.kilo/skills/ontotect/` or `.agents/skills/ontotect/` |
| OpenCode | `.opencode/skills/ontotect/` or `.agents/skills/ontotect/` |
| Claude Code | `.claude/skills/ontotect/` |

User/global locations and host discovery rules change independently of Ontotect. The current detailed table and official links live in [agent-compatibility.md](../../ontotect/references/agent-compatibility.md).

## Verify discovery

After installation:

1. Reload the host or start a new session.
2. Confirm `ontotect` appears in the skill list, when the host exposes one.
3. Send `Use Ontotect. Command: help. Target: first-time user.`
4. Ask the host to route a harmless example.
5. Confirm it can read `references/workflow.md` on demand.
6. Confirm merely loading the skill does not run scripts or request extra permissions.

A copied directory and valid frontmatter establish structural compatibility only. Behavioral compatibility requires the host to discover the skill, resolve relative files, follow the command contract, and expose user-approved file or command tools when work requires them.

## Optional Python capabilities

The navigator uses the Python standard library. The advisory ontology audit requires RDFLib; optional SHACL validation also requires pySHACL. Do not install dependencies merely to load the skill. If a requested check is unavailable, report it as `unverified` or obtain user approval before changing the environment.

```powershell
python ontotect/scripts/ontotect.py help
python ontotect/scripts/ontology_audit.py --help
python ontotect/scripts/ontology_diff.py --help
```

The navigator prints guidance cards. It does not inspect, repair, validate, or publish an ontology.

## Updating

Replace or merge the whole skill package through a reviewed repository update. Preserve local project evidence outside the installed skill directory. Do not add hashes, dependency pins, or repeated host-version checks by default; introduce stronger integrity controls only when a concrete acceptance or risk requirement calls for them.
