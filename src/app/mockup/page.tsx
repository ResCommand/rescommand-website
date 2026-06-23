/* eslint-disable @typescript-eslint/no-explicit-any */
export const metadata = { title: "ResCommand — Redesign Mockup" };

export default function MockupPage() {
  return (
    <div dangerouslySetInnerHTML={{ __html: rawHtml }} />
  );
}

const rawHtml = `
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
  body { margin: 0; background: #F6F5FB; color: #1a1a2e; }
  .gravy-purple { color: #7C3AED; }
  .bg-gravy { background: #7C3AED; }
  .bg-gravy-light { background: #F3EEFF; }
  .card-shadow { box-shadow: 0 2px 12px rgba(124, 58, 237, 0.06); }
  .card-shadow-lg { box-shadow: 0 8px 30px rgba(124, 58, 237, 0.10); }
  .sidebar-gradient { background: linear-gradient(180deg, #1E1033 0%, #2D1B4E 100%); }
  .pill { border-radius: 999px; padding: 4px 12px; font-size: 12px; font-weight: 600; display: inline-block; }
  .nav-item { transition: all 0.15s ease; cursor: pointer; }
  .nav-item:hover { background: rgba(124, 58, 237, 0.15); }
  .nav-item.active { background: rgba(124, 58, 237, 0.2); border-left: 3px solid #7C3AED; }
  .stat-number { font-weight: 800; font-size: 32px; letter-spacing: -0.02em; }
  .gradient-text { background: linear-gradient(135deg, #7C3AED 0%, #A855F7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .checkmark-purple { width: 20px; height: 20px; background: #7C3AED; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: #fff; font-size: 10px; }
  .animate-float { animation: float 3s ease-in-out infinite; }
  @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: #F6F5FB; }
  ::-webkit-scrollbar-thumb { background: #D1C5F0; border-radius: 4px; }
  table { border-collapse: collapse; }
  th, td { text-align: left; }
  a { text-decoration: none; color: inherit; }
  button { cursor: pointer; border: none; background: none; }
</style>

<!-- ═══════════════════════════════════════════════════════════════
     DASHBOARD
     ═══════════════════════════════════════════════════════════════ -->
<div style="min-height:100vh; display:flex;">

  <!-- SIDEBAR -->
  <aside style="width:256px; min-height:100vh; display:flex; flex-direction:column; padding:24px 16px; position:sticky; top:0; height:100vh; overflow-y:auto;" class="sidebar-gradient">
    <!-- Logo -->
    <div style="display:flex; align-items:center; gap:12px; padding:0 12px; margin-bottom:32px;">
      <div style="width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center;" class="bg-gravy">
        <svg style="width:24px; height:24px; color:white;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <div>
        <div style="color:white; font-weight:700; font-size:18px; letter-spacing:-0.02em;">ResCommand</div>
        <div style="color:#C4B5FD; font-size:12px;">Duffers Donut Shop</div>
      </div>
    </div>

    <!-- Nav -->
    <nav style="display:flex; flex-direction:column; gap:4px;">
      <div style="padding:8px 12px; color:#A78BFA; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;">Main</div>

      <div class="nav-item active" style="display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:12px; color:white;">
        <span>📊</span> Dashboard
      </div>
      <div class="nav-item" style="display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:12px; color:#C4B5FD;">
        <span>📦</span> Inventory
      </div>
      <div class="nav-item" style="display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:12px; color:#C4B5FD;">
        <span>📋</span> Recipes
      </div>
      <div class="nav-item" style="display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:12px; color:#C4B5FD;">
        <span>✅</span> Par Sheets
      </div>
      <div class="nav-item" style="display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:12px; color:#C4B5FD;">
        <span>📅</span> Schedule
      </div>
      <div class="nav-item" style="display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:12px; color:#C4B5FD;">
        <span>🎯</span> Production
      </div>

      <div style="padding:20px 12px 8px; color:#A78BFA; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;">Insights</div>

      <div class="nav-item" style="display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:12px; color:#C4B5FD;">
        <span>💰</span> Labor Costs
      </div>
      <div class="nav-item" style="display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:12px; color:#C4B5FD;">
        <span>📈</span> Reports
      </div>
      <div class="nav-item" style="display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:12px; color:#C4B5FD;">
        <span>🏪</span> Locations
      </div>

      <div style="padding:20px 12px 8px; color:#A78BFA; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;">Team</div>

      <div class="nav-item" style="display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:12px; color:#C4B5FD;">
        <span>👥</span> Employees
      </div>
      <div class="nav-item" style="display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:12px; color:#C4B5FD;">
        <span>💬</span> <span style="flex:1;">Messages</span> <span class="bg-gravy pill" style="color:white;">3</span>
      </div>
      <div class="nav-item" style="display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:12px; color:#C4B5FD;">
        <span>🎓</span> Training
      </div>
    </nav>

    <!-- User -->
    <div style="margin-top:auto; padding-top:24px;">
      <div style="background:rgba(88,28,135,0.4); border-radius:16px; padding:16px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="width:40px; height:40px; border-radius:50%; background:linear-gradient(135deg,#A855F7,#7C3AED); display:flex; align-items:center; justify-content:center; color:white; font-weight:700; font-size:14px;">SG</div>
          <div style="flex:1; min-width:0;">
            <div style="color:white; font-size:14px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">Shawn Garrison</div>
            <div style="color:#A78BFA; font-size:12px;">Platform Admin</div>
          </div>
        </div>
      </div>
    </div>
  </aside>

  <!-- MAIN -->
  <main style="flex:1; padding:32px; overflow-x:hidden;">

    <!-- Header -->
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:32px;">
      <div>
        <h1 style="font-size:28px; font-weight:800; letter-spacing:-0.02em; margin:0;">Good morning, Shawn 👋</h1>
        <p style="color:#6B7280; margin:4px 0 0;">Here&apos;s what&apos;s happening at Duffers Donut Shop today.</p>
      </div>
      <div style="display:flex; gap:12px;">
        <button style="background:white; padding:10px 16px; border-radius:12px; font-size:14px; font-weight:600; color:#374151; display:flex; align-items:center; gap:8px;" class="card-shadow">📥 Export</button>
        <button style="background:#7C3AED; color:white; padding:10px 20px; border-radius:12px; font-size:14px; font-weight:600; display:flex; align-items:center; gap:8px;" class="card-shadow">+ New Shift</button>
      </div>
    </div>

    <!-- Stat Cards -->
    <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:20px; margin-bottom:24px;">

      <div style="background:white; border-radius:16px; padding:24px;" class="card-shadow">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
          <div style="width:40px; height:40px; background:#DCFCE7; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:18px;">💵</div>
          <span class="pill" style="background:#DCFCE7; color:#15803D;">+12%</span>
        </div>
        <div style="color:#6B7280; font-size:14px; font-weight:500;">Sales Today</div>
        <div class="stat-number" style="margin-top:4px;">$2,847</div>
        <div style="color:#16A34A; font-size:12px; margin-top:4px; font-weight:500;">vs. $2,542 yesterday</div>
      </div>

      <div style="background:white; border-radius:16px; padding:24px;" class="card-shadow">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
          <div style="width:40px; height:40px; background:#F3EEFF; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:18px;">👥</div>
          <span class="pill" style="background:#DCFCE7; color:#15803D;">-2.1%</span>
        </div>
        <div style="color:#6B7280; font-size:14px; font-weight:500;">Labor Cost %</div>
        <div class="stat-number" style="color:#7C3AED; margin-top:4px;">18.3%</div>
        <div style="color:#9CA3AF; font-size:12px; margin-top:4px; font-weight:500;">Target: 22.0%</div>
      </div>

      <div style="background:white; border-radius:16px; padding:24px;" class="card-shadow">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
          <div style="width:40px; height:40px; background:#F3EEFF; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:18px;">📦</div>
          <span class="pill" style="background:#FEF3C7; color:#B45309;">3 Low</span>
        </div>
        <div style="color:#6B7280; font-size:14px; font-weight:500;">Inventory Health</div>
        <div class="stat-number" style="margin-top:4px;">94%</div>
        <div style="color:#9CA3AF; font-size:12px; margin-top:4px; font-weight:500;">3 items below par</div>
      </div>

      <div style="background:white; border-radius:16px; padding:24px;" class="card-shadow">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
          <div style="width:40px; height:40px; background:#FFF7ED; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:18px;">🍩</div>
          <span class="pill" style="background:#DCFCE7; color:#15803D;">On Track</span>
        </div>
        <div style="color:#6B7280; font-size:14px; font-weight:500;">Production</div>
        <div class="stat-number" style="margin-top:4px;">812 / 950</div>
        <div style="color:#9CA3AF; font-size:12px; margin-top:4px; font-weight:500;">85% of daily target</div>
      </div>
    </div>

    <!-- Charts Row -->
    <div style="display:grid; grid-template-columns:2fr 1fr; gap:20px; margin-bottom:24px;">

      <!-- Sales Chart -->
      <div style="background:white; border-radius:16px; padding:24px;" class="card-shadow">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:24px;">
          <div>
            <h3 style="font-weight:700; font-size:18px; margin:0;">Weekly Performance</h3>
            <p style="color:#6B7280; font-size:14px; margin:4px 0 0;">Sales vs. Labor Cost</p>
          </div>
          <div style="display:flex; gap:12px;">
            <span style="display:flex; align-items:center; gap:6px; font-size:12px; color:#6B7280;"><span style="width:12px; height:12px; border-radius:50%; background:#7C3AED; display:inline-block;"></span> Sales</span>
            <span style="display:flex; align-items:center; gap:6px; font-size:12px; color:#6B7280;"><span style="width:12px; height:12px; border-radius:50%; background:#D1C5F0; display:inline-block;"></span> Labor</span>
          </div>
        </div>
        <div style="display:flex; align-items:flex-end; justify-content:space-between; gap:12px; height:180px;">
          <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:4px;">
            <div style="width:100%; background:#D1C5F0; border-radius:6px 6px 0 0; height:45px;"></div>
            <div style="width:100%; background:#7C3AED; border-radius:0 0 6px 6px; height:95px;"></div>
            <span style="font-size:12px; color:#6B7280; font-weight:500;">Mon</span>
          </div>
          <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:4px;">
            <div style="width:100%; background:#D1C5F0; border-radius:6px 6px 0 0; height:50px;"></div>
            <div style="width:100%; background:#7C3AED; border-radius:0 0 6px 6px; height:110px;"></div>
            <span style="font-size:12px; color:#6B7280; font-weight:500;">Tue</span>
          </div>
          <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:4px;">
            <div style="width:100%; background:#D1C5F0; border-radius:6px 6px 0 0; height:38px;"></div>
            <div style="width:100%; background:#7C3AED; border-radius:0 0 6px 6px; height:88px;"></div>
            <span style="font-size:12px; color:#6B7280; font-weight:500;">Wed</span>
          </div>
          <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:4px;">
            <div style="width:100%; background:#D1C5F0; border-radius:6px 6px 0 0; height:55px;"></div>
            <div style="width:100%; background:#7C3AED; border-radius:0 0 6px 6px; height:130px;"></div>
            <span style="font-size:12px; color:#6B7280; font-weight:500;">Thu</span>
          </div>
          <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:4px;">
            <div style="width:100%; background:#D1C5F0; border-radius:6px 6px 0 0; height:60px;"></div>
            <div style="width:100%; background:#7C3AED; border-radius:0 0 6px 6px; height:150px;"></div>
            <span style="font-size:12px; color:#6B7280; font-weight:500;">Fri</span>
          </div>
          <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:4px;">
            <div style="width:100%; background:#D1C5F0; border-radius:6px 6px 0 0; height:65px;"></div>
            <div style="width:100%; background:#7C3AED; border-radius:0 0 6px 6px; height:165px;"></div>
            <span style="font-size:12px; color:#6B7280; font-weight:500;">Sat</span>
          </div>
          <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:4px;">
            <div style="width:100%; background:#D1C5F0; border-radius:6px 6px 0 0; height:48px;"></div>
            <div style="width:100%; background:#7C3AED; border-radius:0 0 6px 6px; height:100px; opacity:0.6;"></div>
            <span style="font-size:12px; color:#7C3AED; font-weight:700;">Today</span>
          </div>
        </div>
      </div>

      <!-- Today's Schedule -->
      <div style="background:white; border-radius:16px; padding:24px;" class="card-shadow">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
          <h3 style="font-weight:700; font-size:18px; margin:0;">Today's Shift</h3>
          <span class="pill" style="background:#F3EEFF; color:#7C3AED;">5 scheduled</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div style="display:flex; align-items:center; gap:12px; padding:8px; border-radius:12px;">
            <div style="width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,#A855F7,#7C3AED); display:flex; align-items:center; justify-content:center; color:white; font-size:11px; font-weight:700;">MJ</div>
            <div style="flex:1; min-width:0;">
              <div style="font-size:14px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">Maria Johnson</div>
              <div style="font-size:12px; color:#6B7280;">6:00 AM – 2:00 PM</div>
            </div>
            <span class="pill" style="background:#DCFCE7; color:#15803D;">Open</span>
          </div>
          <div style="display:flex; align-items:center; gap:12px; padding:8px; border-radius:12px;">
            <div style="width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,#60A5FA,#A855F7); display:flex; align-items:center; justify-content:center; color:white; font-size:11px; font-weight:700;">TC</div>
            <div style="flex:1; min-width:0;">
              <div style="font-size:14px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">Tom Chen</div>
              <div style="font-size:12px; color:#6B7280;">6:00 AM – 2:00 PM</div>
            </div>
            <span class="pill" style="background:#DCFCE7; color:#15803D;">Open</span>
          </div>
          <div style="display:flex; align-items:center; gap:12px; padding:8px; border-radius:12px;">
            <div style="width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,#F472B6,#EC4899); display:flex; align-items:center; justify-content:center; color:white; font-size:11px; font-weight:700;">SR</div>
            <div style="flex:1; min-width:0;">
              <div style="font-size:14px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">Sarah Reyes</div>
              <div style="font-size:12px; color:#6B7280;">10:00 AM – 6:00 PM</div>
            </div>
            <span class="pill" style="background:#F3EEFF; color:#6D28D9;">Mid</span>
          </div>
          <div style="display:flex; align-items:center; gap:12px; padding:8px; border-radius:12px;">
            <div style="width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,#FB923C,#EA580C); display:flex; align-items:center; justify-content:center; color:white; font-size:11px; font-weight:700;">DK</div>
            <div style="flex:1; min-width:0;">
              <div style="font-size:14px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">Dave Kim</div>
              <div style="font-size:12px; color:#6B7280;">2:00 PM – 10:00 PM</div>
            </div>
            <span class="pill" style="background:#F3EEFF; color:#7C3AED;">Close</span>
          </div>
        </div>
        <div style="margin-top:16px; text-align:center;">
          <span style="color:#7C3AED; font-size:14px; font-weight:600; cursor:pointer;">View full schedule →</span>
        </div>
      </div>
    </div>

    <!-- Low Stock + AI -->
    <div style="display:grid; grid-template-columns:2fr 1fr; gap:20px;">

      <!-- Low Stock -->
      <div style="background:white; border-radius:16px; padding:24px;" class="card-shadow">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <h3 style="font-weight:700; font-size:18px; margin:0;">Inventory Alerts</h3>
            <span class="pill" style="background:#FEE2E2; color:#DC2626;">3 items low</span>
          </div>
          <span style="color:#7C3AED; font-size:14px; font-weight:600; cursor:pointer;">Manage →</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div style="display:flex; align-items:center; gap:16px; padding:12px; background:#FEF2F2; border-radius:12px;">
            <div style="width:40px; height:40px; background:#FEE2E2; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:18px;">🥛</div>
            <div style="flex:1;">
              <div style="font-weight:600; font-size:14px;">Whole Milk</div>
              <div style="font-size:12px; color:#6B7280;">2 gal remaining · Par: 8 gal</div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <div style="width:80px; height:8px; background:#E5E7EB; border-radius:999px; overflow:hidden;">
                <div style="width:25%; height:100%; background:#EF4444; border-radius:999px;"></div>
              </div>
              <span style="font-size:12px; font-weight:700; color:#DC2626; width:32px;">25%</span>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:16px; padding:12px; background:#FFFBEB; border-radius:12px;">
            <div style="width:40px; height:40px; background:#FEF3C7; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:18px;">🍩</div>
            <div style="flex:1;">
              <div style="font-weight:600; font-size:14px;">Glaze Mix</div>
              <div style="font-size:12px; color:#6B7280;">5 lbs remaining · Par: 15 lbs</div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <div style="width:80px; height:8px; background:#E5E7EB; border-radius:999px; overflow:hidden;">
                <div style="width:33%; height:100%; background:#F59E0B; border-radius:999px;"></div>
              </div>
              <span style="font-size:12px; font-weight:700; color:#B45309; width:32px;">33%</span>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:16px; padding:12px; background:#FFFBEB; border-radius:12px;">
            <div style="width:40px; height:40px; background:#FEF3C7; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:18px;">🥤</div>
            <div style="flex:1;">
              <div style="font-weight:600; font-size:14px;">Coffee Cups (16oz)</div>
              <div style="font-size:12px; color:#6B7280;">120 remaining · Par: 300</div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <div style="width:80px; height:8px; background:#E5E7EB; border-radius:999px; overflow:hidden;">
                <div style="width:40%; height:100%; background:#F59E0B; border-radius:999px;"></div>
              </div>
              <span style="font-size:12px; font-weight:700; color:#B45309; width:32px;">40%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- AI Assistant Card -->
      <div style="background:linear-gradient(135deg,#7C3AED,#581C87); border-radius:16px; padding:24px; color:white; position:relative; overflow:hidden;" class="card-shadow-lg">
        <div style="position:absolute; top:0; right:0; width:128px; height:128px; background:rgba(255,255,255,0.05); border-radius:50%; transform:translate(48px,-48px);"></div>
        <div style="position:absolute; bottom:0; left:0; width:80px; height:80px; background:rgba(255,255,255,0.05); border-radius:50%; transform:translate(-32px,32px);"></div>
        <div style="position:relative; z-index:1;">
          <div class="animate-float" style="width:48px; height:48px; background:rgba(255,255,255,0.2); border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:28px; margin-bottom:16px;">🤖</div>
          <h3 style="font-weight:700; font-size:18px; margin:0 0 4px;">Ask ResCommand AI</h3>
          <p style="color:#C4B5FD; font-size:14px; margin:0 0 16px;">Get instant answers from your recipes, policies, and operations data.</p>
          <div style="background:rgba(255,255,255,0.1); border-radius:12px; padding:12px; margin-bottom:12px;">
            <p style="font-size:12px; color:#C4B5FD; margin:0 0 4px;">Try asking:</p>
            <p style="font-size:14px; font-weight:500; margin:0;">&quot;What&apos;s the recipe cost for a maple bacon donut?&quot;</p>
          </div>
          <button style="width:100%; background:white; color:#6D28D9; padding:10px; border-radius:12px; font-size:14px; font-weight:700;">Ask a question →</button>
        </div>
      </div>
    </div>

  </main>
</div>

<!-- ═══════════════════════════════════════════════════════════════
     AI ASSISTANT PAGE
     ═══════════════════════════════════════════════════════════════ -->
<div style="min-height:100vh; padding:64px 32px;" class="sidebar-gradient">
  <div style="max-width:800px; margin:0 auto;">

    <div style="text-align:center; margin-bottom:40px;">
      <div style="margin-bottom:16px;">
        <span class="pill" style="background:rgba(255,255,255,0.1); color:#C4B5FD;">✨ New Feature</span>
      </div>
      <h2 style="font-size:36px; font-weight:800; letter-spacing:-0.02em; color:white; margin:0 0 12px;">ResCommand AI</h2>
      <p style="color:#A78BFA; font-size:18px; max-width:640px; margin:0 auto;">Your operations copilot — trained on your recipes, inventory, labor data, and policies. Ask anything, get instant answers.</p>
    </div>

    <div style="background:white; border-radius:24px; padding:32px;" class="card-shadow-lg">

      <!-- User message -->
      <div style="display:flex; justify-content:flex-end; margin-bottom:24px;">
        <div style="background:#F3EEFF; border-radius:16px 16px 4px 16px; padding:12px 20px; max-width:400px;">
          <p style="font-size:14px; color:#1F2937; margin:0;">What&apos;s our food cost percentage on the maple bacon donut?</p>
        </div>
      </div>

      <!-- AI message -->
      <div style="display:flex; gap:12px; margin-bottom:24px;">
        <div style="width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,#8B5CF6,#6D28D9); display:flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0;">🤖</div>
        <div style="flex:1;">
          <div style="background:#F9FAFB; border-radius:16px 16px 16px 4px; padding:16px;">
            <p style="font-size:14px; color:#1F2937; margin:0 0 12px;">Your food cost on the <strong>Maple Bacon Donut</strong> is <strong>24.3%</strong>.</p>
            <div style="background:white; border-radius:12px; padding:16px; border:1px solid #F3F4F6;">
              <div style="font-size:11px; font-weight:600; color:#6B7280; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:8px;">Cost Breakdown</div>
              <div style="display:flex; flex-direction:column; gap:6px; font-size:14px;">
                <div style="display:flex; justify-content:space-between;"><span style="color:#4B5563;">Dough (2.5 oz)</span><span style="font-weight:500;">$0.18</span></div>
                <div style="display:flex; justify-content:space-between;"><span style="color:#4B5563;">Maple Glaze</span><span style="font-weight:500;">$0.22</span></div>
                <div style="display:flex; justify-content:space-between;"><span style="color:#4B5563;">Bacon (1 slice)</span><span style="font-weight:500;">$0.31</span></div>
                <div style="display:flex; justify-content:space-between;"><span style="color:#4B5563;">Packaging</span><span style="font-weight:500;">$0.05</span></div>
                <div style="display:flex; justify-content:space-between; padding-top:8px; border-top:1px solid #F3F4F6;"><span style="font-weight:600;">Total Cost</span><span style="font-weight:800; color:#7C3AED;">$0.76</span></div>
                <div style="display:flex; justify-content:space-between;"><span style="color:#6B7280; font-size:12px;">Sells for $3.25</span><span style="color:#16A34A; font-size:12px; font-weight:700;">24.3% food cost</span></div>
              </div>
            </div>
            <p style="font-size:12px; color:#9CA3AF; margin:12px 0 0;">💡 Tip: Bacon is your highest-cost ingredient. Swapping to a thinner cut could save $0.08/unit.</p>
          </div>
        </div>
      </div>

      <!-- Suggestions -->
      <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:16px;">
        <span class="pill" style="background:#F3F4F6; color:#4B5563; cursor:pointer;">📊 Today's labor cost vs. target</span>
        <span class="pill" style="background:#F3F4F6; color:#4B5563; cursor:pointer;">🍩 Top 5 most profitable items</span>
        <span class="pill" style="background:#F3F4F6; color:#4B5563; cursor:pointer;">📦 What should I order this week?</span>
      </div>

      <!-- Input -->
      <div style="display:flex; gap:12px;">
        <div style="flex:1; background:#F9FAFB; border-radius:12px; padding:12px 16px; display:flex; align-items:center; gap:12px; border:1px solid #E5E7EB;">
          <span style="color:#9CA3AF;">💬</span>
          <span style="color:#9CA3AF; font-size:14px; flex:1;">Ask about recipes, inventory, costs...</span>
        </div>
        <button style="background:#7C3AED; color:white; width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center;">
          <svg style="width:20px; height:20px;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
        </button>
      </div>
    </div>

    <!-- Feature cards -->
    <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-top:32px;">
      <div style="background:rgba(255,255,255,0.05); border-radius:16px; padding:20px; border:1px solid rgba(255,255,255,0.1);">
        <div style="font-size:28px; margin-bottom:8px;">📖</div>
        <h4 style="color:white; font-weight:700; font-size:14px; margin:0 0 4px;">Knows Your Recipes</h4>
        <p style="color:#A78BFA; font-size:12px; margin:0;">Every recipe, ingredient cost, and yield — instantly queryable.</p>
      </div>
      <div style="background:rgba(255,255,255,0.05); border-radius:16px; padding:20px; border:1px solid rgba(255,255,255,0.1);">
        <div style="font-size:28px; margin-bottom:8px;">📊</div>
        <h4 style="color:white; font-weight:700; font-size:14px; margin:0 0 4px;">Analyzes Your Data</h4>
        <p style="color:#A78BFA; font-size:12px; margin:0;">Labor %, COGS, waste trends — ask in plain English.</p>
      </div>
      <div style="background:rgba(255,255,255,0.05); border-radius:16px; padding:20px; border:1px solid rgba(255,255,255,0.1);">
        <div style="font-size:28px; margin-bottom:8px;">⚡</div>
        <h4 style="color:white; font-weight:700; font-size:14px; margin:0 0 4px;">Saves Hours</h4>
        <p style="color:#A78BFA; font-size:12px; margin:0;">No more spreadsheet hunting. Get answers in seconds.</p>
      </div>
    </div>

  </div>
</div>

<!-- ═══════════════════════════════════════════════════════════════
     DESIGN SYSTEM
     ═══════════════════════════════════════════════════════════════ -->
<div style="min-height:100vh; background:#F6F5FB; padding:64px 32px;">
  <div style="max-width:900px; margin:0 auto;">

    <div style="text-align:center; margin-bottom:40px;">
      <h2 style="font-size:28px; font-weight:800; letter-spacing:-0.02em; margin:0;">🎨 Design System</h2>
      <p style="color:#6B7280; margin:8px 0 0;">Extracted from All Gravy's aesthetic</p>
    </div>

    <div style="background:white; border-radius:16px; padding:32px;" class="card-shadow">
      <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:24px;">
        <div>
          <div style="font-size:11px; font-weight:600; color:#6B7280; text-transform:uppercase; margin-bottom:12px;">Primary Palette</div>
          <div style="display:flex; gap:8px;">
            <div style="width:48px; height:48px; border-radius:12px; background:#1E1033;"></div>
            <div style="width:48px; height:48px; border-radius:12px; background:#7C3AED;"></div>
            <div style="width:48px; height:48px; border-radius:12px; background:#A855F7;"></div>
            <div style="width:48px; height:48px; border-radius:12px; background:#F3EEFF;"></div>
          </div>
          <div style="font-size:12px; color:#6B7280; margin-top:8px;">Dark · Primary · Light · Bg</div>
        </div>
        <div>
          <div style="font-size:11px; font-weight:600; color:#6B7280; text-transform:uppercase; margin-bottom:12px;">Status Colors</div>
          <div style="display:flex; gap:8px;">
            <div style="width:48px; height:48px; border-radius:12px; background:#DCFCE7; display:flex; align-items:center; justify-content:center; color:#15803D; font-size:11px; font-weight:700;">OK</div>
            <div style="width:48px; height:48px; border-radius:12px; background:#FEF3C7; display:flex; align-items:center; justify-content:center; color:#B45309; font-size:11px; font-weight:700;">LOW</div>
            <div style="width:48px; height:48px; border-radius:12px; background:#FEE2E2; display:flex; align-items:center; justify-content:center; color:#DC2626; font-size:11px; font-weight:700;">OUT</div>
          </div>
        </div>
        <div>
          <div style="font-size:11px; font-weight:600; color:#6B7280; text-transform:uppercase; margin-bottom:12px;">Typography</div>
          <div style="display:flex; flex-direction:column; gap:4px;">
            <div style="font-weight:800; font-size:18px;">Inter Bold</div>
            <div style="font-weight:500; font-size:14px;">Inter Medium</div>
            <div style="font-size:12px; color:#6B7280;">Inter Regular</div>
          </div>
        </div>
        <div>
          <div style="font-size:11px; font-weight:600; color:#6B7280; text-transform:uppercase; margin-bottom:12px;">Corner Radius</div>
          <div style="display:flex; gap:8px; align-items:flex-end;">
            <div style="width:40px; height:40px; background:#E5E7EB; border-radius:8px;"></div>
            <div style="width:40px; height:40px; background:#E5E7EB; border-radius:12px;"></div>
            <div style="width:40px; height:40px; background:#E5E7EB; border-radius:16px;"></div>
          </div>
          <div style="font-size:12px; color:#6B7280; margin-top:8px;">8 · 12 · 16px</div>
        </div>
      </div>
    </div>

    <div style="text-align:center; padding:32px 0;">
      <p style="color:#6B7280; font-size:14px;">Scroll up to explore the full dashboard and AI assistant mockup ↑</p>
    </div>

  </div>
</div>
`;
