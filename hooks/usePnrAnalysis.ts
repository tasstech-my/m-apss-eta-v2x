import { useState, useEffect } from 'react';
import type { PnrDetail, XAIExplanation } from '../types';
import { generatePnrRiskSummary } from '../services/geminiService';

export const usePnrAnalysis = (pnr: PnrDetail | null) => {
  const [explanation, setExplanation] = useState<XAIExplanation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchExplanation = async () => {
      if (!pnr) {
        setExplanation(null);
        setIsLoading(false);
        return;
      }

      // Condition for AI-powered analysis for high-risk or errored PNRs
      const needsAiAnalysis = (pnr.system.riskScore && pnr.system.riskScore >= 70) || pnr.system.processingStatus === 'Error';
      
      // Condition for standard analysis for low-to-medium risk, processed PNRs
      const isStandardRisk = pnr.system.riskScore !== null && pnr.system.riskScore !== undefined && pnr.system.riskScore < 70 && pnr.system.processingStatus === 'Processed';

      if (needsAiAnalysis) {
        setIsLoading(true);
        setExplanation(null); // Clear previous explanation
        try {
          const result = await generatePnrRiskSummary(pnr);
          setExplanation(result);
        } catch (error) {
          console.error("Error fetching PNR analysis:", error);
          setExplanation({
            humanReadable: "An error occurred while generating the AI analysis.",
            contributingFactors: [],
          });
        } finally {
          setIsLoading(false);
        }
      } else if (isStandardRisk) {
        setIsLoading(false);
        setExplanation({
          humanReadable: "This PNR exhibits a standard travel pattern with no significant risk indicators identified during automated checks. The booking and travel history are consistent with typical passenger behavior.",
          contributingFactors: [
            { name: "Routine Itinerary", value: "Direct flight on established route", impact: "Low" },
            { name: "Booking Channel", value: pnr.system.bookingChannel || "Known Agent", impact: "Low" },
            { name: "Payment Method", value: pnr.paymentDetails.formOfPayment || "Verified", impact: "Low" }
          ]
        });
      } else {
        // Reset state for other cases (e.g., 'Processing' status)
        setExplanation(null);
        setIsLoading(false);
      }
    };

    fetchExplanation();
  }, [pnr]);

  return { isLoading, explanation };
};