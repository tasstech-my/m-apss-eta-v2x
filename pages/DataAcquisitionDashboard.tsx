import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/Card';
import type { DasSourceStatus, PnrPushSchedule, PnrPushInterval, PnrPushStatusValue, TravelerEvent, TravelerEventRecord, TravelerEventRecordType, NormalizationEvent, PrivacyFilterRule, PrivacyFilteringEvent } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DocumentTextIcon, IdentificationIcon, ArchiveBoxIcon, CodeBracketSquareIcon } from '../constants';

// --- MOCK DATA ---
const initialSourceStatus: DasSourceStatus[] = [
    { id: 'pnr', name: 'PNR Gateway Feed', type: 'PNR', status: 'Healthy', messagesPerMin: 1250, errorRate: 0.05 },
    { id: 'api', name: 'Batch DCS/API Feed', type: 'API/DCS', status: 'Healthy', messagesPerMin: 3400, errorRate: 0.12 },
    { id: 'app-stream', name: 'Real-time APP Stream', type: 'APP Stream', status: 'Healthy', messagesPerMin: 15230, errorRate: 0.02 },
    { id: 'watchlist', name: 'Watchlist DB Sync', type: 'Watchlist', status: 'Degraded', messagesPerMin: 5, errorRate: 2.5 },
];

const mockPassengersForCorrelation = [
    { name: 'John Doe', pnr: 'A1B2C3D', app: 'TR-123-APP', dcs: 'DCS-456', puid: 'PUID-1001' },
    { name: 'Jane Smith', pnr: 'E4F5G6H', app: 'TR-124-APP', dcs: 'DCS-457', puid: 'PUID-2034' },
    { name: 'Klaus Mueller', pnr: 'I7J8K9L', app: 'TR-125-APP', dcs: 'DCS-458', puid: 'PUID-8572' },
    { name: 'Sophie Durand', pnr: 'M0N1P2Q', app: 'TR-126-APP', dcs: 'DCS-459', puid: 'PUID-3491' },
];

const now = new Date();
const initialPnrSchedules: PnrPushSchedule[] = [
    { id: 'sch-1', flightNumber: 'MH370', route: 'KUL-PEK', departureTime: new Date(now.getTime() + 2 * 3600 * 1000), pushes: [ { interval: 'T-48h', status: 'Received' }, { interval: 'T-24h', status: 'Received' }, { interval: 'T-12h', status: 'Pending' }, { interval: 'T+30m', status: 'Pending' } ]},
    { id: 'sch-2', flightNumber: 'AK52', route: 'KUL-SIN', departureTime: new Date(now.getTime() + 8 * 3600 * 1000), pushes: [ { interval: 'T-48h', status: 'Received' }, { interval: 'T-24h', status: 'Pending' }, { interval: 'T-12h', status: 'Pending' }, { interval: 'T+30m', status: 'Pending' } ]},
    { id: 'sch-3', flightNumber: 'GA886', route: 'CGK-AMS', departureTime: new Date(now.getTime() - 26 * 3600 * 1000), pushes: [ { interval: 'T-48h', status: 'Received' }, { interval: 'T-24h', status: 'Missed' }, { interval: 'T-12h', status: 'Missed' }, { interval: 'T+30m', status: 'Received' } ]},
    { id: 'sch-4', flightNumber: 'SQ101', route: 'SIN-LHR', departureTime: new Date(now.getTime() + 50 * 3600 * 1000), pushes: [ { interval: 'T-48h', status: 'Pending' }, { interval: 'T-24h', status: 'Pending' }, { interval: 'T-12h', status: 'Pending' }, { interval: 'T+30m', status: 'Pending' } ]},
    { id: 'sch-5', flightNumber: 'QF12', route: 'SYD-LAX', departureTime: new Date(now.getTime() - 47 * 3600 * 1000), pushes: [ { interval: 'T-48h', status: 'Received' }, { interval: 'T-24h', status: 'Received' }, { interval: 'T-12h', status: 'Received' }, { interval: 'T+30m', status: 'Received' } ]},
];

const initialPrivacyRules: PrivacyFilterRule[] = [
    { id: 'GDPR-MED-01', jurisdiction: 'GDPR (EU)', field: 'SSR', keyword: 'WCHR', maskAs: 'MEDICAL', status: 'Active' },
    { id: 'PDPA-REL-01', jurisdiction: 'PDPA (Malaysia)', field: 'SSR', keyword: 'KSML', maskAs: 'RELIGIOUS', status: 'Active' },
    { id: 'GLOBAL-SENS-01', jurisdiction: 'Global', field: 'OSI', keyword: 'VIP', maskAs: 'SENSITIVE', status: 'Active' },
    { id: 'GDPR-MED-02', jurisdiction: 'GDPR (EU)', field: 'SSR', keyword: 'BLND', maskAs: 'MEDICAL', status: 'Inactive' },
];

const mockPnrSnippets = [
    { ssr: ['WCHR C TO GATE'] },
    { ssr: ['KSML FOR PAX 1'] },
    { osi: ['CTC PAX-VIP MR SMITH'] },
    { ssr: ['BLND PAX NEEDS ASSIST'] },
    { ssr: ['NONE'] },
];

// --- ICONS & UI COMPONENTS ---
const getStatusDot = (status: 'Healthy' | 'Degraded' | 'Offline') => {
    switch(status) {
        case 'Healthy': return 'bg-status-green';
        case 'Degraded': return 'bg-status-amber';
        case 'Offline': return 'bg-status-red';
        default: return 'bg-gray-400';
    }
};

const PnrPushStatusPill: React.FC<{ status: PnrPushStatusValue, interval: PnrPushInterval }> = ({ status, interval }) => {
    const styles: Record<PnrPushStatusValue, string> = {
        Pending: 'bg-gray-200 text-gray-700',
        Received: 'bg-green-100 text-green-800',
        Delayed: 'bg-amber-100 text-amber-800 animate-pulse',
        Missed: 'bg-red-100 text-red-800',
    };
    return (
        <div className="flex flex-col items-center">
            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${styles[status]}`}>{status}</span>
            <span className="text-[10px] text-gray-400 mt-1">{interval}</span>
        </div>
    );
};

const recordTypeIcons: Record<TravelerEventRecordType, (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element> = {
    PNR: DocumentTextIcon,
    APP: IdentificationIcon,
    DCS: ArchiveBoxIcon,
};

const RecordStatusPill: React.FC<{ record: TravelerEventRecord | null; type: TravelerEventRecordType }> = ({ record, type }) => {
    const Icon = recordTypeIcons[type];
    if (record) {
        return (
            <div className="p-2 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5 text-brand-secondary" />
                    <div>
                        <p className="font-semibold text-xs text-brand-dark">{type} Received</p>
                        <p className="font-mono text-[10px] text-gray-500">{record.id}</p>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="p-2 bg-gray-100 border border-dashed border-gray-300 rounded-md">
            <div className="flex items-center space-x-2 opacity-60">
                <Icon className="h-5 w-5 text-gray-400" />
                <div>
                    <p className="font-semibold text-xs text-gray-500">{type} Pending</p>
                    <p className="text-[10px] text-gray-400">Awaiting data...</p>
                </div>
            </div>
        </div>
    );
};

const ToggleSwitch: React.FC<{ enabled: boolean, onChange: (enabled: boolean) => void }> = ({ enabled, onChange }) => (
    <button
        type="button"
        className={`${enabled ? 'bg-brand-secondary' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2`}
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
    >
        <span
            aria-hidden="true"
            className={`${enabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
    </button>
);


export const DataAcquisitionDashboard: React.FC = () => {
    const [kpis, setKpis] = useState({ ingested: 2150430, profiles: 890123, successRate: 98.7, avgTime: 125 });
    const [sourceStatus, setSourceStatus] = useState<DasSourceStatus[]>(initialSourceStatus);
    const [travelerEvents, setTravelerEvents] = useState<TravelerEvent[]>([]);
    const [pnrSchedules, setPnrSchedules] = useState<PnrPushSchedule[]>(initialPnrSchedules);
    const [normalizationEvents, setNormalizationEvents] = useState<NormalizationEvent[]>([]);
    const [privacyRules, setPrivacyRules] = useState<PrivacyFilterRule[]>(initialPrivacyRules);
    const [privacyEvents, setPrivacyEvents] = useState<PrivacyFilteringEvent[]>([]);
    
    const [funnelData, setFunnelData] = useState(() => {
        const data = [];
        for (let i = 15; i >= 0; i--) {
            const rawPnr = 20000 + Math.random() * 5000;
            const rawApi = 40000 + Math.random() * 10000;
            data.push({
                time: `T-${i}s`,
                'Raw PNR': rawPnr,
                'Raw API/DCS': rawApi,
                'Correlated': (rawPnr + rawApi) * (0.95 + Math.random() * 0.04)
            });
        }
        return data;
    });
    
    const handleToggleRule = (ruleId: string) => {
        setPrivacyRules(rules =>
            rules.map(rule =>
                rule.id === ruleId
                    ? { ...rule, status: rule.status === 'Active' ? 'Inactive' : 'Active' }
                    : rule
            )
        );
    };

    useEffect(() => {
        const interval = setInterval(() => {
            // Update KPIs
            setKpis(prev => ({
                ingested: prev.ingested + Math.floor(Math.random() * 1000),
                profiles: prev.profiles + Math.floor(Math.random() * 20),
                successRate: Math.max(98.0, Math.min(99.5, prev.successRate + (Math.random() * 0.2 - 0.1))),
                avgTime: Math.max(110, Math.min(150, prev.avgTime + (Math.random() * 4 - 2)))
            }));

            // Update Funnel Chart
            setFunnelData(prev => {
                const rawPnr = 20000 + Math.random() * 5000;
                const rawApi = 40000 + Math.random() * 10000;
                const newPoint = {
                    time: 'Now',
                    'Raw PNR': rawPnr,
                    'Raw API/DCS': rawApi,
                    'Correlated': (rawPnr + rawApi) * (0.95 + Math.random() * 0.04)
                };
                return [...prev.slice(1), newPoint].map((d, i) => ({ ...d, time: i === 15 ? 'Now' : `T-${15-i}s`}));
            });

            // Update Traveler Event Correlation
            setTravelerEvents(prevEvents => {
                const newEvents = [...prevEvents];
                const chance = Math.random();

                if ((chance < 0.4 && newEvents.length < 8) || newEvents.length === 0) { // Create new event
                    const mock = mockPassengersForCorrelation[Math.floor(Math.random() * mockPassengersForCorrelation.length)];
                    const newEvent: TravelerEvent = {
                        id: `EVT-${Date.now()}`,
                        passengerName: mock.name,
                        pnrRecord: { type: 'PNR', id: mock.pnr, receivedAt: new Date().toLocaleTimeString() },
                        appRecord: null,
                        dcsRecord: null,
                        status: 'Partially Correlated',
                        puid: null,
                    };
                    return [newEvent, ...newEvents.slice(0, 7)];
                } else { // Update existing event
                    const updatable = newEvents.filter(e => e.status !== 'Fully Correlated');
                    if (updatable.length > 0) {
                        const eventToUpdate = updatable[Math.floor(Math.random() * updatable.length)];
                        const updatedEvent = { ...eventToUpdate };

                        if (!updatedEvent.appRecord) {
                            const mock = mockPassengersForCorrelation.find(p => p.name === updatedEvent.passengerName);
                            updatedEvent.appRecord = { type: 'APP', id: mock?.app || 'APP-UNKNOWN', receivedAt: new Date().toLocaleTimeString() };
                        } else if (!updatedEvent.dcsRecord) {
                            const mock = mockPassengersForCorrelation.find(p => p.name === updatedEvent.passengerName);
                            updatedEvent.dcsRecord = { type: 'DCS', id: mock?.dcs || 'DCS-UNKNOWN', receivedAt: new Date().toLocaleTimeString() };
                        }
                        
                        if (updatedEvent.pnrRecord && updatedEvent.appRecord && updatedEvent.dcsRecord) {
                            updatedEvent.status = 'Fully Correlated';
                            const mock = mockPassengersForCorrelation.find(p => p.name === updatedEvent.passengerName);
                            updatedEvent.puid = mock?.puid || 'PUID-UNKNOWN';
                        } else {
                            updatedEvent.status = 'Partially Correlated';
                        }
                        return newEvents.map(e => e.id === updatedEvent.id ? updatedEvent : e);
                    }
                }
                return newEvents;
            });
            
            // PNR Push Simulation
            setPnrSchedules(currentSchedules => currentSchedules.map(schedule => {
                const now = new Date();
                const updatedPushes = schedule.pushes.map(push => {
                    if (push.status === 'Received' || push.status === 'Missed') {
                        return push; // Don't change final states
                    }
                    
                    const intervalHours: Record<PnrPushInterval, number> = { 'T-48h': -48, 'T-24h': -24, 'T-12h': -12, 'T+30m': 0.5 };
                    const pushTime = new Date(schedule.departureTime.getTime() + intervalHours[push.interval] * 3600 * 1000);
                    const delayThreshold = new Date(pushTime.getTime() + 2 * 3600 * 1000); // 2-hour grace period for delay

                    // Fix: Explicitly type `newStatus` to `PnrPushStatusValue` to allow assignment of 'Missed'.
                    // The type was previously inferred as 'Pending' | 'Delayed' because of the early return for 'Received' and 'Missed'.
                    let newStatus: PnrPushStatusValue = push.status;
                    if (now > delayThreshold) {
                         newStatus = 'Missed';
                    } else if (now > pushTime) {
                         newStatus = 'Delayed';
                    } else {
                         newStatus = 'Pending';
                    }
                    
                    return { ...push, status: newStatus };
                });

                return { ...schedule, pushes: updatedPushes };
            }));

            // Data Normalization Simulation
            const rawFormats: NormalizationEvent['rawFormat'][] = ['IATA PNRGOV EDIFACT', 'Airline-Specific XML', 'JSON/API'];
            const newNormEvent: NormalizationEvent = {
                id: `NORM-${Date.now()}`,
                rawFormat: rawFormats[Math.floor(Math.random() * rawFormats.length)],
                rawContent: `MSGID${Math.floor(Math.random() * 9999)}...`,
                status: 'Ingesting',
            };
            setNormalizationEvents(prev => [newNormEvent, ...prev.slice(0, 5)]);
            
            setTimeout(() => {
                setNormalizationEvents(prev => prev.map(e => e.id === newNormEvent.id ? { ...e, status: 'Processing' } : e));
            }, 500);

            setTimeout(() => {
                setNormalizationEvents(prev => prev.map(e => {
                    if (e.id === newNormEvent.id) {
                        const isSuccess = Math.random() > 0.05;
                        if (isSuccess) {
                            return { 
                                ...e, 
                                status: 'Success', 
                                normalizedContent: `<TravelerRecord>\n  <PUID>PUID-${Math.floor(Math.random()*9999)}</PUID>\n  ...\n</TravelerRecord>` 
                            };
                        } else {
                             return { 
                                ...e, 
                                status: 'Failed', 
                                error: 'Invalid segment terminator' 
                            };
                        }
                    }
                    return e;
                }));
            }, 1500);

            // Data Privacy Simulation
            const snippet = mockPnrSnippets[Math.floor(Math.random() * mockPnrSnippets.length)];
            const activeRules = privacyRules.filter(r => r.status === 'Active');
            const detected: PrivacyFilteringEvent['detectedSensitive'] = [];
            
            activeRules.forEach(rule => {
                if (rule.field === 'SSR' && snippet.ssr) {
                    if (snippet.ssr.some(s => s.includes(rule.keyword))) {
                        detected.push({ field: 'SSR', keyword: rule.keyword });
                    }
                }
                if (rule.field === 'OSI' && snippet.osi) {
                     if (snippet.osi.some(s => s.includes(rule.keyword))) {
                        detected.push({ field: 'OSI', keyword: rule.keyword });
                    }
                }
            });

            if (detected.length > 0) {
                const newPrivacyEvent: PrivacyFilteringEvent = {
                    id: `PRIV-${Date.now()}`,
                    pnrSnippet: snippet,
                    detectedSensitive: detected,
                    status: 'Detecting'
                };
                setPrivacyEvents(prev => [newPrivacyEvent, ...prev.slice(0, 3)]);
                
                setTimeout(() => {
                    setPrivacyEvents(prev => prev.map(e => e.id === newPrivacyEvent.id ? { ...e, status: 'Filtering' } : e));
                }, 1000);
                
                setTimeout(() => {
                    const rule = activeRules.find(r => r.keyword === detected[0].keyword);
                    setPrivacyEvents(prev => prev.map(e => e.id === newPrivacyEvent.id ? { ...e, status: 'Sanitized', appliedRuleId: rule?.id } : e));
                }, 2000);
            }


        }, 2500);
        return () => clearInterval(interval);
    }, [privacyRules]);

    return (
        <div className="space-y-6">
            <Card title="Data Acquisition System Overview">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Records Ingested (24h)</p>
                        <p className="text-3xl font-bold text-brand-dark">{kpis.ingested.toLocaleString()}</p>
                    </div>
                     <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">New Profiles Created (24h)</p>
                        <p className="text-3xl font-bold text-brand-dark">{kpis.profiles.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Correlation Success Rate</p>
                        <p className={`text-3xl font-bold ${kpis.successRate > 98 ? 'text-status-green' : 'text-status-amber'}`}>{kpis.successRate.toFixed(2)}%</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Avg. Correlation Time</p>
                        <p className="text-3xl font-bold text-brand-dark">{kpis.avgTime.toFixed(0)} ms</p>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Live Data Privacy Filtering Engine">
                    <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-4 min-h-[250px]">
                        {/* Before */}
                        <div className="space-y-2">
                            <h4 className="font-semibold text-center text-brand-dark text-sm">Incoming PNR Snippets</h4>
                            {privacyEvents.map(event => (
                                <div key={event.id} className="p-2 border bg-white rounded-md h-20 animate-scale-in">
                                    {event.pnrSnippet.ssr && <p className="text-xs font-mono">SSR: {event.pnrSnippet.ssr.map(s => <span key={s} className="bg-amber-100 text-amber-800 rounded px-1">{s}</span>)}</p>}
                                    {event.pnrSnippet.osi && <p className="text-xs font-mono">OSI: {event.pnrSnippet.osi.map(s => <span key={s} className="bg-amber-100 text-amber-800 rounded px-1">{s}</span>)}</p>}
                                </div>
                            ))}
                        </div>
                        {/* Arrow */}
                        <div className="flex flex-col items-center h-full space-y-[76px] pt-8">
                           {privacyEvents.map(event => (
                                <svg key={event.id} className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                           ))}
                        </div>
                        {/* After */}
                        <div className="space-y-2">
                             <h4 className="font-semibold text-center text-brand-dark text-sm">Sanitized for Storage</h4>
                             {privacyEvents.map(event => {
                                 const rule = privacyRules.find(r => r.id === event.appliedRuleId);
                                 return (
                                     <div key={event.id} className="h-20">
                                        {event.status === 'Sanitized' && rule && (
                                            <div className="p-2 border bg-blue-50 border-blue-200 rounded-md h-full animate-scale-in">
                                                {event.pnrSnippet.ssr && <p className="text-xs font-mono">SSR: <span className="bg-blue-200 text-blue-800 rounded px-1">[MASKED_{rule.maskAs}]</span></p>}
                                                {event.pnrSnippet.osi && <p className="text-xs font-mono">OSI: <span className="bg-blue-200 text-blue-800 rounded px-1">[MASKED_{rule.maskAs}]</span></p>}
                                                <p className="text-[10px] text-gray-500 mt-1">Rule Applied: <span className="font-semibold">{rule.id}</span></p>
                                            </div>
                                        )}
                                     </div>
                                 );
                             })}
                        </div>
                    </div>
                </Card>
                <Card title="Configurable Privacy Filtering Rules">
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                        {privacyRules.map(rule => (
                            <div key={rule.id} className={`p-2 border rounded-md grid grid-cols-[1fr_auto] gap-4 items-center ${rule.status === 'Active' ? 'bg-white' : 'bg-gray-100 opacity-70'}`}>
                                <div>
                                    <p className="font-semibold text-sm text-brand-dark">{rule.id} <span className="font-normal text-xs text-gray-500">({rule.jurisdiction})</span></p>
                                    <p className="text-xs font-mono text-gray-600">
                                        IF <span className="bg-gray-200 px-1 rounded">{rule.field}</span> contains "<span className="bg-gray-200 px-1 rounded">{rule.keyword}</span>" THEN MASK AS <span className="bg-gray-200 px-1 rounded">{rule.maskAs}</span>
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className={`text-xs font-bold ${rule.status === 'Active' ? 'text-green-600' : 'text-gray-500'}`}>{rule.status}</span>
                                    <ToggleSwitch enabled={rule.status === 'Active'} onChange={() => handleToggleRule(rule.id)} />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            <Card title="Live PNR Push Schedule Monitoring">
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                    {pnrSchedules.map(schedule => (
                        <div key={schedule.id} className="p-3 bg-gray-50 rounded-lg border grid grid-cols-[1fr_2fr] items-center">
                            <div>
                                <p className="font-bold text-brand-dark">{schedule.flightNumber} <span className="font-normal text-gray-600 text-sm">({schedule.route})</span></p>
                                <p className="text-xs text-gray-500">Departs: {schedule.departureTime.toLocaleString()}</p>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {schedule.pushes.map(push => (
                                    <PnrPushStatusPill key={push.interval} status={push.status} interval={push.interval} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Live Traveler Event Correlation">
                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                        {travelerEvents.map(event => {
                            const statusStyles = {
                                'Awaiting Data': 'bg-gray-100 text-gray-800',
                                'Partially Correlated': 'bg-blue-100 text-blue-800 animate-pulse',
                                'Fully Correlated': 'bg-green-100 text-green-800',
                            };
                            return (
                                <div key={event.id} className="p-3 border rounded-lg bg-white shadow-sm new-alert-row">
                                    <div className="flex justify-between items-start">
                                        <p className="font-bold text-brand-dark">{event.passengerName}</p>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[event.status]}`}>{event.status}</span>
                                    </div>
                                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <RecordStatusPill record={event.pnrRecord} type="PNR" />
                                        <RecordStatusPill record={event.appRecord} type="APP" />
                                        <RecordStatusPill record={event.dcsRecord} type="DCS" />
                                    </div>
                                    {event.status === 'Fully Correlated' && (
                                        <div className="mt-3 pt-3 border-t flex items-center justify-center space-x-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                            <p className="text-sm">PUID Assigned:</p>
                                            <p className="font-mono font-bold text-green-700 bg-green-100 px-2 py-1 rounded">{event.puid}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {travelerEvents.length === 0 && <p className="text-center text-gray-500 py-4">Waiting for correlation events...</p>}
                    </div>
                </Card>

                <Card title="Data Source Health & Throughput">
                     <div className="space-y-3">
                        {sourceStatus.map(source => (
                            <div key={source.id} className="p-3 bg-gray-50 rounded-lg border flex items-center">
                                <div className={`w-3 h-3 rounded-full flex-shrink-0 mr-4 ${getStatusDot(source.status)}`}></div>
                                <div className="flex-1">
                                    <p className="font-semibold text-brand-dark">{source.name}</p>
                                    <p className={`text-sm font-bold ${source.status === 'Healthy' ? 'text-status-green' : 'text-status-amber'}`}>{source.status}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono font-bold text-brand-dark">{source.messagesPerMin.toLocaleString()} <span className="text-xs text-gray-500 font-sans">msg/min</span></p>
                                    <p className={`text-xs ${source.errorRate > 1 ? 'text-red-500' : 'text-gray-500'}`}>{source.errorRate.toFixed(2)}% error rate</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
            
            <Card title="Live Data Ingestion Funnel (Records/Second)">
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={funnelData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="Raw PNR" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                        <Area type="monotone" dataKey="Raw API/DCS" stackId="1" stroke="#1e3a8a" fill="#1e3a8a" />
                        <Area type="monotone" dataKey="Correlated" stroke="#10b981" fill="#10b981" opacity={0.5} />
                    </AreaChart>
                </ResponsiveContainer>
            </Card>

            <Card title="Live Data Normalization Pipeline">
                <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                    {/* Raw Records */}
                    <div className="space-y-2">
                        <h4 className="font-semibold text-center text-brand-dark">Raw Ingested Records</h4>
                        {normalizationEvents.map(event => (
                             <div key={event.id} className={`p-2 rounded-md transition-all duration-300 ${event.status === 'Failed' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'} border`}>
                                <p className="font-mono text-xs text-gray-700 truncate">{event.rawContent}</p>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-[10px] bg-gray-200 text-gray-800 font-semibold px-1.5 py-0.5 rounded">{event.rawFormat}</span>
                                    {event.status === 'Failed' && <span className="text-xs font-bold text-red-600">Parse Failed</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Engine */}
                    <div className="flex flex-col items-center space-y-4 px-4">
                        {normalizationEvents.map(event => (
                            <div key={event.id} className="h-[62px] flex items-center">
                                <div className="w-1 h-1 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: `${Math.random() * 0.5}s` }}></div>
                                <div className="w-8 h-px bg-gray-300"></div>
                                 <div className="w-1 h-1 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: `${Math.random() * 0.5 + 0.2}s` }}></div>
                                <div className="w-8 h-px bg-gray-300"></div>
                                <div className="w-1 h-1 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: `${Math.random() * 0.5 + 0.4}s` }}></div>
                            </div>
                        ))}
                        <Card className="text-center w-48 relative -mt-[372px] bg-white/80 backdrop-blur-sm">
                            <h4 className="font-bold text-brand-primary">Normalization Engine</h4>
                            <p className="text-xs text-gray-500">Records/sec: ~{(200 + Math.random() * 50).toFixed(0)}</p>
                            <p className="text-xs text-green-600">Success: 99.8%</p>
                        </Card>
                    </div>
                    {/* Normalized Output */}
                    <div className="space-y-2">
                         <h4 className="font-semibold text-center text-brand-dark">Standardized XML Output</h4>
                         {normalizationEvents.map(event => (
                             <div key={event.id} className="h-[62px]">
                                {event.status === 'Success' && event.normalizedContent && (
                                    <div className="p-2 bg-green-50 border border-green-200 rounded-md h-full animate-scale-in">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] bg-green-200 text-green-800 font-semibold px-1.5 py-0.5 rounded">M-APSS Standard XML</span>
                                            <CodeBracketSquareIcon className="h-4 w-4 text-green-600" />
                                        </div>
                                        <pre className="text-xs text-gray-700 truncate">{event.normalizedContent.replace(/\n/g, ' ')}</pre>
                                    </div>
                                )}
                            </div>
                         ))}
                    </div>
                </div>
            </Card>
        </div>
    );
};