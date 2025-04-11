import React, { useState, useEffect } from "react";
import Ownernavbar from "../Ownernavbar/Ownernavbar";
import axios from "../../axios";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import "./Ownerlandingpage.css";
import { Card, CardImg, CardBody, CardTitle, CardText } from "reactstrap";
import Ownerfooter from "./Ownerfooter";
import { ReactTyped } from "react-typed";
import Apartment1 from '../../.././Assets/Images/Apartment1.png';
import Apartment2 from '../../.././Assets/Images/Apartment2.png';
import GuestHouse1 from '../../.././Assets/Images/GuestHouse1.png';
import GuestHouse2 from '../../.././Assets/Images/GuestHouse2.png';
import House1 from '../../.././Assets/Images/House1.png';
import House2 from '../../.././Assets/Images/House2.png';
import Lands1 from '../../.././Assets/Images/Lands1.png';
import Lands2 from '../../.././Assets/Images/Lands2.png';
import Office1 from '../../.././Assets/Images/Office1.png';
import Office2 from '../../.././Assets/Images/Office2.png';
import PG1 from '../../.././Assets/Images/PG1.png';
import PG2 from '../../.././Assets/Images/PG2.png';
import Plots1 from '../../.././Assets/Images/Plots1.png';
import Plots2 from '../../.././Assets/Images/Plots2.png';
import Shop1 from '../../.././Assets/Images/Shop1.png';
import Shop2 from '../../.././Assets/Images/Shop2.png';
import ownerbackgroundimage from '../../.././Assets/Images/ownerback.png';
// import 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap';

function Ownerlandingpage() {
    const [textIndex, setTextIndex] = useState(0);
    const navigate = useNavigate();

    const userid = localStorage.getItem("id");

    useEffect(() => {
        const interval = setInterval(() => {
            setTextIndex((prevIndex) => (prevIndex === 0 ? 1 : 0));
        }, 4000);
        return () => clearInterval(interval); // Clean up the interval on unmount
    }, []);

    const services = [
        {
            imgSrc1: House1, // Replace with actual image URLs
            imgSrc2: House2,
            title: "Houses",
        },
        {
            imgSrc1: Apartment1,
            imgSrc2: Apartment2,
            title: "Apartments",
        },
        {
            imgSrc1: Lands1,
            imgSrc2: Lands2,
            title: "Lands",
        },
        {
            imgSrc1: Plots1,
            imgSrc2: Plots2,
            title: "Plots",
        },
        {
            imgSrc1: Shop1, // Replace with actual image URLs
            imgSrc2: Shop2,
            title: "Shops",
        },
        {
            imgSrc1: Office1,
            imgSrc2: Office2,
            title: "Offices",
        },
        {
            imgSrc1: PG1,
            imgSrc2: PG2,
            title: "PGs",
        },
        {
            imgSrc1: GuestHouse1,
            imgSrc2: GuestHouse2,
            title: "Guest Houses",
        },
    ];

    const handleSellPropertyClick = async (userId) => {
        console.log(userId);
        try {
            // Make the API call to check and update subscription status
            const response = await axios.post(`/Payment/update-subscription-status/${userId}`);
            const { status } = response.data;
            console.log(response.data);

            // Handle navigation based on the subscription status
            if (status === "newuser") {            
                navigate("/Subscription", { state: { status } }); // Pass status to subscription page
            } else if (status === "activeuser") {
                navigate("/Addproperty",{ state: { status } }); // Navigate to sell property page
            } else if (status === "renewaluser") {
                navigate("/Subscription", { state: { status } }); // Pass status to subscription page
            }
        } catch (error) {
            console.error("Error updating subscription status:", error);
            // Optional: Show an error message to the user
            alert("An error occurred while checking your subscription. Please try again.");
        }

    };

    return (
        <div>
            <Ownernavbar />
            <div
                className="hero-section"
                style={{
                    backgroundImage: `url(${ownerbackgroundimage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    height: "600px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "white",
                }}
            >
                <div className="title-large text-white animationtext slide">
                    <h1 className="ownerHomePage-title">
                        <ReactTyped
                            strings={["<span class='sell-color'><b>Sell Your Space</b></span>", "<span class='shape-color'><b>Shape Your Future</b></span>"]} typeSpeed={100}
                            loop
                            backSpeed={20}
                            cursorChar=""
                            showCursor={true}
                        />
                    </h1>
                </div>
                <div className="ownerHomepage-container">
                    <div className="ownerHomepage-para">
                        <p>
                            Showcase your property to thousands of potential buyers actively searching in your area. Our platform makes selling your property stress-free and efficient. List your property today and start connecting with buyers tomorrow!
                        </p>
                        <div className="owner-btn-container">
                            <Button
                                size="lg"
                                onClick={() => handleSellPropertyClick(userid)}
                                className="owner-btn"
                            >
                                Add Property
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mt-5" style={{ marginBottom: "80px" }}>
                <h1 className="text-center mb-4">Our Services</h1>
                <div className="row">
                    {services.map((service, index) => (
                        <div className="col-md-3 mb-3" key={index}>
                            <Card>
                                <div className="flip-container">
                                    <div className="flip-image">
                                        {/* Front Side */}
                                        <div
                                            className="flip-front"
                                            style={{ backgroundImage: `url(${service.imgSrc1} )` }}
                                        ></div>
                                        {/* Back Side */}
                                        <div
                                            className="flip-back"
                                            style={{ backgroundImage: `url(${service.imgSrc2})` }}
                                        ></div>
                                    </div>
                                </div>
                                <CardBody style={{ backgroundColor: "#F8F8F8" }}>
                                    <CardTitle tag="h5">{service.title}</CardTitle>
                                </CardBody>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
            <div id="owner-footer">
                <Ownerfooter />
            </div>
        </div>
    );
}

export default Ownerlandingpage;
