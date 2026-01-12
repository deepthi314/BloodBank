import React, { useState } from "react";
import Navbar from "./navbar";
import Footer from "./footer";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    subject: false,
    message: false
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions
  const validateName = (name) => {
    if (!name.trim()) return "Full name is required";
    if (name.trim().length < 2) return "Full name must be at least 2 characters";
    if (!/^[a-zA-Z\s.'-]+$/.test(name)) return "Full name can only contain letters, spaces, dots, apostrophes and hyphens";
    if (name.trim().length > 100) return "Full name must be less than 100 characters";
    return "";
  };

  const validateEmail = (email) => {
    if (!email) return "Email address is required";
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    if (email.length > 100) return "Email must be less than 100 characters";
    return "";
  };

  const validateSubject = (subject) => {
    if (!subject.trim()) return "Subject is required";
    if (subject.trim().length < 5) return "Subject must be at least 5 characters";
    if (subject.length > 200) return "Subject must be less than 200 characters";
    return "";
  };

  const validateMessage = (message) => {
    if (!message.trim()) return "Message is required";
    if (message.trim().length < 10) return "Message must be at least 10 characters";
    if (message.length > 1000) return "Message must be less than 1000 characters";
    return "";
  };

  // Handle input changes with validation
  const handleChange = (e) => {
    const { id, value } = e.target;
    const name = id; // Using id as field name since we have id="name", id="email", etc.
    
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

    // Clear submitted status when user starts typing
    if (submitted) {
      setSubmitted(false);
    }
  };

  // Handle blur for validation
  const handleBlur = (e) => {
    const { id, value } = e.target;
    const name = id;
    
    // Mark field as touched
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    let error = "";

    // Validate based on field
    switch (name) {
      case "name":
        error = validateName(value);
        break;
      case "email":
        error = validateEmail(value);
        break;
      case "subject":
        error = validateSubject(value);
        break;
      case "message":
        error = validateMessage(value);
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
    newErrors.name = validateName(formData.name);
    newErrors.email = validateEmail(formData.email);
    newErrors.subject = validateSubject(formData.subject);
    newErrors.message = validateMessage(formData.message);

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
  const handleSubmit = (e) => {
    e.preventDefault();
    
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
    
    // Simulate API call (since no backend)
    setTimeout(() => {
      console.log("Form submitted:", formData);
      
      // Show success message
      setSubmitted(true);
      setIsSubmitting(false);
      
      // Clear form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
      
      // Clear errors and touched states
      setErrors({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
      
      setTouched({
        name: false,
        email: false,
        subject: false,
        message: false
      });
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
      
    }, 1000); // Simulate network delay
  };

  return (
    <>
      <Navbar />

      <section className="container my-5" style={{ maxWidth: "600px" }}>
        <h1 className="mb-4">Contact Us</h1>
        <p className="mb-4 text-muted">
          Fill out the form below and we'll get back to you as soon as possible.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Full Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${touched.name && errors.name ? 'is-invalid' : ''}`}
              id="name"
              placeholder="Your full name"
              required
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength="100"
            />
            {touched.name && errors.name && (
              <div className="invalid-feedback">{errors.name}</div>
            )}
          </div>

          {/* Email Address */}
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email Address <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              className={`form-control ${touched.email && errors.email ? 'is-invalid' : ''}`}
              id="email"
              placeholder="Your email address"
              required
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength="100"
            />
            {touched.email && errors.email && (
              <div className="invalid-feedback">{errors.email}</div>
            )}
            <small className="form-text text-muted">
              We'll never share your email with anyone else
            </small>
          </div>

          {/* Subject */}
          <div className="mb-3">
            <label htmlFor="subject" className="form-label">
              Subject <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${touched.subject && errors.subject ? 'is-invalid' : ''}`}
              id="subject"
              placeholder="Subject of your message"
              required
              value={formData.subject}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength="200"
            />
            {touched.subject && errors.subject && (
              <div className="invalid-feedback">{errors.subject}</div>
            )}
            <small className="form-text text-muted">
              Briefly describe the purpose of your message (minimum 5 characters)
            </small>
          </div>

          {/* Message */}
          <div className="mb-3">
            <label htmlFor="message" className="form-label">
              Your Message <span className="text-danger">*</span>
            </label>
            <textarea
              className={`form-control ${touched.message && errors.message ? 'is-invalid' : ''}`}
              id="message"
              rows="4"
              placeholder="Write your message here"
              required
              value={formData.message}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength="1000"
            ></textarea>
            {touched.message && errors.message && (
              <div className="invalid-feedback">{errors.message}</div>
            )}
            <small className="form-text text-muted">
              Please provide detailed information (minimum 10 characters)
            </small>
          </div>

          <button 
            type="submit" 
            className="btn btn-danger" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Sending...
              </>
            ) : (
              "Send Message"
            )}
          </button>
        </form>

        {/* Success Message */}
        {submitted && (
          <div className="alert alert-success alert-dismissible fade show mt-4" role="alert">
            <h5 className="alert-heading">
              <i className="bi bi-check-circle-fill me-2"></i>
              Message Sent Successfully!
            </h5>
            <p className="mb-0">
              Thank you for contacting us. We'll get back to you as soon as possible.
            </p>
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setSubmitted(false)}
              aria-label="Close"
            ></button>
          </div>
        )}
      </section>
      
      <Footer />
    </>
  );
}