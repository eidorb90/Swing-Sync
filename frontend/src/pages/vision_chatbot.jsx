import React, { useEffect, useState, useRef } from "react";
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
  TextField,
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
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === "" || loading) return;

    const userMessage = { text: input, sender: "user", timestamp: new Date() };
    setMessages([...messages, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/vision/chat",
        { question: input },
        {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        }
      );

      const botMessage = {
        text: response.data.response,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        text: "**Error**: Unable to process your question. Please try again!",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

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
      const botMessage = {
        text: response.data.response,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages([botMessage]);
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
        
        

        <Box component="main" sx={{ flexGrow: 1, padding: 3 }}>
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

            <Paper sx={{ maxWidth: 800, width: "100%", padding: 3, boxShadow: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Chat About the Video
              </Typography>

              <Box sx={{ maxHeight: 300, overflowY: "auto", mb: 2 }}>
                {messages.map((message, index) => (
                  <Box
                    key={index}
                    sx={{
                      textAlign: message.sender === "user" ? "right" : "left",
                      marginBottom: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        display: "inline-block",
                        padding: 1,
                        borderRadius: 1,
                        backgroundColor:
                          message.sender === "user" ? "primary.light" : "grey.300",
                        color: message.sender === "user" ? "white" : "black",
                      }}
                    >
                      {message.text}
                    </Typography>
                  </Box>
                ))}
                <div ref={messagesEndRef} />
              </Box>

              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Ask a question about the video..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={loading || input.trim() === ""}
                >
                  Send
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}