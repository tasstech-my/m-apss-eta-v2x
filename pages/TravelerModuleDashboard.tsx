
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import type { ProcessingMessage, ConsolidatedTravelerRecord } from '../types';
import { FlightProcessScreen } from '../components/FlightProcessScreen';
import { EyeIcon } from '../constants';

// Mock Data
const initialProcessingQueue: ProcessingMessage[] = [
    { id: 'MSG-001', type: 'API', sourceId: 'TR-123', timestamp: '15:01:12', status: 'Validated' },
    { id: 'MSG-002', type: 'PNR', sourceId: 'A1B2C3D', timestamp: '12:34:01', status: 'Validated' },
    { id: 'MSG-003', type: 'PNR', sourceId: 'I7J8K9L', timestamp: '15:01:10', status: 'Failed' },
];

const mockTravelerRecords: ConsolidatedTravelerRecord[] = [
    {
        puid: 'PUID-1001', name: 'John Doe', dob: '1985-04-12', nationality: 'USA', photoUrl: 'https://picsum.photos/seed/puid1/100', riskIndicator: 'High',
        journeys: [{ flightNumber: 'UA234', origin: 'JFK', destination: 'LHR', date: '2023-10-28', status: 'Scheduled' }],
        dataSubmissions: [{ type: 'API', id: 'TR-123', timestamp: '2023-10-27 15:01:12', status: 'Processed' }, { type: 'PNR', id: 'A1B2C3D', timestamp: '2023-10-27 12:34:01', status: 'Processed' }],
    },
    {
        puid: 'PUID-2034', name: 'Jane Smith', dob: '1992-08-22', nationality: 'GBR', photoUrl: 'https://picsum.photos/seed/puid2/100', riskIndicator: 'Low',
        journeys: [{ flightNumber: 'BA098', origin: 'LHR', destination: 'DXB', date: '2023-10-28', status: 'Scheduled' }],
        dataSubmissions: [{ type: 'API', id: 'TR-124', timestamp: '2023-10-27 15:01:45', status: 'Pending' }],
    },
    {
        puid: 'PUID-8572', name: 'Klaus Mueller', dob: '1978-12-01', nationality: 'DEU', photoUrl: 'https://picsum.photos/seed/puid3/100', riskIndicator: 'Low',
        journeys: [{ flightNumber: 'LH456', origin: 'FRA', destination: 'JFK', date: '2023-10-28', status: 'Scheduled' }],
        dataSubmissions: [{ type: 'API', id: 'TR-125', timestamp: '2023-10-27 14:55:00', status: 'Processed' }, { type: 'PNR', id: 'I7J8K9L', timestamp: '2023-10-27 15:01:10', status: 'Rejected' }],
    },
];

// Icons
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ExclamationCircleIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 11a8 8 0 101.4-4.5" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13a8 8 0 10-1.4 4.5" /></svg>;

const getStatusIndicator = (status: ProcessingMessage['status']) => {
    switch (status) {
        case 'Validated': return <div className="flex items-center text-status-green"><CheckCircleIcon className="h-5 w-5 mr-2" /> Validated</div>;
        case 'Failed': return <div className="flex items-center text-status-red"><ExclamationCircleIcon className="h-5 w-5 mr-2" /> Failed</div>;
        case 'Processing': return <div className="flex items-center text-status-blue"><ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" /> Processing</div>;
        default: return null;
    }
};

const getRiskIndicatorPill = (risk: ConsolidatedTravelerRecord['riskIndicator']) => {
    switch (risk) {
        case 'Low': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Low</span>;
        case 'Medium': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">Medium</span>;
        case 'High': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">High</span>;
        case 'Critical': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-700 text-white">Critical</span>;
    }
};

export const TravelerModuleDashboard: React.FC = () => {
    const [processingQueue, setProcessingQueue] = useState<ProcessingMessage[]>(initialProcessingQueue);
    const [travelerRecords] = useState<ConsolidatedTravelerRecord[]>(mockTravelerRecords);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'travelerRecords' | 'flightProcess'>('travelerRecords');


    useEffect(() => {
        const interval = setInterval(() => {
            const newId = `MSG-${Math.floor(Math.random() * 900) + 100}`;
            const type = Math.random() > 0.5 ? 'API' : 'PNR';
            const newMessage: ProcessingMessage = {
                id: newId,
                type,
                sourceId: type === 'API' ? `TR-${Math.floor(Math.random() * 900) + 100}` : `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random()*9)}...`,
                timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
                status: 'Processing',
            };
            setProcessingQueue(prev => [newMessage, ...prev.slice(0, 4)]);

            setTimeout(() => {
                setProcessingQueue(prev => prev.map(msg => msg.id === newId ? { ...msg, status: Math.random() > 0.1 ? 'Validated' : 'Failed' } : msg));
            }, 2000 + Math.random() * 2000);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const filteredTravelers = useMemo(() => {
        if (!searchTerm) return travelerRecords;
        return travelerRecords.filter(t =>
            t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.puid.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.nationality.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, travelerRecords]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="Data Ingestion Summary">
                    <div className="space-y-3">
                        <div className="flex justify-between items-baseline">
                            <span className="text-gray-500">Total Data Sources</span>
                            <span className="text-2xl font-bold text-brand-primary">15</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-gray-500">Messages Processed (24h)</span>
                            <span className="text-2xl font-bold text-brand-primary">2.1M</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-gray-500">Processing Errors (24h)</span>
                            <span className="text-2xl font-bold text-status-red">1,204</span>
                        </div>
                    </div>
                </Card>
                <Card title="Message Processing Queue" className="md:col-span-2">
                    <div className="space-y-2">
                        {processingQueue.map(msg => (
                            <div key={msg.id} className="grid grid-cols-4 items-center p-2 rounded-lg hover:bg-gray-50 text-sm">
                                <div className="font-mono text-gray-600">{msg.timestamp}</div>
                                <div className="font-semibold">{msg.type}</div>
                                <div className="font-mono text-gray-500">{msg.sourceId}</div>
                                <div>{getStatusIndicator(msg.status)}</div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            <Card>
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                          onClick={() => setActiveTab('travelerRecords')}
                          className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'travelerRecords' ? 'border-brand-primary text-brand-secondary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                          aria-current={activeTab === 'travelerRecords' ? 'page' : undefined}
                        >
                          Traveler Records
                        </button>
                        <button
                          onClick={() => setActiveTab('flightProcess')}
                          className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'flightProcess' ? 'border-brand-primary text-brand-secondary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                          aria-current={activeTab === 'flightProcess' ? 'page' : undefined}
                        >
                          Flight Process
                        </button>
                    </nav>
                </div>
                <div className="pt-6">
                    {activeTab === 'travelerRecords' && (
                        <div>
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Search by PUID, Name, or Nationality..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full md:w-1/2 p-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Traveler</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PUID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nationality</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Indicator</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredTravelers.map(traveler => (
                                            <tr key={traveler.puid} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <img className="h-10 w-10 rounded-full object-cover" src={traveler.photoUrl} alt={traveler.name} />
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{traveler.name}</div>
                                                            <div className="text-sm text-gray-500">{traveler.dob}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-500">{traveler.puid}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{traveler.nationality}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{getRiskIndicatorPill(traveler.riskIndicator)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <Link 
                                                        to={`/data-intelligence/traveler/${traveler.puid}`} 
                                                        className="inline-flex items-center px-3 py-1.5 bg-brand-secondary text-white text-xs font-bold rounded-md hover:bg-brand-primary transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary"
                                                    >
                                                        <EyeIcon className="h-3.5 w-3.5 mr-1.5" />
                                                        View 360° Profile
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {activeTab === 'flightProcess' && (
                        <FlightProcessScreen />
                    )}
                </div>
            </Card>
        </div>
    );
};
