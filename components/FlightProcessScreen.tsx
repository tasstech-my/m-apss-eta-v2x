import React, { useState, useMemo } from 'react';
import type { FlightProcessRecord } from '../types';

const today = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];
const todayStr = formatDate(today);
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const tomorrowStr = formatDate(tomorrow);
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const yesterdayStr = formatDate(yesterday);

const getAirlineLogoUrl = (airlineName: string): string => {
    const domainExceptions: Record<string, string> = {
        'Garuda Indonesia': 'garuda-indonesia.com',
        'Singapore Airlines': 'singaporeair.com',
        'Japan Airlines': 'jal.com',
        'British Airways': 'ba.com',
    };

    const domain = domainExceptions[airlineName] || airlineName.replace(/\s+/g, '').toLowerCase() + '.com';
    return `https://logo.clearbit.com/${domain}`;
};


const mockFlightProcessData: FlightProcessRecord[] = [
    { id: 'FP-001', operator: 'Garuda Indonesia', journeyReference: 'GA886', departurePort: 'CGK', departureTime: '21:45', arrivalPort: 'AMS', arrivalTime: '07:15', status: 'Departed', passengerCount: 310, crewCount: 12, transitCount: 15, processedPercentage: 100, notProcessedCount: 0, alertCount: 2, updateAlertCount: 0, processedHoldCount: 1, direction: 'Outbound', date: todayStr },
    { id: 'FP-002', operator: 'Singapore Airlines', journeyReference: 'SQ957', departurePort: 'CGK', departureTime: '14:10', arrivalPort: 'SIN', arrivalTime: '15:55', status: 'Arrived', passengerCount: 175, crewCount: 8, transitCount: 4, processedPercentage: 100, notProcessedCount: 0, alertCount: 5, updateAlertCount: 1, processedHoldCount: 3, direction: 'Outbound', date: todayStr },
    { id: 'FP-003', operator: 'Emirates', journeyReference: 'EK357', departurePort: 'DXB', departureTime: '04:15', arrivalPort: 'CGK', arrivalTime: '15:25', status: 'Arrived', passengerCount: 401, crewCount: 18, transitCount: 22, processedPercentage: 100, notProcessedCount: 0, alertCount: 1, updateAlertCount: 0, processedHoldCount: 0, direction: 'Inbound', date: todayStr },
    { id: 'FP-004', operator: 'Japan Airlines', journeyReference: 'JL726', departurePort: 'CGK', departureTime: '06:55', arrivalPort: 'NRT', arrivalTime: '16:20', status: 'Scheduled', passengerCount: 288, crewCount: 10, transitCount: 8, processedPercentage: 75, notProcessedCount: 72, alertCount: 0, updateAlertCount: 0, processedHoldCount: 5, direction: 'Outbound', date: todayStr },
    { id: 'FP-005', operator: 'Qantas', journeyReference: 'QF42', departurePort: 'CGK', departureTime: '19:00', arrivalPort: 'SYD', arrivalTime: '05:30', status: 'Scheduled', passengerCount: 305, crewCount: 11, transitCount: 0, processedPercentage: 20, notProcessedCount: 244, alertCount: 0, updateAlertCount: 0, processedHoldCount: 0, direction: 'Outbound', date: tomorrowStr },
    { id: 'FP-006', operator: 'British Airways', journeyReference: 'BA39', departurePort: 'LHR', departureTime: '18:40', arrivalPort: 'CGK', arrivalTime: '13:50', status: 'Delayed', passengerCount: 335, crewCount: 14, transitCount: 30, processedPercentage: 95, notProcessedCount: 17, alertCount: 3, updateAlertCount: 2, processedHoldCount: 1, direction: 'Inbound', date: yesterdayStr },
];

const StatusPill: React.FC<{ status: FlightProcessRecord['status'] }> = ({ status }) => {
    const styles: Record<FlightProcessRecord['status'], string> = {
        Scheduled: 'bg-blue-100 text-blue-800',
        Departed: 'bg-indigo-100 text-indigo-800',
        Arrived: 'bg-green-100 text-green-800',
        Delayed: 'bg-amber-100 text-amber-800',
        Cancelled: 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>{status}</span>;
};

const DirectionIcon: React.FC<{ direction: FlightProcessRecord['direction'] }> = ({ direction }) => {
    if (direction === 'Inbound') {
        // Fix: Replace invalid `title` prop with a `<title>` element for SVG accessibility.
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><title>Inbound Flight</title><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" /></svg>;
    }
    // Fix: Replace invalid `title` prop with a `<title>` element for SVG accessibility.
    return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><title>Outbound Flight</title><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>;
};

const ProgressBar: React.FC<{ percentage: number }> = ({ percentage }) => (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div className="bg-brand-secondary h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
    </div>
);

export const FlightProcessScreen: React.FC = () => {
    const [dateFilter, setDateFilter] = useState(todayStr);
    const [searchFilter, setSearchFilter] = useState('');

    const filteredFlights = useMemo(() => {
        return mockFlightProcessData.filter(flight => {
            const dateMatch = flight.date === dateFilter;
            const searchMatch = searchFilter === '' || flight.journeyReference.toLowerCase().includes(searchFilter.toLowerCase());
            return dateMatch && searchMatch;
        });
    }, [dateFilter, searchFilter]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <div>
                    <label htmlFor="flight-date" className="block text-sm font-medium text-gray-700">Filter by Date</label>
                    <input
                        type="date"
                        id="flight-date"
                        value={dateFilter}
                        onChange={e => setDateFilter(e.target.value)}
                        className="mt-1 block w-full sm:w-auto p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-secondary focus:border-brand-secondary"
                    />
                </div>
                <div>
                    <label htmlFor="journey-search" className="block text-sm font-medium text-gray-700">Search by Journey Reference</label>
                    <input
                        type="text"
                        id="journey-search"
                        placeholder="e.g., GA886"
                        value={searchFilter}
                        onChange={e => setSearchFilter(e.target.value)}
                        className="mt-1 block w-full sm:w-auto p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-secondary focus:border-brand-secondary"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">Dir.</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operator / Journey</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route & Times</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pax / Crew / Tr.</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Processed</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Alerts</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredFlights.length > 0 ? filteredFlights.map(flight => (
                            <tr key={flight.id} className="hover:bg-gray-50">
                                <td className="px-3 py-4 whitespace-nowrap"><DirectionIcon direction={flight.direction} /></td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <img
                                            className="h-8 w-8 rounded-full mr-4 object-contain bg-white shadow-sm"
                                            src={getAirlineLogoUrl(flight.operator)}
                                            onError={(e) => {
                                                e.currentTarget.onerror = null; // prevent looping
                                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(flight.operator)}&background=random&color=fff`;
                                            }}
                                            alt={`${flight.operator} logo`}
                                        />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{flight.operator}</div>
                                            <div className="text-sm text-gray-500 font-mono">{flight.journeyReference}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{flight.departurePort} &rarr; {flight.arrivalPort}</div>
                                    <div className="text-sm text-gray-500 font-mono">{flight.departureTime} - {flight.arrivalTime}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap"><StatusPill status={flight.status} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                    {flight.passengerCount} / {flight.crewCount} / {flight.transitCount}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-24 mr-2">
                                            <ProgressBar percentage={flight.processedPercentage} />
                                        </div>
                                        <span className="text-sm text-gray-600">{flight.processedPercentage}%</span>
                                    </div>
                                    {flight.notProcessedCount > 0 && <div className="text-xs text-red-600">{flight.notProcessedCount} not processed</div>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <div className="text-sm space-x-2">
                                        <span title="New Alerts" className={`px-2 py-1 rounded-full ${flight.alertCount > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-500'}`}>{flight.alertCount}</span>
                                        <span title="Update Alerts" className={`px-2 py-1 rounded-full ${flight.updateAlertCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-500'}`}>{flight.updateAlertCount}</span>
                                        <span title="On Hold" className={`px-2 py-1 rounded-full ${flight.processedHoldCount > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'}`}>{flight.processedHoldCount}</span>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={7} className="text-center py-10 text-gray-500">
                                    No flights match the selected criteria for {dateFilter}.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
