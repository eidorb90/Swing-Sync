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
  const [statsData, setStatsData] = useState(defaultStatsData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const user_id = localStorage.getItem('userId');
        const response = await fetch(`http://localhost:8000/api/player/${user_id}/stats`);
        
        if (response.ok) {
          const fetchedData = await response.json();
          
// Transform the data into the format expected by RadarChart
        const formattedData = [
          {
            product: 'Putting',
            // For putting, lower is better, so invert on a 0-100 scale
            'Current Skills': Math.max(0, 100 - (fetchedData.avg_putts_per_round || 0) * 5),
            'Target Skills': Math.max(0, 100 - (fetchedData.avg_putts_per_round || 0) * 5) + 40, // Target of ~1.5 putts per hole
          },
          {
            product: 'Scoring',
            // For scoring, lower is better, so invert on a 0-100 scale
            'Current Skills': Math.max(0, 100 - ((fetchedData.avg_score_per_round || 72) - 65)),
            'Target Skills': Math.max(0, 100 - ((fetchedData.avg_score_per_round || 72) - 65)) + 40, // Target of ~72 per round
          },
          {
            product: 'Fairways',
            // For fairways, higher percentage is better, already on 0-100 scale
            'Current Skills': fetchedData.fairway_hit_percentage || 0,
            'Target Skills': fetchedData.fairway_hit_percentage + 20, // Professional level target
          },
          {
            product: 'Greens',
            // For GIR, higher percentage is better, already on 0-100 scale
            'Current Skills': fetchedData.gir_percentage || 0,
            'Target Skills': fetchedData.gir_percentage + 20, // Professional level target
          },
          {
            product: 'Penalties',
            // For penalties, lower is better, so invert on a 0-100 scale
            'Current Skills': Math.max(0, 100 - (fetchedData.avg_penalities_per_round || 0) * 20),
            'Target Skills': Math.max(0, 100 - (fetchedData.avg_penalities_per_round || 0) * 20) + 40, // Target of ~0.5 penalties per round
          },
        ];
          
          setStatsData(formattedData);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Keep default data on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: 'none' } }}>
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