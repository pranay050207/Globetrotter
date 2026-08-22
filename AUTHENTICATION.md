# Authentication System

## Overview
The GlobeTrotter application now implements persistent authentication using localStorage to prevent users from being logged out after page refreshes.

## Features

### Persistent Sessions
- User authentication state is stored in localStorage
- Sessions persist across browser refreshes and tab closures
- Automatic session restoration on app startup

### Session Management
- **Session Duration**: 24 hours from last activity
- **Auto-refresh**: Session timestamp is updated on user navigation
- **Automatic cleanup**: Expired sessions are automatically removed

### Security Features
- Session expiration after 24 hours of inactivity
- Automatic cleanup of corrupted or invalid session data
- Secure storage using localStorage with JSON serialization

## Implementation Details

### Auth Utility (`src/utils/auth.ts`)
The authentication system is centralized in a utility module that provides:

- `saveAuth(role, lastScreen)`: Save authentication data
- `getAuth()`: Retrieve and validate authentication data
- `updateAuth(lastScreen)`: Update last screen and refresh timestamp
- `clearAuth()`: Remove authentication data
- `isAuthenticated()`: Check if user is currently authenticated

### App Component Integration
The main App component (`src/App.tsx`) integrates with the auth utility:

1. **Startup Check**: On app initialization, checks for existing authentication
2. **Login Handler**: Saves authentication data when user logs in
3. **Logout Handler**: Clears authentication data when user logs out
4. **Navigation Handler**: Updates session timestamp on user activity

## Usage

### For Users
- Login once and stay logged in across browser sessions
- Sessions automatically expire after 24 hours of inactivity
- Last visited screen is remembered and restored

### For Developers
The authentication system is transparent to other components. Simply use the existing `onLogin`, `onLogout`, and `onNavigate` props as before.

## Technical Notes

### Storage Format
```json
{
  "role": "user" | "admin",
  "lastScreen": "dashboard" | "trips" | "profile" | ...,
  "timestamp": 1234567890123
}
```

### Error Handling
- Invalid JSON data is automatically cleaned up
- Expired sessions are removed on detection
- Graceful fallback to login screen on errors

### Browser Compatibility
- Uses standard localStorage API
- Compatible with all modern browsers
- No external dependencies required
