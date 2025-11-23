
import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '../components/Card';
import { DocumentTextIcon, MagnifyingGlassIcon, EyeIcon, CursorArrowRaysIcon, PencilSquareIcon, LockClosedIcon, CircleStackIcon, CheckCircleIcon } from '../constants';
import type { AuditLogEntry, AuditStorageStats } from '../types';

// --- MOCK DATA ---
const mockAuditLogs: AuditLogEntry[] = [
    { id: 'AUD-9901', timestamp: '2023-10-28 14:30:05', user: 'admin.user', role: 'System Administrator', module: 'User Management', action: 'Action: Modify Role', outcome: 'Success', details: 'Added "View PNR" to "L1 Analyst" role.', ipAddress: '192.168.1.10' },
    { id: 'AUD-9902', timestamp: '2023-10-28 14:15:22', user: 'analyst.jane', role: 'Risk Analyst', module: 'Risk Manager', action: 'Action: Resolve Referral', outcome: 'Success', details: 'Qualified-In Referral REF-006. Created Alert.', ipAddress: '192.168.1.45' },
    { id: 'AUD-9903', timestamp: '2023-10-28 14:10:00', user: 'officer.tan', role: 'BOC Officer', module: 'Border Ops Center', action: 'Action: Override Decision', outcome: 'Success', details: 'Manually cleared passenger PUID-7744 after fuzzy match review.', ipAddress: '10.5.2.22' },
    { id: 'AUD-9904', timestamp: '2023-10-28 13:55:11', user: 'system', role: 'System', module: 'Data Acquisition', action: 'Action: PNR Ingestion', outcome: 'Failure', details: 'Failed to parse batch file BATCH_20231028_01.xml. Syntax error on line 405.', ipAddress: 'localhost' },
    { id: 'AUD-9905', timestamp: '2023-10-28 13:40:33', user: 'analyst.mike', role: 'Risk Analyst', module: 'Link Analysis', action: 'Action: Export Graph', outcome: 'Success', details: 'Exported network graph for Case CASE-2023-001 to PDF.', ipAddress: '192.168.1.46' },
    { id: 'AUD-9908', timestamp: '2023-10-28 13:38:12', user: 'analyst.mike', role: 'Risk Analyst', module: 'Link Analysis', action: 'View: Entity Details', outcome: 'Success', details: 'Viewed detailed profile for Node: Omar Al-Masri', ipAddress: '192.168.1.46' },
    { id: 'AUD-9909', timestamp: '2023-10-28 13:35:00', user: 'analyst.mike', role: 'Risk Analyst', module: 'Navigation', action: 'Nav: Link Analysis', outcome: 'Success', details: 'Selected menu item: "Link Detection / Analysis"', ipAddress: '192.168.1.46' },
    { id: 'AUD-9906', timestamp: '2023-10-28 13:30:15', user: 'admin.user', role: 'System Administrator', module: 'System Config', action: 'Action: Update Policy', outcome: 'Success', details: 'Increased minimum password length to 12 characters.', ipAddress: '192.168.1.10' },
    { id: 'AUD-9907', timestamp: '2023-10-28 13:15:00', user: 'unknown', role: 'N/A', module: 'Authentication', action: 'Action: Login Attempt', outcome: 'Failure', details: 'Invalid password for user "admin.backup".', ipAddress: '203.0.113.45' },
    { id: 'AUD-9910', timestamp: '2023-10-28 13:10:22', user: 'officer.tan', role: 'BOC Officer', module: 'Border Ops Center', action: 'View: Case Details', outcome: 'Success', details: 'Opened case view for BOC-1698480123', ipAddress: '10.5.2.22' },
];

const ActionTypeIcon: React.FC<{ action: string }> = ({ action }) => {
    if (action.startsWith('View:')) return <span title="Read/View"><EyeIcon className="h-4 w-4 text-blue-500" /></span>;
    if (action.startsWith('Nav:')) return <span title="Navigation"><CursorArrowRaysIcon className="h-4 w-4 text-gray-500" /></span>;
    return <span title="Action/Write"><PencilSquareIcon className="h-4 w-4 text-amber-600" /></span>;
};

export const AuditLogsDashboard: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [moduleFilter, setModuleFilter] = useState('All');
    const [userFilter, setUserFilter] = useState('All');
    const [outcomeFilter, setOutcomeFilter] = useState('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
    const [storageStats, setStorageStats] = useState<AuditStorageStats>({
        totalEventsStored: '12.4 Billion',
        storageUsed: '8.5 TB',
        ingestRate: 1450,
        wormStatus: 'Active',
        lastIntegrityCheck: '10 mins ago'
    });
    const [verifyStatus, setVerifyStatus] = useState<'Idle' | 'Verifying' | 'Verified'>('Idle');

    useEffect(() => {
        const interval = setInterval(() => {
            setStorageStats(prev => ({
                ...prev,
                ingestRate: Math.floor(1400 + Math.random() * 200) // Fluctuate between 1400-1600
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const uniqueModules = useMemo(() => Array.from(new Set(mockAuditLogs.map(l => l.module))), []);
    const uniqueUsers = useMemo(() => Array.from(new Set(mockAuditLogs.map(l => l.user))), []);

    const filteredLogs = useMemo(() => {
        return mockAuditLogs.filter(log => {
            const matchesSearch = log.details.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  log.action.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesModule = moduleFilter === 'All' || log.module === moduleFilter;
            const matchesUser = userFilter === 'All' || log.user === userFilter;
            const matchesOutcome = outcomeFilter === 'All' || log.outcome === outcomeFilter;

            // Simple mock date filtering
            let matchesDate = true;
            if (startDate || endDate) {
                const logDate = new Date(log.timestamp.replace(' ', 'T')); // basic parse
                if (startDate && new Date(startDate) > logDate) matchesDate = false;
                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59);
                    if (end < logDate) matchesDate = false;
                }
            }

            return matchesSearch && matchesModule && matchesUser && matchesOutcome && matchesDate;
        });
    }, [searchTerm, moduleFilter, userFilter, outcomeFilter, startDate, endDate]);

    const handleVerifyIntegrity = () => {
        setVerifyStatus('Verifying');
        setTimeout(() => {
            setVerifyStatus('Verified');
        }, 1500);
    };

    // Reset verify status when closing modal
    const handleCloseModal = () => {
        setSelectedLog(null);
        setVerifyStatus('Idle');
    };

    return (
        <div className="space-y-6">
             {selectedLog && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <Card title="Audit Log Detail" className="w-full max-w-2xl animate-scale-in">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-gray-500 block">Log ID</span><span className="font-mono font-bold">{selectedLog.id}</span></div>
                                <div><span className="text-gray-500 block">Timestamp</span><span className="font-mono">{selectedLog.timestamp}</span></div>
                                <div><span className="text-gray-500 block">User</span><span className="font-semibold text-brand-dark">{selectedLog.user}</span></div>
                                <div><span className="text-gray-500 block">Role</span><span>{selectedLog.role}</span></div>
                                <div><span className="text-gray-500 block">Module</span><span className="bg-gray-100 px-2 py-0.5 rounded">{selectedLog.module}</span></div>
                                <div><span className="text-gray-500 block">IP Address</span><span className="font-mono">{selectedLog.ipAddress}</span></div>
                            </div>
                            
                            <div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Activity & Outcome</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <ActionTypeIcon action={selectedLog.action} />
                                        <span className="font-bold text-lg">{selectedLog.action}</span>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${selectedLog.outcome === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {selectedLog.outcome}
                                    </span>
                                </div>
                            </div>

                             {/* Cryptographic Integrity Section */}
                             <div className="bg-slate-900 p-4 rounded-lg text-white border border-slate-700">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-xs font-bold uppercase text-slate-400 flex items-center">
                                        <LockClosedIcon className="h-4 w-4 mr-1" />
                                        Immutable Record Verification
                                    </h4>
                                    {verifyStatus === 'Verified' && (
                                        <span className="text-xs font-bold text-green-400 flex items-center">
                                            <CheckCircleIcon className="h-4 w-4 mr-1" /> Validated against WORM
                                        </span>
                                    )}
                                </div>
                                
                                <div className="font-mono text-[10px] text-slate-400 break-all space-y-1">
                                    <p>Digital Signature: 8f9d...a2b1</p>
                                    <p>Chain Hash: 3e4f...9c8d</p>
                                </div>

                                <div className="mt-3 pt-3 border-t border-slate-700">
                                    <button 
                                        onClick={handleVerifyIntegrity}
                                        disabled={verifyStatus !== 'Idle'}
                                        className={`w-full py-2 text-sm font-bold rounded transition-all flex items-center justify-center ${
                                            verifyStatus === 'Idle' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 
                                            verifyStatus === 'Verifying' ? 'bg-slate-700 text-slate-300 cursor-wait' : 
                                            'bg-green-600 text-white cursor-default'
                                        }`}
                                    >
                                        {verifyStatus === 'Idle' && 'Verify Integrity'}
                                        {verifyStatus === 'Verifying' && 'Verifying Cryptographic Seal...'}
                                        {verifyStatus === 'Verified' && '✓ Verified: Record is Authentic & Unchanged'}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-bold text-gray-700 mb-2">Event Details (JSON Payload)</p>
                                <pre className="bg-slate-100 text-slate-800 p-4 rounded-lg text-xs font-mono overflow-x-auto border">
{JSON.stringify({
  event_id: selectedLog.id,
  timestamp_utc: new Date(selectedLog.timestamp).toISOString(),
  actor: {
    username: selectedLog.user,
    role: selectedLog.role,
    ip: selectedLog.ipAddress
  },
  target: {
    module: selectedLog.module,
    action_type: selectedLog.action.split(':')[0],
    action_name: selectedLog.action.split(':')[1]?.trim()
  },
  result: {
    status: selectedLog.outcome,
    message: selectedLog.details
  }
}, null, 2)}
                                </pre>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={handleCloseModal} className="px-4 py-2 bg-brand-secondary text-white rounded hover:bg-brand-primary">Close</button>
                        </div>
                    </Card>
                </div>
            )}

            <Card className="bg-slate-800 text-white border-l-4 border-brand-secondary">
                <div className="flex items-center">
                    <DocumentTextIcon className="h-8 w-8 text-brand-secondary mr-4" />
                    <div>
                        <h2 className="text-2xl font-bold">Exhaustive System Accountability</h2>
                        <p className="text-slate-400 text-sm mt-1">
                            Complete forensic trail of <strong>every</strong> user interaction: Menu Selections (Navigation), Entity Views (Reads), and Data Modifications (Actions).
                        </p>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="col-span-1 md:col-span-4">
                    <Card title="Secure Audit Storage System (WORM-Compliant)" className="bg-slate-900 text-white border border-slate-700">
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                            <div className="p-3 bg-slate-800 rounded-lg border border-slate-600">
                                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Storage Compliance</p>
                                <div className="flex items-center justify-center text-green-400 font-bold text-lg">
                                    <LockClosedIcon className="h-5 w-5 mr-2" />
                                    {storageStats.wormStatus} (WORM)
                                </div>
                            </div>
                             <div className="p-3 bg-slate-800 rounded-lg border border-slate-600">
                                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Total Events Stored</p>
                                <div className="flex items-center justify-center text-blue-400 font-bold text-2xl">
                                    <CircleStackIcon className="h-6 w-6 mr-2" />
                                    {storageStats.totalEventsStored}
                                </div>
                            </div>
                             <div className="p-3 bg-slate-800 rounded-lg border border-slate-600">
                                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Storage Volume</p>
                                <p className="text-2xl font-bold text-purple-400">{storageStats.storageUsed}</p>
                            </div>
                             <div className="p-3 bg-slate-800 rounded-lg border border-slate-600">
                                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Live Ingest Rate</p>
                                <p className="text-2xl font-bold text-white">{storageStats.ingestRate} <span className="text-sm text-slate-400 font-normal">events/sec</span></p>
                            </div>
                         </div>
                         <div className="mt-4 text-center">
                             <p className="text-xs text-slate-500">Last Integrity Check: <span className="text-green-500 font-mono">{storageStats.lastIntegrityCheck}</span> • All Shards Valid</p>
                         </div>
                    </Card>
                </div>
            </div>

            <Card title="High-Speed Forensic Search">
                <div className="space-y-4">
                    {/* Granular Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="col-span-2">
                             <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Keywords (Action/Details)</label>
                             <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="e.g., 'Failed', 'PNR-123', 'Delete'..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 block w-full p-2 border border-gray-300 rounded-md focus:ring-brand-secondary focus:border-brand-secondary"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Target Module</label>
                            <select 
                                value={moduleFilter} 
                                onChange={(e) => setModuleFilter(e.target.value)} 
                                className="w-full p-2 border border-gray-300 rounded-md bg-white"
                            >
                                <option value="All">All Modules</option>
                                {uniqueModules.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">User / Actor</label>
                            <select 
                                value={userFilter} 
                                onChange={(e) => setUserFilter(e.target.value)} 
                                className="w-full p-2 border border-gray-300 rounded-md bg-white"
                            >
                                <option value="All">All Users</option>
                                {uniqueUsers.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end border-t pt-4">
                         <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Start Date</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border rounded text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">End Date</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 border rounded text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Outcome</label>
                            <select value={outcomeFilter} onChange={e => setOutcomeFilter(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm">
                                <option value="All">All Outcomes</option>
                                <option value="Success">Success</option>
                                <option value="Failure">Failure</option>
                            </select>
                        </div>
                         <button 
                            className="w-full py-2 bg-brand-secondary text-white font-bold rounded hover:bg-brand-primary transition-colors flex items-center justify-center shadow-sm"
                        >
                            <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                            Execute Search
                        </button>
                    </div>
                </div>
            </Card>

            <Card title={`Search Results (${filteredLogs.length})`}>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Module</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activity Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outcome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">View</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredLogs.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{log.timestamp}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.user}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.module}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                        <div className="flex items-center space-x-2">
                                            <ActionTypeIcon action={log.action} />
                                            <span>{log.action}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${log.outcome === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {log.outcome}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" title={log.details}>
                                        {log.details}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button onClick={() => setSelectedLog(log)} className="text-brand-secondary hover:text-brand-primary">Inspect</button>
                                    </td>
                                </tr>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-gray-500">No logs found matching current filters.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
