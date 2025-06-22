
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface InventoryActionsProps {
  onRefresh: () => void;
  onAddProducts: () => void;
}

export const InventoryActions: React.FC<InventoryActionsProps> = ({
  onRefresh,
  onAddProducts
}) => {
  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={onRefresh}>
        Refresh
      </Button>
      <Button onClick={onAddProducts}>
        <Plus className="h-4 w-4 mr-2" />
        Add Products to Inventory
      </Button>
    </div>
  );
};
