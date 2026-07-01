import React, { Component } from "react";

const API_BASE = "http://localhost:8080/awt/backend/public/api";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];
const GENDERS = ["Male", "Female", "Other"];
const LOCATIONS = ["Blood Camp", "Blood Bank", "Both"];

const EMPTY_FORM = {
  id: null,
  fullName: "",
  fatherHusbandName: "",
  dob: "",
  age: "",
  gender: "",
  bloodGroup: "",
  weight: "",
  cnic: "",
  whatsapp: "",
  email: "",
  address: "",
  city: "",
  donationLocation: "",
  availableDays: "",
  timeSlot: "",
  emergencyName: "",
  emergencyRelation: "",
  emergencyPhone: "",
  password: "",
  confirm_password: "",
};

class DonorList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      donors: [],
      loading: true,
      error: null,

      showFormModal: false,
      formMode: "add",
      form: { ...EMPTY_FORM },
      formErrors: {},
      saving: false,

      showHistoryModal: false,
      historyDonor: null,
      historyLoading: false,
      historyEntries: [],

      search: "",
  statusFilter: "all",
  activeFilter: "all", 
    };
  }

  componentDidMount() {
    this.fetchDonors();
  }

  fetchDonors = () => {
    this.setState({ loading: true, error: null });
    fetch(`${API_BASE}/donors`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch donors (HTTP ${res.status}).`);
        return res.json();
      })
      .then((data) => {
        this.setState({ donors: data.data || data.donors || [], loading: false });
      })
      .catch((err) => {
        this.setState({ error: err.message, loading: false });
      });
  };

  fetchHistory = (donorId) => {
    this.setState({ historyLoading: true });
    fetch(`${API_BASE}/donors/${donorId}/history`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch history.");
        return res.json();
      })
      .then((data) => {
        this.setState({ historyEntries: data.data || data.history || [], historyLoading: false });
      })
      .catch(() => {
        this.setState({ historyEntries: [], historyLoading: false });
      });
  };

  openAddModal = () => {
    this.setState({ showFormModal: true, formMode: "add", form: { ...EMPTY_FORM }, formErrors: {} });
  };

  openEditModal = (donor) => {
    this.setState({
      showFormModal: true,
      formMode: "edit",
      formErrors: {},
      form: {
        id: donor.id,
        fullName: donor.full_name || "",
        fatherHusbandName: donor.father_husband_name || "",
        dob: donor.dob || "",
        age: donor.age || "",
        gender: donor.gender || "",
        bloodGroup: donor.blood_group || "",
        weight: donor.weight || "",
        cnic: donor.cnic || "",
        whatsapp: donor.whatsapp || "",
        email: donor.email || "",
        address: donor.address || "",
        city: donor.city || "",
        donationLocation: donor.donation_location || "",
        availableDays: donor.available_days || "",
        timeSlot: donor.time_slot || "",
        emergencyName: donor.emergency_name || "",
        emergencyRelation: donor.emergency_relation || "",
        emergencyPhone: donor.emergency_phone || "",
        password: "",
        confirm_password: "",
      },
    });
  };

  closeFormModal = () => {
    this.setState({ showFormModal: false, form: { ...EMPTY_FORM }, formErrors: {} });
  };

  openHistoryModal = (donor) => {
    this.setState({ showHistoryModal: true, historyDonor: donor, historyEntries: [] });
    this.fetchHistory(donor.id);
  };

  closeHistoryModal = () => {
    this.setState({ showHistoryModal: false, historyDonor: null, historyEntries: [] });
  };

  handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState((prev) => ({ form: { ...prev.form, [name]: value } }));
  };

  validateForm = () => {
    const { form, formMode } = this.state;
    const errors = {};

    if (!form.fullName) errors.fullName = "Full name is required.";
    if (!form.fatherHusbandName) errors.fatherHusbandName = "Father/husband name is required.";
    if (!form.dob && !form.age) errors.dob = "Date of birth or age is required.";
    if (!form.gender) errors.gender = "Gender is required.";
    if (!form.bloodGroup) errors.bloodGroup = "Blood group is required.";
    if (!form.weight) {
      errors.weight = "Weight is required.";
    } else if (form.weight < 45 || form.weight > 160) {
      errors.weight = "Weight must be between 45-160 kg.";
    }
    if (!form.cnic || form.cnic.replace(/\D/g, "").length !== 13) {
      errors.cnic = "CNIC must be 13 digits.";
    }
    if (!form.whatsapp) errors.whatsapp = "WhatsApp number is required.";
    if (!form.address) errors.address = "Address is required.";
    if (!form.city) errors.city = "City is required.";
    if (!form.donationLocation) errors.donationLocation = "Donation location is required.";

    if (formMode === "add") {
      if (!form.email) errors.email = "Email is required.";
      if (!form.password) errors.password = "Password is required.";
      if (form.password && form.password.length < 6) errors.password = "Password must be at least 6 characters.";
      if (form.password !== form.confirm_password) errors.confirm_password = "Passwords do not match.";
    }

    this.setState({ formErrors: errors });
    return Object.keys(errors).length === 0;
  };

  buildFormData = () => {
    const { form } = this.state;
    const fd = new FormData();
    Object.keys(form).forEach((key) => {
      if (key === "id") return;
      if (form[key] !== null && form[key] !== undefined) fd.append(key, form[key]);
    });
    return fd;
  };

  handleSubmit = (e) => {
    e.preventDefault();
    if (!this.validateForm()) return;

    this.setState({ saving: true });
    const { formMode, form } = this.state;
    // POST is used for both create and edit because PHP doesn't reliably
    // parse multipart/form-data on PUT requests (needed for photo upload).
    const url = formMode === "add" ? `${API_BASE}/donors/register` : `${API_BASE}/donors/${form.id}`;

    fetch(url, { method: "POST", body: this.buildFormData() })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        this.setState({ saving: false });
        if (!ok || data.status === false) {
          this.setState({ formErrors: data.errors || { general: data.message || "Request failed." } });
          return;
        }
        this.closeFormModal();
        this.fetchDonors();
      })
      .catch(() => {
        this.setState({ saving: false, formErrors: { general: "Something went wrong. Check your connection." } });
      });
  };

 toggleStatus = (donor) => {
  // Cycle through statuses: pending -> approved -> rejected -> pending
  const statusCycle = {
    pending: "approved",
    approved: "rejected",
    rejected: "pending"
  };
  const nextStatus = statusCycle[donor.status] || "pending";
  
  fetch(`${API_BASE}/donors/${donor.id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: nextStatus }),
  })
    .then((res) => res.json())
    .then(() => this.fetchDonors())
    .catch(() => this.setState({ error: "Failed to update status." }));
};
 filteredDonors = () => {
  const { donors, search, statusFilter, activeFilter } = this.state;
  return donors.filter((d) => {
    const matchesSearch =
      !search ||
      (d.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.cnic || "").includes(search) ||
      (d.whatsapp || "").includes(search);
    
    const matchesStatus = statusFilter === "all" || d.status === statusFilter;
    const matchesActive = activeFilter === "all" || d.status === activeFilter;
    
    return matchesSearch && matchesStatus && matchesActive;
  });
};

  initials = (name) =>
    (name || "?")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join("");

  renderField(label, name, value, error, type = "text", extra = {}) {
    return (
      <div className={extra.col || "col-md-6"}>
        <label className="form-label small fw-semibold">{label}</label>
        <input
          type={type}
          name={name}
          className={`form-control ${error ? "is-invalid" : ""}`}
          value={value}
          onChange={this.handleInputChange}
          {...extra.props}
        />
        {error && <div className="invalid-feedback">{error}</div>}
      </div>
    );
  }



  renderHistoryModal() {
    const { showHistoryModal, historyDonor, historyLoading, historyEntries } = this.state;
    if (!showHistoryModal) return null;

    return (
      <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header bg-dark text-white">
              <h5 className="modal-title mb-0">History — {historyDonor?.full_name}</h5>
              <button type="button" className="btn-close btn-close-white" onClick={this.closeHistoryModal} />
            </div>
            <div className="modal-body">
              {historyLoading && <p className="text-muted mb-0">Loading history...</p>}
              {!historyLoading && historyEntries.length === 0 && <p className="text-muted mb-0">No history records found.</p>}
              {!historyLoading && historyEntries.length > 0 && (
                <ul className="list-group list-group-flush">
                  {historyEntries.map((entry, idx) => (
                    <li key={idx} className="list-group-item px-0">
                      <div className="d-flex justify-content-between">
                        <strong>{entry.event || entry.action}</strong>
                        <small className="text-muted">{entry.created_at || entry.date}</small>
                      </div>
                      {entry.description && <div className="text-muted small">{entry.description}</div>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-light" onClick={this.closeHistoryModal}>Close</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

 renderStatusBadge(status) {
  const variant = status === "approved" ? "success" : 
                  status === "pending" ? "warning" : 
                  status === "rejected" ? "danger" : "secondary";
  return <span className={`badge bg-${variant}-subtle text-${variant}-emphasis text-capitalize`}>{status}</span>;
}

 renderActions(donor) {
  return (
    <>
      <button 
        className="btn btn-sm btn-link text-center text-secondary text-decoration-none" 
        title="History" 
        onClick={() => this.openHistoryModal(donor)}
      >
        ⏱
      </button>
      <button 
        className="btn btn-sm btn-link text-center text-secondary text-decoration-none" 
        title="Toggle Status" 
        onClick={() => this.toggleStatus(donor)}
      >
        🔄
      </button>
    </>
  );
}

  render() {
  const { loading, error, search, statusFilter, activeFilter, donors } = this.state;

    const filtered = this.filteredDonors();
    const counts = {
      total: donors.length,
      approved: donors.filter((d) => d.status === "approved").length,
      pending: donors.filter((d) => d.status === "pending").length,
    };

    return (
      <div className="bg-light  min-vh-100 pt-5 mt-4 pb-4 px-3 px-md-4">
         <div>
              <h4 className="fw-bold text-danger mt-3  mb-3">Donor List</h4>
            </div>
             <div className="bg-white rounded-3 border shadow-sm p-3 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search donors..."
              value={search}
              onChange={(e) => this.setState({ search: e.target.value })}
            />
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => this.setState({ statusFilter: e.target.value })}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={activeFilter}
              onChange={(e) => this.setState({ activeFilter: e.target.value })}
            >
              <option value="all">All Donors</option>
              <option value="pending">Pending</option>
              <option value="approved">Active</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="col-md-2 text-end">
            <span className="text-muted small">
              Total: {donors.length} | 
              Active: {donors.filter(d => d.status === 'approved').length} | 
              Pending: {donors.filter(d => d.status === 'pending').length}
            </span>
          </div>
        </div>
      </div>


        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="bg-white rounded-3 border shadow-sm text-center text-muted py-5">Loading donors...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3 border shadow-sm text-center text-muted py-5">No donors found.</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="bg-white rounded-3 border shadow-sm overflow-hidden d-none d-md-block">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Donor</th>
                      <th>Blood Group</th>
                      <th>CNIC</th>
                      <th>WhatsApp</th>
                      <th>City</th>
                      <th>Status</th>
                      <th >Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((donor) => (
                      <tr key={donor.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                              style={{ width: 36, height: 36, fontSize: "0.85rem" }}
                            >
                              {this.initials(donor.full_name)}
                            </div>
                            <span className="fw-semibold">{donor.full_name}</span>
                          </div>
                        </td>
                        <td><span className="badge bg-danger-subtle text-danger-emphasis rounded-pill">{donor.blood_group}</span></td>
                        <td>{donor.cnic}</td>
                        <td>{donor.whatsapp}</td>
                        <td>{donor.city}</td>
                        <td>{this.renderStatusBadge(donor.status)}</td>
                        <td className="text-center">{this.renderActions(donor)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="d-md-none">
              {filtered.map((donor) => (
                <div className="bg-white rounded-3 border shadow-sm p-3 mb-3" key={donor.id}>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                        style={{ width: 36, height: 36, fontSize: "0.85rem" }}
                      >
                        {this.initials(donor.full_name)}
                      </div>
                      <div>
                        <div className="fw-semibold">{donor.full_name}</div>
                        <div className="small text-muted">{donor.city}</div>
                      </div>
                    </div>
                    {this.renderStatusBadge(donor.status)}
                  </div>
                  <div className="d-flex flex-wrap gap-3 small text-muted mb-2">
                    <span><span className="badge bg-danger-subtle text-danger-emphasis rounded-pill">{donor.blood_group}</span></span>
                    <span>CNIC: {donor.cnic}</span>
                    <span>WhatsApp: {donor.whatsapp}</span>
                  </div>
                  <div className="d-flex gap-1 border-top pt-2 mt-2">{this.renderActions(donor)}</div>
                </div>
              ))}
            </div>
          </>
        )}

       
        {this.renderHistoryModal()}
      </div>
    );
  }
}

export default DonorList;