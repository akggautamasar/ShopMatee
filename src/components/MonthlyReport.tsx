import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, BarChart3, FileText, ChevronDown, ChevronRight, Globe } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateInventoryCSV, generateInventoryPDF, generateInventoryHTML } from '../utils/exportUtils';
import { toast } from "@/hooks/use-toast";

const MonthlyReport = () => {
  const { getDetailedMonthlyReport } = useInventory();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [showChart, setShowChart] = useState(false);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const report = getDetailedMonthlyReport(selectedYear, selectedMonth);
  const selectedMonthName = months.find(m => m.value === selectedMonth)?.label;

  const chartData = report.map(item => ({
    name: item.productName,
    quantity: item.totalQuantity,
  }));

  const monthYear = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`;

  const exportToCSV = () => {
    try {
      generateInventoryCSV(report, monthYear);
      toast({
        title: "Success",
        description: "CSV report downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate CSV report",
        variant: "destructive",
      });
    }
  };

  const exportToPDF = async () => {
    try {
      await generateInventoryPDF(report, monthYear);
      toast({
        title: "Success",
        description: "PDF report download initiated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF report",
        variant: "destructive",
      });
    }
  };

  const exportToHTML = async () => {
    try {
      await generateInventoryHTML(report, monthYear);
      toast({
        title: "Success",
        description: "HTML report downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate HTML report",
        variant: "destructive",
      });
    }
  };

  const toggleProductExpansion = (productName: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productName)) {
      newExpanded.delete(productName);
    } else {
      newExpanded.add(productName);
    }
    setExpandedProducts(newExpanded);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Monthly Inventory Report</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {report.length > 0 && (
            <>
              <Button 
                variant="outline" 
                onClick={() => setShowChart(!showChart)}
                className="w-full sm:w-auto text-sm"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                {showChart ? 'Hide' : 'Show'} Chart
              </Button>
              <Button 
                variant="outline" 
                onClick={exportToCSV}
                className="w-full sm:w-auto text-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button 
                variant="outline" 
                onClick={exportToPDF}
                className="w-full sm:w-auto text-sm"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button 
                variant="outline" 
                onClick={exportToHTML}
                className="w-full sm:w-auto text-sm"
              >
                <Globe className="w-4 h-4 mr-2" />
                Export HTML
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Select Month & Year</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <Select 
                value={selectedYear.toString()} 
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Month
              </label>
              <Select 
                value={selectedMonth.toString()} 
                onValueChange={(value) => setSelectedMonth(parseInt(value))}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {showChart && report.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Quantity Chart - {selectedMonthName} {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="quantity" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">
            Detailed Report for {selectedMonthName} {selectedYear} ({report.length} products)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {report.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm sm:text-base">No entries found for the selected month.</p>
            </div>
          ) : (
            <div className="space-y-0">
              {report.map((item, index) => (
                <div key={index} className="border-b last:border-b-0">
                  <div 
                    className="p-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                    onClick={() => toggleProductExpansion(item.productName)}
                  >
                    <div className="flex items-center gap-2">
                      {expandedProducts.has(item.productName) ? (
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      )}
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800">
                          {item.productName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Total: <span className="font-medium">{item.totalQuantity} {item.unit}</span> received in {item.entries.length} deliveries
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {expandedProducts.has(item.productName) && (
                    <div className="px-4 pb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <h4 className="font-medium text-gray-700 mb-3">Receiving Details:</h4>
                        <div className="space-y-2">
                          {item.entries.map((entry, entryIndex) => (
                            <div key={entryIndex} className="bg-white rounded p-3 border">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                                <div className="flex-1">
                                  <span className="font-medium text-blue-600">
                                    {entry.quantity} {item.unit}
                                  </span>
                                  <span className="text-gray-600 ml-2">
                                    received on {new Date(entry.receivedDate).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="text-gray-600">
                                  Source: <span className="font-medium">{entry.source}</span>
                                </div>
                              </div>
                              {entry.remark && (
                                <div className="mt-2 text-sm text-gray-600">
                                  <span className="font-medium">Comment:</span> {entry.remark}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyReport;
