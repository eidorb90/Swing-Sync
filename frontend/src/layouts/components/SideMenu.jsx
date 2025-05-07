import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import MenuContent from "./MenuContent";
import OptionsMenu from "./OptionsMenu";

const drawerWidth = 275;

// Styled Drawer component with custom width and styles
const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: "border-box",
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: "border-box",
  },
});

export default function SideMenu() {
  // Retrieve user information from localStorage
  const Lastname = localStorage.getItem("lastname");
  const Firstname = localStorage.getItem("firstname");
  const Email = localStorage.getItem("email");

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: "none", md: "block" }, // Hide drawer on small screens
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: "background.paper", // Set background color
        },
      }}
    >
      <Divider />
      <Box
        sx={{
          overflow: "auto", // Enable scrolling if content overflows
          height: "100%",
          display: "flex",
          flexDirection: "column", // Stack children vertically
        }}
      >
        <MenuContent /> {/* Main menu content */}
      </Box>
      <Stack
        direction="row"
        sx={{
          p: 2, // Padding
          gap: 1, // Gap between items
          alignItems: "center", // Align items vertically
          borderTop: "1px solid", // Top border
          borderColor: "divider", // Use theme divider color
        }}
      >
        <Avatar
          sizes="small"
          alt={`${Firstname} ${Lastname}`} // Alt text for accessibility
          src="/static/images/avatar/7.jpg" // Placeholder avatar image
          sx={{ width: 36, height: 36 }} // Avatar size
        />
        <Box sx={{ mr: "auto" }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, lineHeight: "16px" }} // User's name styling
          >
            {`${Firstname} ${Lastname}`}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {`${Email}`} {/* User's email */}
          </Typography>
        </Box>
        <OptionsMenu /> {/* Options menu for additional actions */}
      </Stack>
    </Drawer>
  );
}
