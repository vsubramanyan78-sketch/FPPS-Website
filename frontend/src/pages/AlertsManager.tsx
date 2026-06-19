import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Trash2, ShieldAlert, Sparkles, CheckCircle } from 'lucide-react';
import axios from 'axios';

export const AlertsManager: React.FC = () => {
  const { token, theme, apiUrl, addNotification } = useApp();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/api/alerts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(response.data);
    } catch (err) {
      addNotification("Aero Error", "Failed to retrieve active price alerts from server.", "warning");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [token]);

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${apiUrl}/api/alerts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(prev => prev.filter(a => a.id !== id));
      addNotification("Alert Decommissioned", "Carrier price monitor successfully deactivated.", "success");
    } catch (err) {
      addNotification("Aero Error", "Could not deactivate pricing alert.", "alert");
    }
  };

  if (!token) {
    return (
      <div className="w-full max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-aviation-sky/10 flex items-center justify-center text-aviation-sky mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-white">Credentials Required</h3>
        <p className="text-xs text-gray-400">
          You must be logged in with a validated profile to register and oversee price alerts.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 py-4 px-4 max-w-5xl mx-auto text-left">
      
      {/* Intro details */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-white">Registered Price Monitors</h3>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono mt-0.5">Active triggers on airline databases</p>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-aviation-sky/15 text-aviation-sky font-mono font-bold uppercase tracking-wider">
          {alerts.length} Active Feeds
        </span>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-gray-400 font-mono">
          Querying monitors...
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {alerts.map((a) => (
            <div 
              key={a.id}
              className={`
                p-5 rounded-2xl border flex items-center justify-between hover:border-aviation-sky/35 transition-all
                ${theme === 'dark' 
                  ? 'bg-aviation-navy-darker/60 border-aviation-royal/15 text-white' 
                  : 'bg-white border-gray-200 text-gray-800'}
              `}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <span>{a.source}</span>
                  <span className="text-aviation-sky">➔</span>
                  <span>{a.destination}</span>
                </div>
                <div className="text-xs text-gray-400">
                  Target Fare: <span className="font-bold text-white">₹{a.threshold_price.toLocaleString()}</span>
                </div>
                <div className="text-[9px] text-emerald-400 font-mono flex items-center gap-1 mt-1">
                  <CheckCircle className="w-3 h-3" />
                  Active - Monitoring carrier queues
                </div>
              </div>

              <button
                onClick={() => handleDelete(a.id)}
                className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/15 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {alerts.length === 0 && (
            <div className="col-span-2 p-12 text-center border border-dashed border-aviation-royal/20 rounded-3xl bg-aviation-dark/5 space-y-3">
              <div className="w-10 h-10 rounded-full bg-aviation-sky/15 flex items-center justify-center text-aviation-sky mx-auto">
                <Bell className="w-5 h-5" />
              </div>
              <div className="max-w-md mx-auto">
                <h4 className="text-xs font-bold text-white font-sans">No alerts active</h4>
                <p className="text-[11px] text-gray-400 mt-1">
                  To create alerts, search for a corridor on the Forecast tab and click "Watch Route".
                </p>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
