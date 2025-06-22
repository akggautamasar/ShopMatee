
import React, { useState } from 'react';
import { useStaff, AttendanceRecord } from '../context/StaffContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Save, Users, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const AttendanceTracker = () => {
  const { state, markAttendance } = useStaff();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});

  const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');

  // Load existing attendance for selected date
  React.useEffect(() => {
    const dateStr = formatDate(selectedDate);
    const existingAttendance: Record<string, string> = {};
    
    state.staff.forEach(staff => {
      const record = state.attendance.find(
        a => a.staffId === staff.id && a.date === dateStr
      );
      existingAttendance[staff.id] = record?.status || 'absent';
    });
    
    setAttendanceData(existingAttendance);
  }, [selectedDate, state.staff, state.attendance]);

  const handleAttendanceChange = (staffId: string, status: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [staffId]: status
    }));
  };

  const handleSaveAttendance = async () => {
    const dateStr = formatDate(selectedDate);
    
    try {
      for (const staff of state.staff) {
        const status = attendanceData[staff.id] || 'absent';
        await markAttendance({
          staffId: staff.id,
          date: dateStr,
          status: status as 'present' | 'absent' | 'half-day',
        });
      }

      toast({
        title: "Success",
        description: `Attendance saved for ${format(selectedDate, 'PPP')}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save attendance. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllPresentDay = async () => {
    const updatedAttendance: Record<string, string> = {};
    state.staff.forEach(staff => {
      updatedAttendance[staff.id] = 'present';
    });
    setAttendanceData(updatedAttendance);

    toast({
      title: "Success",
      description: `All staff marked present for ${format(selectedDate, 'PPP')}`,
    });
  };

  const handleMarkAllAbsent = () => {
    const updatedAttendance: Record<string, string> = {};
    state.staff.forEach(staff => {
      updatedAttendance[staff.id] = 'absent';
    });
    setAttendanceData(updatedAttendance);

    toast({
      title: "Success",
      description: `All staff marked absent for ${format(selectedDate, 'PPP')}`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'half-day':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'absent':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (state.loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-0">
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Daily Attendance</h2>
        
        {/* Mobile-first responsive controls */}
        <div className="space-y-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full sm:w-auto justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={handleMarkAllPresentDay}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-sm"
              disabled={state.staff.length === 0}
            >
              <Check className="h-4 w-4 mr-2" />
              Mark All Present
            </Button>

            <Button 
              onClick={handleMarkAllAbsent}
              variant="outline"
              className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 text-sm"
              disabled={state.staff.length === 0}
            >
              <X className="h-4 w-4 mr-2" />
              Mark All Absent
            </Button>
            
            <Button 
              onClick={handleSaveAttendance}
              className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-sm"
              disabled={state.staff.length === 0}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Attendance
            </Button>
          </div>
        </div>
      </div>

      {state.staff.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 sm:py-12">
            <Users className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4">Add staff members first to mark attendance</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {state.staff.map((staff) => (
            <Card key={staff.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <span className="text-base sm:text-lg">{staff.name}</span>
                  <span className={cn(
                    "px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border self-start sm:self-auto",
                    getStatusColor(attendanceData[staff.id] || 'absent')
                  )}>
                    {attendanceData[staff.id] || 'absent'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={attendanceData[staff.id] || 'absent'}
                  onValueChange={(value) => handleAttendanceChange(staff.id, value)}
                  className="flex flex-col sm:flex-row gap-3 sm:gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="present" id={`${staff.id}-present`} />
                    <Label htmlFor={`${staff.id}-present`} className="text-green-600 font-medium text-sm sm:text-base">
                      Present
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="half-day" id={`${staff.id}-half`} />
                    <Label htmlFor={`${staff.id}-half`} className="text-yellow-600 font-medium text-sm sm:text-base">
                      Half Day
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="absent" id={`${staff.id}-absent`} />
                    <Label htmlFor={`${staff.id}-absent`} className="text-red-600 font-medium text-sm sm:text-base">
                      Absent
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttendanceTracker;
