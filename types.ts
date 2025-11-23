
import type * as React from 'react';

export interface NavLink {
  path: string;
  label: string;
  // Fix: Qualify JSX.Element with React.JSX.Element to resolve "Cannot find namespace 'JSX'" error.
  icon: (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element;
}

export interface NavGroup {
  title: string;
  links: NavLink[];
}

export interface WaitTime {
  checkpointId: string;
  currentWaitTime: number;
  threshold: number;
  thresholdAlert: boolean;
  trend: 'up' | 'down' | 'stable';
}

export interface EquipmentStatus {
  equipmentId: string;
  type: string;
  location: string;
  status: 'Operational' | 'Maintenance Required' | 'Offline' | 'Faulty';
}

export interface SecurityAlert {
  alertId: string;
  type: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'New' | 'Investigating' | 'Resolved';
  timestamp: string;
  location: string;
  description: string;
}

export interface Incident {
  incidentId: string;
  type: string;
  severityLevel: 'Level 1 - Minor' | 'Level 2 - Moderate' | 'Level 3 - Major' | 'Level 4 - Critical';
  status: 'Open' | 'Active' | 'Under Control' | 'Resolved';
  location: string;
  startTimestamp: string;
}

export interface Passenger {
  id: string;
  name: string;
  nationality: string;
  dob: string;
  riskScore: number;
  photoUrl: string;
  travelHistory: Flight[];
  apiData: Record<string, any>;
  pnrData: Record<string, any>;
}

export interface Flight {
  flightNumber: string;
  from: string;
  to: string;
  date: string;
}

export interface FlightAlert {
  id:string;
  flightNumber: string;
  origin: string;
  destination: string;
  alertType: 'Security' | 'Delay' | 'Cancellation' | 'Gate Change';
  description: string;
  timestamp: string;
}

export interface PassengerAlert {
  alertId: string;
  passengerName: string;
  flightNumber: string;
  alertType: 'High Risk Score' | 'Watchlist Match' | 'No-Fly List Match' | 'Irregular Travel Pattern';
  severity: 'Critical' | 'High' | 'Medium';
  timestamp: string;
  description: string;
}

export interface FlightMapPassenger {
  gender: 'Male' | 'Female' | 'Other';
  nationality: string;
}

export interface FlightJourney {
  id: string;
  flightNumber: string;
  origin: string; // IATA code
  destination: string; // IATA code
  date: string; // YYYY-MM-DD
  status: 'On Time' | 'Alert';
  departureTime: string; // HH:MM
  arrivalTime: string; // HH:MM
  alertCount: number;
  passengers: FlightMapPassenger[];
}


export interface XAIExplanation {
  humanReadable: string;
  contributingFactors: {
    name: string;
    value: string;
    impact: 'High' | 'Medium' | 'Low';
  }[];
}

export enum DataIngestionSourceType {
  Database = 'Database',
  API = 'API',
  File = 'File System',
  Streaming = 'Streaming Service',
}

export interface IngestionSchedule {
  type: 'Hourly' | 'Daily' | 'Weekly' | 'Continuous' | 'Manual';
  nextRun: string;
}

export interface DataIngestionSource {
  id: string;
  name: string;
  type: DataIngestionSourceType;
  status: 'Success' | 'Failure' | 'In Progress';
  lastIngestion: string;
  schedule: IngestionSchedule;
  errorCount: number;
}

export interface AuditEvent {
  timestamp: string;
  action: string;
  user: string;
}

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
}

export interface ApiSubmissionDetail {
  transactionId: string;
  status: 'Processed' | 'Pending' | 'Rejected';
  timestamp: string;
  manifest: {
    airlineCode: string; // IATA
    flightNumber: string;
    departureAirport: string; // IATA Code
    arrivalAirport: string; // IATA Code
    scheduledDepartureDate: string;
    scheduledDepartureTime: string;
    manifestType: 'Batch API' | 'Interactive API';
    apiMessageFormat: 'UN/EDIFACT PAXLST';
  };
  passenger: {
    givenName: string;
    surname: string;
    middleName?: string;
    dob: string;
    gender: 'Male' | 'Female' | 'Other' | 'Not Specified';
    nationality: string; // ISO 3166-1 alpha-3
  };
  document: {
    type: 'Passport' | 'Visa' | 'ID Card' | 'Refugee Travel Document';
    number: string;
    issuingCountry: string; // ISO 3166-1 alpha-3
    expiryDate: string;
  };
  additionalInfo?: {
    placeOfBirth?: string;
    destinationAddress?: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    contact?: {
      email: string;
      phone: string;
    };
    visa?: {
      number: string;
      type: string;
      issuingCountry: string;
      issueDate: string;
      expiryDate: string;
    };
    transitStatus?: 'Transiting' | 'Final Destination';
  };
  system: {
    processedBy: string;
    processingTimestamp: string;
    validationErrors?: string;
    auditTrail: AuditEvent[];
  };
}

// PNR (Passenger Name Record) Data Structures
export interface PnrItinerarySegment {
  departureAirportCode: string;
  arrivalAirportCode: string;
  flightNumber: string;
  scheduledDepartureDateTime: string;
  scheduledArrivalDateTime: string;
  airlineCode: string;
  classOfTravel: string;
}

export interface PnrPaymentDetails {
  formOfPayment: 'Credit Card' | 'Debit Card' | 'Cash' | 'Bank Transfer' | 'Voucher' | 'Other';
  partialCardNumber?: string;
  cardHolderName?: string;
  billingAddress?: string;
}

export interface PnrContactInfo {
  phone: string;
  email: string;
}

export interface PnrBaggageInfo {
  numberOfCheckedBags: number;
  totalWeightKg?: number;
}

export interface PnrPassengerDetails {
  fullName: string;
  dob?: string;
  gender?: 'Male' | 'Female' | 'Other';
  nationality?: string; // ISO 3166-1 alpha-3
}

export interface PnrTicketingInfo {
  ticketNumber: string;
  issuingAirline: string;
  dateOfIssuance: string;
  pointOfSale: string;
}

export interface PnrServiceRequestInfo {
  ssrCodes?: string[];
  osiMessages?: string[];
}

export interface PnrSystemInfo {
  sourceAirline: string;
  receivedTimestamp: string;
  processingStatus: 'Processing' | 'Processed' | 'Error';
  riskScore: number | null;
  processedBy?: string;
  processingTimestamp?: string;
  auditTrail?: AuditEvent[];
  bookingChannel?: 'Online Travel Agent' | 'Airline Direct' | 'In-person Travel Agent' | 'Airport Counter';
  passengerHistoryNotes?: string;
}

export interface PnrAdditionalInfo {
    placeOfBirth?: string;
    destinationAddress?: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    visa?: {
      number: string;
      type: string;
      issuingCountry: string;
      issueDate: string;
      expiryDate: string;
    };
    transitStatus?: 'Transiting' | 'Final Destination';
}

export interface PnrDetail {
  pnrRecordLocator: string;
  dateOfReservation: string;
  numberOfChanges?: number;
  system: PnrSystemInfo;
  passengerDetails: PnrPassengerDetails[];
  fullTravelItinerary: PnrItinerarySegment[];
  paymentDetails: PnrPaymentDetails;
  contactInfo: PnrContactInfo;
  baggageInfo?: PnrBaggageInfo;
  ticketingInfo: PnrTicketingInfo;
  specialServiceRequests?: PnrServiceRequestInfo;
  remarks?: string;
  knownTravelerNumber?: string;
  additionalInfo?: PnrAdditionalInfo;
}

// Types for Traveler Module
export interface ProcessingMessage {
    id: string;
    type: 'API' | 'PNR';
    sourceId: string;
    timestamp: string;
    status: 'Processing' | 'Validated' | 'Failed';
}

export interface AssociatedDataSubmission {
    type: 'API' | 'PNR';
    id: string; // e.g., Transaction ID or PNR Locator
    timestamp: string;
    status: 'Processed' | 'Rejected' | 'Pending';
}

export interface AssociatedJourney {
    flightNumber: string;
    origin: string;
    destination: string;
    date: string;
    status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export interface DcsData {
    seatNumber: string;
    baggageInfo: {
        tagNumbers: string[];
        totalWeightKg: number;
    };
    checkInTime: string;
    sequenceNumber: number;
}

export interface ManifestData {
    finalStatus: 'Boarded' | 'No-Show' | 'Offloaded';
    boardingTime: string;
    gate: string;
}


export interface ConsolidatedTravelerRecord {
    puid: string; // Permanent Unique Identifier
    name: string;
    dob: string;
    nationality: string;
    photoUrl: string;
    riskIndicator: 'Low' | 'Medium' | 'High' | 'Critical';
    journeys: AssociatedJourney[];
    dataSubmissions: AssociatedDataSubmission[];
    pnrRecordId?: string;
    apiRecordId?: string;
    pnrData?: PnrDetail; // Full PNR for Booking Data tab
    apiData?: ApiSubmissionDetail; // Full API for Interactive Data tab
    dcsData?: DcsData; // For Check-in Data tab
    manifestData?: ManifestData; // For Manifest Data tab
}


export interface FlightProcessRecord {
    id: string;
    operator: string;
    journeyReference: string;
    departurePort: string;
    departureTime: string;
    arrivalPort: string;
    arrivalTime: string;
    status: 'Scheduled' | 'Departed' | 'Arrived' | 'Delayed' | 'Cancelled';
    passengerCount: number;
    crewCount: number;
    transitCount: number;
    processedPercentage: number;
    notProcessedCount: number;
    alertCount: number;
    updateAlertCount: number;
    processedHoldCount: number;
    direction: 'Inbound' | 'Outbound';
    date: string;
}

// Types for Carrier Portal
export interface CarrierSubmission {
  id: string;
  method: 'Upload' | 'Manual' | 'SFTP' | 'Email' | 'HTTP Post';
  submissionType: 'Passenger Manifest' | 'Crew Manifest' | 'General Declaration' | 'Single Passenger';
  fileName?: string;
  timestamp: string;
  status: 'Processing' | 'Validated' | 'Rejected' | 'Requires Attention';
  passengerCount: number;
  errorCount: number;
  errorDetails?: {
    rawError: string;
    userMessage: string;
    suggestion: string;
  };
}

export interface BoardingDirective {
  id: string;
  passengerName: string;
  flightNumber: string;
  directive: 'OK TO BOARD' | 'DO NOT BOARD' | 'HOLD FOR REVIEW';
  reason?: string;
  timestamp: string;
}

export interface CarrierApplication {
  id: string;
  carrierName: string;
  contactPerson: string;
  email: string;
  dateSubmitted: string;
  status: 'Pending';
}

export interface ManagedCarrierAccount {
  id: string;
  carrierName: string;
  status: 'Active' | 'Suspended';
  totalSubmissions: number;
  errorRate: number; // as a percentage
}

// Types for Application Processor
export interface ApplicationProcessorRequest {
  id: string;
  passengerName: string;
  flightNumber: string;
  timestamp: string;
  processingStage: 'Receiving' | 'Cleanse & Validate' | 'Risk Broker Query' | 'Applying Boarding Rules' | 'Directive Issued' | 'EMR to PLS';
  directive: 'OK to Board' | 'Do Not Board' | 'Contact Government' | null;
  reason?: 'Watchlist Match' | 'Invalid Document' | 'High Risk Score' | 'No-Fly List' | 'Invalid Visa' | 'Fuzzy Watchlist Match' | 'Data Anomaly';
  riskCheckResults?: Record<string, 'HIT' | 'CLEAR' | 'ERROR' | 'FUZZY'>;
  appliedRule?: string;
  emrStatus?: 'Sending' | 'Sent' | 'Acknowledged';
  destination?: string;
}

export interface EMRTransmission {
  id: string;
  passengerName: string;
  flightNumber: string;
  destinationPLS: string;
  riskStatus: 'Cleared - Low Risk';
  transmissionStatus: 'Sending' | 'Sent' | 'Acknowledged';
}

// Types for Border Operations Center
export interface BocCase {
  id: string;
  passengerName: string;
  flightNumber: string;
  reason: 'Fuzzy Watchlist Match' | 'Data Anomaly';
  receivedTimestamp: string;
  status: 'Pending' | 'Resolved';
  matchDetails?: {
    traveler: {
      name: string;
      dob: string;
    };
    watchlist: {
      name: string;
      dob: string;
    };
  };
  resolution?: {
    decision: 'Approved' | 'Denied';
    officer: string;
    timestamp: string;
    notes?: string;
  };
}

// Types for Data Acquisition System
export interface DasSourceStatus {
  id: string;
  name: string;
  type: 'PNR' | 'API/DCS' | 'Watchlist' | 'Other' | 'APP Stream';
  status: 'Healthy' | 'Degraded' | 'Offline';
  messagesPerMin: number;
  errorRate: number; // percentage
}

export type PnrPushInterval = 'T-48h' | 'T-24h' | 'T-12h' | 'T+30m';
export type PnrPushStatusValue = 'Pending' | 'Received' | 'Delayed' | 'Missed';

export interface PnrPushStatus {
  interval: PnrPushInterval;
  status: PnrPushStatusValue;
  receivedAt?: Date;
}

export interface PnrPushSchedule {
  id: string;
  flightNumber: string;
  route: string;
  departureTime: Date;
  pushes: PnrPushStatus[];
}

export type TravelerEventRecordType = 'PNR' | 'APP' | 'DCS';
export type TravelerEventCorrelationStatus = 'Awaiting Data' | 'Partially Correlated' | 'Fully Correlated';

export interface TravelerEventRecord {
    type: TravelerEventRecordType;
    id: string;
    receivedAt: string;
}

export interface TravelerEvent {
    id: string;
    passengerName: string;
    pnrRecord: TravelerEventRecord | null;
    appRecord: TravelerEventRecord | null;
    dcsRecord: TravelerEventRecord | null;
    status: TravelerEventCorrelationStatus;
    puid: string | null;
}

export type NormalizationStatus = 'Ingesting' | 'Processing' | 'Success' | 'Failed';

export interface NormalizationEvent {
    id: string;
    rawContent: string;
    rawFormat: 'IATA PNRGOV EDIFACT' | 'Airline-Specific XML' | 'JSON/API';
    status: NormalizationStatus;
    normalizedContent?: string;
    error?: string;
}

export interface PrivacyFilterRule {
  id: string;
  jurisdiction: 'GDPR (EU)' | 'PDPA (Malaysia)' | 'Global';
  field: 'SSR' | 'OSI';
  keyword: string;
  maskAs: 'MEDICAL' | 'RELIGIOUS' | 'SENSITIVE';
  status: 'Active' | 'Inactive';
}

export interface PrivacyFilteringEvent {
  id: string;
  pnrSnippet: {
    ssr?: string[];
    osi?: string[];
  };
  detectedSensitive: {
    field: 'SSR' | 'OSI';
    keyword: string;
  }[];
  appliedRuleId?: string;
  status: 'Detecting' | 'Filtering' | 'Sanitized';
}

// Types for Traveler Database
export interface DatabaseOperation {
  id: string;
  type: 'INSERT' | 'UPDATE' | 'PURGE';
  timestamp: string;
  details: string;
}

// Types for User Portal / Management
export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  roleId: string;
  status: 'Active' | 'Inactive' | 'Locked';
  lastLogin: string;
}

export interface UserManagementEvent {
  id: string;
  timestamp: string;
  adminUser: string;
  action: string;
  details: string;
}

export interface JourneyPassenger {
  puid: string;
  name: string;
  nationality: string;
  riskIndicator: 'Low' | 'Medium' | 'High' | 'Critical';
}

// Types for Risk Manager
export interface RiskEvent {
    id: string;
    type: 'PNR_RECEIVED' | 'API_UPDATED' | 'BOOKING_CHANGE';
    sourceId: string; // PNR Locator or API Transaction ID
    timestamp: string;
}

export interface Hit {
    id: string;
    type: 'Watchlist Match' | 'Anomalous Booking' | 'Irregular Itinerary' | 'Payment Method Risk';
    description: string;
    scoreContribution: number;
}

export type ReferralStatus = 'Unqualified' | 'Open' | 'Closed' | 'Alert';
export type ReferralResolution = 'Qualified-Out (False Positive)' | 'Qualified-In (Action Taken)';

export interface Referral {
  id: string;
  passengerName: string;
  puid: string;
  flightNumber: string;
  destinationAirport: string;
  totalRiskScore: number;
  hits: Hit[];
  createdAt: string;
  status: ReferralStatus;
  assignee?: string;
  resolvedAt?: string;
  resolution?: ReferralResolution;
  notes?: string;
}

export type NotificationStatus = 'Queued' | 'Sending' | 'Delivered' | 'Failed';

export interface AlertNotification {
    id: string;
    referralId: string;
    passengerName: string;
    flightNumber: string;
    destinationAirport: string;
    timestamp: string;
    emailStatus: NotificationStatus;
    smsStatus: NotificationStatus;
}

// Types for Risk Broker
export interface RiskService {
    id: string;
    name: string;
    description: string;
    type: 'Internal' | 'External';
    status: 'Online' | 'Offline';
    avgResponseTime: number; // in ms
    enabled: boolean;
}

export type RiskQueryStatus = 'Querying' | 'HIT' | 'CLEAR' | 'ERROR';

export interface RiskServiceQuery {
    id: string;
    serviceName: string;
    status: RiskQueryStatus;
    responseTime?: number; // in ms
}

export type RiskBrokerSource = 'Application Processor' | 'Risk Manager';
export type RiskBrokerProcessingStage = 'Receiving' | 'Querying' | 'Consolidating' | 'Complete';

export interface RiskBrokerRequest {
    id: string;
    travelerName: string;
    timestamp: string;
    sourceModule: RiskBrokerSource;
    queries: RiskServiceQuery[];
    finalResult: 'NO_RISK' | 'RISK_IDENTIFIED' | 'INCOMPLETE' | null;
    processingStage: RiskBrokerProcessingStage;
    consolidatedHits?: number;
}

// Types for Watch List Manager
export interface WatchList {
  id: string;
  name: string;
  description: string;
  entryCount: number;
  priority: 'High' | 'Medium' | 'Low';
  type: 'Black List' | 'White List' | 'Cleared Document List';
}

export interface WatchListEntry {
  id: string;
  listId: string;
  fullName: string;
  dob: string;
  documentType: 'Passport' | 'National ID' | 'Other';
  documentNumber: string;
  reason: string;
  clearedAgainst?: string;
  addedBy: string;
  addedOn: string;
}

export interface WatchListActivity {
  id: string;
  timestamp: string;
  user: string;
  action: string;
}

// Types for Identity Resolution Engine
export interface IdentityProbe {
    name: string;
    dob: string;
    nationality: string;
    documentNumber?: string;
    countryOfBirth?: string;
    gender?: string;
    strategy?: 'Standard' | 'Phonetic' | 'Strict';
    population?: 'Global' | 'Arabic' | 'Chinese';
}

export interface IdentityCandidate {
    id: string;
    name: string;
    dob: string;
    nationality: string;
    documentNumber?: string;
    countryOfBirth?: string;
    gender?: string;
    source: string; // e.g., 'Watchlist', 'Traveler DB'
}

export interface MatchResultAttribute {
    attribute: 'Name' | 'Date of Birth' | 'Nationality' | 'Document Number' | 'Country of Birth' | 'Gender';
    probeValue: string;
    candidateValue: string;
    score: number; // 0-100
    explanation: string;
}

export interface MatchResult {
    candidate: IdentityCandidate;
    overallScore: number;
    attributes: MatchResultAttribute[];
}

// Types for Profiler Module
export interface ProfileRule {
  field: string;
  operator: 'Equals' | 'Not Equals' | 'Contains' | 'Greater Than' | 'Less Than';
  value: string;
}

export interface RiskProfile {
  id: string;
  name: string;
  description: string;
  category: 'Narcotics' | 'Immigration' | 'Security' | 'Customs';
  riskScoreImpact: number;
  enabled: boolean;
  rules: ProfileRule[];
}

export interface ProfileHit {
  id: string;
  profileId: string;
  profileName: string;
  travelerName: string;
  flightNumber: string;
  timestamp: string;
  score: number;
}

// Route Administration Types
export interface RouteDefinition {
    id: string;
    origin: string;
    destination: string;
    riskLevel: 'High' | 'Medium' | 'Low';
}

export interface RouteProfileAssignment {
    routeId: string;
    profileIds: string[]; // List of enabled profile IDs for this route
}

// Types for Case Management
export type CaseStatus = 'Active' | 'Cold' | 'Closed';
export type CasePriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type AgencyRole = 'Lead' | 'Contributor' | 'Viewer';
export type AgencyName = 'Immigration' | 'Police' | 'Customs' | 'Intelligence' | 'Health';

export interface AgencyAccess {
    id: string;
    name: AgencyName;
    role: AgencyRole;
    addedDate: string;
}

export interface JointAction {
    id: string;
    agency: AgencyName;
    action: string;
    status: 'Pending' | 'In Progress' | 'Completed';
    deadline: string;
}

export interface CaseEntity {
    id: string;
    type: 'Person' | 'Flight' | 'Document' | 'PNR';
    name: string; // e.g., traveler name, flight number
    details: string; // e.g., PUID, Date
    linkedDate: string;
}

export interface CaseNote {
    id: string;
    timestamp: string;
    author: string;
    content: string;
    type: 'Note' | 'Intel' | 'Evidence' | 'System';
}

export interface InvestigationCase {
    id: string;
    title: string;
    description: string;
    leadInvestigator: string;
    startDate: string;
    status: CaseStatus;
    priority: CasePriority;
    caseType: 'POI' | 'Organization' | 'Incident';
    primarySubject?: string;
    entities: CaseEntity[];
    notes: CaseNote[];
    collaboratingAgencies: AgencyAccess[];
    jointActions: JointAction[];
}

// Types for Link Detection / Analysis
export type GraphNodeType = 'Person' | 'Document' | 'Phone' | 'Email' | 'Address' | 'PNR' | 'Flight' | 'Payment' | 'Agent';
export type GraphLinkType = 'BookedWith' | 'SharedContact' | 'SameFlight' | 'SameAddress' | 'DocumentHolder' | 'SharedPayment' | 'SharedAgent' | 'SequentialCheckIn';

export interface GraphNode {
    id: string;
    type: GraphNodeType;
    label: string;
    riskLevel?: 'Low' | 'Medium' | 'High' | 'Critical';
    details?: string;
    x: number; // For visual positioning
    y: number;
}

export interface GraphLink {
    id: string;
    source: string; // Node ID
    target: string; // Node ID
    type: GraphLinkType;
    label: string;
}

// Types for Flight Status (Risk Tracker)
export interface FlightRiskProfile {
    id: string;
    flightNumber: string;
    airline: string;
    origin: string;
    destination: string;
    scheduledTime: string; // Departure or Arrival time
    arrivalGate?: string; // Gate assignment
    direction: 'Inbound' | 'Outbound';
    status: 'Scheduled' | 'Landed' | 'Departed' | 'Delayed';
    riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
    totalPax: number;
    riskSummary: {
        critical: number;
        high: number;
        medium: number;
        low: number;
        watchlistHits: number;
    };
    passengerManifest: {
        puid: string;
        name: string;
        nationality: string;
        seat: string;
        riskScore: number;
        riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
        hits: string[]; // e.g., "Watchlist", "No-Fly"
    }[];
}

// Types for Secondary Screening
export type ScreeningOutcome = 'Cleared' | 'Detained' | 'Refused Entry';
export type ScreeningStatus = 'Waiting' | 'In Progress' | 'Completed';

export interface SecondaryReferral {
    id: string;
    travelerName: string;
    puid: string;
    nationality: string;
    flightNumber: string;
    referralReason: string;
    riskLevel: 'Critical' | 'High' | 'Medium';
    arrivalTime: string;
    status: ScreeningStatus;
    officer?: string;
    outcome?: ScreeningOutcome;
    notes?: string[];
}

// Types for Biometric Corridor
export interface BiometricGate {
    id: string;
    name: string;
    type: 'e-Gate' | 'Biometric Corridor';
    status: 'Operational' | 'Maintenance' | 'Alert';
    currentTransaction?: BiometricTransaction;
}

export interface BiometricTransaction {
    id: string;
    timestamp: string;
    gateId: string;
    travelerName: string;
    puid: string;
    biometricScore: number; // 0-100
    riskStatus: 'Low' | 'Medium' | 'High' | 'Critical'; // From Risk Manager
    decision: 'CLEARED' | 'REFERRED';
    processingTimeMs: number;
    alertGenerated?: boolean;
}

// Types for Pattern Analysis
export interface PatternTrend {
    period: string; // e.g., "Jan", "Week 1"
    totalVolume: number;
    riskVolume: number;
    anomalyScore: number; // 0-100, indicates how abnormal this period is
}

export interface AnomalyReport {
    id: string;
    title: string;
    description: string;
    detectedDate: string;
    severity: 'High' | 'Medium' | 'Low';
    affectedRoute?: string;
    confidence: number;
}

export interface RouteRiskMetric {
    route: string;
    avgRiskScore: number;
    volume: number;
    trend: 'Increasing' | 'Stable' | 'Decreasing';
}

// Types for Overstay Tracking
export type OverstayStatus = 'Active' | 'Resolved' | 'Flagged for Enforcement';

export interface OverstayRecord {
    id: string;
    puid: string;
    travelerName: string;
    nationality: string;
    entryDate: string;
    entryPort: string;
    visaType: string;
    expiryDate: string;
    daysOverstayed: number;
    riskScore: number;
    status: OverstayStatus;
    lastKnownAddress?: string;
    authorizationSource?: string;
    allowedDuration?: number;
    leadGenerated?: boolean;
    assignedOfficer?: string;
    caseId?: string;
}

export interface MovementRecord {
    name: string;
    dob: string;
    documentNumber: string;
    flightNumber: string;
    date: string;
    type: 'Arrival' | 'Departure';
}

export interface MatchingConfiguration {
    weights: {
        name: number;
        dob: number;
        document: number;
    };
}

// Historical Analysis Types
export interface TravelPeriod {
    entryDate: string;
    exitDate: string;
    duration: number;
    visaType: string;
}

export interface HistoricalTravelerProfile {
    puid: string;
    travelerName: string;
    nationality: string;
    totalDaysInCountry: number; // Rolling 365 days
    periodCount: number; // Number of visits in period
    averageStayDuration: number;
    history: TravelPeriod[];
    violationCount: number;
    flag: 'None' | 'Repeat Overstayer' | 'Visa Run Pattern';
}

// Types for Reporting & Dashboards
export interface ReportTemplate {
    id: string;
    name: string;
    description: string;
    frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Ad-hoc';
    lastGenerated: string;
    format: 'PDF' | 'CSV' | 'Excel';
}

// Types for Ad-Hoc Reporting
export interface QueryFilter {
    field: string;
    operator: 'Equals' | 'Contains' | 'Greater Than' | 'Less Than';
    value: string;
}

export interface AdHocQuery {
    source: 'Traveler Database' | 'Flight Data' | 'Risk Logs';
    columns: string[];
    filters: QueryFilter[];
}

export interface AdHocQueryResult {
    [key: string]: any; // Dynamic result object
}

// Types for Boarding Rules Management
export interface RuleCondition {
    id: string;
    field: string;
    operator: 'Equals' | 'Not Equals' | 'Contains';
    value: string;
}

export interface BoardingRule {
    id: string;
    name: string;
    description: string;
    status: 'Active' | 'Inactive';
    priority: number;
    conditions: RuleCondition[];
    directive: 'OK to Board' | 'Do Not Board' | 'Contact Government';
    overrideCode: string;
}

// Types for System Administration & Security Module
export interface AuditLogEntry {
    id: string;
    timestamp: string;
    user: string;
    role: string;
    module: string;
    action: string;
    outcome: 'Success' | 'Failure';
    details: string;
    ipAddress: string;
}

export interface SystemHealthMetric {
    id: string;
    component: string;
    type: 'Microservice' | 'Database' | 'External Link' | 'Infrastructure';
    status: 'Healthy' | 'Degraded' | 'Down';
    uptime: number; // Percentage
    latency: number; // ms
    lastCheck: string;
}

export interface SystemConfigItem {
    id: string;
    category: 'Security' | 'System' | 'Notifications';
    key: string;
    value: string | boolean | number;
    description: string;
}

export interface ConfigVersion {
    id: string;
    version: string;
    timestamp: string;
    user: string;
    action: 'Modified' | 'Rolled Back';
    description: string;
    reason: string;
}

export interface AuditStorageStats {
    totalEventsStored: string; // e.g., "4.2 Billion"
    storageUsed: string; // e.g., "8.5 TB"
    ingestRate: number; // events per second
    wormStatus: 'Active' | 'Compromised';
    lastIntegrityCheck: string;
}

// Types for ETA Module
export type ETAStatus = 'Approved' | 'Pending Review' | 'Denied';

export interface ETAApplication {
    id: string;
    applicantName: string;
    nationality: string;
    passportNumber: string;
    submissionDate: string;
    email: string; // Added email field
    status: ETAStatus;
    riskScore: number;
    riskReasons?: string[];
    officerNotes?: string;
}
