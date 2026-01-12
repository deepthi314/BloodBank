import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignIn = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    const username = e.target.username.value.trim();
    const password = e.target.password.value;

    // Basic client-side validation
    if (!username || !password) {
      setErrorMessage("Please enter both username and password");
      setIsLoading(false);
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const response = await fetch("http://localhost:5000/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await response.json();

      if (response.ok) {
        console.log("Login successful:", data);
        
        // Store admin data - IMPORTANT: Use the exact field names from backend
        const adminData = {
          adminId: data.adminId,
          username: data.username,
          fullName: data.fullName,
          role: data.role,
          bankId: data.bankId,
          email: data.email,
          contactNumber: data.contactNumber
        };
        
        console.log("Storing admin data:", adminData);
        
        // Store in both localStorage and sessionStorage
        localStorage.setItem("adminData", JSON.stringify(adminData));
        sessionStorage.setItem("adminData", JSON.stringify(adminData));
        localStorage.setItem("isAdminLoggedIn", "true");
        sessionStorage.setItem("isAdminLoggedIn", "true");
        
        navigate("/admin/dashboard");
      } else {
        // Handle different error scenarios based on backend response
        if (response.status === 401) {
          setErrorMessage("Invalid username or password");
        } else if (response.status === 404) {
          setErrorMessage("User not found");
        } else if (data.message) {
          setErrorMessage(data.message);
        } else {
          setErrorMessage("Login failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error during signin:", error);
      if (error.name === "AbortError") {
        setErrorMessage("Sign-in timed out. Please try again.");
      } else {
        setErrorMessage("Network error. Please check your connection and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4 shadow rounded-4" style={{ maxWidth: "400px", width: "100%" }}>
        <h3 className="mb-3 text-center">Admin Sign In</h3>
        
        {/* Error Message Display */}
        {errorMessage && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <div className="d-flex align-items-center">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <span>{errorMessage}</span>
            </div>
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setErrorMessage("")}
              aria-label="Close"
            ></button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              id="username"
              name="username"
              placeholder="Enter your username"
              required
              disabled={isLoading}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              placeholder="Enter your password"
              required
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-danger w-100"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Signing In...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
