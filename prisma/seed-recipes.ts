import { PrismaClient } from "@prisma/client";

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
];

async function main() {
  for (const recipe of recipes) {
    await prisma.recipe.upsert({
      where: { id: recipes.indexOf(recipe) + 1 },
      update: {
        name: recipe.name,
        category: recipe.category,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        yield: recipe.yield,
        sortOrder: recipe.sortOrder,
      },
      create: {
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
  }
  console.log(`Seeded ${recipes.length} recipes`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
