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

interface ProfessionalTemplateProps {
  invoiceData?: InvoiceData;
}

const ProfessionalTemplate = ({ invoiceData }: ProfessionalTemplateProps) => {
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
    <div className="bg-white p-6 border-2 border-gray-300 text-xs max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-gray-800">{data.company_name}</h1>
          <p className="text-gray-600 text-xs">{data.company_address}</p>
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
          <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
        </div>
      </div>
      
      <div className="border-t-2 border-gray-400 pt-4 mb-4">
        <div className="flex justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800">INVOICE</h2>
            <p className="text-gray-600">#{data.invoice_number}</p>
          </div>
          <div className="text-right">
            <p className="text-xs">Issue Date: {data.invoice_date ? format(data.invoice_date, 'dd/MM/yyyy') : ''}</p>
            {data.due_date && <p className="text-xs">Due Date: {format(data.due_date, 'dd/MM/yyyy')}</p>}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">From:</h3>
          <p className="font-medium">{data.company_name}</p>
          <p className="text-xs text-gray-600">{data.company_address}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">To:</h3>
          <p className="font-medium">{data.customer_name}</p>
          {data.customer_address && <p className="text-xs text-gray-600">{data.customer_address}</p>}
          {data.customer_email && <p className="text-xs text-gray-600">{data.customer_email}</p>}
          {data.customer_contact && <p className="text-xs text-gray-600">{data.customer_contact}</p>}
        </div>
      </div>
      
      <table className="w-full text-xs mb-4 border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left py-2 px-2 border border-gray-300">Description</th>
            <th className="text-right py-2 px-2 border border-gray-300">Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.items?.map((item, index) => (
            <tr key={index}>
              <td className="py-2 px-2 border border-gray-300">
                <div className="font-medium">{item.item_description}</div>
                <div className="text-gray-500">{item.quantity} × ₹{item.rate}</div>
              </td>
              <td className="text-right py-2 px-2 border border-gray-300">₹{((item.quantity || 0) * (item.rate || 0) * (1 + (item.tax_percentage || 0) / 100)).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="flex justify-end">
        <div className="w-48">
          <div className="flex justify-between text-xs py-1">
            <span>Subtotal:</span>
            <span>₹{data.subtotal?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs py-1">
            <span>Tax:</span>
            <span>₹{data.tax?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-sm border-t-2 border-gray-400 pt-2 mt-2">
            <span>Total:</span>
            <span>₹{data.total?.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {data.notes && (
        <div className="mt-4 border-t pt-2">
          <h4 className="font-semibold text-xs">Notes:</h4>
          <p className="text-xs text-gray-600">{data.notes}</p>
        </div>
      )}

      {data.terms_and_conditions && (
        <div className="mt-2">
          <h4 className="font-semibold text-xs">Terms & Conditions:</h4>
          <p className="text-xs text-gray-600">{data.terms_and_conditions}</p>
        </div>
      )}

      {(data.signature_url || data.stamp_url) && (
        <div className="mt-8 pt-4 border-t-2 border-gray-400 flex justify-between items-end">
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
  );
};

export default ProfessionalTemplate;
