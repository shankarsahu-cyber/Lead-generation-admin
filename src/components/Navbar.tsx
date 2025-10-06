import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const [isMobile, setIsMobile] = React.useState(false);

  // Check screen size for responsive behavior
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Show hamburger icon on mobile/tablet for all pages to toggle sidebar
  const showHamburgerIcon = isMobile;

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className="h-16 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40"
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-sky-50/30 via-white/80 to-blue-50/30 pointer-events-none" />
      
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="flex items-center gap-4 relative z-10"
      >
        {showHamburgerIcon && (
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="text-gray-600 hover:text-sky-600 hover:bg-sky-50 transition-all duration-200 rounded-xl shadow-sm hover:shadow-md"
            >
              <motion.div
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="h-5 w-5" />
              </motion.div>
            </Button>
          </motion.div>
        )}
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-2xl font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent"
        >
            Admin Dashboard
        </motion.h1>
      </motion.div>


    </motion.header>
  );
};

export default Navbar;