
import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const Header = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="flex-shrink-0">
              <img 
                src="/lovable-uploads/82afab97-eae2-47c5-ac04-b9e9fa5d2064.png" 
                alt="ShopMate Logo" 
                className="h-8 w-auto sm:h-12"
              />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">ShopMate</h1>
              <p className="text-gray-600 text-xs sm:text-sm">Staff Attendance & Salary Management</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user && (
              <div className="text-right hidden sm:block">
                <p className="text-sm text-gray-900 font-medium">{user.email}</p>
                <p className="text-xs text-gray-500">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            )}
            {user && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs sm:text-sm"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sm:hidden">Out</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
