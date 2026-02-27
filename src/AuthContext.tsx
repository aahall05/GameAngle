// this is to store a global variable that determines whether a user is logged in or not
// the user's ID will also be stored here to make sure other pages pull the correct information for the user

import { createContext, useContext, useState } from 'react';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [loggedIn, setLoggedIn] = useState(true);
    const [userId, setUserId] = useState<number | null>(null);

    return (
        <AuthContext.Provider value={{ loggedIn, setLoggedIn, userId, setUserId }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);