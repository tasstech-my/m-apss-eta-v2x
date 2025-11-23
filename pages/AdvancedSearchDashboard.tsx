import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import type { ConsolidatedTravelerRecord, JourneyPassenger } from '../types';

// --- MOCK DATA ---
const mockTravelers: ConsolidatedTravelerRecord[] = [
    { puid: 'PUID-1001', name: 'John Doe', dob: '1985-04-12', nationality: 'USA', photoUrl: 'https://picsum.photos/seed/puid1/100', riskIndicator: 'High', journeys: [], dataSubmissions: [] },
    { puid: 'PUID-2034', name: 'Jane Smith', dob: '1992-08-22', nationality: 'GBR', photoUrl: 'https://picsum.photos/seed/puid2/100', riskIndicator: 'Low', journeys: [], dataSubmissions: [] },
    { puid: 'PUID-8572', name: 'Klaus Mueller', dob: '1978-12-01', nationality: 'DEU', photoUrl: 'https://picsum.photos/seed/puid3/100', riskIndicator: 'Low', journeys: [], dataSubmissions: [] },
    { puid: 'PUID-A1B2', name: 'Emily Clark', dob: '1990-07-19', nationality: 'CAN', photoUrl: 'https://picsum.photos/seed/puid4/100', riskIndicator: 'Medium', journeys: [], dataSubmissions: [] },
];

const mockManifest: JourneyPassenger[] = [
    { puid: 'PUID-1001', name: 'John Doe', nationality: 'USA', riskIndicator: 'High' },
    { puid: 'PUID-2034', name: 'Jane Smith', nationality: 'GBR', riskIndicator: 'Low' },
    { puid: 'PUID-A1B2', name: 'Emily Clark', nationality: 'CAN', riskIndicator: 'Medium' },
    { puid: 'PUID-C3D4', name: 'Carlos Garcia', nationality: 'ESP', riskIndicator: 'Low' },
];

const mockPnrGroup: ConsolidatedTravelerRecord[] = [
    { puid: 'PUID-1001', name: 'John Doe', dob: '1985-04-12', nationality: 'USA', photoUrl: 'https://picsum.photos/seed/puid1/100', riskIndicator: 'High', journeys: [], dataSubmissions: [] },
    { puid: 'PUID-XYZ1', name: 'Mary Doe', dob: '1986-05-15', nationality: 'USA', photoUrl: 'https://picsum.photos/seed/puid5/100', riskIndicator: 'Medium', journeys: [], dataSubmissions: [] },
];

// --- UI COMPONENTS ---
const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${active ? 'border-brand-primary text-brand-secondary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        aria-current={active ? 'page' : undefined}
    >
        {children}
    </button>
);

const RiskIndicatorPill: React.FC<{ risk: JourneyPassenger['riskIndicator'] }> = ({ risk }) => {
    const styles = {
        Low: 'bg-green-100 text-green-800',
        Medium: 'bg-amber-100 text-amber-800',
        High: 'bg-red-100 text-red-800',
        Critical: 'bg-red-700 text-white',
    };
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[risk]}`}>{risk}</span>;
};

export const AdvancedSearchDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'traveler' | 'journey' | 'pnr'>('traveler');
    
    // State for Traveler Search
    const [travelerName, setTravelerName] = useState('');
    const [passportNum, setPassportNum] = useState('');
    const [dob, setDob] = useState('');
    const [travelerResults, setTravelerResults] = useState<ConsolidatedTravelerRecord[] | null>(null);

    // State for Journey Search
    const [flightNum, setFlightNum] = useState('');
    const [flightDate, setFlightDate] = useState('');
    const [journeyResults, setJourneyResults] = useState<JourneyPassenger[] | null>(null);

    // State for PNR Search
    const [pnrLocator, setPnrLocator] = useState('');
    const [pnrResults, setPnrResults] = useState<ConsolidatedTravelerRecord[] | null>(null);

    const handleTravelerSearch = () => {
        if (!travelerName && !passportNum && !dob) {
            setTravelerResults([]);
            return;
        }
        setTravelerResults(mockTravelers.filter(t => t.name.toLowerCase().includes(travelerName.toLowerCase()) && t.dob.includes(dob)));
    };

    const handleJourneySearch = () => {
        if (!flightNum || !flightDate) {
            setJourneyResults([]);
            return;
        }
        setJourneyResults(mockManifest);
    };

    const handlePnrSearch = () => {
        if (!pnrLocator) {
            setPnrResults([]);
            return;
        }
        setPnrResults(mockPnrGroup);
    };
    
    const handleInitiateLinkAnalysis = () => {
        alert("Link Analysis Initiated! This would open the Link Detection/Analysis System module, pre-populated with the travelers from this PNR.");
    };

    return (
        <Card>
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <TabButton active={activeTab === 'traveler'} onClick={() => setActiveTab('traveler')}>Traveler Search</TabButton>
                    <TabButton active={activeTab === 'journey'} onClick={() => setActiveTab('journey')}>Journey Leg Search</TabButton>
                    <TabButton active={activeTab === 'pnr'} onClick={() => setActiveTab('pnr')}>Booking Reference (PNR) Search</TabButton>
                </nav>
            </div>
            
            <div className="pt-6">
                {activeTab === 'traveler' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input value={travelerName} onChange={e => setTravelerName(e.target.value)} placeholder="Name..." className="p-2 border rounded-md" />
                            <input value={passportNum} onChange={e => setPassportNum(e.target.value)} placeholder="Passport Number..." className="p-2 border rounded-md" />
                            <input type="date" value={dob} onChange={e => setDob(e.target.value)} className="p-2 border rounded-md" />
                        </div>
                        <button onClick={handleTravelerSearch} className="px-4 py-2 bg-brand-secondary text-white rounded-lg">Search Travelers</button>
                        {travelerResults && (
                             <div className="mt-4">
                                <h3 className="font-semibold mb-2">Results ({travelerResults.length})</h3>
                                <div className="overflow-x-auto border rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left">Name</th><th className="px-4 py-2 text-left">PUID</th><th className="px-4 py-2 text-left">Nationality</th><th className="px-4 py-2 text-left">Action</th></tr></thead>
                                        <tbody>{travelerResults.map(t => <tr key={t.puid} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium">{t.name}</td><td className="px-4 py-3 font-mono">{t.puid}</td><td>{t.nationality}</td>
                                            <td className="px-4 py-3"><Link to={`/data-intelligence/traveler/${t.puid}`} className="text-brand-secondary hover:underline">View Record</Link></td>
                                        </tr>)}</tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'journey' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input value={flightNum} onChange={e => setFlightNum(e.target.value)} placeholder="Flight Number (e.g., MH370)" className="p-2 border rounded-md" />
                            <input type="date" value={flightDate} onChange={e => setFlightDate(e.target.value)} className="p-2 border rounded-md" />
                        </div>
                        <button onClick={handleJourneySearch} className="px-4 py-2 bg-brand-secondary text-white rounded-lg">Search Journey</button>
                        {journeyResults && (
                            <div className="mt-4">
                                <h3 className="font-semibold mb-2">Passenger Manifest for {flightNum.toUpperCase()} on {flightDate} ({journeyResults.length} passengers)</h3>
                                <div className="overflow-x-auto border rounded-lg max-h-96">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50 sticky top-0"><tr><th className="px-4 py-2 text-left">Name</th><th className="px-4 py-2 text-left">PUID</th><th className="px-4 py-2 text-left">Nationality</th><th className="px-4 py-2 text-left">Risk Status</th><th className="px-4 py-2 text-left">Action</th></tr></thead>
                                        <tbody className="bg-white divide-y divide-gray-200">{journeyResults.map(p => <tr key={p.puid} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium">{p.name}</td><td className="px-4 py-3 font-mono">{p.puid}</td><td>{p.nationality}</td>
                                            <td className="px-4 py-3"><RiskIndicatorPill risk={p.riskIndicator} /></td>
                                            <td className="px-4 py-3"><Link to={`/data-intelligence/traveler/${p.puid}`} className="text-brand-secondary hover:underline">View Record</Link></td>
                                        </tr>)}</tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                
                {activeTab === 'pnr' && (
                     <div className="space-y-6">
                        <p className="text-sm text-gray-600">Find all travelers who were booked together on the same reservation.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <input value={pnrLocator} onChange={e => setPnrLocator(e.target.value)} placeholder="PNR Locator / Booking Reference..." className="p-2 border rounded-md" />
                           <button onClick={handlePnrSearch} className="px-4 py-2 bg-brand-secondary text-white rounded-lg">Search by Booking</button>
                        </div>
                        {pnrResults && (
                            <div className="mt-4">
                                <h3 className="font-semibold mb-2">Travelers in PNR {pnrLocator.toUpperCase()} ({pnrResults.length})</h3>
                                <div className="overflow-x-auto border rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left">Name</th><th className="px-4 py-2 text-left">PUID</th><th className="px-4 py-2 text-left">DoB</th><th className="px-4 py-2 text-left">Action</th></tr></thead>
                                        <tbody className="bg-white divide-y divide-gray-200">{pnrResults.map(t => <tr key={t.puid} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium">{t.name}</td><td className="px-4 py-3 font-mono">{t.puid}</td><td className="px-4 py-3">{t.dob}</td>
                                            <td className="px-4 py-3"><Link to={`/data-intelligence/traveler/${t.puid}`} className="text-brand-secondary hover:underline">View Record</Link></td>
                                        </tr>)}</tbody>
                                    </table>
                                </div>
                                <div className="mt-6 text-center">
                                    <button onClick={handleInitiateLinkAnalysis} className="px-6 py-3 bg-brand-primary text-white font-bold rounded-lg shadow-lg hover:bg-brand-dark transition-transform hover:scale-105">
                                        Initiate Link Analysis
                                    </button>
                                    <p className="text-xs text-gray-500 mt-2">Start a network analysis with these travelers.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
};
