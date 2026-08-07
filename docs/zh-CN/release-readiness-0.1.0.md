---
type: verification
status: conditional-go
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
  - package.json
supersedes: null
superseded_by: null
---

# 发布就绪报告 — 0.1.0

[English](../en/release-readiness-0.1.0.md) · [文档首页](index.md) · 本页是英文 canonical 的简体中文镜像。

## 决策

**Conditional Go。** Owner 已选择 MIT 许可证、接受 ADR 0001 与 ADR
0002，并授权首次公开 GitHub 与 npm 发布。完成干净的暂存审查后可推送仓库；npm
发布必须等待已认证的 registry 身份，并在发布后完成 registry 与公共 npx 验证。

工作对象：公开 Release Operation。风险：**S4**。所需质量：**QA-L4**。
Owner 与发布权威：Moonweave-AI。执行 DRI：发布维护者。

## 发布范围

- GitHub 仓库：`Moonweave-AI/Ontotect`，分支 `main`。
- npm 包：`ontotect@0.1.0`，public access。
- 许可证：原创仓库内容采用 MIT；第三方参考资料与被排除的私有研究语料继续适用
  各自条款。
- 分发内容：一个零依赖可执行程序，以及面向 Cursor、Codex、Kilo、OpenCode、
  Claude Code 目录的同一便携技能。
- 非目标：创建 GitHub Release、认证所有真实宿主、目标领域本体认证，以及在获取
  package 时自动修改宿主。

## 发布前证据

| 门禁 | 结果 |
|---|---|
| Python 仓库回归 | Pass：29 项测试 |
| Node/npm 安装器回归 | Pass：8 项测试，包括通过 npx 执行真实本地 tarball |
| Skill Creator 验证 | Pass |
| Package 白名单 | Pass：54 个预期条目（含 `LICENSE`）；语料、缓存、测试、临时、源文档或 tarball offender 为 0 |
| 依赖与生命周期边界 | Pass：零依赖，无 install/prepare 生命周期脚本 |
| 候选 secret 与本地路径扫描 | Pass：公开文件 0 命中 |
| GitHub 仓库访问 | Pass：账号已认证、目标是空的公开仓库、SSH remote 可访问 |
| npm 包名检查 | Pass：发布前未观察到已发布的 `ontotect` 包 |
| npm 认证 | 发布前预检受阻：registry 返回 `E401 Unauthorized`；发布前必须复核 |

需要时采用文件与字节直接比较。本发布不增加密码学哈希验证、依赖固化、宿主版本
锁定或 package lock。

## 分阶段 Rollout

1. 初始化 `main`，审查 ignored 与 staged 文件，并创建有逻辑边界的本地 commits。
2. 把 `main` 推送到空的公开 GitHub 仓库，验证远端 head 与公共 README。
3. 复核 npm 认证、包名状态、测试和准确的 dry-run package 列表。
4. 以 public access 发布 `ontotect@0.1.0`。
5. 验证 registry metadata、公共 package 内容，并在隔离五宿主项目根执行干净的
   `npx` 安装。
6. 用观察到的发布证据更新验证与安全记录，提交该记录并再次推送 `main`。

## 回退与事故响应

- npm 发布前任何门禁失败都应停止，不修改 registry。
- GitHub 缺陷通过审阅后的精确 revert 修正。
- package 已发布后发现缺陷时，优先 deprecate 受影响版本并发布修正 patch；不得
  假定 registry unpublish 可用或适当。
- secret、私有语料、来源不明可分发资产、生命周期自动执行或未声明网络行为触发
  Stop-Ship。

## 发布后检查与后续

Rollout 到达第 5 步前，发布后结果保持 `unverified`。后续控制包括永久私密安全
报告路径、npm 账号恢复文档、CI，以及五个指定宿主中的真实 discovery/behavior
冒烟测试。
