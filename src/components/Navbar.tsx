import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogOut, User, Menu } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="lg:hidden text-gray-600 hover:text-primary hover:bg-primary/5 transition-colors duration-200"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-primary">Lead Generation Admin</h1>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="relative h-10 w-10 rounded-full hover:bg-primary/5 transition-colors duration-200 focus:ring-2 focus:ring-primary/20"
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-white font-medium">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-56 bg-white border border-gray-200 shadow-lg rounded-lg" 
            align="end" 
            forceMount
          >
            <DropdownMenuItem className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors duration-150">
              <User className="h-4 w-4 text-gray-500" />
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-gray-900">{user?.name}</p>
                <p className="text-xs leading-none text-gray-500">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={logout} 
              className="flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-150"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Navbar;