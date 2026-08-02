import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

const AuthCtx = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("cp_token");
    if (!token) { setLoading(false); return; }
    api.get("/profile")
      .then(r => setUser(r.data))
      .catch(() => localStorage.removeItem("cp_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/login", { email, password });
    localStorage.setItem("cp_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post("/register", { name, email, password });
    localStorage.setItem("cp_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("cp_token");
    setUser(null);
  };

  const refreshUser = async () => {
    const { data } = await api.get("/profile");
    setUser(data);
    return data;
  };

  return (
    <AuthCtx.Provider value={{ user, setUser, login, register, logout, refreshUser, loading }}>
      {children}
    </AuthCtx.Provider>
  );
};

export const useAuth = () => useContext(AuthCtx);
