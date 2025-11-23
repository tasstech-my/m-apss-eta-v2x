import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/Card';
import type { RiskService, RiskBrokerRequest, RiskQueryStatus, RiskServiceQuery, RiskBrokerSource, RiskBrokerProcessingStage } from '../types';
import { PuzzlePieceIcon } from '../constants';

// MOCK DATA
const initialRiskServices: RiskService[] = [
    { 
        id: 'serv-01', 
        name: 'Watch List Adaptor', 
        description: 'Queries the internal Watch List Manager for matches against government-provided lists.',
        type: 'Internal',
        status: 'Online', avgResponseTime: 55, enabled: true 
    },
    { 
        id: 'serv-02', 
        name: 'Standard Profile Adaptor', 
        description: 'Queries the internal profiler for known travel patterns and rule-based risks.',
        type: 'Internal',
        status: 'Online', avgResponseTime: 80, enabled: true 
    },
    { 
        id: 'serv-03', 
        name: 'Extended Profile Adaptor', 
        description: 'Queries an external, highly configurable business rules engine for complex scenarios.',
        type: 'External',
        status: 'Online', avgResponseTime: 150, enabled: true 
    },
    { 
        id: 'serv-04', 
        name: 'GovernmentLink Adaptor', 
        description: 'Queries external government systems (Passport, Visa, INTERPOL STLD) via the GovLink module.',
        type: 'External',
        status: 'Online', avgResponseTime: 250, enabled: true 
    },
    { 
        id: 'serv-05', 
        name: 'AI Behavioral Model', 
        description: 'Uses an AI/ML model to detect anomalous booking and travel behaviors.',
        type: 'Internal',
        status: 'Online', avgResponseTime: 180, enabled: true 
    },
    { 
        id: 'serv-06', 
        name: 'Third-Party Intel Feed (SDK Example)',
        description: 'Example of a custom-built adaptor connecting to a commercial intelligence provider via the SDK.',
        type: 'External',
        status: 'Offline', avgResponseTime: 0, enabled: false 
    },
];


const mockTravelerNames = ['John Doe', 'Jane Smith', 'Carlos Garcia', 'Wei Chan', 'Fatima Al-Jamil'];
const mockSourceModules: RiskBrokerSource[] = ['Application Processor', 'Risk Manager'];
const workflowStages: RiskBrokerProcessingStage[] = ['Receiving', 'Querying', 'Consolidating', 'Complete'];

// UI COMPONENTS
const ToggleSwitch: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void; }> = ({ enabled, onChange }) => (
    <button
        type="button"
        className={`${enabled ? 'bg-brand-secondary' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2`}
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
    >
        <span className={`${enabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
    </button>
);

const QueryStatusIndicator: React.FC<{ status: RiskQueryStatus }> = ({ status }) => {
    const styles: Record<RiskQueryStatus, string> = {
        Querying: 'bg-blue-100 text-blue-800 animate-pulse',
        HIT: 'bg-red-100 text-red-800',
        CLEAR: 'bg-green-100 text-green-800',
        ERROR: 'bg-amber-100 text-amber-800',
    };
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>{status}</span>;
};

const BrokerWorkflowStepper: React.FC<{ activeStage: RiskBrokerProcessingStage }> = ({ activeStage }) => {
    const activeIndex = workflowStages.indexOf(activeStage);
    return (
        <div className="flex items-center" aria-label="Broker workflow progress">
            {workflowStages.map((stage, index) => (
                <React.Fragment key={stage}>
                    <div className="flex flex-col items-center">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${index <= activeIndex ? 'bg-brand-secondary' : 'bg-gray-300'}`}>
                            {index < activeIndex && <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <p className={`mt-1 text-[10px] font-semibold ${index <= activeIndex ? 'text-brand-dark' : 'text-gray-400'}`}>{stage}</p>
                    </div>
                    {index < workflowStages.length - 1 && <div className={`flex-1 h-1 mx-2 ${index < activeIndex ? 'bg-brand-secondary' : 'bg-gray-300'}`}></div>}
                </React.Fragment>
            ))}
        </div>
    );
};


export const RiskBrokerDashboard: React.FC = () => {
    const [requests, setRequests] = useState<RiskBrokerRequest[]>([]);
    const [services, setServices] = useState<RiskService[]>(initialRiskServices);
    const [kpis, setKpis] = useState({ totalQueries: 1_234_567, avgTime: 185, errorRate: 0.8 });
    const [activeFlow, setActiveFlow] = useState<RiskBrokerRequest | null>(null);
    const [svgPaths, setSvgPaths] = useState<{ sourceToBroker: string; brokerToServices: { [key: string]: string } }>({ sourceToBroker: '', brokerToServices: {} });
    const svgContainerRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const processRequest = async (newRequest: RiskBrokerRequest) => {
            setRequests(prev => [newRequest, ...prev.slice(0, 4)]);
            setActiveFlow(newRequest);

            // 1. Receiving -> Querying
            await new Promise(res => setTimeout(res, 300));
            setRequests(prev => prev.map(r => r.id === newRequest.id ? { ...r, processingStage: 'Querying' } : r));

            // 2. Simulate parallel queries
            const queryPromises = newRequest.queries.map(query => {
                return new Promise<void>(resolve => {
                    const service = services.find(s => s.name === query.serviceName);
                    const responseTime = (service?.avgResponseTime || 100) + (Math.random() * 50 - 25);
                    
                    setTimeout(() => {
                        const rand = Math.random();
                        const status: RiskQueryStatus = rand < 0.05 ? 'ERROR' : rand < 0.15 ? 'HIT' : 'CLEAR';
                        setRequests(prev => prev.map(r => r.id === newRequest.id ? {
                            ...r,
                            queries: r.queries.map(q => q.id === query.id ? { ...q, status, responseTime } : q)
                        } : r));
                        resolve();
                    }, responseTime);
                });
            });

            await Promise.all(queryPromises);

            // 3. Querying -> Consolidating
            setRequests(prev => {
                return prev.map(r => {
                    if (r.id === newRequest.id) {
                        const hits = r.queries.filter(q => q.status === 'HIT').length;
                        return { ...r, processingStage: 'Consolidating', consolidatedHits: hits };
                    }
                    return r;
                });
            });

            // 4. Consolidating -> Complete
            await new Promise(res => setTimeout(res, 500));
             setRequests(prev => prev.map(r => {
                if (r.id === newRequest.id) {
                    const hasHit = r.queries.some(q => q.status === 'HIT');
                    const hasError = r.queries.some(q => q.status === 'ERROR');
                    let finalResult: RiskBrokerRequest['finalResult'];
                    if (hasHit) finalResult = 'RISK_IDENTIFIED';
                    else if (hasError) finalResult = 'INCOMPLETE';
                    else finalResult = 'NO_RISK';
                    return { ...r, processingStage: 'Complete', finalResult };
                }
                return r;
            }));

            setActiveFlow(null);
        };

        const interval = setInterval(() => {
            const enabledServices = services.filter(s => s.enabled && s.status === 'Online');
            if (enabledServices.length === 0) return;

            const newRequest: RiskBrokerRequest = {
                id: `RB-${Date.now()}`,
                travelerName: mockTravelerNames[Math.floor(Math.random() * mockTravelerNames.length)],
                timestamp: new Date().toLocaleTimeString(),
                sourceModule: mockSourceModules[Math.floor(Math.random() * mockSourceModules.length)],
                queries: enabledServices.map(s => ({
                    id: `${s.id}-${Date.now()}`,
                    serviceName: s.name,
                    status: 'Querying',
                })),
                finalResult: null,
                processingStage: 'Receiving',
            };
            
            processRequest(newRequest);

        }, 5000);

        return () => clearInterval(interval);
    }, [services]);
    
    useEffect(() => {
        if (activeFlow && svgContainerRef.current) {
            const containerRect = svgContainerRef.current.getBoundingClientRect();
            
            const sourceEl = document.getElementById(`source-${activeFlow.sourceModule.replace(/\s+/g, '-')}`);
            const brokerEl = document.getElementById('broker-node');

            if (sourceEl && brokerEl) {
                const sourceRect = sourceEl.getBoundingClientRect();
                const brokerRect = brokerEl.getBoundingClientRect();

                const newSourceToBrokerPath = `M ${sourceRect.right - containerRect.left} ${sourceRect.top - containerRect.top + sourceRect.height / 2} L ${brokerRect.left - containerRect.left} ${brokerRect.top - containerRect.top + brokerRect.height / 2}`;
                
                const newBrokerToServicePaths: { [key: string]: string } = {};

                services.filter(s => s.enabled).forEach(s => {
                    const serviceEl = document.getElementById(`service-${s.id}`);
                    if (serviceEl) {
                        const serviceRect = serviceEl.getBoundingClientRect();
                        newBrokerToServicePaths[s.id] = `M ${brokerRect.right - containerRect.left} ${brokerRect.top - containerRect.top + brokerRect.height / 2} L ${serviceRect.left - containerRect.left} ${serviceRect.top - containerRect.top + serviceRect.height / 2}`;
                    }
                });

                setSvgPaths({
                    sourceToBroker: newSourceToBrokerPath,
                    brokerToServices: newBrokerToServicePaths
                });
            }
        } else {
            setSvgPaths({ sourceToBroker: '', brokerToServices: {} });
        }
    }, [activeFlow, services]);

    const handleToggleService = (serviceId: string) => {
        setServices(prev => prev.map(s => s.id === serviceId ? { ...s, enabled: !s.enabled } : s));
    };

    return (
        <div className="space-y-6">
            <Card title="Decoupled Broker Workflow">
                <div ref={svgContainerRef} className="relative grid grid-cols-[1fr_1.5fr_1fr] gap-4 items-center min-h-[200px]">
                    <div className="z-10 text-center">
                        <h4 className="font-bold text-brand-dark mb-2">Requesting Systems</h4>
                        {mockSourceModules.map(source => (
                            <div key={source} id={`source-${source.replace(/\s+/g, '-')}`} className={`p-3 bg-white border border-gray-200 rounded-lg shadow-sm mb-2 transition-all duration-300 ${activeFlow?.sourceModule === source ? 'ring-2 ring-brand-secondary' : ''}`}>
                                {source}
                            </div>
                        ))}
                    </div>

                    <div id="broker-node" className="z-10 text-center p-6 bg-white border-2 border-brand-primary rounded-xl shadow-lg">
                        <h4 className="font-bold text-xl text-brand-primary">Risk Broker</h4>
                        <p className="text-sm text-gray-500">Orchestration Switchboard</p>
                    </div>
                    
                    <div className="z-10 text-center">
                        <h4 className="font-bold text-brand-dark mb-2">Risk Data Services</h4>
                        <div className="space-y-1">
                            {services.map(s => (
                                <div key={s.id} id={`service-${s.id}`} className={`p-1.5 text-xs bg-white border border-gray-200 rounded-md shadow-sm transition-all duration-300 ${activeFlow && services.find(as => as.id === s.id)?.enabled ? 'ring-2 ring-blue-400' : ''}`}>
                                    {s.name}
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* SVG Animation Layer */}
                    {activeFlow && (
                        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                            <defs>
                                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" /></marker>
                            </defs>
                            {svgPaths.sourceToBroker && (
                                <path
                                    d={svgPaths.sourceToBroker}
                                    stroke="#3b82f6" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" strokeDasharray="5,5">
                                    <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" repeatCount="indefinite" />
                                </path>
                            )}
                            {Object.entries(svgPaths.brokerToServices).map(([serviceId, pathData]) => (
                                 <path key={serviceId}
                                    d={pathData}
                                    stroke="#60a5fa" strokeWidth="1" fill="none" markerEnd="url(#arrowhead)" strokeDasharray="3,3">
                                    <animate attributeName="stroke-dashoffset" from="12" to="0" dur="0.8s" begin="0.5s" repeatCount="indefinite" />
                                </path>
                            ))}
                        </svg>
                    )}

                </div>
            </Card>

            <Card title="Risk Broker Performance">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Total Queries (24h)</p>
                        <p className="text-3xl font-bold text-brand-dark">{kpis.totalQueries.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Average Orchestration Time</p>
                        <p className="text-3xl font-bold text-brand-dark">{kpis.avgTime} ms</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Service Error Rate</p>
                        <p className="text-3xl font-bold text-status-red">{kpis.errorRate.toFixed(2)}%</p>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title="Live Risk Orchestration Feed" className="lg:col-span-2">
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {requests.map(req => (
                            <div key={req.id} className={`p-4 border rounded-lg bg-gray-50 new-alert-row transition-all duration-300 ${activeFlow?.id === req.id ? 'ring-2 ring-brand-secondary shadow-lg' : ''}`}>
                                <div className="flex justify-between items-center mb-3">
                                    <div>
                                        <p className="font-bold text-lg text-brand-dark">{req.travelerName}</p>
                                        <p className="text-xs text-gray-500">from <span className="font-semibold text-brand-dark">{req.sourceModule}</span> @ <span className="font-mono">{req.timestamp}</span></p>
                                    </div>
                                    {req.finalResult && (
                                        <div className={`px-3 py-1 text-sm font-bold rounded-full shadow-md text-white ${
                                            req.finalResult === 'RISK_IDENTIFIED' ? 'bg-status-red' : 
                                            req.finalResult === 'INCOMPLETE' ? 'bg-status-amber' : 'bg-status-green'
                                        }`}>
                                            {req.finalResult.replace('_', ' ')}
                                        </div>
                                    )}
                                </div>
                                <div className="mb-4">
                                     <BrokerWorkflowStepper activeStage={req.processingStage} />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {req.queries.map(q => (
                                        <div key={q.id} className="flex justify-between items-center p-2 bg-white rounded-md border">
                                            <span className="text-sm text-gray-800">{q.serviceName}</span>
                                            <div className="flex items-center space-x-2">
                                                {q.responseTime && <span className="text-xs font-mono text-gray-400">{q.responseTime.toFixed(0)}ms</span>}
                                                <QueryStatusIndicator status={q.status} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {req.processingStage === 'Consolidating' || req.processingStage === 'Complete' ? (
                                    <div className="mt-3 pt-3 border-t text-center">
                                        <p className="font-semibold text-sm text-gray-700">Consolidated Hits: <span className={`font-bold text-lg ${req.consolidatedHits && req.consolidatedHits > 0 ? 'text-red-600' : 'text-green-600'}`}>{req.consolidatedHits || 0}</span></p>
                                    </div>
                                ): null}
                            </div>
                        ))}
                         {requests.length === 0 && <p className="text-center text-gray-500 py-10">Waiting for risk assessment requests...</p>}
                    </div>
                </Card>

                <Card title="Pluggable Risk Service Adaptors">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Adaptor / Type</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Enable</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {services.map(s => (
                                    <tr key={s.id}>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="font-semibold text-brand-dark">{s.name}</div>
                                            <div className={`text-xs font-bold ${s.type === 'Internal' ? 'text-blue-600' : 'text-purple-600'}`}>{s.type}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">{s.description}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <div className={`w-2.5 h-2.5 rounded-full mr-2 ${s.status === 'Online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                {s.status}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3"><ToggleSwitch enabled={s.enabled} onChange={() => handleToggleService(s.id)} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-200 bg-gray-50 p-4 rounded-b-lg -m-6 -mt-0">
                        <div className="flex items-center">
                            <PuzzlePieceIcon className="h-10 w-10 text-brand-primary mr-4 flex-shrink-0"/>
                            <div>
                                <h4 className="font-bold text-brand-dark">Extensible by Design: M-APSS Risk Broker API SDK</h4>
                                <p className="text-sm text-gray-600 mt-1">This plug-in architecture allows new intelligence sources to be added without re-engineering the core system. A key deliverable is the API SDK for developing new adaptors.</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};