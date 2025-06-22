
import React from 'react';
import { Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyInventoryStateProps {
  onAddProducts: () => void;
}

export const EmptyInventoryState: React.FC<EmptyInventoryStateProps> = ({ onAddProducts }) => {
  return (
    <div className="text-center py-8">
      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium text-muted-foreground mb-2">No inventory items</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Start by adding your products to the inventory to track stock levels.
      </p>
      <Button onClick={onAddProducts}>
        <Plus className="h-4 w-4 mr-2" />
        Add Products to Inventory
      </Button>
    </div>
  );
};
