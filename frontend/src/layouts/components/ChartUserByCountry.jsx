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

// Styled text component for the center label in the pie chart
const StyledText = styled("text")(({ theme }) => ({
  textAnchor: "middle",
  dominantBaseline: "central",
  fill: theme.palette.text.secondary,
  fontSize: theme.typography.body2.fontSize,
  fontWeight: theme.typography.body2.fontWeight,
}));

// Component to render the center label inside the pie chart
function PieCenterLabel({ primaryText, secondaryText }) {
  const { width, height, left, top } = useDrawingArea();
  const primaryY = top + height / 2 - 10; // Position for primary text
  const secondaryY = primaryY + 24; // Position for secondary text

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
  const [stats, setStats] = useState(null); // State to store fetched stats
  const [loading, setLoading] = useState(true); // State to track loading status

  useEffect(() => {
    async function fetchStats() {
      try {
        const user_id = localStorage.getItem("userId"); // Get user ID from local storage
        const response = await fetch(
          `http://localhost:8000/api/player/${user_id}/stats`,
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"), // Include auth token
            },
          }
        );
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        setStats(data); // Update stats state with fetched data
      } catch (error) {
        console.error("Error fetching user stats:", error);
        setStats(null); // Handle error by setting stats to null
      } finally {
        setLoading(false); // Set loading to false after fetch completes
      }
    }
    fetchStats();
  }, []); // Empty dependency array ensures this runs only once on mount

  if (loading) {
    return <Typography>Loading handicap data...</Typography>; // Show loading message
  }

  if (!stats) {
    return <Typography>Error loading data</Typography>; // Show error message if stats are null
  }

  // Prepare data for the pie chart
  const data = [
    { label: "Putts", value: stats.avg_putts_per_round },
    { label: "Penalties", value: stats.avg_penalities_per_round },
    { label: "Score", value: stats.avg_score_per_round },
    { label: "Fairway Hit %", value: stats.fairway_hit_percentage },
    { label: "GIR %", value: stats.gir_percentage },
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0); // Calculate total contribution

  // Define colors for each segment of the pie chart
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
                innerRadius: 75, // Inner radius for donut chart effect
                outerRadius: 100, // Outer radius of the pie chart
                paddingAngle: 2, // Space between segments
                highlightScope: { faded: "global", highlighted: "item" }, // Highlight behavior
              },
            ]}
            height={260}
            width={260}
            slotProps={{ legend: { hidden: true } }} // Hide legend
          >
            <PieCenterLabel
              primaryText={`${total.toFixed(1)}`} // Display total contribution
              secondaryText="Total Contribution"
            />
          </PieChart>
        </Box>

        {/* Render a list of stats with progress bars */}
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
                  {item.label} {/* Label for the stat */}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {item.value.toFixed(1)} {/* Value of the stat */}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={Math.min(item.value * 1.5, 100)} // Normalize values for display
                sx={{
                  [`& .${linearProgressClasses.bar}`]: {
                    backgroundColor: colors[index], // Set progress bar color
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
