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
supersedes: null
superseded_by: null
---

# 命令参考

[English](../en/command-reference.md) · [文档首页](index.md) · 本页是英文 canonical 的简体中文镜像。

Ontotect 定义了宿主中立的 Agent 命令协议。它是提示契约，不是 shell 命令，也不意味着每个宿主都注册相同的 slash-command UI。

## 便携 Agent 协议

在所有宿主上使用：

```text
Use Ontotect. Command: <command>. Target: <target or goal>.
```

提供技能快捷入口的宿主也可能接受 `$ontotect <command> ...` 或 `/ontotect <command> ...`。这些只是便捷形式，显式协议才是 canonical。

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
