
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'ig_products'>;

interface BulkAddProductsDialogProps {
  products: Product[];
  onProductsSelected: (products: Product[]) => void;
  children: React.ReactNode;
}

const BulkAddProductsDialog = ({ products, onProductsSelected, children }: BulkAddProductsDialogProps) => {
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleToggleProduct = (productId: string) => {
    setSelectedProductIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleAddProducts = () => {
    const selectedProducts = products.filter(p => selectedProductIds.has(p.id));
    onProductsSelected(selectedProducts);
    setSelectedProductIds(new Set());
    setIsDialogOpen(false);
  };
  
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Products in Bulk</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-72">
          <div className="p-4 space-y-2">
            {products.map(product => (
              <div key={product.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`product-${product.id}`}
                  checked={selectedProductIds.has(product.id)}
                  onCheckedChange={() => handleToggleProduct(product.id)}
                />
                <Label htmlFor={`product-${product.id}`} className="font-normal">{product.name}</Label>
              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild>
             <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleAddProducts}>Add Selected Products</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkAddProductsDialog;
