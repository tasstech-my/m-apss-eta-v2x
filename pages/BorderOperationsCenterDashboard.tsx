import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/Card';
import type { BocCase } from '../types';

const mockPassengerNames = ['JON SMYTHE', 'MARIA GARCI', 'KEN TANAKA', 'AISHA KHAN', 'EMILY JONES', 'DAVID CHEN'];
const mockWatchlistNames = ['JOHN SMITH', 'MARIA GARCIA', 'KENTA NAKAMURA', 'AISHA K.', 'EMILY B JONES', 'DAVID L CHEN'];
const mockFlightNumbers = ['MH370', 'AK52', 'SQ106', 'EK409', 'QR845'];

const FuzzyMatchHighlighter: React.FC<{ text1: string, text2: string }> = ({ text1, text2 }) => {
    const diff = [];
    const maxLen = Math.max(text1.length, text2.length);
    for (let i = 0; i < maxLen; i++) {
        const char1 = text1[i] || '';
        const char2 = text2[i] || '';
        if (char1.toLowerCase() !== char2.toLowerCase()) {
            diff.push(<span key={i} className="bg-red-200 text-red-800 rounded px-0.5">{char2}</span>);
        } else {
            diff.push(char2);
        }
    }
    return <>{diff}</>;
};

export const BorderOperationsCenterDashboard: React.FC = () => {
    const [cases, setCases] = useState<BocCase[]>([]);
    const [selectedCase, setSelectedCase] = useState<BocCase | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [kpis, setKpis] = useState({ pending: 0, resolved: 0, avgTime: 0 });

    useEffect(() => {
        const interval = setInterval(() => {
            const passengerIndex = Math.floor(Math.random() * mockPassengerNames.length);
            const newCase: BocCase = {
                id: `BOC-${Date.now()}`,
                passengerName: mockPassengerNames[passengerIndex],
                flightNumber: mockFlightNumbers[Math.floor(Math.random() * mockFlightNumbers.length)],
                reason: 'Fuzzy Watchlist Match',
                receivedTimestamp: new Date().toLocaleTimeString(),
                status: 'Pending',
                matchDetails: {
                    traveler: { name: mockPassengerNames[passengerIndex], dob: '1988-05-10' },
                    watchlist: { name: mockWatchlistNames[passengerIndex], dob: '1988-05-10' },
                },
            };
            setCases(prev => [newCase, ...prev]);
        }, 8000); // New case every 8 seconds

        return () => clearInterval(interval);
    }, []);

    const pendingCases = useMemo(() => cases.filter(c => c.status === 'Pending'), [cases]);
    const resolvedCases = useMemo(() => cases.filter(c => c.status === 'Resolved'), [cases]);

    useEffect(() => {
        setKpis(prev => ({ ...prev, pending: pendingCases.length }));
    }, [pendingCases]);

    const filteredPendingCases = useMemo(() => {
        if (!searchTerm) return pendingCases;
        return pendingCases.filter(c =>
            c.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.flightNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [pendingCases, searchTerm]);

    const handleSelectCase = (caseItem: BocCase) => {
        setSelectedCase(caseItem);
    };

    const handleResolveCase = (decision: 'Approved' | 'Denied') => {
        if (!selectedCase) return;

        const resolvedCase: BocCase = {
            ...selectedCase,
            status: 'Resolved',
            resolution: {
                decision,
                officer: 'BOC Officer 1',
                timestamp: new Date().toLocaleTimeString(),
            }
        };

        setCases(prev => prev.map(c => c.id === resolvedCase.id ? resolvedCase : c));
        setSelectedCase(null);
        setKpis(prev => ({ ...prev, resolved: prev.resolved + 1 }));
    };

    return (
        <div className="space-y-6">
            <Card title="Border Operations Center (BOC) Dashboard">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-amber-50 rounded-lg">
                        <p className="text-sm text-gray-500">Pending Cases</p>
                        <p className="text-3xl font-bold text-status-amber">{kpis.pending}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-500">Average Resolution Time</p>
                        <p className="text-3xl font-bold text-status-blue">2m 15s</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-500">Resolved Today</p>
                        <p className="text-3xl font-bold text-status-green">{kpis.resolved}</p>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Live Pending Cases Queue">
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Search by name or flight..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                        {filteredPendingCases.length > 0 ? filteredPendingCases.map(c => (
                            <div key={c.id} onClick={() => handleSelectCase(c)} className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-100 new-alert-row ${selectedCase?.id === c.id ? 'bg-blue-100 border-brand-secondary' : 'bg-white border-gray-200'}`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-brand-dark">{c.passengerName}</p>
                                        <p className="text-sm text-gray-500">{c.flightNumber}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-amber-600 font-semibold">{c.reason}</p>
                                        <p className="text-xs text-gray-400 font-mono">{c.receivedTimestamp}</p>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center text-gray-500 py-6">No pending cases.</p>
                        )}
                    </div>
                </Card>
                <Card title="Case Review & Manual Override">
                    {selectedCase ? (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-bold text-brand-dark">{selectedCase.passengerName}</h3>
                                <p className="text-md text-gray-600">Flight: {selectedCase.flightNumber}</p>
                            </div>

                            <div className="p-4 bg-amber-50 rounded-lg">
                                <h4 className="font-semibold text-amber-800">Reason for Review</h4>
                                <p className="text-amber-700">{selectedCase.reason}</p>
                            </div>
                            
                            {selectedCase.matchDetails && (
                                <div>
                                    <h4 className="font-semibold">Fuzzy Match Analysis</h4>
                                    <div className="p-3 bg-gray-100 rounded-md mt-2 space-y-2">
                                        <div className="grid grid-cols-[100px_1fr]">
                                            <span className="font-medium text-gray-600">Traveler:</span>
                                            <span className="font-mono text-lg">{selectedCase.matchDetails.traveler.name}</span>
                                        </div>
                                        <div className="grid grid-cols-[100px_1fr]">
                                            <span className="font-medium text-gray-600">Watchlist:</span>
                                            <span className="font-mono text-lg"><FuzzyMatchHighlighter text1={selectedCase.matchDetails.traveler.name} text2={selectedCase.matchDetails.watchlist.name} /></span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 pt-6 border-t">
                                <h4 className="font-semibold mb-3">Manual Override Decision</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => handleResolveCase('Approved')} className="w-full py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors">Approve Boarding</button>
                                    <button onClick={() => handleResolveCase('Denied')} className="w-full py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors">Deny Boarding</button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full min-h-[300px]">
                            <p className="text-gray-500">Select a case from the queue to review.</p>
                        </div>
                    )}
                </Card>
            </div>

            <Card title="Recent Resolutions">
                <div className="overflow-x-auto max-h-[250px] overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Passenger</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Original Reason</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Final Decision</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Resolved By</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {resolvedCases.length > 0 ? resolvedCases.map(c => (
                                <tr key={c.id}>
                                    <td className="px-4 py-3 whitespace-nowrap"><div className="font-medium text-gray-800">{c.passengerName}</div><div className="text-sm text-gray-500">{c.flightNumber}</div></td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{c.reason}</td>
                                    <td className="px-4 py-3 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${c.resolution?.decision === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{c.resolution?.decision}</span></td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{c.resolution?.officer}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">{c.resolution?.timestamp}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-6 text-gray-500">No cases resolved yet today.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};