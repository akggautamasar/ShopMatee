
import React from 'react';
import StaffList from '../components/StaffList';
import AttendanceTracker from '../components/AttendanceTracker';
import SalaryReport from '../components/SalaryReport';
import ProductManagement from '../components/ProductManagement';
import ProductEntries from '../components/ProductEntries';
import MonthlyReport from '../components/MonthlyReport';
import AccountBook from '../components/AccountBook';
import SubstitutionSystem from '../components/SubstitutionSystem';
import InvoiceGenerator from '../components/invoice-generator/InvoiceGenerator';
import { Users, Clock, BarChart3, Package, FilePlus, Boxes, Book, Replace, Briefcase, LucideIcon } from 'lucide-react';

export type ViewKey = 'staff' | 'attendance' | 'salary' | 'products' | 'entries' | 'inventory' | 'accountbook' | 'substitution' | 'invoice_generator';

export const views: Record<ViewKey, { component: JSX.Element; title: string; icon: LucideIcon }> = {
  staff: { component: <StaffList />, title: "Staff", icon: Users },
  attendance: { component: <AttendanceTracker />, title: "Attendance", icon: Clock },
  salary: { component: <SalaryReport />, title: "Reports", icon: BarChart3 },
  products: { component: <ProductManagement />, title: "Products", icon: Package },
  entries: { component: <ProductEntries />, title: "Entries", icon: FilePlus },
  inventory: { component: <MonthlyReport />, title: "Inventory", icon: Boxes },
  accountbook: { component: <AccountBook />, title: "AccountBook", icon: Book },
  substitution: { component: <SubstitutionSystem />, title: "Substitution", icon: Replace },
  invoice_generator: { component: <InvoiceGenerator />, title: "Invoice Gen", icon: Briefcase },
};
