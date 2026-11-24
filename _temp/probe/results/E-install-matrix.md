# 安装方式对照与裁决（P6.5）

日期：2026-11-21 ｜ DSH：0.2.2-rc.3

| 方式 | 结果 | 证据 |
| --- | --- | --- |
| `dsh plugin --profile web add <tgz>` | ✅ **可用（实测）** | 实测成功；web profile 已有多个本地 tgz 依赖（`@hbk/dsh-opencode-local`、`dsh-connect-catpaw`、`dsh-deveco2api-plugin`） |
| `plugin_manager action: install_bundle`（包目录） | 未实测（备选） | DSH 官方文档 `plugin-development.md` 记载；属插件市场路径 |

**裁决：用 tgz 方式**（与参照项目 `@hbk/dsh-opencode-local` 一致，且已在当前 DSH 上验证可用）。

**附带确认**：
- 生效条件：参照项目 README 记载「装完必须完全退出并重启 DSH」（沿用）。
- profile 隔离：插件按 profile 的 `package.json` + `dsh.profile.bundles` 挂载；CodeArts 版需加入 web profile 的 bundles 列表。
