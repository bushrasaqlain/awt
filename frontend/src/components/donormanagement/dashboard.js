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
class ManageDonors extends Component {
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

        {/* Sidebar */}
        <div style={{ position: "fixed", left: 0, top: 60, bottom: 0, width: 220, background: "#0F172A", display: "flex", flexDirection: "column", padding: "1.5rem 1rem", overflowY: "auto" }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: "#94A3B8", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 12px" }}>CSR Panel</div>
          </div>
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => this.setState({ activeTab: tab.key })} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer", marginBottom: 4, background: activeTab === tab.key ? "#1E293B" : "transparent", color: activeTab === tab.key ? "#F1F5F9" : "#64748B", fontWeight: activeTab === tab.key ? 600 : 400, fontSize: 14, textAlign: "left" }}>
              <span>{tab.icon}</span>{tab.label}
            </button>
          ))}
          <div style={{ marginTop: "auto" }}>
            <div style={{ padding: 12, borderRadius: 10, background: "#1E293B", fontSize: 12 }}>
              <div style={{ color: "#94A3B8", marginBottom: 4 }}>Logged in as</div>
              <div style={{ color: "#F1F5F9", fontWeight: 600 }}>Database Admin</div>
              <div style={{ color: "#C0392B", fontSize: 11, marginTop: 2 }}>CSR • Full access</div>
            </div>
          </div>
        </div>

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

              <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", padding: "1.5rem", marginBottom: 24 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 16 }}>Blood stock — all 8 groups</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                  {stock.map(s => {
                    const st = getStatus(s.units_available, s.critical_threshold, s.low_threshold);
                    const c = STATUS[st];
                    const maxUnits = Math.max(...stock.map(x => x.units_available));
                    const pct = Math.min(100, Math.round((s.units_available / maxUnits) * 100));
                    return (
                      <div key={s.id} style={{ border: `1.5px solid ${c.border}`, borderRadius: 10, padding: "1rem", background: c.bg }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontSize: 18, fontWeight: 800, color: c.text }}>{s.blood_group}</span>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.dot, display: "inline-block", marginTop: 6 }} />
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 700, color: c.text, marginBottom: 6 }}>{s.units_available}</div>
                        <div style={{ height: 4, background: "rgba(0,0,0,0.1)", borderRadius: 2, marginBottom: 8 }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: c.dot, borderRadius: 2 }} />
                        </div>
                        <Badge status={st} />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", padding: "1.5rem" }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 16 }}>Quick actions</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                  {[
                    { label: "Add blood bag", icon: "➕", desc: "New units by blood group", modal: "add" },
                    { label: "Edit bag count", icon: "✏️", desc: "Update existing count", modal: "edit" },
                    { label: "Dispense blood", icon: "🚑", desc: "Log units going out", modal: "dispense" },
                    { label: "Remove record", icon: "🗑️", desc: "Reset stock to zero", modal: "delete" },
                  ].map(a => (
                    <button key={a.label} onClick={() => this.openModal(a.modal)} style={{ padding: "1rem", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "#F8FAFC", cursor: "pointer", textAlign: "left" }}>
                      <div style={{ fontSize: 22, marginBottom: 6 }}>{a.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", marginBottom: 2 }}>{a.label}</div>
                      <div style={{ fontSize: 11, color: "#94A3B8" }}>{a.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── STOCK TABLE ── */}
          {activeTab === "stock" && (
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F8FAFC" }}>
                    {["Blood group", "Units available", "Critical threshold", "Low threshold", "Status", "Actions"].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #E2E8F0" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stock.map((s, i) => {
                    const st = getStatus(s.units_available, s.critical_threshold, s.low_threshold);
                    return (
                      <tr key={s.id} style={{ background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                        <td style={{ padding: "14px 16px", fontWeight: 700, fontSize: 15, color: "#0F172A" }}>{s.blood_group}</td>
                        <td style={{ padding: "14px 16px", fontWeight: 600 }}>{s.units_available}</td>
                        <td style={{ padding: "14px 16px", color: "#64748B" }}>{s.critical_threshold}</td>
                        <td style={{ padding: "14px 16px", color: "#64748B" }}>{s.low_threshold}</td>
                        <td style={{ padding: "14px 16px" }}><Badge status={st} /></td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <Btn variant="secondary" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => this.openModal("edit", s.blood_group_id)}>Edit</Btn>
                            <Btn variant="danger" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => this.openModal("delete", s.blood_group_id)}>Remove</Btn>
                            <Btn variant="secondary" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => this.openModal("thresh", s.blood_group_id)}>Thresholds</Btn>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── LOGS ── */}
          {activeTab === "logs" && (
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
              {logs.length === 0 ? (
                <div style={{ padding: "3rem", textAlign: "center", color: "#94A3B8" }}>No activity logged yet.</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#F8FAFC" }}>
                      {["Time", "Action", "Blood group", "Units", "Note"].map(h => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #E2E8F0" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((l, i) => (
                      <tr key={l.id} style={{ background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748B" }}>{new Date(l.created_at).toLocaleString()}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: l.action === "dispense" ? "#FEE2E2" : l.action === "delete" ? "#F1F5F9" : "#D1FAE5", color: l.action === "dispense" ? "#991B1B" : l.action === "delete" ? "#475569" : "#065F46" }}>
                            {l.action.charAt(0).toUpperCase() + l.action.slice(1)}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", fontWeight: 700, color: "#0F172A" }}>{l.blood_group}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13 }}>{l.units} units</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748B" }}>{l.note || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── THRESHOLDS ── */}
          {activeTab === "thresholds" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {stock.map(s => {
                const st = getStatus(s.units_available, s.critical_threshold, s.low_threshold);
                const c = STATUS[st];
                return (
                  <div key={s.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0", padding: "1.25rem", display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: c.text, flexShrink: 0 }}>{s.blood_group}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: "#64748B" }}>Critical: <strong>{s.critical_threshold}</strong> &nbsp;|&nbsp; Low: <strong>{s.low_threshold}</strong> &nbsp;|&nbsp; Current: <strong>{s.units_available}</strong></span>
                        <Badge status={st} />
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        <div style={{ flex: s.critical_threshold, height: 6, background: "#FEE2E2", borderRadius: "4px 0 0 4px" }} />
                        <div style={{ flex: Math.max(0, s.low_threshold - s.critical_threshold), height: 6, background: "#FEF3C7" }} />
                        <div style={{ flex: Math.max(0, s.units_available - s.low_threshold), height: 6, background: "#D1FAE5", borderRadius: "0 4px 4px 0" }} />
                      </div>
                    </div>
                    <Btn variant="secondary" style={{ fontSize: 12, padding: "7px 14px" }} onClick={() => this.openModal("thresh", s.blood_group_id)}>Edit thresholds</Btn>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── MODALS ── */}

        <Modal open={addModal} title="Add blood bag" onClose={() => this.setState({ addModal: false })}>
          <Select label="Blood group" options={bloodGroupOptions} value={form.blood_group_id} onChange={this.handleGroupChange} />
          <Input label="Donor ID" placeholder="e.g. DNR-0231" value={form.donor_id} onChange={e => this.setState(prev => ({ form: { ...prev.form, donor_id: e.target.value } }))} />
          <Input label="Date of donation" type="date" value={form.donation_date} onChange={e => this.setState(prev => ({ form: { ...prev.form, donation_date: e.target.value } }))} />
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <Btn variant="secondary" full onClick={() => this.setState({ addModal: false })}>Cancel</Btn>
            <Btn full disabled={submitting} onClick={() => this.submit("/stock/add", { blood_group_id: form.blood_group_id, donor_id: form.donor_id, donation_date: form.donation_date }, "Blood bag added successfully.", "addModal")}>
              {submitting ? "Saving…" : "Add record"}
            </Btn>
          </div>
        </Modal>

        {/* Edit */}
        <Modal open={editModal} title="Edit blood bag count" onClose={() => this.setState({ editModal: false })}>
          <Select label="Blood group" options={bloodGroupOptions} value={form.blood_group_id} onChange={this.handleGroupChange} />
          {currentStock && <p style={{ fontSize: 12, color: "#64748B", marginBottom: 12, marginTop: -4 }}>Current stock: <strong>{currentStock.units_available} units</strong></p>}
          <Input label="New unit count" type="number" min="0" placeholder="Enter corrected count" value={form.units} onChange={e => this.setState(prev => ({ form: { ...prev.form, units: e.target.value } }))} />
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <Btn variant="secondary" full onClick={() => this.setState({ editModal: false })}>Cancel</Btn>
            <Btn full disabled={submitting} onClick={() => this.submit("/stock/edit", { blood_group_id: form.blood_group_id, units: parseInt(form.units), note: form.note || "Count manually updated" }, "Stock count updated.", "editModal")}>
              {submitting ? "Saving…" : "Save changes"}
            </Btn>
          </div>
        </Modal>

        {/* Delete */}
        <Modal open={deleteModal} title="Remove blood bag record" onClose={() => this.setState({ deleteModal: false })}>
          <Select label="Blood group" options={bloodGroupOptions} value={form.blood_group_id} onChange={this.handleGroupChange} />
          <div style={{ background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#991B1B" }}>
            ⚠ This will set stock to 0. This cannot be undone.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="secondary" full onClick={() => this.setState({ deleteModal: false })}>Cancel</Btn>
            <Btn variant="danger" full disabled={submitting} onClick={() => this.submit("/stock/delete", { blood_group_id: form.blood_group_id }, "Record removed.", "deleteModal")}>
              {submitting ? "Removing…" : "Remove record"}
            </Btn>
          </div>
        </Modal>

        {/* Dispense */}
        <Modal open={dispenseModal} title="Dispense blood" onClose={() => this.setState({ dispenseModal: false })}>
          <Select label="Blood group" options={bloodGroupOptions} value={form.blood_group_id} onChange={this.handleGroupChange} />
          {currentStock && <p style={{ fontSize: 12, color: "#64748B", marginBottom: 12, marginTop: -4 }}>Available: <strong>{currentStock.units_available} units</strong></p>}
          <Input label="Units to dispense" type="number" min="1" placeholder="e.g. 2" value={form.units} onChange={e => this.setState(prev => ({ form: { ...prev.form, units: e.target.value } }))} />
          <Input label="Recipient / note" placeholder="Patient ID, ward, request #…" value={form.note} onChange={e => this.setState(prev => ({ form: { ...prev.form, note: e.target.value } }))} />
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <Btn variant="secondary" full onClick={() => this.setState({ dispenseModal: false })}>Cancel</Btn>
            <Btn variant="danger" full disabled={submitting} onClick={() => this.submit("/stock/dispense", { blood_group_id: form.blood_group_id, units: parseInt(form.units), note: form.note }, "Blood dispensed successfully.", "dispenseModal")}>
              {submitting ? "Logging…" : "Log dispense"}
            </Btn>
          </div>
        </Modal>

        {/* Search */}
        <Modal open={searchModal} title="Search & filter stock" onClose={() => this.setState({ searchModal: false })}>
          <Field label="Filter by blood group">
            <select value={searchGroup} onChange={e => this.setState({ searchGroup: e.target.value })} style={inputStyle}>
              <option value="all">All groups</option>
              {stock.map(s => <option key={s.blood_group_id} value={s.blood_group_id}>{s.blood_group}</option>)}
            </select>
          </Field>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {filteredStock.map(s => {
              const st = getStatus(s.units_available, s.critical_threshold, s.low_threshold);
              const c = STATUS[st];
              return (
                <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: c.bg, borderRadius: 8, border: `1px solid ${c.border}` }}>
                  <span style={{ fontWeight: 700, color: c.text }}>{s.blood_group}</span>
                  <span style={{ fontSize: 13, color: c.text }}>{s.units_available} units</span>
                  <Badge status={st} />
                </div>
              );
            })}
          </div>
          <Btn variant="secondary" full onClick={() => this.setState({ searchModal: false })}>Close</Btn>
        </Modal>

        {/* Threshold */}
        <Modal open={threshModal} title={`Set thresholds — ${currentStock?.blood_group || ""}`} onClose={() => this.setState({ threshModal: false })}>
          <Select label="Blood group" options={bloodGroupOptions} value={form.blood_group_id} onChange={this.handleGroupChange} />
          <Input label="Critical threshold (units)" type="number" min="0" value={form.critical_threshold} onChange={e => this.setState(prev => ({ form: { ...prev.form, critical_threshold: e.target.value } }))} />
          <Input label="Low stock threshold (units)" type="number" min="0" value={form.low_threshold} onChange={e => this.setState(prev => ({ form: { ...prev.form, low_threshold: e.target.value } }))} />
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <Btn variant="secondary" full onClick={() => this.setState({ threshModal: false })}>Cancel</Btn>
            <Btn full disabled={submitting} onClick={() => this.submit("/stock/threshold", { blood_group_id: form.blood_group_id, critical_threshold: parseInt(form.critical_threshold), low_threshold: parseInt(form.low_threshold) }, "Thresholds updated.", "threshModal")}>
              {submitting ? "Saving…" : "Save thresholds"}
            </Btn>
          </div>
        </Modal>
      </div>
    );
  }
}

export default ManageDonors;