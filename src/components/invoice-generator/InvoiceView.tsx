import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertTriangle, Printer, Download } from 'lucide-react';
import { format } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { generateInvoicePDF } from '@/utils/exportUtils';
import { useTemplate } from '@/context/TemplateContext';
import ClassicTemplate from './templates/ClassicTemplate';
import ModernTemplate from './templates/ModernTemplate';
import ProfessionalTemplate from './templates/ProfessionalTemplate';
import MinimalistTemplate from './templates/MinimalistTemplate';
import BlueTemplate from './templates/BlueTemplate';
import GreenTemplate from './templates/GreenTemplate';
import ConsultationTemplate from './templates/ConsultationTemplate';
import CorporateTemplate from './templates/CorporateTemplate';

type InvoiceDetails = Tables<'ig_invoices'> & {
  ig_customers: Tables<'ig_customers'> | null;
  ig_invoice_items: Tables<'ig_invoice_items'>[];
};

type UserSettings = Tables<'ig_user_settings'> & {
  signature_url?: string;
  stamp_url?: string;
};

interface InvoiceViewProps {
  invoiceId: string;
}

const InvoiceView = ({ invoiceId }: InvoiceViewProps) => {
  const { selectedTemplate } = useTemplate();

  const { data: invoice, isLoading: isLoadingInvoice, error: invoiceError } = useQuery<InvoiceDetails | null, Error>({
    queryKey: ['ig_invoice', invoiceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ig_invoices')
        .select('*, ig_customers(*), ig_invoice_items(*)')
        .eq('id', invoiceId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(error.message);
      }
      return data as InvoiceDetails;
    },
  });

  const { data: userSettings, isLoading: isLoadingSettings, error: settingsError } = useQuery<UserSettings | null, Error>({
    queryKey: ['ig_user_settings', invoice?.user_id],
    queryFn: async () => {
      if (!invoice?.user_id) return null;

      const { data, error } = await supabase
        .from('ig_user_settings')
        .select('*')
        .eq('user_id', invoice.user_id)
        .maybeSingle();
      
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    enabled: !!invoice?.user_id,
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (invoice) {
      await generateInvoicePDF(invoice);
    }
  };

  const getTemplateComponent = () => {
    if (!invoice) return null;

    const invoiceData = {
      customer_name: invoice.ig_customers?.name,
      invoice_date: new Date(invoice.invoice_date),
      due_date: invoice.due_date ? new Date(invoice.due_date) : undefined,
      items: invoice.ig_invoice_items,
      subtotal: invoice.subtotal,
      tax: invoice.total_tax_amount,
      total: invoice.grand_total,
      invoice_number: invoice.invoice_number,
      notes: invoice.notes,
      terms_and_conditions: invoice.terms_and_conditions,
      company_name: userSettings?.company_name,
      company_address: userSettings?.company_address,
      customer_email: invoice.ig_customers?.email,
      customer_contact: invoice.ig_customers?.contact_number,
      customer_address: invoice.ig_customers?.billing_address,
      signature_url: userSettings?.signature_url,
      stamp_url: userSettings?.stamp_url,
    };

    switch (selectedTemplate) {
      case 'modern':
        return <ModernTemplate invoiceData={invoiceData} />;
      case 'professional':
        return <ProfessionalTemplate invoiceData={invoiceData} />;
      case 'minimalist':
        return <MinimalistTemplate invoiceData={invoiceData} />;
      case 'blue':
        return <BlueTemplate invoiceData={invoiceData} />;
      case 'green':
        return <GreenTemplate invoiceData={invoiceData} />;
      case 'consultation':
        return <ConsultationTemplate invoiceData={invoiceData} />;
      case 'corporate':
        return <CorporateTemplate invoiceData={invoiceData} />;
      case 'classic':
      default:
        return <ClassicTemplate invoiceData={invoiceData} />;
    }
  };

  const isLoading = isLoadingInvoice || isLoadingSettings;
  const error = invoiceError || settingsError;

  if (isLoading) return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error) return <div className="flex flex-col items-center justify-center p-8 bg-red-50 text-red-700 rounded-lg"><AlertTriangle className="h-8 w-8 mb-2" /><p>{error.message}</p></div>;
  if (!invoice) return <div className="text-center p-8">Invoice not found.</div>;

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg max-h-[80vh] overflow-y-auto">
      {getTemplateComponent()}

      <div className="mt-8 pt-6 border-t flex justify-end gap-2 print:hidden">
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
        <Button onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>
    </div>
  );
};

export default InvoiceView;
