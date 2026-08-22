import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, Star, DollarSign, Users, Thermometer, ArrowRight, Globe, TrendingUp, Clock, Heart } from 'lucide-react';
import { searchUtils, type SearchFilters, type SearchHistoryItem } from '../../utils/search';
import { ROUTES } from '../../utils/navigation';
import { formatCurrencyForUser, getUserPreferredCurrency, parsePrice } from '../../utils/currency';
import { createSavedDestination, getSavedDestinations } from '../../utils/api';


interface CitySearchProps {
  onNavigate: (screen: any) => void;
}

const CitySearch: React.FC<CitySearchProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedBudget, setSelectedBudget] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [minRating, setMinRating] = useState<number>(1);
  const [minPopularity, setMinPopularity] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'cost' | 'name'>('popularity');
  const [history, setHistory] = useState<SearchHistoryItem[]>(searchUtils.getHistory('city'));
  const [animateCards, setAnimateCards] = useState(false);
  const [hoveredCity, setHoveredCity] = useState<number | null>(null);
  const [savingDestinations, setSavingDestinations] = useState<Set<number>>(new Set());
  const [savedDestinations, setSavedDestinations] = useState<Set<number>>(new Set());
  const navigate = useNavigate();

  // Trigger card animations after component mounts
  useEffect(() => {
    const timer = setTimeout(() => setAnimateCards(true), 100);
    const destination = new URLSearchParams(window.location.search).get('city');
    if (destination) setSearchQuery(destination);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    getSavedDestinations()
      .then(saved => setSavedDestinations(new Set(saved.map(destination => {
        return cities.find(city => city.name === destination.city_name)?.id;
      }).filter((id): id is number => id !== undefined))))
      .catch(error => console.warn('Unable to load saved destinations:', error));
  }, []);



  const handleAddToTrip = () => {
    navigate(ROUTES.CREATE_TRIP);
  };

  const handleViewActivities = () => {
    navigate(ROUTES.ACTIVITY_SEARCH);
  };

  const handleSaveDestination = async (city: any) => {
    try {
      setSavingDestinations(prev => new Set(prev).add(city.id));
      await createSavedDestination({
        city_name: city.name,
        country_name: city.country,
        region: city.region,
        image_url: city.image,
        description: city.description,
        rating: city.rating,
        popularity: city.popularity,
        cost_index: city.costIndex,
        daily_budget: city.dailyBudget,
        temperature: city.temperature,
        best_time: city.bestTime,
        highlights: city.highlights,
      });
      setSavedDestinations(prev => new Set(prev).add(city.id));
      // You can add a toast notification here
    } catch (error) {
      console.error('Error saving destination:', error);
      // You can add error handling here
    } finally {
      setSavingDestinations(prev => {
        const newSet = new Set(prev);
        newSet.delete(city.id);
        return newSet;
      });
    }
  };

  const isDestinationSaved = (city: any) => {
    return savedDestinations.has(city.id);
  };



  const regions = ['All', 'Europe', 'Asia', 'North America', 'South America', 'Africa', 'Oceania'];
  const budgetRanges = ['All', '$0-50/day', '$50-100/day', '$100-200/day', '$200+/day'];

  const cities = [
  {
    id: 1,
    name: 'Paris',
    country: 'France',
    region: 'Europe',
    rating: 4.8,
    popularity: 95,
    costIndex: 120,
    dailyBudget: '$80-150',
    temperature: '15°C',
    bestTime: 'Apr-Jun, Sep-Oct',
    highlights: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame'],
    image: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-674x446/11/7b/03/80.jpg',
    description: 'The City of Light offers romance, culture, and world-class cuisine'
  },
  {
    id: 2,
    name: 'Tokyo',
    country: 'Japan',
    region: 'Asia',
    rating: 4.7,
    popularity: 92,
    costIndex: 135,
    dailyBudget: '$90-180',
    temperature: '18°C',
    bestTime: 'Mar-May, Sep-Nov',
    highlights: ['Shibuya Crossing', 'Mount Fuji', 'Imperial Palace'],
    image: 'https://images.pexels.com/photos/161401/fushimi-inari-taisha-shrine-kyoto-japan-temple-161401.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Modern metropolis blending traditional culture with cutting-edge technology'
  },
  {
    id: 3,
    name: 'New York',
    country: 'United States',
    region: 'North America',
    rating: 4.6,
    popularity: 90,
    costIndex: 140,
    dailyBudget: '$100-200',
    temperature: '12°C',
    bestTime: 'Apr-Jun, Sep-Nov',
    highlights: ['Central Park', 'Statue of Liberty', 'Times Square'],
    image: 'https://images.pexels.com/photos/290595/pexels-photo-290595.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'The Big Apple - iconic skyline, Broadway shows, and endless energy'
  },
  {
    id: 4,
    name: 'London',
    country: 'United Kingdom',
    region: 'Europe',
    rating: 4.5,
    popularity: 88,
    costIndex: 125,
    dailyBudget: '$85-160',
    temperature: '10°C',
    bestTime: 'May-Sep',
    highlights: ['Big Ben', 'British Museum', 'Tower Bridge'],
    image: 'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Historic charm meets modern innovation in this royal capital'
  },
  {
    id: 5,
    name: 'Barcelona',
    country: 'Spain',
    region: 'Europe',
    rating: 4.7,
    popularity: 85,
    costIndex: 95,
    dailyBudget: '$60-120',
    temperature: '20°C',
    bestTime: 'Apr-Jun, Sep-Oct',
    highlights: ['Sagrada Familia', 'Park Güell', 'Gothic Quarter'],
    image: 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Gaudí architecture, Mediterranean beaches, and vibrant culture'
  },
  {
    id: 6,
    name: 'Rome',
    country: 'Italy',
    region: 'Europe',
    rating: 4.6,
    popularity: 87,
    costIndex: 110,
    dailyBudget: '$70-140',
    temperature: '16°C',
    bestTime: 'Apr-Jun, Sep-Oct',
    highlights: ['Colosseum', 'Vatican City', 'Trevi Fountain'],
    image: 'https://images.pexels.com/photos/1701595/pexels-photo-1701595.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Eternal City with ancient history at every corner'
  },
  {
    id: 7,
    name: 'Bali',
    country: 'Indonesia',
    region: 'Asia',
    rating: 4.8,
    popularity: 94,
    costIndex: 85,
    dailyBudget: '$40-100',
    temperature: '27°C',
    bestTime: 'Apr-Oct',
    highlights: ['Ubud Rice Terraces', 'Tanah Lot Temple', 'Kuta Beach'],
    image: 'https://images.pexels.com/photos/753626/pexels-photo-753626.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Island paradise with beaches, temples, and vibrant culture'
  },
  {
    id: 8,
    name: 'Dubai',
    country: 'United Arab Emirates',
    region: 'Middle East',
    rating: 4.6,
    popularity: 89,
    costIndex: 150,
    dailyBudget: '$120-250',
    temperature: '30°C',
    bestTime: 'Nov-Mar',
    highlights: ['Burj Khalifa', 'Palm Jumeirah', 'Dubai Mall'],
    image: 'https://lp-cms-production.imgix.net/features/2017/09/dubai-marina-skyline-2c8f1708f2a1.jpg?auto=format,compress&q=72&w=1440&h=810&fit=crop',
    description: 'Futuristic city with luxury shopping and desert adventures'
  },
  {
    id: 9,
    name: 'Maldives',
    country: 'Maldives',
    region: 'Asia',
    rating: 4.9,
    popularity: 93,
    costIndex: 200,
    dailyBudget: '$150-300',
    temperature: '28°C',
    bestTime: 'Nov-Apr',
    highlights: ['Overwater Villas', 'Coral Reefs', 'Private Islands'],
    image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Tropical luxury with crystal-clear waters and coral reefs'
  },
  {
    id: 10,
    name: 'Santorini',
    country: 'Greece',
    region: 'Europe',
    rating: 4.7,
    popularity: 90,
    costIndex: 130,
    dailyBudget: '$90-170',
    temperature: '23°C',
    bestTime: 'May-Oct',
    highlights: ['Oia Village', 'Red Beach', 'Caldera Views'],
    image: 'https://images.pexels.com/photos/164241/pexels-photo-164241.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Whitewashed houses, blue domes, and romantic sunsets'
  },
  {
    id: 11,
    name: 'Agra',
    country: 'India',
    region: 'Asia',
    rating: 4.7,
    popularity: 94,
    costIndex: 50,
    dailyBudget: '$20-50',
    temperature: '25°C',
    bestTime: 'Oct-Mar',
    highlights: ['Taj Mahal', 'Agra Fort', 'Mehtab Bagh'],
    image: 'https://images.pexels.com/photos/1583244/pexels-photo-1583244.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Home to the Taj Mahal, a UNESCO World Heritage wonder'
  },
  {
    id: 12,
    name: 'Jaipur',
    country: 'India',
    region: 'Asia',
    rating: 4.6,
    popularity: 90,
    costIndex: 45,
    dailyBudget: '$15-40',
    temperature: '26°C',
    bestTime: 'Oct-Mar',
    highlights: ['Hawa Mahal', 'Amber Fort', 'City Palace'],
    image: 'https://images.pexels.com/photos/460776/pexels-photo-460776.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'The Pink City, rich in royal heritage and vibrant bazaars'
  },
  {
    id: 13,
    name: 'Goa',
    country: 'India',
    region: 'Asia',
    rating: 4.5,
    popularity: 88,
    costIndex: 60,
    dailyBudget: '$25-70',
    temperature: '28°C',
    bestTime: 'Nov-Feb',
    highlights: ['Baga Beach', 'Basilica of Bom Jesus', 'Fort Aguada'],
    image: 'https://imgcld.yatra.com/ytimages/image/upload/v1517481987/AdvNation/ANN_DES67/ann_top_Goa_loQGrP.jpg',
    description: 'Beach paradise with Portuguese heritage and nightlife'
  },
  {
    id: 14,
    name: 'Kerala Backwaters',
    country: 'India',
    region: 'Asia',
    rating: 4.8,
    popularity: 92,
    costIndex: 55,
    dailyBudget: '$20-60',
    temperature: '27°C',
    bestTime: 'Sep-Mar',
    highlights: ['Houseboats', 'Alleppey', 'Kumarakom'],
    image: 'https://images.pexels.com/photos/1430676/pexels-photo-1430676.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Scenic backwaters, houseboats, and lush greenery'
  },
  {
    id: 15,
    name: 'Ladakh',
    country: 'India',
    region: 'Asia',
    rating: 4.9,
    popularity: 91,
    costIndex: 70,
    dailyBudget: '$30-80',
    temperature: '10°C',
    bestTime: 'Jun-Sep',
    highlights: ['Pangong Lake', 'Nubra Valley', 'Magnetic Hill'],
    image: 'https://imgcld.yatra.com/ytimages/image/upload/v1517480778/AdvNation/ANN_DES95/ann_top_Ladakh_buV00Q.jpg',
    description: 'Himalayan beauty with monasteries and high-altitude lakes'
  },
  {
    id: 16,
    name: 'Singapore',
    country: 'Singapore',
    region: 'Asia',
    rating: 4.6,
    popularity: 89,
    costIndex: 140,
    dailyBudget: '$100-200',
    temperature: '28°C',
    bestTime: 'Feb-Apr, Nov',
    highlights: ['Marina Bay Sands', 'Gardens by the Bay', 'Sentosa Island'],
    image: 'https://images.pexels.com/photos/290386/pexels-photo-290386.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Futuristic city-state with green spaces and diverse cuisine'
  },
  {
    id: 17,
    name: 'Machu Picchu',
    country: 'Peru',
    region: 'South America',
    rating: 4.9,
    popularity: 93,
    costIndex: 80,
    dailyBudget: '$40-100',
    temperature: '12°C',
    bestTime: 'Apr-Oct',
    highlights: ['Inca Citadel', 'Huayna Picchu', 'Sun Gate'],
    image: 'https://images.pexels.com/photos/259967/pexels-photo-259967.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Ancient Incan city in the Andes mountains'
  },
  {
    id: 18,
    name: 'Great Wall of China',
    country: 'China',
    region: 'Asia',
    rating: 4.8,
    popularity: 94,
    costIndex: 75,
    dailyBudget: '$30-70',
    temperature: '14°C',
    bestTime: 'Apr-May, Sep-Oct',
    highlights: ['Mutianyu', 'Badaling', 'Jinshanling'],
    image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'World\'s longest man-made structure and historic marvel'
  },
  {
    id: 19,
    name: 'Sydney',
    country: 'Australia',
    region: 'Oceania',
    rating: 4.7,
    popularity: 90,
    costIndex: 130,
    dailyBudget: '$90-170',
    temperature: '22°C',
    bestTime: 'Sep-Nov, Mar-May',
    highlights: ['Sydney Opera House', 'Bondi Beach', 'Harbour Bridge'],
    image: 'https://images.pexels.com/photos/2193300/pexels-photo-2193300.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Harbour city with iconic landmarks and sunny beaches'
  },
  {
    id: 20,
    name: 'Istanbul',
    country: 'Turkey',
    region: 'Europe/Asia',
    rating: 4.6,
    popularity: 88,
    costIndex: 85,
    dailyBudget: '$40-90',
    temperature: '18°C',
    bestTime: 'Apr-Jun, Sep-Oct',
    highlights: ['Hagia Sophia', 'Blue Mosque', 'Grand Bazaar'],
    image: 'https://images.pexels.com/photos/2087001/pexels-photo-2087001.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'City where East meets West with rich history and culture'
  }
]

  function parseDailyBudgetRange(dailyBudget: string): { min: number; max: number } | null {
    const nums = dailyBudget.match(/\d+/g);
    if (!nums || nums.length === 0) return null;
    if (nums.length === 1) return { min: Number(nums[0]), max: Number(nums[0]) };
    return { min: Number(nums[0]), max: Number(nums[1]) };
  }

  function budgetFilterMatches(cityBudget: string, selected: string): boolean {
    if (selected === 'All') return true;
    const map: Record<string, { min?: number; max?: number }> = {
      '$0-50/day': { max: 50 },
      '$50-100/day': { min: 50, max: 100 },
      '$100-200/day': { min: 100, max: 200 },
      '$200+/day': { min: 200 }
    };
    const range = parseDailyBudgetRange(cityBudget);
    const sel = map[selected];
    if (!range || !sel) return true;
    const avg = (range.min + range.max) / 2;
    if (sel.min != null && avg < sel.min) return false;
    if (sel.max != null && avg > sel.max) return false;
    return true;
  }

  const filteredCities = useMemo(() => {
    const base = cities.filter(city => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || city.name.toLowerCase().includes(query);
      const matchesRegion = selectedRegion === 'All' || city.region === selectedRegion;
      const matchesBudget = budgetFilterMatches(city.dailyBudget, selectedBudget);
      const matchesRating = city.rating >= minRating;
      const matchesPopularity = city.popularity >= minPopularity;
      return matchesSearch && matchesRegion && matchesBudget && matchesRating && matchesPopularity;
    });

    const sorted = [...base].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'cost': {
          const ra = parseDailyBudgetRange(a.dailyBudget);
          const rb = parseDailyBudgetRange(b.dailyBudget);
          const avga = ra ? (ra.min + ra.max) / 2 : Number.MAX_SAFE_INTEGER;
          const avgb = rb ? (rb.min + rb.max) / 2 : Number.MAX_SAFE_INTEGER;
          return avga - avgb;
        }
        case 'name':
          return a.name.localeCompare(b.name);
        case 'popularity':
        default:
          return b.popularity - a.popularity;
      }
    });

    return sorted;
  }, [cities, searchQuery, selectedRegion, selectedBudget, minRating, minPopularity, sortBy]);

  const getCurrentFilters = (): SearchFilters => ({ selectedRegion, selectedBudget, minRating, minPopularity, sortBy });

  const handleExecuteSearch = () => {
    const next = searchUtils.addHistory('city', searchQuery, getCurrentFilters());
    setHistory(next);
  };

  const applyHistory = (query: string, filters: SearchFilters) => {
    setSearchQuery(query);
    const f: any = filters;
    if (typeof f.selectedRegion === 'string') setSelectedRegion(f.selectedRegion);
    if (typeof f.selectedBudget === 'string') setSelectedBudget(f.selectedBudget);
    if (typeof f.minRating === 'number') setMinRating(f.minRating);
    if (typeof f.minPopularity === 'number') setMinPopularity(f.minPopularity);
    if (typeof f.sortBy === 'string') setSortBy(f.sortBy as any);
  };

  const handleClearHistory = () => {
    searchUtils.clearHistory('city');
    setHistory([]);
  };

  const getCostColor = (costIndex: number) => {
    if (costIndex < 100) return 'text-success-400';
    if (costIndex < 120) return 'text-warning-400';
    return 'text-error-400';
  };

  return (
    <div className="min-h-screen bg-base-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Professional Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-xl mb-6 shadow-glass">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-heading mb-4">
            Explore Cities
          </h1>
          <p className="text-xl text-body-muted max-w-2xl mx-auto">
            Discover amazing destinations around the world and plan your next adventure
          </p>
        </div>

        {/* Professional Search and Filters */}
        <div className="glass-card rounded-2xl shadow-glass border border-glass-border p-6 mb-8">
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-body-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cities, countries, or experiences..."
                className="w-full pl-12 pr-4 py-4 border border-glass-border rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-200 text-lg bg-white"
              />
            </div>

            {/* Filter Row */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Region Filter */}
              <div className="flex-1 max-w-xs">
                <label className="block text-sm font-medium text-heading mb-2">Region</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full px-3 py-2.5 glass-card border-glass-border-2 border-glass-border rounded-2xl focus:ring-4 focus:ring-blue-100/50 focus:border-blue-400 transition-all duration-300 appearance-none cursor-pointer pr-10 shadow-glass hover:shadow-glass hover:border-blue-300 font-medium text-heading"
                >
                  {regions.map(region => (
                    <option key={region} value={region} className="py-2 px-3 rounded-lg">{region}</option>
                  ))}
                </select>
              </div>

              {/* Budget Filter */}
              <div className="flex-1 max-w-xs">
                <label className="block text-sm font-medium text-heading mb-2">Budget Range</label>
                <select
                  value={selectedBudget}
                  onChange={(e) => setSelectedBudget(e.target.value)}
                  className="w-full px-3 py-2.5 glass-card border-glass-border-2 border-glass-border rounded-2xl focus:ring-4 focus:ring-green-100/50 focus:border-green-400 transition-all duration-300 appearance-none cursor-pointer pr-10 shadow-glass hover:shadow-glass hover:border-green-300 font-medium text-heading"
                >
                  {budgetRanges.map(range => (
                    <option key={range} value={range} className="py-2 px-3 rounded-lg">{range}</option>
                  ))}
                </select>
              </div>

              {/* Advanced Filters Toggle */}
              <div className="flex items-end">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-heading rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 shadow-sm hover:shadow-md hover:scale-105"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </button>
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <button
                  onClick={handleExecuteSearch}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all duration-300 shadow-glass hover:shadow-glass hover:scale-105 transform"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="pt-6 border-t border-glass-border">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-heading">
                      Minimum Rating: {minRating.toFixed(1)} ⭐
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={0.1}
                      value={minRating}
                      onChange={(e) => setMinRating(Number(e.target.value))}
                      className="w-full h-2 bg-base-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-heading">
                      Minimum Popularity: {minPopularity}%
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={minPopularity}
                      onChange={(e) => setMinPopularity(Number(e.target.value))}
                      className="w-full h-2 bg-base-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Search History */}
                {history.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-heading">Recent Searches</h3>
                      <button 
                        onClick={handleClearHistory} 
                        className="text-sm text-body-muted hover:text-heading hover:bg-base-100 px-3 py-1 rounded-lg transition-colors duration-200"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {history.slice(0, 6).map((h) => (
                        <button
                          key={h.id}
                          onClick={() => applyHistory(h.query, h.filters)}
                          className="px-4 py-2 rounded-lg text-sm bg-base-100 hover:bg-base-200 text-heading transition-all duration-200"
                          title={h.query}
                        >
                          {h.query || 'Untitled'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Results Count and Sort */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
            <p className="text-lg text-heading font-medium">
              {filteredCities.length} cities found
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-heading">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 glass-card border-glass-border-2 border-glass-border rounded-2xl focus:ring-4 focus:ring-orange-100/50 focus:border-orange-400 transition-all duration-300 appearance-none cursor-pointer pr-10 shadow-glass hover:shadow-glass hover:border-orange-300 font-medium text-heading min-w-[140px]"
            >
              <option value="popularity">Popularity</option>
              <option value="rating">Rating</option>
              <option value="cost">Cost</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        {/* Cities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCities.map((city, index) => (
            <div
              key={city.id}
              className="glass-card rounded-2xl shadow-glass border border-glass-border overflow-hidden hover:shadow-glass transition-all duration-300"
              onMouseEnter={() => setHoveredCity(city.id)}
              onMouseLeave={() => setHoveredCity(null)}
            >
              {/* City Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                
                {/* Region Badge */}
                <div className="absolute top-4 right-4">
                  <span className="bg-white/95 px-3 py-1.5 rounded-lg text-sm font-semibold text-heading shadow-glass">
                    {city.region}
                  </span>
                </div>

                {/* City Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-1">
                    {city.name}
                  </h3>
                  <p className="text-lg opacity-90">
                    {city.country}
                  </p>
                </div>
              </div>

              {/* City Info */}
              <div className="p-6 space-y-4">
                <p className="text-body-muted leading-relaxed">
                  {city.description}
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-base-50 rounded-lg">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="text-sm font-semibold text-heading">{city.rating}</p>
                      <p className="text-xs text-body-muted">{city.popularity}% popular</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-base-50 rounded-lg">
                    <DollarSign className={`w-5 h-5 ${getCostColor(city.costIndex)}`} />
                    <div>
                      <p className="text-sm font-semibold text-heading">
                        {(() => {
                          const range = parseDailyBudgetRange(city.dailyBudget);
                          if (range) {
                            const minFormatted = formatCurrencyForUser(range.min, 'USD', getUserPreferredCurrency());
                            const maxFormatted = formatCurrencyForUser(range.max, 'USD', getUserPreferredCurrency());
                            return `${minFormatted}-${maxFormatted}`;
                          }
                          return city.dailyBudget;
                        })()}
                      </p>
                      <p className="text-xs text-body-muted">per day</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-base-50 rounded-lg">
                    <Thermometer className="w-5 h-5 text-primary-400" />
                    <div>
                      <p className="text-sm font-semibold text-heading">{city.temperature}</p>
                      <p className="text-xs text-body-muted">current</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-base-50 rounded-lg">
                    <Clock className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-sm font-semibold text-heading">Best Time</p>
                      <p className="text-xs text-body-muted">{city.bestTime}</p>
                    </div>
                  </div>
                </div>

                {/* Highlights */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-heading flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-error-400" />
                    <span>Top Attractions</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {city.highlights.slice(0, 3).map((highlight, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-1.5 bg-primary-950 text-primary-200 text-xs rounded-lg border border-primary-500/30"
                      >
                        {highlight}
                      </span>
                    ))}
                    {city.highlights.length > 3 && (
                      <span className="px-3 py-1.5 bg-base-50 text-body-muted text-xs rounded-lg border border-glass-border">
                        +{city.highlights.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-glass-border space-y-3">
                  <button
                    onClick={handleAddToTrip}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <span>Add to Trip</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-primary-600 rounded-2xl p-8 shadow-glass">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
            <p className="text-xl text-blue-100 mb-6">Create your perfect trip with our curated city experiences</p>
            <button
              onClick={handleAddToTrip}
              className="bg-base-50 text-primary-400 px-8 py-4 rounded-xl font-semibold text-lg shadow-glass hover:shadow-glass transition-all duration-200"
            >
              Start Planning Now
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced CSS for range sliders and dropdowns */}
      <style dangerouslySetInnerHTML={{
        __html: `
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            height: 18px;
            width: 18px;
            border-radius: 50%;
            background: #2563eb;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
          
          input[type="range"]::-moz-range-thumb {
            height: 18px;
            width: 18px;
            border-radius: 50%;
            background: #2563eb;
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }

          /* Enhanced dropdown styling */
          select {
            background-image: none !important;
          }

          select option {
            padding: 12px 16px;
            margin: 4px;
            border-radius: 8px;
            background: white;
            color: #374151;
            font-weight: 500;
            transition: all 0.2s ease;
          }

          select option:hover {
            background: #f3f4f6;
            color: #1f2937;
          }

          select option:checked {
            background: #dbeafe;
            color: #1e40af;
            font-weight: 600;
          }

          /* Custom scrollbar for dropdown */
          select::-webkit-scrollbar {
            width: 8px;
          }

          select::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 8px;
          }

          select::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 8px;
            border: 2px solid #f1f5f9;
          }

          select::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `
      }} />
    </div>
  );
};

export default CitySearch;
