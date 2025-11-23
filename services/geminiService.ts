import type { Passenger, XAIExplanation, PnrDetail, AuditEvent } from '../types';

// This is a MOCK implementation of the Gemini API service.
// In a real application, you would replace these with actual API calls to a backend
// that securely calls the Gemini API.

// Mock of @google/genai Type enum
const Type = {
  STRING: 'STRING',
  OBJECT: 'OBJECT',
  ARRAY: 'ARRAY',
};

const xaiExplanationSchema = {
    type: Type.OBJECT,
    properties: {
        humanReadable: {
            type: Type.STRING,
            description: "A human-readable summary of the risk assessment."
        },
        contributingFactors: {
            type: Type.ARRAY,
            description: "A list of factors contributing to the risk score.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: {
                        type: Type.STRING,
                        description: "The name of the risk factor."
                    },
                    value: {
                        type: Type.STRING,
                        description: "The value of the risk factor observed."
                    },
                    impact: {
                        type: Type.STRING,
                        description: "The impact level of the factor (High, Medium, or Low)."
                    }
                },
                required: ['name', 'value', 'impact']
            }
        }
    },
    required: ['humanReadable', 'contributingFactors']
};


const ai = {
  models: {
    generateContent: async (params: { model: string; contents: string | any; config?: any }) => {
      console.log("Mock Gemini Request:", params);
      // Simulate network delay
      await new Promise(res => setTimeout(res, 1000 + Math.random() * 1000));

      if (params.model === 'gemini-2.5-flash') {
        if (typeof params.contents === 'string' && params.contents.includes("risk assessment summary")) {
          // Mocking passenger risk summary
          return {
            text: JSON.stringify({
                humanReadable: "The passenger exhibits a high-risk profile due to a last-minute, one-way cash booking to a high-risk destination, combined with a travel history that includes overstays in two countries. The itinerary is unusual, involving multiple layovers that do not form a logical route.",
                contributingFactors: [
                    { name: "Payment Method", value: "Cash", impact: "High" },
                    { name: "Booking Time", value: "< 24 hours pre-flight", impact: "High" },
                    { name: "Itinerary", value: "Circuitous Route", impact: "Medium" },
                    { name: "Travel History", value: "Previous Overstays", impact: "Medium" },
                ]
            }),
          };
        }
        if (typeof params.contents === 'string' && params.contents.includes("Analyze the following dataset")) {
            // Mocking XAI Audit
             return {
                text: JSON.stringify({
                    summary: "The audit of 10,500 risk assessments reveals a slight statistical bias. Passengers from nationality 'X' have a 15% higher average risk score than the baseline, even with similar travel patterns. This may indicate an over-weighting of the 'Destination' feature for this group. No significant bias was detected for other protected attributes.",
                    findings: [
                        { type: 'BiasDetected', metric: 'DisparateImpactRatio', value: '1.15', group: 'Nationality X', severity: 'Medium', recommendation: 'Review feature weights for "Destination" and consider retraining with a balanced dataset.' },
                        { type: 'Performance', metric: 'OverallAccuracy', value: '98.2%', group: 'All', severity: 'Low', recommendation: 'Monitor accuracy for any degradation.' }
                    ],
                    auditTrail: [
                        { timestamp: '2023-10-27 16:00:00', action: 'Audit initiated by user', user: 'Operator' },
                        { timestamp: '2023-10-27 16:00:01', action: 'Fetching dataset of 10,500 records', user: 'System' },
                        { timestamp: '2023-10-27 16:00:05', action: 'Starting bias analysis module', user: 'AI-Audit-Module' },
                        { timestamp: '2023-10-27 16:00:05', action: 'Analyzing attribute: Nationality', user: 'AI-Audit-Module' },
                        { timestamp: '2023-10-27 16:00:08', action: 'Finding: Disparate impact ratio of 1.15 detected for Nationality X', user: 'AI-Audit-Module' },
                        { timestamp: '2023-10-27 16:00:08', action: 'Analyzing attribute: Gender', user: 'AI-Audit-Module' },
                        { timestamp: '2023-10-27 16:00:10', action: 'Starting performance analysis module', user: 'AI-Audit-Module' },
                        { timestamp: '2023-10-27 16:00:12', action: 'Finding: Overall accuracy is 98.2%', user: 'AI-Audit-Module' },
                        { timestamp: '2023-10-27 16:00:13', action: 'Generating summary and recommendations', user: 'System' },
                        { timestamp: '2023-10-27 16:00:14', action: 'Audit complete', user: 'System' },
                    ]
                })
             }
        }
        if (typeof params.contents === 'string' && params.contents.includes("PNR Data")) {
            const pnrDataString = params.contents.substring(params.contents.indexOf('{'));
            const pnrData = JSON.parse(pnrDataString);

            const factors: { name: string; value: string; impact: string }[] = [];
            const summaryParts: string[] = [];

            if (pnrData.passengerHistory && pnrData.passengerHistory.toLowerCase().includes('no-show')) {
                factors.push({ name: "Passenger History", value: "Previous no-show", impact: "High" });
                summaryParts.push("A previous history of no-shows raises a significant flag.");
            }

            if (pnrData.numberOfChanges > 3) {
                factors.push({ name: "PNR Changes", value: `${pnrData.numberOfChanges} changes in last 24h`, impact: "High" });
                summaryParts.push(`The PNR has undergone an unusually high number of last-minute changes (${pnrData.numberOfChanges}).`);
            } else if (pnrData.numberOfChanges > 0) {
                factors.push({ name: "PNR Changes", value: `${pnrData.numberOfChanges} change(s)`, impact: "Low" });
            }
            
            if (pnrData.itinerary && pnrData.itinerary.length > 1) {
                const start = pnrData.itinerary[0].departureAirportCode;
                const end = pnrData.itinerary[pnrData.itinerary.length - 1].arrivalAirportCode;
                const isReturn = pnrData.itinerary.some((seg: any) => seg.departureAirportCode === end && seg.arrivalAirportCode === start);
                
                if (!isReturn) {
                    factors.push({ name: "Itinerary Complexity", value: "Multi-leg, one-way", impact: "Medium" });
                    summaryParts.push("The complex multi-leg, one-way journey appears illogical.");
                }
            }
            
            if (pnrData.bookingChannel === 'Online Travel Agent') {
                factors.push({ name: "Booking Channel", value: "Online Travel Agent", impact: "Medium" });
                summaryParts.push("Booking via a non-direct online agent obscures purchase origin.");
            }

            if (pnrData.payment?.formOfPayment === 'Cash') {
                factors.push({ name: "Payment Method", value: "Cash", impact: "Medium" });
                summaryParts.push("Cash payment limits financial traceability.");
            } else if (pnrData.payment?.formOfPayment === 'Credit Card') {
                 factors.push({ name: "Payment Method", value: "Credit Card", impact: "Low" });
            }

            if (pnrData.specialServiceRequests?.ssrCodes?.length > 0) {
                const ssrString = pnrData.specialServiceRequests.ssrCodes.join(', ');
                factors.push({ name: "Special Service Requests", value: ssrString, impact: "Low" });
            }
            
            let finalSummary = "";
            if (factors.length === 0) {
                finalSummary = "Standard risk factors observed. No significant anomalies detected in the travel pattern or booking information.";
                factors.push({ name: "Routine Travel", value: "Established route", impact: "Low" });
            } else {
                const highImpact = factors.some(f => f.impact === 'High');
                const mediumImpact = factors.some(f => f.impact === 'Medium');
                if (highImpact) {
                    finalSummary = `Critical risk profile identified. ${summaryParts.join(' ')}`;
                } else if (mediumImpact) {
                     finalSummary = `Elevated risk profile identified. ${summaryParts.join(' ')}`;
                } else {
                     finalSummary = `Standard profile with minor factors noted. ${summaryParts.join(' ')}`;
                }
            }

            return {
                text: JSON.stringify({
                    humanReadable: finalSummary,
                    contributingFactors: factors.sort((a, b) => {
                        const impacts = { High: 3, Medium: 2, Low: 1 };
                        return (impacts[b.impact as keyof typeof impacts] || 0) - (impacts[a.impact as keyof typeof impacts] || 0);
                    })
                }),
            };
        }
      }
      return { text: "Mock response from Gemini." };
    },
  },
};


export const generatePassengerRiskSummary = async (passenger: Passenger): Promise<XAIExplanation> => {
    const prompt = `Based on the following passenger data, generate a concise risk assessment summary in JSON format with 'humanReadable' and 'contributingFactors' fields. Highlight anomalous patterns. Passenger Data: ${JSON.stringify(passenger)}`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: xaiExplanationSchema,
            }
        });
        
        const parsedText = JSON.parse(response.text);
        
        return {
            humanReadable: parsedText.humanReadable || "No summary available.",
            contributingFactors: parsedText.contributingFactors || []
        };
    } catch (error) {
        console.error("Error generating passenger risk summary:", error);
        return {
            humanReadable: "Error generating AI summary.",
            contributingFactors: []
        };
    }
};

export const generatePnrRiskSummary = async (pnr: PnrDetail): Promise<XAIExplanation> => {
    const prompt = `Based on the following PNR data, generate a concise risk assessment summary in JSON format with 'humanReadable' and 'contributingFactors' fields. Analyze the itinerary, passenger details, payment methods, booking channel, change history, and passenger history for anomalies. PNR Data: ${JSON.stringify({ 
        itinerary: pnr.fullTravelItinerary, 
        passengers: pnr.passengerDetails, 
        payment: pnr.paymentDetails,
        bookingChannel: pnr.system.bookingChannel,
        numberOfChanges: pnr.numberOfChanges,
        passengerHistory: pnr.system.passengerHistoryNotes,
        specialServiceRequests: pnr.specialServiceRequests,
    })}`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: xaiExplanationSchema,
            }
        });
        
        const parsedText = JSON.parse(response.text);
        
        return {
            humanReadable: parsedText.humanReadable || "No summary available.",
            contributingFactors: parsedText.contributingFactors || []
        };
    } catch (error) {
        console.error("Error generating PNR risk summary:", error);
        return {
            humanReadable: "Error generating AI summary.",
            contributingFactors: []
        };
    }
};

export const performModelAudit = async (auditData: any[]): Promise<any> => {
    const prompt = `Analyze the following dataset of AI-driven risk assessments for potential bias. Return a JSON object with 'summary' and 'findings' fields. Dataset: ${JSON.stringify(auditData.slice(0, 50))}`; // Send a subset for the prompt
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error performing model audit:", error);
        return { summary: "Error performing AI audit.", findings: [], auditTrail: [] };
    }
};