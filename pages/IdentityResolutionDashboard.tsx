
import React, { useState, useMemo, useCallback } from 'react';
import { Card } from '../components/Card';
import type { IdentityProbe, IdentityCandidate, MatchResult, MatchResultAttribute } from '../types';
import { KeyIcon, ScaleIcon, AdjustmentsHorizontalIcon } from '../constants';

// MOCK DATA
const mockCandidates: IdentityCandidate[] = [
    { id: 'WL-001', name: 'JOHN SMITH', dob: '1980-01-15', nationality: 'USA', documentNumber: 'A12345678', countryOfBirth: 'USA', gender: 'Male', source: 'Watchlist' },
    { id: 'PUID-PHONETIC', name: 'JONATHAN SMITH', dob: '1980-01-15', nationality: 'GBR', documentNumber: 'G87654321', countryOfBirth: 'USA', gender: 'Male', source: 'Traveler DB' },
    { id: 'PUID-1234', name: 'JON SMYTHE', dob: '1980-01-16', nationality: 'USA', documentNumber: 'A12345679', countryOfBirth: 'USA', gender: 'Male', source: 'Traveler DB' },
    { id: 'WL-002', name: 'MARIA GARCIA', dob: '1992-05-20', nationality: 'ESP', documentNumber: 'E55555555', countryOfBirth: 'ESP', gender: 'Female', source: 'Watchlist' },
    { id: 'PUID-5678', name: 'MARIA GARCIA-LOPEZ', dob: '1992-05-20', nationality: 'ESP', documentNumber: 'E55555556', countryOfBirth: 'ESP', gender: 'Female', source: 'Traveler DB' },
    { id: 'PUID-9101', name: 'DAVID CHEN', dob: '1982-08-25', nationality: 'CAN', documentNumber: 'C98765432', countryOfBirth: 'HKG', gender: 'Male', source: 'Traveler DB' },
    { id: 'PUID-ARABIC', name: 'FATIMA SAYED', dob: '1991-09-05', nationality: 'EGY', documentNumber: 'Eg1234567', countryOfBirth: 'EGY', gender: 'Female', source: 'Watchlist' },
    { id: 'WL-003', name: 'MOHAMMED FAYED', dob: '1985-03-10', nationality: 'EGY', documentNumber: 'Eg7654321', countryOfBirth: 'EGY', gender: 'Male', source: 'Watchlist' },
    { id: 'PUID-TRANSLIT', name: 'MUHAMMED AL-FAYED', dob: '1985-03-10', nationality: 'EGY', documentNumber: 'Eg7654322', countryOfBirth: 'EGY', gender: 'Male', source: 'Traveler DB' },
];

// Levenshtein distance function for string similarity
const levenshteinDistance = (a: string, b: string): number => {
    const an = a ? a.length : 0;
    const bn = b ? b.length : 0;
    if (an === 0) return bn;
    if (bn === 0) return an;
    const matrix = Array(bn + 1);
    for (let i = 0; i <= bn; ++i) matrix[i] = [i];
    const a_i = Array(bn + 1);
    for (let j = 0; j <= bn; ++j) a_i[j] = 0;
    for (let i = 1; i <= an; ++i) {
        matrix[0] = [i];
        for (let j = 1; j <= bn; ++j) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[j] = [
                matrix[j - 1][0] + 1,
                matrix[j][0] + 1,
                matrix[j - 1][0] + cost,
            ];
            const min = Math.min(matrix[j][0], matrix[j][1], matrix[j][2]);
            matrix[j].unshift(min);
        }
    }
    return matrix[bn][0];
};

const stringSimilarity = (a: string, b: string): number => {
    if (!a || !b) return 0;
    const longer = Math.max(a.length, b.length);
    if (longer === 0) return 100;
    const distance = levenshteinDistance(a.toUpperCase(), b.toUpperCase());
    return ((longer - distance) / longer) * 100;
};

// Mock key generation logic for demonstration
const simulateKeyGeneration = (name: string): { soundex: string, metaphone: string, translit: string } => {
    const upperName = name.toUpperCase().replace(/[^A-Z]/g, '');
    // Very basic mock implementation for visual demonstration purposes
    let soundex = '';
    if (upperName.startsWith('SM')) soundex = 'S530'; // Smith, Smythe
    else if (upperName.startsWith('JO')) soundex = 'J500'; // John, Jon
    else if (upperName.includes('MOH') || upperName.includes('MUH')) soundex = 'M453'; // Mohammed
    else soundex = `${upperName.charAt(0)}000`;

    let metaphone = '';
    if (upperName.includes('SMITH') || upperName.includes('SMYTHE')) metaphone = 'SM0';
    else if (upperName.includes('MOHAM') || upperName.includes('MUHAM')) metaphone = 'MHM';
    else metaphone = upperName.substring(0, 4);

    let translit = '';
    if (upperName.includes('MOHAMMED') || upperName.includes('MUHAMMED')) translit = 'MHMD';
    else if (upperName.includes('FAYED')) translit = 'FYD';
    else translit = upperName.substring(0, 4);

    return { soundex, metaphone, translit };
};


const MatchResultCard: React.FC<{ result: MatchResult, isExpanded: boolean, onToggle: () => void, outcome: { label: string, color: string } }> = ({ result, isExpanded, onToggle, outcome }) => {
    const scoreColor = result.overallScore > 80 ? 'text-red-600' : result.overallScore > 60 ? 'text-amber-600' : 'text-green-600';
    
    return (
        <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
            <div className="p-4 cursor-pointer hover:bg-gray-50 flex justify-between items-center" onClick={onToggle}>
                <div>
                    <p className="font-bold text-brand-dark">{result.candidate.name}</p>
                    <p className="text-sm text-gray-500">ID: {result.candidate.id} ({result.candidate.source})</p>
                </div>
                <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 text-xs font-bold border rounded uppercase ${outcome.color}`}>
                        {outcome.label}
                    </span>
                    <div className="text-right">
                        <p className={`text-2xl font-extrabold ${scoreColor}`}>{result.overallScore.toFixed(0)}%</p>
                        <p className="text-xs text-gray-500">Match Score</p>
                    </div>
                </div>
            </div>
            {isExpanded && (
                <div className="p-4 border-t bg-gray-50/50">
                    <h4 className="font-semibold text-sm mb-2">Match Score Breakdown</h4>
                    <div className="space-y-2">
                        {result.attributes.map(attr => (
                            <div key={attr.attribute} className="grid grid-cols-[1fr_2fr] gap-2 text-sm">
                                <strong className="text-gray-600">{attr.attribute}</strong>
                                <div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-mono text-gray-800">{attr.candidateValue || '-'}</span>
                                        <span className={`font-bold ${attr.score > 80 ? 'text-green-600' : attr.score > 60 ? 'text-amber-600' : 'text-red-600'}`}>{attr.score.toFixed(0)}%</span>
                                    </div>
                                    <p className="text-xs text-gray-500 italic mt-1">{attr.explanation}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export const IdentityResolutionDashboard: React.FC = () => {
    const [probe, setProbe] = useState<IdentityProbe>({ 
        name: 'JONATHAN SMYTHE', 
        dob: '1980-01-15', 
        nationality: 'USA', 
        documentNumber: 'A12345679',
        countryOfBirth: 'USA',
        gender: 'Male',
        strategy: 'Standard', 
        population: 'Global' 
    });
    const [matchThreshold, setMatchThreshold] = useState(50);
    const [results, setResults] = useState<MatchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedResult, setExpandedResult] = useState<string | null>(null);
    const [generatedKeys, setGeneratedKeys] = useState<{ soundex: string, metaphone: string, translit: string } | null>(null);
    
    const [fieldWeights, setFieldWeights] = useState({ 
        name: 40, 
        dob: 20, 
        nationality: 10,
        documentNumber: 20,
        countryOfBirth: 5,
        gender: 5
    });
    
    // New State for Threshold Configuration
    const [thresholdConfig, setThresholdConfig] = useState({
        high: 95,
        medium: 72,
        highOutcome: 'Do Not Board',
        mediumOutcome: 'Contact Government',
        lowOutcome: 'No Action'
    });

    const totalWeight = useMemo(() => 
        fieldWeights.name + 
        fieldWeights.dob + 
        fieldWeights.nationality + 
        fieldWeights.documentNumber + 
        fieldWeights.countryOfBirth + 
        fieldWeights.gender, 
    [fieldWeights]);

    const getOutcomeForScore = (score: number) => {
        if (score >= thresholdConfig.high) return { label: thresholdConfig.highOutcome, color: 'bg-red-100 text-red-800 border-red-200' };
        if (score >= thresholdConfig.medium) return { label: thresholdConfig.mediumOutcome, color: 'bg-amber-100 text-amber-800 border-amber-200' };
        return { label: thresholdConfig.lowOutcome, color: 'bg-green-100 text-green-800 border-green-200' };
    };

    const handleRunResolution = useCallback(() => {
        setIsLoading(true);
        setResults([]);
        setExpandedResult(null);
        
        const keys = simulateKeyGeneration(probe.name);
        setGeneratedKeys(keys);

        setTimeout(() => {
            const totalW = totalWeight || 100; // Avoid division by zero
            const normalizedNameWeight = fieldWeights.name / totalW;
            const normalizedDobWeight = fieldWeights.dob / totalW;
            const normalizedNatWeight = fieldWeights.nationality / totalW;
            const normalizedDocWeight = fieldWeights.documentNumber / totalW;
            const normalizedCobWeight = fieldWeights.countryOfBirth / totalW;
            const normalizedGenderWeight = fieldWeights.gender / totalW;
            
            const calculatedResults = mockCandidates.map(candidate => {
                // 1. Name Score
                let nameScore;
                let nameExplanation = 'Similarity based on Levenshtein distance.';
                let processedProbeName = probe.name.replace(/\s+/g, ' ').trim();
                let processedCandidateName = candidate.name.replace(/\s+/g, ' ').trim();

                if (probe.population === 'Arabic') {
                    const arabicPrefix = /^AL-/i;
                    if (arabicPrefix.test(processedProbeName) || arabicPrefix.test(processedCandidateName)) {
                        processedProbeName = processedProbeName.replace(arabicPrefix, '').trim();
                        processedCandidateName = processedCandidateName.replace(arabicPrefix, '').trim();
                        nameExplanation = "Similarity adjusted for Arabic naming conventions (e.g., 'Al-').";
                    }
                }

                const candidateKeys = simulateKeyGeneration(candidate.name);
                
                if (probe.strategy === 'Phonetic') {
                    if (keys.soundex === candidateKeys.soundex && keys.soundex !== '0000' && !candidateKeys.soundex.endsWith('000')) {
                        nameScore = 95;
                        nameExplanation = `Match found via Phonetic Key (Soundex: ${keys.soundex}).`;
                    } else if (keys.metaphone === candidateKeys.metaphone && keys.metaphone.length > 1) {
                        nameScore = 92;
                        nameExplanation = `Match found via Phonetic Key (Metaphone: ${keys.metaphone}).`;
                    } else {
                        const simplifiedProbe = processedProbeName.replace(/[AEIOUYHW]/g, '');
                        const simplifiedCandidate = processedCandidateName.replace(/[AEIOUYHW]/g, '');
                        const phoneticSimilarity = stringSimilarity(simplifiedProbe, simplifiedCandidate);
    
                        if (phoneticSimilarity > 85) {
                             nameScore = Math.max(90, stringSimilarity(processedProbeName, processedCandidateName));
                             nameExplanation = "High similarity found using phonetic analysis (sounds-like).";
                        } else {
                             nameScore = stringSimilarity(processedProbeName, processedCandidateName);
                        }
                    }
                } else {
                    if (keys.translit === candidateKeys.translit && keys.translit.length > 2) {
                         nameScore = 94;
                         nameExplanation = `Linked via Transliteration/Root Key (${keys.translit}).`;
                    } else {
                        nameScore = stringSimilarity(processedProbeName, processedCandidateName);
                    }
                }
                
                // 2. DOB Score
                const dobScore = probe.dob === candidate.dob ? 100 : stringSimilarity(probe.dob, candidate.dob) > 80 ? 80 : 0;
                
                // 3. Nationality Score
                const natScore = probe.nationality === candidate.nationality ? 100 : 0;

                // 4. Document Number Score
                const docScore = stringSimilarity(probe.documentNumber || '', candidate.documentNumber || '');
                const docExplanation = docScore === 100 ? 'Exact match.' : docScore > 80 ? 'Partial/Fuzzy match.' : 'Mismatch.';

                // 5. Country of Birth Score
                const cobScore = probe.countryOfBirth === candidate.countryOfBirth ? 100 : 0;
                
                // 6. Gender Score
                const genderScore = probe.gender === candidate.gender ? 100 : 0;
                
                const overallScore = 
                    nameScore * normalizedNameWeight + 
                    dobScore * normalizedDobWeight + 
                    natScore * normalizedNatWeight +
                    docScore * normalizedDocWeight +
                    cobScore * normalizedCobWeight +
                    genderScore * normalizedGenderWeight;
                
                const attributes: MatchResultAttribute[] = [
                    { attribute: 'Name', probeValue: probe.name, candidateValue: candidate.name, score: nameScore, explanation: nameExplanation },
                    { attribute: 'Date of Birth', probeValue: probe.dob, candidateValue: candidate.dob, score: dobScore, explanation: dobScore === 100 ? 'Exact match.' : 'No match.' },
                    { attribute: 'Nationality', probeValue: probe.nationality, candidateValue: candidate.nationality, score: natScore, explanation: 'Exact match required.' },
                    { attribute: 'Document Number', probeValue: probe.documentNumber || 'N/A', candidateValue: candidate.documentNumber || 'N/A', score: docScore, explanation: docExplanation },
                    { attribute: 'Country of Birth', probeValue: probe.countryOfBirth || 'N/A', candidateValue: candidate.countryOfBirth || 'N/A', score: cobScore, explanation: cobScore === 100 ? 'Exact match.' : 'Mismatch.' },
                    { attribute: 'Gender', probeValue: probe.gender || 'N/A', candidateValue: candidate.gender || 'N/A', score: genderScore, explanation: genderScore === 100 ? 'Exact match.' : 'Mismatch.' }
                ];

                return { candidate, overallScore, attributes };
            });
            
            setResults(calculatedResults.sort((a, b) => b.overallScore - a.overallScore));
            setIsLoading(false);
        }, 1500); // Simulate API call
    }, [probe, fieldWeights, totalWeight]);

    const filteredResults = useMemo(() => {
        return results.filter(r => r.overallScore >= matchThreshold);
    }, [results, matchThreshold]);

    const loadScenario = (type: 'Phonetic' | 'Transliteration') => {
        if (type === 'Phonetic') {
            setProbe({ 
                name: 'JON SMYTHE', dob: '1980-01-15', nationality: 'USA', 
                documentNumber: 'A12345679', countryOfBirth: 'USA', gender: 'Male',
                strategy: 'Phonetic', population: 'Global' 
            });
        } else {
            setProbe({ 
                name: 'MUHAMMED AL-FAYED', dob: '1985-03-10', nationality: 'EGY', 
                documentNumber: 'Eg7654321', countryOfBirth: 'EGY', gender: 'Male',
                strategy: 'Standard', population: 'Arabic' 
            });
        }
        setResults([]);
        setGeneratedKeys(null);
    };
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
                <Card title="Identity Probe">
                    <div className="space-y-4">
                        <div className="flex justify-end space-x-2 mb-2">
                             <span className="text-xs text-gray-500 self-center mr-1">Quick Load:</span>
                             <button onClick={() => loadScenario('Phonetic')} className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded">Phonetic</button>
                             <button onClick={() => loadScenario('Transliteration')} className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded">Transliteration</button>
                        </div>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input id="name" type="text" value={probe.name} onChange={e => setProbe({...probe, name: e.target.value.toUpperCase()})} className="w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                            <input id="dob" type="date" value={probe.dob} onChange={e => setProbe({...probe, dob: e.target.value})} className="w-full p-2 border rounded-md" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                             <div>
                                <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">Nationality</label>
                                <input id="nationality" type="text" value={probe.nationality} onChange={e => setProbe({...probe, nationality: e.target.value.toUpperCase()})} maxLength={3} placeholder="USA" className="w-full p-2 border rounded-md" />
                            </div>
                            <div>
                                <label htmlFor="countryOfBirth" className="block text-sm font-medium text-gray-700">Country of Birth</label>
                                <input id="countryOfBirth" type="text" value={probe.countryOfBirth} onChange={e => setProbe({...probe, countryOfBirth: e.target.value.toUpperCase()})} maxLength={3} placeholder="USA" className="w-full p-2 border rounded-md" />
                            </div>
                        </div>
                         <div>
                            <label htmlFor="documentNumber" className="block text-sm font-medium text-gray-700">Document Number</label>
                            <input id="documentNumber" type="text" value={probe.documentNumber} onChange={e => setProbe({...probe, documentNumber: e.target.value})} className="w-full p-2 border rounded-md" />
                        </div>
                         <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                            <select id="gender" value={probe.gender} onChange={e => setProbe({...probe, gender: e.target.value})} className="w-full p-2 border rounded-md bg-white">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <button onClick={handleRunResolution} disabled={isLoading} className="w-full py-2 bg-brand-secondary text-white rounded-lg disabled:bg-gray-400">
                            {isLoading ? 'Running...' : 'Run Identity Resolution'}
                        </button>
                    </div>
                </Card>
                <Card title="Engine Strategy & Configuration">
                    <p className="text-sm text-gray-600 mb-4">Select advanced search strategies and culturally-aware populations to improve match accuracy.</p>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="strategy" className="block text-sm font-medium text-gray-700">Search Strategy</label>
                            <select id="strategy" value={probe.strategy} onChange={e => setProbe({...probe, strategy: e.target.value as IdentityProbe['strategy']})} className="w-full p-2 border rounded-md bg-white">
                                <option value="Standard">Standard (Levenshtein)</option>
                                <option value="Phonetic">Phonetic (Sounds-Like)</option>
                                <option value="Strict">Strict (High-Confidence)</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="population" className="block text-sm font-medium text-gray-700">Population</label>
                            <select id="population" value={probe.population} onChange={e => setProbe({...probe, population: e.target.value as IdentityProbe['population']})} className="w-full p-2 border rounded-md bg-white">
                                <option value="Global">Global</option>
                                <option value="Arabic">Arabic (handles 'Al-')</option>
                                <option value="Chinese">Chinese (Surname first)</option>
                            </select>
                        </div>
                    </div>
                </Card>
                <Card title={
                    <div className="flex items-center">
                        <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2 text-brand-secondary" />
                        <span>Rule Configuration: Confidence Thresholds</span>
                    </div>
                }>
                    <p className="text-sm text-gray-600 mb-4">Define automated outcomes based on match confidence scores.</p>
                    
                    <div className="mb-6 px-1">
                         <div className="h-4 w-full rounded-full bg-gradient-to-r from-green-400 via-amber-400 to-red-500 relative mt-6">
                             <div className="absolute h-6 w-1 bg-black top-[-4px] transition-all duration-300" style={{left: `${thresholdConfig.medium}%`}} title={`Medium Threshold: ${thresholdConfig.medium}%`} />
                             <div className="absolute h-6 w-1 bg-black top-[-4px] transition-all duration-300" style={{left: `${thresholdConfig.high}%`}} title={`High Threshold: ${thresholdConfig.high}%`} />
                         </div>
                         <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                             <span>0%</span>
                             <span>50%</span>
                             <span>100%</span>
                         </div>
                    </div>

                    <div className="space-y-4 border-t pt-4">
                        <div>
                             <div className="flex justify-between items-center mb-1">
                                 <label className="text-sm font-medium text-red-800">High Confidence ({thresholdConfig.high}% - 100%)</label>
                             </div>
                             <div className="flex gap-2">
                                <input type="number" min={thresholdConfig.medium + 1} max="100" value={thresholdConfig.high} onChange={(e) => setThresholdConfig({...thresholdConfig, high: parseInt(e.target.value)})} className="w-20 p-1 text-sm border rounded" />
                                <select value={thresholdConfig.highOutcome} onChange={(e) => setThresholdConfig({...thresholdConfig, highOutcome: e.target.value})} className="flex-1 p-1 text-sm border rounded bg-white">
                                    <option>Do Not Board</option><option>Alert</option><option>Contact Government</option>
                                </select>
                             </div>
                        </div>
                        <div>
                             <div className="flex justify-between items-center mb-1">
                                 <label className="text-sm font-medium text-amber-700">Medium Confidence ({thresholdConfig.medium}% - {thresholdConfig.high - 1}%)</label>
                             </div>
                             <div className="flex gap-2">
                                <input type="number" min="1" max={thresholdConfig.high - 1} value={thresholdConfig.medium} onChange={(e) => setThresholdConfig({...thresholdConfig, medium: parseInt(e.target.value)})} className="w-20 p-1 text-sm border rounded" />
                                <select value={thresholdConfig.mediumOutcome} onChange={(e) => setThresholdConfig({...thresholdConfig, mediumOutcome: e.target.value})} className="flex-1 p-1 text-sm border rounded bg-white">
                                    <option>Contact Government</option><option>Alert</option><option>Monitor</option>
                                </select>
                             </div>
                        </div>
                         <div>
                             <div className="flex justify-between items-center mb-1">
                                 <label className="text-sm font-medium text-green-700">Low Confidence (Below {thresholdConfig.medium}%)</label>
                             </div>
                             <div className="flex gap-2">
                                <div className="w-20 p-1 text-sm text-gray-500 italic">Fixed</div>
                                <select value={thresholdConfig.lowOutcome} onChange={(e) => setThresholdConfig({...thresholdConfig, lowOutcome: e.target.value})} className="flex-1 p-1 text-sm border rounded bg-white">
                                    <option>No Action</option><option>Monitor</option>
                                </select>
                             </div>
                        </div>
                    </div>
                </Card>
                <Card title={
                    <div className="flex items-center">
                        <ScaleIcon className="h-5 w-5 mr-2 text-brand-secondary" />
                        <span>Configurable Field Weighting</span>
                    </div>
                }>
                    <p className="text-sm text-gray-600 mb-4">Adjust the relative weight of each attribute in the total match score.</p>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <label htmlFor="weight-name" className="font-medium text-gray-700">Name Weight</label>
                                <span className="font-bold text-brand-dark">{fieldWeights.name}%</span>
                            </div>
                            <input id="weight-name" type="range" min="0" max="100" value={fieldWeights.name} onChange={(e) => setFieldWeights({...fieldWeights, name: parseInt(e.target.value)})} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <label htmlFor="weight-dob" className="font-medium text-gray-700">DOB Weight</label>
                                <span className="font-bold text-brand-dark">{fieldWeights.dob}%</span>
                            </div>
                            <input id="weight-dob" type="range" min="0" max="100" value={fieldWeights.dob} onChange={(e) => setFieldWeights({...fieldWeights, dob: parseInt(e.target.value)})} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                        </div>
                         <div>
                            <div className="flex justify-between text-sm mb-1">
                                <label htmlFor="weight-doc" className="font-medium text-gray-700">Document Weight</label>
                                <span className="font-bold text-brand-dark">{fieldWeights.documentNumber}%</span>
                            </div>
                            <input id="weight-doc" type="range" min="0" max="100" value={fieldWeights.documentNumber} onChange={(e) => setFieldWeights({...fieldWeights, documentNumber: parseInt(e.target.value)})} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <label htmlFor="weight-nat" className="font-medium text-gray-700">Nationality Weight</label>
                                <span className="font-bold text-brand-dark">{fieldWeights.nationality}%</span>
                            </div>
                            <input id="weight-nat" type="range" min="0" max="100" value={fieldWeights.nationality} onChange={(e) => setFieldWeights({...fieldWeights, nationality: parseInt(e.target.value)})} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <label htmlFor="weight-cob" className="font-medium text-gray-700">Country of Birth Weight</label>
                                <span className="font-bold text-brand-dark">{fieldWeights.countryOfBirth}%</span>
                            </div>
                            <input id="weight-cob" type="range" min="0" max="100" value={fieldWeights.countryOfBirth} onChange={(e) => setFieldWeights({...fieldWeights, countryOfBirth: parseInt(e.target.value)})} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <label htmlFor="weight-gender" className="font-medium text-gray-700">Gender Weight</label>
                                <span className="font-bold text-brand-dark">{fieldWeights.gender}%</span>
                            </div>
                            <input id="weight-gender" type="range" min="0" max="100" value={fieldWeights.gender} onChange={(e) => setFieldWeights({...fieldWeights, gender: parseInt(e.target.value)})} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                        </div>

                        <div className={`flex justify-between items-center pt-2 border-t ${totalWeight === 100 ? 'text-green-600' : 'text-red-600'}`}>
                            <span className="text-sm font-bold">Total Weight</span>
                            <span className="text-sm font-bold">{totalWeight}%</span>
                        </div>
                        {totalWeight !== 100 && <p className="text-xs text-red-500">Weights should ideally sum to 100%.</p>}
                    </div>
                </Card>
                {generatedKeys && (
                    <Card title="Advanced Search Keys Generated" className="bg-indigo-50 border border-indigo-200">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Soundex Key:</span>
                                <span className="font-mono font-bold text-brand-primary bg-white px-2 py-1 rounded shadow-sm">{generatedKeys.soundex}</span>
                            </div>
                             <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Metaphone Key:</span>
                                <span className="font-mono font-bold text-brand-primary bg-white px-2 py-1 rounded shadow-sm">{generatedKeys.metaphone}</span>
                            </div>
                             <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Transliteration Root:</span>
                                <span className="font-mono font-bold text-brand-primary bg-white px-2 py-1 rounded shadow-sm">{generatedKeys.translit}</span>
                            </div>
                            <div className="pt-2 mt-2 border-t border-indigo-200 flex items-center text-xs text-indigo-600">
                                <KeyIcon className="h-4 w-4 mr-1" />
                                <span>Keys used to index & link variations</span>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
            <div className="lg:col-span-2">
                <Card>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                        <h3 className="text-xl font-semibold text-brand-dark">Match Results</h3>
                        <div className="w-full sm:w-1/2">
                            <label htmlFor="threshold" className="block text-sm font-medium text-gray-700">Match Threshold: <span className="font-bold text-brand-primary">{matchThreshold}%</span></label>
                            <input id="threshold" type="range" min="0" max="100" value={matchThreshold} onChange={e => setMatchThreshold(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                        </div>
                    </div>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                        {isLoading && <p className="text-center text-gray-500 py-8">Searching for likely matches...</p>}
                        {!isLoading && results.length > 0 && filteredResults.length === 0 && <p className="text-center text-gray-500 py-8">No results above the {matchThreshold}% threshold.</p>}
                        {!isLoading && results.length === 0 && <p className="text-center text-gray-500 py-8">Run a query to see match results.</p>}
                        {filteredResults.map(result => (
                           <MatchResultCard 
                                key={result.candidate.id} 
                                result={result} 
                                isExpanded={expandedResult === result.candidate.id}
                                onToggle={() => setExpandedResult(prev => prev === result.candidate.id ? null : result.candidate.id)}
                                outcome={getOutcomeForScore(result.overallScore)}
                            />
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};