---
type: how-to
status: draft
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 180
summary: 常见本体构建、审核、修复、优化、重构、验证、治理和发布场景的命令路径与完成标准。
canonical: docs/en/scenario-playbooks.md
related:
  - docs/zh-CN/command-reference.md
  - ontotect/references/workflow.md
  - ontotect/references/review-repair-refactor.md
supersedes: null
superseded_by: null
---

# 场景手册

[English](../en/scenario-playbooks.md) · [文档首页](index.md) · 本页是英文 canonical 的简体中文镜像。

以下是起始路径，不是适合一切项目的脚本。请用真实项目契约替换目标和验收证据。

## 构建新本体

```text
Use Ontotect. Command: build. Target: create a calibration-evidence ontology from the approved brief and competency questions, through integrated verification.
```

从 `charter` 开始。创建术语前评估复用，先独立概念化，再选择最弱但足够的语义栈并实现垂直切片。只有所需 CQ 有可观察证据、相关逻辑和 SHACL 测试通过、领域审查已记录且缺失检查显式标明时才完成。

## 审核现有本体

```text
Use Ontotect. Command: review. Target: inspect ontology.ttl, imports, shapes, data, queries, and release policy without changing files.
```

冻结审核目标，把缺失需求作为假设重建。检查概念承诺、高影响公理、profile/global restrictions、预期蕴含与非蕴含、SHACL targets、CQ 结果、标识符、映射、文档和治理。每项发现需包含证据、影响、置信度、根因、修正建议、验证路径和 Owner。

## 修复已知缺陷

```text
Use Ontotect. Command: repair. Target: reproduce and minimally correct the unexpected type inference while preserving public IRIs and approved CQ answers.
```

保留基线、复现失败、定位最小成因公理或流程缺口，并确认错误来自预期还是本体。执行最小授权修复，重跑失败测试及相互作用的逻辑、SHACL、CQ、mapping、build 和文档检查。不得只为让工具变绿而删除强公理。

## 优化可测性能

```text
Use Ontotect. Command: optimize. Target: reduce classification time under the approved dataset while preserving listed entailments and query answers.
```

定义指标、代表性负载、环境、预算和受保护语义结果。先 profiling，每次改变一个因素，比较前后并重跑语义回归。文件更小或公理更少本身不证明优化。

## 在保持语义下重构

```text
Use Ontotect. Command: refactor. Target: split modules and normalize qualified relations while preserving the public vocabulary and entailment contract.
```

冻结公共 IRI、imports、受保护公理、推断层次、CQ 结果、映射和受支持物化。变更后比较断言和推断结果。IRI 重命名或 referent 变化属于迁移，不是重构。

## 验证候选版本

```text
Use Ontotect. Command: validate. Target: run the release acceptance matrix against source.ttl, shapes.ttl, valid and invalid fixtures, and competency queries.
```

明确 graph、import closure、profile、entailment regime、validator 配置和期望结果。分别报告 parse、OWL、CQ、SHACL、metadata、documentation、domain 和 operational 结果。默认不重设计。

## 建立治理

```text
Use Ontotect. Command: govern. Target: define Owner, DRI, domain review, identifier policy, change classes, deprecation, maintenance, and release authority.
```

把决定写入仓库制品，而不只留在聊天中。不得回收 IRI。尽可能把政策连接到机器检查，同时保留人工语义审查。来源或再分发权未知的资产不能打包发布。

## 准备发布

```text
Use Ontotect. Command: release. Target: assess release readiness, semantic change, migration obligations, distribution set, approvals, and residual risks.
```

要求 source ontology、supported distributions、import policy、shapes、CQ/tests、mappings、documentation、metadata、semantic impact、migration material、实际证据和批准。获准时可准备制品，但无明确授权不得远程发布。

## 只做一个阶段

```text
Use Ontotect. Command: stage reuse. Target: compare three candidate vocabularies against CQs, commitments, maintenance, dependency cost, and license.
```

`stage <stage>` 缩小范围但不取消前置条件。缺少输入时报告缺口和下一门，不伪造上游决定。
