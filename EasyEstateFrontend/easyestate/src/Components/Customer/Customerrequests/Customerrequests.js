import React, { useRef, useState, useEffect } from "react";
import Button from "@mui/material/Button";
import axios from "../../axios";
import Customernavbar from "../Customernavbar/Customernavbar";
import "react-toastify/dist/ReactToastify.css";
import { HubConnectionBuilder, HttpTransportType } from "@microsoft/signalr";
import { Box } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Customerrequests.css";
import Preloader from "../../Preloader/Preloader";
import crying from "../../../Assets/Images/crying.jpg" // Importing an asset for UI.
import {
  IconButton,
  TextField,
  Avatar,
  Fab,
} from "@mui/material";
import { IoSendSharp } from "react-icons/io5";
import { styled } from "@mui/system";
import {
  TableCell, TableContainer, Table, TableHead, TableRow, TableBody, Paper, Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { faEye, faTrashCan, faMessage, faClose } from "@fortawesome/free-solid-svg-icons";

// Styled components for customizing message UI
const MessageContainer = styled(Box)(({ theme, isowner }) => ({
  display: "flex",
  justifyContent: isowner ? "flex-end" : "flex-start", // Align messages based on the sender
  marginBottom: theme.spacing(2),
}));

const MessageBubble = styled(Paper)(({ theme, isowner }) => ({
  padding: theme.spacing(1, 2),
  maxWidth: "70%",
  backgroundColor: isowner ? "#2196f3" : "#f5f5f5", // Different background for user vs owner messages
  color: isowner ? "#fff" : "#000",
  borderRadius: theme.spacing(2),
  marginLeft: isowner ? theme.spacing(1) : 0,
  marginRight: isowner ? 0 : theme.spacing(1),
}));

const MessageList = styled(Box)({
  height: "400px", // Fixed height for chat message scroll area
  overflowY: "auto",
  padding: "16px",
});

const InputContainer = styled(Box)({
  display: "flex",
  padding: "16px",
  borderTop: "1px solid #e0e0e0", // Border for separating input area
  backgroundColor: "#fff",
});

// Main Customerrequests Component
const Customerrequests = () => {
  // States for handling various functionalities
  const [data, setData] = useState([]); // Stores the list of properties requested by the customer
  const [selectedChatUser, setSelectedChatUser] = useState(null); // Tracks the user selected for chat
  const [chatMessages, setChatMessages] = useState([]); // Messages in the current chat window
  const [message, setMessage] = useState(''); // Current message input
  const [hubConnection, setHubConnection] = useState(null); // SignalR connection instance
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // For handling delete confirmation dialog
  const [showModal, setShowModal] = useState(false); // For toggling the chat modal
  const [unreadMessages, setUnreadMessages] = useState({}); // Tracks unread messages for each user
  const [propertyID, setPropertyID] = useState(null); // Current property ID being interacted with
  const navigate = useNavigate(); // For navigation
  const [loading, setLoading] = useState(false);

  const userID = localStorage.getItem("id"); // Get the customer ID from local storage
  const token = localStorage.getItem("token"); // Retrieve the authentication token
  const messageContainerRef = useRef(null); // For auto-scrolling the chat message container

  // Function to smoothly scroll to a specific element
  const handleScrollOnHover = (elementRef) => {
    elementRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  // Fetch customer requests when the component is mounted
  useEffect(() => {
    if (userID) {
      const fetchRequests = async () => {
        setLoading(true); // Show preloader only at the start
        try {
          const response = await axios.get(`/Customer/ViewMyRequests/${userID}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setData(response.data.data || []); // Update state with fetched data
        } catch (err) {
          console.error("Error fetching requests:", err);
          setData([]); // Clear data on error
        } finally {
          setTimeout(() => {
            setLoading(false); // Hide preloader after data is fetched
          }, 700); // Slight delay to ensure smooth user experience
        }
      };

      fetchRequests();
    }
  }, [userID]);
  // Dependency array ensures this runs only once

  // Initialize SignalR connection for real-time chat
  useEffect(() => {
    if (data.length > 0 && userID) {
      const connection = new HubConnectionBuilder()
        .withUrl(`http://localhost:5253/chat`, {
        // .withUrl(`https://propertyfindsystem.azurewebsites.net/chat`, {
          accessTokenFactory: () => token,
        })
        .withAutomaticReconnect() // Auto-reconnect on disconnect
        .build();

      // Set up an event listener for receiving messages
      connection.on("ReceiveMessage", (senderId, message) => {
        console.log(`Received message from ${senderId}: ${message}`);
        setChatMessages(prevMessages => [...prevMessages, { senderId, message }]);

        // Increment unread message count for the sender if the chat window is not active
        if (senderId !== userID) {
          setUnreadMessages(prevUnreadMessages => ({
            ...prevUnreadMessages,
            [senderId]: (prevUnreadMessages[senderId] || 0) + 1,
          }));
        }
      });

      // Start the SignalR connection
      connection.start().then(() => {
        console.log("SignalR connection established");
        setHubConnection(connection);
        // Join the chat group for the user
        connection.invoke("JoinChat", userID)
          .then(() => console.log(`Joined chat group for userID: ${userID}`))
          .catch(err => console.error("Error joining chat: ", err));
      }).catch(err => console.error("Connection failed: ", err));

      // Cleanup function to stop the connection on component unmount
      return () => {
        if (connection) {
          connection.stop().catch(err => console.error("Error stopping SignalR connection:", err));
        }
      };
    }
  }, [data, userID, token]); // Run when 'data', 'userID', or 'token' changes

  const handleCancelDelete = () => {
    setOpenDeleteDialog(false); // Close the dialog without deleting
  };

  // Load message history for the selected chat
  const loadMessageHistory = async (ownerID) => {
    try {
      const response = await axios.get(`/chat/history/${ownerID}`, {
        headers: { Authorization: `Bearer ${token}` }, // Include token for authorization
      });
      console.log("Message history response: ", response.data);
      setChatMessages(Array.isArray(response.data) ? response.data : []); // Update messages
    } catch (error) {
      console.error("Error loading message history:", error);
      if (error.response?.status === 401) {
        alert("Unauthorized access. Please login again.");
      }
    }
  };

  const lastMessageRef = useRef(null); // Reference for the last message

  // Auto-scroll to the last message when chat messages update
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [chatMessages]);

  // Send a message to the selected chat user
  const sendMessage = async () => {
    if (hubConnection && message.trim()) {
      try {
        console.log("Sending message to chat user:", selectedChatUser);
        await hubConnection.invoke("SendMessage", selectedChatUser.ownerID, message); // SignalR method
        //reload the messages after sending
        loadMessageHistory(selectedChatUser.ownerID);
        setMessage(''); // Clear input field
      } catch (error) {
        console.error("Error sending message via SignalR:", error);
      }
    }
  };

  // Open the chat window and load message history
  const openChatWindow = (ownerID) => {
    setSelectedChatUser({ ownerID }); // Set selected chat user
    console.log("Opening chat with ownerID:", ownerID);
    setShowModal(true); // Show the chat modal
    loadMessageHistory(ownerID); // Fetch message history

    // Reset unread message count for this user
    setUnreadMessages(prevUnreadMessages => ({
      ...prevUnreadMessages,
      [ownerID]: 0, // Reset unread messages for this user
    }));
  };

  // Delete a request and reload the page after deletion
  const handleDelete = (userID, propertyid) => {
    const url = `/Customer/DeleteRequest/${userID}/${propertyid}`;
    axios
      .delete(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log(res.data);
        toast.success(res.data.message, { position: "top-right", autoClose: 1500, });
        setTimeout(() => window.location.reload(), 1500); // Refresh page
      })
      .catch((err) => {
        toast.error("Error deleting request", { position: "top-right", autoClose: 1500, });
      }).finally(() => {
        setOpenDeleteDialog(false); // Close the delete dialog
      });
  };



  const deleteMessage = async (messageId) => {
    setChatMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.messageId === messageId ? { ...msg, isDeleting: true } : msg
      )
    );

    try {
      const response = await axios.delete(`/chat/delete/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        toast.success("Message deleted successfully.", {
          position: "top-right",
          autoClose: 1500,
        });
      }

      setTimeout(() => {
        setChatMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.messageId !== messageId)
        );
      }, 1500); // Allow time for toast display
    } catch (error) {

      toast.error("Failed to delete message.", {
        position: "top-right",
        autoClose: 1500,
      });
    }
    setChatMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.messageId === messageId ? { ...msg, isDeleting: false } : msg
      )
    );
  }



  // Handle pressing the 'Enter' key in the chat input
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent default behavior
      sendMessage(); // Trigger send message
    }
  };



  return (
    <>
      {loading ? (
        <Preloader /> // Show preloader when loading is true
      ) : (
        <div>
          <Customernavbar />
          <div className="tableContainer" style={{ marginTop: "20px" }}>
            {data.length === 0 ? (
              <div className="data-not-found-main">
                <div className="data-not-found-container">
                  <div className="data-not-found-content">
                    <img
                      src={crying}
                      alt="Data Not Found"
                      style={{ width: "200px", height: "200px" }}
                    />
                    <h4><i>You haven't requested for any property yet...!</i></h4>
                  </div>
                </div>
              </div>
            ) : (
              <TableContainer class="MuiTableContainer-root" component={Paper}>
                <Table class="MuiTable-root" style={{ width: "100%", fontfamily: "open Sans, sans-serif" }}>
                  <TableHead class="MuiTableHead-root" style={{ backgroundColor: '#464141', fontStyle: 'italic' }}>
                    <TableRow>
                      <TableCell class="MuiTableCell-head" style={{ color: 'white' }}><b>S.No</b></TableCell>
                      <TableCell class="MuiTableCell-head" style={{ color: 'white' }}><b>Property Name</b></TableCell>
                      <TableCell class="MuiTableCell-head" style={{ color: 'white' }}><b>Price</b></TableCell>
                      <TableCell class="MuiTableCell-head" style={{ color: 'white' }}><b>Type</b></TableCell>
                      <TableCell class="MuiTableCell-head" style={{ color: 'white' }}><b>Contact</b></TableCell>
                      <TableCell class="MuiTableCell-head" style={{ color: 'white' }}><b>Location</b></TableCell>
                      <TableCell class="MuiTableCell-head" style={{ color: 'white' }}><b>Actions</b></TableCell>
                      <TableCell class="MuiTableCell-head" style={{ color: 'white' }}><b>Status</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody class="MuiTableBody-root">
                    {data.map((property, index) => (
                      <TableRow class="MuiTableRow-root" key={property.propertyID}
                        sx={{
                          backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9', // Alternate row colors
                          '&:hover': { backgroundColor: '#D3D3D3' }, // Highlight on hover
                        }}>
                        <TableCell class="MuiTableCell-root" data-label="S.No">{index + 1}</TableCell>
                        <TableCell class="MuiTableCell-root" data-label="Property Name">{property.propertyDetails.propertyName}</TableCell>
                        <TableCell class="MuiTableCell-root" data-label="Price">
                          {property.propertyDetails.propertyType ===
                            "Houses_Apartments" &&
                            property.propertyDetails.propertyFor === "Sale" && (
                              <div>
                                {(
                                  property.propertyDetails.propertyPrice.toLocaleString() /
                                  property.propertyDetails.sqft
                                ).toFixed(2)}
                                /sqft
                              </div>
                            )}
                          {property.propertyDetails.propertyType === "Lands_Plots" &&
                            property.propertyDetails.propertyFor === "Sale" && (
                              <div>
                                {(
                                  property.propertyDetails.propertyPrice.toLocaleString() /
                                  property.propertyDetails.sqft
                                ).toFixed(2)}
                                /sqyd
                              </div>
                            )}
                          {property.propertyDetails.propertyType ===
                            "Shops_Offices" &&
                            property.propertyDetails.propertyFor === "Sale" && (
                              <div>
                                {(
                                  property.propertyDetails.propertyPrice.toLocaleString() /
                                  property.propertyDetails.sqft
                                ).toFixed(2)}
                                /sqft
                              </div>
                            )}
                          {property.propertyDetails.propertyType ===
                            "Houses_Apartments" &&
                            property.propertyDetails.propertyFor === "Rent" && (
                              <div>
                                {property.propertyDetails.propertyPrice.toLocaleString()}
                              </div>
                            )}
                          {property.propertyDetails.propertyType === "Lands_Plots" &&
                            property.propertyDetails.propertyFor === "Rent" && (
                              <div>
                                {property.propertyDetails.propertyPrice.toLocaleString()}{" "}
                              </div>
                            )}
                          {property.propertyDetails.propertyType ===
                            "Shops_Offices" &&
                            property.propertyDetails.propertyFor === "Rent" && (
                              <div>
                                {property.propertyDetails.propertyPrice.toLocaleString()}{" "}
                              </div>
                            )}
                          {property.propertyDetails.propertyType === "PG_GuestHouses" && (
                            <div>
                              {property.propertyDetails.propertyPrice.toLocaleString()}
                            </div>
                          )}
                        </TableCell>
                        <TableCell class="MuiTableCell-root" data-label="Type">{property.propertyDetails.type}</TableCell>
                        <TableCell class="MuiTableCell-root" data-label="Contact">
                          {property.propertyDetails.ownerMobileNo}
                        </TableCell>
                        <TableCell class="MuiTableCell-root" data-label="Location">
                          {property.propertyDetails.propertyLocation}
                        </TableCell>

                        <TableCell class="MuiTableCell-root" data-label="Actions">
                          <Box
                            sx={{

                              display: "flex", // Use flexbox to arrange buttons in a row
                              gap: "10px",// Add space between buttons
                            }}
                          >
                            {/* View Details Button */}
                            <Button
                              variant="contained"
                              onClick={() =>
                                navigate(`/Customerpropertydetails/${property.propertyID}`, {
                                  state: { from: "/CustomerSideRequests" },
                                })
                              }
                              sx={{
                                color: "white",
                                background: "blue", // Dark background for the button
                                padding: "6px 5px", // Reduced padding for smaller button
                                fontSize: "14px", // Smaller font size
                                textTransform: "none", // Remove default uppercase
                                borderRadius: "4px",
                                minWidth: "auto", // Adjust width to fit content
                                display: "flex", // Ensure icon and button are aligned in flexbox
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <FontAwesomeIcon
                                icon={faEye}
                                style={{ fontSize: "16px" }}
                              />
                            </Button>

                            {/* Message Button */}
                            <Button
                              type="button"
                              variant="contained"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openChatWindow(property.propertyDetails.ownerID);
                              }}
                              sx={{
                                position: 'relative', // For badge positioning
                                color: 'grey',
                                background: 'white', // White background for the button
                                padding: '6px 5px', // Reduced padding for smaller button
                                fontSize: '14px', // Smaller font size
                                textTransform: 'none', // Remove default uppercase
                                borderRadius: '4px',
                                minWidth: 'auto', // Adjust width to fit content
                                display: 'flex', // Ensure icon and button are aligned in flexbox
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                              disabled={property.statusType === "SoldOut"}
                            >
                              <FontAwesomeIcon
                                icon={faMessage}
                                style={{ fontSize: '16px' }}
                              />
                              {unreadMessages[property.propertyDetails.ownerID] > 0 && (
                                <span
                                  style={{
                                    position: 'absolute',
                                    top: '-8px',
                                    right: '-10px',
                                    backgroundColor: 'red',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '20px',
                                    height: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {unreadMessages[property.propertyDetails.ownerID]} {/* Display the count here */}
                                </span>
                              )}
                            </Button>

                            {/* Delete Button */}
                            <Button
                              type="submit"
                              variant="contained"
                              onClick={() => {
                                setPropertyID(property.propertyID);
                                setOpenDeleteDialog(true);
                              }}
                              sx={{
                                color: "white",
                                background: "red", // Red background for delete button
                                padding: "6px 5px", // Reduced padding for smaller button
                                fontSize: "14px", // Smaller font size
                                textTransform: "none", // Remove default uppercase
                                borderRadius: "4px",
                                minWidth: "auto", // Adjust width to fit content
                                display: "flex", // Ensure icon and button are aligned in flexbox
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <FontAwesomeIcon
                                icon={faTrashCan}
                                style={{ fontSize: "16px" }}
                              />
                            </Button>
                          </Box>
                        </TableCell>
                        <TableCell class="MuiTableCell-root" data-label="Status">
                          {property.statusType === "Pending" && (
                            <Button
                              type="submit"
                              variant="text"
                              sx={{ backgroundColor: "#A9A927", color: "white" }}
                            >
                              {property.statusType}
                            </Button>
                          )}
                          {property.statusType === "Sold" && (
                            <Button
                              type="submit"
                              variant="text"
                              sx={{ backgroundColor: "orange" }}
                            >
                              {property.statusType}
                            </Button>
                          )}
                          {property.statusType === "SoldOut" && (
                            <Button
                              type="submit"
                              variant="contained"
                              sx={{ backgroundColor: "red" }}
                            >
                              {property.statusType}
                            </Button>
                          )}
                          {property.statusType === "Rejected" && (
                            <Button
                              type="submit"
                              variant="contained"
                              sx={{ backgroundColor: "red" }}
                            >
                              {property.statusType}
                            </Button>
                          )}
                          {property.statusType === "Accepted" && (
                            <Button
                              type="submit"
                              variant="contained"
                              sx={{ backgroundColor: "green" }}
                            >
                              {property.statusType}
                            </Button>
                          )}
                          <Dialog open={openDeleteDialog} onClose={handleCancelDelete}>
                            <DialogTitle>Confirm Deletion</DialogTitle>
                            <DialogContent>
                              <Typography variant="body1">
                                Are you sure you want to delete your request?
                              </Typography>
                            </DialogContent>
                            <DialogActions>
                              <Button onClick={handleCancelDelete} color="primary">
                                Cancel
                              </Button>
                              <Button onClick={() =>
                                handleDelete(userID, propertyID)
                              } color="secondary">
                                Delete
                              </Button>
                            </DialogActions>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </div>



          {/* Chat Modal */}
          {selectedChatUser && (
            <Dialog open={showModal} maxWidth="sm" fullWidth PaperProps={{ sx: { height: "600px", display: "flex", flexDirection: "column" } }}>
              <Box sx={{ p: 2, backgroundColor: "#2196f3", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6">Chat with Owner</Typography>
                <Button onClick={() => setShowModal(false)} sx={{ color: "white", textTransform: "none" }}>
                  <FontAwesomeIcon icon={faClose} style={{ fontSize: "26px" }} />
                </Button>
              </Box>

              <MessageList ref={messageContainerRef}>
                {chatMessages.length > 0 ? (
                  chatMessages.map((msg, index) => (
                    <MessageContainer key={index} isowner={msg.senderId === userID} style={{ position: "relative" }}>
                      {msg.senderId !== userID && (
                        <Avatar src={msg.avatar} alt={msg.senderId} sx={{ marginRight: 1 }} />
                      )}
                      <MessageBubble isowner={msg.senderId === userID} style={{ position: "relative" }}>
                        {msg.isDeleting ? (
                          // Show spinner during deletion
                          <div
                            style={{
                              position: "absolute",
                              top: "-12px",
                              left: "-25px",
                              fontSize: "14px",
                              color: "gray",
                            }}
                          >
                            Deleting...
                          </div>
                        ) : (
                          msg.senderId === userID && (
                            <Button
                              variant="link"
                              onClick={() => deleteMessage(msg.messageId)}
                              style={{
                                position: "absolute",
                                top: "-12px",
                                left: "-25px",
                                color: "black",
                                fontSize: "21px",
                                textTransform: "none",
                              }}
                            >
                              <i className="bx bxs-message-rounded-x" />
                            </Button>
                          )
                        )}
                        <Typography variant="body1">{msg.message}</Typography>
                      </MessageBubble>


                      {msg.senderId === userID && (
                        <Avatar src={msg.avatar} alt={msg.senderId} sx={{ marginLeft: 1 }} />
                      )}
                    </MessageContainer>
                  ))
                ) : (
                  <Typography variant="body2">No messages yet.</Typography>
                )}
                <div ref={lastMessageRef} />
              </MessageList>

              <InputContainer>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Enter your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  size="small"
                  sx={{ marginRight: 1 }}
                />
                <IconButton color="blue" onClick={sendMessage} disabled={!message.trim()}>
                  <IoSendSharp size={24} />
                </IconButton>
              </InputContainer>
            </Dialog>
          )}
        </div >
      )}
    </>
  );
};

export default Customerrequests;
