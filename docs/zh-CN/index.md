---
type: reference
status: draft
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 180
summary: 安装、路由、运行、验证和治理 Ontotect 的中文文档中心。
canonical: docs/en/index.md
related:
  - README.zh-CN.md
  - ontotect/SKILL.md
supersedes: null
superseded_by: null
---

# Ontotect 文档

[English](../en/index.md) · [项目 README](../../README.zh-CN.md) · 本页是英文 canonical 的简体中文镜像。

Ontotect 是一个本体工程技能，用于系统化地设计、构建、审核、修正、优化、重构、验证和治理本体。它让支持 Agent Skills 的宿主成为证据驱动的本体工程协作者，同时保持概念承诺、形式语义、图约束、实现语法和治理之间的区别。

## 选择阅读路径

- 首次使用：阅读[快速入门](getting-started.md)。
- 安装到 Cursor、Codex、Kilo、OpenCode 或 Claude Code：阅读[安装](installation.md)；npm/npx 用户可直接阅读 [npm 与 npx 安装](npm-and-npx-installation.md)。
- 知道任务但不知道命令：先用 `help`，再用 `router`；参见[命令参考](command-reference.md)。
- 需要具体模式示例：阅读[场景手册](scenario-playbooks.md)。
- 需要阶段门和路由规则：阅读[路由与工作流](routing-and-workflow.md)。
- 需要评估验证或发布证据：阅读[质量与验证](quality-and-validation.md)。

## 文档地图

| 文档 | 用途 |
|---|---|
| [快速入门](getting-started.md) | 第一次安装、路由和审核教程 |
| [安装](installation.md) | 五种常见 Agent Skills 宿主的项目级和用户级安装 |
| [npm 与 npx 安装](npm-and-npx-installation.md) | 源码、本地包、未来 registry、目标和覆盖路径 |
| [命令参考](command-reference.md) | 便携 Agent 命令及独立的 Python navigator CLI |
| [路由与工作流](routing-and-workflow.md) | 模式选择、生命周期、阶段门和迭代 |
| [场景手册](scenario-playbooks.md) | 构建、审核、修正、优化、重构、验证、治理和发布路径 |
| [方法论与证据](methodology-and-evidence.md) | 研究基础、来源纪律与工程综合 |
| [参考文献与致谢](references-and-acknowledgments.md) | 书籍、论文、标准、工具和项目的标准格式引用 |
| [架构](architecture.md) | 技能包、渐进披露、命令层、资产和脚本 |
| [质量与验证](quality-and-validation.md) | 十层证据、QA 期望和结果解释 |
| [本地验证记录](verification-record.md) | 当前源技能包实际执行的检查及其明确边界 |
| [0.1.0 发布就绪报告](release-readiness-0.1.0.md) | Go/No-Go 证据、rollout、回退与发布后检查 |
| [兼容性](compatibility.md) | 宿主发现、便携契约和验证状态 |
| [npm 安装器安全审查](npm-installer-security-review.md) | S4 威胁模型、控制、剩余风险与发布阻断项 |
| [治理与发布](governance-and-release.md) | Owner、变更、标识符、迁移和发布门 |
| [FAQ](faq.md) | 常见建模、工具、版权和使用问题 |

## 事实源

公开文档解释如何使用项目。可执行行为以 [SKILL.md](../../ontotect/SKILL.md) 和 `ontotect/references/` 下的命令规范为准。详细本体工程知识仍以运行时 references 为准，尤其是：

- [workflow.md](../../ontotect/references/workflow.md)：生命周期和模式阶段门；
- [validation-and-testing.md](../../ontotect/references/validation-and-testing.md)：证据层；
- [sources.md](../../ontotect/references/sources.md)：研究覆盖和权威边界；
- [agent-compatibility.md](../../ontotect/references/agent-compatibility.md)：当前宿主路径。

英文页面是 canonical。`docs/zh-CN/` 的同名文件是翻译，不能定义独立行为。

## 项目状态

文档和技能目前是 draft/pre-release。可以验证结构安装和本地夹具，但目录复制成功并不证明每个外部宿主都已发现和执行技能。兼容性声明必须指出实际检查内容，并把未执行的行为标为 `unverified`。

Ontotect 的原创仓库内容采用 [MIT 许可证](../../LICENSE)。第三方参考资料继续适用其自身条款，私有构建语料不参与分发。
