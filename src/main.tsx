import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import './index.css'
import Homepage from './Pages/Homepage.tsx'
import SessionCreation from './Pages/SessionCreation'
import Upload from './Pages/Upload'
import { AuthProvider } from './AuthContext';
import Login from './Pages/Login';
import UserInformation from './Pages/UserInformation';
import UserHomepage from './Pages/UserHomepage.tsx';
import GameViewer from './Pages/GameViewer.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
        {/*<Upload/>*/}
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Homepage />} />
                    <Route path="/create-session" element={<SessionCreation />} />
                    <Route path="/login-page" element={<Login />} />
                    <Route path="/account-page" element={<UserHomepage />} />
                    <Route path="/user-information" element={<UserInformation />} />
                    <Route path="/upload/:collageId" element={<Upload />} />
                    <Route path="game-viewer" element={<GameViewer />} /> {/*TODO : make this use session ID*/}
                    
                </Routes>
            </BrowserRouter>
        </AuthProvider>
  </StrictMode>,
)
