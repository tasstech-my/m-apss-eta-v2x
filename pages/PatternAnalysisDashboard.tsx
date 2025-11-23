
import React, { useState, useMemo } from 'react';
import { Card } from '../components/Card';
import { PresentationChartLineIcon, MapIcon, CpuChipIcon, BeakerIcon, GlobeAltIcon, TagIcon, ClockIcon, FunnelIcon } from '../constants';
import { ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Cell, AreaChart } from 'recharts';
import type { PatternTrend, AnomalyReport, RouteRiskMetric, ProfileRule } from '../types';

// --- MOCK DATA ---
const mockTrendData: PatternTrend[] = [
    { period: 'Jan', totalVolume: 45000, riskVolume: 210, anomalyScore: 10 },
    { period: 'Feb', totalVolume: 42000, riskVolume: 195, anomalyScore: 12 },
    { period: 'Mar', totalVolume: 48000, riskVolume: 220, anomalyScore: 11 },
    { period: 'Apr', totalVolume: 51000, riskVolume: 350, anomalyScore: 45 }, // Spike
    { period: 'May', totalVolume: 49000, riskVolume: 280, anomalyScore: 25 },
    { period: 'Jun', totalVolume: 53000, riskVolume: 240, anomalyScore: 15 },
    { period: 'Jul', totalVolume: 58000, riskVolume: 260, anomalyScore: 18 },
    { period: 'Aug', totalVolume: 61000, riskVolume: 290, anomalyScore: 20 },
    { period: 'Sep', totalVolume: 55000, riskVolume: 255, anomalyScore: 15 },
    { period: 'Oct', totalVolume: 59000, riskVolume: 410, anomalyScore: 65 }, // Major Spike
];

const mockGeoTrendData = [
    { period: 'Jan', 'BOG-KUL': 120, 'DXB-KUL': 80, 'LHR-KUL': 40, 'BKK-KUL': 150 },
    { period: 'Feb', 'BOG-KUL': 130, 'DXB-KUL': 85, 'LHR-KUL': 45, 'BKK-KUL': 140 },
    { period: 'Mar', 'BOG-KUL': 125, 'DXB-KUL': 90, 'LHR-KUL': 42, 'BKK-KUL': 160 },
    { period: 'Apr', 'BOG-KUL': 180, 'DXB-KUL': 95, 'LHR-KUL': 50, 'BKK-KUL': 155 }, // Spike in BOG
    { period: 'May', 'BOG-KUL': 210, 'DXB-KUL': 100, 'LHR-KUL': 48, 'BKK-KUL': 150 },
    { period: 'Jun', 'BOG-KUL': 190, 'DXB-KUL': 110, 'LHR-KUL': 55, 'BKK-KUL': 145 },
    { period: 'Jul', 'BOG-KUL': 195, 'DXB-KUL': 115, 'LHR-KUL': 60, 'BKK-KUL': 150 },
    { period: 'Aug', 'BOG-KUL': 200, 'DXB-KUL': 120, 'LHR-KUL': 58, 'BKK-KUL': 155 },
    { period: 'Sep', 'BOG-KUL': 185, 'DXB-KUL': 110, 'LHR-KUL': 55, 'BKK-KUL': 150 },
    { period: 'Oct', 'BOG-KUL': 230, 'DXB-KUL': 125, 'LHR-KUL': 62, 'BKK-KUL': 160 },
];

const mockCategoryTrendData = [
    { period: 'Jan', 'Narcotics': 45, 'Immigration': 120, 'Security': 15, 'Customs': 30 },
    { period: 'Feb', 'Narcotics': 50, 'Immigration': 110, 'Security': 12, 'Customs': 25 },
    { period: 'Mar', 'Narcotics': 48, 'Immigration': 130, 'Security': 18, 'Customs': 35 },
    { period: 'Apr', 'Narcotics': 85, 'Immigration': 125, 'Security': 20, 'Customs': 40 }, // Spike in Narcotics
    { period: 'May', 'Narcotics': 95, 'Immigration': 115, 'Security': 22, 'Customs': 38 },
    { period: 'Jun', 'Narcotics': 90, 'Immigration': 110, 'Security': 15, 'Customs': 25 },
    { period: 'Jul', 'Narcotics': 88, 'Immigration': 120, 'Security': 18, 'Customs': 30 },
    { period: 'Aug', 'Narcotics': 92, 'Immigration': 125, 'Security': 20, 'Customs': 42 },
    { period: 'Sep', 'Narcotics': 85, 'Immigration': 115, 'Security': 16, 'Customs': 38 },
    { period: 'Oct', 'Narcotics': 110, 'Immigration': 130, 'Security': 25, 'Customs': 45 },
];

interface ExtendedAnomalyReport extends AnomalyReport {
    type: 'VolumeSpike' | 'PaymentShift' | 'DemographicShift' | 'ItineraryComplexity';
    chartData?: any[];
}

const mockAnomalies: ExtendedAnomalyReport[] = [
    { 
        id: 'ANM-001', 
        title: 'Significant Shift in Payment Methods (Route BOG-KUL)', 
        description: 'Sudden 45% increase in "Cash" payments for one-way tickets, deviating from the 12-month historical baseline.', 
        detectedDate: '2023-10-15', 
        severity: 'High', 
        affectedRoute: 'BOG-KUL', 
        confidence: 92,
        type: 'PaymentShift',
        chartData: [
            { name: 'Credit Card', Baseline: 65, Current: 40 },
            { name: 'Debit Card', Baseline: 25, Current: 20 },
            { name: 'Cash', Baseline: 5, Current: 35 }, // The anomaly
            { name: 'Voucher', Baseline: 5, Current: 5 },
        ]
    },
    { 
        id: 'ANM-002', 
        title: 'Itinerary Complexity Deviation (Route LHR-KUL)', 
        description: 'Machine learning model detected a cluster of PNRs with unusually high segment counts (>3 stops) compared to the standard direct/1-stop norm.', 
        detectedDate: '2023-10-10', 
        severity: 'Medium', 
        confidence: 85,
        affectedRoute: 'LHR-KUL',
        type: 'ItineraryComplexity',
        chartData: [
            { name: 'Direct', Baseline: 60, Current: 55 },
            { name: '1 Stop', Baseline: 30, Current: 25 },
            { name: '2 Stops', Baseline: 8, Current: 10 },
            { name: '3+ Stops', Baseline: 2, Current: 10 }, // The anomaly
        ]
    },
    { 
        id: 'ANM-003', 
        title: 'Demographic Anomaly (Age Group 18-25)', 
        description: 'Statistical outlier: 200% spike in travelers aged 18-25 from Region Y with no prior travel history.', 
        detectedDate: '2023-09-28', 
        severity: 'High', 
        confidence: 78,
        type: 'DemographicShift',
        chartData: [
            { name: '0-17', Baseline: 15, Current: 14 },
            { name: '18-25', Baseline: 10, Current: 35 }, // The anomaly
            { name: '26-40', Baseline: 40, Current: 25 },
            { name: '41-60', Baseline: 25, Current: 15 },
            { name: '60+', Baseline: 10, Current: 11 },
        ]
    },
];

const mockRouteRisks: RouteRiskMetric[] = [
    { route: 'BOG -> KUL', avgRiskScore: 78, volume: 1200, trend: 'Increasing' },
    { route: 'LOS -> DXB -> KUL', avgRiskScore: 72, volume: 850, trend: 'Stable' },
    { route: 'BKK -> KUL', avgRiskScore: 45, volume: 15400, trend: 'Decreasing' },
    { route: 'LHR -> KUL', avgRiskScore: 12, volume: 18900, trend: 'Stable' },
];

const mockDemographics = [
    { nationality: 'MYS', count: 15000 },
    { nationality: 'CHN', count: 8000 },
    { nationality: 'IND', count: 6500 },
    { nationality: 'IDN', count: 5200 },
    { nationality: 'SGP', count: 4800 },
    { nationality: 'GBR', count: 3100 },
    { nationality: 'AUS', count: 2900 },
];

const PromoteToProfileModal: React.FC<{ anomaly: ExtendedAnomalyReport; onClose: () => void; onConfirm: () => void }> = ({ anomaly, onClose, onConfirm }) => {
    const [profileName, setProfileName] = useState(`Anomaly: ${anomaly.title}`);
    
    const suggestedRules: ProfileRule[] = useMemo(() => {
        const rules: ProfileRule[] = [];
        if (anomaly.affectedRoute) {
            const [origin] = anomaly.affectedRoute.split('-');
            rules.push({ field: 'Origin Airport', operator: 'Equals', value: origin });
        }
        
        if (anomaly.type === 'PaymentShift') {
            rules.push({ field: 'Payment Method', operator: 'Equals', value: 'Cash' });
        } else if (anomaly.type === 'ItineraryComplexity') {
            rules.push({ field: 'Flight Segments', operator: 'Greater Than', value: '3' });
        } else if (anomaly.type === 'DemographicShift') {
            rules.push({ field: 'Age', operator: 'Less Than', value: '25' });
            rules.push({ field: 'Passenger History', operator: 'Equals', value: 'New' });
        }
        return rules;
    }, [anomaly]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
            <Card title="Profile Augmentation: Promote Anomaly to Rule" className="w-full max-w-lg animate-scale-in">
                <div className="space-y-4">
                    <div className="bg-indigo-50 border-l-4 border-indigo-500 p-3 text-sm text-indigo-800">
                        <p><strong>Intelligence Feed:</strong> This workflow converts the detected historical anomaly into a real-time automated risk rule.</p>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">New Profile Name</label>
                        <input 
                            type="text" 
                            value={profileName} 
                            onChange={(e) => setProfileName(e.target.value)} 
                            className="w-full p-2 border border-gray-300 rounded-md mt-1 focus:ring-brand-secondary"
                        />
                    </div>

                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Suggested Rules (Auto-Generated)</p>
                        <div className="bg-gray-50 p-3 rounded-md border space-y-2">
                            {suggestedRules.map((rule, idx) => (
                                <div key={idx} className="flex items-center text-sm">
                                    {idx > 0 && <span className="text-xs font-bold text-gray-400 bg-white border px-1 rounded mr-2">AND</span>}
                                    <span className="font-semibold bg-gray-200 px-1 rounded text-gray-700">{rule.field}</span>
                                    <span className="mx-1 text-gray-500">{rule.operator.toLowerCase()}</span>
                                    <span className="font-bold text-brand-primary">"{rule.value}"</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                         <label className="block text-sm font-medium text-gray-700">Target Module</label>
                         <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded">Standard Profiler</span>
                    </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-primary flex items-center">
                        <FunnelIcon className="h-5 w-5 mr-2" />
                        Create Profile & Activate
                    </button>
                </div>
            </Card>
        </div>
    );
};


export const PatternAnalysisDashboard: React.FC = () => {
    const [timeRange, setTimeRange] = useState('YTD');
    const [kpis] = useState({ totalTravelers: '521,000', anomaliesDetected: 12, emergingTrends: 3 });
    const [selectedAlgorithm, setSelectedAlgorithm] = useState('Isolation Forest (ML)');
    const [analysisStatus, setAnalysisStatus] = useState<'Idle' | 'Running' | 'Completed'>('Idle');
    const [selectedAnomaly, setSelectedAnomaly] = useState<ExtendedAnomalyReport | null>(null);
    const [trendViewMode, setTrendViewMode] = useState<'Temporal' | 'Geographical' | 'Categorical'>('Temporal');
    const [isPromoting, setIsPromoting] = useState(false);

    const handleRunAnalysis = () => {
        setAnalysisStatus('Running');
        setSelectedAnomaly(null);
        setTimeout(() => {
            setAnalysisStatus('Completed');
        }, 2000);
    };
    
    const handlePromoteConfirm = () => {
        setIsPromoting(false);
        alert("Success: New Risk Profile created in Standard Profiler based on this anomaly.");
        // In a real app, this would POST to the Profiler API
    };

    return (
        <div className="space-y-6">
             {isPromoting && selectedAnomaly && (
                <PromoteToProfileModal 
                    anomaly={selectedAnomaly} 
                    onClose={() => setIsPromoting(false)} 
                    onConfirm={handlePromoteConfirm} 
                />
            )}
            
            <Card className="bg-indigo-900 border-l-4 border-purple-400 text-white">
                <div className="flex items-center">
                    <PresentationChartLineIcon className="h-8 w-8 text-purple-300 mr-4" />
                    <div>
                        <h2 className="text-2xl font-bold">Post-Travel Intelligence: Pattern Analysis</h2>
                        <p className="text-indigo-200 text-sm mt-1">
                            Specialized analytical tool for uncovering non-obvious trends, long-term anomalies, and emerging threats in aggregated traveler data.
                        </p>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="p-4 bg-white rounded-lg shadow-sm border-t-4 border-indigo-500">
                    <p className="text-sm text-gray-500 uppercase">Travelers Analyzed ({timeRange})</p>
                    <p className="text-3xl font-bold text-brand-dark">{kpis.totalTravelers}</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm border-t-4 border-red-500">
                    <p className="text-sm text-gray-500 uppercase">Anomalies Detected</p>
                    <p className="text-3xl font-bold text-red-600">{kpis.anomaliesDetected}</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm border-t-4 border-purple-500">
                    <p className="text-sm text-gray-500 uppercase">Emerging Trends</p>
                    <p className="text-3xl font-bold text-purple-600">{kpis.emergingTrends}</p>
                </div>
            </div>
            
            {/* Anomaly Detection Engine Control */}
            <Card title="Anomaly Detection Engine">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1 w-full">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Detection Algorithm</label>
                                <select 
                                    value={selectedAlgorithm} 
                                    onChange={(e) => setSelectedAlgorithm(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-brand-secondary focus:border-brand-secondary"
                                >
                                    <option>Statistical Z-Score (Standard)</option>
                                    <option>Isolation Forest (ML)</option>
                                    <option>DBSCAN Clustering</option>
                                    <option>LSTM Autoencoder (Deep Learning)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Target Dimension</label>
                                <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-brand-secondary focus:border-brand-secondary">
                                    <option>All Dimensions</option>
                                    <option>Traveler Demographics</option>
                                    <option>Route & Itinerary</option>
                                    <option>Payment Methods</option>
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reference Period</label>
                                <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-brand-secondary focus:border-brand-secondary">
                                    <option>Last 12 Months (Rolling)</option>
                                    <option>Pre-Pandemic Baseline</option>
                                    <option>Custom Range</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={handleRunAnalysis}
                        disabled={analysisStatus === 'Running'}
                        className={`px-6 py-3 rounded-lg font-bold text-white shadow-md transition-all flex items-center ${
                            analysisStatus === 'Running' ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'
                        }`}
                    >
                        {analysisStatus === 'Running' ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Processing...
                            </>
                        ) : (
                            <>
                                <CpuChipIcon className="h-5 w-5 mr-2" />
                                Run Anomaly Detection
                            </>
                        )}
                    </button>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                     <Card title="Detected Anomalies Feed">
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                            {mockAnomalies.map(anm => (
                                <div 
                                    key={anm.id} 
                                    onClick={() => setSelectedAnomaly(anm)}
                                    className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedAnomaly?.id === anm.id ? 'ring-2 ring-indigo-500 bg-indigo-50' : 'bg-gray-50 hover:bg-white hover:shadow-md'}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${anm.severity === 'High' ? 'bg-red-100 text-red-800' : anm.severity === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {anm.severity}
                                        </span>
                                        <span className="text-xs text-gray-400">{anm.detectedDate}</span>
                                    </div>
                                    <h4 className="font-bold text-sm text-brand-dark mb-1 leading-tight">{anm.title}</h4>
                                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{anm.description}</p>
                                    <div className="flex justify-between items-center text-xs border-t border-gray-200 pt-2 mt-2">
                                        <span className="font-semibold text-indigo-600">Confidence: {anm.confidence}%</span>
                                        {anm.affectedRoute && <span className="bg-gray-200 px-1.5 rounded font-mono">{anm.affectedRoute}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    {selectedAnomaly ? (
                        <Card title={
                            <div className="flex justify-between items-center">
                                <span>Deviation Analysis: {selectedAnomaly.type.replace(/([A-Z])/g, ' $1').trim()}</span>
                                <button 
                                    onClick={() => setIsPromoting(true)}
                                    className="text-sm bg-brand-secondary text-white px-3 py-1.5 rounded-md hover:bg-brand-primary flex items-center shadow-sm"
                                >
                                    <FunnelIcon className="h-4 w-4 mr-2" /> Promote to Profiler
                                </button>
                            </div>
                        }>
                             <div className="mb-4 bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                                <p className="text-sm text-blue-900"><strong>Analysis:</strong> {selectedAnomaly.description}</p>
                             </div>
                             <div className="h-[350px]">
                                <h4 className="text-center font-semibold text-gray-500 mb-2 text-sm">Historical Baseline vs. Current Activity</h4>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={selectedAnomaly.chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="Baseline" fill="#9ca3af" name="Historical Baseline" />
                                        <Bar dataKey="Current" fill="#ef4444" name="Current Period" />
                                    </BarChart>
                                </ResponsiveContainer>
                             </div>
                        </Card>
                    ) : (
                        <Card title="Advanced Trend Visualization">
                            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b pb-4">
                                <div className="flex space-x-2 mb-4 sm:mb-0">
                                    <button 
                                        onClick={() => setTrendViewMode('Temporal')}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center ${trendViewMode === 'Temporal' ? 'bg-brand-secondary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        <ClockIcon className="h-4 w-4 mr-1" /> Temporal (Volume)
                                    </button>
                                    <button 
                                        onClick={() => setTrendViewMode('Geographical')}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center ${trendViewMode === 'Geographical' ? 'bg-brand-secondary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        <GlobeAltIcon className="h-4 w-4 mr-1" /> Geographical (Routes)
                                    </button>
                                    <button 
                                        onClick={() => setTrendViewMode('Categorical')}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center ${trendViewMode === 'Categorical' ? 'bg-brand-secondary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        <TagIcon className="h-4 w-4 mr-1" /> Categorical (Threats)
                                    </button>
                                </div>
                                <select value={timeRange} onChange={e => setTimeRange(e.target.value)} className="p-1 border rounded text-sm">
                                    <option value="30D">Last 30 Days</option>
                                    <option value="Q3">Q3 2023</option>
                                    <option value="YTD">Year to Date</option>
                                </select>
                            </div>
                            
                            <div className="h-[350px]">
                                {trendViewMode === 'Temporal' && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={mockTrendData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="period" />
                                            <YAxis yAxisId="left" label={{ value: 'Total Volume', angle: -90, position: 'insideLeft' }} />
                                            <YAxis yAxisId="right" orientation="right" label={{ value: 'Risk Volume', angle: 90, position: 'insideRight' }} />
                                            <Tooltip />
                                            <Legend />
                                            <Area yAxisId="left" type="monotone" dataKey="totalVolume" fill="#e0e7ff" stroke="#6366f1" name="Total Volume" />
                                            <Bar yAxisId="right" dataKey="riskVolume" barSize={20} fill="#ef4444" name="Risk Volume" />
                                            <Line yAxisId="right" type="monotone" dataKey="anomalyScore" stroke="#f59e0b" strokeWidth={2} dot={true} name="Anomaly Score" />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                )}
                                {trendViewMode === 'Geographical' && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={mockGeoTrendData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="period" />
                                            <YAxis label={{ value: 'Risk Volume', angle: -90, position: 'insideLeft' }} />
                                            <Tooltip />
                                            <Legend />
                                            <Area type="monotone" dataKey="BOG-KUL" stackId="1" stroke="#ef4444" fill="#ef4444" name="BOG -> KUL" />
                                            <Area type="monotone" dataKey="DXB-KUL" stackId="1" stroke="#f97316" fill="#f97316" name="DXB -> KUL" />
                                            <Area type="monotone" dataKey="LHR-KUL" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="LHR -> KUL" />
                                            <Area type="monotone" dataKey="BKK-KUL" stackId="1" stroke="#10b981" fill="#10b981" name="BKK -> KUL" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                                {trendViewMode === 'Categorical' && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={mockCategoryTrendData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="period" />
                                            <YAxis label={{ value: 'Incidents', angle: -90, position: 'insideLeft' }} />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="Narcotics" stackId="a" fill="#ef4444" />
                                            <Bar dataKey="Immigration" stackId="a" fill="#3b82f6" />
                                            <Bar dataKey="Security" stackId="a" fill="#f59e0b" />
                                            <Bar dataKey="Customs" stackId="a" fill="#10b981" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </Card>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Top High-Risk Routes (Historical Aggregation)">
                     <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Avg. Risk Score</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Volume</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trend</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {mockRouteRisks.map((route, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 whitespace-nowrap flex items-center">
                                            <MapIcon className="h-4 w-4 text-gray-400 mr-2" />
                                            <span className="font-bold text-sm text-gray-800">{route.route}</span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`font-bold ${route.avgRiskScore > 70 ? 'text-red-600' : route.avgRiskScore > 40 ? 'text-amber-600' : 'text-green-600'}`}>
                                                {route.avgRiskScore}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{route.volume.toLocaleString()}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs">
                                            <span className={`px-2 py-1 rounded-full ${route.trend === 'Increasing' ? 'bg-red-100 text-red-800' : route.trend === 'Decreasing' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {route.trend}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <Card title="Demographic Composition (Top Nationalities)">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={mockDemographics} layout="vertical" margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="nationality" type="category" />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#3b82f6" name="Traveler Count" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );
};
