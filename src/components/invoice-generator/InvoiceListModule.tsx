
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, AlertTriangle, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import InvoiceView from './InvoiceView';

type InvoiceWithCustomer = Tables<'ig_invoices'> & {
  ig_customers: { name: string } | null;
};

const InvoiceListModule = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [viewingInvoiceId, setViewingInvoiceId] = useState<string | null>(null);

  const { data: invoices, isLoading, error } = useQuery<InvoiceWithCustomer[], Error>({
    queryKey: ['ig_invoices', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('ig_invoices')
        .select('*, ig_customers(name)')
        .eq('user_id', user.id)
        .order('invoice_date', { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!user,
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const { error } = await supabase.from('ig_invoices').delete().eq('id', invoiceId);
      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success('Invoice deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['ig_invoices', user?.id] });
      setInvoiceToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete invoice: ${error.message}`);
      setInvoiceToDelete(null);
    },
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
        <p className="font-semibold">Error loading invoices</p>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
          <CardDescription>A list of all your created invoices.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Invoice Details</TableHead>
                  <TableHead className="min-w-[120px]">Dates</TableHead>
                  <TableHead className="min-w-[100px] text-right">Amount & Status</TableHead>
                  <TableHead className="min-w-[100px] text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices && invoices.length > 0 ? (
                  invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="p-3">
                        <div className="space-y-1">
                          <div className="font-medium text-sm">#{invoice.invoice_number || 'N/A'}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[180px]" title={invoice.ig_customers?.name || 'N/A'}>
                            {invoice.ig_customers?.name || 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="p-3">
                        <div className="space-y-1 text-xs">
                          <div>
                            <span className="text-muted-foreground">Invoice: </span>
                            {format(new Date(invoice.invoice_date), 'dd/MM/yy')}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Due: </span>
                            {invoice.due_date ? format(new Date(invoice.due_date), 'dd/MM/yy') : 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right p-3">
                        <div className="space-y-1">
                          <div className="text-sm font-medium">₹{invoice.grand_total?.toFixed(0)}</div>
                          <div>
                            <span className={`px-2 py-1 rounded text-xs ${
                              invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                              invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {invoice.status}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center p-3">
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-8 text-xs"
                            onClick={() => setViewingInvoiceId(invoice.id)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-8 text-xs text-red-600 hover:text-red-700"
                            onClick={() => setInvoiceToDelete(invoice.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No invoices found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <AlertDialog open={!!invoiceToDelete} onOpenChange={(open) => !open && setInvoiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the invoice.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (invoiceToDelete) {
                  deleteInvoiceMutation.mutate(invoiceToDelete);
                }
              }}
              disabled={deleteInvoiceMutation.isPending}
            >
              {deleteInvoiceMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!viewingInvoiceId} onOpenChange={(open) => !open && setViewingInvoiceId(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          {viewingInvoiceId && <InvoiceView invoiceId={viewingInvoiceId} />}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InvoiceListModule;
