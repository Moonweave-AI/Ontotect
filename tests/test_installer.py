from __future__ import annotations

import argparse
import importlib.util
import sys
import tempfile
import unittest
from pathlib import Path


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


class InstallerTests(unittest.TestCase):
    def test_project_plan_contains_five_host_layouts(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            args = argparse.Namespace(
                agents=["all"],
                scope="project",
                project_root=Path(directory),
                force=False,
            )
            plan = installer.build_plan(SKILL_ROOT, args)
            destinations = {item["agent"]: Path(item["destination"]) for item in plan}
            self.assertEqual(set(destinations), set(installer.AGENTS))
            self.assertEqual(destinations["cursor"].parts[-3:], (".cursor", "skills", "ontotect"))
            self.assertEqual(destinations["codex"].parts[-3:], (".agents", "skills", "ontotect"))
            self.assertEqual(destinations["kilo"].parts[-3:], (".kilo", "skills", "ontotect"))
            self.assertEqual(destinations["opencode"].parts[-3:], (".opencode", "skills", "ontotect"))
            self.assertEqual(destinations["claude"].parts[-3:], (".claude", "skills", "ontotect"))

    def test_copy_is_byte_identical_and_refuses_implicit_overwrite(self) -> None:
        source = distributable_files(SKILL_ROOT)
        with tempfile.TemporaryDirectory() as directory:
            destination = Path(directory) / "skills" / "ontotect"
            installer.copy_skill(SKILL_ROOT, destination, force=False)
            self.assertEqual(distributable_files(destination), source)
            with self.assertRaises(FileExistsError):
                installer.copy_skill(SKILL_ROOT, destination, force=False)

    def test_codex_user_root_uses_portable_agents_directory(self) -> None:
        self.assertEqual(
            installer.user_roots()["codex"],
            Path.home() / ".agents" / "skills",
        )


if __name__ == "__main__":
    unittest.main()
