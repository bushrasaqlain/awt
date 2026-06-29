import React from "react";
import { Container, Row, Col } from "reactstrap";
import {
  FaPhone,
  FaMapMarkerAlt,
  FaEnvelope,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: "#1e293b",
        color: "#fff",
        marginTop: "50px",
      }}
    >
      <Container>
        <Row className="py-2">

          {/* Logo and Contact */}
          <Col md="6" className="mb-4">
            <img
              src="/images/logo-2.svg"
              alt="Logo"
              width="150"
              className="mb-3"
            />

            <p>
              Aziz Welfare Trust Blood Bank Management System.
              Connecting donors with patients and saving lives.
            </p>

            <p>
              <FaPhone className="me-2" />
              +92 314 8744587
            </p>

            <p>
              <FaMapMarkerAlt className="me-2" />
              Westridge 1, Rawalpindi
            </p>

            <p>
              <FaEnvelope className="me-2" />
              info@awt.com
            </p>
          </Col>

          {/* Quick Links */}
          <Col md="3" className="mb-4">
            <h5 className="mb-3">Quick Links</h5>

            <ul className="list-unstyled">
              <li className="mb-2">
                <Link
                  to="/"
                  style={{ color: "#fff", textDecoration: "none" }}
                >
                  Home
                </Link>
              </li>

              <li className="mb-2">
                <Link
                  to="/login"
                  style={{ color: "#fff", textDecoration: "none" }}
                >
                  Login
                </Link>
              </li>

              <li className="mb-2">
                <Link
                  to="/register"
                  style={{ color: "#fff", textDecoration: "none" }}
                >
                  Register
                </Link>
              </li>
            </ul>
          </Col>

          {/* Social Links */}
          <Col md="3">
            <h5 className="mb-3">Follow Us</h5>

            <div className="d-flex gap-3 fs-4">
              <a href="/" style={{ color: "#fff" }}>
                <FaFacebookF />
              </a>

              <a href="/" style={{ color: "#fff" }}>
                <FaTwitter />
              </a>

              <a href="/" style={{ color: "#fff" }}>
                <FaLinkedinIn />
              </a>
            </div>
          </Col>

        </Row>
      </Container>

      {/* Bottom Footer */}
      <div
        style={{
          backgroundColor: "#0f172a",
          textAlign: "center",
          padding: "15px",
        }}
      >
        © {new Date().getFullYear()} Aziz Welfare Trust. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;