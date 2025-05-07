/**
 * Dashboard component that serves as the main layout for the account page.
 * It wraps the application in a custom theme provider and includes various UI components
 * such as a sidebar, navigation bar, header, and main content grid.
 * @description
 * - Uses Material-UI components for styling and layout.
 * - Integrates Mantine components for additional UI elements.
 * - Applies custom theme configurations for various components.
 * - Displays a header, main content area, and a link to add rounds.
 * - Ensures responsive design and consistent styling across different screen sizes.
 */
import * as React from "react";
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import CssBaseline from "@mui/material/CssBaseline";
import Stack from "@mui/material/Stack";
import AppNavbar from "../layouts/components/AppNavbar"; 
import Header from "../layouts/components/Header"; 
import MainGrid from "../layouts/components/MainGrid"; 
import SideMenu from "../layouts/components/SideMenu";
import AppTheme from "../layouts/theme/AppTheme"; 
import { Container, Title } from "@mantine/core"; 
import { Typography } from "@mui/material"; 
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "../layouts/theme/customizations"; // Theme customizations for various components

// Combine all theme customizations into a single object
const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function Dashboard(props) {
  return (
    // Wrap the application in a theme provider with customizations
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme /> {/* Normalize styles and enable color scheme */}
      <Box sx={{ display: "flex" }}> {/* Main container with flex layout */}
        <SideMenu /> {/* Sidebar menu */}
        <AppNavbar /> {/* Top navigation bar */}

        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1, // Allow main content to grow and fill available space
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)` // Use theme variables if available
              : alpha(theme.palette.background.default, 1), // Fallback for older themes
            overflow: "auto", // Enable scrolling for overflowing content
          })}
        >
          <Stack
            spacing={2} // Space between child elements
            sx={{
              alignItems: "center", // Center align items
              mx: 3, // Horizontal margin
              pb: 5, // Padding bottom
              mt: { xs: 8, md: 0 }, // Conditional margin top for different screen sizes
            }}
          >
            <Header /> {/* Page header */}
            <MainGrid /> {/* Main content grid */}
            <Typography>
              Want to add a Round?{" "}
              <Link
                href="/addrounds" // Link to add rounds page
                variant="body2"
                sx={{ alignSelf: "center", color: "primary.main" }} // Styling for the link
              >
                Add Round
              </Link>
            </Typography>
          </Stack>
        </Box>
      </Box>
      <Container size="lg" py="xl"></Container> {/* Empty container for spacing */}
    </AppTheme>
  );
}
