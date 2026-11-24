# 华为云码道 CodeArts 接入 DSH —— 官方文档事实提取（核心）

> 提取原则：只记录文档**明确规定**的事实，不做推测、不做方案设计。行号基于 `_temp/pdf_text/` 下的纯文本文件。
> 来源简称：
> - **CLI** = `华为云码道CodeArts代码智能体 用户指南（码道CLI）.txt`
> - **API** = `华为云码道CodeArts代码智能体 API参考.txt`
> - **计费** = `华为云码道CodeArts代码智能体 计费说明.txt`
> - **活动** = `华为云码道CodeArts代码智能体 活动.txt`
> - **入门** = `华为云码道CodeArts代码智能体 快速入门.txt`
> - **产品** = `华为云码道CodeArts代码智能体 产品介绍.txt`

---

## A. 环境与版本

- **安装方式（Windows）**：仅支持 PowerShell 执行 `irm https://cnnorth4-cloudide-marketplace.obs.cn-north-4.myhuaweicloud.com/codearts/cli_tui/install_script/install.ps1 | iex`，安装完成回显版本号即成功。〔CLI 119-124〕
- **安装方式（macOS/Linux）**：`sh -c "$(curl -L https://.../install_script/install.sh)" && export PATH=~/.codeartsdoer/installers:$PATH`，两者安装方式相同。〔CLI 133-140〕
- **支持的系统**：Windows 推荐 Win11(x64)，Win10(x64) 需 2019 及以上；macOS 11+（兼容 ARM64）；Linux 含 Huawei Cloud EulerOS 2.0、SUSE 12 SP5、Ubuntu 18.04/20.04/22.04/24.04 LTS、Debian 10/11/12、CentOS 8、RHEL 8/9。〔CLI 76-82〕
- **产品形态/命令入口**：CLI 提供 TUI（终端交互）与 CLI（命令行）双形态；在项目目录执行 `codearts` 进入 TUI，执行 `codearts [command]` 进入 CLI 开发模式。〔CLI 63-69、2723-2724〕
- **版本信息**：文档标注「文档版本 01」；`codearts --version` 打印版本号。〔CLI 3、2838-2839〕
- **升级机制**：启动时若非最新版本会提示自动升级（输入 Yes，出现 “Installation Successful” 即成功）；手动执行 `codearts upgrade`，回显出现 Done 即完成。〔CLI 300-308〕
- **配置/数据目录**：个人级配置与数据根目录为 `~/.codeartsdoer`（Windows 等同 `C:\Users\用户名\`）；权限文件在 `~/.codeartsdoer/cli-data/storage/permission/global.json`，bash_mode 在 `~/.codeartsdoer/cli-data/storage/permission/config.json`。〔CLI 319、337-338、412-425〕
- **项目级配置目录**：`项目根目录/.codeartsdoer/`（codearts_cli.json / codearts_cli.jsonc / commands / skills / plugin 等）。〔CLI 423-425、486、1043-1045、1143-1152〕
- **`codearts debug paths`**：含义「显示全局路径信息」，用途「输出核心目录路径，包括数据目录、配置目录、缓存目录或者状态目录，用于排查文件找不到、权限问题」。〔CLI 3074-3077〕
- **调试命令族**：`codearts debug config`（解析后的完整配置）、`debug rg`（ripgrep 调试）、`debug file`（文件系统调试）、`debug scrap`（已知项目）、`debug skill`（技能列表）、`debug agent <name>`（智能体配置）、`debug paths`、`debug wait`。〔CLI 3043-3081〕

---

## B. 登录与凭据

- **网页端登录授权**：仅支持 TUI 开发模式；输入 `codearts` 后自动跳转外部浏览器华为云登录页，登录成功后系统自动完成授权。〔CLI 146-153〕
- **AK/SK 授权适用模式**：适用于 TUI/CLI 开发模式；分「进程级临时授权」与「系统环境变量永久授权」两种。〔CLI 154-160〕
  - 进程级：仅当前终端会话生效，窗口关闭即失效，无需持久化存储密钥。〔CLI 157-158、246-248〕
  - 永久：写入系统 Shell/Windows 环境变量，新开终端或重启后仍有效。〔CLI 159-160、240-245〕
- **环境变量名**：`CODEARTS_CLI_AK`（值 = Access Key Id）、`CODEARTS_CLI_SK`（值 = Secret Access Key）。〔CLI 179-199、213-214、255-256、272-273〕
- **密钥来源**：通过「访问密钥」新建，下载保存 `credentials.csv` 获取 AK/SK；关闭弹窗后无法再次获取。〔CLI 162-171〕
- **验证授权是否生效**：执行 `codearts models`，成功回显 `model_id`、`model_name` 即成功。〔CLI 260-262、279-281〕
- **凭据存放位置**：
  - MCP OAuth 认证凭据写入 `~/.codeartsdoer/cli-data/mcp-auth.json`；`codearts mcp logout` 会删除其中对应配置。〔CLI 3329、3344〕
  - 自定义模型 `apiKey` 首次加载时明文会自动加密为 `enc:v1:` 格式并写回配置文件（示例中出现 `enc:v3:`）。〔CLI 1919-1920、1950-1953、2102〕
  - 网页登录态的本地存放文件/字段：**文档未覆盖**。
- **登录态复用**：已登录码道代码智能体时，执行 `codearts` 直接进入 TUI 开发环境（无需重复登录）。〔入门 259〕
- **Token/过期机制**：
  - CLI 登录态的 token 有效期/刷新机制：**文档未覆盖**。
  - `API` 中 Token 认证「有效期为 24 小时」，可缓存复用（仅针对 API参考中的同步接口，非 CLI 登录态）。〔API 313-318〕
  - `API` 支持 AK/SK 与 Token 两种认证；AK/SK 签名仅支持消息体 12M 以内，超过请用 Token。〔API 291-318〕
- **控制台账号命令**：`codearts console` 含 `login`（控制台账号登录）、`logout`（登出）、`switch`（切换当前组织）、`orgs`（查看所属组织）。〔CLI 2909-2916〕

---

## C. serve 服务契约（最重要）

### C.1 `codearts serve` 参数与默认值（表 19-10）

- **命令定义**：`codearts serve` = 「启动无界面的服务器」。〔CLI 2857〕
- **前置条件（强制）**：执行 serve 前必须先设置 `CODEARTS_SERVER_USERNAME` 与 `CODEARTS_SERVER_PASSWORD`，否则报错：`Error: CODEARTS_SERVER_PASSWORD is not set; please configure the password to start the server.`；账号与密码由用户自行设置。〔CLI 2859-2871〕
- **`--port`**：指定服务器监听端口，**默认端口 4096**。例：`codearts serve --port 4096`。〔CLI 3151-3153〕
- **`--hostname`**：服务器监听地址，**默认值 127.0.0.1**。例：`codearts serve --hostname 127.0.0.1`。〔CLI 3156-3160〕
- **`--mdns`**：启用 mDNS 局域网零配置服务发现，同局域网设备可自动扫描访问，无需手动填本机 IP；通过 `.local` 域名访问 Web 管理页面与 MCP 接口。例：`codearts serve --port 4096 --mdns`。〔CLI 3163-3168〕
- **`--mdns-domain`**：需配合 `--mdns`，自定义 mDNS 主机名前缀，**默认值 `codearts.local`**；不写则自动用 `codearts` 前缀拼接 `.local`。例：`--mdns-domain dev-server` → `http://dev-server.local:4096`。〔CLI 3169-3178〕
- **`--cors <origin>`**：给外部网页开放跨域权限，可多次配置多个来源；传 `*` 放行所有网页（仅本地调试用，生产不建议，存在安全风险）；未配置时仅服务自身页面可调用接口。例：`--cors http://localhost:5173`、`--cors *`。〔CLI 3184-3196〕
- **参数汇总表**：文档仅给出上述 5 个参数（表 19-10），未见其他 serve 参数。〔CLI 3149-3196〕

### C.2 启动就绪信号

- 服务成功启动后回显：`codearts server listening on http://127.0.0.1:4096`。〔CLI 3217〕
- 启动同时打印安全提示横幅（见 G 域）。〔CLI 3212-3216〕

### C.3 服务端 OpenAPI 描述获取

- `codearts generate` = 「把服务端 OpenAPI 描述（含 JS SDK 调用示例）打印到 stdout」。〔CLI 2917-2918〕

### C.4 HTTP 接口路径与字段

- `/api/info`、`/api/model`、`/api/model/default`、`/api/session`、`/api/session/:id/prompt`、`/api/event`、权限/审批 reply、interrupt、delete 等接口的路径、请求/响应字段：**文档未覆盖**（6 个目标文件中均无；已对同目录其余文档做检索，亦未见这些端点）。
- `/v1/chat/completions` 作为 serve 暴露的 OpenAI 兼容端点：**文档未覆盖**（仅见自定义模型 baseURL 自动补全 `/chat/completions`，见 D 域）。

### C.5 SSE 事件类型

- **文档未覆盖**（6 个文件中无 SSE 事件类型定义；仅 CLI 指南提及 SSE 流式响应的「块间超时」配置，非事件协议）。〔CLI 1983-1986〕

### C.6 工具审批 / 沙箱模式

- **三种内置权限模式**（表 5-1）：
  - 手动审批：所有操作在沙箱内执行，高风险操作被拦截，重要操作需用户审批。
  - 自动审批：所有操作在沙箱内执行，高风险操作被拦截，重要操作由 AI 自动审批。
  - 完全访问：直接在电脑上运行，不使用沙箱；可读写任何文件、跳过安全检查、不再发起审批请求。
  〔CLI 519-526〕
- **CLI 运行态开关**（表 19-2）：`codearts run "..." --auto_approval`（沙箱内、AI 自动审批）、`--manual_approval`（沙箱内、需用户审批）、`--full_access`（不用沙箱、跳过安检、不再审批）。〔CLI 2977-2983〕
- **bash_mode**（config.json）：`sandbox`（沙箱执行，默认，最安全）、`always_ask`（所有命令都询问）、`always_allow`（所有命令直接执行）。〔CLI 367-371〕
- **权限策略 action**：`allow`（直接运行）、`ask`（需审批，可选 Allow once / Allow always / Reject）、`deny`（禁止执行）。〔CLI 352-362〕
- **说明**：TUI 默认沙箱模式并返回三选项；CLI 开发模式下默认自动禁止执行，需显式配置 `allow` 才运行。〔CLI 363-366〕
- **网络访问策略**：全网访问 / 本地网络访问 / 禁止网络访问 / 网络自定义访问（JSON 策略文件，含 filesystem、network、resources）。〔CLI 701-841〕

### C.7 模型 variants

- **variants 字段**：自定义模型可配置 `low`（低推理强度）、`medium`（中等）、`high`（高）。〔CLI 1904-1908、2062-2066〕
- **切换命令**：CLI `codearts run --variant`；TUI `/variants`；仅支持思考强度能力的模型可用。〔CLI 2071-2075、2548-2550〕
- **版本限制**：26.10.100 及之后版本创建的自定义模型支持设置思考强度。〔CLI 1836〕

### C.8 会话生命周期

- **列表可见范围**：会话列表只展示最近 30 天产生的会话，超过 30 天不显示。〔CLI 2493-2494〕
- **存储位置**：会话数据保存在本地 `%USERPROFILE%/.codeartsdoer/cli-data` 目录下的 `opencode.db` 文件中。〔CLI 2495-2496〕
- **会话管理命令**：`codearts session list`（列会话，支持 `--max-count/-n`、`--format`）、`codearts session delete <sessionID>`。〔CLI 2802-2812、3033-3036〕
- **会话延续/派生**：`codearts run --continue`（缩写 `-c`，继续上一会话）、`codearts run "..." --session <sessionID>`（缩写 `-s`）、`codearts run --fork`（派生新子会话，继承父会话上下文）。〔CLI 2949-2960〕
- **导入导出**：`codearts export [sessionID]` 以 JSON 打印会话数据；`codearts import <file>` 从本地 JSON 导入会话。〔CLI 2813-2829〕
- **TUI 会话操作**：`/sessions` 列出并切换会话；选中后可 Ctrl+D 删除（二次确认）、Ctrl+R 重命名。〔CLI 2491-2501〕
- **serve 模式下会话的创建/提示词接口**：**文档未覆盖**。

---

## D. 与 opencode 的关系

- **配置 `$schema`**：自定义模型配置示例中 `"$schema": "https://opencode.ai/config.json"`。〔CLI 2091、2156〕
- **`opencode.db`**：会话数据保存在 `%USERPROFILE%/.codeartsdoer/cli-data/opencode.db`。〔CLI 2495-2496〕
- **插件 import**：Hook 示例 `import type { Plugin } from "@opencode-ai/plugin"`。〔CLI 1286〕
- **是否 OpenAI 兼容端点（`/v1/chat/completions`）**：serve 是否暴露该端点**文档未覆盖**。文档仅规定自定义模型「仅支持 OpenAI 规范的 Chat Completions 格式和 Anthropic 规范的 Messages 格式」。〔CLI 1828-1829〕
- **自定义模型 baseURL 补全**：`options.useFullUrl` 默认 false，系统按模型类型自动补全路径，OpenAI 系列追加 `/chat/completions`，Anthropic 系列追加 `/messages`；设 true 则直接使用填写的 baseURL 不补全。〔CLI 1961-1972〕
- **`codearts attach` 机制**：将本地命令行绑定到远端码道 CLI 服务实例，使用用户名和密码登录；账号密码可通过环境变量或命令行 `--password` 传。〔CLI 2872-2875〕
  - 连接前需配置 `CODEARTS_SERVER_USERNAME` / `CODEARTS_SERVER_PASSWORD`；`codearts attach ${CODEARTS_SERVER_URL} --password ${CODEARTS_SERVER_PASSWORD}`。〔CLI 3201-3223〕
  - attach 参数（表 19-11）：`<url>`、`-p/--password`（服务端密码）、`-c/--continue`、`-s/--session`、`--fork`、服务端地址 `--dir` 路径（协议+主机+端口，端口默认 4096）。〔CLI 3197-3241〕
- **`codearts run --attach` 机制**：连接到正在运行的服务器执行问答，例 `codearts run --attach http://localhost:4096 --password 1***5 "hi"`；地址格式「协议+主机+端口」，主机可 localhost/IP/域名，端口未指定默认 4096。〔CLI 2973-2993〕

---

## E. DSH 插件相关

> 结论：文档**没有出现「DSH」字样**；但 CLI 文档明确记载了与 opencode 同源的**插件（Hooks）机制**，可视为扩展点。

- **Hooks = 插件系统核心机制**：允许开发者在工具执行、消息处理、权限控制等关键节点注入自定义逻辑；插件是一个 JavaScript/TypeScript 模块，导出插件函数并返回 Hooks 对象。〔CLI 1131-1140〕
- **插件文件加载路径**（表 8-1）：项目级 `./.codeartsdoer/plugin` 或 `./.codeartsdoer/plugins`；个人级 `%USERPROFILE%/.codeartsdoer/plugin` 或 `%USERPROFILE%/.codeartsdoer/plugins`；依赖文件 package.json 放在配置目录，启动时自动安装依赖。〔CLI 1141-1152〕
- **支持的 Hook 事件**（表 8-2，摘要）：`chat.message`、`chat.params`、`chat.headers`、`chat.response`、`chat.error`、`chat.compression`、`chat.finished`、`user.approval`、`turn.end`、`command.execute.before`、`tool.execute.before`、`tool.execute.after`、`tool.definition`、`shell.env`、`permission.ask`、`experimental.chat.messages.transform`、`experimental.chat.system.transform`、`experimental.session.compacting`、`experimental.text.complete`、`config`、`event`；部分事件「可阻断」。〔CLI 1159-1279〕
- **技能（Skill）机制**：目录 `项目根目录/.codeartsdoer/skills`（项目级）或 `~/.codeartsdoer/skills`（个人级），优先级项目级 > 个人级；技能核心为 `SKILL.md`（含 YAML frontmatter：name、description）。〔CLI 1040-1098〕
- **MCP 扩展**：支持本地（stdio）与远程（HTTP/WebSocket）MCP 服务器，配置于 `codearts_cli.json(c)`；命令 `codearts mcp add/list/auth/logout/debug`。〔CLI 2332-2407、3242-3355〕
- **「DSH 插件」是否可直接加载**：文档未覆盖（无 DSH 相关说明）。

---

## F. 计费与限额

- **计费模式**：自 2026-09-04 23:59:59（北京时间）起升级为**积分计费模式**；积分是模型的 AI 资源配额，按请求实时扣减，调用成功才扣，失败不扣。〔计费 62-103〕
- **积分扣减规则**：积分用尽不能继续调用模型；付费套餐（个人标准/高级/旗舰、企业专业版）用完需新购积分包；免费套餐（个人体验版）用完不可购买积分包、不能继续发起请求。扣减顺序：优先消耗剩余有效期最短的积分；有效期相同先扣福利积分，再扣席位套餐内积分，再扣积分包。〔计费 74-89〕
- **套餐额度刷新**：按购买日起算，每个计费周期刷新；未使用额度不结转。〔计费 94-95〕
- **模型积分消耗系数**（节选）：Kimi-K3.1-Pro 1.63、GLM-5.3-Flash 0.08、Kimi-K3 2.38、DeepSeek-V4.1-Flash 高峰 0.18 / 错峰 0.09、DeepSeek-V4.1-Flash-1017 高峰 0.18 / 错峰 0.12、GLM-5.3 0.79、GLM-5.2 0.7、OpenPangu-2.0-Flash 0.32、OpenPangu-2.0-Pro 0.7、OpenPangu-2.1-Pro 0.07。〔计费 100-117〕
- **免费/付费套餐区分**：个人版含体验版（0 元、免费、每月自动免费续期、不限次数）、标准版 98 元/月、高级版 198 元/月、旗舰版 498 元/月；企业专业版 198 元/席位/月。套餐积分额度：体验版 500、标准版 2000、高级版 4000、旗舰版 10000；企业专业版 2000 积分/席位。〔计费 244-258、309-314、495-501〕
- **免费/付费模型的区分字段**：**文档未覆盖**（文档未给出模型层面「免费/付费」标识字段，仅有模型积分消耗系数）。
- **积分包**：个人积分包 1000 积分 50 元/个、有效期 1 个月，仅标准版及以上可购，体验版不可购；企业积分包 2000/5000/10000 积分分别 99.99/244.98/480.00 元、有效期 3 个月；均不退订，到期剩余积分清零。〔计费 434-488〕
- **并发/限额**：个人版会话并发数 体验版 3、标准/高级/旗舰 5；Agent Space 并行任务数 3/5/5/5；企业专业版 会话并发数 5 个/席位、并行任务数 5 个/席位。〔计费 259-263、315-316〕
- **限流/错误码**：
  - `API` 状态码表含 `402 Payment Required`（说明仅「保留请求」，未与码道计费/积分关联）与 `429 TooManyRequests`（建议读取 `Retry-After` 后重试）。〔API 1596-1597、1643-1646〕
  - `API` 错误码表：`DataFlywheel.00000429`「调用频次过高，触发限流」→ 请稍后再试；另有 400/403/500 错误码。〔API 1666-1678〕
  - 自定义模型调用失败不扣积分（见上）。模型侧 402/429 的具体错误码：**文档未覆盖**。
- **用量查询**：
  - CLI：`codearts stats` 显示 Token 使用量和成本统计信息，支持 `--days`、`--tools`、`--models`、`--project`。〔CLI 2797-2801、2994-3012〕
  - 控制台：个人版在「我的码道 > 套餐与用量」查看；企业版在「企业管理 > 订阅管理」查看。〔计费 365-366、469-470〕
  - API：提供「用量与代码同步增量同步接口」（成员/租户每日用量指标、commit 提交、代码生成增量同步），数据约 1 小时刷新一次，建议 D+1 同步。〔API 417-437〕
  - 旧版 Token 额度不足相关 FAQ：套餐未到期但 Token 额度不足能否继续使用、Token 抵扣顺序等。〔计费 54-56〕
- **活动积分（补充）**：Skill 创新大赛报名赠 2000 积分、新开通加赠 3000；每日签到赠 100~200 积分（按套餐）；学生认证一次性 4000 积分。〔活动 41-55、99-105、146-147〕

---

## G. 风险边界

- **serve 默认监听地址**：`--hostname` 默认 `127.0.0.1`（仅本机回环），`--port` 默认 `4096`。〔CLI 3151、3156〕
- **启动横幅安全提示（原文要点）**：「本服务为本地开发环境，非标准云服务，不提供企业级安全加固与 SLA 保障。请勿将服务地址暴露至公网或分享给他人，可能存在未授权访问、代码泄露等风险。继续使用即视为您已了解并自愿承担上述风险。」并建议配置反向代理（附华为云 FAQ 链接）。〔CLI 3212-3216〕
- **`--cors` 安全提示**：`--cors *` 表示允许所有源，「仅本地调试用，生产环境不建议，存在安全风险」；未配置时仅服务自身页面可调用接口。〔CLI 3184-3196〕
- **`--mdns` 提示**：面向「同一局域网内设备」自动发现，属局域网零配置，非公网。〔CLI 3163-3168〕
- **沙箱/文件防护**：手动审批、自动审批模式下自动设置默认文件与网络访问权限；完全访问模式可读写任何文件、跳过安全检查（风险最高）。〔CLI 519-526〕
- **高风险命令策略**：检测到高风险命令时 TUI 弹框询问、CLI 直接拦截；可选 Allow once / Allow always / Reject。〔CLI 844-849〕

---

## 覆盖度结论（哪些充分、哪些缺失）

- **覆盖充分**：A 环境与版本、B 登录与凭据（AK/SK 部分）、C.1 serve 参数与默认值、C.6 审批/沙箱、C.7 variants、C.8 会话生命周期、D 与 opencode 的关系（`$schema`/`opencode.db`/attach）、E 插件/Hooks、F 计费与限额、G 风险边界。
- **明确缺失（文档未覆盖）**：
  1. serve 的 HTTP 接口契约（`/api/info`、`/api/model`、`/api/model/default`、`/api/session`、`/api/session/:id/prompt`、`/api/event`、权限/审批 reply、interrupt、delete 的路径与字段）——6 个文件及同目录其余文档均未见。
  2. SSE 事件类型定义。
  3. serve 是否暴露 OpenAI 兼容端点（如 `/v1/chat/completions`）。
  4. CLI 网页登录态的本地凭据存放位置与 token 过期/刷新机制。
  5. 模型层面「免费/付费」区分字段。
  6. 模型调用侧 402/429 等具体错误码（API参考中的 402/429 属通用状态码/同步接口错误码）。
  7. 「DSH」相关插件/扩展说明。
