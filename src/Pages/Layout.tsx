
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import tempLogo from '../assets/TempLogo2.png';
import '../Stylesheets/Layout.css';
import { useAuth } from '../AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://gameangle.onrender.com';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const { loggedIn, username, setLoggedIn, setUserId, setUsername } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            await fetch(`${API_BASE}/api/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setLoggedIn(false);
            setUserId(null);
            setUsername(null);
            setIsLoggingOut(false);
            navigate('/');
        }
    };
    
    return (
        <div className="site-background">

            <header className="site-header">
                {/* display logo */}
                <img
                    src={tempLogo}
                    alt="Logo"
                    className="header-logo"
                    onClick={() => navigate('/')}
                    style={{ cursor: 'pointer' }}
                />

                <div className="header-right">
                {/* if logged in, display account button, otherwise display login button */}
                {loggedIn ? (
                    <>
                        <span>{username ? `@${username}` : 'User'}</span>
                        <button onClick={() => navigate('/account-page')}>Account</button>
                        <button onClick={handleLogout} disabled={isLoggingOut}>
                            {isLoggingOut ? 'Logging Out...' : 'Log Out'}
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={() => navigate('/login-page')}>Log In</button>
                        <button onClick={() => navigate('/signup')}>Sign Up</button>
                    </>
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