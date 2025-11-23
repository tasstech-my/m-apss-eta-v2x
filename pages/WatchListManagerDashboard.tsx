import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/Card';
import type { WatchList, WatchListEntry, WatchListActivity } from '../types';
import { ShieldCheckIcon, ShieldExclamationIcon, DocumentCheckIcon } from '../constants';

// MOCK DATA
const initialWatchLists: WatchList[] = [
    { id: 'wl-01', name: 'No-Fly List', type: 'Black List', description: 'Individuals prohibited from boarding flights.', entryCount: 2, priority: 'High' },
    { id: 'wl-02', name: 'Known Smugglers', type: 'Black List', description: 'Individuals with a history of smuggling.', entryCount: 1, priority: 'Medium' },
    { id: 'wl-03', name: 'VIPs & Diplomats', type: 'White List', description: 'Trusted individuals to prevent false positives.', entryCount: 1, priority: 'Low' },
    { id: 'wl-04', name: 'Resolved False Positives', type: 'Cleared Document List', description: 'Documents cleared against previous fuzzy hits.', entryCount: 1, priority: 'Low' },
];

const initialEntries: WatchListEntry[] = [
    { id: 'entry-001', listId: 'wl-01', fullName: 'JOHN SMITH', dob: '1980-01-15', documentType: 'Passport', documentNumber: 'A12345678', reason: 'National Security Threat', addedBy: 'Admin', addedOn: '2023-01-10' },
    { id: 'entry-002', listId: 'wl-01', fullName: 'MARIA GARCIA', dob: '1992-05-20', documentType: 'Passport', documentNumber: 'B87654321', reason: 'Confirmed link to terrorist organization.', addedBy: 'Admin', addedOn: '2023-02-20' },
    { id: 'entry-003', listId: 'wl-02', fullName: 'WEI CHEN', dob: '1975-11-30', documentType: 'National ID', documentNumber: 'CN456789123', reason: 'Convicted of narcotics trafficking.', addedBy: 'Analyst 1', addedOn: '2023-03-05' },
    { id: 'entry-004', listId: 'wl-03', fullName: 'AMBASSADOR TAN', dob: '1965-03-22', documentType: 'Passport', documentNumber: 'D1234567', reason: 'Diplomatic Immunity - Suppress low-level hits.', addedBy: 'Admin', addedOn: '2023-04-12' },
    { id: 'entry-005', listId: 'wl-04', fullName: 'JON SMYTHE', dob: '1980-01-16', documentType: 'Passport', documentNumber: 'A12345679', reason: '', clearedAgainst: 'JOHN SMITH (wl-01)', addedBy: 'BOC Officer', addedOn: '2023-05-18' },
];

const EntryModal: React.FC<{
    entry: Partial<WatchListEntry> | null;
    listId: string;
    listType: WatchList['type'];
    onClose: () => void;
    onSave: (entry: WatchListEntry) => void;
}> = ({ entry, listId, listType, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<WatchListEntry>>(entry || { listId });
    const isEditing = !!entry?.id;
    const isClearedList = listType === 'Cleared Document List';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalEntry: WatchListEntry = {
            id: formData.id || `entry-${Date.now()}`,
            listId,
            fullName: formData.fullName || '',
            dob: formData.dob || '',
            documentType: formData.documentType || 'Passport',
            documentNumber: formData.documentNumber || '',
            reason: formData.reason || '',
            clearedAgainst: formData.clearedAgainst,
            addedBy: 'Admin', // In real app, get current user
            addedOn: formData.addedOn || new Date().toISOString().split('T')[0],
        };
        onSave(finalEntry);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <Card title={isEditing ? 'Edit Watch List Entry' : 'Add New Entry'} className="w-full max-w-lg animate-scale-in">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="fullName" value={formData.fullName || ''} onChange={handleChange} placeholder="Full Name (SURNAME, Given)" required className="w-full p-2 border rounded" />
                    <input type="date" name="dob" value={formData.dob || ''} onChange={handleChange} required className="w-full p-2 border rounded" />
                    <select name="documentType" value={formData.documentType || 'Passport'} onChange={handleChange} className="w-full p-2 border rounded">
                        <option>Passport</option><option>National ID</option><option>Other</option>
                    </select>
                    <input type="text" name="documentNumber" value={formData.documentNumber || ''} onChange={handleChange} placeholder="Document Number" required className="w-full p-2 border rounded" />
                    
                    {isClearedList ? (
                         <div>
                            <label htmlFor="clearedAgainst" className="block text-sm font-medium text-gray-700">Cleared Against Watchlist Hit</label>
                            <input type="text" id="clearedAgainst" name="clearedAgainst" value={formData.clearedAgainst || ''} onChange={handleChange} placeholder="e.g., JOHN SMITH (wl-01)" required className="w-full p-2 border rounded" />
                            <p className="mt-1 text-xs text-gray-500">Link this entry to the original watchlist target that caused the false positive match.</p>
                         </div>
                    ) : (
                        <div>
                            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason for Inclusion</label>
                            <textarea id="reason" name="reason" value={formData.reason || ''} onChange={handleChange} placeholder="Reason for inclusion..." required className="w-full p-2 border rounded" rows={3}></textarea>
                        </div>
                    )}
                    <div className="flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-brand-secondary text-white rounded">Save Entry</button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export const WatchListManagerDashboard: React.FC = () => {
    const [watchLists, setWatchLists] = useState<WatchList[]>(initialWatchLists);
    const [entries, setEntries] = useState<WatchListEntry[]>(initialEntries);
    const [selectedListId, setSelectedListId] = useState<string>('wl-01');
    const [activityLog, setActivityLog] = useState<WatchListActivity[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<WatchListEntry | null>(null);

    const logActivity = (action: string) => {
        const newActivity: WatchListActivity = {
            id: `act-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            user: 'Admin',
            action,
        };
        setActivityLog(prev => [newActivity, ...prev.slice(0, 5)]);
    };

    const handleSaveEntry = (entry: WatchListEntry) => {
        if (editingEntry) {
            setEntries(prev => prev.map(e => e.id === entry.id ? entry : e));
            logActivity(`Updated entry for ${entry.fullName} in list ${selectedListId}`);
        } else {
            setEntries(prev => [entry, ...prev]);
            logActivity(`Added new entry for ${entry.fullName} to list ${selectedListId}`);
        }
        setIsModalOpen(false);
        setEditingEntry(null);
    };

    const handleDeleteEntry = (entryId: string) => {
        if (window.confirm('Are you sure you want to delete this entry?')) {
            const entry = entries.find(e => e.id === entryId);
            setEntries(prev => prev.filter(e => e.id !== entryId));
            logActivity(`Deleted entry ${entry?.fullName} from list ${selectedListId}`);
        }
    };

    const selectedList = useMemo(() => watchLists.find(l => l.id === selectedListId), [watchLists, selectedListId]);

    const filteredEntries = useMemo(() => {
        return entries.filter(entry =>
            entry.listId === selectedListId &&
            (entry.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             entry.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [entries, selectedListId, searchTerm]);
    
    const kpis = useMemo(() => {
        const totalEntries = entries.length;
        const noFlyEntries = entries.filter(e => e.listId === 'wl-01').length;
        return {
            totalLists: watchLists.length,
            totalEntries,
            noFlyEntries
        };
    }, [watchLists, entries]);

    const listTypeDetails: Record<WatchList['type'], { icon: React.FC<any>, color: string, badgeColor: string }> = {
        'Black List': { icon: ShieldExclamationIcon, color: 'border-red-500', badgeColor: 'bg-red-200 text-red-800' },
        'White List': { icon: ShieldCheckIcon, color: 'border-green-500', badgeColor: 'bg-green-200 text-green-800' },
        'Cleared Document List': { icon: DocumentCheckIcon, color: 'border-blue-500', badgeColor: 'bg-blue-200 text-blue-800' },
    };

    return (
        <div className="space-y-6">
            {isModalOpen && selectedList && <EntryModal entry={editingEntry} listId={selectedListId} listType={selectedList.type} onClose={() => { setIsModalOpen(false); setEditingEntry(null); }} onSave={handleSaveEntry} />}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <Card title="Total Watch Lists"><p className="text-3xl font-bold">{kpis.totalLists}</p></Card>
                <Card title="Total Entries"><p className="text-3xl font-bold">{kpis.totalEntries.toLocaleString()}</p></Card>
                <Card title="High-Priority ('No-Fly') Entries"><p className="text-3xl font-bold text-status-red">{kpis.noFlyEntries.toLocaleString()}</p></Card>
            </div>

            <Card title="Understanding List Types">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <h4 className="font-bold text-red-800">Black List</h4>
                        <p>Known high-risk individuals. A match triggers a high-priority alert or a "Do Not Board" directive.</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-bold text-green-800">White List</h4>
                        <p>Trusted individuals (VIPs, diplomats). A match suppresses other potential "fuzzy" hits to reduce false positives.</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-bold text-blue-800">Cleared Document List</h4>
                        <p>An operational tool to manage false positives. When a traveler is cleared against a fuzzy hit, their document is added here. The <strong>Risk Manager</strong> will use this list to automatically qualify-out and suppress the same false positive in the future.</p>
                    </div>
                </div>
            </Card>

            <Card title="Cleared Document Workflow">
                <p className="text-sm text-gray-600 mb-4">
                    Use this workflow to prevent future false positive alerts for innocent travelers who were incorrectly matched against a watch list. Add the traveler's specific document to the Cleared Document List to automatically suppress future fuzzy hits.
                </p>
                <button 
                    onClick={() => {
                        setSelectedListId('wl-04'); // ID of the 'Resolved False Positives' list
                        setEditingEntry(null);
                        setIsModalOpen(true);
                    }} 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
                >
                    Add Cleared Document
                </button>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <Card title="Watch Lists">
                        <div className="space-y-2">
                            {watchLists.map(list => {
                                const details = listTypeDetails[list.type];
                                return (
                                <div key={list.id} onClick={() => setSelectedListId(list.id)}
                                     className={`p-3 rounded-lg border-l-4 cursor-pointer transition-all ${selectedListId === list.id ? 'bg-blue-100 shadow-md' : 'bg-gray-50 hover:bg-white'} ${details.color}`}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center">
                                            <details.icon className={`h-6 w-6 mr-3 flex-shrink-0 ${details.badgeColor.split(' ')[1]}`} />
                                            <div>
                                                <h4 className="font-bold text-brand-dark">{list.name}</h4>
                                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${details.badgeColor}`}>{list.type}</span>
                                            </div>
                                        </div>
                                        <span className="font-mono text-sm bg-gray-200 px-2 rounded-full flex-shrink-0">{entries.filter(e => e.listId === list.id).length}</span>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-2 ml-9">{list.description}</p>
                                </div>
                            )})}
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card title={`Entries for: ${selectedList?.name}`}>
                        <div className="flex justify-between items-center mb-4">
                            <input type="text" placeholder="Search entries..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-1/2 p-2 border rounded" />
                            <button onClick={() => { setEditingEntry(null); setIsModalOpen(true); }} className="px-4 py-2 bg-brand-secondary text-white rounded-lg">Add New Entry</button>
                        </div>
                        <div className="overflow-y-auto max-h-96">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Full Name</th>
                                        <th className="px-4 py-2 text-left">Document #</th>
                                        <th className="px-4 py-2 text-left">{selectedList?.type === 'Cleared Document List' ? 'Cleared Against' : 'Reason'}</th>
                                        <th className="px-4 py-2 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredEntries.map(entry => (
                                        <tr key={entry.id}>
                                            <td className="px-4 py-3"><div className="font-medium">{entry.fullName}</div><div className="text-xs text-gray-500">{entry.dob}</div></td>
                                            <td className="px-4 py-3 font-mono text-sm">{entry.documentNumber}</td>
                                            <td className="px-4 py-3 text-sm max-w-xs truncate">{selectedList?.type === 'Cleared Document List' ? entry.clearedAgainst : entry.reason}</td>
                                            <td className="px-4 py-3 space-x-2">
                                                <button onClick={() => { setEditingEntry(entry); setIsModalOpen(true); }} className="text-brand-secondary">Edit</button>
                                                <button onClick={() => handleDeleteEntry(entry.id)} className="text-status-red">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>

            <Card title="Live Activity Log">
                 <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {activityLog.map(act => (
                        <div key={act.id} className="p-2 bg-gray-50 border-l-4 border-gray-300 new-alert-row">
                            <span className="font-mono text-xs text-gray-500 mr-4">{act.timestamp}</span>
                            <span className="font-semibold text-sm mr-2">{act.user}</span>
                            <span className="text-sm text-gray-700">{act.action}</span>
                        </div>
                    ))}
                    {activityLog.length === 0 && <p className="text-center text-gray-500 py-4">No recent activity.</p>}
                </div>
            </Card>
        </div>
    );
};