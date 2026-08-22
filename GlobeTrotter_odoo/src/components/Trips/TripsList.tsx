import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
import { MapPin, Calendar, Image as ImageIcon, Plus, Eye, Edit, Share, MoreVertical, Clock, DollarSign, Users, Sparkles, Globe, Plane, Zap, Grid3X3, CalendarDays, List, ArrowLeft } from 'lucide-react';
import { ROUTES } from '../../utils/navigation';
import { formatTripBudget } from '../../utils/currency';
import { useScrollAnimation, useStaggeredAnimation } from '../../utils/useScrollAnimation';

interface TripsListProps {
  onNavigate: (screen: any) => void;
}

interface Trip {
  id: number;
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  destinations?: string;
  estimated_budget?: number;
  cover_image?: string;
  is_public: boolean;
}

const TripsList: React.FC<TripsListProps> = ({ onNavigate }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar' | 'list'>('grid');
  const navigate = useNavigate();
  
  const headerRef = useScrollAnimation();
  const toggleRef = useScrollAnimation();
  const contentRef = useScrollAnimation();
  const statsRef = useScrollAnimation();
  const animatedTrips = useStaggeredAnimation(trips.length, 100);
  const animatedStats = useStaggeredAnimation(4, 150);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiFetch<Trip[]>('/trips/');
      setTrips(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trips');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTripDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleTripClick = (trip: Trip) => {
    // Store the selected trip in localStorage for other components to access
    localStorage.setItem('currentTrip', JSON.stringify(trip));
    // Navigate to itinerary view for the specific trip
    navigate(ROUTES.ITINERARY_VIEW);
  };

  const handleEditTrip = (trip: Trip, e: React.MouseEvent) => {
    e.stopPropagation();
    // Store the selected trip in localStorage for the itinerary builder
    localStorage.setItem('currentTrip', JSON.stringify(trip));
    navigate(ROUTES.ITINERARY_BUILDER);
  };

  const handleViewTrip = (trip: Trip, e: React.MouseEvent) => {
    e.stopPropagation();
    // Store the selected trip in localStorage for the itinerary view
    localStorage.setItem('currentTrip', JSON.stringify(trip));
    navigate(ROUTES.ITINERARY_VIEW);
  };

  const handleShareTrip = (trip: Trip, e: React.MouseEvent) => {
    e.stopPropagation();
    if (trip.is_public) {
      // Navigate directly to the shared trip URL with the trip ID
      navigate(`/shared-trip/${trip.id}`);
    } else {
      // Show a message that the trip needs to be public to share
      alert('Make your trip public to share it with others');
    }
  };

  const handleCreateTrip = () => {
    navigate(ROUTES.CREATE_TRIP);
  };

  // Helper functions for calendar view
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get first day of month and last day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of week for first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();
    
    // Calculate how many days from previous month to show
    const daysFromPrevMonth = firstDayOfWeek;
    
    // Calculate how many days from next month to show to complete the grid
    const totalDaysInGrid = 42; // 6 rows × 7 days
    const daysFromNextMonth = totalDaysInGrid - daysFromPrevMonth - lastDay.getDate();
    
    const days = [];
    
    // Add days from previous month
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, lastDay.getDate() - i);
      days.push({ date, isCurrentMonth: false, isToday: false });
    }
    
    // Add days from current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      const isToday = date.toDateString() === new Date().toDateString();
      days.push({ date, isCurrentMonth: true, isToday });
    }
    
    // Add days from next month
    for (let i = 1; i <= daysFromNextMonth; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false, isToday: false });
    }
    
    return days;
  };

  const getTripsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return trips.filter(trip => {
      if (!trip.start_date || !trip.end_date) return false;
      const startDate = new Date(trip.start_date);
      const endDate = new Date(trip.end_date);
      const currentDate = new Date(dateStr);
      return currentDate >= startDate && currentDate <= endDate;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-secondary relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="loading-spinner mx-auto mb-6"></div>
              <p className="text-body-muted text-lg">Loading your adventures...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-secondary relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-500/15/10 rounded-full animate-pulse-slow blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div 
          ref={headerRef.elementRef as React.RefObject<HTMLDivElement>}
          className={`mb-8 ${headerRef.isVisible ? 'animate-fade-in-down' : ''}`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4 group">
              <div className="relative">
                <div className="w-16 h-16 bg-primary-500/15 rounded-2xl flex items-center justify-center">
                  <Plane className="w-8 h-8 text-primary-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-accent-500/100 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-heading gradient-text mb-2">
                  Your Adventures
                </h1>
                <p className="text-lg text-body-muted flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-accent-500 animate-pulse" />
                  Plan, organize, and share your incredible journeys
                </p>
              </div>
            </div>
            
            <button
              onClick={handleCreateTrip}
              className="btn-primary group flex items-center hover:shadow-glow"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              <span>Create New Trip</span>
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div 
          ref={toggleRef.elementRef as React.RefObject<HTMLDivElement>}
          className={`flex items-center justify-between mb-8 ${toggleRef.isVisible ? 'animate-fade-in-up' : ''}`}
        >
          <div className="flex items-center space-x-1 bg-base-100 rounded-2xl p-1">
            {[
              { mode: 'grid', icon: Grid3X3, label: 'Grid View' },
              { mode: 'calendar', icon: CalendarDays, label: 'Calendar View' },
              { mode: 'list', icon: List, label: 'List View' }
            ].map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as 'grid' | 'calendar' | 'list')}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 flex items-center space-x-2 ${
                  viewMode === mode
                    ? 'bg-base-50 text-primary-600 shadow-medium'
                    : 'text-body-muted hover:text-heading hover:bg-white/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-8 p-6 bg-error-50 border border-error-200 rounded-2xl animate-fade-in-up">
            <p className="text-error-700 text-center font-medium">{error}</p>
          </div>
        )}

        <div 
          ref={contentRef.elementRef as React.RefObject<HTMLDivElement>}
          className={`${contentRef.isVisible ? 'animate-fade-in-up' : ''}`}
        >
          {trips.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-32 h-32 bg-base-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <Globe className="w-16 h-16 text-body-muted" />
              </div>
              <h3 className="text-3xl font-bold text-heading mb-4">No adventures yet</h3>
              <p className="text-body-muted mb-8 max-w-md mx-auto text-lg leading-relaxed">
                Start planning your next incredible journey by creating your first trip. Add destinations, activities, and share your itinerary with friends.
              </p>
              <button
                onClick={handleCreateTrip}
                className="btn-primary group text-lg px-8 py-4"
              >
                <Zap className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                <span>Create Your First Adventure</span>
              </button>
            </div>
          ) : (
            <>
              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {trips.map((trip, index) => (
                    <div 
                      key={trip.id} 
                      className={`card overflow-hidden cursor-pointer group hover:shadow-strong transition-all duration-500 transform ${
                        animatedTrips[index] 
                          ? 'opacity-100 translate-y-0' 
                          : 'opacity-0 translate-y-8'
                      }`}
                      style={{ transitionDelay: `${index * 100}ms` }}
                      onClick={() => handleTripClick(trip)}
                    >
                      {/* Cover Image */}
                      <div className="h-56 bg-base-100 relative overflow-hidden">
                        {trip.cover_image ? (
                          <img
                            src={trip.cover_image}
                            alt={trip.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(event) => { event.currentTarget.src = '/assests/geometric travel pattern wallpaper.jpg'; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-body-muted bg-gradient-to-br from-secondary-50 to-secondary-100">
                            <ImageIcon className="w-16 h-16" />
                          </div>
                        )}
                        
                        {/* Public Badge */}
                        {trip.is_public && (
                          <div className="absolute top-4 right-4 bg-primary-500/100 text-white text-xs px-3 py-1 rounded-full flex items-center space-x-2 shadow-glass">
                            <Users className="w-3 h-3" />
                            <span>Public</span>
                          </div>
                        )}

                        {/* Action Buttons Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                          <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                            <button
                              onClick={(e) => handleViewTrip(trip, e)}
                              className="p-3 glass-card rounded-full shadow-glass hover:bg-base-50 transition-all duration-300 transform hover:scale-110"
                              title="View Trip"
                            >
                              <Eye className="w-5 h-5 text-heading" />
                            </button>
                            <button
                              onClick={(e) => handleEditTrip(trip, e)}
                              className="p-3 glass-card rounded-full shadow-glass hover:bg-base-50 transition-all duration-300 transform hover:scale-110"
                              title="Edit Trip"
                            >
                              <Edit className="w-5 h-5 text-heading" />
                            </button>
                            <button
                              onClick={(e) => handleShareTrip(trip, e)}
                              className="p-3 glass-card rounded-full shadow-glass hover:bg-base-50 transition-all duration-300 transform hover:scale-110"
                              title="Share Trip"
                            >
                              <Share className="w-5 h-5 text-heading" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Trip Info */}
                      <div className="p-6">
                        <h3 className="font-bold text-heading mb-3 text-xl group-hover:text-primary-600 transition-colors">
                          {trip.title}
                        </h3>
                        
                        {trip.description && (
                          <p className="text-body-muted mb-4 line-clamp-2 leading-relaxed">
                            {trip.description}
                          </p>
                        )}
                        
                        <div className="space-y-4">
                          {/* Dates and Duration */}
                          {trip.start_date && trip.end_date && (
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2 text-body-muted">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-body-muted">
                                <Clock className="w-4 h-4" />
                                <span className="font-medium">{getTripDuration(trip.start_date, trip.end_date)} days</span>
                              </div>
                            </div>
                          )}
                          
                          {/* Destinations */}
                          {trip.destinations && (
                            <div className="flex items-center space-x-2 text-sm text-body-muted">
                              <MapPin className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{trip.destinations}</span>
                            </div>
                          )}
                          
                          {/* Budget */}
                          {trip.estimated_budget && (
                            <div className="flex items-center space-x-2 text-sm">
                              <span className="font-semibold text-success-600">
                                {formatTripBudget(trip.estimated_budget)}
                              </span>
                              <span className="text-body-muted">budget</span>
                            </div>
                          )}
                        </div>

                        {/* Quick Actions */}
                        <div className="mt-6 pt-4 border-t border-glass-border flex items-center justify-between">

                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Calendar View */}
              {viewMode === 'calendar' && trips.length > 0 && (
                <div className="card p-8">
                  {/* Calendar Header with Navigation */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-heading">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
                          setCurrentMonth(newMonth);
                        }}
                        className="p-2 hover:bg-base-100 rounded-xl transition-colors duration-300"
                      >
                        <ArrowLeft className="w-4 h-4 text-body-muted" />
                      </button>
                      <button
                        onClick={() => setCurrentMonth(new Date())}
                        className="px-3 py-2 text-sm font-medium text-body-muted hover:text-heading hover:bg-base-100 rounded-xl transition-colors duration-300"
                      >
                        Month
                      </button>
                      <button
                        onClick={() => {
                          const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
                          setCurrentMonth(newMonth);
                        }}
                        className="p-2 hover:bg-base-100 rounded-xl transition-colors duration-300"
                      >
                        <ArrowLeft className="w-4 h-4 text-body-muted rotate-180" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center py-3 text-sm font-semibold text-body-muted">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {generateCalendarDays().map((dayData, index) => {
                      const tripsOnDate = getTripsForDate(dayData.date);
                      const hasTrips = tripsOnDate.length > 0;
                      
                      return (
                        <div 
                          key={index} 
                          className={`min-h-32 p-3 border border-glass-border rounded-xl transition-all duration-300 ${
                            dayData.isToday ? 'bg-primary-500/10 border-primary-300 shadow-medium' : ''
                          } ${!dayData.isCurrentMonth ? 'bg-base-50 text-body-muted' : ''} ${
                            hasTrips ? 'bg-success-50 border-success-200' : ''
                          }`}
                        >
                          <div className={`text-sm font-semibold mb-2 ${
                            dayData.isCurrentMonth ? 'text-heading' : 'text-body-muted'
                          }`}>
                            {dayData.date.getDate()}
                          </div>
                          
                          {tripsOnDate.map((trip, tripIndex) => (
                            <div 
                              key={tripIndex}
                              className="text-xs p-2 rounded-lg mb-2 cursor-pointer hover:bg-base-50 transition-all duration-300 bg-primary-500/15 text-primary-800 border border-primary-200 hover:border-primary-300"
                              title={`${trip.title} - ${trip.destinations || 'Multiple destinations'}`}
                              onClick={() => handleTripClick(trip)}
                            >
                              <div className="font-semibold truncate">{trip.title}</div>
                              <div className="truncate opacity-80">{trip.destinations || 'Multiple destinations'}</div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && trips.length > 0 && (
                <div className="space-y-6">
                  {trips.map((trip, index) => (
                    <div 
                      key={trip.id} 
                      className={`card overflow-hidden transition-all duration-500 transform ${
                        animatedTrips[index] 
                          ? 'opacity-100 translate-x-0' 
                          : 'opacity-0 translate-x-8'
                      }`}
                      style={{ transitionDelay: `${index * 100}ms` }}
                    >
                      <div className="bg-gradient-to-r from-primary-500/10 to-accent-500/10 p-6 border-b border-glass-border">
                        <h3 className="text-xl font-bold text-heading">{trip.title}</h3>
                        <p className="text-body-muted mt-2">{trip.description || 'No description available'}</p>
                      </div>
                      
                      <div className="p-6 hover:bg-base-50/50 transition-colors duration-300 cursor-pointer" onClick={() => handleTripClick(trip)}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-primary-500/15 rounded-2xl flex items-center justify-center">
                              <Calendar className="w-8 h-8 text-primary-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-heading text-lg">{trip.title}</h4>
                              <p className="text-body-muted">{trip.destinations || 'Multiple destinations'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-body-muted">
                              {trip.start_date && trip.end_date ? `${formatDate(trip.start_date)} - ${formatDate(trip.end_date)}` : 'Dates TBD'}
                            </div>
                            {trip.estimated_budget && (
                              <div className="font-bold text-success-600 text-lg">
                                {formatTripBudget(trip.estimated_budget)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Stats */}
              {trips.length > 0 && (
                <div 
                  ref={statsRef.elementRef as React.RefObject<HTMLDivElement>}
                  className={`mt-16 grid grid-cols-1 md:grid-cols-4 gap-6 ${statsRef.isVisible ? 'animate-fade-in-up' : ''}`}
                >
                  {[
                    { value: trips.length, label: 'Total Trips', color: 'primary', icon: Plane },
                    { value: trips.filter(t => t.is_public).length, label: 'Public Trips', color: 'success', icon: Users },
                    { value: trips.reduce((total, trip) => {
                        if (trip.start_date && trip.end_date) {
                          return total + getTripDuration(trip.start_date, trip.end_date);
                        }
                        return total;
                      }, 0), label: 'Total Days', color: 'accent', icon: Calendar },
                    { value: formatTripBudget(
                        trips.reduce((total, trip) => total + (trip.estimated_budget || 0), 0)
                      ), label: 'Total Budget', color: 'warning', icon: DollarSign }
                  ].map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div 
                        key={index}
                        className={`card p-6 text-center group hover:shadow-glow transition-all duration-500 transform ${
                          animatedStats[index] 
                            ? 'opacity-100 translate-y-0' 
                            : 'opacity-0 translate-y-8'
                        }`}
                        style={{ transitionDelay: `${index * 150}ms` }}
                      >
                        <div className={`w-16 h-16 ${stat.color === 'primary' ? 'bg-primary-500/15' : stat.color === 'success' ? 'bg-success-100' : stat.color === 'accent' ? 'bg-accent-500/15' : 'bg-warning-100'} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className={`w-8 h-8 ${stat.color === 'primary' ? 'text-primary-600' : stat.color === 'success' ? 'text-success-600' : stat.color === 'accent' ? 'text-accent-600' : 'text-warning-600'}`} />
                        </div>
                        <div className={`text-3xl font-bold ${stat.color === 'primary' ? 'text-primary-600' : stat.color === 'success' ? 'text-success-600' : stat.color === 'accent' ? 'text-accent-600' : 'text-warning-600'} mb-2`}>
                          {stat.value}
                        </div>
                        <div className="text-body-muted font-medium">{stat.label}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripsList;
