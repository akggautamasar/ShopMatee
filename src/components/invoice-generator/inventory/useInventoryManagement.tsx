import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'ig_products'>;
type Inventory = Tables<'ig_inventory'>;

interface InventoryWithProduct extends Inventory {
  product: Product;
}

interface ProductQuantityMap {
  [productId: string]: {
    quantity: number;
    threshold: number;
  };
}

export const useInventoryManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddProductsDialogOpen, setIsAddProductsDialogOpen] = useState(false);
  const [editingInventory, setEditingInventory] = useState<InventoryWithProduct | null>(null);
  const [productQuantities, setProductQuantities] = useState<ProductQuantityMap>({});
  const [formData, setFormData] = useState({
    quantity_on_hand: '',
    low_stock_threshold: '',
  });

  const { data: inventory, isLoading, refetch } = useQuery<InventoryWithProduct[], Error>({
    queryKey: ['ig_inventory', user?.id],
    queryFn: async () => {
      if (!user) return [];
      console.log('Fetching inventory data...');
      
      const { data, error } = await supabase
        .from('ig_inventory')
        .select(`
          *,
          product:ig_products(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching inventory:', error);
        throw error;
      }
      
      console.log('Inventory data fetched:', data);
      return data as InventoryWithProduct[] || [];
    },
    enabled: !!user,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0, // Always consider data stale
    refetchInterval: 3000, // Auto-refresh every 3 seconds
  });

  const { data: productsWithoutInventory } = useQuery<Product[], Error>({
    queryKey: ['ig_products_without_inventory', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: allProducts, error: productsError } = await supabase
        .from('ig_products')
        .select('*')
        .eq('user_id', user.id);
      
      if (productsError) throw productsError;
      
      const { data: inventoryItems, error: inventoryError } = await supabase
        .from('ig_inventory')
        .select('product_id')
        .eq('user_id', user.id);
        
      if (inventoryError) throw inventoryError;
      
      const inventoryProductIds = new Set(inventoryItems?.map(item => item.product_id) || []);
      const productsWithoutInventory = allProducts?.filter(product => 
        !inventoryProductIds.has(product.id)
      ) || [];
      
      return productsWithoutInventory;
    },
    enabled: !!user,
  });

  const createInventoryMutation = useMutation<void, Error, { product_id: string; quantity_on_hand: number; low_stock_threshold: number }>({
    mutationFn: async ({ product_id, quantity_on_hand, low_stock_threshold }) => {
      const { error } = await supabase
        .from('ig_inventory')
        .insert({
          user_id: user?.id,
          product_id,
          quantity_on_hand,
          low_stock_threshold,
          last_stocked_at: new Date().toISOString(),
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Success!", description: "Inventory item created successfully." });
      queryClient.invalidateQueries({ queryKey: ['ig_inventory'] });
      queryClient.invalidateQueries({ queryKey: ['ig_products_without_inventory'] });
      setIsAddProductsDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: 'destructive' });
    }
  });

  const addAllProductsMutation = useMutation<void, Error, { products: Product[]; productQuantities: ProductQuantityMap }>({
    mutationFn: async ({ products, productQuantities }) => {
      const inventoryEntries = products.map(product => {
        const productData = productQuantities[product.id] || { quantity: 0, threshold: 5 };
        return {
          user_id: user?.id,
          product_id: product.id,
          quantity_on_hand: productData.quantity,
          low_stock_threshold: productData.threshold,
          last_stocked_at: new Date().toISOString(),
        };
      });

      const { error } = await supabase
        .from('ig_inventory')
        .insert(inventoryEntries);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast({ 
        title: "Success!", 
        description: `${variables.products.length} products added to inventory successfully.` 
      });
      queryClient.invalidateQueries({ queryKey: ['ig_inventory'] });
      queryClient.invalidateQueries({ queryKey: ['ig_products_without_inventory'] });
      setIsAddProductsDialogOpen(false);
      setProductQuantities({});
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: 'destructive' });
    }
  });

  const updateInventoryMutation = useMutation<void, Error, { id: string; quantity_on_hand: number; low_stock_threshold: number }>({
    mutationFn: async ({ id, quantity_on_hand, low_stock_threshold }) => {
      const { error } = await supabase
        .from('ig_inventory')
        .update({
          quantity_on_hand,
          low_stock_threshold,
          last_stocked_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Success!", description: "Inventory updated successfully." });
      queryClient.invalidateQueries({ queryKey: ['ig_inventory'] });
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: 'destructive' });
    }
  });

  const deleteInventoryMutation = useMutation<void, Error, string>({
    mutationFn: async (inventoryId: string) => {
      const { error } = await supabase
        .from('ig_inventory')
        .delete()
        .eq('id', inventoryId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Success!", description: "Product removed from inventory successfully." });
      queryClient.invalidateQueries({ queryKey: ['ig_inventory'] });
      queryClient.invalidateQueries({ queryKey: ['ig_products_without_inventory'] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: 'destructive' });
    }
  });

  const resetForm = () => {
    setFormData({ quantity_on_hand: '', low_stock_threshold: '' });
    setEditingInventory(null);
    setIsDialogOpen(false);
  };

  const handleRefreshInventory = async () => {
    console.log('Manual refresh triggered - forcing fresh data fetch...');
    
    // Clear the cache completely for inventory queries
    queryClient.removeQueries({ queryKey: ['ig_inventory'] });
    queryClient.removeQueries({ queryKey: ['ig_products_without_inventory'] });
    queryClient.removeQueries({ queryKey: ['product_inventory'] });
    
    // Refetch with fresh data
    await refetch();
    await queryClient.invalidateQueries({ queryKey: ['ig_inventory'] });
    
    toast({ 
      title: "Inventory refreshed", 
      description: "Fresh inventory data has been loaded from the database." 
    });
  };

  const lowStockItems = inventory?.filter(item => 
    (item.quantity_on_hand || 0) <= (item.low_stock_threshold || 0)
  ) || [];

  return {
    // State
    inventory,
    productsWithoutInventory,
    lowStockItems,
    isLoading,
    isDialogOpen,
    setIsDialogOpen,
    isAddProductsDialogOpen,
    setIsAddProductsDialogOpen,
    editingInventory,
    setEditingInventory,
    productQuantities,
    setProductQuantities,
    formData,
    setFormData,
    
    // Mutations
    createInventoryMutation,
    addAllProductsMutation,
    updateInventoryMutation,
    deleteInventoryMutation,
    
    // Functions
    resetForm,
    handleRefreshInventory,
  };
};
