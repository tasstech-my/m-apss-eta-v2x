import React, { useMemo } from 'react';
import { Card } from './Card';
import { mockFlights } from './InteractiveFlightMap';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface StatisticalPanelsProps {
  selectedDate: string;
}

// Mapping from airport IATA to country code
const airportCountryMap: Record<string, string> = {
  CGK: 'IDN', SIN: 'SGP', KUL: 'MYS', BKK: 'THA', HKG: 'HKG',
  NRT: 'JPN', SYD: 'AUS', DXB: 'ARE', IST: 'TUR', AMS: 'NLD',
  LHR: 'GBR', JFK: 'USA', LAX: 'USA', PER: 'AUS'
};

const COLORS = ['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#eff6ff', '#f0f9ff', '#e0f2fe', '#c7e9fe'];
const OTHERS_COLOR = '#9ca3af'; // gray-400

// Helper function to process data into Top 10 + Others
const processTop10Data = (data: Record<string, number>) => {
  const sortedData = Object.entries(data)
    .sort(([, a], [, b]) => b - a);

  const top10 = sortedData.slice(0, 10);
  const othersCount = sortedData.slice(10).reduce((acc, [, count]) => acc + count, 0);

  const chartData = top10.map(([name, value]) => ({ name, value }));
  if (othersCount > 0) {
    chartData.push({ name: 'Others', value: othersCount });
  }
  
  const total = sortedData.reduce((acc, [, count]) => acc + count, 0);

  return { chartData, total };
};

// Sub-component for a single stat panel
const StatPanel: React.FC<{ title: string; data: { name: string; value: number }[]; total: number }> = ({ title, data, total }) => {
  if (total === 0) {
    return (
      <Card title={title}>
        <div className="flex items-center justify-center h-full min-h-[200px] text-gray-500">
          <p>No data for selected date.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title={title}>
      <div className="grid grid-cols-2 gap-4 items-center min-h-[200px]">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.name === 'Others' ? OTHERS_COLOR : COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${((value / total) * 100).toFixed(1)}% (${value.toLocaleString()})`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="overflow-y-auto max-h-48 text-sm">
          <ul className="space-y-1 pr-2">
            {data.map((entry, index) => (
              <li key={entry.name} className="flex justify-between items-center">
                <div className="flex items-center truncate">
                  <div className="w-3 h-3 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: entry.name === 'Others' ? OTHERS_COLOR : COLORS[index % COLORS.length] }}></div>
                  <span className="truncate" title={entry.name}>{entry.name}</span>
                </div>
                <span className="font-semibold flex-shrink-0 ml-2">{((entry.value / total) * 100).toFixed(1)}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
};


export const StatisticalPanels: React.FC<StatisticalPanelsProps> = ({ selectedDate }) => {
  const dataForDate = useMemo(() => {
    const flights = mockFlights.filter(f => f.date === selectedDate);
    const inboundFlights = flights.filter(f => f.destination === 'CGK');
    const outboundFlights = flights.filter(f => f.origin === 'CGK');

    // Inbound - Country of Embarkation
    const inboundEmbarkation: Record<string, number> = {};
    inboundFlights.forEach(f => {
      const country = airportCountryMap[f.origin] || 'Unknown';
      inboundEmbarkation[country] = (inboundEmbarkation[country] || 0) + f.passengers.length;
    });

    // Inbound - Traveller Nationality
    const inboundNationality: Record<string, number> = {};
    inboundFlights.forEach(f => {
      f.passengers.forEach(p => {
        inboundNationality[p.nationality] = (inboundNationality[p.nationality] || 0) + 1;
      });
    });

    // Outbound - Traveller Nationality
    const outboundNationality: Record<string, number> = {};
    outboundFlights.forEach(f => {
      f.passengers.forEach(p => {
        outboundNationality[p.nationality] = (outboundNationality[p.nationality] || 0) + 1;
      });
    });

    // Outbound - Country of Disembarkation
    const outboundDisembarkation: Record<string, number> = {};
    outboundFlights.forEach(f => {
      const country = airportCountryMap[f.destination] || 'Unknown';
      outboundDisembarkation[country] = (outboundDisembarkation[country] || 0) + f.passengers.length;
    });

    return {
      inboundEmbarkation: processTop10Data(inboundEmbarkation),
      inboundNationality: processTop10Data(inboundNationality),
      outboundNationality: processTop10Data(outboundNationality),
      outboundDisembarkation: processTop10Data(outboundDisembarkation),
    };
  }, [selectedDate]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <StatPanel title="Inbound - Top 10 Country of Embarkation" data={dataForDate.inboundEmbarkation.chartData} total={dataForDate.inboundEmbarkation.total} />
      <StatPanel title="Inbound - Top 10 Traveller Nationality" data={dataForDate.inboundNationality.chartData} total={dataForDate.inboundNationality.total} />
      <StatPanel title="Outbound - Top 10 Country of Disembarkation" data={dataForDate.outboundDisembarkation.chartData} total={dataForDate.outboundDisembarkation.total} />
      <StatPanel title="Outbound - Top 10 Traveller Nationality" data={dataForDate.outboundNationality.chartData} total={dataForDate.outboundNationality.total} />
    </div>
  );
};
