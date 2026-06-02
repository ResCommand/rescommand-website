import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const fmt = (n: number) => "$" + n.toFixed(2);
const pct = (n: number) => n.toFixed(1) + "%";

function startOfDay(d: Date) { const r = new Date(d); r.setHours(0,0,0,0); return r; }
function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function startOfPrevMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth() - 1, 1); }
function endOfPrevMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 0, 23, 59, 59, 999); }

export default async function OwnerPage() {
  const session = await getServerSession(authOptions);
  const now = new Date();
  const today = startOfDay(now);
  const monthStart = startOfMonth(now);
  const prevMonthStart = startOfPrevMonth(now);
  const prevMonthEnd = endOfPrevMonth(now);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysInPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  const dayOfMonth = now.getDate();
  const prevMonthSameDay = Math.min(dayOfMonth, daysInPrevMonth);

  // Today
  const [todayTx, todayDonuts, todayDrinks, todayOverboards] = await Promise.all([
    prisma.transaction.findMany({ where: { createdAt: { gte: today } } }),
    prisma.donutLog.findMany({ where: { createdAt: { gte: today } } }),
    prisma.drinkLog.findMany({ where: { createdAt: { gte: today } } }),
    prisma.overboardSchedule.findMany({ where: { date: { gte: today } }, include: { lines: true } }),
  ]);

  const todayRevenue = todayTx.reduce((s, t) => s + t.totalAmount, 0);
  const todayTicketCount = todayTx.length;
  const todayDonutsSold = todayDonuts.reduce((s, d) => s + d.sold, 0);
  const todayDrinksCount = todayDrinks.length;
  let todayOBRevenue = 0, todayOBUpcharges = 0;
  todayOverboards.forEach(s => s.lines.forEach(l => {
    todayOBRevenue += l.quantitySold * l.unitPrice;
    todayOBUpcharges += l.upchargesSold * l.upchargePrice;
  }));

  // MTD
  const [mtdTx, mtdDonuts, mtdDrinks] = await Promise.all([
    prisma.transaction.findMany({ where: { createdAt: { gte: monthStart } } }),
    prisma.donutLog.findMany({ where: { createdAt: { gte: monthStart } } }),
    prisma.drinkLog.findMany({ where: { createdAt: { gte: monthStart } } }),
  ]);

  const mtdRevenue = mtdTx.reduce((s, t) => s + t.totalAmount, 0);
  const mtdTicketCount = mtdTx.length;
  const mtdDonutsSold = mtdDonuts.reduce((s, d) => s + d.sold, 0);
  const mtdDrinksCount = mtdDrinks.length;
  const mtdAvgTicket = mtdTicketCount > 0 ? mtdRevenue / mtdTicketCount : 0;

  // Previous month (same day count for fair comparison)
  const prevMonthCompareEnd = new Date(prevMonthStart);
  prevMonthCompareEnd.setDate(prevMonthSameDay);
  prevMonthCompareEnd.setHours(23, 59, 59, 999);

  const [prevTx, prevDonuts] = await Promise.all([
    prisma.transaction.findMany({ where: { createdAt: { gte: prevMonthStart, lte: prevMonthCompareEnd } } }),
    prisma.donutLog.findMany({ where: { createdAt: { gte: prevMonthStart, lte: prevMonthCompareEnd } } }),
  ]);

  const prevRevenue = prevTx.reduce((s, t) => s + t.totalAmount, 0);
  const prevTicketCount = prevTx.length;
  const prevDonutsSold = prevDonuts.reduce((s, d) => s + d.sold, 0);
  const prevAvgTicket = prevTicketCount > 0 ? prevRevenue / prevTicketCount : 0;

  // Full previous month
  const [fullPrevTx] = await Promise.all([
    prisma.transaction.findMany({ where: { createdAt: { gte: prevMonthStart, lte: prevMonthEnd } } }),
  ]);
  const fullPrevRevenue = fullPrevTx.reduce((s, t) => s + t.totalAmount, 0);

  // Inventory value
  const inventory = await prisma.inventoryItem.findMany();
  const invValue = inventory.reduce((s, i) => s + (i.unitCost || 0) * (i.currentStock || 0), 0);

  // Change helpers
  const change = (curr: number, prev: number) => prev > 0 ? ((curr - prev) / prev * 100) : 0;
  const changeStyle = (v: number) => ({ color: v >= 0 ? "#059669" : "#DC2626" });
  const changeLabel = (v: number) => (v >= 0 ? "+" : "") + v.toFixed(1) + "%";

  const todayCards = [
    { label: "Revenue", value: fmt(todayRevenue), sub: `${todayTicketCount} tickets` },
    { label: "Donuts Sold", value: String(todayDonutsSold), sub: "Today" },
    { label: "Drinks", value: String(todayDrinksCount), sub: "Today" },
    { label: "Menu Plan Rev", value: fmt(todayOBRevenue), sub: fmt(todayOBUpcharges) + " upcharges" },
  ];

  const mtdCards = [
    { label: "MTD Revenue", value: fmt(mtdRevenue), sub: `${mtdTicketCount} tickets` },
    { label: "MTD Avg Ticket", value: fmt(mtdAvgTicket), sub: "Month to date" },
    { label: "MTD Donuts", value: String(mtdDonutsSold), sub: "Month to date" },
    { label: "MTD Drinks", value: String(mtdDrinksCount), sub: "Month to date" },
  ];

  const compareCards = [
    { label: "Revenue", mtd: mtdRevenue, prev: prevRevenue, mtdFmt: fmt(mtdRevenue), prevFmt: fmt(prevRevenue) },
    { label: "Avg Ticket", mtd: mtdAvgTicket, prev: prevAvgTicket, mtdFmt: fmt(mtdAvgTicket), prevFmt: fmt(prevAvgTicket) },
    { label: "Tickets", mtd: mtdTicketCount, prev: prevTicketCount, mtdFmt: String(mtdTicketCount), prevFmt: String(prevTicketCount) },
    { label: "Donuts Sold", mtd: mtdDonutsSold, prev: prevDonutsSold, mtdFmt: String(mtdDonutsSold), prevFmt: String(prevDonutsSold) },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1>Financials</h1>
        <p className="text-sm text-gray">Revenue, costs, and month-over-month tracking</p>
      </div>

      {/* Today */}
      <div className="section">
        <h3 className="section-title">Today</h3>
        <div className="grid-4">
          {todayCards.map(c => (
            <div key={c.label} className="stat-card">
              <div className="stat-label" style={{ marginBottom: 4 }}>{c.label}</div>
              <div className="stat-value">{c.value}</div>
              <div className="stat-sub">{c.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* MTD */}
      <div className="section">
        <h3 className="section-title">Month to Date ({now.toLocaleDateString("en-US", { month: "long", year: "numeric" })})</h3>
        <div className="grid-4">
          {mtdCards.map(c => (
            <div key={c.label} className="stat-card">
              <div className="stat-label" style={{ marginBottom: 4 }}>{c.label}</div>
              <div className="stat-value">{c.value}</div>
              <div className="stat-sub">{c.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* MTD vs Last Month */}
      <div className="section">
        <h3 className="section-title">MTD vs Last Month (same {dayOfMonth} days)</h3>
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>This Month</th>
                <th>Last Month</th>
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              {compareCards.map(c => {
                const ch = change(c.mtd, c.prev);
                return (
                  <tr key={c.label}>
                <td className="font-medium">{c.label}</td>
                <td>{c.mtdFmt}</td>
                <td>{c.prevFmt}</td>
                <td style={changeStyle(ch)}>
                  <span className="font-semibold">{changeLabel(ch)}</span>
                </td>
              </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Last Month Full */}
      <div className="section">
        <h3 className="section-title">Last Month (Full)</h3>
        <div className="grid-3">
          <div className="stat-card">
            <div className="stat-label" style={{ marginBottom: 4 }}>Full Month Revenue</div>
            <div className="stat-value">{fmt(fullPrevRevenue)}</div>
            <div className="stat-sub">{daysInPrevMonth} days</div>
          </div>
          <div className="stat-card">
            <div className="stat-label" style={{ marginBottom: 4 }}>Daily Avg (Last Month)</div>
            <div className="stat-value">{fmt(fullPrevRevenue / daysInPrevMonth)}</div>
            <div className="stat-sub">Per day average</div>
          </div>
          <div className="stat-card">
            <div className="stat-label" style={{ marginBottom: 4 }}>Projected This Month</div>
            <div className="stat-value">{fmt(mtdRevenue / dayOfMonth * daysInMonth)}</div>
            <div className="stat-sub">Based on {dayOfMonth} days of data</div>
          </div>
        </div>
      </div>

      {/* Inventory Value */}
      <div className="section">
        <h3 className="section-title">Inventory</h3>
        <div className="grid-3">
          <div className="stat-card">
            <div className="stat-label" style={{ marginBottom: 4 }}>Inventory Value</div>
            <div className="stat-value">{fmt(invValue)}</div>
            <div className="stat-sub">{inventory.length} items tracked</div>
          </div>
          <div className="stat-card">
            <div className="stat-label" style={{ marginBottom: 4 }}>Days Remaining</div>
            <div className="stat-value">{daysInMonth - dayOfMonth}</div>
            <div className="stat-sub">In current month</div>
          </div>
          <div className="stat-card">
            <div className="stat-label" style={{ marginBottom: 4 }}>COGS Placeholder</div>
            <div className="stat-value">—</div>
            <div className="stat-sub">Coming soon</div>
          </div>
        </div>
      </div>
    </div>
  );
}