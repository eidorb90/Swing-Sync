import * as React from 'react';

// Material UI core
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Stack from '@mui/material/Stack';

// Local components
import AppNavbar from '../layouts/components/AppNavbar';
import Header from '../layouts/components/Header';
import MainGrid from '../layouts/components/MainGrid';
import SideMenu from '../layouts/components/SideMenu';
import AppTheme from '../layouts/theme/AppTheme';

import { RadarChart } from '@mantine/charts';
import { Container, Title } from '@mantine/core';
import { data } from '../data';


// Theme customizations
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from '../layouts/theme/customizations';

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
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <AppNavbar />
        {/* Main content */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: 'auto',
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: 'center',
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            <Header />
            <MainGrid />
          </Stack>
        </Box>
      </Box>
          <Container size="lg" py="xl">
            <Title order={1} mb="lg">Golf Performance Analytics</Title>
            <RadarChart
              h={400}
              data={data}
              dataKey="product"
              series={[
                { name: 'Current Skills', color: 'blue.6' },
                { name: 'Target Skills', color: 'teal.6' },
              ]}
              withPolarGrid
              withPolarAngleAxis
              withPolarRadiusAxis
            />
          </Container>
    </AppTheme>
    
  );
}x