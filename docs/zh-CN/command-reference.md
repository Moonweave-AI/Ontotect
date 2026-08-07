---
type: reference
status: draft
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 180
summary: Ontotect Agent 命令、生命周期阶段命令、路由别名及独立 navigator CLI 的中文公共参考。
canonical: docs/en/command-reference.md
related:
  - ontotect/references/command-contract.md
  - ontotect/references/command-router.md
  - ontotect/scripts/ontotect.py
  - docs/decisions/0001-portable-command-router.md
  - docs/decisions/0004-host-discovery-and-command-adapters.md
supersedes: null
superseded_by: null
---

# 命令参考

[English](../en/command-reference.md) · [文档首页](index.md) · 本页是英文 canonical 的简体中文镜像。

Ontotect 定义宿主中立的 Agent 命令协议，并把它编译为 20 个 focused skill entries。协议是
语义契约；focused skills 是可独立发现的宿主入口。

## 便携 Agent 协议

在所有宿主上使用：

```text
Use Ontotect. Command: <command>. Target: <target or goal>.
```

root skill 仍可在宿主支持时接受 `$ontotect <command> ...` 或
`/ontotect <command> ...`，但完整 installer 还会提供 focused names。Codex 使用
`$<skill-name>` 或 `/skills`；Cursor 与 Claude 使用 `/<skill-name>`；Kilo/OpenCode 使用
原生 skill slash 或 generated command adapters。

## 可发现的 Focused Entries

| Skill entry | 固定 canonical 命令 | 用途 |
|---|---|---|
| `ontotect` | 有请求时为 `router`；无参数时为 `help` | 通用入口与回退 Router |
| `ontotect-help` | `help` | 首次接触说明 |
| `ontotect-router` | `router` | 选择模式、阶段、证据路径和下一 gate |
| `ontotect-status` | `status` | 在不推进工作的前提下重建状态 |
| `ontotect-build` | `build` | 创建或扩展本体 |
| `ontotect-review` | `review` | 证据驱动的只读审核 |
| `ontotect-repair` | `repair` | 修正已复现缺陷 |
| `ontotect-optimize` | `optimize` | 改善已测量目标 |
| `ontotect-refactor` | `refactor` | 在保持契约下重构 |
| `ontotect-validate` | `validate` | 执行指定证据而不重新设计 |
| `ontotect-govern` | `govern` | 定义所有权、标识符与变更政策 |
| `ontotect-release` | `release` 模式 | 评估和准备发布就绪性 |
| `ontotect-stage` | `stage <stage>` | 从第一参数选择阶段 |
| `ontotect-charter` | `stage charter` | 定义目的、范围、CQ、角色与验收 |
| `ontotect-reuse` | `stage reuse` | 评估 reuse/import/module/mapping |
| `ontotect-conceptualize` | `stage conceptualize` | 建立概念模型 |
| `ontotect-formalize` | `stage formalize` | 选择语义与形式承诺 |
| `ontotect-implement` | `stage implement` | 交付经过测试的纵向切片 |
| `ontotect-verify` | `stage verify` | 集成验证证据 |
| `ontotect-stage-release` | `stage release` | 完成生命周期 Stage G |

选择 focused skill 即代表显式命令；意图推断不得静默替换它。generated entry 仍携带完整
canonical workflow 与全部本地 references。

## 协调命令

| 命令 | 用途 | 默认修改行为 |
|---|---|---|
| `help` | 解释 Ontotect、命令、示例、边界和下一选择 | 只读 |
| `router` | 选择主模式、入口阶段、证据路径和下一命令 | 只读 |
| `route` | `router` 的别名；输出应规范为 `router` | 只读 |
| `status` | 汇总模式、阶段、决定、制品、检查、阻塞和下一门 | 只读 |

请求符合 Ontotect 但缺少清晰模式或阶段时，应自动使用 `router`。路由不会授权文件修改。

## 模式命令

| 命令 | 适用情况 | 常规路径 | 修改规则 |
|---|---|---|---|
| `build` | 创建或扩展本体 | 按要求从 Charter 到 Release | 只有请求时写入 |
| `review` | 检查并报告缺陷 | 冻结目标、验证、追溯原因 | 只读 |
| `repair` | 修复已复现缺陷 | 基线、复现、最小修复、回归 | 需要编辑授权 |
| `optimize` | 改进已测量成本或复杂度 | 基线、profiling、变更、比较 | 需要编辑授权 |
| `refactor` | 在保持契约下改善结构 | 冻结不变量、转换、语义 diff | 需要编辑授权 |
| `validate` | 执行指定证据而不默认重设计 | 目标检查及解释所需前置项 | 默认只读 |
| `govern` | 定义 Owner、变更、标识符、弃用或维护 | 先权限和政策，后控制 | 只有请求时写入 |
| `release` | 评估和准备发布处置 | 集成证据、语义影响、批准 | 无明确授权不发布 |

组合工作遵循 `review -> repair/refactor/optimize -> validate -> govern/release`。不得在 `review` 中静默修复，也不得在 `validate` 中默认重设计。

## 生命周期阶段命令

用 `stage <stage>` 执行或规划一个阶段：

| 阶段 | 结果 |
|---|---|
| `charter` | 目的、用户、范围、CQ、角色、约束和验收证据 |
| `reuse` | 可追溯候选评估和 reuse/import/module/mapping 决定 |
| `conceptualize` | 术语、类别、定义、分类、关系、示例和未决问题 |
| `formalize` | 语义栈、profile、IRI、模块、公理、约束和假设 |
| `implement` | 回答一个或多个 CQ 的可测试垂直切片 |
| `verify` | 集成语法、逻辑、CQ、SHACL、审查、领域和运行证据 |
| `release` | 变更类型、迁移、发布集、批准和发布就绪性 |

```text
Use Ontotect. Command: stage conceptualize. Target: the proposed maintenance-event domain.
Use Ontotect. Command: stage verify. Target: ontology/source.ttl and the approved acceptance matrix.
```

可接受阶段名作为直接别名。`stage release` 始终表示生命周期 Stage G；裸 `release` 表示发布模式命令。

## Python navigator CLI

`ontotect/scripts/ontotect.py` 是面向终端和自动化的确定性 navigator。它解析命令名并输出对应指导或路由卡；**不会**读取本体、调用 Agent、运行 reasoner、执行 SHACL、编辑文件或发布版本。

```powershell
python ontotect/scripts/ontotect.py help
python ontotect/scripts/ontotect.py router "Review and fix ontology.ttl"
python ontotect/scripts/ontotect.py build ontology.ttl --from-stage charter --to-stage verify
python ontotect/scripts/ontotect.py stage conceptualize
```

其输出是 Agent 会话输入或规划辅助，不是工程证据。真正检查应使用 `ontology_audit.py`、`ontology_diff.py`、项目工具链和适当 reasoner，并只声明其实际支持的结论。

## 输出契约

每个命令都应显示：命令和阶段、事实与假设、授权、制品、证据状态、决定、语义影响、阻塞和下一门。不要暴露隐藏思维链；应暴露与决定有关的证据和不确定性。未执行或不可用的检查标为 `unverified`。

`ontotect/references/command-*.md` 是运行时行为事实源，本页只是公共参考投影。
