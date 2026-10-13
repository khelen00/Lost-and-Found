
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem("campusToken") || ""
  );

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("campusUser") || "null");
    } catch {
      return null;
    }
  });

  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setUser(null);
      localStorage.removeItem("campusUser");
    }
  }, [token]);

  function saveSession(authToken, authUser) {
    localStorage.setItem("campusToken", authToken);
    localStorage.setItem("campusUser", JSON.stringify(authUser));

    setToken(authToken);
    setUser(authUser);
  }

  function logout() {
    localStorage.removeItem("campusToken");
    localStorage.removeItem("campusUser");

    setToken("");
    setUser(null);
  }

  async function login(email, password) {
    setAuthLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      saveSession(response.data.token, response.data.user);
      return response.data;
    } finally {
      setAuthLoading(false);
    }
  }

  async function register(name, email, password) {
    setAuthLoading(true);

    try {
      const response = await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      saveSession(response.data.token, response.data.user);
      return response.data;
    } finally {
      setAuthLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        authLoading,
        login,
        register,
        logout,
        isAuthenticated: Boolean(token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
