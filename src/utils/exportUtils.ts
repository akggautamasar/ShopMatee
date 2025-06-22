import { Staff } from '../context/StaffContext';
import { SalaryCalculation } from './salaryUtils';
import { format } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';

interface SalaryReportData {
  staff: Staff;
  presentDays: number;
  halfDays: number;
  absentDays: number;
  totalSalary: number;
}

interface InventoryReportItem {
  productName: string;
  totalQuantity: number;
  unit: string;
  entries: {
    quantity: number;
    receivedDate: string;
    source: string;
    remark?: string;
  }[];
}

type InvoiceDetails = Tables<'ig_invoices'> & {
  ig_customers: Tables<'ig_customers'> | null;
  ig_invoice_items: Tables<'ig_invoice_items'>[];
};

// Convert image to base64 for embedding in PDF exports
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

// Helper function to download HTML file directly
const downloadHTMLFile = (htmlContent: string, filename: string) => {
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.replace('.pdf', '.html');
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Helper function to download PDF directly using print
const downloadPDFFile = (htmlContent: string, filename: string) => {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    const pdfSpecificHTML = htmlContent.replace(
      '<style>',
      '<style>@media print { body { margin: 0; } @page { margin: 1cm; size: A4; } }'
    );
    
    printWindow.document.write(pdfSpecificHTML);
    printWindow.document.close();
    printWindow.focus();
    
    // Auto-trigger print dialog for PDF save
    setTimeout(() => {
      printWindow.print();
      setTimeout(() => {
        printWindow.close();
      }, 1000);
    }, 500);
  }
};

// Inventory export functions
export const generateInventoryCSV = (data: InventoryReportItem[], monthYear: string) => {
  const headers = [
    'Product Name',
    'Total Quantity',
    'Unit',
    'Received Date',
    'Quantity Received',
    'Source',
    'Remarks'
  ];

  const csvRows = [];
  csvRows.push(headers.join(','));

  data.forEach(item => {
    item.entries.forEach(entry => {
      csvRows.push([
        `"${item.productName}"`,
        item.totalQuantity,
        `"${item.unit}"`,
        entry.receivedDate,
        entry.quantity,
        `"${entry.source}"`,
        `"${entry.remark || ''}"`
      ].join(','));
    });
  });

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory-report-${monthYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const generateInventoryPDF = async (data: InventoryReportItem[], monthYear: string) => {
  const [year, month] = monthYear.split('-');
  const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  const logoBase64 = await getLogoBase64();
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Inventory Report - ${monthName}</title>
      <style>
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
          @page { margin: 1cm; }
        }
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { width: 80px; height: 80px; margin: 0 auto 15px; display: block; }
        .company-name { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 5px; }
        .report-title { font-size: 18px; margin: 10px 0; }
        .report-period { font-size: 14px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; font-size: 12px; }
        th { background-color: #f8f9fa; font-weight: bold; }
        .number { text-align: right; }
        .product-header { font-weight: bold; background-color: #f0f9ff; }
        .summary { margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px; }
        .summary-item { display: inline-block; margin-right: 30px; }
        .summary-label { font-weight: bold; color: #666; }
        .summary-value { font-size: 18px; color: #2563eb; }
      </style>
    </head>
    <body>
      <div class="header">
        ${logoBase64 ? `<img src="${logoBase64}" alt="Logo" class="logo" />` : ''}
        <div class="company-name">Inventory Management by WorksBeyond</div>
        <div class="report-title">Monthly Inventory Report</div>
        <div class="report-period">${monthName}</div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Total Quantity</th>
            <th>Unit</th>
            <th>Received Date</th>
            <th class="number">Quantity Received</th>
            <th>Source</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(item => `
            ${item.entries.map((entry, index) => `
              <tr ${index === 0 ? 'class="product-header"' : ''}>
                <td>${index === 0 ? item.productName : ''}</td>
                <td>${index === 0 ? item.totalQuantity + ' ' + item.unit : ''}</td>
                <td>${index === 0 ? item.unit : ''}</td>
                <td>${entry.receivedDate}</td>
                <td class="number">${entry.quantity}</td>
                <td>${entry.source}</td>
                <td>${entry.remark || ''}</td>
              </tr>
            `).join('')}
          `).join('')}
        </tbody>
      </table>
      
      <div class="summary">
        <div class="summary-item">
          <div class="summary-label">Total Products:</div>
          <div class="summary-value">${data.length}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Total Entries:</div>
          <div class="summary-value">${data.reduce((sum, item) => sum + item.entries.length, 0)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Generated on:</div>
          <div class="summary-value">${new Date().toLocaleDateString()}</div>
        </div>
      </div>
    </body>
    </html>
  `;

  downloadPDFFile(htmlContent, `inventory-report-${monthYear}.pdf`);
};

export const generateInventoryHTML = async (data: InventoryReportItem[], monthYear: string) => {
  const [year, month] = monthYear.split('-');
  const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  const logoBase64 = await getLogoBase64();
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Inventory Report - ${monthName}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f9fafb; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { width: 80px; height: 80px; margin: 0 auto 15px; display: block; }
        .company-name { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 5px; }
        .report-title { font-size: 18px; margin: 10px 0; }
        .report-period { font-size: 14px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
        th { background-color: #f3f4f6; font-weight: bold; }
        .number { text-align: right; }
        .product-header { font-weight: bold; background-color: #dbeafe; }
        .summary { margin-top: 30px; padding: 20px; background-color: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .summary-item { display: inline-block; margin-right: 30px; }
        .summary-label { font-weight: bold; color: #666; }
        .summary-value { font-size: 18px; color: #2563eb; }
      </style>
    </head>
    <body>
      <div class="header">
        ${logoBase64 ? `<img src="${logoBase64}" alt="Logo" class="logo" />` : ''}
        <div class="company-name">Inventory Management by WorksBeyond</div>
        <div class="report-title">Monthly Inventory Report</div>
        <div class="report-period">${monthName}</div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Total Quantity</th>
            <th>Unit</th>
            <th>Received Date</th>
            <th class="number">Quantity Received</th>
            <th>Source</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(item => `
            ${item.entries.map((entry, index) => `
              <tr ${index === 0 ? 'class="product-header"' : ''}>
                <td>${index === 0 ? item.productName : ''}</td>
                <td>${index === 0 ? item.totalQuantity + ' ' + item.unit : ''}</td>
                <td>${index === 0 ? item.unit : ''}</td>
                <td>${entry.receivedDate}</td>
                <td class="number">${entry.quantity}</td>
                <td>${entry.source}</td>
                <td>${entry.remark || ''}</td>
              </tr>
            `).join('')}
          `).join('')}
        </tbody>
      </table>
      
      <div class="summary">
        <div class="summary-item">
          <div class="summary-label">Total Products:</div>
          <div class="summary-value">${data.length}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Total Entries:</div>
          <div class="summary-value">${data.reduce((sum, item) => sum + item.entries.length, 0)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Generated on:</div>
          <div class="summary-value">${new Date().toLocaleDateString()}</div>
        </div>
      </div>
    </body>
    </html>
  `;

  downloadHTMLFile(htmlContent, `inventory-report-${monthYear}.html`);
};

export const generateCSV = (data: SalaryReportData[], monthYear: string) => {
  const headers = [
    'S.No',
    'Staff Name',
    'Daily Wage (₹)',
    'Present Days',
    'Half Days',
    'Absent Days',
    'Total Salary (₹)'
  ];

  const csvContent = [
    headers.join(','),
    ...data.map((row, index) => [
      index + 1,
      `"${row.staff.name}"`,
      row.staff.dailyWage,
      row.presentDays,
      row.halfDays,
      row.absentDays,
      row.totalSalary.toFixed(2)
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `salary-report-${monthYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const generatePDF = async (data: SalaryReportData[], monthYear: string) => {
  const [year, month] = monthYear.split('-');
  const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  const logoBase64 = await getLogoBase64();
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Salary Report - ${monthName}</title>
      <style>
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
          @page { margin: 1cm; }
        }
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { width: 80px; height: 80px; margin: 0 auto 15px; display: block; }
        .company-name { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 5px; }
        .report-title { font-size: 18px; margin: 10px 0; }
        .report-period { font-size: 14px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: bold; }
        .number { text-align: right; }
        .total-row { font-weight: bold; background-color: #f0f9ff; }
        .summary { margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px; }
        .summary-item { display: inline-block; margin-right: 30px; }
        .summary-label { font-weight: bold; color: #666; }
        .summary-value { font-size: 18px; color: #2563eb; }
      </style>
    </head>
    <body>
      <div class="header">
        ${logoBase64 ? `<img src="${logoBase64}" alt="Logo" class="logo" />` : ''}
        <div class="company-name">Salary Management by WorksBeyond</div>
        <div class="report-title">Monthly Salary Report</div>
        <div class="report-period">${monthName}</div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Staff Name</th>
            <th class="number">Daily Wage (₹)</th>
            <th class="number">Present Days</th>
            <th class="number">Half Days</th>
            <th class="number">Absent Days</th>
            <th class="number">Total Salary (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${data.map((row, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${row.staff.name}</td>
              <td class="number">${row.staff.dailyWage}</td>
              <td class="number">${row.presentDays}</td>
              <td class="number">${row.halfDays}</td>
              <td class="number">${row.absentDays}</td>
              <td class="number">₹${row.totalSalary.toFixed(2)}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="2"><strong>Total</strong></td>
            <td class="number">-</td>
            <td class="number"><strong>${data.reduce((sum, row) => sum + row.presentDays, 0)}</strong></td>
            <td class="number"><strong>${data.reduce((sum, row) => sum + row.halfDays, 0)}</strong></td>
            <td class="number"><strong>${data.reduce((sum, row) => sum + row.absentDays, 0)}</strong></td>
            <td class="number"><strong>₹${data.reduce((sum, row) => sum + row.totalSalary, 0).toFixed(2)}</strong></td>
          </tr>
        </tbody>
      </table>
      
      <div class="summary">
        <div class="summary-item">
          <div class="summary-label">Total Staff:</div>
          <div class="summary-value">${data.length}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Total Salary:</div>
          <div class="summary-value">₹${data.reduce((sum, row) => sum + row.totalSalary, 0).toFixed(2)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Generated on:</div>
          <div class="summary-value">${new Date().toLocaleDateString()}</div>
        </div>
      </div>
    </body>
    </html>
  `;

  downloadPDFFile(htmlContent, `salary-report-${monthYear}.pdf`);
};

export const generateHTML = async (data: SalaryReportData[], monthYear: string) => {
  const [year, month] = monthYear.split('-');
  const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  const logoBase64 = await getLogoBase64();
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Salary Report - ${monthName}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f9fafb; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { width: 80px; height: 80px; margin: 0 auto 15px; display: block; }
        .company-name { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 5px; }
        .report-title { font-size: 18px; margin: 10px 0; }
        .report-period { font-size: 14px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background-color: #f3f4f6; font-weight: bold; color: #374151; }
        .number { text-align: right; }
        .total-row { font-weight: bold; background-color: #dbeafe; }
        .summary { margin-top: 30px; padding: 20px; background-color: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .summary-item { display: inline-block; margin-right: 30px; }
        .summary-label { font-weight: bold; color: #666; }
        .summary-value { font-size: 18px; color: #2563eb; }
      </style>
    </head>
    <body>
      <div class="header">
        ${logoBase64 ? `<img src="${logoBase64}" alt="Logo" class="logo" />` : ''}
        <div class="company-name">Salary Management by WorksBeyond</div>
        <div class="report-title">Monthly Salary Report</div>
        <div class="report-period">${monthName}</div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Staff Name</th>
            <th class="number">Daily Wage (₹)</th>
            <th class="number">Present Days</th>
            <th class="number">Half Days</th>
            <th class="number">Absent Days</th>
            <th class="number">Total Salary (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${data.map((row, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${row.staff.name}</td>
              <td class="number">${row.staff.dailyWage}</td>
              <td class="number">${row.presentDays}</td>
              <td class="number">${row.halfDays}</td>
              <td class="number">${row.absentDays}</td>
              <td class="number">₹${row.totalSalary.toFixed(2)}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="2"><strong>Total</strong></td>
            <td class="number">-</td>
            <td class="number"><strong>${data.reduce((sum, row) => sum + row.presentDays, 0)}</strong></td>
            <td class="number"><strong>${data.reduce((sum, row) => sum + row.halfDays, 0)}</strong></td>
            <td class="number"><strong>${data.reduce((sum, row) => sum + row.absentDays, 0)}</strong></td>
            <td class="number"><strong>₹${data.reduce((sum, row) => sum + row.totalSalary, 0).toFixed(2)}</strong></td>
          </tr>
        </tbody>
      </table>
      
      <div class="summary">
        <div class="summary-item">
          <div class="summary-label">Total Staff:</div>
          <div class="summary-value">${data.length}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Total Salary:</div>
          <div class="summary-value">₹${data.reduce((sum, row) => sum + row.totalSalary, 0).toFixed(2)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Generated on:</div>
          <div class="summary-value">${new Date().toLocaleDateString()}</div>
        </div>
      </div>
    </body>
    </html>
  `;

  downloadHTMLFile(htmlContent, `salary-report-${monthYear}.html`);
};

export const exportDailySubstitutionsPDF = async (
  date: string,
  substitutions: any[],
  timeSlots: string[]
) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Daily Substitution Record - ${date}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .school-name { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 5px; }
        .branding { font-size: 14px; color: #666; margin-bottom: 10px; }
        .document-title { font-size: 20px; margin: 10px 0; }
        .date-info { font-size: 16px; color: #666; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px; }
        th, td { padding: 8px; text-align: center; border: 1px solid #333; }
        th { background-color: #f0f9ff; font-weight: bold; }
        .serial { width: 40px; }
        .teacher-name { text-align: left; }
        .substitute { color: #059669; font-weight: 500; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="school-name">Substitution Management by WorksBeyond</div>
        <div class="branding">WorksBeyond</div>
        <div class="document-title">Daily Substitution Record</div>
        <div class="date-info">Date: ${date} (${new Date(date).toLocaleDateString('en-US', { weekday: 'long' })})</div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th class="serial">S.No</th>
            <th>Absent Teacher</th>
            <th>Period</th>
            <th>Time</th>
            <th>Original Class</th>
            <th>Original Subject</th>
            <th>Substitute Teacher</th>
          </tr>
        </thead>
        <tbody>
          ${substitutions.map((sub, index) => {
            const periodIndex = parseInt(sub.period) - 1;
            const timeSlot = timeSlots[periodIndex] || '';
            
            return `
              <tr>
                <td class="serial">${index + 1}</td>
                <td class="teacher-name">${sub.absentTeacher}</td>
                <td>${sub.period}</td>
                <td>${timeSlot}</td>
                <td>${sub.originalClass}</td>
                <td>${sub.originalSubject}</td>
                <td class="substitute">${sub.substituteTeacher}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <p><strong>Instructions:</strong></p>
        <ul>
          <li>All substitute teachers must report to their assigned classes on time.</li>
          <li>Original lesson plans should be followed where possible.</li>
          <li>Any issues should be reported to the administration immediately.</li>
        </ul>
        <p>Generated on: ${new Date().toLocaleString()} | Total Substitutions: ${substitutions.length}</p>
      </div>
    </body>
    </html>
  `;

  downloadPDFFile(htmlContent, `daily-substitutions-${date}.pdf`);
};

export const exportDailySubstitutionsHTML = async (
  date: string,
  substitutions: any[],
  timeSlots: string[]
) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Daily Substitution Record - ${date}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f9fafb; }
        .header { text-align: center; margin-bottom: 30px; }
        .school-name { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 5px; }
        .branding { font-size: 14px; color: #666; margin-bottom: 10px; }
        .document-title { font-size: 20px; margin: 10px 0; }
        .date-info { font-size: 16px; color: #666; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        th, td { padding: 8px; text-align: center; border-bottom: 1px solid #e5e7eb; }
        th { background-color: #f3f4f6; font-weight: bold; }
        .serial { width: 40px; }
        .teacher-name { text-align: left; }
        .substitute { color: #059669; font-weight: 500; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="school-name">Substitution Management by WorksBeyond</div>
        <div class="branding">WorksBeyond</div>
        <div class="document-title">Daily Substitution Record</div>
        <div class="date-info">Date: ${date} (${new Date(date).toLocaleDateString('en-US', { weekday: 'long' })})</div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th class="serial">S.No</th>
            <th>Absent Teacher</th>
            <th>Period</th>
            <th>Time</th>
            <th>Original Class</th>
            <th>Original Subject</th>
            <th>Substitute Teacher</th>
          </tr>
        </thead>
        <tbody>
          ${substitutions.map((sub, index) => {
            const periodIndex = parseInt(sub.period) - 1;
            const timeSlot = timeSlots[periodIndex] || '';
            
            return `
              <tr>
                <td class="serial">${index + 1}</td>
                <td class="teacher-name">${sub.absentTeacher}</td>
                <td>${sub.period}</td>
                <td>${timeSlot}</td>
                <td>${sub.originalClass}</td>
                <td>${sub.originalSubject}</td>
                <td class="substitute">${sub.substituteTeacher}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <p><strong>Instructions:</strong></p>
        <ul>
          <li>All substitute teachers must report to their assigned classes on time.</li>
          <li>Original lesson plans should be followed where possible.</li>
          <li>Any issues should be reported to the administration immediately.</li>
        </ul>
        <p>Generated on: ${new Date().toLocaleString()} | Total Substitutions: ${substitutions.length}</p>
      </div>
    </body>
    </html>
  `;

  downloadHTMLFile(htmlContent, `daily-substitutions-${date}.html`);
};

export const exportMonthlySubstitutionPDF = async (
  substitutionsByDate: [string, any[]][],
  teacherStats: any[],
  filteredSubstitutions: any[],
  selectedMonth: string,
  timeSlots: string[]
) => {
  const monthName = selectedMonth ? new Date(selectedMonth + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'All Time';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Monthly Substitution Report - ${monthName}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .school-name { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 5px; }
        .branding { font-size: 14px; color: #666; margin-bottom: 10px; }
        .document-title { font-size: 20px; margin: 10px 0; }
        .period-info { font-size: 16px; color: #666; margin-bottom: 20px; }
        .summary-stats { display: flex; justify-content: space-around; margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 8px; }
        .stat-item { text-align: center; }
        .stat-number { font-size: 24px; font-weight: bold; color: #2563eb; }
        .stat-label { font-size: 12px; color: #666; }
        .section-title { font-size: 18px; font-weight: bold; margin: 30px 0 15px 0; color: #333; border-bottom: 2px solid #2563eb; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 11px; }
        th, td { padding: 6px; text-align: center; border: 1px solid #333; }
        th { background-color: #f0f9ff; font-weight: bold; }
        .serial { width: 40px; }
        .teacher-name { text-align: left; }
        .substitute { color: #059669; font-weight: 500; }
        .date-header { background-color: #e0f2fe; font-weight: bold; font-size: 12px; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; page-break-inside: avoid; }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
          .section-title { page-break-after: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="school-name">Substitution Management by WorksBeyond</div>
        <div class="branding">WorksBeyond</div>
        <div class="document-title">Monthly Substitution Report</div>
        <div class="period-info">Period: ${monthName}</div>
      </div>
      
      <div class="summary-stats">
        <div class="stat-item">
          <div class="stat-number">${filteredSubstitutions.length}</div>
          <div class="stat-label">Total Substitutions</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${teacherStats.length}</div>
          <div class="stat-label">Active Teachers</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${substitutionsByDate.length}</div>
          <div class="stat-label">Days with Substitutions</div>
        </div>
      </div>

      <div class="section-title">Teacher Statistics</div>
      <table>
        <thead>
          <tr>
            <th class="serial">S.No</th>
            <th>Teacher Name</th>
            <th>Total Periods</th>
            <th>Total Hours</th>
            <th>Days Worked</th>
            <th>Avg Periods/Day</th>
          </tr>
        </thead>
        <tbody>
          ${teacherStats.map((stat, index) => `
            <tr>
              <td class="serial">${index + 1}</td>
              <td class="teacher-name">${stat.teacher}</td>
              <td>${stat.periods}</td>
              <td>${stat.hours}</td>
              <td>${stat.days}</td>
              <td>${stat.days > 0 ? (stat.periods / stat.days).toFixed(1) : '0'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="section-title">Daily Substitution Records</div>
      ${substitutionsByDate.map(([date, subs]) => {
        const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
        return `
          <div style="margin-bottom: 20px;">
            <div class="date-header" style="padding: 10px; margin: 10px 0 5px 0;">
              ${date} (${dayOfWeek}) - ${subs.length} substitution(s)
            </div>
            <table>
              <thead>
                <tr>
                  <th class="serial">S.No</th>
                  <th>Absent Teacher</th>
                  <th>Period</th>
                  <th>Time</th>
                  <th>Class</th>
                  <th>Subject</th>
                  <th>Substitute Teacher</th>
                </tr>
              </thead>
              <tbody>
                ${subs.map((sub, index) => {
                  const periodIndex = parseInt(sub.period) - 1;
                  const timeSlot = timeSlots[periodIndex] || '';
                  
                  return `
                    <tr>
                      <td class="serial">${index + 1}</td>
                      <td class="teacher-name">${sub.absentTeacher}</td>
                      <td>${sub.period}</td>
                      <td>${timeSlot}</td>
                      <td>${sub.originalClass}</td>
                      <td>${sub.originalSubject}</td>
                      <td class="substitute">${sub.substituteTeacher}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `;
      }).join('')}
      
      <div class="footer">
        <p><strong>Report Summary:</strong></p>
        <ul>
          <li>Total substitutions recorded: ${filteredSubstitutions.length}</li>
          <li>Number of substitute teachers involved: ${teacherStats.length}</li>
          <li>Reporting period: ${monthName}</li>
        </ul>
        <p>Generated on: ${new Date().toLocaleString()} | Substitution Management by WorksBeyond</p>
      </div>
    </body>
    </html>
  `;

  downloadPDFFile(htmlContent, `monthly-substitution-report-${selectedMonth}.pdf`);
};

export const exportMonthlySubstitutionHTML = async (
  substitutionsByDate: [string, any[]][],
  teacherStats: any[],
  filteredSubstitutions: any[],
  selectedMonth: string,
  timeSlots: string[]
) => {
  const monthName = selectedMonth ? new Date(selectedMonth + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'All Time';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Monthly Substitution Report - ${monthName}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f9fafb; }
        .header { text-align: center; margin-bottom: 30px; }
        .school-name { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 5px; }
        .branding { font-size: 14px; color: #666; margin-bottom: 10px; }
        .document-title { font-size: 20px; margin: 10px 0; }
        .period-info { font-size: 16px; color: #666; margin-bottom: 20px; }
        .summary-stats { display: flex; justify-content: space-around; margin: 20px 0; padding: 15px; background-color: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .stat-item { text-align: center; }
        .stat-number { font-size: 24px; font-weight: bold; color: #2563eb; }
        .stat-label { font-size: 12px; color: #666; }
        .section-title { font-size: 18px; font-weight: bold; margin: 30px 0 15px 0; color: #333; border-bottom: 2px solid #2563eb; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 11px; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        th, td { padding: 6px; text-align: center; border-bottom: 1px solid #e5e7eb; }
        th { background-color: #f3f4f6; font-weight: bold; }
        .serial { width: 40px; }
        .teacher-name { text-align: left; }
        .substitute { color: #059669; font-weight: 500; }
        .date-header { background-color: #e0f2fe; font-weight: bold; font-size: 12px; padding: 10px; margin: 10px 0 5px 0; border-radius: 4px; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="school-name">Substitution Management by WorksBeyond</div>
        <div class="branding">WorksBeyond</div>
        <div class="document-title">Monthly Substitution Report</div>
        <div class="period-info">Period: ${monthName}</div>
      </div>
      
      <div class="summary-stats">
        <div class="stat-item">
          <div class="stat-number">${filteredSubstitutions.length}</div>
          <div class="stat-label">Total Substitutions</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${teacherStats.length}</div>
          <div class="stat-label">Active Teachers</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${substitutionsByDate.length}</div>
          <div class="stat-label">Days with Substitutions</div>
        </div>
      </div>

      <div class="section-title">Teacher Statistics</div>
      <table>
        <thead>
          <tr>
            <th class="serial">S.No</th>
            <th>Teacher Name</th>
            <th>Total Periods</th>
            <th>Total Hours</th>
            <th>Days Worked</th>
            <th>Avg Periods/Day</th>
          </tr>
        </thead>
        <tbody>
          ${teacherStats.map((stat, index) => `
            <tr>
              <td class="serial">${index + 1}</td>
              <td class="teacher-name">${stat.teacher}</td>
              <td>${stat.periods}</td>
              <td>${stat.hours}</td>
              <td>${stat.days}</td>
              <td>${stat.days > 0 ? (stat.periods / stat.days).toFixed(1) : '0'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="section-title">Daily Substitution Records</div>
      ${substitutionsByDate.map(([date, subs]) => {
        const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
        return `
          <div style="margin-bottom: 20px;">
            <div class="date-header">
              ${date} (${dayOfWeek}) - ${subs.length} substitution(s)
            </div>
            <table>
              <thead>
                <tr>
                  <th class="serial">S.No</th>
                  <th>Absent Teacher</th>
                  <th>Period</th>
                  <th>Time</th>
                  <th>Class</th>
                  <th>Subject</th>
                  <th>Substitute Teacher</th>
                </tr>
              </thead>
              <tbody>
                ${subs.map((sub, index) => {
                  const periodIndex = parseInt(sub.period) - 1;
                  const timeSlot = timeSlots[periodIndex] || '';
                  
                  return `
                    <tr>
                      <td class="serial">${index + 1}</td>
                      <td class="teacher-name">${sub.absentTeacher}</td>
                      <td>${sub.period}</td>
                      <td>${timeSlot}</td>
                      <td>${sub.originalClass}</td>
                      <td>${sub.originalSubject}</td>
                      <td class="substitute">${sub.substituteTeacher}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `;
      }).join('')}
      
      <div class="footer">
        <p><strong>Report Summary:</strong></p>
        <ul>
          <li>Total substitutions recorded: ${filteredSubstitutions.length}</li>
          <li>Number of substitute teachers involved: ${teacherStats.length}</li>
          <li>Reporting period: ${monthName}</li>
        </ul>
        <p>Generated on: ${new Date().toLocaleString()} | Substitution Management by WorksBeyond</p>
      </div>
    </body>
    </html>
  `;

  downloadHTMLFile(htmlContent, `monthly-substitution-report-${selectedMonth}.html`);
};

export const generateInvoicePDF = async (invoice: InvoiceDetails) => {
  const logoBase64 = await getLogoBase64();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice #${invoice.invoice_number}</title>
      <style>
        body { font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; font-size: 12px; color: #555; }
        .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .header-left { flex: 1; }
        .logo { width: 80px; height: auto; }
        .company-details { text-align: right; }
        .company-details h2 { font-size: 20px; margin: 0 0 5px 0; color: #333; }
        .invoice-details { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .bill-to p { margin: 2px 0; }
        .invoice-meta { text-align: right; }
        .invoice-meta p { margin: 2px 0; }
        .invoice-meta span { font-weight: bold; }
        table { width: 100%; line-height: inherit; text-align: left; border-collapse: collapse; }
        table td { padding: 8px; vertical-align: top; }
        table th { padding: 8px; background: #eee; border-bottom: 1px solid #ddd; font-weight: bold; text-align: left; }
        table td:nth-child(2), table th:nth-child(2) { text-align: center; }
        table td:nth-child(3), table th:nth-child(3), table td:nth-child(4), table th:nth-child(4) { text-align: right; }
        table tr.item td { border-bottom: 1px solid #eee; }
        .totals { margin-top: 20px; float: right; width: 250px; }
        .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
        .totals .grand-total { font-size: 1.2em; font-weight: bold; border-top: 2px solid #eee; padding-top: 5px; }
        .notes, .terms { margin-top: 30px; padding-top: 10px; border-top: 1px solid #eee; font-size: 11px; color: #777; clear: both; }
        @media print {
          body { margin: 0; }
          .invoice-box { box-shadow: none; border: none; padding: 10px; }
          @page { margin: 1cm; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        <div class="header">
          <div class="header-left">
            ${logoBase64 ? `<img src="${logoBase64}" alt="Logo" class="logo" />` : '<h2>Your Company Name</h2>'}
            <p>123 Business Rd, City, State 12345</p>
          </div>
          <div class="company-details">
            <h2>INVOICE</h2>
            <p>#${invoice.invoice_number}</p>
          </div>
        </div>

        <div class="invoice-details">
          <div>
            <p><strong>Billed To:</strong></p>
            <p>${invoice.ig_customers?.name || ''}</p>
            <p>${invoice.ig_customers?.billing_address || ''}</p>
            <p>${invoice.ig_customers?.email || ''}</p>
            <p>${invoice.ig_customers?.contact_number || ''}</p>
          </div>
          <div class="invoice-meta">
            <p><span>Invoice Date:</span> ${format(new Date(invoice.invoice_date), 'PPP')}</p>
            ${invoice.due_date ? `<p><span>Due Date:</span> ${format(new Date(invoice.due_date), 'PPP')}</p>` : ''}
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
          ${invoice.ig_invoice_items.map(item => `
            <tr class="item">
              <td>${item.item_description}</td>
              <td>${item.quantity}</td>
              <td>₹${Number(item.rate).toFixed(2)}</td>
              <td>₹${(Number(item.quantity) * Number(item.rate)).toFixed(2)}</td>
            </tr>
          `).join('')}
          </tbody>
        </table>

        <div style="clear: both;"></div>
        <div class="totals">
          <div><span>Subtotal</span> <span>₹${Number(invoice.subtotal).toFixed(2)}</span></div>
          <div><span>Tax</span> <span>₹${Number(invoice.total_tax_amount).toFixed(2)}</span></div>
          <div class="grand-total"><span>Grand Total</span> <span>₹${Number(invoice.grand_total).toFixed(2)}</span></div>
        </div>

        ${invoice.notes ? `<div class="notes"><strong>Notes:</strong><br>${invoice.notes}</div>` : ''}
        ${invoice.terms_and_conditions ? `<div class="terms"><strong>Terms & Conditions:</strong><br>${invoice.terms_and_conditions}</div>` : ''}
      </div>
    </body>
    </html>
  `;

  downloadPDFFile(htmlContent, `invoice-${invoice.invoice_number}.pdf`);
};
