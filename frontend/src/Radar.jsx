import React from 'react';
import {

// Radar.jsx
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip,
} from 'recharts';

const data = [
  { subject: 'Math', A: 120, B: 110, fullMark: 150 },
  { subject: 'Science', A: 98, B: 130, fullMark: 150 },
  { subject: 'English', A: 86, B: 130, fullMark: 150 },
  { subject: 'History', A: 99, B: 100, fullMark: 150 },
  { subject: 'Art', A: 85, B: 90, fullMark: 150 },
  { subject: 'PE', A: 65, B: 85, fullMark: 150 },
];

const RadarChartComponent = () => {
  return (
    <RadarChart
      cx={300}
      cy={250}
      outerRadius={150}
      width={600}
      height={500}
      data={data}
    >
      <PolarGrid />
      <PolarAngleAxis dataKey="subject" />
      <PolarRadiusAxis />
      <Tooltip />
      <Radar
        name="Student A"
        dataKey="A"
        stroke="#8884d8"
        fill="#8884d8"
        fillOpacity={0.6}
      />
      <Radar
        name="Student B"
        dataKey="B"
        stroke="#82ca9d"
        fill="#82ca9d"
        fillOpacity={0.6}
      />
    </RadarChart>
  );
};

export default RadarChartComponent;