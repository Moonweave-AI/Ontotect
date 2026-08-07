---
type: how-to
status: draft
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 180
summary: 在本体工作中应用 Owner、语义变更控制、IRI、弃用、迁移、来源和发布门。
canonical: docs/en/governance-and-release.md
related:
  - ontotect/references/governance-and-release.md
  - ontotect/assets/change-proposal.md
  - ontotect/assets/release-checklist.md
supersedes: null
superseded_by: null
---

# 治理与发布

[English](../en/governance-and-release.md) · [文档首页](index.md) · 本页是英文 canonical 的简体中文镜像。

本体治理控制含义随时间的变化。它分配权限、保护标识符和消费者、记录证据，并让已发布词表可维护。

## 分配决策权

按需记录 accountable Owner、working DRI/maintainer、domain reviewer、ontology engineer、consumer representative、release authority 和 infrastructure steward。小项目中一人可兼任，但责任必须保存在 Issue、decision record、release record 或 ontology annotation 中，而不只在聊天里。

## 分类语义变更

按消费者影响而不是文本 diff 分类：

- **patch-compatible**：不改变受保护契约的文档、metadata、serialization 或实现修正；
- **additive**：保留既有预期结果，但可能增加 entailment 或 validation outcome；
- **deprecating**：保留旧 IRI，同时引导消费者迁移到受治理替代项；
- **breaking**：meaning、entailment、constraint、identifier、mapping、profile 或 query behavior 要求消费者采取行动。

新增 domain、range、disjointness、equivalence、cardinality 或 property characteristic 即使不删除术语，也可能是 breaking。

## 保护标识符

不得把公共 IRI 重用于另一个 referent。区分稳定 ontology identity 与 versioned document。定义 current、versioned、deprecated、retired 资源的解析方式。IRI rename 是迁移；label 修正不必然是迁移。

弃用时保留 IRI 和最后稳定含义，说明原因及生效版本，只在语义成立时给出替代，记录 data/query migration 并监测采用情况。

## 准备发布集

使用 `release` 评估和准备：canonical source、distributions/modules、import/catalog policy、shapes、CQs、正负夹具、entailment/query tests、带来源和审查状态的 mappings、metadata、documentation、semantic diff、change class、deprecations、migrations、实际证据、例外、风险、批准和维护/回滚路径。

发布到远程 registry、repository、PURL service 或 endpoint 需要超出制品准备的明确授权。

## 来源与许可

记录需求、复用术语、模块、映射、生成制品、审查和发布的 provenance。再分发许可应与语义适配分开验证。链接 IRI 不自动允许复制源码，引用也不重新许可内容。

Ontotect 的原创仓库内容采用 [MIT 许可证](../../LICENSE)。私有构建书籍、论文、厂商资料、提取文本以及不在该授权范围内的第三方作品均不进入公开发布。

## 发布处置

使用 `pass`、`pass-with-actions`、`revise`、`blocked` 或 `unverified`。Release authority 根据实际证据批准，而不是根据 Agent 信心。完整发布应让消费者知道变化、理解语义影响、取得目标制品、验证、迁移并找到维护者。

底层检查结果必须与 `accepted-exception` 分开记录。只有权威、理由、范围、持久
记录、复审条件和发布政策许可都完整时，例外才可支持 `pass-with-actions`；否则
按命令契约的 `revise`、`blocked`、`unverified` 优先级处置。

完整政策以 [governance-and-release.md](../../ontotect/references/governance-and-release.md) 为准。
