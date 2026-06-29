import { Component, createRef } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import * as XLSX from 'xlsx'; 

class Cities extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cities:     [],
      loading:    true,
      submitting: false,
      importing:  false,
      error:      "",
      success:    "",
      showAdd:    false,
      newCity:    "",
      showEdit:   false,
      editId:     null,
      editName:   "",
      editStatus: "active",
      deleteId:   null,
    };
    this.fileInputRef = createRef();
  }

  componentDidMount() { this.fetchCities(); }

  showAlert(type, msg) {
    this.setState({ [type]: msg });
    setTimeout(() => this.setState({ [type]: "" }), 3000);
  }

  async fetchCities() {
    this.setState({ loading: true });
    try {
      const res  = await fetch("/api/cities");
      const data = await res.json();
      this.setState({ cities: data.data || [], loading: false });
    } catch {
      this.setState({ loading: false });
    }
  }

  // ── Export ────────────────────────────────────────────────
  handleExport() {
    const { cities } = this.state;
    if (!cities.length) return this.showAlert("error", "No cities to export.");

    const header = "name,status";
    const rows   = cities.map(c => `${c.name},${c.status}`);
    const csv    = [header, ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "cities.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Import ────────────────────────────────────────────────
  handleImportClick() {
    this.fileInputRef.current.value = "";   // allow re-selecting same file
    this.fileInputRef.current.click();
  }
async handleFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;

  const fileName = file.name.toLowerCase();
  const isCSV    = fileName.endsWith(".csv");
  const isExcel  = fileName.endsWith(".xlsx") || fileName.endsWith(".xls");

  if (!isCSV && !isExcel) {
    return this.showAlert("error", "Please select a .csv, .xlsx, or .xls file.");
  }

  this.setState({ importing: true });
  try {
    let cities = [];

    if (isCSV) {
      // ── CSV parsing (same as before) ──────────────────────
      const text      = await file.text();
      const lines     = text.trim().split("\n").filter(Boolean);
      const dataLines = lines[0].toLowerCase().startsWith("name")
        ? lines.slice(1)
        : lines;

      cities = dataLines.map(line => {
        const [name = "", status = "active"] = line.split(",").map(s => s.trim());
        return {
          name,
          status: ["active", "inactive"].includes(status.toLowerCase())
            ? status.toLowerCase()
            : "active",
        };
      }).filter(c => c.name);

    } else {
      // ── Excel parsing ─────────────────────────────────────
      const buffer   = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });

      // Read first sheet
      const sheet    = workbook.Sheets[workbook.SheetNames[0]];
      const rows     = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      // sheet_to_json uses header row as keys automatically
      cities = rows.map(row => {
        const name   = String(row["name"]   || row["Name"]   || "").trim();
        const status = String(row["status"] || row["Status"] || "active").trim().toLowerCase();
        return {
          name,
          status: ["active", "inactive"].includes(status) ? status : "active",
        };
      }).filter(c => c.name);
    }

    if (!cities.length) {
      return this.showAlert("error", "No valid city rows found in the file.");
    }

    const res  = await fetch("/api/cities/import", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ cities }),
    });
    const data = await res.json();

    if (res.ok) {
      this.showAlert("success", data.message || "Cities imported successfully.");
      this.fetchCities();
    } else {
      this.showAlert("error", data.message || "Import failed.");
    }
  } catch {
    this.showAlert("error", "Failed to read or upload file.");
  } finally {
    this.setState({ importing: false });
  }
}

  // ── Add / Update / Delete (unchanged) ────────────────────
  async handleAdd(e) {
    e.preventDefault();
    const { newCity } = this.state;
    if (!newCity.trim()) return this.showAlert("error", "City name is required.");
    this.setState({ submitting: true });
    try {
      const res  = await fetch("/api/cities", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name: newCity.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        this.setState({ newCity: "", showAdd: false });
        this.showAlert("success", "City added successfully.");
        this.fetchCities();
      } else {
        this.showAlert("error", data.message);
      }
    } catch {
      this.showAlert("error", "Something went wrong.");
    } finally {
      this.setState({ submitting: false });
    }
  }

  async handleUpdate(e) {
    e.preventDefault();
    const { editId, editName, editStatus } = this.state;
    if (!editName.trim()) return this.showAlert("error", "City name is required.");
    this.setState({ submitting: true });
    try {
      const res  = await fetch(`/api/cities/${editId}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name: editName, status: editStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        this.setState({ showEdit: false, editId: null });
        this.showAlert("success", "City updated successfully.");
        this.fetchCities();
      } else {
        this.showAlert("error", data.message);
      }
    } catch {
      this.showAlert("error", "Something went wrong.");
    } finally {
      this.setState({ submitting: false });
    }
  }

  async handleDelete(id) {
    this.setState({ submitting: true });
    try {
      const res  = await fetch(`/api/cities/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        this.setState({ deleteId: null });
        this.showAlert("success", "City deleted.");
        this.fetchCities();
      } else {
        this.showAlert("error", data.message);
      }
    } catch {
      this.showAlert("error", "Something went wrong.");
    } finally {
      this.setState({ submitting: false });
    }
  }

  openEdit(city) {
    this.setState({ showEdit: true, editId: city.id, editName: city.name, editStatus: city.status });
  }

  // ── Modal (unchanged) ─────────────────────────────────────
  renderModal({ title, onClose, onSubmit, children, submitting }) {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 2000,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }} onClick={onClose}>
        <div style={{
          background: "#fff", borderRadius: 12,
          width: "100%", maxWidth: 440,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }} onClick={e => e.stopPropagation()}>
          <div style={{
            padding: "16px 20px", borderBottom: "1px solid #f0f0f0",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <h6 style={{ margin: 0, fontWeight: 700 }}>{title}</h6>
            <button onClick={onClose} style={{
              background: "none", border: "none", fontSize: 20,
              cursor: "pointer", color: "#888", lineHeight: 1,
            }}>×</button>
          </div>
          <form onSubmit={onSubmit}>
            <div style={{ padding: 20 }}>{children}</div>
            <div style={{
              padding: "12px 20px", borderTop: "1px solid #f0f0f0",
              display: "flex", justifyContent: "flex-end", gap: 10,
            }}>
              <button type="button" onClick={onClose} style={{
                padding: "8px 18px", borderRadius: 8, border: "1px solid #ddd",
                background: "#f8f9fa", fontWeight: 600, cursor: "pointer",
              }}>Cancel</button>
              <button type="submit" disabled={submitting} style={{
                padding: "8px 20px", borderRadius: 8, border: "none",
                background: "#dc3545", color: "#fff", fontWeight: 600, cursor: "pointer",
              }}>
                {submitting ? <span className="spinner-border spinner-border-sm" /> : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  render() {
    const {
      cities, loading, submitting, importing,
      error, success,
      showAdd, newCity,
      showEdit, editName, editStatus,
      deleteId,
    } = this.state;

    return (
      <div className="pt-5 mt-4" style={{ background: "#f8f9fa", minHeight: "100vh" }}>
        <div className="container py-4" style={{ maxWidth: 800 }}>

          {/* Page title + action buttons */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="fw-bold mb-1">City Management</h4>
              <p className="text-muted small mb-0">Add and manage cities for donor registration.</p>
            </div>

            <div className="d-flex gap-2">
              {/* Hidden file input */}
              <input
  ref={this.fileInputRef}
  type="file"
  accept=".csv, .xlsx, .xls"   // ← allow all three
  style={{ display: "none" }}
  onChange={e => this.handleFileChange(e)}
/>

              {/* Import */}
              <button
                onClick={() => this.handleImportClick()}
                disabled={importing}
                style={{
                  background: "#fff", color: "#dc3545",
                  border: "1.5px solid #dc3545",
                  borderRadius: 8, padding: "9px 16px",
                  fontWeight: 600, cursor: "pointer", fontSize: 14,
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                {importing
                  ? <span className="spinner-border spinner-border-sm text-danger" />
                  : <i className="bi bi-upload" />
                }
                Import
              </button>

              {/* Export */}
              <button
                onClick={() => this.handleExport()}
                style={{
                  background: "#fff", color: "#198754",
                  border: "1.5px solid #198754",
                  borderRadius: 8, padding: "9px 16px",
                  fontWeight: 600, cursor: "pointer", fontSize: 14,
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                <i className="bi bi-download" /> Export
              </button>

              {/* Add */}
              <button
                onClick={() => this.setState({ showAdd: true, newCity: "" })}
                style={{
                  background: "#dc3545", color: "#fff", border: "none",
                  borderRadius: 8, padding: "9px 20px",
                  fontWeight: 600, cursor: "pointer", fontSize: 14,
                }}
              >
                + Add City
              </button>
            </div>
          </div>

          {/* Alerts */}
          {error   && <div className="alert alert-danger  py-2 small">⚠️ {error}</div>}
          {success && <div className="alert alert-success py-2 small">✅ {success}</div>}

          {/* Table — unchanged */}
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">All Cities</h6>
                <span className="badge bg-danger">{cities.length} total</span>
              </div>
              {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-danger" /></div>
              ) : cities.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <div style={{ fontSize: 40 }}>🏙️</div>
                  <p className="mt-2">No cities added yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>#</th><th>City Name</th><th>Status</th><th>Added On</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cities.map((city, i) => (
                        <tr key={city.id}>
                          <td className="text-muted small">{i + 1}</td>
                          <td className="fw-semibold">{city.name}</td>
                          <td>
                            <span className={`badge bg-${city.status === "active" ? "success" : "secondary"}`}>
                              {city.status}
                            </span>
                          </td>
                          <td className="text-muted small">{city.created_at?.split(" ")[0] || "—"}</td>
                          <td>
                            {deleteId === city.id ? (
                              <div className="d-flex gap-2 align-items-center">
                                <span className="text-danger small fw-semibold">Delete?</span>
                                <button className="btn btn-danger btn-sm"
                                  onClick={() => this.handleDelete(city.id)}
                                  disabled={submitting}>Yes</button>
                                <button className="btn btn-secondary btn-sm"
                                  onClick={() => this.setState({ deleteId: null })}>No</button>
                              </div>
                            ) : (
                              <div className="d-flex gap-2">
                                <button className="btn btn-link p-0 me-2 text-secondary"
                                  onClick={() => this.openEdit(city)} title="Edit">
                                  <i className="bi bi-pencil fs-8" />
                                </button>
                                <button className="btn btn-link p-0 text-danger"
                                  onClick={() => this.setState({ deleteId: city.id })} title="Delete">
                                  <i className="bi bi-trash fs-8" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Modal */}
        {showAdd && this.renderModal({
          title: "Add New City", submitting,
          onClose: () => this.setState({ showAdd: false }),
          onSubmit: e => this.handleAdd(e),
          children: (
            <div>
              <label className="form-label fw-semibold small">City Name</label>
              <input type="text" className="form-control" placeholder="e.g. Rawalpindi"
                value={newCity} onChange={e => this.setState({ newCity: e.target.value })} autoFocus />
            </div>
          ),
        })}

        {/* Edit Modal */}
        {showEdit && this.renderModal({
          title: "Edit City", submitting,
          onClose: () => this.setState({ showEdit: false }),
          onSubmit: e => this.handleUpdate(e),
          children: (
            <>
              <div className="mb-3">
                <label className="form-label fw-semibold small">City Name</label>
                <input type="text" className="form-control" value={editName}
                  onChange={e => this.setState({ editName: e.target.value })} autoFocus />
              </div>
              <div>
                <label className="form-label fw-semibold small">Status</label>
                <select className="form-select" value={editStatus}
                  onChange={e => this.setState({ editStatus: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </>
          ),
        })}
      </div>
    );
  }
}

export default Cities;