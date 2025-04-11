import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import "./Login.css";
import {  toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import property8 from "../../../../Assets/Images/property8.jpg";
import axios from "../../../axios";

// Login Component
// Handles user authentication, input validation, toast notifications, and redirection based on user roles
const Login = ({ handleSwitchToRegister }) => {
  // State variables to manage email, password, and loading state
  const [email, setEmail] = useState(""); // State for email input
  const [password, setPassword] = useState(""); // State for password input
  const [loading, setLoading] = useState(false); // Indicates if login request is in progress
  const navigate = useNavigate(); // React Router hook to programmatically navigate between routes

  // Clears the email and password fields
  const handleclear = () => {
    setEmail("");
    setPassword("");
  };

  // Handles the form submission logic
  const handlesubmit = (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Validate input fields
    if (!email && !password) {
      toast.error("Email is required\nPassword is required", {
        position: "top-center",autoClose: 1500,
      });
      return;
    }

    if (!email) {
      toast.error("Email is required", { position: "top-center" ,autoClose: 1500,});
      return;
    }

    if (!password) {
      toast.error("Password is required", { position: "top-center",autoClose: 1500, });
      return;
    }

    setLoading(true); // Set loading to true while processing the login

    const url = "/Auth/login"; // Endpoint for login
    const data = { Email: email, Password: password }; // Data to send with login request

    axios
      .post(url, data) // Make POST request to the server
      .then((result) => {
        console.log(result.data);

        // Handle authentication response
        if (result.data.status === "Warn") {
          toast.warning(result.data.message, { position: "top-right" ,autoClose: 1500,});
        }

        const token = result.data.token; // Extract token from response
        localStorage.setItem("token", token); // Store token in localStorage for subsequent requests

        // Decode token to extract user role, ID, and username
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const role =
          decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
          decodedToken.role;
        const name =
          decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
          decodedToken.name;
        const Id =
          decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
          decodedToken.id;

        console.log(role);

        localStorage.setItem("id", Id); // Store user ID
        localStorage.setItem("username", name); // Store username
        handleclear(); // Clear input fields
        setLoading(false); // Reset loading state after processing

        // Navigate based on user role
        if (role === "Owner") {
          toast.success("Login successful!", { position: "top-right",autoClose: 1500, });
          setTimeout(() => {
            navigate("/ownerlanding");
          }, 2000);
        } else if (role === "Customer") {
          toast.success("Login successful!", { position: "top-right",autoClose: 1500, });
          setTimeout(() => {
            navigate("/customerlanding");
          }, 2000);
        } else {
          toast.error("Role not found", { position: "top-right",autoClose: 1500, });
          console.log("404");
        }
      })
      .catch((error) => {
        setLoading(false); // Reset loading state if an error occurs
        console.error(error);

        // Handle server error responses
        if (error.response) {
          const { status, data } = error.response;

          if ( (data && data.message === "Invalid credentials")) {
            toast.error(
              "No such user exists\nGive the correct Email & Password",
              { position: "top-center",autoClose: 1500, }
            );
          } else {
            toast.error(
              data.message || "An error occurred. Please try again later.",
              { position: "top-center",autoClose: 1500, }
            );
          }
        }
      });
  };

  return (
    <div className="login-container">
      {/* Left section with an image */}
      <div className="left-section">
        <img src={property8} alt="Property" className="background-image" />
      </div>

      {/* Right section with the login form */}
      <div className="right-section">
        <div className="login-box">
          {/* Header Section */}
          <div className="box-header">
            <h3>Login</h3>
          </div>

          {/* Form Section */}
          <div className="box-body">
            <form onSubmit={handlesubmit}>
              {/* Email Input Field */}
              <div className="input-group form-group">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password Input Field */}
              <div className="input-group form-group">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* Link to Forgot Password */}
              <Link to="/forgetpassword" className="forgot-link">
                Forgot password?
              </Link>

              {/* Login/Submit Button */}
              <div className="form-group">
                {loading ? (
                  // Show loading spinner while processing
                  <button className="login_btn" disabled>
                    <span className="spinner-border spinner-border-sm"></span>{" "}
                    Logging in...
                  </button>
                ) : (
                  // Regular submit button
                  <input
                    type="submit"
                    value="Login"
                    onClick={(e) => handlesubmit(e)}
                    className="login_btn"
                  />
                )}
              </div>
            </form>
          </div>

          {/* Footer Section */}
          <div className="box-footer">
            <div className="d-flex justify-content-center links">
              <p>Don't have an account? </p>
              <Link to="#" onClick={handleSwitchToRegister}>
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Login;
