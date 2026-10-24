# 你是 Agent C：视觉与插画师

## 项目背景
「零食发明机 SNACK-O-MATIC 3000」——涂鸦手绘风的零食拼装 + 价格预测网页。整体气质：小学生课本涂鸦 × 草稿纸 × 马克笔。

## 开工前必读
先读 `/Users/kongke/Desktop/snack-predictor/docs/整体设计方案.md` 的**第五章（视觉设计系统）和第七章（插画资源清单）**。

## 你的势力范围（只允许动这些）
- `css/style.css`
- `assets/img/` 下的图片和 MANIFEST.md

**禁止**修改 index.html、js/——那是 Agent A 和 Agent B 的地盘。他们已按下面的类名约定写代码，你直接对这些类名生效：
- 卡片 `.card`、选中态 `.selected`、托盘项 `.tray-item`、预测按钮 `#btn-predict`、小票 `#receipt`

## 任务 1：css/style.css（涂鸦手绘风）
1. 背景：米黄草稿纸 `#FAF3E0` + CSS 渐变模拟淡铅笔格线；配色严格用文档色板（番茄红 `#E8503A` / 芥末黄 `#F2B33D` / 铅笔灰 `#4A4A4A` / 天蓝 `#5BA8D9`）。
2. 字体 ZCOOL KuaiLe 全局生效，fallback 到手写体。
3. 卡片/按钮/小票用不规则 border-radius（如 `255px 15px 225px 15px/15px 225px 15px 255px`）+ 2px 铅笔灰边框模拟手绘抖线，卡片轻微 `rotate(±0.5deg)` 随机倾斜。
4. 动效：选项 hover 抖动 keyframes、选中弹跳 scale、预测按钮按下下沉、小票从顶部滑出的撕纸效果。
5. 响应式：<900px 单列，拼装台在下，预测按钮吸底。

## 任务 2：插画生成（assets/img/，共 52 张）
1. 用图像生成能力，统一 prompt 模板：
   `{主体}, doodle hand-drawn style, crayon and marker sketch, rough wobbly lines, childlike drawing on white paper, single object, centered, no text`，square 尺寸。
2. 清单 = 文档第七章：基底10 + 配料18 + 酱料8 + 包装6 + 隐藏款6 + 装饰4（机器本体/大红按钮/2组贴纸）。
3. 命名：`base-*.png / topping-*.png / sauce-*.png / pack-*.png / hidden-*.png / deco-*.png`，文件名必须和 js/data.js 里各项的 icon 字段对应（英文 id 自拟，映射关系记录到 `assets/img/MANIFEST.md`）。
4. 分批生成，每张目检：主体清晰、是潦草涂鸦感、无文字；不合格重生成。

## 验收
index.html 打开后整体涂鸦风成立、风格统一；48 款物料插画与选项一一对应无缺失。
