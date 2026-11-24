# 华为云码道 CodeArts 代码智能体 — 客户端/CLI 文档事实提取

> 用途：为「复用码道 CLI `codearts serve` 通道接入 DSH」预研方案做官方文档校验。
> 原则：只提取文档**明确规定**的事实，不做推测、不做方案设计。
> 来源：`_temp/pdf_text/` 下从官方 PDF 提取的纯文本。行号均为该 .txt 文件的行号。
> 说明：用户给出的待读清单为 7 份，但目录下实际还有 **码道CLI 用户指南**、**API参考**、**计费说明**、**快速入门**、**产品介绍**、**活动** 六份，均与本主题强相关，已一并提取。

---

## 0. 术语与总体结论（先读）

- 官方产品形态共 6 种：码道 IDE、码道 CodeArts 插件、码道 CLI、码道桌面端、码道网页端、码道小程序。
  来源：`华为云码道CodeArts代码智能体 产品介绍.txt` L46-75（表：形态/产品定位/核心能力/适用用户/运行入口）。
- 「控制台」不是客户端，是企业管理后台；客户端指 IDE/插件/CLI/桌面端/网页端/小程序。
  来源：`用户指南（控制台）.txt` L27-54 目录；`产品介绍.txt` L46-75。
- **码道 CLI 官方定位**：面向终端场景的 AI 开发入口，终端（TUI 交互 + 命令行双形态）。
  来源：`产品介绍.txt` L58-61。
- **CLI 属于官方售卖产品形态之一**：个人版与企业版套餐的「产品形态」均明确列出「CodeArts Agent IDE、码道CLI、JetBrains系列插件、VS Code插件」。
  来源：`计费说明.txt` L268-274（个人版）、L319-320（企业版）。
- **CLI 自定义模型属于套餐内能力**：个人版与企业版能力清单均含「客户端自定义模型」（企业版写作「自定义模型（客户端自定义模型+企业自定义模型）」）。
  来源：`计费说明.txt` L288-289（个人版）、L331-332（企业版）。
- **控制台存在「CLI授权指导」入口**，但控制台指南正文未展开该章节内容（仅在权限对照表中作为菜单项出现）。
  来源：`用户指南（控制台）.txt` L159、L184、L846。

---

## A. 各端形态与差异（控制台/小程序/桌面端/网页端/插件/IDE 与 CLI 的差异）

### A.1 CLI 自身形态
- CLI 提供 TUI（终端交互界面）与 CLI（命令行模式）双形态；TUI 对话框输入、可视化操作，CLI 直接传参一行命令执行。
  来源：`用户指南（码道CLI）.txt` L67-69、L70-75（表1-1 TUI 与 CLI 区别）。
- CLI 支持操作系统：Windows 11/10(2019+)、macOS 11+(ARM64)、Linux（EulerOS 2.0、SUSE 12 SP5、Ubuntu 18.04/20.04/22.04/24.04、Debian 10/11/12、CentOS 8、RHEL 8/9）。
  来源：`用户指南（码道CLI）.txt` L77-82。
- CLI 核心能力：命令覆盖（models、sessions 等）、脚本化集成（Shell/Python 脚本自动执行）、原生支持 MCP/技能/自定义智能体、兼容 JSON/JSONC 配置。
  来源：`用户指南（码道CLI）.txt` L83-99。

### A.2 控制台
- 控制台功能模块：权限概述、订阅管理（旧/新版）、配置账号30天免登录、成员及团队管理、配置席位、数据分析、配置模型（系统内置/企业自定义）、用量设置、安全设置、操作日志、智能体设置（智能体中心/技能和规则中心/知识空间/代码库索引）、个人用量、客户端管理、心愿墙、问题反馈。
  来源：`用户指南（控制台）.txt` L27-60（目录）。
- 角色与操作权限：企业管理员/团队管理员/成员对控制台各功能权限不同（数据分析、订阅管理、席位管理、模型配置、用量设置、安全设置、操作日志仅管理员；智能体中心/技能和规则中心/知识空间/代码库索引/个人用量/客户端管理/CLI授权指导三者均可）。
  来源：`用户指南（控制台）.txt` L827-847（表6-2）。
- 新版套餐仅企业版支持设置成员角色类型；旧版所有版本均支持。
  来源：`用户指南（控制台）.txt` L803-804。
- 单租户最大团队数 100；单团队最大成员数 500；一个 IAM 用户/企业联邦用户只允许加入一个团队。
  来源：`用户指南（控制台）.txt` L856-864。

### A.3 小程序
- 定位：移动端入口，微信内打开；两种工作模式——「云端工作」（依托云端沙箱执行，退出不中断）与「连接电脑」（远程连接桌面端，跨设备协同）。
  来源：`用户指南（码道小程序）.txt` L44-51。
- 能力：随时发起任务、处理手边材料（拍照/手机/微信文件）、调用专家或技能、持续跟进任务、查看产物。
  来源：`用户指南（码道小程序）.txt` L52-60。
- 与网页端任务互通（同一账号可查看共享任务）。
  来源：`用户指南（码道小程序）.txt` L673。
- **无自定义模型、无 MCP、无沙箱设置、无审批模式配置**（文档中未见相关章节）。
  来源：`用户指南（码道小程序）.txt` L27-38（目录）；文档未覆盖。

### A.4 桌面端 & 网页端
- 桌面端：独立桌面 AI 工作台，提供自然语言、语音、附件、技能、专家、连接器等；网页端：浏览器打开即用，轻量。
  来源：`用户指南（码道桌面端&网页端）.txt` L70-76。
- 功能差异对照（桌面端 √ / 网页端 ×）：语音输入、专家团、项目、IM助理、沙箱、模型（自定义模型）、桌面宠物、心愿墙仅桌面端；记忆仅网页端（×/√）。
  来源：`用户指南（码道桌面端&网页端）.txt` L115-173（表1-1）。
- 连接器＝依托 MCP 与 MCP 服务器通信；两端均支持。
  来源：`用户指南（码道桌面端&网页端）.txt` L144-146。
- 约束：单用户 AI 任务并发最多 3 个；单用户启用定时任务 20 个；同一工作空间最多同时执行 3 个定时任务；单会话存储工作空间不大于 10GB。
  来源：`用户指南（码道桌面端&网页端）.txt` L177-188（表1-2）。
- **网页端不支持沙箱与自定义模型**（表1-1 中两项均为 ×）。
  来源：`用户指南（码道桌面端&网页端）.txt` L158-163。

### A.5 插件（VS Code / JetBrains / DevEco Studio）
- 三种宿主：Visual Studio Code、JetBrains、DevEco Studio。
  来源：`用户指南（码道CodeArts插件）.txt` L27-38（目录 L2.1/2.2/2.3）。
- 能力：单元测试智能体、日志获取、设置（基础设置/语言/网络代理）、问题反馈；**无独立 MCP/沙箱/自定义模型章节**。
  来源：`用户指南（码道CodeArts插件）.txt` L27-38（目录）。
- 代码补全采用专属内置模型，**不支持自定义模型**。
  来源：`用户指南（码道CodeArts插件）.txt` L533-535。
- 终端命令运行模式：沙箱运行/自动运行/手动模式（默认所有终端命令需用户手动批准）。
  来源：`用户指南（码道CodeArts插件）.txt` L638-649。

### A.6 码道 IDE
- IDE 内置手动审批、自动审批、完全访问三种权限模式。
  来源：`用户指南（码道IDE）.txt` L945-954（表4-11）。
- IDE 自定义模型在「设置 > 模型」中添加，分「模型提供商」与「自定义配置」两种方式。
  来源：`用户指南（码道IDE）.txt` L1618-1625。
- IDE MCP 在「设置 > MCP工具」配置，支持 stdio / SSE / Streamable HTTP。
  来源：`用户指南（码道IDE）.txt` L3003-3010。
- IDE 支持 SSH / WSL / 本地 Docker 三种远程开发。
  来源：`用户指南（码道IDE）.txt` L62-64（目录 14.1/14.2/14.3）。
- IDE 支持 Hooks 插件机制（项目级/个人级 plugin 目录）。
  来源：`用户指南（码道IDE）.txt` L4177-4178、L4736-4741。

### A.7 各端与 CLI 的差异（文档明确部分）
- 自定义模型：**控制台**（企业管理员，企业级/团队级）与**客户端**（个人级，仅创建者本人）两条路径，差异见表9-1/表5-2。
  来源：`用户指南（控制台）.txt` L1300-1313；`用户指南（码道IDE）.txt` L1579-1592。
- 客户端（含 CLI/IDE/桌面端）添加自定义模型的权限受企业管理员开关管控。
  来源：`用户指南（控制台）.txt` L1562-1569；`用户指南（码道CLI）.txt` L1838-1843。
- CLI 自定义模型仅通过**手动编辑 JSON 文件**管理，不支持命令创建/修改/删除。
  来源：`用户指南（码道CLI）.txt` L1844-1846。
- 沙箱：CLI 内置三模式（手动/自动/完全访问）；IDE 同三模式；桌面端为「沙箱运行/自动执行/手动审批」；网页端无沙箱；插件为「沙箱运行/自动运行/手动模式」。
  来源：`用户指南（码道CLI）.txt` L517-526；`用户指南（码道IDE）.txt` L945-954；`用户指南（码道桌面端&网页端）.txt` L635-650；`用户指南（码道CodeArts插件）.txt` L638-649。
- 审批：CLI/IDE 的「自动审批」＝重要操作由 AI 自动审批；「完全访问」＝不使用沙箱、跳过安全检查、不再发起审批。
  来源：`用户指南（码道CLI）.txt` L521-526；`用户指南（码道IDE）.txt` L949-954。
- MCP：CLI 支持本地/远程；IDE 支持 stdio/SSE/Streamable HTTP；桌面端&网页端称「连接器」；插件/小程序文档未覆盖 MCP 配置。
  来源：`用户指南（码道CLI）.txt` L3232-3237；`用户指南（码道IDE）.txt` L3003-3010；`用户指南（码道桌面端&网页端）.txt` L144-146。

---

## B. 登录与账号（各端登录/授权方式、账号类型、学生认证、组织切换）

### B.1 账号类型定义
- 三种登录身份：华为云账号、IAM 用户、企业联邦用户。
  来源：`用户指南（控制台）.txt` L199-210。
- 华为云账号＝资源归属与计费主体；IAM 用户由账号创建、不独立计费；企业联邦用户＝与华为云建立信任关系的第三方系统用户。
  来源：`用户指南（控制台）.txt` L200-207。
- 个人版套餐只能由购买账号使用；企业版可由购买账号及其下 IAM 用户或企业联邦用户使用，IAM 用户需管理员开通席位。
  来源：`用户指南（码道CLI）.txt` L116-118；`用户指南（码道IDE）.txt` L141-143；`用户指南（码道CodeArts插件）.txt` L170-172。

### B.2 CLI 登录/授权
- CLI 授权方式两种：**网页端登录授权**（仅 TUI，未登录且无 AK/SK 时自动跳浏览器华为云登录页）与 **AK/SK 鉴权授权**（TUI/CLI 均可，支持进程级临时授权与系统环境变量永久授权）。
  来源：`用户指南（码道CLI）.txt` L143-160。
- AK/SK 环境变量名：`CODEARTS_CLI_AK` / `CODEARTS_CLI_SK`。
  来源：`用户指南（码道CLI）.txt` L179-199、L255-256、L272-273。
- 验证授权是否生效：执行 `codearts models`，成功回显 model_id、model_name 表示授权成功。
  来源：`用户指南（码道CLI）.txt` L260-262、L279-281。
- 组织切换命令：`codearts console login` / `logout` / `switch`（切换当前组织）/ `orgs`（查看当前用户所属组织）。
  来源：`用户指南（码道CLI）.txt` L2909-2916。

### B.3 其他端登录
- IDE：单击「华为账号登录」或「企业联邦身份登录」，跳转浏览器华为云登录页，进入登录授权页单击「确认授权」。
  来源：`用户指南（码道IDE）.txt` L169-183。
- 插件（VS Code/JetBrains/DevEco）：单击「华为账号登录」跳转浏览器登录页。
  来源：`用户指南（码道CodeArts插件）.txt` L183-197、L270-280、L331-341。
- 桌面端：单击「华为账号登录」跳转浏览器；进入登录授权页单击「确认授权」。
  来源：`用户指南（码道桌面端&网页端）.txt` L435-444。
- 网页端：浏览器打开登录页登录。
  来源：`用户指南（码道桌面端&网页端）.txt` L473-480。
- 小程序：先完成**微信授权登录**，再单击个人头像 →「华为账号登录」输入华为云账号。
  来源：`用户指南（码道小程序）.txt` L89-93。
- 控制台：支持华为云账号、IAM 用户、企业联邦用户三种登录方式；IAM 用户/企业联邦用户执行计费操作需同时具备企业管理员角色与 IAM 细粒度权限。
  来源：`用户指南（控制台）.txt` L196-198。
- SSO：支持基于 SAML 和 OIDC 的 SSO；企业联邦用户免登录有效期 24 小时。
  来源：`用户指南（控制台）.txt` L1804-1824。
- 30 天免登录：客户端 26.5.1 及以上版本华为云账号免登录 30 天、IAM 用户 24 小时；老版本 24 小时。
  来源：`用户指南（控制台）.txt` L738-753。

### B.4 学生认证
- 完成学生认证可一次性领取 4000 积分，自发放之日起 90 天有效。
  来源：`活动.txt` L146-147；`计费说明.txt` L235-236。
- 适用对象：已完成或未完成学生认证的在校大学生，且已升级到积分计费模式。
  来源：`活动.txt` L159。
- 各端参与入口：IDE/插件（右上角「限时福利」）、控制台（左下角头像→活动福利）、桌面端/网页端（左下角头像→活动福利）、小程序（侧边栏→头像→设置→活动福利）。
  来源：`活动.txt` L161-192。

---

## C. serve / OpenAPI / 接口（重点）

### C.1 `codearts serve`（CLI 指南明确描述）
- `codearts serve`：**启动无界面的服务器**。
  来源：`用户指南（码道CLI）.txt` L2857。
- 启动前必须配置服务器用户名和密码，否则报错：`Error: CODEARTS_SERVER_PASSWORD is not set; please configure the password to start the server.`
  来源：`用户指南（码道CLI）.txt` L2859-2865。
- 环境变量：`CODEARTS_SERVER_USERNAME`（服务器登录账号）、`CODEARTS_SERVER_PASSWORD`（服务器登录密码），由用户自行设置。
  来源：`用户指南（码道CLI）.txt` L2866-2871。
- 启动成功回显：`codearts server listening on http://127.0.0.1:4096`。
  来源：`用户指南（码道CLI）.txt` L3217。
- **官方安全声明（原文要点）**：本服务为本地开发环境，非标准云服务，不提供企业级安全加固与 SLA 保障；请勿将服务地址暴露至公网或分享给他人，可能存在未授权访问、代码泄露等风险；建议通过反向代理等安全访问方案。
  来源：`用户指南（码道CLI）.txt` L3212-3216。

### C.2 `codearts serve` 支持的参数（表19-10）
- `--port`：指定监听端口，默认 4096。
  来源：`用户指南（码道CLI）.txt` L3151-3155。
- `--hostname`：服务器监听地址，默认 127.0.0.1。
  来源：`用户指南（码道CLI）.txt` L3156-3162。
- `--mdns`：启用 mDNS 局域网零配置服务发现，同局域网设备可自动扫描并访问，无需手动填写本机 IP，通过 `.local` 域名访问 **Web 管理页面与 MCP 接口**。
  来源：`用户指南（码道CLI）.txt` L3163-3168。
- `--mdns-domain`：自定义 mDNS 主机名前缀，默认 `codearts.local`；访问地址形如 `http://codearts.local:4096`。
  来源：`用户指南（码道CLI）.txt` L3169-3178。
- `--cors <origin>`：给外部网页开权限，配置允许跨域访问的浏览器页面来源，支持多次配置多来源；未配置时仅服务自身页面可调用接口，外部网页会触发浏览器跨域拦截；`*` 放行所有网页（仅本地调试用，生产环境不建议，存在安全风险）。
  来源：`用户指南（码道CLI）.txt` L3184-3196。

### C.3 `codearts attach`（CLI 指南明确描述）
- `codearts attach <url>`：将本地命令行绑定到远端码道 CLI 服务实例，使用用户名和密码登录，支持环境变量与命令行 `--password` 两种传参方式。
  来源：`用户指南（码道CLI）.txt` L2872-2875。
- 连接步骤：配置临时环境变量 `CODEARTS_SERVER_USERNAME` / `CODEARTS_SERVER_PASSWORD`（Windows `set`，macOS/Linux `export`）→ 一端 `codearts serve` → 另一端 `codearts attach ${CODEARTS_SERVER_URL} --password ${CODEARTS_SERVER_PASSWORD}`。
  来源：`用户指南（码道CLI）.txt` L3199-3226。
- 连接示例：`codearts attach http://localhost:4096 -p yourpassword`。
  来源：`用户指南（码道CLI）.txt` L3226。
- `codearts run --attach http://<host>:4096 --password <pwd> "<提示词>"`：连接正在运行的服务器并执行问答。
  来源：`用户指南（码道CLI）.txt` L2973-2976。
- attach 参数：`-p/--password`（服务端密码）、`-c/--continue`（继续上次会话）、`-s/--session`（指定会话ID）、`--fork`（分叉会话）、服务端地址 `--dir`（指定在该服务端的哪个目录下工作，端口默认 4096）。
  来源：`用户指南（码道CLI）.txt` L3227-3241。

### C.4 OpenAPI / SDK（CLI 指南明确描述）
- `codearts generate`：**把服务端 OpenAPI 描述（含 JS SDK 调用示例）打印到 stdout**。
  来源：`用户指南（码道CLI）.txt` L2917-2918。
- 官方未在文档中给出该 OpenAPI 描述的具体字段、端点清单或 SDK 包名；`codearts generate` 仅此一条命令描述。
  来源：`用户指南（码道CLI）.txt` L2917-2918；文档未覆盖。

### C.5 IDE 侧 SDK 线索（Hooks 示例中出现）
- IDE Hooks 示例代码中 import 了 `@opencode-ai/sdk`、`@opencode-ai/plugin` 类型（Part、Permission、Message、Model、Config、Event、Plugin）。
  来源：`用户指南（码道IDE）.txt` L4571、L4635、L4647、L4668、L4704、L4719、L4741。
- 说明：这是 Hooks 插件的类型定义包，**不是** serve 服务的 OpenAPI SDK；文档未说明其与 `codearts serve` 的关系。
  来源：`用户指南（码道IDE）.txt` L4571-4741；文档未覆盖。

### C.6 远程连接（IDE 远程开发，非 CLI serve）
- IDE 远程开发支持 SSH（目标环境需安装 openssh-server）、WSL 发行版、本地 Docker 容器。
  来源：`用户指南（码道IDE）.txt` L62-64、L3787-3791、L3937-3940、L4007-4014。
- 远程连接管理：编辑/关闭/删除远程连接。
  来源：`用户指南（码道IDE）.txt` L3887-3897。

### C.7 API参考（官方 REST API，与 CLI serve 不是同一套）
- API 共 4 个：成员每日用量指标增量同步、租户每日用量指标增量同步、commit 提交增量同步、代码生成增量同步。
  来源：`API参考.txt` L103-135（表2-1）。
- 认证方式：Token 认证（`X-Auth-Token`）与 AK/SK 认证（`Authorization: SDK-HMAC-SHA256 ...` + `X-Sdk-Date`）；需 project 级 Token。
  来源：`API参考.txt` L248-260、L292-324、L354-355。
- 错误码：`DataFlywheel.00000400`（参数错误）、`00000403`（缺少必要权限）、`00000429`（触发限流）、`00000500`（服务器内部异常）。
  来源：`API参考.txt` L1666-1678。
- **结论：官方 API参考仅覆盖用量/代码同步类接口，未覆盖 serve 服务接口，也未覆盖模型推理接口。**
  来源：`API参考.txt` L27-43（目录）。

---

## D. 模型与计费

### D.1 模型列表来源
- 模型积分消耗系数表（官方列出的模型清单来源之一）：Kimi-K3.1-Pro、GLM-5.3-Flash、Kimi-K3、DeepSeek-V4.1-Flash（高峰/错峰两档）、DeepSeek-V4.1-Flash-1017、GLM-5.3、GLM-5.2、OpenPangu-2.0-Flash、GLM-5.2-ArkTS-SPARK、OpenPangu-2.0-Pro、OpenPangu-2.1-Pro。
  来源：`计费说明.txt` L100-117。
- 客户端模型列表：CLI 用 `codearts models`（可加 `--verbose`、`--refresh` 强制从 models.dev 重新拉取模型缓存）；TUI 用 `/models`。
  来源：`用户指南（码道CLI）.txt` L2777-2791、L2136-2143。
- IDE 内置模型列表在「设置 > 模型 > 内置」查看，**展示所有系统内置模型，无论控制台是否为开启状态**；可查看消耗系数、繁忙程度、思考强度。
  来源：`用户指南（码道IDE）.txt` L1527-1553。
- 桌面端内置模型列表在「设置 > 模型 > 内置」查看。
  来源：`用户指南（码道桌面端&网页端）.txt` L1643-1648。
- 系统内置模型默认全部开启；控制台关闭某模型后，客户端不展示该模型。
  来源：`用户指南（控制台）.txt` L1284-1289。

### D.2 自定义模型约束（各端一致的核心约束）
- API 格式：仅支持 OpenAI 规范的 Chat Completions 格式和 Anthropic 规范的 Messages 格式。
  来源：`用户指南（控制台）.txt` L1319-1320；`用户指南（码道IDE）.txt` L1602-1603；`用户指南（码道CLI）.txt` L1828-1829；`用户指南（码道桌面端&网页端）.txt` L1633-1634。
- 调用工具：仅可由系统内置智能体、AgentTeam 和自定义智能体调用，智能问答无法调用。
  来源：`用户指南（控制台）.txt` L1322-1323；`用户指南（码道IDE）.txt` L1604-1605；`用户指南（码道CLI）.txt` L1830-1831。
- 积分/Token 消耗：用户调用自定义模型时，**不会消耗套餐内积分或 Token**；代码补全为降低延迟采用专属内置模型，不支持自定义模型。
  来源：`用户指南（控制台）.txt` L1324-1326、L1507-1509；`用户指南（码道IDE）.txt` L1606-1608；`用户指南（码道CLI）.txt` L1832-1834；`用户指南（码道桌面端&网页端）.txt` L1635-1636。
- 唯一性限制：相同模型提供商和模型 ID 的模型仅允许添加一次。
  来源：`用户指南（码道CLI）.txt` L1835；`用户指南（码道IDE）.txt` L1609；`用户指南（码道桌面端&网页端）.txt` L1637。
- 版本限制：26.10.100 及之后版本创建的自定义模型支持设置思考强度；26.8.0 之前创建的需在系统内置智能体「基础模型」中添加方可在客户端使用。
  来源：`用户指南（控制台）.txt` L1327-1331；`用户指南（码道CLI）.txt` L1836-1837；`用户指南（码道IDE）.txt` L1610-1611。
- 数量限制（仅控制台企业自定义模型）：单租户最多可新建 100 个自定义模型。
  来源：`用户指南（控制台）.txt` L1321。
- 前提条件：企业版（新版）/全部版本（旧版）需账号已加入企业成员；企业版（新版）/专业版（旧版）需管理员已开启成员自定义模型权限。
  来源：`用户指南（码道CLI）.txt` L1838-1843；`用户指南（码道IDE）.txt` L1612-1617。

### D.3 CLI 自定义模型配置（重点）
- 配置文件路径：`~/.codeartsdoer/codearts_cli.json`（Windows 为 `C:\Users\用户名\`，macOS `/Users/用户名/`，Linux `/home/用户名/`）。
  来源：`用户指南（码道CLI）.txt` L1847-1853。
- 配置以 `provider` 为顶层键，每个提供商 ID 对应一个配置块；**不支持使用命令创建、修改或删除自定义模型，所有配置均需手动编辑文件**。
  来源：`用户指南（码道CLI）.txt` L1844-1846、L1855。
- 完整配置结构字段：`provider.<ID>.name/npm/api/env/whitelist/blacklist/options/...`；`options` 含 `apiKey`、`baseURL`、`useFullUrl`、`enterpriseUrl`、`setCacheKey`、`timeout`、`chunkTimeout`。
  来源：`用户指南（码道CLI）.txt` L1857-1913。
- apiKey 首次加载时明文密钥会自动加密为 `enc:v1:` 格式并写回配置文件。
  来源：`用户指南（码道CLI）.txt` L1919-1920、L1950-1953。
- 常见提供商 ID：openai、deepseek、glm、kimi；也可使用任意自定义字符串（如 `my-server`），只要对应模型支持 OpenAI 兼容的 API 格式。
  来源：`用户指南（码道CLI）.txt` L1921-1929。
- `npm` 缺省默认 `@ai-sdk/openai-compatible`；`options.baseURL` 必填；`useFullUrl=false` 时 OpenAI 系列自动追加 `/chat/completions`、Anthropic 系列自动追加 `/messages`。
  来源：`用户指南（码道CLI）.txt` L1934-1936、L1954-1955、L1961-1972。
- 模型级字段：`id/name/family/reasoning/attachment/temperature/tool_call/limit.context/limit.input/limit.output/cost.*/modalities.input|output/headers/provider.npm|api/variants`。
  来源：`用户指南（码道CLI）.txt` L1991-2066。
- 思考强度通过 `codearts run --variant`（CLI）或 `/variants`（TUI）调整；`variants` 支持 low/medium/high。
  来源：`用户指南（码道CLI）.txt` L2062-2075。
- 复用已有模型配置：可从码道 IDE（`%USERPROFILE%\.codeartsdoer\codearts-data`）、VS Code（`...\vscode-data`）、JetBrains（`...\IntelliJIDEA2025.3.4`）拷贝 `codearts.json` 的 provider 字段到 `codearts_cli.json`。
  来源：`用户指南（码道CLI）.txt` L2076-2090。
- 自定义模型最小配置示例（deepseek）：`provider.deepseek.options.apiKey/baseURL` + `models.deepseek-chat/deepseek-reasoner`。
  来源：`用户指南（码道CLI）.txt` L2150-2169。

### D.4 控制台/客户端自定义模型差异
- 控制台：适用企业版（新版）/专业版（旧版），操作权限＝企业管理员，模型使用范围＝企业级（全员）/团队级（指定团队）。
- 客户端：适用所有版本，操作权限＝企业版（新版）/全部版本（旧版）所有企业成员、个人版（新版）购买账号；模型使用范围＝个人级（仅创建者本人）。
  来源：`用户指南（控制台）.txt` L1300-1313（表9-1）；`用户指南（码道IDE）.txt` L1579-1592（表5-2）。
- 控制台新建自定义模型两种方式：模型提供商快速创建（预置供应商，自动回填 URL，仅需 API Key）、自定义配置（自填 URL/ID/API Key，适用本地自建或不在预置列表的模型）。
  来源：`用户指南（控制台）.txt` L1339-1346。
- 模型 URL 只填 Base URL，例如完整地址 `.../chat/completions` 应填 `.../v4`。
  来源：`用户指南（控制台）.txt` L1376-1381、L1442-1446。
- IDE/桌面端添加模型时系统自动发起**连通性测试**，会消耗少量模型 Token；测试不通过可修改后重试或「直接保存」。
  来源：`用户指南（码道IDE）.txt` L1676-1682、L1736-1742。

### D.5 计费/积分/限流
- 积分模式自 2026-09-04 23:59:59 起上线；9 月 5 日起首次订购仅可选购积分模式套餐。
  来源：`计费说明.txt` L64-68。
- 积分是模型的 AI 资源配额，按请求实时扣减；调用失败不扣减积分，仅成功时扣减。
  来源：`计费说明.txt` L71-79、L96-98。
- 个人版：体验版 0 元/月（500 积分）、标准版 98 元（2000）、高级版 198 元（4000）、旗舰版 498 元（10000）；高峰期优先级 旗舰>高级>标准>体验。
  来源：`计费说明.txt` L244-262。
- 企业版：专业版 198 元/席位/月，1~1000 席位，2000 积分/席位；高峰期优先响应。
  来源：`计费说明.txt` L309-316。
- 免费套餐：个人体验版为免费套餐，订阅有效期 1 个月，到期后系统自动免费续期，续期次数不限。
  来源：`用户指南（码道小程序）.txt` L96-97；`用户指南（码道CodeArts插件）.txt` L337-339；`快速入门.txt` L56-58。
- 首次登录未开通套餐时自动开通个人体验版。
  来源：`用户指南（码道小程序）.txt` L95；`用户指南（码道IDE）.txt` L172；`用户指南（码道CodeArts插件）.txt` L188。
- 限流：「滑动窗口限流」，双维度（Token 额度、请求频次）、双窗口（5 小时、7 天）；不同模型额度独立计算，可切换其他模型继续调用；升级套餐即时生效。
  来源：`常见问题.txt` L575-611。
- 排队提示：队列已满、高峰排队、套餐额度用尽进入排队（建议开通按需计费）。
  来源：`常见问题.txt` L1108-1142。
- Token 套餐额度用完后，GLM-5.2、GLM-5.3、DeepSeek-V4.1-Flash、DeepSeek-... 等模型都不可调用，不支持开通按需；建议升级到积分套餐。
  来源：`常见问题.txt` L480-483。

### D.6 用量统计
- 控制台「个人用量」：已用积分总量、订阅套餐、个人积分包、活动福利；Tokens 消耗量涵盖系统内置模型和企业自定义模型。
  来源：`用户指南（控制台）.txt` L3004-3051。
- 控制台「数据分析」：积分累计用量、日均积分用量、激活/活跃成员数、Tokens 总消耗量、模型使用次数分布等；每小时更新一次。
  来源：`用户指南（控制台）.txt` L1242-1271。
- CLI 统计：`codearts stats`（Token 使用量和成本）、`--days`、`--tools`、`--models`、`--project`。
  来源：`用户指南（码道CLI）.txt` L2794-2812、L2994-3012。
- 桌面端/网页端：用量统计展示 Token 消耗、任务次数、模型调用等。
  来源：`用户指南（码道桌面端&网页端）.txt` L169-171。

---

## E. 权限 / 审批 / 沙箱

### E.1 CLI 权限文件 global.json
- 路径：`~/.codeartsdoer/cli-data/storage/permission/global.json`。
  来源：`用户指南（码道CLI）.txt` L316-319。
- 格式：`[{"permission":"权限名称","pattern":"*","action":"权限策略"}]`。
  来源：`用户指南（码道CLI）.txt` L321-328。
- 权限名称：`bash`（运行 Shell 命令）、`external_directory_read`（读项目目录外路径，如 /etc/hosts、~/.ssh/id_rsa）、`external_directory_write`（写项目目录外路径）、`dotfile`（修改点文件，如 .gitignore、.env、.vscode、settings.json）。
  来源：`用户指南（码道CLI）.txt` L331-351。
- 权限策略：`allow`（直接运行）、`ask`（需审批，含 Allow once / Allow always / Reject）、`deny`（禁止执行）。
  来源：`用户指南（码道CLI）.txt` L352-362。
- **CLI 开发模式下，配置 `ask` 会自动禁止执行**；如需运行须配置为 `allow`。
  来源：`用户指南（码道CLI）.txt` L364-366。
- `bash_mode` 需在 `~\.codeartsdoer\cli-data\storage\permission\config.json` 配置，支持 `sandbox`（默认，最安全）、`always_ask`、`always_allow`。
  来源：`用户指南（码道CLI）.txt` L336-339、L367-371。

### E.2 CLI/IDE 三种权限模式
- 手动审批：所有操作在沙箱内执行，高风险操作被拦截，重要操作需你审批。
- 自动审批：所有操作在沙箱内执行，高风险操作被拦截，重要操作由 AI 自动审批。
- 完全访问：直接在电脑上运行，不使用沙箱，可读写任何文件、跳过安全检查、不再发起审批请求。
  来源：`用户指南（码道CLI）.txt` L517-526；`用户指南（码道IDE）.txt` L945-954。

### E.3 文件访问控制（CLI/IDE/桌面端一致）
- 只读：除系统关键目录及用户敏感目录外，其余所有目录开放读权限。
- 读写：工作空间和额外设置的读写目录；含临时目录、缓存目录、常用语言工具链及依赖目录（go、.м2、.gradle、Python、npm、cargo、.gem 等）。
- 不可读不可写：Windows 系统关键目录（System32\config、drivers\etc、GroupPolicy 等）、用户敏感目录（Credentials、Protect、NTUSER.DAT）；macOS 文档/桌面/下载、~/.ssh、~/.zsh_history、Keychains、/etc/passwd、/etc/hosts 等；Linux /etc/shadow、/etc/passwd、/etc/sudoers 等。
  来源：`用户指南（码道CLI）.txt` L530-682；`用户指南（码道IDE）.txt` L962-1109；`用户指南（码道桌面端&网页端）.txt` L1508-1570。

### E.4 沙箱自定义配置
- CLI/IDE 沙箱策略配置 JSON 结构：`filesystem`（readWrite/readOnly）、`network`（default/allow/deny）、`resources`（cpu、memory）。
  来源：`用户指南（码道CLI）.txt` L714-752；`用户指南（码道IDE）.txt` L1130-1141。
- IDE 沙箱配置文件：`%USERPROFILE%/.codeartsdoer/sandbox.json`。
  来源：`用户指南（码道IDE）.txt` L1124-1129。
- 网络访问策略（桌面端）：允许所有 / 仅允许本地回环 / 禁止所有 / 自定义网络访问（sandbox.json）。
  来源：`用户指南（码道桌面端&网页端）.txt` L665-683。
- Linux 沙箱会生成独立模拟地址 127.0.0.1，与宿主机 localhost 隔离；禁止网络访问时沙箱内仍可访问该模拟地址。
  来源：`用户指南（码道桌面端&网页端）.txt` L676-680。
- 命令白名单：加入白名单的命令前缀绕过沙箱，直接在沙箱外执行。
  来源：`用户指南（码道CLI）.txt` L697-699；`用户指南（码道桌面端&网页端）.txt` L651-655；`用户指南（码道IDE）.txt` L1121-1123。
- 高风险命令执行策略（桌面端）：跳过 / 添加前缀到白名单 / 继续运行。
  来源：`用户指南（码道桌面端&网页端）.txt` L1615-1621。
- 自动执行权限（桌面端）：未开启时工具调用需手动确认；开启后自动通过，支持「每次询问」或「始终允许并开启配置」。
  来源：`用户指南（码道桌面端&网页端）.txt` L689-711。

### E.5 CLI 智能体工具权限
- 工具列表：read、write、edit、bash、glob、grep、task、webfetch、question。
  来源：`用户指南（码道CLI）.txt` L982-997（表6-5）。
- 自定义智能体 Markdown 中 `tools` 字段控制工具权限，`"*": false` 表示禁止所有工具；`model` 格式 `provider/model`。
  来源：`用户指南（码道CLI）.txt` L935-942、L963-969。
- 智能体存储：项目级 `项目根目录/.codeartsdoer/agents`，个人级 `~/.codeartsdoer/agents`；同名时项目级优先。
  来源：`用户指南（码道CLI）.txt` L914-929。

### E.6 企业安全设置（控制台）
- 安全隔离代码仓：限制 AI 功能访问指定代码仓，客户端提示「当前代码仓已被限制使用AI功能，请联系管理员」。
  来源：`用户指南（控制台）.txt` L1687-1703。
- IP 白名单：最多 200 个，一次最多 20 个；开启访问控制后仅白名单内公网 IP 可访问；企业管理员和团队管理员不受限制；未添加时默认 0.0.0.0/0。
  来源：`用户指南（控制台）.txt` L1727-1770。
- 隐私模式：仅非企业认证的用户使用个人版（新版）或体验版（旧版）时可配置；代码库文件始终保存在本地，云端索引时临时上传、计算后永久删除。
  来源：`用户指南（控制台）.txt` L3232-3256。
- 客户端会话管理：可查看登录客户端（设备/客户端、IP、客户端版本、最后活跃），可删除会话；删除后 2 分钟内生效，客户端需重新登录。客户端名称「CodeArts Agent」表示码道 IDE。
  来源：`用户指南（控制台）.txt` L3186-3230。

---

## F. MCP / 扩展（技能、Hooks、自定义命令）

### F.1 CLI MCP
- MCP 配置路径：项目级 `项目根目录/.codeartsdoer/codearts_cli.jsonc` 或 `codearts_cli.json`；个人级 `~/.codeartsdoer/codearts_cli.jsonc` 或 `codearts_cli.json`。
  来源：`用户指南（码道CLI）.txt` L2332-2355（表16-1）。
- 本地模式参数：`type`（固定 "local"）、`command`（字符串数组）、`environment`、`enabled`、`timeout`（默认 100000ms）。
  来源：`用户指南（码道CLI）.txt` L2356-2366（表16-2）。
- 远程模式参数：`type`（固定 "remote"）、`url`、`headers`、`environment`、`oauth`、`enabled`、`timeout`（默认 5000ms）。
  来源：`用户指南（码道CLI）.txt` L2367-2384（表16-3）。
- 本地模式＝工具进程直接在本机运行，CLI 直接启动、直接对话；远程模式＝部署在别的机器或云端，CLI 通过 HTTP/WebSocket 网络通信。
  来源：`用户指南（码道CLI）.txt` L2332-2337。
- CLI MCP 命令：`codearts mcp add`（交互式配置 Location/名称/类型/命令）、`mcp list`、`mcp auth list`、`mcp auth [name]`、`mcp logout [name]`、`mcp debug <name>`。
  来源：`用户指南（码道CLI）.txt` L3242-3354。
- MCP 状态：✓ 已连接、⚠ 待认证、○ 未初始化或已禁用、✗ 失败。
  来源：`用户指南（码道CLI）.txt` L3293-3299。
- `Location` 参数：Current project（项目根目录/.codeartsdoer/codearts_cli.jsonc）、Global（~/.codeartsdoer/codearts_cli.jsonc）。
  来源：`用户指南（码道CLI）.txt` L3253-3257。
- 认证凭据文件：`~/.codeartsdoer/cli-data/mcp-auth.json`。
  来源：`用户指南（码道CLI）.txt` L3329、L3344。

### F.2 IDE MCP
- 传输协议：stdio（本地）、SSE（本地/远程）、Streamable HTTP（本地/远程）。
  来源：`用户指南（码道IDE）.txt` L3003-3010。
- 配置文件：`mcp_settings.json`（设置 > MCP工具 > 配置MCP）。
  来源：`用户指南（码道IDE）.txt` L3048、L3129。
- stdio 模板：`{"mcpServers":{"名称":{"command":"...","args":[...],"env":{...}}}}`。
  来源：`用户指南（码道IDE）.txt` L3053-3070。
- HTTP 模板：`{"url":"https://...","type":"sse"}` 或 `"type":"streamableHttp"`。
  来源：`用户指南（码道IDE）.txt` L3134-3152。
- 服务器名称长度不能超过 64 字符，否则报错 `length over limit, maximum is 64`。
  来源：`用户指南（码道IDE）.txt` L3073-3079。
- 数量建议：无硬性限制，建议创建不超过 20 个、开启不超过 8 个、启用 3 个为最优。
  来源：`用户指南（码道IDE）.txt` L3018-3019。

### F.3 桌面端「连接器」
- 连接器＝依托 MCP 与 MCP 服务器通信；桌面端与网页端均支持。
  来源：`用户指南（码道桌面端&网页端）.txt` L144-146。
- 未给出连接器的具体配置字段（文档未覆盖）。

### F.4 技能（Skill）
- 技能目录结构：`skill-name/SKILL.md`（必填，含 YAML frontmatter 的 name/description + Markdown 指令）+ 可选 Bundled Resources（scripts/references/assets）。
  来源：`用户指南（码道CLI）.txt` L1051-1063；`用户指南（码道IDE）.txt` L3280-3296；`用户指南（码道桌面端&网页端）.txt` L1769-1781。
- 技能名规则：小写字母、数字、连字符组成，开头结尾不能是连字符，连字符不可连续，长度 1~64 字符；name 必须与 skill-name 一致。
  来源：`用户指南（码道CLI）.txt` L1068-1087；`用户指南（码道IDE）.txt` L3297-3314。
- 存储路径：CLI/IDE 项目级 `项目根目录/.codeartsdoer/skills/`，个人级 `~/.codeartsdoer/skills`（IDE 为 `%USERPROFILE%/.codeartsdoer/skills`）。
  来源：`用户指南（码道CLI）.txt` L1040-1049；`用户指南（码道IDE）.txt` L3381-3386。
- 优先级：同名技能调用优先级 云端企业级 > 云端团队级 > 本地项目级 > 本地个人级 > 云端个人级 > 系统内置。
  来源：`用户指南（控制台）.txt` L2078-2082；`用户指南（码道IDE）.txt` L3388-3389。
- 云端技能同步：客户端每 24 小时自动同步一次，仅同步已启用的技能。
  来源：`用户指南（控制台）.txt` L2127-2129；L1948-1950（智能体）。
- 技能分类：系统内置、市场内置、自定义。
  来源：`用户指南（码道IDE）.txt` L3360-3375。
- CLI 技能自动进化：`codearts skill-evolver --auto-set on|off [起始小时] [结束小时]`；开启后额外消耗 Token，累计消耗到 200 万后自动暂停。
  来源：`用户指南（码道CLI）.txt` L2876-2892。
- IDE 技能安装：`npx skills add <仓库地址> --skill <名称> -a codearts-agent`，选择 Project（项目级）/Global（个人级）。
  来源：`用户指南（码道IDE）.txt` L3394-3419。

### F.5 Hooks
- CLI Hooks：插件是 JavaScript/TypeScript 模块，项目级 `./.codeartsdoer/plugin` 或 `./.codeartsdoer/plugins`，个人级 `%USERPROFILE%/.codeartsdoer/plugin` 或 `.../plugins`；依赖需在同目录创建 `package.json`，启动时自动安装。
  来源：`用户指南（码道CLI）.txt` L1130-1152（表8-1）。
- CLI 支持的 Hook 事件：chat.message、chat.params、chat.headers、chat.response、chat.error、chat.compression、chat.finished、user.approval、turn.end、command.execute.before、tool.execute.before、tool.execute.after、tool.definition、shell.env、permission.ask、experimental.chat.messages.transform、experimental.chat.system.transform、experimental.session.compacting、experimental.text.complete。
  来源：`用户指南（码道CLI）.txt` L1159-1269（表8-2）。
- `permission.ask` Hook 支持配置 allow/deny/ask 三种策略。
  来源：`用户指南（码道CLI）.txt` L1244-1250。
- IDE Hooks 事件与 CLI 基本同名（chat.error、chat.compression、chat.finished、user.approval、turn.end、command.execute.before、tool.execute.before/after、tool.definition、shell.env、permission.ask、experimental.*、config、event）；示例 import `@opencode-ai/sdk`、`@opencode-ai/plugin`。
  来源：`用户指南（码道IDE）.txt` L4490-4741。

### F.6 自定义命令
- CLI 自定义命令：在 `codearts_cli.json`/`codearts_cli.jsonc` 的 `command` 字段配置（template 必填，可选 description/agent/model/subtask）；或在 `commands/` 目录建 `.md` 文件（文件名即命令名）；优先级：自定义 .md > .json 内自定义命令。
  来源：`用户指南（码道CLI）.txt` L400-500。
- CLI commands 路径：个人级 `~/.codeartsdoer/commands`，项目级 `项目根目录/.codeartsdoer/commands`。
  来源：`用户指南（码道CLI）.txt` L480-486。
- IDE 自定义斜杠命令：项目级 `./.codeartsdoer/commands/`，个人级 `%USERPROFILE%/.codeartsdoer/commands/`；文件名即命令；支持 `$ARGUMENTS` 与 `$N` 占位符；仅智能体模式可用。
  来源：`用户指南（码道IDE）.txt` L4933-4951、L4974-4984。
- CLI TUI 斜杠命令：/help、/mcps、/compact、/exit、/q、/quit、/logout、/init、/models、/new、/undo、/redo、/sessions、/skills 等。
  来源：`用户指南（码道CLI）.txt` L2460-2499。

---

## G. 常见问题与最佳实践（接入相关报错/限制/约束）

### G.1 登录与鉴权失败
- 报错「本次登录失败，请重新登录」「Error: Unable to connect. Is the computer able to access the url?」「Cannot connect to API: ...」「请检查网络配置，暂时无法访问受限的网络资源」：多因公司内网代理未配置或未填代理认证用户名密码。
  来源：`常见问题.txt` L117-139。
- 插件被禁用会导致单击「华为账号登录」无反应。
  来源：`常见问题.txt` L145-165。
- 报错「您好，您尚未获得此功能的访问权限，请联系企业管理员为您开启席位。」：账号未加入企业成员且未分配席位，或已加入但未分配席位。
  来源：`常见问题.txt` L184-231。
- 「受限模式，功能已禁用」：新建/打开项目时选择「否，我不信任此作者」，需在「工作区信任」中信任当前目录或父级。
  来源：`常见问题.txt` L293-310。
- 403 `action:devcloud:monthlyPackage:subscribe` / `action:codearts:monthlyPackage:subscribe`：IAM 用户或企业联邦用户未授予购买套餐的细粒度权限，需配置 DevCloud/CodeArts 与 BSS/billing 策略。
  来源：`常见问题.txt` L1449-1528。

### G.2 模型不可用/限流
- 「模型未加载成功，无法使用」：公司内网未配置代理，或本地有缓存；可配置代理或删除 `C:\Users\用户名\AppData\Roaming\codearts-agent` 后重启。
  来源：`常见问题.txt` L1092-1107。
- 限流报错「套餐5小时窗口周期内，当前模型可用额度已用完，系统将在60分钟后自动为您陆续恢复」/「7天窗口...24小时后...」。
  来源：`常见问题.txt` L575-611。
- 排队提示三类（队列已满、高峰排队、套餐额度用尽）。
  来源：`常见问题.txt` L1108-1142。
- Token 套餐额度用完后部分模型不可调用且不支持开通按需。
  来源：`常见问题.txt` L480-483。

### G.3 沙箱相关
- 沙箱程序被拦截：报错 `Sandbox exe not found at expected path: C:\Users\XXXX\.codeartsdoer\codearts-data\sandbox_runner\...\windows_sandbox.exe` 或「沙箱模式不可用，无法执行删除命令」；原因可能是被杀毒软件拦截；解决：删除 `%USERPROFILE%/.codeartsdoer/codearts-data/sandbox_runner` 下指定版本文件夹后重启。
  来源：`常见问题.txt` L936-957。
- 沙箱内存溢出：提示「任务因沙箱内存溢出而终止，请增大沙箱内存规格或点击"运行"转为沙箱外运行」；可通过 sandbox.json 调整 CPU/内存。
  来源：`常见问题.txt` L1020-1035。
- 本地 LSP 服务不可用：日志出现 `failed to install`；可手动安装 LSP 包并在配置文件中指定路径；仅支持 Java(jdtls)、TypeScript(typescript)、Go(gopls)、Python(pyright)。
  来源：`常见问题.txt` L958-1018。

### G.4 MCP 相关
- MCP 高精度数字参数丢失精度：建议 MCP 服务端用 String 类型传高精度数字。
  来源：`常见问题.txt` L1158-1178。
- uv/uvx 目录占用磁盘过大：可用 `uv cache prune` / `uv cache clean` 或手动删除 `%USERPROFILE%/AppData/Local/uv/cache`。
  来源：`常见问题.txt` L1179-1211。
- 第三方 MCP Server 免责声明：华为云不审查、不背书第三方 MCP Server 的代码实现、安全性、稳定性与数据处理行为。
  来源：`用户指南（码道CLI）.txt` L2316-2331；`用户指南（码道IDE）.txt` L2983-3002。
- MCP 服务器名称超 64 字符会报错并导致当前请求不可用。
  来源：`用户指南（码道IDE）.txt` L3073-3079；`最佳实践.txt` L1281-1289。

### G.5 远程连接相关
- 远程连接失败「认证失败」：用户名、IP 地址或端口配置有误。
  来源：`常见问题.txt` L638-647。
- 远程连接失败「ETIMEDOUT」。
  来源：`常见问题.txt` L681-683。
- 克隆 Git 仓库提示「Could not connect to server」。
  来源：`常见问题.txt` L775-777。

### G.6 最佳实践中的 MCP 配置实例（可佐证配置格式）
- CodeArts Check MCP 配置（`mcp_settings.json`）：`mcpServers` → `CodeArts Check MCP` → `disabled:false`、`timeout:600000`、`command:[node.exe, index.js]`、`environment:{region:"cn-north-4", ak, sk}`、`type:"local"`；`region` 固定 `cn-north-4`。
  来源：`最佳实践.txt` L1259-1328。
- GitHub MCP 配置：`url: https://api.githubcopilot.com/mcp/x/all`、`headers.Authorization: Bearer <token>`、`X-MCP-Toolsets`、`timeout:60`、`disabled:false`、`type:"streamableHttp"`。
  来源：`最佳实践.txt` L1878-1887。
- Atlassian MCP 内网启用失败时，可配置系统环境变量 `NODE_TLS_REJECT_UNAUTHORIZED=0`。
  来源：`最佳实践.txt` L1840-1845。
- MCP 授权成功回显：`Authorization successful! You may close this window and return to the CLI.`
  来源：`最佳实践.txt` L1848-1849。

---

## H. 文档未覆盖 / 证据不足项（明确列出）

以下为本预研关注但官方文档**未给出明确规定**的内容：

1. **`codearts serve` 的服务端接口清单、协议、请求/响应格式**：文档只给出 `codearts serve` 的启动参数与 `codearts generate`（打印 OpenAPI 描述含 JS SDK 示例）这一条命令描述，未列出任何端点、字段或 SDK 包名。
   来源：`用户指南（码道CLI）.txt` L2857-2875、L2917-2918。
2. **serve 与 DSH/第三方服务对接的鉴权模型**：仅知 `CODEARTS_SERVER_USERNAME/PASSWORD` 与 `--password`；未说明 Token/OAuth/证书等其他鉴权方式。
   来源：`用户指南（码道CLI）.txt` L2859-2875、L3227-3228。
3. **serve 是否支持自定义模型路由**：CLI 自定义模型配置（`codearts_cli.json`）与 serve 的关系未说明。
   来源：`用户指南（码道CLI）.txt` L1823-1846；文档未覆盖。
4. **官方 REST API 与 serve 通道的关系**：API参考仅 4 个用量/代码同步接口，未涉及推理或 serve。
   来源：`API参考.txt` L27-43、L103-135。
5. **控制台「CLI授权指导」章节正文**：仅在权限对照表出现菜单名，无正文。
   来源：`用户指南（控制台）.txt` L159、L184、L846。
6. **小程序/插件的 MCP、沙箱、自定义模型配置细节**：目录中无对应章节。
   来源：`用户指南（码道小程序）.txt` L27-38；`用户指南（码道CodeArts插件）.txt` L27-38。
7. **桌面端/网页端「连接器」的具体配置字段**：仅说明基于 MCP，未给配置项。
   来源：`用户指南（码道桌面端&网页端）.txt` L144-146。
8. **各端登录的 Token 有效期细则（CLI 侧）**：CLI 指南未给出登录态有效期；仅控制台给出 30 天/24 小时免登录规则。
   来源：`用户指南（控制台）.txt` L738-753；`用户指南（码道CLI）.txt` 未覆盖。
9. **模型列表的完整官方清单**：仅计费说明给出带积分系数的模型表；未给出模型能力/上下文长度/是否推理等完整目录。
   来源：`计费说明.txt` L100-117。
10. **错误码体系（客户端/CLI 侧）**：仅 API参考给出 REST 错误码；CLI/serve 侧错误码未覆盖。
    来源：`API参考.txt` L1666-1678。

---

## 附：来源文件清单（含用户清单外补充文件）

| 文件 | 行数 | 备注 |
|---|---|---|
| 华为云码道CodeArts代码智能体 用户指南（控制台）.txt | 3396 | 用户清单 |
| 华为云码道CodeArts代码智能体 用户指南（码道小程序）.txt | 681 | 用户清单 |
| 华为云码道CodeArts代码智能体 用户指南（码道桌面端&网页端）.txt | 2930 | 用户清单 |
| 华为云码道CodeArts代码智能体 用户指南（码道CodeArts插件）.txt | 928 | 用户清单 |
| 华为云码道CodeArts代码智能体 用户指南（码道IDE）.txt | 7825 | 用户清单 |
| 华为云码道CodeArts代码智能体 常见问题.txt | 2029 | 用户清单 |
| 华为云码道CodeArts代码智能体 最佳实践.txt | 2807 | 用户清单 |
| 华为云码道CodeArts代码智能体 用户指南（码道CLI）.txt | 3354 | **补充，serve 主题核心** |
| 华为云码道CodeArts代码智能体 API参考.txt | 1737 | **补充，官方 REST API** |
| 华为云码道CodeArts代码智能体 计费说明.txt | 1054 | **补充，模型/积分** |
| 华为云码道CodeArts代码智能体 快速入门.txt | 289 | 补充 |
| 华为云码道CodeArts代码智能体 产品介绍.txt | 116 | 补充，产品形态 |
| 华为云码道CodeArts代码智能体 活动.txt | 193 | 补充，学生认证 |
