import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/Card';
import type { ApplicationProcessorRequest, EMRTransmission } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const mockPassengerNames = ['John Doe', 'Jane Smith', 'Carlos Garcia', 'Wei Chan', 'Fatima Al-Jamil', 'Dmitri Ivanov', 'Aisha Khan', 'Ken Tanaka'];
const mockFlightNumbers = ['UA123', 'BA289', 'LH430', 'EK201', 'QF11', 'AC791', 'MH370', 'SQ101'];
const mockDestinations = ['KUL', 'JFK', 'LHR', 'DXB', 'SIN', 'NRT'];
const noBoardReasons: ApplicationProcessorRequest['reason'][] = ['Watchlist Match', 'Invalid Document', 'High Risk Score', 'No-Fly List', 'Invalid Visa'];
const contactGovReasons: ApplicationProcessorRequest['reason'][] = ['Fuzzy Watchlist Match', 'Data Anomaly'];
const processingStages: ApplicationProcessorRequest['processingStage'][] = ['Receiving', 'Cleanse & Validate', 'Risk Broker Query', 'Applying Boarding Rules', 'Directive Issued', 'EMR to PLS'];
const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#b91c1c', '#f97316']; // Red, Amber, Blue, Dark Red, Orange
const boardingRules = [
    "Rule #1: IF Visa Status = INVALID THEN directive = No Board",
    "Rule #7: IF Document Check = ERROR THEN directive = No Board",
    "Rule #15: IF Watchlist = HIT THEN directive = No Board",
    "Rule #18: IF Watchlist = FUZZY_MATCH THEN directive = Contact Government",
    "Rule #23: IF AI Risk Score = HIT THEN directive = No Board",
    "Rule #55: IF Data Anomaly Detected THEN directive = Contact Government",
    "Rule #101: IF ALL checks = CLEAR THEN directive = OK to Board"
];

const EMRStatusIndicator: React.FC<{ status: EMRTransmission['transmissionStatus'] }> = ({ status }) => {
    const styles: Record<EMRTransmission['transmissionStatus'], string> = {
        Sending: 'text-blue-500 animate-pulse',
        Sent: 'text-indigo-500',
        Acknowledged: 'text-green-500',
    };
    return <span className={`font-semibold ${styles[status]}`}>{status}</span>;
};

export const ApplicationProcessorDashboard: React.FC = () => {
    const [requests, setRequests] = useState<ApplicationProcessorRequest[]>([]);
    const [kpis, setKpis] = useState({ total: 0, board: 0, noBoard: 0, contactGovernment: 0, avgSpeed: 0, emrsGenerated: 0 });
    const [latencyData, setLatencyData] = useState<{ time: number; p95: number; avg: number }[]>([]);
    const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set());
    const [emrTransmissions, setEmrTransmissions] = useState<EMRTransmission[]>([]);

    const toggleRequestExpansion = (id: string) => {
        setExpandedRequests(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    useEffect(() => {
        const processRequest = async (newRequest: ApplicationProcessorRequest) => {
            // Simulate stage progression up to 'Directive Issued'
            for (let i = 0; i < processingStages.length - 1; i++) {
                await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 100));
                setRequests(prev => prev.map(r => r.id === newRequest.id ? { ...r, processingStage: processingStages[i] } : r));
            }

            // Simulate final directive logic
            const rand = Math.random();
            let directive: ApplicationProcessorRequest['directive'];
            let reason: ApplicationProcessorRequest['reason'] | undefined;
            let riskCheckResults: ApplicationProcessorRequest['riskCheckResults'] = {};
            let appliedRule: ApplicationProcessorRequest['appliedRule'];
            
            if (rand < 0.10) { // 10% No Board
                directive = 'Do Not Board';
                reason = noBoardReasons[Math.floor(Math.random() * noBoardReasons.length)];
                riskCheckResults = { 'Watchlist Check': 'CLEAR', 'Visa Status': 'CLEAR', 'Document Check': 'CLEAR', 'AI Risk Score': 'CLEAR' };
                if (reason === 'Watchlist Match' || reason === 'No-Fly List') { riskCheckResults['Watchlist Check'] = 'HIT'; appliedRule = boardingRules[2]; }
                else if (reason === 'Invalid Document') { riskCheckResults['Document Check'] = 'ERROR'; appliedRule = boardingRules[1]; }
                else if (reason === 'Invalid Visa') { riskCheckResults['Visa Status'] = 'ERROR'; appliedRule = boardingRules[0]; }
                else { riskCheckResults['AI Risk Score'] = 'HIT'; appliedRule = boardingRules[4]; }
            } else if (rand < 0.20) { // 10% Contact Government
                directive = 'Contact Government';
                reason = contactGovReasons[Math.floor(Math.random() * contactGovReasons.length)];
                riskCheckResults = { 'Watchlist Check': 'CLEAR', 'Visa Status': 'CLEAR', 'Document Check': 'CLEAR', 'AI Risk Score': 'CLEAR' };
                if (reason === 'Fuzzy Watchlist Match') { riskCheckResults['Watchlist Check'] = 'FUZZY'; appliedRule = boardingRules[3]; }
                else { riskCheckResults['Data Anomaly'] = 'HIT'; appliedRule = boardingRules[5]; }
            } else { // 80% OK to Board
                directive = 'OK to Board';
                riskCheckResults = { 'Watchlist Check': 'CLEAR', 'Visa Status': 'CLEAR', 'Document Check': 'CLEAR' };
                appliedRule = boardingRules[6];
            }

            const processingTime = 800 + Math.random() * 400;

            setRequests(prev => prev.map(r => r.id === newRequest.id ? { ...r, directive, reason, riskCheckResults, appliedRule } : r));
            
            setKpis(prev => ({
                total: prev.total + 1,
                board: prev.board + (directive === 'OK to Board' ? 1 : 0),
                noBoard: prev.noBoard + (directive === 'Do Not Board' ? 1 : 0),
                contactGovernment: prev.contactGovernment + (directive === 'Contact Government' ? 1 : 0),
                avgSpeed: (prev.avgSpeed * prev.total + processingTime) / (prev.total + 1),
                emrsGenerated: prev.emrsGenerated,
            }));
            
            setLatencyData(prev => [...prev.slice(-29), {
                time: Date.now(),
                avg: kpis.avgSpeed,
                p95: processingTime * (1.2 + Math.random() * 0.2),
            }]);

            if (directive === 'OK to Board') {
                await new Promise(resolve => setTimeout(resolve, 300));
                setRequests(prev => prev.map(r => r.id === newRequest.id ? { ...r, processingStage: 'EMR to PLS', emrStatus: 'Sending' } : r));

                const newEmr: EMRTransmission = {
                    id: `EMR-${newRequest.id}`,
                    passengerName: newRequest.passengerName,
                    flightNumber: newRequest.flightNumber,
                    destinationPLS: newRequest.destination || 'KUL',
                    riskStatus: 'Cleared - Low Risk',
                    transmissionStatus: 'Sending',
                };
                setEmrTransmissions(prev => [newEmr, ...prev.slice(0, 7)]);
                setKpis(prev => ({ ...prev, emrsGenerated: prev.emrsGenerated + 1 }));

                setTimeout(() => {
                    setEmrTransmissions(prev => prev.map(e => e.id === newEmr.id ? { ...e, transmissionStatus: 'Sent' } : e));
                    setRequests(prev => prev.map(r => r.id === newRequest.id ? { ...r, emrStatus: 'Sent' } : r));
                }, 1000);

                setTimeout(() => {
                    setEmrTransmissions(prev => prev.map(e => e.id === newEmr.id ? { ...e, transmissionStatus: 'Acknowledged' } : e));
                    setRequests(prev => prev.map(r => r.id === newRequest.id ? { ...r, emrStatus: 'Acknowledged' } : r));
                }, 2000);
            }
        };

        const interval = setInterval(() => {
            const newRequest: ApplicationProcessorRequest = {
                id: `APP-${Date.now()}`,
                passengerName: mockPassengerNames[Math.floor(Math.random() * mockPassengerNames.length)],
                flightNumber: mockFlightNumbers[Math.floor(Math.random() * mockFlightNumbers.length)],
                destination: mockDestinations[Math.floor(Math.random() * mockDestinations.length)],
                timestamp: new Date().toLocaleTimeString(),
                processingStage: 'Receiving',
                directive: null,
            };

            setRequests(prev => [newRequest, ...prev.slice(0, 14)]);
            processRequest(newRequest);

        }, 3000);

        return () => clearInterval(interval);
    }, [kpis.avgSpeed, kpis.total]);

    const directiveAnalysisData = useMemo(() => {
        const counts = requests.reduce((acc, req) => {
            if ((req.directive === 'Do Not Board' || req.directive === 'Contact Government') && req.reason) {
                acc[req.reason] = (acc[req.reason] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [requests]);

    const WorkflowStepper: React.FC<{ activeStage: ApplicationProcessorRequest['processingStage'] }> = ({ activeStage }) => {
        const activeIndex = processingStages.indexOf(activeStage);
        return (
            <div className="flex items-center space-x-1 sm:space-x-2" aria-label="Processing progress">
                {processingStages.map((stage, index) => (
                    <React.Fragment key={stage}>
                        <div className={`w-3 h-3 rounded-full transition-colors ${index <= activeIndex ? 'bg-brand-secondary' : 'bg-gray-300'}`} title={stage}></div>
                        {index < processingStages.length - 1 && <div className={`flex-1 h-0.5 ${index < activeIndex ? 'bg-brand-secondary' : 'bg-gray-300'}`}></div>}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    const StageIndicator: React.FC<{ req: ApplicationProcessorRequest }> = ({ req }) => {
        if (req.directive) {
            const directiveStyles: Record<string, { className: string; text: string }> = {
                'OK to Board': { className: 'bg-status-green', text: 'OK to Board' },
                'Do Not Board': { className: 'bg-status-red', text: 'Do Not Board' },
                'Contact Government': { className: 'bg-status-amber', text: "Contact Gov't" }
            };
            const style = directiveStyles[req.directive];
            if (style) {
                return (
                    <div className={`px-3 py-1 text-sm font-bold rounded-full shadow-md text-white ${style.className}`}>
                        {style.text}
                    </div>
                );
            }
        }
        return <WorkflowStepper activeStage={req.processingStage} />;
    };

    return (
        <div className="space-y-6">
            <Card title="Live Performance Metrics">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 text-center">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Total Requests</p>
                        <p className="text-2xl font-bold text-brand-dark">{kpis.total.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-500">'OK to Board'</p>
                        <p className="text-2xl font-bold text-status-green">{kpis.board.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                        <p className="text-sm text-gray-500">'Do Not Board'</p>
                        <p className="text-2xl font-bold text-status-red">{kpis.noBoard.toLocaleString()}</p>
                    </div>
                     <div className="p-4 bg-amber-50 rounded-lg">
                        <p className="text-sm text-gray-500">'Contact Gov't'</p>
                        <p className="text-2xl font-bold text-status-amber">{kpis.contactGovernment.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-500">Avg. Speed (ms)</p>
                        <p className="text-2xl font-bold text-status-blue">{kpis.avgSpeed.toFixed(0)}</p>
                    </div>
                    <div className="p-4 bg-indigo-50 rounded-lg">
                        <p className="text-sm text-gray-500">EMRs Generated</p>
                        <p className="text-2xl font-bold text-indigo-600">{kpis.emrsGenerated.toLocaleString()}</p>
                    </div>
                </div>
            </Card>

            <Card title="Real-Time Transaction Feed">
                <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
                    {requests.map(req => (
                        <div key={req.id} className="p-3 border rounded-lg bg-white shadow-sm new-alert-row animate-scale-in cursor-pointer hover:bg-gray-50" onClick={() => toggleRequestExpansion(req.id)}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-brand-dark">{req.passengerName}</p>
                                    <p className="text-sm text-gray-600">
                                        Flight <span className="font-mono bg-gray-200 px-1 rounded">{req.flightNumber}</span>
                                        <span className="text-xs text-gray-400 font-mono ml-4">{req.timestamp}</span>
                                    </p>
                                </div>
                                <div className="w-2/5 text-right flex flex-col items-end">
                                    <StageIndicator req={req} />
                                    {(req.directive === 'Do Not Board' || req.directive === 'Contact Government') && (
                                        <p className={`text-xs mt-1 ${req.directive === 'Do Not Board' ? 'text-red-600' : 'text-amber-600'}`}>{req.reason}</p>
                                    )}
                                </div>
                            </div>
                            {expandedRequests.has(req.id) && req.riskCheckResults && (
                                <div className="mt-4 pt-4 border-t border-gray-200 bg-gray-50 p-3 rounded-md">
                                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Workflow Breakdown</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                        <div className="sm:col-span-2">
                                            <p className="font-medium text-gray-500">Risk Broker Results:</p>
                                            <div className="pl-4">
                                                {Object.entries(req.riskCheckResults).map(([key, value]) => (
                                                    <div key={key} className="flex justify-between items-center">
                                                        <span>{key}:</span>
                                                        <span className={`font-bold ${
                                                            value === 'CLEAR' ? 'text-green-600' :
                                                            value === 'FUZZY' ? 'text-amber-600' : 'text-red-600'
                                                        }`}>{value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-500">Applied Boarding Rule:</p>
                                            <p className="font-mono text-xs bg-gray-200 p-1 rounded">{req.appliedRule}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {requests.length === 0 && <p className="text-center text-gray-500 py-4">Waiting for APP requests...</p>}
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card title="EMR Transmission to Primary Line System (PLS)" className="lg:col-span-3">
                    <div className="space-y-2 max-h-[260px] overflow-y-auto">
                        {emrTransmissions.map(emr => (
                            <div key={emr.id} className="grid grid-cols-4 items-center p-2 rounded-lg bg-gray-50 text-sm">
                                <div><p className="font-medium text-gray-800">{emr.passengerName}</p><p className="font-mono text-xs text-gray-500">{emr.flightNumber}</p></div>
                                <div><p className="text-xs text-gray-500">Destination PLS</p><p className="font-bold">{emr.destinationPLS}</p></div>
                                <div><p className="text-xs text-gray-500">Risk Status</p><p className="font-semibold text-green-700">{emr.riskStatus}</p></div>
                                <div><EMRStatusIndicator status={emr.transmissionStatus} /></div>
                            </div>
                        ))}
                         {emrTransmissions.length === 0 && <p className="text-center text-gray-500 py-4">No EMRs transmitted yet.</p>}
                    </div>
                </Card>

                <Card title="Directive Analysis" className="lg:col-span-2">
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie data={directiveAnalysisData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                {directiveAnalysisData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>
            
             <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card title="Boarding Rules Engine Overview" className="lg:col-span-5">
                    <p className="text-sm text-gray-600 mb-4">The AP consults these rules to translate risk signals from the Risk Broker into a final boarding directive.</p>
                    <div className="space-y-2">
                        {boardingRules.map(rule => (
                             <div key={rule} className="p-2 bg-gray-100 rounded-md font-mono text-sm text-gray-800">{rule}</div>
                        ))}
                    </div>
                </Card>
            </div>
             <Card title="Processing Latency (ms)">
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={latencyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" tickFormatter={(time) => new Date(time).toLocaleTimeString()} hide />
                        <YAxis domain={[0, 'dataMax + 200']} />
                        <Tooltip labelFormatter={(label) => new Date(label).toLocaleTimeString()} formatter={(value:number) => `${value.toFixed(0)} ms`}/>
                        <Legend />
                        <Line type="monotone" dataKey="avg" name="Average" stroke="#1e3a8a" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="p95" name="P95" stroke="#3b82f6" dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </Card>
        </div>
    );
};