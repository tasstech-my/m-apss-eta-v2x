


import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/Card';
import type { RiskProfile, ProfileHit, ProfileRule, RouteDefinition, RouteProfileAssignment } from '../types';
import { FunnelIcon, ShieldExclamationIcon, ShareIcon, ServerIcon, PuzzlePieceIcon, CodeBracketSquareIcon, MapIcon } from '../constants';

// MOCK DATA - STANDARD PROFILES
const initialProfiles: RiskProfile[] = [
    {
        id: 'PROF-001',
        name: 'One-Way Cash Ticket',
        description: 'Identifies travelers with one-way tickets paid in cash, often associated with illicit travel.',
        category: 'Narcotics',
        riskScoreImpact: 60,
        enabled: true,
        rules: [
            { field: 'Itinerary Type', operator: 'Equals', value: 'One Way' },
            { field: 'Payment Method', operator: 'Equals', value: 'Cash' },
        ]
    },
    {
        id: 'PROF-002',
        name: 'Short Turnaround - High Risk Origin',
        description: 'Travelers returning from high-risk narcotics source countries within 72 hours.',
        category: 'Narcotics',
        riskScoreImpact: 80,
        enabled: true,
        rules: [
            { field: 'Origin Country', operator: 'Equals', value: 'High Risk Zone A' },
            { field: 'Stay Duration', operator: 'Less Than', value: '72 hours' },
        ]
    },
    {
        id: 'PROF-003',
        name: 'Potential Human Trafficking Group',
        description: 'Multiple unrelated passengers on same PNR with one-way tickets.',
        category: 'Immigration',
        riskScoreImpact: 90,
        enabled: true,
        rules: [
            { field: 'Passenger Count', operator: 'Greater Than', value: '3' },
            { field: 'Surnames Match', operator: 'Equals', value: 'False' },
            { field: 'Itinerary Type', operator: 'Equals', value: 'One Way' },
        ]
    },
    {
        id: 'PROF-004',
        name: 'Late Booking - No Baggage',
        description: 'International flight booked <6 hours before departure with no checked bags.',
        category: 'Security',
        riskScoreImpact: 50,
        enabled: false,
        rules: [
            { field: 'Booking Window', operator: 'Less Than', value: '6 hours' },
            { field: 'Checked Bags', operator: 'Equals', value: '0' },
            { field: 'Route Type', operator: 'Equals', value: 'International' },
        ]
    }
];

// MOCK DATA - EXTENDED PROFILER ENGINES
interface ExternalEngine {
    id: string;
    name: string;
    type: 'Rules Engine' | 'ML Model' | 'External API';
    adaptor: string;
    status: 'Online' | 'Offline' | 'Latency Warning';
    latency: number;
}

const mockExternalEngines: ExternalEngine[] = [
    { id: 'EXT-01', name: 'Corporate Drools Cluster', type: 'Rules Engine', adaptor: 'Extended Profile Adaptor', status: 'Online', latency: 120 },
    { id: 'EXT-02', name: 'TensorFlow Risk Pred. V3', type: 'ML Model', adaptor: 'AI Model Adaptor', status: 'Online', latency: 250 },
    { id: 'EXT-03', name: 'Interpol Stolen Docs (Live)', type: 'External API', adaptor: 'GovLink Adaptor', status: 'Latency Warning', latency: 850 },
];

interface RemoteProfile {
    id: string;
    name: string;
    sourceEngine: string;
    description: string;
    complexity: 'High' | 'Very High';
    riskImpact: number;
}

const mockRemoteProfiles: RemoteProfile[] = [
    { id: 'RPROF-001', name: 'Complex Fraud Ring Detection', sourceEngine: 'Corporate Drools Cluster', description: 'Analyzes 5-year travel history graph for circular funding patterns.', complexity: 'Very High', riskImpact: 95 },
    { id: 'RPROF-002', name: 'Predictive Overstay Risk', sourceEngine: 'TensorFlow Risk Pred. V3', description: 'Probabilistic model predicting visa overstay based on demographic and economic factors.', complexity: 'High', riskImpact: 75 },
];

const mockTravelers = ['Liam Johnson', 'Wei Chan', 'Elena Petrova', 'Carlos Garcia', 'Fatima Al-Jamil'];
const mockFlights = ['MH370', 'AK52', 'SQ101', 'EK357', 'QF12'];

// Rule Builder Options
const availableFields = [
    'Form of Payment', 'Itinerary Type', 'Booking Window', 'Origin Country', 
    'Destination Country', 'Stay Duration', 'Passenger Count', 'Checked Bags',
    'Nationality', 'Age'
];

const availableOperators: ProfileRule['operator'][] = [
    'Equals', 'Not Equals', 'Contains', 'Greater Than', 'Less Than'
];

// MOCK DATA - ROUTES
const mockRoutes: RouteDefinition[] = [
    { id: 'RT-001', origin: 'BOG (Bogota)', destination: 'KUL (Kuala Lumpur)', riskLevel: 'High' },
    { id: 'RT-002', origin: 'LHR (London)', destination: 'KUL (Kuala Lumpur)', riskLevel: 'Low' },
    { id: 'RT-003', origin: 'BKK (Bangkok)', destination: 'KUL (Kuala Lumpur)', riskLevel: 'Medium' },
    { id: 'RT-004', origin: 'DXB (Dubai)', destination: 'KUL (Kuala Lumpur)', riskLevel: 'Low' },
];

const initialAssignments: RouteProfileAssignment[] = [
    { routeId: 'RT-001', profileIds: ['PROF-001', 'PROF-002'] }, // BOG: Narcotics checks
    { routeId: 'RT-003', profileIds: ['PROF-003'] }, // BKK: Trafficking checks
];


const ToggleSwitch: React.FC<{ enabled: boolean; onChange: () => void }> = ({ enabled, onChange }) => (
    <button
        type="button"
        className={`${enabled ? 'bg-brand-secondary' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2`}
        role="switch"
        aria-checked={enabled}
        onClick={onChange}
    >
        <span
            className={`${enabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
    </button>
);

const CategoryBadge: React.FC<{ category: RiskProfile['category'] }> = ({ category }) => {
    const colors = {
        Narcotics: 'bg-red-100 text-red-800',
        Immigration: 'bg-blue-100 text-blue-800',
        Security: 'bg-amber-100 text-amber-800',
        Customs: 'bg-green-100 text-green-800',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[category]}`}>{category}</span>;
};

const RuleVisualizer: React.FC<{ rule: ProfileRule }> = ({ rule }) => (
    <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded border border-gray-200 text-sm">
        <span className="font-semibold text-gray-700 bg-gray-200 px-2 py-0.5 rounded">{rule.field}</span>
        <span className="text-gray-500 font-mono lowercase">{rule.operator}</span>
        <span className="font-bold text-brand-primary bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{rule.value}</span>
    </div>
);

const ProfileEditorModal: React.FC<{ onClose: () => void; onSave: (profile: RiskProfile) => void }> = ({ onClose, onSave }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<RiskProfile['category']>('Narcotics');
    const [riskScore, setRiskScore] = useState(50);
    
    // Rule Builder State
    const [rules, setRules] = useState<ProfileRule[]>([]);
    const [currentRuleField, setCurrentRuleField] = useState(availableFields[0]);
    const [currentRuleOperator, setCurrentRuleOperator] = useState<ProfileRule['operator']>('Equals');
    const [currentRuleValue, setCurrentRuleValue] = useState('');

    const handleAddRule = () => {
        if (!currentRuleValue) return;
        setRules([...rules, { field: currentRuleField, operator: currentRuleOperator, value: currentRuleValue }]);
        setCurrentRuleValue(''); // Reset value input
    };

    const handleRemoveRule = (index: number) => {
        setRules(rules.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        if (!name || rules.length === 0) return;
        const newProfile: RiskProfile = {
            id: `PROF-${Date.now()}`, // Simple mock ID
            name,
            description,
            category,
            riskScoreImpact: riskScore,
            enabled: true,
            rules
        };
        onSave(newProfile);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
            <Card title="Create Standard Risk Profile" className="w-full max-w-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Profile Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Cash Smuggling Pattern" className="mt-1 w-full p-2 border rounded-md" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the risk scenario..." rows={2} className="mt-1 w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Risk Category</label>
                            <select value={category} onChange={e => setCategory(e.target.value as any)} className="mt-1 w-full p-2 border rounded-md bg-white">
                                <option value="Narcotics">Narcotics</option>
                                <option value="Immigration">Immigration</option>
                                <option value="Security">Security</option>
                                <option value="Customs">Customs</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Risk Score Impact (+{riskScore})</label>
                            <input type="range" min="10" max="100" value={riskScore} onChange={e => setRiskScore(Number(e.target.value))} className="mt-2 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="text-sm font-bold text-gray-700 uppercase mb-2">Rule Builder</h4>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex flex-col sm:flex-row gap-2 items-end">
                                <div className="flex-1 w-full">
                                    <label className="text-xs text-gray-500">Field</label>
                                    <select value={currentRuleField} onChange={e => setCurrentRuleField(e.target.value)} className="w-full p-2 text-sm border rounded-md bg-white">
                                        {availableFields.map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                </div>
                                <div className="w-full sm:w-32">
                                    <label className="text-xs text-gray-500">Operator</label>
                                    <select value={currentRuleOperator} onChange={e => setCurrentRuleOperator(e.target.value as any)} className="w-full p-2 text-sm border rounded-md bg-white">
                                        {availableOperators.map(op => <option key={op} value={op}>{op}</option>)}
                                    </select>
                                </div>
                                <div className="flex-1 w-full">
                                    <label className="text-xs text-gray-500">Value</label>
                                    <input type="text" value={currentRuleValue} onChange={e => setCurrentRuleValue(e.target.value)} placeholder="e.g., Cash" className="w-full p-2 text-sm border rounded-md" />
                                </div>
                                <button onClick={handleAddRule} className="w-full sm:w-auto px-4 py-2 bg-brand-secondary text-white text-sm font-bold rounded-md hover:bg-brand-primary">
                                    Add Rule
                                </button>
                            </div>

                            {rules.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    <p className="text-xs text-gray-500 font-semibold">Current Rules (AND Logic):</p>
                                    {rules.map((rule, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-white p-2 border rounded shadow-sm">
                                            <div className="flex items-center">
                                                {idx > 0 && <span className="text-xs font-bold bg-gray-200 px-1.5 py-0.5 rounded text-gray-600 mr-2">AND</span>}
                                                <span className="text-sm">
                                                    <span className="font-semibold">{rule.field}</span> <span className="text-gray-500 lowercase">{rule.operator}</span> <span className="font-bold text-brand-primary">"{rule.value}"</span>
                                                </span>
                                            </div>
                                            <button onClick={() => handleRemoveRule(idx)} className="text-red-500 hover:text-red-700 ml-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                    <button onClick={handleSave} disabled={!name || rules.length === 0} className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-dark disabled:bg-gray-400">Save Profile</button>
                </div>
            </Card>
        </div>
    );
};

export const ProfilerDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'standard' | 'extended' | 'route-admin'>('standard');
    const [profiles, setProfiles] = useState<RiskProfile[]>(initialProfiles);
    const [selectedProfileId, setSelectedProfileId] = useState<string>(initialProfiles[0].id);
    const [hits, setHits] = useState<ProfileHit[]>([]);
    const [kpis, setKpis] = useState({ totalHits: 128, highRiskHits: 15 });
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [simulatedQuery, setSimulatedQuery] = useState<{status: string, result: string | null}>({ status: 'idle', result: null });
    
    // Route Admin State
    const [routeAssignments, setRouteAssignments] = useState<RouteProfileAssignment[]>(initialAssignments);
    const [selectedRouteId, setSelectedRouteId] = useState<string>(mockRoutes[0].id);


    const selectedProfile = useMemo(() => profiles.find(p => p.id === selectedProfileId), [profiles, selectedProfileId]);
    const selectedRoute = useMemo(() => mockRoutes.find(r => r.id === selectedRouteId), [selectedRouteId]);

    const handleToggleProfile = (id: string) => {
        setProfiles(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
    };

    const handleCreateProfile = (newProfile: RiskProfile) => {
        setProfiles(prev => [newProfile, ...prev]);
        setSelectedProfileId(newProfile.id);
        setIsEditorOpen(false);
    };
    
    const handleSimulateExternalQuery = () => {
        setSimulatedQuery({ status: 'sending', result: null });
        setTimeout(() => setSimulatedQuery({ status: 'processing', result: null }), 1000);
        setTimeout(() => setSimulatedQuery({ status: 'received', result: 'Risk Score: 85 (High) - Pattern Match: Circular Funding' }), 2500);
    };
    
    const handleToggleProfileForRoute = (profileId: string) => {
        setRouteAssignments(prev => {
            const existingAssignment = prev.find(a => a.routeId === selectedRouteId);
            if (existingAssignment) {
                const newProfileIds = existingAssignment.profileIds.includes(profileId)
                    ? existingAssignment.profileIds.filter(id => id !== profileId)
                    : [...existingAssignment.profileIds, profileId];
                
                return prev.map(a => a.routeId === selectedRouteId ? { ...a, profileIds: newProfileIds } : a);
            } else {
                return [...prev, { routeId: selectedRouteId, profileIds: [profileId] }];
            }
        });
    };

    // Simulate incoming hits for Standard Profiler
    useEffect(() => {
        const interval = setInterval(() => {
            const activeProfiles = profiles.filter(p => p.enabled);
            if (activeProfiles.length === 0) return;

            const randomProfile = activeProfiles[Math.floor(Math.random() * activeProfiles.length)];
            
            const newHit: ProfileHit = {
                id: `HIT-${Date.now()}`,
                profileId: randomProfile.id,
                profileName: randomProfile.name,
                travelerName: mockTravelers[Math.floor(Math.random() * mockTravelers.length)],
                flightNumber: mockFlights[Math.floor(Math.random() * mockFlights.length)],
                timestamp: new Date().toLocaleTimeString(),
                score: randomProfile.riskScoreImpact,
            };

            setHits(prev => [newHit, ...prev.slice(0, 9)]); // Keep last 10
            setKpis(prev => ({
                totalHits: prev.totalHits + 1,
                highRiskHits: prev.highRiskHits + (randomProfile.riskScoreImpact > 70 ? 1 : 0)
            }));

        }, 4000);

        return () => clearInterval(interval);
    }, [profiles]);

    return (
        <div className="space-y-6">
            {isEditorOpen && <ProfileEditorModal onClose={() => setIsEditorOpen(false)} onSave={handleCreateProfile} />}
            
            <div className="bg-white rounded-lg shadow-sm mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('standard')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'standard' ? 'border-brand-primary text-brand-secondary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            Standard Profiler (Internal)
                        </button>
                        <button
                            onClick={() => setActiveTab('extended')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'extended' ? 'border-brand-primary text-brand-secondary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            Extended Profiler (External Integrations)
                        </button>
                        <button
                            onClick={() => setActiveTab('route-admin')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'route-admin' ? 'border-brand-primary text-brand-secondary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            Route Administration
                        </button>
                    </nav>
                </div>
            </div>

            {activeTab === 'standard' && (
                <>
                    <Card title="Profiler Overview">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm text-gray-500">Active Profiles</p>
                                <p className="text-3xl font-bold text-brand-primary">{profiles.filter(p => p.enabled).length}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-500">Total Hits (Today)</p>
                                <p className="text-3xl font-bold text-brand-dark">{kpis.totalHits}</p>
                            </div>
                            <div className="p-4 bg-red-50 rounded-lg">
                                <p className="text-sm text-gray-500">High Risk Hits</p>
                                <p className="text-3xl font-bold text-status-red">{kpis.highRiskHits}</p>
                            </div>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                            <Card title="Behavioral Profiles">
                                <div className="flex justify-end mb-4">
                                    <button 
                                        onClick={() => setIsEditorOpen(true)}
                                        className="px-3 py-1.5 bg-brand-secondary text-white text-xs font-bold rounded hover:bg-brand-primary transition-colors"
                                    >
                                        Create New Profile
                                    </button>
                                </div>
                                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                    {profiles.map(profile => (
                                        <div 
                                            key={profile.id} 
                                            onClick={() => setSelectedProfileId(profile.id)}
                                            className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedProfileId === profile.id ? 'ring-2 ring-brand-secondary shadow-md' : 'hover:bg-gray-50'} ${!profile.enabled ? 'opacity-60 bg-gray-50' : 'bg-white'}`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-bold text-brand-dark text-sm">{profile.name}</h4>
                                                    <p className="text-xs text-gray-500">{profile.id}</p>
                                                </div>
                                                <div onClick={e => e.stopPropagation()}>
                                                    <ToggleSwitch enabled={profile.enabled} onChange={() => handleToggleProfile(profile.id)} />
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <CategoryBadge category={profile.category} />
                                                <span className="text-xs font-semibold text-gray-600">Score: {profile.riskScoreImpact}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>

                        <div className="lg:col-span-2">
                            {selectedProfile ? (
                                <Card title={
                                    <div className="flex items-center">
                                        <FunnelIcon className="h-6 w-6 mr-2 text-brand-secondary" />
                                        <span>Profile Logic: {selectedProfile.name}</span>
                                    </div>
                                }>
                                    <div className="mb-6">
                                        <p className="text-gray-600 text-sm mb-4">{selectedProfile.description}</p>
                                        <div className="flex space-x-6 text-sm">
                                            <div><span className="font-semibold text-gray-500">Category:</span> <span className="ml-1">{selectedProfile.category}</span></div>
                                            <div><span className="font-semibold text-gray-500">Risk Impact:</span> <span className="ml-1 font-bold text-red-600">+{selectedProfile.riskScoreImpact}</span></div>
                                            <div><span className="font-semibold text-gray-500">Status:</span> <span className={`ml-1 font-bold ${selectedProfile.enabled ? 'text-green-600' : 'text-gray-400'}`}>{selectedProfile.enabled ? 'Active' : 'Inactive'}</span></div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                                        <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 tracking-wider">Rule Logic (IF MATCH)</h4>
                                        <div className="space-y-2">
                                            {selectedProfile.rules.map((rule, index) => (
                                                <div key={index} className="flex items-center">
                                                    {index > 0 && <div className="text-xs font-bold text-gray-400 bg-white border px-1 py-0.5 rounded mx-2">AND</div>}
                                                    <RuleVisualizer rule={rule} />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-gray-300">
                                            <div className="flex items-center text-sm">
                                                <span className="font-bold text-gray-600 mr-2">THEN:</span>
                                                <span className="bg-red-100 text-red-800 px-2 py-1 rounded border border-red-200 font-semibold">Generate Profiling Hit (Score +{selectedProfile.riskScoreImpact})</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ) : (
                                <Card><p className="text-center text-gray-500 py-10">Select a profile to view its logic.</p></Card>
                            )}

                            <div className="mt-6">
                                <Card title="Live Profiling Hits">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Profile Triggered</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Traveler</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {hits.map(hit => (
                                                    <tr key={hit.id} className="hover:bg-gray-50 new-alert-row">
                                                        <td className="px-4 py-2 whitespace-nowrap text-xs font-mono text-gray-500">{hit.timestamp}</td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-brand-dark">{hit.profileName}</td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{hit.travelerName} <span className="text-xs text-gray-400">({hit.flightNumber})</span></td>
                                                        <td className="px-4 py-2 whitespace-nowrap"><span className="font-bold text-red-600">+{hit.score}</span></td>
                                                        <td className="px-4 py-2 whitespace-nowrap"><button className="text-xs text-brand-secondary hover:underline">View Analysis</button></td>
                                                    </tr>
                                                ))}
                                                {hits.length === 0 && <tr><td colSpan={5} className="text-center py-4 text-gray-500">No profiling hits yet.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                </>
            )}
            
            {activeTab === 'extended' && (
                <>
                    <Card title="External Intelligence Integrations">
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 p-4">
                             {/* Visualization of Flow */}
                             <div className="flex items-center justify-center space-x-4 flex-1">
                                <div className="text-center p-4 bg-white border rounded-lg shadow-sm">
                                    <FunnelIcon className="h-8 w-8 mx-auto text-brand-primary mb-2"/>
                                    <p className="text-xs font-bold">Profiler Module</p>
                                </div>
                                <div className="h-px w-8 bg-gray-400"></div>
                                <div className="text-center p-4 bg-white border rounded-lg shadow-sm">
                                    <ShareIcon className="h-8 w-8 mx-auto text-brand-secondary mb-2"/>
                                    <p className="text-xs font-bold">Risk Broker</p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="h-px w-8 bg-gray-400 mb-1"></div>
                                    <div className="px-2 py-1 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded border border-indigo-300">Extended Profile Adaptor</div>
                                    <div className="h-px w-8 bg-gray-400 mt-1"></div>
                                </div>
                                <div className="text-center p-4 bg-gray-100 border-2 border-dashed border-gray-400 rounded-lg">
                                    <ServerIcon className="h-8 w-8 mx-auto text-gray-600 mb-2"/>
                                    <p className="text-xs font-bold text-gray-600">External Engine (Drools/ML)</p>
                                </div>
                             </div>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card title="Connected External Engines">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Engine Name</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Latency</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {mockExternalEngines.map(eng => (
                                            <tr key={eng.id}>
                                                <td className="px-4 py-3 text-sm font-medium text-brand-dark">{eng.name}</td>
                                                <td className="px-4 py-3 text-xs text-gray-600">{eng.type}</td>
                                                <td className="px-4 py-3 text-xs"><span className={`px-2 py-0.5 rounded-full ${eng.status === 'Online' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{eng.status}</span></td>
                                                <td className="px-4 py-3 text-xs font-mono">{eng.latency}ms</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>

                        <Card title="Live Query Simulation">
                            <div className="p-4 bg-gray-50 border rounded-lg">
                                <p className="text-sm text-gray-600 mb-4">Test the connection by sending a dummy traveler record to the external engines via the Risk Broker.</p>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-3 h-3 rounded-full ${simulatedQuery.status === 'idle' ? 'bg-gray-300' : simulatedQuery.status === 'received' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}></div>
                                        <span className="text-sm font-semibold capitalize">{simulatedQuery.status === 'idle' ? 'Ready' : simulatedQuery.status}</span>
                                    </div>
                                    <button 
                                        onClick={handleSimulateExternalQuery} 
                                        disabled={simulatedQuery.status !== 'idle' && simulatedQuery.status !== 'received'}
                                        className="px-4 py-2 bg-brand-secondary text-white text-sm font-bold rounded hover:bg-brand-primary disabled:bg-gray-400 transition-colors"
                                    >
                                        Send Test Probe
                                    </button>
                                </div>
                                <div className="bg-black text-green-400 font-mono text-xs p-3 rounded-md h-24 overflow-y-auto">
                                    {simulatedQuery.status === 'idle' && "> System ready. Waiting for test command..."}
                                    {simulatedQuery.status === 'sending' && (
                                        <>
                                            <div> &gt; Sending probe via Risk Broker...</div>
                                            <div> &gt; Routing to Extended Profile Adaptor...</div>
                                        </>
                                    )}
                                    {simulatedQuery.status === 'processing' && (
                                        <>
                                            <div> &gt; Sending probe via Risk Broker...</div>
                                            <div> &gt; Routing to Extended Profile Adaptor...</div>
                                            <div> &gt; Querying 'Corporate Drools Cluster'...</div>
                                            <div> &gt; Querying 'TensorFlow Risk Pred. V3'...</div>
                                            <div> &gt; Awaiting response...</div>
                                        </>
                                    )}
                                    {simulatedQuery.status === 'received' && (
                                        <>
                                            <div> &gt; Response received from External Engines.</div>
                                            <div className="text-white font-bold"> &gt; RESULT: {simulatedQuery.result}</div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>

                    <Card title="Remote Profile Subscriptions">
                         <p className="text-sm text-gray-600 mb-4">These complex risk profiles are managed within the external engines but are active for all incoming traveler data.</p>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {mockRemoteProfiles.map(rp => (
                                <div key={rp.id} className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center">
                                            <PuzzlePieceIcon className="h-5 w-5 text-indigo-600 mr-2"/>
                                            <h4 className="font-bold text-brand-dark">{rp.name}</h4>
                                        </div>
                                        <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded">+{rp.riskImpact}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 font-mono">{rp.id}</p>
                                    <p className="text-sm text-gray-700 mt-2">{rp.description}</p>
                                    <div className="mt-3 flex justify-between items-center text-xs">
                                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Source: {rp.sourceEngine}</span>
                                        <span className="text-brand-secondary font-semibold">Complexity: {rp.complexity}</span>
                                    </div>
                                </div>
                            ))}
                         </div>
                    </Card>
                </>
            )}

            {activeTab === 'route-admin' && (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                            <Card title="Flight Routes">
                                <div className="space-y-2">
                                    {mockRoutes.map(route => {
                                        const isSelected = selectedRouteId === route.id;
                                        return (
                                            <div 
                                                key={route.id} 
                                                onClick={() => setSelectedRouteId(route.id)}
                                                className={`p-3 rounded-lg cursor-pointer border-l-4 transition-all ${isSelected ? 'bg-blue-50 border-brand-secondary shadow-md' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center">
                                                        <MapIcon className={`h-5 w-5 mr-3 ${isSelected ? 'text-brand-primary' : 'text-gray-400'}`} />
                                                        <div>
                                                            <p className="font-bold text-sm text-brand-dark">{route.origin} &rarr; {route.destination}</p>
                                                            <p className="text-xs text-gray-500">{route.id}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`text-xs px-2 py-0.5 rounded font-semibold ${route.riskLevel === 'High' ? 'bg-red-100 text-red-800' : route.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                                                        {route.riskLevel} Risk
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                            <Card title="System Optimization" className="mt-6 bg-indigo-50">
                                <div className="text-center">
                                    <p className="text-sm text-indigo-900 font-medium">Estimated Load Reduction</p>
                                    <p className="text-4xl font-bold text-indigo-600 my-2">42%</p>
                                    <p className="text-xs text-indigo-700">
                                        By selectively assigning profiles, the system avoids unnecessary processing on low-risk routes, increasing overall throughput and signal quality.
                                    </p>
                                </div>
                            </Card>
                        </div>
                        
                        <div className="lg:col-span-2">
                            <Card title={
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <ShieldExclamationIcon className="h-6 w-6 mr-2 text-brand-secondary" />
                                        <span>Profile Assignment: {selectedRoute?.origin} &rarr; {selectedRoute?.destination}</span>
                                    </div>
                                </div>
                            }>
                                <p className="text-sm text-gray-600 mb-4">
                                    Select which risk profiles should be active for flights on this route. Activating relevant profiles (e.g., Narcotics for high-risk origins) improves detection accuracy and reduces noise.
                                </p>
                                
                                <div className="overflow-y-auto max-h-[500px] border rounded-lg bg-gray-50">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-100 sticky top-0">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profile Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score Impact</th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Active on Route</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {profiles.map(profile => {
                                                const assignment = routeAssignments.find(a => a.routeId === selectedRouteId);
                                                const isAssigned = assignment?.profileIds.includes(profile.id) || false;
                                                
                                                return (
                                                    <tr key={profile.id} className={`hover:bg-gray-50 ${!profile.enabled ? 'opacity-50' : ''}`}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="font-medium text-sm text-brand-dark">{profile.name}</div>
                                                            <div className="text-xs text-gray-500 max-w-xs truncate">{profile.description}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <CategoryBadge category={profile.category} />
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                            +{profile.riskScoreImpact}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                                            <div className="flex justify-center">
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={isAssigned} 
                                                                    onChange={() => handleToggleProfileForRoute(profile.id)}
                                                                    disabled={!profile.enabled}
                                                                    className="h-5 w-5 text-brand-secondary focus:ring-brand-primary border-gray-300 rounded cursor-pointer"
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};