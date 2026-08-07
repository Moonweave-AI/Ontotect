# Agent compatibility

Ontotect uses the open Agent Skills directory format and installs a focused
skill suite. The canonical source is one `ontotect/` directory; the installer
compiles self-contained `ontotect-*` directories from
`assets/skill-suite.json`. Every generated entry has matching `SKILL.md`
frontmatter, its own fixed command, complete local references/assets/scripts,
and matching `agents/openai.yaml` presentation metadata.

Package acquisition does not perform this compilation or register anything in
a host. Run `ontotect plan`, review the destinations, then run
`ontotect install`.

## Suite modes

- `--suite full` is the default. It installs 20 discoverable skills: the root,
  Help, Router, Status, eight engineering modes, a generic Stage entry, and
  seven explicit lifecycle-stage entries.
- `--suite core` installs only `ontotect` for users who want one router entry.
- `--commands auto` generates 20 Kilo/OpenCode command adapters for a full
  suite, or one root adapter for a core suite.
- `--commands none` installs no separate command files.

Use `ontotect list` to inspect the exact skill-to-command registry.

## Host matrix

| Host | Project skill root | User skill root | Explicit invocation | Additional command output | Reliable refresh boundary |
|---|---|---|---|---|---|
| Cursor | `.cursor/skills/` | `~/.cursor/skills/` | `/ontotect-review`, `@ontotect-review`, or implicit triggering | None; current Skills are the native command surface | Restart/reopen the session after installation |
| Codex | `.agents/skills/` from CWD to repo root | `~/.agents/skills/` | `$ontotect-review`, `$ontotect-router`, or `/skills` | None; supported custom project slash directories do not exist | Changes are normally detected; restart when the client is stale |
| Kilo | `.kilo/skills/` | `~/.kilo/skills/` | `/ontotect-review` in current builds | `.kilo/commands/*.md`; user `~/.config/kilo/commands/*.md` | `/reload` or a new session |
| OpenCode | `.opencode/skills/` | `~/.config/opencode/skills/` | Host skill tool; newer releases may expose `/ontotect-review` natively | `.opencode/commands/*.md`; user `~/.config/opencode/commands/*.md` | Exit and restart after installation |
| Claude Code | `.claude/skills/` | `~/.claude/skills/` | `/ontotect-review` | None; Skills are the recommended native command surface | Existing skill roots are watched; restart if the top-level skills directory was newly created during the session |

The table shows the installer-selected roots. Some hosts also discover
compatible `.agents/skills/` or `.claude/skills/` roots, but Ontotect writes one
explicit target per selected host so the installation plan remains
predictable.

## Why the invocation syntax differs

Codex CLI and IDE use `$skill-name` for explicit skill invocation and `/skills`
for the picker. Codex Desktop may also enumerate enabled skills inside its slash
selector, but this is not a guarantee that typing `/ontotect-review` is a
portable Codex command. Do not create deprecated `~/.codex/prompts` entries to
simulate it.

Cursor and Claude Code map skill directory names directly to slash entries, so
the focused directories are sufficient. Current Cursor documentation treats
Skills as the preferred replacement for older `.cursor/commands` files; Claude
Code likewise treats `.claude/commands` as a supported legacy format.

Kilo and OpenCode have release generations in which skill discovery and custom
slash commands are separate. Ontotect therefore creates thin command adapters
for them. Each adapter loads the matching focused skill, forwards
`$ARGUMENTS`, and contains no ontology-engineering logic of its own.

## Discovery diagnosis

When an expected entry is missing:

1. Distinguish package acquisition from installation. `npm install --global`
   exposes the shell command; it does not place skills in every Agent root.
2. Run the same `ontotect plan` used for installation and inspect the exact
   selected scope, host, suite mode, and destination.
3. Confirm the expected file exists, for example
   `.agents/skills/ontotect-review/SKILL.md` for project Codex or
   `~/.claude/skills/ontotect-review/SKILL.md` for user Claude Code.
4. Confirm the directory name and frontmatter `name` are both
   `ontotect-review`; confirm `description` is non-empty.
5. Use the host's real syntax: `$ontotect-review` or `/skills` in Codex;
   `/ontotect-review` in Cursor/Claude; the installed adapter in stable
   Kilo/OpenCode.
6. Refresh the host using the matrix above. A conversation created before the
   installation may retain a stale skill catalog.
7. For Claude, check `/skills` visibility and `skillOverrides`; for Cursor,
   inspect its Skills settings; for Codex, check the `/skills` picker before
   concluding the installation failed.
8. If Kilo/OpenCode native skill slash discovery is absent, confirm the matching
   command file exists and contains `$ARGUMENTS`.

Do not rename the suite to `ontology`. A separately installed `ontology` skill
is a different package and does not prove that Ontotect was installed.

## Verification levels

Report these separately:

1. **Distribution** — the npm archive contains the canonical source, manifest,
   installer, and public files.
2. **Structural installation** — the installer created every planned directory
   and command file with matching names and self-contained resources.
3. **Live discovery** — the actual host lists or explicitly invokes the focused
   skill after refresh.
4. **Behavioral execution** — the host follows the fixed command, loads relevant
   references, respects permissions, and produces Ontotect's evidence contract.

A filesystem copy or frontmatter parse does not prove levels 3 or 4. Mark
unexecuted host checks `unverified`.

## Host smoke test

1. Install into one isolated project or user scope through the installer.
2. Refresh the host.
3. Confirm Help, Router, Review, Validate, and at least one lifecycle-stage
   entry appear or can be explicitly invoked.
4. Invoke Help, then route a harmless ontology request.
5. Invoke Review against a synthetic fixture and confirm no silent repair.
6. Confirm relative references resolve inside the selected generated skill.
7. Confirm loading a skill does not execute scripts or request unrelated
   permissions.

## Authoritative host references

- Agent Skills open specification: https://agentskills.io and https://github.com/agentskills/agentskills/blob/main/docs/specification.mdx
- Cursor Skills: https://cursor.com/docs/skills.md and https://cursor.com/help/customization/skills.md
- Codex Skills: https://developers.openai.com/codex/skills
- Codex custom prompts (deprecated): https://developers.openai.com/codex/custom-prompts
- Codex Desktop slash selector: https://learn.chatgpt.com/docs/reference/slash-commands
- Kilo Skills and workflows: https://kilo.ai/docs/customize/skills and https://kilo.ai/docs/customize/workflows
- OpenCode Skills and commands: https://opencode.ai/docs/skills/ and https://opencode.ai/docs/commands/
- Claude Code Skills and commands: https://code.claude.com/docs/en/slash-commands and https://code.claude.com/docs/en/commands

Host discovery is product behavior and can change. Recheck first-party sources
when preparing a release, without introducing routine version locks or repeated
checks into normal skill execution.
