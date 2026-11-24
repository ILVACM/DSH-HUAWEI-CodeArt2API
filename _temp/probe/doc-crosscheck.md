# 文档校验对照表（doc × probe）

> 用途：把 [`_temp/plan.md`](../plan.md) 的问题台账逐条对照 `_temp/pdf_text/` 官方文档，标注文档是否已明确，决定哪些探针可关闭、哪些必须保留。
> 证据来源：`_temp/probe/doc-facts-core.md`、`_temp/probe/doc-facts-clients.md`（均含来源文件+行号）。
> 校验日期：2026-11-20
> 结论类型：**已明确**（可关闭探针）/ **部分明确**（探针可简化）/ **未覆盖**（必须探针）。

---

## 0. 总结

| 结论类型 | 数量 | 含义 |
| --- | --- | --- |
| 已明确 | 15 | 文档直接给出答案，探针可关闭或降为验证性 |
| 部分明确 | 10 | 文档给出方法/部分字段，细节仍需探针 |
| 未覆盖 | 25 | 文档完全没写，必须靠探针 |
| 非文档范围 | 9 | DSH 侧契约（E 域），文档不涉及，须读 DSH 源码 |

**关键判断**：文档把「CLI 怎么用」讲得很细，但**对 `codearts serve` 的 HTTP 接口契约几乎只字未提**（只给了启动参数和 `codearts generate` 这条命令）。因此「接口同构性」这条决定工作量的主线**仍必须探针**，不能被文档替代。

---

## 1. A 环境与版本

| ID | 文档结论 | 来源 | 结论类型 | 对预研的影响 |
| --- | --- | --- | --- | --- |
| Q-A1 | `codearts serve` 存在；`codearts --version` 打印版本；安装走 PowerShell `irm ...install.ps1 \| iex` | CLI 2838-2839、119-124 | 已明确 | 探针降为验证本机版本 |
| Q-A2 | 参照依赖 opencode（非本文档范围） | — | 非文档范围 | 读参照项目/本机 |
| Q-A3 | 运行时版本（非文档范围） | — | 非文档范围 | 本机探测 |
| Q-A4 | DSH 版本/profile（非文档范围） | — | 非文档范围 | 读 DSH |
| Q-A5 | serve 默认 `--port 4096` | CLI 3151-3153 | 已明确 | 端口规划据此 |
| Q-A6 | 数据/配置根 `~/.codeartsdoer`；会话存 `cli-data/opencode.db`；权限文件 `cli-data/storage/permission/global.json`；`codearts debug paths` 可打印核心目录 | CLI 316-319、2495-2496、3074-3077 | 已明确 | 可关闭（用 debug paths 复核） |
| Q-A7 | 参照项目运行态（非文档范围） | — | 非文档范围 | 本机探测 |

## 2. B 登录与凭据

| ID | 文档结论 | 来源 | 结论类型 | 对预研的影响 |
| --- | --- | --- | --- | --- |
| Q-B1 | 网页登录态存放位置**未覆盖**；MCP OAuth 凭据在 `cli-data/mcp-auth.json`；自定义模型 apiKey 加密为 `enc:v1:` | CLI 3329、1919-1920 | 部分明确 | 探针保留（找登录态文件） |
| Q-B2 | serve 复用登录态**未直接说明**；但已知会话存本地 db | CLI 2495-2496 | 部分明确 | 探针保留 |
| Q-B3 | serve **强制**要求 `CODEARTS_SERVER_USERNAME` 与 `CODEARTS_SERVER_PASSWORD`，否则报 `Error: CODEARTS_SERVER_PASSWORD is not set; ...` | CLI 2859-2871 | 已明确 | 可关闭（必填项+报错文案已知） |
| Q-B4 | 鉴权头如何组成（Basic? username:password?）**未覆盖**；仅知 attach 用 `--password` 或环境变量 | CLI 2872-2875、3227-3241 | 未覆盖 | **必须探针** |
| Q-B5 | 未登录/凭据过期行为**未覆盖** | — | 未覆盖 | 探针保留 |
| Q-B6 | 凭据多进程共享/加锁**未覆盖** | — | 未覆盖 | 探针保留（低优先） |

## 3. C serve 服务契约（核心）

| ID | 文档结论 | 来源 | 结论类型 | 对预研的影响 |
| --- | --- | --- | --- | --- |
| Q-C1 | serve 参数共 5 个：`--port`(4096)、`--hostname`(127.0.0.1)、`--mdns`、`--mdns-domain`(codearts.local)、`--cors` | CLI 3149-3196 | 已明确 | 可关闭 |
| Q-C2 | 就绪信号：`codearts server listening on http://127.0.0.1:4096` | CLI 3217 | 已明确 | 可关闭 |
| Q-C3 | OpenAPI 获取：`codearts generate` 打印服务端 OpenAPI 描述（含 JS SDK 示例）到 stdout | CLI 2917-2918 | 部分明确 | 方法已知，内容仍要抓 |
| Q-C4 | `/api/info` 字段 **未覆盖** | — | 未覆盖 | 必须探针 |
| Q-C5 | `/api/model` 字段 **未覆盖**（仅知 CLI 用 `codearts models`，TUI `/models`） | CLI 2777-2791 | 未覆盖 | 必须探针 |
| Q-C6 | `/api/model/default` **未覆盖** | — | 未覆盖 | 必须探针 |
| Q-C7 | `/api/event` SSE 事件类型 **未覆盖** | — | 未覆盖 | **必须探针** |
| Q-C8 | `/api/session` 请求体/响应 **未覆盖** | — | 未覆盖 | 必须探针 |
| Q-C9 | `/api/session/:id/prompt` **未覆盖** | — | 未覆盖 | 必须探针 |
| Q-C10 | 权限请求事件/reply **未覆盖**（但审批模式已知，见 E 域） | — | 未覆盖 | 必须探针 |
| Q-C11 | interrupt/delete **未覆盖** | — | 未覆盖 | 必须探针 |
| Q-C12 | 会话列表：CLI `session list`；本地存 `opencode.db`；仅展示近 30 天 | CLI 2493-2496、2802-2812 | 部分明确 | serve 侧列表接口仍要探针 |
| Q-C13 | 错误事件格式 **未覆盖**（FAQ 有登录/限流/沙箱等文字报错，非接口格式） | FAQ 117-139、575-611 | 未覆盖 | 必须探针 |
| Q-C14 | usage/tokens 事件 **未覆盖** | — | 未覆盖 | 必须探针 |
| Q-C15 | reasoning 块 **未覆盖** | — | 未覆盖 | 必须探针 |
| Q-C16 | tool-call 事件 **未覆盖** | — | 未覆盖 | 必须探针 |
| Q-C17 | variants：low/medium/high；`run --variant`、TUI `/variants` | CLI 1904-1908、2062-2075 | 已明确 | 可关闭 |
| Q-C18 | 自定义模型配置字段已知（provider/models/options/apiKey 加密/npm 默认 `@ai-sdk/openai-compatible`/baseURL 补全）；但 **serve 是否路由自定义模型未覆盖** | CLI 1844-2066 | 部分明确 | 探针保留（验证可见性） |
| Q-C19 | serve 侧并发/多会话 **未覆盖**（CLI 并发数：体验版 3、标准+ 5） | 计费 259-263 | 未覆盖 | 必须探针 |
| Q-C20 | serve 侧会话生命周期 **未覆盖** | — | 未覆盖 | 必须探针 |

## 4. D 与 opencode 基线对照

| ID | 文档结论 | 来源 | 结论类型 | 对预研的影响 |
| --- | --- | --- | --- | --- |
| Q-D1 | `$schema` = opencode 配置；会话存 `opencode.db`；Hook import `@opencode-ai/plugin` | CLI 2091、2495-2496、1286 | 已明确 | 同源证据成立 |
| Q-D2~D4 | 接口/请求体/事件 diff 需探针（文档未给字段） | — | 未覆盖 | 必须探针 |
| Q-D5 | 鉴权 diff（文档只给 username/password） | CLI 2859-2875 | 部分明确 | 探针保留 |
| Q-D6 | 数据目录：`~/.codeartsdoer/cli-data/opencode.db` | CLI 2495-2496 | 已明确 | 可关闭 |
| Q-D7 | serve 是否暴露 `/v1/chat/completions` **未覆盖** | — | 未覆盖 | 必须探针（备选入口） |
| Q-D8 | 客户端侧错误码 **未覆盖**（REST API 错误码与 serve 无关） | API 1666-1678 | 未覆盖 | 必须探针 |

## 5. E DSH 侧契约（插件实现面）

| ID | 文档结论 | 来源 | 结论类型 | 对预研的影响 |
| --- | --- | --- | --- | --- |
| Q-E1~E9 | 文档**完全不涉及 DSH** | — | 非文档范围 | 读 DSH 源码/参照项目，不属文档校验 |

> 注：CodeArts 自身的 Hooks/插件机制（`chat.message`、`permission.ask` 等事件，`@opencode-ai/plugin`）与 DSH 插件是两套东西，不能混为一谈；但 Hooks 是 CodeArts 内部扩展点，可作为后续「不改 serve 而调行为」的备选手段（CLI 1130-1279）。

## 6. F 计费与限额

| ID | 文档结论 | 来源 | 结论类型 | 对预研的影响 |
| --- | --- | --- | --- | --- |
| Q-F1 | 积分按请求实时扣减、成功才扣；用量可 `codearts stats` / 控制台查 | 计费 71-98、CLI 2794-2812 | 已明确 | 可关闭（接口字段仍看探针） |
| Q-F2 | 限流：滑动窗口（5 小时/7 天），双维度（Token/频次）；FAQ 有文字文案；客户端侧码未覆盖 | FAQ 575-611 | 部分明确 | 探针保留（抓真实码） |
| Q-F3 | 模型**无「免费/付费」字段**，只有积分消耗系数；自定义模型调用不扣积分 | 计费 100-117、1324-1326 | 部分明确 | 探针保留（确认 `/api/model` 是否有 cost/free 语义） |

## 7. G 风险边界

| ID | 文档结论 | 来源 | 结论类型 | 对预研的影响 |
| --- | --- | --- | --- | --- |
| Q-G1 | 默认 `127.0.0.1`；官方安全横幅明确「勿暴露公网」；`--cors *` 有安全警告；`--mdns` 仅局域网 | CLI 3151-3196、3212-3216 | 已明确 | 可关闭 |
| Q-G2 | 跨工作区/多 isolate（非文档范围） | — | 非文档范围 | 探针/设计期处理 |
| Q-G3 | 版本漂移：文档标注版本 01，本机 26.11.11 | CLI 3 | 已明确 | 纳入监控建议 |

---

## 8. 对预研方案的修正（据此更新 plan.md）

1. **可关闭/降级**（文档已明确）：Q-A1、A5、A6、B3、C1、C2、C17、D1、D6、F1、G1、G3。
2. **必须保留探针**（文档未覆盖）：Q-B4、C4~C11、C13~C16、C19、C20、D2~D4、D7、D8、F2、F3。
3. **方法已知、内容待抓**：Q-C3（`codearts generate`）、Q-C18（自定义模型配置字段已知）。
4. **E 域**全部改为「读 DSH 源码/参照项目」路径，不占用文档校验。
5. 主线结论不变：**serve 的 HTTP/SSE 契约必须实测，这是决定复用度的唯一硬依据。**
