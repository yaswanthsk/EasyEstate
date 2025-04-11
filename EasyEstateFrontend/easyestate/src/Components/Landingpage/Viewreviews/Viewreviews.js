import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import { FaStar, FaStarHalfAlt, FaRegStar, FaRegComments } from "react-icons/fa";
import "./Viewreviews.css";
import axios from "../../axios";

const Viewreviews = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const response = await axios.get("/Review/GetReview");
                setTestimonials(response.data);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };
 
        fetchTestimonials();
    }, []);

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

        for (let i = 0; i < fullStars; i++) {
            stars.push(<FaStar key={`full-${i}`} style={{ color: "#FFD700" }} />);
        }
        if (halfStar) {
            stars.push(<FaStarHalfAlt key="half" style={{ color: "#FFD700" }} />);
        }
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<FaRegStar key={`empty-${i}`} style={{ color: "#FFD700" }} />);
        }
        return stars;
    };

    if (loading) {
        return <p>Loading Reviews...</p>;
    }

    if (error) {
        return <p>no reviews to view</p>;
    }

    const settings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 3, // Display three reviews at a time
        slidesToScroll: 1, // Scroll one review at a time
        arrows: false, // Disable navigation arrows
        autoplay: false, // Disable automatic sliding
        responsive: [
            {
                breakpoint: 768, // For small screens
                settings: {
                    slidesToShow: 2, // Show 1 slide on smaller devices
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 1024, // For medium screens
                settings: {
                    slidesToShow: 3, // Show 2 slides on medium devices
                    slidesToScroll: 1,
                },
            },
        ],
    };

    return (
        <div id='our-reviews' className="testimonals-main">
        <div className="testimonials">
            <h2>What People Say's</h2>
            <p className="testimonials-para">
            Our experienced team specializes in real estate, leveraging years of expertise to navigate the market effectively and deliver well-informed decisions for optimal outcomes.            </p>
            <Slider {...settings} className="review-custom-carousel">
                {testimonials.map((testimonial, index) => (
                    <div className="testimonial-card" key={index}>
                        <FaRegComments className="curved-quote" />
                        <div className="review-username">
                            <strong>
                                {testimonial.username.toUpperCase()}
                            </strong>
                        </div>
                        <div className="quote">"{testimonial.comments}"</div>
                        <div className="rating">{renderStars(testimonial.rating)}</div>
                    </div>
                ))}
            </Slider>
        </div>
        </div>
    );
};

export default Viewreviews;
