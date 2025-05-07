import * as React from "react";
import Grid from "@mui/material/Grid2";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CustomizedDataGrid from "./CustomizedDataGrid";

export default function LeaderBoardGrid() {
  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Title for the leaderboard */}
      <Typography component="h2" variant="h5" sx={{ mb: 2.5 }}>
        Leaderboard
      </Typography>

      {/* Main grid container for the leaderboard layout */}
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(100) }}
      >
        {/* Nested grid for the data grid and additional content */}
        <Grid container spacing={2} columns={1}>
          {/* Grid for the customized data grid */}
          <Grid size={{ xs: 12, lg: 9 }}>
            <CustomizedDataGrid />
          </Grid>

          {/* Placeholder grid for future content */}
          <Grid size={{ xs: 12, md: 6 }}></Grid>
        </Grid>
      </Grid>

      {/* Grid for additional components or content */}
      <Grid size={{ xs: 12, lg: 3 }}>
        <Stack
          gap={2}
          direction={{ xs: "column", sm: "row", lg: "column" }}
        >
          {/* Placeholder for stack content */}
        </Stack>
      </Grid>
    </Box>
  );
}
