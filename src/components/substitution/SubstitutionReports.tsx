import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileSpreadsheet, Calendar, BarChart3, Clock, FileText, Download, Users, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSubstitution } from '@/context/SubstitutionContext';
import { 
  exportDailySubstitutionsPDF, 
  exportDailySubstitutionsHTML,
  exportMonthlySubstitutionPDF,
  exportMonthlySubstitutionHTML
} from '@/utils/exportUtils';

const SubstitutionReports = () => {
  const { state, loadSubstitutions } = useSubstitution();
  const { substitutions, periods, timeSlots, loading } = state;
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedDate, setSelectedDate] = useState('');
  const [reportType, setReportType] = useState<'monthly' | 'daily' | 'teacher'>('monthly');
  const { toast } = useToast();

  // Load substitutions when component mounts
  useEffect(() => {
    loadSubstitutions();
  }, []);

  // Filter substitutions based on selected filters
  const filteredSubstitutions = useMemo(() => {
    let filtered = substitutions;

    if (reportType === 'monthly' && selectedMonth) {
      filtered = filtered.filter(sub => sub.date.startsWith(selectedMonth));
    }

    if (reportType === 'daily' && selectedDate) {
      filtered = filtered.filter(sub => sub.date === selectedDate);
    }

    return filtered;
  }, [substitutions, selectedMonth, selectedDate, reportType]);

  // Calculate teacher statistics
  const teacherStats = useMemo(() => {
    const stats: { [teacher: string]: { periods: number; hours: number; dates: Set<string> } } = {};

    filteredSubstitutions.forEach(sub => {
      if (!stats[sub.substituteTeacher]) {
        stats[sub.substituteTeacher] = { periods: 0, hours: 0, dates: new Set() };
      }
      
      stats[sub.substituteTeacher].periods += 1;
      stats[sub.substituteTeacher].dates.add(sub.date);
      
      const periodIndex = parseInt(sub.period) - 1;
      const timeSlot = timeSlots[periodIndex];
      let periodDuration = 45;
      
      if (timeSlot) {
        const [start, end] = timeSlot.split('-');
        const startTime = new Date(`2000-01-01 ${start}`);
        const endTime = new Date(`2000-01-01 ${end}`);
        periodDuration = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
      }
      
      stats[sub.substituteTeacher].hours += periodDuration / 60;
    });

    return Object.entries(stats).map(([teacher, data]) => ({
      teacher,
      periods: data.periods,
      hours: Number(data.hours.toFixed(2)),
      days: data.dates.size
    })).sort((a, b) => b.periods - a.periods);
  }, [filteredSubstitutions, timeSlots]);

  // Group substitutions by date
  const substitutionsByDate = useMemo(() => {
    const grouped: { [date: string]: typeof filteredSubstitutions } = {};
    
    filteredSubstitutions.forEach(sub => {
      if (!grouped[sub.date]) {
        grouped[sub.date] = [];
      }
      grouped[sub.date].push(sub);
    });

    return Object.entries(grouped).sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime());
  }, [filteredSubstitutions]);

  const exportTeacherStatsCSV = () => {
    const headers = ['S.No', 'Teacher Name', 'Total Periods', 'Total Hours', 'Days Worked'];
    const csvRows = [headers.join(',')];
    
    teacherStats.forEach((stat, index) => {
      csvRows.push([
        index + 1,
        `"${stat.teacher}"`,
        stat.periods,
        stat.hours,
        stat.days
      ].join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const monthName = selectedMonth ? new Date(selectedMonth + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'all-time';
    const a = document.createElement('a');
    a.href = url;
    a.download = `substitute-teacher-stats-${monthName}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({ title: "Statistics exported successfully" });
  };

  const exportDailySubstitutionsCSV = (date: string, subs: typeof filteredSubstitutions) => {
    const headers = ['S.No', 'Date', 'Absent Teacher', 'Period', 'Original Class', 'Original Subject', 'Substitute Teacher'];
    const csvRows = [headers.join(',')];
    
    subs.forEach((sub, index) => {
      csvRows.push([
        index + 1,
        sub.date,
        `"${sub.absentTeacher}"`,
        sub.period,
        `"${sub.originalClass}"`,
        `"${sub.originalSubject}"`,
        `"${sub.substituteTeacher}"`
      ].join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `substitutions-${date}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({ title: "Daily substitutions exported" });
  };

  const handleDailyPDFExport = async (date: string, subs: typeof filteredSubstitutions) => {
    try {
      await exportDailySubstitutionsPDF(date, subs, timeSlots);
      toast({ title: "Daily substitution PDF exported successfully" });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({ title: "Failed to export PDF", variant: "destructive" });
    }
  };

  const handleDailyHTMLExport = async (date: string, subs: typeof filteredSubstitutions) => {
    try {
      await exportDailySubstitutionsHTML(date, subs, timeSlots);
      toast({ title: "Daily substitution HTML exported successfully" });
    } catch (error) {
      console.error('Error exporting HTML:', error);
      toast({ title: "Failed to export HTML", variant: "destructive" });
    }
  };

  const handleMonthlyPDFExport = async () => {
    try {
      await exportMonthlySubstitutionPDF(
        substitutionsByDate,
        teacherStats,
        filteredSubstitutions,
        selectedMonth,
        timeSlots
      );
      toast({ title: "Monthly report PDF exported successfully" });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({ title: "Failed to export PDF", variant: "destructive" });
    }
  };

  const handleMonthlyHTMLExport = async () => {
    try {
      await exportMonthlySubstitutionHTML(
        substitutionsByDate,
        teacherStats,
        filteredSubstitutions,
        selectedMonth,
        timeSlots
      );
      toast({ title: "Monthly report HTML exported successfully" });
    } catch (error) {
      console.error('Error exporting HTML:', error);
      toast({ title: "Failed to export HTML", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Substitution Reports</h2>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Total Records: {filteredSubstitutions.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Active Teachers: {teacherStats.length}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={exportTeacherStatsCSV} disabled={teacherStats.length === 0} className="w-full sm:w-auto text-xs sm:text-sm">
            <FileSpreadsheet className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Export Stats CSV
          </Button>
          <Button onClick={handleMonthlyPDFExport} disabled={filteredSubstitutions.length === 0} className="w-full sm:w-auto text-xs sm:text-sm">
            <Download className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Download Monthly PDF
          </Button>
          <Button onClick={handleMonthlyHTMLExport} disabled={filteredSubstitutions.length === 0} variant="outline" className="w-full sm:w-auto text-xs sm:text-sm">
            <Globe className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Download Monthly HTML
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Report Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm sm:text-base">Report Type</Label>
              <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly Report</SelectItem>
                  <SelectItem value="daily">Daily Report</SelectItem>
                  <SelectItem value="teacher">Teacher Statistics</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(reportType === 'monthly' || reportType === 'teacher') && (
              <div>
                <Label htmlFor="month" className="text-sm sm:text-base">Month</Label>
                <Input
                  id="month"
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full"
                />
              </div>
            )}
            
            {reportType === 'daily' && (
              <div>
                <Label htmlFor="date" className="text-sm sm:text-base">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Teacher Statistics */}
      {(reportType === 'teacher' || reportType === 'monthly') && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
              <CardTitle className="text-lg sm:text-xl">
                Substitute Teacher Statistics 
                {selectedMonth && (
                  <span className="block sm:inline text-sm sm:text-base text-gray-600 mt-1 sm:mt-0">
                    {' - '}{new Date(selectedMonth + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                  </span>
                )}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-3">
              {teacherStats.map((stat, index) => (
                <div key={stat.teacher} className="border rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs text-gray-500">#{index + 1}</span>
                      <h3 className="font-medium text-sm">{stat.teacher}</h3>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Periods:</span>
                      <span className="ml-1 font-medium">{stat.periods}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Hours:</span>
                      <span className="ml-1 font-medium">{stat.hours}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Days:</span>
                      <span className="ml-1 font-medium">{stat.days}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Avg/Day:</span>
                      <span className="ml-1 font-medium">{stat.days > 0 ? (stat.periods / stat.days).toFixed(1) : '0'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">S.No</TableHead>
                    <TableHead>Teacher Name</TableHead>
                    <TableHead className="text-center">Total Periods</TableHead>
                    <TableHead className="text-center">Total Hours</TableHead>
                    <TableHead className="text-center">Days Worked</TableHead>
                    <TableHead className="text-center">Avg Periods/Day</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teacherStats.map((stat, index) => (
                    <TableRow key={stat.teacher}>
                      <TableCell className="font-medium">#{index + 1}</TableCell>
                      <TableCell className="font-medium">{stat.teacher}</TableCell>
                      <TableCell className="text-center">{stat.periods}</TableCell>
                      <TableCell className="text-center">{stat.hours}</TableCell>
                      <TableCell className="text-center">{stat.days}</TableCell>
                      <TableCell className="text-center">
                        {stat.days > 0 ? (stat.periods / stat.days).toFixed(1) : '0'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {teacherStats.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500">
                        No substitute teacher data found for the selected period
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Substitutions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
            <CardTitle className="text-lg sm:text-xl">Daily Substitution Records</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {substitutionsByDate.map(([date, subs]) => {
              const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
              return (
                <div key={date} className="border rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                    <h3 className="text-base sm:text-lg font-semibold">
                      {date} ({dayOfWeek}) - {subs.length} substitution(s)
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        size="sm"
                        onClick={() => exportDailySubstitutionsCSV(date, subs)}
                        className="w-full sm:w-auto text-xs"
                      >
                        <FileSpreadsheet className="mr-2 h-3 w-3" />
                        CSV
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDailyPDFExport(date, subs)}
                        className="w-full sm:w-auto text-xs"
                      >
                        <Download className="mr-2 h-3 w-3" />
                        Download PDF
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDailyHTMLExport(date, subs)}
                        className="w-full sm:w-auto text-xs"
                      >
                        <Globe className="mr-2 h-3 w-3" />
                        Download HTML
                      </Button>
                    </div>
                  </div>
                  
                  {/* Mobile Card View */}
                  <div className="block sm:hidden space-y-3">
                    {subs.map((sub, index) => {
                      const periodIndex = parseInt(sub.period) - 1;
                      const timeSlot = timeSlots[periodIndex] || '';
                      
                      return (
                        <div key={index} className="border rounded-lg p-3 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-xs text-gray-500">#{index + 1}</span>
                              <span className="font-medium text-sm ml-2">Period {sub.period}</span>
                              <span className="text-xs text-gray-500 ml-2">{timeSlot}</span>
                            </div>
                          </div>
                          <div className="space-y-1 text-xs">
                            <div><span className="text-gray-500">Absent:</span> <span className="font-medium">{sub.absentTeacher}</span></div>
                            <div><span className="text-gray-500">Class:</span> <span>{sub.originalClass}</span></div>
                            <div><span className="text-gray-500">Subject:</span> <span>{sub.originalSubject}</span></div>
                            <div><span className="text-gray-500">Substitute:</span> <span className="font-medium text-green-600">{sub.substituteTeacher}</span></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden sm:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">S.No</TableHead>
                          <TableHead>Period</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Absent Teacher</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Substitute Teacher</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subs.map((sub, index) => {
                          const periodIndex = parseInt(sub.period) - 1;
                          const timeSlot = timeSlots[periodIndex] || '';
                          
                          return (
                            <TableRow key={index}>
                              <TableCell className="font-medium">#{index + 1}</TableCell>
                              <TableCell className="font-medium">{sub.period}</TableCell>
                              <TableCell className="text-sm text-gray-600">{timeSlot}</TableCell>
                              <TableCell>{sub.absentTeacher}</TableCell>
                              <TableCell>{sub.originalClass}</TableCell>
                              <TableCell>{sub.originalSubject}</TableCell>
                              <TableCell className="font-medium text-green-600">
                                {sub.substituteTeacher}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              );
            })}
            
            {substitutionsByDate.length === 0 && (
              <div className="text-center text-gray-500 py-12">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm sm:text-base">No substitution records found for the selected criteria</p>
                <p className="text-xs sm:text-sm mt-2">Try selecting a different month or date range</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubstitutionReports;
