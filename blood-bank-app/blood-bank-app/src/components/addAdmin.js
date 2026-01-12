import React, { useState, useEffect } from "react";
import AdminHeader from "./adminheader";

const AddAdmin = () => {
  // Role options for dropdown
  const ROLE_OPTIONS = [
    "Assistant Manager",
    "Manager",
    "Account Manager",
    "Support Staff"
  ];

  // State for current admin's bank ID
  const [currentAdminBankId, setCurrentAdminBankId] = useState("");

  // Initial form data state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    contactNumber: "",
    roleName: "",
    username: "",
    password: "",
    bankId: "", // This will be auto-filled
  });

  // Validation errors state
  const [formErrors, setFormErrors] = useState({
    fullName: "",
    email: "",
    contactNumber: "",
    roleName: "",
    username: "",
    password: "",
    // Remove bankId from errors since it's auto-filled
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch current admin's bank ID when component mounts
  useEffect(() => {
    const fetchCurrentAdminData = () => {
      try {
        // Method 1: Get from localStorage (adjust key name based on your login implementation)
        const adminData = localStorage.getItem('adminData') || 
                         localStorage.getItem('admin') || 
                         localStorage.getItem('user');
        
        if (adminData) {
          const parsedData = JSON.parse(adminData);
          const bankId = parsedData.bankId || parsedData.Bank_ID || parsedData.bank_id;
          
          if (bankId) {
            setCurrentAdminBankId(bankId.toString());
            // Auto-fill the form's bankId field
            setFormData(prev => ({
              ...prev,
              bankId: bankId.toString()
            }));
          }
        }
        
        // Method 2: If not in localStorage, check sessionStorage
        if (!adminData) {
          const sessionData = sessionStorage.getItem('adminData');
          if (sessionData) {
            const parsedData = JSON.parse(sessionData);
            const bankId = parsedData.bankId || parsedData.Bank_ID || parsedData.bank_id;
            
            if (bankId) {
              setCurrentAdminBankId(bankId.toString());
              setFormData(prev => ({
                ...prev,
                bankId: bankId.toString()
              }));
            }
          }
        }
        
        // Method 3: If still not found, make an API call to get current admin info
        // This is a fallback - you should implement this if needed
        const fetchAdminFromAPI = async () => {
          try {
            const response = await fetch("http://localhost:5000/admin/current", {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                // Add authorization if needed
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              const bankId = data.bankId || data.Bank_ID || data.bank_id;
              if (bankId) {
                setCurrentAdminBankId(bankId.toString());
                setFormData(prev => ({
                  ...prev,
                  bankId: bankId.toString()
                }));
              }
            }
          } catch (error) {
            console.error("Error fetching admin from API:", error);
          }
        };
        
        // Only call API if not found in storage
        if (!currentAdminBankId) {
          fetchAdminFromAPI();
        }
        
      } catch (error) {
        console.error("Error parsing admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentAdminData();
  }, []);

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const validateUsername = (username) => {
    return username.length >= 6;
  };

  const validatePassword = (password) => {
    const hasMinimumLength = password.length >= 6;
    const hasNumber = /\d/.test(password);
    return hasMinimumLength && hasNumber;
  };

  const validateFullName = (name) => {
    return name.trim().length >= 2;
  };

  // Validate entire form - REMOVE bankId validation
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Full Name validation
    if (!validateFullName(formData.fullName)) {
      errors.fullName = "Full name must be at least 2 characters";
      isValid = false;
    }

    // Email validation
    if (!formData.email || !validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Contact number validation
    if (!formData.contactNumber || !validatePhone(formData.contactNumber)) {
      errors.contactNumber = "Phone number must be exactly 10 digits";
      isValid = false;
    }

    // Role validation
    if (!formData.roleName || !ROLE_OPTIONS.includes(formData.roleName)) {
      errors.roleName = "Please select a valid role";
      isValid = false;
    }

    // Username validation
    if (!formData.username || !validateUsername(formData.username)) {
      errors.username = "Username must be at least 6 characters";
      isValid = false;
    }

    // Password validation
    if (!formData.password || !validatePassword(formData.password)) {
      errors.password = "Password must be at least 6 characters with at least 1 number";
      isValid = false;
    }

    // Bank ID is auto-filled, no validation needed
    // But ensure it exists
    if (!formData.bankId) {
      isValid = false;
      // Don't show error to user - this is a system issue
    }

    return { isValid, errors };
  };

  // Controlled inputs for add-admin form
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Don't allow changing bankId if it's the current admin's bank ID
    if (name === "bankId" && currentAdminBankId) {
      return; // Prevent modification
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Submit add-admin form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if we have the current admin's bank ID
    if (!currentAdminBankId) {
      alert("Cannot determine your bank ID. Please make sure you're logged in properly.");
      return;
    }
    
    // Validate form
    const validation = validateForm();
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/admin/add-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || data.error || "Failed to add admin.");
        return;
      }

      setSuccessMessage(`Admin added successfully to Bank ID: ${currentAdminBankId}. New Admin ID: ${data.adminId || data.admin_id || 'N/A'}`);

      // Reset form (except bankId)
      setFormData({
        fullName: "",
        email: "",
        contactNumber: "",
        roleName: "",
        username: "",
        password: "",
        bankId: currentAdminBankId, // Keep bankId filled
      });

      // Clear errors
      setFormErrors({});

    } catch (error) {
      console.error("Error adding admin:", error);
      alert("An error occurred. Please try again.");
    }
  };

  if (loading) {
    return (
      <>
        <AdminHeader />
        <div className="p-4">
          <div className="d-flex justify-content-center">
            <div className="spinner-border text-danger" role="status">
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
      <div className="p-4">
        <h2 className="text-dark mb-4">Add New Admin</h2>
        
        {!currentAdminBankId && (
          <div className="alert alert-warning mb-4">
            <strong>Warning:</strong> Cannot determine your bank ID. You may not be logged in properly.
          </div>
        )}
        
        {currentAdminBankId && (
          <div className="alert alert-info mb-4">
            <strong>Note:</strong> New admin will be added to your bank (Bank ID: {currentAdminBankId})
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            {/* Full Name Field */}
            <div className="col-md-6">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className={`form-control ${formErrors.fullName ? 'is-invalid' : ''}`}
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                disabled={!currentAdminBankId}
              />
              {formErrors.fullName && (
                <div className="invalid-feedback">{formErrors.fullName}</div>
              )}
            </div>

            {/* Email Field */}
            <div className="col-md-6">
              <label className="form-label">Email *</label>
              <input
                type="email"
                className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="example@domain.com"
                disabled={!currentAdminBankId}
              />
              {formErrors.email && (
                <div className="invalid-feedback">{formErrors.email}</div>
              )}
            </div>

            {/* Contact Number Field */}
            <div className="col-md-6">
              <label className="form-label">Contact Number *</label>
              <input
                type="tel"
                className={`form-control ${formErrors.contactNumber ? 'is-invalid' : ''}`}
                name="contactNumber"
                required
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="10-digit number"
                maxLength="10"
                disabled={!currentAdminBankId}
              />
              {formErrors.contactNumber && (
                <div className="invalid-feedback">{formErrors.contactNumber}</div>
              )}
            </div>

            {/* Role Field - Dropdown */}
            <div className="col-md-6">
              <label className="form-label">Role *</label>
              <select
                className={`form-select ${formErrors.roleName ? 'is-invalid' : ''}`}
                name="roleName"
                required
                value={formData.roleName}
                onChange={handleChange}
                disabled={!currentAdminBankId}
              >
                <option value="">Select a role</option>
                {ROLE_OPTIONS.map((role, index) => (
                  <option key={index} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              {formErrors.roleName && (
                <div className="invalid-feedback">{formErrors.roleName}</div>
              )}
            </div>

            {/* Username Field */}
            <div className="col-md-6">
              <label className="form-label">Username *</label>
              <input
                type="text"
                className={`form-control ${formErrors.username ? 'is-invalid' : ''}`}
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                minLength="6"
                disabled={!currentAdminBankId}
              />
              {formErrors.username && (
                <div className="invalid-feedback">{formErrors.username}</div>
              )}
              <small className="form-text text-muted">Minimum 6 characters</small>
            </div>

            {/* Password Field */}
            <div className="col-md-6">
              <label className="form-label">Password *</label>
              <input
                type="password"
                className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                minLength="6"
                disabled={!currentAdminBankId}
              />
              {formErrors.password && (
                <div className="invalid-feedback">{formErrors.password}</div>
              )}
              <small className="form-text text-muted">
                Minimum 6 characters with at least 1 number
              </small>
            </div>

            {/* Bank ID Field - READ ONLY */}
            <div className="col-md-6">
              <label className="form-label">Bank ID *</label>
              <input
                type="text"
                className="form-control bg-light"
                name="bankId"
                value={formData.bankId || currentAdminBankId || "Not available"}
                readOnly
                disabled
              />
              <small className="form-text text-muted">
                Auto-filled with your bank ID
              </small>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-danger mt-3"
            disabled={!currentAdminBankId}
          >
            {currentAdminBankId ? "Add Admin" : "Cannot Add Admin - No Bank ID"}
          </button>
        </form>

        {successMessage && (
          <div className="alert alert-success mt-3" role="alert">
            {successMessage}
          </div>
        )}
      </div>
    </>
  );
};

export default AddAdmin;