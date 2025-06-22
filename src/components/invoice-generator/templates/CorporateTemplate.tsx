
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

interface CorporateTemplateProps {
  invoiceData?: InvoiceData;
}

const CorporateTemplate = ({ invoiceData }: CorporateTemplateProps) => {
  // Default data for preview mode
  const defaultData = {
    customer_name: 'Hannah Morales',
    invoice_date: new Date(),
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    items: [
      { item_description: 'Brand Consultation', quantity: 1, rate: 100, tax_percentage: 10 },
      { item_description: 'Logo Design', quantity: 1, rate: 100, tax_percentage: 10 },
      { item_description: 'Website Design', quantity: 1, rate: 100, tax_percentage: 10 },
      { item_description: 'Social Media Template', quantity: 1, rate: 100, tax_percentage: 10 },
      { item_description: 'Flyer', quantity: 6, rate: 50, tax_percentage: 10 }
    ],
    subtotal: 700,
    tax: 70,
    total: 750,
    invoice_number: '#123456',
    company_name: 'Salford & Co.',
    company_address: '123 Anywhere St., Any City, ST 12345',
    customer_email: 'hannah@example.com',
    customer_contact: '+123-456-7890',
    customer_address: 'Managing Director, Salford & Co.',
    notes: 'Thank you for your business',
    terms_and_conditions: 'Please send payment within 30 days of receiving this invoice. There will be a 10% interest charge per month on late invoice.',
    signature_url: 'https://placehold.co/200x80?text=Signature',
    stamp_url: 'https://placehold.co/100x100?text=Stamp',
  };

  const data = invoiceData || defaultData;

  return (
    <div className="bg-slate-800 text-white text-xs max-w-md mx-auto relative overflow-hidden">
      {/* Header with logo and title */}
      <div className="bg-slate-800 p-6 relative">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className="w-8 h-8 mr-3">
              {/* Logo placeholder - golden triangle */}
              <div className="relative">
                <div className="w-0 h-0 border-l-4 border-r-4 border-b-6 border-l-transparent border-r-transparent border-b-yellow-400"></div>
                <div className="absolute top-2 left-1 w-0 h-0 border-l-2 border-r-2 border-b-3 border-l-transparent border-r-transparent border-b-yellow-400"></div>
              </div>
            </div>
            <div>
              <h2 className="text-white font-bold">{data.company_name}</h2>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-yellow-400 mb-2">INVOICE</h1>
            <div className="text-sm">
              <p>Invoice No: {data.invoice_number}</p>
              <p>Due Date: {data.due_date ? format(data.due_date, 'dd MMMM, yyyy') : ''}</p>
              <p>Invoice Date: {data.invoice_date ? format(data.invoice_date, 'dd MMMM, yyyy') : ''}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Address Bar */}
      <div className="bg-yellow-400 text-black p-3 flex items-center">
        <div className="w-4 h-4 bg-slate-800 rounded-full mr-2"></div>
        <span className="font-medium">{data.customer_address}</span>
      </div>

      {/* Contact and Payment Info */}
      <div className="grid grid-cols-2 gap-6 p-6">
        <div>
          <div className="mb-4">
            <p><span className="font-medium">Phone:</span> {data.customer_contact}</p>
            <p><span className="font-medium">Email:</span> hello@reallygreatsite.com</p>
            <p><span className="font-medium">Address:</span> {data.company_address}</p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">PAYMENT METHOD</h3>
          <p><span className="font-medium">Account No:</span> 123-456-7890</p>
          <p><span className="font-medium">Account Name:</span> {data.customer_name}</p>
          <p><span className="font-medium">Branch Name:</span> {data.company_name}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="px-6 mb-6">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-700">
              <th className="text-left py-3 px-3 text-xs font-bold">DESCRIPTION</th>
              <th className="text-center py-3 px-3 text-xs font-bold">QTY</th>
              <th className="text-right py-3 px-3 text-xs font-bold">SUBTOTAL</th>
            </tr>
          </thead>
          <tbody>
            {data.items?.map((item, index) => (
              <tr key={index} className="border-b border-slate-600">
                <td className="py-2 px-3">{item.item_description}</td>
                <td className="text-center py-2 px-3">{item.quantity}</td>
                <td className="text-right py-2 px-3">₹{(item.quantity * item.rate).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Terms and Totals */}
      <div className="grid grid-cols-2 gap-6 px-6 mb-6">
        <div>
          <h3 className="font-semibold mb-2">TERM AND CONDITIONS</h3>
          <p className="text-xs text-gray-300">{data.terms_and_conditions}</p>
          
          <div className="mt-4">
            <h3 className="font-semibold mb-2">THANK YOU FOR YOUR BUSINESS</h3>
            <div className="space-y-1 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-400 rounded mr-2"></div>
                <span>{data.customer_contact}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-400 rounded mr-2"></div>
                <span>www.reallygreatsite.com</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-400 rounded mr-2"></div>
                <span>{data.company_address}</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Sub-total:</span>
              <span>₹{data.subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount:</span>
              <span>₹0.00</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (10%):</span>
              <span>₹{data.tax?.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="bg-slate-700 p-3">
            <div className="flex justify-between items-center">
              <span className="font-bold">Total:</span>
              <span className="text-lg font-bold">₹{data.total?.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-4 text-right">
            <div className="border-t border-gray-400 pt-2 mt-8">
              <p className="font-medium">Marceline Anderson</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>

            {(data.signature_url || data.stamp_url) && (
              <div className="mt-8 pt-4 flex justify-between items-end">
                {data.signature_url ? (
                  <div className="text-center w-full">
                    <img src={data.signature_url} alt="Signature" className="h-16 mx-auto" />
                    <p className="text-xs text-gray-400 mt-1">Authorized Signature</p>
                  </div>
                ) : <div />}
                {data.stamp_url && (
                  <div className="text-center w-full">
                    <img src={data.stamp_url} alt="Company Stamp" className="h-20 w-20 mx-auto object-contain" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom accent */}
      <div className="bg-yellow-400 h-4"></div>
      <div className="bg-slate-700 h-8 relative">
        <div className="absolute bottom-0 right-0 w-16 h-8 bg-yellow-400 transform skew-x-12"></div>
      </div>
    </div>
  );
};

export default CorporateTemplate;
