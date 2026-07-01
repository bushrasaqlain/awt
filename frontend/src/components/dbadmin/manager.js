import { Component, createRef } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
const formatPKPhone = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 11); // cap at 11 digits total

  if (digits.length === 0) return "";

  // Mobile: 03XX-XXXXXXX
  if (digits.startsWith("03")) {
    if (digits.length <= 4) return digits;
    return `${digits.slice(0, 4)}-${digits.slice(4, 11)}`;
  }

  // Landline: 0XX-XXXXXXX
  if (digits.startsWith("0")) {
    if (digits.length <= 3) return digits;
    return `${digits.slice(0, 3)}-${digits.slice(3, 10)}`;
  }

  return digits;
};
const formatName = (value) =>
  value
    .replace(/[^a-zA-Z\s]/g, "")          // strip digits & special chars
    .replace(/\b\w/g, (c) => c.toUpperCase()); // capitalise first letter of each word
const validatePKPhone = (value) => {
  const cleaned  = value.replace(/-/g, "");
  const mobile   = /^03[0-9]{9}$/.test(cleaned);
  const landline = /^0[1-9][1-9]\d{7}$/.test(cleaned);
  return mobile || landline;
};

class Management extends Component {
  constructor(props) {
    super(props);
    this.state = {
      csrs:       [],
      loading:    true,
      submitting: false,
      error:      "",
      success:    "",

      // Add modal
      showAdd:      false,
      addName:      "",
      addEmail:     "",
      addPhone:     "",
      addPassword:  "",
      addErrors:    {},

      // Edit modal
      showEdit:     false,
      editId:       null,
      editName:     "",
      editPhone:    "",
      editStatus:   "active",
      editPassword: "",
      editErrors:   {},

      // Delete confirm
      deleteId: null,

      // Password visibility
      showAddPass:  false,
      showEditPass: false,
    };
  }

  componentDidMount() { this.fetchCsrs(); }

  showAlert(type, msg) {
    this.setState({ [type]: msg });
    setTimeout(() => this.setState({ [type]: "" }), 4000);
  }

  async fetchCsrs() {
    this.setState({ loading: true });
    try {
      const res  = await fetch("/api/csr");
      const data = await res.json();
      this.setState({ csrs: data.data || [], loading: false });
    } catch {
      this.setState({ loading: false });
    }
  }

  // ── Add ───────────────────────────────────────────────────
  async handleAdd(e) {
    e.preventDefault();
    const { addName, addEmail, addPhone, addPassword } = this.state;

    const errors = {};
    if (!addName.trim())                               errors.name     = "Name is required.";
    if (!addEmail.trim())                              errors.email    = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(addEmail))          errors.email    = "Enter a valid email.";
    if (addPhone.trim() && !validatePKPhone(addPhone.trim())) {
  errors.phone = "Enter a valid Pakistani number (e.g. ***-******* or 03**-*******).";
}
    if (!addPassword.trim())                           errors.password = "Password is required.";
    else if (addPassword.length < 6)                   errors.password = "At least 6 characters.";

    if (Object.keys(errors).length) {
      return this.setState({ addErrors: errors });
    }

    this.setState({ submitting: true, addErrors: {} });
    try {
      const res  = await fetch("/api/auth/register/csr", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          name: addName.trim(), email: addEmail.trim(),
          phone: addPhone.trim(), password: addPassword,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        this.setState({ showAdd: false, addName: "", addEmail: "", addPhone: "", addPassword: "" });
        this.showAlert("success", "CSR account created successfully.");
        this.fetchCsrs();
      } else {
        // Server-side field errors
        if (data.errors) return this.setState({ addErrors: data.errors });
        this.showAlert("error", data.message || "Something went wrong.");
      }
    } catch {
      this.showAlert("error", "Something went wrong.");
    } finally {
      this.setState({ submitting: false });
    }
  }

  // ── Edit ──────────────────────────────────────────────────
  openEdit(csr) {
    this.setState({
      showEdit: true, editId: csr.id,
      editName: csr.name, editPhone: csr.phone || "",
      editStatus: csr.status, editPassword: "", editErrors: {},
    });
  }

  async handleUpdate(e) {
    e.preventDefault();
    const { editId, editName, editPhone, editStatus, editPassword } = this.state;

    const errors = {};
    if (!editName.trim()) errors.name = "Name is required.";
    if (editPassword && editPassword.length < 6) errors.password = "At least 6 characters.";
    // inside handleUpdate, where you build the errors object
if (editPhone.trim() && !validatePKPhone(editPhone.trim())) {
  errors.phone = "Enter a valid Pakistani number (e.g. 051-3657894 or 0315-1863475).";
}

    if (Object.keys(errors).length) {
      return this.setState({ editErrors: errors });
    }

    this.setState({ submitting: true, editErrors: {} });
    try {
      const body = {
        name: editName.trim(), phone: editPhone.trim(), status: editStatus,
      };
      if (editPassword) body.password = editPassword;

      const res  = await fetch(`/api/csr/${editId}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json();

      if (res.ok) {
        this.setState({ showEdit: false, editId: null });
        this.showAlert("success", "CSR updated successfully.");
        this.fetchCsrs();
      } else {
        this.showAlert("error", data.message || "Something went wrong.");
      }
    } catch {
      this.showAlert("error", "Something went wrong.");
    } finally {
      this.setState({ submitting: false });
    }
  }

  // ── Delete ────────────────────────────────────────────────
  async handleDelete(id) {
    this.setState({ submitting: true });
    try {
      const res  = await fetch(`/api/csr/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        this.setState({ deleteId: null });
        this.showAlert("success", "CSR account deleted.");
        this.fetchCsrs();
      } else {
        this.showAlert("error", data.message);
      }
    } catch {
      this.showAlert("error", "Something went wrong.");
    } finally {
      this.setState({ submitting: false });
    }
  }

  // ── Modal shell ───────────────────────────────────────────
  renderModal({ title, onClose, onSubmit, children, submitting }) {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 2000,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }} onClick={onClose}>
        <div style={{
          background: "#fff", borderRadius: 12,
          width: "100%", maxWidth: 480,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)", overflow: "hidden",
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

          <form onSubmit={onSubmit} autoComplete="off">
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

  // ── Password field helper ─────────────────────────────────
  renderPasswordField({ value, onChange, showPass, onToggle, error, placeholder = "Password", label = "Password" }) {
    return (
      <div className="mb-3">
        <label className="form-label fw-semibold small">{label}</label>
        <div className="input-group">
          <input
  type={showPass ? "text" : "password"}
  className={`form-control ${error ? "is-invalid" : ""}`}
  placeholder={placeholder}
  autoComplete="new-password"     // ← add this
  value={value}
  onChange={onChange}
/>
          <button type="button" className="btn btn-outline-secondary"
            onClick={onToggle} tabIndex={-1}>
            <i className={`bi bi-eye${showPass ? "-slash" : ""}`} />
          </button>
          {error && <div className="invalid-feedback">{error}</div>}
        </div>
      </div>
    );
  }

  render() {
    const {
      csrs, loading, submitting,
      error, success,
      showAdd, addName, addEmail, addPhone, addPassword, addErrors, showAddPass,
      showEdit, editName, editPhone, editStatus, editPassword, editErrors, showEditPass,
      deleteId,
    } = this.state;

    return (
      <div className="pt-5 mt-4" style={{ background: "#f8f9fa", minHeight: "100vh" }}>
        <div className="container py-4" style={{ maxWidth: 900 }}>

          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="fw-bold mb-1">CSR Management</h4>
              <p className="text-muted small mb-0">Manage Customer Service Representative accounts.</p>
            </div>
            <button
              onClick={() => this.setState({
                showAdd: true, addName: "", addEmail: "",
                addPhone: "", addPassword: "", addErrors: {},
              })}
              style={{
                background: "#dc3545", color: "#fff", border: "none",
                borderRadius: 8, padding: "9px 20px",
                fontWeight: 600, cursor: "pointer", fontSize: 14,
              }}
            >
              + Add CSR
            </button>
          </div>

          {/* Alerts */}
          {error   && <div className="alert alert-danger  py-2 small">⚠️ {error}</div>}
          {success && <div className="alert alert-success py-2 small">✅ {success}</div>}

          {/* Table */}
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">All CSR Accounts</h6>
                <span className="badge bg-danger">{csrs.length} total</span>
              </div>

              {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-danger" /></div>
              ) : csrs.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <div style={{ fontSize: 40 }}>👤</div>
                  <p className="mt-2">No CSR accounts yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Last Login</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csrs.map((csr, i) => (
                        <tr key={csr.id}>
                          <td className="text-muted small">{i + 1}</td>
                          <td className="fw-semibold">{csr.name}</td>
                          <td className="text-muted small">{csr.email}</td>
                          <td className="text-muted small">{csr.phone || "—"}</td>
                          <td>
                            <span className={`badge bg-${csr.status === "active" ? "success" : "secondary"}`}>
                              {csr.status}
                            </span>
                          </td>
                          <td className="text-muted small">
                            {csr.last_login ? csr.last_login.split(" ")[0] : "Never"}
                          </td>
                          <td>
                            {deleteId === csr.id ? (
                              <div className="d-flex gap-2 align-items-center">
                                <span className="text-danger small fw-semibold">Delete?</span>
                                <button className="btn btn-danger btn-sm"
                                  onClick={() => this.handleDelete(csr.id)}
                                  disabled={submitting}>Yes</button>
                                <button className="btn btn-secondary btn-sm"
                                  onClick={() => this.setState({ deleteId: null })}>No</button>
                              </div>
                            ) : (
                              <div className="d-flex gap-2">
                                <button className="btn btn-link p-0 me-2 text-secondary"
                                  onClick={() => this.openEdit(csr)} title="Edit">
                                  <i className="bi bi-pencil" />
                                </button>
                                <button className="btn btn-link p-0 text-danger"
                                  onClick={() => this.setState({ deleteId: csr.id })} title="Delete">
                                  <i className="bi bi-trash" />
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

        {/* ── Add Modal ── */}
        {showAdd && this.renderModal({
          title: "Add New CSR",
          submitting,
          onClose: () => this.setState({ showAdd: false }),
          onSubmit: e => this.handleAdd(e),
          children: (
            <>
            
              <div className="mb-3">
                <label className="form-label fw-semibold small">Full Name</label>
                <input type="text" className={`form-control ${addErrors.name ? "is-invalid" : ""}`}
                  placeholder="e.g. Sara Khan"
                  value={addName} onChange={e => this.setState({ addName: formatName(e.target.value) })} autoFocus />
                {addErrors.name && <div className="invalid-feedback">{addErrors.name}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold small">Email Address</label>
                <input
  type="email"
  className={`form-control ${addErrors.email ? "is-invalid" : ""}`}
  placeholder="e.g. sara@example.com"
  autoComplete="new-email"        // ← add this
  value={addEmail}
  onChange={e => this.setState({ addEmail: e.target.value })}
/>

                {addErrors.email && <div className="invalid-feedback">{addErrors.email}</div>}
              </div>

              <div className="mb-3">
  <label className="form-label fw-semibold small">
    Phone
  </label>
  <input
    type="tel"
    className={`form-control ${addErrors.phone ? "is-invalid" : ""}`}
    placeholder="051-3657894 or 0315-1863475"
    value={addPhone}
    maxLength={12}
  onChange={e => this.setState({ addPhone: formatPKPhone(e.target.value) })}
  />
  {addErrors.phone && <div className="invalid-feedback">{addErrors.phone}</div>}
  <div className="form-text text-muted">Landline: 051-3657894 &nbsp;|&nbsp; Mobile: 0315-1863475</div>
</div>

              {this.renderPasswordField({
                value: addPassword,
                onChange: e => this.setState({ addPassword: e.target.value }),
                showPass: showAddPass,
                onToggle: () => this.setState({ showAddPass: !showAddPass }),
                error: addErrors.password,
              })}
            </>
          ),
        })}

        {/* ── Edit Modal ── */}
        {showEdit && this.renderModal({
          title: "Edit CSR Account",
          submitting,
          onClose: () => this.setState({ showEdit: false }),
          onSubmit: e => this.handleUpdate(e),
          children: (
            <>
              <div className="mb-3">
                <label className="form-label fw-semibold small">Full Name</label>
                <input type="text" className={`form-control ${editErrors.name ? "is-invalid" : ""}`}
                  value={editName} onChange={e => this.setState({ editName: e.target.value })} autoFocus />
                {editErrors.name && <div className="invalid-feedback">{editErrors.name}</div>}
              </div>

              <div className="mb-3">
  <label className="form-label fw-semibold small">Phone</label>
  <input
    type="tel"
    className={`form-control ${editErrors.phone ? "is-invalid" : ""}`}
    placeholder="051-3657894 or 0315-1863475"
    value={editPhone}
    maxLength={12}
    onChange={e => this.setState({ editPhone: formatPKPhone(e.target.value) })}
  />
  {editErrors.phone && <div className="invalid-feedback">{editErrors.phone}</div>}
  <div className="form-text text-muted">Landline: 051-3657894 &nbsp;|&nbsp; Mobile: 0315-1863475</div>
</div>

              <div className="mb-3">
                <label className="form-label fw-semibold small">Status</label>
                <select className="form-select" value={editStatus}
                  onChange={e => this.setState({ editStatus: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {this.renderPasswordField({
                value: editPassword,
                onChange: e => this.setState({ editPassword: e.target.value }),
                showPass: showEditPass,
                onToggle: () => this.setState({ showEditPass: !showEditPass }),
                error: editErrors.password,
                label: "New Password",
                placeholder: "Leave blank to keep current",
              })}
            </>
          ),
        })}
      </div>
    );
  }
}

export default Management;