
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { Contact } from '../BorrowCreditManagement';

interface ContactFormProps {
  contact?: Contact | null;
  onSave: () => void;
  onCancel: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ contact, onSave, onCancel }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    phone_number: '',
    name: '',
    email: '',
    address: '',
    contact_type: 'Customer' as 'Staff' | 'Customer' | 'Supplier' | 'Other',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (contact) {
      setFormData({
        phone_number: contact.phone_number,
        name: contact.name,
        email: contact.email || '',
        address: contact.address || '',
        contact_type: contact.contact_type,
        notes: contact.notes || ''
      });
    }
  }, [contact]);

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePhoneNumber(formData.phone_number)) {
      toast({
        title: "Error",
        description: "Phone number must be exactly 10 digits",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const dataToSave = {
        ...formData,
        user_id: user?.id,
        email: formData.email || null,
        address: formData.address || null,
        notes: formData.notes || null
      };

      if (contact) {
        // Update existing contact
        const { error } = await supabase
          .from('contacts')
          .update(dataToSave)
          .eq('id', contact.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Contact updated successfully",
        });
      } else {
        // Create new contact
        const { error } = await supabase
          .from('contacts')
          .insert([dataToSave]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Contact created successfully",
        });
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving contact:', error);
      
      if (error.code === '23505') {
        toast({
          title: "Error",
          description: "A contact with this phone number already exists",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save contact",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">
            {contact ? 'Edit Contact' : 'Add New Contact'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number *</Label>
              <Input
                id="phone_number"
                type="tel"
                placeholder="10-digit phone number"
                value={formData.phone_number}
                onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                maxLength={10}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Contact name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_type">Contact Type *</Label>
              <Select
                value={formData.contact_type}
                onValueChange={(value: 'Staff' | 'Customer' | 'Supplier' | 'Other') => 
                  setFormData({...formData, contact_type: value})
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contact type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Customer">Customer</SelectItem>
                  <SelectItem value="Supplier">Supplier</SelectItem>
                  <SelectItem value="Staff">Staff</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Contact address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={2}
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Saving...' : (contact ? 'Update' : 'Create')}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactForm;
