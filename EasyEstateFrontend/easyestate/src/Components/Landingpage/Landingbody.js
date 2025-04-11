import React from "react";
import Slider from "react-slick";
import { Box, Typography, Button, Dialog, DialogContent, IconButton } from "@mui/material";
import "slick-carousel/slick/slick.css";
import CloseIcon from "@mui/icons-material/Close";
import "slick-carousel/slick/slick-theme.css";
import { useState, useEffect, useRef } from "react";
import './Landingbody.css'
import { Card, CardImg, CardBody, CardTitle, CardText } from 'reactstrap';
import Login from "../Auth/Login/Login/Login";
import Registration from "../Auth/Registration/Registration";
import Landingnavbar from "./Landingnavbar";
import Landingfooter from "./Landingfooter";
import property1 from '../../Assets/Images/property1.jpg';
import property2 from '../../Assets/Images/property2.png';
import property3 from '../../Assets/Images/property3.jpg';
import property4 from '../../Assets/Images/property4.jpg';
import property5 from '../../Assets/Images/property5.jpg';
import property6 from '../../Assets/Images/property6.jpg';
import property7 from '../../Assets/Images/property7.jpg';
import house1 from '../../Assets/Images/house1.jpg';
import house2 from '../../Assets/Images/house2.jpg';
import house3 from '../../Assets/Images/house3.jpg';
import Viewreviews from "./Viewreviews/Viewreviews";





const Landingbody = () => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        arrows: true,
        pauseOnHover: false,
    };

    const slides = [
        {
            title: "Slide 1",
            description: "This is the first slide",
            image: property1
        },
        {
            title: "Slide 2",
            description: "This is the second slide",
            image: property2
        },
        {
            title: "Slide 3",
            description: "This is the third slide",
            image: property3
        },
        {
            title: "Slide 4",
            description: "This is the fourth slide",
            image: property4
        },
        {
            title: "Slide 5",
            description: "This is the fifth slide",
            image: property5
        },
        {
            title: "Slide 6",
            description: "This is the sixth slide",
            image: property7
        }
    ];

    const services = [
        {
            imgSrc: house2, // Replace with actual image URLs
            title: 'Buy A New Home',
            text: 'Discover your dream home effortlessly. Explore a diverse variety of listings tailored precisely to suit your needs.',
        },
        {
            imgSrc: house1,
            title: 'Sell A Home',
            text: 'Sell confidently with expert guidance and effective strategies. We help you get the best possible price for your property.',
        },
        {
            imgSrc: house3,
            title: 'Rent A Home',
            text: 'Discover your perfect rental effortlessly. Explore a diverse variety of listings tailored precisely to suit your needs.',
        },
    ];

    const contentRef = useRef(null);
    const imageContainerRef = useRef(null);

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

    useEffect(() => {
        const handleResize = () => {
            if (contentRef.current && imageContainerRef.current) {
                const contentHeight = contentRef.current.offsetHeight;
                imageContainerRef.current.style.height = `${contentHeight}px`;
            }
        };
        window.addEventListener('resize', handleResize); //add event listener
        handleResize(); // initial call to set height on mount
        return () => window.removeEventListener('resize', handleResize); //cleanup function
    }, []);

    return (
        <div id='initial-navbar' className="initial-container">
            <Landingnavbar />
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    margin: "20px",
                    padding: "20px",
                    height: "500px",
                    backgroundColor: "#f9f9f9",
                    borderRadius: "10px",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)"
                }}
            >
                {/* Carousel Section */}
                <Box
                    sx={{
                        width: "50%",
                        marginleft: "20px",
                        border: "1px solid #ddd",
                        borderRadius: "10px",
                        overflow: "hidden",
                        height: "470px",
                        position: "relative", // Ensure dots are positioned correctly
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    }}
                >
                    <Slider {...settings}>
                        {slides.map((slide, index) => (
                            <Box key={index}>
                                <img
                                    src={slide.image}
                                    alt={slide.title}
                                    style={{
                                        width: "100%",
                                        height: "80vh",
                                        objectFit: "cover",
                                        objectPosition: "auto",
                                    }}
                                />
                                <Typography
                                    variant="h6"
                                    sx={{
                                        position: "absolute",
                                        bottom: "10px",
                                        left: "10px",
                                        color: "#fff",
                                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                                        padding: "5px 10px",
                                        borderRadius: "5px",
                                        textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
                                    }}
                                >
                                </Typography>
                            </Box>
                        ))}
                    </Slider>
                </Box>

                {/* Text Section */}
                <Box
                    className="initial-text-box"
                    sx={{
                        width: "45%",
                        padding: "20px",
                        backgroundColor: "#fff",
                        borderRadius: "10px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        textAlign: "justify",
                    }}
                >
                    <Typography
                        variant="h4"
                        className="initial-text-section"
                        sx={{
                            marginBottom: "20px",
                            fontWeight: "bold",
                            color: "#3f51b5",
                            fontStyle: "italic",
                            textAlign: "center",
                            fontFamily: "'Roboto Slab', serif",
                            display: "flex",
                        }}
                    >
                        Welcome to EasyEstate
                    </Typography>
                    <Typography
                        variant="body1"
                        className="initial-text-section"
                        sx={{
                            lineHeight: 1.8,
                            color: "#333",
                            fontSize: "1rem",
                            fontFamily: "'Open Sans', sans-serif",
                            display: "flex",
                        }}
                    >
                        Find your dream home or sell your property effortlessly with EasyEstate. Designed for both buyers and sellers, our platform ensures a seamless, user-friendly experience. Buyers can explore properties that suit their needs using advanced search tools, while sellers can easily manage and promote their listings. Whether you're looking for the perfect home or aiming to attract the right buyers, EasyEstate simplifies the entire process, making it smooth and stress-free. With innovative features to streamline every step, EasyEstate redefines property transactions. Discover how easy it is to buy or sell with us – your trusted partner in real estate.
                    </Typography>
                </Box>
            </Box>
            <div id='our-services' className="container mt-5" style={{ marginBottom: '50px' }}>
                <p className="text-center mb-4" style={{ color: 'blue', marginTop: '80px' }}>OUR SERVICES</p>
                <h1 className="text-center mb-4">What We Do?</h1>
                <div className="row">
                    {services.map((service, index) => (
                        <div className="col-md-4 mb-4" key={index}>
                            <Card className="landingcard">
                                <div className="flip-container">
                                    <div className="flip-image">
                                        {/* Front Side */}
                                        <div
                                            className="flip-front"
                                            style={{ backgroundImage: `url(${service.imgSrc})` }}
                                        ></div>
                                        {/* Back Side */}
                                        <div
                                            className="flip-back"
                                            style={{ backgroundImage: `url(${service.imgSrc})` }}
                                        >
                                        </div>
                                    </div>
                                </div>
                                <CardBody>
                                    <CardTitle tag="h5">{service.title}</CardTitle>
                                    <CardText>{service.text}</CardText>
                                    <Button className="rounded-pill custom-bootstrap-button"
                                        onClick={() => handleLoginClick()}>
                                        Learn More <span className="arrow">→</span>
                                    </Button>
                                </CardBody>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>

            <div id='our-benefits'>

                <p className="text-center mb-4" style={{ color: 'blue', marginTop: '10px' }}>OUR BENEFITS</p>
                <h1 className="text-center mb-4">What We Have?</h1>
                <div className="parent-container">
                    <div className="teach-container">
                        <div className="hero-section">
                            <div className="teach-image-container" ref={imageContainerRef}>
                                <img src={property6} alt="Hero Image" />
                            </div>
                            <div className="teach-content-section" ref={contentRef}>
                                <div className="teach-title">
                                    <h2>Why Choose Easy Estate</h2>
                                    <p>Our experienced team brings years of expertise in the real estate market, ensuring well-informed decisions and delivering outstanding results.</p>
                                </div>
                                <div className="teach-feature-box">
                                    <h3>Proven Expertise</h3>
                                    <p className='teach-description'>Our seasoned team excels in real estate with years of successful market navigation, offering informed decisions and optimal results.</p>
                                </div>
                                <div className="teach-feature-box">
                                    <h3>Customized Solutions</h3>
                                    <p className='teach-description'>We pride ourselves on crafting personalized strategies to match your unique goals, ensuring a seamless real estate journey.</p>
                                </div>
                                <div className="teach-feature-box">
                                    <h3>Transparent Partnerships</h3>
                                    <p className='teach-description'>Transparency is key in our client relationships. We prioritize clear communication and ethical practices, fostering trust and reliability throughout.</p>
                                </div>
                                <div className="teach-feature-box">
                                    <h3>Dedicated Support</h3>
                                    <p className='teach-description'>We pride ourselves on building strong, lasting relationships with our clients. We're committed to providing dedicated support and guidance throughout the entire process, ensuring you feel informed and well-cared for every step of the way.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

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
                <div className="Reviews">
                    <Viewreviews/>
                </div>

                <div id='initial-footer'>
                    <Landingfooter />
                </div>
            </div>
        </div>
    );
};

export default Landingbody;