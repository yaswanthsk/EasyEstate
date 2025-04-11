import React, { useState, useEffect, useRef } from "react";
import { Button, FormControl } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Box, TableCell, TableContainer, Table, TableHead, TableRow, TableBody, Paper, Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography, IconButton,
  TextField,
  Avatar
} from "@mui/material";
import axios from "../../axios";
import { IoSendSharp } from "react-icons/io5";
import { styled } from "@mui/system";
import { FaCommentAlt, FaSearch } from "react-icons/fa";
import { HubConnectionBuilder } from "@microsoft/signalr";
import "./Propertyrequests.css";
import Ownernavbar from "../Ownernavbar/Ownernavbar";
import { faClose, } from "@fortawesome/free-solid-svg-icons";
import crying from '../../../Assets/Images/crying.jpg';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Preloader from "../../Preloader/Preloader";

const MessageContainer = styled(Box)(({ theme, iscustomer }) => ({
  display: "flex",
  justifyContent: iscustomer ? "flex-end" : "flex-start",
  marginBottom: theme.spacing(2),
}));

const MessageBubble = styled(Paper)(({ theme, iscustomer }) => ({
  padding: theme.spacing(1, 2),
  maxWidth: "70%",
  backgroundColor: iscustomer ? "#2196f3" : "#f5f5f5",
  color: iscustomer ? "#fff" : "#000",
  borderRadius: theme.spacing(2),
  marginLeft: iscustomer ? theme.spacing(1) : 0,
  marginRight: iscustomer ? 0 : theme.spacing(1),
}));

const MessageList = styled(Box)({
  height: "400px",
  overflowY: "auto",
  padding: "16px",
});

const InputContainer = styled(Box)({
  display: "flex",
  padding: "16px",
  borderTop: "1px solid #e0e0e0",
  backgroundColor: "#fff",
});

const Propertyrequests = () => {
  const [requests, setRequests] = useState([]);
  const [properties, setProperties] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [hubConnection, setHubConnection] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState({});
  const token = localStorage.getItem("token");
  const ownerId = localStorage.getItem("id");
  const messageContainerRef = useRef(null);


  useEffect(() => {
    if (ownerId) {
      fetchCustomerRequests(ownerId);
    }
  }, [ownerId]);


  // Scroll the chat to the latest message whenever the messages update
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Fetch customer requests
  useEffect(() => {
    fetchCustomerRequests();
  }, []);

  // Initialize SignalR connection on component mount
  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl('http://localhost:5253/chat', {
      // .withUrl('https://propertyfindsystem.azurewebsites.net/chat', {
        accessTokenFactory: () => token// Ensure the token is passed here
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000]) // Reconnect strategy
      .build();

    // Handle receiving messages from SignalR
    connection.on("ReceiveMessage", (senderId, message) => {
      console.log(`Received message from ${senderId}: ${message}`);
      setChatMessages(prevMessages => [...prevMessages, { senderId, message }]);

      // Update unread message count if the message is not from the current user
      if (senderId !== ownerId) {
        setUnreadMessages(prevUnreadMessages => ({
          ...prevUnreadMessages,
          [senderId]: (prevUnreadMessages[senderId] || 0) + 1,
        }));
      }
    });

    // Start the SignalR connection
    connection.start()
      .then(() => {
        console.log("SignalR connection established");
        setHubConnection(connection);
        connection.invoke("JoinChat", ownerId)
          .then(() => {
            console.log(`Joined chat group successfully for ${ownerId}`);
          })
          .catch(err => console.error("Error joining chat group:", err));
      })
      .catch(err => console.error("Connection failed:", err));

    // Clean up the connection on unmount
    return () => {
      if (connection) {
        connection.stop().catch(err => console.error("Error stopping SignalR connection:", err));
      }
    };
  }, [ownerId]);
  const lastMessageRef = useRef(null); // Reference for the last message

  useEffect(() => {
    // Scroll to the last message every time the chatMessages array changes
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end", // Align the last message at the bottom
      });
    }
  }, [chatMessages]);

  // Load message history when a new chat user is selected
  useEffect(() => {
    if (selectedChatUser) {
      loadMessageHistory(selectedChatUser.userId);
    }
  }, [selectedChatUser]);

  // Load the message history for a specific user
  const loadMessageHistory = async (receiverId) => {
    try {
      const response = await axios.get(`/chat/history/${receiverId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data && Array.isArray(response.data)) {
        setChatMessages(response.data);  // Set chat messages

      } else {
        setChatMessages([]);  // Fallback to empty array if no messages
      }
    } catch (error) {
      console.error("Error loading message history:", error);
    }
  };

  // Send a message to the selected user via SignalR
  const sendMessage = async () => {
    if (hubConnection && message.trim()) {
      console.log("Sending message...");
      console.log("Token being used:", token); // Log the token being used
      try {
        // Send message using SignalR
        await hubConnection.invoke("SendMessage", selectedChatUser.userId, message);

        //reload the messages after sending
        loadMessageHistory(selectedChatUser.userId);
        // setChatMessages(prevMessages => [...prevMessages, { senderId: ownerId, message }]);
        setMessage('');  // Clear the input
      } catch (error) {
        console.error("Error sending message: ", error);
      }
    }
  };

  // Open the chat window for the selected user
  const openChatWindow = (userId) => {
    setSelectedChatUser({ userId });
    console.log('Opening chat with CustomerID:', userId);
    setShowModal(true);

    // Reset unread message count for this user when the chat is opened
    setUnreadMessages(prevUnreadMessages => ({
      ...prevUnreadMessages,
      [userId]: 0, // Reset unread count
    }));
  };


  // Handle status change for Accept, Reject, Soldout, and Revert
  const handleStatusChange = async (newStatus, userid, propertyid, ownerid) => {
    const url = `/Owner/UpdatePropStatus`;
    const data = {
      statusType: newStatus,
      userId: userid,
      propertyID: propertyid,
      ownerID: ownerid,
    };

    try {
      const res = await axios.put(url, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success(res.data.message, { position: "top-right", autoClose: 1500 });

      // Refetch updated requests after status change
      fetchCustomerRequests(ownerId);
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Failed to update status. Please try again.", { position: "top-right", autoClose: 1500 });
    }
  };

  const fetchCustomerRequests = async (ownerId) => {
    setError("");
    try {
      const response = await axios.get(
        `/Owner/ViewCustomerRequests/${ownerId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
      );
      console.log(response);

      if (response.data && response.data.status === "Success") {
        const updatedRequests = response.data.data.map((req) => {
          const isPropertySoldOut = response.data.data.some(
            (r) => r.propertyID === req.propertyID && r.statusType === "Sold"
          );

          return isPropertySoldOut
            ? req.statusType === "Sold"
              ? { ...req, isSoldOut: true, disabled: true }
              : { ...req, statusType: "Rejected", disabled: true }
            : { ...req };
        });

        setRequests(updatedRequests);
        setFilteredRequests(updatedRequests);

        const uniqueProperties = Array.from(
          new Set(response.data.data.map((req) => req.propertyDetails.propertyName))
        ).map((propertyName) => ({
          id: propertyName,
          propertyName,
        }));
        setProperties(uniqueProperties);
      } else {
        setError(response.data.message || "No requests found.");
        // setLoading(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch requests.");
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
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
        toast.success("Message deleted successfully.", { position: "top-right", autoClose: 1500 });
      }
      setTimeout(() => {
        setChatMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.messageId !== messageId)
        );
      }, 1500); // Allow time for toast display
    } catch (error) {
      console.error("Error deleting message: ", error);
      toast.error("Failed to delete message.", { position: "top-right", autoClose: 1500 });
    }
    setChatMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.messageId === messageId ? { ...msg, isDeleting: false } : msg
      )
    );
  };

  // Filter requests based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = requests.filter((req) =>
        req.propertyDetails?.propertyName
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
      setFilteredRequests(filtered);
    } else {
      setFilteredRequests(requests);
    }
  }, [searchQuery, requests]);

  const requestsByProperty = {};
  filteredRequests.forEach((req) => {
    const propertyName = req.propertyDetails?.propertyName || "N/A";
    if (!requestsByProperty[propertyName]) {
      requestsByProperty[propertyName] = [];
    }
    requestsByProperty[propertyName].push(req);
  });
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {loading ? (
        <Preloader />
      ) : (
        <div className="View-request-main-container">
          <Ownernavbar />

          {/* Search Bar */}
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <FormControl
              type="text"
              placeholder="Search by property name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              list="properties"
            />
            <datalist id="properties">
              {properties.map((property) => (
                <option key={property.id} value={property.propertyName} />
              ))}
            </datalist>
          </div>

          {/* Data Content */}
          <div className="container-view-requests">
            {Object.keys(requestsByProperty).length > 0 ? (
              Object.entries(requestsByProperty).map(
                ([propertyName, propertyRequests]) => (
                  <div key={propertyName} style={{ marginBottom: "20px" }}>
                    <h3 style={{ fontFamily: "open Sans, sans-serif", fontStyle: "italic" }}>Requests for {propertyName}</h3>
                    <div className="table-wrapper" style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexDirection: "column",
                      gap: "15px"
                    }}>
                      <table className="requests-table" style={{ width: "80%", fontfamily: "open Sans, sans-serif", borderCollapse: "collapse" }}>
                        <thead style={{ backgroundColor: '#464141', fontStyle: 'italic' }}>
                          <tr>
                            <th style={{ width: "10%", color: 'white' }}>Customer Name</th>
                            <th style={{ width: "10%", color: 'white' }}>Property Type</th>
                            <th style={{ width: "10%", color: 'white' }}>Actions</th>
                            <th style={{ width: "10%", color: 'white' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {propertyRequests.map((req, index) => (
                            <tr
                              key={index}
                              style={{
                                backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9', // Alternate row colors
                                cursor: 'pointer', // Add a pointer cursor on hover
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor = '#d3d3d3') // Change background color on hover
                              }
                              onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                index % 2 === 0 ? '#ffffff' : '#f9f9f9') // Revert to original color
                              }
                            >
                              <td>{req.customerName}</td>
                              <td>{req.propertyDetails?.propertyType || "N/A"}</td>
                              <td>
                                {req.isSoldOut ? (
                                  <span style={{ color: "red", fontWeight: "bold" }}>
                                    Sold
                                  </span>
                                ) : (
                                  <Box sx={{ display: "flex", gap: "10px" }}>
                                    {req.statusType === "Accepted" ? (
                                      <>
                                        <Button
                                          variant="warning"
                                          onClick={() =>
                                            handleStatusChange(
                                              "Sold",
                                              req.userId,
                                              req.propertyID,
                                              req.ownerID
                                            )
                                          }
                                        >
                                          Sold
                                        </Button>
                                        <Button
                                          variant="info"
                                          onClick={() =>
                                            handleStatusChange(
                                              "Pending",
                                              req.userId,
                                              req.propertyID,
                                              req.ownerID
                                            )
                                          }
                                        >
                                          Revert
                                        </Button>
                                      </>
                                    ) : req.statusType === "Rejected" ? (
                                      <>
                                        <Button
                                          variant="info"
                                          onClick={() =>
                                            handleStatusChange("Pending", req.userId, req.propertyID, req.ownerID)
                                          }
                                          disabled={req.disabled}
                                        >
                                          Revert
                                        </Button>
                                      </>
                                    ) : (
                                      <>
                                        <Button
                                          variant="success"
                                          onClick={() =>
                                            handleStatusChange(
                                              "Accepted",
                                              req.userId,
                                              req.propertyID,
                                              req.ownerID
                                            )
                                          }
                                          disabled={req.disabled}
                                        >
                                          Accept
                                        </Button>
                                        <Button
                                          variant="danger"
                                          onClick={() =>
                                            handleStatusChange(
                                              "Rejected",
                                              req.userId,
                                              req.propertyID,
                                              req.ownerID
                                            )
                                          }
                                          disabled={req.disabled}
                                        >
                                          Reject
                                        </Button>
                                      </>
                                    )}
                                    <Button
                                      variant="primary"
                                      onClick={() => openChatWindow(req.userId)}
                                      disabled={req.disabled}
                                      style={{ position: "relative" }}
                                    >
                                      <FaCommentAlt /> {/* Chat Icon as Button */}
                                      {unreadMessages[req.userId] > 0 && (
                                        <span
                                          style={{
                                            position: "absolute",
                                            top: "-8px",
                                            right: "-10px",
                                            backgroundColor: "green",
                                            color: "white",
                                            borderRadius: "50%",
                                            width: "20px",
                                            height: "20px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                          }}
                                        >
                                          {unreadMessages[req.userId]}{" "}
                                          {/* Display the count */}
                                        </span>
                                      )}
                                    </Button>
                                  </Box>
                                )}
                              </td>
                              <td>{req.statusType || "Pending"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <br/>
                    </div>
                  </div>
                )
              )
            ) : (
              // No Requests Found Message
              <div className="data-not-found-main">
                <div className="data-not-found-container">
                  <div className="data-not-found-content">
                    <img
                      src={crying} // Replace with your "not found" GIF path
                      alt="Data Not Found"
                      style={{ width: "200px", height: "200px" }}
                    />
                    <h4>
                      <i>No Customer requested for your properties yet...!</i>
                    </h4>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Modal */}
          {selectedChatUser && (
            <Dialog
              open={showModal}
              maxWidth="sm"
              fullWidth
              PaperProps={{
                sx: {
                  height: "600px",
                  display: "flex",
                  flexDirection: "column",
                },
              }}
            >
              <Box
                sx={{
                  p: 2,
                  backgroundColor: "#2196f3",
                  color: "white",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6">Chat with Customer</Typography>
                <Button
                  onClick={() => setShowModal(false)}
                  sx={{
                    background: "none",
                    color: "white",
                    textTransform: "none",
                  }}
                >
                  <FontAwesomeIcon icon={faClose} style={{ fontSize: "26px" }} />{" "}
                </Button>
              </Box>

              {/* Chat Messages */}
              <MessageList ref={messageContainerRef}>
                {chatMessages.length > 0 ? (
                  chatMessages.map((msg, index) => (
                    <MessageContainer
                      key={index}
                      iscustomer={msg.senderId === ownerId}
                    >
                      {msg.senderId !== ownerId && (
                        <Avatar src={msg.avatar} alt={msg.senderId} sx={{ marginRight: 1 }} />
                      )}
                      <MessageBubble
                        iscustomer={msg.senderId === ownerId}
                        style={{ position: "relative" }}
                      >
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
                          msg.senderId === ownerId && (
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
                      {msg.senderId === ownerId && (
                        <Avatar src={msg.avatar} alt={msg.senderId} sx={{ marginLeft: 1 }} />
                      )}
                    </MessageContainer>
                  ))
                ) : (
                  <Typography variant="body2">No messages yet.</Typography>
                )}
                <div ref={lastMessageRef} />
              </MessageList>

              {/* Chat Input */}
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
                <IconButton
                  color="blue"
                  onClick={sendMessage}
                  disabled={!message.trim()}
                >
                  <IoSendSharp size={24} />
                </IconButton>
              </InputContainer>
            </Dialog>
          )}
        </div>
      )}
    </>
  );

};

export default Propertyrequests;
