import React, { useMemo } from 'react';
import { Card } from './Card';
import type { FlightJourney } from '../types';
import { mockFlights } from './InteractiveFlightMap'; // Using mock data from the map component

interface JourneyListsProps {
  selectedDate: string;
}

const AlertIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);


export const JourneyLists: React.FC<JourneyListsProps> = ({ selectedDate }) => {
  const journeysForDate = useMemo(() => {
    return mockFlights.filter(j => j.date === selectedDate);
  }, [selectedDate]);

  const inboundJourneys = useMemo(() => {
    return journeysForDate.filter(j => j.destination === 'CGK');
  }, [journeysForDate]);
  
  const outboundJourneys = useMemo(() => {
    return journeysForDate
      .filter(j => j.origin === 'CGK')
      .sort((a, b) => a.departureTime.localeCompare(b.departureTime));
  }, [journeysForDate]);

  return (
    <Card title="Journey Lists">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inbound Journeys */}
        <div>
          <h4 className="text-lg font-semibold text-brand-dark mb-2">Journeys (Inbound)</h4>
          <div className="overflow-y-auto max-h-[250px] border rounded-lg bg-gray-50">
            {inboundJourneys.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100 sticky top-0">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Journey Ref</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrival Time</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Travelers</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alerts</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {inboundJourneys.map(journey => (
                            <tr key={journey.id}>
                                <td className="px-4 py-3 whitespace-nowrap font-bold text-gray-800">{journey.flightNumber}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{journey.origin}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-brand-primary">{journey.arrivalTime}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-600">{journey.passengers.length}</td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    {journey.alertCount > 0 ? (
                                        <div className="flex items-center justify-center space-x-1 text-red-500" title={`${journey.alertCount} active alert(s)`}>
                                            <AlertIcon className="h-5 w-5" />
                                            <span className="font-bold text-sm">{journey.alertCount}</span>
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-400">-</div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="p-4 text-center text-gray-500">No inbound flights for the selected date.</p>
            )}
          </div>
        </div>
        
        {/* Outbound Journeys */}
        <div>
          <h4 className="text-lg font-semibold text-brand-dark mb-2">Journeys (Outbound)</h4>
          <div className="overflow-y-auto max-h-[250px] border rounded-lg bg-gray-50">
             {outboundJourneys.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100 sticky top-0">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Journey Ref</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Depart Time</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Travelers</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alerts</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {outboundJourneys.map(journey => (
                            <tr key={journey.id}>
                                <td className="px-4 py-3 whitespace-nowrap font-bold text-gray-800">{journey.flightNumber}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{journey.destination}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-brand-primary">{journey.departureTime}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-600">{journey.passengers.length}</td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    {journey.alertCount > 0 ? (
                                        <div className="flex items-center justify-center space-x-1 text-red-500" title={`${journey.alertCount} active alert(s)`}>
                                            <AlertIcon className="h-5 w-5" />
                                            <span className="font-bold text-sm">{journey.alertCount}</span>
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-400">-</div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="p-4 text-center text-gray-500">No outbound flights for the selected date.</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};