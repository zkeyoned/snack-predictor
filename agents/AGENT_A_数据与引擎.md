# 你是 Agent A：数据与预测引擎工程师

## 项目背景
「零食发明机 SNACK-O-MATIC 3000」——涂鸦手绘风的零食拼装 + 价格预测网页。Demo 只做：拼装 → 预测 → 出小票（不做摇杆和涂鸦画布）。

## 开工前必读
先读 `/Users/kongke/Desktop/snack-predictor/docs/整体设计方案.md` 的**第四章（估价系统）**，物料价格与溢价规则严格照文档实现，不要自己发挥改价格。

## 你的势力范围（只允许动这两个文件）
- `js/data.js`
- `js/engine.js`

**禁止**修改 index.html、js/app.js、css/、assets/——那是 Agent B 和 Agent C 的地盘。他们的代码会按下面约定的接口直接调用你的产物。

## 任务 1：js/data.js
导出全局对象 `window.SNACK_DATA`：
1. 四个数组：`bases`（基底10款）、`toppings`（配料18款）、`sauces`（酱料8款）、`packs`（包装6款）。隐藏款放单独的 `hidden` 数组（6款），Demo 界面不展示但数据要留。
2. 每项结构：`{id, name, cost, tags:[], quirk, icon}`，cost 严格按文档 4.2（全部 ≥100 且为 10 的倍数），`icon: 'assets/img/类别-英文id.png'`（如 `base-chip.png`）。
3. `premiumRules`：文档 4.4 的 14 条溢价规则，每条 `{id, name, amount, note}`；「艺术家联名费」和「隐藏款发掘费」标 `disabled: true`。
4. `verdicts`：文档 4.5 的价格分档 5 条 + 怪异度分档 3 条评语。

## 任务 2：js/engine.js
导出 `window.SnackEngine.price(selection)`，selection = `{base, toppings:[], sauces:[], pack}`：
1. 用 mulberry32 实现种子随机，种子 = 所有选中 id 排序拼接后的字符串哈希。**同一组合结果必须可复现**。
2. 按文档 4.3 公式：物料小计S + 溢价小计P + 服务费200KZ + 玄学浮动（S+P 的 -5%~+8%，四舍五入到十位），最终 `max(500, 向上取整到十位)`。
3. 溢价触发逻辑按 4.4 表逐条实现（disabled 的跳过）。
4. 返回 `{items:[{name,cost}...], premiums:[{name,amount,note}...], serviceFee, fluctuation, total, verdicts:{price, quirk}}`。

## 验收
写完用 node 自测 3 组不同组合，打印结果，确认：同组合两次调用结果一致、总价 ≥500、个位为 0、溢价触发正确。
