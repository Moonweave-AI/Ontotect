---
type: decision
status: accepted
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 90
summary: 将一套 canonical Ontotect 工作流编译为多个可独立发现的 focused skills，并只在宿主 slash 发现确有缺口时增加轻量命令适配器。
canonical: docs/decisions/0004-host-discovery-and-command-adapters.md
related:
  - docs/decisions/0001-portable-command-router.md
  - bin/ontotect.js
  - ontotect/scripts/install_skill.py
  - ontotect/assets/skill-suite.json
  - ontotect/references/agent-compatibility.md
  - docs/zh-CN/troubleshooting-discovery.md
supersedes: null
superseded_by: null
---

# ADR 0004：可发现 Skill Suite 与命令适配器

[English](0004-host-discovery-and-command-adapters.md) · 本文是英文 canonical 决策记录的简体中文镜像。

## 状态

本决策于 2026-08-07 被接受，用于修复跨宿主发现问题。

## 背景

把 `@moonweave-ai/ontotect` 发布到 npm 只代表远端存在可获取的软件包，并不会在本地
Agent 中注册 skill。发生问题的机器上，所有已选择的项目级和用户级 skill 根目录中都没有
`ontotect`；软件包已经发布，但从未在这些目录中完成安装。

原有软件包只安装一个 super-skill，把模式和生命周期阶段作为内部命令。这适合自然语言
Router，却只会产生一个可发现入口，无法形成 Moonweave Governance Skills 截图中的系统化
slash selector。该参考体系的菜单来自多个独立 Agent Skills 与轻量宿主 command adapters，
而不是一个 super-skill 的内部动词。

宿主调用方式也不相同：

- Codex 使用 `$<skill-name>` 或 `/skills`，没有可创建通用 `/ontotect-review` 的正式项目级
  command 目录。
- Cursor 与 Claude Code 会把每个已安装 skill 原生暴露为 `/<skill-name>`。
- 当前 Kilo 构建能够把 skill 暴露为 slash command，同时其公开 workflow 接口也支持
  `.kilo/commands/`。
- OpenCode 稳定版文档把 skill 与 slash command 分开，后者使用 `.opencode/commands/`。

因此，软件包获取、本地安装、focused skill 发现、slash command 发现与宿主刷新是不同事实。

## 决策

1. 保持 `ontotect/SKILL.md` 及其 references 为 canonical 本体工程行为。ADR 0001 的命令、
   生命周期、证据与权限契约继续有效。
2. 在 `ontotect/assets/skill-suite.json` 中只定义一次公开套件：每个可发现 skill 的名称、
   显示名、触发描述、固定 canonical 命令与 UI 短描述。
3. 默认安装二十个 focused entries：
   - `ontotect`；
   - `ontotect-help`、`ontotect-router`、`ontotect-status`；
   - `ontotect-build`、`ontotect-review`、`ontotect-repair`、
     `ontotect-optimize`、`ontotect-refactor`、`ontotect-validate`、
     `ontotect-govern`、`ontotect-release`；
   - `ontotect-stage`，以及 `ontotect-charter`、`ontotect-reuse`、
     `ontotect-conceptualize`、`ontotect-formalize`、`ontotect-implement`、
     `ontotect-verify`、`ontotect-stage-release`。
4. 安装时复制完整 canonical skill 目录，为每个 focused entry 写入名称匹配的 `SKILL.md`、
   固定命令前言和对应 `agents/openai.yaml`。每个已安装 entry 都是自包含的，保留全部本地
   references、assets 与 scripts。
5. 默认使用 `--suite full`。希望维持最小发现面的用户可显式选择 `--suite core`，保留原有
   单 skill 安装。
6. 使用 `--commands auto` 时，从同一套件注册表生成 Kilo 与 OpenCode Markdown command
   adapters。每个 adapter 加载同名 focused skill 并转发 `$ARGUMENTS`，不复制本体工程
   语义。`--commands none` 禁止生成 adapters。
7. 不创建已弃用的 Codex custom prompts。Codex 中使用 `$ontotect-review`、
   `$ontotect-router` 或 `/skills`；Codex Desktop 也可能在 slash selector 中显示这些已安装
   focused skills。
8. Cursor 与 Claude 使用原生 skill slash entries，不再写入会造成重复或冲突的 legacy
   command tree。
9. 在写入前预检 core skill、每个 generated skill、每个 command 文件以及先前受管安装状态
   中记录的 stale target。拒绝 symlink/junction 路径逃逸与错误目标类型。任何 active target
   存在时，除非显式给出 `--force`，否则整个安装拒绝执行。所有输出先 staging，再通过 rename
   transaction 提交，并在提交期间使用 rollback backups。forced refresh 会干净替换受管目标，
   且只删除纯路径安装状态中记录的过期名称。共享 command 目录中的无关文件和未知 sibling
   skills 会被保留。
10. `plan` 保持只读，`list` 暴露完整注册表，只有显式 `install` 才产生写入。npm 获取与
    lifecycle hook 不会隐式安装文件。
11. 按宿主说明刷新与诊断。结构安装、UI 发现与行为执行仍属于不同证据层级。

## 与 Governance Skills 设计的对应关系

Moonweave Governance Skills 使用 focused skill directories、command map、轻量宿主 adapters、
platform target map 与 installer。Ontotect 采用相同职责分离，但使用更紧凑的编译模型：

- `skill-suite.json` 同时承担 focused-skill registry 与 command mapping；
- installer 从一套 canonical Ontotect 源编译 focused entries；
- generated skills 负责菜单与发现体系；
- Kilo/OpenCode Markdown 文件负责兼容命令；
- `list`、`plan` 与测试在写入前暴露生成契约。

Ontotect 不复制 Governance Skills 的 always-on governance rules、GitHub templates、哈希、
版本锁定或多语言重复菜单项，因为这些内容不能解决本体 skill 发现问题。

## 后果

### 正面

- Codex、Cursor 与 Claude 能枚举真实的 Ontotect skill 体系，而不是只有一个隐藏内部动词的
  入口。
- Kilo 与 OpenCode 在宿主版本没有自动把 skill 映射为 slash 时仍获得相同命令词汇。
- 每个 focused entry 都是自包含的；选择 `ontotect-review` 不依赖另一个 skill 被隐式加载。
- 一个注册表与一套 canonical workflow 在多个安装入口之间限制语义漂移。
- 不知道选择哪个 focused entry 的用户仍可使用 root Router。

### 成本与边界

- 完整安装会为每个所选宿主创建二十个 skill 目录，并为 Kilo/OpenCode 各增加二十个命令
  文件。
- 生成副本占用的本地空间多于单 skill，但 npm archive 仍只交付一套 canonical 源。
- Codex 的显式键入语法仍是 `$name`，不是所有版本都保证的 `/name` command。
- 文件系统测试只能证明结构安装；真实宿主发现和执行需要刷新会话并单独观察。

## 考虑过的替代方案

### 只保留一个 super-skill

不作为默认方案，因为它无法提供所需的系统化 skill-selector 表面；仍可通过
`--suite core` 使用。

### 手工维护二十份完整源码

拒绝，因为操作规则、references 与修正会发生漂移。installer 改为从一套 canonical 源和
一个注册表编译自包含副本。

### 只安装 command files，不创建 focused skills

拒绝，因为 Codex 没有可移植的项目级 command 目录，而且 commands 本身不会形成参考设计
中的 Agent Skills 菜单。

### 增加 postinstall hook

拒绝，因为获取软件包不应静默修改项目或用户配置；安装保持显式命令。

## 验收证据

- `ontotect list --json` 暴露二十个唯一的 skill-to-command mappings。
- 全宿主完整计划显示五个 core targets、五组各十九个 generated focused skills，以及两组
  各二十个 Kilo/OpenCode adapters。
- generated 目录名、`SKILL.md` 名称、固定命令和 OpenAI 显示 metadata 与注册表一致。
- 每个 generated skill 都包含 canonical references、assets 与本体工程 scripts；focused copy
  会有意排除嵌套的分发安装器。
- `--suite core` 和 `--commands none` 提供显式最小路径。
- 没有 `--force` 时，任何既有 core skill、focused skill 或 command 文件都会阻止全部写入。
- symlink/junction 路径逃逸与错误目标类型会在 staging 前失败；干净 force refresh 会删除
  state 中记录的 stale entries，并保留未知 siblings。
- 本地打包后的 npm archive 在隔离项目中完成完整矩阵安装。
- canonical skill 以及代表性或全部 generated entries 通过 Skill Creator 验证。
- 只有在刷新并实际观察宿主后，才报告 live-host UI discovery 结果。

本决策不引入 checksum、依赖固化、宿主版本锁定或密码学 manifest。
