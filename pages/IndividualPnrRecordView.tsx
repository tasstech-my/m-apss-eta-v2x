import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '../components/Card';
import { DetailSection, DetailItem } from '../components/DetailSection';
import type { PnrDetail, XAIExplanation, AuditEvent, PnrItinerarySegment } from '../types';
import { usePnrAnalysis } from '../hooks/usePnrAnalysis';


interface IndividualPnrRecordViewProps {
  pnr: PnrDetail;
  onBack: () => void;
}

const getStatusPillColor = (status: PnrDetail['system']['processingStatus']) => {
    switch(status) {
        case 'Processed': return 'bg-green-100 text-green-800';
        case 'Processing': return 'bg-blue-100 text-blue-800';
        case 'Error': return 'bg-red-100 text-red-800';
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

const BeakerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547a2 2 0 00-.547 1.806l.443 2.216a6 6 0 003.86.517l.318-.158a6 6 0 013.86.517l2.387.477a2 2 0 001.022.547a2 2 0 00.547-1.806l-.443-2.216a6 6 0 00-3.86-.517l-.318.158a6 6 0 01-3.86-.517l-2.387-.477a2 2 0 00-1.806-.547a2 2 0 00-.547 1.806l.443 2.216a6 6 0 003.86.517l.318-.158a6 6 0 013.86.517z" />
  </svg>
);

const ExclamationTriangleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);

const InfoCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6-12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
);


interface GroupedEvent {
  timestamp: string;
  user: string;
  actions: string[];
}

type ItinerarySortableKeys = 'scheduledDepartureDateTime' | 'scheduledArrivalDateTime';
interface ItinerarySortConfig {
    key: ItinerarySortableKeys | null;
    direction: 'ascending' | 'descending';
}

const SortableItineraryHeader: React.FC<{
    title: string;
    sortKey: ItinerarySortableKeys;
    currentSort: ItinerarySortConfig;
    onRequestSort: (key: ItinerarySortableKeys) => void;
}> = ({ title, sortKey, currentSort, onRequestSort }) => {
    const isSorted = currentSort.key === sortKey;
    const directionIcon = isSorted ? (currentSort.direction === 'ascending' ? '▲' : '▼') : '';

    return (
        <th
            className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
            onClick={() => onRequestSort(sortKey)}
            aria-label={`Sort by ${title}`}
        >
            <div className="flex items-center">
                <span>{title}</span>
                <span className="ml-2 w-4 text-gray-600">{directionIcon}</span>
            </div>
        </th>
    );
};


export const IndividualPnrRecordView: React.FC<IndividualPnrRecordViewProps> = ({ pnr, onBack }) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [userFilter, setUserFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('');
  const [isWarningBannerVisible, setIsWarningBannerVisible] = useState(true);
  const [itinerarySortConfig, setItinerarySortConfig] = useState<ItinerarySortConfig>({ key: null, direction: 'ascending' });

  const { isLoading, explanation } = usePnrAnalysis(pnr);
  
  const showAnalysisSection = isLoading || explanation;
  
  const isAiAnalysis = (pnr.system.riskScore && pnr.system.riskScore >= 70) || pnr.system.processingStatus === 'Error';

  const analysisCardTitle = isAiAnalysis ? 'AI-Powered PNR Analysis (XAI)' : 'Standard PNR Analysis';
  const analysisCardClassName = isAiAnalysis 
    ? "mt-6 shadow-sm bg-blue-50 border-l-4 border-blue-400" 
    : "mt-6 shadow-sm bg-gray-50 border-l-4 border-gray-400";
  
  useEffect(() => {
    setIsWarningBannerVisible(true);
  }, [pnr.pnrRecordLocator]);

  const uniqueUsers = useMemo(() => {
    if (!pnr.system.auditTrail) return ['all'];
    const users = new Set(pnr.system.auditTrail.map(event => event.user));
    return ['all', ...Array.from(users)];
  }, [pnr.system.auditTrail]);

  const errorMessages = useMemo(() => {
    if (pnr.system.processingStatus !== 'Error') {
      return [];
    }
    const messages = new Set<string>();
    if (pnr.remarks) {
      messages.add(pnr.remarks);
    }
    pnr.system.auditTrail?.forEach(event => {
      const action = event.action.toLowerCase();
      if (action.includes('error') || action.includes('failed')) {
        const cleanedAction = event.action.replace(/error logged: /i, '').trim();
        messages.add(cleanedAction);
      }
    });
    return Array.from(messages);
  }, [pnr]);

  const hasProcessingWarning = useMemo(() => {
    if (pnr.system.processingStatus !== 'Processing') {
      return false;
    }
    const keywords = /error|fail|invalid|warning/i;
    
    if (pnr.remarks && keywords.test(pnr.remarks)) {
        return true;
    }

    if (pnr.system.auditTrail?.some(event => keywords.test(event.action))) {
        return true;
    }

    return false;
  }, [pnr]);


  const groupedTrail = useMemo(() => {
    let events: AuditEvent[] = pnr.system.auditTrail || [];

    // Apply filters
    if (userFilter !== 'all') {
        events = events.filter(event => event.user === userFilter);
    }
    if (actionFilter.trim() !== '') {
        events = events.filter(event => 
            event.action.toLowerCase().includes(actionFilter.toLowerCase().trim())
        );
    }

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
  }, [pnr.system.auditTrail, userFilter, actionFilter]);

  const handleItinerarySortRequest = (key: ItinerarySortableKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (itinerarySortConfig.key === key && itinerarySortConfig.direction === 'ascending') {
        direction = 'descending';
    }
    setItinerarySortConfig({ key, direction });
  };

  const sortedItinerary = useMemo(() => {
    if (!itinerarySortConfig.key) {
        return pnr.fullTravelItinerary;
    }

    const sortableItems: PnrItinerarySegment[] = [...pnr.fullTravelItinerary];

    sortableItems.sort((a, b) => {
        const aValue = a[itinerarySortConfig.key as ItinerarySortableKeys];
        const bValue = b[itinerarySortConfig.key as ItinerarySortableKeys];
        
        if (aValue < bValue) {
            return itinerarySortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
            return itinerarySortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
    });

    return sortableItems;
  }, [pnr.fullTravelItinerary, itinerarySortConfig]);

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
  
  const handleExpandAll = () => {
    const allGroupKeys = groupedTrail
        .filter(group => group.actions.length > 1)
        .map(group => `${group.timestamp}|${group.user}`);
    setExpandedGroups(new Set(allGroupKeys));
  };

  const handleCollapseAll = () => {
      setExpandedGroups(new Set());
  };

  const impactStyles: Record<string, { border: string; badge: string }> = {
    High: { border: 'border-status-red', badge: 'bg-status-red/20 text-status-red' },
    Medium: { border: 'border-status-amber', badge: 'bg-status-amber/20 text-status-amber' },
    Low: { border: 'border-status-green', badge: 'bg-status-green/20 text-status-green' },
  };

  return (
    <Card>
      <div className="flex justify-between items-start mb-4">
        <div>
          <button onClick={onBack} className="text-brand-secondary hover:underline mb-2">&larr; Back to PNR Submissions</button>
          <h2 className="text-2xl font-bold text-brand-dark">PNR Record: {pnr.pnrRecordLocator}</h2>
           <div className="flex items-center space-x-4 mt-1">
              <p className="text-md text-gray-600">From: <strong>{pnr.system.sourceAirline}</strong></p>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusPillColor(pnr.system.processingStatus)}`}>
                {pnr.system.processingStatus}
              </span>
              {pnr.system.riskScore && (
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    pnr.system.riskScore > 80 ? 'bg-red-200 text-red-800' :
                    pnr.system.riskScore > 60 ? 'bg-amber-200 text-amber-800' : 'bg-green-200 text-green-800'
                }`}>
                    Risk Score: {pnr.system.riskScore}
                </span>
              )}
          </div>
        </div>
        <div className="flex space-x-2">
            <button className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">Flag for Analyst</button>
        </div>
      </div>

      {pnr.system.processingStatus === 'Error' && errorMessages.length > 0 && (
        <div className="my-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 rounded-r-lg" role="alert">
            <div className="flex">
                <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-bold">Processing Error Details</h3>
                    <div className="mt-2 text-sm">
                        <ul className="list-disc pl-5 space-y-1">
                            {errorMessages.map((msg, index) => (
                                <li key={index}>{msg}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
      )}

      {isWarningBannerVisible && hasProcessingWarning && (
        <div className="my-4 p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-800 rounded-r-lg" role="alert">
            <div className="flex">
                <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="ml-3 flex-1">
                    <h3 className="text-sm font-bold">Processing Warning</h3>
                    <div className="mt-2 text-sm">
                        <p>Potential issues have been detected while this PNR is being processed. The final risk score may be impacted. Please <a href="#audit-trail-section" className="font-medium underline hover:text-amber-900">review the Audit Trail</a> for more details.</p>
                    </div>
                </div>
                 <div className="ml-auto pl-3">
                    <div className="-mx-1.5 -my-1.5">
                        <button
                            type="button"
                            onClick={() => setIsWarningBannerVisible(false)}
                            className="inline-flex bg-amber-50 rounded-md p-1.5 text-amber-500 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-amber-50 focus:ring-amber-600"
                            aria-label="Dismiss"
                        >
                            <span className="sr-only">Dismiss</span>
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {showAnalysisSection && (
        <Card
          title={
            <div className="flex items-center">
              <BeakerIcon className="h-6 w-6 mr-3 text-brand-secondary" />
              <span>{analysisCardTitle}</span>
            </div>
          }
          className={analysisCardClassName}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <svg className="animate-spin h-8 w-8 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="ml-4 text-gray-600">Generating AI Explanation for PNR...</span>
            </div>
          ) : (
            explanation && (
              <div>
                <h4 className="font-semibold text-gray-700">Explanation Summary</h4>
                <p className="text-gray-600 mb-4 bg-white p-3 rounded-md">{explanation.humanReadable}</p>
                <h4 className="font-semibold text-gray-700 mb-4">Contributing Factors</h4>
                <ul className="space-y-4">
                  {explanation.contributingFactors.map(factor => {
                      const styles = impactStyles[factor.impact] || { border: 'border-gray-400', badge: 'bg-gray-200 text-gray-800' };
                      
                      const Icon = () => {
                          switch(factor.impact) {
                              case 'High': return <ExclamationTriangleIcon className="h-6 w-6 text-status-red" />;
                              case 'Medium': return <InfoCircleIcon className="h-6 w-6 text-status-amber" />;
                              case 'Low': return <CheckCircleIcon className="h-6 w-6 text-status-green" />;
                              default: return null;
                          }
                      };

                      return (
                          <li key={factor.name} className={`p-4 rounded-lg bg-white shadow-md border-l-4 ${styles.border} flex items-start space-x-4`}>
                              <div className="flex-shrink-0 pt-1">
                                <Icon />
                              </div>
                              <div className="flex-1">
                                  <div className="flex justify-between items-center">
                                      <p className="text-lg font-semibold text-brand-dark">{factor.name}</p>
                                      <span className={`px-3 py-1 text-sm font-bold rounded-full ${styles.badge}`}>{factor.impact}</span>
                                  </div>
                                  <div className="mt-2">
                                      <p className="text-sm text-gray-500">Observed Value</p>
                                      <p className="text-md font-medium text-gray-800">{factor.value}</p>
                                  </div>
                              </div>
                          </li>
                      );
                  })}
                </ul>
              </div>
            )
          )}
        </Card>
      )}
      
      <DetailSection title="Passenger Details">
        {pnr.passengerDetails.map((p, index) => (
            <React.Fragment key={index}>
                <DetailItem label={`Passenger ${index + 1}`} value={p.fullName} />
                <DetailItem label="Date of Birth" value={p.dob} />
                <DetailItem label="Nationality" value={p.nationality} />
            </React.Fragment>
        ))}
        {pnr.knownTravelerNumber && <DetailItem label="Known Traveler #" value={pnr.knownTravelerNumber} />}
      </DetailSection>

      <DetailSection title="Additional Passenger Information">
          {pnr.additionalInfo?.placeOfBirth && <DetailItem label="Place of Birth" value={pnr.additionalInfo.placeOfBirth} />}
          {pnr.additionalInfo?.destinationAddress && (
              <DetailItem 
                  label="Destination Address" 
                  value={`${pnr.additionalInfo.destinationAddress.street}, ${pnr.additionalInfo.destinationAddress.city}, ${pnr.additionalInfo.destinationAddress.state} ${pnr.additionalInfo.destinationAddress.postalCode}, ${pnr.additionalInfo.destinationAddress.country}`}
              />
          )}
          <DetailItem label="Email" value={pnr.contactInfo.email} />
          <DetailItem label="Phone" value={pnr.contactInfo.phone} />
          {pnr.additionalInfo?.visa && (
            <React.Fragment>
              <DetailItem label="Visa Number" value={pnr.additionalInfo.visa.number} />
              <DetailItem label="Visa Type" value={pnr.additionalInfo.visa.type} />
              <DetailItem label="Visa Issuing Country" value={pnr.additionalInfo.visa.issuingCountry} />
              <DetailItem label="Visa Issue Date" value={pnr.additionalInfo.visa.issueDate} />
              <DetailItem label="Visa Expiration Date" value={pnr.additionalInfo.visa.expiryDate} />
            </React.Fragment>
          )}
          {pnr.additionalInfo?.transitStatus && <DetailItem label="Transit Status" value={pnr.additionalInfo.transitStatus} />}
      </DetailSection>

      <Card title="Full Travel Itinerary" className="mt-6 shadow-sm bg-gray-50">
        <div className="overflow-x-auto">
            {itinerarySortConfig.key && (
                <div className="p-2 text-right">
                    <button 
                        onClick={() => setItinerarySortConfig({ key: null, direction: 'ascending' })}
                        className="text-xs text-brand-secondary hover:underline"
                    >
                        Reset Sort
                    </button>
                </div>
            )}
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Segment</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Flight</th>
                        <SortableItineraryHeader 
                            title="Departure" 
                            sortKey="scheduledDepartureDateTime" 
                            currentSort={itinerarySortConfig} 
                            onRequestSort={handleItinerarySortRequest} 
                        />
                        <SortableItineraryHeader 
                            title="Arrival" 
                            sortKey="scheduledArrivalDateTime" 
                            currentSort={itinerarySortConfig} 
                            onRequestSort={handleItinerarySortRequest} 
                        />
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {sortedItinerary.map((seg, index) => (
                        <tr key={index}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{seg.departureAirportCode} &rarr; {seg.arrivalAirportCode}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{seg.airlineCode} {seg.flightNumber}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{seg.scheduledDepartureDateTime}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{seg.scheduledArrivalDateTime}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <DetailSection title="Payment & Ticketing">
            <DetailItem label="Form of Payment" value={pnr.paymentDetails.formOfPayment} />
            <DetailItem label="Partial Card #" value={pnr.paymentDetails.partialCardNumber} />
            <DetailItem label="Cardholder Name" value={pnr.paymentDetails.cardHolderName} />
            <DetailItem label="Ticket Number" value={pnr.ticketingInfo.ticketNumber} />
            <DetailItem label="Issuing Airline" value={pnr.ticketingInfo.issuingAirline} />
            <DetailItem label="Date of Issuance" value={pnr.ticketingInfo.dateOfIssuance} />
        </DetailSection>

        {pnr.baggageInfo &&
          <DetailSection title="Baggage Information">
              <DetailItem label="Checked Bags" value={pnr.baggageInfo?.numberOfCheckedBags} />
              <DetailItem label="Baggage Weight (kg)" value={pnr.baggageInfo?.totalWeightKg} />
          </DetailSection>
        }
      </div>

      <DetailSection title="Processing History">
        <DetailItem label="Received Timestamp" value={pnr.system.receivedTimestamp} />
        <DetailItem
          label="Processing Status"
          value={
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStatusPillColor(pnr.system.processingStatus)}`}>
              {pnr.system.processingStatus}
            </span>
          }
        />
        <DetailItem 
          label="Final Risk Score" 
          value={
            pnr.system.riskScore !== null ? (
              <span className={`font-bold ${
                pnr.system.riskScore > 80 ? 'text-red-600' :
                pnr.system.riskScore > 60 ? 'text-amber-600' : 'text-green-600'
              }`}>
                {pnr.system.riskScore}
              </span>
            ) : <span className="text-gray-500">N/A</span>
          }
        />
        <DetailItem label="Processed By" value={pnr.system.processedBy} />
        <DetailItem label="Processing Timestamp" value={pnr.system.processingTimestamp} />
      </DetailSection>

       {pnr.specialServiceRequests && (
        <DetailSection title="Special Service Requests (SSR) & Other Service Information (OSI)">
            <DetailItem label="SSR Codes" value={pnr.specialServiceRequests.ssrCodes?.join(', ')} />
            <DetailItem label="OSI Messages" value={pnr.specialServiceRequests.osiMessages?.join('; ')} />
        </DetailSection>
       )}

        <Card title="Audit Trail" id="audit-trail-section" className="mt-6 shadow-sm bg-gray-50">
            <div className="flex flex-wrap gap-4 p-4 border-b bg-gray-100 items-center justify-between">
                <div className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label htmlFor="userFilter" className="block text-sm font-medium text-gray-700">Filter by User</label>
                        <select
                            id="userFilter"
                            name="userFilter"
                            value={userFilter}
                            onChange={e => setUserFilter(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm rounded-md"
                        >
                            {uniqueUsers.map(user => (
                                <option key={user} value={user}>{user === 'all' ? 'All Users' : user}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="actionFilter" className="block text-sm font-medium text-gray-700">Filter by Action Keyword</label>
                        <input
                            type="text"
                            id="actionFilter"
                            name="actionFilter"
                            placeholder="e.g., 'Validation', 'Received'"
                            value={actionFilter}
                            onChange={e => setActionFilter(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
                        />
                    </div>
                     {(userFilter !== 'all' || actionFilter.trim() !== '') && (
                        <button
                            onClick={() => { setUserFilter('all'); setActionFilter(''); }}
                            className="px-4 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors self-end"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExpandAll}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                        disabled={groupedTrail.every(g => g.actions.length <= 1)}
                    >
                        Expand All
                    </button>
                    <button
                        onClick={handleCollapseAll}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                        disabled={expandedGroups.size === 0}
                    >
                        Collapse All
                    </button>
                </div>
            </div>
            {groupedTrail.length > 0 ? (
                <div className="space-y-2 font-sans p-2">
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
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm text-gray-800 truncate">{group.actions[0]}</p>
                                            {canExpand && (
                                                <span className="text-xs text-gray-500 bg-gray-200 rounded-full px-2 py-0.5 ml-2 flex-shrink-0">
                                                    {group.actions.length} actions
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {canExpand && (
                                    <div className={`collapsible-content ${isExpanded ? 'expanded' : ''}`}>
                                        <div className="border-t bg-gray-50 p-4 pl-12">
                                            <ul className="list-disc list-inside space-y-1">
                                                {group.actions.slice(1).map((action, index) => (
                                                    <li key={index} className="text-sm text-gray-700">{action}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            ) : (
                <p className="text-center text-gray-500 py-4">
                    {pnr.system.auditTrail && pnr.system.auditTrail.length > 0
                        ? 'No audit events match the current filters.'
                        : 'No audit trail available for this record.'
                    }
                </p>
            )}
      </Card>

    </Card>
  );
};