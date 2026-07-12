(function () {
  'use strict';

  var SAVE_KEY = 'menu-menace-v5-details-editors';
  var VERSION = 5;
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
    'The {F} of the {DISH} is perfect for this dish.',
    'I really like how the {F} and {F2} complement each other.',
    'The {DISH} is really {DE}. I like it!',
    'The {DISH} is really {F}-forward. Great job.',
    'Ooh, so {DE}! Nice!',
    'I think your {DISH} is kinda {DE}. It is a little unusual, but it works so well.',
    'I like how it is not too {LOW_DE}. Good job.',
    'The {F} really stood out in this dish and it balances well with the {I}.'
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
    { id: 'night', name: 'Night Market', cost: 8 }
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
      { id: 'spaghetti', name: 'spaghetti', category: 'Classics', kind: 'collective', price: 20, icon: '🍝', base: ['pasta', 'tomato-sauce', 'herbs'], optional: [] }
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

    if (state.currentOrder && dishIds.indexOf(state.currentOrder.dishId) === -1) {
      state.currentOrder = null;
      state.pot = [];
    }

    if (state.currentOrder) {
      state.currentOrder.required = (state.currentOrder.required || []).filter(function (id) { return ingredientIds.indexOf(id) !== -1; });
      state.currentOrder.excluded = (state.currentOrder.excluded || []).filter(function (id) { return ingredientIds.indexOf(id) !== -1; });
    }

    if (state.currentTrendId && !getFlavor(state.currentTrendId)) {
      state.currentTrendId = state.flavors.length ? state.flavors[0].id : null;
    }
  }

  function renderAll() {
    renderStatsAndHeader();
    renderTrend();
    renderOrder();
    renderMenu();
    renderKitchen();
    renderCustomize();
    renderCosmetics();
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
  }

  function applyTheme() {
    document.body.className = '';
    if (state.currentTheme && state.currentTheme !== 'classic') {
      document.body.classList.add('theme-' + state.currentTheme);
    }
  }

  function maybeRefreshTrend() {
    var fifteenMinutes = 15 * 60 * 1000;
    if (!state.flavors.length) {
      state.currentTrendId = null;
      return;
    }
    if (!state.currentTrendId || !state.trendStartedAt || Date.now() - state.trendStartedAt >= fifteenMinutes) {
      state.manualRerolls = 0;
      chooseNewTrend(false, '');
    }
  }

  function trendRerollCost() {
    var rerolls = Math.max(0, state.manualRerolls || 0);
    return {
      gems: 2 + Math.floor(rerolls / 2),
      coins: 120 + rerolls * 80
    };
  }

  function rerollTrend() {
    if (!state.flavors.length) {
      showStatus('Create a flavor first, then trends can start.');
      switchTab('customize');
      openDetails('flavor-builder');
      return;
    }
    if (state.flavors.length < 2) {
      showStatus('Add at least two flavors before rerolling trends.');
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
    chooseNewTrend(true, paid + ' New trend picked from your flavor profiles!');
  }

  function chooseNewTrend(showMessage, message) {
    if (!state.flavors.length) {
      state.currentTrendId = null;
      state.trendStartedAt = Date.now();
      saveAndRender(showMessage ? 'Create a flavor first, then trends can start.' : '');
      return;
    }

    var next = randomItem(state.flavors).id;
    if (state.flavors.length > 1) {
      while (next === state.currentTrendId) next = randomItem(state.flavors).id;
    }
    state.currentTrendId = next;
    state.trendStartedAt = Date.now();
    saveAndRender(showMessage ? (message || 'New trend picked from your flavor profiles!') : '');
  }

  function renderTrend() {
    var flavor = getFlavor(state.currentTrendId);
    var rerollButton = $('reroll-trend');
    var cost = trendRerollCost();
    if (rerollButton) {
      rerollButton.textContent = 'Reroll (' + cost.gems + ' gems / ' + cost.coins + ' coins)';
      rerollButton.disabled = state.flavors.length < 2;
    }
    if (!flavor) {
      $('trend-text').textContent = 'No trend yet';
      $('trend-help').textContent = 'Create at least one flavor profile in Build to start trends.';
      return;
    }
    $('trend-text').textContent = flavor.descriptor + ' dishes';
    $('trend-help').textContent = 'A dish with at least 50% ' + flavor.form + ' gets a bonus tip. Manual rerolls get more expensive until the next timed trend.';
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

    var dish = randomItem(state.dishes);
    var base = Array.isArray(dish.base) ? dish.base.slice() : [];
    var optional = Array.isArray(dish.optional) ? dish.optional.slice() : [];
    var recipeIngredients = unique(base.concat(optional));
    var required = [];
    var excluded = [];
    var weirdAdd = false;

    if (optional.length > 0 && Math.random() < 0.55) {
      required.push(randomItem(optional));
    }

    if (recipeIngredients.length > 0 && Math.random() < 0.35) {
      var avoidPool = recipeIngredients.filter(function (id) { return required.indexOf(id) === -1; });
      if (avoidPool.length) excluded.push(randomItem(avoidPool));
    }

    var outside = state.ingredients.map(function (x) { return x.id; }).filter(function (id) {
      return recipeIngredients.indexOf(id) === -1;
    });
    if (outside.length > 0 && Math.random() < 0.08) {
      required.push(randomItem(outside));
      weirdAdd = true;
    }

    var order = {
      id: 'order-' + Date.now(),
      dishId: dish.id,
      required: unique(required),
      excluded: unique(excluded),
      weirdAdd: weirdAdd,
      text: ''
    };
    order.text = buildOrderText(order);
    state.currentOrder = order;
    state.lastReward = null;
    state.pot = [];
    saveAndRender('New customer at the counter!');
    showCustomerBubble(order.text, null);
  }

  function buildOrderText(order) {
    var dish = getDish(order.dishId);
    var required = order.required || [];
    var excluded = order.excluded || [];
    var withText = listIngredientNames(required, true);
    var withoutText = listIngredientNames(excluded, true);
    var dishText = dishPhrase(dish);

    var plainTemplates = [
      'Hello, {M}! Can I get {DISH} please? Thanks!',
      'I just want {DISH}. That is all.',
      'I\'ll just have {DISH} and I\'ll get outta your hair.',
      'I would give you my {BODY_PART} if I could have {DISH}.',
      'Hi there, dear! May I please have {DISH}?'
    ];
    var withTemplates = [
      'Hello! I\'d like {DISH} with {WITH}, please.',
      'Heya friend! Could I please have {DISH} with {WITH}?',
      'May I please have {DISH}? I would appreciate it if you added {WITH}.',
      'Hi, umm, like can I get {DISH} with {WITH} on that?'
    ];
    var withoutTemplates = [
      'Hello! I\'d like {DISH} with no {WITHOUT}, please.',
      'Please, just don\'t put {WITHOUT} on my {DISH}.',
      'Hi there, dear! May I please have {DISH} without {WITHOUT}?'
    ];
    var bothTemplates = [
      'My order might seem a bit complicated, but I would love {DISH} with {WITH} and no {WITHOUT}.',
      'Could I get {DISH} with {WITH}, but without {WITHOUT}? Thanks!'
    ];
    var weirdTemplates = [
      'I know this sounds strange, but can I have {DISH} with {WITH}? I just want to try something weird.',
      'This might be a chaotic order, but could you add {WITH} to {DISH}?'
    ];

    var template;
    if (order.weirdAdd && required.length) template = randomItem(weirdTemplates);
    else if (required.length && excluded.length) template = randomItem(bothTemplates);
    else if (required.length) template = randomItem(withTemplates);
    else if (excluded.length) template = randomItem(withoutTemplates);
    else template = randomItem(plainTemplates);

    return template
      .replace(/\{M\}/g, state.chefName || 'Chef')
      .replace(/\{DISH\}/g, dishText)
      .replace(/\{WITH\}/g, withText)
      .replace(/\{WITHOUT\}/g, withoutText)
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
    body.innerHTML = '<p><strong>Wording:</strong> ' + escapeHTML(dishPhrase(dish)) + '</p>' +
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
      edit.addEventListener('click', function () { editDish(this.getAttribute('data-id')); }, false);
      actions.appendChild(edit);
      var remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'danger compact';
      remove.textContent = 'Remove dish';
      remove.setAttribute('data-id', dish.id);
      remove.addEventListener('click', function () { removeDish(this.getAttribute('data-id')); }, false);
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
    state.pot = expectedIngredients(state.currentOrder).slice();
    saveAndRender('Recipe base added to the pot.');
  }

  function expectedIngredients(order) {
    var dish = getDish(order.dishId);
    var base = dish && Array.isArray(dish.base) ? dish.base.slice() : [];
    var required = order && Array.isArray(order.required) ? order.required.slice() : [];
    return unique(base.concat(required)).filter(function (id) { return (order.excluded || []).indexOf(id) === -1; });
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
    var missing = [];
    var extras = [];
    var i;

    for (i = 0; i < expected.length; i++) if (pot.indexOf(expected[i]) === -1) missing.push(expected[i]);
    for (i = 0; i < pot.length; i++) if (expected.indexOf(pot[i]) === -1 || excluded.indexOf(pot[i]) !== -1) extras.push(pot[i]);

    var mistakeCount = missing.length + extras.length;
    var basePay = dish ? Number(dish.price) || 20 : 20;
    var ingredientPay = pot.length * 5;
    var trendBonus = isTrendingDish(pot) ? Math.ceil(basePay * 0.35) : 0;
    var deduction = Math.min(0.55, mistakeCount * 0.15);
    var total = Math.max(1, Math.round((basePay + ingredientPay + trendBonus) * (1 - deduction)));
    var xpGain = Math.max(5, Math.round(8 + pot.length * 3 - mistakeCount));

    var oldLevel = state.level || 1;
    var oldGems = state.gems || 0;
    state.coins += total;
    gainXP(xpGain);

    var reward = {
      coins: total,
      xp: xpGain,
      gems: Math.max(0, (state.gems || 0) - oldGems),
      levels: Math.max(0, (state.level || 1) - oldLevel),
      trendBonus: trendBonus,
      missing: missing.length,
      extras: unique(extras).length
    };
    var feedback = buildFeedback(dish, pot, missing, extras);
    state.currentOrder = null;
    state.pot = [];
    saveAndRender('Served! Check the customer bubble for feedback and rewards.');
    showCustomerBubble(feedback, reward);
    switchTab('front');
  }

  function isTrendingDish(pot) {
    if (!state.currentTrendId) return false;
    var finalFlavors = finalFlavorProfile(pot);
    return (finalFlavors[state.currentTrendId] || 0) >= 50;
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

  function buildFeedback(dish, pot, missing, extras) {
    var finalFlavors = finalFlavorProfile(pot);
    var sorted = Object.keys(finalFlavors).sort(function (a, b) { return finalFlavors[b] - finalFlavors[a]; });
    var top = getFlavor(sorted[0]);
    var second = getFlavor(sorted[1]) || top;
    var low = findLowFlavor(finalFlavors) || top;
    var hasMistakes = missing.length || extras.length;
    var template = randomItem(hasMistakes ? critiqueTemplates : positiveTemplates);
    var ingredientId = missing[0] || extras[0] || pot[0] || randomOptionalIngredient(dish);
    var message = template
      .replace(/\{DISH\}/g, dishPlain(dish))
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
    state.dishes.push({ id: id, name: name, category: category, kind: kind, price: price, icon: icon, base: base, optional: optional });
    $('new-dish-name').value = '';
    $('new-dish-icon').value = '';
    $('new-dish-category').value = '';
    $('new-dish-price').value = '25';
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
    addNumberField(form, 'edit-dish-price', 'Price in coins', dish.price || 20, 1, null);
    var baseSet = addModalFieldset(form, 'Base recipe');
    addIngredientCheckboxes(baseSet, 'edit-dish-base-check', dish.base || []);
    var optSet = addModalFieldset(form, 'Optional ingredients customers may request');
    addIngredientCheckboxes(optSet, 'edit-dish-optional-check', dish.optional || []);
    var note = document.createElement('p');
    note.className = 'muted small-text';
    note.textContent = 'Tip: “with no” orders only use ingredients in this dish. Weird add-on orders are rare and say they are weird.';
    form.appendChild(note);
    openEditor('Edit dish details', form, function () {
      var name = $('edit-dish-name').value.trim();
      var icon = $('edit-dish-icon').value.trim();
      var category = $('edit-dish-category').value.trim() || 'Menu';
      var kind = $('edit-dish-kind').value === 'collective' ? 'collective' : 'single';
      var price = Math.max(1, Math.round(Number($('edit-dish-price').value) || dish.price || 20));
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
    if (state.currentOrder && state.currentOrder.dishId === id) {
      state.currentOrder = null;
      state.pot = [];
    }
    saveAndRender('Dish removed.');
  }

  function renderCosmetics() {
    renderThemes();
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
