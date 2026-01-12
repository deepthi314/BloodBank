
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Common Pages
import Home from "./components/homepage";
import Signin from "./components/signin";
import Contact from "./components/contact";
import Donor from "./components/donor";
import Recipient from "./components/recipient";
import BloodStock from "./components/bloodstock";

// Admin Pages
import AdminDashboard from "./components/admindashboard";
import BloodStockAdmin from "./components/bloodstockAdmin";
import ManageDonors from "./components/manageDonor";
import ManageRecipients from "./components/manageRecipient";
import AddDonation from "./components/addDonations";
import AddRequest from "./components/addRequests";
import AddAdmin from "./components/addAdmin";

// Global Styles
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/homepage.css';
import './styles/bloodstock.css';
import './styles/admin_table.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/donor" element={<Donor />} />
        <Route path="/recipient" element={<Recipient />} />
        <Route path="/bloodstock" element={<BloodStock />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/bloodstock" element={<BloodStockAdmin />} />
        <Route path="/admin/manage-donors" element={<ManageDonors />} />
        <Route path="/admin/manage-recipients" element={<ManageRecipients />} />
        <Route path="/admin/add-donation" element={<AddDonation />} />
        <Route path="/admin/add-request" element={<AddRequest />} />
        <Route path="/admin/add-admin" element={<AddAdmin />} />
      </Routes>
    </Router>
  );
}

export default App;
