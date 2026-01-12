import React from "react";
import { Link, useNavigate } from "react-router-dom";

const AdminHeader = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all admin data from storage
    localStorage.removeItem("adminData");
    localStorage.removeItem("isAdminLoggedIn");
    sessionStorage.removeItem("adminData");
    sessionStorage.removeItem("isAdminLoggedIn");
    
    // Optional: Clear any other auth tokens
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    localStorage.removeItem("user");
    
    // Redirect to home/signin page
    navigate("/");
  };

  // Get admin info for display
  const getAdminInfo = () => {
    try {
      const adminData = localStorage.getItem("adminData");
      if (adminData) {
        return JSON.parse(adminData);
      }
      
      // Fallback to sessionStorage
      const sessionData = sessionStorage.getItem("adminData");
      if (sessionData) {
        return JSON.parse(sessionData);
      }
    } catch (error) {
      console.error("Error getting admin info:", error);
    }
    return null;
  };

  const admin = getAdminInfo();

  return (
    <section id="header">
      <nav className="navbar navbar-expand-lg navbar-dark bg-danger">
        <div className="container-fluid">
          <span className="logo">
            <img width="60" src="/assets/logo.png" alt="logo" />
          </span>
          <Link className="navbar-brand" to="/admin/dashboard">
            <strong>Blood Bank Admin</strong>
          </Link>
          
          {admin && (
            <div className="navbar-text text-white mx-3 d-none d-md-block">
              <small>
                <i className="bi bi-person-circle me-1"></i>
                {admin.fullName} (ID: {admin.adminId})
              </small>
            </div>
          )}
          
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNavDropdown"
            aria-controls="navbarNavDropdown"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarNavDropdown">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link text-white" to="/admin/dashboard">
                  <i className="bi bi-speedometer2 me-1"></i> Dashboard
                </Link>
              </li>
              
              {admin && (
                <li className="nav-item dropdown">
                  <a 
                    className="nav-link dropdown-toggle text-white" 
                    href="#" 
                    id="navbarDropdown" 
                    role="button" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                  >
                    <i className="bi bi-person-circle me-1"></i> {admin.fullName}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                    <li className="dropdown-header">
                      <small>Admin ID: {admin.adminId}</small>
                    </li>
                    <li className="dropdown-header">
                      <small>Role: {admin.role}</small>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button 
                        className="dropdown-item text-danger" 
                        onClick={handleLogout}
                      >
                        <i className="bi bi-box-arrow-right me-1"></i> Logout
                      </button>
                    </li>
                  </ul>
                </li>
              )}
              
              {!admin && (
                <li className="nav-item">
                  <Link className="nav-link text-white" to="/">
                    <i className="bi bi-box-arrow-in-right me-1"></i> Login
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </section>
  );
};

export default AdminHeader;