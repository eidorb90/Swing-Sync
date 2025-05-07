import * as React from "react";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Breadcrumbs, { breadcrumbsClasses } from "@mui/material/Breadcrumbs";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";
import { useLocation, Link } from "react-router-dom";

// StyledBreadcrumbs is a custom-styled version of the MUI Breadcrumbs component
const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  margin: theme.spacing(1, 0), // Adds vertical margin
  [`& .${breadcrumbsClasses.separator}`]: {
    color: (theme.vars || theme).palette.action.disabled, // Sets the color of the separator
    margin: 1, // Adds margin around the separator
  },
  [`& .${breadcrumbsClasses.ol}`]: {
    alignItems: "center", // Aligns breadcrumb items vertically
    maxwidth: "none", // Prevents truncation of breadcrumb items
  },
}));

export default function NavbarBreadcrumbs() {
  const location = useLocation(); // React Router hook to get the current location
  const pathnames = location.pathname.split("/").filter((x) => x); // Splits the pathname into segments and removes empty strings

  return (
    <StyledBreadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextRoundedIcon fontSize="small" />} // Custom separator icon
    >
      {/* Root breadcrumb link */}
      <Typography
        variant="body1"
        component={Link}
        to="/"
        sx={{ textDecoration: "none", color: "inherit" }} // Removes underline and inherits color
      >
        Swing Sync
      </Typography>
      {/* Dynamically generates breadcrumb links for each path segment */}
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join("/")}`; // Constructs the path for the current breadcrumb
        const isLast = index === pathnames.length - 1; // Checks if this is the last breadcrumb

        return isLast ? (
          // If it's the last breadcrumb, render it as plain text
          <Typography
            key={to}
            variant="body1"
            sx={{ color: "text.primary", fontWeight: 600 }} // Highlights the last breadcrumb
          >
            {value.charAt(0).toUpperCase() + value.slice(1)} {/* Capitalizes the first letter */}
          </Typography>
        ) : (
          // Otherwise, render it as a link
          <Typography
            key={to}
            component={Link}
            to={to}
            variant="body1"
            sx={{ textDecoration: "none", color: "inherit" }} // Removes underline and inherits color
          >
            {value.charAt(0).toUpperCase() + value.slice(1)} {/* Capitalizes the first letter */}
          </Typography>
        );
      })}
    </StyledBreadcrumbs>
  );
}
