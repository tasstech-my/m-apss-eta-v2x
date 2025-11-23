
import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/Card';
import type { WaitTime, EquipmentStatus, SecurityAlert, Incident, FlightAlert, PassengerAlert } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { InteractiveFlightMap, todayStr } from '../components/InteractiveFlightMap';
import { JourneyLists } from '../components/JourneyLists';
import { StatisticalPanels } from '../components/StatisticalPanels';
import { SecurityContext } from '../components/SecurityContext';


const initialMockWaitTimes: WaitTime[] = [
  { checkpointId: 'T1 Main', currentWaitTime: 12, threshold: 20, thresholdAlert: false, trend: 'stable' },
  { checkpointId: 'T1 Int\'l', currentWaitTime: 28, threshold: 25, thresholdAlert: true, trend: 'up' },
  { checkpointId: 'T2 Domestic', currentWaitTime: 8, threshold: 15, thresholdAlert: false, trend: 'down' },
  { checkpointId: 'T3 North', currentWaitTime: 15, threshold: 20, thresholdAlert: false, trend: 'up' },
];

const initialMockEquipmentStatus: EquipmentStatus[] = [
  { equipmentId: 'CT-T1-A', type: 'CT Scanner', location: 'T1 Main', status: 'Operational' },
  { equipmentId: 'AIT-T1-04', type: 'AIT Scanner', location: 'T1 Main', status: 'Operational' },
  { equipmentId: 'CT-T1-B', type: 'CT Scanner', location: 'T1 Int\'l', status: 'Maintenance Required' },
  { equipmentId: 'CCTV-P4-2', type: 'CCTV Camera', location: 'Perimeter 4', status: 'Offline' },
];

const initialMockAlerts: SecurityAlert[] = [
  { alertId: 'A-10234', type: 'Suspicious Item', severity: 'High', status: 'New', timestamp: '2 mins ago', location: 'T1 Int\'l Lane 3', description: 'CT scan flagged potential explosive.'},
  { alertId: 'A-10233', type: 'Loitering', severity: 'Medium', status: 'Investigating', timestamp: '5 mins ago', location: 'T2 Baggage Claim', description: 'Individual loitering near restricted access.'},
];

const mockIncidents: Incident[] = [
  { incidentId: 'I-556', type: 'Security Breach', severityLevel: 'Level 3 - Major', status: 'Active', location: 'T1 Int\'l', startTimestamp: '10:30 AM' },
  { incidentId: 'I-555', type: 'Medical Emergency', severityLevel: 'Level 2 - Moderate', status: 'Under Control', location: 'T2 Gate D4', startTimestamp: '11:05 AM' },
];

const mockPassengerNames = ['John Doe', 'Jane Smith', 'Carlos Garcia', 'Wei Chan', 'Fatima Al-Jamil', 'Dmitri Ivanov'];
const mockFlightNumbers = ['UA123', 'BA289', 'LH430', 'EK201', 'QF11', 'AC791'];
const mockAlertTypes: PassengerAlert['alertType'][] = ['High Risk Score', 'Watchlist Match', 'No-Fly List Match', 'Irregular Travel Pattern'];
const mockSeverities: PassengerAlert['severity'][] = ['Critical', 'High', 'Medium'];

const mockAlertDescriptions: Record<PassengerAlert['alertType'], string> = {
    'High Risk Score': 'Passenger risk score of 85 exceeds the threshold of 70. Factors include last-minute cash booking and travel to a high-risk area.',
    'Watchlist Match': 'Potential match found against internal watchlist entry #WL-458B. Requires secondary screening.',
    'No-Fly List Match': 'High-confidence match against the official No-Fly List. Immediate action required. Escalate to federal authorities.',
    'Irregular Travel Pattern': 'Detected a circuitous and unusual travel route with multiple short-notice changes. The itinerary does not follow a logical path.'
};

const initialSecondaryScreeningWatchlist: PassengerAlert[] = [
  {
    alertId: 'SS-001',
    passengerName: 'Alex Johnson',
    flightNumber: 'BA289',
    alertType: 'No-Fly List Match',
    severity: 'Critical',
    timestamp: '11:45 AM',
    description: 'High-confidence match against No-Fly List entry #NF-987C. Passenger is approaching security checkpoint T1 Int\'l. Immediate interception required as per protocol 7-Delta.'
  },
  {
    alertId: 'SS-002',
    passengerName: 'Yuki Tanaka',
    flightNumber: 'JL006',
    alertType: 'High Risk Score',
    severity: 'High',
    timestamp: '11:52 AM',
    description: 'Passenger risk score of 92. Factors: Last-minute one-way ticket purchased with cash, unusual circuitous routing, and travel from a high-interest region. Flagged for enhanced baggage and personal screening.'
  },
  {
    alertId: 'SS-003',
    passengerName: 'Mohammed Al-Farsi',
    flightNumber: 'EK201',
    alertType: 'Watchlist Match',
    severity: 'High',
    timestamp: '11:58 AM',
    description: 'Potential match against internal watchlist #WL-458B (Known Associate). Requires questioning and verification of travel purpose at secondary.'
  }
];

type WatchlistSortableKeys = 'passengerName' | 'flightNumber' | 'severity';
interface WatchlistSortConfig {
    key: WatchlistSortableKeys;
    direction: 'ascending' | 'descending';
}


const PassengerAlertModal: React.FC<{ alert: PassengerAlert | null; onClose: () => void }> = ({ alert, onClose }) => {
  if (!alert) return null;

  const severityStyles: Record<PassengerAlert['severity'], string> = {
    'Critical': 'border-status-red text-status-red',
    'High': 'border-status-amber text-status-amber',
    'Medium': 'border-status-blue text-status-blue',
  };

  const alertStyle = severityStyles[alert.severity] || 'border-gray-400 text-gray-800';

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <Card 
        className="w-full max-w-2xl transform transition-all duration-300 scale-95 opacity-0 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-3 border-b mb-4">
          <h3 id="modal-title" className="text-2xl font-bold text-brand-dark flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 mr-3 ${alertStyle}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L2.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            Passenger Alert Details
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><p className="text-sm text-gray-500">Passenger</p><p className="text-lg font-medium text-gray-800">{alert.passengerName}</p></div>
                <div><p className="text-sm text-gray-500">Flight</p><p className="text-lg font-medium text-gray-800">{alert.flightNumber}</p></div>
                <div><p className="text-sm text-gray-500">Alert Type</p><p className="text-lg font-medium text-gray-800">{alert.alertType}</p></div>
                <div>
                    <p className="text-sm text-gray-500">Severity</p>
                    <p className={`text-lg font-medium ${alertStyle}`}>{alert.severity}</p>
                </div>
                <div><p className="text-sm text-gray-500">Timestamp</p><p className="text-lg font-mono text-gray-800">{alert.timestamp}</p></div>
                 <div><p className="text-sm text-gray-500">Alert ID</p><p className="text-lg font-mono text-gray-800">{alert.alertId}</p></div>
            </div>
            
            <div>
                <p className="text-sm text-gray-500">Alert Context & Description</p>
                <p className={`mt-1 p-3 rounded-lg border-l-4 ${alertStyle} bg-opacity-10 border-opacity-100 bg-current`}>
                    {alert.description}
                </p>
            </div>
        </div>

        <div className="mt-6 pt-4 border-t flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-dark transition-colors"
          >
            Close
          </button>
        </div>
      </Card>
    </div>
  );
};


const TrendIcon: React.FC<{ trend: 'up' | 'down' | 'stable' }> = ({ trend }) => {
    if (trend === 'up') return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 9.586V7z" clipRule="evenodd" /></svg>;
    if (trend === 'down') return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-7a1 1 0 10-2 0v-2.586l-1.293 1.293a1 1 0 01-1.414-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 11-1.414 1.414L11 8.414V11z" clipRule="evenodd" /></svg>;
    return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" /></svg>;
};


const AlertIcon: React.FC<{ type: FlightAlert['alertType'] }> = ({ type }) => {
    const commonClasses = "h-5 w-5 flex-shrink-0";
    switch (type) {
        case 'Security': return <svg xmlns="http://www.w3.org/2000/svg" className={commonClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L2.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
        case 'Delay': return <svg xmlns="http://www.w3.org/2000/svg" className={commonClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case 'Cancellation': return <svg xmlns="http://www.w3.org/2000/svg" className={commonClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case 'Gate Change': return <svg xmlns="http://www.w3.org/2000/svg" className={commonClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        default: return null;
    }
};

const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const ChevronUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
);

const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-2 border border-gray-300 rounded shadow-lg">
        <p className="font-bold">{label}</p>
        <p style={{ color: payload[0].fill }}>{`Wait Time: ${payload[0].value} min`}</p>
        <p className="text-sm text-gray-600">{`Threshold: ${data.threshold} min`}</p>
      </div>
    );
  }
  return null;
};

const SortableHeader: React.FC<{
    title: string;
    sortKey: WatchlistSortableKeys;
    currentSort: WatchlistSortConfig;
    onRequestSort: (key: WatchlistSortableKeys) => void;
}> = ({ title, sortKey, currentSort, onRequestSort }) => {
    const isSorted = currentSort.key === sortKey;
    const directionIcon = isSorted ? (currentSort.direction === 'ascending' ? '▲' : '▼') : '';

    return (
        <th
            className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
            onClick={() => onRequestSort(sortKey)}
        >
            <div className="flex items-center">
                <span>{title}</span>
                <span className="ml-2 w-4 text-gray-600">{directionIcon}</span>
            </div>
        </th>
    );
};


export const ASOCDashboard: React.FC = () => {
  const [waitTimes, setWaitTimes] = useState<WaitTime[]>(initialMockWaitTimes);
  const [equipmentStatus, setEquipmentStatus] = useState<EquipmentStatus[]>(initialMockEquipmentStatus);
  const [alerts, setAlerts] = useState<SecurityAlert[]>(initialMockAlerts);
  const [flightAlerts, setFlightAlerts] = useState<FlightAlert[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWaitTimeSettingsOpen, setIsWaitTimeSettingsOpen] = useState(false);
  const [passengerAlerts, setPassengerAlerts] = useState<PassengerAlert[]>([]);
  const [alertFilter, setAlertFilter] = useState<string>('All');
  const [alertSort, setAlertSort] = useState<string>('timestamp');
  const [newAlertIds, setNewAlertIds] = useState<Set<string>>(new Set());
  const [selectedPassengerAlert, setSelectedPassengerAlert] = useState<PassengerAlert | null>(null);
  const [secondaryScreeningWatchlist, setSecondaryScreeningWatchlist] = useState<PassengerAlert[]>(initialSecondaryScreeningWatchlist);
  const [isWatchlistVisible, setIsWatchlistVisible] = useState(true);
  const [watchlistSortConfig, setWatchlistSortConfig] = useState<WatchlistSortConfig>({ key: 'severity', direction: 'descending' });
  const [flightAlertFilter, setFlightAlertFilter] = useState<string>('All');
  const [activeAlertTab, setActiveAlertTab] = useState<'flights' | 'passengers'>('flights');
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [statusFilter, setStatusFilter] = useState<'All' | 'On Time' | 'Alert'>('All');


  const [alertColors, setAlertColors] = useState<Record<FlightAlert['alertType'], string>>({
      Security: '#ef4444', // Equivalent to Tailwind's red-500
      Delay: '#f59e0b',    // Equivalent to Tailwind's amber-500
      Cancellation: '#b91c1c', // Equivalent to Tailwind's red-700
      'Gate Change': '#3b82f6', // Equivalent to Tailwind's blue-500
  });

  const handleColorChange = (type: FlightAlert['alertType'], color: string) => {
    setAlertColors(prev => ({ ...prev, [type]: color }));
  };

  const handleDismissAlert = (idToDismiss: string) => {
    setFlightAlerts(currentAlerts => currentAlerts.filter(a => a.id !== idToDismiss));
  };

  const handleThresholdChange = (checkpointId: string, newThreshold: number) => {
    setWaitTimes(prev =>
      prev.map(item =>
        item.checkpointId === checkpointId
          ? { ...item, threshold: newThreshold, thresholdAlert: item.currentWaitTime > newThreshold }
          : item
      )
    );
  };

  const requestWatchlistSort = (key: WatchlistSortableKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (watchlistSortConfig.key === key && watchlistSortConfig.direction === 'ascending') {
        direction = 'descending';
    }
    setWatchlistSortConfig({ key, direction });
  };

  const sortedWatchlist = useMemo(() => {
    const sortableItems = [...secondaryScreeningWatchlist];
    
    sortableItems.sort((a, b) => {
        const severityOrder: Record<PassengerAlert['severity'], number> = { 'Critical': 3, 'High': 2, 'Medium': 1 };
        
        let aValue: string | number;
        let bValue: string | number;

        if (watchlistSortConfig.key === 'severity') {
            aValue = severityOrder[a.severity];
            bValue = severityOrder[b.severity];
        } else {
            aValue = a[watchlistSortConfig.key];
            bValue = b[watchlistSortConfig.key];
        }

        if (aValue < bValue) {
            return watchlistSortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
            return watchlistSortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
    });

    return sortableItems;
  }, [secondaryScreeningWatchlist, watchlistSortConfig]);

  const displayedFlightAlerts = useMemo(() => {
    if (flightAlertFilter === 'All') {
      return flightAlerts;
    }
    return flightAlerts.filter(alert => alert.alertType === flightAlertFilter);
  }, [flightAlerts, flightAlertFilter]);


  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate wait time changes
      setWaitTimes(prev => prev.map(item => {
        const change = Math.floor(Math.random() * 7) - 3; // -3 to +3
        const newWaitTime = Math.max(3, item.currentWaitTime + change);
        return {
          ...item,
          currentWaitTime: newWaitTime,
          trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
          thresholdAlert: newWaitTime > item.threshold,
        };
      }));

      // Simulate equipment status changes (10% chance per interval)
      if (Math.random() < 0.1) {
        setEquipmentStatus(prev => {
          const newStatus = [...prev];
          const indexToChange = Math.floor(Math.random() * newStatus.length);
          const currentItem = newStatus[indexToChange];
          const possibleStatuses: EquipmentStatus['status'][] = ['Operational', 'Maintenance Required', 'Offline'];
          const newS = possibleStatuses[Math.floor(Math.random() * possibleStatuses.length)];
          
          if (newS !== currentItem.status) {
              newStatus[indexToChange] = { ...currentItem, status: newS };
          }
          return newStatus;
        });
      }

      // Simulate new alerts (15% chance per interval)
      if (Math.random() < 0.15) {
        setAlerts(prev => {
          const newAlert: SecurityAlert = {
            alertId: `A-${Math.floor(Math.random() * 1000) + 10250}`,
            type: ['Suspicious Item', 'Loitering', 'Unauthorized Access'][Math.floor(Math.random() * 3)],
            severity: ['Critical', 'High', 'Medium', 'Low'][Math.floor(Math.random() * 4)] as SecurityAlert['severity'],
            status: 'New',
            timestamp: 'Just now',
            location: ['T1', 'T2', 'T3'][Math.floor(Math.random() * 3)] + ' Checkpoint',
            description: 'A new potential threat has been detected.'
          };
          
          const updatedAlerts = [newAlert, ...prev];
          return updatedAlerts.slice(0, 5); // Keep list size manageable
        });
      }

    }, 3500); // Update every 3.5 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
        const flightPool = [
            { fn: 'UA456', from: 'JFK', to: 'SFO' },
            { fn: 'BA289', from: 'LHR', to: 'PHX' },
            { fn: 'LH987', from: 'FRA', to: 'ORD' },
            { fn: 'EK201', from: 'DXB', to: 'JFK' },
            { fn: 'QF12', from: 'SYD', to: 'LAX' },
        ];
        const alertTypes: FlightAlert['alertType'][] = ['Security', 'Delay', 'Cancellation', 'Gate Change'];
        const descriptions: Record<FlightAlert['alertType'], string> = {
            Security: 'Unattended baggage reported at gate.',
            Delay: 'Delayed by 45 minutes due to late inbound aircraft.',
            Cancellation: 'Cancelled due to severe weather.',
            'Gate Change': 'Gate changed from A12 to C3.'
        };

        const alertInterval = setInterval(() => {
            const randomFlight = flightPool[Math.floor(Math.random() * flightPool.length)];
            const randomType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
            const newAlert: FlightAlert = {
                id: crypto.randomUUID(),
                flightNumber: randomFlight.fn,
                origin: randomFlight.from,
                destination: randomFlight.to,
                alertType: randomType,
                description: descriptions[randomType],
                timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            };
            
            setFlightAlerts(prev => [newAlert, ...prev].slice(0, 10));

            setTimeout(() => {
                handleDismissAlert(newAlert.id);
            }, 20000); // Auto-dismiss after 20 seconds
        }, 7000); // New alert every 7 seconds

        return () => clearInterval(alertInterval);
    }, []);

    useEffect(() => {
      const alertInterval = setInterval(() => {
          const alertType = mockAlertTypes[Math.floor(Math.random() * mockAlertTypes.length)];
          const newAlert: PassengerAlert = {
              alertId: `PA-${Math.floor(Math.random() * 10000)}`,
              passengerName: mockPassengerNames[Math.floor(Math.random() * mockPassengerNames.length)],
              flightNumber: mockFlightNumbers[Math.floor(Math.random() * mockFlightNumbers.length)],
              alertType: alertType,
              severity: mockSeverities[Math.floor(Math.random() * mockSeverities.length)],
              timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              description: mockAlertDescriptions[alertType],
          };
          setPassengerAlerts(prev => [newAlert, ...prev].slice(0, 10)); // Keep max 10 alerts
          
          setNewAlertIds(prev => {
              const newSet = new Set(prev);
              newSet.add(newAlert.alertId);
              return newSet;
          });

          setTimeout(() => {
            setNewAlertIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(newAlert.alertId);
                return newSet;
            });
          }, 2100);
      }, 4500); // New alert every 4.5 seconds

      return () => clearInterval(alertInterval);
  }, []);

  const displayedPassengerAlerts = useMemo(() => {
    let alerts = [...passengerAlerts];

    // Filter
    if (alertFilter !== 'All') {
        alerts = alerts.filter(a => a.alertType === alertFilter);
    }

    // Sort
    if (alertSort === 'severity') {
        const severityOrder: Record<PassengerAlert['severity'], number> = { 'Critical': 3, 'High': 2, 'Medium': 1 };
        alerts.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);
    }
    // 'timestamp' sort is default (newest first)

    return alerts;
}, [passengerAlerts, alertFilter, alertSort]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <PassengerAlertModal alert={selectedPassengerAlert} onClose={() => setSelectedPassengerAlert(null)} />
      
      {/* Interactive Flight Map */}
      <div className="lg:col-span-4 h-[450px]">
        <InteractiveFlightMap 
            selectedDate={selectedDate} 
            onDateChange={setSelectedDate}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
        />
      </div>
      
      {/* Journey Lists */}
      <div className="lg:col-span-4">
        <JourneyLists selectedDate={selectedDate} />
      </div>

      {/* Statistical Panels */}
      <div className="lg:col-span-4">
        <StatisticalPanels selectedDate={selectedDate} />
      </div>

      {/* Wait Times */}
      <Card title={
            <div className="flex justify-between items-center">
                <span>Passenger Wait Times</span>
                <button onClick={() => setIsWaitTimeSettingsOpen(!isWaitTimeSettingsOpen)} className="p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary">
                    <SettingsIcon className="h-5 w-5 text-gray-500" />
                </button>
            </div>
        } className="lg:col-span-2">
         {isWaitTimeSettingsOpen && (
            <div className="p-4 border-b border-gray-200 mb-4 bg-gray-50 rounded-lg">
                <h4 className="text-md font-semibold mb-3 text-brand-dark">Configure Wait Time Thresholds (in minutes)</h4>
                <div className="space-y-3">
                    {waitTimes.map(wt => (
                        <div key={wt.checkpointId} className="flex items-center justify-between">
                            <label htmlFor={`threshold-${wt.checkpointId}`} className="text-sm font-medium text-gray-700">{wt.checkpointId}</label>
                            <input
                                type="number"
                                id={`threshold-${wt.checkpointId}`}
                                value={wt.threshold}
                                onChange={(e) => handleThresholdChange(wt.checkpointId, Math.max(0, parseInt(e.target.value, 10) || 0))}
                                min="0"
                                className="w-20 p-1 border border-gray-300 rounded-md shadow-sm text-center focus:ring-brand-secondary focus:border-brand-secondary"
                                aria-label={`Threshold for ${wt.checkpointId}`}
                            />
                        </div>
                    ))}
                </div>
            </div>
        )}
         <ResponsiveContainer width="100%" height={250}>
            <BarChart data={waitTimes} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="checkpointId" />
              <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="currentWaitTime" name="Wait Time (min)">
                {waitTimes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.thresholdAlert ? '#ef4444' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
      </Card>
      
      {/* Equipment Status Summary */}
      <Card title="Equipment Status">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-green-600">
              {equipmentStatus.filter(e => e.status === 'Operational').length}
            </span>
            <span className="text-gray-500">Operational</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-amber-500">
              {equipmentStatus.filter(e => e.status === 'Maintenance Required').length}
            </span>
            <span className="text-gray-500">Maintenance</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-red-600">
              {equipmentStatus.filter(e => e.status === 'Offline' || e.status === 'Faulty').length}
            </span>
            <span className="text-gray-500">Offline/Faulty</span>
          </div>
        </div>
      </Card>
      
      {/* Active Alerts Count */}
      <Card title="Active Alerts">
        <div className="text-center">
            <p className="text-6xl font-bold text-red-600">{alerts.filter(a => a.status === 'New').length}</p>
            <p className="text-gray-500">New Critical & High Alerts</p>
        </div>
      </Card>
      
      {/* Secondary Screening Watchlist */}
      <Card title={
        <div 
            className="flex justify-between items-center w-full cursor-pointer"
            onClick={() => setIsWatchlistVisible(!isWatchlistVisible)}
            role="button"
            aria-expanded={isWatchlistVisible}
            aria-controls="watchlist-content"
        >
            <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-status-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                <span>Secondary Screening Watchlist</span>
            </div>
            {isWatchlistVisible ? <ChevronUpIcon className="h-5 w-5 text-gray-600" /> : <ChevronDownIcon className="h-5 w-5 text-gray-600" />}
        </div>
      } className="lg:col-span-4">
        {isWatchlistVisible && (
            <div id="watchlist-content" className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <SortableHeader title="Passenger" sortKey="passengerName" currentSort={watchlistSortConfig} onRequestSort={requestWatchlistSort} />
                            <SortableHeader title="Flight" sortKey="flightNumber" currentSort={watchlistSortConfig} onRequestSort={requestWatchlistSort} />
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Alert Type</th>
                            <SortableHeader title="Severity" sortKey="severity" currentSort={watchlistSortConfig} onRequestSort={requestWatchlistSort} />
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedWatchlist.map(alert => (
                            <tr key={alert.alertId} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-800">{alert.passengerName}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{alert.flightNumber}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{alert.alertType}</td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        alert.severity === 'Critical' ? 'bg-status-red/20 text-status-red' :
                                        alert.severity === 'High' ? 'bg-status-amber/20 text-status-amber' :
                                        'bg-status-blue/20 text-status-blue'
                                    }`}>{alert.severity}</span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <button onClick={() => setSelectedPassengerAlert(alert)} className="px-3 py-1 bg-brand-secondary text-white text-xs font-semibold rounded-md hover:bg-brand-primary">View Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </Card>

      {/* Active Security Alerts - Replaced with SecurityContext Component */}
       <SecurityContext alerts={alerts} className="lg:col-span-2" />

      {/* Current Incidents */}
       <Card title="Current Incidents" className="lg:col-span-2">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockIncidents.map(incident => (
                <tr key={incident.incidentId}>
                  <td className="px-4 py-3 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${incident.severityLevel.includes('Major') || incident.severityLevel.includes('Critical') ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>{incident.severityLevel}</span></td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{incident.type}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{incident.location}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{incident.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* NEW Real-Time Alerts Tabbed Component */}
      <Card className="lg:col-span-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveAlertTab('flights')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeAlertTab === 'flights' ? 'border-brand-primary text-brand-secondary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              aria-current={activeAlertTab === 'flights' ? 'page' : undefined}
            >
              Real-Time Flight Alerts
              {flightAlerts.length > 0 && <span className="ml-3 bg-brand-secondary text-white text-xs font-medium px-2.5 py-1 rounded-full">{flightAlerts.length}</span>}
            </button>
            <button
              onClick={() => setActiveAlertTab('passengers')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeAlertTab === 'passengers' ? 'border-brand-primary text-brand-secondary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              aria-current={activeAlertTab === 'passengers' ? 'page' : undefined}
            >
              Real-Time Passenger Alerts
              {passengerAlerts.length > 0 && <span className="ml-3 bg-status-amber text-white text-xs font-medium px-2.5 py-1 rounded-full">{passengerAlerts.length}</span>}
            </button>
          </nav>
        </div>

        <div className="pt-6">
          {activeAlertTab === 'flights' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <label htmlFor="flight-alert-filter" className="text-sm font-medium text-gray-700 mr-2">Filter by Type:</label>
                  <select
                      id="flight-alert-filter"
                      value={flightAlertFilter}
                      onChange={(e) => setFlightAlertFilter(e.target.value)}
                      className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-secondary focus:border-brand-secondary"
                  >
                      <option value="All">All Types</option>
                      {(Object.keys(alertColors) as Array<FlightAlert['alertType']>).map(type => (
                          <option key={type} value={type}>{type}</option>
                      ))}
                  </select>
                </div>
                <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className="p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary">
                    <SettingsIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {isSettingsOpen && (
                  <div className="p-4 border-b border-gray-200 mb-4 bg-gray-50 rounded-lg">
                      <h4 className="text-md font-semibold mb-3 text-brand-dark">Customize Alert Colors</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {(Object.keys(alertColors) as Array<FlightAlert['alertType']>).map((alertType) => (
                              <div key={alertType} className="flex items-center space-x-2">
                                  <input
                                      type="color"
                                      value={alertColors[alertType]}
                                      onChange={(e) => handleColorChange(alertType, e.target.value)}
                                      className="h-8 w-8 p-0 border-none cursor-pointer rounded"
                                      title={`Change color for ${alertType} alerts`}
                                  />
                                  <label className="block text-sm font-medium text-gray-700">{alertType}</label>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
              
              {displayedFlightAlerts.length > 0 ? (
                <div className="space-y-3">
                    {displayedFlightAlerts.map(alert => {
                        const mainColor = alertColors[alert.alertType] || '#6b7280'; // fallback to gray-500
                        const alertStyle = {
                            borderColor: mainColor,
                            backgroundColor: `${mainColor}20` // Add ~12% alpha for background
                        };

                        return (
                            <div 
                                key={alert.id} 
                                className="flex items-center p-3 rounded-lg border-l-4 shadow-sm transition-all duration-300"
                                style={alertStyle}
                            >
                                <div className="flex-grow">
                                    <div className="flex justify-between items-center">
                                        <p className="font-bold text-brand-dark">
                                            {alert.flightNumber} ({alert.origin} &rarr; {alert.destination})
                                        </p>
                                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{alert.timestamp}</span>
                                    </div>
                                    <div className="flex items-start text-sm text-gray-700 mt-2">
                                        <div style={{ color: mainColor }}>
                                            <AlertIcon type={alert.alertType} />
                                        </div>
                                        <p className="ml-2">
                                            <span className="font-semibold uppercase tracking-wider" style={{ color: mainColor }}>{alert.alertType}: </span>
                                            {alert.description}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => handleDismissAlert(alert.id)} className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-700" aria-label={`Dismiss alert for flight ${alert.flightNumber}`}>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        );
                    })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4 4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">{flightAlertFilter === 'All' ? 'No Active Flight Alerts' : `No active "${flightAlertFilter}" alerts`}</h3>
                    <p className="mt-1 text-sm text-gray-500">{flightAlertFilter === 'All' ? 'The flight operations board is currently clear.' : 'Try selecting a different filter.'}</p>
                </div>
              )}
            </div>
          )}
          {activeAlertTab === 'passengers' && (
             <div>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <div className="flex items-center space-x-4">
                        <div>
                            <label htmlFor="alertTypeFilter" className="text-sm font-medium text-gray-700 mr-2">Filter by Type:</label>
                            <select id="alertTypeFilter" value={alertFilter} onChange={e => setAlertFilter(e.target.value)} className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-secondary focus:border-brand-secondary">
                                <option value="All">All Types</option>
                                {mockAlertTypes.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="alertSort" className="text-sm font-medium text-gray-700 mr-2">Sort by:</label>
                            <select id="alertSort" value={alertSort} onChange={e => setAlertSort(e.target.value)} className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-secondary focus:border-brand-secondary">
                                <option value="timestamp">Newest First</option>
                                <option value="severity">Severity</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Passenger / Flight</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Alert Type</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {displayedPassengerAlerts.length > 0 ? displayedPassengerAlerts.map(alert => (
                                <tr key={alert.alertId} onClick={() => setSelectedPassengerAlert(alert)} className={`hover:bg-gray-50 cursor-pointer ${newAlertIds.has(alert.alertId) ? 'new-alert-row' : ''}`}>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="font-medium text-gray-800">{alert.passengerName}</div>
                                        <div className="text-sm text-gray-500">{alert.flightNumber}</div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{alert.alertType}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            alert.severity === 'Critical' ? 'bg-status-red/20 text-status-red' :
                                            alert.severity === 'High' ? 'bg-status-amber/20 text-status-amber' :
                                            'bg-status-blue/20 text-status-blue'
                                        }`}>{alert.severity}</span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">{alert.timestamp}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <button onClick={(e) => { e.stopPropagation(); setSelectedPassengerAlert(alert); }} className="px-3 py-1 bg-brand-secondary text-white text-xs font-semibold rounded-md hover:bg-brand-primary">View Details</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-6 text-gray-500">
                                        No active passenger alerts matching criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
             </div>
          )}
        </div>
      </Card>
    </div>
  );
};
