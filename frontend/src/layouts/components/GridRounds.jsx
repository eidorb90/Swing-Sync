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
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
} from "@mui/material";

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
  const [isSearching, setIsSearching] = useState(false);
  const [notes, setNotes] = useState("");
  const [alertInfo, setAlertInfo] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // Statistics for the round
  const [roundStats, setRoundStats] = useState({
    totalScore: 0,
    totalPutts: 0,
    fairwaysHit: 0,
    greensInRegulation: 0,
    totalPenalties: 0,
  });

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  // Update statistics whenever scores change
  useEffect(() => {
    if (scores.length > 0) {
      const totalScore = scores.reduce(
        (sum, score) => sum + (score.strokes || 0),
        0
      );
      const totalPutts = scores.reduce(
        (sum, score) => sum + (score.putts || 0),
        0
      );
      const fairwaysHit = scores.filter((score) => score.fairwayHit).length;
      const greensInRegulation = scores.filter(
        (score) => score.greenInRegulation
      ).length;
      const totalPenalties = scores.reduce(
        (sum, score) => sum + (score.penalties || 0),
        0
      );

      setRoundStats({
        totalScore,
        totalPutts,
        fairwaysHit,
        greensInRegulation,
        totalPenalties,
      });
    }
  }, [scores]);

  const handleCloseAlert = () => {
    setAlertInfo((prev) => ({ ...prev, open: false }));
  };

  // Function to fetch courses from API
  const fetchCourses = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 3) return;

    setIsSearching(true);
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
      setCourses(data.courses || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setAlertInfo({
        open: true,
        message: `Failed to search courses: ${error.message}`,
        severity: "error",
      });
      setCourses([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle typing in the search box with debounce
  const handleSearchChange = (event, value) => {
    setSearchValue(value);
    if (value) {
      // Debounce the search to avoid too many API calls
      const timeoutId = setTimeout(() => fetchCourses(value), 500);
      return () => clearTimeout(timeoutId);
    } else {
      setCourses([]);
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

    if (selectedCourse && selectedCourse.tees && selectedCourse.tees[gender]) {
      setTeeOptions(selectedCourse.tees[gender]);
    } else {
      setTeeOptions([]);
    }

    setSelectedTee("");
    setHoles([]);
    setScores([]);
  };

  const handleTeeSelection = (event) => {
    const teeName = event.target.value;
    setSelectedTee(teeName);

    if (!selectedCourse || !selectedGender) return;

    // Store the full tee object instead of just the name
    const tee = teeOptions.find((t) => t.tee_name === teeName);
    if (tee && tee.holes && tee.holes.length > 0) {
      // Assign IDs dynamically based on the number of holes
      const holesWithIds = tee.holes.map((hole, index) => ({
        ...hole,
        id: index + 1, // Assign IDs starting from 1
      }));

      setHoles(holesWithIds);
      setScores(
        holesWithIds.map((hole) => ({
          hole_id: hole.id,
          strokes: "",
          putts: 0,
          fairwayHit: false,
          greenInRegulation: false,
          penalties: 0,
        }))
      );
    } else {
      setAlertInfo({
        open: true,
        message:
          "No holes found for this tee. Please select a different tee or contact support.",
        severity: "warning",
      });
      setHoles([]);
      setScores([]);
    }
  };

  // Handle score updates for a specific hole
  const handleScoreChange = (index, field, value) => {
    const updatedScores = [...scores];

    // Validate strokes input - must be a positive number
    if (field === "strokes" && (value < 1 || isNaN(value))) {
      if (value === "") {
        // Allow empty string temporarily for user input
        updatedScores[index][field] = value;
      } else {
        return; // Don't update with invalid values
      }
    } else {
      updatedScores[index][field] = value;
    }

    setScores(updatedScores);
  };

  // Validate form before submission
  const validateForm = () => {
    if (!selectedCourse) {
      setAlertInfo({
        open: true,
        message: "Please select a course",
        severity: "error",
      });
      return false;
    }

    if (!selectedTee) {
      setAlertInfo({
        open: true,
        message: "Please select a tee",
        severity: "error",
      });
      return false;
    }

    const invalidScores = scores.some(
      (score) =>
        score.strokes === "" || score.strokes < 1 || isNaN(score.strokes)
    );

    if (invalidScores) {
      setAlertInfo({
        open: true,
        message: "Please enter valid stroke counts for all holes",
        severity: "error",
      });
      return false;
    }

    return true;
  };

  // Save data to backend
  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    // Find the tee object from the selected tee
    const selectedTeeObj = teeOptions.find((t) => t.tee_name === selectedTee);

    // Calculate total strokes
    const totalStrokes = scores.reduce(
      (sum, score) => sum + (Number(score.strokes) || 0),
      0
    );

    const dataToSave = {
      course_id: selectedCourse.id,
      tee_name: selectedTee, // Add the tee_name field as required by the backend
      notes: notes,
      hole_scores: scores.map((score) => ({
        hole_id: score.hole_id,
        strokes: parseInt(score.strokes, 10),
        putts: score.putts || 0,
        fairway_hit: score.fairwayHit || false,
        green_in_regulation: score.greenInRegulation || false,
        penalties: score.penalties || 0,
      })),
    };

    try {
      console.log("Sending data:", dataToSave);
      const response = await fetch("http://localhost:8000/api/rounds/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify(dataToSave),
      });
      console.log("Response status:", dataToSave);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || `Error saving data: ${response.statusText}`
        );
      }

      console.log("Data saved successfully:", result);
      setAlertInfo({
        open: true,
        message: "Round saved successfully!",
        severity: "success",
      });

      // Reset form after successful save
      setSelectedCourse(null);
      setSelectedGender("");
      setSelectedTee("");
      setHoles([]);
      setScores([]);
      setNotes("");
      setSearchValue("");
    } catch (error) {
      console.error("Error saving data:", error);
      setAlertInfo({
        open: true,
        message: `Failed to save round: ${error.message}`,
        severity: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 1200, margin: "0 auto" }}>
      <Paper
        elevation={3}
        sx={{ p: 3, mb: 3, backgroundColor: "background.paper" }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{ mb: 3, fontWeight: "bold", color: "primary.main" }}
        >
          Record a New Round
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              {/* Course Search */}
              <Autocomplete
                freeSolo
                options={courses}
                getOptionLabel={(option) => option.course_name || ""}
                inputValue={searchValue}
                onInputChange={handleSearchChange}
                onChange={handleCourseSelection}
                value={selectedCourse}
                loading={isSearching}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search Course"
                    variant="outlined"
                    helperText="Type at least 3 characters to search"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {isSearching ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />

              {/* Selected Course Details */}
              {selectedCourse && (
                <Paper
                  variant="outlined"
                  sx={{ p: 2, backgroundColor: "background.paper" }}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    {selectedCourse.course_name}
                  </Typography>
                  {selectedCourse.location && (
                    <Typography variant="body2" color="text.secondary">
                      {selectedCourse.location.address},{" "}
                      {selectedCourse.location.city},{" "}
                      {selectedCourse.location.state}
                    </Typography>
                  )}
                </Paper>
              )}

              {/* Gender and Tee Selection */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Gender"
                    value={selectedGender}
                    onChange={handleGenderChange}
                    variant="outlined"
                    fullWidth
                    disabled={!selectedCourse}
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Tee Box"
                    value={selectedTee}
                    onChange={handleTeeSelection}
                    variant="outlined"
                    fullWidth
                    disabled={!selectedGender || teeOptions.length === 0}
                  >
                    {teeOptions.map((tee, index) => (
                      <MenuItem key={index} value={tee.tee_name}>
                        {tee.tee_name} (CR: {tee.course_rating}, SR:{" "}
                        {tee.slope_rating})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>

              {/* Date and Notes */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={1}
                    placeholder="Weather conditions, memorable shots, etc."
                  />
                </Grid>
              </Grid>
            </Stack>
          </Grid>

          {/* Round Stats Summary */}
          <Grid item xs={12} md={4}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "background.paper",
              }}
            >
              <Typography variant="h6" gutterBottom>
                Round Summary
              </Typography>
              <Stack spacing={1} sx={{ mt: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Total Score:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {roundStats.totalScore || "-"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Total Putts:</Typography>
                  <Typography variant="body2">
                    {roundStats.totalPutts || "-"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Fairways Hit:</Typography>
                  <Typography variant="body2">
                    {holes.length > 0
                      ? `${roundStats.fairwaysHit}/${
                          holes.length
                        } (${Math.round(
                          (roundStats.fairwaysHit / holes.length) * 100
                        )}%)`
                      : "-"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Greens in Regulation:</Typography>
                  <Typography variant="body2">
                    {holes.length > 0
                      ? `${roundStats.greensInRegulation}/${
                          holes.length
                        } (${Math.round(
                          (roundStats.greensInRegulation / holes.length) * 100
                        )}%)`
                      : "-"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Total Penalties:</Typography>
                  <Typography variant="body2">
                    {roundStats.totalPenalties || "-"}
                  </Typography>
                </Box>
              </Stack>
              <Box sx={{ flexGrow: 1 }} />
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleSave}
                disabled={isSaving || holes.length === 0}
                sx={{ mt: 2 }}
              >
                {isSaving ? "Saving..." : "Save Round"}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Score Entry Section */}
      {holes.length > 0 && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Enter Scores
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2}>
            {holes.map((hole, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    position: "relative",
                    backgroundColor: "background.paper",
                    borderLeft: "4px solid",
                    borderLeftColor: "primary.main",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ mb: 1 }}
                  >
                    Hole {hole.hole_number} ({index + 1})
                  </Typography>
                  <Box sx={{ display: "flex", mb: 1, alignItems: "center" }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      Par {hole.par}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {hole.yardage} yards
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        ml: "auto",
                        backgroundColor: "action.selected",
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                      }}
                    >
                      Handicap {hole.handicap}
                    </Typography>
                  </Box>

                  <TextField
                    type="number"
                    label="Strokes"
                    value={scores[index]?.strokes || ""}
                    onChange={(e) =>
                      handleScoreChange(
                        index,
                        "strokes",
                        e.target.value === ""
                          ? ""
                          : parseInt(e.target.value, 10)
                      )
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                    required
                    sx={{ mb: 1 }}
                    error={
                      scores[index]?.strokes === "" ||
                      scores[index]?.strokes < 1
                    }
                  />

                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <TextField
                        select
                        label="Putts"
                        value={scores[index]?.putts || 0}
                        onChange={(e) =>
                          handleScoreChange(
                            index,
                            "putts",
                            parseInt(e.target.value, 10)
                          )
                        }
                        variant="outlined"
                        size="small"
                        fullWidth
                      >
                        {[0, 1, 2, 3, 4, 5, 6].map((putt) => (
                          <MenuItem key={putt} value={putt}>
                            {putt}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        select
                        label="Penalties"
                        value={scores[index]?.penalties || 0}
                        onChange={(e) =>
                          handleScoreChange(
                            index,
                            "penalties",
                            parseInt(e.target.value, 10)
                          )
                        }
                        variant="outlined"
                        size="small"
                        fullWidth
                      >
                        {[0, 1, 2, 3, 4].map((penalty) => (
                          <MenuItem key={penalty} value={penalty}>
                            {penalty}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 1 }}>
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
                          size="small"
                        />
                      }
                      label={
                        <Typography variant="body2">Fairway Hit</Typography>
                      }
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
                          size="small"
                        />
                      }
                      label={<Typography variant="body2">GIR</Typography>}
                    />
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      <Snackbar
        open={alertInfo.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alertInfo.severity}
          sx={{ width: "100%" }}
        >
          {alertInfo.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
