import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users, Globe, ArrowRight, Sparkles, Star, Zap, Shield } from 'lucide-react';
import { useScrollAnimation, useStaggeredAnimation } from '../../utils/useScrollAnimation';
import { getHomepageStats } from '../../utils/api';
import FluidCanvas from '../FluidCanvas';

interface LandingPageProps {
  isAuthenticated?: boolean;
}

const LandingPage: React.FC<LandingPageProps> = ({ isAuthenticated = false }) => {
  const heroRef = useScrollAnimation();
  const featuresRef = useScrollAnimation();
  const ctaRef = useScrollAnimation();
  const animatedFeatures = useStaggeredAnimation(4, 200);
  
  const [stats, setStats] = useState({
    travelers: { count: 0, display: "50K+", label: "Happy Travelers" },
    countries: { count: 0, display: "150+", label: "Countries Covered" },
    trips: { count: 0, display: "1M+", label: "Trips Planned" }
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsData = await getHomepageStats();
        setStats(statsData);
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
        // Keep fallback values if API fails
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-dark-base">
      {/* Hero Section */}
      <section 
        ref={heroRef.elementRef}
        className={`relative min-h-screen flex flex-col items-center justify-center overflow-hidden ${heroRef.isVisible ? 'animate-fade-in' : ''}`}
      >
        {/* Fluid Canvas Background */}
        <FluidCanvas />

        {/* Scrim Overlay */}
        <div aria-hidden="true" className="absolute inset-0 z-[1] pointer-events-none scrim-overlay" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center w-full max-w-[22rem] sm:max-w-[40rem] lg:max-w-[52rem] text-center px-5 sm:px-10">
          {/* Badge Pill */}
          <div className="glass-pill px-4 py-1.5 text-xs sm:text-sm text-body-muted animate-fade-in-up" style={{ animationDelay: '320ms' }}>
            <Star className="w-3.5 h-3.5 text-warning-400 fill-current mr-1.5" />
            {isLoadingStats ? '...' : stats.travelers.display} already exploring
          </div>

          {/* Main Heading */}
          <h1 className="mt-5 sm:mt-7 text-3xl sm:text-5xl lg:text-6xl font-semibold leading-[1.1] tracking-tight text-heading animate-fade-in-up" style={{ animationDelay: '480ms' }}>
            Plan Your Dream Trip with{' '}
            <span className="gradient-text">GlobeTrotter</span>
          </h1>

          {/* Sub-line */}
          <p className="mt-4 sm:mt-5 text-base sm:text-lg lg:text-xl leading-relaxed text-body-muted max-w-[20rem] sm:max-w-[34rem] animate-fade-in-up" style={{ animationDelay: '1150ms' }}>
            Create unforgettable travel experiences. Discover destinations, plan activities, and share adventures with fellow travelers.
          </p>

          {/* CTA Buttons */}
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-7 sm:mt-10 animate-fade-in-up" style={{ animationDelay: '1450ms' }}>
              <Link
                to="/signup"
                className="btn-primary group relative overflow-hidden text-base px-8 py-3"
              >
                <span className="relative z-10 flex items-center">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
              
              <Link
                to="/login"
                className="btn-secondary group text-base"
              >
                <span className="flex items-center">
                  Sign In
                  <Shield className="ml-2 h-5 w-5 text-primary-400" />
                </span>
              </Link>
            </div>
          )}

          {isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-7 sm:mt-10 animate-fade-in-up" style={{ animationDelay: '1450ms' }}>
              <Link
                to="/dashboard"
                className="btn-primary group relative overflow-hidden text-base px-8 py-3"
              >
                <span className="relative z-10 flex items-center">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </div>
          )}

          {/* Trust indicators */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-body-muted animate-fade-in-up" style={{ animationDelay: '1650ms' }}>
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-warning-400 fill-current" />
              <span className="text-sm font-medium">
                Trusted by {isLoadingStats ? "..." : stats.travelers.display} travelers
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-primary-400" />
              <span className="text-sm font-medium">Lightning fast planning</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-success-400" />
              <span className="text-sm font-medium">Secure & private</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        ref={featuresRef.elementRef}
        className={`py-24 px-4 sm:px-6 lg:px-8 relative ${featuresRef.isVisible ? 'animate-fade-in' : ''}`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-base via-base-100 to-base"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-heading mb-6">
              Everything You Need for{' '}
              <span className="gradient-text">Perfect Travel Planning</span>
            </h2>
            <p className="text-lg text-body-muted max-w-3xl mx-auto">
              Our platform combines cutting-edge technology with intuitive design to make your travel dreams a reality.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: MapPin,
                title: "Smart Itinerary Builder",
                description: "Create detailed travel plans with our intuitive drag-and-drop interface",
                gradient: "from-primary-500/20 to-primary-600/5",
                iconColor: "text-primary-400",
                delay: 0
              },
              {
                icon: Calendar,
                title: "Activity Discovery",
                description: "Find the best activities and attractions in any destination",
                gradient: "from-success-500/20 to-success-600/5",
                iconColor: "text-success-400",
                delay: 1
              },
              {
                icon: Users,
                title: "Social Sharing",
                description: "Share your travel plans and get inspiration from other travelers",
                gradient: "from-accent-500/20 to-accent-600/5",
                iconColor: "text-accent-400",
                delay: 2
              },
              {
                icon: Globe,
                title: "Global Coverage",
                description: "Access information about cities and activities worldwide",
                gradient: "from-warning-500/20 to-warning-600/5",
                iconColor: "text-warning-400",
                delay: 3
              }
            ].map((feature, index) => (
              <div
                key={index}
                className={`glass-card p-8 text-center transform transition-all duration-700 hover:bg-white/10 hover:-translate-y-1 ${
                  animatedFeatures[index] 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center`}>
                  <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold text-heading mb-3">{feature.title}</h3>
                <p className="text-body-muted leading-relaxed text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/30 via-accent-900/20 to-primary-900/30"></div>
        <div className="absolute inset-0 border-y border-glass-border"></div>
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { number: stats.travelers.display, label: stats.travelers.label, icon: Users },
              { number: stats.countries.display, label: stats.countries.label, icon: Globe },
              { number: stats.trips.display, label: stats.trips.label, icon: MapPin }
            ].map((stat, index) => (
              <div key={index} className="animate-fade-in-up" style={{ animationDelay: `${index * 200}ms` }}>
                <div className="text-4xl font-bold text-heading mb-2">
                  {isLoadingStats ? (
                    <div className="animate-pulse bg-white/10 h-12 w-24 mx-auto rounded"></div>
                  ) : (
                    stat.number
                  )}
                </div>
                <div className="text-body-muted mb-4">{stat.label}</div>
                <stat.icon className="h-8 w-8 text-primary-400/50 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        ref={ctaRef.elementRef}
        className={`py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden ${ctaRef.isVisible ? 'animate-fade-in' : ''}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-accent-900/10 to-primary-900/20"></div>
        
        {/* Floating elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary-400/5 rounded-full animate-float"></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-accent-400/5 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <Sparkles className="h-16 w-16 text-primary-400/60 mx-auto mb-6 animate-pulse-slow" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-heading mb-6">
              Ready to Start Your Adventure?
            </h2>
            <p className="text-lg text-body-muted mb-10 leading-relaxed">
              Join thousands of travelers who trust GlobeTrotter for their trip planning needs. 
              Your next unforgettable journey starts here.
            </p>
          </div>
          
          {/* CTA Buttons - Only show for non-authenticated users */}
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/signup"
                className="btn-white text-base px-8 py-3 hover:shadow-glow transition-all duration-300 transform hover:scale-105"
              >
                <span className="flex items-center">
                  Create Your First Trip
                  <ArrowRight className="ml-2 h-5 w-5" />
                </span>
              </Link>

              <Link
                to="/login"
                className="btn-secondary text-base"
              >
                <span className="flex items-center">
                  Sign In to Continue
                  <Shield className="ml-2 h-5 w-5 text-primary-400" />
                </span>
              </Link>
            </div>
          )}
          
          {/* Trust badges */}
          <div className="mt-12 flex items-center justify-center space-x-8 text-body-muted/70">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse"></div>
              <span className="text-sm">SSL Secured</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <span className="text-sm">24/7 Support</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              <span className="text-sm">Free Forever</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
