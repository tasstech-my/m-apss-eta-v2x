import React from 'react';

// Fix: Use Omit to prevent collision between custom `title` prop (React.ReactNode) and standard HTML `title` attribute (string).
interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

export const Card: React.FC<CardProps> = ({ title, children, className = '', titleClassName = '', ...rest }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`} {...rest}>
      {title && <h3 className={`text-xl font-semibold text-brand-dark mb-4 ${titleClassName}`}>{title}</h3>}
      {children}
    </div>
  );
};