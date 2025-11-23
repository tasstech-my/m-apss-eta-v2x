import React, { useState, useMemo } from 'react';
import { Card } from '../components/Card';
import { DetailSection, DetailItem } from '../components/DetailSection';
import type { ApiSubmissionDetail, AuditEvent } from '../types';

interface IndividualApiRecordViewProps {
  submission: ApiSubmissionDetail;
  onBack: () => void;
}

const getStatusPillColor = (status: ApiSubmissionDetail['status']) => {
    switch(status) {
        case 'Processed': return 'bg-green-100 text-green-800';
        case 'Pending': return 'bg-amber-100 text-amber-800';
        case 'Rejected': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

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


export const IndividualApiRecordView: React.FC<IndividualApiRecordViewProps> = ({ submission, onBack }) => {
  const { passenger, document, manifest, additionalInfo, system } = submission;
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    const groupedTrail = useMemo(() => {
        const events: AuditEvent[] = system.auditTrail;
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
    }, [system.auditTrail]);

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

  return (
    <Card>
      <div className="flex justify-between items-start mb-4">
        <div>
          <button onClick={onBack} className="text-brand-secondary hover:underline mb-2">&larr; Back to API Submissions</button>
          <h2 className="text-2xl font-bold text-brand-dark">API Record: {submission.transactionId}</h2>
          <div className="flex items-center space-x-4 mt-1">
              <p className="text-md text-gray-600">Flight: <strong>{manifest.airlineCode} {manifest.flightNumber}</strong> ({manifest.departureAirport} &rarr; {manifest.arrivalAirport})</p>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusPillColor(submission.status)}`}>{submission.status}</span>
          </div>
        </div>
        <div className="flex space-x-2">
            <button className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">Flag for Review</button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Override Decision</button>
        </div>
      </div>
      
      {system.validationErrors && (
            <div className="sm:col-span-2 md:col-span-3 mb-6">
                 <p className="text-sm font-medium text-gray-500">Validation Errors / Warnings</p>
                 <pre className="text-lg font-mono whitespace-pre-wrap text-red-700 bg-red-50 p-3 rounded-md mt-1">{system.validationErrors}</pre>
            </div>
        )}

      <DetailSection title="Core Passenger Data (ICAO Annex 9)">
        <DetailItem label="Surname" value={passenger.surname} />
        <DetailItem label="Given Name(s)" value={passenger.givenName} />
        <DetailItem label="Middle Name" value={passenger.middleName} />
        <DetailItem label="Gender" value={passenger.gender} />
        <DetailItem label="Date of Birth" value={passenger.dob} />
        <DetailItem label="Nationality" value={passenger.nationality} />
        <DetailItem label="Place of Birth" value={additionalInfo?.placeOfBirth} />
      </DetailSection>

      <DetailSection title="Complete Travel Document Details">
        <DetailItem label="Document Type" value={document.type} />
        <DetailItem label="Document Number" value={document.number} />
        <DetailItem label="Issuing Country" value={document.issuingCountry} />
        <DetailItem label="Expiration Date" value={document.expiryDate} />
      </DetailSection>

      <DetailSection title="Flight and Manifest Data">
        <DetailItem label="Airline / Flight Number" value={`${manifest.airlineCode} / ${manifest.flightNumber}`} />
        <DetailItem label="Departure Airport" value={manifest.departureAirport} />
        <DetailItem label="Arrival Airport" value={manifest.arrivalAirport} />
        <DetailItem label="Scheduled Departure" value={`${manifest.scheduledDepartureDate} at ${manifest.scheduledDepartureTime}`} />
        <DetailItem label="Manifest Type" value={manifest.manifestType} />
        <DetailItem label="API Message Format" value={manifest.apiMessageFormat} />
      </DetailSection>
      
      {additionalInfo && (
        <DetailSection title="Additional Passenger Information">
          <DetailItem label="Transit Status" value={additionalInfo.transitStatus} />
          {additionalInfo.destinationAddress && (
            <DetailItem 
                label="Destination Address" 
                value={
                    `${additionalInfo.destinationAddress.street}, ${additionalInfo.destinationAddress.city}, ${additionalInfo.destinationAddress.state} ${additionalInfo.destinationAddress.postalCode}, ${additionalInfo.destinationAddress.country}`
                } 
            />
          )}
          {additionalInfo.contact && (
            <React.Fragment>
              <DetailItem label="Email" value={additionalInfo.contact.email} />
              <DetailItem label="Phone" value={additionalInfo.contact.phone} />
            </React.Fragment>
          )}
          {additionalInfo.visa && (
            <React.Fragment>
              <DetailItem label="Visa Number" value={additionalInfo.visa.number} />
              <DetailItem label="Visa Type" value={additionalInfo.visa.type} />
              <DetailItem label="Visa Issuing Country" value={additionalInfo.visa.issuingCountry} />
              <DetailItem label="Visa Issue Date" value={additionalInfo.visa.issueDate} />
              <DetailItem label="Visa Expiration Date" value={additionalInfo.visa.expiryDate} />
            </React.Fragment>
          )}
        </DetailSection>
      )}

       <DetailSection title="System & Audit">
        <DetailItem label="Initial Timestamp" value={submission.timestamp} />
        <DetailItem label="Processing Timestamp" value={system.processingTimestamp} />
        <DetailItem label="Processed By" value={system.processedBy} />
      </DetailSection>

      <Card title="Audit Trail" className="mt-6 shadow-sm bg-gray-50">
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
      </Card>
    </Card>
  );
};