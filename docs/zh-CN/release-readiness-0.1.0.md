---
type: verification
status: pass-with-actions
owner: Moonweave-AI
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 30
summary: Ontotect 0.1.0 的发布质量报告、分阶段 rollout、回退路径与发布后检查。
canonical: docs/en/release-readiness-0.1.0.md
related:
  - docs/zh-CN/verification-record.md
  - docs/zh-CN/npm-installer-security-review.md
  - docs/decisions/0002-explicit-npm-installer.md
  - docs/decisions/0003-organization-scoped-npm-package.md
  - package.json
supersedes: null
superseded_by: null
---

# 发布就绪报告 — 0.1.0

[English](../en/release-readiness-0.1.0.md) · [文档首页](index.md) · 本页是英文 canonical 的简体中文镜像。

## 决策

**Pass with follow-up actions。** Ontotect 采用 MIT 许可证，ADR 0001、ADR 0002
与 ADR 0003 已接受，GitHub `main` 已同步，且
`@moonweave-ai/ontotect@0.1.0` 已发布到 npm。公共 registry metadata、匿名
获取、npx help 和五个宿主布局的隔离项目级安装均通过。

工作对象：公开 Release Operation。风险：**S4**。所需质量：**QA-L4**。
Owner 与发布权威：Moonweave-AI。执行 DRI：发布维护者。

## 发布范围

- GitHub 仓库：`Moonweave-AI/Ontotect`，分支 `main`。
- npm 包：`@moonweave-ai/ontotect@0.1.0`，public access；可执行命令为 `ontotect`。
- 许可证：原创仓库内容采用 MIT；第三方参考资料与被排除的私有研究语料继续适用
  各自条款。
- 分发内容：一个零依赖可执行程序，以及面向 Cursor、Codex、Kilo、OpenCode、
  Claude Code 目录的同一便携技能。
- 非目标：创建 GitHub Release、认证所有真实宿主、目标领域本体认证，以及在获取
  package 时自动修改宿主。

## 发布前证据（历史）

| 门禁 | 结果 |
|---|---|
| Python 仓库回归 | Pass：29 项测试 |
| Node/npm 安装器回归 | Pass：8 项测试，包括通过 npx 执行真实本地 tarball |
| Skill Creator 验证 | Pass |
| Package 白名单 | Pass：54 个预期条目（含 `LICENSE`）；语料、缓存、测试、临时、源文档或 tarball offender 为 0 |
| 依赖与生命周期边界 | Pass：零依赖，无 install/prepare 生命周期脚本 |
| 候选 secret 与本地路径扫描 | Pass：公开文件 0 命中 |
| GitHub 仓库访问 | Pass：账号已认证、目标是空的公开仓库、SSH remote 可访问 |
| npm 包名检查 | Pass：发布前未观察到已发布的 `@moonweave-ai/ontotect` 包 |
| npm 认证与组织权限 | Pass：已认证操作者是 `moonweave-ai` npm organization owner，并对现有组织包具有 read-write 权限 |

需要时采用文件与字节直接比较。本发布不增加密码学哈希验证、依赖固化、宿主版本
锁定或 package lock。

## 分阶段 Rollout 状态

1. **已完成：**初始化 `main`，审查 ignored 与 staged 文件，并创建有逻辑边界的本地 commits。
2. **已完成：**把 `main` 推送到公开 GitHub 仓库，验证远端 head 与公共 README。
3. **已完成：**复核 npm 认证、包名状态、测试和准确的 dry-run package 列表。
4. **已完成：**以 public access 发布 `@moonweave-ai/ontotect@0.1.0`。
5. **已完成：**registry metadata 报告 `0.1.0`、`latest` 与 MIT；匿名 registry 访问和公共 npx help 通过；五个隔离项目级宿主根全部安装，每个目标 48 个技能文件。
6. **已完成：**观察到的发布后证据已写入验证、安全和决策记录；文档提交后通过 Git
   检查远端 `main` 同步状态。

## 回退与事故响应

- 后续 npm 发布在任何门禁失败时都应于发布前停止。
- GitHub 缺陷通过审阅后的精确 revert 修正。
- package 已发布后发现缺陷时，优先 deprecate 受影响版本并发布修正 patch；不得
  假定 registry unpublish 可用或适当。
- secret、私有语料、来源不明可分发资产、生命周期自动执行或未声明网络行为触发
  Stop-Ship。

## 发布后检查与后续

公共 registry metadata 与项目级 npx 获取已通过。后续控制包括永久私密安全报告路径、npm
账号恢复文档、package provenance、CI、用户/全局范围安装，以及五个指定宿主中的真实
discovery/behavior 冒烟测试；没有执行证据的部分继续标为 `unverified`。
