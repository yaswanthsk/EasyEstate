import axios from "../../axios";
import React, { useState } from "react";
import {
    Container,
    Paper,
    Typography,
    Radio,
    RadioGroup,
    FormControlLabel,
    Button,
    Grid,
    Divider,
    Box,
    Card,
    CardContent,
} from "@mui/material";
import { styled } from "@mui/system";
import { BsCreditCard2Front } from "react-icons/bs";
import { MdPayment } from "react-icons/md";
import Ownernavbar from "../Ownernavbar/Ownernavbar";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginTop: theme.spacing(4),
    borderRadius: theme.spacing(2),
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
    background: "linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)"
}));



const StyledButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(3),
    padding: theme.spacing(1.5, 4),
    borderRadius: theme.spacing(1),
    fontSize: "1.1rem",
    transition: "all 0.3s ease",
    background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
    boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
    "&:hover": {
        transform: "scale(1.02)",
        boxShadow: "0 6px 10px 4px rgba(33, 203, 243, .3)"
    }
}));

const StyledCard = styled(Card)(({ theme, selected }) => ({
    padding: theme.spacing(2),
    transition: "all 0.3s ease",
    cursor: "pointer",
    border: selected ? "2px solid #2196F3" : "2px solid transparent",
    boxShadow: selected ? "0 4px 12px rgba(33, 150, 243, 0.2)" : "none",
    "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)"
    }
}));

const Subscription = () => {
    const userid = localStorage.getItem("id");
    const location = useLocation();
    const { status } = location.state || {}; // Extract the status
    const navigate = useNavigate();

    // Function to handle payment initiation and confirmation
    const handlePayment = async (amount, duration) => {

        console.log("amount", amount);
        console.log("duration", duration);
        const tempPayment = {
            userId: userid,
            amount: amount,
            plan: duration,
        };
        console.log(tempPayment);

        // Step 1: Initiate Payment
        const { data } = await axios.post("/Payment/initiate-payment", tempPayment);
        const { orderId } = data;

        // Step 2: Open Razorpay Checkout
        const options = {
            key: "rzp_test_P77TnrG5vYFT7o",
            amount: amount * 100,
            currency: "INR",
            order_id: orderId,
            handler: async (response) => {
                // Step 3: Confirm Payment
                try {
                    console.log(status);
                    // Step 3: Confirm Payment
                    if (status === "newuser") {
                        console.log("this is for newuser");
                        response = await axios.post("/Payment/confirm-payment", {
                            paymentId: response.razorpay_payment_id,
                            orderId: response.razorpay_order_id,
                        });
                        console.log(response);
                        if (response.data.status === "success") {
                            toast.success("Payment Successful!");
                            setTimeout(() => {
                                navigate('/ownerlanding');
                            }, 2000);
                        }
                    } else if (status === "renewaluser") {
                        console.log("this is renewal user");
                        response = await axios.put(`/Payment/update-subscription/${userid}`, {
                            paymentId: response.razorpay_payment_id,
                            orderId: response.razorpay_order_id,
                        });

                        if (response.data.status === "success") {
                            toast.success("Payment Successful!");
                            setTimeout(() => {
                                navigate('/ownerlanding');
                            }, 2000);
                        }
                    } else {
                        toast.warn("No payment action required for this status.");
                    }
                } catch (error) {
                    console.error("Error confirming or updating payment:", error);
                    toast.error("Payment processing failed. Please try again.");
                }
            },
            theme: {
                color: "#3399cc",
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    const subscriptionPlans = [
        { duration: "1", price: 199, savings: 0, DiscountAmount: 0 },
        { duration: "3", price: 499, savings: 5, DiscountAmount: 25 },
        { duration: "6", price: 899, savings: 10, DiscountAmount: 90 },
        { duration: "12", price: 1499, savings: 13, DiscountAmount: 195 }
    ];

    const [selectedPlan, setSelectedPlan] = useState("");

    const handlePlanChange = (event) => {
        setSelectedPlan(event.target.value);
    };

    const getSelectedPlanDetails = () => {
        return subscriptionPlans.find((plan) => plan.duration === selectedPlan);
    };

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
                        Choose Your Subscription Plan
                    </Typography>
                    <Divider sx={{ my: 3, bgcolor: "primary.light" }} />

                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom sx={{ color: "text.primary", fontWeight: 600 }}>
                                Select Plan Duration
                            </Typography>
                            <RadioGroup value={selectedPlan} onChange={handlePlanChange}>
                                {subscriptionPlans.map((plan) => (
                                    <StyledCard key={plan.duration} selected={selectedPlan === plan.duration}>
                                        <CardContent>
                                            <FormControlLabel
                                                value={plan.duration}
                                                control={<Radio color="primary" />}
                                                label={
                                                    <Box sx={{ ml: 1 }}>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                            {plan.duration} Month(s) - ₹
                                                            {plan.price}
                                                        </Typography>
                                                        {plan.savings > 0 && (
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    color: "success.main",
                                                                    fontWeight: 500,
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: 0.5
                                                                }}
                                                            >
                                                                Save {plan.savings}%
                                                            </Typography>
                                                        )}

                                                    </Box>
                                                }
                                                sx={{ m: 0 }}
                                            />
                                        </CardContent>
                                    </StyledCard>
                                ))}
                            </RadioGroup>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom sx={{ color: "text.primary", fontWeight: 600 }}>
                                Billing Information
                            </Typography>
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 3,
                                    bgcolor: "grey.50",
                                    borderRadius: 2,
                                    border: "1px solid rgba(0, 0, 0, 0.1)"
                                }}
                            >
                                {selectedPlan ? (
                                    <>
                                        <Box display="flex" justifyContent="space-between" mb={2}>
                                            <Typography color="text.secondary">Selected Plan:</Typography>
                                            <Typography fontWeight="bold" color="primary.main">{selectedPlan} Month(s)</Typography>
                                        </Box>
                                        <Box display="flex" justifyContent="space-between" mb={2}>
                                            <Typography color="text.secondary">Price:</Typography>
                                            <Typography fontWeight="bold" color="primary.main">
                                                ₹
                                                {getSelectedPlanDetails()?.price}
                                            </Typography>
                                        </Box>
                                        {/* <Box display="flex" justifyContent="space-between" mb={2}>
                                        <Typography color="text.secondary">Savings:</Typography>
                                        <Typography color="success.main" fontWeight="bold">
                                            {getSelectedPlanDetails()?.savings}%
                                        </Typography>
                                    </Box> */}
                                        <Box display="flex" justifyContent="space-between" mb={2}>
                                            <Typography color="text.secondary">Discount Amount:</Typography>
                                            <Typography color="orange" fontWeight="bold">
                                                - ₹{getSelectedPlanDetails()?.DiscountAmount}
                                            </Typography>
                                        </Box>
                                        <Divider sx={{ my: 2 }} />
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="h6">Total Amount:</Typography>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                                                    WebkitBackgroundClip: "text",
                                                    WebkitTextFillColor: "transparent",
                                                    fontWeight: "bold"
                                                }}
                                            >
                                                ₹
                                                {getSelectedPlanDetails()?.price - getSelectedPlanDetails()?.DiscountAmount}
                                            </Typography>
                                        </Box>
                                    </>
                                ) : (
                                    <Typography color="text.secondary" sx={{ textAlign: "center" }}>
                                        Please select a plan to view billing details
                                    </Typography>
                                )}
                            </Paper>

                            <StyledButton
                                variant="contained"
                                fullWidth
                                disabled={!selectedPlan}
                                startIcon={<MdPayment />}
                                endIcon={<BsCreditCard2Front />}
                                onClick={() => handlePayment(getSelectedPlanDetails()?.price - getSelectedPlanDetails()?.DiscountAmount, getSelectedPlanDetails()?.duration)}
                            >
                                Proceed to Payment
                            </StyledButton>
                        </Grid>
                    </Grid>
                </StyledPaper>
            </Container>
        </>
    );
};

export default Subscription;