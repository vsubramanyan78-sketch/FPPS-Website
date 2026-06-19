import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: number;
  fullname: string;
  email: string;
  is_admin: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  timestamp: string;
}

interface AppContextType {
  user: User | null;
  token: string | null;
  theme: 'dark' | 'light';
  notifications: Notification[];
  login: (token: string, userData: User) => void;
  logout: () => void;
  toggleTheme: () => void;
  addNotification: (title: string, message: string, type: Notification['type']) => void;
  clearNotifications: () => void;
  removeNotification: (id: string) => void;
  apiUrl: string;
  currentView: string;
  setView: (view: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('fpps_token'));
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentView, setView] = useState<string>('landing');
  const apiUrl = 'http://localhost:8000';

  useEffect(() => {
    // Sync theme with DOM
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    // Validate token on mount
    if (token) {
      axios.get(`${apiUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setUser(res.data);
        addNotification("Session Restored", `Welcome back, ${res.data.fullname}!`, "success");
      })
      .catch(() => {
        // Token expired or invalid
        localStorage.removeItem('fpps_token');
        setToken(null);
        setUser(null);
      });
    }
  }, [token]);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('fpps_token', newToken);
    setToken(newToken);
    setUser(userData);
    addNotification("Login Successful", `Access granted. Welcome ${userData.fullname}.`, "success");
  };

  const logout = () => {
    localStorage.removeItem('fpps_token');
    setToken(null);
    setUser(null);
    addNotification("Logged Out", "You have successfully signed out.", "info");
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const addNotification = (title: string, message: string, type: Notification['type']) => {
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 10)); // Keep last 10
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <AppContext.Provider value={{
      user,
      token,
      theme,
      notifications,
      login,
      logout,
      toggleTheme,
      addNotification,
      clearNotifications,
      removeNotification,
      apiUrl,
      currentView,
      setView
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
