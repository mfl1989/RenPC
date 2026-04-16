# VS Code 迁移检查清单

本文件用于对照旧的 [.cursorrules](../.cursorrules) 与当前 VS Code / Copilot 配置，帮助判断何时可以安全移除 Cursor 规则文件。

## 结论

当前项目已经完成了大部分从 Cursor 到 VS Code 的规则迁移，日常开发可以直接使用 VS Code 工作流。

现阶段建议：

- 保留 [.cursorrules](../.cursorrules) 作为过渡期备份
- 以 [../.github/copilot-instructions.md](../.github/copilot-instructions.md) 和 [../.github/instructions](../.github/instructions) 作为主规则来源
- 暂时不要继续堆大量 prompt

当你连续使用 VS Code 一段时间后，确认没有再回看 [.cursorrules](../.cursorrules) 的需求，再删除会更稳妥。

## 已覆盖内容

### 1. 技术栈与项目共识

旧规则内容：

- Java 17+
- Spring Boot 3.x
- PostgreSQL
- Flyway
- React
- TypeScript
- Tailwind CSS
- Gradle

当前覆盖位置：

- [../.github/copilot-instructions.md](../.github/copilot-instructions.md)
- [../.github/instructions/backend-java.instructions.md](../.github/instructions/backend-java.instructions.md)
- [../.github/instructions/frontend-react.instructions.md](../.github/instructions/frontend-react.instructions.md)
- [../.github/instructions/sql-migration.instructions.md](../.github/instructions/sql-migration.instructions.md)

结论：已覆盖。

### 2. 语言规范

旧规则内容：

- 代码命名保持英文
- UI、注释、接口说明使用日文或中文

当前覆盖位置：

- [../.github/copilot-instructions.md](../.github/copilot-instructions.md)
- [../.github/instructions/backend-java.instructions.md](../.github/instructions/backend-java.instructions.md)
- [../.github/instructions/frontend-react.instructions.md](../.github/instructions/frontend-react.instructions.md)

结论：已覆盖。

### 3. 后端架构约束

旧规则内容：

- Controller -> Service -> Repository
- Controller 不写业务逻辑
- 不直接返回 Entity
- API 统一返回 code/data/message
- 全局异常处理
- Bean Validation
- 列表接口支持分页
- 复用 util 目录下公共逻辑

当前覆盖位置：

- [../.github/copilot-instructions.md](../.github/copilot-instructions.md)
- [../.github/instructions/backend-api.instructions.md](../.github/instructions/backend-api.instructions.md)
- [../.github/instructions/backend-java.instructions.md](../.github/instructions/backend-java.instructions.md)

结论：已覆盖。

### 4. 数据库规范

旧规则内容：

- PostgreSQL
- Flyway 管理结构变更
- snake_case
- 逻辑删除优先
- 审计字段一致
- 金额使用 INTEGER/BIGINT

当前覆盖位置：

- [../.github/copilot-instructions.md](../.github/copilot-instructions.md)
- [../.github/instructions/backend-persistence.instructions.md](../.github/instructions/backend-persistence.instructions.md)
- [../.github/instructions/sql-migration.instructions.md](../.github/instructions/sql-migration.instructions.md)

结论：已覆盖。

### 5. 前端表单与业务流程约束

旧规则内容：

- 多步骤申请流程
- 日本邮编、片假名、电话校验
- ZIP 查询
- 明确 loading 状态
- 防重复提交

当前覆盖位置：

- [../.github/copilot-instructions.md](../.github/copilot-instructions.md)
- [../.github/instructions/frontend-react.instructions.md](../.github/instructions/frontend-react.instructions.md)
- [../.github/instructions/frontend-apply-flow.instructions.md](../.github/instructions/frontend-apply-flow.instructions.md)
- [../.github/instructions/frontend-service-contract.instructions.md](../.github/instructions/frontend-service-contract.instructions.md)

结论：已覆盖。

### 6. 管理端相关约束

旧规则内容：

- 管理端登录
- 受保护路由
- 订单列表与状态更新
- 乐观锁与状态流转

当前覆盖位置：

- [../.github/instructions/frontend-admin.instructions.md](../.github/instructions/frontend-admin.instructions.md)
- [../.github/instructions/backend-api.instructions.md](../.github/instructions/backend-api.instructions.md)
- [../.github/instructions/backend-persistence.instructions.md](../.github/instructions/backend-persistence.instructions.md)

结论：已覆盖。

## 未完全一比一迁移的内容

### 1. Cursor 风格的“工作流程输出格式”

旧规则内容里要求：

- 先输出任务分析
- 再分步骤汇报进展
- 最后做最终确认

说明：

这类内容更偏“特定 AI 助手的回答流程”，不是项目代码规则本身。VS Code 里当前已经通过 instruction 保留了核心工程约束，但没有强制复制 Cursor 的固定输出模板。

结论：未做一比一迁移，但不影响代码协作。

### 2. Cursor 风格的快捷命令别名

旧规则内容里有：

- /ask
- /plan
- /debug
- /cmt
- /log

说明：

这些更适合在 VS Code 里用 prompt 来实现，而不是 instruction。

结论：当前未迁移为 prompt，因为尚未确认使用频率。

## 什么时候值得加 prompt

只有满足下面 3 条时，才建议新增 prompt：

1. 同一类请求已经重复出现至少 3 次
2. 你希望它每次都按固定步骤执行
3. 这个动作本身是完整工作流，而不是普通问答

## 当前最可能值得做成 prompt 的项目

### 1. 标准后端接口生成

适用场景：

- 新建 Controller / Service / DTO
- 自动遵守统一 API 返回格式、验证、事务边界

### 2. 申请流程校验检查

适用场景：

- 检查前端多步骤表单
- 检查日本业务校验
- 检查 loading 和防重复提交

### 3. 规范化代码审查

适用场景：

- 按项目后端、前端、数据库规则做 review

## 什么时候可以删除 .cursorrules

建议满足下面条件后再删：

1. 你已经在 VS Code 中连续使用一段时间，没有再依赖 Cursor
2. 项目成员都以 [../.github/copilot-instructions.md](../.github/copilot-instructions.md) 和 [../.github/instructions](../.github/instructions) 为准
3. 你确认不再需要旧的 `/ask`、`/plan`、`/debug` 这类 Cursor 风格入口
4. 如果后续确实需要固定工作流，已转成 VS Code prompt 而不是继续依赖 [.cursorrules](../.cursorrules)

## 当前建议

- 现在不要删除 [.cursorrules](../.cursorrules)
- 现在也不要继续大量追加 prompt
- 先按当前 VS Code 规则体系继续开发
- 等高频工作流稳定后，再补 2 到 3 个最小 prompt