
import React, { useState } from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { NAVIGATION_LINKS } from '../constants';
import type { NavLink } from '../types';

const NavLinkItem: React.FC<{ link: NavLink; isCollapsed: boolean }> = ({ link, isCollapsed }) => (
  <RouterNavLink
    to={link.path}
    className={({ isActive }) =>
      `flex items-center p-2 my-1 transition-colors duration-200 rounded-lg ${
        isActive ? 'bg-brand-secondary text-white' : 'text-gray-200 hover:bg-brand-primary hover:text-white'
      }`
    }
    title={isCollapsed ? link.label : undefined}
  >
    <link.icon className="h-6 w-6 flex-shrink-0" />
    {!isCollapsed && <span className="mx-4 text-sm font-normal truncate">{link.label}</span>}
  </RouterNavLink>
);

const APSSLogo: React.FC<{ collapsed: boolean }> = ({ collapsed }) => (
  <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'}`}>
    {/* Logo Icon */}
    <div className="relative flex-shrink-0 w-10 h-10">
       <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
         <defs>
           <linearGradient id="globeGrad" x1="20%" y1="0%" x2="80%" y2="100%">
             <stop offset="0%" stopColor="#0284c7" /> {/* sky-600 */}
             <stop offset="100%" stopColor="#0c4a6e" /> {/* sky-900 */}
           </linearGradient>
           <linearGradient id="swooshGrad" x1="0%" y1="100%" x2="100%" y2="0%">
             <stop offset="0%" stopColor="#ea580c" /> {/* orange-600 */}
             <stop offset="100%" stopColor="#fbbf24" /> {/* amber-400 */}
           </linearGradient>
         </defs>
         
         {/* Globe Background */}
         <circle cx="50" cy="50" r="45" fill="url(#globeGrad)" />
         
         {/* Shine/Gloss Effect */}
         <ellipse cx="50" cy="30" rx="30" ry="15" fill="white" fillOpacity="0.1" />

         {/* Swoosh (Flight Path) */}
         <path 
            d="M 15,75 Q 40,95 90,40" 
            fill="none" 
            stroke="url(#swooshGrad)" 
            strokeWidth="8" 
            strokeLinecap="round"
         />
         
         {/* Plane Icon */}
         <path 
            d="M 82,32 L 95,25 L 88,45 L 82,38 L 75,42 L 80,34 Z" 
            fill="white" 
         />
       </svg>
    </div>

    {/* Logo Text */}
    {!collapsed && (
      <div className="ml-3 flex flex-col justify-center animate-fade-in">
        <div className="flex items-baseline">
            <span className="text-2xl font-extrabold tracking-tight leading-none text-white" style={{ fontFamily: 'sans-serif' }}>
              <span className="text-brand-secondary">A</span>PSS
            </span>
        </div>
        <span className="text-[0.55rem] uppercase tracking-wider text-gray-300 leading-tight mt-0.5 font-medium">
          Advance Passenger<br/>Screening System
        </span>
      </div>
    )}
  </div>
);

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`flex flex-col bg-brand-dark text-white transition-all duration-300 h-screen ${isCollapsed ? 'w-20' : 'w-72'} shadow-xl z-20 relative`}>
      {/* Header with Logo */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0 h-20">
        <APSSLogo collapsed={isCollapsed} />
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white focus:outline-none absolute right-[-12px] top-8 bg-brand-dark border border-gray-600 shadow-sm z-50 hidden lg:flex">
          {isCollapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>

      {/* Scrollable Navigation */}
      <nav className="flex-grow px-3 py-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {NAVIGATION_LINKS.map((group) => (
          <div key={group.title} className="mb-6">
            {!isCollapsed && (
                <h3 className="px-2 mb-2 text-[10px] uppercase text-gray-500 font-bold tracking-widest">{group.title}</h3>
            )}
            {isCollapsed && <div className="h-px bg-gray-700 mx-2 mb-2"></div>}
            <div className="space-y-0.5">
                {group.links.map((link) => (
                <NavLinkItem key={link.path} link={link} isCollapsed={isCollapsed} />
                ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-gray-700 flex-shrink-0 bg-gray-900/50">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="relative">
                <img className="h-9 w-9 rounded-full object-cover border-2 border-gray-600" src="https://ui-avatars.com/api/?name=Operator&background=374151&color=fff" alt="User" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-gray-900 rounded-full"></div>
            </div>
            {!isCollapsed && (
                <div className="ml-3 overflow-hidden">
                    <p className="text-sm font-medium text-white truncate">System Operator</p>
                    <p className="text-xs text-gray-400 truncate">KUL Command Center</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
