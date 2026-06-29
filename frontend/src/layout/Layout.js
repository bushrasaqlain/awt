import React from "react";
import DefaulHeader2 from "./header";
import Footer from "./footer";

const Layout = ({ children }) => {
  return (
    <>
      <DefaulHeader2 />

      {/* Main Content */}
      <div style={{ minHeight: "80vh", paddingTop: "90px" }}>
        {children}
      </div>

      <Footer />
    </>
  );
};

export default Layout;