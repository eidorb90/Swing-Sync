import React from 'react';
import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MantineProvider, createTheme } from '@mantine/core';
import App from './App';
import Account from "./pages/account";
import SignIn from './pages/signin';
import SignUp from './pages/signup';
import ChatBot from './pages/chatBot';
import '@mantine/core/styles.css';
import LeaderBoard from './layouts/LeaderBoard';
import AddRounds from './pages/Add_rounds';

const theme = createTheme({
  primaryColor: 'blue',
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <MantineProvider theme={theme}>
          <App />
          </MantineProvider>         
        } />
        <Route path="/addrounds" element={
          <MantineProvider theme={theme}>
          <AddRounds />
          </MantineProvider>
        } />

        <Route path="/leaderboard" element={
          <MantineProvider theme={theme}>
          <LeaderBoard/>
          </MantineProvider>         
        } />
        
        <Route path="/account" element={
          <MantineProvider theme={theme}>
          <Account />
          </MantineProvider>         
        } />

        <Route path="/login" element={
          <SignIn /> 
        }>
        </Route>

        <Route path="/signup" element={
          <SignUp />
        }>
        </Route>
        <Route path="/Woody/chat" element={
          <MantineProvider theme={theme}>
            <ChatBot />
          </MantineProvider>
        } />
      </Routes>
    </BrowserRouter>  
    </StrictMode>
);