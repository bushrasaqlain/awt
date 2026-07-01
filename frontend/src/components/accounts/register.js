import React, { Component } from "react";

const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
  "Unknown",
];
const RELATIONS = [
  "Father",
  "Mother",
  "Brother",
  "Sister",
  "Husband",
  "Wife",
  "Son",
  "Daughter",
  "Uncle",
  "Aunt",
  "Cousin",
  "Friend",
  "Other",
];

const STEP_LABELS = ["Personal", "Contact", "Preferences"];

const INITIAL_FORM = {
  email: "",
  fullName: "",
  dob: "",
  age: "",
  gender: "",
  cnic: "",
  bloodGroup: "",
  weight: "",
  photo: null,
  whatsapp: "",
  address: "",
  city: "",
  donationLocation: "",
  emergencyName: "",
  emergencyRelation: "",
  emergencyPhone: "",
};

// ── Date helpers ───────────────────────────────────────────────
function getToday() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getMaxDob() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().split("T")[0];
}

function getMinDob() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 65);
  return d.toISOString().split("T")[0];
}

function calcAge(dobStr) {
  const dob = new Date(dobStr);
  const today = new Date();
  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();
  let days = today.getDate() - dob.getDate();

  if (days < 0) {
    months--;
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months };
}

function generateDonorId() {
  const prefix = "AWT";
  const random = Math.floor(Math.random() * 900000 + 100000);
  return `${prefix}-${random}`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${d.getDate()}-${months[d.getMonth()]}-${d.getFullYear()}`;
}

function getValidityDate() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return formatDate(d.toISOString().split("T")[0]);
}

function getIssueDate() {
  return formatDate(new Date().toISOString().split("T")[0]);
}

// ── Face image validator ───────────────────────────────────────
function validateFaceImage(file) {
  return new Promise((resolve) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];

    if (!allowed.includes(file.type)) {
      resolve("Only JPG, PNG or WebP images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      resolve("Image must be smaller than 5 MB.");
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.width < 100 || img.height < 100) {
        resolve(
          "Image is too small. Please upload a clear face photo (min 100×100 px).",
        );
        return;
      }
      const ratio = img.width / img.height;
      if (ratio > 2) {
        resolve(
          "Please upload a portrait or square face photo, not a wide/landscape image.",
        );
        return;
      }
      resolve(null);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve("Could not read the image. Please try a different file.");
    };
    img.src = url;
  });
}

/* ── Donor Card Component ── */

class DonorCard extends Component {
  constructor(props) {
    super(props);
    this.cardRef = React.createRef();
  }

  render() {
    const {
      fullName,
      donorId,
      age,
      bloodGroup,
      whatsapp,
      validity,
      issueDate,
      photoPreview,
    } = this.props;

    return (
      <div
        ref={this.cardRef}
        className="donor-card"
        style={{
          width: "100%",
          maxWidth: "700px",
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: "12px",
          boxShadow: "0 6px 24px rgba(0,0,0,0.15)",
          overflow: "hidden",
          fontFamily: "'Segoe UI', Arial, sans-serif",
          position: "relative",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 28px 10px 28px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                border: "3px solid #b8860b",
                background: "linear-gradient(135deg, #7f1d1d 0%, #5c1414 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                color: "#fff",
                fontSize: 10,
                fontWeight: "bold",
                textAlign: "center",
                lineHeight: 1.1,
                padding: 4,
              }}
            >
              ❤<br />
              AWT
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#1a1a1a",
                }}
              >
                AWT Blood Bank
              </h2>
              <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>
                A Project of AWT Blood Bank
              </p>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <h1 style={{ margin: 0, fontSize: "26px", fontWeight: 900 }}>
              <span style={{ color: "#1a1a1a" }}>LIFE SAVER</span>{" "}
              <span style={{ color: "#dc3545" }}>CARD</span>
            </h1>
            <p
              style={{
                margin: "2px 0 0 0",
                fontSize: "12px",
                color: "#dc3545",
                fontWeight: 600,
              }}
            >
              Every donation can save up to three lives
            </p>
          </div>
        </div>

        <div
          style={{
            height: 2,
            background: "linear-gradient(to right, #dc3545, transparent)",
            margin: "0 28px",
          }}
        />

        {/* Body */}
        <div
          style={{
            display: "flex",
            padding: "24px 28px 10px 28px",
            alignItems: "center",
            gap: 20,
          }}
        >
          {/* Left: details */}
          <div style={{ flex: 1 }}>
            {[
              ["DONOR Name", fullName],
              ["DONOR ID", donorId],
              ["Age", age],
              ["Blood Group", bloodGroup],
              ["Phone Number", whatsapp],
              ["Validity", validity],
              ["Issue Date", issueDate],
            ].map(([label, value], i) => (
              <div
                key={i}
                style={{ display: "flex", marginBottom: 10, fontSize: 15 }}
              >
                <span style={{ width: 150, color: "#1a1a1a", fontWeight: 600 }}>
                  {label} :
                </span>
                <span
                  style={{
                    color:
                      label === "Blood Group" ||
                      label === "Validity" ||
                      label === "Phone Number" ||
                      label === "DONOR ID"
                        ? "#dc3545"
                        : "#444",
                    fontWeight: 600,
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Right: photo */}
          <div
            style={{
              position: "relative",
              width: 180,
              height: 200,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: 170,
                height: 190,
                borderRadius: "50%",
                overflow: "hidden",
                border: "4px solid #dc3545",
                boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
                background: "#eee",
              }}
            >
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Donor"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#999",
                    fontSize: 12,
                  }}
                >
                  No Photo
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Benefits - chevron badges */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            padding: "10px 28px 24px 28px",
            gap: 0,
          }}
        >
          <div style={{ width: 150, paddingTop: 8 }}>
            <p
              style={{
                margin: 0,
                color: "#dc3545",
                fontWeight: 800,
                fontSize: 16,
              }}
            >
              MEMBER <span style={{ color: "#1a1a1a" }}>BENEFITS</span>
            </p>
            <p
              style={{
                margin: "6px 0 0 0",
                fontSize: 12,
                color: "#444",
                fontWeight: 600,
              }}
            >
              Terms and
              <br />
              Conditions apply
            </p>
          </div>

          {[
            {
              label: "Lab Services",
              phone: "0337-7774511",
              color: "#0d6efd",
              note: "40% Saving on Lab Tests with home sampling option",
            },
            {
              label: "Blood Bank",
              phone: "0323-8443294",
              color: "#fd7e14",
              note: "Priority assistance in arranging Blood when required",
            },
            {
              label: "Pharmacy",
              phone: "0333-4388437",
              color: "#28a745",
              note: "10% Discount on medicines and healthcare products",
            },
          ].map((b, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                position: "relative",
                marginLeft: i === 0 ? 0 : -12,
              }}
            >
              <div
                style={{
                  background: b.color,
                  color: "#fff",
                  padding: "8px 16px 8px 22px",
                  fontSize: 13,
                  fontWeight: 700,
                  clipPath:
                    "polygon(0 0, 90% 0, 100% 50%, 90% 100%, 0 100%, 10% 50%)",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                📞 {b.label}
                <br />
                {b.phone}
              </div>
              <div
                style={{
                  background: `${b.color}1a`,
                  borderTop: `2px solid ${b.color}`,
                  fontSize: 11,
                  color: "#444",
                  padding: "8px 14px",
                  textAlign: "center",
                  marginTop: 4,
                  fontWeight: 600,
                }}
              >
                {b.note}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

/* ── Reusable Components ── */
class SectionTitle extends Component {
  render() {
    const { icon, title } = this.props;
    return (
      <div className="d-flex align-items-center gap-2 mb-4 pb-2 border-bottom border-danger-subtle">
        <span style={{ fontSize: "20px" }}>{icon}</span>
        <h5 className="mb-0 fw-bold text-danger">{title}</h5>
      </div>
    );
  }
}

class Field extends Component {
  render() {
    const { label, error, children, className = "" } = this.props;
    return (
      <div className={`mb-3 ${className}`}>
        {label && (
          <label className="form-label fw-semibold small">{label}</label>
        )}
        {children}
        {error && <div className="text-danger small mt-1">{error}</div>}
      </div>
    );
  }
}

/* ── Step 1: Personal Information ── */
class StepPersonal extends Component {
  render() {
    const { form, errors, photoPreview, onChange, onCNIC, onPhoto, onDOB } =
      this.props;

    return (
      <div>
        <SectionTitle icon="👤" title="Personal Information" />

        <div className="d-flex align-items-start gap-3 mb-4">
          <label style={{ cursor: "pointer", flexShrink: 0 }}>
            <div
              className={`rounded-circle border border-2 d-flex align-items-center justify-content-center overflow-hidden bg-danger-subtle ${
                errors.photo ? "border-danger" : "border-danger"
              }`}
              style={{ width: 90, height: 90 }}
            >
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-100 h-100 object-fit-cover"
                />
              ) : (
                <div className="text-center text-danger small px-1">
                  <div style={{ fontSize: 10, lineHeight: 1.2 }}>
                    Face
                    <br />
                    Photo
                  </div>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="user"
              onChange={onPhoto}
              className="d-none"
            />
          </label>
          <div className="pt-1">
            <p className="fw-semibold small mb-1">
              Face Photo <span className="text-danger">*</span>
            </p>
            <p className="text-muted small mb-1" style={{ fontSize: 12 }}>
              • Upload a clear photo of <strong>your face only</strong>
              <br />
              • Portrait or square orientation
              <br />
              • JPG, PNG or WebP — max 5 MB
              <br />• Minimum size: 100 × 100 px
            </p>
            {errors.photo && (
              <div className="text-danger small">{errors.photo}</div>
            )}
          </div>
        </div>

        <div className="row g-3">
          <div className="col-md-6">
            <Field label="Full Name *" error={errors.fullName}>
              <input
                className={`form-control ${errors.fullName ? "is-invalid" : ""}`}
                name="fullName"
                value={form.fullName}
                onChange={onChange}
                placeholder="As per CNIC"
              />
            </Field>
          </div>
          <div className="col-6">
            <Field label="CNIC Number *" error={errors.cnic}>
              <input
                className={`form-control ${errors.cnic ? "is-invalid" : ""}`}
                name="cnic"
                value={form.cnic}
                onChange={onCNIC}
                placeholder="XXXXX-XXXXXXX-X"
                maxLength={15}
              />
            </Field>
          </div>

          <div className="col-md-6">
            <Field label="Date of Birth *" error={errors.dob}>
              <input
                type="date"
                className={`form-control ${errors.dob ? "is-invalid" : ""}`}
                name="dob"
                value={form.dob}
                onChange={onDOB}
                min={getMinDob()}
                max={getMaxDob()}
              />
              <div className="text-muted small mt-1">
                Donor must be at least 15 years old. Cannot be today or a future
                date.
              </div>
            </Field>
          </div>
          <div className="col-md-6">
           <Field label="Age (auto-calculated)">
  <input
    type="text"
    className="form-control bg-light"
    value={form.age || ""}
    readOnly
    placeholder="Auto-filled from DOB"
  />
</Field>
          </div>

          <div className="col-md-6">
            <Field label="Gender *" error={errors.gender}>
              <select
                className={`form-select ${errors.gender ? "is-invalid" : ""}`}
                name="gender"
                value={form.gender}
                onChange={onChange}
              >
                <option value="">-- Select --</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </Field>
          </div>
          <div className="col-md-6">
            <Field label="Blood Group *" error={errors.bloodGroup}>
              <select
                className={`form-select ${errors.bloodGroup ? "is-invalid" : ""}`}
                name="bloodGroup"
                value={form.bloodGroup}
                onChange={onChange}
              >
                <option value="">-- Select Blood Group --</option>
                {BLOOD_GROUPS.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="col-12">
            <Field label="Weight (kg) *" error={errors.weight}>
              <input
                type="number"
                className={`form-control ${errors.weight ? "is-invalid" : ""}`}
                name="weight"
                value={form.weight}
                onChange={onChange}
                placeholder="Enter your weight in kg (e.g., 48)"
                min="0"
                max="300"
                step="0.1"
              />
              <div className="form-text text-muted">
                Minimum weight requirement: <strong>45–160 kg</strong> for blood
                donation. You must weigh between 45-160 kg to be eligible.
              </div>
              {form.weight && !errors.weight && (
                <div
                  className={`mt-1 small ${parseFloat(form.weight) >= 45 && parseFloat(form.weight) <= 160 ? "text-success" : "text-danger"}`}
                >
                  {parseFloat(form.weight) >= 45 &&
                  parseFloat(form.weight) <= 160
                    ? "✓ Eligible - Your weight meets the donation requirement"
                    : "✗ Not eligible - Weight must be between 45-160 kg"}
                </div>
              )}
            </Field>
          </div>

          
        </div>
      </div>
    );
  }
}

/* ── Step 2: Contact Information ── */
class StepContact extends Component {
  render() {
    const { form, errors, onChange, onWhatsApp, cities } = this.props;
    return (
      <div>
        <SectionTitle icon="📞" title="Contact Information" />
        <div className="row g-3">
          <div className="col-md-6">
            <Field label="WhatsApp Number *" error={errors.whatsapp}>
              <input
                className={`form-control ${errors.whatsapp ? "is-invalid" : ""}`}
                name="whatsapp"
                value={form.whatsapp}
                onChange={onWhatsApp}
                placeholder="0313-5495655"
                maxLength={12}
              />
            </Field>
          </div>
          <div className="col-md-6">
            <Field label="Email Address *" error={errors.email}>
              <input
                type="email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="yourname@email.com"
              />
            </Field>
          </div>

          <div className="col-12">
            <Field label="Complete Address *" error={errors.address}>
              <textarea
                className={`form-control ${errors.address ? "is-invalid" : ""}`}
                name="address"
                value={form.address}
                onChange={onChange}
                rows={3}
                placeholder="House no., Street, Area, District"
              />
            </Field>
          </div>
          <div className="col-12">
            <Field label="City *" error={errors.city}>
              <select
                className={`form-select ${errors.city ? "is-invalid" : ""}`}
                name="city"
                value={form.city}
                onChange={onChange}
              >
                <option value="">-- Select City --</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>
      </div>
    );
  }
}

/* ── Step 3: Donation Preferences ── */
class StepPreferences extends Component {
  render() {
     const { form, errors, onChange, onEmergencyPhone } = this.props;
    return (
      <div>
        <SectionTitle icon="🩸" title="Donation Preferences" />

        <Field label="Willing to donate at *" error={errors.donationLocation}>
          <div className="d-flex gap-4 flex-wrap mt-1">
            {["Blood Camp", "Blood Bank", "Both"].map((opt) => (
              <div className="form-check" key={opt}>
                <input
                  className="form-check-input"
                  type="radio"
                  name="donationLocation"
                  value={opt}
                  id={`loc_${opt}`}
                  checked={form.donationLocation === opt}
                  onChange={onChange}
                />
                <label className="form-check-label" htmlFor={`loc_${opt}`}>
                  {opt}
                </label>
              </div>
            ))}
          </div>
        </Field>

        <div className="row g-3">
          <div className="col-12">
            <Field label="Full Name *" error={errors.emergencyName}>
              <input
                className={`form-control ${errors.emergencyName ? "is-invalid" : ""}`}
                name="emergencyName"
                value={form.emergencyName}
                onChange={onChange}
                placeholder="Emergency contact's name"
              />
            </Field>
          </div>
          <div className="col-md-6">
            <Field label="Relationship *" error={errors.emergencyRelation}>
              <select
                className={`form-select ${errors.emergencyRelation ? "is-invalid" : ""}`}
                name="emergencyRelation"
                value={form.emergencyRelation}
                onChange={onChange}
              >
                <option value="">-- Select Relationship --</option>
                {RELATIONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="col-md-6">
            <Field label="Phone Number *" error={errors.emergencyPhone}>
              <input
                className={`form-control ${errors.emergencyPhone ? "is-invalid" : ""}`}
                name="emergencyPhone"
                value={form.emergencyPhone}
                onChange={onEmergencyPhone}
                placeholder="0300-1234567"
                maxLength={12}
              />
            </Field>
          </div>
        </div>
      </div>
    );
  }
}




/* ── Main Component ── */
class RegisterDonor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      form: { ...INITIAL_FORM },
      photoPreview: null,
      submitted: false,
      errors: {},
      step: 1,
      donorId: "",
      showCard: false,
      cities: [],
    };
    this.totalSteps = 3;

    this.handleChange = this.handleChange.bind(this);
    this.handlePhoto = this.handlePhoto.bind(this);
    this.handleCNIC = this.handleCNIC.bind(this);
    this.handleWhatsApp = this.handleWhatsApp.bind(this);
    this.handleEmergencyPhone = this.handleEmergencyPhone.bind(this);
    this.handleDOB = this.handleDOB.bind(this);
    this.nextStep = this.nextStep.bind(this);
    this.prevStep = this.prevStep.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.resetForm = this.resetForm.bind(this);
  }

  handleChange(e) {
    const { name, value, type, checked } = e.target;
    this.setState((prev) => {
      let updatedForm;

      updatedForm = { ...prev.form, [name]: value };

      return { form: updatedForm, errors: { ...prev.errors, [name]: "" } };
    });
  }
  componentDidMount() {
    fetch("http://localhost/awt/backend/public/api/cities")
      .then((res) => res.json())
      .then((data) => {
        if (data.status) {
          this.setState({ cities: data.data });
        }
      })
      .catch((err) => console.error("Failed to load cities:", err));
  }

  async handlePhoto(e) {
    const file = e.target.files[0];
    if (!file) return;

    const error = await validateFaceImage(file);

    if (error) {
      e.target.value = "";
      this.setState((prev) => ({
        form: { ...prev.form, photo: null },
        photoPreview: null,
        errors: { ...prev.errors, photo: error },
      }));
      return;
    }

    this.setState((prev) => ({
      form: { ...prev.form, photo: file },
      photoPreview: URL.createObjectURL(file),
      errors: { ...prev.errors, photo: "" },
    }));
  }

  handleDOB(e) {
    const dob = e.target.value;

    if (!dob) {
      this.setState((prev) => ({
        form: { ...prev.form, dob: "", age: "" },
        errors: { ...prev.errors, dob: "" },
      }));
      return;
    }

    const today = getToday();
    const maxDob = getMaxDob();
    const minDob = getMinDob();

    if (dob >= today) {
      this.setState((prev) => ({
        form: { ...prev.form, dob, age: "" },
        errors: {
          ...prev.errors,
          dob: "Date of birth cannot be today or a future date.",
        },
      }));
      return;
    }

    if (dob > maxDob) {
      this.setState((prev) => ({
        form: { ...prev.form, dob, age: "" },
        errors: { ...prev.errors, dob: "Donor must be at least 18 years old." },
      }));
      return;
    }

    if (dob < minDob) {
      this.setState((prev) => ({
        form: { ...prev.form, dob, age: "" },
        errors: { ...prev.errors, dob: "Age cannot exceed 65 years." },
      }));
      return;
    }

    const { years, months } = calcAge(dob);
    const ageDisplay = `${years} year${years !== 1 ? "s" : ""} ${months} month${months !== 1 ? "s" : ""}`;

    this.setState((prev) => ({
      form: { ...prev.form, dob, age: ageDisplay, ageYears: years },
      errors: { ...prev.errors, dob: "" },
    }));
  }

  formatCNIC(val) {
    const digits = val.replace(/\D/g, "").slice(0, 13);
    if (digits.length <= 5) return digits;
    if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
  }

  handleCNIC(e) {
    const formatted = this.formatCNIC(e.target.value);
    this.setState((prev) => ({
      form: { ...prev.form, cnic: formatted },
      errors: { ...prev.errors, cnic: "" },
    }));
  }

  sendCardImage = async () => {
    const cardElement = document.querySelector(".donor-card");
    if (!cardElement) return;

    const html2canvasModule = await import("html2canvas");
    const canvas = await html2canvasModule.default(cardElement, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
    });

    canvas.toBlob(async (blob) => {
      const file = new File([blob], `donor-card-${this.state.donorId}.png`, {
        type: "image/png",
      });

      const shareData = {
        files: [file],
        title: "AWT Blood Bank - Donor Card",
        text: `🩸 AWT Blood Bank\nDonor ID: ${this.state.donorId}\nName: ${this.state.form.fullName}\nBlood Group: ${this.state.form.bloodGroup}`,
      };

      // Try native share (works on mobile, attaches actual image)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share(shareData);
          return;
        } catch (err) {
          if (err.name === "AbortError") return; // user cancelled
          console.error("Share failed, falling back:", err);
        }
      }

      // Fallback for desktop: download image, then open WhatsApp Web with text
      const link = document.createElement("a");
      link.download = `donor-card-${this.state.donorId}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      alert("Image downloaded. Please attach it manually in WhatsApp.");

      const message =
        `🩸 *AWT Blood Bank - Blood Bank* 🩸\n\n` +
        `*Donor ID:* ${this.state.donorId}\n` +
        `*Name:* ${this.state.form.fullName}\n` +
        `*Blood Group:* ${this.state.form.bloodGroup}\n` +
        `Thank you for being a blood donor! ❤️`;

      const phone = this.state.form.whatsapp.replace(/\D/g, "");
      window.open(
        `https://wa.me/92${phone}?text=${encodeURIComponent(message)}`,
        "_blank",
      );
    }, "image/png");
  };
  formatWhatsApp(val) {
    const digits = val.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 4) return digits;
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }

  handleWhatsApp(e) {
    const formatted = this.formatWhatsApp(e.target.value);
    this.setState((prev) => ({
      form: { ...prev.form, whatsapp: formatted },
      errors: { ...prev.errors, whatsapp: "" },
    }));
  }
  formatEmergencyPhone(val) {
    const digits = val.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 4) return digits;
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }

  handleEmergencyPhone(e) {
    const formatted = this.formatEmergencyPhone(e.target.value);
    this.setState((prev) => ({
      form: { ...prev.form, emergencyPhone: formatted },
      errors: { ...prev.errors, emergencyPhone: "" },
    }));
  }
  validate(s) {
    const { form } = this.state;
    const errs = {};
    const today = getToday();
    const maxDob = getMaxDob();
    const minDob = getMinDob();

    if (s === 1) {
      if (!form.photo) errs.photo = "Face photo is required.";

      if (!form.fullName.trim()) errs.fullName = "Full name is required.";
      else if (/\d/.test(form.fullName))
        errs.fullName = "Name must not contain numbers.";

      if (!form.dob) {
        errs.dob = "Date of birth is required.";
      } else if (form.dob >= today) {
        errs.dob = "Date of birth cannot be today or a future date.";
      } else if (form.dob > maxDob) {
        errs.dob = "Donor must be at least 15 years old.";
      } else if (form.dob < minDob) {
        errs.dob = "Age cannot exceed 65 years.";
      }

      if (!form.gender) errs.gender = "Select gender.";
      if (!form.bloodGroup) errs.bloodGroup = "Select blood group.";

      if (!form.weight) {
        errs.weight = "Please enter your weight.";
      } else {
        const weightNum = parseFloat(form.weight);
        if (isNaN(weightNum) || weightNum <= 0) {
          errs.weight = "Please enter a valid weight in kg.";
        } else if (weightNum < 45 || weightNum > 160) {
          errs.weight =
            "You must weigh between 45-160 kg (110-352 lbs) to donate blood.";
        }
      }

      const cnicDigits = form.cnic.replace(/\D/g, "");
      if (!cnicDigits) errs.cnic = "CNIC is required.";
      else if (cnicDigits.length !== 13)
        errs.cnic = "CNIC must be 13 digits (e.g. 37106-8234782-3).";
    }

    if (s === 2) {
      const waDigits = form.whatsapp.replace(/\D/g, "");
      if (!form.whatsapp.trim()) errs.whatsapp = "WhatsApp number is required.";
      else if (waDigits.length !== 11)
        errs.whatsapp = "Enter a valid number (e.g. 0313-5495655).";

      if (!form.email.trim()) errs.email = "Email is required.";
      else if (!/\S+@\S+\.\S+/.test(form.email))
        errs.email = "Enter a valid email address.";

      if (!form.address.trim()) errs.address = "Address is required.";
      if (!form.city) errs.city = "Select a city.";
    }

if (s === 3) {
  if (!form.donationLocation)
    errs.donationLocation = "Select donation preference.";

  if (!form.emergencyName.trim()) errs.emergencyName = "Name is required.";
  else if (/\d/.test(form.emergencyName))
    errs.emergencyName = "Name must not contain numbers.";

  if (!form.emergencyRelation.trim())
    errs.emergencyRelation = "Relationship is required.";

  const emergDigits = form.emergencyPhone.replace(/\D/g, "");
  if (!form.emergencyPhone.trim())
    errs.emergencyPhone = "Phone number is required.";
  else if (emergDigits.length !== 11)
    errs.emergencyPhone = "Enter a valid number (e.g. 0300-1234567).";
}
    return errs;
  }

  nextStep() {
    const errs = this.validate(this.state.step);
    if (Object.keys(errs).length > 0) {
      this.setState({ errors: errs });
      return;
    }
    this.setState((prev) => ({ errors: {}, step: prev.step + 1 }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  prevStep() {
    this.setState((prev) => ({ errors: {}, step: prev.step - 1 }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async handleSubmit(e) {
    e.preventDefault();
    const errs = this.validate(5);
    if (Object.keys(errs).length > 0) {
      this.setState({ errors: errs });
      return;
    }

    const { form } = this.state;
    const formData = new FormData();
    const timeSlot = `${form.preferredTimeFrom} – ${form.preferredTimeTo}`;

    Object.entries(form).forEach(([k, v]) => {
      if (k === "photo" && v) formData.append(k, v);
      else if (k !== "photo") formData.append(k, v);
    });

    formData.append("timeSlot", timeSlot);

    try {
      const res = await fetch(
        "http://localhost/awt/backend/public/api/donors/register",
        {
          method: "POST",
          body: formData,
        },
      );

      if (res.ok) {
        const donorId = generateDonorId();
        this.setState({
          submitted: true,
          showCard: true,
          donorId: donorId,
        });
      } else {
        const errorData = await res.json();
        alert(
          "Submission failed: " + (errorData.message || "Please try again."),
        );
        console.error("Registration errors:", errorData.errors);
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Unable to connect to the server. Please try again.");
    }
  }

  resetForm() {
    this.setState({
      form: { ...INITIAL_FORM },
      photoPreview: null,
      submitted: false,
      errors: {},
      step: 1,
      donorId: "",
      showCard: false,
    });
  }

  renderProgress() {
    const { step } = this.state;
    return (
      <div className="mb-4">
        <div className="d-flex align-items-center mb-2">
          {STEP_LABELS.map((label, i) => (
            <div key={i} className="d-flex align-items-center flex-grow-1">
              <div
                className={`rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0 ${
                  i + 1 <= step
                    ? "bg-white text-black"
                    : "bg-danger-subtle text-danger"
                }`}
                style={{ width: 32, height: 32, fontSize: 13 }}
              >
                {i + 1 < step ? "✓" : i + 1}
              </div>
              {i < this.totalSteps - 1 && (
                <div
                  className="flex-grow-1 mx-1"
                  style={{
                    height: 3,
                    borderRadius: 2,
                    background: i + 1 < step ? "#dc3545" : "#f8d7da",
                  }}
                />
              )}
            </div>
          ))}
        </div>
        <div className="d-flex">
          {STEP_LABELS.map((label, i) => (
            <div
              key={i}
              className="flex-grow-1 text-center"
              style={{ fontSize: 11 }}
            >
              <span
                className={
                  i + 1 === step ? "text-white fw-semibold" : "text-white"
                }
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  renderStep() {
    const { form, errors, photoPreview, step, cities } = this.state;
    const common = { form, errors, onChange: this.handleChange };
    switch (step) {
      case 1:
        return (
          <StepPersonal
            {...common}
            photoPreview={photoPreview}
            onCNIC={this.handleCNIC}
            onPhoto={this.handlePhoto}
            onDOB={this.handleDOB}
          />
        );
      case 2:
        return (
          <StepContact
            {...common}
            onWhatsApp={this.handleWhatsApp}
            cities={cities}
          />
        );
      case 3:
        return <StepPreferences {...common} />;
      

      default:
        return null;
    }
  }

 render() {
  const { submitted, step, form, donorId, showCard } = this.state;

  if (submitted) {
    return (
      <div className="min-vh-100 pt-5 mt-3 bg-light d-flex align-items-center justify-content-center py-5">
        <div
          className="card shadow-sm border-0 text-center p-5"
          style={{ maxWidth: 480, width: "100%" }}
        >
          <div style={{ fontSize: 56 }}>✅</div>
          <h3 className="fw-bold text-success mt-3">Registration Successful!</h3>
          <p className="text-muted mt-2">
            Thank you, <strong>{form.fullName}</strong>, for registering as a
            blood donor with AWT Blood Bank. Our team will review your
            information shortly.
          </p>
          <button
            className="btn btn-outline-secondary mt-3"
            onClick={this.resetForm}
          >
            Register Another Donor
          </button>
        </div>
      </div>
    );
  }

    return (
      <div className="min-vh-100 pt-5 mt-4 bg-light">
        <div
          className="text-white py-4"
          style={{
            background: "linear-gradient(135deg, #7f1d1d 0%, #dc3545 100%)",
          }}
        >
          <div className="container" style={{ maxWidth: 680 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h4 className="fw-bold mb-1">Donor Registration</h4>
                <p className="mb-0 opacity-75 small">AWT Blood Bank</p>
              </div>
            </div>
            {this.renderProgress()}
          </div>
        </div>

        <div className="container py-4" style={{ maxWidth: 680 }}>
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <form onSubmit={this.handleSubmit}>
                {this.renderStep()}
                <div className="d-flex justify-content-between mt-4 pt-3 border-top">
                  {step > 1 ? (
                    <button
                      type="button"
                      className="btn btn-outline-danger px-4"
                      onClick={this.prevStep}
                    >
                      ← Back
                    </button>
                  ) : (
                    <div />
                  )}
                  {step < this.totalSteps ? (
                    <button
                      type="button"
                      className="btn btn-danger px-4"
                      onClick={this.nextStep}
                    >
                      Continue →
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="btn px-4 text-white fw-semibold"
                      style={{ background: "#7f1d1d" }}
                    >
                      Submit Registration
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default RegisterDonor;