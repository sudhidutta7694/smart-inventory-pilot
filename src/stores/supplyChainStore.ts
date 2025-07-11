
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { products, insights, metricsData, type Product, type Insight, type MetricData } from '@/data/mockData';

interface RerouteRequest {
  id: string;
  productId: string;
  productName: string;
  fromWarehouse: string;
  toWarehouse: string;
  quantity: number;
  reason: string;
  status: 'pending' | 'approved' | 'in_transit' | 'delivered' | 'completed';
  requestedAt: string;
  approvedAt?: string;
  transitStartedAt?: string;
  deliveredAt?: string;
  completedAt?: string;
  estimatedDelivery?: string;
  transitProgress?: number;
}

interface AdminTask {
  id: string;
  title: string;
  type: 'reorder' | 'reroute' | 'flag' | 'report';
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  description?: string;
  assignee?: string;
  warehouse?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  warehouse: string;
  read: boolean;
  createdAt: string;
}

interface SupplyChainState {
  // Core Data
  products: Product[];
  insights: Insight[];
  metricsData: MetricData[];
  rerouteRequests: RerouteRequest[];
  adminTasks: AdminTask[];
  notifications: Notification[];
  
  // UI State
  regeneratingInsights: boolean;
  lastUpdated: string;
  
  // Actions
  updateProduct: (product: Product) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  deleteProduct: (productId: string) => void;
  regenerateInsights: () => void;
  createRerouteRequest: (request: Omit<RerouteRequest, 'id' | 'requestedAt' | 'status'>) => void;
  updateRerouteStatus: (id: string, status: RerouteRequest['status'], progress?: number) => void;
  addAdminTask: (task: Omit<AdminTask, 'id'>) => void;
  updateTaskStatus: (id: string, status: AdminTask['status']) => void;
  deleteTask: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: (warehouse: string) => void;
}

// Helper function to generate insights based on current data
const generateInsightsFromData = (products: Product[]): Insight[] => {
  const newInsights: Insight[] = [];
  
  products.forEach(product => {
    // Check for understock
    if (product.stock <= product.reorder_point) {
      newInsights.push({
        id: `understock-${product.id}`,
        title: `Critical Stock Alert: ${product.name}`,
        type: 'understock',
        zone: product.zone,
        priority: product.stock === 0 ? 'high' : 'medium',
        cta: 'Reorder Now',
        description: `Stock level: ${product.stock} units (Below reorder point: ${product.reorder_point})`,
        impact: product.stock === 0 ? 'Production halt risk' : `Stockout risk in ${Math.ceil(product.stock / (product.forecast_demand / 7))} days`
      });
    }
    
    // Check for overstock (more than 3x forecast demand)
    if (product.stock > product.forecast_demand * 3) {
      newInsights.push({
        id: `overstock-${product.id}`,
        title: `Overstock Alert: ${product.name}`,
        type: 'overstock',
        zone: product.zone,
        priority: 'medium',
        cta: 'Reroute Stock',
        description: `Stock level: ${product.stock} units (${Math.round((product.stock / product.forecast_demand) * 100)}% above forecast)`,
        impact: `Excess carrying costs: $${Math.round(product.stock * product.unit_cost * 0.02)}/month`
      });
    }
    
    // Check for high demand forecast
    if (product.forecast_demand > product.stock * 2) {
      newInsights.push({
        id: `forecast-${product.id}`,
        title: `Demand Spike Predicted: ${product.name}`,
        type: 'forecast',
        zone: product.zone,
        priority: 'high',
        cta: 'Increase Orders',
        description: `7-day forecast: ${product.forecast_demand} units (Current stock: ${product.stock})`,
        impact: `Revenue opportunity: $${Math.round(product.forecast_demand * product.unit_cost * 1.3)}`
      });
    }
  });
  
  // Add some zone-based insights
  const zoneStats = products.reduce((acc, product) => {
    if (!acc[product.zone]) {
      acc[product.zone] = { totalStock: 0, totalForecast: 0, products: 0 };
    }
    acc[product.zone].totalStock += product.stock;
    acc[product.zone].totalForecast += product.forecast_demand;
    acc[product.zone].products += 1;
    return acc;
  }, {} as Record<string, { totalStock: number; totalForecast: number; products: number }>);
  
  Object.entries(zoneStats).forEach(([zone, stats]) => {
    if (stats.totalStock < stats.totalForecast * 0.5) {
      newInsights.push({
        id: `zone-shortage-${zone}`,
        title: `Zone Shortage Alert: ${zone}`,
        type: 'understock',
        zone,
        priority: 'high',
        cta: 'Review Zone',
        description: `Zone running low on multiple products`,
        impact: `${stats.products} products affected`
      });
    }
  });
  
  return newInsights.slice(0, 6); // Limit to 6 insights
};

export const useSupplyChainStore = create<SupplyChainState>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
    products: [...products],
    insights: [...insights],
    metricsData: [...metricsData],
    rerouteRequests: [],
    adminTasks: [
      {
        id: "TASK001",
        title: "Review Safety Equipment Inventory",
        type: "flag",
        priority: "high",
        status: "pending",
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: "Safety harness showing critical stock levels",
        warehouse: "East"
      },
      {
        id: "TASK002",
        title: "Generate Weekly Report",
        type: "report",
        priority: "medium",
        status: "pending",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: "Weekly performance and inventory report",
        warehouse: "South"
      }
    ],
    notifications: [],
    regeneratingInsights: false,
    lastUpdated: new Date().toISOString(),
    
    // Actions
    updateProduct: (updatedProduct) => {
      set((state) => {
        const products = state.products.map(p => 
          p.id === updatedProduct.id ? updatedProduct : p
        );
        const insights = generateInsightsFromData(products);
        
        // Add notification for significant changes
        const originalProduct = state.products.find(p => p.id === updatedProduct.id);
        if (originalProduct && originalProduct.stock !== updatedProduct.stock) {
          const notification: Omit<Notification, 'id' | 'createdAt'> = {
            title: 'Inventory Updated',
            message: `${updatedProduct.name} stock updated from ${originalProduct.stock} to ${updatedProduct.stock}`,
            type: 'info',
            warehouse: updatedProduct.zone === 'North' || updatedProduct.zone === 'South' ? 'South' : 'East',
            read: false
          };
          
          state.addNotification(notification);
        }
        
        return {
          products,
          insights,
          lastUpdated: new Date().toISOString()
        };
      });
    },
    
    addProduct: (newProduct) => {
      set((state) => {
        const product: Product = {
          ...newProduct,
          id: `SKU${String(Date.now()).slice(-6)}`
        };
        const products = [...state.products, product];
        const insights = generateInsightsFromData(products);
        
        return {
          products,
          insights,
          lastUpdated: new Date().toISOString()
        };
      });
    },
    
    deleteProduct: (productId) => {
      set((state) => {
        const products = state.products.filter(p => p.id !== productId);
        const insights = generateInsightsFromData(products);
        
        return {
          products,
          insights,
          lastUpdated: new Date().toISOString()
        };
      });
    },
    
    regenerateInsights: () => {
      set({ regeneratingInsights: true });
      
      // Simulate AI processing
      setTimeout(() => {
        set((state) => ({
          insights: generateInsightsFromData(state.products),
          regeneratingInsights: false,
          lastUpdated: new Date().toISOString()
        }));
      }, 2000);
    },
    
    createRerouteRequest: (requestData) => {
      set((state) => {
        const request: RerouteRequest = {
          ...requestData,
          id: `REROUTE-${Date.now()}`,
          requestedAt: new Date().toISOString(),
          status: 'pending'
        };
        
        // Add notification to destination warehouse
        const notification: Omit<Notification, 'id' | 'createdAt'> = {
          title: 'New Reroute Request',
          message: `Incoming request for ${request.quantity} units of ${request.productName}`,
          type: 'info',
          warehouse: request.toWarehouse,
          read: false
        };
        
        state.addNotification(notification);
        
        return {
          rerouteRequests: [...state.rerouteRequests, request]
        };
      });
    },
    
    updateRerouteStatus: (id, status, progress) => {
      set((state) => ({
        rerouteRequests: state.rerouteRequests.map(request => {
          if (request.id === id) {
            const updates: Partial<RerouteRequest> = { status };
            
            if (status === 'approved') {
              updates.approvedAt = new Date().toISOString();
            } else if (status === 'in_transit') {
              updates.transitStartedAt = new Date().toISOString();
              updates.transitProgress = progress || 0;
            } else if (status === 'delivered') {
              updates.deliveredAt = new Date().toISOString();
              updates.transitProgress = 100;
            } else if (status === 'completed') {
              updates.completedAt = new Date().toISOString();
            }
            
            return { ...request, ...updates };
          }
          return request;
        })
      }));
    },
    
    addAdminTask: (taskData) => {
      set((state) => ({
        adminTasks: [...state.adminTasks, {
          ...taskData,
          id: `TASK-${Date.now()}`
        }]
      }));
    },
    
    updateTaskStatus: (id, status) => {
      set((state) => ({
        adminTasks: state.adminTasks.map(task => 
          task.id === id ? { ...task, status } : task
        )
      }));
    },
    
    deleteTask: (id) => {
      set((state) => ({
        adminTasks: state.adminTasks.filter(task => task.id !== id)
      }));
    },
    
    addNotification: (notificationData) => {
      set((state) => ({
        notifications: [...state.notifications, {
          ...notificationData,
          id: `NOTIF-${Date.now()}`,
          createdAt: new Date().toISOString()
        }]
      }));
    },
    
    markNotificationRead: (id) => {
      set((state) => ({
        notifications: state.notifications.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      }));
    },
    
    clearNotifications: (warehouse) => {
      set((state) => ({
        notifications: state.notifications.filter(notif => notif.warehouse !== warehouse)
      }));
    }
  }))
);

// Auto-generate insights when products change
useSupplyChainStore.subscribe(
  (state) => state.products,
  (products) => {
    const { regeneratingInsights } = useSupplyChainStore.getState();
    if (!regeneratingInsights) {
      useSupplyChainStore.setState({
        insights: generateInsightsFromData(products),
        lastUpdated: new Date().toISOString()
      });
    }
  }
);
