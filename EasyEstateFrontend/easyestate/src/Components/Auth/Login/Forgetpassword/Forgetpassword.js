import { React, useState } from 'react';
import emailjs from '@emailjs/browser';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from '../../../axios';
import './Forgetpassword.css';
import { FaEnvelope } from 'react-icons/fa';
import forgot from '../../../../Assets/Images/forgot.jpg';

// Forgetpassword Component
// This component allows users to request a password reset by submitting their email and role.
const Forgetpassword = () => {
  // State variables to manage user input and application logic
  const [email, setEmail] = useState(""); // Stores the user's email input
  const [role, setRole] = useState(""); // Stores the user's role selection
  const [errors, setErrors] = useState({}); // State to handle form validation errors
  const [loading, setLoading] = useState(false); // Indicates if a request is currently loading

  // Clears the email input field
  const handleClear = () => {
    setEmail("");
  };

  // Function to send a verification email using EmailJS
  const handleEmail = (verification) => {
    console.log(verification);

    // EmailJS Configuration
    const serviceId = "service_rxwow1j";
    const templateId = "template_oxdc5ll";
    const publicKey = "PtBlCR-GZ4aqtWxmv";

    const templateParams = {
      Subject: "Welcome To Easy Estate!",
      email: email,
      ResetLink: verification,
    };
    console.log(templateParams);

    // Send email using EmailJS
    emailjs.send(serviceId, templateId, templateParams, publicKey)
      .then((response) => {
        console.log("Email sent successfully", response);
      })
      .catch((error) => {
        console.log("Error sending email:", error);
      });
  };

  // Handles the form submission logic
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if there are validation errors before sending the request
    const formErrors = Object.values(errors).filter((error) => error);
    if (!formErrors.length) {
      setLoading(true); // Set the application to loading state while making the request
      const url = `/Auth/ForgotPassword?email=${email}&role=${role}`;

      try {
        // Send the password reset request to the server
        const response = await axios.post(url);
        if (response.data.status === "Success") {
          console.log(response.data.status);
          toast.success(response.data.message, { position: "top-right",autoClose: 1500, });
          handleClear(); // Clear the input field upon success
          handleEmail(response.data.resetPasswordLink); // Trigger the email sending process
        }
      } catch (error) {
        setLoading(false); // Stop the loading state in case of an error
        if (error.response) {
          // Handle server error
          toast.error(error.response.data.message || "Registration error.", {
            position: "top-center",autoClose: 1500,
          });
        } else {
          // Handle unexpected errors
          toast.error("An unexpected error occurred. Please try again.", {
            position: "top-center",autoClose: 1500,
          });
        }
      } finally {
        setLoading(false); // Reset the loading state regardless of outcome
      }
    } else {
      toast.error("Please provide proper data for Registration.", { position: "top-right" ,autoClose: 1500,});
    }
  };

  return (
    <div className="forget-password-main">
      <div className="forget-password">
        {/* Left Section - UI visual element */}
        <div className="forget-password-left-section">
          <img src={forgot} alt="Property" className="forget-password-background-image" />
        </div>

        {/* Right Section - Main form */}
        <div className="forget-password-right-section">
          <h1>Forgot Password?</h1>
          <p>
            <span style={{ color: 'red' }}>*</span>
            Enter the Email address and Role associated with your account
          </p>

          {/* Input for email address */}
          <input
            type="email"
            className="forget-password-form-control"
            placeholder="Enter Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Update state on change
          />

          {/* Dropdown to select user role */}
          <select
            className="forget-password-form-control"
            value={role}
            onChange={(e) => {
              setRole(e.target.value); // Update state with the selected role
            }}
          >
            <option value="">Select Role</option>
            <option value="Owner">Owner</option>
            <option value="Customer">Customer</option>
          </select>

          {/* Submit button to trigger the password reset request */}
          <button className="forget-password-button" onClick={handleSubmit}>
            Send Email
          </button>
        </div>

        {/* Toast Notifications for user feedback */}
        <ToastContainer />
      </div>
    </div>
  );
};

export default Forgetpassword;
