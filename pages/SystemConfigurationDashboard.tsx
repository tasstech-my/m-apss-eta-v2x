
import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { AdjustmentsHorizontalIcon, ServerIcon, GlobeAltIcon, TableCellsIcon, ShareIcon, LinkIcon, ClockIcon, RocketLaunchIcon, CheckCircleIcon } from '../constants';
import type { SystemConfigItem, ConfigVersion } from '../types';

// --- MOCK DATA ---
const initialConfig: SystemConfigItem[] = [
    { id: 'cfg-1', category: 'Security', key: 'Session Timeout', value: 15, description: 'Minutes of inactivity before automatic logout.' },
    { id: 'cfg-2', category: 'Security', key: 'MFA Enforcement', value: true, description: 'Require Multi-Factor Authentication for all admin roles.' },
    { id: 'cfg-3', category: 'Security', key: 'Password Complexity', value: 'High', description: 'Policy level (Low/Medium/High).' },
    { id: 'cfg-4', category: 'System', key: 'Maintenance Mode', value: false, description: 'Put system in read-only mode for updates.' },
    { id: 'cfg-5', category: 'System', key: 'Debug Logging', value: false, description: 'Enable verbose logging for troubleshooting (Impacts performance).' },
    { id: 'cfg-6', category: 'Notifications', key: 'Email Gateway', value: 'smtp.gov.secure', description: 'SMTP Server address.' },
    { id: 'cfg-7', category: 'Notifications', key: 'SMS Provider', value: 'Twilio', description: 'Active SMS gateway provider.' },
];

const networkSettings = [
    { id: 'net-1', key: 'API Gateway Timeout', value: '30000', unit: 'ms' },
    { id: 'net-2', key: 'Max Retries', value: '3', unit: 'attempts' },
    { id: 'net-3', key: 'Proxy Server', value: '10.0.0.55:8080', unit: 'host:port' },
    { id: 'net-4', key: 'SSL/TLS Version', value: 'TLS 1.3', unit: 'protocol' },
];

const dataMappings = [
    { id: 'map-1', source: 'PNRGOV', field: 'surname', target: 'TravelerDB.last_name', transform: 'UPPERCASE' },
    { id: 'map-2', source: 'PNRGOV', field: 'date_of_birth', target: 'TravelerDB.dob', transform: 'ISO8601_DATE' },
    { id: 'map-3', source: 'PAXLST', field: 'doc_num', target: 'TravelerDB.passport_no', transform: 'STRIP_WHITESPACE' },
    { id: 'map-4', source: 'PAXLST', field: 'nat_code', target: 'TravelerDB.nationality', transform: 'ISO3_CODE' },
];

const externalSystems = [
    { id: 'ext-1', name: 'Interpol I-24/7', endpoint: 'https://secure.interpol.int/api/v2/search', status: 'Active', authType: 'mTLS Certificate' },
    { id: 'ext-2', name: 'National Visa System', endpoint: 'https://nvs.gov.internal/api/check', status: 'Active', authType: 'OAuth2' },
    { id: 'ext-3', name: 'Airline DCS Gateway', endpoint: 'https://dcs-gateway.m-apss.net/connect', status: 'Active', authType: 'API Key' },
];

const mockVersionHistory: ConfigVersion[] = [
    { id: 'v-103', version: 'v1.5.2', timestamp: '2023-10-28 09:15:00', user: 'sysadmin.lee', action: 'Modified', description: 'Increased Password Complexity to High.', reason: 'Compliance with new National Cyber Security Directive 2023-B.' },
    { id: 'v-102', version: 'v1.5.1', timestamp: '2023-10-27 14:30:00', user: 'network.admin', action: 'Modified', description: 'Updated Proxy Server address.', reason: 'Infrastructure migration.' },
    { id: 'v-101', version: 'v1.5.0', timestamp: '2023-10-25 08:00:00', user: 'system', action: 'Rolled Back', description: 'Rolled back to v1.4.9 due to API latency issues.', reason: 'Critical performance degradation observed post-deployment.' },
    { id: 'v-100', version: 'v1.4.9', timestamp: '2023-10-20 10:00:00', user: 'sysadmin.lee', action: 'Modified', description: 'Enabled MFA Enforcement.', reason: 'Security hardening.' },
];

const mockPendingChanges = [
    { id: 'chg-1', setting: 'API Gateway Timeout', oldValue: '30000', newValue: '45000', author: 'network.admin' },
    { id: 'chg-2', setting: 'Debug Logging', oldValue: 'false', newValue: 'true', author: 'dev.lead' },
];

const ToggleSwitch: React.FC<{ enabled: boolean; onChange: () => void }> = ({ enabled, onChange }) => (
    <button
        type="button"
        className={`${enabled ? 'bg-brand-secondary' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2`}
        role="switch"
        aria-checked={enabled}
        onClick={onChange}
    >
        <span className={`${enabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
    </button>
);

export const SystemConfigurationDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'general' | 'network' | 'mappings' | 'external' | 'history' | 'deployment'>('general');
    const [configs, setConfigs] = useState<SystemConfigItem[]>(initialConfig);
    
    // Deployment State
    const [stagingStatus, setStagingStatus] = useState<'Idle' | 'Deploying' | 'Validating' | 'Ready'>('Idle');
    const [prodStatus, setProdStatus] = useState<'Idle' | 'Promoting' | 'Deployed'>('Idle');
    const [stagingVersion, setStagingVersion] = useState('v1.5.2');
    const [prodVersion, setProdVersion] = useState('v1.5.2');

    const handleToggle = (id: string) => {
        setConfigs(prev => prev.map(c => c.id === id ? { ...c, value: !c.value } : c));
    };

    const handleChange = (id: string, newValue: string | number) => {
        setConfigs(prev => prev.map(c => c.id === id ? { ...c, value: newValue } : c));
    };

    const handleDeployToStaging = () => {
        setStagingStatus('Deploying');
        setTimeout(() => {
            setStagingStatus('Validating');
            setTimeout(() => {
                setStagingStatus('Ready');
                setStagingVersion('v1.5.3-rc1');
            }, 2000);
        }, 2000);
    };

    const handlePromoteToProd = () => {
        setProdStatus('Promoting');
        setTimeout(() => {
            setProdStatus('Deployed');
            setProdVersion('v1.5.3');
            setStagingStatus('Idle');
            alert("Successfully promoted v1.5.3 to Production.");
        }, 2500);
    };

    const securityConfigs = configs.filter(c => c.category === 'Security');
    const systemConfigs = configs.filter(c => c.category === 'System');
    const notifConfigs = configs.filter(c => c.category === 'Notifications');

    return (
        <div className="space-y-6">
             <Card className="bg-slate-800 text-white border-l-4 border-brand-secondary">
                <div className="flex items-center">
                    <AdjustmentsHorizontalIcon className="h-8 w-8 text-brand-secondary mr-4" />
                    <div>
                        <h2 className="text-2xl font-bold">Centralized Configuration Management</h2>
                        <p className="text-slate-400 text-sm mt-1">
                            Single source of truth for managing all system parameters, network settings, data mappings, and external integrations.
                        </p>
                    </div>
                </div>
            </Card>

            <div className="bg-white rounded-lg shadow-sm">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'general' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            <ServerIcon className="h-4 w-4 mr-2"/> General Policies
                        </button>
                        <button
                            onClick={() => setActiveTab('network')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'network' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            <GlobeAltIcon className="h-4 w-4 mr-2"/> Network Connections
                        </button>
                        <button
                            onClick={() => setActiveTab('mappings')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'mappings' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            <TableCellsIcon className="h-4 w-4 mr-2"/> Data Field Mappings
                        </button>
                        <button
                            onClick={() => setActiveTab('external')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'external' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            <ShareIcon className="h-4 w-4 mr-2"/> External Systems
                        </button>
                        <button
                            onClick={() => setActiveTab('deployment')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'deployment' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            <RocketLaunchIcon className="h-4 w-4 mr-2"/> Deployment Workflow
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'history' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            <ClockIcon className="h-4 w-4 mr-2"/> Version Control
                        </button>
                    </nav>
                </div>
            </div>

            {activeTab === 'general' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="Security Policies">
                        <div className="space-y-4">
                            {securityConfigs.map(cfg => (
                                <div key={cfg.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                                    <div className="flex-1 pr-4">
                                        <p className="font-bold text-brand-dark">{cfg.key}</p>
                                        <p className="text-xs text-gray-500">{cfg.description}</p>
                                    </div>
                                    <div>
                                        {typeof cfg.value === 'boolean' ? (
                                            <ToggleSwitch enabled={cfg.value} onChange={() => handleToggle(cfg.id)} />
                                        ) : (
                                            <input 
                                                type={typeof cfg.value === 'number' ? 'number' : 'text'} 
                                                value={cfg.value.toString()} 
                                                onChange={(e) => handleChange(cfg.id, typeof cfg.value === 'number' ? parseInt(e.target.value) : e.target.value)}
                                                className="p-2 border rounded w-32 text-right"
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <div className="space-y-6">
                        <Card title="System Controls">
                            <div className="space-y-4">
                                {systemConfigs.map(cfg => (
                                    <div key={cfg.id} className={`flex items-center justify-between p-4 border rounded-lg ${cfg.key === 'Maintenance Mode' && cfg.value ? 'bg-red-50 border-red-300' : 'bg-gray-50'}`}>
                                        <div className="flex-1 pr-4">
                                            <div className="flex items-center">
                                                <p className={`font-bold ${cfg.key === 'Maintenance Mode' && cfg.value ? 'text-red-700' : 'text-brand-dark'}`}>{cfg.key}</p>
                                                {cfg.key === 'Maintenance Mode' && cfg.value && <span className="ml-2 px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded uppercase">Active</span>}
                                            </div>
                                            <p className="text-xs text-gray-500">{cfg.description}</p>
                                        </div>
                                        <div>
                                            <ToggleSwitch enabled={cfg.value as boolean} onChange={() => handleToggle(cfg.id)} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card title="Notification Settings">
                             <div className="space-y-4">
                                {notifConfigs.map(cfg => (
                                    <div key={cfg.id} className="p-4 border rounded-lg bg-gray-50">
                                        <p className="font-bold text-brand-dark text-sm mb-1">{cfg.key}</p>
                                        <input 
                                            type="text" 
                                            value={cfg.value.toString()} 
                                            onChange={(e) => handleChange(cfg.id, e.target.value)}
                                            className="w-full p-2 border rounded bg-white text-sm"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">{cfg.description}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {activeTab === 'network' && (
                <Card title="Network Connection Settings">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {networkSettings.map(net => (
                            <div key={net.id} className="p-4 border rounded-lg bg-gray-50">
                                <label className="block text-sm font-bold text-gray-700 mb-1">{net.key}</label>
                                <div className="flex">
                                    <input 
                                        type="text" 
                                        defaultValue={net.value} 
                                        className="flex-1 p-2 border rounded-l-md border-r-0 focus:ring-brand-secondary"
                                    />
                                    <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-100 text-gray-500 text-sm">
                                        {net.unit}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {activeTab === 'mappings' && (
                <Card title="Data Field Mappings (ETL)">
                    <p className="text-sm text-gray-600 mb-4">Configure how fields from external formats (PNRGOV, PAXLST) map to the internal Traveler Database schema.</p>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source Format</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source Field</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target DB Field</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transformation</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {dataMappings.map(map => (
                                    <tr key={map.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">{map.source}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">{map.field}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-green-600">{map.target}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono bg-gray-50 p-1 rounded">{map.transform}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button className="text-brand-secondary hover:underline">Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 text-sm font-bold rounded hover:bg-gray-300">
                        + Add New Mapping
                    </button>
                </Card>
            )}

            {activeTab === 'external' && (
                <Card title="External System Integrations">
                    <div className="space-y-4">
                        {externalSystems.map(sys => (
                            <div key={sys.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
                                <div className="flex items-center mb-2 sm:mb-0">
                                    <LinkIcon className="h-5 w-5 text-brand-secondary mr-3" />
                                    <div>
                                        <h4 className="font-bold text-brand-dark">{sys.name}</h4>
                                        <p className="text-xs text-gray-500">Auth: {sys.authType}</p>
                                    </div>
                                </div>
                                <div className="flex-1 sm:mx-6 w-full sm:w-auto">
                                    <div className="flex items-center bg-gray-50 rounded border px-3 py-2">
                                        <span className="text-xs font-bold text-gray-400 mr-2">ENDPOINT:</span>
                                        <input 
                                            type="text" 
                                            defaultValue={sys.endpoint} 
                                            className="bg-transparent border-none w-full text-sm font-mono text-gray-700 focus:ring-0 p-0"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center mt-2 sm:mt-0">
                                    <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-800 rounded-full mr-3">{sys.status}</span>
                                    <button className="text-sm text-brand-secondary hover:underline font-medium">Configure</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {activeTab === 'deployment' && (
                <div className="space-y-6">
                    <Card className="bg-amber-50 border-l-4 border-amber-500">
                         <div className="flex">
                            <div className="flex-shrink-0">
                                <RocketLaunchIcon className="h-5 w-5 text-amber-600" aria-hidden="true" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-bold text-amber-800">Release Management Workflow</h3>
                                <div className="mt-2 text-sm text-amber-700">
                                    <p>
                                        All configuration changes must be deployed to the <strong>Staging Environment</strong> for automated validation before promotion to <strong>Production</strong>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Pending Changes */}
                        <Card title="Pending Changes (Draft)">
                             <div className="space-y-3">
                                {mockPendingChanges.map(change => (
                                    <div key={change.id} className="p-3 bg-white border rounded-lg shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <span className="font-bold text-sm text-brand-dark">{change.setting}</span>
                                            <span className="text-xs text-gray-500">by {change.author}</span>
                                        </div>
                                        <div className="flex items-center mt-2 text-xs font-mono">
                                            <span className="bg-red-50 text-red-700 px-1 rounded">{change.oldValue}</span>
                                            <span className="mx-2 text-gray-400">→</span>
                                            <span className="bg-green-50 text-green-700 px-1 rounded">{change.newValue}</span>
                                        </div>
                                    </div>
                                ))}
                                {mockPendingChanges.length === 0 && <p className="text-center text-gray-500 py-4">No pending changes.</p>}
                            </div>
                        </Card>

                        {/* Staging Environment */}
                        <Card title="Staging Environment" className="border-t-4 border-blue-500">
                            <div className="text-center mb-6">
                                <p className="text-xs text-gray-500 uppercase font-bold">Current Version</p>
                                <p className="text-2xl font-mono font-bold text-blue-600">{stagingVersion}</p>
                                <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                                    Status: {stagingStatus}
                                </div>
                            </div>
                            
                            {stagingStatus === 'Ready' && (
                                <div className="bg-green-50 border border-green-200 p-3 rounded-lg mb-6 flex items-center justify-center text-green-800 text-sm font-bold">
                                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                                    Validation Passed
                                </div>
                            )}

                            <button 
                                onClick={handleDeployToStaging}
                                disabled={stagingStatus === 'Deploying' || stagingStatus === 'Validating'}
                                className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center justify-center"
                            >
                                {stagingStatus === 'Deploying' ? 'Deploying...' : stagingStatus === 'Validating' ? 'Running Tests...' : 'Deploy to Staging'}
                            </button>
                        </Card>

                        {/* Production Environment */}
                        <Card title="Production Environment" className="border-t-4 border-green-600 bg-gray-50">
                            <div className="text-center mb-6">
                                <p className="text-xs text-gray-500 uppercase font-bold">Live Version</p>
                                <p className="text-2xl font-mono font-bold text-green-700">{prodVersion}</p>
                                <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">
                                    Status: Active
                                </div>
                            </div>

                            <div className="p-3 text-xs text-gray-500 text-center mb-6">
                                {prodStatus === 'Promoting' ? 'Rolling out updates to cluster...' : 'Last deployment: 2 days ago'}
                            </div>

                            <button 
                                onClick={handlePromoteToProd}
                                disabled={stagingStatus !== 'Ready' || prodStatus === 'Promoting'}
                                className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 transition-colors flex items-center justify-center"
                            >
                                {prodStatus === 'Promoting' ? 'Promoting...' : 'Promote to Production'}
                            </button>
                            {stagingStatus !== 'Ready' && <p className="text-xs text-red-500 text-center mt-2">Staging validation required.</p>}
                        </Card>
                    </div>
                </div>
            )}

            {activeTab === 'history' && (
                <Card title="Configuration Version Control & Audit Trail">
                    <p className="text-sm text-gray-600 mb-4">
                        Immutable log of all configuration changes. Allows rollback to previous system states.
                    </p>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Version ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description & Justification</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {mockVersionHistory.map(ver => (
                                    <tr key={ver.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-900">{ver.version}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{ver.timestamp}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-dark">{ver.user}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${ver.action === 'Rolled Back' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {ver.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-semibold text-gray-800">{ver.description}</p>
                                            <p className="text-xs text-gray-500 mt-1 italic">Reason: {ver.reason}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button className="text-brand-secondary hover:underline mr-3">View Diff</button>
                                            <button className="text-red-600 hover:text-red-800 font-bold" onClick={() => alert(`Rolling back to ${ver.version}...`)}>Restore</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
            
            {activeTab !== 'history' && activeTab !== 'deployment' && (
                 <div className="flex justify-end pt-6 border-t border-gray-200">
                    <button onClick={() => alert("Configuration saved successfully. A new version has been created in the audit log.")} className="px-6 py-3 bg-brand-secondary text-white font-bold rounded-lg hover:bg-brand-primary shadow-lg transition-transform hover:scale-105">
                        Save Changes
                    </button>
                </div>
            )}
        </div>
    );
};
