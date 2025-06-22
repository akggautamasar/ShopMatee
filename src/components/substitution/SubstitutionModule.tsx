import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Save, FileText, FileSpreadsheet, Trash2, BarChart3, ChevronLeft, Users, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSubstitution, SubstitutionRecord } from '@/context/SubstitutionContext';
import { useIsMobile } from '@/hooks/use-mobile';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface AbsentTeacher {
  id: string;
  name: string;
  periods: string[];
}

const SubstitutionModule = () => {
  const { state, saveSubstitutions, loadSubstitutions } = useSubstitution();
  const { teachers, classes, substitutions, periods, loading, timeSlots } = state;
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [absentTeachers, setAbsentTeachers] = useState<AbsentTeacher[]>([]);
  const [substitutionMatrix, setSubstitutionMatrix] = useState<{ [teacherId: string]: { [period: string]: string } }>({});
  const [step, setStep] = useState<'date' | 'teachers' | 'substitutions'>('date');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    setSelectedDay(dayOfWeek);
    setStep('teachers');
    
    // Load existing substitutions for this date
    const existingSubstitutions = substitutions.filter(sub => sub.date === date);
    if (existingSubstitutions.length > 0) {
      // Group existing substitutions by teacher
      const groupedSubs: { [teacher: string]: string[] } = {};
      const matrix: { [teacherId: string]: { [period: string]: string } } = {};
      
      existingSubstitutions.forEach(sub => {
        if (!groupedSubs[sub.absentTeacher]) {
          groupedSubs[sub.absentTeacher] = [];
        }
        groupedSubs[sub.absentTeacher].push(sub.period);
        
        const teacher = teachers.find(t => t.name === sub.absentTeacher);
        if (teacher) {
          if (!matrix[teacher.id]) matrix[teacher.id] = {};
          matrix[teacher.id][sub.period] = sub.substituteTeacher;
        }
      });
      
      const absent: AbsentTeacher[] = Object.keys(groupedSubs).map(teacherName => {
        const teacher = teachers.find(t => t.name === teacherName);
        return {
          id: teacher?.id || teacherName,
          name: teacherName,
          periods: groupedSubs[teacherName]
        };
      });
      
      setAbsentTeachers(absent);
      setSubstitutionMatrix(matrix);
      setStep('substitutions');
    } else {
      setAbsentTeachers([]);
      setSubstitutionMatrix({});
    }
  };

  const handleTeacherSelect = (teacherId: string, isSelected: boolean) => {
    if (isSelected) {
      const teacher = teachers.find(t => t.id === teacherId);
      if (teacher && selectedDay) {
        const teacherPeriods = periods.filter(period => {
          const schedule = teacher.schedule[selectedDay]?.[period];
          return schedule && schedule !== 'FREE';
        });
        
        setAbsentTeachers(prev => [...prev, {
          id: teacherId,
          name: teacher.name,
          periods: teacherPeriods
        }]);
      }
    } else {
      setAbsentTeachers(prev => prev.filter(t => t.id !== teacherId));
      setSubstitutionMatrix(prev => {
        const newMatrix = { ...prev };
        delete newMatrix[teacherId];
        return newMatrix;
      });
    }
  };

  const getAvailableTeachers = (period: string): string[] => {
    const absentTeacherNames = absentTeachers.map(t => t.name);
    
    return teachers
      .filter(teacher => {
        // Exclude absent teachers
        if (absentTeacherNames.includes(teacher.name)) return false;
        
        // Check if teacher is free in this period
        const teacherSchedule = teacher.schedule[selectedDay]?.[period];
        const isFreePeriod = !teacherSchedule || teacherSchedule === 'FREE';
        
        // Check if teacher is already assigned substitution duty in this period
        const hasSubstitutionDuty = Object.values(substitutionMatrix).some(
          teacherSubs => teacherSubs[period] === teacher.name
        );
        
        return isFreePeriod && !hasSubstitutionDuty;
      })
      .map(t => t.name);
  };

  const getTeacherClass = (teacherId: string, period: string): string => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher || !selectedDay) return '';
    
    const schedule = teacher.schedule[selectedDay]?.[period];
    return schedule && schedule !== 'FREE' ? schedule : '';
  };

  const getTeacherClassesWithPeriods = (teacherId: string): string => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher || !selectedDay) return '';
    
    const classesWithPeriods = periods.map(period => {
      const className = getTeacherClass(teacherId, period);
      return className ? `P${period}: ${className}` : '';
    }).filter(cls => cls);
    
    return classesWithPeriods.join(', ');
  };

  const updateSubstitution = (teacherId: string, period: string, substituteName: string) => {
    setSubstitutionMatrix(prev => ({
      ...prev,
      [teacherId]: {
        ...prev[teacherId],
        [period]: substituteName
      }
    }));
  };

  const getSubstituteDisplayName = (teacherId: string, period: string, substituteName: string): string => {
    const className = getTeacherClass(teacherId, period);
    return className ? `${substituteName} (${className})` : substituteName;
  };

  const proceedToSubstitutions = () => {
    if (absentTeachers.length === 0) {
      toast({ title: "No teachers selected", description: "Please select at least one absent teacher", variant: "destructive" });
      return;
    }
    setStep('substitutions');
  };

  const saveSubstitutionsData = async () => {
    if (!selectedDate) {
      toast({ title: "Error", description: "Please select a date", variant: "destructive" });
      return;
    }

    if (absentTeachers.length === 0) {
      toast({ title: "Error", description: "No absent teachers selected", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const newSubstitutions: SubstitutionRecord[] = [];
      
      absentTeachers.forEach(absentTeacher => {
        absentTeacher.periods.forEach(period => {
          const substituteName = substitutionMatrix[absentTeacher.id]?.[period];
          if (substituteName) {
            const teacher = teachers.find(t => t.id === absentTeacher.id);
            const originalClass = teacher?.schedule[selectedDay]?.[period] || '';
            const classSchedule = classes.find(c => c.className === originalClass);
            const originalSubject = classSchedule?.schedule[selectedDay]?.[period]?.subject || '';
            
            newSubstitutions.push({
              id: `${selectedDate}-${absentTeacher.id}-${period}-${Date.now()}`,
              date: selectedDate,
              absentTeacher: absentTeacher.name,
              period,
              originalClass,
              originalSubject,
              substituteTeacher: substituteName,
              remarks: ''
            });
          }
        });
      });

      if (newSubstitutions.length === 0) {
        toast({ 
          title: "No substitutions to save", 
          description: "Please assign substitute teachers before saving",
          variant: "destructive" 
        });
        return;
      }
      
      console.log('Saving substitutions:', newSubstitutions);
      await saveSubstitutions(newSubstitutions);
      
      // Reload substitutions to get updated data
      await loadSubstitutions();
      
      toast({ 
        title: "Success", 
        description: `${newSubstitutions.length} substitutions saved successfully for ${selectedDate}`
      });
    } catch (error) {
      console.error('Error saving substitutions:', error);
      toast({ 
        title: "Error", 
        description: "Failed to save substitutions. Please try again.",
        variant: "destructive" 
      });
    } finally {
      setSaving(false);
    }
  };

  const generateSubstitutionCSV = () => {
    if (absentTeachers.length === 0) {
      toast({ 
        title: "No substitutions", 
        description: "Please add substitutions before generating CSV",
        variant: "destructive" 
      });
      return;
    }

    const headers = ['S.No', 'Teachers on Leave', 'Classes', ...periods.map(p => `Period ${p} (${timeSlots[parseInt(p) - 1] || ''})`)];
    const csvRows = [headers.join(',')];
    
    absentTeachers.forEach((teacher, index) => {
      const classesForTeacher = getTeacherClassesWithPeriods(teacher.id);
      
      const periodsData = periods.map(period => {
        const hasClass = teacher.periods.includes(period);
        const substitute = substitutionMatrix[teacher.id]?.[period];
        if (!hasClass) return '---';
        return substitute ? getSubstituteDisplayName(teacher.id, period, substitute) : '___';
      });
      
      const rowData = [
        index + 1,
        `"${teacher.name}"`,
        `"${classesForTeacher}"`,
        ...periodsData.map(data => `"${data}"`)
      ];
      csvRows.push(rowData.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `substitution-sheet-${selectedDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({ title: "Substitution CSV downloaded" });
  };

  const generateSubstitutionPDF = () => {
    if (absentTeachers.length === 0) {
      toast({ 
        title: "No substitutions", 
        description: "Please add substitutions before generating PDF",
        variant: "destructive" 
      });
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Substitution Record - ${selectedDate}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .school-name { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
          .document-title { font-size: 20px; margin: 10px 0; }
          .date-info { font-size: 16px; color: #666; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px; }
          th, td { padding: 8px; text-align: center; border: 1px solid #333; }
          th { background-color: #f0f9ff; font-weight: bold; }
          .teacher-name { text-align: left; font-weight: bold; }
          .classes-column { text-align: left; font-size: 10px; }
          .period-header { background-color: #dbeafe; }
          .substitute { color: #059669; font-weight: 500; }
          .no-class { color: #9ca3af; }
          .footer { margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="school-name">School Substitution Record</div>
          <div class="document-title">Daily Substitution Sheet</div>
          <div class="date-info">Date: ${selectedDate} (${selectedDay})</div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th style="width: 30px;">S.No</th>
              <th style="width: 120px;">Teachers on Leave</th>
              <th style="width: 100px;">Classes</th>
              ${periods.map((period, index) => `<th class="period-header">P${period}<br/>(${timeSlots[index] || ''})</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${absentTeachers.map((teacher, index) => {
              const classesForTeacher = getTeacherClassesWithPeriods(teacher.id);
              
              const periodsData = periods.map(period => {
                const hasClass = teacher.periods.includes(period);
                const substitute = substitutionMatrix[teacher.id]?.[period];
                if (!hasClass) return '<td class="no-class">---</td>';
                if (substitute) return `<td class="substitute">${getSubstituteDisplayName(teacher.id, period, substitute)}</td>`;
                return '<td>___</td>';
              });
              
              return `
                <tr>
                  <td>${index + 1}</td>
                  <td class="teacher-name">${teacher.name}</td>
                  <td class="classes-column">${classesForTeacher}</td>
                  ${periodsData.join('')}
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p><strong>Instructions:</strong></p>
          <ul>
            <li>All substitute teachers must report to their assigned classes on time.</li>
            <li>Original lesson plans should be followed where possible.</li>
            <li>Any issues should be reported to the administration immediately.</li>
          </ul>
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `substitution-sheet-${selectedDate}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({ title: "Substitution PDF downloaded" });
  };

  const removeAbsentTeacher = (teacherId: string) => {
    setAbsentTeachers(prev => prev.filter(t => t.id !== teacherId));
    setSubstitutionMatrix(prev => {
      const newMatrix = { ...prev };
      delete newMatrix[teacherId];
      return newMatrix;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading substitution data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-2 sm:p-4 md:p-6">
      {/* Header Section - Mobile Optimized */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Substitution Record</h2>
            {selectedDate && (
              <p className="text-sm text-gray-600 mt-1">
                {selectedDate} ({selectedDay})
              </p>
            )}
          </div>
          
          {/* Step Indicator for Mobile */}
          {isMobile && (
            <div className="flex items-center space-x-2 text-xs">
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${step === 'date' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                <Calendar className="h-3 w-3" />
                <span>Date</span>
              </div>
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${step === 'teachers' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                <Users className="h-3 w-3" />
                <span>Teachers</span>
              </div>
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${step === 'substitutions' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                <FileText className="h-3 w-3" />
                <span>Assign</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons - Mobile Friendly */}
        {step === 'substitutions' && (
          <div className="grid grid-cols-2 sm:flex gap-2">
            <Button 
              onClick={saveSubstitutionsData} 
              disabled={!selectedDate || saving || absentTeachers.length === 0}
              className="text-xs sm:text-sm px-3 py-2"
              size="sm"
            >
              <Save className="mr-1 h-3 w-3" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button 
              onClick={generateSubstitutionCSV} 
              disabled={absentTeachers.length === 0} 
              variant="outline"
              className="text-xs sm:text-sm px-3 py-2"
              size="sm"
            >
              <FileSpreadsheet className="mr-1 h-3 w-3" />
              CSV
            </Button>
            <Button 
              onClick={generateSubstitutionPDF} 
              disabled={absentTeachers.length === 0} 
              variant="outline"
              className="text-xs sm:text-sm px-3 py-2 col-span-2 sm:col-span-1"
              size="sm"
            >
              <FileText className="mr-1 h-3 w-3" />
              PDF
            </Button>
          </div>
        )}
      </div>

      {/* Step 1: Date Selection - Mobile Optimized */}
      {step === 'date' && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="date" className="text-sm font-medium">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="mt-1 text-base"
                />
              </div>
              {selectedDay && (
                <div>
                  <Label className="text-sm font-medium">Day</Label>
                  <div className="mt-1 px-3 py-2 bg-gray-50 rounded-md text-sm font-medium text-gray-700">
                    {selectedDay}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Teacher Selection - Mobile Optimized */}
      {step === 'teachers' && selectedDate && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                Select Absent Teachers
              </CardTitle>
              <Button 
                onClick={proceedToSubstitutions} 
                disabled={absentTeachers.length === 0}
                size="sm"
                className="text-xs sm:text-sm"
              >
                Continue ({absentTeachers.length})
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Teacher Grid - Mobile Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {teachers.map(teacher => {
                const isSelected = absentTeachers.some(t => t.id === teacher.id);
                const hasClasses = selectedDay && periods.some(period => {
                  const schedule = teacher.schedule[selectedDay]?.[period];
                  return schedule && schedule !== 'FREE';
                });

                return (
                  <div 
                    key={teacher.id} 
                    className={`flex items-center space-x-3 p-3 border rounded-lg transition-colors ${
                      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    } ${!hasClasses ? 'opacity-50' : ''}`}
                  >
                    <Checkbox
                      id={teacher.id}
                      checked={isSelected}
                      onCheckedChange={(checked) => handleTeacherSelect(teacher.id, checked as boolean)}
                      disabled={!hasClasses}
                      className="flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <Label 
                        htmlFor={teacher.id} 
                        className="font-medium text-sm block truncate cursor-pointer"
                      >
                        {teacher.name}
                      </Label>
                      <p className="text-xs text-gray-500 truncate">{teacher.subject}</p>
                      {!hasClasses && (
                        <p className="text-xs text-red-500">No classes today</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Selected Teachers Summary - Mobile Friendly */}
            {absentTeachers.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Selected Absent Teachers ({absentTeachers.length})
                </h3>
                <div className="space-y-2">
                  {absentTeachers.map(teacher => (
                    <div 
                      key={teacher.id} 
                      className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm block truncate">{teacher.name}</span>
                        <span className="text-xs text-gray-600">
                          Periods: {teacher.periods.join(', ')}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeAbsentTeacher(teacher.id)}
                        className="ml-2 flex-shrink-0 h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Substitution Assignment - Original Table Format */}
      {step === 'substitutions' && selectedDate && absentTeachers.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                Assign Substitute Teachers
              </CardTitle>
              <Button 
                onClick={() => setStep('teachers')} 
                variant="outline" 
                size="sm"
                className="text-xs sm:text-sm"
              >
                <ChevronLeft className="mr-1 h-3 w-3" />
                Back
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isMobile ? (
              <div className="space-y-4">
                {absentTeachers.map((teacher, index) => (
                  <div key={teacher.id} className="border rounded-lg">
                    <div className="p-3 bg-gray-50 rounded-t-lg">
                      <p className="font-medium">{index + 1}. {teacher.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{getTeacherClassesWithPeriods(teacher.id)}</p>
                    </div>
                    <div className="p-3 space-y-4">
                      {teacher.periods.map(period => {
                        const availableTeachers = getAvailableTeachers(period);
                        const selectedSubstitute = substitutionMatrix[teacher.id]?.[period];
                        const originalClass = getTeacherClass(teacher.id, period);

                        return (
                          <div key={period}>
                            <Label htmlFor={`subst-${teacher.id}-${period}`} className="text-sm font-medium">
                              Period {period} {originalClass && `(${originalClass})`}
                            </Label>
                            <Select
                              value={selectedSubstitute || ''}
                              onValueChange={(value) => updateSubstitution(teacher.id, period, value)}
                            >
                              <SelectTrigger id={`subst-${teacher.id}-${period}`} className="w-full mt-1">
                                <SelectValue placeholder="Select substitute" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableTeachers.map(teacherName => (
                                  <SelectItem key={teacherName} value={teacherName}>
                                    {teacherName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {selectedSubstitute && (
                              <div className="text-xs text-green-600 font-medium mt-1 p-1 bg-green-50 rounded">
                                ✓ {getSubstituteDisplayName(teacher.id, period, selectedSubstitute)}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">S.No</TableHead>
                    <TableHead className="w-40">Teachers on Leave</TableHead>
                    <TableHead className="w-48">Classes</TableHead>
                    {periods.map((period, index) => (
                      <TableHead key={period} className="text-center min-w-36">
                        Period {period}
                        <br />
                        <span className="text-xs text-gray-500">
                          {timeSlots[index] || ''}
                        </span>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {absentTeachers.map((teacher, index) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="text-center">{index + 1}</TableCell>
                      <TableCell className="font-medium">{teacher.name}</TableCell>
                      <TableCell className="text-sm">
                        {getTeacherClassesWithPeriods(teacher.id)}
                      </TableCell>
                      {periods.map(period => {
                        const hasClass = teacher.periods.includes(period);
                        const availableTeachers = getAvailableTeachers(period);
                        const selectedSubstitute = substitutionMatrix[teacher.id]?.[period];
                        
                        return (
                          <TableCell key={period} className="text-center">
                            {hasClass ? (
                              <div className="space-y-1">
                                <Select
                                  value={selectedSubstitute || ''}
                                  onValueChange={(value) => updateSubstitution(teacher.id, period, value)}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select substitute" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableTeachers.map(teacherName => (
                                      <SelectItem key={teacherName} value={teacherName}>
                                        {teacherName}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {selectedSubstitute && (
                                  <div className="text-xs text-green-600 font-medium p-1 bg-green-50 rounded">
                                    ✓ {getSubstituteDisplayName(teacher.id, period, selectedSubstitute)}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-gray-400 text-center">---</div>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubstitutionModule;
