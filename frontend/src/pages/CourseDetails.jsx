import * as React from "react";
import { useLocation } from "react-router-dom";
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Stack from "@mui/material/Stack";
import { DataGrid } from "@mui/x-data-grid";
import { MenuItem, TextField, Typography, Button } from "@mui/material";
import AppNavbar from "../layouts/components/AppNavbar";
import Header from "../layouts/components/Header";
import SideMenu from "../layouts/components/SideMenu";
import AppTheme from "../layouts/theme/AppTheme";
import { Container, Title } from "@mantine/core";

export default function CourseDetails(props) {
  const location = useLocation();
  const { course } = location.state;

  // State for selected gender, tee, and holes
  const [selectedGender, setSelectedGender] = React.useState("");
  const [selectedTee, setSelectedTee] = React.useState("");
  const [holes, setHoles] = React.useState([]);

  // Columns for holes DataGrid
  const columes = [
    { field: "hole", headerName: "Hole", width: 250 },
    { field: "par", headerName: "Par", width: 250 },
    { field: "yardage", headerName: "Yardage", width: 250 },
    { field: "handicap", headerName: "Handicap", width: 250 },
  ];

  // Rows for holes DataGrid
  const rows = holes.map((hole, index) => ({
    id: index + 1,
    hole: index + 1,
    par: hole.par,
    yardage: hole.yardage,
    handicap: hole.handicap,
  }));

  // Columns for tee information DataGrid
  const columes2 = [
    { field: "tee_name", headerName: "Tee Name", width: 150 },
    { field: "course_rating", headerName: "Course Rating", width: 150 },
    { field: "slope_rating", headerName: "Slope Rating", width: 150 },
    { field: "bogey_rating", headerName: "Bogey Rating", width: 150 },
    { field: "total_yards", headerName: "Total Yards", width: 150 },
    { field: "total_meters", headerName: "Total Meters", width: 150 },
    { field: "number_of_holes", headerName: "Number of Holes", width: 150 },
    { field: "par_total", headerName: "Par Total", width: 150 },
    {
      field: "front_course_rating",
      headerName: "Front Course Rating",
      width: 200,
    },
    {
      field: "front_slope_rating",
      headerName: "Front Slope Rating",
      width: 200,
    },
    {
      field: "front_bogey_rating",
      headerName: "Front Bogey Rating",
      width: 200,
    },
    {
      field: "back_course_rating",
      headerName: "Back Course Rating",
      width: 200,
    },
    { field: "back_slope_rating", headerName: "Back Slope Rating", width: 200 },
    { field: "back_bogey_rating", headerName: "Back Bogey Rating", width: 200 },
  ];

  // Rows for tee information DataGrid
  const rows2 = selectedTee
    ? [
        {
          id: 1,
          tee_name: selectedTee,
          course_rating: course.tees[selectedGender]?.find(
            (tee) => tee.tee_name === selectedTee
          )?.course_rating,
          slope_rating: course.tees[selectedGender]?.find(
            (tee) => tee.tee_name === selectedTee
          )?.slope_rating,
          bogey_rating: course.tees[selectedGender]?.find(
            (tee) => tee.tee_name === selectedTee
          )?.bogey_rating,
          total_yards: course.tees[selectedGender]?.find(
            (tee) => tee.tee_name === selectedTee
          )?.total_yards,
          total_meters: course.tees[selectedGender]?.find(
            (tee) => tee.tee_name === selectedTee
          )?.total_meters,
          number_of_holes: course.tees[selectedGender]?.find(
            (tee) => tee.tee_name === selectedTee
          )?.number_of_holes,
          par_total: course.tees[selectedGender]?.find(
            (tee) => tee.tee_name === selectedTee
          )?.par_total,
          front_course_rating: course.tees[selectedGender]?.find(
            (tee) => tee.tee_name === selectedTee
          )?.front_course_rating,
          front_slope_rating: course.tees[selectedGender]?.find(
            (tee) => tee.tee_name === selectedTee
          )?.front_slope_rating,
          front_bogey_rating: course.tees[selectedGender]?.find(
            (tee) => tee.tee_name === selectedTee
          )?.front_bogey_rating,
          back_course_rating: course.tees[selectedGender]?.find(
            (tee) => tee.tee_name === selectedTee
          )?.back_course_rating,
          back_slope_rating: course.tees[selectedGender]?.find(
            (tee) => tee.tee_name === selectedTee
          )?.back_slope_rating,
          back_bogey_rating: course.tees[selectedGender]?.find(
            (tee) => tee.tee_name === selectedTee
          )?.back_bogey_rating,
        },
      ]
    : [];

  // Handle gender selection change
  const handleGenderChange = (event) => {
    const gender = event.target.value;
    setSelectedGender(gender);
    setSelectedTee(""); // Reset tee selection when gender changes
    setHoles([]); // Reset holes when gender changes
  };

  // Handle tee selection change
  const handleTeeChange = (event) => {
    const teeName = event.target.value;
    setSelectedTee(teeName);

    // Find the selected tee and update holes
    const selectedTeeData = course.tees[selectedGender]?.find(
      (tee) => tee.tee_name === teeName
    );
    if (selectedTeeData) {
      setHoles(selectedTeeData.holes || []);
    } else {
      setHoles([]);
    }
  };

  // State to toggle tee information visibility
  const [showTeeInfo, setShowTeeInfo] = React.useState(false);

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex" }}>
        <SideMenu />
        <AppNavbar />

        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: "auto",
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: "center",
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            <Header />

            {/* Course Details Section */}
            <Container size="lg" py="xl">
              <Title order={2} align="center" mb={20}>
                {course.course_name}
              </Title>
              <Title order={4} align="center" mb={10}>
                Location: {course.location.address}, {course.location.city},{" "}
                {course.location.state}, {course.location.country}
              </Title>

              {/* Gender Selection */}
              <Box mt={4} mb={2}>
                <Typography variant="h6" gutterBottom>
                  Select Gender
                </Typography>
                <TextField
                  select
                  value={selectedGender}
                  onChange={handleGenderChange}
                  variant="outlined"
                  fullWidth
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                </TextField>
              </Box>

              {/* Tee Selection */}
              {selectedGender && (
                <Box mb={2}>
                  <Typography variant="h6" gutterBottom>
                    Select Tee
                  </Typography>
                  <TextField
                    select
                    value={selectedTee}
                    onChange={handleTeeChange}
                    variant="outlined"
                    fullWidth
                  >
                    {course.tees[selectedGender]?.map((tee, index) => (
                      <MenuItem key={index} value={tee.tee_name}>
                        {tee.tee_name} - Course Rating: {tee.course_rating},
                        Slope Rating: {tee.slope_rating}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              )}

              {/* Display Holes or Tee Information */}
              {selectedTee && holes.length > 0 && (
                <Box mt={4}>
                  <Button
                    variant="outlined"
                    onClick={() => setShowTeeInfo(!showTeeInfo)}
                    sx={{ marginBottom: 2 }}
                  >
                    Tee Information
                  </Button>
                  {showTeeInfo ? (
                    <>
                      <Title order={1} mb={10} mt={4}>
                        Tee Information
                      </Title>
                      <DataGrid
                        rows={rows2}
                        columns={columes2}
                        pageSize={1}
                        pageSizeOptions={[1]}
                        rowsPerPageOptions={[1]}
                        disableColumnSorting
                        disableRowSelectionOnClick
                        disableColumnFilter
                        disableColumnSelector
                        disableColumnMenu
                        disableSelectionOnClick
                        sx={{
                          borderRadius: 1,
                          boxShadow: 1,
                          marginBottom: 4,
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <Title order={1} mb={10}>
                        Holes for Tee: {selectedTee}
                      </Title>
                      <DataGrid
                        rows={rows}
                        columns={columes}
                        pageSize={holes.length}
                        pageSizeOptions={[holes.length]}
                        rowsPerPageOptions={[holes.length]}
                        disableColumnSorting
                        disableRowSelectionOnClick
                        disableColumnFilter
                        disableColumnSelector
                        disableColumnMenu
                        disableSelectionOnClick
                        sx={{
                          borderRadius: 1,
                          boxShadow: 1,
                        }}
                      />
                    </>
                  )}
                </Box>
              )}
            </Container>
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
