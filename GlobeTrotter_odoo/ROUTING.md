# Routing System Documentation

## Overview

The application now uses React Router v6 for client-side routing, providing a better user experience with URL-based navigation, browser history support, and easier bookmarking.

## Route Structure

### Public Routes
- `/login` - User login page
- `/signup` - User registration page

### Protected Routes (Require Authentication)
- `/dashboard` - Main dashboard
- `/trips` - User's trips list
- `/create-trip` - Create new trip
- `/itinerary-builder` - Build trip itinerary
- `/itinerary-view` - View trip itinerary
- `/shared-itinerary` - View shared itinerary
- `/city-search` - Search for cities
- `/activity-search` - Search for activities
- `/profile` - User profile management

### Admin Routes (Require Admin Role)
- `/admin` - Admin dashboard

## Key Features

### 1. Protected Routes
- Routes are protected using `ProtectedRoute` component
- Unauthenticated users are redirected to `/login`
- Admin routes have additional role-based protection

### 2. Route Constants
All routes are defined as constants in `src/utils/navigation.ts`:
```typescript
export const ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  TRIPS: '/trips',
  // ... etc
};
```

### 3. Navigation Utilities
The `createNavigationHandler` function provides convenient navigation methods:
```typescript
const nav = createNavigationHandler(navigate);
nav.goToDashboard(); // Navigate to dashboard
nav.goToTrips();     // Navigate to trips
nav.goBack();        // Go back in history
```

### 4. URL-Based Navigation
- Users can bookmark any page
- Browser back/forward buttons work correctly
- Direct URL access is supported
- Current page is reflected in the URL

## Usage Examples

### Programmatic Navigation
```typescript
import { useNavigate } from 'react-router-dom';
import { createNavigationHandler, ROUTES } from '../utils/navigation';

const MyComponent = () => {
  const navigate = useNavigate();
  const nav = createNavigationHandler(navigate);

  const handleClick = () => {
    nav.goToTrips(); // Navigate to trips page
  };

  return <button onClick={handleClick}>Go to Trips</button>;
};
```

### Link Navigation
```typescript
import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/navigation';

const MyComponent = () => {
  return (
    <Link to={ROUTES.TRIPS}>
      Go to Trips
    </Link>
  );
};
```

### Route Parameters
For routes with parameters (future enhancement):
```typescript
// In route definition
<Route path="/trip/:id" element={<TripDetail />} />

// In component
import { useParams } from 'react-router-dom';

const TripDetail = () => {
  const { id } = useParams();
  // Use trip ID
};
```

## Benefits

1. **Better UX**: Users can bookmark pages and use browser navigation
2. **SEO Friendly**: Each route has a unique URL
3. **Maintainable**: Centralized route definitions
4. **Type Safe**: TypeScript support for route names
5. **Scalable**: Easy to add new routes and nested routing

## Migration Notes

The application was migrated from a state-based navigation system to React Router. Key changes:

1. Replaced `currentScreen` state with URL-based routing
2. Updated navigation functions to use React Router's `navigate`
3. Added route protection for authenticated pages
4. Centralized route definitions for consistency

## Future Enhancements

1. **Nested Routes**: For complex page layouts
2. **Route Parameters**: For dynamic content (e.g., `/trip/123`)
3. **Query Parameters**: For search and filtering
4. **Lazy Loading**: Code splitting for better performance
5. **Route Guards**: More sophisticated access control
