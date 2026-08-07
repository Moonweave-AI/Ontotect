---
type: explanation
status: draft
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 180
summary: Ontotect 如何把本体工程请求路由为模式、生命周期阶段、证据门和有序后续工作。
canonical: docs/en/routing-and-workflow.md
related:
  - ontotect/references/workflow.md
  - ontotect/references/command-router.md
  - ontotect/assets/route-card.md
supersedes: null
superseded_by: null
---

# 路由与工作流

[English](../en/routing-and-workflow.md) · [文档首页](index.md) · 本页是英文 canonical 的简体中文镜像。

本体工作很少以干净的生命周期步骤出现。“修好本体”可能隐藏错误需求、类别错误、过强 OWL 公理、错误 SHACL target、import 变化或发布政策缺陷。Ontotect 按目标结果和证据路由，而不是只匹配关键词。

## Router 决策模型

canonical 命令是 `router`，`route` 是别名。Router 检查目标、现有制品、已知失败、期望结果、权限边界和生命周期状态，然后选择一个主模式和入口阶段。

协调命令例外：`help` 没有生命周期阶段；`status` 报告从证据重建的阶段，无法
确定时使用 `unverified`。

| 请求证据 | 主模式 | 常用入口 |
|---|---|---|
| 新本体或获准扩展 | `build` | `charter` 或最早未完成阶段 |
| “评估/审核/找缺陷”且不编辑 | `review` | 冻结目标，然后 `verify` 并向前追因 |
| 可复现的错误推断、查询、shape 或构建 | `repair` | 复现失败，再进入最早成因阶段 |
| 已测量延迟、内存、规模或审查负担 | `optimize` | 基线和受保护不变量 |
| 预期语义保持的结构改善 | `refactor` | 转换前建立保持契约 |
| 执行指定检查或判断合规 | `validate` | 适用验证层 |
| Owner、IRI、变更、弃用、维护 | `govern` | 权限与政策 |
| 发布就绪、迁移、批准、发布集 | `release` | 集成验证与发布门 |

信息不足时，使用显式假设路由，只询问会实质改变路径的问题。不得把路由不确定性当作编辑授权。

## 生命周期阶段

Ontotect 使用产生证据的循环：

1. **Charter**：目的、利益相关者、范围、CQ、角色、约束和验收方法。
2. **Reuse**：获取证据，决定直接复用、import、module、specialization、mapping 或新建术语。
3. **Conceptualize**：分析类别、同一性、分类、关系、时间、依赖、示例和反例。
4. **Formalize**：选择 SKOS/RDFS/OWL/SHACL/SPARQL 职责、profile、IRI、imports、modules、公理和运行假设。
5. **Implement**：以术语、注释、公理、shapes、queries 和正负夹具实现小型垂直切片。
6. **Verify**：执行独立语法、逻辑、CQ、SHACL、审查、领域、文档和运行证据。
7. **Release**：分类语义变更、准备迁移、批准发布集、发布并安排维护。

证据可能让工作返回更早阶段。这是受控迭代，不是流程失败。

## 阶段门处置

- `pass`：所需证据成功；
- `pass-with-actions`：无阻塞缺陷，但仍有归属明确的后续；
- `revise`：证据显示制品不符合契约；
- `blocked`：缺少所需权限、来源、许可、依赖或安全条件；
- `unverified`：检查未执行或结果不能支撑结论。

不得因“看起来合理”把 `unverified` 改为 `pass`。工具失败也不自动等于本体失败，应先解释环境、输入、import closure、profile 和 entailment regime。

以上是生命周期阶段门处置。单项检查使用 `pass`、`fail`、`error`、
`unverified` 或有理由的 `not-applicable`；`accepted-exception` 作为独立覆盖层
记录。阶段门优先级为：未获例外的必要检查失败 -> `revise`；否则已知缺失前置项
-> `blocked`；否则缺少或无法解释必要证据 -> `unverified`；否则只剩有效例外或
有 Owner 的非阻塞工作 -> `pass-with-actions`；否则 `pass`。

## 多模式请求

每次选择一个主模式并公布链路：

```text
review -> repair/refactor/optimize -> validate -> govern/release
```

例如“审核并修复”先建立只读基线和发现；明确缺陷、预期语义和授权后才进入 Repair；Validate 重跑相关回归，Release 再评估兼容性与批准。

## 可见工作状态

每个重要门都报告：命令、主模式和阶段；事实、假设、决定；检查或变更的制品；实际检查和证据状态；授权与受保护不变量；阻塞、未决领域问题和下一门。

使用 `status` 生成紧凑状态。它展示决定和证据，不展示私有思维链。详细阶段输出和停止规则以 [workflow.md](../../ontotect/references/workflow.md) 为准。
