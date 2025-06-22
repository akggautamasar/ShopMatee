
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const settingsSchema = z.object({
  company_name: z.string().min(1, 'Company name is required').max(100),
  company_address: z.string().max(255).optional().nullable(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const CompanySettingsForm = () => {
  const queryClient = useQueryClient();

  const getSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return null;
    }
    const { data, error } = await supabase
        .from('ig_user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

    if (error) {
        console.error("Error fetching settings:", error);
        throw new Error(error.message);
    }
    return data;
  };
  
  const { data: settings, isLoading } = useQuery({
      queryKey: ['ig_user_settings'],
      queryFn: getSettings,
  });

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      company_name: '',
      company_address: '',
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        company_name: settings.company_name || '',
        company_address: settings.company_address || '',
      });
    }
  }, [settings, form]);
  
  const upsertSettings = useMutation({
    mutationFn: async (values: SettingsFormValues) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("You must be logged in to save settings.");
          throw new Error("User not authenticated.");
        }

        const { data, error } = await supabase.from('ig_user_settings').upsert({
            user_id: user.id,
            company_name: values.company_name,
            company_address: values.company_address,
        }, { onConflict: 'user_id' }).select().single();

        if (error) throw error;
        return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ig_user_settings'] });
      toast.success("Company settings saved successfully.");
    },
    onError: (error: Error) => {
        toast.error(`Failed to save settings: ${error.message}`);
    }
  });

  const onSubmit = (values: SettingsFormValues) => {
    upsertSettings.mutate(values);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-32"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="company_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Company LLC" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="company_address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Address</FormLabel>
              <FormControl>
                <Input placeholder="123 Business Rd, City, State 12345" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={upsertSettings.isPending}>
          {upsertSettings.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
      </form>
    </Form>
  );
};

export default CompanySettingsForm;
