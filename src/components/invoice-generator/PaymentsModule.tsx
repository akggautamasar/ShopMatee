
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Plus, CreditCard, AlertTriangle, CalendarDays, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Payment = Tables<'ig_payments'> & {
  ig_invoices: { invoice_number: string; grand_total: number } | null;
};

type Invoice = Pick<Tables<'ig_invoices'>, 'id' | 'invoice_number' | 'grand_total' | 'status'>;

const PaymentsModule = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');

  const { data: payments, isLoading: paymentsLoading, error: paymentsError } = useQuery<Payment[], Error>({
    queryKey: ['ig_payments', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('ig_payments')
        .select('*, ig_invoices(invoice_number, grand_total)')
        .eq('user_id', user.id)
        .order('payment_date', { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery<Invoice[], Error>({
    queryKey: ['ig_invoices_for_payments', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('ig_invoices')
        .select('id, invoice_number, grand_total, status')
        .eq('user_id', user.id)
        .neq('status', 'Draft')
        .order('invoice_date', { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!user,
  });

  const addPaymentMutation = useMutation({
    mutationFn: async (paymentData: {
      invoice_id: string;
      payment_date: string;
      amount_paid: number;
      payment_method: string;
      notes?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase.from('ig_payments').insert({
        user_id: user.id,
        ...paymentData,
      });
      
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success('Payment recorded successfully!');
      queryClient.invalidateQueries({ queryKey: ['ig_payments', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['ig_invoices_for_payments', user?.id] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(`Failed to record payment: ${error.message}`);
    },
  });

  const resetForm = () => {
    setSelectedInvoiceId('');
    setPaymentDate(format(new Date(), 'yyyy-MM-dd'));
    setAmount('');
    setPaymentMethod('');
    setNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedInvoiceId || !amount || !paymentMethod) {
      toast.error('Please fill in all required fields');
      return;
    }

    addPaymentMutation.mutate({
      invoice_id: selectedInvoiceId,
      payment_date: paymentDate,
      amount_paid: parseFloat(amount),
      payment_method: paymentMethod,
      notes: notes || undefined,
    });
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-48">
          <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">Please sign in to manage payments</p>
        </CardContent>
      </Card>
    );
  }

  if (paymentsLoading || invoicesLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (paymentsError) {
    return (
      <Card>
        <CardContent className="flex flex-col justify-center items-center h-48 text-red-700">
          <AlertTriangle className="h-8 w-8 mb-2" />
          <p className="font-semibold">Error loading payments</p>
          <p className="text-sm">{paymentsError.message}</p>
        </CardContent>
      </Card>
    );
  }

  const totalPayments = payments?.reduce((sum, payment) => sum + (payment.amount_paid || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Payment Management</CardTitle>
            <CardDescription>Record and track invoice payments</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record New Payment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice">Invoice *</Label>
                  <Select value={selectedInvoiceId} onValueChange={setSelectedInvoiceId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an invoice" />
                    </SelectTrigger>
                    <SelectContent>
                      {invoices?.map((invoice) => (
                        <SelectItem key={invoice.id} value={invoice.id}>
                          #{invoice.invoice_number} - ₹{invoice.grand_total?.toFixed(2)} ({invoice.status})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_date">Payment Date *</Label>
                  <Input
                    id="payment_date"
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount Paid (₹) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_method">Payment Method *</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="Card">Credit/Debit Card</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes about this payment..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addPaymentMutation.isPending}>
                    {addPaymentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Record Payment
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalPayments.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">from {payments?.length || 0} payments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Payments</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{payments?.filter(p => {
                  const paymentDate = new Date(p.payment_date);
                  const thirtyDaysAgo = new Date();
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                  return paymentDate >= thirtyDaysAgo;
                }).length || 0}</div>
                <p className="text-xs text-muted-foreground">in last 30 days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Invoices</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{invoices?.length || 0}</div>
                <p className="text-xs text-muted-foreground">invoices for payment</p>
              </CardContent>
            </Card>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments && payments.length > 0 ? (
                  payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{format(new Date(payment.payment_date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>
                        <div className="font-medium">#{payment.ig_invoices?.invoice_number || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">
                          Invoice Total: ₹{payment.ig_invoices?.grand_total?.toFixed(2) || '0.00'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">₹{payment.amount_paid?.toFixed(2)}</div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          {payment.payment_method || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {payment.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No payments recorded yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentsModule;
