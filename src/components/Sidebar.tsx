import * as React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart3, Users, FileText, User, LogOut, Settings, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
    icon: Settings,
  },
  {
    name: 'Template Builder',
    href: '/template-builder',
    icon: FileText,
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [isMobile, setIsMobile] = React.useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutDialog(false);
    if (isMobile) {
      onClose();
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutDialog(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: isMobile ? -256 : 0 }}
        animate={{ 
          x: isMobile ? (isOpen ? 0 : -256) : 0
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          duration: 0.3 
        }}
        className={cn(
          "h-full w-64 md:w-56 bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-2xl md:shadow-lg md:bg-white",
          "before:absolute before:inset-0 before:bg-gradient-to-b before:from-sky-50/30 before:to-transparent before:pointer-events-none",
          isMobile ? "fixed top-0 left-0 z-50" : "relative"
        )}
      >
        {/* Header with Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="flex items-center justify-between h-16 px-6 border-b border-gray-100/50 bg-gradient-to-r from-white to-sky-50/30 relative z-10"
        >
          <div className="flex-1 flex justify-center">
            <motion.img 
              src="/guc.png" 
              alt="GUC Logo" 
              className="h-12 w-auto"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            />
          </div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden text-gray-500 hover:text-sky-600 hover:bg-sky-50 transition-all duration-200 rounded-xl"
            >
              <X className="h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Navigation */}
        <div className="flex flex-col h-[calc(100vh-4rem)] relative z-10">
          <ScrollArea className="flex-1">
            <motion.nav 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="p-4 space-y-2"
            >
            {navigation.map((item, index) => {
              const isActive = location.pathname === item.href;
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    delay: 0.1 + index * 0.1, 
                    duration: 0.3,
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                >
                  <NavLink
                    to={item.href}
                    onClick={isMobile ? onClose : undefined}
                    className={cn(
                      "group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ease-out relative overflow-hidden",
                      "hover:shadow-md hover:shadow-sky-500/8",
                      isActive
                        ? "bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-lg shadow-sky-500/25 transform scale-[1.01]"
                        : "text-gray-600 hover:text-sky-600 hover:bg-gradient-to-r hover:from-sky-50/80 hover:to-blue-50/80 hover:scale-[1.005] hover:translate-x-0.5"
                    )}
                  >
                    {/* Background glow effect for active item */}
                    {isActive && (
                      <motion.div
                        layoutId="activeBackground"
                        className="absolute inset-0 bg-gradient-to-r from-sky-500 to-sky-600 rounded-xl"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    
                    <motion.div
                      whileHover={{ scale: 1.05, rotate: 2 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      className="relative z-10"
                    >
                      <item.icon 
                        className={cn(
                          "h-5 w-5 transition-all duration-300",
                          isActive 
                            ? "text-white drop-shadow-sm" 
                            : "text-gray-500 group-hover:text-sky-600"
                        )} 
                      />
                    </motion.div>
                    
                    <span className="transition-all duration-300 relative z-10 font-medium">
                      {item.name}
                    </span>
                    
                    {/* Animated hover indicator */}
                    <motion.div 
                      className={cn(
                        "absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-sky-400 to-sky-600 rounded-r-full",
                        isActive ? "opacity-100" : "opacity-0 group-hover:opacity-70"
                      )}
                      initial={false}
                      animate={{ 
                        scaleY: isActive ? 1 : 0,
                        opacity: isActive ? 1 : 0
                      }}
                      whileHover={{ scaleY: 1, opacity: 0.7 }}
                      transition={{ duration: 0.2 }}
                    />
                    
                    {/* Subtle shimmer effect on hover */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"
                      style={{ width: '100%' }}
                    />
                  </NavLink>
                </motion.div>
              );
            })}
            </motion.nav>
          </ScrollArea>
          
          {/* Profile Footer */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="p-4 border-t border-gray-100/50 bg-gradient-to-r from-white to-sky-50/20"
          >
            <div 
              onClick={handleLogoutClick}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-sky-50/50 transition-all duration-200 cursor-pointer group"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="flex-shrink-0"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full flex items-center justify-center shadow-md">
                  <User className="h-4 w-4 text-white" />
                </div>
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 group-hover:text-sky-600 transition-colors duration-200">
                  {user?.name || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || 'admin@example.com'}
                </p>
              </div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0"
              >
                <div className="h-8 w-8 text-gray-400 group-hover:text-red-500 transition-all duration-200 flex items-center justify-center">
                  <LogOut className="h-4 w-4" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.aside>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You will need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleLogoutCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogoutConfirm}>Logout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Sidebar;