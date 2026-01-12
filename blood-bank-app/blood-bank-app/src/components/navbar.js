import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container-fluid">
        <span className="logo">
          <img width="60" src="/assets/logo.png" alt="logo" />
        </span>
        <Link className="navbar-brand" to="/">Blood Bank</Link>

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
              <Link className="nav-link active" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link active" to="/signin">Admin</Link>
            </li>

            <li className="nav-item dropdown">
              {/* Using button for accessibility */}
              <button
                className="nav-link dropdown-toggle btn btn-link"
                id="registerDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Register
              </button>
              <ul className="dropdown-menu" aria-labelledby="registerDropdown">
                <li>
                  <Link className="dropdown-item" to="/donor">Donor</Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/recipient">Recipient</Link>
                </li>
              </ul>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/contact">Contact</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
