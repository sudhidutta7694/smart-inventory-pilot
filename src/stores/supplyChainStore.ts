import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { faker } from '@faker-js/faker';
import { products as initialProducts, insights as initialInsights, metricsData as initialMetrics, type Product, type Insight, type MetricData } from '@/data/mockData';

// Enhanced interfaces for the store
export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'restock' | 'reroute' | 'maintenance' | 'quality' | 'audit';
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  warehouse: 'South' | 'East';
  createdAt: string;
  dueDate?: string;
  productId?: string;
  assignedTo?: string;
}

export interface Reroute {
  id: string;
  productId: string;
  productName: string;
  fromWarehouse: 'South' | 'East';
  toWarehouse: 'South' | 'East';
  quantity: number;
  status: 'pending' | 'approved' | 'transit_prep' | 'in_transit' | 'delivered' | 'completed' | 'rejected';
  requestedAt: string;
  approvedAt?: string;
  transitStartedAt?: string;
  deliveredAt?: string;
  completedAt?: string;
  estimatedDelivery?: string;
  reason: string;
  transitProgress: number;
}

export interface Notification {
  id: string;
  type: 'reroute_request' | 'reroute_approved' | 'reroute_transit_ready' | 'reroute_in_transit' | 'reroute_delivered' | 'reroute_completed' | 'stock_alert' | 'task_assigned' | 'insight_generated';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  rerouteId?: string;
  taskId?: string;
  productId?: string;
  targetWarehouse: 'South' | 'East';
  priority: 'high' | 'medium' | 'low';
}

export interface AnalyticsData {
  date: string;
  inventoryTurnover: number;
  avgDailyOrders: number;
  shipmentDelay: number;
  stockoutEvents: number;
  overstockEvents: number;
  forecastAccuracy: number;
  totalRevenue: number;
  costSavings: number;
  warehouseUtilization: number;
}

interface SupplyChainState {
  // Core Data
  products: Product[];
  insights: Insight[];
  tasks: Task[];
  reroutes: Reroute[];
  notifications: Notification[];
  analytics: AnalyticsData[];
  
  // UI State
  isLoading: boolean;
  lastUpdated: string;
  activeWarehouse: 'South' | 'East';
  
  // Actions
  setActiveWarehouse: (warehouse: 'South' | 'East') => void;
  
  // Product actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Insight actions
  regenerateInsights: (warehouse?: 'South' | 'East') => void;
  markInsightActioned: (id: string) => void;
  
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  
  // Reroute actions
  createRerouteRequest: (reroute: Omit<Reroute, 'id' | 'requestedAt' | 'transitProgress'>) => void;
  approveReroute: (id: string) => void;
  rejectReroute: (id: string) => void;
  startTransit: (id: string) => void;
  confirmDelivery: (id: string) => void;
  
  // Notification actions
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (warehouse: 'South' | 'East') => void;
  
  // Analytics actions
  refreshAnalytics: () => void;
  
  // Utility actions
  initializeData: () => void;
  resetStore: () => void;
}

// Utility functions for generating insights and analytics
const generateInsightsFromProducts = (products: Product[], warehouse?: 'South' | 'East'): Insight[] => {
  const insights: Insight[] = [];
  const relevantProducts = warehouse 
    ? products.filter(p => p.zone === warehouse) 
    : products;

  relevantProducts.forEach(product => {
    // Stock alerts
    if (product.stock <= product.reorder_point) {
      insights.push({
        id: `INSIGHT-${Date.now()}-${product.id}`,
        title: `Critical Stock Alert: ${product.name}`,
        type: 'understock',
        zone: product.zone,
        priority: product.stock < product.reorder_point * 0.5 ? 'high' : 'medium',
        cta: 'Restock Now',
        description: `Stock levels below safety threshold (${product.stock}/${product.reorder_point})`,
        impact: `Potential stockout in ${Math.ceil((product.stock / product.forecast_demand) * 7)} days`
      });
    }

    // Overstock detection
    if (product.stock > product.forecast_demand * 2) {
      insights.push({
        id: `INSIGHT-${Date.now()}-${product.id}-overstock`,
        title: `Overstock Detected: ${product.name}`,
        type: 'overstock',
        zone: product.zone,
        priority: 'medium',
        cta: 'Reroute Stock',
        description: `${Math.round((product.stock / product.forecast_demand) * 100)}% above optimal levels`,
        impact: `Excess carrying costs: $${(product.stock * product.unit_cost * 0.02).toFixed(0)}/month`
      });
    }

    // Demand forecast alerts
    if (product.forecast_demand > product.stock * 1.5) {
      insights.push({
        id: `INSIGHT-${Date.now()}-${product.id}-demand`,
        title: `Demand Spike Forecasted: ${product.name}`,
        type: 'forecast',
        zone: product.zone,
        priority: 'high',
        cta: 'Increase Orders',
        description: `${Math.round((product.forecast_demand / product.stock) * 100)}% demand increase predicted`,
        impact: `Revenue opportunity: $${(product.forecast_demand * product.unit_cost * 0.3).toFixed(0)}`
      });
    }
  });

  return insights.slice(0, 6); // Limit to top 6 insights
};

const generateAnalyticsFromProducts = (products: Product[]): AnalyticsData[] => {
  const data: AnalyticsData[] = [];
  const currentDate = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - i);
    
    // Calculate realistic metrics based on products
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const totalValue = products.reduce((sum, p) => sum + (p.stock * p.unit_cost), 0);
    const avgDemand = products.reduce((sum, p) => sum + p.forecast_demand, 0) / products.length;
    
    data.push({
      date: date.toISOString().split('T')[0],
      inventoryTurnover: Number((avgDemand / totalStock * 30).toFixed(1)),
      avgDailyOrders: Math.round(avgDemand * (0.8 + Math.random() * 0.4)),
      shipmentDelay: Math.round(Math.random() * 15),
      stockoutEvents: Math.round(Math.random() * 3),
      overstockEvents: Math.round(Math.random() * 5),
      forecastAccuracy: Math.round(85 + Math.random() * 10),
      totalRevenue: Math.round(totalValue * (0.1 + Math.random() * 0.05)),
      costSavings: Math.round(totalValue * (0.02 + Math.random() * 0.03)),
      warehouseUtilization: Math.round(75 + Math.random() * 20)
    });
  }
  
  return data;
};

const generateTasksFromInsights = (insights: Insight[], warehouse: 'South' | 'East'): Task[] => {
  return insights
    .filter(insight => insight.zone === warehouse)
    .slice(0, 3)
    .map(insight => ({
      id: `TASK-${Date.now()}-${insight.id}`,
      title: insight.cta,
      description: insight.description,
      type: insight.type === 'understock' ? 'restock' as const : 
            insight.type === 'overstock' ? 'reroute' as const : 
            'audit' as const,
      priority: insight.priority,
      status: 'pending' as const,
      warehouse,
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }));
};

// Create the store
export const useSupplyChainStore = create<SupplyChainState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    products: [],
    insights: [],
    tasks: [],
    reroutes: [],
    notifications: [],
    analytics: [],
    isLoading: false,
    lastUpdated: new Date().toISOString(),
    activeWarehouse: 'South',

    // Set active warehouse
    setActiveWarehouse: (warehouse) => set({ activeWarehouse: warehouse }),

    // Product actions
    addProduct: (productData) => {
      const newProduct: Product = {
        ...productData,
        id: `SKU${Date.now()}`,
      };
      
      set(state => {
        const updatedProducts = [...state.products, newProduct];
        const newInsights = generateInsightsFromProducts(updatedProducts);
        const newAnalytics = generateAnalyticsFromProducts(updatedProducts);
        
        return {
          products: updatedProducts,
          insights: newInsights,
          analytics: newAnalytics,
          lastUpdated: new Date().toISOString()
        };
      });
    },

    updateProduct: (id, updates) => {
      set(state => {
        const updatedProducts = state.products.map(product =>
          product.id === id ? { ...product, ...updates } : product
        );
        const newInsights = generateInsightsFromProducts(updatedProducts);
        const newAnalytics = generateAnalyticsFromProducts(updatedProducts);
        
        return {
          products: updatedProducts,
          insights: newInsights,
          analytics: newAnalytics,
          lastUpdated: new Date().toISOString()
        };
      });
    },

    deleteProduct: (id) => {
      set(state => {
        const updatedProducts = state.products.filter(product => product.id !== id);
        const newInsights = generateInsightsFromProducts(updatedProducts);
        const newAnalytics = generateAnalyticsFromProducts(updatedProducts);
        
        return {
          products: updatedProducts,
          insights: newInsights,
          analytics: newAnalytics,
          lastUpdated: new Date().toISOString()
        };
      });
    },

    // Insight actions
    regenerateInsights: (warehouse) => {
      set(state => {
        const newInsights = generateInsightsFromProducts(state.products, warehouse);
        return {
          insights: newInsights,
          lastUpdated: new Date().toISOString()
        };
      });
    },

    markInsightActioned: (id) => {
      set(state => ({
        insights: state.insights.filter(insight => insight.id !== id),
        lastUpdated: new Date().toISOString()
      }));
    },

    // Task actions
    addTask: (taskData) => {
      const newTask: Task = {
        ...taskData,
        id: `TASK-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      
      set(state => ({
        tasks: [...state.tasks, newTask],
        lastUpdated: new Date().toISOString()
      }));
    },

    updateTask: (id, updates) => {
      set(state => ({
        tasks: state.tasks.map(task =>
          task.id === id ? { ...task, ...updates } : task
        ),
        lastUpdated: new Date().toISOString()
      }));
    },

    deleteTask: (id) => {
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== id),
        lastUpdated: new Date().toISOString()
      }));
    },

    completeTask: (id) => {
      set(state => ({
        tasks: state.tasks.map(task =>
          task.id === id ? { ...task, status: 'completed' as const } : task
        ),
        lastUpdated: new Date().toISOString()
      }));
    },

    // Reroute actions
    createRerouteRequest: (rerouteData) => {
      const newReroute: Reroute = {
        ...rerouteData,
        id: `REROUTE-${Date.now()}`,
        requestedAt: new Date().toISOString(),
        transitProgress: 0,
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
      };

      const notification: Notification = {
        id: `NOTIF-${Date.now()}`,
        type: 'reroute_request',
        title: 'New Reroute Request',
        message: `${rerouteData.quantity} units of ${rerouteData.productName} requested from ${rerouteData.fromWarehouse}`,
        timestamp: new Date().toISOString(),
        read: false,
        rerouteId: newReroute.id,
        targetWarehouse: rerouteData.toWarehouse,
        priority: 'medium'
      };

      set(state => ({
        reroutes: [...state.reroutes, newReroute],
        notifications: [...state.notifications, notification],
        lastUpdated: new Date().toISOString()
      }));
    },

    approveReroute: (id) => {
      set(state => {
        const reroute = state.reroutes.find(r => r.id === id);
        if (!reroute) return state;

        const updatedReroutes = state.reroutes.map(r =>
          r.id === id ? { ...r, status: 'transit_prep' as const, approvedAt: new Date().toISOString() } : r
        );

        const notification: Notification = {
          id: `NOTIF-${Date.now()}`,
          type: 'reroute_approved',
          title: 'Reroute Approved',
          message: `Your reroute request for ${reroute.productName} has been approved`,
          timestamp: new Date().toISOString(),
          read: false,
          rerouteId: id,
          targetWarehouse: reroute.fromWarehouse,
          priority: 'medium'
        };

        return {
          reroutes: updatedReroutes,
          notifications: [...state.notifications, notification],
          lastUpdated: new Date().toISOString()
        };
      });
    },

    rejectReroute: (id) => {
      set(state => ({
        reroutes: state.reroutes.map(r =>
          r.id === id ? { ...r, status: 'rejected' as const } : r
        ),
        lastUpdated: new Date().toISOString()
      }));
    },

    startTransit: (id) => {
      set(state => {
        const reroute = state.reroutes.find(r => r.id === id);
        if (!reroute) return state;

        const updatedReroutes = state.reroutes.map(r =>
          r.id === id ? { 
            ...r, 
            status: 'in_transit' as const, 
            transitStartedAt: new Date().toISOString(),
            transitProgress: 0
          } : r
        );

        const notification: Notification = {
          id: `NOTIF-${Date.now()}`,
          type: 'reroute_in_transit',
          title: 'Reroute In Transit',
          message: `${reroute.productName} is now in transit to your warehouse`,
          timestamp: new Date().toISOString(),
          read: false,
          rerouteId: id,
          targetWarehouse: reroute.toWarehouse,
          priority: 'medium'
        };

        return {
          reroutes: updatedReroutes,
          notifications: [...state.notifications, notification],
          lastUpdated: new Date().toISOString()
        };
      });
    },

    confirmDelivery: (id) => {
      set(state => {
        const reroute = state.reroutes.find(r => r.id === id);
        if (!reroute) return state;

        const updatedReroutes = state.reroutes.map(r =>
          r.id === id ? { 
            ...r, 
            status: 'completed' as const,
            completedAt: new Date().toISOString(),
            transitProgress: 100
          } : r
        );

        const notification: Notification = {
          id: `NOTIF-${Date.now()}`,
          type: 'reroute_completed',
          title: 'Reroute Completed',
          message: `${reroute.productName} has been successfully delivered`,
          timestamp: new Date().toISOString(),
          read: false,
          rerouteId: id,
          targetWarehouse: reroute.fromWarehouse,
          priority: 'low'
        };

        return {
          reroutes: updatedReroutes,
          notifications: [...state.notifications, notification],
          lastUpdated: new Date().toISOString()
        };
      });
    },

    // Notification actions
    markNotificationRead: (id) => {
      set(state => ({
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        ),
        lastUpdated: new Date().toISOString()
      }));
    },

    markAllNotificationsRead: (warehouse) => {
      set(state => ({
        notifications: state.notifications.map(n =>
          n.targetWarehouse === warehouse ? { ...n, read: true } : n
        ),
        lastUpdated: new Date().toISOString()
      }));
    },

    // Analytics actions
    refreshAnalytics: () => {
      set(state => {
        const newAnalytics = generateAnalyticsFromProducts(state.products);
        return {
          analytics: newAnalytics,
          lastUpdated: new Date().toISOString()
        };
      });
    },

    // Utility actions
    initializeData: () => {
      const products = [...initialProducts];
      const insights = generateInsightsFromProducts(products);
      const analytics = generateAnalyticsFromProducts(products);
      const southTasks = generateTasksFromInsights(insights, 'South');
      const eastTasks = generateTasksFromInsights(insights, 'East');

      set({
        products,
        insights,
        analytics,
        tasks: [...southTasks, ...eastTasks],
        reroutes: [],
        notifications: [],
        isLoading: false,
        lastUpdated: new Date().toISOString()
      });
    },

    resetStore: () => {
      get().initializeData();
    }
  }))
);

// Initialize the store when it's first created
useSupplyChainStore.getState().initializeData();

// Set up real-time transit progress updates
setInterval(() => {
  const state = useSupplyChainStore.getState();
  const inTransitReroutes = state.reroutes.filter(r => r.status === 'in_transit');
  
  if (inTransitReroutes.length > 0) {
    const updatedReroutes = state.reroutes.map(reroute => {
      if (reroute.status === 'in_transit' && reroute.transitStartedAt) {
        const startTime = new Date(reroute.transitStartedAt).getTime();
        const now = Date.now();
        const elapsed = now - startTime;
        const totalTransitTime = 2 * 60 * 1000; // 2 minutes for demo
        const progress = Math.min((elapsed / totalTransitTime) * 100, 100);
        
        if (progress >= 100) {
          // Auto-transition to delivered
          useSupplyChainStore.setState(state => {
            const notification: Notification = {
              id: `NOTIF-${Date.now()}`,
              type: 'reroute_delivered',
              title: 'Reroute Delivered',
              message: `${reroute.productName} has arrived at ${reroute.toWarehouse} warehouse`,
              timestamp: new Date().toISOString(),
              read: false,
              rerouteId: reroute.id,
              targetWarehouse: reroute.toWarehouse,
              priority: 'medium'
            };

            return {
              notifications: [...state.notifications, notification]
            };
          });

          return {
            ...reroute,
            status: 'delivered' as const,
            deliveredAt: new Date().toISOString(),
            transitProgress: 100
          };
        }
        
        return { ...reroute, transitProgress: progress };
      }
      return reroute;
    });
    
    useSupplyChainStore.setState({ reroutes: updatedReroutes });
  }
}, 1000);