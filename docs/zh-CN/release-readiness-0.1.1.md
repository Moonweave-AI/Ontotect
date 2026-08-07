---
type: verification
status: conditional-go
owner: Moonweave-AI
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 30
summary: Ontotect 0.1.1 补丁候选的发布前质量报告、rollout 计划、回退路径与发布后门禁。
canonical: docs/en/release-readiness-0.1.1.md
related:
  - docs/zh-CN/release-readiness-0.1.0.md
  - docs/zh-CN/verification-record.md
  - docs/zh-CN/npm-installer-security-review.md
  - docs/decisions/0002-explicit-npm-installer.md
  - docs/decisions/0003-organization-scoped-npm-package.md
  - package.json
supersedes: null
superseded_by: null
---

# 发布就绪报告 — 0.1.1

[English](../en/release-readiness-0.1.1.md) · [文档首页](index.md) · 本页是英文 canonical 的简体中文镜像。

## 决策

**Conditional Go — 发布前。** Ontotect 0.1.1 是一个补丁候选，用于把新版
README、品牌资产与相关文档同步到 npm 分发包。只有下列候选测试、包内容检查、组织
权限和 Git 同步门禁均被实际执行并记录为通过后，才可发布。所有尚未由发布 DRI
实际执行的候选结果都明确标为 `unverified`。

工作对象：公开 Release Operation。风险：**S4**。所需质量：**QA-L4**。
成熟度：**M6 公开预览补丁候选**。Owner 与发布权威：Moonweave-AI。执行 DRI：
发布维护者。本次需要 Release Gate 与发布后验证；只涉及呈现的补丁在范围不扩张时
无需新 RFC 或 ADR。

## 发布范围

- GitHub 仓库：`Moonweave-AI/Ontotect`，分支 `main`。
- npm 候选：`@moonweave-ai/ontotect@0.1.1`，public access；可执行命令为
  `ontotect`。
- 变更范围：把修改后的中英文 README 体验、品牌资产与支持文档同步进 npm package。
- 预期包形态：55 个预期条目、零运行时依赖，且没有 install、prepare、preinstall
  或 postinstall 生命周期脚本。
- 许可证与身份：MIT；持久包身份继续使用 `@moonweave-ai` organization scope。
- 兼容目标：Cursor、Codex、Kilo、OpenCode 与 Claude Code 布局。
- 非目标：改变 Ontotect 命令行为、扩展本体工程语义、新建 package scope、取代
  0.1.0 历史记录，或认证所有真实宿主环境。

已发布的 `0.1.0` 证据继续作为不可变历史保留。本报告不改写也不 supersede 0.1.0
的发布就绪记录。

## 候选证据

| 门禁 | 发布前结果 |
|---|---|
| 已识别候选 commit 与干净工作树 | `unverified`；仅在已审阅候选提交并合并后完成 |
| Python 仓库回归 | 通过：29 项测试 |
| Node/npm 安装器回归，包括通过 npx 执行本地 tarball | 通过：8 项测试 |
| Skill Creator 与生成技能验证 | 通过：Skill Creator 有效；advisory scan 通过；Claude、Amp 与 Copilot lenses 均为 0 warning |
| Package 白名单 | 通过：55 个预期条目，且私有语料、缓存、测试、临时、源文档、lockfile 和 tarball offender 为 0 |
| 依赖与生命周期边界 | 通过：零依赖、零生命周期脚本 |
| 候选 secret、本地路径与可分发资产审查 | 通过：扫描 106 个公开候选文件；secret pattern 与本地绝对路径文件均为 0 |
| Packed metadata 中的 MIT 与 `@moonweave-ai` 组织 scope | 通过 |
| npm 认证与组织写入权限 | 通过：已认证发布者是 Moonweave-AI 组织 owner，对 package 具有 read-write 权限 |
| Registry 确认 0.1.1 尚未发布 | 通过：发布前精确版本查询返回 `E404` |
| 发布前 GitHub `main` 同步 | `unverified` |

需要时可采用文件与字节直接比较。本补丁不引入密码学哈希验证、依赖固化、宿主版本
锁定或 package lock。

## 分阶段 Rollout

1. **已完成：**冻结 0.1.1 候选范围，审查准确的 Git diff 与 ignored-file 边界；
   commit 与干净工作树检查仍是后续门禁。
2. **已完成：**完整执行 Python、Node/npm、Skill Creator、package 白名单、
   secret/path 与安装器验证套件。
3. **已完成：**检查准确的 npm dry-run package，确认 55 个预期条目、MIT、组织
   scope、零依赖与无生命周期脚本。
4. **待执行：**提交候选并推送到 `main`；确认本地与远端 head 一致，并检查公开
   README 与品牌资产渲染。
5. **待执行：**复核 npm 身份、Moonweave-AI 组织权限与 registry 可用性；以 public
   access 发布 `@moonweave-ai/ontotect@0.1.1`。
6. **待执行：**验证公共 registry metadata 与 `latest`，随后在隔离环境中匿名获取
   package 并通过 npx 执行。
7. **待执行：**对五种支持的宿主布局执行隔离项目级安装，并记录观察到的文件数与
   help 输出。
8. **待执行：**更新 canonical 验证与安全记录，提交发布后证据、推送，并确认远端
   `main` 同步。

任何候选门禁失败都会把决策改为 **No-Go**，直至完成修复并重新执行。不得把任何
未验证结果表示为通过。

## 回退与事故响应

- 发布前停止 rollout，只修正或回退候选变更；继续将
  `@moonweave-ai/ontotect@0.1.0` 作为已知公开版本。
- GitHub 呈现存在缺陷时，revert 对应的已审阅 commit 并推送该 revert。
- 0.1.1 发布后发现 package 缺陷时，应在适当情况下 deprecate 该版本；若 registry
  policy 允许，将 `latest` 恢复到已验证版本，并发布修正 patch。不得假定 npm
  unpublish 可用或适当。
- secret、私有语料、来源不明可分发资产、生命周期自动执行、未声明网络行为、错误
  package scope 或组织权限丢失均触发 Stop-Ship。

## 发布后门禁

发布 DRI 记录以下全部结果之前，本次发布不算完成：

- Registry metadata 报告 `@moonweave-ai/ontotect@0.1.1`、MIT、`ontotect`
  可执行命令，并且 `latest` 指向 0.1.1。
- 匿名公共 metadata 访问与隔离公共 npx help 均通过。
- Cursor、Codex、Kilo、OpenCode 与 Claude Code 布局的项目级安装均通过，且预期
  技能文件存在。
- GitHub 与 npm 正确呈现目标英文 README、品牌资产、组织身份、链接和安装命令。
- 验证记录、npm 安装器安全审查与本报告已写入观察证据；本地与远端 `main` 一致。
- 任一回归都触发回退路径，并形成有记录的后续行动。

在以上结果被记录前，所有发布后门禁均为 `unverified`。
