import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sops = [
  // ─── OPENING ────────────────────────────────────────────────────
  {
    title: "Morning Opening Procedure",
    category: "OPENING" as const,
    content: `<h2>Morning Opening Procedure</h2>
<p><strong>Purpose:</strong> Ensure the shop is fully operational and ready for customers each morning.</p>
<h3>Pre-Opening Checklist (60 min before open)</h3>
<ul>
<li>Unlock front door and disarm security system</li>
<li>Turn on all interior lights and signage</li>
<li>Check thermostat — set to 68–72°F</li>
<li>Inspect front-of-house: wipe counters, check seating area, clean glass</li>
<li>Verify POS system is powered on and functioning</li>
<li>Restock FOH supplies: napkins, bags, boxes, cups, lids, stirrers</li>
</ul>
<h3>Kitchen Startup (45 min before open)</h3>
<ul>
<li>Turn on fryers — set to 375°F. Allow 20 min to reach temperature</li>
<li>Start proofing cabinet — set to 95°F with humidity</li>
<li>Power on espresso machine — allow 30 min warm-up</li>
<li>Check walk-in cooler temperatures (log on temp sheet)</li>
<li>Pull today's prep items from walk-in (cream cheeses, fillings, toppings)</li>
</ul>
<h3>Production Startup (30 min before open)</h3>
<ul>
<li>Review today's par sheet and production targets</li>
<li>Begin cutting and proofing first batch of donuts</li>
<li>Prep breakfast sandwich components if applicable (egg squares, bacon, sausage)</li>
<li>Brew first batch of coffee</li>
<li>Set out today's donut trays in display case</li>
</ul>
<h3>Final Checks (5 min before open)</h3>
<ul>
<li>Verify display case is full and organized</li>
<li>Check that all prices are correct on menu board</li>
<li>Confirm all staff are in uniform and at stations</li>
<li>Unlock front door for customers</li>
</ul>`,
    createdBy: 1,
  },
  {
    title: "Fryer Startup Procedure",
    category: "OPENING" as const,
    content: `<h2>Fryer Startup Procedure</h2>
<p><strong>Purpose:</strong> Safely start up the fryer each morning for donut production.</p>
<h3>Steps</h3>
<ol>
<li><strong>Visual inspection:</strong> Check oil level. Oil should be at the fill line. If low, add shortening before heating.</li>
<li><strong>Check oil quality:</strong> Oil should be clear golden. If dark, foamy, or smells rancid — schedule an oil change before frying.</li>
<li><strong>Turn on fryer:</strong> Press the power button. Set temperature to <strong>375°F</strong>.</li>
<li><strong>Allow 20 minutes</strong> for oil to reach frying temperature.</li>
<li><strong>Verify temperature:</strong> Use a probe thermometer to confirm oil reads 370–380°F. Do not rely solely on the dial.</li>
<li><strong>Test fry:</strong> Drop one small piece of dough. It should float and begin browning within 30 seconds.</li>
</ol>
<h3>Safety Notes</h3>
<ul>
<li>Never add water or wet food to hot oil</li>
<li>Keep fryer basket and area dry at all times</li>
<li>Fire extinguisher must be within 10 feet</li>
<li>If oil smokes heavily at 375°F, shut down and change oil</li>
</ul>`,
    createdBy: 1,
  },

  // ─── CLOSING ────────────────────────────────────────────────────
  {
    title: "Evening Closing Procedure",
    category: "CLOSING" as const,
    content: `<h2>Evening Closing Procedure</h2>
<p><strong>Purpose:</strong> Secure the shop, clean all stations, and prepare for the next day.</p>
<h3>FOH Closing (Last Hour)</h3>
<ul>
<li>Begin winding down display — consolidate remaining donuts</li>
<li>Wipe down all counters, tables, and glass</li>
<li>Restock napkins, bags, and cups for morning</li>
<li>Empty trash and recycling</li>
<li>Clean and sanitize espresso machine steam wand</li>
</ul>
<h3>Kitchen Closing</h3>
<ul>
<li>Shut down fryers — turn off, cover with lid when cooled</li>
<li>Log oil condition (good / needs changing soon / change tomorrow)</li>
<li>Clean all prep surfaces with sanitizer</li>
<li>Store all perishable items in walk-in cooler</li>
<li>Label and date all stored items</li>
<li>Run dishwasher and empty / reload</li>
<li>Sweep and mop kitchen floor</li>
</ul>
<h3>End-of-Day Donut Waste Log</h3>
<ul>
<li>Count all remaining donuts by variety</li>
<li>Record waste quantities in the system (Donut Log → Waste)</li>
<li>Discard donuts — never save for next day</li>
</ul>
<h3>Final Close</h3>
<ul>
<li>Cash register: count drawer, reconcile with POS, record in system</li>
<li>Prepare cash drawer for next morning</li>
<li>Turn off all non-essential lights and equipment</li>
<li>Set thermostat to overnight setting</li>
<li>Lock back door, verify all windows secure</li>
<li>Arm security system</li>
<li>Lock front door</li>
</ul>`,
    createdBy: 1,
  },

  // ─── BOH ────────────────────────────────────────────────────────
  {
    title: "Donut Frying Procedure",
    category: "BOH" as const,
    content: `<h2>Donut Frying Procedure</h2>
<p><strong>Purpose:</strong> Produce consistently fried donuts with proper color, texture, and oil absorption.</p>
<h3>Setup</h3>
<ul>
<li>Fryer at <strong>375°F</strong> (verify with probe thermometer)</li>
<li>Proofed donuts ready — should be puffy, finger indent springs back slowly</li>
<li>Frying screens / spider ready</li>
<li>Cooling racks positioned next to fryer</li>
<li>Glaze and toppings staged and ready</li>
</ul>
<h3>Frying</h3>
<ol>
<li><strong>Gently lift</strong> proofed donuts from proofing tray — do not stretch or compress</li>
<li><strong>Place donuts top-side down</strong> into oil (the side that was facing up in the proofer hits the oil first)</li>
<li>Fry <strong>45–60 seconds per side</strong> — flip when golden brown on the bottom</li>
<li>Donuts should be <strong>golden to medium brown</strong> — not pale, not dark</li>
<li><strong>Lift from oil</strong> and drain briefly over fryer (5 seconds)</li>
<li>Place on cooling rack — let rest <strong>2–3 minutes</strong> before glazing</li>
</ol>
<h3>Temperature Guide</h3>
<ul>
<li><strong>375°F</strong> — standard for yeast donuts</li>
<li><strong>350–360°F</strong> — for cake donuts or heavier doughs</li>
<li>If donuts are absorbing too much oil → oil is too cold</li>
<li>If donuts are browning too fast with raw centers → oil is too hot</li>
</ul>
<h3>Batch Notes</h3>
<ul>
<li>Do not overcrowd the fryer — fry in manageable batches</li>
<li>Allow oil temperature to recover between batches (2–3 min)</li>
<li>Skim any floating debris between batches</li>
</ul>`,
    createdBy: 1,
  },
  {
    title: "Donut Cutting and Proofing",
    category: "BOH" as const,
    content: `<h2>Donut Cutting and Proofing</h2>
<p><strong>Purpose:</strong> Properly cut and proof donut dough for consistent sizing and texture.</p>
<h3>Cutting</h3>
<ol>
<li>Roll dough to <strong>uniform thickness</strong> (approx. ½ inch) on a floured surface</li>
<li>Use the standard donut cutter — <strong>do not twist</strong> the cutter (causes uneven frying)</li>
<li>Press straight down, lift straight up</li>
<li>Place cut donuts on a flour-dusted proofing tray or parchment</li>
<li>Cut holes from scraps — do not re-roll more than once</li>
</ol>
<h3>Proofing</h3>
<ol>
<li>Place trays in proofing cabinet set to <strong>95°F with humidity</strong></li>
<li>Proof for <strong>20–35 minutes</strong> — time varies by dough batch and room conditions</li>
<li>Do not over-proof — donuts will collapse in the fryer</li>
<li>Do not under-proof — donuts will be dense and oily</li>
</ol>
<h3>How to Tell When Proofed</h3>
<ul>
<li>Donut should be visibly puffed and airy</li>
<li>Press gently with fingertip — indent should <strong>spring back slowly</strong> (not immediately, not stay depressed)</li>
<li>Surface should look slightly dry, not wet or sticky</li>
</ul>
<h3>Troubleshooting</h3>
<ul>
<li><strong>Collapsing in fryer:</strong> Over-proofed. Reduce proof time.</li>
<li><strong>Dense and raw center:</strong> Under-proofed. Increase proof time.</li>
<li><strong>Irregular shape:</strong> Dough too warm during cutting. Chill briefly.</li>
<li><strong>Sticking to tray:</strong> Not enough flour dusting. Use more.</li>
</ul>`,
    createdBy: 1,
  },
  {
    title: "Glazing and Icing Procedures",
    category: "BOH" as const,
    content: `<h2>Glazing and Icing Procedures</h2>
<p><strong>Purpose:</strong> Apply glazes and icings consistently for quality presentation.</p>
<h3>Standard Glaze (Warm Donut Glaze)</h3>
<ol>
<li>Donuts should be glazed <strong>2–3 minutes after frying</strong> — warm but not hot</li>
<li>Dip donut top-side down into glaze</li>
<li>Lift and let excess drip off (2–3 seconds)</li>
<li>Place on rack glaze-side up</li>
<li>Allow glaze to set (5–10 minutes) before handling or moving to display</li>
</ol>
<h3>Chocolate Icing</h3>
<ol>
<li>Apply to <strong>completely cooled</strong> donuts (at least 15 min after frying)</li>
<li>Use a spatula or piping bag to spread/pipe an even layer</li>
<li>Thickness: enough to coat without dripping heavily</li>
<li>Add toppings (sprinkles, nuts, etc.) <strong>immediately</strong> before icing sets</li>
</ol>
<h3>Cream Filling (Filled Donuts)</h3>
<ol>
<li>Fill <strong>completely cooled</strong> donuts only</li>
<li>Use a piping bag with Bismarck tip (#230 or equivalent)</li>
<li>Insert tip into the side of the donut — pipe until donut feels heavy and full</li>
<li>Do not overfill — cream will burst out</li>
<li>Standard fill: approximately 2 oz per donut (varies by size)</li>
</ol>
<h3>General Tips</h3>
<ul>
<li>Keep glaze at working consistency — thin with warm water if too thick</li>
<li>Keep icings covered when not in use to prevent crusting</li>
<li>Cream-filled donuts should be refrigerated if not served within 4 hours</li>
<li>Never glaze a cold donut — glaze will not adhere properly</li>
</ul>`,
    createdBy: 1,
  },
  {
    title: "Batch Mixing — Large and Small Mixer",
    category: "BOH" as const,
    content: `<h2>Batch Mixing — Large and Small Mixer</h2>
<p><strong>Purpose:</strong> Produce consistent donut dough using the shop's two mixer sizes.</p>
<h3>Large Mixer (60-qt)</h3>
<ul>
<li>Used for: Full production batches of yeast donut dough</li>
<li>Capacity: Follow recipe scaling — do not exceed 75% of bowl volume</li>
<li>Speed: Start on LOW to incorporate, then shift to MEDIUM for gluten development</li>
</ul>
<h3>Small Mixer (20-qt)</h3>
<ul>
<li>Used for: Fillings, icings, cream cheeses, small-batch recipes, sandwich prep</li>
<li>Capacity: Do not exceed ⅔ of bowl volume</li>
<li>Speed: Follow individual recipe instructions</li>
</ul>
<h3>General Mixing Procedure</h3>
<ol>
<li><strong>Weigh all ingredients</strong> before starting — use the kitchen scale</li>
<li>Add wet ingredients to bowl first, then dry</li>
<li>Start on LOW speed — mix until ingredients are incorporated (no dry flour visible)</li>
<li>Increase speed as directed by recipe</li>
<li>Stop and scrape bowl as needed</li>
<li>Check dough: should be smooth, elastic, and slightly tacky (for yeast dough)</li>
<li>Dough temperature target: <strong>75–80°F</strong> after mixing</li>
</ol>
<h3>Safety</h3>
<ul>
<li>NEVER put hands in the bowl while mixer is running</li>
<li>Use bowl scraper only when mixer is STOPPED</li>
<li>Lock the bowl in place before starting</li>
<li>Do not leave mixer running unattended</li>
</ul>`,
    createdBy: 1,
  },
  {
    title: "Breakfast Sandwich Production",
    category: "BOH" as const,
    content: `<h2>Breakfast Sandwich Production</h2>
<p><strong>Purpose:</strong> Produce breakfast sandwiches efficiently and consistently.</p>
<h3>Component Prep</h3>
<p>See individual recipes: <strong>Egg Squares, Sausage Patties, Bacon</strong></p>
<h3>Assembly</h3>
<p><strong>Sausage, Egg & Cheese:</strong></p>
<ol>
<li>Toast sandwich roll (cut side up) until golden</li>
<li>Place 1 egg square on bottom half</li>
<li>Place 1 sausage patty on top of egg</li>
<li>Place 1 slice of cheddar cheese on top</li>
<li>Top with top half of roll</li>
<li>Wrap in foil or serve immediately</li>
</ol>
<p><strong>Bacon, Egg & Cheese:</strong></p>
<ol>
<li>Toast sandwich roll (cut side up) until golden</li>
<li>Place 1 egg square on bottom half</li>
<li>Place 1 bacon portion on top of egg</li>
<li>Place 1 slice of cheddar cheese on top</li>
<li>Top with top half of roll</li>
<li>Wrap in foil or serve immediately</li>
</ol>
<h3>Holding and Service</h3>
<ul>
<li>Hold assembled sandwiches in hot holding at <strong>135°F or above</strong></li>
<li>Maximum hold time: <strong>2 hours</strong> — then discard</li>
<li>Label and date all prepared components</li>
<li>Egg squares: refrigerate and use within <strong>3 days</strong></li>
<li>Pre-cooked bacon/sausage: refrigerate and use within <strong>5 days</strong></li>
</ul>`,
    createdBy: 1,
  },

  // ─── FOH ────────────────────────────────────────────────────────
  {
    title: "Espresso Machine Dial-In Procedure",
    category: "FOH" as const,
    content: `<h2>Espresso Machine Dial-In Procedure</h2>
<p><strong>Purpose:</strong> Dial in espresso shots each morning for optimal flavor and extraction.</p>
<h3>Daily Dial-In (Morning)</h3>
<ol>
<li>Ensure machine has been warming up for at least <strong>30 minutes</strong></li>
<li>Backflush with clean water (no Cafiza — that's weekly)</li>
<li>Run a blank shot into each group head to warm the portafilter</li>
<li><strong>Grind:</strong> Start with yesterday's grind setting</li>
<li><strong>Dose:</strong> 18g in a standard double basket</li>
<li><strong>Tamp:</strong> Level, firm, consistent pressure</li>
<li><strong>Extract:</strong> Target 36g out in <strong>25–30 seconds</strong></li>
<li><strong>Evaluate:</strong></li>
<ul>
<li>Too fast (&lt;20s) → grind finer</li>
<li>Too slow (&gt;35s) → grind coarser</li>
<li>Channeling → redistribute grounds (WDT) and tamp more evenly</li>
</ul>
<li>Repeat until shot time and taste are correct</li>
<li>Log the grind setting, dose, yield, and time in the <strong>Espresso Dial Log</strong></li>
</ol>
<h3>Taste Evaluation</h3>
<ul>
<li>Good shot: sweet, balanced, has body, pleasant crema</li>
<li>Under-extracted: sour, thin, quick</li>
<li>Over-extracted: bitter, harsh, slow</li>
</ul>
<h3>When to Re-Dial</h3>
<ul>
<li>Beginning of every shift</li>
<li>After changing beans or opening a new bag</li>
<li>Weather changes (humidity affects grind)</li>
<li>If customers report off-flavors</li>
</ul>`,
    createdBy: 1,
  },
  {
    title: "Drink Preparation Standards",
    category: "FOH" as const,
    content: `<h2>Drink Preparation Standards</h2>
<p><strong>Purpose:</strong> Ensure every drink is made to the same standard of quality.</p>
<h3>Espresso Drinks</h3>
<ul>
<li><strong>Espresso:</strong> 18g in, 36g out, 25–30 sec</li>
<li><strong>Americano:</strong> Double espresso + hot water to fill line</li>
<li><strong>Latte:</strong> Double espresso + steamed milk (8–12 oz depending on size)</li>
<li><strong>Cappuccino:</strong> Double espresso + equal parts steamed milk and foam</li>
<li><strong>Cold Brew:</strong> Pre-batched, served over ice. Do not dilute.</li>
</ul>
<h3>Steamed Milk Standards</h3>
<ol>
<li>Purge steam wand before and after each use</li>
<li>Use fresh, cold milk for each drink — never re-steam</li>
<li>Target temperature: <strong>140–150°F</strong> (do not exceed 160°F)</li>
<li>Texture: micro-foam, no large bubbles</li>
<li>Free-pour latte art when possible</li>
</ol>
<h3>Milk Options</h3>
<ul>
<li>Whole milk (default)</li>
<li>Oat milk (Califia Farms barista)</li>
<li>Almond milk (available upon request)</li>
<li>Half & half (for breve drinks only)</li>
</ul>
<h3>Other Drinks</h3>
<ul>
<li><strong>Hot chocolate:</strong> Use milk soft ganache + steamed milk</li>
<li><strong>Maple latte:</strong> Double espresso + maple syrup + steamed milk</li>
<li>All specialty drinks: follow the posted recipe cards</li>
</ul>`,
    createdBy: 1,
  },
  {
    title: "Customer Service Standards",
    category: "FOH" as const,
    content: `<h2>Customer Service Standards</h2>
<p><strong>Purpose:</strong> Deliver a consistent, friendly, professional experience to every customer.</p>
<h3>Greeting</h3>
<ul>
<li>Acknowledge every customer within <strong>10 seconds</strong> of them approaching the counter</li>
<li>Standard greeting: "Hi! Welcome to Duffers. What can I get for you?"</li>
<li>Smile and make eye contact</li>
</ul>
<h3>Taking Orders</h3>
<ul>
<li>Repeat the order back to the customer</li>
<li>Ask about modifications (milk alternatives, sugar, etc.)</li>
<li>For donuts: point out what's available in the case — don't assume they know</li>
<li>Upsell when appropriate: "Would you like a coffee with that?"</li>
</ul>
<h3>Service</h3>
<ul>
<li>Calls by name when order is ready: "I've got a latte for [name]!"</li>
<li>Hand drinks and food directly to the customer — do not leave on the counter without calling</li>
<li>If there's a wait: "It'll be just a couple minutes — thank you for your patience"</li>
</ul>
<h3>Problem Resolution</h3>
<ul>
<li>If a customer is unhappy: <strong>listen first</strong>, apologize, then fix it</li>
<li>Remake drinks or replace donuts without charge — no argument</li>
<li>If a situation escalates: calmly involve the manager on duty</li>
<li>Never argue with a customer in front of other customers</li>
</ul>
<h3>Cleanliness</h3>
<ul>
<li>Wipe the counter between customers when possible</li>
<li>Keep the display case glass clean at all times</li>
<li>Buss tables promptly after customers leave</li>
</ul>`,
    createdBy: 1,
  },

  // ─── CLEANING ───────────────────────────────────────────────────
  {
    title: "Fryer Cleaning and Oil Change",
    category: "CLEANING" as const,
    content: `<h2>Fryer Cleaning and Oil Change</h2>
<p><strong>Purpose:</strong> Maintain fryer cleanliness and change oil on schedule for food quality and safety.</p>
<h3>Oil Change Schedule</h3>
<ul>
<li><strong>Standard:</strong> Every 5–7 days of use, or when oil shows signs of degradation</li>
<li><strong>Signs it's time:</strong> Dark color, foaming, smoke at normal temp, off-smell, food tastes off</li>
<li>Log all oil changes in the Maintenance Log</li>
</ul>
<h3>Oil Change Procedure</h3>
<ol>
<li><strong>Turn off fryer</strong> and allow oil to cool to below 150°F (about 1–2 hours)</li>
<li>Position the oil disposal container beneath the drain valve</li>
<li><strong>Open drain valve slowly</strong> — oil should flow smoothly</li>
<li>Once empty, close the drain valve</li>
<li><strong>Clean the fryer vat:</strong></li>
<ul>
<li>Scrub interior walls with fryer-safe brush and hot soapy water</li>
<li>Rinse thoroughly — <strong>no soap residue</strong></li>
<li>Dry completely with clean towels</li>
</ul>
<li><strong>Refill</strong> with fresh shortening to the fill line</li>
<li>Turn on and heat to 375°F</li>
<li>Log the change date in the system</li>
</ol>
<h3>Daily Maintenance</h3>
<ul>
<li>Skim oil surface between batches</li>
<li>Wipe down exterior after each shift</li>
<li>Check and clean fryer baskets</li>
</ul>
<h3>Safety</h3>
<ul>
<li>NEVER pour water into hot oil</li>
<li>Wear heat-resistant gloves when handling hot oil</li>
<li>Dispose of used oil in designated container — never down the drain</li>
</ul>`,
    createdBy: 1,
  },
  {
    title: "Kitchen Deep Clean Schedule",
    category: "CLEANING" as const,
    content: `<h2>Kitchen Deep Clean Schedule</h2>
<p><strong>Purpose:</strong> Maintain a clean, safe, and inspection-ready kitchen.</p>
<h3>Daily Tasks</h3>
<ul>
<li>Wipe down all prep surfaces with sanitizer (before and after each shift)</li>
<li>Clean cutting boards — sanitize after each use</li>
<li>Sweep and mop kitchen floor</li>
<li>Clean and sanitize sink</li>
<li>Empty and reline trash cans</li>
<li>Wipe down mixer exterior</li>
</ul>
<h3>Weekly Tasks (Sunday or Monday)</h3>
<ul>
<li>Clean and organize walk-in cooler shelves</li>
<li>Check and discard expired items (FIFO)</li>
<li>Deep clean fryer (see Fryer Cleaning SOP)</li>
<li>Clean behind and under all equipment</li>
<li>Descale espresso machine (if applicable)</li>
<li>Clean oven interiors</li>
<li>Sanitize all storage containers</li>
<li>Clean walls, light fixtures, and ventilation hood</li>
</ul>
<h3>Monthly Tasks</h3>
<ul>
<li>Pull out equipment and clean underneath/behind</li>
<li>Clean exhaust hood and filters</li>
<li>Inspect and clean floor drains</li>
<li>Deep clean proofing cabinet interior</li>
<li>Inventory and restock cleaning supplies</li>
</ul>
<h3>Cleaning Supplies Location</h3>
<ul>
<li>Sanitizer buckets: under the prep table</li>
<li>Mops and brooms: supply closet near back door</li>
<li>Cleaning chemicals: labeled shelf in storage area</li>
</ul>`,
    createdBy: 1,
  },
  {
    title: "Front of House Cleaning Checklist",
    category: "CLEANING" as const,
    content: `<h2>Front of House Cleaning Checklist</h2>
<p><strong>Purpose:</strong> Keep the customer-facing areas clean and welcoming at all times.</p>
<h3>Ongoing (Throughout Shift)</h3>
<ul>
<li>Wipe counter after each customer transaction</li>
<li>Keep display case glass spotless — clean smudges immediately</li>
<li>Buss tables within 2 minutes of customers leaving</li>
<li>Check and restock napkins, cups, lids, stirrers</li>
<li>Empty trash when ¾ full</li>
</ul>
<h3>End of Every Shift</h3>
<ul>
<li>Wipe down all tables and chairs</li>
<li>Clean espresso machine drip tray and steam wand</li>
<li>Wipe down pastry case interior glass</li>
<li>Clean and sanitize the counter</li>
<li>Sweep entrance and seating area floors</li>
<li>Restock all FOH supplies for next shift</li>
</ul>
<h3>Daily (Closing)</h3>
<ul>
<li>Mop entire FOH floor</li>
<li>Clean restroom(s) — toilet, sink, mirror, restock supplies</li>
<li>Empty all trash and recycling</li>
<li>Clean door glass and entry windows</li>
<li>Wipe down menu boards</li>
</ul>`,
    createdBy: 1,
  },
  {
    title: "Espresso Machine Cleaning (Cafiza Backflush)",
    category: "CLEANING" as const,
    content: `<h2>Espresso Machine Cleaning (Cafiza Backflush)</h2>
<p><strong>Purpose:</strong> Maintain espresso quality and machine longevity with regular cleaning.</p>
<h3>Daily Cleaning</h3>
<ol>
<li>Remove portafilter baskets and soak in hot water</li>
<li>Scrub group head shower screen with brush</li>
<li>Wipe steam wand — purge before and after each use throughout the day</li>
<li>Backflush with <strong>clean water only</strong> (no Cafiza) at end of day</li>
<li>Wipe down machine exterior</li>
<li>Empty and clean drip tray</li>
</ol>
<h3>Weekly Deep Clean (Cafiza)</h3>
<ol>
<li>Insert blind basket into portafilter</li>
<li>Add <strong>½ teaspoon Cafiza</strong> powder to blind basket</li>
<li>Lock portafilter into group head</li>
<li>Run the backflush cycle <strong>5 times</strong> (10 seconds on, 10 seconds off)</li>
<li>Remove portafilter, rinse basket and portafilter thoroughly</li>
<li>Re-insert clean portafilter and backflush with <strong>clean water 3 times</strong></li>
<li>Repeat for each group head</li>
</ol>
<h3>Weekly — Portafilter and Baskets</h3>
<ul>
<li>Soak portafilter handles and baskets in Cafiza solution (1 tsp per liter hot water) for 30 minutes</li>
<li>Rinse thoroughly with clean water</li>
<li>Do NOT soak the plastic or rubber parts</li>
</ul>
<h3>Steam Wand</h3>
<ul>
<li>Purge before every drink</li>
<li>Wipe with damp cloth after every use</li>
<li>Weekly: soak wand tip in hot water to dissolve milk residue</li>
<li>If wand is clogged: use a wand needle to clear the tip</li>
</ul>`,
    createdBy: 1,
  },

  // ─── SAFETY ─────────────────────────────────────────────────────
  {
    title: "Hot Oil Safety Procedures",
    category: "SAFETY" as const,
    content: `<h2>Hot Oil Safety Procedures</h2>
<p><strong>Purpose:</strong> Prevent burns, fires, and injuries related to hot oil in the kitchen.</p>
<h3>General Rules</h3>
<ul>
<li><strong>Never leave fryers unattended</strong> while in use</li>
<li><strong>Never add water or ice</strong> to hot oil — it will cause violent splattering</li>
<li><strong>Never overfill</strong> the fryer — oil should be at or below the fill line</li>
<li>Keep the area around the fryer <strong>dry and clear of obstructions</strong></li>
<li>Wear appropriate protective equipment: long sleeves, closed-toe shoes, apron</li>
</ul>
<h3>If Oil Fire Occurs</h3>
<ol>
<li><strong>Do NOT use water</strong> to extinguish an oil fire</li>
<li>Turn off the fryer immediately</li>
<li>If the fire is small: cover with a metal lid or use the fryer's fire suppression cover</li>
<li>If the fire is large or spreading: use the <strong>Class K fire extinguisher</strong> located next to the fryer</li>
<li>If the fire cannot be controlled: <strong>evacuate and call 911</strong></li>
<li>Report all fires to management immediately</li>
</ol>
<h3>If a Burn Occurs</h3>
<ol>
<li>Cool the burn under cool running water for at least <strong>10 minutes</strong></li>
<li>Do not apply ice directly to the burn</li>
<li>Cover with a clean, dry dressing</li>
<li>For severe burns: seek medical attention immediately</li>
<li>Report all burns in the Maintenance / Safety Log</li>
</ol>
<h3>Oil Disposal Safety</h3>
<ul>
<li>Always let oil cool below 150°F before draining</li>
<li>Use the designated oil disposal container</li>
<li>Never pour oil down any drain</li>
</ul>`,
    createdBy: 1,
  },
  {
    title: "Food Safety and Temperature Control",
    category: "SAFETY" as const,
    content: `<h2>Food Safety and Temperature Control</h2>
<p><strong>Purpose:</strong> Maintain food safety standards to protect customers and comply with health regulations.</p>
<h3>Temperature Danger Zone</h3>
<ul>
<li><strong>41°F – 135°F</strong> is the danger zone where bacteria multiply rapidly</li>
<li>Cold food must be held at <strong>41°F or below</strong></li>
<li>Hot food must be held at <strong>135°F or above</strong></li>
<li>Food in the danger zone for more than <strong>4 hours must be discarded</strong></li>
</ul>
<h3>Daily Temperature Logs</h3>
<ul>
<li>Record walk-in cooler temperature <strong>twice daily</strong> (opening and closing)</li>
<li>Walk-in should read <strong>33–38°F</strong></li>
<li>Record fryer oil temperature at start of production</li>
<li>Log any temperature deviations and corrective action taken</li>
</ul>
<h3>Food Handling</h3>
<ul>
<li>Wash hands before handling any food — minimum <strong>20 seconds</strong></li>
<li>Use gloves when handling ready-to-eat food</li>
<li>Change gloves between tasks</li>
<li>Never use the same cutting board for raw and cooked items</li>
<li>FIFO (First In, First Out) for all stored items</li>
</ul>
<h3>Labeling and Dating</h3>
<ul>
<li><strong>All prepared items</strong> must be labeled with: item name, date prepared, and use-by date</li>
<li>Prep items: use within <strong>3 days</strong> unless otherwise specified</li>
<li>Cream-filled donuts: refrigerate and use within <strong>4 hours</strong> of filling if not temperature controlled</li>
</ul>`,
    createdBy: 1,
  },
  {
    title: "Allergen Handling Procedures",
    category: "SAFETY" as const,
    content: `<h2>Allergen Handling Procedures</h2>
<p><strong>Purpose:</strong> Protect customers with food allergies and provide accurate allergen information.</p>
<h3>Common Allergens in Our Kitchen</h3>
<ul>
<li><strong>Dairy:</strong> Milk, cream, butter, cream cheese, chocolate</li>
<li><strong>Eggs:</strong> In donut dough, egg squares, pastry cream</li>
<li><strong>Wheat/Gluten:</strong> Flour in all donut dough, bread, tortillas</li>
<li><strong>Soy:</strong> In some chocolate products and shortening</li>
<li><strong>Tree Nuts:</strong> Pecans, almonds, hazelnut-based products (Nutella, praline paste)</li>
<li><strong>Peanuts:</strong> May be present in some products — always verify</li>
</ul>
<h3>When a Customer Reports an Allergy</h3>
<ol>
<li><strong>Take it seriously</strong> — every time</li>
<li>Ask the customer: "Can you tell me which allergen you need to avoid?"</li>
<li>Consult the allergen binder (located at the counter)</li>
<li>If unsure: <strong>do not serve the item</strong> — consult the manager</li>
<li>Clearly communicate to kitchen staff when preparing an allergen-sensitive order</li>
</ol>
<h3>Cross-Contamination Prevention</h3>
<ul>
<li>All equipment and surfaces should be sanitized between products</li>
<li>Use dedicated cutting boards and utensils when possible</li>
<li>Nut-containing products should be prepared in a separate area if feasible</li>
<li>Store allergen-containing ingredients on lower shelves in the walk-in</li>
</ul>
<h3>Important Notes</h3>
<ul>
<li><strong>We cannot guarantee a fully allergen-free environment</strong> — our kitchen uses all major allergens</li>
<li>If a customer has a severe allergy: recommend they do not consume our products</li>
<li>Post allergen information visibly at the counter</li>
</ul>`,
    createdBy: 1,
  },

  // ─── GENERAL ────────────────────────────────────────────────────
  {
    title: "New Employee Onboarding",
    category: "GENERAL" as const,
    content: `<h2>New Employee Onboarding</h2>
<p><strong>Purpose:</strong> Ensure every new team member is set up for success from day one.</p>
<h3>Day 1 — Orientation</h3>
<ul>
<li>Welcome and introduction to the team</li>
<li>Tour of the shop: FOH, BOH, walk-in cooler, storage, office, restrooms</li>
<li>Review this handbook / SOPs in the system</li>
<li>Set up system account (ResCommand login)</li>
<li>Assign role: Employee, with specific station assignments</li>
<li>Review emergency exits and fire extinguisher locations</li>
</ul>
<h3>Day 1–3 — Training</h3>
<ul>
<li><strong>Food safety:</strong> Temperature logs, hand washing, glove use, FIFO</li>
<li><strong>FOH basics:</strong> POS system, greeting customers, drink menu</li>
<li><strong>Shadow shifts:</strong> Work alongside an experienced team member</li>
<li>Review all SOPs in the system for your station</li>
</ul>
<h3>Week 1 — Hands-On</h3>
<ul>
<li>Begin working assigned station with supervision</li>
<li>Learn opening and closing procedures</li>
<li>Practice drink preparation (if barista)</li>
<li>Practice donut handling and display (if FOH)</li>
<li>Complete the food safety quiz with manager</li>
</ul>
<h3>Week 2 — Independence</h3>
<ul>
<li>Begin working shifts with less supervision</li>
<li>Manager checks in daily for questions and feedback</li>
<li>Review performance at end of week 2</li>
</ul>
<h3>Uniform and Appearance</h3>
<ul>
<li>Clean apron and hat/visor provided</li>
<li>Closed-toe, non-slip shoes required</li>
<li>Long hair must be tied back</li>
<li>No nail polish or fake nails when handling food</li>
</ul>`,
    createdBy: 1,
  },
  {
    title: "Inventory Ordering Procedure",
    category: "GENERAL" as const,
    content: `<h2>Inventory Ordering Procedure</h2>
<p><strong>Purpose:</strong> Maintain proper inventory levels by ordering on schedule and tracking deliveries.</p>
<h3>Ordering Schedule by Vendor</h3>
<table>
<tr><th>Vendor</th><th>Cadence</th><th>Order Deadline</th></tr>
<tr><td>US Foods</td><td>Weekly</td><td>Tuesday by 5 PM for Thursday delivery</td></tr>
<tr><td>Senn Brothers</td><td>Weekly</td><td>Monday by noon for Wednesday delivery</td></tr>
<tr><td>GFI</td><td>Every 3–6 weeks</td><td>As needed — plan ahead</td></tr>
<tr><td>Amazon</td><td>As needed</td><td>Allow 2-day shipping time</td></tr>
<tr><td>Aldi</td><td>As needed</td><td>In-store — send someone during shift</td></tr>
</table>
<h3>How to Create an Order</h3>
<ol>
<li>Go to <strong>Inventory → Order</strong> in the system</li>
<li>Review each item's current stock vs. par level</li>
<li>Items below par level are auto-suggested for reorder</li>
<li>Adjust quantities based on upcoming holidays, weather, sales trends</li>
<li>Submit order in the system</li>
<li>Place the actual order with the vendor (phone, email, or online portal)</li>
</ol>
<h3>When Deliveries Arrive</h3>
<ol>
<li>Check the delivery against the order — verify items and quantities</li>
<li>Report any discrepancies or damaged items immediately</li>
<li>Mark the order as <strong>Received</strong> in the system</li>
<li>Put items away immediately — cold items first</li>
<li>Update inventory counts if quantities differ from what was ordered</li>
</ol>`,
    createdBy: 1,
  },
  {
    title: "Waste Logging Procedure",
    category: "GENERAL" as const,
    content: `<h2>Waste Logging Procedure</h2>
<p><strong>Purpose:</strong> Track waste accurately to identify patterns and reduce loss.</p>
<h3>What to Log as Waste</h3>
<ul>
<li><strong>Donuts:</strong> Unsold at end of day, burned, misshapen, dropped</li>
<li><strong>Drinks:</strong> Mistakes, training waste, expired</li>
<li><strong>Ingredients:</strong> Expired, spoiled, dropped, contaminated</li>
<li><strong>Packaging:</strong> Damaged</li>
</ul>
<h3>How to Log Waste</h3>
<ol>
<li>In the system, go to <strong>Entry</strong> or the relevant module</li>
<li>Select the item and quantity</li>
<li>Select the waste reason: <strong>Unsold, Error, Expired, Damaged, Other</strong></li>
<li>Submit the entry</li>
</ol>
<h3>When to Log</h3>
<ul>
<li><strong>Donuts:</strong> End of each day during closing</li>
<li><strong>Ingredients:</strong> Immediately when discovered</li>
<li><strong>Drinks:</strong> At the time of the mistake</li>
<li>Do not batch waste logs — log in real-time when possible</li>
</ul>
<h3>Waste Reduction Tips</h3>
<ul>
<li>Watch par levels closely — over-ordering leads to waste</li>
<li>Track which donut varieties sell vs. get wasted most often</li>
<li>Review the waste report weekly with the team</li>
<li>Adjust production targets based on trends</li>
</ul>`,
    createdBy: 1,
  },
];

async function main() {
  console.log("Seeding SOPs...");

  // Only CREATE SOPs that don't exist yet — never overwrite user edits
  const existingTitles = new Set(
    (
      await prisma.sop.findMany({
        where: { tenantId: 1 },
        select: { title: true },
      })
    ).map((s) => s.title)
  );

  let created = 0;
  for (const sop of sops) {
    if (!existingTitles.has(sop.title)) {
      await prisma.sop.create({
        data: {
          tenantId: 1,
          title: sop.title,
          category: sop.category,
          content: sop.content,
          createdBy: sop.createdBy,
          active: true,
          version: 1,
        },
      });
      created++;
    }
  }

  console.log(
    `SOPs: ${existingTitles.size} existing, ${created} new seeded (out of ${sops.length} total)`
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());