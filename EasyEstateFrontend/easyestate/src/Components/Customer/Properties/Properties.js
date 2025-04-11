import React, { useEffect, useState } from "react";
import axios from "../../axios";
import Filter from "./Filter";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import Customernavbar from "../Customernavbar/Customernavbar";
import { useNavigate,useLocation } from "react-router-dom";
import { toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Button from "@mui/material/Button";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faMobileAlt,
  faBuilding,
} from "@fortawesome/free-solid-svg-icons";
import Preloader from "../../Preloader/Preloader";


const Properties = () => {
  const [propertyData, setPropertyData] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [error, setError] = useState("");
  const [wishlist, setWishlist] = useState({});
  const [loading, setLoading] = useState(true);
  const location = useLocation();
const [title, setTitle] = useState(location.state?.title || null);

  const [filters, setFilters] = useState({
    propertyRole: "",
    propertyType: "",
    location: "",
    Price: [3000, 50000000],
  });
  const userID = localStorage.getItem("id");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Trigger when the component mounts
  useEffect(() => {
    fetchProperty();
    fetchCartData();
  }, []);

  // Fetch property data from backend
  const fetchProperty = async () => {
    try {
      const response = await axios.get(
        `/Customer/GetAllProperties`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        setFilteredProperties(response.data);
        setPropertyData(response.data);
        setError("");
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      } else {
        setError("Property not found or an error occurred.");
        setPropertyData([]);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setError(`Error: ${error.response?.data?.title || error.message}`);
      setPropertyData([]);
      setLoading(false);
    }
  };

  const fetchCartData = async () => {
    if (userID) {
      const url = `/Customer/ViewWishlist/${userID}`;
      try {
        const res = await axios.get(url,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.data.status === "Success") {
          const wishlistData = res.data.cartItems.reduce((acc, curr_item) => {
            acc[curr_item.propertyID] = true; // Mark propertyID as true (added to wishlist)
            return acc;
          }, {});
          //console.log("data in wishlist",wishlistData);
          setWishlist(wishlistData);
        }
      } catch (err) {
        console.error("Error fetching cart data:", err);
      }
    }
  };

  // Filter properties by type, location, and price
  useEffect(() => {
    // Reset the title if propertyType changes or other filters are applied
    if (filters.propertyType) {
     setTitle(null); // Reset title when filters change
   }

   // Set filters.propertyType if title is present
 if (title && filters.propertyType !== title) {
   setFilters((prev) => ({ ...prev, propertyType: title }));
 }

   if (!filters.propertyFor && !filters.propertyType && !filters.location && !filters.Price && !title)
   {        
      setFilteredProperties(propertyData); // Set all data if no filtersreturn;
   }
   const filtered = propertyData.filter((property) => {
     const matchesType = getMatchesType(property); // If neither is present, include all

     const matchesRole = filters.propertyFor
       ? property.propertyFor === filters.propertyFor
       : true;
     const matchesLocation = filters.location
       ? property.propertyLocation
           .toLowerCase()
           .includes(filters.location.toLowerCase())
       : true;
     const matchesPrice = filters.Price
       ? property.propertyPrice >= filters.Price[0] &&
         property.propertyPrice <= filters.Price[1]
       : true;

     return matchesRole && matchesType && matchesLocation && matchesPrice;
   });
   setFilteredProperties(filtered);
 }, [filters, propertyData,title]);

 const getMatchesType = (property) => {
   if (filters.propertyType) {
     return property.type === filters.propertyType;
   }
   if (title) {
     return property.type === title;
   }
   return true;
 };

  useEffect(() => {
    fetchCartData();
  }, [wishlist]);

  //Toggle wishlist status for a property
  const toggleWishlist = async (property_ID) => {
    if (wishlist[property_ID]) {
      // Remove from wishlist
      try {
        const response = await axios.delete(
          `/Customer/RemoveFromCart/${userID}/${property_ID}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          });
        if (response.data.status === "Success") {  
          toast.success("property removed from your wishlist", { position: "top-right", autoClose: 1500 });      
        }
        setWishlist((prevState) => ({
          ...prevState,
          [property_ID]: false,
        })); 
      } catch (error) {
        console.error("Error removing from wishlist:", error);
        toast.error("Error removing from wishlist. Please try again.", {
          position: "top-right",
          autoClose: 1500, // Added autoClose for error messages as well
        });
      }
    } else {
      // Add to wishlist
      try {
        const request = { userID: userID, propertyID: property_ID };
        console.log(userID);
        console.log(property_ID);
        console.log(request);
        const response = await axios.post(
          `/Customer/AddToCart`,
          request,
          {
            headers: { Authorization: `Bearer ${token}` }

          }
        );
        if (response.data.status === "Success") {
          toast.success("property added to your wishlist successfully", { position: "top-right", autoClose: 1500 });
          setWishlist((prevState) => ({
            ...prevState,
            [property_ID]: true,
          }));
        }
      } catch (error) {
        console.error("Error adding to wishlist:", error);
        toast.error("Error adding to wishlist. Please try again.", {
          position: "top-right",
          autoClose: 1500, // Added autoClose for error messages as well

        });
      }
    }
  };

  return (
    <>
      {loading ? (
        <Preloader />
      ) : (
        <div>
          <Customernavbar />
          <Filter
            filters={filters}
            setFilters={setFilters}
          />
          <div className="card-container">
            {error && <p className="Customererror">{error}</p>}
            {filteredProperties && filteredProperties.length > 0 ? (
              filteredProperties.map((property) => (
                <div
                  className="card"
                  style={{ borderRadius: "25px" }}
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={property.propertyID}
                  onClick={() =>
                    navigate(
                      `/Customerpropertydetails/${property.propertyID}`,
                      { state: { from: "/Properties" } }
                    )
                  }
                >
                  <div
                    className={`wishlist-icon ${wishlist[property.propertyID] ? "active" : ""
                      }`}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleWishlist(property.propertyID);
                    }}
                  >
                    {wishlist[property.propertyID] ? (
                      <FavoriteIcon style={{ color: "red" }} />
                    ) : (
                      <FavoriteBorderIcon style={{ color: "black" }} />
                    )}
                  </div>
                  <img
                    src={`data:image/jpeg;base64,${property.propertyImage}`}
                  alt={property.propertyName}
                  className="card-image"
                />
                  <div className="card-content">
                    <div
                      className="card-title"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <h5
                        style={{
                          margin: "0",
                          marginTop: "5px",
                          fontSize: "20px",
                          fontWeight: "initial",
                          fontStyle: "italic",
                        }}
                      >
                        <b>{property.propertyName.toUpperCase()}</b>
                      </h5>
                      <span
                        className="price"
                        style={{
                          marginTop: "5px",
                          fontSize: "18px",
                          fontWeight: "bold",
                        }}
                      >

                        {property.propertyType === "Houses_Apartments" &&
                          property.propertyFor === "Sale" && (
                            <div style={{ color: "blue" }}>
                              <CurrencyRupeeIcon
                                style={{ color: "blue", fontSize: "18px" }}
                              />
                              {(
                                property.propertyPrice.toLocaleString() /
                                property.sqft
                              ).toFixed(2)}
                              <span
                                style={{ fontSize: "15px", fontStyle: "italic" }}
                              >
                                /sqft
                              </span>
                            </div>
                          )}
                        {property.propertyType === "Lands_Plots" &&
                          property.propertyFor === "Sale" && (
                            <div style={{ color: "blue" }}>
                              <CurrencyRupeeIcon
                                style={{ color: "blue", fontSize: "18px" }}
                              />
                              {(
                                property.propertyPrice.toLocaleString() /
                                property.sqft
                              ).toFixed(2)}
                              <span
                                style={{ fontSize: "15px", fontStyle: "italic" }}
                              >
                                /sqyd
                              </span>
                            </div>
                          )}
                        {property.propertyType === "Shops_Offices" &&
                          property.propertyFor === "Sale" && (
                            <div style={{ color: "blue" }}>
                              {" "}
                              <CurrencyRupeeIcon
                                style={{ color: "blue", fontSize: "18px" }}
                              />
                              {(
                                property.propertyPrice.toLocaleString() /
                                property.sqft
                              ).toFixed(2)}
                              <span
                                style={{ fontSize: "15px", fontStyle: "italic" }}
                              >
                                /sqft
                              </span>
                            </div>
                          )}

                        {property.propertyType === "Houses_Apartments" &&
                          property.propertyFor === "Rent" && (
                            <div style={{ color: "blue" }}>
                              <CurrencyRupeeIcon
                                style={{ color: "blue", fontSize: "18px" }}
                              />
                              {property.propertyPrice.toLocaleString()}
                            </div>
                          )}
                        {property.propertyType === "Lands_Plots" &&
                          property.propertyFor === "Rent" && (
                            <div style={{ color: "blue" }}>
                              <CurrencyRupeeIcon
                                style={{ color: "blue", fontSize: "18px" }}
                              />
                              {property.propertyPrice.toLocaleString()}{" "}
                            </div>
                          )}
                        {property.propertyType === "Shops_Offices" &&
                          property.propertyFor === "Rent" && (
                            <div style={{ color: "blue" }}>
                              {" "}
                              <CurrencyRupeeIcon
                                style={{ color: "blue", fontSize: "18px" }}
                              />
                              {property.propertyPrice.toLocaleString()}{" "}
                            </div>
                          )}

                        {property.propertyType === "PG_GuestHouses" && (
                          <div style={{ color: "blue" }}>
                            {" "}
                            <CurrencyRupeeIcon
                              style={{ color: "blue", fontSize: "18px" }}
                            />
                            {property.propertyPrice.toLocaleString()}
                          </div>
                        )}
                      </span>
                    </div>
                    <hr />
                    <p
                      className="CategoryType"
                      style={{ color: "grey", marginBottom: "10px" }}
                    >
                      <b style={{ color: "grey" }}>
                        <FontAwesomeIcon
                          icon={faBuilding}
                          style={{ marginRight: "10px", color: "grey" }}
                        />
                        Type :{" "}
                      </b>
                      {property.type}
                    </p>
                    <p className="Contact" style={{ color: "grey" }}>
                      <b style={{ color: "grey" }}>
                        <FontAwesomeIcon
                          icon={faMobileAlt}
                          style={{ marginRight: "10px", color: "grey" }}
                        />
                        Contact :{" "}
                      </b>
                      {property.ownerMobileNo}
                    </p>
                    <p className="location" style={{ color: "grey" }}>
                      <b style={{ color: "grey" }}>
                        <FontAwesomeIcon
                          icon={faMapMarkerAlt}
                          style={{ marginRight: "10px", color: "grey" }}
                        />
                        Location:{" "}
                      </b>
                      {property.propertyLocation}
                    </p>
                    <p>
                      <Button
                        style={{
                          backgroundColor: "rgba(0, 0, 0, 0.05)",
                          fontWeight: "600px",
                          fontSize: "12px",
                          lineHeight: "28px",
                          letterSpacing: "0.8px",
                          textAlign: "center",
                          display: "inline-block",
                          padding: "0 10px",
                          borderRadius: "99px",
                          color: "black",
                          borderColor: "black",
                          cursor: "pointer",
                          background:
                            "linear-gradient(45deg, #FFD700, #FFFFFF,  #FFD700)", // Gradient colors
                          backgroundSize: "400% 400%", // Make the gradient larger than the button
                          animation: "waveAnimation 2s ease infinite",
                        }}
                        variant="outlined"
                      >
                        {property.propertyFor}{" "}
                        <span className="moving-line"></span>
                      </Button>
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p>No property is available to buy.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};


export default Properties;






