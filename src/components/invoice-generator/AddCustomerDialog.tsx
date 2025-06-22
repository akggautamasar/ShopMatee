
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Customer = Tables<'ig_customers'>;

const customerTagOptions = ["Regular", "Wholesale", "VIP", "New"];

const customerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  contact_number: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  billing_address: z.string().optional(),
  shipping_address: z.string().optional(),
  customer_tag: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface AddCustomerDialogProps {
  onCustomerCreated: (customer: Customer) => void;
  children: React.ReactNode;
}

const AddCustomerDialog = ({ onCustomerCreated, children }: AddCustomerDialogProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: '', contact_number: '', email: '', billing_address: '', shipping_address: '', customer_tag: '' }
  });

  const addCustomerMutation = useMutation<Customer, Error, CustomerFormData>({
    mutationFn: async (newCustomer) => {
      if (!user) throw new Error("User not authenticated");
      const { data, error } = await supabase
        .from('ig_customers')
        .insert([{
          name: newCustomer.name,
          user_id: user.id,
          contact_number: newCustomer.contact_number ?? null,
          email: newCustomer.email ?? null,
          billing_address: newCustomer.billing_address ?? null,
          shipping_address: newCustomer.shipping_address ?? null,
          customer_tag: newCustomer.customer_tag ?? null,
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ig_customers', user?.id] });
      toast({ title: "Success", description: "Customer added successfully." });
      onCustomerCreated(data);
      setIsDialogOpen(false);
      reset();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (formData: CustomerFormData) => {
    addCustomerMutation.mutate(formData);
  };
  
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <Label htmlFor="name-new">Customer Name</Label>
            <Input id="name-new" {...register('name')} />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="contact_number-new">Contact Number</Label>
            <Input id="contact_number-new" {...register('contact_number')} />
            {errors.contact_number && <p className="text-red-500 text-sm mt-1">{errors.contact_number.message}</p>}
          </div>
          <div>
            <Label htmlFor="email-new">Email</Label>
            <Input id="email-new" type="email" {...register('email')} />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="billing_address-new">Billing Address</Label>
            <Textarea id="billing_address-new" {...register('billing_address')} />
            {errors.billing_address && <p className="text-red-500 text-sm mt-1">{errors.billing_address.message}</p>}
          </div>
          <div>
            <Label htmlFor="shipping_address-new">Shipping Address</Label>
            <Textarea id="shipping_address-new" {...register('shipping_address')} />
            {errors.shipping_address && <p className="text-red-500 text-sm mt-1">{errors.shipping_address.message}</p>}
          </div>
          <div>
            <Label htmlFor="customer_tag-new">Customer Tag</Label>
            <Controller
              name="customer_tag"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger><SelectValue placeholder="Select a tag" /></SelectTrigger>
                  <SelectContent>
                    {customerTagOptions.map(tag => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.customer_tag && <p className="text-red-500 text-sm mt-1">{errors.customer_tag.message}</p>}
          </div>
          <DialogFooter>
             <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
             </DialogClose>
            <Button type="submit" disabled={addCustomerMutation.isPending}>
               {addCustomerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Customer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCustomerDialog;
