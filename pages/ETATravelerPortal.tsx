
import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { DevicePhoneMobileIcon, GlobeAmericasIcon, CheckCircleIcon, IdentificationIcon, VideoCameraIcon, ArrowPathIcon, ExclamationTriangleIcon } from '../constants';
import { etaService } from '../services/etaService';
import type { ETAApplication } from '../types';

// Mock component for NFC scanning animation
const NFCScanner: React.FC<{ onScanComplete: () => void }> = ({ onScanComplete }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onScanComplete();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onScanComplete]);

    return (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-blue-300 animate-pulse">
            <IdentificationIcon className="h-16 w-16 text-blue-500 mb-4" />
            <p className="text-lg font-bold text-blue-800">Scanning ePassport Chip...</p>
            <p className="text-sm text-gray-500 mt-2">Hold your device near the passport cover.</p>
            <div className="w-48 h-2 bg-gray-200 rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-blue-500 animate-scan"></div>
            </div>
            <style>{`
                @keyframes scan {
                    0% { width: 0%; }
                    100% { width: 100%; }
                }
                .animate-scan {
                    animation: scan 3s linear forwards;
                }
            `}</style>
        </div>
    );
};

// Mock component for Liveness Detection
const LivenessCam: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [instruction, setInstruction] = useState('Position your face in the frame');
    
    useEffect(() => {
        setTimeout(() => setInstruction('Blink now...'), 1500);
        setTimeout(() => setInstruction('Turn slightly left...'), 3000);
        setTimeout(() => setInstruction('Verifying...'), 4500);
        setTimeout(() => onComplete(), 6000);
    }, [onComplete]);

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="relative w-64 h-64 bg-black rounded-full overflow-hidden border-4 border-green-500 shadow-xl">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-40 h-56 border-2 border-white/50 rounded-full opacity-50"></div>
                </div>
                <VideoCameraIcon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-12 w-12 text-white/20" />
                <div className="absolute bottom-4 left-0 right-0 text-center">
                    <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm font-bold">{instruction}</span>
                </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">Liveness Detection Active</p>
        </div>
    );
};

export const ETATravelerPortal: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'apply' | 'status'>('apply');
    const [currentStep, setCurrentStep] = useState(1);
    const [isMobileMode, setIsMobileMode] = useState(false); // Simulate mobile view width
    
    // Application State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        passportNumber: '',
        nationality: '',
        dob: '',
        email: '',
        purpose: 'Tourism'
    });
    const [nfcScanning, setNfcScanning] = useState(false);
    const [nfcDataLoaded, setNfcDataLoaded] = useState(false);
    const [biometricStep, setBiometricStep] = useState<'idle' | 'scanning' | 'complete'>('idle');
    
    // Submission Result State
    const [submissionResult, setSubmissionResult] = useState<ETAApplication | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionError, setSubmissionError] = useState<string | null>(null);
    
    // Status Check State
    const [checkRef, setCheckRef] = useState('');
    const [checkStatusResult, setCheckStatusResult] = useState<{ status: string, message: string } | null>(null);

    const handleNfcScan = () => {
        setNfcScanning(true);
    };

    const handleNfcComplete = () => {
        setNfcScanning(false);
        setNfcDataLoaded(true);
        // Simulate data read from chip
        setFormData(prev => ({
            ...prev,
            firstName: 'ALEX',
            lastName: 'MORGAN',
            passportNumber: 'P12345678',
            nationality: 'USA',
            dob: '1990-05-15'
        }));
    };

    const handleLivenessStart = () => {
        setBiometricStep('scanning');
    };

    const handleBiometricComplete = () => {
        setBiometricStep('complete');
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmissionError(null);
        try {
            const result = await etaService.submitApplication(formData);
            setSubmissionResult(result);
            setCurrentStep(5); // Success/Result step
        } catch (error: any) {
            setSubmissionError(error.message || "An error occurred during submission.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleCheckStatus = async () => {
        // This simulates a basic status check.
        // In a real app, this would query the backend.
        if (!checkRef) return;
        
        const mockResponse = await etaService.checkStatus(checkRef, 'DUMMY');
        
        if (mockResponse) {
             setCheckStatusResult({
                status: mockResponse.status,
                message: `Application found. Current status: ${mockResponse.status}.`
            });
        } else {
             // Default mock for demo purposes if ID doesn't match predefined mock
             setCheckStatusResult({
                status: 'PENDING',
                message: 'Your application is currently being processed.'
            });
        }
    };

    const getStatusColor = (status: string) => {
        if (status === 'Approved') return 'bg-green-100 text-green-800';
        if (status === 'Denied') return 'bg-red-100 text-red-800';
        return 'bg-amber-100 text-amber-800';
    };

    return (
        <div className={`mx-auto transition-all duration-300 ${isMobileMode ? 'max-w-sm' : 'max-w-4xl'}`}>
            {/* Header / Toggle */}
            <div className="flex justify-end mb-4">
                <button 
                    onClick={() => setIsMobileMode(!isMobileMode)} 
                    className="flex items-center text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                >
                    <DevicePhoneMobileIcon className="h-4 w-4 mr-1" />
                    {isMobileMode ? 'Switch to Desktop View' : 'Simulate Mobile App View'}
                </button>
            </div>

            {/* App Container */}
            <div className="bg-white min-h-[600px] shadow-2xl rounded-xl overflow-hidden border border-gray-200 flex flex-col">
                {/* App Header */}
                <div className="bg-brand-primary p-4 text-white flex items-center justify-between">
                    <div className="flex items-center">
                        <GlobeAmericasIcon className="h-8 w-8 mr-3" />
                        <div>
                            <h1 className="font-bold text-lg">National ETA Portal</h1>
                            <p className="text-xs text-blue-200">Official Government Application</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b">
                    <button 
                        onClick={() => setActiveTab('apply')} 
                        className={`flex-1 py-3 text-sm font-bold ${activeTab === 'apply' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-500'}`}
                    >
                        Apply for ETA
                    </button>
                    <button 
                        onClick={() => setActiveTab('status')} 
                        className={`flex-1 py-3 text-sm font-bold ${activeTab === 'status' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-500'}`}
                    >
                        Check Status
                    </button>
                </div>

                {/* Content Area */}
                <div className="p-6 flex-1 overflow-y-auto">
                    {activeTab === 'apply' && (
                        <div className="space-y-6">
                            {/* Progress Stepper */}
                            {submissionResult === null && (
                                <div className="flex justify-between mb-6 px-2">
                                    {[1, 2, 3, 4].map(step => (
                                        <div key={step} className="flex flex-col items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep >= step ? 'bg-brand-secondary text-white' : 'bg-gray-200 text-gray-500'}`}>
                                                {step}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Step 1: Intro & Passport */}
                            {currentStep === 1 && (
                                <div className="space-y-4 animate-fade-in">
                                    <h2 className="text-xl font-bold text-brand-dark">Passport Details</h2>
                                    <p className="text-sm text-gray-600">Use your device to scan your ePassport chip for faster entry.</p>
                                    
                                    {!nfcScanning && !nfcDataLoaded && (
                                        <button 
                                            onClick={handleNfcScan}
                                            className="w-full py-4 border-2 border-dashed border-brand-secondary rounded-lg flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 transition-colors"
                                        >
                                            <IdentificationIcon className="h-10 w-10 text-brand-secondary mb-2" />
                                            <span className="font-bold text-brand-secondary">Scan ePassport (NFC)</span>
                                        </button>
                                    )}

                                    {nfcScanning && <NFCScanner onScanComplete={handleNfcComplete} />}

                                    {nfcDataLoaded && (
                                        <div className="bg-green-50 border border-green-200 p-3 rounded flex items-center mb-4">
                                            <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                                            <span className="text-sm text-green-800 font-semibold">Chip Authenticated Successfully</span>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <input type="text" placeholder="Given Names" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full p-3 border rounded-lg bg-gray-50" disabled={nfcDataLoaded} />
                                        <input type="text" placeholder="Surname" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full p-3 border rounded-lg bg-gray-50" disabled={nfcDataLoaded} />
                                        <input type="text" placeholder="Passport Number" value={formData.passportNumber} onChange={e => setFormData({...formData, passportNumber: e.target.value})} className="w-full p-3 border rounded-lg bg-gray-50" disabled={nfcDataLoaded} />
                                        <div className="grid grid-cols-2 gap-3">
                                            <input type="text" placeholder="Nationality (e.g., USA)" value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} className="w-full p-3 border rounded-lg bg-gray-50" disabled={nfcDataLoaded} />
                                            <input type="date" placeholder="Date of Birth" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full p-3 border rounded-lg bg-gray-50" disabled={nfcDataLoaded} />
                                        </div>
                                    </div>
                                    <button onClick={() => setCurrentStep(2)} className="w-full py-3 bg-brand-primary text-white font-bold rounded-lg mt-4">Next: Biometrics</button>
                                </div>
                            )}

                            {/* Step 2: Biometrics */}
                            {currentStep === 2 && (
                                <div className="space-y-6 animate-fade-in">
                                    <h2 className="text-xl font-bold text-brand-dark">Identity Verification</h2>
                                    <p className="text-sm text-gray-600">We need to verify that you are a real person matching the passport photo.</p>
                                    
                                    {biometricStep === 'idle' && (
                                         <button 
                                            onClick={handleLivenessStart}
                                            className="w-full py-12 bg-gray-100 rounded-lg border border-gray-300 flex flex-col items-center justify-center hover:bg-gray-200 transition-colors"
                                        >
                                            <VideoCameraIcon className="h-12 w-12 text-gray-500 mb-3" />
                                            <span className="font-bold text-gray-700">Start Liveness Check (Selfie)</span>
                                        </button>
                                    )}

                                    {biometricStep === 'scanning' && <LivenessCam onComplete={handleBiometricComplete} />}

                                    {biometricStep === 'complete' && (
                                        <div className="text-center py-8">
                                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <CheckCircleIcon className="h-12 w-12 text-green-600" />
                                            </div>
                                            <h3 className="text-lg font-bold text-green-800">Face Verified</h3>
                                            <p className="text-sm text-gray-600">Liveness check passed. Biometrics captured securely.</p>
                                        </div>
                                    )}
                                    
                                    <div className="flex gap-3">
                                        <button onClick={() => setCurrentStep(1)} className="flex-1 py-3 border border-gray-300 text-gray-600 font-bold rounded-lg">Back</button>
                                        <button onClick={() => setCurrentStep(3)} disabled={biometricStep !== 'complete'} className="flex-1 py-3 bg-brand-primary text-white font-bold rounded-lg disabled:bg-gray-300">Next: Trip Details</button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Trip Details */}
                            {currentStep === 3 && (
                                <div className="space-y-4 animate-fade-in">
                                     <h2 className="text-xl font-bold text-brand-dark">Trip Information</h2>
                                     <div className="space-y-3">
                                        <label className="block text-sm font-medium text-gray-700">Purpose of Visit</label>
                                        <select value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})} className="w-full p-3 border rounded-lg bg-white">
                                            <option>Tourism</option>
                                            <option>Business</option>
                                            <option>Education</option>
                                            <option>Transit</option>
                                        </select>
                                        
                                        <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                                        <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-3 border rounded-lg" placeholder="name@example.com" />
                                        
                                        <div className="p-4 bg-gray-50 rounded text-xs text-gray-500">
                                            By submitting this application, you declare that the information provided is true and correct.
                                        </div>
                                     </div>
                                     <div className="flex gap-3">
                                        <button onClick={() => setCurrentStep(2)} className="flex-1 py-3 border border-gray-300 text-gray-600 font-bold rounded-lg">Back</button>
                                        <button onClick={() => setCurrentStep(4)} className="flex-1 py-3 bg-brand-primary text-white font-bold rounded-lg">Review</button>
                                    </div>
                                </div>
                            )}

                             {/* Step 4: Review */}
                            {currentStep === 4 && (
                                <div className="space-y-4 animate-fade-in">
                                    <h2 className="text-xl font-bold text-brand-dark">Review Application</h2>
                                    {submissionError && (
                                        <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-red-800 text-sm">
                                            <p className="font-bold">Submission Error</p>
                                            <p>{submissionError}</p>
                                        </div>
                                    )}
                                    <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                                        <p><span className="font-bold">Name:</span> {formData.firstName} {formData.lastName}</p>
                                        <p><span className="font-bold">Passport:</span> {formData.passportNumber} ({formData.nationality})</p>
                                        <p><span className="font-bold">DOB:</span> {formData.dob}</p>
                                        <p><span className="font-bold">Purpose:</span> {formData.purpose}</p>
                                        <p><span className="font-bold">Email:</span> {formData.email}</p>
                                        <p className="flex items-center text-green-600 font-bold"><CheckCircleIcon className="h-4 w-4 mr-1"/> Biometrics Captured</p>
                                    </div>
                                    <button onClick={handleSubmit} disabled={isSubmitting} className="w-full py-4 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition-transform hover:scale-[1.02] disabled:bg-green-400 disabled:cursor-wait flex items-center justify-center">
                                        {isSubmitting ? (
                                            <>
                                                <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                                                Processing...
                                            </>
                                        ) : 'Submit Application'}
                                    </button>
                                    <button onClick={() => setCurrentStep(3)} disabled={isSubmitting} className="w-full py-3 text-gray-500 text-sm underline">Edit Details</button>
                                </div>
                            )}

                            {/* Step 5: Result / Success */}
                            {currentStep === 5 && submissionResult && (
                                <div className="text-center py-10 animate-scale-in">
                                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${getStatusColor(submissionResult.status)}`}>
                                        {submissionResult.status === 'Approved' && <CheckCircleIcon className="h-16 w-16" />}
                                        {submissionResult.status === 'Denied' && <ExclamationTriangleIcon className="h-16 w-16" />}
                                        {submissionResult.status === 'Pending Review' && <ArrowPathIcon className="h-16 w-16" />}
                                    </div>
                                    
                                    <h2 className="text-2xl font-bold text-brand-dark mb-2">Application {submissionResult.status}</h2>
                                    
                                    {submissionResult.status === 'Approved' && <p className="text-gray-600 mb-6">Your ETA has been granted successfully. Safe travels!</p>}
                                    {submissionResult.status === 'Pending Review' && <p className="text-gray-600 mb-6">Your application requires further manual review. You will be notified via email.</p>}
                                    {submissionResult.status === 'Denied' && <p className="text-gray-600 mb-6">Your application has been refused. Please contact the nearest embassy.</p>}

                                    <div className="bg-gray-100 p-4 rounded-lg inline-block mb-6 text-left w-full max-w-xs">
                                        <p className="text-xs text-gray-500 uppercase font-bold">Reference Number</p>
                                        <p className="text-xl font-mono font-bold text-brand-primary mb-3">{submissionResult.id}</p>
                                        
                                        <p className="text-xs text-gray-500 uppercase font-bold">Email Notification</p>
                                        <p className="text-sm text-gray-800">Sent to {submissionResult.email}</p>
                                    </div>
                                    
                                    <div className="block">
                                         <button onClick={() => { setCurrentStep(1); setSubmissionResult(null); }} className="mt-4 text-brand-secondary font-bold border border-brand-secondary px-4 py-2 rounded hover:bg-blue-50">Start New Application</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'status' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-brand-dark">Check Application Status</h2>
                            <div className="space-y-4">
                                <input type="text" placeholder="Application Reference (e.g., ETA-123...)" value={checkRef} onChange={e => setCheckRef(e.target.value)} className="w-full p-3 border rounded-lg" />
                                <input type="text" placeholder="Passport Number" className="w-full p-3 border rounded-lg" />
                                <button onClick={handleCheckStatus} className="w-full py-3 bg-brand-secondary text-white font-bold rounded-lg">Check Status</button>
                            </div>
                            
                            {checkStatusResult && (
                                <div className="mt-6 p-6 bg-gray-50 rounded-lg border text-center animate-fade-in">
                                    <p className="text-sm text-gray-500 uppercase font-bold mb-2">Current Status</p>
                                    <span className={`px-4 py-2 rounded-full text-lg font-bold ${getStatusColor(checkStatusResult.status === 'APPROVED' ? 'Approved' : checkStatusResult.status === 'DENIED' ? 'Denied' : 'Pending Review')}`}>
                                        {checkStatusResult.status}
                                    </span>
                                    <p className="mt-4 text-sm text-gray-700">{checkStatusResult.message}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
