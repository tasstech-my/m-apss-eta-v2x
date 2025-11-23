import React, { useState } from 'react';
import { Card } from '../components/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { ApiSubmissionDetail, ValidationRule } from '../types';
import { IndividualApiRecordView } from './IndividualApiRecordView';


const apiResponseTimeData = [
  { time: '10:00', interactive: 150, batch: 2500 },
  { time: '11:00', interactive: 180, batch: 2800 },
  { time: '12:00', interactive: 200, batch: 3000 },
  { time: '13:00', interactive: 170, batch: 2600 },
  { time: '14:00', interactive: 220, batch: 3200 },
  { time: '15:00', interactive: 160, batch: 2400 },
  { time: '16:00', interactive: 190, batch: 2700 },
];

const statusData = [
    { name: 'Processed', value: 12540 },
    { name: 'Pending', value: 120 },
    { name: 'Rejected', value: 45 },
];

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

const initialMockSubmissions: ApiSubmissionDetail[] = [
    { 
        transactionId: 'TR-123', status: 'Processed', timestamp: '2023-10-27 15:01:12',
        manifest: {
            airlineCode: 'UA', flightNumber: '234', departureAirport: 'JFK', arrivalAirport: 'LHR',
            scheduledDepartureDate: '2023-10-28', scheduledDepartureTime: '20:45',
            manifestType: 'Interactive API', apiMessageFormat: 'UN/EDIFACT PAXLST'
        },
        passenger: { givenName: 'John', surname: 'Doe', middleName: 'James', dob: '1985-04-12', gender: 'Male', nationality: 'USA' },
        document: { type: 'Passport', number: 'P12345678', issuingCountry: 'USA', expiryDate: '2030-04-11' },
        additionalInfo: {
            placeOfBirth: 'New York, USA',
            destinationAddress: {
                street: '123 Baker Street',
                city: 'London',
                state: 'N/A',
                postalCode: 'NW1 6XE',
                country: 'GBR'
            },
            transitStatus: 'Final Destination',
            contact: { email: 'j.doe@example.com', phone: '+1-202-555-0182' }
        },
        system: { 
            processedBy: 'System', 
            processingTimestamp: '2023-10-27 15:01:13',
            auditTrail: [
                { timestamp: '2023-10-27 15:01:12', action: 'iAPI Received', user: 'System' },
                { timestamp: '2023-10-27 15:01:13', action: 'Validation Success', user: 'System' },
                { timestamp: '2023-10-27 15:01:13', action: 'Risk Assessment Completed', user: 'AI-Module' },
            ]
        }
    },
    { 
        transactionId: 'TR-124', status: 'Pending', timestamp: '2023-10-27 15:01:45',
         manifest: {
            airlineCode: 'BA', flightNumber: '098', departureAirport: 'LHR', arrivalAirport: 'DXB',
            scheduledDepartureDate: '2023-10-28', scheduledDepartureTime: '12:30',
            manifestType: 'Interactive API', apiMessageFormat: 'UN/EDIFACT PAXLST'
        },
        passenger: { givenName: 'Jane', surname: 'Smith', dob: '1992-08-22', gender: 'Female', nationality: 'GBR' },
        document: { type: 'Passport', number: 'P87654321', issuingCountry: 'GBR', expiryDate: '2028-08-21' },
        additionalInfo: {
            transitStatus: 'Transiting',
            contact: { email: 'jane.smith@example.co.uk', phone: '+44-20-7946-0958'}
        },
        system: { 
            processedBy: 'System', 
            processingTimestamp: 'N/A',
            auditTrail: [
                { timestamp: '2023-10-27 15:01:45', action: 'iAPI Received', user: 'System' },
                { timestamp: '2023-10-27 15:01:45', action: 'Queued for manual review', user: 'System' },
            ]
        }
    },
    { 
        transactionId: 'TR-125', status: 'Processed', timestamp: '2023-10-27 14:55:00',
        manifest: {
            airlineCode: 'LH', flightNumber: '456', departureAirport: 'FRA', arrivalAirport: 'JFK',
            scheduledDepartureDate: '2023-10-28', scheduledDepartureTime: '11:15',
            manifestType: 'Batch API', apiMessageFormat: 'UN/EDIFACT PAXLST'
        },
        passenger: { givenName: 'Klaus', surname: 'Mueller', dob: '1978-12-01', gender: 'Male', nationality: 'DEU' },
        document: { type: 'Passport', number: 'D98765432', issuingCountry: 'DEU', expiryDate: '2025-11-30' },
        additionalInfo: {
            visa: { number: 'VDE98765', type: 'Business', issuingCountry: 'USA', issueDate: '2023-01-15', expiryDate: '2025-01-14' }
        },
        system: { 
            processedBy: 'System', 
            processingTimestamp: '2023-10-27 14:55:05',
            auditTrail: [
                { timestamp: '2023-10-27 14:55:00', action: 'Batch API Received', user: 'System' },
                { timestamp: '2023-10-27 14:55:05', action: 'Validation Success', user: 'System' },
            ]
        }
    },
    { 
        transactionId: 'TR-126', status: 'Rejected', timestamp: '2023-10-27 15:02:01',
        manifest: {
            airlineCode: 'AF', flightNumber: '789', departureAirport: 'CDG', arrivalAirport: 'SFO',
            scheduledDepartureDate: '2023-10-28', scheduledDepartureTime: '15:00',
            manifestType: 'Interactive API', apiMessageFormat: 'UN/EDIFACT PAXLST'
        },
        passenger: { givenName: 'Sophie', surname: 'Durand', dob: '1990-06-15', gender: 'Female', nationality: 'FRA' },
        document: { type: 'Passport', number: 'P_INVALID', issuingCountry: 'FRA', expiryDate: '2026-06-14' },
        additionalInfo: {
            placeOfBirth: 'Paris, France',
            contact: { email: 'sophie.d@example.fr', phone: '+33-1-2345-6789' }
        },
        system: { 
            processedBy: 'System', 
            processingTimestamp: '2023-10-27 15:02:02',
            validationErrors: '2 Errors Found:\n- Document Number format invalid. Expected 9 alphanumeric characters, received 9 with special characters.\n- Missing mandatory destination address for non-transit passenger.',
            auditTrail: [
                { timestamp: '2023-10-27 15:02:01', action: 'iAPI Received', user: 'System' },
                { timestamp: '2023-10-27 15:02:02', action: 'Validation Failed', user: 'System' },
            ]
        }
    },
];

const initialValidationRules: ValidationRule[] = [
    { id: 'rule-001', name: 'Passport Number Format', description: 'Must be 6-9 alphanumeric characters.', status: 'Active' },
    { id: 'rule-002', name: 'Document Expiry Date', description: 'Expiry date cannot be in the past.', status: 'Active' },
    { id: 'rule-003', name: 'Mandatory Destination Address', description: 'Required for all non-transit passengers.', status: 'Active' },
    { id: 'rule-004', name: 'Valid Nationality Code', description: 'Must be a valid ISO 3166-1 alpha-3 code.', status: 'Inactive' },
];


const validateApiSubmission = (
  submission: ApiSubmissionDetail
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const { document } = submission;

  const passportRegex = /^[A-Z0-9]{6,9}$/i;
  if (document.type === 'Passport' && !passportRegex.test(document.number)) {
    errors.push(
      `Document Number format invalid. Expected 6-9 alphanumeric characters for Passport, received "${document.number}".`
    );
  }

  const expiryDate = new Date(document.expiryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0); 

  if (expiryDate < today) {
    errors.push(`Document Expiry Date is in the past: ${document.expiryDate}.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const ToggleSwitch: React.FC<{ enabled: boolean, onChange: (enabled: boolean) => void }> = ({ enabled, onChange }) => {
    return (
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
};

export const APIGatewayDashboard: React.FC = () => {
    const [submissions, setSubmissions] = useState<ApiSubmissionDetail[]>(initialMockSubmissions);
    const [selectedSubmission, setSelectedSubmission] = useState<ApiSubmissionDetail | null>(null);
    const [validationRules, setValidationRules] = useState<ValidationRule[]>(initialValidationRules);

    const handleViewDetails = (submission: ApiSubmissionDetail) => {
        setSelectedSubmission(submission);
    };

    const handleBackToList = () => {
        setSelectedSubmission(null);
    };

    const handleToggleRule = (ruleId: string) => {
        setValidationRules(rules =>
            rules.map(rule =>
                rule.id === ruleId
                    ? { ...rule, status: rule.status === 'Active' ? 'Inactive' : 'Active' }
                    : rule
            )
        );
    };
    
    const handleSimulateSubmissions = () => {
        const baseSubmission: Omit<ApiSubmissionDetail, 'transactionId'> = {
            status: 'Pending', timestamp: '',
            manifest: {
                airlineCode: 'SIM', flightNumber: '001', departureAirport: 'SIM', arrivalAirport: 'TGT',
                scheduledDepartureDate: '2025-10-28', scheduledDepartureTime: '10:00',
                manifestType: 'Interactive API', apiMessageFormat: 'UN/EDIFACT PAXLST'
            },
            passenger: { givenName: 'John', surname: 'Doe', dob: '1990-01-01', gender: 'Male', nationality: 'USA' },
            document: { type: 'Passport', number: 'G12345678', issuingCountry: 'USA', expiryDate: '2030-01-01' },
            system: { 
                processedBy: 'System', 
                processingTimestamp: '',
                auditTrail: []
            }
        };

        const newSubmissionsToProcess: Partial<ApiSubmissionDetail>[] = [
             {
                passenger: { ...baseSubmission.passenger, givenName: 'Valid', surname: 'Submission' },
                document: { ...baseSubmission.document, number: 'G98765432', expiryDate: '2032-01-01' }
            },
            {
                passenger: { ...baseSubmission.passenger, givenName: 'Invalid', surname: 'PassportNum' },
                document: { ...baseSubmission.document, number: 'ABC 123' },
            },
            {
                passenger: { ...baseSubmission.passenger, givenName: 'Expired', surname: 'Passport' },
                document: { ...baseSubmission.document, expiryDate: '2022-01-01' },
            }
        ];

        // Fix: Explicitly type the return value of the map function to ensure it conforms to ApiSubmissionDetail.
        // This prevents the 'status' property from being widened to a generic 'string' type.
        const processedSubmissions = newSubmissionsToProcess.map((sub): ApiSubmissionDetail => {
            const fullSubmission = {
                ...baseSubmission,
                ...sub,
                transactionId: `TR-${Math.floor(Math.random() * 9000) + 1000}`
            } as ApiSubmissionDetail;
            
            const { isValid, errors } = validateApiSubmission(fullSubmission);
            const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
            
            return {
                ...fullSubmission,
                timestamp: now,
                status: isValid ? 'Processed' : 'Rejected',
                system: {
                    ...fullSubmission.system,
                    processingTimestamp: now,
                    validationErrors: isValid ? undefined : `${errors.length} Error(s) Found:\n- ${errors.join('\n- ')}`,
                    auditTrail: [
                        { timestamp: now, action: 'iAPI Received', user: 'System (Simulated)' },
                        { timestamp: now, action: `Validation ${isValid ? 'Success' : 'Failed'}`, user: 'System' },
                        ...(isValid ? [{ timestamp: now, action: 'Risk Assessment Completed', user: 'AI-Module' }] : [])
                    ]
                }
            };
        });

        setSubmissions(prev => [...processedSubmissions, ...prev]);
    };

    if (selectedSubmission) {
        return <IndividualApiRecordView submission={selectedSubmission} onBack={handleBackToList} />;
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                 <Card>
                    <p className="text-sm text-gray-500">Total Submissions (24h)</p>
                    <p className="text-4xl font-bold text-brand-primary">{statusData.reduce((acc, i) => acc + i.value, 0).toLocaleString()}</p>
                 </Card>
                 <Card>
                    <p className="text-sm text-gray-500">Flights Processed (24h)</p>
                    <p className="text-4xl font-bold text-brand-primary">482</p>
                 </Card>
                 <Card>
                    <p className="text-sm text-gray-500">Pending iAPI Decisions</p>
                    <p className="text-4xl font-bold text-status-amber">{statusData.find(s=>s.name === 'Pending')?.value}</p>
                 </Card>
                 <Card>
                    <p className="text-sm text-gray-500">Validation Errors (24h)</p>
                    <p className="text-4xl font-bold text-status-red">{statusData.find(s=>s.name === 'Rejected')?.value}</p>
                 </Card>
                 <Card>
                    <p className="text-sm text-gray-500">"No-Board" Directives</p>
                    <p className="text-4xl font-bold text-status-red">12</p>
                 </Card>
            </div>

            <Card title="API Validation Rules">
                <div className="space-y-4">
                    {validationRules.map(rule => {
                        const isActive = rule.status === 'Active';
                        return (
                            <div 
                                key={rule.id} 
                                className={`flex justify-between items-center p-4 rounded-lg border-l-4 transition-colors duration-200 ${
                                    isActive 
                                    ? 'bg-status-green/10 border-status-green' 
                                    : 'bg-gray-100 border-gray-300'
                                }`}
                            >
                                <div className="flex-grow pr-4">
                                    <div className="flex items-baseline space-x-2">
                                        <p className={`font-bold ${isActive ? 'text-brand-dark' : 'text-gray-600'}`}>{rule.name}</p>
                                        <p className={`text-xs font-mono ${isActive ? 'text-gray-500' : 'text-gray-400'}`}>({rule.id})</p>
                                    </div>
                                    <p className={`text-sm mt-1 ${isActive ? 'text-gray-700' : 'text-gray-500'}`}>{rule.description}</p>
                                </div>
                                <div className="flex items-center space-x-4 flex-shrink-0">
                                    <span className={`text-sm font-medium ${isActive ? 'text-status-green' : 'text-gray-500'}`}>
                                        {rule.status}
                                    </span>
                                    <ToggleSwitch 
                                        enabled={isActive} 
                                        onChange={() => handleToggleRule(rule.id)} 
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title="Real-time API Response Times" className="lg:col-span-2">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={apiResponseTimeData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft' }} />
                            <Tooltip formatter={(value: number) => `${value} ms`} />
                            <Legend />
                            <Line type="monotone" dataKey="interactive" name="Interactive API" stroke="#1e3a8a" strokeWidth={2} />
                            <Line type="monotone" dataKey="batch" name="Batch API" stroke="#3b82f6" />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
                <Card title="Submission Status">
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>
            
            <Card title={
                <div className="flex justify-between items-center">
                    <span>Recent API Submissions</span>
                    <button
                        onClick={handleSimulateSubmissions}
                        className="px-3 py-1.5 bg-brand-light text-brand-primary text-sm font-semibold rounded-md border border-brand-secondary hover:bg-brand-secondary hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors"
                    >
                        Simulate New iAPI Submissions
                    </button>
                </div>
            }>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Flight</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Passenger</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                           {submissions.map(s => (
                               <tr key={s.transactionId} onClick={() => handleViewDetails(s)} className="hover:bg-gray-50 cursor-pointer" title="Click to view details">
                                   <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{s.transactionId}</td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{s.manifest.airlineCode} {s.manifest.flightNumber}</td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{s.passenger.surname}, {s.passenger.givenName}</td>
                                   <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            s.status === 'Processed' ? 'bg-green-100 text-green-800' : 
                                            s.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                                        }`}>{s.status}</span>
                                   </td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.timestamp}</td>
                               </tr>
                           ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};