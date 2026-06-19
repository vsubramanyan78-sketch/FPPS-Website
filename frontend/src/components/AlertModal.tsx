import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Bell, ShieldAlert, Sparkles } from 'lucide-react';
import axios from 'axios';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: string;
  destination: string;
  currentPrice?: number;
}

export const AlertModal: React.FC<AlertModalProps> = ({ isOpen, onClose, source, destination, currentPrice }) => {
  const { token, addNotification, theme, apiUrl } = useApp();
  const [thresholdPrice, setThresholdPrice] = useState(
    currentPrice ? Math.floor(currentPrice * 0.9).toString() : '5000'
  );
  const [notifType, setNotifType] = useState('drop');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      addNotification("Auth Required", "Please log in to register price alerts.", "warning");
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(`${apiUrl}/api/alerts`, {
        source,
        destination,
        threshold_price: parseFloat(thresholdPrice),
        notification_type: notifType
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addNotification("Price Alert Set", `We'll monitor flights from ${source} to ${destination} and alert you.`, "success");
      onClose();
    } catch (err) {
      addNotification("Failed to set alert", "Could not process request. Please try again.", "warning");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`
        relative w-full max-w-md rounded-2xl shadow-2xl border p-6 overflow-hidden
        ${theme === 'dark' 
          ? 'bg-aviation-navy border-aviation-royal/20 text-white' 
          : 'bg-white border-gray-200 text-gray-800'}
      `}>
        {/* Animated Background Gradients */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-aviation-sky/10 rounded-full filter blur-xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-aviation-sky/20 rounded-xl text-aviation-sky">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Configure Alert Feed</h3>
              <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider">Aero pricing monitor</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-aviation-royal/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4 p-3.5 bg-aviation-dark/20 rounded-xl border border-aviation-royal/10 text-xs">
            <div>
              <span className="text-[10px] text-gray-400 block uppercase tracking-wide">Departure</span>
              <span className="font-bold text-sm text-aviation-sky">{source}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block uppercase tracking-wide">Arrival</span>
              <span className="font-bold text-sm text-aviation-cyan">{destination}</span>
            </div>
          </div>

          {currentPrice && (
            <div className="text-xs text-gray-400 flex justify-between items-center px-1">
              <span>Current Fare Benchmark:</span>
              <span className="font-bold text-white">₹{currentPrice.toLocaleString()}</span>
            </div>
          )}

          <div>
            <label className="text-[10px] text-gray-400 uppercase tracking-wide block mb-1">
              Notify me when fare drops below (₹)
            </label>
            <input
              type="number"
              value={thresholdPrice}
              onChange={(e) => setThresholdPrice(e.target.value)}
              className={`
                w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition-colors
                ${theme === 'dark' 
                  ? 'bg-aviation-navy border-aviation-royal/20 text-white focus:border-aviation-sky' 
                  : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-aviation-sky'}
              `}
              required
            />
          </div>

          <div>
            <label className="text-[10px] text-gray-400 uppercase tracking-wide block mb-1">
              Condition Trigger
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setNotifType('drop')}
                className={`
                  py-2 px-3 rounded-xl text-xs font-semibold border transition-all duration-200
                  ${notifType === 'drop'
                    ? 'bg-aviation-sky/15 border-aviation-sky text-aviation-sky'
                    : 'bg-transparent border-aviation-royal/10 text-gray-400'}
                `}
              >
                Price Drop
              </button>
              <button
                type="button"
                onClick={() => setNotifType('threshold')}
                className={`
                  py-2 px-3 rounded-xl text-xs font-semibold border transition-all duration-200
                  ${notifType === 'threshold'
                    ? 'bg-aviation-sky/15 border-aviation-sky text-aviation-sky'
                    : 'bg-transparent border-aviation-royal/10 text-gray-400'}
                `}
              >
                Exact Target
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-aviation-sky to-aviation-cyan text-aviation-navy font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,180,216,0.3)]"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? "Registering Alert..." : "Enable Pricing Watch"}
          </button>
        </form>
      </div>
    </div>
  );
};
