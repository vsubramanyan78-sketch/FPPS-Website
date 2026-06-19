import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Trash2, CheckCircle2, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

interface NavbarProps {
  title: string;
}

export const Navbar: React.FC<NavbarProps> = ({ title }) => {
  const { user, notifications, removeNotification, clearNotifications, theme } = useApp();
  const [showDropdown, setShowDropdown] = useState(false);

  const getIcon = (type: string) => {
    switch(type) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'alert': return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      default: return <Info className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <header className={`
      relative z-30 flex items-center justify-between p-4 sm:p-6 border-b transition-colors duration-200
      ${theme === 'dark' 
        ? 'bg-aviation-navy/40 border-aviation-royal/10 text-white' 
        : 'bg-white/40 border-gray-200 text-gray-800'}
      backdrop-blur-md
    `}>
      {/* Title */}
      <div className="pl-12 lg:pl-0">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-aviation-sky to-aviation-cyan dark:from-white dark:to-aviation-cyan light:from-aviation-navy light:to-aviation-royal">
          {title}
        </h2>
      </div>

      {/* Utilities */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`
              relative p-2 rounded-xl border transition-all duration-200
              ${theme === 'dark' 
                ? 'border-aviation-royal/20 bg-aviation-dark/30 text-gray-300 hover:text-white hover:bg-aviation-dark/60' 
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
            `}
          >
            <Bell className="w-4.5 h-4.5" />
            {notifications.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white animate-pulse">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showDropdown && (
            <div className={`
              absolute right-0 mt-3 w-80 rounded-2xl shadow-2xl border overflow-hidden z-50
              ${theme === 'dark' 
                ? 'bg-aviation-navy border-aviation-royal/20 text-white' 
                : 'bg-white border-gray-200 text-gray-800'}
            `}>
              <div className="p-4 border-b border-aviation-royal/10 flex items-center justify-between">
                <span className="font-semibold text-xs uppercase tracking-wider text-aviation-sky">Alert Feed</span>
                {notifications.length > 0 && (
                  <button 
                    onClick={clearNotifications}
                    className="text-[10px] text-gray-400 hover:text-rose-400 flex items-center gap-1"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-aviation-royal/10">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-500">
                    No active warnings or flight alerts.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="p-4 hover:bg-aviation-dark/20 flex gap-3 items-start justify-between">
                      <div className="flex gap-2.5 items-start">
                        <div className="mt-0.5">{getIcon(notif.type)}</div>
                        <div>
                          <div className="text-xs font-bold">{notif.title}</div>
                          <div className="text-[11px] text-gray-400 mt-0.5 leading-normal">{notif.message}</div>
                          <span className="text-[9px] font-mono text-aviation-sky mt-1 block">{notif.timestamp}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeNotification(notif.id)}
                        className="text-gray-500 hover:text-rose-400 p-0.5 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Card */}
        <div className={`
          flex items-center gap-2.5 px-3 py-1.5 rounded-xl border
          ${theme === 'dark' 
            ? 'border-aviation-royal/20 bg-aviation-dark/30' 
            : 'border-gray-200 bg-gray-50'}
        `}>
          <div className="w-7 h-7 rounded-lg bg-aviation-sky/20 flex items-center justify-center text-xs font-bold text-aviation-cyan uppercase">
            {user ? user.fullname.substring(0, 2) : 'A'}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold truncate max-w-24">
              {user ? user.fullname : 'Anonymous'}
            </div>
            <div className="text-[9px] font-mono text-aviation-sky">
              {user?.is_admin ? 'ADMIN ACCESS' : 'STANDARD CLIENT'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
