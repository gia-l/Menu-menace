(function () {
  'use strict';

  var SAVE_KEY = 'menu-menace-folder-build-v1';
  var VERSION = 1;

  var state = null;
  var saveAvailable = true;

  var orderTemplates = [
    'Hello, {M}! Can I get {DI} please? Thanks!',
    'Hello! I\'d like {DI} with no {IC} please.',
    'Heya friend! Could I please have {DC}{WITH_PART}?',
    'I\'ll have {DISH}{WITH_PART}.',
    'May I please have {DI}, and I would appreciate it if you added {IC} to it. Thank you kindly.',
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
    'I think your {DISH} is kinda {DE}. It is a bit unusual, but somehow it is the best thing on the menu!',
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
    { id: 'night', name: 'Night Market', cost: 8 }
  ];

  function defaultState() {
    return {
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
      currentTrendId: 'spicy',
      trendStartedAt: Date.now(),
      currentOrder: null,
      dialogueText: '',
      dialogueHidden: true,
      pot: [],
      flavors: [
        { id: 'sweet', descriptor: 'sweet', form: 'sweetness' },
        { id: 'savory', descriptor: 'savory', form: 'savory flavor' },
        { id: 'spicy', descriptor: 'spicy', form: 'heat' },
        { id: 'salty', descriptor: 'salty', form: 'saltiness' },
        { id: 'earthy', descriptor: 'earthy', form: 'earthiness' },
        { id: 'magical', descriptor: 'magical', form: 'magic' }
      ],
      ingredients: [
        { id: 'dough', name: 'dough', collective: 'dough', flavors: { savory: 70, salty: 15 } },
        { id: 'sauce', name: 'tomato sauce', collective: 'tomato sauce', flavors: { savory: 55, sweet: 25, salty: 10 } },
        { id: 'cheese', name: 'cheese', collective: 'cheese', flavors: { savory: 45, salty: 35 } },
        { id: 'pepperoni', name: 'pepperoni', collective: 'pepperoni slices', flavors: { savory: 35, spicy: 45, salty: 20 } },
        { id: 'bun', name: 'bun', collective: 'buns', flavors: { savory: 45, sweet: 15 } },
        { id: 'patty', name: 'burger patty', collective: 'burger patties', flavors: { savory: 85, salty: 15 } },
        { id: 'pickles', name: 'pickle', collective: 'pickles', flavors: { salty: 55, earthy: 20 } },
        { id: 'lettuce', name: 'lettuce', collective: 'lettuce', flavors: { earthy: 65 } },
        { id: 'frosting', name: 'frosting', collective: 'frosting', flavors: { sweet: 90, magical: 10 } },
        { id: 'sprinkles', name: 'sprinkle', collective: 'sprinkles', flavors: { sweet: 60, magical: 40 } }
      ],
      dishes: [
        { id: 'pizza', name: 'pizza', category: 'Classics', kind: 'collective', price: 28, base: ['dough', 'sauce', 'cheese'], optional: ['pepperoni', 'sprinkles'] },
        { id: 'hamburger', name: 'hamburger', category: 'Classics', kind: 'single', price: 25, base: ['bun', 'patty'], optional: ['cheese', 'pickles', 'lettuce'] },
        { id: 'magic-cupcake', name: 'magic cupcake', category: 'Desserts', kind: 'single', price: 22, base: ['frosting', 'sprinkles'], optional: ['cheese'] }
      ]
    };
  }

  function $(id) {
    return document.getElementById(id);
  }

  function on(id, eventName, handler) {
    var el = $(id);
    if (el) {
      el.addEventListener(eventName, handler, false);
    }
  }

  function safeText(value) {
    if (value === null || value === undefined) return '';
    return String(value);
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

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function showStatus(message) {
    var el = $('status-message');
    if (!el) return;
    el.textContent = message;
    window.clearTimeout(showStatus.timer);
    showStatus.timer = window.setTimeout(function () {
      el.textContent = '';
    }, 4500);
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
      state = defaultState();
      return;
    }

    try {
      state = mergeWithDefaults(JSON.parse(loaded));
    } catch (err2) {
      state = defaultState();
      showError('Your old save could not be loaded, so Menu Menace started fresh. You can still import a save file from Settings.');
    }
  }

  function mergeWithDefaults(saved) {
    var base = defaultState();
    if (!saved || typeof saved !== 'object') return base;

    var merged = base;
    var keys = Object.keys(saved);
    for (var i = 0; i < keys.length; i++) {
      merged[keys[i]] = saved[keys[i]];
    }

    if (!Array.isArray(merged.flavors) || merged.flavors.length === 0) merged.flavors = base.flavors;
    if (!Array.isArray(merged.ingredients) || merged.ingredients.length === 0) merged.ingredients = base.ingredients;
    if (!Array.isArray(merged.dishes) || merged.dishes.length === 0) merged.dishes = base.dishes;
    if (!Array.isArray(merged.ownedThemes) || merged.ownedThemes.length === 0) merged.ownedThemes = ['classic'];
    if (!Array.isArray(merged.pot)) merged.pot = [];
    if (typeof merged.dialogueText !== 'string') merged.dialogueText = '';
    if (typeof merged.dialogueHidden !== 'boolean') merged.dialogueHidden = true;
    if (!merged.currentTheme) merged.currentTheme = 'classic';
    if (!merged.currentTrendId) merged.currentTrendId = merged.flavors[0].id;
    if (!merged.trendStartedAt) merged.trendStartedAt = Date.now();
    return merged;
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

    on('reroll-trend', 'click', function () { chooseNewTrend(true); });
    on('new-customer', 'click', newCustomer);
    on('go-kitchen', 'click', function () { switchTab('kitchen'); });
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
    on('reset-game', 'click', resetGame);

    var importInput = $('import-save');
    if (importInput) {
      importInput.addEventListener('change', importSaveFile, false);
    }

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

  function switchTab(tabId) {
    var panels = document.querySelectorAll('.tab-panel');
    var i;
    for (i = 0; i < panels.length; i++) {
      panels[i].hidden = panels[i].id !== tabId;
    }

    var buttons = document.querySelectorAll('.tab-button');
    for (i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute('aria-selected', buttons[i].getAttribute('data-tab') === tabId ? 'true' : 'false');
    }
  }

  function saveAndRender(message) {
    hideError();
    saveGame();
    renderAll();
    if (message) showStatus(message);
  }

  function renderAll() {
    renderStatsAndHeader();
    renderTrend();
    renderOrder();
    renderMenu();
    renderKitchen();
    renderCustomize();
    renderThemes();
    applyTheme();
  }

  function renderStatsAndHeader() {
    $('game-title').textContent = state.restaurantName || 'Menu Menace';
    $('chef-line').textContent = 'Chef: ' + (state.chefName || 'Chef');
    $('coins-stat').textContent = Math.floor(state.coins);
    $('gems-stat').textContent = Math.floor(state.gems);
    $('level-stat').textContent = state.level;
    $('xp-stat').textContent = state.xp + ' / ' + xpToNextLevel();
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
    if (!state.trendStartedAt || Date.now() - state.trendStartedAt >= fifteenMinutes) {
      chooseNewTrend(false);
    }
  }

  function chooseNewTrend(showMessage) {
    if (!state.flavors.length) return;
    var next = randomItem(state.flavors).id;
    if (state.flavors.length > 1) {
      while (next === state.currentTrendId) {
        next = randomItem(state.flavors).id;
      }
    }
    state.currentTrendId = next;
    state.trendStartedAt = Date.now();
    saveAndRender(showMessage ? 'New trend picked!' : '');
  }

  function renderTrend() {
    var flavor = getFlavor(state.currentTrendId) || state.flavors[0];
    $('trend-text').textContent = flavor ? flavor.descriptor + ' dishes' : 'anything delicious';
  }

  function getFlavor(id) {
    for (var i = 0; i < state.flavors.length; i++) {
      if (state.flavors[i].id === id) return state.flavors[i];
    }
    return null;
  }

  function getIngredient(id) {
    for (var i = 0; i < state.ingredients.length; i++) {
      if (state.ingredients[i].id === id) return state.ingredients[i];
    }
    return null;
  }

  function getDish(id) {
    for (var i = 0; i < state.dishes.length; i++) {
      if (state.dishes[i].id === id) return state.dishes[i];
    }
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

  function articleFor(word) {
    var first = safeText(word).trim().charAt(0).toLowerCase();
    return 'aeiou'.indexOf(first) >= 0 ? 'an' : 'a';
  }

  function newCustomer() {
    if (state.dishes.length === 0) {
      showStatus('Add a dish first so customers have something to order.');
      switchTab('customize');
      return;
    }

    var dish = randomItem(state.dishes);
    var required = [];
    var excluded = [];
    var optional = Array.isArray(dish.optional) ? dish.optional.slice() : [];

    if (optional.length > 0 && Math.random() < 0.65) {
      required.push(randomItem(optional));
    }
    if (optional.length > 0 && Math.random() < 0.45) {
      var avoid = randomItem(optional);
      if (required.indexOf(avoid) === -1) excluded.push(avoid);
    }

    var order = {
      id: 'order-' + Date.now(),
      dishId: dish.id,
      required: unique(required),
      excluded: unique(excluded),
      text: ''
    };
    order.text = buildOrderText(order);
    state.currentOrder = order;
    state.pot = [];
    saveAndRender('New customer at the counter!');
    showCustomerBubble(order.text);
  }

  function buildOrderText(order) {
    var dish = getDish(order.dishId);
    var template = randomItem(orderTemplates);
    var required = order.required || [];
    var excluded = order.excluded || [];
    var req1 = required.length ? required[0] : randomOptionalIngredient(dish);
    var req2 = required.length > 1 ? required[1] : randomOptionalIngredient(dish, req1);
    var exc1 = excluded.length ? excluded[0] : randomOptionalIngredient(dish, req1);
    var exc2 = excluded.length > 1 ? excluded[1] : randomOptionalIngredient(dish, exc1);
    var withPart = required.length ? ' with ' + ingredientName(required[0], true) : '';
    var withoutPart = excluded.length ? ' without ' + ingredientName(excluded[0], true) : '';

    return template
      .replace(/\{M\}/g, state.chefName || 'Chef')
      .replace(/\{DI\}/g, dishPhrase(dish))
      .replace(/\{DC\}/g, dish.kind === 'collective' ? dishPhrase(dish) : dish.name)
      .replace(/\{DISH\}/g, dishPhrase(dish))
      .replace(/\{I\}/g, ingredientName(req1, false))
      .replace(/\{I2\}/g, ingredientName(req2, false))
      .replace(/\{IC\}/g, ingredientName(req1, true))
      .replace(/\{IC2\}/g, ingredientName(exc2, true))
      .replace(/\{WITH_PART\}/g, withPart)
      .replace(/\{WITHOUT_PART\}/g, withoutPart)
      .replace(/\{BODY_PART\}/g, randomItem(bodyParts));
  }

  function randomOptionalIngredient(dish, notThis) {
    var pool = dish && Array.isArray(dish.optional) && dish.optional.length ? dish.optional.slice() : [];
    if (pool.length === 0) pool = state.ingredients.map(function (x) { return x.id; });
    if (notThis && pool.length > 1) {
      pool = pool.filter(function (id) { return id !== notThis; });
    }
    return randomItem(pool);
  }

  function unique(list) {
    var result = [];
    for (var i = 0; i < list.length; i++) {
      if (result.indexOf(list[i]) === -1) result.push(list[i]);
    }
    return result;
  }

  function showCustomerBubble(text) {
    state.dialogueText = text || '';
    state.dialogueHidden = false;
    saveGame();
    renderDialogue();
  }

  function renderDialogue() {
    var bubble = $('customer-bubble');
    var text = $('customer-text');
    if (!state.dialogueText || state.dialogueHidden) {
      bubble.hidden = true;
      text.textContent = '';
      return;
    }
    text.textContent = state.dialogueText;
    bubble.hidden = false;
  }

  function renderOrder() {
    $('no-order-text').hidden = !!state.currentOrder;
    renderDialogue();
  }

  function renderMenu() {
    var container = $('menu-list');
    container.innerHTML = '';
    if (!state.dishes.length) {
      container.textContent = 'Your menu is empty. Add a dish in Customize.';
      return;
    }

    var grouped = {};
    for (var i = 0; i < state.dishes.length; i++) {
      var dish = state.dishes[i];
      var cat = dish.category || 'Menu';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(dish);
    }

    var cats = Object.keys(grouped).sort();
    for (var c = 0; c < cats.length; c++) {
      var section = document.createElement('section');
      section.className = 'dish-card';
      var h = document.createElement('h3');
      h.textContent = cats[c];
      section.appendChild(h);

      for (var d = 0; d < grouped[cats[c]].length; d++) {
        var item = grouped[cats[c]][d];
        var p = document.createElement('p');
        var baseNames = item.base.map(function (id) { return ingredientName(id, true); }).join(', ');
        var optionalNames = item.optional.map(function (id) { return ingredientName(id, true); }).join(', ');
        p.innerHTML = '<strong>' + escapeHTML(item.name) + '</strong><br>Price: ' + item.price + ' coins<br>Base: ' + escapeHTML(baseNames || 'nothing yet') + '<br>Optional: ' + escapeHTML(optionalNames || 'none');
        section.appendChild(p);
      }
      container.appendChild(section);
    }
  }

  function escapeHTML(text) {
    return safeText(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
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
      text.textContent = 'No active order yet. Go to Front Counter and invite a customer.';
      return;
    }

    var dish = getDish(state.currentOrder.dishId);
    var expected = expectedIngredients(state.currentOrder);
    var excluded = state.currentOrder.excluded || [];
    text.textContent = state.currentOrder.text;

    var html = '<h3>Recipe helper</h3><ul>';
    html += '<li>Main dish: ' + escapeHTML(dishPhrase(dish)) + '</li>';
    html += '<li>Needed: ' + escapeHTML(expected.map(function (id) { return ingredientName(id, true); }).join(', ')) + '</li>';
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
      tag.textContent = ingredientName(id, false) + ' ';
      var remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'small';
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
    for (var i = 0; i < state.ingredients.length; i++) {
      var ingredient = state.ingredients[i];
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ingredient-card';
      btn.draggable = true;
      btn.setAttribute('data-id', ingredient.id);
      btn.innerHTML = '<strong>' + escapeHTML(ingredient.name) + '</strong><br><span class="muted">' + escapeHTML(flavorSummary(ingredient.flavors)) + '</span>';
      btn.addEventListener('click', function () {
        addToPot(this.getAttribute('data-id'));
      }, false);
      btn.addEventListener('dragstart', function (event) {
        event.dataTransfer.setData('text/plain', this.getAttribute('data-id'));
      }, false);
      container.appendChild(btn);
    }
  }

  function flavorSummary(flavorMap) {
    var parts = [];
    var normalized = normalizeFlavorMap(flavorMap || {});
    var keys = Object.keys(normalized).sort(function (a, b) { return normalized[b] - normalized[a]; });
    for (var i = 0; i < keys.length && i < 3; i++) {
      var flavor = getFlavor(keys[i]);
      if (flavor && normalized[keys[i]] > 0) {
        parts.push(flavor.descriptor + ' ' + Math.round(normalized[keys[i]]) + '%');
      }
    }
    return parts.length ? parts.join(', ') : 'neutral';
  }

  function normalizeFlavorMap(map) {
    var result = {};
    var total = 0;
    var keys = Object.keys(map);
    for (var i = 0; i < keys.length; i++) {
      var amount = Number(map[keys[i]]) || 0;
      if (amount > 0) total += amount;
    }
    if (total <= 0) return result;
    for (var j = 0; j < keys.length; j++) {
      var val = Number(map[keys[j]]) || 0;
      if (val > 0) result[keys[j]] = (val / total) * 100;
    }
    return result;
  }

  function addToPot(id) {
    if (!getIngredient(id)) return;
    state.pot.push(id);
    saveAndRender(ingredientName(id, false) + ' added to the pot.');
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
    return unique(base.concat(required));
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

    for (i = 0; i < expected.length; i++) {
      if (pot.indexOf(expected[i]) === -1) missing.push(expected[i]);
    }

    for (i = 0; i < pot.length; i++) {
      if (expected.indexOf(pot[i]) === -1 || excluded.indexOf(pot[i]) !== -1) extras.push(pot[i]);
    }

    var mistakeCount = missing.length + extras.length;
    var basePay = Number(dish.price) || 20;
    var ingredientPay = pot.length * 5;
    var trendBonus = isTrendingDish(pot) ? Math.ceil(basePay * 0.35) : 0;
    var deduction = Math.min(0.55, mistakeCount * 0.15);
    var total = Math.max(1, Math.round((basePay + ingredientPay + trendBonus) * (1 - deduction)));
    var xpGain = Math.max(5, Math.round(8 + pot.length * 3 - mistakeCount));

    state.coins += total;
    gainXP(xpGain);

    var feedback = buildFeedback(dish, pot, missing, extras, total, xpGain, trendBonus);
    state.currentOrder = null;
    state.pot = [];
    saveAndRender('Customer paid ' + total + ' coins and you gained ' + xpGain + ' XP.');
    showCustomerBubble(feedback);
    switchTab('front');
  }

  function isTrendingDish(pot) {
    var finalFlavors = finalFlavorProfile(pot);
    return finalFlavors[state.currentTrendId] >= 50;
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
    for (var j = 0; j < finalKeys.length; j++) {
      totals[finalKeys[j]] = totals[finalKeys[j]] / count;
    }
    return totals;
  }

  function buildFeedback(dish, pot, missing, extras, total, xpGain, trendBonus) {
    var finalFlavors = finalFlavorProfile(pot);
    var sorted = Object.keys(finalFlavors).sort(function (a, b) { return finalFlavors[b] - finalFlavors[a]; });
    var top = getFlavor(sorted[0]) || state.flavors[0];
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

    var addOn = ' I paid ' + total + ' coins and you gained ' + xpGain + ' XP.';
    if (trendBonus > 0) addOn += ' Bonus tip because it matched today\'s trend!';
    if (missing.length) addOn += ' Missing: ' + missing.map(function (id) { return ingredientName(id, true); }).join(', ') + '.';
    if (extras.length) addOn += ' Extra/not requested: ' + unique(extras).map(function (id) { return ingredientName(id, true); }).join(', ') + '.';
    return message + addOn;
  }

  function findLowFlavor(finalFlavors) {
    for (var i = 0; i < state.flavors.length; i++) {
      var id = state.flavors[i].id;
      if (!finalFlavors[id] || finalFlavors[id] < 5) return state.flavors[i];
    }
    return null;
  }

  function xpToNextLevel() {
    return 30 + (state.level - 1) * 20;
  }

  function gainXP(amount) {
    state.xp += amount;
    var leveled = false;
    while (state.xp >= xpToNextLevel()) {
      state.xp -= xpToNextLevel();
      state.level += 1;
      state.gems += state.level;
      leveled = true;
    }
    if (leveled) {
      window.setTimeout(function () {
        showStatus('Level up! You are now level ' + state.level + ' and got ' + state.level + ' gems.');
      }, 100);
    }
  }

  function renderCustomize() {
    $('restaurant-name').value = state.restaurantName || 'Menu Menace';
    $('chef-name').value = state.chefName || 'Chef';
    $('slot-info').textContent = 'You are using ' + state.dishes.length + ' of ' + state.menuSlots + ' menu slots. Next slot costs ' + nextSlotCost() + ' coins.';
    $('buy-slot').disabled = state.coins < nextSlotCost();
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

  function nextSlotCost() {
    return 30 + (state.menuSlots - 5) * 20;
  }

  function buySlot() {
    var cost = nextSlotCost();
    if (state.coins < cost) {
      showStatus('Not enough coins for the next menu slot yet.');
      return;
    }
    state.coins -= cost;
    state.menuSlots += 1;
    saveAndRender('Bought a new menu slot!');
  }

  function renderFlavorList() {
    var container = $('flavor-list');
    container.innerHTML = '';
    for (var i = 0; i < state.flavors.length; i++) {
      var flavor = state.flavors[i];
      var div = document.createElement('div');
      div.className = 'pill';
      div.textContent = flavor.descriptor + ' / ' + flavor.form;
      container.appendChild(div);
    }
  }

  function addFlavor() {
    var descriptor = $('new-flavor-descriptor').value.trim().toLowerCase();
    var form = $('new-flavor-form').value.trim().toLowerCase();
    if (!descriptor || !form) {
      showStatus('Add both a descriptor and noun form.');
      return;
    }
    var id = slugify(descriptor);
    if (getFlavor(id)) {
      showStatus('That flavor already exists.');
      return;
    }
    state.flavors.push({ id: id, descriptor: descriptor, form: form });
    $('new-flavor-descriptor').value = '';
    $('new-flavor-form').value = '';
    saveAndRender('Flavor added.');
  }

  function renderIngredientFlavorInputs() {
    var container = $('ingredient-flavor-inputs');
    container.innerHTML = '';
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
    var name = $('new-ingredient-name').value.trim();
    var collective = $('new-ingredient-collective').value.trim() || name;
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
    state.ingredients.push({ id: id, name: name, collective: collective, flavors: flavors });
    $('new-ingredient-name').value = '';
    $('new-ingredient-collective').value = '';
    saveAndRender('Ingredient added.');
  }

  function uniqueId(base, existing) {
    var id = base;
    var n = 2;
    while (existing.indexOf(id) !== -1) {
      id = base + '-' + n;
      n++;
    }
    return id;
  }

  function renderIngredientManageList() {
    var container = $('ingredient-manage-list');
    container.innerHTML = '';
    for (var i = 0; i < state.ingredients.length; i++) {
      var ing = state.ingredients[i];
      var div = document.createElement('div');
      div.className = 'manage-item';
      div.innerHTML = '<strong>' + escapeHTML(ing.name) + '</strong><br><span class="muted">' + escapeHTML(flavorSummary(ing.flavors)) + '</span>';
      container.appendChild(div);
    }
  }

  function renderDishIngredientChecks() {
    var base = $('dish-base-ingredients');
    var optional = $('dish-optional-ingredients');
    base.innerHTML = '';
    optional.innerHTML = '';
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
    label.appendChild(document.createTextNode(ingredient.name));
    return label;
  }

  function addDish() {
    var name = $('new-dish-name').value.trim();
    var category = $('new-dish-category').value.trim() || 'Menu';
    var kind = $('new-dish-kind').value;
    var price = Math.max(1, Math.round(Number($('new-dish-price').value) || 20));
    if (!name) {
      showStatus('Name the dish first.');
      return;
    }
    if (state.dishes.length >= state.menuSlots) {
      showStatus('You need another menu slot before adding this dish.');
      return;
    }
    var base = checkedValues('.base-ingredient-check');
    var optional = checkedValues('.optional-ingredient-check');
    if (base.length === 0) {
      showStatus('Pick at least one base ingredient.');
      return;
    }
    optional = optional.filter(function (id) { return base.indexOf(id) === -1; });
    var id = uniqueId(slugify(name), state.dishes.map(function (x) { return x.id; }));
    state.dishes.push({ id: id, name: name, category: category, kind: kind, price: price, base: base, optional: optional });
    $('new-dish-name').value = '';
    $('new-dish-category').value = '';
    $('new-dish-price').value = '25';
    saveAndRender('Dish added to the menu.');
  }

  function checkedValues(selector) {
    var result = [];
    var checks = document.querySelectorAll(selector);
    for (var i = 0; i < checks.length; i++) {
      if (checks[i].checked) result.push(checks[i].value);
    }
    return result;
  }

  function renderDishManageList() {
    var container = $('dish-manage-list');
    container.innerHTML = '';
    for (var i = 0; i < state.dishes.length; i++) {
      var dish = state.dishes[i];
      var div = document.createElement('div');
      div.className = 'manage-item';
      var removeButton = '';
      if (state.dishes.length > 1) {
        removeButton = '<button type="button" class="small danger remove-dish-button" data-id="' + escapeHTML(dish.id) + '">Remove</button>';
      }
      div.innerHTML = '<strong>' + escapeHTML(dish.name) + '</strong><br><span class="muted">' + escapeHTML(dish.category || 'Menu') + ', ' + dish.price + ' coins</span><br>' + removeButton;
      container.appendChild(div);
    }

    var buttons = container.querySelectorAll('.remove-dish-button');
    for (var b = 0; b < buttons.length; b++) {
      buttons[b].addEventListener('click', function () {
        removeDish(this.getAttribute('data-id'));
      }, false);
    }
  }

  function removeDish(id) {
    if (state.dishes.length <= 1) {
      showStatus('Keep at least one dish on the menu.');
      return;
    }
    state.dishes = state.dishes.filter(function (dish) { return dish.id !== id; });
    if (state.currentOrder && state.currentOrder.dishId === id) {
      state.currentOrder = null;
      state.pot = [];
    }
    saveAndRender('Dish removed.');
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
      button.addEventListener('click', function () {
        chooseTheme(this.getAttribute('data-id'));
      }, false);
      container.appendChild(button);
    }
  }

  function chooseTheme(id) {
    var theme = null;
    for (var i = 0; i < themes.length; i++) {
      if (themes[i].id === id) theme = themes[i];
    }
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
      window.setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 1000);
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
      if (!imported || !imported.restaurantName || !Array.isArray(imported.dishes)) {
        throw new Error('Not a Menu Menace save');
      }
      state = mergeWithDefaults(imported);
      saveAndRender('Save imported! Welcome back to ' + state.restaurantName + '.');
    } catch (err) {
      showStatus('That does not look like a valid Menu Menace save.');
    }
  }

  function resetGame() {
    var ok = window.confirm('Reset Menu Menace in this browser? Export your save first if you want to keep it.');
    if (!ok) return;
    state = defaultState();
    try {
      window.localStorage.removeItem(SAVE_KEY);
    } catch (err) {}
    saveAndRender('Game reset.');
    switchTab('front');
  }

  window.addEventListener('error', function (event) {
    showError('A script error happened: ' + event.message + '. Try opening index.html in Safari or Chrome from the unzipped folder.');
  });

  document.addEventListener('DOMContentLoaded', init, false);
})();
