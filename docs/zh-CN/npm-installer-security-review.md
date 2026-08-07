---
type: security-review
status: active
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 90
summary: 对 Ontotect 显式、零依赖 npm 与 npx 安装器进行 S4、QA-L4 安全审查。
canonical: docs/en/npm-installer-security-review.md
related:
  - docs/decisions/0002-explicit-npm-installer.md
  - docs/decisions/0003-organization-scoped-npm-package.md
  - package.json
  - bin/ontotect.js
  - SECURITY.zh-CN.md
supersedes: null
superseded_by: null
---

# npm 安装器安全审查

[English](../en/npm-installer-security-review.md) · [文档首页](index.md) · 本页是英文 canonical 的简体中文镜像。

## 审查决定

工作对象：公共 Agent skill 分发 Feature。风险：**S4**，因为包管理器可执行程序能够写入项目或用户 Agent 配置。所需质量：**QA-L4**。Owner：项目维护者。审查 DRI：实现维护者。

历史公开 0.1.1 制品与当前源码候选是两个独立证据对象。当前源码设计在下列控制下可用于
本地安装，但尚不是已发布的 suite release。任何后续发布仍需显式授权、package 检查、
registry 验证与发布后检查。installer tests 或路径控制失败时结论为 `revise`；若私有语料、
秘密、来源不明资产、lifecycle 自动执行或未声明网络操作进入包，则触发 Stop-Ship。

## 资产与安全目标

| 资产 | 目标 |
|---|---|
| Canonical `ontotect/` 源与套件注册表 | 复制预期公共源，并且只编译 20 个已审阅入口，不暗中加入可执行内容 |
| 项目及用户技能/命令根目录 | 仅在显式命令后写入已选择的固定宿主目标 |
| 现有宿主配置 | 预检每个计划中的技能目录和命令文件；未给出 `--force` 时任何冲突都不得写入 |
| 私有研究语料 | 书籍、论文、工具 PDF、提取全文和临时分析不得进入 npm tarball |
| 用户项目与凭据 | 不扫描无关内容、不执行仓库内指令、不联系远程服务、不收集 telemetry |

## 信任边界

```text
npm registry / 本地 tarball
          |
          v
      包文件白名单
          |
          v
显式 Node CLI 调用 -------- 用户选择的参数
          |
          v
固定宿主根目录解析器 ------ 文件系统边界
          |
          +---- 项目或用户 skills/ontotect* 目录
          |
          +---- 已审阅的 Kilo/OpenCode command 文件
```

获取 npm 包不等于安装到 Agent 宿主。只有用户显式调用 `ontotect install` 时才跨越安全相关边界。

## 威胁、滥用途径与控制

| 威胁或误用 | 控制 | 验证要求 |
|---|---|---|
| 获取包时静默修改宿主 | 无 npm 生命周期脚本；只能显式运行 `install` | 检查 `package.json`；获取本地包但不调用 CLI |
| 依赖或传递包被攻陷 | 无声明依赖，只用 Node 标准库 | 检查全部 dependency 字段和 package tree |
| 意外发布语料或秘密 | `files` 白名单与 tarball 内容检查 | `npm pack --dry-run --json`；拒绝私有目录、临时输出、环境文件、凭据、测试和 PDF |
| 任意路径写入 | 固定宿主映射与 registry names；项目根或 OS 用户目录是 anchor；通过 `lstat`、解析后 containment 与目标类型规则检查已有组件 | 测试全部项目/用户目标、错误参数、symlink/junction roots 与 exact-target links |
| 意外或部分覆盖 | 全局预检每个 root skill、focused skill、command file 与受管 stale target；全部输出先 staging，再通过带 rollback backups 的 rename transaction 提交 | 预置靠后的冲突与错误目标类型，确认前面的目标也未创建；测试干净 force refresh 并保留未知 siblings |
| Dry-run 实际写入 | 计划与应用路径分离 | 比较隔离根目录 dry-run 前后状态 |
| 源路径逃逸或复制缓存垃圾 | 源目录从包位置解析；排除临时缓存名 | 将目标相对文件集及字节与源技能直接比较 |
| 隐藏网络或 telemetry | CLI 不使用网络 API，不含 analytics | 静态检查 imports，并执行隔离的本地 tarball |
| 把结构复制误认为宿主认证 | CLI 和文档只报告安装；discovery 和 behavior 保持 `unverified` | 检查文档及输出 |
| 被复制 reference 内含恶意指令 | 复制不执行内容；Agent 宿主继续负责权限边界 | 确认加载技能或获取包时不运行脚本 |

## 权限与修改模型

- 默认 `project`；用户级写入必须给出 `--scope user`。
- `plan` 与 `--dry-run` 只读。
- `install` 只在固定技能根目录下创建已注册的 `ontotect` / `ontotect-*` 目录，并在
  `auto` 模式下于固定 Kilo/OpenCode command roots 创建同名 Markdown command 文件。
- `--force` 只授权干净替换这些精确受管技能目录、替换这些精确命令文件，并且只删除
  先前 Ontotect state 中记录的过期名称；不授权任意文件系统写入，也不删除未知 siblings。
- 安装器不修改宿主设置、shell profile、仓库 manifest 或本体文件。
- 远程发布、身份验证、registry ownership 和 npm provenance 不属于 CLI，必须进入独立授权的发布操作。

## 剩余风险

- npm 包名可能受到 typosquatting；公开发布后，用户仍需核对预期包及发布者。
- 任何包分发都可能受到发布者账号或 registry 被攻陷的影响；项目尚未建立 npm ownership 与恢复 runbook。
- 用户可主动使用 `--force` 覆盖已安装副本中的本地修改；canonical 工作应保存在生成安装镜像之外的源码控制中。
- Symlink、ACL、并发进程、磁盘写满或恶意本地管理员等文件系统行为不能由这个小型安装器完全消除。
- MIT 许可证适用于 Ontotect 的原创仓库内容；它不会重新许可第三方参考资料或被排除的私有研究材料。

## 所需证据

本地验收前：

1. 运行 Node 单元测试；
2. 检查 `npm pack --dry-run --json`；
3. 在已忽略临时目录创建 tarball，并针对隔离项目根运行其 binary；
4. 直接比较 canonical payload files，根据 registry 验证 generated `SKILL.md` 与 metadata，
   并根据 template 验证 command adapters；
5. 运行仓库文档、Skill Creator 及现有 Python 回归；
6. 在[验证记录](verification-record.md)写入结果与边界。

公开发布还需验证 npm 认证与 package ownership，记录发布权限和 MIT 许可证，检查准确的公开包，并记录账号恢复、package provenance 与私密漏洞报告路径。`0.1.0` 与 `0.1.1` 发布作为历史证据保留如下；active `0.1.2` 候选记录在 [release-readiness-0.1.2.md](release-readiness-0.1.2.md)。不可用的控制必须保持明确，不能从命令成功推断。

## 首次 0.1.0 验证结果 — 2026-08-07

六项本地证据均已执行。首次 pack 检查发现两个生成的 `.pyc` 文件并正确阻止验收，随后把 scripts 白名单收紧为公共 Python 源文件。MIT 发布候选 pack 包含 54 个预期条目（包括 `LICENSE`），禁止的语料、缓存、测试、临时、文档源或 tarball 文件为 0。8 项 Node 测试通过，其中真实本地 tarball 以 offline 和 ignore-scripts 模式经 npx 针对五个项目根执行；五份安装技能各含 48 个文件，并与 canonical 源逐字节直接一致。

首次结果：发布分发控制集为 **pass with follow-up actions**。ADR 0002 与 ADR 0003 已接受，项目采用 MIT，`@moonweave-ai/ontotect@0.1.0` 已发布。Registry metadata 报告 `0.1.0`、`latest` 与 MIT，组织权限为 read-write；匿名访问、公共 npx help 与五个宿主布局的隔离项目级安装均通过，每个目标 48 个文件。

## 0.1.1 补丁验证结果 — 2026-08-07

已审阅源码候选通过 29 项 Python 测试、8 项 Node 测试、Skill Creator 验证、生成技能 advisory scan，以及 0 warning 的 Claude、Amp 与 Copilot 静态 lenses。Dry-run package 检查报告 55 个预期条目、0 个禁止条目、零依赖和零生命周期脚本。通过不存在的 user npm 配置查询公共包：精确 metadata 报告 0.1.1、MIT、`ontotect` 可执行命令与 Moonweave-AI 仓库，`latest` 指向 0.1.1。精确版本公共 npx help 退出码为 0。五个隔离项目级宿主布局均安装 48 个文件并包含 `SKILL.md`，其相对文件集与直接字节内容一致。npm 页面正确呈现居中品牌标识、横幅、版本徽章、新版 README 与仓库链接。

0.1.1 制品的历史结论：发布分发控制集为 **pass with follow-up actions**。0.1.0 与
0.1.1 证据是不可变历史，不能作为 0.1.2 的证据。

## 0.1.2 focused-suite release candidate — 2026-08-07

当前源码树增加声明式 20-entry registry、生成式 focused skills、Kilo/OpenCode command
adapters、`list` 与扩展后的 `plan` 输出、full/core 套件模式、解析路径/类型预检、纯路径
受管状态、干净 forced refresh，以及带 rollback backups 的 staged transaction commit。
focused copies 会排除嵌套的分发安装器。本次修复是 0.1.2 candidate 的有界范围，不属于
历史 0.1.1；本地测试证据写入 active 验证记录，精确公共 registry 行为与其余真实宿主
UI discovery 仍是独立 gate。
