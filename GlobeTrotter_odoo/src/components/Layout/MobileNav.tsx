import React from 'react';
import { Home, Map, Search, User, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/navigation';

interface MobileNavProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  userRole: 'user' | 'admin';
}

const MobileNav: React.FC<MobileNavProps> = ({ currentScreen, onNavigate, userRole }) => {
  const navigate = useNavigate();
  
  const navItems = [
    { key: 'dashboard', icon: Home, label: 'Home', path: ROUTES.DASHBOARD, show: true },
    { key: 'trips', icon: Map, label: 'Trips', path: ROUTES.TRIPS, show: true },
    { key: 'city-search', icon: Search, label: 'Explore', path: ROUTES.CITY_SEARCH, show: true },
    { key: 'admin', icon: BarChart3, label: 'Analytics', path: ROUTES.ADMIN, show: userRole === 'admin' },
    { key: 'profile', icon: User, label: 'Profile', path: ROUTES.PROFILE, show: userRole === 'user' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    onNavigate(path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-nav z-50">
      <div className="flex items-center justify-around py-2">
        {navItems
          .filter(item => item.show)
          .slice(0, 5)
          .map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.key;
            
            return (
              <button
                key={item.key}
                onClick={() => handleNavigation(item.path)}
                className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-colors ${
                  isActive
                    ? 'text-primary-400 bg-primary-400/10'
                    : 'text-body-muted hover:text-heading'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary-400' : 'text-body-muted'}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
      </div>
    </nav>
  );
};

export default MobileNav;
