import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  SlidersHorizontal, 
  TrendingUp, 
  TrendingDown, 
  HelpCircle, 
  Leaf, 
  Clock, 
  Percent, 
  Check, 
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

export const SearchPage: React.FC = () => {
  const { theme, apiUrl, addNotification } = useApp();
  
  // Form State
  const [source, setSource] = useState('DEL');
  const [destination, setDestination] = useState('BOM');
  const [departureDate, setDepartureDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState('Economy');
  const [airline, setAirline] = useState('IndiGo');
  const [stops, setStops] = useState(0);

  // Advanced Filters State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [directOnly, setDirectOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(15000);
  const [depTime, setDepTime] = useState('any'); // any, morning, afternoon, evening

  // Results State
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  const [comparisons, setComparisons] = useState<any[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (source === destination) {
      addNotification("Input Error", "Source and Destination airports cannot match.", "warning");
      return;
    }

    setLoading(true);
    setPrediction(null);
    setComparisons([]);

    try {
      // Calculate days to departure
      const depDate = new Date(departureDate);
      const today = new Date();
      const diffTime = Math.abs(depDate.getTime() - today.getTime());
      const daysToDeparture = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      const departureMonth = depDate.getMonth() + 1;

      // 1. Post to Single Flight Prediction
      const predRes = await axios.post(`${apiUrl}/api/predict/flight`, {
        source,
        destination,
        departure_date: departureDate,
        airline,
        cabin_class: cabinClass,
        stops: parseInt(stops.toString()),
        days_to_departure: daysToDeparture,
        weather_index: 0.1, // simulated base weather
        is_holiday: [5, 6, 11, 12].includes(departureMonth), // simulate holidays in peak months
        demand_score: 0.5
      });
      setPrediction(predRes.data);

      // 2. Post to Airline Comparison
      const compRes = await axios.post(`${apiUrl}/api/predict/compare`, {
        source,
        destination,
        departure_date: departureDate,
        return_date: returnDate || null,
        passengers,
        cabin_class: cabinClass,
        airline
      });
      
      // Apply client-side advanced filters
      let filteredComps = compRes.data;
      if (directOnly) {
        // simulation assumption: 0 stops
        filteredComps = filteredComps.filter((c: any) => c.duration.includes('h'));
      }
      filteredComps = filteredComps.filter((c: any) => c.current_fare <= maxPrice);
      
      setComparisons(filteredComps);
      addNotification("Forecast Loaded", `Retrieved airline price logs for ${source} ➔ ${destination}.`, "success");

    } catch (err) {
      addNotification("Aero Error", "Operational error loading carrier comparison feeds.", "alert");
    } finally {
      setLoading(false);
    }
  };

  const getRecColor = (rec: string) => {
    switch (rec) {
      case 'BOOK NOW': return 'text-rose-400 bg-rose-500/10 border-rose-500/25';
      case 'WAIT': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25';
      default: return 'text-amber-400 bg-amber-500/10 border-amber-500/25';
    }
  };

  return (
    <div className="w-full space-y-6 py-4 px-4 max-w-7xl mx-auto text-left">
      
      {/* Search Module Card */}
      <div className={`
        p-6 rounded-3xl border transition-all duration-300
        ${theme === 'dark' 
          ? 'bg-aviation-navy-darker/60 border-aviation-royal/15 text-white' 
          : 'bg-white border-gray-200 text-gray-800'}
        backdrop-blur-md
      `}>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Source */}
            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-widest font-mono block mb-1">Departure Hub</label>
              <select 
                value={source} 
                onChange={(e) => setSource(e.target.value)}
                className={`
                  w-full px-3.5 py-2.5 rounded-xl text-xs outline-none border transition-colors cursor-pointer
                  ${theme === 'dark' 
                    ? 'bg-aviation-navy border-aviation-royal/20 text-white focus:border-aviation-sky' 
                    : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-aviation-sky'}
                `}
              >
                <option value="DEL">DEL - Indira Gandhi, Delhi</option>
                <option value="BOM">BOM - CSM, Mumbai</option>
                <option value="BLR">BLR - Kempegowda, Bengaluru</option>
                <option value="HYD">HYD - Rajiv Gandhi, Hyderabad</option>
                <option value="CCU">CCU - Netaji Bose, Kolkata</option>
              </select>
            </div>

            {/* Destination */}
            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-widest font-mono block mb-1">Arrival Hub</label>
              <select 
                value={destination} 
                onChange={(e) => setDestination(e.target.value)}
                className={`
                  w-full px-3.5 py-2.5 rounded-xl text-xs outline-none border transition-colors cursor-pointer
                  ${theme === 'dark' 
                    ? 'bg-aviation-navy border-aviation-royal/20 text-white focus:border-aviation-sky' 
                    : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-aviation-sky'}
                `}
              >
                <option value="BOM">BOM - CSM, Mumbai</option>
                <option value="DEL">DEL - Indira Gandhi, Delhi</option>
                <option value="BLR">BLR - Kempegowda, Bengaluru</option>
                <option value="HYD">HYD - Rajiv Gandhi, Hyderabad</option>
                <option value="CCU">CCU - Netaji Bose, Kolkata</option>
              </select>
            </div>

            {/* Departure date */}
            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-widest font-mono block mb-1">Departure Date</label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className={`
                  w-full px-3.5 py-2.5 rounded-xl text-xs outline-none border transition-colors cursor-pointer
                  ${theme === 'dark' 
                    ? 'bg-aviation-navy border-aviation-royal/20 text-white focus:border-aviation-sky' 
                    : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-aviation-sky'}
                `}
                required
              />
            </div>

            {/* Cabin Class */}
            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-widest font-mono block mb-1">Cabin Class</label>
              <select 
                value={cabinClass} 
                onChange={(e) => setCabinClass(e.target.value)}
                className={`
                  w-full px-3.5 py-2.5 rounded-xl text-xs outline-none border transition-colors cursor-pointer
                  ${theme === 'dark' 
                    ? 'bg-aviation-navy border-aviation-royal/20 text-white focus:border-aviation-sky' 
                    : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-aviation-sky'}
                `}
              >
                <option value="Economy">Economy</option>
                <option value="Premium Economy">Premium Economy</option>
                <option value="Business">Business</option>
                <option value="First">First</option>
              </select>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Preferred Airline */}
            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-widest font-mono block mb-1">Carrier Agency</label>
              <select 
                value={airline} 
                onChange={(e) => setAirline(e.target.value)}
                className={`
                  w-full px-3.5 py-2.5 rounded-xl text-xs outline-none border transition-colors cursor-pointer
                  ${theme === 'dark' 
                    ? 'bg-aviation-navy border-aviation-royal/20 text-white focus:border-aviation-sky' 
                    : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-aviation-sky'}
                `}
              >
                <option value="IndiGo">IndiGo</option>
                <option value="Vistara">Vistara</option>
                <option value="Air India">Air India</option>
                <option value="SpiceJet">SpiceJet</option>
                <option value="Akasa Air">Akasa Air</option>
              </select>
            </div>

            {/* Stops */}
            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-widest font-mono block mb-1">Layover Stops</label>
              <select 
                value={stops} 
                onChange={(e) => setStops(parseInt(e.target.value))}
                className={`
                  w-full px-3.5 py-2.5 rounded-xl text-xs outline-none border transition-colors cursor-pointer
                  ${theme === 'dark' 
                    ? 'bg-aviation-navy border-aviation-royal/20 text-white focus:border-aviation-sky' 
                    : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-aviation-sky'}
                `}
              >
                <option value="0">Direct Flights Only</option>
                <option value="1">1 Stop max</option>
                <option value="2">2+ Stops</option>
              </select>
            </div>

            {/* Passengers */}
            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-widest font-mono block mb-1">Passengers</label>
              <input
                type="number"
                min={1}
                max={9}
                value={passengers}
                onChange={(e) => setPassengers(parseInt(e.target.value))}
                className={`
                  w-full px-3.5 py-2.5 rounded-xl text-xs outline-none border transition-colors
                  ${theme === 'dark' 
                    ? 'bg-aviation-navy border-aviation-royal/20 text-white focus:border-aviation-sky' 
                    : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-aviation-sky'}
                `}
              />
            </div>

            {/* Submit & Filter Toggles */}
            <div className="flex gap-2 items-end">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`
                  p-2.5 rounded-xl border flex items-center justify-center transition-colors
                  ${theme === 'dark' 
                    ? 'border-aviation-royal/25 hover:bg-aviation-royal/10 text-gray-300' 
                    : 'border-gray-200 hover:bg-gray-100 text-gray-600'}
                `}
              >
                <SlidersHorizontal className="w-5.5 h-5.5" />
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-aviation-sky to-aviation-cyan text-aviation-navy font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:opacity-90 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,180,216,0.3)]"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-aviation-navy border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Forecast Fares
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Advanced Filters Drawer */}
          {showAdvanced && (
            <div className="p-4 rounded-2xl border border-aviation-royal/10 bg-aviation-dark/15 grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse-slow">
              <div>
                <label className="text-[10px] text-gray-400 uppercase tracking-widest font-mono block mb-1">Max Budget (₹{maxPrice.toLocaleString()})</label>
                <input
                  type="range"
                  min={2000}
                  max={30000}
                  step={500}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full accent-aviation-sky"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 uppercase tracking-widest font-mono block mb-1">Preferred Departure Time</label>
                <div className="flex gap-1.5">
                  {['any', 'morning', 'afternoon', 'evening'].map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setDepTime(time)}
                      className={`
                        flex-1 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-colors
                        ${depTime === time 
                          ? 'bg-aviation-sky/15 border-aviation-sky text-aviation-sky' 
                          : 'bg-transparent border-aviation-royal/10 text-gray-400'}
                      `}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={directOnly}
                    onChange={(e) => setDirectOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-aviation-royal/20 text-aviation-sky bg-aviation-navy focus:ring-0"
                  />
                  <span>Enforce direct routes only</span>
                </label>
              </div>
            </div>
          )}

        </form>
      </div>

      {/* Results Content */}
      {prediction && (
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Selected Prediction Details */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Predictor Panel */}
            <div className={`
              p-6 rounded-3xl border backdrop-blur-md
              ${theme === 'dark' 
                ? 'bg-aviation-navy-darker/60 border-aviation-royal/15 text-white' 
                : 'bg-white border-gray-200 text-gray-800'}
            `}>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-base font-extrabold text-white">Target Telemetry Prediction</h3>
                  <p className="text-[9px] text-gray-400 font-mono mt-0.5 uppercase tracking-widest">
                    {airline} • {cabinClass} • {stops === 0 ? "Direct" : `${stops} Stop`}
                  </p>
                </div>
                
                <div className={`
                  px-3 py-1 rounded-xl text-[10px] font-bold border flex items-center gap-1.5
                  ${getRecColor(prediction.recommendation.decision)}
                `}>
                  {prediction.trend === 'Rising' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {prediction.recommendation.decision}
                </div>
              </div>

              {/* Price Details */}
              <div className="flex flex-wrap items-baseline gap-6 my-6">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono block">Forecasted Price</span>
                  <span className="text-4xl font-black text-white">₹{prediction.predicted_price.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono block">Estimated Range</span>
                  <span className="text-sm font-semibold text-gray-300">
                    ₹{prediction.price_range.min.toLocaleString()} – ₹{prediction.price_range.max.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono block">Confidence</span>
                  <span className="text-sm font-semibold text-aviation-sky">
                    {(prediction.confidence_score * 100).toFixed(0)}% accuracy probability
                  </span>
                </div>
              </div>

              {/* Explanations alert */}
              <div className="p-4 rounded-2xl bg-aviation-dark/30 border border-aviation-royal/10 flex gap-3 text-xs leading-relaxed text-gray-300">
                <AlertCircle className="w-5 h-5 text-aviation-sky shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block mb-0.5">Recommendation logic details:</span>
                  {prediction.recommendation.explanation}
                </div>
              </div>
            </div>

            {/* Delay & Sustainability Modules */}
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Delay prediction */}
              <div className={`
                p-5 rounded-2xl border
                ${theme === 'dark' 
                  ? 'bg-aviation-navy-darker/60 border-aviation-royal/15 text-white' 
                  : 'bg-white border-gray-200 text-gray-800'}
              `}>
                <div className="flex items-center gap-2 mb-4 text-aviation-cyan">
                  <Clock className="w-5 h-5" />
                  <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-white">Delay Predictor</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">On-Time Probability:</span>
                    <span className="font-bold text-emerald-400">
                      {((1 - prediction.delay_probability) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Delay Probability:</span>
                    <span className="font-bold text-rose-400">
                      {(prediction.delay_probability * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Est. Taxi-Out / Wait:</span>
                    <span className="font-bold text-white">
                      {stops > 0 ? "35m layover lag" : "18m standard queue"}
                    </span>
                  </div>

                  {/* Delay Risk Indicator */}
                  <div className="p-3 rounded-xl bg-aviation-dark/30 border border-aviation-royal/5 text-[11px] text-gray-400 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${prediction.delay_probability > 0.4 ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`}></span>
                    {prediction.delay_probability > 0.4 
                      ? "High delay risk detected due to hub taxi congestion."
                      : "Favorable runway queues. Standard on-time vectors forecast."}
                  </div>
                </div>
              </div>

              {/* Carbon Footprint */}
              <div className={`
                p-5 rounded-2xl border
                ${theme === 'dark' 
                  ? 'bg-aviation-navy-darker/60 border-aviation-royal/15 text-white' 
                  : 'bg-white border-gray-200 text-gray-800'}
              `}>
                <div className="flex items-center gap-2 mb-4 text-emerald-400">
                  <Leaf className="w-5 h-5" />
                  <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-white">Carbon Footprint</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">CO₂ Carbon Emissions:</span>
                    <span className="font-bold text-white">{prediction.co2_emissions} kg / pax</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Sustainability Score:</span>
                    <span className="font-bold text-emerald-400 uppercase">
                      {cabinClass === 'Economy' && stops === 0 ? "A+ Rating" : "B- Rating"}
                    </span>
                  </div>

                  {/* Green Tip */}
                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-[11px] text-emerald-400 leading-normal">
                    <strong>Green Travel Advice:</strong> Select economy tickets on direct flights to lower fuel burn during startup phases.
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Carrier Comparison Module */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-gray-400">Airlines Comparison</h3>
              <span className="text-[9px] text-gray-500 font-mono">5 carriers logged</span>
            </div>

            <div className="space-y-3">
              {comparisons.map((c, idx) => (
                <div 
                  key={idx}
                  className={`
                    p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden
                    ${c.recommendation !== 'Standard Choice'
                      ? 'bg-aviation-sky/5 border-aviation-sky/35 shadow-[0_0_15px_rgba(0,180,216,0.15)]'
                      : theme === 'dark'
                        ? 'bg-aviation-navy-darker/60 border-aviation-royal/15 text-white'
                        : 'bg-white border-gray-200 text-gray-800'}
                  `}
                >
                  {/* Badge recommendation */}
                  {c.recommendation !== 'Standard Choice' && (
                    <div className="absolute top-2 right-2 bg-aviation-sky text-aviation-navy font-black text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full">
                      {c.recommendation}
                    </div>
                  )}

                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-white">{c.airline_name}</h4>
                      <p className="text-[10px] text-gray-400 mt-1 font-mono">{c.duration} • Direct</p>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-sm font-black text-white">₹{c.current_fare.toLocaleString()}</span>
                      <p className="text-[9px] text-gray-500 font-mono mt-0.5">Forecast: ₹{c.predicted_fare.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-aviation-royal/5 flex items-center justify-between text-[9px] text-gray-400 font-mono">
                    <span>OTP Score: {(c.rating * 20).toFixed(0)}%</span>
                    <span>CO₂: {c.co2}kg</span>
                  </div>
                </div>
              ))}

              {comparisons.length === 0 && (
                <div className="p-8 text-center text-xs text-gray-500 bg-aviation-dark/10 rounded-2xl border border-aviation-royal/10">
                  No carrier suggestions matched advanced filter parameters.
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* Landing display if no search yet */}
      {!prediction && !loading && (
        <div className="p-12 text-center border border-dashed border-aviation-royal/20 rounded-3xl bg-aviation-dark/5 space-y-4">
          <div className="w-12 h-12 rounded-full bg-aviation-sky/15 flex items-center justify-center text-aviation-sky mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-bold text-white">Aviation Telemetry Empty</h3>
            <p className="text-xs text-gray-400">
              Provide departure details and click "Forecast Fares" to compute pricing graphs, explainability weights, delay hazards, and carbon scores.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
