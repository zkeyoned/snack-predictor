# 你是 Agent B：页面与交互工程师

## 项目背景
「零食发明机 SNACK-O-MATIC 3000」——涂鸦手绘风的零食拼装 + 价格预测网页。Demo 只做：拼装 → 预测 → 出小票（不做摇杆和涂鸦画布，界面不要出现这两个入口）。

## 开工前必读
先读 `/Users/kongke/Desktop/snack-predictor/docs/整体设计方案.md` 的**第二、三、六章**。

## 你的势力范围（只允许动这两个文件）
- `index.html`
- `js/app.js`

**禁止**修改 js/data.js、js/engine.js、css/、assets/——那是 Agent A 和 Agent C 的地盘。他们提供的接口你直接用：
- `window.SNACK_DATA`：含 bases/toppings/sauces/packs 数组，每项 `{id, name, cost, tags, quirk, icon}`
- `window.SnackEngine.price({base, toppings:[], sauces:[], pack})` → `{items, premiums, serviceFee, fluctuation, total, verdicts}`
- CSS 类名约定：卡片 `.card`、选中态 `.selected`、托盘项 `.tray-item`、预测按钮 `#btn-predict`、小票 `#receipt`

## 任务 1：index.html
1. 引用 `css/style.css`、`js/data.js`、`js/engine.js`、`js/app.js`；字体引 Google Fonts 的 ZCOOL KuaiLe。
2. 布局按文档第六章：顶部手绘标题「零食发明机 SNACK-O-MATIC 3000」（副标题 v0.3 内测版）；左侧拼装台（基底/配料/酱料/包装四个选项卡），右侧预览区 + 预测大红按钮 + 报告单区。
3. 所有选项卡用 `<img>` 引用数据里的 icon 路径，**加 onerror 兜底显示占位 emoji**——图片由 Agent C 稍后生成，你开发时它们还不存在，页面不能因此崩。

## 任务 2：js/app.js
1. 渲染四个选项卡（数据来自 window.SNACK_DATA）；基底/包装单选，配料 ≤4、酱料 ≤2 多选，超限时卡片抖动提示。
2. 已选托盘：便签样式列出所有选中项，点击可移除。
3. 点预测按钮：先播 2 秒「机器运转」演出（按钮变读条 + 文字轮播「校准零食雷达…」「咨询大盘指数…」「拍脑袋中…」），再调用 `SnackEngine.price()` 渲染小票。
4. 小票按超市小票排版：物料明细逐项、溢价项带备注文案、服务费、玄学浮动、总价大字、鉴定评语（价格+怪异度两条）、伪条形码（div 竖线模拟）、底部免责小字「*本预测由 SNACK-O-MATIC 3000 拍脑袋认证，如有雷同，纯属它抄你」。
5. 未选齐基底和包装时按钮置灰不可点。

## 验收
浏览器打开 index.html：能完整选一套组合、点预测出小票、同组合总价稳定、图片缺失时 emoji 兜底不破版。
