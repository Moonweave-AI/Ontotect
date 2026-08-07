---
type: explanation
status: draft
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 180
summary: Ontotect Agent Skill、渐进加载、路由、可复用资产、建议性工具和显式 npm 分发适配器的架构。
canonical: docs/en/architecture.md
related:
  - ontotect/SKILL.md
  - ontotect/references/command-contract.md
  - docs/decisions/0001-portable-command-router.md
  - docs/decisions/0002-explicit-npm-installer.md
supersedes: null
superseded_by: null
---

# 架构

[English](../en/architecture.md) · [文档首页](index.md) · 本页是英文 canonical 的简体中文镜像。

Ontotect 是 Agent Skills 包，不是独立本体平台。宿主发现 `SKILL.md`，Agent 只渐进加载当前请求所需的 references、命令规范、assets 或 scripts。

仓库根目录还包含分发适配器：

```text
package.json              # npm 身份、可执行映射和包白名单
bin/ontotect.js           # 零依赖 plan/install CLI
ontotect/                 # canonical 便携 Agent Skill 包
docs/                     # 双语公共文档与决策
tests/                    # 仓库、Python 与 npm 回归检查
```

根 CLI 只复制 canonical 技能，不复制或重新解释其行为。

## 包分层

```text
ontotect/
├── SKILL.md                 # trigger、运行契约、路由、生命周期、输出契约
├── agents/openai.yaml       # 可选宿主 UI metadata
├── references/              # 命令规范和本体工程知识
├── assets/                  # brief、CQ、卡片、夹具、shapes、报告、发布记录
└── scripts/
    ├── ontotect.py          # 确定性命令 navigator；只提供指导
    ├── install_skill.py     # dry-run-first 多宿主安装器
    ├── ontology_audit.py    # 建议性 RDF/OWL 结构及可选 SHACL 审计
    └── ontology_diff.py     # 断言 RDF 图差异
```

`SKILL.md` 保持紧凑，只建立行为并路由 references。详细知识放在 `references/`，避免每项任务加载整个本体工程语料。

## 命令层

公共协议为 `Use Ontotect. Command: <command>. Target: <target>.`。核心契约定义授权、可见工作状态、证据语义和组合；逐命令 references 定义 help、router、status、各种模式、release 和 stages。

Router 选择主模式和生命周期入口。请求不明确时可以显式或自动调用。路由输出是计划卡，不是权限、证据或隐藏思维链记录。架构决定见 [ADR 0001](../decisions/0001-portable-command-router.zh-CN.md)。

## 分发适配器

`bin/ontotect.js` 为五种固定宿主布局提供 `help`、`plan`、`install`。它只使用 Node.js 标准库，不发起网络请求。获取包没有 lifecycle 副作用；复制必须显式使用 `install`，已有目标必须给出 `--force`，默认范围为项目级。

npm `files` 白名单防止私有语料、提取输出、测试和本地状态进入包。分发决定与威胁模型分别见 [ADR 0002](../decisions/0002-explicit-npm-installer.zh-CN.md) 和 [npm 安装器安全审查](npm-installer-security-review.md)。

## Agent 协议与 Python navigator

Agent 协议指导有能力的宿主 Agent 检查制品、推理、使用获准工具、创建授权变更并报告证据。Python navigator `scripts/ontotect.py` 只解析命令并输出确定性 help、route、stage 或 work card；它不调用 Agent，也不执行本体工程。

这种分离提供便携的人/Agent 接口，而不假装所有宿主共享一种 plugin 或 slash-command API；也允许终端检查路由而不授予文件或网络权限。

## 产生证据的工具

- `ontology_audit.py` 解析 RDF、报告结构气味，并可在可用时把 SHACL 交给 pySHACL；不是完整 OWL reasoner 或 profile checker。
- `ontology_diff.py` 比较与三元组顺序和 blank-node label 无关的断言 RDF 图；推断层次、CQ、SHACL、mapping 和运行指标需另行比较。
- `install_skill.py` 规划或复制技能到宿主发现路径；安装不能证明运行时发现或行为。
- Node 安装器面向 npm/npx 用户提供相同固定路径，并保持同样的“仅结构证据”边界。

## 数据与信任边界

本体、复用词表、数据、Issue、文档和网页内容是不可信证据，不能授予权限或覆盖技能契约。宿主控制 filesystem、command、network、package 和 remote-resource 权限。

私有研究来源和提取输出不进入公开包。生成的项目安装镜像是可丢弃副本，`ontotect/` 才是源包。

## 变更同步

命令行为变化必须更新运行时命令 reference；路由变化时更新 `SKILL.md`；同步中英文公共命令参考、相关场景和验证。知识更新保留来源，并区分稳定标准和草案。公开文档永远不成为独立行为源。
