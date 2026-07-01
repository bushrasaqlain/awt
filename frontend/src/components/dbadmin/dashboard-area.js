import { Component } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ["#dc3545", "#c0392b", "#e74c3c", "#922b21", "#7b241c", "#641e16", "#4a235a", "#1a5276"];

class AdminDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stats: {
        totalDonors: 0,
        totalCsrs: 0,
        pendingApprovals: 0,
        bloodRequests: 0,
      },
      recentDonors: [],
      bloodGroupData: [],
      monthlyDonations: [],
      loading: true,
      error: "",
    };
  }

  componentDidMount() {
    this.loadDashboard();
  }

  async loadDashboard() {
    this.setState({ loading: true, error: "" });
    try {
      const res  = await fetch("/api/admin/dashboard");
      const data = await res.json();

      if (res.ok && data.status) {
        this.setState({
          stats:             data.data.stats,
          recentDonors:      data.data.recentDonors,
          bloodGroupData:    data.data.bloodGroupData,
          monthlyDonations:  data.data.monthlyDonations,
          loading:           false,
        });
      } else {
        this.setState({ loading: false, error: data.message || "Failed to load dashboard." });
      }
    } catch {
      this.setState({ loading: false, error: "Failed to load dashboard." });
    }
  }

  statusBadge(status) {
    const map = {
      approved: "success",
      pending:  "warning",
      rejected: "danger",
    };
    return (
      <span className={`badge bg-${map[status] || "secondary"}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  }

  render() {
    const { stats, recentDonors, bloodGroupData, monthlyDonations, loading, error } = this.state;
    const user = JSON.parse(localStorage.getItem("awt_user") || "{}");

    if (loading) {
      return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center pt-5">
          <div className="spinner-border text-danger" role="status" />
        </div>
      );
    }

    const statCards = [
      { label: "Total Donors",      value: stats.totalDonors,      icon: "🩸", color: "#dc3545", link: "/admin/donors"  },
      { label: "Total CSRs",        value: stats.totalCsrs,        icon: "👥", color: "#c0392b", link: "/admin/manager"    },
      { label: "Pending Approvals", value: stats.pendingApprovals, icon: "⏳", color: "#e67e22", link: "/admin/donors"  },
      { label: "Blood Requests",    value: stats.bloodRequests,    icon: "💉", color: "#922b21", link: "/admin/reports" },
    ];

    return (
      <div className="pt-5 mt-4" style={{ background: "#f8f9fa", minHeight: "100vh" }}>
        <div className="container py-4">

          <div className="mb-4">
            <h4 className="fw-bold mb-1">Welcome back, {user.name} 👋</h4>
            <p className="text-muted small mb-0">Here's what's happening at AWT Blood Bank today.</p>
          </div>

          {error && <div className="alert alert-danger py-2 small">⚠️ {error}</div>}

          <div className="row g-3 mb-4">
            {statCards.map((card, i) => (
              <div className="col-6 col-md-3" key={i}>
                <Link to={card.link} style={{ textDecoration: "none" }}>
                  <div className="card border-0 shadow-sm h-100" style={{ borderLeft: `4px solid ${card.color}` }}>
                    <div className="card-body d-flex align-items-center gap-3">
                      <div style={{ fontSize: 32 }}>{card.icon}</div>
                      <div>
                        <div className="fw-bold fs-4" style={{ color: card.color }}>{card.value}</div>
                        <div className="text-muted small">{card.label}</div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-7">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">Monthly Donations ({new Date().getFullYear()})</h6>
                  {monthlyDonations.length === 0 ? (
                    <p className="text-muted small text-center py-5">No donation data yet.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={monthlyDonations}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="donations" fill="#dc3545" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-5">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">Donors by Blood Group</h6>
                  {bloodGroupData.length === 0 ? (
                    <p className="text-muted small text-center py-5">No donor data yet.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={bloodGroupData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {bloodGroupData.map((_, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">Recent Donors</h6>
                <Link to="/admin/donors" className="btn btn-outline-danger btn-sm">View All</Link>
              </div>
              {recentDonors.length === 0 ? (
                <p className="text-muted small text-center py-4">No donors registered yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Blood Group</th>
                        <th>City</th>
                        <th>Status</th>
                        <th>Registered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentDonors.map((donor, i) => (
                        <tr key={donor.id}>
                          <td className="text-muted small">{i + 1}</td>
                          <td className="fw-semibold">{donor.name}</td>
                          <td>
                            <span className="badge" style={{ background: "#dc3545" }}>
                              {donor.blood_group}
                            </span>
                          </td>
                          <td>{donor.city}</td>
                          <td>{this.statusBadge(donor.status)}</td>
                          <td className="text-muted small">{donor.created_at}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  }
}

export default AdminDashboard;