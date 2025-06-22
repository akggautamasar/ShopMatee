
import React from 'react';
import { useTemplate } from '@/context/TemplateContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ClassicTemplate from './templates/ClassicTemplate';
import ModernTemplate from './templates/ModernTemplate';
import ProfessionalTemplate from './templates/ProfessionalTemplate';
import MinimalistTemplate from './templates/MinimalistTemplate';
import BlueTemplate from './templates/BlueTemplate';
import GreenTemplate from './templates/GreenTemplate';
import ConsultationTemplate from './templates/ConsultationTemplate';
import CorporateTemplate from './templates/CorporateTemplate';

interface InvoicePreviewProps {
  invoiceData?: {
    customer_name?: string;
    invoice_date?: Date;
    due_date?: Date;
    items?: any[];
    subtotal?: number;
    tax?: number;
    total?: number;
  };
}

const InvoicePreview = ({ invoiceData }: InvoicePreviewProps) => {
  const { selectedTemplate } = useTemplate();

  const getTemplateComponent = () => {
    switch (selectedTemplate) {
      case 'modern':
        return <ModernTemplate />;
      case 'professional':
        return <ProfessionalTemplate />;
      case 'minimalist':
        return <MinimalistTemplate />;
      case 'blue':
        return <BlueTemplate />;
      case 'green':
        return <GreenTemplate />;
      case 'consultation':
        return <ConsultationTemplate />;
      case 'corporate':
        return <CorporateTemplate />;
      case 'classic':
      default:
        return <ClassicTemplate />;
    }
  };

  const getTemplateName = () => {
    switch (selectedTemplate) {
      case 'modern':
        return 'Modern';
      case 'professional':
        return 'Professional';
      case 'minimalist':
        return 'Minimalist';
      case 'blue':
        return 'Blue Business';
      case 'green':
        return 'Green Modern';
      case 'consultation':
        return 'Consultation';
      case 'corporate':
        return 'Corporate';
      case 'classic':
      default:
        return 'Classic';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Preview ({getTemplateName()} Template)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed">
          {getTemplateComponent()}
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoicePreview;
