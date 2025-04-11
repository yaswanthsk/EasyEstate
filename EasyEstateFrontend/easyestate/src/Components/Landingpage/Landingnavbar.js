import React, { useState, useEffect } from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Button,
    Menu,
    MenuItem,
    useMediaQuery,
    useTheme,
    Box,
    Drawer,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Collapse,
    Switch,
    Tooltip,
    Dialog,
    DialogContent
} from "@mui/material";
import { styled } from "@mui/system";
import {
    FaBars,
    FaHome,
    FaInfoCircle,
    FaBuilding,
    FaUserPlus,
    FaChevronDown,
    FaChevronUp,
    FaMoon,
    FaSun,
    FaHeart,
    FaSignInAlt,
    FaShieldAlt,
    FaClipboardList,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";

import lightlogo from '../../Assets/Images/easyestatelogo.png'
import darklogo from '../../Assets/Images/easyestatelogoblack.png'


import Registration from "../Auth/Registration/Registration";
import Login from "../Auth/Login/Login/Login";

const StyledAppBar = styled(AppBar)(({ theme, isDarkMode }) => ({
    backgroundColor: isDarkMode ? "#1a1a1a" : "#ffffff",
    transition: "background-color 0.3s ease"
}));

const StyledToolbar = styled(Toolbar)({
    display: "flex",
    justifyContent: "space-between"
});

const NavButton = styled(Button)(({ theme, isDarkMode }) => ({
    margin: "0 8px",
    color: isDarkMode ? "#ffffff" : "#333333",
    "&:hover": {
        backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        transform: "translateY(-2px)",
        transition: "all 0.3s ease"
    }
}));

const Landingnavbar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [propertiesOpen, setPropertiesOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const navigate = useNavigate();

    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [visibleForm, setVisibleForm] = useState("login"); // "login" or "register"

    const handleLoginClick = () => {
        setIsLoginOpen(true);
        setVisibleForm("login");
    };

    const handlePropertiesToggle = () => {
        setPropertiesOpen(!propertiesOpen);
      };

    const handleSignUpClick = () => {
        setIsLoginOpen(true);
        setVisibleForm("register");
    };

    const handleCloseDialog = () => {
        setIsLoginOpen(false);
    };

    const toggleForm = () => {
        setVisibleForm((prevForm) => (prevForm === "login" ? "register" : "login"));
    };


    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleThemeToggle = () => {
        setIsDarkMode(!isDarkMode);
    };

    const handleHeartClick = () => {

    };

    const [activeSection, setActiveSection] = useState("Home");
 
    const handleNavigation = (sectionId, sectionName) => {
        navigate("/"); // Ensure you're on the home page
        setTimeout(() => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.scrollIntoView({ behavior: "smooth" });
                setActiveSection(sectionName); // Update the active section
            }
        }, 100); // Slight delay to ensure navigation is complete
    };
 
    const navItems = [
        {
            text: "Home",
            icon: <FaHome />,
            ariaLabel: "Navigate to home page",
            onClick: () => handleNavigation("initial-navbar", "Home"),
        },
        {
            text: "Services",
            icon: <FaClipboardList />,
            ariaLabel: "Learn more about our services",
            onClick: () => handleNavigation("our-services", "Services"),
        },
        {
            text: "Benefits",
            icon: <FaShieldAlt />,
            ariaLabel: "Learn more about our benefits",
            onClick: () => handleNavigation("our-benefits", "Benefits"),
        },
        {
            text: "About",
            icon: <FaInfoCircle />,
            ariaLabel: "Learn more about us",
            onClick: () => handleNavigation("initial-footer", "About"),
        },
    ];

    const propertySubItems = [
        "Houses & Apartments",
        "Shops & Offices",
        "PGs & GuestHouses",
        "Lands & Plots"
    ];

    const drawer = (
        <Box
            sx={{
                backgroundColor: isDarkMode ? "#1a1a1a" : "#ffffff",
                color: isDarkMode ? "#ffffff" : "#333333",
                height: "100%",
                display: 'flex',
                flexDirection: 'column',
            }}
            role="navigation"
        >
            <List>
                {navItems.map((item) => (
                    <React.Fragment key={item.text}>
                        <ListItem
                            button
                            onClick={() => {
                                item.onClick(); // Call the respective handler
                                handleDrawerToggle(); // Close the drawer after navigation
                            }}
                            aria-label={item.ariaLabel}
                        >
                            <ListItemIcon sx={{ color: isDarkMode ? "#ffffff" : "#333333" }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                            {item.hasSubmenu && (
                                <Box>
                                    {propertiesOpen ? <FaChevronUp /> : <FaChevronDown />}
                                </Box>
                            )}
                        </ListItem>
                        {item.hasSubmenu && (
                            <Collapse in={propertiesOpen} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding></List>
                            </Collapse>
                        )}
                    </React.Fragment>
                ))}
            </List>
       
            {/* Add the login and signup buttons inside the drawer for mobile view */}
            {isMobile && (
                <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: 'auto', gap: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<FaUserPlus />}
                        sx={{
                            backgroundColor: "#28A745",
                            color: "#ffffff",
                            fontSize: "0.875rem",  // Decrease font size
                            padding: "6px 12px",  // Decrease padding
                            minWidth: "120px",  // Decrease minimum width
                            "&:hover": {
                                backgroundColor: "#218838",
                            },
                        }}
                        onClick={handleSignUpClick}
                        aria-label="Sign up"
                    >
                        SignUp
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<FaSignInAlt />}
                        sx={{
                            backgroundColor: "#28A745",
                            color: "#ffffff",
                            fontSize: "0.875rem",  // Decrease font size
                            padding: "6px 12px",  // Decrease padding
                            minWidth: "120px",  // Decrease minimum width
                            "&:hover": {
                                backgroundColor: "#218838",
                            },
                        }}
                        onClick={handleLoginClick}
                        aria-label="Login"
                    >
                        Login
                    </Button>
                </Box>
            )}
        </Box>
    );

    return (
        <>
            <StyledAppBar position="sticky" isDarkMode={isDarkMode}>
                <StyledToolbar>
                    {isMobile ? (
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ color: isDarkMode ? "#ffffff" : "#333333" }}
                        >
                            <FaBars />
                        </IconButton>
                    ) : null}
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ color: isDarkMode ? "#ffffff" : "#333333" }}
                    >
                        <img
                            src={isDarkMode ? "/easyestatelogoblack.png" : "/easyestatelogo.png"}
                            alt="Logo"
                            style={{
                                height: "70px",
                                width: '200px',
                                marginRight: "20px" // Space between logo and text
                            }}
                        />
                    </Typography>
 
                    {!isMobile && (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            {navItems.map((item) => (
                                <NavButton
                                    key={item.text}
                                    startIcon={item.icon}
                                    aria-label={item.ariaLabel}
                                    isDarkMode={isDarkMode}
                                    onClick={item.onClick}
                                    sx={{
                                        backgroundColor: activeSection === item.text
                                            ? isDarkMode
                                                ? "#333333"
                                                : "#e0e0e0"
                                            : "transparent",
                                        color: activeSection === item.text
                                            ? isDarkMode
                                                ? "#ffffff"
                                                : "#000000"
                                            : isDarkMode
                                                ? "#ffffff"
                                                : "#333333",
                                        "&:hover": {
                                            backgroundColor: activeSection === item.text
                                                ? isDarkMode
                                                    ? "#333333"
                                                    : "#e0e0e0"
                                                : isDarkMode
                                                    ? "rgba(255, 255, 255, 0.1)"
                                                    : "rgba(0, 0, 0, 0.1)",
                                        },
                                    }}
                                >
                                    {item.component || item.text}
                                </NavButton>
                            ))}
                        </Box>
                    )}
 
                    {!isMobile && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            <Button
                                variant="contained"
                                startIcon={<FaUserPlus />}
                                sx={{
                                    backgroundColor: "#28A745",
                                    color: "#ffffff",
                                    "&:hover": {
                                        backgroundColor: "#218838",
                                    },
                                }}
                                onClick={handleSignUpClick} // Replace with navigation logic
                                aria-label="Sign up"
                            >
                                SignUp
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<FaSignInAlt />}
                                sx={{
                                    backgroundColor: "#28A745",
                                    color: "#ffffff",
                                    "&:hover": {
                                        backgroundColor: "#218838",
                                    },
                                }}
                                onClick={handleLoginClick} // Replace with navigation logic
                                aria-label="Login"
                            >
                                Login
                            </Button>
                        </Box>
                    )}
 
                    {/* <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <IconButton
                            aria-label="user account"
                            sx={{ color: isDarkMode ? "#ffffff" : "#333333" }}
                        >
                        </IconButton>
                    </Box> */}
                </StyledToolbar>
            </StyledAppBar >
 
            <Box component="nav">
                <Drawer
                    variant="temporary"
                    anchor="left"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{ display: { xs: "block", md: "none" } }}
                >
                    {drawer}
                </Drawer>
            </Box>
 
            <Dialog className="loginDialogContainer"  // Keep the class if you need it for other styles
                sx={{
                    margin: '0px',
                    width: '80vw',
                    borderRadius: '25px', // Correct syntax for borderRadius
                    '& .MuiPaper-root': { // Target the Paper component's root
                        maxWidth: '80vw',
                        marginLeft: '23vw',
                        borderRadius: '30px'
                        // added to deal with potential width conflicts
                    },
                }}
                aria-labelledby="login-modal-title"
                slotProps={{
                    backdrop: {
                        style: {
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        },
                    },
                }}
                open={isLoginOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth
            >
                <DialogContent class="loginDialogContent" style={{ margin: '0px', overflow: 'hidden', position: 'relative' }}>
                    <IconButton onClick={handleCloseDialog} style={{ position: 'absolute', top: 10, right: 10 }}>
                        <CloseIcon />
                    </IconButton>
 
                    {visibleForm === "login" ? (
                        <Login handleSwitchToRegister={toggleForm} />
                    ) : (
                        <Registration handleSwitchToLogin={toggleForm} />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Landingnavbar;