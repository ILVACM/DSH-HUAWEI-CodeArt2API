# DSH-HUAWEI-CodeArt2API 接入方案（思路整理）

> 状态：**预研 + 路径决策 + 正式设计完成**（2026-11-22）｜保底方案 A 已定；设计稿见 [`_temp/design.md`](design.md)；未改代码、未打包、未安装。
> 详细证据：[`_temp/report.md`](report.md)、[`_temp/plan.md`](plan.md)、[`_temp/probe/gap-report.md`](probe/gap-report.md)
> 参照项目：`D:\DSH-Opencode2API-hbk`（`@hbk/dsh-opencode-local`，已验收 0.2.8-3）

---

## 1. 总体理解

**目标**：将华为云码道 CodeArts 代码智能体接入 DSH（DeepSeek Harness）使用。

**技术路线**：复用本机 CLI/TUI 通道（`codearts serve`），不走华为云官方 REST API（官方 API 只有用量同步，无对话能力）。

**当前仓库现状**：仍只有 README（一句意图）、Apache 2.0 LICENSE、`source/` 下 13 份官方 PDF，**无任何代码**。

---

## 2. 参照项目机制（已读源码确认）

一句话：DSH 里想用模型 → 插件起本机 CLI 的 `serve` 后台服务 → 走 HTTP/SSE 对话 → 翻译回 DSH 格式。

- 起进程：`opencode serve`（`OPENCODE_PASSWORD` + Basic）。
- 接口：`/api/model`、`/api/session`、`/api/session/:id/prompt`、`/api/event`、权限回复等。
- **无状态每回合**：每回合新建会话、全量历史压平。
- 凭据复用本机 `opencode.db`，不复制不伪装。
- 打包 tgz，`dsh plugin --profile web add xxx.tgz` 安装。

---

## 3. 路径决策（2026-11-22）

### 路径 A（保底，已定）：复用 `codearts serve`
- 插件起 `codearts serve`，走它的 HTTP/SSE；**工具在 CodeArts 侧执行**。
- 已**全量实测**（接口、模型、会话、权限、并发、生命周期、variants、超长、多轮）。
- **结论：可行、稳定，作为保底。**

### 路径 C（已验证，暂不可行）：绕开 serve，直连模型 API
- 目标：只用模型、工具归 DSH 执行（「和 API 一样」）。
- 实测：端点在（`/api/v2/chat/completions`）；用解密出的华为云 STS 凭据做 `SDK-HMAC-SHA256` 签名，**APIG 已接受签名格式**（仅凭据过期报 Unauthorized）。
- **卡点**：STS 临时凭据会过期，刷新走 CodeArts **私有 OAuth**（`client_id=CodeArts_Tui` + DPoP），**刷新端点未公开**（`iam.myhuaweicloud.com` 上相关路径均 404）。
- **结论：简单直连不可行**；除非另有华为云 MaaS **API Key**（未验证），或接受逆向私有 OAuth（高风险）。

### 决策建议
- **保底 A** 立即可以进设计。
- 若坚持「工具归 DSH」：评估 **MCP 桥接**（serve + 暴露 DSH 工具为 MCP），比直连现实。

---

## 4. 实测结论摘要（预研已完成）

| 维度 | 结论 |
| --- | --- |
| 路径前缀 | **无 `/api` 前缀**（`/session`、`/event`、`/provider`） |
| 鉴权 | Basic `username:password`（用户名 = `CODEARTS_SERVER_USERNAME`） |
| 发消息 | `POST /session/{id}/prompt_async`，**异步 204**，结果走 `/event` SSE |
| 模型 | `/provider`，12 个模型；`status:active`、`cost` 全 0（积分制）、`variants:low/high/max` |
| 权限 | serve 端只有「放行（sandbox 自动执行）/ 禁用（deny）」；`ask` 不弹询问；`bash_mode`/`global.json` 对 serve 无效 |
| 并发 | **体验版上限 3 个会话**，超出报「并发会话数已达上限(3个)」 |
| 生命周期 | 重启后会话保留；空闲不退出；中断/删除正常 |
| 超长 | 100KB 文本可接受 |
| 多轮 | 同会话连续 prompt **不可靠**（事件/消息丢失）→ 插件用**无状态每回合**规避 |
| 目录 | serve 须从**受信任目录**启动（工作区不受信）；会话按 `directory` 归属 |
| 安装 | `dsh plugin --profile web add <tgz>` **实测可用** |

---

## 5. 复用与改造对照（实测后）

| 模块 | 复用度 | 动作 |
| --- | --- | --- |
| 插件骨架 / 设置页 / web 页面 | 高 | 照搬 |
| ServeManager（进程管理） | 高 | 改命令、鉴权环境变量、端口默认（实测 0 非 4096） |
| client.ts（HTTP 客户端） | 低 | **重写**（路径/请求体/响应全变） |
| adapter / turn / translate | 中 | 框架复用，事件映射重写 |
| catalog / models | 低 | **重写**（status/creditRatio/variants） |
| 工具权限 | 低 | **重写**（默认 sandbox 自动执行 + deny） |

---

## 6. 风险

- **产品迭代快**：本机 `codearts` 26.11.11，文档 2026-11-17，契约可能漂移（以实现时 OpenAPI 为准）。
- **账号约束**：必须华为云账号 + 积分；体验版并发 3。
- **权限模型特殊**：serve 端无交互式审批，工具白名单不能照抄参照项目。
- **多轮不可靠**：必须无状态每回合。
- **目录信任**：serve 启动目录受限。

---

## 7. 设计与下一步

- **正式设计已产出**：[`_temp/design.md`](design.md)（模块划分、接口映射、before→after 改造清单、关键机制、里程碑）。
- 下一步：按设计实现（M1–M6）。
- 可选：若拿到 MaaS API Key，再评估路径 C；或评估 MCP 桥接。

---

## 8. 待人工确认项

1. 是否按**保底 A** 进入正式设计。
2. 是否需要「工具归 DSH」的替代路线（MCP 桥接 / MaaS API Key）。
3. 是否清理探针产生的临时会话（在 `cli-data/opencode.db`）。
