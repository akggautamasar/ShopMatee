
-- Create a public storage bucket for branding assets if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('branding-assets', 'branding-assets', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Create policies for the branding-assets bucket to ensure proper access
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'public_read_for_branding_assets') THEN
    CREATE POLICY "public_read_for_branding_assets"
    ON storage.objects FOR SELECT TO public
    USING (bucket_id = 'branding-assets');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'auth_users_can_upload_branding_assets') THEN
    CREATE POLICY "auth_users_can_upload_branding_assets"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'branding-assets' AND auth.uid() IS NOT NULL);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'owners_can_update_branding_assets') THEN
    CREATE POLICY "owners_can_update_branding_assets"
    ON storage.objects FOR UPDATE TO authenticated
    USING (bucket_id = 'branding-assets' AND auth.uid() = owner);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'owners_can_delete_branding_assets') THEN
    CREATE POLICY "owners_can_delete_branding_assets"
    ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'branding-assets' AND auth.uid() = owner);
  END IF;
END;
$$;
