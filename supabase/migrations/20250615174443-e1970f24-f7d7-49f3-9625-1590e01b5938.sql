
-- Create the `signatures` storage bucket if it doesn't exist
insert into storage.buckets (id, name, public)
  values ('signatures', 'signatures', true)
on conflict (id) do nothing;

-- Allow anyone to read from signatures bucket (default for public:true)
-- Allow authenticated users to upload to signatures bucket
-- Grant insert/update/delete if user is authenticated

-- For radix v2: Matching "signatures" bucket
create policy "Authenticated users can upload files"
  on storage.objects
  for insert
  with check (bucket_id = 'signatures' AND auth.role() = 'authenticated');

create policy "Authenticated users can update their own files"
  on storage.objects
  for update
  using (bucket_id = 'signatures' AND auth.role() = 'authenticated' AND owner = auth.uid());

create policy "Authenticated users can delete their own files"
  on storage.objects
  for delete
  using (bucket_id = 'signatures' AND auth.role() = 'authenticated' AND owner = auth.uid());

-- Allow public (anyone) to select files (read)
create policy "Public can select signatures"
  on storage.objects
  for select
  using (bucket_id = 'signatures');
