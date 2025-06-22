import React, { useState } from 'react';
import { useStaff, Staff } from '../context/StaffContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Users, Phone, MapPin, Briefcase, Building } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import PhotoUpload from "./PhotoUpload";

const StaffList = () => {
  const { state, addStaff, updateStaff, deleteStaff } = useStaff();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    mobileNumber: '', 
    address: '', 
    post: '', 
    workplace: '', 
    dailyWage: '',
    photo_url: '' 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.mobileNumber.trim() || !formData.post.trim() || !formData.workplace.trim() || !formData.dailyWage) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const wage = parseFloat(formData.dailyWage);
    if (wage <= 0) {
      toast({
        title: "Error",
        description: "Daily wage must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingStaff) {
        const updatedStaff: Staff = {
          ...editingStaff,
          name: formData.name.trim(),
          mobileNumber: formData.mobileNumber.trim(),
          address: formData.address.trim() || undefined,
          post: formData.post.trim(),
          workplace: formData.workplace.trim(),
          dailyWage: wage,
          photo_url: formData.photo_url || undefined,
        };
        await updateStaff(updatedStaff);
        toast({
          title: "Success",
          description: "Staff member updated successfully",
        });
      } else {
        await addStaff({
          name: formData.name.trim(),
          mobileNumber: formData.mobileNumber.trim(),
          address: formData.address.trim() || undefined,
          post: formData.post.trim(),
          workplace: formData.workplace.trim(),
          dailyWage: wage,
          photo_url: formData.photo_url || undefined,
        });
        toast({
          title: "Success",
          description: "Staff member added successfully",
        });
      }

      setFormData({ name: '', mobileNumber: '', address: '', post: '', workplace: '', dailyWage: '', photo_url: '' });
      setEditingStaff(null);
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save staff member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff);
    setFormData({ 
      name: staff.name, 
      mobileNumber: staff.mobileNumber,
      address: staff.address || '',
      post: staff.post,
      workplace: staff.workplace,
      dailyWage: staff.dailyWage.toString(),
      photo_url: staff.photo_url || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (staffId: string) => {
    if (window.confirm('Are you sure you want to delete this staff member? This will also remove all their attendance records.')) {
      try {
        await deleteStaff(staffId);
        toast({
          title: "Success",
          description: "Staff member deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete staff member. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', mobileNumber: '', address: '', post: '', workplace: '', dailyWage: '', photo_url: '' });
    setEditingStaff(null);
  };

  if (state.loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading staff data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Staff Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">
                {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <PhotoUpload
                value={formData.photo_url}
                onChange={(url) => setFormData(prev => ({ ...prev, photo_url: url }))}
                label="Staff Photo"
                folderPrefix="staff"
              />
              <div>
                <Label htmlFor="name" className="text-sm">Staff Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter staff name"
                  className="text-sm"
                  required
                />
              </div>
              <div>
                <Label htmlFor="mobile" className="text-sm">Mobile Number *</Label>
                <Input
                  id="mobile"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  placeholder="Enter mobile number"
                  className="text-sm"
                  required
                />
              </div>
              <div>
                <Label htmlFor="address" className="text-sm">Address (Optional)</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter address"
                  className="text-sm resize-none"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="post" className="text-sm">Post *</Label>
                <Input
                  id="post"
                  value={formData.post}
                  onChange={(e) => setFormData({ ...formData, post: e.target.value })}
                  placeholder="Enter job post/position"
                  className="text-sm"
                  required
                />
              </div>
              <div>
                <Label htmlFor="workplace" className="text-sm">Workplace *</Label>
                <Input
                  id="workplace"
                  value={formData.workplace}
                  onChange={(e) => setFormData({ ...formData, workplace: e.target.value })}
                  placeholder="Enter workplace location"
                  className="text-sm"
                  required
                />
              </div>
              <div>
                <Label htmlFor="wage" className="text-sm">Daily Wage (₹) *</Label>
                <Input
                  id="wage"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.dailyWage}
                  onChange={(e) => setFormData({ ...formData, dailyWage: e.target.value })}
                  placeholder="Enter daily wage"
                  className="text-sm"
                  required
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="w-full sm:w-auto text-sm"
                >
                  Cancel
                </Button>
                <Button type="submit" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-sm">
                  {editingStaff ? 'Update' : 'Add'} Staff
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {state.staff.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 sm:py-12">
            <Users className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No staff members yet</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4">Add your first staff member to get started</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Staff Members ({state.staff.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Staff Details</TableHead>
                    <TableHead className="min-w-[150px]">Work Information</TableHead>
                    <TableHead className="min-w-[100px] text-right">Wage & Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.staff.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell className="p-3">
                        <div className="flex items-center gap-3">
                          {staff.photo_url ? (
                            <img
                              src={staff.photo_url}
                              alt={staff.name}
                              className="h-9 w-9 rounded-full object-cover border"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                              {staff.name[0]}
                            </div>
                          )}
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{staff.name}</div>
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{staff.mobileNumber}</span>
                            </div>
                            {staff.address && (
                              <div className="flex items-start space-x-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3 mt-0.5" />
                                <span className="line-clamp-2">{staff.address}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="p-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Briefcase className="h-3 w-3" />
                            <span>{staff.post}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Building className="h-3 w-3" />
                            <span>{staff.workplace}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right p-3">
                        <div className="space-y-2">
                          <div>
                            <div className="text-lg font-bold text-blue-600">₹{staff.dailyWage}</div>
                            <div className="text-xs text-muted-foreground">per day</div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(staff)}
                              className="w-full h-8 text-xs"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(staff.id)}
                              className="w-full h-8 text-xs text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StaffList;
