import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import './index.css'
import Homepage from './Pages/Homepage.tsx'
import SessionCreation from './Pages/SessionCreation'
import { AuthProvider } from './AuthContext';
import Login from './Pages/Login';
import UserInformation from './Pages/UserInformation';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
        {/*<Upload/>*/}
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Homepage />} />
                    <Route path="/create-session" element={<SessionCreation />} />
                    <Route path="/login-page" element={<Login />} />
                    <Route path="/account-page" element={<UserInformation />} />
                    {/* 
                        add account page
                        add 
                    */}
                </Routes>
            </BrowserRouter>
        </AuthProvider>
  </StrictMode>,
)
