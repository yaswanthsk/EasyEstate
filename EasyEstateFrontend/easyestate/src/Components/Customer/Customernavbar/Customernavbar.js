import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Avatar } from "@mui/material";
import Logout from "@mui/icons-material/Logout";
import Divider from "@mui/material/Divider";
import axios from "../../axios";
import Logoutmodal from "./Logoutmodel";

import lightlogo from '../../.././Assets/Images/easyestatelogo.png'
import darklogo from '../../.././Assets/Images/easyestatelogoblack.png'

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
} from "@mui/material";
import { styled } from "@mui/system";
import {
  FaBars,
  FaHome,
  FaInfoCircle,
  FaBuilding,
  FaUser,
  FaClipboardList,
  FaChevronDown,
  FaChevronUp,
  FaMoon,
  FaSun,
  FaHeart,
} from "react-icons/fa";

const StyledAppBar = styled(AppBar)(({ theme, isDarkMode }) => ({
  backgroundColor: isDarkMode ? "#1a1a1a" : "#ffffff",
  transition: "background-color 0.3s ease",
}));
const StyledToolbar = styled(Toolbar)({
  display: "flex",
  justifyContent: "space-between",
});

const NavButton = styled(Button)(({ theme, isDarkMode }) => ({
  margin: "0 8px",
  color: isDarkMode ? "#ffffff" : "#333333",
  "&:hover": {
    backgroundColor: isDarkMode
      ? "rgba(255, 255, 255, 0.1)"
      : "rgba(0, 0, 0, 0.1)",
    transform: "translateY(-2px)",
    transition: "all 0.3s ease",
  },
}));

const Customernavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(""); // For 'About'

  const isHomeActive = location.pathname === "/customerlanding";
  const isPropertiesActive = location.pathname === "/Properties";
  const isRequestsActive = location.pathname === "/CustomerSideRequests";

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");


  const handleReview = async () => {
    try {
      let response = await axios.get(`/Review/GetReviewById/${username}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        let hasreviewed = response.data.hasReviewed;
        console.log(hasreviewed);
        if (!hasreviewed) {
          setIsModalOpen(true);
        }
        else {
          handleLogout();
        }
      }
    } catch (error) {
      if (error.response) {
        console.log("Error Response:", error.response);
      } else {
        console.log("Error:", error.message);
      }
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
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

  const handlePropertiesToggle = () => {
    setPropertiesOpen(!propertiesOpen);
  };
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleProfile = () => {
    navigate("/Customerprofiledetails"); // Navigate to ProfileDetails page
  };
  const handleLogout = () => {
    const url = `/Auth/Logout?userToken=${token}`;
    // Handle logout logic
    axios.post(url);
    localStorage.clear();
    navigate('/');
  };
  const handlePropertyClick = () => {
    navigate("/Properties"); // Navigate to the Properties page
  };

  const handleRequestClick = () => {
    navigate("/CustomerSideRequests");
  }

  const handleHeartClick = () => {
    navigate("/customerwishlist")
  }
  const handleHomeClick = () => {
    navigate("/customerlanding"); // Navigate to the Properties page
  };

  // Scroll listener to highlight 'About'
  useEffect(() => {
    const handleScroll = () => {
      const aboutSection = document.getElementById("customer-footer");
      if (aboutSection) {
        const rect = aboutSection.getBoundingClientRect();
        const isVisible = rect.top >= 0 && rect.top <= window.innerHeight;
        setActiveSection(isVisible ? "about" : "");
      }
    };

    if (location.pathname === "/customerlanding") {
      window.addEventListener("scroll", handleScroll);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [location.pathname]);

  const navItems = [
    {
      text: "Home",
      icon: <FaHome />,
      ariaLabel: "Navigate to home page",
      onClick: handleHomeClick,
      isActive: isHomeActive && activeSection !== "about",
    },
    {
      text: "About",
      icon: <FaInfoCircle />,
      ariaLabel: "Learn more about us",
      onClick: () => {
        navigate("/customerlanding"); // Ensure you're on the OwnerHomePage
        setTimeout(() => {
          const section = document.getElementById("customer-footer");
          if (section) {
            section.scrollIntoView({ behavior: "smooth" });
          }
        }, 100); // Slight delay to ensure navigation is complete
      },
      isActive: activeSection === "about",
    },
    {
      text: "Property",
      icon: <FaBuilding />,
      ariaLabel: "View our properties",
      onClick: handlePropertyClick,
      isActive: isPropertiesActive,
    },
    {
      text: "My Request",
      icon: <FaClipboardList />,
      ariaLabel: "View our Request ",
      onClick: handleRequestClick,
      isActive: isRequestsActive,
    },
  ];

  const drawer = (
    <Box
      sx={{
        backgroundColor: isDarkMode ? "#1a1a1a" : "#ffffff",
        color: isDarkMode ? "#ffffff" : "#333333",
        height: "100%",
      }}
      role="navigation"
    >
      <List>
        {navItems.map((item) => (
          <React.Fragment key={item.text}>
            <ListItem
              button
              onClick={() => {
                item.onClick(); // Call the page navigation function
                handleDrawerToggle(); // Close the Drawer
              }}
              aria-label={item.ariaLabel}
              sx={{
                backgroundColor: item.isActive
                  ? isDarkMode
                    ? "#333333"
                    : "#e0e0e0"
                  : "transparent",
                color: item.isActive
                  ? isDarkMode
                    ? "#ffffff"
                    : "#000000"
                  : "inherit",
              }}
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
    </Box>
  );

  return (
    <>
      <Logoutmodal
        open={isModalOpen}
        handleClose={() => setIsModalOpen(false)}
      />
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
              src={isDarkMode ? darklogo : lightlogo}
              alt="Logo"
              style={{ height: "75px", width: "200px" }}
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
                    backgroundColor: item.isActive
                      ? isDarkMode
                        ? "#333333"
                        : "#e0e0e0"
                      : "transparent",
                    color: item.isActive
                      ? isDarkMode
                        ? "#ffffff"
                        : "#000000"
                      : isDarkMode
                        ? "#ffffff"
                        : "#333333",
                  }}
                >
                  {item.text}
                </NavButton>
              ))}
            </Box>
          )}

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Tooltip title="Navigate to Favorites">
              <IconButton
                sx={{ color: isDarkMode ? "#ffffff" : "#333333" }}
                onClick={handleHeartClick} // Navigate when heart is clicked
              >
                <FaHeart style={{ color: "red", fontSize: "20px" }} />
              </IconButton>
            </Tooltip>

            {/* <Tooltip
              title={
                isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
              }
            >
              <Switch
                checked={isDarkMode}
                onChange={handleThemeToggle}
                icon={<FaSun />}
                checkedIcon={<FaMoon />}
                aria-label="theme toggle"
              />
            </Tooltip> */}

            <Tooltip title="Account settings">
              <IconButton
                onClick={(e) => setMenuAnchorEl(e.currentTarget)}
                size="small"
                aria-label="user account"
                sx={{ ml: 2, color: isDarkMode ? "#ffffff" : "#333333" }}
              >
                <FaUser />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={() => setMenuAnchorEl(null)}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem onClick={handleProfile}>
                <Avatar sx={{ width: 24, height: 24, mr: 1.5 }} /> Profile
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleReview}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </StyledToolbar>
      </StyledAppBar>

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
    </>
  );
};

export default Customernavbar;