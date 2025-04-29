import { useState, useEffect } from "react";
import React from "react";

import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip,
} from 'recharts';

// Sample data - keeping for reference
const sampleData = [
  { subject: 'Math', A: 120, B: 110, fullMark: 150 },
  { subject: 'Science', A: 98, B: 130, fullMark: 150 },
  { subject: 'English', A: 86, B: 130, fullMark: 150 },
  { subject: 'History', A: 99, B: 100, fullMark: 150 },
  { subject: 'Art', A: 85, B: 90, fullMark: 150 },
  { subject: 'PE', A: 65, B: 85, fullMark: 150 },
];

// Default data for the radar chart
const defaultStatsData = [
  {
    product: 'Putting',
    'Current Skills': 50,
    'Target Skills': 75,
  },
  {
    product: 'Scoring',
    'Current Skills': 45,
    'Target Skills': 80,
  },
  {
    product: 'Fairways',
    'Current Skills': 40,
    'Target Skills': 75,
  },
  {
    product: 'Greens',
    'Current Skills': 35,
    'Target Skills': 70,
  },
  {
    product: 'Penalties',
    'Current Skills': 60,
    'Target Skills': 90,
  },
];

const RadarChartComponent = () => {
  const [statsData, setStatsData] = useState(defaultStatsData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const user_id = localStorage.getItem('userId') || '1';
        const response = await fetch(`http://localhost:8000/api/player/${user_id}/stats`);
        
        if (response.ok) {
          const fetchedData = await response.json(); 
          
          // Transform the data into the format expected by RadarChart
          const formattedData = [
            {
              product: 'Putting',
              'Current Skills': Math.max(0, 100 - (fetchedData.avg_putts_per_round || 0) * 5),
              'Target Skills': Math.max(0, 100 - (fetchedData.avg_putts_per_round || 0) * 5) + 40,
            },
            {
              product: 'Scoring',
              'Current Skills': Math.max(0, 100 - ((fetchedData.avg_score_per_round || 72) - 65)),
              'Target Skills': Math.max(0, 100 - ((fetchedData.avg_score_per_round || 72) - 65)) + 40,
            },
            {
              product: 'Fairways',
              'Current Skills': fetchedData.fairway_hit_percentage || 0,
              'Target Skills': fetchedData.fairway_hit_percentage + 20,
            },
            {
              product: 'Greens',
              'Current Skills': fetchedData.gir_percentage || 0,
              'Target Skills': fetchedData.gir_percentage + 20,
            },
            {
              product: 'Penalties',
              'Current Skills': Math.max(0, 100 - (fetchedData.avg_penalities_per_round || 0) * 20),
              'Target Skills': Math.max(0, 100 - (fetchedData.avg_penalities_per_round || 0) * 20) + 40,
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
    <RadarChart
      cx={200}
      cy={200}
      outerRadius={100}
      width={600}
      height={500}
      data={statsData}
    >
      <PolarGrid />
      <PolarAngleAxis dataKey="product" />
      <PolarRadiusAxis />
      <Tooltip />
      <Radar
        name="Current Skills"
        dataKey="Current Skills"
        stroke="#8884d8"
        fill="#8884d8"
        fillOpacity={0.6}
      />
      <Radar
        name="Target Skills"
        dataKey="Target Skills"
        stroke="#82ca9d"
        fill="#82ca9d"
        fillOpacity={0.6}
      />
    </RadarChart>
  );
};

export default RadarChartComponent;