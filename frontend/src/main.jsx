import React from "react";
import ReactDOM from "react-dom/client";
import { StrictMode } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MantineProvider, createTheme } from "@mantine/core";
import Account from "./pages/account";
import SignIn from "./pages/signin";
import SignUp from "./pages/signup";
import ChatBot from "./pages/chatBot";
import "@mantine/core/styles.css";
import LeaderBoard from "./pages/LeaderBoard";
import AddRounds from "./pages/Add_rounds";
import ProtectedRoute from "./pages/Check";
import CourseDetails from "./pages/CourseDetails";
import SearchBarCourse from "./pages/SearchBarCourse";

const theme = createTheme({
  primaryColor: "blue",
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route
          path="/addrounds"
          element={
            <MantineProvider theme={theme}>
              <ProtectedRoute>
                <AddRounds />
              </ProtectedRoute>
            </MantineProvider>
          }
        />

        <Route
          path="/leaderboard"
          element={
            <MantineProvider theme={theme}>
              <LeaderBoard />
            </MantineProvider>
          }
        />

        <Route
          path="/account"
          element={
            <MantineProvider theme={theme}>
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            </MantineProvider>
          }
        />

        <Route path="/signin" element={<SignIn />}></Route>

        <Route path="/signup" element={<SignUp />}></Route>

        <Route path="/Woody/chat" 
        element={
          <MantineProvider theme={theme}>
            <ProtectedRoute>
              <ChatBot />
            </ProtectedRoute>
          </MantineProvider>
        } />
        

        <Route
          path="/course-details"
          element={
            <MantineProvider theme={theme}>
              <ProtectedRoute>
                <CourseDetails />
              </ProtectedRoute>
            </MantineProvider>
          }
        />

        <Route
          path = "/search"
          element={
            <MantineProvider theme={theme}>
              <SearchBarCourse />
            </MantineProvider>
          }
        />

      </Routes>
    </BrowserRouter>
  </StrictMode>
);
