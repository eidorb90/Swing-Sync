import React from 'react';
import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MantineProvider, createTheme } from '@mantine/core';
import App from './App';
import Account from "./pages/account";
import SignIn from './pages/signin';
import SignUp from './pages/signup';
import '@mantine/core/styles.css';

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
        
        <Route path="/account" element={
          <MantineProvider theme={theme}>
          <Account />
          </MantineProvider>         
        } />

        <Route path="/signin" element={
          <SignIn /> 
        }>
        </Route>

        <Route path="/signup" element={
          <SignUp />
        }>
        </Route>
      </Routes>
    </BrowserRouter>  
    </StrictMode>
);