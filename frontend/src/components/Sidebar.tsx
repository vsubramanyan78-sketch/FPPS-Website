import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  PlaneTakeoff, 
  LayoutDashboard, 
  Search, 
  Bell, 
  Wallet, 
  ShieldCheck, 
  User, 
  LogOut, 
  LogIn,
  Moon,
  Sun,
  Menu,
  X
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout, theme, toggleTheme, currentView, setView } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'landing', label: 'Home', icon: PlaneTakeoff },
    { id: 'dashboard', label: 'Analytics Dashboard', icon: LayoutDashboard },
    { id: 'search', label: 'Search Forecasts', icon: Search },
    { id: 'alerts', label: 'Price Alerts', icon: Bell },
    { id: 'budget', label: 'Budget Planner', icon: Wallet },
    { id: 'profile', label: 'Profile Options', icon: User }
  ];

  const handleNav = (tabId: string) => {
    setView(tabId);
    setIsOpen(false); // Close mobile menu
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-aviation-navy border border-aviation-royal/30 text-aviation-cyan"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar Panel */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 lg:w-72 flex flex-col h-screen
        transition-transform duration-300 transform 
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${theme === 'dark' 
          ? 'bg-aviation-navy border-r border-aviation-royal/20 text-white' 
          : 'bg-white border-r border-gray-200 text-gray-800'}
      `}>
        {/* Brand / Logo */}
        <div className="p-6 border-b border-aviation-royal/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-aviation-sky to-aviation-cyan flex items-center justify-center text-aviation-navy font-bold text-xl shadow-[0_0_15px_rgba(0,180,216,0.4)]">
            F
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-aviation-cyan dark:from-white dark:to-aviation-cyan light:from-aviation-navy light:to-aviation-royal">
              FPPS
            </h1>
            <span className="text-[10px] uppercase font-mono text-aviation-sky block tracking-widest mt-0.5">
              Aero Intelligence
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-aviation-sky/15 text-aviation-sky border-l-4 border-aviation-sky glow-border' 
                    : theme === 'dark'
                      ? 'text-gray-400 hover:bg-aviation-dark/40 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-aviation-sky' : 'text-gray-400'}`} />
                {item.label}
              </button>
            );
          })}

          {/* Admin Portal Tab (conditional) */}
          {user?.is_admin && (
            <button
              onClick={() => handleNav('admin')}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${currentView === 'admin' 
                  ? 'bg-purple-500/10 text-purple-400 border-l-4 border-purple-500' 
                  : theme === 'dark'
                    ? 'text-gray-400 hover:bg-aviation-dark/40 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
              `}
            >
              <ShieldCheck className={`w-4 h-4 ${currentView === 'admin' ? 'text-purple-400' : 'text-gray-400'}`} />
              Admin Portal
            </button>
          )}
        </nav>

        {/* Theme Toggle & Logout */}
        <div className="p-4 border-t border-aviation-royal/10 space-y-2">
          {/* Theme Selector */}
          <button
            onClick={toggleTheme}
            className={`
              w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200
              ${theme === 'dark' 
                ? 'bg-aviation-dark/60 text-aviation-cyan hover:bg-aviation-dark' 
                : 'bg-gray-100 text-aviation-royal hover:bg-gray-200'}
            `}
          >
            <span className="flex items-center gap-2">
              {theme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-aviation-sky/10 uppercase tracking-widest text-aviation-sky">
              ACTIVE
            </span>
          </button>

          {/* Log in / Log out */}
          {user ? (
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out Session
            </button>
          ) : (
            <button
              onClick={() => handleNav('profile')}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-aviation-cyan hover:bg-aviation-sky/10 transition-all duration-200"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In / Register
            </button>
          )}
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
        />
      )}
    </>
  );
};
