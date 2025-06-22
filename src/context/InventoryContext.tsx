import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

// Types
export interface Product {
  id: string;
  name: string;
  unit: string;
  createdAt: Date;
}

export interface ProductEntry {
  id: string;
  productId: string;
  receivedDate: string;
  quantity: number;
  source: string;
  remark?: string;
  createdAt: Date;
}

export interface ProductSummary {
  productName: string;
  unit: string;
  totalQuantity: number;
  remarks: string[];
  receivingDates: string[];
}

export interface DetailedProductEntry {
  quantity: number;
  receivedDate: string;
  source: string;
  remark?: string;
}

export interface DetailedProductSummary {
  productName: string;
  unit: string;
  totalQuantity: number;
  entries: DetailedProductEntry[];
  remarks: string[];
  receivingDates: string[];
}

interface InventoryState {
  products: Product[];
  entries: ProductEntry[];
  loading: boolean;
}

type InventoryAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'SET_ENTRIES'; payload: ProductEntry[] }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'ADD_ENTRY'; payload: ProductEntry }
  | { type: 'UPDATE_ENTRY'; payload: ProductEntry }
  | { type: 'DELETE_ENTRY'; payload: string };

const initialState: InventoryState = {
  products: [],
  entries: [],
  loading: false,
};

const inventoryReducer = (state: InventoryState, action: InventoryAction): InventoryState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'SET_ENTRIES':
      return { ...state, entries: action.payload };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p => p.id === action.payload.id ? action.payload : p),
      };
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(p => p.id !== action.payload),
        entries: state.entries.filter(e => e.productId !== action.payload),
      };
    case 'ADD_ENTRY':
      return { ...state, entries: [...state.entries, action.payload] };
    case 'UPDATE_ENTRY':
      return {
        ...state,
        entries: state.entries.map(e => e.id === action.payload.id ? action.payload : e),
      };
    case 'DELETE_ENTRY':
      return {
        ...state,
        entries: state.entries.filter(e => e.id !== action.payload),
      };
    default:
      return state;
  }
};

const InventoryContext = createContext<{
  state: InventoryState;
  dispatch: React.Dispatch<InventoryAction>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  addEntry: (entry: Omit<ProductEntry, 'id' | 'createdAt'>) => Promise<void>;
  updateEntry: (entry: ProductEntry) => Promise<void>;
  deleteEntry: (entryId: string) => Promise<void>;
  getMonthlyReport: (year: number, month: number) => ProductSummary[];
  getDetailedMonthlyReport: (year: number, month: number) => DetailedProductSummary[];
} | null>(null);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(inventoryReducer, initialState);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadProducts();
      loadEntries();
    } else {
      dispatch({ type: 'SET_PRODUCTS', payload: [] });
      dispatch({ type: 'SET_ENTRIES', payload: [] });
    }
  }, [user]);

  const loadProducts = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      const formattedProducts: Product[] = data.map(item => ({
        id: item.id,
        name: item.name,
        unit: item.unit,
        createdAt: new Date(item.created_at),
      }));

      dispatch({ type: 'SET_PRODUCTS', payload: formattedProducts });
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('product_entries')
        .select('*')
        .order('received_date', { ascending: false });

      if (error) throw error;

      const formattedEntries: ProductEntry[] = data.map(item => ({
        id: item.id,
        productId: item.product_id,
        receivedDate: item.received_date,
        quantity: parseFloat(item.quantity.toString()),
        source: item.source,
        remark: item.remark || undefined,
        createdAt: new Date(item.created_at),
      }));

      dispatch({ type: 'SET_ENTRIES', payload: formattedEntries });
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          user_id: user?.id,
          name: productData.name,
          unit: productData.unit,
        })
        .select()
        .single();

      if (error) throw error;

      const newProduct: Product = {
        id: data.id,
        name: data.name,
        unit: data.unit,
        createdAt: new Date(data.created_at),
      };

      dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: product.name,
          unit: product.unit,
          updated_at: new Date().toISOString(),
        })
        .eq('id', product.id);

      if (error) throw error;

      dispatch({ type: 'UPDATE_PRODUCT', payload: product });
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      dispatch({ type: 'DELETE_PRODUCT', payload: productId });
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const addEntry = async (entryData: Omit<ProductEntry, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('product_entries')
        .insert({
          user_id: user?.id,
          product_id: entryData.productId,
          received_date: entryData.receivedDate,
          quantity: entryData.quantity,
          source: entryData.source,
          remark: entryData.remark || null,
        })
        .select()
        .single();

      if (error) throw error;

      const newEntry: ProductEntry = {
        id: data.id,
        productId: data.product_id,
        receivedDate: data.received_date,
        quantity: parseFloat(data.quantity.toString()),
        source: data.source,
        remark: data.remark || undefined,
        createdAt: new Date(data.created_at),
      };

      dispatch({ type: 'ADD_ENTRY', payload: newEntry });
    } catch (error) {
      console.error('Error adding entry:', error);
      throw error;
    }
  };

  const updateEntry = async (entry: ProductEntry) => {
    try {
      const { error } = await supabase
        .from('product_entries')
        .update({
          product_id: entry.productId,
          received_date: entry.receivedDate,
          quantity: entry.quantity,
          source: entry.source,
          remark: entry.remark || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', entry.id);

      if (error) throw error;

      dispatch({ type: 'UPDATE_ENTRY', payload: entry });
    } catch (error) {
      console.error('Error updating entry:', error);
      throw error;
    }
  };

  const deleteEntry = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('product_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      dispatch({ type: 'DELETE_ENTRY', payload: entryId });
    } catch (error) {
      console.error('Error deleting entry:', error);
      throw error;
    }
  };

  const getMonthlyReport = (year: number, month: number): ProductSummary[] => {
    const filteredEntries = state.entries.filter(entry => {
      const entryDate = new Date(entry.receivedDate);
      return entryDate.getFullYear() === year && entryDate.getMonth() === month - 1;
    });

    const productSummaryMap = new Map<string, ProductSummary>();

    filteredEntries.forEach(entry => {
      const product = state.products.find(p => p.id === entry.productId);
      if (product) {
        const existing = productSummaryMap.get(product.id);
        if (existing) {
          existing.totalQuantity += entry.quantity;
          if (entry.remark) {
            existing.remarks.push(entry.remark);
          }
          existing.receivingDates.push(new Date(entry.receivedDate).toLocaleDateString());
        } else {
          productSummaryMap.set(product.id, {
            productName: product.name,
            unit: product.unit,
            totalQuantity: entry.quantity,
            remarks: entry.remark ? [entry.remark] : [],
            receivingDates: [new Date(entry.receivedDate).toLocaleDateString()],
          });
        }
      }
    });

    return Array.from(productSummaryMap.values());
  };

  const getDetailedMonthlyReport = (year: number, month: number): DetailedProductSummary[] => {
    const filteredEntries = state.entries.filter(entry => {
      const entryDate = new Date(entry.receivedDate);
      return entryDate.getFullYear() === year && entryDate.getMonth() === month - 1;
    });

    const productSummaryMap = new Map<string, DetailedProductSummary>();

    filteredEntries.forEach(entry => {
      const product = state.products.find(p => p.id === entry.productId);
      if (product) {
        const existing = productSummaryMap.get(product.id);
        if (existing) {
          existing.totalQuantity += entry.quantity;
          existing.entries.push({
            quantity: entry.quantity,
            receivedDate: entry.receivedDate,
            source: entry.source,
            remark: entry.remark,
          });
          if (entry.remark) {
            existing.remarks.push(entry.remark);
          }
          existing.receivingDates.push(new Date(entry.receivedDate).toLocaleDateString());
        } else {
          productSummaryMap.set(product.id, {
            productName: product.name,
            unit: product.unit,
            totalQuantity: entry.quantity,
            entries: [{
              quantity: entry.quantity,
              receivedDate: entry.receivedDate,
              source: entry.source,
              remark: entry.remark,
            }],
            remarks: entry.remark ? [entry.remark] : [],
            receivingDates: [new Date(entry.receivedDate).toLocaleDateString()],
          });
        }
      }
    });

    // Sort entries by date (most recent first) for each product
    Array.from(productSummaryMap.values()).forEach(product => {
      product.entries.sort((a, b) => new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime());
    });

    return Array.from(productSummaryMap.values());
  };

  return (
    <InventoryContext.Provider value={{
      state,
      dispatch,
      addProduct,
      updateProduct,
      deleteProduct,
      addEntry,
      updateEntry,
      deleteEntry,
      getMonthlyReport,
      getDetailedMonthlyReport,
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
