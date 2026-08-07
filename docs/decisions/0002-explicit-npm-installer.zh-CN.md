---
type: decision
status: accepted
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 180
summary: 把 Ontotect 打包为零依赖 npm 可执行程序，由显式安装命令把便携技能复制到已审阅的宿主路径，且不使用生命周期脚本。
canonical: docs/decisions/0002-explicit-npm-installer.md
related:
  - package.json
  - bin/ontotect.js
  - docs/decisions/0003-organization-scoped-npm-package.md
  - docs/zh-CN/npm-and-npx-installation.md
  - docs/zh-CN/npm-installer-security-review.md
supersedes: null
superseded_by: null
---

# ADR 0002：显式 npm 与 npx 技能安装器

[English](0002-explicit-npm-installer.md) · 本文是英文 canonical 决策记录的简体中文镜像。

## 状态

本 ADR 于 2026-08-07 接受。项目采用 MIT 许可证，首次公开发布已获授权。ADR 0003 仅把原先拟定的非 scoped 包名修订为 `@moonweave-ai/ontotect`；可执行命令与本 ADR 的全部安全控制保持不变。

## 背景

Ontotect 已有便携 Agent Skills 目录和 Python 安装器。Cursor、Codex、Kilo、OpenCode、Claude Code 用户也期望熟悉的 npm 或 npx 入口。npm 分发引入供应链边界：获取包时不得静默执行安装器、擅自选择宿主、覆盖技能、联系其他服务或携带私有研究语料。

项目采用 MIT 许可证。npm 身份 metadata 必须与权威 `LICENSE` 一致，并且只有在 registry 验证成功后才能声称发布完成。

## 决定

1. 增加一个 npm 包，并提供名为 `ontotect` 的可执行命令。当前 package identity 按 ADR 0003 使用 `@moonweave-ai/ontotect`。
2. 只使用 Node.js 标准库；不声明 runtime、development、optional、peer 或 bundled dependencies。
3. 不提供 `preinstall`、`install`、`postinstall`、`prepare` 或其他包生命周期脚本。仅下载或全局安装包不会复制技能。
4. 必须显式运行：

   ```text
   ontotect install --agents <hosts> --scope <project|user>
   ```

5. 默认项目级。只接受固定宿主 `cursor`、`codex`、`kilo`、`opencode`、`claude`；`all` 展开为这五项。
6. 从已审阅的项目根目录或操作系统用户主目录解析目标，不提供任意 destination 参数。
7. `plan` 与 `--dry-run` 不写入。目标已存在时拒绝，除非显式给出 `--force`；`--json` 只改变报告格式，不增加权限。
8. 复制完整 `ontotect/` 技能包，同时排除临时缓存文件，并向用户报告源目录与目标目录。
9. 通过 `package.json` 的 `files` 白名单只包含可执行程序、可分发技能、公开 README 及 README 使用的本地 banner。不得打包 `book/`、`paper/`、`tools/`、`book-to-skill/`、`tmp/`、测试、本地运行状态或提取全文。
10. npm metadata 使用 `MIT` 并包含权威项目 `LICENSE`。npm 必需的语义版本只是分发 metadata，不是依赖固化，也不是稳定发布声明。
11. 未经明确发布授权且 registry 检查未成功，不发布到 npm、不创建 release，也不声称公共 registry 获取已可用。2026-08-07 的发布记录已为 `0.1.0` 提供授权；实际执行证据写入验证记录。

## 宿主目标路径

| 宿主 | 项目级 | 用户级 |
|---|---|---|
| Cursor | `.cursor/skills/ontotect/` | `~/.cursor/skills/ontotect/` |
| Codex | `.agents/skills/ontotect/` | `~/.agents/skills/ontotect/` |
| Kilo | `.kilo/skills/ontotect/` | `~/.kilo/skills/ontotect/` |
| OpenCode | `.opencode/skills/ontotect/` | `~/.config/opencode/skills/ontotect/` |
| Claude Code | `.claude/skills/ontotect/` | `~/.claude/skills/ontotect/` |

这些是安装器目标，不保证真实产品已经发现技能或完成行为验证。

## 后果

### 正面

- 同一命令可从源码、本地 tarball、未来 npm 包或全局安装运行。
- 不增加依赖树、生命周期自动执行或隐藏网络行为。
- 五个宿主继续共享同一个 canonical 便携目录。
- Dry-run、固定目标、显式覆盖和包白名单让安装可检查。

### 成本与局限

- npm 即使没有依赖固化，也必须有 package version。
- 用户获取包后必须再运行一个显式命令。
- 只有获授权的 package publication 在 registry 成功后，公共 scoped npx 安装才能工作。
- 外部宿主发现与行为仍需独立 live-host 测试。
- package metadata、仓库文档与权威 MIT 许可证必须保持同步。

## 考虑过的替代方案

### 自动 `postinstall`

拒绝，因为获取包会意外修改用户或项目技能目录，并隐藏宿主与覆盖选择。

### 每个宿主一个 npm 包

拒绝，因为会复制同一技能，并在五种分发之间制造语义漂移。

### 引入 CLI 框架或复制库

拒绝，因为所需参数解析和文件操作规模很小，引入依赖树只会增加不必要的供应链面。

### 接受任意目标路径

拒绝，因为安装器是宿主适配器，不是通用递归复制命令；非标准路径仍可手动复制。

## 验收证据

- Node 单元测试覆盖参数、dry-run、固定项目/用户映射、全宿主安装、逐字节复制、覆盖拒绝与错误路径。
- `npm pack --dry-run --json` 只显示预期白名单内容。
- 本地打包的 tarball 能执行 CLI，并在隔离目录安装五种布局。
- Python 与 npm 安装器的五个宿主标识映射一致。
- 包没有依赖或生命周期脚本。
- 双语安装、架构、安全和验证文档保持同步。

本地证据已执行并写入[验证记录](../zh-CN/verification-record.md)：8 项 Node 测试通过；MIT 发布候选 pack 含 54 个预期条目（包括 `LICENSE`），禁止的语料/缓存/测试制品为 0；真实本地 tarball 通过 npx 安装五个项目布局，每个目标 48 个文件与源文件逐字节直接一致。随后已成功执行公共 registry 发布、匿名 metadata 访问、公共 npx help，以及面向五个隔离宿主布局的项目级安装。真实宿主中的 discovery 与 behavior 仍为 `unverified`。
