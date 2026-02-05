import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setSession = (token, userData) => {
    if (token) {
      localStorage.setItem("wpa_token", token);
    }
    setUser(userData);
  };

  const clearSession = () => {
    localStorage.removeItem("wpa_token");
    setUser(null);
  };

  const login = async (payload) => {
    const data = await api.login(payload);
    setSession(data.token, data.user);
    return data;
  };

  const register = async (payload) => {
    const data = await api.register(payload);
    setSession(data.token, data.user);
    return data;
  };

  const logout = () => {
    clearSession();
  };

  const refresh = async () => {
    try {
      const data = await api.me();
      setUser(data);
    } catch (error) {
      clearSession();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("wpa_token");
    if (!token) {
      setLoading(false);
      return;
    }
    refresh();
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
