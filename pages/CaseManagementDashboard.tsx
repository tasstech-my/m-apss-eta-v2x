
import React, { useState, useMemo } from 'react';
import { Card } from '../components/Card';
import type { InvestigationCase, CaseEntity, CaseNote, CaseStatus, AgencyAccess, JointAction, Referral } from '../types';
import { FolderOpenIcon, UsersIcon, DocumentTextIcon, ShareIcon, ClockIcon, InformationCircleIcon, BuildingOffice2Icon, ArrowUpTrayIcon } from '../constants';

// --- MOCK DATA ---
const mockCases: InvestigationCase[] = [
    {
        id: 'CASE-2023-001',
        title: 'Operation Iron Wing',
        description: 'Long-term surveillance of a suspected narcotics smuggling ring operating between South America and SE Asia.',
        leadInvestigator: 'Analyst 1',
        startDate: '2023-08-15',
        status: 'Active',
        priority: 'High',
        caseType: 'Organization',
        primarySubject: 'N/A',
        entities: [
            { id: 'ent-1', type: 'Person', name: 'Carlos Garcia', details: 'PUID-1001', linkedDate: '2023-08-15' },
            { id: 'ent-2', type: 'Flight', name: 'MH123', details: 'Frequent Route', linkedDate: '2023-08-20' },
            { id: 'ent-3', type: 'Person', name: 'Maria Rodriguez', details: 'PUID-9988', linkedDate: '2023-09-01' },
        ],
        notes: [
            { id: 'note-1', timestamp: '2023-08-15 09:00', author: 'Analyst 1', content: 'Case opened following multiple cash-booking alerts on the BOG-KUL route.', type: 'Note' },
            { id: 'note-2', timestamp: '2023-08-20 14:30', author: 'Analyst 2', content: 'Received intel from local police regarding a known associate traveling on MH123.', type: 'Intel' },
            { id: 'note-3', timestamp: '2023-09-05 10:15', author: 'Analyst 1', content: 'Link established between Garcia and Rodriguez via common PNR contact number.', type: 'Evidence' },
        ],
        collaboratingAgencies: [
            { id: 'ag-1', name: 'Immigration', role: 'Lead', addedDate: '2023-08-15' },
            { id: 'ag-2', name: 'Police', role: 'Contributor', addedDate: '2023-08-20' },
            { id: 'ag-3', name: 'Customs', role: 'Contributor', addedDate: '2023-09-01' },
        ],
        jointActions: [
            { id: 'ja-1', agency: 'Police', action: 'Surveillance of suspected safehouse', status: 'In Progress', deadline: '2023-11-15' },
            { id: 'ja-2', agency: 'Customs', action: 'Enhanced screening of cargo from Flight MH123', status: 'Pending', deadline: '2023-11-10' },
        ]
    },
    {
        id: 'CASE-2023-002',
        title: 'Synthetic Identity Fraud Ring',
        description: 'Investigation into a group using high-quality counterfeit passports with valid visas.',
        leadInvestigator: 'Analyst 3',
        startDate: '2023-09-10',
        status: 'Active',
        priority: 'Medium',
        caseType: 'Incident',
        primarySubject: 'N/A',
        entities: [
            { id: 'ent-4', type: 'Person', name: 'John Smith', details: 'PUID-FAKE-01', linkedDate: '2023-09-10' },
            { id: 'ent-5', type: 'Document', name: 'Passport G87...', details: 'Forged', linkedDate: '2023-09-12' },
        ],
        notes: [
            { id: 'note-4', timestamp: '2023-09-10 11:00', author: 'Analyst 3', content: 'Initial detection by Identity Resolution Engine (Fuzzy Match > 90% with different bio-data).', type: 'Note' },
        ],
        collaboratingAgencies: [
            { id: 'ag-4', name: 'Immigration', role: 'Lead', addedDate: '2023-09-10' },
            { id: 'ag-5', name: 'Intelligence', role: 'Viewer', addedDate: '2023-09-12' },
        ],
        jointActions: []
    },
    {
        id: 'CASE-2023-003',
        title: 'Human Trafficking - Eastern Route',
        description: 'Monitoring suspicious group travel patterns involving minors.',
        leadInvestigator: 'Analyst 2',
        startDate: '2023-05-01',
        status: 'Cold',
        priority: 'High',
        caseType: 'Organization',
        entities: [],
        notes: [],
        collaboratingAgencies: [
            { id: 'ag-6', name: 'Immigration', role: 'Lead', addedDate: '2023-05-01' },
            { id: 'ag-7', name: 'Police', role: 'Contributor', addedDate: '2023-05-05' }
        ],
        jointActions: []
    },
    {
        id: 'CASE-2023-004',
        title: 'Target: Victor K.',
        description: 'Long-term POI tracking for suspected money laundering activities.',
        leadInvestigator: 'Analyst 1',
        startDate: '2023-10-01',
        status: 'Active',
        priority: 'Critical',
        caseType: 'POI',
        primarySubject: 'Victor Korchnoi',
        entities: [
             { id: 'ent-6', type: 'Person', name: 'Victor Korchnoi', details: 'PUID-8822', linkedDate: '2023-10-01' },
             { id: 'ent-7', type: 'PNR', name: 'PNR-XYZ123', details: 'Suspicious Booking', linkedDate: '2023-10-15' }
        ],
        notes: [
             { id: 'note-5', timestamp: '2023-10-01 08:00', author: 'Analyst 1', content: 'POI added to watchlist. Initiating long-term tracking.', type: 'Note' },
             { id: 'note-6', timestamp: '2023-10-15 14:20', author: 'Analyst 1', content: 'Financial Intel Unit flagged large transfer associated with POI.', type: 'Intel' }
        ],
        collaboratingAgencies: [
             { id: 'ag-8', name: 'Immigration', role: 'Lead', addedDate: '2023-10-01' },
             { id: 'ag-9', name: 'Intelligence', role: 'Contributor', addedDate: '2023-10-02' },
             { id: 'ag-10', name: 'Customs', role: 'Viewer', addedDate: '2023-10-15' }
        ],
        jointActions: [
            { id: 'ja-3', agency: 'Intelligence', action: 'Monitor bank transactions', status: 'In Progress', deadline: 'N/A' }
        ]
    }
];

// Mock Referrals pending promotion from Risk Manager
const mockPromotableReferrals: Referral[] = [
    {
        id: 'REF-006', passengerName: 'Omar Al-Masri', puid: 'H6I7J8K', flightNumber: 'MS985', destinationAirport: 'CAI',
        totalRiskScore: 95,
        hits: [{ id: 'H6A', type: 'Watchlist Match', description: 'Confirmed match on narcotics watchlist.', scoreContribution: 95 }],
        createdAt: '08:10 AM', status: 'Alert', assignee: 'Analyst 2', resolvedAt: '08:45 AM', resolution: 'Qualified-In (Action Taken)'
    },
    {
        id: 'REF-009', passengerName: 'Elena Petrova', puid: 'PUID-7721', flightNumber: 'SU550', destinationAirport: 'KUL',
        totalRiskScore: 88,
        hits: [{ id: 'H9A', type: 'Anomalous Booking', description: 'Pattern consistent with "Mule" profile.', scoreContribution: 88 }],
        createdAt: '09:15 AM', status: 'Alert', assignee: 'Analyst 1', resolvedAt: '09:30 AM', resolution: 'Qualified-In (Action Taken)'
    }
];

// Mock Timeline Data
const mockTimelineEvents = [
    { date: '2023-10-25', time: '14:30', type: 'Travel', description: 'Departed KUL on MH123 to LHR', location: 'KUL Airport' },
    { date: '2023-10-20', time: '09:15', type: 'Financial', description: 'Wire transfer of $15,000 detected', location: 'Bank of Singapore' },
    { date: '2023-10-18', time: '11:00', type: 'Intel', description: 'Sighted meeting with known associate (Subject B)', location: 'Kuala Lumpur' },
    { date: '2023-10-15', time: '16:45', type: 'Travel', description: 'Arrived KUL from BKK on AK52', location: 'KUL Airport' },
    { date: '2023-10-01', time: '08:00', type: 'System', description: 'Case Opened / POI Profile Created', location: 'M-APSS HQ' },
];

// --- UI COMPONENTS ---
const StatusPill: React.FC<{ status: CaseStatus }> = ({ status }) => {
    const colors = {
        Active: 'bg-green-100 text-green-800',
        Cold: 'bg-blue-100 text-blue-800',
        Closed: 'bg-gray-200 text-gray-800',
    };
    return <span className={`px-2 py-1 text-xs font-bold rounded-full ${colors[status]}`}>{status}</span>;
};

const PriorityPill: React.FC<{ priority: string }> = ({ priority }) => {
    const colors: Record<string, string> = {
        Critical: 'bg-red-700 text-white',
        High: 'bg-red-100 text-red-800',
        Medium: 'bg-amber-100 text-amber-800',
        Low: 'bg-green-100 text-green-800',
    };
    return <span className={`px-2 py-1 text-xs font-bold rounded-full ${colors[priority] || 'bg-gray-100'}`}>{priority}</span>;
};

const TimelineEvent: React.FC<{ event: typeof mockTimelineEvents[0] }> = ({ event }) => {
    const typeColors: Record<string, string> = {
        Travel: 'bg-blue-500',
        Financial: 'bg-green-500',
        Intel: 'bg-amber-500',
        System: 'bg-gray-500'
    };

    return (
        <div className="relative pl-8 pb-8 border-l-2 border-gray-200 last:border-0 last:pb-0">
            <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow ${typeColors[event.type] || 'bg-gray-400'}`}></div>
            <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded mr-2 text-white ${typeColors[event.type] || 'bg-gray-400'}`}>{event.type}</span>
                        <span className="text-sm font-semibold text-gray-800">{event.date} <span className="text-gray-400 font-normal">at {event.time}</span></span>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">{event.location}</span>
                </div>
                <p className="text-gray-700 text-sm">{event.description}</p>
            </div>
        </div>
    );
};

const AgencyBadge: React.FC<{ name: string, role?: string }> = ({ name, role }) => {
    const colors: Record<string, string> = {
        Immigration: 'bg-blue-100 text-blue-800 border-blue-200',
        Police: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        Customs: 'bg-green-100 text-green-800 border-green-200',
        Intelligence: 'bg-purple-100 text-purple-800 border-purple-200',
        Health: 'bg-red-100 text-red-800 border-red-200',
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colors[name] || 'bg-gray-100 text-gray-800'}`} title={role ? `Role: ${role}` : undefined}>
            {name}
            {role && <span className="ml-1 text-[10px] opacity-75">({role.charAt(0)})</span>}
        </span>
    );
};

const PromoteModal: React.FC<{ referral: Referral; onClose: () => void; onPromote: (referral: Referral, type: 'new' | 'existing', details: any) => void; activeCases: InvestigationCase[] }> = ({ referral, onClose, onPromote, activeCases }) => {
    const [promoteType, setPromoteType] = useState<'new' | 'existing'>('new');
    const [caseTitle, setCaseTitle] = useState(`Investigation: ${referral.passengerName}`);
    const [caseType, setCaseType] = useState<InvestigationCase['caseType']>('Incident');
    const [priority, setPriority] = useState<InvestigationCase['priority']>('High');
    const [selectedCaseId, setSelectedCaseId] = useState(activeCases[0]?.id || '');

    const handleConfirm = () => {
        onPromote(referral, promoteType, promoteType === 'new' ? { title: caseTitle, caseType, priority } : { caseId: selectedCaseId });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
            <Card title="Promote Referral to Case" className="w-full max-w-lg animate-scale-in">
                <div className="mb-6 bg-red-50 p-3 rounded border border-red-200">
                    <p className="text-sm font-bold text-red-800">Promoting Referral: {referral.id}</p>
                    <p className="text-xs text-red-700">Subject: {referral.passengerName} ({referral.puid})</p>
                    <p className="text-xs text-red-700">Alert: {referral.hits[0]?.description}</p>
                </div>

                <div className="space-y-4">
                    <div className="flex space-x-4 border-b pb-2">
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" checked={promoteType === 'new'} onChange={() => setPromoteType('new')} className="form-radio text-brand-primary" />
                            <span className={`ml-2 text-sm font-medium ${promoteType === 'new' ? 'text-brand-dark' : 'text-gray-500'}`}>Create New Case</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" checked={promoteType === 'existing'} onChange={() => setPromoteType('existing')} className="form-radio text-brand-primary" />
                            <span className={`ml-2 text-sm font-medium ${promoteType === 'existing' ? 'text-brand-dark' : 'text-gray-500'}`}>Add to Existing Case</span>
                        </label>
                    </div>

                    {promoteType === 'new' ? (
                        <div className="space-y-3 animate-scale-in">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Case Title</label>
                                <input type="text" value={caseTitle} onChange={e => setCaseTitle(e.target.value)} className="w-full p-2 border rounded-md mt-1 text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Type</label>
                                    <select value={caseType} onChange={e => setCaseType(e.target.value as any)} className="w-full p-2 border rounded-md mt-1 text-sm bg-white">
                                        <option value="Incident">Incident</option>
                                        <option value="POI">POI Tracking</option>
                                        <option value="Organization">Organization</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                                    <select value={priority} onChange={e => setPriority(e.target.value as any)} className="w-full p-2 border rounded-md mt-1 text-sm bg-white">
                                        <option value="Critical">Critical</option>
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-scale-in">
                            <label className="block text-sm font-medium text-gray-700">Select Active Case</label>
                            <select value={selectedCaseId} onChange={e => setSelectedCaseId(e.target.value)} className="w-full p-2 border rounded-md mt-1 text-sm bg-white">
                                {activeCases.map(c => <option key={c.id} value={c.id}>{c.title} ({c.id})</option>)}
                            </select>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                    <button onClick={handleConfirm} className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-dark flex items-center">
                        <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                        Promote Referral
                    </button>
                </div>
            </Card>
        </div>
    );
};

export const CaseManagementDashboard: React.FC = () => {
    const [cases, setCases] = useState<InvestigationCase[]>(mockCases);
    const [selectedCase, setSelectedCase] = useState<InvestigationCase | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'entities' | 'log' | 'visual' | 'timeline' | 'collaboration'>('overview');
    const [newNote, setNewNote] = useState('');
    
    // Promotion Workflow State
    const [promotableReferrals, setPromotableReferrals] = useState<Referral[]>(mockPromotableReferrals);
    const [promotionModalOpen, setPromotionModalOpen] = useState(false);
    const [referralToPromote, setReferralToPromote] = useState<Referral | null>(null);

    const kpis = useMemo(() => ({
        total: cases.length,
        active: cases.filter(c => c.status === 'Active').length,
        highPriority: cases.filter(c => c.priority === 'High' || c.priority === 'Critical').length
    }), [cases]);

    const activePoiCases = useMemo(() => {
        return cases.filter(c => c.caseType === 'POI' && c.status === 'Active');
    }, [cases]);

    const handleAddNote = () => {
        if (!selectedCase || !newNote.trim()) return;
        const note: CaseNote = {
            id: `note-${Date.now()}`,
            timestamp: new Date().toLocaleString(),
            author: 'Me (Analyst)',
            content: newNote,
            type: 'Note'
        };
        
        const updatedCase = { ...selectedCase, notes: [note, ...selectedCase.notes] };
        setCases(prev => prev.map(c => c.id === selectedCase.id ? updatedCase : c));
        setSelectedCase(updatedCase);
        setNewNote('');
    };

    const handleOpenPromoteModal = (referral: Referral) => {
        setReferralToPromote(referral);
        setPromotionModalOpen(true);
    };

    const handlePromoteReferral = (referral: Referral, type: 'new' | 'existing', details: any) => {
        const newEntity: CaseEntity = {
            id: `ent-${Date.now()}`,
            type: 'Person',
            name: referral.passengerName,
            details: referral.puid,
            linkedDate: new Date().toISOString().split('T')[0]
        };

        if (type === 'new') {
            const newCase: InvestigationCase = {
                id: `CASE-${new Date().getFullYear()}-${String(cases.length + 1).padStart(3, '0')}`,
                title: details.title,
                description: `Promoted from Tactical Referral ${referral.id}. Initial Alert: ${referral.hits[0]?.description}`,
                leadInvestigator: 'Me (Analyst)',
                startDate: new Date().toISOString().split('T')[0],
                status: 'Active',
                priority: details.priority,
                caseType: details.caseType,
                primarySubject: referral.passengerName,
                entities: [newEntity],
                notes: [{ id: `n-${Date.now()}`, timestamp: new Date().toLocaleString(), author: 'System', content: 'Case created via Referral Promotion workflow.', type: 'System' }],
                collaboratingAgencies: [{ id: `ag-${Date.now()}`, name: 'Immigration', role: 'Lead', addedDate: new Date().toISOString().split('T')[0]}],
                jointActions: []
            };
            setCases(prev => [newCase, ...prev]);
            setSelectedCase(newCase); // Open the new case immediately
        } else {
            setCases(prev => prev.map(c => {
                if (c.id === details.caseId) {
                    return {
                        ...c,
                        entities: [...c.entities, newEntity],
                        notes: [...c.notes, { id: `n-${Date.now()}`, timestamp: new Date().toLocaleString(), author: 'System', content: `Linked referral ${referral.id} to this case.`, type: 'System' }]
                    };
                }
                return c;
            }));
        }

        // Remove from pending list
        setPromotableReferrals(prev => prev.filter(r => r.id !== referral.id));
        setPromotionModalOpen(false);
        setReferralToPromote(null);
    };

    if (selectedCase) {
        return (
            <div className="space-y-6">
                <Card>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <button onClick={() => setSelectedCase(null)} className="text-brand-secondary hover:underline mb-2 text-sm">&larr; Back to Case List</button>
                            <h2 className="text-2xl font-bold text-brand-dark flex items-center">
                                <FolderOpenIcon className="h-8 w-8 mr-3 text-brand-secondary" />
                                {selectedCase.title}
                            </h2>
                            <div className="flex flex-wrap items-center mt-2 gap-3">
                                <p className="text-gray-500 text-sm font-mono">{selectedCase.id}</p>
                                {selectedCase.caseType === 'POI' && (
                                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full border border-indigo-200">POI: {selectedCase.primarySubject}</span>
                                )}
                                <div className="flex items-center space-x-1 border-l pl-3 ml-1">
                                    <span className="text-xs text-gray-500 uppercase font-semibold mr-1">Joint Task Force:</span>
                                    {selectedCase.collaboratingAgencies.map(ag => (
                                        <AgencyBadge key={ag.id} name={ag.name} />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <div className="text-right mr-4">
                                <p className="text-xs text-gray-500 uppercase">Status</p>
                                <StatusPill status={selectedCase.status} />
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 uppercase">Priority</p>
                                <PriorityPill priority={selectedCase.priority} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-8 overflow-x-auto">
                            <button onClick={() => setActiveTab('overview')} className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'overview' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Overview</button>
                            <button onClick={() => setActiveTab('collaboration')} className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${activeTab === 'collaboration' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                                <BuildingOffice2Icon className="h-4 w-4 mr-2"/> Collaboration
                            </button>
                            <button onClick={() => setActiveTab('entities')} className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'entities' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Linked Entities ({selectedCase.entities.length})</button>
                            <button onClick={() => setActiveTab('timeline')} className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'timeline' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Activity Timeline</button>
                            <button onClick={() => setActiveTab('log')} className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'log' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Intelligence Log</button>
                            <button onClick={() => setActiveTab('visual')} className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'visual' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Network Visualization</button>
                        </nav>
                    </div>

                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="bg-gray-50 p-4 rounded-lg border">
                                <h4 className="text-sm font-bold text-gray-700 uppercase mb-2">Case Description</h4>
                                <p className="text-gray-800">{selectedCase.description}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div><span className="text-gray-500 block">Lead Investigator</span> <span className="font-medium text-lg">{selectedCase.leadInvestigator}</span></div>
                                <div><span className="text-gray-500 block">Start Date</span> <span className="font-medium text-lg">{selectedCase.startDate}</span></div>
                                <div><span className="text-gray-500 block">Case Type</span> <span className="font-medium text-lg">{selectedCase.caseType}</span></div>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'collaboration' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <Card title="Agency Access Control (RBAC)" className="bg-gray-50 border border-gray-200">
                                    <div className="space-y-3">
                                        {selectedCase.collaboratingAgencies.map(agency => (
                                            <div key={agency.id} className="flex items-center justify-between p-3 bg-white rounded border">
                                                <div className="flex items-center">
                                                    <BuildingOffice2Icon className="h-5 w-5 text-gray-400 mr-3" />
                                                    <span className="font-semibold text-brand-dark">{agency.name}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${agency.role === 'Lead' ? 'bg-blue-100 text-blue-800' : agency.role === 'Contributor' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{agency.role}</span>
                                                    <span className="text-xs text-gray-400">Since {agency.addedDate}</span>
                                                </div>
                                            </div>
                                        ))}
                                        <button className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded hover:border-brand-secondary hover:text-brand-secondary transition-colors text-sm font-medium">
                                            + Grant Agency Access
                                        </button>
                                    </div>
                                </Card>
                                
                                <Card title="Coordinated Joint Actions">
                                    <div className="space-y-3">
                                        {selectedCase.jointActions.length > 0 ? selectedCase.jointActions.map(action => (
                                            <div key={action.id} className="p-3 bg-white rounded border hover:shadow-sm transition-shadow">
                                                <div className="flex justify-between items-start mb-1">
                                                    <AgencyBadge name={action.agency} />
                                                    <span className={`text-xs font-bold ${action.status === 'Completed' ? 'text-green-600' : action.status === 'In Progress' ? 'text-blue-600' : 'text-amber-600'}`}>{action.status}</span>
                                                </div>
                                                <p className="text-sm text-gray-800 font-medium">{action.action}</p>
                                                <p className="text-xs text-gray-500 mt-1">Deadline: {action.deadline}</p>
                                            </div>
                                        )) : (
                                            <p className="text-gray-500 text-sm text-center py-4">No joint actions assigned.</p>
                                        )}
                                        <button className="w-full py-2 bg-brand-secondary text-white rounded hover:bg-brand-primary text-sm">Assign New Action</button>
                                    </div>
                                </Card>
                            </div>
                            
                            <Card title="Secure Inter-Agency Exchange">
                                <div className="bg-gray-100 p-3 rounded-lg h-[400px] flex flex-col">
                                    <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                                        <div className="flex items-start space-x-2">
                                            <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold text-blue-800 flex-shrink-0">IMM</div>
                                            <div className="bg-white p-2 rounded-lg shadow-sm text-sm max-w-[85%]">
                                                <p className="font-bold text-xs text-gray-500 mb-1">Immigration Officer • 2h ago</p>
                                                <p>Passport scans uploaded for Subject A. Please review.</p>
                                            </div>
                                        </div>
                                         <div className="flex items-start space-x-2 justify-end">
                                            <div className="bg-indigo-50 p-2 rounded-lg shadow-sm text-sm max-w-[85%] text-right">
                                                <p className="font-bold text-xs text-gray-500 mb-1">Police Liaison • 1h ago</p>
                                                <p>Received. Matching against criminal database now.</p>
                                            </div>
                                             <div className="w-8 h-8 bg-indigo-200 rounded-full flex items-center justify-center text-xs font-bold text-indigo-800 flex-shrink-0">POL</div>
                                        </div>
                                        <div className="flex items-center justify-center my-2">
                                            <span className="text-[10px] bg-gray-200 px-2 py-1 rounded text-gray-500">System: Customs Agency added as Viewer</span>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        <input type="text" placeholder="Secure message..." className="flex-1 p-2 border rounded text-sm" />
                                        <button className="px-3 py-1 bg-brand-primary text-white rounded text-sm">Send</button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'entities' && (
                        <div>
                            <div className="flex justify-end mb-4">
                                <button className="px-3 py-1.5 bg-brand-secondary text-white text-sm rounded hover:bg-brand-primary">Link New Entity</button>
                            </div>
                            <div className="space-y-2">
                                {selectedCase.entities.map(ent => (
                                    <div key={ent.id} className="flex items-center justify-between p-3 bg-white border rounded hover:bg-gray-50">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-blue-100 rounded-full mr-3">
                                                {ent.type === 'Person' ? <UsersIcon className="h-5 w-5 text-blue-600" /> : <DocumentTextIcon className="h-5 w-5 text-blue-600" />}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800">{ent.name}</p>
                                                <p className="text-xs text-gray-500">{ent.type} • {ent.details}</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400">Linked: {ent.linkedDate}</p>
                                    </div>
                                ))}
                                {selectedCase.entities.length === 0 && <p className="text-gray-500 text-center py-8">No entities linked to this case yet.</p>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'timeline' && (
                        <div className="p-4 bg-gray-50 rounded-lg border">
                            <div className="flex items-center mb-6">
                                <ClockIcon className="h-6 w-6 text-brand-secondary mr-2" />
                                <h3 className="text-lg font-semibold text-brand-dark">Long-Term Activity History</h3>
                            </div>
                            <div className="ml-2">
                                {mockTimelineEvents.map((event, idx) => (
                                    <TimelineEvent key={idx} event={event} />
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'log' && (
                        <div>
                            <div className="mb-6">
                                <textarea 
                                    value={newNote} 
                                    onChange={e => setNewNote(e.target.value)} 
                                    placeholder="Add a new investigative note..." 
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-secondary"
                                    rows={3}
                                />
                                <div className="flex justify-end mt-2">
                                    <button onClick={handleAddNote} disabled={!newNote.trim()} className="px-4 py-2 bg-brand-primary text-white rounded disabled:bg-gray-300">Add Entry</button>
                                </div>
                            </div>
                            <div className="relative border-l-2 border-gray-200 ml-3 space-y-6">
                                {selectedCase.notes.map(note => (
                                    <div key={note.id} className="ml-6 relative">
                                        <div className={`absolute -left-[31px] mt-1.5 w-4 h-4 rounded-full border-2 border-white ${note.type === 'Evidence' ? 'bg-red-500' : 'bg-brand-secondary'}`}></div>
                                        <div className="bg-gray-50 p-4 rounded-lg border">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-sm text-brand-dark">{note.author}</span>
                                                <span className="text-xs text-gray-500">{note.timestamp}</span>
                                            </div>
                                            <p className="text-gray-800 text-sm">{note.content}</p>
                                            <span className="inline-block mt-2 px-2 py-0.5 bg-white border rounded text-[10px] font-semibold text-gray-500 uppercase">{note.type}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'visual' && (
                        <div className="bg-gray-900 rounded-lg h-96 flex items-center justify-center relative overflow-hidden">
                            <div className="text-center z-10">
                                <ShareIcon className="h-16 w-16 text-brand-secondary mx-auto mb-4 opacity-50" />
                                <p className="text-gray-400">Interactive Network Graph Placeholder</p>
                                <p className="text-xs text-gray-600 mt-2">Visualizes links between {selectedCase.entities.length} entities</p>
                            </div>
                            {/* Simple visual effect */}
                            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-brand-primary rounded-full filter blur-[100px] opacity-20 transform -translate-x-1/2 -translate-y-1/2"></div>
                        </div>
                    )}

                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {promotionModalOpen && referralToPromote && (
                <PromoteModal 
                    referral={referralToPromote} 
                    activeCases={cases.filter(c => c.status === 'Active')} 
                    onClose={() => setPromotionModalOpen(false)} 
                    onPromote={handlePromoteReferral} 
                />
            )}

            <Card className="bg-indigo-50 border-l-4 border-indigo-500">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <InformationCircleIcon className="h-5 w-5 text-indigo-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-bold text-indigo-800">Strategic Investigation Platform</h3>
                        <div className="mt-2 text-sm text-indigo-700">
                            <p>
                                The Case Management Module enables <strong>long-term, strategic investigations</strong> into complex threats (e.g., organized crime rings, smuggling networks).
                            </p>
                            <p className="mt-1">
                                It is functionally distinct from the real-time, tactical <span className="font-bold">Referral Manager</span>, which focuses on clearing specific alerts for individual flights.
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            <Card title="Case Management Overview">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-500">Active Investigations</p>
                        <p className="text-3xl font-bold text-brand-primary">{kpis.active}</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                        <p className="text-sm text-gray-500">High Priority Cases</p>
                        <p className="text-3xl font-bold text-status-red">{kpis.highPriority}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Total Cases</p>
                        <p className="text-3xl font-bold text-brand-dark">{kpis.total}</p>
                    </div>
                </div>
            </Card>
            
            {promotableReferrals.length > 0 && (
                <Card title="Tactical Referrals Pending Promotion" className="border border-amber-200 shadow-md">
                    <p className="text-sm text-gray-600 mb-4">
                        These high-priority referrals from the Risk Manager have been flagged for potential long-term investigation. Promote them to create a new Case or link them to an existing investigation.
                    </p>
                    <div className="grid grid-cols-1 gap-4">
                        {promotableReferrals.map(ref => (
                            <div key={ref.id} className="flex items-center justify-between p-4 bg-white border-l-4 border-amber-500 rounded shadow-sm">
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <span className="font-bold text-brand-dark">{ref.passengerName}</span>
                                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-1 rounded">{ref.puid}</span>
                                    </div>
                                    <p className="text-sm text-red-600 font-semibold mt-1">{ref.hits[0]?.description}</p>
                                    <p className="text-xs text-gray-500">Alerted: {ref.createdAt}</p>
                                </div>
                                <button 
                                    onClick={() => handleOpenPromoteModal(ref)}
                                    className="px-4 py-2 bg-amber-500 text-white text-sm font-bold rounded hover:bg-amber-600 transition-colors flex items-center shadow"
                                >
                                    <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
                                    Promote to Case
                                </button>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {activePoiCases.length > 0 && (
                <Card title="Active POI Targets" className="border border-indigo-200 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activePoiCases.map(c => (
                            <div key={c.id} className="p-4 bg-white border rounded-lg hover:shadow-md transition-all cursor-pointer" onClick={() => setSelectedCase(c)}>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-bold text-indigo-900">{c.primarySubject}</p>
                                        <p className="text-xs text-gray-500">{c.title}</p>
                                    </div>
                                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded">POI</span>
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${c.priority === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>{c.priority} Priority</span>
                                    <span className="text-xs text-gray-400">Updated: Today</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            <Card title="Strategic Investigations">
                <div className="flex justify-end mb-4 space-x-3">
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center">
                        <UsersIcon className="h-5 w-5 mr-2" />
                        Track New POI
                    </button>
                    <button className="px-4 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-primary transition-colors flex items-center">
                         <FolderOpenIcon className="h-5 w-5 mr-2" />
                         Create New Case
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Case ID / Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agencies</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lead</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {cases.map(c => (
                                <tr key={c.id} onClick={() => setSelectedCase(c)} className="hover:bg-gray-50 cursor-pointer">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-brand-dark">{c.title}</div>
                                        <div className="text-xs text-gray-500 font-mono">{c.id}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${c.caseType === 'POI' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                            {c.caseType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {c.collaboratingAgencies.map(ag => (
                                                <AgencyBadge key={ag.id} name={ag.name} />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4"><StatusPill status={c.status} /></td>
                                    <td className="px-6 py-4"><PriorityPill priority={c.priority} /></td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{c.leadInvestigator}</td>
                                    <td className="px-6 py-4">
                                        <button className="text-brand-secondary hover:underline text-sm font-semibold">Open Dossier</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
