
-- Step 1: Add photo_url columns
ALTER TABLE staff ADD COLUMN IF NOT EXISTS photo_url TEXT;

ALTER TABLE teachers ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Step 2: Create a public storage bucket for staff and teacher photos (if not exists)
insert into storage.buckets (id, name, public) 
  values ('staff-photos', 'staff-photos', true)
on conflict (id) do nothing;

-- Step 3: Grant public read access (optional: edit for tighter security later)
-- Policy: allow all select/read operations on staff-photos
-- Note: by default, making bucket public is enough, but fine-tuning policies in storage.objects may be needed for stricter control
