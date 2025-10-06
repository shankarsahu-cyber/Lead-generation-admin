import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

interface SidebarProviderProps {
  children: ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  // Initialize with saved state or default based on screen size
  const [sidebarOpen, setSidebarOpenState] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('sidebarOpen');
      if (savedState !== null) {
        return JSON.parse(savedState);
      }
      // Default: show on desktop, hide on mobile
      return window.innerWidth >= 768;
    }
    return false;
  });

  // Handle window resize to maintain responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 768; // md breakpoint
      
      // On mobile, close sidebar automatically
      // On desktop, keep user's preference
      if (!isDesktop && sidebarOpen) {
        setSidebarOpenState(false);
        localStorage.setItem('sidebarOpen', 'false');
      }
    };

    // Listen for window resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  const setSidebarOpen = (open: boolean) => {
    setSidebarOpenState(open);
    localStorage.setItem('sidebarOpen', JSON.stringify(open));
  };

  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpenState(newState);
    localStorage.setItem('sidebarOpen', JSON.stringify(newState));
  };
  
  const closeSidebar = () => {
    setSidebarOpenState(false);
    localStorage.setItem('sidebarOpen', 'false');
  };

  const value = {
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    closeSidebar,
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};