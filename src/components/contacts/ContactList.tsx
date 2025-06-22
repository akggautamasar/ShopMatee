
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Phone, Mail, Edit, Trash2, MessageSquare } from 'lucide-react';
import { Contact, Transaction } from '../BorrowCreditManagement';

interface ContactListProps {
  contacts: Contact[];
  transactions: Transaction[];
  onSelectContact: (contact: Contact) => void;
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (contactId: string) => void;
  selectedContact: Contact | null;
}

const ContactList: React.FC<ContactListProps> = ({
  contacts,
  transactions,
  onSelectContact,
  onEditContact,
  onDeleteContact,
  selectedContact
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const getContactBalance = (contactId: string) => {
    const contactTransactions = transactions.filter(t => t.contact_id === contactId);
    const credits = contactTransactions
      .filter(t => t.type === 'Credit')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const debits = contactTransactions
      .filter(t => t.type === 'Debit')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    return credits - debits;
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone_number.includes(searchTerm);
    
    const matchesFilter = filterType === 'all' || contact.contact_type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const handleCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleMessage = (phoneNumber: string) => {
    window.open(`sms:${phoneNumber}`, '_self');
  };

  const getContactTypeColor = (type: string) => {
    switch (type) {
      case 'Staff': return 'bg-blue-100 text-blue-800';
      case 'Customer': return 'bg-green-100 text-green-800';
      case 'Supplier': return 'bg-purple-100 text-purple-800';
      case 'Other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Contacts</CardTitle>
        
        {/* Search and Filter */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Staff">Staff</SelectItem>
              <SelectItem value="Customer">Customer</SelectItem>
              <SelectItem value="Supplier">Supplier</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="w-full overflow-x-auto">
          {filteredContacts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No contacts found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">Contact Details</TableHead>
                  <TableHead className="min-w-[120px] text-center">Quick Actions</TableHead>
                  <TableHead className="min-w-[100px] text-center">Manage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map(contact => {
                  const balance = getContactBalance(contact.id);
                  const isSelected = selectedContact?.id === contact.id;
                  
                  return (
                    <TableRow
                      key={contact.id}
                      className={`cursor-pointer ${
                        isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => onSelectContact(contact)}
                    >
                      <TableCell className="p-3">
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{contact.name}</div>
                          <div className="text-xs text-muted-foreground">{contact.phone_number}</div>
                          <div className="flex items-center justify-between">
                            <Badge className={`text-xs ${getContactTypeColor(contact.contact_type)}`}>
                              {contact.contact_type}
                            </Badge>
                            <span className={`text-xs font-medium ${
                              balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              ₹{balance.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center p-3">
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCall(contact.phone_number);
                            }}
                            className="w-full h-8 text-xs"
                          >
                            <Phone className="h-3 w-3 mr-1" />
                            Call
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMessage(contact.phone_number);
                            }}
                            className="w-full h-8 text-xs"
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            SMS
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-center p-3">
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditContact(contact);
                            }}
                            className="w-full h-8 text-xs"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteContact(contact.id);
                            }}
                            className="w-full h-8 text-xs text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactList;
