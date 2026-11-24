# DSH 源码事实提取（E 域：插件实现面）

> 用途：为 [`_temp/plan.md`](../plan.md) 的 E 域问题提供源码级依据。
> 来源：`D:\deepseek-harness`（只读，未改任何文件）。行号基于当前源码。
> 提取日期：2026-11-20

---

## 0. 总体结论

- DSH 是 **all-plugin Cordis harness**（`AGENTS.md` L3）。
- 插件通过 `ctx.llm.registerAdapter(providers, adapter)` 接入模型通道；adapter 继承/实现 `LlmAdapter`。
- 插件通过 `settings.configure(...)`、`webServer.register(...)`、`ctx.inject([...])`、`ctx.effect(...)` 扩展 UI/设置/生命周期。
- 安装走 `plugin_manager action: install_bundle` + **包目录**（不是 tgz）；patch 用 `cordis.patch.yml` 的 `insert` 行。

---

## E1. 插件与 Llm 注册 API

| 事实 | 位置 |
| --- | --- |
| `LlmAdapter` 抽象类；唯一必须实现的方法是 `stream(options)`；可覆盖 `providerInfo`/`providerRetryPolicy`/`imageRequestPricing`/`imageRequestTarget`/`listModels`/`resolveModel`/`prepareCall` | `packages/llm/llm/src/index.ts` L223-318 |
| `registerAdapter(providers, adapter)`；全有或全无（重复 provider 抛 `DUPLICATE_ADAPTER`）；返回 disposer + `replace(providers)` | 同上 L416-445 |
| provider 路由校验：非空（L456）、唯一（L457-459）、`providerInfo.id` 必须等于 provider 且 `name` 非空（L460-463） | 同上 L452-473 |
| 注册事件：`llm/adapters-updated`（无 payload）、`llm/models-updated(provider)` | `packages/llm/llm/src/types.ts` L13-31 |
| `LlmModelInfo`（provider/id/name/description/inputModalities/badge） | `types.ts` L369-385 |
| `LlmResolvedModelInfo`（含 context/defaultMaxTokens/reasoning/systemPromptUpdate/toolUpdate） | `types.ts` L454-465 |
| 思考档位：`reasoning.efforts[]`（id/name）+ `defaultEffort` | `types.ts` L413-432 |
| 流协议 `StreamChunk`：block-start/text-delta/reasoning-delta/tool-call-delta/block-end/usage/finish | `types.ts` L496-508 |
| 远程方法：`listProviders`/`listConfigurableProviders`/`resolveModelInfo`/`discoverModels` | `packages/llm/llm/src/index.ts`（`@Remote` 标注） |

**参照项目对照**：`LocalAdapter` 是普通类（未 extends LlmAdapter），方法签名与上述一致，通过 `ctx.llm.registerAdapter([providerId], adapter)` 注册（参照 `plugin/src/index.ts` L53）。

## E2. settings 扩展点

| 事实 | 位置 |
| --- | --- |
| `settings.configure(presentation: { auto?: boolean }, owner: Fiber = ctx.fiber): () => void` | `packages/settings/settings/src/index.ts` L266 |
| 自带页面插件：`ctx.inject(['settings'], child => child.effect(() => child.settings.configure({ auto: false }, fiber)))` | `packages/settings/settings/README.md` L39 |
| 参照项目用 `settings.configure({ auto: true }, fiber)`（交给 DSH 按 schema 生成页面） | 参照 `plugin/src/index.ts` L56-59 |

## E3. webServer 扩展点

| 事实 | 位置 |
| --- | --- |
| 参照项目通过 `ctx.inject(['webServer'])` 取服务，调用 `ws.register({ kind, path, handler })` 注册 exact 路由 | 参照 `plugin/src/web/routes.ts` L29-58、L105-120 |
| `webServer` 服务由 web-app bundle 提供 | `packages/bundle/web-app/src/index.ts`（存在性已确认） |
| 参照项目注册的端点：`/plugins/opencode-local/models`、`/models/refresh`、`/catalog`、`/catalog/refresh`、`/context` | 参照 `plugin/src/web/routes.ts` |

## E4. 上下文状态读取

| 事实 | 位置 |
| --- | --- |
| `sessions.get(sessionId)` 取会话 | 参照 `routes.ts` L133-135 |
| `sessionProjections.snapshot(session)?.values`（含 `contextPressure`/`contextBreakdown`/`tokenUsage`） | 参照 `routes.ts` L137-146 |
| `tokenMeter.measure(session)?.totalTokens` | 参照 `routes.ts` L139-142 |
| 这些是 DSH 既有服务，插件只读消费 | 同上 |

## E5. 工具政策

- 参照项目把工具审批决策放在**插件内部**（`toolPolicy()` + 对 serve permission 请求的 reply），不依赖 DSH 的权限服务。
- 因此 E4（工具政策接口）对 CodeArts 版大概率同样是「插件自建」，无需 DSH 权限扩展点；实现期若 DSH 有工具政策事件再评估。

## E6. 安装 / 打包 / profile

| 事实 | 位置 |
| --- | --- |
| 官方安装：`plugin_manager` `action: install_bundle`，`target` = 绝对包目录 | `packages/preset/agent-preset/skills/dsh-doc/references/plugin-development.md` L3 |
| patch 形式：`cordis.patch.yml` 的 `insert` 行（id/name/config） | 参照 `plugin/cordis.patch.yml` L1-5 |
| profile 环境变量：`DSH_PROFILE` / `DSH_PROFILE_DIR`（profile 的 node_modules 只装 profile 安装的 bundle） | `plugin-development.md` L26 |
| 参照项目 README 记载的安装方式：tgz + `dsh plugin --profile web add`（旧/封装路径） | 参照 `README.md` |
| 结论：以实现时 DSH 当前版本的 `install_bundle` 为准，tgz 方式需先核对 CLI 是否仍支持 | — |

## E7. provider id 命名约束

- 源码仅约束：**非空 + 全局唯一 + `providerInfo.id` 与注册名一致**（`llm/src/index.ts` L456-463）。
- 未发现字符集限制；参照项目用 `opencode-local`，故 `codearts-local` 可用（仍需实测注册成功）。

## E8. 与既有 opencode-local 插件共存

- 两个插件注册**不同 provider id** 即不冲突（`DUPLICATE_ADAPTER` 只在同名时抛）。
- 端口/数据目录由各自插件配置隔离（参照项目用 `~/.dsh-opencode-local` + `portBase`）。
- CodeArts 版需用独立 provider id、独立数据目录、独立端口基址。

## E9. 对外 HTTP API

- 参照项目的对外 API 是**插件自建的独立 HTTP 服务**（`ApiServer`），不是 DSH 扩展点。
- 是否保留由用户决策（plan.md 第 7 节确认项）。

---

## 覆盖度结论

- **已核实（源码级）**：E1（registerAdapter/LlmAdapter/校验）、E2（settings.configure）、E3（webServer.register）、E4（上下文读取）、E7（provider 命名约束）、E8（共存约束）、E6（安装机制，官方 install_bundle）。
- **需实现期确认**：E5（DSH 工具政策事件是否影响插件内审批）、E6 的 tgz 方式是否仍被当前 CLI 支持、E9（决策项）。
