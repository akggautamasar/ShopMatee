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

interface MinimalistTemplateProps {
  invoiceData?: InvoiceData;
}

const MinimalistTemplate = ({ invoiceData }: MinimalistTemplateProps) => {
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
    <div className="bg-white p-8 text-xs max-w-md mx-auto font-light">
      <div className="text-center mb-8">
        <h1 className="text-xl font-light tracking-wide text-gray-800">{data.company_name}</h1>
        <p className="text-gray-500 text-xs mt-1">{data.company_address}</p>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-end border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-2xl font-light text-gray-800">Invoice</h2>
            <p className="text-gray-500 text-xs">#{data.invoice_number}</p>
          </div>
          <div className="text-right text-xs">
            <p>Date: {data.invoice_date ? format(data.invoice_date, 'dd.MM.yyyy') : ''}</p>
            {data.due_date && <p>Due: {format(data.due_date, 'dd.MM.yyyy')}</p>}
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <p className="text-xs text-gray-500 mb-2">BILL TO</p>
        <p className="font-medium text-gray-800">{data.customer_name}</p>
        {data.customer_address && <p className="text-xs text-gray-600 mt-1">{data.customer_address}</p>}
        {data.customer_email && <p className="text-xs text-gray-600">{data.customer_email}</p>}
        {data.customer_contact && <p className="text-xs text-gray-600">{data.customer_contact}</p>}
      </div>
      
      <div className="mb-8">
        {data.items?.map((item, index) => (
          <div key={index} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
            <div className="flex-1">
              <p className="font-medium text-gray-800">{item.item_description}</p>
              <p className="text-xs text-gray-500">{item.quantity} × ₹{item.rate}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">₹{((item.quantity || 0) * (item.rate || 0) * (1 + (item.tax_percentage || 0) / 100)).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-gray-500">Subtotal</span>
          <span>₹{data.subtotal?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs mb-4">
          <span className="text-gray-500">Tax</span>
          <span>₹{data.tax?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-light">
          <span>Total</span>
          <span>₹{data.total?.toFixed(2)}</span>
        </div>
      </div>

      {data.notes && (
        <div className="mt-8 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">NOTES</p>
          <p className="text-xs text-gray-600">{data.notes}</p>
        </div>
      )}

      {data.terms_and_conditions && (
        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-2">TERMS</p>
          <p className="text-xs text-gray-600">{data.terms_and_conditions}</p>
        </div>
      )}

      {(data.signature_url || data.stamp_url) && (
        <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between items-end">
          {data.signature_url ? (
            <div className="text-center">
              <img src={data.signature_url} alt="Signature" className="h-16 mx-auto" />
              <p className="border-t border-gray-200 mt-2 pt-1 text-xs text-gray-500">Authorized Signature</p>
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
  );
};

export default MinimalistTemplate;
