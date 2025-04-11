import React, { useEffect, useState } from "react";
import {
    Container,
    Paper,
    Typography,
    Chip,
    Divider,
    Grid,
    Box,
    Alert
} from "@mui/material";
import { styled } from "@mui/system";
import axios from "../../axios";
import Ownernavbar from "../Ownernavbar/Ownernavbar";
import { useNavigate } from 'react-router-dom';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginTop: theme.spacing(4),
    borderRadius: theme.spacing(2),
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
    background: "linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)"
}));

const Subscriptiondata = () => {
    const [subscriptionData, setSubscriptionData] = useState(null);
    const [error, setError] = useState("");
    const userId = localStorage.getItem("id");
    const navigate = useNavigate();
    const[status,setStatus]=useState("");

    const handleSubscribe = () => {
        navigate("/Subscription", { state: { status } });;
    }

    useEffect(() => {
        // Function to fetch subscription status
        const fetchSubscriptionStatus = async () => {
          try {
            const response = await axios.post(`/Payment/update-subscription-status/${userId}`);
            setSubscriptionData(response.data);
            setStatus(response.data.status);
          } catch (error) {
            console.error("Error fetching subscription status:", error);
            setError("Failed to fetch subscription status.");
          }
        };
    
        if (userId) {
          fetchSubscriptionStatus(); // Call the API when the component mounts
        }
      }, [userId]); // Dependency array ensures the effect is re-run if userId changes

    if (!subscriptionData) {
        return <div>Loading...</div>; // Loading state
    }



    return (
        <>
            <Ownernavbar />
            <Container maxWidth="md">
                <StyledPaper elevation={3}>
                    <Typography
                        variant="h4"
                        gutterBottom
                        color="primary"
                        sx={{
                            fontWeight: "bold",
                            textAlign: "center",
                            background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent"
                        }}
                    >
                        Subscription Status
                    </Typography>
                    <Divider sx={{ my: 3, bgcolor: "primary.light" }} />
                    <Grid container spacing={3} justifyContent="center">
                        {subscriptionData.status === "newuser" && (
                            <Grid item xs={12}>
                                <Alert severity={"warning"} sx={{ mb: 3 }}>
                                    You are not yet subscribed! Please Subscribe to make your property visible to millions of customers.
                                </Alert>
                                <button onClick={handleSubscribe}>subscribe</button>
                            </Grid>
                        )}
                        {subscriptionData.status === "activeuser" && (
                            <Grid item xs={12}>
                                <Alert severity={"success"} sx={{ mb: 3 }}>
                                    Your subscription is active.
                                </Alert>
                                <Grid item xs={12} md={8}>
                                    <Paper elevation={2} sx={{ p: 3, bgcolor: "grey.50", borderRadius: 2 }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                            <Typography>Current Plan:</Typography>
                                            <Typography color="text.secondary">
                                                <b>{subscriptionData.data.plan}</b> month(s)
                    
                                            </Typography>
                                        </Box>

                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                            <Typography>Start Date:</Typography>
                                            <Typography color="text.secondary">
                                                {new Date(subscriptionData.data.paidAt).toLocaleDateString()}
                                            </Typography>
                                        </Box>

                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                            <Typography>Remaining Days:</Typography>
                                            <Typography color="text.secondary">
                                                {subscriptionData.data.remainingDays}
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Grid>
                        )}
                        {subscriptionData.status === "renewaluser" && (
                            <Grid item xs={12}>
                                <Alert severity={"info"} sx={{ mb: 3 }}>
                                    Your subscription is due for renewal.
                                </Alert>
                                <button onClick={handleSubscribe}>renew</button>
                            </Grid>
                        )}


                    </Grid>
                </StyledPaper>
            </Container>
        </>
    );
};

export default Subscriptiondata;
