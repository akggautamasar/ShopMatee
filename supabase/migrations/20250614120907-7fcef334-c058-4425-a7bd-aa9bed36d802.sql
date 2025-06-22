
-- Drop the existing foreign key constraint to redefine it
ALTER TABLE public.ig_invoice_items
DROP CONSTRAINT IF EXISTS ig_invoice_items_invoice_id_fkey;

-- Add a new foreign key constraint with ON DELETE CASCADE
-- This ensures that when an invoice is deleted, all its items are also deleted automatically.
ALTER TABLE public.ig_invoice_items
ADD CONSTRAINT ig_invoice_items_invoice_id_fkey
FOREIGN KEY (invoice_id)
REFERENCES public.ig_invoices(id)
ON DELETE CASCADE;
