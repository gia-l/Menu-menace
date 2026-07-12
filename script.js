(function () {
  'use strict';

  var SAVE_KEY = 'menu-menace-v9-dish-flavor-editor';
  var PREVIOUS_SAVE_KEYS = ['menu-menace-v8-dish-flavors', 'menu-menace-v7-dialogue-readme'];
  var VERSION = 8;
  var modalSaveHandler = null;
  var state = null;
  var saveAvailable = true;

  var orderTemplates = [
    'Hello, {M}! Can I get {DI} please? Thanks!',
    'Hello! I\'d like {DI}{WITHOUT_PART} please.',
    'Heya friend! Could I please have {DC}{WITH_PART}?',
    'I\'ll have {DISH}{WITH_PART}.',
    'May I please have {DI}, and I would appreciate it if you added {IC}. Thank you kindly.',
    'I NEED {I}, stat! Also, I would love it if you added {I2}.',
    'I just want {DC}. That\'s all.',
    'I\'ll just have {DI} and I\'ll get outta your hair.',
    'My order might seem a bit complicated, but I would love {DISH} with {IC} and no {IC2}.',
    'I would give you my {BODY_PART} if I could have {DI}.',
    'Please, just don\'t put {IC} on my {DISH}.',
    'Hi there, dear! May I please have {DC}{WITHOUT_PART}?',
    'Hi, umm, like can I get {DI} and some {IC} on that?'
  ];

  var positiveTemplates = [
    'The {F} of the {DISH} is perfect, {M}.',
    'I really like how the {F} and {F2} complement each other.',
    'The {DISH} is really {DE}. I like it!',
    'The {DISH} is really {F}-forward. Great job, {M}.',
    'Ooh, so {DE}! Nice!',
    'I think your {DISH} is kinda {DE}. It is a little unusual, but it works so well.',
    'I like how it is not too {LOW_DE}. Good job.',
    'The {F} really stood out in this dish and it balances well with the {I}.',
    'The {F} of the {DISH} is absolutely phenomenal, {M}.',
    'I loved how {DE} this tasted. You really made it work, {M}.',
    'The {I} made this feel extra special.',
    'This {DISH} tastes like it belongs on a real signature menu.',
    'I came in hungry and left impressed. The {F} was so good.',
    '{M}, this {DISH} has personality in the best way.',
    'I loved how fresh the {I} tasted in this {DISH}.',
    'This is exactly why I like places where the chef makes their own rules.',
    'The balance here is so nice. The {F} did not overpower the {F2}.',
    'That {DISH} was cozy, creative, and honestly really fun.',
    'I would absolutely order this again.',
    'This {DISH} feels like something only {RESTAURANT} would make.'
  ];

  var critiqueTemplates = [
    'I think this {DISH} could use a bit more {I}.',
    'It\'s great, but I think you forgot to add the {I}. That is all right, though. You\'ll remember for next time.',
    'I love the {F} of the dish, but it is missing a few ingredients.',
    'This is still good, but I noticed some extra {I}. Maybe keep it closer to the order next time.',
    'The {DISH} has promise, but the recipe wandered off a little bit.'
  ];

  var bodyParts = ['left kidney', 'right kidney', 'left kneecap', 'right kneecap'];

  var themes = [
    { id: 'classic', name: 'Classic Café', cost: 0 },
    { id: 'berry', name: 'Berry Bakery', cost: 3 },
    { id: 'mint', name: 'Mint Bistro', cost: 5 },
    { id: 'lavender', name: 'Lavender Lounge', cost: 6 },
    { id: 'night', name: 'Night Market', cost: 8 },
    { id: 'sunset', name: 'Sunset Diner', cost: 10 },
    { id: 'ocean', name: 'Ocean Patio', cost: 12 },
    { id: 'cocoa', name: 'Cozy Cocoa', cost: 14 }
  ];

  var upgrades = [
    { id: 'nice-napkins', name: 'Nice Napkins', costType: 'coins', cost: 50, kind: 'heart', amount: 3, description: '+3% heart chance' },
    { id: 'fresh-sign', name: 'Fresh Chalkboard Sign', costType: 'coins', cost: 90, kind: 'star', amount: 2, description: '+2% bonus star chance' },
    { id: 'window-planters', name: 'Window Planters', costType: 'coins', cost: 140, kind: 'heart', amount: 5, description: '+5% heart chance' },
    { id: 'cozy-tables', name: 'Cozy Tables', costType: 'coins', cost: 220, kind: 'heart', amount: 7, description: '+7% heart chance' },
    { id: 'local-flyers', name: 'Local Flyers', costType: 'coins', cost: 320, kind: 'star', amount: 5, description: '+5% bonus star chance' },
    { id: 'fancy-plates', name: 'Fancy Plates', costType: 'coins', cost: 480, kind: 'heart', amount: 10, description: '+10% heart chance' },
    { id: 'food-blog-post', name: 'Food Blog Post', costType: 'coins', cost: 700, kind: 'star', amount: 8, description: '+8% bonus star chance' },
    { id: 'billboard', name: 'Billboard Outside', costType: 'coins', cost: 1000, kind: 'heart', amount: 14, description: '+14% heart chance' },
    { id: 'radio-mention', name: 'Radio Mention', costType: 'coins', cost: 1500, kind: 'star', amount: 12, description: '+12% bonus star chance' },
    { id: 'celebrity-endorsement', name: 'Celebrity Endorsement', costType: 'coins', cost: 3000, kind: 'heart', amount: 22, description: '+22% heart chance' },
    { id: 'sparkly-counter', name: 'Sparkly Counter', costType: 'gems', cost: 8, kind: 'heart', amount: 6, description: '+6% heart chance' },
    { id: 'gold-menu', name: 'Gold Menu Frame', costType: 'gems', cost: 15, kind: 'star', amount: 10, description: '+10% bonus star chance' }
  ];

  function starterState(blank) {
    var base = {
      version: VERSION,
      restaurantName: 'Menu Menace',
      chefName: 'Chef',
      coins: 80,
      gems: 0,
      xp: 0,
      level: 1,
      menuSlots: 5,
      currentTheme: 'classic',
      ownedThemes: ['classic'],
      currentTrendId: null,
      trendStartedAt: Date.now(),
      currentOrder: null,
      dialogueText: '',
      dialogueHidden: true,
      lastReward: null,
      manualRerolls: 0,
      customersServed: 0,
      stars: 0,
      totalHearts: 0,
      lastHeartStarAward: 0,
      ownedUpgrades: [],
      dishStats: {},
      currentTrend: null,
      pot: [],
      flavors: [],
      ingredients: [],
      dishes: []
    };

    if (blank) return base;

    base.flavors = [
      { id: 'savory', descriptor: 'savory', form: 'umami' },
      { id: 'sweet', descriptor: 'sweet', form: 'sweetness' },
      { id: 'fresh', descriptor: 'fresh', form: 'freshness' }
    ];
    base.ingredients = [
      { id: 'pasta', name: 'pasta', collective: 'pasta', category: 'Staples', icon: '🍝', flavors: { savory: 80 } },
      { id: 'tomato-sauce', name: 'tomato sauce', collective: 'tomato sauce', category: 'Sauces', icon: '🍅', flavors: { savory: 60, sweet: 30 } },
      { id: 'herbs', name: 'herbs', collective: 'herbs', category: 'Seasonings', icon: '🌿', flavors: { fresh: 100 } }
    ];
    base.dishes = [
      { id: 'spaghetti', name: 'spaghetti', category: 'Classics', kind: 'collective', price: 20, icon: '🍝', base: ['pasta', 'tomato-sauce', 'herbs'], optional: [], flavors: { savory: 48, sweet: 10, fresh: 42 } }
    ];
    base.currentTrendId = 'savory';
    return base;
  }

  function $(id) {
    return document.getElementById(id);
  }

  function on(id, eventName, handler) {
    var el = $(id);
    if (el) el.addEventListener(eventName, handler, false);
  }

  function safeText(value) {
    if (value === null || value === undefined) return '';
    return String(value);
  }

  function escapeHTML(text) {
    return safeText(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function slugify(text) {
    return safeText(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item';
  }

  function sanitizeFileName(text) {
    var cleaned = safeText(text).replace(/[\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim();
    return cleaned || 'Menu Menace Save';
  }

  function randomItem(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function unique(list) {
    var result = [];
    for (var i = 0; i < list.length; i++) {
      if (result.indexOf(list[i]) === -1) result.push(list[i]);
    }
    return result;
  }

  function uniqueId(base, existing) {
    var id = base || 'item';
    var n = 2;
    while (existing.indexOf(id) !== -1) {
      id = base + '-' + n;
      n++;
    }
    return id;
  }

  function showStatus(message) {
    var el = $('status-message');
    if (!el) return;
    el.textContent = message || '';
    window.clearTimeout(showStatus.timer);
    if (message) {
      showStatus.timer = window.setTimeout(function () {
        el.textContent = '';
      }, 5200);
    }
  }

  function showError(message) {
    var el = $('error-message');
    if (!el) return;
    el.hidden = false;
    el.textContent = message;
  }

  function hideError() {
    var el = $('error-message');
    if (!el) return;
    el.hidden = true;
    el.textContent = '';
  }

  function saveGame() {
    try {
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      saveAvailable = true;
    } catch (err) {
      saveAvailable = false;
    }
  }

  function loadGame() {
    var loaded = null;
    try {
      loaded = window.localStorage.getItem(SAVE_KEY);
      if (!loaded) {
        for (var pk = 0; pk < PREVIOUS_SAVE_KEYS.length; pk++) {
          loaded = window.localStorage.getItem(PREVIOUS_SAVE_KEYS[pk]);
          if (loaded) break;
        }
      }
    } catch (err) {
      saveAvailable = false;
    }

    if (!loaded) {
      state = starterState(false);
      return;
    }

    try {
      state = mergeWithBase(JSON.parse(loaded));
    } catch (err2) {
      state = starterState(false);
      showError('Your save could not be loaded, so Menu Menace started with the spaghetti example. You can still import a save from Settings.');
    }
  }

  function mergeWithBase(saved) {
    var base = starterState(true);
    if (!saved || typeof saved !== 'object') return starterState(false);

    var keys = Object.keys(saved);
    for (var i = 0; i < keys.length; i++) base[keys[i]] = saved[keys[i]];

    if (!Array.isArray(base.flavors)) base.flavors = [];
    if (!Array.isArray(base.ingredients)) base.ingredients = [];
    if (!Array.isArray(base.dishes)) base.dishes = [];
    if (!Array.isArray(base.ownedThemes) || !base.ownedThemes.length) base.ownedThemes = ['classic'];
    if (!Array.isArray(base.pot)) base.pot = [];
    if (!Array.isArray(base.ownedUpgrades)) base.ownedUpgrades = [];
    if (!base.dishStats || typeof base.dishStats !== 'object') base.dishStats = {};
    if (typeof base.customersServed !== 'number') base.customersServed = 0;
    if (typeof base.stars !== 'number') base.stars = 0;
    if (typeof base.totalHearts !== 'number') base.totalHearts = 0;
    if (typeof base.lastHeartStarAward !== 'number') base.lastHeartStarAward = 0;
    if (!base.currentTheme) base.currentTheme = 'classic';
    if (typeof base.dialogueText !== 'string') base.dialogueText = '';
    if (typeof base.dialogueHidden !== 'boolean') base.dialogueHidden = true;
    if (!base.lastReward || typeof base.lastReward !== 'object') base.lastReward = null;
    if (typeof base.manualRerolls !== 'number') base.manualRerolls = 0;
    if (!base.trendStartedAt) base.trendStartedAt = Date.now();

    for (var f = 0; f < base.flavors.length; f++) {
      if (!base.flavors[f].id) base.flavors[f].id = uniqueId(slugify(base.flavors[f].descriptor || 'flavor'), []);
      if (!base.flavors[f].form) base.flavors[f].form = base.flavors[f].descriptor || 'flavor';
      if (!base.flavors[f].descriptor) base.flavors[f].descriptor = base.flavors[f].form || 'flavor';
    }

    for (var g = 0; g < base.ingredients.length; g++) {
      if (!base.ingredients[g].id) base.ingredients[g].id = uniqueId(slugify(base.ingredients[g].name || 'ingredient'), []);
      if (!base.ingredients[g].name) base.ingredients[g].name = 'ingredient';
      if (!base.ingredients[g].collective) base.ingredients[g].collective = base.ingredients[g].name;
      if (!base.ingredients[g].category) base.ingredients[g].category = 'Ingredients';
      if (typeof base.ingredients[g].icon !== 'string') base.ingredients[g].icon = '';
      if (!base.ingredients[g].flavors || typeof base.ingredients[g].flavors !== 'object') base.ingredients[g].flavors = {};
    }

    for (var d = 0; d < base.dishes.length; d++) {
      if (!base.dishes[d].id) base.dishes[d].id = uniqueId(slugify(base.dishes[d].name || 'dish'), []);
      if (!base.dishes[d].name) base.dishes[d].name = 'dish';
      if (!base.dishes[d].category) base.dishes[d].category = 'Menu';
      if (!base.dishes[d].kind) base.dishes[d].kind = 'single';
      if (typeof base.dishes[d].icon !== 'string') base.dishes[d].icon = '';
      if (!Array.isArray(base.dishes[d].base)) base.dishes[d].base = [];
      if (!Array.isArray(base.dishes[d].optional)) base.dishes[d].optional = [];
      if (!base.dishes[d].price) base.dishes[d].price = 20;
    }

    if (base.currentTrendId && !getFlavorFrom(base.flavors, base.currentTrendId)) {
      base.currentTrendId = base.flavors.length ? base.flavors[0].id : null;
    }
    if (!base.currentTrend && base.currentTrendId) base.currentTrend = { type: 'flavor', id: base.currentTrendId };
    ensureDishStats(base);
    return base;
  }

  function getFlavorFrom(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function init() {
    loadGame();
    bindEvents();
    maybeRefreshTrend();
    renderAll();
    window.setInterval(function () {
      maybeRefreshTrend();
      renderStatsAndHeader();
    }, 30000);
  }

  function bindEvents() {
    var buttons = document.querySelectorAll('.tab-button');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function () {
        switchTab(this.getAttribute('data-tab'));
      }, false);
    }

    on('quick-customer', 'click', newCustomer);
    on('reroll-trend', 'click', rerollTrend);
    on('new-customer', 'click', newCustomer);
    on('go-kitchen', 'click', function () { switchTab('kitchen'); });
    on('jump-build-dish', 'click', function () { switchTab('customize'); openDetails('dish-builder'); });
    on('jump-build-ingredient', 'click', function () { switchTab('customize'); openDetails('ingredient-builder'); });
    on('close-bubble', 'click', function () {
      state.dialogueHidden = true;
      saveGame();
      renderDialogue();
    });
    on('use-recipe', 'click', useRecipeBase);
    on('clear-pot', 'click', function () { state.pot = []; saveAndRender('Pot cleared.'); });
    on('serve-food', 'click', serveFood);
    on('save-names', 'click', saveNames);
    on('buy-slot', 'click', buySlot);
    on('add-flavor', 'click', addFlavor);
    on('add-ingredient', 'click', addIngredient);
    on('add-dish', 'click', addDish);
    on('analyze-new-dish', 'click', analyzeNewDishFlavorProfile);
    on('export-save', 'click', exportSave);
    on('copy-save-text', 'click', copySaveText);
    on('import-save-text', 'click', importSaveText);
    on('reset-starter', 'click', resetStarter);
    on('start-blank', 'click', startBlank);
    on('modal-cancel', 'click', closeEditor);
    on('modal-save', 'click', function () { if (modalSaveHandler) modalSaveHandler(); });
    var modalBackdrop = $('edit-modal');
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', function (event) {
        if (event.target === modalBackdrop) closeEditor();
      }, false);
    }

    var importInput = $('import-save');
    if (importInput) importInput.addEventListener('change', importSaveFile, false);

    var priceInput = $('new-dish-price');
    if (priceInput) priceInput.addEventListener('input', updateNewDishPriceHint, false);
    document.addEventListener('change', function (event) {
      if (event.target && (event.target.className || '').indexOf('base-ingredient-check') !== -1) {
        updateNewDishPriceHint();
        markNewDishProfileStale();
      }
      if (event.target && (event.target.className || '').indexOf('new-dish-flavor-input') !== -1) updateNewDishFlavorSummary();
    }, false);

    var pot = $('pot');
    if (pot) {
      pot.addEventListener('dragover', function (event) {
        event.preventDefault();
        pot.classList.add('dragover');
      }, false);
      pot.addEventListener('dragleave', function () {
        pot.classList.remove('dragover');
      }, false);
      pot.addEventListener('drop', function (event) {
        event.preventDefault();
        pot.classList.remove('dragover');
        var id = event.dataTransfer.getData('text/plain');
        addToPot(id);
      }, false);
    }
  }

  function openDetails(id) {
    var details = $(id);
    if (details) details.open = true;
  }

  function switchTab(tabId) {
    var panels = document.querySelectorAll('.tab-panel');
    var i;
    for (i = 0; i < panels.length; i++) panels[i].hidden = panels[i].id !== tabId;
    var buttons = document.querySelectorAll('.tab-button');
    for (i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute('aria-selected', buttons[i].getAttribute('data-tab') === tabId ? 'true' : 'false');
    }
    window.scrollTo(0, 0);
  }

  function saveAndRender(message) {
    hideError();
    sanitizeStateAfterChanges();
    saveGame();
    renderAll();
    if (message) showStatus(message);
    if (!saveAvailable) showError('Autosave may be blocked in this browser preview. Export your save from Settings when you are done.');
  }

  function sanitizeStateAfterChanges() {
    var ingredientIds = state.ingredients.map(function (item) { return item.id; });
    var dishIds = state.dishes.map(function (item) { return item.id; });

    for (var i = 0; i < state.dishes.length; i++) {
      state.dishes[i].base = unique((state.dishes[i].base || []).filter(function (id) { return ingredientIds.indexOf(id) !== -1; }));
      state.dishes[i].optional = unique((state.dishes[i].optional || []).filter(function (id) { return ingredientIds.indexOf(id) !== -1 && state.dishes[i].base.indexOf(id) === -1; }));
    }

    state.pot = (state.pot || []).filter(function (id) { return ingredientIds.indexOf(id) !== -1; });

    var flavorIds = state.flavors.map(function (item) { return item.id; });
    for (var sf = 0; sf < state.dishes.length; sf++) {
      if (!state.dishes[sf].flavors || !Object.keys(state.dishes[sf].flavors).length) {
        state.dishes[sf].flavors = finalFlavorProfile(state.dishes[sf].base || []);
      } else {
        var clean = {};
        var fkeys = Object.keys(state.dishes[sf].flavors || {});
        for (var fk = 0; fk < fkeys.length; fk++) {
          if (flavorIds.indexOf(fkeys[fk]) !== -1 && Number(state.dishes[sf].flavors[fkeys[fk]]) > 0) clean[fkeys[fk]] = Number(state.dishes[sf].flavors[fkeys[fk]]);
        }
        state.dishes[sf].flavors = normalizeFlavorMap(clean);
      }
    }

    if (state.currentOrder && dishIds.indexOf(state.currentOrder.dishId) === -1) {
      state.currentOrder = null;
      state.pot = [];
    }

    if (state.currentOrder) {
      state.currentOrder.required = (state.currentOrder.required || []).filter(function (id) { return ingredientIds.indexOf(id) !== -1; });
      state.currentOrder.excluded = (state.currentOrder.excluded || []).filter(function (id) { return ingredientIds.indexOf(id) !== -1; });
      state.currentOrder.extra = (state.currentOrder.extra || []).filter(function (id) { return ingredientIds.indexOf(id) !== -1; });
    }

    if (state.currentTrendId && !getFlavor(state.currentTrendId)) {
      state.currentTrendId = state.flavors.length ? state.flavors[0].id : null;
    }
    if (state.currentTrend && !isTrendValid(state.currentTrend)) state.currentTrend = null;
    ensureDishStats(state);
  }

  function renderAll() {
    renderStatsAndHeader();
    renderTrend();
    renderOrder();
    renderMenu();
    renderKitchen();
    renderCustomize();
    renderStatsTab();
    renderShop();
    renderSettings();
    applyTheme();
  }

  function renderStatsAndHeader() {
    $('game-title').textContent = state.restaurantName || 'Menu Menace';
    $('chef-line').textContent = 'Chef: ' + (state.chefName || 'Chef');
    $('coins-stat').textContent = Math.floor(state.coins || 0);
    $('gems-stat').textContent = Math.floor(state.gems || 0);
    $('level-stat').textContent = state.level || 1;
    $('xp-stat').textContent = (state.xp || 0) + ' / ' + xpToNextLevel();
    $('slot-stat').textContent = state.dishes.length + ' / ' + state.menuSlots;
    if ($('stars-stat')) $('stars-stat').textContent = state.stars || 0;
    if ($('hearts-stat')) $('hearts-stat').textContent = state.totalHearts || 0;
  }

  function applyTheme() {
    document.body.className = '';
    if (state.currentTheme && state.currentTheme !== 'classic') {
      document.body.classList.add('theme-' + state.currentTheme);
    }
  }

  function maybeRefreshTrend() {
    var fifteenMinutes = 15 * 60 * 1000;
    if (!state.flavors.length && !state.dishes.length) {
      state.currentTrend = null;
      state.currentTrendId = null;
      state.secondaryTrend = null;
      return;
    }
    if (!state.currentTrend && state.currentTrendId) state.currentTrend = { type: 'flavor', id: state.currentTrendId };
    if (!isTrendValid(state.currentTrend) || !state.trendStartedAt || Date.now() - state.trendStartedAt >= fifteenMinutes) {
      state.manualRerolls = 0;
      chooseNewTrend(false, '');
    }
  }

  function isTrendValid(trend) {
    if (!trend) return false;
    if (trend.type === 'flavor') return !!getFlavor(trend.id);
    if (trend.type === 'dish') return !!getDish(trend.id);
    if (trend.type === 'bargain' || trend.type === 'fancy') return state.dishes.length > 0;
    return false;
  }

  function trendRerollCost() {
    var rerolls = Math.max(0, state.manualRerolls || 0);
    return {
      gems: 2 + Math.floor(rerolls / 2),
      coins: 120 + rerolls * 80
    };
  }

  function rerollTrend() {
    if (!state.flavors.length && !state.dishes.length) {
      showStatus('Create a flavor or dish first, then trends can start.');
      switchTab('customize');
      return;
    }

    var cost = trendRerollCost();
    var paid = '';
    if ((state.gems || 0) >= cost.gems) {
      state.gems -= cost.gems;
      paid = 'Paid ' + cost.gems + ' gems.';
    } else if ((state.coins || 0) >= cost.coins) {
      state.coins -= cost.coins;
      paid = 'Paid ' + cost.coins + ' coins.';
    } else {
      showStatus('Reroll costs ' + cost.gems + ' gems or ' + cost.coins + ' coins.');
      return;
    }

    state.manualRerolls = (state.manualRerolls || 0) + 1;
    chooseNewTrend(true, paid + ' New restaurant trend picked!');
  }

  function availableTrends() {
    var list = [];
    for (var i = 0; i < state.flavors.length; i++) list.push({ type: 'flavor', id: state.flavors[i].id });
    for (var d = 0; d < state.dishes.length; d++) list.push({ type: 'dish', id: state.dishes[d].id });
    if (state.dishes.length) {
      list.push({ type: 'bargain', id: 'bargain' });
      list.push({ type: 'fancy', id: 'fancy' });
    }
    return list;
  }

  function sameTrend(a, b) {
    return a && b && a.type === b.type && a.id === b.id;
  }

  function chooseNewTrend(showMessage, message) {
    var list = availableTrends();
    if (!list.length) {
      state.currentTrend = null;
      state.currentTrendId = null;
      state.secondaryTrend = null;
      state.trendStartedAt = Date.now();
      saveAndRender(showMessage ? 'Create something first, then trends can start.' : '');
      return;
    }

    var next = randomItem(list);
    if (list.length > 1) {
      while (sameTrend(next, state.currentTrend)) next = randomItem(list);
    }
    state.currentTrend = next;
    state.secondaryTrend = null;
    if (list.length > 2 && Math.random() < 0.22) {
      var second = randomItem(list);
      var guard = 0;
      while ((sameTrend(second, next) || sameTrend(second, state.currentTrend)) && guard < 20) { second = randomItem(list); guard++; }
      if (!sameTrend(second, next)) state.secondaryTrend = second;
    }
    state.currentTrendId = next.type === 'flavor' ? next.id : null;
    state.trendStartedAt = Date.now();
    saveAndRender(showMessage ? (message || 'New restaurant trend picked!') : '');
  }

  function renderTrend() {
    var trend = state.currentTrend || (state.currentTrendId ? { type: 'flavor', id: state.currentTrendId } : null);
    var rerollButton = $('reroll-trend');
    var cost = trendRerollCost();
    if (rerollButton) {
      rerollButton.textContent = 'Reroll (' + cost.gems + ' gems / ' + cost.coins + ' coins)';
      rerollButton.disabled = availableTrends().length < 2;
    }
    if (!isTrendValid(trend)) {
      $('trend-text').textContent = 'No trend yet';
      $('trend-help').textContent = 'Create a flavor or dish in Build to start trends.';
      return;
    }
    var second = state.secondaryTrend && isTrendValid(state.secondaryTrend) ? state.secondaryTrend : null;
    if (trend.type === 'flavor') {
      var flavor = getFlavor(trend.id);
      $('trend-text').textContent = flavor.descriptor + ' dishes' + trendSuffix(second);
      $('trend-help').textContent = trendFlavorLine(flavor);
    } else if (trend.type === 'dish') {
      var dish = getDish(trend.id);
      $('trend-text').textContent = dishLabel(dish) + ' is trending' + trendSuffix(second);
      $('trend-help').textContent = trendDishLine(dish);
    } else if (trend.type === 'bargain') {
      $('trend-text').textContent = 'Bargain bites' + trendSuffix(second);
      $('trend-help').textContent = 'Customers are watching for good deals today. Cheaper-than-ideal dishes can earn bargain dialogue.';
    } else {
      $('trend-text').textContent = 'Fancy plates' + trendSuffix(second);
      $('trend-help').textContent = 'Customers want something that feels special today. Pricier dishes can get fancy-order dialogue.';
    }
  }


  function trendName(trend) {
    if (!trend) return '';
    if (trend.type === 'flavor') { var f = getFlavor(trend.id); return f ? f.descriptor + ' dishes' : ''; }
    if (trend.type === 'dish') { var d = getDish(trend.id); return d ? dishLabel(d) : ''; }
    if (trend.type === 'bargain') return 'bargain bites';
    if (trend.type === 'fancy') return 'fancy plates';
    return '';
  }

  function trendSuffix(second) {
    var name = trendName(second);
    return name ? ' + ' + name : '';
  }

  function trendFlavorLine(flavor) {
    var lines = [
      flavor.descriptor + ' food is the hot topic right now. Dishes with at least 50% ' + flavor.form + ' can earn bonus tips.',
      'Local food critics seem to be favoring ' + flavor.descriptor + ' plates today. A ' + flavor.form + '-forward dish could do really well.',
      'Customers are craving ' + flavor.descriptor + ' food today. This is a good time to make that flavor stand out.'
    ];
    return randomItem(lines);
  }

  function trendDishLine(dish) {
    var name = dish ? dishPlain(dish) : 'that dish';
    var lines = [
      'Word is spreading about ' + name + '. Customers are a bit more likely to order it, but other dishes still get attention.',
      'The local food board is talking about ' + name + ' today. Perfect orders can earn bonus hearts.',
      name + ' is having a moment. Keep an eye out, but the whole menu is still open.'
    ];
    return randomItem(lines);
  }

  function getFlavor(id) {
    for (var i = 0; i < state.flavors.length; i++) if (state.flavors[i].id === id) return state.flavors[i];
    return null;
  }

  function getIngredient(id) {
    for (var i = 0; i < state.ingredients.length; i++) if (state.ingredients[i].id === id) return state.ingredients[i];
    return null;
  }

  function getDish(id) {
    for (var i = 0; i < state.dishes.length; i++) if (state.dishes[i].id === id) return state.dishes[i];
    return null;
  }

  function ingredientName(id, collective) {
    var ingredient = getIngredient(id);
    if (!ingredient) return 'mystery ingredient';
    return collective ? (ingredient.collective || ingredient.name) : ingredient.name;
  }

  function dishPhrase(dish) {
    if (!dish) return 'a mystery dish';
    if (dish.kind === 'collective') return 'some ' + dish.name;
    return articleFor(dish.name) + ' ' + dish.name;
  }

  function dishPlain(dish) {
    return dish ? dish.name : 'mystery dish';
  }

  function itemIcon(item) {
    return item && typeof item.icon === 'string' ? item.icon.trim() : '';
  }

  function withIcon(icon, text) {
    icon = safeText(icon).trim();
    text = safeText(text);
    return icon ? icon + ' ' + text : text;
  }

  function ingredientLabel(id, collective) {
    var ingredient = getIngredient(id);
    if (!ingredient) return 'mystery ingredient';
    var name = collective ? (ingredient.collective || ingredient.name) : ingredient.name;
    return withIcon(itemIcon(ingredient), name);
  }

  function dishLabel(dish) {
    return dish ? withIcon(itemIcon(dish), dish.name) : 'mystery dish';
  }

  function articleFor(word) {
    var first = safeText(word).trim().charAt(0).toLowerCase();
    return 'aeiou'.indexOf(first) >= 0 ? 'an' : 'a';
  }

  function newCustomer() {
    if (!state.dishes.length) {
      showStatus('Add a dish first so customers have something to order.');
      switchTab('customize');
      openDetails('dish-builder');
      return;
    }

    var dish = pickDishForCustomer();
    var base = Array.isArray(dish.base) ? dish.base.slice() : [];
    var optional = Array.isArray(dish.optional) ? dish.optional.slice() : [];
    var recipeIngredients = unique(base.concat(optional));
    var required = [];
    var excluded = [];
    var extra = [];
    var weirdAdd = false;
    var critic = isCriticVisit(dish);

    if (optional.length > 0 && Math.random() < 0.55) required.push(randomItem(optional));

    if (recipeIngredients.length > 0 && Math.random() < 0.28) {
      var avoidPool = recipeIngredients.filter(function (id) { return required.indexOf(id) === -1; });
      if (avoidPool.length) excluded.push(randomItem(avoidPool));
    }

    var extraPool = recipeIngredients.filter(function (id) { return excluded.indexOf(id) === -1; });
    if (!required.length && !excluded.length && extraPool.length > 0 && Math.random() < 0.22) extra.push(randomItem(extraPool));

    var outside = state.ingredients.map(function (x) { return x.id; }).filter(function (id) {
      return recipeIngredients.indexOf(id) === -1;
    });
    if (outside.length > 0 && Math.random() < 0.07) {
      required.push(randomItem(outside));
      weirdAdd = true;
    }

    var order = {
      id: 'order-' + Date.now(),
      dishId: dish.id,
      required: unique(required),
      excluded: unique(excluded),
      extra: extra,
      weirdAdd: weirdAdd,
      critic: critic,
      text: ''
    };
    order.text = buildOrderText(order);
    state.currentOrder = order;
    state.lastReward = null;
    state.pot = [];
    saveAndRender('New customer at the counter!');
    showCustomerBubble(order.text, null);
  }

  function pickDishForCustomer() {
    var weighted = [];
    var trend = state.currentTrend;
    var secondTrend = state.secondaryTrend;
    for (var i = 0; i < state.dishes.length; i++) {
      var dish = state.dishes[i];
      var weight = 8;
      var ideal = idealDishPrice(dish);
      var vibe = priceVibe(dish.price, ideal);
      var stats = dishStat(dish.id);
      if (trend && trend.type === 'dish' && trend.id === dish.id) weight += 4;
      if (trend && trend.type === 'bargain' && vibe === 'cheap') weight += 3;
      if (trend && trend.type === 'fancy' && vibe === 'expensive') weight += 3;
      weight += Math.min(10, Math.floor((stats.hearts || 0) / 3));
      if (secondTrend && secondTrend.type === 'dish' && secondTrend.id === dish.id) weight += 2;
      if (secondTrend && secondTrend.type === 'bargain' && vibe === 'cheap') weight += 2;
      if (secondTrend && secondTrend.type === 'fancy' && vibe === 'expensive') weight += 2;
      if (vibe === 'cheap') weight += 2;
      if (vibe === 'expensive') weight += 1;
      for (var n = 0; n < weight; n++) weighted.push(dish);
    }
    return randomItem(weighted.length ? weighted : state.dishes);
  }

  function isCriticVisit(dish) {
    var stats = dishStat(dish.id);
    var hearts = stats.hearts || 0;
    if (hearts < 20) return false;
    var chance = hearts >= 30 ? 0.12 : 0.06;
    return Math.random() < chance;
  }


  function customerChefName() {
    var name = safeText(state.chefName || '').trim();
    if (!name) return 'chef';
    if (name.toLowerCase() === 'chef') return 'chef';
    return name;
  }

  function buildOrderText(order) {
    var dish = getDish(order.dishId);
    var required = order.required || [];
    var excluded = order.excluded || [];
    var extra = order.extra || [];
    var withText = listIngredientNames(required, true);
    var withoutText = listIngredientNames(excluded, true);
    var extraText = listIngredientNames(extra, true);
    var dishText = dishPhrase(dish);
    var stats = dish ? dishStat(dish.id) : { hearts: 0 };
    var trend = state.currentTrend;
    var ideal = dish ? idealDishPrice(dish) : 0;
    var vibe = dish ? priceVibe(dish.price, ideal) : 'ideal';

    var plainTemplates = [
      'Hello, {M}! Can I get {DISH} please? Thanks!',
      'Hey there, {M}. I just want {DISH}. That is all.',
      'I\'ll just have {DISH} and I\'ll get outta your hair.',
      'I would give you my {BODY_PART} if I could have {DISH}.',
      'Hi there, dear! May I please have {DISH}?',
      '{M}, your menu caught my eye. Can I try {DISH}?',
      'I\'m keeping it simple today. {DISH}, please.',
      'Could I please get {DISH}? I\'ve been thinking about it since I walked in.',
      'Hi {M}, I\'ll have {DISH}. Surprise me with your best version.',
      'One {DISH}, please. No drama, just dinner.',
      'I saw {DISH} on the menu and immediately knew what I wanted.',
      'Can I get {DISH}? It sounds very {RESTAURANT} in the best way.'
    ];
    var withTemplates = [
      'Hello! I\'d like {DISH} with {WITH}, please.',
      'Heya friend! Could I please have {DISH} with {WITH}?',
      'May I please have {DISH}? I would appreciate it if you added {WITH}.',
      'Hi, umm, like can I get {DISH} with {WITH} on that?',
      'Hey there, {M}, can you make {DISH} with {WITH}?',
      'I know exactly what I want: {DISH} with {WITH}.',
      'Could you add {WITH} to {DISH}? I think it would be perfect.',
      '{DISH} sounds amazing. Could you make it with {WITH}?',
      'I\'m in a {WITH} mood today. Can I have {DISH} with that?',
      '{M}, please make me {DISH} with {WITH}.'
    ];
    var withoutTemplates = [
      'Hello! I\'d like {DISH} with no {WITHOUT}, please.',
      'Please, just don\'t put {WITHOUT} on my {DISH}.',
      'Hi there, dear! May I please have {DISH} without {WITHOUT}?',
      'Could I get {DISH}, but skip the {WITHOUT}? Thanks, {M}.',
      'I love {DISH}, but today I need it with no {WITHOUT}.',
      'Can you make {DISH} without {WITHOUT}? That would be amazing.',
      'No {WITHOUT} on the {DISH}, please. Everything else is fine.',
      'Chef {M}, I\'ll have {DISH}, just hold the {WITHOUT}.'
    ];
    var extraTemplates = [
      'Could I get {DISH} with extra {EXTRA}?',
      'I\'d love {DISH}, and please make it extra {EXTRA}.',
      'Can I have {DISH} with extra {EXTRA}? I\'m craving that today.',
      'Hello! {DISH} with extra {EXTRA}, please.',
      'Hey {M}, can you double up the {EXTRA} on my {DISH}?',
      'I want {DISH}, but make the {EXTRA} impossible to miss.',
      'Extra {EXTRA} on {DISH}, please. I am very serious about this.',
      'Could you give my {DISH} one extra helping of {EXTRA}?',
      'Today feels like an extra {EXTRA} kind of day. {DISH}, please.',
      '{M}, I trust you. Give me {DISH} with extra {EXTRA}.'
    ];
    var bothTemplates = [
      'My order might seem a bit complicated, {M}, but I would love {DISH} with {WITH} and no {WITHOUT}.',
      'Could I get {DISH} with {WITH}, but without {WITHOUT}? Thanks!',
      'Okay, chef, tiny request: {DISH} with {WITH}, but please skip {WITHOUT}.',
      'I know this has a few steps, but can I get {DISH} with {WITH} and no {WITHOUT}?',
      'For my {DISH}, add {WITH}, hold the {WITHOUT}. You got this, {M}.',
      'Could you make {DISH} with {WITH}, but leave off {WITHOUT}?'
    ];
    var weirdTemplates = [
      'I know this sounds strange, but can I have {DISH} with {WITH}? I just want to try something weird.',
      'This might be a chaotic order, but could you add {WITH} to {DISH}?',
      '{M}, please do not judge me, but I want {DISH} with {WITH}.',
      'I had a dream about {DISH} with {WITH}, and now I need to know if it works.',
      'This is either genius or terrible: {DISH} with {WITH}, please.',
      'I respect your menu rules, so I am making my own too. {DISH} with {WITH}, please.'
    ];
    var trendTemplates = [
      'I noticed {DISH} is trending today. Can I get that?',
      'Everyone keeps talking about your {PLAIN}. May I try {DISH}?',
      'I heard {M}\'s {PLAIN} is the thing to get today. I\'ll have {DISH}.',
      '{DISH} is trending? Okay, I need to try it.',
      'The trend board told me to order {DISH}, and honestly, I listen to the board.',
      'Hi {M}, I saw {PLAIN} is having a moment. Can I try {DISH}?',
      'Your {PLAIN} is everywhere today. One {DISH}, please.',
      'If {DISH} is trending, I want to be part of the trend.'
    ];
    var bargainTemplates = [
      'I saw {DISH} is a little cheaper than usual. What a bargain! Can I get that?',
      'Yay, I can finally afford {DISH}. Can I have one?',
      'That price on {DISH} looks amazing. I\'ll take it!',
      'I came in for the deal. Can I get {DISH}?',
      'Hi {M}, the {PLAIN} price is calling my name.',
      'A good deal and a good dish? Give me {DISH}.',
      'I love a bargain bite. Can I get {DISH}?',
      'The {PLAIN} is three-coin-sale-energy today. I want it.'
    ];
    var fancyTemplates = [
      'I want something that feels fancy today. Could I have {DISH}?',
      'That {PLAIN} looks premium. I\'ll try {DISH}.',
      'I\'m treating myself today. Can I get {DISH}?',
      'Your {PLAIN} sounds fancy, and I am here for it.',
      '{M}, I want the kind of meal that feels important. {DISH}, please.',
      'The {PLAIN} sounds like a special occasion dish.',
      'I saved up for something nice. Can I get {DISH}?',
      'Make me feel rich for five minutes. {DISH}, please.'
    ];
    var popularTemplates = [
      'I heard your {PLAIN} is getting really popular. Can I have {DISH}?',
      'People keep saying your {PLAIN} is worth trying. I\'ll have {DISH}.',
      'Apparently {M}\'s famous {PLAIN} is delicious. Can I get {DISH}?',
      'I keep seeing hearts on the {PLAIN}. I need to know what the hype is about.',
      'Your {PLAIN} has fans now, {M}. Add me to the list.',
      'Everyone says {RESTAURANT} makes a great {PLAIN}. One {DISH}, please.',
      'I heard this place has a signature {PLAIN}. I want {DISH}.',
      'If the regulars love {PLAIN}, I probably will too.'
    ];
    var criticTemplates = [
      'Hello, I\'m a local food critic. Everyone told me to try {M}\'s famous {PLAIN}. May I have {DISH}?',
      'I\'m reviewing {RESTAURANT} today, and I keep hearing about the {PLAIN}. I\'ll have {DISH}.',
      'I\'m a food critic, and your {PLAIN} has a reputation. Please make me {DISH} with no extra stuff.',
      'Chef {M}, I follow rising restaurant stars, and your {PLAIN} keeps coming up. I\'ll try {DISH}.',
      'I\'m here to see if the rumors about {RESTAURANT} are true. Start me with {DISH}.',
      'People say your menu has its own rules. I want to taste that in {DISH}.',
      'I\'m writing a local food column, and {M}\'s {PLAIN} is on my list today.'
    ];

    var template;
    if (order.critic) template = randomItem(criticTemplates);
    else if (order.weirdAdd && required.length) template = randomItem(weirdTemplates);
    else if (extra.length && !required.length && !excluded.length) template = randomItem(extraTemplates);
    else if (required.length && excluded.length) template = randomItem(bothTemplates);
    else if (required.length) template = randomItem(withTemplates);
    else if (excluded.length) template = randomItem(withoutTemplates);
    else if (trend && trend.type === 'dish' && dish && trend.id === dish.id && Math.random() < 0.7) template = randomItem(trendTemplates);
    else if (trend && trend.type === 'bargain' && vibe === 'cheap' && Math.random() < 0.7) template = randomItem(bargainTemplates);
    else if (trend && trend.type === 'fancy' && vibe === 'expensive' && Math.random() < 0.7) template = randomItem(fancyTemplates);
    else if ((stats.hearts || 0) >= 10 && Math.random() < 0.35) template = randomItem(popularTemplates);
    else template = randomItem(plainTemplates);

    return template
      .replace(/\{M\}/g, customerChefName())
      .replace(/\{RESTAURANT\}/g, state.restaurantName || 'Menu Menace')
      .replace(/\{DISH\}/g, dishText)
      .replace(/\{PLAIN\}/g, dishPlain(dish))
      .replace(/\{WITH\}/g, withText)
      .replace(/\{WITHOUT\}/g, withoutText)
      .replace(/\{EXTRA\}/g, extraText)
      .replace(/\{BODY_PART\}/g, randomItem(bodyParts));
  }

  function listIngredientNames(ids, collective) {
    ids = ids || [];
    if (!ids.length) return 'nothing special';
    var names = ids.map(function (id) { return ingredientName(id, collective); });
    if (names.length === 1) return names[0];
    if (names.length === 2) return names[0] + ' and ' + names[1];
    return names.slice(0, -1).join(', ') + ', and ' + names[names.length - 1];
  }

  function randomOptionalIngredient(dish, notThis) {
    var pool = dish && Array.isArray(dish.optional) && dish.optional.length ? dish.optional.slice() : [];
    if (pool.length === 0 && dish) pool = unique((dish.base || []).concat(dish.optional || []));
    if (pool.length === 0) return null;
    if (notThis && pool.length > 1) pool = pool.filter(function (id) { return id !== notThis; });
    return randomItem(pool);
  }

  function showCustomerBubble(text, reward) {
    state.dialogueText = text || '';
    state.lastReward = reward || null;
    state.dialogueHidden = false;
    saveGame();
    renderDialogue();
  }

  function renderDialogue() {
    var bubble = $('customer-bubble');
    var text = $('customer-text');
    var reward = $('customer-reward');
    if (!state.dialogueText || state.dialogueHidden) {
      bubble.hidden = true;
      text.textContent = '';
      if (reward) {
        reward.hidden = true;
        reward.textContent = '';
      }
      return;
    }
    text.textContent = state.dialogueText;
    if (reward) {
      var rewardText = rewardSummary(state.lastReward);
      reward.hidden = !rewardText;
      reward.textContent = rewardText;
    }
    bubble.hidden = false;
  }

  function rewardSummary(reward) {
    if (!reward) return '';
    var parts = ['+' + reward.coins + ' coins', '+' + reward.xp + ' XP'];
    if (reward.gems > 0) parts.push('+' + reward.gems + ' gems');
    if (reward.levels > 0) parts.push('level up!');
    if (reward.trendBonus > 0) parts.push('trend bonus +' + reward.trendBonus);
    if (reward.hearts > 0) parts.push('+1 heart');
    if (reward.stars > 0) parts.push('+' + reward.stars + ' star');
    if (reward.missing > 0) parts.push(reward.missing + ' missing');
    if (reward.extras > 0) parts.push(reward.extras + ' extra');
    return parts.join(' • ');
  }

  function renderOrder() {
    $('no-order-text').hidden = !!state.currentOrder;
    renderDialogue();
  }

  function renderMenu() {
    var container = $('menu-list');
    container.innerHTML = '';
    if (!state.dishes.length) {
      container.innerHTML = '<p class="muted">Your menu is empty. Go to Build and add your first dish.</p>';
      return;
    }

    var grouped = groupBy(state.dishes, function (dish) { return dish.category || 'Menu'; });
    var cats = Object.keys(grouped).sort();
    for (var c = 0; c < cats.length; c++) {
      var details = makeDetails(cats[c] + ' (' + grouped[cats[c]].length + ')', 'accordion', c === 0);
      var content = document.createElement('div');
      content.className = 'accordion-content';
      for (var d = 0; d < grouped[cats[c]].length; d++) {
        content.appendChild(makeDishDetails(grouped[cats[c]][d], false));
      }
      details.appendChild(content);
      container.appendChild(details);
    }
  }

  function makeDishDetails(dish, includeRemove) {
    var details = makeDetails(dishLabel(dish) + ' • ' + dish.price + ' coins', 'dish-detail', false);
    var body = document.createElement('div');
    body.className = 'dish-body';
    var baseNames = (dish.base || []).map(function (id) { return ingredientName(id, true); }).join(', ');
    var optionalNames = (dish.optional || []).map(function (id) { return ingredientName(id, true); }).join(', ');
    var stats = dishStat(dish.id);
    var ideal = idealDishPrice(dish);
    body.innerHTML = '<p><strong>Wording:</strong> ' + escapeHTML(dishPhrase(dish)) + '</p>' +
      '<p><strong>Price:</strong> ' + escapeHTML(String(dish.price)) + ' coins <span class="price-pill ' + priceVibe(dish.price, ideal) + '">' + escapeHTML(priceHintText(dish.price, ideal)) + '</span></p>' +
      '<p><strong>Hearts:</strong> ' + escapeHTML(String(stats.hearts || 0)) + ' • <strong>Served:</strong> ' + escapeHTML(String(stats.served || 0)) + '</p>' +
      '<p><strong>Flavor profile:</strong> ' + escapeHTML(flavorSummary(dishFlavorProfile(dish))) + '</p>' +
      '<p><strong>Base recipe:</strong> ' + escapeHTML(baseNames || 'nothing yet') + '</p>' +
      '<p><strong>Optional:</strong> ' + escapeHTML(optionalNames || 'none') + '</p>';
    if (includeRemove) {
      var actions = document.createElement('div');
      actions.className = 'manage-actions';
      var edit = document.createElement('button');
      edit.type = 'button';
      edit.className = 'secondary compact';
      edit.textContent = '✏ Edit dish';
      edit.setAttribute('aria-label', 'Edit dish ' + dish.name);
      edit.setAttribute('data-id', dish.id);
      edit.addEventListener('click', function (event) { event.preventDefault(); event.stopPropagation(); editDish(this.getAttribute('data-id')); }, false);
      actions.appendChild(edit);
      var remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'danger compact';
      remove.textContent = 'Remove dish';
      remove.setAttribute('data-id', dish.id);
      remove.addEventListener('click', function (event) { event.preventDefault(); event.stopPropagation(); removeDish(this.getAttribute('data-id')); }, false);
      actions.appendChild(remove);
      body.appendChild(actions);
    }
    details.appendChild(body);
    return details;
  }

  function groupBy(list, callback) {
    var grouped = {};
    for (var i = 0; i < list.length; i++) {
      var key = callback(list[i]) || 'Other';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(list[i]);
    }
    return grouped;
  }

  function makeDetails(title, className, open) {
    var details = document.createElement('details');
    details.className = className;
    if (open) details.open = true;
    var summary = document.createElement('summary');
    summary.textContent = title;
    details.appendChild(summary);
    return details;
  }

  function renderKitchen() {
    renderKitchenOrder();
    renderPot();
    renderIngredientButtons();
  }

  function renderKitchenOrder() {
    var text = $('kitchen-order');
    var helper = $('recipe-helper');
    helper.innerHTML = '';

    if (!state.currentOrder) {
      text.textContent = 'No active order yet. Go to Counter and invite a customer.';
      return;
    }

    var dish = getDish(state.currentOrder.dishId);
    var expected = expectedIngredients(state.currentOrder);
    var excluded = state.currentOrder.excluded || [];
    text.textContent = state.currentOrder.text;

    var html = '<h3>Recipe helper</h3><ul>';
    html += '<li>Main dish: ' + escapeHTML(dishPhrase(dish)) + '</li>';
    html += '<li>Needed: ' + escapeHTML(expected.length ? expected.map(function (id) { return ingredientName(id, true); }).join(', ') : 'nothing yet') + '</li>';
    html += '<li>Avoid: ' + escapeHTML(excluded.length ? excluded.map(function (id) { return ingredientName(id, true); }).join(', ') : 'nothing special') + '</li>';
    html += '</ul>';
    helper.innerHTML = html;
  }

  function renderPot() {
    var pot = $('pot');
    pot.innerHTML = '';
    if (!state.pot.length) {
      var empty = document.createElement('p');
      empty.className = 'pot-empty';
      empty.textContent = 'The pot is empty.';
      pot.appendChild(empty);
      return;
    }

    for (var i = 0; i < state.pot.length; i++) {
      var id = state.pot[i];
      var tag = document.createElement('span');
      tag.className = 'tag';
      tag.appendChild(document.createTextNode(ingredientLabel(id, false) + ' '));
      var remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'secondary compact';
      remove.textContent = 'remove';
      remove.setAttribute('aria-label', 'Remove ' + ingredientName(id, false));
      remove.setAttribute('data-index', i);
      remove.addEventListener('click', function () {
        var index = parseInt(this.getAttribute('data-index'), 10);
        state.pot.splice(index, 1);
        saveAndRender('Removed ingredient.');
      }, false);
      tag.appendChild(remove);
      pot.appendChild(tag);
    }
  }

  function renderIngredientButtons() {
    var container = $('ingredient-buttons');
    container.innerHTML = '';
    if (!state.ingredients.length) {
      container.innerHTML = '<p class="muted">No ingredients yet. Build one first.</p>';
      return;
    }

    var grouped = groupBy(state.ingredients, function (ing) { return ing.category || 'Ingredients'; });
    var cats = Object.keys(grouped).sort();
    for (var c = 0; c < cats.length; c++) {
      var details = makeDetails(cats[c] + ' (' + grouped[cats[c]].length + ')', 'accordion', c === 0);
      var content = document.createElement('div');
      content.className = 'accordion-content ingredient-grid';
      for (var i = 0; i < grouped[cats[c]].length; i++) {
        var ingredient = grouped[cats[c]][i];
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ingredient-card';
        btn.draggable = true;
        btn.setAttribute('data-id', ingredient.id);
        btn.innerHTML = '<strong class="item-name">' + escapeHTML(ingredientLabel(ingredient.id, false)) + '</strong><br><span class="muted">' + escapeHTML(flavorSummary(ingredient.flavors)) + '</span>';
        btn.addEventListener('click', function () { addToPot(this.getAttribute('data-id')); }, false);
        btn.addEventListener('dragstart', function (event) { event.dataTransfer.setData('text/plain', this.getAttribute('data-id')); }, false);
        content.appendChild(btn);
      }
      details.appendChild(content);
      container.appendChild(details);
    }
  }

  function flavorSummary(flavorMap) {
    var parts = [];
    var normalized = normalizeFlavorMap(flavorMap || {});
    var keys = Object.keys(normalized).sort(function (a, b) { return normalized[b] - normalized[a]; });
    for (var i = 0; i < keys.length && i < 3; i++) {
      var flavor = getFlavor(keys[i]);
      if (flavor && normalized[keys[i]] > 0) parts.push(flavor.descriptor + ' ' + Math.round(normalized[keys[i]]) + '%');
    }
    return parts.length ? parts.join(', ') : 'neutral';
  }

  function dishFlavorProfile(dish) {
    if (!dish) return {};
    if (dish.flavors && Object.keys(dish.flavors).length) return normalizeFlavorMap(dish.flavors);
    return finalFlavorProfile(dish.base || []);
  }

  function profileFromInputs(root, selector) {
    var map = {};
    var inputs = root.querySelectorAll(selector);
    for (var i = 0; i < inputs.length; i++) {
      var value = Math.max(0, Math.min(100, Number(inputs[i].value) || 0));
      if (value > 0) map[inputs[i].getAttribute('data-flavor-id')] = value;
    }
    return normalizeFlavorMap(map);
  }

  function renderFlavorProfileEditor(container, profile, className) {
    container.innerHTML = '';
    var normalized = normalizeFlavorMap(profile || {});
    var keys = Object.keys(normalized).sort(function (a, b) { return normalized[b] - normalized[a]; });
    if (!keys.length) {
      container.innerHTML = '<p class="muted small-text">No flavor profile yet. Pick recipe ingredients, then analyze.</p>';
      return;
    }
    var grid = document.createElement('div');
    grid.className = 'small-form-grid flavor-editor-grid';
    for (var i = 0; i < keys.length; i++) {
      var flavor = getFlavor(keys[i]);
      if (!flavor) continue;
      var label = document.createElement('label');
      label.textContent = flavor.descriptor + ' / ' + flavor.form;
      var input = document.createElement('input');
      input.type = 'number';
      input.min = '0';
      input.max = '100';
      input.step = '1';
      input.value = String(Math.round(normalized[keys[i]]));
      input.className = className;
      input.setAttribute('data-flavor-id', keys[i]);
      label.appendChild(input);
      grid.appendChild(label);
    }
    container.appendChild(grid);
    var summary = document.createElement('p');
    summary.className = 'muted small-text flavor-editor-summary';
    summary.textContent = 'Current dish profile: ' + flavorSummary(profileFromInputs(container, '.' + className));
    container.appendChild(summary);
  }

  function updateFlavorEditorSummary(container, inputClass) {
    var summary = container.querySelector('.flavor-editor-summary');
    if (summary) summary.textContent = 'Current dish profile: ' + flavorSummary(profileFromInputs(container, '.' + inputClass));
  }

  function normalizeFlavorMap(map) {
    var result = {};
    var total = 0;
    var keys = Object.keys(map || {});
    for (var i = 0; i < keys.length; i++) {
      var amount = Number(map[keys[i]]) || 0;
      if (amount > 0 && getFlavor(keys[i])) total += amount;
    }
    if (total <= 0) return result;
    for (var j = 0; j < keys.length; j++) {
      var val = Number(map[keys[j]]) || 0;
      if (val > 0 && getFlavor(keys[j])) result[keys[j]] = (val / total) * 100;
    }
    return result;
  }

  function addToPot(id) {
    if (!getIngredient(id)) return;
    state.pot.push(id);
    saveAndRender(ingredientLabel(id, false) + ' added to the pot.');
  }

  function useRecipeBase() {
    if (!state.currentOrder) {
      showStatus('No active order yet.');
      return;
    }
    var dish = getDish(state.currentOrder.dishId);
    state.pot = dish && Array.isArray(dish.base) ? dish.base.slice() : [];
    saveAndRender('Recipe base added to the pot. Add extras or clear/remove ingredients for special requests.');
  }

  function expectedIngredients(order) {
    var dish = getDish(order.dishId);
    var base = dish && Array.isArray(dish.base) ? dish.base.slice() : [];
    var required = order && Array.isArray(order.required) ? order.required.slice() : [];
    var extra = order && Array.isArray(order.extra) ? order.extra.slice() : [];
    var excluded = order && Array.isArray(order.excluded) ? order.excluded : [];
    var result = [];
    for (var i = 0; i < base.length; i++) if (excluded.indexOf(base[i]) === -1) result.push(base[i]);
    for (var r = 0; r < required.length; r++) if (excluded.indexOf(required[r]) === -1 && result.indexOf(required[r]) === -1) result.push(required[r]);
    for (var e = 0; e < extra.length; e++) if (excluded.indexOf(extra[e]) === -1) result.push(extra[e]);
    return result;
  }

  function countMap(list) {
    var map = {};
    for (var i = 0; i < list.length; i++) map[list[i]] = (map[list[i]] || 0) + 1;
    return map;
  }

  function compareIngredients(expected, pot, excluded) {
    var exp = countMap(expected || []);
    var got = countMap(pot || []);
    var missing = [];
    var extras = [];
    var id;
    for (id in exp) {
      if (!Object.prototype.hasOwnProperty.call(exp, id)) continue;
      var deficit = exp[id] - (got[id] || 0);
      for (var m = 0; m < deficit; m++) missing.push(id);
    }
    for (id in got) {
      if (!Object.prototype.hasOwnProperty.call(got, id)) continue;
      var extraCount = got[id] - (exp[id] || 0);
      if ((excluded || []).indexOf(id) !== -1) extraCount = got[id];
      for (var x = 0; x < extraCount; x++) extras.push(id);
    }
    return { missing: missing, extras: extras };
  }

  function serveFood() {
    if (!state.currentOrder) {
      showStatus('There is no customer to serve yet.');
      return;
    }

    var order = state.currentOrder;
    var dish = getDish(order.dishId);
    var expected = expectedIngredients(order);
    var excluded = order.excluded || [];
    var pot = state.pot.slice();
    var compared = compareIngredients(expected, pot, excluded);
    var missing = compared.missing;
    var extras = compared.extras;

    var mistakeCount = missing.length + extras.length;
    var basePay = dish ? Number(dish.price) || 20 : 20;
    var ingredientPay = pot.length * 5;
    var trendBonus = trendBonusFor(dish, pot);
    var deduction = Math.min(0.55, mistakeCount * 0.15);
    var total = Math.max(1, Math.round((basePay + ingredientPay + trendBonus) * (1 - deduction)));
    var xpGain = Math.max(5, Math.round(8 + pot.length * 3 - mistakeCount));

    var oldLevel = state.level || 1;
    var oldGems = state.gems || 0;
    var oldStars = state.stars || 0;
    state.coins += total;
    gainXP(xpGain);
    state.customersServed = (state.customersServed || 0) + 1;
    updateDishStatsAfterServe(dish, mistakeCount, trendBonus);
    var heartEarned = maybeAwardHeart(dish, mistakeCount, trendBonus);
    var newStars = updateRestaurantStars();

    var reward = {
      coins: total,
      xp: xpGain,
      gems: Math.max(0, (state.gems || 0) - oldGems),
      levels: Math.max(0, (state.level || 1) - oldLevel),
      trendBonus: trendBonus,
      missing: missing.length,
      extras: unique(extras).length,
      hearts: heartEarned ? 1 : 0,
      stars: Math.max(0, (state.stars || 0) - oldStars) + newStars
    };
    var feedback = buildFeedback(dish, pot, missing, extras, heartEarned, order.critic);
    state.currentOrder = null;
    state.pot = [];
    saveAndRender('Served! Check the customer bubble for feedback and rewards.');
    showCustomerBubble(feedback, reward);
    switchTab('front');
  }

  function trendBonusFor(dish, pot) {
    var trend = state.currentTrend;
    if (!trend) return 0;
    var basePay = dish ? Number(dish.price) || 20 : 20;
    if (trend.type === 'flavor' && isFlavorTrendingDish(pot, trend.id)) return Math.ceil(basePay * 0.35);
    if (trend.type === 'dish' && dish && trend.id === dish.id) return Math.ceil(basePay * 0.25);
    if (trend.type === 'bargain' && dish && priceVibe(dish.price, idealDishPrice(dish)) === 'cheap') return Math.ceil(basePay * 0.18);
    if (trend.type === 'fancy' && dish && priceVibe(dish.price, idealDishPrice(dish)) === 'expensive') return Math.ceil(basePay * 0.22);
    return 0;
  }

  function isFlavorTrendingDish(pot, flavorId) {
    if (!flavorId) return false;
    var finalFlavors = finalFlavorProfile(pot);
    return (finalFlavors[flavorId] || 0) >= 50;
  }

  function ensureDishStats(target) {
    target = target || state;
    if (!target.dishStats || typeof target.dishStats !== 'object') target.dishStats = {};
    if (!Array.isArray(target.dishes)) return;
    for (var i = 0; i < target.dishes.length; i++) {
      var id = target.dishes[i].id;
      if (!target.dishStats[id]) target.dishStats[id] = { served: 0, perfect: 0, hearts: 0 };
      if (typeof target.dishStats[id].served !== 'number') target.dishStats[id].served = 0;
      if (typeof target.dishStats[id].perfect !== 'number') target.dishStats[id].perfect = 0;
      if (typeof target.dishStats[id].hearts !== 'number') target.dishStats[id].hearts = 0;
    }
  }

  function dishStat(id) {
    ensureDishStats(state);
    if (!state.dishStats[id]) state.dishStats[id] = { served: 0, perfect: 0, hearts: 0 };
    return state.dishStats[id];
  }

  function updateDishStatsAfterServe(dish, mistakeCount, trendBonus) {
    if (!dish) return;
    var stats = dishStat(dish.id);
    stats.served += 1;
    if (mistakeCount === 0) stats.perfect += 1;
  }

  function upgradeBonus(kind) {
    var total = 0;
    var owned = state.ownedUpgrades || [];
    for (var i = 0; i < upgrades.length; i++) {
      if (upgrades[i].kind === kind && owned.indexOf(upgrades[i].id) !== -1) total += upgrades[i].amount || 0;
    }
    return total;
  }

  function maybeAwardHeart(dish, mistakeCount, trendBonus) {
    if (!dish || mistakeCount > 0) return false;
    var stats = dishStat(dish.id);
    var chance = 0.16;
    if (trendBonus > 0) chance += 0.09;
    if (state.currentOrder && state.currentOrder.critic) chance += 0.18;
    chance += Math.min(0.22, upgradeBonus('heart') / 100);
    chance = Math.min(0.72, chance);
    if (Math.random() < chance) {
      stats.hearts += 1;
      state.totalHearts = (state.totalHearts || 0) + 1;
      return true;
    }
    return false;
  }

  function updateRestaurantStars() {
    var bonusStars = 0;
    var expectedFromCustomers = Math.floor((state.customersServed || 0) / 10);
    var expectedFromHearts = Math.floor((state.totalHearts || 0) / 5);
    var target = expectedFromCustomers + expectedFromHearts;
    if ((state.stars || 0) < target) {
      bonusStars += target - (state.stars || 0);
      state.stars = target;
    }
    var bonusChance = Math.min(0.35, upgradeBonus('star') / 100);
    if (bonusChance > 0 && Math.random() < bonusChance) {
      state.stars += 1;
      bonusStars += 1;
    }
    return bonusStars;
  }

  function idealDishPrice(dish) {
    if (!dish) return 5;
    var count = (dish.base || []).length + Math.max(0, Math.floor((dish.optional || []).length * 0.5));
    return Math.max(5, count * 5);
  }

  function priceVibe(price, ideal) {
    price = Number(price) || 0;
    ideal = Number(ideal) || 5;
    if (price <= Math.max(1, ideal - 3)) return 'cheap';
    if (price >= ideal + 6) return 'expensive';
    return 'ideal';
  }

  function priceHintText(price, ideal) {
    var vibe = priceVibe(price, ideal);
    if (vibe === 'cheap') return 'Ideal price: ' + ideal + ' coins. This feels like a bargain.';
    if (vibe === 'expensive') return 'Ideal price: ' + ideal + ' coins. This feels fancy/expensive.';
    return 'Ideal price: ' + ideal + ' coins. Nice balanced price.';
  }

  function finalFlavorProfile(ingredientIds) {
    var totals = {};
    var count = 0;
    for (var i = 0; i < ingredientIds.length; i++) {
      var ingredient = getIngredient(ingredientIds[i]);
      if (!ingredient) continue;
      var normalized = normalizeFlavorMap(ingredient.flavors || {});
      var keys = Object.keys(normalized);
      for (var k = 0; k < keys.length; k++) {
        if (!totals[keys[k]]) totals[keys[k]] = 0;
        totals[keys[k]] += normalized[keys[k]];
      }
      count++;
    }
    if (count <= 0) return {};
    var finalKeys = Object.keys(totals);
    for (var j = 0; j < finalKeys.length; j++) totals[finalKeys[j]] = totals[finalKeys[j]] / count;
    return totals;
  }

  function buildFeedback(dish, pot, missing, extras, heartEarned, critic) {
    var finalFlavors = finalFlavorProfile(pot);
    var sorted = Object.keys(finalFlavors).sort(function (a, b) { return finalFlavors[b] - finalFlavors[a]; });
    var top = getFlavor(sorted[0]);
    var second = getFlavor(sorted[1]) || top;
    var low = findLowFlavor(finalFlavors) || top;
    var hasMistakes = missing.length || extras.length;
    var stats = dish ? dishStat(dish.id) : { hearts: 0 };
    var ideal = dish ? idealDishPrice(dish) : 0;
    var vibe = dish ? priceVibe(dish.price, ideal) : 'ideal';
    var trend = state.currentTrend;

    var bargainFeedback = [
      'Wow, this {DISH} was delicious and such a bargain.',
      'I could finally get the {DISH} because I could afford it. It was spectacular.',
      'The {DISH} tasted amazing, and the price made it even better.',
      'I noticed this was cheaper than expected. What a tasty deal.',
      'Budget-friendly and delicious? I am obsessed with this {DISH}.',
      'That price made me happy before I even took a bite.',
      'A bargain this good deserves a little applause, {M}.',
      'Affordable and delicious is a powerful combo.',
      'I came for the low price, but I would come back for the {F}.',
      'That {DISH} felt like finding a secret deal on the menu.'
    ];
    var fancyFeedback = [
      'This {DISH} felt fancy in the best way.',
      'The {DISH} tasted premium. Totally worth it.',
      'I wanted something special, and this {DISH} delivered.',
      'That was a fancy little treat. I loved the {F}.',
      'This tastes like the kind of {DISH} people talk about later.',
      'That {DISH} made me feel like I was at a tiny luxury restaurant.',
      'Worth the splurge. The {F} was gorgeous.',
      '{M}, this felt like a signature plate.',
      'Fancy, flavorful, and still very fun.',
      'I paid extra, and honestly, I get it.'
    ];
    var trendFeedback = [
      'Now I see why the {DISH} is trending.',
      'The hype around this {DISH} makes sense. That was so good.',
      'Everyone was right about your {DISH}. Loved it.',
      'I came for the trend and stayed for the {F}.',
      'Your trending {DISH} totally lived up to it.',
      'The trend board did not lie about this one.',
      'I understand why people are ordering this today.',
      'That {DISH} deserves its little trending moment.',
      'The {F} is exactly why this dish is getting attention.',
      '{RESTAURANT} has a hit today, {M}.'
    ];
    var heartFeedback = [
      'I loved this so much. I am adding a heart to the {DISH}.',
      'This {DISH} is going on my favorites list.',
      'That was one of the best things I have had here.',
      'I am absolutely telling people about this {DISH}.',
      'That was heart-worthy. Seriously, great job.',
      'That {DISH} deserves a heart and maybe a tiny fan club.',
      '{M}, you have to keep this one on the menu.',
      'I am officially emotionally attached to this {DISH}.',
      'That was the kind of meal people remember.',
      'I was not expecting to love it this much.'
    ];
    var popularFeedback = [
      'I heard your {DISH} was popular, and wow, people were right.',
      'This {DISH} deserves all the hearts it has been getting.',
      'I understand the reputation now. The {DISH} is amazing.',
      'Your famous {DISH} is famous for a reason.',
      'I came because everyone talks about this {DISH}, and I get it now.',
      '{M}, this {DISH} is becoming a little legend.',
      'The regulars were right to recommend this.',
      'I can see why this is one of {RESTAURANT}\'s top dishes.',
      'That {DISH} has main-character energy.',
      'Please tell me this stays on the menu forever.'
    ];
    var criticFeedback = [
      'As a local food critic, I have to say this {DISH} has serious charm.',
      'My review is going to mention the {F}. That stood out beautifully.',
      'This place has personality, and this {DISH} proves it.',
      'I can see why people recommended {RESTAURANT}. Excellent work.',
      'That {DISH} had a clear point of view. Very impressive.',
      '{M}, your menu really does make its own rules.',
      'There is a playful confidence here. I like it.',
      'This {DISH} gives {RESTAURANT} a strong identity.',
      'I came in curious and left with notes full of compliments.',
      'That was creative without feeling random. Nicely done.'
    ];

    var template;
    if (hasMistakes) template = randomItem(critiqueTemplates);
    else if (critic) template = randomItem(criticFeedback);
    else if (heartEarned) template = randomItem(heartFeedback);
    else if (stats.hearts >= 15 && Math.random() < 0.35) template = randomItem(popularFeedback);
    else if (trend && trend.type === 'dish' && dish && trend.id === dish.id && Math.random() < 0.45) template = randomItem(trendFeedback);
    else if (vibe === 'cheap' && Math.random() < 0.35) template = randomItem(bargainFeedback);
    else if (vibe === 'expensive' && Math.random() < 0.30) template = randomItem(fancyFeedback);
    else template = randomItem(positiveTemplates);

    var ingredientId = missing[0] || extras[0] || pot[0] || randomOptionalIngredient(dish);
    var message = template
      .replace(/\{DISH\}/g, dishPlain(dish))
      .replace(/\{M\}/g, customerChefName())
      .replace(/\{RESTAURANT\}/g, state.restaurantName || 'Menu Menace')
      .replace(/\{F\}/g, top ? top.form : 'flavor')
      .replace(/\{F2\}/g, second ? second.form : 'flavor')
      .replace(/\{DE\}/g, top ? top.descriptor : 'tasty')
      .replace(/\{LOW_DE\}/g, low ? low.descriptor : 'heavy')
      .replace(/\{I\}/g, ingredientName(ingredientId, true));

    return message;
  }

  function findLowFlavor(finalFlavors) {
    if (!state.flavors.length) return null;
    for (var i = 0; i < state.flavors.length; i++) {
      if (!finalFlavors[state.flavors[i].id] || finalFlavors[state.flavors[i].id] < 5) return state.flavors[i];
    }
    return state.flavors[0];
  }

  function gainXP(amount) {
    state.xp += amount;
    while (state.xp >= xpToNextLevel()) {
      state.xp -= xpToNextLevel();
      state.level += 1;
      state.gems += state.level;
      state.coins += 10;
    }
  }

  function xpToNextLevel() {
    return 30 + ((state.level || 1) - 1) * 12;
  }

  function renderCustomize() {
    $('restaurant-name').value = state.restaurantName || '';
    $('chef-name').value = state.chefName || '';
    renderFlavorList();
    renderIngredientFlavorInputs();
    renderIngredientManageList();
    renderDishIngredientChecks();
    renderDishManageList();
    updateNewDishPriceHint();
  }

  function saveNames() {
    state.restaurantName = $('restaurant-name').value.trim() || 'Menu Menace';
    state.chefName = $('chef-name').value.trim() || 'Chef';
    saveAndRender('Names saved.');
  }

  function closeEditor() {
    var modal = $('edit-modal');
    if (modal) modal.hidden = true;
    modalSaveHandler = null;
  }

  function openEditor(title, bodyNode, saveHandler) {
    var modal = $('edit-modal');
    var titleEl = $('modal-title');
    var body = $('modal-body');
    if (!modal || !titleEl || !body) return;
    titleEl.textContent = title;
    body.innerHTML = '';
    body.appendChild(bodyNode);
    modalSaveHandler = saveHandler;
    modal.hidden = false;
    var first = body.querySelector('input, select, textarea, button');
    if (first) window.setTimeout(function () { first.focus(); }, 30);
  }

  function makeEditorForm() {
    var form = document.createElement('div');
    form.className = 'modal-form';
    return form;
  }

  function addTextField(form, id, labelText, value, placeholder) {
    var label = document.createElement('label');
    label.textContent = labelText;
    var input = document.createElement('input');
    input.id = id;
    input.type = 'text';
    input.value = value || '';
    input.placeholder = placeholder || '';
    label.appendChild(input);
    form.appendChild(label);
    return input;
  }

  function addNumberField(form, id, labelText, value, min, max) {
    var label = document.createElement('label');
    label.textContent = labelText;
    var input = document.createElement('input');
    input.id = id;
    input.type = 'number';
    input.value = value;
    if (min !== null && min !== undefined) input.min = String(min);
    if (max !== null && max !== undefined) input.max = String(max);
    label.appendChild(input);
    form.appendChild(label);
    return input;
  }

  function addSelectField(form, id, labelText, value, options) {
    var label = document.createElement('label');
    label.textContent = labelText;
    var select = document.createElement('select');
    select.id = id;
    for (var i = 0; i < options.length; i++) {
      var opt = document.createElement('option');
      opt.value = options[i].value;
      opt.textContent = options[i].text;
      if (options[i].value === value) opt.selected = true;
      select.appendChild(opt);
    }
    label.appendChild(select);
    form.appendChild(label);
    return select;
  }

  function addModalFieldset(form, legendText) {
    var fieldset = document.createElement('fieldset');
    var legend = document.createElement('legend');
    legend.textContent = legendText;
    fieldset.appendChild(legend);
    form.appendChild(fieldset);
    return fieldset;
  }

  function addIngredientCheckboxes(fieldset, className, selected) {
    var list = document.createElement('div');
    list.className = 'check-list';
    selected = selected || [];
    for (var i = 0; i < state.ingredients.length; i++) {
      var ing = state.ingredients[i];
      var label = document.createElement('label');
      label.className = 'check-row';
      var input = document.createElement('input');
      input.type = 'checkbox';
      input.className = className;
      input.value = ing.id;
      input.checked = selected.indexOf(ing.id) !== -1;
      label.appendChild(input);
      label.appendChild(document.createTextNode(ingredientLabel(ing.id, false)));
      list.appendChild(label);
    }
    fieldset.appendChild(list);
  }

  function checkedValuesInside(root, selector) {
    var result = [];
    var checks = root.querySelectorAll(selector);
    for (var i = 0; i < checks.length; i++) if (checks[i].checked) result.push(checks[i].value);
    return result;
  }

  function renderFlavorList() {
    var container = $('flavor-list');
    container.innerHTML = '';
    if (!state.flavors.length) {
      container.innerHTML = '<p class="muted">No flavors yet. Add one to unlock trends and ingredient flavor amounts.</p>';
      return;
    }
    for (var i = 0; i < state.flavors.length; i++) {
      var flavor = state.flavors[i];
      var div = document.createElement('div');
      div.className = 'manage-item';
      div.innerHTML = '<div class="manage-main"><strong>' + escapeHTML(flavor.descriptor) + '</strong><br><span class="muted">noun form: ' + escapeHTML(flavor.form) + '</span></div>';
      var actions = document.createElement('div');
      actions.className = 'manage-actions';
      var edit = document.createElement('button');
      edit.type = 'button';
      edit.className = 'secondary compact';
      edit.textContent = '✏ Edit';
      edit.setAttribute('aria-label', 'Edit flavor ' + flavor.descriptor);
      edit.setAttribute('data-id', flavor.id);
      edit.addEventListener('click', function () { editFlavor(this.getAttribute('data-id')); }, false);
      actions.appendChild(edit);
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'danger compact';
      button.textContent = 'Remove';
      button.setAttribute('data-id', flavor.id);
      button.addEventListener('click', function () { removeFlavor(this.getAttribute('data-id')); }, false);
      actions.appendChild(button);
      div.appendChild(actions);
      container.appendChild(div);
    }
  }

  function editFlavor(id) {
    var flavor = getFlavor(id);
    if (!flavor) return;
    var form = makeEditorForm();
    addTextField(form, 'edit-flavor-descriptor', 'Descriptor/adjective', flavor.descriptor, 'savory');
    addTextField(form, 'edit-flavor-form', 'Noun form', flavor.form, 'umami');
    var note = document.createElement('p');
    note.className = 'muted small-text';
    note.textContent = 'Example: descriptor “savory” and noun form “umami” makes customers say the umami stood out.';
    form.appendChild(note);
    openEditor('Edit flavor profile', form, function () {
      var descriptor = $('edit-flavor-descriptor').value.trim().toLowerCase();
      var formValue = $('edit-flavor-form').value.trim().toLowerCase();
      if (!descriptor || !formValue) {
        showStatus('Flavor needs both a descriptor and noun form.');
        return;
      }
      flavor.descriptor = descriptor;
      flavor.form = formValue;
      closeEditor();
      saveAndRender('Flavor updated.');
    });
  }

  function addFlavor() {
    var descriptor = $('new-flavor-descriptor').value.trim().toLowerCase();
    var form = $('new-flavor-form').value.trim().toLowerCase();
    if (!descriptor || !form) {
      showStatus('Add both a descriptor and noun form.');
      return;
    }
    var id = uniqueId(slugify(descriptor), state.flavors.map(function (x) { return x.id; }));
    state.flavors.push({ id: id, descriptor: descriptor, form: form });
    if (!state.currentTrendId) state.currentTrendId = id;
    $('new-flavor-descriptor').value = '';
    $('new-flavor-form').value = '';
    saveAndRender('Flavor added. Trends can pick it now.');
  }

  function removeFlavor(id) {
    var flavor = getFlavor(id);
    if (!flavor) return;
    var ok = window.confirm('Remove the flavor "' + flavor.descriptor + '"? It will also be removed from ingredient flavor amounts.');
    if (!ok) return;
    state.flavors = state.flavors.filter(function (item) { return item.id !== id; });
    for (var i = 0; i < state.ingredients.length; i++) {
      if (state.ingredients[i].flavors) delete state.ingredients[i].flavors[id];
    }
    if (state.currentTrendId === id) state.currentTrendId = state.flavors.length ? state.flavors[0].id : null;
    saveAndRender('Flavor removed.');
  }

  function renderIngredientFlavorInputs() {
    var container = $('ingredient-flavor-inputs');
    container.innerHTML = '';
    if (!state.flavors.length) {
      container.innerHTML = '<p class="muted">Add a flavor profile first.</p>';
      return;
    }
    for (var i = 0; i < state.flavors.length; i++) {
      var flavor = state.flavors[i];
      var label = document.createElement('label');
      label.textContent = flavor.descriptor;
      var input = document.createElement('input');
      input.type = 'number';
      input.min = '0';
      input.max = '100';
      input.value = '0';
      input.setAttribute('data-flavor-id', flavor.id);
      input.className = 'new-ingredient-flavor';
      label.appendChild(input);
      container.appendChild(label);
    }
  }

  function addIngredient() {
    if (!state.flavors.length) {
      showStatus('Create at least one flavor profile before making ingredients.');
      openDetails('flavor-builder');
      return;
    }
    var name = $('new-ingredient-name').value.trim();
    var collective = $('new-ingredient-collective').value.trim() || name;
    var icon = $('new-ingredient-icon').value.trim();
    var category = $('new-ingredient-category').value.trim() || 'Ingredients';
    if (!name) {
      showStatus('Name the ingredient first.');
      return;
    }
    var id = uniqueId(slugify(name), state.ingredients.map(function (x) { return x.id; }));
    var flavors = {};
    var inputs = document.querySelectorAll('.new-ingredient-flavor');
    for (var i = 0; i < inputs.length; i++) {
      var amount = Number(inputs[i].value) || 0;
      if (amount > 0) flavors[inputs[i].getAttribute('data-flavor-id')] = amount;
    }
    if (Object.keys(flavors).length === 0) {
      showStatus('Give the ingredient at least one flavor amount.');
      return;
    }
    state.ingredients.push({ id: id, name: name, collective: collective, category: category, icon: icon, flavors: flavors });
    $('new-ingredient-name').value = '';
    $('new-ingredient-collective').value = '';
    $('new-ingredient-icon').value = '';
    saveAndRender('Ingredient added.');
  }

  function renderIngredientManageList() {
    var container = $('ingredient-manage-list');
    container.innerHTML = '';
    if (!state.ingredients.length) {
      container.innerHTML = '<p class="muted">No ingredients yet.</p>';
      return;
    }
    var grouped = groupBy(state.ingredients, function (ing) { return ing.category || 'Ingredients'; });
    var cats = Object.keys(grouped).sort();
    for (var c = 0; c < cats.length; c++) {
      var details = makeDetails(cats[c] + ' (' + grouped[cats[c]].length + ')', 'accordion', c === 0);
      var content = document.createElement('div');
      content.className = 'accordion-content manage-list';
      for (var i = 0; i < grouped[cats[c]].length; i++) content.appendChild(makeIngredientManageItem(grouped[cats[c]][i]));
      details.appendChild(content);
      container.appendChild(details);
    }
  }

  function makeIngredientManageItem(ing) {
    var div = document.createElement('div');
    div.className = 'manage-item';
    div.innerHTML = '<div class="manage-main"><strong>' + escapeHTML(ingredientLabel(ing.id, false)) + '</strong><br><span class="muted">' + escapeHTML(flavorSummary(ing.flavors)) + '</span></div>';
    var actions = document.createElement('div');
    actions.className = 'manage-actions';
    var edit = document.createElement('button');
    edit.type = 'button';
    edit.className = 'secondary compact';
    edit.textContent = '✏ Edit';
    edit.setAttribute('aria-label', 'Edit ingredient ' + ing.name);
    edit.setAttribute('data-id', ing.id);
    edit.addEventListener('click', function () { editIngredient(this.getAttribute('data-id')); }, false);
    actions.appendChild(edit);
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'danger compact';
    button.textContent = 'Remove';
    button.setAttribute('data-id', ing.id);
    button.addEventListener('click', function () { removeIngredient(this.getAttribute('data-id')); }, false);
    actions.appendChild(button);
    div.appendChild(actions);
    return div;
  }

  function editIngredient(id) {
    var ing = getIngredient(id);
    if (!ing) return;
    var form = makeEditorForm();
    addTextField(form, 'edit-ingredient-name', 'Ingredient name', ing.name, 'tomato sauce');
    addTextField(form, 'edit-ingredient-collective', 'Collective/plural name', ing.collective || ing.name, 'tomato sauce');
    addTextField(form, 'edit-ingredient-icon', 'Optional icon / emoji', itemIcon(ing), '🍅');
    addTextField(form, 'edit-ingredient-category', 'Ingredient category', ing.category || 'Ingredients', 'Staples');
    var fs = addModalFieldset(form, 'Flavor amounts');
    var grid = document.createElement('div');
    grid.className = 'small-form-grid';
    for (var i = 0; i < state.flavors.length; i++) {
      var flavor = state.flavors[i];
      var label = document.createElement('label');
      label.textContent = flavor.descriptor;
      var input = document.createElement('input');
      input.type = 'number';
      input.min = '0';
      input.max = '100';
      input.value = ing.flavors && ing.flavors[flavor.id] ? ing.flavors[flavor.id] : 0;
      input.className = 'edit-ingredient-flavor';
      input.setAttribute('data-flavor-id', flavor.id);
      label.appendChild(input);
      grid.appendChild(label);
    }
    fs.appendChild(grid);
    openEditor('Edit ingredient details', form, function () {
      var name = $('edit-ingredient-name').value.trim();
      var collective = $('edit-ingredient-collective').value.trim() || name;
      var icon = $('edit-ingredient-icon').value.trim();
      var category = $('edit-ingredient-category').value.trim() || 'Ingredients';
      if (!name) {
        showStatus('Ingredient needs a name.');
        return;
      }
      var flavors = {};
      var inputs = form.querySelectorAll('.edit-ingredient-flavor');
      for (var j = 0; j < inputs.length; j++) {
        var amount = Number(inputs[j].value);
        if (isNaN(amount)) amount = 0;
        amount = Math.max(0, Math.min(100, Math.round(amount)));
        if (amount > 0) flavors[inputs[j].getAttribute('data-flavor-id')] = amount;
      }
      if (Object.keys(flavors).length === 0) {
        showStatus('Ingredient needs at least one flavor amount.');
        return;
      }
      ing.name = name;
      ing.collective = collective;
      ing.category = category;
      ing.icon = icon;
      ing.flavors = flavors;
      closeEditor();
      saveAndRender('Ingredient updated.');
    });
  }

  function removeIngredient(id) {
    var ing = getIngredient(id);
    if (!ing) return;
    var ok = window.confirm('Remove "' + ing.name + '"? It will be removed from recipes too.');
    if (!ok) return;
    state.ingredients = state.ingredients.filter(function (item) { return item.id !== id; });
    state.pot = state.pot.filter(function (item) { return item !== id; });
    saveAndRender('Ingredient removed.');
  }

  function renderDishIngredientChecks() {
    var base = $('dish-base-ingredients');
    var optional = $('dish-optional-ingredients');
    base.innerHTML = '';
    optional.innerHTML = '';
    if (!state.ingredients.length) {
      base.innerHTML = '<p class="muted">Create ingredients first.</p>';
      optional.innerHTML = '<p class="muted">Create ingredients first.</p>';
      return;
    }
    for (var i = 0; i < state.ingredients.length; i++) {
      base.appendChild(makeCheckRow('base-ingredient-check', state.ingredients[i]));
      optional.appendChild(makeCheckRow('optional-ingredient-check', state.ingredients[i]));
    }
    updateNewDishPriceHint();
  }

  function makeCheckRow(className, ingredient) {
    var label = document.createElement('label');
    label.className = 'check-row';
    var input = document.createElement('input');
    input.type = 'checkbox';
    input.className = className;
    input.value = ingredient.id;
    label.appendChild(input);
    label.appendChild(document.createTextNode(ingredientLabel(ingredient.id, false)));
    return label;
  }

  function updateNewDishPriceHint() {
    var hint = $('new-dish-price-hint');
    var priceEl = $('new-dish-price');
    if (!hint || !priceEl) return;
    var base = checkedValues('.base-ingredient-check');
    if (!base.length) {
      hint.textContent = 'Pick base ingredients to see an ideal price.';
      hint.className = 'price-hint';
      return;
    }
    var fake = { base: base, optional: checkedValues('.optional-ingredient-check') };
    var ideal = idealDishPrice(fake);
    var price = Math.max(1, Math.round(Number(priceEl.value) || ideal));
    var vibe = priceVibe(price, ideal);
    hint.textContent = priceHintText(price, ideal);
    hint.className = 'price-hint ' + vibe;
  }

  function analyzeNewDishFlavorProfile() {
    var base = checkedValues('.base-ingredient-check');
    var container = $('new-dish-flavor-profile');
    if (!container) return;
    if (!base.length) {
      container.innerHTML = '<p class="muted small-text">Pick at least one base ingredient first.</p>';
      return;
    }
    var profile = finalFlavorProfile(base);
    renderFlavorProfileEditor(container, profile, 'new-dish-flavor-input');
    updateNewDishFlavorSummary();
    showStatus('Dish flavor profile analyzed. You can tweak it before finishing the dish.');
  }

  function updateNewDishFlavorSummary() {
    var container = $('new-dish-flavor-profile');
    if (!container) return;
    updateFlavorEditorSummary(container, 'new-dish-flavor-input');
  }

  function markNewDishProfileStale() {
    var container = $('new-dish-flavor-profile');
    if (!container) return;
    if (container.querySelector('.new-dish-flavor-input')) {
      var note = document.createElement('p');
      note.className = 'muted small-text';
      note.textContent = 'Recipe changed. Tap Analyze flavor profile again to recalculate, or keep editing this profile manually.';
      if (!container.querySelector('.stale-profile-note')) {
        note.className += ' stale-profile-note';
        container.appendChild(note);
      }
    }
  }

  function addDish() {
    var name = $('new-dish-name').value.trim();
    var icon = $('new-dish-icon').value.trim();
    var category = $('new-dish-category').value.trim() || 'Menu';
    var kind = $('new-dish-kind').value;
    var price = Math.max(1, Math.round(Number($('new-dish-price').value) || 20));
    if (!name) {
      showStatus('Name the dish first.');
      return;
    }
    if (!state.ingredients.length) {
      showStatus('Create ingredients before making a dish.');
      openDetails('ingredient-builder');
      return;
    }
    if (state.dishes.length >= state.menuSlots) {
      showStatus('You need another menu slot before adding this dish.');
      return;
    }
    var base = checkedValues('.base-ingredient-check');
    var optional = checkedValues('.optional-ingredient-check');
    if (!base.length) {
      showStatus('Pick at least one base ingredient.');
      return;
    }
    optional = optional.filter(function (id) { return base.indexOf(id) === -1; });
    var id = uniqueId(slugify(name), state.dishes.map(function (x) { return x.id; }));
    var profileContainer = $('new-dish-flavor-profile');
    var flavors = profileContainer && profileContainer.querySelector('.new-dish-flavor-input') ? profileFromInputs(profileContainer, '.new-dish-flavor-input') : finalFlavorProfile(base);
    state.dishes.push({ id: id, name: name, category: category, kind: kind, price: price, icon: icon, base: base, optional: optional, flavors: flavors });
    $('new-dish-name').value = '';
    $('new-dish-icon').value = '';
    $('new-dish-category').value = '';
    $('new-dish-price').value = '25';
    if ($('new-dish-flavor-profile')) $('new-dish-flavor-profile').innerHTML = '<p class="muted small-text">Pick recipe ingredients, then tap Analyze flavor profile.</p>';
    saveAndRender('Dish added to the menu.');
  }

  function checkedValues(selector) {
    var result = [];
    var checks = document.querySelectorAll(selector);
    for (var i = 0; i < checks.length; i++) if (checks[i].checked) result.push(checks[i].value);
    return result;
  }

  function renderDishManageList() {
    var container = $('dish-manage-list');
    container.innerHTML = '';
    if (!state.dishes.length) {
      container.innerHTML = '<p class="muted">No dishes yet.</p>';
      return;
    }
    var grouped = groupBy(state.dishes, function (dish) { return dish.category || 'Menu'; });
    var cats = Object.keys(grouped).sort();
    for (var c = 0; c < cats.length; c++) {
      var details = makeDetails(cats[c] + ' (' + grouped[cats[c]].length + ')', 'accordion', c === 0);
      var content = document.createElement('div');
      content.className = 'accordion-content';
      for (var d = 0; d < grouped[cats[c]].length; d++) content.appendChild(makeDishDetails(grouped[cats[c]][d], true));
      details.appendChild(content);
      container.appendChild(details);
    }
  }

  function editDish(id) {
    var dish = getDish(id);
    if (!dish) return;
    var form = makeEditorForm();
    addTextField(form, 'edit-dish-name', 'Dish name', dish.name, 'spaghetti');
    addTextField(form, 'edit-dish-icon', 'Optional icon / emoji', itemIcon(dish), '🍝');
    addTextField(form, 'edit-dish-category', 'Dish category', dish.category || 'Menu', 'Classics');
    addSelectField(form, 'edit-dish-kind', 'Dish wording', dish.kind || 'single', [
      { value: 'single', text: 'a/an dish, like a hamburger' },
      { value: 'collective', text: 'some dish, like some pizza or spaghetti' }
    ]);
    var priceInput = addNumberField(form, 'edit-dish-price', 'Price in coins', dish.price || 20, 1, null);
    var editPriceHint = document.createElement('p');
    editPriceHint.className = 'price-hint';
    editPriceHint.textContent = priceHintText(dish.price || 20, idealDishPrice(dish));
    form.appendChild(editPriceHint);
    var baseSet = addModalFieldset(form, 'Base recipe');
    addIngredientCheckboxes(baseSet, 'edit-dish-base-check', dish.base || []);
    var optSet = addModalFieldset(form, 'Optional ingredients customers may request');
    addIngredientCheckboxes(optSet, 'edit-dish-optional-check', dish.optional || []);
    var flavorSet = addModalFieldset(form, 'Dish flavor profile');
    var flavorBox = document.createElement('div');
    flavorBox.id = 'edit-dish-flavor-profile';
    flavorSet.appendChild(flavorBox);
    var analyzeBtn = document.createElement('button');
    analyzeBtn.type = 'button';
    analyzeBtn.className = 'secondary compact';
    analyzeBtn.textContent = 'Analyze from base recipe';
    analyzeBtn.addEventListener('click', function (event) {
      event.preventDefault();
      var recipeProfile = finalFlavorProfile(checkedValuesInside(form, '.edit-dish-base-check'));
      renderFlavorProfileEditor(flavorBox, recipeProfile, 'edit-dish-flavor-input');
    }, false);
    flavorSet.appendChild(analyzeBtn);
    renderFlavorProfileEditor(flavorBox, dishFlavorProfile(dish), 'edit-dish-flavor-input');
    function refreshEditPriceHint() {
      var fakeDish = { base: checkedValuesInside(form, '.edit-dish-base-check'), optional: checkedValuesInside(form, '.edit-dish-optional-check') };
      var ideal = idealDishPrice(fakeDish);
      var price = Math.max(1, Math.round(Number(priceInput.value) || ideal));
      editPriceHint.textContent = priceHintText(price, ideal);
      editPriceHint.className = 'price-hint ' + priceVibe(price, ideal);
    }
    priceInput.addEventListener('input', refreshEditPriceHint, false);
    form.addEventListener('change', function (event) {
      refreshEditPriceHint();
      if (event.target && (event.target.className || '').indexOf('edit-dish-flavor-input') !== -1) updateFlavorEditorSummary(flavorBox, 'edit-dish-flavor-input');
    }, false);
    refreshEditPriceHint();
    var note = document.createElement('p');
    note.className = 'muted small-text';
    note.textContent = 'Tip: “with no” orders only use ingredients in this dish. Weird add-on orders are rare and say they are weird.';
    form.appendChild(note);
    openEditor('Edit dish details', form, function () {
      var name = form.querySelector('#edit-dish-name').value.trim();
      var icon = form.querySelector('#edit-dish-icon').value.trim();
      var category = form.querySelector('#edit-dish-category').value.trim() || 'Menu';
      var kind = form.querySelector('#edit-dish-kind').value === 'collective' ? 'collective' : 'single';
      var price = Math.max(1, Math.round(Number(priceInput.value) || dish.price || 20));
      var base = checkedValuesInside(form, '.edit-dish-base-check');
      var optional = checkedValuesInside(form, '.edit-dish-optional-check').filter(function (ingId) { return base.indexOf(ingId) === -1; });
      if (!name) {
        showStatus('Dish needs a name.');
        return;
      }
      if (!base.length) {
        showStatus('Dish needs at least one base ingredient.');
        return;
      }
      dish.name = name;
      dish.category = category;
      dish.icon = icon;
      dish.kind = kind;
      dish.price = price;
      dish.base = base;
      dish.optional = optional;
      dish.flavors = flavorBox && flavorBox.querySelector('.edit-dish-flavor-input') ? profileFromInputs(flavorBox, '.edit-dish-flavor-input') : finalFlavorProfile(base);
      closeEditor();
      saveAndRender('Dish updated.');
    });
  }

  function ingredientIdsFromText(text) {
    var result = [];
    var parts = safeText(text).split(',');
    for (var i = 0; i < parts.length; i++) {
      var wanted = parts[i].trim().toLowerCase();
      if (!wanted) continue;
      var found = null;
      for (var j = 0; j < state.ingredients.length; j++) {
        var ing = state.ingredients[j];
        if (ing.id.toLowerCase() === wanted || ing.name.toLowerCase() === wanted || (ing.collective || '').toLowerCase() === wanted) {
          found = ing.id;
          break;
        }
      }
      if (found && result.indexOf(found) === -1) result.push(found);
    }
    return result;
  }

  function removeDish(id) {
    var dish = getDish(id);
    if (!dish) return;
    var ok = window.confirm('Remove "' + dish.name + '" from the menu?');
    if (!ok) return;
    state.dishes = state.dishes.filter(function (item) { return item.id !== id; });
    if (state.dishStats) delete state.dishStats[id];
    if (state.currentOrder && state.currentOrder.dishId === id) {
      state.currentOrder = null;
      state.pot = [];
    }
    saveAndRender('Dish removed.');
  }

  function renderStatsTab() {
    ensureDishStats(state);
    var box = $('restaurant-stats');
    if (box) {
      var topDish = topDishes()[0];
      box.innerHTML = '<div class="stats-grid-big">' +
        '<div class="mini-stat"><strong>' + escapeHTML(String(state.customersServed || 0)) + '</strong><span>customers served</span></div>' +
        '<div class="mini-stat"><strong>' + escapeHTML(String(state.stars || 0)) + '</strong><span>reputation stars</span></div>' +
        '<div class="mini-stat"><strong>' + escapeHTML(String(state.totalHearts || 0)) + '</strong><span>dish hearts</span></div>' +
        '<div class="mini-stat"><strong>' + escapeHTML(topDish ? dishLabel(topDish.dish) : 'none yet') + '</strong><span>top dish</span></div>' +
        '</div>';
    }
    renderDishStatsList();
  }

  function topDishes() {
    ensureDishStats(state);
    var rows = [];
    for (var i = 0; i < state.dishes.length; i++) {
      var dish = state.dishes[i];
      var stats = dishStat(dish.id);
      rows.push({ dish: dish, stats: stats, score: (stats.hearts || 0) * 10 + (stats.perfect || 0) * 2 + (stats.served || 0) });
    }
    rows.sort(function (a, b) { return b.score - a.score; });
    return rows;
  }

  function renderDishStatsList() {
    var container = $('dish-stats-list');
    if (!container) return;
    container.innerHTML = '';
    if (!state.dishes.length) {
      container.innerHTML = '<p class="muted">No dishes yet.</p>';
      return;
    }
    var top = topDishes().slice(0, 5);
    var topDetails = makeDetails('Top five dishes', 'accordion', true);
    var topContent = document.createElement('div');
    topContent.className = 'accordion-content';
    for (var t = 0; t < top.length; t++) topContent.appendChild(makeDishStatCard(top[t].dish));
    topDetails.appendChild(topContent);
    container.appendChild(topDetails);

    var grouped = groupBy(state.dishes, function (dish) { return dish.category || 'Menu'; });
    var cats = Object.keys(grouped).sort();
    for (var c = 0; c < cats.length; c++) {
      var details = makeDetails(cats[c] + ' (' + grouped[cats[c]].length + ')', 'accordion', false);
      var content = document.createElement('div');
      content.className = 'accordion-content';
      for (var d = 0; d < grouped[cats[c]].length; d++) content.appendChild(makeDishStatCard(grouped[cats[c]][d]));
      details.appendChild(content);
      container.appendChild(details);
    }
  }

  function makeDishStatCard(dish) {
    var stats = dishStat(dish.id);
    var div = document.createElement('div');
    div.className = 'manage-item';
    var ideal = idealDishPrice(dish);
    div.innerHTML = '<div class="manage-main"><strong>' + escapeHTML(dishLabel(dish)) + '</strong><br>' +
      '<span class="muted">' + escapeHTML(String(stats.hearts || 0)) + ' hearts • ' + escapeHTML(String(stats.served || 0)) + ' served • ' + escapeHTML(String(stats.perfect || 0)) + ' perfect</span><br>' +
      '<span class="price-pill ' + priceVibe(dish.price, ideal) + '">' + escapeHTML(priceHintText(dish.price, ideal)) + '</span></div>';
    return div;
  }

  function renderShop() {
    renderUpgrades();
    renderThemes();
  }

  function renderUpgrades() {
    var container = $('upgrade-list');
    if (!container) return;
    container.innerHTML = '';
    for (var i = 0; i < upgrades.length; i++) {
      var upgrade = upgrades[i];
      var owned = (state.ownedUpgrades || []).indexOf(upgrade.id) !== -1;
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'theme-button';
      button.setAttribute('data-id', upgrade.id);
      button.innerHTML = '<strong>' + escapeHTML(upgrade.name) + '</strong><br><span>' + escapeHTML(upgrade.description) + '</span><br><span>' + (owned ? 'Owned' : escapeHTML(String(upgrade.cost)) + ' ' + escapeHTML(upgrade.costType)) + '</span>';
      button.disabled = owned;
      button.addEventListener('click', function () { buyUpgrade(this.getAttribute('data-id')); }, false);
      container.appendChild(button);
    }
  }

  function buyUpgrade(id) {
    var upgrade = null;
    for (var i = 0; i < upgrades.length; i++) if (upgrades[i].id === id) upgrade = upgrades[i];
    if (!upgrade) return;
    if (!Array.isArray(state.ownedUpgrades)) state.ownedUpgrades = [];
    if (state.ownedUpgrades.indexOf(id) !== -1) return;
    if (upgrade.costType === 'gems') {
      if ((state.gems || 0) < upgrade.cost) { showStatus('Not enough gems for that upgrade yet.'); return; }
      state.gems -= upgrade.cost;
    } else {
      if ((state.coins || 0) < upgrade.cost) { showStatus('Not enough coins for that upgrade yet.'); return; }
      state.coins -= upgrade.cost;
    }
    state.ownedUpgrades.push(id);
    saveAndRender(upgrade.name + ' purchased!');
  }

  function renderSettings() {
    renderSlots();
  }

  function renderSlots() {
    var nextCost = slotCost();
    $('slot-info').textContent = 'You are using ' + state.dishes.length + ' of ' + state.menuSlots + ' menu slots. Next slot costs ' + nextCost + ' coins.';
  }

  function slotCost() {
    return 30 + (state.menuSlots - 5) * 18;
  }

  function buySlot() {
    var cost = slotCost();
    if (state.coins < cost) {
      showStatus('Not enough coins yet.');
      return;
    }
    state.coins -= cost;
    state.menuSlots += 1;
    saveAndRender('Bought a new menu slot!');
  }

  function renderThemes() {
    var container = $('theme-list');
    container.innerHTML = '';
    for (var i = 0; i < themes.length; i++) {
      var theme = themes[i];
      var owned = state.ownedThemes.indexOf(theme.id) !== -1;
      var current = state.currentTheme === theme.id;
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'theme-button';
      button.setAttribute('data-id', theme.id);
      button.innerHTML = '<strong>' + escapeHTML(theme.name) + '</strong><br><span>' + (owned ? (current ? 'Equipped' : 'Owned') : theme.cost + ' gems') + '</span>';
      button.addEventListener('click', function () { chooseTheme(this.getAttribute('data-id')); }, false);
      container.appendChild(button);
    }
  }

  function chooseTheme(id) {
    var theme = null;
    for (var i = 0; i < themes.length; i++) if (themes[i].id === id) theme = themes[i];
    if (!theme) return;
    if (state.ownedThemes.indexOf(id) === -1) {
      if (state.gems < theme.cost) {
        showStatus('Not enough gems for that color upgrade yet.');
        return;
      }
      state.gems -= theme.cost;
      state.ownedThemes.push(id);
    }
    state.currentTheme = id;
    saveAndRender('Restaurant colors changed.');
  }

  function exportSave() {
    var data = JSON.stringify(state, null, 2);
    $('save-text').value = data;
    var fileName = sanitizeFileName((state.restaurantName || 'Menu Menace') + ' - ' + (state.chefName || 'Chef')) + '.menu-menace-save.json';

    try {
      var blob = new Blob([data], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      showStatus('Save exported as ' + fileName + '.');
    } catch (err) {
      showStatus('Download was blocked, but your save text is in the text box. Copy it as a backup.');
    }
  }

  function copySaveText() {
    var box = $('save-text');
    if (!box.value) box.value = JSON.stringify(state, null, 2);
    box.focus();
    box.select();
    try {
      document.execCommand('copy');
      showStatus('Save text copied.');
    } catch (err) {
      showStatus('Copy may be blocked. You can manually select the text.');
    }
  }

  function importSaveFile(event) {
    var file = event.target.files && event.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      tryImportSave(reader.result);
      event.target.value = '';
    };
    reader.onerror = function () {
      showStatus('Could not read that save file.');
      event.target.value = '';
    };
    reader.readAsText(file);
  }

  function importSaveText() {
    var text = $('save-text').value.trim();
    if (!text) {
      showStatus('Paste save text into the box first.');
      return;
    }
    tryImportSave(text);
  }

  function tryImportSave(text) {
    try {
      var imported = JSON.parse(text);
      if (!imported || !Array.isArray(imported.dishes) || !Array.isArray(imported.ingredients) || !Array.isArray(imported.flavors)) {
        throw new Error('Not a Menu Menace save');
      }
      state = mergeWithBase(imported);
      sanitizeStateAfterChanges();
      saveAndRender('Save imported! Welcome back to ' + (state.restaurantName || 'Menu Menace') + '.');
    } catch (err) {
      showStatus('That does not look like a valid Menu Menace save.');
    }
  }

  function resetStarter() {
    var ok = window.confirm('Reset to the spaghetti starter? This clears this browser\'s current Menu Menace save. Export first if you want to keep it.');
    if (!ok) return;
    state = starterState(false);
    saveAndRender('Reset to the spaghetti starter.');
    switchTab('front');
  }

  function startBlank() {
    var ok = window.confirm('Start totally blank? This removes every flavor, ingredient, and dish from this browser save. Export first if you want to keep it.');
    if (!ok) return;
    state = starterState(true);
    saveAndRender('Blank restaurant started. Add a flavor first.');
    switchTab('customize');
    openDetails('flavor-builder');
  }

  window.addEventListener('error', function (event) {
    showError('A script error happened: ' + event.message + '. Try opening index.html in Safari or Chrome from the unzipped folder.');
  });

  document.addEventListener('DOMContentLoaded', init, false);
})();
