import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, MapPin, Clock, GripVertical, Trash2, Edit, Save, Loader2, RefreshCw, AlertTriangle, BarChart3, PieChart, TrendingUp, DollarSign } from 'lucide-react';
import { ROUTES } from '../../utils/navigation';
import { 
  Trip, 
  Itinerary, 
  Activity, 
  getTrip, 
  updateTrip, 
  getItineraries, 
  createItinerary, 
  updateItinerary, 
  deleteItinerary,
  getActivities,
  createActivity,
  deleteActivity
} from '../../utils/api';
import { formatCurrencyForUser, getUserPreferredCurrency, convertCurrency, formatCurrency, getTripBudgetAmount } from '../../utils/currency';
import ActivitySelectionModal from './ActivitySelectionModal';
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

interface ItineraryBuilderProps {
  onNavigate: (screen: any) => void;
}

interface Day {
  id?: number;
  date: string;
  city: string;
  activities: Activity[];
  isNew?: boolean;
}

const ItineraryBuilder: React.FC<ItineraryBuilderProps> = ({ onNavigate }) => {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [itinerary, setItinerary] = useState<Day[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [selectedDayForActivity, setSelectedDayForActivity] = useState<number>(0);
  const [budgetWarningModal, setBudgetWarningModal] = useState(false);
  const [exceedingActivity, setExceedingActivity] = useState<any>(null);
  const [showCostAnalysis, setShowCostAnalysis] = useState(false);
  const navigate = useNavigate();

  // Load trip and itinerary data
  useEffect(() => {
    const loadTripData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const tripData = localStorage.getItem('currentTrip');
        if (!tripData) {
          console.error('No trip data in localStorage');
          navigate(ROUTES.TRIPS);
          return;
        }

        console.log('Raw trip data from localStorage:', tripData);
        
        const parsedTrip = JSON.parse(tripData);
        console.log('Parsed trip data:', parsedTrip);
        
        const tripId = parsedTrip.id;
        if (!tripId) {
          console.error('No trip ID in parsed trip data:', parsedTrip);
          setError('Invalid trip data. Please try refreshing the page.');
          return;
        }
        
        console.log('Loading trip with ID:', tripId);
        
        // Load trip from database
        const tripFromDb = await getTrip(tripId);
        console.log('Loaded trip from DB:', tripFromDb);
        setTrip(tripFromDb);
        
        // Load itineraries from database
        const itineraries = await getItineraries(tripId);
        console.log('Loaded itineraries:', itineraries);
        
        // Generate days based on trip dates and existing itineraries
        const startDate = new Date(tripFromDb.start_date);
        const endDate = new Date(tripFromDb.end_date);
        const days: Day[] = [];
        
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          const existingItinerary = itineraries.find(i => i.date === dateStr);
          
          if (existingItinerary) {
            // Load activities for this itinerary
            const activities = await getActivities(existingItinerary.id);
            days.push({
              id: existingItinerary.id,
              date: dateStr,
              city: existingItinerary.city || tripFromDb.destinations?.split(',')[0]?.trim() || 'Unknown City',
              activities: activities
            });
          } else {
            days.push({
              date: dateStr,
              city: tripFromDb.destinations?.split(',')[0]?.trim() || 'Unknown City',
              activities: [],
              isNew: true
            });
          }
        }
        
        setItinerary(days);
        console.log('Generated days:', days);
      } catch (error) {
        console.error('Error loading trip data:', error);
        setError('Failed to load trip data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTripData();
  }, [navigate]);



  const activityTypes = [
    { type: 'sightseeing', color: 'bg-primary-950 text-primary-200', icon: '🏛️' },
    { type: 'activity', color: 'bg-success-950 text-success-200', icon: '🎯' },
    { type: 'dining', color: 'bg-warning-950 text-warning-200', icon: '🍽️' },
    { type: 'accommodation', color: 'bg-accent-950 text-accent-200', icon: '🏨' },
    { type: 'transport', color: 'bg-base-200 text-heading', icon: '🚗' },
    { type: 'museum', color: 'bg-error-950 text-error-200', icon: '🎨' }
  ];

  const getActivityStyle = (type: string) => {
    return activityTypes.find(t => t.type === type) || activityTypes[0];
  };

  const saveItinerary = async () => {
    console.log('saveItinerary called, trip object:', trip);
    
    if (!trip) {
      console.error('No trip data available');
      setError('No trip data available. Please try refreshing the page.');
      return;
    }

    if (!trip.id) {
      console.error('Trip object has no ID:', trip);
      setError('Trip data is incomplete. Please try refreshing the page.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      console.log('Saving itinerary for trip:', trip.id, trip.title);

      // Save all new itineraries and update existing ones
      for (const day of itinerary) {
        if (day.isNew && !day.id) {
          console.log('Creating new itinerary for day:', day.date, 'trip_id:', trip.id);
          // Create new itinerary
          const itineraryData = {
            trip_id: trip.id,
            date: day.date,
            city: day.city
          };
          console.log('Sending itinerary data:', itineraryData);
          
          await createItinerary(itineraryData);
        } else if (day.id) {
          // Update existing itinerary
          await updateItinerary(day.id, {
            date: day.date,
            city: day.city
          });
        }
      }

      // Update trip with new end date if needed
      const lastDay = itinerary[itinerary.length - 1];
      if (lastDay && lastDay.date !== trip.end_date) {
        await updateTrip(trip.id, {
          ...trip,
          end_date: lastDay.date
        });
        setTrip(prev => prev ? { ...prev, end_date: lastDay.date } : null);
      }

      // Clear isNew flags
      setItinerary(prev => prev.map(day => ({ ...day, isNew: false })));
      
    } catch (error) {
      console.error('Error saving itinerary:', error);
      setError('Failed to save itinerary. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const addNewDay = async () => {
    console.log('addNewDay called, trip object:', trip);
    
    if (!trip) {
      console.error('No trip data available in addNewDay');
      setError('No trip data available. Please try refreshing the page.');
      return;
    }

    if (!trip.id) {
      console.error('Trip object has no ID in addNewDay:', trip);
      setError('Trip data is incomplete. Please try refreshing the page.');
      return;
    }

    try {
      console.log('Adding new day for trip:', trip.id, trip.title);
      
      // Calculate the next date after the last day
      const lastDay = itinerary[itinerary.length - 1];
      const lastDate = new Date(lastDay.date);
      const nextDate = new Date(lastDate);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const newDateStr = nextDate.toISOString().split('T')[0];
      
      const itineraryData = {
        trip_id: trip.id,
        date: newDateStr,
        city: 'New City'
      };
      
      console.log('Creating new itinerary with data:', itineraryData);
      
      // Create new itinerary in database
      const newItinerary = await createItinerary(itineraryData);

      const newDay: Day = {
        id: newItinerary.id,
        date: newDateStr,
        city: 'New City',
        activities: []
      };

      setItinerary([...itinerary, newDay]);
      
      // Update trip end date
      await updateTrip(trip.id, {
        ...trip,
        end_date: newDateStr
      });
      
      // Update local trip state
      setTrip(prev => prev ? { ...prev, end_date: newDateStr } : null);
      
    } catch (error) {
      console.error('Error adding new day:', error);
      setError('Failed to add new day. Please try again.');
    }
  };

  const addActivityToDay = async (dayIndex: number, activityData: any) => {
    if (!trip || !itinerary[dayIndex]) return;

    try {
      const day = itinerary[dayIndex];
      
      // Calculate the cost of the new activity in USD (assuming activityData.price is in USD)
      const newActivityCostUSD = parseFloat(activityData.price.replace('$', ''));
      
      // Get user's preferred currency for budget comparison
      const userCurrency = getUserPreferredCurrency();
      
      // Convert new activity cost to user's preferred currency
      const newActivityCostInUserCurrency = convertCurrency(newActivityCostUSD, 'USD', userCurrency);
      
      // Calculate current total trip cost in user's preferred currency
      const currentTotalCost = getTotalTripCost();
      
      // Convert trip budget to user's preferred currency if it exists
      let tripBudgetInUserCurrency = 0;
      if (trip.estimated_budget) {
        // Assuming trip budget is stored in USD, convert to user currency
        tripBudgetInUserCurrency = getTripBudgetAmount(trip.estimated_budget);
      }
      
      // Check if adding this activity would exceed the budget
      if (tripBudgetInUserCurrency > 0 && (currentTotalCost + newActivityCostInUserCurrency) > tripBudgetInUserCurrency) {
        // Show budget warning modal
        setExceedingActivity({
          ...activityData,
          dayIndex,
          wouldExceedBy: (currentTotalCost + newActivityCostInUserCurrency) - tripBudgetInUserCurrency
        });
        setBudgetWarningModal(true);
        return;
      }
      
      // If budget check passes, add the activity
      await addActivityWithoutBudgetCheck(dayIndex, activityData);

    } catch (error) {
      console.error('Error adding activity:', error);
      setError('Failed to add activity. Please try again.');
    }
  };

  const addActivityWithoutBudgetCheck = async (dayIndex: number, activityData: any) => {
    if (!trip || !itinerary[dayIndex]) return;

    try {
      const day = itinerary[dayIndex];
      
      // Create a temporary activity object for local state
      const tempActivity: Activity = {
        id: Date.now(), // Temporary ID for local state
        itinerary_id: day.id || 0,
        name: activityData.title,
        description: activityData.description,
        category: activityData.type.toLowerCase(),
        location: activityData.city,
        duration_minutes: parseInt(activityData.duration.split(' ')[0]) * 60, // Convert hours to minutes
        cost_amount: parseFloat(activityData.price.replace('$', '')),
        currency: 'USD', // Store original currency
        image_url: activityData.image,
        is_featured: false,
        time: '09:00', // Default time
        notes: activityData.highlights?.join(', ') || '',
        booking_required: false,
        current_bookings: 0,
        total_reviews: activityData.reviews || 0,
        is_active: true,
        created_at: new Date().toISOString(),
        rating: activityData.rating || 0
      };

      // Update local state immediately
      const updatedItinerary = [...itinerary];
      updatedItinerary[dayIndex].activities.push(tempActivity);
      setItinerary(updatedItinerary);

      // If the day has an ID, try to save to database
      if (day.id) {
        try {
          const newActivity = await createActivity({
            itinerary_id: day.id,
            name: activityData.title,
            description: activityData.description,
            category: activityData.type.toLowerCase(),
            location: activityData.city,
            duration_minutes: parseInt(activityData.duration.split(' ')[0]) * 60,
            cost_amount: parseFloat(activityData.price.replace('$', '')),
            currency: 'USD', // Store original currency in database
            image_url: activityData.image,
            is_featured: false
          });

          // Update the temporary activity with the real ID
          const finalItinerary = [...updatedItinerary];
          const activityIndex = finalItinerary[dayIndex].activities.findIndex(a => a.id === tempActivity.id);
          if (activityIndex !== -1) {
            finalItinerary[dayIndex].activities[activityIndex] = { ...tempActivity, id: newActivity.id };
            setItinerary(finalItinerary);
          }
        } catch (dbError) {
          console.error('Error saving activity to database:', dbError);
          // Activity is already in local state, so we don't need to show an error
        }
      }

    } catch (error) {
      console.error('Error adding activity:', error);
      setError('Failed to add activity. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getTotalDayCost = (activities: Activity[]) => {
    const userCurrency = getUserPreferredCurrency();
    return activities.reduce((total, activity) => {
      // Convert activity cost to user's preferred currency
      const convertedAmount = convertCurrency(
        activity.cost_amount || 0, 
        activity.currency || 'USD', 
        userCurrency
      );
      return total + convertedAmount;
    }, 0);
  };

  const getTotalTripCost = () => {
    return itinerary.reduce((total, day) => {
      const dayCost = getTotalDayCost(day.activities);
      return total + dayCost;
    }, 0);
  };

  // Cost Analysis Functions
  const getAverageCostPerDay = () => {
    if (itinerary.length === 0) return 0;
    return getTotalTripCost() / itinerary.length;
  };

  const getCostByCategory = () => {
    const categoryCosts: { [key: string]: number } = {};
    
    itinerary.forEach(day => {
      day.activities.forEach(activity => {
        const category = activity.category || 'Other';
        const userCurrency = getUserPreferredCurrency();
        const convertedCost = convertCurrency(activity.cost_amount || 0, activity.currency || 'USD', userCurrency);
        categoryCosts[category] = (categoryCosts[category] || 0) + convertedCost;
      });
    });
    
    return categoryCosts;
  };

  const getCostByDay = () => {
    return itinerary.map((day, index) => {
      const dayCost = getTotalDayCost(day.activities);
      return {
        day: `Day ${index + 1}`,
        cost: dayCost,
        date: day.date
      };
    });
  };

  const getTopExpensiveActivities = () => {
    const allActivities: Array<{name: string, cost: number, day: string, category: string}> = [];
    
    itinerary.forEach((day, dayIndex) => {
      day.activities.forEach(activity => {
        const userCurrency = getUserPreferredCurrency();
        const convertedCost = convertCurrency(activity.cost_amount || 0, activity.currency || 'USD', userCurrency);
        allActivities.push({
          name: activity.name,
          cost: convertedCost,
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
    
    const hasCosts = Object.keys(categoryCosts).length > 0;
    const labels = hasCosts ? Object.keys(categoryCosts) : ['No activity costs yet'];
    const data = hasCosts ? Object.values(categoryCosts) : [0];
    
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ];
    
    return {
      labels,
      datasets: [{
        data,
        backgroundColor: hasCosts ? colors.slice(0, labels.length) : ['#94A3B8'],
        borderColor: hasCosts ? colors.slice(0, labels.length) : ['#64748B'],
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
        data: dailyCosts.length > 0 ? dailyCosts.map(d => d.cost) : [0],
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
      labels: topActivities.length > 0
        ? topActivities.map(a => a.name.substring(0, 15) + (a.name.length > 15 ? '...' : ''))
        : ['No activities yet'],
      datasets: [{
        label: `Cost (${userCurrency})`,
        data: topActivities.length > 0 ? topActivities.map(a => a.cost) : [0],
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
      }]
    };
  };

  const removeActivity = async (dayIndex: number, activityId: number) => {
    try {
      // Delete from database
      try {
        await deleteActivity(activityId);
      } catch (deleteError: any) {
        // If the activity doesn't exist in the database, just continue
        // This can happen if the frontend state is out of sync
        if (deleteError.message?.includes('404') || deleteError.message?.includes('not found')) {
          console.warn(`Activity ${activityId} not found in database, removing from local state only`);
        } else {
          throw deleteError;
        }
      }

      // Update local state
      const updatedItinerary = [...itinerary];
      updatedItinerary[dayIndex].activities = updatedItinerary[dayIndex].activities.filter(
        activity => activity.id !== activityId
      );
      setItinerary(updatedItinerary);

    } catch (error) {
      console.error('Error removing activity:', error);
      setError('Failed to remove activity. Please try again.');
    }
  };

  const removeDay = async (dayIndex: number) => {
    const day = itinerary[dayIndex];
    if (!day) return;

    try {
      // Delete from database if it exists
      if (day.id) {
        try {
          await deleteItinerary(day.id);
        } catch (deleteError: any) {
          // If the itinerary doesn't exist in the database, just continue
          // This can happen if the frontend state is out of sync
          if (deleteError.message?.includes('404') || deleteError.message?.includes('not found')) {
            console.warn(`Itinerary ${day.id} not found in database, removing from local state only`);
          } else {
            throw deleteError;
          }
        }
      }

      // Update local state
      const updatedItinerary = itinerary.filter((_, index) => index !== dayIndex);
      setItinerary(updatedItinerary);

    } catch (error) {
      console.error('Error removing day:', error);
      setError('Failed to remove day. Please try again.');
    }
  };

  const handleBackToTrips = () => {
    navigate(ROUTES.TRIPS);
  };

  const handleViewItinerary = () => {
    navigate(ROUTES.ITINERARY_VIEW);
  };

  const handleAddActivity = (dayIndex: number) => {
    console.log('handleAddActivity called with dayIndex:', dayIndex);
    setSelectedDayForActivity(dayIndex);
    setIsActivityModalOpen(true);
  };

  const handleActivitySelect = (activityData: any) => {
    console.log('Activity selected:', activityData);
    addActivityToDay(selectedDayForActivity, activityData);
    
    // Show success notification
    alert(`"${activityData.title}" has been added to Day ${selectedDayForActivity + 1}!`);
  };

  const refreshItineraryData = async () => {
    if (!trip) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Reload itineraries from database
      const itineraries = await getItineraries(trip.id);
      
      // Generate days based on trip dates and existing itineraries
      const startDate = new Date(trip.start_date);
      const endDate = new Date(trip.end_date);
      const days: Day[] = [];
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const existingItinerary = itineraries.find(i => i.date === dateStr);
        
        if (existingItinerary) {
          // Load activities for this itinerary
          const activities = await getActivities(existingItinerary.id);
          days.push({
            id: existingItinerary.id,
            date: dateStr,
            city: existingItinerary.city || trip.destinations?.split(',')[0]?.trim() || 'Unknown City',
            activities: activities
          });
        } else {
          days.push({
            date: dateStr,
            city: trip.destinations?.split(',')[0]?.trim() || 'Unknown City',
            activities: [],
            isNew: true
          });
        }
      }
      
      setItinerary(days);
    } catch (error) {
      console.error('Error refreshing itinerary data:', error);
      setError('Failed to refresh data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };



  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary-400 mx-auto mb-4" />
            <p className="text-body-muted">Loading trip data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-error-500/10 border border-error-500/30 rounded-lg p-6">
          <h3 className="text-lg font-medium text-error-300 mb-2">Error</h3>
          <p className="text-error-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-error-600 hover:bg-error-700 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-body-muted">No trip data found.</p>
          <button
            onClick={handleBackToTrips}
            className="mt-4 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Trips
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackToTrips}
            className="p-2 hover:bg-base-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-body-muted" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-heading">{trip.title}</h1>
            <p className="text-body-muted mt-1">{trip.description || 'Build your perfect itinerary'}</p>
            {trip.estimated_budget && getTotalTripCost() > getTripBudgetAmount(trip.estimated_budget) && (
              <div className="mt-3 p-3 bg-error-500/10 border border-error-500/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-error-400" />
                  <span className="text-error-300 font-medium">Budget Exceeded!</span>
                </div>
                <p className="text-error-400 text-sm mt-1">
                  Your current activities cost {formatCurrency(getTotalTripCost(), getUserPreferredCurrency())}, 
                  which is {formatCurrency(getTotalTripCost() - getTripBudgetAmount(trip.estimated_budget), getUserPreferredCurrency())}
                  over your budget of {formatCurrency(getTripBudgetAmount(trip.estimated_budget), getUserPreferredCurrency())}.
                </p>
              </div>
            )}
          </div>
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
            onClick={saveItinerary}
            disabled={isSaving || !trip}
            className="bg-success-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 transition-colors"
            title={!trip ? 'Trip data not loaded' : 'Save itinerary'}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
          <button
            onClick={refreshItineraryData}
            disabled={isLoading || !trip}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 transition-colors"
            title={!trip ? 'Trip data not loaded' : 'Refresh data from database'}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>Refresh</span>
          </button>
          <button
            onClick={handleViewItinerary}
            disabled={!trip}
            className={`px-6 py-2 rounded-xl font-medium transition-colors ${
              !trip 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-primary-600 hover:bg-primary-700 text-white'
            }`}
            title={!trip ? 'Trip data not loaded' : 'Preview your itinerary'}
          >
            Preview
          </button>
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
                    {formatCurrency(getTotalTripCost(), getUserPreferredCurrency())}
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
                    {formatCurrency(getAverageCostPerDay(), getUserPreferredCurrency())}
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
                    {itinerary.reduce((total, day) => total + day.activities.length, 0)}
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
                            return `${label}: ${formatCurrency(value, getUserPreferredCurrency())} (${percentage}%)`;
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
                            return `${context.dataset.label}: ${formatCurrency(context.parsed.y, getUserPreferredCurrency())}`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return formatCurrency(value as number, getUserPreferredCurrency());
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
                            return `${context.dataset.label}: ${formatCurrency(context.parsed.y, getUserPreferredCurrency())}`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return formatCurrency(value as number, getUserPreferredCurrency());
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
                  {itinerary.map((day, dayIndex) => 
                    day.activities.map((activity, activityIndex) => (
                      <tr key={`${dayIndex}-${activityIndex}`} className="border-b border-glass-border hover:bg-base-50">
                        <td className="py-3 px-4 text-heading font-medium">Day {dayIndex + 1}</td>
                        <td className="py-3 px-4 text-heading">{activity.name}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityStyle(activity.category).color}`}>
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

      {!trip ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary-400 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-medium text-heading mb-2">Loading trip data...</h3>
            <p className="text-body-muted">Please wait while we load your trip information.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Budget Summary Card */}
            {trip?.estimated_budget && (
              <div className="glass-card rounded-xl shadow-sm border border-glass-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-heading">Budget Overview</h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    getTotalTripCost() > getTripBudgetAmount(trip.estimated_budget)
                      ? 'bg-error-500/15 text-error-300'
                      : getTotalTripCost() > getTripBudgetAmount(trip.estimated_budget) * 0.8
                      ? 'bg-warning-500/15 text-yellow-800'
                      : 'bg-success-500/15 text-success-300'
                  }`}>
                    {getTotalTripCost() > getTripBudgetAmount(trip.estimated_budget)
                      ? 'Over Budget'
                      : getTotalTripCost() > getTripBudgetAmount(trip.estimated_budget) * 0.8
                      ? 'Near Limit'
                      : 'On Track'}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-body-muted mb-1">Total Spent</p>
                    <p className="text-2xl font-bold text-primary-400">
                      {formatCurrency(getTotalTripCost(), getUserPreferredCurrency())}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-body-muted mb-1">Trip Budget</p>
                    <p className="text-2xl font-bold text-heading">
                      {formatCurrency(getTripBudgetAmount(trip.estimated_budget), getUserPreferredCurrency())}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-body-muted mb-1">Remaining</p>
                    <p className={`text-2xl font-bold ${
                      (getTripBudgetAmount(trip.estimated_budget) - getTotalTripCost()) < 0 ? 'text-error-400' : 'text-success-400'
                    }`}>
                      {formatCurrency(
                        Math.max(0, getTripBudgetAmount(trip.estimated_budget) - getTotalTripCost()),
                        getUserPreferredCurrency()
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-body-muted mb-2">
                    <span>Budget Usage</span>
                    <span>{Math.round((getTotalTripCost() / getTripBudgetAmount(trip.estimated_budget)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-base-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all ${
                        (getTotalTripCost() / getTripBudgetAmount(trip.estimated_budget)) > 1
                          ? 'bg-error-500/100' 
                          : (getTotalTripCost() / getTripBudgetAmount(trip.estimated_budget)) > 0.8
                            ? 'bg-warning-500/100' 
                            : 'bg-primary-500'
                      }`}
                      style={{ 
                        width: `${Math.min(100, (getTotalTripCost() / getTripBudgetAmount(trip.estimated_budget)) * 100)}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {itinerary.map((day, dayIndex) => (
            <div key={dayIndex} className="glass-card rounded-xl shadow-sm border border-glass-border">
              {/* Day Header */}
              <div className="p-6 border-b border-glass-border bg-gradient-to-r from-blue-50 to-teal-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold">{dayIndex + 1}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-heading">{formatDate(day.date)}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <MapPin className="w-4 h-4 text-body-muted" />
                        <span className="text-body-muted">{day.city}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-body-muted">Daily Budget</p>
                      <p className={`text-xl font-bold ${
                        trip.estimated_budget && getTotalDayCost(day.activities) > (getTripBudgetAmount(trip.estimated_budget) / itinerary.length)
                          ? 'text-error-400'
                          : 'text-primary-400'
                      }`}>
                        {formatCurrency(getTotalDayCost(day.activities), getUserPreferredCurrency())}
                      </p>
                      {trip.estimated_budget && (
                        <>
                          <div className="text-xs text-body-muted">
                            {formatCurrency(
                              Math.max(0, (getTripBudgetAmount(trip.estimated_budget) / itinerary.length) - getTotalDayCost(day.activities)),
                              getUserPreferredCurrency()
                            )} remaining
                          </div>
                          {getTotalDayCost(day.activities) > (getTripBudgetAmount(trip.estimated_budget) / itinerary.length) && (
                            <div className="text-xs text-error-400 flex items-center space-x-1 mt-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Over daily budget</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    {itinerary.length > 1 && (
                      <button
                        onClick={() => removeDay(dayIndex)}
                        disabled={!trip}
                        className={`p-2 rounded-lg transition-colors ${
                          !trip 
                            ? 'text-body-muted cursor-not-allowed' 
                            : 'hover:bg-error-500/15 text-error-400'
                        }`}
                        title={!trip ? 'Trip data not loaded' : 'Remove day'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Activities */}
              <div className="p-6">
                {day.activities.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-body-muted mx-auto mb-3" />
                    <p className="text-body-muted">No activities planned for this day</p>
                    <button
                      onClick={() => handleAddActivity(dayIndex)}
                      className="mt-3 text-primary-400 hover:text-primary-400 font-medium text-sm"
                    >
                      Add your first activity
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {day.activities.map((activity, activityIndex) => {
                      const activityStyle = getActivityStyle(activity.category);
                      return (
                        <div
                          key={activity.id}
                          className="flex items-center space-x-4 p-4 border border-glass-border rounded-xl hover:bg-base-50 transition-colors group"
                        >
                          <GripVertical className="w-5 h-5 text-body-muted cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
                          
                          {activity.image_url && (
                            <img
                              src={activity.image_url}
                              alt={activity.name}
                              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                              onError={(event) => { event.currentTarget.src = '/assests/geometric travel pattern wallpaper.jpg'; }}
                            />
                          )}
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <span className="text-lg">{activityStyle.icon}</span>
                                <div>
                                  <h4 className="font-medium text-heading">{activity.name}</h4>
                                  <p className="text-sm text-body-muted">{activity.location}</p>
                                </div>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${activityStyle.color}`}>
                                {activity.category}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-6 text-sm text-body-muted">
                              {activity.time && (
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{activity.time}</span>
                                </div>
                              )}
                              <span>Duration: {activity.duration_minutes ? `${Math.floor(activity.duration_minutes / 60)}h` : 'N/A'}</span>
                              <span className="font-medium text-success-400">
                                {formatCurrencyForUser(activity.cost_amount || 0, activity.currency || 'INR', getUserPreferredCurrency())}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => removeActivity(dayIndex, activity.id!)}
                              disabled={!trip}
                              className={`p-1 rounded transition-opacity ${
                                !trip 
                                  ? 'text-body-muted cursor-not-allowed' 
                                  : 'hover:bg-error-500/15 text-error-400'
                              }`}
                              title={!trip ? 'Trip data not loaded' : 'Remove activity'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add Activity Button */}
                <button
                  onClick={() => handleAddActivity(dayIndex)}
                  disabled={!trip}
                  className={`w-full mt-4 border-2 border-dashed rounded-xl p-4 flex items-center justify-center space-x-2 transition-colors ${
                    !trip 
                      ? 'border-glass-border text-body-muted cursor-not-allowed' 
                      : 'border-glass-border text-body-muted hover:border-primary-400 hover:text-primary-400'
                  }`}
                  title={!trip ? 'Trip data not loaded' : 'Add an activity to this day'}
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Activity</span>
                </button>
              </div>
            </div>
          ))}

          {/* Add New Day */}
          <button
            onClick={addNewDay}
            disabled={!trip}
            className={`w-full border-2 border-dashed rounded-xl p-8 flex items-center justify-center space-x-2 transition-colors ${
              !trip 
                ? 'border-glass-border text-body-muted cursor-not-allowed' 
                : 'border-glass-border text-body-muted hover:border-primary-400 hover:text-primary-400'
            }`}
            title={!trip ? 'Trip data not loaded' : 'Add another day to your itinerary'}
          >
            <Plus className="w-6 h-6" />
            <span className="text-lg font-medium">Add Another Day</span>
          </button>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trip Overview */}
          <div className="glass-card rounded-xl shadow-sm border border-glass-border p-6">
            <h3 className="font-semibold text-heading mb-4">Trip Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-body-muted">Duration</span>
                <span className="font-medium">{itinerary.length} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-body-muted">Cities</span>
                <span className="font-medium">{new Set(itinerary.map(d => d.city)).size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-body-muted">Activities</span>
                <span className="font-medium">{itinerary.reduce((total, day) => total + day.activities.length, 0)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-body-muted">Total Budget</span>
                  <span className="text-lg font-bold text-primary-400">
                    {formatCurrency(
                      getTotalTripCost(),
                      getUserPreferredCurrency()
                    )}
                  </span>
                </div>
                {trip?.estimated_budget && (
                  <>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-body-muted">Trip Budget:</span>
                      <span className="font-medium">
                        {formatCurrency(
                          getTripBudgetAmount(trip.estimated_budget),
                          getUserPreferredCurrency()
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-body-muted">Remaining:</span>
                      <span className={`font-medium ${
                        (getTripBudgetAmount(trip.estimated_budget) - getTotalTripCost()) < 0 ? 'text-error-400' : 'text-success-400'
                      }`}>
                        {formatCurrency(
                          Math.max(0, getTripBudgetAmount(trip.estimated_budget) - getTotalTripCost()),
                          getUserPreferredCurrency()
                        )}
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-base-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            (getTotalTripCost() / getTripBudgetAmount(trip.estimated_budget)) > 1
                              ? 'bg-error-500/100' 
                              : (getTotalTripCost() / getTripBudgetAmount(trip.estimated_budget)) > 0.8
                                ? 'bg-warning-500/100' 
                                : 'bg-primary-500'
                          }`}
                          style={{ 
                            width: `${Math.min(100, (getTotalTripCost() / getTripBudgetAmount(trip.estimated_budget)) * 100)}%`
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-body-muted mt-1 text-center">
                        {Math.round((getTotalTripCost() / getTripBudgetAmount(trip.estimated_budget)) * 100)}% used
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-card rounded-xl shadow-sm border border-glass-border p-6">
            <h3 className="font-semibold text-heading mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => onNavigate(ROUTES.CITY_SEARCH)}
                disabled={!trip}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  !trip 
                    ? 'text-body-muted cursor-not-allowed' 
                    : 'hover:bg-base-50'
                }`}
                title={!trip ? 'Trip data not loaded' : 'Explore new destinations'}
              >
                <div className="flex items-center space-x-3">
                  <MapPin className={`w-5 h-5 ${!trip ? 'text-body-muted' : 'text-primary-400'}`} />
                  <span className="font-medium">Add City</span>
                </div>
                <p className="text-sm text-body-muted mt-1">Explore new destinations</p>
              </button>
              

            </div>
          </div>

          {/* Activity Types Legend */}
          <div className="glass-card rounded-xl shadow-sm border border-glass-border p-6">
            <h3 className="font-semibold text-heading mb-4">Activity Types</h3>
            <div className="space-y-2">
              {activityTypes.map((type) => (
                <div key={type.type} className="flex items-center space-x-2">
                  <span>{type.icon}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${type.color}`}>
                    {type.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
        )}

      {/* Budget Warning Modal */}
      {budgetWarningModal && exceedingActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-xl shadow-glass max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-heading">Budget Warning</h3>
                <p className="text-sm text-body-muted">Adding this activity will exceed your trip budget</p>
              </div>
            </div>
            
            <div className="bg-warning-500/10 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3">
                <img 
                  src={exceedingActivity.image} 
                  alt={exceedingActivity.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-heading">{exceedingActivity.title}</h4>
                  <p className="text-sm text-body-muted">{exceedingActivity.city}</p>
                  <p className="text-lg font-bold text-success-400">{exceedingActivity.price}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-body-muted">Current Total Cost:</span>
                <span className="font-medium">
                  {formatCurrency(
                    getTotalTripCost(),
                    getUserPreferredCurrency()
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-body-muted">Trip Budget:</span>
                <span className="font-medium">
                  {formatCurrency(
                    convertCurrency(trip?.estimated_budget || 0, 'USD', getUserPreferredCurrency()),
                    getUserPreferredCurrency()
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-body-muted">Would Exceed By:</span>
                <span className="font-medium text-error-400">
                  {formatCurrency(
                    exceedingActivity.wouldExceedBy,
                    getUserPreferredCurrency()
                  )}
                </span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setBudgetWarningModal(false);
                  setExceedingActivity(null);
                }}
                className="flex-1 px-4 py-2 border border-glass-border text-heading rounded-lg hover:bg-base-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Force add the activity despite budget warning
                  setBudgetWarningModal(false);
                  const activityData = { ...exceedingActivity };
                  delete activityData.dayIndex;
                  delete activityData.wouldExceedBy;
                  addActivityWithoutBudgetCheck(exceedingActivity.dayIndex, activityData);
                  setExceedingActivity(null);
                }}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Add Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Selection Modal */}
      <ActivitySelectionModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        onActivitySelect={handleActivitySelect}
        selectedDayIndex={selectedDayForActivity}
        tripBudget={trip?.estimated_budget ? getTripBudgetAmount(trip.estimated_budget) : undefined}
        currentTotalCost={getTotalTripCost()}
      />
    </div>
  );
};

export default ItineraryBuilder;
