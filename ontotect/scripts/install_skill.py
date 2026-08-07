#!/usr/bin/env python3
"""Plan or install the Ontotect skill suite into common Agent Skills roots.

The default is a dry run. Pass --apply to copy files. Existing Ontotect skill
or command-adapter destinations are left untouched unless --force explicitly
authorizes a clean managed refresh.
"""

from __future__ import annotations

import argparse
import errno
import json
import os
import re
import shutil
import stat as stat_module
import sys
import time
import uuid
from pathlib import Path
from typing import Any


SKILL_NAME = "ontotect"
AGENTS = ("cursor", "codex", "kilo", "opencode", "claude")
COMMAND_AGENTS = ("kilo", "opencode")
SUITE_MANIFEST = Path("assets") / "skill-suite.json"
COMMAND_TEMPLATE = Path("assets") / "command-adapter.md"
INSTALL_STATE_FILE = ".ontotect-suite.json"
SKILL_NAME_PATTERN = re.compile(r"ontotect(?:-[a-z0-9-]+)?\Z")
SKILL_COMMANDS = {
    "help",
    "router",
    "status",
    "build",
    "review",
    "repair",
    "optimize",
    "refactor",
    "validate",
    "govern",
    "release",
    "stage",
    "stage charter",
    "stage reuse",
    "stage conceptualize",
    "stage formalize",
    "stage implement",
    "stage verify",
    "stage release",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--agents",
        nargs="+",
        choices=(*AGENTS, "all"),
        default=["all"],
        help="Hosts to target (default: all).",
    )
    parser.add_argument(
        "--scope",
        choices=("project", "user"),
        default="project",
        help="Install into a project or user skill root (default: project).",
    )
    parser.add_argument(
        "--project-root",
        type=Path,
        default=Path.cwd(),
        help="Project root for project scope (default: current directory).",
    )
    parser.add_argument(
        "--suite",
        choices=("full", "core"),
        default="full",
        help="Install all discoverable entries or only ontotect (default: full).",
    )
    parser.add_argument(
        "--commands",
        choices=("auto", "none"),
        default="auto",
        help=(
            "Install explicit Kilo/OpenCode slash-command adapters when set to "
            "auto (default); use none for skill-only installation."
        ),
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Perform the copy. Without this flag, print a dry-run plan.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help=(
            "Cleanly replace managed Ontotect skills and commands and remove "
            "stale entries recorded by a prior install."
        ),
    )
    parser.add_argument("--json", action="store_true", help="Emit JSON output.")
    return parser.parse_args()


def canonical_skill(source: Path) -> dict[str, str]:
    skill_file = source / "SKILL.md"
    if not skill_file.is_file():
        raise ValueError(f"Missing required file: {skill_file}")
    text = skill_file.read_text(encoding="utf-8")
    match = re.match(r"\A---\s*\n(.*?)\n---\s*\n", text, flags=re.DOTALL)
    if not match:
        raise ValueError("SKILL.md must start with YAML frontmatter")
    name_match = re.search(r"(?m)^name:\s*['\"]?([^'\"\n]+)", match.group(1))
    description_match = re.search(r"(?m)^description:\s*\S", match.group(1))
    if not name_match or name_match.group(1).strip() != SKILL_NAME:
        raise ValueError(f"SKILL.md name must be {SKILL_NAME!r}")
    if not description_match:
        raise ValueError("SKILL.md description must be non-empty")
    if source.name != SKILL_NAME:
        raise ValueError(f"Skill directory must be named {SKILL_NAME!r}")
    body = text[match.end() :]
    body = re.sub(r"\A# Ontotect\s*\n", "", body, count=1)
    return {"text": text, "body": body}


def load_suite(source: Path) -> tuple[list[dict[str, str]], str]:
    manifest = json.loads((source / SUITE_MANIFEST).read_text(encoding="utf-8"))
    template = (source / COMMAND_TEMPLATE).read_text(encoding="utf-8")
    if manifest.get("schema_version") != "1.0" or not isinstance(
        manifest.get("skills"), list
    ):
        raise ValueError(
            "skill-suite.json must contain schema_version 1.0 and a skills array"
        )
    for placeholder in (
        "{{short_description}}",
        "{{instruction}}",
        "{{skill}}",
    ):
        if placeholder not in template:
            raise ValueError(f"command-adapter.md must contain {placeholder}")
    skills: list[dict[str, str]] = []
    seen: set[str] = set()
    required = (
        "name",
        "display_name",
        "short_description",
        "description",
        "command",
        "instruction",
    )
    for raw in manifest["skills"]:
        if not isinstance(raw, dict):
            raise ValueError("skill-suite.json contains an invalid skill entry")
        if any(not isinstance(raw.get(key), str) or not raw[key].strip() for key in required):
            raise ValueError("skill-suite.json contains an invalid skill entry")
        if not SKILL_NAME_PATTERN.fullmatch(raw["name"]):
            raise ValueError(f"Invalid skill-suite name: {raw['name']}")
        if len(raw["short_description"]) > 64:
            raise ValueError(f"short_description exceeds 64 characters: {raw['name']}")
        if raw["command"] not in SKILL_COMMANDS:
            raise ValueError(f"Invalid suite command: {raw['command']}")
        dispatch = raw.get("dispatch", "fixed")
        if dispatch not in {"conditional", "fixed"}:
            raise ValueError(f"Invalid suite dispatch: {raw['name']}")
        if raw["name"] == SKILL_NAME and dispatch != "conditional":
            raise ValueError("the ontotect root skill must use conditional dispatch")
        if raw["name"] != SKILL_NAME and dispatch != "fixed":
            raise ValueError(f"focused skill {raw['name']} must use fixed dispatch")
        if raw["name"] in seen:
            raise ValueError(f"Duplicate skill-suite entry: {raw['name']}")
        seen.add(raw["name"])
        skills.append({**{key: raw[key] for key in required}, "dispatch": dispatch})
    if SKILL_NAME not in seen:
        raise ValueError("skill-suite.json must define the ontotect root skill")
    return skills, template


def validate_source(source: Path) -> None:
    canonical_skill(source)
    load_suite(source)


def selected_agents(values: list[str]) -> list[str]:
    if "all" in values:
        return list(AGENTS)
    return list(dict.fromkeys(values))


def selected_suite_skills(
    skills: list[dict[str, str]], suite_mode: str
) -> list[dict[str, str]]:
    if suite_mode == "core":
        return [skill for skill in skills if skill["name"] == SKILL_NAME]
    return skills


def absolute_path(path: Path) -> Path:
    return Path(os.path.abspath(os.fspath(path.expanduser())))


def is_contained(anchor: Path, candidate: Path) -> bool:
    try:
        return os.path.commonpath((os.fspath(anchor), os.fspath(candidate))) == os.fspath(
            anchor
        )
    except ValueError:
        return False


def is_reparse_point(info: os.stat_result) -> bool:
    attributes = getattr(info, "st_file_attributes", 0)
    return stat_module.S_ISLNK(info.st_mode) or bool(attributes & 0x400)


def inspect_destination(
    base_path: Path,
    target_path: Path,
    expected_kind: str,
    require_writable: bool,
) -> Path:
    base = absolute_path(base_path)
    target = absolute_path(target_path)
    if target == base or not is_contained(base, target):
        raise ValueError(f"Destination escapes the selected install anchor: {target}")
    if not base.exists() or not base.is_dir():
        raise ValueError(f"Install anchor must already be a directory: {base}")

    real_base = base.resolve(strict=True)
    parts = target.relative_to(base).parts
    current = base
    nearest_directory = base
    resolved_destination = real_base
    for index, part in enumerate(parts):
        current = current / part
        try:
            info = os.lstat(current)
        except FileNotFoundError:
            resolved_destination = absolute_path(
                nearest_directory.resolve(strict=True).joinpath(*parts[index:])
            )
            break
        if is_reparse_point(info):
            raise ValueError(
                f"Refusing symlink, junction, or reparse point in install destination: {current}"
            )
        resolved_current = current.resolve(strict=True)
        if not is_contained(real_base, resolved_current):
            raise ValueError(f"Resolved install destination escapes its anchor: {current}")
        is_leaf = index == len(parts) - 1
        if not is_leaf and not stat_module.S_ISDIR(info.st_mode):
            raise ValueError(f"Install destination parent is not a directory: {current}")
        if is_leaf and expected_kind == "directory" and not stat_module.S_ISDIR(
            info.st_mode
        ):
            raise ValueError(f"Skill destination must be a directory: {current}")
        if is_leaf and expected_kind == "file" and not stat_module.S_ISREG(
            info.st_mode
        ):
            raise ValueError(f"Command destination must be a regular file: {current}")
        if stat_module.S_ISDIR(info.st_mode):
            nearest_directory = current
        resolved_destination = resolved_current

    if not is_contained(real_base, resolved_destination):
        raise ValueError(f"Resolved install destination escapes its anchor: {target}")
    if require_writable:
        write_parent = target.parent if target.exists() else nearest_directory
        if not os.access(write_parent, os.W_OK):
            raise ValueError(f"Install destination parent is not writable: {write_parent}")
    return resolved_destination


def install_anchor(args: argparse.Namespace) -> Path:
    return Path.home() if args.scope == "user" else absolute_path(args.project_root)


def user_roots() -> dict[str, Path]:
    home = Path.home()
    return {
        "cursor": home / ".cursor" / "skills",
        "codex": home / ".agents" / "skills",
        "kilo": home / ".kilo" / "skills",
        "opencode": home / ".config" / "opencode" / "skills",
        "claude": home / ".claude" / "skills",
    }


def project_roots(project_root: Path) -> dict[str, Path]:
    root = absolute_path(project_root)
    return {
        "cursor": root / ".cursor" / "skills",
        "codex": root / ".agents" / "skills",
        "kilo": root / ".kilo" / "skills",
        "opencode": root / ".opencode" / "skills",
        "claude": root / ".claude" / "skills",
    }


def user_command_roots() -> dict[str, Path]:
    home = Path.home()
    return {
        "kilo": home / ".config" / "kilo" / "commands",
        "opencode": home / ".config" / "opencode" / "commands",
    }


def project_command_roots(project_root: Path) -> dict[str, Path]:
    root = absolute_path(project_root)
    return {
        "kilo": root / ".kilo" / "commands",
        "opencode": root / ".opencode" / "commands",
    }


def build_plan(source: Path, args: argparse.Namespace) -> list[dict[str, Any]]:
    roots = user_roots() if args.scope == "user" else project_roots(args.project_root)
    anchor = install_anchor(args)
    plan: list[dict[str, Any]] = []
    for agent in selected_agents(args.agents):
        destination = absolute_path(roots[agent] / SKILL_NAME)
        resolved_destination = inspect_destination(
            anchor, destination, "directory", args.apply
        )
        destination_exists = destination.exists()
        plan.append(
            {
                "agent": agent,
                "skill": SKILL_NAME,
                "source": str(source),
                "destination": str(destination),
                "resolved_destination": str(resolved_destination),
                "exists": destination_exists,
                "action": (
                    "replace"
                    if destination_exists and args.force
                    else "blocked"
                    if destination_exists
                    else "copy"
                ),
                "status": "blocked" if destination_exists and not args.force else "planned",
            }
        )
    return plan


def build_suite_plan(
    source: Path, args: argparse.Namespace, skills: list[dict[str, str]]
) -> list[dict[str, Any]]:
    if args.suite == "core":
        return []
    roots = user_roots() if args.scope == "user" else project_roots(args.project_root)
    anchor = install_anchor(args)
    entries = [skill for skill in skills if skill["name"] != SKILL_NAME]
    plan: list[dict[str, Any]] = []
    for agent in selected_agents(args.agents):
        destination = absolute_path(roots[agent])
        skill_items: list[dict[str, Any]] = []
        for entry in entries:
            skill_destination = destination / entry["name"]
            resolved_destination = inspect_destination(
                anchor, skill_destination, "directory", args.apply
            )
            skill_exists = skill_destination.exists()
            skill_items.append(
                {
                    "skill": entry["name"],
                    "command": entry["command"],
                    "destination": str(skill_destination),
                    "resolved_destination": str(resolved_destination),
                    "exists": skill_exists,
                    "status": "blocked" if skill_exists and not args.force else "planned",
                }
            )
        conflicts = [item["destination"] for item in skill_items if item["exists"]]
        plan.append(
            {
                "agent": agent,
                "source": str(source),
                "destination": str(destination),
                "count": len(skill_items),
                "exists": bool(conflicts),
                "conflicts": conflicts,
                "action": (
                    "replace" if conflicts and args.force else "blocked" if conflicts else "generate"
                ),
                "status": "blocked" if conflicts and not args.force else "planned",
                "skills": skill_items,
            }
        )
    return plan


def build_command_plan(
    source: Path, args: argparse.Namespace, skills: list[dict[str, str]]
) -> list[dict[str, Any]]:
    if args.commands == "none":
        return []
    roots = (
        user_command_roots()
        if args.scope == "user"
        else project_command_roots(args.project_root)
    )
    entries = selected_suite_skills(skills, args.suite)
    anchor = install_anchor(args)
    plan: list[dict[str, Any]] = []
    for agent in selected_agents(args.agents):
        if agent not in COMMAND_AGENTS:
            continue
        destination = absolute_path(roots[agent])
        files: list[dict[str, Any]] = []
        for entry in entries:
            file_destination = destination / f"{entry['name']}.md"
            resolved_destination = inspect_destination(
                anchor, file_destination, "file", args.apply
            )
            file_exists = file_destination.exists()
            files.append(
                {
                    "command": entry["name"],
                    "skill": entry["name"],
                    "destination": str(file_destination),
                    "resolved_destination": str(resolved_destination),
                    "exists": file_exists,
                    "status": "blocked" if file_exists and not args.force else "planned",
                }
            )
        conflicts = [item["destination"] for item in files if item["exists"]]
        plan.append(
            {
                "agent": agent,
                "source": str(source / SUITE_MANIFEST),
                "destination": str(destination),
                "count": len(files),
                "exists": bool(conflicts),
                "conflicts": conflicts,
                "action": (
                    "overwrite"
                    if conflicts and args.force
                    else "blocked"
                    if conflicts
                    else "generate"
                ),
                "status": "blocked" if conflicts and not args.force else "planned",
                "files": files,
            }
        )
    return plan


def load_managed_state(core_destination: Path) -> dict[str, Any]:
    state_path = core_destination / INSTALL_STATE_FILE
    if not state_path.exists():
        return {"exists": False, "skills": [], "commands": []}
    payload = json.loads(state_path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict) or not isinstance(
        payload.get("skills"), list
    ) or not isinstance(payload.get("commands"), list):
        raise ValueError(f"Managed install state is invalid: {state_path}")
    names = [*payload["skills"], *payload["commands"]]
    if any(not isinstance(name, str) or not SKILL_NAME_PATTERN.fullmatch(name) for name in names):
        raise ValueError(f"Managed install state contains an invalid entry: {state_path}")
    return {
        "exists": True,
        "skills": list(dict.fromkeys(payload["skills"])),
        "commands": list(dict.fromkeys(payload["commands"])),
    }


def build_cleanup_plan(
    args: argparse.Namespace,
    skills: list[dict[str, str]],
    plan: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    anchor = install_anchor(args)
    skill_roots = user_roots() if args.scope == "user" else project_roots(args.project_root)
    command_roots = (
        user_command_roots()
        if args.scope == "user"
        else project_command_roots(args.project_root)
    )
    desired_skills = [skill["name"] for skill in selected_suite_skills(skills, args.suite)]
    desired_skill_set = set(desired_skills)
    cleanup_plan: list[dict[str, Any]] = []

    for item in plan:
        state_path = Path(item["destination"]) / INSTALL_STATE_FILE
        inspect_destination(anchor, state_path, "file", False)
        previous = load_managed_state(Path(item["destination"]))
        desired_commands = (
            list(desired_skills)
            if args.commands == "auto" and item["agent"] in COMMAND_AGENTS
            else []
        )
        desired_command_set = set(desired_commands)
        stale_skills: list[dict[str, Any]] = []
        stale_commands: list[dict[str, Any]] = []
        for name in previous["skills"]:
            if name not in desired_skill_set:
                destination = absolute_path(skill_roots[item["agent"]] / name)
                resolved = inspect_destination(
                    anchor, destination, "directory", args.apply
                )
                stale_skills.append(
                    {
                        "skill": name,
                        "destination": str(destination),
                        "resolved_destination": str(resolved),
                        "exists": destination.exists(),
                        "status": "planned",
                    }
                )
        if item["agent"] in COMMAND_AGENTS:
            for name in previous["commands"]:
                if name not in desired_command_set:
                    destination = absolute_path(
                        command_roots[item["agent"]] / f"{name}.md"
                    )
                    resolved = inspect_destination(
                        anchor, destination, "file", args.apply
                    )
                    stale_commands.append(
                        {
                            "command": name,
                            "destination": str(destination),
                            "resolved_destination": str(resolved),
                            "exists": destination.exists(),
                            "status": "planned",
                        }
                    )
        cleanup_plan.append(
            {
                "agent": item["agent"],
                "state": str(state_path),
                "state_exists": previous["exists"],
                "desired_skills": desired_skills,
                "desired_commands": desired_commands,
                "stale_skills": stale_skills,
                "stale_commands": stale_commands,
                "status": "planned",
            }
        )
    return cleanup_plan


def copy_skill(source: Path, destination: Path, force: bool) -> None:
    if destination == source:
        return
    if destination.exists() and not force:
        raise FileExistsError(
            f"Destination exists: {destination}. Use --force to replace it explicitly."
        )
    if destination.exists() and force:
        if not destination.is_dir():
            raise ValueError(f"Skill destination must be a directory: {destination}")
        shutil.rmtree(destination)
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(
        source,
        destination,
        ignore=shutil.ignore_patterns("__pycache__", "*.pyc", ".DS_Store"),
    )


def render_generated_skill(canonical: dict[str, str], skill: dict[str, str]) -> str:
    return f"""---
name: {skill['name']}
description: {json.dumps(skill['description'])}
---

# {skill['display_name']}

This is a generated, independently discoverable entry point in the Ontotect
skill suite. It carries the complete canonical workflow and fixes the user's
selected operation to `{skill['command']}`.

## Fixed command contract

{skill['instruction']}

Treat selection of this skill as an explicit Ontotect command, including when
no additional arguments were supplied. Preserve the user's named target,
constraints, requested output, and authorization boundary. Do not fall back to
`help` or `router`, and do not replace this command through intent inference;
compose a downstream mode only when the canonical command contract and the
user's request require it.

## Canonical Ontotect operating contract

{canonical['body']}"""


def render_openai_yaml(skill: dict[str, str]) -> str:
    if skill["dispatch"] != "fixed":
        raise ValueError(f"generated skill {skill['name']} must use fixed dispatch")
    prompt = (
        f"Use ${skill['name']} for the user's request. Execute the fixed "
        f"Ontotect command {skill['command']} and follow the installed skill instructions."
    )
    return (
        "interface:\n"
        f"  display_name: {json.dumps(skill['display_name'])}\n"
        f"  short_description: {json.dumps(skill['short_description'])}\n"
        f"  default_prompt: {json.dumps(prompt)}\n"
    )


def render_command_adapter(template: str, skill: dict[str, str]) -> str:
    return (
        template.replace("{{short_description}}", skill["short_description"])
        .replace("{{instruction}}", skill["instruction"])
        .replace("{{skill}}", skill["name"])
    )


def copy_suite(
    source: Path,
    item: dict[str, Any],
    force: bool,
    skills: dict[str, dict[str, str]],
    canonical: dict[str, str],
) -> None:
    for skill_item in item["skills"]:
        entry = skills[skill_item["skill"]]
        destination = Path(skill_item["destination"])
        copy_skill(source, destination, force)
        (destination / "scripts" / "install_skill.py").unlink(missing_ok=True)
        (destination / "SKILL.md").write_text(
            render_generated_skill(canonical, entry), encoding="utf-8"
        )
        (destination / "agents").mkdir(parents=True, exist_ok=True)
        (destination / "agents" / "openai.yaml").write_text(
            render_openai_yaml(entry), encoding="utf-8"
        )
        skill_item["status"] = "installed"


def copy_command_adapters(
    item: dict[str, Any],
    template: str,
    skills: dict[str, dict[str, str]],
) -> None:
    destination = Path(item["destination"])
    destination.mkdir(parents=True, exist_ok=True)
    for file_item in item["files"]:
        entry = skills[file_item["skill"]]
        Path(file_item["destination"]).write_text(
            render_command_adapter(template, entry), encoding="utf-8"
        )
        file_item["status"] = "installed"


def managed_state_payload(cleanup_item: dict[str, Any]) -> str:
    return json.dumps(
        {
            "skills": cleanup_item["desired_skills"],
            "commands": cleanup_item["desired_commands"],
        },
        indent=2,
    ) + "\n"


def sibling_work_path(destination: Path, label: str) -> Path:
    return destination.parent.parent / (
        f".{destination.parent.name}-{destination.name}.ontotect-"
        f"{label}-{os.getpid()}-{uuid.uuid4().hex}"
    )


def retry_filesystem_operation(operation: Any) -> None:
    delays = (0.025, 0.05, 0.1, 0.2, 0.4, 0.8, 1.2)
    for attempt in range(len(delays) + 1):
        try:
            operation()
            return
        except OSError as exc:
            if exc.errno not in {errno.EACCES, errno.EBUSY, errno.EPERM} or attempt >= len(
                delays
            ):
                raise
            time.sleep(delays[attempt])


def rename_managed(source: Path, destination: Path) -> None:
    retry_filesystem_operation(lambda: source.rename(destination))


def remove_path(path: Path, kind: str) -> None:
    if not path.exists():
        return

    def remove() -> None:
        if kind == "directory":
            shutil.rmtree(path)
        else:
            path.unlink()

    retry_filesystem_operation(remove)


def discard_work_paths(operations: list[dict[str, Any]]) -> None:
    for operation in operations:
        stage = operation.get("stage")
        if stage is not None and Path(stage).exists():
            remove_path(Path(stage), operation["kind"])


def commit_operations(operations: list[dict[str, Any]]) -> None:
    try:
        for operation in operations:
            destination = Path(operation["destination"])
            if operation["action"] == "replace":
                destination.parent.mkdir(parents=True, exist_ok=True)
            if destination.exists():
                backup = sibling_work_path(destination, "backup")
                rename_managed(destination, backup)
                operation["backup"] = backup
            if operation["action"] == "replace":
                rename_managed(Path(operation["stage"]), destination)
            operation["committed"] = True
    except OSError as exc:
        rollback_errors: list[str] = []
        for operation in reversed(operations):
            if not operation.get("committed") and not operation.get("backup"):
                continue
            destination = Path(operation["destination"])
            try:
                if (
                    operation.get("committed")
                    and operation["action"] == "replace"
                    and destination.exists()
                ):
                    remove_path(destination, operation["kind"])
                backup = operation.get("backup")
                if backup is not None and Path(backup).exists():
                    rename_managed(Path(backup), destination)
            except OSError as rollback_error:
                rollback_errors.append(f"{destination}: {rollback_error}")
        discard_work_paths(operations)
        suffix = (
            "; rollback errors: " + "; ".join(rollback_errors)
            if rollback_errors
            else ""
        )
        raise OSError(
            f"Failed to commit the Ontotect install transaction: {exc}{suffix}"
        ) from exc

    for operation in operations:
        backup = operation.get("backup")
        if backup is not None and Path(backup).exists():
            remove_path(Path(backup), operation["kind"])


def install_transaction(
    source: Path,
    args: argparse.Namespace,
    plan: list[dict[str, Any]],
    suite_plan: list[dict[str, Any]],
    command_plan: list[dict[str, Any]],
    cleanup_plan: list[dict[str, Any]],
    skills_by_name: dict[str, dict[str, str]],
    canonical: dict[str, str],
    template: str,
) -> None:
    cleanup_by_agent = {item["agent"]: item for item in cleanup_plan}
    operations: list[dict[str, Any]] = []
    try:
        for item in plan:
            destination = Path(item["destination"])
            stage = sibling_work_path(destination, "stage")
            stage.parent.mkdir(parents=True, exist_ok=True)
            operation = {
                "action": "replace",
                "kind": "directory",
                "destination": destination,
                "stage": stage,
                "record": item,
            }
            operations.append(operation)
            copy_skill(source, stage, force=False)
            (stage / INSTALL_STATE_FILE).write_text(
                managed_state_payload(cleanup_by_agent[item["agent"]]),
                encoding="utf-8",
            )

        for item in suite_plan:
            for skill_item in item["skills"]:
                entry = skills_by_name[skill_item["skill"]]
                destination = Path(skill_item["destination"])
                stage = sibling_work_path(destination, "stage")
                stage.parent.mkdir(parents=True, exist_ok=True)
                operation = {
                    "action": "replace",
                    "kind": "directory",
                    "destination": destination,
                    "stage": stage,
                    "record": skill_item,
                }
                operations.append(operation)
                copy_skill(source, stage, force=False)
                (stage / "scripts" / "install_skill.py").unlink(missing_ok=True)
                (stage / "SKILL.md").write_text(
                    render_generated_skill(canonical, entry), encoding="utf-8"
                )
                (stage / "agents").mkdir(parents=True, exist_ok=True)
                (stage / "agents" / "openai.yaml").write_text(
                    render_openai_yaml(entry), encoding="utf-8"
                )

        for item in command_plan:
            for file_item in item["files"]:
                entry = skills_by_name[file_item["skill"]]
                destination = Path(file_item["destination"])
                stage = sibling_work_path(destination, "stage")
                stage.parent.mkdir(parents=True, exist_ok=True)
                operation = {
                    "action": "replace",
                    "kind": "file",
                    "destination": destination,
                    "stage": stage,
                    "record": file_item,
                }
                operations.append(operation)
                stage.write_text(
                    render_command_adapter(template, entry), encoding="utf-8"
                )

        if args.force:
            for item in cleanup_plan:
                for stale in item["stale_skills"]:
                    operations.append(
                        {
                            "action": "delete",
                            "kind": "directory",
                            "destination": Path(stale["destination"]),
                            "stage": None,
                            "record": stale,
                        }
                    )
                for stale in item["stale_commands"]:
                    operations.append(
                        {
                            "action": "delete",
                            "kind": "file",
                            "destination": Path(stale["destination"]),
                            "stage": None,
                            "record": stale,
                        }
                    )
    except (OSError, shutil.Error, ValueError) as exc:
        discard_work_paths(operations)
        raise OSError(f"Failed to stage the Ontotect install transaction: {exc}") from exc

    commit_operations(operations)
    for operation in operations:
        operation["record"]["status"] = (
            "removed" if operation["action"] == "delete" else "installed"
        )
    for item in suite_plan:
        item["status"] = "installed"
    for item in command_plan:
        item["status"] = "installed"
    for item in cleanup_plan:
        item["status"] = "complete"


def preflight_conflicts(
    plan: list[dict[str, Any]],
    suite_plan: list[dict[str, Any]],
    command_plan: list[dict[str, Any]],
    force: bool,
) -> list[str]:
    if force:
        return []
    return [
        *[item["destination"] for item in plan if item["exists"]],
        *[
            skill["destination"]
            for item in suite_plan
            for skill in item["skills"]
            if skill["exists"]
        ],
        *[
            file["destination"]
            for item in command_plan
            for file in item["files"]
            if file["exists"]
        ],
    ]


def main() -> int:
    args = parse_args()
    if args.force and not args.apply:
        print("error: --force has no effect without --apply", file=sys.stderr)
        return 2

    source = Path(__file__).resolve().parent.parent
    try:
        validate_source(source)
        canonical = canonical_skill(source)
        suite_skills, template = load_suite(source)
        skills_by_name = {skill["name"]: skill for skill in suite_skills}
        plan = build_plan(source, args)
        suite_plan = build_suite_plan(source, args, suite_skills)
        command_plan = build_command_plan(source, args, suite_skills)
        cleanup_plan = build_cleanup_plan(args, suite_skills, plan)
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2

    conflicts = preflight_conflicts(plan, suite_plan, command_plan, args.force)
    if args.apply and conflicts:
        print(
            "error: destination exists; refusing implicit overwrite: "
            + ", ".join(conflicts)
            + ". Re-run with --force to overwrite Ontotect-owned files explicitly.",
            file=sys.stderr,
        )
        return 1

    if args.apply:
        try:
            install_transaction(
                source,
                args,
                plan,
                suite_plan,
                command_plan,
                cleanup_plan,
                skills_by_name,
                canonical,
                template,
            )
        except (OSError, shutil.Error, ValueError) as exc:
            print(f"error: {exc}", file=sys.stderr)
            return 1

    payload = {
        "dry_run": not args.apply,
        "scope": args.scope,
        "agents": selected_agents(args.agents),
        "suite": args.suite,
        "commands": args.commands,
        "targets": plan,
        "suite_targets": suite_plan,
        "command_targets": command_plan,
        "cleanup_targets": cleanup_plan,
    }
    if args.json:
        print(json.dumps(payload, indent=2))
    else:
        mode = "DRY RUN" if not args.apply else "INSTALL"
        print(f"{mode}: {SKILL_NAME} ({args.scope} scope, {args.suite} suite)")
        for item in plan:
            suffix = " (exists)" if item["exists"] else ""
            print(
                f"- {item['agent']} core: {item['destination']}{suffix} -> {item['status']}"
            )
        for item in suite_plan:
            suffix = (
                f" ({len(item['conflicts'])} existing skill(s))"
                if item["exists"]
                else ""
            )
            print(
                f"- {item['agent']} suite: {item['destination']} "
                f"({item['count']} generated entries){suffix} -> {item['status']}"
            )
        for item in command_plan:
            suffix = (
                f" ({len(item['conflicts'])} existing file(s))"
                if item["exists"]
                else ""
            )
            print(
                f"- {item['agent']} commands: {item['destination']} "
                f"({item['count']} adapters){suffix} -> {item['status']}"
            )
        stale_count = sum(
            len(item["stale_skills"]) + len(item["stale_commands"])
            for item in cleanup_plan
        )
        if stale_count:
            print(
                f"Managed cleanup: {stale_count} stale target(s) recorded; "
                "removal requires --force."
            )
        if not args.apply:
            print("Re-run with --apply after reviewing these targets.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
