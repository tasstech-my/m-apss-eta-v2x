
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Card } from '../components/Card';
import { generatePassengerRiskSummary } from '../services/geminiService';
import type { Passenger, XAIExplanation } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const allMockPassengers: Passenger[] = [
    { id: 'PUID-1001', name: 'John Doe', nationality: 'USA', dob: '1985-05-20', riskScore: 88, photoUrl: 'https://picsum.photos/seed/p1/100', travelHistory: [{ flightNumber: 'UA123', from: 'LHR', to: 'JFK', date: '2023-10-10' }, { flightNumber: 'UA987', from: 'JFK', to: 'LAX', date: '2023-11-15' }], apiData: { payment: 'Cash' }, pnrData: { booking: 'Last Minute' } },
    { id: 'PUID-2034', name: 'Maria Garcia', nationality: 'ESP', dob: '1992-11-12', riskScore: 25, photoUrl: 'https://picsum.photos/seed/p2/100', travelHistory: [{ flightNumber: 'IB345', from: 'MAD', to: 'MIA', date: '2023-09-15' }], apiData: {}, pnrData: {} },
    { id: 'PUID-8572', name: 'Ken Tanaka', nationality: 'JPN', dob: '1978-02-03', riskScore: 55, photoUrl: 'https://picsum.photos/seed/p3/100', travelHistory: [{ flightNumber: 'JL45', from: 'HND', to: 'SFO', date: '2023-11-01' }], apiData: {}, pnrData: {} },
    { id: 'PUID-3491', name: 'Aisha Khan', nationality: 'PAK', dob: '1995-07-30', riskScore: 15, photoUrl: '', travelHistory: [{ flightNumber: 'PK789', from: 'ISB', to: 'DXB', date: '2023-10-22' }], apiData: {}, pnrData: {} },
    { id: 'PUID-1002', name: 'Emily Jones', nationality: 'GBR', dob: '1990-03-15', riskScore: 42, photoUrl: 'https://picsum.photos/seed/p5/100', travelHistory: [{ flightNumber: 'UA123', from: 'LHR', to: 'JFK', date: '2023-10-10' }], apiData: {}, pnrData: {} },
    { id: 'PUID-1003', name: 'David Chen', nationality: 'CAN', dob: '1982-08-25', riskScore: 76, photoUrl: 'https://picsum.photos/seed/p6/100', travelHistory: [{ flightNumber: 'UA123', from: 'LHR', to: 'JFK', date: '2023-10-10' }], apiData: {}, pnrData: { itinerary: 'One-way' } },
    { id: 'PUID-4001', name: 'Fatima Al-Sayed', nationality: 'EGY', dob: '1988-12-01', riskScore: 65, photoUrl: 'https://picsum.photos/seed/p7/100', travelHistory: [{ flightNumber: 'MS777', from: 'CAI', to: 'JFK', date: '2023-10-11' }], apiData: {}, pnrData: {} },
    { id: 'PUID-4002', name: 'Carlos Rodriguez', nationality: 'MEX', dob: '1993-06-18', riskScore: 33, photoUrl: 'https://picsum.photos/seed/p8/100', travelHistory: [{ flightNumber: 'AM408', from: 'MEX', to: 'JFK', date: '2023-10-10' }], apiData: {}, pnrData: {} },
    { id: 'PUID-5001', name: 'Sophie Dubois', nationality: 'FRA', dob: '1991-09-05', riskScore: 92, photoUrl: 'https://picsum.photos/seed/p9/100', travelHistory: [{ flightNumber: 'AF006', from: 'CDG', to: 'JFK', date: '2023-10-09' }], apiData: { payment: 'Cash', booking: 'Last Minute' }, pnrData: {} },
    { id: 'PUID-6001', name: 'Ivan Petrov', nationality: 'RUS', dob: '1975-04-14', riskScore: 81, photoUrl: 'https://picsum.photos/seed/p10/100', travelHistory: [{ flightNumber: 'SU102', from: 'SVO', to: 'JFK', date: '2023-10-10' }, { flightNumber: 'EK204', from: 'JFK', to: 'DXB', date: '2023-10-12' }], apiData: {}, pnrData: {} },
    { id: 'PUID-1004', name: 'Michael Brown', nationality: 'USA', dob: '1987-01-20', riskScore: 22, photoUrl: 'https://picsum.photos/seed/p11/100', travelHistory: [{ flightNumber: 'UA123', from: 'LHR', to: 'JFK', date: '2023-10-10' }], apiData: {}, pnrData: {} }
];

const COLORS = ['#34d399', '#fbbf24', '#f87171', '#dc2626'];

type SortableKeys = keyof Passenger | 'lastFlightDate';
interface SortConfig {
    key: SortableKeys;
    direction: 'ascending' | 'descending';
}

const availableColumns = [
    { key: 'name', label: 'Passenger Name' },
    { key: 'riskScore', label: 'Risk Score' },
    { key: 'nationality', label: 'Nationality' },
    { key: 'dob', label: 'Date of Birth' },
    { key: 'lastFlightDate', label: 'Last Flight Date' },
];

const DocumentArrowDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);


const RiskLevelIndicator: React.FC<{ score: number }> = ({ score }) => {
    let color = 'bg-green-500';
    if (score > 80) color = 'bg-red-600';
    else if (score > 60) color = 'bg-red-500';
    else if (score > 30) color = 'bg-amber-500';
    return <div className={`w-3 h-3 rounded-full ${color}`} />;
};

const PassengerRiskProfile: React.FC<{
    passenger: Passenger,
    onBack: () => void,
    onPhotoUpload: (passengerId: string, photoUrl: string) => void
}> = ({ passenger, onBack, onPhotoUpload }) => {
    const [explanation, setExplanation] = useState<XAIExplanation | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const impactStyles: Record<string, { border: string; badge: string }> = {
        High: { border: 'border-status-red', badge: 'bg-status-red/20 text-status-red' },
        Medium: { border: 'border-status-amber', badge: 'bg-status-amber/20 text-status-amber' },
        Low: { border: 'border-status-green', badge: 'bg-status-green/20 text-status-green' },
    };

    useEffect(() => {
        const fetchExplanation = async () => {
            if (passenger.riskScore > 60) {
                 setIsLoading(true);
                 const result = await generatePassengerRiskSummary(passenger);
                 setExplanation(result);
                 setIsLoading(false);
            } else {
                setExplanation({
                    humanReadable: "Standard risk factors observed. No significant anomalies detected in the travel pattern or booking information.",
                    contributingFactors: [{ name: "Routine Travel", value: "Established route", impact: "Low" }]
                });
            }
        };
        fetchExplanation();
    }, [passenger]);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    onPhotoUpload(passenger.id, e.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Card>
            <button onClick={onBack} className="mb-4 text-brand-secondary hover:underline">&larr; Back to List</button>
            <div className="flex flex-col md:flex-row gap-6">
                {/* Left Panel: Passenger Info */}
                <div className="md:w-1/3">
                    <Card title="Passenger Details" className="bg-gray-50">
                        <div className="flex flex-col items-center space-y-4">
                            {passenger.photoUrl ? (
                                <img src={passenger.photoUrl} alt={passenger.name} className="w-24 h-24 rounded-full object-cover" />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center" aria-label="No passenger photo">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                                accept="image/png, image/jpeg"
                            />
                             <button
                                onClick={handleUploadClick}
                                className="px-3 py-1 bg-brand-light text-brand-primary text-xs font-semibold rounded-md border border-brand-secondary hover:bg-brand-secondary hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors"
                            >
                                {passenger.photoUrl ? 'Change Photo' : 'Upload Photo'}
                            </button>

                            <div className="text-center">
                                <h3 className="text-xl font-bold">{passenger.name}</h3>
                                <p className="text-gray-600">{passenger.nationality}</p>
                                <p className="text-sm text-gray-500">DOB: {passenger.dob}</p>
                            </div>
                        </div>
                         <div className="mt-4">
                            <p className="text-sm text-gray-500">Overall Risk Score</p>
                            <p className={`text-5xl font-bold ${passenger.riskScore > 60 ? 'text-red-600' : 'text-green-600'}`}>{passenger.riskScore}</p>
                        </div>
                    </Card>
                </div>
                {/* Right Panel: AI Explanation */}
                <div className="md:w-2/3">
                     <Card title="AI-Powered Risk Analysis (XAI)">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-40">
                                <svg className="animate-spin h-8 w-8 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="ml-4 text-gray-600">Generating AI Explanation...</span>
                            </div>
                        ) : explanation ? (
                             <div>
                                <h4 className="font-semibold text-gray-700">Explanation Summary</h4>
                                <p className="text-gray-600 mb-4 bg-blue-50 p-3 rounded-md">{explanation.humanReadable}</p>
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
                        ) : <p>No explanation available.</p>}
                    </Card>
                </div>
            </div>
        </Card>
    );
};

const getLastFlightDate = (passenger: Passenger): string | null => {
    if (!passenger.travelHistory || passenger.travelHistory.length === 0) {
        return null;
    }
    // Assuming dates are in YYYY-MM-DD format
    return passenger.travelHistory.reduce((latest, flight) => {
        return flight.date > latest ? flight.date : latest;
    }, passenger.travelHistory[0].date);
};

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
            className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${className}`}
            onClick={() => onRequestSort(sortKey)}
        >
            <div className="flex items-center">
                <span>{title}</span>
                <span className="ml-2 w-4 text-gray-600">{directionIcon}</span>
            </div>
        </th>
    );
};

export const RiskAnalyticsDashboard: React.FC = () => {
    const [passengers, setPassengers] = useState<Passenger[]>(allMockPassengers);
    const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null);
    const [searchFlightNumber, setSearchFlightNumber] = useState('');
    const [searchOrigin, setSearchOrigin] = useState('');
    const [searchDestination, setSearchDestination] = useState('');
    const [searchNationality, setSearchNationality] = useState('');
    const [searchDobStartDate, setSearchDobStartDate] = useState('');
    const [searchDobEndDate, setSearchDobEndDate] = useState('');
    const [searchLastFlightStartDate, setSearchLastFlightStartDate] = useState('');
    const [searchLastFlightEndDate, setSearchLastFlightEndDate] = useState('');
    const [searchResults, setSearchResults] = useState<Passenger[] | null>(null);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'riskScore', direction: 'descending' });
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [selectedExportColumns, setSelectedExportColumns] = useState<string[]>(availableColumns.map(c => c.key));
    const [exportOption, setExportOption] = useState<'all' | 'selected'>('all');


    const riskDistributionData = useMemo(() => {
        const distribution = {
            'Low Risk (0-30)': 0,
            'Medium Risk (31-60)': 0,
            'High Risk (61-80)': 0,
            'Critical Risk (81-100)': 0,
        };

        passengers.forEach(p => {
            if (p.riskScore <= 30) {
                distribution['Low Risk (0-30)']++;
            } else if (p.riskScore <= 60) {
                distribution['Medium Risk (31-60)']++;
            } else if (p.riskScore <= 80) {
                distribution['High Risk (61-80)']++;
            } else {
                distribution['Critical Risk (81-100)']++;
            }
        });

        return Object.entries(distribution).map(([name, value]) => ({ name, value }));
    }, [passengers]);

    const handlePhotoUpload = (passengerId: string, photoUrl: string) => {
        setPassengers(prevPassengers =>
            prevPassengers.map(p =>
                p.id === passengerId ? { ...p, photoUrl } : p
            )
        );
    
        if (selectedPassenger && selectedPassenger.id === passengerId) {
            setSelectedPassenger(prev => prev ? { ...prev, photoUrl } : null);
        }
        
        if (searchResults) {
            setSearchResults(prevResults =>
                prevResults ? prevResults.map(p =>
                    p.id === passengerId ? { ...p, photoUrl } : p
                ) : null
            );
        }
    };

    const handleSearch = useCallback(() => {
        const hasSearchCriteria = searchFlightNumber || searchOrigin || searchDestination || searchNationality || searchDobStartDate || searchDobEndDate || searchLastFlightStartDate || searchLastFlightEndDate;
        if (!hasSearchCriteria) {
            setSearchResults(null);
            return;
        }

        const results = passengers.filter(passenger => {
            const nationalityMatch = searchNationality
                ? passenger.nationality.toLowerCase().includes(searchNationality.toLowerCase())
                : true;

            const dobMatch = (() => {
                if (!searchDobStartDate && !searchDobEndDate) return true;
                const passengerDob = passenger.dob;
                const startMatch = !searchDobStartDate || passengerDob >= searchDobStartDate;
                const endMatch = !searchDobEndDate || passengerDob <= searchDobEndDate;
                return startMatch && endMatch;
            })();

            const lastFlightDateMatch = (() => {
                if (!searchLastFlightStartDate && !searchLastFlightEndDate) return true;
                const lastFlightDate = getLastFlightDate(passenger);
                if (!lastFlightDate) return false; // If passenger has no flights, they can't match a date range.
                const startMatch = !searchLastFlightStartDate || lastFlightDate >= searchLastFlightStartDate;
                const endMatch = !searchLastFlightEndDate || lastFlightDate <= searchLastFlightEndDate;
                return startMatch && endMatch;
            })();

            if (!nationalityMatch || !dobMatch || !lastFlightDateMatch) {
                return false;
            }

            const hasFlightFilters = searchFlightNumber || searchOrigin || searchDestination;
            if (!hasFlightFilters) {
                return true;
            }

            return passenger.travelHistory.some(flight => {
                const flightNumMatch = searchFlightNumber ? flight.flightNumber.toLowerCase().includes(searchFlightNumber.toLowerCase()) : true;
                const originMatch = searchOrigin ? flight.from.toLowerCase().includes(searchOrigin.toLowerCase()) : true;
                const destinationMatch = searchDestination ? flight.to.toLowerCase().includes(searchDestination.toLowerCase()) : true;
                return flightNumMatch && originMatch && destinationMatch;
            });
        });
        setSearchResults(results);
    }, [searchFlightNumber, searchOrigin, searchDestination, searchNationality, searchDobStartDate, searchDobEndDate, searchLastFlightStartDate, searchLastFlightEndDate, passengers]);


    const handleClearSearch = () => {
        setSearchFlightNumber('');
        setSearchOrigin('');
        setSearchDestination('');
        setSearchNationality('');
        setSearchDobStartDate('');
        setSearchDobEndDate('');
        setSearchLastFlightStartDate('');
        setSearchLastFlightEndDate('');
        setSearchResults(null);
    };

    const handleSelectPassenger = (passenger: Passenger) => {
        setSelectedPassenger(passenger);
    };
    
    const handleBack = () => {
        setSelectedPassenger(null);
    }

    const requestSort = (key: SortableKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedPassengers = useMemo(() => {
        const baseList = searchResults !== null ? searchResults : passengers;
        let sortableItems = [...baseList];

        sortableItems.sort((a, b) => {
            let aValue: any;
            let bValue: any;

            if (sortConfig.key === 'lastFlightDate') {
                aValue = getLastFlightDate(a);
                bValue = getLastFlightDate(b);
                if (!aValue) return 1;
                if (!bValue) return -1;
            } else {
                aValue = a[sortConfig.key as keyof Passenger];
                bValue = b[sortConfig.key as keyof Passenger];
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
    }, [searchResults, sortConfig, passengers]);

    const handleDownloadCsv = () => {
        const columnsToExport = exportOption === 'all'
            ? availableColumns
            : availableColumns.filter(col => selectedExportColumns.includes(col.key));

        if (columnsToExport.length === 0) {
            alert("Please select at least one column to export.");
            return;
        }

        const headers = columnsToExport.map(col => col.label);

        const rows = sortedPassengers.map(p => {
            return columnsToExport.map(col => {
                // Wrap each value in quotes to handle potential commas and newlines
                const escapeCsv = (val: string | number | null | undefined) => {
                    const str = String(val ?? '');
                    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                        return `"${str.replace(/"/g, '""')}"`;
                    }
                    return str;
                };

                switch (col.key) {
                    case 'name': return escapeCsv(p.name);
                    case 'riskScore': return p.riskScore;
                    case 'nationality': return p.nationality;
                    case 'dob': return p.dob;
                    case 'lastFlightDate': return getLastFlightDate(p) || 'N/A';
                    default: return '';
                }
            }).join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-s-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        const date = new Date().toISOString().split('T')[0];
        link.setAttribute('download', `passenger_export_${date}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setIsExportModalOpen(false);
    };

    const ExportModal: React.FC = () => {
        const handleColumnSelectionChange = (columnKey: string) => {
            setSelectedExportColumns(prev =>
                prev.includes(columnKey)
                    ? prev.filter(key => key !== columnKey)
                    : [...prev, columnKey]
            );
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
                <Card title="Export Passenger Data to CSV" className="w-full max-w-lg animate-scale-in">
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">You are about to export {sortedPassengers.length} passenger records.</p>
                        
                        <fieldset className="space-y-2">
                            <legend className="text-base font-medium text-gray-900">Export Options</legend>
                            <div className="flex items-center">
                                <input id="exportAll" name="export-option" type="radio" value="all" checked={exportOption === 'all'} onChange={() => setExportOption('all')} className="h-4 w-4 text-brand-secondary focus:ring-brand-primary border-gray-300" />
                                <label htmlFor="exportAll" className="ml-3 block text-sm font-medium text-gray-700">Export all columns</label>
                            </div>
                            <div className="flex items-center">
                                <input id="exportSelected" name="export-option" type="radio" value="selected" checked={exportOption === 'selected'} onChange={() => setExportOption('selected')} className="h-4 w-4 text-brand-secondary focus:ring-brand-primary border-gray-300" />
                                <label htmlFor="exportSelected" className="ml-3 block text-sm font-medium text-gray-700">Export selected columns</label>
                            </div>
                        </fieldset>

                        {exportOption === 'selected' && (
                            <div className="pt-2 pl-4 border-l-2 border-gray-200">
                                <h4 className="text-sm font-medium text-gray-800 mb-2">Select columns to include:</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {availableColumns.map(col => (
                                        <div key={col.key} className="relative flex items-start">
                                            <div className="flex items-center h-5">
                                                <input
                                                    id={`col-${col.key}`}
                                                    name={col.key}
                                                    type="checkbox"
                                                    checked={selectedExportColumns.includes(col.key)}
                                                    onChange={() => handleColumnSelectionChange(col.key)}
                                                    className="h-4 w-4 text-brand-secondary focus:ring-brand-primary border-gray-300 rounded"
                                                />
                                            </div>
                                            <div className="ml-3 text-sm">
                                                <label htmlFor={`col-${col.key}`} className="font-medium text-gray-700">{col.label}</label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button onClick={() => setIsExportModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleDownloadCsv} className="px-4 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-primary transition-colors flex items-center">
                            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                            Download CSV
                        </button>
                    </div>
                </Card>
            </div>
        );
    };

    if(selectedPassenger) {
        return <PassengerRiskProfile passenger={selectedPassenger} onBack={handleBack} onPhotoUpload={handlePhotoUpload}/>
    }

    const listTitle = searchResults !== null ? `Passenger Search Results` : 'High-Risk Passenger Queue';
    const isSearchDisabled = !searchFlightNumber && !searchOrigin && !searchDestination && !searchNationality && !searchDobStartDate && !searchDobEndDate && !searchLastFlightStartDate && !searchLastFlightEndDate;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {isExportModalOpen && <ExportModal />}
            <div className="lg:col-span-2">
                <Card title={
                    <div className="flex justify-between items-center">
                        <span>{listTitle}</span>
                        <button 
                            onClick={() => setIsExportModalOpen(true)}
                            className="px-3 py-1.5 bg-brand-light text-brand-primary text-sm font-semibold rounded-md border border-brand-secondary hover:bg-brand-secondary hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors flex items-center"
                            aria-label="Export passenger list to CSV"
                        >
                            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                            Export
                        </button>
                    </div>
                }>
                    {searchResults !== null && (
                        <div className="mb-4 text-sm text-gray-700 bg-blue-50 p-3 rounded-md border border-blue-200">
                            <p>
                                Showing <strong>{sortedPassengers.length} passenger(s)</strong> matching your search criteria.&nbsp;
                                <button onClick={handleClearSearch} className="font-semibold text-brand-secondary hover:underline">
                                    Clear search
                                </button>
                                &nbsp;to view all passengers.
                            </p>
                        </div>
                    )}
                     <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Passenger</th>
                                    <SortableHeader title="Risk Score" sortKey="riskScore" currentSort={sortConfig} onRequestSort={requestSort} />
                                    <SortableHeader title="Nationality" sortKey="nationality" currentSort={sortConfig} onRequestSort={requestSort} />
                                    <SortableHeader title="Date of Birth" sortKey="dob" currentSort={sortConfig} onRequestSort={requestSort} />
                                    <SortableHeader title="Last Flight Date" sortKey="lastFlightDate" currentSort={sortConfig} onRequestSort={requestSort} />
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sortedPassengers.length > 0 ? sortedPassengers.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3"><RiskLevelIndicator score={p.riskScore} /></td>
                                        <td className="px-4 py-3 flex items-center">
                                            <img src={p.photoUrl || 'https://via.placeholder.com/32'} alt={p.name} className="w-8 h-8 rounded-full mr-3 object-cover" />
                                            <span className="font-medium text-gray-800">{p.name}</span>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-bold">{p.riskScore}</td>
                                        <td className="px-4 py-3 text-sm text-gray-800">{p.nationality}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 font-mono">{p.dob}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 font-mono">{getLastFlightDate(p) || 'N/A'}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <button
                                                onClick={() => handleSelectPassenger(p)}
                                                className="px-3 py-1 bg-brand-secondary text-white text-xs font-semibold rounded-md hover:bg-brand-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors"
                                                aria-label={`View summary for ${p.name}`}
                                            >
                                                View Summary
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8 text-gray-500">
                                            No passengers found for the given criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                     </div>
                </Card>
            </div>
            <div className="space-y-6">
                 <Card title="Passenger Search">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="flightNumber" className="block text-sm font-medium text-gray-700">Flight Number</label>
                            <input type="text" id="flightNumber" value={searchFlightNumber} onChange={e => setSearchFlightNumber(e.target.value)} placeholder="e.g., UA123" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="origin" className="block text-sm font-medium text-gray-700">Origin</label>
                                <input type="text" id="origin" value={searchOrigin} onChange={e => setSearchOrigin(e.target.value)} placeholder="IATA Code" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="destination" className="block text-sm font-medium text-gray-700">Destination</label>
                                <input type="text" id="destination" value={searchDestination} onChange={e => setSearchDestination(e.target.value)} placeholder="IATA Code" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">Passenger Nationality</label>
                            <input type="text" id="nationality" value={searchNationality} onChange={e => setSearchNationality(e.target.value)} placeholder="e.g., USA, GBR" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="dobStartDate" className="block text-sm font-medium text-gray-700">DOB From</label>
                                <input type="date" id="dobStartDate" value={searchDobStartDate} onChange={e => setSearchDobStartDate(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="dobEndDate" className="block text-sm font-medium text-gray-700">DOB To</label>
                                <input type="date" id="dobEndDate" value={searchDobEndDate} onChange={e => setSearchDobEndDate(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="lastFlightStartDate" className="block text-sm font-medium text-gray-700">Last Flight From</label>
                                <input type="date" id="lastFlightStartDate" value={searchLastFlightStartDate} onChange={e => setSearchLastFlightStartDate(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="lastFlightEndDate" className="block text-sm font-medium text-gray-700">Last Flight To</label>
                                <input type="date" id="lastFlightEndDate" value={searchLastFlightEndDate} onChange={e => setSearchLastFlightEndDate(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm" />
                            </div>
                        </div>
                        <div className="flex space-x-2 pt-2">
                            <button onClick={handleSearch} disabled={isSearchDisabled} className="w-full px-4 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-primary transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                                Search Passengers
                            </button>
                            {searchResults !== null && (
                                <button onClick={handleClearSearch} className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </Card>
                <Card title="Passenger Risk Distribution">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={riskDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {riskDistributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );
};
