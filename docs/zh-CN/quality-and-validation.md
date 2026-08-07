---
type: reference
status: draft
owner: project-maintainers
created: 2026-08-07
updated: 2026-08-07
last_reviewed: 2026-08-07
review_cycle_days: 180
summary: 使用 Ontotect 验证本体工程工作的证据层、结果语义、质量级别和工具边界。
canonical: docs/en/quality-and-validation.md
related:
  - ontotect/references/validation-and-testing.md
  - ontotect/assets/evidence-manifest.json
  - ontotect/assets/release-checklist.md
supersedes: null
superseded_by: null
---

# 质量与验证

[English](../en/quality-and-validation.md) · [文档首页](index.md) · 本页是英文 canonical 的简体中文镜像。

本体质量是多维的：文件可能成功解析但类不可满足；逻辑一致的本体可能无法回答能力问题；conform 的数据图也可能表达错误领域含义。因此 Ontotect 报告独立证据，而不是一个笼统的“valid”。

## 十层证据

1. 解析与序列化。
2. Metadata、标识符、annotations 和依赖卫生。
3. OWL profile 与 global restrictions。
4. 一致性、可满足性、分类和预期蕴含。
5. 预期非蕴含与 incoherence traps。
6. 能力问题 SPARQL 结果。
7. 在显式 data graph、shapes graph 和 entailment regime 下的 SHACL。
8. Pitfall、taxonomy、module、mapping 和 documentation review。
9. 领域专家验证与用户验收。
10. 当运行限制属于契约时的性能和规模。

分别运行适用层并保存输入、配置、输出、退出状态和局限。不适用的检查也应说明原因。

## 检查结果与阶段门处置

单项证据检查使用：

| 检查结果 | 含义 |
|---|---|
| `pass` | 检查已执行并满足标准 |
| `fail` | 检查已执行但不满足标准 |
| `error` | 检查因工具、输入或环境问题未能完成 |
| `accepted-exception` | 权威接受已知失败，并记录理由、范围和复审条件 |
| `unverified` | 检查未执行或结果不能支撑主张 |
| `not-applicable` | 已批准契约排除该证据层，并记录理由 |

`accepted-exception` 是独立覆盖层，不是替代结果。必须记录其权威、理由、范围、
持久决定制品和复审/到期条件；发布例外还必须得到发布政策和 Release authority
允许。生命周期和发布阶段门使用 `pass`、`pass-with-actions`、`revise`、
`blocked` 或 `unverified`，并遵循运行时命令契约的优先级。工具错误需要诊断，
并不自动表示本体失败；例外也不能抹去原始结果或伪造成普通 pass。

## 证据设计

每个 must-have CQ 都应定义可观察 oracle：精确 query answers、expected entailment、expected non-entailment、SHACL result、expert judgment 或 policy approval。关键约束需要 conforming 与 deliberately violating 夹具。测试应在核心语义回归时失败，而不只是再次解析相同语法。

Repair、Refactor 和 Optimize 应在 baseline/candidate 之间比较公共 IRI、断言公理、推断后果、CQ、SHACL、mapping、documentation 和相关性能。断言 graph diff 只是一层。

## 内置脚本

```powershell
python ontotect/scripts/ontology_audit.py ontology.ttl --data data.ttl --shapes shapes.ttl --json
python ontotect/scripts/ontology_diff.py before.ttl after.ttl --json
```

审计需要 RDFLib，可选 SHACL 需要 pySHACL。它不能证明完整 OWL 一致性、class satisfiability、profile conformance 或 entailment。Diff 比较断言 RDF 图，不比较推断语义 closure。

逻辑主张应使用合适 reasoner 和项目工具链，并记录 import closure、profile、entailment regime、catalog 和相关选项。

## 质量级别

按用户影响、集成范围、可逆性、科学/监管后果和自动化权限调整证据。公开可复用技能行为应接受文档、安全、兼容性、代表性场景和回归审查。质量不是靠更多仪式获得，而是靠满足实际风险所需证据。

详细模型以 [validation-and-testing.md](../../ontotect/references/validation-and-testing.md) 为准。
当前源技能包实际执行的检查另见[本地验证记录](verification-record.md)。
