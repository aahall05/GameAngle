import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import './index.css'
import App from './Pages/App.tsx'
import Upload from './Pages/Upload.tsx'
import Layout from './Pages/Layout.tsx'
import Homepage from './Pages/Homepage.tsx'
import SessionCreation from './Pages/SessionCreation'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
        {/*<Upload/>*/}
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/create-session" element={<SessionCreation />} />
                {/* 
                    add account page
                    add 
                */}
            </Routes>
        </BrowserRouter>
  </StrictMode>,
)
