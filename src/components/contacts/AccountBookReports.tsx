
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, Download, FileText } from 'lucide-react';
import { Contact, Transaction } from '../AccountBook';

interface AccountBookReportsProps {
  contacts: Contact[];
  transactions: Transaction[];
  onClose: () => void;
}

const AccountBookReports: React.FC<AccountBookReportsProps> = ({
  contacts,
  transactions,
  onClose
}) => {
  const [reportType, setReportType] = useState<'individual' | 'complete' | 'filtered'>('complete');
  const [selectedContact, setSelectedContact] = useState<string>('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');

  const contactTypes = ['Staff', 'Customer', 'Supplier', 'Other'];

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const getFilteredData = () => {
    switch (reportType) {
      case 'individual':
        if (!selectedContact) return { contacts: [], transactions: [] };
        const contact = contacts.find(c => c.id === selectedContact);
        return {
          contacts: contact ? [contact] : [],
          transactions: transactions.filter(t => t.contact_id === selectedContact)
        };
      
      case 'filtered':
        if (selectedTypes.length === 0) return { contacts, transactions };
        const filteredContacts = contacts.filter(c => selectedTypes.includes(c.contact_type));
        const contactIds = filteredContacts.map(c => c.id);
        return {
          contacts: filteredContacts,
          transactions: transactions.filter(t => contactIds.includes(t.contact_id))
        };
      
      default:
        return { contacts, transactions };
    }
  };

  // Convert image to base64 for embedding in reports
  const getLogoBase64 = async (): Promise<string> => {
    try {
      const response = await fetch('/lovable-uploads/82afab97-eae2-47c5-ac04-b9e9fa5d2064.png');
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Failed to load logo:', error);
      return '';
    }
  };

  const generateDetailedCSV = () => {
    const { contacts: reportContacts, transactions: reportTransactions } = getFilteredData();
    
    // Calculate totals
    const totalCredits = reportTransactions
      .filter(t => t.type === 'Credit')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const totalDebits = reportTransactions
      .filter(t => t.type === 'Debit')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const netBalance = totalCredits - totalDebits;
    
    const headers = [
      'Account Name',
      'Account Type',
      'Phone',
      'Email',
      'Address',
      'Transaction Date',
      'Transaction Type',
      'Amount',
      'Payment Mode',
      'Notes',
      'Running Balance'
    ];

    const rows: string[] = [
      '# ShopMate Account Book Report',
      `# Report Type: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`,
      `# Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
      `# Total Credits: ₹${totalCredits.toFixed(2)}`,
      `# Total Debits: ₹${totalDebits.toFixed(2)}`,
      `# Net Balance: ₹${netBalance.toFixed(2)}`,
      '',
      headers.join(',')
    ];
    
    reportContacts.forEach(contact => {
      const contactTransactions = reportTransactions
        .filter(t => t.contact_id === contact.id)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      let runningBalance = 0;
      
      if (contactTransactions.length === 0) {
        rows.push([
          `"${contact.name}"`,
          `"${contact.contact_type}"`,
          `"${contact.phone_number}"`,
          `"${contact.email || '-'}"`,
          `"${contact.address || '-'}"`,
          `"No transactions"`,
          `"-"`,
          `"0"`,
          `"-"`,
          `"-"`,
          `"0"`
        ].join(','));
      } else {
        contactTransactions.forEach(transaction => {
          if (transaction.type === 'Credit') {
            runningBalance += Number(transaction.amount);
          } else {
            runningBalance -= Number(transaction.amount);
          }
          
          rows.push([
            `"${contact.name}"`,
            `"${contact.contact_type}"`,
            `"${contact.phone_number}"`,
            `"${contact.email || '-'}"`,
            `"${contact.address || '-'}"`,
            `"${new Date(transaction.date).toLocaleDateString()}"`,
            `"${transaction.type}"`,
            `"${Number(transaction.amount).toFixed(2)}"`,
            `"${transaction.payment_mode}"`,
            `"${transaction.notes || '-'}"`,
            `"${runningBalance.toFixed(2)}"`
          ].join(','));
        });
      }
      
      rows.push('');
    });

    // Add summary at the end
    rows.push('# SUMMARY');
    rows.push(`# Total Accounts: ${reportContacts.length}`);
    rows.push(`# Total Transactions: ${reportTransactions.length}`);
    rows.push(`# Total Credits: ₹${totalCredits.toFixed(2)}`);
    rows.push(`# Total Debits: ₹${totalDebits.toFixed(2)}`);
    rows.push(`# Net Balance: ₹${netBalance.toFixed(2)}`);

    const csvContent = rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `account-book-detailed-${reportType}-${new Date().toISOString().split('T')[0]}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateDetailedPDF = async () => {
    const { contacts: reportContacts, transactions: reportTransactions } = getFilteredData();
    
    // Calculate totals
    const totalCredits = reportTransactions
      .filter(t => t.type === 'Credit')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const totalDebits = reportTransactions
      .filter(t => t.type === 'Debit')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const netBalance = totalCredits - totalDebits;
    
    const logoBase64 = await getLogoBase64();
    
    const accountsHTML = reportContacts.map(contact => {
      const contactTransactions = reportTransactions
        .filter(t => t.contact_id === contact.id)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      let runningBalance = 0;
      
      const transactionsHTML = contactTransactions.length === 0 ? 
        '<tr><td colspan="5" class="text-center text-gray-500">No transactions found</td></tr>' :
        contactTransactions.map(transaction => {
          if (transaction.type === 'Credit') {
            runningBalance += Number(transaction.amount);
          } else {
            runningBalance -= Number(transaction.amount);
          }
          
          return `
            <tr>
              <td>${new Date(transaction.date).toLocaleDateString()}</td>
              <td><span class="badge ${transaction.type === 'Credit' ? 'credit' : 'debit'}">${transaction.type}</span></td>
              <td class="amount ${transaction.type === 'Credit' ? 'credit' : 'debit'}">₹${Number(transaction.amount).toFixed(2)}</td>
              <td>${transaction.payment_mode}</td>
              <td class="amount">₹${runningBalance.toFixed(2)}</td>
            </tr>
          `;
        }).join('');
      
      const contactCredits = contactTransactions
        .filter(t => t.type === 'Credit')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const contactDebits = contactTransactions
        .filter(t => t.type === 'Debit')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return `
        <div class="account-section">
          <div class="account-header">
            <h3>${contact.name}</h3>
            <div class="account-info">
              <span class="type-badge ${contact.contact_type.toLowerCase()}">${contact.contact_type}</span>
              <span>📞 ${contact.phone_number}</span>
              ${contact.email ? `<span>✉️ ${contact.email}</span>` : ''}
              ${contact.address ? `<span>📍 ${contact.address}</span>` : ''}
            </div>
          </div>
          
          <div class="summary-row">
            <div class="summary-item credit">
              <span class="label">Total Credits:</span>
              <span class="value">₹${contactCredits.toFixed(2)}</span>
            </div>
            <div class="summary-item debit">
              <span class="label">Total Debits:</span>
              <span class="value">₹${contactDebits.toFixed(2)}</span>
            </div>
            <div class="summary-item balance">
              <span class="label">Final Balance:</span>
              <span class="value ${runningBalance >= 0 ? 'credit' : 'debit'}">₹${runningBalance.toFixed(2)}</span>
            </div>
          </div>
          
          <table class="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Mode</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              ${transactionsHTML}
            </tbody>
          </table>
        </div>
      `;
    }).join('');
    
    const reportTitle = reportType === 'individual' ? 
      `Account Statement - ${reportContacts[0]?.name || 'Unknown'}` :
      reportType === 'filtered' ? 
        `Account Book Report - ${selectedTypes.join(', ')}` :
        'Complete Account Book Report';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportTitle}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.4; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
          .logo { width: 80px; height: 80px; margin: 0 auto 15px; display: block; }
          .company-name { font-size: 28px; font-weight: bold; color: #2563eb; margin-bottom: 5px; }
          .report-title { font-size: 20px; margin: 10px 0; color: #1f2937; }
          .report-date { font-size: 14px; color: #666; }
          
          .report-summary { 
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); 
            padding: 20px; 
            margin-bottom: 30px; 
            border-radius: 10px; 
            border: 1px solid #0ea5e9; 
          }
          .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
          .summary-stat { text-align: center; }
          .summary-stat .label { display: block; font-size: 14px; color: #475569; margin-bottom: 5px; font-weight: 600; }
          .summary-stat .value { font-size: 24px; font-weight: bold; }
          .summary-stat.credit .value { color: #059669; }
          .summary-stat.debit .value { color: #dc2626; }
          .summary-stat.balance .value.positive { color: #059669; }
          .summary-stat.balance .value.negative { color: #dc2626; }
          
          .account-section { margin-bottom: 40px; page-break-inside: avoid; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
          .account-header { background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); padding: 20px; border-bottom: 1px solid #d1d5db; }
          .account-header h3 { margin: 0 0 10px 0; font-size: 22px; color: #1f2937; }
          .account-info { display: flex; flex-wrap: wrap; gap: 15px; font-size: 14px; }
          .account-info span { display: flex; align-items: center; }
          
          .type-badge { padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 12px; }
          .type-badge.staff { background: #dbeafe; color: #1e40af; }
          .type-badge.customer { background: #dcfce7; color: #166534; }
          .type-badge.supplier { background: #fae8ff; color: #7c2d12; }
          .type-badge.other { background: #f3f4f6; color: #374151; }
          
          .summary-row { display: flex; justify-content: space-around; padding: 15px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; }
          .summary-item { text-align: center; }
          .summary-item .label { display: block; font-size: 12px; color: #6b7280; margin-bottom: 5px; }
          .summary-item .value { font-size: 18px; font-weight: bold; }
          .summary-item.credit .value { color: #059669; }
          .summary-item.debit .value { color: #dc2626; }
          .summary-item.balance .value.credit { color: #059669; }
          .summary-item.balance .value.debit { color: #dc2626; }
          
          .transactions-table { width: 100%; border-collapse: collapse; font-size: 14px; }
          .transactions-table th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: bold; color: #374151; }
          .transactions-table td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; }
          .transactions-table tbody tr:hover { background: #f9fafb; }
          
          .badge { padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; }
          .badge.credit { background: #dcfce7; color: #166534; }
          .badge.debit { background: #fee2e2; color: #991b1b; }
          
          .amount.credit { color: #059669; font-weight: bold; }
          .amount.debit { color: #dc2626; font-weight: bold; }
          
          .text-center { text-align: center; }
          .text-gray-500 { color: #6b7280; }
          
          .footer { margin-top: 40px; text-align: center; padding: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
          
          @media print {
            .account-section { page-break-inside: avoid; }
            body { margin: 10px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          ${logoBase64 ? `<img src="${logoBase64}" alt="ShopMate Logo" class="logo" />` : ''}
          <div class="company-name">ShopMate</div>
          <div class="report-title">${reportTitle}</div>
          <div class="report-date">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</div>
        </div>
        
        <div class="report-summary">
          <div class="summary-grid">
            <div class="summary-stat credit">
              <span class="label">Total Credits</span>
              <span class="value">₹${totalCredits.toFixed(2)}</span>
            </div>
            <div class="summary-stat debit">
              <span class="label">Total Debits</span>
              <span class="value">₹${totalDebits.toFixed(2)}</span>
            </div>
            <div class="summary-stat balance">
              <span class="label">Net Balance</span>
              <span class="value ${netBalance >= 0 ? 'positive' : 'negative'}">₹${netBalance.toFixed(2)}</span>
            </div>
            <div class="summary-stat">
              <span class="label">Total Accounts</span>
              <span class="value" style="color: #2563eb;">${reportContacts.length}</span>
            </div>
          </div>
        </div>
        
        ${accountsHTML}
        
        <div class="footer">
          <p>This report contains ${reportContacts.length} account(s) with ${reportTransactions.length} transaction(s)</p>
          <p><strong>Total Credits: ₹${totalCredits.toFixed(2)} | Total Debits: ₹${totalDebits.toFixed(2)} | Net Balance: ₹${netBalance.toFixed(2)}</strong></p>
          <p>Report generated from ShopMate Account Book System</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `account-book-${reportType}-${new Date().toISOString().split('T')[0]}.html`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    if (exportFormat === 'excel') {
      generateDetailedCSV();
    } else {
      generateDetailedPDF();
    }
  };

  const { contacts: previewContacts, transactions: previewTransactions } = getFilteredData();
  
  // Calculate preview totals
  const previewCredits = previewTransactions
    .filter(t => t.type === 'Credit')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const previewDebits = previewTransactions
    .filter(t => t.type === 'Debit')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const previewBalance = previewCredits - previewDebits;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Download Account Book Reports</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6 overflow-y-auto">
          {/* Report Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Report Type</label>
            <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="complete">Complete Account Book</SelectItem>
                <SelectItem value="individual">Individual Account</SelectItem>
                <SelectItem value="filtered">Filter by Account Type</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Individual Contact Selection */}
          {reportType === 'individual' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Account</label>
              <Select value={selectedContact} onValueChange={setSelectedContact}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an account" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map(contact => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name} ({contact.contact_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Type Filter Selection */}
          {reportType === 'filtered' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Account Types</label>
              <div className="flex flex-wrap gap-2">
                {contactTypes.map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={selectedTypes.includes(type)}
                      onCheckedChange={() => handleTypeToggle(type)}
                    />
                    <label htmlFor={type} className="text-sm">{type}</label>
                  </div>
                ))}
              </div>
              {selectedTypes.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedTypes.map(type => (
                    <Badge key={type} variant="secondary">
                      {type}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Export Format Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Export Format</label>
            <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF (HTML)</SelectItem>
                <SelectItem value="excel">Excel (CSV)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preview with Financial Summary */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Preview & Summary</label>
            <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Accounts: {previewContacts.length}</p>
                  <p className="font-medium">Transactions: {previewTransactions.length}</p>
                </div>
                <div>
                  <p className="text-green-600 font-medium">Credits: ₹{previewCredits.toFixed(2)}</p>
                  <p className="text-red-600 font-medium">Debits: ₹{previewDebits.toFixed(2)}</p>
                  <p className={`font-bold ${previewBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Net Balance: ₹{previewBalance.toFixed(2)}
                  </p>
                </div>
              </div>
              
              {previewContacts.slice(0, 3).map(contact => (
                <div key={contact.id} className="text-xs text-gray-500">
                  • {contact.name} ({contact.contact_type}) - {previewTransactions.filter(t => t.contact_id === contact.id).length} transactions
                </div>
              ))}
              {previewContacts.length > 3 && (
                <div className="text-xs text-gray-400">
                  ... and {previewContacts.length - 3} more accounts
                </div>
              )}
            </div>
          </div>

          {/* Export Button */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleExport}
              disabled={
                (reportType === 'individual' && !selectedContact) ||
                (reportType === 'filtered' && selectedTypes.length === 0) ||
                previewContacts.length === 0
              }
            >
              <Download className="h-4 w-4 mr-2" />
              Download {exportFormat.toUpperCase()}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountBookReports;
