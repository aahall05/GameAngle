
import React from 'react';
import tempLogo from './assets/TempLogo2.png';
import './Layout.css';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (

    <div className="site-background">

        <header className="site-header">
            <img src={tempLogo} alt="Logo" className="header-logo" />
        </header>

        <main className="site-content">
            {children}
        </main>

        <footer className="site-footer">
            &copy; {new Date().getFullYear()} GameSync. All rights reserved.
        </footer>
    </div>
);

export default Layout;