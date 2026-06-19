import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  TrendingUp, 
  Clock, 
  HelpCircle, 
  CloudSun, 
  Calendar, 
  Compass, 
  ArrowUpRight,
  TrendingDown,
  Info,
  RefreshCw,
  BellRing
} from 'lucide-react';
import axios from 'axios';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, Legend
} from 'recharts';
import { AlertModal } from '../components/AlertModal';

export const Dashboard: React.FC = () => {
  const { theme, apiUrl, addNotification } = useApp();
  
  // States
  const [source, setSource] = useState('DEL');
  const [destination, setDestination] = useState('BOM');
  const [loading, setLoading] = useState(true);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  
  // Data State
  const [predictionData, setPredictionData] = useState<any>(null);
  const [trendsData, setTrendsData] = useState<any>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [holidayData, setHolidayData] = useState<any>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch prediction for DEL -> BOM with default ML parameters
      const predRes = await axios.post(`${apiUrl}/api/predict/flight`, {
        source,
        destination,
        departure_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        airline: "Vistara",
        cabin_class: "Economy",
        stops: 0,
        days_to_departure: 14,
        weather_index: 0.15,
        is_holiday: false,
        demand_score: 0.45
      });
      setPredictionData(predRes.data);

      // 2. Fetch historical trends
      const trendsRes = await axios.get(`${apiUrl}/api/analytics/historical`, {
        params: { source, destination }
      });
      setTrendsData(trendsRes.data);

      // 3. Fetch geographical intelligence
      const geoRes = await axios.get(`${apiUrl}/api/analytics/geographical`, {
        params: { source, destination }
      });
      setGeoData(geoRes.data);

      // 4. Fetch weather intelligence
      const weatherRes = await axios.get(`${apiUrl}/api/analytics/weather`, {
        params: { source, destination }
      });
      setWeatherData(weatherRes.data);

      // 5. Fetch holiday intelligence (June)
      const holidayRes = await axios.get(`${apiUrl}/api/analytics/holidays`, {
        params: { month: 6 }
      });
      setHolidayData(holidayRes.data);

    } catch (err) {
      addNotification("Operational Timeout", "Error reaching FastAPI analytics endpoints. Double check uvicorn service.", "warning");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [source, destination]);

  const handleRouteSwap = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  if (loading || !predictionData || !trendsData) {
    return (
      <div className="w-full h-[70vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-10 h-10 text-aviation-sky animate-spin" />
        <span className="text-xs uppercase tracking-widest text-gray-400 font-mono">Resolving Aerotrends ...</span>
      </div>
    );
  }

  // Formatting XAI Contributions for visual bars
  const xaiContributions = [
    { label: "Airline Pricing Influence", value: predictionData.contributions.airline },
    { label: "Route Congestion & Distance", value: predictionData.contributions.route },
    { label: "Seasonal Window Penalty", value: predictionData.contributions.seasonal },
    { label: "Weather Headwinds Impact", value: predictionData.contributions.weather },
    { label: "National Holiday Surge", value: predictionData.contributions.holiday },
    { label: "Passenger Demand Surge", value: predictionData.contributions.demand }
  ];

  const maxContribution = Math.max(...xaiContributions.map(c => Math.abs(c.value)));

  return (
    <div className="w-full space-y-6 py-4 px-4 max-w-7xl mx-auto text-left">
      
      {/* Route Switcher Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-aviation-dark/30 border border-aviation-royal/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-aviation-sky/15 rounded-xl text-aviation-sky">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs text-gray-400 font-mono uppercase tracking-widest">Active Analysis Corridor</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <select 
                value={source} 
                onChange={(e) => setSource(e.target.value)}
                className="bg-transparent text-sm font-bold text-white border-b border-aviation-royal/30 outline-none cursor-pointer focus:border-aviation-sky"
              >
                <option value="DEL" className="bg-aviation-navy text-white">Delhi (DEL)</option>
                <option value="BOM" className="bg-aviation-navy text-white">Mumbai (BOM)</option>
                <option value="BLR" className="bg-aviation-navy text-white">Bengaluru (BLR)</option>
                <option value="HYD" className="bg-aviation-navy text-white">Hyderabad (HYD)</option>
                <option value="CCU" className="bg-aviation-navy text-white">Kolkata (CCU)</option>
              </select>
              <span className="text-aviation-sky text-xs">➔</span>
              <select 
                value={destination} 
                onChange={(e) => setDestination(e.target.value)}
                className="bg-transparent text-sm font-bold text-white border-b border-aviation-royal/30 outline-none cursor-pointer focus:border-aviation-sky"
              >
                <option value="BOM" className="bg-aviation-navy text-white">Mumbai (BOM)</option>
                <option value="DEL" className="bg-aviation-navy text-white">Delhi (DEL)</option>
                <option value="BLR" className="bg-aviation-navy text-white">Bengaluru (BLR)</option>
                <option value="HYD" className="bg-aviation-navy text-white">Hyderabad (HYD)</option>
                <option value="CCU" className="bg-aviation-navy text-white">Kolkata (CCU)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handleRouteSwap}
            className="px-4 py-2 rounded-xl bg-aviation-dark hover:bg-aviation-royal/40 text-xs font-semibold text-aviation-sky border border-aviation-royal/20 transition-all active:scale-95"
          >
            Reverse Corridor
          </button>
          <button 
            onClick={() => setIsAlertOpen(true)}
            className="px-4 py-2 rounded-xl bg-aviation-sky text-aviation-navy font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,180,216,0.3)]"
          >
            <BellRing className="w-3.5 h-3.5" />
            Watch Route
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Metric 1: Predicted Fare */}
        <div className="p-4 rounded-2xl bg-aviation-navy-darker/60 border border-aviation-royal/15 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono block">Forecasted Fare</span>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">₹{predictionData.predicted_price.toLocaleString()}</div>
          </div>
          <span className="text-[9px] text-emerald-400 mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
            Floor Index Locked
          </span>
        </div>

        {/* Metric 2: Price Range */}
        <div className="p-4 rounded-2xl bg-aviation-navy-darker/60 border border-aviation-royal/15 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono block">Predicted Range</span>
            <div className="text-xs sm:text-sm font-bold text-white mt-2">
              ₹{predictionData.price_range.min.toLocaleString()} – <br />
              ₹{predictionData.price_range.max.toLocaleString()}
            </div>
          </div>
          <span className="text-[9px] text-gray-500 mt-2">Margin: ±4%</span>
        </div>

        {/* Metric 3: Confidence Score */}
        <div className="p-4 rounded-2xl bg-aviation-navy-darker/60 border border-aviation-royal/15 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono block">Confidence Score</span>
            <div className="text-xl sm:text-2xl font-black text-aviation-sky mt-1">
              {(predictionData.confidence_score * 100).toFixed(0)}%
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-aviation-dark h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-aviation-sky h-full rounded-full"
              style={{ width: `${predictionData.confidence_score * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Metric 4: Market Avg */}
        <div className="p-4 rounded-2xl bg-aviation-navy-darker/60 border border-aviation-royal/15 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono block">Market Average</span>
            <div className="text-xl sm:text-2xl font-black text-gray-300 mt-1">
              ₹{(predictionData.predicted_price * 1.05).toFixed(0)}
            </div>
          </div>
          <span className="text-[9px] text-amber-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +5% standard surcharge
          </span>
        </div>

        {/* Metric 5: Demand Index */}
        <div className="p-4 rounded-2xl bg-aviation-navy-darker/60 border border-aviation-royal/15 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono block">Demand Index</span>
            <div className="text-sm font-bold text-rose-400 mt-2 flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block"></span>
              HIGH PRESSURE
            </div>
          </div>
          <span className="text-[9px] text-gray-500 mt-2">Active bookings spike</span>
        </div>

        {/* Metric 6: Delay Probability */}
        <div className="p-4 rounded-2xl bg-aviation-navy-darker/60 border border-aviation-royal/15 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono block">Delay Probability</span>
            <div className="text-xl sm:text-2xl font-black text-aviation-cyan mt-1">
              {(predictionData.delay_probability * 100).toFixed(0)}%
            </div>
          </div>
          <span className="text-[9px] text-gray-400 mt-2 font-mono">Avg delay: 18m</span>
        </div>
      </div>

      {/* Core Insights & Explainable AI */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Recommendation Engine Card */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-aviation-navy-darker/60 border border-aviation-royal/15 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Smart Recommendation</span>
              <HelpCircle className="w-3.5 h-3.5 text-gray-500 hover:text-white cursor-pointer" />
            </div>

            <div className={`
              inline-block px-5 py-2 rounded-xl text-sm font-black tracking-wider uppercase mb-4
              ${predictionData.recommendation.decision === 'BOOK NOW' 
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                : predictionData.recommendation.decision === 'WAIT'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}
            `}>
              {predictionData.recommendation.decision}
            </div>

            <p className="text-xs text-gray-300 leading-relaxed mb-4">
              {predictionData.recommendation.explanation}
            </p>
          </div>

          <div className="pt-4 border-t border-aviation-royal/10 space-y-2 text-xs font-mono">
            {predictionData.recommendation.expected_savings > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-400">Expected Drop:</span>
                <span className="text-emerald-400 font-bold">-₹{predictionData.recommendation.expected_savings}</span>
              </div>
            )}
            {predictionData.recommendation.expected_increase > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-400">Expected Spike:</span>
                <span className="text-rose-400 font-bold">+₹{predictionData.recommendation.expected_increase}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">Optimal Window:</span>
              <span className="text-white font-bold">{predictionData.recommendation.booking_window}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Telemetry Stamp:</span>
              <span className="text-aviation-sky text-[10px]">{new Date(predictionData.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Explainable AI (XAI) Module */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-aviation-navy-darker/60 border border-aviation-royal/15 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Explainable AI (XAI) Module</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono mt-0.5">Feature Impact Breakdown (₹)</p>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-aviation-sky/15 text-aviation-sky font-mono uppercase tracking-wider">
                SHAP Approximation
              </span>
            </div>

            <div className="space-y-3.5 py-2">
              {xaiContributions.map((c, idx) => {
                const isPositive = c.value >= 0;
                const pct = Math.min(100, Math.floor((Math.abs(c.value) / maxContribution) * 100));
                
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-300">{c.label}</span>
                      <span className={`font-mono font-bold ${isPositive ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {isPositive ? '+' : ''}₹{c.value.toLocaleString()}
                      </span>
                    </div>
                    {/* Visual contribution bar (two-way bar) */}
                    <div className="w-full bg-aviation-dark/30 h-2.5 rounded-full relative flex overflow-hidden">
                      {/* Left Side (Negative/Discounts) */}
                      <div className="w-1/2 flex justify-end bg-transparent pr-[1px]">
                        {!isPositive && (
                          <div 
                            className="bg-gradient-to-l from-emerald-500 to-emerald-600 h-full rounded-l-full"
                            style={{ width: `${pct}%` }}
                          ></div>
                        )}
                      </div>
                      {/* Divider */}
                      <div className="w-[2px] bg-aviation-royal/40 z-10"></div>
                      {/* Right Side (Positive/Surges) */}
                      <div className="w-1/2 flex justify-start bg-transparent pl-[1px]">
                        {isPositive && (
                          <div 
                            className="bg-gradient-to-r from-rose-500 to-rose-600 h-full rounded-r-full"
                            style={{ width: `${pct}%` }}
                          ></div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-[10px] text-gray-500 font-mono text-center pt-2 flex items-center justify-center gap-1.5">
            <Info className="w-3 h-3 text-aviation-sky" />
            Positive weights push fares up (Surges), negative weights discount final fare (Savings).
          </div>
        </div>

      </div>

      {/* Chart Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* price forecast chart next 30 days */}
        <div className="p-6 rounded-2xl bg-aviation-navy-darker/60 border border-aviation-royal/15 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Price Forecast Analytics</h3>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono mt-0.5">Next 30 Days Forecast (DEL ➔ BOM)</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trendsData.forecasted_trends}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00B4D8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00B4D8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(58, 80, 107, 0.1)" />
                <XAxis dataKey="day" stroke="#6b7280" fontSize={10} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={10} domain={['auto', 'auto']} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#0B132B' : '#FFFFFF',
                    borderColor: 'rgba(0, 180, 216, 0.3)',
                    color: theme === 'dark' ? '#FFFFFF' : '#000000',
                    fontSize: '11px',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any) => [`₹${value}`, "Fare"]}
                />
                <Area type="monotone" dataKey="price" stroke="#00B4D8" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* seasonal monthly trend */}
        <div className="p-6 rounded-2xl bg-aviation-navy-darker/60 border border-aviation-royal/15 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Seasonal Price Intelligence</h3>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono mt-0.5">Annual Seasonal Multipliers</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={trendsData.monthly_trends}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(58, 80, 107, 0.1)" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={10} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={10} domain={['auto', 'auto']} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#0B132B' : '#FFFFFF',
                    borderColor: 'rgba(0, 180, 216, 0.3)',
                    color: theme === 'dark' ? '#FFFFFF' : '#000000',
                    fontSize: '11px',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any) => [`₹${value}`, "Seasonal Price"]}
                />
                <Bar dataKey="price" fill="#3A506B" radius={[4, 4, 0, 0]}>
                  {trendsData.monthly_trends.map((entry: any, index: number) => {
                    // Highlight Peak Season (May/June & Nov/Dec)
                    const isPeak = index === 4 || index === 5 || index === 10 || index === 11;
                    return <Cell key={`cell-${index}`} fill={isPeak ? '#00B4D8' : '#3A506B'} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Intelligence Cards: Weather, Holidays, Geo */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Weather Intelligence Card */}
        {weatherData && (
          <div className="p-5 rounded-2xl bg-aviation-navy-darker/60 border border-aviation-royal/15 space-y-4">
            <div className="flex items-center gap-2 text-aviation-sky">
              <CloudSun className="w-5 h-5" />
              <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-white">Weather Intelligence</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-2.5 bg-aviation-dark/30 rounded-xl">
                <span className="text-[9px] text-gray-400 block">TEMP</span>
                <span className="font-bold text-white">{weatherData.source_weather.temp_c}°C</span>
              </div>
              <div className="p-2.5 bg-aviation-dark/30 rounded-xl">
                <span className="text-[9px] text-gray-400 block">VISIBILITY</span>
                <span className="font-bold text-white">{weatherData.source_weather.visibility_km} km</span>
              </div>
              <div className="p-2.5 bg-aviation-dark/30 rounded-xl">
                <span className="text-[9px] text-gray-400 block">WIND SPEED</span>
                <span className="font-bold text-white">{weatherData.source_weather.wind_speed_kmh} km/h</span>
              </div>
              <div className="p-2.5 bg-aviation-dark/30 rounded-xl">
                <span className="text-[9px] text-gray-400 block">RAIN METRIC</span>
                <span className="font-bold text-white">{weatherData.source_weather.rainfall_mm} mm</span>
              </div>
            </div>

            <div className="p-3 bg-aviation-sky/10 rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Delay Risk:</span>
                <span className={`font-bold ${weatherData.impact.delay_probability === 'High' ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {weatherData.impact.delay_probability} Risk
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Price Impact:</span>
                <span className="font-bold text-white">{weatherData.impact.ticket_prices}</span>
              </div>
            </div>
          </div>
        )}

        {/* Holiday / Seasonal Intelligence Card */}
        {holidayData && (
          <div className="p-5 rounded-2xl bg-aviation-navy-darker/60 border border-aviation-royal/15 space-y-4">
            <div className="flex items-center gap-2 text-aviation-sky">
              <Calendar className="w-5 h-5" />
              <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-white">Holiday & Seasons</h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Active Season:</span>
                <span className="font-bold text-white">{holidayData.tourist_season}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">School Vacation:</span>
                <span className="font-bold text-white">{holidayData.school_vacation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Average Surge:</span>
                <span className="font-bold text-rose-400">{holidayData.average_price_surge}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-aviation-royal/10">
              <span className="text-[10px] text-gray-400 font-mono block mb-1">REGISTERED EVENTS</span>
              {holidayData.holidays.length === 0 ? (
                <span className="text-xs text-gray-500">No public holidays in current slot.</span>
              ) : (
                holidayData.holidays.map((h: any, i: number) => (
                  <div key={i} className="flex justify-between text-xs bg-aviation-dark/30 p-2 rounded-xl border border-aviation-royal/5">
                    <span className="text-white font-bold">{h.name}</span>
                    <span className="text-rose-400 uppercase font-mono font-black text-[9px]">{h.impact} Impact</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Geographical intelligence */}
        {geoData && (
          <div className="p-5 rounded-2xl bg-aviation-navy-darker/60 border border-aviation-royal/15 space-y-4">
            <div className="flex items-center gap-2 text-aviation-sky">
              <Compass className="w-5 h-5" />
              <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-white">Geographical Intelligence</h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Dep Region:</span>
                <span className="font-bold text-white">{geoData.source_region}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Arr Region:</span>
                <span className="font-bold text-white">{geoData.destination_region}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tourism Focus:</span>
                <span className="font-bold text-white">{geoData.tourism_activity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Business Focus:</span>
                <span className="font-bold text-white">{geoData.business_demand}</span>
              </div>
            </div>

            <div className="p-2.5 bg-aviation-dark/30 rounded-xl text-xs space-y-1 border border-aviation-royal/5">
              <span className="text-[9px] text-gray-400 block uppercase font-mono">Local Event Surge</span>
              <span className="font-bold text-aviation-cyan block">{geoData.local_event}</span>
            </div>
          </div>
        )}

      </div>

      {/* Alert Creator Modal */}
      <AlertModal 
        isOpen={isAlertOpen} 
        onClose={() => setIsAlertOpen(false)} 
        source={source} 
        destination={destination}
        currentPrice={predictionData.predicted_price}
      />

    </div>
  );
};
