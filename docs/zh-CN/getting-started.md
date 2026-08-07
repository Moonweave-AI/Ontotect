---
type: tutorial
status: draft
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 180
summary: 安装 Ontotect、查看帮助、路由请求并执行证据驱动审核的首次使用教程。
canonical: docs/en/getting-started.md
related:
  - docs/zh-CN/installation.md
  - docs/zh-CN/command-reference.md
  - docs/zh-CN/troubleshooting-discovery.md
  - ontotect/assets/project-brief.md
supersedes: null
superseded_by: null
---

# 快速入门

[English](../en/getting-started.md) · [文档首页](index.md) · 本页是英文 canonical 的简体中文镜像。

本教程将完整 Ontotect skill suite 安装到一个项目，查看 focused entries，路由本体请求，
并启动只读审核。无需私有研究语料。

## 1. 安装到项目

在仓库根目录列出 suite 并预览目标位置：

```powershell
node bin/ontotect.js list
python ontotect/scripts/install_skill.py --agents all --scope project --project-root .
```

Python installer 默认 dry-run。检查五个 core targets、五组各 19 个 generated entries 以及
Kilo/OpenCode command targets 后再应用：

```powershell
python ontotect/scripts/install_skill.py --agents all --scope project --project-root . --apply
```

除非显式加入 `--force`，已有 Ontotect targets 不会被覆盖。安装后请重新加载宿主或新建
Agent 会话。

## 2. 询问 Ontotect 能做什么

宿主暴露已安装 skills 时，使用 focused Help entry：

```text
Codex: $ontotect-help
Cursor / Claude / Kilo / OpenCode: /ontotect-help
```

宿主中立回退形式为 `Use Ontotect. Command: help. Target: first-time user.`。回答应说明
suite、模式、阶段、示例和边界，并指出内置审计与 diff 脚本不是完整 OWL 语义验证。

## 3. 路由真实目标

不清楚正确模式或入口阶段时使用 focused Router skill：

```text
Codex: $ontotect-router review our shipping ontology, repair defects, and prepare release evidence.
Slash 宿主: /ontotect-router review our shipping ontology, repair defects, and prepare release evidence.
```

`route` 是 `router` 的别名。路由卡应给出：

- 主模式和生命周期入口；
- 事实、假设、缺失输入和权限边界；
- 要检查的制品与 references；
- 要取得的证据和退出条件；
- 有序后续路径，例如本场景通常为 `review -> repair -> validate -> release`。

路由不是证据，也不授权修改；它用于显式化下一项决定。

## 4. 从只读审核开始

将本体、imports/catalog、shapes、代表性数据、能力问题和构建配置放在 Agent 可读的项目中，
然后调用 `ontotect-review`：

```text
Codex: $ontotect-review ontology/source.ttl and its shapes, tests, imports, and intended contract. Do not modify files.
Slash 宿主: /ontotect-review ontology/source.ttl and its shapes, tests, imports, and intended contract. Do not modify files.
```

优质审核会冻结目标，把缺失意图标为假设，只运行可用检查，并生成证据关联的发现；不会静默修复本体。

## 5. 检查结果

结果应包含：

1. 结果和当前模式/阶段；
2. 本体契约和受保护假设；
3. 实际检查的制品；
4. 实际执行的检查及配置；
5. 指向术语或公理的分级发现；
6. 语义和下游影响；
7. `unverified` 项及残余风险；
8. 下一阶段门、Owner、审查者和完成标准。

解析成功不等于语义成功。SHACL conform 不证明 OWL 一致，断言 RDF diff 也不证明推断蕴含得到保持。

## 6. 有意识地继续

- 已知缺陷且获准编辑：`ontotect-repair`。
- 有保持契约的结构变化：`ontotect-refactor`。
- 只执行目标检查：`ontotect-validate`。
- 新本体或扩展：`ontotect-build`。
- Owner、弃用或发布：`ontotect-govern` 或 `ontotect-release`。
- 只做一个生命周期阶段：使用 `ontotect-conceptualize` 等 focused entry，或使用
  `ontotect-stage conceptualize`。

完整映射见[命令参考](command-reference.md)；刷新后仍不显示时使用
[排查发现问题](troubleshooting-discovery.md)。
