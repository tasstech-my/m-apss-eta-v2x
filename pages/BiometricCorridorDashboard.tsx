
import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { VideoCameraIcon, ShieldExclamationIcon } from '../constants';
import type { BiometricGate, BiometricTransaction } from '../types';

// --- MOCK DATA ---
const initialGates: BiometricGate[] = [
    { id: 'G-01', name: 'Gate 01', type: 'e-Gate', status: 'Operational' },
    { id: 'G-02', name: 'Gate 02', type: 'e-Gate', status: 'Operational' },
    { id: 'G-03', name: 'Gate 03', type: 'e-Gate', status: 'Maintenance' },
    { id: 'G-04', name: 'Gate 04', type: 'e-Gate', status: 'Operational' },
    { id: 'COR-A', name: 'Corridor A', type: 'Biometric Corridor', status: 'Operational' },
    { id: 'COR-B', name: 'Corridor B', type: 'Biometric Corridor', status: 'Operational' },
];

const mockTravelers = [
    { name: 'John Smith', puid: 'PUID-1001', risk: 'Low', bioScore: 98 },
    { name: 'Maria Garcia', puid: 'PUID-9988', risk: 'High', bioScore: 95 },
    { name: 'Wei Chen', puid: 'PUID-5521', risk: 'Low', bioScore: 82 }, // Low Bio
    { name: 'Sarah Lim', puid: 'PUID-1122', risk: 'Medium', bioScore: 99 },
    { name: 'Ahmed Khan', puid: 'PUID-4433', risk: 'Critical', bioScore: 96 },
];

// --- UI COMPONENTS ---

const GateCard: React.FC<{ gate: BiometricGate }> = ({ gate }) => {
    const isProcessing = !!gate.currentTransaction;
    const isAlert = gate.currentTransaction?.decision === 'REFERRED';
    
    let statusColor = 'bg-gray-100 border-gray-300';
    let indicatorColor = 'bg-gray-400';
    
    if (gate.status === 'Maintenance') {
        statusColor = 'bg-amber-50 border-amber-300 opacity-60';
        indicatorColor = 'bg-amber-500';
    } else if (isAlert) {
        statusColor = 'bg-red-50 border-red-500 shadow-md animate-pulse';
        indicatorColor = 'bg-red-600';
    } else if (isProcessing) {
        statusColor = 'bg-blue-50 border-blue-400';
        indicatorColor = 'bg-blue-500 animate-pulse';
    } else if (gate.status === 'Operational') {
        statusColor = 'bg-green-50 border-green-300';
        indicatorColor = 'bg-green-500';
    }

    return (
        <div className={`p-4 rounded-lg border-2 transition-all duration-300 ${statusColor} flex flex-col h-40`}>
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${indicatorColor}`}></div>
                    <h4 className="font-bold text-brand-dark">{gate.name}</h4>
                </div>
                <span className="text-xs text-gray-500 font-mono">{gate.id}</span>
            </div>
            <p className="text-xs text-gray-600 mb-4">{gate.type}</p>
            
            <div className="flex-1 flex items-center justify-center">
                {isProcessing ? (
                    <div className="text-center w-full">
                         {isAlert ? (
                             <div className="text-red-600">
                                 <ShieldExclamationIcon className="h-8 w-8 mx-auto mb-1" />
                                 <p className="font-bold text-sm">STOP / REFERRED</p>
                                 <p className="text-xs mt-1">Officer Alerted</p>
                             </div>
                         ) : (
                             <div className="text-blue-600">
                                 <p className="font-mono text-xs mb-1">Identifying...</p>
                                 <p className="font-bold text-sm">{gate.currentTransaction?.travelerName}</p>
                             </div>
                         )}
                    </div>
                ) : (
                    <p className="text-gray-400 text-sm italic">{gate.status === 'Maintenance' ? 'Offline' : 'Ready'}</p>
                )}
            </div>
        </div>
    );
};

const TransactionLog: React.FC<{ transaction: BiometricTransaction }> = ({ transaction }) => {
    return (
        <div className="font-mono text-xs p-2 border-b border-gray-700 last:border-0">
            <span className="text-gray-500 mr-2">[{transaction.timestamp}]</span>
            <span className="text-blue-400 mr-2">{transaction.gateId}</span>
            <span className="text-white">
                REQ: PUID={transaction.puid}, BIO={transaction.biometricScore}% 
                <span className="text-gray-500 mx-1">→</span> 
                RISK: <span className={transaction.riskStatus === 'Low' ? 'text-green-400' : 'text-red-400'}>{transaction.riskStatus}</span>
                <span className="text-gray-500 mx-1">→</span> 
                DECISION: <span className={`font-bold ${transaction.decision === 'CLEARED' ? 'text-green-500' : 'text-red-500'}`}>{transaction.decision}</span>
            </span>
        </div>
    );
};

export const BiometricCorridorDashboard: React.FC = () => {
    const [gates, setGates] = useState<BiometricGate[]>(initialGates);
    const [transactions, setTransactions] = useState<BiometricTransaction[]>([]);
    const [kpis, setKpis] = useState({ throughput: 1240, clearanceRate: 98.2, activeAlerts: 0 });

    useEffect(() => {
        const interval = setInterval(() => {
            // Pick a random operational gate
            const activeGates = gates.filter(g => g.status === 'Operational' && !g.currentTransaction);
            if (activeGates.length === 0) {
                // Clear transactions periodically to simulate passage completion
                 setGates(prev => prev.map(g => {
                     if (g.currentTransaction && Math.random() > 0.3) {
                         return { ...g, currentTransaction: undefined }; // Clear gate
                     }
                     return g;
                 }));
                 return;
            }
            
            const gate = activeGates[Math.floor(Math.random() * activeGates.length)];
            const traveler = mockTravelers[Math.floor(Math.random() * mockTravelers.length)];
            
            // Logic: NOT OK if Risk is High/Critical OR Bio Score < 85
            let decision: 'CLEARED' | 'REFERRED' = 'CLEARED';
            if (traveler.risk === 'High' || traveler.risk === 'Critical' || traveler.bioScore < 85) {
                decision = 'REFERRED';
            }

            const newTx: BiometricTransaction = {
                id: `TX-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString(),
                gateId: gate.id,
                travelerName: traveler.name,
                puid: traveler.puid,
                biometricScore: traveler.bioScore,
                riskStatus: traveler.risk as any,
                decision,
                processingTimeMs: Math.floor(Math.random() * 200) + 100,
                alertGenerated: decision === 'REFERRED'
            };

            // Update Gate State
            setGates(prev => prev.map(g => g.id === gate.id ? { ...g, currentTransaction: newTx } : g));
            
            // Log Transaction
            setTransactions(prev => [newTx, ...prev.slice(0, 19)]);

            // Update KPIs
            setKpis(prev => ({
                throughput: prev.throughput + 1,
                clearanceRate: decision === 'CLEARED' ? prev.clearanceRate : Math.max(90, prev.clearanceRate - 0.01),
                activeAlerts: decision === 'REFERRED' ? prev.activeAlerts + 1 : prev.activeAlerts
            }));

        }, 2000);

        return () => clearInterval(interval);
    }, [gates]);

    return (
        <div className="space-y-6">
            <Card className="bg-slate-900 text-white border-l-4 border-brand-secondary">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                         <VideoCameraIcon className="h-8 w-8 text-brand-secondary mr-4" />
                         <div>
                            <h2 className="text-2xl font-bold">Automated Border Control Monitor</h2>
                            <p className="text-slate-400 text-sm mt-1">Real-time interface for e-Gates and Biometric Corridors.</p>
                        </div>
                    </div>
                     <div className="flex space-x-6 text-center">
                        <div>
                            <p className="text-xs text-gray-400 uppercase">Active Gates</p>
                            <p className="text-2xl font-bold">{gates.filter(g => g.status === 'Operational').length}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase">Throughput (24h)</p>
                            <p className="text-2xl font-bold text-green-400">{kpis.throughput}</p>
                        </div>
                         <div>
                            <p className="text-xs text-gray-400 uppercase">Clearance Rate</p>
                            <p className="text-2xl font-bold text-blue-400">{kpis.clearanceRate.toFixed(1)}%</p>
                        </div>
                         <div>
                            <p className="text-xs text-gray-400 uppercase">Fallback Alerts</p>
                            <p className="text-2xl font-bold text-red-500">{kpis.activeAlerts}</p>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Live Gate View */}
                <div className="lg:col-span-2">
                    <Card title="Live Gate Status">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {gates.map(gate => (
                                <GateCard key={gate.id} gate={gate} />
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Transaction Stream */}
                <div className="lg:col-span-1">
                    <Card title="Interface Function: API Stream" className="bg-slate-900 text-white h-[400px] flex flex-col">
                         <div className="flex-1 overflow-y-auto bg-black rounded-lg p-2 font-mono text-xs">
                            {transactions.length > 0 ? transactions.map(tx => (
                                <TransactionLog key={tx.id} transaction={tx} />
                            )) : (
                                <p className="text-gray-600 text-center mt-10">Waiting for stream data...</p>
                            )}
                         </div>
                    </Card>
                    <Card className="mt-6 bg-red-50 border-l-4 border-red-500">
                        <h4 className="font-bold text-red-800 text-sm uppercase mb-2">Fall-Back Protocol Active</h4>
                        <p className="text-red-700 text-xs">
                            Any "NOT OK" directive automatically generates a high-priority alert for the nearest officer and routes the traveler to a manual inspection desk.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
};
