
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

interface ConsultationTemplateProps {
  invoiceData?: InvoiceData;
}

const ConsultationTemplate = ({ invoiceData }: ConsultationTemplateProps) => {
  // Default data for preview mode
  const defaultData = {
    customer_name: 'Noah Schumacher',
    invoice_date: new Date(),
    due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    items: [
      { item_description: 'Digital marketing strategy', quantity: 12, rate: 150, tax_percentage: 8 },
      { item_description: 'SEO Audit and Recommendations', quantity: 1, rate: 500, tax_percentage: 8 },
      { item_description: 'Social Media Content Plan', quantity: 1, rate: 300, tax_percentage: 8 }
    ],
    subtotal: 2600,
    tax: 208,
    total: 2808,
    invoice_number: 'CONS-INV-2024-001',
    company_name: 'Aldenaire & Partners',
    company_address: '123 Business Rd, City, State 12345',
    customer_email: 'noah@example.com',
    customer_contact: '+1 234 567 8900',
    customer_address: '123 Anywhere St., Any City',
    notes: 'If you have any questions regarding this invoice, please contact us at hello@reallygreatsite.com',
    terms_and_conditions: 'Payment is due within 15 days from the invoice date. Please make the payment to the following account:',
    signature_url: 'https://placehold.co/200x80?text=Signature',
    stamp_url: 'https://placehold.co/100x100?text=Stamp',
  };

  const data = invoiceData || defaultData;

  return (
    <div className="bg-white text-xs max-w-md mx-auto border border-gray-200">
      {/* Header */}
      <div className="text-center py-6 border-b border-gray-300">
        <h1 className="text-3xl font-bold text-gray-800">INVOICE</h1>
      </div>

      {/* Invoice Info and Bill To */}
      <div className="grid grid-cols-2">
        <div className="bg-slate-700 text-white p-4">
          <h3 className="font-semibold mb-3">BILL TO:</h3>
          <p className="text-gray-200">{data.customer_name}</p>
          <p className="text-gray-200">{data.customer_address}</p>
        </div>
        <div className="p-4 bg-gray-50">
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800">INVOICE NUMBER</h4>
            <p className="text-gray-600">{data.invoice_number}</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">DATE</h4>
            <p className="text-gray-600">{data.invoice_date ? format(data.invoice_date, 'yyyy-MM-dd') : ''}</p>
          </div>
        </div>
      </div>

      {/* Service Details */}
      <div className="p-4 border-b border-gray-300">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">CONSULTATION SERVICE</h3>
            <p className="text-gray-600">Digital marketing strategy session and social media optimization.</p>
          </div>
          <div>
            <div className="mb-2">
              <h4 className="font-semibold text-gray-800">DATE OF SERVICE</h4>
              <p className="text-gray-600">September 1-3, 2024</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">CONSULTANT NAME</h4>
              <p className="text-gray-600">{data.company_name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="p-4">
        <table className="w-full mb-4">
          <thead>
            <tr className="border-b-2 border-gray-800">
              <th className="text-left py-2 text-xs font-bold">ITEMS</th>
              <th className="text-center py-2 text-xs font-bold">HRS/QTY</th>
              <th className="text-right py-2 text-xs font-bold">RATE</th>
              <th className="text-right py-2 text-xs font-bold">SUBTOTAL</th>
            </tr>
          </thead>
          <tbody>
            {data.items?.map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="py-2">{item.item_description}</td>
                <td className="text-center py-2">{item.quantity} {index === 0 ? 'hours' : ''}</td>
                <td className="text-right py-2">₹{item.rate}</td>
                <td className="text-right py-2">₹{(item.quantity * item.rate).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Additional Services */}
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 mb-2">ADDITIONAL SERVICES PROVIDED</h4>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>SEO Audit and Recommendations</span>
              <span>₹500</span>
            </div>
            <div className="flex justify-between">
              <span>Social Media Content Plan</span>
              <span>₹300</span>
            </div>
          </div>
        </div>

        {/* Totals */}
        <div className="border-t-2 border-gray-800 pt-4">
          <div className="flex justify-between py-1">
            <span className="font-medium">SUBTOTAL</span>
            <span>: ₹{data.subtotal?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="font-medium">TAX RATE (%)</span>
            <span>: 8%</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="font-medium">[TAX RATE]</span>
            <span>: ₹{data.tax}</span>
          </div>
          <div className="flex justify-between py-2 font-bold text-base">
            <span>TOTAL AMOUNT DUE</span>
            <span>: ₹{data.total?.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Payment Terms */}
      <div className="bg-slate-700 text-white p-4">
        <h4 className="font-semibold mb-2">PAYMENT TERMS</h4>
        <p className="text-gray-200 text-xs mb-3">{data.terms_and_conditions}</p>
        
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p><span className="font-medium">BANK NAME</span> : Borcelle</p>
            <p><span className="font-medium">ACCOUNT NUMBER</span> : 123456789</p>
            <p><span className="font-medium">SWIFT/BIC CODE</span> : GREAT1234</p>
          </div>
        </div>
      </div>

      {/* Notes */}
      {data.notes && (
        <div className="p-4 border-t border-gray-300">
          <h4 className="font-semibold text-gray-800 mb-2">NOTES</h4>
          <p className="text-gray-600">{data.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="bg-slate-700 text-white text-center py-4">
        <p className="font-semibold">THANK YOU FOR CHOOSING OUR CONSULTATION SERVICES!</p>
      </div>

      {(data.signature_url || data.stamp_url) && (
        <div className="p-4 flex justify-between items-end">
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

export default ConsultationTemplate;
