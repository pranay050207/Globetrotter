import React from 'react';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '../../utils/useScrollAnimation';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const footerRef = useScrollAnimation();

  return (
    <footer 
      ref={footerRef.elementRef}
      className={`bg-base border-t border-glass-border text-heading relative overflow-hidden ${footerRef.isVisible ? 'animate-fade-in-up' : ''}`}
    >
      {/* Subtle background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary-500/5 rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent-500/5 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-6 group">
              <Link to="/" className="flex items-center hover:opacity-80 transition-all duration-300 transform hover:scale-105">
                <div className="relative">
                  <img src="/assests/logo.png" alt="GlobeTrotter" className="h-10 w-10 mr-4 drop-shadow-lg" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-400 rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-2xl font-bold gradient-text">GlobeTrotter</h3>
              </Link>
            </div>
            <p className="text-body-muted mb-8 max-w-lg leading-relaxed text-lg">
              Your ultimate travel companion for creating unforgettable journeys. 
              Plan, explore, and discover the world with our comprehensive travel planning platform.
            </p>
          </div>

          {/* Quick Links */}
          <div className="animate-fade-in-up animate-delay-200">
            <h4 className="text-xl font-semibold mb-6 text-heading flex items-center">
              <span className="w-1 h-6 bg-gradient-to-b from-primary-400 to-accent-500 rounded-full mr-3"></span>
              Quick Links
            </h4>
            <ul className="space-y-4">
              {[
                { to: "/dashboard", label: "Dashboard" },
                { to: "/trips", label: "My Trips" },
                { to: "/city-search", label: "Explore Cities" },
                { to: "/activity-search", label: "Find Activities" }
              ].map((link, index) => (
                <li key={index} className="animate-fade-in-left" style={{ animationDelay: `${(index + 1) * 100}ms` }}>
                  <Link 
                    to={link.to} 
                    className="text-body-muted hover:text-primary-400 transition-all duration-300 flex items-center group hover:translate-x-1"
                  >
                    <span className="w-2 h-2 bg-primary-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Support */}
          <div className="animate-fade-in-up animate-delay-400">
            <h4 className="text-xl font-semibold mb-6 text-heading flex items-center">
              <span className="w-1 h-6 bg-gradient-to-b from-accent-500 to-primary-400 rounded-full mr-3"></span>
              Legal & Support
            </h4>
            <ul className="space-y-4">
              {[
                { to: "/terms", label: "Terms & Conditions" },
                { to: "/privacy", label: "Privacy Policy" },
                { href: "mailto:somu8608@gmail.com", label: "Contact Support", isMail: true }
              ].map((link, index) => (
                <li key={index} className="animate-fade-in-left" style={{ animationDelay: `${(index + 1) * 100}ms` }}>
                  {link.isMail ? (
                    <a 
                      href={link.href}
                      className="text-body-muted hover:text-accent-400 transition-all duration-300 flex items-center group hover:translate-x-1"
                    >
                      <span className="w-2 h-2 bg-accent-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
                      {link.label}
                    </a>
                  ) : (
                    <Link 
                      to={link.to!} 
                      className="text-body-muted hover:text-accent-400 transition-all duration-300 flex items-center group hover:translate-x-1"
                    >
                      <span className="w-2 h-2 bg-accent-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-glass-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-body-muted text-sm animate-fade-in-up animate-delay-600">
              © {currentYear} GlobeTrotter. All rights reserved.
            </p>
          
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
