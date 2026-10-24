/* 零食发明机 SNACK-O-MATIC 3000 —— 页面与交互（Agent B）
 * 依赖：window.SNACK_DATA / window.SnackEngine.price()
 * CSS 约定：.card / .selected / .tray-item / #btn-predict / #receipt / .shake
 */
(function () {
  'use strict';

  /* ---------- 配置 ---------- */
  var CATEGORIES = {
    bases:    { label: '基底', max: 1, single: true,  emoji: '🍟' },
    toppings: { label: '配料', max: 4, single: false, emoji: '🧀' },
    sauces:   { label: '酱料', max: 2, single: false, emoji: '🍯' },
    packs:    { label: '包装', max: 1, single: true,  emoji: '🛍️' }
  };
  var TAB_ORDER = ['bases', 'toppings', 'sauces', 'packs'];

  var PREDICT_TEXTS = ['校准零食雷达…', '咨询大盘指数…', '拍脑袋中…'];
  var PREDICT_DURATION = 2100; // 机器运转演出总时长（毫秒）

  /* ---------- 状态 ---------- */
  var state = { bases: null, toppings: [], sauces: [], packs: null };
  var currentTab = 'bases';
  var predicting = false;

  /* ---------- DOM ---------- */
  var cardWall = document.getElementById('card-wall');
  var trayList = document.getElementById('tray-list');
  var previewBox = document.getElementById('preview');
  var btnPredict = document.getElementById('btn-predict');
  var receiptBox = document.getElementById('receipt');
  var viewAssemble = document.getElementById('view-assemble');
  var viewResult = document.getElementById('view-result');
  var ceremony = document.getElementById('ceremony');
  var ceremonyText = document.getElementById('ceremony-text');
  var ceremonyProgress = document.getElementById('ceremony-progress');
  var resultStage = document.getElementById('result-stage');
  var showcaseBox = document.getElementById('snack-showcase');
  var btnAgain = document.getElementById('btn-again');
  var tabButtons = Array.prototype.slice.call(document.querySelectorAll('.tab'));

  /* ---------- 图片兜底：img onerror 全局钩子（插画未生成时显示占位 emoji） ---------- */
  window.__snackImgError = function (img) {
    var span = document.createElement('span');
    span.className = 'card-emoji';
    span.setAttribute('role', 'img');
    span.textContent = img.getAttribute('data-emoji') || '🍬';
    if (img.parentNode) img.parentNode.replaceChild(span, img);
  };

  /* ---------- 工具 ---------- */
  function fmt(n) {
    return Number(n).toLocaleString('en-US') + ' KZ';
  }
  function fmtSigned(n) {
    var v = Number(n);
    return (v >= 0 ? '+' : '-') + Math.abs(v).toLocaleString('en-US') + ' KZ';
  }
  function iconHTML(item, cat) {
    var emoji = (CATEGORIES[cat] && CATEGORIES[cat].emoji) || '🍬';
    return '<img class="card-img" src="' + item.icon + '" alt="' + item.name + '"' +
           ' data-emoji="' + emoji + '" onerror="__snackImgError(this)">';
  }

  /* ---------- 选项卡卡片墙 ---------- */
  function isSelected(cat, id) {
    if (CATEGORIES[cat].single) return !!state[cat] && state[cat].id === id;
    return state[cat].some(function (it) { return it.id === id; });
  }

  function renderCards() {
    var data = window.SNACK_DATA || {};
    var items = data[currentTab] || [];
    if (!items.length) {
      cardWall.innerHTML = '<p class="wall-empty">这一类还没进货……</p>';
      return;
    }
    cardWall.innerHTML = items.map(function (item) {
      var sel = isSelected(currentTab, item.id) ? ' selected' : '';
      return '<div class="card' + sel + '" data-id="' + item.id + '" role="button" tabindex="0">' +
               '<div class="card-icon">' + iconHTML(item, currentTab) + '</div>' +
               '<div class="card-name">' + item.name + '</div>' +
               '<div class="card-cost">' + fmt(item.cost) + '</div>' +
             '</div>';
    }).join('');
  }

  function shake(el) {
    if (!el) return;
    el.classList.remove('shake');
    void el.offsetWidth; // 强制重排，允许连续触发抖动
    el.classList.add('shake');
    setTimeout(function () { el.classList.remove('shake'); }, 600);
  }

  function toggleSelect(cat, id, cardEl) {
    var cfg = CATEGORIES[cat];
    var items = (window.SNACK_DATA || {})[cat] || [];
    var item = null;
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === id) { item = items[i]; break; }
    }
    if (!item) return;

    if (cfg.single) {
      state[cat] = (state[cat] && state[cat].id === id) ? null : item;
    } else {
      var idx = -1;
      for (var j = 0; j < state[cat].length; j++) {
        if (state[cat][j].id === id) { idx = j; break; }
      }
      if (idx >= 0) {
        state[cat].splice(idx, 1);
      } else if (state[cat].length >= cfg.max) {
        shake(cardEl); // 超限：卡片抖动提示，不改变选择
        return;
      } else {
        state[cat].push(item);
      }
    }
    renderAll();
  }

  /* ---------- 选项卡导航 ---------- */
  function renderTabs() {
    tabButtons.forEach(function (btn) {
      var cat = btn.getAttribute('data-tab');
      var cfg = CATEGORIES[cat];
      var text = cfg.label;
      if (cfg.single) {
        if (state[cat]) text += ' ✓';
      } else {
        text += ' ' + state[cat].length + '/' + cfg.max;
      }
      btn.textContent = text;
      btn.classList.toggle('active', cat === currentTab);
    });
  }

  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      currentTab = btn.getAttribute('data-tab');
      renderTabs();
      renderCards();
    });
  });

  cardWall.addEventListener('click', function (e) {
    var card = e.target.closest ? e.target.closest('.card') : null;
    if (!card) return;
    toggleSelect(currentTab, card.getAttribute('data-id'), card);
  });
  cardWall.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var card = e.target.closest ? e.target.closest('.card') : null;
    if (!card) return;
    e.preventDefault();
    toggleSelect(currentTab, card.getAttribute('data-id'), card);
  });

  /* ---------- 已选托盘 ---------- */
  function renderTray() {
    var entries = [];
    TAB_ORDER.forEach(function (cat) {
      var sel = CATEGORIES[cat].single ? (state[cat] ? [state[cat]] : []) : state[cat];
      sel.forEach(function (item) { entries.push({ cat: cat, item: item }); });
    });

    if (!entries.length) {
      trayList.innerHTML = '<li class="tray-empty">托盘空空如也，先去上面抓点料吧～</li>';
      return;
    }
    trayList.innerHTML = entries.map(function (en) {
      return '<li class="tray-item" data-cat="' + en.cat + '" data-id="' + en.item.id + '" title="点击移除">' +
               '<span class="tray-cat">' + CATEGORIES[en.cat].label + '</span>' +
               '<span class="tray-name">' + en.item.name + '</span>' +
               '<span class="tray-remove">✕</span>' +
             '</li>';
    }).join('');
  }

  trayList.addEventListener('click', function (e) {
    var li = e.target.closest ? e.target.closest('.tray-item') : null;
    if (!li) return;
    var cat = li.getAttribute('data-cat');
    var id = li.getAttribute('data-id');
    if (CATEGORIES[cat].single) {
      if (state[cat] && state[cat].id === id) state[cat] = null;
    } else {
      state[cat] = state[cat].filter(function (it) { return it.id !== id; });
    }
    renderAll();
  });

  /* ---------- 预览区 ---------- */
  function renderPreview() {
    var hasAny = state.bases || state.packs || state.toppings.length || state.sauces.length;
    if (!hasAny) {
      previewBox.innerHTML = '<div class="preview-empty">🍭<br>还没开始拼装<br><small>先去左边选个基底吧</small></div>';
      return;
    }
    var html = '<div class="preview-stage">';
    if (state.bases) {
      html += '<div class="preview-base">' + iconHTML(state.bases, 'bases') +
              '<span class="preview-label">' + state.bases.name + '</span></div>';
    } else {
      html += '<div class="preview-base preview-missing">基底？</div>';
    }
    var extras = state.toppings.map(function (it) { return { item: it, cat: 'toppings' }; })
        .concat(state.sauces.map(function (it) { return { item: it, cat: 'sauces' }; }));
    if (extras.length) {
      html += '<div class="preview-extras">' + extras.map(function (en) {
        return '<span class="preview-extra" title="' + en.item.name + '">' + iconHTML(en.item, en.cat) + '</span>';
      }).join('') + '</div>';
    }
    if (state.packs) {
      html += '<div class="preview-pack">装进 ' + iconHTML(state.packs, 'packs') +
              '<span class="preview-label">' + state.packs.name + '</span></div>';
    }
    html += '</div>';
    previewBox.innerHTML = html;
  }

  /* ---------- 预测按钮 ---------- */
  function updateButton() {
    btnPredict.disabled = predicting || !state.bases || !state.packs;
  }

  btnPredict.addEventListener('click', function () {
    if (predicting || btnPredict.disabled) return;
    startPredictShow();
  });

  function startPredictShow() {
    predicting = true;
    updateButton();
    receiptBox.hidden = true;

    // 换页面：拼装页 → 预测仪式页
    viewAssemble.hidden = true;
    viewResult.hidden = false;
    ceremony.hidden = false;
    resultStage.hidden = true;

    var step = 0;
    ceremonyText.textContent = PREDICT_TEXTS[0];
    // 重触发进度条动画
    ceremonyProgress.style.animation = 'none';
    void ceremonyProgress.offsetWidth;
    ceremonyProgress.style.animation = '';

    var stepMs = PREDICT_DURATION / PREDICT_TEXTS.length;
    var timer = setInterval(function () {
      step++;
      if (step < PREDICT_TEXTS.length) {
        ceremonyText.textContent = PREDICT_TEXTS[step];
      }
    }, stepMs);

    setTimeout(function () {
      clearInterval(timer);
      var result = null;
      try {
        result = window.SnackEngine.price({
          base: state.bases,
          toppings: state.toppings.slice(),
          sauces: state.sauces.slice(),
          pack: state.packs
        });
      } catch (err) {
        console.error('预测引擎罢工了：', err);
      }
      predicting = false;
      updateButton();
      ceremony.hidden = true;
      if (result) {
        renderShowcase(result);
        renderReceipt(result);
        resultStage.hidden = false;
        fitReceipt();
      } else {
        // 引擎失败：退回拼装页
        viewResult.hidden = true;
        viewAssemble.hidden = false;
      }
    }, PREDICT_DURATION);
  }

  // 小票过高时整体缩放，保证一屏放下、不滚动
  function fitReceipt() {
    receiptBox.style.transform = '';
    var wrap = receiptBox.parentNode;
    if (!wrap) return;
    var avail = wrap.clientHeight - 8;
    var need = receiptBox.offsetHeight;
    if (need > 0 && need > avail) {
      receiptBox.style.transform = 'scale(' + (avail / need) + ')';
    }
  }

  btnAgain.addEventListener('click', function () {
    viewResult.hidden = true;
    viewAssemble.hidden = false;
  });

  window.addEventListener('resize', function () {
    if (!viewResult.hidden && !resultStage.hidden) fitReceipt();
  });

  /* ---------- 成品大展示（左侧：拼出来的零食 + 夸张评语） ---------- */
  var TOPPING_POS = [
    { left: '4%',  top: '8%',  rot: -14 },
    { left: '66%', top: '2%',  rot: 12 },
    { left: '0%',  top: '56%', rot: 10 },
    { left: '70%', top: '58%', rot: -8 }
  ];
  var SAUCE_POS = [
    { left: '22%', top: '-6%', rot: -6 },
    { left: '54%', top: '-8%', rot: 9 }
  ];

  function renderShowcase(r) {
    var verdicts = r.verdicts || {};
    var parts = '';

    // 包装：底部大容器
    if (state.packs) {
      parts += '<div class="show-pack">' + iconHTML(state.packs, 'packs') +
               '<span class="show-tag">' + state.packs.name + '</span></div>';
    }
    // 基底：中央主角
    if (state.bases) {
      parts += '<div class="show-base">' + iconHTML(state.bases, 'bases') +
               '<span class="show-tag">' + state.bases.name + '</span></div>';
    }
    // 配料：环绕贴纸
    state.toppings.forEach(function (it, i) {
      var pos = TOPPING_POS[i % TOPPING_POS.length];
      parts += '<div class="show-top" style="left:' + pos.left + ';top:' + pos.top +
               ';transform:rotate(' + pos.rot + 'deg)">' + iconHTML(it, 'toppings') +
               '<span class="show-tag">' + it.name + '</span></div>';
    });
    // 酱料：顶部淋酱
    state.sauces.forEach(function (it, i) {
      var pos = SAUCE_POS[i % SAUCE_POS.length];
      parts += '<div class="show-sauce" style="left:' + pos.left + ';top:' + pos.top +
               ';transform:rotate(' + pos.rot + 'deg)">' + iconHTML(it, 'sauces') +
               '<span class="show-tag">' + it.name + '</span></div>';
    });

    showcaseBox.innerHTML =
      '<h2 class="show-title">🏆 你的最新发明</h2>' +
      '<div class="show-stage">' + parts +
        '<span class="show-spark s1">✦</span>' +
        '<span class="show-spark s2">✧</span>' +
        '<span class="show-spark s3">✦</span>' +
      '</div>' +
      '<p class="show-total">' + fmt(r.total) + '</p>' +
      '<div class="show-callouts">' +
        '<p class="callout callout-price">💰 ' + (verdicts.price || '') + '</p>' +
        '<p class="callout callout-quirk">🤪 ' + (verdicts.quirk || '') + '</p>' +
      '</div>';
  }

  /* ---------- 小票渲染 ---------- */
  function renderReceipt(r) {
    var items = r.items || [];
    var premiums = r.premiums || [];
    var verdicts = r.verdicts || {};

    var itemsHTML = items.map(function (it) {
      return '<li class="receipt-line"><span class="rl-name">' + it.name + '</span>' +
             '<span class="rl-cost">' + fmt(it.cost) + '</span></li>';
    }).join('');
    var subtotal = items.reduce(function (s, it) { return s + Number(it.cost); }, 0);

    var premiumsHTML = premiums.map(function (p) {
      return '<li class="receipt-line receipt-premium">' +
               '<span class="rl-name">' + p.name + '</span>' +
               '<span class="rl-cost">' + fmtSigned(p.amount) + '</span>' +
               (p.note ? '<p class="rl-note">└ ' + p.note + '</p>' : '') +
             '</li>';
    }).join('');

    // 伪条形码：竖线粗细由总价数字推导，同组合样式稳定
    var seedStr = String(Math.abs(Number(r.total) || 0));
    var barcodeHTML = '';
    for (var i = 0; i < 28; i++) {
      var w = (seedStr.charCodeAt(i % seedStr.length) % 3) + 1;
      barcodeHTML += '<i style="width:' + w + 'px"></i>';
    }

    receiptBox.innerHTML =
      '<div class="receipt-paper">' +
        '<h3 class="receipt-title">SNACK-O-MATIC 3000</h3>' +
        '<p class="receipt-sub">✦ 价格预测报告单 ✦</p>' +
        '<p class="receipt-divider">********************************</p>' +
        '<ul class="receipt-lines">' + itemsHTML + '</ul>' +
        '<p class="receipt-line receipt-subtotal"><span class="rl-name">物料小计</span>' +
          '<span class="rl-cost">' + fmt(subtotal) + '</span></p>' +
        '<p class="receipt-divider">--------------------------------</p>' +
        (premiumsHTML ? '<ul class="receipt-lines">' + premiumsHTML + '</ul>' : '') +
        '<p class="receipt-line"><span class="rl-name">预测服务费</span>' +
          '<span class="rl-cost">' + fmt(r.serviceFee) + '</span></p>' +
        '<p class="receipt-line"><span class="rl-name">玄学浮动</span>' +
          '<span class="rl-cost">' + fmtSigned(r.fluctuation) + '</span></p>' +
        '<p class="rl-note">└ 大盘零食指数今日波动</p>' +
        '<p class="receipt-divider">--------------------------------</p>' +
        '<p class="receipt-total">总价 ' + fmt(r.total) + '</p>' +
        '<div class="receipt-verdicts">' +
          '<p class="receipt-verdict">💰 ' + (verdicts.price || '') + '</p>' +
          '<p class="receipt-verdict">🤪 ' + (verdicts.quirk || '') + '</p>' +
        '</div>' +
        '<div class="receipt-barcode">' + barcodeHTML + '</div>' +
        '<p class="receipt-disclaimer">*本预测由 SNACK-O-MATIC 3000 拍脑袋认证，如有雷同，纯属它抄你</p>' +
      '</div>';

    receiptBox.hidden = false;
  }

  /* ---------- 总渲染 & 启动 ---------- */
  function renderAll() {
    renderTabs();
    renderCards();
    renderTray();
    renderPreview();
    updateButton();
  }

  if (!window.SNACK_DATA) {
    cardWall.innerHTML = '<p class="wall-empty">物料数据还没到货（SNACK_DATA 缺失）……</p>';
  } else {
    renderAll();
  }
})();
