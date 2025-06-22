
import React from 'react';
import { Controller, Control, UseFormSetValue } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { PlusCircle, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Tables } from '@/integrations/supabase/types';
import type { InvoiceFormData } from '../schema';
import AddCustomerDialog from '../AddCustomerDialog';

type Customer = Tables<'ig_customers'>;

interface InvoiceFormHeaderProps {
  control: Control<InvoiceFormData>;
  setValue: UseFormSetValue<InvoiceFormData>;
  customers: Customer[] | undefined;
  isLoadingCustomers: boolean;
  errors: any;
  invoiceDateOpen: boolean;
  setInvoiceDateOpen: (open: boolean) => void;
  dueDateOpen: boolean;
  setDueDateOpen: (open: boolean) => void;
}

const InvoiceFormHeader = ({
  control,
  setValue,
  customers,
  isLoadingCustomers,
  errors,
  invoiceDateOpen,
  setInvoiceDateOpen,
  dueDateOpen,
  setDueDateOpen,
}: InvoiceFormHeaderProps) => {
  const handleCustomerCreated = (customer: Customer) => {
    setValue('customer_id', customer.id);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
        <div className="flex items-center gap-2">
          <Controller
            name="customer_id"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingCustomers}>
                <SelectTrigger className="flex-grow"><SelectValue placeholder="Select a customer" /></SelectTrigger>
                <SelectContent>
                  {customers?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
          <AddCustomerDialog onCustomerCreated={handleCustomerCreated}>
            <Button type="button" variant="outline" size="icon" className="flex-shrink-0">
              <PlusCircle className="h-4 w-4"/>
            </Button>
          </AddCustomerDialog>
        </div>
        {errors.customer_id && <p className="text-red-500 text-sm mt-1">{errors.customer_id.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
        <Controller
          name="invoice_date"
          control={control}
          render={({ field }) => (
            <Popover open={invoiceDateOpen} onOpenChange={setInvoiceDateOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar 
                  mode="single" 
                  selected={field.value} 
                  onSelect={(date) => {
                    field.onChange(date);
                    setInvoiceDateOpen(false);
                  }} 
                  initialFocus 
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          )}
        />
         {errors.invoice_date && <p className="text-red-500 text-sm mt-1">{errors.invoice_date.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
        <Controller
          name="due_date"
          control={control}
          render={({ field }) => (
             <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar 
                  mode="single" 
                  selected={field.value ?? undefined} 
                  onSelect={(date) => {
                    field.onChange(date);
                    setDueDateOpen(false);
                  }} 
                  initialFocus 
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          )}
        />
      </div>
    </div>
  );
};

export default InvoiceFormHeader;
