import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card } from '../components/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- TYPE DEFINITIONS ---
type ConnectionStatus = 'Connected' | 'Degraded' | 'Disconnected';
type ServiceStatus = 'Healthy' | 'Degraded' | 'Unhealthy';
type LogLevel = 'INFO' | 'WARN' | 'ERROR';

interface PartnerStatus {
    id: string;
    name: string;
    status: ConnectionStatus;
    latency: number;
    volume24h: number;
    errorRate: number;
}

interface MicroserviceStatus {
    name: string;
    status: ServiceStatus;
}

interface SystemEvent {
    timestamp: string;
    level: LogLevel;
    message: string;
}

// --- TYPE DEFINITIONS FOR SUBSCRIBED CLIENTS ---
type SubscriptionStatus = 'Active' | 'Suspended' | 'Pending Approval';
type EndpointStatus = 'Healthy' | 'Degraded' | 'Offline';

interface SubscribedClient {
    id: string;
    name: string;
    logoUrl: string;
    subscriptionStatus: SubscriptionStatus;
    subscribedFeeds: ('PAXLST' | 'PNRGOV' | 'iAPI')[];
    endpointStatus: EndpointStatus;
    queries24h: number;
    lastActivity: string;
}

// --- TYPE DEFINITIONS FOR MESSAGE SWITCH ---
interface MAPPSService {
    id: string;
    name: string;
}

interface MessageRoutingRule {
    id: string;
    source: string;
    messageType: 'PAXLST' | 'PNRGOV' | 'iAPI' | 'ALL';
    destination: string;
    priority: number;
    enabled: boolean;
}

// --- TYPE DEFINITIONS for Communication Protocols ---
type ProtocolStatus = 'Active' | 'Inactive' | 'Error';

interface ProtocolAdapter {
    id: string;
    name: string;
    status: ProtocolStatus;
    liveConnections: number;
    dataVolume24h: string; // e.g., '1.2 TB'
}

// --- NEW TYPE DEFINITIONS FOR MESSAGE COLLATION ---
type GovernmentResponseStatus = 'Pending' | 'Board' | 'No Board';
type MasterCollationStatus = 'Processing' | 'OK TO BOARD' | 'DO NOT BOARD';

interface AppGovernmentResponse {
    id: string;
    name: string;
    status: GovernmentResponseStatus;
}

interface AppTransaction {
    id: string;
    passengerName: string;
    flightNumber: string;
    route: string;
    timestamp: string;
    governments: AppGovernmentResponse[];
    masterStatus: MasterCollationStatus;
}


// --- MOCK DATA ---
const initialPartnerStatuses: PartnerStatus[] = [
    { id: 'mas', name: 'Malaysia Airlines', status: 'Connected', latency: 45, volume24h: 1250340, errorRate: 0.01 },
    { id: 'sia', name: 'Singapore Airlines', status: 'Connected', latency: 52, volume24h: 980120, errorRate: 0.02 },
    { id: 'emirates', name: 'Emirates', status: 'Connected', latency: 110, volume24h: 850670, errorRate: 0.01 },
    { id: 'airasia', name: 'AirAsia', status: 'Degraded', latency: 250, volume24h: 1502340, errorRate: 0.54 },
    { id: 'cathay', name: 'Cathay Pacific', status: 'Connected', latency: 85, volume24h: 750990, errorRate: 0.03 },
    { id: 'qatar', name: 'Qatar Airways', status: 'Disconnected', latency: 0, volume24h: 690450, errorRate: 100 },
];

const initialMicroserviceStatuses: MicroserviceStatus[] = [
    { name: 'Authentication Service', status: 'Healthy' },
    { name: 'PAXLST Validation Engine', status: 'Healthy' },
    { name: 'PNRGOV Transformer', status: 'Healthy' },
    { name: 'Data Persistence Layer', status: 'Degraded' },
    { name: 'Risk Scoring Interface', status: 'Healthy' },
    { name: 'Alerting Service', status: 'Unhealthy' },
];

const initialSystemEvents: SystemEvent[] = [
    { timestamp: new Date(Date.now() - 2 * 60000).toLocaleTimeString(), level: 'INFO', message: 'System startup complete. All services initialized.' },
    { timestamp: new Date(Date.now() - 1 * 60000).toLocaleTimeString(), level: 'WARN', message: 'Latency for AirAsia connection exceeds 200ms threshold.' },
    { timestamp: new Date(Date.now() - 30000).toLocaleTimeString(), level: 'ERROR', message: 'Connection to Qatar Airways failed: Timeout.' },
];

const getClientLogoUrl = (name: string) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e3a8a&color=fff&font-size=0.4`;

const initialSubscribedClients: SubscribedClient[] = [
    { id: 'client-01', name: 'National Police Force', logoUrl: getClientLogoUrl('NPF'), subscriptionStatus: 'Active', subscribedFeeds: ['PAXLST', 'PNRGOV'], endpointStatus: 'Healthy', queries24h: 89012, lastActivity: '2 minutes ago' },
    { id: 'client-02', name: 'Immigration Department', logoUrl: getClientLogoUrl('ID'), subscriptionStatus: 'Active', subscribedFeeds: ['PAXLST', 'PNRGOV', 'iAPI'], endpointStatus: 'Healthy', queries24h: 154321, lastActivity: 'Just now' },
    { id: 'client-03', name: 'Ministry of Health', logoUrl: getClientLogoUrl('MH'), subscriptionStatus: 'Suspended', subscribedFeeds: ['PAXLST'], endpointStatus: 'Offline', queries24h: 0, lastActivity: '2 days ago' },
    { id: 'client-04', name: 'Customs Directorate', logoUrl: getClientLogoUrl('CD'), subscriptionStatus: 'Active', subscribedFeeds: ['PAXLST'], endpointStatus: 'Degraded', queries24h: 45098, lastActivity: '15 minutes ago' },
    { id: 'client-05', name: 'Intelligence Services', logoUrl: getClientLogoUrl('IS'), subscriptionStatus: 'Pending Approval', subscribedFeeds: ['PAXLST', 'PNRGOV'], endpointStatus: 'Offline', queries24h: 0, lastActivity: 'N/A' },
];

// --- MOCK DATA FOR MESSAGE SWITCH ---
const mAPSSServices: MAPPSService[] = [
    { id: 'risk-analytics', name: 'Risk Analytics Engine' },
    { id: 'traveler-module', name: 'Traveler Module DB' },
    { id: 'asoc-watchlist', name: 'ASOC Watchlist Service' },
    { id: 'xai-audit', name: 'XAI Audit Logger' },
];

const routingRules: MessageRoutingRule[] = [
    { id: 'rule1', source: 'Malaysia Airlines', messageType: 'PNRGOV', destination: 'Risk Analytics Engine', priority: 1, enabled: true },
    { id: 'rule2', source: '*', messageType: 'PAXLST', destination: 'Traveler Module DB', priority: 10, enabled: true },
    { id: 'rule3', source: '*', messageType: 'ALL', destination: 'XAI Audit Logger', priority: 100, enabled: true },
    { id: 'rule4', source: 'AirAsia', messageType: 'iAPI', destination: 'ASOC Watchlist Service', priority: 5, enabled: true },
    { id: 'rule5', source: 'Singapore Airlines', messageType: 'PNRGOV', destination: 'Risk Analytics Engine', priority: 2, enabled: false },
];

const messageTypeColors: Record<string, string> = {
    PAXLST: '#3b82f6', // blue-500
    PNRGOV: '#10b981', // green-500
    iAPI: '#f59e0b',   // amber-500
};

// MOCK DATA for Communication Protocols
const initialProtocolAdapters: ProtocolAdapter[] = [
    { id: 'proto-1', name: 'TCP/IP-MATIP', status: 'Active', liveConnections: 12, dataVolume24h: '5.2 TB' },
    { id: 'proto-2', name: 'AX.25', status: 'Active', liveConnections: 2, dataVolume24h: '10.1 GB' },
    { id: 'proto-3', name: 'X.25-EMTOX', status: 'Inactive', liveConnections: 0, dataVolume24h: '0 B' },
    { id: 'proto-4', name: 'SLC (Secure Link Channel)', status: 'Active', liveConnections: 5, dataVolume24h: '1.8 TB' },
    { id: 'proto-5', name: 'Legacy FTP/SFTP', status: 'Error', liveConnections: 1, dataVolume24h: '500 MB' },
];

// --- NEW MOCK DATA for Collation ---
const mockCollationPassengerNames = ['Liam Johnson', 'Olivia Smith', 'Noah Williams', 'Emma Brown', 'Oliver Jones'];
const mockCollationFlightNumbers = ['MH370', 'AK52', 'SQ106', 'EK409', 'QR845'];
const mockRoutes = [
    { route: 'KUL > DXB > JFK', govs: ['Malaysia', 'UAE', 'USA'] },
    { route: 'SIN > HKG > SFO', govs: ['Singapore', 'Hong Kong', 'USA'] },
    { route: 'LHR > KUL', govs: ['United Kingdom', 'Malaysia'] },
    { route: 'JED > KUL > CGK', govs: ['Saudi Arabia', 'Malaysia', 'Indonesia'] },
];

// --- HELPER & UI COMPONENTS ---

const getStatusPillStyles = (status: ConnectionStatus) => {
    switch (status) {
        case 'Connected': return 'bg-green-100 text-green-800';
        case 'Degraded': return 'bg-amber-100 text-amber-800';
        case 'Disconnected': return 'bg-red-100 text-red-800';
    }
};

const getServiceStatusDot = (status: ServiceStatus) => {
    switch (status) {
        case 'Healthy': return 'bg-status-green';
        case 'Degraded': return 'bg-status-amber';
        case 'Unhealthy': return 'bg-status-red';
    }
};

const LogLevelIcon: React.FC<{ level: LogLevel }> = ({ level }) => {
    const commonClasses = "h-5 w-5 mr-3 flex-shrink-0";
    if (level === 'ERROR') return <svg xmlns="http://www.w3.org/2000/svg" className={`${commonClasses} text-status-red`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    if (level === 'WARN') return <svg xmlns="http://www.w3.org/2000/svg" className={`${commonClasses} text-status-amber`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L2.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
    return <svg xmlns="http://www.w3.org/2000/svg" className={`${commonClasses} text-status-blue`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
};

const getSubscriptionStatusPill = (status: SubscriptionStatus) => {
    switch (status) {
        case 'Active': return 'bg-green-100 text-green-800';
        case 'Suspended': return 'bg-amber-100 text-amber-800';
        case 'Pending Approval': return 'bg-blue-100 text-blue-800';
    }
};

const getEndpointStatusDot = (status: EndpointStatus) => {
    switch (status) {
        case 'Healthy': return 'bg-status-green';
        case 'Degraded': return 'bg-status-amber';
        case 'Offline': return 'bg-status-red';
    }
};

const getProtocolStatusPill = (status: ProtocolStatus) => {
    switch (status) {
        case 'Active': return 'bg-green-100 text-green-800';
        case 'Inactive': return 'bg-gray-200 text-gray-800';
        case 'Error': return 'bg-red-100 text-red-800';
    }
};

// --- NEW UI COMPONENTS FOR MESSAGE COLLATION ---
const ResponseStatusIcon: React.FC<{ status: GovernmentResponseStatus }> = ({ status }) => {
    switch (status) {
        case 'Board':
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-status-green" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
        case 'No Board':
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-status-red" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;
        case 'Pending':
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    }
};

const MasterStatusPill: React.FC<{ status: MasterCollationStatus }> = ({ status }) => {
    switch (status) {
        case 'OK TO BOARD':
            return <div className="px-3 py-1 bg-status-green text-white text-sm font-bold rounded-full shadow-md">OK TO BOARD</div>;
        case 'DO NOT BOARD':
            return <div className="px-3 py-1 bg-status-red text-white text-sm font-bold rounded-full shadow-md">DO NOT BOARD</div>;
        case 'Processing':
            return <div className="px-3 py-1 bg-status-blue text-white text-sm font-bold rounded-full shadow-md animate-pulse">PROCESSING...</div>;
    }
};

// --- MAIN DASHBOARD COMPONENT ---

export const GovernmentGatewayDashboard: React.FC = () => {
    const [throughput, setThroughput] = useState(1480);
    const [responseTime, setResponseTime] = useState(45);
    const [liveMessages, setLiveMessages] = useState<Record<string, number>>({});
    const [appTransactions, setAppTransactions] = useState<AppTransaction[]>([]);


    const [chartData, setChartData] = useState(() => {
        const data = [];
        for (let i = 30; i >= 0; i--) {
            data.push({
                time: `T-${i}m`,
                PAXLST: 20000 + Math.random() * 5000,
                PNRGOV: 15000 + Math.random() * 4000,
                iAPI: 8000 + Math.random() * 2000,
            });
        }
        return data;
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setThroughput(t => Math.max(1200, Math.min(1800, t + (Math.random() * 100 - 50))));
            setResponseTime(r => Math.max(30, Math.min(80, r + (Math.random() * 4 - 2))));
            
            setChartData(prevData => {
                const newData = prevData.slice(1);
                newData.push({
                    time: 'Now',
                    PAXLST: 20000 + Math.random() * 5000,
                    PNRGOV: 15000 + Math.random() * 4000,
                    iAPI: 8000 + Math.random() * 2000,
                });
                return newData.map((d, i) => ({ ...d, time: i === 30 ? 'Now' : `T-${30 - i}m` }));
            });
            
            // Simulate message switch counts
            setLiveMessages(prev => {
                const newMessages: Record<string, number> = {};
                routingRules.filter(r => r.enabled).forEach(rule => {
                    const key = `${rule.source}-${rule.messageType}-${rule.destination}`;
                    const current = prev[key] || 0;
                    const newValue = Math.max(0, current + Math.floor(Math.random() * 20 - 8));
                    newMessages[key] = newValue;
                });
                return newMessages;
            });

        }, 3000);
        return () => clearInterval(interval);
    }, []);
    
    useEffect(() => {
    const createNewTransaction = () => {
        const randomRoute = mockRoutes[Math.floor(Math.random() * mockRoutes.length)];
        const newTransaction: AppTransaction = {
            id: `APP-${Date.now()}`,
            passengerName: mockCollationPassengerNames[Math.floor(Math.random() * mockCollationPassengerNames.length)],
            flightNumber: mockCollationFlightNumbers[Math.floor(Math.random() * mockCollationFlightNumbers.length)],
            route: randomRoute.route,
            timestamp: new Date().toLocaleTimeString(),
            masterStatus: 'Processing',
            governments: randomRoute.govs.map(g => ({
                id: `${g}-${Date.now()}`,
                name: g,
                status: 'Pending',
            })),
        };

        setAppTransactions(prev => [newTransaction, ...prev.slice(0, 4)]);

        // Simulate responses
        newTransaction.governments.forEach((gov) => {
            setTimeout(() => {
                const responseStatus: GovernmentResponseStatus = Math.random() > 0.1 ? 'No Board' : 'Board';
                
                setAppTransactions(currentTransactions => {
                    const updatedTransactions = [...currentTransactions];
                    const targetTransactionIndex = updatedTransactions.findIndex(t => t.id === newTransaction.id);
                    if (targetTransactionIndex === -1) return currentTransactions;

                    const targetTransaction = { ...updatedTransactions[targetTransactionIndex] };
                    targetTransaction.governments = [...targetTransaction.governments];
                    const targetGovIndex = targetTransaction.governments.findIndex(g => g.id === gov.id);
                    if (targetGovIndex === -1) return currentTransactions;

                    targetTransaction.governments[targetGovIndex] = { ...targetTransaction.governments[targetGovIndex], status: responseStatus };
                    
                    const allResponded = targetTransaction.governments.every(g => g.status !== 'Pending');
                    if (allResponded) {
                        const hasNoBoard = targetTransaction.governments.some(g => g.status === 'No Board');
                        targetTransaction.masterStatus = hasNoBoard ? 'DO NOT BOARD' : 'OK TO BOARD';
                    }
                    
                    updatedTransactions[targetTransactionIndex] = targetTransaction;
                    return updatedTransactions;
                });

            }, 1000 + Math.random() * 6000);
        });
    };

    createNewTransaction();
    const intervalId = setInterval(createNewTransaction, 9000);
    return () => clearInterval(intervalId);
}, []);


    const errorRate = 0.01;

    // Fix: Explicitly type the parameters of the 'reduce' callback to resolve potential type inference issues.
    const totalLiveMessages = useMemo(() => Object.values(liveMessages).reduce((sum: number, count: number) => sum + count, 0), [liveMessages]);

    return (
        <div className="space-y-6">
            <Card title="Gateway Health & Performance">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
                    <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-500">System Status</p>
                        <p className="text-2xl font-bold text-status-green">Fully Operational</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">System Uptime</p>
                        <p className="text-2xl font-bold text-brand-dark">99.999%</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Avg. Response Time</p>
                        <p className="text-2xl font-bold text-brand-dark">{responseTime.toFixed(0)} ms</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Live Throughput</p>
                        <p className="text-2xl font-bold text-brand-dark">{throughput.toFixed(0)} msg/s</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Error Rate (24h)</p>
                        <p className={`text-2xl font-bold ${errorRate > 0.1 ? 'text-status-red' : 'text-status-green'}`}>{errorRate}%</p>
                    </div>
                </div>
            </Card>

            <Card title="Live Message Routing & Transformation">
                <div className="relative grid grid-cols-[1fr_1.5fr_1fr] gap-4 items-center min-h-[350px]">
                    <svg className="absolute top-0 left-0 w-full h-full" style={{ zIndex: 0 }}>
                        <defs>
                            <marker id="marker-dot" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                                <circle cx="3" cy="3" r="1.5" className="text-white" fill="currentColor" />
                            </marker>
                        </defs>
                        {routingRules.filter(r => r.enabled).map((rule) => {
                            const destIndex = mAPSSServices.findIndex(s => s.name === rule.destination);
                            const sourcePartners = rule.source === '*' ? initialPartnerStatuses.filter(p => p.status !== 'Disconnected') : initialPartnerStatuses.filter(p => p.name === rule.source);
                            
                            return sourcePartners.map(partner => {
                                const partnerIndex = initialPartnerStatuses.findIndex(p => p.id === partner.id);
                                if (destIndex === -1) return null;
                                
                                const y1 = (partnerIndex * 52) + 26;
                                const y2 = (destIndex * 52) + 26;
                                const pathData = `M 20, ${y1} C 150, ${y1}, 250, ${y2}, 420, ${y2}`;
                                const color = messageTypeColors[rule.messageType] || '#6b7280';
                                
                                const key = `${rule.source}-${rule.messageType}-${rule.destination}`;
                                const messageCount = (liveMessages[key] || 0) / (rule.source === '*' ? sourcePartners.length : 1);
                                if(messageCount < 5) return null;
                                
                                const midPoint = { x: 220, y: y1 + (y2 - y1) * 0.5 };

                                return (
                                    <g key={`${rule.id}-${partner.id}`}>
                                        <path d={pathData} stroke={color} strokeWidth="2" fill="none" opacity="0.6" />
                                        <circle cx="0" cy="0" r="3" fill={color} opacity="0.8">
                                            <animateMotion dur={`${5 + Math.random() * 2}s`} repeatCount="indefinite" path={pathData} />
                                        </circle>
                                        <text x={midPoint.x} y={midPoint.y - 5} fill={color} fontSize="10" textAnchor="middle" className="font-sans font-bold">{messageCount.toFixed(0)}</text>
                                    </g>
                                );
                            });
                        })}
                    </svg>
                    
                    <div className="z-10">
                        <h4 className="font-bold text-center text-brand-dark mb-2">Airline DCS Sources</h4>
                        <div className="space-y-2">
                            {initialPartnerStatuses.map(p => (
                                <div key={p.id} className="p-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-md shadow-sm h-[44px] flex items-center">
                                    <span className="text-sm font-medium text-gray-800">{p.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="z-10 text-center p-4 bg-white/80 backdrop-blur-sm border-2 border-brand-primary rounded-xl shadow-lg">
                        <h4 className="font-bold text-xl text-brand-primary">Government Gateway</h4>
                        <p className="text-sm text-gray-500">Message Switch</p>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div><p className="text-xs text-gray-500 uppercase">Total Msgs/sec</p><p className="text-2xl font-bold text-brand-dark">{totalLiveMessages.toFixed(0)}</p></div>
                            <div><p className="text-xs text-gray-500 uppercase">Transformations</p><p className="text-2xl font-bold text-status-green">99.98%</p></div>
                            <div><p className="text-xs text-gray-500 uppercase">Active Rules</p><p className="text-2xl font-bold text-brand-dark">{routingRules.filter(r=>r.enabled).length}</p></div>
                            <div><p className="text-xs text-gray-500 uppercase">Avg. Latency</p><p className="text-2xl font-bold text-brand-dark">{responseTime.toFixed(0)}ms</p></div>
                        </div>
                    </div>

                    <div className="z-10">
                        <h4 className="font-bold text-center text-brand-dark mb-2">M-APSS Service Endpoints</h4>
                        <div className="space-y-2">
                            {mAPSSServices.map(s => (<div key={s.id} className="p-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-md shadow-sm h-[44px] flex items-center"><span className="text-sm font-medium text-gray-800">{s.name}</span></div>))}
                        </div>
                    </div>
                </div>
                 <div className="mt-6 pt-4 border-t"><h4 className="font-semibold text-brand-dark mb-2">Message Routing Rules</h4><div className="overflow-x-auto max-h-48"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50 sticky top-0"><tr><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Source</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Message Type</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Destination</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{routingRules.map(rule => (<tr key={rule.id}><td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{rule.source}</td><td className="px-4 py-2 whitespace-nowrap"><span style={{ backgroundColor: `${messageTypeColors[rule.messageType]}30`, color: messageTypeColors[rule.messageType] }} className="px-2 py-1 text-xs font-bold rounded-md">{rule.messageType}</span></td><td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{rule.destination}</td><td className="px-4 py-2 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${rule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>{rule.enabled ? 'Enabled' : 'Disabled'}</span></td></tr>))}</tbody></table></div></div>
            </Card>

            <Card title="Messages Processed per Minute"><ResponsiveContainer width="100%" height={300}><AreaChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="time" /><YAxis /><Tooltip /><Legend /><Area type="monotone" dataKey="PAXLST" stackId="1" stroke="#1e3a8a" fill="#1e3a8a" /><Area type="monotone" dataKey="PNRGOV" stackId="1" stroke="#3b82f6" fill="#3b82f6" /><Area type="monotone" dataKey="iAPI" stackId="1" stroke="#93c5fd" fill="#93c5fd" /></AreaChart></ResponsiveContainer></Card>
            <Card title="Connected Airline Partners Status"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Airline</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Latency (ms)</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Volume (24h)</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Error Rate</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{initialPartnerStatuses.map(p => (<tr key={p.id}><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.name}</td><td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusPillStyles(p.status)}`}>{p.status}</span></td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.latency || 'N/A'}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.volume24h.toLocaleString()}</td><td className="px-6 py-4 whitespace-nowrap text-sm"><span className={p.errorRate > 0.1 ? 'text-status-red' : 'text-gray-500'}>{p.errorRate.toFixed(2)}%</span></td></tr>))}</tbody></table></div></Card>
            <Card title={<div className="flex justify-between items-center"><span>Subscribed Government Clients</span><button className="px-4 py-2 bg-brand-secondary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary transition-colors flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>Onboard New Client</button></div>}><div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subscription</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subscribed Feeds</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Endpoint Health</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Queries (24h)</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Activity</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{initialSubscribedClients.map(client => (<tr key={client.id}><td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><div className="flex-shrink-0 h-10 w-10"><img className="h-10 w-10 rounded-full" src={client.logoUrl} alt={`${client.name} logo`} /></div><div className="ml-4"><div className="text-sm font-medium text-gray-900">{client.name}</div></div></div></td><td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSubscriptionStatusPill(client.subscriptionStatus)}`}>{client.subscriptionStatus}</span></td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.subscribedFeeds.map(feed => (<span key={feed} className="mr-2 px-2 py-1 bg-gray-200 text-gray-800 text-xs font-medium rounded-md">{feed}</span>))}</td><td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><div className={`h-2.5 w-2.5 rounded-full mr-2 ${getEndpointStatusDot(client.endpointStatus)}`}></div><div className="text-sm text-gray-900">{client.endpointStatus}</div></div></td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.queries24h.toLocaleString()}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.lastActivity}</td><td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2"><button className="text-brand-secondary hover:text-brand-primary">Manage</button><button className="text-gray-500 hover:text-gray-800">Logs</button></td></tr>))}</tbody></table></div></Card>
            
            <Card title="Communication Protocol Adapters">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Protocol Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Live Connections</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Volume (24h)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {initialProtocolAdapters.map(adapter => (
                                <tr key={adapter.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{adapter.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getProtocolStatusPill(adapter.status)}`}>{adapter.status}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{adapter.liveConnections}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{adapter.dataVolume24h}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button className="text-brand-secondary hover:text-brand-primary">Configure</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Card title="Live APP Message Collation">
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {appTransactions.map(tx => (
                        <div key={tx.id} className="p-4 border rounded-lg bg-gray-50 new-alert-row animate-scale-in">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-lg text-brand-dark">{tx.passengerName}</p>
                                    <p className="text-sm text-gray-600">
                                        {tx.flightNumber} <span className="font-mono bg-gray-200 px-1 rounded">{tx.route}</span>
                                    </p>
                                    <p className="text-xs text-gray-400 font-mono">{tx.timestamp}</p>
                                </div>
                                <MasterStatusPill status={tx.masterStatus} />
                            </div>
                            <div className="mt-3 pt-3 border-t">
                                <h5 className="text-sm font-semibold text-gray-700 mb-2">Government Responses:</h5>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                                    {tx.governments.map(gov => (
                                        <div key={gov.id} className="flex items-center space-x-2">
                                            <ResponseStatusIcon status={gov.status} />
                                            <span className="text-sm text-gray-800">{gov.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                    {appTransactions.length === 0 && <p className="text-center text-gray-500 py-4">Waiting for APP transactions...</p>}
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Core Service Health"><ul className="space-y-3">{initialMicroserviceStatuses.map(service => (<li key={service.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-md"><span className="text-sm font-medium text-gray-800">{service.name}</span><div className="flex items-center"><span className="text-sm mr-2">{service.status}</span><div className={`w-3 h-3 rounded-full ${getServiceStatusDot(service.status)}`}></div></div></li>))}</ul></Card>
                <Card title="Recent System Events"><div className="space-y-3 overflow-y-auto max-h-64">{initialSystemEvents.map((event, index) => (<div key={index} className="flex items-start text-sm"><LogLevelIcon level={event.level} /><div><p className="font-mono text-xs text-gray-500">{event.timestamp}</p><p className="text-gray-700">{event.message}</p></div></div>))}</div></Card>
            </div>
        </div>
    );
};