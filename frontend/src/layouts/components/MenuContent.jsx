import * as React from "react";
import { useNavigate } from "react-router-dom";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import AddIcon from "@mui/icons-material/Add";
import GolfCourseIcon from "@mui/icons-material/GolfCourse";
import SmartToyIcon from "@mui/icons-material/SmartToy";

const mainListItems = [
  { text: "Home", icon: <HomeRoundedIcon />, route: "/account" },
  { text: "LeaderBoard", icon: <LeaderboardIcon />, route: "/leaderboard" },
  { text: "Players", icon: <PeopleRoundedIcon />, route: "/" },
  { text: "Search Courses", icon: <GolfCourseIcon />, route: "/search" },
  { text: "Woody.Ai Chat", icon: <SmartToyIcon />, route: "/Woody/chat" },
  { text: "Woody.Ai Swing Review", icon: <GolfCourseIcon />, route: "/swing-review" },
  { text: "Add Rounds", icon: <AddIcon />, route: "/addrounds" },
];

const secondaryListItems = [
  { text: "Settings", icon: <SettingsRoundedIcon />, route: "/" },
];

export default function MenuContent() {
  const navigate = useNavigate();

  const handleNavigation = (route) => {
    navigate(route);
  };

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: "space-between" }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: "block" }}>
            <ListItemButton
              onClick={() => handleNavigation(item.route)}
              selected={index === 0}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: "block" }}>
            <ListItemButton onClick={() => handleNavigation(item.route)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
