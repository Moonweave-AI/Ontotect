---
type: decision
status: accepted
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 180
summary: 采用统一宿主中立 Ontotect 命令协议、自动 Router 和独立只读 Python navigator，避免宿主专用行为分叉。
canonical: docs/decisions/0001-portable-command-router.md
related:
  - ontotect/SKILL.md
  - ontotect/references/command-contract.md
  - ontotect/scripts/ontotect.py
  - docs/zh-CN/command-reference.md
supersedes: null
superseded_by: null
---

# ADR 0001：便携命令协议与 Router

[English](0001-portable-command-router.md) · 本文是英文 canonical 决策记录的简体中文镜像。

## 状态

Owner 已于 2026-08-07 接受本 ADR，用于首次公开仓库与 npm 发布。

## 背景

Ontotect 必须在 Cursor、Codex、Kilo、OpenCode、Claude Code 和其他 Agent Skills 宿主中工作。这些产品发现技能目录和暴露调用的方式不同；一个宿主注册的 slash command 并不是另一个宿主的便携 API。

本体请求也会混合结果与生命周期阶段。“修复并发布这个本体”需要 Review、授权 Repair、Validate、Govern 和 Release gate；从扁平命令表选一个动词并不足够。用户需要首次帮助、自动路由、可见状态和阶段级控制。

终端界面很有用，但本地 Python 程序不能替代宿主 Agent、权限系统、本体工具链、reasoner、领域审查或发布权威。

## 决定

1. 定义宿主中立协议：

   ```text
   Use Ontotect. Command: <command>. Target: <target or goal>.
   ```

2. `$ontotect ...` 和 `/ontotect ...` 只是可选宿主便捷形式，不是 canonical 行为。
3. 提供协调命令 `help`、`router`、`status`；`route` 是规范化为 `router` 的别名。
4. 提供模式命令 `build`、`review`、`repair`、`optimize`、`refactor`、`validate`、`govern`、`release`。
5. 提供阶段 `charter`、`reuse`、`conceptualize`、`formalize`、`implement`、`verify`、`release`，可使用 `stage <stage>`，无歧义时可用直接别名。
6. 裸 `release` 表示发布模式，`stage release` 表示生命周期 Stage G。
7. 匹配 Ontotect 但没有明确模式或阶段时自动调用 Router。Router 选择主模式、入口阶段、证据路径、授权边界和下一命令；输出不是证明或权限。
   `help` 使用 `n/a`，不伪造生命周期阶段；`status` 报告从证据重建的阶段，
   无法确定时使用 `unverified`。
8. 多模式工作默认组合为 `review -> repair/refactor/optimize -> validate -> govern/release`，除非证据支持另一条显式路径。
9. `review`、`validate`、`help`、`router`、`status` 默认只读。其他命令仅在显式授权范围内写入；远程发布始终需要明确授权。
10. 提供 `ontotect/scripts/ontotect.py` 作为确定性只读 navigator，只打印命令和路由卡；不调用 Agent、不读取或编辑本体、不运行 validator/reasoner，也不发布。

`ontotect/references/command-*.md` 是运行时行为事实源，公开文档是其镜像。

## 后果

### 正面

- 一个命令词汇可用于不同宿主的自然语言 Agent 接口。
- 用户可以从 `help` 或目标开始，不必先了解生命周期。
- 模式与阶段保持不同，同时支持目标驱动和阶段限定工作。
- 读写与证据边界显式化。
- Navigator 支持确定性终端发现而不假装执行工程。
- 渐进命令 references 让 `SKILL.md` 聚焦核心契约。

### 成本与局限

- 宿主原生 autocomplete 和 slash-command 视觉行为可能不同。
- 文档与运行时命令 reference 必须同步。
- 路由仍需要 Agent 判断，也可能需要领域澄清。
- Navigator 输出不是验证证据，不能当作证据展示。

## 考虑过的替代方案

### 分别实现宿主专用命令

不作为 canonical，因为行为容易漂移，还要维护五套语义等价接口。未来可增加保持本契约的薄适配器。

### 只有一个无动词的 `ontotect`

拒绝，因为用户无法精确请求只读审核、受限阶段或发布门，Agent 也会不一致地重建路由。

### 由 Python CLI 执行完整工作流

拒绝，因为会复制 Agent 行为、要求固定工具链、模糊权限，并错误暗示确定性命令解析提供领域判断或 OWL 证据。

### 每个模式使用独立 Skill 包

暂不采用，因为会复制共享规则、assets 和 references。若宿主发现或上下文测量证明有实际需要，可重新评估。

## 验收证据

- 每个文档命令对应一份运行时命令规范。
- 中英文命令参考具有相同命令和阶段集合。
- `route` 规范化为 `router`。
- Navigator `--help` 和代表性命令返回指导且不编辑夹具。
- 盲测能把新建、审核、修复、验证和发布路由到预期阶段。
- 不支持或未执行的证据保持 `unverified`。

接受该接口决定不需要哈希、依赖固化或宿主版本锁定。
