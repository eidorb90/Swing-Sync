import * as React from 'react';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { LineChart } from '@mui/x-charts/LineChart';

function AreaGradient({ color, id }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.5} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

AreaGradient.propTypes = {
  color: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};

export default function SessionsChart() {
  const theme = useTheme();
  
  const defaultHoles = Array.from({ length: 18 }, (_, i) => `Hole ${i + 1}`);
  const defaultData = Array(18).fill(4); // Par 4 as default
  
  const colorPalette = [
    theme.palette.primary.light,
    theme.palette.primary.main,
    theme.palette.error.main,
  ];

  const [chartData, setChartData] = useState({
    strokes: defaultData,
    putts: defaultData.map(() => 2), 
    par: defaultData // Par values
  });
  const [holeLabels, setHoleLabels] = useState(defaultHoles);
  const [isLoading, setIsLoading] = useState(true);
  const [roundInfo, setRoundInfo] = useState({ date: 'Today', totalScore: 72 });
  
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
              // Extract data for each hole
              const strokeData = scores.map(score => score.strokes || 4);
              const puttData = scores.map(score => score.putts || 2);
              const parData = scores.map(score => score.par || 4);
              const penData = scores.map(score => score.pen || 0);
              const holes = scores.map(score => `Hole ${score.hole}`);
              
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
                courseName: mostRecentRound.course || 'Unknown Course'
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

  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Golf Round Performance
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
              {isLoading ? '...' : roundInfo.totalScore}
            </Typography>
            <Chip size="small" color="success" label={roundInfo.date} />
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {roundInfo.courseName}
          </Typography>
        </Stack>
        <LineChart
          colors={colorPalette}
          xAxis={[
            {
              scaleType: 'point',
              data: holeLabels,
              tickInterval: (index, i) => (i + 1) % 3 === 0, // Show every 3rd hole number
            },
          ]}
          series={[
            {
              id: 'strokes',
              label: 'Strokes',
              showMark: true,
              curve: 'linear',
              area: false,
              data: chartData.strokes,
            },
            {
              id: 'putts',
              label: 'Putts',
              showMark: true,
              curve: 'linear',
              area: false,
              data: chartData.putts,
            },
            {
              id: 'par',
              label: 'Par',
              showMark: false,
              curve: 'linear',
              area: false,
              data: chartData.par,
            },
          ]}
          height={250}
          margin={{ left: 50, right: 20, top: 20, bottom: 20 }}
          grid={{ horizontal: true }}
          slotProps={{
            legend: {
              hidden: false, // Show legend to identify the different lines
            },
          }}
        />
      </CardContent>
    </Card>
  );
}