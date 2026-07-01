import React, { Component } from "react";
const BLOOD_GROUPS = [
  { value: "-", label: "Select" },
  { value: "1", label: "A+" },
  { value: "2", label: "A-" },
  { value: "3", label: "B+" },
  { value: "4", label: "B-" },
  { value: "5", label: "AB+" },
  { value: "6", label: "AB-" },
  { value: "7", label: "O+" },
  { value: "8", label: "O-" },
  { value: "9", label: "Unknown" },
];
// ─── API helpers ─────────────────────────────────────────────────────────────
const api = {
  get: async (path) => {
    const res = await fetch(`/api${path}`);
    return res.json();
  },
  post: async (path, body) => {
    const res = await fetch(`/api${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json();
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getStatus(units, crit, low) {
  if (units <= crit) return "critical";
  if (units <= low) return "low";
  return "ok";
}

const STATUS = {
  critical: { bg: "#FEE2E2", text: "#991B1B", dot: "#EF4444", border: "#FECACA" },
  low: { bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B", border: "#FDE68A" },
  ok: { bg: "#D1FAE5", text: "#065F46", dot: "#10B981", border: "#A7F3D0" },
};

class Badge extends Component {
  render() {
    const { status } = this.props;
    const labels = { critical: "Critical", low: "Low stock", ok: "Sufficient" };
    const c = STATUS[status];
    return (
      <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
        {labels[status]}
      </span>
    );
  }
}

class Modal extends Component {
  render() {
    const { open, title, onClose, children } = this.props;
    if (!open) return null;
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
        <div style={{ background: "#fff", borderRadius: 16, padding: "1.75rem", width: 400, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }} onClick={e => e.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: 0 }}>{title}</h3>
            <button onClick={onClose} style={{ background: "#F1F5F9", border: "none", borderRadius: 8, width: 28, height: 28, cursor: "pointer", color: "#64748B", fontSize: 16 }}>×</button>
          </div>
          {children}
        </div>
      </div>
    );
  }
}

class Field extends Component {
  render() {
    const { label, children } = this.props;
    return (
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
        {children}
      </div>
    );
  }
}

const inputStyle = { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #E2E8F0", fontSize: 14, color: "#0F172A", outline: "none", boxSizing: "border-box", background: "#fff" };

class Select extends Component {
  render() {
    const { label, options, value, onChange } = this.props;
    return (
      <Field label={label}>
        <select value={value} onChange={onChange} style={inputStyle}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </Field>
    );
  }
}

class Input extends Component {
  render() {
    const { label, ...props } = this.props;
    return (
      <Field label={label}>
        <input {...props} style={inputStyle} />
      </Field>
    );
  }
}

class Btn extends Component {
  render() {
    const { children, variant = "primary", full, onClick, disabled, style: s } = this.props;
    const variants = {
      primary: { background: "#C0392B", color: "#fff" },
      secondary: { background: "#F1F5F9", color: "#475569" },
      danger: { background: "#C0392B", color: "#fff" },
    };
    return (
      <button onClick={onClick} disabled={disabled} style={{
        padding: "9px 18px", borderRadius: 8, fontSize: 14, fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer", border: "none",
        opacity: disabled ? 0.6 : 1, width: full ? "100%" : "auto",
        ...variants[variant], ...s,
      }}>{children}</button>
    );
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────
class LiveDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stock: [],
      logs: [],
      loading: true,
      activeTab: "overview",
      toast: null,
      submitting: false,

      addModal: false,
      editModal: false,
      deleteModal: false,
      dispenseModal: false,
      searchModal: false,
      threshModal: false,
      form: { blood_group_id: "1", units: "", note: "", critical_threshold: "", low_threshold: "", donor_id: "", donation_date: new Date().toISOString().split("T")[0] },
    };

    this.toastTimeout = null;

    this.showToast = this.showToast.bind(this);
    this.fetchStock = this.fetchStock.bind(this);
    this.fetchLogs = this.fetchLogs.bind(this);
    this.openModal = this.openModal.bind(this);
    this.handleGroupChange = this.handleGroupChange.bind(this);
    this.submit = this.submit.bind(this);
  }

  componentDidMount() {
    Promise.all([this.fetchStock(), this.fetchLogs()]).finally(() => this.setState({ loading: false }));
  }

  componentWillUnmount() {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
  }

  showToast(msg, type = "success") {
    this.setState({ toast: { msg, type } });
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => this.setState({ toast: null }), 3500);
  }

  async fetchStock() {
    const res = await api.get("/stock");
    if (res.status) this.setState({ stock: res.data });
  }

  async fetchLogs() {
    const res = await api.get("/stock/logs");
    if (res.status) this.setState({ logs: res.data });
  }

  openModal(modal, groupId = null) {
    const { stock } = this.state;
    const id = groupId || (stock[0]?.blood_group_id?.toString() || "1");
    const s = stock.find(x => x.blood_group_id == id);
    const form = {
      blood_group_id: String(id),
      units: "",
      note: "",
      critical_threshold: s ? String(s.critical_threshold) : "",
      low_threshold: s ? String(s.low_threshold) : "",
      donor_id: "",
      donation_date: new Date().toISOString().split("T")[0],
    };

    const modalState = { form };
    if (modal === "add") modalState.addModal = true;
    if (modal === "edit") modalState.editModal = true;
    if (modal === "delete") modalState.deleteModal = true;
    if (modal === "dispense") modalState.dispenseModal = true;
    if (modal === "search") modalState.searchModal = true;
    if (modal === "thresh") modalState.threshModal = true;

    this.setState(modalState);
  }

  handleGroupChange(e) {
    const id = e.target.value;
    const s = this.state.stock.find(x => x.blood_group_id == id);
    this.setState(prev => ({
      form: {
        ...prev.form,
        blood_group_id: id,
        critical_threshold: s ? String(s.critical_threshold) : "",
        low_threshold: s ? String(s.low_threshold) : "",
      },
    }));
  }

  async submit(path, body, successMsg, modalKey) {
    this.setState({ submitting: true });
    const res = await api.post(path, body);
    this.setState({ submitting: false });
    if (res.status) {
      this.showToast(successMsg);
      this.setState({ [modalKey]: false });
      this.fetchStock();
      this.fetchLogs();
    } else {
      this.showToast(res.message, "error");
    }
  }

  render() {
    const {
      stock, logs, loading, activeTab, toast, submitting,
      addModal, editModal, deleteModal, dispenseModal, searchModal, threshModal,
      form, searchGroup,
    } = this.state;

    const bloodGroupOptions = BLOOD_GROUPS;

    // Computed stats
    const totalUnits = stock.reduce((a, s) => a + parseInt(s.units_available), 0);
    const criticalGroups = stock.filter(s => getStatus(s.units_available, s.critical_threshold, s.low_threshold) === "critical");
    const lowGroups = stock.filter(s => getStatus(s.units_available, s.critical_threshold, s.low_threshold) === "low");
    const dispensedToday = logs.filter(l => l.action === "dispense").slice(0, 10).reduce((a, l) => a + l.units, 0);

    const filteredStock = searchGroup === "all" ? stock : stock.filter(s => s.blood_group_id == searchGroup);
    const currentStock = stock.find(s => s.blood_group_id == form.blood_group_id);

    const TABS = [
      { key: "overview", label: "Overview", icon: "📊" },
      { key: "stock", label: "Stock", icon: "🩸" },
      { key: "logs", label: "Logs", icon: "📋" },
      { key: "thresholds", label: "Thresholds", icon: "⚙️" },
    ];

    if (loading) return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif", color: "#64748B" }}>
        Loading blood bank data...
      </div>
    );

    return (
      <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Inter', system-ui, sans-serif" }}>

        {/* Toast */}
        {toast && (
          <div style={{ position: "fixed", top: 20, right: 20, zIndex: 100, padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 500, background: toast.type === "error" ? "#FEE2E2" : "#D1FAE5", color: toast.type === "error" ? "#991B1B" : "#065F46", border: `1px solid ${toast.type === "error" ? "#FECACA" : "#A7F3D0"}`, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
            {toast.type === "error" ? "⚠ " : "✓ "}{toast.msg}
          </div>
        )}

     
        {/* Main */}
        <div style={{ marginLeft: 220, padding: "2rem", paddingTop: "calc(60px + 2rem)" }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", margin: 0 }}>
                {TABS.find(t => t.key === activeTab)?.label}
              </h1>
              <p style={{ color: "#64748B", fontSize: 14, margin: "10px 0 0" }}>
                {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn variant="secondary" onClick={() => this.openModal("search")}>🔍 Search stock</Btn>
              <Btn onClick={() => this.openModal("add")}>+ Add blood bag</Btn>
            </div>
          </div>

          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
                {[
                  { label: "Total units", value: totalUnits.toLocaleString(), sub: "across all groups", color: "#0F172A" },
                  { label: "Dispensed today", value: dispensedToday, sub: "units out", color: "#0F172A" },
                  { label: "Critical groups", value: criticalGroups.length, sub: criticalGroups.map(s => s.blood_group).join(", ") || "None", color: "#C0392B" },
                  { label: "Low stock alerts", value: lowGroups.length, sub: lowGroups.map(s => s.blood_group).join(", ") || "None", color: "#B45309" },
                ].map(s => (
                  <div key={s.label} style={{ background: "#fff", borderRadius: 12, padding: "1.25rem", border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>{s.label}</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>{s.sub}</div>
                  </div>
                ))}
              </div>
            </>
          )}

         
        </div>

      </div>
    );
  }
}

export default LiveDashboard;