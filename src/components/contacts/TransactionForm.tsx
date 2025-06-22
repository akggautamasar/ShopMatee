import React, { useState, useRef } from 'react';
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
import SignaturePad, { SignaturePadHandle } from './SignaturePad';
import { Switch } from "@/components/ui/switch";

interface TransactionFormProps {
  contacts: Contact[];
  selectedContact?: Contact | null;
  onSave: () => void;
  onCancel: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  contacts,
  selectedContact,
  onSave,
  onCancel,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    contact_id: selectedContact?.id || '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    type: 'Credit' as 'Credit' | 'Debit',
    payment_mode: 'Cash' as 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque' | 'Other',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [includeSignature, setIncludeSignature] = useState(false);
  const [signatureUploading, setSignatureUploading] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const signaturePadRef = useRef<SignaturePadHandle>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.contact_id) {
      toast({
        title: "Error",
        description: "Please select a contact",
        variant: "destructive",
      });
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    // Debug: Log the user object and user_id before attempting to save!
    console.log("Current user object in TransactionForm:", user);
    console.log("Form data about to be submitted:", formData);

    setLoading(true);

    let uploadedSignatureUrl: string | null = null;

    if (includeSignature && signaturePadRef.current) {
      setSignatureUploading(true);

      const blob = await signaturePadRef.current.getImageData();
      if (!blob) {
        toast({
          title: "Signature Error",
          description: "Signature image data is missing or invalid.",
          variant: "destructive",
        });
        setLoading(false);
        setSignatureUploading(false);
        return;
      }
      if (!user?.id) {
        toast({
          title: "User Error",
          description: "Unable to determine the user. Please re-login.",
          variant: "destructive",
        });
        setLoading(false);
        setSignatureUploading(false);
        return;
      }
      // Make a unique filename (avoid slashes and spaces)
      const safeUserId = user.id.replace(/[^a-zA-Z0-9_-]/g, '');
      const filename = `signature_${safeUserId}_${Date.now()}.png`;
      try {
        const { data, error } = await supabase.storage
          .from('signatures')
          .upload(filename, blob, {
            cacheControl: '3600',
            upsert: false,
            contentType: 'image/png',
          });
        if (error) {
          console.error("Signature upload error:", error);
          toast({
            title: "Failed to upload signature",
            description: error.message || "Unknown error while uploading signature",
            variant: "destructive",
          });
          setLoading(false);
          setSignatureUploading(false);
          return;
        }
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('signatures')
          .getPublicUrl(filename);
        uploadedSignatureUrl = publicUrlData?.publicUrl || null;
        if (!uploadedSignatureUrl) {
          console.error("Signature public URL missing after upload.", publicUrlData);
          toast({
            title: "Failed to get signature URL",
            description: "Could not get the public URL for signature upload.",
            variant: "destructive",
          });
          setLoading(false);
          setSignatureUploading(false);
          return;
        }
      } catch (err) {
        console.error("Unexpected error during signature upload:", err);
        toast({
          title: "Unexpected error",
          description: (err instanceof Error ? err.message : "Unknown error") || "Try again.",
          variant: "destructive",
        });
        setLoading(false);
        setSignatureUploading(false);
        return;
      }
      setSignatureUploading(false);
    }

    try {
      // Construct only fields that are needed
      const dataToSave: any = {
        contact_id: formData.contact_id,
        date: formData.date,
        amount: Number(formData.amount),
        type: formData.type,
        payment_mode: formData.payment_mode,
        notes: formData.notes || null,
        user_id: user?.id,
      };
      // Only add if present and needed
      if (uploadedSignatureUrl) {
        dataToSave.signature_url = uploadedSignatureUrl;
      }

      // Debug: log the entire payload and current auth user id
      console.log("Saving transaction payload:", dataToSave);

      const { error } = await supabase
        .from('transactions')
        .insert([dataToSave]);
      if (error) {
        // Extra debug info
        console.error("Supabase insert error details:", error, "Payload:", dataToSave);
        throw error;
      }

      toast({
        title: "Success",
        description: `Transaction recorded${uploadedSignatureUrl ? " with signature." : " (no signature)"}`
      });

      onSave();
    } catch (error: any) {
      console.error('Error saving transaction:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to save transaction",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Add Transaction</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact_id">Contact *</Label>
              <Select
                value={formData.contact_id}
                onValueChange={(value) => setFormData({...formData, contact_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contact" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map(contact => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name} - {contact.phone_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'Credit' | 'Debit') => 
                  setFormData({...formData, type: value})
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Credit">Credit (Money Given)</SelectItem>
                  <SelectItem value="Debit">Debit (Money Received)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_mode">Payment Mode *</Label>
              <Select
                value={formData.payment_mode}
                onValueChange={(value: 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque' | 'Other') => 
                  setFormData({...formData, payment_mode: value})
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="signature" className="flex gap-1 items-center">
                  Capture Signature (optional)
                </Label>
                <Switch
                  id="includeSignature"
                  checked={includeSignature}
                  onCheckedChange={setIncludeSignature}
                />
              </div>
              {includeSignature && (
                <div className="space-y-2">
                  <SignaturePad
                    ref={signaturePadRef}
                    width={300}
                    height={120}
                    className="w-full"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => signaturePadRef.current?.clear()}
                      disabled={signatureUploading}
                    >
                      Clear Signature
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Get signature from the receiver if needed.
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-2 pt-4">
              <Button type="submit" disabled={loading || signatureUploading} className="flex-1">
                {loading || signatureUploading ? 'Saving...' : 'Save Transaction'}
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

export default TransactionForm;
