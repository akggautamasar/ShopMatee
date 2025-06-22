
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../integrations/supabase/client';
import ContactList from './contacts/ContactList';
import ContactForm from './contacts/ContactForm';
import TransactionForm from './contacts/TransactionForm';
import ContactDetails from './contacts/ContactDetails';
import AccountBookReports from './contacts/AccountBookReports';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

export interface Contact {
  id: string;
  phone_number: string;
  name: string;
  email?: string;
  address?: string;
  contact_type: 'Staff' | 'Customer' | 'Supplier' | 'Other';
  notes?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  contact_id: string;
  date: string;
  amount: number;
  type: 'Credit' | 'Debit';
  payment_mode: 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque' | 'Other';
  notes?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

const AccountBook = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchContacts();
      fetchTransactions();
    }
  }, [user]);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user?.id)
        .order('name');

      if (error) throw error;
      
      // Type assertion for contact_type
      const typedContacts = (data || []).map(contact => ({
        ...contact,
        contact_type: contact.contact_type as 'Staff' | 'Customer' | 'Supplier' | 'Other'
      }));
      
      setContacts(typedContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch contacts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false });

      if (error) throw error;
      
      // Type assertion for type and payment_mode
      const typedTransactions = (data || []).map(transaction => ({
        ...transaction,
        type: transaction.type as 'Credit' | 'Debit',
        payment_mode: transaction.payment_mode as 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque' | 'Other'
      }));
      
      setTransactions(typedTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleContactSaved = () => {
    fetchContacts();
    setShowContactForm(false);
    setEditingContact(null);
  };

  const handleTransactionSaved = () => {
    fetchTransactions();
    setShowTransactionForm(false);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setShowContactForm(true);
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;

      fetchContacts();
      if (selectedContact?.id === contactId) {
        setSelectedContact(null);
      }
      toast({
        title: "Success",
        description: "Contact deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      });
    }
  };

  // Calculate summary statistics
  const totalCredits = transactions
    .filter(t => t.type === 'Credit')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalDebits = transactions
    .filter(t => t.type === 'Debit')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netBalance = totalCredits - totalDebits;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-0">
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Account Book</h2>
        
        {/* Summary Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Total Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold">{contacts.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Total Credits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-green-600">₹{totalCredits.toFixed(2)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center">
                <TrendingDown className="h-4 w-4 mr-2" />
                Total Debits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-red-600">₹{totalDebits.toFixed(2)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Net Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-lg sm:text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{netBalance.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            onClick={() => {
              setEditingContact(null);
              setShowContactForm(true);
            }}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
          <Button
            onClick={() => setShowTransactionForm(true)}
            variant="outline"
            disabled={contacts.length === 0}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
          <Button
            onClick={() => setShowReports(true)}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Download Reports
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contact List */}
        <ContactList
          contacts={contacts}
          transactions={transactions}
          onSelectContact={setSelectedContact}
          onEditContact={handleEditContact}
          onDeleteContact={handleDeleteContact}
          selectedContact={selectedContact}
        />

        {/* Contact Details */}
        {selectedContact && (
          <ContactDetails
            contact={selectedContact}
            transactions={transactions.filter(t => t.contact_id === selectedContact.id)}
            onAddTransaction={() => setShowTransactionForm(true)}
          />
        )}
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <ContactForm
          contact={editingContact}
          onSave={handleContactSaved}
          onCancel={() => {
            setShowContactForm(false);
            setEditingContact(null);
          }}
        />
      )}

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <TransactionForm
          contacts={contacts}
          selectedContact={selectedContact}
          onSave={handleTransactionSaved}
          onCancel={() => setShowTransactionForm(false)}
        />
      )}

      {/* Reports Modal */}
      {showReports && (
        <AccountBookReports
          contacts={contacts}
          transactions={transactions}
          onClose={() => setShowReports(false)}
        />
      )}
    </div>
  );
};

export default AccountBook;
