import { useState, useEffect } from "react";
import React from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend } from "recharts";
import { Box, Card, CardContent, Typography } from "@mui/material";

const defaultStatsData = [
  { product: "Putting", "Current Skills": 50, "Target Skills": 75 },
  { product: "Scoring", "Current Skills": 45, "Target Skills": 80 },
  { product: "Fairways", "Current Skills": 40, "Target Skills": 75 },
  { product: "Greens", "Current Skills": 35, "Target Skills": 70 },
  { product: "Penalties", "Current Skills": 60, "Target Skills": 90 },
];

const RadarChartComponent = () => {
  const [statsData, setStatsData] = useState(defaultStatsData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const user_id = localStorage.getItem("userId") || "1";
        const response = await fetch(`http://localhost:8000/api/player/${user_id}/stats`, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });

        if (response.ok) {
          const fetchedData = await response.json();
          const formattedData = [
            {
              product: "Putting",
              "Current Skills": Math.max(0, 100 - (fetchedData.avg_putts_per_round || 0) * 5),
              "Target Skills": Math.max(0, 100 - (fetchedData.avg_putts_per_round || 0) * 5) + 40,
            },
            {
              product: "Scoring",
              "Current Skills": Math.max(0, 100 - ((fetchedData.avg_score_per_round || 72) - 65)),
              "Target Skills": Math.max(0, 100 - ((fetchedData.avg_score_per_round || 72) - 65)) + 40,
            },
            {
              product: "Fairways",
              "Current Skills": fetchedData.fairway_hit_percentage || 0,
              "Target Skills": fetchedData.fairway_hit_percentage + 20,
            },
            {
              product: "Greens",
              "Current Skills": fetchedData.gir_percentage || 0,
              "Target Skills": fetchedData.gir_percentage + 20,
            },
            {
              product: "Penalties",
              "Current Skills": Math.max(0, 100 - (fetchedData.avg_penalities_per_round || 0) * 20),
              "Target Skills": Math.max(0, 100 - (fetchedData.avg_penalities_per_round || 0) * 20) + 40,
            },
          ];

          setStatsData(formattedData);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
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
          Player Skill Progression
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <RadarChart cx={200} cy={180} outerRadius={140} width={500} height={340} data={statsData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="product" />
            <PolarRadiusAxis />
            <Tooltip />
            <Legend />
            <Radar name="Current Skills" dataKey="Current Skills" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            <Radar name="Target Skills" dataKey="Target Skills" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
          </RadarChart>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RadarChartComponent;