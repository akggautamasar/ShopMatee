
import * as z from 'zod';

export const invoiceItemSchema = z.object({
  product_id: z.string().uuid().nullable(),
  item_description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().min(0.01, "Quantity must be positive"),
  unit_type: z.string().optional().nullable(),
  rate: z.coerce.number().min(0, "Rate cannot be negative"),
  tax_percentage: z.coerce.number().min(0).max(100).optional().nullable().default(0),
});

export const invoiceSchema = z.object({
  customer_id: z.string().uuid({ message: "Please select a customer." }),
  invoice_date: z.date({ required_error: "Invoice date is required." }),
  due_date: z.date().optional().nullable(),
  items: z.array(invoiceItemSchema).min(1, "Please add at least one item."),
  notes: z.string().optional().nullable(),
  terms_and_conditions: z.string().optional().nullable(),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;
