import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Card } from '../components/Card';
import type { CarrierSubmission, BoardingDirective, CarrierApplication, ManagedCarrierAccount } from '../types';

// --- ICONS ---
const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm10.5 2.962a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
    </svg>
);

const BriefcaseIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.075c0 1.313-.964 2.446-2.25 2.612A48.249 48.249 0 0112 21c-2.773 0-5.491-.213-8.16-.612a2.625 2.625 0 01-2.25-2.612v-4.075m16.5 0v-3.825c0-1.313-.964-2.446-2.25-2.612A48.249 48.249 0 0012 7.5c-2.773 0-5.491-.213-8.16-.612a2.625 2.625 0 00-2.25 2.612v3.825m16.5 0h-16.5" />
    </svg>
);

const PaperAirplaneIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
);


const PencilSquareIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
);

const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-3.181-3.182l-3.182 3.182a8.25 8.25 0 01-11.664 0l-3.182-3.182m3.182-3.182h4.992m-4.993 0v4.992" />
    </svg>
);

const ServerStackIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
    </svg>
);

const EnvelopeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
);

const CodeBracketIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    </svg>
);

// --- MOCK DATA ---
const initialSubmissions: CarrierSubmission[] = [
    { id: 'SUB-001', method: 'Upload', submissionType: 'Passenger Manifest', fileName: 'PAXLST_MH370_20231027.csv', timestamp: '2023-10-27 14:30:15', status: 'Validated', passengerCount: 289, errorCount: 0 },
    { id: 'SUB-004', method: 'SFTP', submissionType: 'Passenger Manifest', fileName: 'BATCH_20231028_0400.xml', timestamp: '2023-10-28 04:00:05', status: 'Validated', passengerCount: 1240, errorCount: 0 },
    { 
        id: 'SUB-002', 
        method: 'Manual', 
        submissionType: 'Single Passenger', 
        timestamp: '2023-10-27 11:15:45', 
        status: 'Rejected', 
        passengerCount: 1, 
        errorCount: 1,
        errorDetails: {
          rawError: "VALIDATION_FAIL: Field 'passport_expiry' is before NOW()",
          userMessage: "The passport expiry date for passenger SMITH, Jane has passed.",
          suggestion: "Verify the passport's expiration date. If the date is correct and in the past, the passenger may not be eligible to travel."
        } 
      },
    { id: 'SUB-005', method: 'Email', submissionType: 'General Declaration', fileName: 'GenDec_N918J.pdf', timestamp: '2023-10-28 08:15:20', status: 'Requires Attention', passengerCount: 3, errorCount: 0 },
    { id: 'SUB-006', method: 'HTTP Post', submissionType: 'Crew Manifest', fileName: 'api-submission.json', timestamp: '2023-10-28 09:05:11', status: 'Processing', passengerCount: 0, errorCount: 0 },
    { id: 'SUB-003', method: 'Upload', submissionType: 'Crew Manifest', fileName: 'CARGO55_CREW.xml', timestamp: '2023-10-26 18:05:00', status: 'Validated', passengerCount: 4, errorCount: 0 },
     { 
        id: 'SUB-007', 
        method: 'Upload', 
        submissionType: 'Passenger Manifest', 
        fileName: 'PAXLST_AK52.csv',
        timestamp: '2023-10-28 10:11:32', 
        status: 'Rejected', 
        passengerCount: 180, 
        errorCount: 2,
        errorDetails: {
          rawError: "FORMAT_ERROR: CSV column count mismatch on line 52. Expected 15, found 14.",
          userMessage: "The file format is incorrect. A row in the CSV file has the wrong number of columns.",
          suggestion: "Please check row 52 in your CSV file. Ensure it has exactly 15 columns, even if some are empty, and re-upload."
        } 
      },
];

const initialDirectives: BoardingDirective[] = [
    { id: 'DIR-001', passengerName: 'JOHNSON, Michael', flightNumber: 'MH370', directive: 'HOLD FOR REVIEW', reason: 'Document validation pending secondary check.', timestamp: '2023-10-27 14:32:00' },
    { id: 'DIR-002', passengerName: 'LEE, Wei', flightNumber: 'AK52', directive: 'OK TO BOARD', timestamp: '2023-10-26 18:07:21' },
];

const initialApplications: CarrierApplication[] = [
    { id: 'APP-01', carrierName: 'JetSetGo Charters', contactPerson: 'Alice Wong', email: 'alice@jetsetgo.com', dateSubmitted: '2023-10-27', status: 'Pending' },
    { id: 'APP-02', carrierName: 'Global Air Cargo', contactPerson: 'Bob Williams', email: 'ops@globalair.com', dateSubmitted: '2023-10-26', status: 'Pending' },
];

const initialManagedAccounts: ManagedCarrierAccount[] = [
    { id: 'ACC-01', carrierName: 'Malaysia Airlines', status: 'Active', totalSubmissions: 1502, errorRate: 0.1 },
    { id: 'ACC-02', carrierName: 'AirAsia', status: 'Active', totalSubmissions: 3489, errorRate: 0.5 },
    { id: 'ACC-03', carrierName: 'Batik Air', status: 'Suspended', totalSubmissions: 450, errorRate: 2.1 },
    { id: 'ACC-04', carrierName: 'MyJet Aviation', status: 'Active', totalSubmissions: 88, errorRate: 0.0 },
];

// --- HELPER & UI COMPONENTS ---

const getStatusPill = (status: CarrierSubmission['status']) => {
    switch (status) {
        case 'Validated': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Validated</span>;
        case 'Rejected': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>;
        case 'Processing': return <span className="px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800"><ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" /> Processing</span>;
        case 'Requires Attention': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">Requires Attention</span>;
        default: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Unknown</span>;
    }
};

const getDirectivePill = (directive: BoardingDirective['directive']) => {
    switch (directive) {
        case 'OK TO BOARD': return 'bg-status-green border-green-700';
        case 'DO NOT BOARD': return 'bg-status-red border-red-700';
        case 'HOLD FOR REVIEW': return 'bg-status-amber border-amber-700';
    }
};

const SubmissionButton: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
    disabled?: boolean;
}> = ({ icon, title, description, onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="text-center p-4 h-full flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-brand-secondary hover:bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed group"
    >
        <div className="text-brand-primary group-hover:text-brand-secondary transition-colors duration-200">{icon}</div>
        <h3 className="mt-2 text-md font-semibold text-brand-dark">{title}</h3>
        <p className="mt-1 text-xs text-gray-500">{description}</p>
    </button>
);

const ToggleSwitch: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void; ariaLabel: string }> = ({ enabled, onChange, ariaLabel }) => {
    return (
      <button
        type="button"
        className={`${
          enabled ? 'bg-brand-primary' : 'bg-gray-200'
        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2`}
        role="switch"
        aria-checked={enabled}
        aria-label={ariaLabel}
        onClick={() => onChange(!enabled)}
      >
        <span
          aria-hidden="true"
          className={`${
            enabled ? 'translate-x-5' : 'translate-x-0'
          } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
      </button>
    );
  };

export const CarrierPortalDashboard: React.FC = () => {
    const [submissions, setSubmissions] = useState<CarrierSubmission[]>(initialSubmissions);
    const [directives, setDirectives] = useState<BoardingDirective[]>(initialDirectives);
    const [isUploading, setIsUploading] = useState(false);
    const [newDirectiveId, setNewDirectiveId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [currentSubmissionType, setCurrentSubmissionType] = useState<CarrierSubmission['submissionType'] | null>(null);
    const [isAdminView, setIsAdminView] = useState(false);
    
    // Admin states
    const [applications, setApplications] = useState<CarrierApplication[]>(initialApplications);
    const [accounts, setAccounts] = useState<ManagedCarrierAccount[]>(initialManagedAccounts);
    const [selectedErrorSubmission, setSelectedErrorSubmission] = useState<CarrierSubmission | null>(null);

    const handleUploadClick = (submissionType: 'Passenger Manifest' | 'Crew Manifest' | 'General Declaration') => {
        setCurrentSubmissionType(submissionType);
        fileInputRef.current?.click();
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && currentSubmissionType) {
            setIsUploading(true);
            const newSubmission: CarrierSubmission = {
                id: `SUB-${String(submissions.length + 101).padStart(3, '0')}`,
                method: 'Upload',
                submissionType: currentSubmissionType,
                fileName: file.name,
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                status: 'Processing',
                passengerCount: 0,
                errorCount: 0,
            };
            setSubmissions(prev => [newSubmission, ...prev]);

            setTimeout(() => {
                const isSuccess = Math.random() > 0.2;
                setSubmissions(prev => prev.map(s => s.id === newSubmission.id ? { ...s, status: isSuccess ? 'Validated' : 'Rejected', passengerCount: isSuccess ? Math.floor(Math.random() * 200) + 50 : 0, errorCount: isSuccess ? 0 : 1 + Math.floor(Math.random() * 5) } : s));

                if (isSuccess && Math.random() > 0.4) {
                    const directiveOptions: BoardingDirective['directive'][] = ['DO NOT BOARD', 'HOLD FOR REVIEW'];
                    const newDirective: BoardingDirective = {
                        id: `DIR-${String(directives.length + 101).padStart(3, '0')}`,
                        passengerName: 'WILLIAMS, Olivia',
                        flightNumber: file.name.split('_')[1] || 'XX123',
                        directive: directiveOptions[Math.floor(Math.random() * directiveOptions.length)],
                        reason: 'High-risk score detected from PNR analysis.',
                        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                    };
                    setDirectives(prev => [newDirective, ...prev]);
                    setNewDirectiveId(newDirective.id);
                    setTimeout(() => setNewDirectiveId(null), 2100);
                }
                setIsUploading(false);
            }, 3000);
        }
        if (event.target) {
            event.target.value = '';
        }
    };
    
    const handleApprove = (appId: string) => {
        const app = applications.find(a => a.id === appId);
        if (!app) return;
        const newAccount: ManagedCarrierAccount = {
            id: `ACC-${String(accounts.length + 10).padStart(3, '0')}`,
            carrierName: app.carrierName,
            status: 'Active',
            totalSubmissions: 0,
            errorRate: 0,
        };
        setAccounts(prev => [newAccount, ...prev]);
        setApplications(prev => prev.filter(a => a.id !== appId));
    };

    const handleReject = (appId: string) => {
        setApplications(prev => prev.filter(a => a.id !== appId));
    };

    const handleToggleAccountStatus = (accId: string) => {
        setAccounts(prev => prev.map(acc => acc.id === accId ? { ...acc, status: acc.status === 'Active' ? 'Suspended' : 'Active' } : acc));
    };

    const rejectedSubmissions = useMemo(() => submissions.filter(s => s.status === 'Rejected' && s.errorDetails), [submissions]);

    const ErrorDetailModal: React.FC<{ submission: CarrierSubmission; onClose: () => void }> = ({ submission, onClose }) => (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <Card title="Submission Error Details" className="w-full max-w-2xl animate-scale-in">
                <p className="text-sm text-gray-500 mb-4">File: <span className="font-mono">{submission.fileName}</span></p>
                <div className="space-y-4">
                    <div>
                        <h4 className="text-md font-semibold text-gray-800">User-Friendly Message</h4>
                        <p className="mt-1 p-3 rounded-lg bg-red-50 text-red-800 border-l-4 border-red-400">{submission.errorDetails?.userMessage}</p>
                    </div>
                     <div>
                        <h4 className="text-md font-semibold text-gray-800">System Suggestion</h4>
                        <p className="mt-1 p-3 rounded-lg bg-blue-50 text-blue-800 border-l-4 border-blue-400">{submission.errorDetails?.suggestion}</p>
                    </div>
                     <div>
                        <h4 className="text-md font-semibold text-gray-800">Raw System Error</h4>
                        <code className="block mt-1 p-3 rounded-lg bg-gray-800 text-gray-200 text-sm font-mono overflow-x-auto">{submission.errorDetails?.rawError}</code>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-dark">Close</button>
                </div>
            </Card>
        </div>
    );
    
    return (
        <div className="space-y-6">
            {selectedErrorSubmission && <ErrorDetailModal submission={selectedErrorSubmission} onClose={() => setSelectedErrorSubmission(null)} />}
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} accept=".csv,.xml,.txt,application/EDIFACT" />
            
            <div className="flex justify-between items-center">
                <Card title="Carrier Portal" className="flex-grow !mb-0 !pb-0 !shadow-none !bg-transparent">
                    <p className="text-gray-600 -mt-4">
                        A secure, web-based, flexible alternative to the highly-automated Government Gateway.
                    </p>
                </Card>
                <div className="flex items-center space-x-3 bg-white p-2 rounded-lg shadow-md">
                    <span className={`font-semibold ${!isAdminView ? 'text-brand-primary' : 'text-gray-500'}`}>Carrier View</span>
                    <ToggleSwitch enabled={isAdminView} onChange={setIsAdminView} ariaLabel="Toggle Admin View" />
                    <span className={`font-semibold ${isAdminView ? 'text-brand-primary' : 'text-gray-500'}`}>Gov Admin View</span>
                </div>
            </div>

            {!isAdminView ? (
                <>
                    <Card>
                        <p className="text-gray-600">
                            This portal is designed for low-volume and manual submissions from small airlines, charter services, general aviation (private/corporate jets), and cargo carriers. Please select a submission type below to begin.
                        </p>
                    </Card>
                    <Card title="Multi-Modal Data Submission Methods">
                        <div className="space-y-6">
                             <div>
                                <h3 className="text-lg font-semibold text-brand-dark mb-3">Interactive Submissions</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <SubmissionButton icon={<UsersIcon className="h-10 w-10" />} title="Passenger Manifest" description="Upload a PAXLST for a commercial or charter flight." onClick={() => handleUploadClick('Passenger Manifest')} disabled={isUploading} />
                                    <SubmissionButton icon={<BriefcaseIcon className="h-10 w-10" />} title="Crew Manifest" description="Submit crew information for cargo or non-passenger flights." onClick={() => handleUploadClick('Crew Manifest')} disabled={isUploading} />
                                    <SubmissionButton icon={<PaperAirplaneIcon className="h-10 w-10" />} title="General Declaration" description="For private and corporate general aviation flights." onClick={() => handleUploadClick('General Declaration')} disabled={isUploading} />
                                    <SubmissionButton icon={<PencilSquareIcon className="h-10 w-10" />} title="Manual Passenger Entry" description="Enter data for a single passenger via a web form." onClick={() => { alert('Manual entry form not yet implemented.'); }} disabled={isUploading} />
                                </div>
                                {isUploading && ( <div className="mt-4 text-center"><p className="text-sm text-brand-secondary animate-pulse font-semibold">Processing upload, please wait...</p></div> )}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-brand-dark mb-3 border-t pt-6">Automated & Alternative Methods</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="p-4 bg-gray-50 rounded-lg border">
                                        <div className="flex items-center mb-2"><ServerStackIcon className="h-6 w-6 mr-3 text-brand-primary" /><h4 className="font-bold text-brand-dark">Secure FTP (SFTP)</h4></div>
                                        <p className="text-sm text-gray-600 mb-2">Upload batch files to a secure drop-box.</p><p className="text-xs text-gray-500">Address:</p><code className="text-sm font-mono bg-gray-200 text-gray-800 p-1 rounded-md">sftp://sftp.m-apss.gov.my:2222/uploads</code>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg border">
                                        <div className="flex items-center mb-2"><EnvelopeIcon className="h-6 w-6 mr-3 text-brand-primary" /><h4 className="font-bold text-brand-dark">Email Attachment</h4></div>
                                        <p className="text-sm text-gray-600 mb-2">Send compliant files as attachments to a monitored inbox.</p><p className="text-xs text-gray-500">Address:</p><code className="text-sm font-mono bg-gray-200 text-gray-800 p-1 rounded-md">manifests@m-apss.gov.my</code>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg border">
                                        <div className="flex items-center mb-2"><CodeBracketIcon className="h-6 w-6 mr-3 text-brand-primary" /><h4 className="font-bold text-brand-dark">Direct HTTP Posting</h4></div>
                                        <p className="text-sm text-gray-600 mb-2">Post files from your system to our API endpoint.</p><p className="text-xs text-gray-500">Endpoint:</p><code className="block text-sm font-mono bg-gray-200 text-gray-800 p-1 rounded-md overflow-x-auto">https://api.m-apss.gov.my/v1/submit</code>
                                        <details className="mt-2 text-xs"><summary className="cursor-pointer text-gray-500 hover:text-gray-800">Show cURL example</summary><code className="block text-xs font-mono bg-gray-800 text-white p-2 rounded-md mt-1 overflow-x-auto">curl -X POST -F 'file=@/path/to/manifest.csv' https://api.m-apss.gov.my/v1/submit -H "Authorization: Bearer YOUR_API_KEY"</code></details>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                    <Card title="Recent Submissions">
                        <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type / File</th><th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Pax/Crew</th><th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Errors</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{submissions.map(s => (<tr key={s.id} className="hover:bg-gray-50"><td className="px-6 py-4 whitespace-nowrap">{getStatusPill(s.status)}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{s.timestamp}</td><td className="px-6 py-4 whitespace-nowrap"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{s.method}</span></td><td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{s.submissionType}</div>{s.fileName && <div className="text-sm text-gray-500 font-mono truncate max-w-xs">{s.fileName}</div>}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-800">{s.status === 'Processing' ? '...' : s.passengerCount}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-red-600">{s.errorCount > 0 ? s.errorCount : '-'}</td></tr>))}</tbody></table></div>
                    </Card>
                    <Card title="Boarding Directives">
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">{directives.map(d => (<div key={d.id} className={`p-4 rounded-lg border-l-8 shadow-md ${getDirectivePill(d.directive)} ${newDirectiveId === d.id ? 'new-alert-row' : ''}`}><div className="flex justify-between items-start"><div><p className="font-bold text-lg text-brand-dark">{d.passengerName} / {d.flightNumber}</p>{d.reason && <p className="text-sm text-gray-700 mt-1">{d.reason}</p>}</div><div className="text-right flex-shrink-0 ml-4"><p className={`font-extrabold text-lg ${d.directive === 'OK TO BOARD' ? 'text-green-800' : d.directive === 'DO NOT BOARD' ? 'text-red-800' : 'text-amber-800'}`}>{d.directive}</p><p className="text-xs text-gray-500 font-mono">{d.timestamp}</p></div></div></div>))}</div>
                    </Card>
                </>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card title="New Carrier Applications"><div className="space-y-3">{applications.length > 0 ? applications.map(app => (<div key={app.id} className="p-3 bg-gray-50 rounded-lg border flex justify-between items-center"><div className="flex-1"><p className="font-semibold text-brand-dark">{app.carrierName}</p><p className="text-sm text-gray-600">{app.contactPerson} ({app.email})</p><p className="text-xs text-gray-400">Submitted: {app.dateSubmitted}</p></div><div className="flex space-x-2"><button onClick={() => handleApprove(app.id)} className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-md hover:bg-green-600">Approve</button><button onClick={() => handleReject(app.id)} className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-md hover:bg-red-600">Reject</button></div></div>)) : <p className="text-center text-gray-500 py-4">No pending applications.</p>}</div></Card>
                        <Card title="Managed Carrier Accounts"><div className="overflow-y-auto max-h-64"><table className="min-w-full divide-y divide-gray-200"><thead><tr><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Carrier</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Submissions</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Error Rate</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th></tr></thead><tbody className="divide-y divide-gray-200">{accounts.map(acc => (<tr key={acc.id}><td className="px-4 py-2 font-medium text-gray-800">{acc.carrierName}</td><td className="px-4 py-2 text-sm text-gray-600">{acc.totalSubmissions}</td><td className={`px-4 py-2 text-sm font-bold ${acc.errorRate > 1 ? 'text-red-600' : 'text-gray-600'}`}>{acc.errorRate.toFixed(1)}%</td><td className="px-4 py-2"><button onClick={() => handleToggleAccountStatus(acc.id)} className={`px-2 py-0.5 text-xs font-semibold rounded-full ${acc.status === 'Active' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'}`}>{acc.status}</button></td></tr>))}</tbody></table></div></Card>
                    </div>
                    <Card title="Submission Validation Engine: Failed Submissions Log" className="lg:col-span-2">
                        <p className="text-sm text-gray-600 mb-4">Displaying recent submissions that failed backend validation, with user-friendly error messages and system suggestions.</p>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">File Name / Type</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User-Friendly Error Message</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {rejectedSubmissions.map(sub => (
                                        <tr key={sub.id}>
                                            <td className="px-4 py-3 whitespace-nowrap font-mono text-sm text-gray-500">{sub.timestamp}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{sub.fileName || sub.submissionType}</div>
                                                <div className="text-sm text-gray-500">{sub.method}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-red-700">{sub.errorDetails?.userMessage}</td>
                                            <td className="px-4 py-3"><button onClick={() => setSelectedErrorSubmission(sub)} className="px-3 py-1 bg-brand-secondary text-white text-xs font-semibold rounded-md hover:bg-brand-primary">View Details</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};