import React from 'react';
import { Card } from './Card';

interface DetailSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const DetailSection: React.FC<DetailSectionProps> = ({ title, children, className = '' }) => (
  <Card title={title} className={`bg-gray-50 mb-6 shadow-sm ${className}`}>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
      {children}
    </div>
  </Card>
);

interface DetailItemProps {
    label: string;
    value?: React.ReactNode;
}

export const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => (
    <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-lg text-gray-800">{value || 'N/A'}</p>
    </div>
);