// this is to store a global variable that determines whether a user is logged in or not
// the user's ID will also be stored here to make sure other pages pull the correct information for the user

import { createContext, useContext, useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

type AuthContextType = {
    loggedIn: boolean;
    setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
    userId: number | null;
    setUserId: React.Dispatch<React.SetStateAction<number | null>>;
    username: string | null;
    setUsername: React.Dispatch<React.SetStateAction<string | null>>;
    authLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/auth/session`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!response.ok) {
                    setLoggedIn(false);
                    setUserId(null);
                    setUsername(null);
                    return;
                }

                const data = await response.json();
                setLoggedIn(Boolean(data.authenticated));
                setUserId(data.userId ?? null);
                setUsername(data.username ?? null);
            } catch (error) {
                console.error('Session check failed:', error);
                setLoggedIn(false);
                setUserId(null);
                setUsername(null);
            } finally {
                setAuthLoading(false);
            }
        };

        checkSession();
    }, []);

    return (
        <AuthContext.Provider value={{ loggedIn, setLoggedIn, userId, setUserId, username, setUsername, authLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }

    return context;
};