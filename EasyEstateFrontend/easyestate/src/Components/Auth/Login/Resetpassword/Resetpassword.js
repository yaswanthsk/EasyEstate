import { React, useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate, useSearchParams } from "react-router-dom";

import 'react-toastify/dist/ReactToastify.css';
import axios from '../../../axios';
import './Resetpassword.css';
import resetimage from '../../../../Assets/Images/Resetpassword.jpg';
import lock from '../../../../Assets/Images/lock.jpg';

// Resetpassword Component
// Handles the logic for resetting the user's password through a password reset link
const Resetpassword = () => {
  // State variables for managing form inputs and application states
  const [searchParams] = useSearchParams(); // Extract parameters (token, email, role) from URL query string
  const [password, setPassword] = useState(""); // State to store the new password entered by the user
  const [confirmPassword, setConfirmPassword] = useState(""); // State to store the confirmation of the new password
  const [loading, setLoading] = useState(false); // Loading state to manage the submit button during async operations

  const token = searchParams.get("token"); // Extract token from URL
  const email = searchParams.get("email"); // Extract email from URL
  const role = searchParams.get("role"); // Extract role from URL

  const navigate = useNavigate(); // React Router hook to handle navigation

  // Clears the form fields (password and confirmPassword)
  const handleClear = () => {
    setPassword("");
    setConfirmPassword("");
  };

  // Handles the form submission logic for resetting the password
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Validation checks before making an API call
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.", { position: "top-right",autoClose: 1500, });
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.", { position: "top-right",autoClose: 1500, });
      return;
    }

    setLoading(true); // Set loading state while sending the request

    try {
      // Send the reset password request to the server
      const response = await axios.post("/Auth/reset-password", {
        token,
        email,
        role,
        password: password,
        confirmpassword: confirmPassword,
      });
      console.log(response);

      if (response.data.status === "Success") {
        // Handle successful password reset
        toast.success(response.data.message, { position: "top-right" ,autoClose: 1500,});
        handleClear();
        setTimeout(() => {
          navigate("/"); // Redirect user to the homepage after a successful reset
        }, 4000);
      } else {
        toast.error(response.data.message, { position: "top-right",autoClose: 1500, });
      }
    } catch (error) {
      // Handle errors during the password reset request
      if (error.response) {
        toast.error(error.response.data.message || "Error resetting password.", {
          position: "top-center",autoClose: 1500,
        });
      } else {
        toast.error("An unexpected error occurred. Please try again.", {
          position: "top-center",autoClose: 1500,
        });
      }
    } finally {
      setLoading(false); // Reset the loading state regardless of the request outcome
    }
  };

  // useEffect to validate required parameters when the component mounts
  useEffect(() => {
    if (!token || !email || !role) {
      // If essential parameters are missing or invalid, show an error toast
      toast.error("Invalid or missing parameters. Please check your link.", {
        position: "top-center",autoClose: 1500,
      });
    }
  }, [token, email, role]);

  return (
    <div className="reset-password-main">
      <div className="reset-password">
        {/* Left Section with visual content */}
        <div className="reset-password-left-section">
          <img src={resetimage} alt="Reset Password" className="reset-password-background-image" />
        </div>

        {/* Right Section with reset password form */}
        <div className="reset-password-right-section">
          <img src={lock} alt="Lock Icon" className="lock-icon" />

          {/* UI Header */}
          <h1>Reset Password</h1>
          <p>
            <span style={{ color: 'red' }}>*</span>
            Enter your new password below.
          </p>

          {/* Password Input Fields */}
          <input
            type="password"
            className="reset-password-form-control"
            placeholder="Enter New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            className="reset-password-form-control"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {/* Submit Button */}
          <button
            className="reset-password-button"
            onClick={handleSubmit}
            disabled={loading} // Disable button during loading
          >
            {loading ? "Submitting..." : "Reset Password"}
          </button>
        </div>

        {/* Toast Notifications */}
        <ToastContainer />
      </div>
    </div>
  );
};

export default Resetpassword;
