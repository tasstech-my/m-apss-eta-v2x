
import React, { useState, useMemo } from 'react';
import { Card } from '../components/Card';
import { ChartBarIcon, DocumentTextIcon, AdjustmentsHorizontalIcon, TableCellsIcon, PresentationChartLineIcon } from '../constants';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ReportTemplate, AdHocQuery, QueryFilter, AdHocQueryResult } from '../types';

// --- MOCK DATA ---

// Executive KPI: Real-time Operational Status
const mockOpsStatus = {
    apLatency: 145, // ms
    apStatus: 'Healthy',
    systemLoad: 78, // %
    activeUsers: 124
};

// Executive KPI: Aggregate Threat Level (30-day rolling)
const mockThreatLevelHistory = Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    score: Math.floor(Math.random() * 30) + 50 + (i * 0.5) // Slight upward trend
}));

// Executive KPI: Top 10 Referred Routes
const mockTopRoutes = [
    { route: 'BOG-KUL', referrals: 145 },
    { route: 'DXB-KUL', referrals: 120 },
    { route: 'LHR-KUL', referrals: 98 },
    { route: 'BKK-KUL', referrals: 85 },
    { route: 'SIN-KUL', referrals: 76 },
    { route: 'JFK-DXB-KUL', referrals: 65 },
    { route: 'AMS-KUL', referrals: 54 },
    { route: 'IST-KUL', referrals: 48 },
    { route: 'DOH-KUL', referrals: 42 },
    { route: 'CGK-KUL', referrals: 38 },
];

// Executive KPI: Growth of Overstay Leads
const mockOverstayGrowth = [
    { month: 'Aug', leads: 120 },
    { month: 'Sep', leads: 135 },
    { month: 'Oct', leads: 155 },
    { month: 'Nov', leads: 180 },
];

// 1. Risk Trends (Monthly)
const mockRiskTrendData = [
    { month: 'Jan', Low: 12000, Medium: 4000, High: 800, Critical: 120 },
    { month: 'Feb', Low: 12500, Medium: 3800, High: 850, Critical: 110 },
    { month: 'Mar', Low: 11800, Medium: 4200, High: 900, Critical: 140 },
    { month: 'Apr', Low: 13000, Medium: 3900, High: 750, Critical: 100 },
    { month: 'May', Low: 13500, Medium: 4100, High: 820, Critical: 130 },
    { month: 'Jun', Low: 14200, Medium: 4500, High: 950, Critical: 160 },
    { month: 'Jul', Low: 15000, Medium: 5000, High: 1100, Critical: 180 }, // Peak season
    { month: 'Aug', Low: 14800, Medium: 4900, High: 1050, Critical: 170 },
    { month: 'Sep', Low: 13200, Medium: 4300, High: 880, Critical: 140 },
    { month: 'Oct', Low: 12900, Medium: 4000, High: 840, Critical: 135 },
];

// 2. Top Threat Categories
const mockThreatData = [
    { name: 'Narcotics', value: 450 },
    { name: 'Immigration', value: 1200 },
    { name: 'Security/Terrorism', value: 120 },
    { name: 'Customs/Rev', value: 680 },
    { name: 'Health', value: 80 },
];

// 3. Demographics
const mockDemographicsData = [
    { name: 'Resident', value: 45 },
    { name: 'Tourist', value: 35 },
    { name: 'Business', value: 15 },
    { name: 'Student', value: 5 },
];

// 4. Processing Times (Operational)
const mockProcessingData = [
    { time: '00:00', queue: 5, throughput: 200 },
    { time: '04:00', queue: 2, throughput: 100 },
    { time: '08:00', queue: 25, throughput: 1800 },
    { time: '12:00', queue: 40, throughput: 2200 },
    { time: '16:00', queue: 35, throughput: 1900 },
    { time: '20:00', queue: 15, throughput: 1200 },
];

// 5. Watch List Performance (Standard Report Suite)
const mockWatchlistPerformance = [
    { analyst: 'Analyst A', hits: 45, confirmed: 12, falsePositives: 33 },
    { analyst: 'Analyst B', hits: 38, confirmed: 15, falsePositives: 23 },
    { analyst: 'Analyst C', hits: 52, confirmed: 8, falsePositives: 44 },
    { analyst: 'Analyst D', hits: 20, confirmed: 18, falsePositives: 2 },
];

// 6. Transactional Volumes (Standard Report Suite)
const mockTransactionalData = [
    { type: 'PAXLST (API)', volume: 150000 },
    { type: 'PNRGOV (PNR)', volume: 120000 },
    { type: 'APP (Interactive)', volume: 145000 },
];

const mockReportTemplates: ReportTemplate[] = [
    { id: 'RPT-001', name: 'Monthly National Security Brief', description: 'Executive summary of all critical threats and interceptions.', frequency: 'Monthly', lastGenerated: '2023-10-01', format: 'PDF' },
    { id: 'RPT-002', name: 'Border Operations Performance', description: 'Throughput, wait times, and system uptime statistics.', frequency: 'Weekly', lastGenerated: '2023-10-23', format: 'PDF' },
    { id: 'RPT-003', name: 'High-Risk Traveler Manifest', description: 'Detailed list of all Critical/High risk referrals.', frequency: 'Daily', lastGenerated: '2023-10-27', format: 'CSV' },
    { id: 'RPT-004', name: 'Overstay & Violation Analysis', description: 'Aggregate analysis of immigration violations by nationality.', frequency: 'Monthly', lastGenerated: '2023-10-01', format: 'Excel' },
];

const availableColumns = {
    'Traveler Database': ['PUID', 'Full Name', 'Nationality', 'DOB', 'Passport Number', 'Risk Score', 'Last Entry Date'],
    'Flight Data': ['Flight Number', 'Origin', 'Destination', 'Date', 'Passenger Count', 'Risk Level'],
    'Risk Logs': ['Event ID', 'Timestamp', 'Rule Triggered', 'Analyst', 'Resolution']
};

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#b91c1c']; // Low, Med, High, Crit colors adapted
const DEMO_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316'];

// --- UI COMPONENTS ---

const MetricCard: React.FC<{ title: string, value: string, trend: string, trendUp: boolean }> = ({ title, value, trend, trendUp }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <div className="flex items-baseline mt-2">
            <p className="text-3xl font-bold text-brand-dark">{value}</p>
            <span className={`ml-3 text-sm font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                {trend}
            </span>
        </div>
    </div>
);

const ExecutiveWidget: React.FC<{ title: string; children: React.ReactNode; visible: boolean }> = ({ title, children, visible }) => {
    if (!visible) return null;
    return (
        <Card title={title} className="h-full min-h-[300px]">
            {children}
        </Card>
    );
};

const AdHocQueryBuilder: React.FC = () => {
    const [query, setQuery] = useState<AdHocQuery>({
        source: 'Traveler Database',
        columns: ['PUID', 'Full Name', 'Risk Score'],
        filters: []
    });
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState<AdHocQueryResult[] | null>(null);
    const [newFilter, setNewFilter] = useState<QueryFilter>({ field: '', operator: 'Equals', value: '' });

    const handleAddFilter = () => {
        if (!newFilter.field || !newFilter.value) return;
        setQuery(prev => ({ ...prev, filters: [...prev.filters, newFilter] }));
        setNewFilter({ ...newFilter, value: '' });
    };

    const handleRemoveFilter = (idx: number) => {
        setQuery(prev => ({ ...prev, filters: prev.filters.filter((_, i) => i !== idx) }));
    };

    const handleColumnToggle = (col: string) => {
        setQuery(prev => {
            const exists = prev.columns.includes(col);
            return {
                ...prev,
                columns: exists ? prev.columns.filter(c => c !== col) : [...prev.columns, col]
            };
        });
    };

    const runQuery = () => {
        setIsRunning(true);
        setResults(null);
        
        // Simulate query execution
        setTimeout(() => {
            const mockData: AdHocQueryResult[] = Array.from({ length: 8 }).map((_, i) => {
                const row: AdHocQueryResult = {};
                query.columns.forEach(col => {
                    if (col === 'PUID') row[col] = `PUID-${1000 + i}`;
                    else if (col === 'Full Name') row[col] = `Traveler ${String.fromCharCode(65 + i)}`;
                    else if (col === 'Risk Score') row[col] = Math.floor(Math.random() * 100);
                    else if (col === 'Nationality') row[col] = ['USA', 'GBR', 'MYS', 'CHN'][Math.floor(Math.random() * 4)];
                    else row[col] = 'Data';
                });
                return row;
            });
            setResults(mockData);
            setIsRunning(false);
        }, 1500);
    };

    return (
        <div className="space-y-6">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex justify-between items-center">
                <div>
                    <p className="text-sm font-bold text-green-800">Authorized Access: Senior Manager / Auditor</p>
                    <p className="text-xs text-green-700">You have full read access to the Traveler Database for ad-hoc analysis.</p>
                </div>
                <div className="bg-white px-3 py-1 rounded border border-green-200 text-xs font-mono text-green-800">RBAC: LEVEL 3</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title="Query Configuration">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data Source</label>
                            <select 
                                value={query.source} 
                                onChange={e => setQuery({...query, source: e.target.value as any, columns: []})}
                                className="w-full p-2 border rounded-md bg-white focus:ring-brand-secondary"
                            >
                                <option>Traveler Database</option>
                                <option>Flight Data</option>
                                <option>Risk Logs</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Columns</label>
                            <div className="max-h-40 overflow-y-auto border rounded p-2 bg-gray-50 space-y-1">
                                {availableColumns[query.source].map(col => (
                                    <label key={col} className="flex items-center space-x-2 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={query.columns.includes(col)}
                                            onChange={() => handleColumnToggle(col)}
                                            className="rounded text-brand-primary focus:ring-brand-primary"
                                        />
                                        <span className="text-sm text-gray-700">{col}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>

                <Card title="Filters (Where Clause)">
                    <div className="space-y-4">
                        <div className="flex flex-col gap-2 bg-gray-50 p-3 rounded border">
                            <div className="flex gap-2">
                                <select 
                                    value={newFilter.field} 
                                    onChange={e => setNewFilter({...newFilter, field: e.target.value})}
                                    className="flex-1 p-1 border rounded text-sm"
                                >
                                    <option value="">Select Field</option>
                                    {availableColumns[query.source].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <select 
                                    value={newFilter.operator} 
                                    onChange={e => setNewFilter({...newFilter, operator: e.target.value as any})}
                                    className="w-24 p-1 border rounded text-sm"
                                >
                                    <option>Equals</option><option>Contains</option><option>Greater Than</option><option>Less Than</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={newFilter.value}
                                    onChange={e => setNewFilter({...newFilter, value: e.target.value})}
                                    placeholder="Value..."
                                    className="flex-1 p-1 border rounded text-sm"
                                />
                                <button onClick={handleAddFilter} className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded hover:bg-gray-300">Add</button>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            {query.filters.map((f, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm p-2 bg-white border rounded shadow-sm">
                                    <span><span className="font-semibold">{f.field}</span> {f.operator} <strong>'{f.value}'</strong></span>
                                    <button onClick={() => handleRemoveFilter(idx)} className="text-red-500 hover:text-red-700">×</button>
                                </div>
                            ))}
                            {query.filters.length === 0 && <p className="text-xs text-gray-400 text-center py-2">No filters applied.</p>}
                        </div>
                    </div>
                </Card>

                <Card title="Actions">
                    <div className="flex flex-col gap-3 h-full justify-center">
                        <button 
                            onClick={runQuery}
                            disabled={isRunning || query.columns.length === 0}
                            className="w-full py-3 bg-brand-secondary text-white font-bold rounded-lg hover:bg-brand-primary disabled:bg-gray-300 transition-colors"
                        >
                            {isRunning ? 'Running Query...' : 'Run Query'}
                        </button>
                        <button className="w-full py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50">
                            Save as Template
                        </button>
                    </div>
                </Card>
            </div>

            {results && (
                <Card title="Query Results">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {query.columns.map(col => (
                                        <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {results.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        {query.columns.map(col => (
                                            <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row[col]}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button className="text-sm text-brand-secondary hover:underline flex items-center">
                            <DocumentTextIcon className="h-4 w-4 mr-1" /> Export to CSV
                        </button>
                    </div>
                </Card>
            )}
        </div>
    );
};

export const ReportingDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'executive' | 'standard' | 'risk' | 'ops' | 'demo' | 'ad-hoc'>('executive');
    const [isGenerating, setIsGenerating] = useState<string | null>(null);
    const [isCustomizing, setIsCustomizing] = useState(false);
    
    // Dashboard Customization State
    const [visibleWidgets, setVisibleWidgets] = useState({
        opsStatus: true,
        threatLevel: true,
        topRoutes: true,
        overstayGrowth: true
    });
    
    // Policy Simulator State
    const [visaRestrictLevel, setVisaRestrictLevel] = useState(0); // 0 - 100%
    
    // Simulate impact on metrics based on policy slider
    const simulatedMetrics = useMemo(() => {
        const baseQueue = 25;
        const baseRisk = 125;
        
        // Stricter visa policy = Lower Risk (filtered out) BUT Higher Queue (more processing)
        const queueImpact = Math.floor(baseQueue * (1 + (visaRestrictLevel / 100))); 
        const riskImpact = Math.floor(baseRisk * (1 - (visaRestrictLevel / 200))); // Reduces risk slightly
        
        return { queue: queueImpact, risk: riskImpact };
    }, [visaRestrictLevel]);

    const handleGenerateReport = (id: string) => {
        setIsGenerating(id);
        setTimeout(() => {
            setIsGenerating(null);
            alert(`Report ${id} generated successfully.`);
        }, 2000);
    };

    const toggleWidget = (key: keyof typeof visibleWidgets) => {
        setVisibleWidgets(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="space-y-6">
            <Card className="bg-slate-900 border-l-4 border-brand-secondary text-white">
                <div className="flex items-center">
                    <ChartBarIcon className="h-8 w-8 text-brand-secondary mr-4" />
                    <div>
                        <h2 className="text-2xl font-bold">Executive Reporting & Analytics</h2>
                        <p className="text-slate-400 text-sm mt-1">
                            Strategic, aggregated views of operational performance and border security trends for policy decision-making.
                        </p>
                    </div>
                </div>
            </Card>
            
            {/* Executive Summary Cards (Always visible) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Total Travelers (YTD)" value="14.2M" trend="+12% vs last year" trendUp={true} />
                <MetricCard title="Interception Rate" value="0.45%" trend="+0.05% efficiency" trendUp={true} />
                <MetricCard title="Avg. Wait Time" value="18 min" trend="-2 min improvement" trendUp={true} />
                <MetricCard title="System Uptime" value="99.99%" trend="Stable" trendUp={true} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Analytics Workspace */}
                <div className="lg:col-span-2">
                    <Card>
                        <div className="border-b border-gray-200 mb-6">
                            <nav className="-mb-px flex space-x-8 overflow-x-auto">
                                <button onClick={() => setActiveTab('executive')} className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${activeTab === 'executive' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                                    <PresentationChartLineIcon className="h-4 w-4 mr-2"/> Executive Dashboard
                                </button>
                                <button onClick={() => setActiveTab('standard')} className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'standard' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Standard Report Suite</button>
                                <button onClick={() => setActiveTab('ad-hoc')} className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${activeTab === 'ad-hoc' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                                    <TableCellsIcon className="h-4 w-4 mr-2" /> Ad-Hoc Query Tool
                                </button>
                                <button onClick={() => setActiveTab('risk')} className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'risk' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Risk Trends</button>
                                <button onClick={() => setActiveTab('ops')} className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'ops' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Operational Performance</button>
                                <button onClick={() => setActiveTab('demo')} className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'demo' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Demographics</button>
                            </nav>
                        </div>

                        <div className="min-h-[400px]">
                            {activeTab === 'executive' && (
                                <div className="space-y-6">
                                    <div className="flex justify-end">
                                        <button 
                                            onClick={() => setIsCustomizing(!isCustomizing)} 
                                            className={`flex items-center px-3 py-1.5 text-xs font-bold rounded border transition-colors ${isCustomizing ? 'bg-brand-secondary text-white border-brand-secondary' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                                        >
                                            <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
                                            {isCustomizing ? 'Done Customizing' : 'Customize Dashboard'}
                                        </button>
                                    </div>
                                    
                                    {isCustomizing && (
                                        <div className="bg-gray-100 p-4 rounded-lg border mb-4">
                                            <h4 className="text-sm font-bold text-gray-700 mb-2">Toggle Widgets:</h4>
                                            <div className="flex flex-wrap gap-4">
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input type="checkbox" checked={visibleWidgets.opsStatus} onChange={() => toggleWidget('opsStatus')} className="rounded text-brand-primary focus:ring-brand-primary" />
                                                    <span className="text-sm text-gray-700">Real-time Ops Status</span>
                                                </label>
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input type="checkbox" checked={visibleWidgets.threatLevel} onChange={() => toggleWidget('threatLevel')} className="rounded text-brand-primary focus:ring-brand-primary" />
                                                    <span className="text-sm text-gray-700">Aggregate Threat Level (30d)</span>
                                                </label>
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input type="checkbox" checked={visibleWidgets.topRoutes} onChange={() => toggleWidget('topRoutes')} className="rounded text-brand-primary focus:ring-brand-primary" />
                                                    <span className="text-sm text-gray-700">Top 10 Routes</span>
                                                </label>
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input type="checkbox" checked={visibleWidgets.overstayGrowth} onChange={() => toggleWidget('overstayGrowth')} className="rounded text-brand-primary focus:ring-brand-primary" />
                                                    <span className="text-sm text-gray-700">Overstay Growth</span>
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <ExecutiveWidget title="Real-time Operational Status" visible={visibleWidgets.opsStatus}>
                                            <div className="flex flex-col items-center justify-center h-full space-y-6">
                                                <div className="text-center">
                                                    <p className="text-sm text-gray-500">Application Processor Latency</p>
                                                    <p className={`text-4xl font-bold ${mockOpsStatus.apLatency > 200 ? 'text-red-600' : 'text-green-600'}`}>{mockOpsStatus.apLatency} ms</p>
                                                    <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-800 mt-1">{mockOpsStatus.apStatus}</span>
                                                </div>
                                                <div className="w-full grid grid-cols-2 gap-4 text-center border-t pt-4">
                                                     <div>
                                                        <p className="text-xs text-gray-500">System Load</p>
                                                        <p className="font-semibold text-brand-dark">{mockOpsStatus.systemLoad}%</p>
                                                     </div>
                                                     <div>
                                                        <p className="text-xs text-gray-500">Active Users</p>
                                                        <p className="font-semibold text-brand-dark">{mockOpsStatus.activeUsers}</p>
                                                     </div>
                                                </div>
                                            </div>
                                        </ExecutiveWidget>

                                        <ExecutiveWidget title="Aggregate Threat Level (Rolling 30 Days)" visible={visibleWidgets.threatLevel}>
                                            <ResponsiveContainer width="100%" height={250}>
                                                <AreaChart data={mockThreatLevelHistory}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="day" hide />
                                                    <YAxis domain={['dataMin - 10', 'dataMax + 10']} />
                                                    <Tooltip />
                                                    <Area type="monotone" dataKey="score" stroke="#ef4444" fill="#fee2e2" name="Risk Score" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </ExecutiveWidget>

                                        <ExecutiveWidget title="Strategic Trends: Top 10 Referred Routes" visible={visibleWidgets.topRoutes}>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <BarChart data={mockTopRoutes} layout="vertical" margin={{ left: 20 }}>
                                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                                    <XAxis type="number" />
                                                    <YAxis dataKey="route" type="category" width={80} tick={{fontSize: 11}} />
                                                    <Tooltip />
                                                    <Bar dataKey="referrals" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Referrals" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </ExecutiveWidget>

                                        <ExecutiveWidget title="Growth of Overstay Leads" visible={visibleWidgets.overstayGrowth}>
                                             <ResponsiveContainer width="100%" height={250}>
                                                <LineChart data={mockOverstayGrowth}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="month" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Line type="monotone" dataKey="leads" stroke="#f59e0b" strokeWidth={3} name="Violations" />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </ExecutiveWidget>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'ad-hoc' && <AdHocQueryBuilder />}

                            {activeTab === 'standard' && (
                                <div className="space-y-8">
                                    {/* 1. Transactional Volumes */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex flex-col justify-center">
                                            <div className="mb-4">
                                                <h4 className="text-lg font-bold text-brand-dark flex items-center">
                                                    <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-600" />
                                                    Transactional Volumes
                                                </h4>
                                                <p className="text-sm text-gray-600 mt-1">Breakdown by port, airline, and message type (API/PNR).</p>
                                            </div>
                                            <button 
                                                onClick={() => handleGenerateReport('Transactional Volume Report')}
                                                className="self-start px-4 py-2 bg-brand-secondary text-white rounded hover:bg-brand-primary transition-colors text-sm font-bold"
                                            >
                                                Generate Volume Report
                                            </button>
                                        </div>
                                        <div className="h-[200px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={mockTransactionalData} layout="vertical">
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis type="number" />
                                                    <YAxis dataKey="type" type="category" width={110} tick={{fontSize: 10}} />
                                                    <Tooltip />
                                                    <Bar dataKey="volume" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                    
                                    <div className="border-t border-gray-200"></div>

                                    {/* 2. Executive Summary of Risk */}
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <div>
                                                <h4 className="text-lg font-bold text-brand-dark flex items-center">
                                                    <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2 text-red-600" />
                                                    Executive Summary of Risk Assessment
                                                </h4>
                                                <p className="text-sm text-gray-600 mt-1">Outcome summary: Total alerts, referrals, and 'Do Not Board' directives.</p>
                                            </div>
                                            <button 
                                                onClick={() => handleGenerateReport('Risk Assessment Summary')}
                                                className="px-4 py-2 bg-brand-secondary text-white rounded hover:bg-brand-primary transition-colors text-sm font-bold"
                                            >
                                                Generate Summary
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="bg-gray-100 p-4 rounded text-center">
                                                <p className="text-xs uppercase text-gray-500">Total Alerts</p>
                                                <p className="text-2xl font-bold text-brand-dark">1,420</p>
                                            </div>
                                            <div className="bg-amber-50 p-4 rounded text-center">
                                                <p className="text-xs uppercase text-amber-800">Referrals</p>
                                                <p className="text-2xl font-bold text-amber-600">342</p>
                                            </div>
                                            <div className="bg-red-50 p-4 rounded text-center">
                                                <p className="text-xs uppercase text-red-800">Do Not Board</p>
                                                <p className="text-2xl font-bold text-red-600">18</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200"></div>

                                    {/* 3. Watch List Performance */}
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <div>
                                                <h4 className="text-lg font-bold text-brand-dark flex items-center">
                                                    <DocumentTextIcon className="h-5 w-5 mr-2 text-purple-600" />
                                                    Watch List Performance Metrics
                                                </h4>
                                                <p className="text-sm text-gray-600 mt-1">Hits, false positives, and qualification rates by analyst.</p>
                                            </div>
                                             <button 
                                                onClick={() => handleGenerateReport('Watchlist Performance Audit')}
                                                className="px-4 py-2 bg-brand-secondary text-white rounded hover:bg-brand-primary transition-colors text-sm font-bold"
                                            >
                                                Generate Audit
                                            </button>
                                        </div>
                                        <div className="h-[250px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={mockWatchlistPerformance}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="analyst" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="hits" name="Total Hits" fill="#cbd5e1" />
                                                    <Bar dataKey="confirmed" name="Confirmed (True Pos)" fill="#10b981" />
                                                    <Bar dataKey="falsePositives" name="False Positives" fill="#ef4444" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'risk' && (
                                <div className="h-[400px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={mockRiskTrendData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Area type="monotone" dataKey="Critical" stackId="1" stroke="#b91c1c" fill="#b91c1c" />
                                            <Area type="monotone" dataKey="High" stackId="1" stroke="#ef4444" fill="#ef4444" />
                                            <Area type="monotone" dataKey="Medium" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
                                            <Area type="monotone" dataKey="Low" stackId="1" stroke="#10b981" fill="#10b981" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                            
                            {activeTab === 'ops' && (
                                <div className="h-[400px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={mockProcessingData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="time" />
                                            <YAxis yAxisId="left" label={{ value: 'Avg Queue (min)', angle: -90, position: 'insideLeft' }} />
                                            <YAxis yAxisId="right" orientation="right" label={{ value: 'Throughput (pax/hr)', angle: 90, position: 'insideRight' }} />
                                            <Tooltip />
                                            <Legend />
                                            <Line yAxisId="left" type="monotone" dataKey="queue" stroke="#ef4444" strokeWidth={2} name="Avg Queue Time" />
                                            <Line yAxisId="right" type="monotone" dataKey="throughput" stroke="#3b82f6" strokeWidth={2} name="Throughput" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {activeTab === 'demo' && (
                                <div className="flex h-[400px]">
                                    <div className="w-1/2 h-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={mockDemographicsData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                                    {mockDemographicsData.map((entry, index) => <Cell key={`cell-${index}`} fill={DEMO_COLORS[index % DEMO_COLORS.length]} />)}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="w-1/2 h-full pl-4 border-l">
                                        <h4 className="text-center font-bold text-gray-500 mb-4">Risk by Category</h4>
                                        <ResponsiveContainer width="100%" height="90%">
                                            <BarChart data={mockThreatData} layout="vertical">
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis type="number" />
                                                <YAxis dataKey="name" type="category" width={100} />
                                                <Tooltip />
                                                <Bar dataKey="value" fill="#ef4444" name="Incidents" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right Column: Tools */}
                <div className="space-y-6">
                    {/* Report Generator */}
                    <Card title="Custom Report Builder">
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                            {mockReportTemplates.map(report => (
                                <div key={report.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-sm text-brand-dark">{report.name}</h4>
                                        <span className="text-[10px] bg-gray-200 px-1.5 py-0.5 rounded text-gray-600">{report.frequency}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-3">{report.description}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-gray-400">Last: {report.lastGenerated}</span>
                                        <button 
                                            onClick={() => handleGenerateReport(report.id)}
                                            disabled={isGenerating === report.id}
                                            className="text-xs bg-brand-secondary text-white px-2 py-1 rounded hover:bg-brand-primary disabled:bg-blue-300 transition-colors flex items-center"
                                        >
                                            {isGenerating === report.id ? 'Generating...' : `Generate ${report.format}`}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Policy Simulator */}
                    <Card title="Policy Impact Simulator" className="bg-indigo-50 border border-indigo-200">
                        <div className="flex items-center mb-4 text-indigo-800">
                            <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                            <p className="text-sm font-bold">Scenario: Visa Restriction Level</p>
                        </div>
                        
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={visaRestrictLevel} 
                            onChange={(e) => setVisaRestrictLevel(parseInt(e.target.value))} 
                            className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-indigo-600 mt-1 mb-4">
                            <span>Standard</span>
                            <span>Strict (+{visaRestrictLevel}%)</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="p-2 bg-white rounded shadow-sm">
                                <p className="text-xs text-gray-500">Projected Wait Time</p>
                                <p className={`font-bold text-lg ${simulatedMetrics.queue > 35 ? 'text-red-600' : 'text-brand-dark'}`}>
                                    {simulatedMetrics.queue} min
                                </p>
                            </div>
                            <div className="p-2 bg-white rounded shadow-sm">
                                <p className="text-xs text-gray-500">Projected Risk Vol.</p>
                                <p className="font-bold text-lg text-brand-dark">
                                    {simulatedMetrics.risk} / day
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
