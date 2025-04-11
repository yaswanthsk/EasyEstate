import React, { useState, useEffect } from "react";
import axios from "../../axios"; // Importing the axios instance for making HTTP requests
import { toast } from "react-toastify"; // For toast notifications
import 'react-toastify/dist/ReactToastify.css'; // Importing styling for the toast notifications
import { useNavigate } from "react-router-dom"; // React Router's useNavigate for navigation between pages
import './Customerwishlist.css'; // Custom CSS for styling the wishlist component
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee'; // For displaying currency
import Customernavbar from "../Customernavbar/Customernavbar"; // Importing the customer navbar component
import { FaTrash } from "react-icons/fa"; // Importing the Trash icon from FontAwesome
import Preloader from "../../Preloader/Preloader";
import Soldout from '../../.././Assets/Images/Soldout.png';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";


// The main functional component for Customer's Wishlist
const Customerwishlist = () => {
  const [dataAvailable, setDataAvailable] = useState([]); // State to store the list of available wishlist properties
  const [dataSoldout, setDataSoldout] = useState([]); // State to store the list of soldout wishlist properties
  const [error, setError] = useState(""); // State to manage error messages (if any)
  const [wishlist, setWishlist] = useState({}); // State to manage the wishlist items
  const userId = localStorage.getItem("id"); // Getting user ID from localStorage
  const navigate = useNavigate(); // Using navigate hook to navigate to different routes
  const userID = localStorage.getItem("id"); // User ID to be used for API calls
  const token = localStorage.getItem("token"); // Authorization token for making secure API calls
  const [loading, setLoading] = useState(true);

  // useEffect hook to fetch the wishlist data on component mount
  useEffect(() => {
    if (userId) {
      const url1 = `/Customer/ViewCartAvailable/${userId}`; // API URL for fetching customer's cart data
      axios
        .get(url1, {
          headers: { Authorization: `Bearer ${token}` }, // Passing the token in the header for authentication
        })
        .then((res) => {
          setDataAvailable(res.data.data || []); // Storing the response data (wishlist properties)
          console.log(res.data.data); // For debugging the fetched data

        })
        .catch((err) => {
          console.error("Error fetching cart data:", err); // Logging any errors
        }).finally(() => {
          setTimeout(() => {
            setLoading(false);
          }, 1000);
        });

        const url2 = `/Customer/ViewCartSold/${userId}`; // API URL for fetching customer's cart data
      axios
        .get(url2, {
          headers: { Authorization: `Bearer ${token}` }, // Passing the token in the header for authentication
        })
        .then((res) => {
          setDataSoldout(res.data.data || []); // Storing the response data (wishlist properties)
          console.log(res.data.data); // For debugging the fetched data

        })
        .catch((err) => {
          console.error("Error fetching cart data:", err); // Logging any errors
        }).finally(() => {
          setTimeout(() => {
            setLoading(false);
          }, 1000);
        });
    }
    fetchCartData(); // Fetching wishlist data
  }, []);

  // State to manage the Snackbar notification
  const [snackbar, setSnackbar] = useState({
    open: false, // Controls visibility of the Snackbar
    message: "", // Message to be displayed in the Snackbar
    severity: "success", // Severity of the Snackbar (could be success, info, error, etc.)
  });

  // Function to fetch the customer's wishlist from the API
  const fetchCartData = async () => {
    if (userID) {
      const url = `/Customer/ViewWishlist/${userID}`; // API URL to fetch wishlist data
      try {
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.status === "Success") {
          // Map cart items to an object where keys are property IDs and values are 'true' for wishlist
          const wishlistData = res.data.cartItems.reduce((acc, curr_item) => {
            acc[curr_item.propertyID] = true; // Mark property as true (added to wishlist)
            return acc;
          }, {});
          setWishlist(wishlistData); // Setting the wishlist state
        }
      } catch (err) {
        console.error("Error fetching cart data:", err); // Log any errors
      }

    }
  };

  const handleRemove = async (property_ID) => {
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
          setWishlist((prevState) => {
            setWishlist((prevState) => ({
              ...prevState,
              [property_ID]: false,
            }));
            // Reload the window after updating the state
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          });


        }
      } catch (error) {
        console.error("Error removing from wishlist:", error);
        toast.error("Error removing from wishlist. Please try again.", {
          position: "top-right",
          autoClose: 1500, // Added autoClose for error messages as well
        });
      }
    }
  };

  // Function to handle clearing the cart
  const handleClearCart = async () => {
    if (userID) {
      const url = `/Customer/ClearCart/${userId}`; // API URL to clear the customer's cart
      try {
        const res = await axios.delete(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.status === "Success") {
          // Reset the data and wishlist state upon successful clear
          setDataAvailable([]); // Clear cart data
          setDataSoldout([]);
          setWishlist({}); // Reset wishlist
          setSnackbar({
            open: true,
            message: "Cart cleared successfully", // Snackbar message
            severity: "info", // Snackbar severity
          });

          // Notify the user about the successful action
          toast.success("Cart cleared and wishlist reset.", { position: "top-right", autoClose: 1500, });
        } else {
          // Handle any errors if the cart clearing fails
          toast.error("Error clearing the cart. Please try again.", { position: "top-right", autoClose: 1500, });
        }
      } catch (err) {
        // Handle any network or server errors
        console.error("Error clearing the cart:", err);
        toast.error("Error clearing the cart. Please try again.", { position: "top-right", autoClose: 1500, });
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

          <Box sx={{ maxWidth: 1200, margin: "0 auto", padding: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                Wishlist ({dataAvailable.length+dataSoldout.length} items)
              </Typography>
              <Button
                variant="contained"
                color="error"
                startIcon={<FaTrash />}
                onClick={handleClearCart}
                disabled={dataAvailable.length === 0 && dataSoldout===0}
              >
                Clear Wishlist
              </Button>
            </Box>

            {dataAvailable.length === 0 && dataSoldout.length===0 ? (
              <Typography variant="h6" align="center" color="text.secondary">
                Your wishlist is empty
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {dataAvailable.map((property) => (
                  <Grid item xs={12} key={property.propertyID}>
                    <div
                      onClick={() =>
                        navigate(`/Customerpropertydetails/${property.propertyID}`, {
                          state: { from: "/customerwishlist" },
                        })
                      }
                      style={{
                        display: "flex",
                        marginBottom: "2px",
                        position: "relative",
                        boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.3)",
                        transition: "box-shadow 0.3s ease",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      <CardMedia
                        component="img"
                        sx={{ width: 300, borderRadius: "8px" }}
                        image={`data:image/jpeg;base64,${property.propertyDetails?.propertyImage}`}
                        alt={property.propertyDetails?.propertyName || "Property Image"}
                      />
                      <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
                        <CardContent sx={{ flex: 1 }}>
                          <Typography variant="h6" component="h2">
                            {property.propertyDetails?.propertyName || "No name available"}
                          </Typography>
                          <Typography variant="body1" color="text.secondary">
                            {property.propertyDetails?.propertyDescription || "No description available"}
                          </Typography>
                          <Typography variant="body1" color="text.secondary" marginTop="20px">
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
                              {property.propertyDetails?.propertyFor}
                              <span className="moving-line"></span>
                            </Button>
                          </Typography>

                        </CardContent>
                        <Box sx={{ padding: 2, alignSelf: "flex-end" }}>
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<FaTrash />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemove(property.propertyID);
                            }}
                          >
                            Remove
                          </Button>
                        </Box>
                      </Box>
                    </div>
                  </Grid>
                ))}
                {dataSoldout.map((property) => (
  <Grid item xs={12} key={property.propertyID}>
    <div
      // onClick={() =>
      //   navigate(`/Customerpropertydetails/${property.propertyID}`, {
      //     state: { from: "/customerwishlist" },
      //   })
      // }
      style={{
        display: "flex",
        marginBottom: "2px",
        position: "relative",
        boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.3)",
        transition: "box-shadow 0.3s ease",
        borderRadius: "8px",
        cursor: "pointer",
        overflow: "hidden", // Make sure nothing overflows outside of the card
      }}
    >
      {/* Apply blur to everything except the sold-out image */}
      <CardMedia
        component="img"
        sx={{
          width: 300,
          borderRadius: "8px",
          filter: "blur(3px)", // Blur the image
          transition: "filter 0.3s ease", // Add smooth transition on hover
        }}
        image={`data:image/jpeg;base64,${property.propertyDetails?.propertyImage}`}
        alt={property.propertyDetails?.propertyName || "Property Image"}
      />

      <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <CardContent sx={{ flex: 1, filter: "blur(1px)", transition: "filter 0.3s ease" }}>
          <Typography variant="h6" component="h2">
            {property.propertyDetails?.propertyName || "No name available"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {property.propertyDetails?.propertyDescription || "No description available"}
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            marginTop="20px"
            sx={{
              display: "flex",
              alignItems: "center", // Align items vertically in the center
              gap: 1, // Add some space between the image and button
            }}
          >
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
                background: "linear-gradient(45deg, #FFD700, #FFFFFF,  #FFD700)", // Gradient colors
                backgroundSize: "400% 400%", // Make the gradient larger than the button
                animation: "waveAnimation 2s ease infinite",
              }}
              variant="outlined"
            >
              {property.propertyDetails?.propertyFor}
            </Button>
          </Typography>
        </CardContent>

        {/* Soldout image with responsive styles */}
        <Box
          sx={{
            width: {
              xs: "200px", // 100px for small screens
              sm: "120px", // 120px for small-medium screens
              md: "150px", // 150px for larger screens
            },
            height: {
              xs: "200px", // 100px for small screens
              sm: "120px", // 120px for small-medium screens
              md: "150px", // 150px for larger screens
            },
            marginTop: {
              xs: "350px", // Adjusted for small screens
              sm: "180px",
              md:"80px" // Adjusted for medium screens
            },
            marginLeft: {
              xs:"-180px",
              sm:"-50px",
              md:"270px"
            },
            marginRight: "auto",
            borderRadius: "50%", // Optional: circular image
            backgroundImage: `url(${Soldout})`, // Using the background image URL
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "absolute", // Position the sold-out image above everything else
            zIndex: 1, // Ensure it stays on top of the blurred content
          }}
        />
        
        <Box sx={{ padding: 2, alignSelf: "flex-end" }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<FaTrash />}
            onClick={(e) => {
              e.stopPropagation();
              handleRemove(property.propertyID);
            }}
          >
            Remove
          </Button>
        </Box>
      </Box>
    </div>
  </Grid>
))}


              </Grid>
            )}
          </Box>
        </div>
      )}
    </>
  );


};

export default Customerwishlist;