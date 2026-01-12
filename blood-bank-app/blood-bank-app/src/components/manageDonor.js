import React, { useState, useEffect } from "react";
import AdminHeader from "./adminheader";

const ManageDonor = () => {
  const [donors, setDonors] = useState([]);
  const [donations, setDonations] = useState([]);
  const [donorSearchId, setDonorSearchId] = useState("");
  const [donationSearchId, setDonationSearchId] = useState("");
  const [viewResult, setViewResult] = useState(null);
  const [donorHistory, setDonorHistory] = useState([]);
  const [donorError, setDonorError] = useState("");
  const [donationDetails, setDonationDetails] = useState(null);
  const [donationError, setDonationError] = useState("");
  
  // Current admin's bank ID
  const [currentAdminBankId, setCurrentAdminBankId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Validation errors for each donor
  const [validationErrors, setValidationErrors] = useState({});
  
  // Success message state
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchCurrentAdminData = () => {
      try {
        // Get current admin's bank ID from localStorage/sessionStorage
        const adminData = localStorage.getItem('adminData') || 
                         localStorage.getItem('admin') || 
                         localStorage.getItem('user');
        
        if (adminData) {
          const parsedData = JSON.parse(adminData);
          const bankId = parsedData.bankId || parsedData.Bank_ID || parsedData.bank_id;
          setCurrentAdminBankId(bankId);
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
      }
    };

    fetchCurrentAdminData();
    
    const fetchDonors = async () => {
      try {
        const res = await fetch("http://localhost:5000/admin/manage-donors");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setDonors(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch donors", error);
        setDonors([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchDonations = async () => {
      try {
        const res = await fetch("http://localhost:5000/admin/donations");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setDonations(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch donations", error);
        setDonations([]);
      }
    };

    fetchDonors();
    fetchDonations();
  }, []);

  // Check if a donor belongs to the current admin's bank
  const isDonorInCurrentBank = (donorBankId) => {
    if (!currentAdminBankId) return false;
    return parseInt(donorBankId) === parseInt(currentAdminBankId);
  };

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const validateAddress = (address) => {
    return address.trim().length >= 5;
  };

  const validateBankId = (bankId) => {
    return bankId && !isNaN(bankId) && bankId > 0;
  };

  // Validate donor fields (only editable ones)
  const validateDonor = (donor, donorId) => {
    const errors = {};
    let isValid = true;

    // Contact Number validation
    if (!donor.Contact_Number || !validatePhone(donor.Contact_Number)) {
      errors.contactNumber = "Phone number must be exactly 10 digits";
      isValid = false;
    }

    // Email validation
    if (!donor.Email || !validateEmail(donor.Email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Address validation
    if (!donor.Address || !validateAddress(donor.Address)) {
      errors.address = "Address must be at least 5 characters";
      isValid = false;
    }

    // Bank ID validation - must stay in current admin's bank
    if (!donor.Bank_ID || !validateBankId(donor.Bank_ID)) {
      errors.bankId = "Please enter a valid bank ID";
      isValid = false;
    } else if (!isDonorInCurrentBank(donor.Bank_ID)) {
      errors.bankId = "You can only edit donors in your own bank";
      isValid = false;
    }

    return { isValid, errors };
  };

  const saveChanges = async (index) => {
    const donor = donors[index];
    const donorId = donor.Donor_ID;
    setSuccessMessage(""); // Clear previous success message
    
    // First check if donor belongs to current admin's bank
    if (!isDonorInCurrentBank(donor.Bank_ID)) {
      setSuccessMessage(`Cannot edit donor from other bank. This donor belongs to Bank ID: ${donor.Bank_ID}`);
      return;
    }
    
    // Validate the donor before saving
    const validation = validateDonor(donor, donorId);
    if (!validation.isValid) {
      // Set validation errors for this specific donor
      setValidationErrors(prev => ({
        ...prev,
        [donorId]: validation.errors
      }));
      
      // Scroll to the row with errors
      setTimeout(() => {
        const row = document.getElementById(`donor-row-${donorId}`);
        if (row) {
          row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      
      return; // Don't show alert, just show the inline errors
    }

    try {
      const response = await fetch(`http://localhost:5000/admin/update-donor/${donorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Contact_Number: donor.Contact_Number,
          Email: donor.Email,
          Address: donor.Address,
          Bank_ID: donor.Bank_ID,
        }),
      });
      
      if (!response.ok) {
        // Show error message instead of alert
        setSuccessMessage("Failed to update donor. Please try again.");
        return;
      }
      
      // Clear validation errors for this donor
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[donorId];
        return newErrors;
      });
      
      // Show success message
      setSuccessMessage(`Donor ID ${donorId} updated successfully!`);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      
    } catch (err) {
      setSuccessMessage("Failed to update donor. Please try again.");
    }
  };

  const handleCellChange = (index, field, value) => {
    const updatedDonors = [...donors];
    const donor = updatedDonors[index];
    const donorId = donor.Donor_ID;
    
    // Don't allow editing if donor is not in current admin's bank
    if (!isDonorInCurrentBank(donor.Bank_ID)) {
      return;
    }
    
    // Special handling for Bank_ID field
    if (field === "Bank_ID") {
      // Prevent changing bank ID to a different bank
      const newBankId = parseInt(value);
      if (newBankId !== parseInt(currentAdminBankId)) {
        setSuccessMessage("You can only assign donors to your own bank");
        return;
      }
    }
    
    updatedDonors[index][field] = value;
    setDonors(updatedDonors);
    
    // Clear validation error for this field when user edits
    if (validationErrors[donorId] && validationErrors[donorId][field.toLowerCase()]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        if (newErrors[donorId]) {
          delete newErrors[donorId][field.toLowerCase()];
        }
        return newErrors;
      });
    }
    
    // Clear success message when user starts editing
    if (successMessage) {
      setSuccessMessage("");
    }
  };

  const fetchDonorHistory = async (e) => {
    e.preventDefault();
    setDonorError("");
    setDonorHistory([]);

    try {
      const response = await fetch(`http://localhost:5000/admin/donor-history/${donorSearchId}`);
      if (!response.ok) throw new Error("Network error");

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        setDonorError(`Donor ID "${donorSearchId}" not found or no history available.`);
      } else {
        setDonorHistory(data);
      }
    } catch (error) {
      setDonorError("Failed to fetch donor history.");
    }
  };

  const handleViewDonationDetails = async (e) => {
    e.preventDefault();
    setDonationError("");
    setDonationDetails(null);

    try {
      const response = await fetch(`http://localhost:5000/admin/donation-details/${donationSearchId}`);
      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        setDonationError(`Donation ID "${donationSearchId}" not found.`);
      } else {
        setDonationDetails(data[0]);
      }
    } catch (error) {
      setDonationError("Failed to fetch donation details.");
    }
  };

  const handleViewAllDonors = () => {
    setViewResult(
      <div className="alert alert-success mt-3">
        Showing all donors.
      </div>
    );
  };

  const handleViewAllDonations = () => {
    setViewResult(
      <div className="alert alert-success mt-3">
        Showing all donations.
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <AdminHeader />
        <div className="container my-4">
          <div className="d-flex justify-content-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader />
      <div className="container my-4">
        <h2 className="mb-4">Manage Donors</h2>
        
        {/* Bank ID Info */}
        {currentAdminBankId && (
          <div className="alert alert-info mb-4">
            <strong>Your Bank ID:</strong> {currentAdminBankId} | 
            <em className="ms-2">You can view all donors but only edit those in your bank.</em>
          </div>
        )}
        
        {!currentAdminBankId && (
          <div className="alert alert-warning mb-4">
            <strong>Note:</strong> Cannot determine your bank ID. You may only be able to view data.
          </div>
        )}

        {/* Success Message Display */}
        {successMessage && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <div className="d-flex align-items-center">
              <i className="bi bi-check-circle-fill me-2"></i>
              <span>{successMessage}</span>
            </div>
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setSuccessMessage("")}
              aria-label="Close"
            ></button>
          </div>
        )}

        {/* View Donation History by Donor ID */}
        <div className="mb-4">
          <h5>View Donation History by Donor ID</h5>
          <form className="row g-2" onSubmit={fetchDonorHistory}>
            <div className="col-sm-6">
              <input
                type="text"
                className="form-control"
                placeholder="Enter Donor ID"
                value={donorSearchId}
                onChange={(e) => setDonorSearchId(e.target.value)}
              />
            </div>
            <div className="col-auto">
              <button className="btn btn-primary" type="submit">
                View
              </button>
            </div>
          </form>

          {/* Error Message */}
          {donorError && (
            <div className="alert alert-danger alert-dismissible fade show mt-3" role="alert">
              <div className="d-flex align-items-center">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <span>{donorError}</span>
              </div>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setDonorError("")}
                aria-label="Close"
              ></button>
            </div>
          )}

          {/* Success - Donor History */}
          {donorHistory.length > 0 && !donorError && (
            <div className="alert alert-info mt-3">
              <h5>Donation History for {donorHistory[0]?.Full_Name}</h5>
              <p><strong>Blood Group:</strong> {donorHistory[0]?.Blood_Group}</p>
              <h6>Donation Dates:</h6>
              <ul>
                {donorHistory.map((record, i) => (
                  <li key={i}>{new Date(record.Donation_Date).toLocaleDateString()}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* All Donors Table */}
        <div className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">All Donors</h5>
            <button className="btn btn-success" onClick={handleViewAllDonors}>
              View All Donors
            </button>
          </div>
          <div className="table-responsive">
            <table className="table table-bordered" id="donorTable">
              <thead>
                <tr>
                  <th>Donor ID</th>
                  <th>Full Name</th>
                  <th>Gender</th>
                  <th>Blood Group</th>
                  <th>Contact Number</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Bank ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {donors && donors.length > 0 ? (
                  donors.map((donor, index) => {
                    const donorId = donor.Donor_ID;
                    const donorBankId = donor.Bank_ID;
                    const canEdit = isDonorInCurrentBank(donorBankId);
                    const errors = validationErrors[donorId] || {};
                    
                    return (
                      <tr 
                        key={donorId} 
                        id={`donor-row-${donorId}`}
                        className={!canEdit ? "table-secondary" : Object.keys(errors).length > 0 ? "table-warning" : ""}
                        style={!canEdit ? { opacity: 0.8 } : {}}
                      >
                        <td>{donorId}</td>
                        <td>{donor.Full_Name}</td>
                        
                        {/* Gender (Non-editable) */}
                        <td>{donor.Gender}</td>
                        
                        {/* Blood Group (Non-editable) */}
                        <td>{donor.Blood_Group}</td>
                        
                        {/* Contact Number (Conditionally Editable) */}
                        <td>
                          {canEdit ? (
                            <div>
                              <input
                                type="tel"
                                className={`form-control form-control-sm ${errors.contactNumber ? 'is-invalid' : ''}`}
                                value={donor.Contact_Number || ''}
                                onChange={(e) => handleCellChange(index, "Contact_Number", e.target.value)}
                                maxLength="10"
                              />
                              {errors.contactNumber && (
                                <div className="invalid-feedback d-block small">{errors.contactNumber}</div>
                              )}
                              <small className="form-text text-muted">10 digits only</small>
                            </div>
                          ) : (
                            <span className="text-muted">{donor.Contact_Number || 'N/A'}</span>
                          )}
                        </td>
                        
                        {/* Email (Conditionally Editable) */}
                        <td>
                          {canEdit ? (
                            <div>
                              <input
                                type="email"
                                className={`form-control form-control-sm ${errors.email ? 'is-invalid' : ''}`}
                                value={donor.Email || ''}
                                onChange={(e) => handleCellChange(index, "Email", e.target.value)}
                              />
                              {errors.email && (
                                <div className="invalid-feedback d-block small">{errors.email}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted">{donor.Email || 'N/A'}</span>
                          )}
                        </td>
                        
                        {/* Address (Conditionally Editable) */}
                        <td>
                          {canEdit ? (
                            <div>
                              <textarea
                                className={`form-control form-control-sm ${errors.address ? 'is-invalid' : ''}`}
                                value={donor.Address || ''}
                                onChange={(e) => handleCellChange(index, "Address", e.target.value)}
                                rows="2"
                              />
                              {errors.address && (
                                <div className="invalid-feedback d-block small">{errors.address}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted">{donor.Address || 'N/A'}</span>
                          )}
                        </td>
                        
                        {/* Bank ID (Conditionally Editable) */}
                        <td>
                          {canEdit ? (
                            <div>
                              <input
                                type="number"
                                className={`form-control form-control-sm ${errors.bankId ? 'is-invalid' : ''}`}
                                value={donor.Bank_ID || ''}
                                onChange={(e) => handleCellChange(index, "Bank_ID", e.target.value)}
                                min="1"
                              />
                              {errors.bankId && (
                                <div className="invalid-feedback d-block small">{errors.bankId}</div>
                              )}
                            </div>
                          ) : (
                            <div>
                              <span>{donor.Bank_ID || 'N/A'}</span>
                              {!canEdit && currentAdminBankId && (
                                <div className="small text-warning">
                                  <i className="bi bi-info-circle me-1"></i>
                                  Different bank
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        
                        {/* Actions */}
                        <td>
                          {canEdit ? (
                            <button
                              className="btn btn-warning btn-sm"
                              onClick={() => saveChanges(index)}
                            >
                              Save
                            </button>
                          ) : (
                            <span className="text-muted small">
                              <i className="bi bi-eye me-1"></i>
                              View only
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center">
                      No donors found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* All Donations Table */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">All Donations</h5>
            <button className="btn btn-success" onClick={handleViewAllDonations}>
              View All Donations
            </button>
          </div>
          <div className="table-responsive">
            <table className="table table-bordered" id="donationTable">
              <thead>
                <tr>
                  <th>Donation ID</th>
                  <th>Donor ID</th>
                  <th>Donor Name</th>
                  <th>Blood Group</th>
                  <th>Donation Date</th>
                  <th>Blood Units</th>
                  <th>Bank ID</th>
                  <th>Admin ID (Collected By)</th>
                </tr>
              </thead>
              <tbody>
                {donations && donations.length > 0 ? (
                  donations.map((donation) => (
                    <tr 
                      key={donation.Donation_ID}
                      className={isDonorInCurrentBank(donation.Bank_ID) ? "" : "table-secondary"}
                      style={isDonorInCurrentBank(donation.Bank_ID) ? {} : { opacity: 0.8 }}
                    >
                      <td>{donation.Donation_ID}</td>
                      <td>{donation.Donor_ID}</td>
                      <td>{donation.Full_Name}</td>
                      <td>{donation.Blood_Group}</td>
                      <td>{donation.Donation_Date ? new Date(donation.Donation_Date).toLocaleDateString() : 'N/A'}</td>
                      <td>{donation.Blood_Units || 0}</td>
                      <td>
                        {donation.Bank_ID || 'N/A'}
                        {!isDonorInCurrentBank(donation.Bank_ID) && currentAdminBankId && (
                          <div className="small text-warning">
                            <i className="bi bi-info-circle me-1"></i>
                            Different bank
                          </div>
                        )}
                      </td>
                      <td>{donation.Collected_By}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No donations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic View Result */}
        {viewResult && (
          <div className="mt-4">
            {viewResult}
          </div>
        )}
      </div>
    </>
  );
};

export default ManageDonor;