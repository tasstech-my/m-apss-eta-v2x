
import React, { useState, useMemo } from 'react';
import { Card } from './Card';
import type { SecurityAlert } from '../types';

interface SecurityContextProps {
  alerts: SecurityAlert[];
  className?: string;
}

const getSeverityPillClass = (severity: SecurityAlert['severity']) => {
    switch (severity) {
        case 'Critical': return 'bg-red-100 text-red-800';
        case 'High': return 'bg-amber-100 text-amber-800';
        case 'Medium': return 'bg-blue-100 text-blue-800';
        case 'Low': return 'bg-gray-200 text-gray-800';
        default: return 'bg-gray-200 text-gray-800';
    }
}

const getStatusPillClass = (status: SecurityAlert['status']) => {
    switch (status) {
        case 'New': return 'bg-red-100 text-red-800';
        case 'Investigating': return 'bg-blue-100 text-blue-800';
        case 'Resolved': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

export const SecurityContext: React.FC<SecurityContextProps> = ({ alerts, className = '' }) => {
    const [severityFilter, setSeverityFilter] = useState<string>('All');
    const [statusFilter, setStatusFilter] = useState<string>('All');

    const filteredAlerts = useMemo(() => {
        return alerts.filter(alert => {
            const matchesSeverity = severityFilter === 'All' || alert.severity === severityFilter;
            const matchesStatus = statusFilter === 'All' || alert.status === statusFilter;
            return matchesSeverity && matchesStatus;
        });
    }, [alerts, severityFilter, statusFilter]);

    return (
        <Card title={
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <span>Security Context & Alerts</span>
                <div className="flex flex-col sm:flex-row gap-2">
                     <div>
                        <label htmlFor="status-filter" className="sr-only">Status</label>
                        <select
                            id="status-filter"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="p-1 border border-gray-300 rounded-md shadow-sm focus:ring-brand-secondary focus:border-brand-secondary text-sm"
                        >
                            <option value="All">All Statuses</option>
                            <option value="New">New</option>
                            <option value="Investigating">Investigating</option>
                            <option value="Resolved">Resolved</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="severity-filter" className="sr-only">Severity</label>
                        <select
                            id="severity-filter"
                            value={severityFilter}
                            onChange={(e) => setSeverityFilter(e.target.value)}
                            className="p-1 border border-gray-300 rounded-md shadow-sm focus:ring-brand-secondary focus:border-brand-secondary text-sm"
                        >
                            <option value="All">All Severities</option>
                            <option value="Critical">Critical</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>
                </div>
            </div>
        } className={className}>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAlerts.length > 0 ? filteredAlerts.map(alert => (
                            <tr key={alert.alertId}>
                                <td className="px-4 py-3 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityPillClass(alert.severity)}`}>{alert.severity}</span></td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{alert.type}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{alert.location}</td>
                                <td className="px-4 py-3 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusPillClass(alert.status)}`}>{alert.status}</span></td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">{alert.timestamp}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="text-center py-6 text-gray-500">
                                    No alerts matching criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};
