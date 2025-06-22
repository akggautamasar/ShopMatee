
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

interface GreenTemplateProps {
  invoiceData?: InvoiceData;
}

const GreenTemplate = ({ invoiceData }: GreenTemplateProps) => {
  // Default data for preview mode
  const defaultData = {
    customer_name: 'Studio Shodwe Architecture',
    invoice_date: new Date(),
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    items: [
      { item_description: 'Lorem Ipsum Dolar', quantity: 1, rate: 5000, tax_percentage: 6 },
      { item_description: 'Lorem Ipsum Dolar emit', quantity: 1, rate: 7500, tax_percentage: 6 },
      { item_description: 'Lorem Ipsum Dolar', quantity: 1, rate: 10000, tax_percentage: 6 },
      { item_description: 'Lorem Ipsum Dolar emit', quantity: 1, rate: 15000, tax_percentage: 6 },
      { item_description: 'Lorem Ipsum Dolar', quantity: 1, rate: 5000, tax_percentage: 6 },
      { item_description: 'Lorem Ipsum Dolar emit', quantity: 1, rate: 10000, tax_percentage: 6 }
    ],
    subtotal: 52500,
    tax: 3150,
    total: 55650,
    invoice_number: 'INV-01234',
    company_name: 'Your Company',
    company_address: '123 Business Rd, City, State 12345',
    customer_email: 'studio@example.com',
    customer_contact: '+1 234 567 8900',
    customer_address: '123 Anywhere St., Any City, ST 12345',
    notes: 'Thank you for your business!',
    terms_and_conditions: 'Payment is due 30 days from the invoice date.',
    signature_url: 'https://placehold.co/200x80?text=Signature',
    stamp_url: 'https://placehold.co/100x100?text=Stamp',
  };

  const data = invoiceData || defaultData;

  return (
    <div className="bg-white text-xs max-w-md mx-auto relative overflow-hidden">
      {/* Green geometric background */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-green-300 via-green-400 to-green-500 transform -skew-y-2"></div>
      <div className="absolute top-0 right-0 w-20 h-20 bg-green-200 rounded-full transform translate-x-10 -translate-y-10"></div>
      
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="text-right mb-8">
          <h1 className="text-3xl font-bold text-green-600 mb-2">INVOICE</h1>
          <p className="text-gray-700">Invoice Number: {data.invoice_number}</p>
          <p className="text-gray-700">Date: {data.invoice_date ? format(data.invoice_date, 'MMMM dd, yyyy') : ''}</p>
        </div>

        {/* Bill To and Payment Info */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">BILL TO:</h3>
            <p className="font-medium">{data.customer_name}</p>
            <p className="text-gray-600">{data.customer_address?.split(',')[0]},</p>
            <p className="text-gray-600">{data.customer_address?.split(',').slice(1).join(',')}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">PAYMENT INFORMATION:</h3>
            <p><span className="font-medium">Bank:</span> Warner & Spencer</p>
            <p><span className="font-medium">Name:</span> Morgan Maxwell</p>
            <p><span className="font-medium">Account:</span> 0123 4567 8901</p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-6">
          <thead>
            <tr className="bg-green-500 text-white">
              <th className="text-left py-3 px-3 text-xs font-bold">ITEM</th>
              <th className="text-left py-3 px-3 text-xs font-bold">DESCRIPTION</th>
              <th className="text-right py-3 px-3 text-xs font-bold">RATE</th>
              <th className="text-right py-3 px-3 text-xs font-bold">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {data.items?.map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="py-2 px-3">{index + 1}.</td>
                <td className="py-2 px-3">{item.item_description}</td>
                <td className="text-right py-2 px-3">₹{item.rate?.toLocaleString()}</td>
                <td className="text-right py-2 px-3">₹{item.rate?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div className="w-48 border border-gray-300">
            <div className="flex justify-between py-2 px-4 border-b border-gray-300">
              <span>Sub Total:</span>
              <span>₹{data.subtotal?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 px-4 border-b border-gray-300">
              <span>Sales Tax:</span>
              <span>₹{data.tax?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-3 px-4 bg-green-500 text-white font-bold">
              <span>TOTAL:</span>
              <span>₹{data.total?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        {data.terms_and_conditions && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">TERM AND CONDITIONS:</h4>
            <p className="text-gray-600">{data.terms_and_conditions}</p>
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

      {/* Bottom green elements */}
      <div className="absolute bottom-0 right-0 w-24 h-16 bg-gradient-to-tl from-green-500 to-green-300 transform skew-x-6"></div>
    </div>
  );
};

export default GreenTemplate;
