import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, ArrowLeft, CheckCircle, Eye, Database, Users, Globe } from 'lucide-react';
import { useScrollAnimation } from '../../utils/useScrollAnimation';

const PrivacyPolicy: React.FC = () => {
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
        <div className="absolute inset-0 bg-gradient-to-r from-accent-50/50 to-primary-50/50"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center group">
              <div className="relative">
                <img src="/assests/logo.png" alt="GlobeTrotter" className="h-10 w-10 mr-4 drop-shadow-glass" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500/100 rounded-full animate-pulse"></div>
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
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent-100 to-primary-100 rounded-full opacity-20 -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary-100 to-accent-100 rounded-full opacity-20 translate-y-12 -translate-x-12"></div>
          
          <div className="relative z-10">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-accent-500/15 rounded-2xl flex items-center justify-center mr-4">
                <Lock className="h-6 w-6 text-accent-600" />
              </div>
              <h1 className="text-4xl font-bold text-heading">Privacy Policy</h1>
            </div>
            
            <div className="prose prose-lg max-w-none">
              <div className="bg-gradient-to-r from-accent-50 to-primary-50 rounded-2xl p-6 mb-8 border border-accent-100">
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
                  title: "1. Introduction",
                  content: "At GlobeTrotter, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our travel planning platform. By using our Service, you consent to the data practices described in this policy. If you do not agree with our policies and practices, please do not use our Service."
                },
                {
                  title: "2. Information We Collect",
                  icon: Database,
                  subsections: [
                    {
                      title: "2.1 Personal Information",
                      content: "We collect information that you provide directly to us, including:",
                      list: [
                        "Account information (name, email address, password)",
                        "Profile information (profile picture, bio, preferences)",
                        "Travel plans and itineraries",
                        "Communication preferences",
                        "Payment information (processed securely through third-party providers)"
                      ]
                    },
                    {
                      title: "2.2 Usage Information",
                      content: "We automatically collect certain information about your use of the Service:",
                      list: [
                        "Device information (IP address, browser type, operating system)",
                        "Usage patterns and preferences",
                        "Search queries and interactions",
                        "Performance data and error logs"
                      ]
                    },
                    {
                      title: "2.3 Location Information",
                      content: "With your consent, we may collect location information to provide location-based services and recommendations."
                    }
                  ]
                },
                {
                  title: "3. How We Use Your Information",
                  icon: Users,
                  content: "We use the collected information for the following purposes:",
                  list: [
                    "Providing and maintaining the Service",
                    "Personalizing your experience and recommendations",
                    "Processing transactions and payments",
                    "Communicating with you about updates and features",
                    "Improving our services and user experience",
                    "Ensuring security and preventing fraud",
                    "Complying with legal obligations"
                  ]
                },
                {
                  title: "4. Information Sharing and Disclosure",
                  content: "We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:",
                  list: [
                    "Service Providers: With trusted third-party service providers who assist in operating our platform",
                    "Legal Requirements: When required by law or to protect our rights and safety",
                    "Business Transfers: In connection with a merger, acquisition, or sale of assets",
                    "User Consent: When you explicitly consent to sharing",
                    "Public Content: Information you choose to make public (e.g., shared itineraries)"
                  ]
                },
                {
                  title: "5. Data Security",
                  icon: Shield,
                  content: "We implement appropriate technical and organizational measures to protect your personal information:",
                  list: [
                    "Encryption of data in transit and at rest",
                    "Regular security assessments and updates",
                    "Access controls and authentication measures",
                    "Secure data centers and infrastructure",
                    "Employee training on data protection"
                  ],
                  note: "However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security."
                },
                {
                  title: "6. Data Retention",
                  content: "We retain your personal information for as long as necessary to:",
                  list: [
                    "Provide our services to you",
                    "Comply with legal obligations",
                    "Resolve disputes and enforce agreements",
                    "Improve our services"
                  ],
                  note: "You may request deletion of your account and associated data at any time through your account settings."
                },
                {
                  title: "7. Your Rights and Choices",
                  content: "You have the following rights regarding your personal information:",
                  list: [
                    "Access: Request a copy of your personal data",
                    "Correction: Update or correct inaccurate information",
                    "Deletion: Request deletion of your personal data",
                    "Portability: Request transfer of your data to another service",
                    "Objection: Object to certain processing activities",
                    "Withdrawal: Withdraw consent for data processing"
                  ]
                },
                {
                  title: "8. Cookies and Tracking Technologies",
                  content: "We use cookies and similar technologies to enhance your experience:",
                  list: [
                    "Essential Cookies: Required for basic functionality",
                    "Analytics Cookies: Help us understand how you use our service",
                    "Preference Cookies: Remember your settings and preferences",
                    "Marketing Cookies: Deliver relevant content and advertisements"
                  ],
                  note: "You can control cookie preferences through your browser settings."
                },
                {
                  title: "9. International Data Transfers",
                  content: "Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy and applicable laws."
                },
                {
                  title: "10. Children's Privacy",
                  content: "Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us immediately."
                },
                {
                  title: "11. Changes to This Policy",
                  content: "We may update this Privacy Policy from time to time. We will notify you of any material changes by:",
                  list: [
                    "Posting the updated policy on our website",
                    "Sending email notifications to registered users",
                    "Displaying prominent notices within the Service"
                  ],
                  note: "Your continued use of the Service after such changes constitutes acceptance of the updated policy."
                },
                {
                  title: "12. Contact Us",
                  icon: Globe,
                  content: "If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:",
                  contact: {
                    email: "privacy@globetrotter.com",
                    address: "GlobeTrotter Privacy Officer",
                    fullAddress: "123 Travel Street, Adventure City, AC 12345",
                    phone: "+1 (555) 123-4567"
                  }
                }
              ].map((section, index) => (
                <section key={index} className="mb-10 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <h2 className="text-2xl font-semibold text-heading mb-4 flex items-center">
                    {section.icon ? (
                      <section.icon className="w-6 h-6 text-accent-500 mr-3" />
                    ) : (
                      <Shield className="w-6 h-6 text-primary-500 mr-3" />
                    )}
                    {section.title}
                  </h2>
                  
                  {section.content && (
                    <p className="text-heading mb-4 leading-relaxed">
                      {section.content}
                    </p>
                  )}
                  
                  {section.subsections && (
                    <div className="space-y-6">
                      {section.subsections.map((subsection, subIndex) => (
                        <div key={subIndex} className="ml-6">
                          <h3 className="text-xl font-semibold text-heading mb-3">{subsection.title}</h3>
                          <p className="text-heading mb-3 leading-relaxed">{subsection.content}</p>
                          {subsection.list && (
                            <ul className="list-none space-y-2">
                              {subsection.list.map((item, itemIndex) => (
                                <li key={itemIndex} className="flex items-start">
                                  <div className="w-2 h-2 bg-accent-500/100 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                  <span className="text-heading">{item}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {section.list && (
                    <ul className="list-none space-y-3">
                      {section.list.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start">
                          <div className="w-2 h-2 bg-accent-500/100 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-heading">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  {section.note && (
                    <div className="mt-4 p-4 bg-warning-50 border border-warning-200 rounded-xl">
                      <p className="text-warning-700 text-sm">{section.note}</p>
                    </div>
                  )}
                  
                  {section.contact && (
                    <div className="bg-gradient-to-r from-secondary-50 to-accent-500/10 p-6 rounded-2xl border border-glass-border">
                      <p className="text-heading mb-0">
                        <strong>Email:</strong> {section.contact.email}<br />
                        <strong>Address:</strong> {section.contact.address}<br />
                        {section.contact.fullAddress}<br />
                        <strong>Phone:</strong> {section.contact.phone}
                      </p>
                    </div>
                  )}
                </section>
              ))}

              <div className="border-t border-glass-border pt-8 mt-12 animate-fade-in-up animate-delay-1200">
                <div className="text-center">
                  <p className="text-sm text-body-muted mb-4">
                    Thank you for trusting GlobeTrotter with your personal information. We are committed to protecting your privacy and providing a secure travel planning experience.
                  </p>
                  <div className="flex items-center justify-center space-x-2">
                    <Lock className="w-5 h-5 text-success-500" />
                    <span className="text-sm text-success-600 font-medium">Privacy Protected</span>
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

export default PrivacyPolicy;
