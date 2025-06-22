
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Phone, Mail, MapPin, Plus, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { Contact, Transaction } from '../BorrowCreditManagement';

interface ContactDetailsProps {
  contact: Contact;
  transactions: Transaction[];
  onAddTransaction: () => void;
}

const ContactDetails: React.FC<ContactDetailsProps> = ({ 
  contact, 
  transactions, 
  onAddTransaction 
}) => {
  const credits = transactions
    .filter(t => t.type === 'Credit')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const debits = transactions
    .filter(t => t.type === 'Debit')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const balance = credits - debits;

  const getContactTypeColor = (type: string) => {
    switch (type) {
      case 'Staff': return 'bg-blue-100 text-blue-800';
      case 'Customer': return 'bg-green-100 text-green-800';
      case 'Supplier': return 'bg-purple-100 text-purple-800';
      case 'Other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportTransactions = () => {
    const csvContent = [
      ['Date', 'Type', 'Amount', 'Payment Mode', 'Notes', 'Signature'],
      ...transactions.map(t => [
        t.date,
        t.type,
        t.amount.toString(),
        t.payment_mode,
        t.notes || '',
        t.signature_url || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contact.name}_transactions.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{contact.name}</CardTitle>
            <Badge className={`mt-2 ${getContactTypeColor(contact.contact_type)}`}>
              {contact.contact_type}
            </Badge>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={onAddTransaction}>
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
            <Button variant="outline" size="sm" onClick={exportTransactions}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Contact Info */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{contact.phone_number}</span>
          </div>
          {contact.email && (
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{contact.email}</span>
            </div>
          )}
          {contact.address && (
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{contact.address}</span>
            </div>
          )}
          {contact.notes && (
            <div className="mt-2">
              <p className="text-sm text-gray-600"><strong>Notes:</strong> {contact.notes}</p>
            </div>
          )}
        </div>

        {/* Balance Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-xs font-medium text-green-600">Credits</span>
            </div>
            <div className="text-lg font-bold text-green-600">₹{credits.toFixed(2)}</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              <span className="text-xs font-medium text-red-600">Debits</span>
            </div>
            <div className="text-lg font-bold text-red-600">₹{debits.toFixed(2)}</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <span className="text-xs font-medium text-gray-600">Balance</span>
            </div>
            <div className={`text-lg font-bold ${
              balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-600' : 'text-gray-600'
            }`}>
              ₹{balance.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div>
          <h4 className="font-medium mb-3">Transaction History ({transactions.length})</h4>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No transactions found</p>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Amount</TableHead>
                    <TableHead className="text-xs">Mode</TableHead>
                    <TableHead className="text-xs">Signature</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map(transaction => (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-xs">
                        {new Date(transaction.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={transaction.type === 'Credit' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-xs font-medium ${
                        transaction.type === 'Credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ₹{Number(transaction.amount).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-xs">{transaction.payment_mode}</TableCell>
                      <TableCell className="text-xs">
                        {transaction.signature_url ? (
                          <a
                            href={transaction.signature_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block"
                          >
                            <img
                              src={transaction.signature_url}
                              alt="Signature"
                              className="h-8 max-w-[60px] object-contain border rounded"
                              style={{ background: 'white' }}
                            />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactDetails;
