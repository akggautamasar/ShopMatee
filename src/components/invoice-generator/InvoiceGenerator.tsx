
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Users, FilePlus, FileText, BarChart3, Settings, CreditCard, Boxes } from 'lucide-react';
import ProductManagementModule from './ProductManagementModule';
import CustomerManagementModule from './CustomerManagementModule';
import NewInvoiceModule from './NewInvoiceModule';
import InvoiceListModule from './InvoiceListModule';
import ReportsAnalyticsModule from './ReportsAnalyticsModule';
import PaymentsModule from './PaymentsModule';
import InventoryManagementModule from './InventoryManagementModule';
import InvoiceTemplatesModule from './InvoiceTemplatesModule';

const InvoiceGenerator = () => {
  const [activeTab, setActiveTab] = useState('products');

  return (
    <div className="p-2 sm:p-4">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">ShopMate Invoice Generator</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage products, customers, and generate invoices efficiently.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 md:grid-cols-8 mb-4 sm:mb-6 h-auto">
          <TabsTrigger value="products" className="flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
            <Package className="h-4 w-4" /> Products
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
            <Users className="h-4 w-4" /> Customers
          </TabsTrigger>
          <TabsTrigger value="new_invoice" className="flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
            <FilePlus className="h-4 w-4" /> New Invoice
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
            <FileText className="h-4 w-4" /> Invoices
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
            <BarChart3 className="h-4 w-4" /> Reports
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
            <CreditCard className="h-4 w-4" /> Payments
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
            <Boxes className="h-4 w-4" /> Inventory
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
            <Settings className="h-4 w-4" /> Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <ProductManagementModule />
        </TabsContent>
        <TabsContent value="customers">
          <CustomerManagementModule />
        </TabsContent>
        <TabsContent value="new_invoice">
          <NewInvoiceModule onInvoiceCreated={() => setActiveTab('invoices')} />
        </TabsContent>
        <TabsContent value="invoices">
          <InvoiceListModule />
        </TabsContent>
        <TabsContent value="reports">
          <ReportsAnalyticsModule />
        </TabsContent>
        <TabsContent value="payments">
          <PaymentsModule />
        </TabsContent>
        <TabsContent value="inventory">
          <InventoryManagementModule />
        </TabsContent>
        <TabsContent value="templates">
          <InvoiceTemplatesModule />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvoiceGenerator;
