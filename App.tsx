
import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login, DEMO_USERS } from './pages/Login'; // Import Login Page & Demo Users for types
import { ASOCDashboard } from './pages/ASOCDashboard';
import { RiskAnalyticsDashboard } from './pages/RiskAnalyticsDashboard';
import { DataIngestionDashboard } from './pages/DataIngestionDashboard';
import { XAIAuditDashboard } from './pages/XAIAuditDashboard';
import { APIGatewayDashboard } from './pages/APIGatewayDashboard';
import { PNRGatewayDashboard } from './pages/PNRGatewayDashboard';
import { TravelerModuleDashboard } from './pages/TravelerModuleDashboard';
import { IndividualTravelerRecordView } from './pages/IndividualTravelerRecordView';
import { GovernmentGatewayDashboard } from './pages/GovernmentGatewayDashboard';
import { CarrierPortalDashboard } from './pages/CarrierPortalDashboard';
import { ApplicationProcessorDashboard } from './pages/ApplicationProcessorDashboard';
import { BorderOperationsCenterDashboard } from './pages/BorderOperationsCenterDashboard';
import { DataAcquisitionDashboard } from './pages/DataAcquisitionDashboard';
import { TravelerDatabaseDashboard } from './pages/TravelerDatabaseDashboard';
import { UserManagementDashboard } from './pages/UserManagementDashboard';
import { AdvancedSearchDashboard } from './pages/AdvancedSearchDashboard';
import { RiskManagerDashboard } from './pages/RiskManagerDashboard';
import { RiskBrokerDashboard } from './pages/RiskBrokerDashboard';
import { WatchListManagerDashboard } from './pages/WatchListManagerDashboard';
import { IdentityResolutionDashboard } from './pages/IdentityResolutionDashboard';
import { ProfilerDashboard } from './pages/ProfilerDashboard';
import { CaseManagementDashboard } from './pages/CaseManagementDashboard';
import { LinkAnalysisDashboard } from './pages/LinkAnalysisDashboard';
import { FlightStatusDashboard } from './pages/FlightStatusDashboard';
import { SecondaryScreeningDashboard } from './pages/SecondaryScreeningDashboard';
import { BiometricCorridorDashboard } from './pages/BiometricCorridorDashboard';
import { PatternAnalysisDashboard } from './pages/PatternAnalysisDashboard';
import { OverstayTrackingDashboard } from './pages/OverstayTrackingDashboard';
import { ReportingDashboard } from './pages/ReportingDashboard';
import { BoardingRulesDashboard } from './pages/BoardingRulesDashboard';
import { AuditLogsDashboard } from './pages/AuditLogsDashboard';
import { SystemHealthDashboard } from './pages/SystemHealthDashboard';
import { SystemConfigurationDashboard } from './pages/SystemConfigurationDashboard';
import { ETADashboard } from './pages/ETADashboard';
import { ETATravelerPortal } from './pages/ETATravelerPortal';
import { FlightRadarDashboard } from './pages/FlightRadarDashboard';

// Define Role Constants for clarity (matching login.tsx)
const ROLE_SYS_ADMIN = 'System Administrator';
const ROLE_SEC_ANALYST = 'Security Analyst';
const ROLE_CTC_OFFICER = 'Contact Center Officer'; // BOC
const ROLE_ALERTS_OFFICER = 'Alerts Officer';
const ROLE_WATCHLIST_ADMIN = 'Watch List Admin';
const ROLE_AUDITOR = 'Auditor';

// Route Permission Mapping
// Key: URL path prefix, Value: Array of allowed roles
// If a path is not listed, it defaults to accessible by all authenticated users (or restricted - policy choice)
// For this implementation, we assume unlisted paths are open to all authenticated users unless specified.
const ROUTE_PERMISSIONS: Record<string, string[]> = {
    // Command & Control
    '/command-control/asoc': [ROLE_SYS_ADMIN, ROLE_SEC_ANALYST, ROLE_ALERTS_OFFICER],
    '/command-control/xai-audit': [ROLE_SYS_ADMIN, ROLE_AUDITOR],
    '/command-control/flight-status': [ROLE_SYS_ADMIN, ROLE_SEC_ANALYST, ROLE_ALERTS_OFFICER],
    '/command-control/flight-radar': [ROLE_SYS_ADMIN, ROLE_SEC_ANALYST, ROLE_ALERTS_OFFICER],

    // Pre-Travel Intelligence
    '/data-intelligence/advanced-search': [ROLE_SYS_ADMIN, ROLE_SEC_ANALYST, ROLE_CTC_OFFICER],
    '/data-intelligence/link-analysis': [ROLE_SYS_ADMIN, ROLE_SEC_ANALYST],
    '/data-intelligence/case-management': [ROLE_SYS_ADMIN, ROLE_SEC_ANALYST],
    '/data-intelligence/traveler-module': [ROLE_SYS_ADMIN, ROLE_SEC_ANALYST, ROLE_CTC_OFFICER], // Traveler 360
    '/data-intelligence/traveler': [ROLE_SYS_ADMIN, ROLE_SEC_ANALYST, ROLE_CTC_OFFICER], // Detail view
    '/data-intelligence/risk-analytics': [ROLE_SYS_ADMIN, ROLE_SEC_ANALYST],
    '/data-intelligence/risk-manager': [ROLE_SYS_ADMIN, ROLE_SEC_ANALYST], // Alerts & Referrals
    '/data-intelligence/risk-broker': [ROLE_SYS_ADMIN, ROLE_SEC_ANALYST],
    '/data-intelligence/profiler': [ROLE_SYS_ADMIN, ROLE_SEC_ANALYST],
    '/data-intelligence/watchlist-manager': [ROLE_SYS_ADMIN, ROLE_WATCHLIST_ADMIN],
    '/data-intelligence/identity-resolution': [ROLE_SYS_ADMIN, ROLE_SEC_ANALYST],
    '/data-intelligence/das': [ROLE_SYS_ADMIN, ROLE_SEC_ANALYST],
    '/data-intelligence/data-ingestion': [ROLE_SYS_ADMIN],
    '/data-intelligence/traveler-database': [ROLE_SYS_ADMIN, ROLE_AUDITOR], // DB Admin/Audit
    '/data-intelligence/api-gateway': [ROLE_SYS_ADMIN, ROLE_SEC_ANALYST],
    '/data-intelligence/pnr-gateway': [ROLE_SYS_ADMIN, ROLE_SEC_ANALYST],
    '/data-intelligence/government-gateway': [ROLE_SYS_ADMIN],
    '/data-intelligence/carrier-portal': [ROLE_SYS_ADMIN], // Admin view of portal
    '/data-intelligence/eta': [ROLE_SYS_ADMIN, ROLE_SEC_ANALYST], // Admin view of ETA
    '/data-intelligence/eta-portal': [], // Public access (handled separately or allowed for all)

    // At-Airport Screening
    '/at-airport/application-processor': [ROLE_SYS_ADMIN, ROLE_SEC_ANALYST],
    '/at-airport/boc': [ROLE_SYS_ADMIN, ROLE_CTC_OFFICER],
    '/at-airport/secondary-screening': [ROLE_SYS_ADMIN, ROLE_ALERTS_OFFICER],
    '/at-airport/biometric-corridor': [ROLE_SYS_ADMIN, ROLE_ALERTS_OFFICER],

    // Post-Travel Intelligence
    '/post-travel/pattern-analysis': [ROLE_SYS_ADMIN, ROLE_SEC_ANALYST],
    '/post-travel/overstay-tracking': [ROLE_SYS_ADMIN, ROLE_SEC_ANALYST, ROLE_ALERTS_OFFICER],
    '/post-travel/reporting': [ROLE_SYS_ADMIN, ROLE_SEC_ANALYST, ROLE_AUDITOR], // Exec dashboard

    // System Administration
    '/admin/boarding-rules': [ROLE_SYS_ADMIN, ROLE_SEC_ANALYST], // Policy management
    '/admin/user-management': [ROLE_SYS_ADMIN],
    '/admin/system-health': [ROLE_SYS_ADMIN],
    '/admin/audit-logs': [ROLE_SYS_ADMIN, ROLE_AUDITOR],
    '/admin/configuration': [ROLE_SYS_ADMIN],
};

const getUserRole = (): string => {
    // In a real app, this would be decoded from a JWT or fetched from user profile state
    // Here we rely on the demo logic in Login.tsx storing 'mapss_user' ID.
    // We need to map the ID back to the Role Name.
    const userId = localStorage.getItem('mapss_user');
    const user = DEMO_USERS.find(u => u.id === userId);
    return user ? user.role : ''; 
};

// Authentication & Authorization Helper
const RequireAuth = ({ children }: { children: React.JSX.Element }) => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('mapss_token');
  const userRole = getUserRole();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check RBAC
  // Find the matching permission rule. We check if the current path STARTS with the rule key.
  // This allows '/data-intelligence/traveler' rule to cover '/data-intelligence/traveler/123'
  const path = location.pathname;
  const matchingPermissionKey = Object.keys(ROUTE_PERMISSIONS).find(key => path.startsWith(key));

  if (matchingPermissionKey) {
      const allowedRoles = ROUTE_PERMISSIONS[matchingPermissionKey];
      // If array is empty, it implies public/all-auth access (like ETA portal) or misconfiguration
      // If array has roles, check if user has one
      if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
          // Access Denied - Redirect to a safe default or show unauthorized page
          // For simplicity, redirecting to root which redirects to default dashboard (if allowed) or login
          // Ideally, we'd have a dedicated /unauthorized page
          console.warn(`Access Denied: Role '${userRole}' not allowed for '${path}'`);
          return (
            <div className="flex h-screen items-center justify-center bg-gray-100">
                <div className="p-8 bg-white rounded-lg shadow-lg text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
                    <p className="text-gray-600 mb-4">Your role <strong>{userRole}</strong> does not have permission to view this module.</p>
                    <button onClick={() => window.history.back()} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Go Back</button>
                </div>
            </div>
          );
      }
  }

  return children;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route element={<RequireAuth><Layout /></RequireAuth>}>
          <Route path="/" element={<Navigate to="/command-control/asoc" replace />} />
          <Route path="/command-control/asoc" element={<ASOCDashboard />} />
          <Route path="/command-control/xai-audit" element={<XAIAuditDashboard />} />
          <Route path="/command-control/flight-status" element={<FlightStatusDashboard />} />
          <Route path="/command-control/flight-radar" element={<FlightRadarDashboard />} />
          
          {/* Pre-Travel Intelligence */}
          <Route path="/data-intelligence/advanced-search" element={<AdvancedSearchDashboard />} />
          <Route path="/data-intelligence/link-analysis" element={<LinkAnalysisDashboard />} />
          <Route path="/data-intelligence/case-management" element={<CaseManagementDashboard />} />
          <Route path="/data-intelligence/traveler-module" element={<TravelerModuleDashboard />} />
          <Route path="/data-intelligence/traveler/:puid" element={<IndividualTravelerRecordView />} />
          <Route path="/data-intelligence/risk-analytics" element={<RiskAnalyticsDashboard />} />
          <Route path="/data-intelligence/risk-manager" element={<RiskManagerDashboard />} />
          <Route path="/data-intelligence/risk-broker" element={<RiskBrokerDashboard />} />
          <Route path="/data-intelligence/profiler" element={<ProfilerDashboard />} />
          <Route path="/data-intelligence/watchlist-manager" element={<WatchListManagerDashboard />} />
          <Route path="/data-intelligence/identity-resolution" element={<IdentityResolutionDashboard />} />
          <Route path="/data-intelligence/das" element={<DataAcquisitionDashboard />} />
          <Route path="/data-intelligence/data-ingestion" element={<DataIngestionDashboard />} />
          <Route path="/data-intelligence/traveler-database" element={<TravelerDatabaseDashboard />} />
          <Route path="/data-intelligence/api-gateway" element={<APIGatewayDashboard />} />
          <Route path="/data-intelligence/pnr-gateway" element={<PNRGatewayDashboard />} />
          <Route path="/data-intelligence/government-gateway" element={<GovernmentGatewayDashboard />} />
          <Route path="/data-intelligence/carrier-portal" element={<CarrierPortalDashboard />} />
          <Route path="/data-intelligence/eta" element={<ETADashboard />} />
          <Route path="/data-intelligence/eta-portal" element={<ETATravelerPortal />} />

          {/* At-Airport Screening */}
          <Route path="/at-airport/application-processor" element={<ApplicationProcessorDashboard />} />
          <Route path="/at-airport/boc" element={<BorderOperationsCenterDashboard />} />
          <Route path="/at-airport/secondary-screening" element={<SecondaryScreeningDashboard />} />
          <Route path="/at-airport/biometric-corridor" element={<BiometricCorridorDashboard />} />
          
          {/* Post-Travel Intelligence */}
          <Route path="/post-travel/pattern-analysis" element={<PatternAnalysisDashboard />} />
          <Route path="/post-travel/overstay-tracking" element={<OverstayTrackingDashboard />} />
          <Route path="/post-travel/reporting" element={<ReportingDashboard />} />
          
          {/* Admin */}
          <Route path="/admin/boarding-rules" element={<BoardingRulesDashboard />} />
          <Route path="/admin/user-management" element={<UserManagementDashboard />} />
          <Route path="/admin/system-health" element={<SystemHealthDashboard />} />
          <Route path="/admin/audit-logs" element={<AuditLogsDashboard />} />
          <Route path="/admin/configuration" element={<SystemConfigurationDashboard />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
