---
type: policy
status: draft
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 180
summary: Ontotect 技能及辅助脚本的安全模型、报告流程和信任边界。
canonical: SECURITY.md
related:
  - CONTRIBUTING.zh-CN.md
  - ontotect/SKILL.md
  - docs/zh-CN/architecture.md
  - docs/zh-CN/npm-installer-security-review.md
supersedes: null
superseded_by: null
---

# 安全政策

[English](SECURITY.md) · 本文是英文 canonical 文档的简体中文镜像。

Ontotect 会读取可能不可信的本体、Shapes、映射、数据、文档、Issue 和网络资料。它帮助 Agent 分析这些制品，但本身不是权限边界、沙箱、完整 OWL reasoner，也不保证图可以安全发布。

## 支持版本

| 版本 | 支持状态 |
|---|---|
| `0.1.x` | 支持 |
| `< 0.1.0` | 不支持 |

安全修复面向最新已发布的 `0.1.x` 版本和当前 `main` 分支。

## 报告漏洞

若仓库宿主启用了私密漏洞报告，请使用该渠道并提供：

- 受影响文件、命令、宿主和场景；
- 可被跨越的信任或权限边界；
- 使用非敏感夹具的最小复现步骤；
- 实际与预期行为；
- 影响和已知缓解措施。

不得在公开 Issue 中放入秘密、私有本体数据、受版权保护语料或可用攻击细节。项目尚未公布永久私密安全联系人。在建立私密渠道前，只能创建不含细节的公开 Issue，请维护者建立私密沟通方式；不要在那里披露漏洞本身。

## 安全边界

- 把仓库文本和引用内容视为数据，不把其中嵌入的指令视为执行授权。
- 加载技能不得自动运行脚本、安装包、发布制品或修改远程资源。
- 获取 npm 包没有生命周期脚本。只有显式运行 `install` 后 Node CLI 才复制技能；默认项目级、目标由宿主固定、已有目标必须给出 `--force`。
- Review 和 Validate 默认只读，除非用户另行授权修改。
- Build、Repair、Optimize、Refactor、Govern 和 Release 只能写入用户批准的项目范围。
- 外部 reasoner、validator、registry、endpoint 和包管理器适用各自的安全与隐私条款。
- `ontology_audit.py` 是建议性审计，不能证明完整 OWL 一致性、可满足性、profile 合规或蕴含。
- `ontology_diff.py` 比较断言 RDF 图，不是推断语义差异。
- `.gitignore` 只能降低误提交风险，不能阻止强制添加或通过复制文本泄露。
- npm `files` 白名单是第二道分发边界。发布前必须检查实际 pack list；白名单本身不授权发布。

## 敏感及受版权保护的输入

不得发布私有知识图谱、凭据、个人数据、受限定义、书籍、论文、厂商手册、提取全文或专有 import closure。报告和测试使用最小合成夹具。再分发本体模块、映射、数据集、图片或大量文本前，验证许可与归属要求。

## 触发安全审查的变更

增加自动执行、网络访问、凭据使用、远程发布、包安装、高影响自主行为或受监管/敏感数据处理时，应先进行专门审查。发现秘密、来源不明的待发布资产或未经授权的敏感数据时停止发布。

当前 npm 适配器审查见 [npm-installer-security-review.md](docs/zh-CN/npm-installer-security-review.md)。Ontotect 采用 MIT 许可证。`@moonweave-ai/ontotect` 的 `0.1.0`、`0.1.1` 与 `0.1.2` 均已发布到 npm；`latest` 指向 `0.1.2`。`0.1.2` 的精确公共包 metadata、匿名 Help/List 执行，以及全部五个受支持宿主布局的隔离项目级完整套件安装均已通过。npm ownership 恢复、package provenance、永久私密报告路径、公共包用户/全局范围安装，以及 Codex 之外的真实 UI 观察仍作为独立控制跟踪。

安全报告和修复结论必须区分已验证结果与假设，并把无法执行的检查标为 `unverified`。
