import * as React from 'react';
import { useState, useEffect } from "react";

import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import "../Styles/Inputstyle.css";

// Default data for the radar chart
const defaultStatsData = [
    // ... (your default data here)
];

export default function GridRound() {
    const [statsData, setStatsData] = useState(defaultStatsData);
    const [isLoading, setIsLoading] = useState(true);
    const [courses, setCourses] = useState([]); // List of courses
    const [selectedCourse, setSelectedCourse] = useState(""); // Selected course
    const [searchValue, setSearchValue] = useState(''); // Search value for filtering courses

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/course/search/');
                if (response.ok) {
                    const data = await response.json();
                    setCourses(data);
                }
            } catch (error) {
                console.error('Error fetching courses:', error);
            }
        };

        fetchCourses();
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const user_id = localStorage.getItem('userId') || '1';
                const response = await fetch(`http://localhost:8000/api/player/${user_id}/stats`);
                if (response.ok) {
                    const data = await response.json();
                    setStatsData((prevStats) => [...prevStats, ...data]);
                    setIsLoading(false);
                } else {
                    console.error('Failed to fetch stats data.');
                }
            } catch (error) {
                console.error('Error fetching stats data:', error);
            }
        };

        fetchStats();
    }, []);

    const filteredCourses = courses.filter((course) =>
        course.name.toLowerCase().includes(searchValue.toLowerCase())
    );

    return (
        <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: 'none' } }} className="input-container">
            <Grid container spacing={2}>
                <Grid xs={12} md={6}>
                    <Stack spacing={2} className="form-stack">
                        <Typography variant="h6" className="form-title">Update Round Data</Typography>
                        <form
                            className="round-form"
                            onSubmit={async (e) => {
                                e.preventDefault();

                                // Validate if the selectedCourse exists in the list of courses
                                const isValidCourse = courses.some((course) => course.name === selectedCourse);

                                if (!isValidCourse) {
                                    alert("The selected course is not valid. Please select a course from the list.");
                                    return;
                                }

                                const formData = new FormData(e.target);
                                const roundData = {
                                    course: selectedCourse,
                                    strokes: formData.get('strokes'),
                                    fairwaysHit: formData.get('fairwaysHit'),
                                    greensInRegulation: formData.get('greensInRegulation'),
                                    putts: formData.get('putts'),
                                    penalties: formData.get('penalties'),
                                };

                                try {
                                    const user_id = localStorage.getItem('userId') || '1';
                                    const response = await fetch(`http://localhost:8000/api/player/${user_id}/round`, {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify(roundData),
                                    });

                                    if (response.ok) {
                                        alert('Round data updated successfully!');
                                        const statsResponse = await fetch(`http://localhost:8000/api/player/${user_id}/stats`);
                                        if (statsResponse.ok) {
                                            const fetchedData = await statsResponse.json();
                                            setStatsData((prevStats) => [...prevStats, ...fetchedData]);
                                        }
                                    } else {
                                        alert('Failed to update round data.');
                                    }
                                } catch (error) {
                                    console.error('Error updating round data:', error);
                                    alert('An error occurred while updating round data.');
                                }
                            }}
                        >
                            <Stack spacing={2}>
                                {/* Combined Search and Select Input */}
                                <div className="styled-input-container">
                                    <input
                                        type="text"
                                        placeholder="Search or Select Course"
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                        className="styled-input"
                                        list="courses-list"
                                    />
                                    <datalist id="courses-list">
                                        {filteredCourses.map((course) => (
                                            <option
                                                key={course.id}
                                                value={course.name}
                                                onClick={() => setSelectedCourse(course.name)}
                                            />
                                        ))}
                                    </datalist>
                                </div>

                                <input name="strokes" type="number" placeholder="Strokes" required className="styled-input" />
                                <input name="fairwaysHit" type="number" placeholder="Fairways Hit" required className="styled-input" />
                                <input name="greensInRegulation" type="number" placeholder="Greens in Regulation" required className="styled-input" />
                                <input name="putts" type="number" placeholder="Putts" required className="styled-input" />
                                <input name="penalties" type="number" placeholder="Penalties" required className="styled-input" />
                                <button type="submit" className="styled-input">Save Round</button>
                            </Stack>
                        </form>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
}