import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Upload, Save, X, Image as ImageIcon, Sparkles, Plane, Globe, Zap, Lightbulb, Compass } from 'lucide-react';
import { apiFetch } from '../../utils/api';
import { ROUTES } from '../../utils/navigation';
import { useScrollAnimation } from '../../utils/useScrollAnimation';

interface CreateTripProps {
  onNavigate: (screen: any) => void;
}

const CreateTrip: React.FC<CreateTripProps> = ({ onNavigate }) => {
  const [tripData, setTripData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    destinations: '',
    budget: '',
    isPublic: false
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const headerRef = useScrollAnimation();
  const formRef = useScrollAnimation();
  const sidebarRef = useScrollAnimation();

  const availableDestinations = ['Paris', 'Rome', 'Barcelona', 'London', 'Amsterdam', 'Berlin', 'Vienna',
    'Tokyo', 'Bangkok', 'Singapore', 'Seoul', 'Hong Kong', 'Mumbai', 'Bali',
    'New York', 'Los Angeles', 'Toronto', 'Vancouver', 'Chicago', 'Miami',
    'Sydney', 'Melbourne', 'Auckland', 'Perth',
    'Rio de Janeiro', 'Buenos Aires', 'Lima', 'Santiago',
    'Cape Town', 'Cairo', 'Marrakech', 'Nairobi']

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: string | boolean) => {
    setTripData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (file: File) => {
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setCoverImage(file);
      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    setCoverImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let coverImageUrl: string | undefined = undefined;

      // If there's a cover image, upload it to Cloudinary first
      if (coverImage) {
        try {
          const formData = new FormData();
          formData.append('file', coverImage);
          
          const uploadResponse = await apiFetch<{ url: string }>('/upload/cover-image', {
            method: 'POST',
            body: formData,
            isFormData: true
          });
          
          coverImageUrl = uploadResponse.url;
        } catch (uploadError) {
          console.warn('Failed to upload cover image, continuing without it:', uploadError);
          // Continue without the cover image
        }
      }

      const payload = {
        title: tripData.title,
        description: tripData.description || undefined,
        start_date: tripData.startDate,
        end_date: tripData.endDate,
        destinations: tripData.destinations,
        estimated_budget: tripData.budget ? Number(String(tripData.budget).replace(/[^0-9.]/g, '')) : undefined,
        is_public: tripData.isPublic,
        cover_image: coverImageUrl
      };
      
      // Validate required fields
      if (!tripData.title.trim()) {
        throw new Error('Trip title is required');
      }
      if (!tripData.startDate) {
        throw new Error('Start date is required');
      }
      if (!tripData.endDate) {
        throw new Error('End date is required');
      }
      if (new Date(tripData.startDate) >= new Date(tripData.endDate)) {
        throw new Error('End date must be after start date');
      }
      
      const response = await apiFetch('/trips/', { method: 'POST', body: JSON.stringify(payload) });
      
      // Store the created trip data in localStorage so the itinerary builder can access it
      localStorage.setItem('currentTrip', JSON.stringify(response));
      
      navigate(ROUTES.ITINERARY_BUILDER);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create trip');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToTrips = () => {
    navigate(ROUTES.TRIPS);
  };

  const inspirationImages = [
    'https://images.pexels.com/photos/1194713/pexels-photo-1194713.jpeg?auto=compress&cs=tinysrgb&w=200',
    'https://images.pexels.com/photos/161401/fushimi-inari-taisha-shrine-kyoto-japan-temple-161401.jpeg?auto=compress&cs=tinysrgb&w=200',
    'https://images.pexels.com/photos/290595/pexels-photo-290595.jpeg?auto=compress&cs=tinysrgb&w=200',
    'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=200',
  ];

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
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={handleBackToTrips}
              className="btn-secondary p-3 hover:shadow-medium transition-all duration-300 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            </button>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-primary-500/15 rounded-2xl flex items-center justify-center">
                  <Plane className="w-8 h-8 text-primary-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-accent-500/100 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-heading gradient-text mb-2">
                  Create New Adventure
                </h1>
                <p className="text-lg text-body-muted flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-accent-500 animate-pulse" />
                  Plan your next incredible journey
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div 
            ref={formRef.elementRef as React.RefObject<HTMLDivElement>}
            className={`lg:col-span-2 ${formRef.isVisible ? 'animate-fade-in-up' : ''}`}
          >
            <form onSubmit={handleSubmit} className="card p-8 space-y-8">
              {/* Trip Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-heading mb-3">
                  Trip Title *
                </label>
                <input
                  id="title"
                  type="text"
                  value={tripData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                  className="input-field group-hover:shadow-medium focus:shadow-glow"
                  placeholder="e.g., European Summer Adventure"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-heading mb-3">
                  Description
                </label>
                <textarea
                  id="description"
                  value={tripData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="input-field resize-none group-hover:shadow-medium focus:shadow-glow"
                  placeholder="Describe your trip plans, goals, or any special notes..."
                />
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-semibold text-heading mb-3">
                    Start Date *
                  </label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-body-muted group-focus-within:text-primary-500 transition-colors duration-300" />
                    <input
                      id="startDate"
                      type="date"
                      value={tripData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      required
                      className="input-field pl-12 group-hover:shadow-medium focus:shadow-glow"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-semibold text-heading mb-3">
                    End Date *
                  </label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-body-muted group-focus-within:text-primary-500 transition-colors duration-300" />
                    <input
                      id="endDate"
                      type="date"
                      value={tripData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      required
                      className="input-field pl-12 group-hover:shadow-medium focus:shadow-glow"
                    />
                  </div>
                </div>
              </div>

              {/* Destinations */}
              <div>
                <label htmlFor="destinations" className="block text-sm font-semibold text-heading mb-3">
                  Destinations *
                </label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-body-muted group-focus-within:text-primary-500 transition-colors duration-300" />
                  <input
                    id="destinations"
                    list="destination-suggestions"
                    type="text"
                    value={tripData.destinations}
                    required
                    onChange={(e) => handleInputChange('destinations', e.target.value)}
                    className="input-field pl-12 group-hover:shadow-medium focus:shadow-glow"
                    placeholder="e.g., Paris, Rome, Barcelona (separate with commas)"
                  />
                  <datalist id="destination-suggestions">
                    {availableDestinations.map(dest => (
                      <option key={dest} value={dest} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Budget */}
              <div>
                <label htmlFor="budget" className="block text-sm font-semibold text-heading mb-3">
                  Your Budget
                </label>
                <input
                  id="budget"
                  type="number"
                  min="0"
                  value={tripData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  className="input-field group-hover:shadow-medium focus:shadow-glow"
                  placeholder="e.g., 3000"
                />
              </div>

              {/* Cover Photo */}
              <div>
                <label className="block text-sm font-semibold text-heading mb-3">
                  Cover Photo
                </label>

                {coverImagePreview ? (
                  <div className="relative group">
                    <img
                      src={coverImagePreview}
                      alt="Cover preview"
                      className="w-full h-56 object-cover rounded-2xl border border-glass-border group-hover:shadow-medium transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={removeCoverImage}
                      className="absolute top-4 right-4 p-3 bg-error-500 text-white rounded-full hover:bg-error-600 transition-all duration-300 transform hover:scale-110 shadow-glass"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer group ${
                      isDragOver
                        ? 'border-primary-500 bg-primary-500/10 shadow-medium'
                        : 'border-glass-border hover:border-primary-300 hover:bg-primary-500/10/30'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className={`w-12 h-12 mx-auto mb-4 ${
                      isDragOver ? 'text-primary-500' : 'text-body-muted group-hover:text-primary-500'
                    } transition-colors duration-300`} />
                    <p className={`text-lg mb-2 font-medium ${
                      isDragOver ? 'text-primary-600' : 'text-body-muted group-hover:text-primary-600'
                    } transition-colors duration-300`}>
                      {isDragOver ? 'Drop your image here' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-sm text-body-muted">
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {error && (
                  <p className="mt-3 text-sm text-error-600 bg-error-50 border border-error-200 rounded-xl p-3">{error}</p>
                )}
              </div>

              {/* Privacy Settings */}
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-2xl border border-primary-200">
                <div>
                  <h4 className="font-semibold text-heading mb-2">Make trip public</h4>
                  <p className="text-body-muted">Allow others to view and copy your itinerary</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tripData.isPublic}
                    onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-base-50 after:border-glass-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex items-center space-x-4 pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary group flex items-center disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="loading-spinner mr-3"></div>
                      <span>Creating Adventure...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                      <span>Create Adventure</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleBackToTrips}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div 
            ref={sidebarRef.elementRef as React.RefObject<HTMLDivElement>}
            className={`space-y-6 ${sidebarRef.isVisible ? 'animate-fade-in-up' : ''}`}
          >
           
            {/* Inspiration */}
            <div className="card p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-accent-500/15 rounded-2xl flex items-center justify-center">
                  <Compass className="w-5 h-5 text-accent-600" />
                </div>
                <h3 className="text-xl font-bold text-heading">Get Inspired</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {inspirationImages.map((image, index) => (
                  <div key={index} className="relative group cursor-pointer">
                    <img
                      src={image}
                      alt={`Inspiration ${index + 1}`}
                      className="w-full h-24 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => onNavigate(ROUTES.CITY_SEARCH)}
                className="btn-secondary w-full group"
              >
                <Globe className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                Explore Destinations
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTrip;
