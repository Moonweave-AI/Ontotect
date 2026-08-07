---
type: verification
status: active
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 180
summary: 当前 Ontotect 源技能包与公开文档的本地 QA-L4 证据及明确验证边界。
canonical: docs/en/verification-record.md
related:
  - docs/zh-CN/quality-and-validation.md
  - docs/zh-CN/compatibility.md
  - docs/decisions/0001-portable-command-router.md
  - docs/decisions/0002-explicit-npm-installer.md
  - docs/decisions/0003-organization-scoped-npm-package.md
  - docs/zh-CN/npm-installer-security-review.md
supersedes: null
superseded_by: null
---

# 本地验证记录 — 2026-08-07

[English](../en/verification-record.md) · [文档首页](index.md) · 本页是英文 canonical 的简体中文镜像。

本记录说明命令、Router、文档、兼容性和 npm/npx 分发工作完成后，对当前本地源技能包实际执行的
检查。它不是稳定发布声明、外部宿主认证或目标领域本体验证报告。

## 已执行证据

| 范围 | 已执行检查 | 观察结果 |
|---|---|---|
| 研究综合 | 核对完整处理的本地集合及证据登记 | 29 份 PDF：5 本书、17 篇论文、7 份工具文档；2,045 页、791,157 个提取词 |
| 仓库回归 | Python 标准库 unittest discovery | 29 项测试通过，覆盖双语文档、npm metadata、可访问 SVG、引用措辞、命令契约和 Python 安装器 |
| npm 安装器回归 | `npm test` / Node 内置 test runner | 8 项测试通过：参数、dry-run、五个项目路径、五个用户路径、完整复制、冲突预检、显式 force、metadata 及打包 tarball 的 npx 执行 |
| Agent Skill 结构 | Skill Creator `quick_validate.py` | `Skill is valid!` |
| 生成技能安全 | book-to-skill 建议性 generated-skill scan | 通过；未报告已知识别的注入或不安全权限模式 |
| 静态宿主 lens | book-to-skill 的 Claude、Amp、GitHub Copilot CLI lens | 三项均通过且零 warning；它们是静态 lens，不是真实宿主运行 |
| 文档 | 镜像文件名、治理 frontmatter、相对链接、命令词汇、编码和语料排除 | 通过仓库回归检查 |
| README 视觉与引用 | 解析本地 SVG 并检查 accessibility metadata、每种语言两张 Mermaid、双语结构、内部链接、标准格式引用和删除措辞 | 通过；SVG 无脚本、外部字体或导入资源；陈旧 `.mjs` 与被拒绝免责声明措辞在公开文本中均为 0 命中 |
| 源资产 | 解析 4 个 Turtle、1 个 SPARQL、1 个 JSON、1 个 TSV；用 `ast` 解析 4 个 Python 脚本 | 全部成功；TSV 含数据行 |
| 功能夹具 | 用 valid/invalid 夹具及 starter shapes 运行建议性审计 | Valid：exit 0、SHACL conform、0 个建议性发现；Invalid：exit 1、SHACL non-conformant、1 个 violation |
| 断言图差异 | valid 与自身、valid 与 invalid 比较 | 相同图：新增 0/删除 0；不同图：新增 1/删除 4 |
| 命令进程矩阵 | 调用所有场景卡命令、7 个 `stage` 命令和 6 个无歧义直接阶段别名 | 9 个场景命令、7 个阶段和 6 个别名均 exit 0；Router/Help 另由测试覆盖 |
| Router 回归 | 英中多意图、显式覆盖、plan-only、模糊目标、全部场景和协调命令阶段 | 通过；`help` 使用 `n/a`，无法确定的 `status` 阶段为 `unverified` |
| 五宿主打包 | 在隔离的 Cursor、Codex、Kilo、OpenCode、Claude 目录中 dry-run 并安装 | 5 个计划、5 个安装；每个源集 48 个文件逐字节直接比较，0 差异；未给 `--force` 的 5 个重复安装全部正确拒绝 |
| npm package metadata | 检查 `package.json` 与可执行行为 | Package name 为 `@moonweave-ai/ontotect`，binary 为 `ontotect`；MIT 许可证、Moonweave-AI 仓库 metadata、public publish 配置、ESM、零依赖、无 engine 约束、无 install/prepare 生命周期脚本，并使用公共文件白名单 |
| npm pack 白名单 | 在 Python 测试生成本地缓存后运行 `npm pack --dry-run --json --ignore-scripts` | 首次检查发现两个 `.pyc` 缓存并阻止验收；随后收紧 scripts 白名单。MIT 发布候选包含 54 个预期条目（含 `LICENSE`），必需公共文件齐全，语料、缓存、测试、临时文件、文档源和 tarball offender 均为 0 |
| 发布后文档 pack | 加入居中 README Hero 与本地品牌标识后，重新执行 dry-run 白名单检查 | 当前 `main` 包含 55 个预期条目，两个可访问 SVG 品牌资产均已纳入，必需文件齐全，语料、缓存、测试、临时文件、lockfile 与 tarball offender 均为 0；这是源码状态证据，不代表重新发布 npm 版本 |
| 打包 npx 安装 | 在隔离临时目录创建真实本地 tarball，以 offline/ignore-scripts 模式通过 npx 调用，并在测试后删除 | 5 个项目目标全部安装；每个目标 48 个相对文件与 canonical 技能逐字节一致，0 差异；未发生 registry 发布 |
| npm 安装器安全 | 应用 S4 / QA-L4 威胁模型，检查显式修改、固定目标、覆盖、网络、依赖、语料、生命周期与组织 scope 边界 | 本地控制通过；ADR 0002 与 ADR 0003 已接受，项目采用 MIT。发布前已验证 registry 认证与 npm organization ownership；账号恢复、provenance 和永久私密报告路径继续单独跟踪 |
| 公共 npm registry | 发布后在已认证组织上下文与匿名上下文查询 package metadata | `@moonweave-ai/ontotect@0.1.0` 已公开；`latest` 指向 `0.1.0`；registry 报告 MIT；组织权限为 read-write；匿名 registry 访问成功 |
| 公共 npx 分发 | 调用公共 `npx` help，并从 registry 安装到 Cursor、Codex、Kilo、OpenCode 与 Claude Code 的隔离项目级根目录 | Help 成功；五个项目目标全部安装，每个目标包含 48 个技能文件 |
| Ignore 行为 | 通过隔离临时 Git metadata 执行 `.gitignore` | 10 个私有/生成案例被忽略；7 个公开 Markdown/Turtle/SPARQL/JSON 或 `.env.example` 案例保持可见 |
| 首次接触行为 | 上下文隔离 Agent 渐进加载技能并回答中文首次使用请求 | 正确选择只读 `help`，把只读 `review` 作为独立下一步，并保留 `unverified`；其发现的 help 阶段歧义已修正并加入回归 |
| 多意图行为 | 独立后续评估者路由中文审核、修正、OWL/SHACL 验证和发布证据请求 | 选择 `review -> repair -> validate -> release` 预检；写入仅限指定本体及已确认测试；禁止远端发布；指出缺失的 CQ、import、工具和权威输入；修正后未发现实质缺陷 |
| Status 与发布门行为 | 后续评估者判断用户报告 parser 通过、reasoner 不可用、SHACL 失败获临时接受的场景，并复核修正后契约 | Parser 与 reasoning 保持 `unverified`；SHACL 保留底层 `fail`；不完整 exception overlay 不生效；Stage F 与 Release 均为 `revise`。复核确认确定性门禁优先级和例外保留均无剩余实质歧义 |

两个安装矩阵均采用逐字节直接比较；没有增加密码学哈希验证、依赖固化、重复宿主版本检查或
版本锁定。

## 代表性命令

```text
python -m unittest discover -s tests -v
npm test
npm pack --dry-run --json --ignore-scripts
node bin/ontotect.js plan --agents all --scope project --project-root .
python <skill-creator>/scripts/quick_validate.py ontotect
python book-to-skill/tools/scan_generated_skill.py ontotect
python book-to-skill/tools/validate_skill.py ontotect/SKILL.md --lens claude
python ontotect/scripts/ontotect.py router "审核并修复这个本体，然后验证 SHACL"
python ontotect/scripts/ontology_audit.py ontotect/assets/ontology-starter.ttl --data <fixture> --shapes ontotect/assets/shapes-starter.ttl --json
python ontotect/scripts/ontology_diff.py <before.ttl> <after.ttl> --json
python ontotect/scripts/install_skill.py --agents all --scope project --project-root <isolated-root> --apply --json
```

安装与 Git ignore 检查使用已验证的隔离临时目录，并在执行后删除。

## 明确边界

- 尚未把 Cursor、Codex、Kilo、OpenCode、Claude Code 五个外部产品逐一启动并指向
  本工作区，因此真实宿主中的 discovery 与 behavioral compatibility 仍为
  `unverified`。
- 公共 npx 安装只对隔离的项目级根目录执行。已发布 package 的用户/全局范围安装仍为 `unverified`。
- 重新设计的 README 与本地品牌标识已进入当前 `main`，但 npm `0.1.0` 不可变；只有经过另行授权的后续 patch release 才会把这套呈现同步到 npm package 页面。
- `@moonweave-ai/ontotect@0.1.0` 已发布。匿名 registry 访问、公共 npx help 以及全部五个隔离宿主布局的项目级安装均通过。Package provenance 与 npm 账号恢复继续单独跟踪。
- Ignore 规则使用隔离的临时 Git metadata 执行。仓库此后已发布；该发布事件不改变原始 Ignore 检查的证据范围。
- 没有提供目标领域本体或完整 OWL reasoner 契约。Starter 夹具结果不能证明另一
  本体一致、可满足、正确或已准备发布。
- ADR 0001、ADR 0002 与 ADR 0003 已接受，项目采用 MIT。永久安全联系人、npm 账号恢复、公共仓库设置与 CI 仍是后续决定。
- 本记录对 2026-08-07 捕获的证据处于 active 状态。后续行为或文档变更需要新建或更新记录，不得静默沿用历史结果。
