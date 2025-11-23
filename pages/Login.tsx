
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Reusing the Logo SVG logic but sized for the login screen
const BigLogo: React.FC = () => (
  <div className="relative w-32 h-32 mb-4">
       <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl filter">
         <defs>
           <linearGradient id="globeGradLogin" x1="20%" y1="0%" x2="80%" y2="100%">
             <stop offset="0%" stopColor="#0284c7" />
             <stop offset="100%" stopColor="#0c4a6e" />
           </linearGradient>
           <linearGradient id="swooshGradLogin" x1="0%" y1="100%" x2="100%" y2="0%">
             <stop offset="0%" stopColor="#ea580c" />
             <stop offset="100%" stopColor="#fbbf24" />
           </linearGradient>
         </defs>
         <circle cx="50" cy="50" r="45" fill="url(#globeGradLogin)" />
         <ellipse cx="50" cy="30" rx="30" ry="15" fill="white" fillOpacity="0.1" />
         <path 
            d="M 15,75 Q 40,95 90,40" 
            fill="none" 
            stroke="url(#swooshGradLogin)" 
            strokeWidth="8" 
            strokeLinecap="round"
         />
         <path 
            d="M 82,32 L 95,25 L 88,45 L 82,38 L 75,42 L 80,34 Z" 
            fill="white" 
         />
       </svg>
  </div>
);

export const DEMO_USERS = [
  { id: 'sysadmin', name: 'System Admin', role: 'System Administrator', color: 'bg-slate-600' },
  { id: 'analyst.jane', name: 'Analyst Jane', role: 'Security Analyst', color: 'bg-blue-600' },
  { id: 'officer.tan', name: 'Officer Tan', role: 'Contact Center Officer', color: 'bg-indigo-600' },
  { id: 'officer.alert', name: 'Alert Team', role: 'Alerts Officer', color: 'bg-red-600' },
  { id: 'admin.watchlist', name: 'Director Lee', role: 'Watch List Admin', color: 'bg-amber-600' },
  { id: 'auditor.ext', name: 'Ext. Auditor', role: 'Auditor', color: 'bg-green-600' },
];

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const performLogin = async (user: string) => {
      setError('');
      setIsLoading(true);

      // Simulate API Latency
      await new Promise(resolve => setTimeout(resolve, 800));

      localStorage.setItem('mapss_token', 'mock_secure_token_' + Date.now());
      localStorage.setItem('mapss_user', user);
      navigate(from, { replace: true });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      await performLogin(username);
    } else {
      setError('Please enter both username and password.');
    }
  };

  const handleDemoLogin = (demoUser: typeof DEMO_USERS[0]) => {
      setUsername(demoUser.id);
      setPassword('password'); // Dummy visual fill
      performLogin(demoUser.id);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row w-full max-w-4xl overflow-hidden z-10 mx-4">
        
        {/* Left Side - Brand */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-slate-800 to-slate-900 p-12 flex flex-col items-center justify-center text-center text-white relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <BigLogo />
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">M-APSS</h1>
            <p className="text-blue-200 font-medium text-lg uppercase tracking-widest">Advance Passenger<br/>Screening System</p>
            <div className="mt-8 space-y-2 text-sm text-slate-400">
                <p>Secure Border Control</p>
                <p>Real-time Intelligence</p>
                <p>National Security</p>
            </div>
            <p className="absolute bottom-4 text-[10px] text-slate-600">Official Government System • Restricted Access</p>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-white flex flex-col justify-center overflow-y-auto max-h-screen">
          <div className="text-center md:text-left mb-6">
            <h2 className="text-2xl font-bold text-slate-800">System Login</h2>
            <p className="text-slate-500 text-sm mt-1">Please authenticate to access the command center.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">Username / ID</label>
              <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    placeholder="Enter your ID"
                    autoFocus
                  />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    placeholder="••••••••"
                  />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center animate-pulse">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   Authenticating...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
            
            <div className="text-center mt-2">
                <a href="#" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">Forgot credentials?</a>
            </div>
          </form>

          {/* Demo Quick Access Section */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">Demo Access Profiles</p>
            <div className="grid grid-cols-2 gap-2">
                {DEMO_USERS.map(u => (
                    <button
                        key={u.id}
                        onClick={() => handleDemoLogin(u)}
                        disabled={isLoading}
                        className="text-left p-2 rounded border bg-slate-50 hover:bg-blue-50 hover:border-blue-200 transition-all flex items-center group disabled:opacity-50"
                    >
                        <div className={`w-2 h-2 rounded-full mr-2 ${u.color} group-hover:scale-110 transition-transform`}></div>
                        <div className="overflow-hidden">
                            <div className="font-bold text-xs text-slate-700 truncate">{u.name}</div>
                            <div className="text-[10px] text-slate-500 truncate">{u.role}</div>
                        </div>
                    </button>
                ))}
            </div>
          </div>

        </div>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-4 text-center w-full text-slate-500 text-xs z-10">
        &copy; {new Date().getFullYear()} Tasstech (Malaysia) Sdn Bhd. All rights reserved. <br/> Unauthorized access is a criminal offense under the Computer Crimes Act 1997.
      </div>
    </div>
  );
};
