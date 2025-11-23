import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import type { DatabaseOperation } from '../types';

const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const ArchiveBoxXMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.03 1.125 0 1.131.094 1.976 1.057 1.976 2.192V7.5M12 21v-4.5m-4.5-4.5H7.5m6 0h.75M12 21H5.25a2.25 2.25 0 01-2.25-2.25V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25a2.25 2.25 0 01-2.25 2.25H12z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 10.75L9.75 15.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 10.75L14.25 15.25" />
    </svg>
);

const ArrowDownTrayIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

const OperationIcon: React.FC<{ type: DatabaseOperation['type'] }> = ({ type }) => {
    switch (type) {
        case 'INSERT': return <ArrowDownTrayIcon className="h-5 w-5 text-green-500" />;
        case 'PURGE': return <ArchiveBoxXMarkIcon className="h-5 w-5 text-red-500" />;
        case 'UPDATE': return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
        default: return null;
    }
};

export const TravelerDatabaseDashboard: React.FC = () => {
    const [totalRecords, setTotalRecords] = useState(125_483_920);
    const [dbSize, setDbSize] = useState(15.2);
    const [retentionPeriod, setRetentionPeriod] = useState(12);
    const [sliderValue, setSliderValue] = useState(12);
    const [operations, setOperations] = useState<DatabaseOperation[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const newRecords = Math.floor(Math.random() * 500) + 1000;
            setTotalRecords(prev => prev + newRecords);
            setDbSize(prev => +(prev + newRecords * 0.0000001).toFixed(2));
            
            const newInsertOp: DatabaseOperation = {
                id: `op-${Date.now()}`,
                type: 'INSERT',
                timestamp: new Date().toLocaleTimeString(),
                details: `Inserted ${newRecords.toLocaleString()} new traveler records from DAS.`
            };
            
            setOperations(prev => [newInsertOp, ...prev.slice(0, 14)]);

            // 10% chance to run a purge job
            if (Math.random() < 0.1) {
                const purgedCount = Math.floor(Math.random() * 5000) + 2000;
                const purgeOp: DatabaseOperation = {
                    id: `op-${Date.now() + 1}`,
                    type: 'PURGE',
                    timestamp: new Date().toLocaleTimeString(),
                    details: `Purged ${purgedCount.toLocaleString()} records older than ${retentionPeriod} months.`
                };
                 setOperations(prev => [purgeOp, ...prev.slice(0, 14)]);
                 setTotalRecords(prev => Math.max(0, prev - purgedCount));
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [retentionPeriod]);

    const handleSavePolicy = () => {
        setRetentionPeriod(sliderValue);
        // Here you would typically make an API call to update the setting.
        alert(`Data retention policy updated to ${sliderValue} months.`);
    };

    return (
        <div className="space-y-6">
            <Card title="Traveler Database Performance & Status">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Database Status</p>
                        <p className="text-2xl font-bold text-status-green">Online</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Total Records Stored</p>
                        <p className="text-2xl font-bold text-brand-dark">{totalRecords.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Database Size</p>
                        <p className="text-2xl font-bold text-brand-dark">{dbSize.toFixed(2)} TB</p>
                    </div>
                </div>
            </Card>

            <Card title="Data Retention Policy Configuration">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1 w-full">
                        <label htmlFor="retention-slider" className="block text-sm font-medium text-gray-700">
                            Retention Period: <span className="font-bold text-brand-primary">{sliderValue} Months</span>
                        </label>
                        <input
                            id="retention-slider"
                            type="range"
                            min="3"
                            max="60"
                            step="1"
                            value={sliderValue}
                            onChange={(e) => setSliderValue(parseInt(e.target.value, 10))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2"
                        />
                         <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>3 Months</span>
                            <span>60 Months (5 Years)</span>
                        </div>
                    </div>
                    <div className="md:w-1/3">
                        <div className="p-4 bg-amber-50 border-l-4 border-amber-400">
                            <h4 className="font-bold text-amber-800">Legal Notice</h4>
                            <p className="text-sm text-amber-700 mt-1">
                                Changes to data retention must comply with national privacy laws and legal requirements for data preservation.
                            </p>
                        </div>
                         <button 
                            onClick={handleSavePolicy}
                            className="w-full mt-4 px-4 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-primary transition-colors disabled:bg-gray-400"
                            disabled={sliderValue === retentionPeriod}
                         >
                           {sliderValue === retentionPeriod ? 'Policy is Set' : `Save New Policy (${sliderValue} Months)`}
                        </button>
                    </div>
                </div>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card title="Database Schema Overview">
                    <div className="relative p-4 space-y-4 font-sans">
                        <div className="bg-blue-100 p-3 rounded-lg shadow text-center"><strong>Travelers</strong> (PUID, Name, DoB, Nationality)</div>
                        <div className="bg-green-100 p-3 rounded-lg shadow text-center ml-8"><strong>Journeys</strong> (Flight No, Origin, Dest, Date)</div>
                        <div className="bg-indigo-100 p-3 rounded-lg shadow text-center ml-8"><strong>Data_Submissions</strong> (API/PNR Records)</div>
                        <div className="bg-amber-100 p-3 rounded-lg shadow text-center ml-8"><strong>Risk_Assessments</strong> (Score, Factors)</div>

                        {/* Connectors */}
                        <svg className="absolute top-0 left-0 w-full h-full" style={{ zIndex: 0 }}>
                            <path d="M 30 50 L 50 110" stroke="#9ca3af" strokeWidth="2" fill="none" />
                            <path d="M 30 50 L 50 174" stroke="#9ca3af" strokeWidth="2" fill="none" />
                            <path d="M 30 50 L 50 238" stroke="#9ca3af" strokeWidth="2" fill="none" />
                        </svg>
                    </div>
                </Card>
                <Card title="Live Database Operations">
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                        {operations.map(op => (
                            <div key={op.id} className={`p-3 border rounded-lg flex items-start space-x-3 new-alert-row ${op.type === 'PURGE' ? 'bg-red-50' : 'bg-gray-50'}`}>
                                <OperationIcon type={op.type} />
                                <div>
                                    <p className="font-mono text-xs text-gray-500">{op.timestamp}</p>
                                    <p className="text-sm text-gray-800">{op.details}</p>
                                </div>
                            </div>
                        ))}
                         {operations.length === 0 && <p className="text-center text-gray-500 py-4">Waiting for database operations...</p>}
                    </div>
                </Card>
            </div>
        </div>
    );
};
