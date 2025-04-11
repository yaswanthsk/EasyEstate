import React, { useState } from 'react';
import axios from '../../axios';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { Dialog, DialogContent, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import 'react-toastify/dist/ReactToastify.css';
import './Registration.css';
import Login from "../Login/Login/Login";
import emailjs from '@emailjs/browser';
import property9 from '../../../Assets/Images/property9.jpg';
import {Tooltip} from "@mui/material"

// Registration Component
// This component handles user registration by accepting user details,
// validating inputs, sending data to the backend, and optionally sending 
// a confirmation email.

const Registration = ({ handleSwitchToLogin }) => {
    // State variables for form inputs and errors
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneno, setPhoneno] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Navigate is used for programmatic navigation
    const navigate = useNavigate();

    // Function to send a confirmation email using EmailJS
    const handleEmail = (verification) => {
        const serviceId = "service_rxwow1j";
        const templateId = "template_u31xj6l";
        const publicKey = "XGfX9XOz7plU5KDWJ";

        const templateParams = {
            Subject: "Welcome To Easy Estate!",
            name: name,
            email: email,
            verificationLink: verification
        };

        emailjs.send(serviceId, templateId, templateParams, publicKey)
            .then((response) => {
                console.log("Email sent successfully", response);
            })
            .catch((error) => {
                console.log("Error sending email:", error);
            });
    };

    // Function to clear all input fields
    const handleClear = () => {
        setName("");
        setEmail("");
        setPhoneno("");
        setPassword("");
        setRole("");
    };

    // Function to validate individual fields
    // Checks for specific validation rules based on the field name
    const validateField = (fieldName, value) => {
        let error = "";

        // Convert email to lowercase if fieldName is email
        if (fieldName === "email") {
            value = value.toLowerCase();
            setEmail(value);  // Update email to lowercase
        }
        
        switch (fieldName) {
            case "name":
                if (!value) {
                    error = "Name is required";
                }
                // Check if the name contains spaces
                else if (/\s/.test(value)) {
                    error = "Name must not contain spaces";
                }
                // Check if the name contains only numbers
                else if (/^\d+$/.test(value)) {
                    error = "Name must not contain only numbers";
                }
                // Check if the name starts with a period
                else if (/^\./.test(value)) {
                    error = "Name must not start with a period (.)";
                }
                // Check if the name contains invalid characters (anything other than letters, numbers, period, and underscore)
                else if (!/^[a-zA-Z0-9._]+$/.test(value)) {
                    error = "alphabets,numbers,(.) and (_) are accepted";
                }
                break;
            case "email":
                if (!value) {
                    error = "Email is required";
                }
                // Check if email starts with a number
                else if (/^[0-9]/.test(value)) {
                    error = "Email must not start with a number";
                }
                // Check if email starts with a period
                else if (/^\./.test(value)) {
                    error = "Email must not start with a period";
                }
                // Check for consecutive periods in the email prefix
                else if (/\.{2,}/.test(value)) {
                    error = "consecutive periods is not accepted";
                }
                // Check if email ends with a period before @
                else if (/\.\@/.test(value)) {
                    error = "Email must not end with period before '@'";
                }
                // Check if email has the correct format and domain gmail.com
                else if (!/^(?=.*[a-z])[a-z0-9]+(\.[a-z0-9]+)*@gmail\.com$/.test(value)) {
                    error = "Invalid email format";
                }
                break;
            case "phoneno":
                if (!value) {
                    error = "Phone number is required";
                }
                // Check if the phone number contains only digits
                else if (!/^\d+$/.test(value)) {
                    error = "Phone number must contain only digits";
                }
                // Check if the phone number is exactly 10 digits
                else if (!/^\d{10}$/.test(value)) {
                    error = "Phone number must be exactly 10 digits";
                }
                // Check if the phone number starts with 6, 7, 8, or 9
                else if (!/^[6-9]\d{9}$/.test(value)) {
                    error = "Phone number must start with 6,7,8 or 9";
                }
                break;
            case "password":
                if (!value)
                    error = "Password is required";
                else if (value.length < 6)
                    error = "Password must be at least 6 characters long";
                else if (/\s/.test(value))
                    error = "Password must not contain spaces";
                else if (!/[A-Z]/.test(value))
                    error = "At least one uppercase letter";
                else if (!/[0-9]/.test(value))
                    error = "At least one number";
                else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value))
                    error = "At least one special character";
                break;
            case "role":
                if (!value) error = "Role is required";
                break;
            default:
                break;
        }
        setErrors((prevErrors) => ({ ...prevErrors, [fieldName]: error }));
    };

    // Form submission handler
    // Sends validated data to the backend for registration
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if there are any validation errors before submitting
        const formErrors = Object.values(errors).filter((error) => error);
        if (!formErrors.length) {
            setLoading(true);

            // Construct API URL and payload
            const url = `/Auth/registration?role=${role}`;
            const data = { Name: name, Email: email, Phoneno: phoneno, Password: password };

            try {
                // Send POST request to backend
                const response = await axios.post(url, data);
                if (response.data.status === "Success") {
                    // Show success toast notification
                    toast.success(response.data.message, { position: "top-right" ,autoClose: 2500,});

                    // Clear form fields and send confirmation email
                    handleClear();
                    console.log(response.data.confirmationLink);
                    handleEmail(response.data.confirmationLink);
                }
            } catch (error) {
                // Handle API errors and show error toast notifications
                setLoading(false);
                if (error.response) {
                    toast.error(error.response.data.message || "Registration error.", {
                        position: "top-center",autoClose: 1500,
                    });
                } else {
                    toast.error("An unexpected error occurred. Please try again.", {
                        position: "top-center",autoClose: 1500,
                    });
                }
            } finally {
                setLoading(false);
            }
        } else {
            // Show validation error notification
            toast.error("Please provide proper data for Registration.", { position: "top-right" ,autoClose: 1500,});
        }
    };

    return (
        <div className="registration-container">
            {/* Left section for background image */}
            <div className="left-section-registration">
                <img src={property9} alt="Background" className="background-image" />
            </div>

            {/* Right section for registration form */}
            <div className="right-section-registration">
                <div className="register-box">
                    <h3>Register</h3>
                    <div className="box-body">
                        <form onSubmit={handleSubmit}>
                            {/* Full Name Input */}
                            <div className="input-group form-group">
                                <label>Full Name</label>
                                <Tooltip title="Enter your full name without spaces or invalid characters.">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter your name"
                                        value={name}
                                        onChange={(e) => {
                                            setName(e.target.value);
                                            validateField("name", e.target.value);
                                        }}
                                        onBlur={(e) => validateField("name", e.target.value)}
                                    />
                                </Tooltip>
                                {errors.name && <small className={`error-text ${errors.name ? 'active' : ''}`}>{errors.name}</small>}
                            </div>

                            {/* Email Input */}
                            <div className="input-group form-group">
                                <label>Email</label>
                                <Tooltip title="Enter a valid Email address (e.g., yourname@gmail.com).">
                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            validateField("email", e.target.value);
                                        }}
                                        onBlur={(e) => validateField("email", e.target.value)}
                                    />
                                </Tooltip>
                                {errors.email && <small className={`error-text ${errors.email ? 'active' : ''}`}>{errors.email}</small>}
                            </div>

                            {/* Phone Number Input */}
                            <div className="input-group form-group">
                                <label>Phone Number</label>
                                <Tooltip title="Enter a 10-digit phone number starting with 6, 7, 8, or 9.">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter your phone number"
                                        value={phoneno}
                                        onChange={(e) => {
                                            setPhoneno(e.target.value);
                                            validateField("phoneno", e.target.value);
                                        }}
                                        onBlur={(e) => validateField("phoneno", e.target.value)}
                                    />
                                </Tooltip>
                                {errors.phoneno && <small className={`error-text ${errors.phoneno ? 'active' : ''}`}>{errors.phoneno}</small>}
                            </div>

                            {/* Role Input */}
                            <div className="input-group form-group">
                                <label>Role</label>
                                <select
                                    value={role}
                                    className="form-control"
                                    onChange={(e) => {
                                        setRole(e.target.value);
                                        validateField("role", e.target.value);
                                    }}
                                    onBlur={(e) => validateField("role", e.target.value)}
                                >
                                    <option value="">Select Role</option>
                                    <option value="Owner">Owner</option>
                                    <option value="Customer">Customer</option>
                                </select>
                                {errors.role && <small className={`error-text ${errors.role ? 'active' : ''}`}>{errors.role}</small>}
                            </div>

                            {/* Password Input */}
                            <div className="input-group form-group">
                                <label>Password</label>
                                <Tooltip title="Password must be at least 6 characters, contain one uppercase letter, one number, and one special character.">
                                    <input
                                        type="password"
                                        className="form-control"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            validateField("password", e.target.value);
                                        }}
                                        onBlur={(e) => validateField("password", e.target.value)}
                                    />
                                </Tooltip>
                                {errors.password && <small className={`error-text ${errors.password ? 'active' : ''}`}>{errors.password}</small>}
                            </div>

                            {/* Submit Button */}
                            <div className="form-group">
                                <input
                                    type="submit"
                                    value="Register"
                                    className="register_btn"
                                />
                            </div>
                        </form>
                        <p>
                            Already have an account? <Link to="#" onClick={handleSwitchToLogin}>Login</Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Toast Notifications */}
            <ToastContainer />
        </div>
    );
};

export default Registration;
