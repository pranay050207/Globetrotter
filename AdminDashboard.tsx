import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  MapPin, 
  Globe, 
  DollarSign, 
  RefreshCw, 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Activity, 
  Eye, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Download,
  MoreHorizontal
} from 'lucide-react';
import { ROUTES } from '../../utils/navigation';
import { 
  getAllUsers, 
  getAllTrips, 
  UserProfile, 
  Trip
} from '../../utils/api';

interface AdminDashboardProps {
  onNavigate: (screen: any) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // Admin interface states
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userFilter, setUserFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    console.log('🔄 AdminDashboard: Starting to fetch admin data...');
      setIsLoading(true);
      
    try {
      console.log('📡 AdminDashboard: Making API calls to getAllUsers() and getAllTrips()...');
      
      const [usersData, tripsData] = await Promise.all([
        getAllUsers(),
        getAllTrips()
      ]);
      
      console.log('✅ AdminDashboard: API calls completed successfully!');
      console.log('👥 Users data received:', usersData);
      console.log('🗺️ Trips data received:', tripsData);
      console.log('📊 Users count:', usersData.length);
      console.log('📊 Trips count:', tripsData.length);
      
      setAllUsers(usersData);
      setAllTrips(tripsData);

    } catch (error) {
      console.error('❌ AdminDashboard: Error fetching admin data:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setAllUsers([]);
      setAllTrips([]);
    } finally {
      setIsLoading(false);
      console.log('🏁 AdminDashboard: Data fetching completed, loading state set to false');
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchAdminData();
    setLastRefresh(new Date());
    setIsRefreshing(false);
  };

  // Calculate real metrics from database data
  const calculateMetrics = () => {
    console.log('Calculating metrics with:', { allUsers: allUsers.length, allTrips: allTrips.length });
    
    // Total users from database
    const totalUsers = allUsers.length;
    
    // Total trips from database
    const totalTrips = allTrips.length;
    
    // Unique cities from trip destinations
    const uniqueCities = new Set<string>();
    const cityStats: Record<string, { count: number; totalBudget: number; trips: Trip[] }> = {};
    
    allTrips.forEach(trip => {
      if (trip.destinations) {
        const parts = trip.destinations.split(', ');
        if (parts.length >= 1) {
          const city = parts[0].trim();
          uniqueCities.add(city);
          
          if (!cityStats[city]) {
            cityStats[city] = { count: 0, totalBudget: 0, trips: [] };
          }
          cityStats[city].count++;
          cityStats[city].totalBudget += trip.estimated_budget || 0;
          cityStats[city].trips.push(trip);
        }
      }
    });
    
    // Top cities by trip count
    const topCities = Object.entries(cityStats)
      .map(([city, stats]) => ({
        name: city,
        tripCount: stats.count,
        totalBudget: stats.totalBudget,
        avgBudget: Math.round(stats.totalBudget / stats.count)
      }))
      .sort((a, b) => b.tripCount - a.tripCount)
      .slice(0, 10);
    
    // Total budget from all trips
    const totalBudget = allTrips.reduce((sum, trip) => {
      return sum + (trip.estimated_budget || 0);
    }, 0);
    
    // Average budget per trip
    const averageBudget = totalTrips > 0 ? Math.round(totalBudget / totalTrips) : 0;
    
    // Average budget per user
    const averageBudgetPerUser = totalUsers > 0 ? Math.round(totalBudget / totalUsers) : 0;
    
    // Count trips by status (completed vs planning)
    const completedTrips = allTrips.filter(trip => {
      if (!trip.end_date) return false;
      const endDate = new Date(trip.end_date);
      return endDate < new Date();
    }).length;
    
    const planningTrips = allTrips.filter(trip => {
      if (!trip.start_date) return false;
      const startDate = new Date(trip.start_date);
      return startDate > new Date();
    }).length;
    
    // Count public/shared trips
    const sharedTrips = allTrips.filter(trip => trip.is_public).length;
    
    // User engagement stats
    const activeUsers = allUsers.filter(user => {
      if (!user.created_at) return false;
      const userDate = new Date(user.created_at);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return userDate >= monthAgo;
    }).length;
    
    const newUsersThisMonth = allUsers.filter(user => {
      if (!user.created_at) return false;
      const userDate = new Date(user.created_at);
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      return userDate >= monthStart;
    }).length;
    
    // Monthly trip trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date();
      month.setMonth(month.getMonth() - i);
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
      const monthTrips = allTrips.filter(trip => {
        const tripDate = new Date(trip.start_date);
        return tripDate >= monthStart && tripDate <= monthEnd;
      }).length;
      
      monthlyTrends.push({
        month: month.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        trips: monthTrips
      });
    }
    
    const metrics = {
      totalUsers,
      totalTrips,
      uniqueCities: uniqueCities.size,
      totalBudget,
      averageBudget,
      averageBudgetPerUser,
      completedTrips,
      planningTrips,
      sharedTrips,
      activeUsers,
      newUsersThisMonth,
      topCities,
      monthlyTrends
    };
    
    console.log('Calculated metrics:', metrics);
    return metrics;
  };

  const metrics = calculateMetrics();

  const handleViewTrips = () => {
    navigate(ROUTES.TRIPS);
  };

  const handleViewUsers = () => {
    // In a real app, this would navigate to a users management page
    console.log('Navigate to users management');
  };

  const handleViewCities = () => {
    navigate(ROUTES.CITY_SEARCH);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">
            Real-time platform statistics from database
            {lastRefresh && (
              <span className="ml-2 text-sm text-gray-500">
                • Last updated: {lastRefresh.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={refreshData}
            disabled={isRefreshing}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Monitor platform performance and user activity</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
            </button>
            {lastRefresh && (
              <span className="text-sm text-gray-500">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {['overview', 'users', 'trips', 'cities', 'engagement'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab === 'overview' && 'Overview'}
              {tab === 'users' && 'User Management'}
              {tab === 'trips' && 'Trip Analytics'}
              {tab === 'cities' && 'City Analytics'}
              {tab === 'engagement' && 'User Engagement'}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Debug Information - Remove this in production */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-yellow-800 mb-2">🔍 Debug Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Loading State:</span> {isLoading ? '🔄 Loading...' : '✅ Loaded'}
              </div>
              <div>
                <span className="font-medium">Users Count:</span> {allUsers.length} users
              </div>
              <div>
                <span className="font-medium">Trips Count:</span> {allTrips.length} trips
              </div>
            </div>
            <div className="mt-2 text-xs text-yellow-700">
              <p>Check browser console for detailed API call logs</p>
              <p>If counts are 0, check your backend API endpoints: /admin/users and /admin/trips</p>
            </div>
          </div>
          {/* Main Stats - Real data from database */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalUsers.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1">Registered users</p>
                  </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                </div>
              </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Trips</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalTrips.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1">Created trips</p>
            </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
              </div>
      </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cities Added</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.uniqueCities.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1">Unique destinations</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-6 h-6 text-purple-600" />
                </div>
              </div>
      </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Budget</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">${metrics.averageBudget.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1">Per trip</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-lg font-bold text-gray-900">{metrics.activeUsers}</p>
                  <p className="text-xs text-gray-500">Last 30 days</p>
                  </div>
                </div>
              </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">New Users</p>
                  <p className="text-lg font-bold text-gray-900">{metrics.newUsersThisMonth}</p>
                  <p className="text-xs text-gray-500">This month</p>
                </div>
          </div>
        </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
          </div>
                    <div>
                  <p className="text-sm font-medium text-gray-600">Planning Trips</p>
                  <p className="text-lg font-bold text-gray-900">{metrics.planningTrips}</p>
                  <p className="text-xs text-gray-500">Future trips</p>
                    </div>
                    </div>
                  </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Budget</p>
                  <p className="text-lg font-bold text-gray-900">${metrics.totalBudget.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Planned</p>
                  </div>
                </div>
              </div>
          </div>

          {/* Budget Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Budget Planned</p>
                  <p className="text-lg font-bold text-gray-900">${metrics.totalBudget.toLocaleString()}</p>
          </div>
        </div>
      </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Budget per User</p>
                  <p className="text-lg font-bold text-gray-900">${metrics.averageBudgetPerUser.toLocaleString()}</p>
                </div>
              </div>
          </div>
          
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Trips</p>
                  <p className="text-lg font-bold text-gray-900">{metrics.totalTrips.toLocaleString()}</p>
                </div>
              </div>
          </div>
        </div>

          <div className="mb-8">
            {/* Trip Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Trip Status</h2>
                <MapPin className="w-5 h-5 text-gray-600" />
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">Completed Trips</span>
                <span className="text-sm font-bold text-green-600">
                      {metrics.totalTrips > 0 ? Math.round((metrics.completedTrips / metrics.totalTrips) * 100) : 0}%
                </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                  className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${metrics.totalTrips > 0 ? (metrics.completedTrips / metrics.totalTrips) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{metrics.completedTrips} out of {metrics.totalTrips} trips</p>
                </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Planning Trips</span>
                <span className="text-sm font-bold text-blue-600">
                      {metrics.totalTrips > 0 ? Math.round((metrics.planningTrips / metrics.totalTrips) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${metrics.totalTrips > 0 ? (metrics.planningTrips / metrics.totalTrips) * 100 : 0}%` }}
                ></div>
          </div>
                  <p className="text-xs text-gray-500 mt-1">{metrics.planningTrips} out of {metrics.totalTrips} trips</p>
        </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Shared Trips</span>
                <span className="text-sm font-bold text-purple-600">
                      {metrics.totalTrips > 0 ? Math.round((metrics.sharedTrips / metrics.totalTrips) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                      style={{ width: `${metrics.totalTrips > 0 ? (metrics.sharedTrips / metrics.totalTrips) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{metrics.sharedTrips} out of {metrics.totalTrips} trips</p>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Health Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Platform Health Summary</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{metrics.totalUsers}</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{metrics.totalTrips}</div>
                <div className="text-sm text-gray-600">Total Trips</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{metrics.uniqueCities}</div>
                <div className="text-sm text-gray-600">Cities Explored</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">${metrics.totalBudget.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Budget</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Management Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading user data...</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* User Management Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                    <p className="text-sm text-gray-600">Manage user accounts, roles, and permissions</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                      Add User
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                      Export Users
                    </button>
                  </div>
          </div>
          
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search users by name, email, or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <select
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Users</option>
                      <option value="admin">Admins</option>
                      <option value="regular">Regular Users</option>
                      <option value="verified">Verified</option>
                      <option value="unverified">Unverified</option>
                    </select>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="created_at">Join Date</option>
                      <option value="full_name">Name</option>
                      <option value="email">Email</option>
                      <option value="role">Role</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                  </div>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trips
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p>No users found</p>
                            <p className="text-sm">Users will appear here once they register</p>
                          </td>
                        </tr>
                      ) : (
                        allUsers
                          .filter(user => {
                            if (searchTerm) {
                              const search = searchTerm.toLowerCase();
                              return (
                                user.full_name?.toLowerCase().includes(search) ||
                                user.email.toLowerCase().includes(search) ||
                                user.role?.toLowerCase().includes(search)
                              );
                            }
                            if (userFilter === 'admin') return user.role === 'admin';
                            if (userFilter === 'regular') return user.role === 'user';
                            if (userFilter === 'verified') return user.is_verified;
                            if (userFilter === 'unverified') return !user.is_verified;
                            return true;
                          })
                          .sort((a, b) => {
                            let aValue: any = a[sortBy as keyof UserProfile];
                            let bValue: any = b[sortBy as keyof UserProfile];
                            
                            if (sortBy === 'created_at') {
                              aValue = a.created_at ? new Date(a.created_at).getTime() : 0;
                              bValue = b.created_at ? new Date(b.created_at).getTime() : 0;
                            }
                            
                            if (sortOrder === 'asc') {
                              return aValue > bValue ? 1 : -1;
                            } else {
                              return aValue < bValue ? 1 : -1;
                            }
                          })
                          .map((user) => {
                            const userTrips = allTrips.filter(trip => trip.user_id === user.id);
                            return (
                              <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <span className="text-sm font-medium text-blue-600">
                                          {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">{user.full_name || 'No Name'}</div>
                                      <div className="text-sm text-gray-500">{user.email}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    user.role === 'admin' 
                                      ? 'bg-red-100 text-red-800' 
                                      : 'bg-green-100 text-green-800'
                                  }`}>
                                    {user.role || 'user'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    user.is_verified 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {user.is_verified ? 'Verified' : 'Unverified'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {userTrips.length} trips
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => {
                                        setSelectedUser(user);
                                        setShowUserModal(true);
                                      }}
                                      className="text-blue-600 hover:text-blue-900"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    <button className="text-green-600 hover:text-green-900">
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button className="text-red-600 hover:text-red-900">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer */}
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <div>
                    Showing {allUsers.length} users
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>Page 1 of 1</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Trip Analytics Tab */}
      {activeTab === 'trips' && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading trip data...</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Trip Analytics Header */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Trip Analytics</h2>
                    <p className="text-sm text-gray-600">Comprehensive analysis of trip data and trends</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                      Export Data
                    </button>
                  </div>
                </div>

                {/* Trip Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-blue-600">Total Trips</p>
                        <p className="text-2xl font-bold text-blue-900">{metrics.totalTrips}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-600">Planning</p>
                        <p className="text-2xl font-bold text-green-900">{metrics.planningTrips}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Globe className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-purple-600">Completed</p>
                        <p className="text-2xl font-bold text-purple-900">{metrics.completedTrips}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-orange-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-orange-600">Avg Budget</p>
                        <p className="text-2xl font-bold text-orange-900">${metrics.averageBudget}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Monthly Trip Trends Chart */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Trip Trends</h3>
                  {metrics.monthlyTrends.length > 0 ? (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-600">Last 6 months</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Trips Created</span>
                        </div>
                      </div>
                      <div className="flex items-end space-x-2 h-32">
                        {metrics.monthlyTrends.map((trend, index) => {
                          const maxTrips = Math.max(...metrics.monthlyTrends.map(t => t.trips));
                          const height = maxTrips > 0 ? (trend.trips / maxTrips) * 100 : 0;
                          return (
                            <div key={index} className="flex-1 flex flex-col items-center">
                              <div className="w-full bg-blue-200 rounded-t" style={{ height: `${height}%` }}>
                                <div className="bg-blue-500 h-full rounded-t"></div>
                              </div>
                              <span className="text-xs text-gray-500 mt-2">{trend.month}</span>
                              <span className="text-xs font-medium text-gray-700">{trend.trips}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No trip trend data available</p>
                    </div>
                  )}
                </div>

                {/* Recent Trips Table */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Trips</h3>
                  {allTrips.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                      <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No trips found</p>
                      <p className="text-sm">Trips will appear here once users create them</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Trip
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Destination
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Dates
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Budget
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {allTrips
                            .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
                            .slice(0, 10)
                            .map((trip) => {
                              const user = allUsers.find(u => u.id === trip.user_id);
                              const isCompleted = new Date(trip.end_date) < new Date();
                              const isPlanning = new Date(trip.start_date) > new Date();
                              
                              return (
                                <tr key={trip.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{trip.title}</div>
                                    <div className="text-sm text-gray-500">{trip.description || 'No description'}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{user?.full_name || 'Unknown User'}</div>
                                    <div className="text-sm text-gray-500">{user?.email}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {trip.destinations || 'Unknown'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div>{new Date(trip.start_date).toLocaleDateString()}</div>
                                    <div>to {new Date(trip.end_date).toLocaleDateString()}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    ${trip.estimated_budget?.toLocaleString() || '0'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      isCompleted 
                                        ? 'bg-green-100 text-green-800' 
                                        : isPlanning 
                                          ? 'bg-blue-100 text-blue-800'
                                          : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {isCompleted ? 'Completed' : isPlanning ? 'Planning' : 'Ongoing'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* City Analytics Tab */}
      {activeTab === 'cities' && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading city data...</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* City Analytics Header */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">City Analytics</h2>
                    <p className="text-sm text-gray-600">Analysis of popular destinations and city trends</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                      Export Cities
                    </button>
                  </div>
                </div>

                {/* City Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Globe className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-blue-600">Total Cities</p>
                        <p className="text-2xl font-bold text-blue-900">{metrics.uniqueCities}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-600">Total Trips</p>
                        <p className="text-2xl font-bold text-green-900">{metrics.totalTrips}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-purple-600">Total Budget</p>
                        <p className="text-2xl font-bold text-purple-900">${metrics.totalBudget.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Cities Chart */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Top 10 Cities by Trip Count</h3>
                  {metrics.topCities.length > 0 ? (
                    <div className="space-y-4">
                      {metrics.topCities.map((city, index) => (
                        <div key={city.name} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                              </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{city.name}</h4>
                                <p className="text-sm text-gray-500">{city.tripCount} trips</p>
                              </div>
                    </div>
                    <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">${city.avgBudget.toLocaleString()}</p>
                              <p className="text-xs text-gray-500">avg budget</p>
                    </div>
                  </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(city.tripCount / Math.max(...metrics.topCities.map(c => c.tripCount))) * 100}%` }}
                    ></div>
                  </div>
                </div>
                      ))}
              </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                      <Globe className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No city data available</p>
                      <p className="text-sm">Cities will appear here once trips are created</p>
                    </div>
                  )}
                </div>

                {/* City Details Table */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">City Details</h3>
                  {metrics.topCities.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              City
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Trip Count
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total Budget
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Average Budget
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Popularity
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {metrics.topCities.map((city, index) => (
                            <tr key={city.name} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900">{city.name}</div>
                                    <div className="text-sm text-gray-500">Destination</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {city.tripCount} trips
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ${city.totalBudget.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ${city.avgBudget.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                    <div
                                      className="bg-blue-500 h-2 rounded-full"
                                      style={{ width: `${(city.tripCount / Math.max(...metrics.topCities.map(c => c.tripCount))) * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {Math.round((city.tripCount / Math.max(...metrics.topCities.map(c => c.tripCount))) * 100)}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
          </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                      <Globe className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No city details available</p>
        </div>
                  )}
      </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* User Engagement Tab */}
      {activeTab === 'engagement' && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading engagement data...</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* User Engagement Header */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">User Engagement</h2>
                    <p className="text-sm text-gray-600">Track user activity, retention, and platform usage</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                      Export Report
                    </button>
                  </div>
          </div>
          
                {/* Engagement Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-blue-600">Total Users</p>
                        <p className="text-2xl font-bold text-blue-900">{metrics.totalUsers}</p>
                </div>
              </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-600">Active Users</p>
                        <p className="text-2xl font-bold text-green-900">{metrics.activeUsers}</p>
                        <p className="text-xs text-green-600">Last 30 days</p>
                      </div>
          </div>
        </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-purple-600">New Users</p>
                        <p className="text-2xl font-bold text-purple-900">{metrics.newUsersThisMonth}</p>
                        <p className="text-xs text-purple-600">This month</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-orange-600" />
              </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-orange-600">Avg Trips/User</p>
                        <p className="text-2xl font-bold text-orange-900">
                          {metrics.totalUsers > 0 ? (metrics.totalTrips / metrics.totalUsers).toFixed(1) : '0'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Activity Trends */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">User Activity Trends</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Monthly User Growth */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Monthly User Growth</h4>
                      {metrics.monthlyTrends.length > 0 ? (
                        <div className="space-y-3">
                          {metrics.monthlyTrends.map((trend, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{trend.month}</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                                    style={{ width: `${Math.min((trend.trips / Math.max(...metrics.monthlyTrends.map(t => t.trips))) * 100, 100)}%` }}
                ></div>
              </div>
                                <span className="text-sm font-medium text-gray-900">{trend.trips}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No trend data available</p>
                        </div>
                      )}
            </div>

                    {/* User Engagement Metrics */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Engagement Metrics</h4>
                      <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">User Retention Rate</span>
                            <span className="text-sm font-medium text-gray-900">
                              {metrics.totalUsers > 0 ? Math.round((metrics.activeUsers / metrics.totalUsers) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${metrics.totalUsers > 0 ? (metrics.activeUsers / metrics.totalUsers) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Trip Creation Rate</span>
                            <span className="text-sm font-medium text-gray-900">
                              {metrics.totalUsers > 0 ? Math.round((metrics.totalTrips / metrics.totalUsers) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${Math.min((metrics.totalTrips / metrics.totalUsers) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Budget Planning Rate</span>
                            <span className="text-sm font-medium text-gray-900">
                              {metrics.totalUsers > 0 ? Math.round((metrics.totalBudget > 0 ? 100 : 0)) : 0}%
                            </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                              className="bg-purple-500 h-2 rounded-full"
                              style={{ width: `${metrics.totalUsers > 0 ? (metrics.totalBudget > 0 ? 100 : 0) : 0}%` }}
                ></div>
                          </div>
                        </div>
                      </div>
                    </div>
              </div>
            </div>

                {/* Platform Usage Statistics */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Usage Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-2">
                          {metrics.totalUsers > 0 ? Math.round((metrics.activeUsers / metrics.totalUsers) * 100) : 0}%
              </div>
                        <div className="text-sm text-gray-600">Active User Rate</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {metrics.activeUsers} out of {metrics.totalUsers} users
              </div>
              </div>
              </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 mb-2">
                          {metrics.totalUsers > 0 ? (metrics.totalTrips / metrics.totalUsers).toFixed(1) : '0'}
            </div>
                        <div className="text-sm text-gray-600">Trips per User</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {metrics.totalTrips} total trips
          </div>
        </div>
      </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 mb-2">
                          ${metrics.totalUsers > 0 ? Math.round(metrics.totalBudget / metrics.totalUsers) : 0}
                        </div>
                        <div className="text-sm text-gray-600">Avg Budget per User</div>
                        <div className="text-xs text-gray-500 mt-1">
                          ${metrics.totalBudget.toLocaleString()} total
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Debug Info - Development Only */}
      {import.meta.env.DEV && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <details className="text-sm text-gray-600">
            <summary className="cursor-pointer hover:text-gray-800 font-medium">Debug Info - Real Database Data</summary>
            <div className="mt-2 space-y-2 text-xs">
              <div><strong>Total Users:</strong> {metrics.totalUsers}</div>
              <div><strong>Total Trips:</strong> {metrics.totalTrips}</div>
              <div><strong>Unique Cities:</strong> {metrics.uniqueCities}</div>
              <div><strong>Total Budget:</strong> ${metrics.totalBudget.toLocaleString()}</div>
              <div><strong>Average Budget per Trip:</strong> ${metrics.averageBudget.toLocaleString()}</div>
              <div><strong>Average Budget per User:</strong> ${metrics.averageBudgetPerUser.toLocaleString()}</div>
              <div><strong>Completed Trips:</strong> {metrics.completedTrips}</div>
              <div><strong>Planning Trips:</strong> {metrics.planningTrips}</div>
              <div><strong>Shared Trips:</strong> {metrics.sharedTrips}</div>
            </div>
          </details>
          
          <details className="text-sm text-gray-600 mt-4">
            <summary className="cursor-pointer hover:text-gray-800 font-medium">Debug Info - Raw Data Counts</summary>
            <div className="mt-2 space-y-1 text-xs">
              <div><strong>Users Array Length:</strong> {allUsers.length}</div>
              <div><strong>Trips Array Length:</strong> {allTrips.length}</div>
              <div><strong>Last Refresh:</strong> {lastRefresh.toLocaleString()}</div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
