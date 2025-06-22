
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'ig_products'>;
type Inventory = Tables<'ig_inventory'>;

interface InventoryWithProduct extends Inventory {
  product: Product;
}

interface LowStockAlertProps {
  lowStockItems: InventoryWithProduct[];
}

export const LowStockAlert: React.FC<LowStockAlertProps> = ({ lowStockItems }) => {
  if (lowStockItems.length === 0) return null;

  return (
    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-center gap-2 text-yellow-800 font-medium mb-2">
        <AlertTriangle className="h-4 w-4" />
        Low Stock Alert
      </div>
      <div className="text-sm text-yellow-700">
        {lowStockItems.length} item(s) are running low on stock:
        <ul className="mt-1 ml-4">
          {lowStockItems.map(item => (
            <li key={item.id}>
              {item.product.name}: {item.quantity_on_hand || 0} {item.product.unit_type} remaining
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
