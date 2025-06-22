import React from 'react';
import { format } from 'date-fns';

interface InvoiceData {
  customer_name?: string;
  invoice_date?: Date;
  due_date?: Date;
  items?: any[];
  subtotal?: number;
  tax?: number;
  total?: number;
  invoice_number?: string;
  notes?: string;
  terms_and_conditions?: string;
  company_name?: string;
  company_address?: string;
  customer_email?: string;
  customer_contact?: string;
  customer_address?: string;
  signature_url?: string;
  stamp_url?: string;
}

interface ModernTemplateProps {
  invoiceData?: InvoiceData;
}

const ModernTemplate = ({ invoiceData }: ModernTemplateProps) => {
  // Default data for preview mode
  const defaultData = {
    customer_name: 'John Doe',
    invoice_date: new Date(),
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    items: [
      { item_description: 'Sample Item', quantity: 1, rate: 100, tax_percentage: 10 }
    ],
    subtotal: 100,
    tax: 10,
    total: 110,
    invoice_number: 'INV-001',
    company_name: 'Your Company',
    company_address: '123 Business Rd, City, State 12345',
    customer_email: 'john@example.com',
    customer_contact: '+1 234 567 8900',
    customer_address: '456 Customer St, City, State 67890',
    notes: 'Thank you for your business!',
    terms_and_conditions: 'Payment due within 30 days.',
    signature_url: 'https://example.com/signature.png',
    stamp_url: 'https://example.com/stamp.png',
  };

  const data = invoiceData || defaultData;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm text-xs max-w-md mx-auto overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4">
        <h1 className="text-lg font-bold">{data.company_name}</h1>
        <p className="text-blue-100 text-xs">{data.company_address}</p>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-blue-800">INVOICE</h2>
            <p className="text-gray-600">#{data.invoice_number}</p>
          </div>
          <div className="text-right">
            <p className="text-xs">Date: {data.invoice_date ? format(data.invoice_date, 'dd/MM/yyyy') : ''}</p>
            {data.due_date && <p className="text-xs">Due: {format(data.due_date, 'dd/MM/yyyy')}</p>}
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded mb-4">
          <h3 className="font-semibold text-gray-800 mb-1">Bill To:</h3>
          <p className="font-medium">{data.customer_name}</p>
          {data.customer_address && <p className="text-xs text-gray-600">{data.customer_address}</p>}
          {data.customer_email && <p className="text-xs text-gray-600">{data.customer_email}</p>}
          {data.customer_contact && <p className="text-xs text-gray-600">{data.customer_contact}</p>}
        </div>
        
        <table className="w-full text-xs mb-4">
          <thead>
            <tr className="bg-blue-50 border-b border-blue-200">
              <th className="text-left py-2 px-2">Item</th>
              <th className="text-right py-2 px-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.items?.map((item, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-2 px-2">
                  <div className="font-medium">{item.item_description}</div>
                  <div className="text-gray-500">{item.quantity} × ₹{item.rate}</div>
                </td>
                <td className="text-right py-2 px-2">₹{((item.quantity || 0) * (item.rate || 0) * (1 + (item.tax_percentage || 0) / 100)).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="bg-blue-50 p-3 rounded">
          <div className="flex justify-between text-xs mb-1">
            <span>Subtotal:</span>
            <span>₹{data.subtotal?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs mb-2">
            <span>Tax:</span>
            <span>₹{data.tax?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-blue-800 border-t border-blue-200 pt-2">
            <span>Total:</span>
            <span>₹{data.total?.toFixed(2)}</span>
          </div>
        </div>

        {data.notes && (
          <div className="mt-4">
            <h4 className="font-semibold text-xs">Notes:</h4>
            <p className="text-xs text-gray-600">{data.notes}</p>
          </div>
        )}

        {data.terms_and_conditions && (
          <div className="mt-2">
            <h4 className="font-semibold text-xs">Terms:</h4>
            <p className="text-xs text-gray-600">{data.terms_and_conditions}</p>
          </div>
        )}

        {(data.signature_url || data.stamp_url) && (
          <div className="mt-8 pt-4 border-t flex justify-between items-end">
            {data.signature_url ? (
              <div className="text-center">
                <img src={data.signature_url} alt="Signature" className="h-16 mx-auto" />
                <p className="border-t mt-2 pt-1 text-xs text-gray-600">Authorized Signature</p>
              </div>
            ) : <div />}
            {data.stamp_url && (
              <div className="text-center">
                <img src={data.stamp_url} alt="Company Stamp" className="h-20 w-20 mx-auto object-contain" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernTemplate;
