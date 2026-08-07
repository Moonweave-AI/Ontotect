---
type: reference
status: draft
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 90
summary: Ontotect skill suite 的宿主发现路径、focused skill 调用、命令适配器、刷新行为和验证边界。
canonical: docs/en/compatibility.md
related:
  - ontotect/references/agent-compatibility.md
  - docs/zh-CN/installation.md
  - docs/zh-CN/npm-and-npx-installation.md
  - docs/zh-CN/troubleshooting-discovery.md
  - docs/decisions/0004-host-discovery-and-command-adapters.md
supersedes: null
superseded_by: null
---

# 兼容性

[English](../en/compatibility.md) · [文档首页](index.md) · 本页是英文 canonical 的简体中文镜像。

Ontotect 交付一套 canonical 本体工程源码，并在显式安装时编译为包含 20 个 focused entries
的 skill suite。每个 generated entry 都是完整 Agent Skill，具有匹配的目录/frontmatter
名称、固定命令语义、本地 references、assets、scripts 与可选 OpenAI UI metadata。

> [!IMPORTANT]
> 本矩阵描述当前源码树及本地 packed archive 中的 focused-suite compiler。公开
> `@moonweave-ai/ontotect@0.1.1` 早于该实现，只安装早期的 `ontotect` root skill，不提供
> `list`、suite 选择、focused entries 或 command adapters。

该设计采用 Moonweave Governance Skills 中值得借鉴的职责分离：focused skills 形成可发现
体系；轻量宿主 commands 提供兼容；installer 负责放置；registry 防止映射漂移。

## 宿主矩阵

| 宿主 | 项目级 skill root | 用户级 skill root | focused entry | command adapters | 刷新 |
|---|---|---|---|---|---|
| Cursor | `.cursor/skills/` | `~/.cursor/skills/` | `/ontotect-review` | 无；优先使用原生 Skills | 重新打开会话/项目 |
| Codex | `.agents/skills/` | `~/.agents/skills/` | `$ontotect-review` 或 `/skills` | 无；没有正式项目 command root | 通常自动；过期时重启 |
| Kilo | `.kilo/skills/` | `~/.kilo/skills/` | 原生 skill/tool 加载；`/ontotect-review` 只由生成的 command adapter 提供 | `.kilo/commands/`；用户级 `~/.config/kilo/commands/` | `/reload` 或新会话 |
| OpenCode | `.opencode/skills/` | `~/.config/opencode/skills/` | 原生 skill tool；较新构建可能暴露 slash | `.opencode/commands/`；用户级 `~/.config/opencode/commands/` | 重启 |
| Claude Code | `.claude/skills/` | `~/.claude/skills/` | `/ontotect-review` | 无；不需要 legacy commands | 已有 skills 目录热检测；会话中才新建顶层目录时重启 |

Codex Desktop 可能在 slash selector 中枚举已启用 focused skills，但 Codex CLI/IDE 的正式
显式语法仍是 `$skill-name`。不能把 `/ontotect-review` 宣传成通用 Codex custom command。

## 已安装套件

`--suite full` 安装：

- root、Help、Router 与 Status；
- Build、Review、Repair、Optimize、Refactor、Validate、Govern 与 Release；
- 通用 Stage，以及 Charter、Reuse、Conceptualize、Formalize、Implement、Verify 与
  Stage Release。

`--suite core` 只安装 `ontotect`。`ontotect list` 是 focused names 到 canonical commands
的权威投影。

Kilo/OpenCode 的 `--commands auto` 输出使用相同名称，并把每个 command 映射到同名 focused
skill。Cursor 与 Claude 不生成重复 legacy command files，Codex 不生成不受支持的 command
files。

## 可移植要求

- 目录名与 frontmatter `name` 必须一致。
- generated 目录必须完整，不能只复制 `SKILL.md`。
- 把 generated 安装目录视为输出；应修改 canonical 源或 suite registry 后重新安装。
- 由宿主执行文件、命令、网络、包和远程资源权限。
- 使用宿主真实调用语法与刷新机制。
- 只有在用户请求和权限允许时运行可选 Python/RDF 工具；不可用检查标为 `unverified`。
- 不要为了修复 discovery 引入 checksum、依赖固化或宿主锁定。

## 兼容性证据层级

1. **分发**：npm archive 暴露 installer、source、registry 和预期公共文件。
2. **结构安装**：全部计划的 core、focused 和 command targets 存在，名称与资源一致。
3. **真实发现**：实际刷新后的宿主列出或调用 focused entry。
4. **行为兼容**：focused entry 遵循固定命令、解析 references、尊重权限并生成 Ontotect
   证据。

不得混为一谈。隔离文件系统安装只证明第 2 层，不证明第 3 或第 4 层。

## Smoke test

1. 在当前 checkout 中运行 `node bin/ontotect.js list`，再执行 dry-run plan；已全局安装的
   当前本地包可改用 `ontotect list`。
2. 通过源码 Node/Python installer 或本地 suite archive 安装；本矩阵不能使用公开
   `0.1.1`，也不要手工散放 wrapper files。
3. 刷新宿主。
4. 确认 Help、Router、Review、Validate 和至少一个 lifecycle-stage entry 可以显示或显式调用。
5. 运行 Help，路由无害请求，并对 fixture 做只读 Review。
6. 确认加载 skill 本身不会运行脚本。
7. 分别记录结构、发现与行为结果。

精确官方链接和产品级诊断见
[agent-compatibility.md](../../ontotect/references/agent-compatibility.md)与
[排查发现问题](troubleshooting-discovery.md)。
