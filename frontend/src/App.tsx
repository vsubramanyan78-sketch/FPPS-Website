import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Chatbot } from './components/Chatbot';

// Pages
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { SearchPage } from './pages/SearchPage';
import { BudgetPlanner } from './pages/BudgetPlanner';
import { AlertsManager } from './pages/AlertsManager';
import { Profile } from './pages/Profile';
import { AdminPortal } from './pages/AdminPortal';

import './App.css';

function AppContent() {
  const { currentView, setView, theme, token } = useApp();

  // On mount, redirect based on authentication token
  useEffect(() => {
    if (token) {
      setView('dashboard');
    } else {
      setView('landing');
    }
  }, [token]);

  const getPageTitle = () => {
    switch (currentView) {
      case 'dashboard': return "Aviation Analytics Terminal";
      case 'search': return "Flight Route Forecaster";
      case 'budget': return "Travel Cost Planner";
      case 'alerts': return "Price Alert Monitors";
      case 'profile': return "Analyst Profile & Preferences";
      case 'admin': return "System Administration Hub";
      case 'auth': return "Security Access Terminal";
      default: return "Flight Price Prediction System";
    }
  };

  const renderActivePage = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage onStart={() => setView('dashboard')} />;
      case 'auth':
        return <AuthPage onSuccess={() => setView('dashboard')} />;
      case 'dashboard':
        return <Dashboard />;
      case 'search':
        return <SearchPage />;
      case 'budget':
        return <BudgetPlanner />;
      case 'alerts':
        return <AlertsManager />;
      case 'profile':
        return <Profile />;
      case 'admin':
        return <AdminPortal />;
      default:
        return <LandingPage onStart={() => setView('dashboard')} />;
    }
  };

  const showHeader = currentView !== 'landing' && currentView !== 'auth';

  return (
    <div className={`
      min-h-screen font-sans antialiased transition-colors duration-200 flex relative overflow-x-hidden
      ${theme === 'dark' 
        ? 'bg-aviation-navy text-white' 
        : 'bg-slate-50 text-gray-800'}
    `}>
      {/* Background Neon Grid / Dot pattern for premium aesthetics */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0"></div>
      
      {/* Sidebar Navigation */}
      {currentView !== 'landing' && <Sidebar />}

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-w-0 z-10 transition-all duration-300">
        {showHeader && <Navbar title={getPageTitle()} />}
        
        <main className="flex-1 overflow-y-auto">
          {renderActivePage()}
        </main>
      </div>

      {/* Floating Chatbot Assistant */}
      <Chatbot />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
