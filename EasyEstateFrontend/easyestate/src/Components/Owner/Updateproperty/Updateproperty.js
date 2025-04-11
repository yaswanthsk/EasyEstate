import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import './Updateproperty.css';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Ownernavbar from '../Ownernavbar/Ownernavbar';
import axios from '../../axios';
import {toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function UpdateProperty() {
    const [searchParams] = useSearchParams();
    const propertyId = searchParams.get('propertyId');
    const [images, setImages] = useState([]);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const[loading,setLoading]=useState(false);
    // State to store property details
    const [property, setProperty] = useState({
        // Basic details
        propertyName: '',
        propertyFor: '',
        propertyPrice: '',
        propertyDescription: '',
        propertyLocation: '',
        ownerMobileNo: '',
        propertyType: '',
        propertyImage: [],
        existingImages: [], // To store existing images
        newImages: [] // To store newly selected images
    });

    const token = localStorage.getItem("token");

    const handleKeyDown = (event) => {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();
        }
    };
    const handleContextMenu = (event) => { event.preventDefault(); };

    // State for specific property type fields
    const [typeFields, setTypeFields] = useState({
        h_Type: "",
        bhk: "",
        bathrooms: "",
        h_Furnishing: "",
        project_Status: "",
        h_Sqft: "",
        h_Maintenance: "",
        total_Floors: "",
        floor_No: "",
        h_Car_Parking: "",
        h_Facing: "",
        l_Type: "",
        plotArea: "",
        length: "",
        breadth: "",
        l_Facing: "",
        s_Type: "",
        s_Furnishing: "",
        s_Sqft: "",
        s_Car_Parking: "",
        washrooms: "",
        p_Type: "",
        p_Furnishing: "",
        p_CarParking: "",
        numFloors: "",
    });

    const [fileCount, setFileCount] = useState(0); // State to store file count
    const fileInputRef = useRef(null);

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

    // Fetch existing property details on component mount
    useEffect(() => {
        const fetchPropertyDetails = async () => {
            try {
                // Replace with your actual API endpoint
                // const response = await fetch(`http://localhost:5253/api/Owner/GetPropertyById/${propertyId}`);
                // const data = await response.json();
                const response = await axios.get(`/Owner/GetPropertyById/${propertyId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = response.data;

                // Set basic property details
                setProperty({
                    propertyName: data.property.propertyName,
                    propertyFor: data.property.propertyFor,
                    propertyPrice: data.property.propertyPrice,
                    propertyDescription: data.property.propertyDescription,
                    propertyLocation: data.property.propertyLocation,
                    ownerMobileNo: data.property.ownerMobileNo,
                    propertyType: data.property.propertyType,
                    propertyImage: data.property.propertyImage,
                    existingImages: data.property.existingImages,
                    newImages: []
                });

                setTypeFields({
                    l_Type: data.property.l_Type || '',
                    plotArea: data.property.plotArea || '',
                    length: data.property.length || '',
                    breadth: data.property.breadth || '',
                    l_Facing: data.property.l_Facing || '',
                    h_Type: data.property.h_Type || '',
                    bhk: data.property.bhk || '',
                    bathrooms: data.property.bathrooms || '',
                    h_Furnishing: data.property.h_Furnishing || '',
                    project_Status: data.property.project_Status || '',
                    h_Sqft: data.property.h_Sqft || '',
                    h_Maintenance: data.property.h_Maintenance || '',
                    total_Floors: data.property.total_Floors || '',
                    floor_No: data.property.floor_No || '',
                    h_Car_Parking: data.property.h_Car_Parking || '',
                    h_Facing: data.property.h_Facing || '',

                    s_Type: data.property.s_Type || '',
                    s_Furnishing: data.property.s_Furnishing || '',
                    s_Sqft: data.property.s_Sqft || '',
                    s_Car_Parking: data.property.s_Car_Parking || '',
                    washrooms: data.property.washrooms || '',
                    p_Type: data.property.p_Type || '',
                    p_Furnishing: data.property.p_Furnishing || '',
                    p_CarParking: data.property.p_CarParking || '',
                    numFloors: data.property.numFloors || '',
                })
            } catch (error) {
                console.error('Error fetching property details:', error);
            }
        };

        console.log('Type Fields:', typeFields);

        fetchPropertyDetails();
    }, [propertyId]);

    // Handle input changes for basic details
    const handleInputChange = (e) => {
        const { name, value, files } = e.target;

        // Handle multiple file input
        if (name === 'newImages') {
            setProperty(prev => ({
                ...prev,
                newImages: [...prev.newImages, ...Array.from(files)]
            }));
        } else {
            setProperty(prev => ({
                ...prev,
                [name]: value
            }));
        }
        // Validate input in real-time
        validateField(name, value);
    };

    // Function to calculate Plot Area based on Length and Breadth
    const calculatePlotArea = () => {
        const { length, breadth } = typeFields;
        if (length && breadth) {
            const area = (parseFloat(length) * parseFloat(breadth)) / 9; // Convert square feet to square yards
            const roundedArea = parseFloat(area.toFixed(2)); // Round to 2 decimal places
            setTypeFields((prevState) => ({
                ...prevState,
                plotArea: roundedArea, // Set calculated plot area
            }));
        }
    };

    // Effect to calculate PlotArea whenever Length or Breadth changes
    useEffect(() => {
        if (typeFields.length && typeFields.breadth) {
            calculatePlotArea();
        }
    }, [typeFields.length, typeFields.breadth]);

    // Handle Length change
    const handleLengthChange = (e) => {
        const value = e.target.value;
        if (value === "" || /^[0-9]+(\.[0-9]*)?$/.test(value)) {
            setTypeFields((prevState) => ({
                ...prevState,
                length: value,
            }));
        }
    };

    // Handle Breadth change
    const handleBreadthChange = (e) => {
        const value = e.target.value;
        if (value === "" || /^[0-9]+(\.[0-9]*)?$/.test(value)) {
            setTypeFields((prevState) => ({
                ...prevState,
                breadth: value,
            }));
        }
    };

    const validateField = (name, value) => {
        let error = "";
        console.log(value);
        switch (name) {
            case "propertyName":
                console.log(name);
                if (!value.trim()) {
                    console.log(value);
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
                if(!value || isNaN(value)){
                    error = "Property price is required.";
                }
                else if (value <= 3000) {
                    error = "Property price must be greater than 3000.";
                }
                break;
            case "propertyDescription":
                if (!value.trim()) {
                    error = "Description is required.";
                } else if (value.length > 500) {
                    error = "Description must be under 500 characters.";
                }
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

            //Validations for Lands_plots
            case "l_Type":
                if (!value) error = "Specific type (Land/Plot) is required.";
                break;
            case "plotArea":
                if (!value || value <= 0) error = "Valid plot area is required.";
                break;
            case "length":
                if (!value || value <= 0) error = "Valid length is required.";
                break;
            case "breadth":
                if (!value || value <= 0) error = "Valid breadth is required.";
                break;
            case "l_Facing":
                if (!value) error = "Facing is required.";
                break;

            //Validations for House_aprtments
            case "h_Type":
                if (!value) error = "Specific type (House/Apartment) is required.";
                break;
            case "bhk":
                if (!value || value <= 0) {
                    error = "Valid number of bedroom(s) is/are required.";
                }
                else if (value > 20) {
                    error = "Number of Bedrooms cannot exceed 20.";
                }
                break;
            case "bathrooms":
                if (!value || value <= 0) {
                    error = "Valid number of bathroom(s) is/are required.";
                }
                else if (value > 25) {
                    error = "Number of Bathrooms cannot exceed 25.";
                }
                break;
            case "h_Furnishing":
                if (!value) error = "Furnishing type is required.";
                break;
            case "project_Status":
                if (!value) error = "Project Status is required.";
                break;
            case "h_Sqft":
                if (!value) {
                    error = "Sqft is Required.";
                    break;
                }
                if (value <= 0) {
                    error = "Please enter valid Sqft."; 
                    break;
                }
               
            case "h_Maintenance":
                if (value < 0 || value == '-0') {
                    error = "Please enter valid Maintenance amount.";
                    break;
                }
            case "total_Floors":
                if (!value || value=='-0') {
                    error = " Number of Floors are Required.";
                    break;
                }
                if (value < 0) {
                    error = "Valid total floors are required.";
                    
                }
               
            case "floor_No":
                if (value < 0 || value=='-0') {
                    error = "Valid floor number is required.";
                    break;
                }
            case "h_Facing":
                if (!value) {error = "Facing is required.";}
                break;

            //Validations for Shop_offices
            case "s_Type":
                if (!value) error = "Specific type (Shops/Offices) is required.";
                break;
            case "s_Furnishing":
                if (!value) error = "Furnishing type is required.";
                break;
            case "s_Sqft":
                if (!value) error = "Sqft is required.";
                else if (value <= 0) error = "Sqft must be a positive number.";
                break;

            //Validations for PGs_GuestHouses
            case "p_Type":
                if (!value) error = "Specific type (PG/Guest Houses) is required.";
                break;
            case "p_Furnishing":
                if (!value) error = "Furnishing type is required.";
                break;
            case "numFloors":
                if (!value) error = "Number of Floors is required.";
                else if (value < 0 || value=='-0') error = "Please enter valid Number of floors.";
                break;
        }

        setErrors({
            ...errors,
            [name]: error,
        });
    };

    // Remove image from new images
    const removeNewImage = (index) => {
        setProperty(prev => ({
            ...prev,
            newImages: prev.newImages.filter((_, i) => i !== index)
        }));
    };


    // Handle input changes for type-specific details
    const handleTypeFieldChange = (e) => {
        const { name, value } = e.target;
        setTypeFields(prev => ({
            ...prev,
            [name]: value
        }));
        // Validate input in real-time
        validateField(name, value);
    };

    // Render type-specific input fields
    const renderTypeSpecificFields = () => {
        switch (property.propertyType.toLowerCase()) {
            case 'lands_plots':
                return (
                    <>
                        <div>
                            <label>Specific Type:</label>
                            <input
                                className='SpecificType'
                                name="l_Type"
                                value={typeFields.l_Type}
                                readOnly
                                style={{ backgroundColor: 'lightgrey' }}
                                onBlur={(e) => validateField(e.target.name, e.target.value)}
                            />
                            {/* <select className='SpecificType'
                                name="l_Type"
                                value={typeFields.l_Type}
                                onChange={handleTypeFieldChange}
                                onBlur={(e) => validateField(e.target.name, e.target.value)}
                            >
                                <option value="">Select</option>
                                <option value="Lands">Lands</option>
                                <option value="Plots">Plots</option>
                            </select> */}
                            {/* {errors.l_Type && <p style={{ color: "red" }}>{errors.l_Type}</p>} */}
                        </div>
                        <div className='length'>
                            <label>Length(in sqft)</label>
                            <input
                                className="updateInput"
                                type="number"
                                min="0"
                                name="length"
                                onKeyDown={(e) => {
                                    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                                        e.preventDefault(); // Prevent arrow key increments/decrements
                                    }
                                    handleKeyDown(e);
                                }}
                                onWheel={(e) => e.target.blur()} // Disable mouse wheel behavior
                                onContextMenu={handleContextMenu}
                                value={typeFields.length}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "" || Number(value) >= 0) {
                                        handleLengthChange(e);
                                    }
                                }}
                                onBlur={(e) => validateField(e.target.name, e.target.value)}
                            />
                            {errors.length && <p style={{ color: "red" }}>{errors.length}</p>}
                        </div>
                        <div className='breadth'>
                            <label>Breadth(in sqft)</label>
                            <input
                                className="updateInput"
                                type="number"
                                min="0"
                                name="breadth"
                                onKeyDown={(e) => {
                                    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                                        e.preventDefault(); // Prevent arrow key increments/decrements
                                    }
                                    handleKeyDown(e);
                                }}
                                onWheel={(e) => e.target.blur()} // Disable mouse wheel behavior
                                onContextMenu={handleContextMenu}
                                value={typeFields.breadth}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "" || Number(value) >= 0) {
                                        handleBreadthChange(e);
                                    }
                                }}
                                onBlur={(e) => validateField(e.target.name, e.target.value)}
                            />
                            {errors.breadth && <p style={{ color: "red" }}>{errors.breadth}</p>}
                        </div>
                        <div className='plot-area'>
                            <label>Plot Area</label>
                            <input
                                className="updateInput"
                                type="number"
                                min="0"
                                name="plotArea"
                                value={typeFields.plotArea}
                                style={{ backgroundColor: 'lightgrey' }}
                                readOnly
                                onBlur={(e) => validateField(e.target.name, e.target.value)}
                            />
                            {errors.plotArea && <p style={{ color: "red" }}>{errors.plotArea}</p>}
                        </div>
                        <div>
                            <label>Facing:</label>
                            <select className='land-plots-facing'
                                name="l_Facing"
                                value={typeFields.l_Facing}
                                onChange={handleTypeFieldChange}
                                onBlur={(e) => validateField(e.target.name, e.target.value)}
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
                            {errors.l_Facing && <p style={{ color: "red" }}>{errors.l_Facing}</p>}
                        </div>
                    </>
                );
            case 'houses_apartments':
                return (
                    <>
                        <div>
                            <label>Specific Type:</label>
                            <input
                                className='SpecificType'
                                name="h_Type"
                                value={typeFields.h_Type}
                                readOnly
                                style={{ backgroundColor: 'lightgrey' }}
                                onBlur={(e) => validateField(e.target.name, e.target.value)}
                            />
                        </div>
                        <div className='bhk'>
                            <label>BHK</label>
                            <input
                                className="updateInput"
                                type="number"
                                min="0"
                                name="bhk"
                                onKeyDown={(e) => {
                                    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                                        e.preventDefault(); // Prevent arrow key increments/decrements
                                    }
                                    handleKeyDown(e);
                                }}
                                onWheel={(e) => e.target.blur()} // Disable mouse wheel behavior
                                onContextMenu={handleContextMenu}
                                value={typeFields.bhk}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "" || Number(value) >= 0) {
                                        handleTypeFieldChange({ target: { name: "bhk", value } });
                                    }
                                }}
                                onBlur={(e) => validateField(e.target.name, e.target.value)}
                            />
                            {errors.bhk && <p style={{ color: "red" }}>{errors.bhk}</p>}
                        </div>
                        <div className='bathrooms'>
                            <label>Bathrooms</label>
                            <input
                                className="updateInput"
                                type="number"
                                min="0"
                                name="bathrooms"
                                onKeyDown={(e) => {
                                    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                                        e.preventDefault(); // Prevent arrow key increments/decrements
                                    }
                                    handleKeyDown(e);
                                }}
                                onWheel={(e) => e.target.blur()} // Disable mouse wheel behavior
                                onContextMenu={handleContextMenu}
                                value={typeFields.bathrooms}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "" || Number(value) >= 0) {
                                        handleTypeFieldChange({ target: { name: "bathrooms", value } });
                                    }
                                }}
                                onBlur={(e) => validateField(e.target.name, e.target.value)}
                            />
                            {errors.bathrooms && <p style={{ color: "red" }}>{errors.bathrooms}</p>}
                        </div>
                        <div className='furnished'>
                            <label>Furnishing:</label>
                            <select className='house-apartments-furnishing'
                                name="h_Furnishing"
                                value={typeFields.h_Furnishing}
                                onChange={handleTypeFieldChange}
                                onBlur={(e) => validateField(e.target.name, e.target.value)}
                            >
                                <option value="">Select</option>
                                <option value="Furnished">Furnished</option>
                                <option value="Semi-Furnished">Semi-Furnished</option>
                                <option value="UnFurnished">UnFurnished</option>
                            </select>
                            {errors.h_Furnishing && <p style={{ color: "red" }}>{errors.h_Furnishing}</p>}
                        </div>
                        <div className='project-status'>
                            <label>Project Status</label>
                            <select className='house-apartments-projectstatus'
                                name="project_Status"
                                value={typeFields.project_Status}
                                onChange={handleTypeFieldChange}
                                onBlur={(e) => validateField(e.target.name, e.target.value)}
                            >
                                <option value="">Select</option>
                                <option value="New Launch">New Launch</option>
                                <option value="Ready to Move">Ready to Move</option>
                                <option value="Under Construction">Under Construction</option>
                            </select>
                            {errors.project_Status && <p style={{ color: "red" }}>{errors.project_Status}</p>}
                        </div>
                        <div className='numofsqft'>
                            <label>Number of Sqft</label>
                            <input
                                className="updateInput"
                                type="number"
                                min="0"
                                name="h_Sqft"
                                onKeyDown={(e) => {
                                    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                                        e.preventDefault(); // Prevent arrow key increments/decrements
                                    }
                                    handleKeyDown(e);
                                }}
                                onWheel={(e) => e.target.blur()} // Disable mouse wheel behavior
                                onContextMenu={handleContextMenu}
                                value={typeFields.h_Sqft}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "" || Number(value) >= 0) {
                                        handleTypeFieldChange({ target: { name: "h_Sqft", value } });
                                    }
                                }}
                                onBlur={(e) => validateField(e.target.name, e.target.value)}
                            />
                            {errors.h_Sqft && <p style={{ color: "red" }}>{errors.h_Sqft}</p>}
                        </div>
                        <div className='maintenance-amount'>
                            <label>Maintenance Amount</label>
                            <input
                                className="updateInput"
                                type="number"
                                min="0"
                                name="h_Maintenance"
                                onKeyDown={(e) => {
                                    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                                        e.preventDefault(); // Prevent arrow key increments/decrements
                                    }
                                    handleKeyDown(e);
                                }}
                                onWheel={(e) => e.target.blur()} // Disable mouse wheel behavior
                                onContextMenu={handleContextMenu}
                                value={typeFields.h_Maintenance}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "" || Number(value) >= 0) {
                                        handleTypeFieldChange({ target: { name: "h_Maintenance", value } });
                                    }
                                }}
                                onBlur={(e) => validateField(e.target.name, e.target.value)}
                            />
                            {errors.h_Maintenance && <p style={{ color: "red" }}>{errors.h_Maintenance}</p>}
                        </div>
                        <div className='num of-floors'>
                            <label>Number of Floors</label>
                            <input
                                className="updateInput"
                                type="number"
                                min="0"
                                name="total_Floors"
                                onKeyDown={(e) => {
                                    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                                        e.preventDefault(); // Prevent arrow key increments/decrements
                                    }
                                    handleKeyDown(e);
                                }}
                                onWheel={(e) => e.target.blur()} // Disable mouse wheel behavior
                                onContextMenu={handleContextMenu}
                                value={typeFields.total_Floors}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "" || Number(value) >= 0) {
                                        handleTypeFieldChange({ target: { name: "total_Floors", value } });
                                    }
                                }}
                                onBlur={(e) => validateField(e.target.name, e.target.value)}
                            />
                            {errors.total_Floors && <p style={{ color: "red" }}>{errors.total_Floors}</p>}
                        </div>
                        <div className='floornum'>
                            <label>Flat Number</label>
                            <input
                                className="updateInput"
                                type="number"
                                min="0"
                                name="floor_No"
                                onKeyDown={(e) => {
                                    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                                        e.preventDefault(); // Prevent arrow key increments/decrements
                                    }
                                    handleKeyDown(e);
                                }}
                                onWheel={(e) => e.target.blur()} // Disable mouse wheel behavior
                                onContextMenu={handleContextMenu}
                                value={typeFields.floor_No}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "" || Number(value) >= 0) {
                                        handleTypeFieldChange({ target: { name: "floor_No", value } });
                                    }
                                }}
                                onBlur={(e) => validateField(e.target.name, e.target.value)}
                            />
                            {errors.floor_No && <p style={{ color: "red" }}>{errors.floor_No}</p>}
                        </div>
                        <div>
                            <label>Facing:</label>
                            <select className='house-apartments-facing'
                                name="h_Facing"
                                value={typeFields.h_Facing}
                                onChange={handleTypeFieldChange}
                                onBlur={(e) => validateField(e.target.name, e.target.value)}
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
                            {errors.h_Facing && <p style={{ color: "red" }}>{errors.h_Facing}</p>}
                        </div>
                        <div className='radio-group'>
                            <label>Parking Availability:</label>
                            <div>
                                <label>
                                    <input
                                        type="radio"
                                        name="h_Car_Parking"
                                        value="Yes"
                                        checked={typeFields.h_Car_Parking === "Yes"}
                                        onChange={handleTypeFieldChange}
                                    />
                                    Yes
                                </label>
                            </div>
                            <div>
                                <label>
                                    <input
                                        type="radio"
                                        name="h_Car_Parking"
                                        value="No"
                                        checked={typeFields.h_Car_Parking === "No"}
                                        onChange={handleTypeFieldChange}
                                    />
                                    No
                                </label>
                            </div>
                        </div>
                    </>
                );
            case 'shops_offices':
                return (
                    <>
                        <div>
                        <label>Specific Type:</label>
                            <input
                                className='SpecificType'
                                name="s_Type"
                                value={typeFields.s_Type}
                                readOnly
                                style={{ backgroundColor: 'lightgrey' }}
                                onBlur={(e) => validateField(e.target.name, e.target.value)}
                            />
                        </div>
                        <div>
                            <label>Furnishing:</label>
                            <select className='shop-offices-furnishing'
                                name="s_Furnishing"
                                value={typeFields.s_Furnishing}
                                onChange={handleTypeFieldChange}
                                onBlur={(e) => validateField(e.target.name, e.target.value)}
                            >
                                <option value="">Select</option>
                                <option value="Furnished">Furnished</option>
                                <option value="Semi-Furnished">Semi-Furnished</option>
                                <option value="UnFurnished">UnFurnished</option>
                            </select>
                            {errors.s_Furnishing && <p style={{ color: "red" }}>{errors.s_Furnishing}</p>}
                        </div>
                        <div className='numofsqft'>
                            <label>Number of Sqft</label>
                            <input
                                className="updateInput"
                                type="number"
                                min="0"
                                name="s_Sqft"
                                onKeyDown={(e) => {
                                    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                                        e.preventDefault(); // Prevent arrow key increments/decrements
                                    }
                                    handleKeyDown(e);
                                }}
                                onWheel={(e) => e.target.blur()} // Disable mouse wheel behavior
                                onContextMenu={handleContextMenu}
                                value={typeFields.s_Sqft}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "" || Number(value) >= 0) {
                                        handleTypeFieldChange({ target: { name: "s_Sqft", value } });
                                    }
                                }}
                                onBlur={(e) => validateField(e.target.name, e.target.value)}
                            />
                            {errors.s_Sqft && <p style={{ color: "red" }}>{errors.s_Sqft}</p>}
                        </div>
                        <div className='radio-group'>
                            <label>Parking Availability:</label>
                            <div>
                                <label>
                                    <input
                                        type="radio"
                                        name="s_Car_Parking"
                                        value="Yes"
                                        checked={typeFields.s_Car_Parking === "Yes"}
                                        onChange={handleTypeFieldChange}
                                    />
                                    Yes
                                </label>
                            </div>
                            <div>
                                <label>
                                    <input
                                        type="radio"
                                        name="s_Car_Parking"
                                        value="No"
                                        checked={typeFields.s_Car_Parking === "No"}
                                        onChange={handleTypeFieldChange}
                                    />
                                    No
                                </label>
                            </div>
                        </div>
                        <div className='radio-group'>
                            <label>Washrooms Availability:</label>
                            <div>
                                <label>
                                    <input
                                        type="radio"
                                        name="washrooms"
                                        value="Yes"
                                        checked={typeFields.washrooms === "Yes"}
                                        onChange={handleTypeFieldChange}
                                        onBlur={(e) => validateField(e.target.name, e.target.value)}
                                    />
                                    Yes
                                </label>
                                {errors.washrooms && <p style={{ color: "red" }}>{errors.washrooms}</p>}
                            </div>
                            <div>
                                <label>
                                    <input
                                        type="radio"
                                        name="washrooms"
                                        value="No"
                                        checked={typeFields.washrooms === "No"}
                                        onChange={handleTypeFieldChange}
                                        onBlur={(e) => validateField(e.target.name, e.target.value)}
                                    />
                                    No
                                </label>
                                {errors.washrooms && <p style={{ color: "red" }}>{errors.washrooms}</p>}
                            </div>
                        </div>
                    </>
                );
            case 'pg_guesthouses':
                return (
                    <>
                        <div>
                        <label>Specific Type:</label>
                            <input
                                className='SpecificType'
                                name="p_Type"
                                value={typeFields.p_Type}
                                readOnly
                                style={{ backgroundColor: 'lightgrey' }}
                                onBlur={(e) => validateField(e.target.name, e.target.value)}
                            />
                        </div>
                        <div>
                            <label>Furnishing:</label>
                            <select className='pg-guesthouse-furnishing'
                                name="p_Furnishing"
                                value={typeFields.p_Furnishing}
                                onChange={handleTypeFieldChange}
                                onBlur={(e) => validateField(e.target.name, e.target.value)}
                            >
                                <option value="">Select</option>
                                <option value="Furnished">Furnished</option>
                                <option value="Semi-Furnished">Semi-Furnished</option>
                                <option value="UnFurnished">UnFurnished</option>
                            </select>
                            {errors.p_Furnishing && <p style={{ color: "red" }}>{errors.p_Furnishing}</p>}
                        </div>
                        
                        <div className='floornum'>
                            <label>Number of Floors</label>
                            <input
                                className="updateInput"
                                type="number"
                                name="numFloors"
                                min="0"
                                onKeyDown={(e) => {
                                    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                                        e.preventDefault(); // Prevent arrow key increments/decrements
                                    }
                                    handleKeyDown(e);
                                }}
                                onWheel={(e) => e.target.blur()} // Disable mouse wheel behavior
                                onContextMenu={handleContextMenu}
                                value={typeFields.numFloors}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "" || Number(value) >= 0) {
                                        handleTypeFieldChange({ target: { name: "numFloors", value } });
                                    }
                                }}
                                onBlur={(e) => validateField(e.target.name, e.target.value)}
                            />
                            {errors.numFloors && <p style={{ color: "red" }}>{errors.numFloors}</p>}
                        </div>
                        <div className='radio-group'>
                            <label>Parking Availability:</label>
                            <div>
                                <label>
                                    <input
                                        type="radio"
                                        name="p_CarParking"
                                        value="Yes"
                                        checked={typeFields.p_CarParking === "Yes"}
                                        onChange={handleTypeFieldChange}
                                    />
                                    Yes
                                </label>
                            </div>
                            <div>
                                <label>
                                    <input
                                        type="radio"
                                        name="p_CarParking"
                                        value="No"
                                        checked={typeFields.p_CarParking === "No"}
                                        onChange={handleTypeFieldChange}
                                    />
                                    No
                                </label>
                            </div>
                        </div>
                    </>
                );

            default:
                return null;
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setImages(files);
        setFileCount(files.length);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // const errors = validateFormData();
        // if (Object.keys(errors).length > 0) {
        //     setErrors(errors);

        //     const errorMessages = Object.values(errors).join("\n");
        //     alert(`Please fix the following errors:\n\n${errorMessages}`);
        //     return;
        // }

        const formErrors = Object.values(errors).filter((error) => error);
        if (!formErrors.length) {

            // Prepare form data
            const formData = new FormData();

            // Append basic details
            Object.keys(property).forEach(key => {
                if (key !== 'existingImages' && key !== 'newImages') {
                    formData.append(key, property[key]);
                }
            });

            // Append type-specific details
            Object.keys(typeFields).forEach(key => {
                formData.append(key, typeFields[key]);
            });

            // Append new images
            images.forEach(image => {
                formData.append('propertyImage', image);
            });

            // Append existing images to be retained (if any)
            // if (property.existingImages.length > 0) {
            //     formData.append('existingImageUrls', JSON.stringify(property.existingImages));
            // }

            try {
                // Replace with your actual API endpoint
                const response = await axios.put(`/Owner/UpdateProperty/${propertyId}`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log("response", response);


                if (response.status === 200) {
                    setLoading(false);
                    toast.success("property updated successfully", { position: "top-right",autoClose: 1500, });
                    setTimeout(() => {
                        navigate("/OwnerProperties");
                    }, 1000);
                } else {
                    toast.error('Failed to update property', { position: "top-right" ,autoClose: 1500,});
                }
                setProperty({
                    propertyName: '',
                    propertyFor: '',
                    propertyPrice: '',
                    propertyDescription: '',
                    propertyLocation: '',
                    ownerMobileNo: '',
                    propertyType: '',
                    propertyImage: [],
                    existingImages: [], // To store existing images
                    newImages: []
                });
                setTypeFields({
                    h_Type: "",
                    bhk: "",
                    bathrooms: "",
                    h_Furnishing: "",
                    project_Status: "",
                    h_Sqft: "",
                    h_Maintenance: "",
                    total_Floors: "",
                    floor_No: "",
                    h_Car_Parking: "",
                    h_Facing: "",
                    l_Type: "",
                    plotArea: "",
                    length: "",
                    breadth: "",
                    l_Facing: "",
                    s_Type: "",
                    s_Furnishing: "",
                    s_Sqft: "",
                    s_Car_Parking: "",
                    washrooms: "",
                    p_Type: "",
                    p_Furnishing: "",
                    p_CarParking: "",
                    numFloors: "",
                });
                setErrors({});
                setImages([]);

            } catch (error) {
                console.error('Error updating property:', error);
                alert('An error occurred while updating the property');
            }
        }
    };

    return (
        <>
            <Ownernavbar />
            <div className="update-maindivv" style={{
                padding: "20px", fontFamily: "Arial, sans-serif",
                backgroundColor: "#f8f8f8"
            }}>
                <form className="update-mainform" onSubmit={handleSubmit} style={{ maxWidth: "600px", margin: "auto" }}>
                    <h1>Update Your Property</h1>
                    <div className="property-name-update-main">
                        <label className="property-name-update">Property Name</label>
                        <div className='updatevalue'>
                            <input
                                className="updateInput"
                                name="propertyName"
                                value={property.propertyName}
                                onChange={handleInputChange}
                                onBlur={(e) => validateField(e.target.name, e.target.value)}
                            />
                            {errors.propertyName && (<span style={{ color: "red" }}>{errors.propertyName}</span>)}
                        </div>
                    </div>
                    <div className="property-name-update-main">
                        <label className="property-name-update">Property For</label>
                        <div className='updatevalue'>
                            <select
                                className="updateInput"
                                name="propertyFor"
                                value={property.propertyFor}
                                onChange={handleInputChange}
                                onBlur={(e) => validateField(e.target.name, e.target.value)}
                            >
                                <option value="">Select</option>
                                <option value="Rent">Rent</option>
                                <option value="Sale">Sale</option>
                            </select>
                            {errors.propertyFor && (<span style={{ color: "red" }}>{errors.propertyFor}</span>)}
                        </div>
                    </div>

                    <div className="price-update-main">
                        <label className="price-update">Property Price</label>
                        <div className='updatevalue'>
                            <input
                                className="updateInput"
                                name="propertyPrice"
                                value={property.propertyPrice}
                                onChange={handleInputChange}
                                onBlur={(e) => validateField(e.target.name, e.target.value)}
                            />
                            {errors.propertyPrice && (<p style={{ color: "red" }}>{errors.propertyPrice}</p>)}
                        </div>
                    </div >
                    <div className="Description-update-main">
                        <label className="description-update">Property Description</label>
                        <div className='updatevalueDescription'>
                            <textarea className='Prop-description'
                                name="propertyDescription"
                                value={property.propertyDescription}
                                onChange={handleInputChange}
                                onBlur={(e) => validateField(e.target.name, e.target.value)}
                            />
                            {errors.propertyDescription && (<p style={{ color: "red" }}>{errors.propertyDescription}</p>)}
                        </div>
                    </div>
                    <div className="Location-update-main">
                        <label className="location-update">Property Address</label>
                        <div className='updatevalue'>
                            <input
                                className="updateInput"
                                name="propertyLocation"
                                value={property.propertyLocation}
                                onChange={handleInputChange}
                                onBlur={(e) => validateField(e.target.name, e.target.value)}
                            />
                            {errors.propertyLocation && <p style={{ color: "red" }}>{errors.propertyLocation}</p>}
                        </div>
                    </div>
                    <div className="owner-mobile-no-update-main">
                        <label className="owner-mobile-no-update">Owner Mobile Number</label>
                        <div className='updatevalue'>
                            <input
                                className="updateInput"
                                name="ownerMobileNo"
                                value={property.ownerMobileNo}
                                onChange={handleInputChange}
                                onBlur={(e) => validateField(e.target.name, e.target.value)}
                            />
                            {errors.ownerMobileNo && (<p style={{ color: "red" }}>{errors.ownerMobileNo}</p>)}
                        </div>
                    </div>
                    <div className="property-type-update-main">
                        <label className="property-type-update">Property Type</label>
                        <div className='updatevalue'>
                            <input
                                className="updateInput"
                                name="propertyType"
                                value={property.propertyType}
                                readOnly
                                style={{ backgroundColor: 'lightgrey' }}
                                onBlur={(e) => validateField(e.target.name, e.target.value)}
                            />
                            {errors.propertyType && (<p style={{ color: "red" }}>{errors.propertyType}</p>)}
                        </div>
                    </div>


                    {/* Type-Specific Details */}
                    {property.propertyType && (
                        <div className="specific-details-update-main">
                            {renderTypeSpecificFields()}
                        </div>
                    )}
                    <div className="file-upload-container">
                        <span className="label-text-main"><b>Upload Image:</b></span>
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
                    </div>

                    <div className="flex justify-end">
                        <button type="submit" className="mt-4">Update Property</button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default UpdateProperty;