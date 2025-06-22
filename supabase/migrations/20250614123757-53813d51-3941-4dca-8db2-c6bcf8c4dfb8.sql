
-- Create a table to store company settings for each user
CREATE TABLE public.ig_user_settings (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL UNIQUE,
    company_name text,
    company_address text,
    company_logo_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT ig_user_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add comments to columns
COMMENT ON TABLE public.ig_user_settings IS 'Stores user-specific settings for the invoice generator, like company details.';
COMMENT ON COLUMN public.ig_user_settings.company_name IS 'The name of the user''s company.';
COMMENT ON COLUMN public.ig_user_settings.company_address IS 'The billing address of the user''s company.';
COMMENT ON COLUMN public.ig_user_settings.company_logo_url IS 'URL for the company''s logo.';

-- Enable Row Level Security
ALTER TABLE public.ig_user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view their own settings"
ON public.ig_user_settings
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
ON public.ig_user_settings
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
ON public.ig_user_settings
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings"
ON public.ig_user_settings
FOR DELETE USING (auth.uid() = user_id);

-- Function to update the 'updated_at' timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update 'updated_at' on modification
CREATE TRIGGER on_ig_user_settings_update
BEFORE UPDATE ON public.ig_user_settings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
