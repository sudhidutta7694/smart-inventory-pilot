
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { products as initialProducts, type Product } from '@/data/mockData';

interface InventoryContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  refreshProducts: () => void;
  isLoading: boolean;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

const STORAGE_KEY = 'supplychain_inventory';

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load products from localStorage or use initial data
  const loadProducts = useCallback(() => {
    setIsLoading(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedProducts = JSON.parse(stored);
        setProducts(parsedProducts);
      } else {
        // Initialize with mock data
        setProducts(initialProducts);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProducts));
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts(initialProducts);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save products to localStorage
  const saveProducts = useCallback((newProducts: Product[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProducts));
      setProducts(newProducts);
      
      // Dispatch custom event for cross-component sync
      window.dispatchEvent(new CustomEvent('inventoryUpdated', { 
        detail: { products: newProducts } 
      }));
    } catch (error) {
      console.error('Error saving products:', error);
    }
  }, []);

  // Add new product
  const addProduct = useCallback((productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `SKU${String(Date.now()).slice(-6)}`, // Generate unique ID
    };
    
    const updatedProducts = [...products, newProduct];
    saveProducts(updatedProducts);
  }, [products, saveProducts]);

  // Update existing product
  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    const updatedProducts = products.map(product =>
      product.id === id ? { ...product, ...updates } : product
    );
    saveProducts(updatedProducts);
  }, [products, saveProducts]);

  // Delete product
  const deleteProduct = useCallback((id: string) => {
    const updatedProducts = products.filter(product => product.id !== id);
    saveProducts(updatedProducts);
  }, [products, saveProducts]);

  // Refresh products (for real-time sync)
  const refreshProducts = useCallback(() => {
    loadProducts();
  }, [loadProducts]);

  // Listen for storage changes from other tabs/components
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const newProducts = JSON.parse(e.newValue);
          setProducts(newProducts);
        } catch (error) {
          console.error('Error parsing storage change:', error);
        }
      }
    };

    const handleInventoryUpdate = (e: CustomEvent) => {
      if (e.detail?.products) {
        setProducts(e.detail.products);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('inventoryUpdated', handleInventoryUpdate as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('inventoryUpdated', handleInventoryUpdate as EventListener);
    };
  }, []);

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return (
    <InventoryContext.Provider value={{
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      refreshProducts,
      isLoading
    }}>
      {children}
    </InventoryContext.Provider>
  );
};
