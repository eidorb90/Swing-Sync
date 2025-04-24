import * as React from 'react';
import { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTheme } from '@mui/material/styles';

export default function PageViewsBarChart() {
  const theme = useTheme();

  const defaultHoles = Array.from({ length: 9 }, (_, i) => `Hole ${i + 1}`);
  const defaultData = Array(9).fill(4); // Par 4 as default
  
  const colorPalette = [
    (theme.vars || theme).palette.error.main,
    (theme.vars || theme).palette.primary.main,
    (theme.vars || theme).palette.primary.light,
  ];

  const [chartData, setChartData] = useState({
    strokes: defaultData.map(() => 0), // Default strokes
    putts: defaultData.map(() => 0), 
    par: defaultData.map(() => 0), // Par values
    pen: defaultData.map(() => 0) // Adding penalties with default 0
  });

  // Add holeLabels state
  const [holeLabels, setHoleLabels] = useState(defaultHoles);
  const [isLoading, setIsLoading] = useState(true);
  const [roundInfo, setRoundInfo] = useState({ date: 'Today', totalScore: 0 });
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const user_id = localStorage.getItem('userId') || '1';
        const response = await fetch(`http://localhost:8000/api/player/${user_id}/stats`);
        
        if (response.ok) {
          const fetchedData = await response.json();
          
          // Extract scores from the fetched data
          const scores_list = fetchedData.scores_list || [];
          
          if (scores_list.length > 0) {
            // Get the most recent round
            const mostRecentRound = scores_list[0]; 
            const scores = mostRecentRound.scores || [];
            
            if (scores.length > 0) {
              // Limit to front 9 holes
              const frontNineScores = scores.slice(0, 9);
              
              // Extract data for each hole
              const strokeData = frontNineScores.map(score => score.strokes || 0);
              const puttData = frontNineScores.map(score => score.putts || 0);
              const parData = frontNineScores.map(score => score.par || 0);
              const penData = frontNineScores.map(score => score.penalties || 0);
              const holes = frontNineScores.map(score => `Hole ${score.hole}`);
              
              // Calculate total score
              const totalScore = strokeData.reduce((sum, val) => sum + val, 0);
              
              // Update the chart data
              setChartData({
                strokes: strokeData,
                putts: puttData,
                par: parData, 
                pen: penData
              });
              
              // Update hole labels
              setHoleLabels(holes);
              
              // Update round info
              setRoundInfo({
                date: mostRecentRound.date || 'Recent Round',
                totalScore: totalScore,
                note: mostRecentRound.note || 'No notes available'
              });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Calculate other strokes for the stacked bar chart
  const calculateOtherStrokes = () => {
    return chartData.strokes.map((stroke, i) => {
      const putt = chartData.putts[i] || 0;
      const pen = chartData.pen[i] || 0;
      return Math.max(0, stroke - putt - pen);
    });
  };

  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Last 9 holes
        </Typography>
        <Stack sx={{ justifyContent: 'space-between' }}>
          <Stack
            direction="row"
            sx={{
              alignContent: { xs: 'center', sm: 'flex-start' },
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography variant="h4" component="p">
              {roundInfo.totalScore}
            </Typography>
            <Chip size="small" color="main" label={roundInfo.date} />
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {roundInfo.note }
          </Typography>
        </Stack>
        <BarChart
          borderRadius={8}
          colors={colorPalette}
          xAxis={[
            {
              scaleType: 'band',
              categoryGapRatio: 0.5,
              data: ['Hole 1', 'Hole 2', 'Hole 3', 'Hole 4', 'Hole 5', 'Hole 6', 'Hole 7', 'Hole 8', 'Hole 9'],
            },
          ]}
          series={[
            {
              id: 'penalties',
              label: 'Penalties',
              data: chartData.pen,
              stack: 'A',
            },
            {
              id: 'putts',
              label: 'Putts',
              data: chartData.putts,
              stack: 'A',
            },
            {
              id: 'other-strokes',
              label: 'Other Strokes',
              data: calculateOtherStrokes(),
              stack: 'A',
            },
          ]}
          height={250}
          margin={{ left: 50, right: 0, top: 20, bottom: 20 }}
          grid={{ horizontal: true }}
          slotProps={{
            legend: {
              hidden: true,
            },
          }}
        />
      </CardContent>
    </Card>
  );
}