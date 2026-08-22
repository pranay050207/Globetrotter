import React, { useState, useEffect, useRef } from 'react';
import { Menu, User, LogOut, Settings, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, UserProfile as UserProfileType } from '../../utils/api';
import { ROUTES } from '../../utils/navigation';

interface HeaderProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
  userRole: 'user' | 'admin';
}

const Header: React.FC<HeaderProps> = ({ currentScreen, onNavigate, onLogout, userRole }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fetch user profile data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const userData = await getUserProfile();
      setUserProfile(userData);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      // Don't show error in header, just use default values
    } finally {
      setIsLoading(false);
    }
  };

  const navigationItems = [
    { key: 'home', label: 'Home', path: ROUTES.HOME, show: true },
    { key: 'dashboard', label: 'Dashboard', path: ROUTES.DASHBOARD, show: true },
    { key: 'trips', label: 'My Trips', path: ROUTES.TRIPS, show: true },
    { key: 'city-search', label: 'Explore Cities', path: ROUTES.CITY_SEARCH, show: true },
    { key: 'activity-search', label: 'Activities', path: ROUTES.ACTIVITY_SEARCH, show: true },
    { key: 'admin', label: 'Analytics', path: ROUTES.ADMIN, show: userRole === 'admin' },
  ];

  // Get user display name
  const getUserDisplayName = () => {
    if (!userProfile) return 'Profile';
    
    const nameParts = userProfile.full_name.split(' ');
    return nameParts[0] || 'Profile';
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onNavigate(path);
  };

  return (
    <header className="glass-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => handleNavigation(ROUTES.DASHBOARD)}
          >
            <img 
              src="/assests/logo.png" 
              alt="GlobeTrotter" 
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
            />
            <span className="text-lg sm:text-xl font-semibold gradient-text">
              GlobeTrotter
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center">
            <div className="glass-pill px-2 py-1 gap-1">
              {navigationItems
                .filter(item => item.show)
                .map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleNavigation(item.path)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                      currentScreen === item.key
                        ? 'bg-white/15 text-heading shadow-sm'
                        : 'text-body-muted hover:text-heading hover:bg-white/10'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
            </div>
          </nav>

          {/* Profile Dropdown */}
          <div className="relative hidden md:block" ref={profileDropdownRef}>
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center space-x-2 text-body-muted hover:text-heading transition-colors"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm overflow-hidden border border-glass-border">
                {userProfile?.avatar ? (
                  <img 
                    src={userProfile.avatar} 
                    alt={userProfile.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <span className="text-sm font-medium">
                {isLoading ? 'Loading...' : getUserDisplayName()}
              </span>
            </button>

            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 glass-card rounded-xl py-1 z-50">
                <div className="px-4 py-3 border-b border-glass-border">
                  <p className="text-sm font-medium text-heading">
                    {userProfile?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-body-muted mt-0.5">
                    {userProfile?.email || 'user@example.com'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigate(ROUTES.PROFILE);
                    setIsProfileDropdownOpen(false);
                  }}
                  className="flex items-center space-x-2 w-full px-4 py-2.5 text-sm text-body-muted hover:text-heading hover:bg-white/5 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setIsProfileDropdownOpen(false);
                  }}
                  className="flex items-center space-x-2 w-full px-4 py-2.5 text-sm text-body-muted hover:text-heading hover:bg-white/5 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-body-muted hover:text-heading hover:bg-white/10 transition-colors"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-glass-border py-4">
            {/* Mobile User Info */}
            <div className="px-4 py-3 border-b border-glass-border mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm overflow-hidden border border-glass-border">
                  {userProfile?.avatar ? (
                    <img 
                      src={userProfile.avatar} 
                      alt={userProfile.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-heading">
                    {isLoading ? 'Loading...' : (userProfile?.full_name || 'User')}
                  </p>
                  <p className="text-xs text-body-muted">
                    {userProfile?.email || 'user@example.com'}
                  </p>
                </div>
              </div>
            </div>

            {navigationItems
              .filter(item => item.show)
              .map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    handleNavigation(item.path);
                    setIsMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    currentScreen === item.key
                      ? 'text-primary-400 bg-primary-400/10'
                      : 'text-body-muted hover:text-heading hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            
            {/* Mobile Profile Actions */}
            <div className="border-t border-glass-border mt-4 pt-4">
              <button
                onClick={() => {
                  navigate(ROUTES.PROFILE);
                  setIsMenuOpen(false);
                }}
                className="flex items-center space-x-3 w-full px-4 py-3 text-sm font-medium text-body-muted hover:text-heading hover:bg-white/5 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
              <button
                onClick={() => {
                  onLogout();
                  setIsMenuOpen(false);
                }}
                className="flex items-center space-x-3 w-full px-4 py-3 text-sm font-medium text-body-muted hover:text-heading hover:bg-white/5 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
