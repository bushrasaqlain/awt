import { Component, createRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// ─────────────────────────────────────────────────────────────────────────────
// BloodDonations.jsx
// Blood camp donation tracking page with USB barcode scanner support.
//
// Barcode format printed on blood bag:  donorId|bloodGroup|YYYY-MM-DD
// Example:                              42|A+|2025-07-01
//
// USB scanner fires the string + Enter key into the hidden input automatically.
// ─────────────────────────────────────────────────────────────────────────────

class BloodDonations extends Component {
  constructor(props) {
    super(props);
    this.state = {
      donations:   [],
      loading:     true,
      saving:      false,
      error:       "",
      success:     "",

      // Hidden scan input buffer
      scanBuffer: "",

      // Last scanned preview (shown on screen before saving)
      scanned: null,   // { donor_id, blood_group, donation_date, raw }

      // Manual entry form (fallback)
      showManual:    false,
      manualDonorId: "",
      manualBGroup:  "",
      manualDate:    new Date().toISOString().split("T")[0],
      manualCamp:    "",

      // Delete confirm
      deleteId: null,
      deleting: false,

      // Search / filter
      searchTerm:        "",
      filterBloodGroup:  "",

      // Scanning active/paused
      scanActive: true,
    };

    this.scanInputRef = createRef();
  }

  componentDidMount() {
    this.fetchDonations();
    // Auto-focus hidden scan input on mount
    this.focusScanInput();
  }

  focusScanInput() {
    if (this.scanInputRef.current) {
      this.scanInputRef.current.focus();
    }
  }

  showAlert(type, msg) {
    this.setState({ [type]: msg });
    setTimeout(() => this.setState({ [type]: "" }), 4000);
  }

  // ── Fetch all donations ───────────────────────────────────
  async fetchDonations() {
    this.setState({ loading: true });
    try {
      const res  = await fetch("/api/blood-donations");
      const data = await res.json();
      this.setState({ donations: data.data || [], loading: false });
    } catch {
      this.setState({ loading: false });
      this.showAlert("error", "Failed to load donations.");
    }
  }

  // ── Barcode scan handler ──────────────────────────────────
  // USB scanner types fast and fires Enter at the end
  handleScanKeyDown(e) {
    if (e.key === "Enter") {
      const raw = this.state.scanBuffer.trim();
      this.setState({ scanBuffer: "" });

      if (!raw) return;

      // Parse  donorId|bloodGroup|YYYY-MM-DD
      const parts = raw.split("|");
      if (parts.length < 3) {
        return this.showAlert("error", `Invalid barcode format. Got: "${raw}". Expected: ID|BloodGroup|Date`);
      }

      const donor_id      = parts[0].trim();
      const blood_group   = parts[1].trim().toUpperCase();
      const donation_date = parts[2].trim();

      // Show preview card so staff can confirm before auto-save
      this.setState({
        scanned: { donor_id, blood_group, donation_date, raw },
      });

      // Auto-save immediately
      this.saveScan({ donor_id, blood_group, donation_date, raw });
    }
  }

  // ── Save scanned / manual donation ───────────────────────
  async saveScan({ donor_id, blood_group, donation_date, raw, camp_name }) {
    this.setState({ saving: true });
    try {
      const res  = await fetch("/api/blood-donations/scan", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          raw:           raw || null,
          donor_id,
          blood_group,
          donation_date,
          camp_name:     camp_name || null,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        this.showAlert("success", data.message || "Donation saved successfully.");
        this.fetchDonations();
        // Clear scanned preview after 3 s
        setTimeout(() => this.setState({ scanned: null }), 3000);
      } else {
        this.showAlert("error", data.message || "Failed to save.");
        this.setState({ scanned: null });
      }
    } catch {
      this.showAlert("error", "Network error. Could not save donation.");
      this.setState({ scanned: null });
    } finally {
      this.setState({ saving: false });
      // Re-focus hidden input so scanner is always ready
      this.focusScanInput();
    }
  }

  // ── Manual form submit ────────────────────────────────────
  handleManualSubmit(e) {
    e.preventDefault();
    const { manualDonorId, manualBGroup, manualDate, manualCamp } = this.state;

    if (!manualDonorId.trim()) return this.showAlert("error", "Donor ID is required.");
    if (!manualBGroup)         return this.showAlert("error", "Blood group is required.");
    if (!manualDate)           return this.showAlert("error", "Donation date is required.");

    this.saveScan({
      donor_id:      manualDonorId.trim(),
      blood_group:   manualBGroup,
      donation_date: manualDate,
      camp_name:     manualCamp,
      raw:           null,
    });

    this.setState({ showManual: false, manualDonorId: "", manualBGroup: "", manualCamp: "" });
  }

  // ── Delete ────────────────────────────────────────────────
  async handleDelete(id) {
    this.setState({ deleting: true });
    try {
      const res  = await fetch(`/api/blood-donations/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        this.setState({ deleteId: null });
        this.showAlert("success", "Record deleted.");
        this.fetchDonations();
      } else {
        this.showAlert("error", data.message || "Delete failed.");
      }
    } catch {
      this.showAlert("error", "Network error.");
    } finally {
      this.setState({ deleting: false });
    }
  }

  // ── Filtered donations ────────────────────────────────────
  getFiltered() {
    const { donations, searchTerm, filterBloodGroup } = this.state;
    return donations.filter(d => {
      const matchSearch = !searchTerm ||
        d.donor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(d.donor_id).includes(searchTerm);
      const matchGroup = !filterBloodGroup || d.blood_group === filterBloodGroup;
      return matchSearch && matchGroup;
    });
  }

  // ── Blood group badge color ───────────────────────────────
  bgColor(group) {
    const map = {
      "A+": "#e74c3c", "A-": "#c0392b",
      "B+": "#2980b9", "B-": "#1a5276",
      "AB+": "#8e44ad", "AB-": "#6c3483",
      "O+": "#27ae60", "O-": "#1e8449",
    };
    return map[group] || "#555";
  }

  render() {
    const {
      loading, saving, error, success,
      scanBuffer, scanned, scanActive,
      showManual, manualDonorId, manualBGroup, manualDate, manualCamp,
      deleteId, deleting,
      searchTerm, filterBloodGroup,
    } = this.state;

    const filtered   = this.getFiltered();
    const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

    // ── Summary counts ────────────────────────────────────────
    const { donations } = this.state;
    const total       = donations.length;
    const todayStr    = new Date().toISOString().split("T")[0];
    const todayCount  = donations.filter(d => d.donation_date === todayStr).length;
    const groupCounts = bloodGroups.reduce((acc, g) => {
      acc[g] = donations.filter(d => d.blood_group === g).length;
      return acc;
    }, {});

    return (
      <div style={{ background: "#f4f6fb", minHeight: "100vh" }} className="pt-5 mt-4">

        {/* ── Hidden barcode scan input (always focused) ────── */}
        <input
          ref={this.scanInputRef}
          type="text"
          value={scanBuffer}
          onChange={e => this.setState({ scanBuffer: e.target.value })}
          onKeyDown={e => this.handleScanKeyDown(e)}
          onBlur={() => { if (scanActive) this.focusScanInput(); }}
          style={{
            position: "fixed", top: -9999, left: -9999,
            opacity: 0, width: 1, height: 1,
          }}
          tabIndex={-1}
          readOnly={!scanActive}
          aria-hidden="true"
        />

        <div className="container py-4" style={{ maxWidth: 1000 }}>

          {/* ── Page Header ────────────────────────────────── */}
          <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
            <div>
              <h4 className="fw-bold mb-1" style={{ color: "#c9140e" }}>
                <i className="bi bi-droplet-fill me-2" />
                Blood Camp Donations
              </h4>
              <p className="text-muted small mb-0">
                Scan a blood bag barcode to record a donation instantly.
              </p>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              {/* Scan toggle */}
              <button
                onClick={() => {
                  this.setState(s => ({ scanActive: !s.scanActive }), () => {
                    if (this.state.scanActive) this.focusScanInput();
                  });
                }}
                style={{
                  background: scanActive ? "#fff3cd" : "#fff",
                  color: scanActive ? "#856404" : "#555",
                  border: `1.5px solid ${scanActive ? "#ffc107" : "#ccc"}`,
                  borderRadius: 8, padding: "9px 16px",
                  fontWeight: 600, cursor: "pointer", fontSize: 14,
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                <i className={`bi bi-${scanActive ? "pause-circle" : "play-circle"}`} />
                {scanActive ? "Scanning Active" : "Scanning Paused"}
              </button>

              {/* Manual entry */}
              <button
                onClick={() => this.setState({ showManual: true })}
                style={{
                  background: "#fff", color: "#c9140e",
                  border: "1.5px solid #c9140e",
                  borderRadius: 8, padding: "9px 16px",
                  fontWeight: 600, cursor: "pointer", fontSize: 14,
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                <i className="bi bi-pencil-square" /> Manual Entry
              </button>
            </div>
          </div>

          {/* ── Alerts ─────────────────────────────────────── */}
          {error   && (
            <div className="alert alert-danger d-flex align-items-center py-2 small mb-3">
              <i className="bi bi-exclamation-triangle-fill me-2" /> {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success d-flex align-items-center py-2 small mb-3">
              <i className="bi bi-check-circle-fill me-2" /> {success}
            </div>
          )}

          {/* ── Scan feedback card ──────────────────────────── */}
          {(saving || scanned) && (
            <div className="card border-0 mb-4 shadow-sm" style={{
              borderLeft: "4px solid #c9140e !important",
              background: saving ? "#fff8f8" : "#f0fff4",
            }}>
              <div className="card-body d-flex align-items-center gap-3 py-3">
                {saving ? (
                  <>
                    <div className="spinner-border text-danger spinner-border-sm" />
                    <div>
                      <p className="mb-0 fw-semibold small">Saving donation...</p>
                      {scanned && (
                        <p className="mb-0 text-muted" style={{ fontSize: 12 }}>
                          Donor ID: <strong>{scanned.donor_id}</strong> &nbsp;|&nbsp;
                          Blood Group: <strong>{scanned.blood_group}</strong> &nbsp;|&nbsp;
                          Date: <strong>{scanned.donation_date}</strong>
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle-fill text-success fs-4" />
                    <div>
                      <p className="mb-0 fw-semibold small text-success">Barcode scanned successfully!</p>
                      <p className="mb-0 text-muted" style={{ fontSize: 12 }}>
                        Donor ID: <strong>{scanned?.donor_id}</strong> &nbsp;|&nbsp;
                        Blood Group: <strong>{scanned?.blood_group}</strong> &nbsp;|&nbsp;
                        Date: <strong>{scanned?.donation_date}</strong>
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── Scan instruction banner ─────────────────────── */}
          {!saving && !scanned && scanActive && (
            <div className="card border-0 mb-4" style={{
              background: "linear-gradient(135deg, #c9140e 0%, #a00f0b 100%)",
              borderRadius: 12,
            }}>
              <div className="card-body text-white d-flex align-items-center gap-4 py-3">
                <i className="bi bi-upc-scan" style={{ fontSize: 40 }} />
                <div>
                  <p className="mb-0 fw-bold">Scanner Ready</p>
                  <p className="mb-0 small" style={{ opacity: 0.85 }}>
                    Point USB barcode scanner at the blood bag and scan.
                    Data will be saved automatically.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Summary cards ───────────────────────────────── */}
          <div className="row g-3 mb-4">
            <div className="col-6 col-md-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center py-3">
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#c9140e" }}>{total}</div>
                  <div className="text-muted small">Total Donations</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center py-3">
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#198754" }}>{todayCount}</div>
                  <div className="text-muted small">Today</div>
                </div>
              </div>
            </div>
            {/* Top 2 blood groups */}
            {Object.entries(groupCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 2)
              .map(([g, c]) => (
                <div key={g} className="col-6 col-md-3">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body text-center py-3">
                      <span style={{
                        background: this.bgColor(g), color: "#fff",
                        borderRadius: 6, padding: "2px 10px",
                        fontWeight: 700, fontSize: 18,
                      }}>{g}</span>
                      <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>{c}</div>
                      <div className="text-muted small">donations</div>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>

          {/* ── Table card ──────────────────────────────────── */}
          <div className="card border-0 shadow-sm">
            <div className="card-body">

              {/* Table header + filters */}
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h6 className="fw-bold mb-0">Donation Records</h6>
                <div className="d-flex gap-2 flex-wrap">
                  {/* Search */}
                  <div className="input-group" style={{ width: 200 }}>
                    <span className="input-group-text bg-white border-end-0" style={{ fontSize: 13 }}>
                      <i className="bi bi-search text-muted" />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-0"
                      placeholder="Search donor..."
                      style={{ fontSize: 13 }}
                      value={searchTerm}
                      onChange={e => this.setState({ searchTerm: e.target.value })}
                      onFocus={() => this.setState({ scanActive: false })}
                      onBlur={() => this.setState({ scanActive: true }, () => this.focusScanInput())}
                    />
                  </div>
                  {/* Blood group filter */}
                  <select
                    className="form-select"
                    style={{ width: 110, fontSize: 13 }}
                    value={filterBloodGroup}
                    onChange={e => this.setState({ filterBloodGroup: e.target.value })}
                  >
                    <option value="">All Groups</option>
                    {bloodGroups.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-danger" />
                  <p className="text-muted small mt-2">Loading donations...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <div style={{ fontSize: 48 }}>🩸</div>
                  <p className="mt-2 mb-0 fw-semibold">No donations found.</p>
                  <p className="small">Scan a blood bag barcode or use Manual Entry.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ fontSize: 13 }}>#</th>
                        <th style={{ fontSize: 13 }}>Donor ID</th>
                        <th style={{ fontSize: 13 }}>Donor Name</th>
                        <th style={{ fontSize: 13 }}>Blood Group</th>
                        <th style={{ fontSize: 13 }}>Donation Date</th>
                        <th style={{ fontSize: 13 }}>Camp</th>
                        <th style={{ fontSize: 13 }}>Scanned At</th>
                        <th style={{ fontSize: 13 }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((d, i) => (
                        <tr key={d.id}>
                          <td className="text-muted small">{i + 1}</td>
                          <td className="fw-semibold small">#{d.donor_id}</td>
                          <td>
                            <div className="fw-semibold small">{d.donor_name || "—"}</div>
                            {d.donor_phone && (
                              <div className="text-muted" style={{ fontSize: 11 }}>{d.donor_phone}</div>
                            )}
                          </td>
                          <td>
                            <span style={{
                              background: this.bgColor(d.blood_group),
                              color: "#fff", borderRadius: 6,
                              padding: "3px 10px", fontWeight: 700, fontSize: 13,
                            }}>
                              {d.blood_group}
                            </span>
                          </td>
                          <td className="small">{d.donation_date}</td>
                          <td className="small text-muted">{d.camp_name || "—"}</td>
                          <td className="small text-muted">
                            {d.created_at
                              ? new Date(d.created_at).toLocaleString("en-PK", {
                                  dateStyle: "short", timeStyle: "short",
                                })
                              : "—"}
                          </td>
                          <td>
                            {deleteId === d.id ? (
                              <div className="d-flex gap-1 align-items-center">
                                <span className="text-danger small fw-semibold">Delete?</span>
                                <button
                                  className="btn btn-danger btn-sm py-0 px-2"
                                  onClick={() => this.handleDelete(d.id)}
                                  disabled={deleting}
                                  style={{ fontSize: 12 }}
                                >
                                  {deleting ? <span className="spinner-border spinner-border-sm" /> : "Yes"}
                                </button>
                                <button
                                  className="btn btn-secondary btn-sm py-0 px-2"
                                  onClick={() => this.setState({ deleteId: null })}
                                  style={{ fontSize: 12 }}
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                className="btn btn-link p-0 text-danger"
                                onClick={() => this.setState({ deleteId: d.id })}
                                title="Delete"
                              >
                                <i className="bi bi-trash" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {filtered.length > 0 && (
                <div className="mt-2 text-muted small text-end">
                  Showing {filtered.length} of {total} records
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Manual Entry Modal ──────────────────────────────── */}
        {showManual && (
          <div
            style={{
              position: "fixed", inset: 0, zIndex: 2000,
              background: "rgba(0,0,0,0.45)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 16,
            }}
            onClick={() => this.setState({ showManual: false })}
          >
            <div
              style={{
                background: "#fff", borderRadius: 12,
                width: "100%", maxWidth: 440,
                boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                overflow: "hidden",
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div style={{
                padding: "16px 20px", borderBottom: "1px solid #f0f0f0",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <h6 style={{ margin: 0, fontWeight: 700 }}>
                  <i className="bi bi-pencil-square me-2 text-danger" />
                  Manual Donation Entry
                </h6>
                <button
                  onClick={() => this.setState({ showManual: false })}
                  style={{
                    background: "none", border: "none", fontSize: 20,
                    cursor: "pointer", color: "#888",
                  }}
                >×</button>
              </div>

              {/* Modal body */}
              <form onSubmit={e => this.handleManualSubmit(e)}>
                <div style={{ padding: 20 }} className="d-flex flex-column gap-3">

                  <div>
                    <label className="form-label fw-semibold small mb-1">Donor ID *</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g. 42"
                      value={manualDonorId}
                      onChange={e => this.setState({ manualDonorId: e.target.value })}
                      autoFocus
                    />
                    <div className="form-text">Donor must already be registered in the system.</div>
                  </div>

                  <div>
                    <label className="form-label fw-semibold small mb-1">Blood Group *</label>
                    <select
                      className="form-select"
                      value={manualBGroup}
                      onChange={e => this.setState({ manualBGroup: e.target.value })}
                    >
                      <option value="">-- Select Blood Group --</option>
                      {bloodGroups.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="form-label fw-semibold small mb-1">Donation Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={manualDate}
                      onChange={e => this.setState({ manualDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="form-label fw-semibold small mb-1">Camp Name <span className="text-muted fw-normal">(optional)</span></label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. AWT Rawalpindi Camp"
                      value={manualCamp}
                      onChange={e => this.setState({ manualCamp: e.target.value })}
                    />
                  </div>
                </div>

                {/* Modal footer */}
                <div style={{
                  padding: "12px 20px", borderTop: "1px solid #f0f0f0",
                  display: "flex", justifyContent: "flex-end", gap: 10,
                }}>
                  <button
                    type="button"
                    onClick={() => this.setState({ showManual: false })}
                    style={{
                      padding: "8px 18px", borderRadius: 8,
                      border: "1px solid #ddd", background: "#f8f9fa",
                      fontWeight: 600, cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: "8px 20px", borderRadius: 8,
                      border: "none", background: "#c9140e",
                      color: "#fff", fontWeight: 600, cursor: "pointer",
                    }}
                  >
                    {saving
                      ? <span className="spinner-border spinner-border-sm" />
                      : <><i className="bi bi-save me-1" />Save Donation</>
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default BloodDonations;