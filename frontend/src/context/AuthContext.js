import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState(null);

    const login = (token) => {
        setAccessToken(token);
    };

    const logout = () => {
        setAccessToken(null);
    };

    const isAuthenticated = !!accessToken;

    return (
        <AuthContext.Provider value={{ isAuthenticated, accessToken, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
