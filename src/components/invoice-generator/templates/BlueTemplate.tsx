
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

interface BlueTemplateProps {
  invoiceData?: InvoiceData;
}

const BlueTemplate = ({ invoiceData }: BlueTemplateProps) => {
  // Default data for preview mode
  const defaultData = {
    customer_name: 'Samira Hadid',
    invoice_date: new Date(),
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    items: [
      { item_description: 'Airplane Tickets', quantity: 1, rate: 500, tax_percentage: 0 },
      { item_description: 'Accommodation', quantity: 1, rate: 200, tax_percentage: 0 },
      { item_description: 'Local Transportation', quantity: 1, rate: 100, tax_percentage: 0 }
    ],
    subtotal: 800,
    tax: 0,
    total: 800,
    invoice_number: 'INV202402',
    company_name: 'Fauget Company',
    company_address: '123 Anywhere St., Any City',
    customer_email: 'samira@example.com',
    customer_contact: '+123-456-7890',
    customer_address: '123 Anywhere St., Any City',
    notes: 'Thank you for your cooperation! Please complete the payment before the due date.',
    terms_and_conditions: 'Payment due within 30 days.',
    signature_url: 'https://placehold.co/200x80?text=Signature',
    stamp_url: 'https://placehold.co/100x100?text=Stamp',
  };

  const data = invoiceData || defaultData;

  return (
    <div className="bg-white text-xs max-w-md mx-auto relative overflow-hidden">
      {/* Blue geometric background */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700 transform -skew-y-3 origin-top-left"></div>
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-300 to-blue-600 transform rotate-45 translate-x-12 -translate-y-12"></div>
      
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">Invoice</h1>
          <p className="text-blue-600">Invoice Num: {data.invoice_number}</p>
        </div>

        {/* Company and Customer Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="font-semibold text-blue-700 mb-2">Submitted By</h3>
            <p className="text-blue-600">: {data.company_name}</p>
            <p className="text-blue-600">Bank : Fauget Bank</p>
            <p className="text-blue-600">Account No. : 123-456-7890</p>
            <p className="text-blue-600">Address : {data.company_address}</p>
          </div>
          <div className="text-right">
            <h3 className="font-semibold text-blue-700 mb-2">Business trip to</h3>
            <p className="text-blue-600">City A and City B</p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-6">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="text-left py-2 px-3 text-xs">Num</th>
              <th className="text-left py-2 px-3 text-xs">Item name</th>
              <th className="text-center py-2 px-3 text-xs">Qty</th>
              <th className="text-right py-2 px-3 text-xs">Price</th>
              <th className="text-right py-2 px-3 text-xs">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.items?.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
                <td className="py-2 px-3">{index + 1}</td>
                <td className="py-2 px-3">{item.item_description}</td>
                <td className="text-center py-2 px-3">{item.quantity}</td>
                <td className="text-right py-2 px-3">₹{item.rate}</td>
                <td className="text-right py-2 px-3">₹{(item.quantity * item.rate).toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total */}
        <div className="bg-blue-600 text-white p-3 text-center mb-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold">Total</span>
            <span className="text-lg font-bold">₹{data.total}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="grid grid-cols-2 gap-6 text-xs">
          <div>
            <h4 className="font-semibold text-blue-700 mb-2">Thank you</h4>
            <p className="text-blue-600">{data.company_name}</p>
            <p className="text-blue-600">{data.customer_contact}</p>
            <p className="text-blue-600">{data.company_address}</p>
            <p className="text-blue-600">hello@reallygreatsite.com</p>
          </div>
          <div>
            <h4 className="font-semibold text-blue-700 mb-2">Payment Method</h4>
            <p className="text-blue-600">Name : {data.customer_name}</p>
            <p className="text-blue-600">Bank : Fauget Bank</p>
            <p className="text-blue-600">Account : 123-456-7890</p>
            <p className="text-blue-600">Due Date : {data.due_date ? format(data.due_date, 'MMMM dd, yyyy') : ''}</p>
          </div>
        </div>

        {data.notes && (
          <div className="mt-4 text-xs text-blue-600">
            <p>*{data.notes}</p>
          </div>
        )}

        {(data.signature_url || data.stamp_url) && (
          <div className="mt-8 pt-4 border-t border-blue-200 flex justify-between items-end">
            {data.signature_url ? (
              <div className="text-center">
                <img src={data.signature_url} alt="Signature" className="h-16 mx-auto" />
                <p className="border-t border-blue-200 mt-2 pt-1 text-xs text-blue-700">Authorized Signature</p>
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

      {/* Bottom geometric elements */}
      <div className="absolute bottom-0 right-0 w-32 h-20 bg-gradient-to-tl from-blue-600 to-blue-400 transform skew-x-12"></div>
    </div>
  );
};

export default BlueTemplate;
