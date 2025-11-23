
import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/Card';
import { GlobeAmericasIcon, CheckCircleIcon, XMarkIcon, ExclamationTriangleIcon, ShieldCheckIcon, UsersIcon, ServerIcon } from '../constants';
import type { ETAApplication, ETAStatus } from '../types';

// --- MOCK DATA ---
const initialApplications: ETAApplication[] = [
    { id: 'ETA-1001', applicantName: 'John Smith', nationality: 'GBR', passportNumber: 'G12345678', submissionDate: '2023-10-28 10:15', status: 'Approved', riskScore: 10, email: 'john.smith@example.com' },
    { id: 'ETA-1002', applicantName: 'Maria Garcia', nationality: 'ESP', passportNumber: 'E87654321', submissionDate: '2023-10-28 10:20', status: 'Pending Review', riskScore: 75, riskReasons: ['Fuzzy Watchlist Match'], email: 'maria.garcia@example.com' },
    { id: 'ETA-1003', applicantName: 'Wei Chen', nationality: 'CHN', passportNumber: 'C99887766', submissionDate: '2023-10-28 10:30', status: 'Approved', riskScore: 25, email: 'wei.chen@example.com' },
    { id: 'ETA-1004', applicantName: 'Ahmed Al-Fayed', nationality: 'EGY', passportNumber: 'E11223344', submissionDate: '2023-10-28 11:05', status: 'Denied', riskScore: 95, riskReasons: ['Confirmed Watchlist Hit'], officerNotes: 'Denied based on intelligence report.', email: 'ahmed.fayed@example.com' },
];

const mockNationalities = ['GBR', 'USA', 'AUS', 'FRA', 'DEU', 'JPN', 'CHN', 'IND', 'RUS', 'EGY'];
const mockNames = ['Sarah Jones', 'Michael Brown', 'Yuki Tanaka', 'Elena Petrova', 'David Lee', 'Fatima Hassan'];

// --- UI COMPONENTS ---

const StatusBadge: React.FC<{ status: ETAStatus }> = ({ status }) => {
    const styles: Record<ETAStatus, string> = {
        Approved: 'bg-green-100 text-green-800',
        'Pending Review': 'bg-amber-100 text-amber-800 animate-pulse',
        Denied: 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 py-1 text-xs font-bold rounded-full ${styles[status]}`}>{status}</span>;
};

const ApplicationDetailModal: React.FC<{ app: ETAApplication; onClose: () => void; onDecide: (id: string, decision: 'Approved' | 'Denied', notes: string) => void }> = ({ app, onClose, onDecide }) => {
    const [notes, setNotes] = useState(app.officerNotes || '');
    const isPending = app.status === 'Pending Review';
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
            <Card title={isPending ? "Manual Vetting Workspace" : "Application Details"} className="w-full max-w-lg animate-scale-in">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-brand-dark">{app.applicantName}</h3>
                        <p className="text-sm text-gray-500">{app.nationality} • {app.passportNumber}</p>
                        <p className="text-xs text-gray-400 font-mono mt-1">Ref: {app.id}</p>
                        <p className="text-xs text-gray-400 mt-1">Email: {app.email}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase">Risk Score</p>
                        <p className={`text-2xl font-bold ${app.riskScore > 70 ? 'text-red-600' : 'text-amber-600'}`}>{app.riskScore}</p>
                    </div>
                </div>

                {app.riskReasons && app.riskReasons.length > 0 ? (
                    <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded mb-4">
                        <h4 className="text-sm font-bold text-red-800 mb-1">Risk Indicators (Hits)</h4>
                        <ul className="list-disc list-inside text-sm text-red-700">
                            {app.riskReasons.map((reason, idx) => <li key={idx}>{reason}</li>)}
                        </ul>
                    </div>
                ) : (
                    <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded mb-4">
                         <h4 className="text-sm font-bold text-green-800 mb-1">Risk Assessment</h4>
                         <p className="text-sm text-green-700">No specific risk indicators found.</p>
                    </div>
                )}

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Officer Decision Notes</label>
                    {isPending ? (
                        <textarea 
                            value={notes} 
                            onChange={e => setNotes(e.target.value)} 
                            className="w-full p-2 border rounded-md text-sm focus:ring-brand-secondary focus:border-brand-secondary" 
                            rows={3} 
                            placeholder="Justification for decision..." 
                        />
                    ) : (
                        <div className="w-full p-3 border rounded-md text-sm bg-gray-50 text-gray-700 min-h-[80px]">
                            {notes || 'No notes provided.'}
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-3 border-t pt-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Close</button>
                    {isPending && (
                        <>
                            <button onClick={() => onDecide(app.id, 'Denied', notes)} className="px-4 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700">Refuse ETA</button>
                            <button onClick={() => onDecide(app.id, 'Approved', notes)} className="px-4 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700">Grant ETA</button>
                        </>
                    )}
                </div>
            </Card>
        </div>
    );
};

export const ETADashboard: React.FC = () => {
    const [applications, setApplications] = useState<ETAApplication[]>(initialApplications);
    const [selectedApp, setSelectedApp] = useState<ETAApplication | null>(null);
    const [dcsQuery, setDcsQuery] = useState<{ pnr: string; result: string } | null>(null);

    // Simulate incoming applications
    useEffect(() => {
        const interval = setInterval(() => {
            const name = mockNames[Math.floor(Math.random() * mockNames.length)];
            const nat = mockNationalities[Math.floor(Math.random() * mockNationalities.length)];
            const risk = Math.floor(Math.random() * 100);
            let status: ETAStatus = 'Approved';
            let reasons: string[] = [];

            if (risk > 80) {
                status = 'Pending Review'; // High risk goes to manual
                reasons = ['Watchlist Hit (Fuzzy)', 'High Risk Origin'];
            } else if (risk > 60) {
                status = 'Pending Review';
                reasons = ['Data Anomaly'];
            } else {
                status = 'Approved'; // Auto-grant
            }

            const newApp: ETAApplication = {
                id: `ETA-${Date.now()}`,
                applicantName: name,
                nationality: nat,
                passportNumber: `P${Math.floor(Math.random() * 100000000)}`,
                submissionDate: new Date().toLocaleTimeString(),
                status,
                riskScore: risk,
                riskReasons: reasons,
                email: `${name.toLowerCase().replace(' ', '.')}@example.com`
            };

            setApplications(prev => [newApp, ...prev.slice(0, 14)]); // Keep 15
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Simulate DCS check
    useEffect(() => {
        const interval = setInterval(() => {
            const randomApp = applications[Math.floor(Math.random() * applications.length)];
            if (!randomApp) return;

            const result = randomApp.status === 'Approved' ? 'OK TO BOARD' : 'DENIED - NO VALID ETA';
            setDcsQuery({ pnr: `PNR-${Math.floor(Math.random() * 9999)}`, result });
            
            setTimeout(() => setDcsQuery(null), 3000);
        }, 8000);
        return () => clearInterval(interval);
    }, [applications]);

    const handleDecision = (id: string, decision: 'Approved' | 'Denied', notes: string) => {
        setApplications(prev => prev.map(app => app.id === id ? { ...app, status: decision, officerNotes: notes } : app));
        setSelectedApp(null);
    };

    const kpis = useMemo(() => ({
        total: applications.length,
        approved: applications.filter(a => a.status === 'Approved').length,
        denied: applications.filter(a => a.status === 'Denied').length,
        pending: applications.filter(a => a.status === 'Pending Review').length
    }), [applications]);

    return (
        <div className="space-y-6">
            {selectedApp && <ApplicationDetailModal app={selectedApp} onClose={() => setSelectedApp(null)} onDecide={handleDecision} />}

            <Card className="bg-sky-900 text-white border-l-4 border-sky-400">
                <div className="flex items-center">
                    <GlobeAmericasIcon className="h-8 w-8 text-sky-300 mr-4" />
                    <div>
                        <h2 className="text-2xl font-bold">Integrated Electronic Travel Authority (ETA)</h2>
                        <p className="text-sky-200 text-sm mt-1">
                            Prevention at source: Vetting travelers prior to departure and enforcing inadmissibility via airline systems.
                        </p>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                <div className="p-4 bg-white rounded-lg shadow border-t-4 border-blue-500">
                    <p className="text-sm text-gray-500 uppercase">Applications (Session)</p>
                    <p className="text-3xl font-bold text-brand-dark">{kpis.total}</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow border-t-4 border-green-500">
                    <p className="text-sm text-gray-500 uppercase">Auto-Granted</p>
                    <p className="text-3xl font-bold text-green-600">{kpis.approved}</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow border-t-4 border-amber-500">
                    <p className="text-sm text-gray-500 uppercase">Pending Review</p>
                    <p className="text-3xl font-bold text-amber-600">{kpis.pending}</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow border-t-4 border-red-500">
                    <p className="text-sm text-gray-500 uppercase">Refused ETA</p>
                    <p className="text-3xl font-bold text-red-600">{kpis.denied}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card title="Live Application Feed & Vetting Engine">
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                            {applications.map(app => (
                                <div 
                                    key={app.id} 
                                    onClick={() => setSelectedApp(app)}
                                    className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm new-alert-row hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <span className="font-bold text-brand-dark">{app.applicantName}</span>
                                            <span className="text-xs bg-gray-100 px-1 rounded text-gray-500">{app.nationality}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 font-mono">{app.passportNumber}</p>
                                    </div>
                                    
                                    <div className="flex items-center space-x-4">
                                        {/* Automated Checks Visualizer */}
                                        <div className="flex space-x-1">
                                            <div className={`w-2 h-2 rounded-full ${app.riskScore > 80 ? 'bg-red-500' : 'bg-green-500'}`} title="Watchlist"></div>
                                            <div className={`w-2 h-2 rounded-full ${app.riskScore > 60 ? 'bg-amber-500' : 'bg-green-500'}`} title="Profiler"></div>
                                            <div className="w-2 h-2 rounded-full bg-green-500" title="Identity"></div>
                                        </div>
                                        
                                        <StatusBadge status={app.status} />
                                        
                                        {app.status === 'Pending Review' ? (
                                            <button className="px-3 py-1 bg-brand-secondary text-white text-xs rounded hover:bg-brand-primary">
                                                Review
                                            </button>
                                        ) : (
                                            <button className="px-3 py-1 border border-gray-300 text-gray-600 text-xs rounded hover:bg-gray-50">
                                                Details
                                            </button>
                                        )}
                                        {app.status === 'Denied' && <span className="text-xs font-bold text-red-700">STOP</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-1 space-y-6">
                     <Card title="iAPP - Boarding Enforcement" className="bg-slate-900 text-white border-slate-700">
                        <div className="flex flex-col items-center justify-center h-[200px] relative">
                            <p className="text-xs text-slate-400 uppercase mb-4 text-center">Simulated Airline DCS Query</p>
                            
                            {dcsQuery ? (
                                <div className="w-full p-4 bg-black rounded border border-slate-600 font-mono text-sm animate-scale-in">
                                    <p className="text-green-400">{'>'} CHECK_ETA {dcsQuery.pnr}</p>
                                    <p className="text-blue-400 mt-1">{'>'} Processing...</p>
                                    <p className={`mt-2 font-bold text-lg ${dcsQuery.result.includes('DENIED') ? 'text-red-500 animate-pulse' : 'text-green-500'}`}>
                                        {dcsQuery.result}
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center text-slate-600">
                                    <ServerIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm italic">Waiting for check-in query...</p>
                                </div>
                            )}
                            
                            <div className="absolute bottom-0 w-full text-center pt-4 border-t border-slate-700 mt-4">
                                <p className="text-[10px] text-slate-500">
                                    This interface allows airlines to verify authority to travel in real-time before issuing a boarding pass.
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card title="Risk Broker Integration">
                        <div className="p-3 bg-gray-50 rounded border text-sm">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600">Watchlist Adaptor</span>
                                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded">Online</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600">Health/Visa Check</span>
                                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded">Online</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-gray-600">Profiler Engine</span>
                                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded">Online</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Automated checks run against all applications in real-time.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
};
