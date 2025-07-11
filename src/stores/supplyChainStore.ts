import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { products as initialProducts, insights as initialInsights, metricsData as initialMetrics, type Product, type Insight, type MetricData } from '@/data/mockData';

// Enhanced interfaces for the reactive system
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  warehouse: string;
  dueDate?: string;
  type: 'reorder' | 'reroute' | 'inspection' | 'maintenance' | 'urgent';
  relatedProductId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Analytics {
  inventoryTurnover: number[];
  categoryDistribution: { name: string; value: number; }[];
  orderVolumes: { date: string; orders: number; }[];
  stockoutTimeline: { date: string; stockouts: number; overstock: number; }[];
  forecastAccuracy: number;
  lastUpdated: string;
}

export interface WarehouseState {
  products: Product[];
  insights: Insight[];
  tasks: Task[];
  analytics: Analytics;
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    targetWarehouse: string;
  }>;
}

interface SupplyChainStore {
  // Warehouse states
  southWarehouse: WarehouseState;
  eastWarehouse: WarehouseState;
  
  // Current warehouse
  currentWarehouse: 'South' | 'East';
  
  // Actions
  setCurrentWarehouse: (warehouse: 'South' | 'East') => void;
  
  // Product management
  addProduct: (warehouse: 'South' | 'East', product: Omit<Product, 'id'>) => void;
  updateProduct: (warehouse: 'South' | 'East', id: string, updates: Partial<Product>) => void;
  deleteProduct: (warehouse: 'South' | 'East', id: string) => void;
  
  // Analytics & Insights regeneration
  regenerateInsights: (warehouse: 'South' | 'East') => void;
  regenerateAnalytics: (warehouse: 'South' | 'East') => void;
  
  // Task management
  addTask: (warehouse: 'South' | 'East', task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTaskStatus: (warehouse: 'South' | 'East', taskId: string, status: Task['status']) => void;
  deleteTask: (warehouse: 'South' | 'East', taskId: string) => void;
  
  // Notifications
  addNotification: (notification: Omit<SupplyChainStore['southWarehouse']['notifications'][0], 'id' | 'timestamp'>) => void;
  markNotificationRead: (warehouse: 'South' | 'East', notificationId: string) => void;
  
  // Utility functions
  getWarehouseData: (warehouse: 'South' | 'East') => WarehouseState;
  syncAllData: () => void;
}

// Generate mock analytics data based on inventory
const generateAnalytics = (products: Product[]): Analytics => {
  const categories = [...new Set(products.map(p => p.category))];
  
  return {
    inventoryTurnover: Array.from({ length: 30 }, (_, i) => 
      3.5 + Math.random() * 2 + Math.sin(i / 5) * 0.5
    ),
    categoryDistribution: categories.map(cat => ({
      name: cat,
      value: products.filter(p => p.category === cat).reduce((sum, p) => sum + p.stock, 0)
    })),
    orderVolumes: Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      orders: 80 + Math.floor(Math.random() * 60)
    })),
    stockoutTimeline: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      stockouts: Math.floor(Math.random() * 5),
      overstock: Math.floor(Math.random() * 3)
    })),
    forecastAccuracy: 85 + Math.random() * 10,
    lastUpdated: new Date().toISOString()
  };
};

// Generate insights based on current inventory
const generateInsights = (products: Product[], warehouse: string): Insight[] => {
  const insights: Insight[] = [];
  
  // Low stock insights
  const lowStockProducts = products.filter(p => p.stock <= p.reorder_point);
  lowStockProducts.forEach(product => {
    insights.push({
      id: `INSIGHT-${Date.now()}-${Math.random()}`,
      title: `Critical Stock Alert: ${product.name}`,
      type: 'understock',
      zone: product.zone,
      priority: 'high',
      cta: 'Restock Now',
      description: `Stock levels below safety threshold (${product.stock}/${product.reorder_point})`,
      impact: `Potential production delays in ${Math.ceil(product.stock / (product.forecast_demand / 7))} days`
    });
  });
  
  // High demand forecasts
  const highDemandProducts = products.filter(p => p.forecast_demand > p.stock * 1.5);
  highDemandProducts.slice(0, 2).forEach(product => {
    insights.push({
      id: `INSIGHT-${Date.now()}-${Math.random()}`,
      title: `Demand Spike Forecasted: ${product.name}`,
      type: 'forecast',
      zone: product.zone,
      priority: 'high',
      cta: 'Increase Orders',
      description: `${Math.round((product.forecast_demand / product.stock - 1) * 100)}% demand increase predicted`,
      impact: `Revenue opportunity: $${(product.forecast_demand * product.unit_cost * 0.3).toLocaleString()}`
    });
  });
  
  // Overstock detection
  const overstockProducts = products.filter(p => p.stock > p.reorder_point * 2);
  overstockProducts.slice(0, 1).forEach(product => {
    insights.push({
      id: `INSIGHT-${Date.now()}-${Math.random()}`,
      title: `Overstock Detected: ${product.name}`,
      type: 'overstock',
      zone: product.zone,
      priority: 'medium',
      cta: 'Reroute Stock',
      description: `${Math.round((product.stock / product.reorder_point - 1) * 100)}% above optimal levels`,
      impact: `Excess carrying costs: $${((product.stock - product.reorder_point) * product.unit_cost * 0.02).toLocaleString()}/month`
    });
  });
  
  // Optimization insights
  if (products.length > 5) {
    insights.push({
      id: `INSIGHT-${Date.now()}-${Math.random()}`,
      title: `${warehouse} Warehouse Optimization`,
      type: 'optimization',
      zone: 'All',
      priority: 'medium',
      cta: 'Review Layout',
      description: 'Potential efficiency improvements identified',
      impact: 'Up to 15% improvement in pick times'
    });
  }
  
  return insights;
};

// Generate tasks based on insights and inventory
const generateTasks = (products: Product[], insights: Insight[], warehouse: string): Task[] => {
  const tasks: Task[] = [];
  
  // Reorder tasks for low stock items
  const lowStockProducts = products.filter(p => p.stock <= p.reorder_point);
  lowStockProducts.forEach(product => {
    tasks.push({
      id: `TASK-${Date.now()}-${Math.random()}`,
      title: `Reorder ${product.name}`,
      description: `Stock level critical: ${product.stock} units remaining`,
      priority: 'high',
      status: 'pending',
      warehouse,
      type: 'reorder',
      relatedProductId: product.id,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });
  
  // Inspection tasks
  const oldInventory = products.filter(p => 
    new Date(p.last_replenished).getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000
  );
  if (oldInventory.length > 0) {
    tasks.push({
      id: `TASK-${Date.now()}-${Math.random()}`,
      title: 'Monthly Inventory Inspection',
      description: `Review ${oldInventory.length} items not replenished in 30+ days`,
      priority: 'medium',
      status: 'pending',
      warehouse,
      type: 'inspection',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  return tasks;
};

// Initial warehouse states
const createInitialWarehouseState = (warehouse: 'South' | 'East'): WarehouseState => {
  const warehouseProducts = initialProducts.filter(p => 
    warehouse === 'South' ? ['South', 'West'].includes(p.zone) : ['East', 'North'].includes(p.zone)
  );
  
  const insights = generateInsights(warehouseProducts, warehouse);
  const analytics = generateAnalytics(warehouseProducts);
  const tasks = generateTasks(warehouseProducts, insights, warehouse);
  
  return {
    products: warehouseProducts,
    insights,
    tasks,
    analytics,
    notifications: []
  };
};

export const useSupplyChainStore = create<SupplyChainStore>()(
  persist(
    (set, get) => ({
      // Initial states
      southWarehouse: createInitialWarehouseState('South'),
      eastWarehouse: createInitialWarehouseState('East'),
      currentWarehouse: 'South',
      
      // Actions
      setCurrentWarehouse: (warehouse) => {
        set({ currentWarehouse: warehouse });
      },
      
      addProduct: (warehouse, productData) => {
        const newProduct: Product = {
          ...productData,
          id: `SKU${Date.now()}${Math.floor(Math.random() * 1000)}`,
        };
        
        set((state) => {
          const warehouseKey = `${warehouse.toLowerCase()}Warehouse` as 'southWarehouse' | 'eastWarehouse';
          const updatedProducts = [...state[warehouseKey].products, newProduct];
          
          return {
            [warehouseKey]: {
              ...state[warehouseKey],
              products: updatedProducts,
              insights: generateInsights(updatedProducts, warehouse),
              analytics: generateAnalytics(updatedProducts),
              tasks: generateTasks(updatedProducts, generateInsights(updatedProducts, warehouse), warehouse)
            }
          };
        });
      },
      
      updateProduct: (warehouse, id, updates) => {
        set((state) => {
          const warehouseKey = `${warehouse.toLowerCase()}Warehouse` as 'southWarehouse' | 'eastWarehouse';
          const updatedProducts = state[warehouseKey].products.map(p =>
            p.id === id ? { ...p, ...updates } : p
          );
          
          return {
            [warehouseKey]: {
              ...state[warehouseKey],
              products: updatedProducts,
              insights: generateInsights(updatedProducts, warehouse),
              analytics: generateAnalytics(updatedProducts),
              tasks: generateTasks(updatedProducts, generateInsights(updatedProducts, warehouse), warehouse)
            }
          };
        });
      },
      
      deleteProduct: (warehouse, id) => {
        set((state) => {
          const warehouseKey = `${warehouse.toLowerCase()}Warehouse` as 'southWarehouse' | 'eastWarehouse';
          const updatedProducts = state[warehouseKey].products.filter(p => p.id !== id);
          
          return {
            [warehouseKey]: {
              ...state[warehouseKey],
              products: updatedProducts,
              insights: generateInsights(updatedProducts, warehouse),
              analytics: generateAnalytics(updatedProducts),
              tasks: generateTasks(updatedProducts, generateInsights(updatedProducts, warehouse), warehouse)
            }
          };
        });
      },
      
      regenerateInsights: (warehouse) => {
        set((state) => {
          const warehouseKey = `${warehouse.toLowerCase()}Warehouse` as 'southWarehouse' | 'eastWarehouse';
          const warehouseData = state[warehouseKey];
          
          return {
            [warehouseKey]: {
              ...warehouseData,
              insights: generateInsights(warehouseData.products, warehouse)
            }
          };
        });
      },
      
      regenerateAnalytics: (warehouse) => {
        set((state) => {
          const warehouseKey = `${warehouse.toLowerCase()}Warehouse` as 'southWarehouse' | 'eastWarehouse';
          const warehouseData = state[warehouseKey];
          
          return {
            [warehouseKey]: {
              ...warehouseData,
              analytics: generateAnalytics(warehouseData.products)
            }
          };
        });
      },
      
      addTask: (warehouse, taskData) => {
        const newTask: Task = {
          ...taskData,
          id: `TASK-${Date.now()}-${Math.random()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        set((state) => {
          const warehouseKey = `${warehouse.toLowerCase()}Warehouse` as 'southWarehouse' | 'eastWarehouse';
          
          return {
            [warehouseKey]: {
              ...state[warehouseKey],
              tasks: [...state[warehouseKey].tasks, newTask]
            }
          };
        });
      },
      
      updateTaskStatus: (warehouse, taskId, status) => {
        set((state) => {
          const warehouseKey = `${warehouse.toLowerCase()}Warehouse` as 'southWarehouse' | 'eastWarehouse';
          const updatedTasks = state[warehouseKey].tasks.map(task =>
            task.id === taskId 
              ? { ...task, status, updatedAt: new Date().toISOString() }
              : task
          );
          
          return {
            [warehouseKey]: {
              ...state[warehouseKey],
              tasks: updatedTasks
            }
          };
        });
      },
      
      deleteTask: (warehouse, taskId) => {
        set((state) => {
          const warehouseKey = `${warehouse.toLowerCase()}Warehouse` as 'southWarehouse' | 'eastWarehouse';
          const updatedTasks = state[warehouseKey].tasks.filter(task => task.id !== taskId);
          
          return {
            [warehouseKey]: {
              ...state[warehouseKey],
              tasks: updatedTasks
            }
          };
        });
      },
      
      addNotification: (notificationData) => {
        const newNotification = {
          ...notificationData,
          id: `NOTIF-${Date.now()}-${Math.random()}`,
          timestamp: new Date().toISOString()
        };
        
        set((state) => {
          const targetWarehouse = notificationData.targetWarehouse as 'South' | 'East';
          const warehouseKey = `${targetWarehouse.toLowerCase()}Warehouse` as 'southWarehouse' | 'eastWarehouse';
          
          return {
            [warehouseKey]: {
              ...state[warehouseKey],
              notifications: [...state[warehouseKey].notifications, newNotification]
            }
          };
        });
      },
      
      markNotificationRead: (warehouse, notificationId) => {
        set((state) => {
          const warehouseKey = `${warehouse.toLowerCase()}Warehouse` as 'southWarehouse' | 'eastWarehouse';
          const updatedNotifications = state[warehouseKey].notifications.map(notif =>
            notif.id === notificationId ? { ...notif, read: true } : notif
          );
          
          return {
            [warehouseKey]: {
              ...state[warehouseKey],
              notifications: updatedNotifications
            }
          };
        });
      },
      
      getWarehouseData: (warehouse) => {
        const state = get();
        const warehouseKey = `${warehouse.toLowerCase()}Warehouse` as 'southWarehouse' | 'eastWarehouse';
        return state[warehouseKey];
      },
      
      syncAllData: () => {
        set((state) => {
          // Regenerate all computed data for both warehouses
          const southInsights = generateInsights(state.southWarehouse.products, 'South');
          const southAnalytics = generateAnalytics(state.southWarehouse.products);
          const southTasks = generateTasks(state.southWarehouse.products, southInsights, 'South');
          
          const eastInsights = generateInsights(state.eastWarehouse.products, 'East');
          const eastAnalytics = generateAnalytics(state.eastWarehouse.products);
          const eastTasks = generateTasks(state.eastWarehouse.products, eastInsights, 'East');
          
          return {
            southWarehouse: {
              ...state.southWarehouse,
              insights: southInsights,
              analytics: southAnalytics,
              tasks: southTasks
            },
            eastWarehouse: {
              ...state.eastWarehouse,
              insights: eastInsights,
              analytics: eastAnalytics,
              tasks: eastTasks
            }
          };
        });
      }
    }),
    {
      name: 'supply-chain-store',
      version: 1
    }
  )
);