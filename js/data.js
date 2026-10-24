/* 零食发明机 SNACK-O-MATIC 3000 — 数据中心（M7）
 * 价格严格照 docs/整体设计方案.md 4.2 / 4.4 / 4.5，单位：咔滋币 KZ
 * 所有物料单价 ≥100 且为 10 的倍数
 */
(function () {
  'use strict';

  // ---------- 物料库（4.2，共 48 款） ----------

  // 基底（单选，10 款）
  var bases = [
    { id: 'chip',        name: '薯片底',       cost: 320, tags: ['经典', '油炸'],           quirk: 1, icon: 'assets/img/base-chip.png' },
    { id: 'soda',        name: '苏打饼干底',   cost: 260, tags: ['朴素', '干燥'],           quirk: 0, icon: 'assets/img/base-soda.png' },
    { id: 'chocobar',    name: '巧克力棒底',   cost: 460, tags: ['快乐', '高热量', '甜', '巧克力'], quirk: 1, icon: 'assets/img/base-chocobar.png' },
    { id: 'marshmallow', name: '棉花糖底',     cost: 220, tags: ['软萌', '高糖', '甜'],     quirk: 2, icon: 'assets/img/base-marshmallow.png' },
    { id: 'popcorn',     name: '爆米花底',     cost: 280, tags: ['观影搭子'],               quirk: 0, icon: 'assets/img/base-popcorn.png' },
    { id: 'jelly',       name: '果冻底',       cost: 200, tags: ['QQ弹弹', '甜'],           quirk: 1, icon: 'assets/img/base-jelly.png' },
    { id: 'latiao',      name: '辣条底',       cost: 270, tags: ['国民', '辣', '重口'],     quirk: 3, icon: 'assets/img/base-latiao.png' },
    { id: 'noodle',      name: '干脆面底',     cost: 240, tags: ['童年', '干燥'],           quirk: 1, icon: 'assets/img/base-noodle.png' },
    { id: 'konjac',      name: '魔芋爽底',     cost: 360, tags: ['低卡假象', '辣'],         quirk: 2, icon: 'assets/img/base-konjac.png' },
    { id: 'bun',         name: '旺仔小馒头底', cost: 250, tags: ['童年', '奶香', '甜', '大牌'], quirk: 1, icon: 'assets/img/base-bun.png' }
  ];

  // 配料（多选 ≤4，18 款）
  var toppings = [
    { id: 'cheese',     name: '芝士粉',           cost: 180, tags: ['浓郁'],                     quirk: 1, icon: 'assets/img/topping-cheese.png' },
    { id: 'oreo',       name: '奥利奥碎',         cost: 220, tags: ['大牌', '甜'],               quirk: 1, icon: 'assets/img/topping-oreo.png' },
    { id: 'seaweed',    name: '海苔碎',           cost: 140, tags: ['清爽'],                     quirk: 0, icon: 'assets/img/topping-seaweed.png' },
    { id: 'mimi',       name: '咪咪虾条',         cost: 190, tags: ['童年', '大牌', '咸鲜'],     quirk: 2, icon: 'assets/img/topping-mimi.png' },
    { id: 'popping',    name: '跳跳糖',           cost: 240, tags: ['危险分子', '童年', '甜'],   quirk: 4, icon: 'assets/img/topping-popping.png' },
    { id: 'strawberry', name: '冻干草莓',         cost: 290, tags: ['少女心', '甜'],             quirk: 1, icon: 'assets/img/topping-strawberry.png' },
    { id: 'chili',      name: '辣椒粉',           cost: 120, tags: ['辣', '重口'],               quirk: 2, icon: 'assets/img/topping-chili.png' },
    { id: 'rainbow',    name: '彩虹糖',           cost: 220, tags: ['少女心', '甜', '高糖'],     quirk: 2, icon: 'assets/img/topping-rainbow.png' },
    { id: 'gummy',      name: '小熊软糖',         cost: 200, tags: ['软萌', '甜', '高糖'],       quirk: 1, icon: 'assets/img/topping-gummy.png' },
    { id: 'nuts',       name: '坚果碎',           cost: 310, tags: ['健康'],                     quirk: 0, icon: 'assets/img/topping-nuts.png' },
    { id: 'plum',       name: '酸梅粉',           cost: 130, tags: ['酸'],                       quirk: 2, icon: 'assets/img/topping-plum.png' },
    { id: 'rousong',    name: '肉松',             cost: 230, tags: ['咸鲜'],                     quirk: 1, icon: 'assets/img/topping-rousong.png' },
    { id: 'huamei',     name: '话梅',             cost: 160, tags: ['酸'],                       quirk: 2, icon: 'assets/img/topping-huamei.png' },
    { id: 'coconut',    name: '椰子片',           cost: 170, tags: ['清爽', '甜'],               quirk: 1, icon: 'assets/img/topping-coconut.png' },
    { id: 'cola',       name: '可乐软糖',         cost: 200, tags: ['快乐', '甜', '高糖'],       quirk: 2, icon: 'assets/img/topping-cola.png' },
    { id: 'sesame',     name: '芝麻',             cost: 110, tags: ['朴素'],                     quirk: 0, icon: 'assets/img/topping-sesame.png' },
    { id: 'latiaosi',   name: '辣条丝',           cost: 170, tags: ['辣', '重口'],               quirk: 3, icon: 'assets/img/topping-latiaosi.png' },
    { id: 'wangzai',    name: '旺仔牛奶糖',       cost: 190, tags: ['童年', '大牌', '甜', '奶香'], quirk: 1, icon: 'assets/img/topping-wangzai.png' }
  ];

  // 酱料（多选 ≤2，8 款）
  var sauces = [
    { id: 'condensed',    name: '炼乳',       cost: 170, tags: ['甜', '高糖', '奶香'],         quirk: 1, icon: 'assets/img/sauce-condensed.png' },
    { id: 'laoganma',     name: '老干妈',     cost: 190, tags: ['辣', '重口', '大牌'],         quirk: 3, icon: 'assets/img/sauce-laoganma.png' },
    { id: 'wasabi',       name: '芥末',       cost: 160, tags: ['芥末', '重口'],               quirk: 3, icon: 'assets/img/sauce-wasabi.png' },
    { id: 'strawberryjam', name: '草莓酱',    cost: 180, tags: ['甜', '少女心'],               quirk: 1, icon: 'assets/img/sauce-strawberryjam.png' },
    { id: 'peanut',       name: '花生酱',     cost: 180, tags: ['浓郁'],                       quirk: 1, icon: 'assets/img/sauce-peanut.png' },
    { id: 'adcalcium',    name: 'AD钙奶淋酱', cost: 220, tags: ['童年', '大牌', '甜', '奶香'], quirk: 2, icon: 'assets/img/sauce-adcalcium.png' },
    { id: 'chocolate',    name: '巧克力酱',   cost: 210, tags: ['甜', '高糖', '巧克力'],       quirk: 1, icon: 'assets/img/sauce-chocolate.png' },
    { id: 'honeymustard', name: '蜂蜜芥末酱', cost: 230, tags: ['芥末', '甜'],                 quirk: 2, icon: 'assets/img/sauce-honeymustard.png' }
  ];

  // 包装（单选，6 款）
  var packs = [
    { id: 'kraft',   name: '牛皮纸袋',   cost: 160, tags: ['环保'],   quirk: 0, icon: 'assets/img/pack-kraft.png' },
    { id: 'tin',     name: '铁盒',       cost: 420, tags: ['高级感'], quirk: 1, icon: 'assets/img/pack-tin.png' },
    { id: 'clear',   name: '透明袋',     cost: 100, tags: ['裸奔'],   quirk: 1, icon: 'assets/img/pack-clear.png' },
    { id: 'bandage', name: '绷带缠绕款', cost: 300, tags: ['神秘'],   quirk: 3, icon: 'assets/img/pack-bandage.png' },
    { id: 'enamel',  name: '搪瓷杯',     cost: 480, tags: ['老干部'], quirk: 2, icon: 'assets/img/pack-enamel.png' },
    { id: 'glass',   name: '复古玻璃罐', cost: 380, tags: ['收藏向'], quirk: 1, icon: 'assets/img/pack-glass.png' }
  ];

  // 隐藏款（6 款，均为配料，Demo 界面不展示）
  var hidden = [
    { id: 'luosifen', name: '螺蛳粉',   cost: 390, tags: ['生化', '重口'],   quirk: 5, icon: 'assets/img/hidden-luosifen.png' },
    { id: 'durian',   name: '榴莲冻干', cost: 520, tags: ['气味核弹', '甜'], quirk: 5, icon: 'assets/img/hidden-durian.png' },
    { id: 'stinky',   name: '臭豆腐碎', cost: 340, tags: ['生化', '重口'],   quirk: 5, icon: 'assets/img/hidden-stinky.png' },
    { id: 'zheergen', name: '折耳根',   cost: 150, tags: ['折耳根', '重口'], quirk: 5, icon: 'assets/img/hidden-zheergen.png' },
    { id: 'cilantro', name: '香菜碎',   cost: 130, tags: ['重口'],           quirk: 3, icon: 'assets/img/hidden-cilantro.png' },
    { id: 'bitter',   name: '苦瓜粉',   cost: 120, tags: ['自讨苦吃'],       quirk: 3, icon: 'assets/img/hidden-bitter.png' }
  ];

  // ---------- 溢价规则（4.4，共 14 条） ----------
  // disabled 的两条依赖后续模块（M3 涂鸦画布 / M2 命运摇杆），引擎跳过
  var premiumRules = [
    { id: 'emotion',      name: '情绪价值费',             amount: 180,  note: '本品含有可测量的快乐成分' },
    { id: 'guilt',        name: '罪恶感附加税',           amount: 150,  note: '吃得越爽，税得越狠' },        // +150/项
    { id: 'darkcuisine',  name: '黑暗料理风险金',         amount: 520,  note: '风味由法院裁决' },
    { id: 'artist',       name: '艺术家联名费',           amount: 140,  note: '每一笔都是限量款', disabled: true },
    { id: 'craft',        name: '工艺复杂度费',           amount: 120,  note: '不是乱加，是层次感' },        // 从第 2 款配料起 +120/款
    { id: 'childhood',    name: '童年回忆杀',             amount: 160,  note: '为小时候的自己补票' },
    { id: 'crossbrand',   name: '跨界法务预备金',         amount: 220,  note: '法务正在路上' },
    { id: 'lowcal',       name: '低卡心理安慰税',         amount: 180,  note: '低卡是态度，不是结果' },
    { id: 'heavy',        name: '重口清醒费',             amount: 110,  note: '吃完重新定义清醒' },
    { id: 'packaging',    name: '买椟还珠包装税',         amount: 120,  note: '零食只是包装的赠品' },
    { id: 'hiddenfind',   name: '隐藏款发掘费',           amount: 200,  note: '博物馆已介入研究', disabled: true },
    { id: 'outofcontrol', name: '研发部失控费',           amount: 120,  note: '没人能阻止你了' },
    { id: 'ecotax',       name: '环保税',                 amount: 100,  note: '环保，但不体面' },
    { id: 'michelin',     name: '隐藏成就：米其林预言家', amount: 1340, note: '你发明的东西应该上报联合国' }
  ];

  // ---------- 鉴定评语库（4.5） ----------
  var verdicts = {
    price: [
      { min: 0,    max: 1499,     text: '便宜得让人不安，建议直接量产' },
      { min: 1500, max: 2999,     text: '定价合理，隔壁小卖部已连夜研究你' },
      { min: 3000, max: 4999,     text: '有点飘了，但消费者可能为情怀买单' },
      { min: 5000, max: 7999,     text: '这不是零食，这是轻奢单品' },
      { min: 8000, max: Infinity, text: '建议申遗，或报警' }
    ],
    quirk: [
      { min: 0, max: 2,        text: '稳中带皮，老少咸宜' },
      { min: 3, max: 5,        text: '口味大胆，胆小勿试' },
      { min: 6, max: Infinity, text: '发明它的人应该被写进教科书（反面案例）' }
    ]
  };

  window.SNACK_DATA = {
    bases: bases,
    toppings: toppings,
    sauces: sauces,
    packs: packs,
    hidden: hidden,
    premiumRules: premiumRules,
    verdicts: verdicts,
    serviceFee: 200,
    currency: 'KZ'
  };
})();
