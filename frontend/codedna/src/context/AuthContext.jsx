import { createContext, useState, useEffect } from "react";
import authApi from "../services/authApi.js";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("codedna_token");
    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .getMe()
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.removeItem("codedna_token");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { token, ...userData } = await authApi.login(email, password);
    localStorage.setItem("codedna_token", token);
    setUser(userData);
  };

  const register = async (name, email, password) => {
    const { token, ...userData } = await authApi.register(name, email, password);
    localStorage.setItem("codedna_token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("codedna_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};