
-- Enable RLS on transactions table (safe to run even if already enabled)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Allow individual users to select their own transactions
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (user_id = auth.uid());

-- Allow individual users to insert transactions (must insert their own user_id)
CREATE POLICY "Users can insert their own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Allow users to update only their own transactions
CREATE POLICY "Users can update own transactions"
  ON public.transactions FOR UPDATE
  USING (user_id = auth.uid());

-- Allow users to delete only their own transactions
CREATE POLICY "Users can delete own transactions"
  ON public.transactions FOR DELETE
  USING (user_id = auth.uid());
