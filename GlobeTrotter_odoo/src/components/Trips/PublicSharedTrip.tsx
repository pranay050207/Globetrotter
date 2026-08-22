import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Share2, Copy, Heart, Download, MapPin, Calendar, Clock, Star, Facebook, Twitter, Instagram, Mail, Globe, Zap, Check } from 'lucide-react';
import { useScrollAnimation } from '../../utils/useScrollAnimation';
import { useScrollToTop } from '../../utils/useScrollToTop';
import { getPublicTrip, getPublicTripItinerariesWithActivities, ItineraryWithActivities, Activity } from '../../utils/api';
import { formatTripBudget } from '../../utils/currency';

interface Trip {
  id: number;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  destinations?: string;
  estimated_budget?: number;
  is_public: boolean;
  cover_image?: string;
  user_id: number;
}

const PublicSharedTrip: React.FC = () => {
  // Auto-scroll to top on route change and page refresh
  useScrollToTop();
  
  const [isLiked, setIsLiked] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [itineraries, setItineraries] = useState<ItineraryWithActivities[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const { tripId } = useParams();
  
  const headerRef = useScrollAnimation();
  const heroRef = useScrollAnimation();
  const actionsRef = useScrollAnimation();
  const itineraryRef = useScrollAnimation();
  const ctaRef = useScrollAnimation();

  // Load trip data from URL params
  useEffect(() => {
    const loadTripData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!tripId) {
          setError('No trip ID provided');
          return;
        }

        const tripIdNum = parseInt(tripId);
        if (isNaN(tripIdNum)) {
          setError('Invalid trip ID');
          return;
        }

        // Fetch trip data from backend using public API
        const tripData = await getPublicTrip(tripIdNum);
        setTrip(tripData);
        
        // Generate shareable URL
        const baseUrl = window.location.origin;
        const shareableUrl = `${baseUrl}/shared-trip/${tripData.id}`;
        setShareUrl(shareableUrl);

        // Fetch itinerary data with activities from the backend
        const itineraryData = await getPublicTripItinerariesWithActivities(tripIdNum);
        
        // Sort itineraries by date to ensure proper order
        const sortedItineraries = itineraryData.sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        setItineraries(sortedItineraries);
        
      } catch (error) {
        console.error('Error loading trip data:', error);
        if (error instanceof Error && error.message.includes('404')) {
          setError('Trip not found or not public');
        } else {
          setError('Failed to load trip data. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadTripData();
  }, [tripId]);

  // Use real trip data, no fake examples
  const tripData = {
    id: trip?.id || 'trip',
    title: trip?.title || 'Trip Title',
    description: trip?.description || 'Trip description',
    dates: trip ? `${new Date(trip.start_date).toLocaleDateString()} - ${new Date(trip.end_date).toLocaleDateString()}` : 'Dates TBD',
    duration: trip ? `${Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24))} days` : 'Duration TBD',
    budget: trip?.estimated_budget != null ? formatTripBudget(trip.estimated_budget) : 'Budget TBD',
    cities: trip?.destinations ? trip.destinations.split(',').map(city => city.trim()) : ['Destinations TBD'],
    coverImage: trip?.cover_image || 'https://images.pexels.com/photos/1194713/pexels-photo-1194713.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['Travel', 'Adventure', 'Culture', 'Food', 'Exploration']
  };

  // For now, show a message that itinerary details will be available when the backend is connected
  // In a real app, this would fetch itinerary data from the backend using the trip ID
  const itinerary: any[] = [];

  const activityTypes = {
    sightseeing: { color: 'bg-primary-500/15 text-primary-800', icon: '🏛️' },
    activity: { color: 'bg-success-100 text-success-800', icon: '🎯' },
    dining: { color: 'bg-warning-100 text-warning-800', icon: '🍽️' },
    accommodation: { color: 'bg-accent-500/15 text-accent-800', icon: '🏨' },
    museum: { color: 'bg-error-100 text-error-800', icon: '🎨' },
    transport: { color: 'bg-base-100 text-heading', icon: '🚗' }
  };

  const getTotalCost = () => {
    return itineraries.reduce((total: number, day: ItineraryWithActivities) => 
      total + day.activities.reduce((dayTotal: number, activity: Activity) => 
        dayTotal + (activity.cost_amount || 0), 0), 0);
  };

  const getActivityStyle = (category: string) => {
    const categoryKey = category.toLowerCase() as keyof typeof activityTypes;
    return activityTypes[categoryKey] || activityTypes.activity;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-secondary relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="flex items-center justify-center min-h-96 relative z-10">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-6"></div>
            <p className="text-body-muted text-lg">Loading your adventure...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-secondary relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="text-center py-20 relative z-10">
          <div className="w-32 h-32 bg-base-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <Globe className="w-16 h-16 text-body-muted" />
          </div>
          <h3 className="text-3xl font-bold text-heading mb-4">Trip Not Found</h3>
          <p className="text-body-muted mb-8 max-w-md mx-auto text-lg">
            {error}
          </p>
          <a
            href="/"
            className="btn-primary inline-flex items-center"
          >
            <Globe className="w-5 h-5 mr-2" />
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-secondary relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="text-center py-20 relative z-10">
          <div className="w-32 h-32 bg-base-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <Globe className="w-16 h-16 text-body-muted" />
          </div>
          <h3 className="text-3xl font-bold text-heading mb-4">Trip Not Found</h3>
          <p className="text-body-muted mb-8 max-w-md mx-auto text-lg">
            The trip you're looking for doesn't exist or has been removed.
          </p>
          <a
            href="/"
            className="btn-primary inline-flex items-center"
          >
            <Globe className="w-5 h-5 mr-2" />
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleCopyTrip = () => {
    // For public users, redirect to signup to copy the trip
    window.location.href = '/signup';
  };

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(shareUrl);
    const text = encodeURIComponent(`Check out this amazing trip: ${tripData.title}`);
    
    let shareUrl_platform = '';
    switch (platform) {
      case 'facebook':
        shareUrl_platform = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl_platform = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct sharing via URL
        break;
      case 'email':
        shareUrl_platform = `mailto:?subject=${encodeURIComponent(tripData.title)}&body=${text}%0A%0A${url}`;
        break;
      default:
        break;
    }
    
    if (shareUrl_platform) {
      window.open(shareUrl_platform, '_blank');
    }
    setShowShareModal(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          <div className="flex items-center justify-between">
            <a
              href="/"
              className="btn-secondary p-3 hover:shadow-medium transition-all duration-300 group"
            >
              <Globe className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="ml-2">Home</span>
            </a>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-primary-500/15 rounded-2xl flex items-center justify-center">
                  <Share2 className="w-6 h-6 text-primary-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-accent-500/100 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-heading">Shared Itinerary</h1>
                <p className="text-body-muted">View and share this amazing trip plan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trip Hero */}
        <div 
          ref={heroRef.elementRef as React.RefObject<HTMLDivElement>}
          className={`relative h-96 rounded-3xl overflow-hidden mb-8 ${heroRef.isVisible ? 'animate-fade-in-up' : ''}`}
        >
          <img
            src={tripData.coverImage}
            alt={tripData.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-5xl font-bold mb-3 gradient-text">{tripData.title}</h1>
                <p className="text-xl opacity-90 max-w-2xl">{tripData.description}</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-accent-400">${getTotalCost().toLocaleString()}</div>
                <div className="text-sm opacity-80">Total Budget</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-8 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-accent-400" />
                <span className="font-medium">{tripData.dates}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-accent-400" />
                <span className="font-medium">{tripData.cities.join(', ')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-accent-400" />
                <span className="font-medium">{tripData.duration}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div 
          ref={actionsRef.elementRef as React.RefObject<HTMLDivElement>}
          className={`flex items-center justify-between mb-8 ${actionsRef.isVisible ? 'animate-fade-in-up' : ''}`}
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`p-3 rounded-2xl transition-all duration-300 flex items-center space-x-2 ${
                isLiked 
                  ? 'bg-error-100 text-error-600 hover:bg-error-200' 
                  : 'bg-base-100 text-body-muted hover:bg-secondary-200'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="font-medium">{isLiked ? 'Liked' : 'Like'}</span>
            </button>
            
            <button
              onClick={() => setShowShareModal(true)}
              className="btn-secondary group"
            >
              <Share2 className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              <span>Share</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={copyToClipboard}
              className={`btn-primary group ${copied ? 'bg-success-600 hover:bg-success-700' : ''}`}
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
            
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center space-x-3 mb-8">
          {tripData.tags.map((tag, index) => (
            <span
              key={index}
              className="px-4 py-2 bg-primary-500/15 text-primary-800 text-sm rounded-full font-medium hover:bg-primary-200 transition-colors duration-300"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Itinerary */}
        <div 
          ref={itineraryRef.elementRef as React.RefObject<HTMLDivElement>}
          className={`space-y-6 ${itineraryRef.isVisible ? 'animate-fade-in-up' : ''}`}
        >
          {isLoading ? (
            <div className="card p-12 text-center">
              <div className="w-24 h-24 bg-base-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="loading-spinner"></div>
              </div>
              <h3 className="text-2xl font-bold text-heading mb-4">Loading Itinerary</h3>
              <p className="text-body-muted">Fetching trip details and activities...</p>
            </div>
          ) : itineraries.length > 0 ? (
            itineraries.map((day, dayIndex) => (
              <div key={dayIndex} className="card overflow-hidden">
                <div className="bg-gradient-to-r from-primary-500/10 to-accent-500/10 p-6 border-b border-glass-border">
                  <h2 className="text-2xl font-bold text-heading mb-3">Day {dayIndex + 1}</h2>
                  <div className="flex items-center space-x-6 text-body-muted">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5" />
                      <span className="font-medium">{day.city || 'Unknown City'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5" />
                      <span>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  {day.activities.length > 0 ? (
                    day.activities.map((activity: Activity) => {
                      const activityStyle = getActivityStyle(activity.category);
                      return (
                        <div key={activity.id} className="flex items-start space-x-4 p-6 border border-glass-border rounded-2xl hover:shadow-medium transition-all duration-300 group">
                          <img
                            src={activity.image_url || 'https://via.placeholder.com/100'} // Fallback image
                            alt={activity.name}
                            className="w-24 h-24 rounded-2xl object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">{activityStyle.icon}</span>
                                <h3 className="text-xl font-semibold text-heading">{activity.name}</h3>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${activityStyle.color}`}>
                                  {activity.category}
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold text-success-600">
                                  {activity.cost_amount ? `$${activity.cost_amount.toLocaleString()}` : 'Free'}
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-body-muted">
                                  <Star className="w-4 h-4 text-warning-400 fill-current" />
                                  <span>{activity.rating || 'N/A'}</span>
                                  <span>({activity.total_reviews.toLocaleString()})</span>
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-body-muted mb-4 text-lg leading-relaxed">{activity.description || 'No description available'}</p>
                            
                            <div className="flex items-center space-x-8 text-sm text-body-muted">
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4" />
                                <span className="font-medium">{activity.time || 'TBD'}</span>
                              </div>
                              <span className="font-medium">
                                Duration: {activity.duration_minutes ? `${activity.duration_minutes} min` : 'TBD'}
                              </span>
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4" />
                                <span className="font-medium">{activity.location || 'Location TBD'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-body-muted">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-body-muted" />
                      <p>No activities planned for this day yet.</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="card p-12 text-center">
              <div className="w-24 h-24 bg-base-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-12 h-12 text-body-muted" />
              </div>
              <h3 className="text-2xl font-bold text-heading mb-4">No Itinerary Available</h3>
              <p className="text-body-muted mb-6 max-w-md mx-auto text-lg">
                This trip doesn't have any planned activities yet. The trip owner can add activities to create a detailed day-by-day itinerary.
              </p>
              <div className="flex items-center justify-center space-x-4">
                <a
                  href="/signup"
                  className="btn-primary"
                >
                  <Globe className="w-5 h-5 mr-2" />
                  Create Your Own Trip
                </a>
                <a
                  href="/"
                  className="btn-secondary"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Go to Homepage
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div 
          ref={ctaRef.elementRef as React.RefObject<HTMLDivElement>}
          className={`bg-gradient-to-r from-primary-600 to-accent-600 rounded-3xl p-10 text-center text-white mt-16 ${ctaRef.isVisible ? 'animate-fade-in-up' : ''}`}
        >
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold mb-4">Create Your Own Adventure</h2>
            <p className="text-primary-100 mb-8 text-lg leading-relaxed">
              Start planning your next incredible journey with GlobeTrotter. 
              Build itineraries, discover activities, and share your adventures with friends.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <a
                href="/signup"
                className="bg-base-50 text-primary-600 px-8 py-4 rounded-2xl font-semibold hover:bg-base-50 transition-all duration-300 transform hover:scale-105 shadow-glass"
              >
                <Zap className="w-5 h-5 mr-2 inline" />
                Get Started Free
              </a>
              <a
                href="/"
                className="border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold hover:bg-base-50 hover:text-primary-600 transition-all duration-300 transform hover:scale-105"
              >
                <Globe className="w-5 h-5 mr-2 inline" />
                Explore Destinations
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-heading">Share This Trip</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-base-100 rounded-xl transition-colors duration-300"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => handleShare('facebook')}
                className="flex items-center space-x-3 p-4 border border-glass-border rounded-2xl hover:bg-base-50 transition-all duration-300 group"
              >
                <Facebook className="w-6 h-6 text-primary-400 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium">Facebook</span>
              </button>
              
              <button
                onClick={() => handleShare('twitter')}
                className="flex items-center space-x-3 p-4 border border-glass-border rounded-2xl hover:bg-base-50 transition-all duration-300 group"
              >
                <Twitter className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium">Twitter</span>
              </button>
              
              <button
                onClick={() => handleShare('instagram')}
                className="flex items-center space-x-3 p-4 border border-glass-border rounded-2xl hover:bg-base-50 transition-all duration-300 group"
              >
                <Instagram className="w-6 h-6 text-pink-600 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium">Instagram</span>
              </button>
              
              <button
                onClick={() => handleShare('email')}
                className="flex items-center space-x-3 p-4 border border-glass-border rounded-2xl hover:bg-base-50 transition-all duration-300 group"
              >
                <Mail className="w-6 h-6 text-body-muted group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium">Email</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-2 p-4 bg-base-50 rounded-2xl border border-glass-border">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-transparent text-sm font-mono"
              />
              <button
                onClick={copyToClipboard}
                className="text-primary-600 hover:text-primary-700 p-2 hover:bg-base-100 rounded-xl transition-colors duration-300"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-body-muted">
                Anyone with this link can view your trip plan, even without signing up!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicSharedTrip;
