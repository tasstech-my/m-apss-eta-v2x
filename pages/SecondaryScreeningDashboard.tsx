
import React, { useState, useMemo } from 'react';
import { Card } from '../components/Card';
import { ClipboardDocumentCheckIcon, UsersIcon, ShieldExclamationIcon, FolderOpenIcon, ArrowUpTrayIcon } from '../constants';
import type { SecondaryReferral, ScreeningOutcome } from '../types';

// --- MOCK DATA ---
const initialReferrals: SecondaryReferral[] = [
    {
        id: 'REF-1001',
        travelerName: 'Omar Al-Masri',
        puid: 'PUID-9911',
        nationality: 'EGY',
        flightNumber: 'MH370',
        referralReason: 'Narcotics Watchlist Hit',
        riskLevel: 'Critical',
        arrivalTime: '14:35',
        status: 'Waiting',
    },
    {
        id: 'REF-1002',
        travelerName: 'Victor Korchnoi',
        puid: 'PUID-8822',
        nationality: 'RUS',
        flightNumber: 'MH370',
        referralReason: 'Financial Watchlist Hit',
        riskLevel: 'High',
        arrivalTime: '14:40',
        status: 'Waiting',
    },
    {
        id: 'REF-1003',
        travelerName: 'John Doe',
        puid: 'PUID-7744',
        nationality: 'USA',
        flightNumber: 'SQ106',
        referralReason: 'Pattern Match: One-way Ticket',
        riskLevel: 'Medium',
        arrivalTime: '16:20',
        status: 'Waiting',
    },
    {
        id: 'REF-1004',
        travelerName: 'Elena Petrova',
        puid: 'PUID-6633',
        nationality: 'RUS',
        flightNumber: 'EK409',
        referralReason: 'Anomalous Booking',
        riskLevel: 'High',
        arrivalTime: '18:05',
        status: 'In Progress',
        officer: 'Officer Tan',
        notes: ['Initial interview conducted.', 'Baggage inspection in progress.'],
    }
];

const mockHistory: SecondaryReferral[] = [
    {
        id: 'REF-0998',
        travelerName: 'Wei Chen',
        puid: 'PUID-5521',
        nationality: 'CHN',
        flightNumber: 'AK52',
        referralReason: 'Visa Irregularity',
        riskLevel: 'Medium',
        arrivalTime: '10:00',
        status: 'Completed',
        officer: 'Officer Tan',
        outcome: 'Refused Entry',
        notes: ['Visa expired. Return flight arranged.'],
    },
    {
        id: 'REF-0999',
        travelerName: 'Sarah Lim',
        puid: 'PUID-1122',
        nationality: 'MYS',
        flightNumber: 'AK52',
        referralReason: 'Lost Passport',
        riskLevel: 'Medium',
        arrivalTime: '10:05',
        status: 'Completed',
        officer: 'Officer Tan',
        outcome: 'Cleared',
        notes: ['Emergency travel document verified. Cleared for entry.'],
    }
];


// --- UI COMPONENTS ---

const RiskLevelBadge: React.FC<{ level: SecondaryReferral['riskLevel'] }> = ({ level }) => {
    const colors = {
        Critical: 'bg-red-800 text-white',
        High: 'bg-red-100 text-red-800',
        Medium: 'bg-amber-100 text-amber-800',
    };
    return <span className={`px-2 py-1 text-xs font-bold rounded ${colors[level]}`}>{level}</span>;
};

const OutcomeBadge: React.FC<{ outcome?: ScreeningOutcome }> = ({ outcome }) => {
    if (!outcome) return null;
    const colors: Record<string, string> = {
        Cleared: 'bg-green-100 text-green-800',
        Detained: 'bg-red-800 text-white',
        'Refused Entry': 'bg-orange-100 text-orange-800',
    };
    return <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${colors[outcome]}`}>{outcome}</span>;
};


export const SecondaryScreeningDashboard: React.FC = () => {
    const [queue, setQueue] = useState<SecondaryReferral[]>(initialReferrals);
    const [activeScreening, setActiveScreening] = useState<SecondaryReferral | null>(null);
    const [history, setHistory] = useState<SecondaryReferral[]>(mockHistory);
    const [newNote, setNewNote] = useState('');
    const [isPromoting, setIsPromoting] = useState(false);

    const handleSelectReferral = (referral: SecondaryReferral) => {
        // If selecting a waiting referral, move to 'In Progress'
        if (referral.status === 'Waiting') {
            const updatedReferral = { ...referral, status: 'In Progress' as const, officer: 'Me (Officer)' };
            setQueue(prev => prev.map(r => r.id === referral.id ? updatedReferral : r));
            setActiveScreening(updatedReferral);
        } else {
            setActiveScreening(referral);
        }
    };

    const handleAddNote = () => {
        if (!activeScreening || !newNote.trim()) return;
        const updated = {
            ...activeScreening,
            notes: [...(activeScreening.notes || []), newNote]
        };
        setActiveScreening(updated);
        setQueue(prev => prev.map(r => r.id === updated.id ? updated : r));
        setNewNote('');
    };

    const handleOutcome = (outcome: ScreeningOutcome) => {
        if (!activeScreening) return;
        if (!window.confirm(`Confirm outcome: ${outcome}? This will close the screening record.`)) return;

        const completedReferral: SecondaryReferral = {
            ...activeScreening,
            status: 'Completed',
            outcome,
        };

        setHistory(prev => [completedReferral, ...prev]);
        setQueue(prev => prev.filter(r => r.id !== activeScreening.id));
        setActiveScreening(null);
    };

    const handlePromoteToCase = () => {
        setIsPromoting(true);
        setTimeout(() => {
            alert(`Investigation promoted to Case Management successfully. Case ID: CASE-2023-${Math.floor(Math.random() * 1000)}`);
            setIsPromoting(false);
        }, 1500);
    };

    return (
        <div className="space-y-6">
            <Card className="bg-slate-800 border-l-4 border-blue-500 text-white">
                <div className="flex items-center">
                    <ClipboardDocumentCheckIcon className="h-8 w-8 text-blue-400 mr-4" />
                    <div>
                        <h2 className="text-2xl font-bold">Port of Entry: Secondary Screening</h2>
                        <p className="text-slate-400 text-sm mt-1">
                            Secure module for processing high-risk referrals, recording interrogation outcomes, and escalating investigations.
                        </p>
                    </div>
                </div>
            </Card>

            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-220px)]">
                
                {/* Left Column: Queue */}
                <div className="w-full lg:w-1/3 flex flex-col gap-6 h-full">
                    <Card title={`Screening Queue (${queue.length})`} className="flex-1 overflow-hidden flex flex-col">
                        <div className="overflow-y-auto pr-2 space-y-3 flex-1">
                            {queue.map(ref => (
                                <div 
                                    key={ref.id} 
                                    onClick={() => handleSelectReferral(ref)}
                                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                                        activeScreening?.id === ref.id ? 'ring-2 ring-brand-secondary border-transparent bg-blue-50' : 'bg-white hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-brand-dark">{ref.travelerName}</span>
                                        <RiskLevelBadge level={ref.riskLevel} />
                                    </div>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p><span className="font-semibold">Flight:</span> {ref.flightNumber} (Arr: {ref.arrivalTime})</p>
                                        <p><span className="font-semibold">Reason:</span> {ref.referralReason}</p>
                                        <p className="text-xs text-gray-400 mt-2 font-mono">{ref.id} • {ref.puid}</p>
                                    </div>
                                    {ref.status === 'In Progress' && (
                                        <div className="mt-2 text-xs font-bold text-blue-600 uppercase tracking-wide">In Progress • {ref.officer}</div>
                                    )}
                                </div>
                            ))}
                            {queue.length === 0 && <p className="text-center text-gray-500 py-10">No referrals in queue.</p>}
                        </div>
                    </Card>
                    
                    <Card title="Recent History" className="h-1/3 overflow-hidden flex flex-col">
                         <div className="overflow-y-auto pr-2 space-y-2 flex-1">
                            {history.map(h => (
                                <div key={h.id} className="p-2 border-b last:border-0 text-sm">
                                    <div className="flex justify-between">
                                        <span className="font-medium">{h.travelerName}</span>
                                        <OutcomeBadge outcome={h.outcome} />
                                    </div>
                                    <span className="text-xs text-gray-500">{h.flightNumber} • {h.referralReason}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Right Column: Workspace */}
                <div className="w-full lg:w-2/3 h-full">
                    {activeScreening ? (
                        <Card className="h-full flex flex-col overflow-hidden border-t-4 border-brand-secondary">
                            <div className="flex justify-between items-start border-b pb-4 mb-4">
                                <div className="flex items-center">
                                    <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                                        <UsersIcon className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-brand-dark">{activeScreening.travelerName}</h2>
                                        <div className="flex space-x-4 text-sm text-gray-600 mt-1">
                                            <span><span className="font-semibold">Nationality:</span> {activeScreening.nationality}</span>
                                            <span><span className="font-semibold">PUID:</span> {activeScreening.puid}</span>
                                            <span><span className="font-semibold">Flight:</span> {activeScreening.flightNumber}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="bg-red-50 border border-red-200 p-2 rounded text-red-800 text-sm font-semibold mb-1">
                                        <ShieldExclamationIcon className="h-4 w-4 inline mr-1" />
                                        Referral: {activeScreening.referralReason}
                                    </div>
                                    <p className="text-xs text-gray-500">Arrival: {activeScreening.arrivalTime}</p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                                <div>
                                    <h4 className="font-bold text-gray-700 mb-2 uppercase text-xs tracking-wider">Interrogation Log & Evidence</h4>
                                    <div className="bg-gray-50 border rounded-lg p-4 min-h-[150px] mb-2 space-y-3">
                                        {activeScreening.notes && activeScreening.notes.length > 0 ? (
                                            activeScreening.notes.map((note, idx) => (
                                                <div key={idx} className="text-sm border-l-2 border-gray-300 pl-2 py-1">
                                                    <span className="font-bold text-gray-700 block text-xs mb-0.5">Officer Note:</span>
                                                    {note}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-400 italic text-sm">No notes logged yet.</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={newNote} 
                                            onChange={(e) => setNewNote(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                                            placeholder="Type note and press Enter..." 
                                            className="flex-1 p-2 border rounded-md text-sm"
                                        />
                                        <button onClick={handleAddNote} disabled={!newNote.trim()} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-bold text-gray-700">Add Note</button>
                                    </div>
                                </div>

                                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-indigo-900 text-sm">Strategic Escalation</h4>
                                        <p className="text-xs text-indigo-700">Promote this referral to a long-term investigation case.</p>
                                    </div>
                                    <button 
                                        onClick={handlePromoteToCase}
                                        disabled={isPromoting}
                                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded hover:bg-indigo-700 transition-colors flex items-center"
                                    >
                                        <FolderOpenIcon className="h-4 w-4 mr-2" />
                                        {isPromoting ? 'Promoting...' : 'Escalate to Case Mgmt'}
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <h4 className="font-bold text-gray-700 mb-3 uppercase text-xs tracking-wider text-center">Final Screening Outcome</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <button 
                                        onClick={() => handleOutcome('Cleared')}
                                        className="py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow transition-transform active:scale-95"
                                    >
                                        CLEAR ENTRY
                                    </button>
                                    <button 
                                        onClick={() => handleOutcome('Refused Entry')}
                                        className="py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg shadow transition-transform active:scale-95"
                                    >
                                        REFUSE ENTRY
                                    </button>
                                    <button 
                                        onClick={() => handleOutcome('Detained')}
                                        className="py-3 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg shadow transition-transform active:scale-95"
                                    >
                                        DETAIN TRAVELER
                                    </button>
                                </div>
                            </div>

                        </Card>
                    ) : (
                        <div className="h-full flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                            <div className="text-center text-gray-400">
                                <ArrowUpTrayIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p className="text-lg font-medium">Select a traveler from the queue</p>
                                <p className="text-sm">to begin secondary screening process.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
