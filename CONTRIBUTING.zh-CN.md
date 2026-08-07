---
type: policy
status: draft
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 180
summary: Ontotect 代码、技能行为、文档、证据和翻译的贡献规则。
canonical: CONTRIBUTING.md
related:
  - README.zh-CN.md
  - SECURITY.zh-CN.md
  - ontotect/SKILL.md
supersedes: null
superseded_by: null
---

# 为 Ontotect 贡献

[English](CONTRIBUTING.md) · 本文是英文 canonical 文档的简体中文镜像。

Ontotect 的贡献可能改变 Agent 的可执行行为、本体工程指引、模板、脚本、测试或公开文档。每项变更都应当可审查、可追溯，并与其语义影响相称。

## 提交变更前

1. 检索已有 Issue，并说明用户或本体工程问题。
2. 指明受影响的模式、生命周期阶段、命令、参考、资产或脚本。
3. 将观察证据、假设和设计决定分开陈述。
4. 行为变更应说明预期输出、权限边界和回归证据。
5. 公共术语或工作流变更应说明兼容性和迁移后果。

小型文档修正可直接提交 Pull Request。便携命令协议、路由优先级、证据模型或宿主支持发生变化时，应先在 Issue 或 ADR 中记录决定和备选方案。

## 来源与版权政策

不得提交书籍、论文、厂商手册、提取全文、受版权保护页面的截图或本地研究目录。仓库尤其不得包含 `book/`、`paper/`、`tools/`、`tmp/`、`.runtime/` 或本地 `book-to-skill/` 工作副本。

证据应优先采用标准、原始论文、机构仓储和官方项目文档。引用公开来源并用自己的语言综合。复制代码、本体模块、词表、图片或数据集前，确认其允许再分发并保留必要声明。

Ontotect 采用 [MIT 许可证](LICENSE)。提交贡献即表示你确认有权按该许可证提供相关工作。第三方材料继续适用其自身条款；只有在再分发兼容且已正确署名时才能加入。

## 文档与翻译

英文文档是 canonical。`docs/zh-CN/` 与 `docs/en/` 使用同名镜像；中文政策文件指向其英文 canonical。一次变更中应同步更新两种语言。若确实不能同步，必须显著标记翻译已滞后并创建有 Owner 的后续 Issue。

每篇文档只承担一种主要用途：教程、操作指南、参考、解释、政策或决策记录。保留治理 frontmatter；只有在其语义成立时才更新 `updated` 和 `last_reviewed`。内部链接使用相对路径，并应在 fork 中工作。

## 命令与技能变更

便携 Agent 命令协议不等于 Python navigator CLI。修改任一接口时：

- 更新其 canonical 实现或命令规范；
- 路由或行为变化时同步更新 `ontotect/SKILL.md`；
- 更新中英文命令参考；
- 增加或更新真实场景或测试；
- 说明操作是只读还是可能修改项目制品；
- 不得把解析、RDF 图审计或 SHACL 运行夸大成未经支持的 OWL 一致性结论。

默认不要增加哈希、依赖固化、重复版本探测或完整性仪式。只有具体验收契约或风险确实需要时才加入，并记录理由。

## 验证

执行与变更相称的检查，只报告真实取得的结果。常用入口包括：

```text
python ontotect/scripts/ontology_audit.py --help
python ontotect/scripts/ontology_diff.py --help
python ontotect/scripts/install_skill.py --help
```

文档变更应检查 Markdown 结构、相对链接、中英文文件名一致、命令名一致，以及研究材料没有被 Git 跟踪。本体示例应解析全部 RDF，运行所声明的 SPARQL 和 SHACL 检查，并把无法执行的推理标记为 `unverified`。

## Pull Request 检查表

- 问题、范围和非目标清楚。
- 行为变化和语义影响得到说明。
- 证据无需私有语料即可复现。
- 公开来源归属和再分发权清楚。
- 中英文公开文档保持同步。
- 不包含秘密、敏感图、原始研究文档或提取输出。
- 测试和审查如实报告；缺失检查标为 `unverified`。
- Owner 或指定审查者能够作出所需领域或发布决定。

安全问题应遵循 [SECURITY.zh-CN.md](SECURITY.zh-CN.md)，不要使用公开 Issue 流程披露细节。
