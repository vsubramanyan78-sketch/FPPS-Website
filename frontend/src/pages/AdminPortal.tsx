import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, ShieldAlert, Cpu, Database, Activity, RefreshCw, Layers } from 'lucide-react';
import axios from 'axios';

export const AdminPortal: React.FC = () => {
  const { token, theme, apiUrl, addNotification } = useApp();
  const [health, setHealth] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [retraining, setRetraining] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const healthRes = await axios.get(`${apiUrl}/api/admin/health`, { headers });
      setHealth(healthRes.data);

      const logsRes = await axios.get(`${apiUrl}/api/admin/predictions`, { headers });
      setLogs(logsRes.data);

      const usersRes = await axios.get(`${apiUrl}/api/admin/users`, { headers });
      setUsersList(usersRes.data);

    } catch (err) {
      addNotification("Admin Forbidden", "Failed to load management telemetry. Ensure administrative token is active.", "alert");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const handleRetrain = async () => {
    setRetraining(true);
    try {
      await axios.post(`${apiUrl}/api/admin/retrain`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addNotification("Model Trained", "Machine Learning models successfully re-compiled. Weights synchronized.", "success");
      fetchAdminData(); // refresh health logs
    } catch (err) {
      addNotification("Training Failure", "Could not complete ML retraining protocol.", "alert");
    } finally {
      setRetraining(false);
    }
  };

  if (!token) {
    return (
      <div className="w-full max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-white">Administrative Lock</h3>
        <p className="text-xs text-gray-400">
          Admin portal is restricted. Please sign in with an account containing admin level credentials.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12 text-xs text-gray-400 font-mono">
        Connecting to system telemetry...
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 py-4 px-4 max-w-7xl mx-auto text-left">
      
      {/* Diagnostic grid */}
      {health && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Health Status */}
          <div className="p-4 rounded-2xl bg-aviation-navy-darker/60 border border-aviation-royal/15 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/15 rounded-xl text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[9px] text-gray-400 uppercase tracking-widest font-mono block">System Integrity</span>
              <span className="text-sm font-bold text-white">{health.status} (100% OTP)</span>
            </div>
          </div>

          {/* CPU usage */}
          <div className="p-4 rounded-2xl bg-aviation-navy-darker/60 border border-aviation-royal/15 flex items-center gap-4">
            <div className="p-3 bg-aviation-sky/15 rounded-xl text-aviation-sky">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[9px] text-gray-400 uppercase tracking-widest font-mono block">CPU Usage</span>
              <span className="text-sm font-bold text-white">{health.cpu_usage_percent}% load factor</span>
            </div>
          </div>

          {/* Database stats */}
          <div className="p-4 rounded-2xl bg-aviation-navy-darker/60 border border-aviation-royal/15 flex items-center gap-4">
            <div className="p-3 bg-indigo-500/15 rounded-xl text-indigo-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[9px] text-gray-400 uppercase tracking-widest font-mono block">Relational DBMS</span>
              <span className="text-sm font-bold text-white">{health.database_status}</span>
            </div>
          </div>

          {/* Cache Status */}
          <div className="p-4 rounded-2xl bg-aviation-navy-darker/60 border border-aviation-royal/15 flex items-center gap-4">
            <div className="p-3 bg-pink-500/15 rounded-xl text-pink-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[9px] text-gray-400 uppercase tracking-widest font-mono block">Caching Layer</span>
              <span className="text-sm font-bold text-white">Simulated Redis</span>
            </div>
          </div>

        </div>
      )}

      {/* Model Retraining & Admin Panel */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* ML model retraining panel */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-aviation-navy-darker/60 border border-aviation-royal/15 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-aviation-sky mb-2">
              <Activity className="w-5 h-5" />
              <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-white">Machine Learning Telemetry</h3>
            </div>
            <p className="text-xs text-gray-400 leading-normal">
              Fit regressors on local logs database. Retraining compiles base parameters including carrier weights, weather adjustments, and distance values.
            </p>
          </div>

          <div className="p-3 bg-aviation-dark/30 rounded-xl space-y-2 text-xs font-mono border border-aviation-royal/5">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Users:</span>
              <span className="text-white font-bold">{health?.statistics.total_registered_users}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Alerts:</span>
              <span className="text-white font-bold">{health?.statistics.total_active_alerts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Predictions:</span>
              <span className="text-white font-bold">{health?.statistics.total_predictions_logged}</span>
            </div>
          </div>

          <button
            onClick={handleRetrain}
            disabled={retraining}
            className="w-full py-2.5 rounded-xl bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:opacity-90 transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]"
          >
            <RefreshCw className={`w-4 h-4 ${retraining ? 'animate-spin' : ''}`} />
            {retraining ? "Fitting Models..." : "Force Model Retrain"}
          </button>
        </div>

        {/* Users Management Grid */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-aviation-navy-darker/60 border border-aviation-royal/15 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Registered Analyst Accounts</h3>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono mt-0.5">Authorized logins details</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse text-gray-300">
              <thead>
                <tr className="border-b border-aviation-royal/10 text-gray-400 font-mono text-[10px] uppercase">
                  <th className="py-2.5 pr-4">Full Name</th>
                  <th className="py-2.5 pr-4">Email</th>
                  <th className="py-2.5 pr-4">Security Tier</th>
                  <th className="py-2.5">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-aviation-royal/5">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-aviation-dark/15">
                    <td className="py-3 pr-4 font-bold text-white">{u.fullname}</td>
                    <td className="py-3 pr-4 font-mono">{u.email}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${u.is_admin ? 'bg-purple-500/20 text-purple-400' : 'bg-aviation-sky/15 text-aviation-sky'}`}>
                        {u.is_admin ? 'ADMIN' : 'USER'}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-[10px]">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Logs Details */}
      <div className="p-6 rounded-2xl bg-aviation-navy-darker/60 border border-aviation-royal/15 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white">ML Prediction Query Logs</h3>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono mt-0.5">Real-time prediction triggers logs</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse text-gray-300">
            <thead>
              <tr className="border-b border-aviation-royal/10 text-gray-400 font-mono text-[10px] uppercase">
                <th className="py-2.5 pr-4">Log ID</th>
                <th className="py-2.5 pr-4">Corridor</th>
                <th className="py-2.5 pr-4">Carrier</th>
                <th className="py-2.5 pr-4">Fare</th>
                <th className="py-2.5 pr-4">Delay Risk</th>
                <th className="py-2.5">Time Log</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-aviation-royal/5">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-aviation-dark/15">
                  <td className="py-3 pr-4 font-mono text-gray-500">#{log.id}</td>
                  <td className="py-3 pr-4 font-bold text-white">{log.source} ➔ {log.destination}</td>
                  <td className="py-3 pr-4">{log.airline} ({log.cabin_class})</td>
                  <td className="py-3 pr-4 font-mono font-bold text-aviation-sky">₹{log.predicted_price.toLocaleString()}</td>
                  <td className="py-3 pr-4 font-mono">{(log.delay_probability * 100).toFixed(0)}%</td>
                  <td className="py-3 font-mono text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</td>
                </tr>
              ))}

              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 font-mono">
                    No prediction outputs registered in current session logs.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
