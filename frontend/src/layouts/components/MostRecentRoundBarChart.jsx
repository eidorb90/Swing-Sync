import * as React from "react";
import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { BarChart } from "@mui/x-charts/BarChart";
import { useTheme } from "@mui/material/styles";

export default function PageViewsBarChart() {
  const theme = useTheme();

  const defaultHoles = Array.from({ length: 9 }, (_, i) => `Hole ${i + 1}`);
  const defaultData = Array(9).fill(4); // Default par value for each hole

  const colorPalette = [
    (theme.vars || theme).palette.error.main, // Color for penalties
    (theme.vars || theme).palette.primary.main, // Color for putts
    (theme.vars || theme).palette.primary.light, // Color for other strokes
  ];

  const [chartData, setChartData] = useState({
    strokes: defaultData.map(() => 0), // Default strokes
    putts: defaultData.map(() => 0), // Default putts
    par: defaultData.map(() => 0), // Default par values
    pen: defaultData.map(() => 0), // Default penalties
  });

  const [Loading, setIsLoading] = useState(true); // Loading state
  const [roundInfo, setRoundInfo] = useState({ date: "Today", totalScore: 0 }); // Round info state

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true); // Start loading
        const user_id = localStorage.getItem("userId") || "1"; // Get user ID from localStorage
        const response = await fetch(
          `http://localhost:8000/api/player/${user_id}/stats`,
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"), // Add authorization token
            },
          }
        );

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
              const strokeData = frontNineScores.map(
                (score) => score.strokes || 0
              );
              const puttData = frontNineScores.map((score) => score.putts || 0);
              const parData = frontNineScores.map((score) => score.par || 0);
              const penData = frontNineScores.map(
                (score) => score.penalties || 0
              );

              // Calculate total score
              const totalScore = strokeData.reduce((sum, val) => sum + val, 0);

              // Update the chart data
              setChartData({
                strokes: strokeData,
                putts: puttData,
                par: parData,
                pen: penData,
              });

              // Format the round date
              const formattedDate = new Date(mostRecentRound.date)
                .toLocaleString("en-US", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })
                .replace(",", "/")
                .replace(" ", "");

              // Update round info
              setRoundInfo({
                date: formattedDate,
                totalScore: totalScore,
                note: mostRecentRound.note || "No notes available",
              });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching stats:", error); // Log any errors
      } finally {
        setIsLoading(false); // Stop loading
      }
    };

    fetchStats();
  }, []);

  // Calculate other strokes for the stacked bar chart
  const calculateOtherStrokes = () => {
    return chartData.strokes.map((stroke, i) => {
      const putt = chartData.putts[i] || 0;
      const pen = chartData.pen[i] || 0;
      return Math.max(0, stroke - putt - pen); // Ensure no negative values
    });
  };

  return (
    <Card variant="outlined" sx={{ width: "100%" }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Last 9 holes
        </Typography>
        <Stack sx={{ justifyContent: "space-between" }}>
          <Stack
            direction="row"
            sx={{
              alignContent: { xs: "center", sm: "flex-start" },
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography variant="h4" component="p">
              {roundInfo.totalScore} {/* Display total score */}
            </Typography>
            <Chip size="small" color="main" label={roundInfo.date} /> {/* Display round date */}
          </Stack>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {roundInfo.note} {/* Display round note */}
          </Typography>
        </Stack>
        <BarChart
          borderRadius={8}
          colors={colorPalette} // Use defined color palette
          xAxis={[
            {
              scaleType: "band",
              categoryGapRatio: 0.5,
              data: chartData.strokes.map((_, i) => `Hole ${i + 1}`), // X-axis labels
            },
          ]}
          series={[
            {
              id: "penalties",
              label: "Penalties",
              data: chartData.pen, // Penalty data
              stack: "A",
              color: colorPalette[0], // Assign specific color
            },
            {
              id: "putts",
              label: "Putts",
              data: chartData.putts, // Putt data
              stack: "A",
              color: colorPalette[1], // Assign specific color
            },
            {
              id: "other-strokes",
              label: "Other Strokes",
              data: calculateOtherStrokes(), // Other strokes data
              stack: "A",
              color: colorPalette[2], // Assign specific color
            },
          ]}
          height={250}
          margin={{ left: 50, right: 0, top: 20, bottom: 20 }}
          grid={{ horizontal: true }} // Enable horizontal grid lines
          slotProps={{
            legend: {
              hidden: true, // Hide legend
            },
          }}
        />
      </CardContent>
    </Card>
  );
}
