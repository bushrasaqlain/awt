import { Component } from "react";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      showPassword: false,
      errors: {},
      loading: false,
      serverError: ""
    };

    this.handleChange  = this.handleChange.bind(this);
    this.handleSubmit  = this.handleSubmit.bind(this);
    this.togglePassword = this.togglePassword.bind(this);
  }

  handleChange(e) {
    const { name, value } = e.target;
    this.setState(prev => ({
      [name]: value,
      errors: { ...prev.errors, [name]: "" },
      serverError: ""
    }));
  }

  togglePassword() {
    this.setState(prev => ({ showPassword: !prev.showPassword }));
  }

  validate() {
    const { email, password } = this.state;
    const errs = {};
    if (!email.trim())                              errs.email    = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email))          errs.email    = "Enter a valid email address.";
    if (!password)                                  errs.password = "Password is required.";
    else if (password.length < 6)                  errs.password = "Password must be at least 6 characters.";
    return errs;
  }

  async handleSubmit(e) {
    e.preventDefault();
    const errs = this.validate();
    if (Object.keys(errs).length > 0) { this.setState({ errors: errs }); return; }

    this.setState({ loading: true, serverError: "" });

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: this.state.email,
          password: this.state.password
        })
      });

      const data = await res.json();

      if (res.ok) {
        // Save token and redirect
        localStorage.setItem("awt_token", data.token);
        localStorage.setItem("awt_user",  JSON.stringify(data.user));
        window.location.href = "/dashboard";
      } else {
        this.setState({ serverError: data.message || "Invalid email or password." });
      }
    } catch {
      this.setState({ serverError: "Unable to connect. Please try again." });
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    const { email, password, showPassword, errors, loading, serverError } = this.state;

    return (
      <div
  className="min-vh-100 d-flex align-items-center justify-content-center pt-5 mt-3"
  style={{ background: "linear-gradient(135deg, #7f1d1d 0%, #dc3545 100%)" }}
>
        <div className="w-100 px-3" style={{ maxWidth: 440 }}>

          {/* Logo / Brand */}
          <div className="text-center mb-4">
            <div
              className="rounded-circle bg-white d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: 72, height: 72, fontSize: 34 }}
            >
              🩸
            </div>
            <h4 className="text-white fw-bold mb-1">Aziz Welfare Trust</h4>
            <p className="text-white-50 small mb-0">Blood Bank Management System</p>
          </div>

          {/* Card */}
          <div className="card border-0 shadow-lg">
            <div className="card-body p-4 p-md-5">

              <h5 className="fw-bold text-danger mb-1">Welcome back</h5>
              <p className="text-muted small mb-4">Sign in to your account to continue</p>

              {/* Server error */}
              {serverError && (
                <div className="alert alert-danger py-2 small" role="alert">
                  ⚠️ {serverError}
                </div>
              )}

              <form onSubmit={this.handleSubmit} noValidate>

                {/* Email */}
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Email Address</label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? "is-invalid" : ""}`}
                    name="email"
                    value={email}
                    onChange={this.handleChange}
                    placeholder="yourname@email.com"
                    autoComplete="email"
                    disabled={loading}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                {/* Password */}
                <div className="mb-3">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label className="form-label fw-semibold small mb-0">Password</label>
                    <a href="/forgot-password" className="small text-danger text-decoration-none">
                      Forgot password?
                    </a>
                  </div>
                  <div className="input-group mt-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`form-control ${errors.password ? "is-invalid" : ""}`}
                      name="password"
                      value={password}
                      onChange={this.handleChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={this.togglePassword}
                      tabIndex={-1}
                      style={{ borderColor: errors.password ? "#dc3545" : "" }}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                    {errors.password && (
                      <div className="invalid-feedback d-block">{errors.password}</div>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <div className="d-grid mt-4">
                  <button
                    type="submit"
                    className="btn btn-danger fw-semibold py-2"
                    disabled={loading}
                  >
                    {loading
                      ? <><span className="spinner-border spinner-border-sm me-2" role="status" />Signing in...</>
                      : "Sign In"
                    }
                  </button>
                </div>

              </form>
            </div>
          </div>

          {/* Register link */}
          <p className="text-center text-white-50 small mt-4">
            Want to register as a donor?{" "}
            <a href="/register" className="text-white fw-semibold">
              Register here
            </a>
          </p>

        </div>
      </div>
    );
  }
}

export default Login;