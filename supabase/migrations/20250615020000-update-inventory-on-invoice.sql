
-- Update the create_full_invoice function to automatically update inventory
CREATE OR REPLACE FUNCTION public.create_full_invoice(
    p_customer_id UUID,
    p_invoice_date DATE,
    p_due_date DATE,
    p_notes TEXT,
    p_terms TEXT,
    p_items public.invoice_item_input[]
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_invoice_id UUID;
    v_subtotal NUMERIC(12, 2) := 0;
    v_total_tax NUMERIC(12, 2) := 0;
    v_grand_total NUMERIC(12, 2) := 0;
    v_item public.invoice_item_input;
    v_monthly_invoice_count INT;
    v_new_invoice_number TEXT;
    v_current_stock NUMERIC;
BEGIN
    -- Generate new invoice number in YY/MM/NN format
    SELECT COUNT(*)
    INTO v_monthly_invoice_count
    FROM public.ig_invoices
    WHERE user_id = v_user_id
      AND date_trunc('month', invoice_date) = date_trunc('month', p_invoice_date);

    v_new_invoice_number := TO_CHAR(p_invoice_date, 'YY/MM/') || LPAD((v_monthly_invoice_count + 1)::text, 2, '0');

    -- 1. Calculate totals from items
    FOREACH v_item IN ARRAY p_items
    LOOP
        v_subtotal := v_subtotal + (v_item.quantity * v_item.rate);
        v_total_tax := v_total_tax + (v_item.quantity * v_item.rate * (COALESCE(v_item.tax_percentage, 0) / 100.0));
    END LOOP;
    v_grand_total := v_subtotal + v_total_tax;

    -- 2. Insert into ig_invoices table
    INSERT INTO public.ig_invoices (
        user_id, customer_id, invoice_date, due_date, invoice_number,
        notes, terms_and_conditions, subtotal, total_tax_amount, grand_total, status
    ) VALUES (
        v_user_id, p_customer_id, p_invoice_date, p_due_date, v_new_invoice_number,
        p_notes, p_terms, v_subtotal, v_total_tax, v_grand_total, 'Paid'
    ) RETURNING id INTO v_invoice_id;

    -- 3. Insert into ig_invoice_items table and update inventory
    FOREACH v_item IN ARRAY p_items
    LOOP
        -- Insert invoice item
        INSERT INTO public.ig_invoice_items (
            user_id, invoice_id, product_id, item_description, quantity,
            unit_type, rate, tax_percentage, line_total
        ) VALUES (
            v_user_id,
            v_invoice_id,
            v_item.product_id,
            v_item.item_description,
            v_item.quantity,
            v_item.unit_type,
            v_item.rate,
            v_item.tax_percentage,
            (v_item.quantity * v_item.rate) * (1 + (COALESCE(v_item.tax_percentage, 0) / 100.0))
        );

        -- Update inventory if product_id exists and there's inventory for this product
        IF v_item.product_id IS NOT NULL THEN
            -- Check current stock
            SELECT quantity_on_hand INTO v_current_stock
            FROM public.ig_inventory
            WHERE user_id = v_user_id AND product_id = v_item.product_id;

            -- Update inventory if record exists
            IF FOUND THEN
                UPDATE public.ig_inventory
                SET 
                    quantity_on_hand = GREATEST(0, quantity_on_hand - v_item.quantity),
                    updated_at = now()
                WHERE user_id = v_user_id AND product_id = v_item.product_id;
            END IF;
        END IF;
    END LOOP;

    -- 4. Automatically record payment for the full amount
    INSERT INTO public.ig_payments (
        user_id, invoice_id, payment_date, amount_paid, payment_method, notes
    ) VALUES (
        v_user_id, v_invoice_id, p_invoice_date, v_grand_total, 'Cash', 'Auto-recorded payment on invoice creation'
    );

    RETURN v_invoice_id;
END;
$$;
