# DSH-HUAWEI-CodeArt2API 预研报告（最终版）

> 执行日期：2026-11-21
> 依据方案：[`_temp/plan.md`](plan.md)
> 差异清单：[`_temp/probe/gap-report.md`](probe/gap-report.md)
> 证据目录：[`_temp/probe/results/`](probe/results)
> 状态：**探针全部完成**（2026-11-21）｜结论与依据见本文，证据见 `_temp/probe/results/`

---

## 一句话结论

**通道走通了**：本机 `codearts serve` 能起、能鉴权、能建会话、能流式对话、能调工具。它与参照项目用的 opencode serve **同根但路径全变**（去掉了 `/api` 前缀），所以插件的"进程管理"能复用，"HTTP 客户端"要基本重写。**第一轮预研用了 10 次对话**；随后按全量授权做了**第二轮进阶探针（约 25 次，不限预算）**，覆盖工具权限矩阵、多会话并发、生命周期、variants、超长输入、多轮对话。

---

## 二、探针结果总览

| 阶段 | 内容 | 结果 |
| --- | --- | --- |
| P0 | 环境盘点 | ✅ 完成 |
| P1 | serve 启动 / OpenAPI | ✅ 完成（OpenAPI 272 路径，1.28MB） |
| P2 | 只读接口 | ✅ `/provider` `/config` `/session` 均 200 |
| P3 | 鉴权 | ✅ Basic `username:password`（用户名为环境变量值） |
| P4 | 会话 / 流式 | ✅ 建会话 + 异步 prompt + 30 个 SSE 事件 |
| P5 | 工具 / 权限（含补测） | ✅ 工具调用成功；权限状态已明确（见第五节） |
| P6 | 自定义模型 | ✅ 按裁决不做 |
| P6.5 | 安装方式 | ✅ 实测 tgz 可用（裁决用 tgz） |
| 错误码 | 404 / 400 / 204 / session.error | ✅ 完成 |

---

## 三、环境（P0）

- `codearts` **26.11.11**；`opencode` v2.3.2；Node v24.18.0；DSH **0.2.2-rc.3**。
- DSH 装在 `~/.dsh`，profile：`desktop`、`web`。
- 端口：**4196 空闲**（4096 被常驻 `opencode.exe` 占用）。
- **目录信任**：CodeArts CLI 要求工作目录受信任；工作区 `D:\DSH-HUAWEI-CodeArt2API` **不受信**，serve 必须从受信任目录（如 `C:\Users\hbk`）启动。
- **凭据**：当前版本只认 `CODEARTS_CLI_AK` / `CODEARTS_CLI_SK` 环境变量（本次由你提供的 CSV 只读载入，未落盘）。

---

## 四、安装方式（P6.5 裁决）

- 实测 `dsh plugin --profile web add <tgz>` **成功**（幂等，配置未变）。
- 旁证：web profile 已装多个本地 tgz 插件（含参照项目）。
- **裁决：用 tgz**。官方 `install_bundle`（包目录）记为备选。

---

## 五、接口契约实测（核心）

### 1. 鉴权
- 无 auth → **401**；Basic `probe:probe-pass-2026` → **200**；Basic `opencode:...` → **401**；Bearer → **401**。
- 结论：**Basic `username:password`**，用户名就是 `CODEARTS_SERVER_USERNAME` 的值（不是固定的 `opencode`）。

### 2. 路径体系（与参照最大差异）
- **没有 `/api` 前缀**。参照的 `/api/session` 在 CodeArts 是 `/session`，`/api/event` 是 `/event`。
- `/api/info` 返回的是前端 HTML（不是接口）。

### 3. 模型（`/provider`）
- 1 个 provider（`huaweicloud-maas`），**12 个模型**：DeepSeek-V4.1-Flash(-1017)、GLM-5.2/5.3(-Flash)、Kimi-K3(-K3.1-Pro)、OpenPangu-2.0/2.1、智速模式。
- 字段：`status:"active"`（替代 enabled）、`cost` **全 0**（积分制）、`options.creditRatioDisplay:"0.12x"`、`capabilities.toolcall`、`variants:{low,high,max}`。
- **坑**：文档说 variants 是 low/medium/high，实测是 **low/high/max**；文档说 cost 表示免费，实测全 0 但按积分扣。

### 4. 会话与流式
- 建会话：`POST /session` body `{title}` → 200，返回 `ses_...`。
- 发消息：`POST /session/{id}/prompt_async` body `{messageID, model{providerID,modelID}, agent, parts:[{type:"text",text)}]}` → **204**（异步）。
- 事件流：`GET /event`（SSE），实测类型：`server.connected`、`message.updated`、`message.part.updated`、`message.part.delta`、`session.updated`、`session.status`、`session.idle`、`session.diff`、`session.error`、`tui.toast.show`、`server.heartbeat`。
- part 类型：`text` / `reasoning`（思考）/ `tool` / `step-start` / `step-finish`。
- tokens 统计齐全：`input/output/reasoning/cache/context`。
- 附加：会话标题自动生成；用户消息会注入记忆上下文（`memoryIndexReminder`/`memoryContext`）。

### 5. 工具与权限（已补测，状态明确）

**实测可用的权限状态（serve 端）**：

| 配置 | 实测行为 |
| --- | --- |
| 默认（无规则） | 工具在 **sandbox 自动执行**，不弹权限请求 |
| `config.permission.bash = allow` | 同上，自动执行 |
| `config.permission.bash = ask` | **仍自动执行**（serve 不弹询问） |
| `config.permission.bash = deny` | **工具被禁用**（模型找不到 bash，改用 tool_search） |
| `permission/config.json` 的 `bash_mode` = sandbox / always_ask / always_allow | **对 serve 不生效**（实测均自动执行） |
| `permission/global.json` 的 bash 规则 | **对 serve 不生效** |

**结论**：
- serve 端实际只有两档：**放行（sandbox 自动执行）** 与 **禁用（deny）**；`ask` 在 serve 端不会触发询问（无前端交互）。
- 工具执行环境：`executeMode: sandbox_mode`，`networkPolicy: deny_all`。
- `permission.asked` / `permission.reply`（`/permission/{requestID}/reply`，body `{reply: once/always/reject}`）结构以 OpenAPI 为准，**未在 serve 端实测触发**。
- 所有配置改动已还原（`bash_mode=sandbox`、global.json 原样、`/config` bash=allow）。

### 6. 错误码
- `GET /session/{不存在}` → **404** `NotFoundError`。
- `DELETE /session/{id}` → **200** `true`。
- 无效 JSON → **400** `Malformed JSON in request body`。
- 无效模型 prompt 仍 **204**（异步，错误走 SSE `session.error`）。

---

## 六、复用度评估

| 模块 | 复用度 | 动作 |
| --- | --- | --- |
| 插件骨架 / 设置页 / web 页面 | 高 | 照搬 |
| ServeManager（起停/保活） | 高 | 改命令、鉴权环境变量、端口默认 |
| client.ts（HTTP 客户端） | 低 | **重写**（路径/请求体/响应全变） |
| adapter / turn / translate | 中 | 框架复用，事件映射重写 |
| catalog / models | 低 | **重写**（status/creditRatio/variants） |
| 工具权限白名单 | 低 | **重写**（默认 sandbox 自动执行） |

**一句话**：骨架和进程管理能搬，网络和模型层要重写。

---

## 七、风险与待确认

1. **serve 端无交互式审批**：只有「放行/禁用」两档；若插件需要人工审批，serve 端做不到，需在插件层自行拦截。
2. **目录信任**：serve 必须从受信任目录启动，插件要处理"工作区不受信"的情况。
3. **版本漂移**：serve 默认端口文档(4096)与实测(0)不符；variants 文档与实测不符。以实现时 OpenAPI 为准。
4. **凭据依赖**：必须有 `CODEARTS_CLI_AK/SK`；插件应复用系统环境变量，不落地。

---

## 八、进阶探针（第二轮，2026-11-21）

### 1. 工具权限矩阵（serve 端）

| 工具 | deny | allow | ask |
| --- | --- | --- | --- |
| bash | 工具消失（用 tool_search） | 执行（sandbox） | **仍执行**（不弹问） |
| read | 工具消失（用 glob 替代） | 执行 | 未测（推断同 allow） |
| edit | 工具消失（用 tool_search/question） | 执行（写入成功） | **仍执行**（写入成功） |
| glob | 工具消失（用 bash 替代） | 执行 | 未测 |
| grep | 工具消失（用 bash 替代） | 执行 | 未测 |
| list | 工具消失（用 read 替代） | 执行 | 未测 |
| webfetch | 工具消失 | 执行 | 未测 |
| task | **未生效**（仍可用） | 执行 | 未测 |

**规律**：`deny` → 工具从可用列表消失（模型改用替代工具或提问）；`allow`/`ask` → 直接执行、**不弹权限请求**。
**例外**：`task` 的 `deny` 无效。
**无效配置**：`permission/config.json` 的 `bash_mode` 与 `permission/global.json` 规则**对 serve 均不生效**（实测）。

### 2. 多会话并发
- 同时建 3 个会话并发对话：**事件按 `sessionID` 隔离**，各自完整生命周期（每会话 24–28 个事件），互不干扰。
- 结论：serve 支持多会话并发，插件需按 `sessionID` 分账。

### 3. 会话生命周期
- **重启持久化**：重启 serve 前后各 23 个会话，**ID 完全一致**（存在 `cli-data/opencode.db`）。
- **中断**：`POST /session/{id}/abort` → 200，状态 busy→idle。
- **删除**：`DELETE /session/{id}` → 200 `true`。

### 4. 思考档位 variants
- `prompt_async` 支持 `variant` 字段；实测 `low`（reasoning 103 tokens）与 `max`（126 tokens）**有差异但不大**（与模型/问题相关）。

### 5. 超长输入
- 约 **100KB 文本**（约 2 万 tokens）被接受（204），无报错，`finish:stop`。
- 说明 serve 支持大上下文（模型上限 1M）。

### 6. 多轮对话（重要发现）
- **同一会话连续 `prompt_async`**：SSE 事件流只剩 heartbeat（消息事件丢失），会话消息 API 也返回空。
- **单轮对话一切正常**（事件、消息 API 均可查）。
- **影响**：serve 的“有状态多轮”不可靠；插件应沿用参照项目的**无状态每回合**（每回合新建会话、全量历史压平），不依赖 serve 的多轮上下文。

### 7. 其他实测
- **目录信任**：工作区 `D:\DSH-HUAWEI-CodeArt2API` 不受信，serve 必须从受信任目录（如 `C:\Users\hbk`）启动——插件要处理这点。
- **配置 PATCH 是合并语义**：不能删除字段（只能覆盖）；权限测试需显式覆盖。
- **消息 API**：`GET /session/{id}/message` 单轮可查，多轮返回空。

### 8. directory 参数隔离
- 建会话时传 `directory`，会话带上该字段；`GET /session?directory=...` 可按目录过滤。
- 未传时默认取 serve 启动目录（`C:\Users\hbk`）。

### 9. question 交互闭环（已打通）
- 模型可调用 `question` 工具 → 产生 `question.asked` 事件（含 `questions[]` 与 `tool{messageID,callID}`）。
- 回复接口 `POST /question/{requestID}/reply`（body `{answers:[...]}`）→ 工具状态转为 `completed`，模型可继续。
- 插件若要支持「反问用户」，走这条闭环。

### 10. 并发上限（重要）
- **体验版并发会话上限 3 个**：8 个会话同时发消息时，4 个报
  `APIError: 并发会话数已达上限(3个)，请关闭部分会话后重试。`
- 3 个并发以内正常。
- **插件必须做并发限流**（最多 3 个在跑，超出排队或拒绝）。

### 11. 服务空闲行为
- serve 空闲 **90s 后仍监听**，不会自动退出（需插件自行管理生命周期）。

---

## 九、路径 C 验证：直连模型 API（2026-11-22）

### 结论
**直连的「签名通道」格式可行，但凭据获取/刷新是私有机制，因此不具备简单直连可行性**。端点在、签名能被 APIG 接受；卡点在于：STS 临时凭据会过期，刷新走 CodeArts 私有 OAuth（端点未公开）。除非用户另有华为云 MaaS 的 API Key，否则需逆向私有 OAuth（高风险）。

### 实测证据
1. **端点存在**：`POST https://snap-access.cn-north-4.myhuaweicloud.com/api/v2/chat/completions`（来自 `/provider` 的 `model.api.url`）。
2. **鉴权**：APIG 报 `x-auth-token not found`（无 auth）/ `decrypt token fail`（裸 AK、裸 SK、OAuth access 均失败）。
3. **凭据结构**（用 CLI 自带 dpapi 解密 `auth.json`，未落盘、未外发）：
   - `access` = **华为云 STS 临时凭据** `{access_key_id, secret_access_key, security_token, expiration, dpop_key_pair}`，**会过期**；
   - `refresh` = **OAuth JWT**（`iss=cn-north-4`、`client_id=CodeArts_Tui`、`cnf.jkt` DPoP 绑定）；
   - `user_profile` **无 domain / project_id**（仅 account / principal / urn）。
4. 直连需：DPAPI 解密 + OAuth 刷新（私有客户端 + DPoP 密钥）+ 华为云签名；凭据会过期，依赖 CodeArts 私有机制。
5. **签名实测**：用解密出的 STS 凭据按华为云 `SDK-HMAC-SHA256` 签名调用，APIG 返回 `401 Unauthorized`（不再是 `decrypt token fail`）——说明**签名格式被接受**，仅因凭据已过期被拒。证据 `C-sign-probe.json`。
6. **刷新端点排查**：CLI 主程序内含 `/oauth/v3/token`、`/v1/oauth/refreshToken`、`grant-type:jwt-bearer` 等逻辑；但在 `iam.myhuaweicloud.com` 上探测 `/oauth/v3/token`、`/v1/oauth/refreshToken` 均 **404**，本机配置/日志亦无可用刷新地址 → **刷新端点未公开**（疑似服务端下发）。

### 若坚持 C 的前提
- 用户拥有华为云 MaaS 的 **API Key**（控制台创建），用 `x-auth-token: <apikey>` 可能直连（**未验证**，当前账号无）。
- 或接受复刻凭据机制（高风险）。

### 决策建议
- **保底 A（serve 通道）**：已全量验证、稳定。
- 若要「工具归 DSH」：**MCP 桥接**（serve + 把 DSH 工具暴露为 MCP）比直连更现实。

证据：`C-provider-full.json`、`C-serve-debug.log`。

---

## 十、未覆盖项与依据（设计时边界）

以下项目前**未实测**，设计时以官方文档/OpenAPI 为准，并标注风险：

| 项 | 现状 | 依据 / 风险 |
| --- | --- | --- |
| 时间窗口限流（5 小时 / 7 天） | 未触发 | 计费说明文档；高频调用需自行限流 |
| 凭据过期 / 刷新 | 未实测 | CLI 授权依赖 `CODEARTS_CLI_AK/SK`；过期表现未验证 |
| SSE 断线重连 | 未实测（观察到 `server.heartbeat`） | 需插件实现重连/心跳保持 |
| `websearch` 放行 | 未实测（`webfetch` 已验证） | 推断同 webfetch |
| 标准版并发上限 | 未实测（体验版为 3） | 计费文档称标准+ 为 5 |
| 跨工作区/多 isolate | 未实测 | 参照项目曾踩坑，插件按无状态规避 |
| 多轮有状态会话 | 实测不可靠 | 插件采用无状态每回合 |

---

## 十一、下一步（请审核后指示）

1. 是否按此结论进入**正式设计**（输出设计文档：模块划分、接口映射、文件清单）。
2. 是否还有需要补测的技术点。
3. 是否清理本次探针产生的临时会话（serve 已停，会话留在 `cli-data/opencode.db`）。

---

## 附：证据文件

- [`A-env.txt`](probe/results/A-env.txt)：环境盘点
- [`C-serve-start.log`](probe/results/C-serve-start.log)：serve 启动日志
- [`C-openapi.txt`](probe/results/C-openapi.txt)：完整 OpenAPI（272 路径）
- [`C-provider.json`](probe/results/C-provider.json) / [`C-models-picked.json`](probe/results/C-models-picked.json)：模型
- [`C-config.json`](probe/results/C-config.json)：配置（875KB）
- [`C-sse-1.json`](probe/results/C-sse-1.json)：第 1 次对话事件
- [`C-tool-events.json`](probe/results/C-tool-events.json)：工具事件
- [`C-sse-2.json`](probe/results/C-sse-2.json)：权限触发尝试（报错）
- [`D-errors.txt`](probe/results/D-errors.txt)：错误码
- [`C-perm-*.json`](probe/results/C-perm-deny.json)：权限状态补测（deny / allow / ask / always_ask）
- [`backup-permission-*.json`](probe/results/backup-permission-config.json)：权限配置备份（已还原）
- [`E-install-probe.log`](probe/results/E-install-probe.log) / [`E-install-matrix.md`](probe/results/E-install-matrix.md)：安装方式
