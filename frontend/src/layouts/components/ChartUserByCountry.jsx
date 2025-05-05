import * as React from "react";
import { useState, useEffect } from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import { useDrawingArea } from "@mui/x-charts/hooks";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";

const StyledText = styled("text")(({ theme }) => ({
  textAnchor: "middle",
  dominantBaseline: "central",
  fill: theme.palette.text.secondary,
  fontSize: theme.typography.body2.fontSize,
  fontWeight: theme.typography.body2.fontWeight,
}));

function PieCenterLabel({ primaryText, secondaryText }) {
  const { width, height, left, top } = useDrawingArea();
  const primaryY = top + height / 2 - 10;
  const secondaryY = primaryY + 24;

  return (
    <>
      <StyledText x={left + width / 2} y={primaryY}>
        {primaryText}
      </StyledText>
      <StyledText x={left + width / 2} y={secondaryY}>
        {secondaryText}
      </StyledText>
    </>
  );
}

export default function HandicapBreakdown() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const user_id = localStorage.getItem("userId");
        const response = await fetch(
          `http://localhost:8000/api/player/${user_id}/stats`,
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        );
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching user stats:", error);
        setStats(null);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return <Typography>Loading handicap data...</Typography>;
  }

  if (!stats) {
    return <Typography>Error loading data</Typography>;
  }

  const data = [
    { label: "Putts", value: stats.avg_putts_per_round },
    { label: "Penalties", value: stats.avg_penalities_per_round },
    { label: "Score", value: stats.avg_score_per_round },
    { label: "Fairway Hit %", value: stats.fairway_hit_percentage },
    { label: "GIR %", value: stats.gir_percentage },
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const colors = [
    "hsl(220, 78.20%, 65.90%)", // Putts - blue
    "hsl(0, 100.00%, 48.40%)", // Penalties - red
    "hsl(268, 90.50%, 49.40%)", // Score - purple
    "hsl(123, 84.30%, 50.20%)", // Fairway Hit % - green
    "hsl(69, 88.00%, 49.20%)", // GIR % - dark blue/gray
  ];

  return (
    <Card
      variant="outlined"
      sx={{
        width: "100%",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: 3,
      }}
    >
      <CardContent>
        <Typography component="h2" variant="subtitle2">
          Handicap Breakdown
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <PieChart
            colors={colors}
            margin={{ left: 80, right: 80, top: 80, bottom: 80 }}
            series={[
              {
                data,
                innerRadius: 75,
                outerRadius: 100,
                paddingAngle: 2,
                highlightScope: { faded: "global", highlighted: "item" },
              },
            ]}
            height={260}
            width={260}
            slotProps={{ legend: { hidden: true } }}
          >
            <PieCenterLabel
              primaryText={`${total.toFixed(1)}`}
              secondaryText="Total Contribution"
            />
          </PieChart>
        </Box>

        {data.map((item, index) => (
          <Stack
            key={index}
            direction="row"
            sx={{ alignItems: "center", gap: 2, pb: 2 }}
          >
            <Stack sx={{ gap: 1, flexGrow: 1 }}>
              <Stack
                direction="row"
                sx={{
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: "500" }}>
                  {item.label}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {item.value.toFixed(1)}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={Math.min(item.value * 1.5, 100)} // Normalize values for display
                sx={{
                  [`& .${linearProgressClasses.bar}`]: {
                    backgroundColor: colors[index],
                  },
                }}
              />
            </Stack>
          </Stack>
        ))}
      </CardContent>
    </Card>
  );
}
