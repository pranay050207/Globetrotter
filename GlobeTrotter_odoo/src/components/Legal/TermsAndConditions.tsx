import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, ArrowLeft, CheckCircle } from 'lucide-react';
import { useScrollAnimation } from '../../utils/useScrollAnimation';

const TermsAndConditions: React.FC = () => {
  const headerRef = useScrollAnimation();
  const contentRef = useScrollAnimation();

  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Header */}
      <div 
        ref={headerRef.elementRef}
        className={`glass-card shadow-soft border-b border-glass-border relative overflow-hidden ${headerRef.isVisible ? 'animate-fade-in-down' : ''}`}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10/50 to-accent-500/10/50"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center group">
              <div className="relative">
                <img src="/assests/logo.png" alt="GlobeTrotter" className="h-10 w-10 mr-4 drop-shadow-glass" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-500/100 rounded-full animate-pulse"></div>
              </div>
              <h1 className="text-3xl font-bold text-heading gradient-text">GlobeTrotter</h1>
            </div>
            <Link 
              to="/login" 
              className="btn-secondary group flex items-center hover:shadow-glow"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              Back to App
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div 
        ref={contentRef.elementRef}
        className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 ${contentRef.isVisible ? 'animate-fade-in-up' : ''}`}
      >
        <div className="card p-10 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full opacity-20 -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent-100 to-primary-100 rounded-full opacity-20 translate-y-12 -translate-x-12"></div>
          
          <div className="relative z-10">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-primary-500/15 rounded-2xl flex items-center justify-center mr-4">
                <FileText className="h-6 w-6 text-primary-600" />
              </div>
              <h1 className="text-4xl font-bold text-heading">Terms and Conditions</h1>
            </div>
            
            <div className="prose prose-lg max-w-none">
              <div className="bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-2xl p-6 mb-8 border border-primary-100">
                <p className="text-body-muted mb-0 flex items-center">
                  <CheckCircle className="w-5 h-5 text-success-500 mr-3" />
                  <strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>

              {[
                                  {
                    title: "1. Acceptance of Terms",
                    content: "By accessing and using GlobeTrotter (\"the Service\"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service."
                  },
                {
                  title: "2. Description of Service",
                  content: "GlobeTrotter is a travel planning platform that allows users to create, organize, and share travel itineraries. Our service includes:",
                  list: [
                    "Trip planning and itinerary creation",
                    "City and activity search functionality",
                    "Budget tracking and management",
                    "Social sharing of travel plans",
                    "Travel recommendations and insights"
                  ]
                },
                {
                  title: "3. User Accounts",
                  content: "To access certain features of the Service, you must create an account. You are responsible for:",
                  list: [
                    "Maintaining the confidentiality of your account credentials",
                    "All activities that occur under your account",
                    "Providing accurate and complete information",
                    "Notifying us immediately of any unauthorized use"
                  ]
                },
                {
                  title: "4. User Conduct",
                  content: "You agree not to use the Service to:",
                  list: [
                    "Violate any applicable laws or regulations",
                    "Infringe upon the rights of others",
                    "Upload or transmit harmful, offensive, or inappropriate content",
                    "Attempt to gain unauthorized access to the Service",
                    "Interfere with the proper functioning of the Service"
                  ]
                },
                {
                  title: "5. Content and Intellectual Property",
                  content: "Users retain ownership of content they create and share. By using our Service, you grant GlobeTrotter a worldwide, non-exclusive license to use, store, and display your content solely for the purpose of providing the Service. The Service itself, including its design, functionality, and software, is owned by GlobeTrotter and protected by intellectual property laws."
                },
                {
                  title: "6. Privacy and Data Protection",
                  content: "Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices regarding the collection and use of your personal information."
                },
                                  {
                    title: "7. Disclaimers and Limitations",
                    content: "The Service is provided \"as is\" without warranties of any kind. GlobeTrotter is not responsible for:",
                  list: [
                    "The accuracy of travel information provided by third parties",
                    "Travel arrangements or bookings made through external services",
                    "Any damages or losses incurred during travel",
                    "Service interruptions or technical issues"
                  ]
                },
                {
                  title: "8. Termination",
                  content: "We may terminate or suspend your account and access to the Service at any time, with or without cause, with or without notice. Upon termination, your right to use the Service will cease immediately."
                },
                {
                  title: "9. Changes to Terms",
                  content: "We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the Service. Your continued use of the Service after such modifications constitutes acceptance of the updated terms."
                },
                {
                  title: "10. Contact Information",
                  content: "If you have any questions about these Terms and Conditions, please contact us at:",
                  contact: {
                    email: "legal@globetrotter.com",
                    address: "GlobeTrotter Legal Department",
                    fullAddress: "123 Travel Street, Adventure City, AC 12345"
                  }
                }
              ].map((section, index) => (
                <section key={index} className="mb-10 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <h2 className="text-2xl font-semibold text-heading mb-4 flex items-center">
                    <Shield className="w-6 h-6 text-primary-500 mr-3" />
                    {section.title}
                  </h2>
                  <p className="text-heading mb-4 leading-relaxed">
                    {section.content}
                  </p>
                  
                  {section.list && (
                    <ul className="list-none space-y-3">
                      {section.list.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start">
                          <div className="w-2 h-2 bg-primary-500/100 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-heading">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  {section.contact && (
                    <div className="bg-gradient-to-r from-secondary-50 to-primary-50 p-6 rounded-2xl border border-glass-border">
                      <p className="text-heading mb-0">
                        <strong>Email:</strong> {section.contact.email}<br />
                        <strong>Address:</strong> {section.contact.address}<br />
                        {section.contact.fullAddress}
                      </p>
                    </div>
                  )}
                </section>
              ))}

              <div className="border-t border-glass-border pt-8 mt-12 animate-fade-in-up animate-delay-1000">
                <div className="text-center">
                  <p className="text-sm text-body-muted mb-4">
                    By using GlobeTrotter, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
                  </p>
                  <div className="flex items-center justify-center space-x-2">
                    <Shield className="w-5 h-5 text-success-500" />
                    <span className="text-sm text-success-600 font-medium">Terms Accepted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
