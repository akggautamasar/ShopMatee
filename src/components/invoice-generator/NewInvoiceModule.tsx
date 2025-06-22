
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Tables } from '@/integrations/supabase/types';
import InvoiceForm from './invoice-form/InvoiceForm';
import InvoicePreview from './InvoicePreview';

type Product = Tables<'ig_products'>;
type Customer = Tables<'ig_customers'>;

interface NewInvoiceModuleProps {
  onInvoiceCreated: () => void;
}

const NewInvoiceModule = ({ onInvoiceCreated }: NewInvoiceModuleProps) => {
  const { user } = useAuth();

  const { data: customers, isLoading: isLoadingCustomers } = useQuery<Customer[], Error>({
    queryKey: ['ig_customers', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('ig_customers').select('*').eq('user_id', user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[], Error>({
    queryKey: ['ig_products', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('ig_products').select('*').eq('user_id', user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Create New Invoice</CardTitle>
            <CardDescription>Fill out the details below to generate a new invoice. Payment will be automatically recorded and inventory will be updated.</CardDescription>
          </CardHeader>
          <CardContent>
            <InvoiceForm
              customers={customers}
              isLoadingCustomers={isLoadingCustomers}
              products={products}
              isLoadingProducts={isLoadingProducts}
              onInvoiceCreated={onInvoiceCreated}
            />
          </CardContent>
        </Card>
      </div>
      <div className="xl:col-span-1">
        <InvoicePreview />
      </div>
    </div>
  );
};

export default NewInvoiceModule;
