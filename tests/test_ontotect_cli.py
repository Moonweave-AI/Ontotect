from __future__ import annotations

import contextlib
import importlib.util
import io
import json
import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "ontotect" / "scripts" / "ontotect.py"
SPEC = importlib.util.spec_from_file_location("ontotect_cli", MODULE_PATH)
assert SPEC and SPEC.loader
ontotect_cli = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = ontotect_cli
SPEC.loader.exec_module(ontotect_cli)


class OntotectCliTests(unittest.TestCase):
    def run_main(self, argv: list[str]) -> tuple[int, str]:
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            code = ontotect_cli.main(argv)
        return code, output.getvalue()

    def test_help_lists_canonical_router_and_alias(self) -> None:
        code, output = self.run_main(["help"])
        self.assertEqual(code, 0)
        self.assertIn("Commands: help, router, status", output)
        self.assertIn("Router alias: route", output)
        self.assertIn("performs no ontology engineering", output)

    def test_coordination_commands_do_not_invent_lifecycle_stage(self) -> None:
        help_route = ontotect_cli.infer_route("What is Ontotect and how do I use it?")
        status_route = ontotect_cli.infer_route("Show current status and progress.")
        self.assertEqual((help_route.command, help_route.entry_stage), ("help", "n/a"))
        self.assertEqual(
            (status_route.command, status_route.entry_stage),
            ("status", "unverified"),
        )

    def test_route_alias_is_canonicalized_by_card(self) -> None:
        code, output = self.run_main(["route", "create a new ontology", "--json"])
        self.assertEqual(code, 0)
        card = json.loads(output)
        self.assertEqual(card["command"], "build")
        self.assertEqual(card["entry_stage"], "charter")
        self.assertEqual(card["cli_execution"], "not started; this navigator only rendered a card")

    def test_explicit_command_overrides_keyword_inference(self) -> None:
        card = ontotect_cli.infer_route(
            "fix every failure and publish it",
            explicit_command="review",
        )
        self.assertEqual(card.pipeline, ("review",))
        self.assertTrue(card.mutation_boundary.startswith("read-only"))

    def test_explicit_status_wins_over_added_mutating_command(self) -> None:
        card = ontotect_cli.infer_route(
            "build the ontology",
            explicit_command="status",
            additional_commands=("build",),
        )
        self.assertEqual(card.pipeline, ("status",))
        self.assertTrue(card.mutation_boundary.startswith("read-only"))

    def test_english_multi_intent_pipeline(self) -> None:
        card = ontotect_cli.infer_route(
            "Review this ontology, fix the wrong entailment, then validate it with SHACL."
        )
        self.assertEqual(card.pipeline, ("review", "repair", "validate"))
        self.assertIn("project-scoped writes", card.mutation_boundary)

    def test_new_build_does_not_skip_to_downstream_validation_stage(self) -> None:
        card = ontotect_cli.infer_route("Build a new ontology and then validate it.")
        self.assertEqual(card.pipeline, ("build", "validate"))
        self.assertEqual(card.entry_stage, "charter")

    def test_chinese_multi_intent_pipeline(self) -> None:
        card = ontotect_cli.infer_route("请审核并修复这个本体，然后验证 SHACL。")
        self.assertEqual(card.pipeline, ("review", "repair", "validate"))

    def test_every_scenario_mode_is_routable_from_intent(self) -> None:
        cases = {
            "What is Ontotect and how do I use it?": "help",
            "Create a new ontology from these competency questions.": "build",
            "Audit this vocabulary and find defects without editing it.": "review",
            "Fix the failing CQ and wrong entailment.": "repair",
            "Optimize measured classification latency.": "optimize",
            "Refactor these modules while preserving semantics.": "refactor",
            "Validate SHACL conformance and OWL consistency.": "validate",
            "Define governance, ownership, and deprecation policy.": "govern",
            "Prepare the release, migration, and distribution set.": "release",
        }
        for request, expected in cases.items():
            with self.subTest(request=request):
                card = ontotect_cli.infer_route(request)
                self.assertEqual(card.command, expected)

    def test_ambiguous_target_defaults_safely(self) -> None:
        existing = ontotect_cli.infer_route("ontology/source.ttl")
        new_goal = ontotect_cli.infer_route("a maintenance knowledge model")
        self.assertEqual((existing.command, existing.entry_stage), ("review", "verify"))
        self.assertEqual((new_goal.command, new_goal.entry_stage), ("build", "charter"))

    def test_plan_only_overrides_mutating_pipeline(self) -> None:
        card = ontotect_cli.infer_route("build and release an ontology", plan_only=True)
        self.assertTrue(card.mutation_boundary.startswith("read-only"))

    def test_direct_stage_alias(self) -> None:
        code, output = self.run_main(["conceptualize", "./ontology", "--json"])
        self.assertEqual(code, 0)
        card = json.loads(output)
        self.assertEqual(card["command"], "stage")
        self.assertEqual(card["entry_stage"], "conceptualize")
        self.assertEqual(card["pipeline"], ["stage:conceptualize"])

    def test_stage_form_matches_alias(self) -> None:
        alias = ontotect_cli.stage_card("verify", "./ontology.ttl", False)
        code, output = self.run_main(["stage", "verify", "./ontology.ttl", "--json"])
        self.assertEqual(code, 0)
        explicit = json.loads(output)
        self.assertEqual(explicit["entry_stage"], alias.entry_stage)
        self.assertEqual(explicit["mutation_boundary"], alias.mutation_boundary)

    def test_release_card_separates_preparation_from_publication(self) -> None:
        code, output = self.run_main(["release", "./release", "--json"])
        self.assertEqual(code, 0)
        card = json.loads(output)
        self.assertIn("publication requires separate explicit authorization", card["mutation_boundary"])
        self.assertTrue(any("No parsing" in item for item in card["unverified"]))


if __name__ == "__main__":
    unittest.main()
