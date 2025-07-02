
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Upload, Download, Copy, Edit, Save, X, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSubstitution, ClassSchedule } from '@/context/SubstitutionContext';
import { PeriodEntry } from '@/types/substitution';
import { parseCSV, downloadSampleTimetableCSV } from '@/utils/csvImport';
import TimetableEditCell from './TimetableEditCell';
import NehaNameDisplay from './NehaNameDisplay';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TimetableModule = () => {
  const { 
    state, 
    dispatch, 
    saveClass, 
    updateClass, 
    deleteClass,
    saveSettings 
  } = useSubstitution();
  const { classes, periods, timeSlots, loading } = state;
  const [newClassName, setNewClassName] = useState('');
  const [selectedClass, setSelectedClass] = useState<ClassSchedule | null>(null);
  const [editingPeriods, setEditingPeriods] = useState(false);
  const [editingTimeSlots, setEditingTimeSlots] = useState(false);
  const [newPeriod, setNewPeriod] = useState('');
  const [tempTimeSlots, setTempTimeSlots] = useState(timeSlots);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const addClass = async () => {
    if (!newClassName.trim()) return;
    
    try {
      const newClass: Omit<ClassSchedule, 'id'> = {
        className: newClassName,
        schedule: DAYS.reduce((acc, day) => ({
          ...acc,
          [day]: periods.reduce((periodAcc, period) => ({
            ...periodAcc,
            [period]: { subject: '', teacher: '', time: timeSlots[parseInt(period) - 1] || '' }
          }), {})
        }), {})
      };
      
      await saveClass(newClass);
      setNewClassName('');
      toast({ title: "Class added successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add class", variant: "destructive" });
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await deleteClass(classId);
        if (selectedClass?.id === classId) {
          setSelectedClass(null);
        }
        toast({ title: "Class deleted successfully" });
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete class", variant: "destructive" });
      }
    }
  };

  const updateClassSchedule = async (classId: string, day: string, period: string, newValue: PeriodEntry) => {
    const classToUpdate = classes.find(c => c.id === classId);
    if (classToUpdate) {
      try {
        const updatedClass = {
          ...classToUpdate,
          schedule: {
            ...classToUpdate.schedule,
            [day]: {
              ...classToUpdate.schedule[day],
              [period]: newValue
            }
          }
        };
        await updateClass(updatedClass);
        setSelectedClass(updatedClass);
        toast({ title: "Schedule updated successfully" });
      } catch (error) {
        toast({ title: "Error", description: "Failed to update schedule", variant: "destructive" });
      }
    }
  };

  const copyMondayToAllDays = async (classId: string) => {
    const classToUpdate = classes.find(c => c.id === classId);
    if (classToUpdate && classToUpdate.schedule.Monday) {
      try {
        const mondaySchedule = classToUpdate.schedule.Monday;
        const updatedClass = {
          ...classToUpdate,
          schedule: DAYS.reduce((acc, day) => ({
            ...acc,
            [day]: { ...mondaySchedule }
          }), {})
        };
        await updateClass(updatedClass);
        setSelectedClass(updatedClass);
        toast({ title: "Monday schedule copied to all days" });
      } catch (error) {
        toast({ title: "Error", description: "Failed to copy schedule", variant: "destructive" });
      }
    }
  };

  const addPeriod = async () => {
    if (!newPeriod.trim()) return;
    try {
      const newPeriods = [...periods, newPeriod];
      await saveSettings(newPeriods, timeSlots);
      setNewPeriod('');
      toast({ title: "Period added successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add period", variant: "destructive" });
    }
  };

  const saveTimeSlots = async () => {
    try {
      await saveSettings(periods, tempTimeSlots);
      setEditingTimeSlots(false);
      toast({ title: "Time slots updated successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update time slots", variant: "destructive" });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const csvText = e.target?.result as string;
        const rows = parseCSV(csvText);
        
        if (rows.length < 2) {
          toast({ title: "Error", description: "CSV file must have headers and data rows", variant: "destructive" });
          return;
        }

        const headers = rows[0];
        const classNameIndex = headers.findIndex(h => h.toLowerCase().includes('class'));
        
        if (classNameIndex === -1) {
          toast({ title: "Error", description: "CSV must have a class column", variant: "destructive" });
          return;
        }

        const periodHeaders = headers.slice(1).filter(h => !h.toLowerCase().includes('class'));
        
        for (const row of rows.slice(1)) {
          const className = row[classNameIndex];
          if (!className) continue;

          const newClass: Omit<ClassSchedule, 'id'> = {
            className,
            schedule: DAYS.reduce((acc, day) => ({
              ...acc,
              [day]: periodHeaders.reduce((periodAcc, _, periodIndex) => {
                const periodNum = (periodIndex + 1).toString();
                const cellValue = row[periodIndex + 1] || '';
                
                let subject = '';
                let teacher = '';
                
                if (cellValue.includes('(') && cellValue.includes(')')) {
                  const match = cellValue.match(/^(.+?)\((.+?)\)$/);
                  if (match) {
                    subject = match[1].trim();
                    teacher = match[2].trim();
                  }
                } else {
                  subject = cellValue;
                }
                
                return {
                  ...periodAcc,
                  [periodNum]: {
                    subject,
                    teacher,
                    time: timeSlots[periodIndex] || ''
                  }
                };
              }, {})
            }), {})
          };

          await saveClass(newClass);
        }

        toast({ title: `Successfully imported ${rows.length - 1} classes` });
      } catch (error) {
        toast({ title: "Error", description: "Failed to parse CSV file", variant: "destructive" });
      }
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Get list of all class names for the combined classes feature
  const availableClasses = classes.map(c => c.className);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading timetable data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Timetable Management</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadSampleTimetableCSV}>
            <Download className="mr-2 h-4 w-4" />
            Sample CSV
          </Button>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Period and Time Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Periods Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newPeriod}
                  onChange={(e) => setNewPeriod(e.target.value)}
                  placeholder="Period number"
                />
                <Button onClick={addPeriod}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {periods.map(period => (
                  <span key={period} className="px-2 py-1 bg-blue-100 rounded text-sm">
                    Period {period}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Time Slots</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingTimeSlots(!editingTimeSlots)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {editingTimeSlots ? (
              <div className="space-y-2">
                {tempTimeSlots.map((timeSlot, index) => (
                  <Input
                    key={index}
                    value={timeSlot}
                    onChange={(e) => {
                      const newSlots = [...tempTimeSlots];
                      newSlots[index] = e.target.value;
                      setTempTimeSlots(newSlots);
                    }}
                  />
                ))}
                <div className="flex gap-2">
                  <Button onClick={saveTimeSlots}>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setEditingTimeSlots(false)}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {timeSlots.map((timeSlot, index) => (
                  <div key={index} className="text-sm">
                    Period {index + 1}: {timeSlot}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Class */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Class</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="Class name (e.g., 10th A, 12th B)"
            />
            <Button onClick={addClass}>
              <Plus className="mr-2 h-4 w-4" />
              Add Class
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Classes List */}
      <Card>
        <CardHeader>
          <CardTitle>Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map(classItem => (
              <div key={classItem.id} className="flex items-center justify-between p-3 border rounded-lg">
                <Button
                  variant={selectedClass?.id === classItem.id ? "default" : "outline"}
                  onClick={() => setSelectedClass(classItem)}
                  className="flex-1 mr-2"
                >
                  {classItem.className}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteClass(classItem.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timetable Editor */}
      {selectedClass && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Timetable for {selectedClass.className}</CardTitle>
              <Button
                variant="outline"
                onClick={() => copyMondayToAllDays(selectedClass.id)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Monday to All Days
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    {DAYS.map(day => (
                      <TableHead key={day}>{day}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {periods.map(period => (
                    <TableRow key={period}>
                      <TableCell className="font-medium">
                        Period {period}
                        <div className="text-xs text-gray-500">
                          {timeSlots[parseInt(period) - 1]}
                        </div>
                      </TableCell>
                      {DAYS.map(day => (
                        <TableCell key={`${day}-${period}`} className="p-0">
                          <TimetableEditCell
                            value={selectedClass.schedule[day]?.[period] || { subject: '', teacher: '', time: '' }}
                            onSave={(newValue) => updateClassSchedule(selectedClass.id, day, period, newValue)}
                            className="min-h-[80px] w-full"
                            nehaNameDisplay={true}
                            availableClasses={availableClasses}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TimetableModule;
