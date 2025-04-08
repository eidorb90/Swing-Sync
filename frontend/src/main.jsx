import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter, Routes, Route} from "react-router";
import SignInContainer from './layouts/signin.jsx'
import SignUpContainer from './layouts/signup.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/account" element={<App />} />
        <Route path="/account/signin" element={<SignInContainer/>} />
        <Route path="/account/signup" element={<SignUpContainer/>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
