import React, { useEffect, useState } from 'react';

interface AirportNode {
  id: string;
  name: string;
  city: string;
  x: number; // percentage
  y: number; // percentage
}

const airports: AirportNode[] = [
  { id: "DEL", name: "Indira Gandhi International", city: "Delhi", x: 42, y: 25 },
  { id: "BOM", name: "Chhatrapati Shivaji Maharaj", city: "Mumbai", x: 28, y: 55 },
  { id: "BLR", name: "Kempegowda International", city: "Bengaluru", x: 38, y: 78 },
  { id: "MAA", name: "Chennai International", city: "Chennai", x: 46, y: 80 },
  { id: "HYD", name: "Rajiv Gandhi International", city: "Hyderabad", x: 42, y: 65 },
  { id: "CCU", name: "Netaji Subhash Chandra Bose", city: "Kolkata", x: 78, y: 40 }
];

// Active flight routes to animate
const routes = [
  { from: "DEL", to: "BOM" },
  { from: "BOM", to: "BLR" },
  { from: "DEL", to: "CCU" },
  { from: "BLR", to: "DEL" },
  { from: "HYD", to: "DEL" },
  { from: "CCU", to: "MAA" },
  { from: "BOM", to: "CCU" }
];

export const WorldMap: React.FC = () => {
  const [hoverNode, setHoverNode] = useState<AirportNode | null>(null);

  // Generate curved paths between coordinate percentages
  const getSvgPath = (fromNode: AirportNode, toNode: AirportNode) => {
    const startX = (fromNode.x / 100) * 800;
    const startY = (fromNode.y / 100) * 600;
    const endX = (toNode.x / 100) * 800;
    const endY = (toNode.y / 100) * 600;
    
    // Control point for quadratic curve to create a nice aviation arc
    const dx = endX - startX;
    const dy = endY - startY;
    const len = Math.sqrt(dx * dx + dy * dy);
    
    // Offset perpendicular to the chord
    const scale = 0.15; // curvature
    const mx = (startX + endX) / 2;
    const my = (startY + endY) / 2;
    const px = -dy * scale;
    const py = dx * scale;
    
    const cx = mx + px;
    const cy = my + py;
    
    return `M ${startX} ${startY} Q ${cx} ${cy} ${endX} ${endY}`;
  };

  return (
    <div className="relative w-full h-[350px] sm:h-[450px] lg:h-[550px] bg-aviation-navy-darker/60 rounded-2xl overflow-hidden border border-aviation-royal/20 shadow-2xl">
      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 animated-grid opacity-30 pointer-events-none"></div>
      
      {/* Glowing Radar Sweep */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-aviation-sky/5 to-transparent pointer-events-none rotate-45 scale-150 animate-pulse-slow"></div>

      {/* SVG canvas */}
      <svg viewBox="0 0 800 600" className="w-full h-full select-none">
        {/* Render Flight Paths (Background & Glowing Line) */}
        {routes.map((route, idx) => {
          const fromNode = airports.find(a => a.id === route.from);
          const toNode = airports.find(a => a.id === route.to);
          if (!fromNode || !toNode) return null;
          
          const pathD = getSvgPath(fromNode, toNode);
          
          return (
            <g key={`route-${idx}`}>
              {/* Underlying glow path */}
              <path
                d={pathD}
                fill="none"
                stroke="url(#skyGradient)"
                strokeWidth="2.5"
                className="opacity-30"
              />
              {/* Dotted path representing airline connection */}
              <path
                d={pathD}
                fill="none"
                stroke="url(#cyanGradient)"
                strokeWidth="1.5"
                strokeDasharray="4, 6"
                className="opacity-60"
              />
              {/* Animated flight dot moving along path */}
              <circle r="4" fill="#00B4D8" className="filter drop-shadow-[0_0_8px_#00B4D8]">
                <animateMotion
                  dur={`${12 + idx * 3}s`}
                  repeatCount="indefinite"
                  path={pathD}
                  rotate="auto"
                />
              </circle>
            </g>
          );
        })}

        {/* Define Gradients */}
        <defs>
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3A506B" />
            <stop offset="100%" stopColor="#00B4D8" />
          </linearGradient>
          <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00B4D8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#90E0EF" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Render Airports nodes */}
        {airports.map((airport) => {
          const cx = (airport.x / 100) * 800;
          const cy = (airport.y / 100) * 600;
          const isHovered = hoverNode?.id === airport.id;
          
          return (
            <g
              key={airport.id}
              className="cursor-pointer group"
              onMouseEnter={() => setHoverNode(airport)}
              onMouseLeave={() => setHoverNode(null)}
            >
              {/* Outer pulsing ping indicator */}
              <circle
                cx={cx}
                cy={cy}
                r={isHovered ? 16 : 10}
                fill="none"
                stroke="#00B4D8"
                strokeWidth="1"
                className="opacity-50 transition-all duration-300"
              >
                <animate
                  attributeName="r"
                  values="4;18;4"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </circle>
              {/* Outer halo */}
              <circle
                cx={cx}
                cy={cy}
                r={isHovered ? 9 : 6}
                fill="#0B132B"
                stroke="#00B4D8"
                strokeWidth="2"
                className="transition-all duration-300"
              />
              {/* Inner glowing dot */}
              <circle
                cx={cx}
                cy={cy}
                r="3"
                fill="#90E0EF"
                className="filter drop-shadow-[0_0_4px_#90E0EF]"
              />
              {/* Label */}
              <text
                x={cx + 10}
                y={cy + 4}
                fill="#F4F6F9"
                fontSize="12"
                fontWeight="600"
                className="font-sans opacity-85 pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              >
                {airport.id}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Info Box on node hover */}
      {hoverNode && (
        <div
          className="absolute z-10 p-3 rounded-lg border border-aviation-sky/30 shadow-xl bg-aviation-navy-darker/90 backdrop-blur-md transition-all duration-200"
          style={{
            left: `${hoverNode.x > 60 ? hoverNode.x - 22 : hoverNode.x + 3}%`,
            top: `${hoverNode.y > 60 ? hoverNode.y - 18 : hoverNode.y + 2}%`,
          }}
        >
          <div className="text-xs font-semibold text-aviation-sky uppercase tracking-wider">{hoverNode.id} Hub</div>
          <div className="text-sm font-bold text-white">{hoverNode.city}</div>
          <div className="text-[11px] text-gray-400 mt-0.5">{hoverNode.name}</div>
          <div className="text-[10px] text-emerald-400 font-mono mt-1.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
            Ops: 100% Operational
          </div>
        </div>
      )}

      {/* Bottom corner HUD info */}
      <div className="absolute bottom-4 left-4 font-mono text-[10px] text-aviation-sky/60 bg-aviation-navy-darker/50 p-2 rounded border border-aviation-royal/20">
        <div>ATC SYSTEM: FPPS_VER_2.6</div>
        <div>CONGESTION INDEX: DEL(HIGH) | BOM(MAX)</div>
      </div>
    </div>
  );
};
