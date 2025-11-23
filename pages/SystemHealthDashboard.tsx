
import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { ServerIcon, DatabaseIcon, GlobeAltIcon, CpuChipIcon, ShareIcon } from '../constants';
import type { SystemHealthMetric } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

// --- MOCK DATA ---
const initialMetrics: SystemHealthMetric[] = [
    { id: 'core-1', component: 'Application Processor', type: 'Microservice', status: 'Healthy', uptime: 99.99, latency: 45, lastCheck: 'Just now' },
    { id: 'core-2', component: 'Risk Broker', type: 'Microservice', status: 'Healthy', uptime: 99.95, latency: 120, lastCheck: 'Just now' },
    { id: 'core-3', component: 'Data Acquisition (DAS)', type: 'Microservice', status: 'Healthy', uptime: 99.98, latency: 65, lastCheck: 'Just now' },
    { id: 'core-4', component: 'Identity Resolution Engine', type: 'Microservice', status: 'Healthy', uptime: 99.90, latency: 200, lastCheck: 'Just now' },
    { id: 'core-5', component: 'Profiler Engine', type: 'Microservice', status: 'Healthy', uptime: 99.92, latency: 150, lastCheck: 'Just now' },
    { id: 'ingest-1', component: 'API Gateway (Ingestion)', type: 'Microservice', status: 'Healthy', uptime: 99.99, latency: 30, lastCheck: 'Just now' },
    { id: 'ingest-2', component: 'PNR Gateway (Ingestion)', type: 'Microservice', status: 'Healthy', uptime: 99.95, latency: 40, lastCheck: 'Just now' },
    { id: 'db-1', component: 'Traveler Database (Primary)', type: 'Database', status: 'Healthy', uptime: 100, latency: 12, lastCheck: 'Just now' },
    { id: 'db-2', component: 'Watchlist Database (Replica)', type: 'Database', status: 'Degraded', uptime: 98.50, latency: 450, lastCheck: '1 min ago' },
    { id: 'db-3', component: 'Audit Logs Storage (WORM)', type: 'Database', status: 'Healthy', uptime: 100, latency: 25, lastCheck: 'Just now' },
    { id: 'ext-1', component: 'GovLink: Interpol', type: 'External Link', status: 'Healthy', uptime: 99.00, latency: 210, lastCheck: '2 mins ago' },
    { id: 'ext-2', component: 'GovLink: National Visa', type: 'External Link', status: 'Healthy', uptime: 99.20, latency: 180, lastCheck: 'Just now' },
    { id: 'ext-3', component: 'e-Gate Interface API', type: 'Microservice', status: 'Healthy', uptime: 99.99, latency: 35, lastCheck: 'Just now' },
];

const resourceData = [
    { name: 'Web Nodes', cpu: 45, memory: 60, disk: 30 },
    { name: 'App Logic', cpu: 65, memory: 70, disk: 45 },
    { name: 'Risk Engine', cpu: 82, memory: 55, disk: 20 },
    { name: 'DB Cluster', cpu: 40, memory: 85, disk: 75 },
    { name: 'Analytics', cpu: 30, memory: 40, disk: 90 },
    { name: 'Audit Store', cpu: 20, memory: 30, disk: 85 },
];

const latencyPerformanceData = [
    { time: '10:00', avg: 45, p95: 120, p99: 250 },
    { time: '10:05', avg: 48, p95: 130, p99: 260 },
    { time: '10:10', avg: 52, p95: 145, p99: 280 },
    { time: '10:15', avg: 49, p95: 135, p99: 270 },
    { time: '10:20', avg: 120, p95: 350, p99: 800 }, // Spike
    { time: '10:25', avg: 60, p95: 180, p99: 400 },
    { time: '10:30', avg: 45, p95: 125, p99: 255 },
    { time: '10:35', avg: 42, p95: 115, p99: 240 },
    { time: '10:40', avg: 47, p95: 130, p99: 265 },
    { time: '10:45', avg: 50, p95: 140, p99: 275 },
    { time: '10:50', avg: 48, p95: 132, p99: 268 },
    { time: '10:55', avg: 46, p95: 128, p99: 260 },
];

const queueDepthData = [
    { name: 'Event Manager', depth: 145, threshold: 1000 },
    { name: 'Risk Broker', depth: 52, threshold: 500 },
    { name: 'Notification Svc', depth: 12, threshold: 200 },
    { name: 'Audit Logger', depth: 850, threshold: 5000 },
    { name: 'AP Processing', depth: 23, threshold: 100 },
];

const adaptorHealthData = [
    { name: 'Visa Adaptor', status: 'Online', uptime: 99.95, errorRate: 0.02, latency: 180 },
    { name: 'INTERPOL Adaptor', status: 'Online', uptime: 99.10, errorRate: 0.15, latency: 450 },
    { name: 'DCS Gateway', status: 'Online', uptime: 99.99, errorRate: 0.01, latency: 120 },
    { name: 'Watchlist Manager', status: 'Online', uptime: 100.00, errorRate: 0.00, latency: 15 },
    { name: 'Ext. Rules Engine', status: 'Degraded', uptime: 95.50, errorRate: 2.40, latency: 1200 },
];

const StatusBadge: React.FC<{ status: SystemHealthMetric['status'] | string }> = ({ status }) => {
    const colors: Record<string, string> = {
        Healthy: 'bg-green-100 text-green-800',
        Online: 'bg-green-100 text-green-800',
        Degraded: 'bg-amber-100 text-amber-800',
        Down: 'bg-red-100 text-red-800',
        Offline: 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 py-1 text-xs font-bold rounded-full ${colors[status] || 'bg-gray-100'}`}>{status}</span>;
};

export const SystemHealthDashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<SystemHealthMetric[]>(initialMetrics);

    // Simulate live updates
    useEffect(() => {
        const interval = setInterval(() => {
            setMetrics(prev => prev.map(m => ({
                ...m,
                latency: Math.max(10, m.latency + (Math.random() * 20 - 10)), // Fluctuate latency
                status: m.id === 'db-2' && Math.random() > 0.8 ? 'Healthy' : m.id === 'db-2' ? 'Degraded' : 'Healthy' // Occasionally fix/break the DB replica
            })));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const healthyCount = metrics.filter(m => m.status === 'Healthy').length;
    const totalCount = metrics.length;
    const healthScore = Math.round((healthyCount / totalCount) * 100);

    return (
        <div className="space-y-6">
            <Card className="bg-slate-900 text-white border-l-4 border-brand-secondary">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <ServerIcon className="h-8 w-8 text-brand-secondary mr-4" />
                        <div>
                            <h2 className="text-2xl font-bold">System Health & KPI Dashboard</h2>
                            <p className="text-slate-400 text-sm mt-1">
                                Real-time monitoring of critical infrastructure, latency, queues, and external adaptors.
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                         <p className="text-xs text-gray-400 uppercase">System Health Score</p>
                         <p className={`text-3xl font-bold ${healthScore === 100 ? 'text-green-400' : healthScore > 90 ? 'text-amber-400' : 'text-red-400'}`}>{healthScore}%</p>
                    </div>
                </div>
            </Card>

            {/* Row 1: Latency & Queues */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title="Application Processor Latency (P95/P99)" className="lg:col-span-2">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={latencyPerformanceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis label={{ value: 'ms', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="p99" name="P99 (Outliers)" stroke="#b91c1c" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="p95" name="P95 (High Load)" stroke="#f59e0b" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="avg" name="Average" stroke="#10b981" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>

                <Card title="Event Manager Queue Depth">
                    <div className="space-y-4">
                        {queueDepthData.map(q => {
                            const percentage = Math.min(100, (q.depth / q.threshold) * 100);
                            let color = 'bg-green-500';
                            if (percentage > 80) color = 'bg-red-500';
                            else if (percentage > 50) color = 'bg-amber-500';

                            return (
                                <div key={q.name}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-gray-700">{q.name}</span>
                                        <span className="text-gray-500 font-mono">{q.depth.toLocaleString()} / {q.threshold.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className={`h-2 rounded-full ${color}`} style={{ width: `${percentage}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-4 pt-4 border-t text-center">
                        <p className="text-xs text-gray-500">Monitor for backlogs in real-time processing.</p>
                    </div>
                </Card>
            </div>

            {/* Row 2: Adaptors & Resources */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <Card title="External Adaptor Performance">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Adaptor</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Avail %</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Err Rate</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Lat.</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {adaptorHealthData.map((adp, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 flex items-center">
                                            <ShareIcon className="h-4 w-4 text-gray-400 mr-2" />
                                            {adp.name}
                                        </td>
                                        <td className="px-4 py-3 text-xs"><StatusBadge status={adp.status} /></td>
                                        <td className="px-4 py-3 text-sm font-mono text-gray-600">{adp.uptime.toFixed(2)}%</td>
                                        <td className={`px-4 py-3 text-sm font-bold ${adp.errorRate > 1 ? 'text-red-600' : 'text-green-600'}`}>{adp.errorRate.toFixed(2)}%</td>
                                        <td className="px-4 py-3 text-xs text-gray-500">{adp.latency}ms</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <Card title="Server Resource Utilization (Core Nodes)" className="lg:col-span-2">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={resourceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis unit="%" />
                            <Tooltip cursor={{fill: '#f3f4f6'}} />
                            <Legend />
                            <Bar dataKey="cpu" name="CPU" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="memory" name="Memory" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="disk" name="Disk I/O" fill="#f97316" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            {/* Row 3: Detailed Matrix */}
            <div className="grid grid-cols-1 gap-6">
                <Card title="Core Component Matrix">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 border rounded-lg bg-green-50 border-green-200 flex items-center justify-between">
                            <div className="flex items-center">
                                <CpuChipIcon className="h-8 w-8 text-green-600 mr-3" />
                                <div>
                                    <p className="font-bold text-green-900">Microservices</p>
                                    <p className="text-xs text-green-700">8/8 Healthy</p>
                                </div>
                            </div>
                            <span className="text-2xl font-bold text-green-700">100%</span>
                        </div>
                        <div className="p-4 border rounded-lg bg-amber-50 border-amber-200 flex items-center justify-between">
                            <div className="flex items-center">
                                <DatabaseIcon className="h-8 w-8 text-amber-600 mr-3" />
                                <div>
                                    <p className="font-bold text-amber-900">Databases</p>
                                    <p className="text-xs text-amber-700">Replica Lag</p>
                                </div>
                            </div>
                            <span className="text-2xl font-bold text-amber-700">Degraded</span>
                        </div>
                        <div className="p-4 border rounded-lg bg-blue-50 border-blue-200 flex items-center justify-between">
                            <div className="flex items-center">
                                <GlobeAltIcon className="h-8 w-8 text-blue-600 mr-3" />
                                <div>
                                    <p className="font-bold text-blue-900">Gateways</p>
                                    <p className="text-xs text-blue-700">All Connected</p>
                                </div>
                            </div>
                            <span className="text-2xl font-bold text-blue-700">100%</span>
                        </div>
                        <div className="p-4 border rounded-lg bg-purple-50 border-purple-200 flex items-center justify-between">
                             <div className="flex items-center">
                                <ServerIcon className="h-8 w-8 text-purple-600 mr-3" />
                                <div>
                                    <p className="font-bold text-purple-900">Nodes</p>
                                    <p className="text-xs text-purple-700">Load Balanced</p>
                                </div>
                            </div>
                            <span className="text-2xl font-bold text-purple-700">Healthy</span>
                        </div>
                    </div>
                    
                    <div className="mt-6 overflow-x-auto max-h-[300px]">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Component Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Latency</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uptime (30d)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Check</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {metrics.map(metric => (
                                    <tr key={metric.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{metric.component}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{metric.type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={metric.status} /></td>
                                        <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{metric.latency.toFixed(0)} ms</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">{metric.uptime}%</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{metric.lastCheck}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
};
