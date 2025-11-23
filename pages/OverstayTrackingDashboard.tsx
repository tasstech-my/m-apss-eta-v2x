
import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '../components/Card';
import { DocumentTextIcon, ScaleIcon, ArrowDownLeftIcon, ArrowUpRightIcon, CheckCircleIcon, XMarkIcon, IdentificationIcon, UsersIcon, ClockIcon } from '../constants';
import type { OverstayRecord, OverstayStatus, MatchingConfiguration, MovementRecord, HistoricalTravelerProfile } from '../types';

// --- MOCK DATA ---
const initialOverstayers: OverstayRecord[] = [
    { id: 'OS-101', puid: 'PUID-5521', travelerName: 'Wei Chen', nationality: 'CHN', entryDate: '2023-05-10', entryPort: 'KUL', visaType: 'Tourist (30 Days)', expiryDate: '2023-06-09', daysOverstayed: 142, riskScore: 45, status: 'Active', lastKnownAddress: 'City Center Hotel, KL', authorizationSource: 'e-Visa Portal', allowedDuration: 30 },
    { id: 'OS-102', puid: 'PUID-9912', travelerName: 'Ali Hassan', nationality: 'PAK', entryDate: '2023-08-15', entryPort: 'PEN', visaType: 'Student', expiryDate: '2023-09-15', daysOverstayed: 45, riskScore: 75, status: 'Flagged for Enforcement', lastKnownAddress: 'University Dorms', authorizationSource: 'National Visa System (NVS)', allowedDuration: 30, leadGenerated: true, assignedOfficer: 'Officer Tan', caseId: 'CASE-2023-881' },
    { id: 'OS-103', puid: 'PUID-1001', travelerName: 'John Doe', nationality: 'USA', entryDate: '2023-01-01', entryPort: 'KUL', visaType: 'Business', expiryDate: '2023-04-01', daysOverstayed: 210, riskScore: 20, status: 'Active', authorizationSource: 'National Visa System (NVS)', allowedDuration: 90 },
    { id: 'OS-104', puid: 'PUID-7788', travelerName: 'Elena Smirnova', nationality: 'RUS', entryDate: '2023-09-20', entryPort: 'LGK', visaType: 'Tourist', expiryDate: '2023-10-20', daysOverstayed: 10, riskScore: 60, status: 'Active', authorizationSource: 'Visa on Arrival', allowedDuration: 30 },
    { id: 'OS-105', puid: 'PUID-3344', travelerName: 'Ahmed Al-Fayed', nationality: 'EGY', entryDate: '2023-07-01', entryPort: 'KUL', visaType: 'Social Visit', expiryDate: '2023-07-30', daysOverstayed: 91, riskScore: 85, status: 'Flagged for Enforcement', authorizationSource: 'e-Visa Portal', allowedDuration: 30, leadGenerated: true, assignedOfficer: 'Officer Lee', caseId: 'CASE-2023-902' },
];

// Mock data for the matching engine simulation
const mockOpenArrivals: MovementRecord[] = [
    { name: 'Sarah Miller', dob: '1990-05-12', documentNumber: 'G88776655', flightNumber: 'BA11', date: '2023-10-01', type: 'Arrival' },
    { name: 'Liu Wei', dob: '1985-02-20', documentNumber: 'E1234567', flightNumber: 'CA988', date: '2023-09-15', type: 'Arrival' },
    { name: 'Ravi Patel', dob: '1992-11-30', documentNumber: 'Z99887766', flightNumber: 'MH192', date: '2023-10-05', type: 'Arrival' },
];

const mockIncomingDepartures: MovementRecord[] = [
    { name: 'Sarah Miller', dob: '1990-05-12', documentNumber: 'G88776655', flightNumber: 'BA12', date: '2023-10-15', type: 'Departure' }, // Exact match
    { name: 'Liu W.', dob: '1985-02-20', documentNumber: 'E1234567', flightNumber: 'CA989', date: '2023-10-28', type: 'Departure' }, // Fuzzy Name match
    { name: 'Ravi Patel', dob: '1992-11-30', documentNumber: 'Z99880000', flightNumber: 'MH193', date: '2023-10-12', type: 'Departure' }, // Doc mismatch (No match)
];

// Mock Historical Profiles for Analysis
const mockHistoricalProfiles: HistoricalTravelerProfile[] = [
    {
        puid: 'PUID-VISA-RUN-01',
        travelerName: 'Marcus Aurelius',
        nationality: 'ITA',
        totalDaysInCountry: 195,
        periodCount: 6,
        averageStayDuration: 32,
        violationCount: 0, // Technically no single overstay, but aggregate abuse
        flag: 'Visa Run Pattern',
        history: [
            { entryDate: '2023-01-01', exitDate: '2023-02-01', duration: 31, visaType: 'Tourist' },
            { entryDate: '2023-02-05', exitDate: '2023-03-08', duration: 31, visaType: 'Tourist' },
            { entryDate: '2023-03-15', exitDate: '2023-04-15', duration: 31, visaType: 'Tourist' },
            { entryDate: '2023-05-01', exitDate: '2023-06-01', duration: 31, visaType: 'Tourist' },
            { entryDate: '2023-07-01', exitDate: '2023-08-01', duration: 31, visaType: 'Tourist' },
            { entryDate: '2023-09-01', exitDate: '2023-10-01', duration: 30, visaType: 'Tourist' },
        ]
    },
    {
        puid: 'PUID-REPEAT-02',
        travelerName: 'Ivan Drago',
        nationality: 'RUS',
        totalDaysInCountry: 120,
        periodCount: 2,
        averageStayDuration: 60,
        violationCount: 2, // Two previous overstays
        flag: 'Repeat Overstayer',
        history: [
            { entryDate: '2022-01-01', exitDate: '2022-03-01', duration: 59, visaType: 'Tourist (30 Days)' }, // Overstayed 29 days
            { entryDate: '2023-06-01', exitDate: '2023-08-01', duration: 61, visaType: 'Tourist (30 Days)' }, // Overstayed 31 days
        ]
    }
];


// Mock Visa Adaptor Status
const visaAdaptors = [
    { name: 'National Visa System (NVS)', status: 'Online', lastSync: 'Just now', type: 'Internal' },
    { name: 'e-Visa Portal', status: 'Online', lastSync: '2 mins ago', type: 'External' },
    { name: 'Resident Permit DB', status: 'Online', lastSync: '5 mins ago', type: 'Internal' },
    { name: 'Visa on Arrival System', status: 'Online', lastSync: '10 mins ago', type: 'Internal' },
];

// --- UI COMPONENTS ---

const StatusPill: React.FC<{ status: OverstayStatus }> = ({ status }) => {
    const colors: Record<OverstayStatus, string> = {
        'Active': 'bg-red-100 text-red-800',
        'Resolved': 'bg-green-100 text-green-800',
        'Flagged for Enforcement': 'bg-amber-100 text-amber-800',
    };
    return <span className={`px-2 py-1 text-xs font-bold rounded-full ${colors[status]}`}>{status}</span>;
};

const VerificationModal: React.FC<{ record: OverstayRecord; onClose: () => void }> = ({ record, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
        <Card title="Cross-Reference Verification" className="w-full max-w-2xl animate-scale-in">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold text-brand-dark">{record.travelerName}</h3>
                    <p className="text-sm text-gray-500">{record.puid} • {record.nationality}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase">Status</p>
                    <StatusPill status={record.status} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-bold text-blue-800 mb-3 flex items-center">
                        <DocumentTextIcon className="h-5 w-5 mr-2" />
                        Entry Data (Immigration)
                    </h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span>Date of Entry:</span> <span className="font-mono font-bold">{record.entryDate}</span></div>
                        <div className="flex justify-between"><span>Port:</span> <span className="font-mono">{record.entryPort}</span></div>
                    </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-bold text-green-800 mb-3 flex items-center">
                        <IdentificationIcon className="h-5 w-5 mr-2" />
                        Authorized Stay (Visa Adaptor)
                    </h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span>Visa Type:</span> <span className="font-medium">{record.visaType}</span></div>
                        <div className="flex justify-between"><span>Authorized Duration:</span> <span className="font-bold">{record.allowedDuration} Days</span></div>
                        <div className="flex justify-between"><span>Source:</span> <span className="text-xs bg-green-200 px-2 py-0.5 rounded text-green-800">{record.authorizationSource}</span></div>
                        <div className="flex justify-between border-t border-green-200 pt-2 mt-2"><span>Expiry Date:</span> <span className="font-mono font-bold text-green-900">{record.expiryDate}</span></div>
                    </div>
                </div>
            </div>

            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                <p className="text-sm text-gray-600">Overstay Calculation</p>
                <div className="flex items-center justify-center space-x-4 mt-2 font-mono">
                    <span>Current Date</span>
                    <span>-</span>
                    <span>Expiry Date ({record.expiryDate})</span>
                    <span>=</span>
                    <span className="text-2xl font-bold text-red-600">{record.daysOverstayed} Days Over</span>
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <button onClick={onClose} className="px-4 py-2 bg-brand-primary text-white rounded hover:bg-brand-dark">Close Verification</button>
            </div>
        </Card>
    </div>
);

const VisaAdaptorStatus: React.FC = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visaAdaptors.map(adaptor => (
            <div key={adaptor.name} className="flex items-center justify-between p-3 bg-white border rounded shadow-sm">
                <div>
                    <p className="font-semibold text-sm text-brand-dark">{adaptor.name}</p>
                    <p className="text-xs text-gray-500">{adaptor.type}</p>
                </div>
                <div className="text-right">
                    <div className="flex items-center justify-end space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs font-bold text-green-600">{adaptor.status}</span>
                    </div>
                    <p className="text-[10px] text-gray-400">Sync: {adaptor.lastSync}</p>
                </div>
            </div>
        ))}
    </div>
);

export const OverstayTrackingDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'live' | 'historical'>('live');
    
    // Live Overstay State
    const [overstayers, setOverstayers] = useState<OverstayRecord[]>(initialOverstayers);
    const [filter, setFilter] = useState<'All' | 'Active' | 'Flagged'>('All');
    const [search, setSearch] = useState('');
    const [selectedRecord, setSelectedRecord] = useState<OverstayRecord | null>(null);
    const [recentLeads, setRecentLeads] = useState<OverstayRecord[]>(initialOverstayers.filter(o => o.leadGenerated));

    // Historical Analysis State
    const [historicalSearch, setHistoricalSearch] = useState('');
    const [historicalResults, setHistoricalResults] = useState<HistoricalTravelerProfile[] | null>(null);

    // Matching Logic State
    const [weights, setWeights] = useState<MatchingConfiguration['weights']>({ name: 40, dob: 30, document: 30 });
    const [simulatingMatch, setSimulatingMatch] = useState(false);
    const [currentArrival, setCurrentArrival] = useState<MovementRecord | null>(null);
    const [currentDeparture, setCurrentDeparture] = useState<MovementRecord | null>(null);
    const [matchResult, setMatchResult] = useState<{ score: number, status: 'Match' | 'No Match' } | null>(null);

    const filteredList = useMemo(() => {
        return overstayers.filter(os => {
            const matchesFilter = filter === 'All' || 
                                  (filter === 'Active' && os.status === 'Active') || 
                                  (filter === 'Flagged' && os.status === 'Flagged for Enforcement');
            const matchesSearch = os.travelerName.toLowerCase().includes(search.toLowerCase()) || 
                                  os.nationality.toLowerCase().includes(search.toLowerCase()) ||
                                  os.puid.toLowerCase().includes(search.toLowerCase());
            return matchesFilter && matchesSearch;
        }).sort((a, b) => b.daysOverstayed - a.daysOverstayed);
    }, [overstayers, filter, search]);

    const kpis = useMemo(() => ({
        totalActive: overstayers.filter(os => os.status !== 'Resolved').length,
        highRisk: overstayers.filter(os => os.riskScore > 70 && os.status !== 'Resolved').length,
        newToday: 12 // Mock value
    }), [overstayers]);
    
    const pendingLeadCount = useMemo(() => overstayers.filter(o => o.status === 'Active' && !o.leadGenerated).length, [overstayers]);

    const handleAction = (id: string, action: 'Flag' | 'Resolve') => {
        setOverstayers(prev => prev.map(os => {
            if (os.id === id) {
                return { ...os, status: action === 'Flag' ? 'Flagged for Enforcement' : 'Resolved' };
            }
            return os;
        }));
    };

    const generateLeads = () => {
        const eligible = overstayers.filter(o => o.status === 'Active' && !o.leadGenerated);
        if (eligible.length === 0) return;

        const newLeads: OverstayRecord[] = [];

        const updatedList = overstayers.map(o => {
            if (o.status === 'Active' && !o.leadGenerated) {
                const updated = {
                    ...o,
                    status: 'Flagged for Enforcement' as OverstayStatus,
                    leadGenerated: true,
                    assignedOfficer: 'Officer Tan', // Simulating round-robin assignment
                    caseId: `CASE-2023-${Math.floor(Math.random() * 9000) + 1000}`
                };
                newLeads.push(updated);
                return updated;
            }
            return o;
        });
        
        setOverstayers(updatedList);
        setRecentLeads(prev => [...newLeads, ...prev]);
        alert(`Successfully generated ${newLeads.length} new violation leads.`);
    };
    
    const handleHistoricalSearch = () => {
        // Simple mock search logic
        if (!historicalSearch) {
            setHistoricalResults(null);
            return;
        }
        // Filter mock data
        const results = mockHistoricalProfiles.filter(p => 
            p.travelerName.toLowerCase().includes(historicalSearch.toLowerCase()) ||
            p.puid.toLowerCase().includes(historicalSearch.toLowerCase())
        );
        setHistoricalResults(results);
    };

    // Simulation for Matching Engine
    useEffect(() => {
        const interval = setInterval(() => {
            if (simulatingMatch) return;

            setSimulatingMatch(true);
            setMatchResult(null);
            
            const index = Math.floor(Math.random() * mockOpenArrivals.length);
            const arr = mockOpenArrivals[index];
            // 70% chance to pick the corresponding departure (even if fuzzy), 30% chance to pick a mismatch
            const dep = Math.random() < 0.7 ? mockIncomingDepartures[index] : mockIncomingDepartures[(index + 1) % mockIncomingDepartures.length];
            
            setCurrentArrival(arr);
            setCurrentDeparture(dep);

            setTimeout(() => {
                // Simple mock scoring logic
                let score = 0;
                // Name Score
                const nameSim = arr.name === dep.name ? 1 : (arr.name.includes(dep.name) || dep.name.includes(arr.name)) ? 0.8 : 0;
                score += nameSim * weights.name;
                
                // DOB Score
                const dobSim = arr.dob === dep.dob ? 1 : 0;
                score += dobSim * weights.dob;
                
                // Doc Score
                const docSim = arr.documentNumber === dep.documentNumber ? 1 : 0;
                score += docSim * weights.document;
                
                const totalWeight = weights.name + weights.dob + weights.document;
                const finalScore = (score / totalWeight) * 100;
                
                setMatchResult({
                    score: finalScore,
                    status: finalScore > 75 ? 'Match' : 'No Match'
                });
                
                setTimeout(() => {
                    setSimulatingMatch(false);
                }, 2000); // Show result for 2 seconds
            }, 1500); // Calculate for 1.5 seconds

        }, 6000); // Run every 6 seconds
        return () => clearInterval(interval);
    }, [simulatingMatch, weights]);


    return (
        <div className="space-y-6">
            {selectedRecord && <VerificationModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />}
            
            <Card className="bg-red-50 border-l-4 border-red-500 text-red-900">
                <div className="flex items-center">
                    <DocumentTextIcon className="h-8 w-8 text-red-400 mr-4" />
                    <div>
                        <h2 className="text-2xl font-bold">Post-Travel: Overstay Tracking</h2>
                        <p className="text-red-700 text-sm mt-1">
                            Automated matching of Entry vs. Exit records to identify and track unauthorized overstayers for enforcement.
                        </p>
                    </div>
                </div>
            </Card>
            
            <div className="bg-white rounded-lg shadow-sm mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('live')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'live' ? 'border-brand-primary text-brand-secondary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            Live Overstay Tracking (Operational)
                        </button>
                        <button
                            onClick={() => setActiveTab('historical')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'historical' ? 'border-brand-primary text-brand-secondary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            Historical Analysis (Repeat/Aggregate)
                        </button>
                    </nav>
                </div>
            </div>

            {activeTab === 'live' && (
            <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="p-4 bg-white rounded-lg shadow border-t-4 border-red-600">
                        <p className="text-sm text-gray-500 uppercase">Total Active Overstayers</p>
                        <p className="text-3xl font-bold text-brand-dark">{kpis.totalActive}</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg shadow border-t-4 border-amber-500">
                        <p className="text-sm text-gray-500 uppercase">High Risk Targets</p>
                        <p className="text-3xl font-bold text-amber-600">{kpis.highRisk}</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg shadow border-t-4 border-blue-500">
                        <p className="text-sm text-gray-500 uppercase">New Overstays (24h)</p>
                        <p className="text-3xl font-bold text-blue-600">+{kpis.newToday}</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        <Card title="Enforcement Lead Generation" className="border border-indigo-200 bg-indigo-50/30">
                            <div className="text-center mb-4">
                                <p className="text-sm text-gray-500">Eligible for Lead Creation</p>
                                <p className="text-3xl font-bold text-indigo-600">{pendingLeadCount}</p>
                            </div>
                            <button 
                                onClick={generateLeads}
                                disabled={pendingLeadCount === 0}
                                className="w-full py-2 bg-indigo-600 text-white font-bold rounded shadow hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors mb-4 flex items-center justify-center"
                            >
                                <UsersIcon className="h-5 w-5 mr-2" />
                                Generate & Assign Leads
                            </button>
                            
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Recent Case Assignments</h4>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                    {recentLeads.slice(0, 5).map(lead => (
                                        <div key={lead.id} className="text-xs p-2 bg-white border rounded shadow-sm">
                                            <div className="flex justify-between font-bold">
                                                <span>{lead.travelerName}</span>
                                                <span className="text-indigo-600">{lead.caseId}</span>
                                            </div>
                                            <div className="text-gray-500 mt-1">
                                                Assigned to: <span className="text-gray-700 font-medium">{lead.assignedOfficer}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                        
                        <Card title="Visa Adaptor Integration Health">
                            <VisaAdaptorStatus />
                        </Card>

                        <Card title="Matching Logic Configuration">
                            <div className="flex items-center mb-4 text-sm text-gray-600">
                                <ScaleIcon className="h-5 w-5 mr-2 text-brand-secondary" />
                                <p>Adjust weightings for correlation logic.</p>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span>Name Match</span>
                                        <span className="font-bold">{weights.name}%</span>
                                    </div>
                                    <input type="range" min="0" max="100" value={weights.name} onChange={e => setWeights({...weights, name: parseInt(e.target.value)})} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span>DOB Match</span>
                                        <span className="font-bold">{weights.dob}%</span>
                                    </div>
                                    <input type="range" min="0" max="100" value={weights.dob} onChange={e => setWeights({...weights, dob: parseInt(e.target.value)})} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span>Document Number</span>
                                        <span className="font-bold">{weights.document}%</span>
                                    </div>
                                    <input type="range" min="0" max="100" value={weights.document} onChange={e => setWeights({...weights, document: parseInt(e.target.value)})} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                                </div>
                            </div>
                        </Card>
                    </div>
                    
                    <div className="lg:col-span-2 space-y-6">
                        <Card title="Live Arrival/Departure Correlation Engine">
                            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center text-sm min-h-[160px]">
                                {/* Arrival Side */}
                                <div className={`p-3 border rounded-lg transition-all ${simulatingMatch ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                                    <div className="flex items-center mb-2 text-blue-800 font-bold">
                                        <ArrowDownLeftIcon className="h-4 w-4 mr-1" />
                                        <span>Open Arrival Record</span>
                                    </div>
                                    {currentArrival ? (
                                        <div className="space-y-1 text-xs">
                                            <p><span className="font-semibold">Name:</span> {currentArrival.name}</p>
                                            <p><span className="font-semibold">DOB:</span> {currentArrival.dob}</p>
                                            <p><span className="font-semibold">Doc:</span> {currentArrival.documentNumber}</p>
                                            <p className="text-gray-500">Flight: {currentArrival.flightNumber}</p>
                                        </div>
                                    ) : <p className="text-gray-400 italic">Waiting for record...</p>}
                                </div>

                                {/* Matching Animation */}
                                <div className="flex flex-col items-center justify-center w-32">
                                    {simulatingMatch && !matchResult ? (
                                        <>
                                            <div className="w-8 h-8 border-4 border-brand-secondary border-t-transparent rounded-full animate-spin mb-2"></div>
                                            <span className="text-xs font-bold text-brand-secondary">Correlating...</span>
                                        </>
                                    ) : matchResult ? (
                                        <div className={`text-center p-2 rounded-lg border-2 ${matchResult.status === 'Match' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                                            {matchResult.status === 'Match' ? <CheckCircleIcon className="h-8 w-8 mx-auto mb-1" /> : <XMarkIcon className="h-8 w-8 mx-auto mb-1" />}
                                            <p className="font-bold text-sm">{matchResult.status}</p>
                                            <p className="text-xs font-mono">{matchResult.score.toFixed(1)}%</p>
                                            <p className="text-[10px] uppercase mt-1">{matchResult.status === 'Match' ? 'Exit Confirmed' : 'No Exit Found'}</p>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 text-xs">Idle</span>
                                    )}
                                </div>

                                {/* Departure Side */}
                                <div className={`p-3 border rounded-lg transition-all ${simulatingMatch ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
                                    <div className="flex items-center mb-2 text-amber-800 font-bold">
                                        <ArrowUpRightIcon className="h-4 w-4 mr-1" />
                                        <span>Outgoing Departure</span>
                                    </div>
                                    {currentDeparture ? (
                                        <div className="space-y-1 text-xs">
                                            <p><span className="font-semibold">Name:</span> {currentDeparture.name}</p>
                                            <p><span className="font-semibold">DOB:</span> {currentDeparture.dob}</p>
                                            <p><span className="font-semibold">Doc:</span> {currentDeparture.documentNumber}</p>
                                            <p className="text-gray-500">Flight: {currentDeparture.flightNumber}</p>
                                        </div>
                                    ) : <p className="text-gray-400 italic">Waiting for record...</p>}
                                </div>
                            </div>
                        </Card>
                        
                        <Card title="Live Overstay Feed">
                            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                                <div className="flex gap-2">
                                    <button onClick={() => setFilter('All')} className={`px-3 py-1 text-xs rounded-full ${filter === 'All' ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-600'}`}>All</button>
                                    <button onClick={() => setFilter('Active')} className={`px-3 py-1 text-xs rounded-full ${filter === 'Active' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>Active</button>
                                    <button onClick={() => setFilter('Flagged')} className={`px-3 py-1 text-xs rounded-full ${filter === 'Flagged' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>Flagged</button>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Search Name, NAT, PUID..." 
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="p-2 border rounded text-sm w-full sm:w-64"
                                />
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Identity</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visa Details</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overstay</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredList.map(record => (
                                            <tr key={record.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedRecord(record)}>
                                                <td className="px-4 py-3">
                                                    <p className="font-bold text-brand-dark">{record.travelerName}</p>
                                                    <p className="text-xs text-gray-500">{record.nationality} • {record.puid}</p>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    <p>{record.visaType}</p>
                                                    <p className="text-xs text-gray-400">Exp: {record.expiryDate}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-red-600 font-bold">{record.daysOverstayed} days</span>
                                                </td>
                                                <td className="px-4 py-3"><StatusPill status={record.status} /></td>
                                                <td className="px-4 py-3 text-right space-x-2">
                                                    <button onClick={(e) => { e.stopPropagation(); setSelectedRecord(record); }} className="text-xs bg-brand-secondary text-white px-2 py-1 rounded hover:bg-brand-primary">Verify</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                </div>
            </>
            )}

            {activeTab === 'historical' && (
                <div className="space-y-6">
                     <Card title="Aggregate Stay Calculator (Rolling 365 Days)">
                        <div className="mb-6">
                            <div className="flex gap-4 mb-4">
                                <input 
                                    type="text" 
                                    value={historicalSearch}
                                    onChange={(e) => setHistoricalSearch(e.target.value)}
                                    placeholder="Search PUID or Name to Analyze..." 
                                    className="flex-1 p-2 border rounded text-sm" 
                                />
                                <button onClick={handleHistoricalSearch} className="px-4 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-primary">Analyze History</button>
                            </div>
                        </div>
                        
                        {historicalResults && historicalResults.length > 0 ? (
                            <div className="space-y-6">
                                {historicalResults.map(profile => (
                                    <div key={profile.puid} className="border rounded-lg p-4 bg-gray-50">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-brand-dark">{profile.travelerName}</h3>
                                                <p className="text-sm text-gray-500">{profile.nationality} • {profile.puid}</p>
                                            </div>
                                            <div className="text-right">
                                                {profile.flag !== 'None' && (
                                                    <span className="inline-block bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full mb-2 border border-red-200">
                                                        Flag: {profile.flag}
                                                    </span>
                                                )}
                                                <p className="text-xs text-gray-500">Policy Limit: 180 Days / 365 Days</p>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                            <div className={`p-3 rounded border text-center ${profile.totalDaysInCountry > 180 ? 'bg-red-50 border-red-300' : 'bg-white'}`}>
                                                <p className="text-xs text-gray-500 uppercase">Aggregate Stay</p>
                                                <p className={`text-2xl font-bold ${profile.totalDaysInCountry > 180 ? 'text-red-600' : 'text-green-600'}`}>{profile.totalDaysInCountry} Days</p>
                                            </div>
                                            <div className="p-3 rounded border bg-white text-center">
                                                <p className="text-xs text-gray-500 uppercase">Visit Count</p>
                                                <p className="text-2xl font-bold text-brand-dark">{profile.periodCount}</p>
                                            </div>
                                            <div className="p-3 rounded border bg-white text-center">
                                                <p className="text-xs text-gray-500 uppercase">Avg. Duration</p>
                                                <p className="text-2xl font-bold text-brand-dark">{profile.averageStayDuration} Days</p>
                                            </div>
                                        </div>
                                        
                                        <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center"><ClockIcon className="h-4 w-4 mr-2"/> Travel Timeline (Current Year)</h4>
                                        <div className="space-y-2">
                                            {profile.history.map((period, idx) => (
                                                <div key={idx} className="flex items-center text-sm bg-white p-2 rounded border">
                                                    <div className="w-24 font-mono text-gray-500 text-xs">Entry: {period.entryDate}</div>
                                                    <div className="flex-1 mx-4 h-2 bg-gray-200 rounded overflow-hidden">
                                                        <div className="h-full bg-blue-500" style={{ width: '100%' }}></div>
                                                    </div>
                                                    <div className="w-24 font-mono text-gray-500 text-xs text-right">Exit: {period.exitDate}</div>
                                                    <div className="w-20 text-right font-bold ml-4">{period.duration} Days</div>
                                                    <div className="w-32 text-right text-xs text-gray-400 ml-4">{period.visaType}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-8">Search to view historical analysis or aggregate stay calculations.</p>
                        )}
                     </Card>
                     
                     <Card title="Repeat Overstayers Watchlist">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Identity</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Violation Count</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Flag Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {mockHistoricalProfiles.filter(p => p.violationCount > 0).map(p => (
                                        <tr key={p.puid} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-bold text-gray-900">{p.travelerName}</div>
                                                <div className="text-xs text-gray-500">{p.puid}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center font-bold text-red-600">
                                                {p.violationCount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                    {p.flag}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-secondary hover:underline cursor-pointer">
                                                View Full History
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                     </Card>
                </div>
            )}
        </div>
    );
};
