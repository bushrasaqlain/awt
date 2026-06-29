import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import Layout from "./layout/Layout";
import DefaultHeader2 from "./layout/header";
import Login from "./components/accounts/login";
import Register from "./components/accounts/register";

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;