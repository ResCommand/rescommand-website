// Migration script: Add tenant_id to all business tables
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

const BUSINESS_TABLES = [
  "employee_categories", "product_categories", "products", "product_ingredients",
  "transactions", "transaction_lines", "drink_logs", "donut_logs", "vendors",
  "inventory_items", "inventory_orders", "inventory_order_lines",
  "inventory_counts", "inventory_count_lines", "inventory_sections",
  "order_requests", "holiday_schedules", "weather_cache",
  "par_sheets", "par_sheet_lines", "prediction_models",
  "overboard_schedules", "overboard_lines", "cleaning_tasks", "cleaning_logs",
  "maintenance_logs", "employee_hours", "sops", "dashboard_layouts",
  "espresso_dial_logs", "recipe_categories", "recipes",
  "production_target_overrides", "batch_completions", "tray_overrides",
  "prep_items", "notifications", "notification_reads", "notification_recipients",
  "shifts", "availability_blocks", "time_off_requests",
  "schedule_templates", "template_shifts", "module_configs",
  "green_coffees", "roast_profiles", "roast_logs", "menu_tasks", "social_posts",
];

async function migrate() {
  console.log("Adding tenant_id to", BUSINESS_TABLES.length, "tables...\n");

  for (const table of BUSINESS_TABLES) {
    try {
      await p.$executeRawUnsafe(
        `ALTER TABLE \`${table}\` ADD COLUMN \`tenant_id\` INT NOT NULL DEFAULT 1`
      );
      console.log(`  ADD OK: ${table}`);
    } catch (e) {
      if (e.message.includes("Duplicate column")) {
        console.log(`  SKIP: ${table} (tenant_id already exists)`);
      } else {
        console.log(`  ERROR: ${table}: ${e.message.substring(0, 80)}`);
      }
    }
  }

  console.log("\nAdding FK constraints...");
  for (const table of BUSINESS_TABLES) {
    try {
      await p.$executeRawUnsafe(
        `ALTER TABLE \`${table}\` ADD CONSTRAINT \`fk_${table}_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tenants\`(\`id\`)`
      );
      console.log(`  FK OK: ${table}`);
    } catch (e) {
      if (e.message.includes("Duplicate")) {
        console.log(`  FK SKIP: ${table}`);
      } else {
        console.log(`  FK ERROR: ${table}: ${e.message.substring(0, 80)}`);
      }
    }
  }

  // Remove the DEFAULT 1 — Prisma expects tenantId without a default
  console.log("\nRemoving DEFAULT 1...");
  for (const table of BUSINESS_TABLES) {
    try {
      await p.$executeRawUnsafe(
        `ALTER TABLE \`${table}\` ALTER \`tenant_id\` DROP DEFAULT`
      );
    } catch (e) {
      // OK if fails — just means no default to drop
    }
  }

  console.log("\nDone! Run: npx prisma db push");
  await p.$disconnect();
}

migrate();