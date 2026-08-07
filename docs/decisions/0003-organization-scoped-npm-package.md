---
type: decision
status: accepted
owner: Moonweave-AI
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 180
summary: Publish Ontotect as the public organization-scoped npm package @moonweave-ai/ontotect while retaining the ontotect executable.
canonical: docs/decisions/0003-organization-scoped-npm-package.md
related:
  - docs/decisions/0002-explicit-npm-installer.md
  - package.json
  - docs/en/npm-and-npx-installation.md
supersedes: null
superseded_by: null
---

# ADR 0003: Organization-scoped npm package

[简体中文](0003-organization-scoped-npm-package.zh-CN.md)

## Status

Accepted by the Owner on 2026-08-07 before the first npm publication. This ADR
amends the package-identity clause in ADR 0002; all explicit-installation,
zero-dependency, fixed-path, allowlist, and overwrite controls remain active.

## Context

The repository is owned by the Moonweave-AI GitHub organization. Publishing an
unscoped npm package would not express that organizational identity. The npm
organization already distributes `@moonweave-ai/governance-skills`, and the
authenticated operator is an owner of the `moonweave-ai` npm organization.

Before this decision was applied, the official registry reported no existing
`@moonweave-ai/ontotect` package. This observation establishes availability at
preflight time, not a permanent reservation.

## Decision

1. Publish the package as `@moonweave-ai/ontotect`, never as the unscoped
   `ontotect` package.
2. Keep the executable name `ontotect`; package identity and command name serve
   different purposes.
3. Declare `publishConfig.access` as `public`, bind publication to the official
   npm registry, and also publish with explicit public access.
4. Document public execution as:

   ```text
   npx @moonweave-ai/ontotect <command>
   npm install --global @moonweave-ai/ontotect
   ontotect <command>
   ```

5. Keep repository, issue, author, license, and package links pointed at
   Moonweave-AI resources.
6. Treat the authenticated personal npm account only as an organization-authorized
   operator. npm may display that account in maintainer or publisher metadata;
   the package scope remains the durable organization identity.

## Consequences

- Users can distinguish the official organization package from similarly named
  unscoped packages.
- Commands become slightly longer when invoked directly with npx, while the
  installed executable remains short.
- Publication requires membership and write authority in the npm organization.
- Moving to another scope later would be a distribution and migration change,
  not a cosmetic rename.

## Acceptance evidence

- `npm whoami` returned the authenticated operator.
- `npm org ls moonweave-ai` reported that operator as organization owner.
- The operator has read-write access to the organization's existing package.
- Registry lookup returned `E404` for `@moonweave-ai/ontotect` before release.
- Package tests and dry-run inspection must pass again after the identity change.

## Implementation status

`@moonweave-ai/ontotect@0.1.0` was published with public access on 2026-08-07.
For that initial release, the official registry then reported `latest` as
`0.1.0`; anonymous metadata access succeeded, organization permission was
read-write, and the installed command remained `ontotect`. Public npx help and
isolated project-level installation for all five supported host layouts passed.

On 2026-08-07, `@moonweave-ai/ontotect@0.1.1` was also published with public
access. The official registry reports exact version `0.1.1`, `latest` as
`0.1.1`, MIT, the `ontotect` executable, and the Moonweave-AI repository;
anonymous metadata access succeeded. Exact-version public npx help and isolated
project-level installation for all five host layouts passed with 48 files per
destination. Live-host loading and user/global-scope installation remain
`unverified`.

On 2026-08-07, `@moonweave-ai/ontotect@0.1.2` was published with public access
after release commit `5e1bc27`. The official registry reports exact version
`0.1.2`, `latest` as `0.1.2`, MIT, author `Moonweave AI`, the `ontotect`
executable, and the Moonweave-AI repository. Anonymous exact-version Help/List
execution passed. An isolated public-package installation created all 20 exact
skills for Cursor, Codex, Kilo, OpenCode, and Claude Code, plus all 20 command
adapters for each of Kilo and OpenCode. The refreshed Codex runtime enumerated
all 20 entries; live UI discovery in the other four hosts and public-package
user/global-scope installation remain `unverified`.
