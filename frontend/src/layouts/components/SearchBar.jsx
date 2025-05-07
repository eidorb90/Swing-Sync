import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";

// Styled component for the search container
const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15), // Semi-transparent background
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25), // Darker background on hover
  },
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(1),
    width: "auto", // Adjust width for larger screens
  },
}));

// Styled component for the search icon wrapper
const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute", // Position the icon inside the search bar
  pointerEvents: "none", // Make the icon non-interactive
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

// Styled component for the input field
const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit", // Inherit text color
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0), // Padding for the input field
    paddingLeft: `calc(1em + ${theme.spacing(4)})`, // Add space for the search icon
    transition: theme.transitions.create("width"), // Smooth width transition
    [theme.breakpoints.up("sm")]: {
      width: "12ch", // Default width
      "&:focus": {
        width: "20ch", // Expanded width on focus
      },
    },
  },
}));

// Main functional component for the search bar
export default function SearchAppBar() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          {/* Menu button */}
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          {/* Search bar */}
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…" // Placeholder text
              inputProps={{ "aria-label": "search" }} // Accessibility label
            />
          </Search>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
