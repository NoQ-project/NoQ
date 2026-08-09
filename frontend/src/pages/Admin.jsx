import React, { useState, useEffect } from "react";
import "../assets/css/Admin.css";
import { adminService } from "../services/adminServices";
import {
  LayoutDashboard,
  ListOrdered,
  Users,
  Settings as SettingsIcon,
  Search,
  Bell,
  Pause,
  Play,
  Clock,
  CheckCircle2,
  Menu,
  X,
  Building2,
  FileText,
  Ticket,
  Ban,
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
} from "recharts";

/* ---------------------------------------------------------------
   NoQ — Admin Console
------------------------------------------------------------------*/

const CHART_COLORS = {
  serving: "#14b8a6",
  called: "#6366f1",
  waiting: "#f5a623",
  alert: "#ef4444",
  muted: "#6b7280",
  line: "#e6e8ec",
};

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

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "institutions", label: "Institutions", icon: Building2 },
  { key: "queues", label: "Queues", icon: ListOrdered },
  { key: "users", label: "Users", icon: Users },
  { key: "tokens", label: "Tokens", icon: Ticket },
  { key: "logs", label: "Audit Logs", icon: FileText },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

const VIEW_TITLES = {
  dashboard: ["Dashboard", "Live overview of system activity and stats."],
  institutions: ["Institutions", "Manage registered organizations and branches."],
  queues: ["Queues", "Manage services and monitor queue status."],
  users: ["Users", "Manage user accounts and access permissions."],
  tokens: ["Tokens", "View all generated tokens and perform cancellations."],
  logs: ["Audit Logs", "Track system-wide administrative operations."],
  settings: ["Settings", "System-wide preferences and settings."],
};

function StatusPill({ status }) {
  const isOnline = status === "active" || status === "serving" || status === true;
  return (
    <span className={`noq-status-pill ${isOnline ? "active" : "paused"}`}>
      <span className="dot" />
      {isOnline ? "Active" : "Inactive / Paused"}
    </span>
  );
}

function KpiCard({ label, value, icon: Icon, accentClass }) {
  return (
    <div className="noq-kpi-card">
      <div className="noq-kpi-top">
        <span className="noq-kpi-label">{label}</span>
        <div className={`noq-kpi-icon ${accentClass}`}>
          <Icon size={16} />
        </div>
      </div>
      <div className="noq-kpi-value-row">
        <span className="noq-kpi-value">{value ?? 0}</span>
      </div>
    </div>
  );
}

/* ------------------------------- Views ------------------------------- */

function DashboardView() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminService
      .getDashboard()
      .then((data) => setStats(data.statistics))
      .catch((err) => console.error("Failed to fetch dashboard stats:", err));
  }, []);

  return (
    <>
      <div className="noq-kpi-grid">
        <KpiCard label="Total Users" value={stats?.total_users} icon={Users} accentClass="waiting" />
        <KpiCard label="Total Institutions" value={stats?.total_institutions} icon={Building2} accentClass="called" />
        <KpiCard label="Active Queues" value={stats?.active_queues} icon={CheckCircle2} accentClass="serving" />
        <KpiCard label="Today's Tokens" value={stats?.today_tokens} icon={Clock} accentClass="alert" />
      </div>

      <div className="noq-grid-2col" style={{ marginTop: "24px" }}>
        <div className="noq-card">
          <h3 className="noq-card-title">Wait time trend</h3>
          <p className="noq-card-sub">Average minutes waited, today</p>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={WAIT_TREND} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke={CHART_COLORS.line} vertical={false} />
                <XAxis dataKey="t" tick={{ fontSize: 11, fill: CHART_COLORS.muted }} axisLine={{ stroke: CHART_COLORS.line }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: CHART_COLORS.muted }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => [`${v} min`, "Avg wait"]} />
                <Line type="monotone" dataKey="min" stroke={CHART_COLORS.called} strokeWidth={2.5} dot={{ r: 3, fill: CHART_COLORS.called }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="noq-card">
          <h3 className="noq-card-title">Tickets served by hour</h3>
          <p className="noq-card-sub">Across all institutions, today</p>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SERVED_BY_HOUR} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke={CHART_COLORS.line} vertical={false} />
                <XAxis dataKey="t" tick={{ fontSize: 11, fill: CHART_COLORS.muted }} axisLine={{ stroke: CHART_COLORS.line }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: CHART_COLORS.muted }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="n" fill={CHART_COLORS.serving} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}

function InstitutionsView() {
  const [institutions, setInstitutions] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedInst, setSelectedInst] = useState(null);

  const fetchInstitutions = () => {
    adminService
      .getInstitutions(1, 20, query)
      .then((res) => setInstitutions(res.items))
      .catch((err) => console.error("Failed to load institutions:", err));
  };

  useEffect(() => {
    fetchInstitutions();
  }, [query]);

  const handleRowClick = async (id) => {
    try {
      const data = await adminService.getInstitutionDetail(id);
      setSelectedInst(data);
    } catch (err) {
      alert("Failed to load institution details");
    }
  };

  return (
    <>
      <div className="noq-toolbar">
        <div className="noq-search">
          <Search size={15} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search institutions by name or email..."
          />
        </div>
      </div>

      <div className="noq-table-card">
        <div className="noq-table-scroll">
          <table className="noq-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Verified</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {institutions.map((inst) => (
                <tr key={inst.id} onClick={() => handleRowClick(inst.id)} style={{ cursor: "pointer" }}>
                  <td className="noq-mono-cell">#{inst.id}</td>
                  <td><strong>{inst.name}</strong></td>
                  <td>{inst.email}</td>
                  <td>{inst.phone || "—"}</td>
                  <td>{inst.is_verified ? "Yes" : "No"}</td>
                  <td><StatusPill status={inst.is_active} /></td>
                </tr>
              ))}
              {institutions.length === 0 && (
                <tr className="noq-empty-row">
                  <td colSpan={6}>No institutions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedInst && (
        <div className="noq-modal-backdrop" style={{ background: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }} onClick={() => setSelectedInst(null)}>
          <div className="noq-card" style={{ background: "#fff", padding: "24px", width: "500px", maxWidth: "90%", maxHeight: "80vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 className="noq-card-title" style={{ margin: 0 }}>{selectedInst.name}</h3>
              <button className="noq-icon-btn" onClick={() => setSelectedInst(null)}><X size={18} /></button>
            </div>
            <p><strong>Email:</strong> {selectedInst.email}</p>
            <p><strong>Phone:</strong> {selectedInst.phone || "N/A"}</p>
            <p><strong>Address:</strong> {selectedInst.address}</p>
            <p><strong>Website:</strong> {selectedInst.website || "N/A"}</p>
            <p><strong>Description:</strong> {selectedInst.description || "N/A"}</p>
            
            <h4 style={{ marginTop: "16px" }}>Queues under this Institution:</h4>
            <ul>
              {selectedInst.queues?.map((q) => (
                <li key={q.id}>{q.name} (Limit: {q.daily_limit}, Avg Time: {q.avg_service_time}m)</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

function QueuesView() {
  const [queues, setQueues] = useState([]);
  const [query, setQuery] = useState("");

  const fetchQueues = () => {
    adminService
      .getQueues(1, 20, query)
      .then((res) => setQueues(res.items))
      .catch((err) => console.error("Failed to load queues:", err));
  };

  useEffect(() => {
    fetchQueues();
  }, [query]);

  async function toggleStatus(id, currentStatus) {
    try {
      await adminService.toggleQueueStatus(id, currentStatus);
      fetchQueues();
    } catch (err) {
      alert("Failed to change queue status");
    }
  }

  return (
    <>
      <div className="noq-toolbar">
        <div className="noq-search">
          <Search size={15} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search queues, institutions..."
          />
        </div>
      </div>

      <div className="noq-table-card">
        <div className="noq-table-scroll">
          <table className="noq-table">
            <thead>
              <tr>
                <th>Queue</th>
                <th>Institution</th>
                <th>Daily Limit</th>
                <th>Avg Wait Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {queues.map((q) => (
                <tr key={q.id}>
                  <td>
                    <div className="noq-queue-name-cell">
                      <span className="noq-code-badge">#{q.id}</span>
                      <span>{q.name}</span>
                    </div>
                  </td>
                  <td>{q.institution_name}</td>
                  <td className="noq-mono-cell">{q.daily_limit}</td>
                  <td className="noq-mono-cell">{q.avg_service_time} min</td>
                  <td><StatusPill status={q.is_active} /></td>
                  <td>
                    <button className="noq-btn-ghost" onClick={() => toggleStatus(q.id, q.is_active)}>
                      {q.is_active ? <Pause size={12} /> : <Play size={12} />}
                      {q.is_active ? " Pause" : " Resume"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function UsersView() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");

  const fetchUsers = () => {
    adminService
      .getUsers(1, 20, query)
      .then((res) => setUsers(res.items))
      .catch((err) => console.error("Failed to load users:", err));
  };

  useEffect(() => {
    fetchUsers();
  }, [query]);

  async function toggleUserStatus(id, currentStatus) {
    try {
      await adminService.toggleUserStatus(id, currentStatus);
      fetchUsers();
    } catch (err) {
      alert("Failed to toggle user status");
    }
  }

  return (
    <>
      <div className="noq-toolbar">
        <div className="noq-search">
          <Search size={15} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users by name or email..."
          />
        </div>
      </div>

      <div className="noq-table-card">
        <div className="noq-table-scroll">
          <table className="noq-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Verified</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="noq-mono-cell">#{u.id}</td>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.email}</td>
                  <td>{u.is_verified ? "Yes" : "No"}</td>
                  <td>
                    <button className="noq-btn-ghost" onClick={() => toggleUserStatus(u.id, u.is_active)}>
                      Toggle Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function TokensView() {
  const [tokens, setTokens] = useState([]);

  const fetchTokens = () => {
    adminService
      .getTokens(1, 20)
      .then((res) => setTokens(res.items))
      .catch((err) => console.error("Failed to load tokens:", err));
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  async function handleCancelToken(tokenId) {
    if (!window.confirm("Are you sure you want to cancel this token?")) return;
    try {
      await adminService.cancelToken(tokenId);
      fetchTokens();
    } catch (err) {
      alert("Failed to cancel token");
    }
  }

  return (
    <div className="noq-table-card">
      <div className="noq-table-scroll">
        <table className="noq-table">
          <thead>
            <tr>
              <th>Token #</th>
              <th>User</th>
              <th>Queue</th>
              <th>Institution</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((t) => (
              <tr key={t.id}>
                <td><span className="noq-code-badge">#{t.token_number}</span></td>
                <td>{t.user_name}</td>
                <td>{t.queue_name}</td>
                <td>{t.institution_name}</td>
                <td><span className={`noq-status-pill ${t.status.toLowerCase()}`}>{t.status}</span></td>
                <td>
                  {t.status.toLowerCase() !== "cancelled" && (
                    <button className="noq-btn-ghost" style={{ color: "#ef4444" }} onClick={() => handleCancelToken(t.id)}>
                      <Ban size={12} /> Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AuditLogsView() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    adminService
      .getLogs(1, 20)
      .then((res) => setLogs(res.items))
      .catch((err) => console.error("Failed to load logs:", err));
  }, []);

  return (
    <div className="noq-table-card">
      <div className="noq-table-scroll">
        <table className="noq-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Admin ID</th>
              <th>Action</th>
              <th>Target Type</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="noq-mono-cell">#{log.id}</td>
                <td>Admin #{log.admin_id}</td>
                <td><strong>{log.action}</strong></td>
                <td>{log.target_type}</td>
                <td>{new Date(log.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="noq-settings">
      <div className="noq-card">
        <div className="noq-settings-header">
          <Building2 size={16} />
          <h3 className="noq-card-title" style={{ margin: 0 }}>System Settings</h3>
        </div>
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
            <span className="noq-logo-text">NoQ Admin</span>
          </div>
          <button className="noq-sidebar-close" onClick={() => setSidebarOpen(false)}>
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
          <div className="noq-avatar">A</div>
          <div>
            <p className="noq-user-name">System Admin</p>
            <p className="noq-user-role">Super Admin</p>
          </div>
        </div>
      </aside>

      <div className={`noq-overlay ${sidebarOpen ? "show" : ""}`} onClick={() => setSidebarOpen(false)} />

      <div className="noq-main">
        <header className="noq-header">
          <div className="noq-header-left">
            <button className="noq-menu-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div>
              <h1 className="noq-title">{title}</h1>
              <p className="noq-subtitle">{subtitle}</p>
            </div>
          </div>
        </header>

        <main className="noq-content">
          {view === "dashboard" && <DashboardView />}
          {view === "institutions" && <InstitutionsView />}
          {view === "queues" && <QueuesView />}
          {view === "users" && <UsersView />}
          {view === "tokens" && <TokensView />}
          {view === "logs" && <AuditLogsView />}
          {view === "settings" && <SettingsView />}
        </main>
      </div>
    </div>
  );
}