// Keep only ONE definition of DefaultHeader2
import React, { Component } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import 'bootstrap/dist/css/bootstrap.min.css';

function withNavigate(WrappedComponent) {
  return function(props) {
    const navigate = useNavigate();
    const location = useLocation();
    return <WrappedComponent {...props} navigate={navigate} location={location} />;
  };
}

class DefaultHeader2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menuOpen: false,
      user: this.getStoredUser(),
      checkedSession: false,
    };
    this.handleLogout = this.handleLogout.bind(this);
    this.toggleMenu  = this.toggleMenu.bind(this);
    this.closeMenu   = this.closeMenu.bind(this);
  }

  componentDidMount() {
    this.verifySession();
  }

  getStoredUser() {
    try { return JSON.parse(localStorage.getItem("awt_user")) || null; }
    catch { return null; }
  }

  async verifySession() {
    try {
      const res  = await fetch("/api/auth/me");
      const data = await res.json();

      if (res.ok && data.status && data.user) {
        localStorage.setItem("awt_user", JSON.stringify(data.user));
        this.setState({ user: data.user, checkedSession: true });
      } else {
        localStorage.removeItem("awt_user");
        localStorage.removeItem("awt_token");
        this.setState({ user: null, checkedSession: true });
      }
    } catch {
      this.setState({ checkedSession: true });
    }
  }

  async handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      localStorage.removeItem("awt_user");
      localStorage.removeItem("awt_token");
      this.setState({ user: null });
      this.props.navigate("/login");
    }
  }

  toggleMenu() { this.setState(p => ({ menuOpen: !p.menuOpen })); }
  closeMenu()  { this.setState({ menuOpen: false }); }

  isActive(path) {
    return this.props.location?.pathname === path;
  }

  navLink(to, label) {
    const active = this.isActive(to);
    return (
      <Link
        to={to}
        onClick={this.closeMenu}
        style={{
          textDecoration: "none",
          padding: "6px 14px",
          borderRadius: 6,
          fontWeight: 600,
          fontSize: 14,
          color: active ? "#fff" : "#333",
          background: active ? "#dc3545" : "transparent",
          transition: "all 0.2s",
        }}
        onMouseEnter={e => { if (!active) e.target.style.background = "#f8d7da"; }}
        onMouseLeave={e => { if (!active) e.target.style.background = "transparent"; }}
      >
        {label}
      </Link>
    );
  }

  renderAdminTabs() {
    return (
      <>
        {this.navLink("/admin/dashboard-area", "Dashboard")}
        {this.navLink("/admin/manager", "Management")}
        {this.navLink("/admin/donors", "Donor Management")}
        {this.navLink("/admin/city", "City")}
      </>
    );
  }

  renderCsrTabs() {
    return (
      <>
        {this.navLink("/csr/dashboard", "Manage Donors")}
        {this.navLink("/csr/donorlist", "Donors List")}
        {this.navLink("/csr/blood-requests", "Blood Requests")}
      </>
    );
  }

  render() {
    const { menuOpen, user, checkedSession } = this.state;
    const role = user?.role;
    const isLoggedIn = !!role;

    // Uncomment the line below to wait for session check before rendering
    // if (!checkedSession) return null;

    return (
      <>
        <Helmet><title>AWT - Blood Bank</title></Helmet>

        <nav style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
          background: "#fff",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          borderBottom: "2px solid #dc3545",
        }}>
          <div style={{
            maxWidth: 1200, margin: "0 auto",
            padding: "0 20px",
            display: "flex", alignItems: "center",
            height: 70,
          }}>

            <Link to="/" onClick={this.closeMenu} style={{ flexShrink: 0 }}>
              <img src="/images/logo.png" height={54} alt="AWT Logo" />
            </Link>

            <div className="d-none d-lg-flex" style={{ marginLeft: 24, gap: 4, flex: 1 }}>
              {role === "admin" && this.renderAdminTabs()}
              {role === "csr" && this.renderCsrTabs()}
            </div>

            <div className="d-none d-lg-flex ms-auto align-items-center" style={{ gap: 12 }}>
              {isLoggedIn ? (
                <>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "#f8f9fa", borderRadius: 8,
                    padding: "6px 14px",
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: "#dc3545", color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: 14,
                    }}>
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{user.name}</div>
                      <div style={{ fontSize: 11, color: "#888", textTransform: "capitalize" }}>{role}</div>
                    </div>
                  </div>
                  <button
                    onClick={this.handleLogout}
                    style={{
                      background: "transparent", border: "2px solid #dc3545",
                      color: "#dc3545", borderRadius: 8,
                      padding: "6px 16px", fontWeight: 600, fontSize: 13,
                      cursor: "pointer", transition: "all 0.2s",
                    }}
                    onMouseEnter={e => { e.target.style.background = "#dc3545"; e.target.style.color = "#fff"; }}
                    onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = "#dc3545"; }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/livedashboard" style={{
                    textDecoration: "none", padding: "7px 18px",
                    border: "2px solid #dc3545", borderRadius: 8,
                    color: "#dc3545", fontWeight: 600, fontSize: 14,
                  }}>Live Dashboard</Link>
                  <Link to="/login" style={{
                    textDecoration: "none", padding: "7px 18px",
                    border: "2px solid #dc3545", borderRadius: 8,
                    color: "#dc3545", fontWeight: 600, fontSize: 14,
                  }}>Login</Link>
                  <Link to="/register" style={{
                    textDecoration: "none", padding: "7px 18px",
                    background: "#dc3545", borderRadius: 8,
                    color: "#fff", fontWeight: 600, fontSize: 14,
                  }}>Register</Link>
                </>
              )}
            </div>

            <button
              className="d-lg-none ms-auto"
              onClick={this.toggleMenu}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: 8, display: "flex", flexDirection: "column",
                gap: 5,
              }}
            >
              {[0,1,2].map(i => (
                <span key={i} style={{
                  display: "block", width: 24, height: 2,
                  background: "#dc3545", borderRadius: 2,
                  transition: "all 0.3s",
                  transform: menuOpen
                    ? i === 0 ? "rotate(45deg) translate(5px,5px)"
                    : i === 2 ? "rotate(-45deg) translate(5px,-5px)"
                    : "scaleX(0)"
                    : "none",
                }} />
              ))}
            </button>
          </div>

          <div style={{
            maxHeight: menuOpen ? 400 : 0,
            overflow: "hidden",
            transition: "max-height 0.3s ease",
            background: "#fff",
            borderTop: menuOpen ? "1px solid #f0f0f0" : "none",
          }}>
            <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 4 }}>
              {role === "admin" && this.renderAdminTabs()}
              {role === "csr" && this.renderCsrTabs()}

              {isLoggedIn ? (
                <>
                  <hr style={{ margin: "8px 0" }} />
                  <div style={{ fontSize: 13, color: "#888", padding: "4px 14px" }}>
                    Logged in as <strong>{user.name}</strong> ({role})
                  </div>
                  <button
                    onClick={this.handleLogout}
                    style={{
                      margin: "4px 0", padding: "8px 14px",
                      background: "#dc3545", color: "#fff",
                      border: "none", borderRadius: 8,
                      fontWeight: 600, cursor: "pointer", textAlign: "left",
                    }}
                  >Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={this.closeMenu} style={{ padding: "8px 14px", color: "#dc3545", fontWeight: 600, textDecoration: "none" }}>Login</Link>
                  <Link to="/register" onClick={this.closeMenu} style={{ padding: "8px 14px", background: "#dc3545", color: "#fff", borderRadius: 8, fontWeight: 600, textDecoration: "none" }}>Register</Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </>
    );
  }
}

export default withNavigate(DefaultHeader2);