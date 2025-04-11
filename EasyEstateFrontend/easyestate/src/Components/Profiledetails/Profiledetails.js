import React, { useState, useEffect } from 'react';
import axios from '../axios';
import './Profiledetails.css';
import PersonIcon from '@mui/icons-material/Person';
import { Avatar } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {toast } from "react-toastify";
import MenuItem from '@mui/material/MenuItem';
import {
    Box,
    Container,
    Typography,
    Grid,
    TextField,
    Button,
    IconButton,
    Card,
    CardContent,
    Snackbar,
    Alert,
    Stack,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle
} from '@mui/material';
import { styled } from '@mui/system';
import { BsCameraFill } from 'react-icons/bs';

// Styled Components
const ProfileHeader = styled(Box)(({ theme }) => ({
    backgroundImage: 'url(https://images.unsplash.com/photo-1557683316-973673baf926)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: '150px',
    position: 'relative',
    marginBottom: '60px'
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    width: 120,
    height: 120,
    borderRadius: '50%',
    border: '4px solid #fff',
    position: 'absolute',
    bottom: '-60px',
    left: '50%',
    transform: 'translateX(-50%)',
    transition: 'transform 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateX(-50%) scale(1.05)'
    }
}));

const CameraOverlay = styled(Box)({
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'opacity 0.3s ease',
    opacity: 0,
    '&:hover': {
        opacity: 1,
    },
});

const HiddenInput = styled('input')({
    display: 'none',
});

const ErrorMessage = styled(Typography)(({ theme }) => ({
    color: theme.palette.error.main,
    fontSize: '0.875rem',
    marginTop: '8px',
    textAlign: 'center',
}));

const Profiledetails = () => {
    const [userData, setUserData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [originalUserData, setOriginalUserData] = useState({});
    const [image, setImage] = useState(null); // To store image
    const [errorMessage, setErrorMessage] = useState(""); // Error message for file validation
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // Dialog for delete confirmation
    const userId = localStorage.getItem("id");
    const navigate = useNavigate();
    const role = localStorage.getItem("role");
    const [formErrors, setFormErrors] = useState({});


    var token = localStorage.getItem('token');

    useEffect(() => {
        fetchUserData();
    }, [userId]);

    const fetchUserData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/Account/GetProfile/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUserData(response.data);
            setOriginalUserData({ ...response.data }); // Store original data
        } catch (err) {
            setError('Error fetching user data');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                setErrorMessage("Please select an image file");
                return;
            }

            if (file.size > 5000000) { // Max size: 5MB
                setErrorMessage("Image size should be less than 5MB");
                return;
            }

            setErrorMessage(""); // Clear error
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result); // Save base64 encoded image
            };
            reader.readAsDataURL(file);
        }
    };

    const validateField = (name, value) => {
        let error = "";

        switch (name) {
            case "phoneNumber":
                if (!/^\d+$/.test(value)) {
                    error = "Phone number must contain only digits.";
                } else if (!/^\d{10}$/.test(value)) {
                    error = "Phone number must be exactly 10 digits.";
                } else if (!/^[6-9]\d{9}$/.test(value)) {
                    error = "Phone number must start with 6, 7, 8, or 9.";
                }
                break;
            case "dateofBirth":
                const today = new Date();
                const dob = new Date(value);
                let age = today.getFullYear() - dob.getFullYear(); // Use `let` if `age` will be modified.
                const month = today.getMonth() - dob.getMonth();
                if (month < 0 || (month === 0 && today.getDate() < dob.getDate())) {
                    age--; // This would throw an error if `age` were declared with `const`.
                }
                if (dob > today && age < 0) {
                    error = "Date of Birth cannot be in the future.";
                }
                if (age >= 0 && age < 18) {
                    error = "You must be at least 18 years old.";
                }
                break;

            default:
                break;
        }

        setFormErrors(prev => ({ ...prev, [name]: error }));
        return error;
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData(prevData => ({ ...prevData, [name]: value }));
        validateField(name, value);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = Object.keys(userData).reduce((acc, field) => {
            const error = validateField(field, userData[field]);
            if (error) acc[field] = error;
            return acc;
        }, {});

        setFormErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            const errorMessages = Object.values(validationErrors).join('\n');
            alert(errorMessages);
            return; // Stop submission if there are validation errors
        }

        const hasChanges = Object.keys(userData).some(key => userData[key] !== originalUserData[key]);
        if (!hasChanges && !image) {
            toast.warning('No changes detected.');
            return;
        }

        try {
            const updateData = {
                FirstName: userData.firstName,
                LastName: userData.lastName,
                Email: userData.email,
                PhoneNumber: userData.phoneNumber,
                DateofBirth: userData.dateofBirth,
                Address: userData.address,
                Gender: userData.gender,
                Avatar: image // Attach the base64 image string
            };

            const response = await axios.put(`/Account/update/${userId}`, updateData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.status === 200) {
                setOriginalUserData({ ...userData });
                setIsEditing(false);
                setShowSnackbar(true);
            } else {
                alert('Failed to update profile.');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('An error occurred while updating the profile.');
        }
    };

    const handleDeleteAccount = async () => {
        try {
            const response = await axios.delete(`/Account/DeleteAccount/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.status === 200) {
                // Handle successful deletion, e.g., redirect to login or home page
                alert('Account deleted successfully');
                // Redirect the user
                localStorage.clear();
                navigate('/');
            } else {
                alert('Failed to delete account');
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            alert('An error occurred while deleting the account.');
        } finally {
            setOpenDeleteDialog(false);  // Close the dialog
        }
    };

    const handleCancel = () => {
        setIsEditing(false); // Turn off editing mode
        fetchUserData();     // Fetch the user data to reset changes
    };

    const handleCancelDelete = () => {
        setOpenDeleteDialog(false); // Close the dialog without deleting
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!userData || Object.keys(userData).length === 0) {
        return <div>No user data available.</div>;
    }

    return (
        <div>
            <Container maxWidth="md" sx={{ py: 2 }}>
                <Card elevation={4} sx={{ position: 'relative', overflow: 'visible' }}>
                    <ProfileHeader role="banner" aria-label="Profile header">
                        {isEditing && (<input
                            type="file"
                            accept="image/*"
                            id="avatar-upload"
                            style={{ display: 'none' }}
                            onChange={handleImageChange} // Handle image change
                        />)}
                        <label htmlFor="avatar-upload">
                            <StyledAvatar
                                src={image || `data:image/jpeg;base64,${userData.avatar}`}
                                aria-label="Profile picture"
                            />
                            {isEditing && (<CameraOverlay>
                                <IconButton sx={{ color: "white" }} aria-label="Upload photo" component="span">
                                    <BsCameraFill size={24} />
                                </IconButton>
                            </CameraOverlay>)}



                        </label>
                    </ProfileHeader>

                    <CardContent sx={{ pt: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} textAlign="center">
                                <Typography variant="h3" gutterBottom sx={{ mb: 1 }}>
                                    {userData.firstName} {userData.lastName}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} textAlign="center">
                                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2', textDecoration: 'underline', mb: 2 }}>
                                    {userData.email}
                                </Typography>
                            </Grid>

                            {/* Editable Fields */}
                            <Grid item xs={12} md={6}>
                                <Stack spacing={2}>
                                    <TextField fullWidth label="First Name" name="firstName" value={userData.firstName} onChange={handleInputChange} disabled={!isEditing} />
                                    <TextField
                                        fullWidth
                                        label="Phone"
                                        name="phoneNumber"
                                        value={userData.phoneNumber}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        error={Boolean(formErrors.phoneNumber)}
                                        helperText={formErrors.phoneNumber}
                                    />
                                    <TextField fullWidth label="Address" name="address" value={userData.address} onChange={handleInputChange} disabled={!isEditing} />
                                </Stack>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Stack spacing={2}>
                                    <TextField fullWidth label="Last Name" name="lastName" value={userData.lastName} onChange={handleInputChange} disabled={!isEditing} />
                                    <TextField
                                        fullWidth
                                        label="Date of Birth"
                                        type="date"
                                        name="dateofBirth"
                                        value={userData.dateofBirth}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        error={Boolean(formErrors.dateofBirth)}
                                        helperText={formErrors.dateofBirth}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                    <TextField fullWidth label="Gender" name="gender" value={userData.gender} onChange={handleInputChange} disabled={!isEditing} select sx={{ m: 1, minWidth: 120, '& .MuiSelect-select': { textAlign: 'left' } }}>
                                        <MenuItem value="">Select</MenuItem>
                                        <MenuItem value="male">Male</MenuItem>
                                        <MenuItem value="female">Female</MenuItem>
                                        <MenuItem value="other">Other</MenuItem>
                                    </TextField>
                                </Stack>
                            </Grid>

                            {/* Buttons */}
                            <Grid item xs={12} textAlign="center">
                                <Box sx={{ mt: 2 }}>
                                    <Button variant="contained" onClick={isEditing ? handleSubmit : () => setIsEditing(true)} sx={{ mx: 1 }}>
                                        {isEditing ? 'Save Changes' : 'Edit Profile'}
                                    </Button>
                                    {!isEditing && (
                                        <Button
                                            variant="outlined"
                                            onClick={() => setOpenDeleteDialog(true)} // Open delete confirmation dialog
                                            sx={{
                                                mx: 1,
                                                color: 'white',
                                                borderColor: 'red',
                                                backgroundColor: 'red'
                                            }}
                                        >
                                            Delete Account
                                        </Button>
                                    )}
                                    {isEditing && (
                                        <Button
                                            variant="outlined"
                                            onClick={handleCancel}
                                            sx={{ mx: 1 }}
                                        >
                                            Cancel
                                        </Button>
                                    )}

                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Confirmation Dialog */}
                <Dialog open={openDeleteDialog} onClose={handleCancelDelete}>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogContent>
                        <Typography variant="body1">
                            Are you sure you want to delete your account? This action cannot be undone.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCancelDelete} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleDeleteAccount} color="secondary">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>

                <Snackbar open={showSnackbar} autoHideDuration={6000} onClose={() => setShowSnackbar(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                    <Alert onClose={() => setShowSnackbar(false)} severity="success" sx={{ width: '100%' }}>
                        Profile updated successfully!
                    </Alert>
                </Snackbar>
            </Container>
        </div>
    );
};

export default Profiledetails;
