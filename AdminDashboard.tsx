import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, MapPin, TrendingUp, Calendar, Globe, DollarSign, Clock, Star, Thermometer } from 'lucide-react';
import { ROUTES } from '../../utils/navigation';
import { getTrips, Trip, getUserProfile, UserProfile } from '../../utils/api';

interface AdminDashboardProps {
  onNavigate: (screen: any) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [timeFilter, setTimeFilter] = useState('30d');
  const [userTrips, setUserTrips] = useState<Trip[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Popular destinations data from CitySearch.tsx (same as Dashboard)
  const popularDestinations = [
    {
      id: 1,
      name: 'Paris',
      country: 'France',
      rating: 4.8,
      popularity: 95,
      costIndex: 120,
      dailyBudget: '$80-150',
      temperature: '15°C',
      image: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-674x446/11/7b/03/80.jpg',
    },
    {
      id: 2,
      name: 'Tokyo',
      country: 'Japan',
      rating: 4.7,
      popularity: 92,
      costIndex: 135,
      dailyBudget: '$90-180',
      temperature: '18°C',
      image: 'https://images.pexels.com/photos/161401/fushimi-inari-taisha-shrine-kyoto-japan-temple-161401.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: 3,
      name: 'Bali',
      country: 'Indonesia',
      rating: 4.8,
      popularity: 94,
      costIndex: 85,
      dailyBudget: '$40-100',
      temperature: '27°C',
      image: 'https://images.pexels.com/photos/753626/pexels-photo-753626.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: 4,
      name: 'Santorini',
      country: 'Greece',
      rating: 4.7,
      popularity: 90,
      costIndex: 130,
      dailyBudget: '$90-170',
      temperature: '23°C',
      image: 'https://images.pexels.com/photos/164241/pexels-photo-164241.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: 5,
      name: 'New York',
      country: 'USA',
      rating: 4.6,
      popularity: 90,
      costIndex: 140,
      dailyBudget: '$100-200',
      temperature: '12°C',
      image: 'https://images.pexels.com/photos/290595/pexels-photo-290595.jpeg?auto=compress&cs=tinysrgb&w=400',
    }
  ];

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch trips data
      const tripsData = await getTrips();
      console.log('AdminDashboard: Fetched trips data:', tripsData);
      setUserTrips(tripsData);

      // For now, simulate multiple users (in real app, you'd fetch all users)
      // This simulates having multiple users with their trips
      const mockUsers = [
        { id: 1, full_name: 'John Doe', email: 'john@example.com', role: 'user' },
        { id: 2, full_name: 'Sarah Smith', email: 'sarah@example.com', role: 'user' },
        { id: 3, full_name: 'Mike Johnson', email: 'mike@example.com', role: 'user' },
        { id: 4, full_name: 'Emma Wilson', email: 'emma@example.com', role: 'user' },
        { id: 5, full_name: 'David Brown', email: 'david@example.com', role: 'user' }
      ];
      setAllUsers(mockUsers);

    } catch (error) {
      console.error('Error fetching admin data:', error);
      setUserTrips([]);
      setAllUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate dynamic admin stats from actual data
  const calculateAdminStats = () => {
    const totalUsers = allUsers.length;
    const activeTrips = userTrips.length;
    
    // Calculate unique cities from trips
    const cities = new Set<string>();
    let totalBudget = 0;
    let completedTrips = 0;
    let planningTrips = 0;

    userTrips.forEach(trip => {
      if (trip.destinations) {
        const parts = trip.destinations.split(', ');
        if (parts.length >= 2) {
          cities.add(parts[0].trim());
        }
      }

      if (trip.estimated_budget) {
        totalBudget += trip.estimated_budget;
      }

      if (trip.end_date) {
        const endDate = new Date(trip.end_date);
        if (endDate < new Date()) {
          completedTrips++;
        } else {
          planningTrips++;
        }
      }
    });

    const avgTripBudget = activeTrips > 0 ? Math.round(totalBudget / activeTrips) : 0;

    return {
      totalUsers,
      activeTrips,
      citiesExplored: cities.size,
      avgTripBudget,
      completedTrips,
      planningTrips,
      totalBudget
    };
  };

  // Calculate top destinations based on actual trip data
  const calculateTopDestinations = () => {
    const destinationCounts: Record<string, { count: number; country: string; image: string }> = {};

    userTrips.forEach(trip => {
      if (trip.destinations) {
        const parts = trip.destinations.split(', ');
        if (parts.length >= 2) {
          const city = parts[0].trim();
          const country = parts[1].trim();
          
          if (!destinationCounts[city]) {
            destinationCounts[city] = { count: 0, country, image: trip.cover_image || '/assests/geometric travel pattern wallpaper.jpg' };
          }
          destinationCounts[city].count++;
        }
      }
    });

    // Convert to array and sort by count
    const sortedDestinations = Object.entries(destinationCounts)
      .map(([city, data]) => ({
        name: city,
        country: data.country,
        trips: data.count,
        image: data.image,
        percentage: Math.round((data.count / userTrips.length) * 100)
      }))
      .sort((a, b) => b.trips - a.trips)
      .slice(0, 5);

    // If no real data, use popular destinations as fallback
    if (sortedDestinations.length === 0) {
      return popularDestinations.map((dest, index) => ({
        name: dest.name,
        country: dest.country,
        trips: Math.floor(Math.random() * 1000) + 500, // Random trip count for demo
        image: dest.image,
        percentage: Math.floor(Math.random() * 40) + 30 // Random percentage for demo
      }));
    }

    return sortedDestinations;
  };

  // Generate recent activity based on actual trips
  const generateRecentActivity = () => {
    const activities = [];
    const userNames = allUsers.map(user => user.full_name);

    // Generate activities based on actual trips
    userTrips.slice(0, 5).forEach((trip, index) => {
      const userName = userNames[index % userNames.length] || 'Unknown User';
      const actions = [
        `Created trip to "${trip.title}"`,
        `Updated itinerary for "${trip.title}"`,
        `Added activities to "${trip.title}"`,
        `Shared "${trip.title}" itinerary`,
        `Completed trip to "${trip.destinations || 'Unknown Destination'}"`
      ];
      
      activities.push({
        user: userName,
        action: actions[index % actions.length],
        time: `${(index + 1) * 2} minutes ago`
      });
    });

    // If no trips, generate mock activities
    if (activities.length === 0) {
      return [
        { user: 'John Doe', action: 'Created trip to "European Adventure"', time: '2 minutes ago' },
        { user: 'Sarah Smith', action: 'Shared itinerary for "Asian Explorer"', time: '5 minutes ago' },
        { user: 'Mike Johnson', action: 'Added activity to "California Coast"', time: '8 minutes ago' },
        { user: 'Emma Wilson', action: 'Updated budget for "Nordic Adventure"', time: '12 minutes ago' },
        { user: 'David Brown', action: 'Completed trip to "Mediterranean Tour"', time: '15 minutes ago' }
      ];
    }

    return activities;
  };

  // Calculate monthly growth data
  const calculateMonthlyData = () => {
    const currentMonth = new Date().getMonth();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return months.slice(0, currentMonth + 1).map((month, index) => {
      const baseUsers = 8000 + (index * 800);
      const baseTrips = 2000 + (index * 300);
      const randomFactor = 0.8 + Math.random() * 0.4; // Random growth factor
      
      return {
        month,
        users: Math.round(baseUsers * randomFactor),
        trips: Math.round(baseTrips * randomFactor)
      };
    });
  };

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

  // Calculate dynamic stats
  const adminStats = calculateAdminStats();
  const topDestinations = calculateTopDestinations();
  const recentActivity = generateRecentActivity();
  const monthlyData = calculateMonthlyData();

  const stats = [
    { 
      label: 'Total Users', 
      value: adminStats.totalUsers.toLocaleString(), 
      change: '+8.2%', 
      color: 'text-primary-400', 
      bg: 'bg-primary-500/100/15', 
      icon: Users 
    },
    { 
      label: 'Active Trips', 
      value: adminStats.activeTrips.toLocaleString(), 
      change: '+12.1%', 
      color: 'text-success-400', 
      bg: 'bg-success-500/15', 
      icon: MapPin 
    },
    { 
      label: 'Cities Explored', 
      value: adminStats.citiesExplored.toLocaleString(), 
      change: '+5.7%', 
      color: 'text-accent-400', 
      bg: 'bg-accent-500/100/15', 
      icon: Globe 
    },
    { 
      label: 'Avg Trip Budget', 
      value: `$${adminStats.avgTripBudget.toLocaleString()}`, 
      change: '+3.2%', 
      color: 'text-warning-400', 
      bg: 'bg-orange-100', 
      icon: DollarSign 
    }
  ];

  const getCostColor = (costIndex: number) => {
    if (costIndex < 100) return 'text-success-400';
    if (costIndex < 120) return 'text-warning-400';
    return 'text-error-400';
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-body-muted">Loading admin dashboard...</p>
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
          <h1 className="text-3xl font-bold text-heading mb-2">Analytics Dashboard</h1>
          <p className="text-body-muted">Monitor platform performance and user engagement</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="px-4 py-2 border border-glass-border rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl font-medium transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="glass-card rounded-xl shadow-sm border border-glass-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-body-muted">{stat.label}</p>
                  <p className="text-2xl font-bold text-heading mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-success-400 mr-1" />
                    <span className="text-sm text-success-400 font-medium">{stat.change}</span>
                    <span className="text-sm text-body-muted ml-1">vs last month</span>
                  </div>
                </div>
                <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Growth Chart */}
        <div className="glass-card rounded-xl shadow-sm border border-glass-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-heading">Growth Trends</h2>
            <BarChart3 className="w-5 h-5 text-body-muted" />
          </div>
          
          <div className="space-y-4">
            {monthlyData.map((data, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-12 text-sm font-medium text-body-muted">{data.month}</div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Users: {data.users.toLocaleString()}</span>
                    <span>Trips: {data.trips.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-base-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${(data.users / 15000) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Destinations */}
        <div className="glass-card rounded-xl shadow-sm border border-glass-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-heading">Popular Destinations</h2>
            <Globe className="w-5 h-5 text-body-muted" />
          </div>
          
          <div className="space-y-4">
            {topDestinations.map((city, index) => (
              <div key={index} className="flex items-center space-x-3">
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <div>
                      <h4 className="font-medium text-heading">{city.name}</h4>
                      <p className="text-xs text-body-muted">{city.country}</p>
                    </div>
                    <span className="text-sm font-medium text-heading">{city.trips} trips</span>
                  </div>
                  <div className="w-full bg-base-200 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-teal-500 h-1.5 rounded-full"
                      style={{ width: `${city.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 glass-card rounded-xl shadow-sm border border-glass-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-heading">Recent Activity</h2>
            <Calendar className="w-5 h-5 text-body-muted" />
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-base-50 transition-colors">
                <div className="w-8 h-8 bg-primary-500/100/15 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Users className="w-4 h-4 text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-heading">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-xs text-body-muted mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="glass-card rounded-xl shadow-sm border border-glass-border p-6">
          <h2 className="text-xl font-semibold text-heading mb-6">Quick Stats</h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-body-muted">Trip Completion</span>
                <span className="text-sm font-bold text-success-400">
                  {adminStats.activeTrips > 0 ? Math.round((adminStats.completedTrips / adminStats.activeTrips) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-base-200 rounded-full h-2">
                <div 
                  className="bg-success-500/100 h-2 rounded-full" 
                  style={{ width: `${adminStats.activeTrips > 0 ? (adminStats.completedTrips / adminStats.activeTrips) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-body-muted">Planning Trips</span>
                <span className="text-sm font-bold text-primary-400">
                  {adminStats.activeTrips > 0 ? Math.round((adminStats.planningTrips / adminStats.activeTrips) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-base-200 rounded-full h-2">
                <div 
                  className="bg-primary-500/100/100 h-2 rounded-full" 
                  style={{ width: `${adminStats.activeTrips > 0 ? (adminStats.planningTrips / adminStats.activeTrips) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-body-muted">Total Budget</span>
                <span className="text-sm font-bold text-accent-400">${adminStats.totalBudget.toLocaleString()}</span>
              </div>
              <div className="w-full bg-base-200 rounded-full h-2">
                <div 
                  className="bg-accent-500/100/100 h-2 rounded-full" 
                  style={{ width: `${Math.min((adminStats.totalBudget / 100000) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-4 border-t border-glass-border">
              <h3 className="text-sm font-medium text-heading mb-3">Platform Health</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-body-muted">Active Users</span>
                <span className="text-xs font-medium text-success-400">{adminStats.totalUsers}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-body-muted">Cities Explored</span>
                <span className="text-xs font-medium text-primary-400">{adminStats.citiesExplored}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-body-muted">Avg Trip Budget</span>
                <span className="text-xs font-medium text-warning-400">${adminStats.avgTripBudget.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
