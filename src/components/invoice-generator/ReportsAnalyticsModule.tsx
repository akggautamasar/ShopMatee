
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Loader2, AlertTriangle, CreditCard, FileText, Tag, Boxes } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';

type Invoice = Pick<Tables<'ig_invoices'>, 'grand_total' | 'invoice_date' | 'total_tax_amount' | 'customer_id'>;

const ReportsAnalyticsModule = () => {
  const { user } = useAuth();

  const { data: invoices, isLoading, error } = useQuery<Invoice[], Error>({
    queryKey: ['invoice_analytics', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('ig_invoices')
        .select('grand_total, invoice_date, total_tax_amount, customer_id')
        .eq('user_id', user.id)
        .not('status', 'eq', 'Draft');

      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-48 bg-red-50 text-red-700 rounded-lg p-4">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <p className="font-semibold">Error loading reports</p>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  // Show authentication required message if no user
  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center h-48 bg-blue-50 text-blue-700 rounded-lg p-4">
        <CreditCard className="h-8 w-8 mb-2" />
        <p className="font-semibold">Authentication Required</p>
        <p className="text-sm">Please sign in to view your invoice reports and analytics.</p>
      </div>
    );
  }

  const totalSales = invoices?.reduce((acc, inv) => acc + (inv.grand_total || 0), 0) ?? 0;
  const totalTax = invoices?.reduce((acc, inv) => acc + (inv.total_tax_amount || 0), 0) ?? 0;
  const totalInvoices = invoices?.length ?? 0;
  const uniqueCustomers = new Set(invoices?.map(inv => inv.customer_id).filter(Boolean)).size;

  const last30Days = eachDayOfInterval({
    start: subDays(new Date(), 29),
    end: new Date(),
  });

  const salesData = last30Days.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dailySales = invoices
      ?.filter(inv => inv.invoice_date === dateStr)
      .reduce((acc, inv) => acc + (inv.grand_total || 0), 0) ?? 0;
    return {
      date: format(day, 'MMM d'),
      sales: dailySales,
    };
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">from {totalInvoices} invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tax Collected</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalTax.toFixed(2)}</div>
             <p className="text-xs text-muted-foreground">from processed invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Customers</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueCustomers}</div>
            <p className="text-xs text-muted-foreground">who made purchases</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoices}</div>
            <p className="text-xs text-muted-foreground">excluding drafts</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Sales Overview (Last 30 Days)</CardTitle>
          <CardDescription>Shows sales from non-draft invoices.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
              <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Sales (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsAnalyticsModule;
