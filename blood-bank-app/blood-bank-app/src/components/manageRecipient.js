import React, { useState, useEffect } from "react";
import AdminHeader from "./adminheader";

const ManageRecipient = () => {
  const [recipients, setRecipients] = useState([]);
  const [requests, setRequests] = useState([]);
  const [recipientSearchId, setRecipientSearchId] = useState("");
  const [requestSearchId, setRequestSearchId] = useState("");
  const [viewResult, setViewResult] = useState(null);
  const [recipientHistory, setRecipientHistory] = useState([]);
  const [recipientError, setRecipientError] = useState("");
  const [requestDetails, setRequestDetails] = useState(null);
  const [requestError, setRequestError] = useState("");
  
  // Current admin's bank ID
  const [currentAdminBankId, setCurrentAdminBankId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Validation errors for each recipient
  const [validationErrors, setValidationErrors] = useState({});
  // Status update success message
  const [statusMessage, setStatusMessage] = useState("");
  
  // Success message state
  const [successMessage, setSuccessMessage] = useState("");
  
  // Track original status for each request
  const [originalStatuses, setOriginalStatuses] = useState({});

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
    
    const fetchRecipients = async () => {
      try {
        const res = await fetch("http://localhost:5000/admin/manage-recipients");
        const data = await res.json();
        setRecipients(data);
      } catch (error) {
        console.error("Failed to fetch recipients", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchRequests = async () => {
      try {
        const res = await fetch("http://localhost:5000/admin/requests");
        const data = await res.json();
        // Sort requests by Request_ID in ascending order (oldest to newest)
        const sortedRequests = Array.isArray(data) 
          ? [...data].sort((a, b) => a.Request_ID - b.Request_ID)
          : [];
        setRequests(sortedRequests);
        
        // Store original statuses
        const statusMap = {};
        sortedRequests.forEach(request => {
          statusMap[request.Request_ID] = request.Request_Status || "Pending";
        });
        setOriginalStatuses(statusMap);
      } catch (error) {
        console.error("Failed to fetch requests", error);
      }
    };

    fetchRecipients();
    fetchRequests();
  }, []);

  // Check if a recipient belongs to the current admin's bank
  const isRecipientInCurrentBank = (recipientBankId) => {
    if (!currentAdminBankId) return false;
    return parseInt(recipientBankId) === parseInt(currentAdminBankId);
  };

  // Check if a request belongs to the current admin's bank
  const isRequestInCurrentBank = (requestBankId) => {
    if (!currentAdminBankId) return false;
    return parseInt(requestBankId) === parseInt(currentAdminBankId);
  };

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-z]{2,}$/;
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

  // Validate recipient fields (only editable ones)
  const validateRecipient = (recipient, recipientId) => {
    const errors = {};
    let isValid = true;

    // Contact Number validation
    if (!recipient.Contact_Number || !validatePhone(recipient.Contact_Number)) {
      errors.contactNumber = "Phone number must be exactly 10 digits";
      isValid = false;
    }

    // Email validation
    if (!recipient.Email || !validateEmail(recipient.Email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Address validation
    if (!recipient.Address || !validateAddress(recipient.Address)) {
      errors.address = "Address must be at least 5 characters";
      isValid = false;
    }

    // Bank ID validation - must stay in current admin's bank
    if (!recipient.Bank_ID || !validateBankId(recipient.Bank_ID)) {
      errors.bankId = "Please enter a valid bank ID";
      isValid = false;
    } else if (!isRecipientInCurrentBank(recipient.Bank_ID)) {
      errors.bankId = "You can only edit recipients in your own bank";
      isValid = false;
    }

    return { isValid, errors };
  };

  // Save updated recipient info
  const saveChanges = async (index) => {
    const recipient = recipients[index];
    const recipientId = recipient.Recipient_ID;
    setSuccessMessage(""); // Clear previous success message
    
    // First check if recipient belongs to current admin's bank
    if (!isRecipientInCurrentBank(recipient.Bank_ID)) {
      setSuccessMessage(`Cannot edit recipient from other bank. This recipient belongs to Bank ID: ${recipient.Bank_ID}`);
      return;
    }
    
    // Validate the recipient before saving
    const validation = validateRecipient(recipient, recipientId);
    if (!validation.isValid) {
      // Set validation errors for this specific recipient
      setValidationErrors(prev => ({
        ...prev,
        [recipientId]: validation.errors
      }));
      
      // Scroll to the row with errors
      setTimeout(() => {
        const row = document.getElementById(`recipient-row-${recipientId}`);
        if (row) {
          row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      
      return; // Don't show alert, just show the inline errors
    }

    try {
      const response = await fetch(
        `http://localhost:5000/admin/update-recipient/${recipientId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Contact_Number: recipient.Contact_Number,
            Email: recipient.Email,
            Address: recipient.Address,
            Bank_ID: recipient.Bank_ID,
          }),
        }
      );
      
      if (!response.ok) {
        // Show error message instead of alert
        setSuccessMessage("Failed to update recipient. Please try again.");
        return;
      }
      
      // Clear validation errors for this recipient
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[recipientId];
        return newErrors;
      });
      
      // Show success message
      setSuccessMessage(`Recipient ID ${recipientId} updated successfully!`);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      
    } catch (err) {
      setSuccessMessage("Failed to update recipient. Please try again.");
    }
  };

  // Save updated request status (only for pending requests in admin's bank)
  const saveRequestStatus = async (index) => {
    const request = requests[index];
    const requestId = request.Request_ID;
    const requestBankId = request.Bank_ID;
    const newStatus = request.Request_Status || "Pending";
    const originalStatus = originalStatuses[requestId] || "Pending";
    
    setStatusMessage("");
    
    // Check if request belongs to current admin's bank
    if (!isRequestInCurrentBank(requestBankId)) {
      setStatusMessage(`Cannot update request from other bank. This request belongs to Bank ID: ${requestBankId}`);
      return;
    }
    
    // Check if status has actually changed
    if (newStatus === originalStatus) {
      setStatusMessage(`Status is already "${newStatus}". No changes made.`);
      return;
    }
    
    // Only allow updating from "Pending" to "Completed" or "Rejected"
    if (originalStatus !== "Pending") {
      setStatusMessage(`Cannot update status from "${originalStatus}". Only pending requests can be updated.`);
      return;
    }
    
    if (newStatus === "Pending") {
      setStatusMessage("Please select a new status (Completed or Rejected).");
      return;
    }
    
    try {
      console.log("Updating status for request ID:", requestId);
      console.log("Original status:", originalStatus);
      console.log("New status:", newStatus);
      
      const response = await fetch(
        `http://localhost:5000/admin/update-request-status/${requestId}`,
        {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            Request_Status: newStatus,
          }),
        }
      );
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Update failed with response:", errorText);
        setStatusMessage(`Failed to update request status. Server error: ${response.status}`);
        return;
      }
      
      const result = await response.json();
      console.log("Update successful:", result);
      
      // Update original statuses
      setOriginalStatuses(prev => ({
        ...prev,
        [requestId]: newStatus
      }));
      
      // Refresh the requests to get updated data from database
      const refreshRes = await fetch("http://localhost:5000/admin/requests");
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        const sortedRequests = Array.isArray(refreshData) 
          ? [...refreshData].sort((a, b) => a.Request_ID - b.Request_ID)
          : [];
        setRequests(sortedRequests);
        
        // Update original statuses again after refresh
        const newStatusMap = {};
        sortedRequests.forEach(req => {
          newStatusMap[req.Request_ID] = req.Request_Status || "Pending";
        });
        setOriginalStatuses(newStatusMap);
      }
      
      // Show success message
      setStatusMessage(`✓ Request ID ${requestId} status updated from "${originalStatus}" to "${newStatus}"!`);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setStatusMessage("");
      }, 5000);
      
    } catch (err) {
      console.error("Update error:", err);
      setStatusMessage("Failed to update request status. Please check console for details.");
    }
  };

  // Editable table cell handler for recipients
  const handleCellChange = (index, field, value) => {
    const updatedRecipients = [...recipients];
    const recipient = updatedRecipients[index];
    const recipientId = recipient.Recipient_ID;
    
    // Don't allow editing if recipient is not in current admin's bank
    if (!isRecipientInCurrentBank(recipient.Bank_ID)) {
      return;
    }
    
    // Special handling for Bank_ID field
    if (field === "Bank_ID") {
      // Prevent changing bank ID to a different bank
      const newBankId = parseInt(value);
      if (newBankId !== parseInt(currentAdminBankId)) {
        setSuccessMessage("You can only assign recipients to your own bank");
        return;
      }
    }
    
    updatedRecipients[index][field] = value;
    setRecipients(updatedRecipients);
    
    // Clear validation error for this field when user edits
    if (validationErrors[recipientId] && validationErrors[recipientId][field.toLowerCase()]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        if (newErrors[recipientId]) {
          delete newErrors[recipientId][field.toLowerCase()];
        }
        return newErrors;
      });
    }
    
    // Clear success message when user starts editing
    if (successMessage) {
      setSuccessMessage("");
    }
  };

  // Handle request status change (only for pending requests in admin's bank)
  const handleRequestStatusChange = (index, value) => {
    const updatedRequests = [...requests];
    const requestId = updatedRequests[index].Request_ID;
    const requestBankId = updatedRequests[index].Bank_ID;
    const originalStatus = originalStatuses[requestId] || "Pending";
    
    // Only allow changes if:
    // 1. Request belongs to admin's bank
    // 2. Original status is "Pending"
    if (isRequestInCurrentBank(requestBankId) && originalStatus === "Pending") {
      updatedRequests[index].Request_Status = value;
      setRequests(updatedRequests);
    }
    
    // Clear status message when user starts editing
    if (statusMessage) {
      setStatusMessage("");
    }
  };

  // Recipient request history
  const fetchRecipientHistory = async (e) => {
    e.preventDefault();
    setRecipientError("");
    setRecipientHistory([]);

    try {
      const response = await fetch(
        `http://localhost:5000/admin/recipient-history/${recipientSearchId}`
      );
      if (!response.ok) throw new Error("Network error");

      const data = await response.json();

      if (data.length === 0) {
        setRecipientError(`Recipient ID "${recipientSearchId}" not found.`);
      } else {
        setRecipientHistory(data);
      }
    } catch (error) {
      setRecipientError("Failed to fetch recipient history.");
    }
  };

  // Request details by Request ID
  const handleViewRequestDetails = async (e) => {
    e.preventDefault();
    setRequestError("");
    setRequestDetails(null);

    try {
      const response = await fetch(
        `http://localhost:5000/admin/request-details/${requestSearchId}`
      );
      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();

      if (data.length === 0) {
        setRequestError(`Request ID "${requestSearchId}" not found.`);
      } else {
        setRequestDetails(data[0]); // expecting one record
      }
    } catch (error) {
      setRequestError("Failed to fetch request details.");
    }
  };

  const handleViewAllRecipients = () => {
    setViewResult(<div className="alert alert-success mt-3">Showing all recipients.</div>);
  };

  const handleViewAllRequests = () => {
    setViewResult(<div className="alert alert-success mt-3">Showing all requests.</div>);
  };

  // Status options (only for pending requests in admin's bank - they can become Completed or Rejected)
  const getStatusOptions = (requestId, requestBankId) => {
    const originalStatus = originalStatuses[requestId] || "Pending";
    
    // Check if request belongs to admin's bank AND is pending
    if (isRequestInCurrentBank(requestBankId) && originalStatus === "Pending") {
      return ["Pending", "Completed", "Rejected"];
    }
    // For non-pending statuses or requests from other banks, return only the current status (locked)
    return [originalStatus];
  };

  // Check if status field should be editable
  const isStatusEditable = (requestId, requestBankId) => {
    const originalStatus = originalStatuses[requestId] || "Pending";
    return isRequestInCurrentBank(requestBankId) && originalStatus === "Pending";
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
        <h2 className="mb-4">Manage Recipients</h2>
        
        {/* Bank ID Info */}
        {currentAdminBankId && (
          <div className="alert alert-info mb-4">
            <strong>Your Bank ID:</strong> {currentAdminBankId} | 
            <em className="ms-2">You can view all recipients/requests but only edit those in your bank.</em>
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

        {/* Status Update Message Display */}
        {statusMessage && (
          <div className="alert alert-info alert-dismissible fade show" role="alert">
            <div className="d-flex align-items-center">
              <i className="bi bi-info-circle-fill me-2"></i>
              <span>{statusMessage}</span>
            </div>
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setStatusMessage("")}
              aria-label="Close"
            ></button>
          </div>
        )}

        {/* View Request History by Recipient ID */}
        <div className="mb-4">
          <h5>View Request History by Recipient ID</h5>
          <form className="row g-2" onSubmit={fetchRecipientHistory}>
            <div className="col-sm-6">
              <input
                type="text"
                className="form-control"
                placeholder="Enter Recipient ID"
                value={recipientSearchId}
                onChange={(e) => setRecipientSearchId(e.target.value)}
              />
            </div>
            <div className="col-auto">
              <button className="btn btn-primary" type="submit">
                View
              </button>
            </div>
          </form>

          {/* Error Message */}
          {recipientError && (
            <div className="alert alert-danger alert-dismissible fade show mt-3" role="alert">
              <div className="d-flex align-items-center">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <span>{recipientError}</span>
              </div>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setRecipientError("")}
                aria-label="Close"
              ></button>
            </div>
          )}

          {/* Success - Request History */}
          {recipientHistory.length > 0 && !recipientError && (
            <div className="alert alert-info mt-3">
              <h5>Request History for {recipientHistory[0]?.Full_Name}</h5>
              <p>
                <strong>Age:</strong> {recipientHistory[0]?.Age}
              </p>
              <p>
                <strong>Blood Group:</strong> {recipientHistory[0]?.Blood_Group}
              </p>
              <h6>Requests:</h6>
              <ul>
                {recipientHistory.map((record, i) => (
                  <li key={i}>
                    Date: {new Date(record.Request_Date).toLocaleDateString()}, Blood Group:{" "}
                    {record.Requested_Blood_Group}, Units: {record.Units}, Status: {record.Request_Status}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* All Recipients Table */}
        <div className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">All Recipients</h5>
            <button className="btn btn-success" onClick={handleViewAllRecipients}>
              View All Recipients
            </button>
          </div>
          <div className="table-responsive">
            <table className="table table-bordered" id="recipientTable">
              <thead>
                <tr>
                  <th>Recipient ID</th>
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
                {recipients.map((recipient, index) => {
                  const recipientId = recipient.Recipient_ID;
                  const recipientBankId = recipient.Bank_ID;
                  const canEdit = isRecipientInCurrentBank(recipientBankId);
                  const errors = validationErrors[recipientId] || {};
                  
                  return (
                    <tr 
                      key={recipientId} 
                      id={`recipient-row-${recipientId}`} 
                      className={!canEdit ? "table-secondary" : Object.keys(errors).length > 0 ? "table-warning" : ""}
                      style={!canEdit ? { opacity: 0.8 } : {}}
                    >
                      <td>{recipientId}</td>
                      <td>{recipient.Full_Name}</td>
                      <td>{recipient.Gender}</td>
                      <td>{recipient.Blood_Group}</td>
                      
                      {/* Contact Number (Conditionally Editable) */}
                      <td>
                        {canEdit ? (
                          <div>
                            <input
                              type="tel"
                              className={`form-control form-control-sm ${errors.contactNumber ? 'is-invalid' : ''}`}
                              value={recipient.Contact_Number || ''}
                              onChange={(e) => handleCellChange(index, "Contact_Number", e.target.value)}
                              maxLength="10"
                            />
                            {errors.contactNumber && (
                              <div className="invalid-feedback d-block small">{errors.contactNumber}</div>
                            )}
                            <small className="form-text text-muted">10 digits only</small>
                          </div>
                        ) : (
                          <span className="text-muted">{recipient.Contact_Number || 'N/A'}</span>
                        )}
                      </td>
                      
                      {/* Email (Conditionally Editable) */}
                      <td>
                        {canEdit ? (
                          <div>
                            <input
                              type="email"
                              className={`form-control form-control-sm ${errors.email ? 'is-invalid' : ''}`}
                              value={recipient.Email || ''}
                              onChange={(e) => handleCellChange(index, "Email", e.target.value)}
                            />
                            {errors.email && (
                              <div className="invalid-feedback d-block small">{errors.email}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted">{recipient.Email || 'N/A'}</span>
                        )}
                      </td>
                      
                      {/* Address (Conditionally Editable) */}
                      <td>
                        {canEdit ? (
                          <div>
                            <textarea
                              className={`form-control form-control-sm ${errors.address ? 'is-invalid' : ''}`}
                              value={recipient.Address || ''}
                              onChange={(e) => handleCellChange(index, "Address", e.target.value)}
                              rows="2"
                            />
                            {errors.address && (
                              <div className="invalid-feedback d-block small">{errors.address}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted">{recipient.Address || 'N/A'}</span>
                        )}
                      </td>
                      
                      {/* Bank ID (Conditionally Editable) */}
                      <td>
                        {canEdit ? (
                          <div>
                            <input
                              type="number"
                              className={`form-control form-control-sm ${errors.bankId ? 'is-invalid' : ''}`}
                              value={recipient.Bank_ID || ''}
                              onChange={(e) => handleCellChange(index, "Bank_ID", e.target.value)}
                              min="1"
                            />
                            {errors.bankId && (
                              <div className="invalid-feedback d-block small">{errors.bankId}</div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <span>{recipient.Bank_ID || 'N/A'}</span>
                            {!canEdit && currentAdminBankId && (
                              <div className="small text-warning">
                                <i className="bi bi-info-circle me-1"></i>
                                Different bank
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      
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
                })}

                {recipients.length === 0 && (
                  <tr>
                    <td colSpan="10" className="text-center">
                      No recipients found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* All Requests Table */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">All Blood Requests</h5>
            <button className="btn btn-success" onClick={handleViewAllRequests}>
              View All Requests
            </button>
          </div>
          <div className="table-responsive">
            <table className="table table-bordered" id="requestTable">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Recipient Name</th>
                  <th>Requested Blood Group</th>
                  <th>Request Date</th>
                  <th>Units</th>
                  <th>Bank ID</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request, index) => {
                  const requestId = request.Request_ID;
                  const requestBankId = request.Bank_ID;
                  const currentStatus = request.Request_Status || "Pending";
                  const originalStatus = originalStatuses[requestId] || "Pending";
                  const belongsToCurrentBank = isRequestInCurrentBank(requestBankId);
                  const isEditable = belongsToCurrentBank && originalStatus === "Pending";
                  const statusOptions = getStatusOptions(requestId, requestBankId);
                  
                  return (
                    <tr 
                      key={requestId}
                      className={!belongsToCurrentBank ? "table-secondary" : ""}
                      style={!belongsToCurrentBank ? { opacity: 0.8 } : {}}
                    >
                      <td>{requestId}</td>
                      <td>{request.Full_Name}</td>
                      <td>{request.Blood_Group || request.Requested_Blood_Group}</td>
                      <td>{request.Request_Date ? new Date(request.Request_Date).toLocaleDateString() : 'N/A'}</td>
                      <td>{request.Units}</td>
                      <td>
                        {requestBankId || 'N/A'}
                        {!belongsToCurrentBank && currentAdminBankId && (
                          <div className="small text-warning">
                            <i className="bi bi-info-circle me-1"></i>
                            Different bank
                          </div>
                        )}
                      </td>
                      <td>
                        <div>
                          {isEditable ? (
                            <select
                              className="form-select form-select-sm"
                              value={currentStatus}
                              onChange={(e) => handleRequestStatusChange(index, e.target.value)}
                            >
                              {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className={`badge ${
                              currentStatus === "Completed" ? "bg-success" : 
                              currentStatus === "Rejected" ? "bg-danger" : 
                              "bg-secondary"
                            }`}>
                              {currentStatus}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        {isEditable ? (
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => saveRequestStatus(index)}
                            disabled={currentStatus === "Pending"}
                          >
                            Update Status
                          </button>
                        ) : (
                          <button
                            className="btn btn-secondary btn-sm"
                            disabled
                            title={!belongsToCurrentBank ? 
                              "Cannot update requests from other banks" : 
                              "Only pending requests can be updated"}
                          >
                            {!belongsToCurrentBank ? "Different Bank" : "Locked"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {requests.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic View Result */}
        {viewResult && <div className="mt-4">{viewResult}</div>}
      </div>
    </>
  );
};

export default ManageRecipient;