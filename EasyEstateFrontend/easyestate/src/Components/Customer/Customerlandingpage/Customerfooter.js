import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './Customerfooter.css'; // Import your CSS file
 
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
 
function Customerfooter() {
    return (
        <footer className="footer">
            {/* <NavBar bg="dark" variant="dark"> */}
            {/* <Container style={{color:"#FFF8E1"}}>
                <h1>Do you have any questions?</h1>
            </Container> */}
                <Container>
                    <Row>
                        <Col md={5} className="footer-col">
                            <h3 className='customer-footer-header'>About Us</h3>
                            <p style={{textAlign: "justify"}}>Effortlessly find your dream home or sell your property with EasyEstate's user-friendly search and streamlined listing tools. Simplify the process and enjoy a seamless experience in buying or selling real estate. Let EasyEstate make property transactions easier, faster, and more intuitive for you. Discover simplicity today!</p>
                        </Col>
                        <Col md={3} className="footer-col">
                            <h3 className="customer-footer-header">Quick Links</h3>
                            <ul>
                                <li><a href="/customerlanding">Home</a></li>
                                <li><a href="/Properties">Property</a></li>
                                <li><a href="/CustomerSideRequests">My Requests</a></li>
                                <li><a href="/customerwishlist">Wishlist</a></li>
                            </ul>
                        </Col>
                        <Col md={4} className="footer-col">
                            <h3 className="customer-footer-header">Contact Us</h3>
                            <p><FaMapMarkerAlt/> Address: Virtusa Capital Building,Wipro Circle,Hyderabad,500032</p>
                            <p><FaPhoneAlt/> Phone: (+91) 9876543210</p>
                            <p><FaEnvelope/> Email: easyestate@gmail.com</p>
                        </Col>
                    </Row>
                    <hr />
                    <Row>
                        <Col className="copyright">
                            <p>&copy; {new Date().getFullYear()} EasyEstate. All rights reserved.</p>
                        </Col>
                    </Row>
                </Container>
            {/* </NavBar> */}
        </footer>
    );
}
 
export default Customerfooter;