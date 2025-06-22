
import React from 'react';
import { UseFieldArrayReturn, Control, UseFormSetValue } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import type { InvoiceFormData } from '../schema';
import BulkAddProductsDialog from '../BulkAddProductsDialog';

type Product = Tables<'ig_products'>;

interface InvoiceItemsSectionProps {
  fields: UseFieldArrayReturn<InvoiceFormData, "items", "id">['fields'];
  append: UseFieldArrayReturn<InvoiceFormData, "items", "id">['append'];
  watchedItems: any[];
  products: Product[] | undefined;
  setEditingIndex: (index: number) => void;
  errors: any;
}

const InvoiceItemsSection = ({
  fields,
  append,
  watchedItems,
  products,
  setEditingIndex,
  errors,
}: InvoiceItemsSectionProps) => {
  const handleProductsSelected = (selectedProducts: Product[]) => {
    const newItems = selectedProducts.map(product => ({
      product_id: product.id,
      item_description: product.name,
      quantity: 1,
      unit_type: product.unit_type || '',
      rate: product.default_rate ?? 0,
      tax_percentage: product.tax_percentage ?? 0,
    }));
    append(newItems);
  };

  return (
    <>
      <div className="flex justify-between items-center">
         <h3 className="text-lg font-medium">Invoice Items</h3>
         <div className="flex items-center gap-2">
            <BulkAddProductsDialog products={products || []} onProductsSelected={handleProductsSelected}>
                <Button type="button" variant="outline" size="sm">
                    <PlusCircle className="mr-2 h-4 w-4"/>Bulk Add
                </Button>
            </BulkAddProductsDialog>
            <Button type="button" variant="outline" size="sm" onClick={() => append({ product_id: null, item_description: '', quantity: 1, unit_type: '', rate: 0, tax_percentage: 0 })}>
                <PlusCircle className="mr-2 h-4 w-4"/>Add Item
            </Button>
         </div>
      </div>

      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field, index) => {
              const item = watchedItems?.[index];
              if (!item) return null;
              
              const lineTotal = (item.quantity || 0) * (item.rate || 0) * (1 + (item.tax_percentage || 0) / 100);

              return (
                <TableRow key={field.id} onClick={() => setEditingIndex(index)} className="cursor-pointer">
                  <TableCell>
                    <p className="font-medium">{item.item_description || "New Item"}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity || 0} {item.unit_type || ''} &times; ₹{(item.rate || 0).toFixed(2)}
                    </p>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ₹{lineTotal.toFixed(2)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {errors.items && !errors.items.root && <p className="text-red-500 text-sm">{errors.items.message}</p>}
    </>
  );
};

export default InvoiceItemsSection;
