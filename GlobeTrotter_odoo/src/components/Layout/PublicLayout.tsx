import React from 'react';
import Footer from './Footer';
import { useScrollToTop } from '../../utils/useScrollToTop';

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  // Auto-scroll to top on route change and page refresh
  useScrollToTop();
  
  return (
    <div className="min-h-screen bg-dark-base">
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
