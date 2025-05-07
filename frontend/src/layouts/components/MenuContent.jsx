import * as React from "react";
import { useNavigate } from "react-router-dom";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import AddIcon from "@mui/icons-material/Add";
import GolfCourseIcon from "@mui/icons-material/GolfCourse";
import SmartToyIcon from "@mui/icons-material/SmartToy";

// Define the main menu items with their respective icons and routes
const mainListItems = [
  { text: "Home", icon: <HomeRoundedIcon />, route: "/account" },
  { text: "LeaderBoard", icon: <LeaderboardIcon />, route: "/leaderboard" },
  { text: "Search Courses", icon: <GolfCourseIcon />, route: "/search" },
  { text: "Woody.Ai Chat", icon: <SmartToyIcon />, route: "/Woody-chat" },
  {
    text: "Woody.Ai Swing Review",
    icon: <GolfCourseIcon />,
    route: "/swing-review",
  },
  { text: "Add Rounds", icon: <AddIcon />, route: "/addrounds" },
];

// Define the secondary menu items (e.g., settings)
const secondaryListItems = [
  { text: "Settings", icon: <SettingsRoundedIcon />, route: "/" },
];

export default function MenuContent() {
  const navigate = useNavigate();

  // Function to check if the current route matches the given route
  const selected = (route) => {
    const currentPath = window.location.pathname;
    return currentPath === route;
  };

  // Function to handle navigation to a specific route
  const handleNavigation = (route) => {
    navigate(route);
  };

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: "space-between" }}>
      {/* Render the main menu items */}
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem
            key={index}
            disablePadding
            sx={{ padding: 0.3, display: "block" }}
          >
            <ListItemButton
              onClick={() => handleNavigation(item.route)}
              selected={selected(item.route)} // Highlight the selected item
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Render the secondary menu items */}
      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: "block" }}>
            <ListItemButton
              onClick={() => null} // Placeholder for navigation
              selected={selected(item.route)} // Highlight the selected item
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
