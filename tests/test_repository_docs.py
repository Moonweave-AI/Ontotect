from __future__ import annotations

import json
import re
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import unquote


ROOT = Path(__file__).resolve().parents[1]
SKILL_ROOT = ROOT / "ontotect"
DOCS_ROOT = ROOT / "docs"

MARKDOWN_LINK = re.compile(r"(?<!!)\[[^\]]+\]\(([^)]+)\)")
REMOTE_SCHEMES = ("http://", "https://", "mailto:", "tel:")


def frontmatter_keys(path: Path) -> set[str]:
    lines = path.read_text(encoding="utf-8").splitlines()
    if not lines or lines[0].strip() != "---":
        return set()

    keys: set[str] = set()
    for line in lines[1:]:
        if line.strip() == "---":
            return keys
        match = re.match(r"^([A-Za-z_][A-Za-z0-9_-]*):", line)
        if match:
            keys.add(match.group(1))
    return set()


class RepositoryDocumentationTests(unittest.TestCase):
    COMMANDS = {
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
    }
    STAGES = {
        "charter",
        "reuse",
        "conceptualize",
        "formalize",
        "implement",
        "verify",
        "release",
    }

    def test_bilingual_entry_points_exist(self) -> None:
        self.assertTrue((ROOT / "README.md").is_file())
        self.assertTrue((ROOT / "README.zh-CN.md").is_file())
        self.assertTrue((ROOT / "CONTRIBUTING.md").is_file())
        self.assertTrue((ROOT / "CONTRIBUTING.zh-CN.md").is_file())
        self.assertTrue((ROOT / "SECURITY.md").is_file())
        self.assertTrue((ROOT / "SECURITY.zh-CN.md").is_file())

    def test_language_trees_are_mirrored(self) -> None:
        english = {
            path.relative_to(DOCS_ROOT / "en")
            for path in (DOCS_ROOT / "en").rglob("*.md")
        }
        chinese = {
            path.relative_to(DOCS_ROOT / "zh-CN")
            for path in (DOCS_ROOT / "zh-CN").rglob("*.md")
        }
        self.assertTrue(english, "docs/en must contain Markdown documents")
        self.assertEqual(english, chinese)

    def test_docs_have_governance_frontmatter(self) -> None:
        required = {
            "type",
            "status",
            "owner",
            "created",
            "updated",
            "last_reviewed",
            "review_cycle_days",
            "summary",
            "canonical",
            "related",
            "supersedes",
            "superseded_by",
        }
        docs = sorted(DOCS_ROOT.rglob("*.md"))
        self.assertTrue(docs, "docs/ must contain Markdown documents")
        for path in docs:
            with self.subTest(path=path.relative_to(ROOT)):
                self.assertEqual(required - frontmatter_keys(path), set())

    def test_internal_markdown_links_resolve(self) -> None:
        markdown_files = [
            ROOT / "README.md",
            ROOT / "README.zh-CN.md",
            ROOT / "CONTRIBUTING.md",
            ROOT / "CONTRIBUTING.zh-CN.md",
            ROOT / "SECURITY.md",
            ROOT / "SECURITY.zh-CN.md",
            *sorted(DOCS_ROOT.rglob("*.md")),
            *sorted(SKILL_ROOT.rglob("*.md")),
        ]
        for source in markdown_files:
            self.assertTrue(source.is_file(), source)
            body = source.read_text(encoding="utf-8")
            for raw_target in MARKDOWN_LINK.findall(body):
                target = raw_target.strip()
                if not target or target.startswith(("#", *REMOTE_SCHEMES)):
                    continue
                if " " in target and not target.startswith("<"):
                    target = target.split(maxsplit=1)[0]
                target = target.strip("<>").split("#", 1)[0].split("?", 1)[0]
                if not target:
                    continue
                resolved = (source.parent / unquote(target)).resolve()
                with self.subTest(source=source.relative_to(ROOT), target=raw_target):
                    self.assertTrue(resolved.exists(), resolved)

    def test_gitignore_protects_local_corpora_and_generated_state(self) -> None:
        content = (ROOT / ".gitignore").read_text(encoding="utf-8")
        required_patterns = {
            "/book/",
            "/paper/",
            "/tools/",
            "/book-to-skill/",
            "/tmp/",
            "/.runtime/",
            "**/__pycache__/",
            "*.py[cod]",
            ".env",
            ".env.*",
            "!.env.example",
            "/node_modules/",
            "/.npm/",
            "/.npx/",
            "npm-debug.log*",
            "*.tgz",
        }
        actual = {
            line.strip()
            for line in content.splitlines()
            if line.strip() and not line.lstrip().startswith("#")
        }
        self.assertEqual(required_patterns - actual, set())
        self.assertFalse({"*.ttl", "*.rq", "*.json", "*.md"} & actual)

    def test_npm_package_is_explicit_and_dependency_free(self) -> None:
        package = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))
        self.assertEqual(package["name"], "@moonweave-ai/ontotect")
        self.assertEqual(package["license"], "MIT")
        self.assertEqual(
            package["repository"]["url"],
            "git+https://github.com/Moonweave-AI/Ontotect.git",
        )
        self.assertTrue((ROOT / "LICENSE").is_file())
        self.assertIn("MIT License", (ROOT / "LICENSE").read_text(encoding="utf-8"))
        self.assertEqual(package["type"], "module")
        self.assertEqual(
            package["publishConfig"],
            {"access": "public", "registry": "https://registry.npmjs.org/"},
        )
        self.assertEqual(package["bin"], {"ontotect": "bin/ontotect.js"})
        self.assertTrue((ROOT / package["bin"]["ontotect"]).is_file())

        for dependency_field in (
            "dependencies",
            "devDependencies",
            "optionalDependencies",
            "peerDependencies",
            "bundledDependencies",
        ):
            self.assertNotIn(dependency_field, package)
        for lifecycle_script in (
            "preinstall",
            "install",
            "postinstall",
            "prepare",
            "prepublish",
            "prepublishOnly",
        ):
            self.assertNotIn(lifecycle_script, package.get("scripts", {}))

        files = set(package["files"])
        self.assertIn("LICENSE", files)
        self.assertIn("ontotect/SKILL.md", files)
        self.assertIn("README.zh-CN.md", files)
        self.assertIn("docs/assets/ontotect-banner.svg", files)
        self.assertIn("docs/assets/ontotect-mark.svg", files)
        self.assertIn("ontotect/scripts/*.py", files)
        self.assertNotIn("ontotect/scripts/", files)

        public_install_docs = (
            (ROOT / "README.md").read_text(encoding="utf-8"),
            (ROOT / "README.zh-CN.md").read_text(encoding="utf-8"),
            (ROOT / "docs" / "en" / "npm-and-npx-installation.md").read_text(
                encoding="utf-8"
            ),
            (ROOT / "docs" / "zh-CN" / "npm-and-npx-installation.md").read_text(
                encoding="utf-8"
            ),
        )
        for body in public_install_docs:
            self.assertIn("@moonweave-ai/ontotect", body)
            self.assertNotIn("npx ontotect ", body)
            self.assertNotIn("npm install --global ontotect", body)
        self.assertFalse(
            {"book/", "paper/", "tools/", "book-to-skill/", "tmp/", "tests/"}
            & files
        )

    def test_banner_is_accessible_svg(self) -> None:
        banner = ROOT / "docs" / "assets" / "ontotect-banner.svg"
        root = ET.parse(banner).getroot()
        namespace = {"svg": "http://www.w3.org/2000/svg"}
        self.assertEqual(root.tag, "{http://www.w3.org/2000/svg}svg")
        self.assertEqual(root.attrib.get("role"), "img")
        self.assertEqual(root.attrib.get("viewBox"), "0 0 1400 480")
        self.assertIsNotNone(root.find("svg:title", namespace))
        self.assertIsNotNone(root.find("svg:desc", namespace))
        text = banner.read_text(encoding="utf-8")
        self.assertNotIn("<script", text.lower())
        self.assertNotIn("@import", text.lower())

        mark = ROOT / "docs" / "assets" / "ontotect-mark.svg"
        mark_root = ET.parse(mark).getroot()
        self.assertEqual(mark_root.tag, "{http://www.w3.org/2000/svg}svg")
        self.assertEqual(mark_root.attrib.get("role"), "img")
        self.assertEqual(mark_root.attrib.get("viewBox"), "0 0 128 128")
        self.assertIsNotNone(mark_root.find("svg:title", namespace))
        self.assertIsNotNone(mark_root.find("svg:desc", namespace))
        mark_text = mark.read_text(encoding="utf-8")
        self.assertNotIn("<script", mark_text.lower())
        self.assertNotIn("@import", mark_text.lower())

    def test_readmes_have_accessible_visuals_and_source_attribution(self) -> None:
        forbidden = (
            "knowledge-compilation and progressive-disclosure approach was informed",
            "progressive-disclosure documentation approach was informed",
            "does not copy that project's performance claims",
            "no upstream endorsement or benchmark transfer is implied",
            "the acknowledgment does not imply endorsement or affiliation",
            "relationship to book-to-skill",
            "渐进式披露文档方法受到",
        )
        for path in (ROOT / "README.md", ROOT / "README.zh-CN.md"):
            body = path.read_text(encoding="utf-8")
            lowered = body.lower()
            with self.subTest(path=path.name):
                self.assertIn('<div align="center">', body)
                self.assertIn("<h1>Ontotect</h1>", body)
                self.assertIn("docs/assets/ontotect-mark.svg", body)
                self.assertIn("docs/assets/ontotect-banner.svg", body)
                self.assertIn(
                    "https://www.npmjs.com/package/@moonweave-ai/ontotect", body
                )
                self.assertIn('id="install-in-60-seconds"', body)
                self.assertGreaterEqual(body.count("```mermaid"), 2)
                self.assertIn("virgiliojr94/book-to-skill", body)
                self.assertFalse(any(fragment in lowered for fragment in forbidden))
                self.assertNotIn("public npm publication remains pending", lowered)
                self.assertNotIn("after public npm publication", lowered)
                self.assertNotIn("thank you", lowered)
                self.assertNotIn("感谢用户", body)

    def test_command_surface_is_consistent(self) -> None:
        expected_refs = {
            "command-contract.md",
            "command-router.md",
            "command-help.md",
            "command-status.md",
            "command-build.md",
            "command-review.md",
            "command-repair.md",
            "command-optimize.md",
            "command-refactor.md",
            "command-validate.md",
            "command-govern.md",
            "command-release.md",
            "command-stages.md",
        }
        actual_refs = {
            path.name for path in (SKILL_ROOT / "references").glob("command-*.md")
        }
        self.assertEqual(actual_refs, expected_refs)

        projections = [
            SKILL_ROOT / "SKILL.md",
            ROOT / "README.md",
            ROOT / "README.zh-CN.md",
            DOCS_ROOT / "en" / "command-reference.md",
            DOCS_ROOT / "zh-CN" / "command-reference.md",
        ]
        for path in projections:
            body = path.read_text(encoding="utf-8")
            with self.subTest(path=path.relative_to(ROOT), vocabulary="commands"):
                self.assertEqual(
                    {command for command in self.COMMANDS if f"`{command}`" not in body},
                    set(),
                )
            with self.subTest(path=path.relative_to(ROOT), vocabulary="stages"):
                self.assertEqual(
                    {stage for stage in self.STAGES if f"`{stage}`" not in body},
                    set(),
                )

    def test_check_results_and_gate_dispositions_are_distinct(self) -> None:
        contract = (SKILL_ROOT / "references" / "command-contract.md").read_text(
            encoding="utf-8"
        )
        for token in ("`fail`", "`error`", "`not-applicable`", "`accepted-exception`"):
            self.assertIn(token, contract)
        for token in ("`pass-with-actions`", "`revise`", "`blocked`"):
            self.assertIn(token, contract)
        precedence = [
            contract.index("1. `revise`"),
            contract.index("2. otherwise `blocked`"),
            contract.index("3. otherwise `unverified`"),
            contract.index("4. otherwise `pass-with-actions`"),
            contract.index("5. otherwise `pass`"),
        ]
        self.assertEqual(precedence, sorted(precedence))

        manifest = json.loads(
            (SKILL_ROOT / "assets" / "evidence-manifest.json").read_text(
                encoding="utf-8"
            )
        )
        check = manifest["checks"][0]
        self.assertEqual(check["status"], "unverified")
        self.assertEqual(check["exception"]["disposition"], "none")

    def test_public_text_has_no_common_encoding_damage_or_name_typo(self) -> None:
        public_files = [
            ROOT / "README.md",
            ROOT / "README.zh-CN.md",
            ROOT / "CONTRIBUTING.md",
            ROOT / "CONTRIBUTING.zh-CN.md",
            ROOT / "SECURITY.md",
            ROOT / "SECURITY.zh-CN.md",
            *sorted(DOCS_ROOT.rglob("*.md")),
            *sorted(SKILL_ROOT.rglob("*.md")),
        ]
        bad_fragments = ("\ufffd", "Prot茅", "Ontotext")
        for path in public_files:
            body = path.read_text(encoding="utf-8")
            with self.subTest(path=path.relative_to(ROOT)):
                self.assertFalse(any(fragment in body for fragment in bad_fragments))

    def test_distributable_skill_contains_no_raw_research_documents(self) -> None:
        excluded_extensions = {
            ".pdf",
            ".epub",
            ".mobi",
            ".azw",
            ".azw3",
            ".doc",
            ".docx",
            ".rtf",
        }
        offenders = [
            path.relative_to(SKILL_ROOT)
            for path in SKILL_ROOT.rglob("*")
            if path.is_file() and path.suffix.lower() in excluded_extensions
        ]
        self.assertEqual(offenders, [])


if __name__ == "__main__":
    unittest.main()
