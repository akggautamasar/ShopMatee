
ALTER TABLE public.ig_user_settings ADD COLUMN IF NOT EXISTS signature_url TEXT;
ALTER TABLE public.ig_user_settings ADD COLUMN IF NOT EXISTS stamp_url TEXT;
