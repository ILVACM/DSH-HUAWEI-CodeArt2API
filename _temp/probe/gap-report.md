# CodeArts serve ↔ opencode 基线 差异清单（gap report）

> 日期：2026-11-21 ｜ 实测环境：codearts 26.11.11，serve 127.0.0.1:4196
> 基线：`D:\DSH-Opencode2API-hbk`（opencode v2.3.2，参照插件 0.2.8-3）
> 证据：`_temp/probe/results/*`、`_temp/probe/results/C-openapi.txt`（OpenAPI 3.1.1，1.28MB，272 路径）

---

## 1. 总体结论

**同构但不同路径**：CodeArts serve 是 opencode serve 的定制版，数据/配置/事件模型高度同源；但 **HTTP 路径全面去掉 `/api` 前缀**，且模型、权限、事件字段有差异。

**复用判断**：
- ServeManager（进程管理）：**改几处即可**。
- client.ts（HTTP 客户端）：**基本重写**（路径、请求体、响应结构都变）。
- adapter/turn/translate（流式翻译）：**框架复用，字段适配**。
- catalog/models：**重写**（模型结构不同）。
- 工具权限：**重写**（默认自动执行 + sandbox，权限事件结构不同）。

---

## 2. 逐项差异

| 维度 | opencode 基线 | CodeArts serve 实测 | 影响 |
| --- | --- | --- | --- |
| 启动命令 | `opencode serve` | `codearts serve` | 改命令名 |
| 默认端口 | 4096（参照用法） | `--port` 默认 **0（随机）**，文档写 4096 | 必须显式指定端口 |
| 就绪信号 | `opencode server listening on ...` | `codearts server listening on http://127.0.0.1:<port>` | 文案适配 |
| 鉴权环境变量 | `OPENCODE_PASSWORD` | `CODEARTS_SERVER_USERNAME` + `CODEARTS_SERVER_PASSWORD`（**强制两个**） | 改环境变量 |
| HTTP 鉴权头 | Basic `opencode:<password>` | Basic `<username>:<password>`（实测 `probe:probe-pass-2026` → 200；`opencode:...` → 401） | **用户名不固定**，用环境变量的 username |
| 路径前缀 | `/api/*` | `/*`（无 `/api`） | **全面改路径** |
| 服务信息 | `/api/info` | 无对应（返回前端 HTML） | 删除或改用 `/config` |
| 模型列表 | `/api/model`（数组） | `/provider`（`{all:[{id,name,env,options,source,models}]}`） | **重写解析** |
| 默认模型 | `/api/model/default` | 未见对应（`/config` 有 `model` 字段） | 改用 `/config` |
| 建会话 | `POST /api/session` body `{title,agent,model,permissions}` | `POST /session` body `{title}`（query: directory/workspace），**model 在 prompt 时指定** | 改流程 |
| 发消息 | `POST /api/session/:id/prompt` | `POST /session/{id}/prompt_async`（异步，**返回 204**） | 改端点 + 异步语义 |
| 事件流 | `/api/event`（SSE） | `/event`（SSE） | 改路径 |
| 权限回复 | `/api/session/:id/permission/:reqId/reply` | `/permission/{requestID}/reply`（body `{reply: once/always/reject}`） | 改路径 |
| 提问回复 | （未见） | `/question/{requestID}/reply`（body `{answers:[...]}`） | 新增 |
| 中断 | `/api/session/:id/interrupt` | `/session/{id}/abort`（POST） | 改路径 |
| 删除会话 | `DELETE /api/session/:id` | `DELETE /session/{id}`（返回 `true`） | 改路径 |
| 配置 | （未见） | `GET/PATCH /config` | 新增可用 |

---

## 3. 模型结构差异（catalog 重写依据）

opencode `LlmModelInfo` 关注：`id/providerID/name/enabled/capabilities/limit/cost`。
CodeArts `/provider` 模型字段（实测）：

```
id, providerID, api{id,url,npm}, name, model_type,
capabilities{ temperature, reasoning, attachment, toolcall, input{...}, output{...}, interleaved },
cost{ input:0, output:0, cache:{read:0,write:0} },
limit{ context, input, output },
status: "active",            ← 替代 enabled
options.creditRatioDisplay: "0.12x",   ← 积分消耗系数（替代「免费」判定）
variants: { low, high, max }  ← 思考档位（文档写 low/medium/high，实测无 medium）
```

**要点**：
- 没有 `enabled`，用 `status`。
- **cost 全 0**（不是免费，而是积分制），不能沿用「cost 全 0 = 免费」逻辑；应改用 `creditRatioDisplay` 或不做过滤。
- variants 是 `low/high/max`。

---

## 4. 事件模型（translate 适配依据）

实测 SSE 事件类型（`/event`）：

| type | 关键字段 |
| --- | --- |
| `server.connected` | — |
| `server.heartbeat` | — |
| `message.updated` | `info{id,role,agent,model,providerID,modelID,tokens,cost,finish,time}` |
| `message.part.updated` | `part{type, id, messageID, text?, reasoning?, tool?, state?, time}` |
| `message.part.delta` | `{messageID, partID, field:"text", delta}` |
| `session.updated` | `info{id,slug,directory,title,version,summary,time}` |
| `session.status` | `status.type: busy/idle` |
| `session.idle` | `sessionID` |
| `session.diff` | `diff[]` |
| `session.error` | `error{name,data.message}` |
| `tui.toast.show` | `message, variant, duration` |
| `permission.asked` | `properties = PermissionRequest`（见下） |
| `question.asked` | `properties = QuestionRequest` |
| `permission.replied` | `{sessionID, requestID, reply}` |

**part 类型**：`text` / `reasoning` / `tool` / `step-start` / `step-finish`。
**tool part**：`{type:"tool", tool:"bash", callID, state{status:pending/running/completed, input{command,description}, output, metadata{executeMode:"sandbox_mode", exit, sandbox, networkPolicy:"deny_all", executionTime}, title, time}}`。

**PermissionRequest**（OpenAPI，未实测触发）：
`{id:"per*", sessionID, permission, patterns[], metadata, always[], tool{messageID, callID}}`。

**与参照差异**：参照 `ServeEvent` 的 `tool-call`/`usage` 等类型与这里不完全一致，翻译层要按上述实测类型重写映射。

---

## 5. 权限/沙箱实测行为

- **默认（无 bash 规则）**：工具自动执行，`executeMode: sandbox_mode`，`networkPolicy: deny_all`，**不产生 permission 事件**。
- **`permission.bash = "ask"`**：第 3 次对话触发时收到 `session.error`（`UnknownError: No user message found in stream. This should never happen.`），**未观察到 `permission.asked`**。已还原为 `allow`。
- 结论：**默认模式下插件无需处理权限审批**；若未来要支持审批，需进一步研究 ask 模式的正确触发方式（当前实测会报错）。

---

## 6. 其他实测发现

- **目录信任**：CodeArts CLI 要求工作目录受信任；工作区 `D:\DSH-HUAWEI-CodeArt2API` 不被信任，需从受信任目录（如 `C:\Users\hbk`）启动 serve。
- **凭据**：CLI 授权只认 `CODEARTS_CLI_AK` / `CODEARTS_CLI_SK` 环境变量（当前版本）。
- **记忆注入**：用户消息 part 的 `metadata` 会带 `memoryIndexReminder` / `memoryContext`（CodeArts 记忆系统）。
- **标题自动生成**：会话 title 由模型自动生成（如「1+1等于几的简单提问」）。
- **错误码**：`GET /session/{不存在}` → 404 `NotFoundError`；`DELETE /session/{id}` → 200 `true`；无效 JSON → 400 `Malformed JSON in request body`；无效模型 prompt 仍返回 204（异步校验，错误走 SSE）。
- **OpenAPI**：`codearts generate` 可打印完整 OpenAPI（272 路径），是实现期权威契约。

---

## 7. 复用度汇总

| 模块 | 复用度 | 动作 |
| --- | --- | --- |
| 插件骨架 / settings / web 页面 | 高 | 照搬，改文案 |
| ServeManager | 高 | 改命令/环境变量/端口默认 |
| client.ts | 低 | 重写（路径、请求体、响应） |
| adapter / turn / translate | 中 | 框架复用，事件映射重写 |
| catalog / models | 低 | 重写（status/creditRatio/variants） |
| 工具权限白名单 | 低 | 重写（默认 sandbox 自动执行） |

**预估**：参照项目约 1.8MB 源码中，client/catalog/权限需重写，进程管理与插件骨架可复用。
