import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/components/ui/use-toast';
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import type { Tables, TablesUpdate } from '@/integrations/supabase/types';

type Product = Tables<'ig_products'>;

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  unit_type: z.string().optional(),
  default_rate: z.coerce.number().min(0, "Rate must be non-negative").optional(),
  tax_percentage: z.coerce.number().min(0, "Tax must be non-negative").max(100, "Tax cannot exceed 100%").optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

const ProductManagementModule = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      unit_type: '',
      default_rate: 0,
      tax_percentage: 0,
    }
  });

  // Fetch products
  const { data: products, isLoading: isLoadingProducts, error: productsError } = useQuery<Product[], Error>({
    queryKey: ['ig_products', user?.id],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");
      const { data, error } = await supabase
        .from('ig_products')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Add product mutation
  const addProductMutation = useMutation<Product, Error, ProductFormData>({
    mutationFn: async (newProduct) => {
      if (!user) throw new Error("User not authenticated");
      const { data, error } = await supabase
        .from('ig_products')
        .insert([{
          name: newProduct.name,
          user_id: user.id,
          unit_type: newProduct.unit_type ?? null,
          default_rate: newProduct.default_rate ?? null,
          tax_percentage: newProduct.tax_percentage ?? null,
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ig_products', user?.id] });
      toast({ title: "Success", description: "Product added successfully." });
      setIsDialogOpen(false);
      reset();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation<Product, Error, { id: string } & ProductFormData>({
    mutationFn: async ({ id, ...updatedProductData }) => {
      if (!user) throw new Error("User not authenticated");
      const { data, error } = await supabase
        .from('ig_products')
        .update({
          name: updatedProductData.name,
          unit_type: updatedProductData.unit_type ?? null,
          default_rate: updatedProductData.default_rate ?? null,
          tax_percentage: updatedProductData.tax_percentage ?? null,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ig_products', user?.id] });
      toast({ title: "Success", description: "Product updated successfully." });
      setIsDialogOpen(false);
      reset();
      setEditingProduct(null);
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
  
  // Delete product mutation
  const deleteProductMutation = useMutation<void, Error, string>({
    mutationFn: async (productId) => {
      if (!user) throw new Error("User not authenticated");
      const { error } = await supabase
        .from('ig_products')
        .delete()
        .eq('id', productId)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ig_products', user?.id] });
      toast({ title: "Success", description: "Product deleted successfully." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });


  const onSubmit = (formData: ProductFormData) => {
    if (editingProduct) {
      updateProductMutation.mutate({ ...formData, id: editingProduct.id });
    } else {
      addProductMutation.mutate(formData);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    reset({
      name: product.name,
      unit_type: product.unit_type || '',
      default_rate: product.default_rate || 0,
      tax_percentage: product.tax_percentage || 0,
    });
    setIsDialogOpen(true);
  };
  
  const openDialogForNew = () => {
    setEditingProduct(null);
    reset({ name: '', unit_type: '', default_rate: 0, tax_percentage: 0 });
    setIsDialogOpen(true);
  };

  if (!user) {
    return <p>Please log in to manage products.</p>;
  }

  if (isLoadingProducts) {
    return <div className="flex justify-center items-center h-32"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /> <span className="ml-2">Loading products...</span></div>;
  }

  if (productsError) {
    return <p className="text-red-500">Error loading products: {productsError.message}</p>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Manage Products</CardTitle>
          <Button onClick={openDialogForNew} size="sm">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
        <CardDescription>Add, edit, or remove products/services offered by your business.</CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) { setEditingProduct(null); reset(); }}}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Product/Service Name</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="unit_type">Unit Type (e.g., kg, pcs, hour)</Label>
                <Input id="unit_type" {...register('unit_type')} />
                 {errors.unit_type && <p className="text-red-500 text-sm mt-1">{errors.unit_type.message}</p>}
              </div>
              <div>
                <Label htmlFor="default_rate">Default Rate (₹)</Label>
                <Controller
                  name="default_rate"
                  control={control}
                  render={({ field }) => <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />}
                />
                {errors.default_rate && <p className="text-red-500 text-sm mt-1">{errors.default_rate.message}</p>}
              </div>
              <div>
                <Label htmlFor="tax_percentage">Tax (%)</Label>
                 <Controller
                  name="tax_percentage"
                  control={control}
                  render={({ field }) => <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />}
                />
                {errors.tax_percentage && <p className="text-red-500 text-sm mt-1">{errors.tax_percentage.message}</p>}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={addProductMutation.isPending || updateProductMutation.isPending}>
                  {(addProductMutation.isPending || updateProductMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingProduct ? 'Save Changes' : 'Add Product'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {products && products.length > 0 ? (
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Product Details</TableHead>
                  <TableHead className="min-w-[120px]">Pricing & Tax</TableHead>
                  <TableHead className="min-w-[100px] text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="p-3">
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{product.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Unit: {product.unit_type || 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="p-3">
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Rate: </span>
                          ₹{product.default_rate?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Tax: </span>
                          {product.tax_percentage?.toFixed(2) || '0.00'}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center p-3">
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                          className="w-full h-8 text-xs"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteProductMutation.mutate(product.id)}
                          disabled={deleteProductMutation.isPending && deleteProductMutation.variables === product.id}
                          className="w-full h-8 text-xs text-red-600 hover:text-red-700"
                        >
                          {deleteProductMutation.isPending && deleteProductMutation.variables === product.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No products added yet. Click "Add Product" to get started.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductManagementModule;
