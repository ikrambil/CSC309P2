import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState(null);
    // Add state for storing user email
    const [userEmail, setUserEmail] = useState(null);
    const [userName, setUserName] = useState(null);

    const login = (token, email, name) => {
        setAccessToken(token);
        setUserEmail(email);
        setUserName(name);
    };

    const logout = () => {
        setAccessToken(null);
        setUserEmail(null);
        setUserName(null);

    };

    const isAuthenticated = !!accessToken;

    return (
        <AuthContext.Provider value={{ isAuthenticated, accessToken, login, logout, userEmail, userName }}>
            {children}
        </AuthContext.Provider>
    );
};
