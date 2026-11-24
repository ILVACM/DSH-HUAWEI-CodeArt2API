# DSH-HUAWEI-CodeArt2API 预研方案（probe plan · 已含文档校验 + DSH 源码核实）

> 状态：**预研 + 路径决策 + 正式设计完成**（2026-11-22）。保底 A（serve 通道）已定；路径 C 受阻；设计稿见 [`_temp/design.md`](design.md)；证据见 [`_temp/report.md`](report.md)、目标见 [`_temp/target.md`](target.md)。
> 原则：本阶段只做探针与只读观测，**不改产品代码、不打包、不安装、不提交 git**。
> 制定日期：2026-11-20（补入全量文档校验；补入 DSH 源码核实；并入人工裁决：预算/端口/API/自定义模型/安装方式探针裁决）
> 上游依据：[`_temp/target.md`](target.md)
> 文档校验：[`_temp/probe/doc-crosscheck.md`](probe/doc-crosscheck.md)（证据 `doc-facts-core.md`、`doc-facts-clients.md`）
> DSH 源码核实：[`_temp/probe/dsh-facts.md`](probe/dsh-facts.md)（源码 `D:\deepseek-harness`）
> 参照项目：`D:\DSH-Opencode2API-hbk`（`@hbk/dsh-opencode-local`，已验收 0.2.8-3）

---

## 1. 目标与完成定义（DoD）

**目标**：在正式设计/实现插件之前，把 `codearts serve` 通道的**所有契约面**与 **DSH 插件面**都搞清楚，做到「没有未知项」。

**完成定义（必须同时满足）**：

1. 问题台账中**所有问题状态 = closed**，且每条 closed 都指向证据文件（文档行号 / DSH 源码行号 / 探针原始输出）。
2. **文档已明确的部分**有来源行号；**文档未覆盖的部分**有实测证据；**DSH 侧**有源码依据。
3. 关键契约面全部有结论：服务启动、鉴权、`/api/info`、`/api/model`、`/api/model/default`、`/api/event`（SSE）、会话创建、prompt、权限/审批、中断、删除、错误事件、模型 variants（自定义模型不做验证，已裁决）。
4. 与参照项目（opencode 基线）的**逐字段差异清单** `_temp/probe/gap-report.md` 已产出。
5. `target.md` 中「待验证点 / 待人工确认项」被结论替换或标注，无遗留「待验证」。
6. 复用度评估明确：哪些模块原样复用、哪些改、哪些重写，给出理由。

---

## 2. 自适应机制

- **台账驱动**：所有不明确点登记为问题（Q 编号），每条含「探针方法 / 判定标准 / 证据路径 / 状态」。
- **三层取证**：①先查官方文档（已做）；②再查 DSH 源码（已做）；③只剩接口契约靠探针实测。探针只打前两层未覆盖的项。
- **滚动收敛**：每跑完一批探针就更新台账；**发现新问题立即追加**，再补探针，直到台账清零。
- **证据留档**：每个探针的原始输出落盘到 `_temp/probe/results/<Q编号>-*`。
- **判定权**：探针结论若含推测，标注「推测」并追加验证探针；只有实测才能标 closed。
- **止损**：真实对话探针消耗积分，**对话类探针总预算 ≤ 10 次**（人工裁决 2026-11-20 放宽）。

---

## 3. 问题台账（含文档校验 + DSH 源码核实）

> 「依据」列取值：`doc` = 官方文档已明确；`dsh` = DSH 源码已核实；`部分` = 部分明确；`probe` = 前两层未覆盖，必须探针；`决策` = 人工取舍。
> 处置：`关闭` / `简化` / `保留`。

### A. 环境与版本

| ID | 问题 | 探针方法 | 依据 | 处置 |
| --- | --- | --- | --- | --- |
| Q-A1 | `codearts serve` 可用性与版本 | `codearts --version`；`codearts serve --help` | `doc`（serve 存在；CLI 2857） | 简化（复核本机） |
| Q-A2 | 参照依赖 opencode 版本 | `opencode --version` | `dsh`（非文档范围） | 保留 |
| Q-A3 | Node / PowerShell 版本 | `node -v`；`$PSVersionTable` | `dsh` | 保留 |
| Q-A4 | DSH 版本、profile、插件机制 | 读 `D:\deepseek-harness` 与 DSH 安装 | `dsh`（all-plugin Cordis；AGENTS.md L3） | 简化（已明确，复核版本） |
| Q-A5 | 端口占用（4096 等） | `netstat -ano` | `doc`（默认 4096，CLI 3151-3153） | 简化 |
| Q-A6 | 数据目录角色 | `codearts debug paths`（只读） | `doc`（`~/.codeartsdoer`、`cli-data/opencode.db`） | 关闭 |
| Q-A7 | 参照项目运行态 | 只读查进程/端口/profile | `dsh` | 保留 |

### B. 登录与凭据

| ID | 问题 | 探针方法 | 依据 | 处置 |
| --- | --- | --- | --- | --- |
| Q-B1 | 登录态存放位置 | 只读列目录 + `codearts debug paths` | `部分`（MCP 凭据在 `cli-data/mcp-auth.json`；网页登录态未覆盖） | 保留 |
| Q-B2 | serve 是否复用登录态 | 已登录状态起 serve，调 `/api/model` | `部分` | 保留 |
| Q-B3 | serve 凭据环境变量 | 不带/带环境变量分别起 serve | `doc`（强制 USERNAME+PASSWORD，CLI 2859-2871） | 关闭 |
| Q-B4 | HTTP 鉴权头格式 | 多种头试探（无/Basic user:pass/Basic opencode:pass/Bearer） | `probe` | **保留（重点）** |
| Q-B5 | 未登录/凭据过期行为 | 临时移走/清空凭据（先备份）后请求 | `probe` | 保留 |
| Q-B6 | 凭据多进程共享/加锁 | 同时起两个 serve | `probe` | 保留（低优先） |

### C. serve 服务契约（核心）

| ID | 问题 | 探针方法 | 依据 | 处置 |
| --- | --- | --- | --- | --- |
| Q-C1 | serve 完整参数表 | `codearts serve --help` | `doc`（5 参数，CLI 3149-3196） | 关闭 |
| Q-C2 | 启动就绪信号 | 起 serve 抓 stdout/stderr | `doc`（`server listening on ...`，CLI 3217） | 关闭 |
| Q-C3 | OpenAPI 获取 | `codearts generate` 抓 stdout | `部分`（方法已知，CLI 2917-2918） | 简化 |
| Q-C4 | `/api/info` 结构 | GET | `probe` | 保留 |
| Q-C5 | `/api/model` 结构 | GET | `probe` | 保留 |
| Q-C6 | `/api/model/default` | GET | `probe` | 保留 |
| Q-C7 | `/api/event` SSE 帧与事件全集 | 建会话发 prompt 抓 SSE | `probe` | **保留（重点）** |
| Q-C8 | 会话创建请求体/响应 | POST `/api/session` 多组合 | `probe` | 保留 |
| Q-C9 | prompt 请求体/响应 | POST `/api/session/:id/prompt` | `probe` | 保留 |
| Q-C10 | 权限请求事件/reply | 触发工具调用 | `probe`（审批模式已知：手动/自动/完全访问） | 保留 |
| Q-C11 | interrupt / delete | 调用并观察 | `probe` | 保留 |
| Q-C12 | 会话列表/标题 | GET `/api/session` | `部分`（CLI `session list`；本地 db） | 保留 |
| Q-C13 | 错误事件格式 | 故意触发（错模型/超长/限流） | `probe` | 保留 |
| Q-C14 | usage/tokens 事件 | 对话中抓 | `probe` | 保留 |
| Q-C15 | reasoning/thinking 块 | 用支持思考的模型对话 | `probe` | 保留 |
| Q-C16 | tool-call 事件 | 触发工具 | `probe` | 保留 |
| Q-C17 | variants | 查 `/api/model` 的 variants | `doc`（low/medium/high，CLI 1904-1908/2062-2075） | 关闭 |
| Q-C18 | 自定义模型可见性 | —— | `决策` | 关闭（自己的模型重配即可，不做验证） |
| Q-C19 | serve 并发/多会话 | 同时建 2 个会话 | `probe` | 保留 |
| Q-C20 | serve 会话生命周期 | 起服务静置/建删会话观察 | `probe` | 保留 |

### D. 与 opencode 基线对照

| ID | 问题 | 探针方法 | 依据 | 处置 |
| --- | --- | --- | --- | --- |
| Q-D1 | 同源证据（schema/db/plugin） | 对照参照源码 | `doc`（`$schema`/`opencode.db`/`@opencode-ai/plugin`） | 关闭 |
| Q-D2~D4 | 请求体/响应/事件 diff | 与参照 `client.ts`/`types.ts` 逐条 | `probe` | 保留 |
| Q-D5 | 鉴权 diff | 与 `OPENCODE_PASSWORD`+Basic 对比 | `部分` | 保留 |
| Q-D6 | 数据目录 diff | 对照 | `doc`（`~/.codeartsdoer/cli-data/opencode.db`） | 关闭 |
| Q-D7 | OpenAI 兼容端点 | 探测 `/v1/chat/completions` 类端点 | `probe` | 保留（备选入口） |
| Q-D8 | 客户端侧错误码/限流码 | 触发 401/402/429 | `probe` | 保留 |

### E. DSH 侧契约（插件实现面）

> 依据：`D:\deepseek-harness` 源码，详见 [`dsh-facts.md`](probe/dsh-facts.md)。

| ID | 问题 | 取证方式 | 依据 | 处置 |
| --- | --- | --- | --- | --- |
| Q-E1 | 插件 API（registerAdapter/settings/webServer/inject/effect） | 读源码 | `dsh`（llm/src/index.ts L223-445；settings/src/index.ts L266；web-app bundle） | 关闭 |
| Q-E2 | provider id 命名约束 | 读源码 | `dsh`（非空+唯一+id 一致，llm/src/index.ts L456-463） | 关闭（实测注册成功） |
| Q-E3 | 模型列表/解析接口签名 | 读源码 | `dsh`（listModels/resolveModel/prepareCall/stream） | 关闭 |
| Q-E4 | 工具政策接口 | 读源码 + 参照实现 | `dsh`（参照把审批放在插件内；DSH 权限事件是否影响需实现期确认） | 简化 |
| Q-E5 | 思考档位接口 | 读源码 | `dsh`（reasoning.efforts，types.ts L413-432） | 关闭 |
| Q-E6 | 上下文状态接口 | 读源码 + 参照实现 | `dsh`（sessions/sessionProjections/tokenMeter） | 关闭 |
| Q-E7 | 打包/安装/重启流程（源码依据） | 读源码 + 参照 README | `dsh`（官方 `install_bundle`+包目录；tgz 方式需核对） | 简化（转 Q-E10 实测） |
| Q-E8 | 与既有 opencode-local 插件共存 | 读源码 | `dsh`（不同 provider id + 独立端口/目录） | 关闭 |
| Q-E9 | 是否需要对外 HTTP API 入口 | —— | `决策` | 关闭（只做 DSH 插件，不对外提供 API） |
| Q-E10 | 安装方式实测：tgz vs `install_bundle` | 见 P6.5 探针 | `probe` | 保留（重点） |
| Q-E11 | 安装后生效条件（重启 DSH / profile 隔离） | 见 P6.5 探针 | `probe` | 保留 |
| Q-E12 | 参照项目 tgz 能否直接安装 | 见 P6.5 探针 | `probe` | 保留 |

### F. 账号/计费

| ID | 问题 | 探针方法 | 依据 | 处置 |
| --- | --- | --- | --- | --- |
| Q-F1 | 积分/用量可见性 | 对话后查 `/api/model` 或事件；`codearts stats` | `doc`（积分实时扣减；CLI 2794-2812） | 关闭 |
| Q-F2 | 限流/额度错误码 | 触发或抓包 | `部分`（滑动窗口 5h/7d，FAQ 575-611） | 保留 |
| Q-F3 | 免费/付费模型字段 | 查 `/api/model` cost/enabled | `部分`（无 free 字段，只有积分系数） | 保留 |

### G. 风险/边界

| ID | 问题 | 探针方法 | 依据 | 处置 |
| --- | --- | --- | --- | --- |
| Q-G1 | serve 暴露面 | 查默认监听与 mdns/cors | `doc`（默认 127.0.0.1；安全横幅；CLI 3151-3196/3212-3216） | 关闭 |
| Q-G2 | 跨工作区/多 isolate | 多目录起会话 | `dsh` | 保留 |
| Q-G3 | 版本漂移 | 记录版本与契约 | `doc`（文档版本 01；本机 26.11.11） | 关闭 |

---

## 4. 阶段与执行流程

> 原则：`doc`/`dsh` 项只做复核，`probe` 项重点投入；发现新问题追加台账。

### P0 环境盘点（零副作用）
- 执行 Q-A1~A7、B1（只读）、复核 DSH 版本/安装。
- 复核文档/源码已明确项：`codearts debug paths`、默认端口、serve 参数、`registerAdapter` 签名。
- 端口策略：从 **4196** 起，被占用则**自适应递增**（4196→4197→…），直到拿到空闲端口。
- 产物：`A-env.txt`、`B-creds-paths.txt`。
- 关口：端口选定、DSH 版本、数据目录确认。

### P1 serve 启动与 OpenAPI
- 执行 Q-B2、B3、C1、C2、C3。
- 步骤：设 `CODEARTS_SERVER_USERNAME/PASSWORD` → 起 `codearts serve --hostname 127.0.0.1 --port <选定>`（后台、日志重定向）→ 抓 `codearts generate` 与 `/api/info`。
- 产物：`C-serve-start.log`、`C-openapi.txt`。
- 关口：服务能起、能就绪、OpenAPI 可取。

### P2 只读接口探针
- 执行 Q-C4、C5、C6、C12、F1、F3。
- 产物：`C-info.json`、`C-model.json`、`C-model-default.json`、`C-session-list.json`。
- 关口：模型字段与 free 语义明确。

### P3 鉴权探针（重点）
- 执行 Q-B4、B5、D5、D8。
- 方法：同 P1 服务，分别用不同鉴权头请求；触发限流/错误码。
- 产物：`B-auth-matrix.txt`、`D-errors.txt`。
- 关口：鉴权头格式唯一确定。

### P4 会话与流式探针（≤6 次对话）
- 执行 Q-C7、C8、C9、C13、C14、C15、C16、C19、C20、D2~D4。
- 产物：`C-sse-*.log`、`C-session.json`。
- 关口：事件全集与字段明确。

### P5 权限/工具探针（≤4 次对话）
- 执行 Q-C10、C11、E4。
- 产物：`C-permission-*.log`。
- 关口：审批闭环可复现。

### P6 自定义模型可见性 —— 已裁决不做
- 理由：都是自己的模型，需要时重配一次即可，无需在预研中验证。Q-C18 关闭。

### P6.5 安装方式探针（有副作用，需可还原）
- 执行 Q-E10、E11、E12。
- 步骤：①只读探测 DSH CLI（`dsh plugin --help`）与 `plugin_manager install_bundle` 参数；②记录 DSH profile 现状；③用参照项目的 tgz 或最小测试包实测安装；④观察是否需重启 DSH、是否 profile 隔离；⑤卸载/还原 profile，记录 before/after。
- 产物：`E-install-probe.log`、`E-install-matrix.md`。
- **裁决规则（自适应）**：
  - `dsh plugin --profile web add <tgz>` 可用 → 用 tgz（与参照项目一致）。
  - 不可用但 `install_bundle` 可用 → 用包目录方式。
  - 两者都可用 → 优先 tgz，`install_bundle` 记为备选。
  - 都不可用 → 阻塞并报告。
- 关口：安装方式唯一确定，且还原方案可用。

### P7 对照与差异汇总
- 执行 Q-D1~D8（基于落盘证据与参照源码）。
- 产物：`_temp/probe/gap-report.md`。
- 关口：差异清单无遗漏。

### P8 收敛与交付
- 更新台账：所有问题 closed。
- 用结论更新 `_temp/target.md` 的「待验证点 / 待人工确认项」。
- 产出复用度评估与「正式设计输入清单」。
- 人工确认后，预研结束。

---

## 5. 产物清单

```
_temp/probe/
  doc-facts-core.md          # 已产出：核心文档事实
  doc-facts-clients.md       # 已产出：各端文档事实
  doc-crosscheck.md          # 已产出：文档校验对照表
  dsh-facts.md               # 已产出：DSH 源码事实（E 域）
  open-questions.md          # 问题台账（滚动更新）
  results/                   # 原始证据
    A-env.txt
    B-creds-paths.txt
    B-auth-matrix.txt
    D-errors.txt
    C-serve-start.log
    C-openapi.txt
    C-info.json
    C-model.json
    C-model-default.json
    C-session-list.json
    C-sse-*.log
    C-session.json
    C-permission-*.log
    E-install-probe.log
    E-install-matrix.md
  gap-report.md              # 复用度评估 + 差异清单（交付物）
```

---

## 6. 预算与安全约束

- **对话预算**：真实模型调用合计 ≤ 10 次（P4 ≤6、P5 ≤4）；每次记录消耗。
- **只读优先**：能靠 GET/HEAD 或 CLI 只读命令得出的结论，不做对话。
- **凭据安全**：不读取、不外发、不写入产物；凭据文件改动前必须备份，跑完还原。
- **端口**：只用 127.0.0.1；从 4196 起**动态递增**（占用则 +1）；不启用 `--mdns`/`--cors *`。
- **进程清理**：每阶段结束杀掉探针起的 serve 进程（taskkill /PID /T /F）。
- **环境可逆**：任何对 `codearts_cli.json` / 凭据的改动，记录 before/after 并可一键还原。
- **DSH 源码只读**：不修改 `D:\deepseek-harness` 任何文件。

---

## 7. 决策记录与执行结果

### 已裁决
1. ✅ 对话预算放宽到 **≤10 次**（2026-11-20）。
2. ✅ 端口 **4196 起，占用则自适应递增**（2026-11-20）。
3. ✅ **不做**对外 HTTP API 入口（Q-E9 关闭）——本插件只服务 DSH（2026-11-20）。
4. ✅ **不验证**自定义模型（Q-C18 关闭）——自己的模型重配即可（2026-11-20）。
5. ✅ 安装方式：探针实测（P6.5）→ **裁决用 tgz**（2026-11-21）。
6. ✅ 权限补测（2026-11-21）→ 确认 serve 端权限状态（见下）。

### 执行结果（2026-11-21）

- **已完成**：P0、P1、P2、P3、P4、P5（含权限补测）、P6（不做）、P6.5、P7。
- **台账**：所有保留项均已实测关闭，结论见 [`report.md`](report.md) 与 [`gap-report.md`](probe/gap-report.md)。
- **关键结论**：
  - 通道：`codearts serve` 可用；路径**无 `/api` 前缀**；Basic `username:password`；异步 `prompt_async`（204）。
  - 权限：serve 端只有「**放行（sandbox 自动执行）** / **禁用（deny）**」两档；`ask` 不触发询问；`bash_mode` / `global.json` 对 serve **不生效**。
  - 安装：**tgz 方式可用**。
  - 复用度：插件骨架 / 进程管理**可复用**；HTTP 客户端 / 模型目录 / 权限层**需重写**。
- **对话消耗**：10 / 10（预算用满）。
- **环境**：权限配置已还原（有备份对照），serve 已停。

### 保底方案（2026-11-21 明确）
- **路径 A（serve 通道）为保底**：复用 `codearts serve`，工具在 CodeArts 侧执行。该路径已全量验证（见 [`report.md`](report.md)）；若路径 C 不可行，则按此实现。

### 路径 C 验证结论（2026-11-22）
- **直连模型 API：签名通道格式可行，但凭据刷新是私有机制**：端点在（`/api/v2/chat/completions`）；用解密出的华为云 STS 凭据做 `SDK-HMAC-SHA256` 签名，APIG 已接受格式（仅因凭据过期返回 Unauthorized）。卡点：STS 会过期，刷新走 CodeArts 私有 OAuth（`client_id=CodeArts_Tui`、DPoP，端点未公开）。详见 [`report.md`](report.md) 第九节。
- **保底 A（serve 通道）不变**。
- 若需「工具归 DSH」：建议评估 **MCP 桥接**（serve + 暴露 DSH 工具为 MCP），比直连现实。

### 待确认
- 是否进入**正式设计**（输出设计文档：模块划分、接口映射、文件清单）。
