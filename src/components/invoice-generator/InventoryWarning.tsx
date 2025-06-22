
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface InventoryWarningProps {
  productName: string;
  availableStock: number;
  requestedQuantity: number;
  unitType: string;
}

export const InventoryWarning: React.FC<InventoryWarningProps> = ({
  productName,
  availableStock,
  requestedQuantity,
  unitType
}) => {
  if (availableStock >= requestedQuantity) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        Warning: {productName} has insufficient stock. Available: {availableStock} {unitType}, 
        Requested: {requestedQuantity} {unitType}. 
        The inventory will be reduced to 0 after this sale.
      </AlertDescription>
    </Alert>
  );
};
