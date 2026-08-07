from __future__ import annotations

import argparse
import errno
import importlib.util
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[1]
SKILL_ROOT = ROOT / "ontotect"
MODULE_PATH = SKILL_ROOT / "scripts" / "install_skill.py"
SPEC = importlib.util.spec_from_file_location("ontotect_installer", MODULE_PATH)
assert SPEC and SPEC.loader
installer = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = installer
SPEC.loader.exec_module(installer)


def distributable_files(root: Path) -> dict[Path, bytes]:
    return {
        path.relative_to(root): path.read_bytes()
        for path in root.rglob("*")
        if path.is_file()
        and "__pycache__" not in path.parts
        and path.suffix != ".pyc"
        and path.name != ".DS_Store"
    }


def args_for(root: Path, **overrides: object) -> argparse.Namespace:
    values: dict[str, object] = {
        "agents": ["all"],
        "scope": "project",
        "project_root": root,
        "suite": "full",
        "commands": "auto",
        "force": False,
        "apply": False,
    }
    values.update(overrides)
    return argparse.Namespace(**values)


class InstallerTests(unittest.TestCase):
    def test_project_plan_contains_five_host_layouts(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            args = args_for(Path(directory))
            plan = installer.build_plan(SKILL_ROOT, args)
            destinations = {item["agent"]: Path(item["destination"]) for item in plan}
            self.assertEqual(set(destinations), set(installer.AGENTS))
            self.assertEqual(destinations["cursor"].parts[-3:], (".cursor", "skills", "ontotect"))
            self.assertEqual(destinations["codex"].parts[-3:], (".agents", "skills", "ontotect"))
            self.assertEqual(destinations["kilo"].parts[-3:], (".kilo", "skills", "ontotect"))
            self.assertEqual(destinations["opencode"].parts[-3:], (".opencode", "skills", "ontotect"))
            self.assertEqual(destinations["claude"].parts[-3:], (".claude", "skills", "ontotect"))

    def test_suite_manifest_has_twenty_unique_entries(self) -> None:
        skills, template = installer.load_suite(SKILL_ROOT)
        names = [skill["name"] for skill in skills]
        self.assertEqual(len(names), 20)
        self.assertEqual(len(set(names)), 20)
        self.assertIn("ontotect", names)
        self.assertIn("ontotect-help", names)
        self.assertIn("ontotect-router", names)
        self.assertIn("ontotect-review", names)
        self.assertIn("ontotect-stage-release", names)
        root = next(skill for skill in skills if skill["name"] == "ontotect")
        review = next(skill for skill in skills if skill["name"] == "ontotect-review")
        self.assertEqual(root["dispatch"], "conditional")
        self.assertEqual(review["dispatch"], "fixed")
        self.assertIn("{{skill}}", template)
        self.assertIn("$ARGUMENTS", template)

    def test_full_plan_generates_focused_skills_and_command_adapters(self) -> None:
        skills, _ = installer.load_suite(SKILL_ROOT)
        with tempfile.TemporaryDirectory() as directory:
            args = args_for(Path(directory))
            suite_plan = installer.build_suite_plan(SKILL_ROOT, args, skills)
            command_plan = installer.build_command_plan(SKILL_ROOT, args, skills)
            self.assertEqual(len(suite_plan), 5)
            self.assertTrue(all(item["count"] == 19 for item in suite_plan))
            self.assertEqual({item["agent"] for item in command_plan}, {"kilo", "opencode"})
            self.assertTrue(all(item["count"] == 20 for item in command_plan))
            kilo = next(item for item in command_plan if item["agent"] == "kilo")
            opencode = next(item for item in command_plan if item["agent"] == "opencode")
            self.assertEqual(Path(kilo["destination"]).parts[-2:], (".kilo", "commands"))
            self.assertEqual(Path(opencode["destination"]).parts[-2:], (".opencode", "commands"))

    def test_core_mode_omits_generated_suite_and_has_one_command(self) -> None:
        skills, _ = installer.load_suite(SKILL_ROOT)
        with tempfile.TemporaryDirectory() as directory:
            args = args_for(Path(directory), agents=["kilo"], suite="core")
            self.assertEqual(installer.build_suite_plan(SKILL_ROOT, args, skills), [])
            command_plan = installer.build_command_plan(SKILL_ROOT, args, skills)
            self.assertEqual(command_plan[0]["count"], 1)
            self.assertEqual(command_plan[0]["files"][0]["command"], "ontotect")

    def test_generated_skill_is_self_contained_and_has_distinct_metadata(self) -> None:
        skills, _ = installer.load_suite(SKILL_ROOT)
        skills_by_name = {skill["name"]: skill for skill in skills}
        canonical = installer.canonical_skill(SKILL_ROOT)
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            args = args_for(root, agents=["cursor"])
            suite_item = installer.build_suite_plan(SKILL_ROOT, args, skills)[0]
            review_item = next(
                item for item in suite_item["skills"] if item["skill"] == "ontotect-review"
            )
            suite_item["skills"] = [review_item]
            installer.copy_suite(
                SKILL_ROOT,
                suite_item,
                force=False,
                skills=skills_by_name,
                canonical=canonical,
            )
            destination = Path(review_item["destination"])
            expected = set(distributable_files(SKILL_ROOT)) - {
                Path("scripts") / "install_skill.py"
            }
            self.assertEqual(set(distributable_files(destination)), expected)
            self.assertFalse((destination / "scripts" / "install_skill.py").exists())
            skill_text = (destination / "SKILL.md").read_text(encoding="utf-8")
            self.assertIn("name: ontotect-review", skill_text)
            self.assertIn("selected operation to `review`", skill_text)
            self.assertIn("Do not fall back to\n`help` or `router`", skill_text)
            self.assertIn("## Canonical Ontotect operating contract", skill_text)
            metadata = (destination / "agents" / "openai.yaml").read_text(encoding="utf-8")
            self.assertIn("Ontotect Review", metadata)
            self.assertIn("$ontotect-review", metadata)

    def test_command_adapter_maps_to_the_focused_skill(self) -> None:
        skills, template = installer.load_suite(SKILL_ROOT)
        review = next(skill for skill in skills if skill["name"] == "ontotect-review")
        rendered = installer.render_command_adapter(template, review)
        self.assertIn("Load the installed `ontotect-review` skill", rendered)
        self.assertIn("$ARGUMENTS", rendered)
        self.assertIn(review["instruction"], rendered)

    def test_copy_is_byte_identical_and_refuses_implicit_overwrite(self) -> None:
        source = distributable_files(SKILL_ROOT)
        with tempfile.TemporaryDirectory() as directory:
            destination = Path(directory) / "skills" / "ontotect"
            installer.copy_skill(SKILL_ROOT, destination, force=False)
            self.assertEqual(distributable_files(destination), source)
            with self.assertRaises(FileExistsError):
                installer.copy_skill(SKILL_ROOT, destination, force=False)

    def test_preflight_includes_command_conflicts_and_prevents_partial_work(self) -> None:
        skills, _ = installer.load_suite(SKILL_ROOT)
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            args = args_for(root, agents=["cursor", "kilo"])
            protected = root / ".kilo" / "commands" / "ontotect-review.md"
            protected.parent.mkdir(parents=True)
            protected.write_text("protected", encoding="utf-8")
            plan = installer.build_plan(SKILL_ROOT, args)
            suite_plan = installer.build_suite_plan(SKILL_ROOT, args, skills)
            command_plan = installer.build_command_plan(SKILL_ROOT, args, skills)
            conflicts = installer.preflight_conflicts(
                plan, suite_plan, command_plan, force=False
            )
            self.assertIn(str(protected), conflicts)
            self.assertFalse((root / ".cursor" / "skills" / "ontotect").exists())

    def test_force_refresh_removes_managed_stale_entries_and_keeps_unknown(self) -> None:
        skills, template = installer.load_suite(SKILL_ROOT)
        skills_by_name = {skill["name"]: skill for skill in skills}
        canonical = installer.canonical_skill(SKILL_ROOT)
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            first_args = args_for(root, agents=["kilo"], apply=True)
            first_plan = installer.build_plan(SKILL_ROOT, first_args)
            first_suite = installer.build_suite_plan(SKILL_ROOT, first_args, skills)
            first_commands = installer.build_command_plan(SKILL_ROOT, first_args, skills)
            first_cleanup = installer.build_cleanup_plan(first_args, skills, first_plan)
            installer.install_transaction(
                SKILL_ROOT,
                first_args,
                first_plan,
                first_suite,
                first_commands,
                first_cleanup,
                skills_by_name,
                canonical,
                template,
            )

            skill_root = root / ".kilo" / "skills"
            command_root = root / ".kilo" / "commands"
            core = skill_root / "ontotect"
            state_path = core / installer.INSTALL_STATE_FILE
            (core / "stale-sentinel.txt").write_text("remove", encoding="utf-8")
            stale_name = "ontotect-old"
            unknown_name = "ontotect-custom"
            (skill_root / stale_name).mkdir()
            (skill_root / stale_name / "SKILL.md").write_text("stale", encoding="utf-8")
            (command_root / f"{stale_name}.md").write_text("stale", encoding="utf-8")
            (skill_root / unknown_name).mkdir()
            (skill_root / unknown_name / "SKILL.md").write_text("unknown", encoding="utf-8")
            state = json.loads(state_path.read_text(encoding="utf-8"))
            state["skills"].append(stale_name)
            state["commands"].append(stale_name)
            state_path.write_text(json.dumps(state), encoding="utf-8")

            refresh_args = args_for(
                root,
                agents=["kilo"],
                suite="core",
                commands="none",
                force=True,
                apply=True,
            )
            refresh_plan = installer.build_plan(SKILL_ROOT, refresh_args)
            refresh_suite = installer.build_suite_plan(SKILL_ROOT, refresh_args, skills)
            refresh_commands = installer.build_command_plan(SKILL_ROOT, refresh_args, skills)
            refresh_cleanup = installer.build_cleanup_plan(
                refresh_args, skills, refresh_plan
            )
            installer.install_transaction(
                SKILL_ROOT,
                refresh_args,
                refresh_plan,
                refresh_suite,
                refresh_commands,
                refresh_cleanup,
                skills_by_name,
                canonical,
                template,
            )
            self.assertFalse((core / "stale-sentinel.txt").exists())
            self.assertFalse((skill_root / "ontotect-review").exists())
            self.assertFalse((skill_root / stale_name).exists())
            self.assertFalse((command_root / "ontotect-review.md").exists())
            self.assertTrue((skill_root / unknown_name / "SKILL.md").is_file())
            self.assertEqual(
                json.loads(state_path.read_text(encoding="utf-8")),
                {"skills": ["ontotect"], "commands": []},
            )

    def test_commit_operations_rolls_back_replace_create_and_delete(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            skills = root / "skills"
            skills.mkdir()

            existing = skills / "existing"
            existing.mkdir()
            (existing / "value.txt").write_text("old-existing", encoding="utf-8")
            existing_stage = root / "existing.stage"
            existing_stage.mkdir()
            (existing_stage / "value.txt").write_text("new-existing", encoding="utf-8")

            created = skills / "created"
            created_stage = root / "created.stage"
            created_stage.mkdir()
            (created_stage / "value.txt").write_text("new-created", encoding="utf-8")

            stale = skills / "stale"
            stale.mkdir()
            (stale / "value.txt").write_text("old-stale", encoding="utf-8")

            failing = skills / "failing"
            failing.mkdir()
            (failing / "value.txt").write_text("old-failing", encoding="utf-8")
            failing_stage = root / "failing.stage"
            failing_stage.mkdir()
            (failing_stage / "value.txt").write_text("new-failing", encoding="utf-8")

            operations = [
                {
                    "action": "replace",
                    "kind": "directory",
                    "destination": existing,
                    "stage": existing_stage,
                },
                {
                    "action": "replace",
                    "kind": "directory",
                    "destination": created,
                    "stage": created_stage,
                },
                {"action": "delete", "kind": "directory", "destination": stale},
                {
                    "action": "replace",
                    "kind": "directory",
                    "destination": failing,
                    "stage": failing_stage,
                },
            ]
            original_rename = installer.rename_managed
            failure_injected = False

            def fail_after_backup(source: Path, destination: Path) -> None:
                nonlocal failure_injected
                if source == failing_stage and destination == failing and not failure_injected:
                    failure_injected = True
                    raise OSError(errno.EBUSY, "injected busy destination")
                original_rename(source, destination)

            with patch.object(installer, "rename_managed", fail_after_backup):
                with self.assertRaisesRegex(OSError, "Failed to commit"):
                    installer.commit_operations(operations)

            self.assertEqual(
                (existing / "value.txt").read_text(encoding="utf-8"), "old-existing"
            )
            self.assertFalse(created.exists())
            self.assertEqual(
                (stale / "value.txt").read_text(encoding="utf-8"), "old-stale"
            )
            self.assertEqual(
                (failing / "value.txt").read_text(encoding="utf-8"), "old-failing"
            )
            self.assertFalse(existing_stage.exists())
            self.assertFalse(created_stage.exists())
            self.assertFalse(failing_stage.exists())
            self.assertEqual(
                [path for path in root.iterdir() if ".ontotect-" in path.name], []
            )

    def test_retry_filesystem_operation_only_retries_transient_errors(self) -> None:
        calls = 0

        def eventually_succeeds() -> None:
            nonlocal calls
            calls += 1
            if calls < 3:
                raise OSError(errno.EBUSY, "transient")

        with patch.object(installer.time, "sleep") as sleep:
            installer.retry_filesystem_operation(eventually_succeeds)
        self.assertEqual(calls, 3)
        self.assertEqual([call.args[0] for call in sleep.call_args_list], [0.025, 0.05])

        calls = 0

        def non_transient_failure() -> None:
            nonlocal calls
            calls += 1
            raise OSError(errno.ENOENT, "not retryable")

        with patch.object(installer.time, "sleep") as sleep:
            with self.assertRaises(OSError):
                installer.retry_filesystem_operation(non_transient_failure)
        self.assertEqual(calls, 1)
        sleep.assert_not_called()

    def test_wrong_target_type_is_rejected_before_any_write(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            target = root / ".agents" / "skills" / "ontotect"
            target.parent.mkdir(parents=True)
            target.write_text("not a directory", encoding="utf-8")
            args = args_for(
                root,
                agents=["cursor", "codex"],
                force=True,
                apply=True,
            )
            with self.assertRaisesRegex(ValueError, "must be a directory"):
                installer.build_plan(SKILL_ROOT, args)
            self.assertFalse((root / ".cursor" / "skills" / "ontotect").exists())
            self.assertEqual(target.read_text(encoding="utf-8"), "not a directory")

    def test_codex_user_root_uses_portable_agents_directory(self) -> None:
        self.assertEqual(
            installer.user_roots()["codex"],
            Path.home() / ".agents" / "skills",
        )


if __name__ == "__main__":
    unittest.main()
