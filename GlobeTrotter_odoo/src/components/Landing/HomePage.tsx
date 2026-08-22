import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authUtils } from '../../utils/auth';
import { ROUTES } from '../../utils/navigation';
import LandingPage from './LandingPage';
import Header from '../Layout/Header';
import Footer from '../Layout/Footer';
import MobileNav from '../Layout/MobileNav';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const authData = authUtils.getAuth();
  const isAuthenticated = !!authData;

  const handleNavigation = (path: string) => {
    if (authData) {
      authUtils.updateAuth(path);
    }
    navigate(path);
  };

  const handleLogout = () => {
    authUtils.clearAuth();
    navigate(ROUTES.LOGIN);
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
    return pathMap[pathname] || 'home';
  };

  // If user is authenticated, show authenticated layout with header
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark-gradient">
        <Header
          currentScreen={getCurrentScreen(window.location.pathname)}
          onNavigate={handleNavigation}
          onLogout={handleLogout}
          userRole={authData?.role || 'user'}
        />
        <main className="pb-20 md:pb-0">
          <LandingPage isAuthenticated={true} />
        </main>
        <Footer />
        <MobileNav
          currentScreen={getCurrentScreen(window.location.pathname)}
          onNavigate={handleNavigation}
          userRole={authData?.role || 'user'}
        />
      </div>
    );
  }

  // If user is not authenticated, show public layout
  return <LandingPage isAuthenticated={false} />;
};

export default HomePage;
