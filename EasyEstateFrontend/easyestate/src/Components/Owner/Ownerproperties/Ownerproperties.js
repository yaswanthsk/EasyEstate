import React, { useEffect, useState } from "react";
import axios from "../../axios";
import Filter from "../../Customer/Properties/Filter";
import "./Ownerproperties.css";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import Preloader from '../../Preloader/Preloader';
import { toast } from "react-toastify";
import {
  Button, Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaMapMarkerAlt, FaMobileAlt, FaBuilding, FaTrash, FaPencilAlt, } from "react-icons/fa";
import Ownernavbar from "../Ownernavbar/Ownernavbar";
//import sad from '../../../Assets/Images/sad';
import crying from '../../../Assets/Images/crying.jpg';
const OwnerProperties = () => {
  const [propertyData, setPropertyData] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [propertyId, setPropertyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    propertyType: "",
    location: "",
    Price: [3000, 50000000],
  });

  const navigate = useNavigate();
  const ownerID = localStorage.getItem("id");
  const token = localStorage.getItem("token");
  // Update property
  const handleUpdate = (propertyId) => {
    navigate(`/UpdateProperty?propertyId=${propertyId}`);
  };
  const handleCancelDelete = () => {
    setOpenDeleteDialog(false); // Close the dialog without deleting
  };

  // Delete property from owner
  const handleDelete = (propertyId) => {
    const url = `/Owner/DeleteProperty/${propertyId}`;
    axios
      .delete(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then((res) => {
        // Optionally, refetch properties or update state to remove deleted property
        setPropertyData((prev) => prev.filter((prop) => prop.propertyID !== propertyId));
        setFilteredProperties((prev) =>
          prev.filter((prop) => prop.propertyID !== propertyId)
        );
        toast.success("property deleted successfully from the site");
      })
      .catch((err) => {
        console.error("Error in deleting the property:", err);
        alert("Failed to delete the property. Please try again.");
      }).finally(() => {
        // Code in finally block executes regardless of success or error
        setOpenDeleteDialog(false);  // Close the dialog
      });
  };


  // Trigger when the component mounts
  useEffect(() => {
    fetchProperty();
  }, []);

  // Fetch property data from backend
  const fetchProperty = async () => {
    try {
      const response = await axios.get(
        `/Owner/GetPropertiesByOwner/${ownerID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.status === "Success") {
        setPropertyData(response.data.properties);
        console.log(response.data.properties);
        setFilteredProperties(response.data.properties);
      } else {
        setPropertyData([]);
        // setLoading(true);
      }
    } catch (error) {
      setPropertyData([]);
  } finally {
    setTimeout(() => {
      setLoading(false);
  }, 500);  // End loading state after the fetch is done
  };
}
  // Filter properties by type, location, and price
  useEffect(() => {
    if (!filters.propertyFor && !filters.propertyType && !filters.location && !filters.Price) {
      setFilteredProperties(propertyData); // Set all data if no filtersreturn;
    }
    const filtered = propertyData.filter((property) => {
      const matchesType = filters.propertyType
        ? property.type === filters.propertyType
        : true;
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
  }, [filters, propertyData]);

  return (
    <>
    {(loading?  (<Preloader/>) :(
      <div>
        <Ownernavbar />
        <Filter
          filters={filters}
          setFilters={setFilters}
          uniquePropertyTypes={[
            ...new Set(propertyData.map((property) => property.propertyType)),
          ]}
        />

        {/* No Data Found Message */}
        {(!filteredProperties || filteredProperties.length === 0? (
          <div className="data-not-found-main">
            <div className="data-not-found-container">
              <div className="data-not-found-content">
                <img
                  src={crying} // Replace with your "not found" GIF path
                  alt="Data Not Found"
                  style={{ width: "200px", height: "200px" }}
                />
                <h4>
                  <i>
                    It looks like you haven’t listed any properties for sale...!
                  </i>
                </h4>
              </div>
            </div>
          </div>
        ):(
          <div className="card-container">
            {filteredProperties.map((property) => (
              <div
                className="card"
                style={{ borderRadius: "25px" }}
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={property.propertyID}
                onClick={() =>
                  navigate(`/Ownerpropertydetails/${property.propertyID}`, {
                    state: { from: "/Ownerproperties" },
                  })
                }
              >
                <div>
                  <img
                    src={`data:image/jpeg;base64,${property.propertyImage}`}
                    alt={property.propertyName}
                    className="card-image"
                  />
                  <Button
                    style={{
                      position: "absolute",
                      top: "10px",
                      left: "10px",
                      backgroundColor: "rgba(0, 0, 0, 0.05)",
                      fontWeight: "600px",
                      fontSize: "12px",
                      lineHeight: "28px",
                      letterSpacing: "0.8px",
                      textAlign: "center",
                      padding: "0 10px",
                      borderRadius: "99px",
                      color: "black",
                      borderColor: "black",
                      cursor: "pointer",
                      background:
                        "linear-gradient(45deg, #FFD700, #FFFFFF,  #FFD700)",
                      backgroundSize: "400% 400%",
                      animation: "waveAnimation 2s ease infinite",
                    }}
                    variant="outlined"
                  >
                    {property.propertyFor}
                  </Button>
                </div>
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
                      {/* Price calculation logic */}
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
                  <p className="CategoryType" style={{ color: "grey" }}>
                    <b style={{ color: "grey" }}>
                      <FontAwesomeIcon
                        icon={FaBuilding}
                        style={{ marginRight: "10px", color: "grey" }}
                      />
                      Type :{" "}
                    </b>
                    {property.type}
                  </p>
                  <p className="Contact" style={{ color: "grey" }}>
                    <b style={{ color: "grey" }}>
                      <FontAwesomeIcon
                        icon={FaMobileAlt}
                        style={{ marginRight: "10px", color: "grey" }}
                      />
                      Contact :{" "}
                    </b>
                    {property.ownerMobileNo}
                  </p>
                  <p className="location" style={{ color: "grey" }}>
                    <b style={{ color: "grey" }}>
                      <FontAwesomeIcon
                        icon={FaMapMarkerAlt}
                        style={{ marginRight: "10px", color: "grey" }}
                      />
                      Location:{" "}
                    </b>
                    {property.propertyLocation}
                  </p>
                  <div className="properties-button-container">
                    <button
                      className="updateProperties_btn"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleUpdate(property.propertyID);
                      }}
                    >
                      <FontAwesomeIcon icon={FaPencilAlt} />
                      Update Property
                    </button>
                    <button
                      className="deleteProperties_btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPropertyId(property.propertyID);
                        setOpenDeleteDialog(true);
                      }}
                    >
                      <FontAwesomeIcon icon={FaTrash} />
                      Delete
                    </button>
                  </div>
                  <Dialog open={openDeleteDialog} onClose={handleCancelDelete}>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogContent>
                      <Typography variant="body1">
                        Are you sure you want to delete your property from the
                        site?
                      </Typography>
                    </DialogContent>
                    <DialogActions>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelDelete();
                        }}
                        color="primary"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(propertyId);
                        }}
                        color="secondary"
                      >
                        Delete
                      </Button>
                    </DialogActions>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    )
    )}
    </>
  );
}
export default OwnerProperties;