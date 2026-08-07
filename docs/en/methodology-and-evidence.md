---
type: explanation
status: draft
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 180
summary: Ontotect's ontology-engineering foundations, research corpus, authority hierarchy, synthesis method, and bibliography.
canonical: docs/en/methodology-and-evidence.md
related:
  - ontotect/references/sources.md
  - ontotect/references/requirements-and-scope.md
  - ontotect/references/conceptual-modeling.md
supersedes: null
superseded_by: null
---

# Methodology and evidence

[简体中文](../zh-CN/methodology-and-evidence.md) · [Documentation home](index.md)

Ontotect is a synthesis of ontology-engineering methods, formal standards, tool practices, and operational governance. It does not turn a source statement directly into an axiom. Evidence must be interpreted against domain authority, intended use, scope, examples, counterexamples, and an accountable decision.

## Research foundation

The construction corpus covered 29 local PDFs: five books, seventeen method or application papers, and seven tool documents. The evidence register records 2,045 pages and 791,157 extracted words. Local material contributed lifecycle methods, competency questions, conceptual analysis, formal semantics, patterns, modules, mappings, evaluation, agile/continuous practice, repair, evolution, and tooling.

Online research extended the corpus with normative standards, original method publications, official tool documentation, institutional resources, and primary research. The research cut-off and exact evidence map are maintained in [sources.md](../../ontotect/references/sources.md).

“Complete” means every locally listed document was processed according to the recorded method. It does not mean the open Web has a finite, exhaustively enumerable ontology-engineering literature. Web research is described as authoritative-source coverage to topic saturation, with gaps and changing drafts made visible.

## Authority hierarchy

Prefer evidence in this order while honoring project requirements and law:

1. normative standards and authoritative domain definitions;
2. original method papers and official project documentation;
3. peer-reviewed comparisons, experiments, and surveys;
4. books that synthesize the field;
5. tool blogs and community experience.

Classify a claim as normative, experimental, case evidence, proposal/prototype, or synthesis. Record conflicts and approval instead of averaging incompatible meanings.

## Engineering synthesis

The resulting workflow combines:

- requirements and competency-question discipline;
- reuse assessment before term creation;
- conceptual analysis of category, identity, rigidity, dependence, relation, part-whole, and time;
- explicit separation of RDF/RDFS, OWL, SKOS, SHACL, and SPARQL responsibilities;
- vertical slices with positive, negative, entailment, non-entailment, and query fixtures;
- ten independent verification layers;
- baseline-driven review, root-cause repair, semantic-preserving refactor, and measured optimization;
- identifier, provenance, mapping, deprecation, migration, release, and maintenance governance.

No single source is treated as universally sufficient. Ontotect makes commitments traceable and requires project/domain authority to approve domain meaning.

## Construction references

The construction process used open Agent Skills conventions, Skill Creator guidance, and [book-to-skill](https://github.com/virgiliojr94/book-to-skill) alongside the ontology-engineering literature, standards, and tools described above. Complete standard-form citations and source attribution are maintained in [References and source attribution](references-and-acknowledgments.md); the detailed claim-to-source ledger remains [sources.md](../../ontotect/references/sources.md).

## Copyright and redistribution boundary

Ontotect distributes original synthesis, templates, examples, and citations—not the private books, papers, vendor PDFs, or extracted full text used during construction. Public citations should point to authors, publishers, standards bodies, official projects, or institutional copies. A citation does not grant redistribution permission for an imported ontology, module, figure, or dataset.

Ontotect's original repository content is released under the [MIT License](../../LICENSE). That license does not relicense third-party source material or the excluded private research corpus.
