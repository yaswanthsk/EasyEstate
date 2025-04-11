import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  Box,
} from "@mui/material";
import { toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Rating from "react-rating-stars-component";
import { FaStar } from "react-icons/fa";
import axios from "../../axios";
import { useNavigate } from "react-router-dom";
import "./Logoutmodel.css"; // Link to the CSS file

// Component to handle logout or review functionality
const Logoutmodal = ({ open, handleClose }) => {
  // State management for review dialog visibility
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // State to track rating input
  const [rating, setRating] = useState(0);

  // State to store user comments
  const [comments, setComments] = useState("");

  // State to manage error messages for empty comments
  const [error, setError] = useState("");

  // React Router navigation hook
  const navigate = useNavigate();

  // Retrieve token and username from localStorage
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  // Logout handler: Clears localStorage, makes API call, and redirects to home
  const handleLogout = () => {
    const url = `/Auth/Logout?userToken=${token}`;
    axios.post(url);
    localStorage.clear();
    navigate("/");
  };

  // Submit review handler: Validates input, posts review data, and logs out user
  const handleReviewSubmit = async () => {
    // Validate that comments are not empty
    if (!comments.trim()) {
      setError("Comments are required.");
      return;
    }

    try {
      // Prepare review data
      const reviewData = { username, rating, comments };

      // API call to submit the review
      const response = await axios.post("/Review/PostReview", reviewData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Handle successful review submission
      if (response.status === 200) {
        setRating(0);
        setComments("");
        toast.success("Thanks for your review!", { position: "top-right", autoClose: 1500 });
        setIsReviewOpen(false);
        // handleClose();    
        console.log("review submitted");
        setTimeout(() => {
          handleLogout();    // Logout user after review
        }, 1500);
        
      }
    } catch (error) {
      console.error("Error submitting review", error);
    }
  };

  // Open review dialog and close the logout dialog
  const openReview = () => {
    setIsReviewOpen(true);
    handleClose();
  };

  return (
    <>
      {/* Main Logout Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          Share your experience with EasyState by leaving a review – we'd love your feedback!
        </DialogTitle>
        <DialogContent>
          <DialogContentText>Select an option below:</DialogContentText>
        </DialogContent>
        <DialogActions>
          {/* Button to open review dialog */}
          <Button onClick={openReview}>Review Us</Button>
          
          {/* Button to logout directly */}
          <Button onClick={handleLogout} color="secondary">
            Logout
          </Button>
        </DialogActions>
      </Dialog>

      {/* Review Submission Dialog */}
      <Dialog open={isReviewOpen} onClose={() => setIsReviewOpen(false)}>
        <Box className="feedback-container">
          {/* Close button for review dialog */}
          <button
            className="feedback-close-button"
            onClick={() => setIsReviewOpen(false)}
          >
            &times;
          </button>

          {/* Review title */}
          <Typography variant="h5" component="h2" className="feedback-title">
            We appreciate your feedback
          </Typography>

          <DialogContent>
            {/* Rating component */}
            <div className="feedback-rating">
              <Rating
                count={5}
                value={rating}
                onChange={(newRating) => {
                  console.log("Selected Rating:", newRating);
                  setRating(newRating);
                }}
                size={35}
                precision={1.5}
                className="feedback-stars"
                emptyIcon={<FaStar className="feedback-star-empty" />}
                fullIcon={<FaStar className="feedback-star-full" />}
              />
            </div>

            {/* Comments textarea */}
            <textarea
              className="feedback-comments-textarea"
              placeholder="Enter your comments here..."
              value={comments}
              onChange={(e) => {
                setComments(e.target.value);
                setError(""); // Clear error on input
              }}
            />
            
            {/* Error message for empty comments */}
            {error && (
              <Typography color="error" variant="body2" className="feedback-error">
                {error}
              </Typography>
            )}
          </DialogContent>
          
          {/* Submit button for review */}
          <DialogActions>
            <Button
              className="feedback-submit-button"
              onClick={handleReviewSubmit}
              variant="contained"
            >
              Submit
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

    </>
  );
};

export default Logoutmodal;
