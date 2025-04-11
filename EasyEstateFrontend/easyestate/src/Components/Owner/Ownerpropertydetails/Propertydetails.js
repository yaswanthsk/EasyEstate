import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "../../axios";
import Ownernavbar from "../Ownernavbar/Ownernavbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import "slick-carousel/slick/slick.css";
import { toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "slick-carousel/slick/slick-theme.css";
import Button from "@mui/material/Button";
import Slider from "react-slick";
import { faBathtub, faBed, faBuilding, faCar, faChair, faCheckCircle, faDirections, faHouse, faLocationDot, faPenRuler, faRuler, faRupee, } from "@fortawesome/free-solid-svg-icons";
import "./Propertydetails.css";
//import MotionVideo from '../../../Assets/Images/Video.mp4'
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import sellarcard from "../../../Assets/Images/sellarcard.jpg"
const Propertydetails = ({ }) => {
    const [selectedProperty, setSelectedProperty] = useState(null); // Store property details
    //const[ownerID,setOwnerID]=useState("");
    const [images, setImages] = useState([]); // Store property images
    const [ProfilePhoto, setProfilePhoto] = useState();
    const [payment, setPayment] = useState("");
    const [temp, setTemp] = useState(0);
    const { propertyID } = useParams();
    const token = localStorage.getItem("token");
    const userID = localStorage.getItem("id");
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        totalAmount: "",
        downPayment: "",
        months: "",
        interestRate: "",
    });

    const handleKeyDown = (event) => {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();
        }
    };
    
    const handleContextMenu = (event) => { event.preventDefault(); };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { totalAmount, downPayment, months, interestRate } = formData;

        if (totalAmount && downPayment && months && interestRate) {
            // Loan calculation logic here
            const loanAmount = parseFloat(totalAmount) - parseFloat(downPayment);
            const monthlyInterest = parseFloat(interestRate) / 100 / 12;
            const monthlyPayment =
                (loanAmount *
                    monthlyInterest *
                    Math.pow(1 + monthlyInterest, parseInt(months))) /
                (Math.pow(1 + monthlyInterest, parseInt(months)) - 1);
            setPayment(monthlyPayment.toFixed(2));
            setTemp(1);
        }
    };
    useEffect(() => {
        fetchProperty();
    }, [propertyID]);

    const fetchProperty = async () => {
        if (propertyID) {
            const url = `/Owner/GetPropertyById/${propertyID}`;
            await axios
                .get(url, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                .then((res) => {
                    setSelectedProperty(res.data.property);
                    setImages(res.data.images);
                    console.log(res.data.property);
                })
                .catch((err) => {
                    console.error("Error fetching property details:", err);
                });
        }
    };

   

    if (!selectedProperty) {
        return <div>Loading property details...</div>;
    }

    const settings = {
        dots: true, // Show dots at the bottom
        infinite: true, // Loop the carousel
        speed: 500, // Animation speed
        slidesToShow: 3, // Number of slides to show at once
        slidesToScroll: 1, // Number of slides to scroll at a time
        autoplay: false, //Autoplay the carousel. Remove for manual navigation.
        autoplaySpeed: 3000, //Speed of the autoplay.
    };
    const handleBack = () => {
        console.log(location.state.from);
        // Navigate back to the previous page or a fallback page if history is unavailable
        if (location.state?.from) {
            navigate(location.state.from);
        } else {
            navigate("/"); // Default fallback route
        }
    };

    {
        return (
            <div className="noScrolling">
                <Ownernavbar />
                {/* Title Section */}
                <div>
                    <div className="card">
                        <div
                            style={{
                                cursor: "pointer",
                                marginTop: "10px",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                            }}
                            onClick={handleBack}
                        >
                            <ArrowBackIcon style={{ fontSize: "24px", color: "#000" }} />
                            <span style={{ fontSize: "18px", color: "blue" }}>Back</span>
                        </div>

                        <div
                            className="card-title"
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                justifyContent: "space-between", // Distributes the space between title/button and price
                                alignItems: "center", // Keeps the title and button vertically aligned
                                width: "100%", // Ensures the container stretches across the full width of the parent
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <p className="ownerview-details-para"
                                    style={{
                                        marginTop: "55px",
                                        marginBottom: "20px",
                                        marginLeft: "20px",
                                        fontSize: "50px",
                                        marginRight: "10px", // Adjust this if you want to control space between the title and button
                                    }}
                                >
                                    <b>{selectedProperty.propertyName}</b>
                                </p>
                            </div>

                            <span
                                className="propertydetails-price"
                                style={{
                                    marginTop: "55px",
                                    marginBottom: "20px",
                                    marginLeft: "20px",
                                    marginRight: "20px", // You can adjust this if needed
                                    fontSize: "40px",
                                    color: "black",
                                    fontWeight: "normal",
                                    textAlign: "right", // Ensures the price is aligned to the right
                                }}
                            >
                                {/* Price display logic */}
                                {selectedProperty.propertyType === "Houses_Apartments" &&
                                    selectedProperty.propertyFor === "Sale" && (
                                        <div style={{ color: "#556B2F" }}>
                                            {" "}
                                            <CurrencyRupeeIcon
                                                style={{
                                                    color: "#556B2F",
                                                    fontSize: "40px",
                                                    marginRight: "4px",
                                                    marginBottom: "1px",
                                                }}
                                            />
                                            {(
                                                selectedProperty.propertyPrice.toLocaleString() /
                                                selectedProperty.h_Sqft
                                            ).toFixed(2)}
                                            <span style={{ fontSize: "20px", fontStyle: "italic" }}>
                                                /sqft
                                            </span>
                                        </div>
                                    )}
                                {selectedProperty.propertyType === "Lands_Plots" &&
                                    selectedProperty.propertyFor === "Sale" && (
                                        <div style={{ color: "#556B2F" }}>
                                            {" "}
                                            <CurrencyRupeeIcon
                                                style={{
                                                    color: "#556B2F",
                                                    fontSize: "40px",
                                                    marginRight: "4px",
                                                    marginBottom: "1px",
                                                }}
                                            />
                                            {(
                                                selectedProperty.propertyPrice.toLocaleString() /
                                                selectedProperty.plotArea
                                            ).toFixed(2)}
                                            <span style={{ fontSize: "15px", fontStyle: "italic" }}>
                                                /sqyd
                                            </span>
                                        </div>
                                    )}
                                {selectedProperty.propertyType === "Shops_Offices" &&
                                    selectedProperty.propertyFor === "Sale" && (
                                        <div style={{ color: "#556B2F" }}>
                                            {" "}
                                            <CurrencyRupeeIcon
                                                style={{
                                                    color: "#556B2F",
                                                    fontSize: "40px",
                                                    marginRight: "4px",
                                                    marginBottom: "1px",
                                                }}
                                            />
                                            {(
                                                selectedProperty.propertyPrice.toLocaleString() /
                                                selectedProperty.s_Sqft
                                            ).toFixed(2)}
                                            <span style={{ fontSize: "15px", fontStyle: "italic" }}>
                                                /sqft
                                            </span>
                                        </div>
                                    )}
                                {selectedProperty.propertyType === "PG_GuestHouses" && (
                                    <div style={{ color: "#556B2F" }}>
                                        {" "}
                                        <CurrencyRupeeIcon
                                            style={{
                                                color: "#556B2F",
                                                fontSize: "40px",
                                                marginRight: "4px",
                                                marginBottom: "1px",
                                            }}
                                        />
                                        {selectedProperty.propertyPrice.toLocaleString()}
                                    </div>
                                )}
                                {selectedProperty.propertyType === "Houses_Apartments" &&
                                    selectedProperty.propertyFor === "Rent" && (
                                        <div style={{ color: "blue" }}>
                                            <CurrencyRupeeIcon
                                                style={{ color: "blue", fontSize: "18px" }}
                                            />
                                            {selectedProperty.propertyPrice.toLocaleString()}
                                        </div>
                                    )}
                                {selectedProperty.propertyType === "Lands_Plots" &&
                                    selectedProperty.propertyFor === "Rent" && (
                                        <div style={{ color: "blue" }}>
                                            <CurrencyRupeeIcon
                                                style={{ color: "blue", fontSize: "18px" }}
                                            />
                                            {selectedProperty.propertyPrice.toLocaleString()}{" "}
                                        </div>
                                    )}
                                {selectedProperty.propertyType === "Shops_Offices" &&
                                    selectedProperty.propertyFor === "Rent" && (
                                        <div style={{ color: "blue" }}>
                                            {" "}
                                            <CurrencyRupeeIcon
                                                style={{ color: "blue", fontSize: "18px" }}
                                            />
                                            {selectedProperty.propertyPrice.toLocaleString()}{" "}
                                        </div>
                                    )}
                            </span>
                        </div>

                        <hr class="custom-hr" />
                        <div className="property-carousel">
                            {images.length === 0 ? (
                                <p>No images found</p> // No images case
                            ) : images.length <= 3 ? (
                                // If 1 to 3 images, display them without a carousel
                                <div className="image-gallery">
                                    {images.map((image, index) => (
                                        <img
                                            key={index}
                                            src={`data:image/jpeg;base64,${image}`}
                                            alt={`Property Image ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            ) : (
                                // If more than 3 images, enable carousel
                                <Slider {...settings}>
                                    {images.map((image, index) => (
                                        <div key={index}>
                                            <img
                                                src={`data:image/jpeg;base64,${image}`}
                                                alt={`Property Image ${index + 1}`}
                                            />
                                        </div>
                                    ))}
                                </Slider>
                            )}
                        </div>
                    </div>
                    {/* screen partition */}
                    <div>
                        <div className="containerPartition">
                            <div className="Partitiondata-section">
                                {/* This is where your data goes (3/4th of the screen) */}
                                <h4
                                    style={{
                                        color: "#333333",
                                        marginTop: "30px",
                                        marginBottom: "30px",
                                    }}
                                >
                                    Description
                                </h4>
                                <p>{selectedProperty.propertyDescription}</p>
                                <h4
                                    style={{
                                        color: "#333333",
                                        marginTop: "30px",
                                        marginBottom: "30px",
                                    }}
                                >
                                    Features
                                </h4>

                                {/* Bedrooms */}
                                <div className="property-details-table">
                                    {selectedProperty.propertyType === "Houses_Apartments" && (
                                        <div className="property-row-table">
                                            <div className="property-item-table">
                                                <div className="icon-box-table">
                                                    <p
                                                        className="bhk"
                                                        style={{ color: "grey", marginLeft: "20px" }}
                                                    >
                                                        <b style={{ color: "grey" }}>
                                                            <FontAwesomeIcon
                                                                icon={faBed}
                                                                className="icon-table"
                                                                style={{ marginRight: "10px", color: "grey" }}
                                                            />
                                                            Beds :{" "}
                                                        </b>
                                                        {selectedProperty.bhk}
                                                    </p>
                                                </div>
                                            </div>
                                            {/* Bathrooms */}
                                            <div className="property-item-table">
                                                <div className="icon-box-table">
                                                    <p
                                                        className="bathrooms"
                                                        style={{ color: "grey", marginLeft: "20px" }}
                                                    >
                                                        <b style={{ color: "grey" }}>
                                                            <FontAwesomeIcon
                                                                icon={faBathtub}
                                                                className="icon-table"
                                                                style={{ marginRight: "10px", color: "grey" }}
                                                            />
                                                            Bathrooms :{" "}
                                                        </b>
                                                        {selectedProperty.bathrooms}
                                                    </p>
                                                </div>
                                            </div>
                                            {/* Furnished */}
                                            <div className="property-item-table">
                                                <div className="icon-box-table">
                                                    <p
                                                        className="Furnished"
                                                        style={{ color: "grey", marginLeft: "20px" }}
                                                    >
                                                        <b style={{ color: "grey" }}>
                                                            <FontAwesomeIcon
                                                                icon={faChair}
                                                                className="icon-table"
                                                                style={{ marginRight: "10px", color: "grey" }}
                                                            />
                                                            Furnishing :{" "}
                                                        </b>
                                                        {selectedProperty.h_Furnishing}
                                                    </p>
                                                </div>
                                            </div>
                                            {/* No of Floors */}
                                            <div className="property-item-table">
                                                <div className="icon-box-table">
                                                    <p
                                                        className="Floors"
                                                        style={{ color: "grey", marginLeft: "20px" }}
                                                    >
                                                        <b style={{ color: "grey" }}>
                                                            <FontAwesomeIcon
                                                                icon={faBuilding}
                                                                className="icon-table"
                                                                style={{ marginRight: "10px", color: "grey" }}
                                                            />
                                                            Floors :{" "}
                                                        </b>
                                                        {selectedProperty.total_Floors}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {selectedProperty.propertyType === "Houses_Apartments" && (
                                        
                                        <div className="property-row-table">
                                            {/*Floor No */}
                                            <div className="property-item-table">
                                        <div className="icon-box-table">
                                            <p
                                                className="Floors"
                                                style={{ color: "grey", marginLeft: "20px" }}
                                            >
                                                <b style={{ color: "grey" }}>
                                                    <FontAwesomeIcon
                                                        icon={faHouse}
                                                        className="icon-table"
                                                        style={{ marginRight: "10px", color: "grey" }}
                                                    />
                                                    Flat No :{" "}
                                                </b>
                                                {selectedProperty.floor_No!==null ? (selectedProperty.floor_No):"N/A"}
                                            </p>
                                        </div>
                                    </div>
                                            {/* Sqft */}
                                            <div className="property-item-table">
                                                <div className="icon-box-table">
                                                    <p
                                                        className="Sqft"
                                                        style={{ color: "grey", marginLeft: "20px" }}
                                                    >
                                                        <b style={{ color: "grey" }}>
                                                            <FontAwesomeIcon
                                                                icon={faPenRuler}
                                                                className="icon-table"
                                                                style={{ marginRight: "10px", color: "grey" }}
                                                            />
                                                            Square Feet :{" "}
                                                        </b>
                                                        {selectedProperty.h_Sqft}
                                                    </p>
                                                </div>
                                            </div>
                                            {/* Facing */}
                                            <div className="property-item-table">
                                                <div className="icon-box-table">
                                                    <p
                                                        className="Facing"
                                                        style={{ color: "grey", marginLeft: "20px" }}
                                                    >
                                                        <b style={{ color: "grey" }}>
                                                            <FontAwesomeIcon
                                                                icon={faDirections}
                                                                className="icon-table"
                                                                style={{ marginRight: "10px", color: "grey" }}
                                                            />
                                                            Facing :{" "}
                                                        </b>
                                                        {selectedProperty.h_Facing}
                                                    </p>
                                                </div>
                                            </div>
                                            {/* project status */}
                                            <div className="property-item-table">
                                                <div className="icon-box-table">
                                                    <p
                                                        className="Project Status"
                                                        style={{ color: "grey", marginLeft: "20px" }}
                                                    >
                                                        <b style={{ color: "grey" }}>
                                                            <FontAwesomeIcon
                                                                icon={faCheckCircle}
                                                                className="icon-table"
                                                                style={{ marginRight: "10px", color: "grey" }}
                                                            />
                                                            Project Status :{" "}
                                                        </b>
                                                        {selectedProperty.project_Status}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {selectedProperty.propertyType === "Houses_Apartments" && (
                                        <div className="property-row-table">
                                            {/* Parking */}
                                            <div className="property-item-table">
                                                <div className="icon-box-table">
                                                    <p
                                                        className="Parking"
                                                        style={{ color: "grey", marginLeft: "20px" }}
                                                    >
                                                        <b style={{ color: "grey" }}>
                                                            <FontAwesomeIcon
                                                                icon={faCar}
                                                                className="icon-table"
                                                                style={{ marginRight: "10px", color: "grey" }}
                                                            />
                                                            Parking :{" "}
                                                        </b>
                                                        {selectedProperty.h_Car_Parking}
                                                    </p>
                                                </div>
                                            </div>
                                            {/* Maintenance*/}
                                            {selectedProperty.h_Type === "Apartments" && (
                                                <div className="property-item-table">
                                                    <div className="icon-box-table">
                                                        <p
                                                            className="Maintenance"
                                                            style={{ color: "grey", marginLeft: "20px" }}
                                                        >
                                                            <b style={{ color: "grey" }}>
                                                                <FontAwesomeIcon
                                                                    icon={faRupee}
                                                                    className="icon-table"
                                                                    style={{ marginRight: "10px", color: "grey" }}
                                                                />
                                                                Maintenance :{" "}
                                                            </b>
                                                            {selectedProperty.h_Maintenance}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {selectedProperty.propertyType === "Lands_Plots" && (
                                        <div className="property-row-table">
                                            {/* Area */}
                                            <div className="property-item-table">
                                                <div className="icon-box-table">
                                                    <p
                                                        className="plotArea"
                                                        style={{ color: "grey", marginLeft: "20px" }}
                                                    >
                                                        <b style={{ color: "grey" }}>
                                                            <FontAwesomeIcon
                                                                icon={faLocationDot}
                                                                className="icon-table"
                                                                style={{ marginRight: "10px", color: "grey" }}
                                                            />
                                                            Area :{" "}
                                                        </b>
                                                        {selectedProperty.plotArea}
                                                    </p>
                                                </div>
                                            </div>
                                            {/* length */}
                                            <div className="property-item-table">
                                                <div className="icon-box-table">
                                                    <p
                                                        className="length"
                                                        style={{ color: "grey", marginLeft: "20px" }}
                                                    >
                                                        <b style={{ color: "grey" }}>
                                                            <FontAwesomeIcon
                                                                icon={faRuler}
                                                                className="icon-table"
                                                                style={{ marginRight: "10px", color: "grey" }}
                                                            />
                                                            Length :{" "}
                                                        </b>
                                                        {selectedProperty.length}
                                                    </p>
                                                </div>
                                            </div>
                                            {/* breadth */}
                                            <div className="property-item-table">
                                                <div className="icon-box-table">
                                                    <p
                                                        className="breadth"
                                                        style={{ color: "grey", marginLeft: "20px" }}
                                                    >
                                                        <b style={{ color: "grey" }}>
                                                            <FontAwesomeIcon
                                                                icon={faRuler}
                                                                className="icon-table"
                                                                style={{ marginRight: "10px", color: "grey" }}
                                                            />
                                                            Breadth :{" "}
                                                        </b>
                                                        {selectedProperty.breadth}
                                                    </p>
                                                </div>
                                            </div>
                                            {/* facing */}
                                            <div className="property-item-table">
                                                <div className="icon-box-table">
                                                    <p
                                                        className="Facing"
                                                        style={{ color: "grey", marginLeft: "20px" }}
                                                    >
                                                        <b style={{ color: "grey" }}>
                                                            <FontAwesomeIcon
                                                                icon={faDirections}
                                                                className="icon-table"
                                                                style={{ marginRight: "10px", color: "grey" }}
                                                            />
                                                            Facing :{" "}
                                                        </b>
                                                        {selectedProperty.l_Facing}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {selectedProperty.propertyType === "Shops_Offices" && (
                                        <div className="property-row-table">
                                            {/* furnishing */}
                                            <div className="property-item-table">
                                                <div className="icon-box-table">
                                                    <p
                                                        className="Furnished"
                                                        style={{ color: "grey", marginLeft: "20px" }}
                                                    >
                                                        <b style={{ color: "grey" }}>
                                                            <FontAwesomeIcon
                                                                icon={faChair}
                                                                className="icon-table"
                                                                style={{ marginRight: "10px", color: "grey" }}
                                                            />
                                                            Furnishing :{" "}
                                                        </b>
                                                        {selectedProperty.s_Furnishing}
                                                    </p>
                                                </div>
                                            </div>
                                            {/* sqft */}
                                            <div className="property-item-table">
                                                <div className="icon-box-table">
                                                    <p
                                                        className="Sqft"
                                                        style={{ color: "grey", marginLeft: "20px" }}
                                                    >
                                                        <b style={{ color: "grey" }}>
                                                            <FontAwesomeIcon
                                                                icon={faPenRuler}
                                                                className="icon-table"
                                                                style={{ marginRight: "10px", color: "grey" }}
                                                            />
                                                            Square Feet :{" "}
                                                        </b>
                                                        {selectedProperty.s_Sqft}
                                                    </p>
                                                </div>
                                            </div>
                                            {/* parking */}
                                            <div className="property-item-table">
                                                <div className="icon-box-table">
                                                    <p
                                                        className="Parking"
                                                        style={{ color: "grey", marginLeft: "20px" }}
                                                    >
                                                        <b style={{ color: "grey" }}>
                                                            <FontAwesomeIcon
                                                                icon={faCar}
                                                                className="icon-table"
                                                                style={{ marginRight: "10px", color: "grey" }}
                                                            />
                                                            Parking :{" "}
                                                        </b>
                                                        {selectedProperty.s_Car_Parking}
                                                    </p>
                                                </div>
                                            </div>
                                            {/* washrooms */}
                                            <div className="property-item-table">
                                                <div className="icon-box-table">
                                                    <p
                                                        className="bathrooms"
                                                        style={{ color: "grey", marginLeft: "20px" }}
                                                    >
                                                        <b style={{ color: "grey" }}>
                                                            <FontAwesomeIcon
                                                                icon={faBathtub}
                                                                className="icon-table"
                                                                style={{ marginRight: "10px", color: "grey" }}
                                                            />
                                                            Washrooms :{" "}
                                                        </b>
                                                        {selectedProperty.washrooms}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {selectedProperty.propertyType === "PG_GuestHouses" && (
                                        <div className="property-row-table">
                                            {/* furnishing */}
                                            <div className="property-item-table">
                                                <div className="icon-box-table">
                                                    <p
                                                        className="Furnished"
                                                        style={{ color: "grey", marginLeft: "20px" }}
                                                    >
                                                        <b style={{ color: "grey" }}>
                                                            <FontAwesomeIcon
                                                                icon={faChair}
                                                                className="icon-table"
                                                                style={{ marginRight: "10px", color: "grey" }}
                                                            />
                                                            Furnishing :{" "}
                                                        </b>
                                                        {selectedProperty.p_Furnishing}
                                                    </p>
                                                </div>
                                            </div>
                                            {/* parking */}
                                            <div className="property-item-table">
                                                <div className="icon-box-table">
                                                    <p
                                                        className="Parking"
                                                        style={{ color: "grey", marginLeft: "20px" }}
                                                    >
                                                        <b style={{ color: "grey" }}>
                                                            <FontAwesomeIcon
                                                                icon={faCar}
                                                                className="icon-table"
                                                                style={{ marginRight: "10px", color: "grey" }}
                                                            />
                                                            Parking :{" "}
                                                        </b>
                                                        {selectedProperty.p_CarParking}
                                                    </p>
                                                </div>
                                            </div>
                                            {/* floors */}
                                            <div className="property-item-table">
                                                <div className="icon-box-table">
                                                    <p
                                                        className="Floors"
                                                        style={{ color: "grey", marginLeft: "20px" }}
                                                    >
                                                        <b style={{ color: "grey" }}>
                                                            <FontAwesomeIcon
                                                                icon={faBuilding}
                                                                className="icon-table"
                                                                style={{ marginRight: "10px", color: "grey" }}
                                                            />
                                                            Floors :{" "}
                                                        </b>
                                                        {selectedProperty.numFloors}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {/* Add your data content here */}
                                <div>
                                    <h4
                                        style={{
                                            color: "#333333",
                                            marginTop: "30px",
                                            marginBottom: "30px",
                                        }}
                                    >
                                        Loan Calculator
                                    </h4>
                                    <div className="loan-calculator-container">
                                        {/* Left Section: Loan Calculator */}
                                        <div className="loan-calculator">

                                            <form className="CalculateLoan" onSubmit={handleSubmit}>
                                                <div>
                                                    <label style={{ color: "black" }}>Total Amount :</label>
                                                    <input
                                                        className="Cal"
                                                        type="number"
                                                        name="totalAmount"
                                                        value={formData.totalAmount}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                                                              e.preventDefault(); // Prevent arrow key increments/decrements
                                                            }
                                                            handleKeyDown(e);
                                                          }}
                                                          onWheel={(e) => e.target.blur()} // Disable mouse wheel behavior
                                                          onContextMenu={handleContextMenu}
                                                          onChange={(e) => {
                                                            const value = e.target.value;
                                                            if (value === "" || Number(value) >= 0) {
                                                              handleChange(e);
                                                            }
                                                          }}
                                                        placeholder="Total Amount"
                                                        min="0"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ color: "black" }}>Down Payment :</label>
                                                    <input
                                                        className="Cal"
                                                        type="number"
                                                        name="downPayment"
                                                        value={formData.downPayment}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                                                              e.preventDefault(); // Prevent arrow key increments/decrements
                                                            }
                                                            handleKeyDown(e);
                                                          }}
                                                          onWheel={(e) => e.target.blur()} // Disable mouse wheel behavior
                                                          onContextMenu={handleContextMenu}
                                                          onChange={(e) => {
                                                            const value = e.target.value;
                                                            if (value === "" || Number(value) >= 0) {
                                                              handleChange(e);
                                                            }
                                                          }}
                                                        placeholder="Down Payment"
                                                        min="0"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ color: "black" }}>
                                                        Amortization Period (months) :
                                                    </label>
                                                    <input
                                                        className="Cal"
                                                        type="number"
                                                        name="months"
                                                        value={formData.months}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                                                              e.preventDefault(); // Prevent arrow key increments/decrements
                                                            }
                                                            handleKeyDown(e);
                                                          }}
                                                          onWheel={(e) => e.target.blur()} // Disable mouse wheel behavior
                                                          onContextMenu={handleContextMenu}
                                                          onChange={(e) => {
                                                            const value = e.target.value;
                                                            if (value === "" || Number(value) >= 0) {
                                                              handleChange(e);
                                                            }
                                                          }}
                                                        placeholder="Months"
                                                        min="0"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ color: "black" }}>Interest rate (%):</label>
                                                    <input
                                                        className="Cal"
                                                        type="number"
                                                        name="interestRate"
                                                        value={formData.interestRate}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                                                              e.preventDefault(); // Prevent arrow key increments/decrements
                                                            }
                                                            handleKeyDown(e);
                                                          }}
                                                          onWheel={(e) => e.target.blur()} // Disable mouse wheel behavior
                                                          onContextMenu={handleContextMenu}
                                                          onChange={(e) => {
                                                            const value = e.target.value;
                                                            if (value === "" || Number(value) >= 0) {
                                                              handleChange(e);
                                                            }
                                                          }}
                                                        placeholder="Interest Rate"
                                                        min="0"
                                                        required
                                                    />
                                                </div>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                        marginTop: "20px",
                                                    }}
                                                >
                                                    <Button
                                                        className="button-Loan"
                                                        style={{
                                                            borderRadius: "50px",
                                                            width: "200px",
                                                            height: "50px",
                                                        }}
                                                        type="submit"
                                                        variant="contained"
                                                    >
                                                        Calculate
                                                    </Button>
                                                    {temp === 1 && (
                                                        <span style={{ fontSize: "20px" }}>
                                                            Monthly Payment :
                                                            <span style={{ color: "blue" }}>
                                                                <CurrencyRupeeIcon
                                                                    style={{
                                                                        color: "blue",
                                                                        fontSize: "40px",
                                                                        marginRight: "4px",
                                                                        marginBottom: "1px",
                                                                    }}
                                                                />
                                                                {payment}/-
                                                            </span>
                                                        </span>
                                                    )}
                                                </div>
                                            </form>
                                        </div>

                                        {/* Right Section: Video */}
                                        {/* <div className="video-section">
                                            <video controls
                                                width="200%"
                                                height="100%"
                                                loop autoPlay muted
                                                style={{ borderRadius: "20px" }}
                                            >
                                                <source src="/Video.mp4" type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                        </div> */}
                                        <div className="video-section">
                                            <img width="100%"
                                                height="100%"
                                                src={sellarcard}
                                                style={{ borderRadius: "20px" }}
                                                />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
};
export default Propertydetails;
