import React, { useState } from "react";
import Navbar from "./navbar";
import axios from "axios";

const Donor = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "",
    bloodGroup: "",
    contactNumber: "",
    email: "",
    address: "",
    lastDonationDate: "",
    bankId: "",
  });

  const [errors, setErrors] = useState({
    fullName: "",
    age: "",
    gender: "",
    bloodGroup: "",
    contactNumber: "",
    email: "",
    address: "",
    lastDonationDate: "",
    bankId: "",
  });

  const [touched, setTouched] = useState({
    fullName: false,
    age: false,
    gender: false,
    bloodGroup: false,
    contactNumber: false,
    email: false,
    address: false,
    lastDonationDate: false,
    bankId: false,
  });

  const [donorId, setDonorId] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableBloodGroups] = useState(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]);
  const [formError, setFormError] = useState("");

  // Validation functions
  const validateFullName = (name) => {
    if (!name.trim()) return "Full name is required";
    if (name.trim().length < 2) return "Full name must be at least 2 characters";
    if (!/^[a-zA-Z\s.'-]+$/.test(name)) return "Full name can only contain letters, spaces, dots, apostrophes and hyphens";
    if (name.trim().length > 100) return "Full name must be less than 100 characters";
    return "";
  };

  const validateAge = (age) => {
    if (!age) return "Age is required";
    const ageNum = parseInt(age);
    if (isNaN(ageNum)) return "Age must be a number";
    if (ageNum < 18) return "Minimum age is 18";
    if (ageNum > 65) return "Maximum age is 65";
    return "";
  };

  const validateGender = (gender) => {
    if (!gender) return "Gender is required";
    const validGenders = ["Male", "Female", "Other"];
    if (!validGenders.includes(gender)) return "Please select a valid gender";
    return "";
  };

  const validateBloodGroup = (bloodGroup) => {
    if (!bloodGroup) return "Blood group is required";
    if (!availableBloodGroups.includes(bloodGroup.toUpperCase())) {
      return "Please enter a valid blood group (A+, A-, B+, B-, AB+, AB-, O+, O-)";
    }
    return "";
  };

  const validatePhone = (phone) => {
    if (!phone) return "Contact number is required";
    if (!/^\d{10}$/.test(phone)) return "Phone number must be exactly 10 digits";
    return "";
  };

  const validateEmail = (email) => {
    if (!email) return "Email is required";
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    if (email.length > 100) return "Email must be less than 100 characters";
    return "";
  };

  const validateAddress = (address) => {
    if (!address.trim()) return "Address is required";
    if (address.trim().length < 10) return "Address must be at least 10 characters";
    if (address.length > 200) return "Address must be less than 200 characters";
    return "";
  };

  const validateDate = (date) => {
    if (!date) return ""; // Optional field
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare dates only
    
    if (selectedDate > today) return "Last donation date cannot be in the future";
    
    // Check if date is not too far in the past (optional)
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 50); // Max 50 years in past
    if (selectedDate < minDate) return "Date seems too far in the past";
    
    return "";
  };

  const validateBankId = (bankId) => {
    if (!bankId) return "Bank ID is required";
    
    const bankIdNum = parseInt(bankId);
    if (isNaN(bankIdNum) || bankIdNum <= 0) return "Bank ID must be a positive number";
    
    return "";
  };

  // Handle input changes with validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear previous error for this field
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    // Clear form error when user starts typing
    if (formError) {
      setFormError("");
    }
  };

  // Handle blur for validation
  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    // Mark field as touched
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    let error = "";

    // Validate based on field
    switch (name) {
      case "fullName":
        error = validateFullName(value);
        break;
      case "age":
        error = validateAge(value);
        break;
      case "gender":
        error = validateGender(value);
        break;
      case "bloodGroup":
        error = validateBloodGroup(value);
        break;
      case "contactNumber":
        error = validatePhone(value);
        break;
      case "email":
        error = validateEmail(value);
        break;
      case "address":
        error = validateAddress(value);
        break;
      case "lastDonationDate":
        error = validateDate(value);
        break;
      case "bankId":
        error = validateBankId(value);
        break;
      default:
        break;
    }

    if (error) {
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  // Validate entire form before submission
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validate all fields
    newErrors.fullName = validateFullName(formData.fullName);
    newErrors.age = validateAge(formData.age);
    newErrors.gender = validateGender(formData.gender);
    newErrors.bloodGroup = validateBloodGroup(formData.bloodGroup);
    newErrors.contactNumber = validatePhone(formData.contactNumber);
    newErrors.email = validateEmail(formData.email);
    newErrors.address = validateAddress(formData.address);
    newErrors.lastDonationDate = validateDate(formData.lastDonationDate);
    newErrors.bankId = validateBankId(formData.bankId);

    // Check if any errors exist
    Object.values(newErrors).forEach((error) => {
      if (error) isValid = false;
    });

    setErrors(newErrors);
    
    // Mark all fields as touched to show errors
    const allTouched = {};
    Object.keys(touched).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous form error
    setFormError("");
    
    // Validate form
    const isValid = validateForm();
    if (!isValid) {
      // Scroll to first error
      const firstErrorField = Object.keys(errors).find(key => errors[key]);
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    setIsSubmitting(true);
    
    try {
      const res = await axios.post("http://localhost:5000/donor", formData);
      setDonorId(res.data.donorId);
      setSubmitted(true);
      
      // Clear form
      setFormData({
        fullName: "",
        age: "",
        gender: "",
        bloodGroup: "",
        contactNumber: "",
        email: "",
        address: "",
        lastDonationDate: "",
        bankId: "",
      });
      
      // Clear errors and touched states
      setErrors({
        fullName: "",
        age: "",
        gender: "",
        bloodGroup: "",
        contactNumber: "",
        email: "",
        address: "",
        lastDonationDate: "",
        bankId: "",
      });
      
      setTouched({
        fullName: false,
        age: false,
        gender: false,
        bloodGroup: false,
        contactNumber: false,
        email: false,
        address: false,
        lastDonationDate: false,
        bankId: false,
      });
      
    } catch (err) {
      console.error("Error submitting donor form:", err);
      
      // Handle specific backend errors
      if (err.response) {
        if (err.response.status === 409) {
          setFormError("Donor with this email or phone already exists");
        } else if (err.response.data && err.response.data.message) {
          setFormError(err.response.data.message);
        } else {
          setFormError("An error occurred. Please try again.");
        }
      } else {
        setFormError("Network error. Please check your connection.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get today's date for max date input
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <>
      <Navbar />

      <section id="forms">
        <div className="container py-5">
          <h1>Donor Registration</h1>
          <p className="mb-4">
            Please fill out the form below to register as a blood donor. Accurate information
            helps us connect you with those in need.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <div className="mb-3">
              <label htmlFor="fullName" className="form-label">
                Full Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${touched.fullName && errors.fullName ? 'is-invalid' : ''}`}
                id="fullName"
                name="fullName"
                placeholder="Your full name"
                value={formData.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                maxLength="100"
              />
              {touched.fullName && errors.fullName && (
                <div className="invalid-feedback">{errors.fullName}</div>
              )}
            </div>

            {/* Age */}
            <div className="mb-3">
              <label htmlFor="age" className="form-label">
                Age <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className={`form-control ${touched.age && errors.age ? 'is-invalid' : ''}`}
                id="age"
                name="age"
                placeholder="Your age (18-65)"
                value={formData.age}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                min="18"
                max="65"
              />
              {touched.age && errors.age && (
                <div className="invalid-feedback">{errors.age}</div>
              )}
              <small className="form-text text-muted">Must be between 18 and 65 years</small>
            </div>

            {/* Gender */}
            <div className="mb-3">
              <label htmlFor="gender" className="form-label">
                Gender <span className="text-danger">*</span>
              </label>
              <select
                className={`form-select ${touched.gender && errors.gender ? 'is-invalid' : ''}`}
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {touched.gender && errors.gender && (
                <div className="invalid-feedback">{errors.gender}</div>
              )}
            </div>

            {/* Blood Group */}
            <div className="mb-3">
              <label htmlFor="bloodGroup" className="form-label">
                Blood Group <span className="text-danger">*</span>
              </label>
              <select
                className={`form-select ${touched.bloodGroup && errors.bloodGroup ? 'is-invalid' : ''}`}
                id="bloodGroup"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              >
                <option value="">Select blood group</option>
                {availableBloodGroups.map((group) => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
              {touched.bloodGroup && errors.bloodGroup && (
                <div className="invalid-feedback">{errors.bloodGroup}</div>
              )}
            </div>

            {/* Contact Number */}
            <div className="mb-3">
              <label htmlFor="contactNumber" className="form-label">
                Contact Number <span className="text-danger">*</span>
              </label>
              <input
                type="tel"
                className={`form-control ${touched.contactNumber && errors.contactNumber ? 'is-invalid' : ''}`}
                id="contactNumber"
                name="contactNumber"
                placeholder="10-digit number"
                value={formData.contactNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                maxLength="10"
              />
              {touched.contactNumber && errors.contactNumber && (
                <div className="invalid-feedback">{errors.contactNumber}</div>
              )}
              <small className="form-text text-muted">Must be exactly 10 digits</small>
            </div>

            {/* Email */}
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email Address <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                className={`form-control ${touched.email && errors.email ? 'is-invalid' : ''}`}
                id="email"
                name="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                maxLength="100"
              />
              {touched.email && errors.email && (
                <div className="invalid-feedback">{errors.email}</div>
              )}
            </div>

            {/* Address */}
            <div className="mb-3">
              <label htmlFor="address" className="form-label">
                Address <span className="text-danger">*</span>
              </label>
              <textarea
                className={`form-control ${touched.address && errors.address ? 'is-invalid' : ''}`}
                id="address"
                name="address"
                rows="3"
                placeholder="Your full address (minimum 10 characters)"
                value={formData.address}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                maxLength="200"
              />
              {touched.address && errors.address && (
                <div className="invalid-feedback">{errors.address}</div>
              )}
              <small className="form-text text-muted">Must be at least 10 characters</small>
            </div>

            {/* Last Donation Date */}
            <div className="mb-3">
              <label htmlFor="lastDonationDate" className="form-label">
                Last Donation Date
              </label>
              <input
                type="date"
                className={`form-control ${touched.lastDonationDate && errors.lastDonationDate ? 'is-invalid' : ''}`}
                id="lastDonationDate"
                name="lastDonationDate"
                value={formData.lastDonationDate}
                onChange={handleChange}
                onBlur={handleBlur}
                max={getTodayDate()}
              />
              {touched.lastDonationDate && errors.lastDonationDate && (
                <div className="invalid-feedback">{errors.lastDonationDate}</div>
              )}
              <small className="form-text text-muted">
                Optional. If provided, date cannot be in the future.
              </small>
            </div>

            {/* Bank ID */}
            <div className="mb-3">
              <label htmlFor="bankId" className="form-label">
                Bank ID <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className={`form-control ${touched.bankId && errors.bankId ? 'is-invalid' : ''}`}
                id="bankId"
                name="bankId"
                placeholder="Enter valid bank ID"
                value={formData.bankId}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                min="1"
              />
              {touched.bankId && errors.bankId && (
                <div className="invalid-feedback">{errors.bankId}</div>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-danger" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </button>
          </form>

          {/* Error Message (below the form) */}
          {formError && (
            <div className="alert alert-danger alert-dismissible fade show mt-4" role="alert">
              <div className="d-flex align-items-center">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <span>{formError}</span>
              </div>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setFormError("")}
                aria-label="Close"
              ></button>
            </div>
          )}

          {/* Success Message (below the form) */}
          {submitted && donorId && (
            <div className="alert alert-success alert-dismissible fade show mt-4" role="alert">
              <h4 className="alert-heading">
                <i className="bi bi-check-circle-fill me-2"></i>
                Thank you for registering!
              </h4>
              <p>Your registration was successful. Please save your Donor ID for future reference.</p>
              <hr />
              <p className="mb-0">
                <strong>Your Donor ID is: </strong>
                <span className="badge bg-primary fs-5">{donorId}</span>
              </p>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setSubmitted(false)}
                aria-label="Close"
              ></button>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Donor;