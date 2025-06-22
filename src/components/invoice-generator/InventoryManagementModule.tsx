
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Package } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import { useInventoryManagement } from './inventory/useInventoryManagement';
import { InventoryActions } from './inventory/InventoryActions';
import { InventoryContent } from './inventory/InventoryContent';
import { AddProductsDialog } from './inventory/AddProductsDialog';
import { UpdateInventoryDialog } from './inventory/UpdateInventoryDialog';

type Product = Tables<'ig_products'>;
type Inventory = Tables<'ig_inventory'>;

interface InventoryWithProduct extends Inventory {
  product: Product;
}

const InventoryManagementModule = () => {
  const {
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
    createInventoryMutation,
    addAllProductsMutation,
    updateInventoryMutation,
    deleteInventoryMutation,
    resetForm,
    handleRefreshInventory,
  } = useInventoryManagement();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const quantity = parseFloat(formData.quantity_on_hand);
    const threshold = parseFloat(formData.low_stock_threshold);
    
    if (isNaN(quantity) || isNaN(threshold)) {
      toast({ title: "Error", description: "Please enter valid numbers", variant: 'destructive' });
      return;
    }

    if (editingInventory) {
      updateInventoryMutation.mutate({
        id: editingInventory.id,
        quantity_on_hand: quantity,
        low_stock_threshold: threshold,
      });
    }
  };

  const handleEdit = (item: InventoryWithProduct) => {
    setEditingInventory(item);
    setFormData({
      quantity_on_hand: item.quantity_on_hand?.toString() || '0',
      low_stock_threshold: item.low_stock_threshold?.toString() || '0',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (inventoryId: string) => {
    deleteInventoryMutation.mutate(inventoryId);
  };

  const handleAddFromProduct = (product: Product, quantity: number, threshold: number) => {
    createInventoryMutation.mutate({
      product_id: product.id,
      quantity_on_hand: quantity,
      low_stock_threshold: threshold,
    });
  };

  const updateProductQuantity = (productId: string, quantity: number, threshold: number) => {
    setProductQuantities(prev => ({
      ...prev,
      [productId]: { quantity, threshold }
    }));
  };

  const handleAddAllProducts = () => {
    if (!productsWithoutInventory || productsWithoutInventory.length === 0) {
      toast({ 
        title: "No Products", 
        description: "No products available to add to inventory.", 
        variant: 'destructive' 
      });
      return;
    }

    addAllProductsMutation.mutate({
      products: productsWithoutInventory,
      productQuantities: productQuantities,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-48">
            <div className="text-muted-foreground">Loading inventory...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Inventory Management
              </CardTitle>
              <CardDescription>Track and manage your product inventory levels.</CardDescription>
            </div>
            <InventoryActions
              onRefresh={handleRefreshInventory}
              onAddProducts={() => setIsAddProductsDialogOpen(true)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <InventoryContent
            inventory={inventory}
            lowStockItems={lowStockItems}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddProducts={() => setIsAddProductsDialogOpen(true)}
            isDeleting={deleteInventoryMutation.isPending}
          />
        </CardContent>
      </Card>

      <AddProductsDialog
        isOpen={isAddProductsDialogOpen}
        onOpenChange={setIsAddProductsDialogOpen}
        productsWithoutInventory={productsWithoutInventory}
        productQuantities={productQuantities}
        onAddFromProduct={handleAddFromProduct}
        onUpdateProductQuantity={updateProductQuantity}
        onAddAllProducts={handleAddAllProducts}
        isAddingProduct={createInventoryMutation.isPending}
        isAddingAll={addAllProductsMutation.isPending}
      />

      <UpdateInventoryDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingInventory={editingInventory}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
        onCancel={resetForm}
        isUpdating={updateInventoryMutation.isPending}
      />
    </div>
  );
};

export default InventoryManagementModule;
