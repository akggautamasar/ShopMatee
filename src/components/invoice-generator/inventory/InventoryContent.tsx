
import React from 'react';
import type { Tables } from '@/integrations/supabase/types';
import { LowStockAlert } from './LowStockAlert';
import { InventoryTable } from './InventoryTable';
import { EmptyInventoryState } from './EmptyInventoryState';

type Product = Tables<'ig_products'>;
type Inventory = Tables<'ig_inventory'>;

interface InventoryWithProduct extends Inventory {
  product: Product;
}

interface InventoryContentProps {
  inventory: InventoryWithProduct[] | undefined;
  lowStockItems: InventoryWithProduct[];
  onEdit: (item: InventoryWithProduct) => void;
  onDelete: (inventoryId: string) => void;
  onAddProducts: () => void;
  isDeleting: boolean;
}

export const InventoryContent: React.FC<InventoryContentProps> = ({
  inventory,
  lowStockItems,
  onEdit,
  onDelete,
  onAddProducts,
  isDeleting
}) => {
  return (
    <>
      <LowStockAlert lowStockItems={lowStockItems} />

      {inventory && inventory.length > 0 ? (
        <InventoryTable
          inventory={inventory}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
      ) : (
        <EmptyInventoryState onAddProducts={onAddProducts} />
      )}
    </>
  );
};
