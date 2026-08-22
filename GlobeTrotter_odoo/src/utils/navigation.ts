import { NavigateFunction } from 'react-router-dom';

// Navigation utility for programmatic navigation
export const createNavigationHandler = (navigate: NavigateFunction) => {
  return {
    // Main navigation
    goToDashboard: () => navigate('/dashboard'),
    goToTrips: () => navigate('/trips'),
    goToCreateTrip: () => navigate('/create-trip'),
    goToItineraryBuilder: () => navigate('/itinerary-builder'),
    goToItineraryView: () => navigate('/itinerary-view'),
    goToSharedItinerary: () => navigate('/shared-itinerary'),
    goToCitySearch: () => navigate('/city-search'),
    goToActivitySearch: () => navigate('/activity-search'),
    goToProfile: () => navigate('/profile'),
    goToAdmin: () => navigate('/admin'),
    
    // Auth navigation
    goToLogin: () => navigate('/login'),
    goToSignup: () => navigate('/signup'),
    
    // Generic navigation
    goTo: (path: string) => navigate(path),
    goBack: () => navigate(-1),
    goForward: () => navigate(1),
  };
};

// Route constants for easy reference
export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  
  // Legal pages
  TERMS: '/terms',
  PRIVACY: '/privacy',
  
  // Protected routes
  DASHBOARD: '/dashboard',
  TRIPS: '/trips',
  CREATE_TRIP: '/create-trip',
  ITINERARY_BUILDER: '/itinerary-builder',
  ITINERARY_VIEW: '/itinerary-view',
  SHARED_ITINERARY: '/shared-itinerary',
  CITY_SEARCH: '/city-search',
  ACTIVITY_SEARCH: '/activity-search',
  PROFILE: '/profile',
  
  // Admin routes
  ADMIN: '/admin',
} as const;

// Type for route names
export type RouteName = keyof typeof ROUTES;
