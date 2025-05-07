import * as React from "react";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { LineChart } from "@mui/x-charts/LineChart";

// Component for defining a gradient for the chart area
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

  // Default data for the last 10 rounds
  const defaultRounds = Array.from({ length: 10 }, (_, i) => `Round ${i + 1}`);
  const defaultScores = Array(10).fill(72); // Default score of 72 for each round

  const colorPalette = [
    theme.palette.primary.light,
    theme.palette.primary.main,
    theme.palette.error.main,
  ];

  // State to hold chart data
  const [chartData, setChartData] = useState({
    totalScores: defaultScores.map(() => 0), // Default total scores
    avgPutts: Array(10).fill(0), // Default average putts
    parTotal: defaultScores.map(() => 0), // Default par for each round
  });
  const [roundLabels, setRoundLabels] = useState(defaultRounds); // Labels for rounds
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [improvement, setImprovement] = useState({
    value: 0,
    percentage: "0%",
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const user_id = localStorage.getItem("userId") || "1"; // Fallback to default user ID
        const response = await fetch(
          `http://localhost:8000/api/player/${user_id}/stats`,
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        );
        if (response.ok) {
          const fetchedData = await response.json();

          // Extract scores from the fetched data
          const scores_list = fetchedData.scores_list || [];

          if (scores_list.length > 0) {
            // Limit to 10 most recent rounds (or fewer if less data is available)
            const recentRounds = scores_list.slice(0, 10).reverse();

            // Calculate total scores for each round
            const totalScores = recentRounds.map((round) => {
              const scores = round.scores || [];
              return scores.reduce(
                (total, score) => total + (score.strokes || 0),
                0
              );
            });

            // Calculate total putts for each round
            const avgPutts = recentRounds.map((round) => {
              const scores = round.scores || [];
              const totalPutts = scores.reduce(
                (total, score) => total + (score.putts || 0),
                0
              );
              return totalPutts;
            });

            // Calculate par totals for each round
            const parTotals = recentRounds.map((round) => {
              const scores = round.scores || [];
              return scores.reduce(
                (total, score) => total + (score.par || 0),
                0
              );
            });

            // Generate round labels with formatted dates
            const labels = recentRounds.map((round, index) => {
              const date = new Date(round.date);
              const formattedDate = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
              return `R${index + 1}: ${formattedDate}`;
            });

            // Calculate improvement (difference between first and last round scores)
            if (totalScores.length >= 2) {
              const firstScore = totalScores[0];
              const lastScore = totalScores[totalScores.length - 1];
              const diff = firstScore - lastScore;
              const percentChange = ((diff / firstScore) * 100).toFixed(1);

              setImprovement({
                value: diff,
                percentage: `${diff >= 0 ? "+" : ""}${percentChange}%`,
              });
            }

            // Update the chart data
            setChartData({
              totalScores,
              avgPutts,
              parTotal: parTotals,
            });

            // Update round labels
            setRoundLabels(labels);
          }
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false); // Ensure loading state is reset
      }
    };

    fetchStats();
  }, []);

  return (
    <Card variant="outlined" sx={{ width: "100%" }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Round Performance Trend
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
              {isLoading
                ? "..." // Show loading indicator
                : chartData.totalScores.length > 0
                ? Math.round(
                    chartData.totalScores.reduce((a, b) => a + b, 0) /
                      chartData.totalScores.length
                  ) // Calculate average score
                : "--"}
            </Typography>
            <Chip
              size="small"
              color={improvement.value >= 0 ? "success" : "error"} // Color based on improvement
              label={improvement.percentage}
            />
          </Stack>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Average score across recent rounds
          </Typography>
        </Stack>
        <LineChart
          colors={colorPalette} // Chart colors
          xAxis={[
            {
              scaleType: "point",
              data: roundLabels, // X-axis labels
              tickInterval: (index) => index % 2 === 0, // Show every other label
            },
          ]}
          series={[
            {
              id: "totalScore",
              label: "Total Score",
              showMark: true,
              curve: "linear",
              area: false,
              data: chartData.totalScores, // Total scores data
            },
            {
              id: "avgPutts",
              label: "Total Putts",
              showMark: true,
              curve: "linear",
              area: false,
              data: chartData.avgPutts, // Average putts data
            },
            {
              id: "parTotal",
              label: "Course Par",
              showMark: false,
              curve: "linear",
              area: false,
              data: chartData.parTotal, // Par totals data
            },
          ]}
          height={250}
          margin={{ left: 50, right: 20, top: 20, bottom: 20 }}
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
