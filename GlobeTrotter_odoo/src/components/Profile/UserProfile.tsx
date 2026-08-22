import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Globe, Bell, Shield, CreditCard, MapPin, Calendar, Save, Edit, Trash2, Star, TrendingUp, Thermometer } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';
import ChangePasswordModal from './ChangePasswordModal';
import { getUserProfile, updateUserProfile, UserProfile as UserProfileType, getTrips, Trip, deleteUserAccount, clearAccessToken } from '../../utils/api';
import { ROUTES } from '../../utils/navigation';
import CurrencyConverter from '../CurrencyConverter';

interface UserProfileProps {
  onNavigate: (screen: any) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onNavigate }) => {

  const [activeSection, setActiveSection] = useState('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [is2FAModalOpen, set2FAModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    language: 'en',
    publicProfile: false,
    twoFactorAuth: false,
    profilePictureUrl: ''
  });

  const [userTrips, setUserTrips] = useState<Trip[]>([]);

  const [isLoadingDestinations, setIsLoadingDestinations] = useState(false);

  // Calculate travel stats from actual user trips (same as TripsList)
  const calculateTravelStats = () => {
    if (userTrips.length === 0) {
      return {
        totalTrips: 0,
        totalCities: 0,
        totalCountries: 0,
        totalDays: 0,
        publicTrips: 0,
        totalBudget: 0
      };
    }

    // Calculate unique cities and countries
    const cities = new Set<string>();
    const countries = new Set<string>();
    let totalDays = 0;
    let totalBudget = 0;
    let publicTrips = 0;

    userTrips.forEach(trip => {
      // Extract city and country from destinations
      if (trip.destinations) {
        const parts = trip.destinations.split(', ');
        if (parts.length >= 2) {
          cities.add(parts[0].trim());
          countries.add(parts[1].trim());
        }
      }

      // Calculate trip duration
      if (trip.start_date && trip.end_date) {
        const start = new Date(trip.start_date);
        const end = new Date(trip.end_date);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        totalDays += diffDays;
      }

      // Sum budget
      if (trip.estimated_budget) {
        totalBudget += trip.estimated_budget;
      }

      // Count public trips
      if (trip.is_public) {
        publicTrips++;
      }
    });

    return {
      totalTrips: userTrips.length,
      totalCities: cities.size,
      totalCountries: countries.size,
      totalDays: totalDays,
      publicTrips: publicTrips,
      totalBudget: totalBudget
    };
  };

  // Fetch user profile data and trips on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  // Clear success messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Function to refresh data (same as TripsList)
  const refreshData = () => {
    fetchUserData();
  };

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      // Fetch profile and user trips in parallel
      const [userData, tripsData] = await Promise.all([
        getUserProfile(),
        getTrips() // Get actual user trips using the same function as TripsList
      ]);
      
      console.log('UserProfile: Fetched trips data:', tripsData); // Debug log
      
      // Set profile data
      const nameParts = userData.full_name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      setProfileData({
        firstName,
        lastName,
        email: userData.email,
        phone: userData.phone || '',
        bio: userData.bio || '',
        location: userData.location || '',
        timezone: userData.timezone || 'Asia/Kolkata',
        currency: userData.currency || 'INR',
        language: userData.language || 'en',
        publicProfile: userData.public_profile || false,
        twoFactorAuth: userData.two_factor_auth || false,
        profilePictureUrl: userData.avatar || ''
      });

      // Set user trips (same as TripsList)
      setUserTrips(tripsData);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user data';
      setError(errorMessage);
      console.error('Error fetching user data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();
      
      await updateUserProfile({
        full_name: fullName,
        phone: profileData.phone,
        bio: profileData.bio,
        location: profileData.location,
        timezone: profileData.timezone,
        currency: profileData.currency,
        language: profileData.language,
        public_profile: profileData.publicProfile,
        two_factor_auth: profileData.twoFactorAuth
      });
      
      setSuccessMessage('Profile updated successfully!');
      console.log('Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  //handles the input
  const handleInputChange = (field: string, value: string | boolean) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  }

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setIsSaving(true);
        setError(null);
        setSuccessMessage(null);
        
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('avatar', file);
        
        // Update profile with avatar
        const updatedProfile = await updateUserProfile({ avatar: file });
        
        // Update the profile picture URL with the response from server
        if (updatedProfile.avatar) {
          handleInputChange('profilePictureUrl', updatedProfile.avatar);
        }
        
        setSuccessMessage('Profile picture updated successfully!');
        console.log('Profile picture updated successfully');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update profile picture');
        console.error('Error updating profile picture:', err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleDeleteProfilePicture = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      // Use the remove_avatar parameter to delete avatar
      const updatedProfile = await updateUserProfile({ remove_avatar: true });
      
      // Update the profile picture URL
      handleInputChange('profilePictureUrl', updatedProfile.avatar || '');
      
      setSuccessMessage('Profile picture removed successfully!');
      console.log('Profile picture removed successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove profile picture');
      console.error('Error removing profile picture:', err);
    } finally {
      setIsSaving(false);
    }
  };



  const handleDeleteProfile = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      await deleteUserAccount();
      console.log('Account deleted successfully');
      
      // Clear all user data from localStorage
      localStorage.removeItem('globeTrotterToken');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('currentTrip');
      clearAccessToken(); // Clear the access token
      
      // Close the modal
      setDeleteModalOpen(false);
      
      // Navigate back to the login screen
      navigate(ROUTES.LOGIN);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      console.error('Error deleting account:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = (currentPassword: string, newPassword: string) => {
    // In a real-world application, you would make an API call to your backend here
    // to verify the current password and update it to the new one.
    console.log('Password change requested.');
    console.log('Current Password:', currentPassword); // For demo; don't log in production
    console.log('New Password:', newPassword); // For demo; don't log in production
    setChangePasswordModalOpen(false);
  };

  const handleToggleTwoFactorAuth = () => {
    // In a real app, enabling 2FA would involve more steps like QR code scanning and verification.
    // Disabling would also require confirmation, possibly with a password.
    console.log('Toggling Two-Factor Authentication status.');
    handleInputChange('twoFactorAuth', !profileData.twoFactorAuth);
    set2FAModalOpen(false);
  };

  const handleExploreDestinations = () => {
    navigate(ROUTES.CITY_SEARCH);
  };



  const travelStatsDisplay = [
    { label: 'Countries Visited', value: calculateTravelStats().totalCountries.toString(), icon: Globe },
    { label: 'Cities Explored', value: calculateTravelStats().totalCities.toString(), icon: MapPin },
    { label: 'Total Trips', value: calculateTravelStats().totalTrips.toString(), icon: Calendar },
    { label: 'Days Traveling', value: calculateTravelStats().totalDays.toString(), icon: User }
  ];

  const menuItems = [
    { key: 'profile', label: 'Profile Information', icon: User },
    { key: 'preferences', label: 'Travel Preferences', icon: Settings },
    { key: 'privacy', label: 'Privacy & Security', icon: Shield }
  ];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-body-muted">Loading profile data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-heading mb-2">Profile & Settings</h1>
        <p className="text-body-muted">Manage your account and travel preferences</p>
        {error && (
          <div className="mt-4 p-4 bg-error-500/10 border border-error-500/30 rounded-lg">
            <p className="text-error-400">{error}</p>
          </div>
        )}
        {successMessage && (
          <div className="mt-4 p-4 bg-success-500/10 border border-success-500/30 rounded-lg">
            <p className="text-success-400">{successMessage}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-xl shadow-sm border border-glass-border p-6">
            {/* Profile Summary */}
            <div className="text-center mb-6 pb-6 border-b border-glass-border">
              <div className="relative group w-20 h-20 rounded-full mx-auto mb-3">
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-white shadow-md">
                  {profileData.profilePictureUrl ? (
                    <img
                      src={profileData.profilePictureUrl}
                      alt={`${profileData.firstName} ${profileData.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center">
                      <User className="w-10 h-10 text-white" />
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-white hover:text-blue-300 p-1 rounded-full bg-black bg-opacity-50"
                    title="Change picture"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  {profileData.profilePictureUrl && (
                    <button
                      onClick={handleDeleteProfilePicture}
                      className="text-white hover:text-red-400 p-1 rounded-full bg-black bg-opacity-50"
                      title="Remove picture"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleProfilePictureChange}
                  className="hidden"
                  accept="image/png, image/jpeg"
                />
              </div>
              <h3 className="font-semibold text-heading">{profileData.firstName} {profileData.lastName}</h3>
              <p className="text-sm text-body-muted">{profileData.email}</p>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveSection(item.key)}
                    className={`w-full text-left p-3 rounded-lg transition-colors flex items-center space-x-3 ${
                      activeSection === item.key
                        ? 'bg-primary-500/100/10 text-primary-400'
                        : 'text-body-muted hover:text-heading hover:bg-base-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Travel Stats */}
          <div className="glass-card rounded-xl shadow-sm border border-glass-border p-6 mt-6">
            <h3 className="font-semibold text-heading mb-4">Travel Stats</h3>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-base-200 rounded animate-pulse"></div>
                      <div className="w-20 h-4 bg-base-200 rounded animate-pulse"></div>
                    </div>
                    <div className="w-8 h-4 bg-base-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {travelStatsDisplay.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4 text-body-muted" />
                        <span className="text-sm text-body-muted">{stat.label}</span>
                      </div>
                      <span className="font-bold text-primary-400">{stat.value}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="glass-card rounded-xl shadow-sm border border-glass-border p-6">
            {/* Profile Information */}
            {activeSection === 'profile' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-heading">Profile Information</h2>
                  <button 
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="bg-primary-600 hover:bg-primary-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-heading mb-2">First Name</label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-4 py-3 border border-glass-border rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-heading mb-2">Last Name</label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-4 py-3 border border-glass-border rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-heading mb-2">Email Address</label>
                    <input
                      type="email"
                      value={profileData.email}
                      readOnly
                      className="w-full px-4 py-3 border border-glass-border rounded-xl bg-base-100 text-body-muted cursor-not-allowed focus:ring-0 focus:border-glass-border transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-heading mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-glass-border rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-heading mb-2">Bio</label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-glass-border rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-heading mb-2">Location</label>
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-4 py-3 border border-glass-border rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Travel Preferences */}
            {activeSection === 'preferences' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-heading">Travel Preferences</h2>
                  <button 
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="bg-primary-600 hover:bg-primary-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-heading mb-2">Preferred Currency</label>
                    <select
                      value={profileData.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      className="w-full px-4 py-3 border border-glass-border rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                    >
                      <option value="INR">INR - Indian Rupee (₹)</option>
                      <option value="USD">USD - US Dollar ($)</option>
                      <option value="EUR">EUR - Euro (€)</option>
                      <option value="GBP">GBP - British Pound (£)</option>
                      <option value="JPY">JPY - Japanese Yen (¥)</option>
                      <option value="CAD">CAD - Canadian Dollar (C$)</option>
                      <option value="AUD">AUD - Australian Dollar (A$)</option>
                      <option value="CHF">CHF - Swiss Franc</option>
                      <option value="CNY">CNY - Chinese Yuan (¥)</option>
                      <option value="SGD">SGD - Singapore Dollar (S$)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-heading mb-2">Language</label>
                    <select
                      value={profileData.language}
                      onChange={(e) => handleInputChange('language', e.target.value)}
                      className="w-full px-4 py-3 border border-glass-border rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-heading mb-2">Time Zone</label>
                    <select
                      value={profileData.timezone}
                      onChange={(e) => handleInputChange('timezone', e.target.value)}
                      className="w-full px-4 py-3 border border-glass-border rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                    >
                      <option value="Asia/Kolkata">IST - Indian Standard Time (UTC+5:30)</option>
                      <option value="America/New_York">EST - Eastern Standard Time (UTC-5)</option>
                      <option value="America/Chicago">CST - Central Standard Time (UTC-6)</option>
                      <option value="America/Denver">MST - Mountain Standard Time (UTC-7)</option>
                      <option value="America/Los_Angeles">PST - Pacific Standard Time (UTC-8)</option>
                      <option value="Europe/London">GMT - Greenwich Mean Time (UTC+0)</option>
                      <option value="Europe/Paris">CET - Central European Time (UTC+1)</option>
                      <option value="Asia/Tokyo">JST - Japan Standard Time (UTC+9)</option>
                      <option value="Asia/Shanghai">CST - China Standard Time (UTC+8)</option>
                      <option value="Australia/Sydney">AEST - Australian Eastern Standard Time (UTC+10)</option>
                      <option value="Asia/Dubai">GST - Gulf Standard Time (UTC+4)</option>
                      <option value="Asia/Singapore">SGT - Singapore Time (UTC+8)</option>
                      <option value="Europe/Moscow">MSK - Moscow Standard Time (UTC+3)</option>
                      <option value="America/Toronto">EST - Eastern Standard Time (UTC-5)</option>
                      <option value="America/Vancouver">PST - Pacific Standard Time (UTC-8)</option>
                    </select>
                  </div>
                </div>

                {/* Currency Converter */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-heading mb-4">Currency Converter</h3>
                  <CurrencyConverter />
                </div>
              </div>
            )}

            {/* Privacy & Security */}
            {activeSection === 'privacy' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-heading">Privacy & Security</h2>
                  <button 
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="bg-primary-600 hover:bg-primary-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-base-50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-heading">Public Profile</h4>
                      <p className="text-sm text-body-muted">Allow others to find and view your travel profile</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profileData.publicProfile}
                        onChange={(e) => handleInputChange('publicProfile', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-base-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-base-50 after:border-glass-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-base-50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-heading">Two-Factor Authentication</h4>
                      <p className="text-sm text-body-muted">Add an extra layer of security to your account</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-body-muted">
                        {profileData.twoFactorAuth ? 'Enabled' : 'Disabled'}
                      </span>
                      <button
                        onClick={() => set2FAModalOpen(true)}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                      >
                        {profileData.twoFactorAuth ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-base-50 rounded-xl">
                    <h4 className="font-medium text-heading mb-2">Change Password</h4>
                    <p className="text-sm text-body-muted mb-4">Update your password to keep your account secure</p>
                    <button
                      onClick={() => setChangePasswordModalOpen(true)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Change Password
                    </button>
                  </div>

                  <div className="p-4 bg-error-500/10 border border-error-500/30 rounded-xl">
                    <h4 className="font-medium text-error-300 mb-2">Delete Account</h4>
                    <p className="text-sm text-error-400 mb-4">Permanently delete your account and all of your data. This action is irreversible.</p>
                    <button
                      onClick={() => setDeleteModalOpen(true)}
                      disabled={isSaving}
                      className="bg-error-600 hover:bg-error-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      {isSaving ? 'Deleting...' : 'Delete My Account'}
                    </button>
                  </div>
                </div>
              </div>
            )}


          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteProfile}
        title="Confirm Account Deletion"
        confirmText={isSaving ? "Deleting..." : "Yes, Delete Account"}
        confirmButtonClass={`${isSaving ? 'bg-red-400 cursor-not-allowed' : 'bg-error-600 hover:bg-error-700'}`}
        isConfirmDisabled={isSaving}
      >
        <p>Are you absolutely sure you want to delete your account?</p>
        <p className="mt-2 font-semibold">This action is irreversible and cannot be undone.</p>
        <p className="mt-2 text-sm text-error-400">All your trips, itineraries, and data will be permanently removed.</p>
      </ConfirmationModal>

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setChangePasswordModalOpen(false)}
        onSubmit={handleChangePassword}
      />

      <ConfirmationModal
        isOpen={is2FAModalOpen}
        onClose={() => set2FAModalOpen(false)}
        onConfirm={handleToggleTwoFactorAuth}
        title={profileData.twoFactorAuth ? 'Disable Two-Factor Authentication' : 'Enable Two-Factor Authentication'}
        confirmText={profileData.twoFactorAuth ? 'Yes, Disable' : 'Yes, Enable'}
        confirmButtonClass={profileData.twoFactorAuth ? 'bg-error-600 hover:bg-error-700' : 'bg-primary-600 hover:bg-primary-700'}
      >
        {profileData.twoFactorAuth ? (
          <p>Disabling Two-Factor Authentication will reduce your account's security. Are you sure you want to proceed?</p>
        ) : (
          <div>
            <p>Enabling Two-Factor Authentication adds an extra layer of security to your account.</p>
            <p className="mt-2 text-xs text-body-muted">In a real application, you would be prompted to scan a QR code with an authenticator app to complete this process.</p>
          </div>
        )}
      </ConfirmationModal>
    </div>
  );
};

export default UserProfile;