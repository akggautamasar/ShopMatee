
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'ig_products'>;

interface AddProductToInventoryFormProps {
  product: Product;
  onAdd: (product: Product, quantity: number, threshold: number) => void;
  onQuantityChange: (productId: string, quantity: number, threshold: number) => void;
  isLoading: boolean;
}

export const AddProductToInventoryForm: React.FC<AddProductToInventoryFormProps> = ({ 
  product, 
  onAdd, 
  onQuantityChange,
  isLoading 
}) => {
  const [quantity, setQuantity] = useState('0');
  const [threshold, setThreshold] = useState('5');

  const handleQuantityChange = (newQuantity: string) => {
    setQuantity(newQuantity);
    const qty = parseFloat(newQuantity) || 0;
    const thresh = parseFloat(threshold) || 5;
    onQuantityChange(product.id, qty, thresh);
  };

  const handleThresholdChange = (newThreshold: string) => {
    setThreshold(newThreshold);
    const qty = parseFloat(quantity) || 0;
    const thresh = parseFloat(newThreshold) || 5;
    onQuantityChange(product.id, qty, thresh);
  };

  const handleAdd = () => {
    const qty = parseFloat(quantity);
    const thresh = parseFloat(threshold);
    
    if (isNaN(qty) || isNaN(thresh) || qty < 0 || thresh < 0) {
      toast({ 
        title: "Error", 
        description: "Please enter valid positive numbers for quantity and threshold", 
        variant: 'destructive' 
      });
      return;
    }

    onAdd(product, qty, thresh);
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1">
        <div className="font-medium">{product.name}</div>
        <div className="text-sm text-muted-foreground">
          {product.unit_type} • ₹{(product.default_rate || 0).toFixed(2)}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Current Stock</Label>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => handleQuantityChange(e.target.value)}
            placeholder="0"
            className="w-20 h-8 text-sm"
            min="0"
            step="0.01"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Low Stock Alert</Label>
          <Input
            type="number"
            value={threshold}
            onChange={(e) => handleThresholdChange(e.target.value)}
            placeholder="5"
            className="w-20 h-8 text-sm"
            min="0"
            step="0.01"
          />
        </div>
        <Button 
          size="sm" 
          onClick={handleAdd}
          disabled={isLoading}
          className="mt-4"
        >
          Add
        </Button>
      </div>
    </div>
  );
};
