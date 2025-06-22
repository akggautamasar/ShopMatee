
import React, { useEffect } from 'react';
import { useWatch, UseFormSetValue } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Controller } from 'react-hook-form';
import type { Tables } from '@/integrations/supabase/types';
import type { InvoiceFormData } from './schema';

type Product = Tables<'ig_products'>;

interface EditItemSheetProps {
  itemIndex: number;
  isOpen: boolean;
  onClose: () => void;
  control: any;
  remove: (index: number) => void;
  products: Product[] | undefined;
  isLoadingProducts: boolean;
  setValue: UseFormSetValue<InvoiceFormData>;
}

const EditItemSheet = ({ itemIndex, isOpen, onClose, control, remove, products, isLoadingProducts, setValue }: EditItemSheetProps) => {
  const { user } = useAuth();
  
  // Use useWatch with the passed control instead of useFormContext
  const currentItem = useWatch({ 
    control, 
    name: `items.${itemIndex}` 
  });
  
  const selectedProductId = useWatch({ 
    control, 
    name: `items.${itemIndex}.product_id` 
  });

  const selectedProduct = products?.find(p => p.id === selectedProductId);

  // Add inventory query for selected product
  const { data: inventory } = useQuery({
    queryKey: ['product_inventory', selectedProduct?.id],
    queryFn: async () => {
      if (!selectedProduct?.id || !user) return null;
      const { data, error } = await supabase
        .from('ig_inventory')
        .select('quantity_on_hand')
        .eq('user_id', user.id)
        .eq('product_id', selectedProduct.id)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!selectedProduct?.id && !!user,
  });

  const handleProductSelect = (productId: string) => {
    const product = products?.find(p => p.id === productId);
    if (product) {
      setValue(`items.${itemIndex}.product_id`, product.id);
      setValue(`items.${itemIndex}.item_description`, product.name);
      setValue(`items.${itemIndex}.unit_type`, product.unit_type);
      setValue(`items.${itemIndex}.rate`, product.default_rate ?? 0);
      setValue(`items.${itemIndex}.tax_percentage`, product.tax_percentage ?? 0);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Edit Item</SheetTitle>
          <SheetDescription>
            Update the details for this invoice item.
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6 py-4">
          <div>
            <Label htmlFor={`item-${itemIndex}-product`}>Product</Label>
            <Select onValueChange={value => handleProductSelect(value)} value={selectedProductId || ''} disabled={isLoadingProducts}>
              <SelectTrigger><SelectValue placeholder="Select a product" /></SelectTrigger>
              <SelectContent>
                {products?.map(product => (
                  <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Show inventory information if available */}
          {inventory && selectedProduct && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Available Stock:</strong> {inventory.quantity_on_hand} {selectedProduct.unit_type || 'units'}
              </p>
            </div>
          )}

          {/* Show warning if requested quantity exceeds available stock */}
          {inventory && selectedProduct && currentItem?.quantity > inventory.quantity_on_hand && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="h-4 w-4" />
                <p className="text-sm">
                  <strong>Warning:</strong> Requested quantity ({currentItem.quantity}) exceeds available stock ({inventory.quantity_on_hand}).
                  Inventory will be reduced to 0 after this sale.
                </p>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor={`item-${itemIndex}-description`}>Description</Label>
            <Controller
              name={`items.${itemIndex}.item_description`}
              control={control}
              render={({ field }) => (
                <Input type="text" id={`item-${itemIndex}-description`} {...field} />
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`item-${itemIndex}-quantity`}>Quantity</Label>
              <Controller
                name={`items.${itemIndex}.quantity`}
                control={control}
                render={({ field }) => (
                  <Input 
                    type="number" 
                    step="0.01" 
                    id={`item-${itemIndex}-quantity`} 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                )}
              />
            </div>
            <div>
              <Label htmlFor={`item-${itemIndex}-unit`}>Unit Type</Label>
              <Controller
                name={`items.${itemIndex}.unit_type`}
                control={control}
                render={({ field }) => (
                  <Input type="text" id={`item-${itemIndex}-unit`} {...field} />
                )}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`item-${itemIndex}-rate`}>Rate</Label>
              <Controller
                name={`items.${itemIndex}.rate`}
                control={control}
                render={({ field }) => (
                  <Input 
                    type="number" 
                    step="0.01" 
                    id={`item-${itemIndex}-rate`} 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                )}
              />
            </div>
            <div>
              <Label htmlFor={`item-${itemIndex}-tax`}>Tax (%)</Label>
              <Controller
                name={`items.${itemIndex}.tax_percentage`}
                control={control}
                render={({ field }) => (
                  <Input 
                    type="number" 
                    step="0.01" 
                    id={`item-${itemIndex}-tax`} 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                )}
              />
            </div>
          </div>
        </div>

        <SheetFooter className="flex justify-between">
          <Button variant="destructive" size="sm" onClick={() => remove(itemIndex)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button type="button" size="sm" onClick={onClose}>
            Save
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default EditItemSheet;
