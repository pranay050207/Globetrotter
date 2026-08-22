import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Layout/Header';
import MobileNav from './components/Layout/MobileNav';
import Footer from './components/Layout/Footer';
import PublicLayout from './components/Layout/PublicLayout';
import { useScrollToTop } from './utils/useScrollToTop';

import LoginForm from './components/Auth/LoginForm';
import SignupForm from './components/Auth/SignupForm';
import Dashboard from './components/Dashboard/Dashboard';
import TripsList from './components/Trips/TripsList';
import CreateTrip from './components/Trips/CreateTrip';
import ItineraryBuilder from './components/Trips/ItineraryBuilder';
import ItineraryView from './components/Trips/ItineraryView';
import SharedItineraryView from './components/Trips/SharedItineraryView';
import PublicSharedTrip from './components/Trips/PublicSharedTrip';
import CitySearch from './components/Search/CitySearch';
import ActivitySearch from './components/Search/ActivitySearch';

import UserProfile from './components/Profile/UserProfile';
import AdminDashboard from './components/Admin/AdminDashboard';
import TermsAndConditions from './components/Legal/TermsAndConditions';
import PrivacyPolicy from './components/Legal/PrivacyPolicy';
import HomePage from './components/Landing/HomePage';
import { authUtils } from './utils/auth';
import { ROUTES } from './utils/navigation';

// Protected Route Component
const ProtectedRoute = ({ children, userRole }: { children: React.ReactNode; userRole: 'user' | 'admin' }) => {
  const authData = authUtils.getAuth();
  if (!authData) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Admin Route Component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const authData = authUtils.getAuth();
  if (!authData || authData.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

// Layout Component for authenticated pages
const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const authData = authUtils.getAuth();
  const [userRole, setUserRole] = useState<'user' | 'admin'>(authData?.role || 'user');
  
  // Auto-scroll to top on route change and page refresh
  useScrollToTop();

  const handleLogout = () => {
    authUtils.clearAuth();
    navigate(ROUTES.LOGIN);
  };

  const handleNavigation = (path: string) => {
    // Update last screen in auth data
    if (authData) {
      authUtils.updateAuth(path);
    }
  };

  const getCurrentScreen = (pathname: string): string => {
    const pathMap: { [key: string]: string } = {
      [ROUTES.HOME]: 'home',
      [ROUTES.DASHBOARD]: 'dashboard',
      [ROUTES.TRIPS]: 'trips',
      [ROUTES.CREATE_TRIP]: 'create-trip',
      [ROUTES.ITINERARY_BUILDER]: 'itinerary-builder',
      [ROUTES.ITINERARY_VIEW]: 'itinerary-view',
      [ROUTES.SHARED_ITINERARY]: 'shared-itinerary',
      [ROUTES.CITY_SEARCH]: 'city-search',
      [ROUTES.ACTIVITY_SEARCH]: 'activity-search',
      [ROUTES.PROFILE]: 'profile',
      [ROUTES.ADMIN]: 'admin'
    };
    return pathMap[pathname] || 'dashboard';
  };

  return (
    <div className="min-h-screen bg-dark-gradient">
      <Header 
        currentScreen={getCurrentScreen(location.pathname)}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
        userRole={userRole}
      />
      
      <main className="pb-20 md:pb-0">
        {children}
      </main>

      <Footer />

      <MobileNav 
        currentScreen={getCurrentScreen(location.pathname)}
        onNavigate={handleNavigation}
        userRole={userRole}
      />
    </div>
  );
};

// Component with Router Navigation
const ItineraryBuilderWithRouter = () => {
  const navigate = useNavigate();
  
  const handleNavigate = (screen: string) => {
    navigate(screen);
  };

  return <ItineraryBuilder onNavigate={handleNavigate} />;
};

const ActivitySearchWithRouter = () => {
  const navigate = useNavigate();
  
  const handleNavigate = (screen: string) => {
    navigate(screen);
  };

  return <ActivitySearch onNavigate={handleNavigate} />;
};

// Auth Forms with Router Navigation
const LoginFormWithRouter = () => {
  const navigate = useNavigate();
  const authData = authUtils.getAuth();
  
  if (authData) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  const handleLogin = (role: 'user' | 'admin' = 'user') => {
    authUtils.saveAuth(role, 'dashboard');
    navigate(ROUTES.DASHBOARD);
  };

  return (
    <LoginForm 
      onLogin={handleLogin}
      onSwitchToSignup={() => navigate(ROUTES.SIGNUP)}
    />
  );
};

const SignupFormWithRouter = () => {
  const navigate = useNavigate();
  const authData = authUtils.getAuth();
  
  if (authData) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  const handleSignup = (role: 'user' | 'admin' = 'user') => {
    authUtils.saveAuth(role, 'dashboard');
    navigate(ROUTES.DASHBOARD);
  };

  return (
    <SignupForm 
      onSignup={handleSignup}
      onSwitchToLogin={() => navigate(ROUTES.LOGIN)}
    />
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark-base">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            <PublicLayout>
              <LoginFormWithRouter />
            </PublicLayout>
          } />
          <Route path="/signup" element={
            <PublicLayout>
              <SignupFormWithRouter />
            </PublicLayout>
          } />
          
          {/* Landing Page */}
          <Route path="/" element={<HomePage />} />
          
          {/* Legal Pages */}
          <Route path="/terms" element={
            <PublicLayout>
              <TermsAndConditions />
            </PublicLayout>
          } />
          <Route path="/privacy" element={
            <PublicLayout>
              <PrivacyPolicy />
            </PublicLayout>
          } />
          
          {/* Public Shared Trip Route - No Authentication Required */}
          <Route path="/shared-trip/:tripId" element={<PublicSharedTrip />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute userRole="user">
              <AuthenticatedLayout>
                <Dashboard onNavigate={(screen) => {}} />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />

          <Route path="/trips" element={
            <ProtectedRoute userRole="user">
              <AuthenticatedLayout>
                <TripsList onNavigate={(screen) => {}} />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />

          <Route path="/create-trip" element={
            <ProtectedRoute userRole="user">
              <AuthenticatedLayout>
                <CreateTrip onNavigate={(screen) => {}} />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />

          <Route path="/itinerary-builder" element={
            <ProtectedRoute userRole="user">
              <AuthenticatedLayout>
                <ItineraryBuilderWithRouter />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />

          <Route path="/itinerary-view" element={
            <ProtectedRoute userRole="user">
              <AuthenticatedLayout>
                <ItineraryView onNavigate={(screen) => {}} />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />

          <Route path="/shared-itinerary" element={
            <ProtectedRoute userRole="user">
              <AuthenticatedLayout>
                <SharedItineraryView onNavigate={(screen) => {}} />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />

          <Route path="/city-search" element={
            <ProtectedRoute userRole="user">
              <AuthenticatedLayout>
                <CitySearch onNavigate={(screen) => {}} />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />

          <Route path="/activity-search" element={
            <ProtectedRoute userRole="user">
              <AuthenticatedLayout>
                <ActivitySearchWithRouter />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute userRole="user">
              <AuthenticatedLayout>
                <UserProfile onNavigate={(screen) => {}} />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AuthenticatedLayout>
                <AdminDashboard onNavigate={(screen) => {}} />
              </AuthenticatedLayout>
            </AdminRoute>
          } />

          {/* Catch-all redirect for authenticated users */}
          <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
