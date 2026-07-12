MENU MENACE
Welcome to Menu Menace, where you make your own rules.

Menu Menace is a tiny restaurant-building game where you invent the restaurant, the chef, the menu, the ingredients, the flavors, the prices, and the vibe. It can be a normal cafe, a pizza shop, a bakery, a magical tavern, a dragon diner, an elemental food lab, or something completely weird.

HOW TO PLAY
1. Open index.html in Safari, Chrome, Edge, or another modern browser.
2. Go to Build and make or edit flavor profiles, ingredients, and dishes.
3. Go to Counter and press New customer.
4. Read the order. The speech bubble stays until you close it.
5. Go to Kitchen and tap ingredients to add them to the pot.
6. Press Give to customer.
7. Earn coins and XP. Sometimes customers also give dish hearts.
8. Spend coins and gems in the Shop on menu slots, reputation upgrades, and cosmetics.
9. Check Stats to see your best dishes, hearts, stars, and restaurant progress.

THE BIG IDEA
You are not trying to follow a real recipe book. You are creating your restaurant's own logic.

A spaghetti dish can be normal: pasta, tomato sauce, herbs.
A magical burger can be: frozen beef, moon cheese, dragon jalapenos.
A dessert can be: cloud cream, starlight sugar, lavender crumble.
A drink can be: coffee, whipped cream, salted caramel foam.

Customers react to the ingredients and flavor profiles you create. If your restaurant has an elemental flavor called icy, customers can talk about iciness. If you make a flavor called dragonfire, customers can react to the dragonfire of a dish.

FLAVOR PROFILES
A flavor profile has two words:
- Descriptor: how it describes food, like sweet, fresh, smoky, magical, icy, earthy, crunchy, dragonfire, haunted, cozy.
- Noun form: the thing customers talk about, like sweetness, freshness, smoke, magic, iciness, earthiness, crunch, dragonfire, haunt, coziness.

Examples:
- savory / umami
- sweet / sweetness
- fresh / freshness
- spicy / heat
- magical / magic
- icy / iciness
- floral / floral notes
- stormy / storm energy
- dragonfire / dragonfire

INGREDIENTS
Ingredients can be anything your restaurant uses. They do not have to be realistic.

Category ideas:
- Staples: pasta, rice, bread, buns, tortillas, beef slices, tofu blocks.
- Sauces: tomato sauce, barbecue sauce, caramel drizzle, moon gravy.
- Seasonings: herbs, salt, pepper, cinnamon, dragon pepper dust.
- Toppings: cheese, sprinkles, pickles, berries, crystal flakes.
- Fillings: fruit filling, cream, mushrooms, lava beans.
- Magical ingredients: fairy sugar, haunted butter, glowing noodles, spell salt.
- Elemental ingredients: frozen hamburger, thunder sauce, fire jalapenos, ocean herbs.
- Weird ingredients: glitter crumbs, dream syrup, crunchy fog, tiny edible stars.

Icons are optional. You can put emojis on ingredients and dishes, like:
- spaghetti: 🍝
- tomato sauce: 🍅
- herbs: 🌿
- dragon pepper: 🌶️
- magic sugar: ✨

DISHES
A dish has:
- a name
- an optional icon
- a category
- a wording style
- a price
- base ingredients
- optional ingredients

Base ingredients are normally required. Optional ingredients are things customers may ask to add, remove, or make extra.

If a customer asks for extra pickles, put pickles in the pot twice.
If a customer asks for no herbs, do not put herbs in the pot.
If a customer asks for a weird add-on, the dialogue should make it clear that the request is strange on purpose.

PRICING
Each dish has an ideal price based on its ingredients. The price helper tells you whether a dish feels like:
- bargain: cheaper than ideal
- balanced: close to ideal
- fancy: more expensive than ideal

This is not meant to punish you. It just gives your restaurant more personality. A cheap dish might get bargain dialogue. A pricey dish might feel fancy.

TRENDS
The trend board only uses things that exist in your restaurant. Trends can be based on flavors, dishes, bargain dishes, or fancy dishes. If you never create spicy, spicy will not trend.

HEARTS, STARS, AND REPUTATION
Dishes can earn hearts when customers really love them. Hearts do not go down.
Your restaurant earns stars through progress, customers, and dish popularity.

As dishes get more hearts, customers may start saying things like they heard your sushi is popular or that your famous pie is worth trying. Higher reputation can also unlock special-feeling customers like local food critics.

SHOP AND COSMETICS
Use coins and gems to buy upgrades. Some upgrades are practical, like more menu slots or better heart chances. Some are cosmetic, like themes and backgrounds.

SAVE, EXPORT, AND IMPORT
The game autosaves in your browser.
You can export your restaurant as a save file. The filename uses your restaurant name and chef name, like:
Little Pizzeria - Maria.menu-menace-save.json

You can import that save later to continue playing or move your restaurant to another browser/device.

GITHUB PAGES
To host the game, upload index.html, style.css, script.js, and README.txt to a GitHub repository. Turn on GitHub Pages for the repo. If the old version still appears, refresh the page or clear the browser cache.

ACCESSIBILITY NOTES
- Dialogue does not disappear automatically.
- Most actions can be done by tapping buttons instead of dragging.
- Collapsible sections help keep the screen cleaner on phones and iPads.
- Emojis are optional, so ingredients and dishes still work with text only.


V8 dish flavor profiles
-----------------------
Dishes now have their own flavor profile, not just their ingredients.
When you create a dish, choose the base recipe ingredients and tap Analyze flavor profile. The game averages the ingredient flavor profiles into one normalized dish profile. For example, coffee might be strong and milk might be creamy, but the final drink can be tweaked so the recipe feels creamier or stronger depending on your restaurant rules.

When you open a dish in the menu or Build tab, you can now see its full flavor profile. Editing a dish lets you change the name, category, icon, price, recipe ingredients, optional ingredients, and final dish flavor profile in one popover.


Version 9 notes
---------------
- The extra top New Customer button was removed. Use the New Customer button inside the Counter screen.
- Dishes now show a full dish flavor profile in their details, not just ingredient profiles.
- When creating a dish, choose ingredients, tap Analyze flavor profile, then tweak the final recipe flavor profile before saving.
- Editing a dish opens the full details editor again, including price, category, ingredients, optional ingredients, and dish flavor profile.
- Existing v7/v8 browser saves are imported automatically when possible.

Version 10 notes
----------------
- The Use Recipe Base button now adds only the dish's base recipe. It does not automatically handle extras, weird add-ons, or hold/remove requests, so special orders take a little more player action.
- Dish trends are gentler now. A trending dish is more likely to appear, but it should not completely take over the customer line.
- Trends can occasionally have a second mini-trend, like a dish plus a pricing vibe.
- Trend descriptions are more flavorful and still explain what the trend does.
- Customer dialogue avoids saying "Chef Gia" or "Chef Chef". It uses the chef name more naturally.
