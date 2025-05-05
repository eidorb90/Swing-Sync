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
import { Container, Title} from "@mantine/core";
import { Typography } from "@mui/material";
import { Navigate } from "react-router-dom";
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "../layouts/theme/customizations";

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function Dashboard(props) {
  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex" }}>
        <SideMenu />
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
            <MainGrid />
            <Typography >
              Want to add a Round?{" "}
              <Link href="/addrounds" variant="body2" sx={{ alignSelf: "center", color: "primary.main" }}>
                Add Round
              </Link>
            </Typography>
          </Stack>
        </Box>
      </Box>
      <Container size="lg" py="xl"></Container>
    </AppTheme>
  );
}
