
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NAVIGATION_LINKS } from '../constants';

const BellIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

const ArrowRightOnRectangleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
  </svg>
);

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const username = localStorage.getItem('mapss_user') || 'System Operator';

  const getPageTitle = () => {
    for (const group of NAVIGATION_LINKS) {
      const link = group.links.find(l => l.path === location.pathname);
      if (link) return link.label;
    }
    return 'Dashboard';
  };

  const handleLogout = () => {
    localStorage.removeItem('mapss_token');
    localStorage.removeItem('mapss_user');
    navigate('/login');
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b-2 border-gray-200 shadow-sm">
      <h1 className="text-2xl font-semibold text-brand-dark">{getPageTitle()}</h1>
      <div className="flex items-center">
        <button className="relative text-gray-600 hover:text-brand-primary focus:outline-none mr-4">
          <BellIcon className="h-6 w-6" />
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">3</span>
        </button>
        <div className="ml-6 flex items-center border-l border-gray-300 pl-6">
            <div className="flex flex-col items-end mr-3">
              <span className="text-sm font-medium text-gray-700">{username}</span>
              <span className="text-xs text-gray-500">Online</span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-600 transition-colors"
              title="Sign Out"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </button>
        </div>
      </div>
    </header>
  );
};
