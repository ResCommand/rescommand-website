import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// POST - seeds all Duffers data: vendors, inventory, recipes, recipe categories, SOPs, and extra users
export async function POST() {
  const tenantId = 8; // Duffers Donut Shop tenant ID on Railway
  const results: string[] = [];

  try {
    // 1. VENDORS
    const vendorData = [
      { name: "US Foods", role: "Primary broadline vendor" },
      { name: "Senn Brothers", role: "Produce vendor" },
      { name: "Aldi", role: "Supplemental grocery vendor" },
      { name: "GFI", role: "Specialty ingredient vendor" },
      { name: "Amazon", role: "Smallwares/supplies vendor" },
    ];

    const vendors: Record<string, number> = {};
    for (const v of vendorData) {
      const existing = await prisma.vendor.findFirst({ where: { name: v.name, tenantId } });
      if (existing) {
        vendors[v.name] = existing.id;
        results.push(`Vendor exists: ${v.name}`);
      } else {
        const created = await prisma.vendor.create({
          data: { name: v.name, role: v.role, tenantId, active: true },
        });
        vendors[v.name] = created.id;
        results.push(`Created vendor: ${v.name}`);
      }
    }

    // 2. INVENTORY SECTIONS
    const sections = [
      { name: "Kitchen — Regular Orders", slug: "kitchen_regular", icon: "🍳" },
      { name: "Kitchen — Infrequent Orders", slug: "kitchen_infrequent", icon: "🧂" },
      { name: "Packaging & Supplies", slug: "packaging", icon: "📦" },
      { name: "Barista & Coffee", slug: "barista", icon: "☕" },
    ];

    for (const s of sections) {
      const existing = await prisma.inventorySection.findFirst({ where: { slug: s.slug, tenantId } });
      if (!existing) {
        await prisma.inventorySection.create({ data: { ...s, tenantId, active: true } });
        results.push(`Created section: ${s.name}`);
      } else {
        results.push(`Section exists: ${s.name}`);
      }
    }

    // Get section IDs
    const sectionRecords = await prisma.inventorySection.findMany({ where: { tenantId } });
    const sectionMap: Record<string, number> = {};
    for (const s of sectionRecords) sectionMap[s.slug] = s.id;

    // 3. INVENTORY ITEMS
    const items = [
      // US Foods items
      { name: "All-Purpose Flour", category: "BOH", unit: "lb", unitCost: 0.42, parLevel: 50, vendorName: "US Foods", sectionSlug: "kitchen_regular", sku: "USF-FLR-001", packSize: "50 lb bag" },
      { name: "Granulated Sugar", category: "BOH", unit: "lb", unitCost: 0.55, parLevel: 25, vendorName: "US Foods", sectionSlug: "kitchen_regular", sku: "USF-SGR-001", packSize: "25 lb bag" },
      { name: "Brown Sugar", category: "BOH", unit: "lb", unitCost: 0.62, parLevel: 10, vendorName: "US Foods", sectionSlug: "kitchen_regular", sku: "USF-BRS-001", packSize: "10 lb bag" },
      { name: "Powdered Sugar", category: "BOH", unit: "lb", unitCost: 0.58, parLevel: 10, vendorName: "US Foods", sectionSlug: "kitchen_regular", sku: "USF-PWS-001", packSize: "10 lb bag" },
      { name: "Butter (unsalted)", category: "BOH", unit: "lb", unitCost: 3.85, parLevel: 15, vendorName: "US Foods", sectionSlug: "kitchen_regular", sku: "USF-BTR-001", packSize: "1 lb blocks (case of 30)" },
      { name: "Whole Milk", category: "BOH", unit: "gallon", unitCost: 3.20, parLevel: 8, vendorName: "US Foods", sectionSlug: "kitchen_regular", sku: "USF-MLK-001", packSize: "1 gallon" },
      { name: "Heavy Cream", category: "BOH", unit: "quart", unitCost: 4.50, parLevel: 6, vendorName: "US Foods", sectionSlug: "kitchen_regular", sku: "USF-CRM-001", packSize: "1 quart" },
      { name: "Large Eggs", category: "BOH", unit: "dozen", unitCost: 2.80, parLevel: 15, vendorName: "US Foods", sectionSlug: "kitchen_regular", sku: "USF-EGG-001", packSize: "15 dozen case" },
      { name: "Vegetable Shortening", category: "BOH", unit: "lb", unitCost: 1.75, parLevel: 25, vendorName: "US Foods", sectionSlug: "kitchen_regular", sku: "USF-SHT-001", packSize: "50 lb block" },
      { name: "Active Dry Yeast", category: "BOH", unit: "lb", unitCost: 5.50, parLevel: 2, vendorName: "US Foods", sectionSlug: "kitchen_infrequent", sku: "USF-YST-001", packSize: "2 lb bag" },
      { name: "Baking Powder", category: "BOH", unit: "lb", unitCost: 2.80, parLevel: 3, vendorName: "US Foods", sectionSlug: "kitchen_infrequent", sku: "USF-BPK-001", packSize: "5 lb can" },
      { name: "Baking Soda", category: "BOH", unit: "lb", unitCost: 1.20, parLevel: 2, vendorName: "US Foods", sectionSlug: "kitchen_infrequent", sku: "USF-BSD-001", packSize: "5 lb bag" },
      { name: "Salt (fine)", category: "BOH", unit: "lb", unitCost: 0.35, parLevel: 5, vendorName: "US Foods", sectionSlug: "kitchen_infrequent", sku: "USF-SLT-001", packSize: "25 lb bag" },
      { name: "Vanilla Extract", category: "BOH", unit: "oz", unitCost: 0.85, parLevel: 16, vendorName: "US Foods", sectionSlug: "kitchen_infrequent", sku: "USF-VNL-001", packSize: "32 oz bottle" },
      { name: "Semi-Sweet Chocolate Chips", category: "BOH", unit: "lb", unitCost: 3.20, parLevel: 10, vendorName: "US Foods", sectionSlug: "kitchen_regular", sku: "USF-CHP-001", packSize: "10 lb case" },
      { name: "Cocoa Powder", category: "BOH", unit: "lb", unitCost: 4.50, parLevel: 3, vendorName: "US Foods", sectionSlug: "kitchen_infrequent", sku: "USF-CCO-001", packSize: "5 lb bag" },
      { name: "Cream Cheese", category: "BOH", unit: "lb", unitCost: 2.90, parLevel: 8, vendorName: "US Foods", sectionSlug: "kitchen_regular", sku: "USF-CCH-001", packSize: "3 lb blocks (case of 6)" },
      { name: "Cheddar Cheese (sliced)", category: "BOH", unit: "lb", unitCost: 3.50, parLevel: 5, vendorName: "US Foods", sectionSlug: "kitchen_regular", sku: "USF-CHD-001", packSize: "5 lb case sliced" },
      { name: "Sausage Patties (pre-formed)", category: "BOH", unit: "lb", unitCost: 3.80, parLevel: 10, vendorName: "US Foods", sectionSlug: "kitchen_regular", sku: "USF-SSG-001", packSize: "10 lb case" },
      { name: "Bacon (thick cut)", category: "BOH", unit: "lb", unitCost: 5.25, parLevel: 10, vendorName: "US Foods", sectionSlug: "kitchen_regular", sku: "USF-BCN-001", packSize: "15 lb case" },
      { name: "Sandwich Rolls/Buns", category: "BOH", unit: "each", unitCost: 0.35, parLevel: 50, vendorName: "US Foods", sectionSlug: "kitchen_regular", sku: "USF-BUN-001", packSize: "12 pack" },
      { name: "Maple Syrup", category: "BOH", unit: "oz", unitCost: 0.45, parLevel: 32, vendorName: "US Foods", sectionSlug: "kitchen_infrequent", sku: "USF-MPL-001", packSize: "32 oz bottle" },
      // Senn Brothers items
      { name: "Fresh Strawberries", category: "BOH", unit: "lb", unitCost: 3.50, parLevel: 5, vendorName: "Senn Brothers", sectionSlug: "kitchen_regular", sku: "SEN-STR-001", packSize: "1 lb clamshell" },
      { name: "Fresh Raspberries", category: "BOH", unit: "lb", unitCost: 5.00, parLevel: 3, vendorName: "Senn Brothers", sectionSlug: "kitchen_regular", sku: "SEN-RSP-001", packSize: "6 oz clamshell" },
      { name: "Lemons", category: "BOH", unit: "each", unitCost: 0.40, parLevel: 20, vendorName: "Senn Brothers", sectionSlug: "kitchen_regular", sku: "SEN-LMN-001", packSize: "2 lb bag (~10)" },
      // GFI items
      { name: "Praline Paste", category: "BOH", unit: "lb", unitCost: 8.50, parLevel: 3, vendorName: "GFI", sectionSlug: "kitchen_infrequent", sku: "GFI-PRL-001", packSize: "2.2 lb can" },
      { name: "Dulce de Leche", category: "BOH", unit: "lb", unitCost: 5.75, parLevel: 3, vendorName: "GFI", sectionSlug: "kitchen_infrequent", sku: "GFI-DLC-001", packSize: "2.2 lb jar" },
      { name: "Pecans (halves)", category: "BOH", unit: "lb", unitCost: 7.80, parLevel: 3, vendorName: "GFI", sectionSlug: "kitchen_infrequent", sku: "GFI-PCN-001", packSize: "5 lb bag" },
      { name: "Gelatin Sheets", category: "BOH", unit: "sheet", unitCost: 0.15, parLevel: 100, vendorName: "GFI", sectionSlug: "kitchen_infrequent", sku: "GFI-GLT-001", packSize: "500 sheet box" },
      { name: "Glucose Syrup", category: "BOH", unit: "lb", unitCost: 3.20, parLevel: 3, vendorName: "GFI", sectionSlug: "kitchen_infrequent", sku: "GFI-GLC-001", packSize: "2.2 lb bottle" },
      { name: "Nutella", category: "BOH", unit: "lb", unitCost: 4.50, parLevel: 3, vendorName: "GFI", sectionSlug: "kitchen_infrequent", sku: "GFI-NTL-001", packSize: "26.5 oz jar (~1.65 lb)" },
      { name: "Pastry Cream Powder", category: "BOH", unit: "lb", unitCost: 3.40, parLevel: 3, vendorName: "GFI", sectionSlug: "kitchen_infrequent", sku: "GFI-PCR-001", packSize: "2.2 lb bag" },
      // Amazon items
      { name: "Donut Boxes (1-dozen)", category: "FOH", unit: "each", unitCost: 0.65, parLevel: 50, vendorName: "Amazon", sectionSlug: "packaging", sku: "AMZ-BOX-001", packSize: "50 pack" },
      { name: "Donut Boxes (half-dozen)", category: "FOH", unit: "each", unitCost: 0.50, parLevel: 30, vendorName: "Amazon", sectionSlug: "packaging", sku: "AMZ-BOX-002", packSize: "50 pack" },
      { name: "Pastry Bags (disposable)", category: "BOH", unit: "each", unitCost: 0.08, parLevel: 100, vendorName: "Amazon", sectionSlug: "packaging", sku: "AMZ-PBG-001", packSize: "100 count box" },
      { name: "Parchment Paper Sheets", category: "BOH", unit: "sheet", unitCost: 0.04, parLevel: 200, vendorName: "Amazon", sectionSlug: "packaging", sku: "AMZ-PRC-001", packSize: "1000 count box" },
      { name: "Food-safe Gloves", category: "BOH", unit: "each", unitCost: 0.03, parLevel: 500, vendorName: "Amazon", sectionSlug: "packaging", sku: "AMZ-GLV-001", packSize: "1000 count box" },
      { name: "Wax Paper Bags", category: "FOH", unit: "each", unitCost: 0.12, parLevel: 200, vendorName: "Amazon", sectionSlug: "packaging", sku: "AMZ-WPB-001", packSize: "500 count" },
      { name: "Napkins", category: "FOH", unit: "each", unitCost: 0.02, parLevel: 1000, vendorName: "Amazon", sectionSlug: "packaging", sku: "AMZ-NAP-001", packSize: "3000 count case" },
      // Aldi items
      { name: "Sweetened Condensed Milk", category: "BOH", unit: "can", unitCost: 1.50, parLevel: 10, vendorName: "Aldi", sectionSlug: "kitchen_infrequent", sku: "ALD-SCM-001", packSize: "14 oz can" },
      { name: "Sour Cream", category: "BOH", unit: "lb", unitCost: 1.80, parLevel: 5, vendorName: "Aldi", sectionSlug: "kitchen_regular", sku: "ALD-SRC-001", packSize: "16 oz tub" },
      { name: "Oat Milk (Barista)", category: "FOH", unit: "each", unitCost: 3.50, parLevel: 8, vendorName: "Aldi", sectionSlug: "barista", sku: "ALD-OAT-001", packSize: "32 oz carton" },
      { name: "Coffee Beans (espresso blend)", category: "FOH", unit: "lb", unitCost: 10.50, parLevel: 10, vendorName: "Aldi", sectionSlug: "barista", sku: "ALD-COF-001", packSize: "12 oz bag" },
      { name: "Paper Coffee Cups (12oz)", category: "FOH", unit: "each", unitCost: 0.08, parLevel: 200, vendorName: "Aldi", sectionSlug: "barista", sku: "ALD-CUP-001", packSize: "1000 case" },
      { name: "Coffee Cup Lids", category: "FOH", unit: "each", unitCost: 0.03, parLevel: 200, vendorName: "Aldi", sectionSlug: "barista", sku: "ALD-LID-001", packSize: "1000 case" },
      { name: "Stirrers", category: "FOH", unit: "each", unitCost: 0.01, parLevel: 500, vendorName: "Aldi", sectionSlug: "barista", sku: "ALD-STR-001", packSize: "1000 box" },
      { name: "Sugar Packets", category: "FOH", unit: "each", unitCost: 0.02, parLevel: 500, vendorName: "Aldi", sectionSlug: "barista", sku: "ALD-SGR-001", packSize: "2000 box" },
      // More US Foods items
      { name: "Cinnamon (ground)", category: "BOH", unit: "lb", unitCost: 6.80, parLevel: 1, vendorName: "US Foods", sectionSlug: "kitchen_infrequent", sku: "USF-CIN-001", packSize: "1 lb container" },
      { name: "Nutmeg (ground)", category: "BOH", unit: "lb", unitCost: 8.50, parLevel: 0.5, vendorName: "US Foods", sectionSlug: "kitchen_infrequent", sku: "USF-NUT-001", packSize: "8 oz container" },
      { name: "Almond Extract", category: "BOH", unit: "oz", unitCost: 0.65, parLevel: 8, vendorName: "US Foods", sectionSlug: "kitchen_infrequent", sku: "USF-ALM-001", packSize: "16 oz bottle" },
      { name: "Food Coloring (assorted)", category: "BOH", unit: "each", unitCost: 3.50, parLevel: 2, vendorName: "US Foods", sectionSlug: "kitchen_infrequent", sku: "USF-FCO-001", packSize: "Set of 6 bottles" },
      { name: "Donut Glaze Mix", category: "BOH", unit: "lb", unitCost: 1.80, parLevel: 10, vendorName: "US Foods", sectionSlug: "kitchen_regular", sku: "USF-GLZ-001", packSize: "10 lb bag" },
      { name: "Frying Shortening", category: "BOH", unit: "lb", unitCost: 1.25, parLevel: 35, vendorName: "US Foods", sectionSlug: "kitchen_regular", sku: "USF-FRY-001", packSize: "35 lb cube" },
      { name: "Spatulas (silicone)", category: "BOH", unit: "each", unitCost: 4.50, parLevel: 3, vendorName: "Amazon", sectionSlug: "packaging", sku: "AMZ-SPT-001", packSize: "1 each" },
      { name: "Piping Tips Set (Bismarck #230)", category: "BOH", unit: "each", unitCost: 1.20, parLevel: 5, vendorName: "Amazon", sectionSlug: "packaging", sku: "AMZ-TIP-001", packSize: "1 each" },
      { name: "Almond Milk", category: "FOH", unit: "each", unitCost: 2.80, parLevel: 4, vendorName: "Aldi", sectionSlug: "barista", sku: "ALD-ALM-001", packSize: "64 oz carton" },
      { name: "Hot Chocolate Powder", category: "FOH", unit: "lb", unitCost: 4.20, parLevel: 3, vendorName: "US Foods", sectionSlug: "barista", sku: "USF-HCH-001", packSize: "5 lb bag" },
      { name: "NY Cheesecake Base (frozen)", category: "BOH", unit: "lb", unitCost: 3.80, parLevel: 5, vendorName: "US Foods", sectionSlug: "kitchen_regular", sku: "USF-NYC-001", packSize: "5 lb tub" },
      { name: "Tortilla (burrito size)", category: "BOH", unit: "each", unitCost: 0.15, parLevel: 30, vendorName: "US Foods", sectionSlug: "kitchen_regular", sku: "USF-TRT-001", packSize: "30 count bag" },
    ];

    let itemCount = 0;
    for (const item of items) {
      const existing = await prisma.inventoryItem.findFirst({ where: { name: item.name, tenantId } });
      if (existing) {
        results.push(`Item exists: ${item.name}`);
        continue;
      }
      await prisma.inventoryItem.create({
        data: {
          name: item.name,
          category: item.category as "BOH" | "FOH",
          unit: item.unit,
          unitCost: item.unitCost,
          parLevel: item.parLevel,
          vendorId: vendors[item.vendorName],
          inventorySectionId: sectionMap[item.sectionSlug],
          sku: item.sku,
          packSize: item.packSize,
          tenantId,
          active: true,
        },
      });
      itemCount++;
    }
    results.push(`Created ${itemCount} inventory items`);

    // 4. RECIPE CATEGORIES
    const recipeCats = [
      { name: "Base Recipes", slug: "base", icon: "🧈" },
      { name: "Fillings & Creams", slug: "filling", icon: "🥧" },
      { name: "Toppings & Glazes", slug: "topping", icon: "🎂" },
      { name: "General", slug: "general", icon: "📋" },
      { name: "Sandwiches", slug: "sandwiches", icon: "🥪" },
    ];

    const recipeCatMap: Record<string, number> = {};
    for (const rc of recipeCats) {
      const existing = await prisma.recipeCategory.findFirst({ where: { slug: rc.slug, tenantId } });
      if (existing) {
        recipeCatMap[rc.slug] = existing.id;
        results.push(`Recipe cat exists: ${rc.name}`);
      } else {
        const created = await prisma.recipeCategory.create({ data: { ...rc, tenantId, active: true } });
        recipeCatMap[rc.slug] = created.id;
        results.push(`Created recipe cat: ${rc.name}`);
      }
    }

    // 5. RECIPES
    const recipes = [
      { name: "Whipped Cream", category: "topping", ingredients: [{name:"Heavy Cream",amount:"2",unit:"quart"},{name:"Granulated Sugar",amount:"4",unit:"oz"},{name:"Vanilla Extract",amount:"1",unit:"tsp"}], instructions: "1. Chill mixing bowl and whisk in freezer for 15 min.\n2. Pour heavy cream into chilled bowl.\n3. Whip on medium speed until soft peaks form.\n4. Add sugar and vanilla.\n5. Continue whipping to stiff peaks.\n6. Use immediately or refrigerate." },
      { name: "Pecan Paste", category: "filling", ingredients: [{name:"Pecans (halves)",amount:"2",unit:"lb"},{name:"Granulated Sugar",amount:"1",unit:"lb"},{name:"Butter (unsalted)",amount:"4",unit:"oz"},{name:"Vanilla Extract",amount:"1",unit:"tbsp"}], instructions: "1. Toast pecans at 350°F for 8 minutes.\n2. In saucepan, melt sugar over medium heat until caramel.\n3. Add butter, stir until combined.\n4. Add toasted pecans and vanilla.\n5. Spread on parchment, cool completely.\n6. Break into pieces and pulse in food processor to paste." },
      { name: "Creme Brulee Cream", category: "filling", ingredients: [{name:"Heavy Cream",amount:"2",unit:"cup"},{name:"Large Eggs",amount:"6",unit:"each (yolks)"},{name:"Granulated Sugar",amount:"1/2",unit:"cup"},{name:"Vanilla Extract",amount:"2",unit:"tsp"}], instructions: "1. Heat cream until simmering.\n2. Whisk yolks and sugar until pale.\n3. Temper hot cream into yolk mixture slowly.\n4. Strain through fine sieve.\n5. Chill until set." },
      { name: "Praline Pastry Cream", category: "filling", ingredients: [{name:"Whole Milk",amount:"2",unit:"cup"},{name:"Large Eggs",amount:"4",unit:"each (yolks)"},{name:"Granulated Sugar",amount:"1/2",unit:"cup"},{name:"Praline Paste",amount:"4",unit:"oz"},{name:"Butter (unsalted)",amount:"2",unit:"tbsp"}], instructions: "1. Heat milk to simmer.\n2. Whisk yolks and sugar.\n3. Temper milk into yolks.\n4. Return to pot, cook until thickened.\n5. Remove from heat, stir in praline paste and butter.\n6. Strain, chill with plastic on surface." },
      { name: "Chocolate Cream", category: "filling", ingredients: [{name:"Semi-Sweet Chocolate Chips",amount:"12",unit:"oz"},{name:"Heavy Cream",amount:"1",unit:"cup"},{name:"Butter (unsalted)",amount:"2",unit:"tbsp"},{name:"Cocoa Powder",amount:"1",unit:"tbsp"}], instructions: "1. Heat cream until simmering.\n2. Pour over chocolate chips, let sit 2 min.\n3. Stir until smooth.\n4. Add butter and cocoa.\n5. Cool to spreading consistency." },
      { name: "Dulce de Leche Cream", category: "filling", ingredients: [{name:"Dulce de Leche",amount:"12",unit:"oz"},{name:"Cream Cheese",amount:"8",unit:"oz"},{name:"Butter (unsalted)",amount:"2",unit:"tbsp"}], instructions: "1. Soften cream cheese and butter.\n2. Beat until smooth.\n3. Add dulce de leche gradually.\n4. Mix until fully incorporated." },
      { name: "Milk Soft Ganache", category: "base", ingredients: [{name:"Semi-Sweet Chocolate Chips",amount:"16",unit:"oz"},{name:"Whole Milk",amount:"1",unit:"cup"},{name:"Butter (unsalted)",amount:"2",unit:"tbsp"}], instructions: "1. Heat milk to simmering.\n2. Pour over chocolate, let sit 2 min.\n3. Stir until smooth.\n4. Add butter, stir until glossy.\n5. Cool to desired consistency." },
      { name: "Raspberry/Strawberry Jam", category: "filling", ingredients: [{name:"Fresh Strawberries",amount:"1",unit:"lb"},{name:"Fresh Raspberries",amount:"8",unit:"oz"},{name:"Granulated Sugar",amount:"1",unit:"cup"},{name:"Lemons",amount:"1",unit:"each (juice)"}], instructions: "1. Hull and dice strawberries.\n2. Combine berries, sugar, and lemon juice.\n3. Cook over medium heat 25-30 min, stirring.\n4. Skim foam as needed.\n5. Test set on cold plate.\n6. Cool and store refrigerated." },
      { name: "NY Cheesecake Cream", category: "filling", ingredients: [{name:"Cream Cheese",amount:"16",unit:"oz"},{name:"Granulated Sugar",amount:"1/3",unit:"cup"},{name:"Vanilla Extract",amount:"1",unit:"tsp"},{name:"NY Cheesecake Base (frozen)",amount:"4",unit:"oz"}], instructions: "1. Soften cream cheese completely.\n2. Beat until smooth.\n3. Add sugar and vanilla.\n4. Fold in cheesecake base.\n5. Chill before using." },
      { name: "Egg Squares", category: "sandwiches", ingredients: [{name:"Large Eggs",amount:"12",unit:"each"},{name:"Whole Milk",amount:"1/4",unit:"cup"},{name:"Salt (fine)",amount:"1/2",unit:"tsp"},{name:"Butter (unsalted)",amount:"1",unit:"tbsp"}], instructions: "1. Whisk eggs, milk, and salt.\n2. Pour into greased half-sheet pan.\n3. Bake at 350°F for 12-15 min until set.\n4. Cool, cut into squares.\n5. Refrigerate until use." },
      { name: "Sausage Patties", category: "sandwiches", ingredients: [{name:"Sausage Patties (pre-formed)",amount:"20",unit:"each"}], instructions: "1. Place patties on sheet pan.\n2. Bake at 400°F for 12-15 min.\n3. Internal temp 160°F.\n4. Hold at 135°F or above.\n5. Use within 2 hours." },
      { name: "Bacon", category: "sandwiches", ingredients: [{name:"Bacon (thick cut)",amount:"2",unit:"lb"}], instructions: "1. Lay strips on sheet pan, single layer.\n2. Bake at 400°F for 15-18 min.\n3. Drain on paper towels.\n4. Hold at 135°F or above." },
      { name: "Breakfast Sandwich Assembly", category: "sandwiches", ingredients: [{name:"Sandwich Rolls/Buns",amount:"1",unit:"each"},{name:"Egg Squares",amount:"1",unit:"square"},{name:"Cheddar Cheese (sliced)",amount:"1",unit:"slice"},{name:"Sausage Patties (pre-formed)",amount:"1",unit:"patty"},{name:"Bacon (thick cut)",amount:"2",unit:"strips"}], instructions: "1. Toast bun cut-side up until golden.\n2. Place egg square on bottom.\n3. Add sausage patty OR 2 strips bacon.\n4. Top with cheddar slice.\n5. Close with top bun.\n6. Serve immediately or wrap in foil." },
    ];

    let recipeCount = 0;
    for (const r of recipes) {
      const existing = await prisma.recipe.findFirst({ where: { name: r.name, tenantId } });
      if (existing) {
        results.push(`Recipe exists: ${r.name}`);
        continue;
      }
      await prisma.recipe.create({
        data: {
          name: r.name,
          category: r.category,
          ingredients: r.ingredients,
          instructions: r.instructions,
          yield: r.category === "sandwiches" ? "1 serving" : "varies",
          tenantId,
          categoryId: recipeCatMap[r.category] || recipeCatMap["general"],
          active: true,
        },
      });
      recipeCount++;
    }
    results.push(`Created ${recipeCount} recipes`);

    // 6. SOPs - abbreviated list of key SOPs
    const sops = [
      { title: "Morning Opening Procedure", category: "OPENING", content: "Pre-opening checklist: Unlock, lights, thermostat 68-72°F, inspect FOH, verify POS. Kitchen: fryers to 375°F, start proofing cabinet at 95°F, power on espresso machine, check cooler temps, pull prep items. Production: review par sheet, cut/proof first batch, prep sandwich components, brew coffee, fill display. Final: verify display full, prices correct, staff at stations, unlock door." },
      { title: "Fryer Startup Procedure", category: "OPENING", content: "Visual inspection of oil level. Check oil quality (clear golden = good, dark/foamy = change). Turn on, set to 375°F. Wait 20 min. Verify with probe thermometer (370-380°F). Test fry one small dough piece — should float and brown in 30 sec. Safety: never add water to hot oil, keep area dry, fire extinguisher within 10 ft." },
      { title: "Evening Closing Procedure", category: "CLOSING", content: "FOH: wind down display, wipe counters/tables/glass, restock supplies, empty trash, clean espresso steam wand. Kitchen: shut down fryers, log oil condition, sanitize surfaces, store/date all perishables, run dishwasher, sweep/mop. Donut waste: count remaining by variety, log waste, discard. Final: count register, prep morning drawer, turn off lights, set thermostat, lock up, arm security." },
      { title: "Donut Frying Procedure", category: "BOH", content: "Setup: fryer at 375°F, proofed donuts ready, screens/spider ready, glaze staged. Frying: lift proofed donuts gently, place top-side down. Fry 45-60 sec per side until golden brown. Drain 5 sec over fryer, place on rack 2-3 min before glazing. Standard: 375°F for yeast donuts, 350-360°F for cake donuts. Don't overcrowd, let oil recover between batches." },
      { title: "Donut Cutting and Proofing", category: "BOH", content: "Roll dough to 1/2 inch uniform thickness. Cut with standard cutter — press straight down, do NOT twist. Place on flour-dusted tray. Proof at 95°F with humidity for 20-35 min. Done when puffed, finger indent springs back slowly, surface slightly dry. Over-proofed = collapse in fryer. Under-proofed = dense/raw center." },
      { title: "Glazing and Icing Procedures", category: "BOH", content: "Standard Glaze: glaze 2-3 min after frying while warm. Dip top-side down, let drip, place glaze-side up, set 5-10 min. Chocolate Icing: apply to fully cooled donuts (15+ min). Spread even layer, add toppings immediately. Cream Filling: fill cooled donuts only. Use Bismarck tip #230, pipe into side until donut feels heavy (~2 oz). Never glaze a cold donut." },
      { title: "Batch Mixing — Large and Small Mixer", category: "BOH", content: "Large (60-qt): full production batches, don't exceed 75% bowl. Start LOW then MEDIUM. Small (20-qt): fillings, icings, cream cheeses, don't exceed 2/3 bowl. General: weigh all ingredients first, wet then dry, start LOW, scrape bowl, dough temp target 75-80°F. NEVER put hands in bowl while running." },
      { title: "Breakfast Sandwich Production", category: "BOH", content: "See individual recipes: Egg Squares, Sausage Patties, Bacon. Sausage E&C: toast roll, egg square, sausage patty, cheddar, top bun, wrap/serve. Bacon E&C: same with bacon instead of sausage. Hold assembled at 135°F+. Max hold: 2 hours then discard. Egg squares: refrigerate, use within 3 days. Pre-cooked bacon/sausage: refrigerate, use within 5 days." },
      { title: "Espresso Machine Dial-In", category: "FOH", content: "Daily dial-in after 30 min warm-up. Backflush with water. Run blank shot. Dose 18g, target 36g out in 25-30 sec. Adjust grind: too fast (<20s) = finer, too slow (>35s) = coarser. Log grind setting, dose, yield, time. Re-dial on shift change, new beans, weather changes. Good shot = sweet, balanced, good crema." },
      { title: "Drink Preparation Standards", category: "FOH", content: "Espresso: 18g in, 36g out, 25-30 sec. Americano: double espresso + hot water. Latte: double espresso + steamed milk. Cappuccino: double espresso + equal steamed milk/foam. Cold Brew: pre-batched, served over ice. Milk: steam to 140-150°F, micro-foam, no large bubbles. Options: whole (default), oat, almond. Never re-steam milk." },
      { title: "Customer Service Standards", category: "FOH", content: "Acknowledge within 10 sec. Standard greeting: 'Hi! Welcome to Duffers. What can I get for you?' Repeat orders back. Upsell coffee. Call by name when ready. Hand items directly. Problem resolution: listen first, apologize, fix it — remake without charge. Never argue in front of others. Wipe counter between customers." },
      { title: "Fryer Cleaning and Oil Change", category: "CLEANING", content: "Change every 5-7 days or when dark/foamy/smelly. Procedure: turn off, cool below 150°F (1-2 hrs), drain into disposal container, scrub vat with soapy water, rinse thoroughly (no soap residue), dry completely, refill to fill line, heat to 375°F, log date. Daily: skim surface between batches, wipe exterior, clean baskets." },
      { title: "Kitchen Deep Clean Schedule", category: "CLEANING", content: "Daily: sanitize prep surfaces, cutting boards, sweep/mop, clean sink, empty trash. Weekly: clean walk-in shelves, discard expired (FIFO), deep clean fryer, clean behind equipment, descale espresso, clean oven interiors, sanitize storage containers. Monthly: pull out equipment, clean exhaust hood/filters, clean floor drains, deep clean proofer, restock cleaning supplies." },
      { title: "Front of House Cleaning Checklist", category: "CLEANING", content: "Ongoing: wipe counter after each customer, keep display glass spotless, buss tables within 2 min, restock supplies, empty trash at 3/4 full. End of shift: wipe tables/chairs, clean espresso drip tray and steam wand, display case interior, sanitize counter, sweep floors, restock. Closing: mop all floors, clean restrooms, empty all trash, clean door glass." },
      { title: "Espresso Machine Cleaning (Cafiza Backflush)", category: "CLEANING", content: "Daily: remove baskets and soak, scrub group head screen, wipe steam wand, backflush with water only, wipe exterior, empty drip tray. Weekly: add 1/2 tsp Cafiza to blind basket, backflush 5x (10 sec on/off), rinse and backflush with clean water 3x. Soak portafilter/baskets in Cafiza solution 30 min weekly. Steam wand: purge before every drink, wipe after, soak tip weekly." },
      { title: "Hot Oil Safety Procedures", category: "SAFETY", content: "Never leave fryers unattended. Never add water/ice to hot oil. Never overfill. Keep area dry and clear. Wear long sleeves, closed-toe shoes, apron. Fire: do NOT use water. Turn off fryer. Cover with metal lid. Use Class K extinguisher. If uncontrolled, evacuate and call 911. Burns: cool under running water 10 min, clean dressing, seek medical for severe burns. Report all incidents." },
      { title: "Food Safety and Temperature Control", category: "SAFETY", content: "Danger zone: 41-135°F. Cold food at 41°F or below. Hot food at 135°F or above. Discard food in danger zone over 4 hours. Log walk-in temp twice daily (target 33-38°F). Wash hands 20+ sec, use gloves for ready-to-eat, change gloves between tasks, FIFO storage. Label all items: name, date prep, use-by. Prep items: use within 3 days." },
      { title: "Allergen Handling Procedures", category: "SAFETY", content: "Our allergens: dairy, eggs, wheat/gluten, soy, tree nuts (pecans, almonds, hazelnut products), peanuts (verify). Customer reports allergy: take seriously, ask which allergen, consult allergen binder, if unsure do not serve. Cross-contamination: sanitize between products, dedicated boards/utensils when possible, nuts in separate area, allergen ingredients on lower shelves. Cannot guarantee allergen-free environment." },
      { title: "New Employee Onboarding", category: "GENERAL", content: "Day 1: tour, review SOPs in system, set up account, assign role, emergency exits/fire extinguishers. Day 1-3: food safety training, FOH basics (POS, greeting, drink menu), shadow shifts. Week 1: work station with supervision, learn opening/closing, practice drinks or donut handling, complete food safety quiz. Week 2: work independently, manager check-ins, end-of-week review. Uniform: clean apron/hat, closed-toe non-slip shoes, hair tied back, no nail polish/fake nails for food handlers." },
      { title: "Inventory Ordering Procedure", category: "GENERAL", content: "US Foods: weekly, order by Tue 5PM for Thu delivery. Senn Brothers: weekly, Mon noon for Wed delivery. GFI: every 3-6 weeks. Amazon: as needed (2-day shipping). Aldi: as needed (in-store). Process: Inventory → Order in system, review stock vs par, adjust for holidays/trends, submit, then place actual order with vendor. On delivery: verify against order, mark Received, put away cold items first." },
      { title: "Waste Logging Procedure", category: "GENERAL", content: "Log: unsold donuts (end of day), burned/misshapen/dropped donuts, drink mistakes, expired/spoiled/dropped ingredients, damaged packaging. Process: go to Entry module, select item/quantity, choose reason (Unsold, Error, Expired, Damaged, Other), submit. Log in real-time when possible. Don't batch. Review waste report weekly. Adjust par levels based on trends." },
    ];

    let sopCount = 0;
    for (const sop of sops) {
      const existing = await prisma.sop.findFirst({ where: { title: sop.title, tenantId } });
      if (existing) {
        results.push(`SOP exists: ${sop.title}`);
        continue;
      }
      await prisma.sop.create({
        data: {
          title: sop.title,
          category: sop.category as any,
          content: sop.content,
          tenantId,
          createdBy: 8, // Shawn's user ID
          active: true,
          version: 1,
        },
      });
      sopCount++;
    }
    results.push(`Created ${sopCount} SOPs`);

    // 7. Additional users
    const passwordHash = await bcrypt.hash("password", 12);
    const extraUsers = [
      { name: "Store Manager", email: "manager@duffers.com", role: "MANAGER" as const },
      { name: "Jane Employee", email: "employee@duffers.com", role: "EMPLOYEE" as const },
      { name: "Bob Baker", email: "bob@duffers.com", role: "EMPLOYEE" as const },
    ];

    for (const u of extraUsers) {
      const existing = await prisma.user.findUnique({ where: { email: u.email } });
      if (!existing) {
        const user = await prisma.user.create({
          data: { name: u.name, email: u.email, passwordHash, role: u.role, isPlatformAdmin: false },
        });
        await prisma.tenantUser.create({ data: { tenantId, userId: user.id, role: u.role } });
        results.push(`Created user: ${u.email}`);
      } else {
        results.push(`User exists: ${u.email}`);
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    return NextResponse.json({ error: String(err), results }, { status: 500 });
  }
}
