import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Wallet, PlaneTakeoff, ShieldCheck, Compass, Sparkles, MapPin } from 'lucide-react';
import axios from 'axios';

export const BudgetPlanner: React.FC = () => {
  const { theme, apiUrl, addNotification } = useApp();
  const [budget, setBudget] = useState('8000');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handlePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const budgetNum = parseFloat(budget);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      addNotification("Input Error", "Please provide a valid budget amount.", "warning");
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const response = await axios.post(`${apiUrl}/api/planner/budget`, { budget: budgetNum });
      setResults(response.data);
      if (response.data.length > 0) {
        addNotification("Itineraries Suggested", `Found ${response.data.length} travel opportunities matching budget limits.`, "success");
      } else {
        addNotification("Budget Limit Too Low", "No domestic routes found matching your budget threshold. Try raising it.", "warning");
      }
    } catch (err) {
      addNotification("Plan Timeout", "Error connecting to budget suggestions engine.", "alert");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6 py-4 px-4 max-w-5xl mx-auto text-left">
      
      {/* Intro Card */}
      <div className={`
        p-6 rounded-3xl border backdrop-blur-md
        ${theme === 'dark' 
          ? 'bg-aviation-navy-darker/60 border-aviation-royal/15 text-white' 
          : 'bg-white border-gray-200 text-gray-800'}
      `}>
        <div className="flex items-center gap-3 mb-4 text-aviation-sky">
          <Wallet className="w-6 h-6" />
          <div>
            <h3 className="text-base font-bold text-white">Smart Travel Budget Planner</h3>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono mt-0.5">Telemetry routing by cost ceiling</p>
          </div>
        </div>

        <form onSubmit={handlePlan} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] text-gray-400 uppercase tracking-widest font-mono block mb-1">Target Budget Limit (₹)</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. 10000"
              className={`
                w-full px-4 py-2.5 rounded-xl text-xs outline-none border transition-colors
                ${theme === 'dark' 
                  ? 'bg-aviation-navy border-aviation-royal/20 text-white focus:border-aviation-sky' 
                  : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-aviation-sky'}
              `}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-aviation-sky to-aviation-cyan text-aviation-navy font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:opacity-90 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,180,216,0.3)]"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-aviation-navy border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Suggest Deals
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((r, idx) => (
          <div 
            key={idx}
            className={`
              p-5 rounded-2xl border flex flex-col justify-between hover:border-aviation-sky/40 transition-all duration-300
              ${theme === 'dark' 
                ? 'bg-aviation-navy-darker/60 border-aviation-royal/15 text-white' 
                : 'bg-white border-gray-200 text-gray-800'}
            `}
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-aviation-sky" />
                  <span className="text-sm font-bold text-white">{r.destination_name} ({r.destination})</span>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded bg-aviation-sky/15 text-aviation-sky font-mono uppercase tracking-wider">
                  {r.trip_type}
                </span>
              </div>

              <div className="space-y-2 text-xs py-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Preferred Carrier:</span>
                  <span className="font-semibold text-white">{r.airline}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">One-way cost:</span>
                  <span className="font-semibold text-white">₹{r.one_way_cost.toLocaleString()}</span>
                </div>
                {r.return_cost && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Return cost:</span>
                    <span className="font-semibold text-white">₹{r.return_cost.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Recommended window:</span>
                  <span className="text-aviation-cyan font-bold">{r.recommended_dates}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-aviation-royal/10 flex justify-between items-center">
              <span className="text-[10px] text-gray-400 uppercase font-mono">Total Estimated</span>
              <span className="text-lg font-black text-white">₹{r.total_estimated.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {results.length === 0 && !loading && (
        <div className="p-12 text-center border border-dashed border-aviation-royal/20 rounded-3xl bg-aviation-dark/5 space-y-3">
          <div className="w-10 h-10 rounded-full bg-aviation-sky/15 flex items-center justify-center text-aviation-sky mx-auto">
            <Compass className="w-5 h-5" />
          </div>
          <div className="max-w-md mx-auto">
            <h4 className="text-xs font-bold text-white">No suggested routes loaded</h4>
            <p className="text-[11px] text-gray-400 mt-1">
              Provide a budget target above and click "Suggest Deals" to evaluate viable flights.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
