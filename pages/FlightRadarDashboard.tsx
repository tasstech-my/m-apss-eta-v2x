
import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { SignalIcon, PaperAirplaneIcon, GlobeAltIcon, MapIcon } from '../constants';

// Mock Flight Data
interface RadarFlight {
    id: string;
    callsign: string;
    lat: number;
    lng: number;
    altitude: number;
    speed: number;
    heading: number;
    squawk: string;
    type: string;
}

const generateFlights = (): RadarFlight[] => {
    return [
        { id: 'f1', callsign: 'MH370', lat: 2.7456, lng: 101.7072, altitude: 35000, speed: 480, heading: 45, squawk: '4721', type: 'B777' },
        { id: 'f2', callsign: 'AK52', lat: 2.72, lng: 101.68, altitude: 12000, speed: 320, heading: 180, squawk: '1200', type: 'A320' },
        { id: 'f3', callsign: 'SQ106', lat: 2.8, lng: 101.75, altitude: 28000, speed: 450, heading: 135, squawk: '3341', type: 'B787' },
        { id: 'f4', callsign: 'EK409', lat: 2.65, lng: 101.6, altitude: 8000, speed: 250, heading: 270, squawk: '5521', type: 'A380' },
        { id: 'f5', callsign: 'QR845', lat: 2.9, lng: 101.55, altitude: 39000, speed: 510, heading: 30, squawk: '6612', type: 'A350' },
    ];
};

export const FlightRadarDashboard: React.FC = () => {
    const [flights, setFlights] = useState<RadarFlight[]>(generateFlights());
    const [selectedFlight, setSelectedFlight] = useState<RadarFlight | null>(null);
    const [layers, setLayers] = useState({ weather: false, traffic: true, zones: true });

    // Simulate Movement
    useEffect(() => {
        const interval = setInterval(() => {
            setFlights(current => current.map(f => {
                // Simple random movement simulation
                const latChange = (Math.random() - 0.5) * 0.01;
                const lngChange = (Math.random() - 0.5) * 0.01;
                return {
                    ...f,
                    lat: f.lat + latChange,
                    lng: f.lng + lngChange,
                    heading: Math.floor(Math.random() * 360)
                };
            }));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // Helper to position SVG markers based on simulated lat/lng relative to map center (KLIA)
    // KLIA approx center: 2.7456, 101.7072
    // Simple projection for demo: 1 deg lat ~= 111km. Map view approx 50km width.
    const getPosition = (lat: number, lng: number) => {
        const centerLat = 2.7456;
        const centerLng = 101.7072;
        const scale = 8000; // Scaling factor for visual
        const x = 50 + (lng - centerLng) * scale;
        const y = 50 - (lat - centerLat) * scale;
        return { x, y };
    };

    return (
        <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
            <Card className="bg-slate-900 text-white border-l-4 border-green-500 py-3 px-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <SignalIcon className="h-6 w-6 text-green-400 mr-3" />
                        <div>
                            <h2 className="text-lg font-bold">Flight Radar: Live Airspace Monitor (KLIA)</h2>
                            <p className="text-slate-400 text-xs">Real-time tracking of inbound/outbound traffic in Malaysian airspace.</p>
                        </div>
                    </div>
                    <div className="flex space-x-4 text-xs">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" checked={layers.traffic} onChange={() => setLayers({...layers, traffic: !layers.traffic})} className="rounded text-green-500 focus:ring-0 bg-slate-700 border-slate-600" />
                            <span>Traffic</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" checked={layers.zones} onChange={() => setLayers({...layers, zones: !layers.zones})} className="rounded text-red-500 focus:ring-0 bg-slate-700 border-slate-600" />
                            <span>Restricted Zones</span>
                        </label>
                         <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" checked={layers.weather} onChange={() => setLayers({...layers, weather: !layers.weather})} className="rounded text-blue-500 focus:ring-0 bg-slate-700 border-slate-600" />
                            <span>Weather</span>
                        </label>
                    </div>
                </div>
            </Card>

            <div className="flex-1 flex gap-4 min-h-0">
                {/* Map Container */}
                <div className="flex-1 relative bg-black rounded-lg overflow-hidden border border-slate-700 shadow-2xl">
                     {/* Google Map Iframe as Background */}
                     <iframe 
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        scrolling="no" 
                        marginHeight={0} 
                        marginWidth={0} 
                        src="https://maps.google.com/maps?q=Kuala%20Lumpur%20International%20Airport&t=k&z=11&ie=UTF8&iwloc=&output=embed"
                        className="absolute inset-0 opacity-60 grayscale contrast-125"
                        style={{ pointerEvents: 'none' }} // Disable interaction with iframe to allow overlay interaction if needed, or enable if preferred. Here disabling to emphasize "Radar" feel.
                    ></iframe>
                    
                    {/* Radar HUD Overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                         {/* Grid Lines */}
                         <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, rgba(0,255,0,0.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
                         <div className="absolute inset-0 border-2 border-green-500/30 rounded-full scale-[0.8]"></div>
                         <div className="absolute inset-0 border-2 border-green-500/20 rounded-full scale-[0.5]"></div>
                    </div>

                    {/* Flights Layer (SVG) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-auto">
                         {layers.zones && (
                             <circle cx="50%" cy="50%" r="15%" fill="rgba(255, 0, 0, 0.1)" stroke="red" strokeWidth="1" strokeDasharray="4 2" />
                         )}
                         
                         {flights.map(flight => {
                             const pos = getPosition(flight.lat, flight.lng);
                             // Clamp to view
                             if (pos.x < 0 || pos.x > 100 || pos.y < 0 || pos.y > 100) return null;

                             return (
                                 <g 
                                    key={flight.id} 
                                    onClick={() => setSelectedFlight(flight)}
                                    className="cursor-pointer hover:opacity-100 transition-opacity duration-200 group"
                                    style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                                 >
                                     {/* Plane Icon */}
                                     <path 
                                        d="M12 2L2 22L12 18L22 22L12 2Z" 
                                        fill={selectedFlight?.id === flight.id ? '#fbbf24' : '#4ade80'} 
                                        transform={`translate(${pos.x * 10}, ${pos.y * 8}) scale(0.8) rotate(${flight.heading})`} // Simple coordinate mapping adjustment for demo
                                     />
                                     {/* Label */}
                                     <text 
                                        x={`${pos.x}%`} 
                                        y={`${pos.y}%`} 
                                        dx="12" 
                                        dy="4" 
                                        fill="white" 
                                        fontSize="10" 
                                        className="font-mono font-bold drop-shadow-md"
                                     >
                                         {flight.callsign}
                                     </text>
                                      <text 
                                        x={`${pos.x}%`} 
                                        y={`${pos.y}%`} 
                                        dx="12" 
                                        dy="14" 
                                        fill="#94a3b8" 
                                        fontSize="8" 
                                        className="font-mono drop-shadow-md"
                                     >
                                         {flight.altitude}ft
                                     </text>
                                 </g>
                             );
                         })}
                    </svg>
                    
                    {/* Scan Line Animation */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-b from-transparent via-green-500/10 to-transparent animate-scan-radar" style={{ height: '50%' }}></div>
                    </div>
                    <style>{`
                        @keyframes scan-radar {
                            0% { transform: translateY(-100%); }
                            100% { transform: translateY(200%); }
                        }
                        .animate-scan-radar {
                            animation: scan-radar 4s linear infinite;
                        }
                    `}</style>
                </div>

                {/* Details Sidebar */}
                <div className="w-80 bg-slate-800 rounded-lg border border-slate-700 flex flex-col overflow-hidden shadow-xl">
                    <div className="p-4 bg-slate-900 border-b border-slate-700">
                        <h3 className="text-white font-bold flex items-center">
                            <PaperAirplaneIcon className="h-5 w-5 mr-2 text-blue-400" />
                            Selected Target
                        </h3>
                    </div>
                    
                    {selectedFlight ? (
                        <div className="p-4 space-y-6 text-sm flex-1 overflow-y-auto">
                            <div className="text-center">
                                <div className="text-3xl font-black text-white font-mono tracking-wider">{selectedFlight.callsign}</div>
                                <div className="text-slate-400 text-xs uppercase mt-1">{selectedFlight.type} Aircraft</div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-700/50 p-2 rounded border border-slate-600">
                                    <div className="text-xs text-slate-400 uppercase">Altitude</div>
                                    <div className="text-lg font-mono text-green-400">{selectedFlight.altitude.toLocaleString()} ft</div>
                                </div>
                                <div className="bg-slate-700/50 p-2 rounded border border-slate-600">
                                    <div className="text-xs text-slate-400 uppercase">Speed</div>
                                    <div className="text-lg font-mono text-blue-400">{selectedFlight.speed} kts</div>
                                </div>
                                <div className="bg-slate-700/50 p-2 rounded border border-slate-600">
                                    <div className="text-xs text-slate-400 uppercase">Heading</div>
                                    <div className="text-lg font-mono text-white">{selectedFlight.heading}°</div>
                                </div>
                                <div className="bg-slate-700/50 p-2 rounded border border-slate-600">
                                    <div className="text-xs text-slate-400 uppercase">Squawk</div>
                                    <div className="text-lg font-mono text-amber-400">{selectedFlight.squawk}</div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="text-xs text-slate-500 uppercase font-bold">Telemetry</div>
                                <div className="flex justify-between text-slate-300"><span>Latitude:</span> <span className="font-mono">{selectedFlight.lat.toFixed(4)}</span></div>
                                <div className="flex justify-between text-slate-300"><span>Longitude:</span> <span className="font-mono">{selectedFlight.lng.toFixed(4)}</span></div>
                                <div className="flex justify-between text-slate-300"><span>Source:</span> <span className="font-mono">ADS-B</span></div>
                            </div>
                            
                            <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded transition-colors text-xs">
                                Track Flight Path
                            </button>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-6 text-center">
                            <GlobeAltIcon className="h-16 w-16 mb-4 opacity-20" />
                            <p>Select an aircraft on the radar to view telemetry data.</p>
                        </div>
                    )}
                    
                    {/* System Status Footer */}
                    <div className="p-3 bg-slate-900 border-t border-slate-700 text-[10px] text-slate-500 flex justify-between">
                        <span>Radar Feed: ONLINE</span>
                        <span>Update: 2s</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
