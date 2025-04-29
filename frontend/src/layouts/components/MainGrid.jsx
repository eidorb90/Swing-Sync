import * as React from 'react';

import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ChartUserByCountry from './ChartUserByCountry';

import CustomizedDataGrid from './CustomizedDataGrid';
import PageViewsBarChart from './MostRecentRoundBarChart';
import MostRecentRoundChart from './MostRecentRoundChart';
import SessionsChart from "./RoundDataChart";
import { DataGrid } from '@mui/x-data-grid';
import RadarChartComponent from '../../components/Radar';

import { RadarChart } from '@mantine/charts';
import { Container, Title } from '@mantine/core';
import { computeOffsetLeft } from '@mui/x-data-grid/hooks/features/virtualization/useGridVirtualScroller';



export default function MainGrid() {

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Overview
      </Typography>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        
        <Grid size={{ xs: 12, md: 6 }}>
          <MostRecentRoundChart />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <PageViewsBarChart />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SessionsChart />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Title order={1} mb="lg">Skill Tree</Title>
          <RadarChartComponent/>

           
        </Grid>

      </Grid>
      <Grid container spacing={2} columns={12}>
      <Grid size={{ xs: 12, lg: 3 }}>
          <Stack gap={2} direction={{ xs: 'column', sm: 'row', lg: 'column' }}>
            <ChartUserByCountry />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, lg: 9 }}>
        <Typography component="h2" variant="h6" sx={{ mb:2 }}>
        Leaderboard
      </Typography>
          <CustomizedDataGrid />
        </Grid>

      </Grid>
    </Box>
  );
}