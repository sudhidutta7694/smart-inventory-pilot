
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Product {
  id: string;
  product_name: string;
  sku: string;
  category: string;
  stock_level: number;
  reorder_point: number;
  forecast_demand: number;
  zone: string;
  supplier: string;
  unit_cost: number;
  demand_trend: string;
  last_replenished: string;
  warehouse: string;
  created_at?: string;
  updated_at?: string;
}

interface InventoryContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  isLoading: boolean;
  refreshProducts: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  const fetchProducts = async () => {
    if (!isAuthenticated || !user) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('warehouse', user.warehouse)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        toast({
          title: "Error",
          description: "Failed to fetch inventory data",
          variant: "destructive"
        });
      } else {
        const mappedProducts = data?.map(item => ({
          id: item.id,
          product_name: item.product_name,
          sku: item.sku,
          category: item.category,
          stock_level: item.stock_level,
          reorder_point: item.reorder_point,
          forecast_demand: item.forecast_demand,
          zone: item.zone,
          supplier: item.supplier,
          unit_cost: Number(item.unit_cost),
          demand_trend: item.demand_trend,
          last_replenished: item.last_replenished,
          warehouse: item.warehouse,
          created_at: item.created_at,
          updated_at: item.updated_at
        })) || [];
        setProducts(mappedProducts);
      }
    } catch (error) {
      console.error('Error in fetchProducts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProducts = async () => {
    await fetchProducts();
  };

  useEffect(() => {
    fetchProducts();
  }, [isAuthenticated, user]);

  // Set up realtime subscription
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const channel = supabase
      .channel('inventory-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory',
          filter: `warehouse=eq.${user.warehouse}`
        },
        (payload) => {
          console.log('Inventory change received:', payload);
          fetchProducts(); // Refresh products on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, user]);

  const addProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('inventory')
        .insert([{
          product_name: productData.product_name,
          sku: productData.sku,
          category: productData.category,
          stock_level: productData.stock_level,
          reorder_point: productData.reorder_point,
          forecast_demand: productData.forecast_demand,
          zone: productData.zone,
          supplier: productData.supplier,
          unit_cost: productData.unit_cost,
          demand_trend: productData.demand_trend,
          last_replenished: productData.last_replenished,
          warehouse: user.warehouse
        }]);

      if (error) {
        console.error('Error adding product:', error);
        toast({
          title: "Error",
          description: "Failed to add product",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Product added successfully"
        });
      }
    } catch (error) {
      console.error('Error in addProduct:', error);
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive"
      });
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { error } = await supabase
        .from('inventory')
        .update({
          product_name: updates.product_name,
          sku: updates.sku,
          category: updates.category,
          stock_level: updates.stock_level,
          reorder_point: updates.reorder_point,
          forecast_demand: updates.forecast_demand,
          zone: updates.zone,
          supplier: updates.supplier,
          unit_cost: updates.unit_cost,
          demand_trend: updates.demand_trend,
          last_replenished: updates.last_replenished,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating product:', error);
        toast({
          title: "Error",
          description: "Failed to update product",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Product updated successfully"
        });
      }
    } catch (error) {
      console.error('Error in updateProduct:', error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive"
      });
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting product:', error);
        toast({
          title: "Error",
          description: "Failed to delete product",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Product deleted successfully"
        });
      }
    } catch (error) {
      console.error('Error in deleteProduct:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      });
    }
  };

  return (
    <InventoryContext.Provider value={{
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      isLoading,
      refreshProducts
    }}>
      {children}
    </InventoryContext.Provider>
  );
};
