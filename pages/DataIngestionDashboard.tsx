
import React, { useState } from 'react';
import { Card } from '../components/Card';
import { DataIngestionSource, DataIngestionSourceType, IngestionSchedule } from '../types';

const initialDataSources: DataIngestionSource[] = [
    { id: 'SRC-001', name: 'Airline API Feed - UA', type: DataIngestionSourceType.API, status: 'Success', lastIngestion: '2023-10-27 10:00:05', schedule: { type: 'Hourly', nextRun: '2023-10-27 11:00:00' }, errorCount: 0 },
    { id: 'SRC-002', name: 'PNR Batch Files - SFTP', type: DataIngestionSourceType.File, status: 'Success', lastIngestion: '2023-10-27 09:30:15', schedule: { type: 'Daily', nextRun: '2023-10-28 04:00:00' }, errorCount: 0 },
    { id: 'SRC-003', name: 'Watchlist DB Sync', type: DataIngestionSourceType.Database, status: 'Failure', lastIngestion: '2023-10-27 09:00:00', schedule: { type: 'Hourly', nextRun: '2023-10-27 10:00:00' }, errorCount: 5 },
    { id: 'SRC-004', name: 'Check-in Kiosk Stream', type: DataIngestionSourceType.Streaming, status: 'Success', lastIngestion: 'N/A', schedule: { type: 'Continuous', nextRun: 'N/A' }, errorCount: 0 },
    { id: 'SRC-005', name: 'Manual Watchlist Upload', type: DataIngestionSourceType.File, status: 'Success', lastIngestion: '2023-10-26 14:00:00', schedule: { type: 'Manual', nextRun: 'N/A' }, errorCount: 0 },
];

const StatusWidget: React.FC<{ title: string, count: number, color: string }> = ({ title, count, color }) => (
  <div className={`p-4 bg-white rounded-lg shadow`}>
    <p className="text-sm text-gray-500">{title}</p>
    <p className={`text-3xl font-bold ${color}`}>{count}</p>
  </div>
);

const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-3.181-3.182l-3.182 3.182a8.25 8.25 0 01-11.664 0l-3.182-3.182m3.182-3.182h4.992m-4.993 0v4.992" />
    </svg>
);

const getStatusPill = (status: DataIngestionSource['status']) => {
  switch (status) {
    case 'Success':
      return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Success</span>;
    case 'Failure':
      return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Failure</span>;
    case 'In Progress':
      return (
        <span className="px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
          <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
          In Progress
        </span>
      );
    default:
      return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Unknown</span>;
  }
};

const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8.118v3.764a1 1 0 001.555.832l3.197-1.882a1 1 0 000-1.664l-3.197-1.882z" clipRule="evenodd" />
  </svg>
);

const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M-4.5 12h22.5" />
    </svg>
);


const ScheduleEditModal: React.FC<{
    source: DataIngestionSource;
    onClose: () => void;
    onSave: (source: DataIngestionSource) => void;
}> = ({ source, onClose, onSave }) => {
    const [scheduleType, setScheduleType] = useState<IngestionSchedule['type']>(source.schedule.type);

    const handleSave = () => {
        const now = new Date();
        let newNextRun = 'N/A';

        // A simple utility to format date to 'YYYY-MM-DD HH:MM:SS'
        const formatDateTime = (date: Date) => {
            const pad = (num: number) => num.toString().padStart(2, '0');
            return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
        };

        if (scheduleType === 'Hourly') {
            now.setHours(now.getHours() + 1);
            newNextRun = formatDateTime(now);
        } else if (scheduleType === 'Daily') {
            now.setDate(now.getDate() + 1);
            newNextRun = formatDateTime(now);
        } else if (scheduleType === 'Weekly') {
            now.setDate(now.getDate() + 7);
            newNextRun = formatDateTime(now);
        }

        onSave({
            ...source,
            schedule: {
                type: scheduleType,
                nextRun: newNextRun,
            },
        });
    };

    const isReadOnly = source.schedule.type === 'Continuous';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card title={`Edit Schedule for ${source.name}`} className="w-full max-w-md">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="scheduleType" className="block text-sm font-medium text-gray-700">
                            Schedule Type
                        </label>
                        <select
                            id="scheduleType"
                            value={scheduleType}
                            onChange={(e) => setScheduleType(e.target.value as IngestionSchedule['type'])}
                            disabled={isReadOnly}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm rounded-md disabled:bg-gray-200"
                        >
                            <option>Manual</option>
                            <option>Hourly</option>
                            <option>Daily</option>
                            <option>Weekly</option>
                            {isReadOnly && <option>Continuous</option>}
                        </select>
                         {isReadOnly && <p className="text-xs text-gray-500 mt-1">Schedules for continuous streams cannot be modified.</p>}
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isReadOnly}
                        className="px-4 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-primary transition-colors disabled:bg-gray-400"
                    >
                        Save Changes
                    </button>
                </div>
            </Card>
        </div>
    );
};

export const DataIngestionDashboard: React.FC = () => {
    const [dataSources, setDataSources] = useState<DataIngestionSource[]>(initialDataSources);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingSource, setEditingSource] = useState<DataIngestionSource | null>(null);

    const handleTriggerRun = (sourceId: string) => {
        setDataSources(currentSources =>
            currentSources.map(source =>
                source.id === sourceId ? { ...source, status: 'In Progress' } : source
            )
        );

        setTimeout(() => {
            setDataSources(currentSources =>
                currentSources.map(source => {
                    if (source.id === sourceId) {
                        const success = Math.random() > 0.2; // 80% success rate
                        return {
                            ...source,
                            status: success ? 'Success' : 'Failure',
                            lastIngestion: new Date().toISOString().replace('T', ' ').substring(0, 19),
                            errorCount: success ? 0 : source.errorCount + 1,
                        };
                    }
                    return source;
                })
            );
        }, 3000); // 3-second simulation
    };

    const handleSaveSchedule = (updatedSource: DataIngestionSource) => {
        setDataSources(currentSources =>
            currentSources.map(s => s.id === updatedSource.id ? updatedSource : s)
        );
        setEditingSource(null);
    };

    const filteredSources = dataSources.filter(source =>
        source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        source.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {editingSource && (
                <ScheduleEditModal 
                    source={editingSource} 
                    onClose={() => setEditingSource(null)}
                    onSave={handleSaveSchedule}
                />
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <StatusWidget title="Total Active Sources" count={dataSources.length} color="text-brand-primary" />
                <StatusWidget title="Sources with Errors" count={dataSources.filter(s => s.status === 'Failure').length} color="text-status-red" />
                <StatusWidget title="Sources In Progress" count={dataSources.filter(s => s.status === 'In Progress').length} color="text-status-blue" />
                <StatusWidget title="Sources Succeeded" count={dataSources.filter(s => s.status === 'Success').length} color="text-status-green" />
            </div>

            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-brand-dark">Data Sources</h2>
                     <button className="px-4 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-primary transition-colors">
                        Add New Source
                     </button>
                </div>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search by name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-1/3 p-2 border border-gray-300 rounded-lg"
                    />
                </div>
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Run</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Ingestion</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredSources.map(source => (
                                <tr key={source.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">{getStatusPill(source.status)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{source.name}</div>
                                        <div className="text-sm text-gray-500">{source.id}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{source.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{source.schedule.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{source.schedule.nextRun}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{source.lastIngestion}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleTriggerRun(source.id)}
                                            disabled={source.status === 'In Progress'}
                                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-brand-secondary hover:bg-brand-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary disabled:bg-gray-400 disabled:cursor-not-allowed mr-2"
                                            title="Trigger ingestion run now"
                                        >
                                            <PlayIcon className="-ml-0.5 mr-1 h-4 w-4" />
                                            Run Now
                                        </button>
                                        <button
                                            onClick={() => setEditingSource(source)}
                                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary"
                                            title="Edit schedule"
                                        >
                                            <CalendarIcon className="-ml-0.5 mr-1 h-4 w-4" />
                                            Edit Schedule
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
