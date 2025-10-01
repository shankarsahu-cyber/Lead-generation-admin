import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart3, Users, Plus, X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
  },
  {
    name: 'All Merchants',
    href: '/merchants',
    icon: Users,
  },
  {
    name: 'Plan Management',
    href: '/create-plan',
    icon: Plus,
  },
  {
    name: 'Template Builder',
    href: '/template-builder',
    icon: Plus, // You might want to change this icon
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 md:w-56 bg-white border-r border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:z-auto md:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header with Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
          <div className="flex-1 flex justify-center">
            <img src="/guc.png" alt="GUC Logo" className="h-12 w-auto" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    "group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ease-in-out relative overflow-hidden",
                    isActive
                      ? "bg-primary text-white shadow-md shadow-primary/25 scale-[1.02]"
                      : "text-gray-600 hover:text-primary hover:bg-primary/5 hover:scale-[1.01] hover:translate-x-1"
                  )}
                >
                  <item.icon 
                    className={cn(
                      "h-5 w-5 transition-all duration-200",
                      isActive 
                        ? "text-white" 
                        : "text-gray-500 group-hover:text-primary group-hover:scale-110"
                    )} 
                  />
                  <span className="transition-all duration-200">
                    {item.name}
                  </span>
                  
                  {/* Subtle hover indicator */}
                  <div className={cn(
                    "absolute left-0 top-0 h-full w-1 bg-primary transition-all duration-200 rounded-r-full",
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                  )} />
                </NavLink>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>
    </>
  );
};

export default Sidebar;