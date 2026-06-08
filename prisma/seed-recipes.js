const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const recipes = [
  {
    name: "Whipped Cream",
    category: "topping",
    description: "Basic whipped cream for topping donuts",
    ingredients: [
      { name: "Heavy Cream", amount: "1", unit: "qt" },
      { name: "Sugar", amount: "1/2", unit: "cup" },
      { name: "Vanilla", amount: "1", unit: "tsp" },
      { name: "Salt", amount: "1", unit: "tsp" },
    ],
    instructions: "Whip to desired peaks.",
    yield: "Makes ~1 quart",
    sortOrder: 10,
  },
  {
    name: "Pecan Paste",
    category: "filling",
    description: "Caramelized pecan paste for praline fillings",
    ingredients: [
      { name: "Pecans", amount: "960", unit: "g" },
      { name: "Sugar", amount: "640", unit: "g" },
      { name: "Water", amount: "200", unit: "g" },
    ],
    instructions: "Make syrup, caramelize pecans, cool, process into paste.",
    yield: "Makes ~1.8 kg",
    sortOrder: 20,
  },
  {
    name: "Creme Brulee Cream",
    category: "filling",
    description: "Spiced cream filling for creme brulee donuts",
    ingredients: [
      { name: "Pastry Cream", amount: "800", unit: "g" },
      { name: "Cinnamon", amount: "1", unit: "tsp" },
      { name: "Ginger", amount: "1/2", unit: "tsp" },
      { name: "Cardamom", amount: "1", unit: "pinch" },
      { name: "Nutmeg", amount: "1", unit: "pinch" },
      { name: "Orange Zest", amount: "1/2", unit: "orange" },
    ],
    instructions: "Fold spices and zest into pastry cream until evenly combined.",
    yield: "Makes ~800g",
    sortOrder: 30,
  },
  {
    name: "Praline Pastry Cream",
    category: "filling",
    description: "Praline-flavored pastry cream for filled donuts",
    ingredients: [
      { name: "Praline Paste", amount: "55", unit: "g" },
      { name: "Pastry Cream", amount: "600", unit: "g" },
      { name: "Salt", amount: "6", unit: "g" },
    ],
    instructions: "Fold praline paste and salt into pastry cream until smooth.",
    yield: "Makes ~660g",
    sortOrder: 40,
  },
  {
    name: "Chocolate Cream",
    category: "filling",
    description: "Chocolate pastry cream for filled donuts",
    ingredients: [
      { name: "Pastry Cream", amount: "600", unit: "g" },
      { name: "Milk Chocolate Soft Ganache", amount: "300", unit: "g" },
      { name: "Salt", amount: "5", unit: "g" },
    ],
    instructions: "Fold ganache and salt into pastry cream until smooth and evenly colored.",
    yield: "Makes ~900g",
    sortOrder: 50,
  },
  {
    name: "Dulce de Leche Cream",
    category: "filling",
    description: "Dulce de leche cream for filled donuts",
    ingredients: [
      { name: "Dulce de Leche", amount: "370", unit: "g" },
      { name: "Pastry Cream", amount: "350", unit: "g" },
      { name: "Salt", amount: "1", unit: "tsp" },
    ],
    instructions: "Fold dulce de leche and salt into pastry cream until fully incorporated.",
    yield: "Makes ~720g",
    sortOrder: 60,
  },
  {
    name: "Milk Soft Ganache",
    category: "base",
    description: "Milk chocolate ganache used in chocolate cream and other recipes",
    ingredients: [
      { name: "Milk Chocolate", amount: "2", unit: "lb" },
      { name: "Heavy Cream", amount: "40", unit: "oz" },
      { name: "Salt", amount: "1/2", unit: "Tbsp" },
    ],
    instructions: "Heat cream to a simmer, pour over chocolate. Let sit 1 minute, stir until smooth. Add salt.",
    yield: "Makes ~56 oz",
    sortOrder: 5,
  },
  {
    name: "Raspberry/Strawberry Jam",
    category: "filling",
    description: "Berry jam for filled donuts",
    ingredients: [
      { name: "Berries (Raspberry or Strawberry)", amount: "4", unit: "lb" },
      { name: "Sugar", amount: "1200", unit: "g" },
      { name: "Lemon Juice", amount: "2.5", unit: "Tbsp" },
      { name: "Salt", amount: "3/4", unit: "Tbsp" },
    ],
    instructions: "Combine berries, sugar, lemon juice, and salt in a heavy pot. Cook over medium heat, stirring frequently, until thickened and reaches setting point. Cool before using.",
    yield: "Makes ~2.5 kg",
    sortOrder: 70,
  },
  {
    name: "NY Cheesecake Cream",
    category: "filling",
    description: "New York-style cheesecake cream for filled donuts",
    ingredients: [
      { name: "Cream Cheese", amount: "16", unit: "oz" },
      { name: "Butter", amount: "6", unit: "oz" },
      { name: "Vanilla", amount: "1", unit: "tsp" },
      { name: "White Chocolate", amount: "4", unit: "oz" },
      { name: "10X Sugar (Powdered)", amount: "24", unit: "oz" },
      { name: "Lemon Juice", amount: "1", unit: "tsp" },
      { name: "Salt", amount: "1", unit: "tsp" },
    ],
    instructions: "Cream together cream cheese and butter until smooth. Add vanilla, melted white chocolate, and mix. Gradually add 10X sugar. Finish with lemon juice and salt.",
    yield: "Makes ~50 oz",
    sortOrder: 80,
  },
  {
    name: "Egg Squares",
    category: "sandwiches",
    description: "Batch egg squares for breakfast sandwiches. Oven Settings: Top Oven 3.5, Bottom Oven 4.5",
    ingredients: [
      { name: "Eggs", amount: "48", unit: "whole" },
      { name: "Ricotta cheese", amount: "2", unit: "cups" },
    ],
    instructions: "1. Butter the sheet pan.\n2. Crack 48 eggs into a large pitcher or mixing container.\n3. Add 2 cups ricotta cheese.\n4. Blend with an immersion blender until fully combined.\n5. Pour mixture into prepared sheet pan.\n6. Bake for approximately 20 minutes.\n7. Rotate pan halfway through baking.\n8. Bake until eggs are fully set.\n9. Remove from oven and cool slightly.\n10. Cut into 24 equal squares.",
    yield: "24 egg portions (one per sandwich)",
    sortOrder: 10,
  },
  {
    name: "Sausage Patties",
    category: "sandwiches",
    description: "Batch sausage patties for breakfast sandwiches.",
    ingredients: [
      { name: "Sausage patties (4 oz each)", amount: "24", unit: "each" },
    ],
    instructions: "1. Line a baking sheet with parchment paper.\n2. Place baking rack on top of sheet pan.\n3. Arrange 24 sausage patties evenly on rack.\n4. Bake until fully cooked and internal temperature reaches food-safe standards.\n5. Hold for sandwich assembly.",
    yield: "24 sausage portions",
    sortOrder: 20,
  },
  {
    name: "Bacon",
    category: "sandwiches",
    description: "Batch bacon for breakfast sandwiches.",
    ingredients: [
      { name: "Bacon slices", amount: "24", unit: "slices" },
    ],
    instructions: "1. Line baking sheet with parchment paper.\n2. Place baking rack on baking sheet.\n3. Arrange 24 slices of bacon on rack.\n4. Bake for 15-20 minutes, or until desired crispness is reached.\n5. Remove and drain if needed.",
    yield: "24 bacon portions",
    sortOrder: 30,
  },
  {
    name: "Breakfast Sandwich Assembly",
    category: "sandwiches",
    description: "Assembly guide for Sausage Egg & Cheese and Bacon Egg & Cheese breakfast sandwiches. One batch of eggs yields 24 sandwiches. One sheet of bacon yields 24 bacon sandwiches. One tray of sausage yields 24 sausage sandwiches. Label and date all prepared ingredients according to food safety procedures.",
    ingredients: [
      { name: "Sandwich rolls", amount: "24", unit: "each" },
      { name: "Egg squares", amount: "24", unit: "each" },
      { name: "Sausage patties (4 oz each)", amount: "24", unit: "each" },
      { name: "Bacon slices", amount: "24", unit: "slices" },
      { name: "Cheese slices", amount: "24", unit: "each" },
    ],
    instructions: "SAUSAGE, EGG & CHEESE:\n- 1 sandwich roll\n- 1 egg square\n- 1 sausage patty\n- 1 slice cheese\n\nBACON, EGG & CHEESE:\n- 1 sandwich roll\n- 1 egg square\n- 1 bacon slice portion\n- 1 slice cheese\n\nPRODUCTION NOTES:\n- One batch of eggs yields 24 sandwiches.\n- One sheet of bacon yields 24 bacon sandwiches.\n- One tray of sausage yields 24 sausage sandwiches.\n- Label and date all prepared ingredients according to food safety procedures.",
    yield: "24 sandwiches",
    sortOrder: 40,
  },
];

async function main() {
  // Ensure Sandwiches category exists
  const existingCats = await prisma.recipeCategory.findMany({ where: { tenantId: 1 } });
  if (!existingCats.some(c => c.slug === "sandwiches")) {
    await prisma.recipeCategory.create({
      data: {
        tenantId: 1,
        name: "Sandwiches",
        slug: "sandwiches",
        icon: "🥪",
        color: "#FEF3C7",
        sortOrder: 10,
      },
    });
  }

  // Only CREATE recipes that don't exist yet — never overwrite user edits
  const existingNames = new Set(
    (await prisma.recipe.findMany({ where: { tenantId: 1 }, select: { name: true } }))
      .map(r => r.name)
  );

  let created = 0;
  for (const recipe of recipes) {
    if (!existingNames.has(recipe.name)) {
      await prisma.recipe.create({
        data: {
          tenantId: 1,
          name: recipe.name,
          category: recipe.category,
          description: recipe.description,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          yield: recipe.yield,
          sortOrder: recipe.sortOrder,
        },
      });
      created++;
    }
  }
  console.log(`Recipes: ${existingNames.size} existing, ${created} new seeded`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
