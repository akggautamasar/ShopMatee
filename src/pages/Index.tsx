import React, { useState } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { StaffProvider } from '../context/StaffContext';
import { InventoryProvider } from '../context/InventoryContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthPage from '../components/AuthPage';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import { views, ViewKey } from '@/config/views';

const AuthenticatedApp = () => {
  const [activeView, setActiveView] = useState<ViewKey>('staff');

  return (
    <StaffProvider>
      <InventoryProvider>
        <SidebarProvider>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex w-full">
            <AppSidebar activeView={activeView} setActiveView={setActiveView} />
            <div className="flex-1 flex flex-col min-w-0">
              <Header />
              <main className="flex-1 overflow-y-auto">
                <div className="p-2 sm:p-4">
                  <SidebarTrigger className="md:hidden mb-4" />
                  {views[activeView].component}
                </div>
              </main>
              <Footer />
            </div>
          </div>
        </SidebarProvider>
      </InventoryProvider>
    </StaffProvider>
  );
};

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 text-sm sm:text-base">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? <AuthenticatedApp /> : (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <AuthPage />
      <Footer />
    </div>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default Index;
