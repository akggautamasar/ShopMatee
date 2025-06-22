
import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'ig_products'>;
type Inventory = Tables<'ig_inventory'>;

interface InventoryWithProduct extends Inventory {
  product: Product;
}

interface InventoryTableProps {
  inventory: InventoryWithProduct[];
  onEdit: (item: InventoryWithProduct) => void;
  onDelete: (inventoryId: string) => void;
  isDeleting: boolean;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  inventory,
  onEdit,
  onDelete,
  isDeleting
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Current Stock</TableHead>
          <TableHead>Low Stock Alert</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Stocked</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {inventory.map((item) => {
          const isLowStock = (item.quantity_on_hand || 0) <= (item.low_stock_threshold || 0);
          return (
            <TableRow key={item.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{item.product.name}</div>
                  <div className="text-sm text-muted-foreground">{item.product.unit_type}</div>
                </div>
              </TableCell>
              <TableCell>
                <span className={isLowStock ? 'text-red-600 font-medium' : ''}>
                  {item.quantity_on_hand || 0} {item.product.unit_type}
                </span>
              </TableCell>
              <TableCell>{item.low_stock_threshold || 0} {item.product.unit_type}</TableCell>
              <TableCell>
                {isLowStock ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                    Low Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    In Stock
                  </span>
                )}
              </TableCell>
              <TableCell>
                {item.last_stocked_at 
                  ? new Date(item.last_stocked_at).toLocaleDateString()
                  : 'Never'
                }
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(item)}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Update
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove from Inventory</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove "{item.product.name}" from inventory? 
                          This will delete all stock tracking data for this product.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(item.id)}
                          className="bg-red-600 hover:bg-red-700"
                          disabled={isDeleting}
                        >
                          {isDeleting ? 'Removing...' : 'Remove'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
