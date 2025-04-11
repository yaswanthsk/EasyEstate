import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VisuallyHiddenInput from '@mui/material/Input';
import { Button } from '@mui/material';
import Ownernavbar from "../Ownernavbar/Ownernavbar";
import { toast } from "react-toastify";
import './Addproperty.css';
import axios from "../../axios";
import "react-toastify/dist/ReactToastify.css";



const Addproperty = () => {
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        ownerID: localStorage.getItem("id") || "", // Update this dynamically based on authenticated user
        propertyName: "",
        propertyFor: "",
        propertyPrice: "",
        propertyDescription: "",
        propertyLocation: "",
        ownerMobileNo: "",
        propertyType: "",
        H_Type: "",
        BHK: "",
        Bathrooms: "",
        H_Furnishing: "",
        Project_Status: "",
        H_Sqft: "",
        H_Maintenance: "",
        Total_Floors: "",
        Floor_No: "",
        H_Car_Parking: "",
        H_Facing: "",
        L_Type: "",
        PlotArea: "",
        Length: "",
        Breadth: "",
        L_Facing: "",
        S_Type: "",
        S_Furnishing: "",
        S_Sqft: "",
        S_Car_Parking: "",
        Washrooms: "",
        P_Type: "",
        P_Furnishing: "",
        P_CarParking: "",
        NumFloors: "",
        propertyImage: [],
    });

    const [images, setImages] = useState([]);

    const fileInputRef = useRef(null);
    const [fileCount, setFileCount] = useState(0); // State to store file count
    const token = localStorage.getItem("token");

    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        marginleft: "-100px",
        width: 1,
    });

    // Function to calculate Plot Area based on Length and Breadth
    const calculatePlotArea = () => {
        const { Length, Breadth } = formData;
        if (Length && Breadth) {
            console.log("Length", Length);
            console.log("Breadth", Breadth);
            const area = (parseFloat(Length) * parseFloat(Breadth)) / 9;  // Convert square feet to square yards
            const roundedArea = parseFloat(area.toFixed(2)); // Round to 2 decimal places
            setFormData((prevState) => ({
                ...prevState,
                PlotArea: roundedArea,  // Set calculated plot area
            }));
        }
    };

    // Effect to calculate PlotArea whenever Length or Breadth changes
    useEffect(() => {
        if (formData.Length && formData.Breadth) {
            calculatePlotArea();
        }
    }, [formData.Length, formData.Breadth]);

    // Handle Length change
    const handleLengthChange = (e) => {
        const value = e.target.value;
        // Allow empty value or any number greater than or equal to 0 with multiple digits
        if (value === "" || /^[0-9]+(\.[0-9]*)?$/.test(value)) {
            setFormData((prevState) => ({
                ...prevState,
                Length: value,
            }));
        }
    };

    // Handle Breadth change
    const handleBreadthChange = (e) => {
        const value = e.target.value;
        // Allow empty value or any number greater than or equal to 0 with multiple digits
        if (value === "" || /^[0-9]+(\.[0-9]*)?$/.test(value)) {
            setFormData((prevState) => ({
                ...prevState,
                Breadth: value,
            }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value,
        });

        // Validate input in real-time
        validateField(name, value);
    };

    const validateFormData = () => {
        console.log("hi");
        const errors = {};

        // General validations
        if (!formData.propertyName.trim()) {
            errors.propertyName = "Property name is required.";
        } else if (!/^[A-Za-z\s]+$/.test(formData.propertyName)) {  // Only allows letters and spaces
            errors.propertyName = "Property name must contain letters and spaces.";
        } else if (formData.propertyName.length > 50) {
            errors.propertyName = "Property name must be under 50 characters.";
        }
        if (!formData.propertyFor) errors.propertyFor = "Rent/Sale is required.";
        if (!formData.propertyPrice || isNaN(formData.propertyPrice)) {
            errors.propertyPrice = "Valid property price is required.";
        }
        else if(formData.propertyPrice <= 3000){
            errors.propertyPrice = "Property price must be greater than 3000.";
        }
        if (!formData.propertyDescription.trim()) {
            errors.propertyDescription = "Description is required.";
        }
        if (!formData.ownerMobileNo.trim()) {
            errors.propertyDescription = "Mobile Number is required.";
        }
        if (formData.propertyDescription.length > 500) {
            errors.propertyDescription = "Description must be under 500 characters.";
        }
        // else if (/[^a-zA-Z0-9\s,.-:;"']/.test(formData.propertyDescription)) {
        //     errors.propertyDescription = "Description contains invalid characters.";
        // }

        if (!formData.propertyLocation.trim()) errors.propertyLocation = "Property Address is required.";
        else if (/[^a-zA-Z0-9\s,.\-#]/.test(formData.propertyLocation)) {
            errors.propertyLocation = "Property Address contains invalid characters.";
        }
        if (!formData.ownerMobileNo.trim()) errors.ownerMobileNo = "Mobile Number is required.";
        else if (!/^\d{10}$/.test(formData.ownerMobileNo)) {
            errors.ownerMobileNo = "Mobile number must be a 10-digit number.";
        } else if (!/^[6-9]/.test(formData.ownerMobileNo)) {
            errors.ownerMobileNo = "Mobile number must start with 6,7,8 or 9.";
        }
        if (!formData.propertyType) errors.propertyType = "Property type is required.";

        // Conditional validations based on property type
        if (formData.propertyType === "Houses_Apartments") {
            if (!formData.H_Type) errors.H_Type = "Specific type (House/Apartment) is required.";
            if (!formData.BHK || formData.BHK <= 0) errors.BHK = "Valid number of bedroom(s) is/are required.";
            else if (formData.BHK > 20) errors.BHK = "Number of Bedroomscannot exceed 20"
            if (!formData.Bathrooms || formData.Bathrooms <= 0) errors.Bathrooms = "Valid number of bathroom(s) is/are required.";
            else if (formData.Bathrooms > 25) errors.Bathrooms = "Number of Bathrooms cannot exceed 25"
            if (!formData.H_Furnishing) errors.H_Furnishing = "Furnishing type is required.";
            if (!formData.H_Sqft || formData.H_Sqft <= 0) errors.H_Sqft = "Valid Sqft is required.";
            if (formData.Total_Floors < 0 || !formData.Total_Floors) errors.Total_Floors = "Valid total floors are required.";
            if (formData.Floor_No < 0 || formData.Floor_No =='-0') errors.Floor_No = "Valid floors number is required.";
            if (!formData.H_Car_Parking) {
                errors.H_Car_Parking = "Please select parking availability.";
            }
            if (formData.H_Maintenance < 0) {
                errors.H_Maintenance = "Please enter valid Maintenance amount.";
            }
            if (!formData.H_Facing) errors.H_Facing = "Facing is required.";
            if (!formData.Project_Status) errors.Project_Status = "Project Status is required.";

            // if (!formData.Floor_No || formData.Floor_No <= 0) errors.Floor_No = "Valid floor number is required.";

        }

        if (formData.propertyType === "Lands_Plots") {
            if (!formData.L_Type) errors.L_Type = "Specific type (Land/Plot) type is required.";
            if (!formData.Length || formData.Length <= 0) errors.Length = "Valid length is required.";
            if (!formData.Breadth || formData.Breadth <= 0) errors.Breadth = "Valid breadth is required.";
            if (!formData.L_Facing) errors.L_Facing = "Facing is required.";
        }

        if (formData.propertyType === "Shops_Offices") {
            if (!formData.S_Type) errors.S_Type = "Specific type (Shop/Office) type is required.";
            if (!formData.S_Sqft || formData.S_Sqft <= 0) errors.S_Sqft = "Valid square feet is required.";
            if (!formData.Washrooms) {
                errors.Washrooms = "Please select washroom availability.";
            }
            if (!formData.S_Car_Parking) {
                errors.S_Car_Parking = "Please select parking availability.";
            }
            if(!formData.S_Furnishing) {
                errors.S_Furnishing = "Furnishing is required.";
            }
        }

        if (formData.propertyType === "PG_GuestHouses") {
            if (!formData.P_Type) errors.P_Type = "Specific type (PG/GuestHouse) type is required.";
            if (!formData.P_Furnishing) errors.P_Furnishing = "Furnishing type is required.";
            if (!formData.NumFloors || formData.NumFloors <= 0) errors.NumFloors = "Valid number of floors is required.";
            if (!formData.P_CarParking) {
                errors.P_CarParking = "Please select parking availability.";
            }
        }
        console.log(formData.propertyImage.length);
        // Image validation
        if (images.length === 0) {
            errors.propertyImage = "At least one property image is required.";
        }

        return errors;
    };

    const validateField = (name, value) => {
        let error = "";
        switch (name) {
            case "propertyName":
                if (!value.trim()) {
                    error = "Property name is required.";
                } else if (value.length > 50) {
                    error = "Property name must be under 50 characters.";
                } else if (!/^[A-Za-z\s]+$/.test(value)) {  // Only allows letters and spaces
                    error = "Property name must contain letters and spaces.";
                }
                break;

            case "propertyFor":
                if (!value) error = "Specific type (Rent/Sale) is required.";
                break;

            case "propertyPrice":
                if (!value || isNaN(value) ) {
                    error = "Valid Property price is required.";
                }
                else if(value <= 3000){
                    error = "Property price must be greater than 3000.";
                }
                break;

            case "propertyDescription":
                if (!value.trim()) {
                    error = "Description is required.";
                } else if (value.length > 500) {
                    error = "Description must be under 500 characters.";
                }
                // else if (/[^a-zA-Z0-9\s,.-:;"']/.test(value)) {
                //     error = "Description contains invalid characters.";
                // }
                break;

            case "propertyLocation":
                if (!value.trim()) {
                    error = "Property Address is required.";
                }
                else if (/[^a-zA-Z0-9\s,.\-#]/.test(value)) {
                    error = "Property Address contains invalid characters.";
                }
                break;

            case "ownerMobileNo":
                if (!value) error = "Mobile Number is required.";
                else if (!/^\d{10}$/.test(value)) {
                    error = "Mobile number must be a 10-digit number.";
                }
                else if (!/^[6-9]/.test(value)) {
                    error = "Mobile number must start with 6,7,8 or 9.";
                }
                break;

            case "propertyType":
                if (!value) error = "Property type is required.";
                break;

            case "H_Type":
                if (!value) error = "Specific type (House/Apartment) is required.";
                break;

            case "BHK":
                if (!value || value <= 0) {
                    error = "Valid number of bedroom(s) is/are required.";
                }
                else if (value > 20) {
                    error = "Number of Bedrooms cannot exceed 20.";
                }
                break;

            case "Bathrooms":
                if (!value || value <= 0) {
                    error = "Valid number of bathroom(s) is/are required.";
                }
                else if (value > 25) {
                    error = "Number of Bathrooms cannot exceed 25.";
                }
                break;

            case "H_Furnishing":
                if (!value) error = "Furnishing type is required.";
                break;

            case "H_Sqft":
                if (!value || value <= 0) error = "Valid sqft is required.";
                break;

            case "Total_Floors":
                if (!value ) error = "Number of Floors is required.";
                else if (value <0 || value=='-0') error = "Valid total floors are required.";
                break;
            case "H_Car_Parking":
                if (!value) error = "Please select parking availability.";
                break;
            case "H_Facing":
                if (!value) error = "Facing is required.";
                break;
            case "H_Maintenance":
                if (value =='-0') {
                    error = "Please enter valid Maintenance.";
                }
                break;
            case "Project_Status":
                if (!value) error = "Project Status is required.";
                break;
            case "Floor_No":
                if (value < 0 || value=='-0') {
                    error = "Please enter valid floor number.";
                }
                break;
            case "L_Type":
                if (!value) error = "Specific type (Land/Plot) type is required.";
                break;

            

            case "Length":
                if (!value || value <= 0) error = "Valid length is required.";
                break;

            case "Breadth":
                if (!value || value <= 0) error = "Valid breadth is required.";
                break;
            case "L_Facing":
                if (!value) error = "Facing is required.";
                break;

            case "S_Type":
                if (!value) error = "Specific type (Shops/Offices) is required.";
                break;
            case "S_Furnishing":
                if (!value) error = "Furnishing type is required.";
                break;
            case "S_Sqft":
                if (!value) error = "Sqft is required.";
                else if (value <= 0) error = "Sqft must be a positive number.";
                break;
            case "S_Car_Parking":
                if (!value) error = "Parking availability is required.";
                break;
            case "Washrooms":
                if (!value) error = "Washroom availability is required.";
                break;
            case "P_Type":
                if (!value) error = "Specific type (PG/Guest Houses) is required.";
                break;
            case "P_Furnishing":
                if (!value) error = "Furnishing type is required.";
                break;
            case "NumFloors":
                if (!value) error = "Number of floors is required.";
                else if (value < 0 || value=='-0') error = "Please enter valid Number of floors.";
                break;
            case "P_CarParking":
                if (!value) error = "Parking availability is required.";
                break;
            case "propertyImage":
                if (images.length === 0) error = "Please enter atleast one image."
            default:
                break;
        }

        setErrors({
            ...errors,
            [name]: error,
        });
    };


    const handleKeyDown = (event) => {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();
        }
    };
    const handleContextMenu = (event) => { event.preventDefault(); };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setImages(files);
        setFileCount(files.length); // Update state with the number of selected files

        setErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors.propertyImage; // Remove image error
            return newErrors;
        });

    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const errors = validateFormData();
        console.log(Object.keys(errors).length)
        if (Object.keys(errors).length > 0) {
            setErrors(errors);
        if (!toast.isActive("propertyErrorToast")) {
            toast.error("Please provide proper data for Property", {
                toastId: "propertyErrorToast", 
                position: "top-right",
                autoClose: 1500,
            });
        }
        
        setLoading(false);
        return;
        }

        const formErrors = Object.values(errors).filter((error) => error);
        if (!formErrors.length) {
            const form = new FormData();
            form.append("OwnerID", formData.ownerID);
            form.append("PropertyName", formData.propertyName);
            form.append("TransactionType", formData.propertyFor);
            form.append("PropertyPrice", formData.propertyPrice);
            form.append("PropertyDescription", formData.propertyDescription);
            form.append("PropertyLocation", formData.propertyLocation);
            form.append("OwnerMobileNo", formData.ownerMobileNo);
            form.append("PropertyType", formData.propertyType);
            form.append("L_Type", formData.L_Type);
            form.append("PlotArea", formData.PlotArea);
            form.append("Length", formData.Length);
            form.append("Breadth", formData.Breadth);
            form.append("L_Facing", formData.L_Facing);
            form.append("H_Type", formData.H_Type);
            form.append("BHK", formData.BHK);
            form.append("Bathrooms", formData.Bathrooms);
            form.append("H_Furnishing", formData.H_Furnishing);
            form.append("Project_Status", formData.Project_Status);
            form.append("H_Sqft", formData.H_Sqft);
            form.append("H_Maintenance", formData.H_Maintenance);
            form.append("Total_Floors", formData.Total_Floors);
            form.append("Floor_No", formData.Floor_No);
            form.append("H_Car_Parking", formData.H_Car_Parking);
            form.append("H_Facing", formData.H_Facing);
            form.append("S_Type", formData.S_Type);
            form.append("S_Furnishing", formData.S_Furnishing);
            form.append("S_Sqft", formData.S_Sqft);
            form.append("S_Car_Parking", formData.S_Car_Parking);
            form.append("Washrooms", formData.Washrooms);
            form.append("P_Type", formData.P_Type);
            form.append("P_Furnishing", formData.P_Furnishing);
            form.append("P_CarParking", formData.P_CarParking);
            form.append("NumFloors", formData.NumFloors);

            images.forEach((image) => form.append("PropertyImage", image));

            try {
                const response = await axios.post("/Owner/SellProperty", form, {
                    headers: { Authorization: `Bearer ${token}` },

                });
                if (response.data.status === "Success") {
                    toast.success("Property added successfully");

                    setFormData({
                        ownerID: localStorage.getItem("id") || "",
                        propertyName: "",
                        propertyFor: "",
                        propertyPrice: "",
                        propertyDescription: "",
                        propertyLocation: "",
                        ownerMobileNo: "",
                        propertyType: "",
                        H_Type: "",
                        BHK: "",
                        Bathrooms: "",
                        H_Furnishing: "",
                        Project_Status: "",
                        H_Sqft: "",
                        H_Maintenance: "",
                        Total_Floors: "",
                        Floor_No: "",
                        H_Car_Parking: "",
                        H_Facing: "",
                        L_Type: "",
                        PlotArea: "",
                        Length: "",
                        Breadth: "",
                        L_Facing: "",
                        S_Type: "",
                        S_Furnishing: "",
                        S_Sqft: "",
                        S_Car_Parking: "",
                        Washrooms: "",
                        P_Type: "",
                        P_Furnishing: "",
                        P_CarParking: "",
                        NumFloors: "",
                        propertyImage: [],
                    });
                    setImages([]); // Clear uploaded images
                    setErrors({}); // Clear any errors
                    setTimeout(() => {
                        navigate("/ownerlanding");
                    }, 3000); // 3-second delay
                }

            } catch (error) {
                alert(error.response?.data?.Message || "Error submitting the form.");
            }
            setLoading(false);
            fileInputRef.current.value = '';

        }

    };

    return (
        <>
            <div>
                <Ownernavbar />
            </div>
            <div className="main-div" style={{
                padding: "50px", fontFamily: "Arial, sans-serif",
                backgroundImage: "url('/property10.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}>
                <form className="main-form" onSubmit={handleSubmit} style={{ maxWidth: "600px", margin: "auto" }}>
                    <h1>Add Your Property</h1>
                    <div className="property-name-main">
                        <label className="property-name"><span style={{ color: "red" }}>*</span> Property Name:</label>
                        <input
                            type="text"
                            name="propertyName"
                            placeholder="Enter Property Name"
                            value={formData.propertyName}
                            onChange={handleChange}
                            onBlur={(e) => validateField(e.target.name, e.target.value)}
                            required
                        />
                        {errors.propertyName && <p style={{ color: "red" }}>{errors.propertyName}</p>}
                    </div>
                    <div className="property-for-main">
                        <label className="property-for"><span style={{ color: "red" }}>*</span> Property is For Rent/Sale:</label>
                        <select
                            name="propertyFor"
                            value={formData.propertyFor}
                            onChange={handleChange}
                            onBlur={(e) => validateField(e.target.name, e.target.value)}
                            required
                        >
                            <option value="">Select</option>
                            <option value="Sale">Sale</option>
                            <option value="Rent">Rent</option>
                        </select>
                        {errors.propertyFor && <p style={{ color: "red" }}>{errors.propertyFor}</p>}
                    </div>
                    <div className="price-main">
                        <label className="price"><span style={{ color: "red" }}>*</span> Price:</label>
                        <input
                            className="add-price"
                            type="number"
                            min="0"
                            name="propertyPrice"
                            placeholder="Enter Property Price"
                            onKeyDown={(e) => {
                                if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                                    e.preventDefault(); // Prevent arrow key increments/decrements
                                }
                                handleKeyDown(e);
                            }}
                            onWheel={(e) => e.target.blur()} // Disable mouse wheel behavior
                            onContextMenu={handleContextMenu}
                            value={formData.propertyPrice}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === "" || Number(value) >= 0) {
                                    handleChange({ target: { name: "propertyPrice", value } });
                                }
                            }}
                            onBlur={(e) => validateField(e.target.name, e.target.value)}
                            required
                        />
                        {errors.propertyPrice && <p style={{ color: "red" }}>{errors.propertyPrice}</p>}
                    </div>
                    <div className="Description-main">
                        <label className="description"><span style={{ color: "red" }}>*</span> Description:</label>
                        <textarea
                            name="propertyDescription"
                            placeholder="Enter Property Description"
                            value={formData.propertyDescription}
                            onChange={handleChange}
                            onBlur={(e) => validateField(e.target.name, e.target.value)}
                            required
                        />
                        {errors.propertyDescription && <p style={{ color: "red" }}>{errors.propertyDescription}</p>}
                    </div>
                    <div className="Location-main">
                        <label className="location"><span style={{ color: "red" }}>*</span> Address:</label>
                        <input
                            type="text"
                            name="propertyLocation"
                            placeholder="Enter Property Address"
                            value={formData.propertyLocation}
                            onChange={handleChange}
                            onBlur={(e) => validateField(e.target.name, e.target.value)}
                            required
                        />
                        {errors.propertyLocation && <p style={{ color: "red" }}>{errors.propertyLocation}</p>}
                    </div>
                    <div className="owner-mobile-no-main">
                        <label className="owner-mobile-no"><span style={{ color: "red" }}>*</span> Owner Mobile No:</label>
                        <input
                            type="text"
                            name="ownerMobileNo"
                            placeholder="Enter Owner Mobile Number"
                            value={formData.ownerMobileNo}
                            onChange={handleChange}
                            onBlur={(e) => validateField(e.target.name, e.target.value)}
                            required
                        />
                        {errors.ownerMobileNo && <p style={{ color: "red" }}>{errors.ownerMobileNo}</p>}
                    </div>

                    <div className="property-type-main">
                        <label className="property-type"><span style={{ color: "red" }}>*</span> Property Type:</label>
                        <select
                            name="propertyType"
                            value={formData.propertyType}
                            onChange={handleChange}
                            onBlur={(e) => validateField(e.target.name, e.target.value)}
                            required
                        >
                            <option value="">Select</option>
                            <option value="Lands_Plots">Lands/Plots</option>
                            <option value="Houses_Apartments">Houses/Apartments</option>
                            <option value="PG_GuestHouses">PG/Guest Houses</option>
                            <option value="Shops_Offices">Shops/Offices</option>
                        </select>
                        {errors.propertyType && <p style={{ color: "red" }}>{errors.propertyType}</p>}
                    </div>

                    {formData.propertyType === "Lands_Plots" && (
                        <div className="Main-divv">
                            <div className="specific-type-land-plots-main">
                                <label className="specific-type-landplots"><span style={{ color: "red" }}>*</span> Specific Type:</label>
                                <select
                                    name="L_Type"
                                    value={formData.L_Type}
                                    onChange={handleChange}
                                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                                    required
                                >
                                    <option value="">Select</option>
                                    <option value="Lands">Lands</option>
                                    <option value="Plots">Plots</option>
                                </select>
                                {errors.L_Type && <p style={{ color: "red" }}>{errors.L_Type}</p>}
                            </div>
                            <div className="Length-main">
                                <label className="length"><span style={{ color: "red" }}>*</span> Length(in sqft):</label>
                                <input
                                    type="number"
                                    placeholder="Enter Length in sqft"
                                    min="0"
                                    name="Length"
                                    onKeyDown={(e) => {
                                        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                                            e.preventDefault(); // Prevent arrow key increments/decrements
                                        }
                                        handleKeyDown(e);
                                    }}
                                    onWheel={(e) => e.target.blur()} // Disable mouse wheel behavior
                                    onContextMenu={handleContextMenu}
                                    value={formData.Length}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === "" || Number(value) >= 0) {
                                            handleLengthChange(e);
                                        }
                                    }}
                                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                                    required
                                />
                                {errors.Length && <p style={{ color: "red" }}>{errors.Length}</p>}
                            </div>
                            <div className="breadth-main">
                                <label className="breadth"><span style={{ color: "red" }}>*</span> Breadth(in sqft):</label>
                                <input
                                    type="number"
                                    placeholder="Enter Breadth in sqft"
                                    min="0"
                                    name="Breadth"
                                    onKeyDown={(e) => {
                                        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                                            e.preventDefault(); // Prevent arrow key increments/decrements
                                        }
                                        handleKeyDown(e);
                                    }}
                                    onWheel={(e) => e.target.blur()} // Disable mouse wheel behavior
                                    onContextMenu={handleContextMenu}
                                    value={formData.Breadth}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === "" || Number(value) >= 0) {
                                            handleBreadthChange(e);
                                        }
                                    }}
                                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                                    required
                                />
                                {errors.Breadth && <p style={{ color: "red" }}>{errors.Breadth}</p>}
                            </div>
                            <div className="plot-area-main">
                                <label className="plot-area">Plot Area (in yards):</label>
                                <input
                                    type="number"
                                    min="0"
                                    name="PlotArea"
                                    value={formData.PlotArea}
                                    style={{ backgroundColor: 'lightgrey' }}
                                    readOnly
                                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                                    required
                                />
                                {errors.PlotArea && <p style={{ color: "red" }}>{errors.PlotArea}</p>}
                            </div>

                            <div className="facing-landplots-main">
                                <label className="facing-landplots"><span style={{ color: "red" }}>*</span> Facing:</label>
                                <select
                                    name="L_Facing"
                                    value={formData.L_Facing}
                                    onChange={handleChange}
                                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                                    required
                                >
                                    <option value="">Select</option>
                                    <option value="East">East</option>
                                    <option value="West">West</option>
                                    <option value="South">South</option>
                                    <option value="North">North</option>
                                    <option value="South-East">South-East</option>
                                    <option value="South-West">South-West</option>
                                    <option value="North-East">North-East</option>
                                    <option value="North-West">North-West</option>
                                </select>
                                {errors.L_Facing && <p style={{ color: "red" }}>{errors.L_Facing}</p>}
                            </div>
                        </div>
                    )}

                    {formData.propertyType === "Houses_Apartments" && (
                        <div>
                            <div className="specific-type-house-apartments-main">
                                <label className="specific-type-house-apartments"><span style={{ color: "red" }}>*</span> Specific Type:</label>
                                <select
                                    name="H_Type"
                                    value={formData.H_Type}
                                    onChange={handleChange}
                                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                                    required
                                >
                                    <option value="">Select</option>
                                    <option value="Houses">Houses</option>
                                    <option value="Apartments">Apartments</option>
                                </select>
                                {errors.H_Type && <p style={{ color: "red" }}>{errors.H_Type}</p>}
                            </div>
                            <div className="no-of-bedrooms-main">
                                <label className="no-of-bedrooms"><span style={{ color: "red" }}>*</span> Number of Bedrooms:</label>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Enter Number of Bedrooms"
                                    name="BHK"
                                    onKeyDown={(e) => {
                                        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                                            e.preventDefault(); // Prevent arrow key increments/decrements
                                        }
                                        handleKeyDown(e);
                                    }}
                                    onWheel={(e) => e.target.blur()} // Disable mouse wheel behavior
                                    onContextMenu={handleContextMenu}
                                    value={formData.BHK}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === "" || Number(value) >= 0) {
                                            handleChange({ target: { name: "BHK", value } });
                                        }
                                    }}
                                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                                    required
                                />
                                {errors.BHK && <p style={{ color: "red" }}>{errors.BHK}</p>}
                            </div>
                            <div className="no-of-bathrooms-main">
                                <label className="no-of-bathrooms"><span style={{ color: "red" }}>*</span> Number of Bathrooms:</label>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Enter Number of Bathrooms"
                                    name="Bathrooms"
                                    onKeyDown={(e) => {
                                        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                                            e.preventDefault(); // Prevent arrow key increments/decrements
                                        }
                                        handleKeyDown(e);
                                    }}
                                    onWheel={(e) => e.target.blur()} // Disable mouse wheel behavior
                                    onContextMenu={handleContextMenu}
                                    value={formData.Bathrooms}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === "" || Number(value) >= 0) {
                                            handleChange({ target: { name: "Bathrooms", value } });
                                        }
                                    }}
                                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                                    required
                                />
                                {errors.Bathrooms && <p style={{ color: "red" }}>{errors.Bathrooms}</p>}
                            </div>
                            <div className="furnishing-house-apartments-main">
                                <label className="furnishing-house-apartments"><span style={{ color: "red" }}>*</span> Furnishing:</label>
                                <select
                                    name="H_Furnishing"
                                    value={formData.H_Furnishing}
                                    onChange={handleChange}
                                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                                    required
                                >
                                    <option value="">Select</option>
                                    <option value="Furnished">Furnished</option>
                                    <option value="Semi-Furnished">Semi-Furnished</option>
                                    <option value="UnFurnished">UnFurnished</option>
                                </select>
                                {errors.H_Furnishing && <p style={{ color: "red" }}>{errors.H_Furnishing}</p>}
                            </div>
                            <div className="property-status-main">
                                <label className="property-status"><span style={{ color: "red" }}>*</span> Project_Status:</label>
                                <select
                                    name="Project_Status"
                                    value={formData.Project_Status}
                                    onChange={handleChange}
                                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                                    required
                                >
                                    <option value="">Select</option>
                                    <option value="New Launch">New Launch</option>
                                    <option value="Ready to Move">Ready to Move</option>
                                    <option value="Under Construction">Under Construction</option>
                                </select>
                                {errors.Project_Status && <p style={{ color: "red" }}>{errors.Project_Status}</p>}
                            </div>
                            <div className="no-of-sqft-house-apartments-main">
                                <label className="no-of-sqft-house-apartments"><span style={{ color: "red" }}>*</span> Number of Sqft:</label>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Enter Number of Sqft"
                                    name="H_Sqft"
                                    onKeyDown={(e) => {
                                        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                                            e.preventDefault(); // Prevent arrow key increments/decrements
                                        }
                                        handleKeyDown(e);
                                    }}
                                    onWheel={(e) => e.target.blur()} // Disable mouse wheel behavior
                                    onContextMenu={handleContextMenu}
                                    value={formData.H_Sqft}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === "" || Number(value) >= 0) {
                                            handleChange({ target: { name: "H_Sqft", value } });
                                        }
                                    }}
                                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                                    required
                                />
                                {errors.H_Sqft && <p style={{ color: "red" }}>{errors.H_Sqft}</p>}
                            </div>
                            <div className="maintenance-amount-main">
                                <label className="maintenance-amount">Maintenance Amount:</label>
                                <input
                                    type="number"
                                    min="0"
                                    name="H_Maintenance"
                                    placeholder="Enter Maintenance amount"
                                    onKeyDown={(e) => {
                                        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                                            e.preventDefault(); // Prevent arrow key increments/decrements
                                        }
                                        handleKeyDown(e);
                                    }}
                                    onWheel={(e) => e.target.blur()} // Disable mouse wheel behavior
                                    onContextMenu={handleContextMenu}
                                    value={formData.H_Maintenance}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === "" || Number(value) >= 0) {
                                            handleChange({ target: { name: "H_Maintenance", value } });
                                        }
                                    }}
                                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                                />
                                {errors.H_Maintenance && <p style={{ color: "red" }}>{errors.H_Maintenance}</p>}
                            </div>
                            <div className="no-of-floors-house-apartments-main">
                                <label className="no-of-floors-house-apartments"><span style={{ color: "red" }}>*</span> Number of Floors:</label>
                                <input
                                    type="number"
                                    min="0"
                                    name="Total_Floors"
                                    placeholder="Enter Number of Floors"
                                    onKeyDown={(e) => {
                                        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                                            e.preventDefault(); // Prevent arrow key increments/decrements
                                        }
                                        handleKeyDown(e);
                                    }}
                                    onWheel={(e) => e.target.blur()} // Disable mouse wheel behavior
                                    onContextMenu={handleContextMenu}
                                    value={formData.Total_Floors}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === "" || Number(value) >= 0) {
                                            handleChange({ target: { name: "Total_Floors", value } });
                                        }
                                    }}
                                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                                    required
                                />
                                {errors.Total_Floors && <p style={{ color: "red" }}>{errors.Total_Floors}</p>}
                            </div>
                            <div className="floor-number-main">
                                <label className="floor-number">Flat Number:</label>
                                <input
                                    type="number"
                                    min="0"
                                    name="Floor_No"
                                    placeholder="Enter Flat Number"
                                    onKeyDown={(e) => {
                                        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                                            e.preventDefault(); // Prevent arrow key increments/decrements
                                        }
                                        handleKeyDown(e);
                                    }}
                                    onWheel={(e) => e.target.blur()} // Disable mouse wheel behavior
                                    onContextMenu={handleContextMenu}
                                    value={formData.Floor_No}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === "" || Number(value) >= 0) {
                                            handleChange({ target: { name: "Floor_No", value } });
                                        }
                                    }}
                                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                                />
                                {errors.Floor_No && <p style={{ color: "red" }}>{errors.Floor_No}</p>}
                            </div>
                            <div className="facing-house-apartments-main">
                                <label className="facing-house-apartments"><span style={{ color: "red" }}>*</span> Facing:</label>
                                <select
                                    name="H_Facing"
                                    value={formData.H_Facing}
                                    onChange={handleChange}
                                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                                    required
                                >
                                    <option value="">Select</option>
                                    <option value="East">East</option>
                                    <option value="West">West</option>
                                    <option value="South">South</option>
                                    <option value="North">North</option>
                                    <option value="South-East">South-East</option>
                                    <option value="South-West">South-West</option>
                                    <option value="North-East">North-East</option>
                                    <option value="North-West">North-West</option>
                                </select>
                                {errors.H_Facing && <p style={{ color: "red" }}>{errors.H_Facing}</p>}
                            </div>
                            <div className="car-parking-available-house-apartments-main">
                                <div className="radio-group">
                                    <span className="label-text"><span style={{ color: "red" }}>*</span> Parking Availability:</span> {/* Added span for the label */}
                                    <label>
                                        <input type="radio" name="H_Car_Parking" value="Yes" checked={formData.H_Car_Parking === "Yes"} onChange={handleChange} onBlur={(e) => validateField(e.target.name, e.target.value)} /> Yes
                                    </label>
                                    <label>
                                        <input type="radio" name="H_Car_Parking" value="No" checked={formData.H_Car_Parking === "No"} onChange={handleChange} onBlur={(e) => validateField(e.target.name, e.target.value)} /> No
                                    </label>
                                </div>
                                {errors.H_Car_Parking && <p style={{ color: "red" }}>{errors.H_Car_Parking}</p>}
                            </div>
                        </div>
                    )}

                    {formData.propertyType === "Shops_Offices" && (
                        <div>
                            <div className="selecting-type-shops-offices-main">
                                <label className="selecting-type-shops-offices"><span style={{ color: "red" }}>*</span> Select Type:</label>
                                <select
                                    name="S_Type"
                                    value={formData.S_Type}
                                    onChange={handleChange}
                                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                                    required
                                >
                                    <option value="">Select</option>
                                    <option value="Shops">Shops</option>
                                    <option value="Offices">Offices</option>
                                </select>
                                {errors.S_Type && <p style={{ color: "red" }}>{errors.S_Type}</p>}
                            </div>
                            <div className="furnished-shops-offices-main">
                                <label className="furnished-shops-offices"><span style={{ color: "red" }}>*</span> Furnishing:</label>
                                <select
                                    name="S_Furnishing"
                                    value={formData.S_Furnishing}
                                    onChange={handleChange}
                                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                                    required
                                >
                                    <option value="">Select</option>
                                    <option value="Furnished">Furnished</option>
                                    <option value="Semi-Furnished">Semi-Furnished</option>
                                    <option value="UnFurnished">UnFurnished</option>
                                </select>
                                {errors.S_Furnishing && <p style={{ color: "red" }}>{errors.S_Furnishing}</p>}
                            </div>
                            <div className="no-sqft-shops-offices-main">
                                <label className="no-sqft-shops-offices"><span style={{ color: "red" }}>*</span> Number of Sqft:</label>
                                <input
                                    type="number"
                                    min="0"
                                    name="S_Sqft"
                                    placeholder="Enter Number of Sqft"
                                    onKeyDown={(e) => {
                                        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                                            e.preventDefault(); // Prevent arrow key increments/decrements
                                        }
                                        handleKeyDown(e);
                                    }}
                                    onWheel={(e) => e.target.blur()} // Disable mouse wheel behavior
                                    onContextMenu={handleContextMenu}
                                    value={formData.S_Sqft}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === "" || Number(value) >= 0) {
                                            handleChange({ target: { name: "S_Sqft", value } });
                                        }
                                    }}
                                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                                    required
                                />
                                {errors.S_Sqft && <p style={{ color: "red" }}>{errors.S_Sqft}</p>}
                            </div>
                            <div className="car-parking-shops-offices-main">
                                <div className="radio-group">
                                    <span className="label-text"><span style={{ color: "red" }}>*</span> Parking Availability:</span> {/* Added span for the label */}
                                    <label>
                                        <input type="radio" name="S_Car_Parking" value="Yes" checked={formData.S_Car_Parking === "Yes"} onChange={handleChange} onBlur={(e) => validateField(e.target.name, e.target.value)} /> Yes
                                    </label>
                                    <label>
                                        <input type="radio" name="S_Car_Parking" value="No" checked={formData.S_Car_Parking === "No"} onChange={handleChange} onBlur={(e) => validateField(e.target.name, e.target.value)} /> No
                                    </label>
                                </div>
                                {errors.S_Car_Parking && <p style={{ color: "red" }}>{errors.S_Car_Parking}</p>}
                            </div>
                            <div className="Washrooms-main">
                                <div className="radio-group">
                                    <span className="label-text"><span style={{ color: "red" }}>*</span> Wash Room Availability:</span> {/* Added span for the label */}
                                    <label>
                                        <input type="radio" name="Washrooms" value="Yes" checked={formData.Washrooms === "Yes"} onChange={handleChange} onBlur={(e) => validateField(e.target.name, e.target.value)} /> Yes
                                    </label>
                                    <label>
                                        <input type="radio" name="Washrooms" value="No" checked={formData.Washrooms === "No"} onChange={handleChange} onBlur={(e) => validateField(e.target.name, e.target.value)} /> No
                                    </label>
                                </div>
                                {errors.Washrooms && <p style={{ color: "red" }}>{errors.Washrooms}</p>}
                            </div>
                        </div>
                    )}

                    {formData.propertyType === "PG_GuestHouses" && (
                        <div>
                            <div className="specific-type-pg-guesthouse-main">
                                <label className="specific-type-pg-guesthouse"><span style={{ color: "red" }}>*</span> Select Type:</label>
                                <select
                                    name="P_Type"
                                    value={formData.P_Type}
                                    onChange={handleChange}
                                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                                    required
                                >
                                    <option value="">Select</option>
                                    <option value="PGs">PGs</option>
                                    <option value="Guest Houses">Guest Houses</option>
                                </select>
                                {errors.P_Type && <p style={{ color: "red" }}>{errors.P_Type}</p>}
                            </div>
                            <div className="furnishing-pg-guesthouse-main">
                                <label className="furnishing-pg-guesthouse"><span style={{ color: "red" }}>*</span> Furnishing:</label>
                                <select
                                    name="P_Furnishing"
                                    value={formData.P_Furnishing}
                                    onChange={handleChange}
                                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                                    required
                                >
                                    <option value="">Select</option>
                                    <option value="Furnished">Furnished</option>
                                    <option value="Semi-Furnished">Semi-Furnished</option>
                                    <option value="UnFurnished">UnFurnished</option>
                                </select>
                                {errors.P_Furnishing && <p style={{ color: "red" }}>{errors.P_Furnishing}</p>}
                            </div>
                            <div className="no-of-floors-pg-guesthouse-main">
                                <label className="no-of-floors-pg-guesthouse-main"><span style={{ color: "red" }}>*</span> Number of Floors:</label>
                                <input
                                    type="number"
                                    min="0"
                                    name="NumFloors"
                                    placeholder="Enter Number of Floors"
                                    onKeyDown={(e) => {
                                        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                                            e.preventDefault(); // Prevent arrow key increments/decrements
                                        }
                                        handleKeyDown(e);
                                    }}
                                    onWheel={(e) => e.target.blur()} // Disable mouse wheel behavior
                                    onContextMenu={handleContextMenu}
                                    value={formData.NumFloors}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === "" || Number(value) >= 0) {
                                            handleChange({ target: { name: "NumFloors", value } });
                                        }
                                    }}
                                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                                    required
                                />
                                {errors.NumFloors && <p style={{ color: "red" }}>{errors.NumFloors}</p>}
                            </div>
                            <div className="car-parking-pg-guesthouse-main">
                                <div className="radio-group">
                                    <span className="label-text"><span style={{ color: "red" }}>*</span> Parking Availability:</span> {/* Added span for the label */}
                                    <label>
                                        <input type="radio" name="P_CarParking" value="Yes" checked={formData.P_CarParking === "Yes"} onChange={handleChange} onBlur={(e) => validateField(e.target.name, e.target.value)} /> Yes
                                    </label>
                                    <label>
                                        <input type="radio" name="P_CarParking" value="No" checked={formData.P_CarParking === "No"} onChange={handleChange} onBlur={(e) => validateField(e.target.name, e.target.value)} /> No
                                    </label>
                                </div>
                                {errors.P_CarParking && <p style={{ color: "red" }}>{errors.P_CarParking}</p>}
                            </div>
                        </div>
                    )}



                    <div className="upload-images-main">
                        <span className="label-text-main"><span style={{ color: "red" }}>*</span> Upload Image:</span>
                        <Button
                            component="label"
                            role={undefined}
                            variant="contained"
                            tabIndex={-1}
                            startIcon={<CloudUploadIcon />}

                        >
                            Upload files
                            <VisuallyHiddenInput
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                multiple
                                accept="image/*"
                                required
                            />
                        </Button>
                        {fileCount > 0 && (
                            <div>
                                <h4 style={{
                                    fontFamily: 'Arial, sans-serif',  /* Apply custom font */
                                    fontSize: '18px',                /* Set font size */
                                    fontWeight: 'bold',              /* Make text bold */
                                    color: '#333',                   /* Set text color */
                                    marginTop: '20px',
                                    marginLeft: '20px',
                                    color: 'blue'
                                }}>{fileCount} file{fileCount > 1 ? 's' : ''} selected</h4>
                            </div>
                        )}
                        {errors.propertyImage && <p style={{ color: "red" }}>{errors.propertyImage}</p>}
                    </div>

                    <button type="submit" onClick={handleSubmit} disabled={loading}>
                        {loading ? "Submitting..." : "Submit Property"}
                    </button>
                </form>
            </div>

        </>
    );
};

export default Addproperty;