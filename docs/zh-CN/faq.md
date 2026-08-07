---
type: explanation
status: draft
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 180
summary: 关于 Ontotect 范围、命令、语义、验证、来源、安装和许可的常见问题。
canonical: docs/en/faq.md
related:
  - docs/zh-CN/getting-started.md
  - docs/zh-CN/command-reference.md
  - ontotect/references/decision-guide.md
supersedes: null
superseded_by: null
---

# 常见问题

[English](../en/faq.md) · [文档首页](index.md) · 本页是英文 canonical 的简体中文镜像。

## Ontotect 是什么？

它是为本体设计、构建、审核、修复、优化、重构、验证、治理和发布提供系统工作流的 Agent Skill。它不是本体编辑器、triple store 或完整 reasoner。

## 首次用户从哪里开始？

先运行 `help`，再把目标交给 `router`。完整路线参见[快速入门](getting-started.md)。

## `route` 与 `router` 不同吗？

不。`router` 是 canonical，`route` 是别名；输出应规范为 `router`。

## 命令是 shell 命令吗？

便携命令是 Agent 提示契约：`Use Ontotect. Command: review. Target: ...`。Python `ontotect.py` navigator 只打印命令指导，不执行本体工作。

## `npx @moonweave-ai/ontotect install` 会执行本体工程吗？

不会。npm 可执行程序只规划或复制完整技能到固定宿主发现路径，不运行 Agent 工作流、validator、reasoner、repair 或发布。公共 `npx @moonweave-ai/ontotect` 需要获授权的组织 release 成功；registry 验证记录完成前请使用 `node bin/ontotect.js`。

## 为什么区分 `validate` 和 `verify`？

`validate` 是执行指定检查的模式；`verify` 是发布门前组合所有适用证据的生命周期阶段。同理，`build` 跨越生命周期，`implement` 只创建一个垂直切片。

## SHACL conform 能证明本体正确吗？

不能。SHACL 在某种配置下用 shapes 检查 data graph，本身不证明 OWL 一致性、可满足性、预期蕴含、领域正确性或用户验收。

## Ontotect 能证明 OWL 一致性吗？

只有实际使用合适 reasoner 检查目标 import closure 和配置时才能声明。内置 audit 不能做此主张；没有 reasoner 证据时必须标为 `unverified`。

## `ontology_diff.py` 能证明重构保持语义吗？

不能。它比较断言 RDF 图。保持性还需要推断层次和蕴含、CQ、SHACL、mapping、materialization contract 和相关运行结果。

## 每个项目都要用 OWL 吗？

不。选择满足契约的最弱语义栈：SKOS 用于 concept scheme，RDF/RDFS 用于轻量交换和推断，OWL 用于逻辑蕴含，SHACL 用于 graph constraint，SPARQL 用于可执行信息需求。组合使用时要明确职责。

## Ontotect 包含源书籍和论文吗？

不。它分发原创综合和公开引用，不分发私有 PDF 或提取全文。证据登记说明覆盖和局限。

## 在哪里查看书籍、论文、项目和工具致谢？

标准格式引用见[参考文献与致谢](references-and-acknowledgments.md)；完整证据地图、覆盖说明及权威边界见 [sources.md](../../ontotect/references/sources.md)。

## Ontotect 已采用开源许可证吗？

是。Ontotect 的原创仓库内容采用 [MIT 许可证](../../LICENSE)。第三方参考资料和链接作品继续适用其自身许可证，私有研究语料不在 Ontotect 的授权范围内。

## 为什么默认不要求哈希和依赖固化？

普通本体工作需要保存输入、VCS 历史、graph-aware diff、记录工具配置和比例化证据。只有具体监管、供应链、取证或验收要求存在时才需要更强控制。

## 在哪里报告安全问题？

遵循 [SECURITY.zh-CN.md](../../SECURITY.zh-CN.md)。不要在公开 Issue 中披露秘密、私有本体数据、原始语料或可用攻击细节。
