import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTenantId, getSessionContext } from "@/lib/tenant";

// ─── Day-of-week donut targets ────────────────────────────────
const DAY_TARGETS: Record<string, number> = {
  "1": 400, // Monday
  "2": 400, // Tuesday
  "3": 400, // Wednesday
  "4": 500, // Thursday
  "5": 600, // Friday
  "6": 900, // Saturday
  "0": 900, // Sunday
};

const SMALL_BATCH = 46;  // 2000g mixer
const LARGE_BATCH = 69;  // 3000g mixer
const TRAY_SIZE = 28;

// PUT /api/production-targets — override target for a specific date
export async function PUT(request: Request) {
  const { userId, tenantId, role } = await getSessionContext();

  const body = await request.json();
  const { date, target } = body;
  if (!date || typeof target !== "number" || target < 0)
    return NextResponse.json({ error: "date and target (number >= 0) required" }, { status: 400 });

  const parsed = new Date(date + "T00:00:00");
  if (isNaN(parsed.getTime()))
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });

  await prisma.productionTargetOverride.upsert({
    where: { tenantId_date: { tenantId: 1, date: parsed } },
    update: { target },
    create: { tenantId, date: parsed, target },
  });

  return NextResponse.json({ success: true, date, target });
}

// ─── Tray allocation per flavor per period ────────────────────
// period: "mon_wed" | "thu" | "fri" | "weekend"
interface FlavorAllocation {
  name: string;
  mon_wed: number;
  thu: number;
  fri: number;
  weekend: number;
}

const FLAVOR_ALLOCATIONS: FlavorAllocation[] = [
  { name: "M&M", mon_wed: 1.5, thu: 1.5, fri: 2, weekend: 3 },
  { name: "Fruity Pebble", mon_wed: 1, thu: 1, fri: 1, weekend: 2 },
  { name: "Cookies & Cream", mon_wed: 1, thu: 1, fri: 1, weekend: 2.5 },
  { name: "Vanilla", mon_wed: 2, thu: 2, fri: 2, weekend: 2.5 },
  { name: "Chocolate", mon_wed: 2, thu: 2, fri: 2, weekend: 3 },
  { name: "Strawberry", mon_wed: 1, thu: 2, fri: 2, weekend: 2 },
  { name: "Maple", mon_wed: 1, thu: 1.5, fri: 2, weekend: 3 },
  { name: "Blueberry Pie", mon_wed: 1, thu: 1, fri: 1.5, weekend: 2.5 },
  { name: "Boston Cream", mon_wed: 0.5, thu: 0.5, fri: 1, weekend: 2 },
  { name: "Brown Butter Cinnamon", mon_wed: 0.5, thu: 1, fri: 1.5, weekend: 2.5 },
  { name: "Lemon Glaze", mon_wed: 0.5, thu: 0.5, fri: 1, weekend: 1 },
  { name: "Nutella Churro / Cin & Sugar", mon_wed: 1, thu: 1.5, fri: 2, weekend: 3 },
  { name: "OB", mon_wed: 0.5, thu: 1, fri: 1, weekend: 1 },
  { name: "OB 2", mon_wed: 0.5, thu: 1, fri: 1, weekend: 1 },
  { name: "OB 3", mon_wed: 0.5, thu: 1, fri: 1, weekend: 1 },
];

// ─── Prep list items ──────────────────────────────────────────
interface PrepItem {
  category: string;
  categoryColor: string;
  name: string;
  amount: string;
  shelfLifeHours?: number;
}

const PREP_LIST: PrepItem[] = [
  // Glazes
  { category: "Glazes", categoryColor: "#DBEAFE", name: "Vanilla Glaze", amount: "8-10 Qts", shelfLifeHours: 48 },
  { category: "Glazes", categoryColor: "#DBEAFE", name: "Lemon Glaze", amount: "8-10 Qts", shelfLifeHours: 48 },
  { category: "Glazes", categoryColor: "#DBEAFE", name: "Brown Butter Cinnamon Glaze", amount: "8-10 Qts", shelfLifeHours: 48 },
  // Icings
  { category: "Icings", categoryColor: "#E8DEF8", name: "Vanilla Icing", amount: "3 #6 Pans", shelfLifeHours: 72 },
  { category: "Icings", categoryColor: "#E8DEF8", name: "Maple Icing", amount: "2 #6 Pans", shelfLifeHours: 72 },
  { category: "Icings", categoryColor: "#E8DEF8", name: "Salted Caramel Icing", amount: "2 #6 Pans", shelfLifeHours: 72 },
  { category: "Icings", categoryColor: "#E8DEF8", name: "Dark Choc. Ganache", amount: "2 #6 Pans", shelfLifeHours: 72 },
  { category: "Icings", categoryColor: "#E8DEF8", name: "Strawberry Icing", amount: "2 #6 Pans", shelfLifeHours: 48 },
  { category: "Icings", categoryColor: "#E8DEF8", name: "Blueberry Icing", amount: "2 #6 Pans", shelfLifeHours: 48 },
  // Jams/Creams
  { category: "Jams/Creams", categoryColor: "#FEF3C7", name: "Raspberry Jam", amount: "2-4 Qts", shelfLifeHours: 168 },
  { category: "Jams/Creams", categoryColor: "#FEF3C7", name: "Blueberry Jam", amount: "2-3 Qts", shelfLifeHours: 168 },
  { category: "Jams/Creams", categoryColor: "#FEF3C7", name: "Chocolate Cream", amount: "2 Qts", shelfLifeHours: 72 },
  { category: "Jams/Creams", categoryColor: "#FEF3C7", name: "Dulce Cream", amount: "1 Qt", shelfLifeHours: 48 },
  { category: "Jams/Creams", categoryColor: "#FEF3C7", name: "Milk Choc Ganache", amount: "1 Qt", shelfLifeHours: 72 },
  { category: "Jams/Creams", categoryColor: "#FEF3C7", name: "Brulee Cream", amount: "1 Qt", shelfLifeHours: 48 },
  { category: "Jams/Creams", categoryColor: "#FEF3C7", name: "Lemon Curd", amount: "2-3 Qts", shelfLifeHours: 72 },
  { category: "Jams/Creams", categoryColor: "#FEF3C7", name: "Cheesecake Cream", amount: "2 Qts", shelfLifeHours: 48 },
  { category: "Jams/Creams", categoryColor: "#FEF3C7", name: "Pastry Cream", amount: "4-6 Qts", shelfLifeHours: 48 },
  // Syrups/Sugar-Free
  { category: "Syrups/Sugar-Free", categoryColor: "#FEE2E2", name: "Vanilla Syrup", amount: "Full +2 qts", shelfLifeHours: 336 },
  { category: "Syrups/Sugar-Free", categoryColor: "#FEE2E2", name: "Salted Caramel Syrup", amount: "Full +2 qts", shelfLifeHours: 336 },
  { category: "Syrups/Sugar-Free", categoryColor: "#FEE2E2", name: "Brown Butter Cinnamon Syrup", amount: "Full +2 qts", shelfLifeHours: 336 },
  { category: "Syrups/Sugar-Free", categoryColor: "#FEE2E2", name: "Mocha Syrup", amount: "Full +2 qts", shelfLifeHours: 336 },
  { category: "Syrups/Sugar-Free", categoryColor: "#FEE2E2", name: "Blueberry Syrup", amount: "Full +2 qts", shelfLifeHours: 168 },
  { category: "Syrups/Sugar-Free", categoryColor: "#FEE2E2", name: "Vanilla Sugar Free", amount: "Full +2 qts", shelfLifeHours: 336 },
  { category: "Syrups/Sugar-Free", categoryColor: "#FEE2E2", name: "Blueberry Sugar Free", amount: "Full +2 qts", shelfLifeHours: 168 },
  { category: "Syrups/Sugar-Free", categoryColor: "#FEE2E2", name: "Strawberry", amount: "Full +2 qts", shelfLifeHours: 168 },
  { category: "Syrups/Sugar-Free", categoryColor: "#FEE2E2", name: "Strawberry Sugar Free", amount: "2-3 Bottles", shelfLifeHours: 168 },
  { category: "Syrups/Sugar-Free", categoryColor: "#FEE2E2", name: "Caramel Sauce Bottle", amount: "2-3 Bottles", shelfLifeHours: 336 },
];

function getPeriod(dayOfWeek: number): "mon_wed" | "thu" | "fri" | "weekend" {
  if (dayOfWeek === 0 || dayOfWeek === 6) return "weekend";
  if (dayOfWeek >= 1 && dayOfWeek <= 3) return "mon_wed";
  if (dayOfWeek === 4) return "thu";
  return "fri"; // 5
}

// ─── Sandwich par schedule ──────────────────────────────────────
// Sandwiches are made twice a week:
//   Monday  → covers Tue, Wed, Thu
//   Thursday → covers Fri, Sat, Sun, Mon
//
// Per-day raw par (before rounding):
//   BEC Sandwich:  5 weekday / 5 weekend
//   BEC Wrap:      3 weekday / 4 weekend
//   SEC Sandwich:  2 weekday / 3 weekend
//   SEC Wrap:      1 weekday / 2 weekend
//
// Make-day totals are rounded to nearest 5 (made in batches of 5).
// Thursday targets: 20, 15, 10, 5 = 50 total
// Monday targets:   15, 10, 5, 5  = 35 total
//
// Holidays during coverage → use weekend par for that day.
// Sandwiches only shown on make days (Mon/Thu).

interface SandwichParLine {
  name: string;
  weekdayPar: number;   // raw daily par
  weekendPar: number;    // raw daily par
}

const SANDWICH_PAR: SandwichParLine[] = [
  { name: "BEC Sandwich", weekdayPar: 5, weekendPar: 5 },
  { name: "BEC Wrap", weekdayPar: 3, weekendPar: 4 },
  { name: "SEC Sandwich", weekdayPar: 2, weekendPar: 3 },
  { name: "SEC Wrap", weekdayPar: 1, weekendPar: 2 },
];

// Round to nearest multiple of 5 for make-day totals
function roundTo5(n: number): number {
  if (n === 0) return 0;
  return Math.round(n / 5) * 5;
}

interface SandwichMakeDay {
  makeDay: number;
  makeDayLabel: string;
  covers: string[];
  coversDays: number[];
}

const SANDWICH_SCHEDULE: SandwichMakeDay[] = [
  {
    makeDay: 1,
    makeDayLabel: "Monday",
    covers: ["Tuesday", "Wednesday", "Thursday"],
    coversDays: [2, 3, 4],
  },
  {
    makeDay: 4,
    makeDayLabel: "Thursday",
    covers: ["Friday", "Saturday", "Sunday", "Monday"],
    coversDays: [5, 6, 0, 1],
  },
];

interface SandwichDayInfo {
  isMakeDay: boolean;
  makeDayLabel: string | null;
  covers: string[];
  itemsToMake: { name: string; quantity: number }[];
  totalToMake: number;
  dailyBreakdown: { date: string; dayLabel: string; isHoliday: boolean; isWeekend: boolean; items: { name: string; par: number }[] }[];
}

interface SandwichDayInfo {
  isMakeDay: boolean;
  makeDayLabel: string | null;
  covers: string[];
  itemsToMake: { name: string; quantity: number }[];
  totalToMake: number;
  dailyBreakdown: { date: string; dayLabel: string; isHoliday: boolean; isWeekend: boolean; items: { name: string; par: number }[] }[];
}

// Holiday-aware sandwich info for a specific date
// makeDate: the date we're viewing (to check if it's a make day)
// holidays: map of "YYYY-MM-DD" → holiday name for the next ~7 days
async function getSandwichInfoForDate(viewingDate: Date, dayOfWeek: number, tenantId: number): Promise<SandwichDayInfo> {
  const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Is today a make day?
  const isMakeDay = dayOfWeek === 1 || dayOfWeek === 4;

  if (!isMakeDay) {
    return {
      isMakeDay: false,
      makeDayLabel: null,
      covers: [],
      itemsToMake: [],
      totalToMake: 0,
      dailyBreakdown: [],
    };
  }

  const makeDayLabel = dayOfWeek === 1 ? "Monday" : "Thursday";

  // Determine the coverage dates
  const coverDates: Date[] = [];
  if (dayOfWeek === 1) {
    // Monday → Tue, Wed, Thu
    for (let offset = 1; offset <= 3; offset++) {
      const d = new Date(viewingDate);
      d.setDate(d.getDate() + offset);
      coverDates.push(d);
    }
  } else {
    // Thursday → Fri, Sat, Sun, Mon
    for (let offset = 1; offset <= 4; offset++) {
      const d = new Date(viewingDate);
      d.setDate(d.getDate() + offset);
      coverDates.push(d);
    }
  }

  // Check holidays for each coverage date
  const dailyBreakdown: SandwichDayInfo["dailyBreakdown"] = [];
  const itemsToMake: { name: string; quantity: number }[] = SANDWICH_PAR.map(s => ({ name: s.name, quantity: 0 }));

  for (const coverDate of coverDates) {
    const coverDow = coverDate.getDay();
    const isWeekend = coverDow === 0 || coverDow === 6;
    const coverDateStr = coverDate.toISOString().split("T")[0];

    // Check if this specific date is a holiday
    const holiday = await prisma.holidaySchedule.findFirst({
      where: { tenantId, date: coverDate },
    });
    const isHoliday = !!holiday;
    const useWeekendPar = isWeekend || isHoliday;

    const dayItems = SANDWICH_PAR.map(s => {
      const rawPar = useWeekendPar ? s.weekendPar : s.weekdayPar;
      return { name: s.name, par: rawPar };
    });

    dailyBreakdown.push({
      date: coverDateStr,
      dayLabel: DAY_NAMES[coverDow],
      isHoliday,
      isWeekend,
      items: dayItems,
    });

    // Accumulate raw par for make-day total
    dayItems.forEach((item, i) => {
      itemsToMake[i].quantity += item.par;
    });
  }

  // Round make-day totals to nearest 5 (made in batches of 5)
  itemsToMake.forEach(item => { item.quantity = roundTo5(item.quantity); });
  const totalToMake = itemsToMake.reduce((sum, item) => sum + item.quantity, 0);

  const covers = dailyBreakdown.map(d =>
    `${d.dayLabel}${d.isHoliday ? " (Holiday)" : d.isWeekend ? " (Weekend)" : ""}`
  );

  return {
    isMakeDay: true,
    makeDayLabel,
    covers,
    itemsToMake,
    totalToMake,
    dailyBreakdown,
  };
}

function calculateBatches(target: number) {
  // Strategy: run both mixers in tandem as much as possible.
  // Rather than maxing out the large mixer and leaving the small idle,
  // we want the total batch count split so both run close to the same
  // number of cycles (ideally alternating 1:1).
  //
  // We find the combo of large + small batches that:
  //   1) Meets or slightly exceeds the target
  //   2) Minimizes the gap between large and small batch counts
  //      so both mixers stay busy back-to-back

  let bestLarge = 0;
  let bestSmall = 0;
  let bestTotal = Infinity;
  let bestGap = Infinity;

  // Upper bound on large batches: even if we used only large
  const maxLarge = Math.ceil(target / LARGE_BATCH);

  for (let l = maxLarge; l >= 0; l--) {
    const remainder = target - l * LARGE_BATCH;
    const s = remainder <= 0 ? 0 : Math.ceil(remainder / SMALL_BATCH);
    const total = l * LARGE_BATCH + s * SMALL_BATCH;

    // We want to meet the target (or slightly exceed it within 15%)
    if (total < target) continue;
    if (total > target * 1.15) continue;

    // Gap between batch counts — smaller = more balanced
    const gap = Math.abs(l - s);

    // Prefer: fewer total donuts (less waste), then smaller gap
    if (gap < bestGap || (gap === bestGap && total < bestTotal)) {
      bestLarge = l;
      bestSmall = s;
      bestTotal = total;
      bestGap = gap;
    }
  }

  // Fallback (shouldn't happen)
  if (bestTotal === Infinity) {
    bestLarge = Math.ceil(target / LARGE_BATCH);
    bestSmall = 0;
    bestTotal = bestLarge * LARGE_BATCH;
  }

  return { large: bestLarge, small: bestSmall, totalDonuts: bestTotal, overProduction: bestTotal - target };
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = await getTenantId();

  // Accept optional ?date=YYYY-MM-DD query param
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");

  const targetDate = new Date();
  if (dateParam) {
    const parsed = new Date(dateParam + "T00:00:00");
    if (!isNaN(parsed.getTime())) {
      targetDate.setTime(parsed.getTime());
    }
  }
  targetDate.setHours(0, 0, 0, 0);

  const dayOfWeek = targetDate.getDay();

  // Check if this date is a holiday → use weekend target
  const holiday = await prisma.holidaySchedule.findFirst({
    where: { tenantId, date: targetDate },
  });

  const isWeekendOrHoliday = dayOfWeek === 0 || dayOfWeek === 6 || !!holiday;
  const defaultTarget = isWeekendOrHoliday ? 900 : (DAY_TARGETS[dayOfWeek.toString()] || 400);

  // Check for saved override
  const override = await prisma.productionTargetOverride.findUnique({
    where: { tenantId_date: { tenantId: 1, date: targetDate } },
  });
  const target = override ? override.target : defaultTarget;
  const period = isWeekendOrHoliday ? "weekend" : getPeriod(dayOfWeek);

  const batches = calculateBatches(target);
  const totalTrays = Math.ceil(target / TRAY_SIZE);

  const trayAllocations = FLAVOR_ALLOCATIONS.map(f => ({
    name: f.name,
    trays: f[period],
    donuts: Math.round(f[period] * TRAY_SIZE),
  }));

  // Sandwich info — only populated on make days (Mon/Thu)
  const sandwichToday = await getSandwichInfoForDate(targetDate, dayOfWeek, tenantId);

  // Load prep list from database (editable), fall back to hardcoded if empty
  let prepList = PREP_LIST;
  try {
    const dbPrepItems = await prisma.prepItem.findMany({
      where: { tenantId, active: true },
      orderBy: { sortOrder: "asc" },
    });
    if (dbPrepItems.length > 0) {
      prepList = dbPrepItems.map(item => ({
        category: item.category,
        categoryColor: item.categoryColor,
        name: item.name,
        amount: item.amount,
        shelfLifeHours: item.shelfLifeHours,
      }));
    }
  } catch { /* keep hardcoded fallback */ }

  // Load tray overrides for this date
  const trayOverrides = await prisma.trayOverride.findMany({
    where: { tenantId, date: targetDate },
  });
  const overrideMap = new Map(trayOverrides.map(o => [o.flavor, o.trays]));

  // Apply overrides to tray allocations
  const finalTrayAllocations = trayAllocations.map(a => {
    const override = overrideMap.get(a.name);
    return override !== undefined ? { ...a, trays: override, donuts: Math.round(override * TRAY_SIZE) } : a;
  });

  return NextResponse.json({
    date: targetDate.toISOString(),
    dayOfWeek,
    dayLabel: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayOfWeek],
    isHoliday: !!holiday,
    holidayName: holiday?.name || null,
    target,
    period,
    batches,
    traySize: TRAY_SIZE,
    totalTrays,
    trayAllocations: finalTrayAllocations,
    prepList,
    sandwichToday,
  });
}