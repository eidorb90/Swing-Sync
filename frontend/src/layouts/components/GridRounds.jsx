import React, { useState, useEffect } from "react";
import {
  Grid,
  Box,
  Stack,
  Typography,
  Autocomplete,
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button,
} from "@mui/material";
import "../Styles/Inputstyle.css";

export default function GridRound() {
  const [userId, setUserId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [teeOptions, setTeeOptions] = useState([]);
  const [selectedTee, setSelectedTee] = useState("");
  const [holes, setHoles] = useState([]);
  const [scores, setScores] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      console.error("User ID not found in local storage.");
      alert("User ID is missing. Please log in again.");
    }
  }, []);

  // Function to fetch courses from API
  const fetchCourses = async (searchTerm) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/course/search/?search=${encodeURIComponent(
          searchTerm
        )}`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Error fetching courses: ${response.statusText}`);
      }
      const data = await response.json();
      setCourses(data.courses || []); // Update courses state with fetched data
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourses([]);
    }
  };

  // Handle typing in the search box
  const handleSearchChange = (event, value) => {
    setSearchValue(value);
    if (value) {
      fetchCourses(value); // Fetch courses dynamically as user types
    } else {
      setCourses([]); // Clear courses if search box is empty
    }
  };

  // Handle course selection
  const handleCourseSelection = (event, newValue) => {
    setSelectedCourse(newValue);
    setSelectedGender("");
    setTeeOptions([]);
    setSelectedTee("");
    setHoles([]);
    setScores([]);
  };

  // Handle gender selection
  const handleGenderChange = (event) => {
    const gender = event.target.value;
    setSelectedGender(gender);

    if (selectedCourse && selectedCourse.tees[gender]) {
      setTeeOptions(selectedCourse.tees[gender]); // Set tee options based on the selected gender
    } else {
      setTeeOptions([]); // Clear tee options if no tees are available
    }

    setSelectedTee("");
    setHoles([]);
    setScores([]);
  };

  const handleTeeSelection = (event) => {
    const teeName = event.target.value;
    setSelectedTee(teeName);

    const tee = teeOptions?.find((t) => t?.tee_name === teeName);
    if (tee && tee.holes) {
      setHoles(tee.holes);
      setScores(
        tee.holes.map(() => ({
          strokes: 0,
          putts: 0,
          fairwayHit: false,
          greenInRegulation: false,
          penalties: 0,
        }))
      );
    } else {
      setHoles([]);
      setScores([]);
    }
  };

  // Handle score updates for a specific hole
  const handleScoreChange = (index, field, value) => {
    const updatedScores = [...scores];
    updatedScores[index][field] = value;
    setScores(updatedScores);
  };

  
  // Save data to backend
  const handleSave = async () => {
    if (!userId || !selectedCourse || !selectedTee) {
      console.error("Missing required fields for saving round data.");
      alert("Please ensure all fields are filled out.");
      return;
    }
  
    setIsSaving(true);
  
    const tee = teeOptions.find((t) => t.tee_name === selectedTee); // Get the selected tee object
  
    const dataToSave = {
      course_id: selectedCourse.id, // Backend expects course_id
      tee_id: tee?.id, // Add the tee_id from the selected tee
      notes: "", // Add notes if applicable or default to an empty string
      hole_scores: scores.map((score, index) => ({
        hole_id: holes[index]?.id, // Backend expects hole_id
        strokes: score.strokes,
        putts: score.putts || 0,
        fairway_hit: score.fairwayHit || false,
        green_in_regulation: score.greenInRegulation || false,
        penalties: score.penalties || 0,
      })),
    };
  
    console.log("Data being sent:", JSON.stringify(dataToSave, null, 2)); // Log the data payload for debugging
  
    try {
      const response = await fetch(`http://localhost:8000/api/rounds/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify(dataToSave),
      });
  
      if (!response.ok) {
        throw new Error(`Error saving data: ${response.statusText}`);
      }
  
      const result = await response.json();
      console.log("Data saved successfully:", result);
      alert("Data saved successfully!");
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Failed to save data. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ width: "100%" }} className="input-container">
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Stack spacing={2} className="form-stack">
            <Typography variant="h6" className="form-title">
              Update Round Data
            </Typography>

            {/* Course Search and Dropdown */}
            <Autocomplete
              freeSolo
              options={courses}
              getOptionLabel={(option) => option.course_name || ""}
              onInputChange={handleSearchChange}
              onChange={handleCourseSelection}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search or Select Course"
                  variant="outlined"
                  fullWidth
                  value={searchValue}
                />
              )}
            />

            {/* Gender Selection */}
            {selectedCourse && (
              <TextField
                select
                label="Select Gender"
                value={selectedGender}
                onChange={handleGenderChange}
                variant="outlined"
                fullWidth
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
              </TextField>
            )}

            {/* Tee Selection */}
            {selectedGender && teeOptions.length > 0 && (
              <TextField
                select
                label="Select Tee"
                value={selectedTee}
                onChange={handleTeeSelection}
                variant="outlined"
                fullWidth
              >
                {teeOptions.map((tee, index) => (
                  <MenuItem key={index} value={tee.tee_name}>
                    {tee.tee_name}
                  </MenuItem>
                ))}
              </TextField>
            )}

            {/* Score Inputs */}
            {holes.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Enter Scores for {holes.length} Holes
                </Typography>
                {holes.map((hole, index) => (
                  <Box key={index} sx={{ marginBottom: 2 }}>
                    <Typography variant="subtitle1">
                      Hole {index + 1}
                    </Typography>
                    <TextField
                      type="number"
                      label="Strokes"
                      value={scores[index]?.strokes || ""}
                      onChange={(e) =>
                        handleScoreChange(
                          index,
                          "strokes",
                          parseInt(e.target.value, 10) || 0
                        )
                      }
                      variant="outlined"
                      fullWidth
                      sx={{ marginBottom: 1 }}
                    />
                    <TextField
                      select
                      label="Putts"
                      value={scores[index]?.putts || ""}
                      onChange={(e) =>
                        handleScoreChange(
                          index,
                          "putts",
                          parseInt(e.target.value, 10) || 0
                        )
                      }
                      variant="outlined"
                      fullWidth
                      sx={{ marginBottom: 1 }}
                    >
                      {[0, 1, 2, 3, 4].map((putt) => (
                        <MenuItem key={putt} value={putt}>
                          {putt}
                        </MenuItem>
                      ))}
                    </TextField>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={scores[index]?.fairwayHit || false}
                          onChange={(e) =>
                            handleScoreChange(
                              index,
                              "fairwayHit",
                              e.target.checked
                            )
                          }
                        />
                      }
                      label="Fairway Hit"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={scores[index]?.greenInRegulation || false}
                          onChange={(e) =>
                            handleScoreChange(
                              index,
                              "greenInRegulation",
                              e.target.checked
                            )
                          }
                        />
                      }
                      label="Green in Regulation"
                    />
                    <TextField
                      select
                      label="Penalties"
                      value={scores[index]?.penalties || ""}
                      onChange={(e) =>
                        handleScoreChange(
                          index,
                          "penalties",
                          parseInt(e.target.value, 10) || 0
                        )
                      }
                      variant="outlined"
                      fullWidth
                      sx={{ marginBottom: 1 }}
                    >
                      {[0, 1, 2, 3, 4].map((penalty) => (
                        <MenuItem key={penalty} value={penalty}>
                          {penalty}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                ))}
              </Box>
            )}

            {/* Save Button */}
            {holes.length > 0 && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Round"}
              </Button>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
