import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api/auth.api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current user details via cookie session
  const fetchCurrentUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await authApi.getMe();
      if (res && res.success && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Set user directly after successful login or OTP verify
  const setUserSession = useCallback((userData) => {
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      setUser(null);
    }
  }, []);

  const updateAddresses = useCallback((newAddresses) => {
    setUser((prev) => (prev ? { ...prev, addresses: newAddresses } : prev));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        setUserSession,
        refreshUser: fetchCurrentUser,
        logout,
        updateAddresses,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
