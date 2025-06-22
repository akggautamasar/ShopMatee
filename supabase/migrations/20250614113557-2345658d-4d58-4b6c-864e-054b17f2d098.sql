
-- Products Table
CREATE TABLE public.ig_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  unit_type TEXT, -- e.g., kg, litre, pcs, hour
  default_rate NUMERIC(10, 2) DEFAULT 0.00,
  tax_percentage NUMERIC(5, 2) DEFAULT 0.00, -- Store as percentage, e.g., 18 for 18%
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON COLUMN public.ig_products.tax_percentage IS 'Store as percentage, e.g., 18 for 18%';

-- RLS Policies for ig_products
ALTER TABLE public.ig_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own products"
ON public.ig_products
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Customers Table
CREATE TABLE public.ig_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  contact_number TEXT,
  email TEXT,
  billing_address TEXT,
  shipping_address TEXT,
  customer_tag TEXT, -- Regular, Wholesale, etc.
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies for ig_customers
ALTER TABLE public.ig_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own customers"
ON public.ig_customers
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Invoices Table
CREATE TABLE public.ig_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.ig_customers(id) ON DELETE SET NULL,
  invoice_number TEXT, -- Can be auto-generated or manual
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal NUMERIC(12, 2) DEFAULT 0.00,
  discount_amount NUMERIC(10, 2) DEFAULT 0.00,
  discount_is_percentage BOOLEAN DEFAULT FALSE,
  shipping_charges NUMERIC(10, 2) DEFAULT 0.00,
  total_tax_amount NUMERIC(12, 2) DEFAULT 0.00,
  grand_total NUMERIC(12, 2) DEFAULT 0.00,
  amount_in_words TEXT,
  notes TEXT,
  terms_and_conditions TEXT,
  status TEXT DEFAULT 'Unpaid', -- Unpaid, Paid, Partially Paid, Draft
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
-- We might want a unique constraint on (user_id, invoice_number) if invoice numbers must be unique per user
CREATE UNIQUE INDEX IF NOT EXISTS ig_invoices_user_invoice_number_idx ON public.ig_invoices (user_id, invoice_number) WHERE invoice_number IS NOT NULL;


-- RLS Policies for ig_invoices
ALTER TABLE public.ig_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own invoices"
ON public.ig_invoices
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Invoice Items Table
CREATE TABLE public.ig_invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- For RLS consistency
  invoice_id UUID REFERENCES public.ig_invoices(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.ig_products(id) ON DELETE SET NULL, -- If product is deleted, item remains with details
  item_description TEXT NOT NULL, -- Could be product name or custom item description
  quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
  unit_type TEXT,
  rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  tax_percentage NUMERIC(5, 2) DEFAULT 0.00,
  line_total NUMERIC(12, 2) DEFAULT 0.00, -- (Quantity * Rate) + Tax Amount for this line
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON COLUMN public.ig_invoice_items.user_id IS 'Added for RLS consistency, should match invoice.user_id';

-- RLS Policies for ig_invoice_items
ALTER TABLE public.ig_invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage items for their own invoices"
ON public.ig_invoice_items
FOR ALL
USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.ig_invoices WHERE id = invoice_id AND user_id = auth.uid()))
WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.ig_invoices WHERE id = invoice_id AND user_id = auth.uid()));

-- Payments Table
CREATE TABLE public.ig_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    invoice_id UUID REFERENCES public.ig_invoices(id) ON DELETE CASCADE NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount_paid NUMERIC(12, 2) NOT NULL,
    payment_method TEXT, -- Cash, UPI, Card, Bank Transfer
    notes TEXT,
    receipt_url TEXT, -- Link to uploaded receipt if any
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies for ig_payments
ALTER TABLE public.ig_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage payments for their own invoices"
ON public.ig_payments
FOR ALL
USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.ig_invoices WHERE id = invoice_id AND user_id = auth.uid()))
WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.ig_invoices WHERE id = invoice_id AND user_id = auth.uid()));

-- Inventory Table (for module 7)
CREATE TABLE public.ig_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.ig_products(id) ON DELETE CASCADE NOT NULL UNIQUE, -- Each product has one inventory record
    quantity_on_hand NUMERIC(10, 2) DEFAULT 0.00,
    low_stock_threshold NUMERIC(10, 2) DEFAULT 0.00,
    last_stocked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies for ig_inventory
ALTER TABLE public.ig_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage inventory for their own products"
ON public.ig_inventory
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

