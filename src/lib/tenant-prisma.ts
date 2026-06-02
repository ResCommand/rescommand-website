// Multi-tenant Prisma client
// - Default export = base (unscoped) client for backward compat
// - getTenantPrisma(tenantId) = scoped client that auto-filters by tenant
// - getPlatformPrisma() = unscoped client for super admin

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const basePrisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = basePrisma;

export { basePrisma as prisma };
export default basePrisma;

export function getPlatformPrisma() {
  return basePrisma;
}

/**
 * Returns a Prisma client that auto-scopes all queries to a specific tenant.
 * Uses $extends to inject tenantId on all reads/writes.
 */
export function getTenantPrisma(tenantId: number) {
  return basePrisma.$extends({
    name: "tenantScope",
    query: {
      $allModels: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async $allOperations({ model, operation, args, query }: any) {
          const TENANT_MODELS = new Set([
            "employeeCategory", "productCategory", "product", "productIngredient",
            "transaction", "transactionLine", "drinkLog", "donutLog", "vendor",
            "inventoryItem", "inventoryOrder", "inventoryOrderLine",
            "inventoryCount", "inventoryCountLine", "inventorySection",
            "orderRequest", "holidaySchedule", "weatherCache",
            "parSheet", "parSheetLine", "predictionModel",
            "overboardSchedule", "overboardLine", "cleaningTask", "cleaningLog",
            "maintenanceLog", "employeeHour", "sop", "dashboardLayout",
            "espressoDialLog", "recipeCategory", "recipe",
            "productionTargetOverride", "batchCompletion", "trayOverride",
            "prepItem", "notification", "notificationRead", "notificationRecipient",
            "shift", "availabilityBlock", "timeOffRequest",
            "scheduleTemplate", "templateShift", "moduleConfig",
            "greenCoffee", "roastProfile", "roastLog", "menuTask", "socialPost",
          ]);

          if (!TENANT_MODELS.has(model)) {
            return query(args);
          }

          const a = { ...(args || {}) };

          if (["findMany", "findFirst", "findUnique", "count", "aggregate", "groupBy"].includes(operation)) {
            a.where = { ...(a.where || {}), tenantId };
          }
          if (["updateMany", "deleteMany"].includes(operation)) {
            a.where = { ...(a.where || {}), tenantId };
          }
          if (operation === "create") {
            a.data = { ...(a.data || {}), tenantId };
          }
          if (operation === "update") {
            a.where = { ...(a.where || {}), tenantId };
          }
          if (operation === "delete") {
            a.where = { ...(a.where || {}), tenantId };
          }

          return query(a);
        },
      },
    },
  });
}