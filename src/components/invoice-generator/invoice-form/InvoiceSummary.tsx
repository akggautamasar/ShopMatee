
import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import type { InvoiceFormData } from '../schema';

interface InvoiceSummaryProps {
  register: UseFormRegister<InvoiceFormData>;
  totals: {
    subtotal: number;
    tax: number;
    grandTotal: number;
  };
}

const InvoiceSummary = ({ register, totals }: InvoiceSummaryProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <Textarea {...register('notes')} placeholder="Any extra notes for the customer..." />
        <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">Terms & Conditions</label>
        <Textarea {...register('terms_and_conditions')} placeholder="Your terms of service..." />
      </div>
      <div className="space-y-2 rounded-lg bg-gray-50 p-4">
        <div className="flex justify-between"><span>Subtotal</span> <span>₹{totals.subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Total Tax</span> <span>₹{totals.tax.toFixed(2)}</span></div>
        <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span>Grand Total</span> <span>₹{totals.grandTotal.toFixed(2)}</span></div>
      </div>
    </div>
  );
};

export default InvoiceSummary;
