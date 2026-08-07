---
type: explanation
status: draft
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 180
summary: Ontotect 的本体工程基础、研究语料、权威层级、综合方法及参考书目。
canonical: docs/en/methodology-and-evidence.md
related:
  - ontotect/references/sources.md
  - ontotect/references/requirements-and-scope.md
  - ontotect/references/conceptual-modeling.md
supersedes: null
superseded_by: null
---

# 方法论与证据

[English](../en/methodology-and-evidence.md) · [文档首页](index.md) · 本页是英文 canonical 的简体中文镜像。

Ontotect 综合了本体工程方法、形式标准、工具实践和运行治理。它不会把某个来源的陈述直接变成公理；证据必须结合领域权威、预期用途、范围、示例、反例和有责任人的决定解释。

## 研究基础

构建语料覆盖 29 份本地 PDF：5 本书、17 篇方法或应用论文、7 份工具文档。证据登记为 2,045 页、791,157 个提取词。本地资料贡献了生命周期方法、能力问题、概念分析、形式语义、模式、模块、映射、评估、敏捷/持续实践、修复、演化和工具知识。

互联网研究通过规范标准、原始方法论文、官方工具文档、机构资料和一手研究继续扩展。研究截止日期和证据地图见 [sources.md](../../ontotect/references/sources.md)。

“完整”是指按照记录的方法处理所有本地列出的资料，不是声称开放互联网存在一个可穷举的全部本体工程文献集合。Web 研究应描述为针对权威来源达到主题饱和，并公开缺口和变化中的草案。

## 权威层级

在满足项目需求和法律的前提下优先：

1. 规范标准及权威领域定义；
2. 原始方法论文和官方项目文档；
3. 同行评审的比较、实验和综述；
4. 综合领域知识的书籍；
5. 工具博客和社区经验。

把主张分类为 normative、experimental、case evidence、proposal/prototype 或 synthesis。记录冲突与批准，不平均混合不兼容含义。

## 工程综合

工作流结合：需求和 CQ；术语创建前的复用评估；类别、同一性、刚性、依赖、关系、部分整体和时间分析；RDF/RDFS、OWL、SKOS、SHACL、SPARQL 职责分离；带正负、蕴含、非蕴含和查询夹具的垂直切片；十层独立验证；基线驱动的审核、根因修复、语义保持重构和可测优化；标识符、来源、映射、弃用、迁移、发布和维护治理。

没有任何单一来源被视为普遍充分。Ontotect 让承诺可追溯，并要求项目/领域权威批准领域含义。

## 构建参考

构建过程在上述本体工程文献、标准和工具之外，还使用了开放 Agent Skills 约定、Skill Creator 指南及 [book-to-skill](https://github.com/virgiliojr94/book-to-skill)。完整标准格式引用与致谢见[参考文献与致谢](references-and-acknowledgments.md)，逐项主张—来源登记仍以 [sources.md](../../ontotect/references/sources.md) 为准。

## 版权与再分发边界

Ontotect 分发原创综合、模板、示例和引用，不分发构建时使用的私有书籍、论文、厂商 PDF 或提取全文。公开引用应指向作者、出版社、标准组织、官方项目或机构副本。引用不代表获得再分发本体、模块、图片或数据集的许可。

Ontotect 的原创仓库内容采用 [MIT 许可证](../../LICENSE)。该许可证不会重新许可第三方来源或被排除的私有研究语料。
