import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Share, Copy, Calendar, MapPin, Clock, Download, Edit, GripVertical, MoreVertical, Eye, EyeOff, Check, BarChart3, PieChart, TrendingUp, DollarSign } from 'lucide-react';
import { ROUTES } from '../../utils/navigation';
import { 
  Trip, 
  ItineraryWithActivities, 
  Activity, 
  getTrip, 
  getItinerariesWithActivities 
} from '../../utils/api';
import { formatCurrencyForUser, formatTripBudget, getUserPreferredCurrency } from '../../utils/currency';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement } from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

interface ItineraryViewProps {
  onNavigate: (screen: any) => void;
}

const ItineraryView: React.FC<ItineraryViewProps> = ({ onNavigate }) => {
  const [viewMode, setViewMode] = useState<'timeline'>('timeline');
  const [isDragging, setIsDragging] = useState(false);
  const [draggedActivity, setDraggedActivity] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState<{[key: number]: boolean}>({});
  const [trip, setTrip] = useState<Trip | null>(null);
  const [itineraries, setItineraries] = useState<ItineraryWithActivities[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load trip and itinerary data
  useEffect(() => {
    const loadTripData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get trip data from localStorage
        const tripData = localStorage.getItem('currentTrip');
        if (!tripData) {
          navigate(ROUTES.TRIPS);
          return;
        }

        const parsedTrip = JSON.parse(tripData);
        setTrip(parsedTrip);

        // Fetch itinerary data with activities from the database
        const itineraryData = await getItinerariesWithActivities(parsedTrip.id);
        
        // Sort itineraries by date to ensure proper order
        const sortedItineraries = itineraryData.sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        setItineraries(sortedItineraries);
        
      } catch (error) {
        console.error('Error loading trip data:', error);
        setError('Failed to load trip data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTripData();
  }, [navigate]);

  const handleBackToTrips = () => {
    navigate(ROUTES.TRIPS);
  };

  const handleEditItinerary = () => {
    navigate(ROUTES.ITINERARY_BUILDER);
  };

  const handleShareItinerary = () => {
    if (trip?.is_public) {
      navigate(ROUTES.SHARED_ITINERARY);
    } else {
      alert('Make your trip public to share it with others');
    }
  };

  const activityTypes = {
    sightseeing: { color: 'bg-primary-950 text-primary-200', icon: '🏛️' },
    activity: { color: 'bg-success-950 text-success-200', icon: '🎯' },
    dining: { color: 'bg-warning-950 text-warning-200', icon: '🍽️' },
    accommodation: { color: 'bg-accent-950 text-accent-200', icon: '🏨' },
    museum: { color: 'bg-error-950 text-error-200', icon: '🎨' },
    transport: { color: 'bg-base-100 text-heading', icon: '🚗' },
    entertainment: { color: 'bg-accent-950 text-accent-200', icon: '🎭' },
    shopping: { color: 'bg-warning-950 text-warning-200', icon: '🛍️' },
    nature: { color: 'bg-success-950 text-success-200', icon: '🌿' },
    adventure: { color: 'bg-primary-950 text-primary-200', icon: '🏔️' }
  };

  const getActivityTypeStyle = (category: string) => {
    // Map database categories to display styles
    const categoryMap: { [key: string]: string } = {
      'sightseeing': 'sightseeing',
      'museum': 'museum',
      'restaurant': 'dining',
      'hotel': 'accommodation',
      'transport': 'transport',
      'entertainment': 'entertainment',
      'shopping': 'shopping',
      'nature': 'nature',
      'adventure': 'adventure',
      'activity': 'activity'
    };
    
    const mappedCategory = categoryMap[category.toLowerCase()] || 'activity';
    return activityTypes[mappedCategory as keyof typeof activityTypes] || activityTypes.activity;
  };

  const handleDragStart = (activityId: number) => {
    setIsDragging(true);
    setDraggedActivity(activityId);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedActivity(null);
  };

  const toggleActivityDetails = (activityId: number) => {
    setShowDetails(prev => ({
      ...prev,
      [activityId]: !prev[activityId]
    }));
  };

  const [showShareSuccess, setShowShareSuccess] = useState(false);
  const [showCostAnalysis, setShowCostAnalysis] = useState(false);

  const handleShare = async () => {
    if (!trip) return;
    
    if (!trip.is_public) {
      alert('Make your trip public to share it with others');
      return;
    }

    const shareUrl = `${window.location.origin}/shared-trip/${trip.id}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowShareSuccess(true);
      setTimeout(() => setShowShareSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback: try to copy using a temporary textarea
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setShowShareSuccess(true);
        setTimeout(() => setShowShareSuccess(false), 3000);
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
        alert('Failed to copy link. Please copy manually: ' + shareUrl);
      }
      document.body.removeChild(textArea);
    }
  };

  const copyToClipboard = () => {
    handleShare();
  };

  // Cost Analysis Functions
  const getTotalCost = () => {
    return itineraries.reduce((total, day) => 
      total + day.activities.reduce((dayTotal, activity) => 
        dayTotal + (activity.cost_amount || 0), 0), 0);
  };

  const getAverageCostPerDay = () => {
    if (tripDays.length === 0) return 0;
    return getTotalCost() / tripDays.length;
  };

  const getCostByCategory = () => {
    const categoryCosts: { [key: string]: number } = {};
    
    itineraries.forEach(day => {
      day.activities.forEach(activity => {
        const category = activity.category || 'Other';
        categoryCosts[category] = (categoryCosts[category] || 0) + (activity.cost_amount || 0);
      });
    });
    
    return categoryCosts;
  };

  const getCostByDay = () => {
    return tripDays.map((day, index) => {
      const dayCost = day.activities.reduce((total, activity) => 
        total + (activity.cost_amount || 0), 0);
      return {
        day: `Day ${index + 1}`,
        cost: dayCost,
        date: day.date
      };
    });
  };

  const getTopExpensiveActivities = () => {
    const allActivities: Array<{name: string, cost: number, day: string, category: string}> = [];
    
    tripDays.forEach((day, dayIndex) => {
      day.activities.forEach(activity => {
        allActivities.push({
          name: activity.name,
          cost: activity.cost_amount || 0,
          day: `Day ${dayIndex + 1}`,
          category: activity.category
        });
      });
    });
    
    return allActivities
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5);
  };

  // Chart Data Preparation
  const prepareCategoryChartData = () => {
    const categoryCosts = getCostByCategory();
    const userCurrency = getUserPreferredCurrency();
    
    const labels = Object.keys(categoryCosts);
    const data = Object.values(categoryCosts).map(cost => 
      convertCurrency(cost, 'USD', userCurrency)
    );
    
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ];
    
    return {
      labels,
      datasets: [{
        data,
        backgroundColor: colors.slice(0, labels.length),
        borderColor: colors.slice(0, labels.length),
        borderWidth: 2,
      }]
    };
  };

  const prepareDailyCostChartData = () => {
    const dailyCosts = getCostByDay();
    const userCurrency = getUserPreferredCurrency();
    
    return {
      labels: dailyCosts.map(d => d.day),
      datasets: [{
        label: `Cost per Day (${userCurrency})`,
        data: dailyCosts.map(d => convertCurrency(d.cost, 'USD', userCurrency)),
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        tension: 0.1,
      }]
    };
  };

  const prepareTopActivitiesChartData = () => {
    const topActivities = getTopExpensiveActivities();
    const userCurrency = getUserPreferredCurrency();
    
    return {
      labels: topActivities.map(a => a.name.substring(0, 15) + (a.name.length > 15 ? '...' : '')),
      datasets: [{
        label: `Cost (${userCurrency})`,
        data: topActivities.map(a => convertCurrency(a.cost, 'USD', userCurrency)),
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
      }]
    };
  };

  const formatDuration = (minutes: number | null | undefined) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h ${remainingMinutes}min`;
  };

  const formatCost = (amount: number | null | undefined, currency: string) => {
    if (amount === null || amount === undefined) return 'N/A';
    return formatCurrencyForUser(amount, currency, getUserPreferredCurrency());
  };

  // Helper function to calculate the date for each day based on trip start date
  const getDayDate = (dayIndex: number): Date => {
    if (!trip?.start_date) return new Date();
    const startDate = new Date(trip.start_date);
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + dayIndex);
    return currentDate;
  };

  // Helper function to format the date for display
  const formatDayDate = (dayIndex: number): string => {
    const date = getDayDate(dayIndex);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  // Calculate the actual trip duration in days
  const getTripDuration = () => {
    if (!trip?.start_date || !trip?.end_date) return 0;
    const startDate = new Date(trip.start_date);
    const endDate = new Date(trip.end_date);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 because both start and end dates are inclusive
  };

  // Generate the correct number of days based on trip duration
  const generateTripDays = () => {
    const tripDuration = getTripDuration();
    const days = [];
    
    for (let i = 0; i < tripDuration; i++) {
      const dayDate = getDayDate(i);
      const existingItinerary = itineraries.find(itin => {
        const itinDate = new Date(itin.date);
        return itinDate.toDateString() === dayDate.toDateString();
      });
      
      if (existingItinerary) {
        days.push(existingItinerary);
      } else {
        // Create a placeholder day if no itinerary exists
        days.push({
          id: `day-${i}`,
          trip_id: trip?.id || 0,
          date: dayDate.toISOString().split('T')[0],
          city: trip?.destinations?.split(',')[0]?.trim() || 'Unknown City',
          details: null,
          activities: []
        });
      }
    }
    
    return days;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-body-muted">Loading trip data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-error-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-xl font-medium mr-4"
          >
            Retry
          </button>
          <button
            onClick={() => navigate(ROUTES.TRIPS)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-xl font-medium"
          >
            Back to Trips
          </button>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-body-muted">No trip data found. Please select a trip from your trips list.</p>
          <button
            onClick={() => onNavigate(ROUTES.TRIPS)}
            className="mt-4 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-xl font-medium"
          >
            Back to Trips
          </button>
        </div>
      </div>
    );
  }

  // Generate the correct trip days based on trip duration
  const tripDays = generateTripDays();
  
  if (tripDays.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-heading mb-4">{trip.title}</h1>
          <p className="text-body-muted mb-6">No itinerary has been created for this trip yet.</p>
          <div className="mb-6">
            <p className="text-sm text-body-muted">
              Trip Duration: {trip.start_date && trip.end_date ? 
                `${getTripDuration()} days` : 
                'Dates not set'
              }
            </p>
          </div>
          <button
            onClick={handleEditItinerary}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-xl font-medium"
          >
            Create Itinerary
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={handleBackToTrips}
            className="p-2 hover:bg-base-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-body-muted" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-heading">{trip.title}</h1>
            <p className="text-body-muted mt-1">{trip.description || 'Your amazing adventure'}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowCostAnalysis(!showCostAnalysis)}
              className={`${
                showCostAnalysis 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'bg-gray-600 hover:bg-gray-700'
              } text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 transition-colors`}
              title="View cost breakdown and analytics"
            >
              <BarChart3 className="w-4 h-4" />
              <span>{showCostAnalysis ? 'Hide' : 'Cost'} Analysis</span>
            </button>
            <button 
              onClick={handleShare}
              className={`${
                showShareSuccess 
                  ? 'bg-success-600 hover:bg-green-700' 
                  : 'bg-teal-600 hover:bg-teal-700'
              } text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 transition-colors`}
              title={trip.is_public ? `Share URL: ${window.location.origin}/shared-trip/${trip.id}` : 'Make trip public to share'}
            >
              {showShareSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Share className="w-4 h-4" />
                  <span>Share</span>
                </>
              )}
            </button>
            <button
              onClick={handleEditItinerary}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
          </div>
        </div>

        {/* Trip Hero */}
        <div className="relative h-64 rounded-2xl overflow-hidden mb-8">
          <img
            src={trip.cover_image || 'https://images.pexels.com/photos/1194713/pexels-photo-1194713.jpeg?auto=compress&cs=tinysrgb&w=800'}
            alt={trip.title}
              onError={(event) => { event.currentTarget.src = '/assests/geometric travel pattern wallpaper.jpg'; }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          <div className="absolute bottom-6 left-6 text-white">
            <div className="flex items-center space-x-4 mb-2">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">
                  {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span className="font-medium">{trip.destinations || 'Multiple destinations'}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4 mb-2">
              <span className="text-lg font-medium">
                Duration: {getTripDuration()} days
              </span>
              <span className="text-lg font-medium">
                {itineraries.length} itinerary days planned
              </span>
            </div>
            <p className="text-2xl font-bold">
              {trip.estimated_budget != null ? formatTripBudget(trip.estimated_budget) : formatTripBudget(getTotalCost())} Total Budget
            </p>
          </div>
        </div>

        {/* Trip Info */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {trip.is_public && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success-500/100 rounded-full"></div>
                <span className="text-sm text-success-400 font-medium">Public Trip</span>
                <span className="text-xs text-body-muted">
                  Share URL: {window.location.origin}/shared-trip/{trip.id}
                </span>
              </div>
            )}
            <div className="text-sm text-body-muted bg-primary-950 px-3 py-2 rounded-lg">
              <span className="font-medium">Note:</span> Showing {getTripDuration()} days from {trip.start_date} to {trip.end_date}
            </div>
          </div>
        </div>
      </div>

      {/* Cost Analysis Section */}
      {showCostAnalysis && (
        <div className="mb-8 glass-card rounded-2xl shadow-sm border border-glass-border p-6">
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="w-6 h-6 text-accent-400" />
            <h2 className="text-2xl font-bold text-heading">Cost Analysis</h2>
          </div>

          {/* Cost Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-primary-400 font-medium">Total Cost</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrencyForUser(getTotalCost(), 'USD', getUserPreferredCurrency())}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-success-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-success-400 font-medium">Average per Day</p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrencyForUser(getAverageCostPerDay(), 'USD', getUserPreferredCurrency())}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-accent-400 font-medium">Activities</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {tripDays.reduce((total, day) => total + day.activities.length, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cost by Category - Pie Chart */}
            <div className="bg-base-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-heading mb-4 flex items-center space-x-2">
                <PieChart className="w-5 h-5 text-primary-400" />
                <span>Cost by Category</span>
              </h3>
              <div className="h-64">
                <Pie 
                  data={prepareCategoryChartData()} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          padding: 20,
                          usePointStyle: true,
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${formatCurrencyForUser(value, getUserPreferredCurrency(), getUserPreferredCurrency())} (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Daily Cost Trend - Line Chart */}
            <div className="bg-base-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-heading mb-4 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-success-400" />
                <span>Daily Cost Trend</span>
              </h3>
              <div className="h-64">
                <Line 
                  data={prepareDailyCostChartData()} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `${context.dataset.label}: ${formatCurrencyForUser(context.parsed.y, getUserPreferredCurrency(), getUserPreferredCurrency())}`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return formatCurrencyForUser(value as number, getUserPreferredCurrency(), getUserPreferredCurrency());
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Top Expensive Activities - Bar Chart */}
            <div className="bg-base-50 rounded-xl p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-heading mb-4 flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-warning-400" />
                <span>Top Expensive Activities</span>
              </h3>
              <div className="h-64">
                <Bar 
                  data={prepareTopActivitiesChartData()} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `${context.dataset.label}: ${formatCurrencyForUser(context.parsed.y, getUserPreferredCurrency(), getUserPreferredCurrency())}`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return formatCurrencyForUser(value as number, getUserPreferredCurrency(), getUserPreferredCurrency());
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Cost Breakdown Table */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-heading mb-4">Detailed Cost Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-glass-border">
                    <th className="text-left py-3 px-4 font-medium text-heading">Day</th>
                    <th className="text-left py-3 px-4 font-medium text-heading">Activity</th>
                    <th className="text-left py-3 px-4 font-medium text-heading">Category</th>
                    <th className="text-right py-3 px-4 font-medium text-heading">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {tripDays.map((day, dayIndex) => 
                    day.activities.map((activity, activityIndex) => (
                      <tr key={`${dayIndex}-${activityIndex}`} className="border-b border-glass-border hover:bg-base-50">
                        <td className="py-3 px-4 text-heading font-medium">Day {dayIndex + 1}</td>
                        <td className="py-3 px-4 text-heading">{activity.name}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityTypeStyle(activity.category).color}`}>
                            {activity.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-success-400">
                          {formatCurrencyForUser(activity.cost_amount || 0, activity.currency || 'USD', getUserPreferredCurrency())}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="space-y-8">
          {tripDays.map((day, dayIndex) => (
            <div key={day.id} className="relative">
              {/* Timeline Line */}
              {dayIndex !== tripDays.length - 1 && (
                <div className="absolute left-8 top-20 w-0.5 h-full bg-base-200"></div>
              )}

              {/* Day Header */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center relative z-10">
                  <span className="text-white font-bold">{dayIndex + 1}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-heading">Day {dayIndex + 1}</h2>
                  <div className="flex items-center space-x-4 text-body-muted">
                    <div className="flex flex-col">
                      <span className="font-medium">{formatDayDate(dayIndex)}</span>
                      {day.id.toString().startsWith('day-') ? (
                        <span className="text-xs text-orange-500">
                          No itinerary planned
                        </span>
                      ) : (
                        <span className="text-xs text-body-muted">
                          DB Date: {new Date(day.date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {day.city && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{day.city}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Activities */}
              <div className="ml-20 space-y-4">
                {day.id.toString().startsWith('day-') ? (
                  <div className="text-center py-8 text-body-muted bg-base-50 rounded-lg border-2 border-dashed border-glass-border">
                    <p className="text-body-muted mb-2">No itinerary planned for this day</p>
                    <button
                      onClick={handleEditItinerary}
                      className="text-primary-400 hover:text-primary-400 text-sm font-medium"
                    >
                      Plan activities →
                    </button>
                  </div>
                ) : day.activities.length === 0 ? (
                  <div className="text-center py-8 text-body-muted">
                    <p>No activities planned for this day</p>
                  </div>
                ) : (
                  day.activities.map((activity) => {
                    const activityStyle = getActivityTypeStyle(activity.category);
                    return (
                      <div 
                        key={activity.id} 
                        className={`glass-card rounded-xl shadow-sm border border-glass-border p-6 hover:shadow-md transition-all ${
                          isDragging && draggedActivity === activity.id ? 'opacity-50 scale-95' : ''
                        }`}
                        draggable
                        onDragStart={() => handleDragStart(activity.id)}
                        onDragEnd={handleDragEnd}
                      >
                        <div className="flex items-start space-x-4">
                          <GripVertical className="w-5 h-5 text-body-muted cursor-grab mt-1" />
                          <img
                            src={activity.image_url || 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=300'}
                            alt={activity.name}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{activityStyle.icon}</span>
                                <h3 className="text-lg font-semibold text-heading">{activity.name}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${activityStyle.color}`}>
                                  {activity.category}
                                </span>
                                {activity.subcategory && (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-base-100 text-heading">
                                    {activity.subcategory}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-lg font-bold text-success-400">
                                  {formatCost(activity.cost_amount, activity.currency)}
                                </span>
                                <button
                                  onClick={() => toggleActivityDetails(activity.id)}
                                  className="p-1 hover:bg-base-100 rounded"
                                >
                                  {showDetails[activity.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>
                            
                            <p className="text-body-muted mb-3">{activity.description || 'No description available'}</p>
                            
                            <div className="flex items-center space-x-6 text-sm text-body-muted">
                              {activity.time && (
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{activity.time}</span>
                                </div>
                              )}
                              {activity.duration_minutes && (
                                <span>Duration: {formatDuration(activity.duration_minutes)}</span>
                              )}
                              {activity.location && (
                                <div className="flex items-center space-x-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{activity.location}</span>
                                </div>
                              )}
                            </div>

                            {/* Expandable Details */}
                            {showDetails[activity.id] && (
                              <div className="mt-4 p-4 bg-base-50 rounded-lg">
                                {activity.notes && (
                                  <>
                                    <h4 className="font-medium text-heading mb-2">Notes & Tips</h4>
                                    <p className="text-sm text-body-muted mb-3">{activity.notes}</p>
                                  </>
                                )}
                                
                                {/* Additional Activity Details */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  {activity.rating && (
                                    <div>
                                      <span className="font-medium">Rating: </span>
                                      <span className="text-warning-400">★ {activity.rating}/5</span>
                                      {activity.total_reviews > 0 && (
                                        <span className="text-body-muted ml-1">({activity.total_reviews} reviews)</span>
                                      )}
                                    </div>
                                  )}
                                  {activity.difficulty_level && (
                                    <div>
                                      <span className="font-medium">Difficulty: </span>
                                      <span className="capitalize">{activity.difficulty_level}</span>
                                    </div>
                                  )}
                                  {activity.age_restriction && (
                                    <div>
                                      <span className="font-medium">Age: </span>
                                      <span>{activity.age_restriction}</span>
                                    </div>
                                  )}
                                  {activity.booking_required && (
                                    <div>
                                      <span className="font-medium">Booking: </span>
                                      <span className="text-warning-400">Required</span>
                                    </div>
                                  )}
                                </div>

                                <div className="mt-3 flex items-center space-x-3">
                                  {activity.latitude && activity.longitude && (
                                    <button className="text-primary-400 hover:text-primary-400 text-sm font-medium">
                                      View on Map
                                    </button>
                                  )}
                                  {activity.booking_url && (
                                    <a 
                                      href={activity.booking_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-primary-400 hover:text-primary-400 text-sm font-medium"
                                    >
                                      Book Now
                                    </a>
                                  )}
                                  <button className="text-primary-400 hover:text-primary-400 text-sm font-medium">
                                    Add to Favorites
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ItineraryView;
