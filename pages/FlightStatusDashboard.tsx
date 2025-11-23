
import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '../components/Card';
import { PaperAirplaneIcon, InformationCircleIcon, MapIcon, ListBulletIcon, ArrowPathIcon } from '../constants';
import type { FlightRiskProfile } from '../types';

// --- MOCK DATA ---
const initialFlightProfiles: FlightRiskProfile[] = [
    {
        id: 'FLT-001', flightNumber: 'MH370', airline: 'Malaysia Airlines', origin: 'PEK', destination: 'KUL', scheduledTime: '14:30', arrivalGate: 'C21', direction: 'Inbound', status: 'Landed', riskLevel: 'Critical', totalPax: 239,
        riskSummary: { critical: 1, high: 4, medium: 12, low: 222, watchlistHits: 2 },
        passengerManifest: [
            { puid: 'PUID-9911', name: 'Omar Al-Masri', nationality: 'EGY', seat: '12A', riskScore: 95, riskLevel: 'Critical', hits: ['Narcotics Watchlist'] },
            { puid: 'PUID-8822', name: 'Victor Korchnoi', nationality: 'RUS', seat: '4F', riskScore: 78, riskLevel: 'High', hits: ['Financial Watchlist'] }
        ]
    },
    {
        id: 'FLT-002', flightNumber: 'AK52', airline: 'AirAsia', origin: 'KUL', destination: 'SIN', scheduledTime: '15:00', arrivalGate: 'H4', direction: 'Outbound', status: 'Scheduled', riskLevel: 'Low', totalPax: 180,
        riskSummary: { critical: 0, high: 0, medium: 5, low: 175, watchlistHits: 0 },
        passengerManifest: []
    },
    {
        id: 'FLT-003', flightNumber: 'SQ106', airline: 'Singapore Airlines', origin: 'SIN', destination: 'KUL', scheduledTime: '16:15', arrivalGate: 'C11', direction: 'Inbound', status: 'Delayed', riskLevel: 'Medium', totalPax: 280,
        riskSummary: { critical: 0, high: 2, medium: 15, low: 263, watchlistHits: 0 },
        passengerManifest: [
            { puid: 'PUID-7744', name: 'John Doe', nationality: 'USA', seat: '22C', riskScore: 65, riskLevel: 'Medium', hits: ['Pattern Match'] }
        ]
    },
    {
        id: 'FLT-004', flightNumber: 'EK409', airline: 'Emirates', origin: 'DXB', destination: 'KUL', scheduledTime: '18:00', arrivalGate: 'C15', direction: 'Inbound', status: 'Scheduled', riskLevel: 'High', totalPax: 350,
        riskSummary: { critical: 0, high: 8, medium: 25, low: 317, watchlistHits: 1 },
        passengerManifest: [
            { puid: 'PUID-6633', name: 'Elena Petrova', nationality: 'RUS', seat: '1A', riskScore: 88, riskLevel: 'High', hits: ['Anomalous Booking'] }
        ]
    },
    {
        id: 'FLT-005', flightNumber: 'QR845', airline: 'Qatar Airways', origin: 'KUL', destination: 'DOH', scheduledTime: '20:30', arrivalGate: 'C33', direction: 'Outbound', status: 'Scheduled', riskLevel: 'Low', totalPax: 310,
        riskSummary: { critical: 0, high: 1, medium: 8, low: 301, watchlistHits: 0 },
        passengerManifest: []
    },
    // Additional 10 Mock Inbound Flights
    {
        id: 'FLT-006', flightNumber: 'JL723', airline: 'Japan Airlines', origin: 'NRT', destination: 'KUL', scheduledTime: '17:45', arrivalGate: 'C22', direction: 'Inbound', status: 'Scheduled', riskLevel: 'Low', totalPax: 215,
        riskSummary: { critical: 0, high: 0, medium: 2, low: 213, watchlistHits: 0 },
        passengerManifest: []
    },
    {
        id: 'FLT-007', flightNumber: 'TK060', airline: 'Turkish Airlines', origin: 'IST', destination: 'KUL', scheduledTime: '18:30', arrivalGate: 'C1', direction: 'Inbound', status: 'Delayed', riskLevel: 'Medium', totalPax: 289,
        riskSummary: { critical: 0, high: 1, medium: 12, low: 276, watchlistHits: 0 },
        passengerManifest: [
             { puid: 'PUID-5512', name: 'Hakan Yilmaz', nationality: 'TUR', seat: '33D', riskScore: 68, riskLevel: 'Medium', hits: ['Data Anomaly'] }
        ]
    },
    {
        id: 'FLT-008', flightNumber: 'BA033', airline: 'British Airways', origin: 'LHR', destination: 'KUL', scheduledTime: '15:55', arrivalGate: 'C12', direction: 'Inbound', status: 'Landed', riskLevel: 'High', totalPax: 310,
        riskSummary: { critical: 0, high: 5, medium: 20, low: 285, watchlistHits: 1 },
        passengerManifest: [
            { puid: 'PUID-1234', name: 'David Smith', nationality: 'GBR', seat: '14K', riskScore: 82, riskLevel: 'High', hits: ['History of Overstay'] }
        ]
    },
    {
        id: 'FLT-009', flightNumber: 'CX729', airline: 'Cathay Pacific', origin: 'HKG', destination: 'KUL', scheduledTime: '19:10', arrivalGate: 'G4', direction: 'Inbound', status: 'Scheduled', riskLevel: 'Low', totalPax: 198,
        riskSummary: { critical: 0, high: 0, medium: 3, low: 195, watchlistHits: 0 },
        passengerManifest: []
    },
    {
        id: 'FLT-010', flightNumber: 'GA820', airline: 'Garuda Indonesia', origin: 'CGK', destination: 'KUL', scheduledTime: '11:20', arrivalGate: 'H2', direction: 'Inbound', status: 'Landed', riskLevel: 'Medium', totalPax: 150,
        riskSummary: { critical: 0, high: 2, medium: 8, low: 140, watchlistHits: 0 },
        passengerManifest: [
             { puid: 'PUID-4455', name: 'Budi Santoso', nationality: 'IDN', seat: '8A', riskScore: 62, riskLevel: 'Medium', hits: ['Incomplete API Data'] }
        ]
    },
    {
        id: 'FLT-011', flightNumber: 'VN681', airline: 'Vietnam Airlines', origin: 'SGN', destination: 'KUL', scheduledTime: '13:45', arrivalGate: 'G8', direction: 'Inbound', status: 'Landed', riskLevel: 'Low', totalPax: 165,
        riskSummary: { critical: 0, high: 0, medium: 1, low: 164, watchlistHits: 0 },
        passengerManifest: []
    },
    {
        id: 'FLT-012', flightNumber: 'TG415', airline: 'Thai Airways', origin: 'BKK', destination: 'KUL', scheduledTime: '14:10', arrivalGate: 'H6', direction: 'Inbound', status: 'Landed', riskLevel: 'High', totalPax: 240,
        riskSummary: { critical: 0, high: 6, medium: 10, low: 224, watchlistHits: 0 },
        passengerManifest: [
             { puid: 'PUID-9900', name: 'Somsak Chai', nationality: 'THA', seat: '21F', riskScore: 85, riskLevel: 'High', hits: ['Smuggling Profile'] }
        ]
    },
    {
        id: 'FLT-013', flightNumber: 'PR525', airline: 'Philippine Airlines', origin: 'MNL', destination: 'KUL', scheduledTime: '16:50', arrivalGate: 'G2', direction: 'Inbound', status: 'Scheduled', riskLevel: 'Critical', totalPax: 188,
        riskSummary: { critical: 2, high: 3, medium: 15, low: 168, watchlistHits: 1 },
        passengerManifest: [
             { puid: 'PUID-6677', name: 'Maria Santos', nationality: 'PHL', seat: '5C', riskScore: 92, riskLevel: 'Critical', hits: ['Interpol Red Notice'] }
        ]
    },
    {
        id: 'FLT-014', flightNumber: 'SV834', airline: 'Saudia', origin: 'JED', destination: 'KUL', scheduledTime: '21:00', arrivalGate: 'C18', direction: 'Inbound', status: 'Scheduled', riskLevel: 'Medium', totalPax: 320,
        riskSummary: { critical: 0, high: 1, medium: 18, low: 301, watchlistHits: 0 },
        passengerManifest: []
    },
    {
        id: 'FLT-015', flightNumber: 'KE671', airline: 'Korean Air', origin: 'ICN', destination: 'KUL', scheduledTime: '22:15', arrivalGate: 'C24', direction: 'Inbound', status: 'Scheduled', riskLevel: 'Low', totalPax: 275,
        riskSummary: { critical: 0, high: 0, medium: 4, low: 271, watchlistHits: 0 },
        passengerManifest: []
    }
];

// --- MAP DATA & CONSTANTS ---
const airports = [
  { iata: 'KUL', name: 'Kuala Lumpur', coords: { x: 78, y: 55 } },
  { iata: 'PEK', name: 'Beijing', coords: { x: 82, y: 38 } },
  { iata: 'SIN', name: 'Singapore', coords: { x: 79, y: 57 } },
  { iata: 'DXB', name: 'Dubai', coords: { x: 62, y: 45 } },
  { iata: 'DOH', name: 'Doha', coords: { x: 60, y: 44 } },
  { iata: 'LHR', name: 'London', coords: { x: 46, y: 28 } },
  // Additional hubs
  { iata: 'HKG', name: 'Hong Kong', coords: { x: 81, y: 45 } },
  { iata: 'BKK', name: 'Bangkok', coords: { x: 76, y: 48 } },
  { iata: 'HND', name: 'Tokyo', coords: { x: 92, y: 38 } },
  { iata: 'SYD', name: 'Sydney', coords: { x: 94, y: 85 } },
  { iata: 'CDG', name: 'Paris', coords: { x: 48, y: 30 } },
  { iata: 'FRA', name: 'Frankfurt', coords: { x: 50, y: 29 } },
  { iata: 'BOM', name: 'Mumbai', coords: { x: 68, y: 48 } },
  // New hubs for extra flights
  { iata: 'NRT', name: 'Narita', coords: { x: 93, y: 38 } },
  { iata: 'IST', name: 'Istanbul', coords: { x: 55, y: 35 } },
  { iata: 'CGK', name: 'Jakarta', coords: { x: 78, y: 62 } },
  { iata: 'SGN', name: 'Ho Chi Minh', coords: { x: 78, y: 50 } },
  { iata: 'MNL', name: 'Manila', coords: { x: 85, y: 50 } },
  { iata: 'JED', name: 'Jeddah', coords: { x: 58, y: 48 } },
  { iata: 'ICN', name: 'Incheon', coords: { x: 88, y: 37 } },
];

const airportsByIata = new Map(airports.map(a => [a.iata, a]));

// Generate 20 additional flight movements
const generateAdditionalFlights = (): FlightRiskProfile[] => {
    const extraFlights: FlightRiskProfile[] = [];
    const hubs = ['LHR', 'DXB', 'SIN', 'HKG', 'BKK', 'HND', 'SYD', 'CDG', 'FRA', 'BOM'];
    const airlines = ['BA', 'EK', 'SQ', 'CX', 'TG', 'JL', 'QF', 'AF', 'LH', 'AI'];

    for(let i=0; i<20; i++) {
        const origin = hubs[i % hubs.length];
        const airline = airlines[i % airlines.length];
        extraFlights.push({
            id: `FLT-EXT-${i}`,
            flightNumber: `${airline}${100+i}`,
            airline: `${airline} Airlines`,
            origin: origin,
            destination: 'KUL',
            scheduledTime: `${10+i}:00`,
            arrivalGate: `G${i+1}`,
            direction: 'Inbound',
            status: 'Scheduled',
            riskLevel: i % 3 === 0 ? 'High' : (i % 4 === 0 ? 'Medium' : 'Low'),
            totalPax: 200 + i*10,
            riskSummary: { critical: 0, high: i%3===0?1:0, medium: 2, low: 200, watchlistHits: 0 },
            passengerManifest: []
        });
    }
    return extraFlights;
};

const FlightRiskMap: React.FC<{ flights: FlightRiskProfile[], onSelect: (f: FlightRiskProfile) => void }> = ({ flights, onSelect }) => {
    return (
        <div className="relative w-full h-[500px] bg-slate-900 rounded-lg overflow-hidden shadow-inner border border-slate-700 group">
             {/* Google Map Iframe as Background Texture */}
             <iframe 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                scrolling="no" 
                marginHeight={0} 
                marginWidth={0} 
                // Center roughly on India to show the spread from UK to Australia
                src="https://maps.google.com/maps?q=20.5937,78.9629&z=2&output=embed&t=k"
                className="absolute inset-0 opacity-40 grayscale contrast-125 invert"
                style={{ pointerEvents: 'none' }} 
            ></iframe>
            
            {/* Radar Overlay Effects */}
            <div className="absolute inset-0 pointer-events-none bg-slate-900/20">
                 {/* Grid Pattern */}
                 <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            </div>

            <svg viewBox="0 0 100 80" className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'auto' }}>
                 {/* Flight Paths */}
                 {flights.map((flight, idx) => {
                    const origin = airportsByIata.get(flight.origin) || { coords: { x: 10, y: 40 } }; // Fallback
                    const dest = airportsByIata.get(flight.destination) || { coords: { x: 90, y: 40 } }; // Fallback
                    
                    // Calculate control point for curve
                    const controlX = (origin.coords.x + dest.coords.x) / 2;
                    const controlY = (origin.coords.y + dest.coords.y) / 2 - 15; // Arc upwards
                    const pathData = `M ${origin.coords.x},${origin.coords.y} Q ${controlX},${controlY} ${dest.coords.x},${dest.coords.y}`;
                    
                    let strokeColor = '#22c55e'; // Low
                    if(flight.riskLevel === 'Medium') strokeColor = '#eab308';
                    if(flight.riskLevel === 'High') strokeColor = '#ef4444';
                    if(flight.riskLevel === 'Critical') strokeColor = '#b91c1c';
                    
                    // Vary animation duration slightly to make it look natural
                    const dur = 10 + (idx % 5); 

                    return (
                        <g key={flight.id} onClick={() => onSelect(flight)} className="cursor-pointer hover:opacity-80">
                            <path d={pathData} fill="none" stroke={strokeColor} strokeWidth="0.5" strokeDasharray="2,2" strokeOpacity="0.6" />
                            
                            <circle cx={origin.coords.x} cy={origin.coords.y} r="1" fill="#94a3b8" fillOpacity="0.8" />
                            <circle cx={dest.coords.x} cy={dest.coords.y} r="1" fill="#94a3b8" fillOpacity="0.8" />
                            
                            {/* Airport Labels */}
                            <text x={origin.coords.x} y={origin.coords.y + 3} fontSize="2.5" fill="#94a3b8" textAnchor="middle" className="font-mono font-bold opacity-60">{flight.origin}</text>
                            <text x={dest.coords.x} y={dest.coords.y + 3} fontSize="2.5" fill="#94a3b8" textAnchor="middle" className="font-mono font-bold opacity-60">{flight.destination}</text>

                            {/* Animated Plane */}
                            <g>
                                <path 
                                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                                    fill={strokeColor} 
                                    transform="scale(0.15) translate(-12, -12)" 
                                />
                                <animateMotion dur={`${dur}s`} repeatCount="indefinite" path={pathData} rotate="auto" />
                            </g>
                        </g>
                    );
                 })}
            </svg>
            
            <div className="absolute bottom-4 right-4 bg-slate-900/90 p-3 rounded-lg border border-slate-700 text-xs text-white backdrop-blur-md shadow-xl">
                <h4 className="font-bold mb-2 text-slate-300 uppercase tracking-wider">Risk Legend</h4>
                <div className="flex items-center mb-1"><div className="w-3 h-3 rounded-full bg-red-700 mr-2 shadow-[0_0_8px_rgba(185,28,28,0.8)]"></div> Critical</div>
                <div className="flex items-center mb-1"><div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div> High</div>
                <div className="flex items-center mb-1"><div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div> Medium</div>
                <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div> Low</div>
            </div>
        </div>
    );
};

const RiskManifestModal: React.FC<{ flight: FlightRiskProfile; onClose: () => void }> = ({ flight, onClose }) => {
    const [dispatchStatus, setDispatchStatus] = useState<'Idle' | 'Dispatching' | 'Dispatched'>('Idle');

    const handleDispatch = () => {
        setDispatchStatus('Dispatching');
        setTimeout(() => setDispatchStatus('Dispatched'), 2000);
    };

    const riskAssessmentMessage = useMemo(() => {
        if (flight.riskLevel === 'Critical') return "High probability of narcotics or security threat on board. Immediate tactical interception recommended.";
        if (flight.riskLevel === 'High') return "Multiple high-risk indicators detected. Enhanced screening team should be deployed.";
        if (flight.riskLevel === 'Medium') return "Elevated risk profile. Recommend random secondary checks at gate.";
        return "Standard monitoring active. No specific interventions recommended.";
    }, [flight.riskLevel]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <Card title={`Risk Manifest: ${flight.flightNumber}`} className="w-full max-w-4xl animate-scale-in max-h-[90vh] overflow-y-auto">
                <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">{flight.airline}</p>
                        <p className="font-bold text-lg">{flight.origin} &rarr; {flight.destination}</p>
                        {flight.arrivalGate && <p className="text-sm text-brand-secondary font-semibold mt-1">Gate: {flight.arrivalGate}</p>}
                    </div>
                    <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold text-white ${
                             flight.riskLevel === 'Critical' ? 'bg-red-800' : 
                             flight.riskLevel === 'High' ? 'bg-red-500' : 
                             flight.riskLevel === 'Medium' ? 'bg-amber-500' : 'bg-green-500'
                        }`}>
                            {flight.riskLevel} Risk
                        </span>
                    </div>
                </div>

                {/* Tactical Decision Support Panel */}
                {(flight.riskLevel === 'Critical' || flight.riskLevel === 'High') && (
                    <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-md mb-6 shadow-sm">
                        <h4 className="text-blue-800 font-bold text-sm uppercase mb-2 flex items-center">
                            <InformationCircleIcon className="h-5 w-5 mr-2" />
                            Tactical Decision Support
                        </h4>
                        <p className="text-blue-900 text-sm mb-3 font-medium">{riskAssessmentMessage}</p>
                        <div className="flex items-center justify-between bg-white p-3 rounded border border-blue-100">
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Recommended Action</p>
                                <p className="text-sm font-bold text-gray-800">Deploy Intervention Team to Gate {flight.arrivalGate || 'TBD'}</p>
                            </div>
                            <button 
                                onClick={handleDispatch}
                                disabled={dispatchStatus !== 'Idle'}
                                className={`px-4 py-2 rounded text-sm font-bold text-white transition-all ${
                                    dispatchStatus === 'Idle' ? 'bg-blue-600 hover:bg-blue-700' : 
                                    dispatchStatus === 'Dispatching' ? 'bg-blue-400 cursor-wait' : 
                                    'bg-green-600 cursor-default'
                                }`}
                            >
                                {dispatchStatus === 'Idle' && 'Dispatch Team'}
                                {dispatchStatus === 'Dispatching' && 'Dispatching...'}
                                {dispatchStatus === 'Dispatched' && '✓ Team Dispatched'}
                            </button>
                        </div>
                    </div>
                )}
                
                <div className="bg-gray-50 p-4 rounded-lg border mb-6">
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Aggregated Risk Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                        <div className="bg-white p-2 rounded border border-red-200 shadow-sm">
                            <p className="text-xs text-gray-500">Critical Pax</p>
                            <p className="text-xl font-bold text-red-800">{flight.riskSummary.critical}</p>
                        </div>
                        <div className="bg-white p-2 rounded border border-red-100 shadow-sm">
                            <p className="text-xs text-gray-500">High Risk</p>
                            <p className="text-xl font-bold text-red-600">{flight.riskSummary.high}</p>
                        </div>
                         <div className="bg-white p-2 rounded border border-amber-100 shadow-sm">
                            <p className="text-xs text-gray-500">Medium Risk</p>
                            <p className="text-xl font-bold text-amber-600">{flight.riskSummary.medium}</p>
                        </div>
                         <div className="bg-white p-2 rounded border border-gray-200 shadow-sm">
                            <p className="text-xs text-gray-500">Watchlist Hits</p>
                            <p className="text-xl font-bold text-brand-dark">{flight.riskSummary.watchlistHits}</p>
                        </div>
                        <div className="bg-white p-2 rounded border border-gray-200 shadow-sm">
                            <p className="text-xs text-gray-500">Total Pax</p>
                            <p className="text-xl font-bold text-gray-700">{flight.totalPax}</p>
                        </div>
                    </div>
                </div>

                <h4 className="font-bold text-brand-dark mb-3">High Priority Passengers</h4>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Seat</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Passenger</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Alerts</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {flight.passengerManifest.length > 0 ? flight.passengerManifest.map(pax => (
                                <tr key={pax.puid} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-mono text-sm text-gray-600">{pax.seat}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-sm text-gray-900">{pax.name}</div>
                                        <div className="text-xs text-gray-500">{pax.nationality}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                         <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                             pax.riskLevel === 'Critical' ? 'bg-red-100 text-red-800' : 
                                             pax.riskLevel === 'High' ? 'bg-red-50 text-red-600' : 
                                             pax.riskLevel === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                                        }`}>
                                            {pax.riskLevel}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 font-bold text-sm">{pax.riskScore}</td>
                                    <td className="px-4 py-3 text-xs text-red-600">{pax.hits.join(', ')}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-4 text-gray-500">No specific passenger risks flagged for this flight.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors">Close</button>
                </div>
            </Card>
        </div>
    );
};

export const FlightStatusDashboard: React.FC = () => {
    const [viewMode, setViewMode] = useState<'list' | 'map'>('map');
    // Initialize with base flights PLUS 20 extra generated flights
    const [flights, setFlights] = useState<FlightRiskProfile[]>([...initialFlightProfiles, ...generateAdditionalFlights()]);
    const [selectedFlight, setSelectedFlight] = useState<FlightRiskProfile | null>(null);
    
    // Filters
    const [directionFilter, setDirectionFilter] = useState('Inbound');
    const [riskFilter, setRiskFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    // Live Simulation
    useEffect(() => {
        const interval = setInterval(() => {
            setFlights(currentFlights => {
                const updated = [...currentFlights];
                const randIdx = Math.floor(Math.random() * updated.length);
                const flight = { ...updated[randIdx] };
                
                // Randomly escalate risk for simulation
                if (Math.random() < 0.3) {
                     const newRiskScore = Math.floor(Math.random() * 40) + 60;
                     let newRiskLevel: FlightRiskProfile['riskLevel'] = 'Low';
                     if(newRiskScore > 90) newRiskLevel = 'Critical';
                     else if(newRiskScore > 80) newRiskLevel = 'High';
                     else if(newRiskScore > 60) newRiskLevel = 'Medium';

                     // Update summary
                     flight.riskSummary = { ...flight.riskSummary };
                     if(newRiskLevel === 'Critical') flight.riskSummary.critical++;
                     else if(newRiskLevel === 'High') flight.riskSummary.high++;
                     else if(newRiskLevel === 'Medium') flight.riskSummary.medium++;
                     
                     // Recalculate flight overall level
                     if (flight.riskSummary.critical > 0) flight.riskLevel = 'Critical';
                     else if (flight.riskSummary.high > 0) flight.riskLevel = 'High';
                     else if (flight.riskSummary.medium > 0 && flight.riskLevel !== 'High') flight.riskLevel = 'Medium';
                }
                
                updated[randIdx] = flight;
                return updated;
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const filteredFlights = useMemo(() => {
        return flights.filter(f => {
            const matchesDirection = directionFilter === 'All' || f.direction === directionFilter;
            const matchesRisk = riskFilter === 'All' || f.riskLevel === riskFilter;
            const matchesSearch = f.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) || f.airline.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesDirection && matchesRisk && matchesSearch;
        });
    }, [flights, directionFilter, riskFilter, searchTerm]);

    const kpis = useMemo(() => ({
        total: filteredFlights.length,
        critical: filteredFlights.filter(f => f.riskLevel === 'Critical').length,
        high: filteredFlights.filter(f => f.riskLevel === 'High').length,
        watchlistHits: filteredFlights.reduce((acc, f) => acc + f.riskSummary.watchlistHits, 0)
    }), [filteredFlights]);

    return (
        <div className="space-y-6">
            {selectedFlight && <RiskManifestModal flight={selectedFlight} onClose={() => setSelectedFlight(null)} />}
            
            <div className="bg-slate-800 rounded-lg p-6 shadow-lg border-l-4 border-blue-500 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <InformationCircleIcon className="h-8 w-8 text-blue-400 mr-4" />
                        <div>
                            <h2 className="text-2xl font-bold">National Command Center - Flight Operations</h2>
                            <p className="text-slate-400 text-sm mt-1">Primary situational awareness dashboard for monitoring real-time flight risks and border threats.</p>
                        </div>
                    </div>
                     <div className="flex items-center space-x-2 bg-slate-700/50 px-3 py-1.5 rounded-full border border-slate-600">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs font-mono text-green-400 uppercase">Live Risk Feed: Connected</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                 {/* Left Column: Controls & KPIs */}
                 <div className="w-full md:w-1/4 space-y-6">
                     <Card title="Flight Filters">
                        <div className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">View Mode</label>
                                <div className="flex rounded-md shadow-sm" role="group">
                                    <button onClick={() => setViewMode('list')} className={`px-4 py-2 text-sm font-medium border rounded-l-lg flex-1 flex items-center justify-center ${viewMode === 'list' ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                                        <ListBulletIcon className="h-4 w-4 mr-2" /> List
                                    </button>
                                    <button onClick={() => setViewMode('map')} className={`px-4 py-2 text-sm font-medium border rounded-r-lg flex-1 flex items-center justify-center ${viewMode === 'map' ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                                        <MapIcon className="h-4 w-4 mr-2" /> Map
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
                                <select value={directionFilter} onChange={e => setDirectionFilter(e.target.value)} className="w-full p-2 border rounded-md bg-white">
                                    <option value="All">All Directions</option>
                                    <option value="Inbound">Inbound (Arrivals)</option>
                                    <option value="Outbound">Outbound (Departures)</option>
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
                                <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} className="w-full p-2 border rounded-md bg-white">
                                    <option value="All">All Levels</option>
                                    <option value="Critical">Critical</option>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Flight # or Airline..." className="w-full p-2 border rounded-md" />
                            </div>
                        </div>
                     </Card>

                     <div className="grid grid-cols-2 gap-4">
                         <div className="bg-white p-4 rounded-lg shadow border-t-4 border-blue-500 text-center">
                             <p className="text-xs text-gray-500 uppercase">Total Flights</p>
                             <p className="text-3xl font-bold text-brand-dark">{kpis.total}</p>
                         </div>
                         <div className="bg-white p-4 rounded-lg shadow border-t-4 border-red-700 text-center">
                             <p className="text-xs text-gray-500 uppercase">Critical Threats</p>
                             <p className="text-3xl font-bold text-red-700">{kpis.critical}</p>
                         </div>
                         <div className="bg-white p-4 rounded-lg shadow border-t-4 border-red-500 text-center">
                             <p className="text-xs text-gray-500 uppercase">High Risk</p>
                             <p className="text-3xl font-bold text-red-500">{kpis.high}</p>
                         </div>
                         <div className="bg-white p-4 rounded-lg shadow border-t-4 border-gray-800 text-center">
                             <p className="text-xs text-gray-500 uppercase">Watchlist Hits</p>
                             <p className="text-3xl font-bold text-gray-800">{kpis.watchlistHits}</p>
                         </div>
                     </div>
                 </div>

                 {/* Right Column: Visualization */}
                 <div className="w-full md:w-3/4">
                    {viewMode === 'map' ? (
                        <FlightRiskMap flights={filteredFlights} onSelect={setSelectedFlight} />
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredFlights.map(flight => (
                                <div 
                                    key={flight.id} 
                                    onClick={() => setSelectedFlight(flight)}
                                    className={`bg-white rounded-lg p-4 border-l-8 shadow-sm hover:shadow-md cursor-pointer transition-all flex justify-between items-center ${
                                        flight.riskLevel === 'Critical' ? 'border-red-800' : 
                                        flight.riskLevel === 'High' ? 'border-red-500' : 
                                        flight.riskLevel === 'Medium' ? 'border-amber-500' : 'border-green-500'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <div className="p-3 bg-gray-100 rounded-full mr-4">
                                            <PaperAirplaneIcon className={`h-6 w-6 ${flight.direction === 'Inbound' ? 'rotate-90 text-blue-600' : '-rotate-90 text-green-600'}`} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-brand-dark">{flight.flightNumber}</h3>
                                            <p className="text-sm text-gray-600">{flight.airline} • <span className="font-mono">{flight.origin} &rarr; {flight.destination}</span></p>
                                            <p className="text-xs text-gray-500 mt-1">Scheduled: {flight.scheduledTime} ({flight.status})</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex space-x-6 text-center">
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase">Total Pax</p>
                                            <p className="font-bold text-gray-700">{flight.totalPax}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase">Critical/High</p>
                                            <p className={`font-bold text-lg ${flight.riskSummary.critical + flight.riskSummary.high > 0 ? 'text-red-600' : 'text-gray-300'}`}>
                                                {flight.riskSummary.critical + flight.riskSummary.high}
                                            </p>
                                        </div>
                                         <div>
                                            <p className="text-xs text-gray-400 uppercase">Hits</p>
                                            <p className={`font-bold text-lg ${flight.riskSummary.watchlistHits > 0 ? 'text-brand-dark' : 'text-gray-300'}`}>
                                                {flight.riskSummary.watchlistHits}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredFlights.length === 0 && <p className="text-center text-gray-500 py-10">No flights match filters.</p>}
                        </div>
                    )}
                 </div>
            </div>
        </div>
    );
};
