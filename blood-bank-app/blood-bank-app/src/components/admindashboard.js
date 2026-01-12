import React from "react";
import { Link } from "react-router-dom";
import AdminHeader from "./adminheader";

const AdminDashboard = () => {
  return (
    <>
      <AdminHeader />

      <div className="container px-4 py-5" id="featured-3">
        <h2 className="pb-2 border-bottom">Admin Dashboard</h2>

        {/* Row 1: 3 Features */}
        <div className="row g-4 py-5 row-cols-1 row-cols-md-3">
          <div className="feature col">
            <div className="feature-icon d-inline-flex align-items-center justify-content-center text-bg-danger bg-gradient fs-2 mb-3">
              <img
                src="/assets/donationicon.png"
                alt="Add Donations Icon"
                style={{ width: "2em", height: "2em" }}
              />
            </div>
            <h3 className="fs-2 text-body-emphasis">Add Donations</h3>
            <p>
              Record new blood donations with donor name, blood group, units donated,
              and date of donation to update stock records
            </p>
            <Link to="/admin/add-donation" className="icon-link">
              Add »
            </Link>
          </div>

          <div className="feature col">
            <div className="feature-icon d-inline-flex align-items-center justify-content-center text-bg-danger bg-gradient fs-2 mb-3">
              <img
                src="/assets/requesticon.png"
                alt="Add Request Icon"
                style={{ width: "2em", height: "2em" }}
              />
            </div>
            <h3 className="fs-2 text-body-emphasis">Add Requests</h3>
            <p>
              Enter blood requests with recipient details, required blood group,
              quantity, and urgency level for smooth hospital coordination
            </p>
            <Link to="/admin/add-request" className="icon-link">
              Add »
            </Link>
          </div>

          <div className="feature col">
            <div className="feature-icon d-inline-flex align-items-center justify-content-center text-bg-danger bg-gradient fs-2 mb-3">
              <img
                src="/assets/admin.png"
                alt="Add Admin Icon"
                style={{ width: "2em", height: "2em" }}
              />
            </div>
            <h3 className="fs-2 text-body-emphasis">Add Admin</h3>
            <p>
              Create new admin accounts with secure credentials for authorized access
              to the system's full set of features and tools
            </p>
            <Link to="/admin/add-admin" className="icon-link">
              Add »
            </Link>
          </div>
        </div>

        {/* Row 2: 3 Features */}
        <div className="row g-4 py-5 row-cols-1 row-cols-md-3">
          <div className="feature col">
            <div className="feature-icon d-inline-flex align-items-center justify-content-center text-bg-danger bg-gradient fs-2 mb-3">
              <img
                src="/assets/donor.png"
                alt="Manage Donors Icon"
                style={{ width: "2em", height: "2em" }}
              />
            </div>
            <h3 className="fs-2 text-body-emphasis">Manage Donors</h3>
            <p>
              View and update donor records, search by name or blood group,
              and delete entries that are no longer relevant or valid
            </p>
            <Link to="/admin/manage-donors" className="icon-link">
              Manage »
            </Link>
          </div>

          <div className="feature col">
            <div className="feature-icon d-inline-flex align-items-center justify-content-center text-bg-danger bg-gradient fs-2 mb-3">
              <img
                src="/assets/recipient.png"
                alt="Manage Recipients Icon"
                style={{ width: "2em", height: "2em" }}
              />
            </div>
            <h3 className="fs-2 text-body-emphasis">Manage Recipients</h3>
            <p>
              View recipient details, track ongoing blood requests,
              and delete records after the request has been fulfilled or canceled
            </p>
            <Link to="/admin/manage-recipients" className="icon-link">
              Manage »
            </Link>
          </div>

          <div className="feature col">
            <div className="feature-icon d-inline-flex align-items-center justify-content-center text-bg-danger bg-gradient fs-2 mb-3">
              <img
                src="/assets/view.png"
                alt="View Blood Stock Icon"
                style={{ width: "2em", height: "2em" }}
              />
            </div>
            <h3 className="fs-2 text-body-emphasis">View Blood Stock</h3>
            <p>
              Display available units of each blood group in a clean format
              with visual indicators to monitor inventory health and levels
            </p>
            <Link to="/admin/bloodstock" className="icon-link">
              View »
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;

