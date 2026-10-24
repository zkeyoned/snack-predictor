/* 零食发明机 SNACK-O-MATIC 3000 — 预测引擎（M4）
 * 公式照 docs/整体设计方案.md 4.3：
 *   S = 物料小计；P = 溢价小计；F = 服务费 200 KZ；
 *   R = (S+P) × 种子随机[-5%,+8%]，四舍五入到十位；
 *   T = max(500, ceil((S+P+F+R)/10)*10)
 * 种子 = 全部选中 id 排序拼接后的字符串哈希 → 同一组合结果可复现
 */
(function () {
  'use strict';

  var DATA = window.SNACK_DATA;

  // ---------- 种子随机 ----------

  // 字符串哈希（xmur3 风格，输出 uint32）
  function hashString(str) {
    var h = 1779033703 ^ str.length;
    for (var i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  }

  // mulberry32 PRNG
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ---------- 工具 ----------

  function collectItems(selection) {
    var items = [];
    if (selection.base) items.push(selection.base);
    (selection.toppings || []).forEach(function (t) { if (t) items.push(t); });
    (selection.sauces || []).forEach(function (s) { if (s) items.push(s); });
    if (selection.pack) items.push(selection.pack);
    return items;
  }

  function countTag(items, tag) {
    var n = 0;
    items.forEach(function (it) {
      if (it.tags && it.tags.indexOf(tag) !== -1) n++;
    });
    return n;
  }

  function hasTag(items, tag) {
    return countTag(items, tag) > 0;
  }

  function hasAnyTag(items, tags) {
    for (var i = 0; i < tags.length; i++) {
      if (hasTag(items, tags[i])) return true;
    }
    return false;
  }

  function countIds(items, ids) {
    var n = 0;
    items.forEach(function (it) {
      if (ids.indexOf(it.id) !== -1) n++;
    });
    return n;
  }

  function hasId(items, id) {
    return countIds(items, [id]) > 0;
  }

  function round10(x) { return Math.round(x / 10) * 10; }
  function ceil10(x) { return Math.ceil(x / 10) * 10; }

  // ---------- 溢价规则触发（4.4 逐条） ----------

  var HEAVY_IDS = ['latiao', 'latiaosi', 'chili', 'laoganma', 'wasabi', 'luosifen', 'zheergen', 'cilantro'];

  function evalPremiums(selection, items, contentSubtotal) {
    var toppings = selection.toppings || [];
    var sauces = selection.sauces || [];
    var hit = [];

    DATA.premiumRules.forEach(function (rule) {
      if (rule.disabled) return; // 艺术家联名费 / 隐藏款发掘费：依赖后续模块，跳过
      var amount = 0;
      switch (rule.id) {
        case 'emotion': // 快乐/软萌/童年/少女心 标签合计 ≥2
          var emo = countTag(items, '快乐') + countTag(items, '软萌') +
                    countTag(items, '童年') + countTag(items, '少女心');
          if (emo >= 2) amount = rule.amount;
          break;
        case 'guilt': // 油炸/高糖/高热量 每命中 1 项 +150
          var guilt = countTag(items, '油炸') + countTag(items, '高糖') + countTag(items, '高热量');
          if (guilt > 0) amount = rule.amount * guilt;
          break;
        case 'darkcuisine': // 甜系 与 辣/芥末/生化/折耳根 共存
          if (hasTag(items, '甜') && hasAnyTag(items, ['辣', '芥末', '生化', '折耳根'])) amount = rule.amount;
          break;
        case 'craft': // 配料 ≥2，从第 2 款起 +120/款
          if (toppings.length >= 2) amount = rule.amount * (toppings.length - 1);
          break;
        case 'childhood': // 干脆面/旺仔/咪咪/AD钙奶/跳跳糖（「童年」标签）≥2
          if (countTag(items, '童年') >= 2) amount = rule.amount;
          break;
        case 'crossbrand': // 奥利奥/旺仔/咪咪/AD钙奶/老干妈（「大牌」标签）≥2
          if (countTag(items, '大牌') >= 2) amount = rule.amount;
          break;
        case 'lowcal': // 魔芋爽 与 任一高糖/巧克力/炼乳 共存
          if (hasTag(items, '低卡假象') && hasAnyTag(items, ['高糖', '巧克力'])) amount = rule.amount;
          break;
        case 'heavy': // 辣条/辣椒粉/老干妈/芥末/螺蛳粉/折耳根/香菜 ≥2
          if (countIds(items, HEAVY_IDS) >= 2) amount = rule.amount;
          break;
        case 'packaging': // 包装成本 > 内容物小计 × 50%
          if (selection.pack && selection.pack.cost > contentSubtotal * 0.5) amount = rule.amount;
          break;
        case 'outofcontrol': // 配料满 4 且酱料满 2
          if (toppings.length >= 4 && sauces.length >= 2) amount = rule.amount;
          break;
        case 'ecotax': // 选透明袋
          if (selection.pack && selection.pack.id === 'clear') amount = rule.amount;
          break;
        case 'michelin': // 螺蛳粉 + 芥末 + 跳跳糖 同现
          if (hasId(items, 'luosifen') && hasId(items, 'wasabi') && hasId(items, 'popping')) amount = rule.amount;
          break;
      }
      if (amount > 0) hit.push({ name: rule.name, amount: amount, note: rule.note });
    });

    return hit;
  }

  // ---------- 评语（4.5） ----------

  function pickVerdict(list, value) {
    for (var i = 0; i < list.length; i++) {
      if (value >= list[i].min && value <= list[i].max) return list[i].text;
    }
    return list[list.length - 1].text;
  }

  // ---------- 主入口 ----------

  function price(selection) {
    selection = selection || {};
    var items = collectItems(selection);

    // 种子：全部选中 id 排序拼接 → 哈希
    var seedKey = items.map(function (it) { return it.id; }).sort().join('|');
    var rand = mulberry32(hashString(seedKey));

    // ① 物料小计 S
    var S = items.reduce(function (sum, it) { return sum + it.cost; }, 0);

    // ② 溢价小计 P（内容物小计 = 不含包装的 S，用于买椟还珠判定）
    var contentSubtotal = S - (selection.pack ? selection.pack.cost : 0);
    var premiums = evalPremiums(selection, items, contentSubtotal);
    var P = premiums.reduce(function (sum, p) { return sum + p.amount; }, 0);

    // ③ 服务费 F
    var F = DATA.serviceFee;

    // ④ 玄学浮动 R = (S+P) × 随机[-5%, +8%]，四舍五入到十位
    var R = round10((S + P) * (-0.05 + rand() * 0.13));

    // ⑤⑥ 最终总价 T
    var total = Math.max(500, ceil10(S + P + F + R));

    // 怪异度总分
    var quirkScore = items.reduce(function (sum, it) { return sum + (it.quirk || 0); }, 0);

    return {
      items: items.map(function (it) { return { name: it.name, cost: it.cost }; }),
      premiums: premiums,
      serviceFee: F,
      fluctuation: R,
      subtotal: S,
      premiumTotal: P,
      quirkScore: quirkScore,
      total: total,
      verdicts: {
        price: pickVerdict(DATA.verdicts.price, total),
        quirk: pickVerdict(DATA.verdicts.quirk, quirkScore)
      }
    };
  }

  window.SnackEngine = { price: price };
})();
