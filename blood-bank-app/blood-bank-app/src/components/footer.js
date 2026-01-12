// src/components/Footer.js
import React from "react";
import { Link } from "react-router-dom";

const Footer = () => (
  <div className="container-fluid bg-color">
    <footer className="py-5">
      <div className="row">
        <div className="col-6 col-md-2 mb-3">
          <h5>Section</h5>
          <ul className="nav flex-column">
            <li className="nav-item mb-2"><Link to="/" className="nav-link p-0 text-body-secondary">Home</Link></li>
            <li className="nav-item mb-2"><Link to="/" className="nav-link p-0 text-body-secondary">Features</Link></li>
            <li className="nav-item mb-2"><Link to="/" className="nav-link p-0 text-body-secondary">Pricing</Link></li>
            <li className="nav-item mb-2"><Link to="/" className="nav-link p-0 text-body-secondary">FAQs</Link></li>
            <li className="nav-item mb-2"><Link to="/" className="nav-link p-0 text-body-secondary">About</Link></li>
          </ul>
        </div>

        <div className="col-6 col-md-2 mb-3">
          <h5>Contact us:</h5>
          <ul className="nav flex-column">
            <li className="nav-item mb-2"><span className="nav-link p-0 text-body-secondary">📍 Address</span></li>
            <li className="nav-item mb-2"><span className="nav-link p-0 text-body-secondary">📞 +91 99765797</span></li>
            <li className="nav-item mb-2"><span className="nav-link p-0 text-body-secondary">📧 email@example.com</span></li>
          </ul>
        </div>

        <div className="col-6 col-md-2 mb-3">
          <h5>Follow us:</h5>
          <ul className="nav flex-column">
            <li>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="nav-link p-0">
                <img src="/assets/facebook.png" alt="Facebook" width="24" /> Facebook
              </a>
            </li>
            <li>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="nav-link p-0">
                <img src="/assets/twitter.jpg" alt="Twitter" width="24" /> Twitter
              </a>
            </li>
            <li>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="nav-link p-0">
                <img src="/assets/instagram.jpg" alt="Instagram" width="24" /> Instagram
              </a>
            </li>
          </ul>
        </div>

        <div className="col-md-5 offset-md-1 mb-3">
          <form>
            <h5>Subscribe to our newsletter</h5>
            <p>Monthly digest of what's new and exciting from us.</p>
            <div className="d-flex flex-column flex-sm-row w-100 gap-2">
              <label htmlFor="newsletter1" className="visually-hidden">Email address</label>
              <input id="newsletter1" type="email" className="form-control" placeholder="Email address" />
              <button className="btn btn-primary" type="submit">Subscribe</button>
            </div>
          </form>
        </div>
      </div>

      <div className="d-flex flex-column flex-sm-row justify-content-between py-4 my-4 border-top">
        <p>© 2025 Blood Bank, Inc. All rights reserved.</p>
        <ul className="list-unstyled d-flex">
          <li className="ms-3">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <img src="/assets/instagram.jpg" alt="Instagram" width="24" />
            </a>
          </li>
          <li className="ms-3">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <img src="/assets/facebook.png" alt="Facebook" width="24" />
            </a>
          </li>
        </ul>
      </div>
    </footer>
  </div>
);

export default Footer;
