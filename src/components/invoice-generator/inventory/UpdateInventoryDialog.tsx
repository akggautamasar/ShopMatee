
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'ig_products'>;
type Inventory = Tables<'ig_inventory'>;

interface InventoryWithProduct extends Inventory {
  product: Product;
}

interface UpdateInventoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingInventory: InventoryWithProduct | null;
  formData: {
    quantity_on_hand: string;
    low_stock_threshold: string;
  };
  onFormDataChange: (data: { quantity_on_hand: string; low_stock_threshold: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isUpdating: boolean;
}

export const UpdateInventoryDialog: React.FC<UpdateInventoryDialogProps> = ({
  isOpen,
  onOpenChange,
  editingInventory,
  formData,
  onFormDataChange,
  onSubmit,
  onCancel,
  isUpdating
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Update Inventory - {editingInventory?.product.name}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="quantity">Current Stock Quantity</Label>
            <Input
              id="quantity"
              type="number"
              step="0.01"
              value={formData.quantity_on_hand}
              onChange={(e) => onFormDataChange({ ...formData, quantity_on_hand: e.target.value })}
              placeholder="Enter current stock quantity"
              required
            />
          </div>
          <div>
            <Label htmlFor="threshold">Low Stock Alert Threshold</Label>
            <Input
              id="threshold"
              type="number"
              step="0.01"
              value={formData.low_stock_threshold}
              onChange={(e) => onFormDataChange({ ...formData, low_stock_threshold: e.target.value })}
              placeholder="Alert when stock falls below this amount"
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Inventory'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
