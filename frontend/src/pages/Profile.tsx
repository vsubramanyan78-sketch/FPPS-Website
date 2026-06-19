import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, ShieldAlert, Key, Clipboard, Check, Clock, Settings, Heart } from 'lucide-react';
import axios from 'axios';

export const Profile: React.FC = () => {
  const { user, token, theme, apiUrl, addNotification } = useApp();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Pref States
  const [currency, setCurrency] = useState('INR');
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [favAirline, setFavAirline] = useState('Vistara');

  // Key Generator State
  const [devKey, setDevKey] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchHistory = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/api/profile/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(response.data);
    } catch (err) {
      addNotification("Aero Error", "Failed to retrieve flight search history logs.", "warning");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [token]);

  const generateApiKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = 'fpps_pk_live_';
    for (let i = 0; i < 28; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setDevKey(key);
    addNotification("Key Provisioned", "New developer credential key generated.", "success");
  };

  const copyToClipboard = () => {
    if (!devKey) return;
    navigator.clipboard.writeText(devKey);
    setCopied(true);
    addNotification("Copied", "API credential key copied to clipboard.", "info");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!token) {
    return (
      <div className="w-full max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-aviation-sky/10 flex items-center justify-center text-aviation-sky mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-white">Authentication Required</h3>
        <p className="text-xs text-gray-400">
          You must be logged in with a validated profile to review settings, search logs, and developer integrations.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 py-4 px-4 max-w-7xl mx-auto text-left">
      
      {/* Account Info and Preferences Card */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Profile Card */}
        <div className={`
          lg:col-span-5 p-6 rounded-3xl border flex flex-col justify-between space-y-6
          ${theme === 'dark' 
            ? 'bg-aviation-navy-darker/60 border-aviation-royal/15 text-white' 
            : 'bg-white border-gray-200 text-gray-800'}
        `}>
          <div>
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-aviation-sky/20 flex items-center justify-center text-lg font-bold text-aviation-sky uppercase">
                {user ? user.fullname.substring(0, 2) : 'AN'}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{user?.fullname}</h3>
                <span className="text-[9px] text-gray-400 font-mono block mt-0.5">{user?.email}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-aviation-royal/5">
                <span className="text-gray-400">User ID Tag:</span>
                <span className="font-mono text-white">#{user?.id}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-aviation-royal/5">
                <span className="text-gray-400">Account Access:</span>
                <span className="font-bold text-aviation-sky">{user?.is_admin ? "Administrator Access" : "Standard Client"}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-400">Telemetry Status:</span>
                <span className="text-emerald-400 font-bold">Online</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-aviation-royal/10 text-center">
            <span className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Flight Price Prediction System (FPPS)</span>
          </div>
        </div>

        {/* Preferences Settings */}
        <div className={`
          lg:col-span-7 p-6 rounded-3xl border space-y-4
          ${theme === 'dark' 
            ? 'bg-aviation-navy-darker/60 border-aviation-royal/15 text-white' 
            : 'bg-white border-gray-200 text-gray-800'}
        `}>
          <div className="flex items-center gap-2 text-aviation-sky mb-2">
            <Settings className="w-5 h-5" />
            <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-white">Analyst Preferences</h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-widest font-mono block mb-1">Standard Currency</label>
              <select 
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={`
                  w-full px-3 py-2 rounded-xl text-xs outline-none border transition-colors cursor-pointer
                  ${theme === 'dark' 
                    ? 'bg-aviation-navy border-aviation-royal/20 text-white focus:border-aviation-sky' 
                    : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-aviation-sky'}
                `}
              >
                <option value="INR">₹ INR (Indian Rupee)</option>
                <option value="USD">$ USD (US Dollar)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-widest font-mono block mb-1">Preferred Carrier Agency</label>
              <select 
                value={favAirline}
                onChange={(e) => setFavAirline(e.target.value)}
                className={`
                  w-full px-3 py-2 rounded-xl text-xs outline-none border transition-colors cursor-pointer
                  ${theme === 'dark' 
                    ? 'bg-aviation-navy border-aviation-royal/20 text-white focus:border-aviation-sky' 
                    : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-aviation-sky'}
                `}
              >
                <option value="Vistara">Vistara</option>
                <option value="Air India">Air India</option>
                <option value="IndiGo">IndiGo</option>
                <option value="SpiceJet">SpiceJet</option>
                <option value="Akasa Air">Akasa Air</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="notif_check"
              checked={notifEnabled}
              onChange={(e) => setNotifEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-aviation-royal/20 text-aviation-sky bg-aviation-navy focus:ring-0"
            />
            <label htmlFor="notif_check" className="text-xs text-gray-300 cursor-pointer">
              Enable price drops sound & toast notifications (simulated)
            </label>
          </div>
        </div>

      </div>

      {/* Developer API panel */}
      <div className={`
        p-6 rounded-3xl border space-y-4
        ${theme === 'dark' 
          ? 'bg-aviation-navy-darker/60 border-aviation-royal/15 text-white' 
          : 'bg-white border-gray-200 text-gray-800'}
      `}>
        <div className="flex items-center gap-2 text-aviation-sky mb-2">
          <Key className="w-5 h-5" />
          <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-white">Developer API Key</h3>
        </div>

        <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
          Create live API connection keys to query FPPS price predictions and delay risks from external command lines or enterprise servers.
        </p>

        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={generateApiKey}
            className="px-5 py-2.5 rounded-xl bg-aviation-sky text-aviation-navy font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:opacity-90 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,180,216,0.3)]"
          >
            Provision Key
          </button>

          {devKey && (
            <div className="flex-1 min-w-[280px] flex items-center bg-aviation-dark/40 rounded-xl px-3 py-2 border border-aviation-royal/20 justify-between">
              <span className="font-mono text-xs text-aviation-cyan truncate select-all">{devKey}</span>
              <button 
                onClick={copyToClipboard}
                className="p-1 rounded text-gray-400 hover:text-white hover:bg-aviation-royal/20 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Clipboard className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search History Logs */}
      <div className={`
        p-6 rounded-3xl border space-y-4
        ${theme === 'dark' 
          ? 'bg-aviation-navy-darker/60 border-aviation-royal/15 text-white' 
          : 'bg-white border-gray-200 text-gray-800'}
      `}>
        <div className="flex items-center gap-2 text-aviation-sky mb-2">
          <Clock className="w-5 h-5" />
          <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-white">Your Forecast Query History</h3>
        </div>

        {loading ? (
          <div className="text-xs font-mono text-gray-500 text-center py-4">Querying search history...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse text-gray-300">
              <thead>
                <tr className="border-b border-aviation-royal/10 text-gray-400 font-mono text-[10px] uppercase">
                  <th className="py-2.5 pr-4">Corridor</th>
                  <th className="py-2.5 pr-4">Cabin Class</th>
                  <th className="py-2.5 pr-4">Target Date</th>
                  <th className="py-2.5">Queried At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-aviation-royal/5">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-aviation-dark/15">
                    <td className="py-3 pr-4 font-bold text-white">{h.source} ➔ {h.destination}</td>
                    <td className="py-3 pr-4">{h.cabin_class}</td>
                    <td className="py-3 pr-4 font-mono">{h.departure_date}</td>
                    <td className="py-3 font-mono text-[10px]">{new Date(h.timestamp).toLocaleString()}</td>
                  </tr>
                ))}

                {history.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-500 font-mono">
                      No search logs registered under your profile.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
