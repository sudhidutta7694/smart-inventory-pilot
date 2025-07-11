import React, { createContext, useContext, useEffect } from 'react';
import { useSupplyChainStore, type Task } from '@/stores/supplyChainStore';
import { type Product } from '@/data/mockData';

interface EnhancedInventoryContextType {
  products: Product[];
  insights: any[];
  tasks: Task[];
  analytics: any;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  regenerateInsights: () => void;
  regenerateAnalytics: () => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'warehouse'>) => void;
  updateTaskStatus: (taskId: string, status: Task['status']) => void;
  deleteTask: (taskId: string) => void;
  isLoading: boolean;
}

const EnhancedInventoryContext = createContext<EnhancedInventoryContextType | undefined>(undefined);

export const useEnhancedInventory = () => {
  const context = useContext(EnhancedInventoryContext);
  if (!context) {
    throw new Error('useEnhancedInventory must be used within an EnhancedInventoryProvider');
  }
  return context;
};

export const EnhancedInventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    currentWarehouse,
    getWarehouseData,
    addProduct: storeAddProduct,
    updateProduct: storeUpdateProduct,
    deleteProduct: storeDeleteProduct,
    regenerateInsights: storeRegenerateInsights,
    regenerateAnalytics: storeRegenerateAnalytics,
    addTask: storeAddTask,
    updateTaskStatus: storeUpdateTaskStatus,
    deleteTask: storeDeleteTask,
    syncAllData
  } = useSupplyChainStore();
  
  const warehouseData = getWarehouseData(currentWarehouse);
  
  // Sync data when warehouse changes
  useEffect(() => {
    syncAllData();
  }, [currentWarehouse, syncAllData]);
  
  const addProduct = (product: Omit<Product, 'id'>) => {
    storeAddProduct(currentWarehouse, product);
  };
  
  const updateProduct = (id: string, updates: Partial<Product>) => {
    storeUpdateProduct(currentWarehouse, id, updates);
  };
  
  const deleteProduct = (id: string) => {
    storeDeleteProduct(currentWarehouse, id);
  };
  
  const regenerateInsights = () => {
    storeRegenerateInsights(currentWarehouse);
  };
  
  const regenerateAnalytics = () => {
    storeRegenerateAnalytics(currentWarehouse);
  };
  
  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'warehouse'>) => {
    storeAddTask(currentWarehouse, { ...task, warehouse: currentWarehouse });
  };
  
  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    storeUpdateTaskStatus(currentWarehouse, taskId, status);
  };
  
  const deleteTask = (taskId: string) => {
    storeDeleteTask(currentWarehouse, taskId);
  };
  
  return (
    <EnhancedInventoryContext.Provider value={{
      products: warehouseData.products,
      insights: warehouseData.insights,
      tasks: warehouseData.tasks,
      analytics: warehouseData.analytics,
      addProduct,
      updateProduct,
      deleteProduct,
      regenerateInsights,
      regenerateAnalytics,
      addTask,
      updateTaskStatus,
      deleteTask,
      isLoading: false
    }}>
      {children}
    </EnhancedInventoryContext.Provider>
  );
};