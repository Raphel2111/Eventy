import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [authError, setAuthError] = useState(null);

    const login = async (username, password) => {
        setIsLoading(true);
        setAuthError(null);
        try {
            const response = await api.post('token/', {
                username,
                password
            });

            const token = response.data.access;
            if (token) {
                setUserToken(token);
                await AsyncStorage.setItem('access_token', token);

                // Fetch user details
                try {
                    const userRes = await api.get('users/me/');
                    setUserInfo(userRes.data);
                    await AsyncStorage.setItem('user_info', JSON.stringify(userRes.data));
                } catch (err) {
                    console.log('Error fetching user info', err);
                    setAuthError(`Profile Load Error: ${err.message}`);
                }
            }
        } catch (e) {
            console.log('Login error', e);
            setAuthError(e.response?.data?.detail || e.message);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        setUserToken(null);
        setUserInfo(null);
        setAuthError(null);
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('user_info');
        setIsLoading(false);
    };

    const isLoggedIn = async () => {
        try {
            setIsLoading(true);
            setAuthError(null);
            let userToken = await AsyncStorage.getItem('access_token');
            let userInfoStr = await AsyncStorage.getItem('user_info');

            if (userToken) {
                setUserToken(userToken);

                if (userInfoStr) {
                    setUserInfo(JSON.parse(userInfoStr));
                }

                // Refresh user info and Wait for it if we don't have it locally
                try {
                    const res = await api.get('users/me/');
                    setUserInfo(res.data);
                    await AsyncStorage.setItem('user_info', JSON.stringify(res.data));
                } catch (e) {
                    console.log('User refresh failed', e);

                    let msg = e.message;
                    if (e.response) {
                        msg = `Status: ${e.response.status} - ${JSON.stringify(e.response.data)}`;
                    } else if (e.request) {
                        msg = "Network Error (No Response)";
                    }
                    setAuthError(msg);

                    // If 401, maybe logout? For now just log.
                    if (e.response && e.response.status === 401) {
                        logout();
                        return;
                    }
                }
            }
            setIsLoading(false);
        } catch (e) {
            console.log('isLoggedIn error', e);
            setAuthError(e.message);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        isLoggedIn();
    }, []);

    const updateUserInfo = async (newData) => {
        setUserInfo(newData);
        await AsyncStorage.setItem('user_info', JSON.stringify(newData));
    };

    return (
        <AuthContext.Provider value={{ login, logout, isLoading, userToken, userInfo, updateUserInfo, authError }}>
            {children}
        </AuthContext.Provider>
    );
};
