// src/components/Homepage.js
import React from "react";
import Navbar from "./navbar";
import Footer from "./footer";
import { Link } from "react-router-dom";
//import "../styles/homepage.css";

const Homepage = () => (
  <>
    <Navbar />

    <section>
      <div className="container col-xxl-8 px-4 py-5">
        <div className="row flex-lg-row-reverse align-items-center g-5 py-5">
          <div className="col-10 col-sm-8 col-lg-6">
            <img
              src="assets/homepage_img.png"
              className="d-block mx-lg-auto img-fluid"
              alt="Bootstrap Themes"
              width="700"
              height="500"
              loading="lazy"
            />
          </div>
          <div className="col-lg-6">
            <h1 className="display-5 fw-bold text-body-emphasis lh-1 mb-3">
              Saving Lives Through Efficient Blood Management
            </h1>
            <p className="lead">
              A comprehensive and user-friendly system designed to streamline the process of blood donation, storage, and distribution. Our platform bridges the gap between donors, recipients, and medical institutions to ensure a fast, reliable, and efficient blood management process.
            </p>
          </div>
        </div>
      </div>
    </section>

    <div className="container mt-0 mb-4">
      <div className="bg-body-tertiary p-5 rounded">
        <h1 className="mb-3">Blood Stock Overview</h1>
        <p className="lead">
          Ensure the safety and availability of blood by efficiently tracking, updating, and managing inventory levels. This system helps you monitor donations, usage, and expiry dates in real time—empowering faster decision-making and saving more lives.
        </p>
       <Link
  className="btn btn-lg btn-danger"
  to="/bloodstock"
  role="button"
>
  View BloodStock »
</Link>
      </div>
    </div>

    <Footer />
  </>
);

export default Homepage;

