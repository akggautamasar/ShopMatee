import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/components/ui/use-toast';
import { PlusCircle, Edit, Trash2, Loader2, Users, Phone, Mail } from 'lucide-react';
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

const CustomerManagementModule = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      contact_number: '',
      email: '',
      billing_address: '',
      shipping_address: '',
      customer_tag: '',
    }
  });

  // Fetch customers
  const { data: customers, isLoading: isLoadingCustomers, error: customersError } = useQuery<Customer[], Error>({
    queryKey: ['ig_customers', user?.id],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");
      const { data, error } = await supabase
        .from('ig_customers')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Add customer mutation
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ig_customers', user?.id] });
      toast({ title: "Success", description: "Customer added successfully." });
      setIsDialogOpen(false);
      reset();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Update customer mutation
  const updateCustomerMutation = useMutation<Customer, Error, { id: string } & CustomerFormData>({
    mutationFn: async ({ id, ...updatedCustomerData }) => {
      if (!user) throw new Error("User not authenticated");
      const { data, error } = await supabase
        .from('ig_customers')
        .update({
          name: updatedCustomerData.name,
          contact_number: updatedCustomerData.contact_number ?? null,
          email: updatedCustomerData.email ?? null,
          billing_address: updatedCustomerData.billing_address ?? null,
          shipping_address: updatedCustomerData.shipping_address ?? null,
          customer_tag: updatedCustomerData.customer_tag ?? null,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ig_customers', user?.id] });
      toast({ title: "Success", description: "Customer updated successfully." });
      setIsDialogOpen(false);
      reset();
      setEditingCustomer(null);
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
  
  // Delete customer mutation
  const deleteCustomerMutation = useMutation<void, Error, string>({
    mutationFn: async (customerId) => {
      if (!user) throw new Error("User not authenticated");
      const { error } = await supabase
        .from('ig_customers')
        .delete()
        .eq('id', customerId)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ig_customers', user?.id] });
      toast({ title: "Success", description: "Customer deleted successfully." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (formData: CustomerFormData) => {
    if (editingCustomer) {
      updateCustomerMutation.mutate({ ...formData, id: editingCustomer.id });
    } else {
      addCustomerMutation.mutate(formData);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    reset({
      name: customer.name,
      contact_number: customer.contact_number || '',
      email: customer.email || '',
      billing_address: customer.billing_address || '',
      shipping_address: customer.shipping_address || '',
      customer_tag: customer.customer_tag || '',
    });
    setIsDialogOpen(true);
  };

  const openDialogForNew = () => {
    setEditingCustomer(null);
    reset({ name: '', contact_number: '', email: '', billing_address: '', shipping_address: '', customer_tag: '' });
    setIsDialogOpen(true);
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'VIP': return 'bg-purple-100 text-purple-800';
      case 'Wholesale': return 'bg-blue-100 text-blue-800';
      case 'Regular': return 'bg-green-100 text-green-800';
      case 'New': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return <p>Please log in to manage customers.</p>;
  }

  if (isLoadingCustomers) {
    return <div className="flex justify-center items-center h-32"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /> <span className="ml-2">Loading customers...</span></div>;
  }

  if (customersError) {
    return <p className="text-red-500">Error loading customers: {customersError.message}</p>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Manage Customers</CardTitle>
          <Button onClick={openDialogForNew} size="sm">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Customer
          </Button>
        </div>
        <CardDescription>Add, edit, or remove customer details.</CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) { setEditingCustomer(null); reset(); }}}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <Label htmlFor="name">Customer Name</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="contact_number">Contact Number</Label>
                <Input id="contact_number" {...register('contact_number')} />
                {errors.contact_number && <p className="text-red-500 text-sm mt-1">{errors.contact_number.message}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="billing_address">Billing Address</Label>
                <Textarea id="billing_address" {...register('billing_address')} />
                {errors.billing_address && <p className="text-red-500 text-sm mt-1">{errors.billing_address.message}</p>}
              </div>
              <div>
                <Label htmlFor="shipping_address">Shipping Address</Label>
                <Textarea id="shipping_address" {...register('shipping_address')} />
                {errors.shipping_address && <p className="text-red-500 text-sm mt-1">{errors.shipping_address.message}</p>}
              </div>
              <div>
                <Label htmlFor="customer_tag">Customer Tag</Label>
                <Controller
                  name="customer_tag"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a tag" />
                      </SelectTrigger>
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
                <Button type="submit" disabled={addCustomerMutation.isPending || updateCustomerMutation.isPending}>
                   {(addCustomerMutation.isPending || updateCustomerMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingCustomer ? 'Save Changes' : 'Add Customer'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {customers && customers.length > 0 ? (
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[250px]">Customer Details</TableHead>
                  <TableHead className="min-w-[100px] text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="p-3">
                      <div className="space-y-2">
                        <div className="font-medium text-sm">{customer.name}</div>
                        
                        {customer.contact_number && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Phone className="h-3 w-3 mr-1" />
                            {customer.contact_number}
                          </div>
                        )}
                        
                        {customer.email && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Mail className="h-3 w-3 mr-1" />
                            {customer.email}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          {customer.customer_tag && (
                            <Badge className={`text-xs ${getTagColor(customer.customer_tag)}`}>
                              {customer.customer_tag}
                            </Badge>
                          )}
                        </div>
                        
                        {(customer.billing_address || customer.shipping_address) && (
                          <div className="text-xs text-muted-foreground">
                            {customer.billing_address && (
                              <div>Billing: {customer.billing_address.substring(0, 30)}...</div>
                            )}
                            {customer.shipping_address && (
                              <div>Shipping: {customer.shipping_address.substring(0, 30)}...</div>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center p-3">
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(customer)}
                          className="w-full h-8 text-xs"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteCustomerMutation.mutate(customer.id)}
                          disabled={deleteCustomerMutation.isPending && deleteCustomerMutation.variables === customer.id}
                          className="w-full h-8 text-xs text-red-600 hover:text-red-700"
                        >
                          {deleteCustomerMutation.isPending && deleteCustomerMutation.variables === customer.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <p>No customers added yet.</p>
            <p>Click "Add Customer" to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerManagementModule;
