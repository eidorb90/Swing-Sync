import * as React from "react";
import { useLocation } from "react-router-dom";
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Stack from "@mui/material/Stack";
import {
  MenuItem,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import AppNavbar from "../layouts/components/AppNavbar";
import Header from "../layouts/components/Header";
import SideMenu from "../layouts/components/SideMenu";
import AppTheme from "../layouts/theme/AppTheme";
import { Container, Title } from "@mantine/core";

export default function CourseDetails(props) {
  const location = useLocation();
  const { course } = location.state;
  const [selectedGender, setSelectedGender] = React.useState("");
  const [selectedTee, setSelectedTee] = React.useState("");
  const [holes, setHoles] = React.useState([]);

  // Handle gender selection
  const handleGenderChange = (event) => {
    const gender = event.target.value;
    setSelectedGender(gender);
    setSelectedTee("");
    setHoles([]);
  };

  // Handle tee selection
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

              {/* Display Holes */}
              {selectedTee && holes.length > 0 && (
                <Box mt={4}>
                  <Title order={3} mb={10}>
                    Holes for Tee: {selectedTee}
                  </Title>
                  <List>
                    {holes.map((hole, index) => (
                      <ListItem key={index} sx={{ padding: 1 }}>
                        <ListItemText
                          primary={`Hole ${index + 1} - Par: ${
                            hole.par
                          }, Yardage: ${hole.yardage}, Handicap: ${
                            hole.handicap
                          }`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Container>
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
