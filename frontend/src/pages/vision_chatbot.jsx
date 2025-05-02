import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import {
  Box,
  CssBaseline,
  Stack,
  Typography,
  Button,
  CircularProgress,
  Paper,
} from "@mui/material";
import { FileInput } from "@mantine/core";
import AppNavbar from "../layouts/components/AppNavbar";
import Header from "../layouts/components/Header";
import SideMenu from "../layouts/components/SideMenu";
import AppTheme from "../layouts/theme/AppTheme";

export function SwingReview(props) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadResponse, setUploadResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  async function sendFileToServer(file) {
    const url = "http://localhost:8000/api/vision/";
    const formData = new FormData();

    formData.append("video", file);

    setLoading(true);

    try {
      const response = await axios.post(url, formData, {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      });

      setUploadResponse(response.data.response);
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadResponse("**Upload failed**. Please try again!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex" }}>
        <SideMenu />
        <AppNavbar />
        <SideMenu />

        <Box component="main" sx={{ flexGrow: 1, overflow: "auto", padding: 3 }}>
          <Stack spacing={2} sx={{ alignItems: "center" }}>
            <Header />

            <Paper sx={{ maxWidth: 800, width: "100%", padding: 3, boxShadow: 3 }}>
              <Typography variant="h6" gutterBottom>
                Upload Swing Video
              </Typography>

              <FileInput
                variant="filled"
                placeholder="Choose a video file..."
                accept="video/*"
                onChange={(file) => {
                  setSelectedFile(file);
                  if (file) sendFileToServer(file);
                }}
              />

              <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
                {loading && <CircularProgress size={24} />}
                {selectedFile && <Typography>File: {selectedFile.name}</Typography>}
              </Stack>

              {uploadResponse && (
                <Box sx={{ mt: 2, padding: 2, borderRadius: 2, backgroundColor: "background.paper", boxShadow: 1 }}>
                  <ReactMarkdown>{uploadResponse}</ReactMarkdown>
                </Box>
              )}

              <Button
                variant="contained"
                color="secondary"
                sx={{ mt: 3 }}
                disabled={!selectedFile || loading}
                onClick={() => setSelectedFile(null)}
              >
                Clear Selection
              </Button>
            </Paper>
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}