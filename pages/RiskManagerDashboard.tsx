
import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '../components/Card';
import type { Referral, ReferralStatus, ReferralResolution, Hit, RiskEvent, AlertNotification, NotificationStatus } from '../types';
import { EnvelopeIcon, DevicePhoneMobileIcon, DocumentArrowDownIcon } from '../constants';

// MOCK DATA
const initialReferrals: Referral[] = [
    { 
        id: 'REF-001', passengerName: 'John Smith', puid: 'PUID-1001', flightNumber: 'MH123', destinationAirport: 'KUL',
        totalRiskScore: 88, 
        hits: [
            { id: 'H1A', type: 'Anomalous Booking', description: 'Multiple changes to PNR in last 24h', scoreContribution: 40 },
            { id: 'H1B', type: 'Irregular Itinerary', description: 'One-way ticket to high-risk destination', scoreContribution: 48 },
        ],
        createdAt: '10:15 AM', status: 'Unqualified' 
    },
    { 
        id: 'REF-002', passengerName: 'Sophie Dubois', puid: 'PUID-5001', flightNumber: 'AF23', destinationAirport: 'CDG',
        totalRiskScore: 92, 
        hits: [
            { id: 'H2A', type: 'Watchlist Match', description: 'Fuzzy match on name against internal watchlist #WL-458B.', scoreContribution: 70 },
            { id: 'H2B', type: 'Payment Method Risk', description: 'Last-minute international flight paid with cash.', scoreContribution: 22 },
        ],
        createdAt: '10:22 AM', status: 'Unqualified' 
    },
    { 
        id: 'REF-003', passengerName: 'Ivan Petrov', puid: 'PUID-6001', flightNumber: 'SU101', destinationAirport: 'SVO',
        totalRiskScore: 81, 
        hits: [{ id: 'H3A', type: 'Irregular Itinerary', description: 'Circuitous routing through 3 countries in 48 hours.', scoreContribution: 81 }],
        createdAt: '09:45 AM', status: 'Open', assignee: 'Analyst 1' 
    },
    { 
        id: 'REF-004', passengerName: 'David Chen', puid: 'PUID-1003', flightNumber: 'CX500', destinationAirport: 'HKG',
        totalRiskScore: 76, 
        hits: [{ id: 'H4A', type: 'Anomalous Booking', description: 'One-way ticket booked less than 6 hours before departure.', scoreContribution: 76 }],
        createdAt: '09:30 AM', status: 'Open', assignee: 'Analyst 2' 
    },
    { 
        id: 'REF-005', passengerName: 'Wei Chen', puid: 'V6W7X8Y', flightNumber: 'CA981', destinationAirport: 'PEK',
        totalRiskScore: 75, 
        hits: [{ id: 'H5A', type: 'Payment Method Risk', description: 'Ticket purchased with a travel voucher from an unrelated PNR.', scoreContribution: 75 }],
        createdAt: '08:50 AM', status: 'Closed', assignee: 'Analyst 1', resolvedAt: '09:25 AM', resolution: 'Qualified-Out (False Positive)', notes: 'Corporate travel voucher verified.' 
    },
     { 
        id: 'REF-006', passengerName: 'Omar Al-Masri', puid: 'H6I7J8K', flightNumber: 'MS985', destinationAirport: 'CAI',
        totalRiskScore: 95, 
        hits: [{ id: 'H6A', type: 'Watchlist Match', description: 'Confirmed match on narcotics watchlist.', scoreContribution: 95 }],
        createdAt: '08:10 AM', status: 'Alert', assignee: 'Analyst 2', resolvedAt: '08:45 AM', resolution: 'Qualified-In (Action Taken)', notes: 'Notified airport police liaison. On-arrival intercept planned.'
    },
];

const mockAnalyst = "Analyst 1"; // Assume this is the logged-in user

const NotificationStatusIndicator: React.FC<{ status: NotificationStatus, type: 'Email' | 'SMS' }> = ({ status, type }) => {
    const Icon = type === 'Email' ? EnvelopeIcon : DevicePhoneMobileIcon;
    const styles: Record<NotificationStatus, string> = {
        Queued: 'text-gray-500',
        Sending: 'text-blue-500 animate-pulse',
        Delivered: 'text-green-600',
        Failed: 'text-red-600',
    };
    return (
        <div className={`flex items-center space-x-1.5 ${styles[status]}`}>
            <Icon className="h-4 w-4" />
            <span className="text-xs font-semibold">{status}</span>
        </div>
    );
};

export const RiskManagerDashboard: React.FC = () => {
    const [referrals, setReferrals] = useState<Referral[]>(initialReferrals);
    const [resolvingReferral, setResolvingReferral] = useState<Referral | null>(null);
    const [events, setEvents] = useState<RiskEvent[]>([]);
    const [processingEvent, setProcessingEvent] = useState<RiskEvent | null>(null);
    const [generatingReferral, setGeneratingReferral] = useState<Referral | null>(null);
    const [notifications, setNotifications] = useState<AlertNotification[]>([]);


    // Simulate new events and referrals
    useEffect(() => {
        const interval = setInterval(() => {
            const newEvent: RiskEvent = {
                id: `EVT-${Date.now()}`,
                type: ['PNR_RECEIVED', 'API_UPDATED', 'BOOKING_CHANGE'][Math.floor(Math.random() * 3)] as RiskEvent['type'],
                sourceId: `SRC-${String(Date.now()).slice(-6)}`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            };
            setEvents(prev => [newEvent, ...prev.slice(0, 3)]);
            setProcessingEvent(newEvent);

            setTimeout(() => {
                const createsReferral = Math.random() < 0.3; // 30% chance to create a referral
                if (createsReferral) {
                    const newReferral: Referral = {
                        id: `REF-${String(Date.now()).slice(-4)}`,
                        passengerName: ['Liam Johnson', 'Olivia Brown', 'Noah Jones'][Math.floor(Math.random() * 3)],
                        puid: `PUID-${Math.floor(Math.random() * 9000) + 1000}`,
                        flightNumber: `XY${Math.floor(Math.random()*900)+100}`,
                        destinationAirport: ['KUL', 'SIN', 'BKK'][Math.floor(Math.random()*3)],
                        totalRiskScore: Math.floor(Math.random() * 20) + 75,
                        hits: [{ id: `H-${Date.now()}`, type: 'Anomalous Booking', description: 'Unusual last-minute booking pattern detected.', scoreContribution: Math.floor(Math.random() * 20) + 75 }],
                        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        status: 'Unqualified'
                    };
                    setGeneratingReferral(newReferral);
                    setTimeout(() => {
                        setReferrals(prev => [newReferral, ...prev]);
                        setGeneratingReferral(null);
                    }, 1500);
                }
                setProcessingEvent(null);
            }, 2000);

        }, 15000);
        return () => clearInterval(interval);
    }, []);

    const kpis = useMemo(() => ({
        unqualified: referrals.filter(c => c.status === 'Unqualified').length,
        open: referrals.filter(c => c.status === 'Open').length,
        alerts: referrals.filter(c => c.status === 'Alert').length,
    }), [referrals]);

    const handleClaimAndOpen = (referralId: string) => {
        setReferrals(prev => prev.map(c => c.id === referralId ? { ...c, status: 'Open', assignee: mockAnalyst } : c));
    };

    const handleExportCSV = () => {
        const headers = ['ID', 'Passenger Name', 'PUID', 'Flight', 'Destination', 'Risk Score', 'Status', 'Primary Hit', 'Created At', 'Assignee', 'Resolution', 'Notes'];
        
        const rows = referrals.map(r => {
            // Combine hits into a single string for CSV
            const hitDetails = r.hits.map(h => `${h.type}: ${h.description}`).join(' | ');
            
            // Wrap fields in quotes to handle commas
            return [
                r.id,
                `"${r.passengerName}"`,
                r.puid,
                r.flightNumber,
                r.destinationAirport,
                r.totalRiskScore,
                r.status,
                `"${hitDetails}"`,
                r.createdAt,
                r.assignee || '',
                `"${r.resolution || ''}"`,
                `"${r.notes || ''}"`
            ].join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `referrals_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleResolve = (referralId: string, resolution: ReferralResolution, notes: string) => {
        const newStatus = resolution === 'Qualified-In (Action Taken)' ? 'Alert' : 'Closed';
        const referralToUpdate = referrals.find(r => r.id === referralId);
        if (!referralToUpdate) return;
        
        setReferrals(prev => prev.map(c => c.id === referralId ? { ...c, status: newStatus, resolution, notes, resolvedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : c));
        setResolvingReferral(null);

        if (newStatus === 'Alert') {
            const newNotification: AlertNotification = {
                id: `NOTIF-${referralId}`,
                referralId,
                passengerName: referralToUpdate.passengerName,
                flightNumber: referralToUpdate.flightNumber,
                destinationAirport: referralToUpdate.destinationAirport,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit'}),
                emailStatus: 'Queued',
                smsStatus: 'Queued',
            };
            setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);

            // Simulate delivery
            setTimeout(() => {
                setNotifications(prev => prev.map(n => n.id === newNotification.id ? { ...n, emailStatus: 'Sending', smsStatus: 'Sending' } : n));
            }, 1000);
             setTimeout(() => {
                setNotifications(prev => prev.map(n => n.id === newNotification.id ? { ...n, emailStatus: Math.random() > 0.05 ? 'Delivered' : 'Failed' } : n));
            }, 2500);
             setTimeout(() => {
                setNotifications(prev => prev.map(n => n.id === newNotification.id ? { ...n, smsStatus: Math.random() > 0.05 ? 'Delivered' : 'Failed' } : n));
            }, 3500);
        }
    };

    const ResolutionModal: React.FC<{ referralItem: Referral; onClose: () => void; onResolve: (referralId: string, resolution: ReferralResolution, notes: string) => void; }> = ({ referralItem, onClose, onResolve }) => {
        const [notes, setNotes] = useState('');

        return (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                <Card title={`Resolve Referral: ${referralItem.id}`} className="w-full max-w-lg animate-scale-in">
                    <p className="mb-4">Passenger: <span className="font-semibold">{referralItem.passengerName}</span></p>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Resolution Notes</label>
                            <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={4} className="mt-1 block w-full p-2 border border-gray-300 rounded-md"></textarea>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-between items-center">
                         <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                        <div className="flex space-x-3">
                            <button onClick={() => onResolve(referralItem.id, 'Qualified-Out (False Positive)', notes)} className="px-4 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-primary">Qualify-Out (False Positive)</button>
                            <button onClick={() => onResolve(referralItem.id, 'Qualified-In (Action Taken)', notes)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Qualify-In & Create Alert</button>
                        </div>
                    </div>
                </Card>
            </div>
        );
    };
    
    const ReferralCard: React.FC<{ referralItem: Referral }> = ({ referralItem }) => {
        const [isExpanded, setIsExpanded] = useState(false);
        const cardBorderColor = {
            Unqualified: 'border-red-500',
            Open: 'border-amber-400',
            Closed: 'border-green-500',
            Alert: 'border-red-700'
        };
        return (
            <div className={`p-4 bg-white rounded-lg shadow-md border-l-4 ${cardBorderColor[referralItem.status]} mb-3`}>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-brand-dark">{referralItem.passengerName}</p>
                        <p className="text-xs text-gray-500 font-mono">{referralItem.puid}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-extrabold text-2xl text-red-600">{referralItem.totalRiskScore}</p>
                        <p className="text-xs font-semibold text-red-700 -mt-1">RISK</p>
                    </div>
                </div>
                <div className="text-sm text-gray-700 my-2">
                    <button onClick={() => setIsExpanded(!isExpanded)} className="text-brand-secondary hover:underline text-xs w-full text-left">
                        {isExpanded ? 'Hide Hits' : `Show ${referralItem.hits.length} Hit(s)`}
                    </button>
                    {isExpanded && (
                        <ul className="mt-2 space-y-2 text-xs list-disc list-inside bg-gray-50 p-2 rounded-md">
                            {referralItem.hits.map(hit => (
                                <li key={hit.id}><span className="font-semibold">{hit.type}:</span> {hit.description} (+{hit.scoreContribution})</li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="text-xs text-gray-400 border-t pt-2 mt-2 flex justify-between items-center">
                    <span>Created: {referralItem.createdAt}</span>
                    {referralItem.assignee && <span>By: {referralItem.assignee}</span>}
                </div>
                {referralItem.status === 'Unqualified' && <button onClick={() => handleClaimAndOpen(referralItem.id)} className="w-full mt-3 px-3 py-1.5 bg-brand-secondary text-white text-xs font-bold rounded-md hover:bg-brand-primary">Claim & Open</button>}
                {referralItem.status === 'Open' && referralItem.assignee === mockAnalyst && <button onClick={() => setResolvingReferral(referralItem)} className="w-full mt-3 px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-md hover:bg-green-600">Resolve Referral</button>}
            </div>
        );
    };
    
    return (
        <div className="space-y-6">
            {resolvingReferral && <ResolutionModal referralItem={resolvingReferral} onClose={() => setResolvingReferral(null)} onResolve={handleResolve} />}

            <Card title="Human-in-the-Loop (HITL) Workflow Overview">
                 <div className="flex items-center justify-around text-center p-4">
                    <div className="flex flex-col items-center"><div className="w-16 h-16 bg-red-100 text-red-700 rounded-full flex items-center justify-center font-bold">1</div><p className="mt-2 font-semibold">Unqualified</p><p className="text-xs text-gray-500">Machine-generated queue</p></div>
                    <div className="flex-1 h-px bg-gray-300 mx-4"></div>
                    <div className="flex flex-col items-center"><div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold">2</div><p className="mt-2 font-semibold">Open</p><p className="text-xs text-gray-500">Analyst review in-progress</p></div>
                    <div className="flex-1 h-px bg-gray-300 mx-4"></div>
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold">3</div>
                        <p className="mt-2 font-semibold">Closed / Alert</p>
                        <p className="text-xs text-gray-500">Final human disposition</p>
                    </div>
                 </div>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Alerts for Intervention" className="bg-red-50 border-l-4 border-red-500">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-red-100">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-red-800 uppercase">Passenger</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-red-800 uppercase">Risk Score</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-red-800 uppercase">Primary Hit</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-red-800 uppercase">Verified By</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-red-800 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {referrals.filter(r => r.status === 'Alert').map(r => (
                                    <tr key={r.id}>
                                        <td className="px-4 py-3 font-medium">{r.passengerName}</td>
                                        <td className="px-4 py-3 font-bold text-red-600">{r.totalRiskScore}</td>
                                        <td className="px-4 py-3 text-sm">{r.hits[0].type}</td>
                                        <td className="px-4 py-3 text-sm">{r.assignee}</td>
                                        <td className="px-4 py-3"><button className="text-brand-secondary hover:underline text-sm font-semibold">View Details</button></td>
                                    </tr>
                                ))}
                                {referrals.filter(r => r.status === 'Alert').length === 0 && (
                                    <tr><td colSpan={5} className="text-center py-4 text-gray-500">No active alerts.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <Card title="Live Alert Notification Service" className="bg-blue-50 border-l-4 border-blue-500">
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
                        {notifications.map(n => (
                            <div key={n.id} className="p-3 bg-white rounded-lg shadow-sm border new-alert-row">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-brand-dark">{n.passengerName} / {n.flightNumber}</p>
                                        <p className="text-xs text-gray-500">Target: <span className="font-bold">{n.destinationAirport} Intervention Team</span></p>
                                    </div>
                                    <p className="text-xs text-gray-400 font-mono">{n.timestamp}</p>
                                </div>
                                <div className="mt-2 pt-2 border-t flex space-x-6">
                                    <NotificationStatusIndicator status={n.emailStatus} type="Email" />
                                    <NotificationStatusIndicator status={n.smsStatus} type="SMS" />
                                </div>
                            </div>
                        ))}
                        {notifications.length === 0 && <p className="text-center text-gray-500 py-10">No notifications sent.</p>}
                    </div>
                </Card>
            </div>


            <Card title={
                <div className="flex justify-between items-center">
                    <span>Risk Management Workflow</span>
                    <button 
                        onClick={handleExportCSV} 
                        className="flex items-center text-xs bg-brand-light text-brand-primary px-3 py-1.5 rounded border border-brand-secondary hover:bg-brand-secondary hover:text-white transition-colors font-semibold"
                    >
                        <DocumentArrowDownIcon className="h-4 w-4 mr-1.5" />
                        Export CSV
                    </button>
                </div>
            }>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="p-4 bg-red-50 rounded-lg"><p className="text-sm text-gray-500">Unqualified Referrals</p><p className="text-3xl font-bold text-status-red">{kpis.unqualified}</p></div>
                    <div className="p-4 bg-amber-50 rounded-lg"><p className="text-sm text-gray-500">Open (Under Review)</p><p className="text-3xl font-bold text-status-amber">{kpis.open}</p></div>
                    <div className="p-4 bg-red-100 rounded-lg"><p className="text-sm text-gray-500">Active Alerts</p><p className="text-3xl font-bold text-status-red">{kpis.alerts}</p></div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1"><Card title="Unqualified Referrals (Queue)" className="bg-gray-100"><div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">{referrals.filter(c => c.status === 'Unqualified').map(c => <ReferralCard key={c.id} referralItem={c} />)}</div></Card></div>
                <div className="lg:col-span-1"><Card title="Open (Under Review)" className="bg-gray-100"><div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">{referrals.filter(c => c.status === 'Open').map(c => <ReferralCard key={c.id} referralItem={c} />)}</div></Card></div>
                <div className="lg:col-span-1"><Card title="Closed" className="bg-gray-100"><div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">{referrals.filter(c => c.status === 'Closed').map(c => <div key={c.id} className="p-3 bg-white rounded-lg shadow-sm border-l-4 border-green-500"><p className="font-semibold text-sm text-gray-800">{c.passengerName}</p><p className="text-xs text-gray-500">{c.hits.map(h => h.type).join(', ')}</p><div className="text-xs text-gray-500 mt-2 pt-2 border-t">Resolved by {c.assignee} as <span className="font-bold">{c.resolution}</span> at {c.resolvedAt}</div></div>)}</div></Card></div>
            </div>
            
             <Card title="Live Event Manager & Referral Generation">
                 <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center min-h-[200px]">
                    <div className="space-y-2">
                        <h4 className="font-semibold text-center text-sm text-brand-dark">Incoming Events</h4>
                        {events.map(event => (
                            <div key={event.id} className="p-2 border bg-white rounded-md animate-scale-in">
                                <p className="text-xs font-semibold">{event.type}</p>
                                <p className="text-xs font-mono text-gray-500">{event.sourceId} @ {event.timestamp}</p>
                            </div>
                        ))}
                    </div>
                    <div className="text-center p-4">
                        <div className="p-4 bg-gray-100 border-2 border-dashed rounded-lg">
                            <h4 className="font-bold text-brand-primary">Risk Assessment Engine</h4>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 mx-auto my-2 text-brand-secondary ${processingEvent ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5m0 0L4 4m16 16L4 4" /></svg>
                            <p className="text-xs text-gray-500">{processingEvent ? 'Processing...' : 'Idle'}</p>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <h4 className="font-semibold text-center text-sm text-brand-dark">Outcome</h4>
                        {generatingReferral ? (
                             <div className="p-3 border-2 border-dashed border-red-300 bg-red-50 rounded-lg animate-pulse">
                                 <p className="text-center font-bold text-red-600">Referral Generated!</p>
                                 <p className="text-xs text-center text-red-500">{generatingReferral.passengerName}</p>
                             </div>
                        ) : (
                             <div className="p-3 border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg">
                                 <p className="text-center font-bold text-green-600">Processed - No Action</p>
                             </div>
                        )}
                    </div>
                 </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title={`My Active Referrals (${mockAnalyst})`}>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                        {referrals.filter(c => c.status === 'Open' && c.assignee === mockAnalyst).map(c => <ReferralCard key={c.id} referralItem={c} />)}
                    </div>
                </Card>
                <Card title="Recent Resolutions">
                     <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                        {referrals.filter(c => c.status === 'Closed').slice(0, 5).map(c => <div key={c.id} className="p-3 bg-gray-50 rounded-lg border flex justify-between items-center"><div className="flex-1"><p className="font-semibold text-brand-dark">{c.passengerName}</p><p className="text-sm text-gray-600">{c.hits.map(h => h.type).join(', ')}</p><p className="text-xs text-gray-400">Resolved by: {c.assignee}</p></div><div className="text-right"><span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-md">{c.resolution}</span><p className="text-xs text-gray-400 font-mono mt-1">{c.resolvedAt}</p></div></div>)}
                    </div>
                </Card>
            </div>
        </div>
    );
};
