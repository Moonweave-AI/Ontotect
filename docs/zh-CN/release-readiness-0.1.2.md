---
type: verification
status: active
owner: Moonweave-AI
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 30
summary: Ontotect 0.1.2 的发布质量报告、分阶段 rollout、回退路径、发布说明与公共验证计划。
canonical: docs/en/release-readiness-0.1.2.md
related:
  - docs/zh-CN/release-readiness-0.1.1.md
  - docs/zh-CN/verification-record.md
  - docs/zh-CN/npm-installer-security-review.md
  - docs/decisions/0002-explicit-npm-installer.md
  - docs/decisions/0003-organization-scoped-npm-package.md
  - docs/decisions/0004-host-discovery-and-command-adapters.md
  - package.json
supersedes: null
superseded_by: null
---

# 发布就绪报告 — 0.1.2

[English](../en/release-readiness-0.1.2.md) · [文档首页](index.md) · 本页是英文 canonical 的简体中文镜像。

## 决策

**Conditional Go。** 本体工程实现、focused-suite compiler、跨宿主安装控制、文档与
本地 release candidate 已通过当前可执行的 QA-L4 门禁。只有在最终 `0.1.2` 候选完成
commit、同步到 GitHub `main`、从干净工作树重新测试，并确认 npm registry 中不存在该
版本后才可发布。Registry 发布与公共包检查必须等实际执行后才能记为通过。

工作对象：公开 Release Operation。风险：**S4**。所需质量：**QA-L4**。成熟度：
**M7 公开预览 focused-suite release**。Owner 与发布权威：Moonweave AI。执行 DRI：
发布维护者。ADR 0002 定义显式安装，ADR 0003 定义组织 package identity，ADR 0004
定义宿主发现与 command adapters；本次有界发布无需新增 RFC 或 ADR。

## 发布说明

`0.1.2` 是首个提供完整可发现 skill suite 的 Ontotect 公开版本：

- 从一套 canonical 本体工程工作流生成 20 个可独立发现的 `ontotect*` entries；
- 提供独立 Help、Router、Status、工程模式和生命周期阶段 skills；
- 根入口采用条件分发：空请求 → Help，显式命令 → 保留，否则 → Router；
- 原生安装到 Cursor、Codex、Kilo、OpenCode 与 Claude Code；
- 为 Kilo 与 OpenCode 各生成 20 个同名 slash-command adapters；
- 支持 full/core suite、project/user scope、list/plan/install、JSON、dry-run 与显式受管刷新；
- 提供全局预检、解析后路径边界、干净受管替换、事务回滚和有界 Windows 占用重试；
- 完成中英双语安装、兼容性、命令、架构、安全和 discovery 排障文档。

`0.1.1` 继续作为历史单技能 installer 保留。既有用户需要升级、使用 `--force` 重新安装，
并刷新宿主。本报告是 canonical `0.1.2` release note；仓库不单独维护 changelog。

## 发布范围

- GitHub 仓库：`Moonweave-AI/Ontotect`；权威分支 `main`。
- npm package：`@moonweave-ai/ontotect@0.1.2`，public access；executable 为
  `ontotect`。
- 预期 archive：57 个白名单文件、MIT、零运行时依赖，无 install、preinstall、prepare
  或 postinstall 生命周期脚本。
- 支持布局：Cursor、Codex、Kilo、OpenCode 与 Claude Code。
- 排除内容：私有书籍、论文、工具文档语料、提取文本、缓存、测试、临时文件、PDF 与
  本地运行状态。
- 非目标：捆绑 reasoner、安装时执行本体工作、获取 package 时静默修改 Agent roots、
  认证每个宿主 UI，或把 suite 重命名为 `ontology`。

## 发布质量报告

| 门禁 | 候选结果 |
|---|---|
| Python 仓库回归 | 通过：41 项测试 |
| Node/npm installer 回归 | 通过：14 项测试，包括真实本地 packed npx 安装 |
| 语法与 diff 检查 | 通过：Node syntax、Python byte compilation 与 Git whitespace check |
| Skill 结构 | 通过：源码加 20 个已安装 Codex entries，21/21 |
| Generated-skill advisory scan | 通过：源码加已安装 entries，21/21 |
| 静态宿主 lenses | 通过：Claude、Amp、Copilot，60/60 |
| 五宿主用户级安装 | 通过：每个宿主精确 20 skills；Kilo/OpenCode 各 20 adapters；事务工作文件为 0 |
| 事务与路径控制 | 通过：冲突/类型/symlink 预检、受管刷新、未知 sibling 保留、回滚注入与有界瞬态重试 |
| Package 白名单 | 最终 commit 前通过：57 个预期条目，禁止语料、缓存、测试、临时、PDF 与依赖条目为 0；干净 `main` 上需复跑 |
| Package identity | 通过：`@moonweave-ai/ontotect`、`author: Moonweave AI`、MIT、public access、Moonweave-AI repository |
| Registry 版本可用性 | 通过：发布前精确 `0.1.2` 查询返回 `E404` |
| npm 组织写入权限 | 通过：已认证账号对 `@moonweave-ai/ontotect` 有 read-write 权限 |
| GitHub `main` 同步 | 等待最终 release commits 与 push |
| 公共 npm/npx 行为 | 等待发布；不得从本地 archive 推断 |

当前 Codex runtime 刷新后已枚举全部 20 个 `ontotect*` entries。五个宿主的文件系统安装
已证明；Cursor、Kilo、OpenCode 与 Claude Code 的真实 slash 菜单观察仍为 `unverified`，
但不阻断本次 preview package 发布。

## 分阶段 Rollout

1. **已完成：**实现并记录 discovery 修复；保留 canonical 源，通过 registry 编译 focused entries。
2. **已完成：**执行本地 QA-L4 测试、validators、package 检查、安全边界、五宿主安装和独立审查。
3. **进行中：**按逻辑阶段提交 `0.1.2` 候选，推送 feature branch，fast-forward `main`，
   并验证本地/远端同步。
4. **待执行：**从干净 `main` 复跑测试并检查准确 archive。
5. **待执行：**复核 npm 组织权限与版本可用性，再以 public access 发布
   `@moonweave-ai/ontotect@0.1.2`。
6. **待执行：**验证精确版本 metadata、`latest`、匿名 help/list 和公共包五宿主隔离安装。
7. **待执行：**把真实公共证据写回本报告、验证记录、安全审查、组织包 ADR、Security
   状态与来源证据登记，并 commit/push。

## 回退与事故响应

- 发布前任一 QA-L4 门禁失败都应停止并修复候选。
- 发布后不得假定 npm unpublish 可用或适当。需要时 deprecate 缺陷版本；若 registry
  policy 允许，将 `latest` 恢复到已验证版本，并发布修正 patch。
- 使用经过审查的 forward commit revert 有缺陷的仓库变更。
- secret、私有语料、来源不明资产、生命周期自动执行、未声明网络行为、错误 package
  scope 或组织权限丢失均触发 Stop-Ship。

## 发布后验证清单

- 精确 registry metadata 报告 `0.1.2`、MIT、`ontotect` executable 与 Moonweave-AI
  repository；`latest` 指向 `0.1.2`。
- 匿名 `npx @moonweave-ai/ontotect@0.1.2 help` 与 `list` 成功退出。
- 公共包隔离安装为五个宿主各创建精确 20 个 skills，并为 Kilo/OpenCode 各创建 20 adapters。
- 公共 npm 与 GitHub README 展示 `0.1.2` 安装流程，而不是历史源码 workaround。
- 发布后证据 commit 已存在于 `main`，且本地与远端同步。
