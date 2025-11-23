
import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import type { PnrDetail } from '../types';
import { IndividualPnrRecordView } from './IndividualPnrRecordView';


const pnrSourceData = [
  { name: 'Airline A', count: 1200 }, { name: 'Airline B', count: 980 }, { name: 'Airline C', count: 850 },
  { name: 'Airline D', count: 760 }, { name: 'Airline E', count: 540 }, { name: 'Others', count: 1100 }
];

const pnrRiskDistributionTrendData = [
    { time: 'T-6h', Low: 800, Medium: 250, High: 80, Critical: 15 },
    { time: 'T-5h', Low: 750, Medium: 280, High: 95, Critical: 20 },
    { time: 'T-4h', Low: 700, Medium: 320, High: 110, Critical: 25 },
    { time: 'T-3h', Low: 680, Medium: 310, High: 105, Critical: 22 },
    { time: 'T-2h', Low: 650, Medium: 350, High: 130, Critical: 35 },
    { time: 'T-1h', Low: 660, Medium: 330, High: 120, Critical: 30 },
    { time: 'Now',  Low: 640, Medium: 340, High: 125, Critical: 32 },
];

const mockPnrs: PnrDetail[] = [
    // 1. High Risk - Cash, Last Minute
    {
        pnrRecordLocator: 'A1B2C3D',
        dateOfReservation: '2023-10-25',
        numberOfChanges: 5,
        system: {
            sourceAirline: 'Airline A', receivedTimestamp: '2023-10-27 12:34:01', processingStatus: 'Processed', riskScore: 85,
            processedBy: 'AI-Module',
            processingTimestamp: '2023-10-27 12:34:03',
            bookingChannel: 'Online Travel Agent',
            passengerHistoryNotes: 'Previous no-show on a similar one-way international booking.',
            auditTrail: [
                { timestamp: '2023-10-27 12:34:01', action: 'PNR Received from Airline A', user: 'System' },
                { timestamp: '2023-10-27 12:34:02', action: 'Initial Validation Success', user: 'System' },
                { timestamp: '2023-10-27 12:34:03', action: 'Risk Assessment Completed', user: 'AI-Module' },
                { timestamp: '2023-10-27 12:34:03', action: 'High-risk alert generated', user: 'AI-Module' },
            ]
        },
        passengerDetails: [{ fullName: 'DOE, JOHN MR', dob: '1985-04-12', nationality: 'USA' }],
        fullTravelItinerary: [
            { departureAirportCode: 'JFK', arrivalAirportCode: 'LHR', flightNumber: 'AA100', scheduledDepartureDateTime: '2023-10-28 18:00', scheduledArrivalDateTime: '2023-10-29 06:00', airlineCode: 'AA', classOfTravel: 'Y' },
            { departureAirportCode: 'LHR', arrivalAirportCode: 'DXB', flightNumber: 'EK002', scheduledDepartureDateTime: '2023-10-29 09:00', scheduledArrivalDateTime: '2023-10-29 20:00', airlineCode: 'EK', classOfTravel: 'Y' }
        ],
        paymentDetails: { formOfPayment: 'Credit Card', partialCardNumber: '...1111', cardHolderName: 'John Doe' },
        contactInfo: { phone: '+12025550182', email: 'j.doe@example.com' },
        ticketingInfo: { ticketNumber: '1257894561230', issuingAirline: 'AA', dateOfIssuance: '2023-10-25', pointOfSale: 'New York' },
        specialServiceRequests: { ssrCodes: ['WCHR'], osiMessages: ['VIP PASSENGER'] },
        knownTravelerNumber: '9876543210',
        additionalInfo: {
            placeOfBirth: 'New York, USA',
            destinationAddress: {
                street: '123 Baker Street', city: 'London', state: 'N/A',
                postalCode: 'NW1 6XE', country: 'GBR'
            },
            transitStatus: 'Transiting',
            visa: {
                number: 'VGB123456', type: 'Tourist', issuingCountry: 'GBR',
                issueDate: '2023-09-01', expiryDate: '2024-03-01'
            }
        }
    },
    // 2. Low Risk - Direct, Business Class
    {
        pnrRecordLocator: 'E4F5G6H',
        dateOfReservation: '2023-10-27',
        numberOfChanges: 0,
        system: {
            sourceAirline: 'Airline B', receivedTimestamp: '2023-10-27 14:12:55', processingStatus: 'Processed', riskScore: 22,
            processedBy: 'System',
            processingTimestamp: '2023-10-27 14:12:56',
            bookingChannel: 'Airline Direct',
            passengerHistoryNotes: 'Gold-tier frequent flyer.',
            auditTrail: [
                { timestamp: '2023-10-27 14:12:55', action: 'PNR Received from Airline B', user: 'System' },
                { timestamp: '2023-10-27 14:12:56', action: 'Validation Success', user: 'System' },
                { timestamp: '2023-10-27 14:12:56', action: 'Risk Assessment Completed', user: 'AI-Module' },
            ]
        },
        passengerDetails: [{ fullName: 'SMITH, JANE MS' }],
        fullTravelItinerary: [{ departureAirportCode: 'CDG', arrivalAirportCode: 'SFO', flightNumber: 'AF084', scheduledDepartureDateTime: '2023-11-05 10:30', scheduledArrivalDateTime: '2023-11-05 13:10', airlineCode: 'AF', classOfTravel: 'J' }],
        paymentDetails: { formOfPayment: 'Cash' },
        contactInfo: { phone: '+33145678901', email: 'j.smith@example.com' },
        ticketingInfo: { ticketNumber: '0577894561231', issuingAirline: 'AF', dateOfIssuance: '2023-10-27', pointOfSale: 'Paris' },
        baggageInfo: { numberOfCheckedBags: 2, totalWeightKg: 45 }
    },
    // 3. Error - Data Validation Failed
    {
        pnrRecordLocator: 'I7J8K9L',
        dateOfReservation: '2023-10-26',
        numberOfChanges: 1,
        system: {
            sourceAirline: 'Airline C', receivedTimestamp: '2023-10-27 15:01:10', processingStatus: 'Error', riskScore: null,
            processedBy: 'System',
            processingTimestamp: '2023-10-27 15:01:11',
            bookingChannel: 'In-person Travel Agent',
            auditTrail: [
                { timestamp: '2023-10-27 15:01:10', action: 'PNR Received from Airline C', user: 'System' },
                { timestamp: '2023-10-27 15:01:11', action: 'Validation Failed', user: 'System' },
                { timestamp: '2023-10-27 15:01:11', action: 'Error logged: Invalid FQTV format', user: 'System' },
            ]
        },
        passengerDetails: [{ fullName: 'MUELLER, KLAUS MR' }],
        fullTravelItinerary: [{ departureAirportCode: 'FRA', arrivalAirportCode: 'ORD', flightNumber: 'LH430', scheduledDepartureDateTime: '2023-10-29 13:15', scheduledArrivalDateTime: '2023-10-29 15:45', airlineCode: 'LH', classOfTravel: 'F' }],
        paymentDetails: { formOfPayment: 'Credit Card', partialCardNumber: '...2222' },
        contactInfo: { phone: '+496912345678', email: 'k.mueller@example.de' },
        ticketingInfo: { ticketNumber: '2207894561232', issuingAirline: 'LH', dateOfIssuance: '2023-10-26', pointOfSale: 'Frankfurt' },
        remarks: "Invalid frequent flyer number format."
    },
    // 4. Medium Risk - Processing
    {
        pnrRecordLocator: 'M0N1P2Q',
        dateOfReservation: '2023-10-27',
        numberOfChanges: 0,
        system: {
            sourceAirline: 'Airline D', receivedTimestamp: '2023-10-27 15:20:00', processingStatus: 'Processing', riskScore: null,
            bookingChannel: 'Airline Direct',
            auditTrail: [
                { timestamp: '2023-10-27 15:20:00', action: 'PNR Received from Airline D', user: 'System' },
                { timestamp: '2023-10-27 15:20:00', action: 'Queued for processing', user: 'System' },
            ]
        },
        passengerDetails: [{ fullName: 'WANG, LI MS' }],
        fullTravelItinerary: [{ departureAirportCode: 'PVG', arrivalAirportCode: 'LAX', flightNumber: 'MU583', scheduledDepartureDateTime: '2023-11-01 21:00', scheduledArrivalDateTime: '2023-11-01 17:00', airlineCode: 'MU', classOfTravel: 'Y' }],
        paymentDetails: { formOfPayment: 'Credit Card', partialCardNumber: '...3333' },
        contactInfo: { phone: '+862112345678', email: 'li.wang@example.cn' },
        ticketingInfo: { ticketNumber: '7817894561233', issuingAirline: 'MU', dateOfIssuance: '2023-10-27', pointOfSale: 'Shanghai' }
    },
    // 5. Medium Risk - Validated
    {
        pnrRecordLocator: 'R3S4T5U',
        dateOfReservation: '2023-10-26',
        numberOfChanges: 0,
        system: {
            sourceAirline: 'Airline E', receivedTimestamp: '2023-10-27 15:30:00', processingStatus: 'Processed', riskScore: 45,
            processedBy: 'AI-Module', processingTimestamp: '2023-10-27 15:30:02', bookingChannel: 'Airline Direct'
        },
        passengerDetails: [{ fullName: 'GARCIA, CARLOS MR' }],
        fullTravelItinerary: [{ departureAirportCode: 'MIA', arrivalAirportCode: 'JFK', flightNumber: 'AA200', scheduledDepartureDateTime: '2023-11-02 09:00', scheduledArrivalDateTime: '2023-11-02 12:00', airlineCode: 'AA', classOfTravel: 'Y' }],
        paymentDetails: { formOfPayment: 'Credit Card', partialCardNumber: '...4444' },
        contactInfo: { phone: '+13055550199', email: 'c.garcia@example.com' },
        ticketingInfo: { ticketNumber: '1257894561234', issuingAirline: 'AA', dateOfIssuance: '2023-10-26', pointOfSale: 'Miami' },
    },
    // 6. High Risk - Voucher Payment
    {
        pnrRecordLocator: 'V6W7X8Y',
        dateOfReservation: '2023-10-27',
        numberOfChanges: 2,
        system: {
            sourceAirline: 'Airline F', receivedTimestamp: '2023-10-27 15:45:10', processingStatus: 'Processed', riskScore: 75,
            processedBy: 'AI-Module', processingTimestamp: '2023-10-27 15:45:12', bookingChannel: 'Online Travel Agent'
        },
        passengerDetails: [{ fullName: 'CHEN, WEI MS' }],
        fullTravelItinerary: [{ departureAirportCode: 'PEK', arrivalAirportCode: 'JFK', flightNumber: 'CA981', scheduledDepartureDateTime: '2023-10-30 13:00', scheduledArrivalDateTime: '2023-10-30 14:20', airlineCode: 'CA', classOfTravel: 'Y' }],
        paymentDetails: { formOfPayment: 'Voucher' },
        contactInfo: { phone: '+861012345678', email: 'w.chen@example.com' },
        ticketingInfo: { ticketNumber: '9997894561235', issuingAirline: 'CA', dateOfIssuance: '2023-10-27', pointOfSale: 'Beijing' },
    },
    // 7. Low Risk - Premium Economy
    {
        pnrRecordLocator: 'Z0A1B2C',
        dateOfReservation: '2023-10-20',
        numberOfChanges: 0,
        system: {
            sourceAirline: 'Airline C', receivedTimestamp: '2023-10-27 16:00:00', processingStatus: 'Processed', riskScore: 15,
            processedBy: 'AI-Module', processingTimestamp: '2023-10-27 16:00:02', bookingChannel: 'Airline Direct'
        },
        passengerDetails: [{ fullName: 'JONES, EMILY MS' }],
        fullTravelItinerary: [{ departureAirportCode: 'LHR', arrivalAirportCode: 'JFK', flightNumber: 'VS3', scheduledDepartureDateTime: '2023-11-10 11:50', scheduledArrivalDateTime: '2023-11-10 14:50', airlineCode: 'VS', classOfTravel: 'W' }],
        paymentDetails: { formOfPayment: 'Credit Card', partialCardNumber: '...5555' },
        contactInfo: { phone: '+442079460001', email: 'e.jones@example.co.uk' },
        ticketingInfo: { ticketNumber: '9327894561236', issuingAirline: 'VS', dateOfIssuance: '2023-10-20', pointOfSale: 'London' },
    },
    // 8. Medium Risk - One Way
    {
        pnrRecordLocator: 'D3E4F5G',
        dateOfReservation: '2023-10-27',
        numberOfChanges: 0,
        system: { sourceAirline: 'Airline A', receivedTimestamp: '2023-10-27 16:05:00', processingStatus: 'Processed', riskScore: 55 },
        passengerDetails: [{ fullName: 'LEE, MIN-JUN MR' }],
        fullTravelItinerary: [{ departureAirportCode: 'ICN', arrivalAirportCode: 'JFK', flightNumber: 'KE081', scheduledDepartureDateTime: '2023-11-03 10:00', scheduledArrivalDateTime: '2023-11-03 10:00', airlineCode: 'KE', classOfTravel: 'Y' }],
        paymentDetails: { formOfPayment: 'Credit Card' },
        contactInfo: { phone: '+82212345678', email: 'mj.lee@example.com' },
        ticketingInfo: { ticketNumber: '1801234567890', issuingAirline: 'KE', dateOfIssuance: '2023-10-27', pointOfSale: 'Seoul' }
    },
    // 9. Critical Risk - Cash Payment, Multiple Changes
    {
        pnrRecordLocator: 'H6I7J8K',
        dateOfReservation: '2023-10-27',
        numberOfChanges: 3,
        system: { sourceAirline: 'Airline G', receivedTimestamp: '2023-10-27 16:10:15', processingStatus: 'Processed', riskScore: 95 },
        passengerDetails: [{ fullName: 'AL-MASRI, OMAR MR' }],
        fullTravelItinerary: [
            { departureAirportCode: 'CAI', arrivalAirportCode: 'IST', flightNumber: 'TK693', scheduledDepartureDateTime: '2023-10-28 09:00', scheduledArrivalDateTime: '2023-10-28 11:15', airlineCode: 'TK', classOfTravel: 'Y' },
            { departureAirportCode: 'IST', arrivalAirportCode: 'JFK', flightNumber: 'TK1', scheduledDepartureDateTime: '2023-10-29 13:30', scheduledArrivalDateTime: '2023-10-29 17:20', airlineCode: 'TK', classOfTravel: 'Y' }
        ],
        paymentDetails: { formOfPayment: 'Cash' },
        contactInfo: { phone: '+20212345678', email: 'o.almasri@example.com' },
        ticketingInfo: { ticketNumber: '2351234567890', issuingAirline: 'TK', dateOfIssuance: '2023-10-27', pointOfSale: 'Cairo' }
    },
    // 10. Low Risk - Corporate Booking
    {
        pnrRecordLocator: 'L9M0N1P',
        dateOfReservation: '2023-10-25',
        numberOfChanges: 0,
        system: { sourceAirline: 'Airline B', receivedTimestamp: '2023-10-27 16:12:00', processingStatus: 'Processed', riskScore: 10 },
        passengerDetails: [{ fullName: 'ANDERSSON, SOFIA MS' }],
        fullTravelItinerary: [{ departureAirportCode: 'ARN', arrivalAirportCode: 'LHR', flightNumber: 'BA777', scheduledDepartureDateTime: '2023-11-05 14:00', scheduledArrivalDateTime: '2023-11-05 16:00', airlineCode: 'BA', classOfTravel: 'C' }],
        paymentDetails: { formOfPayment: 'Credit Card' },
        contactInfo: { phone: '+46812345678', email: 's.andersson@example.se' },
        ticketingInfo: { ticketNumber: '1251234567891', issuingAirline: 'BA', dateOfIssuance: '2023-10-25', pointOfSale: 'Stockholm' }
    },
    // 11. Medium Risk - Late Booking
    {
        pnrRecordLocator: 'Q2R3S4T',
        dateOfReservation: '2023-10-26',
        numberOfChanges: 1,
        system: { sourceAirline: 'Airline H', receivedTimestamp: '2023-10-27 16:15:30', processingStatus: 'Processed', riskScore: 65 },
        passengerDetails: [{ fullName: 'SILVA, JOAO MR' }],
        fullTravelItinerary: [{ departureAirportCode: 'GRU', arrivalAirportCode: 'MIA', flightNumber: 'AA906', scheduledDepartureDateTime: '2023-10-29 22:00', scheduledArrivalDateTime: '2023-10-30 06:00', airlineCode: 'AA', classOfTravel: 'Y' }],
        paymentDetails: { formOfPayment: 'Credit Card' },
        contactInfo: { phone: '+551112345678', email: 'j.silva@example.com.br' },
        ticketingInfo: { ticketNumber: '0011234567892', issuingAirline: 'AA', dateOfIssuance: '2023-10-26', pointOfSale: 'Sao Paulo' }
    },
    // 12. Low Risk - Debit Card
    {
        pnrRecordLocator: 'U5V6W7X',
        dateOfReservation: '2023-10-27',
        numberOfChanges: 0,
        system: { sourceAirline: 'Airline I', receivedTimestamp: '2023-10-27 16:18:45', processingStatus: 'Processed', riskScore: 35 },
        passengerDetails: [{ fullName: 'NOVAK, ANNA MS' }],
        fullTravelItinerary: [{ departureAirportCode: 'PRG', arrivalAirportCode: 'CDG', flightNumber: 'AF1383', scheduledDepartureDateTime: '2023-11-01 18:00', scheduledArrivalDateTime: '2023-11-01 19:40', airlineCode: 'AF', classOfTravel: 'Y' }],
        paymentDetails: { formOfPayment: 'Debit Card' },
        contactInfo: { phone: '+420212345678', email: 'a.novak@example.cz' },
        ticketingInfo: { ticketNumber: '0571234567893', issuingAirline: 'AF', dateOfIssuance: '2023-10-27', pointOfSale: 'Prague' }
    },
    // 13. Low Risk - Group Booking (Family)
    {
        pnrRecordLocator: 'Y9Z0A1B',
        dateOfReservation: '2023-09-15',
        numberOfChanges: 0,
        system: { sourceAirline: 'Airline J', receivedTimestamp: '2023-10-27 16:22:10', processingStatus: 'Processed', riskScore: 12 },
        passengerDetails: [
            { fullName: 'LIM, DAVID MR' },
            { fullName: 'LIM, SUSAN MS' },
            { fullName: 'LIM, CHLOE MISS' },
            { fullName: 'LIM, RYAN MSTR' }
        ],
        fullTravelItinerary: [{ departureAirportCode: 'SIN', arrivalAirportCode: 'KUL', flightNumber: 'SQ106', scheduledDepartureDateTime: '2023-12-01 08:00', scheduledArrivalDateTime: '2023-12-01 09:15', airlineCode: 'SQ', classOfTravel: 'Y' }],
        paymentDetails: { formOfPayment: 'Credit Card' },
        contactInfo: { phone: '+6591234567', email: 'd.lim@example.sg' },
        ticketingInfo: { ticketNumber: '6181234567899', issuingAirline: 'SQ', dateOfIssuance: '2023-09-15', pointOfSale: 'Singapore' }
    },
    // 14. Critical Risk - One-Way, Cash, High Risk Origin
    {
        pnrRecordLocator: 'C2D3E4F',
        dateOfReservation: '2023-10-27',
        numberOfChanges: 0,
        system: { sourceAirline: 'Airline K', receivedTimestamp: '2023-10-27 16:25:00', processingStatus: 'Processed', riskScore: 92 },
        passengerDetails: [{ fullName: 'HERNANDEZ, MATEO MR' }],
        fullTravelItinerary: [
            { departureAirportCode: 'BOG', arrivalAirportCode: 'MAD', flightNumber: 'AV010', scheduledDepartureDateTime: '2023-10-29 23:00', scheduledArrivalDateTime: '2023-10-30 15:00', airlineCode: 'AV', classOfTravel: 'Y' },
            { departureAirportCode: 'MAD', arrivalAirportCode: 'KUL', flightNumber: 'MH21', scheduledDepartureDateTime: '2023-10-30 20:00', scheduledArrivalDateTime: '2023-10-31 18:00', airlineCode: 'MH', classOfTravel: 'Y' }
        ],
        paymentDetails: { formOfPayment: 'Cash' },
        contactInfo: { phone: '+573001234567', email: 'm.hernandez@example.co' },
        ticketingInfo: { ticketNumber: '1341234567800', issuingAirline: 'AV', dateOfIssuance: '2023-10-27', pointOfSale: 'Bogota' }
    },
    // 15. Low Risk - Business, Corporate Card
    {
        pnrRecordLocator: 'G5H6I7J',
        dateOfReservation: '2023-10-20',
        numberOfChanges: 0,
        system: { sourceAirline: 'Airline L', receivedTimestamp: '2023-10-27 16:30:15', processingStatus: 'Processed', riskScore: 18 },
        passengerDetails: [{ fullName: 'WINDSOR, CHARLES MR' }],
        fullTravelItinerary: [{ departureAirportCode: 'LHR', arrivalAirportCode: 'HKG', flightNumber: 'CX252', scheduledDepartureDateTime: '2023-11-15 12:00', scheduledArrivalDateTime: '2023-11-16 07:00', airlineCode: 'CX', classOfTravel: 'J' }],
        paymentDetails: { formOfPayment: 'Credit Card', cardHolderName: 'GLOBAL CORP LTD' },
        contactInfo: { phone: '+447700900123', email: 'charles.w@globalcorp.com' },
        ticketingInfo: { ticketNumber: '1601234567811', issuingAirline: 'CX', dateOfIssuance: '2023-10-20', pointOfSale: 'London' }
    },
    // 16. Error - Missing Data
    {
        pnrRecordLocator: 'K8L9M0N',
        dateOfReservation: '2023-10-28',
        numberOfChanges: 0,
        system: { sourceAirline: 'Airline M', receivedTimestamp: '2023-10-27 16:35:00', processingStatus: 'Error', riskScore: null, auditTrail: [{ timestamp: '2023-10-27 16:35:00', action: 'Validation Failed: Missing mandatory DOB', user: 'System' }] },
        passengerDetails: [{ fullName: 'UNKNOWN, PAX' }],
        fullTravelItinerary: [{ departureAirportCode: 'JFK', arrivalAirportCode: 'MIA', flightNumber: 'DL123', scheduledDepartureDateTime: '2023-11-01 08:00', scheduledArrivalDateTime: '2023-11-01 11:00', airlineCode: 'DL', classOfTravel: 'Y' }],
        paymentDetails: { formOfPayment: 'Credit Card' },
        contactInfo: { phone: 'N/A', email: 'N/A' },
        ticketingInfo: { ticketNumber: '0061234567822', issuingAirline: 'DL', dateOfIssuance: '2023-10-28', pointOfSale: 'New York' }
    },
    // 17. Critical Risk - High Score, Unusual Route
    {
        pnrRecordLocator: 'O1P2Q3R',
        dateOfReservation: '2023-10-27',
        numberOfChanges: 1,
        system: { sourceAirline: 'Airline N', receivedTimestamp: '2023-10-27 16:40:45', processingStatus: 'Processed', riskScore: 88 },
        passengerDetails: [{ fullName: 'ADEBAYO, OLUWASEUN MR' }],
        fullTravelItinerary: [
            { departureAirportCode: 'LOS', arrivalAirportCode: 'DXB', flightNumber: 'EK782', scheduledDepartureDateTime: '2023-10-29 12:00', scheduledArrivalDateTime: '2023-10-29 22:00', airlineCode: 'EK', classOfTravel: 'Y' },
            { departureAirportCode: 'DXB', arrivalAirportCode: 'KUL', flightNumber: 'EK342', scheduledDepartureDateTime: '2023-10-30 03:00', scheduledArrivalDateTime: '2023-10-30 14:00', airlineCode: 'EK', classOfTravel: 'Y' }
        ],
        paymentDetails: { formOfPayment: 'Cash' },
        contactInfo: { phone: '+2348012345678', email: 'olu.a@example.com' },
        ticketingInfo: { ticketNumber: '1761234567833', issuingAirline: 'EK', dateOfIssuance: '2023-10-27', pointOfSale: 'Lagos' }
    },
    // 18. Medium Risk - Student Visa, One Way
    {
        pnrRecordLocator: 'S4T5U6V',
        dateOfReservation: '2023-09-01',
        numberOfChanges: 0,
        system: { sourceAirline: 'Airline O', receivedTimestamp: '2023-10-27 16:45:30', processingStatus: 'Processed', riskScore: 42 },
        passengerDetails: [{ fullName: 'KHAN, SAAD MR' }],
        fullTravelItinerary: [{ departureAirportCode: 'ISB', arrivalAirportCode: 'LHR', flightNumber: 'PK785', scheduledDepartureDateTime: '2023-10-15 11:00', scheduledArrivalDateTime: '2023-10-15 15:00', airlineCode: 'PK', classOfTravel: 'Y' }],
        paymentDetails: { formOfPayment: 'Credit Card' },
        contactInfo: { phone: '+923001234567', email: 'saad.k@university.edu' },
        ticketingInfo: { ticketNumber: '2141234567844', issuingAirline: 'PK', dateOfIssuance: '2023-09-01', pointOfSale: 'Islamabad' },
        specialServiceRequests: { ssrCodes: ['STU'] }
    },
    // 19. Low Risk - VIP/Diplomat
    {
        pnrRecordLocator: 'W7X8Y9Z',
        dateOfReservation: '2023-10-10',
        numberOfChanges: 2,
        system: { sourceAirline: 'Airline P', receivedTimestamp: '2023-10-27 16:50:00', processingStatus: 'Processed', riskScore: 5 },
        passengerDetails: [{ fullName: 'AMBASSADOR, ROBERT MR' }],
        fullTravelItinerary: [{ departureAirportCode: 'IAD', arrivalAirportCode: 'BRU', flightNumber: 'UA950', scheduledDepartureDateTime: '2023-11-20 17:00', scheduledArrivalDateTime: '2023-11-21 07:00', airlineCode: 'UA', classOfTravel: 'F' }],
        paymentDetails: { formOfPayment: 'Voucher' }, // Changed from 'Government Voucher'
        contactInfo: { phone: '+12025559999', email: 'travel@state.gov' },
        ticketingInfo: { ticketNumber: '0161234567855', issuingAirline: 'UA', dateOfIssuance: '2023-10-10', pointOfSale: 'Washington DC' },
        specialServiceRequests: { osiMessages: ['DIPLOMATIC PASSPORT', 'VIP'] }
    },
    // 20. Low Risk - Frequent Flyer Points
    {
        pnrRecordLocator: 'A0B1C2D',
        dateOfReservation: '2023-08-15',
        numberOfChanges: 0,
        system: { sourceAirline: 'Airline Q', receivedTimestamp: '2023-10-27 16:55:15', processingStatus: 'Processed', riskScore: 10 },
        passengerDetails: [{ fullName: 'TAN, WEI LING MS' }],
        fullTravelItinerary: [{ departureAirportCode: 'SIN', arrivalAirportCode: 'NRT', flightNumber: 'SQ638', scheduledDepartureDateTime: '2023-12-05 23:00', scheduledArrivalDateTime: '2023-12-06 07:00', airlineCode: 'SQ', classOfTravel: 'J' }],
        paymentDetails: { formOfPayment: 'Other', cardHolderName: 'Points Redemption' },
        contactInfo: { phone: '+6598765432', email: 'wl.tan@example.sg' },
        ticketingInfo: { ticketNumber: '6181234567866', issuingAirline: 'SQ', dateOfIssuance: '2023-08-15', pointOfSale: 'Singapore' }
    },
    // 21. Medium Risk - Split PNR
    {
        pnrRecordLocator: 'E3F4G5H',
        dateOfReservation: '2023-10-27',
        numberOfChanges: 0,
        system: { sourceAirline: 'Airline R', receivedTimestamp: '2023-10-27 17:00:30', processingStatus: 'Processed', riskScore: 38, passengerHistoryNotes: 'Linked to PNR X9Y8Z7 (Parent)' },
        passengerDetails: [{ fullName: 'JONES, BOBBY MSTR' }],
        fullTravelItinerary: [{ departureAirportCode: 'SYD', arrivalAirportCode: 'LAX', flightNumber: 'QF11', scheduledDepartureDateTime: '2023-11-12 10:00', scheduledArrivalDateTime: '2023-11-12 06:00', airlineCode: 'QF', classOfTravel: 'Y' }],
        paymentDetails: { formOfPayment: 'Credit Card' },
        contactInfo: { phone: '+61400123456', email: 'parent@example.com' },
        ticketingInfo: { ticketNumber: '0811234567877', issuingAirline: 'QF', dateOfIssuance: '2023-10-27', pointOfSale: 'Sydney' },
        specialServiceRequests: { ssrCodes: ['UMNR'] }
    },
    // 22. High Risk - Complex Multi-City
    {
        pnrRecordLocator: 'I6J7K8L',
        dateOfReservation: '2023-10-26',
        numberOfChanges: 4,
        system: { sourceAirline: 'Airline S', receivedTimestamp: '2023-10-27 17:05:45', processingStatus: 'Processed', riskScore: 82 },
        passengerDetails: [{ fullName: 'VOLKOV, DMITRI MR' }],
        fullTravelItinerary: [
            { departureAirportCode: 'IST', arrivalAirportCode: 'CAI', flightNumber: 'MS736', scheduledDepartureDateTime: '2023-11-01 14:00', scheduledArrivalDateTime: '2023-11-01 16:00', airlineCode: 'MS', classOfTravel: 'Y' },
            { departureAirportCode: 'CAI', arrivalAirportCode: 'ADD', flightNumber: 'ET453', scheduledDepartureDateTime: '2023-11-03 02:00', scheduledArrivalDateTime: '2023-11-03 07:00', airlineCode: 'ET', classOfTravel: 'Y' },
            { departureAirportCode: 'ADD', arrivalAirportCode: 'GRU', flightNumber: 'ET506', scheduledDepartureDateTime: '2023-11-05 10:00', scheduledArrivalDateTime: '2023-11-05 17:00', airlineCode: 'ET', classOfTravel: 'Y' }
        ],
        paymentDetails: { formOfPayment: 'Cash' },
        contactInfo: { phone: '+79001234567', email: 'd.volkov@example.ru' },
        ticketingInfo: { ticketNumber: '0711234567888', issuingAirline: 'ET', dateOfIssuance: '2023-10-26', pointOfSale: 'Istanbul' }
    }
];

type SortableKeys = 'pnrRecordLocator' | 'passengerName' | 'riskScore' | 'receivedTimestamp';
interface SortConfig {
    key: SortableKeys;
    direction: 'ascending' | 'descending';
}

const SortableHeader: React.FC<{
    title: string;
    sortKey: SortableKeys;
    currentSort: SortConfig;
    onRequestSort: (key: SortableKeys) => void;
    className?: string;
}> = ({ title, sortKey, currentSort, onRequestSort, className = '' }) => {
    const isSorted = currentSort.key === sortKey;
    const directionIcon = isSorted ? (currentSort.direction === 'ascending' ? '▲' : '▼') : '';

    return (
        <th
            className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${className}`}
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

const ExclamationTriangleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);

const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-3.181-3.182l-3.182 3.182a8.25 8.25 0 01-11.664 0l-3.182-3.182m3.182-3.182h4.992m-4.993 0v4.992" />
    </svg>
);

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#b91c1c'];

export const PNRGatewayDashboard: React.FC = () => {
    const [selectedPnr, setSelectedPnr] = useState<PnrDetail | null>(null);
    const [highRiskAlerts, setHighRiskAlerts] = useState<PnrDetail[]>(
        mockPnrs.filter(pnr => pnr.system.riskScore && pnr.system.riskScore > 70).sort((a,b) => b.system.riskScore! - a.system.riskScore!)
    );
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'receivedTimestamp', direction: 'descending' });


    const pnrRiskDistributionData = useMemo(() => {
        const distribution = {
            'Low (0-30)': 0,
            'Medium (31-60)': 0,
            'High (61-80)': 0,
            'Critical (81+)': 0,
        };

        mockPnrs.forEach(pnr => {
            if (pnr.system.riskScore === null || pnr.system.riskScore === undefined) {
                return;
            }
            const score = pnr.system.riskScore;
            if (score <= 30) {
                distribution['Low (0-30)']++;
            } else if (score <= 60) {
                distribution['Medium (31-60)']++;
            } else if (score <= 80) {
                distribution['High (61-80)']++;
            } else {
                distribution['Critical (81+)']++;
            }
        });

        return Object.entries(distribution).map(([name, value]) => ({ name, value }));
    }, [mockPnrs]);

    const requestSort = (key: SortableKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedPnrs = useMemo(() => {
        let sortableItems = [...mockPnrs];
        sortableItems.sort((a, b) => {
            let aValue: any;
            let bValue: any;

            if (sortConfig.key === 'passengerName') {
                aValue = a.passengerDetails[0]?.fullName || '';
                bValue = b.passengerDetails[0]?.fullName || '';
            } else if (sortConfig.key === 'riskScore') {
                aValue = a.system.riskScore ?? -1; // Treat nulls as lowest
                bValue = b.system.riskScore ?? -1;
            } else if (sortConfig.key === 'receivedTimestamp') {
                 aValue = new Date(a.system.receivedTimestamp).getTime();
                 bValue = new Date(b.system.receivedTimestamp).getTime();
            } else {
                aValue = a[sortConfig.key as keyof PnrDetail];
                bValue = b[sortConfig.key as keyof PnrDetail];
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
        return sortableItems;
    }, [sortConfig]);

    useEffect(() => {
        const interval = setInterval(() => {
            // 25% chance to add a new high-risk alert
            if (Math.random() < 0.25) {
                const newAlert: PnrDetail = {
                    pnrRecordLocator: `R${Math.floor(Math.random() * 9000) + 1000}X`,
                    dateOfReservation: new Date().toISOString().split('T')[0],
                    system: { 
                        sourceAirline: `Airline ${['X', 'Y', 'Z'][Math.floor(Math.random() * 3)]}`, 
                        receivedTimestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
                        processingStatus: 'Processed', 
                        riskScore: Math.floor(Math.random() * 30) + 71 // Score between 71 and 100
                    },
                    passengerDetails: [{ fullName: `RISK, ${['HIGH', 'CRITICAL'][Math.floor(Math.random()*2)]} ${['MR', 'MS'][Math.floor(Math.random()*2)]}` }],
                    fullTravelItinerary: [{ departureAirportCode: 'XXX', arrivalAirportCode: 'YYY', flightNumber: 'XX999', scheduledDepartureDateTime: '...', scheduledArrivalDateTime: '...', airlineCode: 'XX', classOfTravel: 'Y' }],
                    paymentDetails: { formOfPayment: 'Cash' },
                    contactInfo: { phone: '...', email: '...' },
                    ticketingInfo: { ticketNumber: '...', issuingAirline: '...', dateOfIssuance: '...', pointOfSale: '...' },
                };
                setHighRiskAlerts(prev => [newAlert, ...prev].slice(0, 5)); // Keep list to a max of 5
            }
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const handleViewDetails = (pnr: PnrDetail) => {
        setSelectedPnr(pnr);
    };

    const handleBackToList = () => {
        setSelectedPnr(null);
    };

    if (selectedPnr) {
        return <IndividualPnrRecordView pnr={selectedPnr} onBack={handleBackToList} />;
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <p className="text-sm text-gray-500">Total PNRs Received (24h)</p>
                    <p className="text-4xl font-bold text-brand-primary">15,432</p>
                </Card>
                <Card className="flex items-center space-x-4">
                    <div className="p-3 bg-status-green/20 rounded-full">
                        <CheckCircleIcon className="h-8 w-8 text-status-green" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Processed</p>
                        <p className="text-3xl font-bold text-gray-800">15,320</p>
                    </div>
                </Card>
                <Card className="flex items-center space-x-4">
                    <div className="p-3 bg-status-blue/20 rounded-full">
                        <ArrowPathIcon className="h-8 w-8 text-status-blue animate-spin" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Processing</p>
                        <p className="text-3xl font-bold text-gray-800">34</p>
                    </div>
                </Card>
                <Card className="flex items-center space-x-4">
                    <div className="p-3 bg-status-red/20 rounded-full">
                        <ExclamationTriangleIcon className="h-8 w-8 text-status-red" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Errors</p>
                        <p className="text-3xl font-bold text-gray-800">78</p>
                    </div>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title="Recent PNRs Received" className="lg:col-span-2">
                     <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <SortableHeader title="PNR Locator" sortKey="pnrRecordLocator" currentSort={sortConfig} onRequestSort={requestSort} />
                                    <SortableHeader title="Passenger Name" sortKey="passengerName" currentSort={sortConfig} onRequestSort={requestSort} />
                                    <SortableHeader title="Risk Score" sortKey="riskScore" currentSort={sortConfig} onRequestSort={requestSort} />
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source Airline</th>
                                    <SortableHeader title="Received Timestamp" sortKey="receivedTimestamp" currentSort={sortConfig} onRequestSort={requestSort} />
                                </tr>
                            </thead>
                             <tbody className="bg-white divide-y divide-gray-200">
                                {sortedPnrs.map(pnr => (
                                    <tr 
                                        key={pnr.pnrRecordLocator} 
                                        onClick={() => handleViewDetails(pnr)} 
                                        className={`hover:bg-gray-50 cursor-pointer ${pnr.system.riskScore && pnr.system.riskScore > 70 ? 'bg-amber-50' : ''}`} 
                                        title="Click to view details"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-500">{pnr.pnrRecordLocator}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{pnr.passengerDetails[0]?.fullName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                                            {pnr.system.riskScore !== null && pnr.system.riskScore !== undefined ? (
                                                <span className={
                                                    pnr.system.riskScore > 80 ? 'text-red-600' :
                                                    pnr.system.riskScore > 60 ? 'text-amber-600' : 'text-gray-600'
                                                }>
                                                    {pnr.system.riskScore}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pnr.system.sourceAirline}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pnr.system.receivedTimestamp}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <Card title="High-Risk PNR Alerts" titleClassName="text-red-600" className="lg:col-span-1 bg-red-50">
                    <div className="space-y-3">
                        {highRiskAlerts.length > 0 ? (
                            highRiskAlerts.map(alert => (
                                <div key={alert.pnrRecordLocator}
                                     className="bg-white p-3 rounded-md shadow-sm hover:shadow-md hover:ring-2 hover:ring-red-300 transition-all cursor-pointer border-l-4 border-red-500"
                                     onClick={() => handleViewDetails(alert)}
                                     title="Click to view details">
                                    <div className="flex justify-between items-center">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-brand-dark font-mono truncate">{alert.pnrRecordLocator}</p>
                                            <p className="text-sm text-gray-600 truncate">{alert.passengerDetails[0].fullName}</p>
                                            <p className="text-xs text-gray-500 mt-1">{alert.system.receivedTimestamp}</p>
                                        </div>
                                        <div className="text-center ml-4 flex-shrink-0">
                                            <p className="text-4xl font-extrabold text-red-600">{alert.system.riskScore}</p>
                                            <p className="text-xs font-semibold text-red-700 -mt-1">RISK SCORE</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24" stroke="currentColor" aria-hidden="true">
                                    <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4 4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No High-Risk Alerts</h3>
                                <p className="mt-1 text-sm text-gray-500">All incoming PNRs are within acceptable risk thresholds.</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card title="PNR Submissions by Source">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={pnrSourceData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="name" width={80} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" name="PNR Count" fill="#1e3a8a" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
                 <Card title="PNR Risk Breakdown">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={pnrRiskDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {pnrRiskDistributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>
            <div className="grid grid-cols-1 gap-6">
                <Card title="PNR Risk Distribution Trend (Hourly)">
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={pnrRiskDistributionTrendData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis label={{ value: 'Number of PNRs', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="Critical" stackId="1" stroke="#b91c1c" fill="#b91c1c" />
                            <Area type="monotone" dataKey="High" stackId="1" stroke="#ef4444" fill="#ef4444" />
                            <Area type="monotone" dataKey="Medium" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
                            <Area type="monotone" dataKey="Low" stackId="1" stroke="#10b981" fill="#10b981" />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );
};
