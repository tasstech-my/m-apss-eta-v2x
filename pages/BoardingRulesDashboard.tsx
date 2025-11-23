
import React, { useState } from 'react';
import { Card } from '../components/Card';
import type { BoardingRule, RuleCondition } from '../types';
import { ClipboardDocumentCheckIcon } from '../constants';

// MOCK DATA
const initialRules: BoardingRule[] = [
    {
        id: 'BR-001',
        name: 'Mandatory Passport & Visa Check',
        description: 'Standard rule for all non-exempt travelers. Requires valid passport and visa.',
        status: 'Active',
        priority: 10,
        conditions: [
            { id: 'c1', field: 'Passport Search Result', operator: 'Equals', value: 'Expired' },
            { id: 'c2', field: 'Visa Search Result', operator: 'Equals', value: 'Found and Valid' },
            { id: 'c3', field: 'Watchlist Search Result', operator: 'Equals', value: 'Not found' }
        ],
        directive: 'Do Not Board',
        overrideCode: '[N] Not Applicable'
    },
    {
        id: 'BR-002',
        name: 'Watchlist Hit Protocol',
        description: 'Automatic denial for any confirmed watchlist hit.',
        status: 'Active',
        priority: 1,
        conditions: [
            { id: 'c4', field: 'Watchlist Search Result', operator: 'Equals', value: 'Confirmed Hit' }
        ],
        directive: 'Do Not Board',
        overrideCode: '[S] Security Override (Supervisor Only)'
    },
    {
        id: 'BR-003',
        name: 'Fuzzy Match Review',
        description: 'Referral to BOC for uncertain identity matches.',
        status: 'Active',
        priority: 5,
        conditions: [
            { id: 'c5', field: 'Watchlist Search Result', operator: 'Equals', value: 'Fuzzy Match' },
            { id: 'c6', field: 'Risk Score', operator: 'Contains', value: 'Medium' } // Simplified for UI
        ],
        directive: 'Contact Government',
        overrideCode: '[C] Call Center Auth'
    }
];

const availableFields = [
    'Passport Search Result',
    'Visa Search Result',
    'Watchlist Search Result',
    'Risk Score',
    'Nationality',
    'Origin Airport'
];

const availableOperators: RuleCondition['operator'][] = ['Equals', 'Not Equals', 'Contains'];

const availableValues = [
    'Expired', 'Found and Valid', 'Not found', 'Confirmed Hit', 'Fuzzy Match', 'High', 'Medium', 'Low'
];

const RuleEditorModal: React.FC<{ rule: BoardingRule | null; onClose: () => void; onSave: (rule: BoardingRule) => void }> = ({ rule, onClose, onSave }) => {
    const [name, setName] = useState(rule?.name || '');
    const [description, setDescription] = useState(rule?.description || '');
    const [priority, setPriority] = useState(rule?.priority || 10);
    const [conditions, setConditions] = useState<RuleCondition[]>(rule?.conditions || []);
    const [directive, setDirective] = useState<BoardingRule['directive']>(rule?.directive || 'Contact Government');
    const [overrideCode, setOverrideCode] = useState(rule?.overrideCode || '');

    // New Condition State
    const [newField, setNewField] = useState(availableFields[0]);
    const [newOperator, setNewOperator] = useState<RuleCondition['operator']>('Equals');
    const [newValue, setNewValue] = useState(availableValues[0]);

    const handleAddCondition = () => {
        const newCondition: RuleCondition = {
            id: `c-${Date.now()}`,
            field: newField,
            operator: newOperator,
            value: newValue
        };
        setConditions([...conditions, newCondition]);
    };

    const handleRemoveCondition = (id: string) => {
        setConditions(conditions.filter(c => c.id !== id));
    };

    const handleSubmit = () => {
        if (!name || conditions.length === 0) return;
        const finalRule: BoardingRule = {
            id: rule?.id || `BR-${Date.now()}`,
            name,
            description,
            status: 'Active',
            priority,
            conditions,
            directive,
            overrideCode
        };
        onSave(finalRule);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
            <Card title={rule ? 'Edit Boarding Rule' : 'Create New Boarding Rule'} className="w-full max-w-3xl animate-scale-in max-h-[90vh] overflow-y-auto">
                <div className="space-y-6">
                    {/* Metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Rule Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full p-2 border rounded-md" placeholder="e.g., Visa Expiry Check" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full p-2 border rounded-md" placeholder="Describe the policy logic..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Priority (1 = Highest)</label>
                            <input type="number" value={priority} onChange={e => setPriority(Number(e.target.value))} className="mt-1 block w-full p-2 border rounded-md" min="1" />
                        </div>
                    </div>

                    {/* Conditions (IF) */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h4 className="text-sm font-bold text-gray-700 uppercase mb-3 flex items-center">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">IF</span> 
                            Conditions (Risk Broker Inputs)
                        </h4>
                        
                        <div className="space-y-2 mb-4">
                            {conditions.map((cond, idx) => (
                                <div key={cond.id} className="flex items-center p-2 bg-white border rounded shadow-sm">
                                    {idx > 0 && <span className="text-xs font-bold bg-gray-200 px-2 py-1 rounded mr-2 text-gray-600">AND</span>}
                                    <span className="font-medium text-sm text-gray-800 flex-1">{cond.field}</span>
                                    <span className="text-xs font-mono text-gray-500 mx-2 uppercase">{cond.operator}</span>
                                    <span className="font-bold text-sm text-brand-primary flex-1">"{cond.value}"</span>
                                    <button onClick={() => handleRemoveCondition(cond.id)} className="text-red-500 hover:text-red-700 ml-2">×</button>
                                </div>
                            ))}
                            {conditions.length === 0 && <p className="text-sm text-gray-400 italic text-center">No conditions added yet.</p>}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 items-end border-t pt-3">
                            <div className="flex-1 w-full">
                                <label className="text-xs text-gray-500">Field</label>
                                <select value={newField} onChange={e => setNewField(e.target.value)} className="w-full p-2 text-sm border rounded-md bg-white">
                                    {availableFields.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>
                            <div className="w-full sm:w-32">
                                <label className="text-xs text-gray-500">Operator</label>
                                <select value={newOperator} onChange={e => setNewOperator(e.target.value as any)} className="w-full p-2 text-sm border rounded-md bg-white">
                                    {availableOperators.map(op => <option key={op} value={op}>{op}</option>)}
                                </select>
                            </div>
                            <div className="flex-1 w-full">
                                <label className="text-xs text-gray-500">Value</label>
                                <select value={newValue} onChange={e => setNewValue(e.target.value)} className="w-full p-2 text-sm border rounded-md bg-white">
                                    {availableValues.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>
                            <button onClick={handleAddCondition} className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-md hover:bg-blue-700">Add</button>
                        </div>
                    </div>

                    {/* Actions (THEN) */}
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="text-sm font-bold text-gray-700 uppercase mb-3 flex items-center">
                            <span className="bg-green-200 text-green-800 px-2 py-1 rounded mr-2">THEN</span> 
                            Output Directives
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Boarding Directive</label>
                                <select value={directive} onChange={e => setDirective(e.target.value as any)} className="mt-1 block w-full p-2 border rounded-md bg-white font-bold">
                                    <option className="text-green-600">OK to Board</option>
                                    <option className="text-red-600">Do Not Board</option>
                                    <option className="text-amber-600">Contact Government</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Acceptable Override Code</label>
                                <input type="text" value={overrideCode} onChange={e => setOverrideCode(e.target.value)} className="mt-1 block w-full p-2 border rounded-md font-mono text-sm" placeholder="e.g., [N] Not Applicable" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t space-x-3">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                        <button onClick={handleSubmit} className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-dark">Save Rule</button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export const BoardingRulesDashboard: React.FC = () => {
    const [rules, setRules] = useState<BoardingRule[]>(initialRules);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<BoardingRule | null>(null);

    const handleSaveRule = (rule: BoardingRule) => {
        if (editingRule) {
            setRules(prev => prev.map(r => r.id === rule.id ? rule : r));
        } else {
            setRules(prev => [...prev, rule]);
        }
        setIsEditorOpen(false);
        setEditingRule(null);
    };

    const handleToggleStatus = (id: string) => {
        setRules(prev => prev.map(r => r.id === id ? { ...r, status: r.status === 'Active' ? 'Inactive' : 'Active' } : r));
    };

    const handleDeleteRule = (id: string) => {
        if (window.confirm('Are you sure you want to delete this rule?')) {
            setRules(prev => prev.filter(r => r.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            {isEditorOpen && <RuleEditorModal rule={editingRule} onClose={() => { setIsEditorOpen(false); setEditingRule(null); }} onSave={handleSaveRule} />}

            <Card className="bg-indigo-900 border-l-4 border-indigo-500 text-white">
                <div className="flex items-center">
                    <ClipboardDocumentCheckIcon className="h-8 w-8 text-indigo-300 mr-4" />
                    <div>
                        <h2 className="text-2xl font-bold">Boarding Rules Management (Policy-as-Code)</h2>
                        <p className="text-indigo-200 text-sm mt-1">
                            Define the business logic that translates Risk Broker assessment results into actionable boarding directives.
                        </p>
                    </div>
                </div>
            </Card>

            <div className="flex justify-end">
                <button 
                    onClick={() => { setEditingRule(null); setIsEditorOpen(true); }}
                    className="px-4 py-2 bg-brand-secondary text-white font-bold rounded-lg hover:bg-brand-primary transition-colors flex items-center shadow-sm"
                >
                    <span className="text-xl mr-2">+</span> Create New Policy Rule
                </button>
            </div>

            <div className="grid gap-4">
                {rules.sort((a, b) => a.priority - b.priority).map(rule => (
                    <Card key={rule.id} className={`border-l-4 ${rule.status === 'Active' ? 'border-brand-secondary' : 'border-gray-300 opacity-75'}`}>
                        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                            
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded">Priority {rule.priority}</span>
                                    <h3 className="text-lg font-bold text-brand-dark">{rule.name}</h3>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${rule.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                        {rule.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-4">{rule.description}</p>
                                
                                {/* Logic Visualization */}
                                <div className="bg-gray-50 p-3 rounded border border-gray-200 text-sm font-mono">
                                    <div className="mb-2">
                                        <span className="font-bold text-blue-600">IF:</span>
                                        <ul className="ml-6 list-disc space-y-1 mt-1">
                                            {rule.conditions.map((c, idx) => (
                                                <li key={idx}>
                                                    <span className="text-gray-700">{c.field}</span> 
                                                    <span className="text-purple-600 mx-2 lowercase font-bold">{c.operator}</span> 
                                                    <span className="text-brand-primary font-bold">"{c.value}"</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="border-t pt-2 mt-2 flex flex-wrap gap-4 items-center">
                                        <div>
                                            <span className="font-bold text-green-600 mr-2">THEN Directive:</span>
                                            <span className={`font-bold ${rule.directive === 'Do Not Board' ? 'text-red-600' : rule.directive === 'Contact Government' ? 'text-amber-600' : 'text-green-600'}`}>
                                                "{rule.directive}"
                                            </span>
                                        </div>
                                        <div>
                                            <span className="font-bold text-gray-500 mr-2">AND Override:</span>
                                            <span className="bg-gray-200 px-1 rounded text-gray-700">{rule.overrideCode}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex md:flex-col gap-2">
                                <button 
                                    onClick={() => { setEditingRule(rule); setIsEditorOpen(true); }} 
                                    className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Edit Rule
                                </button>
                                <button 
                                    onClick={() => handleToggleStatus(rule.id)} 
                                    className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    {rule.status === 'Active' ? 'Deactivate' : 'Activate'}
                                </button>
                                <button 
                                    onClick={() => handleDeleteRule(rule.id)} 
                                    className="px-3 py-1.5 border border-red-200 rounded text-sm font-medium text-red-600 hover:bg-red-50"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};
