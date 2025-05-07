import * as React from "react";
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Stack from "@mui/material/Stack";
import AppNavbar from "../layouts/components/AppNavbar";
import Header from "../layouts/components/Header";
import SideMenu from "../layouts/components/SideMenu";
import AppTheme from "../layouts/theme/AppTheme";
import Search from "../layouts/components/Search";
import { Container, Title } from "@mantine/core";

export default function SearchBarCourse(props) {
  return (
    // Wrapping the entire component with a custom theme provider
    <AppTheme {...props}>
      {/* Enables consistent color scheme across the app */}
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex" }}>
        {/* Sidebar menu for navigation */}
        <SideMenu />
        {/* Top navigation bar */}
        <AppNavbar />

        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: "auto",
          })}
        >
          {/* Header section */}
          <Stack
            spacing={2}
            sx={{
              alignItems: "center",
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            <Header />
          </Stack>
          {/* Main content area with the search bar */}
          <Stack
            component="main"
            sx={(theme) => ({
              flexGrow: 1,
              backgroundColor: theme.vars
                ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
                : alpha(theme.palette.background.default, 1),
              overflow: "auto",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            })}
          >
            <Search />
          </Stack>
        </Box>
      </Box>
      {/* Container for additional content or spacing */}
      <Container size="lg" py="xl"></Container>
    </AppTheme>
  );
}
