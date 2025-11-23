import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { DetailSection, DetailItem } from '../components/DetailSection';
import { usePnrAnalysis } from '../hooks/usePnrAnalysis';
import type { ConsolidatedTravelerRecord, PnrDetail, ApiSubmissionDetail, DcsData, ManifestData } from '../types';

// --- MOCK DATA ---
const mockPnrData: Record<string, PnrDetail> = {
    'A1B2C3D': {
        pnrRecordLocator: 'A1B2C3D', dateOfReservation: '2023-10-25', numberOfChanges: 5,
        system: { sourceAirline: 'Airline A', receivedTimestamp: '2023-10-27 12:34:01', processingStatus: 'Processed', riskScore: 85, bookingChannel: 'Online Travel Agent', passengerHistoryNotes: 'Previous no-show.' },
        passengerDetails: [{ fullName: 'DOE, JOHN MR', dob: '1985-04-12', nationality: 'USA' }, { fullName: 'DOE, MARY MRS', dob: '1986-05-15', nationality: 'USA' }],
        fullTravelItinerary: [{ departureAirportCode: 'JFK', arrivalAirportCode: 'LHR', flightNumber: 'UA234', scheduledDepartureDateTime: '2023-10-28 18:00', scheduledArrivalDateTime: '2023-10-29 06:00', airlineCode: 'UA', classOfTravel: 'Y' }],
        paymentDetails: { formOfPayment: 'Credit Card', partialCardNumber: '...1111' },
        contactInfo: { phone: '+12025550182', email: 'j.doe@example.com' },
        ticketingInfo: { ticketNumber: '1257894561230', issuingAirline: 'UA', dateOfIssuance: '2023-10-25', pointOfSale: 'New York' },
    },
};

const mockApiData: Record<string, ApiSubmissionDetail> = {
    'TR-123': {
        transactionId: 'TR-123', status: 'Processed', timestamp: '2023-10-27 15:01:12',
        manifest: { airlineCode: 'UA', flightNumber: '234', departureAirport: 'JFK', arrivalAirport: 'LHR', scheduledDepartureDate: '2023-10-28', scheduledDepartureTime: '20:45', manifestType: 'Interactive API', apiMessageFormat: 'UN/EDIFACT PAXLST' },
        passenger: { givenName: 'John', surname: 'Doe', dob: '1985-04-12', gender: 'Male', nationality: 'USA' },
        document: { type: 'Passport', number: 'P12345678', issuingCountry: 'USA', expiryDate: '2030-04-11' },
        system: { processedBy: 'System', processingTimestamp: '2023-10-27 15:01:13', auditTrail: [] }
    },
};

const mockDcsData: Record<string, DcsData> = {
    'DCS-001': { seatNumber: '34A', baggageInfo: { tagNumbers: ['UA123456', 'UA123457'], totalWeightKg: 45 }, checkInTime: '2023-10-28 15:30:00', sequenceNumber: 101 },
};

const mockManifestData: Record<string, ManifestData> = {
    'MAN-001': { finalStatus: 'Boarded', boardingTime: '2023-10-28 17:45:10', gate: 'B42' },
};


const mockTravelerRecords: Record<string, ConsolidatedTravelerRecord> = {
    'PUID-1001': {
        puid: 'PUID-1001', name: 'John Doe', dob: '1985-04-12', nationality: 'USA', photoUrl: 'https://picsum.photos/seed/puid1/100', riskIndicator: 'High',
        journeys: [{ flightNumber: 'UA234', origin: 'JFK', destination: 'LHR', date: '2023-10-28', status: 'Scheduled' }],
        dataSubmissions: [{ type: 'API', id: 'TR-123', timestamp: '2023-10-27 15:01:12', status: 'Processed' }, { type: 'PNR', id: 'A1B2C3D', timestamp: '2023-10-27 12:34:01', status: 'Processed' }],
        pnrRecordId: 'A1B2C3D', apiRecordId: 'TR-123',
        pnrData: mockPnrData['A1B2C3D'],
        apiData: mockApiData['TR-123'],
        dcsData: mockDcsData['DCS-001'],
        manifestData: mockManifestData['MAN-001'],
    },
    'PUID-2034': {
        puid: 'PUID-2034', name: 'Jane Smith', dob: '1992-08-22', nationality: 'GBR', photoUrl: 'https://picsum.photos/seed/puid2/100', riskIndicator: 'Low',
        journeys: [{ flightNumber: 'BA098', origin: 'LHR', destination: 'DXB', date: '2023-10-28', status: 'Scheduled' }],
        dataSubmissions: [{ type: 'API', id: 'TR-124', timestamp: '2023-10-27 15:01:45', status: 'Pending' }],
    },
};


// --- UI COMPONENTS ---
const getRiskIndicatorPill = (risk: ConsolidatedTravelerRecord['riskIndicator']) => {
    switch (risk) {
        case 'Low': return 'bg-green-100 text-green-800';
        case 'Medium': return 'bg-amber-100 text-amber-800';
        case 'High': return 'bg-red-100 text-red-800';
        case 'Critical': return 'bg-red-700 text-white';
    }
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm ${active ? 'border-brand-primary text-brand-secondary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        aria-current={active ? 'page' : undefined}
    >
        {children}
    </button>
);

const impactStyles: Record<string, { border: string; badge: string }> = {
    High: { border: 'border-status-red', badge: 'bg-status-red/20 text-status-red' },
    Medium: { border: 'border-status-amber', badge: 'bg-status-amber/20 text-status-amber' },
    Low: { border: 'border-status-green', badge: 'bg-status-green/20 text-status-green' },
};

type TabName = 'service' | 'interactive' | 'manifest' | 'checkin' | 'booking' | 'referral';


export const IndividualTravelerRecordView: React.FC = () => {
    const { puid } = useParams<{ puid: string }>();
    const navigate = useNavigate();
    const traveler = puid ? mockTravelerRecords[puid] : undefined;
    const [activeTab, setActiveTab] = useState<TabName>('referral');

    const { isLoading, explanation } = usePnrAnalysis(traveler?.pnrData || null);

    if (!traveler) {
        return (
            <Card title="Error">
                <p>Traveler record not found.</p>
                <button onClick={() => navigate(-1)} className="mt-4 text-brand-secondary hover:underline">&larr; Go Back</button>
            </Card>
        );
    }

    return (
        <Card>
            <button onClick={() => navigate(-1)} className="text-brand-secondary hover:underline mb-4">&larr; Back to Traveler Dashboard</button>
            
            <div className="flex flex-col md:flex-row gap-6 items-start mb-6">
                <div className="md:w-1/4 flex flex-col items-center">
                    <img src={traveler.photoUrl} alt={traveler.name} className="w-32 h-32 rounded-full object-cover mb-4 shadow-lg" />
                    <h2 className="text-2xl font-bold text-brand-dark text-center">{traveler.name}</h2>
                    <p className="font-mono text-gray-500 text-sm">{traveler.puid}</p>
                     <span className={`mt-2 px-3 py-1 text-sm font-semibold rounded-full ${getRiskIndicatorPill(traveler.riskIndicator)}`}>
                        {traveler.riskIndicator} Risk
                    </span>
                </div>
                <div className="flex-1">
                     <DetailSection title="Consolidated Profile">
                        <DetailItem label="Date of Birth" value={traveler.dob} />
                        <DetailItem label="Nationality" value={traveler.nationality} />
                        <DetailItem label="API Record" value={<Link to={`/data-intelligence/api-gateway`} className="text-brand-secondary hover:underline font-mono">{traveler.apiRecordId || 'N/A'}</Link>} />
                        <DetailItem label="PNR Record" value={<Link to={`/data-intelligence/pnr-gateway`} className="text-brand-secondary hover:underline font-mono">{traveler.pnrRecordId || 'N/A'}</Link>} />
                    </DetailSection>
                </div>
            </div>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
                    <TabButton active={activeTab === 'referral'} onClick={() => setActiveTab('referral')}>Referral (Risk Analysis)</TabButton>
                    <TabButton active={activeTab === 'booking'} onClick={() => setActiveTab('booking')}>Booking Data (PNR)</TabButton>
                    <TabButton active={activeTab === 'interactive'} onClick={() => setActiveTab('interactive')}>Interactive Data (APP)</TabButton>
                    <TabButton active={activeTab === 'checkin'} onClick={() => setActiveTab('checkin')}>Check-in Data (DCS)</TabButton>
                    <TabButton active={activeTab === 'manifest'} onClick={() => setActiveTab('manifest')}>Manifest Data</TabButton>
                    <TabButton active={activeTab === 'service'} onClick={() => setActiveTab('service')}>Service Details</TabButton>
                </nav>
            </div>

            <div className="pt-6">
                {activeTab === 'service' && (
                    <Card title="Service Details (Journey History)" className="bg-gray-50"><table className="min-w-full"><thead><tr><th className="px-4 py-2 text-left">Flight</th><th className="px-4 py-2 text-left">Route</th><th className="px-4 py-2 text-left">Date</th><th className="px-4 py-2 text-left">Status</th></tr></thead><tbody>{traveler.journeys.map(j => <tr key={j.flightNumber+j.date}><td>{j.flightNumber}</td><td>{j.origin} &rarr; {j.destination}</td><td>{j.date}</td><td>{j.status}</td></tr>)}</tbody></table></Card>
                )}
                {activeTab === 'interactive' && (
                    traveler.apiData ? <DetailSection title="Interactive Data from APP Message"><DetailItem label="Document Type" value={traveler.apiData.document.type} /><DetailItem label="Document Number" value={traveler.apiData.document.number} /><DetailItem label="Issuing Country" value={traveler.apiData.document.issuingCountry} /><DetailItem label="Expiry Date" value={traveler.apiData.document.expiryDate} /></DetailSection> : <p>No APP data available.</p>
                )}
                {activeTab === 'manifest' && (
                    traveler.manifestData ? <DetailSection title="Final Manifest Data"><DetailItem label="Final Status" value={traveler.manifestData.finalStatus} /><DetailItem label="Boarding Time" value={traveler.manifestData.boardingTime} /><DetailItem label="Gate" value={traveler.manifestData.gate} /></DetailSection> : <p>No final manifest data available.</p>
                )}
                {activeTab === 'checkin' && (
                    traveler.dcsData ? <DetailSection title="Check-in Data from DCS"><DetailItem label="Seat Number" value={traveler.dcsData.seatNumber} /><DetailItem label="Baggage Tags" value={traveler.dcsData.baggageInfo.tagNumbers.join(', ')} /><DetailItem label="Baggage Weight" value={`${traveler.dcsData.baggageInfo.totalWeightKg} kg`} /><DetailItem label="Check-in Time" value={traveler.dcsData.checkInTime} /><DetailItem label="Sequence #" value={traveler.dcsData.sequenceNumber} /></DetailSection> : <p>No DCS data available.</p>
                )}
                 {activeTab === 'booking' && (
                    traveler.pnrData ? (
                        <>
                            <DetailSection title="Booking Data from PNR"><DetailItem label="PNR Locator" value={traveler.pnrData.pnrRecordLocator} /><DetailItem label="Date of Reservation" value={traveler.pnrData.dateOfReservation} /><DetailItem label="Booking Channel" value={traveler.pnrData.system.bookingChannel} /><DetailItem label="Payment Method" value={traveler.pnrData.paymentDetails.formOfPayment} /><DetailItem label="Ticket Number" value={traveler.pnrData.ticketingInfo.ticketNumber} /></DetailSection>
                            <Card title="Other Passengers on this Booking" className="mt-4 bg-gray-50"><ul>{traveler.pnrData.passengerDetails.filter(p => p.fullName !== traveler.name.toUpperCase()).map(p => <li key={p.fullName}>{p.fullName}</li>)}</ul></Card>
                        </>
                    ) : <p>No PNR data available.</p>
                )}
                {activeTab === 'referral' && (
                     <Card title="AI-Powered Risk Analysis (XAI)" className="bg-blue-50">
                        {isLoading && <p>Loading AI analysis...</p>}
                        {explanation && (
                             <div>
                                <h4 className="font-semibold text-gray-700">Explanation Summary</h4>
                                <p className="text-gray-600 mb-4 bg-white p-3 rounded-md">{explanation.humanReadable}</p>
                                <h4 className="font-semibold text-gray-700 mb-4">Contributing Factors</h4>
                                <ul className="space-y-4">
                                    {explanation.contributingFactors.map(factor => {
                                        const styles = impactStyles[factor.impact] || { border: 'border-gray-400', badge: 'bg-gray-200 text-gray-800' };
                                        return (
                                            <li key={factor.name} className={`p-4 rounded-lg bg-white shadow-md border-l-4 ${styles.border}`}>
                                                <div className="flex justify-between items-center">
                                                    <p className="text-lg font-semibold text-brand-dark">{factor.name}</p>
                                                    <span className={`px-3 py-1 text-sm font-bold rounded-full ${styles.badge}`}>{factor.impact}</span>
                                                </div>
                                                <div className="mt-2">
                                                    <p className="text-sm text-gray-500">Observed Value</p>
                                                    <p className="text-md font-medium text-gray-800">{factor.value}</p>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </Card>
                )}
            </div>
        </Card>
    );
};
