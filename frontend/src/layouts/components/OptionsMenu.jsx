import * as React from "react";
import { styled } from "@mui/material/styles";
import Divider, { dividerClasses } from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import MuiMenuItem from "@mui/material/MenuItem";
import { paperClasses } from "@mui/material/Paper";
import { listClasses } from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon, { listItemIconClasses } from "@mui/material/ListItemIcon";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import MenuButton from "./MenuButton";
import { Navigate } from "react-router-dom";

// Styled MenuItem component for custom styling
const MenuItem = styled(MuiMenuItem)({
  margin: "2px 0",
});

export default function OptionsMenu() {
  const [anchorEl, setAnchorEl] = React.useState(null); // State to track the anchor element for the menu
  const open = Boolean(anchorEl); // Boolean to check if the menu is open

  // Handle menu button click to open the menu
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle logout action and clear user data from localStorage
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("firstname");
    localStorage.removeItem("lastname");
    localStorage.removeItem("profilePicture");
    localStorage.removeItem("userId");
    window.location.href = "/signin"; // Redirect to the sign-in page
  };

  // Handle menu close action
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <React.Fragment>
      {/* Menu button to trigger the options menu */}
      <MenuButton
        aria-label="Open menu"
        onClick={handleClick}
        sx={{ borderColor: "transparent" }}
      >
        <MoreVertRoundedIcon />
      </MenuButton>

      {/* Options menu */}
      <Menu
        anchorEl={anchorEl}
        id="menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        sx={{
          [`& .${listClasses.root}`]: {
            padding: "4px", // Adjust padding for the list
          },
          [`& .${paperClasses.root}`]: {
            padding: 0, // Remove padding for the paper
          },
          [`& .${dividerClasses.root}`]: {
            margin: "4px -4px", // Adjust margin for dividers
          },
        }}
      >
        {/* Menu items */}
        <MenuItem onClick={handleClose}>Profile</MenuItem>
        <MenuItem onClick={handleClose}>My account</MenuItem>
        <Divider />
        <MenuItem onClick={handleClose}>Add another account</MenuItem>
        <MenuItem onClick={handleClose}>Settings</MenuItem>
        <Divider />
        {/* Logout menu item with custom styling */}
        <MenuItem
          onClick={handleLogout}
          component="button"
          sx={{
            [`& .${listItemIconClasses.root}`]: {
              ml: "auto", // Align icon to the right
              minWidth: 0, // Remove minimum width for the icon
            },
          }}
        >
          <ListItemText>Logout</ListItemText>
          <ListItemIcon>
            <LogoutRoundedIcon fontSize="small" />
          </ListItemIcon>
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}
