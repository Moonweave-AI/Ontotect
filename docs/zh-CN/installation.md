---
type: how-to
status: draft
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 180
summary: 在常见 Agent Skills 宿主中安装完整 Ontotect 技能目录并保持其便携结构。
canonical: docs/en/installation.md
related:
  - ontotect/references/agent-compatibility.md
  - ontotect/scripts/install_skill.py
  - docs/zh-CN/npm-and-npx-installation.md
  - docs/zh-CN/compatibility.md
supersedes: null
superseded_by: null
---

# 安装

[English](../en/installation.md) · [文档首页](index.md) · 本页是英文 canonical 的简体中文镜像。

Ontotect 遵循开放的 Agent Skills 目录约定。请安装完整 `ontotect/` 目录；只复制 `SKILL.md` 会破坏相对 references、assets、命令规范和 scripts。

## 使用 npm 安装器

从当前源码树预览全部五个项目级目标：

```powershell
node bin/ontotect.js plan --agents all --scope project --project-root .
```

应用已审阅的计划：

```powershell
node bin/ontotect.js install --agents all --scope project --project-root .
```

该包没有依赖或生命周期脚本；仅获取包不会复制技能。`0.1.0` 已以 `@moonweave-ai/ontotect` 发布到 npm。公共 npx、源码、本地包、用户级、覆盖及安全路径详见 [npm 与 npx 安装](npm-and-npx-installation.md)。

## 使用 Python 安装器

从仓库根目录预览项目级安装：

```powershell
python ontotect/scripts/install_skill.py --agents all --scope project --project-root .
```

检查计划后应用：

```powershell
python ontotect/scripts/install_skill.py --agents all --scope project --project-root . --apply
```

用 `--agents cursor codex kilo opencode claude` 选择宿主，用 `--scope user` 选择用户范围。除非同时提供 `--force`，安装器不会覆盖现有技能。当前接口以 `--help` 为准。Node 与 Python 安装器采用同一组五宿主 canonical 项目/用户目标。

## 手动项目安装

将 `ontotect/` 完整复制到宿主发现路径：

| 宿主 | 常用项目路径 |
|---|---|
| Cursor | `.cursor/skills/ontotect/` |
| Codex | `.agents/skills/ontotect/` |
| Kilo | `.kilo/skills/ontotect/` 或 `.agents/skills/ontotect/` |
| OpenCode | `.opencode/skills/ontotect/` 或 `.agents/skills/ontotect/` |
| Claude Code | `.claude/skills/ontotect/` |

用户/全局路径和宿主发现规则会独立变化。维护中的详细表和官方链接位于 [agent-compatibility.md](../../ontotect/references/agent-compatibility.md)。

## 验证发现

安装后：

1. 重新加载宿主或新建会话。
2. 若宿主提供技能列表，确认其中存在 `ontotect`。
3. 发送 `Use Ontotect. Command: help. Target: first-time user.`。
4. 让宿主路由一个无害示例。
5. 确认它能按需读取 `references/workflow.md`。
6. 确认仅加载技能不会执行脚本或请求额外权限。

目录复制和 frontmatter 有效只证明结构兼容。行为兼容还要求真实宿主发现技能、解析相对文件、遵循命令契约，并在工作需要时提供经用户批准的文件或命令工具。

## 可选 Python 能力

Navigator 只使用 Python 标准库。建议性本体审计需要 RDFLib；可选 SHACL 验证还需要 pySHACL。不要仅为加载技能而安装依赖。请求的检查不可用时标为 `unverified`，或在改变环境前取得用户批准。

```powershell
python ontotect/scripts/ontotect.py help
python ontotect/scripts/ontology_audit.py --help
python ontotect/scripts/ontology_diff.py --help
```

Navigator 只输出指导卡，不检查、修复、验证或发布本体。

## 更新

通过经过审查的仓库更新替换或合并完整技能包。项目证据保存在安装目录之外。默认不要添加哈希、依赖固化或重复宿主版本检查；只有具体验收或风险确实需要时才增加更强完整性控制。
