import React from 'react';
import { Outlet } from 'react-router-dom';
import { useSidebar } from '../contexts/SidebarContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const DashboardLayout: React.FC = () => {
  const { sidebarOpen, toggleSidebar, closeSidebar } = useSidebar();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar onToggleSidebar={toggleSidebar} />
          
          <main className="flex-1 overflow-y-auto bg-background">
            <div className="p-4 sm:p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;