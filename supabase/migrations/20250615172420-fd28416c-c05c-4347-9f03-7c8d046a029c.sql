
-- Add a nullable signature_url column to transactions to store signature image links
ALTER TABLE public.transactions
ADD COLUMN signature_url TEXT NULL;
