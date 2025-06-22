
import React, { useState, useMemo } from 'react';
import { useStaff } from '../context/StaffContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText, Users } from 'lucide-react';
import { generateCSV, generatePDF } from '../utils/exportUtils';
import { calculateMonthlySalary } from '../utils/salaryUtils';
import { toast } from "@/hooks/use-toast";

const SalaryReport = () => {
  const { state } = useStaff();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Generate month options for the past 12 months
  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      options.push({ value, label });
    }
    
    return options;
  }, []);

  // Calculate salary data for selected month
  const salaryData = useMemo(() => {
    if (!state.staff || state.staff.length === 0) return [];
    
    return state.staff.map(staff => {
      const result = calculateMonthlySalary(staff, state.attendance || [], selectedMonth);
      return {
        staff,
        ...result
      };
    });
  }, [state.staff, state.attendance, selectedMonth]);

  const totalSalary = salaryData.reduce((sum, data) => sum + data.totalSalary, 0);

  const handleExportCSV = () => {
    try {
      generateCSV(salaryData, selectedMonth);
      toast({
        title: "Success",
        description: "CSV report downloaded successfully",
      });
    } catch (error) {
      console.error('CSV export error:', error);
      toast({
        title: "Error",
        description: "Failed to generate CSV report",
        variant: "destructive",
      });
    }
  };

  const handleExportPDF = async () => {
    try {
      await generatePDF(salaryData, selectedMonth);
      toast({
        title: "Success",
        description: "PDF report downloaded successfully",
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF report",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      present: 'bg-green-100 text-green-800',
      'half-day': 'bg-yellow-100 text-yellow-800',
      absent: 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || colors.absent}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 p-4 sm:p-0">
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Salary Reports</h2>
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              disabled={salaryData.length === 0}
              className="w-full sm:w-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button
              variant="outline"
              onClick={handleExportPDF}
              disabled={salaryData.length === 0}
              className="w-full sm:w-auto"
            >
              <FileText className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>
      </div>

      {!state.staff || state.staff.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 sm:py-12">
            <Users className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4">Add staff members first to generate salary reports</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Total Staff</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">{state.staff.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Total Salary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold text-blue-600">₹{totalSalary.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Avg Present Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold text-green-600">
                  {salaryData.length > 0 
                    ? (salaryData.reduce((sum, data) => sum + data.presentDays, 0) / salaryData.length).toFixed(1)
                    : '0'
                  }
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Avg Half Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold text-yellow-600">
                  {salaryData.length > 0 
                    ? (salaryData.reduce((sum, data) => sum + data.halfDays, 0) / salaryData.length).toFixed(1)
                    : '0'
                  }
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">
                Detailed Salary Report - {monthOptions.find(m => m.value === selectedMonth)?.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">Staff Name</TableHead>
                      <TableHead className="text-xs sm:text-sm">Daily Wage</TableHead>
                      <TableHead className="text-xs sm:text-sm">Present Days</TableHead>
                      <TableHead className="text-xs sm:text-sm">Half Days</TableHead>
                      <TableHead className="text-xs sm:text-sm">Absent Days</TableHead>
                      <TableHead className="text-right text-xs sm:text-sm">Total Salary</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salaryData.map(({ staff, presentDays, halfDays, absentDays, totalSalary }) => (
                      <TableRow key={staff.id}>
                        <TableCell className="font-medium text-xs sm:text-sm">{staff.name}</TableCell>
                        <TableCell className="text-xs sm:text-sm">₹{staff.dailyWage}</TableCell>
                        <TableCell>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0">
                            <span className="text-xs sm:text-sm">{presentDays}</span>
                            {getStatusBadge('present')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0">
                            <span className="text-xs sm:text-sm">{halfDays}</span>
                            {halfDays > 0 && getStatusBadge('half-day')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0">
                            <span className="text-xs sm:text-sm">{absentDays}</span>
                            {absentDays > 0 && getStatusBadge('absent')}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold text-blue-600 text-xs sm:text-sm">
                          ₹{totalSalary.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SalaryReport;
