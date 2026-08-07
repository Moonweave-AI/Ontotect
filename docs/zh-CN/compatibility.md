---
type: reference
status: draft
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 180
summary: Ontotect 在常见 Agent Skills 宿主中的便携契约、安装路径和诚实验证边界。
canonical: docs/en/compatibility.md
related:
  - ontotect/references/agent-compatibility.md
  - docs/zh-CN/installation.md
  - docs/zh-CN/npm-and-npx-installation.md
  - ontotect/scripts/install_skill.py
supersedes: null
superseded_by: null
---

# 兼容性

[English](../en/compatibility.md) · [文档首页](index.md) · 本页是英文 canonical 的简体中文镜像。

Ontotect 使用一个便携技能包：小写 `ontotect/`、最小 frontmatter 的 `SKILL.md`，以及相对 `references/`、`assets/` 和 `scripts/`。其他宿主可安全忽略可选 `agents/openai.yaml`。

手动复制、Python 安装器和 npm/npx 安装器只是同一目录的三种交付路径，不会创建宿主专用技能分叉。

## 宿主矩阵

| 宿主 | 项目发现路径 | 便携调用 |
|---|---|---|
| Cursor | `.cursor/skills/ontotect/` | 显式 Agent 协议；可用时使用宿主快捷方式 |
| Codex | `.agents/skills/ontotect/` | `Use Ontotect...` 或支持时 `$ontotect ...` |
| Kilo | `.kilo/skills/ontotect/` 或 `.agents/skills/ontotect/` | 显式协议；可用时快捷调用 |
| OpenCode | `.opencode/skills/ontotect/` 或 `.agents/skills/ontotect/` | 显式协议；可用时快捷调用 |
| Claude Code | `.claude/skills/ontotect/` | 显式协议或宿主暴露时 `/ontotect ...` |

宿主发现和全局路径可能变化。维护详情和官方链接见 [agent-compatibility.md](../../ontotect/references/agent-compatibility.md)。

## 便携要求

- 保持完整目录，以 `SKILL.md` 为基准解析资源。
- 不要求 Claude-only interpolation、Codex-only metadata 或单一 shell 语法。
- 由宿主执行文件、命令、网络、包和远程资源权限。
- `$ontotect`、`/ontotect` 是可选快捷形式，显式 Agent 协议才是通用文档。
- 仅在用户请求和宿主权限允许时运行 Python。
- 把 Node CLI 视为显式复制适配器：无生命周期脚本、无网络行为、固定根目录、未给 `--force` 时不覆盖。
- 可选 RDF 工具缺失时提供可执行说明。

## 兼容性声明的级别

1. **结构兼容**：目录复制、frontmatter 解析、相对文件存在。
2. **发现兼容**：真实宿主在会话中列出或激活 Ontotect。
3. **行为兼容**：宿主遵循路由、渐进读取 references、尊重权限并产生证据契约。

不得混为一谈。复制到五种预期目录只证明结构打包，除非实际启动和观察每个产品。按宿主记录测试，把未执行的 discovery 或 behavior 标为 `unverified`。

npm 包还增加一个分发层问题：tarball 是否只包含预期公共文件，并暴露预期 binary。包检查通过仍不能证明 live-host discovery 或本体工程行为。

## 行为 smoke test

1. 若宿主有技能列表，确认 Ontotect 出现。
2. 请求 `Use Ontotect. Command: help. Target: first-time user.`。
3. 对无害场景请求 `router`。
4. 确认只在需要时加载 `references/workflow.md`。
5. 确认加载不会运行脚本或请求无关权限。
6. 对合成夹具执行只读 Review 并检查证据标签。

兼容性依靠开放格式和行为契约维护，不依靠依赖或宿主版本固化。
