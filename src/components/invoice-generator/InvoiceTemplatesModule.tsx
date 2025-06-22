import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTemplate } from '@/context/TemplateContext';
import CompanySettingsForm from './CompanySettingsForm';
import ClassicTemplate from './templates/ClassicTemplate';
import ModernTemplate from './templates/ModernTemplate';
import ProfessionalTemplate from './templates/ProfessionalTemplate';
import MinimalistTemplate from './templates/MinimalistTemplate';
import BlueTemplate from './templates/BlueTemplate';
import GreenTemplate from './templates/GreenTemplate';
import ConsultationTemplate from './templates/ConsultationTemplate';
import CorporateTemplate from './templates/CorporateTemplate';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type UserSettings = {
  user_id: string;
  signature_url?: string | null;
  stamp_url?: string | null;
  [key: string]: any;
};

const BrandingSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState<'signature' | 'stamp' | null>(null);

  const { data: settings, isLoading } = useQuery<UserSettings | null>({
    queryKey: ['ig_user_settings', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase.from('ig_user_settings').select('*').eq('user_id', user.id).single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updateData: { signature_url?: string; stamp_url?: string }) => {
      if (!user) throw new Error('User not found');
      const { data, error } = await supabase.from('ig_user_settings').upsert({ user_id: user.id, ...settings, ...updateData }, { onConflict: 'user_id' }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Branding settings updated!');
      queryClient.invalidateQueries({ queryKey: ['ig_user_settings', user?.id] });
    },
    onError: (error: Error) => {
      toast.error('Failed to update settings', { description: error.message });
    },
    onSettled: () => {
      setUploading(null);
    }
  });

  const handleFileUpload = async (file: File, type: 'signature' | 'stamp') => {
    if (!user) return;
    setUploading(type);
    const filePath = `${user.id}/${type}-${Date.now()}`;
    const { error: uploadError } = await supabase.storage.from('branding-assets').upload(filePath, file);
    if (uploadError) {
      toast.error('Upload failed', { description: uploadError.message });
      setUploading(null);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('branding-assets').getPublicUrl(filePath);
    
    if (type === 'signature') {
      updateSettingsMutation.mutate({ signature_url: publicUrl });
    } else {
      updateSettingsMutation.mutate({ stamp_url: publicUrl });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-32"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 p-4 border rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div>
          <Label htmlFor="signature-upload">Signature</Label>
          <Input id="signature-upload" type="file" accept="image/*" className="mt-2"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'signature')}
            disabled={uploading === 'signature'}
          />
          {uploading === 'signature' && <div className="flex items-center mt-2 text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</div>}
        </div>
        {settings?.signature_url && (
          <div className="p-2 border rounded-md bg-gray-50">
            <img src={settings.signature_url} alt="Signature preview" className="max-h-24 mx-auto"/>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div>
          <Label htmlFor="stamp-upload">Company Stamp</Label>
          <Input id="stamp-upload" type="file" accept="image/*" className="mt-2"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'stamp')}
            disabled={uploading === 'stamp'}
          />
          {uploading === 'stamp' && <div className="flex items-center mt-2 text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</div>}
        </div>
        {settings?.stamp_url && (
          <div className="p-2 border rounded-md bg-gray-50">
            <img src={settings.stamp_url} alt="Stamp preview" className="max-h-24 mx-auto"/>
          </div>
        )}
      </div>
    </div>
  );
};

const InvoiceTemplatesModule = () => {
  const { selectedTemplate, setSelectedTemplate } = useTemplate();

  const templates = [
    {
      id: 'classic',
      name: 'Classic',
      description: 'A traditional design with geometric elements and clean layout.',
      preview: <ClassicTemplate />,
    },
    {
      id: 'modern',
      name: 'Modern',
      description: 'A sleek design with blue gradient header and contemporary styling.',
      preview: <ModernTemplate />,
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'A clean medical/lab report style with professional branding.',
      preview: <ProfessionalTemplate />,
    },
    {
      id: 'minimalist',
      name: 'Minimalist',
      description: 'A clean, elegant design with minimal elements and sophisticated typography.',
      preview: <MinimalistTemplate />,
    },
    {
      id: 'blue',
      name: 'Blue Business',
      description: 'Professional blue design with geometric elements and travel-themed layout.',
      preview: <BlueTemplate />,
    },
    {
      id: 'green',
      name: 'Green Modern',
      description: 'Fresh green design with clean lines and professional appearance.',
      preview: <GreenTemplate />,
    },
    {
      id: 'consultation',
      name: 'Consultation',
      description: 'Professional consultation invoice with detailed service breakdown.',
      preview: <ConsultationTemplate />,
    },
    {
      id: 'corporate',
      name: 'Corporate',
      description: 'Elegant corporate design with golden accents and dark theme.',
      preview: <CorporateTemplate />,
    },
  ];

  const handleTemplateSelect = (templateId: string, templateName: string) => {
    setSelectedTemplate(templateId);
    toast.success(`${templateName} template selected successfully!`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Templates & Branding</CardTitle>
        <CardDescription>Choose a template and customize your invoices.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {template.name}
                  {selectedTemplate === template.id && (
                    <Check className="h-5 w-5 text-green-600" />
                  )}
                </CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex items-center justify-center bg-gray-50 border-2 border-dashed rounded-md p-4">
                {template.preview}
              </CardContent>
              <div className="p-4 border-t">
                <Button 
                  className="w-full" 
                  variant={selectedTemplate === template.id ? "default" : "outline"}
                  onClick={() => handleTemplateSelect(template.id, template.name)}
                >
                  {selectedTemplate === template.id ? "Selected" : "Select Template"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-8">
            <h3 className="text-lg font-semibold">Company Details</h3>
            <p className="text-muted-foreground text-sm mb-4">This information will be displayed on your invoices.</p>
            <div className="p-4 border rounded-lg">
              <CompanySettingsForm />
            </div>
        </div>
        <div className="mt-8">
            <h3 className="text-lg font-semibold">Branding</h3>
            <p className="text-muted-foreground text-sm mb-4">Upload your signature and company stamp.</p>
            <BrandingSettings />
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceTemplatesModule;
