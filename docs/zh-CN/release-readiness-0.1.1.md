---
type: verification
status: pass-with-actions
owner: Moonweave-AI
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 30
summary: Ontotect 0.1.1 的发布质量报告、已完成 rollout、回退路径与发布后证据。
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

**Pass with follow-up actions。** Ontotect 0.1.1 已在 Moonweave AI 组织 scope 下
以 public access 发布。GitHub `main` 在发布提交 `2351760` 处完成同步。官方 registry
报告精确版本 `0.1.1`、`latest` 为 `0.1.1`、MIT、`ontotect` 可执行命令以及
`Moonweave-AI/Ontotect` 仓库；匿名 metadata 访问成功。公共 npx help 与五种宿主
布局的隔离项目级安装均已通过。npm 页面正确呈现居中品牌标识、横幅、版本徽章与
新版 README。真实宿主加载、用户/全局范围安装、npm 账号恢复、package provenance
与永久私密安全报告路径仍是 `unverified` 后续控制。

工作对象：公开 Release Operation。风险：**S4**。所需质量：**QA-L4**。
成熟度：**M6 公开预览补丁发布**。Owner 与发布权威：Moonweave-AI。执行 DRI：
发布维护者。本次需要 Release Gate 与发布后验证；只涉及呈现的补丁在范围不扩张时
无需新 RFC 或 ADR。

## 发布范围

- GitHub 仓库：`Moonweave-AI/Ontotect`，分支 `main`。
- npm package：`@moonweave-ai/ontotect@0.1.1`，public access；可执行命令为
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

## 发布证据

| 门禁 | 发布前结果 |
|---|---|
| 已识别候选 commit 与干净工作树 | 通过：已审阅候选以 `2351760` 合并；发布前工作树干净 |
| Python 仓库回归 | 通过：29 项测试 |
| Node/npm 安装器回归，包括通过 npx 执行本地 tarball | 通过：8 项测试 |
| Skill Creator 与生成技能验证 | 通过：Skill Creator 有效；advisory scan 通过；Claude、Amp 与 Copilot lenses 均为 0 warning |
| Package 白名单 | 通过：55 个预期条目，且私有语料、缓存、测试、临时、源文档、lockfile 和 tarball offender 为 0 |
| 依赖与生命周期边界 | 通过：零依赖、零生命周期脚本 |
| 候选 secret、本地路径与可分发资产审查 | 通过：扫描 106 个公开候选文件；secret pattern 与本地绝对路径文件均为 0 |
| Packed metadata 中的 MIT 与 `@moonweave-ai` 组织 scope | 通过 |
| npm 认证与组织写入权限 | 通过：已认证发布者是 Moonweave-AI 组织 owner，对 package 具有 read-write 权限 |
| Registry 确认 0.1.1 尚未发布 | 通过：发布前精确版本查询返回 `E404` |
| 发布前 GitHub `main` 同步 | 通过：发布前本地 `main` 与 `origin/main` 均为 `2351760` |

需要时可采用文件与字节直接比较。本补丁不引入密码学哈希验证、依赖固化、宿主版本
锁定或 package lock。

## 分阶段 Rollout

1. **已完成：**冻结 0.1.1 候选范围，审查准确的 Git diff 与 ignored-file 边界；
   commit 与干净工作树检查仍是后续门禁。
2. **已完成：**完整执行 Python、Node/npm、Skill Creator、package 白名单、
   secret/path 与安装器验证套件。
3. **已完成：**检查准确的 npm dry-run package，确认 55 个预期条目、MIT、组织
   scope、零依赖与无生命周期脚本。
4. **已完成：**提交候选并推送到 `main`；确认本地与远端 head 一致，并检查公开
   README 与品牌资产渲染。
5. **已完成：**复核 npm 身份、Moonweave-AI 组织权限与 registry 可用性；以 public
   access 发布 `@moonweave-ai/ontotect@0.1.1`。
6. **已完成：**验证公共 registry metadata 与 `latest`，随后在隔离环境中匿名获取
   package 并通过 npx 执行。
7. **已完成：**对五种支持的宿主布局执行隔离项目级安装，并记录观察到的文件数与
   help 输出。
8. **通过本次文档变更完成：**更新 canonical 验证与安全记录；合并后的文档 PR
   记录该写回，并在合并后检查远端 `main` 同步。

全部发布前门禁均已通过。未来出现回归时触发回退路径；完成修复并重新执行前，不得
把该结果表示为通过。

## 回退与事故响应

- 发布前，`@moonweave-ai/ontotect@0.1.0` 保持为最后一个已知公开版本。0.1.1
  已发布后，package 缺陷按照下述已发布包回退路径处理。
- GitHub 呈现存在缺陷时，revert 对应的已审阅 commit 并推送该 revert。
- 0.1.1 发布后发现 package 缺陷时，应在适当情况下 deprecate 该版本；若 registry
  policy 允许，将 `latest` 恢复到已验证版本，并发布修正 patch。不得假定 npm
  unpublish 可用或适当。
- secret、私有语料、来源不明可分发资产、生命周期自动执行、未声明网络行为、错误
  package scope 或组织权限丢失均触发 Stop-Ship。

## 发布后门禁

发布 DRI 已观察并记录以下结果：

- Registry metadata 报告 `@moonweave-ai/ontotect@0.1.1`、MIT、`ontotect`
  可执行命令，并且 `latest` 指向 0.1.1。
- 匿名公共 metadata 访问与隔离公共 npx help 均通过。
- Cursor、Codex、Kilo、OpenCode 与 Claude Code 布局的项目级安装均通过，且预期
  技能文件存在。
- GitHub 与 npm 正确呈现目标英文 README、品牌资产、组织身份、链接和安装命令。
- 验证记录、npm 安装器安全审查与本报告已写入观察证据；本地与远端 `main` 一致。
- 任一回归都触发回退路径，并形成有记录的后续行动。

已观察的发布门禁全部通过。真实宿主加载、用户/全局范围安装、npm 账号恢复、
package provenance 与永久私密安全报告路径仍是 `unverified` 后续控制。
