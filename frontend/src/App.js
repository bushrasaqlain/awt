import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import Layout from "./layout/Layout";
import DefaultHeader2 from "./layout/header";
import Login from "./components/accounts/login";
import Register from "./components/accounts/register";
import AdminDashboard from "./components/dbadmin/dashboard-area";
import Cities from "./components/dbadmin/city";
import Management from "./components/dbadmin/manager";

function Home() {
  return (
    
    <div className="container text-center py-5 mt-5">
      <h1>Welcome to Aziz Welfare Trust</h1>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <DefaultHeader2 />
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/dashboard-area" element={<AdminDashboard />} />
        <Route path="/admin/city" element={<Cities />} />
        <Route path="/admin/manager"           element={<Management />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;