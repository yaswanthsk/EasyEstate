import React, { useState, useEffect } from "react";
import axios from "axios";
import Customernavbar from "../Customernavbar/Customernavbar";
import Customerfooter from "./Customerfooter";
import { Slider } from "@mui/material";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import "./Customerlandingpage.css";
import { Card, CardImg, CardBody, CardTitle, CardText } from "reactstrap";
import Apartment1 from '../../../Assets/Images/Apartment1.png';
import Apartment2 from '../../../Assets/Images/Apartment2.png';
import GuestHouse1 from '../../../Assets/Images/GuestHouse1.png';
import GuestHouse2 from '../../../Assets/Images/GuestHouse2.png';
import House1 from '../../../Assets/Images/House1.png';
import House2 from '../../../Assets/Images/House2.png';
import Lands1 from '../../../Assets/Images/Lands1.png';
import Lands2 from '../../../Assets/Images/Lands2.png';
import Office1 from '../../../Assets/Images/Office1.png';
import Office2 from '../../../Assets/Images/Office2.png';
import PG1 from '../../../Assets/Images/PG1.png';
import PG2 from '../../../Assets/Images/PG2.png';
import Plots1 from '../../../Assets/Images/Plots1.png';
import Plots2 from '../../../Assets/Images/Plots2.png';
import Shop1 from '../../../Assets/Images/Shop1.png';
import Shop2 from '../../../Assets/Images/Shop2.png';
import Backgroundimage from '../../../Assets/Images/BackgroundImage.png';





 
// import 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap';
 
function Customerlandingpage() {
  const [searchType, setSearchType] = useState("All");
  const [location, setLocation] = useState("");
  const [keyword, setKeyword] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    propertyType: "",
    location: "",
    Price: [5000, 50000000],
  });
  const [properties, setProperties] = useState([]);
  const [textIndex, setTextIndex] = useState(0);
  const navigate = useNavigate();

 
  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prevIndex) => (prevIndex === 0 ? 1 : 0));
    }, 4000);
    return () => clearInterval(interval); // Clean up the interval on unmount
  }, []);
 
  // Filter properties based on search criteria
  useEffect(() => {
    const filtered = properties.filter((property) => {
      const matchesType = filters.propertyType
        ? property.propertyType === filters.propertyType
        : true;
 
      const matchesLocation = filters.location
        ? property.propertyLocation
            .toLowerCase()
            .includes(filters.location.toLowerCase())
        : true;
 
      const matchesPrice =
        property.propertyPrice >= filters.Price[0] &&
        property.propertyPrice <= filters.Price[1];
 
      return matchesType && matchesLocation && matchesPrice;
    });
    setFilteredData(filtered);
  }, [filters, properties]);
 
  const handleSearch = () => {
    setFilters({
      ...filters,
      propertyType: searchType !== "All" ? searchType : "",
      location: location,
    });
  };
 
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
 
  const handleViewDetails = (propertyID) => {
    navigate(`/ViewDetails/${propertyID}`);
  };

  const handleCardClick = (title) => {
    console.log(title);
    navigate("/Properties",
      {
        state:{title}
      });
  };
 
  return (
    <div>
      <Customernavbar />
      <div
        className="hero-section"
        style={{
          backgroundImage: `url(${Backgroundimage})`,
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
        <div className="Customer-title-large text-white animationtext slide">
          <h1
            style={{
              fontSize: "80px", // Increase the font size of the entire heading
              fontWeight: "bold",
              marginBottom: "50px",
              color: "#FAF3E0",
              textAlign: "center", // Align "Find Your" to the center
            }}
          >
            Find Your{" "}
            <span
              className="tf-text s1 cd-words-wrapper"
              style={{
                display: "inline-block",
                position: "relative", // Keeps the animated words aligned in a single line
                color: "#99b3e6",
              }}
            >
              {/* Toggling between Living Space and Dream Property */}
              {textIndex === 0 ? "Living Space" : "Dream Place"}
            </span>
          </h1>
        </div>
 
        <div>
          <p
            style={{
              fontSize: "20px", // Adjust the font size to be slightly smaller than the heading
              textAlign: "center", // Center the paragraph
              fontWeight: "500", // Light font weight for the paragraph
              color: "#FFFFF0", // Darker color for better readability against light backgrounds
              marginTop: "10px", // Space between the heading and paragraph
              lineHeight: "1.6", // Provide line height for readability
              maxWidth: "800px", // Set a max-width to make the paragraph look more cohesive
              marginLeft: "auto",
              marginBottom: "250px",
              marginRight: "auto", // Center the paragraph
              fontStyle: "italic",
            }}
          >
            Whether you're searching for a cozy cottage or a sprawling estate,
            we have the resources to help you find your perfect property or
            dream home. Browse our extensive listings and let us assist you in
            finding your ideal space.
          </p>
        </div>
        </div>
 
      <div className="container mt-5" style={{ marginBottom: "80px" }}>
        <h1 className="text-center mb-4">Our Services</h1>
        <div className="row">
          {services.map((service, index) => (
            <div className="col-md-3 mb-3" key={index}>
              <Card onClick={() => handleCardClick(service.title)} style={{ cursor: "pointer" }}>
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

      <div id="customer-footer">
      <Customerfooter />
      </div>
    </div>
  );
}
 
export default Customerlandingpage;