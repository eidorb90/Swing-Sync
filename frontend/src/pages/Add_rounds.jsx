import * as React from "react";
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Stack from "@mui/material/Stack";
import AppNavbar from "../layouts/components/AppNavbar";
import Header from "../layouts/components/Header";
import GridRound from "../layouts/components/GridRounds";
import SideMenu from "../layouts/components/SideMenu";
import AppTheme from "../layouts/theme/AppTheme";
import { Container, Title } from "@mantine/core";

export default function AddRounds() {
  return (
    <AppTheme>
      {/* Enables consistent styling and color scheme */}
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex" }}>
        {/* Sidebar menu */}
        <SideMenu />
        {/* Top navigation bar */}
        <AppNavbar />

        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1), // Handles background color based on theme
            overflow: "auto", // Ensures content scrolls if it overflows
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: "center", // Centers child components horizontally
              mx: 3, // Horizontal margin
              pb: 5, // Padding at the bottom
              mt: { xs: 8, md: 0 }, // Adjusts top margin based on screen size
            }}
          >
            {/* Page header */}
            <Header />
            {/* Grid component for displaying rounds */}
            <GridRound />
          </Stack>
        </Box>
      </Box>
      {/* Container for additional content or spacing */}
      <Container size="lg" py="xl"></Container>
    </AppTheme>
  );
}
