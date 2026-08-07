---
type: decision
status: accepted
owner: Moonweave-AI
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 180
summary: 将 Ontotect 作为 Moonweave AI 组织 scoped npm 包 @moonweave-ai/ontotect 公开发布，同时保留 ontotect 可执行命令。
canonical: docs/decisions/0003-organization-scoped-npm-package.md
related:
  - docs/decisions/0002-explicit-npm-installer.md
  - package.json
  - docs/zh-CN/npm-and-npx-installation.md
supersedes: null
superseded_by: null
---

# ADR 0003：组织 Scoped npm 包

[English](0003-organization-scoped-npm-package.md) · 本文是英文 canonical 决策记录的简体中文镜像。

## 状态

Owner 已于 2026-08-07 在首次 npm 发布前接受本 ADR。本 ADR 修订 ADR 0002 的
package identity 条款；显式安装、零依赖、固定路径、白名单和覆盖控制继续生效。

## 背景

仓库属于 Moonweave-AI GitHub organization。发布非 scoped npm 包不能表达该组织
身份。npm organization 已分发 `@moonweave-ai/governance-skills`，当前已认证操作账号
是 `moonweave-ai` npm organization 的 owner。

应用本决定前，官方 registry 未发现已有 `@moonweave-ai/ontotect` 包。该观察只证明
预检时可用，不构成永久保留。

## 决定

1. 只以 `@moonweave-ai/ontotect` 发布，不发布非 scoped `ontotect` 包。
2. 可执行命令继续使用 `ontotect`；package identity 与命令名用途不同。
3. 声明 `publishConfig.access` 为 `public`，把发布目标限定为 npm 官方 registry，并在发布时继续显式指定 public access。
4. 公共调用写法为：

   ```text
   npx @moonweave-ai/ontotect <command>
   npm install --global @moonweave-ai/ontotect
   ontotect <command>
   ```

5. Repository、issue、author、license 和 package 链接均指向 Moonweave-AI 资源。
6. 已认证个人 npm 账号只作为获得组织授权的操作者。npm 仍可能在 maintainer 或
   publisher metadata 中展示该账号；package scope 才是持久组织身份。

## 后果

- 用户可以区分官方组织包与相似的非 scoped 包。
- npx 直接调用稍长，但安装后的可执行命令仍保持简短。
- 发布需要 npm organization membership 与写权限。
- 未来迁移到其他 scope 属于分发与迁移变更，而不是外观改名。

## 验收证据

- `npm whoami` 返回已认证操作账号。
- `npm org ls moonweave-ai` 报告该账号为 organization owner。
- 该账号对组织现有包具有 read-write 权限。
- 发布前 registry 查询 `@moonweave-ai/ontotect` 返回 `E404`。
- 身份变更后必须重新通过 package 测试与 dry-run 检查。
