
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';
import { invoiceSchema, type InvoiceFormData } from '../schema';
import EditItemSheet from '../EditItemSheet';
import InvoiceFormHeader from './InvoiceFormHeader';
import InvoiceItemsSection from './InvoiceItemsSection';
import InvoiceSummary from './InvoiceSummary';

type Product = Tables<'ig_products'>;
type Customer = Tables<'ig_customers'>;

interface InvoiceFormProps {
  customers: Customer[] | undefined;
  isLoadingCustomers: boolean;
  products: Product[] | undefined;
  isLoadingProducts: boolean;
  onInvoiceCreated: () => void;
}

const InvoiceForm = ({ 
  customers, 
  isLoadingCustomers, 
  products, 
  isLoadingProducts, 
  onInvoiceCreated 
}: InvoiceFormProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [totals, setTotals] = useState({ subtotal: 0, tax: 0, grandTotal: 0 });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [invoiceDateOpen, setInvoiceDateOpen] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoice_date: new Date(),
      items: [{ product_id: null, item_description: '', quantity: 1, unit_type: '', rate: 0, tax_percentage: 0 }],
    },
  });
  const { register, control, handleSubmit, formState: { errors }, setValue } = form;

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchedItems = useWatch({ control, name: "items" });

  const createInvoiceMutation = useMutation<string, Error, InvoiceFormData>({
    mutationFn: async (invoiceData) => {
      console.log('Creating invoice with items:', invoiceData.items);
      
      const { data, error } = await supabase.rpc('create_full_invoice', {
        p_customer_id: invoiceData.customer_id,
        p_invoice_date: format(invoiceData.invoice_date, 'yyyy-MM-dd'),
        p_due_date: invoiceData.due_date ? format(invoiceData.due_date, 'yyyy-MM-dd') : null,
        p_notes: invoiceData.notes || null,
        p_terms: invoiceData.terms_and_conditions || null,
        p_items: invoiceData.items.map(item => ({
          product_id: item.product_id,
          item_description: item.item_description,
          quantity: item.quantity,
          unit_type: item.unit_type,
          rate: item.rate,
          tax_percentage: item.tax_percentage
        }))
      });

      if (error) {
        console.error('Error creating invoice:', error);
        throw new Error(error.message);
      }
      
      console.log('Invoice created successfully:', data);
      return data;
    },
    onSuccess: async () => {
      console.log('Invoice creation successful, starting comprehensive inventory refresh...');
      
      toast({ 
        title: "Success!", 
        description: "Invoice created successfully with automatic payment recorded. Inventory is being updated..." 
      });
      
      // First, invalidate all inventory-related queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['ig_inventory'] }),
        queryClient.invalidateQueries({ queryKey: ['ig_products_without_inventory'] }),
        queryClient.invalidateQueries({ queryKey: ['product_inventory'] }),
        queryClient.invalidateQueries({ queryKey: ['ig_invoices'] }),
        queryClient.invalidateQueries({ queryKey: ['ig_payments'] }),
      ]);
      
      // Force immediate refetch of inventory data
      await queryClient.refetchQueries({ queryKey: ['ig_inventory'] });
      
      // Wait 500ms and refetch again to ensure database updates are captured
      setTimeout(async () => {
        console.log('Secondary inventory refresh after 500ms...');
        await queryClient.refetchQueries({ queryKey: ['ig_inventory'] });
        
        // Final refresh after another 1 second
        setTimeout(async () => {
          console.log('Final inventory refresh after 1.5s total...');
          await queryClient.refetchQueries({ queryKey: ['ig_inventory'] });
          
          toast({ 
            title: "Inventory Updated", 
            description: "Stock levels have been updated successfully!" 
          });
        }, 1000);
      }, 500);
      
      console.log('All queries invalidated and first refetch completed');
      
      form.reset();
      onInvoiceCreated();
    },
    onError: (error) => {
      console.error('Invoice creation failed:', error);
      toast({ title: "Error creating invoice", description: error.message, variant: 'destructive' });
    }
  });

  useEffect(() => {
    const items = watchedItems || [];
    const { subtotal, tax } = items.reduce((acc, item) => {
      const lineSubtotal = (item.rate || 0) * (item.quantity || 0);
      const lineTax = lineSubtotal * ((item.tax_percentage || 0) / 100);
      acc.subtotal += lineSubtotal;
      acc.tax += lineTax;
      return acc;
    }, { subtotal: 0, tax: 0 });
    
    setTotals({
      subtotal,
      tax,
      grandTotal: subtotal + tax
    });
  }, [watchedItems]);

  const handleProductSelect = (index: number, productId: string) => {
    const product = products?.find(p => p.id === productId);
    if (product) {
      setValue(`items.${index}.product_id`, product.id);
      setValue(`items.${index}.item_description`, product.name);
      setValue(`items.${index}.unit_type`, product.unit_type);
      setValue(`items.${index}.rate`, product.default_rate ?? 0);
      setValue(`items.${index}.tax_percentage`, product.tax_percentage ?? 0);
    }
  };

  const onSubmit = (data: InvoiceFormData) => {
    console.log('Submitting invoice data:', data);
    createInvoiceMutation.mutate(data);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <InvoiceFormHeader
          control={control}
          setValue={setValue}
          customers={customers}
          isLoadingCustomers={isLoadingCustomers}
          errors={errors}
          invoiceDateOpen={invoiceDateOpen}
          setInvoiceDateOpen={setInvoiceDateOpen}
          dueDateOpen={dueDateOpen}
          setDueDateOpen={setDueDateOpen}
        />
        
        <InvoiceItemsSection
          fields={fields}
          append={append}
          watchedItems={watchedItems}
          products={products}
          setEditingIndex={setEditingIndex}
          errors={errors}
        />
        
        <InvoiceSummary
          register={register}
          totals={totals}
        />
        
        <CardFooter className="px-0">
          <Button type="submit" disabled={createInvoiceMutation.isPending}>
            {createInvoiceMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
            Save Invoice
          </Button>
        </CardFooter>
      </form>
      
      {editingIndex !== null && (
        <EditItemSheet
          itemIndex={editingIndex}
          isOpen={editingIndex !== null}
          onClose={() => setEditingIndex(null)}
          control={control}
          remove={remove}
          products={products}
          isLoadingProducts={isLoadingProducts}
          setValue={setValue}
        />
      )}
    </>
  );
};

export default InvoiceForm;
