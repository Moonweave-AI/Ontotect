---
type: how-to
status: draft
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 180
summary: 从源码、本地 npm 包、npx 或未来公开 npm release，把 Ontotect 安装到五种常见 Agent Skills 宿主。
canonical: docs/en/npm-and-npx-installation.md
related:
  - docs/zh-CN/installation.md
  - docs/decisions/0002-explicit-npm-installer.md
  - docs/zh-CN/npm-installer-security-review.md
  - package.json
supersedes: null
superseded_by: null
---

# npm 与 npx 安装

[English](../en/npm-and-npx-installation.md) · [文档首页](index.md) · 本页是英文 canonical 的简体中文镜像。

npm 包是同一个便携 `ontotect/` 目录的零依赖小型适配器；Python 和手动安装也使用该目录。获取包不会把技能安装到任何 Agent 宿主，因为不存在 npm 生命周期脚本；用户必须显式运行 `plan` 或 `install`。

## 当前 Preview：从源码树运行

只检查五个项目级目标，不写入：

```powershell
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

默认宿主集合为 `all`，默认范围为 `project`，默认项目根为当前工作目录。使用 `--json` 获取结构化输出；使用 `--dry-run` 让 `install` 只生成计划。

## 测试本地 npm 包

把当前源码包全局安装到本机：

```powershell
npm install --global .
ontotect plan --agents all --project-root .
ontotect install --agents all --project-root .
```

这使用当前 checkout，不是公共 registry release。不再需要时可运行 `npm uninstall --global ontotect` 删除全局命令。

维护者无需发布即可检查本地包：

```powershell
npm pack --dry-run --json
```

如需创建真实测试 tarball，只能放在已忽略的 `tmp/` 目录，检查内容后删除。

## 公共 npm 与 npx 命令

只有获授权维护者把 `ontotect` 发布到公共 npm registry 后，下列命令才可用：

```powershell
npx ontotect plan --agents all --scope project --project-root .
npx ontotect install --agents all --scope project --project-root .
```

也可先全局安装：

```powershell
npm install --global ontotect
ontotect install --agents all --scope project --project-root .
```

当前 Preview 尚未执行公开发布；在此之前请使用源码树或本地包命令。

## 目标路径

| 宿主 key | 项目级 | 用户级 |
|---|---|---|
| `cursor` | `.cursor/skills/ontotect/` | `~/.cursor/skills/ontotect/` |
| `codex` | `.agents/skills/ontotect/` | `~/.agents/skills/ontotect/` |
| `kilo` | `.kilo/skills/ontotect/` | `~/.kilo/skills/ontotect/` |
| `opencode` | `.opencode/skills/ontotect/` | `~/.config/opencode/skills/ontotect/` |
| `claude` | `.claude/skills/ontotect/` | `~/.claude/skills/ontotect/` |

`--scope user` 使用操作系统用户主目录；`--project-root` 不会重定向用户级安装。非标准目标应人工审阅后复制完整目录。

## 覆盖与更新

只要一个目标已存在，整个多宿主请求都会被阻止。先检查路径并保留本地工作，只有明确要替换或合并该生成安装时才使用 `--force`：

```powershell
ontotect install --agents cursor --project-root . --force
```

`--force` 覆盖同名文件，但保留目标中原有的无关额外文件。安装副本应视为生成镜像；canonical 修改应在源技能包中完成，而不是直接改镜像。

## 安装器不会做什么

- 不联网、不收集 telemetry、不运行本体工具、不启动 Agent 宿主。
- 不修改宿主设置、shell profile、package manifest 或本体文件。
- 不证明宿主发现或行为兼容。
- 不安装可选 Python/RDF 依赖。
- 不发布 npm 包或本体制品。

复制后请重新加载宿主，并执行[安装](installation.md)中的 discovery smoke test。安全设计与剩余风险见 [npm 安装器安全审查](npm-installer-security-review.md)。
