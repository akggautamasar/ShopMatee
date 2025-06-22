
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AddProductToInventoryForm } from './AddProductToInventoryForm';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'ig_products'>;

interface ProductQuantityMap {
  [productId: string]: {
    quantity: number;
    threshold: number;
  };
}

interface AddProductsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  productsWithoutInventory: Product[] | undefined;
  productQuantities: ProductQuantityMap;
  onAddFromProduct: (product: Product, quantity: number, threshold: number) => void;
  onUpdateProductQuantity: (productId: string, quantity: number, threshold: number) => void;
  onAddAllProducts: () => void;
  isAddingProduct: boolean;
  isAddingAll: boolean;
}

export const AddProductsDialog: React.FC<AddProductsDialogProps> = ({
  isOpen,
  onOpenChange,
  productsWithoutInventory,
  productQuantities,
  onAddFromProduct,
  onUpdateProductQuantity,
  onAddAllProducts,
  isAddingProduct,
  isAddingAll
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Products to Inventory</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {productsWithoutInventory && productsWithoutInventory.length > 0 && (
            <div className="flex justify-between items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div>
                <p className="font-medium text-blue-900">Add All Products</p>
                <p className="text-sm text-blue-700">
                  Add all {productsWithoutInventory.length} products with the quantities you've entered below
                </p>
              </div>
              <Button 
                onClick={onAddAllProducts}
                disabled={isAddingAll}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                {isAddingAll ? 'Adding...' : 'Add All Products'}
              </Button>
            </div>
          )}
          
          <div className="max-h-96 overflow-y-auto">
            {productsWithoutInventory && productsWithoutInventory.length > 0 ? (
              productsWithoutInventory.map(product => (
                <AddProductToInventoryForm 
                  key={product.id} 
                  product={product} 
                  onAdd={onAddFromProduct}
                  onQuantityChange={onUpdateProductQuantity}
                  isLoading={isAddingProduct}
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>All your products are already being tracked in inventory.</p>
                <p className="text-sm mt-2">Create new products in the Product Management section to add them here.</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
