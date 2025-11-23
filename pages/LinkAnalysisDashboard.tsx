
import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/Card';
import type { GraphNode, GraphLink, GraphNodeType, GraphLinkType } from '../types';
import { UsersIcon, PhoneIcon, DocumentTextIcon, LinkIcon, MapIcon, ShareIcon, CloudArrowDownIcon, IdentificationIcon, CreditCardIcon, BriefcaseIcon } from '../constants';

// --- MOCK DATA GENERATOR ---
// Creates a small network centered around a high-risk individual
const generateMockNetwork = (seedId: string): { nodes: GraphNode[], links: GraphLink[] } => {
    const nodes: GraphNode[] = [
        { id: 'NODE-1', type: 'Person', label: 'Omar Al-Masri', riskLevel: 'Critical', x: 50, y: 50, details: 'PUID: H6I7J8K\nRisk: Narcotics Watchlist' },
        { id: 'NODE-2', type: 'PNR', label: 'PNR-XYZ123', x: 35, y: 30, details: 'Booking Ref: XYZ123\nDate: 2023-10-28' },
        { id: 'NODE-3', type: 'Person', label: 'Elena Petrova', riskLevel: 'High', x: 20, y: 35, details: 'PUID: PUID-7721\nRisk: Anomalous Booking' },
        { id: 'NODE-4', type: 'Phone', label: '+60 12-345 6789', x: 65, y: 65, details: 'Mobile Number\nReg: Kuala Lumpur' },
        { id: 'NODE-5', type: 'Person', label: 'Ali Hassan', riskLevel: 'Medium', x: 80, y: 70, details: 'PUID: PUID-9912\nRisk: Frequent Travel' },
        { id: 'NODE-6', type: 'Address', label: '123 Jalan Ampang', x: 55, y: 20, details: 'Residential Address' },
        { id: 'NODE-7', type: 'Person', label: 'Sarah Lim', riskLevel: 'Low', x: 65, y: 10, details: 'PUID: PUID-5543' },
        { id: 'NODE-8', type: 'Flight', label: 'MH123', x: 30, y: 70, details: 'Flight KUL-LHR' },
    ];

    const links: GraphLink[] = [
        { id: 'L1', source: 'NODE-1', target: 'NODE-2', type: 'BookedWith', label: 'Booked' },
        { id: 'L2', source: 'NODE-3', target: 'NODE-2', type: 'BookedWith', label: 'Shared PNR' },
        { id: 'L3', source: 'NODE-1', target: 'NODE-4', type: 'SharedContact', label: 'Uses Phone' },
        { id: 'L4', source: 'NODE-5', target: 'NODE-4', type: 'SharedContact', label: 'Shared Phone' },
        { id: 'L5', source: 'NODE-1', target: 'NODE-6', type: 'SameAddress', label: 'Resides At' },
        { id: 'L6', source: 'NODE-7', target: 'NODE-6', type: 'SameAddress', label: 'Shared Address' },
        { id: 'L7', source: 'NODE-1', target: 'NODE-8', type: 'SameFlight', label: 'Passenger' },
        { id: 'L8', source: 'NODE-3', target: 'NODE-8', type: 'SameFlight', label: 'Passenger' },
    ];

    return { nodes, links };
};

// Generates a larger, "fused" network demonstrating data integration
const generateIntegratedNetwork = (): { nodes: GraphNode[], links: GraphLink[] } => {
    const base = generateMockNetwork('');
    const newNodes: GraphNode[] = [
        ...base.nodes,
        { id: 'NODE-9', type: 'Document', label: 'Passport: A123...', x: 45, y: 60, details: 'Source: APP Data' },
        { id: 'NODE-10', type: 'Document', label: 'Visa: V998...', x: 55, y: 60, details: 'Source: APP Data' },
        { id: 'NODE-11', type: 'Address', label: 'Bag Tag: UA772', x: 20, y: 80, details: 'Source: DCS Data' }, // Reusing Address icon for Bag Tag visual for now or add new type
        { id: 'NODE-12', type: 'Phone', label: '+44 7700 900000', x: 10, y: 20, details: 'Source: PNR Contact' },
    ];
    
    const newLinks: GraphLink[] = [
        ...base.links,
        { id: 'L9', source: 'NODE-1', target: 'NODE-9', type: 'DocumentHolder', label: 'Holds Doc' },
        { id: 'L10', source: 'NODE-1', target: 'NODE-10', type: 'DocumentHolder', label: 'Holds Visa' },
        { id: 'L11', source: 'NODE-1', target: 'NODE-11', type: 'BookedWith', label: 'Checked Bag' },
        { id: 'L12', source: 'NODE-3', target: 'NODE-12', type: 'SharedContact', label: 'Emergency Contact' },
    ];
    
    return { nodes: newNodes, links: newLinks };
};

// Generates network with Linkable Data Points (Payment, Agent, Sequence)
const generateLinkableDataNetwork = (): { nodes: GraphNode[], links: GraphLink[] } => {
    const nodes: GraphNode[] = [
        { id: 'NODE-A', type: 'Person', label: 'Traveler A', riskLevel: 'High', x: 40, y: 40, details: 'High Risk Score' },
        { id: 'NODE-B', type: 'Person', label: 'Traveler B', riskLevel: 'Low', x: 60, y: 40, details: 'No prior risk history' },
        { id: 'NODE-C', type: 'Person', label: 'Traveler C', riskLevel: 'Medium', x: 80, y: 40, details: 'Frequent co-traveler' },
        { id: 'NODE-PAY', type: 'Payment', label: 'Visa **** 1234', x: 50, y: 20, details: 'Issued: Bank of America' },
        { id: 'NODE-AGT', type: 'Agent', label: 'Global Travel Co.', x: 70, y: 60, details: 'IATA: 9999999' },
        { id: 'NODE-D', type: 'Person', label: 'Traveler D', riskLevel: 'Low', x: 20, y: 60, details: 'Seq #101' },
        { id: 'NODE-E', type: 'Person', label: 'Traveler E', riskLevel: 'Medium', x: 40, y: 70, details: 'Seq #102' },
    ];

    const links: GraphLink[] = [
        { id: 'L-PAY-1', source: 'NODE-A', target: 'NODE-PAY', type: 'SharedPayment', label: 'Paid By' },
        { id: 'L-PAY-2', source: 'NODE-B', target: 'NODE-PAY', type: 'SharedPayment', label: 'Paid By' },
        { id: 'L-AGT-1', source: 'NODE-B', target: 'NODE-AGT', type: 'SharedAgent', label: 'Booked Via' },
        { id: 'L-AGT-2', source: 'NODE-C', target: 'NODE-AGT', type: 'SharedAgent', label: 'Booked Via' },
        { id: 'L-SEQ-1', source: 'NODE-D', target: 'NODE-E', type: 'SequentialCheckIn', label: 'Seq Check-in' },
    ];

    return { nodes, links };
};

// --- ICONS MAPPING ---
const NodeIcon = ({ type, className }: { type: GraphNodeType, className?: string }) => {
    switch (type) {
        case 'Person': return <UsersIcon className={className} />;
        case 'Phone': return <PhoneIcon className={className} />;
        case 'Email': return <div className={className}>@</div>; // Simple text fallback
        case 'Address': return <MapIcon className={className} />;
        case 'PNR': return <DocumentTextIcon className={className} />;
        case 'Flight': return <LinkIcon className={className} />; 
        case 'Document': return <IdentificationIcon className={className} />;
        case 'Payment': return <CreditCardIcon className={className} />;
        case 'Agent': return <BriefcaseIcon className={className} />;
        default: return <div className={`rounded-full border-2 ${className}`} />;
    }
};

export const LinkAnalysisDashboard: React.FC = () => {
    const [seedInput, setSeedInput] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [graphData, setGraphData] = useState<{ nodes: GraphNode[], links: GraphLink[] } | null>(null);
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
    
    // Analysis State
    const [layout, setLayout] = useState<'organic' | 'circle' | 'hierarchy'>('organic');
    const [selectionMode, setSelectionMode] = useState<'normal' | 'pathStart' | 'pathEnd'>('normal');
    const [pathStart, setPathStart] = useState<string | null>(null);
    const [pathEnd, setPathEnd] = useState<string | null>(null);
    
    // Import State
    const [isImporting, setIsImporting] = useState(false);
    const [importStep, setImportStep] = useState<string>('');

    const [filters, setFilters] = useState({
        showPnr: true,
        showContact: true,
        showAddress: true,
        showFlight: true,
        showPayment: true,
        showAgent: true,
        showSequence: true,
    });

    // --- LAYOUT ALGORITHMS (SIMULATED) ---
    useEffect(() => {
        if (!graphData) return;

        let newNodes = [...graphData.nodes];
        const centerX = 50;
        const centerY = 50;

        if (layout === 'circle') {
            const radius = 35;
            const angleStep = (2 * Math.PI) / newNodes.length;
            newNodes = newNodes.map((node, index) => ({
                ...node,
                x: centerX + radius * Math.cos(index * angleStep),
                y: centerY + radius * Math.sin(index * angleStep)
            }));
        } else if (layout === 'hierarchy') {
            // Simple hierarchy: Persons at top, others below based on type
            const levels: Record<string, number> = { 'Person': 10, 'PNR': 30, 'Flight': 30, 'Agent': 30, 'Payment': 50, 'Phone': 70, 'Address': 70, 'Document': 60 };
            const countPerLevel: Record<number, number> = {};
            
            newNodes = newNodes.map(node => {
                const y = levels[node.type] || 50;
                countPerLevel[y] = (countPerLevel[y] || 0) + 1;
                return { ...node, y, _tempIndex: countPerLevel[y] }; // Store index for x calc
            });

            // Distribute X
            newNodes = newNodes.map(node => {
                const levelY = levels[node.type] || 50;
                const totalInLevel = countPerLevel[levelY];
                const x = (100 / (totalInLevel + 1)) * (node as any)._tempIndex;
                return { ...node, x };
            });
        } else {
            // Organic - Reset to original mock positions (simulating force-directed)
            // In a real scenario, this would re-run a force simulation
            // Here we just try to respect the original generated coordinates if available or keep current
            // For this mock, we will just keep them as is for 'organic' to avoid complexity, 
            // or re-generate if it was a fresh load.
            // To keep it simple, we won't force re-calc for organic in this mock, assuming initial load is organic.
        }

        setGraphData(prev => prev ? { ...prev, nodes: newNodes } : null);
    }, [layout]);


    const handleAnalyze = () => {
        if (!seedInput.trim()) return;
        setIsAnalyzing(true);
        setGraphData(null);
        setSelectedNode(null);
        setPathStart(null);
        setPathEnd(null);

        // Simulate processing delay
        setTimeout(() => {
            const data = generateMockNetwork(seedInput);
            setGraphData(data);
            setIsAnalyzing(false);
        }, 1500);
    };
    
    const handleOneClickImport = () => {
        setIsImporting(true);
        setGraphData(null);
        
        // Simulation sequence
        setImportStep('Connecting to Traveler Database...');
        setTimeout(() => setImportStep('Fetching PNR Records...'), 800);
        setTimeout(() => setImportStep('Fetching APP/Interactive Data...'), 1600);
        setTimeout(() => setImportStep('Fetching DCS Check-in Details...'), 2400);
        setTimeout(() => setImportStep('Correlating Entities & Building Graph...'), 3200);
        
        setTimeout(() => {
            setGraphData(generateIntegratedNetwork());
            setIsImporting(false);
            setImportStep('');
        }, 4000);
    };

    const handleDiscoverPattern = (pattern: 'FOP' | 'Agent' | 'CheckIn') => {
        setIsAnalyzing(true);
        setGraphData(null);
        setTimeout(() => {
            setGraphData(generateLinkableDataNetwork());
            setIsAnalyzing(false);
        }, 1000);
    };

    const handleNodeClick = (node: GraphNode) => {
        if (selectionMode === 'pathStart') {
            setPathStart(node.id);
            setSelectionMode('pathEnd');
        } else if (selectionMode === 'pathEnd') {
            setPathEnd(node.id);
            setSelectionMode('normal');
        } else {
            setSelectedNode(node);
        }
    };

    const filteredData = useMemo(() => {
        if (!graphData) return null;
        
        const activeLinkTypes: GraphLinkType[] = [];
        if (filters.showPnr) activeLinkTypes.push('BookedWith');
        if (filters.showContact) activeLinkTypes.push('SharedContact');
        if (filters.showAddress) activeLinkTypes.push('SameAddress');
        if (filters.showFlight) activeLinkTypes.push('SameFlight');
        if (filters.showPayment) activeLinkTypes.push('SharedPayment');
        if (filters.showAgent) activeLinkTypes.push('SharedAgent');
        if (filters.showSequence) activeLinkTypes.push('SequentialCheckIn');
        activeLinkTypes.push('DocumentHolder'); // Always show document links for now

        const filteredLinks = graphData.links.filter(l => activeLinkTypes.includes(l.type));
        
        const connectedNodeIds = new Set<string>();
        // In a filtered view, we might want to show all nodes that have at least one visible link,
        // OR show all nodes and just hide links. 
        // Let's show nodes that are part of visible links to reduce clutter.
        
        filteredLinks.forEach(l => {
            connectedNodeIds.add(l.source);
            connectedNodeIds.add(l.target);
        });

        // If no links are visible, maybe show isolated nodes? 
        // For this demo, let's just filter nodes based on links to clean up the view.
        // Unless it's the seed node or central nodes.
        // Simpler approach: Show all nodes from the dataset, just hide links. 
        // But the requirement implies "visualize networks based on...", so filtering nodes is better.
        
        // Ensure we keep the original set if just generated, to avoid empty screen on load if logic is strict
        if (filteredLinks.length === 0 && graphData.nodes.length > 0) {
             // If no links match, show all nodes (disconnected)
             return { nodes: graphData.nodes, links: [] };
        }

        const filteredNodes = graphData.nodes.filter(n => connectedNodeIds.has(n.id));
        return { nodes: filteredNodes, links: filteredLinks };
    }, [graphData, filters]);

    // Highlight Path Logic (Mock: Highlights direct or 1-hop connections)
    const isPathLink = (link: GraphLink) => {
        if (!pathStart || !pathEnd) return false;
        // Very basic check: is this link connected to the start or end?
        // In a real app, this would be Dijkstra's algorithm.
        // For demo visual: Highlight links that are part of the mocked 'flow'
        return (link.source === pathStart || link.target === pathStart || link.source === pathEnd || link.target === pathEnd);
    };

    const getNodeColor = (node: GraphNode) => {
        if (node.type === 'Person') {
            switch (node.riskLevel) {
                case 'Critical': return '#ef4444';
                case 'High': return '#f97316';
                case 'Medium': return '#eab308';
                case 'Low': return '#22c55e';
                default: return '#3b82f6';
            }
        }
        switch (node.type) {
            case 'PNR': return '#8b5cf6';
            case 'Phone': return '#64748b';
            case 'Address': return '#14b8a6';
            case 'Flight': return '#0ea5e9';
            case 'Document': return '#ec4899';
            case 'Payment': return '#d946ef'; // Fuchsia
            case 'Agent': return '#a16207'; // Saddle Brown
            default: return '#9ca3af';
        }
    };

    const toggleFilter = (key: keyof typeof filters) => {
        setFilters(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col space-y-4">
            
            <Card className="flex-shrink-0 bg-indigo-50 border-l-4 border-indigo-500 !p-4">
                <div className="flex justify-between items-start">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <ShareIcon className="h-5 w-5 text-indigo-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-bold text-indigo-800">Advanced Link Detection</h3>
                            <div className="mt-2 text-sm text-indigo-700 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div><span className="font-bold">Visual Link Analysis:</span> Reveals hidden connections in complex data.</div>
                                <div><span className="font-bold">Social Network Analysis (SNA):</span> Identifies key influencers and bridges.</div>
                                <div><span className="font-bold">Temporal Analysis:</span> (Timeline View) Maps events chronologically.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
            
             {/* Data Fusion Center */}
             <Card className="flex-shrink-0 !p-2 bg-gradient-to-r from-blue-50 to-white border-b border-blue-200">
                 <div className="flex items-center justify-between px-2">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-full mr-3">
                            <CloudArrowDownIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-brand-dark">Data Fusion & Integration</h3>
                            <p className="text-xs text-gray-500">Automated data feed from Traveler Database (PNR + APP + DCS)</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                         {isImporting && (
                            <div className="flex items-center space-x-2 text-sm font-medium text-blue-600 animate-pulse">
                                <span>{importStep}</span>
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                            </div>
                        )}
                        <button 
                            onClick={handleOneClickImport} 
                            disabled={isImporting}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded shadow hover:bg-blue-700 transition-colors disabled:bg-blue-300 flex items-center"
                        >
                            <CloudArrowDownIcon className="h-4 w-4 mr-2" />
                            {isImporting ? 'Integrating...' : 'Import & Fuse from Traveler Database'}
                        </button>
                    </div>
                 </div>
            </Card>

            <Card className="flex-shrink-0 !p-2">
                 <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Search */}
                    <div className="flex-1 min-w-[250px] flex gap-2">
                         <div className="relative flex-grow">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LinkIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input 
                                type="text" 
                                value={seedInput}
                                onChange={(e) => setSeedInput(e.target.value)}
                                placeholder="Seed Entity (e.g., PUID, PNR)" 
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                        </div>
                        <button 
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || isImporting || !seedInput}
                            className="px-4 py-2 bg-brand-secondary text-white font-bold rounded-md hover:bg-brand-primary disabled:bg-gray-300 text-sm"
                        >
                            {isAnalyzing ? 'Mapping...' : 'Analyze'}
                        </button>
                    </div>
                    
                    {/* Pattern Discovery Toolbar */}
                    <div className="flex items-center space-x-2 border-l pl-4">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Pattern Discovery:</span>
                        <button onClick={() => handleDiscoverPattern('FOP')} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold hover:bg-purple-200 border border-purple-200" title="Find shared credit cards">Analyze FOP</button>
                        <button onClick={() => handleDiscoverPattern('Agent')} className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-bold hover:bg-amber-200 border border-amber-200" title="Find shared travel agents">Analyze Agents</button>
                        <button onClick={() => handleDiscoverPattern('CheckIn')} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold hover:bg-green-200 border border-green-200" title="Find sequential check-in">Analyze Check-in</button>
                    </div>

                    {/* Analysis Tools */}
                    {graphData && (
                        <div className="flex items-center space-x-4 border-l pl-4">
                            <div className="flex items-center space-x-2">
                                <span className="text-xs font-semibold text-gray-500 uppercase">Layout:</span>
                                <button onClick={() => setLayout('organic')} className={`p-1.5 rounded ${layout === 'organic' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`} title="Organic"><ShareIcon className="h-4 w-4" /></button>
                                <button onClick={() => setLayout('circle')} className={`p-1.5 rounded ${layout === 'circle' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`} title="Circle"><div className="h-4 w-4 rounded-full border-2 border-current" /></button>
                                <button onClick={() => setLayout('hierarchy')} className={`p-1.5 rounded ${layout === 'hierarchy' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`} title="Hierarchy"><div className="h-4 w-4 flex flex-col justify-between items-center"><div className="w-1 h-1 bg-current rounded"/><div className="w-3 h-px bg-current"/><div className="flex gap-1"><div className="w-1 h-1 bg-current rounded"/><div className="w-1 h-1 bg-current rounded"/></div></div></button>
                            </div>
                            
                            <div className="h-6 w-px bg-gray-300"></div>

                             <div className="flex items-center space-x-2">
                                <span className="text-xs font-semibold text-gray-500 uppercase">Tools:</span>
                                <button 
                                    onClick={() => { setSelectionMode('pathStart'); setPathStart(null); setPathEnd(null); }} 
                                    className={`px-2 py-1 text-xs font-medium rounded border ${selectionMode !== 'normal' ? 'bg-brand-accent text-white border-brand-accent' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                                >
                                    {selectionMode === 'normal' ? 'Find Path' : selectionMode === 'pathStart' ? 'Select Start Node' : 'Select End Node'}
                                </button>
                                {(pathStart && pathEnd) && <button onClick={() => { setPathStart(null); setPathEnd(null); }} className="text-xs text-red-500 hover:underline">Clear Path</button>}
                            </div>
                        </div>
                    )}
                 </div>
            </Card>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Filter Sidebar */}
                {graphData && (
                    <div className="w-48 flex-shrink-0 flex flex-col bg-white border rounded-lg shadow-sm p-4 animate-slide-in-left">
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Filters</h4>
                        <div className="space-y-2 text-sm">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" checked={filters.showPnr} onChange={() => toggleFilter('showPnr')} className="rounded text-brand-primary focus:ring-brand-primary" />
                                <span>PNR Links</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" checked={filters.showContact} onChange={() => toggleFilter('showContact')} className="rounded text-brand-primary focus:ring-brand-primary" />
                                <span>Contact Info</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" checked={filters.showAddress} onChange={() => toggleFilter('showAddress')} className="rounded text-brand-primary focus:ring-brand-primary" />
                                <span>Addresses</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" checked={filters.showFlight} onChange={() => toggleFilter('showFlight')} className="rounded text-brand-primary focus:ring-brand-primary" />
                                <span>Flight Co-Pax</span>
                            </label>
                            <div className="h-px bg-gray-200 my-2"></div>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" checked={filters.showPayment} onChange={() => toggleFilter('showPayment')} className="rounded text-brand-primary focus:ring-brand-primary" />
                                <span className="text-purple-700 font-medium">Payment (FOP)</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" checked={filters.showAgent} onChange={() => toggleFilter('showAgent')} className="rounded text-brand-primary focus:ring-brand-primary" />
                                <span className="text-amber-700 font-medium">Travel Agents</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" checked={filters.showSequence} onChange={() => toggleFilter('showSequence')} className="rounded text-brand-primary focus:ring-brand-primary" />
                                <span className="text-green-700 font-medium">Check-in Seq</span>
                            </label>
                        </div>
                    </div>
                )}

                <Card className="flex-1 !p-0 relative overflow-hidden bg-slate-50 border border-gray-200 shadow-inner">
                    {!filteredData && !isAnalyzing && !isImporting && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                            <div className="text-center">
                                <LinkIcon className="h-16 w-16 mx-auto mb-2 opacity-20" />
                                <p>Enter a seed entity or discover patterns.</p>
                            </div>
                        </div>
                    )}
                    
                    {(isAnalyzing || isImporting) && (
                         <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                            <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mb-3"></div>
                                <p className="text-brand-primary font-semibold">{isImporting ? 'Fusing PNR, APP, and DCS data...' : 'Analysing relationships...'}</p>
                            </div>
                        </div>
                    )}

                    {filteredData && (
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                            <defs>
                                <marker id="arrow" markerWidth="6" markerHeight="6" refX="15" refY="3" orient="auto" markerUnits="strokeWidth">
                                    <path d="M0,0 L0,6 L9,3 z" fill="#cbd5e1" />
                                </marker>
                            </defs>
                            
                            {/* Links */}
                            {filteredData.links.map(link => {
                                const source = filteredData.nodes.find(n => n.id === link.source);
                                const target = filteredData.nodes.find(n => n.id === link.target);
                                if (!source || !target) return null;
                                
                                const isHighlighted = isPathLink(link);
                                let strokeColor = isHighlighted ? '#f59e0b' : '#cbd5e1';
                                let strokeDash = '0';
                                
                                if (link.type === 'SharedPayment') strokeColor = '#d946ef';
                                if (link.type === 'SharedAgent') strokeColor = '#a16207';
                                if (link.type === 'SequentialCheckIn') { strokeColor = '#15803d'; strokeDash = '2,1'; }

                                return (
                                    <g key={link.id}>
                                        <line 
                                            x1={source.x} y1={source.y} 
                                            x2={target.x} y2={target.y} 
                                            stroke={strokeColor} 
                                            strokeWidth={isHighlighted ? "1" : "0.5"} 
                                            strokeDasharray={strokeDash}
                                        />
                                        <text 
                                            x={(source.x + target.x) / 2} 
                                            y={(source.y + target.y) / 2} 
                                            fontSize="2" 
                                            fill={isHighlighted ? '#b45309' : strokeColor} 
                                            fontWeight={isHighlighted ? "bold" : "normal"}
                                            textAnchor="middle"
                                            className="bg-white"
                                        >
                                            {link.label}
                                        </text>
                                    </g>
                                );
                            })}

                            {/* Nodes */}
                            {filteredData.nodes.map(node => {
                                const color = getNodeColor(node);
                                const isSelected = selectedNode?.id === node.id;
                                const isPathNode = node.id === pathStart || node.id === pathEnd;
                                
                                return (
                                    <g 
                                        key={node.id} 
                                        onClick={() => handleNodeClick(node)}
                                        className="cursor-pointer transition-all duration-500 ease-in-out"
                                        style={{ transform: `translate(${node.x}px, ${node.y}px)` }} // Use translate for smooth animation if library supported it, SVG basic here
                                    >
                                        {/* Animation Wrapper - manually moving circle via props */}
                                        <circle 
                                            cx={node.x} cy={node.y} r={isSelected || isPathNode ? "6" : "0"} 
                                            fill="none" stroke={isPathNode ? '#f59e0b' : color} strokeWidth="0.5" opacity="0.5"
                                            className="transition-all duration-300"
                                        />
                                        
                                        <circle cx={node.x} cy={node.y} r="4" fill="white" stroke={color} strokeWidth={isSelected ? "1" : "0.5"} />
                                        
                                        <foreignObject x={node.x - 2.5} y={node.y - 2.5} width="5" height="5">
                                            <div className="flex items-center justify-center w-full h-full text-gray-600">
                                                 <NodeIcon type={node.type} className="w-3 h-3" />
                                            </div>
                                        </foreignObject>

                                        <text x={node.x} y={node.y + 6} fontSize="2.5" textAnchor="middle" fill="#334155" fontWeight="bold">
                                            {node.label}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                    )}
                </Card>

                {/* Property Inspector */}
                {selectedNode && (
                    <div className="w-80 flex-shrink-0 flex flex-col animate-slide-in-right">
                        <Card title="Property Inspector" className="h-full overflow-y-auto">
                            <div className="flex items-center mb-4">
                                <div className="p-3 rounded-full bg-gray-100 mr-3">
                                    <NodeIcon type={selectedNode.type} className="h-6 w-6 text-gray-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-brand-dark">{selectedNode.label}</h3>
                                    <span className="text-xs uppercase tracking-wider text-gray-500">{selectedNode.type}</span>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="p-3 bg-gray-50 rounded border border-gray-200">
                                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">{selectedNode.details}</pre>
                                </div>

                                {selectedNode.riskLevel && (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Risk Status</p>
                                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                            selectedNode.riskLevel === 'Critical' ? 'bg-red-100 text-red-800' :
                                            selectedNode.riskLevel === 'High' ? 'bg-orange-100 text-orange-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                            {selectedNode.riskLevel}
                                        </span>
                                    </div>
                                )}

                                <div className="border-t pt-4 mt-6">
                                    <h4 className="text-sm font-bold text-brand-dark mb-2">Actions</h4>
                                    <div className="space-y-2">
                                        <button className="w-full py-2 px-4 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors text-left flex items-center">
                                            <UsersIcon className="h-4 w-4 mr-2" /> View Full Profile
                                        </button>
                                        <button className="w-full py-2 px-4 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors text-left flex items-center">
                                            <ShareIcon className="h-4 w-4 mr-2" /> Expand Connections
                                        </button>
                                        <button className="w-full py-2 px-4 bg-brand-secondary text-white rounded hover:bg-brand-primary text-sm font-bold transition-colors shadow-sm">
                                            Add to Case
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};
