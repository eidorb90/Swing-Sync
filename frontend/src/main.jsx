import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {BrowserRouter, Routes, Route} from "react-router";
import SignInContainer from './layouts/signin.jsx'
import SignUpContainer from './layouts/signup.jsx'
import MainPage from './layouts/account.jsx';
import LeaderBoard from './layouts/LeaderBoard.jsx';
import { MantineProvider } from '@mantine/core';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MantineProvider withGlobalStyles withNormalizeCSS theme={{ colorScheme: 'dark' }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/leaderboard" element={<LeaderBoard />} />
          <Route path="/signin" element={<SignInContainer/>} />
          <Route path="/signup" element={<SignUpContainer/>} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  </StrictMode>
)
