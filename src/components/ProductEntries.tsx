
import React, { useState } from 'react';
import { useInventory, ProductEntry } from '../context/InventoryContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';

const ProductEntries = () => {
  const { state, addEntry, updateEntry, deleteEntry } = useInventory();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ProductEntry | null>(null);
  const [formData, setFormData] = useState({
    productId: '',
    receivedDate: new Date().toISOString().split('T')[0],
    quantity: '',
    source: '',
    remark: '',
  });

  const resetForm = () => {
    setFormData({
      productId: '',
      receivedDate: new Date().toISOString().split('T')[0],
      quantity: '',
      source: '',
      remark: '',
    });
    setShowForm(false);
    setEditingEntry(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productId || !formData.receivedDate || !formData.quantity || !formData.source) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const quantity = parseFloat(formData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid quantity",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingEntry) {
        await updateEntry({
          ...editingEntry,
          productId: formData.productId,
          receivedDate: formData.receivedDate,
          quantity: quantity,
          source: formData.source,
          remark: formData.remark || undefined,
        });
        toast({
          title: "Success",
          description: "Entry updated successfully",
        });
      } else {
        await addEntry({
          productId: formData.productId,
          receivedDate: formData.receivedDate,
          quantity: quantity,
          source: formData.source,
          remark: formData.remark || undefined,
        });
        toast({
          title: "Success",
          description: "Entry added successfully",
        });
      }
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save entry",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (entry: ProductEntry) => {
    setEditingEntry(entry);
    setFormData({
      productId: entry.productId,
      receivedDate: entry.receivedDate,
      quantity: entry.quantity.toString(),
      source: entry.source,
      remark: entry.remark || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (entryId: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await deleteEntry(entryId);
        toast({
          title: "Success",
          description: "Entry deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete entry",
          variant: "destructive",
        });
      }
    }
  };

  const getProductName = (productId: string) => {
    const product = state.products.find(p => p.id === productId);
    return product ? `${product.name} (${product.unit})` : 'Unknown Product';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Product Entries</h2>
        {!showForm && (
          <Button 
            onClick={() => setShowForm(true)}
            disabled={state.products.length === 0}
            className="w-full sm:w-auto text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
        )}
      </div>

      {state.products.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-4 text-gray-500">
              <p className="text-sm sm:text-base">Please add products first before creating entries.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {showForm && state.products.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center justify-between">
              {editingEntry ? 'Edit Entry' : 'Add New Entry'}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetForm}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product *
                  </label>
                  <Select 
                    value={formData.productId} 
                    onValueChange={(value) => setFormData({ ...formData, productId: value })}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {state.products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Received Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.receivedDate}
                    onChange={(e) => setFormData({ ...formData, receivedDate: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="e.g., 10.5"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source *
                  </label>
                  <Input
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    placeholder="e.g., General Store, Milk Vendor"
                    className="text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remark
                </label>
                <Textarea
                  value={formData.remark}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                  placeholder="e.g., For Sunday breakfast"
                  rows={3}
                  className="text-sm"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="submit" className="flex-1 sm:flex-none text-sm">
                  <Check className="w-4 h-4 mr-2" />
                  {editingEntry ? 'Update' : 'Add'} Entry
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  className="flex-1 sm:flex-none text-sm"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Recent Entries ({state.entries.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {state.entries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm sm:text-base">No entries found. Add your first entry to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Product</TableHead>
                    <TableHead className="text-xs sm:text-sm">Date</TableHead>
                    <TableHead className="text-xs sm:text-sm">Quantity</TableHead>
                    <TableHead className="text-xs sm:text-sm">Source</TableHead>
                    <TableHead className="text-xs sm:text-sm">Remark</TableHead>
                    <TableHead className="text-xs sm:text-sm w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium text-xs sm:text-sm">
                        {getProductName(entry.productId)}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {new Date(entry.receivedDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {entry.quantity}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {entry.source}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <div className="max-w-32 truncate" title={entry.remark}>
                          {entry.remark || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(entry)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(entry.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductEntries;
