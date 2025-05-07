import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";

import { SparkLineChart } from "@mui/x-charts/SparkLineChart";

// Utility function to get all days in a given month and year
function getDaysInMonth(month, year) {
  const date = new Date(year, month, 0); // Get the last day of the month
  const monthName = date.toLocaleDateString("en-US", {
    month: "short", // Get the short month name (e.g., "Apr")
  });
  const daysInMonth = date.getDate(); // Get the total number of days in the month
  const days = [];
  let i = 1;
  while (days.length < daysInMonth) {
    days.push(`${monthName} ${i}`); // Push formatted day strings (e.g., "Apr 1")
    i += 1;
  }
  return days;
}

// Renders a sparkline chart inside a cell
function renderSparklineCell(params) {
  const data = getDaysInMonth(4, 2024); // Generate x-axis labels for April 2024
  const { value, colDef } = params;

  if (!value || value.length === 0) {
    return null; // Return null if no data is provided
  }

  return (
    <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
      <SparkLineChart
        data={value} // Data for the sparkline
        width={colDef.computedWidth || 100} // Dynamically set width
        height={32} // Fixed height
        plotType="bar" // Render as a bar chart
        showHighlight // Highlight the hovered bar
        showTooltip // Show tooltip on hover
        colors={["hsl(210, 98%, 42%)"]} // Set bar color
        xAxis={{
          scaleType: "band", // Use band scale for x-axis
          data, // X-axis labels
        }}
      />
    </div>
  );
}

// Renders a status chip with color based on the status
function renderStatus(status) {
  const colors = {
    Online: "success", // Green for online
    Offline: "default", // Default color for offline
  };

  return <Chip label={status} color={colors[status]} size="small" />;
}

// Renders an avatar with the user's initials and background color
export function renderAvatar(params) {
  if (params.value == null) {
    return ""; // Return empty string if no value is provided
  }

  return (
    <Avatar
      sx={{
        backgroundColor: params.value.color, // Set background color
        width: "24px", // Set avatar width
        height: "24px", // Set avatar height
        fontSize: "0.85rem", // Set font size
      }}
    >
      {params.value.name.toUpperCase().substring(0, 1)} {/* Display the first letter of the name */}
    </Avatar>
  );
}

// Define the columns for the grid
export const columns = [
  { field: "id", headerName: "Rank", flex: 1.5, minWidth: 200 }, // Rank column
  {
    field: "user",
    headerName: "User",
    headerAlign: "left",
    align: "left",
    flex: 1,
    minWidth: 80, // User column
  },
  {
    field: "status",
    headerName: "Status",
    flex: 0.5,
    minWidth: 80,
    renderCell: (params) => renderStatus(params.value), // Render status chip
  },
  {
    field: "handicap",
    headerName: "Handicap",
    headerAlign: "right",
    align: "right",
    flex: 1,
    minWidth: 100, // Handicap column
  },
  {
    field: "averageScore",
    headerName: "Average Score",
    headerAlign: "right",
    align: "right",
    flex: 1,
    minWidth: 120, // Average score column
  },
  {
    field: "totalRounds",
    headerName: "Total Rounds",
    headerAlign: "right",
    align: "right",
    flex: 1,
    minWidth: 100, // Total rounds column
  },
];

// Define the rows for the grid
export const rows = [
  {
    id: "1",
    user: "John Doe",
    status: "Online",
    handicap: 5.4,
    averageScore: 72,
    totalRounds: 120, // Example row data
  },
];
