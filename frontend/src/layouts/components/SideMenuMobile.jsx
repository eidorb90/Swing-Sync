import * as React from "react";
import PropTypes from "prop-types";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Drawer, { drawerClasses } from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import MenuButton from "./MenuButton";
import MenuContent from "./MenuContent";

function SideMenuMobile({ open, toggleDrawer }) {
  // Retrieve user information from localStorage
  const Lastname = localStorage.getItem("lastname");
  const Firstname = localStorage.getItem("firstname");

  return (
    <Drawer
      anchor="right" // Drawer slides in from the right
      open={open} // Controls whether the drawer is open
      onClose={toggleDrawer(false)} // Handles closing the drawer
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1, // Ensures the drawer appears above other elements
        [`& .${drawerClasses.paper}`]: {
          backgroundImage: "none", // Removes any default background image
          backgroundColor: "background.paper", // Sets the background color
        },
      }}
    >
      <Stack
        sx={{
          maxWidth: "70dvw", // Limits the drawer width to 70% of the viewport width
          height: "100%", // Makes the drawer take up the full height
        }}
      >
        {/* Header section with user avatar and notifications */}
        <Stack direction="row" sx={{ p: 2, pb: 0, gap: 1 }}>
          <Stack
            direction="row"
            sx={{ gap: 1, alignItems: "center", flexGrow: 1, p: 1 }}
          >
            <Avatar
              sizes="small"
              alt={`${Firstname} ${Lastname}`} // Displays user's full name as alt text
              src="/static/images/avatar/7.jpg" // Placeholder avatar image
              sx={{ width: 24, height: 24 }} // Small avatar size
            />
            <Typography component="p" variant="h6">
              {`${Firstname} ${Lastname}`} {/* Displays user's full name */}
            </Typography>
          </Stack>
          {/* Notifications button with badge */}
          <MenuButton showBadge>
            <NotificationsRoundedIcon />
          </MenuButton>
        </Stack>
        <Divider /> {/* Divider between header and menu content */}
        
        {/* Main menu content */}
        <Stack sx={{ flexGrow: 1 }}>
          <MenuContent /> {/* Renders the menu items */}
          <Divider /> {/* Divider between menu content and footer */}
        </Stack>

        {/* Footer section with logout button */}
        <Stack sx={{ p: 2 }}>
          <Button
            variant="outlined"
            fullWidth // Makes the button span the full width
            startIcon={<LogoutRoundedIcon />} // Adds a logout icon to the button
          >
            Logout
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}

SideMenuMobile.propTypes = {
  open: PropTypes.bool, // Indicates whether the drawer is open
  toggleDrawer: PropTypes.func.isRequired, // Function to toggle the drawer state
};

export default SideMenuMobile;
