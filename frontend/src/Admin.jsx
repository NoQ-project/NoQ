import React, { useState, useMemo } from "react";
import {
  LayoutDashboard,
  ListOrdered,
  Users,
  BarChart3,
  Settings as SettingsIcon,
  Search,
  Bell,
  ChevronDown,
  Plus,
  Pause,
  Play,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Menu,
  X,
  Building2,
  Volume2,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "./admin.css";

/* ---------------------------------------------------------------
   NoQ — Admin Console
   Signature: the "Now Serving" ticket-flow strip — tickets drift from
   Waiting -> Called -> Serving like a departures board, because that
   motion IS the product. All styling lives in admin.css.
------------------------------------------------------------------*/

const CHART_COLORS = {
  serving: "#14b8a6",
  called: "#6366f1",
  waiting: "#f5a623",
  alert: "#ef4444",
  muted: "#6b7280",
  line: "#e6e8ec",
};

/* ------------------------------- Mock data ------------------------------- */

const QUEUES = [
  {
    id: "q1",
    code: "GEN",
    name: "General Enquiry",
    branch: "Kathmandu Central",
    waiting: 14,
    avgWait: 6,
    status: "active",
  },
  {
    id: "q2",
    code: "PAY",
    name: "Payments & Billing",
    branch: "Kathmandu Central",
    waiting: 8,
    avgWait: 4,
    status: "active",
  },
  {
    id: "q3",
    code: "LOAN",
    name: "Loan Services",
    branch: "Patan Branch",
    waiting: 21,
    avgWait: 13,
    status: "active",
  },
  {
    id: "q4",
    code: "ACC",
    name: "New Account Opening",
    branch: "Kathmandu Central",
    waiting: 5,
    avgWait: 9,
    status: "paused",
  },
  {
    id: "q5",
    code: "CARD",
    name: "Card Services",
    branch: "Lalitpur Branch",
    waiting: 11,
    avgWait: 7,
    status: "active",
  },
  {
    id: "q6",
    code: "VIP",
    name: "Priority Desk",
    branch: "Kathmandu Central",
    waiting: 2,
    avgWait: 3,
    status: "active",
  },
];

const COUNTERS = [
  {
    id: "c1",
    label: "Counter 01",
    staff: "Sujata Rai",
    queue: "GEN",
    ticket: "GEN-142",
    status: "serving",
    since: "2m ago",
  },
  {
    id: "c2",
    label: "Counter 02",
    staff: "Bikash Thapa",
    queue: "PAY",
    ticket: "PAY-088",
    status: "serving",
    since: "4m ago",
  },
  {
    id: "c3",
    label: "Counter 03",
    staff: "Anjali Shrestha",
    queue: "LOAN",
    ticket: "—",
    status: "break",
    since: "10m ago",
  },
  {
    id: "c4",
    label: "Counter 04",
    staff: "Nabin Gurung",
    queue: "CARD",
    ticket: "CARD-057",
    status: "serving",
    since: "1m ago",
  },
  {
    id: "c5",
    label: "Counter 05",
    staff: "—",
    queue: "—",
    ticket: "—",
    status: "offline",
    since: "—",
  },
  {
    id: "c6",
    label: "Counter 06",
    staff: "Manisha K.C.",
    queue: "VIP",
    ticket: "VIP-014",
    status: "serving",
    since: "6m ago",
  },
];

const FLOW = [
  { code: "GEN-143", queue: "General", state: "waiting" },
  { code: "PAY-089", queue: "Payments", state: "waiting" },
  { code: "LOAN-067", queue: "Loan", state: "called" },
  { code: "CARD-058", queue: "Card", state: "waiting" },
  { code: "GEN-142", queue: "General", state: "serving" },
  { code: "VIP-014", queue: "Priority", state: "serving" },
  { code: "PAY-088", queue: "Payments", state: "serving" },
  { code: "LOAN-066", queue: "Loan", state: "waiting" },
];

const WAIT_TREND = [
  { t: "9am", min: 4 },
  { t: "10am", min: 7 },
  { t: "11am", min: 9 },
  { t: "12pm", min: 13 },
  { t: "1pm", min: 11 },
  { t: "2pm", min: 8 },
  { t: "3pm", min: 6 },
  { t: "4pm", min: 10 },
  { t: "5pm", min: 5 },
];

const SERVED_BY_HOUR = [
  { t: "9am", n: 12 },
  { t: "10am", n: 22 },
  { t: "11am", n: 30 },
  { t: "12pm", n: 18 },
  { t: "1pm", n: 24 },
  { t: "2pm", n: 33 },
  { t: "3pm", n: 27 },
  { t: "4pm", n: 19 },
  { t: "5pm", n: 9 },
];

const SHARE = [
  { name: "General", value: 34, color: CHART_COLORS.serving },
  { name: "Payments", value: 22, color: CHART_COLORS.called },
  { name: "Loan", value: 26, color: CHART_COLORS.waiting },
  { name: "Card", value: 18, color: CHART_COLORS.alert },
];

const ACTIVITY = [
  { id: 1, text: "Counter 04 called CARD-057", time: "1m ago" },
  {
    id: 2,
    text: "New Account Opening queue paused by Bikash Thapa",
    time: "6m ago",
  },
  { id: 3, text: "LOAN-064 marked no-show", time: "12m ago" },
  { id: 4, text: "Counter 01 finished serving GEN-141", time: "14m ago" },
  {
    id: 5,
    text: "Priority Desk average wait dropped below 3 min",
    time: "20m ago",
  },
];

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "queues", label: "Queues", icon: ListOrdered },
  { key: "counters", label: "Counters & Staff", icon: Users },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

const VIEW_TITLES = {
  dashboard: ["Dashboard", "Live overview of every branch, right now."],
  queues: ["Queues", "Manage services and monitor how each queue is flowing."],
  counters: ["Counters & Staff", "See who is serving, on break, or offline."],
  analytics: ["Analytics", "Trends across wait time and throughput."],
  settings: ["Settings", "Branch, notification and behaviour preferences."],
};

/* ------------------------------- Small bits ------------------------------- */

function StatusPill({ status }) {
  const labels = {
    active: "Active",
    serving: "Serving",
    paused: "Paused",
    break: "On break",
    offline: "Offline",
    called: "Called",
    waiting: "Waiting",
  };
  return (
    <span className={`noq-status-pill ${status}`}>
      <span className="dot" />
      {labels[status] || "Unknown"}
    </span>
  );
}

function KpiCard({
  label,
  value,
  unit,
  delta,
  deltaGood,
  icon: Icon,
  accentClass,
}) {
  return (
    <div className="noq-kpi-card">
      <div className="noq-kpi-top">
        <span className="noq-kpi-label">{label}</span>
        <div className={`noq-kpi-icon ${accentClass}`}>
          <Icon size={16} />
        </div>
      </div>
      <div className="noq-kpi-value-row">
        <span className="noq-kpi-value">{value}</span>
        {unit && <span className="noq-kpi-unit">{unit}</span>}
      </div>
      {delta && (
        <div className={`noq-kpi-delta ${deltaGood ? "good" : "bad"}`}>
          {deltaGood ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          <span>{delta}</span>
          <span className="vs">vs yesterday</span>
        </div>
      )}
    </div>
  );
}

function TicketChip({ t }) {
  return (
    <div className={`noq-ticket-chip ${t.state}`}>
      <div className="noq-chip-state-row">
        <span className="noq-chip-dot" />
        <span className="noq-chip-state-label">{t.state}</span>
      </div>
      <span className="noq-chip-code">{t.code}</span>
      <span className="noq-chip-queue">{t.queue}</span>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      className={`noq-toggle ${checked ? "on" : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span className="noq-toggle-thumb" />
    </button>
  );
}

/* ------------------------------- Views ------------------------------- */

function DashboardView() {
  const totalWaiting = QUEUES.reduce((s, q) => s + q.waiting, 0);
  const avgWait = Math.round(
    QUEUES.reduce((s, q) => s + q.avgWait, 0) / QUEUES.length,
  );

  return (
    <>
      <div className="noq-kpi-grid">
        <KpiCard
          label="Total Waiting"
          value={totalWaiting}
          icon={Clock}
          accentClass="waiting"
          delta="+6"
          deltaGood={false}
        />
        <KpiCard
          label="Avg Wait Time"
          value={avgWait}
          unit="min"
          icon={TrendingUp}
          accentClass="called"
          delta="-2 min"
          deltaGood={true}
        />
        <KpiCard
          label="Served Today"
          value="312"
          icon={CheckCircle2}
          accentClass="serving"
          delta="+18%"
          deltaGood={true}
        />
        <KpiCard
          label="No-Shows"
          value="9"
          icon={XCircle}
          accentClass="alert"
          delta="+3"
          deltaGood={false}
        />
      </div>

      <div className="noq-card">
        <div className="noq-flow-header">
          <div>
            <h3 className="noq-card-title">Live ticket flow</h3>
            <p className="noq-card-sub">
              Waiting tickets move to Called, then Serving, in real time.
            </p>
          </div>
          <span className="noq-flow-live">
            <span className="noq-live-dot" />
            Live
          </span>
        </div>
        <div className="noq-flow-strip">
          {FLOW.map((t, i) => (
            <TicketChip key={i} t={t} />
          ))}
        </div>
      </div>

      <div className="noq-grid-2col">
        <div className="noq-card">
          <h3 className="noq-card-title">Wait time trend</h3>
          <p className="noq-card-sub">Average minutes waited, today</p>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={WAIT_TREND}
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid stroke={CHART_COLORS.line} vertical={false} />
                <XAxis
                  dataKey="t"
                  tick={{ fontSize: 11, fill: CHART_COLORS.muted }}
                  axisLine={{ stroke: CHART_COLORS.line }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: CHART_COLORS.muted }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip formatter={(v) => [`${v} min`, "Avg wait"]} />
                <Line
                  type="monotone"
                  dataKey="min"
                  stroke={CHART_COLORS.called}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: CHART_COLORS.called }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="noq-card">
          <h3 className="noq-card-title">Recent activity</h3>
          <div className="noq-activity-list">
            {ACTIVITY.map((a) => (
              <div key={a.id} className="noq-activity-item">
                <span className="noq-activity-dot" />
                <div>
                  <p className="noq-activity-text">{a.text}</p>
                  <span className="noq-activity-time">{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function QueuesView() {
  const [queues, setQueues] = useState(QUEUES);
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      queues.filter((q) =>
        (q.name + q.code + q.branch)
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [queues, query],
  );

  function toggleStatus(id) {
    setQueues((qs) =>
      qs.map((q) =>
        q.id === id
          ? { ...q, status: q.status === "active" ? "paused" : "active" }
          : q,
      ),
    );
  }

  return (
    <>
      <div className="noq-toolbar">
        <div className="noq-search">
          <Search size={15} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search queues, branches..."
          />
        </div>
        <button className="noq-btn-primary">
          <Plus size={15} /> New Queue
        </button>
      </div>

      <div className="noq-table-card">
        <div className="noq-table-scroll">
          <table className="noq-table">
            <thead>
              <tr>
                <th>Queue</th>
                <th>Branch</th>
                <th>Waiting</th>
                <th>Avg wait</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => (
                <tr key={q.id}>
                  <td>
                    <div className="noq-queue-name-cell">
                      <span className="noq-code-badge">{q.code}</span>
                      <span>{q.name}</span>
                    </div>
                  </td>
                  <td>{q.branch}</td>
                  <td className="noq-mono-cell">{q.waiting}</td>
                  <td className="noq-mono-cell">{q.avgWait} min</td>
                  <td>
                    <StatusPill status={q.status} />
                  </td>
                  <td>
                    <div className="noq-row-actions">
                      <button
                        className="noq-btn-ghost"
                        onClick={() => toggleStatus(q.id)}
                      >
                        {q.status === "active" ? (
                          <Pause size={12} />
                        ) : (
                          <Play size={12} />
                        )}
                        {q.status === "active" ? "Pause" : "Resume"}
                      </button>
                      <button className="noq-icon-btn">
                        <MoreHorizontal size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr className="noq-empty-row">
                  <td colSpan={6}>No queues match “{query}”.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function CountersView() {
  return (
    <div className="noq-counter-grid">
      {COUNTERS.map((c) => (
        <div key={c.id} className="noq-counter-card">
          <div className="noq-counter-top">
            <span className="noq-counter-label">{c.label}</span>
            <StatusPill status={c.status} />
          </div>
          <div className="noq-counter-staff-row">
            <div className="noq-staff-avatar">
              {c.staff !== "—"
                ? c.staff
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                : "—"}
            </div>
            <div>
              <p className="noq-staff-name">{c.staff}</p>
              <p className="noq-staff-assign">
                {c.queue !== "—" ? `Assigned: ${c.queue}` : "Unassigned"}
              </p>
            </div>
          </div>
          <div className="noq-counter-ticket-box">
            <div>
              <p className="noq-ticket-box-label">Now serving</p>
              <p className="noq-ticket-box-code">{c.ticket}</p>
            </div>
            <span className="noq-ticket-box-since">{c.since}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function AnalyticsView() {
  return (
    <div className="noq-analytics-grid">
      <div className="noq-card">
        <h3 className="noq-card-title">Tickets served by hour</h3>
        <p className="noq-card-sub">Across all branches, today</p>
        <div style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={SERVED_BY_HOUR}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid stroke={CHART_COLORS.line} vertical={false} />
              <XAxis
                dataKey="t"
                tick={{ fontSize: 11, fill: CHART_COLORS.muted }}
                axisLine={{ stroke: CHART_COLORS.line }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: CHART_COLORS.muted }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip />
              <Bar
                dataKey="n"
                fill={CHART_COLORS.serving}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="noq-card">
        <h3 className="noq-card-title">Queue share</h3>
        <p className="noq-card-sub">Share of today's total tickets</p>
        <div className="noq-pie-row">
          <div className="noq-pie-chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SHARE}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={72}
                  paddingAngle={3}
                >
                  {SHARE.map((s, i) => (
                    <Cell key={i} fill={s.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="noq-legend">
            {SHARE.map((s) => (
              <div key={s.name} className="noq-legend-item">
                <span
                  className="noq-legend-dot"
                  style={{ background: s.color }}
                />
                <span className="noq-legend-name">{s.name}</span>
                <span className="noq-legend-value">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsView() {
  const [notifs, setNotifs] = useState({
    sms: true,
    email: true,
    display: false,
  });
  const [autoAssign, setAutoAssign] = useState(true);

  return (
    <div className="noq-settings">
      <div className="noq-card">
        <div className="noq-settings-header">
          <Building2 size={16} />
          <h3 className="noq-card-title" style={{ margin: 0 }}>
            Branch details
          </h3>
        </div>
        <div className="noq-field-grid">
          {[
            { label: "Branch name", value: "Kathmandu Central" },
            { label: "Contact number", value: "+977 1 400 1122" },
            { label: "Opens", value: "09:00" },
            { label: "Closes", value: "17:00" },
          ].map((f) => (
            <div key={f.label} className="noq-field">
              <label>{f.label}</label>
              <input defaultValue={f.value} />
            </div>
          ))}
        </div>
      </div>

      <div className="noq-card">
        <div className="noq-settings-header">
          <Bell size={16} />
          <h3 className="noq-card-title" style={{ margin: 0 }}>
            Ticket notifications
          </h3>
        </div>
        {[
          { key: "sms", label: "SMS alert when a ticket is called" },
          { key: "email", label: "Email daily summary to branch manager" },
          { key: "display", label: "Announce on waiting-room display" },
        ].map((row) => (
          <div key={row.key} className="noq-toggle-row">
            <span className="noq-toggle-label">{row.label}</span>
            <Toggle
              checked={notifs[row.key]}
              onChange={(v) => setNotifs((n) => ({ ...n, [row.key]: v }))}
            />
          </div>
        ))}
      </div>

      <div className="noq-card">
        <div className="noq-settings-header">
          <Volume2 size={16} />
          <h3 className="noq-card-title" style={{ margin: 0 }}>
            Queue behaviour
          </h3>
        </div>
        <div className="noq-toggle-row">
          <div>
            <p className="noq-toggle-label">
              Auto-assign next ticket to free counters
            </p>
            <p className="noq-toggle-desc">
              When off, staff must call the next ticket manually.
            </p>
          </div>
          <Toggle checked={autoAssign} onChange={setAutoAssign} />
        </div>
      </div>

      <div className="noq-save-row">
        <button className="noq-btn-primary">Save changes</button>
      </div>
    </div>
  );
}

/* ------------------------------- Shell ------------------------------- */

export default function AdminApp() {
  const [view, setView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [title, subtitle] = VIEW_TITLES[view];

  return (
    <div className="noq-app">
      <aside className={`noq-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="noq-sidebar-head">
          <div className="noq-brand">
            <div className="noq-logo-mark">N</div>
            <span className="noq-logo-text">NoQ</span>
          </div>
          <button
            className="noq-sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} color="#fff" />
          </button>
        </div>

        <nav className="noq-nav">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = view === item.key;
            return (
              <button
                key={item.key}
                className={`noq-nav-item ${active ? "active" : ""}`}
                onClick={() => {
                  setView(item.key);
                  setSidebarOpen(false);
                }}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="noq-sidebar-foot">
          <div className="noq-avatar">RS</div>
          <div>
            <p className="noq-user-name">Ramesh Shah</p>
            <p className="noq-user-role">Branch Admin</p>
          </div>
        </div>
      </aside>

      <div
        className={`noq-overlay ${sidebarOpen ? "show" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className="noq-main">
        <header className="noq-header">
          <div className="noq-header-left">
            <button
              className="noq-menu-btn"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="noq-title">{title}</h1>
              <p className="noq-subtitle">{subtitle}</p>
            </div>
          </div>

          <div className="noq-header-right">
            <button className="noq-branch-btn">
              Kathmandu Central
              <ChevronDown size={13} />
            </button>
            <button className="noq-icon-square">
              <Bell size={15} />
              <span className="noq-bell-dot" />
            </button>
          </div>
        </header>

        <main className="noq-content">
          {view === "dashboard" && <DashboardView />}
          {view === "queues" && <QueuesView />}
          {view === "counters" && <CountersView />}
          {view === "analytics" && <AnalyticsView />}
          {view === "settings" && <SettingsView />}
        </main>
      </div>
    </div>
  );
}
