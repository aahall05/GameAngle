
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import tempLogo from '../assets/TempLogo2.png';
import '../Stylesheets/Layout.css';
import { useAuth } from '../AuthContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const { loggedIn } = useAuth();
    
    return (
        <div className="site-background">

            <header className="site-header">
                {/* display logo */}
                <img src={tempLogo} alt="Logo" className="header-logo" />

                <div className="header-right">
                {/* if logged in, display account button, otherwise display login button */}
                {loggedIn ? (
                    <button onClick={() => navigate('/account-page')}>Account</button>
                ) : (
                    <button onClick={() => navigate('/login-page')}>Log In</button>
                    )}
                </div>
            </header>

            <main className="site-content">
                {children}
            </main>

            <footer className="site-footer">
                &copy; {new Date().getFullYear()} GameSync. All rights reserved.
            </footer>
        </div>
    );
};

export default Layout;