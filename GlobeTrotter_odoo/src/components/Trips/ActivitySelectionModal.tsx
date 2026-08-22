import React, { useState, useMemo } from 'react';
import { X, Search, Clock, Star, Users, MapPin, Plus } from 'lucide-react';
import { formatCurrency, getUserPreferredCurrency } from '../../utils/currency';

interface Activity {
  id: number;
  title: string;
  type: string;
  city: string;
  duration: string;
  price: string;
  rating: number;
  reviews: number;
  description: string;
  highlights: string[];
  image: string;
  difficulty: string;
  groupSize: string;
  includes: string[];
  foodIcon?: string;
}

interface ActivitySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivitySelect: (activity: Activity) => void;
  selectedDayIndex: number;
  tripBudget?: number;
  currentTotalCost?: number;
}

const ActivitySelectionModal: React.FC<ActivitySelectionModalProps> = ({
  isOpen,
  onClose,
  onActivitySelect,
  selectedDayIndex,
  tripBudget,
  currentTotalCost
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDuration, setSelectedDuration] = useState('All');
  const [selectedBudget, setSelectedBudget] = useState('All');
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'relevance' | 'priceAsc' | 'priceDesc' | 'rating' | 'duration'>('relevance');

  const activityTypes = ['All', 'Sightseeing', 'Museums', 'Food & Dining', 'Adventure', 'Entertainment', 'Shopping', 'Culture', 'Transport', 'Accommodation'];
  const durations = ['All', '< 1 hour', '1-2 hours', '2-4 hours', '4-8 hours', 'Full Day'];
  const budgets = ['All', 'Free', '$1-25', '$25-50', '$50-100', '$100+'];

  const activities: Activity[] = [
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
    },
    {
      id: 21,
      title: 'New York City Helicopter Tour',
      type: 'Sightseeing',
      city: 'New York, USA',
      duration: '30 minutes',
      price: '$250',
      rating: 4.9,
      reviews: 1890,
      description: 'Breathtaking helicopter tour over Manhattan and iconic landmarks',
      highlights: ['Manhattan skyline', 'Statue of Liberty', 'Central Park views'],
      image: 'https://images.pexels.com/photos/1194713/pexels-photo-1194713.jpeg?auto=compress&cs=tinysrgb&w=400',
      difficulty: 'Easy',
      groupSize: '1-6 people',
      includes: ['Helicopter flight', 'Professional pilot', 'Safety briefing']
    },
    {
      id: 22,
      title: 'San Francisco Wine Country Tour',
      type: 'Food & Dining',
      city: 'San Francisco, USA',
      duration: '8 hours',
      price: '$180',
      rating: 4.8,
      reviews: 2156,
      description: 'Full-day wine tasting tour through Napa Valley vineyards',
      highlights: ['Wine tastings', 'Vineyard tours', 'Gourmet lunch'],
      image: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=400',
      difficulty: 'Easy',
      groupSize: '2-12 people',
      includes: ['Transport', 'Wine tastings', 'Lunch', 'Guide'],
      foodIcon: '/assests/fork plate restaurent.png'
    },
    {
      id: 23,
      title: 'London West End Theatre Show',
      type: 'Entertainment',
      city: 'London, UK',
      duration: '3 hours',
      price: '$120',
      rating: 4.7,
      reviews: 3456,
      description: 'Experience world-class theatre in London\'s famous West End',
      highlights: ['Premium seats', 'Famous musical', 'Historic theatre'],
      image: 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=400',
      difficulty: 'Easy',
      groupSize: '1-100 people',
      includes: ['Theatre ticket', 'Program', 'Refreshments']
    },
    {
      id: 24,
      title: 'Sydney Opera House Guided Tour',
      type: 'Sightseeing',
      city: 'Sydney, Australia',
      duration: '1 hour',
      price: '$40',
      rating: 4.6,
      reviews: 5678,
      description: 'Behind-the-scenes tour of Sydney\'s iconic Opera House',
      highlights: ['Backstage access', 'Performance venues', 'Architectural insights'],
      image: 'https://images.pexels.com/photos/460621/pexels-photo-460621.jpeg?auto=compress&cs=tinysrgb&w=400',
      difficulty: 'Easy',
      groupSize: '1-20 people',
      includes: ['Guided tour', 'Audio headsets', 'Souvenir booklet']
    },
    {
      id: 25,
      title: 'Dubai Desert Safari Adventure',
      type: 'Adventure',
      city: 'Dubai, UAE',
      duration: '6 hours',
      price: '$85',
      rating: 4.8,
      reviews: 2987,
      description: 'Thrilling desert safari with dune bashing and traditional dinner',
      highlights: ['Dune bashing', 'Camel ride', 'Traditional dinner'],
      image: 'https://images.pexels.com/photos/3010771/pexels-photo-3010771.jpeg?auto=compress&cs=tinysrgb&w=400',
      difficulty: 'Moderate',
      groupSize: '4-15 people',
      includes: ['4x4 transport', 'Camel ride', 'Dinner', 'Entertainment']
    }
  ];

  function parsePrice(value: string): number {
    const n = value.replace(/[^0-9.]/g, '');
    return Number(n || 0);
  }

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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-success-500/15 text-success-300';
      case 'Moderate': return 'bg-warning-500/15 text-yellow-800';
      case 'Hard': return 'bg-error-500/15 text-error-300';
      default: return 'bg-base-100 text-heading';
    }
  };

  const handleActivitySelect = (activity: Activity) => {
    onActivitySelect(activity);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="glass-card rounded-xl shadow-glass max-w-6xl w-full max-h-[calc(100dvh-1rem)] sm:max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-4 sm:p-6 border-b border-glass-border flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-heading">Select Activity for Day {selectedDayIndex + 1}</h2>
            <p className="text-body-muted mt-1">Choose an activity to add to your itinerary</p>
            {tripBudget && currentTotalCost !== undefined && (
              <div className="mt-3 p-3 bg-primary-950 border border-primary-500/30 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-primary-300 font-medium">Budget Status:</span>
                  <span className={`font-medium ${
                    currentTotalCost > tripBudget ? 'text-error-400' : 'text-primary-400'
                  }`}>
                    {currentTotalCost > tripBudget ? 'Over Budget' : 'On Track'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-primary-400 mt-1">
                  <span>Spent: {formatCurrency(currentTotalCost, getUserPreferredCurrency())}</span>
                  <span>Budget: {formatCurrency(tripBudget, getUserPreferredCurrency())}</span>
                  <span className={currentTotalCost > tripBudget ? 'text-error-400' : ''}>
                    {currentTotalCost > tripBudget 
                      ? `Over by ${formatCurrency(currentTotalCost - tripBudget, getUserPreferredCurrency())}`
                      : `Remaining: ${formatCurrency(tripBudget - currentTotalCost, getUserPreferredCurrency())}`
                    }
                  </span>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-base-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-body-muted" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-4 sm:p-6 border-b border-glass-border flex-shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Bar */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-body-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search activities or locations..."
                className="activity-search-input w-full pl-10 pr-4 py-3 border border-glass-border rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="activity-select px-4 py-3 rounded-xl focus:border-transparent transition-all"
            >
              {activityTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {/* Duration Filter */}
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="activity-select px-4 py-3 rounded-xl focus:border-transparent transition-all"
            >
              {durations.map(duration => (
                <option key={duration} value={duration}>{duration}</option>
              ))}
            </select>
          </div>
          
          {/* Advanced Filters */}
          <div className="mt-4 pt-4 border-t border-glass-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-heading mb-2">Min Rating: {minRating.toFixed(1)}</label>
                <input 
                  type="range" 
                  min={0} 
                  max={5} 
                  step={0.1} 
                  value={minRating} 
                  onChange={(e) => setMinRating(Number(e.target.value))} 
                  className="w-full" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-heading mb-2">Budget</label>
                <select
                  value={selectedBudget}
                  onChange={(e) => setSelectedBudget(e.target.value)}
                  className="activity-select w-full px-4 py-3 rounded-xl focus:border-transparent transition-all"
                >
                  {budgets.map(budget => (
                    <option key={budget} value={budget}>{budget}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-heading mb-2">Sort By</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)} 
                  className="activity-select w-full px-4 py-3 rounded-xl focus:border-transparent transition-all"
                >
                  <option value="relevance">Relevance</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="rating">Rating</option>
                  <option value="duration">Duration</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-glass-border flex-shrink-0">
          <p className="text-body-muted">
            {filteredActivities.length} activities found
          </p>
        </div>

        {/* Activities Grid */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="glass-card rounded-xl shadow-sm border border-glass-border overflow-hidden hover:shadow-md transition-shadow">
                <div className="md:flex">
                  {/* Activity Image */}
                  <div className="md:w-1/3">
                    <div className="h-48 md:h-full relative">
                      <img
                        src={activity.image}
                        alt={activity.title}
                        className="w-full h-full object-cover"
                        onError={(event) => { event.currentTarget.src = '/assests/geometric travel pattern wallpaper.jpg'; }}
                      />
                      <div className="absolute top-4 left-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(activity.difficulty)}`}>
                          {activity.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Activity Content */}
                  <div className="md:w-2/3 p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-heading mb-1">{activity.title}</h3>
                        <div className="flex items-center space-x-2 text-sm text-body-muted">
                          <MapPin className="w-4 h-4" />
                          <span>{activity.city}</span>
                          <div className="flex items-center space-x-1">
                            {activity.type === 'Food & Dining' && activity.foodIcon && (
                              <img 
                                src={activity.foodIcon} 
                                alt="Food & Dining" 
                                className="w-4 h-4 object-contain"
                              />
                            )}
                            <span className="px-2 py-1 bg-primary-950 text-primary-200 rounded-full text-xs font-medium">
                              {activity.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-success-400">{activity.price}</p>
                        <p className="text-xs text-body-muted">per person</p>
                      </div>
                    </div>

                    <p className="text-body-muted text-sm mb-4 line-clamp-2">{activity.description}</p>

                    {/* Activity Stats */}
                    <div className="flex items-center space-x-6 text-sm text-body-muted mb-4">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium">{activity.rating}</span>
                        <span>({activity.reviews.toLocaleString()})</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{activity.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{activity.groupSize}</span>
                      </div>
                    </div>

                    {/* Highlights */}
                    <div className="mb-4">
                      <p className="text-xs font-medium text-heading mb-2">Highlights:</p>
                      <div className="flex flex-wrap gap-1">
                        {activity.highlights.slice(0, 3).map((highlight, index) => (
                          <span key={index} className="px-2 py-1 bg-base-100 text-heading text-xs rounded-md">
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-glass-border">
                      <button className="text-primary-400 hover:text-primary-400 text-sm font-medium">
                        View Details
                      </button>
                      <div className="flex items-center space-x-2">
                        {tripBudget && currentTotalCost !== undefined && (
                          parseFloat(activity.price.replace('$', '')) + currentTotalCost > tripBudget && (
                            <div className="flex items-center space-x-1 text-xs text-error-400 bg-error-500/10 px-2 py-1 rounded">
                              <span>⚠️</span>
                              <span>Over budget</span>
                            </div>
                          )
                        )}
                        <button
                          onClick={() => handleActivitySelect(activity)}
                          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Add to Day {selectedDayIndex + 1}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivitySelectionModal;
