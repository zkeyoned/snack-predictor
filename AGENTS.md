# AGENTS.md — 项目总入口（打开文件夹先读我）

> 任何新对话 / 新 Agent 进入本项目时，**先读本文件**，再按分工去读各自的详细文档。

---

## 0. 仓库信息（已就绪）

- **GitHub 仓库**：`https://github.com/zkeyoned/snack-predictor`（公开）
- **远程关联**：本地 `main` 分支已通过 SSH 推送，`origin` 已关联
- **初始提交**：`d7f8531` —— 初始提交：整体设计方案文档
- **当前仓库内容**：`docs/整体设计方案.md` + `.gitignore`
- **日常推送**：之后本地有新提交，直接 `git push` 即可

---

## 1. 项目一句话

**零食发明机 SNACK-O-MATIC 3000**（v0.3 内测版，永远内测版）——涂鸦手绘风的零食拼装 + 价格预测网页。用户拼装一款世上不存在的零食，机器煞有介事地预测价格，吐出超市小票风格的「价格预测报告单」。

**技术架构**：单文件式原生 HTML/CSS/JS，零依赖、零构建，直接用浏览器打开 `index.html` 即可运行。

**Demo 范围**：只做「选基底/配料/酱料/包装 → 预测 → 生成小票」主流程。M2 命运摇杆、M3 涂鸦画布**暂不开发、不在界面展示**（数据保留）。

---

## 2. 目录结构与分工地图

```
snack-predictor/
├── AGENTS.md                  ← 你在读的这个（总入口）
├── index.html                 ← Agent B 的地盘
├── docs/
│   └── 整体设计方案.md         ← 唯一权威设计文档（价格/规则/文案以此为准）
├── agents/
│   ├── AGENT_A_数据与引擎.md   ← Agent A 任务书
│   ├── AGENT_B_页面与交互.md   ← Agent B 任务书
│   └── AGENT_C_视觉与插画.md   ← Agent C 任务书
├── js/
│   ├── data.js                ← Agent A：window.SNACK_DATA
│   ├── engine.js              ← Agent A：window.SnackEngine.price()
│   └── app.js                 ← Agent B：交互逻辑
├── css/
│   └── style.css              ← Agent C：涂鸦手绘风
└── assets/img/                ← Agent C：插画 + MANIFEST.md
```

| Agent | 势力范围（只许动这些） | 任务书 |
|---|---|---|
| **A 数据与引擎** | `js/data.js`、`js/engine.js` | [agents/AGENT_A_数据与引擎.md](agents/AGENT_A_数据与引擎.md) |
| **B 页面与交互** | `index.html`、`js/app.js` | [agents/AGENT_B_页面与交互.md](agents/AGENT_B_页面与交互.md) |
| **C 视觉与插画** | `css/style.css`、`assets/img/` | [agents/AGENT_C_视觉与插画.md](agents/AGENT_C_视觉与插画.md) |

**铁律：各 Agent 不得越界改别人的文件。**

---

## 3. 跨模块接口约定（已冻结，三方都已认可）

- `window.SNACK_DATA`：`bases` / `toppings` / `sauces` / `packs` / `hidden` / `premiumRules` / `verdicts`；每项 `{id, name, cost, tags:[], quirk, icon}`
- `window.SnackEngine.price({base, toppings:[], sauces:[], pack})` → `{items, premiums, serviceFee, fluctuation, total, verdicts}`
- CSS 类名约定：`.card`、`.selected`、`.tray-item`、`#btn-predict`、`#receipt`
- 物料价格、溢价规则、评语**严格照 `docs/整体设计方案.md` 第四章实现，不得自行发挥**

---

## 4. 新对话开工流程

1. 读本文件，确认自己的角色（A / B / C 或总体协调）
2. 读 `docs/整体设计方案.md` 中与角色相关的章节（各任务书里有指明）
3. 读 `agents/` 下对应的任务书，按任务清单逐项执行
4. 完成后本地验证（浏览器打开 `index.html`），再 `git commit` + `git push`

---

## 5. 当前状态

- [x] 整体设计方案 v1.0（待用户评审）
- [x] 三份 Agent 任务书 + 接口约定
- [x] GitHub 远程仓库关联
- [ ] Demo 开发（三 Agent 可并行开工）
- [ ] M2 命运摇杆 / M3 涂鸦画布（Demo 后置）
