import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/Card';
import { performModelAudit } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import type { AuditEvent } from '../types';

const mockAuditHistory = [
    { auditId: 'AUD-001', model: 'CT-Threat-Detection-V1.2.3', type: 'Fairness Audit', date: '2023-10-20', status: 'Completed', findings: 1 },
    { auditId: 'AUD-002', model: 'Risk-Analytics-LSTM-V2.1', type: 'Performance Evaluation', date: '2023-09-15', status: 'Completed', findings: 0 },
    { auditId: 'AUD-003', model: 'Risk-Analytics-LSTM-V2.2', type: 'Bias Detection', date: '2023-10-25', status: 'In Progress', findings: 0 },
];

const mockModelData = [
  { name: 'Jan', accuracy: 97.5 }, { name: 'Feb', accuracy: 97.8 }, { name: 'Mar', accuracy: 98.1 },
  { name: 'Apr', accuracy: 98.0 }, { name: 'May', accuracy: 97.9 }, { name: 'Jun', accuracy: 98.2 },
];

const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);

const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
);

interface GroupedEvent {
  timestamp: string;
  user: string;
  actions: string[];
}

export const XAIAuditDashboard: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [auditResult, setAuditResult] = useState<any>(null);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    const groupedTrail = useMemo(() => {
        const events: AuditEvent[] = auditResult?.auditTrail;
        if (!events || events.length === 0) return [];
        
        const groups: Record<string, GroupedEvent> = events.reduce((acc, log) => {
            const key = `${log.timestamp}|${log.user}`;
            if (!acc[key]) {
                acc[key] = {
                    timestamp: log.timestamp,
                    user: log.user,
                    actions: [],
                };
            }
            acc[key].actions.push(log.action);
            return acc;
        }, {} as Record<string, GroupedEvent>);
        
        return Object.values(groups);
    }, [auditResult]);

    const toggleGroup = (key: string) => {
        setExpandedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(key)) {
                newSet.delete(key);
            } else {
                newSet.add(key);
            }
            return newSet;
        });
    };

    const handleRunAudit = async () => {
        setIsLoading(true);
        setAuditResult(null); // Clear previous results
        setExpandedGroups(new Set()); // Reset expanded state
        // In a real app, you would pass a real dataset
        const result = await performModelAudit([{ passenger: 'data' }]);
        setAuditResult(result);
        setIsLoading(false);
    };

    return (
        <div className="space-y-6">
            <Card title="AI Model Audit Center">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-gray-600">Continuously monitor and audit AI models for fairness, bias, and performance degradation.</p>
                        <p className="text-sm text-gray-500 mt-1">Select a model and run a new audit to ensure ethical and reliable operation.</p>
                    </div>
                     <button 
                        onClick={handleRunAudit}
                        disabled={isLoading}
                        className="px-4 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-primary transition-colors disabled:bg-gray-400 flex items-center"
                    >
                         {isLoading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg> 
                        }
                        {isLoading ? 'Running Audit...' : 'Run New Fairness Audit'}
                    </button>
                </div>
            </Card>
            
            {auditResult && (
                 <Card title="Latest Audit Results: Risk-Analytics-LSTM-V2.2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <h4 className="font-semibold text-gray-800 mb-2">AI-Generated Summary</h4>
                            <p className="text-gray-600 bg-blue-50 p-4 rounded-lg">{auditResult.summary}</p>
                            
                             <h4 className="font-semibold text-gray-800 mt-6 mb-2">Detailed Findings</h4>
                             <ul className="space-y-3">
                                {auditResult.findings.map((finding: any, index: number) => (
                                    <li key={index} className="p-3 border rounded-md shadow-sm">
                                        <div className="flex justify-between items-center">
                                            <span className={`font-bold ${finding.type === 'BiasDetected' ? 'text-red-600' : 'text-green-600'}`}>{finding.type}</span>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${finding.severity === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'}`}>{finding.severity}</span>
                                        </div>
                                        <p className="text-sm text-gray-700 mt-1"><strong>Metric:</strong> {finding.metric} ({finding.value})</p>
                                        <p className="text-sm text-gray-700"><strong>Group:</strong> {finding.group}</p>
                                        <p className="text-sm text-gray-500 mt-2"><strong>Recommendation:</strong> {finding.recommendation}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                             <h4 className="font-semibold text-gray-800 mb-2">Model Performance Over Time</h4>
                             <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={mockModelData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis domain={[97, 99]}/>
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="accuracy" stroke="#1e3a8a" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t">
                        <h4 className="font-semibold text-gray-800 mb-4">Detailed Audit Log</h4>
                        <div className="space-y-2 font-sans">
                            {groupedTrail.map((group) => {
                                const key = `${group.timestamp}|${group.user}`;
                                const isExpanded = expandedGroups.has(key);
                                const canExpand = group.actions.length > 1;

                                return (
                                    <div key={key} className="border rounded-md bg-white shadow-sm overflow-hidden">
                                        <div 
                                            className={`flex items-center p-3 ${canExpand ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                                            onClick={canExpand ? () => toggleGroup(key) : undefined}
                                            aria-expanded={isExpanded}
                                            role="button"
                                        >
                                            <div className="flex items-center w-1/3">
                                                {canExpand ? (
                                                    isExpanded ? <ChevronDownIcon className="h-4 w-4 mr-2 text-gray-500" /> : <ChevronRightIcon className="h-4 w-4 mr-2 text-gray-500" />
                                                ) : (
                                                    <div className="w-4 mr-2" /> // Spacer
                                                )}
                                                <span className="font-mono text-sm text-gray-600">{group.timestamp}</span>
                                            </div>
                                            <div className="w-1/3">
                                                <span className="font-medium text-sm text-gray-800">{group.user}</span>
                                            </div>
                                            <div className="w-1/3">
                                                <p className="text-sm text-gray-800 truncate">{group.actions[0]}</p>
                                            </div>
                                        </div>
                                        {isExpanded && canExpand && (
                                            <div className="border-t bg-gray-50 p-4 pl-12">
                                                <ul className="list-disc list-inside space-y-1">
                                                    {group.actions.slice(1).map((action, index) => (
                                                        <li key={index} className="text-sm text-gray-700">{action}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </Card>
            )}

            <Card title="Audit History">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Audit ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model Audited</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {mockAuditHistory.map(audit => (
                                <tr key={audit.auditId}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{audit.auditId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{audit.model}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{audit.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${audit.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{audit.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};