---
type: how-to
status: draft
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 90
summary: 从 npm、npx、源码或本地包，把 Ontotect focused skill suite 安装到五种常见 Agent 宿主。
canonical: docs/en/npm-and-npx-installation.md
related:
  - docs/zh-CN/installation.md
  - docs/decisions/0002-explicit-npm-installer.md
  - docs/decisions/0003-organization-scoped-npm-package.md
  - docs/decisions/0004-host-discovery-and-command-adapters.md
  - docs/zh-CN/npm-installer-security-review.md
  - docs/zh-CN/troubleshooting-discovery.md
  - package.json
supersedes: null
superseded_by: null
---

# npm 与 npx 安装

[English](../en/npm-and-npx-installation.md) · [文档首页](index.md) · 本页是英文 canonical 的简体中文镜像。

npm 包是围绕一套 canonical `ontotect/` 源的零依赖 installer。只有显式运行 `install`
时才编译 focused skill suite。获取包不会安装到任何 Agent 宿主，因为不存在 npm lifecycle
scripts。

## 从源码树运行

列出注册表并检查全部项目级目标，不写入：

```powershell
node bin/ontotect.js list
node bin/ontotect.js plan --agents all --scope project --project-root .
```

应用已审阅的计划：

```powershell
node bin/ontotect.js install --agents all --scope project --project-root .
```

只安装选定宿主：

```powershell
node bin/ontotect.js install --agents cursor,codex --project-root .
```

默认值是 `--agents all --scope project --suite full --commands auto`。完整计划为每个宿主
包含 20 个 skill entries，并为 Kilo/OpenCode 生成同名 commands。使用 `--json` 获取结构化
输出；使用 `--dry-run` 让 `install` 只生成计划。

## 测试本地 npm 包

把当前源码包全局安装到本机：

```powershell
npm install --global .
ontotect list
ontotect plan --agents all --project-root .
ontotect install --agents all --project-root .
```

这使用当前 checkout，不是公共 registry release。不再需要时可运行 `npm uninstall --global @moonweave-ai/ontotect` 删除全局包。

维护者无需发布即可检查本地包：

```powershell
npm pack --dry-run --json
```

如需创建真实测试 tarball，只能放在已忽略的 `tmp/` 目录，检查内容后删除。

## 公共 npm 与 npx 命令

`0.1.2` 是首个包含 20-entry focused skill-suite compiler 的公开版本。`0.1.1` 继续作为
历史单技能 installer 保留；使用本流程前应先升级。

公共流程为：

```powershell
npx @moonweave-ai/ontotect list
npx @moonweave-ai/ontotect plan --agents all --scope project --project-root .
npx @moonweave-ai/ontotect install --agents all --scope project --project-root .
```

也可先全局安装：

```powershell
npm install --global @moonweave-ai/ontotect
ontotect install --agents all --scope project --project-root .
```

公共 package identity 是 `@moonweave-ai/ontotect`，executable 仍为 `ontotect`。Registry
获取、suite 安装与真实宿主发现是三类独立检查。

## 目标路径

| 宿主 key | 项目级 skill root | 用户级 skill root |
|---|---|---|
| `cursor` | `.cursor/skills/` | `~/.cursor/skills/` |
| `codex` | `.agents/skills/` | `~/.agents/skills/` |
| `kilo` | `.kilo/skills/` | `~/.kilo/skills/` |
| `opencode` | `.opencode/skills/` | `~/.config/opencode/skills/` |
| `claude` | `.claude/skills/` | `~/.claude/skills/` |

full 模式下，每个 root 会收到 `ontotect/` 和 19 个 generated sibling directories。
Kilo/OpenCode command roots 见[安装](installation.md)。`--scope user` 使用操作系统用户
主目录；`--project-root` 不会重定向用户级安装。应优先使用 installer，而不是手工散放
wrapper files。

## 覆盖与更新

任何 core skill、focused skill 或 Ontotect command file 已存在，都会阻止整个请求。先审阅
计划并保留本地工作，只有明确要进行干净的受管替换时才使用 `--force`：

```powershell
ontotect install --agents cursor --project-root . --force
```

`--force` 从 staged copy 替换每个受管 skill directory、覆盖受管 command files，并删除
上一次安装状态中记录的过期 entries。未知 sibling skills 与共享 command 目录中的无关文件
会被保留。安装副本是 generated output；canonical 修改应在源 package 或 suite registry
中完成，再重新安装。

## 安装器不会做什么

- 不联网、不收集 telemetry、不运行本体工具、不启动 Agent 宿主。
- 不修改宿主设置、shell profile、package manifest 或本体文件。
- 不证明宿主发现或行为兼容。
- 不安装可选 Python/RDF 依赖。
- 不发布 npm 包或本体制品。

安装后重新加载宿主，并执行[安装](installation.md)中的 smoke test。entry 缺失时使用
[排查发现问题](troubleshooting-discovery.md)。安全设计与剩余风险见
[npm 安装器安全审查](npm-installer-security-review.md)。
