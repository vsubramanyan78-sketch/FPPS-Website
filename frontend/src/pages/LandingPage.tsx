import React, { useState } from 'react';
import { WorldMap } from '../components/WorldMap';
import { 
  TrendingUp, 
  ShieldCheck, 
  Compass, 
  Clock, 
  Leaf, 
  BrainCircuit, 
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Award,
  Users,
  Route,
  Activity
} from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const stats = [
    { label: "Total Predictions", value: "2.5M+", icon: Activity },
    { label: "Active Users", value: "180K+", icon: Users },
    { label: "Airlines Supported", value: "15+", icon: Award },
    { label: "Routes Analyzed", value: "450+", icon: Route }
  ];

  const features = [
    {
      title: "Predictive Pricing Engine",
      desc: "Our Random Forest Regressor models airline capacity, fuel indices, and booking time windows to forecast final fares.",
      icon: TrendingUp,
    },
    {
      title: "On-Time Operations Analysis",
      desc: "Evaluate delay probabilities on flight paths by analyzing airport taxi times and destination congestion indices.",
      icon: Clock,
    },
    {
      title: "Geographical Intelligence",
      desc: "Integrate regional demand indicators, business cycles, and local events to explain dynamic pricing spikes.",
      icon: Compass,
    },
    {
      title: "Carbon Footprint Analytics",
      desc: "Track estimated CO₂ emissions by aircraft model and cabin tier with sustainability recommendations.",
      icon: Leaf,
    },
    {
      title: "Explainable AI (XAI)",
      desc: "Get crystal clear visual graphs of why a price is changing, showing individual impacts of weather, seasons, and holiday surges.",
      icon: BrainCircuit,
    },
    {
      title: "Smart Booking Advice",
      desc: "Automated triggers (Book Now, Wait, Monitor) backed by historical trend calculations and forecasted deviations.",
      icon: ShieldCheck,
    }
  ];

  const steps = [
    { step: "01", title: "Enter Flight Details", desc: "Select departure, arrival hubs, calendar dates, and cabin options." },
    { step: "02", title: "Analyze Live Trends", desc: "Our engine queries seasonal averages, active weather indices, and capacity indices." },
    { step: "03", title: "Predict Flight Prices", desc: "ML models construct predictions, price ranges, and delay chances." },
    { step: "04", title: "Receive Recommendations", desc: "Access explainable AI bars, sustainability metrics, and booking advice." }
  ];

  const faqs = [
    {
      q: "How accurate are the flight price predictions?",
      a: "Our Random Forest Regressors report a Mean Absolute Percentage Error (MAPE) of 4.2% on domestic Indian routes. Fares are updated in real-time as carrier seating capacities shift."
    },
    {
      q: "What variables influence the Explainable AI contribution score?",
      a: "The contribution bars calculate specific pricing weights in Rupees (₹) for six areas: Airline tier offsets, Route distance/stops, Seasonality booking window, Holiday surges, Weather indexes, and Regional Passenger demand."
    },
    {
      q: "Can I get alerts when a price drop occurs?",
      a: "Yes! Simply create an account, search for a route, and click 'Enable Pricing Watch'. You will receive real-time notifications in your alert feed."
    },
    {
      q: "How is the Carbon Footprint and CO₂ score computed?",
      a: "Emissions are calculated using standard flight length parameters (approximately 115g CO₂ per passenger-km) scaled by aircraft engine efficiency ratings and cabin class multipliers (Business/First classes require larger floor area, increasing individual footprint)."
    }
  ];

  return (
    <div className="w-full space-y-16 py-6 px-4 max-w-7xl mx-auto">
      
      {/* Hero Section */}
      <section className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-6">
        <div className="lg:col-span-5 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-aviation-sky/10 border border-aviation-sky/30 text-aviation-sky text-xs font-semibold tracking-wider uppercase">
            <SparklesIcon className="w-3.5 h-3.5" />
            AI-Powered Aero Analytics
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
            Flight Price <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-aviation-sky via-aviation-cyan to-white">
              Prediction System
            </span>
          </h1>
          
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
            FPPS is an enterprise commercial aviation intelligence platform. Track airline fare trends, delay probabilities, carbon footprints, and weather disruptions with Explainable AI transparency.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={onStart}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-aviation-sky to-aviation-cyan text-aviation-navy font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:opacity-95 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,180,216,0.4)]"
            >
              Enter Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#how-it-works"
              className="px-6 py-3.5 rounded-xl bg-aviation-dark/40 border border-aviation-royal/20 text-white font-bold text-xs uppercase tracking-wider hover:bg-aviation-dark/70 transition-all flex items-center justify-center"
            >
              Review Architecture
            </a>
          </div>
        </div>

        {/* Dynamic Flight Map widget */}
        <div className="lg:col-span-7 w-full">
          <WorldMap />
        </div>
      </section>

      {/* Stats Banner */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 bg-aviation-dark/30 border border-aviation-royal/10 rounded-2xl p-6 sm:p-8 backdrop-blur-md">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="space-y-2 text-center md:text-left md:border-r last:border-0 border-aviation-royal/10 md:pr-4">
              <div className="flex items-center justify-center md:justify-start gap-2 text-aviation-sky">
                <Icon className="w-4 h-4" />
                <span className="text-xs uppercase tracking-widest text-gray-400 font-mono">{s.label}</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">{s.value}</div>
            </div>
          );
        })}
      </section>

      {/* Capabilities / Features Section */}
      <section className="space-y-12 text-left">
        <div className="max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Enterprise Analytical Modules
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-2">
            FPPS uses robust pipelines to monitor, explain, and recommend optimal booking vectors.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div 
                key={idx}
                className="p-6 rounded-2xl bg-aviation-navy-darker/40 border border-aviation-royal/15 hover:border-aviation-sky/30 transition-all duration-300 relative group overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-12 h-12 bg-aviation-sky/5 rounded-bl-full group-hover:bg-aviation-sky/10 transition-colors"></div>
                <div className="p-3 bg-aviation-sky/10 rounded-xl text-aviation-sky inline-block mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="space-y-12 text-left">
        <div className="max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            System Operations Pipeline
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-2">
            Step-by-step telemetry of how the platform extracts variables, processes forecasts, and scores bookings.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-aviation-dark/20 border border-aviation-royal/10 relative">
              <span className="text-4xl font-extrabold text-aviation-sky/10 font-mono absolute top-4 right-6">{s.step}</span>
              <h3 className="text-sm font-bold text-white mb-2 pr-8">{s.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ & Testimonials */}
      <section className="grid lg:grid-cols-12 gap-8 items-start text-left">
        {/* Testimonials */}
        <div className="lg:col-span-5 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Client Feedback</h2>
          <p className="text-xs text-gray-400">Used by corporate travel managers and independent consultants globally.</p>
          
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-aviation-dark/30 border border-aviation-royal/10">
              <p className="text-xs italic text-gray-300">
                "FPPS has restructured our company's business trip layouts. The booking recommendation alerts saved us nearly 18% in domestic flights last quarter alone."
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-aviation-sky/20 flex items-center justify-center text-xs font-bold text-aviation-sky">
                  RD
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Rohan Deshmukh</h4>
                  <span className="text-[9px] text-gray-400">Procurement lead, TechCorp</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-aviation-dark/30 border border-aviation-royal/10">
              <p className="text-xs italic text-gray-300">
                "The Explainable AI features are brilliant. I can instantly verify if a fare spike is due to weather congestion or holiday pricing, allowing me to reschedule booking dates."
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-aviation-sky/20 flex items-center justify-center text-xs font-bold text-aviation-sky">
                  SM
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Siddharth Mehta</h4>
                  <span className="text-[9px] text-gray-400">Independent Travel Analyst</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="lg:col-span-7 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-sans">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className="rounded-2xl border border-aviation-royal/10 bg-aviation-dark/10 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full p-4 flex justify-between items-center text-left text-xs font-bold text-white hover:bg-aviation-dark/20"
                >
                  <span>{faq.q}</span>
                  {activeFaq === i ? <ChevronUp className="w-4 h-4 text-aviation-sky" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                {activeFaq === i && (
                  <div className="p-4 pt-0 text-xs text-gray-300 border-t border-aviation-royal/5 leading-relaxed bg-aviation-navy/20">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-aviation-royal/10 pt-8 pb-4 text-center text-xs text-gray-500 space-y-2">
        <div className="flex justify-center gap-2 items-center text-gray-400">
          <span className="w-2 h-2 bg-aviation-sky rounded-full"></span>
          <span className="font-bold tracking-wider">FLIGHT PRICE PREDICTION SYSTEM</span>
        </div>
        <p className="max-w-md mx-auto text-[10px]">
          FPPS is an advanced software engineering project designed to simulate commercial aviation forecasting pipelines.
        </p>
        <p className="text-[9px] text-gray-600 font-mono mt-4">
          © 2026 FPPS Enterprise Inc. All telemetry monitored.
        </p>
      </footer>

    </div>
  );
};

// Simple inline sparkles icon for hero badge
const SparklesIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);
