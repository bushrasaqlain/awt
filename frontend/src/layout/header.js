import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import 'bootstrap/dist/css/bootstrap.min.css';

class DefaultHeader2 extends Component {
  render() {
    return (
      <>
        <Helmet>
          <title>AWT - Blood Bank</title>
        </Helmet>

        <nav className="navbar navbar-light bg-white shadow-sm py-1 fixed-top">
          <div className="container d-flex align-items-center">
            
            <Link to="/">
              <img src="/images/logo.png" width="80" height="80" alt="Logo" />
            </Link>

            <div className="ms-auto d-flex gap-3">
              <Link to="/login" className="btn btn-outline-danger">Login</Link>
              <Link to="/register" className="btn btn-danger">Register</Link>
            </div>

          </div>
        </nav>
      </>
    );
  }
}

export default DefaultHeader2;