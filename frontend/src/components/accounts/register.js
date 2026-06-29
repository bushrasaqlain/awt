import { Component } from "react";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];

const PAKISTAN_CITIES = [
  "Karachi", "Lahore", "Faisalabad", "Rawalpindi", "Islamabad",
  "Gujranwala", "Peshawar", "Multan", "Hyderabad", "Quetta",
  "Bahawalpur", "Sargodha", "Sialkot", "Sukkur", "Larkana",
  "Sheikhupura", "Rahim Yar Khan", "Jhang", "Mardan", "Gujrat",
  "Kasur", "Dera Ghazi Khan", "Mingora", "Nawabshah", "Sahiwal",
  "Mirpur Khas", "Okara", "Mandi Bahauddin", "Jhelum", "Abbottabad",
  "Other"
];

const TIME_SLOTS = [
  "Morning (8am – 12pm)",
  "Afternoon (12pm – 4pm)",
  "Evening (4pm – 8pm)",
  "Flexible / Any time"
];

const STEP_LABELS = ["Personal", "Contact", "Preferences", "Emergency", "Consent"];

const INITIAL_FORM = {
  email: "",
  password: "",
  confirmPassword: "",
  fullName: "",
  fatherHusbandName: "",
  dob: "",
  age: "",
  gender: "",
  cnic: "",
  bloodGroup: "",
  photo: null,
  whatsapp: "",
  address: "",
  city: "",
  donationLocation: "",
  availableDays: [],
  timeSlot: "",
  emergencyName: "",
  emergencyRelation: "",
  emergencyPhone: "",
  declarationTrue: false,
  declarationConsent: false,
  signature: ""
};

/* ── Reusable: Section heading ── */
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

/* ── Reusable: Field wrapper ── */
class Field extends Component {
  render() {
    const { label, error, children, className = "" } = this.props;
    return (
      <div className={`mb-3 ${className}`}>
        {label && <label className="form-label fw-semibold small">{label}</label>}
        {children}
        {error && <div className="text-danger small mt-1">{error}</div>}
      </div>
    );
  }
}

/* ── Step 1: Personal Information ── */
class StepPersonal extends Component {
  render() {
    const { form, errors, photoPreview, onChange, onCNIC, onPhoto } = this.props;
    return (
      <div>
        <SectionTitle icon="👤" title="Personal Information" />

        {/* Photo Upload */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <label className="cursor-pointer" style={{ cursor: "pointer" }}>
            <div
              className="rounded-circle border border-2 border-danger d-flex align-items-center justify-content-center overflow-hidden bg-danger-subtle"
              style={{ width: 90, height: 90 }}
            >
              {photoPreview
                ? <img src={photoPreview} alt="Preview" className="w-100 h-100 object-fit-cover" />
                : <div className="text-center text-danger small">
                    <div style={{ fontSize: 22 }}>📷</div>
                    <div>Upload</div>
                  </div>
              }
            </div>
            <input type="file" accept="image/*" onChange={onPhoto} className="d-none" />
          </label>
          <p className="text-muted small mb-0">Upload a recent passport-size photo<br /><em>(optional)</em></p>
        </div>

        <div className="row g-3">
          <div className="col-md-6">
            <Field label="Full Name *" error={errors.fullName}>
              <input
                className={`form-control ${errors.fullName ? "is-invalid" : ""}`}
                name="fullName" value={form.fullName}
                onChange={onChange} placeholder="As per CNIC"
              />
            </Field>
          </div>
          <div className="col-md-6">
            <Field label="Father's / Husband's Name *" error={errors.fatherHusbandName}>
              <input
                className={`form-control ${errors.fatherHusbandName ? "is-invalid" : ""}`}
                name="fatherHusbandName" value={form.fatherHusbandName}
                onChange={onChange} placeholder="Father's or husband's name"
              />
            </Field>
          </div>

          <div className="col-md-6">
            <Field label="Date of Birth" error={errors.dob}>
              <input
                type="date"
                className={`form-control ${errors.dob ? "is-invalid" : ""}`}
                name="dob" value={form.dob} onChange={onChange}
              />
            </Field>
          </div>
          <div className="col-md-6">
            <Field label="Age (if DOB unknown)">
              <input
                type="number"
                className="form-control"
                name="age" value={form.age}
                onChange={onChange} placeholder="e.g. 28" min="18" max="65"
              />
            </Field>
          </div>

          <div className="col-md-6">
            <Field label="Gender *" error={errors.gender}>
              <select
                className={`form-select ${errors.gender ? "is-invalid" : ""}`}
                name="gender" value={form.gender} onChange={onChange}
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
                name="bloodGroup" value={form.bloodGroup} onChange={onChange}
              >
                <option value="">-- Select Blood Group --</option>
                {BLOOD_GROUPS.map(g => <option key={g}>{g}</option>)}
              </select>
            </Field>
          </div>

          <div className="col-12">
            <Field label="CNIC Number *" error={errors.cnic}>
              <input
                className={`form-control ${errors.cnic ? "is-invalid" : ""}`}
                name="cnic" value={form.cnic}
                onChange={onCNIC} placeholder="XXXXX-XXXXXXX-X" maxLength={15}
              />
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
    const { form, errors, onChange } = this.props;
    return (
      <div>
        <SectionTitle icon="📞" title="Contact Information" />
        <div className="row g-3">
          <div className="col-md-6">
            <Field label="WhatsApp Number *" error={errors.whatsapp}>
              <input
                className={`form-control ${errors.whatsapp ? "is-invalid" : ""}`}
                name="whatsapp" value={form.whatsapp}
                onChange={onChange} placeholder="e.g. 0300-1234567"
              />
            </Field>
          </div>
          <div className="col-md-6">
            <Field label="Email Address *" error={errors.email}>
              <input
                type="email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                name="email" value={form.email}
                onChange={onChange} placeholder="yourname@email.com"
              />
            </Field>
          </div>

          <div className="col-md-6">
            <Field label="Password *" error={errors.password}>
              <input
                type="password"
                className={`form-control ${errors.password ? "is-invalid" : ""}`}
                name="password" value={form.password}
                onChange={onChange} placeholder="Min. 6 characters"
              />
            </Field>
          </div>
          <div className="col-md-6">
            <Field label="Confirm Password *" error={errors.confirmPassword}>
              <input
                type="password"
                className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                name="confirmPassword" value={form.confirmPassword}
                onChange={onChange} placeholder="Repeat password"
              />
            </Field>
          </div>

          <div className="col-12">
            <Field label="Complete Address *" error={errors.address}>
              <textarea
                className={`form-control ${errors.address ? "is-invalid" : ""}`}
                name="address" value={form.address}
                onChange={onChange} rows={3}
                placeholder="House no., Street, Area, District"
              />
            </Field>
          </div>
          <div className="col-12">
            <Field label="City *" error={errors.city}>
              <select
                className={`form-select ${errors.city ? "is-invalid" : ""}`}
                name="city" value={form.city} onChange={onChange}
              >
                <option value="">-- Select City --</option>
                {PAKISTAN_CITIES.map(c => <option key={c}>{c}</option>)}
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
    const { form, errors, onChange } = this.props;
    return (
      <div>
        <SectionTitle icon="🩸" title="Donation Preferences" />

        <Field label="Willing to donate at *" error={errors.donationLocation}>
          <div className="d-flex gap-4 flex-wrap mt-1">
            {["Blood Camp", "Blood Bank", "Both"].map(opt => (
              <div className="form-check" key={opt}>
                <input
                  className="form-check-input" type="radio"
                  name="donationLocation" value={opt} id={`loc_${opt}`}
                  checked={form.donationLocation === opt} onChange={onChange}
                />
                <label className="form-check-label" htmlFor={`loc_${opt}`}>{opt}</label>
              </div>
            ))}
          </div>
        </Field>

        <Field label="Available Days *" error={errors.availableDays}>
          <div className="d-flex gap-4 flex-wrap mt-1">
            {["Weekdays (Mon–Fri)", "Weekends (Sat–Sun)", "Both"].map(d => (
              <div className="form-check" key={d}>
                <input
                  className="form-check-input" type="checkbox"
                  name="availableDays" value={d} id={`day_${d}`}
                  checked={form.availableDays.includes(d)} onChange={onChange}
                />
                <label className="form-check-label" htmlFor={`day_${d}`}>{d}</label>
              </div>
            ))}
          </div>
        </Field>

        <Field label="Preferred Time Slot *" error={errors.timeSlot}>
          <select
            className={`form-select ${errors.timeSlot ? "is-invalid" : ""}`}
            name="timeSlot" value={form.timeSlot} onChange={onChange}
          >
            <option value="">-- Select Time Slot --</option>
            {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
      </div>
    );
  }
}

/* ── Step 4: Emergency Contact ── */
class StepEmergency extends Component {
  render() {
    const { form, errors, onChange } = this.props;
    return (
      <div>
        <SectionTitle icon="🚨" title="Emergency Contact" />
        <div className="row g-3">
          <div className="col-12">
            <Field label="Full Name *" error={errors.emergencyName}>
              <input
                className={`form-control ${errors.emergencyName ? "is-invalid" : ""}`}
                name="emergencyName" value={form.emergencyName}
                onChange={onChange} placeholder="Emergency contact's name"
              />
            </Field>
          </div>
          <div className="col-md-6">
            <Field label="Relationship *" error={errors.emergencyRelation}>
              <input
                className={`form-control ${errors.emergencyRelation ? "is-invalid" : ""}`}
                name="emergencyRelation" value={form.emergencyRelation}
                onChange={onChange} placeholder="e.g. Brother, Wife, Father"
              />
            </Field>
          </div>
          <div className="col-md-6">
            <Field label="Phone Number *" error={errors.emergencyPhone}>
              <input
                className={`form-control ${errors.emergencyPhone ? "is-invalid" : ""}`}
                name="emergencyPhone" value={form.emergencyPhone}
                onChange={onChange} placeholder="0300-1234567"
              />
            </Field>
          </div>
        </div>
      </div>
    );
  }
}

/* ── Step 5: Declaration & Consent ── */
class StepConsent extends Component {
  render() {
    const { form, errors, onChange } = this.props;
    return (
      <div>
        <SectionTitle icon="✍️" title="Declaration & Consent" />

        <div className="alert alert-danger border-danger bg-danger-subtle text-danger-emphasis mb-4">
          <small>
            By submitting this form, I confirm that all information provided is accurate and
            truthful. I understand that providing false information may result in the rejection
            of my donor application.
          </small>
        </div>

        <Field error={errors.declarationTrue}>
          <div className="form-check">
            <input
              className={`form-check-input ${errors.declarationTrue ? "is-invalid" : ""}`}
              type="checkbox" name="declarationTrue" id="declarationTrue"
              checked={form.declarationTrue} onChange={onChange}
            />
            <label className="form-check-label" htmlFor="declarationTrue">
              I declare that the above information is true and correct.
            </label>
          </div>
        </Field>

        <Field error={errors.declarationConsent}>
          <div className="form-check">
            <input
              className={`form-check-input ${errors.declarationConsent ? "is-invalid" : ""}`}
              type="checkbox" name="declarationConsent" id="declarationConsent"
              checked={form.declarationConsent} onChange={onChange}
            />
            <label className="form-check-label" htmlFor="declarationConsent">
              I consent to Aziz Welfare Trust storing my personal data for blood donation purposes.
            </label>
          </div>
        </Field>

        <Field label="Digital Signature *" error={errors.signature}>
          <input
            className={`form-control ${errors.signature ? "is-invalid" : ""}`}
            name="signature" value={form.signature}
            onChange={onChange} placeholder="Type your full name as signature"
          />
          <div className="form-text">Typing your full name acts as your digital signature and agreement.</div>
        </Field>
      </div>
    );
  }
}

/* ── Main Component ── */
class RegisterDonor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      form: { ...INITIAL_FORM, availableDays: [] },
      photoPreview: null,
      submitted: false,
      errors: {},
      step: 1
    };
    this.totalSteps = 5;

    this.handleChange = this.handleChange.bind(this);
    this.handlePhoto  = this.handlePhoto.bind(this);
    this.handleCNIC   = this.handleCNIC.bind(this);
    this.nextStep     = this.nextStep.bind(this);
    this.prevStep     = this.prevStep.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.resetForm    = this.resetForm.bind(this);
  }

  handleChange(e) {
    const { name, value, type, checked } = e.target;
    this.setState(prev => {
      let updatedForm;
      if (type === "checkbox" && name === "availableDays") {
        const days = checked
          ? [...prev.form.availableDays, value]
          : prev.form.availableDays.filter(d => d !== value);
        updatedForm = { ...prev.form, availableDays: days };
      } else if (type === "checkbox") {
        updatedForm = { ...prev.form, [name]: checked };
      } else {
        updatedForm = { ...prev.form, [name]: value };
      }
      return { form: updatedForm, errors: { ...prev.errors, [name]: "" } };
    });
  }

  handlePhoto(e) {
    const file = e.target.files[0];
    if (file) {
      this.setState(prev => ({
        form: { ...prev.form, photo: file },
        photoPreview: URL.createObjectURL(file)
      }));
    }
  }

  formatCNIC(val) {
    const digits = val.replace(/\D/g, "").slice(0, 13);
    if (digits.length <= 5)  return digits;
    if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
  }

  handleCNIC(e) {
    const formatted = this.formatCNIC(e.target.value);
    this.setState(prev => ({
      form: { ...prev.form, cnic: formatted },
      errors: { ...prev.errors, cnic: "" }
    }));
  }

  validate(s) {
    const { form } = this.state;
    const errs = {};

    if (s === 1) {
      if (!form.fullName.trim())           errs.fullName          = "Full name is required.";
      if (!form.fatherHusbandName.trim())  errs.fatherHusbandName = "This field is required.";
      if (!form.dob && !form.age)          errs.dob               = "Enter date of birth or age.";
      if (!form.gender)                    errs.gender            = "Select gender.";
      if (!form.bloodGroup)                errs.bloodGroup        = "Select blood group.";
      const cnicClean = form.cnic.replace(/\D/g, "");
      if (!cnicClean)                      errs.cnic = "CNIC is required.";
      else if (cnicClean.length !== 13)    errs.cnic = "CNIC must be 13 digits.";
    }

    if (s === 2) {
      if (!form.whatsapp.trim())             errs.whatsapp        = "WhatsApp number is required.";
      if (!form.email.trim())                errs.email           = "Email is required.";
      else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email      = "Enter a valid email address.";
      if (!form.password)                    errs.password        = "Password is required.";
      else if (form.password.length < 6)     errs.password        = "Password must be at least 6 characters.";
      if (form.password !== form.confirmPassword)
                                             errs.confirmPassword = "Passwords do not match.";
      if (!form.address.trim())              errs.address         = "Address is required.";
      if (!form.city)                        errs.city            = "Select a city.";
    }

    if (s === 3) {
      if (!form.donationLocation)          errs.donationLocation = "Select donation preference.";
      if (form.availableDays.length === 0) errs.availableDays    = "Select at least one available day.";
      if (!form.timeSlot)                  errs.timeSlot         = "Select preferred time slot.";
    }

    if (s === 4) {
      if (!form.emergencyName.trim())      errs.emergencyName     = "Name is required.";
      if (!form.emergencyRelation.trim())  errs.emergencyRelation = "Relationship is required.";
      if (!form.emergencyPhone.trim())     errs.emergencyPhone    = "Phone number is required.";
    }

    if (s === 5) {
      if (!form.declarationTrue)           errs.declarationTrue    = "You must confirm the declaration.";
      if (!form.declarationConsent)        errs.declarationConsent = "You must consent to data storage.";
      if (!form.signature.trim())          errs.signature          = "Please enter your full name as signature.";
    }

    return errs;
  }

  nextStep() {
    const errs = this.validate(this.state.step);
    if (Object.keys(errs).length > 0) { this.setState({ errors: errs }); return; }
    this.setState(prev => ({ errors: {}, step: prev.step + 1 }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  prevStep() {
    this.setState(prev => ({ errors: {}, step: prev.step - 1 }));
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

    Object.entries(form).forEach(([k, v]) => {
      if (k === "availableDays")        formData.append(k, v.join(","));
      else if (k === "photo" && v)      formData.append(k, v);
      else if (k === "confirmPassword") formData.append("confirm_password", v); // backend expects confirm_password
      else if (k !== "photo")           formData.append(k, v);
    });

    try {
      const res = await fetch("http://localhost:8080/awt/backend/public/api/donors/register", {
        method: "POST",
        
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Registration successful:", data);
        this.setState({ submitted: true });
      } else {
        const errorData = await res.json();
        alert("Submission failed: " + (errorData.message || "Please try again."));
        console.error("Registration errors:", errorData.errors);
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Unable to connect to the server. Please try again.");
    }
  }

  resetForm() {
    this.setState({
      form: { ...INITIAL_FORM, availableDays: [] },
      photoPreview: null,
      submitted: false,
      errors: {},
      step: 1
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
                  i + 1 <= step ? "bg-white text-black" : "bg-danger-subtle text-danger"
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
                    background: i + 1 < step ? "#dc3545" : "#f8d7da"
                  }}
                />
              )}
            </div>
          ))}
        </div>
        <div className="d-flex">
          {STEP_LABELS.map((label, i) => (
            <div key={i} className="flex-grow-1 text-center" style={{ fontSize: 11 }}>
              <span className={i + 1 === step ? "text-white fw-semibold" : "text-white"}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  renderStep() {
    const { form, errors, photoPreview, step } = this.state;
    const common = { form, errors, onChange: this.handleChange };
    switch (step) {
      case 1: return <StepPersonal {...common} photoPreview={photoPreview} onCNIC={this.handleCNIC} onPhoto={this.handlePhoto} />;
      case 2: return <StepContact {...common} />;
      case 3: return <StepPreferences {...common} />;
      case 4: return <StepEmergency {...common} />;
      case 5: return <StepConsent {...common} />;
      default: return null;
    }
  }

  render() {
    const { submitted, step, form } = this.state;

    if (submitted) {
      return (
        <div className="min-vh-100 pt-5 mt-3 bg-light d-flex align-items-center justify-content-center py-5">
          <div className="card shadow-sm border-danger-subtle text-center p-5" style={{ maxWidth: 480, width: "100%" }}>
            <div
              className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4"
              style={{ width: 70, height: 70, fontSize: 28 }}
            >✓</div>
            <h4 className="text-danger fw-bold mb-2">Registration Successful!</h4>
            <p className="text-muted mb-4">
              Thank you, <strong>{form.fullName}</strong>. Your donor profile has been submitted.
              Our team will review your application and contact you via WhatsApp shortly.
            </p>
            <button className="btn btn-danger px-4" onClick={this.resetForm}>
              Register Another Donor
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-vh-100 pt-5 mt-4 bg-light">

        {/* Header */}
        <div className="text-white py-4" style={{ background: "linear-gradient(135deg, #7f1d1d 0%, #dc3545 100%)" }}>
          <div className="container" style={{ maxWidth: 680 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h4 className="fw-bold mb-1">Donor Registration</h4>
                <p className="mb-0 opacity-75 small">Aziz Welfare Trust — Blood Bank</p>
              </div>
            </div>
            {this.renderProgress()}
          </div>
        </div>

        {/* Form Card */}
        <div className="container py-4" style={{ maxWidth: 680 }}>
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <form onSubmit={this.handleSubmit}>
                {this.renderStep()}

                {/* Navigation Buttons */}
                <div className="d-flex justify-content-between mt-4 pt-3 border-top">
                  {step > 1
                    ? <button type="button" className="btn btn-outline-danger px-4" onClick={this.prevStep}>
                        ← Back
                      </button>
                    : <div />
                  }
                  {step < this.totalSteps
                    ? <button type="button" className="btn btn-danger px-4" onClick={this.nextStep}>
                        Continue →
                      </button>
                    : <button type="submit" className="btn px-4 text-white fw-semibold" style={{ background: "#7f1d1d" }}>
                        Submit Registration
                      </button>
                  }
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