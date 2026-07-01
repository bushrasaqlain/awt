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
import ManageDonors from "./components/donormanagement/dashboard";
import DonorManagement from "./components/dbadmin/donors";
import DonorList from "./components/donormanagement/donorlist";
import LiveDashboard from "./components/accounts/livedashboard";

// Home component with LiveDashboard
function Home() {
  return (
    <div>
      <LiveDashboard />
      </div>
    
  );
}

function App() {
  return (
    <BrowserRouter>
      <DefaultHeader2 />
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/livedashboard" element={<Layout><LiveDashboard /></Layout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/csr/donorlist" element={<DonorList />} />
        <Route path="/admin/dashboard-area" element={<AdminDashboard />} />
        <Route path="/admin/city" element={<Cities />} />
        <Route path="/admin/manager" element={<Management />} />
        <Route path="/admin/donors" element={<DonorManagement />} />
        <Route path="/csr/dashboard" element={<ManageDonors />} />
        <Route path="/csr/donorlist" element={<DonorList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;