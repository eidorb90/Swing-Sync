import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Stack, List, ListItem, ListItemText, Typography } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

export default function SearchCourse() {
  const [courses, setCourses] = useState([]); // Stores fetched courses
  const [searchValue, setSearchValue] = useState(''); // Stores the search input value
  const navigate = useNavigate();

  // Function to fetch courses from API
  const fetchCourses = async (searchTerm) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/course/search/?search=${encodeURIComponent(searchTerm)}`,
        {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      }
      );
      if (!response.ok) {
        throw new Error(`Error fetching courses: ${response.statusText}`);
      }
      const data = await response.json();
      setCourses(data.courses || []); // Update courses state with fetched data
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    }
  };

  // Handle typing in the search box
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchValue(value);
    if (value) {
      fetchCourses(value); // Fetch courses dynamically as the user types
    } else {
      setCourses([]); // Clear courses if search box is empty
    }
  };

  // Navigate to the details page when a course is selected
  const handleCourseSelection = (course) => {
    navigate('/course-details', {
      state: {
        course: course,
      },
    });
  };

  return (
    <Box sx={{ width: '100%', padding: 2 }}>
      <Stack spacing={1.5} alignItems="center">
        <Typography variant="h2" sx={{ fontWeight: 'bold' }}>
          Search Courses
        </Typography>
        {/* Search Bar */}
        <FormControl sx={{width:'100%', maxWidth:'100ch'}} variant="outlined">
          <OutlinedInput
            sx={{ height: '3rem', fontSize: '1.2rem' }}
            size="small"
            id="search"
            placeholder="Search…"
            value={searchValue}
            onChange={handleSearchChange}
            startAdornment={
              <InputAdornment position="start" sx={{ color: 'text.primary' }}>
                <SearchRoundedIcon fontSize="medium" />
              </InputAdornment>
            }
            inputProps={{
              'aria-label': 'search',
            }}
          />
        </FormControl>

        {/* Display Course Search Results */}
        {courses.length > 0 && (
          <List sx={{width: '100%', maxWidth: '100ch', bgcolor: 'background.paper' }}>
            {courses.map((course) => (
              <ListItem
                
                key={course.id}
                button
                onClick={() => handleCourseSelection(course)}
                sx={{borderRadius: '8px', marginBottom: 1 }}
              >
                <ListItemText
                  primary={course.course_name}
                  secondary={course.location?.address || 'No address available'}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Stack>
    </Box>
  );
}
