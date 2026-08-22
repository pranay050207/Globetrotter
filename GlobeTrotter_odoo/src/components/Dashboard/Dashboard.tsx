import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, MapPin, TrendingUp, Users, Clock, ArrowRight, Star, DollarSign, Thermometer, Sparkles, Globe, Plane, Compass, Zap, BarChart3, PieChart, LineChart } from 'lucide-react';
import { ROUTES } from '../../utils/navigation';
import { getTrips, Trip } from '../../utils/api';
import { useScrollAnimation, useStaggeredAnimation } from '../../utils/useScrollAnimation';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement } from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardProps {
  onNavigate: (screen: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const [userTrips, setUserTrips] = useState<Trip[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  const welcomeRef = useScrollAnimation();
  const statsRef = useScrollAnimation();
  const actionsRef = useScrollAnimation();
  const contentRef = useScrollAnimation();
  const animatedStats = useStaggeredAnimation(4, 150);
  const animatedActions = useStaggeredAnimation(3, 200);

  // Add scroll animation hooks for charts
  const chartsHeaderRef = useScrollAnimation();
  const budgetChartRef = useScrollAnimation();
  const tripStatusChartRef = useScrollAnimation();
  const monthlyChartRef = useScrollAnimation();
  const destinationChartRef = useScrollAnimation();
  const animatedCharts = useStaggeredAnimation(4, 200);

  // Popular destinations data from CitySearch.tsx
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
    }
  ];

  // Calculate dashboard stats from actual user trips
  const calculateDashboardStats = (trips: Trip[]) => {
    if (trips.length === 0) {
      return {
        total_trips: 0,
        cities_visited: 0,
        travel_days: 0,
        shared_trips: 0,
        upcoming_trips: 0,
        completed_trips: 0,
        total_budget: 0,
        average_rating: 0
      };
    }

    const cities = new Set<string>();
    let totalDays = 0;
    let totalBudget = 0;
    let completedTrips = 0;
    let planningTrips = 0;
    let sharedTrips = 0;

    trips.forEach(trip => {
      if (trip.destinations) {
        const parts = trip.destinations.split(', ');
        if (parts.length >= 2) {
          cities.add(parts[0].trim());
        }
      }

      if (trip.start_date && trip.end_date) {
        const start = new Date(trip.start_date);
        const end = new Date(trip.end_date);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        totalDays += days;
      }

      if (trip.estimated_budget) {
        totalBudget += trip.estimated_budget;
      }

      // For now, assume trips with end dates in the past are completed
      if (trip.end_date) {
        const endDate = new Date(trip.end_date);
        if (endDate < new Date()) {
          completedTrips++;
        } else {
          planningTrips++;
        }
      }

      if (trip.is_public) {
        sharedTrips++;
      }
    });

    return {
      total_trips: trips.length,
      cities_visited: cities.size,
      travel_days: totalDays,
      shared_trips: sharedTrips,
      upcoming_trips: planningTrips,
      completed_trips: completedTrips,
      total_budget: totalBudget,
      average_rating: 4.7 // This would come from user reviews/ratings
    };
  };

  // Prepare chart data for budget analysis
  const prepareBudgetChartData = (trips: Trip[]) => {
    if (trips.length === 0) {
      return {
        labels: ['No trips yet'],
        datasets: [{
          label: 'Budget',
          data: [0],
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          tension: 0.4
        }]
      };
    }

    const sortedTrips = [...trips].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    
    return {
      labels: sortedTrips.map(trip => trip.title.length > 15 ? trip.title.substring(0, 15) + '...' : trip.title),
      datasets: [{
        label: 'Estimated Budget ($)',
        data: sortedTrips.map(trip => trip.estimated_budget || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }]
    };
  };

  // Prepare chart data for trip status distribution
  const prepareTripStatusData = (trips: Trip[]) => {
    if (trips.length === 0) {
      return {
        labels: ['No trips'],
        datasets: [{
          data: [1],
          backgroundColor: ['rgba(156, 163, 175, 0.8)'],
          borderColor: ['rgba(156, 163, 175, 1)'],
          borderWidth: 2
        }]
      };
    }

    const now = new Date();
    const completed = trips.filter(trip => trip.end_date && new Date(trip.end_date) < now).length;
    const upcoming = trips.filter(trip => trip.start_date && new Date(trip.start_date) > now).length;
    const ongoing = trips.filter(trip => {
      if (!trip.start_date || !trip.end_date) return false;
      const start = new Date(trip.start_date);
      const end = new Date(trip.end_date);
      return start <= now && end >= now;
    }).length;

    return {
      labels: ['Completed', 'Upcoming', 'Ongoing'],
      datasets: [{
        data: [completed, upcoming, ongoing],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)'
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(245, 158, 11, 1)'
        ],
        borderWidth: 2
      }]
    };
  };

  // Prepare chart data for destination breakdown
  const prepareDestinationData = (trips: Trip[]) => {
    if (trips.length === 0) {
      return {
        labels: ['No destinations'],
        datasets: [{
          data: [1],
          backgroundColor: ['rgba(156, 163, 175, 0.8)'],
          borderColor: ['rgba(156, 163, 175, 1)'],
          borderWidth: 2
        }]
      };
    }

    const destinationCounts: { [key: string]: number } = {};
    
    trips.forEach(trip => {
      if (trip.destinations) {
        const destinations = trip.destinations.split(',').map(d => d.trim());
        destinations.forEach(dest => {
          if (dest) {
            destinationCounts[dest] = (destinationCounts[dest] || 0) + 1;
          }
        });
      }
    });

    const sortedDestinations = Object.entries(destinationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8); // Top 8 destinations

    const colors = [
      'rgba(59, 130, 246, 0.8)',   // Blue
      'rgba(34, 197, 94, 0.8)',    // Green
      'rgba(245, 158, 11, 0.8)',   // Yellow
      'rgba(239, 68, 68, 0.8)',    // Red
      'rgba(147, 51, 234, 0.8)',   // Purple
      'rgba(236, 72, 153, 0.8)',   // Pink
      'rgba(16, 185, 129, 0.8)',   // Emerald
      'rgba(249, 115, 22, 0.8)'    // Orange
    ];

    return {
      labels: sortedDestinations.map(([dest]) => dest),
      datasets: [{
        data: sortedDestinations.map(([, count]) => count),
        backgroundColor: colors.slice(0, sortedDestinations.length),
        borderColor: colors.slice(0, sortedDestinations.length).map(color => color.replace('0.8', '1')),
        borderWidth: 2
      }]
    };
  };

  // Prepare chart data for monthly trip distribution
  const prepareMonthlyTripData = (trips: Trip[]) => {
    if (trips.length === 0) {
      return {
        labels: ['No trips'],
        datasets: [{
          label: 'Trips',
          data: [0],
          backgroundColor: 'rgba(147, 51, 234, 0.2)',
          borderColor: 'rgba(147, 51, 234, 1)',
          borderWidth: 2
        }]
      };
    }

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyCounts = new Array(12).fill(0);

    trips.forEach(trip => {
      if (trip.start_date) {
        const month = new Date(trip.start_date).getMonth();
        monthlyCounts[month]++;
      }
    });

    return {
      labels: monthNames,
      datasets: [{
        label: 'Trips Started',
        data: monthlyCounts,
        backgroundColor: 'rgba(147, 51, 234, 0.2)',
        borderColor: 'rgba(147, 51, 234, 1)',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false
      }]
    };
  };

  // Prepare budget insights and statistics
  const getBudgetInsights = (trips: Trip[]) => {
    if (trips.length === 0) {
      return {
        averageBudget: 0,
        highestBudget: 0,
        lowestBudget: 0,
        budgetTrend: 'stable',
        budgetEfficiency: 0
      };
    }

    const budgets = trips.map(trip => trip.estimated_budget || 0).filter(budget => budget > 0);
    
    if (budgets.length === 0) {
      return {
        averageBudget: 0,
        highestBudget: 0,
        lowestBudget: 0,
        budgetTrend: 'stable',
        budgetEfficiency: 0
      };
    }

    const averageBudget = budgets.reduce((sum, budget) => sum + budget, 0) / budgets.length;
    const highestBudget = Math.max(...budgets);
    const lowestBudget = Math.min(...budgets);
    
    // Calculate budget trend (comparing recent vs older trips)
    const sortedTrips = [...trips].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    const recentTrips = sortedTrips.slice(-Math.min(3, sortedTrips.length));
    const olderTrips = sortedTrips.slice(0, Math.min(3, sortedTrips.length));
    
    const recentAvg = recentTrips.reduce((sum, trip) => sum + (trip.estimated_budget || 0), 0) / recentTrips.length;
    const olderAvg = olderTrips.reduce((sum, trip) => sum + (trip.estimated_budget || 0), 0) / olderTrips.length;
    
    let budgetTrend = 'stable';
    if (recentAvg > olderAvg * 1.1) budgetTrend = 'increasing';
    else if (recentAvg < olderAvg * 0.9) budgetTrend = 'decreasing';

    // Budget efficiency (average budget per trip)
    const budgetEfficiency = averageBudget;

    return {
      averageBudget,
      highestBudget,
      lowestBudget,
      budgetTrend,
      budgetEfficiency
    };
  };

  useEffect(() => {
    fetchUserTrips();
  }, []);

  const fetchUserTrips = async () => {
    try {
      setIsLoadingStats(true);
      const trips = await getTrips(); // Get actual user trips
      console.log('Dashboard: Fetched user trips:', trips); // Debug log
      setUserTrips(trips);
    } catch (error) {
      console.error('Error fetching user trips:', error);
      // Use empty array if API fails
      setUserTrips([]);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleCreateTrip = () => {
    navigate(ROUTES.CREATE_TRIP);
  };

  const handleViewTrips = () => {
    navigate(ROUTES.TRIPS);
  };

  const handleUpcomingTripClick = (trip: Trip) => {
    localStorage.setItem('currentTrip', JSON.stringify(trip));
    navigate(ROUTES.ITINERARY_VIEW);
  };

  const handleExploreCities = () => {
    navigate(ROUTES.CITY_SEARCH);
  };

  const handleViewProfile = () => {
    navigate(ROUTES.PROFILE);
  };

  // Calculate stats from actual user trips
  const dashboardStats = calculateDashboardStats(userTrips);

  const stats = [
    { 
      label: 'Total Trips', 
      value: dashboardStats.total_trips.toString(), 
      icon: Plane, 
      color: 'text-primary-600', 
      bg: 'bg-primary-500/15',
      gradient: 'from-primary-500/100 to-primary-600',
      description: 'Adventures planned'
    },
    { 
      label: 'Cities Visited', 
      value: dashboardStats.cities_visited.toString(), 
      icon: MapPin, 
      color: 'text-success-600', 
      bg: 'bg-success-100',
      gradient: 'from-success-500 to-success-600',
      description: 'Destinations explored'
    },
    { 
      label: 'Travel Days', 
      value: dashboardStats.travel_days.toString(), 
      icon: Calendar, 
      color: 'text-accent-600', 
      bg: 'bg-accent-500/15',
      gradient: 'from-accent-500 to-accent-600',
      description: 'Days of adventure'
    },
    { 
      label: 'Shared Trips', 
      value: dashboardStats.shared_trips.toString(), 
      icon: Users, 
      color: 'text-warning-600', 
      bg: 'bg-warning-100',
      gradient: 'from-warning-500 to-warning-600',
      description: 'Trips shared with friends'
    }
  ];

  const getCostColor = (costIndex: number) => {
    if (costIndex < 100) return 'text-success-600';
    if (costIndex < 120) return 'text-warning-600';
    return 'text-error-600';
  };

  return (
    <div className="min-h-screen bg-gradient-secondary relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-500/15/10 rounded-full animate-pulse-slow blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        {/* Welcome Section */}
        <div 
          ref={welcomeRef.elementRef as React.RefObject<HTMLDivElement>}
          className={`mb-8 sm:mb-12 ${welcomeRef.isVisible ? 'animate-fade-in-down' : ''}`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4 group">
              <div className="relative">
                <img 
                  src="/assests/logo.png" 
                  alt="GlobeTrotter" 
                  className="h-16 w-16 sm:h-20 sm:w-20 drop-shadow-glass group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-accent-500/100 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-primary-500/100 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-heading mb-2 gradient-text">
                  Welcome back, Traveler!
                </h1>
                <p className="text-lg sm:text-xl text-body-muted flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-accent-500 animate-pulse" />
                  Ready to plan your next adventure?
                </p>
              </div>
            </div>
            
            {/* Quick Profile Access */}
            <button
              onClick={handleViewProfile}
              className="btn-secondary group flex items-center hover:shadow-glow"
            >
              <Globe className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              View Profile
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div 
          ref={statsRef.elementRef as React.RefObject<HTMLDivElement>}
          className={`grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12 ${statsRef.isVisible ? 'animate-fade-in-up' : ''}`}
        >
          {isLoadingStats ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="card p-6 shimmer-effect">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <div className="w-20 h-4 bg-secondary-200 rounded animate-pulse"></div>
                    <div className="w-16 h-8 bg-secondary-200 rounded animate-pulse"></div>
                    <div className="w-24 h-3 bg-secondary-200 rounded animate-pulse"></div>
                  </div>
                  <div className="w-12 h-12 bg-secondary-200 rounded-2xl animate-pulse"></div>
                </div>
              </div>
            ))
          ) : (
            stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={index} 
                  className={`card p-6 group hover:shadow-glow transition-all duration-500 transform ${
                    animatedStats[index] 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-body-muted">{stat.label}</p>
                      <p className="text-2xl sm:text-3xl font-bold text-heading">{stat.value}</p>
                      <p className="text-xs text-body-muted">{stat.description}</p>
                    </div>
                    <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-7 h-7 ${stat.color}`} />
                    </div>
                  </div>
                  
                  {/* Gradient accent line */}
                  <div className={`h-1 bg-gradient-to-r ${stat.gradient} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Actions */}
        <div 
          ref={actionsRef.elementRef as React.RefObject<HTMLDivElement>}
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 sm:mb-12 ${actionsRef.isVisible ? 'animate-fade-in-up' : ''}`}
        >
          {[
            {
              title: "Plan New Trip",
              description: "Create your next adventure",
              icon: Plus,
              gradient: "from-primary-500/100 to-primary-600",
              onClick: handleCreateTrip,
              delay: 0
            },
            {
              title: "Explore Cities",
              description: "Discover new destinations",
              icon: Compass,
              gradient: "from-success-500 to-success-600",
              onClick: handleExploreCities,
              delay: 1
            },
            {
              title: "View All Trips",
              description: "Manage your adventures",
              icon: Plane,
              gradient: "from-accent-500 to-accent-600",
              onClick: handleViewTrips,
              delay: 2
            }
          ].map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`group relative overflow-hidden rounded-2xl p-6 text-left glass-card border-glass-border-2 border-glass-border hover:border-primary-300 transition-all duration-500 transform hover:scale-105 hover:shadow-strong ${
                animatedActions[index] 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ 
                transitionDelay: `${action.delay * 200}ms`
              }}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <action.icon className={`w-8 h-8 ${action.gradient.includes('primary') ? 'text-primary-600' : action.gradient.includes('success') ? 'text-success-600' : 'text-accent-600'} opacity-95`} />
                  <ArrowRight className={`w-5 h-5 ${action.gradient.includes('primary') ? 'text-primary-600' : action.gradient.includes('success') ? 'text-success-600' : 'text-accent-600'} opacity-80 group-hover:translate-x-1 transition-transform duration-300`} />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${action.gradient.includes('primary') ? 'text-primary-600' : action.gradient.includes('success') ? 'text-success-600' : 'text-accent-600'}`}>{action.title}</h3>
                <p className="text-body-muted text-sm font-medium">{action.description}</p>
              </div>
              
              {/* Hover effect overlay */}
              <div className={`absolute inset-0 ${action.gradient.includes('primary') ? 'bg-primary-500/10' : action.gradient.includes('success') ? 'bg-success-50' : 'bg-accent-500/10'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            </button>
          ))}
        </div>

        <div 
          ref={contentRef.elementRef as React.RefObject<HTMLDivElement>}
          className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${contentRef.isVisible ? 'animate-fade-in-up' : ''}`}
        >
          {/* Upcoming Trips */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-glass-border">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-500/15 rounded-2xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-bold text-heading">Upcoming Trips</h2>
              </div>
              <button
                onClick={handleViewTrips}
                className="btn-secondary text-sm px-8 py-2 group flex"
              >
                <span>View All</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {isLoadingStats ? (
                // Loading skeleton for trips
                Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 rounded-xl border border-glass-border">
                    <div className="w-16 h-16 bg-secondary-200 rounded-xl animate-pulse flex-shrink-0"></div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="w-32 h-4 bg-secondary-200 rounded animate-pulse"></div>
                      <div className="w-24 h-3 bg-secondary-200 rounded animate-pulse"></div>
                      <div className="w-20 h-3 bg-secondary-200 rounded animate-pulse"></div>
                    </div>
                    <div className="w-20 h-6 bg-secondary-200 rounded-full animate-pulse flex-shrink-0"></div>
                  </div>
                ))
              ) : userTrips.length > 0 ? (
                userTrips.slice(0, 3).map((trip, index) => (
                  <div 
                    key={trip.id} 
                    className="group flex items-center space-x-4 p-4 rounded-xl border border-glass-border hover:border-primary-300 hover:shadow-medium transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
                    onClick={() => handleUpcomingTripClick(trip)}
                  >
                    <div className="relative">
                      <img
                        src={trip.cover_image || '/assests/geometric travel pattern wallpaper.jpg'}
                        alt={trip.title}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                        onError={(event) => { event.currentTarget.src = '/assests/geometric travel pattern wallpaper.jpg'; }}
                      />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500/100 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-heading text-base truncate group-hover:text-primary-600 transition-colors">
                        {trip.title}
                      </h3>
                      <p className="text-sm text-body-muted truncate flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {trip.destinations || 'Unknown Destination'}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Calendar className="w-4 h-4 text-body-muted" />
                        <span className="text-sm text-body-muted">
                          {trip.start_date ? new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'} - {trip.end_date ? new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Clock className="w-4 h-4 text-body-muted" />
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        trip.end_date && new Date(trip.end_date) < new Date() 
                          ? 'bg-success-100 text-success-800' 
                          : 'bg-warning-100 text-warning-800'
                      }`}>
                        {trip.end_date && new Date(trip.end_date) < new Date() ? 'Completed' : 'Planning'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-base-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-10 h-10 text-body-muted" />
                  </div>
                  <p className="text-body-muted text-lg mb-4">No upcoming trips</p>
                  <button
                    onClick={handleCreateTrip}
                    className="btn-primary group"
                  >
                    <Zap className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                    Plan your first trip
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Popular Destinations */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-glass-border">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-accent-500/15 rounded-2xl flex items-center justify-center">
                  <Globe className="w-5 h-5 text-accent-600" />
                </div>
                <h2 className="text-xl font-bold text-heading ">Popular Destinations</h2>
              </div>
              <button
                onClick={handleExploreCities}
                className="btn-secondary text-sm px-4 flex py-2 group"
              >
                <span>Explore</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {popularDestinations.map((destination, index) => (
                  <div 
                    key={destination.id} 
                    className="group glass-card rounded-xl border border-glass-border overflow-hidden hover:shadow-medium transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
                    onClick={() => navigate(`${ROUTES.CITY_SEARCH}?city=${encodeURIComponent(destination.name)}`)}
                  >
                    {/* Destination Image */}
                    <div className="relative h-28 overflow-hidden">
                      <img
                        src={destination.image}
                        alt={destination.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(event) => { event.currentTarget.src = '/assests/geometric travel pattern wallpaper.jpg'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-3 left-3 text-white">
                        <h4 className="text-sm font-bold">{destination.name}</h4>
                        <p className="text-xs opacity-90">{destination.country}</p>
                      </div>
                      
                      {/* Popularity badge */}
                      <div className="absolute top-2 right-2 glass-card rounded-full px-2 py-1">
                        <span className="text-xs font-semibold text-heading">{destination.popularity}%</span>
                      </div>
                    </div>
                    
                    {/* Destination Stats */}
                    <div className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-warning-500 fill-current" />
                          <span className="text-xs font-semibold text-heading">{destination.rating}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className={`w-3 h-3 ${getCostColor(destination.costIndex)}`} />
                          <span className="text-xs text-body-muted">{destination.dailyBudget}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Thermometer className="w-3 h-3 text-primary-500" />
                        <span className="text-xs text-body-muted">{destination.temperature}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Analytics Section */}
        <div className="mb-8 sm:mb-12">
          <div 
            ref={chartsHeaderRef.elementRef as React.RefObject<HTMLDivElement>}
            className={`flex items-center justify-between mb-6 transform transition-all duration-700 ${
              chartsHeaderRef.isVisible 
                ? 'animate-fade-in-up opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="flex items-center space-x-3 m-5">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500/100 to-accent-500/100 rounded-2xl flex items-center justify-center transform transition-all duration-500 hover:scale-110 hover:rotate-3">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-heading">Your Travel Analytics</h2>
            </div>
            <div className="flex items-center space-x-2 text-sm text-body-muted">
              <div className="w-3 h-3 bg-primary-500/100 rounded-full animate-pulse"></div>
              <span>Real-time data from your trips</span>
            </div>
          </div>

          {/* Chart Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Budget Analysis - Line Chart */}
            <div 
              ref={budgetChartRef.elementRef as React.RefObject<HTMLDivElement>}
              className={`lg:col-span-2 card p-6 transform transition-all duration-700 ${
                budgetChartRef.isVisible 
                  ? 'animate-fade-in-up opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '100ms' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-heading flex items-center group">
                  <DollarSign className="w-5 h-5 mr-2 text-primary-600 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                  Budget Analysis
                </h3>
                <span className="text-sm text-body-muted">
                  Total: ${dashboardStats.total_budget.toLocaleString()}
                </span>
              </div>
              <div className="h-64">
                <Line 
                  data={prepareBudgetChartData(userTrips)}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: 'rgba(59, 130, 246, 0.5)',
                        borderWidth: 1
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                          callback: (value) => {
                            return '$' + value.toLocaleString();
                          }
                        }
                      },
                      x: {
                        grid: {
                          color: 'rgba(0, 0, 0, 0.05)'
                        }
                      }
                    }
                  }}
                />
              </div>
              
              {/* Budget Insights Cards */}
              {userTrips.length > 0 && (
                <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {(() => {
                    const insights = getBudgetInsights(userTrips);
                    return (
                      <>
                        <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl transform transition-all duration-500 hover:scale-105 hover:shadow-medium">
                          <div className="text-lg font-bold text-primary-400">
                            ${insights.averageBudget.toLocaleString()}
                          </div>
                          <div className="text-xs text-primary-400">Average Budget</div>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl transform transition-all duration-500 hover:scale-105 hover:shadow-medium">
                          <div className="text-lg font-bold text-success-400">
                            ${insights.highestBudget.toLocaleString()}
                          </div>
                          <div className="text-xs text-success-400">Highest Budget</div>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl transform transition-all duration-500 hover:scale-105 hover:shadow-medium">
                          <div className="text-lg font-bold text-warning-400">
                            ${insights.lowestBudget.toLocaleString()}
                          </div>
                          <div className="text-xs text-warning-400">Lowest Budget</div>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl transform transition-all duration-500 hover:scale-105 hover:shadow-medium">
                          <div className="text-lg font-bold text-accent-400 capitalize">
                            {insights.budgetTrend}
                          </div>
                          <div className="text-xs text-accent-400">Budget Trend</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Trip Status Distribution - Pie Chart */}
            <div 
              ref={tripStatusChartRef.elementRef as React.RefObject<HTMLDivElement>}
              className={`card p-6 transform transition-all duration-700 ${
                tripStatusChartRef.isVisible 
                  ? 'animate-fade-in-up opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '300ms' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-heading flex items-center group">
                  <PieChart className="w-5 h-5 mr-2 text-success-600 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                  Trip Status
                </h3>
                <span className="text-sm text-body-muted">
                  {userTrips.length} total
                </span>
              </div>
              <div className="h-64 flex items-center justify-center">
                <Pie 
                  data={prepareTripStatusData(userTrips)}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          padding: 20,
                          usePointStyle: true
                        }
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white'
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Monthly Trip Distribution - Bar Chart */}
            <div 
              ref={monthlyChartRef.elementRef as React.RefObject<HTMLDivElement>}
              className={`card p-6 transform transition-all duration-700 ${
                monthlyChartRef.isVisible 
                  ? 'animate-fade-in-up opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '500ms' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-heading flex items-center group">
                  <LineChart className="w-5 h-5 mr-2 text-accent-600 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                  Monthly Trips
                </h3>
                <span className="text-sm text-body-muted">
                  {new Date().getFullYear()}
                </span>
              </div>
              <div className="h-64">
                <Bar 
                  data={prepareMonthlyTripData(userTrips)}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: 'rgba(147, 51, 234, 0.5)',
                        borderWidth: 1
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                          stepSize: 1
                        }
                      },
                      x: {
                        grid: {
                          color: 'rgba(0, 0, 0, 0.05)'
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Destination Breakdown - Doughnut Chart */}
          <div 
            ref={destinationChartRef.elementRef as React.RefObject<HTMLDivElement>}
            className={`mt-6 transform transition-all duration-700 ${
              destinationChartRef.isVisible 
                ? 'animate-fade-in-up opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '700ms' }}
          >
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-heading flex items-center group">
                  <MapPin className="w-5 h-5 mr-2 text-warning-600 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                  Top Destinations
                </h3>
                <span className="text-sm text-body-muted">
                  Based on trip frequency
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                <div className="h-80 flex items-center justify-center">
                  <Doughnut 
                    data={prepareDestinationData(userTrips)}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                          labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                              size: 12
                            }
                          }
                        },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          titleColor: 'white',
                          bodyColor: 'white'
                        }
                      },
                      cutout: '60%'
                    }}
                  />
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-primary-500/10 to-primary-100 rounded-xl transform transition-all duration-500 hover:scale-105 hover:shadow-medium">
                      <div className="text-2xl font-bold text-primary-600">{dashboardStats.cities_visited}</div>
                      <div className="text-sm text-primary-700">Cities Visited</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-success-50 to-success-100 rounded-xl transform transition-all duration-500 hover:scale-105 hover:shadow-medium">
                      <div className="text-2xl font-bold text-success-600">{dashboardStats.travel_days}</div>
                      <div className="text-sm text-success-700">Travel Days</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-accent-50 to-accent-100 rounded-xl transform transition-all duration-500 hover:scale-105 hover:shadow-medium">
                      <div className="text-2xl font-bold text-accent-600">{dashboardStats.shared_trips}</div>
                      <div className="text-sm text-accent-700">Shared Trips</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-warning-50 to-warning-100 rounded-xl transform transition-all duration-500 hover:scale-105 hover:shadow-medium">
                      <div className="text-2xl font-bold text-warning-600">{dashboardStats.completed_trips}</div>
                      <div className="text-sm text-warning-700">Completed</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
