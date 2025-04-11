import React from 'react';
import { Container, Row, Col, Navbar } from 'react-bootstrap';
import { Dialog, DialogContent, IconButton } from "@mui/material";
import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import './Landingfooter.css'; // Import your CSS file
import Login from '../Auth/Login/Login/Login';

import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import Registration from '../Auth/Registration/Registration';

function Landingfooter() {

    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [visibleForm, setVisibleForm] = useState("login"); // "login" or "register"

    const handleLoginClick = () => {
        setIsLoginOpen(true);
        setVisibleForm("login");
    };

    const handleSignUpClick = () => {
        setIsLoginOpen(true);
        setVisibleForm("register");
    };

    const handleCloseDialog = () => {
        setIsLoginOpen(false);
    };

    const toggleForm = () => {
        setVisibleForm((prevForm) => (prevForm === "login" ? "register" : "login"));
    };

    return (
        <footer className="footer">
            <Container>
                <Row>
                    <Col md={5} className="footer-col">
                        <h3 style={{ textAlign: "left", padding: "5px" }}>About Us</h3>
                        <p style={{ textAlign: "justify" , width: "90%"}}>Effortlessly find your dream home or sell your property with EasyEstate's user-friendly search and streamlined listing tools. Simplify the process and enjoy a seamless experience in buying or selling real estate. Let EasyEstate make property transactions easier, faster, and more intuitive for you. Discover simplicity today!</p>
                    </Col>
                    <Col md={3} className="footer-col">
                        <h3 style={{ textAlign: "left", padding: "5px" }}>Quick Links</h3>
                        <ul>
                            <li><a href="/">Home</a></li>
                            <li><a href="#our-services">Services</a></li>
                            <li><a href="#our-benefits">Benefits</a></li>
                            <li><a href="#our-reviews">Reviews</a></li>
                        </ul>
                    </Col>
                    <Col md={4} className="footer-col">
                        <h3 style={{ textAlign: "left", padding: "5px" }}>Contact Us</h3>
                        <p><FaMapMarkerAlt /> Address: Virtusa Capital Building,Wipro Circle,Hyderabad,500032</p>
                        <p><FaPhoneAlt /> Phone: (+91) 9876543210</p>
                        <p><FaEnvelope /> Email: easyestate@gmail.com</p>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col className="copyright">
                        <p>&copy; {new Date().getFullYear()} EasyEstate. All rights reserved.</p>
                    </Col>
                </Row>
            </Container>

            <Dialog className="loginDialogContainer"  // Keep the class if you need it for other styles
                sx={{
                    margin: '0px',
                    width: '80vw',
                    borderRadius: '25px', // Correct syntax for borderRadius
                    '& .MuiPaper-root': { // Target the Paper component's root
                        maxWidth: '80vw',
                        marginLeft: '23vw',
                        borderRadius: '30px'
                        // added to deal with potential width conflicts
                    },
                }}
                aria-labelledby="login-modal-title"
                slotProps={{
                    backdrop: {
                        style: {
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        },
                    },
                }}
                open={isLoginOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth
            >
                <DialogContent class="loginDialogContent" style={{ margin: '0px', overflow: 'hidden', position: 'relative' }}>
                    <IconButton onClick={handleCloseDialog} style={{ position: 'absolute', top: 10, right: 10 }}>
                        <CloseIcon />
                    </IconButton>

                    {visibleForm === "login" ? (
                        <Login handleSwitchToRegister={toggleForm} />
                    ) : (
                        <Registration handleSwitchToLogin={toggleForm} />
                    )}
                </DialogContent>
            </Dialog>

        </footer>
    );
}

export default Landingfooter;
