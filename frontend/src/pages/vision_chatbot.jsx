
/**
 * SwingReview Component
 * 
 * This component provides a user interface for uploading swing videos and interacting with a chatbot
 * to analyze the uploaded video. It includes functionalities for file upload, displaying server responses,
 * and a chat interface for user-bot communication.
 * 
 * 
 * 
 */
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
  const [selectedFile, setSelectedFile] = useState(null); // State to store the selected file
  const [uploadResponse, setUploadResponse] = useState(null); // State to store the server's response after file upload
  const [loading, setLoading] = useState(false); // State to indicate loading status
  const [messages, setMessages] = useState([]); // State to store chat messages
  const [input, setInput] = useState(""); // State to store user input in the chat
  const messagesEndRef = useRef(null); // Ref to scroll to the bottom of the chat

  useEffect(() => {
    // Automatically scroll to the bottom of the chat when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === "" || loading) return; // Prevent sending empty messages or sending while loading

    const userMessage = { text: input, sender: "user", timestamp: new Date() }; // Create a user message object

    const url = "http://localhost:8000/api/vision/";
    const formData = new FormData();

    formData.append("message", userMessage.text); // Append the user message to the form data

    setLoading(true); // Set loading state to true

    setMessages([...messages, userMessage]); // Add the user message to the chat
    setInput(""); // Clear the input field

    try {
      const response = await axios.post(url, formData, {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") }, // Include authorization token
      });

      const botMessage = {
        text: response.data.response,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]); // Add the bot's response to the chat
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        text: "**Error**: Unable to process your question. Please try again!",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]); // Add an error message to the chat
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  async function sendFileToServer(file) {
    const url = "http://localhost:8000/api/vision/";
    const formData = new FormData();

    formData.append("video", file); // Append the selected file to the form data

    setLoading(true); // Set loading state to true

    try {
      const response = await axios.post(url, formData, {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") }, // Include authorization token
      });

      setUploadResponse(response.data.response); // Store the server's response
      const botMessage = {
        text: response.data.response,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages([botMessage]); // Add the server's response as a bot message
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadResponse("**Upload failed**. Please try again!"); // Handle upload failure
    } finally {
      setLoading(false); // Reset loading state
    }
  }

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex" }}>
        <SideMenu />
        <AppNavbar />

        <Box component="main" sx={{ flexGrow: 1, padding: 3 }}>
          <Stack spacing={2} sx={{ alignItems: "center" }}>
            <Header />

            <Paper
              sx={{ maxWidth: 800, width: "100%", padding: 3, boxShadow: 3 }}
            >
              <Typography variant="h6" gutterBottom>
                Upload Swing Video
              </Typography>

              <FileInput
                variant="filled"
                placeholder="Choose a video file..."
                accept="video/*"
                onChange={(file) => {
                  setSelectedFile(file); // Update the selected file state
                  if (file) sendFileToServer(file); // Upload the file if selected
                }}
              />

              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ mt: 2 }}
              >
                {loading && <CircularProgress size={24} />} {/* Show loading spinner */}
                {selectedFile && (
                  <Typography>File: {selectedFile.name}</Typography> // Display the selected file name
                )}
              </Stack>

              {uploadResponse && (
                <Box
                  sx={{
                    mt: 2,
                    padding: 2,
                    borderRadius: 2,
                    backgroundColor: "background.paper",
                    boxShadow: 1,
                  }}
                >
                  <ReactMarkdown>{uploadResponse}</ReactMarkdown> {/* Render the server's response */}
                </Box>
              )}

              <Button
                variant="contained"
                color="secondary"
                sx={{ mt: 3 }}
                disabled={!selectedFile || loading} // Disable button if no file is selected or loading
                onClick={() => setSelectedFile(null)} // Clear the selected file
              >
                Clear Selection
              </Button>
            </Paper>

            <Paper
              sx={{
                maxWidth: 800,
                width: "100%",
                padding: 3,
                boxShadow: 3,
                mt: 3,
              }}
            >
              <Typography variant="h6" gutterBottom>
                Chat About the Video
              </Typography>

              <Box sx={{ maxHeight: 300, overflowY: "auto", mb: 2 }}>
                {messages.map((message, index) => (
                  <Box
                    key={index}
                    sx={{
                      textAlign: message.sender === "user" ? "right" : "left", // Align messages based on sender
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
                          message.sender === "user"
                            ? "primary.light"
                            : "grey.300", // Different background colors for user and bot messages
                        color: message.sender === "user" ? "white" : "black",
                      }}
                    >
                      <ReactMarkdown>{message.text}</ReactMarkdown> {/* Render message text */}
                    </Typography>
                  </Box>
                ))}
                <div ref={messagesEndRef} /> {/* Scroll to this element when messages change */}
              </Box>

              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Ask a question about the video..."
                  value={input} // Bind input value to state
                  onChange={(e) => setInput(e.target.value)} // Update state on input change
                  disabled={loading} // Disable input while loading
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSendMessage} // Send message on button click
                  disabled={loading || input.trim() === ""} // Disable button if loading or input is empty
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
