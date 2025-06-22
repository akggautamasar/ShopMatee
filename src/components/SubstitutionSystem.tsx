import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Calendar, FileText, BarChart3 } from "lucide-react";
import { SubstitutionProvider } from '@/context/SubstitutionContext';
import StaffModule from './substitution/StaffModule';
import TimetableModule from './substitution/TimetableModule';
import SubstitutionModule from './substitution/SubstitutionModule';
import SubstitutionReports from './substitution/SubstitutionReports';

const SubstitutionSystem = () => {
  return (
    <SubstitutionProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4">
        
        <div className="container mx-auto max-w-7xl">
          <div className="mb-4 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  Substitution Management by WorksBeyond
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Manage staff, timetables, create substitution sheets, and view comprehensive reports
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <div className="text-right">
                  <div className="text-lg sm:text-xl font-bold text-blue-600 mb-1">WorksBeyond</div>
                  <div className="text-xs sm:text-sm text-gray-500">Staff Management System</div>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="staff" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-4 sm:mb-8 h-auto">
              <TabsTrigger value="staff" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Staff Management</span>
                <span className="sm:hidden">Staff</span>
              </TabsTrigger>
              <TabsTrigger value="timetable" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Timetable Management</span>
                <span className="sm:hidden">Timetable</span>
              </TabsTrigger>
              <TabsTrigger value="substitution" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Substitution Sheet</span>
                <span className="sm:hidden">Substitution</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Reports</span>
                <span className="sm:hidden">Reports</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="staff">
              <StaffModule />
            </TabsContent>

            <TabsContent value="timetable">
              <TimetableModule />
            </TabsContent>

            <TabsContent value="substitution">
              <SubstitutionModule />
            </TabsContent>

            <TabsContent value="reports">
              <SubstitutionReports />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </SubstitutionProvider>
  );
};

export default SubstitutionSystem;
