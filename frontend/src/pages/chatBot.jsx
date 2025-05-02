import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Box,
  CssBaseline,
  Stack,
  TextField,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AppNavbar from "../layouts/components/AppNavbar";
import Header from "../layouts/components/Header";
import SideMenu from "../layouts/components/SideMenu";
import AppTheme from "../layouts/theme/AppTheme";
import ReactMarkdown from "react-markdown";

const ChatBot = (props) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (input.trim() === "" || loading) return;
  
    const userMessage = { text: input, sender: "user", timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
  
    try {
      const response = await fetch("http://localhost:8000/api/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ message: input }),
      });
  
      if (!response.ok) throw new Error("Failed to fetch response");
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botMessage = { text: "", sender: "bot", timestamp: new Date() };
  
      setMessages((prev) => [...prev, botMessage]); // Add an empty bot message first
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
  
        const chunk = decoder.decode(value, { stream: true });
  
        // Append new text to the latest bot message instead of replacing it
        setMessages((prev) =>
          prev.map((msg, index) =>
            index === prev.length - 1 && msg.sender === "bot"
              ? { ...msg, text: msg.text + chunk }
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, I encountered an error. Please try again later.",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex" }}>
        <SideMenu />
        <AppNavbar />
        <SideMenu />

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

            {/* Chat Container */}
            <Box
              sx={{
                width: "100%",
                maxWidth: "800px",
                height: "80vh",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
                boxShadow: 3,
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  backgroundColor: "primary.main",
                  color: "primary.contrastText",
                  padding: "15px 20px",
                  borderTopLeftRadius: 2,
                  borderTopRightRadius: 2,
                }}
              >
                <Typography variant="h6" sx={{ marginBottom: 1 }}>
                  Woody.Ai
                </Typography>
                <Typography variant="body2">
                  Ask me anything about your golf swing!
                </Typography>
              </Box>

              {/* Messages */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  padding: 2,
                  backgroundColor: "background.default",
                }}
              >
                <Stack spacing={2}>
                  {messages.length === 0 ? (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      textAlign="center"
                      sx={{ marginTop: "50px" }}
                    >
                      Start a conversation with Woody.Ai!
                    </Typography>
                  ) : (
                    messages.map((message, index) => (
                      <Box
                        key={index}
                        sx={{
                          alignSelf:
                            message.sender === "user"
                              ? "flex-end"
                              : "flex-start",
                          maxWidth: "80%",
                          padding: "10px 15px",
                          borderRadius: 2,
                          backgroundColor:
                            message.sender === "user"
                              ? "primary.main"
                              : "background.paper",
                          color:
                            message.sender === "user"
                              ? "primary.contrastText"
                              : "text.primary",
                        }}
                      >
                        <ReactMarkdown>{message.text}</ReactMarkdown>
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            textAlign: "right",
                            marginTop: "5px",
                            opacity: 0.6,
                          }}
                        >
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                      </Box>
                    ))
                  )}

                  {loading && (
                    <Stack direction="row" spacing={1}>
                      <CircularProgress size={20} />
                      <Typography variant="body2">
                        Woody.Ai is typing...
                      </Typography>
                    </Stack>
                  )}

                  <div ref={messagesEndRef} />
                </Stack>
              </Box>

              {/* Input */}
              <Box
                sx={{
                  display: "flex",
                  padding: "15px",
                  borderTop: "1px solid",
                  borderColor: "divider",
                  backgroundColor: "background.paper",
                }}
              >
                <TextField
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message..."
                  variant="outlined"
                  fullWidth
                  sx={{ flex: 1 }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={input.trim() === "" || loading}
                  variant="contained"
                  color="secondary"
                  sx={{ marginLeft: 2 }}
                >
                  Send
                </Button>
              </Box>
            </Box>
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
};

export default ChatBot;
