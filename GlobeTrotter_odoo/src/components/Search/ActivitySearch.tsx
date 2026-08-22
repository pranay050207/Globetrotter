import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Clock, DollarSign, Star, Users, MapPin, Plus, Sparkles, TrendingUp, Heart } from 'lucide-react';
import { searchUtils, type SearchFilters, type SearchHistoryItem } from '../../utils/search';
import { ROUTES } from '../../utils/navigation';
import { formatCurrencyForUser, getUserPreferredCurrency, parsePrice } from '../../utils/currency';

type Screen = 'login' | 'signup' | 'dashboard' | 'trips' | 'create-trip' | 'itinerary-builder' | 'itinerary-view' | 'shared-itinerary' | 'city-search' | 'activity-search' | 'profile' | 'admin';

interface ActivitySearchProps {
  onNavigate: (screen: any) => void;
}

const ActivitySearch: React.FC<ActivitySearchProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDuration, setSelectedDuration] = useState('All');
  const [selectedBudget, setSelectedBudget] = useState('All');
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'relevance' | 'priceAsc' | 'priceDesc' | 'rating' | 'duration'>('relevance');
  const [history, setHistory] = useState<SearchHistoryItem[]>(searchUtils.getHistory('activity'));
  const [isSearching, setIsSearching] = useState(false);
  const [favoriteActivities, setFavoriteActivities] = useState<Set<number>>(new Set());
  const navigate = useNavigate();

  const handleAddToItinerary = (activity: any) => {
    console.log('handleAddToItinerary called with activity:', activity);
    localStorage.setItem('selectedActivity', JSON.stringify(activity));
    alert(`"${activity.title}" has been added to your trip!`);
    navigate(ROUTES.ITINERARY_BUILDER);
  };

  const handleViewCities = () => {
    navigate(ROUTES.CITY_SEARCH);
  };

  const toggleFavorite = (activityId: number) => {
    setFavoriteActivities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });
  };

  const activityTypes = ['All', 'Sightseeing', 'Museums', 'Food & Dining', 'Adventure', 'Entertainment', 'Shopping', 'Culture', 'Transport', 'Accommodation'];
  const durations = ['All', '< 1 hour', '1-2 hours', '2-4 hours', '4-8 hours', 'Full Day'];
  const budgets = ['All', 'Free', '$1-25', '$25-50', '$50-100', '$100+'];

  const activities = [
    {
      id: 1,
      title: 'Eiffel Tower Visit & Summit Access',
      type: 'Sightseeing',
      city: 'Paris, France',
      duration: '2-3 hours',
      price: '$25',
      rating: 4.8,
      reviews: 15420,
      description: 'Visit the iconic Eiffel Tower with skip-the-line access to the summit',
      highlights: ['Skip-the-line access', 'Summit views', 'Audio guide included'],
      image: 'https://images.pexels.com/photos/1194713/pexels-photo-1194713.jpeg?auto=compress&cs=tinysrgb&w=400',
      difficulty: 'Easy',
      groupSize: '1-15 people',
      includes: ['Entrance ticket', 'Audio guide', 'Fast-track access']
    },
    {
      id: 2,
      title: 'Louvre Museum Guided Tour',
      type: 'Museums',
      city: 'Paris, France',
      duration: '3-4 hours',
      price: '$45',
      rating: 4.7,
      reviews: 8934,
      description: 'Explore masterpieces with a professional guide including Mona Lisa',
      highlights: ['Professional guide', 'Mona Lisa viewing', 'Small group tour'],
      image: 'https://images.pexels.com/photos/2675266/pexels-photo-2675266.jpeg?auto=compress&cs=tinysrgb&w=400',
      difficulty: 'Easy',
      groupSize: '8-12 people',
      includes: ['Skip-the-line ticket', 'Professional guide', 'Headphones']
    },
    {
      id: 3,
      title: 'Seine River Dinner Cruise',
      type: 'Food & Dining',
      city: 'Paris, France',
      duration: '2.5 hours',
      price: '$89',
      rating: 4.6,
      reviews: 5621,
      description: 'Romantic dinner cruise along the Seine with panoramic city views',
      highlights: ['3-course dinner', 'City views', 'Live music'],
      image: 'https://images.pexels.com/photos/1308940/pexels-photo-1308940.jpeg?auto=compress&cs=tinysrgb&w=400',
      difficulty: 'Easy',
      groupSize: '2-100 people',
      includes: ['3-course dinner', 'Welcome drink', 'Live entertainment'],
      foodIcon: '/assests/fork plate restaurent.png'
    },
    {
      id: 4,
      title: 'Tokyo Food Walking Tour',
      type: 'Food & Dining',
      city: 'Tokyo, Japan',
      duration: '4 hours',
      price: '$85',
      rating: 4.9,
      reviews: 3247,
      description: 'Discover authentic Japanese cuisine in local neighborhoods',
      highlights: ['8 food tastings', 'Local guide', 'Hidden gems'],
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
      difficulty: 'Easy',
      groupSize: '6-12 people',
      includes: ['Food tastings', 'Local guide', 'Cultural insights'],
      foodIcon: '/assests/restaurant food icon minimalist.png'
    },
    {
      id: 5,
      title: 'Mount Fuji Day Trip',
      type: 'Adventure',
      city: 'Tokyo, Japan',
      duration: '10 hours',
      price: '$120',
      rating: 4.5,
      reviews: 2156,
      description: 'Full-day excursion to Mount Fuji with lake cruise and nature walks',
      highlights: ['Mount Fuji views', 'Lake cruise', 'Transport included'],
      image: 'https://images.pexels.com/photos/3010771/pexels-photo-3010771.jpeg?auto=compress&cs=tinysrgb&w=400',
      difficulty: 'Moderate',
      groupSize: '8-20 people',
      includes: ['Transport', 'Guide', 'Lunch']
    },
    {
      id: 6,
      title: 'Gourmet Restaurant Experience',
      type: 'Food & Dining',
      city: 'Paris, France',
      duration: '2 hours',
      price: '$150',
      rating: 4.9,
      reviews: 1892,
      description: 'Fine dining experience at a Michelin-starred restaurant',
      highlights: ['Michelin-starred cuisine', 'Wine pairing', 'Chef\'s table'],
      image: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=400',
      difficulty: 'Easy',
      groupSize: '2-8 people',
      includes: ['Multi-course meal', 'Wine pairing', 'Chef interaction'],
      foodIcon: '/assests/menu_restaurent.png'
    },
    {
      id: 7,
      title: 'Colosseum & Roman Forum Tour',
      type: 'Sightseeing',
      city: 'Rome, Italy',
      duration: '3 hours',
      price: '$35',
      rating: 4.7,
      reviews: 12450,
      description: 'Skip-the-line access to the Colosseum and Roman Forum with expert guide',
      highlights: ['Skip-the-line access', 'Expert guide', 'Roman Forum included'],
      image: 'https://images.pexels.com/photos/1701595/pexels-photo-1701595.jpeg?auto=compress&cs=tinysrgb&w=400',
      difficulty: 'Easy',
      groupSize: '1-20 people',
      includes: ['Entrance tickets', 'Expert guide', 'Audio headsets']
    },
    {
      id: 8,
      title: 'Vatican Museums & Sistine Chapel',
      type: 'Museums',
      city: 'Rome, Italy',
      duration: '4 hours',
      price: '$55',
      rating: 4.8,
      reviews: 9876,
      description: 'Exclusive access to Vatican Museums and the breathtaking Sistine Chapel',
      highlights: ['Skip-the-line access', 'Sistine Chapel', 'Expert guide'],
      image: 'https://images.pexels.com/photos/460621/pexels-photo-460621.jpeg?auto=compress&cs=tinysrgb&w=400',
      difficulty: 'Easy',
      groupSize: '1-15 people',
      includes: ['Entrance tickets', 'Expert guide', 'Audio headsets']
    },
    {
      id: 9,
      title: 'Traditional Italian Cooking Class',
      type: 'Food & Dining',
      city: 'Rome, Italy',
      duration: '4 hours',
      price: '$95',
      rating: 4.9,
      reviews: 2156,
      description: 'Learn to cook authentic Italian dishes in a local chef\'s kitchen',
      highlights: ['Hands-on cooking', 'Local ingredients', 'Wine tasting'],
      image: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=400',
      difficulty: 'Easy',
      groupSize: '2-8 people',
      includes: ['Cooking class', 'Ingredients', 'Wine tasting', 'Recipe book'],
      foodIcon: '/assests/fork plate restaurent.png'
    },
    {
      id: 10,
      title: 'Venice Gondola Ride',
      type: 'Sightseeing',
      city: 'Venice, Italy',
      duration: '30 minutes',
      price: '$80',
      rating: 4.6,
      reviews: 5432,
      description: 'Romantic gondola ride through the canals of Venice',
      highlights: ['Private gondola', 'Professional gondolier', 'Canal views'],
      image: 'https://images.pexels.com/photos/163236/luxury-yacht-boat-speed-water-163236.jpeg?auto=compress&cs=tinysrgb&w=400',
      difficulty: 'Easy',
      groupSize: '2-6 people',
      includes: ['Gondola ride', 'Professional gondolier', 'Commentary']
    },
    {
      id: 11,
      title: 'Barcelona Tapas Tour',
      type: 'Food & Dining',
      city: 'Barcelona, Spain',
      duration: '3 hours',
      price: '$75',
      rating: 4.8,
      reviews: 3456,
      description: 'Explore Barcelona\'s best tapas bars with a local food expert',
      highlights: ['5 tapas bars', 'Local guide', 'Wine pairings'],
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
      difficulty: 'Easy',
      groupSize: '4-12 people',
      includes: ['Tapas tastings', 'Local guide', 'Wine pairings'],
      foodIcon: '/assests/restaurant food icon minimalist.png'
    },
    {
      id: 12,
      title: 'Sagrada Familia Guided Tour',
      type: 'Sightseeing',
      city: 'Barcelona, Spain',
      duration: '2 hours',
      price: '$40',
      rating: 4.9,
      reviews: 8765,
      description: 'Skip-the-line access to Gaudi\'s masterpiece with expert guide',
      highlights: ['Skip-the-line access', 'Expert guide', 'Audio headsets'],
      image: 'https://images.pexels.com/photos/460621/pexels-photo-460621.jpeg?auto=compress&cs=tinysrgb&w=400',
      difficulty: 'Easy',
      groupSize: '1-20 people',
      includes: ['Entrance ticket', 'Expert guide', 'Audio headsets']
    },
    {
      id: 13,
      title: 'Amsterdam Canal Cruise',
      type: 'Sightseeing',
      city: 'Amsterdam, Netherlands',
      duration: '1 hour',
      price: '$20',
      rating: 4.5,
      reviews: 12345,
      description: 'Scenic canal cruise through Amsterdam\'s historic waterways',
      highlights: ['Canal views', 'Audio commentary', 'Glass-top boat'],
      image: 'https://images.pexels.com/photos/1308940/pexels-photo-1308940.jpeg?auto=compress&cs=tinysrgb&w=400',
      difficulty: 'Easy',
      groupSize: '1-100 people',
      includes: ['Canal cruise', 'Audio commentary', 'Comfortable seating']
    },
    {
      id: 14,
      title: 'Van Gogh Museum Visit',
      type: 'Museums',
      city: 'Amsterdam, Netherlands',
      duration: '2 hours',
      price: '$25',
      rating: 4.7,
      reviews: 6789,
      description: 'Explore the world\'s largest collection of Van Gogh artworks',
      highlights: ['Van Gogh collection', 'Audio guide', 'Skip-the-line access'],
      image: 'https://images.pexels.com/photos/2675266/pexels-photo-2675266.jpeg?auto=compress&cs=tinysrgb&w=400',
      difficulty: 'Easy',
      groupSize: '1-50 people',
      includes: ['Entrance ticket', 'Audio guide', 'Exhibition access']
    },
    {
      id: 15,
      title: 'Prague Castle Complex Tour',
      type: 'Sightseeing',
      city: 'Prague, Czech Republic',
      duration: '3 hours',
      price: '$30',
      rating: 4.6,
      reviews: 4567,
      description: 'Comprehensive tour of Prague Castle and its historic buildings',
      highlights: ['Castle complex', 'St. Vitus Cathedral', 'Golden Lane'],
      image: 'https://images.pexels.com/photos/460621/pexels-photo-460621.jpeg?auto=compress&cs=tinysrgb&w=400',
      difficulty: 'Moderate',
      groupSize: '1-15 people',
      includes: ['Entrance tickets', 'Expert guide', 'Audio headsets']
    },
    {
      id: 16,
      title: 'Budapest Thermal Bath Experience',
      type: 'Entertainment',
      city: 'Budapest, Hungary',
      duration: '3 hours',
      price: '$45',
      rating: 4.8,
      reviews: 3456,
      description: 'Relax in Budapest\'s famous thermal baths and spa facilities',
      highlights: ['Thermal baths', 'Spa treatments', 'Relaxation areas'],
      image: 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=400',
      difficulty: 'Easy',
      groupSize: '1-20 people',
      includes: ['Bath access', 'Towels', 'Locker rental']
    },
    {
      id: 17,
      title: 'Vienna Classical Concert',
      type: 'Entertainment',
      city: 'Vienna, Austria',
      duration: '2 hours',
      price: '$65',
      rating: 4.9,
      reviews: 2345,
      description: 'Experience classical music in Vienna\'s historic concert halls',
      highlights: ['Classical music', 'Historic venue', 'Professional orchestra'],
      image: 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=400',
      difficulty: 'Easy',
      groupSize: '1-200 people',
      includes: ['Concert ticket', 'Program booklet', 'Refreshments']
    },
    {
      id: 18,
      title: 'Swiss Alps Hiking Adventure',
      type: 'Adventure',
      city: 'Interlaken, Switzerland',
      duration: '6 hours',
      price: '$110',
      rating: 4.7,
      reviews: 1890,
      description: 'Guided hiking tour through the stunning Swiss Alps',
      highlights: ['Alpine views', 'Expert guide', 'Equipment provided'],
      image: 'https://images.pexels.com/photos/3010771/pexels-photo-3010771.jpeg?auto=compress&cs=tinysrgb&w=400',
      difficulty: 'Moderate',
      groupSize: '4-12 people',
      includes: ['Expert guide', 'Hiking equipment', 'Lunch', 'Transport']
    },
    {
      id: 19,
      title: 'Greek Island Sunset Cruise',
      type: 'Entertainment',
      city: 'Santorini, Greece',
      duration: '4 hours',
      price: '$95',
      rating: 4.8,
      reviews: 2987,
      description: 'Magical sunset cruise around the volcanic islands of Santorini',
      highlights: ['Sunset views', 'Volcanic islands', 'Swimming stops'],
      image: 'https://images.pexels.com/photos/1308940/pexels-photo-1308940.jpeg?auto=compress&cs=tinysrgb&w=400',
      difficulty: 'Easy',
      groupSize: '2-50 people',
      includes: ['Cruise', 'Dinner', 'Drinks', 'Swimming equipment']
    },
    {
      id: 20,
      title: 'Istanbul Grand Bazaar Shopping',
      type: 'Shopping',
      city: 'Istanbul, Turkey',
      duration: '3 hours',
      price: '$35',
      rating: 4.5,
      reviews: 4123,
      description: 'Guided shopping tour through Istanbul\'s historic Grand Bazaar',
      highlights: ['Historic bazaar', 'Local guide', 'Bargaining tips'],
      image: 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=400',
      difficulty: 'Easy',
      groupSize: '1-10 people',
      includes: ['Local guide', 'Shopping tips', 'Bargaining assistance']
    }
  ];

  // Helper functions
  function durationMatches(durationLabel: string, selected: string): boolean {
    if (selected === 'All') return true;
    const map: Record<string, { min?: number; max?: number }> = {
      '< 1 hour': { max: 60 },
      '1-2 hours': { min: 60, max: 120 },
      '2-4 hours': { min: 120, max: 240 },
      '4-8 hours': { min: 240, max: 480 },
      'Full Day': { min: 480 }
    };
    const sel = map[selected];
    if (!sel) return true;
    const nums = durationLabel.match(/\d+(?:\.\d+)?/g);
    if (!nums) return true;
    const hours = Number(nums[0]);
    const mins = hours * 60;
    if (sel.min != null && mins < sel.min) return false;
    if (sel.max != null && mins > sel.max) return false;
    return true;
  }

  function budgetMatches(priceLabel: string, selected: string): boolean {
    if (selected === 'All') return true;
    const price = parsePrice(priceLabel);
    switch (selected) {
      case 'Free': return price === 0;
      case '$1-25': return price >= 1 && price <= 25;
      case '$25-50': return price >= 25 && price <= 50;
      case '$50-100': return price >= 50 && price <= 100;
      case '$100+': return price >= 100;
      default: return true;
    }
  }

  const filteredActivities = useMemo(() => {
    const base = activities.filter(activity => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || activity.title.toLowerCase().includes(query) || activity.city.toLowerCase().includes(query);
      const matchesType = selectedType === 'All' || activity.type === selectedType;
      const matchesDuration = durationMatches(activity.duration, selectedDuration);
      const matchesBudget = budgetMatches(activity.price, selectedBudget);
      const matchesRating = activity.rating >= minRating;
      return matchesSearch && matchesType && matchesDuration && matchesBudget && matchesRating;
    });

    const sorted = [...base].sort((a, b) => {
      switch (sortBy) {
        case 'priceAsc': return parsePrice(a.price) - parsePrice(b.price);
        case 'priceDesc': return parsePrice(b.price) - parsePrice(a.price);
        case 'rating': return b.rating - a.rating;
        case 'duration': {
          const getMins = (d: string) => {
            const m = d.match(/\d+(?:\.\d+)?/);
            return m ? Number(m[0]) * 60 : 0;
          };
          return getMins(a.duration) - getMins(b.duration);
        }
        case 'relevance':
        default: return 0;
      }
    });
    return sorted;
  }, [activities, searchQuery, selectedType, selectedDuration, selectedBudget, minRating, sortBy]);

  const getCurrentFilters = (): SearchFilters => ({ selectedType, selectedDuration, selectedBudget, minRating, sortBy });

  const handleExecuteSearch = () => {
    const next = searchUtils.addHistory('activity', searchQuery, getCurrentFilters());
    setHistory(next);
  };

  const applyHistory = (query: string, filters: SearchFilters) => {
    setSearchQuery(query);
    const f: any = filters;
    if (typeof f.selectedType === 'string') setSelectedType(f.selectedType);
    if (typeof f.selectedDuration === 'string') setSelectedDuration(f.selectedDuration);
    if (typeof f.selectedBudget === 'string') setSelectedBudget(f.selectedBudget);
    if (typeof f.minRating === 'number') setMinRating(f.minRating);
    if (typeof f.sortBy === 'string') setSortBy(f.sortBy as any);
  };

  const handleClearHistory = () => {
    searchUtils.clearHistory('activity');
    setHistory([]);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-success-700 text-white';
      case 'Moderate': return 'bg-warning-700 text-white';
      case 'Hard': return 'bg-error-700 text-white';
      default: return 'bg-base-500/90';
    }
  };

  return (
    <div className="activity-page min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full mb-6 animate-fade-in-up">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="font-semibold">Discover Amazing Experiences</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6 animate-fade-in-up animation-delay-200">
            Find Your Perfect
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Adventure
            </span>
          </h1>
          
          <p className="text-xl text-body-muted max-w-2xl mx-auto mb-8 animate-fade-in-up animation-delay-400">
            Explore thousands of curated activities, tours, and experiences worldwide. 
            From hidden gems to iconic landmarks, create memories that last a lifetime.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-600">
            <button
              onClick={() => navigate(ROUTES.ITINERARY_BUILDER)}
              className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-glass-lg flex items-center space-x-3"
            >
              <span className="group-hover:rotate-180 transition-transform duration-300">←</span>
              <span>Back to Itinerary</span>
            </button>
            
            <button
              onClick={handleViewCities}
              className="group bg-base-50 hover:bg-base-50 text-heading px-8 py-4 rounded-2xl font-semibold text-lg border-2 border-glass-border hover:border-blue-300 transition-all duration-300 transform hover:scale-105 hover:shadow-glass flex items-center space-x-3"
            >
              <MapPin className="w-5 h-5 group-hover:text-primary-400 transition-colors" />
              <span>Explore Cities</span>
            </button>
          </div>
        </div>
        
        {/* Enhanced Search and Filters */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-glass-lg border border-glass-border p-8 mb-12 animate-fade-in-up animation-delay-800">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Enhanced Search Bar */}
            <div className="lg:col-span-2 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              <div className="relative glass-card rounded-2xl border-2 border-glass-border group-hover:border-blue-300 transition-all duration-300">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-body-muted group-hover:text-primary-400 transition-colors duration-300" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search activities, locations, or experiences..."
                  className="w-full pl-14 pr-6 py-4 bg-transparent border-none outline-none text-lg placeholder-gray-400 group-hover:placeholder-gray-500 transition-all duration-300"
                />
              </div>
            </div>

            {/* Enhanced Type Filter */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="activity-select relative w-full px-4 py-4 rounded-2xl outline-none transition-all duration-300 cursor-pointer"
              >
                {activityTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Enhanced Duration Filter */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="activity-select relative w-full px-4 py-4 rounded-2xl outline-none transition-all duration-300 cursor-pointer"
              >
                {durations.map(duration => (
                  <option key={duration} value={duration}>{duration}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Advanced Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Budget Filter */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              <select
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value)}
                className="activity-select relative w-full px-4 py-4 rounded-2xl outline-none transition-all duration-300 cursor-pointer"
              >
                {budgets.map(budget => (
                  <option key={budget} value={budget}>{budget}</option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              <div className="relative glass-card border-glass-border-2 border-glass-border rounded-2xl p-4 group-hover:border-yellow-300 transition-all duration-300">
                <label className="block text-sm font-medium text-heading mb-3">Min Rating: {minRating.toFixed(1)} ⭐</label>
                <input
                  type="range" 
                  min={0} 
                  max={5} 
                  step={0.1} 
                  value={minRating} 
                  onChange={(e) => setMinRating(Number(e.target.value))} 
                  className="w-full h-2 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>

            {/* Search Button */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              <button 
                onClick={() => {
                  setIsSearching(true);
                  handleExecuteSearch();
                  setTimeout(() => setIsSearching(false), 1000);
                }}
                disabled={isSearching}
                className="relative w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-glass-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-6 h-6" />
                    <span>Search Activities</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Enhanced Search History */}
          {history.length > 0 && (
            <div className="border-t border-glass-border pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-heading flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-primary-400" />
                  <span>Recent Searches</span>
                </h3>
                <button 
                  onClick={handleClearHistory} 
                  className="text-sm text-body-muted hover:text-error-400 transition-colors duration-200 hover:scale-105 transform"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {history.slice(0, 6).map((h) => (
                  <button
                    key={h.id}
                    onClick={() => applyHistory(h.query, h.filters)}
                    className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-blue-100 hover:to-purple-100 text-heading hover:text-primary-400 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-glass border border-glass-border hover:border-blue-300"
                    title={h.query}
                  >
                    {h.query || 'Untitled'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Results Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 animate-fade-in-up animation-delay-1000">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-2xl font-semibold text-lg shadow-glass">
              {filteredActivities.length} Activities Found
            </div>
            <div className="text-body-muted text-lg">
              Ready to explore amazing experiences
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)} 
              className="activity-select relative px-6 py-3 rounded-2xl text-lg font-medium outline-none transition-all duration-300 cursor-pointer shadow-glass"
            >
              <option value="relevance">Sort by Relevance</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="duration">Shortest Duration</option>
            </select>
          </div>
        </div>

        {/* Enhanced Activities Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up animation-delay-1200">
          {filteredActivities.map((activity, index) => (
            <div 
              key={activity.id} 
              className="group bg-white/90 backdrop-blur-xl rounded-3xl shadow-glass border border-glass-border overflow-hidden hover:shadow-glass-lg transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in-up"
              style={{ animationDelay: `${1200 + (index * 100)}ms` }}
            >
              <div className="relative">
                {/* Activity Image with Overlay */}
                <div className="h-64 relative overflow-hidden">
                  <img
                    src={activity.image}
                    alt={activity.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {/* Floating Badges */}
                  <div className="absolute top-4 left-4 flex space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getDifficultyColor(activity.difficulty)} backdrop-blur-sm`}>
                      {activity.difficulty}
                    </span>
                    {activity.type === 'Food & Dining' && (
                      <div className="px-3 py-1 rounded-full bg-warning-700 text-white backdrop-blur-sm flex items-center space-x-1">
                        <img 
                          src="/assests/fork plate restaurent.png" 
                          alt="Food" 
                          className="w-4 h-4 object-contain"
                        />
                        <span className="text-xs font-bold text-white">Food</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(activity.id)}
                    className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm transition-all duration-300 transform hover:scale-110 ${
                      favoriteActivities.has(activity.id) 
                        ? 'bg-error-500/100 text-white shadow-glass' 
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${favoriteActivities.has(activity.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Activity Content */}
                <div className="p-8">
                  {/* Header Section */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-heading mb-3 group-hover:text-primary-400 transition-colors duration-300">
                        {activity.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-body-muted mb-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-5 h-5 text-primary-400" />
                          <span className="font-medium">{activity.city}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-5 h-5 text-success-400" />
                          <span className="font-medium">{activity.duration}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Price Section */}
                    <div className="text-right">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-2xl shadow-glass">
                        <p className="text-3xl font-bold">
                          {formatCurrencyForUser(parsePrice(activity.price), 'USD', getUserPreferredCurrency())}
                        </p>
                        <p className="text-sm opacity-90">per person</p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-body-muted text-lg mb-6 leading-relaxed">
                    {activity.description}
                  </p>

                  {/* Enhanced Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-primary-500/30">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                        <span className="text-2xl font-bold text-blue-900">{activity.rating}</span>
                      </div>
                      <p className="text-sm text-primary-400">({activity.reviews.toLocaleString()} reviews)</p>
                    </div>
                    
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-success-500/30">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <Users className="w-5 h-5 text-success-400" />
                        <span className="text-2xl font-bold text-green-900">{activity.groupSize}</span>
                      </div>
                      <p className="text-sm text-success-400">Group size</p>
                    </div>
                    
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <Clock className="w-5 h-5 text-accent-400" />
                        <span className="text-2xl font-bold text-purple-900">{activity.duration}</span>
                      </div>
                      <p className="text-sm text-accent-400">Duration</p>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-heading mb-4 flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-yellow-500" />
                      <span>Highlights</span>
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {activity.highlights.map((highlight, index) => (
                        <span 
                          key={index} 
                          className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-blue-100 hover:to-purple-100 text-heading hover:text-primary-400 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 border border-glass-border hover:border-blue-300"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-6 border-t border-glass-border">
                    <button className="text-primary-400 hover:text-primary-400 text-lg font-semibold transition-colors duration-300 hover:scale-105 transform">
                      View Details
                    </button>
                    
                    <div className="flex items-center space-x-4">
                      <button className="p-3 bg-base-100 hover:bg-base-200 text-heading rounded-2xl transition-all duration-300 transform hover:scale-110 hover:shadow-glass">
                        <Plus className="w-6 h-6" />
                      </button>
                      
                      <button
                        onClick={() => handleAddToItinerary(activity)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-glass-lg flex items-center space-x-3"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Add to Trip</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results State */}
        {filteredActivities.length === 0 && (
          <div className="text-center py-20 animate-fade-in-up animation-delay-1400">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 shadow-glass-lg border border-glass-border">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-primary-400" />
              </div>
              <h3 className="text-2xl font-bold text-heading mb-4">No Activities Found</h3>
              <p className="text-body-muted text-lg mb-8 max-w-md mx-auto">
                Try adjusting your search criteria or explore different categories to discover amazing experiences.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('All');
                  setSelectedDuration('All');
                  setSelectedBudget('All');
                  setMinRating(0);
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-glass-lg"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivitySearch;