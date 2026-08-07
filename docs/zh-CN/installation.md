---
type: how-to
status: draft
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 90
summary: 通过显式 Node/npx 或 Python installer 安装完整 Ontotect skill suite 与宿主命令适配器。
canonical: docs/en/installation.md
related:
  - ontotect/references/agent-compatibility.md
  - ontotect/scripts/install_skill.py
  - docs/zh-CN/npm-and-npx-installation.md
  - docs/zh-CN/compatibility.md
  - docs/zh-CN/troubleshooting-discovery.md
supersedes: null
superseded_by: null
---

# 安装

[English](../en/installation.md) · [文档首页](index.md) · 本页是英文 canonical 的简体中文镜像。

请使用 installer 部署 Ontotect suite，不要手工把 wrapper files 散放到不同宿主目录。
installer 会从一套 canonical 源编译全部 focused skills、生成呈现 metadata、在确有需要的
宿主中增加兼容 commands，并在写入前预检整个事务。

> [!IMPORTANT]
> 公开 `0.1.2` 及后续版本包含 focused-suite compiler。`0.1.1` 是历史单技能 installer，
> 不提供 `list`、`--suite`、`--commands`、focused entries 或 command adapters。执行
> 本页流程前请先升级。

## 使用 npx 安装

先列出 20 个可发现 entries：

```powershell
npx @moonweave-ai/ontotect list
```

预览完整项目级安装：

```powershell
npx @moonweave-ai/ontotect plan --agents all --scope project --project-root .
```

应用已审阅计划：

```powershell
npx @moonweave-ai/ontotect install --agents all --scope project --project-root .
```

默认是 `--suite full --commands auto`。计划包含：

- 每个所选宿主一个 canonical `ontotect` target；
- 每个所选宿主 19 个 generated focused skill targets；
- Kilo 与 OpenCode 各 20 个显式 command adapters。

仅获取 package 不会安装 skills；项目没有 install 或 postinstall lifecycle hook。

## 从源码 checkout 安装

在 Ontotect checkout 中运行下列命令，并替换示例目标路径。Node 入口与公共 npm binary
提供相同行为：

```powershell
node bin/ontotect.js list
node bin/ontotect.js plan --agents all --scope project --project-root C:\path\to\target-project
node bin/ontotect.js install --agents all --scope project --project-root C:\path\to\target-project
```

Python installer 默认 dry-run：

```powershell
python ontotect/scripts/install_skill.py --agents all --scope project --project-root C:\path\to\target-project
python ontotect/scripts/install_skill.py --agents all --scope project --project-root C:\path\to\target-project --apply
```

两个 installer 都读取 `ontotect/assets/skill-suite.json`，生成匹配的 focused `SKILL.md`
和 `agents/openai.yaml`，并使用同一目标矩阵。

## 选择宿主与 scope

Node/npx 使用 `--agents cursor,codex`，Python 使用 `--agents cursor codex` 选择子集；
`--agents all` 选择全部五个宿主。

| 宿主 key | 项目级 skill root | 用户级 skill root |
|---|---|---|
| `cursor` | `.cursor/skills/` | `~/.cursor/skills/` |
| `codex` | `.agents/skills/` | `~/.agents/skills/` |
| `kilo` | `.kilo/skills/` | `~/.kilo/skills/` |
| `opencode` | `.opencode/skills/` | `~/.config/opencode/skills/` |
| `claude` | `.claude/skills/` | `~/.claude/skills/` |

Kilo commands 使用项目级 `.kilo/commands/` 或用户级 `~/.config/kilo/commands/`；
OpenCode commands 使用项目级 `.opencode/commands/` 或用户级
`~/.config/opencode/commands/`。

`--scope user` 使用操作系统用户主目录；`--project-root` 只选择项目级输出。

## 选择发现表面

下方不带路径的 `ontotect` 示例假定已全局安装 `0.1.2` 或后续版本，或者已用
`npm install --global .` 全局安装当前 checkout。

除非明确需要最小安装，否则使用完整 suite：

```powershell
ontotect install --agents codex --scope user --suite full
ontotect install --agents codex --scope user --suite core --commands none
```

`full` 创建 Help、Router、Status、八个工程模式、通用 Stage 与七个 stage-specific entries；
`core` 只创建 `ontotect`。

`--commands auto` 从同一个 registry 生成 Kilo/OpenCode adapters；`--commands none` 禁止
生成。Cursor、Codex 与 Claude 不会收到重复 command files。

## 冲突与更新行为

installer 会在复制前检查每个 core skill、focused skill 与 command file。任何一个
Ontotect 自有目标存在，都会阻止整个请求：

```powershell
ontotect plan --agents all --scope user --json
ontotect install --agents all --scope user --force
```

只有在审阅路径并确定干净替换 generated installation 后才使用 `--force`。installer 会先
stage 全部输出，提交期间使用 rollback backups，并在 `.ontotect-suite.json` 中只记录受管
entry names。后续 forced refresh 会删除该状态中已经过期的 entries，但保留未知 sibling
skills 和共享 `commands/` 中的无关文件。symlink/junction 路径逃逸与错误目标类型会在
staging 前被拒绝；安装不使用 checksum 或版本锁定。

## 刷新与调用

安装后重新加载宿主或新建会话：

| 宿主 | 首次发现检查 |
|---|---|
| Codex | `/skills`，然后 `$ontotect-help` 与 `$ontotect-review` |
| Cursor | `/ontotect-help` 与 `/ontotect-review` |
| Kilo | `/reload`，然后通过生成的 command adapter 使用 `/ontotect-help` |
| OpenCode | 重启，然后通过已安装 adapter 使用 `/ontotect-help` |
| Claude Code | 已存在的 skills 目录会热更新，可直接使用 `/ontotect-help`；只有会话启动后才新建顶层 `.claude/skills/` 目录时才需重启 |

有效目录只能证明结构安装。真实发现与行为要单独记录；entry 缺失时参见
[排查发现问题](troubleshooting-discovery.md)。

## 可选本体工具

installer 只需要 Node 或 Python 标准库。Ontotect 的辅助 ontology audit 可选使用 RDFLib
和 pySHACL，但加载 skill 本身不会安装它们。若所需 validator 或 reasoner 不可用，将检查
标为 `unverified`，或在改变环境前取得授权。
