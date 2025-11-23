
import type { ETAApplication, ETAStatus } from '../types';

interface SubmissionData {
    firstName: string;
    lastName: string;
    passportNumber: string;
    nationality: string;
    dob: string;
    email: string;
    purpose: string;
}

// Mock Watchlist
const WATCHLIST = ['AHMED AL-FAYED', 'OSAMA BIN', 'IVAN DRAGO', 'BAD GUY'];

// High Risk Countries
const HIGH_RISK_COUNTRIES = ['EGY', 'RUS', 'PRK', 'SYR', 'IRN'];

export const etaService = {
    validateApplication: (data: SubmissionData): { valid: boolean; errors: string[] } => {
        const errors: string[] = [];
        
        if (!data.firstName || !data.lastName) errors.push("Name is required.");
        if (!data.passportNumber || data.passportNumber.length < 6) errors.push("Valid passport number is required.");
        if (!data.email || !data.email.includes('@')) errors.push("Valid email is required.");
        if (!data.nationality) errors.push("Nationality is required.");

        // Simple date validation
        const dobDate = new Date(data.dob);
        const today = new Date();
        if (isNaN(dobDate.getTime()) || dobDate >= today) {
            errors.push("Valid Date of Birth is required.");
        }

        return { valid: errors.length === 0, errors };
    },

    calculateRisk: (data: SubmissionData): { score: number; reasons: string[] } => {
        let score = 10; // Base score
        const reasons: string[] = [];
        const fullName = `${data.firstName} ${data.lastName}`.toUpperCase();

        // 1. Watchlist Check (Exact Match for demo)
        if (WATCHLIST.includes(fullName)) {
            score += 90;
            reasons.push('Watchlist Match (Name)');
        } else if (fullName.includes('SMITH')) {
            // Fuzzy match simulation
            score += 30;
            reasons.push('Fuzzy Watchlist Match');
        }

        // 2. Nationality Check
        if (HIGH_RISK_COUNTRIES.includes(data.nationality.toUpperCase())) {
            score += 40;
            reasons.push(`High Risk Origin (${data.nationality})`);
        }

        // 3. Passport Pattern (Mock - starts with X is suspicious)
        if (data.passportNumber.startsWith('X')) {
            score += 20;
            reasons.push('Document Anomaly');
        }

        return { score: Math.min(100, score), reasons };
    },

    determineDecision: (score: number): ETAStatus => {
        if (score >= 80) return 'Denied';
        if (score >= 40) return 'Pending Review';
        return 'Approved';
    },

    simulateEmailNotification: (email: string, status: ETAStatus) => {
        console.log(`[ETA NOTIFICATION SYSTEM] Sending email to ${email}: Your ETA application status is now ${status.toUpperCase()}.`);
        // In a real app, this would call a backend API
    },

    submitApplication: async (data: SubmissionData): Promise<ETAApplication> => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 1. Validate
        const validation = etaService.validateApplication(data);
        if (!validation.valid) {
            throw new Error(validation.errors.join(' '));
        }

        // 2. Assess Risk
        const riskAssessment = etaService.calculateRisk(data);
        
        // 3. Generate Decision
        const decision = etaService.determineDecision(riskAssessment.score);

        // 4. Create Record
        const newApplication: ETAApplication = {
            id: `ETA-${Date.now()}-${Math.floor(Math.random()*1000)}`,
            applicantName: `${data.firstName} ${data.lastName}`,
            nationality: data.nationality.toUpperCase(),
            passportNumber: data.passportNumber.toUpperCase(),
            email: data.email,
            submissionDate: new Date().toLocaleString(),
            status: decision,
            riskScore: riskAssessment.score,
            riskReasons: riskAssessment.reasons,
            officerNotes: decision === 'Denied' ? 'Auto-denied based on critical risk score.' : undefined
        };

        // 5. Persist (Mocking backend persistence via LocalStorage for demo purposes if needed, 
        // but for now returning to UI is enough for the portal flow. 
        // To link with Admin Dashboard, we could store it.)
        // Storing in a custom event or local storage to potentially be picked up by Admin Dashboard?
        // For this isolated demo, simply returning it is sufficient for the traveler view.
        
        // 6. Send Notification
        etaService.simulateEmailNotification(data.email, decision);

        return newApplication;
    },

    checkStatus: async (refNumber: string, passport: string): Promise<ETAApplication | null> => {
        // Simulate network
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock lookup logic
        if (refNumber === 'ETA-TEST-APPROVED') {
            return {
                id: refNumber,
                applicantName: 'Test Traveler',
                nationality: 'USA',
                passportNumber: passport,
                email: 'test@example.com',
                submissionDate: '2023-10-01 10:00:00',
                status: 'Approved',
                riskScore: 10
            };
        }
        return null; // Not found
    }
};
